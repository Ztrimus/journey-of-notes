import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Journey of Notes</Text>
          <Text style={styles.subtitle}>Choose your instrument</Text>
        </View>

        {/* Instrument cards */}
        <View style={styles.instruments}>
          {/* Bamboo Flute */}
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: '/session',
                params: { bpm: '120' },
              })
            }
          >
            <Text style={styles.cardIcon}>🎋</Text>
            <Text style={styles.cardTitle}>Bamboo Flute</Text>
            <Text style={styles.cardDesc}>
              Tempo training · Beat accuracy · Onset detection
            </Text>
          </TouchableOpacity>

          {/* Piano */}
          <TouchableOpacity
            style={[styles.card, styles.pianoCard]}
            onPress={() => router.push('/piano')}
          >
            <Text style={styles.cardIcon}>🎹</Text>
            <Text style={styles.cardTitle}>Piano</Text>
            <Text style={styles.cardDesc}>
              Random note exercises · Hand · Finger · Octave drills
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>Practice makes perfect</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  header: { alignItems: 'center' },
  title: { fontSize: 30, fontWeight: '700', color: '#eaeaea' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 6 },

  instruments: { width: '100%', gap: 16 },

  card: {
    backgroundColor: '#16213e',
    borderRadius: 20,
    padding: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#e94560',
  },
  pianoCard: { borderLeftColor: '#f0c040' },

  cardIcon: { fontSize: 36, marginBottom: 10 },
  cardTitle: { fontSize: 22, fontWeight: '700', color: '#eaeaea', marginBottom: 6 },
  cardDesc: { fontSize: 13, color: '#888', lineHeight: 18 },

  footer: { color: '#444', fontSize: 13 },
});
