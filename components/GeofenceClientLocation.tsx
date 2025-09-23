import React, { useEffect, useRef } from "react";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""; // Use env variable

const GeofenceClientLocation: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      alert("Google Maps API key is missing.");
      return;
    }
    // Load Google Maps script
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
    script.async = true;
    script.onload = () => {
      if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
          (pos) => {
            const { latitude, longitude, accuracy } = pos.coords;
            const position = { lat: latitude, lng: longitude };
            // Custom blue dot icon
            const blueDotIcon = {
              url: "https://maps.gstatic.com/mapfiles/ms2/micons/blue-dot.png",
              scaledSize: new window.google.maps.Size(40, 40),
              origin: new window.google.maps.Point(0, 0),
              anchor: new window.google.maps.Point(20, 20),
            };
            if (!mapInstanceRef.current) {
              mapInstanceRef.current = new window.google.maps.Map(
                mapRef.current,
                {
                  center: position,
                  zoom: 15,
                }
              );
              markerRef.current = new window.google.maps.Marker({
                position,
                map: mapInstanceRef.current,
                title: "Your Location",
                icon: blueDotIcon,
              });
              // Show accuracy circle
              markerRef.current.accuracyCircle = new window.google.maps.Circle({
                strokeColor: "#4285F4",
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: "#4285F4",
                fillOpacity: 0.2,
                map: mapInstanceRef.current,
                center: position,
                radius: accuracy,
              });
            } else {
              mapInstanceRef.current.setCenter(position);
              markerRef.current.setPosition(position);
              if (markerRef.current.accuracyCircle) {
                markerRef.current.accuracyCircle.setCenter(position);
                markerRef.current.accuracyCircle.setRadius(accuracy);
              }
            }
          },
          (err) => {
            alert("Unable to retrieve your location.");
          },
          { enableHighAccuracy: true }
        );
      }
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div
      ref={mapRef}
      style={{ width: "100%", height: "500px", borderRadius: "12px" }}
    />
  );
};

export default GeofenceClientLocation;
