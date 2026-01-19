package com.trackmymoney.backend.service.impl;

import com.trackmymoney.backend.dto.CreateTransactionRequest;
import com.trackmymoney.backend.dto.TransactionResponse;
import com.trackmymoney.backend.entity.Transaction;
import com.trackmymoney.backend.entity.TransactionType;
import com.trackmymoney.backend.entity.User;
import com.trackmymoney.backend.exception.UserNotFoundException;
import com.trackmymoney.backend.repository.TransactionRepository;
import com.trackmymoney.backend.repository.UserRepository;
import com.trackmymoney.backend.security.SecurityUtils;
import com.trackmymoney.backend.service.TransactionService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public TransactionServiceImpl(
            TransactionRepository transactionRepository,
            UserRepository userRepository
    ) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    // 1️⃣ Add transaction (BORROW / LEND)
    @Override
    public TransactionResponse addTransaction(CreateTransactionRequest request) {

        User user = getLoggedInUser();

        Transaction transaction = new Transaction();
        transaction.setAmount(request.getAmount());
        transaction.setDescription(request.getDescription());
        transaction.setType(request.getType());
        transaction.setSettled(false);
        transaction.setUser(user);

        Transaction saved = transactionRepository.save(transaction);

        return mapToResponse(saved);
    }

    // 2️⃣ Get transactions by type (BORROW / LEND)
    @Override
    public List<TransactionResponse> getTransactionsByType(TransactionType type) {

        User user = getLoggedInUser();

        return transactionRepository
                .findByUserIdAndType(user.getId(), type)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // 3️⃣ Get unsettled transactions
    @Override
    public List<TransactionResponse> getUnsettledTransactions() {

        User user = getLoggedInUser();

        return transactionRepository
                .findByUserIdAndSettledFalse(user.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // 4️⃣ Settle a transaction
    @Override
    public TransactionResponse settleTransaction(Long transactionId) {

        User user = getLoggedInUser();

        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() ->
                        new RuntimeException("Transaction not found with id: " + transactionId)
                );

        // 🔒 Extra safety: ensure transaction belongs to logged-in user
        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to settle this transaction");
        }

        transaction.setSettled(true);
        Transaction saved = transactionRepository.save(transaction);

        return mapToResponse(saved);
    }

    // 🔐 Resolve logged-in user from JWT
    private User getLoggedInUser() {
        String email = SecurityUtils.getCurrentUserEmail();

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException("User not found with email: " + email)
                );
    }

    // 🔁 DTO mapper
    private TransactionResponse mapToResponse(Transaction transaction) {
        return new TransactionResponse(
                transaction.getId(),
                transaction.getAmount(),
                transaction.getDescription(),
                transaction.getType(),
                transaction.isSettled()
        );
    }
}
