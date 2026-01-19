package com.trackmymoney.backend.service;

import com.trackmymoney.backend.dto.CreateExpenseRequest;
import com.trackmymoney.backend.dto.ExpenseResponse;

import java.util.List;

public interface ExpenseService {

    // ✅ already existing
    ExpenseResponse addExpense(CreateExpenseRequest request);

    List<ExpenseResponse> getExpensesForCurrentUser();

    List<ExpenseResponse> getExpensesForCurrentUserByMonth(int year, int month);

    // 🔵 ADD THIS (UPDATE)
    ExpenseResponse updateExpense(Long id, CreateExpenseRequest request);

    // 🔴 ADD THIS (DELETE)
    void deleteExpense(Long id);
}
