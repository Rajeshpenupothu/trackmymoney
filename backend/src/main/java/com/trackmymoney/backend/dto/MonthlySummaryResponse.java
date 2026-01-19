package com.trackmymoney.backend.dto;

import java.math.BigDecimal;

public class MonthlySummaryResponse {

    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal savings;
    private BigDecimal totalBorrowed;
    private BigDecimal totalLent;
    private BigDecimal unsettledAmount;

    public MonthlySummaryResponse(
            BigDecimal totalIncome,
            BigDecimal totalExpense,
            BigDecimal savings,
            BigDecimal totalBorrowed,
            BigDecimal totalLent,
            BigDecimal unsettledAmount
    ) {
        this.totalIncome = totalIncome;
        this.totalExpense = totalExpense;
        this.savings = savings;
        this.totalBorrowed = totalBorrowed;
        this.totalLent = totalLent;
        this.unsettledAmount = unsettledAmount;
    }

    public BigDecimal getTotalIncome() { return totalIncome; }
    public BigDecimal getTotalExpense() { return totalExpense; }
    public BigDecimal getSavings() { return savings; }
    public BigDecimal getTotalBorrowed() { return totalBorrowed; }
    public BigDecimal getTotalLent() { return totalLent; }
    public BigDecimal getUnsettledAmount() { return unsettledAmount; }
}
