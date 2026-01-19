package com.trackmymoney.backend.service;

import com.trackmymoney.backend.dto.CreateTransactionRequest;
import com.trackmymoney.backend.dto.TransactionResponse;
import com.trackmymoney.backend.entity.TransactionType;

import java.util.List;

public interface TransactionService {

    TransactionResponse addTransaction(CreateTransactionRequest request);

    List<TransactionResponse> getTransactionsByType(TransactionType type);

    List<TransactionResponse> getUnsettledTransactions();

    TransactionResponse settleTransaction(Long transactionId);
}
