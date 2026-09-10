/**
 * BarberAudioEngine
 * Dual-engine audio player for barbershop instrumental music:
 * 1) HTML5 Audio for streaming royalty-free tracks
 * 2) Procedural Web Audio API Synthesizer that generates live Reggaetón Dembow,
 *    Hip-Hop Boom-Bap, Latin Lounge, Afrobeat & Neo-Soul beats 100% offline with zero latency.
 */

import { InstrumentalTrack } from '../types';

export class BarberAudioEngine {
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private currentHtmlAudio: HTMLAudioElement | null = null;

  private isPlaying = false;
  private isMuted = false;
  private volume = 0.7; // 0 to 1
  private currentTrack: InstrumentalTrack | null = null;
  private playMode: 'streaming' | 'procedural' = 'procedural';

  // Procedural Synth scheduler variables
  private synthIntervalId: number | null = null;
  private currentStep = 0;
  private bpm = 95;
  private lookaheadMs = 25;
  private scheduleAheadSec = 0.1;
  private nextNoteTime = 0;

  // Listeners
  private onStateChangeCallbacks: ((playing: boolean) => void)[] = [];
  private onTrackEndedCallbacks: (() => void)[] = [];

  constructor() {
    // Lazy init audio context on user interaction
  }

  /**
   * Initializes the AudioContext safely on user gesture
   */
  private initAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioContextClass =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();

      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.8;

      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.audioCtx.currentTime);

      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.audioCtx.destination);
    }

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch((err) => console.warn('AudioContext resume failed:', err));
    }

    return this.audioCtx;
  }

  public getVolume(): number {
    return this.volume;
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.audioCtx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
    }
    if (this.currentHtmlAudio && !this.isMuted) {
      this.currentHtmlAudio.volume = this.volume;
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    const target = this.isMuted ? 0 : this.volume;

    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(target, this.audioCtx.currentTime);
    }
    if (this.currentHtmlAudio) {
      this.currentHtmlAudio.muted = this.isMuted;
    }
    return this.isMuted;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentTrack(): InstrumentalTrack | null {
    return this.currentTrack;
  }

  public getPlayMode(): 'streaming' | 'procedural' {
    return this.playMode;
  }

  /**
   * Returns frequency byte data for equalizer animation
   */
  public getEqualizerData(): Uint8Array {
    if (!this.analyser || !this.isPlaying) {
      return new Uint8Array(16);
    }
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    return dataArray.slice(0, 16);
  }

  /**
   * Main playback router: plays the given track
   */
  public async playTrack(track: InstrumentalTrack, forceProcedural = false): Promise<void> {
    const ctx = this.initAudioContext();
    this.stopCurrent();

    this.currentTrack = track;
    this.bpm = track.bpm || 95;

    // If track has an audio URL and forceProcedural is false, try streaming first
    if (track.audioUrl && !forceProcedural) {
      try {
        const success = await this.playStreamingAudio(track.audioUrl);
        if (success) {
          this.playMode = 'streaming';
          this.isPlaying = true;
          this.notifyState(true);
          return;
        }
      } catch (e) {
        console.warn('Streaming audio failed or blocked, falling back to procedural synth beat:', e);
      }
    }

    // Fallback or explicit choice: Procedural Live Synth Beat Generator
    this.playMode = 'procedural';
    this.startProceduralBeat(track.proceduralStyle, ctx);
    this.isPlaying = true;
    this.notifyState(true);
  }

  /**
   * Toggle Pause / Resume
   */
  public togglePlayPause(): boolean {
    if (!this.currentTrack) return false;

    if (this.isPlaying) {
      this.pause();
      return false;
    } else {
      this.resume();
      return true;
    }
  }

  public pause(): void {
    if (this.currentHtmlAudio) {
      this.currentHtmlAudio.pause();
    }
    this.stopProceduralScheduler();
    this.isPlaying = false;
    this.notifyState(false);
  }

  public resume(): void {
    if (!this.currentTrack) return;
    this.initAudioContext();

    if (this.playMode === 'streaming' && this.currentHtmlAudio) {
      this.currentHtmlAudio.play().catch(() => {
        // If stream resume failed, fallback to procedural beat
        this.playMode = 'procedural';
        this.startProceduralBeat(this.currentTrack!.proceduralStyle, this.audioCtx!);
      });
    } else if (this.audioCtx) {
      this.startProceduralBeat(this.currentTrack.proceduralStyle, this.audioCtx);
    }
    this.isPlaying = true;
    this.notifyState(true);
  }

  public stop(): void {
    this.stopCurrent();
    this.isPlaying = false;
    this.notifyState(false);
  }

  private stopCurrent(): void {
    if (this.currentHtmlAudio) {
      this.currentHtmlAudio.pause();
      this.currentHtmlAudio.src = '';
      this.currentHtmlAudio = null;
    }
    this.stopProceduralScheduler();
  }

  // =================================================================
  // STREAMING HTML5 AUDIO ENGINE
  // =================================================================
  private playStreamingAudio(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.crossOrigin = 'anonymous';
      audio.src = url;
      audio.volume = this.isMuted ? 0 : this.volume;
      audio.preload = 'auto';

      let timeoutId = window.setTimeout(() => {
        resolve(false);
      }, 3500); // 3.5s timeout before graceful fallback to live synthesizer

      audio.oncanplay = () => {
        clearTimeout(timeoutId);
        // Connect to Web Audio Analyser if possible for visualizer
        try {
          if (this.audioCtx && this.analyser) {
            const source = this.audioCtx.createMediaElementSource(audio);
            source.connect(this.masterGain || this.audioCtx.destination);
          }
        } catch {
          // Some browsers restrict createMediaElementSource on cross-origin
        }

        audio
          .play()
          .then(() => {
            this.currentHtmlAudio = audio;
            resolve(true);
          })
          .catch(() => resolve(false));
      };

      audio.onended = () => {
        this.notifyTrackEnded();
      };

      audio.onerror = () => {
        clearTimeout(timeoutId);
        resolve(false);
      };
    });
  }

  // =================================================================
  // PROCEDURAL BEAT SYNTHESIZER ENGINE (Web Audio API)
  // Generates real Reggaetón Dembow, Hip-hop, Latin, Afrobeat & Neo-Soul
  // =================================================================
  private startProceduralBeat(
    style: 'reggaeton' | 'hiphop' | 'latin' | 'afrobeat' | 'neosoul',
    ctx: AudioContext
  ): void {
    this.stopProceduralScheduler();
    this.currentStep = 0;
    this.nextNoteTime = ctx.currentTime + 0.05;

    // Run lookahead timer every 25ms
    this.synthIntervalId = window.setInterval(() => {
      while (this.nextNoteTime < ctx.currentTime + this.scheduleAheadSec) {
        this.scheduleBeatStep(this.currentStep, this.nextNoteTime, style, ctx);
        this.advanceStep();
      }
    }, this.lookaheadMs);
  }

  private stopProceduralScheduler(): void {
    if (this.synthIntervalId !== null) {
      clearInterval(this.synthIntervalId);
      this.synthIntervalId = null;
    }
  }

  private advanceStep(): void {
    const secondsPerBeat = 60.0 / this.bpm;
    // 16th notes: 0.25 of a beat
    const stepDuration = 0.25 * secondsPerBeat;
    this.nextNoteTime += stepDuration;
    this.currentStep = (this.currentStep + 1) % 32; // 32 steps = 2 bars of 16th notes
  }

  private scheduleBeatStep(
    step: number,
    time: number,
    style: 'reggaeton' | 'hiphop' | 'latin' | 'afrobeat' | 'neosoul',
    ctx: AudioContext
  ): void {
    if (!this.masterGain) return;

    // -------------------------------------------------------------
    // 1. REGGAETÓN DEMBOW PATTERN
    // -------------------------------------------------------------
    // Classic Dembow Syncopation:
    // Kicks: on 0, 4, 8, 12 (Every quarter note: "Boom... Boom... Boom... Boom...")
    // Snares / Palos: on 0 (light), 3, 6, 10, 14 (The iconic "Cha-ke-cha")
    // -------------------------------------------------------------
    if (style === 'reggaeton') {
      const stepInBar = step % 16;

      // Kick: beats 1, 2, 3, 4
      if (stepInBar === 0 || stepInBar === 4 || stepInBar === 8 || stepInBar === 12) {
        this.synthKick(time, 65, 0.28, ctx);
        // Sub-bass 808
        const bassFreq = step < 16 ? 48 : 43; // D1 then Bb0
        this.synthSubBass(time, bassFreq, 0.45, ctx);
      }

      // Dembow Snare / Rimshot: steps 3, 6, 10, 14
      if (stepInBar === 3 || stepInBar === 6 || stepInBar === 10 || stepInBar === 14) {
        const velocity = stepInBar === 3 || stepInBar === 10 ? 0.45 : 0.35;
        this.synthSnare(time, 220, velocity, ctx);
      }

      // Shaker / Maraca: continuous 16th notes
      if (step % 2 === 0) {
        this.synthHiHat(time, 0.1, 0.04, ctx);
      }

      // Ambient Melodic Rhodes Chords (every 8 steps = 2 beats)
      if (step % 8 === 0) {
        const chordNotes =
          step === 0
            ? [293.66, 349.23, 440.0] // Dm (D4, F4, A4)
            : step === 8
            ? [233.08, 293.66, 349.23] // Bb (Bb3, D4, F4)
            : step === 16
            ? [261.63, 329.63, 392.0] // C (C4, E4, G4)
            : [220.0, 261.63, 329.63]; // Am (A3, C4, E4)

        this.synthWarmChord(time, chordNotes, 0.65, 0.18, ctx);
      }
    }

    // -------------------------------------------------------------
    // 2. HIP-HOP & TRAP BOOM-BAP PATTERN
    // -------------------------------------------------------------
    else if (style === 'hiphop') {
      const stepInBar = step % 16;

      // Heavy Boom-Bap Kick
      if (stepInBar === 0 || stepInBar === 7 || stepInBar === 10) {
        this.synthKick(time, 55, 0.35, ctx);
        this.synthSubBass(time, 40, 0.5, ctx);
      }

      // Crisp Snap Snare on 4 and 12
      if (stepInBar === 4 || stepInBar === 12) {
        this.synthSnare(time, 180, 0.5, ctx);
      }

      // Trap Hi-Hats with rolling feel
      if (stepInBar % 2 === 0 || stepInBar === 11 || stepInBar === 15) {
        const vol = stepInBar === 11 || stepInBar === 15 ? 0.08 : 0.16;
        this.synthHiHat(time, vol, 0.03, ctx);
      }

      // Jazz/Soul Rhodes Stabs
      if (step % 8 === 0) {
        const notes =
          step === 0
            ? [174.61, 261.63, 329.63, 392.0] // Fmaj7
            : step === 8
            ? [196.0, 293.66, 349.23, 440.0] // G9
            : step === 16
            ? [220.0, 261.63, 329.63, 392.0] // Am7
            : [164.81, 246.94, 329.63, 392.0]; // Em7

        this.synthWarmChord(time, notes, 0.8, 0.15, ctx);
      }
    }

    // -------------------------------------------------------------
    // 3. LATIN CHILL & BOSSA PATTERN
    // -------------------------------------------------------------
    else if (style === 'latin') {
      const stepInBar = step % 16;

      // Gentle Conga / Woodblock percussion
      if (stepInBar === 0 || stepInBar === 6 || stepInBar === 10) {
        this.synthConga(time, 280, 0.25, ctx);
      }
      if (stepInBar === 3 || stepInBar === 12 || stepInBar === 14) {
        this.synthConga(time, 420, 0.2, ctx);
      }

      // Acoustic Upright Bass
      if (stepInBar === 0 || stepInBar === 6 || stepInBar === 10) {
        const bassNote = step < 16 ? 55 : 65.4; // A1 / C2
        this.synthSubBass(time, bassNote, 0.4, ctx);
      }

      // Shaker
      this.synthHiHat(time, stepInBar % 2 === 0 ? 0.06 : 0.03, 0.03, ctx);

      // Nylon Guitar-like Bossa Arpeggios
      if (stepInBar === 0 || stepInBar === 3 || stepInBar === 6 || stepInBar === 9 || stepInBar === 12) {
        const arpeggio = [220, 277.18, 329.63, 440]; // A major 7
        const note = arpeggio[(stepInBar / 3) % arpeggio.length];
        this.synthGuitarPluck(time, note, 0.16, ctx);
      }
    }

    // -------------------------------------------------------------
    // 4. AFROBEAT PATTERN
    // -------------------------------------------------------------
    else if (style === 'afrobeat') {
      const stepInBar = step % 16;

      // Syncopated Kick
      if (stepInBar === 0 || stepInBar === 6 || stepInBar === 10) {
        this.synthKick(time, 70, 0.25, ctx);
        this.synthSubBass(time, 50, 0.35, ctx);
      }

      // Rimshot / Clave
      if (stepInBar === 3 || stepInBar === 8 || stepInBar === 11 || stepInBar === 14) {
        this.synthSnare(time, 350, 0.3, ctx);
      }

      // Shekere / Shaker
      this.synthHiHat(time, stepInBar % 2 === 0 ? 0.09 : 0.04, 0.02, ctx);

      // Kalimba / Marimba melodic hook
      if (stepInBar === 0 || stepInBar === 4 || stepInBar === 7 || stepInBar === 12) {
        const kalimbaNotes = [329.63, 392.0, 440.0, 493.88, 587.33]; // E, G, A, B, D
        const note = kalimbaNotes[(step + stepInBar) % kalimbaNotes.length];
        this.synthPluck(time, note, 0.22, ctx);
      }
    }

    // -------------------------------------------------------------
    // 5. NEO-SOUL & JAZZ LOUNGE PATTERN
    // -------------------------------------------------------------
    else {
      const stepInBar = step % 16;

      // Soft Thump Kick
      if (stepInBar === 0 || stepInBar === 8) {
        this.synthKick(time, 50, 0.3, ctx);
        this.synthSubBass(time, 44, 0.6, ctx);
      }

      // Brushed Snare on 4 and 12
      if (stepInBar === 4 || stepInBar === 12) {
        this.synthSnare(time, 160, 0.25, ctx);
      }

      // Soft ride cymbal
      if (stepInBar % 2 === 0) {
        this.synthHiHat(time, 0.05, 0.06, ctx);
      }

      // Lush Neo-Soul 9th chords
      if (step % 8 === 0) {
        const soulChords =
          step === 0
            ? [196.0, 246.94, 293.66, 369.99] // Gmaj9
            : step === 8
            ? [185.0, 233.08, 277.18, 349.23] // F#m7
            : step === 16
            ? [164.81, 220.0, 261.63, 329.63] // Em9
            : [146.83, 220.0, 261.63, 329.63]; // D6/9

        this.synthWarmChord(time, soulChords, 1.1, 0.16, ctx);
      }
    }
  }

  // =================================================================
  // AUDIO SYNTHESIZER PRIMITIVES (Oscillators, Envelopes, Noise)
  // =================================================================

  private synthKick(time: number, freq: number, duration: number, ctx: AudioContext): void {
    if (!this.masterGain) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * 2.2, time);
    osc.frequency.exponentialRampToValueAtTime(32, time + duration);

    gain.gain.setValueAtTime(0.7, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  private synthSubBass(time: number, freq: number, duration: number, ctx: AudioContext): void {
    if (!this.masterGain) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.4, time);
    gain.gain.linearRampToValueAtTime(0.3, time + duration * 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  private synthSnare(time: number, toneFreq: number, volume: number, ctx: AudioContext): void {
    if (!this.masterGain) return;

    // 1. Noise body for the crack
    const bufferSize = ctx.sampleRate * 0.15;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1000, time);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(volume * 0.8, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    noise.start(time);
    noise.stop(time + 0.15);

    // 2. Tonal rimshot pop
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(toneFreq, time);
    osc.frequency.exponentialRampToValueAtTime(toneFreq * 0.6, time + 0.08);

    oscGain.gain.setValueAtTime(volume * 0.6, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.09);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.09);
  }

  private synthHiHat(time: number, volume: number, duration: number, ctx: AudioContext): void {
    if (!this.masterGain) return;

    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7500, time);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(time);
    noise.stop(time + duration);
  }

  private synthConga(time: number, freq: number, volume: number, ctx: AudioContext): void {
    if (!this.masterGain) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * 1.5, time);
    osc.frequency.exponentialRampToValueAtTime(freq, time + 0.08);

    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.12);
  }

  private synthWarmChord(
    time: number,
    freqs: number[],
    duration: number,
    volume: number,
    ctx: AudioContext
  ): void {
    if (!this.masterGain) return;

    freqs.forEach((freq) => {
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, time);
      filter.frequency.linearRampToValueAtTime(1400, time + duration * 0.2);
      filter.frequency.linearRampToValueAtTime(800, time + duration);

      gain.gain.setValueAtTime(0.01, time);
      gain.gain.linearRampToValueAtTime(volume / freqs.length, time + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(time);
      osc.stop(time + duration);
    });
  }

  private synthPluck(time: number, freq: number, volume: number, ctx: AudioContext): void {
    if (!this.masterGain) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.22);
  }

  private synthGuitarPluck(time: number, freq: number, volume: number, ctx: AudioContext): void {
    if (!this.masterGain) return;

    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, time);

    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.28);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.28);
  }

  // =================================================================
  // LISTENERS & EVENT NOTIFIERS
  // =================================================================
  public onStateChange(cb: (playing: boolean) => void): () => void {
    this.onStateChangeCallbacks.push(cb);
    return () => {
      this.onStateChangeCallbacks = this.onStateChangeCallbacks.filter((c) => c !== cb);
    };
  }

  public onTrackEnded(cb: () => void): () => void {
    this.onTrackEndedCallbacks.push(cb);
    return () => {
      this.onTrackEndedCallbacks = this.onTrackEndedCallbacks.filter((c) => c !== cb);
    };
  }

  private notifyState(playing: boolean): void {
    this.onStateChangeCallbacks.forEach((cb) => cb(playing));
  }

  private notifyTrackEnded(): void {
    this.onTrackEndedCallbacks.forEach((cb) => cb());
  }
}

// Global singleton instance for the barbershop app
export const globalBarberAudioEngine = new BarberAudioEngine();
