import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface HitMissIndicatorProps {
  result: 'hit' | 'miss' | null;
}

export default function HitMissIndicator({ result }: HitMissIndicatorProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (result) {
      // Reset and animate
      fadeAnim.setValue(1);
      scaleAnim.setValue(0.5);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1.2,
          friction: 5,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [result]);

  if (!result) {
    return <View style={styles.placeholder} />;
  }

  const isHit = result === 'hit';

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.indicator,
          isHit ? styles.hitIndicator : styles.missIndicator,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={styles.emoji}>{isHit ? '✓' : '✗'}</Text>
        <Text style={[styles.text, isHit ? styles.hitText : styles.missText]}>
          {isHit ? 'HIT!' : 'MISS'}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    height: 80,
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 40,
  },
  emoji: {
    fontSize: 28,
    marginRight: 8,
  },
  hitIndicator: {
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
    borderWidth: 2,
    borderColor: '#4ade80',
  },
  missIndicator: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  text: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 2,
  },
  hitText: {
    color: '#4ade80',
  },
  missText: {
    color: '#ef4444',
  },
});

