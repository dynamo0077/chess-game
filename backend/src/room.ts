import { Chess } from 'chess.js';
import { GameState, Player, RoomData, MAX_TAKEBACKS_PER_PLAYER } from './types';

export class Room {
  private chess: Chess;
  public data: RoomData;

  constructor(roomId: string) {
    this.chess = new Chess();
    this.data = {
      roomId,
      players: [],
      gameState: this.getGameState(),
      rematchReady: [],
      createdAt: Date.now()
    };
  }

  addPlayer(socketId: string): Player | null {
    if (this.data.players.length >= 2) return null;

    const color: 'w' | 'b' = this.data.players.length === 0 ? 'w' : 'b';
    const player: Player = {
      socketId,
      color,
      connected: true,
      takebacksUsed: 0
    };

    this.data.players.push(player);
    
    if (this.data.players.length === 2) {
      this.data.gameState.status = 'playing';
    }

    return player;
  }

  removePlayer(socketId: string): void {
    const index = this.data.players.findIndex(p => p.socketId === socketId);
    if (index !== -1) {
      this.data.players[index].connected = false;
    }
  }

  reconnectPlayer(oldSocketId: string, newSocketId: string): Player | null {
    const player = this.data.players.find(p => p.socketId === oldSocketId);
    if (player) {
      player.socketId = newSocketId;
      player.connected = true;
      return player;
    }
    return null;
  }

  makeMove(from: string, to: string, promotion?: string): GameState | null {
    try {
      const move = this.chess.move({ from, to, promotion: promotion || 'q' });
      if (!move) return null;

      this.data.gameState = this.getGameState();
      this.data.gameState.lastMove = {
        from: move.from,
        to: move.to,
        piece: move.piece
      };

      this.data.pendingTakeback = undefined;
      return this.data.gameState;
    } catch (error) {
      return null;
    }
  }

  canTakeback(socketId: string): { allowed: boolean; reason?: string } {
    const player = this.data.players.find(p => p.socketId === socketId);
    if (!player) {
      return { allowed: false, reason: 'Player not found' };
    }

    if (this.data.gameState.status === 'checkmate' || this.data.gameState.status === 'resigned') {
      return { allowed: false, reason: 'Cannot undo after game ended' };
    }

    if (this.data.gameState.moveHistory.length === 0) {
      return { allowed: false, reason: 'No moves to undo' };
    }

    if (player.takebacksUsed >= MAX_TAKEBACKS_PER_PLAYER) {
      return { allowed: false, reason: `Maximum ${MAX_TAKEBACKS_PER_PLAYER} takebacks per player` };
    }

    return { allowed: true };
  }

  executeTakeback(socketId: string): GameState | null {
    const player = this.data.players.find(p => p.socketId === socketId);
    if (!player) return null;

    try {
      this.chess.undo();
      player.takebacksUsed++;

      this.data.gameState = this.getGameState();
      this.data.pendingTakeback = undefined;

      return this.data.gameState;
    } catch (error) {
      return null;
    }
  }

  resign(socketId: string): GameState {
    const player = this.data.players.find(p => p.socketId === socketId);
    if (player) {
      const winner = player.color === 'w' ? 'b' : 'w';
      this.data.gameState.status = 'resigned';
      this.data.gameState.gameResult = {
        winner,
        reason: `${player.color === 'w' ? 'White' : 'Black'} resigned`
      };
    }
    return this.data.gameState;
  }

  resetGame(): GameState {
    this.chess.reset();
    this.data.gameState = this.getGameState();
    this.data.gameState.status = 'playing';
    this.data.rematchReady = [];
    this.data.pendingTakeback = undefined;
    
    this.data.players.forEach(p => p.takebacksUsed = 0);

    return this.data.gameState;
  }

  addRematchReady(socketId: string): boolean {
    if (!this.data.rematchReady.includes(socketId)) {
      this.data.rematchReady.push(socketId);
    }
    return this.data.rematchReady.length === 2;
  }

  private getGameState(): GameState {
    const state: GameState = {
      fen: this.chess.fen(),
      moveHistory: this.chess.history({ verbose: false }),
      turn: this.chess.turn(),
      status: 'playing'
    };

    if (this.chess.isCheckmate()) {
      state.status = 'checkmate';
      state.gameResult = {
        winner: this.chess.turn() === 'w' ? 'b' : 'w',
        reason: 'Checkmate'
      };
    } else if (this.chess.isStalemate()) {
      state.status = 'stalemate';
      state.gameResult = {
        winner: 'draw',
        reason: 'Stalemate'
      };
    } else if (this.chess.isDraw()) {
      state.status = 'draw';
      state.gameResult = {
        winner: 'draw',
        reason: this.chess.isThreefoldRepetition() 
          ? 'Threefold repetition'
          : this.chess.isInsufficientMaterial()
          ? 'Insufficient material'
          : 'Draw'
      };
    }

    return state;
  }

  getState(): GameState {
    return this.data.gameState;
  }

  isFull(): boolean {
    return this.data.players.length >= 2;
  }
}
