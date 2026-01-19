package com.trackmymoney.backend.repository;

import com.trackmymoney.backend.entity.Income;
import com.trackmymoney.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
public interface IncomeRepository extends JpaRepository<Income, Long> {

    List<Income> findByUser(User user);

    List<Income> findByUserAndIncomeDateBetween(
            User user,
            LocalDate start,
            LocalDate end
    );

    // ✅ NEW – for update & delete ownership check
    Optional<Income> findByIdAndUser(Long id, User user);
}
