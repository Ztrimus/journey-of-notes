import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SessionResult } from '../types';

export default function SummaryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ result: string }>();
  
  const result: SessionResult = params.result 
    ? JSON.parse(params.result) 
    : {
        totalBeats: 0,
        hits: 0,
        misses: 0,
        missedBeats: 0,
        accuracy: 0,
        duration: 0,
        bpm: 120,
        beatResults: [],
      };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPerformanceMessage = (accuracy: number) => {
    if (accuracy >= 90) return { text: 'Excellent! 🎯', color: '#4ade80' };
    if (accuracy >= 70) return { text: 'Great job! 👏', color: '#84cc16' };
    if (accuracy >= 50) return { text: 'Good effort! 💪', color: '#facc15' };
    if (accuracy >= 30) return { text: 'Keep practicing! 🎵', color: '#fb923c' };
    return { text: 'Room to grow! 🌱', color: '#f87171' };
  };

  const performance = getPerformanceMessage(result.accuracy);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Performance Message */}
        <View style={styles.header}>
          <Text style={[styles.performanceText, { color: performance.color }]}>
            {performance.text}
          </Text>
          <Text style={styles.accuracyBig}>{Math.round(result.accuracy)}%</Text>
          <Text style={styles.accuracyLabel}>Timing Accuracy</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🎯</Text>
            <Text style={styles.statNumber}>{result.hits}</Text>
            <Text style={styles.statLabel}>Hits</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>❌</Text>
            <Text style={styles.statNumber}>{result.misses}</Text>
            <Text style={styles.statLabel}>Off-time</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>⏭️</Text>
            <Text style={styles.statNumber}>{result.missedBeats}</Text>
            <Text style={styles.statLabel}>Missed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🥁</Text>
            <Text style={styles.statNumber}>{result.totalBeats}</Text>
            <Text style={styles.statLabel}>Total Beats</Text>
          </View>
        </View>

        {/* Session Info */}
        <View style={styles.sessionInfo}>
          <View style={styles.sessionRow}>
            <Text style={styles.sessionLabel}>Tempo</Text>
            <Text style={styles.sessionValue}>{result.bpm} BPM</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.sessionRow}>
            <Text style={styles.sessionLabel}>Duration</Text>
            <Text style={styles.sessionValue}>{formatTime(result.duration)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.sessionRow}>
            <Text style={styles.sessionLabel}>Notes/Minute</Text>
            <Text style={styles.sessionValue}>
              {result.duration > 0 
                ? Math.round((result.hits + result.misses) / (result.duration / 60)) 
                : 0}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <Text style={styles.progressTitle}>Hit Rate Breakdown</Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  flex: result.accuracy / 100 || 0.01,
                  backgroundColor: performance.color,
                }
              ]} 
            />
            <View style={{ flex: Math.max(0.01, 1 - result.accuracy / 100) }} />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressLabelLeft}>0%</Text>
            <Text style={styles.progressLabelRight}>100%</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <View style={styles.buttonWrapper}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.replace('/')}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Practice Again</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.replace('/')}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Change Tempo</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  performanceText: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  accuracyBig: {
    fontSize: 72,
    fontWeight: '800',
    color: '#e94560',
  },
  accuracyLabel: {
    fontSize: 16,
    color: '#888',
    marginTop: -4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#eaeaea',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  sessionInfo: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  sessionLabel: {
    fontSize: 15,
    color: '#888',
  },
  sessionValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#eaeaea',
  },
  divider: {
    height: 1,
    backgroundColor: '#2a2a4e',
  },
  progressSection: {
    marginBottom: 32,
  },
  progressTitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#16213e',
    borderRadius: 6,
    flexDirection: 'row',
  },
  progressFill: {
    height: 12,
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  progressLabelLeft: {
    fontSize: 11,
    color: '#666',
  },
  progressLabelRight: {
    fontSize: 11,
    color: '#666',
  },
  actions: {
    marginTop: 0,
  },
  buttonWrapper: {
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#e94560',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#e94560',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#e94560',
    fontSize: 16,
    fontWeight: '600',
  },
});

