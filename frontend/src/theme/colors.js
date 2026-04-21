/**
 * Color palette for the Cricket app
 * Light and Dark mode definitions
 */

const palette = {
  // Brand colors
  emerald: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },
  // Accent — amber for scores & highlights
  amber: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  // Danger — red for wickets
  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },
  // Neutrals
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
};

export const lightColors = {
  // Backgrounds
  background: palette.slate[50],
  surface: palette.white,
  surfaceVariant: palette.slate[100],
  card: palette.white,

  // Brand
  primary: palette.emerald[600],
  primaryLight: palette.emerald[400],
  primaryDark: palette.emerald[700],
  primaryContainer: palette.emerald[50],

  // Accent
  accent: palette.amber[500],
  accentLight: palette.amber[300],
  accentDark: palette.amber[700],
  accentContainer: palette.amber[50],

  // Danger (Wicket)
  danger: palette.red[600],
  dangerLight: palette.red[400],
  dangerContainer: palette.red[50],

  // Text
  textPrimary: palette.slate[900],
  textSecondary: palette.slate[600],
  textDisabled: palette.slate[400],
  textOnPrimary: palette.white,
  textOnDanger: palette.white,
  textOnAccent: palette.white,

  // Borders & Dividers
  border: palette.slate[200],
  divider: palette.slate[100],

  // Score buttons
  scoreDefault: palette.slate[100],
  scoreDefaultText: palette.slate[800],
  scoreFour: palette.emerald[100],
  scoreFourText: palette.emerald[700],
  scoreSix: palette.amber[100],
  scoreSixText: palette.amber[700],
  scoreWicket: palette.red[100],
  scoreWicketText: palette.red[700],
  scoreExtra: palette.slate[200],
  scoreExtraText: palette.slate[600],

  // Status bar
  statusBar: 'dark',

  // Shadow
  shadowColor: palette.slate[900],
};

export const darkColors = {
  // Backgrounds
  background: palette.slate[950],
  surface: palette.slate[900],
  surfaceVariant: palette.slate[800],
  card: palette.slate[800],

  // Brand
  primary: palette.emerald[400],
  primaryLight: palette.emerald[300],
  primaryDark: palette.emerald[500],
  primaryContainer: palette.emerald[900],

  // Accent
  accent: palette.amber[400],
  accentLight: palette.amber[300],
  accentDark: palette.amber[500],
  accentContainer: palette.amber[900],

  // Danger (Wicket)
  danger: palette.red[400],
  dangerLight: palette.red[300],
  dangerContainer: palette.red[700],

  // Text
  textPrimary: palette.slate[50],
  textSecondary: palette.slate[400],
  textDisabled: palette.slate[600],
  textOnPrimary: palette.slate[900],
  textOnDanger: palette.white,
  textOnAccent: palette.slate[900],

  // Borders & Dividers
  border: palette.slate[700],
  divider: palette.slate[800],

  // Score buttons
  scoreDefault: palette.slate[700],
  scoreDefaultText: palette.slate[100],
  scoreFour: palette.emerald[800],
  scoreFourText: palette.emerald[300],
  scoreSix: palette.amber[800],
  scoreSixText: palette.amber[300],
  scoreWicket: palette.red[700],
  scoreWicketText: palette.red[200],
  scoreExtra: palette.slate[600],
  scoreExtraText: palette.slate[300],

  // Status bar
  statusBar: 'light',

  // Shadow
  shadowColor: palette.black,
};
