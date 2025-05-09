require("dotenv").config();
const express = require("express");
const cors = require("cors");
const AWS = require("aws-sdk");

const postRoutes = require("./routes/postRoutes");
const routineRoutes = require("./routes/routineRoutes");
const exerciseRoutes = require("./routes/exerciseRoutes");

const app = express();
app.use(cors());
app.use(express.json());

AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sessionToken: process.env.AWS_SESSION_TOKEN,
});

app.use("/api/posts", postRoutes);
app.use("/api/routines", routineRoutes);
app.use("/api/exercises", exerciseRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
