require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { getDistance } = require('geolib');
const TranslationService = require('./src/services/translationService');

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

// === Load Locations ===
const dataPath = path.join(__dirname, 'public', 'data', 'locations.json');
let locations = [];
try {
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const jsonData = JSON.parse(rawData);
  locations = jsonData.features;
  console.log(`Loaded ${locations.length} locations from locations.json`);
  if (locations.length > 0) console.log("First location:", locations[0]);
} catch (error) {
  console.error("Error loading locations data:", error);
}

const ZIP_REGEX = /\b(\d{5})\b/;

async function geocodeZip(zip) {
  try {
    const apiKey = "57b2d63212f740469d009e55084d5b85";
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${zip}&key=${apiKey}&countrycode=us`;
    const response = await axios.get(url);
    const data = response.data;
    if (data.results && data.results.length > 0) {
      const usResults = data.results.filter(result => {
        const components = result.components;
        return components && (components.country_code === "us" || components.country === "United States");
      });
      const chosen = usResults.length > 0 ? usResults[0] : data.results[0];
      const { lat, lng } = chosen.geometry;
      return { lat, lng };
    }
    return null;
  } catch (err) {
    console.error("Geocoding error:", err);
    return null;
  }
}

function findNearestFoodBank(coords) {
  let nearest = null;
  let minDist = Infinity;

  for (const loc of locations) {
    if (!loc.geometry?.coordinates?.length) continue;
    const [lng, lat] = loc.geometry.coordinates;
    const distance = getDistance(coords, { latitude: lat, longitude: lng });
    if (distance < minDist) {
      minDist = distance;
      nearest = loc;
    }
  }

  if (!nearest) {
    return TranslationService.translateToUser("No food bank found.");
  }

  const miles = (minDist / 1609.34).toFixed(2);
  const name = nearest.properties.name;
  const address = nearest.properties.address;

  return TranslationService.translateToUser(
    `The nearest food bank is:\n• ${name}\n  ${address} (${miles} miles away)`
  );
}

function findTopThreeFoodBanks(coords) {
  let distances = locations.map(loc => {
    if (!loc.geometry?.coordinates?.length) return null;
    const [lng, lat] = loc.geometry.coordinates;
    const distance = getDistance(coords, { latitude: lat, longitude: lng });
    return TranslationService.translateToUser(`The top 3 nearest food banks are:\n${topThree.map(item => 
      `• ${item.loc.properties.name}\n  ${item.loc.properties.address} (${(item.distance / 1609.34).toFixed(2)} miles)`
    ).join('\n')}`);
  }).filter(Boolean);

  distances.sort((a, b) => a.distance - b.distance);
  const topThree = distances.slice(0, 3).map(({ loc, distance }) => {
    const miles = (distance / 1609.34).toFixed(2);
    return `"${loc.properties.name}" at ${loc.properties.address} (${miles} miles)`;
  });
  return TranslationService.translateToUser("The top 3 nearest food banks are " + topThree.join(", ") + ".");
}

// === API: Food Location Logic ===
app.post('/api/chat', async (req, res) => {
  try {
    const { message, location } = req.body;
    const lang = TranslationService.detectLanguage(message);
    TranslationService.setLanguage(lang);
    const translated = lang === 'en' ? message : TranslationService.translateToEnglish(message);

    const isFoodRequest = ["food", "pantry", "bank", "hungry", "eat", "resource", "help", "find"].some(word => translated.toLowerCase().includes(word));
    const wantsTopThree = ["3", "three", "top"].some(word => translated.toLowerCase().includes(word));

    // 🔁 ZIP PRIORITY: Check ZIP first
    let coords = null;
    if (ZIP_REGEX.test(translated)) {
      const zip = translated.match(ZIP_REGEX)[1];
      coords = await geocodeZip(zip);
    } else if (location && location.lat && location.lng) {
      coords = location;
    }

    if (coords && isFoodRequest) {
      const response = wantsTopThree ? findTopThreeFoodBanks(coords) : findNearestFoodBank(coords);
      return res.json({ response });
    }

    return res.json({ response: TranslationService.translateToUser("I couldn't determine your location or food request. Please try again with a ZIP code or enable location services.") });
  } catch (error) {
    console.error("/api/chat error:", error);
    return res.status(500).json({ response: TranslationService.translateToUser("There was an error processing your request.") });
  }
});

// === API: OpenAI Chat Fallback ===
app.post('/api/openai-chat', async (req, res) => {
  try {
    const { message } = req.body;
    const lang = TranslationService.detectLanguage(message);
    TranslationService.setLanguage(lang);
    const translated = lang === 'en' ? message : TranslationService.translateToEnglish(message);

    const payload = {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `
      You are a helpful AI assistant for the Capital Area Food Bank. Your job is to help users in the Washington DC, Maryland, and Northern Virginia area access food resources, ask questions about food insecurity, or get assistance. 
      - If a user asks something outside your scope, give a warm, professional response and suggest they contact CAFB directly.
      - Keep your tone friendly, inclusive, and easy to understand.
      - Answer in the user's preferred language.
      `.trim()
        },
        { role: "user", content: translated }
      ],
      temperature: 0.7
    };

    const openaiResponse = await axios.post("https://api.openai.com/v1/chat/completions", payload, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      }
    });

    const reply = openaiResponse.data.choices[0].message.content;
    return res.json({ response: lang === 'en' ? reply : TranslationService.translateToUser(reply) });
  } catch (error) {
    console.error("OpenAI error:", error.message);
    return res.status(500).json({ response: TranslationService.translateToUser("Error connecting to OpenAI API.") });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});