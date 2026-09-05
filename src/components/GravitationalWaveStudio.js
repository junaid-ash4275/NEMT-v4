import React, { useState, useEffect, useRef, useCallback } from "react";

const PRESETS = [
  {
    id: "gw150914",
    name: "GW150914 (36 M☉ + 29 M☉)",
    m1: 36,
    m2: 29,
    dist: 140,
    decayRate: 0.12,
    color1: "#3b82f6", // Blue
    color2: "#8b5cf6", // Purple
    desc: "First historical detection of binary black hole merger.",
  },
  {
    id: "gw170817",
    name: "GW170817 Kilonova (1.4 M☉ + 1.4 M☉)",
    m1: 14,
    m2: 14,
    dist: 100,
    decayRate: 0.25,
    color1: "#f59e0b", // Amber
    color2: "#ef4444", // Red
    desc: "Binary neutron star merger emitting light and gravitational waves.",
  },
  {
    id: "emri",
    name: "Extreme Mass Ratio Inspiral (100 M☉ + 10 M☉)",
    m1: 100,
    m2: 10,
    dist: 180,
    decayRate: 0.04,
    color1: "#06b6d4", // Cyan
    color2: "#10b981", // Emerald
    desc: "Stellar mass black hole spiraling into supermassive companion.",
  },
  {
    id: "supermassive",
    name: "Quasar Supermassive Pair (50 M☉ + 50 M☉)",
    m1: 50,
    m2: 50,
    dist: 160,
    decayRate: 0.08,
    color1: "#ec4899", // Pink
    color2: "#a855f7", // Purple
    desc: "Galactic core collision emitting hyper-intense strain waves.",
  },
];

const GravitationalWaveStudio = () => {
  // Physics & Simulation States
  const [selectedPreset, setSelectedPreset] = useState("gw150914");
  const [m1, setM1] = useState(36);
  const [m2, setM2] = useState(29);
  const [initialDist, setInitialDist] = useState(140);
  const [decaySpeed, setDecaySpeed] = useState(0.12);
  const [decayEnabled, setDecayEnabled] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [visMode, setVisMode] = useState("grid"); // "grid", "strain", "interferometer", "heatmap"
  const [waveSpeed, setWaveSpeed] = useState(3);
  const [gridDensity, setGridDensity] = useState(24);

  // Audio Synthesizer States
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [volume, setVolume] = useState(0.15);

  // Telemetry States for UI display
  const [telemetry, setTelemetry] = useState({
    freq: 0,
    strain: 0,
    orbitDist: 140,
    velPercent: 0,
    status: "Inspiral Phase",
  });

  // Refs for Animation & Audio
  const canvasRef = useRef(null);
  const scopeCanvasRef = useRef(null);
  const animFrameIdRef = useRef(null);

  // Sound Synth Refs
  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);
  const gainNodeRef = useRef(null);

  // Mutable Physics State (to avoid closure re-renders in RAF)
  const simStateRef = useRef({
    angle: 0,
    r: 140,
    merged: false,
    ringdownTimer: 0,
    history: [], // For oscilloscope waveform
    chirpPulse: 0,
  });

  // Audio Init & Update
  const startAudio = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }
      if (!oscRef.current) {
        const ctx = audioCtxRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(100, ctx.currentTime);
        gain.gain.setValueAtTime(volume, ctx.currentTime);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        oscRef.current = osc;
        gainNodeRef.current = gain;
      }
      setAudioEnabled(true);
    } catch (err) {
      console.warn("Audio Context error:", err);
    }
  }, [volume]);

  const stopAudio = useCallback(() => {
    if (oscRef.current) {
      try {
        oscRef.current.stop();
        oscRef.current.disconnect();
      } catch (e) {}
      oscRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state === "running") {
      audioCtxRef.current.suspend();
    }
    setAudioEnabled(false);
  }, []);

  const toggleAudio = () => {
    if (audioEnabled) {
      stopAudio();
    } else {
      startAudio();
    }
  };

  // Update volume
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(
        volume,
        audioCtxRef.current.currentTime
      );
    }
  }, [volume]);

  // Load Preset
  const applyPreset = (presetId) => {
    const p = PRESETS.find((item) => item.id === presetId);
    if (!p) return;
    setSelectedPreset(p.id);
    setM1(p.m1);
    setM2(p.m2);
    setInitialDist(p.dist);
    setDecaySpeed(p.decayRate);
    resetSimulation(p.dist);
  };

  // Reset Simulation
  const resetSimulation = (overrideDist = null) => {
    const startR = overrideDist !== null ? overrideDist : initialDist;
    simStateRef.current = {
      angle: 0,
      r: startR,
      merged: false,
      ringdownTimer: 0,
      history: [],
      chirpPulse: 0,
    };
    setTelemetry({
      freq: 0,
      strain: 0,
      orbitDist: startR,
      velPercent: 0,
      status: "Inspiral Phase",
    });
  };

  // Main Physics & Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const scopeCanvas = scopeCanvasRef.current;
    const scopeCtx = scopeCanvas ? scopeCanvas.getContext("2d") : null;

    let lastTime = performance.now();

    const render = (time) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      const state = simStateRef.current;
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;

      // Total Mass & Reduced Mass
      const M = m1 + m2;
      const mu = (m1 * m2) / M;

      // Kepler's 3rd Law approximation for orbital speed: omega = sqrt(G*M / r^3)
      const G = 1500;
      const currentR = Math.max(state.r, 12);
      const omega = Math.sqrt((G * M) / Math.pow(currentR, 3));

      if (isPlaying && !state.merged) {
        state.angle += omega * dt * waveSpeed * 10;

        if (decayEnabled) {
          // Quadrupole formula orbital decay: dr/dt ~ -64/5 * G^3 * m1*m2*M / (c^5 * r^3)
          const decay = (decaySpeed * 40 * (m1 * m2)) / Math.pow(currentR, 2.2);
          state.r = Math.max(10, state.r - decay * dt * waveSpeed);

          if (state.r <= 18) {
            state.merged = true;
            state.ringdownTimer = 1.2; // 1.2s of ringdown
            state.chirpPulse = 1.0;
          }
        }
      } else if (isPlaying && state.merged) {
        if (state.ringdownTimer > 0) {
          state.ringdownTimer -= dt;
        }
      }

      // Orbital frequency & Velocity (% of light speed)
      const freqHz = (omega / (2 * Math.PI)) * 15;
      const velocityC = Math.min(
        99.9,
        (Math.sqrt((G * M) / currentR) / 15) * 100
      );

      // Strain amplitude h ~ (G^2 * m1 * m2 / (r * c^4))
      let strainAmp = (m1 * m2 * 0.5) / currentR;
      if (state.merged) {
        strainAmp *= Math.max(0, state.ringdownTimer / 1.2);
      }

      const rawSignal = state.merged
        ? Math.sin(state.angle * 2.5) *
          strainAmp *
          Math.exp(-(1.2 - state.ringdownTimer) * 4)
        : Math.sin(state.angle * 2) * strainAmp;

      // Update history for oscilloscope graph
      state.history.push(rawSignal);
      if (state.history.length > 200) {
        state.history.shift();
      }

      // Audio Frequency Update
      if (audioEnabled && oscRef.current && audioCtxRef.current) {
        try {
          const targetFreq = state.merged
            ? 800 * Math.max(0.1, state.ringdownTimer)
            : Math.min(1800, Math.max(40, freqHz * 12 + 60));
          oscRef.current.frequency.setTargetAtTime(
            targetFreq,
            audioCtxRef.current.currentTime,
            0.03
          );
        } catch (e) {}
      }

      // Update UI Telemetry periodically
      if (Math.random() < 0.2) {
        setTelemetry({
          freq: freqHz.toFixed(1),
          strain: (strainAmp * 1e-21).toExponential(2),
          orbitDist: Math.round(state.r),
          velPercent: velocityC.toFixed(1),
          status: state.merged
            ? state.ringdownTimer > 0
              ? "Ringdown Oscillation"
              : "Coalesced Single Black Hole"
            : "Inspiral Phase",
        });
      }

      // --- CLEAR MAIN CANVAS ---
      ctx.fillStyle = "#030712";
      ctx.fillRect(0, 0, width, height);

      // --- RENDER VISUALIZATION MODES ---

      if (visMode === "grid") {
        // Deformable Spacetime Mesh
        ctx.lineWidth = 1;
        const step = gridDensity;
        const cols = Math.ceil(width / step);
        const rows = Math.ceil(height / step);

        // Body positions
        const r1 = (m2 / M) * currentR;
        const r2 = (m1 / M) * currentR;

        const x1 = cx + Math.cos(state.angle) * r1;
        const y1 = cy + Math.sin(state.angle) * r1;
        const x2 = cx - Math.cos(state.angle) * r2;
        const y2 = cy - Math.sin(state.angle) * r2;

        ctx.strokeStyle = "rgba(14, 165, 233, 0.25)";
        ctx.beginPath();

        for (let i = 0; i <= cols; i++) {
          for (let j = 0; j <= rows; j++) {
            const gx = i * step;
            const gy = j * step;

            // Distance to bodies
            const d1 = Math.hypot(gx - x1, gy - y1) + 1;
            const d2 = Math.hypot(gx - x2, gy - y2) + 1;

            // Gravitational distortion
            const warp1 = (m1 * 350) / (d1 + 30);
            const warp2 = (m2 * 350) / (d2 + 30);

            // Gravitational Wave Quadrupole phase strain
            const distCenter = Math.hypot(gx - cx, gy - cy);
            const wavePhase = distCenter * 0.08 - state.angle * 2;
            const waveDeform =
              Math.sin(wavePhase) *
              strainAmp *
              (200 / (distCenter + 80)) *
              Math.cos(2 * Math.atan2(gy - cy, gx - cx));

            const dx =
              ((x1 - gx) / d1) * warp1 +
              ((x2 - gx) / d2) * warp2 +
              waveDeform * 4;
            const dy =
              ((y1 - gy) / d1) * warp1 +
              ((y2 - gy) / d2) * warp2 +
              waveDeform * 4;

            const px = gx + dx;
            const py = gy + dy;

            if (i > 0) {
              const prevGx = (i - 1) * step;
              const prevD1 = Math.hypot(prevGx - x1, gy - y1) + 1;
              const prevD2 = Math.hypot(prevGx - x2, gy - y2) + 1;
              const prevW1 = (m1 * 350) / (prevD1 + 30);
              const prevW2 = (m2 * 350) / (prevD2 + 30);
              const prevPx =
                prevGx + ((x1 - prevGx) / prevD1) * prevW1 + ((x2 - prevGx) / prevD2) * prevW2;
              const prevPy =
                gy + ((y1 - gy) / prevD1) * prevW1 + ((y2 - gy) / prevD2) * prevW2;

              ctx.moveTo(prevPx, prevPy);
              ctx.lineTo(px, py);
            }
          }
        }
        ctx.stroke();
      } else if (visMode === "strain") {
        // Gravitational Wave Field Ripples (Spiral quadwave)
        const numRings = 40;
        for (let r = 10; r < Math.max(width, height); r += 15) {
          ctx.beginPath();
          const phase = r * 0.06 - state.angle * 2;
          const val = Math.sin(phase);
          const alpha = Math.max(0, 0.8 - r / (width * 0.7));

          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          if (val > 0) {
            ctx.strokeStyle = `rgba(59, 130, 246, ${val * alpha})`;
          } else {
            ctx.strokeStyle = `rgba(236, 72, 153, ${-val * alpha})`;
          }
          ctx.lineWidth = 2 + Math.abs(val) * 3;
          ctx.stroke();
        }
      } else if (visMode === "interferometer") {
        // Laser Beam Arms (L-shaped LIGO Detector overlay)
        ctx.lineWidth = 3;

        // X Arm
        const armLength = 220;
        const armX = cx + armLength;
        const armY = cy;

        // Laser beam gradient
        const gradX = ctx.createLinearGradient(cx, cy, armX, cy);
        gradX.addColorStop(0, "rgba(239, 68, 68, 0.9)");
        gradX.addColorStop(1, "rgba(239, 68, 68, 0.2)");

        ctx.strokeStyle = gradX;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(armX, cy);
        ctx.stroke();

        // Y Arm
        const armYEnd = cy - armLength;
        const gradY = ctx.createLinearGradient(cx, cy, cx, armYEnd);
        gradY.addColorStop(0, "rgba(239, 68, 68, 0.9)");
        gradY.addColorStop(1, "rgba(239, 68, 68, 0.2)");

        ctx.strokeStyle = gradY;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx, armYEnd);
        ctx.stroke();

        // End Mirrors
        ctx.fillStyle = "#38bdf8";
        ctx.fillRect(armX - 4, cy - 15, 8, 30);
        ctx.fillRect(cx - 15, armYEnd - 4, 30, 8);

        // Beam Splitter
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        ctx.beginPath();
        ctx.arc(cx, cy, 8, 0, Math.PI * 2);
        ctx.fill();

        // Phase displacement indicator
        ctx.fillStyle = "#ef4444";
        ctx.font = "12px monospace";
        ctx.fillText(
          `Laser Arm ΔL: ${(rawSignal * 1e-18).toFixed(3)} fm`,
          armX - 100,
          cy + 30
        );
      }

      // --- RENDER ORBITING COMPACT OBJECTS ---
      const r1 = (m2 / M) * currentR;
      const r2 = (m1 / M) * currentR;

      const x1 = cx + Math.cos(state.angle) * r1;
      const y1 = cy + Math.sin(state.angle) * r1;
      const x2 = cx - Math.cos(state.angle) * r2;
      const y2 = cy - Math.sin(state.angle) * r2;

      if (!state.merged) {
        // Object 1
        const rad1 = Math.max(8, Math.sqrt(m1) * 2.2);
        const g1 = ctx.createRadialGradient(x1, y1, 2, x1, y1, rad1 * 2);
        g1.addColorStop(0, "#ffffff");
        g1.addColorStop(0.3, "#3b82f6");
        g1.addColorStop(1, "transparent");

        ctx.fillStyle = g1;
        ctx.beginPath();
        ctx.arc(x1, y1, rad1 * 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.arc(x1, y1, rad1, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#60a5fa";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Object 2
        const rad2 = Math.max(8, Math.sqrt(m2) * 2.2);
        const g2 = ctx.createRadialGradient(x2, y2, 2, x2, y2, rad2 * 2);
        g2.addColorStop(0, "#ffffff");
        g2.addColorStop(0.3, "#a855f7");
        g2.addColorStop(1, "transparent");

        ctx.fillStyle = g2;
        ctx.beginPath();
        ctx.arc(x2, y2, rad2 * 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.arc(x2, y2, rad2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#c084fc";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Orbit trail
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, r1, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        // Merged Singularity Flash & Ringdown
        const mergedRad = Math.sqrt(M) * 3;
        const ringPulse = Math.sin(time * 0.02) * 5;

        const gMerged = ctx.createRadialGradient(
          cx,
          cy,
          2,
          cx,
          cy,
          mergedRad * 3 + ringPulse
        );
        gMerged.addColorStop(0, "#ffffff");
        gMerged.addColorStop(0.2, "#f43f5e");
        gMerged.addColorStop(0.6, "#8b5cf6");
        gMerged.addColorStop(1, "transparent");

        ctx.fillStyle = gMerged;
        ctx.beginPath();
        ctx.arc(cx, cy, mergedRad * 3 + ringPulse, 0, Math.PI * 2);
        ctx.fill();

        // Event Horizon
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.arc(cx, cy, mergedRad, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#f43f5e";
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // --- RENDER SCOPE CANVAS (Gravitational Wave Strain h(t)) ---
      if (scopeCtx && scopeCanvas) {
        const sW = scopeCanvas.width;
        const sH = scopeCanvas.height;

        scopeCtx.fillStyle = "#090d16";
        scopeCtx.fillRect(0, 0, sW, sH);

        // Center line
        scopeCtx.strokeStyle = "rgba(255, 255, 255, 0.1)";
        scopeCtx.lineWidth = 1;
        scopeCtx.beginPath();
        scopeCtx.moveTo(0, sH / 2);
        scopeCtx.lineTo(sW, sH / 2);
        scopeCtx.stroke();

        // Strain Curve
        scopeCtx.strokeStyle = state.merged ? "#f43f5e" : "#38bdf8";
        scopeCtx.lineWidth = 2;
        scopeCtx.beginPath();

        const stepX = sW / 200;
        state.history.forEach((val, idx) => {
          const x = idx * stepX;
          const y = sH / 2 - val * (sH * 0.4);
          if (idx === 0) scopeCtx.moveTo(x, y);
          else scopeCtx.lineTo(x, y);
        });
        scopeCtx.stroke();
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [
    m1,
    m2,
    decaySpeed,
    decayEnabled,
    isPlaying,
    visMode,
    waveSpeed,
    gridDensity,
    audioEnabled,
  ]);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 my-8 font-sans bg-slate-950 text-slate-100 rounded-3xl border border-cyan-500/30 shadow-2xl shadow-cyan-950/40 backdrop-blur-xl">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 text-xs font-semibold tracking-wider text-cyan-400 bg-cyan-950/60 border border-cyan-500/40 rounded-full uppercase">
              Astrophysics & Relativity Lab
            </span>
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 mt-2">
            Gravitational Wave Studio
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Simulate binary compact object inspirals, spacetime curvature grid deformations, and real-time audio chirp strain signals.
          </p>
        </div>

        {/* Telemetry Quick Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-900/80 p-3 rounded-2xl border border-slate-800 text-xs">
          <div className="px-2">
            <span className="text-slate-500 block">Frequency</span>
            <span className="font-mono text-cyan-300 text-sm font-bold">
              {telemetry.freq} Hz
            </span>
          </div>
          <div className="px-2">
            <span className="text-slate-500 block">Strain (h)</span>
            <span className="font-mono text-sky-300 text-sm font-bold">
              {telemetry.strain}
            </span>
          </div>
          <div className="px-2">
            <span className="text-slate-500 block">Orbit Velocity</span>
            <span className="font-mono text-indigo-300 text-sm font-bold">
              {telemetry.velPercent}% c
            </span>
          </div>
          <div className="px-2">
            <span className="text-slate-500 block">Status</span>
            <span className="font-mono text-emerald-400 text-xs font-bold truncate block">
              {telemetry.status}
            </span>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Interactive Control Panel */}
        <div className="lg:col-span-4 flex flex-col gap-5 bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80">
          {/* Preset Selection */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Astrophysical Presets
            </label>
            <div className="grid grid-cols-1 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => applyPreset(p.id)}
                  className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                    selectedPreset === p.id
                      ? "bg-cyan-950/80 border-cyan-500 text-cyan-200 shadow-md shadow-cyan-950"
                      : "bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  <div className="font-semibold text-slate-200">{p.name}</div>
                  <div className="text-[11px] opacity-75 mt-0.5">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Mass Sliders */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-blue-400">Mass 1 (M☉): {m1}</span>
                <span className="text-slate-500">Compact Body A</span>
              </div>
              <input
                type="range"
                min="2"
                max="100"
                value={m1}
                onChange={(e) => setM1(Number(e.target.value))}
                className="w-full accent-blue-500 bg-slate-800 rounded-lg h-1.5 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-purple-400">Mass 2 (M☉): {m2}</span>
                <span className="text-slate-500">Compact Body B</span>
              </div>
              <input
                type="range"
                min="2"
                max="100"
                value={m2}
                onChange={(e) => setM2(Number(e.target.value))}
                className="w-full accent-purple-500 bg-slate-800 rounded-lg h-1.5 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-cyan-400">Inspiral Decay Rate</span>
                <span className="font-mono text-slate-400">{decaySpeed}</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="0.4"
                step="0.01"
                value={decaySpeed}
                onChange={(e) => setDecaySpeed(Number(e.target.value))}
                className="w-full accent-cyan-500 bg-slate-800 rounded-lg h-1.5 cursor-pointer"
              />
            </div>
          </div>

          {/* Visualization Modes */}
          <div className="pt-2 border-t border-slate-800">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Visualization Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "grid", label: "Spacetime Grid" },
                { id: "strain", label: "Strain Waves" },
                { id: "interferometer", label: "LIGO Laser" },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setVisMode(m.id)}
                  className={`py-2 px-2 rounded-xl border text-xs font-medium transition-all ${
                    visMode === m.id
                      ? "bg-gradient-to-r from-cyan-600 to-blue-600 border-cyan-400 text-white shadow-md shadow-cyan-900/50"
                      : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Audio Synthesizer Controls */}
          <div className="p-3 bg-cyan-950/30 rounded-2xl border border-cyan-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                Web Audio Chirp Synth
              </span>
              <button
                onClick={toggleAudio}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  audioEnabled
                    ? "bg-red-500/20 text-red-300 border border-red-500/50 hover:bg-red-500/30"
                    : "bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-md shadow-cyan-500/20"
                }`}
              >
                {audioEnabled ? "Stop Chirp Audio" : "Enable Chirp Audio"}
              </button>
            </div>
            {audioEnabled && (
              <div>
                <div className="flex justify-between text-[11px] text-cyan-400 font-mono mb-1">
                  <span>Audio Volume</span>
                  <span>{Math.round(volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.02"
                  max="0.4"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-full accent-cyan-400 bg-slate-800 rounded-lg h-1.5 cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Playback Actions */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold rounded-xl text-xs transition-all border border-slate-700"
            >
              {isPlaying ? "Pause Orbit" : "Resume Orbit"}
            </button>
            <button
              onClick={() => resetSimulation()}
              className="py-2.5 px-4 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 font-bold rounded-xl text-xs transition-all border border-cyan-800"
            >
              Reset Orbit
            </button>
          </div>
        </div>

        {/* Right Canvases & Waveform Display */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Main Interactive 2D Canvas */}
          <div className="relative w-full h-[420px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={720}
              height={420}
              className="w-full h-full object-contain cursor-crosshair"
            />
            {/* Overlay Grid Tag */}
            <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-slate-800 text-[11px] font-mono text-cyan-400">
              Interactive Field Canvas [2D Quadrupole Strain]
            </div>
          </div>

          {/* Real-time Oscilloscope Waveform Scope */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Live Gravitational Strain Signal h(t) [Chirp Oscilloscope]
              </span>
              <span className="text-[11px] font-mono text-cyan-400">
                10⁻²¹ strain scale
              </span>
            </div>
            <div className="w-full h-24 bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
              <canvas
                ref={scopeCanvasRef}
                width={700}
                height={96}
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GravitationalWaveStudio;
