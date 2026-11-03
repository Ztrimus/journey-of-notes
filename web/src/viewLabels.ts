export function viewLabels(instrument: string) {
  return {
    sheet: instrument === "guitar" ? "TAB" : "Music sheet",
    diagram:
      instrument === "piano"
        ? "Keyboard"
        : instrument === "flute"
          ? "Holes"
          : instrument === "guitar"
            ? "Fretboard"
            : "Note cue",
  };
}
