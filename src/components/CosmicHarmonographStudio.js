import React, { useState, useEffect, useRef, useCallback } from "react";

// Themes for visual styling
const THEMES = {
  cyber: {
    id: "cyber",
    name: "Cyber Neon",
    bgGradient: "from-slate-950 via-purple-950 to-slate-900",
    canvasBg: "#05030a",
    primary: "#00f3ff",
    secondary: "#ff007f",
    accentText: "text-cyan-400",
    accentBorder: "border-cyan-500/40",
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    buttonActive: "bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/30",
    colors: ["#00f3ff", "#38bdf8", "#818cf8", "#c084fc", "#ff007f"],
    glow: "rgba(0, 243, 255, 0.6)",
  },
  cosmos: {
    id: "cosmos",
    name: "Deep Cosmos",
    bgGradient: "from-indigo-950 via-slate-950 to-purple-950",
    canvasBg: "#03040c",
    primary: "#a855f7",
    secondary: "#ec4899",
    accentText: "text-purple-300",
    accentBorder: "border-purple-500/40",
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    buttonActive: "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30",
    colors: ["#a855f7", "#c084fc", "#e879f9", "#38bdf8", "#ec4899"],
    glow: "rgba(168, 85, 247, 0.6)",
  },
  aurora: {
    id: "aurora",
    name: "Emerald Aurora",
    bgGradient: "from-emerald-950 via-slate-950 to-teal-950",
    canvasBg: "#020a07",
    primary: "#10b981",
    secondary: "#06b6d4",
    accentText: "text-emerald-400",
    accentBorder: "border-emerald-500/40",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    buttonActive: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30",
    colors: ["#10b981", "#34d399", "#22d3ee", "#06b6d4", "#a7f3d0"],
    glow: "rgba(16, 185, 129, 0.6)",
  },
  solar: {
    id: "solar",
    name: "Solar Gold",
    bgGradient: "from-amber-950 via-slate-950 to-orange-950",
    canvasBg: "#0c0602",
    primary: "#fbbf24",
    secondary: "#f97316",
    accentText: "text-amber-400",
    accentBorder: "border-amber-500/40",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    buttonActive: "bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-600/30",
    colors: ["#fbbf24", "#f59e0b", "#f97316", "#ef4444", "#fef08a"],
    glow: "rgba(251, 191, 36, 0.6)",
  },
  prism: {
    id: "prism",
    name: "Prismatic Rainbow",
    bgGradient: "from-slate-950 via-pink-950 to-indigo-950",
    canvasBg: "#07030a",
    primary: "#f43f5e",
    secondary: "#06b6d4",
    accentText: "text-pink-300",
    accentBorder: "border-pink-500/40",
    badge: "bg-pink-500/20 text-pink-300 border-pink-500/40",
    buttonActive: "bg-pink-600 hover:bg-pink-500 text-white shadow-lg shadow-pink-600/30",
    colors: ["#ff0055", "#ffaa00", "#33ff00", "#00eeff", "#9900ff"],
    glow: "rgba(244, 63, 94, 0.6)",
  },
};

// Preset Harmonograph Configurations
const PRESETS = {
  gothicRose: {
    name: "Gothic Rose Window",
    desc: "Harmonic 3:2 frequency ratio with gentle dampening",
    f1: 3, f2: 2, f3: 3, f4: 2,
    p1: 0, p2: 90, p3: 45, p4: 0,
    d1: 0.0003, d2: 0.0003, d3: 0.0003, d4: 0.0003,
    theme: "cyber",
    rotSpeed: 0.002,
  },
  lissajousInfinity: {
    name: "Lissajous Infinity Loop",
    desc: "1:2 resonance pattern with zero energy loss",
    f1: 1, f2: 0, f3: 2, f4: 0,
    p1: 0, p2: 0, p3: 90, p4: 0,
    d1: 0.00005, d2: 0.00005, d3: 0.00005, d4: 0.00005,
    theme: "prism",
    rotSpeed: 0.001,
  },
  tripleOrbit: {
    name: "Triple Orbit Cascade",
    desc: "3:4:5 orbital resonance creating intricate web patterns",
    f1: 3, f2: 4, f3: 5, f4: 2,
    p1: 0, p2: 60, p3: 120, p4: 180,
    d1: 0.0004, d2: 0.0004, d3: 0.0004, d4: 0.0004,
    theme: "cosmos",
    rotSpeed: 0.003,
  },
  goldenRatio: {
    name: "Golden Ratio Spiral",
    desc: "Non-repeating Phi (1.618) frequency proportion",
    f1: 1.618, f2: 1, f3: 1.618, f4: 1,
    p1: 0, p2: 45, p3: 90, p4: 135,
    d1: 0.00025, d2: 0.00025, d3: 0.00025, d4: 0.00025,
    theme: "solar",
    rotSpeed: 0.002,
  },
  hyperbolicEclipse: {
    name: "Hyperbolic Eclipse",
    desc: "7:8 near-unison beat frequencies creating floral waves",
    f1: 7, f2: 8, f3: 7, f4: 8,
    p1: 0, p2: 30, p3: 60, p4: 90,
    d1: 0.0005, d2: 0.0005, d3: 0.0005, d4: 0.0005,
    theme: "aurora",
    rotSpeed: 0.004,
  },
};

const CosmicHarmonographStudio = () => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const audioCtxRef = useRef(null);
  const oscNodesRef = useRef([]);
  const gainNodeRef = useRef(null);
  const filterNodeRef = useRef(null);

  // Harmonograph Parameters
  const [f1, setF1] = useState(PRESETS.gothicRose.f1);
  const [f2, setF2] = useState(PRESETS.gothicRose.f2);
  const [f3, setF3] = useState(PRESETS.gothicRose.f3);
  const [f4, setF4] = useState(PRESETS.gothicRose.f4);

  const [p1, setP1] = useState(PRESETS.gothicRose.p1);
  const [p2, setP2] = useState(PRESETS.gothicRose.p2);
  const [p3, setP3] = useState(PRESETS.gothicRose.p3);
  const [p4, setP4] = useState(PRESETS.gothicRose.p4);

  const [damping, setDamping] = useState(0.0003);
  const [drawSpeed, setDrawSpeed] = useState(4);
  const [lineWidth, setLineWidth] = useState(1.5);
  const [rotationSpeed, setRotationSpeed] = useState(0.002);
  const [themeKey, setThemeKey] = useState("cyber");
  const [isPlaying, setIsPlaying] = useState(true);
  const [is3D, setIs3D] = useState(true);
  const [showSparks, setShowSparks] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [masterVolume, setMasterVolume] = useState(0.3);

  // Telemetry state
  const [pointsDrawn, setPointsDrawn] = useState(0);
  const [currentEnergy, setCurrentEnergy] = useState(100);

  const currentTheme = THEMES[themeKey] || THEMES.cyber;

  // Mutable animation state in ref to avoid lag
  const stateRef = useRef({
    t: 0,
    rotAngle: 0,
    points: [],
    sparks: [],
    mouse: { x: 0, y: 0, isDragging: false },
    energy: 1.0,
  });

  // Initialize Web Audio API Synth
  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(masterVolume, ctx.currentTime);

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1200, ctx.currentTime);

      masterGain.connect(filter);
      filter.connect(ctx.destination);

      audioCtxRef.current = ctx;
      gainNodeRef.current = masterGain;
      filterNodeRef.current = filter;
    } catch (e) {
      console.warn("Web Audio API not supported:", e);
    }
  }, [masterVolume]);

  // Update Audio Oscillators based on Harmonograph Frequencies
  useEffect(() => {
    if (!audioEnabled || !audioCtxRef.current) {
      // Stop existing oscillators if disabled
      oscNodesRef.current.forEach((node) => {
        try {
          node.stop();
          node.disconnect();
        } catch (e) {}
      });
      oscNodesRef.current = [];
      return;
    }

    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    // Stop old oscillators
    oscNodesRef.current.forEach((node) => {
      try {
        node.stop();
        node.disconnect();
      } catch (e) {}
    });
    oscNodesRef.current = [];

    // Base musical pitch: A2 (110 Hz)
    const baseFreq = 110;
    const freqs = [f1, f2, f3, f4].filter((f) => f > 0);

    const newOscs = freqs.map((freqMult) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.type = "sine";
      const targetHz = Math.min(baseFreq * freqMult, 1200);
      osc.frequency.setValueAtTime(targetHz, ctx.currentTime);

      oscGain.gain.setValueAtTime(0.2 / freqs.length, ctx.currentTime);

      osc.connect(oscGain);
      oscGain.connect(gainNodeRef.current);
      osc.start();
      return osc;
    });

    oscNodesRef.current = newOscs;
  }, [audioEnabled, f1, f2, f3, f4]);

  // Master Volume update
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(
        masterVolume,
        audioCtxRef.current.currentTime,
        0.05
      );
    }
  }, [masterVolume]);

  // Reset/Clear Drawing
  const clearCanvas = useCallback(() => {
    stateRef.current.t = 0;
    stateRef.current.rotAngle = 0;
    stateRef.current.points = [];
    stateRef.current.sparks = [];
    stateRef.current.energy = 1.0;
    setPointsDrawn(0);
    setCurrentEnergy(100);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = currentTheme.canvasBg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [currentTheme.canvasBg]);

  // Apply Preset Configuration
  const applyPreset = (presetKey) => {
    const p = PRESETS[presetKey];
    if (!p) return;
    setF1(p.f1); setF2(p.f2); setF3(p.f3); setF4(p.f4);
    setP1(p.p1); setP2(p.p2); setP3(p.p3); setP4(p.p4);
    setDamping(p.d1);
    setRotationSpeed(p.rotSpeed);
    if (p.theme) setThemeKey(p.theme);
    clearCanvas();
  };

  // Randomize Harmonograph Parameters
  const randomize = () => {
    const randF = () => Math.round((Math.random() * 7 + 1) * 2) / 2;
    const randP = () => Math.floor(Math.random() * 8) * 45;
    setF1(randF()); setF2(randF()); setF3(randF()); setF4(randF());
    setP1(randP()); setP2(randP()); setP3(randP()); setP4(randP());
    setDamping(Math.random() * 0.0006 + 0.0001);
    clearCanvas();
  };

  // Instant Redraw Complete Curve
  const instantRedraw = () => {
    clearCanvas();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const baseAmp = Math.min(width, height) * 0.38;

    const rad1 = (p1 * Math.PI) / 180;
    const rad2 = (p2 * Math.PI) / 180;
    const rad3 = (p3 * Math.PI) / 180;
    const rad4 = (p4 * Math.PI) / 180;

    const totalSteps = 2500;
    const dt = 0.03;
    let t = 0;

    ctx.fillStyle = currentTheme.canvasBg;
    ctx.fillRect(0, 0, width, height);

    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    let lastX = null;
    let lastY = null;

    for (let i = 0; i < totalSteps; i++) {
      t += dt;
      const decay = Math.exp(-damping * t * 10);
      const amp = baseAmp * decay;

      const xRaw = Math.sin(f1 * t + rad1) + Math.sin(f2 * t + rad2);
      const yRaw = Math.sin(f3 * t + rad3) + Math.sin(f4 * t + rad4);
      const zRaw = Math.cos(f1 * t + rad1) - Math.cos(f3 * t + rad3);

      let px, py;
      if (is3D) {
        const rot = rotationSpeed * i * 0.5;
        const x3d = xRaw * Math.cos(rot) - zRaw * Math.sin(rot);
        const z3d = xRaw * Math.sin(rot) + zRaw * Math.cos(rot);
        const scale = 1 / (1 + z3d * 0.25);
        px = cx + (x3d * amp * 0.45) * scale;
        py = cy + (yRaw * amp * 0.45) * scale;
      } else {
        px = cx + (xRaw * amp * 0.45);
        py = cy + (yRaw * amp * 0.45);
      }

      if (lastX !== null) {
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(px, py);
        const colorIdx = Math.floor((i / totalSteps) * currentTheme.colors.length) % currentTheme.colors.length;
        ctx.strokeStyle = currentTheme.colors[colorIdx];
        ctx.globalAlpha = Math.max(0.15, decay);
        ctx.stroke();
      }

      lastX = px;
      lastY = py;
    }

    ctx.globalAlpha = 1.0;
    setPointsDrawn(totalSteps);
    setCurrentEnergy(Math.round(Math.exp(-damping * totalSteps * dt * 10) * 100));
  };

  // Download Snapshot PNG
  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `cosmic-harmonograph-${themeKey}-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight || 520;
        clearCanvas();
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const rad1 = (p1 * Math.PI) / 180;
    const rad2 = (p2 * Math.PI) / 180;
    const rad3 = (p3 * Math.PI) / 180;
    const rad4 = (p4 * Math.PI) / 180;

    let animId;

    const render = () => {
      if (isPlaying) {
        const width = canvas.width;
        const height = canvas.height;
        const cx = width / 2;
        const cy = height / 2;
        const baseAmp = Math.min(width, height) * 0.38;

        // Soft canvas fade for glowing trail dynamics
        ctx.fillStyle = currentTheme.canvasBg;
        ctx.globalAlpha = 0.04;
        ctx.fillRect(0, 0, width, height);
        ctx.globalAlpha = 1.0;

        // Step physics multiple sub-frame steps based on drawSpeed
        const subSteps = drawSpeed;
        const dt = 0.015;

        for (let s = 0; s < subSteps; s++) {
          stateRef.current.t += dt;
          stateRef.current.rotAngle += rotationSpeed;

          const t = stateRef.current.t;
          const decay = Math.exp(-damping * t * 10);
          stateRef.current.energy = decay;
          const amp = baseAmp * decay;

          const xRaw = Math.sin(f1 * t + rad1) + Math.sin(f2 * t + rad2);
          const yRaw = Math.sin(f3 * t + rad3) + Math.sin(f4 * t + rad4);
          const zRaw = Math.cos(f1 * t + rad1) - Math.cos(f3 * t + rad3);

          let px, py;
          if (is3D) {
            const rot = stateRef.current.rotAngle;
            const x3d = xRaw * Math.cos(rot) - zRaw * Math.sin(rot);
            const z3d = xRaw * Math.sin(rot) + zRaw * Math.cos(rot);
            const scale = 1 / (1 + z3d * 0.25);
            px = cx + (x3d * amp * 0.45) * scale;
            py = cy + (yRaw * amp * 0.45) * scale;
          } else {
            px = cx + (xRaw * amp * 0.45);
            py = cy + (yRaw * amp * 0.45);
          }

          // Mouse perturbation impulse
          if (stateRef.current.mouse.isDragging) {
            px = px * 0.8 + stateRef.current.mouse.x * 0.2;
            py = py * 0.8 + stateRef.current.mouse.y * 0.2;
          }

          const points = stateRef.current.points;
          if (points.length > 0) {
            const prev = points[points.length - 1];
            ctx.beginPath();
            ctx.moveTo(prev.x, prev.y);
            ctx.lineTo(px, py);

            const colorIdx = Math.floor((t * 2) % currentTheme.colors.length);
            ctx.strokeStyle = currentTheme.colors[colorIdx];
            ctx.lineWidth = lineWidth;
            ctx.shadowColor = currentTheme.glow;
            ctx.shadowBlur = 8;
            ctx.stroke();
            ctx.shadowBlur = 0;
          }

          points.push({ x: px, y: py });
          if (points.length > 3000) points.shift();

          // Spark particle emitter at pen tip
          if (showSparks && Math.random() < 0.3) {
            stateRef.current.sparks.push({
              x: px,
              y: py,
              vx: (Math.random() - 0.5) * 2.5,
              vy: (Math.random() - 0.5) * 2.5,
              life: 1.0,
              color: currentTheme.colors[Math.floor(Math.random() * currentTheme.colors.length)],
            });
          }
        }

        // Render spark particles
        if (showSparks && stateRef.current.sparks.length > 0) {
          stateRef.current.sparks.forEach((sp, idx) => {
            sp.x += sp.vx;
            sp.y += sp.vy;
            sp.life -= 0.04;

            if (sp.life > 0) {
              ctx.fillStyle = sp.color;
              ctx.globalAlpha = sp.life;
              ctx.beginPath();
              ctx.arc(sp.x, sp.y, Math.random() * 2 + 1, 0, Math.PI * 2);
              ctx.fill();
              ctx.globalAlpha = 1.0;
            }
          });
          stateRef.current.sparks = stateRef.current.sparks.filter((sp) => sp.life > 0);
        }

        // Periodically update React state telemetry
        if (Math.random() < 0.1) {
          setPointsDrawn(stateRef.current.points.length);
          setCurrentEnergy(Math.max(0, Math.round(stateRef.current.energy * 100)));
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [
    isPlaying, f1, f2, f3, f4, p1, p2, p3, p4,
    damping, drawSpeed, lineWidth, rotationSpeed,
    currentTheme, is3D, showSparks, clearCanvas
  ]);

  // Handle Mouse Interactive Drag
  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    stateRef.current.mouse.x = e.clientX - rect.left;
    stateRef.current.mouse.y = e.clientY - rect.top;
    stateRef.current.mouse.isDragging = true;
  };

  const handleMouseMove = (e) => {
    if (!stateRef.current.mouse.isDragging) return;
    const rect = canvasRef.current.getBoundingClientRect();
    stateRef.current.mouse.x = e.clientX - rect.left;
    stateRef.current.mouse.y = e.clientY - rect.top;
  };

  const handleMouseUp = () => {
    stateRef.current.mouse.isDragging = false;
  };

  // Toggle Audio Synth with gesture initialization
  const toggleAudio = () => {
    if (!audioCtxRef.current) {
      initAudio();
    }
    setAudioEnabled((prev) => !prev);
  };

  return (
    <div className={`flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-br ${currentTheme.bgGradient} rounded-3xl m-3 sm:m-6 shadow-2xl border border-white/10 text-white transition-all duration-500`}>
      {/* Header */}
      <div className="w-full max-w-6xl flex flex-col md:flex-row justify-between items-center mb-6 gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-indigo-300">
              Cosmic Harmonograph Studio
            </h2>
            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${currentTheme.badge}`}>
              Harmonic Resonance Lab
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Simulate 4-pendulum Lissajous resonance dynamics with real-time 3D rotation & Web Audio synthesis
          </p>
        </div>

        {/* Telemetry Stats */}
        <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-xs">
          <div className="text-center px-2">
            <span className="text-slate-400 block">Drawn Points</span>
            <span className="font-bold text-cyan-400 text-sm">{pointsDrawn}</span>
          </div>
          <div className="w-px h-8 bg-slate-700" />
          <div className="text-center px-2">
            <span className="text-slate-400 block">Energy</span>
            <span className="font-bold text-emerald-400 text-sm">{currentEnergy}%</span>
          </div>
          <div className="w-px h-8 bg-slate-700" />
          <div className="text-center px-2">
            <span className="text-slate-400 block">Harmonic Ratio</span>
            <span className="font-bold text-purple-400 text-sm">{f1}:{f2}:{f3}:{f4}</span>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Canvas Display */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="relative w-full h-[450px] sm:h-[520px] bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border border-white/10 group cursor-crosshair">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="w-full h-full block"
            />

            {/* Interactive Canvas Overlay Hint */}
            <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs text-slate-300 pointer-events-none flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Click & Drag to perturb pendulums</span>
            </div>

            {/* Canvas Quick Controls */}
            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 bg-slate-900/90 backdrop-blur-md p-2.5 rounded-xl border border-white/10">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${isPlaying ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"}`}
                >
                  {isPlaying ? "Pause" : "Resume"}
                </button>

                <button
                  onClick={clearCanvas}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 transition-all"
                >
                  Clear
                </button>

                <button
                  onClick={instantRedraw}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/30 transition-all"
                >
                  Instant Render
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIs3D(!is3D)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${is3D ? currentTheme.badge : "bg-slate-800 text-slate-400 border-white/10"}`}
                >
                  {is3D ? "3D Projection ON" : "2D Flat"}
                </button>

                <button
                  onClick={() => setShowSparks(!showSparks)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${showSparks ? "bg-pink-500/20 text-pink-300 border-pink-500/40" : "bg-slate-800 text-slate-400 border-white/10"}`}
                >
                  {showSparks ? "Sparks ON" : "No Sparks"}
                </button>

                <button
                  onClick={downloadImage}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white shadow-md transition-all"
                >
                  Save PNG
                </button>
              </div>
            </div>
          </div>

          {/* Presets Toolbar */}
          <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Harmonic Presets</span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {Object.keys(PRESETS).map((key) => (
                <button
                  key={key}
                  onClick={() => applyPreset(key)}
                  className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-800/80 hover:bg-indigo-600/40 text-slate-200 border border-white/10 hover:border-indigo-400/50 transition-all text-center truncate"
                >
                  {PRESETS[key].name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Controls Column */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Pendulum Frequency & Phase Controls */}
          <div className="bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-white/10 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                Pendulum Frequencies (Ratio)
              </h3>
              <button
                onClick={randomize}
                className="text-xs px-2.5 py-1 rounded-md bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-400/30 transition-all"
              >
                Randomize
              </button>
            </div>

            {/* Sliders F1 - F4 */}
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Lateral Pendulum 1 ($f_1$)</span>
                  <span className="font-mono text-cyan-300 font-bold">{f1} Hz</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="12"
                  step="0.5"
                  value={f1}
                  onChange={(e) => setF1(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Lateral Pendulum 2 ($f_2$)</span>
                  <span className="font-mono text-cyan-300 font-bold">{f2} Hz</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="12"
                  step="0.5"
                  value={f2}
                  onChange={(e) => setF2(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Rotational Pendulum 3 ($f_3$)</span>
                  <span className="font-mono text-purple-300 font-bold">{f3} Hz</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="12"
                  step="0.5"
                  value={f3}
                  onChange={(e) => setF3(parseFloat(e.target.value))}
                  className="w-full accent-purple-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Rotational Pendulum 4 ($f_4$)</span>
                  <span className="font-mono text-purple-300 font-bold">{f4} Hz</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="12"
                  step="0.5"
                  value={f4}
                  onChange={(e) => setF4(parseFloat(e.target.value))}
                  className="w-full accent-purple-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Damping & Speed Controls */}
            <div className="border-t border-white/10 pt-3 space-y-3 text-xs">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Damping Friction ($d$)</span>
                  <span className="font-mono text-emerald-300 font-bold">{(damping * 10000).toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.00005"
                  max="0.001"
                  step="0.00005"
                  value={damping}
                  onChange={(e) => setDamping(parseFloat(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Draw Simulation Speed</span>
                  <span className="font-mono text-amber-300 font-bold">{drawSpeed}x</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={drawSpeed}
                  onChange={(e) => setDrawSpeed(parseInt(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Line Weight</span>
                  <span className="font-mono text-pink-300 font-bold">{lineWidth}px</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="4"
                  step="0.5"
                  value={lineWidth}
                  onChange={(e) => setLineWidth(parseFloat(e.target.value))}
                  className="w-full accent-pink-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Theme & Audio Controls */}
          <div className="bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-white/10 flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-pink-400">
              Aesthetics & Sound Synth
            </h3>

            {/* Theme Selector Buttons */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              {Object.keys(THEMES).map((key) => (
                <button
                  key={key}
                  onClick={() => setThemeKey(key)}
                  className={`py-2 px-2 rounded-xl font-medium border transition-all text-center ${
                    themeKey === key ? THEMES[key].badge : "bg-slate-800 text-slate-300 border-white/10 hover:border-white/20"
                  }`}
                >
                  {THEMES[key].name}
                </button>
              ))}
            </div>

            {/* Web Audio Synthesizer */}
            <div className="border-t border-white/10 pt-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Acoustic Audio Drone</span>
                <button
                  onClick={toggleAudio}
                  className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                    audioEnabled
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse"
                      : "bg-slate-800 text-slate-400 border-white/10"
                  }`}
                >
                  {audioEnabled ? "Sound ON" : "Sound Muted"}
                </button>
              </div>

              {audioEnabled && (
                <div className="mt-2 text-xs">
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Volume</span>
                    <span className="font-mono text-cyan-300">{Math.round(masterVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={masterVolume}
                    onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CosmicHarmonographStudio;
