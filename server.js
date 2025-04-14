// server.js
console.log("Starting server.js...");

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5001;  // Change the port here

console.log("About to use middleware...");

app.use(cors());
app.use(express.json());

app.post('/api/chat', (req, res) => {
  console.log("Received message:", req.body.message);
  res.json({ response: `Hello from the server! You said: ${req.body.message}` });
});

console.log("About to listen on port", PORT);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});