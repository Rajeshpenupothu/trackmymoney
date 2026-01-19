package com.trackmymoney.backend.service;

import com.trackmymoney.backend.dto.MonthlySummaryResponse;

public interface SummaryService {

    MonthlySummaryResponse getMonthlySummary(int year, int month);
}
