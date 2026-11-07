/**
 * J.A.R.V.I.S. Audio Synthesizer (Web Audio API)
 * Procedural sci-fi sound design inspired by Iron Man & Stark Industries.
 * Zero external audio files required.
 */

class JarvisAudioSFX {
  constructor() {
    this.audioCtx = null;
    this.muted = localStorage.getItem('jarvis_sfx_muted') === 'true';
    this.volume = parseFloat(localStorage.getItem('jarvis_sfx_volume') || '0.7');
  }

  init() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('jarvis_sfx_muted', this.muted);
    return this.muted;
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    localStorage.setItem('jarvis_sfx_volume', this.volume);
  }

  getMasterGain() {
    if (!this.audioCtx || this.muted) return null;
    const gain = this.audioCtx.createGain();
    gain.gain.value = this.volume;
    gain.connect(this.audioCtx.destination);
    return gain;
  }

  /**
   * Crisp futuristic interface blip / click
   */
  playBeep(freq = 1760, duration = 0.04) {
    this.init();
    const master = this.getMasterGain();
    if (!master) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.6, this.audioCtx.currentTime + duration);

    gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(master);

    osc.start();
    osc.stop(this.audioCtx.currentTime + duration);
  }

  /**
   * Iconic Stark Industries two-tone boot/activation chime
   */
  playStartup() {
    this.init();
    const master = this.getMasterGain();
    if (!master) return;

    const now = this.audioCtx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 chord sequence

    freqs.forEach((freq, idx) => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);

      gain.gain.setValueAtTime(0.001, now + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.18, now + idx * 0.09 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.45);

      osc.connect(gain);
      gain.connect(master);

      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 0.5);
    });
  }

  /**
   * Iron Man Repulsor blast / send message sound
   */
  playRepulsor() {
    this.init();
    const master = this.getMasterGain();
    if (!master) return;

    const now = this.audioCtx.currentTime;

    // High frequency charge sweep
    const osc = this.audioCtx.createOscillator();
    const oscGain = this.audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(2400, now + 0.16);

    oscGain.gain.setValueAtTime(0.01, now);
    oscGain.gain.linearRampToValueAtTime(0.12, now + 0.15);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(oscGain);
    oscGain.connect(master);

    osc.start(now);
    osc.stop(now + 0.22);

    // Resonant blast thump
    const subOsc = this.audioCtx.createOscillator();
    const subGain = this.audioCtx.createGain();

    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(220, now + 0.14);
    subOsc.frequency.exponentialRampToValueAtTime(45, now + 0.35);

    subGain.gain.setValueAtTime(0.25, now + 0.14);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    subOsc.connect(subGain);
    subGain.connect(master);

    subOsc.start(now + 0.14);
    subOsc.stop(now + 0.4);
  }

  /**
   * Pleasant incoming transmission chime
   */
  playSuccess() {
    this.init();
    const master = this.getMasterGain();
    if (!master) return;

    const now = this.audioCtx.currentTime;
    [880, 1318.5].forEach((freq, idx) => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.15, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.28);

      osc.connect(gain);
      gain.connect(master);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.3);
    });
  }

  /**
   * Warning alert tone for threats / errors
   */
  playAlert() {
    this.init();
    const master = this.getMasterGain();
    if (!master) return;

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.setValueAtTime(350, now + 0.15);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(master);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  /**
   * Listening microphone activation sound
   */
  playMicOn() {
    this.playBeep(1200, 0.08);
  }

  playMicOff() {
    this.playBeep(700, 0.08);
  }
}

// Export singleton instance
window.jarvisSFX = new JarvisAudioSFX();
