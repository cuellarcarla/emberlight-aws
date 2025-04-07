import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedAccessToken = localStorage.getItem("accessToken");

    if (storedUser && storedAccessToken) {
      setUser(JSON.parse(storedUser));
      setAccessToken(storedAccessToken);
    }
  }, []);

  const login = ({ username, email, accessToken }) => {
    const userData = { username, email };
    setUser(userData);
    setAccessToken(accessToken);

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("accessToken", accessToken);
  };

  const refreshAccessToken = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/refresh", {
        method: "POST",
        credentials: "include", // Sends HttpOnly cookies to refresh access token
      });

      const data = await response.json();
      if (response.ok) {
        setAccessToken(data.access_token);
        localStorage.setItem("accessToken", data.access_token);
      }
    } catch (err) {
      console.error("Failed to refresh access token:", err);
    }
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
