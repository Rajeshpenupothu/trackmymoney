package com.trackmymoney.backend.repository;

import com.trackmymoney.backend.entity.Transaction;
import com.trackmymoney.backend.entity.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    // Unsettled transactions
    List<Transaction> findByUserIdAndSettledFalse(Long userId);
}
