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
  Trainee_ID: { type: String, required: true, unique: true },
  Trainee_Name: { type: String, required: true },
  field_of_spec_name: { type: String, required: true },
  Training_StartDate: { type: Date },
  Training_EndDate: { type: Date },
  Institute: { type: String, default: "" },
  Trainee_Email: { type: String, default: "" },
  Trainee_HomeAddress: { type: String, default: "" },
  team: { type: String, default: "" },
  attendance: [attendanceSchema],
  availableDays: {
    type: [String],
    enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    default: [],
  },
}, { timestamps: true });

module.exports = mongoose.model("Intern", internSchema);