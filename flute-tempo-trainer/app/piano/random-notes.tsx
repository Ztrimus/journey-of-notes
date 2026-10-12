import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  PIANO_NOTE_INTERVAL_MS,
  PIANO_HANDS,
  PIANO_FINGERS,
  PIANO_OCTAVES,
  PIANO_NOTES,
  TOTAL_COMBINATIONS,
  type NotePrompt,
  type PianoNote,
} from '../../types/piano';

// ─── Deck helpers ─────────────────────────────────────────────────────────────

/** Build all 840 combinations in a flat array. */
function buildDeck(): NotePrompt[] {
  const deck: NotePrompt[] = [];
  for (const hand of PIANO_HANDS) {
    for (const finger of PIANO_FINGERS) {
      for (const octave of PIANO_OCTAVES) {
        for (const note of PIANO_NOTES) {
          deck.push({ hand, finger, octave, note });
        }
      }
    }
  }
  return deck;
}

/** Fisher-Yates in-place shuffle. */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Split an enharmonic note like "A#/B♭" into its two parts.
 * Returns [primary, enharmonic | null].
 */
function splitNote(note: PianoNote): [string, string | null] {
  const idx = note.indexOf('/');
  if (idx === -1) return [note, null];
  return [note.slice(0, idx), note.slice(idx + 1)];
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function RandomNotesScreen() {
  const router = useRouter();

  // Shuffled deck of all 840 combos — ref so it doesn't trigger re-renders
  const deckRef = useRef<NotePrompt[]>(shuffle(buildDeck()));
  const deckIndexRef = useRef(0);

  const [isRunning, setIsRunning] = useState(false);
  const [prompt, setPrompt] = useState<NotePrompt | null>(null);
  // How many unique combos have been shown this session (0-840, resets each lap)
  const [combosShown, setCombosShown] = useState(0);
  // Total laps (full deck cycles) completed
  const [lapsCompleted, setLapsCompleted] = useState(0);

  // ── Animations ───────────────────────────────────────────────────────────────

  // Countdown bar — drains from full → empty over PIANO_NOTE_INTERVAL_MS
  const countdownAnim = useRef(new Animated.Value(1)).current;
  const countdownAnimRef = useRef<Animated.CompositeAnimation | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Core logic ───────────────────────────────────────────────────────────────

  const advanceDeck = useCallback(() => {
    if (deckIndexRef.current >= TOTAL_COMBINATIONS) {
      // Completed a full lap — reshuffle and restart
      shuffle(deckRef.current);
      deckIndexRef.current = 0;
      setLapsCompleted(l => l + 1);
      setCombosShown(0);
    }

    const next = deckRef.current[deckIndexRef.current];
    deckIndexRef.current += 1;
    setPrompt(next);
    setCombosShown(deckIndexRef.current);

    // Restart countdown bar
    countdownAnim.setValue(1);
    countdownAnimRef.current = Animated.timing(countdownAnim, {
      toValue: 0,
      duration: PIANO_NOTE_INTERVAL_MS,
      useNativeDriver: false,
    });
    countdownAnimRef.current.start();
  }, [countdownAnim]);

  const startExercise = useCallback(() => {
    // Fresh deck each time Start is pressed
    shuffle(deckRef.current);
    deckIndexRef.current = 0;
    setCombosShown(0);
    setLapsCompleted(0);
    setIsRunning(true);
    advanceDeck();

    intervalRef.current = setInterval(advanceDeck, PIANO_NOTE_INTERVAL_MS);
  }, [advanceDeck]);

  const stopExercise = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    countdownAnimRef.current?.stop();
    countdownAnim.setValue(1);
  }, [countdownAnim]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      countdownAnimRef.current?.stop();
    };
  }, []);

  // ── Derived display values ────────────────────────────────────────────────────

  const progressFraction = combosShown / TOTAL_COMBINATIONS; // 0.0–1.0
  const progressPct = Math.round(progressFraction * 100);

  const countdownWidth = countdownAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const [notePrimary, noteEnharmonic] = prompt ? splitNote(prompt.note) : ['—', null];

  // Hand icon depends on L / R
  const handIcon = prompt?.hand === 'L' ? '🤚' : '✋';

  // Finger icon — use pointing hand for index, others as numbered
  const fingerIcons: Record<number, string> = {
    1: '👍',
    2: '☝️',
    3: '🖕',  // middle
    4: '💍',
    5: '🤙',
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.title}>Random Notes</Text>
          <Text style={styles.headerMeta}>
            {isRunning
              ? `${combosShown} / ${TOTAL_COMBINATIONS} combos${lapsCompleted > 0 ? ` · lap ${lapsCompleted + 1}` : ''}`
              : `${TOTAL_COMBINATIONS} combinations · every ${PIANO_NOTE_INTERVAL_MS / 1000}s`}
          </Text>
        </View>

        {/* ── Combo progress bar (coverage of 840) ── */}
        <View style={styles.comboProgressSection}>
          <View style={styles.comboProgressTrack}>
            <View style={[styles.comboProgressFill, { width: `${progressPct}%` }]} />
          </View>
          <Text style={styles.comboProgressLabel}>
            {isRunning ? `${progressPct}% of all combinations` : 'Progress resets on Start'}
          </Text>
        </View>

        {/* ── Countdown bar (time to next prompt) ── */}
        <View style={styles.countdownTrack}>
          <Animated.View style={[styles.countdownBar, { width: countdownWidth }]} />
        </View>

        {/* ── Main prompt grid ── */}
        {prompt ? (
          <View style={styles.grid}>

            {/* Row 1: Hand · Finger */}
            <View style={styles.gridRow}>
              <View style={[styles.cell, styles.cellDim]}>
                <Text style={styles.cellIcon}>{handIcon}</Text>
                <Text style={styles.cellValue}>{prompt.hand}</Text>
                <Text style={styles.cellLabel}>Hand</Text>
              </View>

              <View style={[styles.cell, styles.cellDim]}>
                <Text style={styles.cellIcon}>{fingerIcons[prompt.finger]}</Text>
                <Text style={styles.cellValue}>{prompt.finger}</Text>
                <Text style={styles.cellLabel}>Finger</Text>
              </View>
            </View>

            {/* Row 2: Note · Octave */}
            <View style={styles.gridRow}>
              {/* Note — yellow accent, can have enharmonic */}
              <View style={[styles.cell, styles.cellNote]}>
                <Text style={styles.cellIcon}>🎵</Text>
                <View style={styles.noteValueBlock}>
                  <Text style={styles.cellValueNote}>{notePrimary}</Text>
                  {noteEnharmonic && (
                    <Text style={styles.enharmonic}>{noteEnharmonic}</Text>
                  )}
                </View>
                <Text style={[styles.cellLabel, styles.cellLabelNote]}>Note</Text>
              </View>

              <View style={[styles.cell, styles.cellDim]}>
                <Text style={styles.cellIcon}>🎹</Text>
                <Text style={styles.cellValue}>{prompt.octave}</Text>
                <Text style={styles.cellLabel}>Octave</Text>
              </View>
            </View>

            {/* Shorthand line */}
            <Text style={styles.shorthand}>
              {notePrimary}{prompt.octave} · {prompt.hand === 'L' ? 'Left' : 'Right'} · Finger {prompt.finger}
            </Text>
          </View>
        ) : (
          <View style={styles.emptyGrid}>
            <Text style={styles.emptyText}>Press Start to begin</Text>
          </View>
        )}

        {/* ── Controls ── */}
        <View style={styles.controls}>
          {!isRunning ? (
            <TouchableOpacity style={styles.startButton} onPress={startExercise}>
              <Text style={styles.startButtonText}>▶  Start Exercise</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.stopButton} onPress={stopExercise}>
              <Text style={styles.stopButtonText}>■  Stop</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Back ── */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => { stopExercise(); router.back(); }}
        >
          <Text style={styles.backButtonText}>← Piano Home</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const CELL_BG = '#1a2e3a';
const ACCENT = '#f0c040';
const DIM_TEXT = '#eaeaea';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1b2a' },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'space-between',
  },

  // Header
  header: { alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: ACCENT },
  headerMeta: { fontSize: 12, color: '#666', marginTop: 2, textAlign: 'center' },

  // ── Combo progress bar (session coverage) ──
  comboProgressSection: { gap: 6 },
  comboProgressTrack: {
    width: '100%',
    height: 10,
    backgroundColor: '#1a2e3a',
    borderRadius: 5,
    overflow: 'hidden',
  },
  comboProgressFill: {
    height: 10,
    backgroundColor: '#3ecf8e', // green = coverage progress
    borderRadius: 5,
  },
  comboProgressLabel: {
    fontSize: 11,
    color: '#3ecf8e',
    textAlign: 'right',
  },

  // ── Countdown bar (time to next prompt) ──
  countdownTrack: {
    width: '100%',
    height: 4,
    backgroundColor: '#1a2e3a',
    borderRadius: 2,
    overflow: 'hidden',
  },
  countdownBar: {
    height: 4,
    backgroundColor: ACCENT,
    borderRadius: 2,
  },

  // ── 2×2 grid ──
  grid: { gap: 10 },
  gridRow: { flexDirection: 'row', gap: 10 },

  cell: {
    flex: 1,
    backgroundColor: CELL_BG,
    borderRadius: 18,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 140,
    gap: 6,
  },
  cellDim: {
    // standard dim cell
  },
  cellNote: {
    borderWidth: 1.5,
    borderColor: ACCENT,
  },

  cellIcon: { fontSize: 28 },

  // Large single-character values for quick recognition
  cellValue: {
    fontSize: 72,
    fontWeight: '800',
    color: DIM_TEXT,
    lineHeight: 80,
    letterSpacing: -2,
  },
  cellValueNote: {
    fontSize: 60,
    fontWeight: '900',
    color: ACCENT,
    lineHeight: 66,
    letterSpacing: -1,
  },
  noteValueBlock: { alignItems: 'center' },
  enharmonic: {
    fontSize: 18,
    fontWeight: '600',
    color: '#a08030',
    marginTop: -4,
  },

  cellLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#556',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  cellLabelNote: { color: '#9a7a20' },

  // Shorthand summary
  shorthand: {
    textAlign: 'center',
    color: '#445',
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 2,
  },

  // Empty state
  emptyGrid: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: { color: '#333', fontSize: 16 },

  // Buttons
  controls: {},
  startButton: {
    backgroundColor: ACCENT,
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
  },
  startButtonText: { color: '#0d1b2a', fontSize: 18, fontWeight: '800' },
  stopButton: {
    backgroundColor: '#e94560',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
  },
  stopButtonText: { color: '#fff', fontSize: 18, fontWeight: '800' },

  backButton: { paddingVertical: 8, alignItems: 'center' },
  backButtonText: { color: '#555', fontSize: 15 },
});
