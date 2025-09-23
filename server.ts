/*
  This file is now deprecated.
  All backend API logic has been migrated to Next.js API routes in /pages/api/geofence.ts.
  You can safely delete this file.
*/

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/geofence";
mongoose.connect(MONGO_URI);
const db = mongoose.connection;
db.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});
db.once("open", () => {
  console.log("MongoDB connected");
});

// Health check endpoint for DB
app.get("/api/health", (req, res) => {
  if (db.readyState === 1) {
    res.json({ status: "ok", db: "connected" });
  } else {
    res.status(500).json({ status: "error", db: "disconnected" });
  }
});

// Routes
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Geofence Mongoose model
const geofenceSchema = new mongoose.Schema(
  {
    topic: String,
    description: String,
    coordinates: Array,
  },
  { timestamps: true }
);
const Geofence = mongoose.model("Geofence", geofenceSchema);

// GET all geofences from MongoDB
app.get("/api/geofence", async (req, res) => {
  try {
    const geofences = await Geofence.find();
    res.json(geofences);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new geofence to MongoDB
app.post("/api/geofence", async (req, res) => {
  try {
    const { topic, description, coordinates } = req.body;
    const newGeofence = new Geofence({ topic, description, coordinates });
    await newGeofence.save();
    res.status(201).json(newGeofence);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update geofence in MongoDB
app.put("/api/geofence/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { topic, description, coordinates } = req.body;
    const updated = await Geofence.findByIdAndUpdate(
      id,
      { topic, description, coordinates },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE geofence from MongoDB
app.delete("/api/geofence/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Geofence.findByIdAndDelete(id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
