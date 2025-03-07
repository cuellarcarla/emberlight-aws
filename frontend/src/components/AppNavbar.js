import { Link, useNavigate } from "react-router-dom";
import { FaBell, FaRegQuestionCircle, FaUser } from "react-icons/fa";
import { IconContext } from "react-icons";
import "./AppNavbar.css";
import { useAuth } from "../AuthContext";
import { useState } from "react";

const AppNavbar = () => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/fitness" className="logo-link">
          <img src="/logo.png" alt="Logo" className="logo"></img>
        </Link>
        <Link to="/fitness" className="nav-link">FITNESS</Link>
        <Link to="/community" className="nav-link">COMMUNITY</Link>
      </div>
      <div className="nav-right">
      {user && <span className="user">Bienvenido, {user.username}!</span>}
        <IconContext.Provider
          value={{ className: "nav-icon" }}
        >
          <FaBell />
          <FaRegQuestionCircle />
          <div className="user-icon" onClick={toggleDropdown}>
            <FaUser />
          </div>
        </IconContext.Provider>
        {dropdownOpen && (
          <div className="dropdown">
            <div className="logout-option" onClick={handleLogout}>Logout</div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default AppNavbar;
