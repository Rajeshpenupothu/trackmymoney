package com.trackmymoney.backend.controller;

import com.trackmymoney.backend.dto.AuthResponse;
import com.trackmymoney.backend.dto.CreateUserRequest;
import com.trackmymoney.backend.dto.LoginRequest;
import com.trackmymoney.backend.dto.ErrorResponse;
import com.trackmymoney.backend.entity.User;
import com.trackmymoney.backend.repository.UserRepository;
import com.trackmymoney.backend.security.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthController(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(
            @Valid @RequestBody CreateUserRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest()
                    .body("Email already exists");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        userRepository.save(user);

        return ResponseEntity.ok("User registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody LoginRequest request) {

        var user = userRepository.findByEmail(request.getEmail())
                .orElse(null);

        if (user == null || !passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("Invalid email or password"));
        }

        String token = jwtUtil.generateToken(user.getEmail());

        return ResponseEntity.ok(
                new AuthResponse(
                        token,
                        user.getName(),
                        user.getEmail()
                )
        );
    }
}
