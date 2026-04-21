import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '~/hooks/useTheme';

/**
 * Input — Themed text input with label, error, and password toggle
 *
 * @param {string}   label            - Input label
 * @param {string}   value            - Controlled value
 * @param {function} onChangeText     - Change handler
 * @param {string}   placeholder      - Placeholder text
 * @param {string}   error            - Error message (shows red border + message)
 * @param {string}   hint             - Helper hint below input
 * @param {boolean}  secureTextEntry  - Password field (shows eye toggle)
 * @param {boolean}  disabled
 * @param {object}   style            - Additional wrapper overrides
 * @param {object}   inputStyle       - Additional TextInput overrides
 * @param {React.ReactNode} leftIcon  - Icon rendered inside input on the left
 * @param {React.ReactNode} rightIcon - Icon rendered inside input on the right (overridden by password toggle)
 */
function Input({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  hint,
  secureTextEntry = false,
  disabled = false,
  style,
  inputStyle,
  leftIcon,
  rightIcon,
  ...rest
}) {
  const { colors, spacing, borderRadius } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  const styles = createStyles(colors, spacing, borderRadius);

  return (
    <View style={[styles.wrapper, style]}>
      {/* Label */}
      {label ? (
        <Text style={[styles.label, error && styles.labelError]}>{label}</Text>
      ) : null}

      {/* Input row */}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          error && styles.inputError,
          disabled && styles.inputDisabled,
        ]}
      >
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}

        <TextInput
          style={[styles.textInput, inputStyle]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textDisabled}
          secureTextEntry={isSecure}
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...rest}
        />

        {/* Password toggle */}
        {secureTextEntry ? (
          <TouchableOpacity
            style={styles.iconRight}
            onPress={() => setIsSecure((v) => !v)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.eyeIcon}>{isSecure ? '👁️' : '🙈'}</Text>
          </TouchableOpacity>
        ) : rightIcon ? (
          <View style={styles.iconRight}>{rightIcon}</View>
        ) : null}
      </View>

      {/* Error message */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Hint */}
      {!error && hint ? <Text style={styles.hintText}>{hint}</Text> : null}
    </View>
  );
}

function createStyles(colors, spacing, borderRadius) {
  return StyleSheet.create({
    wrapper: {
      marginBottom: spacing[4],
    },

    // ── Label ─────────────────────────────────────────────────────────────────
    label: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: spacing[1],
      letterSpacing: 0.3,
    },
    labelError: {
      color: colors.danger,
    },

    // ── Input container ───────────────────────────────────────────────────────
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surfaceVariant,
      borderRadius: borderRadius.lg,
      borderWidth: 1.5,
      borderColor: colors.border,
      minHeight: 52,
      paddingHorizontal: spacing[3],
    },
    inputFocused: {
      borderColor: colors.primary,
      backgroundColor: colors.surface,
    },
    inputError: {
      borderColor: colors.danger,
    },
    inputDisabled: {
      opacity: 0.5,
    },

    // ── TextInput itself ──────────────────────────────────────────────────────
    textInput: {
      flex: 1,
      fontSize: 15,
      color: colors.textPrimary,
      paddingVertical: spacing[3],
    },

    // ── Icons ─────────────────────────────────────────────────────────────────
    iconLeft: {
      marginRight: spacing[2],
    },
    iconRight: {
      marginLeft: spacing[2],
    },
    eyeIcon: {
      fontSize: 16,
    },

    // ── Messages ──────────────────────────────────────────────────────────────
    errorText: {
      fontSize: 12,
      color: colors.danger,
      marginTop: spacing[1],
      marginLeft: spacing[1],
    },
    hintText: {
      fontSize: 12,
      color: colors.textDisabled,
      marginTop: spacing[1],
      marginLeft: spacing[1],
    },
  });
}

export default Input;
