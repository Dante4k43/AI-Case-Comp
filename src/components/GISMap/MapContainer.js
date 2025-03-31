import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useLocation } from '../../hooks/useLocation';
import LocationPin from './LocationPin';
import SiteInfoCard from './SiteInfoCard';
import MapFilters from './MapFilters';

const GISMapContainer = ({ foodSites, selectedSites, onSiteSelect }) => {
  const { userLocation, locationError } = useLocation();
  const [filteredSites, setFilteredSites] = useState([]);
  const [mapCenter, setMapCenter] = useState([38.9072, -77.0369]); // DC default
  const [zoom, setZoom] = useState(12);
  const [filters, setFilters] = useState({
    dayOfWeek: 'all',
    timeOfDay: 'all',
    dietary: [],
    distance: 5 // miles
  });
  
  // Apply filters to food sites
  useEffect(() => {
    if (foodSites) {
      const filtered = foodSites.filter(site => {
        // Apply day of week filter
        if (filters.dayOfWeek !== 'all' && !site.schedule.includes(filters.dayOfWeek)) {
          return false;
        }
        
        // Apply time of day filter
        if (filters.timeOfDay !== 'all') {
          // Check if site is open during selected time
        }
        
        // Apply dietary filter
        if (filters.dietary.length > 0) {
          // Check if site provides required dietary options
        }
        
        // Apply distance filter
        if (userLocation) {
          // Calculate distance and filter based on distance
        }
        
        return true;
      });
      
      setFilteredSites(filtered);
    }
  }, [foodSites, filters, userLocation]);
  
  // Update map center when user location changes
  useEffect(() => {
    if (userLocation) {
      setMapCenter([userLocation.latitude, userLocation.longitude]);
      setZoom(13);
    }
  }, [userLocation]);
  
  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };
  
  return (
    
      
      
      
        
        
        {/* User location marker */}
        {userLocation && (
          
            //Your location
          
        )}
        
        {/* Food site markers */}
        {filteredSites.map(site => (
          <LocationPin 
            key={site.id} 
            site={site} 
            isSelected={selectedSites.includes(site.id)} 
            onSelect={() => onSiteSelect(site)} 
          />
        ))}
      
      
      {/* Display selected site information */}
      {selectedSites.length > 0 && (
        
          {selectedSites.map(siteId => {
            const site = foodSites.find(s => s.id === siteId);
            return site ?  : null;
          })}
        
      )}
    
  );
};

export default GISMapContainer;