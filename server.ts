const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost:27017/geolocation"
);

mongoose.connection.on("connected", () => {
  console.log("MongoDB connected successfully");
});
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

const GeofenceSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  description: { type: String, required: true },
  coordinates: [{ lat: Number, lng: Number }],
});

const Geofence = mongoose.model("Geofence", GeofenceSchema);

// Create geofence
app.post("/api/geofence", async (req, res) => {
  try {
    const { topic, description, coordinates } = req.body;
    const geofence = new Geofence({ topic, description, coordinates });
    await geofence.save();
    res.status(201).json(geofence);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all geofences
app.get("/api/geofence", async (_req, res) => {
  try {
    const geofences = await Geofence.find();
    res.json(geofences);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PlaceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
});

const Place = mongoose.model("Place", PlaceSchema);

// Create place
app.post("/api/place", async (req, res) => {
  try {
    const { name, description, lat, lng } = req.body;
    const place = new Place({ name, description, lat, lng });
    await place.save();
    res.status(201).json(place);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all places
app.get("/api/place", async (_req, res) => {
  try {
    const places = await Place.find();
    res.json(places);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update place
app.put("/api/place/:id", async (req, res) => {
  try {
    const { name, description } = req.body;
    const place = await Place.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true }
    );
    if (!place) return res.status(404).json({ error: "Place not found" });
    res.json(place);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Root route for health check
app.get("/", (_req, res) => {
  res.send("Geolocation API is running");
});

// Catch-all 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).send("Route not found");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
