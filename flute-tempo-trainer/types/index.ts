// Session data types
export interface SessionResult {
  totalBeats: number;
  hits: number;
  misses: number;
  missedBeats: number;
  accuracy: number;
  duration: number; // in seconds
  bpm: number;
  beatResults: BeatResult[];
}

export interface BeatResult {
  beatTimestamp: number;
  noteTimestamp: number | null;
  delta: number | null; // ms difference between note and beat
  result: 'hit' | 'miss' | 'missed_beat';
}

export interface NoteOnset {
  timestamp: number;
  amplitude: number;
}

// Metronome types
export interface MetronomeState {
  isPlaying: boolean;
  currentBeat: number;
  beatTimestamps: number[];
}

// Audio listener types
export interface AudioListenerState {
  isListening: boolean;
  amplitude: number;
  noteTimestamps: number[];
}

// Beat matching types
export interface MatchResult {
  beatIndex: number;
  result: 'hit' | 'miss' | 'missed_beat';
  delta: number | null;
}

// Settings
export interface AppSettings {
  toleranceMs: number; // ±ms window for a "hit"
  amplitudeThreshold: number; // 0-1, sensitivity for note detection
  debounceMs: number; // minimum time between note detections
}

export const DEFAULT_SETTINGS: AppSettings = {
  toleranceMs: 100,
  amplitudeThreshold: 0.15, // Lowered for flute (quieter instrument)
  debounceMs: 100,
};

