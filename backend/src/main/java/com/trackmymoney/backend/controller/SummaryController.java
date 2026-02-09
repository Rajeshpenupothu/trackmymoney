package com.trackmymoney.backend.controller;

import com.trackmymoney.backend.dto.MonthlySummaryResponse;
import com.trackmymoney.backend.service.SummaryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/summary")
public class SummaryController {

    private final SummaryService summaryService;

    public SummaryController(SummaryService summaryService) {
        this.summaryService = summaryService;
    }

    @GetMapping("/monthly")
    public ResponseEntity<?> getSummary(
            @RequestParam int year,
            @RequestParam int month
    ) {
        try {
            MonthlySummaryResponse response = summaryService.getMonthlySummary(year, month);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // Log the error so we can see what went wrong in server logs
            System.err.println("Error in /api/summary/monthly: " + e.getMessage());
            e.printStackTrace();
            
            // Return error details for debugging
            return ResponseEntity.status(500).body(
                new ErrorResponse("An error occurred while fetching summary: " + e.getMessage())
            );
        }
    }
    
    // Simple error response class
    public static class ErrorResponse {
        public String error;
        
        public ErrorResponse(String error) {
            this.error = error;
        }
        
        public String getError() {
            return error;
        }
    }
}
