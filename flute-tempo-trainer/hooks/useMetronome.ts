import { useState, useRef, useCallback, useEffect } from 'react';
import { Audio } from 'expo-av';
import { MetronomeState } from '../types';

export function useMetronome(bpm: number) {
  const [state, setState] = useState<MetronomeState>({
    isPlaying: false,
    currentBeat: 0,
    beatTimestamps: [],
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const beatTimestampsRef = useRef<number[]>([]);
  const currentBeatRef = useRef(0);

  // Calculate interval in ms from BPM
  const intervalMs = (60 / bpm) * 1000;

  // Load the click sound
  useEffect(() => {
    const loadSound = async () => {
      try {
        // Configure audio mode for playback
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
        });

        // Create a simple click sound using oscillator-generated audio
        // For now, we'll use a system sound approach
        const { sound } = await Audio.Sound.createAsync(
          // Using a built-in approach - we'll generate click programmatically
          { uri: 'https://cdn.freesound.org/previews/250/250551_4486188-lq.mp3' },
          { shouldPlay: false, volume: 1.0 }
        );
        soundRef.current = sound;
      } catch (error) {
        console.warn('Failed to load click sound:', error);
      }
    };

    loadSound();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  // Play click sound
  const playClick = useCallback(async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.setPositionAsync(0);
        await soundRef.current.playAsync();
      }
    } catch (error) {
      // Silently handle playback errors
    }
  }, []);

  // Tick function called on each beat
  const tick = useCallback(() => {
    const now = Date.now();
    currentBeatRef.current += 1;
    beatTimestampsRef.current.push(now);

    // Play the click
    playClick();

    // Update state
    setState((prev) => ({
      ...prev,
      currentBeat: currentBeatRef.current,
      beatTimestamps: [...beatTimestampsRef.current],
    }));
  }, [playClick]);

  // Start the metronome
  const start = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Reset state
    currentBeatRef.current = 0;
    beatTimestampsRef.current = [];

    setState({
      isPlaying: true,
      currentBeat: 0,
      beatTimestamps: [],
    });

    // First tick immediately
    tick();

    // Schedule subsequent ticks
    intervalRef.current = setInterval(tick, intervalMs);
  }, [tick, intervalMs]);

  // Stop the metronome
  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setState((prev) => ({
      ...prev,
      isPlaying: false,
    }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Update interval if BPM changes while playing
  useEffect(() => {
    if (state.isPlaying && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(tick, intervalMs);
    }
  }, [bpm, state.isPlaying, tick, intervalMs]);

  return {
    ...state,
    start,
    stop,
  };
}

