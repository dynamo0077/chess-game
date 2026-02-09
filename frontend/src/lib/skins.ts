// Skin type definitions and configuration for chess pieces

export type SkinId = 'classic' | 'metallic' | 'fantasy' | 'minimalist' | 'vintage' | 'cartoon';
export type PieceType = 'k' | 'q' | 'r' | 'b' | 'n' | 'p';
export type PieceColor = 'w' | 'b';

export interface Skin {
    id: SkinId;
    name: string;
    description: string;
    colors: {
        white: {
            fill: string;
            stroke: string;
            accent: string;
            glow: string;
        };
        black: {
            fill: string;
            stroke: string;
            accent: string;
            glow: string;
        };
    };
}

export const SKINS: Record<SkinId, Skin> = {
    classic: {
        id: 'classic',
        name: 'Classic Wooden',
        description: 'Realistic carved wood with grain and shine',
        colors: {
            white: {
                fill: '#f4e4c1',
                stroke: '#8b7355',
                accent: '#d4b896',
                glow: 'rgba(244, 228, 193, 0.6)',
            },
            black: {
                fill: '#5c4033',
                stroke: '#2d1f12',
                accent: '#8b7355',
                glow: 'rgba(92, 64, 51, 0.6)',
            },
        },
    },
    metallic: {
        id: 'metallic',
        name: 'Modern Metallic',
        description: 'Chrome and steel with reflections',
        colors: {
            white: {
                fill: '#e8e8e8',
                stroke: '#9ca3af',
                accent: '#f5f5f5',
                glow: 'rgba(232, 232, 232, 0.8)',
            },
            black: {
                fill: '#374151',
                stroke: '#1f2937',
                accent: '#6b7280',
                glow: 'rgba(55, 65, 81, 0.8)',
            },
        },
    },
    fantasy: {
        id: 'fantasy',
        name: 'Fantasy',
        description: 'Glowing runes and mythical designs',
        colors: {
            white: {
                fill: '#e0f2fe',
                stroke: '#0ea5e9',
                accent: '#38bdf8',
                glow: 'rgba(56, 189, 248, 0.8)',
            },
            black: {
                fill: '#4c1d95',
                stroke: '#7c3aed',
                accent: '#a855f7',
                glow: 'rgba(168, 85, 247, 0.8)',
            },
        },
    },
    minimalist: {
        id: 'minimalist',
        name: 'Minimalist',
        description: 'Clean flat design in neon colors',
        colors: {
            white: {
                fill: '#22d3ee',
                stroke: '#06b6d4',
                accent: '#67e8f9',
                glow: 'rgba(34, 211, 238, 0.7)',
            },
            black: {
                fill: '#f472b6',
                stroke: '#ec4899',
                accent: '#f9a8d4',
                glow: 'rgba(244, 114, 182, 0.7)',
            },
        },
    },
    vintage: {
        id: 'vintage',
        name: 'Vintage',
        description: 'Staunton-style antique with patina',
        colors: {
            white: {
                fill: '#fef3c7',
                stroke: '#92400e',
                accent: '#fbbf24',
                glow: 'rgba(254, 243, 199, 0.5)',
            },
            black: {
                fill: '#78350f',
                stroke: '#451a03',
                accent: '#a16207',
                glow: 'rgba(120, 53, 15, 0.5)',
            },
        },
    },
    cartoon: {
        id: 'cartoon',
        name: 'Fun & Cartoon',
        description: 'Playful exaggerated shapes for casual play',
        colors: {
            white: {
                fill: '#fef08a',
                stroke: '#facc15',
                accent: '#fde047',
                glow: 'rgba(254, 240, 138, 0.8)',
            },
            black: {
                fill: '#4ade80',
                stroke: '#22c55e',
                accent: '#86efac',
                glow: 'rgba(74, 222, 128, 0.8)',
            },
        },
    },
};

export const SKIN_LIST = Object.values(SKINS);
export const DEFAULT_SKIN: SkinId = 'classic';
