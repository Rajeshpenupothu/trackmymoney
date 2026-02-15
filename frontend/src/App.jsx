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
  const [activePage, setActivePage] = useState(localStorage.getItem("defaultPage") || "Home");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
  useEffect(() => {
    fetch("https://trackmymoney-7v9w.onrender.com/health")
      .catch(() => { });
  }, []);

  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(
    today.toLocaleString("default", { month: "long" })
  );

  // Data will be loaded on-demand by individual pages
  // Centralized Data Store
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [borrowings, setBorrowings] = useState([]);
  const [lendings, setLendings] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);

  // Load heavy lists only when Reports is active (or when they are empty and Reports requested)
  // Centralized Pre-fetching logic
  const fetchAllData = async () => {
    if (!user) return;
    try {
      setInitialLoading(true);
      const [expRes, incRes, borRes, lenRes] = await Promise.all([
        api.get("/expenses"),
        api.get("/incomes"),
        api.get("/borrowings"),
        api.get("/lendings"),
      ]);

      const mapIncome = (i) => ({
        ...i,
        year: new Date(i.incomeDate + "T00:00:00").getFullYear(),
        month: new Date(i.incomeDate + "T00:00:00").toLocaleString("default", { month: "long" }),
      });

      const mapExpense = (e) => ({
        ...e,
        year: new Date(e.expenseDate + "T00:00:00").getFullYear(),
        month: new Date(e.expenseDate + "T00:00:00").toLocaleString("default", { month: "long" }),
        day: new Date(e.expenseDate + "T00:00:00").getDate(),
        title: e.description,
      });

      const mapBorrowing = (b) => {
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
      };

      const mapLending = (l) => {
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

      setExpenses((expRes.data || []).map(mapExpense));
      setIncomes((incRes.data || []).map(mapIncome));
      setBorrowings((borRes.data || []).map(mapBorrowing));
      setLendings((lenRes.data || []).map(mapLending));
    } catch (err) {
      console.error("Failed to pre-fetch app data:", err);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAllData();
    } else {
      setInitialLoading(false);
    }
  }, [user]);

  if (isLoading || (user && initialLoading)) {
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
    <div className="flex h-screen bg-zinc-100 dark:bg-slate-900 text-zinc-900 dark:text-zinc-100 overflow-hidden">
      {/* Sidebar - Responsive Drawer on Mobile */}
      <div className={`
        fixed inset-0 z-50 lg:relative lg:flex lg:translate-x-0 transition-transform duration-300
        ${isSidebarOpen ? "translate-x-0 pointer-events-auto" : "-translate-x-full pointer-events-none lg:pointer-events-auto"}
      `}>
        {/* Overlay for mobile */}
        <div
          className={`absolute inset-0 bg-black/50 lg:hidden transition-opacity duration-300 ${isSidebarOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setIsSidebarOpen(false)}
        ></div>

        <div className="relative z-50 h-full">
          <Sidebar
            active={activePage}
            setActive={(page) => {
              setActivePage(page);
              setIsSidebarOpen(false); // Close drawer on selection
            }}
            dark={dark}
            setDark={setDark}
            onClose={() => setIsSidebarOpen(false)}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Top Bar */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-[#1A1A1A] border-b dark:border-[#2A2A2D]">
          <h1 className="text-lg font-bold">TrackMyMoney</h1>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto bg-zinc-100 dark:bg-[#272727] p-4 lg:p-6">
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
          {activePage === "Reports" && <Reports incomes={incomes} expenses={expenses} borrowings={borrowings} lendings={lendings} loading={initialLoading} />}
          {activePage === "Settings" && <Settings dark={dark} setDark={setDark} />}
          {activePage === "Profile" && <Profile />}
          {activePage === "Help" && <Help />}
        </main>
      </div>
    </div>
  );
}

export default App;