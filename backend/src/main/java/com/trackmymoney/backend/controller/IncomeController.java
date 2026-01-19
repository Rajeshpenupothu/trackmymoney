package com.trackmymoney.backend.controller;

import com.trackmymoney.backend.dto.CreateIncomeRequest;
import com.trackmymoney.backend.dto.IncomeResponse;
import com.trackmymoney.backend.service.IncomeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incomes")
public class IncomeController {

    private final IncomeService incomeService;

    public IncomeController(IncomeService incomeService) {
        this.incomeService = incomeService;
    }

    // ➕ Add income
    @PostMapping
    public ResponseEntity<IncomeResponse> addIncome(
            @Valid @RequestBody CreateIncomeRequest request
    ) {
        return new ResponseEntity<>(
                incomeService.addIncome(request),
                HttpStatus.CREATED
        );
    }
    // ✏️ UPDATE income
    @PutMapping("/{id}")
    public ResponseEntity<IncomeResponse> updateIncome(
            @PathVariable Long id,
            @Valid @RequestBody CreateIncomeRequest request) {

        return ResponseEntity.ok(
                incomeService.updateIncome(id, request)
        );
    }

    // 🗑 DELETE income
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIncome(@PathVariable Long id) {
        incomeService.deleteIncome(id);
        return ResponseEntity.noContent().build();
    }

    // 📄 Get all incomes
    @GetMapping
    public ResponseEntity<List<IncomeResponse>> getAllIncomes() {
        return ResponseEntity.ok(
                incomeService.getIncomesForCurrentUser()
        );
    }

    // 📆 Get incomes by month
    @GetMapping("/month")
    public ResponseEntity<List<IncomeResponse>> getIncomesByMonth(
            @RequestParam int year,
            @RequestParam int month
    ) {
        return ResponseEntity.ok(
                incomeService.getIncomesForCurrentUserByMonth(year, month)
        );
    }
}
