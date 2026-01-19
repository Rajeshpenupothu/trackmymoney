import { useState } from "react";
import api from "../api/api";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function Borrowings({ borrowings, setBorrowings }) {
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
  const saveBorrowing = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !amount || !day || !dueDay) {
      setError("Please fill all fields");
      return;
    }

    const monthIndex = MONTHS.indexOf(month);
    const borrowDate = new Date(year, monthIndex, Number(day));
    const dueDate = new Date(year, monthIndex, Number(dueDay));

    try {
      if (editingId) {
        const res = await api.put(`/api/borrowings/${editingId}`, {
          name,
          amount: amount.toString(),
          borrowDate: borrowDate.toISOString().slice(0, 10),
          dueDate: dueDate.toISOString().slice(0, 10),
        });

        setBorrowings(
          borrowings.map((b) =>
            b.id === editingId
              ? {
                  ...b,
                  name,
                  amount: Number(amount),
                  year,
                  month,
                  day: Number(day),
                  dueDay: Number(dueDay),
                  borrowDateObj: borrowDate,
                  dueDateObj: dueDate,
                  settled: res.data.settled,
                }
              : b
          )
        );
        setEditingId(null);
      } else {
        const res = await api.post("/api/borrowings", {
          name,
          amount: amount.toString(),
          borrowDate: borrowDate.toISOString().slice(0, 10),
          dueDate: dueDate.toISOString().slice(0, 10),
        });

        setBorrowings([
          ...borrowings,
          {
            id: res.data.id,
            name,
            amount: Number(amount),
            year,
            month,
            day: Number(day),
            dueDay: Number(dueDay),
            borrowDateObj: borrowDate,
            dueDateObj: dueDate,
            settled: false,
          },
        ]);
      }

      setName("");
      setAmount("");
      setDay("");
      setDueDay("");
    } catch (err) {
      console.error(err);
      setError("Failed to save borrowing");
    }
  };

  /* ===== SETTLED ===== */
  const markSettled = async (id) => {
    if (!window.confirm("Mark as settled?")) return;

    await api.put(`/api/borrowings/${id}/settle`);

    // REMOVE from active list (history stays in DB)
    setBorrowings(borrowings.filter((b) => b.id !== id));
  };

  /* ===== DELETE ===== */
  const deleteBorrowing = async (id) => {
    if (!window.confirm("Delete this borrowing?")) return;
    await api.delete(`/api/borrowings/${id}`);
    setBorrowings(borrowings.filter((b) => b.id !== id));
  };

  /* ===== EDIT ===== */
  const startEdit = (b) => {
    setName(b.name);
    setAmount(b.amount);
    setYear(b.year);
    setMonth(b.month);
    setDay(b.day);
    setDueDay(b.dueDay);
    setEditingId(b.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ===== FILTER ===== */
  const filtered = borrowings
    .filter((b) => !b.settled)
    .filter((b) =>
      b.name.toLowerCase().includes(search.toLowerCase())
    );

  /* ===== UI ===== */
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Borrowings</h1>

      <input
        placeholder="Search by name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full max-w-md border rounded-md px-3 py-2"
      />

      {/* FORM */}
      <form
        onSubmit={saveBorrowing}
        className="bg-white p-6 rounded-xl shadow mb-6 max-w-md"
      >
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

        <input
          placeholder="Borrowed from"
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
          {editingId ? "Update Borrowing" : "Add Borrowing"}
        </button>
      </form>

      {/* LIST */}
      <div className="bg-white rounded-xl shadow p-6 max-w-md">
        {filtered.length === 0 ? (
          <p className="text-gray-500 text-sm">No active borrowings</p>
        ) : (
          filtered.map((b) => (
            <div
              key={b.id}
              className="flex justify-between items-center border p-3 rounded mb-2"
            >
              <div>
                <p className="font-medium">{b.name}</p>
                <p className="text-xs text-gray-500">
                  {b.month} {b.day} · Due {b.dueDay}
                </p>
              </div>

              <div className="flex gap-2 items-center">
                <span className="font-semibold">₹{b.amount}</span>

                <button
                  onClick={() => markSettled(b.id)}
                  className="text-green-600 text-xs border px-2 rounded"
                >
                  Settled
                </button>

                <button
                  onClick={() => startEdit(b)}
                  className="text-blue-600 text-xs border px-2 rounded"
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteBorrowing(b.id)}
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

export default Borrowings;
