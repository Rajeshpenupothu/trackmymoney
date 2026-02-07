package com.trackmymoney.backend.repository;

import com.trackmymoney.backend.entity.Borrowing;
import com.trackmymoney.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BorrowingRepository extends JpaRepository<Borrowing, Long> {

    List<Borrowing> findByUser(User user);

    List<Borrowing> findByUserAndSettledFalse(User user);

    Optional<Borrowing> findByIdAndUser(Long id, User user);
}
	