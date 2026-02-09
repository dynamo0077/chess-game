'use client';

import React, { useState } from 'react';
import { useSkin } from '@/lib/useSkin';
import { SkinId, SKIN_LIST, PieceType } from '@/lib/skins';
import { ChessPiece } from './pieces/ChessPiece';
import styles from './SkinSelector.module.css';

interface SkinSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    playerColor?: 'w' | 'b'; // If provided, only allows selecting skin for this color
}

const PREVIEW_PIECES: PieceType[] = ['k', 'q', 'r', 'b', 'n', 'p'];

export const SkinSelector: React.FC<SkinSelectorProps> = ({
    isOpen,
    onClose,
    playerColor,
}) => {
    const { whiteSkin, blackSkin, setWhiteSkin, setBlackSkin, availableSkins } = useSkin();

    // Local state for preview before applying
    const [selectedWhite, setSelectedWhite] = useState<SkinId>(whiteSkin);
    const [selectedBlack, setSelectedBlack] = useState<SkinId>(blackSkin);
    const [activeTab, setActiveTab] = useState<'white' | 'black'>(
        playerColor === 'w' ? 'white' : playerColor === 'b' ? 'black' : 'white'
    );

    if (!isOpen) return null;

    const handleApply = () => {
        if (!playerColor || playerColor === 'w') {
            setWhiteSkin(selectedWhite);
        }
        if (!playerColor || playerColor === 'b') {
            setBlackSkin(selectedBlack);
        }
        onClose();
    };

    const handleSkinSelect = (skinId: SkinId) => {
        if (activeTab === 'white') {
            setSelectedWhite(skinId);
        } else {
            setSelectedBlack(skinId);
        }
    };

    const currentSelection = activeTab === 'white' ? selectedWhite : selectedBlack;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2>Choose Your Skin</h2>
                    <button className={styles.closeButton} onClick={onClose} aria-label="Close">
                        ✕
                    </button>
                </div>

                {/* Tab selector for White/Black pieces */}
                {!playerColor && (
                    <div className={styles.tabs}>
                        <button
                            className={`${styles.tab} ${activeTab === 'white' ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab('white')}
                        >
                            ♔ White Pieces
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === 'black' ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab('black')}
                        >
                            ♚ Black Pieces
                        </button>
                    </div>
                )}

                <div className={styles.skinGrid}>
                    {availableSkins.map((skin) => (
                        <button
                            key={skin.id}
                            className={`${styles.skinCard} ${currentSelection === skin.id ? styles.selected : ''}`}
                            onClick={() => handleSkinSelect(skin.id)}
                        >
                            <div className={styles.skinPreview}>
                                {PREVIEW_PIECES.map((pieceType) => (
                                    <ChessPiece
                                        key={pieceType}
                                        type={pieceType}
                                        color={activeTab === 'white' ? 'w' : 'b'}
                                        skinOverride={skin.id}
                                        size={32}
                                        animated={false}
                                    />
                                ))}
                            </div>
                            <div className={styles.skinInfo}>
                                <h3>{skin.name}</h3>
                                <p>{skin.description}</p>
                            </div>
                        </button>
                    ))}
                </div>

                <div className={styles.footer}>
                    <button className={styles.cancelButton} onClick={onClose}>
                        Cancel
                    </button>
                    <button className={styles.applyButton} onClick={handleApply}>
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SkinSelector;
