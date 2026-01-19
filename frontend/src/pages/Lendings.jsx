import { useState } from "react";
import api from "../api/api";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function Lendings({ lendings, setLendings }) {
  const today = new Date();

  /* ===== FORM STATE ===== */
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(
    today.toLocaleString("default", { month: "long" })
  );
  const [day, setDay] = useState("");
  const [dueDay, setDueDay] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  /* ===== SAVE / UPDATE ===== */
  const saveLending = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !amount || !day || !dueDay) {
      setError("Please fill all fields");
      return;
    }

    const monthIndex = MONTHS.indexOf(month);
    const lendDate = new Date(year, monthIndex, Number(day));
    const dueDate = new Date(year, monthIndex, Number(dueDay));

    try {
      if (editingId) {
        const res = await api.put(`/api/lendings/${editingId}`, {
          name,
          amount: amount.toString(),
          lendDate: lendDate.toISOString().slice(0, 10),
          dueDate: dueDate.toISOString().slice(0, 10),
        });

        setLendings(
          lendings.map((l) =>
            l.id === editingId
              ? {
                  ...l,
                  name,
                  amount: Number(amount),
                  year,
                  month,
                  day: Number(day),
                  dueDay: Number(dueDay),
                  lendDateObj: lendDate,
                  dueDateObj: dueDate,
                }
              : l
          )
        );
        setEditingId(null);
      } else {
        const res = await api.post("/api/lendings", {
          name,
          amount: amount.toString(),
          lendDate: lendDate.toISOString().slice(0, 10),
          dueDate: dueDate.toISOString().slice(0, 10),
        });

        setLendings([
          ...lendings,
          {
            id: res.data.id,
            name,
            amount: Number(amount),
            year,
            month,
            day: Number(day),
            dueDay: Number(dueDay),
            lendDateObj: lendDate,
            dueDateObj: dueDate,
          },
        ]);
      }

      setName("");
      setAmount("");
      setDay("");
      setDueDay("");
    } catch (err) {
      console.error(err);
      setError("Failed to save lending");
    }
  };

  /* ===== SETTLED ===== */
  const markSettled = async (id) => {
    if (!window.confirm("Mark as settled?")) return;

    await api.put(`/api/lendings/${id}/settle`);

    // Remove from active list (history stays in DB)
    setLendings(lendings.filter((l) => l.id !== id));
  };

  /* ===== DELETE ===== */
  const deleteLending = async (id) => {
    if (!window.confirm("Delete this lending?")) return;
    await api.delete(`/api/lendings/${id}`);
    setLendings(lendings.filter((l) => l.id !== id));
  };

  /* ===== EDIT ===== */
  const startEdit = (l) => {
    setName(l.name);
    setAmount(l.amount);
    setYear(l.year);
    setMonth(l.month);
    setDay(l.day);
    setDueDay(l.dueDay);
    setEditingId(l.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ===== FILTER ===== */
  const filtered = lendings.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase())
  );

  /* ===== UI ===== */
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Lendings</h1>

      <input
        placeholder="Search by name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full max-w-md border rounded-md px-3 py-2"
      />

      {/* FORM */}
      <form
        onSubmit={saveLending}
        className="bg-white p-6 rounded-xl shadow mb-6 max-w-md"
      >
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

        <input
          placeholder="Lent to"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded-md px-3 py-2 mb-3"
        />

        <input
          type="number"
          placeholder="Amount (₹)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border rounded-md px-3 py-2 mb-3"
        />

        <div className="grid grid-cols-4 gap-3 mb-4">
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="border rounded px-3 py-2">
            {[2024, 2025, 2026].map((y) => <option key={y}>{y}</option>)}
          </select>

          <select value={month} onChange={(e) => setMonth(e.target.value)} className="border rounded px-3 py-2">
            {MONTHS.map((m) => <option key={m}>{m}</option>)}
          </select>

          <input
            placeholder="Day"
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="border rounded px-3 py-2"
          />

          <input
            placeholder="Due"
            value={dueDay}
            onChange={(e) => setDueDay(e.target.value)}
            className="border rounded px-3 py-2"
          />
        </div>

        <button className="bg-black text-white px-4 py-2 rounded">
          {editingId ? "Update Lending" : "Add Lending"}
        </button>
      </form>

      {/* LIST */}
      <div className="bg-white rounded-xl shadow p-6 max-w-md">
        {filtered.length === 0 ? (
          <p className="text-gray-500 text-sm">No active lendings</p>
        ) : (
          filtered.map((l) => (
            <div
              key={l.id}
              className="flex justify-between items-center border p-3 rounded mb-2"
            >
              <div>
                <p className="font-medium">{l.name}</p>
                <p className="text-xs text-gray-500">
                  {l.month} {l.day} · Due {l.dueDay}
                </p>
              </div>

              <div className="flex gap-2 items-center">
                <span className="font-semibold">₹{l.amount}</span>

                <button
                  onClick={() => markSettled(l.id)}
                  className="text-green-600 text-xs border px-2 rounded"
                >
                  Settled
                </button>

                <button
                  onClick={() => startEdit(l)}
                  className="text-blue-600 text-xs border px-2 rounded"
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteLending(l.id)}
                  className="text-red-600 text-xs border px-2 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Lendings;
