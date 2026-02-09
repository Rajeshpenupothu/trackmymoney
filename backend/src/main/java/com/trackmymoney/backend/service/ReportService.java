package com.trackmymoney.backend.service;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.trackmymoney.backend.entity.*;
import com.trackmymoney.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Month;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ReportService {

    @Autowired private IncomeRepository incomeRepository;
    @Autowired private ExpenseRepository expenseRepository;
    @Autowired private BorrowingRepository borrowingRepository;
    @Autowired private LendingRepository lendingRepository;

    // --- Report 1: Finance Summary ---
    public byte[] generateFinanceReport(User user, int year, String monthStr) {
        LocalDate start = getStartDate(year, monthStr);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());

        List<Income> incomes = incomeRepository.findByUserAndIncomeDateBetween(user, start, end);
        List<Expense> expenses = expenseRepository.findByUserAndExpenseDateBetween(user, start, end);
        List<Borrowing> borrowings = borrowingRepository.findByUserAndDueDateBetween(user, start, end);
        List<Lending> lendings = lendingRepository.findByUserAndDueDateBetween(user, start, end);

        BigDecimal totalIncome = incomes.stream().map(Income::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalExpense = expenses.stream().map(Expense::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalBorrowed = borrowings.stream().map(Borrowing::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalLent = lendings.stream().map(Lending::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

        return createPdf(doc -> {
            addTitle(doc, "Finance Summary Report", monthStr, year);
            
            Table table = new Table(2);
            addHeaderCell(table, "Type", "Amount");
            
            addRow(table, "Income", totalIncome);
            addRow(table, "Expenses", totalExpense);
            addRow(table, "Borrowed (Due this month)", totalBorrowed);
            addRow(table, "Lent (Due this month)", totalLent);
            
            doc.add(table);
        });
    }

    // --- Report 2: Expenses ---
    public byte[] generateExpenseReport(User user, int year, String monthStr) {
        LocalDate start = getStartDate(year, monthStr);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        
        List<Expense> expenses = expenseRepository.findByUserAndExpenseDateBetween(user, start, end);

        return createPdf(doc -> {
            addTitle(doc, "Expense Report", monthStr, year);
            Table table = new Table(4);
            addHeaderCell(table, "Date", "Description", "Category", "Amount");

            if (expenses.isEmpty()) {
                addEmptyRow(table, 4);
            } else {
                for (Expense e : expenses) {
                    table.addCell(new Cell().add(new Paragraph(formatDate(e.getExpenseDate()))));
                    table.addCell(new Cell().add(new Paragraph(e.getDescription() != null ? e.getDescription() : "-")));
                    table.addCell(new Cell().add(new Paragraph(e.getCategory())));
                    table.addCell(new Cell().add(new Paragraph(formatMoney(e.getAmount()))));
                }
            }
            doc.add(table);
        });
    }

    // --- Report 3: Income ---
    public byte[] generateIncomeReport(User user, int year, String monthStr) {
        LocalDate start = getStartDate(year, monthStr);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        
        List<Income> incomes = incomeRepository.findByUserAndIncomeDateBetween(user, start, end);

        return createPdf(doc -> {
            addTitle(doc, "Income Report", monthStr, year);
            Table table = new Table(3);
            addHeaderCell(table, "Date", "Source", "Amount");

            if (incomes.isEmpty()) {
                addEmptyRow(table, 3);
            } else {
                for (Income i : incomes) {
                    table.addCell(new Cell().add(new Paragraph(formatDate(i.getIncomeDate()))));
                    table.addCell(new Cell().add(new Paragraph(i.getSource())));
                    table.addCell(new Cell().add(new Paragraph(formatMoney(i.getAmount()))));
                }
            }
            doc.add(table);
        });
    }

    // --- Report 4: Borrowing & Lending ---
    public byte[] generateBorrowLendReport(User user, int year, String monthStr) {
        LocalDate start = getStartDate(year, monthStr);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());

        List<Borrowing> borrowings = borrowingRepository.findByUserAndDueDateBetween(user, start, end);
        List<Lending> lendings = lendingRepository.findByUserAndDueDateBetween(user, start, end);

        return createPdf(doc -> {
            addTitle(doc, "Borrow & Lend Report", monthStr, year);
            Table table = new Table(4);
            addHeaderCell(table, "Name", "Type", "Due Date", "Amount");

            if (borrowings.isEmpty() && lendings.isEmpty()) {
                addEmptyRow(table, 4);
            } else {
                for (Borrowing b : borrowings) {
                    table.addCell(new Cell().add(new Paragraph(b.getName())));
                    table.addCell(new Cell().add(new Paragraph("Borrowed")));
                    table.addCell(new Cell().add(new Paragraph(formatDate(b.getDueDate()))));
                    table.addCell(new Cell().add(new Paragraph(formatMoney(b.getAmount()))));
                }
                for (Lending l : lendings) {
                    table.addCell(new Cell().add(new Paragraph(l.getName())));
                    table.addCell(new Cell().add(new Paragraph("Lent")));
                    table.addCell(new Cell().add(new Paragraph(formatDate(l.getDueDate()))));
                    table.addCell(new Cell().add(new Paragraph(formatMoney(l.getAmount()))));
                }
            }
            doc.add(table);
        });
    }

    // --- Helpers ---

    private LocalDate getStartDate(int year, String monthStr) {
        try {
            Month month = Month.valueOf(monthStr.toUpperCase());
            return LocalDate.of(year, month, 1);
        } catch (IllegalArgumentException e) {
            // Fallback if user sends "Jan" instead of "JANUARY"
            // You might want to handle this more robustly or ensure frontend sends full names
            throw new RuntimeException("Invalid month: " + monthStr);
        }
    }

    private String formatDate(LocalDate date) {
        return date.format(DateTimeFormatter.ofPattern("dd MMM yyyy"));
    }

    private String formatMoney(BigDecimal amount) {
        return "Rs. " + String.format("%.2f", amount);
    }

    private byte[] createPdf(java.util.function.Consumer<Document> contentGenerator) {
        try (ByteArrayOutputStream pdfStream = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(pdfStream);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);
            contentGenerator.accept(document);
            document.close();
            return pdfStream.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF", e);
        }
    }

    private void addTitle(Document doc, String title, String month, int year) {
        doc.add(new Paragraph(title).setBold().setFontSize(18));
        doc.add(new Paragraph("Period: " + month + " " + year).setFontSize(12).setMarginBottom(10));
    }

    private void addHeaderCell(Table table, String... headers) {
        for (String header : headers) {
            table.addCell(new Cell().add(new Paragraph(header).setBold()));
        }
    }

    private void addRow(Table table, String label, BigDecimal amount) {
        table.addCell(new Cell().add(new Paragraph(label)));
        table.addCell(new Cell().add(new Paragraph(formatMoney(amount))));
    }
    
    private void addEmptyRow(Table table, int cols) {
        table.addCell(new Cell().add(new Paragraph("No Data")));
        for(int i=1; i<cols; i++) table.addCell(new Cell().add(new Paragraph("-")));
    }
}