import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { useAuth } from "../AuthContext";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:8000/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include", // Important: Enables HttpOnly cookies
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      // Login using JWT tokens + user info
      login({ 
        username: data.username, 
        email: data.email, 
        accessToken: data.access_token 
      });

      navigate("/fitness");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-wrapper">
        <div className="login-inspire">
            <p>“Si puedes leer esto es porque tienes ojos. No sé qué más poner aqui lorem ipsum”</p>
        </div>
        <div className="login-container">
            <h2>Login</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                />
                <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                />
                <button type="submit">Login</button>
            </form>
        </div>
    </div>
  );
}

export default Login;
