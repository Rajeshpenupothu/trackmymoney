import {
  Home,
  Wallet,
  IndianRupee,
  ArrowDownCircle,
  ArrowUpCircle,
  FileText,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Sidebar({ active, setActive }) {
  const { user, logout } = useAuth();

  const menuItems = [
    { key: "Home", label: "Home", icon: Home },
    { key: "Income", label: "Income", icon: Wallet },
    { key: "Expenses", label: "Expenses", icon: IndianRupee },
    { key: "Borrowings", label: "Borrowings", icon: ArrowDownCircle },
    { key: "Lendings", label: "Lendings", icon: ArrowUpCircle },
    { key: "Reports", label: "Reports", icon: FileText },
    { key: "Settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="w-64 bg-zinc-900 text-white flex flex-col">
      {/* USER NAME */}
      <div className="px-6 py-5 text-xl font-semibold border-b border-zinc-800">
        {user?.name}
      </div>

      {/* MENU */}
      <ul className="flex-1 px-3 py-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <li
              key={item.key}
              onClick={() => setActive(item.key)}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition
                ${
                  active === item.key
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                }`}
            >
              <Icon size={18} />
              <span className="text-sm font-medium">{item.label}</span>
            </li>
          );
        })}
      </ul>

      {/* FOOTER */}
      <div className="px-6 py-4 text-xs text-zinc-500 border-t border-zinc-800 flex justify-between items-center">
        <span>TrackMyMoney</span>
        <button onClick={logout}>
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
