export interface Target {
  midi: number;
  hand?: "Left" | "Right";
  finger?: number;
  swar?: string;
}
export interface Lesson {
  id: string;
  instrument: "piano" | "flute";
  title: string;
  goal: string;
  hint: string;
  targets: Target[];
  hold: number;
  source: string;
}
const seq = (midis: number[], hand?: "Left" | "Right", fingers?: number[]) =>
  midis.map((midi, i) => ({ midi, hand, finger: fingers?.[i] }));
export const piano: Lesson[] = [
  {
    id: "p1",
    instrument: "piano",
    title: "Find middle C",
    goal: "Find C4 and play it three times, releasing between notes.",
    hint: "Look just to the left of a group of two black keys. Try your right thumb.",
    targets: seq([60, 60, 60], "Right", [1, 1, 1]),
    hold: 0.35,
    source: "Original beginner drill; Exercises PDF level 1",
  },
  {
    id: "p2",
    instrument: "piano",
    title: "Find the same letter",
    goal: "Find C, then D, in two different octaves.",
    hint: "Keep the note letter in mind while moving to another group of keys.",
    targets: seq([60, 72, 60, 72, 62, 74, 62, 74], "Right"),
    hold: 0.35,
    source: "Adapted exercise structure from Exercises PDF level 1",
  },
  {
    id: "p3",
    instrument: "piano",
    title: "Five notes · right hand",
    goal: "Move from C4 to G4 and back with five fingers.",
    hint: "Keep the hand relaxed. The microphone checks pitch; you check the suggested fingers.",
    targets: seq(
      [60, 62, 64, 65, 67, 65, 64, 62, 60],
      "Right",
      [1, 2, 3, 4, 5, 4, 3, 2, 1],
    ),
    hold: 0.35,
    source: "Original contiguous five-note drill; Exercises PDF levels 3 and 5",
  },
  {
    id: "p4",
    instrument: "piano",
    title: "Five notes · left hand",
    goal: "Move from C3 to G3 and back with the left hand.",
    hint: "The left little finger is 5 on C3; the thumb is 1 on G3.",
    targets: seq(
      [48, 50, 52, 53, 55, 53, 52, 50, 48],
      "Left",
      [5, 4, 3, 2, 1, 2, 3, 4, 5],
    ),
    hold: 0.35,
    source: "Original left-hand adaptation; Exercises PDF levels 2 and 3",
  },
  {
    id: "p5",
    instrument: "piano",
    title: "Read, locate, play",
    goal: "Find mixed notes within the C4–G4 hand position.",
    hint: "Use the same five-note hand position. Let accuracy come before speed.",
    targets: seq(
      [64, 60, 67, 62, 65, 60, 64, 67],
      "Right",
      [3, 1, 5, 2, 4, 1, 3, 5],
    ),
    hold: 0.35,
    source: "Original constrained retrieval drill; Exercises PDF level 3",
  },
  {
    id: "p6",
    instrument: "piano",
    title: "One octave · C major",
    goal: "Play C4 up to C5 and return, one hand at a time.",
    hint: "Suggested right-hand scale fingering is shown. Thumb crossing still needs your own technique check.",
    targets: seq(
      [60, 62, 64, 65, 67, 69, 71, 72, 71, 69, 67, 65, 64, 62, 60],
      "Right",
      [1, 2, 3, 1, 2, 3, 4, 5, 4, 3, 2, 1, 3, 2, 1],
    ),
    hold: 0.35,
    source: "Original scale drill; Bill Hilton lesson 4 topic",
  },
];
const swars = ["Sa", "Re", "Ga", "Ma", "Pa", "Dha", "Ni", "Sa ↑"];
const steps = [0, 2, 4, 5, 7, 9, 11, 12];
export function flute(tonic: number): Lesson[] {
  const make = (indexes: number[]) =>
    indexes.map((i) => ({ midi: tonic + steps[i], swar: swars[i] }));
  return [
    {
      id: "f1",
      instrument: "flute",
      title: "A steady Sa",
      goal: "Play your chosen Sa three times; hold each for one second.",
      hint: "Start with a comfortable clear tone and breathe naturally between attempts. This checks pitch stability, not breathing technique.",
      targets: make([0, 0, 0]),
      hold: 1,
      source: "Alankar & Warm up PDF p1: long-note practice",
    },
    {
      id: "f2",
      instrument: "flute",
      title: "Sa · Re · Ga",
      goal: "Move through three swars and return slowly.",
      hint: "Change one note at a time. Hole placement depends on your flute and is not verified here.",
      targets: make([0, 1, 2, 1, 0]),
      hold: 0.5,
      source:
        "Original reduced-range drill from the supplied sargam progression",
    },
    {
      id: "f3",
      instrument: "flute",
      title: "The full ascent",
      goal: "Play Sa through upper Sa with a short steady hold.",
      hint: "Pause for a comfortable breath whenever you need one. This is self-paced, not a breath-length challenge.",
      targets: make([0, 1, 2, 3, 4, 5, 6, 7]),
      hold: 0.5,
      source: "Alankar & Warm up PDF p1: ascending swars",
    },
    {
      id: "f4",
      instrument: "flute",
      title: "Return to Sa",
      goal: "Descend from upper Sa to your starting Sa.",
      hint: "Hear each note before changing. Pitch is checked against the tonic you selected.",
      targets: make([7, 6, 5, 4, 3, 2, 1, 0]),
      hold: 0.5,
      source: "Alankar & Warm up PDF p1: descending swars",
    },
    {
      id: "f5",
      instrument: "flute",
      title: "Pairs and patterns",
      goal: "Practice overlapping pairs: Sa Re, Re Ga, Ga Ma, Ma Pa.",
      hint: "Use a gentle separate start for each note. Release before repeated notes.",
      targets: make([0, 1, 1, 2, 2, 3, 3, 4]),
      hold: 0.4,
      source:
        "Original short alankar-style pattern informed by the supplied practice pages",
    },
    {
      id: "f6",
      instrument: "flute",
      title: "Hear the octave",
      goal: "Alternate Sa and upper Sa three times.",
      hint: "Pitch feedback can distinguish octaves. Air direction, tone quality and physical technique still need self-check or a teacher.",
      targets: make([0, 7, 0, 7, 0, 7]),
      hold: 0.7,
      source: "Alankar & Warm up PDF p1–2: register changes",
    },
  ];
}
