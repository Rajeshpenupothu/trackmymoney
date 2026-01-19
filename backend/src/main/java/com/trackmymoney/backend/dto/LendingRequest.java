package com.trackmymoney.backend.dto;

import java.time.LocalDate;

public record LendingRequest(
        String name,
        Double amount,
        LocalDate lendDate,
        LocalDate dueDate
) {}
