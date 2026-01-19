package com.trackmymoney.backend.controller;

import com.trackmymoney.backend.dto.CreateTransactionRequest;
import com.trackmymoney.backend.dto.TransactionResponse;
import com.trackmymoney.backend.entity.TransactionType;
import com.trackmymoney.backend.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<TransactionResponse>> getByType(
            @PathVariable TransactionType type
    ) {
        return ResponseEntity.ok(
                transactionService.getTransactionsByType(type)
        );
    }

    @GetMapping("/unsettled")
    public ResponseEntity<List<TransactionResponse>> getUnsettled() {
        return ResponseEntity.ok(
                transactionService.getUnsettledTransactions()
        );
    }

    @PutMapping("/{id}/settle")
    public ResponseEntity<TransactionResponse> settle(@PathVariable Long id) {
        return ResponseEntity.ok(
                transactionService.settleTransaction(id)
        );
    }
}
