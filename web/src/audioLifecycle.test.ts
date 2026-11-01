import test from "node:test";
import assert from "node:assert/strict";
import { PracticeAudio } from "./audio.ts";

async function withAudio(run: (h: any) => Promise<void>) {
  const saved = Object.getOwnPropertyDescriptors(globalThis);
  const frames = new Map<number, FrameRequestCallback>();
  let frame = 0;
  const contexts: any[] = [];
  class Track extends EventTarget {
    readyState = "live";
    queued: EventListener | null = null;
    addEventListener(type: string, listener: any) {
      super.addEventListener(type, listener);
      if (type === "ended") this.queued = listener;
    }
    stop() {
      this.readyState = "ended";
    }
  }
  const track = new Track();
  const tracks = [track];
  let captures = 0;
  class Context {
    state = "running";
    currentTime = 0;
    sampleRate = 44100;
    destination = {};
    onstatechange: (() => void) | null = null;
    constructor() {
      contexts.push(this);
    }
    async resume() {
      this.state = "running";
    }
    async close() {
      this.state = "closed";
      this.onstatechange?.();
    }
    createMediaStreamSource() {
      return { connect() {} };
    }
    createAnalyser() {
      return {
        fftSize: 0,
        getFloatTimeDomainData(a: Float32Array) {
          a.fill(0);
        },
        connect(node: any) {
          return node;
        },
      };
    }
    createGain() {
      return { gain: { value: 0 }, connect() {} };
    }
  }
  const values = {
    window: { AudioContext: Context },
    AudioContext: Context,
    navigator: {
      mediaDevices: {
        getUserMedia: async () => {
          const current = captures++ === 0 ? track : new Track();
          if (current !== track) tracks.push(current);
          return {
            getTracks: () => [current],
            getAudioTracks: () => [current],
          };
        },
      },
    },
    requestAnimationFrame: (fn: FrameRequestCallback) => {
      frames.set(++frame, fn);
      return frame;
    },
    cancelAnimationFrame: (id: number) => frames.delete(id),
  };
  for (const [key, value] of Object.entries(values))
    Object.defineProperty(globalThis, key, { configurable: true, value });
  try {
    await run({
      track,
      tracks,
      contexts,
      tick(seconds: number) {
        contexts.at(-1).currentTime = seconds;
        const pending = [...frames.values()];
        frames.clear();
        pending.forEach((fn) => fn(0));
      },
    });
  } finally {
    for (const key of Object.keys(values)) {
      if (saved[key]) Object.defineProperty(globalThis, key, saved[key]);
      else delete (globalThis as any)[key];
    }
  }
}
const options = { bpm: 60, microphone: true, click: false, threshold: 0.06 };
test("a queued ended callback from a stopped capture cannot interrupt a later session", async () =>
  withAudio(async ({ track, tracks }) => {
    let interruptions = 0;
    const engine = new PracticeAudio();
    await engine.start(
      options,
      () => {},
      () => interruptions++,
    );
    const queued = track.queued;
    engine.stop();
    const nextEngine = new PracticeAudio();
    await nextEngine.start(
      options,
      () => {},
      () => interruptions++,
    );
    queued.call(track, new Event("ended"));
    assert.equal(interruptions, 0);
    assert.equal(tracks[1].readyState, "live");
    nextEngine.stop();
  }));
test("active track loss reports its cause once instead of emitting repeated interruptions", async () =>
  withAudio(async ({ track }) => {
    const reasons: string[] = [];
    const engine = new PracticeAudio();
    await engine.start(
      options,
      () => {},
      (reason) => reasons.push(reason),
    );
    track.dispatchEvent(new Event("ended"));
    track.dispatchEvent(new Event("ended"));
    engine.stop();
    assert.deepEqual(reasons, ["microphone-ended"]);
  }));
test("audio suspension reports an interruption and stopped contexts cannot report another", async () =>
  withAudio(async ({ contexts }) => {
    const reasons: string[] = [];
    const engine = new PracticeAudio();
    await engine.start(
      options,
      () => {},
      (reason) => reasons.push(reason),
    );
    const context = contexts[0],
      queued = context.onstatechange;
    context.state = "suspended";
    queued();
    engine.stop();
    queued();
    assert.deepEqual(reasons, ["audio-paused"]);
  }));
test("quiet microphone capture keeps updating beyond one second without auto-ending", async () =>
  withAudio(async ({ tick }) => {
    const times: number[] = [];
    let interruptions = 0;
    const engine = new PracticeAudio();
    await engine.start(
      options,
      (s) => times.push(s.seconds),
      () => interruptions++,
    );
    for (let seconds = 0.1; seconds <= 12; seconds += 0.1) tick(seconds);
    engine.stop();
    assert.ok(times.at(-1)! > 11);
    assert.equal(interruptions, 0);
  }));
