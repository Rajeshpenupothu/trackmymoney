package com.trackmymoney.backend.repository;

import com.trackmymoney.backend.entity.Expense;
import com.trackmymoney.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    // ✅ GET all expenses
    List<Expense> findByUser(User user);

    // ✅ GET expenses by month
    List<Expense> findByUserAndExpenseDateBetween(
            User user,
            LocalDate startDate,
            LocalDate endDate
    );

    // 🔐 REQUIRED for UPDATE & DELETE (NEW)
    Optional<Expense> findByIdAndUser(Long id, User user);
}
