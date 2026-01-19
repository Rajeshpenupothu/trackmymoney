package com.trackmymoney.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class BorrowingResponse {

    private Long id;
    private String name;
    private BigDecimal amount;
    private LocalDate borrowDate;
    private LocalDate dueDate;
    private boolean settled; // ✅ ADD THIS

    public BorrowingResponse(
            Long id,
            String name,
            BigDecimal amount,
            LocalDate borrowDate,
            LocalDate dueDate,
            boolean settled
    ) {
        this.id = id;
        this.name = name;
        this.amount = amount;
        this.borrowDate = borrowDate;
        this.dueDate = dueDate;
        this.settled = settled;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public LocalDate getBorrowDate() {
        return borrowDate;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public boolean isSettled() {
        return settled;
    }
}
