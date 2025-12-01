'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const ThemeContext = createContext(null);

const DEFAULT_APPEARANCE = {
  theme: 'dark',          // 'light' | 'dark' | 'auto'
  fontSize: 'medium',     // 'small' | 'medium' | 'large'
  colorScheme: 'quantum', // 'quantum' | 'nebula' | 'aurora'
};

function getSystemPrefersDark() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function ThemeProvider({ children }) {
  const [appearance, setAppearance] = useState(() => {
    if (typeof window === 'undefined') {
      return DEFAULT_APPEARANCE;
    }
    try {
      const stored = window.localStorage.getItem('hqcc_appearance');
      if (!stored) return DEFAULT_APPEARANCE;
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_APPEARANCE, ...parsed };
    } catch (e) {
      console.error('Failed to load appearance from storage:', e);
      return DEFAULT_APPEARANCE;
    }
  });

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;

    const mode = appearance.theme;
    const isDark =
      mode === 'dark' || (mode === 'auto' && getSystemPrefersDark());

    root.classList.toggle('dark', isDark);

    root.dataset.theme = mode; // "light" | "dark" | "auto"
    root.dataset.fontSize = appearance.fontSize;
    root.dataset.colorScheme = appearance.colorScheme;

    try {
      window.localStorage.setItem('hqcc_appearance', JSON.stringify(appearance));
    } catch (e) {
      console.error('Failed to save appearance to storage:', e);
    }
  }, [appearance]);

  // ✅ stable function identity
  const updateAppearance = useCallback((patch) => {
    setAppearance((prev) => ({
      ...prev,
      ...patch,
    }));
  }, []);

  return (
    <ThemeContext.Provider value={{ appearance, updateAppearance }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
