const express = require('express');
const path = require('path');
const WebSocket = require('ws');

const app = express();
const PORT = process.env.PORT || 8080;

// Serve all files from the parent folder (one level up)
app.use(express.static(path.join(__dirname, '..')));

// Health check endpoint (keeps Render awake + confirms it's running)
app.get('/health', (req, res) => res.send('OrangeAI OBS is LIVE!'));

// Optional: Explicit root route (not needed, but nice to have)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

const server = app.listen(PORT, () => {
  console.log(`OrangeAI OBS running on port ${PORT}`);
  console.log(`Visit: https://obs-orangeai.onrender.com`);
});

const wss = new WebSocket.Server({ server });
console.log('WebSocket server ready on ws://localhost:' + PORT);

wss.on('connection', (ws) => {
  console.log('New WebSocket client connected');
  
  ws.on('message', (data) => {
    if (typeof data === 'string') return;
    // Future: send canvas/video frames here for recording/streaming
    // console.log('Frame received:', data.byteLength, 'bytes');
  });

  ws.on('close', () => console.log('Client disconnected'));
});
