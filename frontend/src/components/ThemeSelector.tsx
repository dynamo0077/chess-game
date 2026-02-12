'use client';

import React from 'react';
import { useTheme } from '@/lib/useTheme';
import { ThemeId } from '@/lib/themes';
import styles from './ThemeSelector.module.css';

interface ThemeSelectorProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
    isOpen,
    onClose,
}) => {
    const { themeId, setTheme, availableThemes } = useTheme();

    if (!isOpen) return null;

    const handleThemeSelect = (id: ThemeId) => {
        setTheme(id);
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2>Board Theme</h2>
                    <button className={styles.closeButton} onClick={onClose} aria-label="Close">
                        ✕
                    </button>
                </div>

                <div className={styles.themeGrid}>
                    {availableThemes.map((theme) => (
                        <button
                            key={theme.id}
                            className={`${styles.themeCard} ${themeId === theme.id ? styles.selected : ''}`}
                            onClick={() => handleThemeSelect(theme.id)}
                        >
                            <div className={styles.colorPreview}>
                                <div
                                    className={styles.lightSquare}
                                    style={{ backgroundColor: theme.colors.light }}
                                />
                                <div
                                    className={styles.darkSquare}
                                    style={{ backgroundColor: theme.colors.dark }}
                                />
                            </div>
                            <div className={styles.themeInfo}>
                                <h3>{theme.name}</h3>
                                <p>{theme.description}</p>
                            </div>
                            {themeId === theme.id && (
                                <div className={styles.checkmark}>✓</div>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ThemeSelector;
