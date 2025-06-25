const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    const count = io.sockets.adapter.rooms.get(roomId)?.size || 0;
    console.log(`Socket ${socket.id} joined room ${roomId}. Total: ${count}`);
    socket.emit('room-joined', { roomId, count });
  });

  socket.on('signal', ({ roomId, ...data }) => {
    socket.to(roomId).emit('signal', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Signaling server running on port ${PORT}`);
});
