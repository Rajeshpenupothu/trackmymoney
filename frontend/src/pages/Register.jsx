import { useState } from "react";
import api from "../api/api";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await api.post("/auth/register", {
        name,
        email,
        password,
      });

      setSuccess("Registration successful. Please login.");
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(
        err.response?.data || "Registration failed. Try again."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-700 to-fuchsia-700">
      <form
        onSubmit={handleSubmit}
        className="w-80 text-white"
      >
        <h1 className="text-3xl font-bold text-center mb-2">
          Register
        </h1>
        <p className="text-sm text-center mb-6 opacity-90">
          Create a new account
        </p>

        {error && (
          <p className="text-red-200 text-sm mb-3 text-center">
            {error}
          </p>
        )}

        {success && (
          <p className="text-green-200 text-sm mb-3 text-center">
            {success}
          </p>
        )}

        <div className="mb-4">
          <label className="text-sm">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-transparent border-b border-white py-2 outline-none"
            required
          />
        </div>

        <div className="mb-4">
          <label className="text-sm">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-transparent border-b border-white py-2 outline-none"
            required
          />
        </div>

        <div className="mb-4">
          <label className="text-sm">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-transparent border-b border-white py-2 outline-none"
            required
          />
        </div>

        <div className="mb-6">
          <label className="text-sm">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-transparent border-b border-white py-2 outline-none"
            required
          />
        </div>

        <button className="w-full bg-white text-pink-700 py-2 rounded-full font-semibold">
          Register
        </button>
      </form>
    </div>
  );
}

export default Register;
