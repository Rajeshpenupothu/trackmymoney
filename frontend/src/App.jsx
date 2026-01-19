import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Income from "./pages/Income";
import Expenses from "./pages/Expenses";
import Borrowings from "./pages/Borrowings";
import Lendings from "./pages/Lendings";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Reports from "./pages/Reports";
import { useAuth } from "./context/AuthContext";
import api from "./api/api";

function App() {
  const { user } = useAuth();
  const [activePage, setActivePage] = useState("Home");

  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(
    today.toLocaleString("default", { month: "long" })
  );

  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [borrowings, setBorrowings] = useState([]);
  const [lendings, setLendings] = useState([]);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      const expRes = await api.get("/expenses");
      const incRes = await api.get("/incomes");
      const borRes = await api.get("/borrowings");
      const lenRes = await api.get("/lendings");

      /* ===== EXPENSES ===== */
      setExpenses(
        expRes.data.map((e) => ({
          id: e.id,
          title: e.description,
          description: e.description,
          amount: e.amount,
          category: e.category,
          year: new Date(e.expenseDate).getFullYear(),
          month: new Date(e.expenseDate).toLocaleString("default", {
            month: "long",
          }),
          day: new Date(e.expenseDate).getDate(),
        }))
      );

      /* ===== INCOMES ===== */
      setIncomes(
        incRes.data.map((i) => ({
          id: i.id,
          source: i.source,
          amount: i.amount,
          year: new Date(i.incomeDate).getFullYear(),
          month: new Date(i.incomeDate).toLocaleString("default", {
            month: "long",
          }),
        }))
      );

      /* ===== BORROWINGS (FIXED) ===== */
      setBorrowings(
        borRes.data.map((b) => ({
          id: b.id,
          name: b.name,
          amount: b.amount,
          year: new Date(b.borrowDate).getFullYear(),
          month: new Date(b.borrowDate).toLocaleString("default", {
            month: "long",
          }),
          day: new Date(b.borrowDate).getDate(),
          dueDay: new Date(b.dueDate).getDate(),
          settled: b.settled, // ✅ IMPORTANT
        }))
      );

      /* ===== LENDINGS (FIXED) ===== */
      setLendings(
        lenRes.data.map((l) => ({
          id: l.id,
          name: l.name,
          amount: l.amount,
          year: new Date(l.lendDate).getFullYear(),
          month: new Date(l.lendDate).toLocaleString("default", {
            month: "long",
          }),
          day: new Date(l.lendDate).getDate(),
          dueDay: new Date(l.dueDate).getDate(),
          settled: l.settled, // ✅ IMPORTANT
        }))
      );
    };

    // ✅ THIS WAS THE MISSING PART
    loadData();
  }, [user]);

  if (!user) return <Login />;

  return (
    <div className="flex h-screen bg-zinc-100">
      <Sidebar active={activePage} setActive={setActivePage} />

      <div className="flex-1 p-8 overflow-y-auto">
        {activePage === "Home" && (
          <Home
            incomes={incomes}
            expenses={expenses}
            borrowings={borrowings}
            lendings={lendings}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            setSelectedYear={setSelectedYear}
            setSelectedMonth={setSelectedMonth}
          />
        )}

        {activePage === "Income" && (
          <Income incomes={incomes} setIncomes={setIncomes} />
        )}

        {activePage === "Expenses" && (
          <Expenses expenses={expenses} setExpenses={setExpenses} />
        )}

        {activePage === "Borrowings" && (
          <Borrowings
            borrowings={borrowings}
            setBorrowings={setBorrowings}
          />
        )}

        {activePage === "Lendings" && (
          <Lendings lendings={lendings} setLendings={setLendings} />
        )}

        {activePage === "Reports" && (
          <Reports
            incomes={incomes}
            expenses={expenses}
            borrowings={borrowings}
            lendings={lendings}
          />
        )}

        {activePage === "Settings" && <Settings />}
      </div>
    </div>
  );
}

export default App;
 