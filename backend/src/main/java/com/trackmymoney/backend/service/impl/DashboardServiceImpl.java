package com.trackmymoney.backend.service.impl;

import com.trackmymoney.backend.entity.Borrowing;
import com.trackmymoney.backend.entity.User;
import com.trackmymoney.backend.repository.BorrowingRepository;
import com.trackmymoney.backend.repository.ExpenseRepository;
import com.trackmymoney.backend.repository.IncomeRepository;
import com.trackmymoney.backend.repository.LendingRepository;
import com.trackmymoney.backend.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardServiceImpl implements DashboardService {

    @Autowired private IncomeRepository incomeRepository;
    @Autowired private ExpenseRepository expenseRepository;
    @Autowired private BorrowingRepository borrowingRepository;
    @Autowired private LendingRepository lendingRepository;

    @Override
    public Map<String, Double> getDashboardStats(User user, Integer year, String monthStr) {
        
        LocalDate today = LocalDate.now();

        // 1. Fetch Totals
        BigDecimal totalIncome = incomeRepository.sumByUserId(user.getId());
        BigDecimal totalExpense = expenseRepository.sumByUserId(user.getId());
        BigDecimal totalBorrowed = borrowingRepository.sumOfUnsettledBorrowingsByUserId(user.getId());
        BigDecimal totalLent = lendingRepository.sumOfUnsettledLendingsByUserId(user.getId());
        
        // 2. Fetch Overdue (Make sure Repositories use <= :today)
        BigDecimal totalOverdueBorrowed = borrowingRepository.sumOverdueByUserId(user.getId(), today);
        BigDecimal totalOverdueLent = lendingRepository.sumOverdueByUserId(user.getId(), today);

        // 3. Null Checks
        totalIncome = (totalIncome == null) ? BigDecimal.ZERO : totalIncome;
        totalExpense = (totalExpense == null) ? BigDecimal.ZERO : totalExpense;
        totalBorrowed = (totalBorrowed == null) ? BigDecimal.ZERO : totalBorrowed;
        totalLent = (totalLent == null) ? BigDecimal.ZERO : totalLent;
        totalOverdueBorrowed = (totalOverdueBorrowed == null) ? BigDecimal.ZERO : totalOverdueBorrowed;
        totalOverdueLent = (totalOverdueLent == null) ? BigDecimal.ZERO : totalOverdueLent;

        BigDecimal balance = totalIncome.subtract(totalExpense);

        // 4. Prepare Map
        Map<String, Double> stats = new HashMap<>();

        stats.put("totalIncome", totalIncome.doubleValue());
        stats.put("totalExpense", totalExpense.doubleValue());
        stats.put("totalExpenses", totalExpense.doubleValue());
        stats.put("balance", balance.doubleValue());
        stats.put("availableBalance", balance.doubleValue());
        stats.put("totalBorrowed", totalBorrowed.doubleValue());
        stats.put("totalLent", totalLent.doubleValue());

        // Overdue Keys
        stats.put("overdueBorrowed", totalOverdueBorrowed.doubleValue());
        stats.put("totalOverdueBorrowed", totalOverdueBorrowed.doubleValue());
        stats.put("overdueLent", totalOverdueLent.doubleValue());
        stats.put("totalOverdueLent", totalOverdueLent.doubleValue());

        return stats;
    }
}