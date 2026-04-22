import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '~/hooks/useTheme';
import Header from '~/components/Header';

function HistoryScreen() {
  const { colors, spacing } = useTheme();
  
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar
        barStyle={colors.statusBar === 'dark' ? 'dark-content' : 'light-content'}
        backgroundColor={colors.surface}
      />
      <Header title="Match History" />
      <View style={[styles.container, { padding: spacing[4] }]}>
        <Text style={[styles.text, { color: colors.textSecondary }]}>
          Your past matches will appear here. Let's score some games!
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

export default HistoryScreen;
