'use client';

import React, { useState } from 'react';
import { Square as SquareComponent } from './Square';
import { ChessEngine } from '@/lib/chess-engine';
import styles from './Board.module.css';

interface BoardProps {
  gameEngine: ChessEngine;
  onMove: (from: string, to: string, promotion?: string) => void;
  disabled?: boolean;
  playerColor?: 'w' | 'b';
  orientation?: 'white' | 'black';
}

export const Board: React.FC<BoardProps> = ({ 
  gameEngine, 
  onMove, 
  disabled = false,
  playerColor,
  orientation = 'white'
}) => {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);
  const [promotionPending, setPromotionPending] = useState<{ from: string; to: string } | null>(null);

  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
  
  const displayFiles = orientation === 'white' ? files : [...files].reverse();
  const displayRanks = orientation === 'white' ? ranks : [...ranks].reverse();

  const handleSquareClick = (square: string) => {
    if (disabled) return;

    const piece = gameEngine.getPieceAt(square);
    const gameState = gameEngine.getState();

    if (selectedSquare) {
      if (legalMoves.includes(square)) {
        const movingPiece = gameEngine.getPieceAt(selectedSquare);
        
        if (movingPiece?.type === 'p' && 
            ((movingPiece.color === 'w' && square[1] === '8') || 
             (movingPiece.color === 'b' && square[1] === '1'))) {
          setPromotionPending({ from: selectedSquare, to: square });
        } else {
          onMove(selectedSquare, square);
        }
        
        setSelectedSquare(null);
        setLegalMoves([]);
      } else if (piece && piece.color === gameState.turn && 
                 (!playerColor || piece.color === playerColor)) {
        setSelectedSquare(square);
        setLegalMoves(gameEngine.getLegalMoves(square));
      } else {
        setSelectedSquare(null);
        setLegalMoves([]);
      }
    } else {
      if (piece && piece.color === gameState.turn && 
          (!playerColor || piece.color === playerColor)) {
        setSelectedSquare(square);
        setLegalMoves(gameEngine.getLegalMoves(square));
      }
    }
  };

  const handlePromotion = (piece: string) => {
    if (promotionPending) {
      onMove(promotionPending.from, promotionPending.to, piece);
      setPromotionPending(null);
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  const renderSquare = (square: string, fileIndex: number, rankIndex: number) => {
    const isLight = (fileIndex + rankIndex) % 2 === 0;
    const piece = gameEngine.getPieceAt(square);
    const isSelected = selectedSquare === square;
    const isLegal = legalMoves.includes(square);

    return (
      <SquareComponent
        key={square}
        square={square}
        isLight={isLight}
        piece={piece}
        isSelected={isSelected}
        isLegalMove={isLegal}
        isCheck={false}
        onClick={() => handleSquareClick(square)}
      />
    );
  };

  const getPieceSymbol = (type: string, color: 'w' | 'b'): string => {
    const pieces: Record<string, string> = {
      'w_q': '♕', 'w_r': '♖', 'w_b': '♗', 'w_n': '♘',
      'b_q': '♛', 'b_r': '♜', 'b_b': '♝', 'b_n': '♞',
    };
    return pieces[`${color}_${type}`] || '';
  };

  return (
    <>
      <div className={styles.board}>
        {displayRanks.map((rank, rankIndex) => (
          <React.Fragment key={rank}>
            {displayFiles.map((file, fileIndex) => {
              const square = `${file}${rank}`;
              return renderSquare(square, fileIndex, rankIndex);
            })}
          </React.Fragment>
        ))}
      </div>

      {promotionPending && (
        <div className={styles.promotionOverlay}>
          <div className={styles.promotionDialog}>
            <h3>Choose promotion</h3>
            <div className={styles.promotionPieces}>
              {['q', 'r', 'b', 'n'].map(piece => (
                <button
                  key={piece}
                  className={styles.promotionButton}
                  onClick={() => handlePromotion(piece)}
                >
                  {getPieceSymbol(piece, gameEngine.getState().turn)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
