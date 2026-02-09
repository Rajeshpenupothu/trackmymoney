package com.trackmymoney.backend.service.impl;

import com.trackmymoney.backend.dto.DashboardSummaryDTO;
import com.trackmymoney.backend.repository.*;
import com.trackmymoney.backend.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class DashboardServiceImpl implements DashboardService {

    @Autowired private IncomeRepository incomeRepo;
    @Autowired private ExpenseRepository expenseRepo;
    @Autowired private BorrowingRepository borrowingRepo;
    @Autowired private LendingRepository lendingRepo;

    @Override
    public DashboardSummaryDTO getSummary(Long userId) {
        // Use Double wrapper to prevent NullPointerException on empty data
        Double income = incomeRepo.sumByUserId(userId);
        Double expense = expenseRepo.sumByUserId(userId);
        Double borrowed = borrowingRepo.sumByUserId(userId);
        Double lent = lendingRepo.sumByUserId(userId);
        // Overdue sums (unsettled and past due date)
        Double overdueBorrowed = borrowingRepo.sumOverdueByUserId(userId);
        Double overdueLent = lendingRepo.sumOverdueByUserId(userId);

        return new DashboardSummaryDTO(
            income != null ? income : 0.0,
            expense != null ? expense : 0.0,
            borrowed != null ? borrowed : 0.0,
            lent != null ? lent : 0.0,
            overdueBorrowed != null ? overdueBorrowed : 0.0,
            overdueLent != null ? overdueLent : 0.0
        );
    }
}
