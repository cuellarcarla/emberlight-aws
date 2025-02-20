import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav style={styles.nav}>
      <img src="/logo.png" alt="Logo" style={styles.logo} />
      <div style={styles.links}>
        <Link to="/">Community</Link>
        <Link to="/dashboard">Dashboard</Link>
      </div>
      <img src="/user.png" alt="User" style={styles.user} />
    </nav>
  );
};

const styles = {
  nav: {
    display: "flex",
    justifyContent: "start",
    padding: "10px 20px",
    background: "#fff",
    color: "#686868",
    alignItems: "center",
  },
  logo: { height: "40px" },
  user: { height: "40px", borderRadius: "50%" },
  links: { display: "flex", gap: "15px" },
};

export default Navbar;
