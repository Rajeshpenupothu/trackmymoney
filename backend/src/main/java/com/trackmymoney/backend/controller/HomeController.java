package com.trackmymoney.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    private final com.trackmymoney.backend.repository.UserRepository userRepository;

    public HomeController(com.trackmymoney.backend.repository.UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/")
    public String home() {
        return "TrackMyMoney Backend is Running Successfully! 🚀";
    }

    @GetMapping("/health")
    public String healthCheck() {
        userRepository.count(); // Keep DB connection active
        return "Backend & Database are Active! ✅";
    }
}
