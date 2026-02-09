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

  // Data will be loaded on-demand by individual pages
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [borrowings, setBorrowings] = useState([]);
  const [lendings, setLendings] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);

  // Load heavy lists only when Reports is active (or when they are empty and Reports requested)
  useEffect(() => {
    const loadReportData = async () => {
      try {
        setReportsLoading(true);
        const [expRes, incRes, borRes, lenRes] = await Promise.all([
          api.get("/expenses"),
          api.get("/incomes"),
          api.get("/borrowings"),
          api.get("/lendings"),
        ]);

        setExpenses(expRes.data || []);
        setIncomes(incRes.data || []);
        setBorrowings(borRes.data || []);
        setLendings(lenRes.data || []);
      } catch (err) {
        console.error("Failed to load reports data:", err);
      } finally {
        setReportsLoading(false);
      }
    };

    if (activePage === "Reports") {
      // only fetch if arrays are empty to avoid repeated loads
      if (expenses.length === 0 && incomes.length === 0 && borrowings.length === 0 && lendings.length === 0) {
        loadReportData();
      }
    }
  }, [activePage]);

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
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            setSelectedYear={setSelectedYear}
            setSelectedMonth={setSelectedMonth}
          />
        )}
        
        {activePage === "Income" && <Income incomes={incomes} setIncomes={setIncomes} />}
        {activePage === "Expenses" && <Expenses expenses={expenses} setExpenses={setExpenses} />}
        {activePage === "Borrowings" && <Borrowings borrowings={borrowings} setBorrowings={setBorrowings} />}
        {activePage === "Lendings" && <Lendings lendings={lendings} setLendings={setLendings} />}
        {activePage === "Reports" && <Reports incomes={incomes} expenses={expenses} borrowings={borrowings} lendings={lendings} loading={reportsLoading} />}
        {activePage === "Settings" && <Settings dark={dark} setDark={setDark} />}
        {activePage === "Profile" && <Profile />}
        {activePage === "Help" && <Help />}
      </div>
    </div>
  );
}

export default App;