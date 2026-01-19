package com.trackmymoney.backend.repository;

import com.trackmymoney.backend.entity.Transaction;
import com.trackmymoney.backend.entity.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByUserId(Long userId);

    List<Transaction> findByUserIdAndType(Long userId, TransactionType type);

    // ✅ ADD THIS (missing)
    List<Transaction> findByUserIdAndSettledFalse(Long userId);
}
