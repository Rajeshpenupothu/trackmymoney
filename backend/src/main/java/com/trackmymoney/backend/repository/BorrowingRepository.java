package com.trackmymoney.backend.repository;

import com.trackmymoney.backend.entity.Borrowing;
import com.trackmymoney.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BorrowingRepository extends JpaRepository<Borrowing, Long> {

    List<Borrowing> findByUser(User user);

    List<Borrowing> findByUserAndSettledFalse(User user);

    // NEW: Needed for the Monthly Report
    List<Borrowing> findByUserAndDueDateBetween(User user, LocalDate start, LocalDate end);

    Optional<Borrowing> findByIdAndUser(Long id, User user);
    
    @Query("SELECT SUM(b.amount) FROM Borrowing b WHERE b.user.id = :userId")
    BigDecimal sumByUserId(@Param("userId") Long userId);

    @Query("SELECT SUM(b.amount) FROM Borrowing b WHERE b.user.id = :userId AND b.settled = false AND b.dueDate < CURRENT_DATE")
    BigDecimal sumOverdueByUserId(@Param("userId") Long userId);
}