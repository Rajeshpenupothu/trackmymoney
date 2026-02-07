package com.trackmymoney.backend.dto;

import java.time.LocalDate;

public record LendingResponse(
        Long id,
        String name,
        Double amount,
        LocalDate lendDate,
        LocalDate dueDate,
        boolean settled
) {}
