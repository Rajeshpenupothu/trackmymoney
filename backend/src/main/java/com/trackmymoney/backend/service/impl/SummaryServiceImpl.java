package com.trackmymoney.backend.service.impl;

import com.trackmymoney.backend.dto.MonthlySummaryResponse;
import com.trackmymoney.backend.entity.User;
import com.trackmymoney.backend.exception.UserNotFoundException;
import com.trackmymoney.backend.repository.BorrowingRepository;
import com.trackmymoney.backend.repository.ExpenseRepository;
import com.trackmymoney.backend.repository.IncomeRepository;
import com.trackmymoney.backend.repository.LendingRepository;
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
    private final BorrowingRepository borrowingRepository;
    private final LendingRepository lendingRepository;
    private final UserRepository userRepository;

    public SummaryServiceImpl(
            ExpenseRepository expenseRepository,
            IncomeRepository incomeRepository,
            BorrowingRepository borrowingRepository,
            LendingRepository lendingRepository,
            UserRepository userRepository
    ) {
        this.expenseRepository = expenseRepository;
        this.incomeRepository = incomeRepository;
        this.borrowingRepository = borrowingRepository;
        this.lendingRepository = lendingRepository;
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

        // 🔥 Use BorrowingRepository to fetch borrowings for this month only
        BigDecimal borrowed = borrowingRepository
                .findByUser(user)
                .stream()
                .filter(b -> {
                    LocalDate borrowDate = b.getBorrowDate();
                    return borrowDate != null && !borrowDate.isBefore(start) && !borrowDate.isAfter(end);
                })
                .map(b -> b.getAmount() != null ? b.getAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 🔥 Use LendingRepository to fetch lendings for this month only
        BigDecimal lent = lendingRepository
                .findByUser(user)
                .stream()
                .filter(l -> {
                    LocalDate lendDate = l.getLendDate();
                    return lendDate != null && !lendDate.isBefore(start) && !lendDate.isAfter(end);
                })
                .map(l -> {
                    Double amount = l.getAmount();
                    return amount != null ? BigDecimal.valueOf(amount) : BigDecimal.ZERO;
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 🔥 Calculate unsettled amount from both borrowings and lendings
        BigDecimal unsettled = BigDecimal.ZERO;
        
        // Unsettled borrowings (money owed to others)
        BigDecimal unsettledBorrowed = borrowingRepository
                .findByUserAndSettledFalse(user)
                .stream()
                .map(b -> b.getAmount() != null ? b.getAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Unsettled lendings (money others owe to you)
        BigDecimal unsettledLent = lendingRepository
                .findByUser(user)
                .stream()
                .filter(l -> !l.isSettled())
                .map(l -> {
                    Double amount = l.getAmount();
                    return amount != null ? BigDecimal.valueOf(amount) : BigDecimal.ZERO;
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        unsettled = unsettledBorrowed.add(unsettledLent);

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
