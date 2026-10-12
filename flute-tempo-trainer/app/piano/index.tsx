import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { TOTAL_COMBINATIONS, PIANO_NOTE_INTERVAL_MS } from '../../types/piano';

export default function PianoHomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Piano</Text>
          <Text style={styles.subtitle}>Trainer</Text>
        </View>

        {/* Info */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            {TOTAL_COMBINATIONS} note combinations
          </Text>
          <Text style={styles.infoSubText}>
            2 hands · 5 fingers · 7 octaves · 12 notes
          </Text>
          <Text style={styles.infoSubText}>
            Prompt interval: {PIANO_NOTE_INTERVAL_MS / 1000}s
          </Text>
        </View>

        {/* Exercise buttons */}
        <View style={styles.exercises}>
          <TouchableOpacity
            style={styles.exerciseButton}
            onPress={() => router.push('/piano/random-notes')}
          >
            <Text style={styles.exerciseTitle}>Random Note Exercise</Text>
            <Text style={styles.exerciseDesc}>
              Follow random hand · finger · octave · note prompts as quickly as
              possible
            </Text>
          </TouchableOpacity>
        </View>

        {/* Back */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1b2a' },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  header: { alignItems: 'center' },
  title: { fontSize: 36, fontWeight: '700', color: '#f0c040' },
  subtitle: { fontSize: 28, fontWeight: '400', color: '#eaeaea' },
  infoBox: {
    backgroundColor: '#1a2e3a',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    width: '100%',
  },
  infoText: { fontSize: 22, fontWeight: '700', color: '#f0c040', marginBottom: 8 },
  infoSubText: { fontSize: 14, color: '#aaa', marginBottom: 4 },
  exercises: { width: '100%', gap: 16 },
  exerciseButton: {
    backgroundColor: '#1a2e3a',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#f0c040',
  },
  exerciseTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 6 },
  exerciseDesc: { fontSize: 13, color: '#888', lineHeight: 18 },
  backButton: { paddingVertical: 12 },
  backButtonText: { color: '#666', fontSize: 15 },
});
