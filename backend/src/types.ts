export interface Player {
  socketId: string;
  color: 'w' | 'b';
  connected: boolean;
  takebacksUsed: number;
}

export interface GameState {
  fen: string;
  moveHistory: string[];
  turn: 'w' | 'b';
  status: 'waiting' | 'playing' | 'checkmate' | 'stalemate' | 'draw' | 'resigned';
  gameResult?: {
    winner?: 'w' | 'b' | 'draw';
    reason: string;
  };
  lastMove?: {
    from: string;
    to: string;
    piece: string;
  };
}

export interface RoomData {
  roomId: string;
  players: Player[];
  gameState: GameState;
  pendingTakeback?: {
    requesterId: string;
    timestamp: number;
  };
  rematchReady: string[];
  createdAt: number;
}

export const MAX_TAKEBACKS_PER_PLAYER = 3;
export const TAKEBACK_TIMEOUT_MS = 30000;
export const ROOM_TTL_MS = 3600000;
