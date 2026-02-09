import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function Reports({ incomes, expenses, borrowings, lendings, loading }) {
  const today = new Date();

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(
    today.toLocaleString("default", { month: "long" })
  );
  const [showDownloads, setShowDownloads] = useState(false);

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-zinc-800 dark:text-zinc-100">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p>Loading reports data...</p>
      </div>
    );
  }

  // Show message if no data after loading
  if (!loading && incomes.length === 0 && expenses.length === 0 && borrowings.length === 0 && lendings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-zinc-800 dark:text-zinc-100">
        <p className="text-lg">No data available for reports.</p>
        <p className="text-sm text-zinc-500">Add some transactions first.</p>
      </div>
    );
  }


  /* ===== TOTALS ===== */
  const mIncome = incomes.filter(i => i.year === year && i.month === month)
    .reduce((s, i) => s + i.amount, 0);

  const mExpenses = expenses.filter(e => e.year === year && e.month === month)
    .reduce((s, e) => s + e.amount, 0);

  const yIncome = incomes.filter(i => i.year === year)
    .reduce((s, i) => s + i.amount, 0);

  const yExpenses = expenses.filter(e => e.year === year)
    .reduce((s, e) => s + e.amount, 0);

  const yBorrowed = borrowings.filter(b => b.year === year)
    .reduce((s, b) => s + b.amount, 0);

  const yLent = lendings.filter(l => l.year === year)
    .reduce((s, l) => s + l.amount, 0);

    /* ===== PIE DATA (MONEY FLOW) ===== */
const flowData = [
  { name: "Income", value: mIncome },
  { name: "Expenses", value: mExpenses },
  { name: "Borrowed", value: yBorrowed },
  { name: "Lent", value: yLent },
];


  /* ===== PIE DATA (CATEGORY) ===== */
  const categoryData = Object.values(
    expenses
      .filter(e => e.year === year && e.month === month)
      .reduce((acc, e) => {
        if (!acc[e.category]) {
          acc[e.category] = { name: e.category, value: 0 };
        }
        acc[e.category].value += e.amount;
        return acc;
      }, {})
  );

  /* ===== PDF EXPORT ===== */
  const downloadPDF = () => {
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.text("TrackMyMoney - Expense Report", 14, 20);

  doc.setFontSize(12);
  doc.text(`Month: ${month} ${year}`, 14, 30);

  // Filter expenses for month
  const expenseRows = expenses
    .filter(e => e.year === year && e.month === month)
    .sort((a, b) => a.day - b.day)
    .map(e => [
      `${e.day} ${e.month}`,
      e.title || e.description,
      e.category,
      e.amount,
    ]);

  autoTable(doc, {
    startY: 40,
    head: [["Date", "Title", "Category", "Amount (₹)"]],
    body: expenseRows.length ? expenseRows : [["No expenses", "-", "-", "-"]],
  });

  doc.save(`Expenses_${month}_${year}.pdf`);
};
const downloadFinanceReport = () => {
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.text("Finance Summary Report", 14, 20);
  doc.text(`Period: ${month} ${year}`, 14, 30);

  autoTable(doc, {
    startY: 40,
    head: [["Type", "Amount (₹)"]],
    body: [
      ["Income", mIncome],
      ["Expenses", mExpenses],
      ["Borrowed", yBorrowed],
      ["Lent", yLent],
    ],
  });

  doc.save(`Finance_Report_${month}_${year}.pdf`);
};
const downloadExpenseReport = () => {
  const doc = new jsPDF();

  doc.text(`Expense Report - ${month} ${year}`, 14, 20);

  const rows = expenses
    .filter(e => e.year === year && e.month === month)
    .sort((a, b) => a.day - b.day)
    .map(e => [
      `${e.day} ${e.month}`,
      e.title || e.description,
      e.category,
      e.amount,
    ]);

  autoTable(doc, {
    startY: 30,
    head: [["Date", "Title", "Category", "Amount (₹)"]],
    body: rows.length ? rows : [["No data", "-", "-", "-"]],
  });

  doc.save(`Expenses_${month}_${year}.pdf`);
};
const downloadIncomeReport = () => {
  const doc = new jsPDF();

  doc.text(`Income Report - ${month} ${year}`, 14, 20);

  const rows = incomes
    .filter(i => i.year === year && i.month === month)
    .map(i => [
      `${i.day} ${i.month}`,
      i.title || "Income",
      i.amount,
    ]);

  autoTable(doc, {
    startY: 30,
    head: [["Date", "Source", "Amount (₹)"]],
    body: rows.length ? rows : [["No data", "-", "-"]],
  });

  doc.save(`Income_${month}_${year}.pdf`);
};
const downloadBorrowLendReport = () => {
  const doc = new jsPDF();

  doc.text(`Borrow & Lend Report - ${month} ${year}`, 14, 20);

  const borrowRows = borrowings.map(b => [
    b.name,
    "Borrowed",
    `${b.dueDay} ${b.month}`,
    b.amount,
  ]);

  const lendRows = lendings.map(l => [
    l.name,
    "Lent",
    `${l.dueDay} ${l.month}`,
    l.amount,
  ]);

  autoTable(doc, {
    startY: 30,
    head: [["Name", "Type", "Due Date", "Amount (₹)"]],
    body: [...borrowRows, ...lendRows],
  });

  doc.save(`Borrow_Lend_${month}_${year}.pdf`);
};


  return (
  <div className="text-zinc-800 dark:text-zinc-100">
    <h1 className="text-2xl font-bold mb-6">Reports</h1>
{/* FILTERS */}
{/* FILTERS — Same as Home */}
<div className="flex gap-4 mb-6">
  <select
    value={year}
    onChange={(e) => setYear(Number(e.target.value))}
    className="input w-48"
  >
    {[2024, 2025, 2026].map((y) => (
      <option key={y}>{y}</option>
    ))}
  </select>

  <select
    value={month}
    onChange={(e) => setMonth(e.target.value)}
    className="input w-48"
  >
    {MONTHS.map((m) => (
      <option key={m}>{m}</option>
    ))}
  </select>
</div>


{/* DOWNLOAD BUTTON */}
<div className="mb-6">
  <button
    onClick={() => setShowDownloads(!showDownloads)}
    disabled={loading}
    className={`btn w-full ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
  >
    {loading ? "Loading data..." : "Download Report"}
  </button>

  {showDownloads && (
  <div className="mt-4 max-w-md space-y-4">

    <button
      onClick={downloadFinanceReport}
      className="w-full flex items-center gap-3 p-3 rounded-lg
           bg-zinc-800 border border-zinc-700
           hover:bg-zinc-700 hover:border-zinc-500
           transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"

    >
      <span className="text-2xl">📊</span>
      <div className="text-left">
        <p className="font-medium text-white text-sm">Finance Report</p>
        <p className="text-[11px] text-zinc-400">Summary of income, expenses, borrow & lend</p>
      </div>
    </button>

    <button
      onClick={downloadExpenseReport}
      className="w-full flex items-center gap-3 p-3 rounded-lg
           bg-zinc-800 border border-zinc-700
           hover:bg-zinc-700 hover:border-zinc-500
           transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"

    >
      <span className="text-2xl">🧾</span>
      <div className="text-left">
        <p className="font-medium text-white text-sm">Expense Report</p>
        <p className="text-[11px] text-zinc-400">Detailed monthly expense list</p>
      </div>
    </button>

    <button
      onClick={downloadIncomeReport}
      className="w-full flex items-center gap-3 p-3 rounded-lg
           bg-zinc-800 border border-zinc-700
           hover:bg-zinc-700 hover:border-zinc-500
           transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"

    >
      <span className="text-2xl">💰</span>
      <div className="text-left">
        <p className="font-medium text-white text-sm">Income Report</p>
        <p className="text-[11px] text-zinc-400">Monthly income breakdown</p>
      </div>
    </button>

    <button
      onClick={downloadBorrowLendReport}
      className="w-full flex items-center gap-3 p-3 rounded-lg
           bg-zinc-800 border border-zinc-700
           hover:bg-zinc-700 hover:border-zinc-500
           transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"

    >
      <span className="text-2xl">🤝</span>
      <div className="text-left">
        <p className="font-medium text-white text-sm">Borrow / Lend Report</p>
        <p className="text-[11px] text-zinc-400">All borrowings and lendings status</p>
      </div>
    </button>

  </div>
)}


</div>

    {/* PIE CHART */}
    {/* CHARTS SIDE BY SIDE */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

  {/* MONEY FLOW PIE */}
  <div className="card p-4">
    <h2 className="text-lg font-semibold mb-4">
      Money Flow - {month} {year}
    </h2>

    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={[
            { name: "Income", value: mIncome },
            { name: "Expenses", value: mExpenses },
            { name: "Borrowed", value: yBorrowed },
            { name: "Lent", value: yLent },
          ]}
          dataKey="value"
          outerRadius={110}
          label
        >
          <Cell />
          <Cell />
          <Cell />
          <Cell />
        </Pie>
        <Legend />
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  </div>

  {/* EXPENSE DISTRIBUTION PIE */}
  <div className="card p-4">
    <h2 className="text-lg font-semibold mb-4">
      Expense Distribution - {month}
    </h2>

    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={categoryData}
          dataKey="value"
          nameKey="name"
          outerRadius={110}
          label
        >
          {categoryData.map((_, index) => (
            <Cell key={index} />
          ))}
        </Pie>
        <Legend />
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  </div>

</div>

    {/* BAR CHART */}
    <div className="card p-4">
      <ResponsiveContainer width="100%" height={250}>
        <BarChart
          data={[
            { name: "Income", amount: yIncome },
            { name: "Expenses", amount: yExpenses },
            { name: "Borrowed", amount: yBorrowed },
            { name: "Lent", amount: yLent },
          ]}
          barCategoryGap="40%"
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="amount" barSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

}

export default Reports;
