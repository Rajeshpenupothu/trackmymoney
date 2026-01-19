import { useState } from "react";
import api from "../api/api";

function Income({ incomes, setIncomes }) {
  const [source, setSource] = useState("");
  const [amount, setAmount] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(
    new Date().toLocaleString("default", { month: "long" })
  );

  const [editingId, setEditingId] = useState(null);
  const [showList, setShowList] = useState(true);
  const [error, setError] = useState("");

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  /* ===== SAVE / UPDATE ===== */
  const saveIncome = async (e) => {
    e.preventDefault();

    if (!source || !amount || !year || !month) {
      setError("Please fill all fields");
      return;
    }

    try {
      const incomeDate = `${year}-${String(
        new Date(`${month} 1`).getMonth() + 1
      ).padStart(2, "0")}-01`;

      if (editingId) {
        const res = await api.put(`/api/incomes/${editingId}`, {
          source,
          amount: amount.toString(),
          incomeDate,
        });

        const updated = res.data;

        setIncomes(
          incomes.map((i) =>
            i.id === editingId
              ? {
                  ...updated,
                  year: new Date(updated.incomeDate).getFullYear(),
                  month: new Date(updated.incomeDate).toLocaleString("default", {
                    month: "long",
                  }),
                }
              : i
          )
        );

        setEditingId(null);
      } else {
        const res = await api.post("/api/incomes", {
          source,
          amount: amount.toString(),
          incomeDate,
        });

        const saved = res.data;

        setIncomes([
          ...incomes,
          {
            ...saved,
            year: new Date(saved.incomeDate).getFullYear(),
            month: new Date(saved.incomeDate).toLocaleString("default", {
              month: "long",
            }),
          },
        ]);
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
    await api.delete(`/api/incomes/${id}`);
    setIncomes(incomes.filter((i) => i.id !== id));
  };

  /* ===== EDIT ===== */
  const startEdit = (i) => {
    setSource(i.source);
    setAmount(i.amount);
    setYear(
      i.incomeDate
        ? new Date(i.incomeDate).getFullYear()
        : i.year
    );
    setMonth(
      i.incomeDate
        ? new Date(i.incomeDate).toLocaleString("default", { month: "long" })
        : i.month
    );
    setEditingId(i.id);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ===== GROUP BY YEAR + MONTH (FIXED) ===== */
  const groupedIncomes = {};

  incomes.forEach((i) => {
    const date = i.incomeDate
      ? new Date(i.incomeDate)
      : new Date(`${i.year}-${i.month}-01`);

    const y = date.getFullYear();
    const m = date.toLocaleString("default", { month: "long" });

    const key = `${y} ${m}`;

    if (!groupedIncomes[key]) groupedIncomes[key] = [];
    groupedIncomes[key].push({ ...i, year: y, month: m });
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4 text-zinc-800">Income</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">

          {/* FORM */}
          <form
            onSubmit={saveIncome}
            className="bg-white p-6 rounded-xl shadow mb-6 max-w-md"
          >
            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

            <div className="mb-4">
              <label className="block text-sm mb-1">Source</label>
              <input
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm mb-1">Amount (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              />
            </div>

            <div className="mb-4 grid grid-cols-2 gap-3">
              <select value={year} onChange={(e) => setYear(e.target.value)} className="border rounded-md px-3 py-2">
                {[2024, 2025, 2026].map((y) => <option key={y}>{y}</option>)}
              </select>

              <select value={month} onChange={(e) => setMonth(e.target.value)} className="border rounded-md px-3 py-2">
                {months.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>

            <button className="bg-zinc-900 text-white px-4 py-2 rounded-md">
              {editingId ? "Update Income" : "Add Income"}
            </button>
          </form>

          {/* LIST */}
          <div className="bg-white rounded-xl shadow max-w-md">
            <div
              onClick={() => setShowList(!showList)}
              className="flex justify-between items-center p-4 cursor-pointer"
            >
              <h2 className="font-semibold">Income List</h2>
              <span>{showList ? "▾" : "▸"}</span>
            </div>

            {showList && (
              <div className="p-4 border-t">
                {Object.keys(groupedIncomes).map((group) => (
                  <div key={group} className="mb-4">
                    <h3 className="text-sm font-semibold mb-2">{group}</h3>
                    {groupedIncomes[group].map((i) => (
                      <div key={i.id} className="flex justify-between border p-3 rounded mb-2">
                        <span>{i.source}</span>
                        <span>₹{i.amount}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default Income;
