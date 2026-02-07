package com.trackmymoney.backend.service;

import com.trackmymoney.backend.dto.BorrowingRequest;
import com.trackmymoney.backend.dto.BorrowingResponse;

import java.util.List;

public interface BorrowingService {

    BorrowingResponse add(BorrowingRequest request);

    BorrowingResponse update(Long id, BorrowingRequest request);

    void delete(Long id);

    void settle(Long id);

    List<BorrowingResponse> getAll();
}
