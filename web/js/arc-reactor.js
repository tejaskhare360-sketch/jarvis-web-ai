/**
 * J.A.R.V.I.S. Arc Reactor Hologram Engine
 * High-performance 60 FPS HTML5 Canvas visualizer.
 * Renders concentric rotating magnetic rings, palladium core, energy conduits,
 * and real-time audio waveform / frequency responsiveness.
 */

class ArcReactorHUD {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    // States: 'idle', 'listening', 'processing', 'speaking', 'alert'
    this.state = 'idle';
    this.angle1 = 0;
    this.angle2 = 0;
    this.angle3 = 0;
    this.pulse = 0;
    this.pulseSpeed = 0.03;
    this.audioLevel = 0; // 0.0 to 1.0 from microphone or TTS

    // Particles orbiting the core
    this.particles = [];
    this.initParticles(36);

    // Audio frequency analyzer data
    this.waveformPoints = [];
    for (let i = 0; i < 48; i++) this.waveformPoints.push(0);

    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const size = Math.min(rect.width, rect.height) || 340;
    this.canvas.width = size * dpr;
    this.canvas.height = size * dpr;
    this.width = size;
    this.height = size;
    this.ctx.scale(dpr, dpr);
    this.radius = size * 0.44;
  }

  setState(newState) {
    this.state = newState;
    const captionEl = document.getElementById('reactorCaption');
    if (captionEl) {
      switch (newState) {
        case 'listening':
          captionEl.innerHTML = '<span class="pulse-dot" style="background:#ffb703;box-shadow:0 0 10px #ffb703;"></span>LISTENING // AUDIO RECEPTOR';
          break;
        case 'processing':
          captionEl.innerHTML = '<span class="pulse-dot" style="background:#ff3344;box-shadow:0 0 10px #ff3344;"></span>ANALYZING TACTICAL DATA';
          break;
        case 'speaking':
          captionEl.innerHTML = '<span class="pulse-dot" style="background:#00f0ff;box-shadow:0 0 10px #00f0ff;"></span>VOCAL PROTOCOL ACTIVE';
          break;
        case 'alert':
          captionEl.innerHTML = '<span class="pulse-dot" style="background:#ff3344;box-shadow:0 0 10px #ff3344;"></span>THREAT DETECTED';
          break;
        default:
          captionEl.innerHTML = '<span class="pulse-dot"></span>ARC REACTOR // ONLINE';
          break;
      }
    }
  }

  setAudioLevel(level) {
    this.audioLevel = Math.max(0, Math.min(1, level));
  }

  initParticles(count) {
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        angle: Math.random() * Math.PI * 2,
        dist: 0.3 + Math.random() * 0.65,
        speed: (Math.random() * 0.015 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
        size: Math.random() * 2 + 1,
        alpha: Math.random() * 0.7 + 0.3
      });
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    const cx = this.width / 2;
    const cy = this.height / 2;
    const r = this.radius;

    this.pulse += this.pulseSpeed;
    const pulseFactor = Math.sin(this.pulse) * 0.08;

    // Speed up rotation when processing or speaking
    let speedMult = 1.0;
    if (this.state === 'processing') speedMult = 4.5;
    else if (this.state === 'speaking') speedMult = 2.0;
    else if (this.state === 'listening') speedMult = 1.5;

    this.angle1 += 0.008 * speedMult;
    this.angle2 -= 0.012 * speedMult;
    this.angle3 += 0.005 * speedMult;

    // Determine color palette based on state
    let primaryColor = '#00f0ff';
    let glowColor = 'rgba(0, 240, 255, 0.4)';
    let coreColor = '#ffffff';

    if (this.state === 'processing') {
      primaryColor = '#ffb703';
      glowColor = 'rgba(255, 183, 3, 0.45)';
    } else if (this.state === 'listening') {
      primaryColor = '#38bdf8';
      glowColor = 'rgba(56, 189, 248, 0.5)';
    } else if (this.state === 'alert') {
      primaryColor = '#ff3344';
      glowColor = 'rgba(255, 51, 68, 0.5)';
    }

    // 1. Draw outer compass degree ring
    this.drawCompassRing(cx, cy, r * 0.98, primaryColor);

    // 2. Draw outer segmented rotating ring
    this.drawSegmentedRing(cx, cy, r * 0.88, this.angle1, 16, primaryColor, glowColor);

    // 3. Draw audio waveform reactive ring (reacts to speech or audio)
    this.drawWaveformRing(cx, cy, r * 0.75, primaryColor);

    // 4. Draw middle counter-rotating ring with circuit notches
    this.drawInnerTechRing(cx, cy, r * 0.62, this.angle2, primaryColor);

    // 5. Draw 10 copper magnetic flux coils (Iconic Mark 1 / 3 Arc coils)
    this.drawFluxCoils(cx, cy, r * 0.48, 10, primaryColor);

    // 6. Draw orbiting energy sparks & particles
    this.drawParticles(cx, cy, r, primaryColor);

    // 7. Draw Palladium / Nanotech triangular & circular core
    this.drawCore(cx, cy, r * 0.32 * (1 + pulseFactor + this.audioLevel * 0.25), primaryColor, coreColor);

    requestAnimationFrame(this.animate);
  }

  drawCompassRing(cx, cy, radius, color) {
    this.ctx.save();
    this.ctx.strokeStyle = color;
    this.ctx.globalAlpha = 0.22;
    this.ctx.lineWidth = 1;

    // Thin base circle
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    this.ctx.stroke();

    // 72 tick marks
    const ticks = 72;
    for (let i = 0; i < ticks; i++) {
      const angle = (i / ticks) * Math.PI * 2;
      const isMajor = i % 6 === 0;
      const tickLen = isMajor ? 8 : 4;
      const x1 = cx + Math.cos(angle) * (radius - tickLen);
      const y1 = cy + Math.sin(angle) * (radius - tickLen);
      const x2 = cx + Math.cos(angle) * radius;
      const y2 = cy + Math.sin(angle) * radius;

      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.globalAlpha = isMajor ? 0.6 : 0.2;
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  drawSegmentedRing(cx, cy, radius, rotation, segments, color, glow) {
    this.ctx.save();
    this.ctx.translate(cx, cy);
    this.ctx.rotate(rotation);

    this.ctx.strokeStyle = color;
    this.ctx.shadowColor = glow;
    this.ctx.shadowBlur = 10;
    this.ctx.lineWidth = 3;

    const arcLen = (Math.PI * 2) / segments;
    const gap = arcLen * 0.3;

    for (let i = 0; i < segments; i++) {
      const start = i * arcLen;
      const end = start + arcLen - gap;

      this.ctx.beginPath();
      this.ctx.arc(0, 0, radius, start, end);
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  drawWaveformRing(cx, cy, radius, color) {
    this.ctx.save();
    this.ctx.translate(cx, cy);

    const points = this.waveformPoints.length;
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 1.5;
    this.ctx.shadowColor = color;
    this.ctx.shadowBlur = 8;
    this.ctx.beginPath();

    for (let i = 0; i <= points; i++) {
      const idx = i % points;
      const angle = (i / points) * Math.PI * 2;
      
      // Compute dynamic offset from audio or breathing pulse
      let dynamicWave = 0;
      if (this.state === 'listening' || this.state === 'speaking') {
        dynamicWave = Math.sin(this.pulse * 3 + i) * (8 + this.audioLevel * 14);
      } else {
        dynamicWave = Math.sin(this.pulse + i * 0.4) * 2;
      }

      const r = radius + dynamicWave;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;

      if (i === 0) this.ctx.moveTo(x, y);
      else this.ctx.lineTo(x, y);
    }
    this.ctx.closePath();
    this.ctx.stroke();
    this.ctx.restore();
  }

  drawInnerTechRing(cx, cy, radius, rotation, color) {
    this.ctx.save();
    this.ctx.translate(cx, cy);
    this.ctx.rotate(rotation);

    this.ctx.strokeStyle = color;
    this.ctx.globalAlpha = 0.5;
    this.ctx.lineWidth = 2;

    this.ctx.beginPath();
    this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
    this.ctx.stroke();

    // 4 cardinal holographic notch blocks
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      this.ctx.fillStyle = color;
      this.ctx.beginPath();
      this.ctx.arc(Math.cos(a) * radius, Math.sin(a) * radius, 4, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.restore();
  }

  drawFluxCoils(cx, cy, radius, count, color) {
    this.ctx.save();
    this.ctx.translate(cx, cy);

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      this.ctx.save();
      this.ctx.rotate(angle);

      // Copper coil block
      this.ctx.fillStyle = 'rgba(255, 170, 0, 0.45)';
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = 1;

      const w = 12;
      const h = 8;
      this.ctx.beginPath();
      this.ctx.rect(-w / 2, radius - h / 2, w, h);
      this.ctx.fill();
      this.ctx.stroke();

      // Neon filament lines inside coil
      this.ctx.strokeStyle = '#fff';
      this.ctx.beginPath();
      this.ctx.moveTo(-w / 4, radius);
      this.ctx.lineTo(w / 4, radius);
      this.ctx.stroke();

      this.ctx.restore();
    }
    this.ctx.restore();
  }

  drawParticles(cx, cy, maxRadius, color) {
    this.ctx.save();
    this.ctx.translate(cx, cy);

    this.particles.forEach(p => {
      p.angle += p.speed;
      const r = p.dist * maxRadius;
      const x = Math.cos(p.angle) * r;
      const y = Math.sin(p.angle) * r;

      this.ctx.fillStyle = color;
      this.ctx.globalAlpha = p.alpha;
      this.ctx.shadowColor = color;
      this.ctx.shadowBlur = 4;
      this.ctx.beginPath();
      this.ctx.arc(x, y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.restore();
  }

  drawCore(cx, cy, coreRadius, primaryColor, centerWhite) {
    this.ctx.save();
    this.ctx.translate(cx, cy);

    // Deep radial glowing aura behind core
    const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, coreRadius * 2);
    gradient.addColorStop(0, centerWhite);
    gradient.addColorStop(0.35, primaryColor);
    gradient.addColorStop(0.7, 'rgba(0, 136, 255, 0.4)');
    gradient.addColorStop(1, 'transparent');

    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, coreRadius * 2, 0, Math.PI * 2);
    this.ctx.fill();

    // Central Triangular Palladium Core (Iconic Mark 6 / Avengers Reactor)
    this.ctx.rotate(this.angle3);
    this.ctx.strokeStyle = primaryColor;
    this.ctx.lineWidth = 2.5;
    this.ctx.shadowColor = primaryColor;
    this.ctx.shadowBlur = 15;

    this.ctx.beginPath();
    const triR = coreRadius * 0.95;
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(a) * triR;
      const y = Math.sin(a) * triR;
      if (i === 0) this.ctx.moveTo(x, y);
      else this.ctx.lineTo(x, y);
    }
    this.ctx.closePath();
    this.ctx.stroke();

    // Inverted inner triangle
    this.ctx.beginPath();
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + Math.PI / 2;
      const x = Math.cos(a) * (triR * 0.55);
      const y = Math.sin(a) * (triR * 0.55);
      if (i === 0) this.ctx.moveTo(x, y);
      else this.ctx.lineTo(x, y);
    }
    this.ctx.closePath();
    this.ctx.stroke();

    // Blinding white center repulsor star
    this.ctx.fillStyle = '#ffffff';
    this.ctx.shadowColor = '#ffffff';
    this.ctx.shadowBlur = 12;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, coreRadius * 0.35, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }
}

// Global initialization helper
window.ArcReactorHUD = ArcReactorHUD;
