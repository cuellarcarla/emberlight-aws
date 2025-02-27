import { useState } from "react";
import "./Login.css";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("http://localhost:5000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (response.ok) {
      onLogin(data.token);
    } else {
      alert(data.error);
    }
  };

  return (
    <div class="login-wrapper">
        <div class="login-inspire">
            <p>“Si puedes leer esto es porque tienes ojos. No sé qué más poner aqui lorem ipsum”</p>
        </div>
        <div className="login-container">
            <h2>Login</h2>
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
