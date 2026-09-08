import React, { useState, useEffect, useRef, useCallback } from "react";

// Themes & Aesthetic Design Tokens
const THEMES = {
  solarGold: {
    id: "solarGold",
    name: "Solar Flare Plasma (Amber/Gold)",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    accentText: "text-amber-400",
    border: "border-amber-500/30",
    cardBg: "bg-slate-900/85 backdrop-blur-md border-amber-500/20",
    buttonBg: "bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white shadow-lg shadow-amber-500/25",
    canvasBg: "#0c0602",
    fieldPositive: "#fbbf24",
    fieldNegative: "#f43f5e",
    xPointGlow: "#fef08a",
    plasmoidColor: "#f97316",
    particleGlow: "rgba(254, 240, 138, 0.95)",
    heatMap: "rgba(245, 158, 11, 0.35)",
    gridColor: "rgba(251, 191, 36, 0.06)",
  },
  auroralEmerald: {
    id: "auroralEmerald",
    name: "Geomagnetic Auroral (Emerald/Teal)",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    accentText: "text-emerald-400",
    border: "border-emerald-500/30",
    cardBg: "bg-slate-900/85 backdrop-blur-md border-emerald-500/20",
    buttonBg: "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25",
    canvasBg: "#020f0a",
    fieldPositive: "#34d399",
    fieldNegative: "#06b6d4",
    xPointGlow: "#a7f3d0",
    plasmoidColor: "#10b981",
    particleGlow: "rgba(167, 243, 208, 0.95)",
    heatMap: "rgba(16, 185, 129, 0.35)",
    gridColor: "rgba(52, 211, 153, 0.06)",
  },
  tokamakViolet: {
    id: "tokamakViolet",
    name: "Tokamak Sawtooth (Violet/Fuchsia)",
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    accentText: "text-purple-400",
    border: "border-purple-500/30",
    cardBg: "bg-slate-900/85 backdrop-blur-md border-purple-500/20",
    buttonBg: "bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white shadow-lg shadow-purple-500/25",
    canvasBg: "#090412",
    fieldPositive: "#c084fc",
    fieldNegative: "#ec4899",
    xPointGlow: "#f5d0fe",
    plasmoidColor: "#a855f7",
    particleGlow: "rgba(245, 208, 254, 0.95)",
    heatMap: "rgba(168, 85, 247, 0.35)",
    gridColor: "rgba(192, 132, 252, 0.06)",
  },
  relativisticCyan: {
    id: "relativisticCyan",
    name: "Relativistic Magnetar (Cyan/Cobalt)",
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    accentText: "text-cyan-400",
    border: "border-cyan-500/30",
    cardBg: "bg-slate-900/85 backdrop-blur-md border-cyan-500/20",
    buttonBg: "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25",
    canvasBg: "#020a14",
    fieldPositive: "#38bdf8",
    fieldNegative: "#3b82f6",
    xPointGlow: "#bae6fd",
    plasmoidColor: "#0284c7",
    particleGlow: "rgba(186, 230, 253, 0.95)",
    heatMap: "rgba(6, 182, 212, 0.35)",
    gridColor: "rgba(56, 189, 248, 0.06)",
  },
};

// Preset Astrophysical & Laboratory Plasma Configurations
const PRESETS = {
  solarFlare: {
    id: "solarFlare",
    name: "☀️ Solar Flare X-Class Arc",
    subtitle: "Petschek Fast Shock-Assisted Reconnection",
    formula: "B_0 = 100 G | v_A = 2,500 km/s | S = 10⁶",
    desc: "Explosive magnetic reconnection in solar coronal active regions converting tera-joules of stored magnetic flux into energetic particle beams and solar flares.",
    lundquist: 10000,
    beta: 0.1,
    guideField: 15,
    inflowSpeed: 1.8,
    plasmoidMode: true,
  },
  magnetotail: {
    id: "magnetotail",
    name: "🌌 Earth Magnetotail Substorm",
    subtitle: "Sweet-Parker Elongated Current Sheet Collapse",
    formula: "B_0 = 20 nT | v_A = 800 km/s | S = 10⁵",
    desc: "Stretched magnetic field lines in Earth's nightside magnetotail snap together, launching high-velocity plasma flux ropes toward the ionosphere.",
    lundquist: 5000,
    beta: 0.8,
    guideField: 5,
    inflowSpeed: 1.2,
    plasmoidMode: true,
  },
  tokamakSawtooth: {
    id: "tokamakSawtooth",
    name: "⚛️ Tokamak Core Sawtooth Crash",
    subtitle: "Internal Disruption & Magnetic Island Merging",
    formula: "B_z / B_⊥ = 8.5 | m/n = 1/1 Helical Mode",
    desc: "In magnetic confinement fusion reactors, core magnetic field reconnection causes periodic crash events, redistributing heat from the plasma core.",
    lundquist: 25000,
    beta: 0.05,
    guideField: 75,
    inflowSpeed: 2.2,
    plasmoidMode: false,
  },
  pulsarWind: {
    id: "pulsarWind",
    name: "💫 Pulsar Magnetosphere Current Sheet",
    subtitle: "Ultra-Relativistic Tearing Instability",
    formula: "S = 10⁸ | σ = 10² | Relativistic γ >> 1",
    desc: "Striped pulsar winds experience relativistic magnetic reconnection, accelerating electrons to mega-electronvolt energies emitting coherent gamma-rays.",
    lundquist: 50000,
    beta: 0.01,
    guideField: 40,
    inflowSpeed: 3.0,
    plasmoidMode: true,
  },
};

export default function MagnetohydrodynamicReconnectionLab() {
  // Main State
  const [themeId, setThemeId] = useState("solarGold");
  const [presetId, setPresetId] = useState("solarFlare");
  const [lundquist, setLundquist] = useState(PRESETS.solarFlare.lundquist); // S parameter
  const [beta, setBeta] = useState(PRESETS.solarFlare.beta); // Plasma beta
  const [guideField, setGuideField] = useState(PRESETS.solarFlare.guideField); // Out of plane Bz %
  const [inflowSpeed, setInflowSpeed] = useState(PRESETS.solarFlare.inflowSpeed); // Drives reconnection
  const [plasmoidMode, setPlasmoidMode] = useState(PRESETS.solarFlare.plasmoidMode);
  
  // Toggles
  const [showParticles, setShowParticles] = useState(true);
  const [showVectors, setShowVectors] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [simSpeed, setSimSpeed] = useState(1.0);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState("simulation"); // simulation, analytics, physics, guide

  // Metrics Telemetry State
  const [telemetry, setTelemetry] = useState({
    reconnectionRate: 0.12,
    alfvenVelocity: 2450,
    dissipationPower: 4.85,
    maxParticleEnergy: 142.5,
    plasmoidCount: 4,
    peakTemp: 22.4,
  });

  // History for Analytics Charts
  const [history, setHistory] = useState([]);

  // Canvas & Audio Refs
  const canvasRef = useRef(null);
  const audioCtxRef = useRef(null);
  const humOscRef = useRef(null);
  const crackleGainRef = useRef(null);
  const animFrameRef = useRef(null);

  // Simulation physics state refs
  const timeRef = useRef(0);
  const particlesRef = useRef([]);
  const plasmoidsRef = useRef([]);
  const magneticFluxRef = useRef({ phase: 0, xPointOffset: { x: 0, y: 0 } });
  const isDraggingRef = useRef(false);
  const dragTargetRef = useRef(null);

  const theme = THEMES[themeId];

  // Initialize Web Audio API
  const initAudio = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      // Magnetic Hum Oscillator
      const humOsc = ctx.createOscillator();
      const humGain = ctx.createGain();
      humOsc.type = "sine";
      humOsc.frequency.setValueAtTime(55, ctx.currentTime);
      humGain.gain.setValueAtTime(0.04, ctx.currentTime);
      humOsc.connect(humGain);
      humGain.connect(ctx.destination);
      humOsc.start();
      humOscRef.current = { osc: humOsc, gain: humGain };

      // Reconnection Crackle Sound
      const bufferSize = ctx.sampleRate * 1.5;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.2));
      }

      const crackleGain = ctx.createGain();
      crackleGain.gain.setValueAtTime(0, ctx.currentTime);
      crackleGain.connect(ctx.destination);
      crackleGainRef.current = crackleGain;
    } catch (e) {
      console.warn("Audio Context init failed:", e);
    }
  }, []);

  // Trigger crackle sound on reconnection pulse
  const triggerCrackleSound = useCallback(() => {
    if (!audioEnabled || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(300 + Math.random() * 400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.15);
      
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } catch (err) {
      // Audio error fallback
    }
  }, [audioEnabled]);

  // Toggle Audio State
  const toggleAudio = () => {
    if (!audioEnabled) {
      if (!audioCtxRef.current) {
        initAudio();
      } else if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }
      setAudioEnabled(true);
    } else {
      if (audioCtxRef.current && audioCtxRef.current.state === "running") {
        audioCtxRef.current.suspend();
      }
      setAudioEnabled(false);
    }
  };

  // Preset Selection Handler
  const applyPreset = (id) => {
    const p = PRESETS[id];
    if (!p) return;
    setPresetId(id);
    setLundquist(p.lundquist);
    setBeta(p.beta);
    setGuideField(p.guideField);
    setInflowSpeed(p.inflowSpeed);
    setPlasmoidMode(p.plasmoidMode);
  };

  // Reset Simulation Particles & Field
  const resetSimulation = () => {
    timeRef.current = 0;
    particlesRef.current = [];
    plasmoidsRef.current = [];
    magneticFluxRef.current.xPointOffset = { x: 0, y: 0 };
    setHistory([]);
  };

  // Main Canvas Rendering Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement.clientWidth || 800);
    let height = (canvas.height = Math.max(450, Math.min(width * 0.56, 580)));

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth || 800;
      height = canvas.height = Math.max(450, Math.min(width * 0.56, 580));
    };
    window.addEventListener("resize", handleResize);

    // Initialize particles if empty
    if (particlesRef.current.length === 0) {
      const pCount = 140;
      const initialP = [];
      for (let i = 0; i < pCount; i++) {
        const isIon = i % 4 === 0;
        initialP.push({
          x: (Math.random() * 0.9 + 0.05) * width,
          y: (Math.random() * 0.9 + 0.05) * height,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          charge: isIon ? 1 : -1,
          mass: isIon ? 18.0 : 1.0,
          energy: Math.random() * 50 + 20,
          gyroPhase: Math.random() * Math.PI * 2,
          trail: [],
        });
      }
      particlesRef.current = initialP;
    }

    // Render loop
    let lastStamp = performance.now();
    const render = (now) => {
      const dt = Math.min((now - lastStamp) / 1000, 0.05) * simSpeed;
      lastStamp = now;

      if (isPlaying) {
        timeRef.current += dt;
      }

      const t = timeRef.current;
      const centerX = width / 2 + magneticFluxRef.current.xPointOffset.x;
      const centerY = height / 2 + magneticFluxRef.current.xPointOffset.y;

      // Clear Canvas Background
      ctx.fillStyle = theme.canvasBg;
      ctx.fillRect(0, 0, width, height);

      // Draw Plasma Grid Lines
      ctx.strokeStyle = theme.gridColor;
      ctx.lineWidth = 1;
      const gridSize = 40;
      ctx.beginPath();
      for (let x = 0; x < width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Magnetic Field Equation B(x, y) - Harris Sheet with Reconnection Perturbation
      // Top domain (y < centerY): Bx > 0 (rightward)
      // Bottom domain (y > centerY): Bx < 0 (leftward)
      // Inflow velocity drives sheets towards center line y = centerY
      const calcB = (x, y) => {
        const dx = x - centerX;
        const dy = y - centerY;
        const delta = 35; // Sheet thickness
        
        // Base Harris Sheet Bx = B0 * tanh(dy / delta)
        const B0 = 1.0;
        let Bx = B0 * Math.tanh(dy / delta);
        
        // Reconnection X-point perturbation By driven by inflow and S
        const k = 0.015;
        const perturbation = Math.exp(-(dx * dx + dy * dy) / 18000) * Math.sin(t * inflowSpeed * 2.0);
        let By = -B0 * k * (dx / delta) * Math.exp(-Math.abs(dy) / delta) + perturbation * 0.3;

        // Add plasmoid mode perturbations if enabled
        if (plasmoidMode && lundquist > 8000) {
          const tearMode = Math.sin(dx * 0.05) * Math.cos(dy * 0.05) * 0.25;
          By += tearMode;
        }

        return { Bx, By, mag: Math.hypot(Bx, By) };
      };

      // 1. Render Energy Conversion Thermal Heatmap Overlay
      if (showHeatmap) {
        const heatGrad = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, width * 0.45);
        heatGrad.addColorStop(0, theme.heatMap);
        heatGrad.addColorStop(0.3, theme.heatMap.replace("0.35", "0.15"));
        heatGrad.addColorStop(1, "rgba(0,0,0,0)");

        ctx.fillStyle = heatGrad;
        ctx.fillRect(0, 0, width, height);
      }

      // 2. Render Magnetic Streamlines / Field Lines
      const numLines = 22;
      ctx.lineWidth = 1.8;

      for (let i = 0; i < numLines; i++) {
        const offsetY = (i - numLines / 2) * 22;
        if (Math.abs(offsetY) < 4) continue; // Skip exact center separator

        ctx.beginPath();
        const isTop = offsetY < 0;
        ctx.strokeStyle = isTop ? theme.fieldPositive : theme.fieldNegative;

        // Trace streamline left to right
        let currX = 20;
        let currY = centerY + offsetY + Math.sin(t * 1.5 + i) * 3;
        ctx.moveTo(currX, currY);

        for (let step = 0; step < 80; step++) {
          const { Bx, By } = calcB(currX, currY);
          // Streamline Euler integration
          const stepSize = width / 80;
          const dir = isTop ? 1 : -1;
          
          // Reconnection deformation towards X-point
          const distToX = Math.hypot(currX - centerX, currY - centerY);
          let bendY = By * 35;
          if (distToX < 120) {
            bendY += (currY < centerY ? 1 : -1) * (120 - distToX) * 0.15 * inflowSpeed;
          }

          currX += stepSize;
          currY += bendY * dir * 0.08;

          ctx.lineTo(currX, currY);
        }

        ctx.globalAlpha = Math.max(0.2, 1.0 - Math.abs(offsetY) / (height * 0.4));
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      }

      // 3. Render Field Vector Arrows if enabled
      if (showVectors) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        const step = 60;
        for (let vx = step; vx < width; vx += step) {
          for (let vy = step; vy < height; vy += step) {
            const { Bx, By, mag } = calcB(vx, vy);
            if (mag < 0.05) continue;
            
            const angle = Math.atan2(By, Bx);
            const arrowLen = Math.min(14, mag * 12);

            ctx.save();
            ctx.translate(vx, vy);
            ctx.rotate(angle);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(arrowLen, 0);
            ctx.lineTo(arrowLen - 3, -2);
            ctx.moveTo(arrowLen, 0);
            ctx.lineTo(arrowLen - 3, 2);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.restore();
          }
        }
      }

      // 4. Render Reconnection X-Point Flare & Jet Outflow Streams
      // X-point Center Glow
      const xGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 60);
      xGlow.addColorStop(0, theme.xPointGlow);
      xGlow.addColorStop(0.4, theme.fieldPositive);
      xGlow.addColorStop(1, "transparent");

      ctx.fillStyle = xGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 60, 0, Math.PI * 2);
      ctx.fill();

      // Exhaust Relativistic Jet Beams (Shooting Left & Right)
      const jetLen = 140 + Math.sin(t * 4) * 20;
      const jetGradLeft = ctx.createLinearGradient(centerX, centerY, centerX - jetLen, centerY);
      jetGradLeft.addColorStop(0, theme.xPointGlow);
      jetGradLeft.addColorStop(1, "transparent");
      ctx.fillStyle = jetGradLeft;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - 15);
      ctx.lineTo(centerX - jetLen, centerY - 35);
      ctx.lineTo(centerX - jetLen, centerY + 35);
      ctx.lineTo(centerX, centerY + 15);
      ctx.closePath();
      ctx.fill();

      const jetGradRight = ctx.createLinearGradient(centerX, centerY, centerX + jetLen, centerY);
      jetGradRight.addColorStop(0, theme.xPointGlow);
      jetGradRight.addColorStop(1, "transparent");
      ctx.fillStyle = jetGradRight;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - 15);
      ctx.lineTo(centerX + jetLen, centerY - 35);
      ctx.lineTo(centerX + jetLen, centerY + 35);
      ctx.lineTo(centerX, centerY + 15);
      ctx.closePath();
      ctx.fill();

      // 5. Plasmoid Tearing Mode Bubbles (if enabled)
      if (plasmoidMode) {
        const plasmoidCount = Math.min(6, Math.floor(lundquist / 4000));
        for (let pIdx = 0; pIdx < plasmoidCount; pIdx++) {
          const pOffset = ((t * 80 + pIdx * 120) % (width * 0.8)) - width * 0.4;
          const pX = centerX + pOffset;
          const pY = centerY + Math.sin(pOffset * 0.02 + t) * 6;
          const radius = 12 + Math.abs(Math.sin(pIdx + t * 2)) * 14;

          // Plasmoid O-point magnetic island core
          ctx.beginPath();
          ctx.arc(pX, pY, radius, 0, Math.PI * 2);
          ctx.fillStyle = theme.plasmoidColor;
          ctx.globalAlpha = 0.7;
          ctx.fill();
          ctx.strokeStyle = theme.xPointGlow;
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.globalAlpha = 1.0;
        }
      }

      // 6. Particle Gyromotion & Lorentz Force Dynamics
      if (showParticles) {
        particlesRef.current.forEach((p) => {
          if (!isPlaying) return;

          const { Bx, By } = calcB(p.x, p.y);
          // Lorentz force: F = q(v x B) -> v_dot_x = q * vy * Bz, v_dot_y = -q * vx * Bz
          // Effective Bz includes guide field
          const Bz = (guideField / 100) * 2.0 + 0.5;
          const qOverM = (p.charge / p.mass) * 1.5;

          // Reconnection Electric Field Ez accelerating particles at X-point
          const distToX = Math.hypot(p.x - centerX, p.y - centerY);
          const Ez = distToX < 80 ? (1.0 - distToX / 80) * 12.0 * inflowSpeed : 0;

          // Acceleration components
          const ax = qOverM * p.vy * Bz + (p.x < centerX ? -Ez : Ez) * 0.3;
          const ay = -qOverM * p.vx * Bz + (p.y < centerY ? inflowSpeed * 5 : -inflowSpeed * 5);

          p.vx += ax * dt * 60;
          p.vy += ay * dt * 60;

          // Velocity dampening & energy updates
          p.vx *= 0.98;
          p.vy *= 0.98;

          p.x += p.vx * dt * 40;
          p.y += p.vy * dt * 40;

          // Boundary wrapping
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          // Update motion trail
          p.trail.push({ x: p.x, y: p.y });
          if (p.trail.length > 8) p.trail.shift();

          // Draw Particle Trail
          if (p.trail.length > 1) {
            ctx.beginPath();
            ctx.moveTo(p.trail[0].x, p.trail[0].y);
            for (let tr = 1; tr < p.trail.length; tr++) {
              ctx.lineTo(p.trail[tr].x, p.trail[tr].y);
            }
            ctx.strokeStyle = p.charge > 0 ? theme.fieldPositive : theme.particleGlow;
            ctx.lineWidth = p.charge > 0 ? 1.8 : 1.0;
            ctx.globalAlpha = 0.45;
            ctx.stroke();
            ctx.globalAlpha = 1.0;
          }

          // Draw Particle Core
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.charge > 0 ? 3.5 : 2.0, 0, Math.PI * 2);
          ctx.fillStyle = p.charge > 0 ? theme.fieldPositive : "#ffffff";
          ctx.shadowColor = theme.particleGlow;
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        });
      }

      // 7. Interactive X-point Node Indicator
      ctx.beginPath();
      ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
      ctx.strokeStyle = theme.xPointGlow;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Sound synth pitch update based on magnetic energy
      if (audioEnabled && humOscRef.current) {
        const baseFreq = 45 + (inflowSpeed / 3) * 40 + Math.sin(t * 3) * 8;
        humOscRef.current.osc.frequency.setTargetAtTime(baseFreq, audioCtxRef.current.currentTime, 0.1);
      }

      // Telemetry update calculation
      if (isPlaying && Math.random() < 0.08) {
        const calcRecRate = (0.08 + (inflowSpeed / 3.0) * 0.14 + (lundquist / 50000) * 0.06).toFixed(3);
        const calcAlfven = Math.round(1800 + (1 / Math.sqrt(beta)) * 1400 + inflowSpeed * 300);
        const calcPower = (3.2 + (lundquist / 10000) * 2.1 + (inflowSpeed / 2) * 1.8).toFixed(2);
        const calcMaxE = Math.round(90 + (1 / beta) * 45 + (guideField / 100) * 80);
        const calcPCount = plasmoidMode ? Math.min(8, Math.floor(lundquist / 4000)) : 0;
        const calcTemp = (14.2 + (inflowSpeed / 3) * 18.5 + (lundquist / 10000) * 5.2).toFixed(1);

        setTelemetry({
          reconnectionRate: parseFloat(calcRecRate),
          alfvenVelocity: calcAlfven,
          dissipationPower: parseFloat(calcPower),
          maxParticleEnergy: calcMaxE,
          plasmoidCount: calcPCount,
          peakTemp: parseFloat(calcTemp),
        });

        // Push history snapshot for charts
        setHistory((prev) => {
          const next = [...prev, { time: t.toFixed(1), rate: parseFloat(calcRecRate), temp: parseFloat(calcTemp), power: parseFloat(calcPower) }];
          return next.slice(-25); // keep last 25 entries
        });
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [theme, simSpeed, isPlaying, lundquist, beta, guideField, inflowSpeed, plasmoidMode, showParticles, showVectors, showHeatmap, audioEnabled, triggerCrackleSound]);

  // Mouse / Touch Canvas Drag Controls for X-point placement
  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    triggerCrackleSound();
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    magneticFluxRef.current.xPointOffset = {
      x: mouseX - centerX,
      y: mouseY - centerY,
    };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Snapshot Export Handler
  const exportSnapshot = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `MHD_Reconnection_Lab_${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-3 sm:p-6 text-slate-100 font-sans">
      {/* Header Banner */}
      <div className={`p-6 rounded-2xl ${theme.cardBg} border ${theme.border} shadow-2xl mb-6 transition-all duration-500`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-800/90 border border-slate-700 text-slate-300">
                MHD Astrophysics Studio
              </span>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${theme.badge}`}>
                {THEMES[themeId].name}
              </span>
              <span className="px-3 py-1 text-xs font-mono rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                Maxwell-Ampère & Lorentz MHD Engine
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
              Magnetohydrodynamic (MHD) Reconnection Laboratory
            </h1>
            <p className="text-slate-400 text-sm sm:text-base mt-1.5 max-w-3xl">
              Simulate explosive magnetic field line annihilation, Sweet-Parker & Petschek shock dynamics, plasmoid tearing mode instabilities, and relativistic particle acceleration in cosmic plasmas.
            </p>
          </div>

          {/* Quick Actions & Sound Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              onClick={toggleAudio}
              className={`px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all ${
                audioEnabled
                  ? "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
              }`}
            >
              {audioEnabled ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                  Audio Active
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                  Enable Audio
                </>
              )}
            </button>

            <button
              onClick={exportSnapshot}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all"
            >
              <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export PNG
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 border-b border-slate-800 pb-2 overflow-x-auto">
          {[
            { id: "simulation", label: "🎮 Interactive Simulation", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
            { id: "analytics", label: "📊 Energy Analytics", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
            { id: "physics", label: "🔬 MHD Field Equations", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
            { id: "guide", label: "📘 Presets & Guide", icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? `${theme.buttonBg} text-white shadow-md`
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon} />
              </svg>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: SIMULATION VIEW */}
      {activeTab === "simulation" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Canvas & Telemetry Display (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {/* Interactive Canvas Container */}
            <div className={`relative rounded-2xl overflow-hidden ${theme.cardBg} border ${theme.border} shadow-2xl group`}>
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className="w-full cursor-crosshair block"
              />

              {/* Canvas Overlay Hints */}
              <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-2 pointer-events-none">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Click & Drag Canvas to Shift X-Point Center
              </div>

              {/* Play / Pause & Speed Controls Overlay */}
              <div className="absolute bottom-3 left-3 right-3 bg-slate-950/85 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-800 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`p-2 rounded-lg ${theme.buttonBg} transition-all`}
                    title={isPlaying ? "Pause Simulation" : "Play Simulation"}
                  >
                    {isPlaying ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 9v6m4-6v6" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      </svg>
                    )}
                  </button>

                  <button
                    onClick={resetSimulation}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
                    title="Reset Particles & Field"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>

                  <div className="flex items-center gap-1.5 ml-2">
                    <span className="text-xs font-medium text-slate-400">Speed:</span>
                    {[0.5, 1.0, 2.0].map((spd) => (
                      <button
                        key={spd}
                        onClick={() => setSimSpeed(spd)}
                        className={`px-2 py-1 text-xs font-mono rounded ${
                          simSpeed === spd
                            ? "bg-slate-700 text-cyan-300 font-bold border border-cyan-500/40"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Layer Toggles */}
                <div className="flex items-center gap-2 sm:gap-3 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={showParticles}
                      onChange={(e) => setShowParticles(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
                    />
                    Particles
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={showVectors}
                      onChange={(e) => setShowVectors(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
                    />
                    Vectors
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={showHeatmap}
                      onChange={(e) => setShowHeatmap(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
                    />
                    Heatmap
                  </label>
                </div>
              </div>
            </div>

            {/* Live Telemetry Dashboard Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {[
                { label: "Reconnection Rate", val: `${telemetry.reconnectionRate} M`, unit: "v_in / v_A", color: theme.accentText },
                { label: "Alfvén Speed (v_A)", val: telemetry.alfvenVelocity.toLocaleString(), unit: "km / s", color: "text-cyan-400" },
                { label: "Magnetic Power", val: telemetry.dissipationPower, unit: "10²⁰ Watts", color: "text-amber-400" },
                { label: "Max Particle E", val: telemetry.maxParticleEnergy, unit: "keV", color: "text-emerald-400" },
                { label: "Plasmoids (O-pts)", val: telemetry.plasmoidCount, unit: "Islands", color: "text-fuchsia-400" },
                { label: "Peak Plasma T", val: telemetry.peakTemp, unit: "Million K", color: "text-rose-400" },
              ].map((m, idx) => (
                <div key={idx} className={`p-3 rounded-xl ${theme.cardBg} border ${theme.border} text-center`}>
                  <div className="text-[11px] font-medium text-slate-400 truncate">{m.label}</div>
                  <div className={`text-base font-extrabold font-mono mt-0.5 ${m.color}`}>{m.val}</div>
                  <div className="text-[10px] text-slate-500">{m.unit}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Controls Panel (4 cols) */}
          <div className={`lg:col-span-4 p-5 rounded-2xl ${theme.cardBg} border ${theme.border} shadow-2xl flex flex-col gap-5`}>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center justify-between">
                Plasma Physics Parameters
                <span className={`text-xs px-2.5 py-0.5 rounded-full border ${theme.badge}`}>
                  {PRESETS[presetId]?.name.split(" ")[1] || "Custom"}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">Adjust magnetic Lundquist conductivity, plasma pressure, and guide fields.</p>
            </div>

            {/* Color Theme Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">Visual Theme & Plasma Spectrum</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(THEMES).map((th) => (
                  <button
                    key={th.id}
                    onClick={() => setThemeId(th.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-left truncate ${
                      themeId === th.id
                        ? `${th.buttonBg} text-white border-transparent`
                        : "bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700"
                    }`}
                  >
                    {th.name.split(" ")[0]} {th.name.split(" ")[1]}
                  </button>
                ))}
              </div>
            </div>

            {/* Slider 1: Lundquist Number S */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-300">Lundquist Number (S = L v_A / η)</span>
                <span className="font-mono text-cyan-400 font-bold">{lundquist.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="50000"
                step="1000"
                value={lundquist}
                onChange={(e) => setLundquist(Number(e.target.value))}
                className="w-full accent-cyan-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">Controls magnetic diffusivity η. S &gt; 10⁴ triggers plasmoid tearing instability.</p>
            </div>

            {/* Slider 2: Plasma Beta β */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-300">Plasma Beta (β = p_gas / p_mag)</span>
                <span className="font-mono text-amber-400 font-bold">{beta.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="3.0"
                step="0.05"
                value={beta}
                onChange={(e) => setBeta(Number(e.target.value))}
                className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">Ratio of kinetic gas pressure to magnetic pressure in current sheet.</p>
            </div>

            {/* Slider 3: Guide Field Bz */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-300">Guide Field (B_z / B_0)</span>
                <span className="font-mono text-purple-400 font-bold">{guideField}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={guideField}
                onChange={(e) => setGuideField(Number(e.target.value))}
                className="w-full accent-purple-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">Out-of-plane magnetic field component suppressing 3D turbulence.</p>
            </div>

            {/* Slider 4: Inflow Speed */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-300">Inflow Compression Speed</span>
                <span className="font-mono text-emerald-400 font-bold">{inflowSpeed.toFixed(1)} v_A</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="4.0"
                step="0.1"
                value={inflowSpeed}
                onChange={(e) => setInflowSpeed(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">Drives opposite magnetic flux tubes into diffusion region.</p>
            </div>

            {/* Mode Toggle: Plasmoid Instability */}
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-200">Plasmoid Tearing Mode</div>
                <div className="text-[11px] text-slate-400">Cascade current sheet into O-point islands</div>
              </div>
              <button
                onClick={() => setPlasmoidMode(!plasmoidMode)}
                className={`w-12 h-6 rounded-full transition-all relative p-1 ${
                  plasmoidMode ? "bg-cyan-600" : "bg-slate-700"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    plasmoidMode ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Quick Presets Grid */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">Preset Astrophysics Scenarios</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(PRESETS).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => applyPreset(p.id)}
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      presetId === p.id
                        ? `${theme.badge} border-opacity-100 bg-slate-800`
                        : "bg-slate-800/50 hover:bg-slate-800 text-slate-300 border-slate-700"
                    }`}
                  >
                    <div className="text-xs font-bold truncate">{p.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{p.subtitle}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ANALYTICS & ENERGY SPECTRUM */}
      {activeTab === "analytics" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Energy Conversion Chart */}
          <div className={`p-6 rounded-2xl ${theme.cardBg} border ${theme.border} shadow-2xl`}>
            <h2 className="text-lg font-bold text-slate-100 mb-1 flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Magnetic vs Thermal Energy Dissipation
            </h2>
            <p className="text-xs text-slate-400 mb-6">Real-time conversion of magnetic field energy into plasma thermal motion.</p>

            {/* CSS Simulated Chart Bar Graph */}
            <div className="h-64 flex items-end gap-2 border-b border-l border-slate-700 p-2 relative">
              {history.length > 0 ? (
                history.map((h, i) => {
                  const rateH = Math.min(100, h.rate * 400);
                  const tempH = Math.min(100, h.temp * 2.5);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-1 group relative">
                      {/* Tooltip */}
                      <div className="absolute -top-10 hidden group-hover:flex flex-col bg-slate-950 px-2 py-1 rounded text-[10px] font-mono border border-slate-700 z-10 whitespace-nowrap">
                        <span>Rate: {h.rate}</span>
                        <span>Temp: {h.temp}M K</span>
                      </div>

                      <div className="w-full bg-amber-500/80 rounded-t transition-all" style={{ height: `${tempH}%` }} />
                      <div className="w-full bg-cyan-500/80 rounded-t transition-all" style={{ height: `${rateH}%` }} />
                    </div>
                  );
                })
              ) : (
                <div className="w-full text-center text-slate-500 text-xs my-auto">Start simulation to stream energy metrics...</div>
              )}
            </div>

            <div className="flex items-center justify-center gap-6 mt-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-cyan-500" />
                <span className="text-slate-300">Reconnection Rate (v_in / v_A)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-amber-500" />
                <span className="text-slate-300">Peak Thermal Temp (MK)</span>
              </div>
            </div>
          </div>

          {/* Particle Power Law Energy Spectrum */}
          <div className={`p-6 rounded-2xl ${theme.cardBg} border ${theme.border} shadow-2xl flex flex-col justify-between`}>
            <div>
              <h2 className="text-lg font-bold text-slate-100 mb-1 flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
                Non-Thermal Particle Acceleration Spectrum
              </h2>
              <p className="text-xs text-slate-400 mb-6">Power-law distribution N(E) ∝ E^(-p) driven by inductive reconnection electric fields.</p>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-semibold">Spectral Index (p)</span>
                    <span className="font-mono text-cyan-400 font-bold">p = 2.14 ± 0.05</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full w-[65%]" />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-semibold">Thermal Partition Ratio (E_th / E_mag)</span>
                    <span className="font-mono text-amber-400 font-bold">42.8%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-500 to-rose-500 h-full w-[43%]" />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-semibold">Max Particle Lorentz Factor (γ_max)</span>
                    <span className="font-mono text-purple-400 font-bold">γ ≈ 85.0</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-500 to-fuchsia-500 h-full w-[85%]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 text-xs text-slate-300">
              <span className="font-bold text-amber-400">Astrophysical Note:</span> Particles gain kinetic energy via Fermi acceleration while reflecting off merging plasmoid islands during tearing instability cascades.
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MHD PHYSICS EQUATIONS */}
      {activeTab === "physics" && (
        <div className={`p-6 sm:p-8 rounded-2xl ${theme.cardBg} border ${theme.border} shadow-2xl space-y-6`}>
          <div>
            <h2 className="text-xl font-extrabold text-slate-100">Magnetohydrodynamic (MHD) Mathematical Foundations</h2>
            <p className="text-slate-400 text-sm mt-1">Fundamental governing equations describing magnetic field annihilation and plasma dynamics.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Equation Box 1 */}
            <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">1. Generalized Ohm's Law in MHD</div>
              <div className="p-4 rounded-lg bg-slate-900 font-mono text-sm text-slate-200 border border-slate-800 text-center overflow-x-auto">
                E + v × B = η J + (1 / e n_e) (J × B)
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                When magnetic resistivity η is non-zero in the diffusion region, field lines unbind from frozen-in fluid flow, allowing magnetic flux tubes to break and reconnect.
              </p>
            </div>

            {/* Equation Box 2 */}
            <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">2. Sweet-Parker vs Petschek Reconnection Rate</div>
              <div className="p-4 rounded-lg bg-slate-900 font-mono text-sm text-slate-200 border border-slate-800 text-center overflow-x-auto">
                M_SP = 1 / √S &nbsp;|&nbsp; M_Petschek = π / (8 ln S)
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Sweet-Parker model yields slow laminar reconnection rates (M ~ 10⁻⁴), whereas Petschek fast reconnection includes slow-mode shock pairs accelerating plasma outflow.
              </p>
            </div>

            {/* Equation Box 3 */}
            <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">3. Plasmoid Tearing Mode Instability</div>
              <div className="p-4 rounded-lg bg-slate-900 font-mono text-sm text-slate-200 border border-slate-800 text-center overflow-x-auto">
                S_crit ≈ 10⁴ &nbsp;⇒&nbsp; γ_tearing ~ (v_A / L) S^(1/4)
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                When the Lundquist number exceeds 10⁴, extended current sheets spontaneously fragment into secondary magnetic O-points (plasmoids), boosting reconnection speed.
              </p>
            </div>

            {/* Equation Box 4 */}
            <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="text-xs font-bold text-purple-400 uppercase tracking-wider">4. Alfvén Wave Propagation Speed</div>
              <div className="p-4 rounded-lg bg-slate-900 font-mono text-sm text-slate-200 border border-slate-800 text-center overflow-x-auto">
                v_A = B_0 / √(μ_0 ρ_0)
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                The speed of magnetic tension wave propagation dictates the exhaust jet outflow velocity shooting away from the X-point along the current sheet axis.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PRESET GUIDE */}
      {activeTab === "guide" && (
        <div className={`p-6 sm:p-8 rounded-2xl ${theme.cardBg} border ${theme.border} shadow-2xl space-y-6`}>
          <div>
            <h2 className="text-xl font-extrabold text-slate-100">Astrophysical Scenarios & Laboratory Guide</h2>
            <p className="text-slate-400 text-sm mt-1">Select real-world cosmic environments to load preset plasma conditions.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.values(PRESETS).map((p) => (
              <div
                key={p.id}
                className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-base font-bold text-slate-100">{p.name}</h3>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300">{p.subtitle}</span>
                  </div>
                  <div className="text-xs font-mono text-amber-400 mb-2">{p.formula}</div>
                  <p className="text-xs text-slate-400 leading-relaxed">{p.desc}</p>
                </div>

                <button
                  onClick={() => {
                    applyPreset(p.id);
                    setActiveTab("simulation");
                  }}
                  className={`w-full py-2.5 rounded-xl ${theme.buttonBg} text-xs font-semibold flex items-center justify-center gap-2 transition-all`}
                >
                  Load Scenario in Simulator
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
