import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  const login = ({ username, email, accessToken }) => {
    setUser({ username, email });
    setAccessToken(accessToken);
  };

  const refreshAccessToken = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/refresh", {
        method: "POST",
        credentials: "include", // Sends HttpOnly cookies to refresh access token
      });

      const data = await response.json();
      if (response.ok) setAccessToken(data.access_token);
    } catch (err) {
      console.error("Failed to refresh access token:", err);
    }
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
