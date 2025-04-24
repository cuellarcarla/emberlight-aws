import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));

      // Move token refresh logic inside useEffect
      const fetchAccessToken = async () => {
        try {
          const response = await fetch("http://localhost:8000/auth/refresh/", {
            method: "POST",
            credentials: "include", // Required for HttpOnly cookies
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({}), // Empty body, server reads from cookie
          });
      
          const data = await response.json();
          if (response.ok) {
            setAccessToken(data.access_token);
          } else {
            console.error("Refresh failed:", data);
            logout();
          }
        } catch (err) {
          console.error("Failed to refresh access token:", err);
        }
      };      

      fetchAccessToken();
    }
  }, []);

  const login = async ({ username, email }) => {
    const userData = { username, email };
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));

    // Refresh token after login
    try {
      const response = await fetch("http://localhost:8000/auth/refresh/", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });
      const data = await response.json();
      if (response.ok) {
        setAccessToken(data.access_token);
      } else {
        console.error("Refresh failed after login:", data);
      }
    } catch (err) {
      console.error("Token refresh failed after login:", err);
    }
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem("user");

    // Optionally clear the refresh cookie
    fetch("http://localhost:8000/auth/logout/", {
      method: "POST",
      credentials: "include",
    }).catch((err) => console.error("Logout failed:", err));
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
