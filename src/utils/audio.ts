// Procedural Web Audio API sound effects for BankRo Coinflip with rich metallic acoustic resonance

class SoundManager {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;

  private getContext(): AudioContext | null {
    if (!this.soundEnabled) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Realistic metallic coin toss: dual resonant ringing frequencies with air flutter
   */
  public playCoinToss(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Resonant coin body (pure high-grade alloy ring)
      const primaryOsc = ctx.createOscillator();
      const primaryGain = ctx.createGain();
      primaryOsc.type = 'sine';
      primaryOsc.frequency.setValueAtTime(2450, now);
      primaryOsc.frequency.exponentialRampToValueAtTime(2150, now + 0.45);

      primaryGain.gain.setValueAtTime(0.22, now);
      primaryGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      // Shimmering harmonic overtone
      const harmonicOsc = ctx.createOscillator();
      const harmonicGain = ctx.createGain();
      harmonicOsc.type = 'triangle';
      harmonicOsc.frequency.setValueAtTime(4900, now);
      harmonicOsc.frequency.exponentialRampToValueAtTime(4300, now + 0.3);

      harmonicGain.gain.setValueAtTime(0.12, now);
      harmonicGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      // Spin flutter modulation
      const flutterOsc = ctx.createOscillator();
      const flutterGain = ctx.createGain();
      flutterOsc.frequency.setValueAtTime(28, now); // 28Hz rotation flutter
      flutterGain.gain.setValueAtTime(0.15, now);

      flutterOsc.connect(flutterGain.gain);

      primaryOsc.connect(primaryGain);
      primaryGain.connect(ctx.destination);

      harmonicOsc.connect(harmonicGain);
      harmonicGain.connect(ctx.destination);

      primaryOsc.start(now);
      harmonicOsc.start(now);
      flutterOsc.start(now);

      primaryOsc.stop(now + 0.55);
      harmonicOsc.stop(now + 0.4);
      flutterOsc.stop(now + 0.55);
    } catch {
      // Audio context restricted or muted
    }
  }

  /**
   * Crisp, weighty metallic coin impact on solid felt surface
   */
  public playCoinLand(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Sharp initial metal strike transient
      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      clickOsc.type = 'sine';
      clickOsc.frequency.setValueAtTime(3200, now);
      clickOsc.frequency.exponentialRampToValueAtTime(800, now + 0.04);

      clickGain.gain.setValueAtTime(0.28, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      // Solid coin body resonance
      const bodyOsc = ctx.createOscillator();
      const bodyGain = ctx.createGain();
      bodyOsc.type = 'triangle';
      bodyOsc.frequency.setValueAtTime(1620, now);
      bodyOsc.frequency.exponentialRampToValueAtTime(940, now + 0.22);

      bodyGain.gain.setValueAtTime(0.2, now);
      bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      clickOsc.connect(clickGain);
      clickGain.connect(ctx.destination);

      bodyOsc.connect(bodyGain);
      bodyGain.connect(ctx.destination);

      clickOsc.start(now);
      bodyOsc.start(now);

      clickOsc.stop(now + 0.08);
      bodyOsc.stop(now + 0.26);
    } catch {
      // ignore
    }
  }

  /**
   * Celebratory ascending major chord chime with bell decay
   */
  public playWinChime(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      // Crystal clear major arpeggio: C5, E5, G5, B5, C6
      const freqs = [523.25, 659.25, 783.99, 987.77, 1046.5];
      freqs.forEach((freq, idx) => {
        const noteTime = ctx.currentTime + idx * 0.065;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Warm bell wave
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteTime);

        // Gentle envelope with smooth exponential decay
        gain.gain.setValueAtTime(0, noteTime);
        gain.gain.linearRampToValueAtTime(0.18, noteTime + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0005, noteTime + 0.6);

        // Add subtle octave overtone
        const overtone = ctx.createOscillator();
        const overGain = ctx.createGain();
        overtone.type = 'triangle';
        overtone.frequency.setValueAtTime(freq * 2, noteTime);
        overGain.gain.setValueAtTime(0.04, noteTime);
        overGain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        overtone.connect(overGain);
        overGain.connect(ctx.destination);

        osc.start(noteTime);
        overtone.start(noteTime);

        osc.stop(noteTime + 0.65);
        overtone.stop(noteTime + 0.4);
      });
    } catch {
      // ignore
    }
  }

  /**
   * Ultra-clean, haptic button click (no harsh DC offset)
   */
  public playClick(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(950, now);
      osc.frequency.exponentialRampToValueAtTime(420, now + 0.025);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.03);
    } catch {
      // ignore
    }
  }

  /**
   * Rhythmic flip spin tick during animation
   */
  public playFlipTick(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1800, now);
      osc.frequency.exponentialRampToValueAtTime(1100, now + 0.018);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.022);
    } catch {
      // ignore
    }
  }

  public toggleSound(enabled?: boolean): boolean {
    if (enabled !== undefined) {
      this.soundEnabled = enabled;
    } else {
      this.soundEnabled = !this.soundEnabled;
    }
    return this.soundEnabled;
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }
}

export const sounds = new SoundManager();
