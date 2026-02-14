package com.trackmymoney.backend.repository;

import com.trackmymoney.backend.entity.Lending;
import com.trackmymoney.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface LendingRepository extends JpaRepository<Lending, Long> {

    List<Lending> findByUser(User user);

    List<Lending> findByUserAndDueDateBetween(User user, LocalDate start, LocalDate end);

    Optional<Lending> findByIdAndUser(Long id, User user);

    @Query("SELECT SUM(l.amount) FROM Lending l WHERE l.user.id = :userId AND l.settled = false")
    BigDecimal sumOfUnsettledLendingsByUserId(@Param("userId") Long userId);
    
    @Query("SELECT SUM(l.amount) FROM Lending l WHERE l.user.id = :userId")
    BigDecimal sumByUserId(@Param("userId") Long userId);

    // FIX: This method signature now matches what your DashboardServiceImpl is calling
    @Query("SELECT SUM(l.amount) FROM Lending l WHERE l.user.id = :userId AND l.settled = false AND l.dueDate <=:today")
    BigDecimal sumOverdueByUserId(@Param("userId") Long userId, @Param("today") LocalDate today);
}