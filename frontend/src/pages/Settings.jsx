import { useState, useEffect } from "react";
import { Database, Bell, Rocket, Trash2, ArrowRight } from "lucide-react";
import api from "../api/api";

function Settings() {
  const [defaultPage, setDefaultPage] = useState(localStorage.getItem("defaultPage") || "Home");
  const [alertsEnabled, setAlertsEnabled] = useState(JSON.parse(localStorage.getItem("alertsEnabled") ?? "true"));
  const [budgetAlerts, setBudgetAlerts] = useState(JSON.parse(localStorage.getItem("budgetAlerts") ?? "false"));

  const pages = ["Home", "Income", "Expenses", "Borrowings", "Lendings", "Reports"];

  useEffect(() => {
    localStorage.setItem("defaultPage", defaultPage);
  }, [defaultPage]);

  useEffect(() => {
    localStorage.setItem("alertsEnabled", JSON.stringify(alertsEnabled));
  }, [alertsEnabled]);

  useEffect(() => {
    localStorage.setItem("budgetAlerts", JSON.stringify(budgetAlerts));
  }, [budgetAlerts]);

  const handleReset = async () => {
    if (!window.confirm("Are you absolutely sure? This will delete all your transactions (Income, Expenses, Borrowings, Lendings) permanently!")) {
      return;
    }

    try {
      await api.delete("/users/reset");
      alert("Account reset successful! All data has been cleared.");
      window.location.reload(); // Refresh to clear global state
    } catch (err) {
      console.error(err);
      alert("Failed to reset account.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* ===== DATA MANAGEMENT ===== */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4 text-indigo-600 dark:text-indigo-400">
            <Database size={20} />
            <h2 className="text-lg font-semibold">Data Management</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium block mb-2 opacity-70">Starting Page</label>
              <select
                value={defaultPage}
                onChange={(e) => setDefaultPage(e.target.value)}
                className="input w-full"
              >
                {pages.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <p className="text-[11px] mt-2 opacity-50">Choose which page you see first after logging in.</p>
            </div>

            <div className="pt-4 border-t dark:border-zinc-700">
              <label className="text-sm font-medium block mb-2 text-red-600 dark:text-red-400">Danger Zone</label>
              <button
                onClick={handleReset}
                className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 transition"
              >
                <Trash2 size={16} />
                <span className="text-sm font-semibold">Reset My Account</span>
              </button>
            </div>
          </div>
        </div>

        {/* ===== SMART ALERTS ===== */}
        <div className="card p-6 h-fit">
          <div className="flex items-center gap-2 mb-4 text-amber-600 dark:text-amber-400">
            <Bell size={20} />
            <h2 className="text-lg font-semibold">Smart Alerts</h2>
          </div>

          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Overdue Warnings</p>
                <p className="text-xs opacity-50">Show overdue labels on dashboard</p>
              </div>
              <button
                onClick={() => setAlertsEnabled(!alertsEnabled)}
                className={`w-10 h-5 flex items-center rounded-full p-1 transition ${alertsEnabled ? "bg-green-500" : "bg-zinc-300 dark:bg-zinc-700"}`}
              >
                <div className={`bg-white w-3 h-3 rounded-full shadow-md transform transition ${alertsEnabled ? "translate-x-5" : ""}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Monthly Budget Alerts</p>
                <p className="text-xs opacity-50">Notify when spending exceeds 90%</p>
              </div>
              <button
                onClick={() => setBudgetAlerts(!budgetAlerts)}
                className={`w-10 h-5 flex items-center rounded-full p-1 transition ${budgetAlerts ? "bg-green-500" : "bg-zinc-300 dark:bg-zinc-700"}`}
              >
                <div className={`bg-white w-3 h-3 rounded-full shadow-md transform transition ${budgetAlerts ? "translate-x-5" : ""}`} />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* FOOTER TIP */}
      <div className="mt-8 p-4 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 flex items-center gap-3 opacity-60">
        <Rocket size={18} className="text-indigo-500" />
        <p className="text-xs italic">Tip: You can now toggle Dark/Light mode instantly from the Sidebar header!</p>
      </div>
    </div>
  );
}

export default Settings;
