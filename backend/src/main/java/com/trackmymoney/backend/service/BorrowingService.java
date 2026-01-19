package com.trackmymoney.backend.service;

import com.trackmymoney.backend.dto.BorrowingRequest;
import com.trackmymoney.backend.dto.BorrowingResponse;

import java.util.List;

public interface BorrowingService {

    BorrowingResponse add(BorrowingRequest request);

    BorrowingResponse update(Long id, BorrowingRequest request);

    // ❌ NOT USED ANYMORE (kept for safety)
    void delete(Long id);

    // ✅ NEW: MARK AS SETTLED (NO DELETE)
    void settle(Long id);

    List<BorrowingResponse> getAll();
}
