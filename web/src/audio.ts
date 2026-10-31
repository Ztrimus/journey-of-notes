import { OnsetDetector, rms } from "./logic.ts";
import { detectPitch, type Pitch } from "./pitch.ts";

export interface Snapshot {
  seconds: number;
  beats: number;
  onsets: number;
  level: number;
  pitch?: Pitch | null;
}
export interface Options {
  bpm: number;
  microphone: boolean;
  click: boolean;
  threshold: number;
}

export class PracticeAudio {
  private context: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private timer = 0;
  private frame = 0;
  private cancelled = false;
  private snapshot: Snapshot = { seconds: 0, beats: 0, onsets: 0, level: 0 };

  async start(
    options: Options,
    update: (snapshot: Snapshot) => void,
    interrupted: () => void,
  ) {
    if (!window.AudioContext)
      throw new Error(
        "This browser does not support Web Audio. Try a current Safari or Chrome browser.",
      );
    const context = new AudioContext({ latencyHint: "interactive" });
    this.context = context;
    // Resume directly from the Start button gesture, before microphone permission.
    await context.resume();
    if (this.cancelled) return;
    let analyser: AnalyserNode | undefined;
    if (options.microphone) {
      if (!navigator.mediaDevices?.getUserMedia)
        throw new Error(
          "Microphone access needs HTTPS or localhost and a supported browser.",
        );
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      if (this.cancelled) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      this.stream = stream;
      stream
        .getAudioTracks()
        .forEach((track) => track.addEventListener("ended", interrupted));
      analyser = context.createAnalyser();
      analyser.fftSize = 2048;
      context.createMediaStreamSource(stream).connect(analyser);
      // Keep the analysis graph active without feeding microphone audio to speakers.
      const silent = context.createGain();
      silent.gain.value = 0;
      analyser.connect(silent).connect(context.destination);
    }
    if (this.cancelled) return;
    if (context.state !== "running")
      throw new Error(
        "Audio is paused by the browser. End this session, then press Start practice again.",
      );
    context.onstatechange = () => {
      if (!this.cancelled && context.state !== "running") interrupted();
    };
    const start = context.currentTime + (options.click ? 0.12 : 0);
    let nextBeat = start;
    let scheduled = 0;
    const detector = new OnsetDetector();
    const samples = new Float32Array(2048);
    const pitchWorkspace = new Float32Array(1025);
    const schedule = () => {
      while (nextBeat < context.currentTime + 0.1) {
        if (options.click) {
          const oscillator = context.createOscillator();
          const gain = context.createGain();
          oscillator.frequency.value = scheduled % 4 === 0 ? 1000 : 750;
          gain.gain.setValueAtTime(0, nextBeat);
          gain.gain.linearRampToValueAtTime(0.16, nextBeat + 0.002);
          gain.gain.exponentialRampToValueAtTime(0.001, nextBeat + 0.04);
          oscillator.connect(gain).connect(context.destination);
          oscillator.start(nextBeat);
          oscillator.stop(nextBeat + 0.045);
          oscillator.onended = () => {
            oscillator.disconnect();
            gain.disconnect();
          };
        }
        nextBeat += 60 / options.bpm;
        scheduled++;
      }
    };
    if (options.click) {
      schedule();
      this.timer = window.setInterval(schedule, 25);
    }
    let lastUpdate = -Infinity;
    const render = () => {
      if (this.cancelled) return;
      const now = context.currentTime;
      const seconds = Math.max(0, now - start);
      let level = 0;
      if (analyser) {
        analyser.getFloatTimeDomainData(samples);
        level = rms(samples);
        if (now >= start && detector.process(level, now, options.threshold))
          this.snapshot.onsets++;
      }
      this.snapshot = {
        ...this.snapshot,
        seconds,
        level,
        beats: now < start ? 0 : Math.floor((seconds * options.bpm) / 60) + 1,
      };
      if (now - lastUpdate > 0.06) {
        this.snapshot.pitch =
          analyser && level > 0.012
            ? detectPitch(samples, context.sampleRate, pitchWorkspace)
            : null;
        update({ ...this.snapshot });
        lastUpdate = now;
      }
      this.frame = requestAnimationFrame(render);
    };
    render();
  }

  stop(): Snapshot {
    this.cancelled = true;
    clearInterval(this.timer);
    cancelAnimationFrame(this.frame);
    this.stream?.getTracks().forEach((track) => track.stop());
    if (this.context) {
      this.context.onstatechange = null;
      void this.context.close().catch(() => {});
    }
    return { ...this.snapshot };
  }
}

export function audioError(error: unknown): string {
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError")
      return "Microphone permission was denied. Allow it in your browser’s site settings, or turn off microphone listening and try again.";
    if (error.name === "NotFoundError")
      return "No microphone was found. Connect one, or turn off microphone listening.";
    if (error.name === "NotReadableError")
      return "The microphone is unavailable. Close other apps using it and try again.";
  }
  return error instanceof Error
    ? error.message
    : "Audio could not start. Please try again.";
}
