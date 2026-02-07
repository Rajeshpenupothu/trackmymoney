package com.trackmymoney.backend.controller;

import com.trackmymoney.backend.dto.BorrowingRequest;
import com.trackmymoney.backend.dto.BorrowingResponse;
import com.trackmymoney.backend.service.BorrowingService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/borrowings")
public class BorrowingController {

    private final BorrowingService borrowingService;

    public BorrowingController(BorrowingService borrowingService) {
        this.borrowingService = borrowingService;
    }

    @PostMapping
    public BorrowingResponse create(@RequestBody BorrowingRequest request) {
        return borrowingService.add(request);
    }

    @GetMapping
    public List<BorrowingResponse> getAll() {
        return borrowingService.getAll();
    }

    @PutMapping("/{id}")
    public BorrowingResponse update(
            @PathVariable Long id,
            @RequestBody BorrowingRequest request
    ) {
        return borrowingService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        borrowingService.delete(id);
    }

    @PutMapping("/{id}/settle")
    public void settle(@PathVariable Long id) {
        borrowingService.settle(id);
    }
}
