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
    public ResponseEntity<MonthlySummaryResponse> getSummary(
            @RequestParam int year,
            @RequestParam int month
    ) {
        return ResponseEntity.ok(
                summaryService.getMonthlySummary(year, month)
        );
    }
}
