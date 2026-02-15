package com.trackmymoney.backend.service.impl;

import com.trackmymoney.backend.dto.CreateUserRequest;
import com.trackmymoney.backend.dto.UserResponse;
import com.trackmymoney.backend.entity.User;
import com.trackmymoney.backend.exception.DuplicateEmailException;
import com.trackmymoney.backend.exception.UserNotFoundException;
import com.trackmymoney.backend.repository.*;
import com.trackmymoney.backend.service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final IncomeRepository incomeRepository;
    private final ExpenseRepository expenseRepository;
    private final BorrowingRepository borrowingRepository;
    private final LendingRepository lendingRepository;
    private final TransactionRepository transactionRepository;

    public UserServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           IncomeRepository incomeRepository,
                           ExpenseRepository expenseRepository,
                           BorrowingRepository borrowingRepository,
                           LendingRepository lendingRepository,
                           TransactionRepository transactionRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.incomeRepository = incomeRepository;
        this.expenseRepository = expenseRepository;
        this.borrowingRepository = borrowingRepository;
        this.lendingRepository = lendingRepository;
        this.transactionRepository = transactionRepository;
    }

    @Override
    public UserResponse createUser(CreateUserRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new DuplicateEmailException("Email already exists");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        User saved = userRepository.save(user);

        return new UserResponse(
                saved.getId(),
                saved.getName(),
                saved.getEmail(),
                saved.getCreatedAt()
        );
    }

    @Override
    public UserResponse getUserById(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new UserNotFoundException("User not found with id: " + id));

        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getCreatedAt()
        );
    }

    @Override
    public UserResponse getUserByEmail(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException("User not found with email: " + email));

        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getCreatedAt()
        );
    }

    @Override
    public Long findIdByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException("User not found with email: " + email));
        return user.getId();
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void resetAccount(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException("User not found with email: " + email));

        incomeRepository.deleteByUser(user);
        expenseRepository.deleteByUser(user);
        borrowingRepository.deleteByUser(user);
        lendingRepository.deleteByUser(user);
        transactionRepository.deleteByUserId(user.getId());
    }
}
