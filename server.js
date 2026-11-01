const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

// Optional endpoint to use GEMINI_API_KEY configured in Render Environment Variables
app.post('/api/generate-image', async (req, res) => {
  try {
    const apiKey = req.body.apiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ error: 'Missing GEMINI_API_KEY in Render Environment Variables or request.' });
    }
    const { prompt } = req.body;
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseModalities: ['TEXT', 'IMAGE'] }
        })
      }
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`KDP Kids Book Studio Pro running on port ${PORT}`);
});
