'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeId, DEFAULT_THEME, THEME_LIST, THEMES } from './themes';

const STORAGE_KEY = 'chess-board-theme';

interface ThemeContextType {
    themeId: ThemeId;
    theme: typeof THEMES[ThemeId];
    setTheme: (themeId: ThemeId) => void;
    availableThemes: typeof THEME_LIST;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [themeId, setThemeIdState] = useState<ThemeId>(DEFAULT_THEME);
    const [isHydrated, setIsHydrated] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        const savedTheme = localStorage.getItem(STORAGE_KEY) as ThemeId | null;

        if (savedTheme && THEMES[savedTheme]) {
            setThemeIdState(savedTheme);
        }
        setIsHydrated(true);
    }, []);

    const setTheme = (id: ThemeId) => {
        setThemeIdState(id);
        localStorage.setItem(STORAGE_KEY, id);
    };

    // Prevent hydration mismatch by not rendering until client-side
    if (!isHydrated) {
        return <>{children}</>;
    }

    return (
        <ThemeContext.Provider
            value={{
                themeId,
                theme: THEMES[themeId],
                setTheme,
                availableThemes: THEME_LIST,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);

    // During SSR/build time, return default values instead of throwing
    if (context === undefined) {
        return {
            themeId: DEFAULT_THEME,
            theme: THEMES[DEFAULT_THEME],
            setTheme: () => { },
            availableThemes: THEME_LIST,
        };
    }

    return context;
}
