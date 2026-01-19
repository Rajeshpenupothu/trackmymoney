import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function Home({
  incomes,
  expenses,
  borrowings,
  lendings,
  selectedYear,
  selectedMonth,
  setSelectedYear,
  setSelectedMonth,
}) {
  const today = new Date();

  /* ================= FILTER BY YEAR + MONTH ================= */

  const filteredIncomes = incomes.filter(
    (i) => i.year === selectedYear && i.month === selectedMonth
  );

  const filteredExpenses = expenses.filter(
    (e) => e.year === selectedYear && e.month === selectedMonth
  );

  const filteredBorrowings = borrowings.filter(
    (b) => b.year === selectedYear && b.month === selectedMonth
  );

  const filteredLendings = lendings.filter(
    (l) => l.year === selectedYear && l.month === selectedMonth
  );

  /* ================= TOTALS ================= */

  const totalIncome = filteredIncomes.reduce(
    (sum, i) => sum + Number(i.amount),
    0
  );

  const totalExpenses = filteredExpenses.reduce(
    (sum, e) => sum + Number(e.amount),
    0
  );

  const totalBorrowed = filteredBorrowings.reduce(
    (sum, b) => sum + Number(b.amount),
    0
  );

  const totalLent = filteredLendings.reduce(
    (sum, l) => sum + Number(l.amount),
    0
  );

  /* ================= OVERDUE (CORRECT & CLEAN) ================= */

  const overdueBorrowed = borrowings
    .filter((b) => {
      const monthIndex = MONTHS.indexOf(b.month);
      if (monthIndex === -1) return false;

      const dueDate = new Date(
        b.year,
        monthIndex,
        Number(b.dueDay)
      );

      return dueDate < today;
    })
    .reduce((sum, b) => sum + Number(b.amount), 0);

  const overdueLent = lendings
    .filter((l) => {
      const monthIndex = MONTHS.indexOf(l.month);
      if (monthIndex === -1) return false;

      const dueDate = new Date(
        l.year,
        monthIndex,
        Number(l.dueDay)
      );

      return dueDate < today;
    })
    .reduce((sum, l) => sum + Number(l.amount), 0);

  /* ================= BALANCE ================= */

  const availableBalance =
    totalIncome - totalExpenses - totalBorrowed + totalLent;

  /* ================= CHART DATA ================= */

  const summaryData = [
    { name: "Income", amount: totalIncome },
    { name: "Expenses", amount: totalExpenses },
    { name: "Borrowed", amount: totalBorrowed },
    { name: "Lent", amount: totalLent },
  ];

  /* ================= UI ================= */

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Overview</h1>

      {/* YEAR + MONTH */}
      <div className="flex gap-3 mb-6">
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="border rounded-md px-3 py-2"
        >
          {[2024, 2025, 2026].map((y) => (
            <option key={y}>{y}</option>
          ))}
        </select>

        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border rounded-md px-3 py-2"
        >
          {MONTHS.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
      </div>

      {/* TOTAL CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card title="Total Income" value={totalIncome} />
        <Card title="Total Expenses" value={totalExpenses} />
        <Card title="Total Borrowed" value={totalBorrowed} />
        <Card title="Total Lent" value={totalLent} />
      </div>

      {/* OVERDUE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-red-100 text-red-800 rounded-xl p-6">
          <h2 className="text-sm font-medium">Overdue Borrowed</h2>
          <p className="text-2xl font-bold mt-2">₹{overdueBorrowed}</p>
        </div>

        <div className="bg-yellow-100 text-yellow-800 rounded-xl p-6">
          <h2 className="text-sm font-medium">Overdue Lent</h2>
          <p className="text-2xl font-bold mt-2">₹{overdueLent}</p>
        </div>
      </div>

      {/* BALANCE */}
      <div className="bg-green-100 text-green-800 rounded-xl p-6 mb-8">
        <h2 className="text-sm font-medium">Available Balance</h2>
        <p className="text-3xl font-bold mt-2">₹{availableBalance}</p>
      </div>

      {/* CHART */}
      <div className="bg-white rounded-xl shadow p-6 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={summaryData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="amount" fill="#18181b" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-gray-500 text-sm">{title}</h2>
      <p className="text-2xl font-bold mt-2">₹{value}</p>
    </div>
  );
}

export default Home;
