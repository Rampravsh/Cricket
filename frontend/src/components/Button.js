import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import { useTheme } from '~/hooks/useTheme';

/**
 * Button — Multi-variant reusable button component
 *
 * @param {string}   title       - Button label text
 * @param {function} onPress     - Press handler
 * @param {'primary'|'secondary'|'danger'|'ghost'} variant
 * @param {'sm'|'md'|'lg'}  size
 * @param {boolean}  disabled    - Disabled state
 * @param {boolean}  loading     - Shows ActivityIndicator when true
 * @param {object}   style       - Additional container style overrides
 * @param {object}   textStyle   - Additional text style overrides
 * @param {React.ReactNode} leftIcon  - Icon element to show left of title
 * @param {React.ReactNode} rightIcon - Icon element to show right of title
 */
function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
}) {
  const { colors, borderRadius, spacing } = useTheme();

  const styles = createStyles(colors, borderRadius, spacing);

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[`size_${size}`],
        styles[`variant_${variant}`],
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={getSpinnerColor(variant, colors)}
        />
      ) : (
        <View style={styles.content}>
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          <Text
            style={[
              styles.text,
              styles[`text_${size}`],
              styles[`text_${variant}`],
              isDisabled && styles.textDisabled,
              textStyle,
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
}

function getSpinnerColor(variant, colors) {
  switch (variant) {
    case 'primary':  return colors.textOnPrimary;
    case 'danger':   return colors.textOnDanger;
    case 'secondary': return colors.primary;
    case 'ghost':    return colors.primary;
    default:         return colors.textOnPrimary;
  }
}

function createStyles(colors, borderRadius, spacing) {
  return StyleSheet.create({
    // ── Base ──────────────────────────────────────────────────────────────────
    base: {
      borderRadius: borderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      borderWidth: 1.5,
      borderColor: 'transparent',
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconLeft: {
      marginRight: spacing[2],
    },
    iconRight: {
      marginLeft: spacing[2],
    },

    // ── Sizes ─────────────────────────────────────────────────────────────────
    size_sm: {
      paddingVertical: spacing[2],
      paddingHorizontal: spacing[4],
      minHeight: 36,
    },
    size_md: {
      paddingVertical: spacing[3],
      paddingHorizontal: spacing[6],
      minHeight: 48,
    },
    size_lg: {
      paddingVertical: spacing[4],
      paddingHorizontal: spacing[8],
      minHeight: 56,
    },

    // ── Variants ──────────────────────────────────────────────────────────────
    variant_primary: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    variant_secondary: {
      backgroundColor: colors.surface,
      borderColor: colors.primary,
    },
    variant_danger: {
      backgroundColor: colors.danger,
      borderColor: colors.danger,
    },
    variant_ghost: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
    },

    // ── Disabled ──────────────────────────────────────────────────────────────
    disabled: {
      opacity: 0.45,
    },

    // ── Text base ─────────────────────────────────────────────────────────────
    text: {
      fontWeight: '600',
      letterSpacing: 0.3,
    },
    text_sm: {
      fontSize: 13,
    },
    text_md: {
      fontSize: 15,
    },
    text_lg: {
      fontSize: 17,
    },

    // ── Text variants ─────────────────────────────────────────────────────────
    text_primary: {
      color: colors.textOnPrimary,
    },
    text_secondary: {
      color: colors.primary,
    },
    text_danger: {
      color: colors.textOnDanger,
    },
    text_ghost: {
      color: colors.primary,
    },
    textDisabled: {
      opacity: 0.7,
    },
  });
}

export default Button;
