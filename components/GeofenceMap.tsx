import React, { useCallback, useRef, useState, useEffect } from "react";
import {
  GoogleMap,
  DrawingManager,
  useJsApiLoader,
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "500px",
  borderRadius: "12px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
};

const center = {
  lat: 6.9271, // Example: Colombo
  lng: 79.8612,
};

const libraries = ["drawing"] as ["drawing"];

const GeofenceMap: React.FC = () => {
  const [polygonCoords, setPolygonCoords] = useState<
    Array<{ lat: number; lng: number }>
  >([]);
  const [
    drawingMode,
    setDrawingMode,
  ] = useState<google.maps.drawing.OverlayType | null>(null);
  // Track the last drawn shape (polygon, rectangle, circle, marker)
  const shapeRef = useRef<
    | google.maps.Polygon
    | google.maps.Rectangle
    | google.maps.Circle
    | google.maps.Marker
    | google.maps.Polyline
    | null
  >(null);

  // Loader options should never change during runtime
  const loaderOptions = {
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  };
  const { isLoaded, loadError } = useJsApiLoader(loaderOptions);

  useEffect(() => {
    if (
      isLoaded &&
      window.google &&
      window.google.maps &&
      window.google.maps.drawing
    ) {
      setDrawingMode(window.google.maps.drawing.OverlayType.POLYGON);
    }
  }, [isLoaded]);

  // Handler for all shapes
  const onOverlayComplete = useCallback(
    (e: google.maps.drawing.OverlayCompleteEvent) => {
      // Remove previous shape
      if (shapeRef.current) {
        shapeRef.current.setMap(null);
      }
      shapeRef.current = e.overlay;
      // Make shape editable and clickable
      if (
        e.type === window.google.maps.drawing.OverlayType.POLYGON ||
        e.type === window.google.maps.drawing.OverlayType.RECTANGLE ||
        e.type === window.google.maps.drawing.OverlayType.CIRCLE
      ) {
        (e.overlay as any).setEditable(true);
        (e.overlay as any).setOptions({ clickable: true });
      }
      if (e.type === window.google.maps.drawing.OverlayType.POLYGON) {
        const polygon = e.overlay as google.maps.Polygon;
        const path = polygon.getPath();
        const coords: Array<{ lat: number; lng: number }> = [];
        for (let i = 0; i < path.getLength(); i++) {
          const point = path.getAt(i);
          coords.push({ lat: point.lat(), lng: point.lng() });
        }
        setPolygonCoords(coords);
      } else {
        setPolygonCoords([]); // Only store polygon coords for now
      }
      setDrawingMode(null);
    },
    []
  );

  const handleSave = async () => {
    if (polygonCoords.length === 0) return;
    try {
      const res = await fetch("/api/geofences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coordinates: polygonCoords }),
      });
      if (res.ok) {
        alert("Geofence saved successfully!");
      } else {
        alert("Failed to save geofence.");
      }
    } catch (err) {
      alert("Error saving geofence.");
    }
  };

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 16 }}>
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={13}>
        <DrawingManager
          drawingMode={drawingMode}
          onOverlayComplete={onOverlayComplete}
          options={{
            drawingControl: true,
            drawingControlOptions:
              isLoaded &&
              window.google &&
              window.google.maps &&
              window.google.maps.ControlPosition &&
              window.google.maps.drawing
                ? {
                    position: window.google.maps.ControlPosition.TOP_CENTER,
                    drawingModes: [
                      window.google.maps.drawing.OverlayType.POLYGON,
                      window.google.maps.drawing.OverlayType.RECTANGLE,
                      window.google.maps.drawing.OverlayType.CIRCLE,
                      window.google.maps.drawing.OverlayType.MARKER,
                    ],
                  }
                : undefined,
            polygonOptions: {
              fillColor: "#2196f3",
              fillOpacity: 0.2,
              strokeWeight: 2,
              clickable: true,
              editable: true,
              zIndex: 1,
            },
          }}
        />
      </GoogleMap>
      {shapeRef.current && (
        <div style={{ marginTop: 24, textAlign: "center" }}>
          <button
            onClick={() => {
              if (shapeRef.current) {
                shapeRef.current.setMap(null);
                shapeRef.current = null;
                setPolygonCoords([]);
              }
            }}
            style={{
              background: "#f44336",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "10px 24px",
              fontSize: 16,
              cursor: "pointer",
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              marginRight: 12,
            }}
          >
            Delete Shape
          </button>
          {polygonCoords.length > 0 && (
            <button
              onClick={handleSave}
              style={{
                background: "#2196f3",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "10px 24px",
                fontSize: 16,
                cursor: "pointer",
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              }}
            >
              Save Geofence
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default GeofenceMap;
