import {
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

const COLORS = ["#6366f1", "#f43f5e", "#f59e0b", "#10b981", "#8b5cf6", "#ec4899", "#06b6d4"];

function Reports({ incomes, expenses, borrowings, lendings, loading }) {
  const today = new Date();

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(
    today.toLocaleString("default", { month: "long" })
  );
  const [showDownloads, setShowDownloads] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null); // 'expenses' or 'income'
  const [isDownloading, setIsDownloading] = useState(false);

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

  /* ===== UNIFIED DOWNLOAD HANDLER ===== */
  const handleDownload = async (type, format = 'pdf') => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      let endpoint = "";
      let filename = "";
      let params = {};

      if (format === 'pdf') {
        endpoint = `/reports/${type}`;
        params = { year, month };

        // Map types to filename prefixes
        const names = {
          'finance-report': 'Finance_Report',
          'expense-report': 'Expenses',
          'income-report': 'Income',
          'borrow-lend-report': 'Borrow_Lend'
        };
        filename = `${names[type] || 'Report'}_${month}_${year}.pdf`;
      } else {
        const { startDate, endDate } = getFilterDates();
        endpoint = `/export/${type}/csv`;
        params = { startDate, endDate };
        filename = `${type.charAt(0).toUpperCase() + type.slice(1)}_${month}_${year}.csv`;
      }

      const response = await api.get(endpoint, {
        params,
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Error downloading ${type}:`, error);
      alert('Failed to download report');
    } finally {
      setIsDownloading(false);
    }
  };

  const getFilterDates = () => {
    const mIndex = MONTHS.indexOf(month) + 1;
    const sDate = `${year}-${String(mIndex).padStart(2, '0')}-01`;
    const lastDay = new Date(year, mIndex, 0).getDate();
    const eDate = `${year}-${String(mIndex).padStart(2, '0')}-${lastDay}`;
    return { startDate: sDate, endDate: eDate };
  };


  return (
    <div className="text-zinc-800 dark:text-zinc-100">
      <h1 className="text-2xl font-bold mb-6">Reports</h1>
      {/* FILTERS */}
      {/* FILTERS — Same as Home */}
      {/* FILTERS — Same as Home */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="input w-full sm:w-48"
        >
          {[2024, 2025, 2026].map((y) => (
            <option key={y}>{y}</option>
          ))}
        </select>

        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="input w-full sm:w-48"
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
          disabled={loading || isDownloading}
          className={`btn w-full ${(loading || isDownloading) ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {loading ? "Loading data..." : showDownloads ? "Close Downloads" : "Download Report"}
        </button>

        {showDownloads && (
          <div className="mt-4 max-w-md space-y-3">
            {/* Primary Reports (Single Format) */}
            <button
              onClick={() => handleDownload('finance-report')}
              disabled={isDownloading}
              className={`w-full flex items-center gap-3 p-3 rounded-lg
                         bg-zinc-800 border border-zinc-700
                         ${isDownloading ? 'opacity-50 cursor-wait' : 'hover:bg-zinc-700 hover:border-zinc-500'}
                         transition-all duration-300`}
            >
              {isDownloading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <span className="text-xl">📊</span>
              )}
              <div className="text-left">
                <p className="font-medium text-white text-sm">
                  {isDownloading ? "Generating PDF..." : "Finance Report"}
                </p>
                <p className="text-[11px] text-zinc-400">Summary of income, expenses, borrow & lend</p>
              </div>
            </button>

            {/* Grouped Expense Reports */}
            <div className="space-y-2">
              <button
                onClick={() => setActiveCategory(activeCategory === 'expenses' ? null : 'expenses')}
                disabled={isDownloading}
                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all duration-300
                            ${activeCategory === 'expenses' ? 'bg-zinc-700 border-indigo-500' : 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700'}
                            ${isDownloading ? 'opacity-50 cursor-wait' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🧾</span>
                  <div className="text-left">
                    <p className="font-medium text-white text-sm">Expense Report</p>
                    <p className="text-[11px] text-zinc-400">PDF and CSV formats available</p>
                  </div>
                </div>
                <span className={`transition-transform duration-300 ${activeCategory === 'expenses' ? 'rotate-180' : ''}`}>▼</span>
              </button>

              {activeCategory === 'expenses' && (
                <div className="grid grid-cols-2 gap-2 pl-4">
                  <button
                    onClick={() => handleDownload('expense-report')}
                    disabled={isDownloading}
                    className={`flex flex-col items-center p-2 rounded-lg bg-zinc-800 border border-zinc-700 transition
                                ${isDownloading ? 'opacity-50 cursor-wait' : 'hover:bg-zinc-700'}`}
                  >
                    {isDownloading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <span className="text-lg">📄</span>
                    )}
                    <span className="text-[10px] text-white">Download PDF</span>
                  </button>
                  <button
                    onClick={() => handleDownload('expenses', 'csv')}
                    disabled={isDownloading}
                    className={`flex flex-col items-center p-2 rounded-lg bg-zinc-800 border border-zinc-700 transition
                                ${isDownloading ? 'opacity-50 cursor-wait' : 'hover:bg-zinc-700'}`}
                  >
                    {isDownloading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <span className="text-lg">📊</span>
                    )}
                    <span className="text-[10px] text-white">Download CSV</span>
                  </button>
                </div>
              )}
            </div>

            {/* Grouped Income Reports */}
            <div className="space-y-2">
              <button
                onClick={() => setActiveCategory(activeCategory === 'income' ? null : 'income')}
                disabled={isDownloading}
                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all duration-300
                            ${activeCategory === 'income' ? 'bg-zinc-700 border-indigo-500' : 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700'}
                            ${isDownloading ? 'opacity-50 cursor-wait' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">💰</span>
                  <div className="text-left">
                    <p className="font-medium text-white text-sm">Income Report</p>
                    <p className="text-[11px] text-zinc-400">PDF and CSV formats available</p>
                  </div>
                </div>
                <span className={`transition-transform duration-300 ${activeCategory === 'income' ? 'rotate-180' : ''}`}>▼</span>
              </button>

              {activeCategory === 'income' && (
                <div className="grid grid-cols-2 gap-2 pl-4">
                  <button
                    onClick={() => handleDownload('income-report')}
                    disabled={isDownloading}
                    className={`flex flex-col items-center p-2 rounded-lg bg-zinc-800 border border-zinc-700 transition
                                ${isDownloading ? 'opacity-50 cursor-wait' : 'hover:bg-zinc-700'}`}
                  >
                    {isDownloading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <span className="text-lg">📄</span>
                    )}
                    <span className="text-[10px] text-white">Download PDF</span>
                  </button>
                  <button
                    onClick={() => handleDownload('incomes', 'csv')}
                    disabled={isDownloading}
                    className={`flex flex-col items-center p-2 rounded-lg bg-zinc-800 border border-zinc-700 transition
                                ${isDownloading ? 'opacity-50 cursor-wait' : 'hover:bg-zinc-700'}`}
                  >
                    {isDownloading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <span className="text-lg">📊</span>
                    )}
                    <span className="text-[10px] text-white">Download CSV</span>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => handleDownload('borrow-lend-report')}
              disabled={isDownloading}
              className={`w-full flex items-center gap-3 p-3 rounded-lg
                         bg-zinc-800 border border-zinc-700
                         ${isDownloading ? 'opacity-50 cursor-wait' : 'hover:bg-zinc-700 hover:border-zinc-500'}
                         transition-all duration-300`}
            >
              {isDownloading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <span className="text-xl">🤝</span>
              )}
              <div className="text-left">
                <p className="font-medium text-white text-sm">
                  {isDownloading ? "Generating PDF..." : "Borrow / Lend Report"}
                </p>
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
                <Cell fill={COLORS[0]} />
                <Cell fill={COLORS[1]} />
                <Cell fill={COLORS[2]} />
                <Cell fill={COLORS[3]} />
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
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>

    </div>
  );

}

export default Reports;
