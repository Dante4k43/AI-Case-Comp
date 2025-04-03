import React, { useState } from 'react';
import '../styles/index.css';

// Simple placeholder components
const ChatInterface = () => (
  <div className="chat-interface">
    <div className="chat-messages">
      <div className="message assistant">
        How can I help you find food resources today?
      </div>
    </div>
    <div className="chat-input">
      <input type="text" placeholder="Ask about food resources..." />
      <button>Send</button>
    </div>
  </div>
);

const MapContainer = () => (
  <div className="map-container">
    <h2>Food Distribution Sites</h2>
    <div className="map-placeholder">
      Map will be displayed here
    </div>
  </div>
);

const App = () => {
  const [activeMode, setActiveMode] = useState('chat'); // 'chat' or 'map'
  
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
          <MapContainer />
        )}
      </main>
      
      <footer className="app-footer">
        <p>Capital Area Food Bank AI Assistant &copy; 2025</p>
      </footer>
    </div>
  );
};

export default App;