import React, { useState, useEffect, useRef, useCallback } from "react";

// Visual Theme Presets
const THEMES = {
  cyber: {
    id: "cyber",
    name: "Cyber Neon",
    bg: "from-slate-950 via-indigo-950 to-slate-900",
    canvasBg: "#050814",
    colors: ["#00f3ff", "#7000ff", "#ff007f", "#00ff9d", "#ffffff"],
    glow: "rgba(0, 243, 255, 0.8)",
    accentText: "text-cyan-400",
    accentBorder: "border-cyan-500/40",
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    buttonBg: "bg-cyan-600 hover:bg-cyan-500 text-white",
  },
  solar: {
    id: "solar",
    name: "Solar Flare",
    bg: "from-amber-950 via-red-950 to-slate-950",
    canvasBg: "#120503",
    colors: ["#ff4500", "#ffaa00", "#ff0055", "#ffff00", "#ffffff"],
    glow: "rgba(255, 170, 0, 0.8)",
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
    glow: "rgba(0, 255, 170, 0.8)",
    accentText: "text-emerald-400",
    accentBorder: "border-emerald-500/40",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    buttonBg: "bg-emerald-600 hover:bg-emerald-500 text-white",
  },
  cosmos: {
    id: "cosmos",
    name: "Deep Cosmos",
    bg: "from-blue-950 via-slate-950 to-purple-950",
    canvasBg: "#040718",
    colors: ["#6366f1", "#a855f7", "#ec4899", "#38bdf8", "#ffffff"],
    glow: "rgba(168, 85, 247, 0.8)",
    accentText: "text-purple-400",
    accentBorder: "border-purple-500/40",
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    buttonBg: "bg-purple-600 hover:bg-purple-500 text-white",
  },
  prismatic: {
    id: "prismatic",
    name: "Prismatic Void",
    bg: "from-slate-950 via-purple-950 to-pink-950",
    canvasBg: "#08040d",
    colors: ["#ff0055", "#ffaa00", "#00ffcc", "#0088ff", "#9900ff"],
    glow: "rgba(255, 0, 255, 0.8)",
    accentText: "text-pink-400",
    accentBorder: "border-pink-500/40",
    badge: "bg-pink-500/20 text-pink-300 border-pink-500/40",
    buttonBg: "bg-pink-600 hover:bg-pink-500 text-white",
  },
};

// Simulation Behavior Modes
const MODES = {
  vortex: { id: "vortex", name: "Quantum Vortex", desc: "Swirling spiral field with angular velocity" },
  singularity: { id: "singularity", name: "Singularity Collapse", desc: "Supermassive gravitational pull towards center" },
  swarm: { id: "swarm", name: "Subatomic Swarm", desc: "Brownian quantum fluctuation and dispersion" },
  supernova: { id: "supernova", name: "Supernova Flare", desc: "Radial force expansion outwards" },
  magnetic: { id: "magnetic", name: "Toroidal Field", desc: "Double magnetic flux loop dynamics" },
};

const QuantumVortexLab = () => {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0, isDown: false, isInside: false });
  const shockwavesRef = useRef([]);

  // Audio Context Ref
  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);
  const gainNodeRef = useRef(null);

  // Controls State
  const [themeKey, setThemeKey] = useState("cyber");
  const [modeKey, setModeKey] = useState("vortex");
  const [particleCount, setParticleCount] = useState(1200);
  const [gravityPull, setGravityPull] = useState(2.5);
  const [trailFade, setTrailFade] = useState(0.18);
  const [particleSize, setParticleSize] = useState(2.5);
  const [interactionType, setInteractionType] = useState("attract"); // attract, repel, vortex, spawn
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [currentFps, setCurrentFps] = useState(60);
  const [energyLevel, setEnergyLevel] = useState(85);

  const theme = THEMES[themeKey];

  // Web Audio Synth setup
  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
        const gainNode = audioCtxRef.current.createGain();
        gainNode.gain.setValueAtTime(0.05, audioCtxRef.current.currentTime);
        gainNode.connect(audioCtxRef.current.destination);
        gainNodeRef.current = gainNode;
      }
    }
  }, []);

  const playPulseSound = useCallback(
    (freq = 220, type = "sine", duration = 0.3) => {
      if (!soundEnabled) return;
      initAudio();
      if (!audioCtxRef.current) return;

      if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }

      try {
        const osc = audioCtxRef.current.createOscillator();
        const gain = audioCtxRef.current.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtxRef.current.currentTime);

        gain.gain.setValueAtTime(0.15, audioCtxRef.current.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + duration);

        osc.connect(gain);
        gain.connect(audioCtxRef.current.destination);

        osc.start();
        osc.stop(audioCtxRef.current.currentTime + duration);
      } catch (err) {
        console.error("Audio trigger error", err);
      }
    },
    [soundEnabled, initAudio]
  );

  // Initialize Particles
  const initParticles = useCallback(
    (count, colors) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const width = canvas.width;
      const height = canvas.height;
      const particles = [];

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * (Math.min(width, height) * 0.45);
        const color = colors[Math.floor(Math.random() * colors.length)];

        particles.push({
          x: width / 2 + Math.cos(angle) * radius,
          y: height / 2 + Math.sin(angle) * radius,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          baseRadius: Math.random() * 1.5 + 0.8,
          color,
          mass: Math.random() * 0.8 + 0.6,
          life: Math.random(),
          maxLife: Math.random() * 200 + 100,
          orbitAngle: Math.random() * Math.PI * 2,
          spinSpeed: (Math.random() * 0.02 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
        });
      }
      particlesRef.current = particles;
    },
    []
  );

  // Trigger Shockwave Burst
  const triggerPulse = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cx = mouseRef.current.isInside ? mouseRef.current.x : canvas.width / 2;
    const cy = mouseRef.current.isInside ? mouseRef.current.y : canvas.height / 2;

    shockwavesRef.current.push({
      x: cx,
      y: cy,
      radius: 5,
      maxRadius: Math.max(canvas.width, canvas.height) * 0.6,
      alpha: 1,
      color: theme.colors[0],
    });

    // Apply explosive force to particles
    particlesRef.current.forEach((p) => {
      const dx = p.x - cx;
      const dy = p.y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = (120 / dist) * gravityPull;
      p.vx += (dx / dist) * force;
      p.vy += (dy / dist) * force;
    });

    playPulseSound(150 + Math.random() * 200, "sawtooth", 0.5);
    setEnergyLevel((prev) => Math.min(100, prev + 15));
  }, [gravityPull, theme, playPulseSound]);

  // Main Render & Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Resize Canvas to parent container width
    const handleResize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = 520;
        initParticles(particleCount, theme.colors);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    let lastTime = performance.now();
    let frameCounter = 0;

    const render = (timestamp) => {
      // Calculate FPS
      frameCounter++;
      if (timestamp - lastTime >= 500) {
        setCurrentFps(Math.round((frameCounter * 1000) / (timestamp - lastTime)));
        frameCounter = 0;
        lastTime = timestamp;
      }

      if (!isPaused) {
        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;

        // Trail effect with semi-transparent clear
        ctx.fillStyle = theme.canvasBg;
        ctx.globalAlpha = trailFade;
        ctx.fillRect(0, 0, width, height);
        ctx.globalAlpha = 1.0;

        // Draw background grid glow lines
        ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        const gridSize = 40;
        for (let x = 0; x < width; x += gridSize) {
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
        }
        for (let y = 0; y < height; y += gridSize) {
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
        }
        ctx.stroke();

        // Process Shockwaves
        shockwavesRef.current.forEach((sw, idx) => {
          sw.radius += 8;
          sw.alpha -= 0.02;

          if (sw.alpha > 0) {
            ctx.strokeStyle = sw.color;
            ctx.globalAlpha = sw.alpha;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1.0;
          } else {
            shockwavesRef.current.splice(idx, 1);
          }
        });

        // Update and Render Particles
        const particles = particlesRef.current;
        const mouse = mouseRef.current;

        particles.forEach((p) => {
          let targetX = centerX;
          let targetY = centerY;

          if (mouse.isInside) {
            targetX = mouse.x;
            targetY = mouse.y;
          }

          const dx = targetX - p.x;
          const dy = targetY - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;

          // Apply physics based on selected Mode
          if (modeKey === "vortex") {
            const angle = Math.atan2(dy, dx);
            const tangentX = -Math.sin(angle);
            const tangentY = Math.cos(angle);
            const force = (gravityPull * 15) / (dist + 20);

            p.vx += (tangentX * force + (dx / dist) * force * 0.4) * 0.05;
            p.vy += (tangentY * force + (dy / dist) * force * 0.4) * 0.05;
          } else if (modeKey === "singularity") {
            const force = (gravityPull * 35) / (dist + 30);
            p.vx += (dx / dist) * force * 0.08;
            p.vy += (dy / dist) * force * 0.08;

            p.orbitAngle += p.spinSpeed * gravityPull;
            p.vx += Math.cos(p.orbitAngle) * 0.1;
            p.vy += Math.sin(p.orbitAngle) * 0.1;
          } else if (modeKey === "swarm") {
            p.vx += (Math.random() - 0.5) * 0.8;
            p.vy += (Math.random() - 0.5) * 0.8;
            if (dist > 250) {
              p.vx += (dx / dist) * 0.2;
              p.vy += (dy / dist) * 0.2;
            }
          } else if (modeKey === "supernova") {
            const force = (gravityPull * 8) / (dist + 10);
            p.vx -= (dx / dist) * force * 0.1;
            p.vy -= (dy / dist) * force * 0.1;
          } else if (modeKey === "magnetic") {
            const loopRadius = 160;
            const targetDist = dist - loopRadius;
            p.vx += (dx / dist) * targetDist * 0.002 * gravityPull;
            p.vy += (dy / dist) * targetDist * 0.002 * gravityPull;
            p.vx += -dy * 0.0008;
            p.vy += dx * 0.0008;
          }

          // Mouse Interactivity
          if (mouse.isInside) {
            const mdx = mouse.x - p.x;
            const mdy = mouse.y - p.y;
            const mdist = Math.sqrt(mdx * mdx + mdy * mdy) || 1;

            if (mdist < 180) {
              if (interactionType === "attract") {
                const mForce = ((180 - mdist) / 180) * gravityPull * 0.3;
                p.vx += (mdx / mdist) * mForce;
                p.vy += (mdy / mdist) * mForce;
              } else if (interactionType === "repel") {
                const mForce = ((180 - mdist) / 180) * gravityPull * 0.5;
                p.vx -= (mdx / mdist) * mForce;
                p.vy -= (mdy / mdist) * mForce;
              } else if (interactionType === "vortex") {
                const mForce = ((180 - mdist) / 180) * gravityPull * 0.4;
                p.vx += (-mdy / mdist) * mForce;
                p.vy += (mdx / mdist) * mForce;
              }
            }
          }

          // Friction & Position update
          p.vx *= 0.96;
          p.vy *= 0.96;
          p.x += p.vx;
          p.y += p.vy;

          // Boundary Bounce with damping
          if (p.x < 0 || p.x > width) {
            p.vx *= -0.8;
            p.x = Math.max(0, Math.min(width, p.x));
          }
          if (p.y < 0 || p.y > height) {
            p.vy *= -0.8;
            p.y = Math.max(0, Math.min(height, p.y));
          }

          // Render Particle
          const currentSize = p.baseRadius * particleSize;
          const velSpeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);

          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(0.5, currentSize), 0, Math.PI * 2);
          ctx.fill();

          // Particle Speed Glow Line
          if (velSpeed > 2.2) {
            ctx.strokeStyle = p.color;
            ctx.lineWidth = Math.min(currentSize, 2);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x - p.vx * 2, p.y - p.vy * 2);
            ctx.stroke();
          }
        });

        // Draw Mouse Cursor Force Field Ring
        if (mouse.isInside) {
          ctx.strokeStyle = theme.colors[0];
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.arc(mouse.x, mouse.y, 60, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = theme.colors[1];
          ctx.beginPath();
          ctx.arc(mouse.x, mouse.y, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [
    theme,
    modeKey,
    particleCount,
    gravityPull,
    trailFade,
    particleSize,
    interactionType,
    isPaused,
    initParticles,
  ]);

  // Re-initialize particles when particle count or theme changes
  useEffect(() => {
    initParticles(particleCount, theme.colors);
  }, [particleCount, themeKey, initParticles, theme.colors]);

  // Mouse Handlers
  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    mouseRef.current.x = e.clientX - rect.left;
    mouseRef.current.y = e.clientY - rect.top;
    mouseRef.current.isInside = true;
  };

  const handleMouseEnter = () => {
    mouseRef.current.isInside = true;
  };

  const handleMouseLeave = () => {
    mouseRef.current.isInside = false;
  };

  const handleMouseDown = () => {
    mouseRef.current.isDown = true;
    triggerPulse();
  };

  const handleMouseUp = () => {
    mouseRef.current.isDown = false;
  };

  // Export Screenshot
  const handleExportImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `quantum-vortex-${themeKey}-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div
      className={`relative min-h-[640px] m-5 p-6 rounded-3xl bg-gradient-to-br ${theme.bg} border ${theme.accentBorder} shadow-2xl overflow-hidden transition-all duration-500`}
    >
      {/* Background Ambient Glow */}
      <div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-500"
        style={{ backgroundColor: theme.colors[0] }}
      />
      <div
        className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-500"
        style={{ backgroundColor: theme.colors[1] }}
      />

      {/* Header Container */}
      <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-gray-400">
              🌀 Quantum Vortex Lab
            </h2>
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full border ${theme.badge} shadow-sm`}
            >
              {MODES[modeKey].name}
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Real-time subatomic particle vortex simulator & audio-reactive force field dynamics
          </p>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center gap-4 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-xs">
          <div className="flex flex-col">
            <span className="text-slate-400">Active Particles</span>
            <span className={`font-mono font-bold text-sm ${theme.accentText}`}>
              {particleCount.toLocaleString()}
            </span>
          </div>
          <div className="w-px h-6 bg-white/10" />
          <div className="flex flex-col">
            <span className="text-slate-400">FPS</span>
            <span className="font-mono font-bold text-sm text-emerald-400">{currentFps}</span>
          </div>
          <div className="w-px h-6 bg-white/10" />
          <div className="flex flex-col">
            <span className="text-slate-400">Field Energy</span>
            <span className="font-mono font-bold text-sm text-amber-400">{energyLevel}%</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Controls + Canvas */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar Controls */}
        <div className="lg:col-span-4 flex flex-col gap-5 bg-slate-900/60 backdrop-blur-xl p-5 rounded-2xl border border-white/10">
          {/* Preset Theme Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Color Spectrum Preset
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(THEMES).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setThemeKey(t.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                    themeKey === t.id
                      ? `${t.badge} shadow-lg scale-105`
                      : "bg-slate-800/60 text-slate-400 border-white/5 hover:bg-slate-700/60 hover:text-white"
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Behavior Mode Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Quantum Physics Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(MODES).map((m) => (
                <button
                  key={m.id}
                  onClick={() => setModeKey(m.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium text-left transition-all border ${
                    modeKey === m.id
                      ? `bg-white/15 text-white border-white/30 shadow-md`
                      : "bg-slate-800/40 text-slate-400 border-white/5 hover:bg-slate-800 hover:text-slate-200"
                  }`}
                >
                  <div className="font-semibold">{m.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Mouse Interactivity Mode */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Cursor Force Field
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "attract", label: "🧲 Attract" },
                { id: "repel", label: "💥 Repel" },
                { id: "vortex", label: "🌪️ Spin" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setInteractionType(item.id)}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all border text-center ${
                    interactionType === item.id
                      ? "bg-slate-700 text-white border-white/30 shadow"
                      : "bg-slate-800/40 text-slate-400 border-white/5 hover:bg-slate-700/40 hover:text-slate-200"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-4 pt-2 border-t border-white/10">
            {/* Particle Count Slider */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Particle Density</span>
                <span className="font-mono text-slate-400">{particleCount}</span>
              </div>
              <input
                type="range"
                min="300"
                max="2500"
                step="100"
                value={particleCount}
                onChange={(e) => setParticleCount(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Gravity Pull Slider */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Gravity Pull Force</span>
                <span className="font-mono text-slate-400">{gravityPull}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="6"
                step="0.1"
                value={gravityPull}
                onChange={(e) => setGravityPull(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
              />
            </div>

            {/* Trail Length Slider */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Particle Trail Persistence</span>
                <span className="font-mono text-slate-400">
                  {Math.round((1 - trailFade) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.4"
                step="0.01"
                value={trailFade}
                onChange={(e) => setTrailFade(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>

            {/* Particle Size */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Particle Scale</span>
                <span className="font-mono text-slate-400">{particleSize}px</span>
              </div>
              <input
                type="range"
                min="1"
                max="6"
                step="0.5"
                value={particleSize}
                onChange={(e) => setParticleSize(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-400"
              />
            </div>
          </div>

          {/* Interactive Action Buttons */}
          <div className="pt-2 border-t border-white/10 flex flex-wrap gap-2">
            <button
              onClick={triggerPulse}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-lg hover:brightness-110 active:scale-95 ${theme.buttonBg}`}
            >
              ⚡ Quantum Shockwave
            </button>
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 transition-all"
            >
              {isPaused ? "▶ Resume" : "⏸ Pause"}
            </button>
          </div>
        </div>

        {/* Interactive Canvas Area */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="relative w-full rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-black group">
            <canvas
              ref={canvasRef}
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              className="w-full h-[520px] block cursor-crosshair touch-none"
            />

            {/* Overlay Canvas Helper Badge */}
            <div className="absolute top-4 left-4 pointer-events-none bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[11px] text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Click or Drag on Canvas to Release Shockwave</span>
            </div>

            {/* Top Right Quick Actions */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 rounded-xl text-xs font-semibold backdrop-blur-md border transition-all ${
                  soundEnabled
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : "bg-slate-900/70 text-slate-400 border-white/10 hover:text-white"
                }`}
                title="Toggle Web Audio Synthesizer"
              >
                {soundEnabled ? "🔊 Sound ON" : "🔇 Sound OFF"}
              </button>
              <button
                onClick={handleExportImage}
                className="p-2 rounded-xl text-xs font-semibold bg-slate-900/70 hover:bg-slate-800 text-slate-200 backdrop-blur-md border border-white/10 transition-all"
                title="Export High-Res PNG"
              >
                📸 Export Image
              </button>
            </div>
          </div>

          {/* Component Footer Info */}
          <div className="flex flex-col sm:flex-row justify-between items-center px-2 text-xs text-slate-400 gap-2">
            <span>Mode: <strong className="text-slate-200">{MODES[modeKey].desc}</strong></span>
            <span>Tip: Enable Sound & Click anywhere to create Quantum Pulses</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuantumVortexLab;
