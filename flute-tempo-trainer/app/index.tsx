import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

// Temporarily commenting out BpmSelector to debug
// import BpmSelector from '../components/BpmSelector';

export default function HomeScreen() {
  const router = useRouter();
  const [bpm, setBpm] = useState(120);

  console.log('HomeScreen rendering...'); // Debug log

  const handleStartSession = () => {
    router.push({
      pathname: '/session',
      params: { bpm: bpm.toString() },
    });
  };

  const incrementBpm = () => setBpm(prev => Math.min(240, prev + 10));
  const decrementBpm = () => setBpm(prev => Math.max(40, prev - 10));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Flute Tempo</Text>
          <Text style={styles.subtitle}>Trainer</Text>
        </View>

        {/* Simple BPM Control */}
        <View style={styles.bpmControl}>
          <TouchableOpacity style={styles.bpmButton} onPress={decrementBpm}>
            <Text style={styles.bpmButtonText}>-10</Text>
          </TouchableOpacity>
          
          <View style={styles.bpmDisplay}>
            <Text style={styles.bpmValue}>{bpm}</Text>
            <Text style={styles.bpmLabel}>BPM</Text>
          </View>
          
          <TouchableOpacity style={styles.bpmButton} onPress={incrementBpm}>
            <Text style={styles.bpmButtonText}>+10</Text>
          </TouchableOpacity>
        </View>

        {/* Start Button */}
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartSession}
        >
          <Text style={styles.startButtonText}>Start Practice Session</Text>
        </TouchableOpacity>

        {/* Footer */}
        <Text style={styles.footer}>
          Tip: Start with a slower tempo
        </Text>
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
    padding: 24,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#e94560',
  },
  subtitle: {
    fontSize: 28,
    fontWeight: '400',
    color: '#eaeaea',
  },
  bpmControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bpmButton: {
    backgroundColor: '#16213e',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  bpmButtonText: {
    color: '#e94560',
    fontSize: 18,
    fontWeight: '600',
  },
  bpmDisplay: {
    alignItems: 'center',
    marginHorizontal: 24,
  },
  bpmValue: {
    fontSize: 56,
    fontWeight: '700',
    color: '#e94560',
  },
  bpmLabel: {
    fontSize: 14,
    color: '#888',
  },
  startButton: {
    backgroundColor: '#e94560',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  footer: {
    color: '#666',
    fontSize: 13,
  },
});
