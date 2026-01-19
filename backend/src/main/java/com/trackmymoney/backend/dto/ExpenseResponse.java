package com.trackmymoney.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ExpenseResponse {

    private Long id;
    private BigDecimal amount;
    private String category;
    private String description;
    private LocalDate expenseDate;

    public ExpenseResponse(
            Long id,
            BigDecimal amount,
            String category,
            String description,
            LocalDate expenseDate
    ) {
        this.id = id;
        this.amount = amount;
        this.category = category;
        this.description = description;
        this.expenseDate = expenseDate;
    }

    public Long getId() { return id; }
    public BigDecimal getAmount() { return amount; }
    public String getCategory() { return category; }
    public String getDescription() { return description; }
    public LocalDate getExpenseDate() { return expenseDate; }
}
