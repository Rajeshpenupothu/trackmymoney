package com.trackmymoney.backend.repository;

import com.trackmymoney.backend.entity.Lending;
import com.trackmymoney.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface LendingRepository extends JpaRepository<Lending, Long> {

    List<Lending> findByUser(User user);

    Optional<Lending> findByIdAndUser(Long id, User user);
    
    // This allows the DB to sum everything in one go instead of fetching all records
    @Query("SELECT SUM(l.amount) FROM Lending l WHERE l.user.id = :userId")
    Double sumByUserId(@Param("userId") Long userId);

    // Sum only overdue, unsettled lendings for the user
    @Query("SELECT SUM(l.amount) FROM Lending l WHERE l.user.id = :userId AND l.settled = false AND l.dueDate < CURRENT_DATE")
    Double sumOverdueByUserId(@Param("userId") Long userId);
}
