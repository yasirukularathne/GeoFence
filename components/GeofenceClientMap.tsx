import React, { useEffect, useState } from "react";
import * as leaflet from "leaflet";
import { MapContainer, TileLayer, Polygon, Popup, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import LocationOnIcon from "@mui/icons-material/LocationOn";

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
    fetch("/api/geofence")
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
    <Container maxWidth="sm" sx={{ py: 2 }}>
      <AppBar position="static" color="primary" sx={{ borderRadius: 2, mb: 2 }}>
        <Toolbar>
          <LocationOnIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            GeoFence Client Map
          </Typography>
        </Toolbar>
      </AppBar>
      <Card sx={{ borderRadius: 3, boxShadow: 4, mb: 2 }}>
        <CardContent>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            View geofence areas and your real-time location. Move around to see
            your position update!
          </Typography>
          <Box
            sx={{
              width: "100%",
              height: 500,
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <MapContainer
              center={(userLocation || center) as [number, number]}
              zoom={16}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {/* Show geofence areas */}
              {areas.map((area, idx) => (
                <Polygon
                  key={area._id || idx}
                  positions={area.coordinates.map((pt) => [pt.lat, pt.lng])}
                  pathOptions={{ color: "#1976d2" }}
                >
                  <Popup>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {area.topic}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {area.description}
                    </Typography>
                  </Popup>
                </Polygon>
              ))}
              {/* Show user's location */}
              {userLocation && (
                <Marker
                  position={userLocation}
                  icon={leaflet.divIcon({
                    className: "custom-user-icon",
                    html: `<div style='display: flex; align-items: center; justify-content: center;'>
                        <svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='#1976d2'>
                          <path d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/>
                        </svg>
                      </div>`,
                  })}
                >
                  <Popup>
                    <Typography variant="subtitle1" fontWeight={700}>
                      Your Location
                    </Typography>
                  </Popup>
                </Marker>
              )}
            </MapContainer>
          </Box>
        </CardContent>
      </Card>
      <Box
        sx={{
          textAlign: "center",
          mt: 2,
          color: "text.secondary",
        }}
      >
        <Typography variant="caption">
          Powered by GeoFence & OpenStreetMap
        </Typography>
      </Box>
    </Container>
  );
};

export default GeofenceClientMap;
