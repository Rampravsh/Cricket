import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useTheme } from '~/hooks/useTheme';

/**
 * Card — Themed container with optional elevation/shadow
 *
 * @param {React.ReactNode} children  - Card content
 * @param {boolean}         elevated  - Add shadow/elevation (default: true)
 * @param {'sm'|'md'|'lg'}  padding   - Inner padding size
 * @param {object}          style     - Additional container overrides
 */
function Card({ children, elevated = true, padding = 'md', style }) {
  const { colors, spacing, borderRadius } = useTheme();
  const styles = createStyles(colors, spacing, borderRadius);

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

function createStyles(colors, spacing, borderRadius) {
  return StyleSheet.create({
    base: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.xl,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
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

    // ── Shadow ────────────────────────────────────────────────────────────────
    elevated: {
      ...Platform.select({
        ios: {
          shadowColor: colors.shadowColor,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
        },
        android: {
          elevation: 4,
        },
      }),
    },
  });
}

export default Card;
