package com.trackmymoney.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "lendings")
public class Lending {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private Double amount;

    private LocalDate lendDate;
    private LocalDate dueDate;

    @Column(nullable = false)
    private boolean settled = false;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public Long getId() { return id; }
    public String getName() { return name; }
    public Double getAmount() { return amount; }
    public LocalDate getLendDate() { return lendDate; }
    public LocalDate getDueDate() { return dueDate; }
    public boolean isSettled() { return settled; }
    public User getUser() { return user; }

    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setAmount(Double amount) { this.amount = amount; }
    public void setLendDate(LocalDate lendDate) { this.lendDate = lendDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public void setSettled(boolean settled) { this.settled = settled; }
    public void setUser(User user) { this.user = user; }
}
