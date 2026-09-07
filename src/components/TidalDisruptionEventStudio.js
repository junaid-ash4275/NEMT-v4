import React, { useState, useEffect, useRef, useCallback } from "react";

// Themes & Visual Design Tokens
const THEMES = {
  eventHorizonAmber: {
    id: "eventHorizonAmber",
    name: "Event Horizon Amber",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    accentText: "text-amber-400",
    border: "border-amber-500/30",
    cardBg: "bg-slate-900/85 backdrop-blur-md border-amber-500/20",
    buttonBg: "bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white shadow-lg shadow-amber-500/25",
    canvasBg: "#0a0402",
    bhCore: "#000000",
    bhGlow: "#f59e0b",
    photonRing: "#fef08a",
    tidalStreamBound: "#fb923c",
    tidalStreamUnbound: "#ef4444",
    accretionDisk: "rgba(245, 158, 11, 0.6)",
    jetColor: "#f43f5e",
    starColor: "#fef08a",
  },
  relativisticCyan: {
    id: "relativisticCyan",
    name: "Relativistic Beaming Cyan",
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    accentText: "text-cyan-400",
    border: "border-cyan-500/30",
    cardBg: "bg-slate-900/85 backdrop-blur-md border-cyan-500/20",
    buttonBg: "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25",
    canvasBg: "#020a12",
    bhCore: "#000000",
    bhGlow: "#06b6d4",
    photonRing: "#a5f3fc",
    tidalStreamBound: "#38bdf8",
    tidalStreamUnbound: "#3b82f6",
    accretionDisk: "rgba(6, 182, 212, 0.6)",
    jetColor: "#60a5fa",
    starColor: "#e0f2fe",
  },
  gravitationalEmerald: {
    id: "gravitationalEmerald",
    name: "Gravitational Emerald",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    accentText: "text-emerald-400",
    border: "border-emerald-500/30",
    cardBg: "bg-slate-900/85 backdrop-blur-md border-emerald-500/20",
    buttonBg: "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25",
    canvasBg: "#02120a",
    bhCore: "#000000",
    bhGlow: "#10b981",
    photonRing: "#a7f3d0",
    tidalStreamBound: "#34d399",
    tidalStreamUnbound: "#059669",
    accretionDisk: "rgba(16, 185, 129, 0.6)",
    jetColor: "#2dd4bf",
    starColor: "#ecfdf5",
  },
  deepVoidViolet: {
    id: "deepVoidViolet",
    name: "Deep Void Violet",
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    accentText: "text-purple-400",
    border: "border-purple-500/30",
    cardBg: "bg-slate-900/85 backdrop-blur-md border-purple-500/20",
    buttonBg: "bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white shadow-lg shadow-purple-500/25",
    canvasBg: "#090414",
    bhCore: "#000000",
    bhGlow: "#a855f7",
    photonRing: "#f5d0fe",
    tidalStreamBound: "#c084fc",
    tidalStreamUnbound: "#e879f9",
    accretionDisk: "rgba(168, 85, 247, 0.6)",
    jetColor: "#f0abfc",
    starColor: "#faf5ff",
  },
};

// Preset Astrophysics Configurations
const PRESETS = {
  swiftJ1644: {
    id: "swiftJ1644",
    name: "Swift J1644+57 (Jetted Relativistic TDE)",
    formula: "M_BH = 2.0 × 10^6 M_☉ | Relativistic Gamma γ ≈ 2.5",
    desc: "A rare relativistic event where tidal disruption triggered an ultra-luminous, collimated hard X-ray polar jet breaking through relativistic shocks.",
    bhMass: 2.0,
    bhSpin: 0.95,
    starMass: 1.0,
    beta: 2.2,
    jetPower: 95,
  },
  asassn14li: {
    id: "asassn14li",
    name: "ASASSN-14li (Soft X-Ray Baseline)",
    formula: "M_BH = 1.0 × 10^6 M_☉ | t^-5/3 Fallback Light Curve",
    desc: "Benchmark thermal TDE showcasing clean Keplerian mass fallback rate t^-5/3 decay and circularizing soft X-ray accretion disk emission.",
    bhMass: 1.0,
    bhSpin: 0.40,
    starMass: 1.2,
    beta: 1.2,
    jetPower: 35,
  },
  at2018hyz: {
    id: "at2018hyz",
    name: "AT2018hyz (Delayed Relativistic Outflow)",
    formula: "M_BH = 5.0 × 10^6 M_☉ | Radio Flare Delay Δt ≈ 750 days",
    desc: "Late-time relativistic radio flare ejection occurring hundreds of days post-disruption due to sub-Eddington accretion transitions.",
    bhMass: 5.0,
    bhSpin: 0.75,
    starMass: 2.5,
    beta: 3.5,
    jetPower: 70,
  },
  extremeMassRatio: {
    id: "extremeMassRatio",
    name: "Supermassive Direct Swallowing (EMR)",
    formula: "M_BH = 50.0 × 10^6 M_☉ | R_T < R_event_horizon",
    desc: "When black hole mass exceeds the Hills limit (~10^8 M_☉), the tidal radius moves inside the event horizon, swallowing stars whole without flares.",
    bhMass: 50.0,
    bhSpin: 0.99,
    starMass: 0.8,
    beta: 0.8,
    jetPower: 15,
  },
};

export default function TidalDisruptionEventStudio() {
  // State variables
  const [themeId, setThemeId] = useState("eventHorizonAmber");
  const [presetId, setPresetId] = useState("swiftJ1644");
  const [bhMass, setBhMass] = useState(PRESETS.swiftJ1644.bhMass); // 10^6 M_sun
  const [bhSpin, setBhSpin] = useState(PRESETS.swiftJ1644.bhSpin); // Kerr a/M
  const [starMass, setStarMass] = useState(PRESETS.swiftJ1644.starMass); // M_sun
  const [beta, setBeta] = useState(PRESETS.swiftJ1644.beta); // Penetration factor R_T / R_p
  const [jetPower, setJetPower] = useState(PRESETS.swiftJ1644.jetPower); // 0-100
  const [simSpeed, setSimSpeed] = useState(1.0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [showLightCurve, setShowLightCurve] = useState(true);
  const [showTelemetry, setShowTelemetry] = useState(true);
  const [activeTab, setActiveTab] = useState("simulation"); // simulation, analytics, physics, guide

  // Metrics telemetry
  const [metrics, setMetrics] = useState({
    rHorizon: 0,
    rTidal: 0,
    rPericenter: 0,
    eddingtonRatio: 0,
    peakTemp: 0,
    timeElapsed: 0,
    particleCount: 0,
    disrupted: false,
  });

  // Audio Context Ref
  const audioCtxRef = useRef(null);
  const humOscRef = useRef(null);
  const jetGainRef = useRef(null);

  // Canvas Refs
  const canvasRef = useRef(null);
  const lightCurveCanvasRef = useRef(null);
  const animFrameRef = useRef(null);

  // Drag interaction state
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const customLaunchVelRef = useRef({ vx: 0, vy: 0 });

  // Physics Simulation Data state
  const theme = THEMES[themeId];
  const simTimeRef = useRef(0);
  const lightCurveDataRef = useRef([]);

  // Simulation Entities
  const starRef = useRef({
    x: -350,
    y: -220,
    vx: 2.2,
    vy: 1.1,
    radius: 7,
    disrupted: false,
    disruptionTime: 0,
  });

  const particlesRef = useRef([]);
  const accretionRingRef = useRef([]);

  // Audio Init & Update
  const updateAudio = useCallback(() => {
    if (!audioEnabled) {
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.suspend();
      }
      return;
    }

    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      audioCtxRef.current = new AudioCtx();

      // Deep Gravitational Hum Oscillator
      const humOsc = audioCtxRef.current.createOscillator();
      const humGain = audioCtxRef.current.createGain();
      humOsc.type = "sine";
      humOsc.frequency.setValueAtTime(55, audioCtxRef.current.currentTime);
      humGain.gain.setValueAtTime(0.08, audioCtxRef.current.currentTime);
      humOsc.connect(humGain);
      humGain.connect(audioCtxRef.current.destination);
      humOsc.start();
      humOscRef.current = humOsc;

      // Jet White Noise Rumble
      const bufferSize = audioCtxRef.current.sampleRate * 2;
      const noiseBuffer = audioCtxRef.current.createBuffer(1, bufferSize, audioCtxRef.current.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = audioCtxRef.current.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = audioCtxRef.current.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(180, audioCtxRef.current.currentTime);

      const jetGain = audioCtxRef.current.createGain();
      jetGain.gain.setValueAtTime(0, audioCtxRef.current.currentTime);

      whiteNoise.connect(filter);
      filter.connect(jetGain);
      jetGain.connect(audioCtxRef.current.destination);
      whiteNoise.start();
      jetGainRef.current = jetGain;
    }

    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }

    // Dynamic audio modulation based on BH mass and jet power
    if (humOscRef.current && audioCtxRef.current) {
      const freq = 40 + (100 / bhMass);
      humOscRef.current.frequency.setTargetAtTime(freq, audioCtxRef.current.currentTime, 0.1);
    }

    if (jetGainRef.current && audioCtxRef.current) {
      const gainVal = starRef.current.disrupted ? (jetPower / 100) * 0.12 : 0.01;
      jetGainRef.current.gain.setTargetAtTime(gainVal, audioCtxRef.current.currentTime, 0.1);
    }
  }, [audioEnabled, bhMass, jetPower]);

  useEffect(() => {
    updateAudio();
  }, [updateAudio]);

  // Reset Simulation
  const resetSimulation = useCallback(() => {
    simTimeRef.current = 0;
    lightCurveDataRef.current = [];
    particlesRef.current = [];
    accretionRingRef.current = [];

    // Calculate initial launch vector tailored to BH mass & beta
    const startX = -320;
    const startY = -180;
    const initialVx = 1.8 + Math.sqrt(bhMass) * 0.15;
    const initialVy = 0.9 + (beta * 0.1);

    starRef.current = {
      x: startX,
      y: startY,
      vx: initialVx,
      vy: initialVy,
      radius: Math.max(5, Math.min(12, Math.sqrt(starMass) * 6)),
      disrupted: false,
      disruptionTime: 0,
    };

    setMetrics((prev) => ({
      ...prev,
      disrupted: false,
      timeElapsed: 0,
      particleCount: 0,
    }));
  }, [bhMass, starMass, beta]);

  // Apply Preset
  const handleSelectPreset = (pId) => {
    const p = PRESETS[pId];
    if (!p) return;
    setPresetId(pId);
    setBhMass(p.bhMass);
    setBhSpin(p.bhSpin);
    setStarMass(p.starMass);
    setBeta(p.beta);
    setJetPower(p.jetPower);
    resetSimulation();
  };

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let animationId;

    const render = () => {
      if (isPlaying) {
        simTimeRef.current += 0.02 * simSpeed;
      }

      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;

      // Clear Canvas
      ctx.fillStyle = theme.canvasBg;
      ctx.fillRect(0, 0, width, height);

      // Physics Constants Calculation
      // Schwarzchild radius scale (pixels)
      const rHorizon = Math.max(16, 12 * Math.cbrt(bhMass));
      const photonSphere = rHorizon * (1.5 - 0.3 * bhSpin);
      // Tidal Radius R_T = R_* * (M_BH / M_*)^(1/3)
      const rTidal = rHorizon * 3.8 * Math.cbrt(bhMass / starMass);
      const rPericenter = rTidal / beta;

      // Check Hills limit condition (if R_T < R_Horizon, whole star swallowed)
      const hillsSwallowed = rTidal < rHorizon * 1.1;

      // Draw Grid / Spacetime Curvature Rings
      ctx.save();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 1;
      for (let r = 50; r < Math.max(width, height); r += 60) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      // 1. Draw Tidal Radius Threshold Indicator
      ctx.save();
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = "rgba(245, 158, 11, 0.35)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, rTidal, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "rgba(245, 158, 11, 0.6)";
      ctx.font = "11px sans-serif";
      ctx.fillText(`Tidal Radius R_T (${rTidal.toFixed(0)}px)`, cx + rTidal + 8, cy - 8);
      ctx.restore();

      // 2. Star Trajectory Physics Update
      const star = starRef.current;
      if (!star.disrupted && isPlaying) {
        // Gravitational force pulling star towards center (cx, cy)
        const dx = cx - (cx + star.x);
        const dy = cy - (cy + star.y);
        const dist = Math.hypot(dx, dy);

        // Relativistic acceleration ~ G*M / r^2
        const accel = (bhMass * 450) / (dist * dist + 10);
        const angle = Math.atan2(dy, dx);

        star.vx += Math.cos(angle) * accel * simSpeed;
        star.vy += Math.sin(angle) * accel * simSpeed;

        star.x += star.vx * simSpeed;
        star.y += star.vy * simSpeed;

        // Check if star reached pericenter / tidal radius
        if (dist <= rTidal) {
          star.disrupted = true;
          star.disruptionTime = simTimeRef.current;

          // Spawn Tidal Stream Particles (half bound, half unbound)
          const numParticles = hillsSwallowed ? 20 : 180;
          const newParticles = [];

          for (let i = 0; i < numParticles; i++) {
            const spreadAngle = angle + (Math.random() - 0.5) * 0.8;
            const speedVar = (Math.random() - 0.45) * 2.5; // >0 unbound, <0 bound
            const isBound = speedVar < 0.2;

            newParticles.push({
              x: star.x,
              y: star.y,
              vx: star.vx * 0.8 + Math.cos(spreadAngle + Math.PI / 2) * speedVar * 1.8,
              vy: star.vy * 0.8 + Math.sin(spreadAngle + Math.PI / 2) * speedVar * 1.8,
              life: 1.0,
              bound: isBound,
              size: Math.random() * 2.5 + 1.2,
              orbitAngle: Math.random() * Math.PI * 2,
            });
          }
          particlesRef.current = newParticles;
        }
      }

      // Draw Star Core if not disrupted
      if (!star.disrupted) {
        ctx.save();
        ctx.shadowColor = theme.starColor;
        ctx.shadowBlur = 15;
        ctx.fillStyle = theme.starColor;
        ctx.beginPath();
        ctx.arc(cx + star.x, cy + star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();

        // Velocity indicator vector
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx + star.x, cy + star.y);
        ctx.lineTo(cx + star.x + star.vx * 10, cy + star.y + star.vy * 10);
        ctx.stroke();
        ctx.restore();
      }

      // 3. Update & Draw Tidal Debris Particles
      if (star.disrupted && isPlaying) {
        particlesRef.current.forEach((p) => {
          const dx = cx - (cx + p.x);
          const dy = cy - (cy + p.y);
          const dist = Math.hypot(dx, dy);

          const accel = (bhMass * 450) / (dist * dist + 15);
          const angle = Math.atan2(dy, dx);

          p.vx += Math.cos(angle) * accel * simSpeed;
          p.vy += Math.sin(angle) * accel * simSpeed;

          p.x += p.vx * simSpeed;
          p.y += p.vy * simSpeed;

          // If bound particle gets very close to horizon, transition to Accretion Ring
          if (dist < rHorizon * 2.2 && p.bound) {
            accretionRingRef.current.push({
              angle: Math.atan2(p.y, p.x),
              radius: rHorizon * (1.3 + Math.random() * 1.2),
              speed: 0.04 + (Math.random() * 0.03),
              temp: 0.8 + Math.random() * 0.2,
            });
            p.life = 0; // consumed
          }
        });

        // Filter active particles
        particlesRef.current = particlesRef.current.filter((p) => p.life > 0);
      }

      // Render Particles
      ctx.save();
      particlesRef.current.forEach((p) => {
        ctx.fillStyle = p.bound ? theme.tidalStreamBound : theme.tidalStreamUnbound;
        ctx.beginPath();
        ctx.arc(cx + p.x, cy + p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // 4. Update & Draw Circularized Accretion Disk
      ctx.save();
      accretionRingRef.current.forEach((ringItem) => {
        if (isPlaying) {
          ringItem.angle += ringItem.speed * simSpeed;
        }

        const rx = cx + Math.cos(ringItem.angle) * ringItem.radius * 1.8;
        const ry = cy + Math.sin(ringItem.angle) * ringItem.radius * 0.7; // elliptical projection

        ctx.fillStyle = theme.accretionDisk;
        ctx.shadowColor = theme.bhGlow;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(rx, ry, 2.2, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // 5. Draw Polar Relativistic Jets if star is disrupted & jet power > 0
      if (star.disrupted && jetPower > 10) {
        const jetLength = (jetPower / 100) * 220;
        const jetPulse = Math.sin(simTimeRef.current * 8) * 6;

        ctx.save();
        // Top Jet (+Y)
        const jetGradTop = ctx.createLinearGradient(cx, cy - rHorizon, cx, cy - rHorizon - jetLength);
        jetGradTop.addColorStop(0, theme.photonRing);
        jetGradTop.addColorStop(0.4, theme.jetColor);
        jetGradTop.addColorStop(1, "transparent");

        ctx.fillStyle = jetGradTop;
        ctx.beginPath();
        ctx.moveTo(cx - 6, cy - rHorizon);
        ctx.lineTo(cx + 6, cy - rHorizon);
        ctx.lineTo(cx + 18 + jetPulse, cy - rHorizon - jetLength);
        ctx.lineTo(cx - 18 - jetPulse, cy - rHorizon - jetLength);
        ctx.closePath();
        ctx.fill();

        // Bottom Jet (-Y)
        const jetGradBot = ctx.createLinearGradient(cx, cy + rHorizon, cx, cy + rHorizon + jetLength);
        jetGradBot.addColorStop(0, theme.photonRing);
        jetGradBot.addColorStop(0.4, theme.jetColor);
        jetGradBot.addColorStop(1, "transparent");

        ctx.fillStyle = jetGradBot;
        ctx.beginPath();
        ctx.moveTo(cx - 6, cy + rHorizon);
        ctx.lineTo(cx + 6, cy + rHorizon);
        ctx.lineTo(cx + 18 + jetPulse, cy + rHorizon + jetLength);
        ctx.lineTo(cx - 18 - jetPulse, cy + rHorizon + jetLength);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }

      // 6. Draw Central Supermassive Black Hole & Photon Sphere
      ctx.save();

      // Gravitational Lensing Outer Halo
      const haloGrad = ctx.createRadialGradient(cx, cy, rHorizon * 0.8, cx, cy, rHorizon * 2.8);
      haloGrad.addColorStop(0, theme.bhGlow);
      haloGrad.addColorStop(0.5, "rgba(0, 0, 0, 0.4)");
      haloGrad.addColorStop(1, "transparent");
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, rHorizon * 2.8, 0, Math.PI * 2);
      ctx.fill();

      // Photon Sphere Ring
      ctx.strokeStyle = theme.photonRing;
      ctx.shadowColor = theme.photonRing;
      ctx.shadowBlur = 12;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx, cy, photonSphere, 0, Math.PI * 2);
      ctx.stroke();

      // Event Horizon Core (Black Hole)
      ctx.fillStyle = theme.bhCore;
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(cx, cy, rHorizon, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();

      // 7. Update Real-time Fallback Light Curve Data
      if (star.disrupted && isPlaying) {
        const dt = simTimeRef.current - star.disruptionTime;
        // Fallback rate dM/dt = (t / t_0)^(-5/3)
        const t0 = 0.5;
        const normTime = Math.max(0.1, dt / t0);
        const fallbackLum = Math.pow(normTime, -1.67) * (bhMass * 0.4);

        lightCurveDataRef.current.push({
          time: dt,
          lum: fallbackLum,
        });

        if (lightCurveDataRef.current.length > 120) {
          lightCurveDataRef.current.shift();
        }

        // Metrics calculation update
        const eddRatio = Math.min(10.0, fallbackLum * 1.5);
        const temp = 1.2 + Math.log10(bhMass) * 0.8 + (eddRatio * 0.4);

        setMetrics({
          rHorizon,
          rTidal,
          rPericenter,
          eddingtonRatio: eddRatio,
          peakTemp: temp,
          timeElapsed: dt,
          particleCount: particlesRef.current.length + accretionRingRef.current.length,
          disrupted: true,
        });
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [isPlaying, simSpeed, bhMass, bhSpin, starMass, beta, jetPower, theme]);

  // Render Fallback Light Curve Canvas (Overlay graph)
  useEffect(() => {
    const canvas = lightCurveCanvasRef.current;
    if (!canvas || !showLightCurve) return;
    const ctx = canvas.getContext("2d");

    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.fillRect(0, 0, w, h);

    // Axes
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(30, 10);
    ctx.lineTo(30, h - 20);
    ctx.lineTo(w - 10, h - 20);
    ctx.stroke();

    ctx.fillStyle = "#94a3b8";
    ctx.font = "9px sans-serif";
    ctx.fillText("Luminosity L", 32, 16);
    ctx.fillText("Time (t^-5/3 law)", w - 75, h - 6);

    const data = lightCurveDataRef.current;
    if (data.length < 2) return;

    ctx.strokeStyle = theme.photonRing;
    ctx.lineWidth = 2;
    ctx.beginPath();

    const maxLum = 5.0;
    data.forEach((pt, idx) => {
      const x = 30 + (idx / 120) * (w - 40);
      const y = (h - 20) - Math.min(h - 30, (pt.lum / maxLum) * (h - 30));

      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }, [showLightCurve, theme, metrics.timeElapsed]);

  // Mouse Interaction: Drag to launch star custom trajectory
  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left - canvas.width / 2;
    const clickY = e.clientY - rect.top - canvas.height / 2;

    isDraggingRef.current = true;
    dragStartRef.current = { x: clickX, y: clickY };
  };

  const handleMouseUp = (e) => {
    if (!isDraggingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const endX = e.clientX - rect.left - canvas.width / 2;
    const endY = e.clientY - rect.top - canvas.height / 2;

    isDraggingRef.current = false;

    // Set new launch position and velocity vector
    starRef.current = {
      x: dragStartRef.current.x,
      y: dragStartRef.current.y,
      vx: (endX - dragStartRef.current.x) * 0.08,
      vy: (endY - dragStartRef.current.y) * 0.08,
      radius: Math.max(5, Math.min(12, Math.sqrt(starMass) * 6)),
      disrupted: false,
      disruptionTime: 0,
    };
    particlesRef.current = [];
    accretionRingRef.current = [];
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-6 font-sans text-slate-100">
      {/* Header Banner */}
      <div className={`p-6 rounded-2xl border ${theme.border} ${theme.cardBg} shadow-2xl relative overflow-hidden transition-all duration-300`}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-500/10 via-cyan-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${theme.badge}`}>
                ASTROPHYSICS LABORATORY
              </span>
              <span className="text-xs text-slate-400 font-mono">Kerr Metric & Fallback Dynamics</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
              Tidal Disruption Event Studio
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Simulate stellar spaghettification, Roche limit tidal breakup ($R_T$), $t^{-5/3}$ mass fallback rate accretion, and relativistic polar jet emission around supermassive black holes.
            </p>
          </div>

          {/* Action Header Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all shadow-md ${
                isPlaying ? "bg-amber-600/80 hover:bg-amber-500 text-white" : "bg-emerald-600/80 hover:bg-emerald-500 text-white"
              }`}
            >
              {isPlaying ? "Pause Simulation" : "Resume Simulation"}
            </button>
            <button
              onClick={resetSimulation}
              className="px-4 py-2 text-sm font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
            >
              Reset Orbit
            </button>
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={`px-3 py-2 text-xs font-medium rounded-xl border transition-all ${
                audioEnabled ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40" : "bg-slate-800 text-slate-400 border-slate-700"
              }`}
            >
              🔊 Audio Synth: {audioEnabled ? "ON" : "OFF"}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 mt-6 gap-6 text-sm font-medium">
          {["simulation", "analytics", "physics", "guide"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 capitalize transition-colors border-b-2 ${
                activeTab === tab ? `${theme.accentText} border-current font-semibold` : "text-slate-400 border-transparent hover:text-slate-200"
              }`}
            >
              {tab === "simulation" ? "Interactive Canvas" : tab === "analytics" ? "Telemetry & Light Curve" : tab === "physics" ? "Physics & Equations" : "Studio User Guide"}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Layout */}
      {activeTab === "simulation" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Canvas Viewport */}
          <div className="lg:col-span-2 space-y-4">
            <div className={`relative rounded-2xl border ${theme.border} bg-slate-950 overflow-hidden shadow-2xl group`}>
              <canvas
                ref={canvasRef}
                width={800}
                height={520}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                className="w-full h-[520px] cursor-crosshair block"
              />

              {/* Real-time Light Curve Overlay Graph */}
              {showLightCurve && (
                <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur-md border border-slate-700/60 rounded-xl p-2.5 shadow-xl">
                  <div className="flex items-center justify-between text-[11px] text-slate-300 font-mono mb-1">
                    <span>Fallback Light Curve ($dM/dt$)</span>
                    <button
                      onClick={() => setShowLightCurve(false)}
                      className="text-slate-400 hover:text-white ml-2"
                    >
                      ✕
                    </button>
                  </div>
                  <canvas ref={lightCurveCanvasRef} width={220} height={90} className="rounded border border-slate-800" />
                </div>
              )}

              {/* Canvas Interactive Tip */}
              <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 pointer-events-none">
                💡 Drag & drop on canvas to manually launch a star trajectory
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 text-center">
                <span className="text-xs text-slate-400 block">Horizon Radius ($R_s$)</span>
                <span className="text-lg font-bold text-amber-400 font-mono">{metrics.rHorizon.toFixed(1)} px</span>
              </div>
              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 text-center">
                <span className="text-xs text-slate-400 block">Tidal Radius ($R_T$)</span>
                <span className="text-lg font-bold text-cyan-400 font-mono">{metrics.rTidal.toFixed(1)} px</span>
              </div>
              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 text-center">
                <span className="text-xs text-slate-400 block">Eddington Ratio (L / L_Edd)</span>
                <span className="text-lg font-bold text-emerald-400 font-mono">{metrics.eddingtonRatio.toFixed(2)}</span>
              </div>
              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 text-center">
                <span className="text-xs text-slate-400 block">Active Particles</span>
                <span className="text-lg font-bold text-purple-400 font-mono">{metrics.particleCount}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Parameters & Controls */}
          <div className="space-y-6">
            {/* Presets & Themes Card */}
            <div className={`p-5 rounded-2xl border ${theme.border} ${theme.cardBg} space-y-4`}>
              <h2 className="text-sm font-semibold tracking-wider text-slate-300 uppercase">Astrophysical Scenarios</h2>
              <div className="grid grid-cols-1 gap-2">
                {Object.values(PRESETS).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPreset(p.id)}
                    className={`p-3 rounded-xl text-left border text-xs transition-all ${
                      presetId === p.id
                        ? `${theme.border} bg-slate-800/90 text-white font-medium shadow-md`
                        : "border-slate-800 bg-slate-900/50 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                    }`}
                  >
                    <div className="font-semibold text-slate-200">{p.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{p.formula}</div>
                  </button>
                ))}
              </div>

              {/* Theme Switcher */}
              <div className="pt-2">
                <span className="text-xs text-slate-400 block mb-2 font-medium">Visual Spectrum Theme</span>
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(THEMES).map((th) => (
                    <button
                      key={th.id}
                      onClick={() => setThemeId(th.id)}
                      className={`px-3 py-1.5 text-xs rounded-lg border text-center transition-all ${
                        themeId === th.id
                          ? `${th.badge} font-semibold`
                          : "border-slate-800 bg-slate-900/40 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {th.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Physical Parameter Sliders */}
            <div className={`p-5 rounded-2xl border ${theme.border} ${theme.cardBg} space-y-4`}>
              <h2 className="text-sm font-semibold tracking-wider text-slate-300 uppercase">Black Hole & Stellar Parameters</h2>

              {/* BH Mass Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Black Hole Mass (M_BH)</span>
                  <span className="font-mono text-amber-400 font-semibold">{bhMass.toFixed(1)} × 10⁶ M_☉</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="50.0"
                  step="0.5"
                  value={bhMass}
                  onChange={(e) => setBhMass(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              {/* BH Spin Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Kerr Spin Parameter ($a/M$)</span>
                  <span className="font-mono text-cyan-400 font-semibold">{bhSpin.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="0.99"
                  step="0.01"
                  value={bhSpin}
                  onChange={(e) => setBhSpin(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              {/* Star Mass Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Stellar Mass ($M_*$)</span>
                  <span className="font-mono text-emerald-400 font-semibold">{starMass.toFixed(1)} M_☉</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="10.0"
                  step="0.2"
                  value={starMass}
                  onChange={(e) => setStarMass(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              {/* Penetration Parameter Beta */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Penetration Factor ($\beta = R_T / R_p$)</span>
                  <span className="font-mono text-purple-400 font-semibold">{beta.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="5.0"
                  step="0.1"
                  value={beta}
                  onChange={(e) => setBeta(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>

              {/* Jet Power Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Relativistic Jet Power</span>
                  <span className="font-mono text-rose-400 font-semibold">{jetPower}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={jetPower}
                  onChange={(e) => setJetPower(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
              </div>

              {/* Simulation Speed Slider */}
              <div className="space-y-1 pt-2 border-t border-slate-800">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Time Compression Speed</span>
                  <span className="font-mono text-slate-200 font-semibold">{simSpeed.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="3.0"
                  step="0.1"
                  value={simSpeed}
                  onChange={(e) => setSimSpeed(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-slate-400"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Telemetry & Analytics */}
      {activeTab === "analytics" && (
        <div className={`p-6 rounded-2xl border ${theme.border} ${theme.cardBg} space-y-6`}>
          <h2 className="text-xl font-bold text-white">Astrophysical Telemetry & Real-time Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <h3 className="text-sm font-semibold text-slate-300">Tidal Radius & Relativistic Metrics</h3>
              <ul className="space-y-2 text-xs font-mono text-slate-300">
                <li className="flex justify-between border-b border-slate-800/80 pb-1">
                  <span className="text-slate-400">Black Hole Schwarzschild Radius (R_s):</span>
                  <span className="text-amber-400 font-bold">{metrics.rHorizon.toFixed(2)} px</span>
                </li>
                <li className="flex justify-between border-b border-slate-800/80 pb-1">
                  <span className="text-slate-400">Tidal Disruption Radius (R_T):</span>
                  <span className="text-cyan-400 font-bold">{metrics.rTidal.toFixed(2)} px</span>
                </li>
                <li className="flex justify-between border-b border-slate-800/80 pb-1">
                  <span className="text-slate-400">Orbit Pericenter Distance (R_p):</span>
                  <span className="text-emerald-400 font-bold">{metrics.rPericenter.toFixed(2)} px</span>
                </li>
                <li className="flex justify-between border-b border-slate-800/80 pb-1">
                  <span className="text-slate-400">Penetration Factor (β = R_T / R_p):</span>
                  <span className="text-purple-400 font-bold">{beta.toFixed(2)}</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <h3 className="text-sm font-semibold text-slate-300">Accretion Disk & Jet Luminosity</h3>
              <ul className="space-y-2 text-xs font-mono text-slate-300">
                <li className="flex justify-between border-b border-slate-800/80 pb-1">
                  <span className="text-slate-400">Eddington Luminosity Ratio (L/L_Edd):</span>
                  <span className="text-rose-400 font-bold">{metrics.eddingtonRatio.toFixed(2)}</span>
                </li>
                <li className="flex justify-between border-b border-slate-800/80 pb-1">
                  <span className="text-slate-400">Peak Accretion Disk Temperature:</span>
                  <span className="text-amber-300 font-bold">10^{(metrics.peakTemp || 5).toFixed(1)} K</span>
                </li>
                <li className="flex justify-between border-b border-slate-800/80 pb-1">
                  <span className="text-slate-400">Mass Fallback Rate Scaling:</span>
                  <span className="text-slate-200 font-bold">dM/dt ∝ t^(-5/3)</span>
                </li>
                <li className="flex justify-between border-b border-slate-800/80 pb-1">
                  <span className="text-slate-400">Relativistic Jet Lorentz Factor (γ):</span>
                  <span className="text-cyan-300 font-bold">~ 2.5 - 10.0</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Physics Equations */}
      {activeTab === "physics" && (
        <div className={`p-6 rounded-2xl border ${theme.border} ${theme.cardBg} space-y-4`}>
          <h2 className="text-xl font-bold text-white">Mathematical & Theoretical Physics Formulation</h2>
          <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <h3 className="text-sm font-semibold text-amber-400 mb-1">1. Tidal Radius (R_T) &amp; Roche Limit</h3>
              <p>
                A star of radius R_* and mass M_* approaching a supermassive black hole of mass M_BH is tidally disrupted when the gravitational tidal forces of the black hole exceed the self-gravity holding the star together:
              </p>
              <div className="my-2 p-2 bg-slate-900 rounded font-mono text-center text-amber-300">
                R_T = R_* × ( M_BH / M_* )^(1/3)
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <h3 className="text-sm font-semibold text-cyan-400 mb-1">2. Mass Fallback Rate (t^-5/3 Keplerian Decay)</h3>
              <p>
                During disruption, roughly 50% of the stellar mass becomes gravitationally bound to the black hole in highly eccentric Keplerian orbits. The rate at which debris returns to pericenter follows a power-law fallback decay:
              </p>
              <div className="my-2 p-2 bg-slate-900 rounded font-mono text-center text-cyan-300">
                dM / dt = (1/3) × (M_* / t_0) × (t / t_0)^(-5/3)
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <h3 className="text-sm font-semibold text-emerald-400 mb-1">3. Relativistic Doppler Beaming &amp; Polar Jets</h3>
              <p>
                Relativistic plasma jets ejected from the black hole ergosphere emit synchrotron radiation boosted by the Lorentz factor γ = (1 - β²)^(-1/2):
              </p>
              <div className="my-2 p-2 bg-slate-900 rounded font-mono text-center text-emerald-300">
                I(θ) = I_0 × [ γ (1 - β cos θ) ]^(-3)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: User Guide */}
      {activeTab === "guide" && (
        <div className={`p-6 rounded-2xl border ${theme.border} ${theme.cardBg} space-y-4`}>
          <h2 className="text-xl font-bold text-white">Interactive Studio User Guide</h2>
          <div className="space-y-3 text-xs text-slate-300">
            <p>Welcome to the <strong>Tidal Disruption Event (TDE) Studio</strong>!</p>
            <ul className="list-disc list-inside space-y-2 text-slate-300">
              <li><strong>Interactive Launch:</strong> Click and drag anywhere on the black viewport canvas to set a star's custom starting location and trajectory vector towards the black hole.</li>
              <li><strong>Presets Selection:</strong> Click any of the pre-configured astrophysics presets (e.g. <em>Swift J1644+57</em>) to load real-world observational parameters.</li>
              <li><strong>Audio Synthesizer:</strong> Toggle the 🔊 Audio Synth button to hear real-time gravitational wave frequencies and jet rumble audio feedback generated via Web Audio API.</li>
              <li><strong>Spectrum Themes:</strong> Switch visual themes to visualize different electromagnetic spectrums (X-Ray, Ultraviolet, Radio, Emerald).</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
