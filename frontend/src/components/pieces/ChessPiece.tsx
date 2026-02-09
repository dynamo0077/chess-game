'use client';

import React from 'react';
import { useSkin } from '@/lib/useSkin';
import { PieceType, PieceColor, SkinId, SKINS } from '@/lib/skins';
import styles from './ChessPiece.module.css';

interface ChessPieceProps {
    type: PieceType;
    color: PieceColor;
    skinOverride?: SkinId;
    size?: number;
    animated?: boolean;
}

// SVG path data for each piece type - designed for a 45x45 viewBox
const PIECE_PATHS: Record<PieceType, { path: string; decorations?: string }> = {
    k: {
        // King - crown with cross
        path: 'M22.5 11.63V6M20 8h5M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5M12.5 37c5.5 3.5 14.5 3.5 20 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-2.5-7.5-12-10.5-16-4-3 6 6 10.5 6 10.5v7',
        decorations: 'M12.5 30c5.5-3 14.5-3 20 0m-20 3.5c5.5-3 14.5-3 20 0m-20 3.5c5.5-3 14.5-3 20 0',
    },
    q: {
        // Queen - crown with circles
        path: 'M9 26c8.5-1.5 21-1.5 27 0l2.5-12.5L31 25l-.3-14.1-5.2 13.6-3-14.5-3 14.5-5.2-13.6L14 25 6.5 13.5 9 26zM9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z',
        decorations: 'M11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0',
    },
    r: {
        // Rook - castle tower
        path: 'M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5M34 14l-3 3H14l-3-3M31 17v12.5H14V17M11 14h23',
    },
    b: {
        // Bishop - mitre hat
        path: 'M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2zM15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2zM25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z',
        decorations: 'M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5',
    },
    n: {
        // Knight - horse head
        path: 'M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4.003 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-.994-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-1.992 2.5-3c1 0 1 3 1 3',
        decorations: 'M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0zM14.933 15.75a.5 1.5 30 1 1-.866-.5.5 1.5 30 1 1 .866.5z',
    },
    p: {
        // Pawn - simple soldier
        path: 'M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z',
    },
};

export const ChessPiece: React.FC<ChessPieceProps> = ({
    type,
    color,
    skinOverride,
    size = 45,
    animated = true,
}) => {
    const skinContext = useSkin();

    // Use override or get from context based on piece color
    const skinId = skinOverride || (color === 'w' ? skinContext.whiteSkin : skinContext.blackSkin);
    const skin = SKINS[skinId];
    const colorConfig = color === 'w' ? skin.colors.white : skin.colors.black;

    const pieceData = PIECE_PATHS[type];

    // Different styles per skin
    const getSkinStyles = () => {
        switch (skinId) {
            case 'metallic':
                return {
                    filter: 'url(#metallic-gradient)',
                    strokeLinejoin: 'round' as const,
                };
            case 'fantasy':
                return {
                    filter: 'url(#fantasy-glow)',
                };
            case 'minimalist':
                return {
                    strokeWidth: 1.5,
                    strokeLinejoin: 'round' as const,
                };
            case 'cartoon':
                return {
                    strokeWidth: 2.5,
                    strokeLinejoin: 'round' as const,
                    strokeLinecap: 'round' as const,
                };
            default:
                return {};
        }
    };

    const skinStyles = getSkinStyles();

    return (
        <svg
            viewBox="0 0 45 45"
            width={size}
            height={size}
            className={`${styles.piece} ${animated ? styles.animated : ''} ${styles[skinId]}`}
            style={{ '--glow-color': colorConfig.glow } as React.CSSProperties}
            aria-label={`${color === 'w' ? 'White' : 'Black'} ${getPieceName(type)}`}
            role="img"
        >
            <defs>
                {/* Metallic gradient */}
                <linearGradient id={`metallic-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={colorConfig.accent} />
                    <stop offset="50%" stopColor={colorConfig.fill} />
                    <stop offset="100%" stopColor={colorConfig.stroke} />
                </linearGradient>

                {/* Fantasy glow filter */}
                <filter id={`glow-${color}`} x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>

                {/* Wooden texture pattern */}
                <pattern id={`wood-${color}`} patternUnits="userSpaceOnUse" width="4" height="4">
                    <rect width="4" height="4" fill={colorConfig.fill} />
                    <path d="M0 0L4 4M-1 3L1 5M3 -1L5 1" stroke={colorConfig.accent} strokeWidth="0.5" opacity="0.3" />
                </pattern>
            </defs>

            <g
                fill={skinId === 'classic' ? `url(#wood-${color})` :
                    skinId === 'metallic' ? `url(#metallic-${color})` :
                        colorConfig.fill}
                stroke={colorConfig.stroke}
                strokeWidth={skinStyles.strokeWidth || 1.5}
                strokeLinecap={skinStyles.strokeLinecap || 'round'}
                strokeLinejoin={skinStyles.strokeLinejoin || 'round'}
                filter={skinId === 'fantasy' ? `url(#glow-${color})` : undefined}
            >
                <path d={pieceData.path} />
                {pieceData.decorations && (
                    <path
                        d={pieceData.decorations}
                        fill="none"
                        stroke={colorConfig.accent}
                        strokeWidth={skinStyles.strokeWidth ? skinStyles.strokeWidth * 0.7 : 1}
                    />
                )}
            </g>
        </svg>
    );
};

function getPieceName(type: PieceType): string {
    const names: Record<PieceType, string> = {
        k: 'King',
        q: 'Queen',
        r: 'Rook',
        b: 'Bishop',
        n: 'Knight',
        p: 'Pawn',
    };
    return names[type];
}

export default ChessPiece;
