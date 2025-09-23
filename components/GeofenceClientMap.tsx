import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polygon, Popup, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const center = [6.9271, 79.8612]; // Default center (Colombo)

interface GeofenceArea {
  topic: string;
  description: string;
  coordinates: { lat: number; lng: number }[];
  _id?: string;
}

const GeofenceClientMap: React.FC = () => {
  const [areas, setAreas] = useState<GeofenceArea[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );

  useEffect(() => {
    // Fetch geofence areas from backend
    fetch("http://localhost:5000/api/geofence")
      .then((res) => res.json())
      .then((data) => setAreas(data));

    // Get user's real location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        },
        () => {
          setUserLocation(null);
        }
      );
    }
  }, []);

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 16 }}>
      <MapContainer
        center={(userLocation || center) as [number, number]}
        zoom={13}
        style={{ height: "500px", borderRadius: "12px" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {/* Show geofence areas */}
        {areas.map((area, idx) => (
          <Polygon
            key={area._id || idx}
            positions={area.coordinates.map((pt) => [pt.lat, pt.lng])}
            pathOptions={{ color: "red" }}
          >
            <Popup>
              <strong>{area.topic}</strong>
              <br />
              <span>{area.description}</span>
            </Popup>
          </Polygon>
        ))}
        {/* Show user's location */}
        {userLocation && (
          <Marker position={userLocation}>
            <Popup>Your Location</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default GeofenceClientMap;
