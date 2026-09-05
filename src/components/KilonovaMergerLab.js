import React, { useState, useEffect, useRef, useCallback } from "react";

// Multispectral Telescopes & Color Palette Configurations
const TELESCOPES = {
  jwstInfrared: {
    id: "jwstInfrared",
    name: "JWST NIRCam / MIRI (Infrared)",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    accentText: "text-amber-400",
    accentBorder: "border-amber-500/40",
    buttonBg: "bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold",
    canvasBg: "#060301",
    star1Color: "#fef08a",
    star2Color: "#fbbf24",
    gridColor: "rgba(245, 158, 11, 0.15)",
    gridActiveColor: "rgba(252, 211, 77, 0.4)",
    ejectaColors: ["#fef08a", "#f59e0b", "#d97706", "#b45309", "#78350f"],
    jetColor: "rgba(254, 240, 138, 0.9)",
    discColors: ["#fbbf24", "#d97706", "#92400e"],
    goldGlow: "rgba(245, 158, 11, 0.35)",
    textHeader: "James Webb Deep Infrared View",
  },
  chandraXray: {
    id: "chandraXray",
    name: "Chandra X-Ray Observatory (0.5 - 8 keV)",
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    accentText: "text-cyan-400",
    accentBorder: "border-cyan-500/40",
    buttonBg: "bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold",
    canvasBg: "#01060a",
    star1Color: "#e0f2fe",
    star2Color: "#38bdf8",
    gridColor: "rgba(56, 189, 248, 0.15)",
    gridActiveColor: "rgba(186, 230, 253, 0.4)",
    ejectaColors: ["#e0f2fe", "#38bdf8", "#0284c7", "#818cf8", "#c084fc"],
    jetColor: "rgba(56, 189, 248, 0.95)",
    discColors: ["#38bdf8", "#6366f1", "#4338ca"],
    goldGlow: "rgba(56, 189, 248, 0.35)",
    textHeader: "Chandra Relativistic X-Ray Field",
  },
  ligoSpacetime: {
    id: "ligoSpacetime",
    name: "LIGO / Virgo Spacetime Interferometry",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    accentText: "text-emerald-400",
    accentBorder: "border-emerald-500/40",
    buttonBg: "bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold",
    canvasBg: "#020805",
    star1Color: "#a7f3d0",
    star2Color: "#34d399",
    gridColor: "rgba(52, 211, 153, 0.25)",
    gridActiveColor: "rgba(167, 243, 208, 0.6)",
    ejectaColors: ["#a7f3d0", "#34d399", "#059669", "#047857", "#064e3b"],
    jetColor: "rgba(167, 243, 208, 0.9)",
    discColors: ["#34d399", "#059669", "#022c22"],
    goldGlow: "rgba(52, 211, 153, 0.35)",
    textHeader: "Spacetime Strain Wave Distortion",
  },
  hubbleOptical: {
    id: "hubbleOptical",
    name: "Hubble Space Telescope (UV / Optical)",
    badge: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    accentText: "text-rose-400",
    accentBorder: "border-rose-500/40",
    buttonBg: "bg-rose-600 hover:bg-rose-500 text-white font-bold",
    canvasBg: "#080204",
    star1Color: "#fecdd3",
    star2Color: "#f43f5e",
    gridColor: "rgba(244, 63, 94, 0.15)",
    gridActiveColor: "rgba(254, 205, 211, 0.4)",
    ejectaColors: ["#fff1f2", "#fda4af", "#f43f5e", "#e11d48", "#9f1239"],
    jetColor: "rgba(253, 164, 175, 0.95)",
    discColors: ["#fb7185", "#e11d48", "#881337"],
    goldGlow: "rgba(244, 63, 94, 0.35)",
    textHeader: "Hubble Ultra-Deep Optical Field",
  },
  magnetarHyper: {
    id: "magnetarHyper",
    name: "Extreme Magnetar Polarimetry",
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    accentText: "text-purple-400",
    accentBorder: "border-purple-500/40",
    buttonBg: "bg-purple-600 hover:bg-purple-500 text-white font-bold",
    canvasBg: "#050209",
    star1Color: "#f5d0fe",
    star2Color: "#c084fc",
    gridColor: "rgba(192, 132, 252, 0.15)",
    gridActiveColor: "rgba(245, 208, 254, 0.4)",
    ejectaColors: ["#f5d0fe", "#c084fc", "#9333ea", "#7e22ce", "#581c87"],
    jetColor: "rgba(245, 208, 254, 0.95)",
    discColors: ["#c084fc", "#9333ea", "#3b0764"],
    goldGlow: "rgba(192, 132, 252, 0.35)",
    textHeader: "Quantum Magnetic Flux Domain",
  },
};

// Simulation Presets
const PRESETS = [
  {
    id: "equal_binary",
    name: "Standard Equal Mass Binary (1.4 + 1.4 M☉)",
    desc: "Symmetrical neutron star merger producing prompt r-process nucleosynthesis.",
    massRatio: 1.0,
    magneticField: 4.5,
    decaySpeed: 1.0,
    ejectaVel: 0.25,
    yieldMultiplier: 1.0,
  },
  {
    id: "asymmetric_mass",
    name: "Asymmetric Tidal Disruption (1.9 + 1.1 M☉)",
    desc: "Lighter companion stripped into massive tidal tail before core collision.",
    massRatio: 0.58,
    magneticField: 3.2,
    decaySpeed: 0.85,
    ejectaVel: 0.32,
    yieldMultiplier: 1.45,
  },
  {
    id: "magnetar_hyper",
    name: "Magnetar Hyper-Collision (2.2 + 2.2 M☉)",
    desc: "Colossal magnetic reconnection triggering extreme Gamma-Ray Burst jet.",
    massRatio: 1.0,
    magneticField: 9.8,
    decaySpeed: 1.2,
    ejectaVel: 0.45,
    yieldMultiplier: 2.1,
  },
  {
    id: "blackhole_ns",
    name: "Black Hole + Neutron Star Rip",
    desc: "Compact black hole tearing neutron star apart into relativistic torus.",
    massRatio: 0.35,
    magneticField: 6.0,
    decaySpeed: 1.5,
    ejectaVel: 0.38,
    yieldMultiplier: 1.8,
  },
  {
    id: "quark_fusion",
    name: "Quark Core Hyper-Fusion",
    desc: "Deconfinement of strange quarks under ultra-high density collision state.",
    massRatio: 0.9,
    magneticField: 8.0,
    decaySpeed: 0.7,
    ejectaVel: 0.5,
    yieldMultiplier: 2.5,
  },
];

export default function KilonovaMergerLab() {
  // State variables
  const [selectedTelescope, setSelectedTelescope] = useState("jwstInfrared");
  const [currentPreset, setCurrentPreset] = useState("equal_binary");
  const [isPaused, setIsPaused] = useState(false);
  const [simSpeed, setSimSpeed] = useState(1);
  const [showSpacetimeGrid, setShowSpacetimeGrid] = useState(true);
  const [showElementOverlay, setShowElementOverlay] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(false);

  // Adjustable Sliders
  const [massRatio, setMassRatio] = useState(1.0);
  const [magneticField, setMagneticField] = useState(4.5);
  const [decaySpeed, setDecaySpeed] = useState(1.0);
  const [ejectaVel, setEjectaVel] = useState(0.25);
  const [particleDensity, setParticleDensity] = useState(1.0);
  const [audioVolume, setAudioVolume] = useState(0.3);

  // Live Simulation Status & Telemetry
  const [simPhase, setSimPhase] = useState("orbiting"); // 'orbiting' | 'merging' | 'remnant'
  const [fps, setFps] = useState(60);
  const [telemetry, setTelemetry] = useState({
    strain: "0.00",
    frequency: 45,
    separation: 120, // km
    goldYield: 0, // solar masses
    platinumYield: 0,
    uraniumYield: 0,
    temperature: "1.2 x 10^11 K",
    ejectaSpeedC: "0.25c",
  });

  // Refs
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  // Audio Context Ref
  const audioCtxRef = useRef(null);
  const chirpOscRef = useRef(null);
  const chirpGainRef = useRef(null);
  const ambientOsc1Ref = useRef(null);
  const ambientOsc2Ref = useRef(null);
  const ambientGainRef = useRef(null);

  // Physics Simulation Data state held in Ref for 60fps loop performance
  const simDataRef = useRef({
    angle: 0,
    radius: 140, // Orbital separation distance in pixels
    omega: 0.03, // Angular velocity
    time: 0,
    phase: "orbiting", // 'orbiting', 'merging', 'remnant'
    mergerProgress: 0,
    particles: [],
    jets: [],
    shockwaves: [],
    spacetimeRipples: [],
    star1Pos: { x: 0, y: 0 },
    star2Pos: { x: 0, y: 0 },
    remnantRadius: 0,
    accDiskAngle: 0,
    yieldAu: 0,
    yieldPt: 0,
    yieldU: 0,
    lastFrameTime: performance.now(),
    frameCount: 0,
    fpsTimer: performance.now(),
  });

  // Active Telescope Palette object
  const activePalette = TELESCOPES[selectedTelescope] || TELESCOPES.jwstInfrared;

  // Initialize Web Audio Engine
  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      // Chirp Oscillator
      const chirpOsc = ctx.createOscillator();
      const chirpGain = ctx.createGain();
      chirpOsc.type = "sine";
      chirpOsc.frequency.setValueAtTime(45, ctx.currentTime);
      chirpGain.gain.setValueAtTime(0, ctx.currentTime);
      chirpOsc.connect(chirpGain);
      chirpGain.connect(ctx.destination);
      chirpOsc.start();
      chirpOscRef.current = chirpOsc;
      chirpGainRef.current = chirpGain;

      // Deep Space Ambient Drone
      const amb1 = ctx.createOscillator();
      const amb2 = ctx.createOscillator();
      const ambGain = ctx.createGain();
      amb1.type = "sawtooth";
      amb2.type = "sine";
      amb1.frequency.setValueAtTime(55, ctx.currentTime);
      amb2.frequency.setValueAtTime(110, ctx.currentTime);
      ambGain.gain.setValueAtTime(0.05 * audioVolume, ctx.currentTime);

      amb1.connect(ambGain);
      amb2.connect(ambGain);
      ambGain.connect(ctx.destination);
      amb1.start();
      amb2.start();

      ambientOsc1Ref.current = amb1;
      ambientOsc2Ref.current = amb2;
      ambientGainRef.current = ambGain;
    } catch (e) {
      console.warn("Audio Context init error", e);
    }
  }, [audioVolume]);

  // Update Audio synth according to simulation state
  const updateAudioState = useCallback(() => {
    if (!audioEnabled || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const sim = simDataRef.current;

    if (ambientGainRef.current) {
      ambientGainRef.current.gain.setTargetAtTime(0.08 * audioVolume, ctx.currentTime, 0.1);
    }

    if (chirpOscRef.current && chirpGainRef.current) {
      if (sim.phase === "orbiting") {
        // Map orbital radius to chirp frequency (40 Hz -> 850 Hz)
        const freq = Math.min(1200, Math.max(40, (160 / Math.max(10, sim.radius)) * 120));
        const gainVal = Math.min(0.25, (160 / Math.max(10, sim.radius)) * 0.05) * audioVolume;
        chirpOscRef.current.frequency.setTargetAtTime(freq, ctx.currentTime, 0.05);
        chirpGainRef.current.gain.setTargetAtTime(gainVal, ctx.currentTime, 0.05);
      } else if (sim.phase === "merging") {
        chirpOscRef.current.frequency.setTargetAtTime(1200, ctx.currentTime, 0.02);
        chirpGainRef.current.gain.setTargetAtTime(0.35 * audioVolume, ctx.currentTime, 0.02);
      } else {
        chirpGainRef.current.gain.setTargetAtTime(0, ctx.currentTime, 0.2);
      }
    }
  }, [audioEnabled, audioVolume]);

  // Play Merger Explosion Sound Burst
  const triggerExplosionSound = useCallback(() => {
    if (!audioEnabled || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;

    // Sub-bass drop
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = "sine";
    subOsc.frequency.setValueAtTime(180, ctx.currentTime);
    subOsc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 1.2);
    subGain.gain.setValueAtTime(0.5 * audioVolume, ctx.currentTime);
    subGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start();
    subOsc.stop(ctx.currentTime + 1.5);

    // Noise burst for ejecta expansion
    const bufferSize = ctx.sampleRate * 1.0;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(850, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 1.0);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4 * audioVolume, ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start();
    noise.stop(ctx.currentTime + 1.0);
  }, [audioEnabled, audioVolume]);

  // Handle Preset Selection
  const applyPreset = (presetId) => {
    const p = PRESETS.find((pr) => pr.id === presetId);
    if (!p) return;
    setCurrentPreset(presetId);
    setMassRatio(p.massRatio);
    setMagneticField(p.magneticField);
    setDecaySpeed(p.decaySpeed);
    setEjectaVel(p.ejectaVel);
    resetSimulation();
  };

  // Reset Simulation State
  const resetSimulation = useCallback(() => {
    const sim = simDataRef.current;
    sim.angle = 0;
    sim.radius = 160;
    sim.omega = 0.03;
    sim.time = 0;
    sim.phase = "orbiting";
    sim.mergerProgress = 0;
    sim.particles = [];
    sim.jets = [];
    sim.shockwaves = [];
    sim.spacetimeRipples = [];
    sim.remnantRadius = 0;
    sim.yieldAu = 0;
    sim.yieldPt = 0;
    sim.yieldU = 0;

    setSimPhase("orbiting");
    setTelemetry((prev) => ({
      ...prev,
      strain: "0.05",
      frequency: 45,
      separation: 140,
      goldYield: 0,
      platinumYield: 0,
      uraniumYield: 0,
      temperature: "1.2 x 10^11 K",
    }));
  }, []);

  // Trigger Immediate Merger Impact
  const triggerMerger = useCallback(() => {
    const sim = simDataRef.current;
    if (sim.phase !== "remnant") {
      sim.radius = Math.min(sim.radius, 18);
    }
  }, []);

  // Trigger Directional Shockwave / Kinetic Impulse
  const triggerShockwave = useCallback((cx, cy) => {
    const sim = simDataRef.current;
    sim.shockwaves.push({
      x: cx,
      y: cy,
      radius: 5,
      maxRadius: 280,
      alpha: 1.0,
    });
    // Add extra kinetic energy to surrounding particles
    for (let p of sim.particles) {
      const dx = p.x - cx;
      const dy = p.y - cy;
      const dist = Math.hypot(dx, dy) || 1;
      if (dist < 180) {
        const force = (180 - dist) / 180;
        p.vx += (dx / dist) * force * 6;
        p.vy += (dy / dist) * force * 6;
      }
    }
  }, []);

  // Canvas Click Handler
  const handleCanvasClick = (e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    triggerShockwave(x, y);
  };

  // Main Canvas Rendering & Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let isSubscribed = true;

    const render = () => {
      if (!isSubscribed) return;

      const now = performance.now();
      const sim = simDataRef.current;

      // Handle FPS counting
      sim.frameCount++;
      if (now - sim.fpsTimer >= 500) {
        setFps(Math.round((sim.frameCount * 1000) / (now - sim.fpsTimer)));
        sim.frameCount = 0;
        sim.fpsTimer = now;
      }

      // Delta time adjustment
      const dt = Math.min(0.05, (now - sim.lastFrameTime) / 1000) * (isPaused ? 0 : simSpeed);
      sim.lastFrameTime = now;

      // Resize canvas to element bounding client rect
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      const centerX = width / 2;
      const centerY = height / 2;

      // 1. Draw Space Background
      ctx.fillStyle = activePalette.canvasBg;
      ctx.fillRect(0, 0, width, height);

      // Starfield dots
      ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
      for (let i = 0; i < 40; i++) {
        const sx = ((i * 137.5 + sim.time * 2) % width);
        const sy = ((i * 241.3) % height);
        ctx.fillRect(sx, sy, 1.2, 1.2);
      }

      // 2. Physics & Orbit State Updates
      if (!isPaused) {
        sim.time += dt;

        if (sim.phase === "orbiting") {
          // Gravitational wave orbital decay
          const decayRate = 12 * decaySpeed * (160 / Math.max(12, sim.radius)) ** 2.2;
          sim.radius -= decayRate * dt;

          // Keplerian orbital frequency increase
          sim.omega = 0.04 * (160 / Math.max(14, sim.radius)) ** 1.5;
          sim.angle += sim.omega * simSpeed;

          // Emit tidal ejecta particles from stars
          if (Math.random() < 0.7 * particleDensity) {
            const r1 = (sim.radius * massRatio) / (1 + massRatio);
            const x1 = centerX + Math.cos(sim.angle) * r1;
            const y1 = centerY + Math.sin(sim.angle) * r1;

            sim.particles.push({
              x: x1,
              y: y1,
              vx: -Math.sin(sim.angle) * 2 + (Math.random() - 0.5),
              vy: Math.cos(sim.angle) * 2 + (Math.random() - 0.5),
              radius: Math.random() * 2 + 1,
              alpha: 0.9,
              color: activePalette.ejectaColors[Math.floor(Math.random() * activePalette.ejectaColors.length)],
              life: 1.0,
              type: "tidal",
            });
          }

          // Emit spacetime ripples
          if (Math.random() < 0.15) {
            sim.spacetimeRipples.push({
              radius: sim.radius * 0.8,
              alpha: 0.8,
              speed: 3 + (160 / Math.max(20, sim.radius)) * 2,
            });
          }

          // Trigger Merger state transition
          if (sim.radius <= 20) {
            sim.phase = "merging";
            setSimPhase("merging");
            triggerExplosionSound();
          }
        } else if (sim.phase === "merging") {
          sim.mergerProgress += dt * 2.0;

          // Violent explosion particle burst
          for (let k = 0; k < Math.floor(18 * particleDensity); k++) {
            const pAngle = Math.random() * Math.PI * 2;
            const speed = (Math.random() * 6 + 2) * (ejectaVel / 0.25);
            sim.particles.push({
              x: centerX,
              y: centerY,
              vx: Math.cos(pAngle) * speed,
              vy: Math.sin(pAngle) * speed,
              radius: Math.random() * 3.5 + 1.5,
              alpha: 1.0,
              color: activePalette.ejectaColors[Math.floor(Math.random() * activePalette.ejectaColors.length)],
              life: 1.0,
              type: "fireball",
            });
          }

          // Relativistic GRB Jet particles
          for (let j = 0; j < Math.floor(6 * particleDensity); j++) {
            const dir = Math.random() > 0.5 ? 1 : -1;
            const spread = (Math.random() - 0.5) * 0.2;
            const jetSpeed = (Math.random() * 10 + 8) * (ejectaVel / 0.25);
            sim.jets.push({
              x: centerX,
              y: centerY,
              vx: spread * jetSpeed,
              vy: dir * jetSpeed,
              length: Math.random() * 25 + 10,
              alpha: 1.0,
              color: activePalette.jetColor,
              life: 1.0,
            });
          }

          if (sim.mergerProgress >= 1.0) {
            sim.phase = "remnant";
            setSimPhase("remnant");
          }
        } else if (sim.phase === "remnant") {
          sim.accDiskAngle += 0.05 * simSpeed;
          sim.remnantRadius = Math.min(32, sim.remnantRadius + dt * 25);

          // R-Process Heavy Element Mass Yield Accumulation
          const presetObj = PRESETS.find((pr) => pr.id === currentPreset) || PRESETS[0];
          const rate = 0.0008 * presetObj.yieldMultiplier * simSpeed;
          sim.yieldAu = Math.min(0.045, sim.yieldAu + rate);
          sim.yieldPt = Math.min(0.082, sim.yieldPt + rate * 1.8);
          sim.yieldU = Math.min(0.018, sim.yieldU + rate * 0.4);

          // Continuous gentle outflow from remnant torus
          if (Math.random() < 0.4 * particleDensity) {
            const pAngle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 2 + 0.5;
            sim.particles.push({
              x: centerX + Math.cos(pAngle) * 35,
              y: centerY + Math.sin(pAngle) * 35,
              vx: Math.cos(pAngle) * speed,
              vy: Math.sin(pAngle) * speed,
              radius: Math.random() * 2.5 + 1,
              alpha: 0.8,
              color: activePalette.ejectaColors[Math.floor(Math.random() * activePalette.ejectaColors.length)],
              life: 1.0,
              type: "rprocess",
            });
          }
        }

        // Update Audio Synth Parameters
        updateAudioState();

        // Update Telemetry Panel
        if (Math.random() < 0.2) {
          const currentFreq = Math.round(Math.min(1250, (160 / Math.max(12, sim.radius)) * 45));
          const strainVal = (
            (160 / Math.max(14, sim.radius)) *
            0.15 *
            (sim.phase === "merging" ? 3.5 : 1)
          ).toFixed(2);
          setTelemetry({
            strain: strainVal,
            frequency: sim.phase === "remnant" ? 0 : currentFreq,
            separation: sim.phase === "remnant" ? 0 : Math.round(Math.max(0, sim.radius * 0.8)),
            goldYield: sim.yieldAu.toFixed(4),
            platinumYield: sim.yieldPt.toFixed(4),
            uraniumYield: sim.yieldU.toFixed(4),
            temperature:
              sim.phase === "merging"
                ? "3.8 x 10^11 K"
                : sim.phase === "remnant"
                ? "4.5 x 10^10 K"
                : `${(1.2 + (160 / Math.max(14, sim.radius)) * 0.5).toFixed(1)} x 10^11 K`,
            ejectaSpeedC: `${(ejectaVel * (sim.phase === "merging" ? 1.4 : 1)).toFixed(2)}c`,
          });
        }
      }

      // 3. Render Spacetime Distortion Mesh Grid
      if (showSpacetimeGrid) {
        ctx.strokeStyle = activePalette.gridColor;
        ctx.lineWidth = 1;
        const gridStep = 30;

        for (let gx = 0; gx <= width; gx += gridStep) {
          ctx.beginPath();
          for (let gy = 0; gy <= height; gy += 15) {
            const dx1 = gx - (centerX + Math.cos(sim.angle) * ((sim.radius * massRatio) / (1 + massRatio)));
            const dy1 = gy - (centerY + Math.sin(sim.angle) * ((sim.radius * massRatio) / (1 + massRatio)));
            const dist1 = Math.hypot(dx1, dy1) || 1;

            const warpFactor = sim.phase === "remnant" ? 4500 : 2500;
            const warpX = (dx1 / dist1) * (warpFactor / (dist1 + 40));
            const warpY = (dy1 / dist1) * (warpFactor / (dist1 + 40));

            if (gy === 0) ctx.moveTo(gx + warpX, gy + warpY);
            else ctx.lineTo(gx + warpX, gy + warpY);
          }
          ctx.stroke();
        }
      }

      // 4. Render Spacetime Gravitational Wave Ripples
      for (let i = sim.spacetimeRipples.length - 1; i >= 0; i--) {
        const ripple = sim.spacetimeRipples[i];
        if (!isPaused) {
          ripple.radius += ripple.speed * simSpeed;
          ripple.alpha -= 0.008 * simSpeed;
        }

        if (ripple.alpha <= 0 || ripple.radius > Math.max(width, height)) {
          sim.spacetimeRipples.splice(i, 1);
          continue;
        }

        ctx.strokeStyle = activePalette.gridActiveColor;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = ripple.alpha;
        ctx.beginPath();
        ctx.arc(centerX, centerY, ripple.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      }

      // 5. Render User Click Kinetic Shockwaves
      for (let i = sim.shockwaves.length - 1; i >= 0; i--) {
        const sw = sim.shockwaves[i];
        if (!isPaused) {
          sw.radius += 8 * simSpeed;
          sw.alpha -= 0.02 * simSpeed;
        }

        if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
          sim.shockwaves.splice(i, 1);
          continue;
        }

        ctx.strokeStyle = activePalette.jetColor;
        ctx.lineWidth = 2.5;
        ctx.globalAlpha = sw.alpha;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      }

      // 6. Render Relativistic Gamma-Ray Burst (GRB) Jets
      for (let i = sim.jets.length - 1; i >= 0; i--) {
        const jet = sim.jets[i];
        if (!isPaused) {
          jet.x += jet.vx * simSpeed;
          jet.y += jet.vy * simSpeed;
          jet.alpha -= 0.015 * simSpeed;
        }

        if (jet.alpha <= 0) {
          sim.jets.splice(i, 1);
          continue;
        }

        ctx.fillStyle = jet.color;
        ctx.globalAlpha = jet.alpha;
        ctx.beginPath();
        ctx.arc(jet.x, jet.y, Math.random() * 3 + 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      // 7. Render Particles (Tidal Ejecta & R-Process Fireball)
      for (let i = sim.particles.length - 1; i >= 0; i--) {
        const p = sim.particles[i];
        if (!isPaused) {
          p.x += p.vx * simSpeed;
          p.y += p.vy * simSpeed;
          p.vx *= 0.99;
          p.vy *= 0.99;
          p.life -= 0.006 * simSpeed;
          p.alpha = Math.max(0, p.life);
        }

        if (p.life <= 0) {
          sim.particles.splice(i, 1);
          continue;
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      // 8. Render Central Binary Compact Stars OR Hypermassive Remnant
      if (sim.phase === "orbiting" || sim.phase === "merging") {
        // Calculate binary positions based on mass ratio q = M2 / M1
        const r1 = (sim.radius * massRatio) / (1 + massRatio);
        const r2 = sim.radius / (1 + massRatio);

        const x1 = centerX + Math.cos(sim.angle) * r1;
        const y1 = centerY + Math.sin(sim.angle) * r1;
        const x2 = centerX - Math.cos(sim.angle) * r2;
        const y2 = centerY - Math.sin(sim.angle) * r2;

        sim.star1Pos = { x: x1, y: y1 };
        sim.star2Pos = { x: x2, y: y2 };

        // Magnetic Field Lines between stars
        if (magneticField > 0) {
          ctx.strokeStyle = activePalette.gridActiveColor;
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          const cpX = centerX + Math.sin(sim.angle * 2) * (sim.radius * 0.6);
          const cpY = centerY - Math.cos(sim.angle * 2) * (sim.radius * 0.6);
          ctx.quadraticCurveTo(cpX, cpY, x2, y2);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Render Star 1 Glow & Core
        const star1Radius = 14 * Math.cbrt(1 / massRatio);
        const grad1 = ctx.createRadialGradient(x1, y1, 2, x1, y1, star1Radius * 2.5);
        grad1.addColorStop(0, "#ffffff");
        grad1.addColorStop(0.4, activePalette.star1Color);
        grad1.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = grad1;
        ctx.beginPath();
        ctx.arc(x1, y1, star1Radius * 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(x1, y1, star1Radius * 0.8, 0, Math.PI * 2);
        ctx.fill();

        // Render Star 2 Glow & Core
        const star2Radius = 14 * Math.cbrt(massRatio);
        const grad2 = ctx.createRadialGradient(x2, y2, 2, x2, y2, star2Radius * 2.5);
        grad2.addColorStop(0, "#ffffff");
        grad2.addColorStop(0.4, activePalette.star2Color);
        grad2.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = grad2;
        ctx.beginPath();
        ctx.arc(x2, y2, star2Radius * 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(x2, y2, star2Radius * 0.8, 0, Math.PI * 2);
        ctx.fill();

        // If merging, render intense central burst aura
        if (sim.phase === "merging") {
          const burstGrad = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, 120);
          burstGrad.addColorStop(0, "#ffffff");
          burstGrad.addColorStop(0.3, activePalette.jetColor);
          burstGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = burstGrad;
          ctx.beginPath();
          ctx.arc(centerX, centerY, 120, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (sim.phase === "remnant") {
        // Render Swirling Accretion Torus / Toroidal Disk
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(sim.accDiskAngle);

        for (let r = 55; r >= 22; r -= 4) {
          ctx.strokeStyle = activePalette.discColors[r % activePalette.discColors.length];
          ctx.lineWidth = 3.5;
          ctx.globalAlpha = 0.65;
          ctx.beginPath();
          ctx.ellipse(0, 0, r * 1.6, r * 0.7, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
        ctx.globalAlpha = 1.0;

        // Central Hypermassive Black Hole / Compact Core
        const coreGrad = ctx.createRadialGradient(centerX, centerY, 2, centerX, centerY, 35);
        coreGrad.addColorStop(0, "#000000");
        coreGrad.addColorStop(0.4, "#000000");
        coreGrad.addColorStop(0.7, activePalette.star1Color);
        coreGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 35, 0, Math.PI * 2);
        ctx.fill();

        // Bipolar GRB Relativistic Jet Cones
        const jetGrad = ctx.createLinearGradient(centerX, centerY - 250, centerX, centerY + 250);
        jetGrad.addColorStop(0, "rgba(255, 255, 255, 0.9)");
        jetGrad.addColorStop(0.4, activePalette.jetColor);
        jetGrad.addColorStop(0.5, "rgba(0, 0, 0, 0)");
        jetGrad.addColorStop(0.6, activePalette.jetColor);
        jetGrad.addColorStop(1, "rgba(255, 255, 255, 0.9)");

        ctx.fillStyle = jetGrad;
        ctx.beginPath();
        // Top Jet Cone
        ctx.moveTo(centerX - 4, centerY);
        ctx.lineTo(centerX - 35, centerY - 240);
        ctx.lineTo(centerX + 35, centerY - 240);
        ctx.lineTo(centerX + 4, centerY);
        // Bottom Jet Cone
        ctx.lineTo(centerX + 35, centerY + 240);
        ctx.lineTo(centerX - 35, centerY + 240);
        ctx.closePath();
        ctx.fill();
      }

      // 9. Element Nucleosynthesis Overlay Badge on Canvas
      if (showElementOverlay && sim.phase === "remnant") {
        ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
        ctx.strokeStyle = "rgba(245, 158, 11, 0.4)";
        ctx.lineWidth = 1;
        ctx.roundRect(16, 16, 210, 95, 12);
        ctx.fill();
        ctx.stroke();

        ctx.font = "bold 12px Inter, sans-serif";
        ctx.fillStyle = "#fbbf24";
        ctx.fillText("R-PROCESS NUCLEOSYNTHESIS", 28, 36);

        ctx.font = "11px Inter, monospace";
        ctx.fillStyle = "#e2e8f0";
        ctx.fillText(`Gold (Au-197):      +${sim.yieldAu.toFixed(4)} M☉`, 28, 56);
        ctx.fillText(`Platinum (Pt-195):  +${sim.yieldPt.toFixed(4)} M☉`, 28, 72);
        ctx.fillText(`Uranium (U-238):    +${sim.yieldU.toFixed(4)} M☉`, 28, 88);
      }

      ctx.restore();
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      isSubscribed = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [
    activePalette,
    isPaused,
    simSpeed,
    massRatio,
    magneticField,
    decaySpeed,
    ejectaVel,
    particleDensity,
    showSpacetimeGrid,
    showElementOverlay,
    currentPreset,
    triggerExplosionSound,
    updateAudioState,
  ]);

  // Export Canvas PNG Snapshot
  const exportSnapshot = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `Kilonova_Merger_${selectedTelescope}_${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 my-8 font-sans text-slate-100">
      {/* Studio Header Card */}
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl mb-6 transition-all duration-300">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span
                className={`px-3 py-1 text-xs font-semibold tracking-wide uppercase rounded-full border ${activePalette.badge}`}
              >
                {activePalette.name}
              </span>
              <span className="px-3 py-1 text-xs font-semibold tracking-wide uppercase rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                LIGO / Virgo Astrophysical Event GW170817
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              Kilonova Binary Merger Lab
              <span className={`text-sm font-semibold ${activePalette.accentText}`}>
                (R-Process Nucleosynthesis)
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-3xl">
              Simulate binary compact star collisions, general relativistic spacetime wave strain, extreme magnetosphere jets, and the explosive creation of heavy elements like Gold, Platinum, and Uranium.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-3 self-start lg:self-center bg-slate-950/80 px-4 py-3 rounded-2xl border border-slate-800/80">
            <div className="text-center px-3 border-r border-slate-800">
              <div className="text-xs text-slate-400 font-mono uppercase">FPS</div>
              <div className="text-lg font-bold font-mono text-emerald-400">{fps}</div>
            </div>
            <div className="text-center px-3 border-r border-slate-800">
              <div className="text-xs text-slate-400 font-mono uppercase">GW Strain h+</div>
              <div className="text-lg font-bold font-mono text-cyan-400">{telemetry.strain}</div>
            </div>
            <div className="text-center px-3">
              <div className="text-xs text-slate-400 font-mono uppercase">Gold Yield</div>
              <div className="text-lg font-bold font-mono text-amber-400">
                {telemetry.goldYield} M☉
              </div>
            </div>
          </div>
        </div>

        {/* Observatory Filter Selector */}
        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          <span className="text-xs font-semibold uppercase text-slate-400 mr-2 whitespace-nowrap">
            Observatory Filter:
          </span>
          {Object.keys(TELESCOPES).map((key) => {
            const tel = TELESCOPES[key];
            const isSelected = selectedTelescope === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedTelescope(key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 whitespace-nowrap border ${
                  isSelected
                    ? `${tel.buttonBg} border-transparent shadow-lg shadow-amber-500/10`
                    : "bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-slate-700/60"
                }`}
              >
                {tel.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Canvas & Overlay Studio */}
      <div className="relative bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl mb-6 group">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full h-[480px] sm:h-[560px] cursor-crosshair block"
        />

        {/* Canvas Overlay Controls (Top Floating Bar) */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto bg-slate-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition"
            >
              {isPaused ? "▶ Resume" : "⏸ Pause"}
            </button>

            <button
              onClick={triggerMerger}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition ${
                simPhase === "remnant" ? "opacity-50 cursor-not-allowed bg-slate-800" : activePalette.buttonBg
              }`}
              disabled={simPhase === "remnant"}
            >
              💥 Trigger Immediate Merger
            </button>

            <button
              onClick={resetSimulation}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
            >
              🔄 Reset Orbit
            </button>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto bg-slate-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setShowSpacetimeGrid(!showSpacetimeGrid)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                showSpacetimeGrid ? "bg-slate-700 text-emerald-300" : "bg-slate-800 text-slate-400"
              }`}
            >
              🌐 Grid: {showSpacetimeGrid ? "ON" : "OFF"}
            </button>

            <button
              onClick={() => setShowElementOverlay(!showElementOverlay)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                showElementOverlay ? "bg-slate-700 text-amber-300" : "bg-slate-800 text-slate-400"
              }`}
            >
              ⚗️ R-Process Overlay: {showElementOverlay ? "ON" : "OFF"}
            </button>

            <button
              onClick={() => {
                if (!audioEnabled) initAudio();
                setAudioEnabled(!audioEnabled);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                audioEnabled ? "bg-amber-600 text-slate-950 font-bold" : "bg-slate-800 text-slate-400"
              }`}
            >
              {audioEnabled ? "🔊 Spatial Sound ON" : "🔇 Sound Muted"}
            </button>

            <button
              onClick={exportSnapshot}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
            >
              📸 Snapshot PNG
            </button>
          </div>
        </div>

        {/* Canvas Bottom Interactive Hint */}
        <div className="absolute bottom-4 left-4 pointer-events-none text-xs text-slate-400 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800">
          💡 Click canvas anywhere to trigger a directional kinetic shockwave pulse.
        </div>
      </div>

      {/* Preset Simulation Selection Bar */}
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl mb-6">
        <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <span>🚀 Astrophysical Scenario Presets</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {PRESETS.map((p) => {
            const isSelected = currentPreset === p.id;
            return (
              <button
                key={p.id}
                onClick={() => applyPreset(p.id)}
                className={`p-3.5 rounded-2xl text-left border transition-all duration-200 ${
                  isSelected
                    ? "bg-slate-800 border-amber-500/60 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/40"
                    : "bg-slate-950/60 hover:bg-slate-800/80 border-slate-800 text-slate-300"
                }`}
              >
                <div className="text-xs font-bold text-white mb-1">{p.name}</div>
                <div className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{p.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid: Controls & Sliders + Live Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Interactive Physics Controls Panel */}
        <div className="lg:col-span-2 bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span>⚙️ Orbital Physics & Fluid Parameters</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Mass Ratio Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
                <span>Mass Ratio (q = M₂/M₁):</span>
                <span className="font-mono text-amber-400">{massRatio.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.3"
                max="1.0"
                step="0.05"
                value={massRatio}
                onChange={(e) => setMassRatio(parseFloat(e.target.value))}
                className="w-full accent-amber-500 bg-slate-800 rounded-lg h-2 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Asymmetric Disruption (0.3)</span>
                <span>Equal Mass (1.0)</span>
              </div>
            </div>

            {/* Magnetic Field Strength */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
                <span>Magnetosphere Field Strength (B₀):</span>
                <span className="font-mono text-cyan-400">{magneticField.toFixed(1)} x 10¹⁴ G</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="10.0"
                step="0.5"
                value={magneticField}
                onChange={(e) => setMagneticField(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 bg-slate-800 rounded-lg h-2 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Standard Pulsar (1.0)</span>
                <span>Hyper Magnetar (10.0)</span>
              </div>
            </div>

            {/* Orbital Decay Rate */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
                <span>Spacetime Radiation Decay Speed:</span>
                <span className="font-mono text-emerald-400">{decaySpeed.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.3"
                max="2.5"
                step="0.1"
                value={decaySpeed}
                onChange={(e) => setDecaySpeed(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-800 rounded-lg h-2 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Slow Spiral</span>
                <span>Rapid Decay</span>
              </div>
            </div>

            {/* Ejecta Relativistic Velocity */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
                <span>Ejecta Velocity (v/c):</span>
                <span className="font-mono text-rose-400">{ejectaVel.toFixed(2)}c</span>
              </div>
              <input
                type="range"
                min="0.10"
                max="0.50"
                step="0.02"
                value={ejectaVel}
                onChange={(e) => setEjectaVel(parseFloat(e.target.value))}
                className="w-full accent-rose-500 bg-slate-800 rounded-lg h-2 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Sub-relativistic (0.1c)</span>
                <span>Ultra-relativistic (0.5c)</span>
              </div>
            </div>

            {/* Particle Density */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
                <span>Fireball Ejecta Density:</span>
                <span className="font-mono text-purple-400">{particleDensity.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={particleDensity}
                onChange={(e) => setParticleDensity(parseFloat(e.target.value))}
                className="w-full accent-purple-500 bg-slate-800 rounded-lg h-2 cursor-pointer"
              />
            </div>

            {/* Simulation Speed */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
                <span>Time Dilation (Sim Speed):</span>
                <span className="font-mono text-amber-400">{simSpeed}x</span>
              </div>
              <div className="flex gap-2">
                {[0.25, 0.5, 1, 2].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setSimSpeed(spd)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-mono font-bold transition ${
                      simSpeed === spd
                        ? "bg-amber-600 text-slate-950"
                        : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Telemetry & Diagnostics Card */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span>📊 Real-Time Astrophysical Diagnostics</span>
            </h2>

            <div className="space-y-3">
              <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 flex justify-between items-center">
                <span className="text-xs text-slate-400 font-medium">GW Frequency:</span>
                <span className="font-mono text-sm font-bold text-emerald-400">
                  {telemetry.frequency > 0 ? `${telemetry.frequency} Hz` : "Merged (Ringdown)"}
                </span>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 flex justify-between items-center">
                <span className="text-xs text-slate-400 font-medium">Orbital Separation:</span>
                <span className="font-mono text-sm font-bold text-cyan-400">
                  {telemetry.separation > 0 ? `${telemetry.separation} km` : "Contact / Core Fusion"}
                </span>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 flex justify-between items-center">
                <span className="text-xs text-slate-400 font-medium">Peak Plasma Temp:</span>
                <span className="font-mono text-sm font-bold text-rose-400">
                  {telemetry.temperature}
                </span>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 flex justify-between items-center">
                <span className="text-xs text-slate-400 font-medium">Synthesized Platinum:</span>
                <span className="font-mono text-sm font-bold text-amber-400">
                  {telemetry.platinumYield} M☉
                </span>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 flex justify-between items-center">
                <span className="text-xs text-slate-400 font-medium">Synthesized Uranium:</span>
                <span className="font-mono text-sm font-bold text-purple-400">
                  {telemetry.uraniumYield} M☉
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 leading-normal">
            <span className="font-semibold text-slate-300">Phase Status:</span>{" "}
            {simPhase === "orbiting" && "General Relativistic Spiral-In (Chirp Signal)"}
            {simPhase === "merging" && "Hyper-Cataclysmic Collision & GRB Jet Ejection"}
            {simPhase === "remnant" && "Radioactive Kilonova Glow & Heavy Element Synthesis"}
          </div>
        </div>
      </div>

      {/* Educational & Scientific Information Card */}
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl">
        <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
          <span>📚 Astrophysical Background & Science Notes</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          A <strong className="text-amber-400">Kilonova</strong> is a transient astronomical event occurring in a compact binary system when two neutron stars or a neutron star and black hole merge. These violent collisions radiate powerful gravitational waves detected by laser interferometers (such as LIGO and Virgo) and eject ultra-dense neutron-rich matter. Rapid neutron capture (<strong className="text-cyan-400">r-process nucleosynthesis</strong>) synthesizes heavy elements—including gold, platinum, and uranium—fueling a thermal decay glow visible across infrared, optical, and X-ray observatories.
        </p>
      </div>
    </div>
  );
}
