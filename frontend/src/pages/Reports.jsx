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
import api from "../api/api";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
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
  const downloadFinanceReport = async () => {
    try {
      const response = await api.get(`/reports/finance-report?year=${year}&month=${month}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Finance_Report_${month}_${year}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading finance report:', error);
      alert('Failed to download report');
    }
  };

  const downloadExpenseReport = async () => {
    try {
      const response = await api.get(`/reports/expense-report?year=${year}&month=${month}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Expenses_${month}_${year}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading expense report:', error);
      alert('Failed to download report');
    }
  };

  const downloadIncomeReport = async () => {
    try {
      const response = await api.get(`/reports/income-report?year=${year}&month=${month}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Income_${month}_${year}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading income report:', error);
      alert('Failed to download report');
    }
  };

  const downloadBorrowLendReport = async () => {
    try {
      const response = await api.get(`/reports/borrow-lend-report?year=${year}&month=${month}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Borrow_Lend_${month}_${year}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading borrow/lend report:', error);
      alert('Failed to download report');
    }
  };

  const getFilterDates = () => {
    const mIndex = MONTHS.indexOf(month) + 1;
    const sDate = `${year}-${String(mIndex).padStart(2, '0')}-01`;
    const lastDay = new Date(year, mIndex, 0).getDate();
    const eDate = `${year}-${String(mIndex).padStart(2, '0')}-${lastDay}`;
    return { startDate: sDate, endDate: eDate };
  };

  const downloadExpensesCsv = async () => {
    try {
      const { startDate, endDate } = getFilterDates();
      const response = await api.get('/export/expenses/csv', {
        params: { startDate, endDate },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Expenses_${month}_${year}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Error downloading CSV:', error);
      alert('Failed to download CSV');
    }
  };

  const downloadIncomeCsv = async () => {
    try {
      const { startDate, endDate } = getFilterDates();
      const response = await api.get('/export/incomes/csv', {
        params: { startDate, endDate },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Incomes_${month}_${year}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Error downloading CSV:', error);
      alert('Failed to download CSV');
    }
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
                <p className="font-medium text-white text-sm">Expense Report (PDF)</p>
                <p className="text-[11px] text-zinc-400">Detailed monthly expense list</p>
              </div>
            </button>

            <button
              onClick={downloadExpensesCsv}
              className="w-full flex items-center gap-3 p-3 rounded-lg
           bg-zinc-800 border border-zinc-700
           hover:bg-zinc-700 hover:border-zinc-500
           transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
            >
              <span className="text-2xl">📄</span>
              <div className="text-left">
                <p className="font-medium text-white text-sm">Export Expenses (CSV)</p>
                <p className="text-[11px] text-zinc-400">Raw data for Excel</p>
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
                <p className="font-medium text-white text-sm">Income Report (PDF)</p>
                <p className="text-[11px] text-zinc-400">Monthly income breakdown</p>
              </div>
            </button>

            <button
              onClick={downloadIncomeCsv}
              className="w-full flex items-center gap-3 p-3 rounded-lg
           bg-zinc-800 border border-zinc-700
           hover:bg-zinc-700 hover:border-zinc-500
           transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
            >
              <span className="text-2xl">📄</span>
              <div className="text-left">
                <p className="font-medium text-white text-sm">Export Income (CSV)</p>
                <p className="text-[11px] text-zinc-400">Raw data for Excel</p>
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
