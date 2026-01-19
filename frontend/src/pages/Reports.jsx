import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import { useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function Reports({ incomes, expenses, borrowings, lendings }) {
  const today = new Date();

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(
    today.toLocaleString("default", { month: "long" })
  );

  /* ===== MONTHLY TOTALS ===== */
  const mIncome = incomes
    .filter((i) => i.year === year && i.month === month)
    .reduce((s, i) => s + i.amount, 0);

  const mExpenses = expenses
    .filter((e) => e.year === year && e.month === month)
    .reduce((s, e) => s + e.amount, 0);

  const mBorrowed = borrowings
    .filter((b) => b.year === year && b.month === month)
    .reduce((s, b) => s + b.amount, 0);

  const mLent = lendings
    .filter((l) => l.year === year && l.month === month)
    .reduce((s, l) => s + l.amount, 0);

  /* ===== YEARLY TOTALS ===== */
  const yIncome = incomes
    .filter((i) => i.year === year)
    .reduce((s, i) => s + i.amount, 0);

  const yExpenses = expenses
    .filter((e) => e.year === year)
    .reduce((s, e) => s + e.amount, 0);

  const yBorrowed = borrowings
    .filter((b) => b.year === year)
    .reduce((s, b) => s + b.amount, 0);

  const yLent = lendings
    .filter((l) => l.year === year)
    .reduce((s, l) => s + l.amount, 0);

  /* ===== OVERDUE ===== */
  const overdueBorrowings = borrowings.filter((b) => {
    const due = new Date(b.dueDate);
    return due < today;
  });

  const overdueLendings = lendings.filter((l) => {
    const due = new Date(l.dueDate);
    return due < today;
  });

  const overdueBorrowedAmount = overdueBorrowings.reduce(
    (s, b) => s + b.amount,
    0
  );

  const overdueLentAmount = overdueLendings.reduce(
    (s, l) => s + l.amount,
    0
  );

  /* ===== CHART DATA ===== */
  const monthlyChartData = [
    { name: "Income", amount: mIncome },
    { name: "Expenses", amount: mExpenses },
    { name: "Borrowed", amount: mBorrowed },
    { name: "Lent", amount: mLent },
  ];

  const yearlyChartData = [
    { name: "Income", amount: yIncome },
    { name: "Expenses", amount: yExpenses },
    { name: "Borrowed", amount: yBorrowed },
    { name: "Lent", amount: yLent },
  ];

  /* ===== PDF EXPORT ===== */
  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Financial Report", 14, 15);

    doc.setFontSize(12);
    doc.text(`Year: ${year}`, 14, 25);
    doc.text(`Month: ${month}`, 14, 32);

    doc.text("Monthly Summary", 14, 45);
    doc.autoTable({
      startY: 50,
      head: [["Type", "Amount"]],
      body: [
        ["Income", mIncome],
        ["Expenses", mExpenses],
        ["Borrowed", mBorrowed],
        ["Lent", mLent],
      ],
    });

    doc.text("Yearly Summary", 14, doc.lastAutoTable.finalY + 15);
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 20,
      head: [["Type", "Amount"]],
      body: [
        ["Income", yIncome],
        ["Expenses", yExpenses],
        ["Borrowed", yBorrowed],
        ["Lent", yLent],
      ],
    });

    doc.text("Overdue Borrowings", 14, doc.lastAutoTable.finalY + 15);
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 20,
      head: [["Name", "Amount"]],
      body:
        overdueBorrowings.length === 0
          ? [["None", "-"]]
          : overdueBorrowings.map((b) => [b.name, b.amount]),
    });

    doc.text("Overdue Lendings", 14, doc.lastAutoTable.finalY + 15);
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 20,
      head: [["Name", "Amount"]],
      body:
        overdueLendings.length === 0
          ? [["None", "-"]]
          : overdueLendings.map((l) => [l.name, l.amount]),
    });

    doc.save(`Report_${year}_${month}.pdf`);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reports</h1>

      {/* FILTER */}
      <div className="flex gap-3 mb-4">
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="border px-3 py-2 rounded"
        >
          {[2024, 2025, 2026].map((y) => (
            <option key={y}>{y}</option>
          ))}
        </select>

        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          {MONTHS.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>

        <button
          onClick={downloadPDF}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Download PDF
        </button>
      </div>

      {/* MONTHLY CHART */}
      <div className="bg-white rounded-xl shadow p-4 h-72 mb-8">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="amount" fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* YEARLY CHART */}
      <div className="bg-white rounded-xl shadow p-4 h-72 mb-10">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={yearlyChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="amount" fill="#16a34a" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* OVERDUE */}
      <h2 className="text-xl font-semibold mb-4">Overdue Summary</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-red-100 rounded-xl p-4">
          <h3 className="font-semibold text-red-800 mb-2">
            Overdue Borrowed
          </h3>
          <p className="text-2xl font-bold mb-3">
            ₹{overdueBorrowedAmount}
          </p>

          {overdueBorrowings.map((b) => (
            <div key={b.id} className="text-sm mb-1">
              {b.name} · ₹{b.amount}
            </div>
          ))}
        </div>

        <div className="bg-yellow-100 rounded-xl p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">
            Overdue Lent
          </h3>
          <p className="text-2xl font-bold mb-3">
            ₹{overdueLentAmount}
          </p>

          {overdueLendings.map((l) => (
            <div key={l.id} className="text-sm mb-1">
              {l.name} · ₹{l.amount}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Reports;
