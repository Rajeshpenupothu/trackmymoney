package com.trackmymoney.backend.service.impl;

import com.trackmymoney.backend.dto.BorrowingResponse;
import com.trackmymoney.backend.dto.BorrowingRequest;
import com.trackmymoney.backend.entity.Borrowing;
import com.trackmymoney.backend.entity.User;
import com.trackmymoney.backend.repository.BorrowingRepository;
import com.trackmymoney.backend.repository.UserRepository;
import com.trackmymoney.backend.security.SecurityUtils;
import com.trackmymoney.backend.service.BorrowingService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BorrowingServiceImpl implements BorrowingService {

    private final BorrowingRepository borrowingRepository;
    private final UserRepository userRepository;

    public BorrowingServiceImpl(
            BorrowingRepository borrowingRepository,
            UserRepository userRepository
    ) {
        this.borrowingRepository = borrowingRepository;
        this.userRepository = userRepository;
    }

    private User getUser() {
        return userRepository
                .findByEmail(SecurityUtils.getCurrentUserEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    public BorrowingResponse add(BorrowingRequest r) {
        Borrowing b = new Borrowing();
        b.setName(r.getName());
        b.setAmount(r.getAmount());
        b.setBorrowDate(r.getBorrowDate());
        b.setDueDate(r.getDueDate());
        b.setSettled(false);
        b.setUser(getUser());

        return map(borrowingRepository.save(b));
    }

    @Override
    public BorrowingResponse update(Long id, BorrowingRequest r) {
        Borrowing b = borrowingRepository
                .findByIdAndUser(id, getUser())
                .orElseThrow(() -> new RuntimeException("Borrowing not found"));

        b.setName(r.getName());
        b.setAmount(r.getAmount());
        b.setBorrowDate(r.getBorrowDate());
        b.setDueDate(r.getDueDate());

        return map(borrowingRepository.save(b));
    }

    @Override
    public void delete(Long id) {
        Borrowing b = borrowingRepository
                .findByIdAndUser(id, getUser())
                .orElseThrow(() -> new RuntimeException("Borrowing not found"));

        borrowingRepository.delete(b);
    }

    @Override
    public void settle(Long id) {
        Borrowing b = borrowingRepository
                .findByIdAndUser(id, getUser())
                .orElseThrow(() -> new RuntimeException("Borrowing not found"));

        b.setSettled(true);
        borrowingRepository.save(b);
    }

    @Override
    public List<BorrowingResponse> getAll() {
        return borrowingRepository
                .findByUser(getUser())   // ✅ RETURN ALL
                .stream()
                .map(this::map)
                .collect(Collectors.toList());
    }

    private BorrowingResponse map(Borrowing b) {
        return new BorrowingResponse(
                b.getId(),
                b.getName(),
                b.getAmount(),
                b.getBorrowDate(),
                b.getDueDate(),
                b.isSettled()          // ✅ IMPORTANT
        );
    }
}
