import React, { useRef, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  FeatureGroup,
  Marker,
  Popup,
  Polygon,
} from "react-leaflet";
import GeofenceSearchBar from "./GeofenceSearchBar";
import GeofenceAreaModal from "./GeofenceAreaModal";

import { EditControl } from "react-leaflet-draw";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { useState } from "react";

const center = [6.9271, 79.8612]; // Example: Colombo

const GeofenceMapLeaflet: React.FC = () => {
  const drawnItemsRef = useRef<any>(null);
  const [places, setPlaces] = useState<
    Array<{
      _id?: string;
      lat: number;
      lng: number;
      name: string;
      description: string;
    }>
  >([]);
  const [newMarker, setNewMarker] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [form, setForm] = useState<{ name: string; description: string }>({
    name: "",
    description: "",
  });
  const [areaModalOpen, setAreaModalOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState<any>(null);
  const [areaForm, setAreaForm] = useState<{
    topic: string;
    description: string;
  }>({ topic: "", description: "" });
  const [areas, setAreas] = useState<
    Array<{
      _id?: string;
      topic: string;
      description: string;
      coordinates: any;
    }>
  >([]);
  const [editPlace, setEditPlace] = useState<{
    _id: string;
    name: string;
    description: string;
  } | null>(null);

  const formatPolygonCoords = (coords: { lat: number; lng: number }[]) =>
    coords.map((pt) => [pt.lat, pt.lng]);

  const handleCreated = (e: any) => {
    const layer = e.layer;
    if (e.layerType === "polygon") {
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
      setSelectedArea(latlngs);
      setAreaModalOpen(true);
      setAreaForm({ topic: "", description: "" });
      // Remove the polygon from the map until confirmed
      layer.remove();
    }
    if (e.layerType === "marker") {
      const { lat, lng } = layer.getLatLng();
      setNewMarker({ lat, lng });
      setForm({ name: "", description: "" });
      // Remove the marker from the map until confirmed
      layer.remove();
    }
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMarker) {
      const newPlace = {
        ...newMarker,
        name: form.name,
        description: form.description,
      };
      savePlaceToBackend(newPlace);
      setNewMarker(null);
      setForm({ name: "", description: "" });
    }
  };

  const handleAreaFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setAreaForm({ ...areaForm, [e.target.name]: e.target.value });
  };

  const handleAreaSave = () => {
    const newArea = {
      topic: areaForm.topic,
      description: areaForm.description,
      coordinates: selectedArea,
    };
    setAreas([...areas, newArea]);
    saveAreaToBackend(newArea);
    setAreaModalOpen(false);
    setSelectedArea(null);
    setAreaForm({ topic: "", description: "" });
  };

  const handleAreaCancel = () => {
    setAreaModalOpen(false);
    setSelectedArea(null);
    setAreaForm({ topic: "", description: "" });
  };

  async function saveAreaToBackend(area: {
    topic: string;
    description: string;
    coordinates: { lat: number; lng: number }[];
  }) {
    const res = await fetch("/api/geofence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(area),
    });
    if (!res.ok) {
      alert("Failed to save area");
    }
  }

  async function savePlaceToBackend(place: {
    name: string;
    description: string;
    lat: number;
    lng: number;
  }) {
    const res = await fetch("/api/place", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(place),
    });
    if (!res.ok) {
      alert("Failed to save place");
    } else {
      const newPlace = await res.json();
      setPlaces((prev) => [...prev, newPlace]);
    }
  }

  async function updatePlaceInBackend(
    id: string,
    name: string,
    description: string
  ) {
    const res = await fetch(`/api/place/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    if (!res.ok) {
      alert("Failed to update place");
    } else {
      const updated = await res.json();
      setPlaces((prev) => prev.map((p) => (p._id === id ? updated : p)));
      setEditPlace(null);
    }
  }

  useEffect(() => {
    fetch("/api/place")
      .then((res) => {
        console.log("/api/place status:", res.status);
        return res.json();
      })
      .then((data) => {
        console.log("Fetched places:", data);
        setPlaces(data);
      })
      .catch((err) => {
        console.error("Error fetching places:", err);
      });
  }, []);

  // Fetch geofence areas from backend
  useEffect(() => {
    fetch("/api/geofence")
      .then((res) => res.json())
      .then((data) => setAreas(data));
  }, []);

  // Handler for editing an area
  const [editAreaIdx, setEditAreaIdx] = useState<number | null>(null);
  const [editAreaForm, setEditAreaForm] = useState<{
    topic: string;
    description: string;
  } | null>(null);

  const handleEditArea = (idx: number) => {
    setEditAreaIdx(idx);
    setEditAreaForm({
      topic: areas[idx].topic,
      description: areas[idx].description,
    });
  };

  const handleEditAreaFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!editAreaForm) return;
    setEditAreaForm({ ...editAreaForm, [e.target.name]: e.target.value });
  };

  const handleEditAreaSave = async () => {
    if (editAreaIdx === null || !editAreaForm) return;
    const areaToUpdate = areas[editAreaIdx];
    // Update backend
    await fetch(`/api/geofence/${areaToUpdate._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: editAreaForm.topic,
        description: editAreaForm.description,
        coordinates: areaToUpdate.coordinates,
      }),
    });
    // Update local state
    setAreas((prev) =>
      prev.map((a, i) => (i === editAreaIdx ? { ...a, ...editAreaForm } : a))
    );
    setEditAreaIdx(null);
    setEditAreaForm(null);
  };

  const handleEditAreaCancel = () => {
    setEditAreaIdx(null);
    setEditAreaForm(null);
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
        {/* Render saved places as markers with popups */}
        {places.map((place, idx) => (
          <Marker key={place._id || idx} position={[place.lat, place.lng]}>
            <Popup>
              {editPlace && editPlace._id === place._id ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    updatePlaceInBackend(
                      editPlace._id,
                      editPlace.name,
                      editPlace.description
                    );
                  }}
                >
                  <input
                    type="text"
                    value={editPlace.name}
                    onChange={(e) =>
                      setEditPlace({ ...editPlace, name: e.target.value })
                    }
                    style={{ width: "100%", marginBottom: 8 }}
                    required
                  />
                  <textarea
                    value={editPlace.description}
                    onChange={(e) =>
                      setEditPlace({
                        ...editPlace,
                        description: e.target.value,
                      })
                    }
                    style={{ width: "100%", marginBottom: 8 }}
                    required
                    rows={3}
                  />
                  <button type="submit" style={{ marginRight: 8 }}>
                    Save
                  </button>
                  <button type="button" onClick={() => setEditPlace(null)}>
                    Cancel
                  </button>
                </form>
              ) : (
                <>
                  <strong>{place.name}</strong>
                  <br />
                  <span>{place.description}</span>
                  <br />
                  <button
                    type="button"
                    onClick={() =>
                      setEditPlace({
                        _id: place._id!,
                        name: place.name,
                        description: place.description,
                      })
                    }
                    style={{ marginTop: 8 }}
                  >
                    Edit
                  </button>
                </>
              )}
            </Popup>
          </Marker>
        ))}
        {/* Render saved areas as polygons with popups */}
        {areas.map((area, idx) => (
          <Polygon key={area._id || idx} positions={area.coordinates}>
            <Popup>
              {editAreaIdx === idx && editAreaForm ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleEditAreaSave();
                  }}
                >
                  <input
                    type="text"
                    name="topic"
                    value={editAreaForm.topic}
                    onChange={handleEditAreaFormChange}
                    style={{ width: "100%", marginBottom: 8 }}
                    required
                  />
                  <textarea
                    name="description"
                    value={editAreaForm.description}
                    onChange={handleEditAreaFormChange}
                    style={{ width: "100%", marginBottom: 8 }}
                    required
                    rows={3}
                  />
                  <button type="submit" style={{ marginRight: 8 }}>
                    Save
                  </button>
                  <button type="button" onClick={handleEditAreaCancel}>
                    Cancel
                  </button>
                </form>
              ) : (
                <>
                  <strong>{area.topic}</strong>
                  <br />
                  <span>{area.description}</span>
                  <br />
                  <button
                    type="button"
                    onClick={() => handleEditArea(idx)}
                    style={{ marginTop: 8 }}
                  >
                    Edit
                  </button>
                </>
              )}
            </Popup>
          </Polygon>
        ))}
      </MapContainer>
      {/* Modal popout for new marker form */}
      {newMarker && (
        <>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0,0,0,0.35)",
              zIndex: 3000,
            }}
            onClick={() => {
              setNewMarker(null);
              setForm({ name: "", description: "" });
            }}
          />
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "#fff",
              padding: 24,
              borderRadius: 12,
              boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
              zIndex: 4000,
              minWidth: 320,
              maxWidth: "90vw",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleFormSubmit}>
              <div style={{ marginBottom: 12 }}>
                <label>
                  <strong>Place Name:</strong>
                  <br />
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleFormChange}
                    required
                    style={{
                      width: "100%",
                      padding: 8,
                      borderRadius: 4,
                      border: "1px solid #ccc",
                    }}
                  />
                </label>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label>
                  <strong>Description:</strong>
                  <br />
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleFormChange}
                    required
                    style={{
                      width: "100%",
                      padding: 8,
                      borderRadius: 4,
                      border: "1px solid #ccc",
                    }}
                    rows={3}
                  />
                </label>
              </div>
              <div
                style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setNewMarker(null);
                    setForm({ name: "", description: "" });
                  }}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 4,
                    background: "#eee",
                    color: "#333",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "8px 16px",
                    borderRadius: 4,
                    background: "#2196f3",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Save Place
                </button>
              </div>
            </form>
          </div>
        </>
      )}
      {/* Modal popout for new area form */}
      <GeofenceAreaModal
        open={areaModalOpen}
        topic={areaForm.topic}
        description={areaForm.description}
        onChange={handleAreaFormChange}
        onSave={handleAreaSave}
        onCancel={handleAreaCancel}
      />
    </div>
  );
};

export default GeofenceMapLeaflet;
