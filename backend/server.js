require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect(err => {
  if (err) {
    console.error("Database connection failed:", err.stack);
    return;
  }
  console.log("Connected to MariaDB.");
});

io.on("connection", (socket) => {
  console.log("A client connected");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Create Post (POST /api/posts)
app.post("/api/posts", (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required" });
  }

  const sql = "INSERT INTO posts (title, content) VALUES (?, ?)";
  db.query(sql, [title, content], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    const newPost = { id: result.insertId, title, content };
    io.emit("new_post", newPost);

    res.status(201).json({ id: result.insertId, title, content });
  });
});

// Get All Posts (GET /api/posts)
app.get("/api/posts", (req, res) => {
  db.query("SELECT * FROM posts", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Start Server
/*const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
*/

server.listen(5000, () => {
  console.log("Server running on port 5000");
});

