package com.incial.crm.controller;

import com.incial.crm.dto.LoginRequest;
import com.incial.crm.dto.LoginResponse;
import com.incial.crm.dto.RegisterRequest;
import com.incial.crm.dto.RegisterResponse;
import com.incial.crm.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) {
        RegisterResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/google-login")
    public ResponseEntity<LoginResponse> googleLogin(@Valid @RequestBody com.incial.crm.dto.GoogleLoginRequest request) {
        LoginResponse response = authService.loginWithGoogle(request);
        return ResponseEntity.ok(response);
    }
}