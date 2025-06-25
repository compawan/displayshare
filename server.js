const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files (including receiver.html)
app.use(express.static(path.join(__dirname, 'public')));

// Store clients by room
const rooms = new Map();

wss.on('connection', (ws) => {
  console.log('🔌 Client connected');

  let currentRoom = null;

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());

      // Handle joining room
      if (data.type === 'join-room') {
        currentRoom = data.roomId;
        if (!rooms.has(currentRoom)) rooms.set(currentRoom, []);
        rooms.get(currentRoom).push(ws);

        console.log(`👥 Joined room: ${currentRoom}`);
        // Send current count
        ws.send(JSON.stringify({ type: 'room-joined', count: rooms.get(currentRoom).length }));
      }

      // Broadcast signal to others in room
      else if (data.type === 'offer' || data.type === 'answer' || data.type === 'ice') {
        const clients = rooms.get(data.roomId) || [];
        clients.forEach(client => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(message);
          }
        });
      }
    } catch (e) {
      console.error("Invalid JSON:", e);
    }
  });

  ws.on('close', () => {
    if (currentRoom) {
      const updated = (rooms.get(currentRoom) || []).filter(client => client !== ws);
      if (updated.length === 0) rooms.delete(currentRoom);
      else rooms.set(currentRoom, updated);
    }
    console.log('❌ Client disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ WebSocket signaling server running at http://localhost:${PORT}`);
});
