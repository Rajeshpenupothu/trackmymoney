package com.trackmymoney.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class BorrowingRequest {

    private String name;
    private BigDecimal amount;
    private LocalDate borrowDate;
    private LocalDate dueDate;

    public BorrowingRequest() {
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

    public void setName(String name) {
        this.name = name;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public void setBorrowDate(LocalDate borrowDate) {
        this.borrowDate = borrowDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }
}
