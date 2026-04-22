/**
 * Color palette for the Cricket app
 * Neon Glassy aesthetic — Gen-Z inspired
 * Light and Dark mode definitions
 */

const palette = {
  // ── Neon Core ──────────────────────────────────────────────────────────────
  neonCyan:    '#00F0FF',
  neonCyanDim: '#00B4D8',
  neonCyanGlow: 'rgba(0, 240, 255, 0.35)',

  violet:      '#BF5AF2',
  violetDim:   '#7B2FF0',
  violetGlow:  'rgba(191, 90, 242, 0.3)',

  magenta:     '#FF2D78',
  magentaDim:  '#E8156D',
  magentaGlow: 'rgba(255, 45, 120, 0.3)',

  neonGreen:   '#39FF14',
  neonGreenDim: '#2ECC40',
  neonGreenGlow: 'rgba(57, 255, 20, 0.3)',

  neonGold:    '#FFD600',
  neonGoldDim: '#FFC107',
  neonGoldGlow: 'rgba(255, 214, 0, 0.35)',

  neonRed:     '#FF3B5C',
  neonRedDim:  '#E53950',
  neonRedGlow: 'rgba(255, 59, 92, 0.35)',

  // ── Deep Space Darks ───────────────────────────────────────────────────────
  space: {
    950: '#050714',
    900: '#0A0E1A',
    850: '#0E1225',
    800: '#131830',
    700: '#1A2040',
    600: '#232B52',
    500: '#2E3768',
    400: '#4A5280',
    300: '#6B7199',
    200: '#9498B3',
    100: '#C0C3D4',
    50:  '#E8E9F0',
  },

  // ── Light Mode Tints ───────────────────────────────────────────────────────
  frost: {
    50:  '#F5F7FF',
    100: '#EDF0FB',
    200: '#DDE2F5',
    300: '#C8CFE8',
    400: '#A0AAC8',
    500: '#7882A0',
    600: '#5A6280',
    700: '#3E4560',
    800: '#252A40',
    900: '#151828',
  },

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export const lightColors = {
  // ── Backgrounds ──────────────────────────────────────────────────────────
  background:      palette.frost[50],
  surface:         palette.white,
  surfaceVariant:  palette.frost[100],
  card:            'rgba(255, 255, 255, 0.88)',

  // ── Glass ────────────────────────────────────────────────────────────────
  glassBg:         'rgba(255, 255, 255, 0.72)',
  glassBorder:     'rgba(0, 180, 216, 0.18)',
  neonGlow:        palette.neonCyanGlow,

  // ── Gradients ────────────────────────────────────────────────────────────
  gradientStart:   '#00B4D8',
  gradientMid:     '#7B2FF0',
  gradientEnd:     '#FF2D78',

  // ── Brand ────────────────────────────────────────────────────────────────
  primary:          palette.neonCyanDim,
  primaryLight:     '#4DD9E8',
  primaryDark:      '#0090A8',
  primaryContainer: 'rgba(0, 180, 216, 0.10)',

  // ── Accent ───────────────────────────────────────────────────────────────
  accent:           palette.violetDim,
  accentLight:      '#A855F7',
  accentDark:       '#5B21B6',
  accentContainer:  'rgba(123, 47, 240, 0.08)',

  // ── Danger (Wicket) ──────────────────────────────────────────────────────
  danger:           '#E53950',
  dangerLight:      '#FF6B7F',
  dangerContainer:  'rgba(229, 57, 80, 0.08)',

  // ── Text ─────────────────────────────────────────────────────────────────
  textPrimary:    palette.frost[900],
  textSecondary:  palette.frost[600],
  textDisabled:   palette.frost[400],
  textOnPrimary:  palette.white,
  textOnDanger:   palette.white,
  textOnAccent:   palette.white,

  // ── Borders & Dividers ───────────────────────────────────────────────────
  border:  palette.frost[200],
  divider: palette.frost[100],

  // ── Score Buttons ────────────────────────────────────────────────────────
  scoreDefault:     palette.frost[100],
  scoreDefaultText: palette.frost[800],
  scoreFour:        'rgba(46, 204, 64, 0.12)',
  scoreFourText:    palette.neonGreenDim,
  scoreSix:         'rgba(255, 193, 7, 0.12)',
  scoreSixText:     '#D4A300',
  scoreWicket:      'rgba(229, 57, 80, 0.10)',
  scoreWicketText:  '#E53950',
  scoreExtra:       palette.frost[100],
  scoreExtraText:   palette.frost[600],

  // ── Status bar ───────────────────────────────────────────────────────────
  statusBar: 'dark',

  // ── Shadow ───────────────────────────────────────────────────────────────
  shadowColor: palette.frost[900],

  // ── Tab Bar ──────────────────────────────────────────────────────────────
  tabBarBg:        'rgba(255, 255, 255, 0.82)',
  tabBarBorder:    'rgba(0, 180, 216, 0.15)',
  centerBtnGradStart: '#00B4D8',
  centerBtnGradEnd:   '#7B2FF0',
};

export const darkColors = {
  // ── Backgrounds ──────────────────────────────────────────────────────────
  background:      palette.space[900],
  surface:         palette.space[850],
  surfaceVariant:  palette.space[800],
  card:            'rgba(14, 18, 37, 0.78)',

  // ── Glass ────────────────────────────────────────────────────────────────
  glassBg:         'rgba(14, 18, 37, 0.65)',
  glassBorder:     'rgba(0, 240, 255, 0.15)',
  neonGlow:        palette.neonCyanGlow,

  // ── Gradients ────────────────────────────────────────────────────────────
  gradientStart:   '#00F0FF',
  gradientMid:     '#BF5AF2',
  gradientEnd:     '#FF2D78',

  // ── Brand ────────────────────────────────────────────────────────────────
  primary:          palette.neonCyan,
  primaryLight:     '#66F5FF',
  primaryDark:      palette.neonCyanDim,
  primaryContainer: 'rgba(0, 240, 255, 0.10)',

  // ── Accent ───────────────────────────────────────────────────────────────
  accent:           palette.violet,
  accentLight:      '#D49AFF',
  accentDark:       palette.violetDim,
  accentContainer:  'rgba(191, 90, 242, 0.10)',

  // ── Danger (Wicket) ──────────────────────────────────────────────────────
  danger:           palette.neonRed,
  dangerLight:      '#FF6B7F',
  dangerContainer:  'rgba(255, 59, 92, 0.12)',

  // ── Text ─────────────────────────────────────────────────────────────────
  textPrimary:    palette.space[50],
  textSecondary:  palette.space[300],
  textDisabled:   palette.space[500],
  textOnPrimary:  palette.space[900],
  textOnDanger:   palette.white,
  textOnAccent:   palette.white,

  // ── Borders & Dividers ───────────────────────────────────────────────────
  border:  'rgba(0, 240, 255, 0.10)',
  divider: palette.space[800],

  // ── Score Buttons ────────────────────────────────────────────────────────
  scoreDefault:     'rgba(26, 32, 64, 0.80)',
  scoreDefaultText: palette.space[100],
  scoreFour:        'rgba(57, 255, 20, 0.12)',
  scoreFourText:    palette.neonGreen,
  scoreSix:         'rgba(255, 214, 0, 0.12)',
  scoreSixText:     palette.neonGold,
  scoreWicket:      'rgba(255, 59, 92, 0.12)',
  scoreWicketText:  palette.neonRed,
  scoreExtra:       'rgba(26, 32, 64, 0.60)',
  scoreExtraText:   palette.space[300],

  // ── Status bar ───────────────────────────────────────────────────────────
  statusBar: 'light',

  // ── Shadow ───────────────────────────────────────────────────────────────
  shadowColor: palette.black,

  // ── Tab Bar ──────────────────────────────────────────────────────────────
  tabBarBg:        'rgba(10, 14, 26, 0.80)',
  tabBarBorder:    'rgba(0, 240, 255, 0.12)',
  centerBtnGradStart: '#00F0FF',
  centerBtnGradEnd:   '#BF5AF2',
};
