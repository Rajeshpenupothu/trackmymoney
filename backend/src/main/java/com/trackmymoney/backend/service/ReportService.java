package com.trackmymoney.backend.service;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.canvas.draw.SolidLine;
import com.itextpdf.layout.element.LineSeparator;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.trackmymoney.backend.entity.*;
import com.trackmymoney.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
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
            addTitle(doc, "Finance Summary Report", monthStr, year, user);
            
            Table table = new Table(UnitValue.createPercentArray(new float[]{70, 30})).useAllAvailableWidth();
            addHeaderCell(table, "Type", "Amount");
            
            addRow(table, "Total Income", totalIncome);
            addRow(table, "Total Expenses", totalExpense);
            addRow(table, "Total Borrowed (Due this month)", totalBorrowed);
            addRow(table, "Total Lent (Due this month)", totalLent);
            
            doc.add(table);
        });
    }

    // --- Report 2: Expenses ---
    public byte[] generateExpenseReport(User user, int year, String monthStr) {
        LocalDate start = getStartDate(year, monthStr);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        
        List<Expense> expenses = expenseRepository.findByUserAndExpenseDateBetween(user, start, end);

        return createPdf(doc -> {
            addTitle(doc, "Expense Report", monthStr, year, user);
            Table table = new Table(UnitValue.createPercentArray(new float[]{20, 40, 20, 20})).useAllAvailableWidth();
            addHeaderCell(table, "Date", "Description", "Category", "Amount");

            if (expenses.isEmpty()) {
                addEmptyRow(table, 4);
            } else {
                for (Expense e : expenses) {
                    table.addCell(new Cell().add(new Paragraph(formatDate(e.getExpenseDate()))).setPadding(5));
                    table.addCell(new Cell().add(new Paragraph(e.getDescription() != null ? e.getDescription() : "-")).setPadding(5));
                    table.addCell(new Cell().add(new Paragraph(e.getCategory())).setPadding(5));
                    table.addCell(new Cell().add(new Paragraph(formatMoney(e.getAmount())))
                            .setTextAlignment(TextAlignment.RIGHT).setPadding(5));
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
            addTitle(doc, "Income Report", monthStr, year, user);
            Table table = new Table(UnitValue.createPercentArray(new float[]{25, 50, 25})).useAllAvailableWidth();
            addHeaderCell(table, "Date", "Source", "Amount");

            if (incomes.isEmpty()) {
                addEmptyRow(table, 3);
            } else {
                for (Income i : incomes) {
                    table.addCell(new Cell().add(new Paragraph(formatDate(i.getIncomeDate()))).setPadding(5));
                    table.addCell(new Cell().add(new Paragraph(i.getSource())).setPadding(5));
                    table.addCell(new Cell().add(new Paragraph(formatMoney(i.getAmount())))
                            .setTextAlignment(TextAlignment.RIGHT).setPadding(5));
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
            addTitle(doc, "Borrow & Lend Report", monthStr, year, user);
            Table table = new Table(UnitValue.createPercentArray(new float[]{30, 20, 25, 25})).useAllAvailableWidth();
            addHeaderCell(table, "Name", "Type", "Due Date", "Amount");

            if (borrowings.isEmpty() && lendings.isEmpty()) {
                addEmptyRow(table, 4);
            } else {
                for (Borrowing b : borrowings) {
                    table.addCell(new Cell().add(new Paragraph(b.getName())).setPadding(5));
                    table.addCell(new Cell().add(new Paragraph("Borrowed")).setPadding(5));
                    table.addCell(new Cell().add(new Paragraph(formatDate(b.getDueDate()))).setPadding(5));
                    table.addCell(new Cell().add(new Paragraph(formatMoney(b.getAmount())))
                            .setTextAlignment(TextAlignment.RIGHT).setPadding(5));
                }
                for (Lending l : lendings) {
                    table.addCell(new Cell().add(new Paragraph(l.getName())).setPadding(5));
                    table.addCell(new Cell().add(new Paragraph("Lent")).setPadding(5));
                    table.addCell(new Cell().add(new Paragraph(formatDate(l.getDueDate()))).setPadding(5));
                    table.addCell(new Cell().add(new Paragraph(formatMoney(l.getAmount())))
                            .setTextAlignment(TextAlignment.RIGHT).setPadding(5));
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
        return "Rs. " + String.format("%,.2f", amount);
    }

    private byte[] createPdf(java.util.function.Consumer<Document> contentGenerator) {
        try (ByteArrayOutputStream pdfStream = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(pdfStream);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);
            contentGenerator.accept(document);
            
            // Add Footer
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy 'at' hh:mm a"));
            document.add(new Paragraph("\nGenerated by TrackMyMoney on " + timestamp)
                .setFontSize(9).setItalic().setOpacity(0.6f).setTextAlignment(TextAlignment.CENTER));
            
            document.close();
            return pdfStream.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF", e);
        }
    }

    private void addTitle(Document doc, String title, String month, int year, User user) {
        DeviceRgb indigo = new DeviceRgb(79, 70, 229);
        
        // Header Table for Brand and User Info
        Table headerTable = new Table(UnitValue.createPercentArray(new float[]{60, 40})).useAllAvailableWidth();
        headerTable.setBorder(com.itextpdf.layout.borders.Border.NO_BORDER);
        
        Cell brandCell = new Cell().add(new Paragraph("TrackMyMoney").setBold().setFontSize(24).setFontColor(indigo))
                .setBorder(com.itextpdf.layout.borders.Border.NO_BORDER);
        headerTable.addCell(brandCell);
        
        Cell userCell = new Cell().add(new Paragraph("Prepared for:\n" + user.getName() + "\n" + user.getEmail())
                .setFontSize(9).setTextAlignment(TextAlignment.RIGHT).setItalic().setOpacity(0.8f))
                .setBorder(com.itextpdf.layout.borders.Border.NO_BORDER);
        headerTable.addCell(userCell);
        
        doc.add(headerTable);
        doc.add(new LineSeparator(new SolidLine(1f)).setMarginBottom(15).setOpacity(0.3f));
        
        doc.add(new Paragraph(title).setBold().setFontSize(18).setMarginBottom(2));
        doc.add(new Paragraph("Financial Statement: " + month + " " + year).setFontSize(11).setItalic().setMarginBottom(20));
    }

    private void addHeaderCell(Table table, String... headers) {
        DeviceRgb indigo = new DeviceRgb(79, 70, 229);
        for (String header : headers) {
            table.addCell(new Cell().add(new Paragraph(header).setBold().setFontColor(new DeviceRgb(255, 255, 255)))
                .setBackgroundColor(indigo)
                .setPadding(8));
        }
    }

    private void addRow(Table table, String label, BigDecimal amount) {
        table.addCell(new Cell().add(new Paragraph(label)).setPadding(5));
        table.addCell(new Cell().add(new Paragraph(formatMoney(amount)))
            .setTextAlignment(TextAlignment.RIGHT).setPadding(5));
    }
    
    private void addEmptyRow(Table table, int cols) {
        table.addCell(new Cell().add(new Paragraph("No Data")));
        for(int i=1; i<cols; i++) table.addCell(new Cell().add(new Paragraph("-")));
    }
}