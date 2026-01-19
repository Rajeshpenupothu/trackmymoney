package com.trackmymoney.backend.service;

import com.trackmymoney.backend.dto.IncomeResponse;
import com.trackmymoney.backend.dto.CreateIncomeRequest;

import java.util.List;

public interface IncomeService {

    IncomeResponse addIncome(CreateIncomeRequest request);
    IncomeResponse updateIncome(Long id, CreateIncomeRequest request);

    void deleteIncome(Long id);

    // 🔐 Logged-in user
    List<IncomeResponse> getIncomesForCurrentUser();

    List<IncomeResponse> getIncomesForCurrentUserByMonth(int year, int month);
}
