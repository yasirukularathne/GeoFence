import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";

if (!mongoose.connections[0].readyState) {
  mongoose.connect(MONGODB_URI);
}

const ClientLocationSchema = new mongoose.Schema({
  clientId: String,
  lat: Number,
  lng: Number,
  punchStatus: { type: String, default: "" },
  timestamp: { type: Date, default: Date.now },
});

const ClientLocation =
  mongoose.models.ClientLocation ||
  mongoose.model("ClientLocation", ClientLocationSchema);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { clientId, lat, lng, punchStatus } = req.body;
    if (!clientId || lat == null || lng == null) {
      return res.status(400).json({ error: "Missing clientId or coordinates" });
    }
    const location = await ClientLocation.findOneAndUpdate(
      { clientId },
      { lat, lng, punchStatus: punchStatus || "", timestamp: new Date() },
      { upsert: true, new: true }
    );
    return res.status(200).json(location);
  }
  if (req.method === "GET") {
    const locations = await ClientLocation.find({});
    return res.status(200).json(locations);
  }
  res.status(405).end();
}
