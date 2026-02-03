const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('ROOM_CREATE', () => {
    const roomId = 'TEST123';
    socket.emit('ROOM_CREATED', {
      roomId,
      color: 'w',
      gameState: {
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        moveHistory: [],
        turn: 'w',
        status: 'playing'
      }
    });
  });
});

httpServer.listen(3001, () => {
  console.log('Test server running on port 3001');
});
