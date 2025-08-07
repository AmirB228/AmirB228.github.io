// Simple local dev server with in-memory words API
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

let wordsByTopic = null;

app.get('/api/words', (_, res) => {
  res.status(200).json(wordsByTopic ?? null);
});

app.post('/api/words', (req, res) => {
  const body = req.body;
  if (!body || typeof body !== 'object') {
    return res.status(400).json({ error: 'Body must be JSON object' });
  }
  wordsByTopic = body;
  return res.status(200).json({ status: 'ok' });
});

app.put('/api/words', (req, res) => {
  const body = req.body;
  if (!body || typeof body !== 'object') {
    return res.status(400).json({ error: 'Body must be JSON object' });
  }
  wordsByTopic = body;
  return res.status(200).json({ status: 'ok' });
});

app.use(express.static(path.join(__dirname)));

app.get('*', (req, res) => {
  const hasExtension = path.extname(req.path) !== '';
  if (!hasExtension) {
    res.sendFile(path.join(__dirname, 'index.html'));
  } else {
    res.status(404).send('File not found');
  }
});

app.listen(PORT, () => {
  console.log(`Dev server running at http://localhost:${PORT}`);
}); 