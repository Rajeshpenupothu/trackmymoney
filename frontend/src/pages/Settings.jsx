import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/api";

function Settings() {
  const { user, logout } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /* ===== CHANGE PASSWORD ===== */
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    try {
      // 🔹 Backend endpoint (adjust if needed)
      await api.put("/api/users/change-password", {
        currentPassword,
        newPassword,
      });

      setMessage("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      setError("Failed to update password");
    }
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold mb-6">Settings</h1>

      {/* ===== PROFILE INFO ===== */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Profile</h2>

        <div className="mb-3">
          <label className="text-sm text-gray-500">Name</label>
          <p className="font-medium">{user?.name || "—"}</p>
        </div>

        <div>
          <label className="text-sm text-gray-500">Email</label>
          <p className="font-medium">{user?.email || "—"}</p>
        </div>
      </div>

      {/* ===== CHANGE PASSWORD ===== */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Change Password</h2>

        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
        {message && <p className="text-green-600 text-sm mb-3">{message}</p>}

        <form onSubmit={handleChangePassword}>
          <input
            type="password"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full border rounded-md px-3 py-2 mb-3"
          />

          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border rounded-md px-3 py-2 mb-3"
          />

          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border rounded-md px-3 py-2 mb-4"
          />

          <button className="bg-zinc-900 text-white px-4 py-2 rounded-md">
            Update Password
          </button>
        </form>
      </div>

      {/* ===== LOGOUT ===== */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-3">Account</h2>

        <button
          onClick={logout}
          className="text-red-600 border border-red-300 px-4 py-2 rounded-md"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Settings;
