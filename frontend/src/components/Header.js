import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '~/hooks/useTheme';

/**
 * Header — Screen-level header bar
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
  const { colors, spacing, borderRadius } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colors, spacing, borderRadius, insets, transparent);

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

function createStyles(colors, spacing, borderRadius, insets, transparent) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: insets.top + spacing[2],
      paddingBottom: spacing[3],
      paddingHorizontal: spacing[4],
      backgroundColor: transparent ? 'transparent' : colors.surface,
      borderBottomWidth: transparent ? 0 : StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadowColor,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
        },
        android: {
          elevation: transparent ? 0 : 2,
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
      backgroundColor: colors.surfaceVariant,
      alignItems: 'center',
      justifyContent: 'center',
    },
    backIcon: {
      fontSize: 28,
      lineHeight: 32,
      color: colors.textPrimary,
      fontWeight: '400',
      marginTop: -2,
    },
    title: {
      flex: 1,
      textAlign: 'center',
      fontSize: 17,
      fontWeight: '600',
      color: colors.textPrimary,
      letterSpacing: 0.2,
    },
  });
}

export default Header;
