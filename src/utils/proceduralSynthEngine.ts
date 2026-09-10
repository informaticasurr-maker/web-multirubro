/**
 * ProceduralSynthEngine
 * Web Audio API procedural synthesizer for generative instrumental rhythms:
 * Reggaetón Dembow, Hip-Hop Boom-Bap, Latin Lounge, Afrobeat & Neo-Soul.
 */

export type ProceduralStyle = 'reggaeton' | 'hiphop' | 'latin' | 'afrobeat' | 'neosoul';

export class ProceduralSynthEngine {
  private synthIntervalId: number | null = null;
  private currentStep = 0;
  private bpm = 95;
  private lookaheadMs = 25;
  private scheduleAheadSec = 0.1;
  private nextNoteTime = 0;

  public startBeat(
    style: ProceduralStyle,
    bpm: number,
    ctx: AudioContext,
    destination: AudioNode
  ): void {
    this.stop();
    this.bpm = bpm || 95;
    this.currentStep = 0;
    this.nextNoteTime = ctx.currentTime + 0.05;

    this.synthIntervalId = window.setInterval(() => {
      while (this.nextNoteTime < ctx.currentTime + this.scheduleAheadSec) {
        this.scheduleBeatStep(this.currentStep, this.nextNoteTime, style, ctx, destination);
        this.advanceStep();
      }
    }, this.lookaheadMs);
  }

  public stop(): void {
    if (this.synthIntervalId !== null) {
      clearInterval(this.synthIntervalId);
      this.synthIntervalId = null;
    }
  }

  private advanceStep(): void {
    const secondsPerBeat = 60.0 / this.bpm;
    const stepDuration = 0.25 * secondsPerBeat;
    this.nextNoteTime += stepDuration;
    this.currentStep = (this.currentStep + 1) % 32;
  }

  private scheduleBeatStep(
    step: number,
    time: number,
    style: ProceduralStyle,
    ctx: AudioContext,
    destination: AudioNode
  ): void {
    // 1. REGGAETÓN DEMBOW
    if (style === 'reggaeton') {
      const stepInBar = step % 16;
      if (stepInBar === 0 || stepInBar === 4 || stepInBar === 8 || stepInBar === 12) {
        this.synthKick(time, 65, 0.28, ctx, destination);
        const bassFreq = step < 16 ? 48 : 43;
        this.synthSubBass(time, bassFreq, 0.45, ctx, destination);
      }
      if (stepInBar === 3 || stepInBar === 6 || stepInBar === 10 || stepInBar === 14) {
        const velocity = stepInBar === 3 || stepInBar === 10 ? 0.45 : 0.35;
        this.synthSnare(time, 220, velocity, ctx, destination);
      }
      if (step % 2 === 0) {
        this.synthHiHat(time, 0.1, 0.04, ctx, destination);
      }
      if (step % 8 === 0) {
        const chordNotes =
          step === 0
            ? [293.66, 349.23, 440.0]
            : step === 8
            ? [233.08, 293.66, 349.23]
            : step === 16
            ? [261.63, 329.63, 392.0]
            : [220.0, 261.63, 329.63];
        this.synthWarmChord(time, chordNotes, 0.65, 0.18, ctx, destination);
      }
    }
    // 2. HIP-HOP & TRAP BOOM-BAP
    else if (style === 'hiphop') {
      const stepInBar = step % 16;
      if (stepInBar === 0 || stepInBar === 7 || stepInBar === 10) {
        this.synthKick(time, 55, 0.35, ctx, destination);
        this.synthSubBass(time, 40, 0.5, ctx, destination);
      }
      if (stepInBar === 4 || stepInBar === 12) {
        this.synthSnare(time, 180, 0.5, ctx, destination);
      }
      if (stepInBar % 2 === 0 || stepInBar === 11 || stepInBar === 15) {
        const vol = stepInBar === 11 || stepInBar === 15 ? 0.08 : 0.16;
        this.synthHiHat(time, vol, 0.03, ctx, destination);
      }
      if (step % 8 === 0) {
        const notes =
          step === 0
            ? [174.61, 261.63, 329.63, 392.0]
            : step === 8
            ? [196.0, 293.66, 349.23, 440.0]
            : step === 16
            ? [220.0, 261.63, 329.63, 392.0]
            : [164.81, 246.94, 329.63, 392.0];
        this.synthWarmChord(time, notes, 0.8, 0.15, ctx, destination);
      }
    }
    // 3. LATIN CHILL & BOSSA
    else if (style === 'latin') {
      const stepInBar = step % 16;
      if (stepInBar === 0 || stepInBar === 6 || stepInBar === 10) {
        this.synthConga(time, 280, 0.25, ctx, destination);
      }
      if (stepInBar === 3 || stepInBar === 12 || stepInBar === 14) {
        this.synthConga(time, 420, 0.2, ctx, destination);
      }
      if (stepInBar === 0 || stepInBar === 6 || stepInBar === 10) {
        const bassNote = step < 16 ? 55 : 65.4;
        this.synthSubBass(time, bassNote, 0.4, ctx, destination);
      }
      this.synthHiHat(time, stepInBar % 2 === 0 ? 0.06 : 0.03, 0.03, ctx, destination);
      if (stepInBar === 0 || stepInBar === 3 || stepInBar === 6 || stepInBar === 9 || stepInBar === 12) {
        const arpeggio = [220, 277.18, 329.63, 440];
        const note = arpeggio[(stepInBar / 3) % arpeggio.length];
        this.synthGuitarPluck(time, note, 0.16, ctx, destination);
      }
    }
    // 4. AFROBEAT
    else if (style === 'afrobeat') {
      const stepInBar = step % 16;
      if (stepInBar === 0 || stepInBar === 6 || stepInBar === 10) {
        this.synthKick(time, 70, 0.25, ctx, destination);
        this.synthSubBass(time, 50, 0.35, ctx, destination);
      }
      if (stepInBar === 3 || stepInBar === 8 || stepInBar === 11 || stepInBar === 14) {
        this.synthSnare(time, 350, 0.3, ctx, destination);
      }
      this.synthHiHat(time, stepInBar % 2 === 0 ? 0.09 : 0.04, 0.02, ctx, destination);
      if (stepInBar === 0 || stepInBar === 4 || stepInBar === 7 || stepInBar === 12) {
        const kalimbaNotes = [329.63, 392.0, 440.0, 493.88, 587.33];
        const note = kalimbaNotes[(step + stepInBar) % kalimbaNotes.length];
        this.synthPluck(time, note, 0.22, ctx, destination);
      }
    }
    // 5. NEO-SOUL & JAZZ LOUNGE
    else {
      const stepInBar = step % 16;
      if (stepInBar === 0 || stepInBar === 8) {
        this.synthKick(time, 50, 0.3, ctx, destination);
        this.synthSubBass(time, 44, 0.6, ctx, destination);
      }
      if (stepInBar === 4 || stepInBar === 12) {
        this.synthSnare(time, 160, 0.25, ctx, destination);
      }
      if (stepInBar % 2 === 0) {
        this.synthHiHat(time, 0.05, 0.06, ctx, destination);
      }
      if (step % 8 === 0) {
        const soulChords =
          step === 0
            ? [196.0, 246.94, 293.66, 369.99]
            : step === 8
            ? [185.0, 233.08, 277.18, 349.23]
            : step === 16
            ? [164.81, 220.0, 261.63, 329.63]
            : [146.83, 220.0, 261.63, 329.63];
        this.synthWarmChord(time, soulChords, 1.1, 0.16, ctx, destination);
      }
    }
  }

  private synthKick(time: number, freq: number, duration: number, ctx: AudioContext, destination: AudioNode): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * 2.2, time);
    osc.frequency.exponentialRampToValueAtTime(32, time + duration);
    gain.gain.setValueAtTime(0.7, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
    osc.connect(gain);
    gain.connect(destination);
    osc.start(time);
    osc.stop(time + duration);
  }

  private synthSubBass(time: number, freq: number, duration: number, ctx: AudioContext, destination: AudioNode): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);
    gain.gain.setValueAtTime(0.4, time);
    gain.gain.linearRampToValueAtTime(0.3, time + duration * 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
    osc.connect(gain);
    gain.connect(destination);
    osc.start(time);
    osc.stop(time + duration);
  }

  private synthSnare(time: number, toneFreq: number, volume: number, ctx: AudioContext, destination: AudioNode): void {
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
    noiseGain.connect(destination);
    noise.start(time);
    noise.stop(time + 0.15);

    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(toneFreq, time);
    osc.frequency.exponentialRampToValueAtTime(toneFreq * 0.6, time + 0.08);
    oscGain.gain.setValueAtTime(volume * 0.6, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.09);
    osc.connect(oscGain);
    oscGain.connect(destination);
    osc.start(time);
    osc.stop(time + 0.09);
  }

  private synthHiHat(time: number, volume: number, duration: number, ctx: AudioContext, destination: AudioNode): void {
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
    gain.connect(destination);
    noise.start(time);
    noise.stop(time + duration);
  }

  private synthConga(time: number, freq: number, volume: number, ctx: AudioContext, destination: AudioNode): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * 1.5, time);
    osc.frequency.exponentialRampToValueAtTime(freq, time + 0.08);
    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
    osc.connect(gain);
    gain.connect(destination);
    osc.start(time);
    osc.stop(time + 0.12);
  }

  private synthWarmChord(
    time: number,
    freqs: number[],
    duration: number,
    volume: number,
    ctx: AudioContext,
    destination: AudioNode
  ): void {
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
      gain.connect(destination);
      osc.start(time);
      osc.stop(time + duration);
    });
  }

  private synthPluck(time: number, freq: number, volume: number, ctx: AudioContext, destination: AudioNode): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);
    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);
    osc.connect(gain);
    gain.connect(destination);
    osc.start(time);
    osc.stop(time + 0.22);
  }

  private synthGuitarPluck(time: number, freq: number, volume: number, ctx: AudioContext, destination: AudioNode): void {
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
    gain.connect(destination);
    osc.start(time);
    osc.stop(time + 0.28);
  }
}
