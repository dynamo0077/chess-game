'use client';

import React from 'react';
import styles from './GameControls.module.css';

interface GameControlsProps {
  onNewGame: () => void;
  onUndo: () => void;
  onRematch?: () => void;
  undoDisabled?: boolean;
  rematchDisabled?: boolean;
  showRematch?: boolean;
}

export const GameControls: React.FC<GameControlsProps> = ({
  onNewGame,
  onUndo,
  onRematch,
  undoDisabled = false,
  rematchDisabled = false,
  showRematch = false
}) => {
  return (
    <div className={styles.controls}>
      <button 
        className={`${styles.button} ${styles.primary}`}
        onClick={onNewGame}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="23 4 23 10 17 10"></polyline>
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
        </svg>
        New Game
      </button>

      <button 
        className={`${styles.button} ${styles.secondary}`}
        onClick={onUndo}
        disabled={undoDisabled}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 7v6h6"></path>
          <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13"></path>
        </svg>
        Undo
      </button>

      {showRematch && (
        <button 
          className={`${styles.button} ${styles.success}`}
          onClick={onRematch}
          disabled={rematchDisabled}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 4 23 10 17 10"></polyline>
            <polyline points="1 20 1 14 7 14"></polyline>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
          </svg>
          Rematch
        </button>
      )}
    </div>
  );
};
