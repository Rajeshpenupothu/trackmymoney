import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/api";
import "./auth.css";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";


function Login() {
  const { login, register, isLoading } = useAuth();

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isWakingUp, setIsWakingUp] = useState(false);

  // 🚀 Proactive server wakeup on mount
  useEffect(() => {
    const wakeup = async () => {
      try {
        await api.get("/auth/health");
      } catch (err) {
        // Ignore error, we just want to wake up Render
      }
    };
    wakeup();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const ok = await login(email, password);
    if (!ok) {
      setError("Invalid email or password");
    } else {
      setEmail("");
      setPassword("");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const ok = await register(name, email, password);
    if (!ok) {
      setError("Registration failed. Email may already be in use.");
    } else {
      setSuccess("Registration successful! Please login.");
      setIsRegisterMode(false);
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    }
  };

  const handleDemoLogin = async () => {
    setError("");
    setSuccess("");

    // If it takes more than 2s, show "Waking up server"
    const timer = setTimeout(() => setIsWakingUp(true), 2000);

    const ok = await login("demo@gmail.com", "demo123");

    clearTimeout(timer);
    setIsWakingUp(false);

    if (!ok) {
      setError("Demo login failed. Please contact the administrator.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 relative">
      {/* Demo Button - Responsive positioning */}
      <div className="fixed top-4 right-4 sm:absolute sm:top-6 sm:right-6 z-10">
        <button
          onClick={handleDemoLogin}
          disabled={isLoading}
          className="bg-indigo-600 text-white px-4 sm:px-6 py-2 rounded-full font-bold shadow-lg 
                     hover:bg-indigo-700 transition-all transform hover:scale-105
                     disabled:bg-indigo-400 disabled:cursor-not-allowed text-sm sm:text-base"
        >
          {isLoading ? (isWakingUp ? "Waking up server..." : "Wait...") : "Demo"}
        </button>
      </div>

      <div className="bg-white w-full max-w-md p-8 rounded-xl shadow-lg">
        <form
          onSubmit={isRegisterMode ? handleRegister : handleLogin}
          className="space-y-5"
        >
          <h1 className="text-3xl font-bold text-center text-gray-800">
            {isRegisterMode ? "Register" : "Login"}
          </h1>

          <p className="text-sm text-center text-gray-500">
            {isRegisterMode
              ? "Create a new account"
              : "Please login to use the platform"}
          </p>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          {success && (
            <p className="text-green-600 text-sm text-center">{success}</p>
          )}

          {isRegisterMode && (
            <div>
              <label className="text-sm text-gray-700">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none
                           focus:ring-2 focus:ring-indigo-500
                           text-black dark:text-black"
                required
                disabled={isLoading}
              />
            </div>
          )}

          <div>
            <label className="text-sm text-gray-700">Email</label>
            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none
                         focus:ring-2 focus:ring-indigo-500
                         text-black dark:text-black"
              required
              disabled={isLoading}
            />
          </div>

          <div className="relative">
            <label className="text-sm text-gray-700">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none
                         focus:ring-2 focus:ring-indigo-500 pr-12
                         text-black dark:text-black"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-500 hover:text-indigo-600"
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>


          {isRegisterMode && (
            <div className="relative">
              <label className="text-sm text-gray-700">
                Confirm Password
              </label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none
                           focus:ring-2 focus:ring-indigo-500 pr-12
                           text-black dark:text-black"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-9 text-gray-500 hover:text-indigo-600"
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-2 rounded-full font-semibold hover:bg-indigo-700 transition disabled:bg-indigo-400 disabled:cursor-not-allowed"
          >
            {isLoading ? "Processing..." : (isRegisterMode ? "Register" : "Login")}
          </button>

          <p className="text-sm text-center text-gray-600">
            {isRegisterMode
              ? "Already have an account?"
              : "Don't have an account?"}{" "}
            <button
              type="button"
              className="text-indigo-600 font-semibold underline hover:text-indigo-700 disabled:opacity-50"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setError("");
                setSuccess("");
              }}
              disabled={isLoading}
            >
              {isRegisterMode ? "Login" : "Register"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
