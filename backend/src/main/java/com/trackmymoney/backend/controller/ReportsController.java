package com.trackmymoney.backend.controller;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.element.Cell;
import com.trackmymoney.backend.entity.*;
import com.trackmymoney.backend.repository.*;
import com.trackmymoney.backend.exception.UserNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportsController {

    @Autowired private UserRepository userRepository;
    @Autowired private ExpenseRepository expenseRepository;
    @Autowired private IncomeRepository incomeRepository;
    @Autowired private BorrowingRepository borrowingRepository;
    @Autowired private LendingRepository lendingRepository;

    /**
     * Generate and download Finance Report PDF for a given month/year
     */
    @GetMapping("/finance-report")
    public ResponseEntity<byte[]> downloadFinanceReport(
            @RequestParam int year,
            @RequestParam String month
    ) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new UserNotFoundException("User not found"));

            // Fetch data for the month
            List<Income> incomes = incomeRepository.findByUser(user);
            List<Expense> expenses = expenseRepository.findByUser(user);
            List<Borrowing> borrowings = borrowingRepository.findByUser(user);
            List<Lending> lendings = lendingRepository.findByUser(user);

            // Calculate totals
            Double totalIncome = incomes.stream()
                    .filter(i -> i.getYear() == year && i.getMonth().equals(month))
                    .mapToDouble(Income::getAmount)
                    .sum();

            Double totalExpense = expenses.stream()
                    .filter(e -> e.getYear() == year && e.getMonth().equals(month))
                    .mapToDouble(Expense::getAmount)
                    .sum();

            Double totalBorrowed = borrowings.stream()
                    .filter(b -> b.getYear() == year)
                    .mapToDouble(Borrowing::getAmount)
                    .sum();

            Double totalLent = lendings.stream()
                    .filter(l -> l.getYear() == year)
                    .mapToDouble(Lending::getAmount)
                    .sum();

            // Generate PDF
            ByteArrayOutputStream pdfStream = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(pdfStream);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            // Title
            document.add(new Paragraph("Finance Summary Report")
                    .setBold()
                    .setFontSize(18));

            document.add(new Paragraph("Period: " + month + " " + year)
                    .setFontSize(12));

            // Data table
            Table table = new Table(2);
            table.addCell(new Cell().add(new Paragraph("Type").setBold()));
            table.addCell(new Cell().add(new Paragraph("Amount (₹)").setBold()));

            table.addCell(new Cell().add(new Paragraph("Income")));
            table.addCell(new Cell().add(new Paragraph(String.format("%.2f", totalIncome))));

            table.addCell(new Cell().add(new Paragraph("Expenses")));
            table.addCell(new Cell().add(new Paragraph(String.format("%.2f", totalExpense))));

            table.addCell(new Cell().add(new Paragraph("Borrowed")));
            table.addCell(new Cell().add(new Paragraph(String.format("%.2f", totalBorrowed))));

            table.addCell(new Cell().add(new Paragraph("Lent")));
            table.addCell(new Cell().add(new Paragraph(String.format("%.2f", totalLent))));

            document.add(table);
            document.close();

            byte[] pdfBytes = pdfStream.toByteArray();

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                            "attachment; filename=Finance_Report_" + month + "_" + year + ".pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfBytes);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Generate and download Expense Report PDF for a given month/year
     */
    @GetMapping("/expense-report")
    public ResponseEntity<byte[]> downloadExpenseReport(
            @RequestParam int year,
            @RequestParam String month
    ) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new UserNotFoundException("User not found"));

            List<Expense> expenses = expenseRepository.findByUser(user);

            // Filter for month
            List<Expense> monthExpenses = expenses.stream()
                    .filter(e -> e.getYear() == year && e.getMonth().equals(month))
                    .sorted((a, b) -> Integer.compare(a.getDay(), b.getDay()))
                    .toList();

            // Generate PDF
            ByteArrayOutputStream pdfStream = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(pdfStream);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            // Title
            document.add(new Paragraph("Expense Report - " + month + " " + year)
                    .setBold()
                    .setFontSize(18));

            // Data table
            Table table = new Table(4);
            table.addCell(new Cell().add(new Paragraph("Date").setBold()));
            table.addCell(new Cell().add(new Paragraph("Title").setBold()));
            table.addCell(new Cell().add(new Paragraph("Category").setBold()));
            table.addCell(new Cell().add(new Paragraph("Amount (₹)").setBold()));

            if (monthExpenses.isEmpty()) {
                table.addCell(new Cell().add(new Paragraph("No data")));
                table.addCell(new Cell().add(new Paragraph("-")));
                table.addCell(new Cell().add(new Paragraph("-")));
                table.addCell(new Cell().add(new Paragraph("-")));
            } else {
                for (Expense e : monthExpenses) {
                    table.addCell(new Cell().add(new Paragraph(
                            String.format("%d %s", e.getDay(), e.getMonth()))));
                    table.addCell(new Cell().add(new Paragraph(e.getTitle() != null ? e.getTitle() : e.getDescription())));
                    table.addCell(new Cell().add(new Paragraph(e.getCategory())));
                    table.addCell(new Cell().add(new Paragraph(String.format("%.2f", e.getAmount()))));
                }
            }

            document.add(table);
            document.close();

            byte[] pdfBytes = pdfStream.toByteArray();

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                            "attachment; filename=Expenses_" + month + "_" + year + ".pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfBytes);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Generate and download Income Report PDF for a given month/year
     */
    @GetMapping("/income-report")
    public ResponseEntity<byte[]> downloadIncomeReport(
            @RequestParam int year,
            @RequestParam String month
    ) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new UserNotFoundException("User not found"));

            List<Income> incomes = incomeRepository.findByUser(user);

            // Filter for month
            List<Income> monthIncomes = incomes.stream()
                    .filter(i -> i.getYear() == year && i.getMonth().equals(month))
                    .toList();

            // Generate PDF
            ByteArrayOutputStream pdfStream = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(pdfStream);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            // Title
            document.add(new Paragraph("Income Report - " + month + " " + year)
                    .setBold()
                    .setFontSize(18));

            // Data table
            Table table = new Table(3);
            table.addCell(new Cell().add(new Paragraph("Date").setBold()));
            table.addCell(new Cell().add(new Paragraph("Source").setBold()));
            table.addCell(new Cell().add(new Paragraph("Amount (₹)").setBold()));

            if (monthIncomes.isEmpty()) {
                table.addCell(new Cell().add(new Paragraph("No data")));
                table.addCell(new Cell().add(new Paragraph("-")));
                table.addCell(new Cell().add(new Paragraph("-")));
            } else {
                for (Income i : monthIncomes) {
                    table.addCell(new Cell().add(new Paragraph(
                            String.format("%d %s", i.getDay(), i.getMonth()))));
                    table.addCell(new Cell().add(new Paragraph(i.getTitle() != null ? i.getTitle() : "Income")));
                    table.addCell(new Cell().add(new Paragraph(String.format("%.2f", i.getAmount()))));
                }
            }

            document.add(table);
            document.close();

            byte[] pdfBytes = pdfStream.toByteArray();

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                            "attachment; filename=Income_" + month + "_" + year + ".pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfBytes);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Generate and download Borrow/Lend Report PDF for a given month/year
     */
    @GetMapping("/borrow-lend-report")
    public ResponseEntity<byte[]> downloadBorrowLendReport(
            @RequestParam int year,
            @RequestParam String month
    ) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new UserNotFoundException("User not found"));

            List<Borrowing> borrowings = borrowingRepository.findByUser(user);
            List<Lending> lendings = lendingRepository.findByUser(user);

            // Generate PDF
            ByteArrayOutputStream pdfStream = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(pdfStream);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            // Title
            document.add(new Paragraph("Borrow & Lend Report - " + month + " " + year)
                    .setBold()
                    .setFontSize(18));

            // Data table
            Table table = new Table(4);
            table.addCell(new Cell().add(new Paragraph("Name").setBold()));
            table.addCell(new Cell().add(new Paragraph("Type").setBold()));
            table.addCell(new Cell().add(new Paragraph("Due Date").setBold()));
            table.addCell(new Cell().add(new Paragraph("Amount (₹)").setBold()));

            for (Borrowing b : borrowings) {
                table.addCell(new Cell().add(new Paragraph(b.getName())));
                table.addCell(new Cell().add(new Paragraph("Borrowed")));
                table.addCell(new Cell().add(new Paragraph(
                        String.format("%d %s", b.getDueDay(), b.getDueDate()))));
                table.addCell(new Cell().add(new Paragraph(String.format("%.2f", b.getAmount()))));
            }

            for (Lending l : lendings) {
                table.addCell(new Cell().add(new Paragraph(l.getName())));
                table.addCell(new Cell().add(new Paragraph("Lent")));
                table.addCell(new Cell().add(new Paragraph(
                        String.format("%d %s", l.getDueDay(), l.getDueDate()))));
                table.addCell(new Cell().add(new Paragraph(String.format("%.2f", l.getAmount()))));
            }

            document.add(table);
            document.close();

            byte[] pdfBytes = pdfStream.toByteArray();

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                            "attachment; filename=Borrow_Lend_" + month + "_" + year + ".pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfBytes);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
}
