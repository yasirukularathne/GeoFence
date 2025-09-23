import React, { useRef } from "react";
import { MapContainer, TileLayer, FeatureGroup } from "react-leaflet";
import GeofenceSearchBar from "./GeofenceSearchBar";

import { EditControl } from "react-leaflet-draw";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

const center = [6.9271, 79.8612]; // Example: Colombo

const GeofenceMapLeaflet: React.FC = () => {
  const drawnItemsRef = useRef<any>(null);

  const handleCreated = (e: any) => {
    const layer = e.layer;
    if (layer instanceof L.Polygon) {
      const latlngsRaw = layer.getLatLngs();
      let latlngs: { lat: number; lng: number }[] = [];
      if (Array.isArray(latlngsRaw[0])) {
        latlngs = (latlngsRaw[0] as L.LatLng[]).map((latlng: L.LatLng) => ({
          lat: latlng.lat,
          lng: latlng.lng,
        }));
      } else {
        latlngs = (latlngsRaw as L.LatLng[]).map((latlng: L.LatLng) => ({
          lat: latlng.lat,
          lng: latlng.lng,
        }));
      }
      console.log("Polygon coordinates:", latlngs);
      // You can send latlngs to your backend here
    }
  };

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "0 auto",
        padding: 16,
        position: "relative",
      }}
    >
      <MapContainer
        center={center as [number, number]}
        zoom={13}
        style={{ height: "500px", borderRadius: "12px" }}
      >
        <GeofenceSearchBar />
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FeatureGroup ref={drawnItemsRef}>
          <EditControl
            position="topright"
            onCreated={handleCreated}
            draw={{
              polygon: true,
              rectangle: true,
              circle: true,
              marker: true,
              polyline: true,
            }}
            edit={{
              remove: true,
            }}
          />
        </FeatureGroup>
      </MapContainer>
    </div>
  );
};

export default GeofenceMapLeaflet;
