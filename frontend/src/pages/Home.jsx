import { useState, useEffect } from "react";
import api from "../api/api";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function Home({
  selectedYear,
  selectedMonth,
  setSelectedYear,
  setSelectedMonth,
}) {
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    savings: 0,
    totalBorrowed: 0,
    totalLent: 0,
    unsettledAmount: 0,
    overdueBorrowed: 0,
    overdueLent: 0
  });
  const [fetching, setFetching] = useState(false); // background fetch when switching month/year

  // 🔥 This useEffect replaces the old manual .filter() and .reduce() logic
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setFetching(true);

        // We call the single aggregated endpoint with filters
        const response = await api.get("/summary", {
          params: { year: selectedYear, month: selectedMonth }
        });
        setSummary(response.data);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setFetching(false);
      }
    };

    fetchDashboardData();
  }, [selectedYear, selectedMonth]); // Re-runs when you change month/year filters

  const availableBalance =
    summary.totalIncome - summary.totalExpense - summary.totalBorrowed + summary.totalLent;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold mb-6 text-black dark:text-white">Overview</h1>

      {/* Filters - Keep your existing UI */}
      <div className="flex gap-4 mb-8">
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="input w-32"
        >
          {[2024, 2025, 2026].map((y) => (
            <option key={y}>{y}</option>
          ))}
        </select>

        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="input w-40"
        >
          {MONTHS.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
      </div>

      {/* Cards using summary data */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-7 mb-6">
        <Card title="Total Income" value={summary.totalIncome} fetching={fetching} />
        <Card title="Total Expenses" value={summary.totalExpense} fetching={fetching} />
        <Card title="Total Borrowed" value={summary.totalBorrowed} fetching={fetching} />
        <Card title="Total Lent" value={summary.totalLent} fetching={fetching} />
      </div>

      {/* Overdue borrowed / lent - conditionally rendered */}
      {JSON.parse(localStorage.getItem("alertsEnabled") ?? "true") && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-7 mb-6">
          <div className="card p-6">
            <h2 className="text-sm text-gray-600 dark:text-gray-200">Overdue Borrowed</h2>
            <p className="text-2xl font-semibold mt-3 text-black dark:text-white">₹{summary.overdueBorrowed || 0}</p>
          </div>

          <div className="card p-6">
            <h2 className="text-sm text-gray-600 dark:text-gray-200">Overdue Lent</h2>
            <p className="text-2xl font-semibold mt-3 text-black dark:text-white">₹{summary.overdueLent || 0}</p>
          </div>
        </div>
      )}

      <div className="card p-6 mb-8">
        <h2 className="text-sm text-gray-600 dark:text-gray-200">Available Balance</h2>
        <p className="text-3xl font-semibold mt-3 text-black dark:text-white">₹{availableBalance}</p>
      </div>
    </div>
  );
}

// Keep your Card component as it is
function Card({ title, value, fetching }) {
  return (
    <div className="card p-7">
      <h2 className="text-sm text-gray-600 dark:text-gray-200">{title}</h2>
      {fetching ? (
        <div className="mt-3 h-6 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      ) : (
        <p className="text-2xl font-semibold mt-3 text-black dark:text-white">₹{value}</p>
      )}
    </div>
  );
}

export default Home;