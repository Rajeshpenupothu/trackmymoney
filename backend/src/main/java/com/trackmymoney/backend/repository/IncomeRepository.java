package com.trackmymoney.backend.repository;

import com.trackmymoney.backend.entity.Income;
import com.trackmymoney.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface IncomeRepository extends JpaRepository<Income, Long> {

    List<Income> findByUser(User user);

    // This is the one we need for reports - Good, you already had it!
    List<Income> findByUserAndIncomeDateBetween(User user, LocalDate start, LocalDate end);

    Optional<Income> findByIdAndUser(Long id, User user);
    
    @Query("SELECT SUM(i.amount) FROM Income i WHERE i.user.id = :userId")
    BigDecimal sumByUserId(@Param("userId") Long userId);

    void deleteByUser(User user);
}