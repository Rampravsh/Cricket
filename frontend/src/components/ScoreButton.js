import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { playSound } from '~/utils/audio';
import { useTheme } from '~/hooks/useTheme';

/**
 * ScoreButton — Cricket scoring button
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
  const { colors, borderRadius, spacing } = useTheme();
  const styles = createStyles(colors, borderRadius, spacing);

  const scaleValue = useRef(new Animated.Value(1)).current;

  const buttonStyle = getButtonStyle(score, isActive, styles);
  const textStyle = getTextStyle(score, isActive, styles);

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
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

    // Haptic and Sound feedback
    if (score === 'W') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      playSound('wicket');
    } else if (score === 4) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      playSound('four');
    } else if (score === 6) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      playSound('six');
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

function createStyles(colors, borderRadius, spacing) {
  return StyleSheet.create({
    base: {
      width: 64,
      height: 64,
      borderRadius: borderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: 'transparent',
      margin: spacing[1],
      position: 'relative',
    },

    // ── Variants ──────────────────────────────────────────────────────────────
    variantDefault: {
      backgroundColor: colors.scoreDefault,
      borderColor: colors.border,
    },
    variantFour: {
      backgroundColor: colors.scoreFour,
      borderColor: colors.primary,
    },
    variantSix: {
      backgroundColor: colors.scoreSix,
      borderColor: colors.accent,
    },
    variantWicket: {
      backgroundColor: colors.scoreWicket,
      borderColor: colors.danger,
    },
    variantExtra: {
      backgroundColor: colors.scoreExtra,
      borderColor: colors.border,
    },
    active: {
      backgroundColor: colors.primary,
      borderColor: colors.primaryDark,
    },
    disabled: {
      opacity: 0.4,
    },

    // ── Text ──────────────────────────────────────────────────────────────────
    text: {
      fontSize: 18,
      fontWeight: '700',
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
