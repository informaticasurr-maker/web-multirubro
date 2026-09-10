/**
 * BarberAudioEngine
 * Dual-engine audio player for barbershop instrumental music:
 * 1) HTML5 Audio for streaming royalty-free tracks
 * 2) Procedural Web Audio API Synthesizer that generates live Reggaetón Dembow,
 *    Hip-Hop Boom-Bap, Latin Lounge, Afrobeat & Neo-Soul beats 100% offline with zero latency.
 */

import { InstrumentalTrack } from '../types';
import { ProceduralSynthEngine } from './proceduralSynthEngine';

export class BarberAudioEngine {
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private currentHtmlAudio: HTMLAudioElement | null = null;
  private proceduralSynth: ProceduralSynthEngine = new ProceduralSynthEngine();

  private isPlaying = false;
  private isMuted = false;
  private volume = 0.7; // 0 to 1
  private currentTrack: InstrumentalTrack | null = null;
  private playMode: 'streaming' | 'procedural' = 'procedural';

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
    if (this.masterGain) {
      this.proceduralSynth.startBeat(track.proceduralStyle, track.bpm || 95, ctx, this.masterGain);
    }
    this.isPlaying = true;
    this.notifyState(true);
  }

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
    this.proceduralSynth.stop();
    this.isPlaying = false;
    this.notifyState(false);
  }

  public resume(): void {
    if (!this.currentTrack) return;
    const ctx = this.initAudioContext();

    if (this.playMode === 'streaming' && this.currentHtmlAudio) {
      this.currentHtmlAudio.play().catch(() => {
        this.playMode = 'procedural';
        if (this.masterGain) {
          this.proceduralSynth.startBeat(this.currentTrack!.proceduralStyle, this.currentTrack!.bpm || 95, ctx, this.masterGain);
        }
      });
    } else if (this.masterGain) {
      this.proceduralSynth.startBeat(this.currentTrack.proceduralStyle, this.currentTrack.bpm || 95, ctx, this.masterGain);
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
    this.proceduralSynth.stop();
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
      }, 3500);

      audio.oncanplay = () => {
        clearTimeout(timeoutId);
        try {
          if (this.audioCtx && this.analyser) {
            const source = this.audioCtx.createMediaElementSource(audio);
            source.connect(this.masterGain || this.audioCtx.destination);
          }
        } catch {
          // Cross-origin fallback
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
