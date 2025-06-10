import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from "react-router-dom";
import MainNavbar from "./components/MainNavbar";
import AppNavbar from "./components/AppNavbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import MainPage from "./pages/MainPage";
import JournalPage from "./pages/JournalPage";
import ChatPage from "./pages/ChatPage";
import { useAuth } from "./contexts/AuthContext";
import About from './pages/About';
import Contact from './pages/Contact';

const Layout = ({ children, theme, toggleTheme }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const showMainNavbar = ["/", "/login", "/register", "/about", "/contact"].includes(location.pathname);

  return (
    <>
      {showMainNavbar ? (
        <MainNavbar />
      ) : (
        <AppNavbar
          username={user?.username}
          onLogout={logout}
          theme={theme}
          toggleTheme={toggleTheme}
        />
      )}
      {children}
    </>
  );
};

function App() {
  const { user, loading } = useAuth();
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    if (theme === 'dark') {
      document.body.setAttribute('data-theme', 'dark');
    } else {
      document.body.removeAttribute('data-theme');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <Router>
      <Layout theme={theme} toggleTheme={toggleTheme}>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/journal" replace /> : <MainPage />} />
          <Route path="/login" element={user ? <Navigate to="/journal" replace /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/journal" replace /> : <Register />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/chat" element={user ? <ChatPage /> : <Navigate to="/login" replace />} />
          <Route path="/journal" element={user ? <JournalPage /> : <Navigate to="/login" replace />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
