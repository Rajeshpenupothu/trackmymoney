package com.trackmymoney.backend.service.impl;

import com.trackmymoney.backend.dto.MonthlySummaryResponse;
import com.trackmymoney.backend.entity.TransactionType;
import com.trackmymoney.backend.entity.User;
import com.trackmymoney.backend.exception.UserNotFoundException;
import com.trackmymoney.backend.repository.ExpenseRepository;
import com.trackmymoney.backend.repository.IncomeRepository;
import com.trackmymoney.backend.repository.TransactionRepository;
import com.trackmymoney.backend.repository.UserRepository;
import com.trackmymoney.backend.security.SecurityUtils;
import com.trackmymoney.backend.service.SummaryService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
public class SummaryServiceImpl implements SummaryService {

    private final ExpenseRepository expenseRepository;
    private final IncomeRepository incomeRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public SummaryServiceImpl(
            ExpenseRepository expenseRepository,
            IncomeRepository incomeRepository,
            TransactionRepository transactionRepository,
            UserRepository userRepository
    ) {
        this.expenseRepository = expenseRepository;
        this.incomeRepository = incomeRepository;
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    @Override
    public MonthlySummaryResponse getMonthlySummary(int year, int month) {

        User user = getLoggedInUser();

        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());

        BigDecimal totalIncome = incomeRepository
                .findByUserAndIncomeDateBetween(user, start, end)
                .stream()
                .map(i -> i.getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpense = expenseRepository
                .findByUserAndExpenseDateBetween(user, start, end)
                .stream()
                .map(e -> e.getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 🔥 Filter borrowings by date range (month) instead of fetching ALL
        BigDecimal borrowed = transactionRepository
                .findByUserIdAndType(user.getId(), TransactionType.BORROW)
                .stream()
                .filter(t -> {
                    LocalDate txDate = t.getBorrowDate() != null ? t.getBorrowDate().toLocalDateTime().toLocalDate() : LocalDate.now();
                    return !txDate.isBefore(start) && !txDate.isAfter(end);
                })
                .map(t -> t.getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 🔥 Filter lendings by date range (month) instead of fetching ALL
        BigDecimal lent = transactionRepository
                .findByUserIdAndType(user.getId(), TransactionType.LEND)
                .stream()
                .filter(t -> {
                    LocalDate txDate = t.getLendDate() != null ? t.getLendDate().toLocalDateTime().toLocalDate() : LocalDate.now();
                    return !txDate.isBefore(start) && !txDate.isAfter(end);
                })
                .map(t -> t.getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal unsettled = transactionRepository
                .findByUserIdAndSettledFalse(user.getId())
                .stream()
                .map(t -> t.getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal savings = totalIncome.subtract(totalExpense);

        return new MonthlySummaryResponse(
                totalIncome,
                totalExpense,
                savings,
                borrowed,
                lent,
                unsettled
        );
    }

    private User getLoggedInUser() {
        String email = SecurityUtils.getCurrentUserEmail();

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException("User not found with email: " + email)
                );
    }
}
