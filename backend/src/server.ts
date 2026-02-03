import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { GameManager } from './game-manager';
import { MAX_TAKEBACKS_PER_PLAYER } from './types';

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3002', 'http://192.168.1.3:3002'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const gameManager = new GameManager();

setInterval(() => {
  gameManager.cleanup();
  console.log(`Active rooms: ${gameManager.getRoomCount()}`);
}, 300000);

io.on('connection', (socket: Socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('ROOM_CREATE', () => {
    const roomId = gameManager.createRoom();
    const room = gameManager.getRoom(roomId);
    
    if (room) {
      const player = room.addPlayer(socket.id);
      if (player) {
        socket.join(roomId);
        socket.emit('ROOM_CREATED', {
          roomId,
          color: player.color,
          gameState: room.getState()
        });
      }
    }
  });

  socket.on('ROOM_JOIN', (roomId: string) => {
    const room = gameManager.getRoom(roomId);
    
    if (!room) {
      socket.emit('ROOM_ERROR', { message: 'Room not found' });
      return;
    }

    if (room.isFull()) {
      socket.emit('ROOM_ERROR', { message: 'Room is full' });
      return;
    }

    const player = room.addPlayer(socket.id);
    if (player) {
      socket.join(roomId);
      
      io.to(roomId).emit('ROOM_STATE', {
        roomId,
        players: room.data.players.map((p: any) => ({ color: p.color, connected: p.connected })),
        gameState: room.getState()
      });

      socket.emit('ROOM_JOINED', {
        roomId,
        color: player.color,
        gameState: room.getState()
      });
    }
  });

  socket.on('MOVE_MAKE', ({ roomId, from, to, promotion }: any) => {
    const room = gameManager.getRoom(roomId);
    if (!room) return;

    const player = room.data.players.find((p: any) => p.socketId === socket.id);
    if (!player || player.color !== room.getState().turn) {
      socket.emit('MOVE_REJECTED', { reason: 'Not your turn' });
      return;
    }

    const newState = room.makeMove(from, to, promotion);
    if (!newState) {
      socket.emit('MOVE_REJECTED', { reason: 'Illegal move' });
      return;
    }

    io.to(roomId).emit('MOVE_APPLIED', {
      gameState: newState
    });
  });

  socket.on('TAKEBACK_REQUEST', ({ roomId }: any) => {
    const room = gameManager.getRoom(roomId);
    if (!room) return;

    const canTakeback = room.canTakeback(socket.id);
    if (!canTakeback.allowed) {
      socket.emit('TAKEBACK_REJECTED', { reason: canTakeback.reason });
      return;
    }

    room.data.pendingTakeback = {
      requesterId: socket.id,
      timestamp: Date.now()
    };

    const requester = room.data.players.find((p: any) => p.socketId === socket.id);
    const opponent = room.data.players.find((p: any) => p.socketId !== socket.id);

    if (opponent && requester) {
      io.to(opponent.socketId).emit('TAKEBACK_PENDING', {
        requesterColor: requester.color
      });

      socket.emit('TAKEBACK_WAITING', {});
    }
  });

  socket.on('TAKEBACK_RESPOND', ({ roomId, accepted }: any) => {
    const room = gameManager.getRoom(roomId);
    if (!room || !room.data.pendingTakeback) return;

    const requesterId = room.data.pendingTakeback.requesterId;
    const requester = room.data.players.find((p: any) => p.socketId === requesterId);

    if (!accepted) {
      room.data.pendingTakeback = undefined;
      io.to(roomId).emit('TAKEBACK_DECLINED', {});
      return;
    }

    const newState = room.executeTakeback(requesterId);
    if (newState) {
      io.to(roomId).emit('TAKEBACK_APPLIED', {
        gameState: newState,
        takebacksRemaining: requester ? MAX_TAKEBACKS_PER_PLAYER - requester.takebacksUsed : 0
      });
    } else {
      socket.emit('TAKEBACK_REJECTED', { reason: 'Failed to execute takeback' });
    }
  });

  socket.on('RESIGN', ({ roomId }: any) => {
    const room = gameManager.getRoom(roomId);
    if (!room) return;

    const newState = room.resign(socket.id);
    io.to(roomId).emit('GAME_ENDED', {
      gameState: newState
    });
  });

  socket.on('REMATCH_REQUEST', ({ roomId }: any) => {
    const room = gameManager.getRoom(roomId);
    if (!room) return;

    const bothReady = room.addRematchReady(socket.id);
    
    if (bothReady) {
      const newState = room.resetGame();
      io.to(roomId).emit('REMATCH_START', {
        gameState: newState
      });
    } else {
      io.to(roomId).emit('REMATCH_WAITING', {
        readyCount: room.data.rematchReady.length
      });
    }
  });

  socket.on('RESYNC_REQUEST', ({ roomId }: any) => {
    const room = gameManager.getRoom(roomId);
    if (!room) {
      socket.emit('ROOM_ERROR', { message: 'Room not found' });
      return;
    }

    socket.emit('RESYNC_STATE', {
      gameState: room.getState(),
      players: room.data.players.map((p: any) => ({ 
        color: p.color, 
        connected: p.connected,
        takebacksUsed: p.takebacksUsed 
      }))
    });
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Chess server running on port ${PORT}`);
});
