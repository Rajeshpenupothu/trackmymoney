package com.trackmymoney.backend.controller;

import com.trackmymoney.backend.entity.User;
import com.trackmymoney.backend.exception.UserNotFoundException;
import com.trackmymoney.backend.repository.UserRepository;
import com.trackmymoney.backend.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
public class ReportsController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReportService reportService;

    /**
     * Helper method to get the currently logged-in user.
     */
    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
    }

    /**
     * Helper method to send the PDF bytes back to the browser with correct headers.
     */
    private ResponseEntity<byte[]> servePdf(byte[] pdfContent, String filename) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfContent);
    }

    // ==================== ENDPOINTS ====================

    @GetMapping("/finance-report")
    public ResponseEntity<byte[]> downloadFinanceReport(
            @RequestParam int year, 
            @RequestParam String month) {
        
        User user = getAuthenticatedUser();
        byte[] pdfBytes = reportService.generateFinanceReport(user, year, month);
        
        return servePdf(pdfBytes, "Finance_Report_" + month + "_" + year + ".pdf");
    }

    @GetMapping("/expense-report")
    public ResponseEntity<byte[]> downloadExpenseReport(
            @RequestParam int year, 
            @RequestParam String month) {
        
        User user = getAuthenticatedUser();
        byte[] pdfBytes = reportService.generateExpenseReport(user, year, month);
        
        return servePdf(pdfBytes, "Expenses_" + month + "_" + year + ".pdf");
    }

    @GetMapping("/income-report")
    public ResponseEntity<byte[]> downloadIncomeReport(
            @RequestParam int year, 
            @RequestParam String month) {
        
        User user = getAuthenticatedUser();
        byte[] pdfBytes = reportService.generateIncomeReport(user, year, month);
        
        return servePdf(pdfBytes, "Income_" + month + "_" + year + ".pdf");
    }

    @GetMapping("/borrow-lend-report")
    public ResponseEntity<byte[]> downloadBorrowLendReport(
            @RequestParam int year, 
            @RequestParam String month) {
        
        User user = getAuthenticatedUser();
        byte[] pdfBytes = reportService.generateBorrowLendReport(user, year, month);
        
        return servePdf(pdfBytes, "Borrow_Lend_" + month + "_" + year + ".pdf");
    }
}