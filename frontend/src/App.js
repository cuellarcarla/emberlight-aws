import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from "react-router-dom";
import MainNavbar from "./components/MainNavbar";
import AppNavbar from "./components/AppNavbar";
import Login from "./pages/Login";
import Community from "./pages/Community";
import Fitness from "./pages/Fitness";
import NotFound from "./pages/NotFound";
import MainPage from "./pages/MainPage";
import Chat from "./pages/Chat";
import { useAuth } from "./contexts/AuthContext";
import { useEffect } from "react";

const Layout = ({ children }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const showMainNavbar = ["/", "/login"].includes(location.pathname);

  return (
    <>
      {showMainNavbar ? <MainNavbar /> : <AppNavbar username={user?.username} onLogout={logout} />}
      {children}
    </>
  );
};

function App() {
  const { user } = useAuth();

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/fitness" replace /> : <MainPage />} />
          <Route path="/login" element={user ? <Navigate to="/fitness" replace /> : <Login />} />
          <Route path="/fitness" element={user ? <Fitness /> : <Navigate to="/login" replace />} />
          <Route path="/community" element={user ? <Community /> : <Navigate to="/login" replace />} />
          <Route path="/chat" element={user ? <Chat /> : <Navigate to="/login" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;