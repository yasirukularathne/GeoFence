import React, { useRef } from "react";
import { MapContainer, TileLayer, FeatureGroup, useMap } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

const center = [6.9271, 79.8612]; // Example: Colombo

const GeofenceSearchBar: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const map = useMap();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = inputRef.current?.value;
    if (!query) return;
    // Use Nominatim for free geocoding
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query
    )}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data && data.length > 0) {
      const { lat, lon, display_name } = data[0];
      map.setView([parseFloat(lat), parseFloat(lon)], 16);
      L.popup()
        .setLatLng([parseFloat(lat), parseFloat(lon)])
        .setContent(`<b>${display_name}</b>`)
        .openOn(map);
    } else {
      alert("Location not found");
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      style={{
        position: "absolute",
        top: 16,
        left: 16,
        right: 16,
        zIndex: 1000,
        background: "#fff",
        padding: 8,
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        maxWidth: 400,
        width: "calc(100vw - 32px)",
        gap: 8,
      }}
    >
      <input
        ref={inputRef}
        type="text"
        placeholder="Search for a place..."
        style={{
          padding: 8,
          borderRadius: 4,
          border: "1px solid #ccc",
          flex: 1,
          minWidth: 0,
          fontSize: 16,
        }}
      />
      <button
        type="submit"
        style={{
          padding: "8px 16px",
          borderRadius: 4,
          background: "#2196f3",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          fontWeight: 600,
          fontSize: 16,
        }}
      >
        Search
      </button>
    </form>
  );
};

export default GeofenceSearchBar;
