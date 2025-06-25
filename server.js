const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Serve static files (optional frontend)
app.use(express.static(path.join(__dirname, 'public')));

// WebSocket signaling logic
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    const count = io.sockets.adapter.rooms.get(roomId)?.size || 0;
    console.log(`➡️  Socket ${socket.id} joined room ${roomId}. Total in room: ${count}`);
    socket.emit('room-joined', { roomId, count });
  });

  socket.on('signal', ({ roomId, ...data }) => {
    console.log(`📡 Signal from ${socket.id} to room ${roomId}`);
    socket.to(roomId).emit('signal', data);
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Signaling server running at http://0.0.0.0:${PORT}`);
});
