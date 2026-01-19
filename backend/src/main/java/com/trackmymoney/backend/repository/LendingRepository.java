package com.trackmymoney.backend.repository;

import com.trackmymoney.backend.entity.Lending;
import com.trackmymoney.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LendingRepository extends JpaRepository<Lending, Long> {

    List<Lending> findByUser(User user);

    Optional<Lending> findByIdAndUser(Long id, User user);
}
