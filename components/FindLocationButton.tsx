// FindLocationButton.tsx
import React from "react";

interface FindLocationButtonProps {
  onClick: () => void;
  loading?: boolean;
}

const FindLocationButton: React.FC<FindLocationButtonProps> = ({
  onClick,
  loading,
}) => (
  <button
    style={{
      position: "absolute",
      top: 24,
      right: 24,
      padding: "10px 24px",
      background: "#1976d2",
      color: "#fff",
      border: "none",
      borderRadius: 8,
      fontWeight: 700,
      fontSize: "1rem",
      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      zIndex: 2000,
      cursor: loading ? "not-allowed" : "pointer",
      opacity: loading ? 0.7 : 1,
    }}
    onClick={onClick}
    disabled={loading}
  >
    {loading ? "Locating..." : "Find My Location"}
  </button>
);

export default FindLocationButton;
