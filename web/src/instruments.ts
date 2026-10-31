import { piano, flute, type Lesson } from "./curriculum.ts";
import { reflexLevel, type Difficulty } from "./reflex.ts";
export type InstrumentId = "piano" | "flute";
export interface InstrumentDefinition {
  id: InstrumentId;
  name: string;
  subtitle: string;
  symbol: string;
  needsTonic: boolean;
  notation: "western" | "sargam";
  levels: (tonic: number, difficulty: Difficulty) => Lesson[];
}
export const instruments: Record<InstrumentId, InstrumentDefinition> = {
  piano: {
    id: "piano",
    name: "Piano",
    subtitle: "Recognition, fingers and patterns",
    symbol: "🎹",
    needsTonic: false,
    notation: "western",
    levels: (tonic, difficulty) => [
      ...piano,
      reflexLevel("piano", difficulty, tonic),
    ],
  },
  flute: {
    id: "flute",
    name: "Bansuri",
    subtitle: "Steady tones, swars and breath",
    symbol: "♪",
    needsTonic: true,
    notation: "sargam",
    levels: (tonic, difficulty) => [
      ...flute(tonic),
      reflexLevel("flute", difficulty, tonic),
    ],
  },
};
export function orderedLevels(
  id: InstrumentId,
  tonic: number,
  difficulty: Difficulty,
) {
  const levels = instruments[id].levels(tonic, difficulty);
  const order =
    id === "piano"
      ? ["p1", "p3", "p4", "p2", "p5", "p0", "p6"]
      : ["f1", "f2", "f3", "f4", "f6", "f5", "f0"];
  return order.map((key) => levels.find((x) => x.id === key)!);
}
export type Screen =
  "home" | "map" | "prepare" | "session" | "results" | "history";
export interface Route {
  screen: Screen;
  instrument: InstrumentId;
  levelId?: string;
}
export function parseRoute(hash: string): Route {
  const [name, id, levelId] = hash.replace(/^#\/?/, "").split("/");
  const screens = ["home", "map", "prepare", "session", "results", "history"];
  return {
    screen: screens.includes(name) ? (name as Screen) : "home",
    instrument: id === "flute" ? "flute" : "piano",
    levelId: levelId && /^[pf][0-6]$/.test(levelId) ? levelId : undefined,
  };
}
export const routeHash = (route: Route) =>
  `#/${route.screen}/${route.instrument}${route.levelId ? `/${route.levelId}` : ""}`;
