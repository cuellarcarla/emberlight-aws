const mongoose = require("mongoose");

const RoutineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  exercises: [{ type: mongoose.Schema.Types.ObjectId, ref: "Exercise" }]  // Array of exercise IDs
});

module.exports = mongoose.model("Routine", RoutineSchema);
