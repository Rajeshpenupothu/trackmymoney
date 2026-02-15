import { useState, useEffect } from "react";
import api from "../api/api";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
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

  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(
    today.toLocaleString("default", { month: "long" })
  );

  const formatLending = (l) => {
    const ld = new Date(l.lendDate + "T00:00:00");
    const dd = new Date(l.dueDate + "T00:00:00");
    return {
      ...l,
      year: ld.getFullYear(),
      month: ld.toLocaleString("default", { month: "long" }),
      day: ld.getDate(),
      dueDay: dd.getDate(),
      lendDateObj: ld,
      dueDateObj: dd,
    };
  };

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
        const res = await api.put(`/lendings/${editingId}`, {
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
        const res = await api.post("/lendings", {
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

  /* ===== ACTIONS ===== */
  const markSettled = async (id) => {
    if (!window.confirm("Mark as settled?")) return;
    await api.put(`/lendings/${id}/settle`);
    setLendings(lendings.filter((l) => l.id !== id));
  };

  const deleteLending = async (id) => {
    if (!window.confirm("Delete this lending?")) return;
    await api.delete(`/lendings/${id}`);
    setLendings(lendings.filter((l) => l.id !== id));
  };

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

  const filtered = lendings.filter((l) =>
    l.year === selectedYear &&
    l.month === selectedMonth &&
    l.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="text-zinc-800 dark:text-zinc-100">
      <h1 className="text-2xl font-semibold mb-4">Lendings</h1>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">

        {/* LEFT — FORM */}
        <form onSubmit={saveLending} className="card p-4 lg:p-6 w-full lg:w-1/2 h-fit">
          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

          <input
            placeholder="Lent to"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input mb-3"
          />

          <input
            type="number"
            placeholder="Amount (₹)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input mb-3"
          />

          <div className="grid grid-cols-4 gap-3 mb-4">
            <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="input">
              {[2024, 2025, 2026].map(y => <option key={y}>{y}</option>)}
            </select>

            <select value={month} onChange={(e) => setMonth(e.target.value)} className="input">
              {MONTHS.map(m => <option key={m}>{m}</option>)}
            </select>

            <input
              placeholder="Day"
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="input"
            />

            <input
              placeholder="Due"
              value={dueDay}
              onChange={(e) => setDueDay(e.target.value)}
              className="input"
            />
          </div>

          <button className="btn block w-full mt-3">
            {editingId ? "Update Lending" : "Add Lending"}
          </button>
        </form>


        {/* RIGHT — LIST */}
        <div className="card p-4 lg:p-6 w-full lg:w-1/2 max-h-[600px] overflow-y-auto">
          <div className="border-b pb-4 mb-4 space-y-3">
            <h2 className="font-semibold">Lending List</h2>

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
                {MONTHS.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            {filtered.length === 0 ? (
              <p className="text-sm opacity-60">No active lendings</p>
            ) : (
              <>
                <h3 className="text-sm font-semibold mb-3">
                  {selectedYear} {selectedMonth}
                </h3>

                {filtered.map((l) => (
                  <div
                    key={l.id}
                    className="flex justify-between items-center border rounded p-3 mb-2 hover:shadow-md transition"
                  >
                    <div>
                      <p className="font-medium">{l.name}</p>
                      <p className="text-xs opacity-60">
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
                ))}
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );


}

export default Lendings;
