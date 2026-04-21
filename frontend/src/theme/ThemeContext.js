import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors } from './colors';
import spacing, { borderRadius } from './spacing';
import { fontSizes, fontWeights, lineHeights, letterSpacing, textStyles } from './typography';

// ─── Context ──────────────────────────────────────────────────────────────────
const ThemeContext = createContext(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function ThemeProvider({ children }) {
  const systemColorScheme = useColorScheme(); // 'light' | 'dark' | null
  const isDark = systemColorScheme === 'dark';

  const theme = useMemo(
    () => ({
      isDark,
      colorScheme: isDark ? 'dark' : 'light',
      colors: isDark ? darkColors : lightColors,
      spacing,
      borderRadius,
      fontSizes,
      fontWeights,
      lineHeights,
      letterSpacing,
      textStyles,
    }),
    [isDark]
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
