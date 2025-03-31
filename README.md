## Project Structure

```
AI Case Comp/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── data/
│       └── food-distribution-sites.json  # Sample data structure for food sites
│
├── src/
│   ├── components/
│   │   ├── App.js                        # Main application component
│   │   ├── ChatInterface/                # Chat UI components
│   │   │   ├── ChatInterface.js          # Main chat container
│   │   │   ├── ChatMessage.js            # Individual message component
│   │   │   ├── ChatInput.js              # User input component
│   │   │   └── ChatHistory.js            # Message history component
│   │   │
│   │   ├── GISMap/                       # Map components
│   │   │   ├── MapContainer.js           # Main map container
│   │   │   ├── MapFilters.js             # Filter controls for map
│   │   │   ├── LocationPin.js            # Pin component for food sites
│   │   │   └── SiteInfoCard.js           # Info card for selected site
│   │   │
│   │   ├── shared/                       # Shared UI components
│   │   │   ├── Header.js                 # Application header
│   │   │   ├── Footer.js                 # Application footer
│   │   │   ├── LanguageSelector.js       # Language toggle
│   │   │   └── AccessibilityControls.js  # Accessibility features
│   │   │
│   │   └── Navigation/                   # Navigation components
│   │       ├── NavigationControls.js     # Navigation UI
│   │       └── ModeSwitcher.js           # Chat/Map mode switcher
│   │
│   ├── services/                         # Service modules
│   │   ├── aiService.js                  # AI/LLM integration service
│   │   ├── geoService.js                 # Geolocation and mapping service
│   │   ├── dataService.js                # Data fetching and processing
│   │   ├── translationService.js         # Language translation service
│   │   └── accessibilityService.js       # Accessibility helpers
│   │
│   ├── utils/                            # Utility functions
│   │   ├── languageUtils.js              # Language detection and processing
│   │   ├── locationUtils.js              # Location processing helpers
│   │   ├── dateTimeUtils.js              # Date/time formatting and filtering
│   │   └── queryUtils.js                 # Query processing for AI
│   │
│   ├── hooks/                            # Custom React hooks
│   │   ├── useChat.js                    # Chat functionality hook
│   │   ├── useMap.js                     # Map functionality hook
│   │   ├── useLocation.js                # User location hook
│   │   └── useTranslation.js             # Translation hook
│   │
│   ├── contexts/                         # React contexts
│   │   ├── AIContext.js                  # AI assistant context
│   │   ├── UserContext.js                # User preferences context
│   │   ├── LocationContext.js            # Location data context
│   │   └── LanguageContext.js            # Language selection context
│   │
│   ├── styles/                           # CSS/SCSS styles
│   │   ├── index.scss                    # Main stylesheet
│   │   ├── variables.scss                # Style variables
│   │   ├── chat.scss                     # Chat-specific styles
│   │   └── map.scss                      # Map-specific styles
│   │
│   ├── assets/                           # Static assets
│   │   ├── images/                       # Image assets
│   │   └── icons/                        # Icon assets
│   │
│   ├── config/                           # Configuration files
│   │   ├── apiConfig.js                  # API configuration
│   │   └── mapConfig.js                  # Map configuration
│   │
│   ├── api/                              # API integration
│   │   ├── openaiApi.js                  # OpenAI API integration
│   │   └── cafbApi.js                    # Food Bank API integration
│   │
│   ├── types/                            # TypeScript types (if using TS)
│   │   └── index.d.ts                    # Type definitions
│   │
│   ├── index.js                          # Application entry point
│   └── setupTests.js                     # Test configuration
│
├── server/                               # Backend server (if needed)
│   ├── index.js                          # Server entry point
│   ├── routes/                           # API routes
│   │   ├── aiRoutes.js                   # AI processing routes
│   │   └── dataRoutes.js                 # Data fetching routes
│   │
│   ├── services/                         # Server services
│   │   ├── aiService.js                  # AI processing service
│   │   ├── dataService.js                # Data processing service
│   │   └── cacheService.js               # Response caching service
│   │
│   ├── middleware/                       # Server middleware
│   │   ├── auth.js                       # Authentication (if needed)
│   │   └── logging.js                    # Request logging
│   │
│   └── utils/                            # Server utilities
│       └── vectorStore.js                # Vector storage for RAG
│
├── scripts/                              # Build and utility scripts
│
├── docs/                                 # Documentation
│   ├── api/                              # API documentation
│   └── components/                       # Component documentation
│
├── tests/                                # Test files
│   ├── unit/                             # Unit tests
│   └── integration/                      # Integration tests
│
├── .gitignore                            # Git ignore file
├── package.json                          # Package configuration
├── README.md                             # Project README
└── CHANGELOG.md                          # Version changelog
```