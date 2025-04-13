import React, { useState } from 'react';
import './styles/index.css';
import ChatInterface from './components/ChatInterface'; // (you will have or adjust later)
import MapComponent from './components/MapComponent.js';   // <-- this is new

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
          <MapComponent />
        )}
      </main>

      <footer className="app-footer">
        <p>Capital Area Food Bank AI Assistant &copy; 2025</p>
      </footer>
    </div>
  );
};



export default App;