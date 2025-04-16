// server.js

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

const dataPath = path.join(__dirname, 'public', 'data', 'unified_sites.json');
let locations = [];
try {
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  locations = JSON.parse(rawData);
  console.log(`Loaded ${locations.length} locations from unified_sites.json`);
} catch (error) {
  console.error("Error loading unified dataset:", error);
}

const ZIP_REGEX = /\b(\d{5})\b/;

async function geocodeZip(zip) {
  try {
    const apiKey = process.env.GEOCODE_API_KEY;
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${zip}&key=${apiKey}&countrycode=us`;
    const response = await axios.get(url);
    const data = response.data;
    if (data.results?.length > 0) {
      const { lat, lng } = data.results[0].geometry;
      return { lat, lng };
    }
    return null;
  } catch (err) {
    console.error("Geocoding error:", err);
    return null;
  }
}

function filterByProximity(coords, maxResults = 3) {
  return locations
    .map(site => {
      if (!site.latitude || !site.longitude) return null;
      const distance = getDistance(coords, { latitude: site.latitude, longitude: site.longitude });
      return { ...site, distance };
    })
    .filter(Boolean)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, maxResults);
}

function filterByKeyword(sites, keyword, field) {
  const lower = keyword.toLowerCase();
  return sites.filter(site =>
    Array.isArray(site[field]) &&
    site[field].some(val => val.toLowerCase().includes(lower))
  );
}

function filterByHours(sites, targetDay, targetHour) {
  return sites.filter(site => {
    const hours = site.hoursCleaned?.[targetDay];
    if (!hours || !Array.isArray(hours)) return false;
    return hours.some(([open, close]) => targetHour >= open && targetHour <= close);
  });
}

app.post('/api/chat', async (req, res) => {
  try {
    const { message, location } = req.body;
    const lang = TranslationService.detectLanguage(message);
    TranslationService.setLanguage(lang);
    const translated = lang === 'en' ? message : TranslationService.translateToEnglish(message);

    const lower = translated.toLowerCase();
    const wantsTopThree = /\b(top|three|3)\b/.test(lower);
    const culturalMatch = lower.match(/halal|muslim|spanish|latino|vietnamese|korean|ethiopian|chinese|african|arab|asian|eastern european/i);
    const wrapMatch = lower.match(/housing|child care|job training|health|benefits|english|financial|older adults/i);
    const foodFormatMatch = lower.match(/box|bag|hot meal|prepared/i);
    const distributionMatch = lower.match(/home delivery|walk[-\s]?up/i);

    const now = new Date();
    const today = now.toLocaleDateString('en-US', { weekday: 'long' });
    const hour = now.getHours();
    const wantsOpenNow = lower.includes("open now") || lower.includes("open today") || lower.includes("what is open");

    let coords = null;
    if (ZIP_REGEX.test(translated)) {
      const zip = translated.match(ZIP_REGEX)[1];
      coords = await geocodeZip(zip);
    } else if (location?.lat && location?.lng) {
      coords = location;
    }

    if (!coords) {
      return res.json({ response: TranslationService.translateToUser("I couldn't determine your location. Please provide a ZIP code or enable location services.") });
    }

    let results = filterByProximity(coords, wantsTopThree ? 10 : 3);

    if (culturalMatch) results = filterByKeyword(results, culturalMatch[0], 'culturesServed');
    if (wrapMatch) results = filterByKeyword(results, wrapMatch[0], 'wraparoundServices');
    if (foodFormatMatch) results = filterByKeyword(results, foodFormatMatch[0], 'foodFormat');
    if (distributionMatch) results = filterByKeyword(results, distributionMatch[0], 'distributionModel');
    if (wantsOpenNow) results = filterByHours(results, today, hour);

    if (lower.includes("appointment")) {
      results = results.filter(site => site.appointmentRequired === true);
    }
    if ((lower.includes("transport") || lower.includes("bus") || lower.includes("car") || lower.includes("ride"))) {
      results = results.filter(site => site.transportationSupport === true);
    }

    if (!results.length) {
      return res.json({ response: TranslationService.translateToUser("No results found that match your request. Try adjusting your filters.") });
    }

    const responseLines = results.slice(0, wantsTopThree ? 3 : 1).map(site => {
      const name = site.name;
      const address = site.address;
      const miles = (site.distance / 1609.34).toFixed(2);
      const phone = site.phone || 'N/A';
      const openNow = site.hoursCleaned?.[today]?.some(([open, close]) => hour >= open && hour <= close);
      const openStatus = openNow ? '🟢 Open now' : '🔴 Closed';
      const hoursFormatted = site.hoursCleaned
        ? Object.entries(site.hoursCleaned)
            .map(([day, entries]) =>
              entries.map(([open, close]) =>
                `${day}: ${String(open).padStart(2, '0')}:00–${String(close).padStart(2, '0')}:00`
              ).join(", ")
            ).join(" | ")
        : "Hours not available";
      const appt = site.appointmentRequired ? '📅 Appointment Required' : '✅ No Appointment Needed';
      const transport = site.transportationSupport ? '🚗 Transportation Support Available' : '';
      const cultures = site.culturesServed?.join(', ') || 'N/A';
      const requirements = site.foodPantryRequirements?.join(', ') || 'N/A';
      const distribution = site.distributionModel?.join(', ') || 'N/A';
      const format = site.foodFormat?.join(', ') || 'N/A';

      return `• ${name}<br>
      📍 <strong>Address:</strong> ${address} (${miles} mi)<br>
      ${openStatus} | ${appt}${transport ? ` | ${transport}` : ''}<br>
      ⏰ <strong>Hours:</strong> ${hoursFormatted}<br>
      📞 <strong>Phone:</strong> ${phone}<br>
      🌍 <strong>Cultures Served:</strong> ${cultures}<br>
      📋 <strong>Pantry Requirements:</strong> ${requirements}<br>
      🚛 <strong>Distribution Model:</strong> ${distribution}<br>
      🍱 <strong>Food Format:</strong> ${format}`;
    });

    const finalText = wantsTopThree
      ? `Here are the top food resources near you:<br><br>${responseLines.join("<br><br>")}`
      : `The nearest food bank is:<br><br>${responseLines[0]}`;

    return res.json({ response: TranslationService.translateToUser(finalText) });
  } catch (error) {
    console.error("/api/chat error:", error);
    return res.status(500).json({ response: TranslationService.translateToUser("There was an error processing your request.") });
  }
});

// === OpenAI fallback ===
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
          content: `You are a helpful AI assistant for the Capital Area Food Bank. Your job is to help users in the Washington DC, Maryland, and Northern Virginia area access food resources, ask questions about food insecurity, or get assistance.\n- If a user asks something outside your scope, give a warm, professional response and suggest they contact CAFB directly.\n- Keep your tone friendly, inclusive, and easy to understand.\n- Answer in the user's preferred language.`
        },
        { role: "user", content: translated }
      ],
      temperature: 0.7
    };

    const response = await axios.post("https://api.openai.com/v1/chat/completions", payload, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      }
    });

    const reply = response.data.choices[0].message.content;
    return res.json({ response: lang === 'en' ? reply : TranslationService.translateToUser(reply) });
  } catch (error) {
    console.error("OpenAI error:", error);
    return res.status(500).json({ response: TranslationService.translateToUser("Error connecting to OpenAI API.") });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});