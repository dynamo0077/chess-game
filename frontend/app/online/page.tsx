'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Board } from '@/components/Board';
import { MoveList } from '@/components/MoveList';
import { GameControls } from '@/components/GameControls';
import { Toast } from '@/components/Toast';
import { TakebackDialog } from '@/components/TakebackDialog';
import { SkinSelector } from '@/components/SkinSelector';
import { ChessEngine } from '@/lib/chess-engine';
import { socketClient } from '@/lib/socket-client';
import { ToastMessage, GameState } from '@/lib/types';
import styles from './online.module.css';

type ConnectionStatus = 'connecting' | 'waking_up' | 'connected' | 'disconnected';

export default function OnlinePage() {
    const router = useRouter();
    const [gameEngine] = useState(() => new ChessEngine());
    const [gameState, setGameState] = useState<GameState>(gameEngine.getState());
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const [roomId, setRoomId] = useState<string>('');
    const [joinRoomId, setJoinRoomId] = useState<string>('');
    const [playerColor, setPlayerColor] = useState<'w' | 'b' | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
    const [inRoom, setInRoom] = useState(false);
    const [takebackRequest, setTakebackRequest] = useState<{ requesterColor: 'w' | 'b' } | null>(null);
    const [showSkinSelector, setShowSkinSelector] = useState(false);
    const wakingTimerRef = useRef<NodeJS.Timeout | null>(null);

    const isConnected = connectionStatus === 'connected';

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

    useEffect(() => {
        const socket = socketClient.connect();

        // Start a 3-second timer — if not connected by then, show waking_up state
        wakingTimerRef.current = setTimeout(() => {
            setConnectionStatus(prev => {
                if (prev === 'connecting') return 'waking_up';
                return prev;
            });
        }, 3000);

        socket.on('connect', () => {
            if (wakingTimerRef.current) {
                clearTimeout(wakingTimerRef.current);
                wakingTimerRef.current = null;
            }
            setConnectionStatus('connected');
            addToast('Connected to server', 'success');
        });

        socket.on('disconnect', () => {
            setConnectionStatus(prev => {
                // Only show "disconnected" if we were previously connected
                if (prev === 'connected') {
                    addToast('Disconnected from server', 'error');
                    return 'disconnected';
                }
                return prev;
            });
        });

        socket.on('connect_error', () => {
            setConnectionStatus(prev => {
                if (prev === 'connecting') return 'waking_up';
                return prev;
            });
        });

        socket.on('ROOM_CREATED', ({ roomId, color, gameState }) => {
            setRoomId(roomId);
            setPlayerColor(color);
            setInRoom(true);
            if (gameState && gameState.fen) {
                gameEngine.loadFen(gameState.fen);
                setGameState(gameState);
            }
            addToast(`Room created: ${roomId}`, 'success');
        });


        socket.on('ROOM_JOINED', ({ roomId, color, gameState }) => {
            setRoomId(roomId);
            setPlayerColor(color);
            setInRoom(true);
            gameEngine.loadFen(gameState.fen);
            setGameState(gameState);
            addToast('Joined room successfully!', 'success');
        });

        socket.on('ROOM_STATE', ({ gameState }) => {
            if (gameState && gameState.fen) {
                gameEngine.loadFen(gameState.fen);
                setGameState(gameState);
            }
        });


        socket.on('ROOM_ERROR', ({ message }) => {
            addToast(message, 'error');
        });

        socket.on('MOVE_APPLIED', ({ gameState }) => {
            gameEngine.loadFen(gameState.fen);
            setGameState(gameState);

            if (gameState.status === 'checkmate') {
                const winner = gameState.gameResult?.winner === 'w' ? 'White' : 'Black';
                addToast(`Checkmate! ${winner} wins!`, 'success');
            } else if (gameState.status === 'stalemate') {
                addToast('Stalemate! Game is a draw.', 'info');
            } else if (gameState.status === 'draw') {
                addToast(`Draw! ${gameState.gameResult?.reason}`, 'info');
            }
        });

        socket.on('MOVE_REJECTED', ({ reason }) => {
            addToast(reason || 'Illegal move', 'error');
        });

        socket.on('TAKEBACK_PENDING', ({ requesterColor }) => {
            setTakebackRequest({ requesterColor });
        });

        socket.on('TAKEBACK_WAITING', () => {
            addToast('Waiting for opponent to accept...', 'info');
        });

        socket.on('TAKEBACK_APPLIED', ({ gameState }) => {
            gameEngine.loadFen(gameState.fen);
            setGameState(gameState);
            setTakebackRequest(null);
            addToast('Takeback accepted', 'success');
        });

        socket.on('TAKEBACK_DECLINED', () => {
            setTakebackRequest(null);
            addToast('Takeback declined', 'warning');
        });

        socket.on('TAKEBACK_REJECTED', ({ reason }) => {
            addToast(reason || 'Takeback not allowed', 'error');
        });

        socket.on('REMATCH_START', ({ gameState }) => {
            gameEngine.loadFen(gameState.fen);
            setGameState(gameState);
            addToast('Rematch started!', 'success');
        });

        socket.on('REMATCH_WAITING', () => {
            addToast('Waiting for opponent to accept rematch...', 'info');
        });

        return () => {
            if (wakingTimerRef.current) {
                clearTimeout(wakingTimerRef.current);
            }
            socketClient.disconnect();
        };
    }, [gameEngine]);

    const handleCreateRoom = () => {
        const socket = socketClient.getSocket();
        if (socket) {
            socket.emit('ROOM_CREATE');
        }
    };

    const handleJoinRoom = () => {
        if (!joinRoomId.trim()) {
            addToast('Please enter a room code', 'warning');
            return;
        }

        const socket = socketClient.getSocket();
        if (socket) {
            socket.emit('ROOM_JOIN', joinRoomId.toUpperCase());
        }
    };

    const handleMove = (from: string, to: string, promotion?: string) => {
        const socket = socketClient.getSocket();
        if (socket && roomId) {
            socket.emit('MOVE_MAKE', { roomId, from, to, promotion });
        }
    };

    const handleUndo = () => {
        const socket = socketClient.getSocket();
        if (socket && roomId) {
            socket.emit('TAKEBACK_REQUEST', { roomId });
        }
    };

    const handleTakebackAccept = () => {
        const socket = socketClient.getSocket();
        if (socket && roomId) {
            socket.emit('TAKEBACK_RESPOND', { roomId, accepted: true });
        }
    };

    const handleTakebackDecline = () => {
        const socket = socketClient.getSocket();
        if (socket && roomId) {
            socket.emit('TAKEBACK_RESPOND', { roomId, accepted: false });
        }
    };

    const handleRematch = () => {
        const socket = socketClient.getSocket();
        if (socket && roomId) {
            socket.emit('REMATCH_REQUEST', { roomId });
        }
    };

    const handleNewGame = () => {
        setInRoom(false);
        setRoomId('');
        setPlayerColor(null);
        setGameState(gameEngine.reset());
        addToast('Left the room', 'info');
    };

    const isGameOver = ['checkmate', 'stalemate', 'draw', 'resigned'].includes(gameState.status);
    const isMyTurn = playerColor === gameState.turn;

    // Waking Up Overlay
    const showWakingOverlay = connectionStatus === 'connecting' || connectionStatus === 'waking_up';

    // Status indicator text
    const statusDisplay = () => {
        switch (connectionStatus) {
            case 'connecting':
                return <span className={styles.statusConnecting}>● Connecting...</span>;
            case 'waking_up':
                return <span className={styles.statusWaking}>● Waking up...</span>;
            case 'connected':
                return <span className={styles.connected}>● Connected</span>;
            case 'disconnected':
                return <span className={styles.disconnected}>● Disconnected</span>;
        }
    };

    if (!inRoom) {
        return (
            <div className={styles.container}>
                <Toast toasts={toasts} onDismiss={removeToast} />

                {showWakingOverlay && (
                    <div className={`${styles.wakingOverlay} ${connectionStatus === 'waking_up' ? styles.wakingVisible : ''}`}>
                        <div className={styles.wakingCard}>
                            <div className={styles.planetContainer}>
                                <div className={styles.planet}></div>
                                <div className={`${styles.planetRing} ${styles.ring1}`}></div>
                                <div className={`${styles.planetRing} ${styles.ring2}`}></div>
                                <div className={`${styles.planetRing} ${styles.ring3}`}></div>
                            </div>
                            <h2 className={styles.wakingTitle}>
                                {connectionStatus === 'connecting' ? 'Connecting...' : 'Server is waking up...'}
                            </h2>
                            <p className={styles.wakingText}>Please wait</p>
                            {connectionStatus === 'waking_up' && (
                                <p className={styles.wakingSubtext}>
                                    This may take up to 60 seconds on the free tier.
                                </p>
                            )}
                        </div>
                    </div>
                )}

                <header className={styles.header}>
                    <button onClick={() => router.push('/')} className={styles.backButton}>
                        ← Back to Home
                    </button>
                    <h1 className={styles.title}>Online Mode</h1>
                    <div className={styles.status}>
                        {statusDisplay()}
                    </div>
                </header>

                <main className={styles.lobby}>
                    <div className={styles.lobbyCard}>
                        <h2>Create a Room</h2>
                        <p>Start a new game and share the room code with your opponent</p>
                        <button onClick={handleCreateRoom} className={styles.createButton}>
                            Create Room
                        </button>
                    </div>

                    <div className={styles.divider}>OR</div>

                    <div className={styles.lobbyCard}>
                        <h2>Join a Room</h2>
                        <p>Enter the room code provided by your opponent</p>
                        <input
                            type="text"
                            placeholder="Enter room code"
                            value={joinRoomId}
                            onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
                            className={styles.input}
                            maxLength={6}
                        />
                        <button onClick={handleJoinRoom} className={styles.joinButton}>
                            Join Room
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Toast toasts={toasts} onDismiss={removeToast} />
            <SkinSelector
                isOpen={showSkinSelector}
                onClose={() => setShowSkinSelector(false)}
                playerColor={playerColor || undefined}
            />
            {takebackRequest && (
                <TakebackDialog
                    requesterColor={takebackRequest.requesterColor}
                    onAccept={handleTakebackAccept}
                    onDecline={handleTakebackDecline}
                />
            )}

            <header className={styles.header}>
                <button onClick={handleNewGame} className={styles.backButton}>
                    ← Leave Room
                </button>
                <h1 className={styles.title}>Room: {roomId}</h1>
                <div className={styles.headerActions}>
                    <button
                        onClick={() => setShowSkinSelector(true)}
                        className={styles.skinButton}
                        title="Change piece skins"
                    >
                        🎨 Skins
                    </button>
                    <div className={styles.playerInfo}>
                        You are: <span className={styles.colorBadge}>
                            {playerColor === 'w' ? 'White ♔' : 'Black ♚'}
                        </span>
                        {!isGameOver && (
                            <span className={isMyTurn ? styles.yourTurn : styles.opponentTurn}>
                                {isMyTurn ? '(Your turn)' : '(Opponent\'s turn)'}
                            </span>
                        )}
                    </div>
                </div>
            </header>

            <main className={styles.main}>
                <div className={styles.gameArea}>
                    <Board
                        gameEngine={gameEngine}
                        onMove={handleMove}
                        disabled={isGameOver || !isMyTurn}
                        playerColor={playerColor || undefined}
                        orientation={playerColor === 'b' ? 'black' : 'white'}
                    />
                </div>

                <aside className={styles.sidebar}>
                    <MoveList moves={gameState.moveHistory} />

                    <GameControls
                        onNewGame={handleNewGame}
                        onUndo={handleUndo}
                        onRematch={handleRematch}
                        undoDisabled={gameState.moveHistory.length === 0 || isGameOver}
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
