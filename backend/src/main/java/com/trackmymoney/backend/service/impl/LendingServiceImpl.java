package com.trackmymoney.backend.service.impl;

import com.trackmymoney.backend.dto.LendingRequest;
import com.trackmymoney.backend.dto.LendingResponse;
import com.trackmymoney.backend.entity.Lending;
import com.trackmymoney.backend.entity.User;
import com.trackmymoney.backend.repository.LendingRepository;
import com.trackmymoney.backend.repository.UserRepository;
import com.trackmymoney.backend.security.SecurityUtils;
import com.trackmymoney.backend.service.LendingService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LendingServiceImpl implements LendingService {

    private final LendingRepository lendingRepository;
    private final UserRepository userRepository;

    public LendingServiceImpl(LendingRepository lendingRepository,
                              UserRepository userRepository) {
        this.lendingRepository = lendingRepository;
        this.userRepository = userRepository;
    }

    private User currentUser() {
        return userRepository
                .findByEmail(SecurityUtils.getCurrentUserEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    public LendingResponse create(LendingRequest r) {
        Lending l = new Lending();
        l.setName(r.name());
        l.setAmount(r.amount());
        l.setLendDate(r.lendDate());
        l.setDueDate(r.dueDate());
        l.setUser(currentUser());
        l.setSettled(false); // ✅ DEFAULT

        return map(lendingRepository.save(l));
    }

    @Override
    public LendingResponse update(Long id, LendingRequest r) {
        Lending l = lendingRepository
                .findByIdAndUser(id, currentUser())
                .orElseThrow(() -> new RuntimeException("Lending not found"));

        l.setName(r.name());
        l.setAmount(r.amount());
        l.setLendDate(r.lendDate());
        l.setDueDate(r.dueDate());

        return map(lendingRepository.save(l));
    }

    @Override
    public void delete(Long id) {
        Lending l = lendingRepository
                .findByIdAndUser(id, currentUser())
                .orElseThrow(() -> new RuntimeException("Lending not found"));

        lendingRepository.delete(l);
    }

    @Override
    public List<LendingResponse> getAll() {
        return lendingRepository
                .findByUser(currentUser())
                .stream()
                .map(this::map)
                .toList();
    }

    // ✅ ADD THIS METHOD (REQUIRED FOR SETTLED BUTTON)
    @Override
    public void settle(Long id) {
        Lending l = lendingRepository
                .findByIdAndUser(id, currentUser())
                .orElseThrow(() -> new RuntimeException("Lending not found"));

        l.setSettled(true);
        lendingRepository.save(l);
    }

    // ✅ UPDATED MAPPER (INCLUDES settled)
    private LendingResponse map(Lending l) {
        return new LendingResponse(
                l.getId(),
                l.getName(),
                l.getAmount(),
                l.getLendDate(),
                l.getDueDate(),
                l.isSettled()
        );
    }
}
