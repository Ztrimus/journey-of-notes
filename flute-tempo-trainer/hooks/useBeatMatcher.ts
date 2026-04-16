import { useCallback } from 'react';
import { DEFAULT_SETTINGS, MatchResult } from '../types';

interface BeatMatchResult {
  result: 'hit' | 'miss' | 'missed_beat';
  noteTimestamp: number | null;
  delta: number | null;
}

export function useBeatMatcher(toleranceMs = DEFAULT_SETTINGS.toleranceMs) {
  // Find the nearest note to a given beat timestamp, excluding already-consumed notes
  const findNearestNote = useCallback(
    (beatTime: number, noteTimestamps: number[], consumedNotes: Set<number>): number | null => {
      if (noteTimestamps.length === 0) return null;

      let nearestNote: number | null = null;
      let minDelta = Infinity;

      for (const noteTime of noteTimestamps) {
        // Skip notes that have already been matched to a beat
        if (consumedNotes.has(noteTime)) {
          continue;
        }

        const delta = Math.abs(noteTime - beatTime);
        if (delta < minDelta) {
          minDelta = delta;
          nearestNote = noteTime;
        }
      }

      return nearestNote;
    },
    []
  );

  // Match a single beat to the nearest note (excluding consumed notes)
  const matchBeatToNotes = useCallback(
    (beatTime: number, noteTimestamps: number[], consumedNotes: Set<number>): BeatMatchResult => {
      const nearestNote = findNearestNote(beatTime, noteTimestamps, consumedNotes);

      if (nearestNote === null) {
        // No available notes detected (all consumed or none exist)
        return {
          result: 'missed_beat',
          noteTimestamp: null,
          delta: null,
        };
      }

      const delta = Math.abs(nearestNote - beatTime);

      if (delta <= toleranceMs) {
        return {
          result: 'hit',
          noteTimestamp: nearestNote,
          delta,
        };
      } else {
        // There was a note, but too far from the beat
        return {
          result: 'miss',
          noteTimestamp: nearestNote,
          delta,
        };
      }
    },
    [findNearestNote, toleranceMs]
  );

  // Match a note to the nearest beat (alternative matching direction)
  const matchNoteToBeat = useCallback(
    (noteTime: number, beatTimestamps: number[]): BeatMatchResult => {
      if (beatTimestamps.length === 0) {
        return {
          result: 'miss',
          noteTimestamp: noteTime,
          delta: null,
        };
      }

      let nearestBeat: number | null = null;
      let minDelta = Infinity;

      for (const beatTime of beatTimestamps) {
        const delta = Math.abs(noteTime - beatTime);
        if (delta < minDelta) {
          minDelta = delta;
          nearestBeat = beatTime;
        }
      }

      if (nearestBeat === null) {
        return {
          result: 'miss',
          noteTimestamp: noteTime,
          delta: null,
        };
      }

      const delta = Math.abs(noteTime - nearestBeat);

      if (delta <= toleranceMs) {
        return {
          result: 'hit',
          noteTimestamp: noteTime,
          delta,
        };
      } else {
        return {
          result: 'miss',
          noteTimestamp: noteTime,
          delta,
        };
      }
    },
    [toleranceMs]
  );

  // Calculate overall session accuracy (with note consumption tracking)
  const calculateAccuracy = useCallback(
    (
      beatTimestamps: number[],
      noteTimestamps: number[]
    ): { hits: number; misses: number; missedBeats: number; accuracy: number } => {
      let hits = 0;
      let misses = 0;
      let missedBeats = 0;
      const consumedNotes = new Set<number>(); // Track consumed notes during calculation

      // For each beat, find if there's a matching note (excluding consumed ones)
      for (const beatTime of beatTimestamps) {
        const result = matchBeatToNotes(beatTime, noteTimestamps, consumedNotes);
        
        // Mark the note as consumed if it was a hit
        if (result.result === 'hit' && result.noteTimestamp !== null) {
          consumedNotes.add(result.noteTimestamp);
          hits++;
        } else if (result.result === 'miss') {
          misses++;
        } else {
          missedBeats++;
        }
      }

      const totalBeats = beatTimestamps.length;
      const accuracy = totalBeats > 0 ? (hits / totalBeats) * 100 : 0;

      return {
        hits,
        misses,
        missedBeats,
        accuracy,
      };
    },
    [matchBeatToNotes]
  );

  return {
    matchBeatToNotes,
    matchNoteToBeat,
    calculateAccuracy,
    findNearestNote,
  };
}

