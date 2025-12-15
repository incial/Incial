package com.incial.crm.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.incial.crm.dto.GoogleLoginRequest;
import com.incial.crm.dto.LoginRequest;
import com.incial.crm.dto.LoginResponse;
import com.incial.crm.dto.RegisterRequest;
import com.incial.crm.dto.RegisterResponse;
import com.incial.crm.dto.UserDto;
import com.incial.crm.entity.User;
import com.incial.crm.repository.UserRepository;
import com.incial.crm.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import com.incial.crm.dto.ForgotPasswordRequest;
import com.incial.crm.dto.VerifyOtpRequest;
import com.incial.crm.dto.ChangePasswordRequest;
import com.incial.crm.dto.ApiResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;

    @Value("${google.client.id:}")
    private String googleClientId;

    public RegisterResponse register(RegisterRequest request) {
        // Check if user already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("User with email " + request.getEmail() + " already exists");
        }

        // Set default role if not provided
        String role = request.getRole();
        if (role == null || role.isEmpty()) {
            role = "ROLE_EMPLOYEE";
        } else if (!role.startsWith("ROLE_")) {
            role = "ROLE_" + role.toUpperCase();
        }

        // Validate role
        if (!role.equals("ROLE_ADMIN") && !role.equals("ROLE_EMPLOYEE") && !role.equals("ROLE_SUPER_ADMIN")) {
            throw new RuntimeException("Invalid role. Must be ADMIN, EMPLOYEE, or SUPER_ADMIN");
        }

        // Create new user (createdAt is set automatically by @PrePersist)
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .build();

        User savedUser = userRepository.save(user);

        UserDto userDto = UserDto.builder()
                .id(savedUser.getId())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
                .build();

        return RegisterResponse.builder()
                .statusCode(201)
                .message("User registered successfully")
                .user(userDto)
                .build();
    }

    public LoginResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );

            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));

            String token = jwtUtil.generateToken(user.getEmail());

            UserDto userDto = UserDto.builder()
                    .id(user.getId())
                    .name(user.getName())
                    .email(user.getEmail())
                    .role(user.getRole())
                    .googleId(user.getGoogleId())
                    .avatarUrl(user.getAvatarUrl())
                    .build();

            return LoginResponse.builder()
                    .statusCode(200)
                    .token(token)
                    .role(user.getRole())
                    .message("Login successful")
                    .user(userDto)
                    .build();

        } catch (BadCredentialsException e) {
            throw new BadCredentialsException("Invalid email or password");
        }
    }

    public LoginResponse loginWithGoogle(GoogleLoginRequest request) {
        try {
            // Verify Google ID token
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(request.getIdToken());
            if (idToken == null) {
                throw new RuntimeException("Invalid Google ID token");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String googleId = payload.getSubject();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String pictureUrl = (String) payload.get("picture");

            // Find user by Google ID or email
            User user = userRepository.findByEmail(email).orElse(null);

            if (user == null) {
                // Create new user with Google OAuth
                // Generate a secure random password that cannot be guessed
                String randomPassword = java.util.UUID.randomUUID().toString() + "-" + System.currentTimeMillis();
                user = User.builder()
                        .name(name)
                        .email(email)
                        .passwordHash(passwordEncoder.encode(randomPassword))
                        .role("ROLE_EMPLOYEE") // Default role for OAuth users
                        .googleId(googleId)
                        .avatarUrl(pictureUrl)
                        .build();
                user = userRepository.save(user);
            } else {
                // Update existing user with Google info only if values changed
                boolean needsUpdate = false;
                if (user.getGoogleId() == null || !user.getGoogleId().equals(googleId)) {
                    user.setGoogleId(googleId);
                    needsUpdate = true;
                }
                if (pictureUrl != null && (user.getAvatarUrl() == null || !user.getAvatarUrl().equals(pictureUrl))) {
                    user.setAvatarUrl(pictureUrl);
                    needsUpdate = true;
                }
                if (needsUpdate) {
                    userRepository.save(user);
                }
            }

            String token = jwtUtil.generateToken(user.getEmail());

            UserDto userDto = UserDto.builder()
                    .id(user.getId())
                    .name(user.getName())
                    .email(user.getEmail())
                    .role(user.getRole())
                    .googleId(user.getGoogleId())
                    .avatarUrl(user.getAvatarUrl())
                    .build();

            return LoginResponse.builder()
                    .statusCode(200)
                    .token(token)
                    .role(user.getRole())
                    .message("Google login successful")
                    .user(userDto)
                    .build();

        } catch (GeneralSecurityException | IOException e) {
            // Log the actual error for debugging but don't expose details to client
            System.err.println("Google authentication error: " + e.getMessage());
            throw new RuntimeException("Google authentication failed. Please try again.");
        }
    }

    public ApiResponse forgotPassword(ForgotPasswordRequest request) {
        // Check if user exists
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User with email " + request.getEmail() + " not found"));

        // Generate and send OTP
        otpService.generateAndSendOtp(request.getEmail());

        return ApiResponse.builder()
                .statusCode(200)
                .message("OTP sent to your email. Please check your inbox.")
                .build();
    }

    public ApiResponse verifyOtp(VerifyOtpRequest request) {
        // Verify OTP
        boolean isValid = otpService.verifyOtp(request.getEmail(), request.getOtp());

        if (!isValid) {
            throw new RuntimeException("Invalid or expired OTP");
        }

        return ApiResponse.builder()
                .statusCode(200)
                .message("OTP verified successfully")
                .build();
    }

    @Transactional
    public ApiResponse changePassword(ChangePasswordRequest request) {

        // 1. Verify OTP (must be transactional)
        boolean isValid = otpService.verifyOtp(
                request.getEmail(),
                request.getOtp()
        );

        if (!isValid) {
            throw new RuntimeException("Invalid or expired OTP");
        }

        // 2. Fetch user
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // 3. Update password
        user.setPasswordHash(
                passwordEncoder.encode(request.getNewPassword())
        );
        // no save needed if User is managed, but save is fine
        userRepository.save(user);



        return ApiResponse.builder()
                .statusCode(200)
                .message("Password changed successfully")
                .build();
    }


}