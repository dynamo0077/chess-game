'use client';

import React from 'react';
import styles from './Square.module.css';

interface SquareProps {
  square: string;
  isLight: boolean;
  piece: { type: string; color: 'w' | 'b' } | null;
  isSelected: boolean;
  isLegalMove: boolean;
  isCheck: boolean;
  onClick: () => void;
}

export const Square: React.FC<SquareProps> = ({
  square,
  isLight,
  piece,
  isSelected,
  isLegalMove,
  isCheck,
  onClick
}) => {
  const getPieceSymbol = (type: string, color: 'w' | 'b'): string => {
    const pieces: Record<string, string> = {
      'w_k': '♔', 'w_q': '♕', 'w_r': '♖', 'w_b': '♗', 'w_n': '♘', 'w_p': '♙',
      'b_k': '♚', 'b_q': '♛', 'b_r': '♜', 'b_b': '♝', 'b_n': '♞', 'b_p': '♟',
    };
    return pieces[`${color}_${type}`] || '';
  };

  const squareClasses = [
    styles.square,
    isLight ? styles.light : styles.dark,
    isSelected && styles.selected,
    isCheck && styles.check,
  ].filter(Boolean).join(' ');

  return (
    <div className={squareClasses} onClick={onClick}>
      {isLegalMove && <div className={styles.legalMove} />}
      {piece && (
        <div className={styles.piece}>
          {getPieceSymbol(piece.type, piece.color)}
        </div>
      )}
    </div>
  );
};
