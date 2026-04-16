import { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import BeatIndicator from '../components/BeatIndicator';
import HitMissIndicator from '../components/HitMissIndicator';
import AudioVisualizer from '../components/AudioVisualizer';
import { useMetronome } from '../hooks/useMetronome';
import { useAudioListener } from '../hooks/useAudioListener';
import { useBeatMatcher } from '../hooks/useBeatMatcher';
import { SessionResult, BeatResult } from '../types';

export default function SessionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ bpm: string }>();
  const bpm = parseInt(params.bpm || '120', 10);

  const [isRunning, setIsRunning] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [lastResult, setLastResult] = useState<'hit' | 'miss' | null>(null);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const beatResultsRef = useRef<BeatResult[]>([]);
  const consumedNotesRef = useRef<Set<number>>(new Set()); // Track notes that have been matched to beats

  const metronome = useMetronome(bpm);
  const audioListener = useAudioListener();
  const beatMatcher = useBeatMatcher();

  // Start session
  const startSession = useCallback(async () => {
    try {
      await audioListener.start();
      metronome.start();
      startTimeRef.current = Date.now();
      beatResultsRef.current = [];
      consumedNotesRef.current = new Set(); // Reset consumed notes
      setIsRunning(true);

      // Start duration timer
      timerRef.current = setInterval(() => {
        setSessionDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } catch (error) {
      Alert.alert(
        'Microphone Access Required',
        'Please grant microphone permission to detect flute notes.',
        [{ text: 'OK' }]
      );
    }
  }, [audioListener, metronome]);

  // End session
  const endSession = useCallback(() => {
    metronome.stop();
    audioListener.stop();
    setIsRunning(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Calculate final results
    const results = beatResultsRef.current;
    const hits = results.filter((r) => r.result === 'hit').length;
    const misses = results.filter((r) => r.result === 'miss').length;
    const missedBeats = results.filter((r) => r.result === 'missed_beat').length;
    const totalBeats = results.length;

    const sessionResult: SessionResult = {
      totalBeats,
      hits,
      misses,
      missedBeats,
      accuracy: totalBeats > 0 ? (hits / totalBeats) * 100 : 0,
      duration: sessionDuration,
      bpm,
      beatResults: results,
    };

    // Navigate to summary
    router.replace({
      pathname: '/summary',
      params: {
        result: JSON.stringify(sessionResult),
      },
    });
  }, [metronome, audioListener, sessionDuration, bpm, router]);

  // Match notes to beats in real-time
  useEffect(() => {
    if (!isRunning) return;

    const beatTimestamps = metronome.beatTimestamps;
    const noteTimestamps = audioListener.noteTimestamps;

    if (beatTimestamps.length === 0) return;

    // Get the latest beat
    const latestBeatIndex = beatTimestamps.length - 1;
    const latestBeatTime = beatTimestamps[latestBeatIndex];

    // Check if we already processed this beat
    if (beatResultsRef.current.length >= beatTimestamps.length) return;

    // Find if there's a note close to this beat (excluding already-consumed notes)
    const matchResult = beatMatcher.matchBeatToNotes(
      latestBeatTime,
      noteTimestamps,
      consumedNotesRef.current
    );

    const beatResult: BeatResult = {
      beatTimestamp: latestBeatTime,
      noteTimestamp: matchResult.noteTimestamp,
      delta: matchResult.delta,
      result: matchResult.result,
    };

    // If we matched a note to this beat, mark it as consumed so it can't match other beats
    if (matchResult.noteTimestamp !== null && matchResult.result === 'hit') {
      consumedNotesRef.current.add(matchResult.noteTimestamp);
    }

    beatResultsRef.current.push(beatResult);

    // Update UI feedback
    if (matchResult.result === 'hit') {
      setLastResult('hit');
    } else {
      setLastResult('miss');
    }

    // Clear the feedback after a short delay
    setTimeout(() => setLastResult(null), 200);
  }, [isRunning, metronome.beatTimestamps, audioListener.noteTimestamps, beatMatcher]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      metronome.stop();
      audioListener.stop();
    };
  }, []);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate current stats
  const currentHits = beatResultsRef.current.filter((r) => r.result === 'hit').length;
  const currentTotal = beatResultsRef.current.length;
  const currentAccuracy = currentTotal > 0 ? Math.round((currentHits / currentTotal) * 100) : 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{bpm}</Text>
            <Text style={styles.statLabel}>BPM</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{formatTime(sessionDuration)}</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{currentAccuracy}%</Text>
            <Text style={styles.statLabel}>Accuracy</Text>
          </View>
        </View>

        {/* Beat Indicator */}
        <View style={styles.beatContainer}>
          <BeatIndicator
            isActive={metronome.isPlaying}
            currentBeat={metronome.currentBeat}
          />
        </View>

        {/* Hit/Miss Indicator */}
        <HitMissIndicator result={lastResult} />

        {/* Audio Visualizer */}
        <View style={styles.visualizerContainer}>
          <Text style={styles.visualizerLabel}>Microphone Input</Text>
          <AudioVisualizer
            amplitude={audioListener.amplitude}
            isListening={audioListener.isListening}
          />
        </View>

        {/* Real-time Stats */}
        <View style={styles.liveStats}>
          <Text style={styles.liveStatsText}>
            Hits: <Text style={styles.hitCount}>{currentHits}</Text> / {currentTotal} beats
          </Text>
        </View>

        {/* Control Buttons */}
        <View style={styles.controls}>
          {!isRunning ? (
            <TouchableOpacity
              style={styles.startButton}
              onPress={startSession}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>▶ Start</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.stopButton}
              onPress={endSession}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>■ End Session</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: '#16213e',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    minWidth: 90,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#e94560',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  beatContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    maxHeight: 200,
  },
  visualizerContainer: {
    marginVertical: 20,
  },
  visualizerLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  liveStats: {
    alignItems: 'center',
    marginBottom: 20,
  },
  liveStatsText: {
    fontSize: 18,
    color: '#eaeaea',
  },
  hitCount: {
    color: '#4ade80',
    fontWeight: '700',
  },
  controls: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  startButton: {
    backgroundColor: '#4ade80',
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 30,
  },
  stopButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
});

