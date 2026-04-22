import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '~/hooks/useTheme';

/**
 * Header — Glassmorphic screen-level header bar
 *
 * @param {string}         title          - Header title
 * @param {boolean}        showBack       - Show back button (chevron ‹)
 * @param {function}       onBack         - Called when back button is pressed
 * @param {React.ReactNode} rightComponent - Element rendered on the right side
 * @param {boolean}        transparent    - Transparent background (for overlays)
 * @param {object}         style          - Additional container overrides
 */
function Header({
  title,
  showBack = false,
  onBack,
  rightComponent,
  transparent = false,
  style,
}) {
  const { colors, spacing, borderRadius, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colors, spacing, borderRadius, insets, transparent, isDark);

  return (
    <View style={[styles.container, style]}>
      {/* Left — Back button */}
      <View style={styles.side}>
        {showBack && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Center — Title */}
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      {/* Right — Custom component */}
      <View style={[styles.side, styles.sideRight]}>
        {rightComponent || null}
      </View>
    </View>
  );
}

function createStyles(colors, spacing, borderRadius, insets, transparent, isDark) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: insets.top + spacing[2],
      paddingBottom: spacing[3],
      paddingHorizontal: spacing[4],
      backgroundColor: transparent ? 'transparent' : colors.glassBg,
      borderBottomWidth: transparent ? 0 : 1,
      borderBottomColor: colors.glassBorder,
      ...Platform.select({
        ios: {
          shadowColor: isDark ? colors.primary : colors.shadowColor,
          shadowOffset: { width: 0, height: isDark ? 0 : 1 },
          shadowOpacity: isDark ? 0.08 : 0.06,
          shadowRadius: isDark ? 12 : 4,
        },
        android: {
          elevation: transparent ? 0 : 3,
        },
      }),
    },
    side: {
      width: 48,
      alignItems: 'flex-start',
      justifyContent: 'center',
    },
    sideRight: {
      alignItems: 'flex-end',
    },
    backButton: {
      width: 36,
      height: 36,
      borderRadius: borderRadius.md,
      backgroundColor: colors.glassBg,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },
    backIcon: {
      fontSize: 28,
      lineHeight: 32,
      color: colors.primary,
      fontWeight: '400',
      marginTop: -2,
    },
    title: {
      flex: 1,
      textAlign: 'center',
      fontSize: 17,
      fontWeight: '700',
      color: colors.textPrimary,
      letterSpacing: 0.3,
    },
  });
}

export default Header;
