import { createContext, useContext, useState, useEffect } from "react";
import { getCookie } from "../utils/cookies";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // On mount, restore session from backend
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:8000/auth/me/", {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Not authenticated");

        const data = await res.json();
        setUser({
          username: data.username,
          email: data.email,
        });
      } catch (err) {
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  const login = async ({ username, password }) => {
    try {
      const response = await fetch("http://localhost:8000/auth/login/", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"), 
        },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Login failed");

      const meRes = await fetch("http://localhost:8000/auth/me/", {
        credentials: "include",
      });
      const meData = await meRes.json();

      setUser({
        username: meData.username,
        email: meData.email,
      });

      return true;
    } catch (err) {
      throw err;
    }
  };

  const logout = async () => {
    await fetch("http://localhost:8000/auth/logout/", {
      method: "POST",
      credentials: "include",
      headers: { 
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrftoken"), 
      },
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
