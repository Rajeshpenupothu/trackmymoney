package com.trackmymoney.backend.service.impl;

import com.trackmymoney.backend.dto.CreateIncomeRequest;
import com.trackmymoney.backend.dto.IncomeResponse;
import com.trackmymoney.backend.entity.Income;
import com.trackmymoney.backend.entity.User;
import com.trackmymoney.backend.exception.UserNotFoundException;
import com.trackmymoney.backend.repository.IncomeRepository;
import com.trackmymoney.backend.repository.UserRepository;
import com.trackmymoney.backend.security.SecurityUtils;
import com.trackmymoney.backend.service.IncomeService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class IncomeServiceImpl implements IncomeService {

    private final IncomeRepository incomeRepository;
    private final UserRepository userRepository;

    public IncomeServiceImpl(
            IncomeRepository incomeRepository,
            UserRepository userRepository
    ) {
        this.incomeRepository = incomeRepository;
        this.userRepository = userRepository;
    }

    private User getLoggedInUser() {
        String email = SecurityUtils.getCurrentUserEmail();
        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException("User not found with email: " + email)
                );
    }

    @Override
    public IncomeResponse addIncome(CreateIncomeRequest request) {

        User user = getLoggedInUser();

        Income income = new Income();
        income.setAmount(request.getAmount());
        income.setSource(request.getSource());
        income.setDescription(request.getDescription());
        income.setIncomeDate(request.getIncomeDate());
        income.setUser(user);

        return mapToResponse(incomeRepository.save(income));
    }

    @Override
    public IncomeResponse updateIncome(Long id, CreateIncomeRequest request) {

        User user = getLoggedInUser();

        Income income = incomeRepository
                .findByIdAndUser(id, user)
                .orElseThrow(() ->
                        new RuntimeException("Income not found")
                );

        income.setAmount(request.getAmount());
        income.setSource(request.getSource());
        income.setDescription(request.getDescription());
        income.setIncomeDate(request.getIncomeDate());

        return mapToResponse(incomeRepository.save(income));
    }


    @Override
    public void deleteIncome(Long id) {

        User user = getLoggedInUser();

        Income income = incomeRepository
                .findByIdAndUser(id, user)
                .orElseThrow(() ->
                        new RuntimeException("Income not found")
                );

        incomeRepository.delete(income);
    }

    @Override
    public List<IncomeResponse> getIncomesForCurrentUser() {

        User user = getLoggedInUser();

        return incomeRepository.findByUser(user)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // 📆 GET by month (existing – unchanged)
    @Override
    public List<IncomeResponse> getIncomesForCurrentUserByMonth(
            int year,
            int month
    ) {

        User user = getLoggedInUser();

        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());

        return incomeRepository
                .findByUserAndIncomeDateBetween(user, start, end)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private IncomeResponse mapToResponse(Income income) {
        return new IncomeResponse(
                income.getId(),
                income.getAmount(),
                income.getSource(),
                income.getDescription(),
                income.getIncomeDate()
        );
    }
}
