export const instrumentIds = [
  "piano",
  "flute",
  "western-flute",
  "guitar",
  "vocal",
] as const;
export type InstrumentId = (typeof instrumentIds)[number];
export const instrumentName = (id: string) =>
  ({
    piano: "Piano",
    flute: "Bansuri",
    "western-flute": "Western flute",
    guitar: "Guitar",
    vocal: "Vocals",
  })[id] || id;
