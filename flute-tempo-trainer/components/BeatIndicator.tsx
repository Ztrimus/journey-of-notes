import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface BeatIndicatorProps {
  isActive: boolean;
  currentBeat: number;
}

export default function BeatIndicator({ isActive, currentBeat }: BeatIndicatorProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (isActive && currentBeat > 0) {
      // Pulse animation on each beat
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.3,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.3,
            duration: 350,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [currentBeat, isActive]);

  // Reset animation when not active
  useEffect(() => {
    if (!isActive) {
      scaleAnim.setValue(1);
      opacityAnim.setValue(0.3);
    }
  }, [isActive]);

  // Calculate beat within measure (assuming 4/4 time)
  const beatInMeasure = ((currentBeat - 1) % 4) + 1;

  return (
    <View style={styles.container}>
      {/* Main beat circle */}
      <Animated.View
        style={[
          styles.beatCircle,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <View style={styles.innerCircle}>
          <Text style={styles.beatNumber}>{isActive ? beatInMeasure : '—'}</Text>
        </View>
      </Animated.View>

      {/* Beat indicators (1-2-3-4) */}
      <View style={styles.beatDots}>
        {[1, 2, 3, 4].map((num) => (
          <View
            key={num}
            style={[
              styles.beatDot,
              isActive && beatInMeasure === num && styles.beatDotActive,
              num === 1 && styles.beatDotAccent,
            ]}
          >
            <Text
              style={[
                styles.beatDotText,
                isActive && beatInMeasure === num && styles.beatDotTextActive,
              ]}
            >
              {num}
            </Text>
          </View>
        ))}
      </View>

      {/* Total beat count */}
      <Text style={styles.totalBeats}>
        {isActive ? `Beat ${currentBeat}` : 'Ready'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  beatCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#e94560',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#e94560',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  innerCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  beatNumber: {
    fontSize: 48,
    fontWeight: '800',
    color: '#e94560',
  },
  beatDots: {
    flexDirection: 'row',
    marginTop: 24,
  },
  beatDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#16213e',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#2a2a4e',
    marginHorizontal: 6,
  },
  beatDotActive: {
    backgroundColor: '#e94560',
    borderColor: '#e94560',
  },
  beatDotAccent: {
    borderColor: '#e94560',
  },
  beatDotText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  beatDotTextActive: {
    color: '#ffffff',
  },
  totalBeats: {
    marginTop: 16,
    fontSize: 14,
    color: '#666',
  },
});

