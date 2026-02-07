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
import Help from "./pages/Help";
import { useAuth } from "./context/AuthContext";
import Profile from "./pages/Profile"; 
import api from "./api/api";

function App() {
  const { user, isLoading } = useAuth();
  const [activePage, setActivePage] = useState("Home");
  const [dark, setDark] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

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

      setBorrowings(
  borRes.data.map((b) => {
    const borrowD = new Date(b.borrowDate);
    const dueD = new Date(b.dueDate);

    return {
      id: b.id,
      name: b.name,
      amount: b.amount,

      year: borrowD.getFullYear(),
      month: borrowD.toLocaleString("default", { month: "long" }),
      day: borrowD.getDate(),

      // ✅ STORE FULL DUE DATE
      dueDateObj: dueD,
      settled: b.settled,
    };
  })
);


      setLendings(
  lenRes.data.map((l) => {
    const lendD = new Date(l.lendDate);
    const dueD = new Date(l.dueDate);

    return {
      id: l.id,
      name: l.name,
      amount: l.amount,

      year: lendD.getFullYear(),
      month: lendD.toLocaleString("default", { month: "long" }),
      day: lendD.getDate(),

      // ✅ STORE FULL DUE DATE
      dueDateObj: dueD,
      settled: l.settled,
    };
  })
);
    }


    loadData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-100 dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-zinc-900 dark:text-zinc-100">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Login />;

  return (
    <div className="flex h-screen bg-zinc-100 dark:bg-slate-900 text-zinc-900 dark:text-zinc-100">

      <Sidebar
        active={activePage}
        setActive={setActivePage}
        dark={dark}
        setDark={setDark}
      />

      <div className="flex-1 overflow-y-hidden bg-zinc-100 dark:bg-[#272727] p-6">


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
        {activePage === "Settings" && (
  <Settings dark={dark} setDark={setDark} />
)}
{activePage === "Profile" && <Profile />}
        {activePage === "Help" && <Help />}
      </div>
    </div>
    
  );
}

export default App;
