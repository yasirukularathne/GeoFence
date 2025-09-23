import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";

const MONGO_URI = process.env.MONGODB_URI || "";
if (!mongoose.connection.readyState) {
  mongoose.connect(MONGO_URI);
}

const geofenceSchema = new mongoose.Schema(
  {
    topic: String,
    description: String,
    coordinates: Array,
  },
  { timestamps: true }
);
const Geofence =
  mongoose.models.Geofence || mongoose.model("Geofence", geofenceSchema);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const geofences = await Geofence.find();
      res.status(200).json(geofences);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else if (req.method === "POST") {
    try {
      const { topic, description, coordinates } = req.body;
      const newGeofence = new Geofence({ topic, description, coordinates });
      await newGeofence.save();
      res.status(201).json(newGeofence);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else if (req.method === "PUT") {
    try {
      const { id, topic, description, coordinates } = req.body;
      const updated = await Geofence.findByIdAndUpdate(
        id,
        { topic, description, coordinates },
        { new: true }
      );
      if (!updated) return res.status(404).json({ error: "Not found" });
      res.status(200).json(updated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else if (req.method === "DELETE") {
    try {
      const { id } = req.body;
      await Geofence.findByIdAndDelete(id);
      res.status(204).end();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
