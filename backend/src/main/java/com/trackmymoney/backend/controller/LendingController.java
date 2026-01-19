package com.trackmymoney.backend.controller;

import com.trackmymoney.backend.dto.LendingRequest;
import com.trackmymoney.backend.dto.LendingResponse;
import com.trackmymoney.backend.service.LendingService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lendings")
public class LendingController {

    private final LendingService lendingService;

    public LendingController(LendingService lendingService) {
        this.lendingService = lendingService;
    }

    @PostMapping
    public LendingResponse create(@RequestBody LendingRequest request) {
        return lendingService.create(request);
    }

    @GetMapping
    public List<LendingResponse> getAll() {
        return lendingService.getAll();
    }

    @PutMapping("/{id}")
    public LendingResponse update(
            @PathVariable Long id,
            @RequestBody LendingRequest request
    ) {
        return lendingService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        lendingService.delete(id);
    }

    // ✅ ADD THIS — SETTLE (NO DELETE)
    @PutMapping("/{id}/settle")
    public void settle(@PathVariable Long id) {
        lendingService.settle(id);
    }
}
