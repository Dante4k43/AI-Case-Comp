// server.js

require('dotenv').config();
console.log("OPENAI_API_KEY from .env:", process.env.OPENAI_API_KEY);

console.log("Starting server.js...");

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { getDistance } = require('geolib');

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

// --- Data Loading ---
// Expect locations.json in public/data folder (adjust if needed)
const dataPath = path.join(__dirname, 'public', 'data', 'locations.json');
let locations = [];
try {
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const jsonData = JSON.parse(rawData);
  locations = jsonData.features;
  console.log(`Loaded ${locations.length} locations from locations.json`);
  if (locations.length > 0) {
    console.log("First location:", locations[0]);
  }
} catch (error) {
  console.error("Error loading locations data:", error);
}

// --- Helper Functions ---

// Regular expression to detect a 5-digit ZIP code in the message
const ZIP_REGEX = /\b(\d{5})\b/;

// Geocode a ZIP code using the OpenCage API and force US results
async function geocodeZip(zip) {
  try {
    const apiKey = "57b2d63212f740469d009e55084d5b85"; // Use your valid key if different.
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${zip}&key=${apiKey}&countrycode=us`;
    const response = await axios.get(url);
    const data = response.data;
    if (data.results && data.results.length > 0) {
      // Filter for US results
      const usResults = data.results.filter(result => {
        const components = result.components;
        return components && (components.country_code === "us" || components.country === "United States");
      });
      const chosenResult = usResults.length > 0 ? usResults[0] : data.results[0];
      const { lat, lng } = chosenResult.geometry;
      console.log(`Geocoded ZIP ${zip} => lat: ${lat}, lng: ${lng}`);
      return { lat, lng };
    } else {
      console.error(`No geocoding results for ZIP ${zip}`);
      return null;
    }
  } catch (err) {
    console.error("Error geocoding ZIP:", err);
    return null;
  }
}

// Find the closest food bank given coordinates using geolib (for one nearest, if needed)
function findClosestFoodBank(coords) {
  let nearestLocation = null;
  let minDistance = Infinity;
  for (const loc of locations) {
    if (!loc.geometry || !loc.geometry.coordinates || loc.geometry.coordinates.length < 2)
      continue;
    const [locLng, locLat] = loc.geometry.coordinates;
    const distance = getDistance(
      { latitude: coords.lat, longitude: coords.lng },
      { latitude: locLat, longitude: locLng }
    );
    if (distance < minDistance) {
      minDistance = distance;
      nearestLocation = loc;
    }
  }
  if (!nearestLocation) {
    return "I couldn't find any food bank data.";
  }
  const miles = (minDistance / 1609.34).toFixed(2);
  const name = nearestLocation.properties.name;
  const address = nearestLocation.properties.address;
  return `The nearest food bank is "${name}" at ${address}, approximately ${miles} miles away.`;
}

// Calculate and return the top three nearest food banks.
function findTopThreeFoodBanks(coords) {
  let distances = [];
  for (const loc of locations) {
    if (!loc.geometry || !loc.geometry.coordinates || loc.geometry.coordinates.length < 2)
      continue;
    const [locLng, locLat] = loc.geometry.coordinates;
    const distance = getDistance(
      { latitude: coords.lat, longitude: coords.lng },
      { latitude: locLat, longitude: locLng }
    );
    distances.push({ loc, distance });
  }
  if (distances.length === 0) {
    return "I couldn't find any food bank data.";
  }
  distances.sort((a, b) => a.distance - b.distance);
  const topThree = distances.slice(0, 3);
  const results = topThree.map(item => {
    const miles = (item.distance / 1609.34).toFixed(2);
    const name = item.loc.properties.name;
    const address = item.loc.properties.address;
    return `"${name}" at ${address} (${miles} miles)`;
  });
  return "The top 3 nearest food banks are " + results.join(", ") + ".";
}

// --- Main Chat Endpoint ---
app.post('/api/chat', async (req, res) => {
  try {
    const { message, location } = req.body;
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes("closest food bank")) {
      // If location is provided, use it; otherwise, try to extract a ZIP
      if (location && location.lat && location.lng) {
        const responseMsg = findTopThreeFoodBanks({ lat: location.lat, lng: location.lng });
        return res.json({ response: responseMsg });
      } else {
        const match = message.match(ZIP_REGEX);
        if (match) {
          const zip = match[1];
          const coords = await geocodeZip(zip);
          if (!coords) {
            return res.json({ response: `Could not geocode ZIP code ${zip}. Please try another or enable location services.` });
          }
          const responseMsg = findTopThreeFoodBanks(coords);
          return res.json({ response: responseMsg });
        } else {
          return res.json({ response: "I couldn't determine your location. Please enable location services or provide your ZIP code." });
        }
      }
    }
    // Fallback: echo the message.
    return res.json({ response: `You said: ${message}` });
  } catch (error) {
    console.error("Error in /api/chat:", error);
    return res.status(500).json({ response: "There was an error processing your request." });
  }
});

// --- OpenAI Chat Endpoint ---
app.post('/api/openai-chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ response: "Missing 'message' in request body." });
    }
    const payload = {
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: message }
      ],
      temperature: 0.7
    };
    const openaiResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        }
      }
    );
    const assistantReply = openaiResponse.data.choices[0].message.content;
    console.log("OpenAI reply:", assistantReply);
    return res.json({ response: assistantReply });
  } catch (error) {
    if (error.response) {
      console.error("Error calling OpenAI API:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.error("Error calling OpenAI API:", error.message);
    }
    return res.status(500).json({ response: "Error connecting to OpenAI API." });
  }
});

// --- Start the Server ---
console.log(`About to listen on port ${PORT}`);
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});