import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '~/hooks/useTheme';
import Header from '~/components/Header';
import Button from '~/components/Button';

function HistoryScreen() {
  const { colors, spacing, borderRadius, isDark } = useTheme();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const pulseAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.6, duration: 2000, useNativeDriver: true }),
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
      <Header title="Match History" />
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
          {/* Cricket illustration */}
          <Animated.View style={[styles.illustrationRing, { opacity: pulseAnim }]}>
            <View style={styles.illustrationInner}>
              <Text style={styles.illustrationEmoji}>🏏</Text>
            </View>
          </Animated.View>

          <Text style={styles.title}>No Matches Yet</Text>
          <Text style={styles.subtitle}>
            Your match history will show up here.{'\n'}Start scoring to build your cricket legacy!
          </Text>

          {/* Placeholder stat cards */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Played</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>—</Text>
              <Text style={styles.statLabel}>Won</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>—</Text>
              <Text style={styles.statLabel}>Best</Text>
            </View>
          </View>

          <Button
            title="⚡ Start First Match"
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

    // Illustration
    illustrationRing: {
      width: 120,
      height: 120,
      borderRadius: 60,
      borderWidth: 2,
      borderColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing[6],
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: isDark ? 0.35 : 0.1,
      shadowRadius: 20,
      elevation: 6,
    },
    illustrationInner: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: colors.glassBg,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },
    illustrationEmoji: {
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

    // Stats
    statsRow: {
      flexDirection: 'row',
      gap: spacing[3],
      marginBottom: spacing[6],
    },
    statCard: {
      width: 80,
      backgroundColor: colors.glassBg,
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      paddingVertical: spacing[3],
      alignItems: 'center',
    },
    statValue: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.primary,
    },
    statLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textSecondary,
      marginTop: 2,
      letterSpacing: 0.3,
    },

    ctaButton: {
      paddingHorizontal: spacing[10],
    },
  });
}

export default HistoryScreen;
