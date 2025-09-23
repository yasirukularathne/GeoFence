import dynamic from "next/dynamic";
const GeofenceMapLeaflet = dynamic(
  () => import("../components/GeofenceMapLeaflet"),
  { ssr: false }
);
import Head from "next/head";

const metaTags = [
  { name: "viewport", content: "width=device-width, initial-scale=1" },
  { name: "description", content: "Admin panel for geofence management" },
];

export default function Home() {
  return (
    <>
      <Head>
        <title>Geofence Admin</title>
        {metaTags.map((meta, idx) => (
          <meta key={meta.name} {...meta} />
        ))}
      </Head>
      <main style={{ minHeight: "100vh", background: "#f7f7f7" }}>
        <h1 style={{ textAlign: "center", marginTop: 32 }}>Geofence Admin</h1>
        <GeofenceMapLeaflet />
      </main>
    </>
  );
}
