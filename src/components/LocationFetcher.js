import React, { useState, useEffect } from "react";

const LocationFetcher = ({ onLocationFetch }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Check if geolocation is available
    if (navigator.geolocation) {
      // Request current position
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const coords = { lat: latitude, lng: longitude };
          setUserLocation(coords);
          // Pass the location to a parent or use it to update your MapNavigator
          onLocationFetch(coords);
        },
        (error) => {
          console.error("Error fetching location:", error);
          setErrorMessage("Unable to retrieve your location. Please enable location services or try entering your ZIP code.");
        }
      );
    } else {
      setErrorMessage("Geolocation is not supported by your browser.");
    }
  }, [onLocationFetch]);

  return (
    <div>
      {userLocation ? (
        <p>Your location: {userLocation.lat}, {userLocation.lng}</p>
      ) : (
        <p>{errorMessage || "Fetching location..."}</p>
      )}
    </div>
  );
};

export default LocationFetcher;