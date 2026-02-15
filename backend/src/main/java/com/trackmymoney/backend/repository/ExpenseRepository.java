package com.trackmymoney.backend.repository;

import com.trackmymoney.backend.entity.Expense;
import com.trackmymoney.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByUser(User user);

    // This is the one we need for reports - Good, you already had it!
    List<Expense> findByUserAndExpenseDateBetween(User user, LocalDate startDate, LocalDate endDate);

    Optional<Expense> findByIdAndUser(Long id, User user);
    
    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.user.id = :userId")
    BigDecimal sumByUserId(@Param("userId") Long userId);

    void deleteByUser(User user);
}