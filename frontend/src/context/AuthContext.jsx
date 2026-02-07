import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(
    JSON.parse(sessionStorage.getItem("user")) || null
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const savedUser = sessionStorage.getItem("user");

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      const { token, name, email: userEmail } = res.data;

      sessionStorage.setItem("token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const loggedUser = {
        name,
        email: userEmail,
      };

      sessionStorage.setItem("user", JSON.stringify(loggedUser));
      setUser(loggedUser);

      return true;
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setIsLoading(true);
    try {
      await api.post("/auth/register", { name, email, password });
      return true;
    } catch (err) {
      console.error("REGISTER ERROR:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    api.defaults.headers.common["Authorization"] = "";
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
