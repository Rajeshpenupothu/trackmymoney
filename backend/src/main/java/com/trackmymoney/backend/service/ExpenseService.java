package com.trackmymoney.backend.service;

import com.trackmymoney.backend.dto.CreateExpenseRequest;
import com.trackmymoney.backend.dto.ExpenseResponse;

import java.util.List;

public interface ExpenseService {

    ExpenseResponse addExpense(CreateExpenseRequest request);

    List<ExpenseResponse> getExpensesForCurrentUser();

    List<ExpenseResponse> getExpensesForCurrentUserByMonth(int year, int month);

    ExpenseResponse updateExpense(Long id, CreateExpenseRequest request);

    void deleteExpense(Long id);
}
