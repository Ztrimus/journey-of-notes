import { View, Text, StyleSheet } from 'react-native';

interface AudioVisualizerProps {
  amplitude: number; // 0-1
  isListening: boolean;
}

export default function AudioVisualizer({
  amplitude,
  isListening,
}: AudioVisualizerProps) {
  const bars = 20;
  const VISUALIZER_HEIGHT = 60;
  
  // Generate bar heights based on amplitude
  const generateBars = () => {
    const barElements = [];
    for (let i = 0; i < bars; i++) {
      // Create a wave-like pattern with some randomness
      const position = i / bars;
      const wave = Math.sin(position * Math.PI);
      const variation = 0.3 + Math.random() * 0.7;
      const heightPercent = isListening
        ? Math.max(0.1, amplitude * wave * variation)
        : 0.1;
      const heightPx = Math.max(4, heightPercent * VISUALIZER_HEIGHT);

      barElements.push(
        <View
          key={i}
          style={[
            styles.bar,
            {
              height: heightPx,
              backgroundColor: getBarColor(heightPercent, position),
            },
          ]}
        />
      );
    }
    return barElements;
  };

  const getBarColor = (height: number, position: number) => {
    if (!isListening) return '#2a2a4e';
    if (height > 0.7) return '#ef4444'; // Red for loud/clipping
    if (height > 0.5) return '#facc15'; // Yellow for medium-high
    if (height > 0.3) return '#4ade80'; // Green for good level
    return '#3b82f6'; // Blue for low
  };

  const getStatusText = () => {
    if (!isListening) return 'Microphone inactive';
    if (amplitude > 0.7) return 'Very loud!';
    if (amplitude > 0.5) return 'Good level';
    if (amplitude > 0.2) return 'Detecting sound';
    return 'Listening...';
  };

  const getStatusColor = () => {
    if (!isListening) return '#666';
    if (amplitude > 0.7) return '#ef4444';
    if (amplitude > 0.5) return '#4ade80';
    if (amplitude > 0.2) return '#3b82f6';
    return '#888';
  };

  return (
    <View style={styles.container}>
      {/* Visualizer bars */}
      <View style={styles.visualizer}>
        {generateBars()}
      </View>

      {/* Level indicator */}
      <View style={styles.levelContainer}>
        <View style={styles.levelTrack}>
          <View
            style={[
              styles.levelFill,
              {
                flex: amplitude || 0.01,
              },
            ]}
          />
          <View style={[styles.levelEmpty, { flex: Math.max(0.01, 1 - amplitude) }]} />
        </View>
        <View style={styles.levelLabels}>
          <Text style={styles.levelLabel}>0</Text>
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
          <Text style={styles.levelLabel}>MAX</Text>
        </View>
      </View>

      {/* Amplitude value */}
      <Text style={styles.amplitudeText}>
        Level: {isListening ? Math.round(amplitude * 100) : '--'}%
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
  },
  visualizer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 60,
    marginBottom: 12,
  },
  bar: {
    width: 8,
    borderRadius: 4,
    minHeight: 4,
  },
  levelContainer: {
    marginBottom: 8,
  },
  levelTrack: {
    height: 8,
    backgroundColor: '#2a2a4e',
    borderRadius: 4,
    flexDirection: 'row',
  },
  levelFill: {
    height: 8,
    backgroundColor: '#4ade80',
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  levelEmpty: {
    height: 8,
  },
  levelLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  levelLabel: {
    fontSize: 10,
    color: '#666',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  amplitudeText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#888',
  },
});

