import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Animated,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '~/hooks/useTheme';
import { matchApi } from '~/services/api';
import { SCREENS } from '~/constants';
import Header from '~/components/Header';
import Button from '~/components/Button';

const { width } = Dimensions.get('window');

const COIN_TYPES = [
  { id: 'gold', color1: '#FFD700', color2: '#DAA520', icon: 'currency-usd' },
  { id: 'silver', color1: '#C0C0C0', color2: '#A9A9A9', icon: 'circle-outline' },
  { id: 'cricket', color1: '#8B0000', color2: '#4B0000', icon: 'cricket' },
];

function TossScreen() {
  const { colors, spacing, borderRadius, isDark } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { matchId } = route.params;

  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [flipping, setFlipping] = useState(false);
  const [result, setResult] = useState(null); // 'heads' or 'tails'
  const [tossStep, setTossStep] = useState(1); // 1: Select Side, 2: Flip, 3: Decision
  const [selection, setSelection] = useState(null); // Team A selection
  const [coinType, setCoinType] = useState(COIN_TYPES[0]);
  const [winner, setWinner] = useState(null);
  const [decision, setDecision] = useState(null);
  const [saving, setSaving] = useState(false);

  const flipAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fetchMatch();
  }, []);

  const fetchMatch = async () => {
    try {
      const response = await matchApi.getMatch(matchId);
      if (response.success) {
        setMatch(response.data);
      } else {
        Alert.alert('Error', 'Could not fetch match details');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Fetch match error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleFlip = () => {
    if (!selection) {
      Alert.alert('Selection Required', `Please choose Heads or Tails for ${match.teams[0].name}`);
      return;
    }

    setFlipping(true);
    setResult(null);

    // Coin flip animation sequence
    Animated.sequence([
      Animated.parallel([
        Animated.timing(flipAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.5,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(flipAnim, {
          toValue: 10,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      const outcome = Math.random() > 0.5 ? 'heads' : 'tails';
      setResult(outcome);
      setFlipping(false);
      
      const won = outcome === selection ? match.teams[0].name : match.teams[1].name;
      setWinner(won);
      setTossStep(3);
    });
  };

  const handleDecision = async (choice) => {
    setDecision(choice);
    setSaving(true);
    try {
      const response = await matchApi.updateToss(matchId, {
        winner,
        decision: choice,
        chosenCoin: coinType.id
      });
      if (response.success) {
        // Now start the match
        const startResponse = await matchApi.startMatch(matchId);
        if (startResponse.success) {
          navigation.navigate(SCREENS.LIVE_MATCH, { matchId });
        } else {
          Alert.alert('Error', 'Could not start match');
        }
      } else {
        Alert.alert('Error', 'Could not save toss result');
      }
    } catch (error) {
      console.error('Save toss error:', error);
      Alert.alert('Error', 'Failed to process toss');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !match) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const spin = flipAnim.interpolate({
    inputRange: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    outputRange: ['0deg', '180deg', '360deg', '540deg', '720deg', '900deg', '1080deg', '1260deg', '1440deg', '1620deg', '1800deg'],
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <Header title="Match Toss" showBack onBack={() => navigation.goBack()} />

      <View style={styles.content}>
        <View style={[styles.matchCard, { backgroundColor: colors.surface, borderColor: colors.divider }]}>
          <Text style={[styles.matchVs, { color: colors.textPrimary }]}>
            {match.teams[0].name} <Text style={{ color: colors.primary }}>VS</Text> {match.teams[1].name}
          </Text>
          <Text style={[styles.matchInfo, { color: colors.textSecondary }]}>{match.format} • {match.overs} Overs</Text>
        </View>

        {tossStep === 1 && (
          <View style={styles.stepBox}>
            <Text style={[styles.label, { color: colors.textPrimary }]}>
              {match.teams[0].name}'s Call
            </Text>
            <View style={styles.selectionRow}>
              <TouchableOpacity
                style={[
                  styles.selectionBtn,
                  { backgroundColor: colors.surface, borderColor: colors.divider },
                  selection === 'heads' && { backgroundColor: colors.primary, borderColor: colors.primary }
                ]}
                onPress={() => setSelection('heads')}
              >
                <MaterialCommunityIcons 
                  name="face-man" 
                  size={32} 
                  color={selection === 'heads' ? colors.textOnPrimary : colors.textSecondary} 
                />
                <Text style={[styles.selectionText, { color: colors.textSecondary }, selection === 'heads' && { color: colors.textOnPrimary }]}>HEADS</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.selectionBtn,
                  { backgroundColor: colors.surface, borderColor: colors.divider },
                  selection === 'tails' && { backgroundColor: colors.primary, borderColor: colors.primary }
                ]}
                onPress={() => setSelection('tails')}
              >
                <MaterialCommunityIcons 
                  name="alpha-t-circle-outline" 
                  size={32} 
                  color={selection === 'tails' ? colors.textOnPrimary : colors.textSecondary} 
                />
                <Text style={[styles.selectionText, { color: colors.textSecondary }, selection === 'tails' && { color: colors.textOnPrimary }]}>TAILS</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.coinContainer}>
          <Animated.View
            style={[
              styles.coin,
              {
                transform: [
                  { rotateY: spin },
                  { scale: scaleAnim }
                ],
              },
            ]}
          >
            <LinearGradient
              colors={[coinType.color1, coinType.color2]}
              style={styles.coinGradient}
            >
              <MaterialCommunityIcons 
                name={result === 'tails' ? 'alpha-t-circle-outline' : 'face-man'} 
                size={80} 
                color="rgba(255,255,255,0.9)" 
              />
              <View style={styles.coinRing} />
            </LinearGradient>
          </Animated.View>
          
          {result && !flipping && (
            <Animated.View style={[styles.resultBadge, { backgroundColor: colors.warning }]}>
              <Text style={[styles.resultText, { color: colors.textOnPrimary }]}>{result.toUpperCase()}</Text>
            </Animated.View>
          )}
        </View>

        {tossStep === 1 && (
          <View style={styles.coinPicker}>
             {COIN_TYPES.map((c) => (
               <TouchableOpacity 
                key={c.id} 
                onPress={() => setCoinType(c)}
                style={[styles.coinTypeBtn, coinType.id === c.id && { borderColor: colors.primary }]}
               >
                 <LinearGradient colors={[c.color1, c.color2]} style={styles.coinTypeIcon}>
                   <MaterialCommunityIcons name={c.icon} size={20} color="#fff" />
                 </LinearGradient>
               </TouchableOpacity>
             ))}
          </View>
        )}

        {tossStep === 1 && (
          <Button
            title="FLIP COIN"
            onPress={handleFlip}
            disabled={!selection}
            style={styles.flipBtn}
          />
        )}

        {tossStep === 3 && (
          <View style={[styles.decisionBox, { backgroundColor: colors.surface, borderColor: colors.divider }]}>
            <Text style={[styles.winnerMsg, { color: colors.textPrimary }]}>
              <Text style={{ color: colors.primary, fontWeight: '900' }}>{winner}</Text> won the toss!
            </Text>
            <Text style={[styles.decisionLabel, { color: colors.textSecondary }]}>Choose what to do:</Text>
            <View style={styles.decisionRow}>
              <TouchableOpacity
                style={[styles.decisionBtn, { backgroundColor: colors.surfaceVariant }, decision === 'bat' && { backgroundColor: colors.success }]}
                onPress={() => handleDecision('bat')}
                disabled={saving}
              >
                <MaterialCommunityIcons name="cricket" size={32} color={decision === 'bat' ? "#fff" : colors.primary} />
                <Text style={[styles.decisionText, { color: colors.textPrimary }, decision === 'bat' && { color: "#fff" }]}>BAT</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.decisionBtn, { backgroundColor: colors.surfaceVariant }, decision === 'bowl' && { backgroundColor: colors.primary }]}
                onPress={() => handleDecision('bowl')}
                disabled={saving}
              >
                <MaterialCommunityIcons name="baseball" size={32} color={decision === 'bowl' ? "#fff" : colors.accent} />
                <Text style={[styles.decisionText, { color: colors.textPrimary }, decision === 'bowl' && { color: "#fff" }]}>BOWL</Text>
              </TouchableOpacity>
            </View>
            {saving && <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  matchCard: {
    width: '100%',
    padding: 20,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 1,
  },
  matchVs: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 5,
  },
  matchInfo: {
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  stepBox: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 15,
  },
  selectionRow: {
    flexDirection: 'row',
    gap: 20,
  },
  selectionBtn: {
    width: 120,
    height: 100,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '800',
  },
  coinContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 40,
  },
  coin: {
    width: 150,
    height: 150,
    borderRadius: 75,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  coinGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  coinRing: {
    position: 'absolute',
    width: '90%',
    height: '90%',
    borderRadius: 70,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  resultBadge: {
    position: 'absolute',
    bottom: -20,
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 20,
    elevation: 5,
  },
  resultText: {
    fontWeight: '900',
    fontSize: 18,
  },
  coinPicker: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 40,
  },
  coinTypeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: 2,
  },
  coinTypeIcon: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipBtn: {
    width: '100%',
    height: 56,
  },
  decisionBox: {
    width: '100%',
    alignItems: 'center',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
  },
  winnerMsg: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 20,
  },
  decisionLabel: {
    fontSize: 14,
    marginBottom: 20,
    textTransform: 'uppercase',
  },
  decisionRow: {
    flexDirection: 'row',
    gap: 20,
  },
  decisionBtn: {
    flex: 1,
    height: 100,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  decisionText: {
    marginTop: 10,
    fontWeight: '900',
    fontSize: 16,
  },
});

export default TossScreen;
