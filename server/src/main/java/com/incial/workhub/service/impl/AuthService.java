package com.incial.workhub.service.impl;

import com.incial.workhub.dto.LoginRequest;
import com.incial.workhub.dto.RegisterRequest;
import com.incial.workhub.dto.Response;
import com.incial.workhub.dto.UserDTO;
import com.incial.workhub.enums.USER_ROLE;
import com.incial.workhub.exception.OurException;
import com.incial.workhub.model.User;
import com.incial.workhub.repository.UserRepository;
import com.incial.workhub.security.JwtTokenProvider;
import com.incial.workhub.service.repo.IAuthService;
import com.incial.workhub.utils.Utils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService implements IAuthService {

    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;

    // ----------------------------------------------------
    // REGISTER
    // ----------------------------------------------------
    @Transactional
    @Override
    public Response register(RegisterRequest request) {
        Response response = new Response();

        try {
            // Validate name
            if (request.getName() == null || request.getName().isBlank()) {
                throw new OurException("Name cannot be empty");
            }

            // Validate password
            if (request.getPassword() == null || request.getPassword().isBlank()) {
                throw new OurException("Password cannot be empty");
            }

            // Validate email
            String email = request.getEmail() == null ? null : request.getEmail().trim();
            if (email == null || email.isBlank()) {
                throw new OurException("Email cannot be empty");
            }

            if (userRepository.existsByEmail(email)) {
                throw new OurException("Email already exists: " + email);
            }

            // Create User
            User user = new User();
            user.setName(request.getName().trim());
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setRole(request.getRole() != null ? request.getRole() : USER_ROLE.ROLE_EMPLOYEE);

            User saved = userRepository.save(user);

            // Auto-login token
            String token = jwtTokenProvider.generateToken(saved);

            // Map user to DTO
            UserDTO userDTO = Utils.mapUserToDTO(saved);

            response.setStatusCode(200);
            response.setMessage("User registered successfully");
            response.setUserDTO(userDTO);
            response.setToken(token);
            response.setRole(saved.getRole().name());

        } catch (OurException e) {
            response.setStatusCode(400);
            response.setMessage(e.getMessage());
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error during registration: " + e.getMessage());
        }

        return response;
    }

    // ----------------------------------------------------
    // LOGIN
    // ----------------------------------------------------
    @Override
    public Response login(LoginRequest loginRequest) {
        Response response = new Response();

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()
                    )
            );

            User user = userRepository.findByEmail(loginRequest.getEmail())
                    .orElseThrow(() -> new OurException("User not found"));

            // Generate JWT
            String token = jwtTokenProvider.generateToken(user);

            // Convert user to DTO
            UserDTO userDTO = Utils.mapUserToDTO(user);

            response.setStatusCode(200);
            response.setToken(token);
            response.setRole(user.getRole().name());
            response.setUserDTO(userDTO);
            response.setMessage("Login successful");

        } catch (BadCredentialsException e) {
            response.setStatusCode(401);
            response.setMessage("Invalid email or password");
        } catch (OurException e) {
            response.setStatusCode(404);
            response.setMessage(e.getMessage());
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error during login: " + e.getMessage());
        }

        return response;
    }
}
