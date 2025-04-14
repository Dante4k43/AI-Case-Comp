import React, { useState } from 'react';
import './styles/index.css';
import ChatInterface from './components/ChatInterface'; // your chatbot interface
// Replace MapComponent with MapNavigator from your provided MapNavigator code
import MapNavigator from './components/MapNavigator';
import LocationFetcher from './components/LocationFetcher';

const App = () => {
  const [activeMode, setActiveMode] = useState('chat'); // 'chat' or 'map'
  const [userLocation, setUserLocation] = useState(null);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Capital Area Food Bank AI Assistant</h1>
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
        {activeMode === 'chat' ? (
          <ChatInterface />
        ) : (
          // When in map mode, first fetch the user location...
          <>
            <LocationFetcher onLocationFetch={setUserLocation} />
            {/* ...and only render the MapNavigator when the user location is available */}
            {userLocation ? (
              <MapNavigator userLocation={userLocation} />
            ) : (
              <div>Loading user location...</div>
            )}
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>Capital Area Food Bank AI Assistant &copy; 2025</p>
      </footer>
    </div>
  );
};

export default App;