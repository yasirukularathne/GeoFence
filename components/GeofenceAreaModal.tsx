import React from "react";

interface GeofenceAreaModalProps {
  open: boolean;
  topic: string;
  description: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onSave: () => void;
  onCancel: () => void;
}

const GeofenceAreaModal: React.FC<GeofenceAreaModalProps> = ({
  open,
  topic,
  description,
  onChange,
  onSave,
  onCancel,
}) => {
  if (!open) return null;
  return (
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
        onClick={onCancel}
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
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave();
          }}
        >
          <div style={{ marginBottom: 12 }}>
            <label>
              <strong>Topic:</strong>
              <br />
              <input
                type="text"
                name="topic"
                value={topic}
                onChange={onChange}
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
                value={description}
                onChange={onChange}
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
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button
              type="button"
              onClick={onCancel}
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
              Save
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default GeofenceAreaModal;
