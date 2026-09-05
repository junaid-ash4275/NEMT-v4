import React, { useState, useEffect, useRef, useCallback } from "react";

// Themes definition
const THEMES = {
  neon: {
    id: "neon",
    name: "Neon Cyber",
    bgGradient: "from-slate-950 via-purple-950 to-slate-900",
    canvasBg: "#030712",
    primary: "#00f3ff",
    secondary: "#ff00aa",
    accentText: "text-cyan-400",
    accentBorder: "border-cyan-500/40",
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    buttonActive: "bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/30",
    wavePrimary: "rgba(0, 243, 255, 0.8)",
    waveSecondary: "rgba(255, 0, 170, 0.6)",
    glow: "rgba(0, 243, 255, 0.5)",
  },
  violet: {
    id: "violet",
    name: "Antimatter Violet",
    bgGradient: "from-slate-950 via-indigo-950 to-purple-950",
    canvasBg: "#080314",
    primary: "#e879f9",
    secondary: "#a855f7",
    accentText: "text-fuchsia-400",
    accentBorder: "border-fuchsia-500/40",
    badge: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40",
    buttonActive: "bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-lg shadow-fuchsia-600/30",
    wavePrimary: "rgba(232, 121, 249, 0.8)",
    waveSecondary: "rgba(168, 85, 247, 0.6)",
    glow: "rgba(232, 121, 249, 0.5)",
  },
  solar: {
    id: "solar",
    name: "Solar Plasma",
    bgGradient: "from-amber-950 via-slate-950 to-orange-950",
    canvasBg: "#0c0702",
    primary: "#fbbf24",
    secondary: "#f97316",
    accentText: "text-amber-400",
    accentBorder: "border-amber-500/40",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    buttonActive: "bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-600/30",
    wavePrimary: "rgba(251, 191, 36, 0.8)",
    waveSecondary: "rgba(249, 115, 22, 0.6)",
    glow: "rgba(251, 191, 36, 0.5)",
  },
  matrix: {
    id: "matrix",
    name: "Matrix Emerald",
    bgGradient: "from-emerald-950 via-slate-950 to-teal-950",
    canvasBg: "#020d09",
    primary: "#10b981",
    secondary: "#06b6d4",
    accentText: "text-emerald-400",
    accentBorder: "border-emerald-500/40",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    buttonActive: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30",
    wavePrimary: "rgba(16, 185, 129, 0.8)",
    waveSecondary: "rgba(6, 182, 212, 0.6)",
    glow: "rgba(16, 185, 129, 0.5)",
  },
};

// Preset quantum configurations
const PRESETS = {
  doubleSlit: {
    id: "doubleSlit",
    name: "Double-Slit Interference",
    desc: "Classic Young interference pattern showing wave-particle superposition across two slits.",
    freq: 2.2,
    energy: 2,
    barrierHeight: 80,
    slitSeparation: 60,
    damping: 0.005,
    particleCount: 250,
  },
  tunneling: {
    id: "tunneling",
    name: "Quantum Tunneling",
    desc: "Incident wavepacket breaching a potential barrier with exponentially decaying amplitude.",
    freq: 1.8,
    energy: 3,
    barrierHeight: 95,
    slitSeparation: 0, // Solid wall with gap in center
    damping: 0.008,
    particleCount: 200,
  },
  harmonic: {
    id: "harmonic",
    name: "Harmonic Oscillator Superposition",
    desc: "Superposition of ground state |ψ₁⟩ and excited state |ψ₂⟩ creating coherent oscillations.",
    freq: 3.5,
    energy: 4,
    barrierHeight: 30,
    slitSeparation: 40,
    damping: 0.002,
    particleCount: 300,
  },
  decoherence: {
    id: "decoherence",
    name: "Decoherence Cloud",
    desc: "High-density particle swarm undergoing rapid phase decoherence into quantum thermal foam.",
    freq: 4.5,
    energy: 5,
    barrierHeight: 10,
    slitSeparation: 20,
    damping: 0.035,
    particleCount: 450,
  },
  standingWave: {
    id: "standingWave",
    name: "Counter-Propagating Superposition",
    desc: "Two wavepackets interfering constructively and destructively to produce standing nodes.",
    freq: 3.0,
    energy: 3,
    barrierHeight: 50,
    slitSeparation: 80,
    damping: 0.004,
    particleCount: 280,
  },
};

export default function QuantumSuperpositionLab() {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  // Audio refs
  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);
  const gainRef = useRef(null);

  // State parameters
  const [activeTheme, setActiveTheme] = useState("neon");
  const [activePreset, setActivePreset] = useState("doubleSlit");
  const [isPlaying, setIsPlaying] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(false);

  // Interactive Physics Parameters
  const [freq, setFreq] = useState(PRESETS.doubleSlit.freq);
  const [energy, setEnergy] = useState(PRESETS.doubleSlit.energy);
  const [barrierHeight, setBarrierHeight] = useState(PRESETS.doubleSlit.barrierHeight);
  const [slitSeparation, setSlitSeparation] = useState(PRESETS.doubleSlit.slitSeparation);
  const [damping, setDamping] = useState(PRESETS.doubleSlit.damping);
  const [particleCount, setParticleCount] = useState(PRESETS.doubleSlit.particleCount);

  // Telemetry stats
  const [fps, setFps] = useState(60);
  const [coherence, setCoherence] = useState(98.4);
  const [phaseAngle, setPhaseAngle] = useState(0);

  // Mouse interaction state
  const mouseRef = useRef({ x: -1, y: -1, isDown: false, collapseTime: 0 });

  // Current theme object
  const currentTheme = THEMES[activeTheme] || THEMES.neon;

  // Apply preset
  const handleSelectPreset = (presetKey) => {
    const p = PRESETS[presetKey];
    if (!p) return;
    setActivePreset(presetKey);
    setFreq(p.freq);
    setEnergy(p.energy);
    setBarrierHeight(p.barrierHeight);
    setSlitSeparation(p.slitSeparation);
    setDamping(p.damping);
    setParticleCount(p.particleCount);
  };

  // Audio setup and update
  const toggleAudio = () => {
    if (!audioEnabled) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(220 + freq * 40, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        audioCtxRef.current = ctx;
        oscRef.current = osc;
        gainRef.current = gain;
        setAudioEnabled(true);
      } catch (err) {
        console.error("Web Audio API not supported", err);
      }
    } else {
      if (oscRef.current) {
        try {
          oscRef.current.stop();
          oscRef.current.disconnect();
        } catch (e) {}
      }
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close();
        } catch (e) {}
      }
      audioCtxRef.current = null;
      oscRef.current = null;
      gainRef.current = null;
      setAudioEnabled(false);
    }
  };

  // Update audio pitch when frequency changes
  useEffect(() => {
    if (audioEnabled && oscRef.current && audioCtxRef.current) {
      try {
        const targetFreq = 180 + freq * 60 + energy * 25;
        oscRef.current.frequency.setTargetAtTime(targetFreq, audioCtxRef.current.currentTime, 0.1);
      } catch (e) {}
    }
  }, [freq, energy, audioEnabled]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (oscRef.current) {
        try { oscRef.current.stop(); } catch (e) {}
      }
      if (audioCtxRef.current) {
        try { audioCtxRef.current.close(); } catch (e) {}
      }
    };
  }, []);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let animationFrameId;
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsTimer = performance.now();
    let time = 0;

    // Generate random particle positions seeded for smooth physics
    const particles = Array.from({ length: 500 }, (_, i) => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.002,
      vy: (Math.random() - 0.5) * 0.002,
      phase: Math.random() * Math.PI * 2,
      size: Math.random() * 2 + 1,
    }));

    const render = (now) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;
      if (isPlaying) {
        time += delta * freq;
      }

      // Calculate FPS
      frameCount++;
      if (now - fpsTimer >= 500) {
        setFps(Math.round((frameCount * 1000) / (now - fpsTimer)));
        frameCount = 0;
        fpsTimer = now;

        // Dynamic telemetry update
        const computedPhase = ((time * 45) % 360).toFixed(1);
        const computedCoherence = (100 - damping * 1000 + Math.sin(time) * 1.5).toFixed(1);
        setPhaseAngle(computedPhase);
        setCoherence(Math.max(10, Math.min(99.9, computedCoherence)));
      }

      // Responsive resolution
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width || canvas.height !== rect.height) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }

      const w = canvas.width;
      const h = canvas.height;
      if (w === 0 || h === 0) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      // Background fill
      ctx.fillStyle = currentTheme.canvasBg;
      ctx.fillRect(0, 0, w, h);

      // Draw subtle grid lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Render Quantum Wave Function Intensity Map |\Psi(x,y,t)|^2
      const rows = 35;
      const cols = 50;
      const cellW = w / cols;
      const cellH = h / rows;

      const barrierX = w * 0.45;
      const slitHalfSep = (slitSeparation / 100) * (h * 0.25);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const px = (c + 0.5) * cellW;
          const py = (r + 0.5) * cellH;

          // Double slit potential check
          let isBarrier = false;
          if (Math.abs(px - barrierX) < 12 && barrierHeight > 10) {
            const distSlit1 = Math.abs(py - (h / 2 - slitHalfSep));
            const distSlit2 = Math.abs(py - (h / 2 + slitHalfSep));

            if (slitSeparation > 5) {
              if (distSlit1 > 18 && distSlit2 > 18) {
                isBarrier = true;
              }
            } else {
              // Tunneling mode: high wall everywhere except tiny gap
              if (Math.abs(py - h / 2) > 15) {
                isBarrier = true;
              }
            }
          }

          if (isBarrier) continue;

          // Compute quantum wave superposition \Psi_1 and \Psi_2
          const src1X = w * 0.1;
          const src1Y = h * 0.5 - slitHalfSep;
          const src2X = w * 0.1;
          const src2Y = h * 0.5 + slitHalfSep;

          const d1 = Math.hypot(px - src1X, py - src1Y);
          const d2 = Math.hypot(px - src2X, py - src2Y);

          const waveNumber = 0.05 * energy;

          // Wave amplitude dampening
          const amp1 = Math.exp(-d1 * 0.002 * (1 + damping * 10));
          const amp2 = Math.exp(-d2 * 0.002 * (1 + damping * 10));

          const psi1 = amp1 * Math.cos(waveNumber * d1 - time);
          const psi2 = amp2 * Math.cos(waveNumber * d2 - time + (activePreset === "standingWave" ? Math.PI : 0));

          // Collapse perturbation from mouse interaction
          let collapseEffect = 0;
          const mx = mouseRef.current.x;
          const my = mouseRef.current.y;
          if (mx > 0 && my > 0) {
            const mouseDist = Math.hypot(px - mx, py - my);
            collapseEffect = Math.exp(-mouseDist * 0.015) * 0.8;
          }

          // Combined probability intensity |\Psi|^2
          const psiTotal = psi1 + psi2;
          const intensity = Math.min(1, (psiTotal * psiTotal * 0.25) + collapseEffect);

          if (intensity > 0.02) {
            ctx.fillStyle = c % 2 === 0 ? currentTheme.wavePrimary : currentTheme.waveSecondary;
            ctx.globalAlpha = intensity * 0.7;
            ctx.beginPath();
            ctx.arc(px, py, cellW * 0.4 * (0.8 + intensity * 0.5), 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      ctx.globalAlpha = 1.0;

      // Render Double-Slit Barrier Wall
      if (barrierHeight > 5) {
        ctx.fillStyle = `rgba(30, 41, 59, ${barrierHeight / 100 * 0.9})`;
        ctx.strokeStyle = currentTheme.primary;
        ctx.lineWidth = 2;

        const wallW = 16;
        const wallX = barrierX - wallW / 2;

        if (slitSeparation > 5) {
          // Top wall block
          const topH = h / 2 - slitHalfSep - 18;
          if (topH > 0) {
            ctx.fillRect(wallX, 0, wallW, topH);
            ctx.strokeRect(wallX, 0, wallW, topH);
          }
          // Middle wall block between slits
          const midY = h / 2 - slitHalfSep + 18;
          const midH = (slitHalfSep * 2) - 36;
          if (midH > 0) {
            ctx.fillRect(wallX, midY, wallW, midH);
            ctx.strokeRect(wallX, midY, wallW, midH);
          }
          // Bottom wall block
          const botY = h / 2 + slitHalfSep + 18;
          const botH = h - botY;
          if (botY < h && botH > 0) {
            ctx.fillRect(wallX, botY, wallW, botH);
            ctx.strokeRect(wallX, botY, wallW, botH);
          }
        } else {
          // Single gap wall (Quantum Tunneling)
          const gapH = 30;
          const topH = h / 2 - gapH / 2;
          const botY = h / 2 + gapH / 2;

          ctx.fillRect(wallX, 0, wallW, topH);
          ctx.strokeRect(wallX, 0, wallW, topH);

          ctx.fillRect(wallX, botY, wallW, h - botY);
          ctx.strokeRect(wallX, botY, wallW, h - botY);
        }
      }

      // Render Quantum Probability Swarm Particles
      const activeCount = Math.min(particleCount, 500);
      for (let i = 0; i < activeCount; i++) {
        const p = particles[i];

        if (isPlaying) {
          p.x += p.vx * freq;
          p.y += p.vy * freq;
          p.phase += 0.05 * freq;

          if (p.x < 0) p.x = 1;
          if (p.x > 1) p.x = 0;
          if (p.y < 0) p.y = 1;
          if (p.y > 1) p.y = 0;
        }

        const px = p.x * w;
        const py = p.y * h;

        // Particle probability glow
        const glowRad = p.size * (2 + Math.sin(p.phase + time * 2));
        ctx.shadowColor = currentTheme.primary;
        ctx.shadowBlur = 10;
        ctx.fillStyle = i % 2 === 0 ? currentTheme.primary : currentTheme.secondary;

        ctx.beginPath();
        ctx.arc(px, py, Math.max(1, glowRad), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0; // Reset shadow glow

      // Render Mouse Wavefunction Measurement Pulse
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      if (mx > 0 && my > 0) {
        const pulseR = 30 + Math.sin(time * 8) * 6;
        ctx.strokeStyle = currentTheme.secondary;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(mx, my, pulseR, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = currentTheme.primary;
        ctx.beginPath();
        ctx.arc(mx, my, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.font = "10px monospace";
        ctx.fillText("ψ COLLAPSE MEASUREMENT", mx + 12, my - 8);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [
    isPlaying,
    freq,
    energy,
    barrierHeight,
    slitSeparation,
    damping,
    particleCount,
    activeTheme,
    activePreset,
    currentTheme,
  ]);

  // Handle Mouse/Touch Interaction
  const handlePointerMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouseRef.current.x = e.clientX - rect.getBoundingClientRect ? e.clientX - rect.left : e.touches?.[0]?.clientX - rect.left;
    mouseRef.current.y = e.clientY - rect.getBoundingClientRect ? e.clientY - rect.top : e.touches?.[0]?.clientY - rect.top;
  };

  const handlePointerLeave = () => {
    mouseRef.current.x = -1;
    mouseRef.current.y = -1;
  };

  // Snapshot PNG export
  const handleSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `quantum-superposition-${activePreset}-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className={`w-full bg-gradient-to-b ${currentTheme.bgGradient} p-4 sm:p-6 md:p-8 rounded-3xl border border-slate-800/80 shadow-2xl transition-all duration-500 my-8`}>
      {/* Studio Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${currentTheme.badge} uppercase tracking-wider`}>
              Quantum Physics Studio
            </span>
            <span className="text-xs text-slate-400 font-mono">|\Psi(x,y,t)|^2</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Quantum Superposition <span className={currentTheme.accentText}>& Wavepacket Lab</span>
          </h2>
        </div>

        {/* Action Controls & Theme Picker */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Theme Selector */}
          <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            {Object.values(THEMES).map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTheme(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTheme === t.id
                    ? t.buttonActive
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>

          {/* Audio Button */}
          <button
            onClick={toggleAudio}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
              audioEnabled
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-lg shadow-amber-500/10"
                : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
            }`}
          >
            {audioEnabled ? "🔊 Harmonics ON" : "🔇 Harmonics Muted"}
          </button>

          {/* Play/Pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg ${
              isPlaying
                ? "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                : "bg-emerald-600 hover:bg-emerald-500 text-white"
            }`}
          >
            {isPlaying ? "⏸ Pause" : "▶ Resume"}
          </button>

          {/* Export Snapshot */}
          <button
            onClick={handleSnapshot}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-all flex items-center gap-1"
          >
            📸 Snapshot
          </button>
        </div>
      </div>

      {/* Presets Navigation Bar */}
      <div className="flex flex-wrap gap-2 mb-6 p-2 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800/60">
        {Object.values(PRESETS).map((p) => (
          <button
            key={p.id}
            onClick={() => handleSelectPreset(p.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all text-left flex-1 min-w-[140px] ${
              activePreset === p.id
                ? `${currentTheme.buttonActive}`
                : "bg-slate-950/40 text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent"
            }`}
          >
            <div className="font-bold">{p.name}</div>
          </button>
        ))}
      </div>

      {/* Main Canvas Simulation View */}
      <div className="relative w-full h-[400px] sm:h-[480px] rounded-2xl overflow-hidden border border-slate-800/80 shadow-inner group">
        <canvas
          ref={canvasRef}
          onMouseMove={handlePointerMove}
          onMouseLeave={handlePointerLeave}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerLeave}
          className="w-full h-full cursor-crosshair block"
        />

        {/* Live Telemetry Overlay */}
        <div className="absolute top-4 left-4 flex flex-col gap-1.5 p-3 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800/80 text-xs font-mono pointer-events-none">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>FPS: {fps}</span>
          </div>
          <div className="text-slate-400">
            Coherence: <span className={currentTheme.accentText}>{coherence}%</span>
          </div>
          <div className="text-slate-400">
            Phase Angle: <span className="text-slate-200">{phaseAngle}°</span>
          </div>
          <div className="text-slate-400">
            State: <span className="text-slate-200">|ψ⟩ = α|1⟩ + β|2⟩</span>
          </div>
        </div>

        {/* Overlay Instruction */}
        <div className="absolute bottom-4 right-4 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800/80 text-[11px] text-slate-400 font-mono pointer-events-none">
          💡 Click or drag cursor to cause wavefunction measurement collapse
        </div>
      </div>

      {/* Control Sliders Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {/* Wave Frequency */}
        <div className="bg-slate-900/70 backdrop-blur-md p-4 rounded-2xl border border-slate-800/80">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-semibold text-slate-300">Wave Frequency (ω)</label>
            <span className="text-xs font-mono text-cyan-400">{freq.toFixed(1)} rad/s</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="5.0"
            step="0.1"
            value={freq}
            onChange={(e) => setFreq(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {/* Quantum Energy Level */}
        <div className="bg-slate-900/70 backdrop-blur-md p-4 rounded-2xl border border-slate-800/80">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-semibold text-slate-300">Energy Level (n)</label>
            <span className="text-xs font-mono text-purple-400">n = {energy}</span>
          </div>
          <input
            type="range"
            min="1"
            max="6"
            step="1"
            value={energy}
            onChange={(e) => setEnergy(parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
          />
        </div>

        {/* Potential Barrier Height */}
        <div className="bg-slate-900/70 backdrop-blur-md p-4 rounded-2xl border border-slate-800/80">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-semibold text-slate-300">Potential Barrier (V₀)</label>
            <span className="text-xs font-mono text-amber-400">{barrierHeight}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={barrierHeight}
            onChange={(e) => setBarrierHeight(parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
        </div>

        {/* Slit Separation */}
        <div className="bg-slate-900/70 backdrop-blur-md p-4 rounded-2xl border border-slate-800/80">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-semibold text-slate-300">Slit Separation (d)</label>
            <span className="text-xs font-mono text-emerald-400">{slitSeparation} px</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={slitSeparation}
            onChange={(e) => setSlitSeparation(parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
          />
        </div>

        {/* Quantum Particle Density */}
        <div className="bg-slate-900/70 backdrop-blur-md p-4 rounded-2xl border border-slate-800/80">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-semibold text-slate-300">Particle Density</label>
            <span className="text-xs font-mono text-fuchsia-400">{particleCount} quanta</span>
          </div>
          <input
            type="range"
            min="50"
            max="500"
            step="25"
            value={particleCount}
            onChange={(e) => setParticleCount(parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-fuchsia-400"
          />
        </div>

        {/* Decoherence Rate */}
        <div className="bg-slate-900/70 backdrop-blur-md p-4 rounded-2xl border border-slate-800/80">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-semibold text-slate-300">Decoherence Rate (γ)</label>
            <span className="text-xs font-mono text-sky-400">{(damping * 100).toFixed(1)}%</span>
          </div>
          <input
            type="range"
            min="0.001"
            max="0.05"
            step="0.002"
            value={damping}
            onChange={(e) => setDamping(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
          />
        </div>
      </div>
    </div>
  );
}
