// testOpenai.js

require('dotenv').config();
const axios = require('axios');

async function testOpenAI() {
  try {
    const payload = {
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Explain how AI works." }
      ],
      temperature: 0.7
    };
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        }
      }
    );
    console.log("Test OpenAI reply:", response.data.choices[0].message.content);
  } catch (err) {
    console.error("Test error:", err.response ? JSON.stringify(err.response.data, null, 2) : err.message);
  }
}

testOpenAI();