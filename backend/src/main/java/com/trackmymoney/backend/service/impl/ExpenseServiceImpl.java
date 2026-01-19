package com.trackmymoney.backend.service.impl;

import com.trackmymoney.backend.dto.CreateExpenseRequest;
import com.trackmymoney.backend.dto.ExpenseResponse;
import com.trackmymoney.backend.entity.Expense;
import com.trackmymoney.backend.entity.User;
import com.trackmymoney.backend.exception.UserNotFoundException;
import com.trackmymoney.backend.repository.ExpenseRepository;
import com.trackmymoney.backend.repository.UserRepository;
import com.trackmymoney.backend.security.SecurityUtils;
import com.trackmymoney.backend.service.ExpenseService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExpenseServiceImpl implements ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;

    public ExpenseServiceImpl(
            ExpenseRepository expenseRepository,
            UserRepository userRepository
    ) {
        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;
    }

    // ✅ ADD expense
    @Override
    public ExpenseResponse addExpense(CreateExpenseRequest request) {

        User user = getLoggedInUser();

        Expense expense = new Expense();
        expense.setAmount(request.getAmount());
        expense.setCategory(request.getCategory());
        expense.setDescription(request.getDescription());
        expense.setExpenseDate(request.getExpenseDate());
        expense.setUser(user);

        return mapToResponse(expenseRepository.save(expense));
    }

    // 🔵 UPDATE expense (NEW)
    @Override
    public ExpenseResponse updateExpense(Long id, CreateExpenseRequest request) {

        User user = getLoggedInUser();

        Expense expense = expenseRepository
                .findByIdAndUser(id, user)
                .orElseThrow(() ->
                        new RuntimeException("Expense not found or not authorized")
                );

        expense.setAmount(request.getAmount());
        expense.setCategory(request.getCategory());
        expense.setDescription(request.getDescription());
        expense.setExpenseDate(request.getExpenseDate());

        return mapToResponse(expenseRepository.save(expense));
    }

    // 🔴 DELETE expense (NEW)
    @Override
    public void deleteExpense(Long id) {

        User user = getLoggedInUser();

        Expense expense = expenseRepository
                .findByIdAndUser(id, user)
                .orElseThrow(() ->
                        new RuntimeException("Expense not found or not authorized")
                );

        expenseRepository.delete(expense);
    }

    // ✅ Get expenses
    @Override
    public List<ExpenseResponse> getExpensesForCurrentUser() {

        User user = getLoggedInUser();

        return expenseRepository.findByUser(user)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ✅ Get expenses by month
    @Override
    public List<ExpenseResponse> getExpensesForCurrentUserByMonth(
            int year,
            int month
    ) {

        User user = getLoggedInUser();

        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

        return expenseRepository
                .findByUserAndExpenseDateBetween(user, startDate, endDate)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // 🔒 Resolve logged-in user
    private User getLoggedInUser() {

        String email = SecurityUtils.getCurrentUserEmail();

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException("User not found with email: " + email)
                );
    }

    // 🔁 DTO mapper
    private ExpenseResponse mapToResponse(Expense expense) {
        return new ExpenseResponse(
                expense.getId(),
                expense.getAmount(),
                expense.getCategory(),
                expense.getDescription(),
                expense.getExpenseDate()
        );
    }
}
