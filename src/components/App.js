import React, { useState, useEffect } from 'react';
import ChatInterface from './ChatInterface/ChatInterface';
import GISMapContainer from './GISMap/MapContainer';
import Header from './shared/Header';
import Footer from './shared/Footer';
import ModeSwitcher from './Navigation/ModeSwitcher';
import LanguageSelector from './shared/LanguageSelector';
import AccessibilityControls from './shared/AccessibilityControls';
import { UserProvider } from '../contexts/UserContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import { LocationProvider } from '../contexts/LocationContext';
import { AIProvider } from '../contexts/AIContext';
import { fetchFoodSites } from '../services/dataService';

const App = () => {
  const [foodSites, setFoodSites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeMode, setActiveMode] = useState('chat'); // 'chat' or 'map'
  const [selectedSites, setSelectedSites] = useState([]);
  
  // Fetch food distribution sites data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const sites = await fetchFoodSites();
        setFoodSites(sites);
      } catch (err) {
        console.error("Error loading food sites:", err);
        setError("Unable to load food distribution sites. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Switch between chat and map modes
  const handleModeSwitch = (mode) => {
    setActiveMode(mode);
  };
  
  // Highlight sites on map from chat interface
  const handleHighlightSites = (siteIds) => {
    setSelectedSites(siteIds);
    if (activeMode === 'chat' && siteIds.length > 0) {
      setActiveMode('map');
    }
  };
  
  // Handle site selection on map
  const handleSiteSelect = (site) => {
    setSelectedSites(prevSelected => {
      if (prevSelected.includes(site.id)) {
        return prevSelected.filter(id => id !== site.id);
      } else {
        return [...prevSelected, site.id];
      }
    });
  };
  
  return (
    
      
        
          
            
              
              
              
                
                
                
              
              
              {isLoading ? (
                Loading resources...
              ) : error ? (
                {error}
              ) : (
                
                  {activeMode === 'chat' ? (
                    <ChatInterface 
                      onSwitchToMap={() => setActiveMode('map')} 
                      onHighlightSites={handleHighlightSites} 
                    />
                  ) : (
                    
                  )}
                
              )}
              
              
            
          
        
      
    
  );
};

export default App;