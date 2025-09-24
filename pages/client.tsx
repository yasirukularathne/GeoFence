import dynamic from "next/dynamic";

const GeofenceClientMap = dynamic(
  () => import("../components/GeofenceClientMap"),
  {
    ssr: false,
  }
);

export default function ClientPage() {
  return (
    <div>
      <h2 style={{ textAlign: "center", marginTop: 24 }}>Client Map</h2>
      <GeofenceClientMap />
    </div>
  );
}
