import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react';
import { Appearance } from 'react-native';
import { lightColors, darkColors } from './colors';
import spacing, { borderRadius } from './spacing';
import { fontSizes, fontWeights, lineHeights, letterSpacing, textStyles } from './typography';

// ─── Context ──────────────────────────────────────────────────────────────────
const ThemeContext = createContext(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function ThemeProvider({ children }) {
  // Use Appearance API directly for better support across platforms
  const [systemTheme, setSystemTheme] = useState(() => {
    const scheme = Appearance.getColorScheme();
    return scheme || 'light';
  });

  const [themeOverride, setThemeOverride] = useState(null);

  useEffect(() => {
    // Listen for system theme changes
    const subscription = Appearance.addChangeListener(({ colorScheme: newScheme }) => {
      if (newScheme) {
        setSystemTheme(newScheme);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const activeTheme = themeOverride || systemTheme;
  const isDark = activeTheme === 'dark';

  const toggleTheme = useCallback(() => {
    setThemeOverride((prev) => {
      const current = prev || systemTheme;
      return current === 'dark' ? 'light' : 'dark';
    });
  }, [systemTheme]);

  const theme = useMemo(
    () => ({
      isDark,
      colorScheme: activeTheme,
      colors: isDark ? darkColors : lightColors,
      spacing,
      borderRadius,
      fontSizes,
      fontWeights,
      lineHeights,
      letterSpacing,
      textStyles,
      toggleTheme,
    }),
    [isDark, activeTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useTheme() {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error('useTheme must be used inside <ThemeProvider>');
  }
  return theme;
}

export default ThemeContext;
