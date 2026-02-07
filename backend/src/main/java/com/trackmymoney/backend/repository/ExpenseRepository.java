package com.trackmymoney.backend.repository;

import com.trackmymoney.backend.entity.Expense;
import com.trackmymoney.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByUser(User user);

    List<Expense> findByUserAndExpenseDateBetween(
            User user,
            LocalDate startDate,
            LocalDate endDate
    );

    Optional<Expense> findByIdAndUser(Long id, User user);
}
