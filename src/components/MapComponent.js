import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Optional: Fix icon missing bug in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const MapComponent = () => {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    fetch("/data/locations.json")
      .then((response) => response.json())
      .then((data) => {
        console.log("✅ Loaded location data:", data); // ADD THIS LINE
        setLocations(data.features);
      })
      .catch((error) => console.error("❗ Error fetching location data:", error));
}, []);


  return (
    <MapContainer center={[38.89511, -77.03637]} zoom={10} style={{ height: "100vh", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {locations.map((loc, idx) => (
        <Marker
          key={idx}
          position={[loc.geometry.coordinates[1], loc.geometry.coordinates[0]]} // [lat, lng] order
        >
          <Popup>
            <strong>{loc.properties.name}</strong><br/>
            {loc.properties.address}<br/>
            {loc.properties.hours}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapComponent;
