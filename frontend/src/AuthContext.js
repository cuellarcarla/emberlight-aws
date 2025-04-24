import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async ({ username, password }) => {
    try {
      const response = await fetch("http://localhost:8000/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include", // Important for session cookies
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Login failed");

      setUser({ username: data.username, email: data.email });
    } catch (err) {
      throw err;
    }
  };

  const logout = async () => {
    await fetch("http://localhost:8000/auth/logout/", {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);