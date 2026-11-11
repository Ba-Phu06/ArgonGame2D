import { AudioSettings } from '../types/data-types';

export type SoundEffectType =
  | 'slash'
  | 'laser'
  | 'railgun'
  | 'lightning'
  | 'explosion'
  | 'pickup'
  | 'level-up'
  | 'dash'
  | 'ultimate'
  | 'hit-player'
  | 'boss-spawn';

class AudioSynthesizerService {
  private ctx: AudioContext | null = null;
  private settings: AudioSettings = {
    masterVolume: 0.65,
    musicEnabled: true,
    sfxEnabled: true,
  };
  private beatTimer: number = 0;
  private beatStep: number = 0;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') {
      return null;
    }
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  public updateSettings(nextSettings: AudioSettings): void {
    this.settings = { ...nextSettings };
  }

  public getSettings(): AudioSettings {
    return this.settings;
  }

  private playTone(
    freqStart: number,
    freqEnd: number,
    duration: number,
    waveType: OscillatorType,
    gainLevel: number
  ): void {
    const context = this.ensureContext();
    if (!context) {
      return;
    }

    const now = context.currentTime;
    const osc = context.createOscillator();
    const gain = context.createGain();
    const finalVolume = Math.max(0.001, gainLevel * this.settings.masterVolume);

    osc.type = waveType;
    osc.frequency.setValueAtTime(freqStart, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), now + duration);

    gain.gain.setValueAtTime(finalVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + duration);

    osc.connect(gain);
    gain.connect(context.destination);
    osc.start(now);
    osc.stop(now + duration);
  }

  public playSfx(effect: SoundEffectType, comboMultiplier: number = 1): void {
    if (!this.settings.sfxEnabled || this.settings.masterVolume <= 0.01) {
      return;
    }

    switch (effect) {
      case 'slash':
        this.playTone(340, 95, 0.11, 'sawtooth', 0.14);
        break;
      case 'laser':
        this.playTone(720, 210, 0.09, 'triangle', 0.11);
        break;
      case 'railgun':
        this.playTone(980, 140, 0.14, 'square', 0.15);
        break;
      case 'lightning':
        this.playTone(1250, 320, 0.12, 'sawtooth', 0.12);
        break;
      case 'explosion':
        this.playTone(150, 32, 0.26, 'sawtooth', 0.22);
        break;
      case 'pickup': {
        const pitch = Math.min(1320, 520 + comboMultiplier * 24);
        this.playTone(pitch, pitch * 1.25, 0.07, 'sine', 0.09);
        break;
      }
      case 'dash':
        this.playTone(260, 620, 0.13, 'triangle', 0.14);
        break;
      case 'hit-player':
        this.playTone(180, 55, 0.22, 'sawtooth', 0.24);
        break;
      case 'level-up':
        this.playChord([440, 554.37, 659.25, 880], 0.35, 'triangle', 0.14);
        break;
      case 'ultimate':
        this.playChord([220, 329.63, 440, 659.25], 0.48, 'sawtooth', 0.18);
        break;
      case 'boss-spawn':
        this.playChord([110, 116.54, 220], 0.65, 'sawtooth', 0.22);
        break;
    }
  }

  private playChord(
    frequencies: number[],
    duration: number,
    waveType: OscillatorType,
    gainLevel: number
  ): void {
    for (const freq of frequencies) {
      this.playTone(freq, freq * 1.02, duration, waveType, gainLevel / frequencies.length);
    }
  }

  public tickBackgroundPulse(dt: number, isBossActive: boolean): void {
    if (!this.settings.musicEnabled || this.settings.masterVolume <= 0.01) {
      return;
    }
    const stepInterval = isBossActive ? 0.18 : 0.24;
    this.beatTimer += dt;
    if (this.beatTimer < stepInterval) {
      return;
    }
    this.beatTimer -= stepInterval;
    const bassNotes = isBossActive
      ? [65.41, 65.41, 77.78, 65.41, 87.31, 82.41, 77.78, 61.74]
      : [73.42, 73.42, 87.31, 73.42, 98.0, 87.31, 110.0, 87.31];
    const note = bassNotes[this.beatStep % bassNotes.length];
    this.beatStep += 1;
    this.playTone(note, note * 0.96, stepInterval * 0.85, 'triangle', 0.045);
  }
}

export const audioSynth = new AudioSynthesizerService();
