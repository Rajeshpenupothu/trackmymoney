package com.trackmymoney.backend.controller;

import com.trackmymoney.backend.dto.MonthlySummaryResponse;
import com.trackmymoney.backend.entity.User;
import com.trackmymoney.backend.exception.UserNotFoundException;
import com.trackmymoney.backend.repository.UserRepository;
import com.trackmymoney.backend.security.SecurityUtils;
import com.trackmymoney.backend.service.DashboardService;
import com.trackmymoney.backend.service.SummaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Month;
import java.util.Map;

@RestController
@RequestMapping("/api/summary")
public class SummaryController {

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private SummaryService summaryService;

    @Autowired
    private UserRepository userRepository;

    // --- Endpoint 1: Dashboard Stats (Home Page) ---
    @GetMapping
    public ResponseEntity<Map<String, Double>> getDashboardSummary(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String month
    ) {
        String email = SecurityUtils.getCurrentUserEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        // Calls the robust service we fixed earlier
        Map<String, Double> stats = dashboardService.getDashboardStats(user, year, month);
        return ResponseEntity.ok(stats);
    }

    // --- Endpoint 2: Monthly Report (Reports Page / Graphs) ---
    @GetMapping("/monthly")
    public ResponseEntity<?> getMonthlyReport(
            @RequestParam int year,
            @RequestParam String month // Frontend sends "February" (String)
    ) {
        try {
            // 1. Convert String Month ("February") to Integer (2)
            int monthInt = Month.valueOf(month.toUpperCase()).getValue();

            // 2. Call the service
            MonthlySummaryResponse response = summaryService.getMonthlySummary(year, monthInt);
            
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            // Handles if frontend sends a bad month name
            return ResponseEntity.badRequest().body("Invalid month: " + month);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error processing report: " + e.getMessage());
        }
    }
}