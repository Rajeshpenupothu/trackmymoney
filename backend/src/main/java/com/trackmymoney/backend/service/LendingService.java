package com.trackmymoney.backend.service;

import com.trackmymoney.backend.dto.LendingRequest;
import com.trackmymoney.backend.dto.LendingResponse;

import java.util.List;

public interface LendingService {

    LendingResponse create(LendingRequest request);

    LendingResponse update(Long id, LendingRequest request);

    void delete(Long id);

    List<LendingResponse> getAll();

    // ✅ ADD THIS (for Settled button)
    void settle(Long id);
}
