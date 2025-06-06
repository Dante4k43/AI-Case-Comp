import React, { useState } from 'react';
import './styles/index.css';
import ChatInterface from './components/ChatInterface';
import MapNavigator from './components/MapNavigator';
import LocationFetcher from './components/LocationFetcher';

const App = () => {
  const [activeMode, setActiveMode] = useState('chat'); // 'chat' or 'map'
  const [userLocation, setUserLocation] = useState(null);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo-title-container">
          <img src="/logo.png" alt="Capsule Corp AI Logo" className="app-logo" />
          <h1>
            Capital Area Food Bank <span className="highlight">AI</span> Assistant
          </h1>
        </div>
      </header>

      <div className="controls-container">
        <div className="mode-switcher">
          <button 
            className={activeMode === 'chat' ? 'active' : ''}
            onClick={() => setActiveMode('chat')}
          >
            Chat
          </button>
          <button 
            className={activeMode === 'map' ? 'active' : ''}
            onClick={() => setActiveMode('map')}
          >
            Map
          </button>
        </div>
      </div>

      <main className="main-content">
        {/* Always load LocationFetcher so user location is captured regardless of mode */}
        <LocationFetcher onLocationFetch={setUserLocation} />
        
        {activeMode === 'chat' ? (
          <ChatInterface userLocation={userLocation} />
        ) : (
          userLocation ? (
            <MapNavigator userLocation={userLocation} />
          ) : (
            <div>Loading user location...</div>
          )
        )}
      </main>

      <footer className="app-footer">
        <p>Capsule Corp AI &copy; 2025</p>
      </footer>
    </div>
  );
};

export default App;