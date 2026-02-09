package com.trackmymoney.backend.repository;

import com.trackmymoney.backend.entity.Borrowing;
import com.trackmymoney.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BorrowingRepository extends JpaRepository<Borrowing, Long> {

    List<Borrowing> findByUser(User user);

    List<Borrowing> findByUserAndSettledFalse(User user);

    Optional<Borrowing> findByIdAndUser(Long id, User user);
    
    // This allows the DB to sum everything in one go instead of fetching all records
    @Query("SELECT SUM(b.amount) FROM Borrowing b WHERE b.user.id = :userId")
    Double sumByUserId(@Param("userId") Long userId);

    // Sum only overdue, unsettled borrowings for the user
    @Query("SELECT SUM(b.amount) FROM Borrowing b WHERE b.user.id = :userId AND b.settled = false AND b.dueDate < CURRENT_DATE")
    Double sumOverdueByUserId(@Param("userId") Long userId);
}
	