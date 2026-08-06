import React, { useState, useEffect, useRef, useCallback } from "react";

// Visual Theme Presets for Cymatic Particles
const THEMES = {
  cyber: {
    id: "cyber",
    name: "Cyber Neon",
    bg: "from-slate-950 via-indigo-950 to-slate-900",
    canvasBg: "#050814",
    colors: ["#00f3ff", "#7000ff", "#ff007f", "#00ff9d", "#ffffff"],
    nodeLineColor: "rgba(0, 243, 255, 0.25)",
    accentText: "text-cyan-400",
    accentBorder: "border-cyan-500/40",
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    buttonBg: "bg-cyan-600 hover:bg-cyan-500 text-white",
  },
  solar: {
    id: "solar",
    name: "Solar Plasma",
    bg: "from-amber-950 via-red-950 to-slate-950",
    canvasBg: "#120503",
    colors: ["#ff4500", "#ffaa00", "#ff0055", "#ffff00", "#ffffff"],
    nodeLineColor: "rgba(255, 170, 0, 0.25)",
    accentText: "text-amber-400",
    accentBorder: "border-amber-500/40",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    buttonBg: "bg-amber-600 hover:bg-amber-500 text-white",
  },
  emerald: {
    id: "emerald",
    name: "Quantum Aurora",
    bg: "from-emerald-950 via-slate-950 to-teal-950",
    canvasBg: "#03120e",
    colors: ["#00ffaa", "#00cc88", "#38ef7d", "#11998e", "#e0ffff"],
    nodeLineColor: "rgba(0, 255, 170, 0.25)",
    accentText: "text-emerald-400",
    accentBorder: "border-emerald-500/40",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    buttonBg: "bg-emerald-600 hover:bg-emerald-500 text-white",
  },
  violet: {
    id: "violet",
    name: "Cosmic Violet",
    bg: "from-purple-950 via-slate-950 to-indigo-950",
    canvasBg: "#070518",
    colors: ["#a855f7", "#ec4899", "#818cf8", "#c084fc", "#ffffff"],
    nodeLineColor: "rgba(168, 85, 247, 0.25)",
    accentText: "text-purple-400",
    accentBorder: "border-purple-500/40",
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    buttonBg: "bg-purple-600 hover:bg-purple-500 text-white",
  },
  hologram: {
    id: "hologram",
    name: "Holographic Gold",
    bg: "from-stone-950 via-amber-950 to-stone-900",
    canvasBg: "#141008",
    colors: ["#fbbf24", "#f59e0b", "#f43f5e", "#38bdf8", "#ffffff"],
    nodeLineColor: "rgba(251, 191, 36, 0.25)",
    accentText: "text-amber-300",
    accentBorder: "border-amber-400/40",
    badge: "bg-amber-400/20 text-amber-200 border-amber-400/40",
    buttonBg: "bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold",
  },
};

// Cymatic Resonant Presets
const PRESETS = [
  { name: "Chladni Cross", m: 2, n: 2, phase: 0.5, shape: "square", desc: "Fundamental orthogonal nodal cross" },
  { name: "Sacred Matrix", m: 4, n: 4, phase: 0.5, shape: "square", desc: "High symmetry 4x4 vibration grid" },
  { name: "Butterfly Node", m: 5, n: 2, phase: 0.7, shape: "square", desc: "Organic winged node geometric pattern" },
  { name: "Quantum Ring", m: 3, n: 3, phase: 0.5, shape: "circle", desc: "Concentric circular resonance boundaries" },
  { name: "Star Mandala", m: 6, n: 6, phase: 0.5, shape: "circle", desc: "Intricate 12-petaled stellar cymatic rosette" },
  { name: "Hyper Web", m: 8, n: 5, phase: 0.3, shape: "diamond", desc: "Complex interference lattice with fine nodes" },
];

export default function ChladniPatternsLab() {
  // Resonance parameters
  const [modeM, setModeM] = useState(3);
  const [modeN, setModeN] = useState(3);
  const [phase, setPhase] = useState(0.5);
  const [plateShape, setPlateShape] = useState("square"); // square, circle, diamond
  const [vibrationAmp, setVibrationAmp] = useState(1.2);
  const [particleCount, setParticleCount] = useState(3500);
  const [particleSize, setParticleSize] = useState(1.8);
  const [particleFriction, setParticleFriction] = useState(0.92);
  const [showNodalLines, setShowNodalLines] = useState(true);
  const [autoSweep, setAutoSweep] = useState(false);
  const [currentTheme, setCurrentTheme] = useState("cyber");
  
  // Audio state
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [waveform, setWaveform] = useState("sine");
  const [volume, setVolume] = useState(0.15);
  const [pitchOctave, setPitchOctave] = useState(1);

  // Interaction stats & touch points
  const [touchPoint, setTouchPoint] = useState(null);
  const [stats, setStats] = useState({ hz: 440, kineticEnergy: 0, nodeCount: 0 });

  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);
  const audioCtxRef = useRef(null);
  const oscMainRef = useRef(null);
  const oscHarmonicRef = useRef(null);
  const gainNodeRef = useRef(null);

  const theme = THEMES[currentTheme];

  // Calculated acoustic fundamental frequency based on m and n
  const calculatedFrequency = Math.round(110 * Math.pow(2, (modeM + modeN) / 4) * pitchOctave);

  // Initialize Audio Context & Oscillators
  useEffect(() => {
    if (!soundEnabled) {
      if (audioCtxRef.current && audioCtxRef.current.state === "running") {
        audioCtxRef.current.suspend();
      }
      return;
    }

    try {
      if (!audioCtxRef.current) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContext();
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(volume, ctx.currentTime);
        gainNode.connect(ctx.destination);

        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();

        osc1.type = waveform;
        osc2.type = waveform === "sine" ? "triangle" : "sine";

        osc1.connect(gainNode);
        osc2.connect(gainNode);

        osc1.start();
        osc2.start();

        audioCtxRef.current = ctx;
        gainNodeRef.current = gainNode;
        oscMainRef.current = osc1;
        oscHarmonicRef.current = osc2;
      } else if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }
    } catch (e) {
      console.warn("Audio Context init error:", e);
    }
  }, [soundEnabled, waveform]);

  // Update Audio Frequencies & Volume
  useEffect(() => {
    if (audioCtxRef.current && gainNodeRef.current && soundEnabled) {
      const now = audioCtxRef.current.currentTime;
      gainNodeRef.current.gain.setTargetAtTime(volume, now, 0.05);

      if (oscMainRef.current) {
        oscMainRef.current.frequency.setTargetAtTime(calculatedFrequency, now, 0.05);
        oscMainRef.current.type = waveform;
      }
      if (oscHarmonicRef.current) {
        const ratio = modeN > 0 ? modeM / modeN : 1.5;
        oscHarmonicRef.current.frequency.setTargetAtTime(calculatedFrequency * Math.min(ratio, 2.5), now, 0.05);
        oscHarmonicRef.current.type = waveform === "sine" ? "triangle" : "sine";
      }
    }
    setStats((prev) => ({ ...prev, hz: calculatedFrequency }));
  }, [calculatedFrequency, volume, waveform, soundEnabled, modeM, modeN]);

  // Initialize Particles
  const initParticles = useCallback((count) => {
    const newParticles = [];
    for (let i = 0; i < count; i++) {
      // Position normalized between -1 and 1
      let u = (Math.random() - 0.5) * 1.8;
      let v = (Math.random() - 0.5) * 1.8;
      newParticles.push({
        x: u,
        y: v,
        vx: (Math.random() - 0.5) * 0.002,
        vy: (Math.random() - 0.5) * 0.002,
        colorIndex: Math.floor(Math.random() * theme.colors.length),
        size: Math.random() * 0.8 + particleSize * 0.6,
      });
    }
    particlesRef.current = newParticles;
  }, [particleSize, theme.colors.length]);

  useEffect(() => {
    initParticles(particleCount);
  }, [particleCount, initParticles]);

  // Chladni Plate Equation Z(x, y)
  const getVibrationAmplitude = useCallback((x, y, m, n, p, shape, touch) => {
    let r = Math.sqrt(x * x + y * y);
    if (shape === "circle" && r > 0.95) return 0;
    if (shape === "diamond" && Math.abs(x) + Math.abs(y) > 1.1) return 0;

    let z = 0;
    if (shape === "circle") {
      const theta = Math.atan2(y, x);
      z = Math.cos(n * Math.PI * r) * Math.cos(m * theta) - p * Math.sin(m * Math.PI * r) * Math.sin(n * theta);
    } else {
      // Square / Diamond plate formula
      const cosNX = Math.cos((n * Math.PI * (x + 1)) / 2);
      const cosMY = Math.cos((m * Math.PI * (y + 1)) / 2);
      const cosMX = Math.cos((m * Math.PI * (x + 1)) / 2);
      const cosNY = Math.cos((n * Math.PI * (y + 1)) / 2);
      z = p * cosNX * cosMY - (1 - p) * cosMX * cosNY;
    }

    // Touch damping node effect if active
    if (touch) {
      const dx = x - touch.x;
      const dy = y - touch.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 0.35) {
        z *= dist / 0.35; // Dampen amplitude near touch
      }
    }

    return z;
  }, []);

  // Main Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let width = (canvas.width = canvas.parentElement.clientWidth);
    let height = (canvas.height = Math.min(width * 0.75, 540));

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = Math.min(width * 0.75, 540);
    };

    window.addEventListener("resize", handleResize);

    let sweepTime = 0;

    const render = () => {
      let activeM = modeM;
      let activeN = modeN;
      let activePhase = phase;

      if (autoSweep) {
        sweepTime += 0.015;
        activePhase = 0.5 + Math.sin(sweepTime) * 0.45;
        if (Math.floor(sweepTime) % 10 === 0) {
          activeM = ((Math.floor(sweepTime / 2) % 6) + 1);
        }
      }

      // Fill canvas background with subtle trail blur
      ctx.fillStyle = theme.canvasBg;
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const scale = Math.min(width, height) * 0.42;

      // Draw Plate Boundary
      ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
      ctx.lineWidth = 2;
      if (plateShape === "circle") {
        ctx.beginPath();
        ctx.arc(centerX, centerY, scale, 0, Math.PI * 2);
        ctx.stroke();
      } else if (plateShape === "diamond") {
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - scale);
        ctx.lineTo(centerX + scale, centerY);
        ctx.lineTo(centerX, centerY + scale);
        ctx.lineTo(centerX - scale, centerY);
        ctx.closePath();
        ctx.stroke();
      } else {
        ctx.strokeRect(centerX - scale, centerY - scale, scale * 2, scale * 2);
      }

      // Optional Nodal Resonance Overlay Lines
      if (showNodalLines) {
        ctx.strokeStyle = theme.nodeLineColor;
        ctx.lineWidth = 1;
        const gridStep = 4;
        for (let px = -scale; px <= scale; px += gridStep) {
          for (let py = -scale; py <= scale; py += gridStep) {
            const normX = px / scale;
            const normY = py / scale;
            const amp = Math.abs(getVibrationAmplitude(normX, normY, activeM, activeN, activePhase, plateShape, touchPoint));
            if (amp < 0.04) {
              ctx.fillRect(centerX + px, centerY + py, 1.5, 1.5);
            }
          }
        }
      }

      // Update & Render Particles
      const particles = particlesRef.current;
      let totalKinetic = 0;
      const eps = 0.04;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Gradient of vibration amplitude Z
        const zCenter = getVibrationAmplitude(p.x, p.y, activeM, activeN, activePhase, plateShape, touchPoint);
        const zRight = getVibrationAmplitude(p.x + eps, p.y, activeM, activeN, activePhase, plateShape, touchPoint);
        const zUp = getVibrationAmplitude(p.x, p.y + eps, activeM, activeN, activePhase, plateShape, touchPoint);

        // Force moves particles away from high amplitude towards zero-nodes
        const gradX = (Math.abs(zRight) - Math.abs(zCenter)) / eps;
        const gradY = (Math.abs(zUp) - Math.abs(zCenter)) / eps;

        const force = vibrationAmp * 0.0015;
        p.vx -= gradX * force + (Math.random() - 0.5) * 0.0001;
        p.vy -= gradY * force + (Math.random() - 0.5) * 0.0001;

        // Apply friction
        p.vx *= particleFriction;
        p.vy *= particleFriction;

        p.x += p.vx;
        p.y += p.vy;

        // Keep inside plate bounds
        if (plateShape === "circle") {
          const dist = Math.sqrt(p.x * p.x + p.y * p.y);
          if (dist > 0.95) {
            p.x *= 0.94;
            p.y *= 0.94;
            p.vx *= -0.5;
            p.vy *= -0.5;
          }
        } else if (plateShape === "diamond") {
          if (Math.abs(p.x) + Math.abs(p.y) > 0.95) {
            p.x *= 0.92;
            p.y *= 0.92;
            p.vx *= -0.5;
            p.vy *= -0.5;
          }
        } else {
          if (Math.abs(p.x) > 0.95) {
            p.x = Math.sign(p.x) * 0.94;
            p.vx *= -0.5;
          }
          if (Math.abs(p.y) > 0.95) {
            p.y = Math.sign(p.y) * 0.94;
            p.vy *= -0.5;
          }
        }

        totalKinetic += Math.sqrt(p.vx * p.vx + p.vy * p.vy);

        // Render Particle with Glow
        const canvasX = centerX + p.x * scale;
        const canvasY = centerY + p.y * scale;

        ctx.fillStyle = theme.colors[p.colorIndex];
        ctx.beginPath();
        ctx.arc(canvasX, canvasY, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Touch Point node if present
      if (touchPoint) {
        const tx = centerX + touchPoint.x * scale;
        const ty = centerY + touchPoint.y * scale;
        ctx.strokeStyle = "#ff007f";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(tx, ty, 14, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "rgba(255, 0, 127, 0.4)";
        ctx.fill();
      }

      setStats((prev) => ({
        ...prev,
        kineticEnergy: Math.round(totalKinetic * 100),
        nodeCount: activeM + activeN,
      }));

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [
    modeM,
    modeN,
    phase,
    plateShape,
    vibrationAmp,
    particleFriction,
    showNodalLines,
    autoSweep,
    theme,
    touchPoint,
    getVibrationAmplitude,
  ]);

  // Handle Mouse / Touch Interaction for Damping Node
  const handleCanvasInteraction = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = Math.min(width, height) * 0.42;

    const x = (clientX - rect.left - centerX) / scale;
    const y = (clientY - rect.top - centerY) / scale;

    setTouchPoint({ x, y });
  };

  const handleInteractionEnd = () => {
    setTouchPoint(null);
  };

  // Preset Applicator
  const applyPreset = (preset) => {
    setModeM(preset.m);
    setModeN(preset.n);
    setPhase(preset.phase);
    setPlateShape(preset.shape);
    initParticles(particleCount);
  };

  // Canvas Snapshot Export
  const downloadSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `cymatics-m${modeM}-n${modeN}-${currentTheme}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="w-full max-w-6xl mx-auto my-8 p-4 md:p-6 rounded-3xl bg-slate-900/90 text-slate-100 border border-slate-700/60 shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔊</span>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400">
              Chladni Cymatics Lab
            </h2>
            <span className={`px-3 py-0.5 text-xs font-semibold rounded-full border ${theme.badge}`}>
              {theme.name}
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Explore harmonic acoustic wave resonance & nodal particle geometry on vibrating surfaces.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-md flex items-center gap-2 ${
              soundEnabled
                ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            }`}
          >
            {soundEnabled ? "🔊 Sound Active" : "🔇 Sound Muted"}
          </button>

          <button
            onClick={() => setAutoSweep(!autoSweep)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-md ${
              autoSweep
                ? "bg-purple-600 hover:bg-purple-500 text-white animate-pulse"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            }`}
          >
            {autoSweep ? "⚡ Sweeping..." : "🔄 Auto Sweep"}
          </button>

          <button
            onClick={() => initParticles(particleCount)}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
          >
            ✨ Re-Scatter Dust
          </button>

          <button
            onClick={downloadSnapshot}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/30 transition-all"
          >
            📸 Export PNG
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive Canvas & Preset Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Canvas Display */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner group">
            <canvas
              ref={canvasRef}
              onMouseDown={handleCanvasInteraction}
              onMouseMove={(e) => e.buttons === 1 && handleCanvasInteraction(e)}
              onMouseUp={handleInteractionEnd}
              onTouchStart={handleCanvasInteraction}
              onTouchMove={handleCanvasInteraction}
              onTouchEnd={handleInteractionEnd}
              className="w-full h-auto cursor-crosshair block"
            />

            {/* Live Stats Overlay */}
            <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-3">
              <span>Freq: <strong className="text-cyan-400">{stats.hz} Hz</strong></span>
              <span>Harmonics: <strong className="text-purple-400">{modeM}:{modeN}</strong></span>
              <span>Energy: <strong className="text-amber-400">{stats.kineticEnergy}</strong></span>
            </div>

            {/* Instruction tooltip overlay */}
            <div className="absolute bottom-3 right-3 text-xs text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800 pointer-events-none">
              👆 Click & drag to place a finger vibration dampener
            </div>
          </div>

          {/* Presets Bar */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Cymatic Resonance Presets:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset)}
                  className={`p-2 rounded-lg text-left transition-all text-xs border ${
                    modeM === preset.m && modeN === preset.n && plateShape === preset.shape
                      ? "bg-cyan-950/80 border-cyan-500 text-cyan-300 font-semibold"
                      : "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300"
                  }`}
                >
                  <div className="truncate font-medium">{preset.name}</div>
                  <div className="text-[10px] text-slate-500">
                    ({preset.m},{preset.n}) • {preset.shape}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Control Panel Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-5 bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
          {/* Theme Selector */}
          <div>
            <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider block mb-2">
              Visual Palette Theme:
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {Object.keys(THEMES).map((tKey) => (
                <button
                  key={tKey}
                  onClick={() => setCurrentTheme(tKey)}
                  className={`py-1.5 px-1 rounded-lg text-xs font-medium border transition-all ${
                    currentTheme === tKey
                      ? "border-cyan-400 bg-cyan-950/60 text-cyan-200"
                      : "border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {THEMES[tKey].name.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Mode M & N Harmonic Controls */}
          <div className="space-y-4 pt-2 border-t border-slate-800">
            <div>
              <div className="flex justify-between text-xs mb-1 font-medium">
                <span className="text-slate-300">Horizontal Mode (M):</span>
                <span className="text-cyan-400 font-mono font-bold">{modeM}</span>
              </div>
              <input
                type="range"
                min="1"
                max="12"
                value={modeM}
                onChange={(e) => setModeM(Number(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer h-2"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-medium">
                <span className="text-slate-300">Vertical Mode (N):</span>
                <span className="text-purple-400 font-mono font-bold">{modeN}</span>
              </div>
              <input
                type="range"
                min="1"
                max="12"
                value={modeN}
                onChange={(e) => setModeN(Number(e.target.value))}
                className="w-full accent-purple-400 bg-slate-800 rounded-lg cursor-pointer h-2"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-medium">
                <span className="text-slate-300">Harmonic Phase Balance:</span>
                <span className="text-amber-400 font-mono">{phase.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.02"
                value={phase}
                onChange={(e) => setPhase(Number(e.target.value))}
                className="w-full accent-amber-400 bg-slate-800 rounded-lg cursor-pointer h-2"
              />
            </div>
          </div>

          {/* Plate Geometry */}
          <div className="pt-2 border-t border-slate-800">
            <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider block mb-2">
              Vibrating Plate Surface:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["square", "circle", "diamond"].map((shape) => (
                <button
                  key={shape}
                  onClick={() => setPlateShape(shape)}
                  className={`py-1.5 capitalize rounded-lg text-xs font-medium border transition-all ${
                    plateShape === shape
                      ? "bg-indigo-900/60 border-indigo-400 text-indigo-200"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"
                  }`}
                >
                  {shape}
                </button>
              ))}
            </div>
          </div>

          {/* Audio Synthesizer Settings */}
          {soundEnabled && (
            <div className="space-y-3 pt-3 border-t border-slate-800 bg-slate-900/70 p-3 rounded-xl border">
              <span className="text-xs font-semibold uppercase text-emerald-400 tracking-wider block">
                Web Audio Acoustic Synth:
              </span>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Waveform:</label>
                <div className="grid grid-cols-4 gap-1">
                  {["sine", "triangle", "square", "sawtooth"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setWaveform(type)}
                      className={`py-1 text-[10px] capitalize rounded border ${
                        waveform === type
                          ? "bg-emerald-900/80 border-emerald-400 text-emerald-200"
                          : "bg-slate-950 border-slate-800 text-slate-400"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                  <span>Pitch Octave multiplier:</span>
                  <span className="font-mono text-emerald-300">{pitchOctave}x</span>
                </div>
                <div className="flex gap-2">
                  {[0.5, 1, 2, 3].map((oct) => (
                    <button
                      key={oct}
                      onClick={() => setPitchOctave(oct)}
                      className={`flex-1 py-1 text-xs rounded border ${
                        pitchOctave === oct
                          ? "bg-emerald-900 border-emerald-400 text-emerald-200 font-bold"
                          : "bg-slate-950 border-slate-800 text-slate-400"
                      }`}
                    >
                      {oct}x
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                  <span>Synth Volume:</span>
                  <span className="font-mono text-emerald-300">{Math.round(volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="0.4"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-full accent-emerald-400 bg-slate-800 rounded-lg cursor-pointer h-1.5"
                />
              </div>
            </div>
          )}

          {/* Particle Fine-Tuning */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Dust Density:</span>
                <span className="text-slate-200 font-mono">{particleCount}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="7000"
                step="500"
                value={particleCount}
                onChange={(e) => setParticleCount(Number(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer h-1.5"
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-400">Show Node Guidance Lines:</span>
              <button
                onClick={() => setShowNodalLines(!showNodalLines)}
                className={`px-3 py-1 rounded-md text-xs font-medium border ${
                  showNodalLines
                    ? "bg-cyan-950 border-cyan-500 text-cyan-300"
                    : "bg-slate-900 border-slate-800 text-slate-400"
                }`}
              >
                {showNodalLines ? "ON" : "OFF"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
