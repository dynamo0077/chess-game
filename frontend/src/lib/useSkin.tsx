'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SkinId, DEFAULT_SKIN, SKIN_LIST, SKINS } from './skins';

const STORAGE_KEY_WHITE = 'chess-skin-white';
const STORAGE_KEY_BLACK = 'chess-skin-black';

interface SkinContextType {
    whiteSkin: SkinId;
    blackSkin: SkinId;
    setWhiteSkin: (skin: SkinId) => void;
    setBlackSkin: (skin: SkinId) => void;
    availableSkins: typeof SKIN_LIST;
    getSkinById: (id: SkinId) => typeof SKINS[SkinId];
}

const SkinContext = createContext<SkinContextType | undefined>(undefined);

export function SkinProvider({ children }: { children: ReactNode }) {
    const [whiteSkin, setWhiteSkinState] = useState<SkinId>(DEFAULT_SKIN);
    const [blackSkin, setBlackSkinState] = useState<SkinId>(DEFAULT_SKIN);
    const [isHydrated, setIsHydrated] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        const savedWhite = localStorage.getItem(STORAGE_KEY_WHITE) as SkinId | null;
        const savedBlack = localStorage.getItem(STORAGE_KEY_BLACK) as SkinId | null;

        if (savedWhite && SKINS[savedWhite]) {
            setWhiteSkinState(savedWhite);
        }
        if (savedBlack && SKINS[savedBlack]) {
            setBlackSkinState(savedBlack);
        }
        setIsHydrated(true);
    }, []);

    const setWhiteSkin = (skin: SkinId) => {
        setWhiteSkinState(skin);
        localStorage.setItem(STORAGE_KEY_WHITE, skin);
    };

    const setBlackSkin = (skin: SkinId) => {
        setBlackSkinState(skin);
        localStorage.setItem(STORAGE_KEY_BLACK, skin);
    };

    const getSkinById = (id: SkinId) => SKINS[id];

    // Prevent hydration mismatch by not rendering until client-side
    if (!isHydrated) {
        return <>{children}</>;
    }

    return (
        <SkinContext.Provider
            value={{
                whiteSkin,
                blackSkin,
                setWhiteSkin,
                setBlackSkin,
                availableSkins: SKIN_LIST,
                getSkinById,
            }}
        >
            {children}
        </SkinContext.Provider>
    );
}

export function useSkin() {
    const context = useContext(SkinContext);
    if (context === undefined) {
        throw new Error('useSkin must be used within a SkinProvider');
    }
    return context;
}
