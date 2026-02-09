import { Chess } from 'chess.js';
import { GameState } from './types';

export class ChessEngine {
  private chess: Chess;

  constructor(fen?: string) {
    this.chess = new Chess(fen);
  }

  makeMove(from: string, to: string, promotion?: string): GameState | null {
    try {
      const move = this.chess.move({ from, to, promotion: promotion || 'q' });
      if (!move) return null;

      return this.getState();
    } catch (error) {
      return null;
    }
  }

  undo(): GameState | null {
    const move = this.chess.undo();
    if (!move) return null;

    return this.getState();
  }

  reset(): GameState {
    this.chess.reset();
    return this.getState();
  }

  loadFen(fen: string): void {
    this.chess.load(fen);
  }

  isLegalMove(from: string, to: string): boolean {
    const moves = this.chess.moves({ square: from as any, verbose: true });
    return moves.some(m => m.to === to);
  }

  getLegalMoves(square: string): string[] {
    const moves = this.chess.moves({ square: square as any, verbose: true });
    return moves.map(m => m.to);
  }

  getState(): GameState {
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

  getPieceAt(square: string): { type: string; color: 'w' | 'b' } | null {
    const piece = this.chess.get(square as any);
    return piece || null;
  }
}
