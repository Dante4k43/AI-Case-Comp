import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { getDistance } from "geolib"; // Used to calculate distances

// Fix icon missing issue in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const MapNavigator = ({ userLocation }) => {
  const [allLocations, setAllLocations] = useState([]);
  const [nearbyLocations, setNearbyLocations] = useState([]);

  // Load location data from the JSON file. Adjust the URL/path if needed.
  useEffect(() => {
    fetch("/data/locations.json")
      .then((response) => response.json())
      .then((data) => {
        console.log("✅ Loaded location data:", data); // Debug log
        setAllLocations(data.features);
      })
      .catch((error) => console.error("❗ Error fetching location data:", error));
  }, []);

  // When userLocation and allLocations are available, filter the nearby locations.
  useEffect(() => {
    if (userLocation && allLocations.length > 0) {
      // Define a maximum distance threshold (in meters). Here, 10 km = 10,000 meters.
      const maxDistance = 10000;
      const filtered = allLocations.filter((loc) => {
        const lat = loc.geometry.coordinates[1]; // GeoJSON uses [lng, lat]
        const lng = loc.geometry.coordinates[0];
        const distance = getDistance(
          { latitude: userLocation.lat, longitude: userLocation.lng },
          { latitude: lat, longitude: lng }
        );
        return distance <= maxDistance;
      });
      setNearbyLocations(filtered);
    }
  }, [userLocation, allLocations]);

  // If the user's location isn't available yet, display a loading message.
  if (!userLocation) {
    return <div>Loading user location...</div>;
  }

  return (
    <MapContainer
      center={[userLocation.lat, userLocation.lng]}
      zoom={12}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Marker for the user’s current location */}
      <Marker position={[userLocation.lat, userLocation.lng]}>
        <Popup>Your location</Popup>
      </Marker>

      {/* Markers for each nearby food bank */}
      {nearbyLocations.map((loc, idx) => (
        <Marker
          key={idx}
          position={[loc.geometry.coordinates[1], loc.geometry.coordinates[0]]}
        >
          <Popup>
            <strong>{loc.properties.name}</strong><br />
            {loc.properties.address}<br />
            {loc.properties.hours}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapNavigator;