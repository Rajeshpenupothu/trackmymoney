import {
  Home,
  Wallet,
  IndianRupee,
  ArrowDownCircle,
  ArrowUpCircle,
  FileText,
  LogOut,
  ChevronDown,
  User,
  Settings,
  HelpCircle,
  Tag,
  X,
  Sun,
  Moon,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRef, useEffect } from "react";

function Sidebar({ active, setActive, dark, setDark, onClose }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const menuItems = [
    { key: "Home", label: "Home", icon: Home },
    { key: "Income", label: "Income", icon: Wallet },
    { key: "Expenses", label: "Expenses", icon: IndianRupee },
    { key: "Borrowings", label: "Borrowings", icon: ArrowDownCircle },
    { key: "Lendings", label: "Lendings", icon: ArrowUpCircle },
    { key: "Reports", label: "Reports", icon: FileText },
  ];
  // import { useRef, useEffect } from "react";

  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  return (
    <div
      className="w-64 flex flex-col h-screen"
      style={{
        background: dark ? "#1A1A1A" : "#FFFFFF",
        color: dark ? "#E5E7EB" : "#2E3A59",
      }}
    >
      {/* ===== BRAND HEADER ===== */}
      <div className={`p-4 border-b flex items-center justify-between ${dark ? "border-[#2A2A2D]" : "border-[#CFD5D7]"}`}>
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold">TrackMyMoney</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={() => setDark(!dark)}
            className={`p-2 rounded-lg transition-colors ${dark ? "hover:bg-[#2A2A2D] text-yellow-400" : "hover:bg-zinc-100 text-indigo-600"}`}
            title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* ===== MENU ===== */}
      <ul className="flex-1 px-3 py-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <li
              key={item.key}
              onClick={() => setActive(item.key)}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition
              ${active === item.key
                  ? dark
                    ? "bg-[#1C1C1F] text-white border border-[#2A2A2D]"
                    : "bg-white text-[#2E3A59] border border-[#CFD5D7]"
                  : dark
                    ? "text-gray-300 hover:bg-[#1C1C1F]"
                    : "text-[#2E3A59] hover:bg-white hover:border hover:border-[#CFD5D7]"
                }`}
            >
              <Icon size={18} />
              <span className="text-sm font-medium">{item.label}</span>
            </li>
          );
        })}
      </ul>

      {/* ===== USER DROPDOWN ===== */}
      <div
        ref={dropdownRef}
        className={`p-4 border-t relative ${dark ? "border-[#2A2A2D]" : "border-[#CFD5D7]"
          }`}
      >
        {/* User Box */}
        <div
          onClick={() => setOpen(!open)}
          className={`group flex items-center justify-between cursor-pointer px-3 py-2 rounded-lg
          ${dark
              ? "bg-[#1C1C1F] border border-[#2A2A2D]"
              : "bg-white border border-[#CFD5D7]"
            }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#E6E9EF] flex items-center justify-center font-bold text-[#2E3A59]">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium">{user?.name}</span>
          </div>
          <ChevronDown
            size={16}
            className={`transition-all duration-200 ${open ? "rotate-180" : "rotate-0"
              }`}
          />
        </div>

        {open && (
          <div
            className={`absolute bottom-full mb-3 left-0 w-64 rounded-xl shadow-2xl z-50 overflow-hidden
            ${dark
                ? "bg-[#1C1C1F] border border-[#2A2A2D]"
                : "bg-white border border-[#CFD5D7]"
              }`}
          >
            {/* Header */}
            <div
              className={`flex items-center gap-3 p-4 border-b ${dark ? "border-[#2A2A2D]" : "border-[#CFD5D7]"
                }`}
            >
              <div className="w-10 h-10 rounded-full bg-[#E6E9EF] flex items-center justify-center font-bold text-lg text-[#2E3A59]">

                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-sm">{user?.name}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
            </div>

            {/* Buttons */}
            <div className="p-2 space-y-1">
              <button
                onClick={() => {
                  setActive("Profile");
                  setOpen(false);
                }}
                className={`flex items-center gap-2 w-full px-3 py-2 rounded text-sm transition
      ${dark ? "text-gray-200 hover:bg-[#2A2A2D]" : "text-[#2E3A59] hover:bg-[#F5F7FA]"}`}
              >
                <User size={16} /> Profile
              </button>

              <button
                onClick={() => {
                  setActive("Settings");
                  setOpen(false);
                }}
                className={`flex items-center gap-2 w-full px-3 py-2 rounded text-sm transition
      ${dark ? "text-gray-200 hover:bg-[#2A2A2D]" : "text-[#2E3A59] hover:bg-[#F5F7FA]"}`}
              >
                <Settings size={16} /> Settings
              </button>

              <button
                onClick={() => {
                  setActive("Help");
                  setOpen(false);
                }}
                className={`flex items-center gap-2 w-full px-3 py-2 rounded text-sm transition
      ${dark ? "text-gray-200 hover:bg-[#2A2A2D]" : "text-[#2E3A59] hover:bg-[#F5F7FA]"}`}
              >
                <HelpCircle size={16} /> Help & Feedback
              </button>

              <button
                onClick={logout}
                className={`flex items-center gap-2 w-full px-3 py-2 rounded text-sm transition
      ${dark ? "text-red-400 hover:bg-[#2A2A2D]" : "text-red-500 hover:bg-[#F5F7FA]"}`}
              >
                <LogOut size={16} /> Logout
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
