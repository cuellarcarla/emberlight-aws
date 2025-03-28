require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const postRoutes = require("./routes/postRoutes");
const routineRoutes = require("./routes/routineRoutes");
const exerciseRoutes = require("./routes/exerciseRoutes");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch(err => console.error("MongoDB connection error:", err));

app.use("/api/posts", postRoutes);
app.use("/api/routines", routineRoutes);
app.use("/api/exercises", exerciseRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
