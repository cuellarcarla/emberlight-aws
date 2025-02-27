/*import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import AppNavbar from "./components/AppNavbar";
import MainNavbar from "./components/MainNavbar";
import Community from "./pages/Community";
import Fitness from "./pages/Fitness";
import Login from "./pages/Login";

const App = () => {
  return (
    <Router>
      <AppNavbar />
      <Routes>
        <Route path="/fitness" element={<Fitness />} />
        <Route path="/community" element={<Community />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
};

export default App;*/
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import MainNavbar from "./components/MainNavbar";
import AppNavbar from "./components/AppNavbar";
import Login from "./pages/Login";
import Community from "./pages/Community";
import Fitness from "./pages/Fitness";
//import Home from "./pages/Home";
//import Register from "./pages/Register";

const Layout = ({ children }) => {
  const location = useLocation();
  const showMainNavbar = ["/", "/login"].includes(location.pathname);

  return (
    <>
      {showMainNavbar ? <MainNavbar /> : <AppNavbar />}
      {children}
    </>
  );
};

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/community" element={<Community />} />
          <Route path="/fitness" element={<Fitness />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
