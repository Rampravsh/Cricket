import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '~/hooks/useTheme';

/**
 * ScoreButton — Cricket scoring button with neon glow effects
 * Used in the live scoring grid for every possible delivery outcome.
 *
 * @param {string|number} score    - The value to display (0,1,2,3,4,6,'W','WD','NB','LB','B')
 * @param {string}        label    - Optional override label
 * @param {function}      onPress  - Called with `score` value on press
 * @param {boolean}       isActive - Highlighted/selected state
 * @param {boolean}       disabled
 * @param {object}        style    - Additional container overrides
 */
function ScoreButton({ score, label, onPress, isActive = false, disabled = false, style }) {
  const { colors, borderRadius, spacing, isDark } = useTheme();
  const styles = createStyles(colors, borderRadius, spacing, isDark);

  const scaleValue = useRef(new Animated.Value(1)).current;

  const buttonStyle = getButtonStyle(score, isActive, styles);
  const textStyle = getTextStyle(score, isActive, styles);

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.92,
      useNativeDriver: true,
      speed: 50,
      bounciness: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      bounciness: 12,
    }).start();
  };

  const handlePress = () => {
    if (disabled) return;

    // Haptic feedback only (sound removed for now)
    if (score === 'W') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else if (score === 4) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (score === 6) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (onPress) onPress(score);
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleValue }] }]} >
      <TouchableOpacity
        style={[styles.base, buttonStyle, isActive && styles.active, disabled && styles.disabled, style]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text style={[styles.text, textStyle]}>{label ?? String(score)}</Text>
        {isActive && <View style={[styles.activeDot, { backgroundColor: textStyle.color }]} />}
      </TouchableOpacity>
    </Animated.View>
  );
}

function getButtonStyle(score, isActive, styles) {
  if (isActive) return styles.active;
  switch (score) {
    case 4:    return styles.variantFour;
    case 6:    return styles.variantSix;
    case 'W':  return styles.variantWicket;
    case 'WD': return styles.variantExtra;
    case 'NB': return styles.variantExtra;
    case 'LB': return styles.variantExtra;
    case 'B':  return styles.variantExtra;
    default:   return styles.variantDefault;
  }
}

function getTextStyle(score, isActive, styles) {
  if (isActive) return styles.textActive;
  switch (score) {
    case 4:    return styles.textFour;
    case 6:    return styles.textSix;
    case 'W':  return styles.textWicket;
    case 'WD':
    case 'NB':
    case 'LB':
    case 'B':  return styles.textExtra;
    default:   return styles.textDefault;
  }
}

function createStyles(colors, borderRadius, spacing, isDark) {
  return StyleSheet.create({
    base: {
      width: 68,
      height: 68,
      borderRadius: borderRadius.xl,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: 'transparent',
      margin: spacing[1],
      position: 'relative',
    },

    // ── Variants — Neon Glow ──────────────────────────────────────────────────
    variantDefault: {
      backgroundColor: colors.scoreDefault,
      borderColor: colors.glassBorder,
    },
    variantFour: {
      backgroundColor: colors.scoreFour,
      borderColor: isDark ? 'rgba(57, 255, 20, 0.35)' : 'rgba(46, 204, 64, 0.30)',
      shadowColor: isDark ? '#39FF14' : '#2ECC40',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 10,
      elevation: 4,
    },
    variantSix: {
      backgroundColor: colors.scoreSix,
      borderColor: isDark ? 'rgba(255, 214, 0, 0.35)' : 'rgba(255, 193, 7, 0.30)',
      shadowColor: isDark ? '#FFD600' : '#FFC107',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 10,
      elevation: 4,
    },
    variantWicket: {
      backgroundColor: colors.scoreWicket,
      borderColor: isDark ? 'rgba(255, 59, 92, 0.40)' : 'rgba(229, 57, 80, 0.30)',
      shadowColor: isDark ? '#FF3B5C' : '#E53950',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: isDark ? 0.35 : 0.15,
      shadowRadius: 10,
      elevation: 4,
    },
    variantExtra: {
      backgroundColor: colors.scoreExtra,
      borderColor: colors.glassBorder,
    },
    active: {
      backgroundColor: colors.primary,
      borderColor: colors.primaryDark,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 12,
      elevation: 6,
    },
    disabled: {
      opacity: 0.4,
    },

    // ── Text ──────────────────────────────────────────────────────────────────
    text: {
      fontSize: 18,
      fontWeight: '800',
    },
    textDefault: {
      color: colors.scoreDefaultText,
    },
    textFour: {
      color: colors.scoreFourText,
    },
    textSix: {
      color: colors.scoreSixText,
    },
    textWicket: {
      color: colors.scoreWicketText,
    },
    textExtra: {
      color: colors.scoreExtraText,
    },
    textActive: {
      color: colors.textOnPrimary,
    },

    // ── Active indicator dot ──────────────────────────────────────────────────
    activeDot: {
      position: 'absolute',
      bottom: 6,
      width: 4,
      height: 4,
      borderRadius: 2,
    },
  });
}

export default ScoreButton;
