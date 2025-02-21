import { Link } from "react-router-dom";
import { FaBell, FaRegQuestionCircle, FaUser } from "react-icons/fa";
import { IconContext } from "react-icons";
import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-left">
        <img src="/logo.png" alt="Logo" className="logo" />
        <Link to="/fitness" className="nav-link">FITNESS</Link>
        <Link to="/" className="nav-link">COMMUNITY</Link>
      </div>
      <div className="nav-right">
        <span className="user">Bienvenido, Usuario!</span>
        <IconContext.Provider
          value={{ className: "nav-icon" }}
        >
          <FaBell />
          <FaRegQuestionCircle />
          <FaUser />
        </IconContext.Provider>
      </div>
    </nav>
  );
};

export default Navbar;
