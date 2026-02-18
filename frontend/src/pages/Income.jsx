import { useState, useEffect } from "react";
import api from "../api/api";

function Income({ incomes, setIncomes }) {
  const [source, setSource] = useState("");
  const [amount, setAmount] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(
    new Date().toLocaleString("default", { month: "long" })
  );

  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // ✅ filter states
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toLocaleString("default", { month: "long" })
  );

  const formatIncome = (i) => ({
    ...i,
    year: new Date(i.incomeDate + "T00:00:00").getFullYear(),
    month: new Date(i.incomeDate + "T00:00:00").toLocaleString("default", { month: "long" }),
  });

  const [category, setCategory] = useState("");
  /* ===== HARDCODED CATEGORIES ===== */
  const categories = [
    { name: "Salary", icon: "💵" },
    { name: "Freelance", icon: "💻" },
    { name: "Investment", icon: "📈" },
    { name: "Gift", icon: "🎁" },
    { name: "Other", icon: "➕" },
  ];

  /* ===== SAVE / UPDATE ===== */
  const saveIncome = async (e) => {
    e.preventDefault();

    if (!source || !amount || !year || !month) {
      setError("Please fill all fields");
      return;
    }

    if (Number(amount) <= 0) {
      setError("Amount must be positive");
      return;
    }

    if (!/^[A-Za-z\s]+$/.test(source)) {
      setError("Source should only contain alphabet letters and spaces");
      return;
    }

    try {
      const incomeDate = `${year}-${String(
        new Date(`${month} 1`).getMonth() + 1
      ).padStart(2, "0")}-01`;

      if (editingId) {
        const res = await api.put(`/incomes/${editingId}`, {
          source,
          category,
          amount: amount.toString(),
          incomeDate,
        });

        const updated = res.data;
        setIncomes(
          incomes.map((i) =>
            i.id === editingId
              ? formatIncome(updated)
              : i
          )
        );

        setEditingId(null);
      } else {
        const res = await api.post("/incomes", {
          source,
          category,
          amount: amount.toString(),
          incomeDate,
        });

        setIncomes([...incomes, formatIncome(res.data)]);
      }

      setSource("");
      setAmount("");
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to save income");
    }
  };

  /* ===== DELETE ===== */
  const deleteIncome = async (id) => {
    if (!window.confirm("Delete this income?")) return;
    await api.delete(`/incomes/${id}`);
    setIncomes(incomes.filter((i) => i.id !== id));
  };

  /* ===== GROUP BY YEAR + MONTH (FILTERED) ===== */
  const groupedIncomes = {};

  incomes
    .filter(
      (i) => i.year == selectedYear && i.month === selectedMonth
    )
    .forEach((i) => {
      const key = `${i.year} ${i.month}`;
      if (!groupedIncomes[key]) groupedIncomes[key] = [];
      groupedIncomes[key].push(i);
    });
  const startEdit = (i) => {
    setSource(i.source);
    setCategory(i.category || categories[0]?.name || "");
    setAmount(i.amount);
    setYear(i.year);
    setMonth(i.month);
    setEditingId(i.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Income</h1>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">

        {/* LEFT — FORM */}
        <form onSubmit={saveIncome} className="card p-4 lg:p-6 w-full lg:w-1/2 h-fit">
          {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

          <label className="text-sm font-semibold mb-1 block">Source</label>
          <input
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="input mb-3"
            placeholder="e.g. Google, Client X"
          />

          <label className="text-sm font-semibold mb-1 block">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input mb-3"
          >
            {categories.map((cat) => (
              <option key={cat.name} value={cat.name}>
                {cat.icon ? cat.icon + " " : ""}{cat.name}
              </option>
            ))}
          </select>

          <label className="text-sm font-semibold mb-1 block">Amount (₹)</label>
          <input
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input mb-3"
          />

          <label className="text-sm font-semibold mb-1 block">Date</label>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="input">
              {[2024, 2025, 2026].map(y => <option key={y}>{y}</option>)}
            </select>

            <select value={month} onChange={(e) => setMonth(e.target.value)} className="input">
              {months.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>

          <button className="btn block hover w-full mt-3">
            {editingId ? "Update Income" : "Add Income"}
          </button>
        </form>


        {/* RIGHT — LIST */}
        <div className="card p-4 lg:p-6 w-full lg:w-1/2 max-h-[600px] overflow-y-auto">
          <div className="border-b border-[#CFD5D7] dark:border-[#6b6b6b] pb-4 mb-4">
            <h2 className="font-semibold mb-3">Income List</h2>

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
                {months.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            {Object.keys(groupedIncomes).map((group) => (
              <div key={group} className="mb-4">
                <h3 className="text-sm font-semibold mb-2">{group}</h3>

                {groupedIncomes[group].map((i) => (
                  <div
                    key={i.id}
                    className="flex justify-between items-center 
    border border-[#CFD5D7] 
    dark:border-[#6b6b6b] 
    rounded p-3 mb-2"
                  >
                    <div>
                      <p className="font-medium">{i.source}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-semibold mr-2">₹{i.amount}</span>

                      <button
                        onClick={() => startEdit(i)}
                        className="text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 text-[10px] px-2 py-0.5 rounded-full hover:bg-indigo-100 transition"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => deleteIncome(i.id)}
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

export default Income;
