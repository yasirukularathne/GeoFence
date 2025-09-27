import React, { useEffect, useState, useRef } from "react";
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
import FindLocationButton from "./FindLocationButton";
import { FaRegHandPointer } from "react-icons/fa";

const center = [6.9271, 79.8612]; // Default center (Colombo)

interface GeofenceArea {
  topic: string;
  description: string;
  coordinates: { lat: number; lng: number }[];
  _id?: string;
}

const variantClasses = {
  default: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  filled: "bg-emerald-600 text-white hover:bg-emerald-700",
};

function CustomButton({ children, variant = "default", ...props }) {
  const classes = `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variantClasses[variant]}`;
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}

const GeofenceClientMap: React.FC = () => {
  const [areas, setAreas] = useState<GeofenceArea[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const [locating, setLocating] = useState(false);
  const [showAccuracyMsg, setShowAccuracyMsg] = useState(false);
  const mapRef = useRef<any>(null);

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

  useEffect(() => {
    let watchId: number | null = null;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        },
        () => {
          setUserLocation(null);
        },
        { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
      );
    }
    return () => {
      if (watchId !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  useEffect(() => {
    setShowAccuracyMsg(true);
    // Optionally auto-hide after a few seconds
    const timer = setTimeout(() => setShowAccuracyMsg(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  function handleFindLocation() {
    setLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude]);
          setLocating(false);
          if (mapRef.current) {
            mapRef.current.setView(
              [pos.coords.latitude, pos.coords.longitude],
              18
            );
          }
        },
        () => {
          setUserLocation(null);
          setLocating(false);
        },
        { enableHighAccuracy: true }
      );
    } else {
      setLocating(false);
    }
  }

  // Helper function to check if user is inside any geofence area
  function isUserInGeofence(
    userLoc: [number, number] | null,
    areas: GeofenceArea[]
  ): boolean {
    if (!userLoc) return false;
    // Simple point-in-polygon check for each area
    function pointInPolygon(
      point: [number, number],
      vs: { lat: number; lng: number }[]
    ) {
      let x = point[0],
        y = point[1];
      let inside = false;
      for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        let xi = vs[i].lat,
          yi = vs[i].lng;
        let xj = vs[j].lat,
          yj = vs[j].lng;
        let intersect =
          yi > y !== yj > y &&
          x < ((xj - xi) * (y - yi)) / (yj - yi + 0.00001) + xi;
        if (intersect) inside = !inside;
      }
      return inside;
    }
    return areas.some((area) => pointInPolygon(userLoc, area.coordinates));
  }

  // Helper to generate a unique client ID (for demo, use localStorage)
  function getClientId() {
    let id = localStorage.getItem("clientId");
    if (!id) {
      id = Math.random().toString(36).substr(2, 9);
      localStorage.setItem("clientId", id);
    }
    return id;
  }

  function isLaptopOrDesktop() {
    const ua = navigator.userAgent;
    // Simple check for common desktop OS/browser strings
    return (
      /Windows|Macintosh|Linux|X11/.test(ua) &&
      !/Android|iPhone|iPad|Mobile/.test(ua)
    );
  }

  // Send location to backend whenever it changes
  useEffect(() => {
    if (userLocation && !isLaptopOrDesktop()) {
      const [lat, lng] = userLocation;
      fetch("/api/client-location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: getClientId(), lat, lng }),
      });
    }
  }, [userLocation]);

  return (
    <Container maxWidth="sm" sx={{ py: 2, px: { xs: 0, sm: 2 } }}>
      <AppBar
        position="static"
        color="primary"
        sx={{ borderRadius: { xs: 0, sm: 2 }, mb: 2 }}
      >
        <Toolbar sx={{ px: { xs: 1, sm: 2 } }}>
          <LocationOnIcon sx={{ mr: 1 }} />
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
          >
            GeoFence Client Map
          </Typography>
        </Toolbar>
      </AppBar>
      <Card sx={{ borderRadius: { xs: 0, sm: 3 }, boxShadow: 4, mb: 2 }}>
        <CardContent sx={{ px: { xs: 1, sm: 2 } }}>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 2, fontSize: { xs: "0.95rem", sm: "1rem" } }}
          >
            View geofence areas and your real-time location. Move around to see
            your position update!
          </Typography>
          <Box
            sx={{
              width: "100%",
              height: { xs: 350, sm: 500 },
              borderRadius: { xs: 0, sm: 3 },
              overflow: "hidden",
            }}
          >
            <MapContainer
              ref={mapRef}
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
      {/* Punch In button if user is inside geofence */}
      {isUserInGeofence(userLocation, areas) && (
        <CustomButton
          variant="filled"
          style={{
            position: "fixed",
            bottom: 16,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 2000,
            width: "96vw",
            maxWidth: 420,
            minWidth: 180,
            fontSize: "1.15rem",
            fontWeight: 700,
            boxShadow: "0 4px 24px rgba(33, 150, 243, 0.15)",
            transition: "transform 0.15s cubic-bezier(.4,2,.6,1)",
            background: "linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)",
            color: "#222",
            letterSpacing: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            padding: "14px 0",
            border: "none",
            outline: "none",
            touchAction: "manipulation",
            userSelect: "none",
          }}
          onTouchStart={(e) =>
            (e.currentTarget.style.transform = "scale(0.97)")
          }
          onTouchEnd={(e) => (e.currentTarget.style.transform = "scale(1)")}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          onClick={async () => {
            // Save punch status in database
            const [lat, lng] = userLocation!;
            await fetch("/api/client-location", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                clientId: getClientId(),
                lat,
                lng,
                punchStatus: "punched-in",
              }),
            });
            alert("Punched in!");
          }}
        >
          <FaRegHandPointer
            style={{
              fontSize: 22,
              marginRight: 6,
              color: "#1976d2",
            }}
          />
          Punch In
        </CustomButton>
      )}
      <FindLocationButton onClick={handleFindLocation} loading={locating} />
      {showAccuracyMsg && (
        <div
          style={{
            position: "fixed",
            top: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#fff",
            color: "#1976d2",
            padding: "8px 16px",
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            fontWeight: 600,
            fontSize: "1rem",
            zIndex: 3000,
            maxWidth: "90vw",
          }}
        >
          Location accuracy may vary. Please ensure GPS is enabled.
        </div>
      )}
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
