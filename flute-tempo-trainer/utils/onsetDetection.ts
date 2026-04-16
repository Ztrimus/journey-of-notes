/**
 * Onset Detection Utilities
 * 
 * These utilities help detect when a musical note begins (onset detection)
 * by analyzing audio amplitude and looking for significant changes.
 */

export interface OnsetConfig {
  threshold: number;       // Amplitude threshold (0-1) to trigger onset
  debounceMs: number;      // Minimum time between detected onsets
  smoothingFactor: number; // 0-1, higher = smoother (more latency)
}

export const DEFAULT_ONSET_CONFIG: OnsetConfig = {
  threshold: 0.3,
  debounceMs: 100,
  smoothingFactor: 0.5,
};

/**
 * Calculate RMS (Root Mean Square) amplitude from audio samples
 */
export function calculateRMS(samples: Float32Array): number {
  if (samples.length === 0) return 0;
  
  let sum = 0;
  for (let i = 0; i < samples.length; i++) {
    sum += samples[i] * samples[i];
  }
  return Math.sqrt(sum / samples.length);
}

/**
 * Calculate peak amplitude from audio samples
 */
export function calculatePeak(samples: Float32Array): number {
  if (samples.length === 0) return 0;
  
  let peak = 0;
  for (let i = 0; i < samples.length; i++) {
    const abs = Math.abs(samples[i]);
    if (abs > peak) peak = abs;
  }
  return peak;
}

/**
 * Smooth amplitude value using exponential smoothing
 */
export function smoothAmplitude(
  currentAmplitude: number,
  previousSmoothed: number,
  smoothingFactor: number
): number {
  return previousSmoothed * smoothingFactor + currentAmplitude * (1 - smoothingFactor);
}

/**
 * Simple onset detector class that maintains state
 */
export class OnsetDetector {
  private config: OnsetConfig;
  private lastOnsetTime: number = 0;
  private previousAmplitude: number = 0;
  private smoothedAmplitude: number = 0;

  constructor(config: Partial<OnsetConfig> = {}) {
    this.config = { ...DEFAULT_ONSET_CONFIG, ...config };
  }

  /**
   * Process audio samples and detect if an onset occurred
   * Returns the timestamp of the onset, or null if no onset
   */
  process(samples: Float32Array): number | null {
    const currentTime = Date.now();
    const timeSinceLastOnset = currentTime - this.lastOnsetTime;

    // Calculate current amplitude
    const rawAmplitude = calculateRMS(samples);
    
    // Apply smoothing
    this.smoothedAmplitude = smoothAmplitude(
      rawAmplitude,
      this.smoothedAmplitude,
      this.config.smoothingFactor
    );

    // Normalize to 0-1 range (RMS for normalized audio is typically < 0.5)
    const normalizedAmplitude = Math.min(1, this.smoothedAmplitude * 3);

    // Check onset conditions:
    // 1. Above threshold
    // 2. Sufficient time since last onset (debounce)
    // 3. Rising edge (amplitude increasing) - optional, helps reduce false positives
    const isAboveThreshold = normalizedAmplitude > this.config.threshold;
    const isDebounced = timeSinceLastOnset > this.config.debounceMs;
    const isRising = normalizedAmplitude > this.previousAmplitude * 1.1;

    // Store current amplitude for next comparison
    this.previousAmplitude = normalizedAmplitude;

    if (isAboveThreshold && isDebounced && isRising) {
      this.lastOnsetTime = currentTime;
      return currentTime;
    }

    return null;
  }

  /**
   * Get the current smoothed amplitude (for visualization)
   */
  getAmplitude(): number {
    return Math.min(1, this.smoothedAmplitude * 3);
  }

  /**
   * Reset the detector state
   */
  reset(): void {
    this.lastOnsetTime = 0;
    this.previousAmplitude = 0;
    this.smoothedAmplitude = 0;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<OnsetConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Frequency-based onset detection hint
 * Flutes typically produce frequencies in the 250Hz - 2500Hz range
 */
export function isInFluteRange(frequency: number): boolean {
  return frequency >= 250 && frequency <= 2500;
}

