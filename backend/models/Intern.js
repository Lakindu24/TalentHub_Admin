const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ["Present", "Absent"], default: "Absent" },
  timeMarked: { type: Date }, // The actual time when attendance was marked
  type: { type: String, enum: ["manual", "qr", "daily_qr"], default: "manual" }, // Type of attendance marking
  markedBy: { type: String }, // Who marked the attendance (e.g., "external_system", "admin", etc.)
  sessionId: { type: String } // QR session ID or other identifier
});

const internSchema = new mongoose.Schema({
  traineeId: { type: String, required: true, unique: true },
  traineeName: { type: String, required: true },
  fieldOfSpecialization: { type: String, required: true },
  homeAddress: { type: String, default: "" },
  trainingStartDate: { type: Date },
  trainingEndDate: { type: Date },  
  institute: { type: String, default: "" },  
  team: { type: String, default: "" },
  email: { type: String, default: "" },
  attendance: [attendanceSchema],
  availableDays: {
    type: [String],
    enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    default: [],
  },
}, { timestamps: true });  // Consider adding timestamps for tracking

module.exports = mongoose.model("Intern", internSchema);