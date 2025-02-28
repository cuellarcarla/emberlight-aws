import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import MainNavbar from "./components/MainNavbar";
import AppNavbar from "./components/AppNavbar";
import Login from "./pages/Login";
import Community from "./pages/Community";
import Fitness from "./pages/Fitness";

const Layout = ({ isLoggedIn, username, onLogout, children }) => {
  const location = useLocation();
  const showMainNavbar = ["/", "/login"].includes(location.pathname);

  return (
    <>
      {showMainNavbar ? <MainNavbar /> : <AppNavbar username={username} onLogout={onLogout} />}
      {children}
    </>
  );
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setIsLoggedIn(true);
      setUsername(user);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUsername("");
  };

  return (
    <Router>
      <Layout isLoggedIn={isLoggedIn} username={username} onLogout={handleLogout}>
        <Routes>
          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} setUsername={setUsername} />} />
          <Route path="/community" element={isLoggedIn ? <Community /> : <Navigate to="/login" />} />
          <Route path="/fitness" element={isLoggedIn ? <Fitness /> : <Navigate to="/login" />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
