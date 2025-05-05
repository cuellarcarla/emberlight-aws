import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MainNavbar from "./components/MainNavbar";
import AppNavbar from "./components/AppNavbar";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import MainPage from "./pages/MainPage";
import JournalPage from "./pages/JournalPage";
import ChatPage from "./pages/ChatPage";

const Layout = ({ children }) => {
  return (
    <>
      <MainNavbar />
      {children}
    </>
  );
};

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/calendar" element={<JournalPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;