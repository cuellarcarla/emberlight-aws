const mongoose = require("mongoose");

const ExerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  duration: { type: Number, required: true },
  restTime: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  // Remove this if routine should not be part of Exercise directly
  // routine: { type: mongoose.Schema.Types.ObjectId, ref: "Routine" }  // Reference to Routine
});

module.exports = mongoose.model("Exercise", ExerciseSchema);
