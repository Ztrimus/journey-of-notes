import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { createRoot } from "react-dom/client";
import { noteName } from "./pitch";
import { formatTime } from "./logic";
import {
  isReflex,
  reflexLevel,
  type Difficulty,
  type DisplayMode,
} from "./reflex";
import {
  instruments,
  orderedLevels,
  parseRoute,
  routeHash,
  type InstrumentId,
  type Route,
  type Screen,
} from "./instruments";
import {
  loadHistory,
  saveHistory,
  clearSavedHistory,
  parseHistory,
  type SessionRecord,
} from "./history";
import { mergeHistory } from "./metrics";
import { usePractice, type PracticeOptions } from "./usePractice";
import { TargetDisplay } from "./Prompt";
import { TonicSetup } from "./TonicSetup";
import { ActivityMap } from "./ActivityMap";
import { Results, AttemptList } from "./Results";
import { HistoryPanel, ClearHistoryButton } from "./HistoryPanel";
import { instrumentName } from "./catalog";
import { heardName } from "./bansuri";
import type { Lesson } from "./curriculum";
import "./style.css";
function App() {
  const [route, setRoute] = useState<Route>(() => {
    const r = parseRoute(location.hash);
    return r.screen === "session" || r.screen === "results"
      ? { ...r, screen: "prepare" }
      : r;
  });
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [method, setMethod] = useState<"microphone" | "self-check">(
    "microphone",
  );
  const [display, setDisplay] = useState<DisplayMode>("staff");
  const [hints, setHints] = useState(false);
  const [notation, setNotation] = useState<"western" | "sargam">(() =>
    parseRoute(location.hash).instrument === "flute" ? "sargam" : "western",
  );
  const [tonic, setTonic] = useState(
    parseRoute(location.hash).instrument === "vocal" ? 60 : 67,
  );
  const [tonicConfirmed, setTonicConfirmed] = useState(false);
  const [tonicListening, setTonicListening] = useState(false);
  const [records, setRecords] = useState<SessionRecord[]>([]);
  const [summary, setSummary] = useState<SessionRecord | null>(null);
  const [storageMessage, setStorageMessage] = useState("");
  const [importMessage, setImportMessage] = useState("");
  const [options, setOptions] = useState<PracticeOptions | null>(null);
  const suppressResult = useRef(false);
  const readable = useRef(true);
  const recordStore = useRef<SessionRecord[]>([]);
  const main = useRef<HTMLElement | null>(null);
  const prompt = useRef<HTMLDivElement | null>(null);
  const instrument = instruments[route.instrument];
  const levels = useMemo(
    () => orderedLevels(route.instrument, tonic, difficulty),
    [route.instrument, tonic, difficulty],
  );
  const chosen =
    levels.find((l) => l.id === route.levelId) ||
    levels.find((l) => l.id.endsWith("0")) ||
    levels[0];
  function go(
    screen: Screen,
    id: InstrumentId = route.instrument,
    levelId?: string,
  ) {
    const r = { screen, instrument: id, levelId };
    history.pushState(null, "", routeHash(r));
    setRoute(r);
  }
  function persist(next: SessionRecord[]) {
    recordStore.current = next;
    setRecords(next);
    if (!readable.current) {
      setStorageMessage(
        "Existing browser history could not be read. Export new results before leaving.",
      );
      return;
    }
    try {
      saveHistory(next);
    } catch {
      setStorageMessage(
        "Browser storage is unavailable or full. Export your results to keep them.",
      );
    }
  }
  const practice = usePractice((record) => {
    setSummary(record);
    const next = [record, ...recordStore.current]
      .sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt))
      .slice(0, 100);
    recordStore.current = next;
    setRecords(next);
    if (readable.current) {
      try {
        saveHistory(next);
      } catch {
        setStorageMessage(
          "Your latest result could not be saved. Export it to keep a copy.",
        );
      }
    } else
      setStorageMessage(
        "New results are not saved because existing history is unreadable. Export them to preserve them.",
      );
    if (!suppressResult.current) {
      if (document.visibilityState === "hidden")
        setRoute({
          screen: "results",
          instrument: record.instrument as InstrumentId,
          levelId: record.lessonId,
        });
      else go("results", record.instrument as InstrumentId, record.lessonId);
    }
  });
  const phase = useRef(practice.phase);
  phase.current = practice.phase;
  useEffect(() => {
    try {
      const saved = loadHistory();
      recordStore.current = saved;
      setRecords(saved);
      const latest = saved.find(
        (r) =>
          r.instrument === parseRoute(location.hash).instrument &&
          r.tonic !== null,
      );
      if (latest?.tonic !== null && latest?.tonic !== undefined)
        setTonic(latest.tonic);
    } catch {
      readable.current = false;
      setStorageMessage(
        "Saved history could not be read. It has not been overwritten. New results can still be exported.",
      );
    }
  }, []);
  useEffect(() => {
    const back = () => {
      if (phase.current !== "idle") {
        suppressResult.current = true;
        practice.finish();
        suppressResult.current = false;
      }
      const r = parseRoute(location.hash);
      setRoute(r.screen === "session" ? { ...r, screen: "prepare" } : r);
    };
    addEventListener("popstate", back);
    addEventListener("hashchange", back);
    return () => {
      removeEventListener("popstate", back);
      removeEventListener("hashchange", back);
    };
  }, []);
  useEffect(() => {
    if (
      route.screen !== "results" &&
      instruments[route.instrument].needsTonic
    ) {
      const saved = recordStore.current.find(
        (r) => r.instrument === route.instrument && r.tonic !== null,
      );
      setTonic(saved?.tonic ?? (route.instrument === "vocal" ? 60 : 67));
      setTonicConfirmed(false);
    }
  }, [route.instrument]);
  useEffect(() => {
    if (route.screen === "prepare") {
      setMethod("microphone");
      setDisplay("staff");
      setHints(false);
      setNotation(instruments[route.instrument].notation);
    }
  }, [route.screen, route.instrument, route.levelId]);
  useEffect(() => {
    document.title = `${{ home: "Practice gym", flutes: "Choose a flute", about: "About", map: `${instrument.name} practice map`, prepare: "Prepare your set", session: "Practice", results: "Your results", history: "Practice history" }[route.screen]} — Journey of Notes`;
    if (route.screen !== "session") {
      window.scrollTo({ top: 0, behavior: "auto" });
      const heading = main.current?.querySelector<HTMLElement>("h1");
      heading?.focus({ preventScroll: true });
    }
  }, [route.screen, route.instrument, route.levelId]);
  useEffect(() => {
    if (route.screen !== "session" || practice.phase !== "running") return;
    let second = 0;
    prompt.current?.focus({ preventScroll: true });
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => practice.presented());
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [route.screen, practice.phase, practice.index, display]);
  function chooseInstrument(id: InstrumentId) {
    if (instruments[id].needsTonic) {
      const latest = recordStore.current.find(
        (r) => r.instrument === id && r.tonic !== null,
      );
      setTonic(latest?.tonic ?? (id === "vocal" ? 60 : 67));
      setTonicConfirmed(false);
    }
    setMethod("microphone");
    setDisplay("staff");
    setNotation(instruments[id].notation);
    go("map", id);
  }
  function prepare(level: Lesson) {
    setOptions(null);
    go("prepare", route.instrument, level.id);
  }
  function start() {
    if (instrument.needsTonic && method === "microphone" && !tonicConfirmed)
      return;
    const lesson = isReflex(chosen.id)
      ? reflexLevel(route.instrument, difficulty, tonic)
      : chosen;
    const config: PracticeOptions = {
      lesson,
      method,
      display,
      hints,
      notation: instrument.needsTonic ? notation : "western",
      difficulty,
      tonic: instrument.needsTonic ? tonic : null,
    };
    setOptions(config);
    go("session", route.instrument, lesson.id);
    void practice.start(config);
  }
  function changeView(value: DisplayMode) {
    setDisplay(value);
    practice.changeDisplay(value);
  }
  function clearHistory() {
    try {
      clearSavedHistory();
      recordStore.current = [];
      setRecords([]);
      setSummary(null);
      readable.current = true;
      setStorageMessage("");
      setImportMessage("History cleared in this browser.");
      return true;
    } catch {
      setStorageMessage(
        "History could not be cleared. Existing records are unchanged.",
      );
      return false;
    }
  }
  function exportData() {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            version: 1,
            exportedAt: new Date().toISOString(),
            sessions: records,
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "journey-of-notes-practice.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function importData(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      if (file.size > 5 * 1024 * 1024)
        throw new Error("Choose a backup smaller than 5 MB.");
      const data = JSON.parse(await file.text());
      if (data.version !== 1 || !Array.isArray(data.sessions))
        throw new Error("This is not a supported Journey of Notes backup.");
      const incoming = parseHistory(JSON.stringify(data.sessions));
      const next = mergeHistory(records, incoming);
      persist(next);
      setImportMessage(
        `Backup merged. ${next.length} sessions are available; existing session IDs were preserved.`,
      );
    } catch (e) {
      setImportMessage(
        e instanceof Error
          ? e.message
          : "The backup could not be read. Existing history is unchanged.",
      );
    }
    event.target.value = "";
  }
  const live = route.screen === "session" && options;
  const activeLevel = options?.lesson;
  const activeTarget = activeLevel?.targets[practice.index];
  const blocked =
    tonicListening ||
    (instrument.needsTonic && method === "microphone" && !tonicConfirmed);
  const todaySets = records.filter(
    (r) =>
      r.instrument === route.instrument &&
      new Date(r.startedAt).toDateString() === new Date().toDateString() &&
      r.attempts.length > 0,
  ).length;
  return (
    <>
      <a
        className="skip"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          main.current?.focus();
        }}
      >
        Skip to content
      </a>
      <div className={`app-shell ${live ? "in-session" : ""}`}>
        <header className="site-header">
          {live ? (
            <span className="brand">
              <span className="brand-mark" aria-hidden="true">
                ♮
              </span>
              Journey of Notes
            </span>
          ) : (
            <a
              className="brand"
              href="#/home/piano"
              onClick={(e) => {
                e.preventDefault();
                go("home");
              }}
            >
              <span className="brand-mark" aria-hidden="true">
                ♮
              </span>
              Journey of Notes
            </a>
          )}
          {!live && (
            <nav aria-label="Main">
              <a
                href={`#/history/${route.instrument}`}
                onClick={(e) => {
                  e.preventDefault();
                  go("history");
                }}
              >
                History <span className="count-dot">{records.length}</span>
              </a>
            </nav>
          )}
          {live && (
            <button className="quiet-button" onClick={() => practice.finish()}>
              End set
            </button>
          )}
        </header>
        <main
          id="main"
          tabIndex={-1}
          ref={main}
          className={`screen screen-${route.screen}`}
          key={`${route.screen}-${route.instrument}`}
        >
          {storageMessage && (
            <p className="notice" role="alert">
              {storageMessage}
            </p>
          )}
          {route.screen === "home" && (
            <>
              <section className="home-hero">
                <p className="eyebrow">A LITTLE PRACTICE. EVERY DAY.</p>
                <h1 tabIndex={-1}>
                  Build your
                  <br />
                  <em>musical muscle.</em>
                </h1>
                <p>
                  A quiet space to train your ear, sharpen your reflexes, and
                  keep your skills moving.
                </p>
                <p className="pilot-label">
                  Public pilot · One note at a time. Pitch accuracy and response
                  estimates vary by device.
                </p>
                <div className="hero-notes" aria-hidden="true">
                  <span>Sa</span>
                  <span>♪</span>
                  <span>C</span>
                  <span>Re</span>
                </div>
              </section>
              <section
                className="instrument-section"
                aria-labelledby="instrument-title"
              >
                <h2 id="instrument-title" tabIndex={-1}>
                  What will you play today?
                </h2>
                <div className="instrument-grid">
                  {[
                    instruments.piano,
                    instruments.guitar,
                    {
                      ...instruments.flute,
                      name: "Flute",
                      subtitle: "Bansuri or Western concert flute",
                    },
                    instruments.vocal,
                  ].map((item) => (
                    <button
                      className="instrument-choice"
                      key={item.id}
                      onClick={() =>
                        item.id === "flute"
                          ? go("flutes")
                          : chooseInstrument(item.id)
                      }
                    >
                      <span
                        className={`instrument-symbol ${item.id}`}
                        aria-hidden="true"
                      >
                        {item.symbol}
                      </span>
                      <strong>{item.name}</strong>
                      <small>{item.subtitle}</small>
                    </button>
                  ))}
                </div>
                <p className="small muted">
                  Practice first. No account needed. Your history stays in this
                  browser.
                </p>
              </section>
            </>
          )}
          {route.screen === "flutes" && (
            <>
              <button className="back-link" onClick={() => go("home")}>
                ← Instruments
              </button>
              <h1 tabIndex={-1}>Which flute will you play?</h1>
              <p>Each has its own notation, setup and fingering conventions.</p>
              <div className="instrument-grid">
                {[instruments.flute, instruments["western-flute"]].map(
                  (item) => (
                    <button
                      key={item.id}
                      className="instrument-choice"
                      onClick={() => chooseInstrument(item.id)}
                    >
                      <span aria-hidden="true" className="instrument-symbol">
                        ♪
                      </span>
                      <strong>{item.name}</strong>
                      <small>{item.subtitle}</small>
                    </button>
                  ),
                )}
              </div>
            </>
          )}
          {route.screen === "about" && (
            <>
              <h1 tabIndex={-1}>Small sets. Musical growth.</h1>
              <p>
                Journey of Notes is a personal project by Saurabh Zinjad: a
                practice gym for repeatable music skills, available in your
                browser.
              </p>
              <h2>A public pilot</h2>
              <p>
                Piano and bansuri have guided and random pitch drills. Guitar, C
                concert flute and vocals have limited starter drills. We check
                one pitch at a time; this is not a full music course or a
                substitute for a teacher.
              </p>
              <p>
                Microphone processing stays in this browser. It cannot verify
                which instrument, hand or finger made a sound, breath technique,
                vocal health, chords or rhythm. Response times remain
                approximate and uncalibrated.
              </p>
              <h2>Your history belongs to this browser</h2>
              <p>
                No account is needed. Export/import transfers a backup manually;
                there is no automatic cloud sync, analytics or session replay.
              </p>
              <h2>Help shape the next set</h2>
              <p>
                <a href="https://github.com/Ztrimus/journey-of-notes/issues/new?title=Pilot%20feedback">
                  Send feedback on GitHub
                </a>{" "}
                (public; GitHub account required). Include device/browser,
                instrument, drill, expected and heard note, and whether the
                problem repeats. Do not include private recordings or
                credentials.
              </p>
              <p>
                <a href="https://www.nidcd.nih.gov/health/taking-care-your-voice">
                  Voice care guidance
                </a>{" "}
                ·{" "}
                <a href="https://bansuri.com/learn-bansuri/swaras-symbols/">
                  Bansuri fingering convention
                </a>
              </p>
            </>
          )}
          {route.screen === "map" && (
            <>
              <button className="back-link" onClick={() => go("home")}>
                ← Instruments
              </button>
              <div className="page-intro">
                <p className="eyebrow">YOUR PRACTICE GYM</p>
                <h1 tabIndex={-1}>
                  {instrument.name},<br />a little stronger each day.
                </h1>
                <p>Choose a skill. Repeat it whenever you need it.</p>
              </div>
              <div className="map-summary">
                <span>
                  <strong>{todaySets}</strong> sets today
                </span>
                <span className="map-legend">
                  Rings show recent first-try pitch matches.
                </span>
              </div>
              <ActivityMap
                levels={levels}
                history={records}
                onChoose={prepare}
              />
              <details className="explanation">
                <summary>How the map works</summary>
                <p>
                  Rings show first detected attempt accuracy over up to 30
                  recent comparable targets, with the evidence count below. An
                  empty neutral ring means no measured evidence; 0% means
                  measured attempts did not match. A full ring is not permanent
                  completion. Active days are separate. Missing days do not
                  reduce accuracy automatically. Skills remain available to
                  repeat; no score estimates innate talent.
                </p>
              </details>
            </>
          )}
          {route.screen === "prepare" && (
            <>
              <button className="back-link" onClick={() => go("map")}>
                ← Practice map
              </button>
              <div className="page-intro">
                <p className="eyebrow">PREPARE YOUR SET</p>
                <h1 tabIndex={-1}>{chosen.title}</h1>
                <p>{chosen.goal}</p>
              </div>
              <div className="briefing">
                <span aria-hidden="true">◎</span>
                <p>{chosen.hint}</p>
              </div>
              <div className="settings-grid">
                {isReflex(chosen.id) && (
                  <div className="wide-setting">
                    <label htmlFor="challenge">Challenge</label>
                    <select
                      id="challenge"
                      value={difficulty}
                      onChange={(e) =>
                        setDifficulty(e.target.value as Difficulty)
                      }
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                )}
                <div>
                  <label htmlFor="feedback">Feedback</label>
                  <select
                    id="feedback"
                    value={method}
                    onChange={(e) => setMethod(e.target.value as typeof method)}
                  >
                    <option value="microphone">Microphone</option>
                    <option value="self-check">Silent practice</option>
                  </select>
                </div>
                <ViewSelect
                  id="prepare-view"
                  value={display}
                  onChange={setDisplay}
                  instrument={route.instrument}
                />
                {instrument.needsTonic && (
                  <div className="wide-setting">
                    <label htmlFor="notation">Notation</label>
                    <select
                      id="notation"
                      value={notation}
                      onChange={(e) =>
                        setNotation(e.target.value as typeof notation)
                      }
                    >
                      <option value="sargam">Sargam · Sa Re Ga</option>
                      <option value="western">Western sheet · C D E</option>
                    </select>
                  </div>
                )}
              </div>
              {display === "staff" && (
                <label className="check">
                  <input
                    type="checkbox"
                    checked={hints}
                    onChange={(e) => setHints(e.target.checked)}
                  />
                  Show note-name hints
                </label>
              )}
              {instrument.needsTonic && method === "microphone" && (
                <TonicSetup
                  tonic={tonic}
                  confirmed={tonicConfirmed}
                  onChange={setTonic}
                  onConfirm={setTonicConfirmed}
                  onListening={setTonicListening}
                  vocal={route.instrument === "vocal"}
                />
              )}
              <button
                className="primary start-set"
                disabled={blocked}
                aria-describedby="start-help"
                onClick={start}
              >
                Start practice <span aria-hidden="true">→</span>
              </button>
              <p id="start-help" className="small muted">
                {tonicListening
                  ? "Finish or stop Sa detection before starting."
                  : blocked
                    ? "Confirm your comfortable starting note above to enable practice."
                    : method === "microphone"
                      ? "Your browser asks for microphone permission after you press Start."
                      : "No microphone. You will mark each note practiced yourself."}
              </p>
              <details className="explanation">
                <summary>Before you play</summary>
                <p>
                  {isReflex(chosen.id)
                    ? route.instrument === "piano"
                      ? difficulty === "easy"
                        ? "Easy uses C4, D4 and E4 with the right thumb. Medium adds the C4–G4 five-finger position. Hard mixes C3–G5 and hands."
                        : "Medium widens the note pool. Hard adds lower and higher register positions. All sets remain available to repeat."
                      : "Recall starts with a small note pool. Guitar uses three open treble strings; vocals use a comfortable starting note."
                    : "This is a self-paced pitch exercise. Its order is deliberate; it does not score surprise-note response time."}
                </p>
                <p>
                  Use headphones and one note at a time. First sound and
                  physical technique need your judgment or a teacher; the
                  microphone checks sound, not fingers or lip placement.
                </p>
                <p>
                  Pitch trial: A4=440 Hz, within ±45 cents, held for{" "}
                  {chosen.hold}s. Response estimates exclude that confirmation
                  hold and remain uncalibrated.
                </p>
              </details>
              <details className="explanation">
                <summary>How does note detection work?</summary>
                <p>
                  With your permission, your microphone sends sound to Web Audio
                  in this browser. A YIN-style algorithm finds the repeating
                  waveform, estimates its frequency, then maps it to a note and
                  octave. No microphone audio is recorded or uploaded.
                </p>
                <p>
                  Heard shows the latest estimate. A counted attempt needs a
                  stable pitch: a wrong note for about 0.3 seconds, or the
                  target held for this exercise’s confirmation time. Fast notes
                  can be missed. One held note counts once. Play one note at a
                  time; chords, noise and harmonics can confuse this prototype.
                </p>
                <p>
                  Cents measure fine tuning: 100 cents equals one semitone, such
                  as C to C♯. Positive means higher (sharp), negative means
                  lower (flat), and zero means on the reference pitch. The
                  ±45-cent trial tolerance is not a professional tuning target.
                </p>
              </details>
            </>
          )}
          {live && activeLevel && activeTarget && (
            <>
              <h1 className="sr-only" tabIndex={-1}>
                {activeLevel.title} practice
              </h1>
              <div className="session-top">
                <div>
                  <p className="eyebrow">{activeLevel.title}</p>
                  <span className="small muted">
                    {practice.index + 1} / {activeLevel.targets.length}
                  </span>
                </div>
                <ViewSelect
                  id="session-view"
                  value={display}
                  onChange={changeView}
                  instrument={route.instrument}
                />
              </div>
              <progress
                className="set-progress"
                aria-label="Set progress"
                value={practice.index + (practice.accepted ? 1 : 0)}
                max={activeLevel.targets.length}
              />
              <div
                className={`session-prompt state-${practice.outcome}`}
                ref={prompt}
                role="group"
                tabIndex={-1}
                aria-label="Current practice prompt"
              >
                {practice.phase === "running" ? (
                  <TargetDisplay
                    target={activeTarget}
                    instrument={route.instrument}
                    display={display}
                    hints={hints}
                    notation={options.notation}
                    tonic={tonic}
                    compact
                  />
                ) : (
                  <div className="waiting-prompt">
                    <span aria-hidden="true">♪</span>
                    <h2>
                      {practice.error
                        ? "Let’s try that again."
                        : "Getting ready to listen…"}
                    </h2>
                  </div>
                )}
              </div>
              <div
                className={`practice-feedback ${practice.outcome}`}
                role="status"
              >
                <span aria-hidden="true">
                  {
                    { waiting: "○", correct: "✓", wrong: "×", unclear: "?" }[
                      practice.outcome
                    ]
                  }
                </span>
                <p>{practice.feedback}</p>
              </div>
              {method === "microphone" && (
                <div className="heard-row">
                  <span>Heard</span>
                  <strong>
                    {practice.snapshot.pitch &&
                    practice.snapshot.pitch.confidence >= 0.9
                      ? heardName(
                          practice.snapshot.pitch.midi,
                          route.instrument,
                          options.tonic,
                          options.notation,
                        )
                      : "—"}
                  </strong>
                  <meter
                    aria-label="Microphone level"
                    min="0"
                    max="1"
                    value={Math.min(1, practice.snapshot.level * 5)}
                  />
                </div>
              )}
              {practice.error && (
                <div className="notice" role="alert">
                  <p>{practice.error}</p>
                  <button onClick={() => void practice.start(options)}>
                    Retry microphone
                  </button>
                  <button
                    onClick={() => {
                      const silent = {
                        ...options,
                        method: "self-check" as const,
                      };
                      setMethod("self-check");
                      setOptions(silent);
                      void practice.start(silent);
                    }}
                  >
                    Practice silently
                  </button>
                </div>
              )}
              <div className="session-actions">
                {practice.phase === "running" && method === "self-check" && (
                  <button
                    className="primary"
                    onClick={() => practice.manual("self-reported")}
                  >
                    Mark practiced
                  </button>
                )}
                {practice.accepted && (
                  <button className="primary" onClick={practice.next}>
                    Next note
                  </button>
                )}
                {practice.phase === "running" && !practice.accepted && (
                  <button
                    className="quiet-button"
                    onClick={() => practice.manual("skipped")}
                  >
                    Skip
                  </button>
                )}
                <span className="small muted">
                  {formatTime(practice.snapshot.seconds)}
                </span>
              </div>
              <p className="session-footnote">
                {method === "microphone"
                  ? "Single-note pitch trial · hand and finger are not verified."
                  : "Silent practice · self-reported, no playing-speed score."}
              </p>
            </>
          )}
          {route.screen === "session" && !options && (
            <>
              <h1 tabIndex={-1}>Choose your next set.</h1>
              <button className="primary" onClick={() => go("prepare")}>
                Prepare practice
              </button>
            </>
          )}
          {route.screen === "results" && (
            <>
              {summary ? (
                <>
                  <Results record={summary} history={records} />
                  <div className="result-actions">
                    <button
                      className="primary"
                      onClick={() =>
                        go(
                          "prepare",
                          summary.instrument as InstrumentId,
                          summary.lessonId,
                        )
                      }
                    >
                      Repeat this skill ↻
                    </button>
                    {(() => {
                      const choices = orderedLevels(
                        summary.instrument as InstrumentId,
                        summary.tonic ?? tonic,
                        difficulty,
                      );
                      const next =
                        choices[
                          choices.findIndex((l) => l.id === summary.lessonId) +
                            1
                        ];
                      return next ? (
                        <button
                          onClick={() =>
                            go(
                              "prepare",
                              summary.instrument as InstrumentId,
                              next.id,
                            )
                          }
                        >
                          Next skill
                        </button>
                      ) : null;
                    })()}
                    <button
                      onClick={() =>
                        go("map", summary.instrument as InstrumentId)
                      }
                    >
                      Practice map
                    </button>
                  </div>
                  <details className="explanation">
                    <summary>
                      Individual attempts ({summary.attempts.length})
                    </summary>
                    <AttemptList record={summary} />
                  </details>
                </>
              ) : (
                <>
                  <h1 tabIndex={-1}>Your practice history</h1>
                  <button className="primary" onClick={() => go("history")}>
                    Open saved sets
                  </button>
                </>
              )}
            </>
          )}
          {route.screen === "history" && (
            <>
              <button className="back-link" onClick={() => go("map")}>
                ← Practice map
              </button>
              <div className="page-intro">
                <p className="eyebrow">KEEP YOUR MOMENTUM</p>
                <h1 tabIndex={-1}>Practice history.</h1>
                <p>
                  Saved in this browser. Bring a backup when you move to another
                  device or website.
                </p>
              </div>
              <div className="backup-actions">
                <button disabled={!records.length} onClick={exportData}>
                  Export backup
                </button>
                <ClearHistoryButton
                  disabled={!records.length && readable.current}
                  onClear={clearHistory}
                />
                <label className="file-button">
                  Import backup
                  <input
                    type="file"
                    accept="application/json,.json"
                    onChange={importData}
                  />
                </label>
              </div>
              <p className="small muted" role="status">
                {importMessage ||
                  "Latest 100 sessions retained. Browser clearing or private mode can remove data. No audio is stored."}
              </p>
              <HistoryPanel
                records={records}
                onReview={(record) => {
                  if (record.tonic !== null) {
                    setTonic(record.tonic);
                    setTonicConfirmed(false);
                  }
                  setDifficulty(record.difficulty ?? "easy");
                  setSummary(record);
                  go(
                    "results",
                    record.instrument as InstrumentId,
                    record.lessonId,
                  );
                }}
              />
            </>
          )}
        </main>
        {!live && (
          <footer>
            <span>
              © {new Date().getFullYear()} Saurabh Zinjad · Journey of Notes
            </span>
            <a href="https://ztrimus.github.io/journey-of-notes/web-privacy.html">
              Privacy
            </a>
            <a
              href="#/about/piano"
              onClick={(e) => {
                e.preventDefault();
                go("about");
              }}
            >
              About
            </a>
            <a href="https://github.com/Ztrimus/journey-of-notes/issues/new?title=Pilot%20feedback">
              Feedback
            </a>
          </footer>
        )}
      </div>
    </>
  );
}
function ViewSelect({
  id,
  value,
  onChange,
  instrument,
}: {
  id: string;
  value: DisplayMode;
  onChange: (v: DisplayMode) => void;
  instrument: string;
}) {
  return (
    <div className="compact-view">
      <label htmlFor={id}>View</label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as DisplayMode)}
      >
        <option value="staff">Music sheet</option>
        <option value="keyboard">
          {instrument === "piano"
            ? "Key diagram"
            : instrument === "flute"
              ? "Hole diagram"
              : instrument === "guitar"
                ? "Fretboard"
                : "Note cue"}
        </option>
        <option value="both">Both</option>
      </select>
    </div>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
