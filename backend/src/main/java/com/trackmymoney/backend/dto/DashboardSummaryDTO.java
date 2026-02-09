package com.trackmymoney.backend.dto;

public class DashboardSummaryDTO {
    private Double totalIncome;
    private Double totalExpense;
    private Double totalBorrowed;
    private Double totalLent;
    private Double overdueBorrowed;
    private Double overdueLent;

    public DashboardSummaryDTO(Double totalIncome, Double totalExpense, Double totalBorrowed, Double totalLent,
                               Double overdueBorrowed, Double overdueLent) {
        this.totalIncome = totalIncome;
        this.totalExpense = totalExpense;
        this.totalBorrowed = totalBorrowed;
        this.totalLent = totalLent;
        this.overdueBorrowed = overdueBorrowed;
        this.overdueLent = overdueLent;
    }

    public Double getTotalIncome() { return totalIncome; }
    public void setTotalIncome(Double totalIncome) { this.totalIncome = totalIncome; }

    public Double getTotalExpense() { return totalExpense; }
    public void setTotalExpense(Double totalExpense) { this.totalExpense = totalExpense; }

    public Double getTotalBorrowed() { return totalBorrowed; }
    public void setTotalBorrowed(Double totalBorrowed) { this.totalBorrowed = totalBorrowed; }

    public Double getTotalLent() { return totalLent; }
    public void setTotalLent(Double totalLent) { this.totalLent = totalLent; }

    public Double getOverdueBorrowed() { return overdueBorrowed; }
    public void setOverdueBorrowed(Double overdueBorrowed) { this.overdueBorrowed = overdueBorrowed; }

    public Double getOverdueLent() { return overdueLent; }
    public void setOverdueLent(Double overdueLent) { this.overdueLent = overdueLent; }
}
