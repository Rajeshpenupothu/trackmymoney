import { useState, useEffect } from "react";
import api from "../api/api";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
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

  /* ===== LIST FILTER STATE (like Income page) ===== */
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(
    today.toLocaleString("default", { month: "long" })
  );

  // Load borrowings ONLY when this page is actually viewed (not on initial app mount)
  useEffect(() => {
    // Only load if array is empty and we haven't loaded yet
    if (borrowings.length === 0) {
      const loadBorrowings = async () => {
        try {
          const res = await api.get("/borrowings");
          setBorrowings(res.data.map(b => {
            // Use T00:00:00 to avoid timezone shift on new Date()
            const bd = new Date(b.borrowDate + "T00:00:00");
            const dd = new Date(b.dueDate + "T00:00:00");
            return {
              ...b,
              year: bd.getFullYear(),
              month: bd.toLocaleString("default", { month: "long" }),
              day: bd.getDate(),
              dueDay: dd.getDate(),
              dueDateObj: dd,
            };
          }));
        } catch (error) {
          console.error("Failed to load borrowings:", error);
        }
      };
      loadBorrowings();
    }
  }, []);

  /* ===== SAVE / UPDATE ===== */
  const saveBorrowing = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !amount || !day || !dueDay) {
      setError("Please fill all fields");
      return;
    }

    const monthIndex = MONTHS.indexOf(month);

    // Create Date objects (Local Time)
    const borrowDateObj = new Date(year, monthIndex, Number(day));
    const dueDateObj = new Date(year, monthIndex, Number(dueDay));

    // FIX: Manually format to YYYY-MM-DD to avoid Timezone shift
    // This ensures Feb 1st stays Feb 1st
    const formatDate = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    try {
      if (editingId) {
        const res = await api.put(`/borrowings/${editingId}`, {
          name,
          amount: amount.toString(),
          borrowDate: formatDate(borrowDateObj), // Use helper
          dueDate: formatDate(dueDateObj),       // Use helper
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
                settled: res.data.settled,
              }
              : b
          )
        );
        setEditingId(null);
      } else {
        const res = await api.post("/borrowings", {
          name,
          amount: amount.toString(),
          borrowDate: formatDate(borrowDateObj), // Use helper
          dueDate: formatDate(dueDateObj),       // Use helper
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

  /* ===== ACTIONS ===== */
  const markSettled = async (id) => {
    if (!window.confirm("Mark as settled?")) return;
    await api.put(`/borrowings/${id}/settle`);
    setBorrowings(borrowings.filter((b) => b.id !== id));
  };

  const deleteBorrowing = async (id) => {
    if (!window.confirm("Delete this borrowing?")) return;
    await api.delete(`/borrowings/${id}`);
    setBorrowings(borrowings.filter((b) => b.id !== id));
  };

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

  /* ===== FILTER LIKE INCOME PAGE ===== */
  const filtered = borrowings
    .filter((b) => !b.settled)
    .filter(
      (b) =>
        b.year === selectedYear &&
        b.month === selectedMonth &&
        b.name.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="text-zinc-800 dark:text-zinc-100">
      <h1 className="text-2xl font-semibold mb-4">Borrowings</h1>
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">


        {/* FORM */}
        <form onSubmit={saveBorrowing} className="card p-4 lg:p-6 w-full lg:w-1/2 h-fit">

          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

          <input
            placeholder="Borrowed from"
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

            <input placeholder="Day" value={day} onChange={(e) => setDay(e.target.value)} className="input" />
            <input placeholder="Due" value={dueDay} onChange={(e) => setDueDay(e.target.value)} className="input" />
          </div>
          <button className="btn block w-full mt-3">
            {editingId ? "Update Borrowing" : "Add Borrowing"}
          </button>


        </form>

        {/* LIST */}
        <div className="card p-4 lg:p-6 w-full lg:w-1/2 max-h-[600px] overflow-y-auto">
          <div className="border-b pb-4 mb-4 space-y-3">
            <h2 className="font-semibold">Borrowing List</h2>

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

          <div className="p-4 border-t dark:border-zinc-700">
            {filtered.length === 0 ? (
              <p className="text-sm opacity-60">No active borrowings</p>
            ) : (
              <>
                <h3 className="text-sm font-semibold mb-3">
                  {selectedYear} {selectedMonth}
                </h3>

                {filtered.map((b) => (
                  <div
                    key={b.id}
                    className="flex justify-between items-center border rounded p-3 mb-2 hover:shadow-md transition"
                  >
                    <div>
                      <p className="font-medium">{b.name}</p>
                      <p className="text-xs opacity-60">
                        Day {b.day} · Due {b.dueDay}
                      </p>
                    </div>

                    <div className="flex gap-2 items-center">
                      <span className="font-semibold">₹{b.amount}</span>
                      <button onClick={() => markSettled(b.id)} className="text-green-600 text-xs border px-2 rounded">Settled</button>
                      <button onClick={() => startEdit(b)} className="text-blue-600 text-xs border px-2 rounded">Edit</button>
                      <button onClick={() => deleteBorrowing(b.id)} className="text-red-600 text-xs border px-2 rounded">Delete</button>
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

export default Borrowings;
