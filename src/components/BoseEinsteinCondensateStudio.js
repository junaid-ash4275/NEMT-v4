import React, { useState, useEffect, useRef, useCallback } from "react";

// Themes & Visual Design Tokens
const THEMES = {
  cryoCyan: {
    id: "cryoCyan",
    name: "Cryogenic Cyan",
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    accentText: "text-cyan-400",
    border: "border-cyan-500/30",
    cardBg: "bg-slate-900/85 backdrop-blur-md border-cyan-500/20",
    buttonBg: "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25",
    canvasBg: "#030a14",
    primaryGlow: "#00f0ff",
    secondaryGlow: "#3b82f6",
    waveColor: "rgba(0, 240, 255, 0.6)",
    particleColor: "#38bdf8",
    vortexColor: "#a855f7",
    latticeColor: "rgba(6, 182, 212, 0.15)",
  },
  superfluidEmerald: {
    id: "superfluidEmerald",
    name: "Superfluid Emerald",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    accentText: "text-emerald-400",
    border: "border-emerald-500/30",
    cardBg: "bg-slate-900/85 backdrop-blur-md border-emerald-500/20",
    buttonBg: "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25",
    canvasBg: "#02120a",
    primaryGlow: "#10b981",
    secondaryGlow: "#34d399",
    waveColor: "rgba(16, 185, 129, 0.6)",
    particleColor: "#34d399",
    vortexColor: "#fbbf24",
    latticeColor: "rgba(16, 185, 129, 0.15)",
  },
  solarPlasma: {
    id: "solarPlasma",
    name: "Solar Plasma",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    accentText: "text-amber-400",
    border: "border-amber-500/30",
    cardBg: "bg-slate-900/85 backdrop-blur-md border-amber-500/20",
    buttonBg: "bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white shadow-lg shadow-amber-500/25",
    canvasBg: "#140702",
    primaryGlow: "#f59e0b",
    secondaryGlow: "#f43f5e",
    waveColor: "rgba(245, 158, 11, 0.6)",
    particleColor: "#fbbf24",
    vortexColor: "#00f0ff",
    latticeColor: "rgba(245, 158, 11, 0.15)",
  },
  quantumViolet: {
    id: "quantumViolet",
    name: "Quantum Violet",
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    accentText: "text-purple-400",
    border: "border-purple-500/30",
    cardBg: "bg-slate-900/85 backdrop-blur-md border-purple-500/20",
    buttonBg: "bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white shadow-lg shadow-purple-500/25",
    canvasBg: "#090414",
    primaryGlow: "#c084fc",
    secondaryGlow: "#e879f9",
    waveColor: "rgba(192, 132, 252, 0.6)",
    particleColor: "#f0abfc",
    vortexColor: "#38bdf8",
    latticeColor: "rgba(168, 85, 247, 0.15)",
  },
};

// Physics Presets
const PRESETS = {
  groundState: {
    id: "groundState",
    name: "Pure Ground State",
    formula: "T = 0.02 T_c | N_0/N = 99.9%",
    desc: "Macroscopic quantum condensate near absolute zero with uniform spatial phase.",
    tempRatio: 0.02,
    atomCount: 1500,
    scatteringLength: 25,
    stirringSpeed: 0,
    latticeDepth: 0,
    aspectRatio: 1.0,
  },
  vortexLattice: {
    id: "vortexLattice",
    name: "Quantized Vortex Array",
    formula: "Ω_stir = 75 rpm | Abrikosov Lattice",
    desc: "Rotating optical laser creates topological quantum phase singularities.",
    tempRatio: 0.12,
    atomCount: 2200,
    scatteringLength: 35,
    stirringSpeed: 75,
    latticeDepth: 0,
    aspectRatio: 1.0,
  },
  darkSoliton: {
    id: "darkSoliton",
    name: "Dark Soliton Notch",
    formula: "Δϕ = π | Non-dispersive Wave",
    desc: "Coherent phase notch propagating through superfluid without dissipation.",
    tempRatio: 0.08,
    atomCount: 1800,
    scatteringLength: 45,
    stirringSpeed: 0,
    latticeDepth: 0,
    aspectRatio: 1.8,
  },
  mottInsulator: {
    id: "mottInsulator",
    name: "Optical Lattice Mott State",
    formula: "V_0 = 40 ℏω | Superfluid Phase Transition",
    desc: "Periodic standing laser wave locks atoms into localized quantum sites.",
    tempRatio: 0.05,
    atomCount: 2000,
    scatteringLength: 20,
    stirringSpeed: 0,
    latticeDepth: 40,
    aspectRatio: 1.0,
  },
  bosenova: {
    id: "bosenova",
    name: "Bosenova Collapse",
    formula: "a_s = -35 nm < 0 | Collapse & Implosion",
    desc: "Feshbach tuning to attractive interactions induces quantum implosion and blast.",
    tempRatio: 0.04,
    atomCount: 2500,
    scatteringLength: -35,
    stirringSpeed: 10,
    latticeDepth: 0,
    aspectRatio: 1.0,
  },
  thermalGas: {
    id: "thermalGas",
    name: "Thermal Normal Gas",
    formula: "T = 2.0 T_c | Classical Maxwellian",
    desc: "High temperature state above critical threshold with zero condensate fraction.",
    tempRatio: 2.0,
    atomCount: 1200,
    scatteringLength: 10,
    stirringSpeed: 0,
    latticeDepth: 0,
    aspectRatio: 1.0,
  },
};

export default function BoseEinsteinCondensateStudio() {
  // Theme & Preset state
  const [activeTheme, setActiveTheme] = useState("cryoCyan");
  const [activePreset, setActivePreset] = useState("groundState");

  // Physics parameters state
  const [tempRatio, setTempRatio] = useState(PRESETS.groundState.tempRatio);
  const [atomCount, setAtomCount] = useState(PRESETS.groundState.atomCount);
  const [scatteringLength, setScatteringLength] = useState(PRESETS.groundState.scatteringLength);
  const [stirringSpeed, setStirringSpeed] = useState(PRESETS.groundState.stirringSpeed);
  const [latticeDepth, setLatticeDepth] = useState(PRESETS.groundState.latticeDepth);
  const [aspectRatio, setAspectRatio] = useState(PRESETS.groundState.aspectRatio);

  // Playback & Sound state
  const [isPlaying, setIsPlaying] = useState(true);
  const [isAudioMuted, setIsAudioMuted] = useState(true);
  const [activeTab, setActiveTab] = useState("controls"); // "controls" | "telemetry" | "info"

  // User Interactive Touch/Drag State
  const [interactiveBeam, setInteractiveBeam] = useState(null);

  // Canvas & Audio Refs
  const canvasRef = useRef(null);
  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);
  const gainRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Internal Particle Physics & Wavefunction Data
  const particlesRef = useRef([]);
  const phaseOffsetRef = useRef(0);
  const bosenovaPhaseRef = useRef(0);

  const theme = THEMES[activeTheme];

  // Initialize Web Audio API synth
  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        gain.gain.setValueAtTime(0, ctx.currentTime);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        audioCtxRef.current = ctx;
        oscRef.current = osc;
        gainRef.current = gain;
      } catch (e) {
        console.warn("Web Audio API not supported", e);
      }
    }
  }, []);

  // Update Audio synth parameters according to physics state
  useEffect(() => {
    if (!gainRef.current || !oscRef.current || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (isAudioMuted || !isPlaying) {
      gainRef.current.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
    } else {
      // Condensate fraction calculation
      const N0_frac = tempRatio < 1.0 ? Math.max(0, 1 - Math.pow(tempRatio, 3)) : 0;
      const freq = 120 + N0_frac * 180 + (stirringSpeed / 100) * 80;
      const targetGain = 0.04 + N0_frac * 0.06;

      oscRef.current.frequency.setTargetAtTime(freq, ctx.currentTime, 0.1);
      gainRef.current.gain.setTargetAtTime(targetGain, ctx.currentTime, 0.1);
    }
  }, [tempRatio, stirringSpeed, isAudioMuted, isPlaying]);

  // Load Preset Handler
  const handlePresetSelect = (presetKey) => {
    const p = PRESETS[presetKey];
    setActivePreset(presetKey);
    setTempRatio(p.tempRatio);
    setAtomCount(p.atomCount);
    setScatteringLength(p.scatteringLength);
    setStirringSpeed(p.stirringSpeed);
    setLatticeDepth(p.latticeDepth);
    setAspectRatio(p.aspectRatio);
    bosenovaPhaseRef.current = 0;
  };

  // Re-seed particles when atom count changes
  useEffect(() => {
    const newParticles = [];
    for (let i = 0; i < atomCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.pow(Math.random(), 0.5) * 120;
      newParticles.push({
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        phase: Math.random() * Math.PI * 2,
      });
    }
    particlesRef.current = newParticles;
  }, [atomCount]);

  // Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let width = (canvas.width = canvas.parentElement.clientWidth || 800);
    let height = (canvas.height = 480);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth || 800;
      height = canvas.height = 480;
    };
    window.addEventListener("resize", handleResize);

    const render = () => {
      if (isPlaying) {
        phaseOffsetRef.current += 0.03 + stirringSpeed * 0.0005;
        if (scatteringLength < 0) {
          bosenovaPhaseRef.current += 0.05;
        } else {
          bosenovaPhaseRef.current = 0;
        }
      }

      const centerX = width / 2;
      const centerY = height / 2;
      const time = phaseOffsetRef.current;

      // Clear Canvas
      ctx.fillStyle = theme.canvasBg;
      ctx.fillRect(0, 0, width, height);

      // 1. Draw Optical Lattice (if depth > 0)
      if (latticeDepth > 0) {
        ctx.strokeStyle = theme.latticeColor;
        ctx.lineWidth = 1;
        const spacing = 32;
        const gridAlpha = Math.min(0.6, latticeDepth / 40);
        ctx.globalAlpha = gridAlpha;

        for (let x = (centerX % spacing); x < width; x += spacing) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = (centerY % spacing); y < height; y += spacing) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
        ctx.globalAlpha = 1.0;
      }

      // 2. Draw Trapping Potential & Magnetic Coils Outline
      ctx.save();
      ctx.translate(centerX, centerY);

      // Trap boundary
      const trapRadiusX = 170 * (1 / Math.sqrt(aspectRatio));
      const trapRadiusY = 170 * Math.sqrt(aspectRatio);

      ctx.beginPath();
      ctx.ellipse(0, 0, trapRadiusX, trapRadiusY, 0, 0, Math.PI * 2);
      ctx.strokeStyle = theme.secondaryGlow;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 6]);
      ctx.globalAlpha = 0.35;
      ctx.stroke();
      ctx.setLineDash([]);

      // 3. Gross-Pitaevskii Condensate Wavefunction Density Heatmap
      const N0_frac = tempRatio < 1.0 ? Math.max(0, 1 - Math.pow(tempRatio, 3)) : 0;

      if (N0_frac > 0.01) {
        let collapseScale = 1.0;
        if (scatteringLength < 0) {
          // Bosenova oscillation pulse
          collapseScale = Math.max(0.1, 1.0 - Math.abs(Math.sin(bosenovaPhaseRef.current)) * 0.75);
        }

        const radX = trapRadiusX * (0.3 + N0_frac * 0.5) * collapseScale;
        const radY = trapRadiusY * (0.3 + N0_frac * 0.5) * collapseScale;

        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(radX, radY));
        gradient.addColorStop(0, theme.primaryGlow);
        gradient.addColorStop(0.4, theme.waveColor);
        gradient.addColorStop(0.8, "rgba(59, 130, 246, 0.15)");
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(0, 0, radX, radY, 0, 0, Math.PI * 2);
        ctx.globalAlpha = N0_frac * 0.7;
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // Wavefront ripples (Bogoliubov Phonons)
        for (let r = 1; r <= 3; r++) {
          const rippleRadius = ((time * 30 * r) % Math.max(radX, radY)) * collapseScale;
          ctx.beginPath();
          ctx.ellipse(0, 0, rippleRadius, rippleRadius * (radY / radX), 0, 0, Math.PI * 2);
          ctx.strokeStyle = theme.primaryGlow;
          ctx.lineWidth = 1;
          ctx.globalAlpha = (1 - rippleRadius / Math.max(radX, radY)) * 0.4 * N0_frac;
          ctx.stroke();
        }
        ctx.globalAlpha = 1.0;
      }

      // 4. Quantized Vortex Lattices (if Stirring Speed > 0)
      if (stirringSpeed > 10 && N0_frac > 0.05) {
        const numVortices = Math.floor((stirringSpeed / 100) * 12);
        const vortexRadius = 55;
        const stirAngle = time * (stirringSpeed / 20);

        for (let i = 0; i < numVortices; i++) {
          const vAngle = stirAngle + (i * Math.PI * 2) / numVortices;
          const vx = Math.cos(vAngle) * vortexRadius;
          const vy = Math.sin(vAngle) * vortexRadius;

          // Vortex core hole
          ctx.beginPath();
          ctx.arc(vx, vy, 6, 0, Math.PI * 2);
          ctx.fillStyle = theme.canvasBg;
          ctx.fill();
          ctx.strokeStyle = theme.vortexColor;
          ctx.lineWidth = 2;
          ctx.stroke();

          // Phase circulation arrows
          ctx.beginPath();
          ctx.arc(vx, vy, 11, vAngle, vAngle + Math.PI * 1.2);
          ctx.strokeStyle = theme.vortexColor;
          ctx.lineWidth = 1.2;
          ctx.globalAlpha = 0.8;
          ctx.stroke();
          ctx.globalAlpha = 1.0;
        }
      }

      // 5. Dark Soliton Notch rendering (if preset is darkSoliton)
      if (activePreset === "darkSoliton") {
        const solitonX = Math.sin(time * 1.5) * 60;
        ctx.beginPath();
        ctx.moveTo(solitonX, -trapRadiusY * 0.7);
        ctx.lineTo(solitonX, trapRadiusY * 0.7);
        ctx.strokeStyle = theme.canvasBg;
        ctx.lineWidth = 8;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(solitonX, -trapRadiusY * 0.7);
        ctx.lineTo(solitonX, trapRadiusY * 0.7);
        ctx.strokeStyle = theme.vortexColor;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // 6. Particle Dynamics (Thermal Gas vs Condensate Coherence)
      const thermalVelFactor = tempRatio * 1.5;
      const coherenceFactor = N0_frac;

      particlesRef.current.forEach((p, idx) => {
        if (isPlaying) {
          // Thermal velocity random jitter
          p.x += p.vx * thermalVelFactor + (Math.random() - 0.5) * tempRatio;
          p.y += p.vy * thermalVelFactor + (Math.random() - 0.5) * tempRatio;

          // Quantum trap restoring force towards center
          const distSq = (p.x * p.x) / (trapRadiusX * trapRadiusX) + (p.y * p.y) / (trapRadiusY * trapRadiusY);
          if (distSq > 0.85) {
            p.vx -= (p.x / trapRadiusX) * 0.05;
            p.vy -= (p.y / trapRadiusY) * 0.05;
          }

          // Optical lattice pinning force
          if (latticeDepth > 10) {
            const spacing = 32;
            const gridX = Math.round(p.x / spacing) * spacing;
            const gridY = Math.round(p.y / spacing) * spacing;
            const pinStrength = (latticeDepth / 100) * 0.15;
            p.x += (gridX - p.x) * pinStrength;
            p.y += (gridY - p.y) * pinStrength;
          }

          // Interactive user laser beam force
          if (interactiveBeam) {
            const dx = p.x - interactiveBeam.x;
            const dy = p.y - interactiveBeam.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < 60) {
              const push = (1 - d / 60) * 3;
              p.x += (dx / (d || 1)) * push;
              p.y += (dy / (d || 1)) * push;
            }
          }
        }

        // Draw particle dot
        ctx.beginPath();
        const pSize = 1.2 + coherenceFactor * 1.5;
        ctx.arc(p.x, p.y, pSize, 0, Math.PI * 2);

        // Color blends between thermal white/blue and condensate theme glow
        if (idx % 3 === 0 && coherenceFactor > 0.5) {
          ctx.fillStyle = theme.primaryGlow;
          ctx.shadowColor = theme.primaryGlow;
          ctx.shadowBlur = 6;
        } else {
          ctx.fillStyle = theme.particleColor;
          ctx.shadowBlur = 0;
        }

        ctx.globalAlpha = Math.min(1.0, 0.4 + coherenceFactor * 0.5);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1.0;
      });

      // 7. Interactive Laser Beam Visual Feedback
      if (interactiveBeam) {
        ctx.beginPath();
        ctx.arc(interactiveBeam.x, interactiveBeam.y, 18, 0, Math.PI * 2);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.shadowColor = theme.primaryGlow;
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      ctx.restore();

      // Request next frame
      if (isPlaying) {
        animationFrameRef.current = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, tempRatio, scatteringLength, stirringSpeed, latticeDepth, aspectRatio, activePreset, theme, interactiveBeam]);

  // Canvas Mouse / Touch Handlers for Laser Poking
  const handleCanvasMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setInteractiveBeam({ x, y });
  };

  const handleCanvasMouseLeave = () => {
    setInteractiveBeam(null);
  };

  // Quantum physics analytics computed values
  const condensateFraction = tempRatio < 1.0 ? Math.max(0, 1 - Math.pow(tempRatio, 3)) * 100 : 0;
  const healingLength = (0.42 / Math.sqrt(Math.max(1, Math.abs(scatteringLength)))).toFixed(3);
  const chemicalPotential = (1.5 + (condensateFraction / 100) * 4.2 + scatteringLength * 0.05).toFixed(2);
  const systemTempnK = (tempRatio * 170).toFixed(1);
  const vortexCount = stirringSpeed > 10 ? Math.floor((stirringSpeed / 100) * 12) : 0;

  return (
    <div className={`w-full my-8 p-4 md:p-6 rounded-2xl bg-slate-950 text-slate-100 border ${theme.border} shadow-2xl transition-all duration-300`}>
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 text-xs font-mono font-bold rounded-full border ${theme.badge}`}>
              QUANTUM MATTER LAB
            </span>
            <span className="text-xs text-slate-400 font-mono">T_c = 170 nK</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-2 flex items-center gap-2">
            <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Bose-Einstein Condensate Studio
            </span>
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Simulate ultracold quantum phase transitions, Gross-Pitaevskii wavefunctions, Abrikosov vortex lattices, and Bosenova implosions.
          </p>
        </div>

        {/* Theme Selector & Control Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Theme Dropdown */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1">
            {Object.keys(THEMES).map((tKey) => (
              <button
                key={tKey}
                onClick={() => setActiveTheme(tKey)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  activeTheme === tKey ? `${THEMES[tKey].buttonBg}` : "text-slate-400 hover:text-white"
                }`}
              >
                {THEMES[tKey].name}
              </button>
            ))}
          </div>

          {/* Audio Toggle */}
          <button
            onClick={() => {
              initAudio();
              setIsAudioMuted(!isAudioMuted);
            }}
            className={`p-2.5 rounded-lg border transition-all ${
              !isAudioMuted
                ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
            }`}
            title={isAudioMuted ? "Unmute Quantum Synth" : "Mute Quantum Synth"}
          >
            {isAudioMuted ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            )}
          </button>

          {/* Play/Pause Button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all ${
              isPlaying
                ? "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                : "bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold border-emerald-500"
            }`}
          >
            {isPlaying ? "PAUSE" : "RESUME"}
          </button>
        </div>
      </div>

      {/* Presets Toolbar */}
      <div className="my-5">
        <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2">
          Quantum Physical Presets
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {Object.keys(PRESETS).map((pKey) => {
            const preset = PRESETS[pKey];
            const isSelected = activePreset === pKey;
            return (
              <button
                key={pKey}
                onClick={() => handlePresetSelect(pKey)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? `${theme.cardBg} ${theme.border} ring-1 ring-cyan-400/50`
                    : "bg-slate-900/50 border-slate-800 hover:border-slate-700 text-slate-300"
                }`}
              >
                <div className="font-bold text-xs truncate">{preset.name}</div>
                <div className={`text-[10px] font-mono mt-0.5 ${theme.accentText} truncate`}>
                  {preset.formula}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Layout: Interactive Canvas + Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visualizer Canvas Column */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/90 shadow-inner group">
            <canvas
              ref={canvasRef}
              onMouseMove={handleCanvasMouseMove}
              onMouseLeave={handleCanvasMouseLeave}
              className="w-full h-[480px] cursor-crosshair block"
            />

            {/* Live Overlay Indicators */}
            <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-800 pointer-events-none">
              <div className="text-[10px] font-mono text-slate-400">CONDENSATE FRACTION (N₀/N)</div>
              <div className={`text-xl font-extrabold font-mono ${theme.accentText}`}>
                {condensateFraction.toFixed(1)}%
              </div>
            </div>

            <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-800 text-right pointer-events-none">
              <div className="text-[10px] font-mono text-slate-400">TEMPERATURE (T/T_c)</div>
              <div className="text-xl font-extrabold font-mono text-white">
                {tempRatio.toFixed(2)} ({systemTempnK} nK)
              </div>
            </div>

            <div className="absolute bottom-4 left-4 right-4 bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-800 flex justify-between items-center text-xs text-slate-400 font-mono">
              <span>Hover canvas to excite optical laser beam</span>
              <span className={theme.accentText}>{PRESETS[activePreset]?.name}</span>
            </div>
          </div>
        </div>

        {/* Control & Analytics Side Panel Column */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Navigation Tabs */}
          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setActiveTab("controls")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === "controls" ? `${theme.buttonBg}` : "text-slate-400 hover:text-white"
              }`}
            >
              Controls
            </button>
            <button
              onClick={() => setActiveTab("telemetry")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === "telemetry" ? `${theme.buttonBg}` : "text-slate-400 hover:text-white"
              }`}
            >
              Telemetry
            </button>
            <button
              onClick={() => setActiveTab("info")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === "info" ? `${theme.buttonBg}` : "text-slate-400 hover:text-white"
              }`}
            >
              Physics Info
            </button>
          </div>

          {/* TAB 1: CONTROLS */}
          {activeTab === "controls" && (
            <div className={`p-5 rounded-2xl ${theme.cardBg} border ${theme.border} flex flex-col gap-5`}>
              {/* Temperature Slider */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-semibold text-slate-200">Temperature (T/T_c)</span>
                  <span className="font-mono text-cyan-400">{tempRatio.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="2.2"
                  step="0.01"
                  value={tempRatio}
                  onChange={(e) => {
                    setTempRatio(parseFloat(e.target.value));
                    setActivePreset("custom");
                  }}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Atom Count Slider */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-semibold text-slate-200">Particle Count (N)</span>
                  <span className="font-mono text-cyan-400">{atomCount}</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="3500"
                  step="100"
                  value={atomCount}
                  onChange={(e) => {
                    setAtomCount(parseInt(e.target.value, 10));
                    setActivePreset("custom");
                  }}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Scattering Length (Feshbach Resonance) */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-semibold text-slate-200">Scattering Length (a_s nm)</span>
                  <span className={`font-mono ${scatteringLength < 0 ? "text-rose-400" : "text-cyan-400"}`}>
                    {scatteringLength} nm
                  </span>
                </div>
                <input
                  type="range"
                  min="-45"
                  max="80"
                  step="1"
                  value={scatteringLength}
                  onChange={(e) => {
                    setScatteringLength(parseInt(e.target.value, 10));
                    setActivePreset("custom");
                  }}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Laser Stirring Frequency */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-semibold text-slate-200">Laser Stirring (Ω_stir)</span>
                  <span className="font-mono text-cyan-400">{stirringSpeed} rpm</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={stirringSpeed}
                  onChange={(e) => {
                    setStirringSpeed(parseInt(e.target.value, 10));
                    setActivePreset("custom");
                  }}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Optical Lattice Depth */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-semibold text-slate-200">Optical Lattice Potential (V_0)</span>
                  <span className="font-mono text-cyan-400">{latticeDepth} ℏω</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="1"
                  value={latticeDepth}
                  onChange={(e) => {
                    setLatticeDepth(parseInt(e.target.value, 10));
                    setActivePreset("custom");
                  }}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Trap Anisotropy Aspect Ratio */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-semibold text-slate-200">Trap Aspect Ratio (ω_y/ω_x)</span>
                  <span className="font-mono text-cyan-400">{aspectRatio.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.05"
                  value={aspectRatio}
                  onChange={(e) => {
                    setAspectRatio(parseFloat(e.target.value));
                    setActivePreset("custom");
                  }}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>
            </div>
          )}

          {/* TAB 2: TELEMETRY & METRICS */}
          {activeTab === "telemetry" && (
            <div className={`p-5 rounded-2xl ${theme.cardBg} border ${theme.border} flex flex-col gap-4`}>
              <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                Quantum Analytics
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400">HEALING LENGTH (ξ)</div>
                  <div className="text-base font-bold font-mono text-slate-100 mt-1">{healingLength} μm</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400">CHEMICAL POTENTIAL (μ)</div>
                  <div className="text-base font-bold font-mono text-slate-100 mt-1">{chemicalPotential} neV</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400">QUANTIZED VORTICES</div>
                  <div className={`text-base font-bold font-mono ${theme.accentText} mt-1`}>
                    {vortexCount} Cores
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400">PHASE REGIME</div>
                  <div className="text-xs font-bold font-mono text-emerald-400 mt-1 truncate">
                    {condensateFraction > 80 ? "Superfluid BEC" : condensateFraction > 0 ? "Quasi-Condensate" : "Thermal Gas"}
                  </div>
                </div>
              </div>

              {/* Density Profile Bar */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 mt-2">
                <div className="text-[10px] font-mono text-slate-400 mb-2">MACROSCOPIC WAVEFUNCTION COHERENCE</div>
                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${theme.buttonBg}`}
                    style={{ width: `${condensateFraction}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
                  <span>Classical Chaos</span>
                  <span>Pure Quantum Coherence</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PHYSICS INFO */}
          {activeTab === "info" && (
            <div className={`p-5 rounded-2xl ${theme.cardBg} border ${theme.border} text-xs text-slate-300 space-y-3 leading-relaxed`}>
              <h3 className="font-bold text-sm text-slate-100">Quantum Physics Principles</h3>
              <p>
                A <strong className="text-cyan-300">Bose-Einstein Condensate (BEC)</strong> is a state of matter formed when a low-density gas of bosons is cooled to temperatures close to absolute zero (nano-kelvins).
              </p>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-[11px] text-cyan-400">
                iℏ ∂Ψ/∂t = (-ℏ²/2m ∇² + V_trap + g|Ψ|²) Ψ
              </div>
              <p>
                The macroscopic wavefunction Ψ(r,t) follows the non-linear <strong>Gross-Pitaevskii Equation</strong>, where inter-atomic interaction strength g = 4πℏ²a_s/m is tunable via magnetic Feshbach resonances.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
