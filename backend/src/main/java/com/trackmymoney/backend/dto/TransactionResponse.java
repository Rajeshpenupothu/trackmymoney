package com.trackmymoney.backend.dto;

import com.trackmymoney.backend.entity.TransactionType;

import java.math.BigDecimal;

public class TransactionResponse {

    private Long id;
    private BigDecimal amount;
    private String description;
    private TransactionType type;
    private boolean settled;

    public TransactionResponse(
            Long id,
            BigDecimal amount,
            String description,
            TransactionType type,
            boolean settled
    ) {
        this.id = id;
        this.amount = amount;
        this.description = description;
        this.type = type;
        this.settled = settled;
    }

    public Long getId() {
        return id;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public String getDescription() {
        return description;
    }

    public TransactionType getType() {
        return type;
    }

    public boolean isSettled() {
        return settled;
    }
}
