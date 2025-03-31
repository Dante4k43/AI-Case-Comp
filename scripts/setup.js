// setup.js - Run with Node.js to create the project structure
const fs = require('fs');
const path = require('path');

// Define the directory structure
const directories = [
  'src/components/ChatInterface',
  'src/components/GISMap',
  'src/components/shared',
  'src/components/Navigation',
  'src/services',
  'src/utils',
  'src/hooks',
  'src/contexts',
  'src/styles',
  'src/assets/images',
  'src/assets/icons',
  'src/config',
  'src/api',
  'src/types',
  'public/data',
  'server',
  'server/routes',
  'server/services',
  'server/middleware',
  'server/utils',
  'scripts',
  'docs/api',
  'docs/components',
  'tests/unit',
  'tests/integration'
];

// Define starter files
const files = [
  {
    path: 'src/components/App.js',
    content: `import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [activeMode, setActiveMode] = useState('chat');
  
  return (
    <div className="App">
      <header className="App-header">
        <h1>Capital Area Food Bank AI Assistant</h1>
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
      </header>
      <main>
        {activeMode === 'chat' ? (
          <div className="chat-container">
            <p>Chat interface will go here</p>
          </div>
        ) : (
          <div className="map-container">
            <p>GIS Map will go here</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;`
  },
  {
    path: 'src/components/ChatInterface/ChatInterface.js',
    content: `import React, { useState } from 'react';

const ChatInterface = () => {
  const [messages, setMessages] = useState([
    { id: 'welcome', text: 'How can I help you find food resources today?', sender: 'assistant' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim() === '') return;
    
    // Add user message
    setMessages([
      ...messages,
      { id: Date.now(), text: input, sender: 'user' }
    ]);
    
    // Clear input
    setInput('');
    
    // Simulate assistant response
    setTimeout(() => {
      setMessages(prevMessages => [
        ...prevMessages,
        { id: 'response-' + Date.now(), text: 'I\'ll help you find food resources.', sender: 'assistant' }
      ]);
    }, 1000);
  };

  return (
    <div className="chat-interface">
      <div className="chat-messages">
        {messages.map(message => (
          <div key={message.id} className={\`message \${message.sender}\`}>
            {message.text}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about food resources..."
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default ChatInterface;`
  },
  {
    path: 'src/components/GISMap/MapContainer.js',
    content: `import React from 'react';

const MapContainer = () => {
  return (
    <div className="map-container">
      <h2>Food Distribution Sites</h2>
      <p>GIS Map will be implemented here using Leaflet.js</p>
      <div className="map-placeholder" style={{ width: '100%', height: '400px', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Map Placeholder
      </div>
    </div>
  );
};

export default MapContainer;`
  },
  {
    path: 'src/services/aiService.js',
    content: `// AI service for handling chat interactions

class AIService {
  // Process user query and generate response
  async processUserQuery(query, userLocation, userPreferences) {
    // This is a placeholder implementation
    // In production, this would call the OpenAI API
    
    console.log('Processing query:', query);
    console.log('User location:', userLocation);
    console.log('User preferences:', userPreferences);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      response: "I can help you find food resources. What specific information are you looking for?",
      actions: [],
      relevantSites: []
    };
  }
}

export default new AIService();`
  },
  {
    path: 'src/services/geoService.js',
    content: `// Geolocation service

class GeoService {
  // Get user's current location
  getUserLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    });
  }
}

export default new GeoService();`
  },
  {
    path: 'public/data/food-distribution-sites.json',
    content: `{
  "sites": [
    {
      "id": "site1",
      "name": "Capital Area Community Food Bank",
      "address": "4900 Puerto Rico Ave NE, Washington, DC 20017",
      "latitude": 38.9334,
      "longitude": -76.9832,
      "schedule": "Monday-Friday: 9AM-5PM, Saturday: 9AM-1PM",
      "foodTypes": ["Canned Goods", "Fresh Produce", "Dairy", "Meat"],
      "services": ["Food Distribution", "SNAP Assistance"],
      "requirements": "Photo ID for adult household members",
      "description": "Main distribution center for the Capital Area Food Bank",
      "phoneNumber": "202-644-9800",
      "website": "https://www.capitalareafoodbank.org"
    },
    {
      "id": "site2",
      "name": "Martha's Table",
      "address": "2375 Elvans Rd SE, Washington, DC 20020",
      "latitude": 38.8558,
      "longitude": -76.9868,
      "schedule": "Monday-Saturday: 10AM-2PM",
      "foodTypes": ["Fresh Produce", "Prepared Meals"],
      "services": ["Food Distribution", "Prepared Meals"],
      "requirements": "None",
      "description": "Provides healthy food access and quality education",
      "phoneNumber": "202-328-6608",
      "website": "https://marthastable.org"
    },
    {
      "id": "site3",
      "name": "Bread for the City",
      "address": "1525 7th St NW, Washington, DC 20001",
      "latitude": 38.9097,
      "longitude": -77.0222,
      "schedule": "Tuesday-Thursday: 9AM-5PM, Friday: 9AM-12PM",
      "foodTypes": ["Canned Goods", "Fresh Produce", "Meat", "Dairy"],
      "services": ["Food Distribution", "Medical Care", "Legal Services"],
      "requirements": "Must live in DC and meet income guidelines",
      "description": "Comprehensive services for DC residents",
      "phoneNumber": "202-265-2400",
      "website": "https://breadforthecity.org"
    }
  ]
}`
  },
  {
    path: 'README.md',
    content: `# Capital Area Food Bank AI Assistant

This project implements an integrated AI assistant for the Capital Area Food Bank website to improve access to food resources.

## Project Overview

The AI Assistant combines a chatbot interface with an enhanced interactive GIS map to help food-insecure individuals find resources, reducing barriers related to digital literacy, language limitations, and stigma.

## Features

- Find nearby food distribution sites based on location, hours, and dietary needs
- Navigate website and GIS map automatically
- Access information in English and Spanish
- Handle low-literacy inputs (misspellings, simple language)
- Provide public transit directions and collect user feedback

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository
   \`\`\`
   git clone [repository-url]
   cd cafb-ai-assistant
   \`\`\`

2. Install dependencies
   \`\`\`
   npm install
   \`\`\`

3. Start the development server
   \`\`\`
   npm start
   \`\`\`

## Project Structure

The project follows a component-based architecture with separate services for AI processing, geolocation, data handling, and language support.

## Technology Stack

- React for frontend UI
- Leaflet.js for GIS mapping
- OpenAI for natural language processing
- Retrieval-Augmented Generation (RAG) for contextual responses
`
  },
  {
    path: 'package.json',
    content: `{
  "name": "cafb-ai-assistant",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/react": "^13.4.0",
    "@testing-library/user-event": "^13.5.0",
    "axios": "^1.3.4",
    "leaflet": "^1.9.3",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-leaflet": "^4.2.1",
    "react-scripts": "5.0.1",
    "web-vitals": "^2.1.4"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "setup": "node scripts/setup.js"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}`
  }
];

// Create directories
directories.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
});

// Create files
files.forEach(file => {
  const filePath = path.join(process.cwd(), file.path);
  fs.writeFileSync(filePath, file.content);
  console.log(`Created file: ${filePath}`);
});

console.log('Project structure setup complete!');