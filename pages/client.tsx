import dynamic from "next/dynamic";
import Head from "next/head";

const GeofenceGoogleMap = dynamic(
  () => import("../components/GeofenceGoogleMap"),
  {
    ssr: false,
  }
);

export default function ClientPage() {
  return (
    <>
      <Head>
        <title>Geofence Client</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Client view for geofence tracking" />
      </Head>
      <main style={{ minHeight: "100vh", background: "#f7f7f7" }}>
        <h1 style={{ textAlign: "center", marginTop: 32 }}>Geofence Client</h1>
        <GeofenceGoogleMap />
      </main>
    </>
  );
}
