"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  GoogleMap,
  Marker,
  Polygon,
  useJsApiLoader,
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "500px",
  borderRadius: "12px",
};

const center = {
  lat: 6.9271, // Colombo
  lng: 79.8612,
};

interface GeofenceArea {
  topic: string;
  description: string;
  coordinates: { lat: number; lng: number }[];
  _id?: string;
}

const GeofenceGoogleMap: React.FC = () => {
  const [areas, setAreas] = useState<GeofenceArea[]>([]);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  useEffect(() => {
    fetch("/api/geofence")
      .then((res) => res.json())
      .then((data) => setAreas(data));

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => setUserLocation(null),
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
      zoom={userLocation ? 17 : 13}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      {/* Render geofence polygons */}
      {areas.map((area, idx) => (
        <Polygon
          key={area._id || idx}
          paths={area.coordinates}
          options={{
            strokeColor: "#1976d2",
            fillColor: "#1976d2",
            fillOpacity: 0.2,
          }}
        />
      ))}
      {/* Render user location marker */}
      {userLocation && <Marker position={userLocation} />}
    </GoogleMap>
  ) : (
    <div>Loading Google Map...</div>
  );
};

export default GeofenceGoogleMap;
