/**
 * Audio Helper Utilities
 * 
 * Helper functions for audio processing and timing calculations.
 */

/**
 * Convert BPM to milliseconds per beat
 */
export function bpmToMs(bpm: number): number {
  return (60 / bpm) * 1000;
}

/**
 * Convert milliseconds to BPM
 */
export function msToBpm(ms: number): number {
  return (60 / ms) * 1000;
}

/**
 * Format time in seconds to MM:SS display
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get tempo marking name from BPM
 */
export function getTempoMarking(bpm: number): string {
  if (bpm < 40) return 'Grave';
  if (bpm < 60) return 'Largo';
  if (bpm < 66) return 'Larghetto';
  if (bpm < 76) return 'Adagio';
  if (bpm < 108) return 'Andante';
  if (bpm < 120) return 'Moderato';
  if (bpm < 156) return 'Allegro';
  if (bpm < 176) return 'Vivace';
  if (bpm < 200) return 'Presto';
  return 'Prestissimo';
}

/**
 * Calculate the time difference (delta) between two timestamps
 * Returns positive if noteTime is after beatTime (late)
 * Returns negative if noteTime is before beatTime (early)
 */
export function calculateTimingDelta(beatTime: number, noteTime: number): number {
  return noteTime - beatTime;
}

/**
 * Categorize timing accuracy
 */
export type TimingCategory = 'perfect' | 'good' | 'fair' | 'poor';

export function categorizeTimingDelta(deltaMs: number): TimingCategory {
  const absDelta = Math.abs(deltaMs);
  if (absDelta <= 30) return 'perfect';
  if (absDelta <= 60) return 'good';
  if (absDelta <= 100) return 'fair';
  return 'poor';
}

/**
 * Get a human-readable timing description
 */
export function getTimingDescription(deltaMs: number): string {
  if (Math.abs(deltaMs) <= 30) return 'Perfect!';
  if (deltaMs > 30 && deltaMs <= 100) return 'Slightly late';
  if (deltaMs < -30 && deltaMs >= -100) return 'Slightly early';
  if (deltaMs > 100) return 'Too late';
  if (deltaMs < -100) return 'Too early';
  return 'On time';
}

/**
 * Generate click sound samples
 * This creates a short percussive sound suitable for a metronome
 * Returns an array of sample values (useful for custom audio generation)
 */
export function generateClickSamples(
  sampleRate: number = 44100,
  frequency: number = 1000,
  duration: number = 0.05
): Float32Array {
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    // Simple sine wave with exponential decay
    const t = i / sampleRate;
    const envelope = Math.exp(-t * 50); // Quick decay
    samples[i] = Math.sin(2 * Math.PI * frequency * t) * envelope;
  }

  return samples;
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Linear interpolation between two values
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Calculate accuracy percentage from hits and total beats
 */
export function calculateAccuracy(hits: number, totalBeats: number): number {
  if (totalBeats === 0) return 0;
  return (hits / totalBeats) * 100;
}

/**
 * Get performance rating based on accuracy percentage
 */
export interface PerformanceRating {
  label: string;
  emoji: string;
  color: string;
}

export function getPerformanceRating(accuracy: number): PerformanceRating {
  if (accuracy >= 95) return { label: 'Master', emoji: '🏆', color: '#FFD700' };
  if (accuracy >= 90) return { label: 'Excellent', emoji: '🎯', color: '#4ade80' };
  if (accuracy >= 80) return { label: 'Great', emoji: '⭐', color: '#84cc16' };
  if (accuracy >= 70) return { label: 'Good', emoji: '👍', color: '#22c55e' };
  if (accuracy >= 60) return { label: 'Fair', emoji: '👌', color: '#facc15' };
  if (accuracy >= 50) return { label: 'Practice', emoji: '💪', color: '#fb923c' };
  if (accuracy >= 30) return { label: 'Keep Going', emoji: '🎵', color: '#f97316' };
  return { label: 'Beginner', emoji: '🌱', color: '#f87171' };
}

