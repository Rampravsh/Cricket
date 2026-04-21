import React from 'react';
import { View, Text, ScrollView, StyleSheet, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '~/hooks/useTheme';
import { SCREENS } from '~/constants';
import Button from '~/components/Button';
import Card from '~/components/Card';
import Header from '~/components/Header';

/**
 * HomeScreen — App entry screen
 * Shows quick-access cricket actions and app info cards
 */
function HomeScreen() {
  const { colors, spacing, borderRadius } = useTheme();
  const navigation = useNavigation();
  const styles = createStyles(colors, spacing, borderRadius);

  const handleGoToLiveMatch = () => {
    navigation.navigate(SCREENS.LIVE_MATCH);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <StatusBar
        barStyle={colors.statusBar === 'dark' ? 'dark-content' : 'light-content'}
        backgroundColor={colors.surface}
      />

      {/* Header */}
      <Header title="Cricket Live" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>🏏 LIVE</Text>
          </View>
          <Text style={styles.heroTitle}>Cricket{'\n'}Scoring</Text>
          <Text style={styles.heroSubtitle}>
            Real-time match scoring, live commentary, and stats — all in one place.
          </Text>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionRow}>
          <Button
            title="Start Live Match"
            onPress={handleGoToLiveMatch}
            variant="primary"
            size="lg"
            style={styles.primaryAction}
          />
          <Button
            title="View Scorecard"
            onPress={() => {}}
            variant="secondary"
            size="lg"
            style={styles.secondaryAction}
          />
        </View>

        {/* Stats Cards */}
        <Text style={styles.sectionTitle}>Today's Matches</Text>
        <MatchQuickCard
          teamA="India"
          teamB="Australia"
          status="LIVE"
          score="IND 187/4 (18.2 Ov)"
          onPress={handleGoToLiveMatch}
          colors={colors}
          spacing={spacing}
          borderRadius={borderRadius}
        />
        <MatchQuickCard
          teamA="England"
          teamB="New Zealand"
          status="UPCOMING"
          score="Starts at 7:30 PM"
          onPress={() => {}}
          colors={colors}
          spacing={spacing}
          borderRadius={borderRadius}
        />

        {/* Component Showcase */}
        <Text style={styles.sectionTitle}>Components</Text>
        <Card style={styles.showcaseCard}>
          <Text style={styles.showcaseTitle}>Button Variants</Text>
          <View style={styles.buttonRow}>
            <Button title="Primary" onPress={() => {}} variant="primary" size="sm" style={styles.buttonItem} />
            <Button title="Secondary" onPress={() => {}} variant="secondary" size="sm" style={styles.buttonItem} />
            <Button title="Danger" onPress={() => {}} variant="danger" size="sm" style={styles.buttonItem} />
          </View>
        </Card>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Inline sub-component ───────────────────────────────────────────────────────
function MatchQuickCard({ teamA, teamB, status, score, onPress, colors, spacing, borderRadius }) {
  const isLive = status === 'LIVE';
  const cardStyles = StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.xl,
      padding: spacing[4],
      marginBottom: spacing[3],
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    teams: {
      flex: 1,
    },
    matchTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    matchScore: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    badge: {
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[1],
      borderRadius: borderRadius.full,
      backgroundColor: isLive ? colors.dangerContainer : colors.primaryContainer,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: '700',
      color: isLive ? colors.danger : colors.primary,
      letterSpacing: 0.5,
    },
  });

  return (
    <TouchableOpacity style={cardStyles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={cardStyles.teams}>
        <Text style={cardStyles.matchTitle}>{teamA} vs {teamB}</Text>
        <Text style={cardStyles.matchScore}>{score}</Text>
      </View>
      <View style={cardStyles.badge}>
        <Text style={cardStyles.badgeText}>{status}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
function createStyles(colors, spacing, borderRadius) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: spacing[4],
      paddingTop: spacing[6],
    },

    // ── Hero ──────────────────────────────────────────────────────────────────
    hero: {
      marginBottom: spacing[8],
    },
    heroBadge: {
      alignSelf: 'flex-start',
      backgroundColor: colors.dangerContainer,
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[1],
      borderRadius: borderRadius.full,
      marginBottom: spacing[3],
    },
    heroBadgeText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.danger,
      letterSpacing: 1,
    },
    heroTitle: {
      fontSize: 40,
      fontWeight: '800',
      color: colors.textPrimary,
      lineHeight: 44,
      marginBottom: spacing[3],
      letterSpacing: -0.5,
    },
    heroSubtitle: {
      fontSize: 15,
      color: colors.textSecondary,
      lineHeight: 22,
    },

    // ── Sections ──────────────────────────────────────────────────────────────
    sectionTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textSecondary,
      letterSpacing: 1,
      textTransform: 'uppercase',
      marginBottom: spacing[3],
      marginTop: spacing[2],
    },

    // ── Actions ───────────────────────────────────────────────────────────────
    actionRow: {
      flexDirection: 'column',
      gap: spacing[3],
      marginBottom: spacing[6],
    },
    primaryAction: {
      width: '100%',
    },
    secondaryAction: {
      width: '100%',
    },

    // ── Showcase ──────────────────────────────────────────────────────────────
    showcaseCard: {
      marginBottom: spacing[6],
    },
    showcaseTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: spacing[3],
    },
    buttonRow: {
      flexDirection: 'row',
      gap: spacing[2],
    },
    buttonItem: {
      flex: 1,
    },

    bottomSpacer: {
      height: spacing[8],
    },
  });
}

export default HomeScreen;
