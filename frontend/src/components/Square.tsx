'use client';

import React from 'react';
import { ChessPiece } from './pieces/ChessPiece';
import { PieceType } from '@/lib/skins';
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
          <ChessPiece
            type={piece.type as PieceType}
            color={piece.color}
          />
        </div>
      )}
    </div>
  );
};
