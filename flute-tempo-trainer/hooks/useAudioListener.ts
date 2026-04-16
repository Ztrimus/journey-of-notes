import { useState, useRef, useCallback, useEffect } from 'react';
import { Audio } from 'expo-av';
import { AudioListenerState, DEFAULT_SETTINGS } from '../types';

export function useAudioListener(settings = DEFAULT_SETTINGS) {
  const [state, setState] = useState<AudioListenerState>({
    isListening: false,
    amplitude: 0,
    noteTimestamps: [],
  });

  const recordingRef = useRef<Audio.Recording | null>(null);
  const meterIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const noteTimestampsRef = useRef<number[]>([]);
  const lastOnsetTimeRef = useRef<number>(0);
  const previousAmplitudeRef = useRef<number>(0);
  const isListeningRef = useRef<boolean>(false);
  const amplitudeHistoryRef = useRef<number[]>([]); // Track recent amplitudes for better detection

  // Process metering data to detect onsets
  const processMetering = useCallback(async () => {
    if (!recordingRef.current || !isListeningRef.current) return;

    try {
      const status = await recordingRef.current.getStatusAsync();
      
      if (!status.isRecording) {
        console.log('Recording not active');
        return;
      }

      // Get metering info (-160 to 0 dB, where 0 is loudest)
      // On Android, metering might be undefined or not updating
      const metering = status.metering ?? -160;
      
      // Convert dB to linear amplitude (0-1 scale)
      // Metering ranges from -160 (silence) to 0 (max)
      // Normalize: -160 dB = 0, -40 dB = ~0.1, 0 dB = 1.0
      let scaledAmplitude = 0;
      
      if (metering > -160) {
        // Normalize: map -160 to 0 dB range to 0 to 1
        // Use a more sensitive mapping for flute (quieter instrument)
        const normalizedDb = Math.max(-80, metering); // Clamp to -80 dB minimum
        // Convert dB to linear: 10^(dB/20)
        const linearAmplitude = Math.pow(10, normalizedDb / 20);
        // Scale more aggressively for flute (quieter than drums)
        scaledAmplitude = Math.min(1, linearAmplitude * 10);
      }

      // Always update amplitude for visualization
      setState((prev) => ({
        ...prev,
        amplitude: scaledAmplitude,
      }));

      // Onset detection with improved filtering
      const now = Date.now();
      const timeSinceLastOnset = now - lastOnsetTimeRef.current;
      
      // Maintain amplitude history (last 5 samples for trend analysis)
      amplitudeHistoryRef.current.push(scaledAmplitude);
      if (amplitudeHistoryRef.current.length > 5) {
        amplitudeHistoryRef.current.shift();
      }
      
      // Calculate average of recent amplitudes to establish baseline
      const recentAvg = amplitudeHistoryRef.current.reduce((a, b) => a + b, 0) / amplitudeHistoryRef.current.length;
      const baseline = Math.max(0.05, recentAvg * 0.8); // Baseline is 80% of recent average, minimum 5%
      
      // Stricter threshold: must be significantly above baseline AND above absolute minimum
      const MIN_ABSOLUTE_AMPLITUDE = 0.20; // Must be at least 20% amplitude
      const THRESHOLD_MULTIPLIER = 2.0; // Must be 2x the baseline
      const adjustedThreshold = Math.max(MIN_ABSOLUTE_AMPLITUDE, baseline * THRESHOLD_MULTIPLIER);
      
      // Check if this is a new onset with stricter criteria
      const isAboveThreshold = scaledAmplitude > adjustedThreshold;
      const isAboveMinimum = scaledAmplitude > MIN_ABSOLUTE_AMPLITUDE;
      
      // Stricter rising edge: must increase by at least 25% from previous
      const isRising = scaledAmplitude > previousAmplitudeRef.current * 1.25;
      
      // Longer debounce for better filtering (150ms instead of 100ms)
      const debounceTime = Math.max(settings.debounceMs, 150);
      const isDebounced = timeSinceLastOnset > debounceTime;
      
      // Additional check: amplitude should be rising from baseline (not just from previous sample)
      const isRisingFromBaseline = scaledAmplitude > baseline * 1.5;

      // Debug logging (only log occasionally to avoid spam)
      if (Math.random() < 0.01) { // Log 1% of the time
        console.log(`Metering: ${metering.toFixed(1)} dB, Amplitude: ${(scaledAmplitude * 100).toFixed(1)}%, Threshold: ${(adjustedThreshold * 100).toFixed(1)}%, Baseline: ${(baseline * 100).toFixed(1)}%`);
      }

      previousAmplitudeRef.current = scaledAmplitude;

      // All conditions must be met for a valid onset
      if (isAboveThreshold && isAboveMinimum && isRising && isRisingFromBaseline && isDebounced) {
        // Onset detected!
        lastOnsetTimeRef.current = now;
        noteTimestampsRef.current.push(now);
        
        console.log(`🎵 Note detected! Amplitude: ${(scaledAmplitude * 100).toFixed(1)}%, Baseline: ${(baseline * 100).toFixed(1)}%`);

        setState((prev) => ({
          ...prev,
          amplitude: scaledAmplitude,
          noteTimestamps: [...noteTimestampsRef.current],
        }));
      }
    } catch (error) {
      console.error('Error processing metering:', error);
    }
  }, [settings]);

  // Start listening
  const start = useCallback(async () => {
    try {
      // Request permissions
      const permissionResponse = await Audio.requestPermissionsAsync();
      if (!permissionResponse.granted) {
        throw new Error('Microphone permission not granted');
      }

      // Configure audio mode for optimal recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: false, // Don't duck other audio on Android
      });

      // Create and prepare recording with metering enabled
      const recording = new Audio.Recording();
      
      const recordingOptions = {
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
        isMeteringEnabled: true, // Critical for amplitude detection
      };
      
      await recording.prepareToRecordAsync(recordingOptions);

      recordingRef.current = recording;
      
      // Start recording
      await recording.startAsync();
      
      // Verify recording started and metering is enabled
      const initialStatus = await recording.getStatusAsync();
      console.log('Recording started:', {
        isRecording: initialStatus.isRecording,
        canRecord: initialStatus.canRecord,
        metering: initialStatus.metering,
        durationMillis: initialStatus.durationMillis,
      });

      // Reset state
      noteTimestampsRef.current = [];
      lastOnsetTimeRef.current = 0;
      previousAmplitudeRef.current = 0;
      amplitudeHistoryRef.current = []; // Reset amplitude history
      isListeningRef.current = true;

      setState({
        isListening: true,
        amplitude: 0,
        noteTimestamps: [],
      });

      // Start metering interval (check ~60 times per second for better responsiveness)
      meterIntervalRef.current = setInterval(processMetering, 16);
    } catch (error) {
      console.error('Failed to start audio listener:', error);
      throw error;
    }
  }, [processMetering]);

  // Stop listening
  const stop = useCallback(async () => {
    isListeningRef.current = false;

    if (meterIntervalRef.current) {
      clearInterval(meterIntervalRef.current);
      meterIntervalRef.current = null;
    }

    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
      } catch (error) {
        // Recording might already be stopped
      }
      recordingRef.current = null;
    }

    // Reset audio mode
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
    } catch (error) {
      // Ignore errors during cleanup
    }

    setState((prev) => ({
      ...prev,
      isListening: false,
    }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isListeningRef.current = false;
      if (meterIntervalRef.current) {
        clearInterval(meterIntervalRef.current);
      }
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
      }
    };
  }, []);

  return {
    ...state,
    start,
    stop,
  };
}
