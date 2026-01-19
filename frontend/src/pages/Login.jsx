import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/api";

function Login() {
  const { login } = useAuth();

  const [isRegister, setIsRegister] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const ok = await login(email, password);
    if (!ok) setError("Invalid email or password");
  };

  const handleRegister = async (e) => {
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
      setIsRegister(false);

      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.response?.data || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-700 to-fuchsia-700">
      <form
        onSubmit={isRegister ? handleRegister : handleLogin}
        className="w-80 text-white"
      >
        <h1 className="text-3xl font-bold text-center mb-2">
          {isRegister ? "Register" : "Login"}
        </h1>

        <p className="text-sm text-center mb-6 opacity-90">
          {isRegister
            ? "Create a new account"
            : "Please login to use the platform"}
        </p>

        {error && (
          <p className="text-red-200 text-sm mb-3 text-center">{error}</p>
        )}

        {success && (
          <p className="text-green-200 text-sm mb-3 text-center">{success}</p>
        )}

        {isRegister && (
          <div className="mb-5">
            <label className="text-sm">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent border-b border-white py-2 outline-none"
              required
            />
          </div>
        )}

        <div className="mb-5">
          <label className="text-sm">Email</label>
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-transparent border-b border-white py-2 outline-none placeholder-white/70"
            required
          />
        </div>

        <div className="mb-4 relative">
          <label className="text-sm">Password</label>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-transparent border-b border-white py-2 outline-none pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-0 top-8 text-sm"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {isRegister && (
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
        )}

        <button className="w-full bg-white text-pink-700 py-2 rounded-full font-semibold mb-4">
          {isRegister ? "Register" : "Login"}
        </button>

        <p className="text-sm text-center mb-4">
          {isRegister ? "Already have an account?" : "Don’t have an account?"}{" "}
          <button
            type="button"
            className="font-semibold underline"
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
              setSuccess("");
            }}
          >
            {isRegister ? "Login" : "Register"}
          </button>
        </p>
      </form>
    </div>
  );
}

export default Login;
