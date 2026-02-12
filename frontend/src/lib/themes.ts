// Board theme type definitions and configuration

export type ThemeId = 'classic' | 'ocean' | 'emerald' | 'nebula' | 'midnight';

export interface BoardTheme {
    id: ThemeId;
    name: string;
    description: string;
    colors: {
        light: string;
        dark: string;
    };
}

export const THEMES: Record<ThemeId, BoardTheme> = {
    classic: {
        id: 'classic',
        name: 'Classic',
        description: 'Traditional wood/brown tones',
        colors: {
            light: '#f0d9b5',
            dark: '#b58863',
        },
    },
    ocean: {
        id: 'ocean',
        name: 'Ocean',
        description: 'Blue tones matching space aesthetic',
        colors: {
            light: '#a8dadc',
            dark: '#457b9d',
        },
    },
    emerald: {
        id: 'emerald',
        name: 'Emerald',
        description: 'Green/white tournament style',
        colors: {
            light: '#eeeed2',
            dark: '#769656',
        },
    },
    nebula: {
        id: 'nebula',
        name: 'Nebula',
        description: 'Transparent glass effect with animated background',
        colors: {
            light: 'rgba(255, 255, 255, 0.15)',
            dark: 'rgba(0, 0, 0, 0.25)',
        },
    },
    midnight: {
        id: 'midnight',
        name: 'Midnight',
        description: 'High contrast dark gray and silver',
        colors: {
            light: '#b0b0b0',
            dark: '#1a1a1a',
        },
    },
};

export const THEME_LIST = Object.values(THEMES);
export const DEFAULT_THEME: ThemeId = 'classic';
