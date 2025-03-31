// Utility functions for working with locations and geospatial data

// Calculate distance between two points (using Haversine formula)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 3958.8; // Earth radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };
  
  // Filter sites by distance from a point
  export const filterSitesByDistance = (sites, lat, lon, maxDistance) => {
    return sites.filter(site => {
      const distance = calculateDistance(lat, lon, site.latitude, site.longitude);
      return distance <= maxDistance;
    });
  };
  
  // Sort sites by distance from a point
  export const sortSitesByDistance = (sites, lat, lon) => {
    return [...sites].sort((a, b) => {
      const distA = calculateDistance(lat, lon, a.latitude, a.longitude);
      const distB = calculateDistance(lat, lon, b.latitude, b.longitude);
      return distA - distB;
    });
  };
  
  // Format distance for display
  export const formatDistance = (distance) => {
    if (distance < 0.1) {
      return `${Math.round(distance * 5280)} feet`;
    } else {
      return `${distance.toFixed(1)} miles`;
    }
  };
  
  // Get public transit directions URL (using Google Maps)
  export const getTransitDirectionsUrl = (fromLat, fromLon, toLat, toLon) => {
    return `https://www.google.com/maps/dir/?api=1&origin=${fromLat},${fromLon}&destination=${toLat},${toLon}&travelmode=transit`;
  };
  
  // Parse address string into components
  export const parseAddress = (addressString) => {
    // Simple implementation - in a real app, would use a more robust solution
    const parts = addressString.split(',').map(part => part.trim());
    
    if (parts.length >= 3) {
      const street = parts[0];
      const city = parts[1];
      const stateZip = parts[2].split(' ');
      const state = stateZip[0];
      const zip = stateZip[1] || '';
      
      return { street, city, state, zip };
    }
    
    return { street: addressString, city: '', state: '', zip: '' };
  };