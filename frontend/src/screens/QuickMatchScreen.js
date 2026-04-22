import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '~/hooks/useTheme';
import Header from '~/components/Header';

function QuickMatchScreen() {
  const { colors, spacing } = useTheme();
  
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar
        barStyle={colors.statusBar === 'dark' ? 'dark-content' : 'light-content'}
        backgroundColor={colors.surface}
      />
      <Header title="Start Quick Match" />
      <View style={[styles.container, { padding: spacing[4] }]}>
        <Text style={[styles.text, { color: colors.textSecondary }]}>
          Quick setup screen for a new match goes here.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 16, textAlign: 'center' },
});

export default QuickMatchScreen;
