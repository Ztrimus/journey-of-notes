import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';

interface BpmSelectorProps {
  value: number;
  onChange: (bpm: number) => void;
  min?: number;
  max?: number;
}

export default function BpmSelector({
  value,
  onChange,
  min = 40,
  max = 240,
}: BpmSelectorProps) {
  const [isEditing, setIsEditing] = useState(false);

  const increment = (amount: number) => {
    const newValue = Math.min(max, Math.max(min, value + amount));
    onChange(newValue);
  };

  const presets = [60, 80, 100, 120, 140, 160];

  const getTempoLabel = (bpm: number) => {
    if (bpm < 60) return 'Largo';
    if (bpm < 80) return 'Adagio';
    if (bpm < 100) return 'Andante';
    if (bpm < 120) return 'Moderato';
    if (bpm < 140) return 'Allegro';
    if (bpm < 180) return 'Vivace';
    return 'Presto';
  };

  return (
    <View style={styles.container}>
      {/* Main BPM Display */}
      <View style={styles.mainDisplay}>
        <TouchableOpacity
          style={styles.adjustButton}
          onPress={() => increment(-10)}
          onLongPress={() => increment(-10)}
        >
          <Text style={styles.adjustButtonText}>-10</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.smallAdjust}
          onPress={() => increment(-1)}
        >
          <Text style={styles.smallAdjustText}>−</Text>
        </TouchableOpacity>

        <View style={styles.bpmDisplay}>
          <Text style={styles.bpmValue}>{value}</Text>
          <Text style={styles.bpmLabel}>BPM</Text>
          <Text style={styles.tempoLabel}>{getTempoLabel(value)}</Text>
        </View>

        <TouchableOpacity
          style={styles.smallAdjust}
          onPress={() => increment(1)}
        >
          <Text style={styles.smallAdjustText}>+</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.adjustButton}
          onPress={() => increment(10)}
          onLongPress={() => increment(10)}
        >
          <Text style={styles.adjustButtonText}>+10</Text>
        </TouchableOpacity>
      </View>

      {/* Preset Buttons */}
      <View style={styles.presets}>
        {presets.map((preset) => (
          <View key={preset} style={styles.presetWrapper}>
            <TouchableOpacity
              style={[
                styles.presetButton,
                value === preset && styles.presetButtonActive,
              ]}
              onPress={() => onChange(preset)}
            >
              <Text
                style={[
                  styles.presetText,
                  value === preset && styles.presetTextActive,
                ]}
              >
                {preset}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Range indicator */}
      <Text style={styles.rangeText}>
        Range: {min} - {max} BPM
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  mainDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  adjustButton: {
    backgroundColor: '#16213e',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  adjustButtonText: {
    color: '#e94560',
    fontSize: 16,
    fontWeight: '600',
  },
  smallAdjust: {
    backgroundColor: '#2a2a4e',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  smallAdjustText: {
    color: '#eaeaea',
    fontSize: 24,
    fontWeight: '300',
  },
  bpmDisplay: {
    alignItems: 'center',
    marginHorizontal: 12,
    minWidth: 100,
  },
  bpmValue: {
    fontSize: 64,
    fontWeight: '800',
    color: '#e94560',
    lineHeight: 72,
  },
  bpmLabel: {
    fontSize: 14,
    color: '#888',
    marginTop: -8,
  },
  tempoLabel: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
  },
  presets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 12,
  },
  presetWrapper: {
    margin: 4,
  },
  presetButton: {
    backgroundColor: '#16213e',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2a2a4e',
  },
  presetButtonActive: {
    backgroundColor: '#e94560',
    borderColor: '#e94560',
  },
  presetText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '500',
  },
  presetTextActive: {
    color: '#ffffff',
  },
  rangeText: {
    fontSize: 11,
    color: '#555',
  },
});

