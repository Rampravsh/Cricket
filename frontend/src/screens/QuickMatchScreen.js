import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '~/hooks/useTheme';
import Header from '~/components/Header';
import Button from '~/components/Button';

function QuickMatchScreen() {
  const { colors, spacing, borderRadius, isDark } = useTheme();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const ringPulse = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(ringPulse, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(ringPulse, { toValue: 0.5, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const styles = createStyles(colors, spacing, borderRadius, isDark);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar
        barStyle={colors.statusBar === 'dark' ? 'dark-content' : 'light-content'}
        backgroundColor="transparent"
        translucent
      />
      <Header title="Quick Match" />
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Neon icon */}
          <Animated.View style={[styles.iconRing, { opacity: ringPulse }]} />
          <View style={styles.iconCircle}>
            <Text style={styles.iconEmoji}>⚡</Text>
          </View>

          <Text style={styles.title}>Quick Match Setup</Text>
          <Text style={styles.subtitle}>
            Set up a quick match in seconds.{'\n'}Choose teams, format & start scoring!
          </Text>

          {/* Match format options */}
          <View style={styles.formatRow}>
            {['T10', 'T20', 'ODI', 'TEST'].map((format) => (
              <View key={format} style={styles.formatCard}>
                <Text style={styles.formatText}>{format}</Text>
              </View>
            ))}
          </View>

          <Button
            title="🏏 Create Match"
            onPress={() => {}}
            variant="primary"
            size="lg"
            style={styles.ctaButton}
          />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

function createStyles(colors, spacing, borderRadius, isDark) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing[6],
    },
    content: {
      alignItems: 'center',
    },

    // Icon
    iconRing: {
      position: 'absolute',
      top: -4,
      width: 108,
      height: 108,
      borderRadius: 54,
      borderWidth: 2,
      borderColor: colors.accent,
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: isDark ? 0.4 : 0.1,
      shadowRadius: 20,
    },
    iconCircle: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.glassBg,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing[6],
    },
    iconEmoji: {
      fontSize: 44,
    },

    title: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.textPrimary,
      marginBottom: spacing[2],
      letterSpacing: -0.3,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: spacing[6],
      fontWeight: '500',
    },

    // Format options
    formatRow: {
      flexDirection: 'row',
      gap: spacing[2],
      marginBottom: spacing[6],
    },
    formatCard: {
      backgroundColor: colors.glassBg,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[2],
    },
    formatText: {
      fontSize: 13,
      fontWeight: '800',
      color: colors.primary,
      letterSpacing: 0.5,
    },

    ctaButton: {
      paddingHorizontal: spacing[10],
    },
  });
}

export default QuickMatchScreen;
