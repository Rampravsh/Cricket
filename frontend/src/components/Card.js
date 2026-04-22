import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useTheme } from '~/hooks/useTheme';

/**
 * Card — Glassmorphic themed container with neon glow
 *
 * @param {React.ReactNode} children  - Card content
 * @param {boolean}         elevated  - Add shadow/elevation (default: true)
 * @param {'sm'|'md'|'lg'}  padding   - Inner padding size
 * @param {object}          style     - Additional container overrides
 */
function Card({ children, elevated = true, padding = 'md', style }) {
  const { colors, spacing, borderRadius, isDark } = useTheme();
  const styles = createStyles(colors, spacing, borderRadius, isDark);

  return (
    <View
      style={[
        styles.base,
        styles[`padding_${padding}`],
        elevated && styles.elevated,
        style,
      ]}
    >
      {children}
    </View>
  );
}

function createStyles(colors, spacing, borderRadius, isDark) {
  return StyleSheet.create({
    base: {
      backgroundColor: colors.glassBg,
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      overflow: 'hidden',
    },

    // ── Padding variants ──────────────────────────────────────────────────────
    padding_sm: {
      padding: spacing[3],
    },
    padding_md: {
      padding: spacing[4],
    },
    padding_lg: {
      padding: spacing[6],
    },

    // ── Shadow — Neon glow ────────────────────────────────────────────────────
    elevated: {
      ...Platform.select({
        ios: {
          shadowColor: isDark ? colors.primary : colors.shadowColor,
          shadowOffset: { width: 0, height: isDark ? 0 : 2 },
          shadowOpacity: isDark ? 0.15 : 0.08,
          shadowRadius: isDark ? 16 : 8,
        },
        android: {
          elevation: isDark ? 6 : 4,
        },
      }),
    },
  });
}

export default Card;
