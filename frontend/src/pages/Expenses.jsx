import { useState, useEffect } from "react";
import api from "../api/api";

function Expenses({ expenses, setExpenses }) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");

  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(
    new Date().toLocaleString("default", { month: "long" })
  );
  const [day, setDay] = useState("");


  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [showList, setShowList] = useState(true);
  const [error, setError] = useState("");

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toLocaleString("default", { month: "long" })
  );

  /* ===== HARDCODED CATEGORIES ===== */
  const categories = [
    { name: "Food", icon: "🍔" },
    { name: "Travel", icon: "🚗" },
    { name: "Rent", icon: "🏠" },
    { name: "Shopping", icon: "🛍️" },
    { name: "Other", icon: "📝" },
  ];

  /* ===== SAVE / UPDATE ===== */
  const saveExpense = async (e) => {
    e.preventDefault();

    if (!title || !amount || !year || !month || !day || !category) {
      setError("Please fill all fields");
      return;
    }

    if (Number(amount) <= 0) {
      setError("Amount must be positive");
      return;
    }

    if (!/^[A-Za-z\s]+$/.test(title)) {
      setError("Title should only contain alphabet letters and spaces");
      return;
    }

    const dayNum = Number(day);
    if (isNaN(dayNum) || dayNum < 1 || dayNum > 31) {
      setError("Please enter a valid day (1-31)");
      return;
    }

    try {
      const expenseDate = `${year}-${String(
        new Date(`${month} 1`).getMonth() + 1
      ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

      const payload = {
        amount: amount.toString(),
        category,
        description: title,
        expenseDate,
      };

      if (editingId) {
        const res = await api.put(`/expenses/${editingId}`, payload);
        const updated = res.data;

        setExpenses(
          expenses.map((e) =>
            e.id === editingId
              ? formatExpense(updated)
              : e
          )
        );
        setEditingId(null);
      } else {
        const res = await api.post("/expenses", payload);
        setExpenses([...expenses, formatExpense(res.data)]);
      }

      setTitle("");
      setAmount("");
      setCategory("Food");
      setDay("");
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to save expense");
    }
  };

  /* ===== FORMATTER ===== */
  const formatExpense = (data) => {
    const d = new Date(data.expenseDate);
    return {
      id: data.id,
      title: data.description,
      description: data.description,
      amount: data.amount,
      category: data.category,
      year: d.getFullYear(),
      month: d.toLocaleString("default", { month: "long" }),
      day: d.getDate(),
    };
  };

  /* ===== DELETE ===== */
  const deleteExpense = async (id) => {
    try {
      await api.delete(`/expenses/${id}`);
      setExpenses(expenses.filter((e) => e.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete expense");
    }
  };

  /* ===== EDIT ===== */
  const startEdit = (e) => {
    setTitle(e.title || e.description);
    setAmount(e.amount);
    setCategory(e.category);
    setYear(e.year);
    setMonth(e.month);
    setDay(e.day);
    setEditingId(e.id);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ===== SEARCH FIX ===== */
  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      (e.title || e.description || "")
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesDate =
      Number(e.year) === Number(selectedYear) &&
      e.month === selectedMonth;

    return matchesSearch && matchesDate;
  });


  /* ===== GROUPING FIX ===== */
  // ===== SORT BY DATE (Latest first) =====
  filteredExpenses.sort((a, b) => {
    const dateA = new Date(`${a.year}-${a.month} ${a.day}`);
    const dateB = new Date(`${b.year}-${b.month} ${b.day}`);
    return dateB - dateA; // latest first
  });

  const groupedExpenses = {};

  filteredExpenses.forEach((e) => {
    const key = `${e.year} ${e.month}`;
    if (!groupedExpenses[key]) groupedExpenses[key] = [];
    groupedExpenses[key].push(e);
  });
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Expenses</h1>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">


        {/* FORM */}
        <form onSubmit={saveExpense} className="card p-4 lg:p-6 w-full lg:w-1/2 h-fit">
          {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

          <label className="text-sm font-semibold mb-1 block">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input mb-3"
          />

          <label className="text-sm font-semibold mb-1 block">Amount (₹)</label>
          <input
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input mb-3"
          />

          <label className="text-sm font-semibold mb-1 block">Date</label>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="input">
              {[2024, 2025, 2026].map(y => <option key={y}>{y}</option>)}
            </select>

            <select value={month} onChange={(e) => setMonth(e.target.value)} className="input">
              {[
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
              ].map(m => <option key={m}>{m}</option>)}
            </select>

            <input
              type="number"
              min="1"
              max="31"
              placeholder="Day"
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="input"
            />
          </div>

          <label className="text-sm font-semibold mb-1 block">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input mb-4"
          >
            {categories.map((cat) => (
              <option key={cat.name} value={cat.name}>
                {cat.icon ? cat.icon + " " : ""}{cat.name}
              </option>
            ))}
          </select>

          <button className="btn block w-full mt-3">
            {editingId ? "Update Expense" : "Add Expense"}
          </button>


        </form>


        {/* LIST */}
        <div className="card p-4 lg:p-6 w-full lg:w-1/2 max-h-[600px] overflow-y-auto">
          <div className="p-4 border-b space-y-3">
            <h2 className="font-semibold">Expense List</h2>

            <input
              type="text"
              placeholder="Search in this list..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input"
            />

            <div className="flex gap-3">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="input"
              >
                {[2024, 2025, 2026].map((y) => (
                  <option key={y}>{y}</option>
                ))}
              </select>

              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="input"
              >
                {[
                  "January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December"
                ].map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-4 border-t">
            {Object.keys(groupedExpenses).map((group) => (
              <div key={group} className="mb-4">
                <h3 className="text-sm font-semibold mb-2">{group}</h3>

                {groupedExpenses[group].map((e) => (
                  <div
                    key={e.id}
                    className="flex justify-between items-center border rounded p-3 mb-2 hover:shadow-md transition"
                  >
                    <div>
                      <p className="font-medium">{e.title}</p>
                      <p className="text-xs opacity-60">
                        Day {e.day} · {e.category}
                      </p>
                    </div>

                    <div className="flex gap-2 items-center">
                      <span className="font-semibold mr-2">₹{e.amount}</span>
                      <button
                        onClick={() => startEdit(e)}
                        className="text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 text-[10px] px-2 py-0.5 rounded-full hover:bg-indigo-100 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteExpense(e.id)}
                        className="text-rose-600 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-[10px] px-2 py-0.5 rounded-full hover:bg-rose-100 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );

}

export default Expenses;
