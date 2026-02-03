export type PieceColor = 'w' | 'b';
export type GameStatus = 'waiting' | 'playing' | 'checkmate' | 'stalemate' | 'draw' | 'resigned';

export interface GameState {
  fen: string;
  moveHistory: string[];
  turn: PieceColor;
  status: GameStatus;
  gameResult?: {
    winner?: PieceColor | 'draw';
    reason: string;
  };
  lastMove?: {
    from: string;
    to: string;
    piece: string;
  };
}

export interface Square {
  square: string;
  type: string;
  color: PieceColor;
}

export interface Move {
  from: string;
  to: string;
  promotion?: string;
}

export interface ToastMessage {
  id: string;
  type: 'info' | 'success' | 'error' | 'warning';
  message: string;
}
