'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Board } from '@/components/Board';
import { MoveList } from '@/components/MoveList';
import { GameControls } from '@/components/GameControls';
import { Toast } from '@/components/Toast';
import { ChessEngine } from '@/lib/chess-engine';
import { ToastMessage } from '@/lib/types';
import styles from './offline.module.css';

export default function OfflinePage() {
  const router = useRouter();
  const [gameEngine] = useState(() => new ChessEngine());
  const [gameState, setGameState] = useState(gameEngine.getState());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: ToastMessage['type'] = 'info') => {
    const toast: ToastMessage = {
      id: Date.now().toString(),
      type,
      message
    };
    setToasts(prev => [...prev, toast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleMove = (from: string, to: string, promotion?: string) => {
    const newState = gameEngine.makeMove(from, to, promotion);
    
    if (newState) {
      setGameState(newState);

      if (newState.status === 'checkmate') {
        const winner = newState.gameResult?.winner === 'w' ? 'White' : 'Black';
        addToast(`Checkmate! ${winner} wins!`, 'success');
      } else if (newState.status === 'stalemate') {
        addToast('Stalemate! Game is a draw.', 'info');
      } else if (newState.status === 'draw') {
        addToast(`Draw! ${newState.gameResult?.reason}`, 'info');
      }
    } else {
      addToast('Illegal move!', 'error');
    }
  };

  const handleUndo = () => {
    const newState = gameEngine.undo();
    if (newState) {
      setGameState(newState);
      addToast('Move undone', 'info');
    } else {
      addToast('No moves to undo', 'warning');
    }
  };

  const handleNewGame = () => {
    const newState = gameEngine.reset();
    setGameState(newState);
    addToast('New game started!', 'success');
  };

  const handleRematch = () => {
    handleNewGame();
  };

  const isGameOver = ['checkmate', 'stalemate', 'draw', 'resigned'].includes(gameState.status);

  return (
    <div className={styles.container}>
      <Toast toasts={toasts} onDismiss={removeToast} />

      <header className={styles.header}>
        <button onClick={() => router.push('/')} className={styles.backButton}>
          ← Back to Home
        </button>
        <h1 className={styles.title}>Offline Mode</h1>
        <div className={styles.turn}>
          {!isGameOver && (
            <>
              Turn: <span className={styles.turnIndicator}>
                {gameState.turn === 'w' ? 'White ♔' : 'Black ♚'}
              </span>
            </>
          )}
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.gameArea}>
          <Board
            gameEngine={gameEngine}
            onMove={handleMove}
            disabled={isGameOver}
          />
        </div>

        <aside className={styles.sidebar}>
          <MoveList moves={gameState.moveHistory} />
          
          <GameControls
            onNewGame={handleNewGame}
            onUndo={handleUndo}
            onRematch={handleRematch}
            undoDisabled={gameState.moveHistory.length === 0}
            showRematch={isGameOver}
          />

          {isGameOver && gameState.gameResult && (
            <div className={styles.gameOver}>
              <h2>Game Over!</h2>
              <p>{gameState.gameResult.reason}</p>
              {gameState.gameResult.winner !== 'draw' && (
                <p className={styles.winner}>
                  {gameState.gameResult.winner === 'w' ? 'White' : 'Black'} wins!
                </p>
              )}
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}
