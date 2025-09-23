"use client";
import {
  GoogleMap,
  useJsApiLoader,
  Polygon,
  Marker,
} from "@react-google-maps/api";
import { useState, useCallback, useEffect } from "react";

const containerStyle = {
  width: "100%",
  height: "500px",
};

const center = {
  lat: 6.9271, // Colombo
  lng: 79.8612,
};

export default function GeofenceGoogleMap() {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  const [areas, setAreas] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  useEffect(() => {
    fetch("/api/geofence")
      .then((res) => res.json())
      .then((data) => setAreas(data));
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {
          setUserLocation(null);
        },
        { enableHighAccuracy: true }
      );
    }
  }, []);

  const [map, setMap] = useState(null);
  const onLoad = useCallback((map: any) => setMap(map), []);
  const onUnmount = useCallback(() => setMap(null), []);

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={userLocation || center}
      zoom={13}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      {/* Render geofence polygons */}
      {areas.map((area, idx) => (
        <Polygon
          key={area._id || idx}
          paths={area.coordinates}
          options={{
            fillColor: "#1976d2",
            strokeColor: "#1976d2",
            strokeOpacity: 0.8,
            fillOpacity: 0.2,
          }}
        />
      ))}
      {/* Render user location marker */}
      {userLocation && <Marker position={userLocation} label="You" />}
    </GoogleMap>
  ) : (
    <div>Loading...</div>
  );
}
