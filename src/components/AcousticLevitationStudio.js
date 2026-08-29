import React, { useState, useEffect, useRef, useCallback } from "react";

// Acoustic Themes & Color Palettes
const THEMES = {
  deepSpace: {
    id: "deepSpace",
    name: "Deep Space Neon",
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    accentText: "text-cyan-400",
    border: "border-cyan-500/40",
    bgGradient: "from-slate-950 via-cyan-950/30 to-slate-950",
    buttonBg: "bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold",
    canvasBg: "#060913",
    wavePrimary: "rgba(0, 240, 255, 0.4)",
    waveSecondary: "rgba(168, 85, 247, 0.3)",
    nodeColor: "rgba(0, 240, 255, 0.8)",
    particleGlow: "#00f0ff",
    heatmapLow: "rgba(6, 9, 19, 0)",
    heatmapHigh: "rgba(0, 240, 255, 0.35)",
  },
  laserEmerald: {
    id: "laserEmerald",
    name: "Laser Emerald Grid",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    accentText: "text-emerald-400",
    border: "border-emerald-500/40",
    bgGradient: "from-slate-950 via-emerald-950/30 to-slate-950",
    buttonBg: "bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold",
    canvasBg: "#030f08",
    wavePrimary: "rgba(16, 185, 129, 0.45)",
    waveSecondary: "rgba(52, 211, 153, 0.3)",
    nodeColor: "rgba(52, 211, 153, 0.85)",
    particleGlow: "#10b981",
    heatmapLow: "rgba(3, 15, 8, 0)",
    heatmapHigh: "rgba(16, 185, 129, 0.35)",
  },
  solarPlasma: {
    id: "solarPlasma",
    name: "Solar Plasma",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    accentText: "text-amber-400",
    border: "border-amber-500/40",
    bgGradient: "from-slate-950 via-amber-950/30 to-slate-950",
    buttonBg: "bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold",
    canvasBg: "#120802",
    wavePrimary: "rgba(245, 158, 11, 0.45)",
    waveSecondary: "rgba(251, 191, 36, 0.3)",
    nodeColor: "rgba(251, 191, 36, 0.85)",
    particleGlow: "#f59e0b",
    heatmapLow: "rgba(18, 8, 2, 0)",
    heatmapHigh: "rgba(245, 158, 11, 0.35)",
  },
  voidInfrared: {
    id: "voidInfrared",
    name: "Void Crimson",
    badge: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    accentText: "text-rose-400",
    border: "border-rose-500/40",
    bgGradient: "from-slate-950 via-rose-950/30 to-slate-950",
    buttonBg: "bg-rose-600 hover:bg-rose-500 text-white font-bold",
    canvasBg: "#120306",
    wavePrimary: "rgba(244, 63, 94, 0.45)",
    waveSecondary: "rgba(251, 113, 133, 0.3)",
    nodeColor: "rgba(251, 113, 133, 0.85)",
    particleGlow: "#f43f5e",
    heatmapLow: "rgba(18, 3, 6, 0)",
    heatmapHigh: "rgba(244, 63, 94, 0.35)",
  },
};

// Particle Material Types
const PARTICLE_TYPES = {
  mercury: {
    id: "mercury",
    name: "Liquid Mercury",
    density: 13.5,
    radius: 7,
    color: "#e2e8f0",
    glow: "#cbd5e1",
    desc: "Dense metallic fluid drops with specular light reflections",
  },
  quantumDot: {
    id: "quantumDot",
    name: "Quantum Dot",
    density: 2.1,
    radius: 5,
    color: "#38bdf8",
    glow: "#00f0ff",
    desc: "Fluorescent semiconducting nanoparticles with glowing trails",
  },
  droplet: {
    id: "droplet",
    name: "Water Droplet",
    density: 1.0,
    radius: 6,
    color: "#60a5fa",
    glow: "#93c5fd",
    desc: "Aqueous sphere displaying surface tension deformation",
  },
  styrofoam: {
    id: "styrofoam",
    name: "Styrofoam Bead",
    density: 0.05,
    radius: 8,
    color: "#f8fafc",
    glow: "#ffffff",
    desc: "Ultra-lightweight polymer sphere easily trapped in acoustic nodes",
  },
};

// Array Array Configurations
const ARRAYS = {
  axial1d: {
    id: "axial1d",
    name: "Dual Opposing Transducers (1D Axial)",
    desc: "Top and bottom transducers creating a clean vertical standing wave lattice",
  },
  tractor4d: {
    id: "tractor4d",
    name: "4-Beam Quad Acoustic Tractor Field",
    desc: "Angled transducers focusing sound pressure into a central levitation focal point",
  },
  vortexRing: {
    id: "vortexRing",
    name: "Vortex Phase Ring Trap",
    desc: "Helical phase offset creating orbital angular acoustic torque",
  },
  phasedHologram: {
    id: "phasedHologram",
    name: "Holographic Phased Array",
    desc: "Multi-focal dynamic wave interference pattern with micro-traps",
  },
};

// Presets
const PRESETS = [
  {
    id: "mercury_matrix",
    name: "Liquid Mercury Node Lattice",
    desc: "Multiple heavy mercury droplets trapped at harmonic pressure nodes",
    theme: "deepSpace",
    arrayType: "axial1d",
    particleType: "mercury",
    frequency: 40,
    amplitude: 155,
    phase: 0,
    gravity: 9.8,
    particleCount: 7,
    cavitationMode: false,
  },
  {
    id: "sonoluminescence_burst",
    name: "Sonoluminescence Cavitation Flash",
    desc: "Extreme sound pressure causing microbubble implosion and UV light flashes",
    theme: "voidInfrared",
    arrayType: "axial1d",
    particleType: "droplet",
    frequency: 28,
    amplitude: 172,
    phase: 0,
    gravity: 0,
    particleCount: 4,
    cavitationMode: true,
  },
  {
    id: "tractor_drag",
    name: "4-Beam Acoustic Tractor Beam",
    desc: "Focused ultrasonic quadrant trapping quantum dots against high gravity",
    theme: "laserEmerald",
    arrayType: "tractor4d",
    particleType: "quantumDot",
    frequency: 52,
    amplitude: 162,
    phase: 45,
    gravity: 12,
    particleCount: 10,
    cavitationMode: false,
  },
  {
    id: "vortex_orbit",
    name: "Vortex Spin Levitation",
    desc: "Orbital angular momentum causing levitated styrofoam beads to swirl in ring traps",
    theme: "solarPlasma",
    arrayType: "vortexRing",
    particleType: "styrofoam",
    frequency: 45,
    amplitude: 150,
    phase: 90,
    gravity: 4.5,
    particleCount: 12,
    cavitationMode: false,
  },
];

export default function AcousticLevitationStudio() {
  // Studio Settings State
  const [themeKey, setThemeKey] = useState("deepSpace");
  const [arrayType, setArrayType] = useState("axial1d");
  const [particleType, setParticleType] = useState("droplet");
  
  // Physics Parameters
  const [frequency, setFrequency] = useState(40); // kHz (20 - 80)
  const [amplitude, setAmplitude] = useState(150); // dB SPL (100 - 180)
  const [phase, setPhase] = useState(0); // Degrees (0 - 180)
  const [gravity, setGravity] = useState(9.8); // m/s^2 (0 - 25)
  const [isPlaying, setIsPlaying] = useState(true);
  const [cavitationMode, setCavitationMode] = useState(false);
  
  // Overlay Visibility Toggles
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showNodes, setShowNodes] = useState(true);
  const [showVectors, setShowVectors] = useState(false);
  const [showSoundWaves, setShowSoundWaves] = useState(true);
  
  // Web Audio Synth State
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [volume, setVolume] = useState(0.15);

  // Metrics State
  const [metrics, setMetrics] = useState({
    spl: 150,
    gorkovPotential: 0,
    radiationForce: 0,
    stabilityPct: 98,
    trappedCount: 0,
  });

  // Hover Info State
  const [hoverInfo, setHoverInfo] = useState(null);

  // Canvas Refs & Animation
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const particlesRef = useRef([]);
  const flashesRef = useRef([]);
  const draggedParticleRef = useRef(null);
  
  // Web Audio Refs
  const audioCtxRef = useRef(null);
  const osc1Ref = useRef(null);
  const osc2Ref = useRef(null);
  const gainNodeRef = useRef(null);

  const activeTheme = THEMES[themeKey] || THEMES.deepSpace;
  const activeParticleMat = PARTICLE_TYPES[particleType] || PARTICLE_TYPES.droplet;

  // Initialize Audio Context & Oscillator Nodes
  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.connect(ctx.destination);

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();

      osc1.type = "sine";
      osc2.type = "triangle";

      // Map ultrasonic frequency (20-80kHz) down to audible binaural tone (120 - 480Hz)
      const baseFreq = (frequency / 40) * 220;
      osc1.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      osc2.frequency.setValueAtTime(baseFreq * 1.5, ctx.currentTime);

      osc1.connect(gain);
      osc2.connect(gain);

      osc1.start();
      osc2.start();

      audioCtxRef.current = ctx;
      osc1Ref.current = osc1;
      osc2Ref.current = osc2;
      gainNodeRef.current = gain;
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  }, [frequency, volume]);

  const toggleAudio = () => {
    if (!audioEnabled) {
      initAudio();
      if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }
      setAudioEnabled(true);
    } else {
      if (audioCtxRef.current) {
        audioCtxRef.current.suspend();
      }
      setAudioEnabled(false);
    }
  };

  // Update Audio synth tone when parameters change
  useEffect(() => {
    if (audioEnabled && audioCtxRef.current && osc1Ref.current && gainNodeRef.current) {
      const baseFreq = (frequency / 40) * 220;
      const ctx = audioCtxRef.current;
      osc1Ref.current.frequency.setTargetAtTime(baseFreq, ctx.currentTime, 0.05);
      if (osc2Ref.current) {
        osc2Ref.current.frequency.setTargetAtTime(baseFreq * 1.5, ctx.currentTime, 0.05);
      }
      gainNodeRef.current.gain.setTargetAtTime(volume, ctx.currentTime, 0.05);
    }
  }, [frequency, amplitude, volume, audioEnabled]);

  // Clean up Audio on unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  // Spawn initial set of particles
  const resetParticles = useCallback((count = 6, typeKey = particleType) => {
    const mat = PARTICLE_TYPES[typeKey] || PARTICLE_TYPES.droplet;
    const canvas = canvasRef.current;
    const width = canvas ? canvas.width : 800;
    const height = canvas ? canvas.height : 500;
    
    const newParticles = [];
    const wavelengthPx = 800 / (frequency / 4);

    for (let i = 0; i < count; i++) {
      // Place near acoustic nodes along the vertical line
      const nodeIndex = Math.floor((i + 1) * 1.2);
      const targetY = height / 2 + (i - count / 2) * (wavelengthPx / 2) + (Math.random() - 0.5) * 15;
      
      newParticles.push({
        id: Math.random(),
        x: width / 2 + (Math.random() - 0.5) * 40,
        y: Math.max(80, Math.min(height - 80, targetY)),
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: mat.radius + (Math.random() - 0.5) * 2,
        type: typeKey,
        phaseOffset: Math.random() * Math.PI * 2,
        trapped: true,
      });
    }
    particlesRef.current = newParticles;
    flashesRef.current = [];
  }, [frequency, particleType]);

  // Load preset function
  const applyPreset = (preset) => {
    setThemeKey(preset.theme);
    setArrayType(preset.arrayType);
    setParticleType(preset.particleType);
    setFrequency(preset.frequency);
    setAmplitude(preset.amplitude);
    setPhase(preset.phase);
    setGravity(preset.gravity);
    setCavitationMode(preset.cavitationMode);
    resetParticles(preset.particleCount, preset.particleType);
  };

  // Acoustic Potential & Sound Pressure Calculation at (x, y)
  const calcAcousticState = useCallback((x, y, w, h, time) => {
    const fKHz = frequency;
    const wavelengthPx = (h * 0.7) / (fKHz / 10);
    const k = (2 * Math.PI) / wavelengthPx; // Wave number
    const p0 = (amplitude / 150) * 10; // Sound Pressure scaling
    const radPhase = (phase * Math.PI) / 180;
    const centerY = h / 2;
    const centerX = w / 2;

    let pressure = 0;
    let gorkovPotential = 0;

    if (arrayType === "axial1d") {
      // Standing wave along Y: p(y,t) = 2*P0 * cos(k*y) * cos(omega*t)
      const distY = y - centerY;
      const waveVal = Math.cos(k * distY + radPhase);
      pressure = p0 * waveVal * Math.cos(time * 0.05);

      // Gor'kov potential U ~ <p^2> - const * <v^2>
      // Potential minimums occur at pressure nodes where cos(k*y) = 0
      const meanP2 = 0.5 * Math.pow(p0 * Math.cos(k * distY + radPhase), 2);
      const meanV2 = 0.5 * Math.pow(p0 * Math.sin(k * distY + radPhase), 2);
      gorkovPotential = meanP2 - 0.6 * meanV2;
    } else if (arrayType === "tractor4d") {
      // 4 quadrant angled beams focusing in center
      const dx = x - centerX;
      const dy = y - centerY;
      const r = Math.sqrt(dx * dx + dy * dy);
      const angleWave = Math.cos(k * r - time * 0.03 + radPhase);
      const Gaussian = Math.exp(-(r * r) / (w * w * 0.08));
      pressure = p0 * angleWave * Gaussian;
      gorkovPotential = 0.5 * Math.pow(pressure, 2) + r * 0.05;
    } else if (arrayType === "vortexRing") {
      // Vortex Phase Trap with orbital angular momentum
      const dx = x - centerX;
      const dy = y - centerY;
      const r = Math.sqrt(dx * dx + dy * dy);
      const theta = Math.atan2(dy, dx);
      const ringRadius = 80;
      const ringDist = Math.abs(r - ringRadius);
      const vortexWave = Math.cos(2 * theta + k * ringDist - time * 0.04);
      pressure = p0 * vortexWave * Math.exp(-(ringDist * ringDist) / 1200);
      gorkovPotential = Math.pow(ringDist, 2) * 0.02 - pressure * 0.3;
    } else {
      // Phased Hologram array
      const distY = y - centerY;
      const dx = x - centerX;
      const holoWave = Math.cos(k * distY) * Math.cos(k * 0.4 * dx + radPhase);
      pressure = p0 * holoWave;
      gorkovPotential = 0.5 * Math.pow(pressure, 2);
    }

    return { pressure, gorkovPotential, wavelengthPx, k };
  }, [frequency, amplitude, phase, arrayType]);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let animTime = 0;

    // Initialize initial particles if empty
    if (particlesRef.current.length === 0) {
      resetParticles(6, particleType);
    }

    const render = () => {
      animTime += 1;
      const w = canvas.width;
      const h = canvas.height;
      const theme = activeTheme;
      const mat = activeParticleMat;

      // 1. Clear & Background
      ctx.fillStyle = theme.canvasBg;
      ctx.fillRect(0, 0, w, h);

      // 2. Draw Transducer Arrays Hardware Visuals
      ctx.save();
      const topY = 40;
      const botY = h - 40;

      if (arrayType === "axial1d") {
        // Top Transducer Array
        const gradientTop = ctx.createLinearGradient(0, 0, 0, topY);
        gradientTop.addColorStop(0, "#1e293b");
        gradientTop.addColorStop(1, "#0f172a");
        ctx.fillStyle = gradientTop;
        ctx.strokeStyle = theme.particleGlow;
        ctx.lineWidth = 2;
        ctx.fillRect(w * 0.2, 0, w * 0.6, topY);
        ctx.strokeRect(w * 0.2, 0, w * 0.6, topY);

        // Draw individual transducer elements
        const elemCount = 12;
        const elemWidth = (w * 0.58) / elemCount;
        for (let i = 0; i < elemCount; i++) {
          const ex = w * 0.21 + i * elemWidth;
          ctx.fillStyle = (i + animTime) % 2 === 0 ? theme.wavePrimary : "#334155";
          ctx.fillRect(ex, topY - 12, elemWidth - 4, 10);
        }

        // Bottom Transducer Array
        ctx.fillRect(w * 0.2, botY, w * 0.6, topY);
        ctx.strokeRect(w * 0.2, botY, w * 0.6, topY);
        for (let i = 0; i < elemCount; i++) {
          const ex = w * 0.21 + i * elemWidth;
          ctx.fillStyle = (i + animTime) % 2 === 0 ? theme.wavePrimary : "#334155";
          ctx.fillRect(ex, botY + 2, elemWidth - 4, 10);
        }
      } else if (arrayType === "tractor4d") {
        // 4 Angled Transducers in corner quadrants
        ctx.strokeStyle = theme.particleGlow;
        ctx.lineWidth = 3;
        [
          { x: 60, y: 60, angle: Math.PI / 4 },
          { x: w - 60, y: 60, angle: (3 * Math.PI) / 4 },
          { x: 60, y: h - 60, angle: -Math.PI / 4 },
          { x: w - 60, y: h - 60, angle: (-3 * Math.PI) / 4 },
        ].forEach((t) => {
          ctx.save();
          ctx.translate(t.x, t.y);
          ctx.rotate(t.angle);
          ctx.fillStyle = "#1e293b";
          ctx.fillRect(-40, -15, 80, 30);
          ctx.strokeRect(-40, -15, 80, 30);
          ctx.fillStyle = theme.wavePrimary;
          ctx.fillRect(-35, 10, 70, 4);
          ctx.restore();
        });
      } else {
        // Ring Transducer surround
        ctx.strokeStyle = theme.particleGlow;
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, Math.min(w, h) * 0.42, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.restore();

      // 3. Render Gor'kov Acoustic Potential Heatmap Overlay
      if (showHeatmap) {
        const step = 8;
        for (let y = topY; y < botY; y += step) {
          for (let x = w * 0.2; x < w * 0.8; x += step) {
            const { gorkovPotential } = calcAcousticState(x, y, w, h, animTime);
            const intensity = Math.min(1, Math.abs(gorkovPotential) / 20);
            if (intensity > 0.08) {
              ctx.fillStyle = gorkovPotential < 0 ? theme.heatmapHigh : "rgba(168, 85, 247, 0.15)";
              ctx.fillRect(x, y, step, step);
            }
          }
        }
      }

      // 4. Render Standing Wave Acoustic Field Lines
      if (showSoundWaves) {
        ctx.save();
        const { wavelengthPx } = calcAcousticState(w / 2, h / 2, w, h, animTime);
        const nodeCount = Math.floor((botY - topY) / (wavelengthPx / 2));

        for (let i = 0; i <= nodeCount; i++) {
          const waveY = topY + i * (wavelengthPx / 2);
          if (waveY >= topY && waveY <= botY) {
            const phaseShift = Math.sin(animTime * 0.08 + i) * 6;
            ctx.beginPath();
            ctx.strokeStyle = i % 2 === 0 ? theme.wavePrimary : theme.waveSecondary;
            ctx.lineWidth = 1.5;

            ctx.moveTo(w * 0.2, waveY);
            for (let x = w * 0.2; x <= w * 0.8; x += 15) {
              const dy = Math.sin((x - w * 0.2) * 0.05 + animTime * 0.1) * phaseShift;
              ctx.lineTo(x, waveY + dy);
            }
            ctx.stroke();
          }
        }
        ctx.restore();
      }

      // 5. Render Acoustic Pressure Nodes / Anti-Nodes Line Indicators
      if (showNodes) {
        ctx.save();
        const { wavelengthPx } = calcAcousticState(w / 2, h / 2, w, h, animTime);
        const nodeInterval = wavelengthPx / 2;
        ctx.setLineDash([4, 4]);

        for (let y = topY + nodeInterval / 2; y < botY; y += nodeInterval) {
          ctx.strokeStyle = theme.nodeColor;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(w * 0.25, y);
          ctx.lineTo(w * 0.75, y);
          ctx.stroke();

          // Node Label
          ctx.fillStyle = theme.nodeColor;
          ctx.font = "10px monospace";
          ctx.fillText("PRESSURE NODE", w * 0.76, y + 3);
        }
        ctx.restore();
      }

      // 6. Update Physics & Render Particles
      const particles = particlesRef.current;
      let totalForceSum = 0;
      let trappedCount = 0;

      particles.forEach((p) => {
        if (!isPlaying) return;

        // Skip physics if being dragged by user mouse
        if (draggedParticleRef.current && draggedParticleRef.current.id === p.id) {
          p.vx = 0;
          p.vy = 0;
          return;
        }

        const { pressure, gorkovPotential, wavelengthPx, k } = calcAcousticState(
          p.x,
          p.y,
          w,
          h,
          animTime
        );

        // Acoustic Radiation Force: F_rad = - grad(U)
        // Approximate spatial gradient at particle position
        const delta = 2;
        const stateYPlus = calcAcousticState(p.x, p.y + delta, w, h, animTime);
        const stateYMinus = calcAcousticState(p.x, p.y - delta, w, h, animTime);
        const gradY = (stateYPlus.gorkovPotential - stateYMinus.gorkovPotential) / (2 * delta);

        const stateXPlus = calcAcousticState(p.x + delta, p.y, w, h, animTime);
        const stateXMinus = calcAcousticState(p.x - delta, p.y, w, h, animTime);
        const gradX = (stateXPlus.gorkovPotential - stateXMinus.gorkovPotential) / (2 * delta);

        // Acoustic restoring force scaling (higher SPL amplitude = stronger trapping force)
        const forceScale = (amplitude / 150) * (2.5 / mat.density);
        const fAcousticY = -gradY * forceScale * 12;
        const fAcousticX = -gradX * forceScale * 12;

        // Gravity force: F_g = m * g
        const fGravityY = (gravity * mat.density * 0.08);

        // Net acceleration
        const ay = fAcousticY + fGravityY;
        const ax = fAcousticX;

        // Air damping / viscosity
        p.vx = (p.vx + ax * 0.1) * 0.92;
        p.vy = (p.vy + ay * 0.1) * 0.92;

        p.x += p.vx;
        p.y += p.vy;

        // Canvas Boundary Collisions
        if (p.x < w * 0.22) { p.x = w * 0.22; p.vx *= -0.5; }
        if (p.x > w * 0.78) { p.x = w * 0.78; p.vx *= -0.5; }
        if (p.y < topY + 15) { p.y = topY + 15; p.vy *= -0.5; }
        if (p.y > botY - 15) { p.y = botY - 15; p.vy *= -0.5; }

        totalForceSum += Math.sqrt(fAcousticX * fAcousticX + fAcousticY * fAcousticY);
        if (Math.abs(p.vy) < 0.8 && Math.abs(p.vx) < 0.8) {
          trappedCount += 1;
        }

        // Sonoluminescence Cavitation Effect trigger
        if (cavitationMode && Math.abs(pressure) > 8.5 && Math.random() < 0.08) {
          flashesRef.current.push({
            x: p.x + (Math.random() - 0.5) * 10,
            y: p.y + (Math.random() - 0.5) * 10,
            radius: 4,
            maxRadius: 28 + Math.random() * 15,
            opacity: 1.0,
            color: theme.particleGlow,
          });
        }
      });

      // Render Particle Droplets
      particles.forEach((p) => {
        ctx.save();
        ctx.translate(p.x, p.y);

        // Particle Glow
        ctx.shadowColor = mat.glow;
        ctx.shadowBlur = 15;

        if (p.type === "mercury") {
          // Specular metallic gradient
          const radGrad = ctx.createRadialGradient(
            -p.radius * 0.3,
            -p.radius * 0.3,
            1,
            0,
            0,
            p.radius
          );
          radGrad.addColorStop(0, "#ffffff");
          radGrad.addColorStop(0.4, "#cbd5e1");
          radGrad.addColorStop(1, "#475569");
          ctx.fillStyle = radGrad;
          ctx.beginPath();
          ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === "quantumDot") {
          // Fluorescent neon sphere
          ctx.fillStyle = theme.particleGlow;
          ctx.beginPath();
          ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
          ctx.fill();

          // Particle Trail
          ctx.strokeStyle = theme.wavePrimary;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(-p.vx * 4, -p.vy * 4);
          ctx.stroke();
        } else if (p.type === "droplet") {
          // Surface tension deformation (ellipsoid oscillation)
          const deformY = 1 + Math.sin(animTime * 0.2 + p.phaseOffset) * 0.15;
          const deformX = 1 / deformY;

          ctx.scale(deformX, deformY);
          const dropGrad = ctx.createRadialGradient(
            -p.radius * 0.2,
            -p.radius * 0.2,
            1,
            0,
            0,
            p.radius
          );
          dropGrad.addColorStop(0, "rgba(224, 242, 254, 0.95)");
          dropGrad.addColorStop(0.6, "rgba(56, 189, 248, 0.7)");
          dropGrad.addColorStop(1, "rgba(3, 105, 161, 0.9)");

          ctx.fillStyle = dropGrad;
          ctx.beginPath();
          ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Styrofoam bead
          ctx.fillStyle = "#f8fafc";
          ctx.beginPath();
          ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#94a3b8";
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Draw Restoring Force Vector Arrows if enabled
        if (showVectors) {
          ctx.restore();
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.strokeStyle = "#f43f5e";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(p.vx * 8, p.vy * 8);
          ctx.stroke();
        }

        ctx.restore();
      });

      // 7. Render Sonoluminescence Cavitation Shockwave Flashes
      flashesRef.current.forEach((flash, index) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(flash.x, flash.y, flash.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${flash.opacity})`;
        ctx.lineWidth = 3;
        ctx.shadowColor = flash.color;
        ctx.shadowBlur = 20;
        ctx.stroke();

        // Inner flash core
        ctx.fillStyle = `rgba(255, 255, 255, ${flash.opacity * 0.8})`;
        ctx.beginPath();
        ctx.arc(flash.x, flash.y, flash.radius * 0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Expand flash
        flash.radius += 2.5;
        flash.opacity -= 0.05;
      });
      flashesRef.current = flashesRef.current.filter((f) => f.opacity > 0);

      // 8. Update Metrics Panel Data
      if (animTime % 15 === 0) {
        const avgForce = particles.length > 0 ? (totalForceSum / particles.length).toFixed(2) : "0.00";
        const stability = particles.length > 0 ? Math.round((trappedCount / particles.length) * 100) : 100;
        const gorkovVal = calcAcousticState(w / 2, h / 2, w, h, animTime).gorkovPotential.toFixed(3);

        setMetrics({
          spl: amplitude,
          gorkovPotential: gorkovVal,
          radiationForce: avgForce,
          stabilityPct: stability,
          trappedCount: trappedCount,
        });
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [
    activeTheme,
    activeParticleMat,
    arrayType,
    particleType,
    frequency,
    amplitude,
    phase,
    gravity,
    isPlaying,
    cavitationMode,
    showHeatmap,
    showNodes,
    showVectors,
    showSoundWaves,
    calcAcousticState,
    resetParticles,
  ]);

  // Handle Mouse Events for Dragging & Hovering on Canvas
  const handleCanvasMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);

    // Check if clicked near an existing particle
    const particles = particlesRef.current;
    const clickedParticle = particles.find((p) => {
      const dx = p.x - mx;
      const dy = p.y - my;
      return Math.sqrt(dx * dx + dy * dy) < p.radius + 10;
    });

    if (clickedParticle) {
      draggedParticleRef.current = clickedParticle;
    } else {
      // Spawn new particle at mouse position
      const mat = PARTICLE_TYPES[particleType] || PARTICLE_TYPES.droplet;
      particlesRef.current.push({
        id: Math.random(),
        x: mx,
        y: my,
        vx: 0,
        vy: 0,
        radius: mat.radius,
        type: particleType,
        phaseOffset: Math.random() * Math.PI * 2,
        trapped: true,
      });
    }
  };

  const handleCanvasMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);

    if (draggedParticleRef.current) {
      draggedParticleRef.current.x = mx;
      draggedParticleRef.current.y = my;
    }

    // Update Hover Information Tooltip
    const acoustic = calcAcousticState(mx, my, canvas.width, canvas.height, 0);
    setHoverInfo({
      x: Math.round(mx),
      y: Math.round(my),
      pressure: acoustic.pressure.toFixed(2),
      potential: acoustic.gorkovPotential.toFixed(3),
    });
  };

  const handleCanvasMouseUp = () => {
    draggedParticleRef.current = null;
  };

  const handleCanvasMouseLeave = () => {
    draggedParticleRef.current = null;
    setHoverInfo(null);
  };

  // Export Canvas Image Snapshot
  const exportSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const imageURI = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `acoustic-levitation-${themeKey}-${Date.now()}.png`;
    link.href = imageURI;
    link.click();
  };

  return (
    <div className={`w-full min-h-screen bg-gradient-to-b ${activeTheme.bgGradient} text-slate-100 p-4 md:p-8 transition-colors duration-500 font-sans`}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Title Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                Acoustic Levitation & Standing Wave Studio
              </h1>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${activeTheme.badge}`}>
                {activeTheme.name}
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Ultrasonic Acoustic Radiation Pressure ($\mathbf{F}_{rad} = -\nabla U$), Gor'kov Potential Wells & Sonoluminescence Physics Lab
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-4 py-2 text-xs uppercase tracking-wider rounded-lg transition-all border border-slate-700 hover:border-slate-500 ${
                isPlaying ? "bg-slate-800 text-slate-200" : "bg-emerald-600 text-white font-bold"
              }`}
            >
              {isPlaying ? "Pause Sim" : "Resume Sim"}
            </button>
            <button
              onClick={() => resetParticles(particlesRef.current.length, particleType)}
              className="px-4 py-2 text-xs uppercase tracking-wider rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200"
            >
              Reset Nodes
            </button>
            <button
              onClick={exportSnapshot}
              className="px-4 py-2 text-xs uppercase tracking-wider rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200"
            >
              Snapshot
            </button>
            <button
              onClick={toggleAudio}
              className={`px-4 py-2 text-xs uppercase tracking-wider rounded-lg transition-all border ${
                audioEnabled ? "bg-cyan-600 border-cyan-400 text-slate-950 font-bold" : "bg-slate-800 border-slate-700 text-slate-300"
              }`}
            >
              {audioEnabled ? "Audio ON 🔊" : "Audio OFF 🔇"}
            </button>
          </div>
        </div>

        {/* Presets Toolbar */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-900/60 backdrop-blur-md p-3 rounded-xl border border-slate-800">
          <span className="text-xs font-bold uppercase text-slate-400 mr-2">Presets:</span>
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset)}
              className="px-3 py-1.5 text-xs rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 hover:border-slate-500 text-slate-200 transition-all"
              title={preset.desc}
            >
              {preset.name}
            </button>
          ))}
        </div>

        {/* Main Grid: Controls + Interactive Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Controls Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-5 bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl border border-slate-800/80">
            
            {/* Theme Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Spectral Visual Theme
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(THEMES).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setThemeKey(t.id)}
                    className={`px-3 py-2 text-xs rounded-lg border text-left transition-all ${
                      themeKey === t.id
                        ? `${t.badge} font-bold`
                        : "bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Array Configuration */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Transducer Array Setup
              </label>
              <select
                value={arrayType}
                onChange={(e) => setArrayType(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                {Object.values(ARRAYS).map((arr) => (
                  <option key={arr.id} value={arr.id}>
                    {arr.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Particle Material */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Particle Levitated Material
              </label>
              <select
                value={particleType}
                onChange={(e) => {
                  setParticleType(e.target.value);
                  resetParticles(particlesRef.current.length, e.target.value);
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                {Object.values(PARTICLE_TYPES).map((mat) => (
                  <option key={mat.id} value={mat.id}>
                    {mat.name} (Density: {mat.density} g/cm³)
                  </option>
                ))}
              </select>
            </div>

            {/* Sliders */}
            <div className="space-y-4 pt-2 border-t border-slate-800">
              
              {/* Ultrasonic Frequency */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-300">Ultrasonic Frequency:</span>
                  <span className={`font-mono ${activeTheme.accentText}`}>{frequency} kHz</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="80"
                  value={frequency}
                  onChange={(e) => setFrequency(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Sound Pressure Level */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-300">Sound Pressure Level (SPL):</span>
                  <span className={`font-mono ${activeTheme.accentText}`}>{amplitude} dB</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="180"
                  value={amplitude}
                  onChange={(e) => setAmplitude(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Transducer Phase Offset */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-300">Wave Phase Offset:</span>
                  <span className={`font-mono ${activeTheme.accentText}`}>{phase}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="180"
                  value={phase}
                  onChange={(e) => setPhase(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Gravity */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-300">Ambient Gravity Acceleration:</span>
                  <span className={`font-mono ${activeTheme.accentText}`}>{gravity} m/s²</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  step="0.5"
                  value={gravity}
                  onChange={(e) => setGravity(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>
            </div>

            {/* Mode & Visual Overlay Toggles */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Physics Overlay Toggles
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowHeatmap(!showHeatmap)}
                  className={`px-3 py-1.5 text-xs rounded-lg border text-left ${
                    showHeatmap ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300" : "bg-slate-800/40 border-slate-700 text-slate-400"
                  }`}
                >
                  Gor'kov Heatmap
                </button>
                <button
                  onClick={() => setShowNodes(!showNodes)}
                  className={`px-3 py-1.5 text-xs rounded-lg border text-left ${
                    showNodes ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300" : "bg-slate-800/40 border-slate-700 text-slate-400"
                  }`}
                >
                  Wave Node Lines
                </button>
                <button
                  onClick={() => setShowSoundWaves(!showSoundWaves)}
                  className={`px-3 py-1.5 text-xs rounded-lg border text-left ${
                    showSoundWaves ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300" : "bg-slate-800/40 border-slate-700 text-slate-400"
                  }`}
                >
                  Pressure Waves
                </button>
                <button
                  onClick={() => setShowVectors(!showVectors)}
                  className={`px-3 py-1.5 text-xs rounded-lg border text-left ${
                    showVectors ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300" : "bg-slate-800/40 border-slate-700 text-slate-400"
                  }`}
                >
                  Force Vectors
                </button>
              </div>

              {/* Sonoluminescence Cavitation Toggle */}
              <button
                onClick={() => setCavitationMode(!cavitationMode)}
                className={`w-full mt-2 px-3 py-2 text-xs font-bold rounded-lg border transition-all ${
                  cavitationMode
                    ? "bg-rose-500/20 border-rose-500 text-rose-300 shadow-lg shadow-rose-950/50"
                    : "bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800"
                }`}
              >
                {cavitationMode ? "⚡ Sonoluminescence Cavitation ACTIVE" : "Enable Sonoluminescence Cavitation Mode"}
              </button>
            </div>

          </div>

          {/* Canvas + Metrics Display (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Interactive Canvas Container */}
            <div className="relative bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
              <canvas
                ref={canvasRef}
                width={800}
                height={500}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseLeave}
                className="w-full h-auto cursor-crosshair block"
              />

              {/* Hover Tooltip Overlay */}
              {hoverInfo && (
                <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md border border-slate-700 p-2.5 rounded-lg text-xs font-mono space-y-1 text-slate-200 pointer-events-none shadow-lg">
                  <div>Cursor: ({hoverInfo.x}, {hoverInfo.y})</div>
                  <div>Acoustic Pressure: <span className="text-cyan-400">{hoverInfo.pressure} kPa</span></div>
                  <div>Gor'kov Potential: <span className="text-purple-400">{hoverInfo.potential} fJ</span></div>
                </div>
              )}

              {/* Interactive Help Hint */}
              <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-sm border border-slate-800 px-3 py-1.5 rounded-lg text-[11px] text-slate-400 pointer-events-none">
                💡 Click canvas to insert particle • Drag particle to test acoustic restoring force
              </div>
            </div>

            {/* Real-time Telemetry Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/60 backdrop-blur-md p-4 rounded-xl border border-slate-800">
              <div className="space-y-0.5">
                <span className="text-[11px] uppercase tracking-wider text-slate-400">Peak Sound Pressure</span>
                <div className={`text-xl font-mono font-bold ${activeTheme.accentText}`}>{metrics.spl} dB SPL</div>
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] uppercase tracking-wider text-slate-400">Gor'kov Potential Well</span>
                <div className="text-xl font-mono font-bold text-purple-400">{metrics.gorkovPotential} fJ</div>
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] uppercase tracking-wider text-slate-400">Radiation Force F_rad</span>
                <div className="text-xl font-mono font-bold text-emerald-400">{metrics.radiationForce} µN</div>
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] uppercase tracking-wider text-slate-400">Node Trap Stability</span>
                <div className="text-xl font-mono font-bold text-amber-400">{metrics.stabilityPct}%</div>
              </div>
            </div>

            {/* Educational Description Panel */}
            <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/60 text-xs text-slate-400 leading-relaxed space-y-2">
              <div className="font-bold text-slate-200 uppercase tracking-wider">Acoustic Physics Summary</div>
              <p>
                Acoustic levitation utilizes high-intensity ultrasonic standing waves to counter gravitational acceleration. 
                When counter-propagating ultrasonic waves interfere, they form fixed <strong>pressure nodes</strong> (zero pressure fluctuation) and <strong>antinodes</strong>. 
                Small particles experience an <strong>Acoustic Radiation Force</strong> ($\mathbf{F}_{rad} = -\nabla U$) directing them toward acoustic potential minimums governed by the Gor'kov potential field equation.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
