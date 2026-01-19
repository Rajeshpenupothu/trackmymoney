package com.trackmymoney.backend.controller;

import com.trackmymoney.backend.dto.CreateExpenseRequest;
import com.trackmymoney.backend.dto.ExpenseResponse;
import com.trackmymoney.backend.service.ExpenseService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    // ✅ Get expenses for logged-in user
    @GetMapping
    public ResponseEntity<List<ExpenseResponse>> getMyExpenses() {
        return ResponseEntity.ok(
                expenseService.getExpensesForCurrentUser()
        );
    }

    // ✅ Get expenses by month for logged-in user
    @GetMapping("/month")
    public ResponseEntity<List<ExpenseResponse>> getMyExpensesByMonth(
            @RequestParam int year,
            @RequestParam int month) {

        return ResponseEntity.ok(
                expenseService.getExpensesForCurrentUserByMonth(year, month)
        );
    }

    // ✅ Add expense
    @PostMapping
    public ResponseEntity<ExpenseResponse> addExpense(
            @Valid @RequestBody CreateExpenseRequest request) {

        return new ResponseEntity<>(
                expenseService.addExpense(request),
                HttpStatus.CREATED
        );
    }

    // 🔵 UPDATE expense (NEW)
    @PutMapping("/{id}")
    public ResponseEntity<ExpenseResponse> updateExpense(
            @PathVariable Long id,
            @Valid @RequestBody CreateExpenseRequest request) {

        return ResponseEntity.ok(
                expenseService.updateExpense(id, request)
        );
    }

    // 🔴 DELETE expense (NEW)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(
            @PathVariable Long id) {

        expenseService.deleteExpense(id);
        return ResponseEntity.noContent().build();
    }
}
