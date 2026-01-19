import { useState } from "react";
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

  /* ===== SAVE / UPDATE ===== */
  const saveExpense = async (e) => {
    e.preventDefault();

    if (!title || !amount || !year || !month || !day || !category) {
      setError("Please fill all fields");
      return;
    }

    try {
      const expenseDate = `${year}-${String(
        new Date(`${month} 1`).getMonth() + 1
      ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

      if (editingId) {
        const res = await api.put(`/api/expenses/${editingId}`, {
          amount: amount.toString(),
          category,
          description: title,
          expenseDate,
        });

        const updated = res.data;

        setExpenses(
          expenses.map((e) =>
            e.id === editingId
              ? {
                  id: updated.id,
                  title: updated.description,
                  description: updated.description,
                  amount: updated.amount,
                  category: updated.category,
                  year: new Date(updated.expenseDate).getFullYear(),
                  month: new Date(updated.expenseDate).toLocaleString("default", {
                    month: "long",
                  }),
                  day: new Date(updated.expenseDate).getDate(),
                }
              : e
          )
        );

        setEditingId(null);
      } else {
        const res = await api.post("/api/expenses", {
          amount: amount.toString(),
          category,
          description: title,
          expenseDate,
        });

        const saved = res.data;

        setExpenses([
          ...expenses,
          {
            id: saved.id,
            title: saved.description,
            description: saved.description,
            amount: saved.amount,
            category: saved.category,
            year: new Date(saved.expenseDate).getFullYear(),
            month: new Date(saved.expenseDate).toLocaleString("default", {
              month: "long",
            }),
            day: new Date(saved.expenseDate).getDate(),
          },
        ]);
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

  /* ===== DELETE ===== */
  const deleteExpense = async (id) => {
    try {
      await api.delete(`/api/expenses/${id}`);
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

  /* ===== SEARCH (SAFE FIX) ===== */
  const filteredExpenses = expenses.filter((e) =>
    (e.title || e.description || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  /* ===== GROUP BY YEAR + MONTH ===== */
  const groupedExpenses = {};
  filteredExpenses.forEach((e) => {
    const key = `${e.year} ${e.month}`;
    if (!groupedExpenses[key]) groupedExpenses[key] = [];
    groupedExpenses[key].push(e);
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4 text-zinc-800">
        Expenses
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <input
            type="text"
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-3 w-full max-w-md border rounded-md px-3 py-2"
          />

          <form
            onSubmit={saveExpense}
            className="bg-white p-6 rounded-xl shadow mb-6 max-w-md"
          >
            {error && (
              <p className="mb-3 text-sm text-red-600">{error}</p>
            )}

            <div className="mb-4">
              <label className="block text-sm mb-1">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
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

            <div className="mb-4 grid grid-cols-3 gap-3">
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="border rounded-md px-3 py-2"
              >
                {[2024, 2025, 2026].map((y) => (
                  <option key={y}>{y}</option>
                ))}
              </select>

              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="border rounded-md px-3 py-2"
              >
                {[
                  "January","February","March","April","May","June",
                  "July","August","September","October","November","December"
                ].map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Day"
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="border rounded-md px-3 py-2"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              >
                <option>Food</option>
                <option>Travel</option>
                <option>Rent</option>
                <option>Shopping</option>
                <option>Other</option>
              </select>
            </div>

            <button className="bg-zinc-900 text-white px-4 py-2 rounded-md">
              {editingId ? "Update Expense" : "Add Expense"}
            </button>
          </form>

          <div className="bg-white rounded-xl shadow max-w-md">
            <div
              onClick={() => setShowList(!showList)}
              className="flex justify-between items-center p-4 cursor-pointer"
            >
              <h2 className="font-semibold">Expense List</h2>
              <span>{showList ? "▾" : "▸"}</span>
            </div>

            {showList && (
              <div className="p-4 border-t">
                {Object.keys(groupedExpenses).map((group) => (
                  <div key={group} className="mb-4">
                    <h3 className="text-sm font-semibold mb-2">
                      {group}
                    </h3>

                    <ul className="space-y-2">
                      {groupedExpenses[group].map((e) => (
                        <li
                          key={e.id}
                          className="flex justify-between items-center border rounded-md p-3 text-sm"
                        >
                          <div>
                            <p className="font-medium">
                              {e.title || e.description}
                            </p>
                            <p className="text-xs text-gray-500">
                              Day {e.day} · {e.category}
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <span>₹{e.amount}</span>
                            <button
                              onClick={() => startEdit(e)}
                              className="text-blue-600 text-xs border px-2 rounded"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteExpense(e.id)}
                              className="text-red-600 text-xs border px-2 rounded"
                            >
                              Delete
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
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

export default Expenses;
