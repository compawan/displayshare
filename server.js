const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path'); // ✅ YOU FORGOT THIS LINE

const app = express();
const server = http.createServer(app);

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public'))); // ✅ this should be before server starts

const wss = new WebSocket.Server({ server });

// WebSocket signaling logic
wss.on('connection', (ws) => {
  console.log('🔌 Client connected');

  ws.on('message', (message) => {
    console.log('📨 Received:', message.toString());

    // Broadcast to all other clients
    wss.clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on('close', () => {
    console.log('❌ Client disconnected');
  });
});

// Start HTTP + WS server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ WebSocket server running at http://localhost:${PORT}`);
});
