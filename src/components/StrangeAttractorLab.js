import React, { useState, useEffect, useRef, useCallback } from "react";

// Color Themes
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
    palette: ["#00f3ff", "#38bdf8", "#818cf8", "#c084fc", "#ff007f"],
    glow: "rgba(0, 243, 255, 0.6)",
  },
  plasma: {
    id: "plasma",
    name: "Cosmic Plasma",
    bgGradient: "from-violet-950 via-slate-950 to-indigo-950",
    canvasBg: "#06020e",
    primary: "#c084fc",
    secondary: "#f43f5e",
    accentText: "text-purple-300",
    accentBorder: "border-purple-400/40",
    badge: "bg-purple-500/20 text-purple-200 border-purple-400/40",
    buttonActive: "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30",
    palette: ["#c084fc", "#e879f9", "#f43f5e", "#fb7185", "#38bdf8"],
    glow: "rgba(192, 132, 252, 0.6)",
  },
  emerald: {
    id: "emerald",
    name: "Emerald Matrix",
    bgGradient: "from-emerald-950 via-slate-950 to-teal-950",
    canvasBg: "#020a07",
    primary: "#00ffaa",
    secondary: "#06b6d4",
    accentText: "text-emerald-400",
    accentBorder: "border-emerald-500/40",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    buttonActive: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30",
    palette: ["#00ffaa", "#34d399", "#10b981", "#06b6d4", "#a7f3d0"],
    glow: "rgba(0, 255, 170, 0.6)",
  },
  gold: {
    id: "gold",
    name: "Solar Gold",
    bgGradient: "from-amber-950 via-slate-950 to-yellow-950",
    canvasBg: "#0d0701",
    primary: "#fbbf24",
    secondary: "#f97316",
    accentText: "text-amber-400",
    accentBorder: "border-amber-500/40",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    buttonActive: "bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold shadow-lg shadow-amber-600/30",
    palette: ["#fbbf24", "#f59e0b", "#f97316", "#ef4444", "#fef08a"],
    glow: "rgba(251, 191, 36, 0.6)",
  },
  sapphire: {
    id: "sapphire",
    name: "Deep Sapphire",
    bgGradient: "from-blue-950 via-slate-950 to-cyan-950",
    canvasBg: "#030612",
    primary: "#3b82f6",
    secondary: "#06b6d4",
    accentText: "text-blue-400",
    accentBorder: "border-blue-500/40",
    badge: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    buttonActive: "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30",
    palette: ["#3b82f6", "#60a5fa", "#06b6d4", "#38bdf8", "#93c5fd"],
    glow: "rgba(59, 130, 246, 0.6)",
  },
};

// Attractor Definitions
const ATTRACTORS = {
  lorenz: {
    id: "lorenz",
    name: "Lorenz Attractor",
    subtitle: "The Butterfly Effect",
    scale: 14,
    center: { x: 0, y: 0, z: 25 },
    defaultParams: { a: 10, b: 28, c: 8 / 3 },
    paramNames: { a: "σ (Sigma)", b: "ρ (Rho)", c: "β (Beta)" },
    dt: 0.008,
    formula: "dx = σ(y - x) | dy = x(ρ - z) - y | dz = xy - βz",
    derive: (x, y, z, p) => {
      const dx = p.a * (y - x);
      const dy = x * (p.b - z) - y;
      const dz = x * y - p.c * z;
      return [dx, dy, dz];
    },
  },
  aizawa: {
    id: "aizawa",
    name: "Aizawa Attractor",
    subtitle: "Spherical Polar Orbits",
    scale: 140,
    center: { x: 0, y: 0, z: 0.5 },
    defaultParams: { a: 0.95, b: 0.7, c: 0.6, d: 3.5, e: 0.25, f: 0.1 },
    paramNames: { a: "a", b: "b", c: "c", d: "d", e: "e", f: "f" },
    dt: 0.01,
    formula: "dx = (z-b)x - dy | dy = dx + (z-b)y | dz = c + az - z³/3 - (x²+y²)(1+ez) + fx³",
    derive: (x, y, z, p) => {
      const dx = (z - p.b) * x - p.d * y;
      const dy = p.d * x + (z - p.b) * y;
      const dz =
        p.c +
        p.a * z -
        (z * z * z) / 3 -
        (x * x + y * y) * (1 + p.e * z) +
        p.f * z * (x * x * x);
      return [dx, dy, dz];
    },
  },
  thomas: {
    id: "thomas",
    name: "Thomas Cyclical",
    subtitle: "Labyrinthine Symmetric Chaos",
    scale: 75,
    center: { x: 0, y: 0, z: 0 },
    defaultParams: { a: 0.208186 },
    paramNames: { a: "b (Damping)" },
    dt: 0.035,
    formula: "dx = sin(y) - bx | dy = sin(z) - by | dz = sin(x) - bz",
    derive: (x, y, z, p) => {
      const dx = Math.sin(y) - p.a * x;
      const dy = Math.sin(z) - p.a * y;
      const dz = Math.sin(x) - p.a * z;
      return [dx, dy, dz];
    },
  },
  halvorsen: {
    id: "halvorsen",
    name: "Halvorsen Vortex",
    subtitle: "Tri-Blade Symmetric Cyclone",
    scale: 25,
    center: { x: -2, y: -2, z: -2 },
    defaultParams: { a: 1.89 },
    paramNames: { a: "a (Coupling)" },
    dt: 0.008,
    formula: "dx = -ax - 4y - 4z - y² | dy = -ay - 4z - 4x - z² | dz = -az - 4x - 4y - x²",
    derive: (x, y, z, p) => {
      const dx = -p.a * x - 4 * y - 4 * z - y * y;
      const dy = -p.a * y - 4 * z - 4 * x - z * z;
      const dz = -p.a * z - 4 * x - 4 * y - x * x;
      return [dx, dy, dz];
    },
  },
  dadras: {
    id: "dadras",
    name: "Dadras Attractor",
    subtitle: "Multi-Scroll Flower",
    scale: 22,
    center: { x: 0, y: 0, z: 0 },
    defaultParams: { a: 3.0, b: 2.7, c: 1.7, d: 2.0, e: 9.0 },
    paramNames: { a: "a", b: "b", c: "c", d: "d", e: "e" },
    dt: 0.007,
    formula: "dx = y - ax + byz | dy = cy - xz + z | dz = dxy - ez",
    derive: (x, y, z, p) => {
      const dx = y - p.a * x + p.b * y * z;
      const dy = p.c * y - x * z + z;
      const dz = p.d * x * y - p.e * z;
      return [dx, dy, dz];
    },
  },
  chen: {
    id: "chen",
    name: "Chen Attractor",
    subtitle: "Dual-Scroll High-Speed Chaos",
    scale: 12,
    center: { x: 0, y: 0, z: 25 },
    defaultParams: { a: 35, b: 3, c: 28 },
    paramNames: { a: "a", b: "b", c: "c" },
    dt: 0.004,
    formula: "dx = a(y - x) | dy = (c - a)x - xz + cy | dz = xy - bz",
    derive: (x, y, z, p) => {
      const dx = p.a * (y - x);
      const dy = (p.c - p.a) * x - x * z + p.c * y;
      const dz = x * y - p.b * z;
      return [dx, dy, dz];
    },
  },
};

// Preset Scenarios
const PRESETS = {
  lorenzClassic: {
    name: "Classic Butterfly",
    attractor: "lorenz",
    particles: 1500,
    theme: "cyber",
    speed: 1.0,
    trailFade: 0.08,
  },
  aizawaBloom: {
    name: "Aizawa Cosmic Bloom",
    attractor: "aizawa",
    particles: 2200,
    theme: "plasma",
    speed: 1.2,
    trailFade: 0.05,
  },
  thomasLabyrinth: {
    name: "Thomas Labyrinth",
    attractor: "thomas",
    particles: 3000,
    theme: "emerald",
    speed: 1.5,
    trailFade: 0.12,
  },
  halvorsenHurricane: {
    name: "Halvorsen Cyclone",
    attractor: "halvorsen",
    particles: 1800,
    theme: "sapphire",
    speed: 1.1,
    trailFade: 0.07,
  },
  dadrasBlossom: {
    name: "Dadras Golden Flower",
    attractor: "dadras",
    particles: 2000,
    theme: "gold",
    speed: 1.0,
    trailFade: 0.06,
  },
  chenCascade: {
    name: "Chen Cyber Cascade",
    attractor: "chen",
    particles: 2500,
    theme: "cyber",
    speed: 1.3,
    trailFade: 0.05,
  },
};

export default function StrangeAttractorLab() {
  const canvasRef = useRef(null);
  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);
  const gainRef = useRef(null);

  // Simulation State
  const [selectedAttractorKey, setSelectedAttractorKey] = useState("lorenz");
  const [params, setParams] = useState(ATTRACTORS.lorenz.defaultParams);
  const [themeKey, setThemeKey] = useState("cyber");
  const [particleCount, setParticleCount] = useState(1800);
  const [speedMultiplier, setSpeedMultiplier] = useState(1.0);
  const [trailFade, setTrailFade] = useState(0.08);
  const [renderMode, setRenderMode] = useState("swarm"); // "swarm" | "ribbon"
  const [colorHeatmap, setColorHeatmap] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [autoRotateSpeed, setAutoRotateSpeed] = useState(0.5);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isTurbo, setIsTurbo] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // 3D Camera Controls
  const [rotX, setRotX] = useState(0.3);
  const [rotY, setRotY] = useState(0.5);
  const [zoom, setZoom] = useState(1.0);
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });

  // Stats State
  const [fps, setFps] = useState(60);
  const [currentLeadPos, setCurrentLeadPos] = useState({ x: 0, y: 0, z: 0, speed: 0 });

  const activeAttractor = ATTRACTORS[selectedAttractorKey];
  const activeTheme = THEMES[themeKey];

  // Particle swarm memory ref
  const particlesRef = useRef([]);

  // Initialize Particles
  const initParticles = useCallback(
    (count, attractor) => {
      const arr = [];
      const c = attractor.center;
      for (let i = 0; i < count; i++) {
        const spread = 2.0;
        arr.push({
          x: c.x + (Math.random() - 0.5) * spread,
          y: c.y + (Math.random() - 0.5) * spread,
          z: c.z + (Math.random() - 0.5) * spread,
          vx: 0,
          vy: 0,
          vz: 0,
          speed: 0,
          history: [],
        });
      }
      particlesRef.current = arr;
    },
    []
  );

  // Switch Attractor
  const handleAttractorChange = (key) => {
    setSelectedAttractorKey(key);
    const att = ATTRACTORS[key];
    setParams(att.defaultParams);
    initParticles(particleCount, att);
  };

  // Switch Preset
  const handlePresetSelect = (presetKey) => {
    const p = PRESETS[presetKey];
    if (!p) return;
    setSelectedAttractorKey(p.attractor);
    setParams(ATTRACTORS[p.attractor].defaultParams);
    setParticleCount(p.particles);
    setThemeKey(p.theme);
    setSpeedMultiplier(p.speed);
    setTrailFade(p.trailFade);
    initParticles(p.particles, ATTRACTORS[p.attractor]);
  };

  // Reset Simulation
  const handleReset = () => {
    initParticles(particleCount, activeAttractor);
  };

  // Audio Sonification Setup
  useEffect(() => {
    if (audioEnabled) {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        gain.gain.setValueAtTime(0.001, ctx.currentTime);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        audioCtxRef.current = ctx;
        oscRef.current = osc;
        gainRef.current = gain;
      } catch (e) {
        console.warn("Web Audio API not supported", e);
      }
    } else {
      if (gainRef.current && audioCtxRef.current) {
        gainRef.current.gain.setTargetAtTime(0.0001, audioCtxRef.current.currentTime, 0.05);
        setTimeout(() => {
          if (oscRef.current) {
            oscRef.current.stop();
            oscRef.current.disconnect();
          }
          if (audioCtxRef.current) audioCtxRef.current.close();
          audioCtxRef.current = null;
          oscRef.current = null;
          gainRef.current = null;
        }, 100);
      }
    }

    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close();
      }
    };
  }, [audioEnabled]);

  // Update Audio Tone based on particles
  const updateAudioTone = useCallback(
    (leadParticle) => {
      if (!audioEnabled || !oscRef.current || !gainRef.current || !audioCtxRef.current) return;
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // Map position (x, y, z) to audio frequency (80 Hz to 880 Hz)
      const baseFreq = 180;
      const normZ = Math.min(Math.max((leadParticle.z - activeAttractor.center.z) * 10, -300), 400);
      const freq = Math.max(80, Math.min(900, baseFreq + leadParticle.speed * 20 + normZ * 0.8));

      oscRef.current.frequency.setTargetAtTime(freq, ctx.currentTime, 0.05);
      gainRef.current.gain.setTargetAtTime(0.04, ctx.currentTime, 0.05);
    },
    [audioEnabled, activeAttractor]
  );

  // Initialize Particles on Mount or Count Change
  useEffect(() => {
    initParticles(particleCount, activeAttractor);
  }, [particleCount, selectedAttractorKey, initParticles]);

  // Main Canvas Render & Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let animId;
    let frameCounter = 0;
    let fpsTimer = performance.now();

    // 3D Projection Helpers
    let currRotY = rotY;

    const render = (now) => {
      animId = requestAnimationFrame(render);

      // FPS Calculation
      frameCounter++;
      if (now - fpsTimer >= 500) {
        setFps(Math.round((frameCounter * 1000) / (now - fpsTimer)));
        frameCounter = 0;
        fpsTimer = now;
      }

      const width = canvas.width;
      const height = canvas.height;
      if (width === 0 || height === 0) return;

      const cx = width / 2;
      const cy = height / 2;

      // Handle Canvas Clearing / Fade Trail
      ctx.fillStyle = activeTheme.canvasBg;
      ctx.globalAlpha = isPaused ? 1.0 : trailFade;
      ctx.fillRect(0, 0, width, height);
      ctx.globalAlpha = 1.0;

      // Auto Rotation
      if (autoRotate && !isPaused) {
        currRotY += 0.004 * autoRotateSpeed;
      } else {
        currRotY = rotY;
      }

      const cosY = Math.cos(currRotY);
      const sinY = Math.sin(currRotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      const perspective = 600;
      const effScale = activeAttractor.scale * zoom * (width / 900);
      const center = activeAttractor.center;

      // RK4 Physics Step (if not paused)
      const particles = particlesRef.current;
      const effectiveDt = activeAttractor.dt * speedMultiplier * (isTurbo ? 4.0 : 1.0);

      if (!isPaused && particles.length > 0) {
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          const [dx, dy, dz] = activeAttractor.derive(p.x, p.y, p.z, params);

          p.x += dx * effectiveDt;
          p.y += dy * effectiveDt;
          p.z += dz * effectiveDt;

          p.vx = dx;
          p.vy = dy;
          p.vz = dz;
          p.speed = Math.sqrt(dx * dx + dy * dy + dz * dz);

          // Reset particle if it explodes / NaN / goes out of bounds
          if (
            isNaN(p.x) ||
            isNaN(p.y) ||
            isNaN(p.z) ||
            Math.abs(p.x) > 500 ||
            Math.abs(p.y) > 500 ||
            Math.abs(p.z) > 500
          ) {
            p.x = center.x + (Math.random() - 0.5) * 2;
            p.y = center.y + (Math.random() - 0.5) * 2;
            p.z = center.z + (Math.random() - 0.5) * 2;
          }
        }

        if (particles[0]) {
          setCurrentLeadPos({
            x: particles[0].x.toFixed(2),
            y: particles[0].y.toFixed(2),
            z: particles[0].z.toFixed(2),
            speed: particles[0].speed.toFixed(1),
          });
          updateAudioTone(particles[0]);
        }
      }

      // Draw 3D Coordinates Grid Axis
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.beginPath();
      ctx.arc(cx, cy, Math.min(width, height) * 0.45, 0, Math.PI * 2);
      ctx.stroke();

      // Render Particles
      const palette = activeTheme.palette;
      const isRibbon = renderMode === "ribbon";

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Shift origin to attractor center
        const relX = p.x - center.x;
        const relY = p.y - center.y;
        const relZ = p.z - center.z;

        // 3D Rotation Matrix Transformation
        const x1 = relX * cosY + relZ * sinY;
        const z1 = -relX * sinY + relZ * cosY;
        const y2 = relY * cosX - z1 * sinX;
        const z2 = relY * sinX + z1 * cosX;

        // Perspective projection
        const scale = perspective / (perspective + z2);
        const px = cx + x1 * effScale * scale;
        const py = cy + y2 * effScale * scale;

        // Skip offscreen
        if (px < -50 || px > width + 50 || py < -50 || py > height + 50) continue;

        // Color selection (Heatmap speed or theme index)
        let colorStr;
        if (colorHeatmap) {
          const speedNorm = Math.min(1.0, p.speed / 40);
          const colorIdx = Math.floor(speedNorm * (palette.length - 1));
          colorStr = palette[colorIdx];
        } else {
          colorStr = palette[i % palette.length];
        }

        // Particle Size & Alpha based on Depth (z2)
        const alpha = Math.min(1.0, Math.max(0.15, (z2 + 200) / 400));
        const pSize = isRibbon ? 1.5 * scale : Math.max(0.8, 2.2 * scale);

        ctx.fillStyle = colorStr;
        ctx.globalAlpha = alpha;

        if (isRibbon && i > 0 && i % 10 === 0) {
          ctx.beginPath();
          ctx.arc(px, py, pSize, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(px, py, pSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1.0;
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [
    activeAttractor,
    activeTheme,
    params,
    particleCount,
    speedMultiplier,
    trailFade,
    renderMode,
    colorHeatmap,
    autoRotate,
    autoRotateSpeed,
    rotX,
    rotY,
    zoom,
    isPaused,
    isTurbo,
    updateAudioTone,
  ]);

  // Handle Canvas Resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = Math.max(480, Math.min(680, rect.width * 0.55));
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Mouse / Touch 3D Orbit Handlers
  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMouseRef.current.x;
    const dy = e.clientY - lastMouseRef.current.y;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };

    setRotY((prev) => prev + dx * 0.008);
    setRotX((prev) => Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, prev + dy * 0.008)));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    setZoom((prev) => Math.max(0.3, Math.min(3.5, prev + delta)));
  };

  // High-Res Canvas Image Export
  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `strange-attractor-${selectedAttractorKey}-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className={`w-full max-w-7xl mx-auto my-8 p-4 sm:p-6 lg:p-8 rounded-3xl bg-gradient-to-b ${activeTheme.bgGradient} text-slate-100 shadow-2xl border border-slate-800`}>
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full border ${activeTheme.badge}`}>
              Chaos Dynamics & 3D Phase-Space
            </span>
            <span className="text-xs text-slate-400 font-mono">
              FPS: <span className={activeTheme.accentText}>{fps}</span>
            </span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight mt-1 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            {activeAttractor.name}
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">{activeAttractor.subtitle}</p>
        </div>

        {/* Action Controls Header */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Pause / Play */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border border-slate-700 hover:border-slate-500 bg-slate-900/80 hover:bg-slate-800 flex items-center gap-2`}
          >
            {isPaused ? (
              <>
                <svg className="w-4 h-4 text-emerald-400 fill-current" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Resume
              </>
            ) : (
              <>
                <svg className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
                Pause
              </>
            )}
          </button>

          {/* Turbo Boost */}
          <button
            onClick={() => setIsTurbo(!isTurbo)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${
              isTurbo
                ? "border-rose-500 bg-rose-600/30 text-rose-300 animate-pulse"
                : "border-slate-700 bg-slate-900/80 text-slate-300 hover:bg-slate-800"
            } flex items-center gap-2`}
          >
            <svg className="w-4 h-4 text-rose-400 fill-current" viewBox="0 0 24 24">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            Turbo Boost
          </button>

          {/* Audio Sonification */}
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${
              audioEnabled
                ? "border-cyan-500 bg-cyan-600/30 text-cyan-200"
                : "border-slate-700 bg-slate-900/80 text-slate-400 hover:bg-slate-800"
            } flex items-center gap-2`}
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              {audioEnabled ? (
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              ) : (
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
              )}
            </svg>
            Audio Synth
          </button>

          {/* Reset */}
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-xl text-sm font-medium border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-300 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset
          </button>

          {/* Export PNG */}
          <button
            onClick={handleExportPNG}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTheme.buttonActive} flex items-center gap-2`}
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
            </svg>
            Snapshot
          </button>
        </div>
      </div>

      {/* Main Content Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Column: Interactive 3D Phase Space Canvas */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/90 shadow-inner group">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
              className="w-full cursor-grab active:cursor-grabbing touch-none block"
            />

            {/* Orbit Instructions Overlay Badge */}
            <div className="absolute top-4 left-4 pointer-events-none bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 text-xs text-slate-300 flex items-center gap-2">
              <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
              Drag to Orbit 3D | Scroll to Zoom
            </div>

            {/* Live Vector Telemetry Hud */}
            <div className="absolute bottom-4 left-4 right-4 pointer-events-none flex flex-wrap items-center justify-between gap-2 bg-slate-900/85 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-800 text-xs font-mono">
              <div className="flex items-center gap-4 text-slate-300">
                <span>
                  X: <span className={activeTheme.accentText}>{currentLeadPos.x}</span>
                </span>
                <span>
                  Y: <span className={activeTheme.accentText}>{currentLeadPos.y}</span>
                </span>
                <span>
                  Z: <span className={activeTheme.accentText}>{currentLeadPos.z}</span>
                </span>
              </div>
              <div className="flex items-center gap-4 text-slate-400">
                <span>
                  Velocity: <span className="text-emerald-400 font-semibold">{currentLeadPos.speed}</span>
                </span>
                <span>
                  Particles: <span className="text-slate-200">{particleCount}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Presets Carousel */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap mr-1">
              Iconic Presets:
            </span>
            {Object.keys(PRESETS).map((key) => {
              const p = PRESETS[key];
              return (
                <button
                  key={key}
                  onClick={() => handlePresetSelect(key)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 text-slate-300 transition-all whitespace-nowrap flex items-center gap-1.5"
                >
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  {p.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Control Parameters & Physics Tuning */}
        <div className="lg:col-span-4 flex flex-col gap-5 bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl border border-slate-800/80">
          {/* Attractor Selector Tabs */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
              Chaotic Attractor Model
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(ATTRACTORS).map((key) => {
                const att = ATTRACTORS[key];
                const isActive = selectedAttractorKey === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleAttractorChange(key)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium transition-all text-left border ${
                      isActive
                        ? `${activeTheme.badge} border-opacity-100 font-semibold shadow-md`
                        : "border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                    }`}
                  >
                    <div className="truncate font-semibold">{att.name}</div>
                    <div className="text-[10px] opacity-70 truncate">{att.subtitle}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Attractor Specific Math Differential Parameters */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/90 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
              <span>Differential Parameters</span>
              <button
                onClick={() => setParams(activeAttractor.defaultParams)}
                className="text-[10px] text-cyan-400 hover:underline"
              >
                Reset Params
              </button>
            </div>

            {Object.keys(params).map((pKey) => {
              const val = params[pKey];
              const label = activeAttractor.paramNames[pKey] || pKey;
              return (
                <div key={pKey} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono text-slate-300">
                    <span>{label}</span>
                    <span className={activeTheme.accentText}>{val.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min={val < 0 ? val * 2.5 : 0.05}
                    max={val === 0 ? 10 : Math.abs(val) * 2.5}
                    step="0.01"
                    value={val}
                    onChange={(e) =>
                      setParams({ ...params, [pKey]: parseFloat(e.target.value) })
                    }
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>
              );
            })}
          </div>

          {/* Simulation Dynamics Controls */}
          <div className="space-y-4 pt-2">
            {/* Particle Count Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium text-slate-300">
                <span>Particle Swarm Density</span>
                <span className="font-mono text-slate-400">{particleCount}</span>
              </div>
              <input
                type="range"
                min="200"
                max="4000"
                step="100"
                value={particleCount}
                onChange={(e) => setParticleCount(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
              />
            </div>

            {/* Speed Multiplier Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium text-slate-300">
                <span>Time Velocity (dt)</span>
                <span className="font-mono text-slate-400">{speedMultiplier.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="3.0"
                step="0.1"
                value={speedMultiplier}
                onChange={(e) => setSpeedMultiplier(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>

            {/* Trail Fade Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium text-slate-300">
                <span>Trail Persistence (Glow Decay)</span>
                <span className="font-mono text-slate-400">{Math.round((1 - trailFade) * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.02"
                max="0.25"
                step="0.01"
                value={trailFade}
                onChange={(e) => setTrailFade(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>
          </div>

          {/* Theme & Visual Options */}
          <div className="pt-2 space-y-3 border-t border-slate-800/80">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Visual Palette & Toggles
            </label>

            {/* Theme Picker */}
            <div className="grid grid-cols-5 gap-1.5">
              {Object.keys(THEMES).map((tKey) => {
                const t = THEMES[tKey];
                const isSel = themeKey === tKey;
                return (
                  <button
                    key={tKey}
                    onClick={() => setThemeKey(tKey)}
                    title={t.name}
                    className={`h-7 rounded-lg border transition-all flex items-center justify-center ${
                      isSel ? "border-white ring-2 ring-white/30 scale-105" : "border-slate-800 opacity-70 hover:opacity-100"
                    }`}
                    style={{ background: t.primary }}
                  />
                );
              })}
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setAutoRotate(!autoRotate)}
                className={`py-2 px-3 rounded-xl border text-center transition-all ${
                  autoRotate ? "bg-slate-800 border-slate-600 text-slate-200" : "bg-slate-950/60 border-slate-800 text-slate-400"
                }`}
              >
                Auto-Rotate: {autoRotate ? "ON" : "OFF"}
              </button>

              <button
                onClick={() => setColorHeatmap(!colorHeatmap)}
                className={`py-2 px-3 rounded-xl border text-center transition-all ${
                  colorHeatmap ? "bg-slate-800 border-slate-600 text-slate-200" : "bg-slate-950/60 border-slate-800 text-slate-400"
                }`}
              >
                Speed Heatmap: {colorHeatmap ? "ON" : "OFF"}
              </button>
            </div>
          </div>

          {/* View Differential Equation Button */}
          <button
            onClick={() => setShowInfoModal(true)}
            className="w-full py-2.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-all flex items-center justify-center gap-2 mt-auto"
          >
            <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Physics & Equations Guide
          </button>
        </div>
      </div>

      {/* Physics Equations & Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowInfoModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              {activeAttractor.name} Physics
            </h3>
            <p className="text-sm text-slate-300">
              A <strong>strange attractor</strong> is a fractal set of points in phase-space toward which a chaotic dynamical system evolves over time. Despite deterministic differential rules, tiny perturbations lead to wildly divergent trajectories (butterfly effect).
            </p>
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto">
              <div className="text-slate-400 font-semibold mb-1 uppercase tracking-wider">Governing Differential Equations:</div>
              {activeAttractor.formula}
            </div>
            <div className="text-xs text-slate-400 space-y-1">
              <p>• <strong>Integration Algorithm:</strong> Numerical Euler / RK4 step evaluation in 3D phase space.</p>
              <p>• <strong>Phase-Space Projection:</strong> Matrix Euler angle pitch/yaw rotation with perspective focal scaling.</p>
            </div>
            <button
              onClick={() => setShowInfoModal(false)}
              className={`w-full py-2.5 rounded-xl font-semibold text-xs ${activeTheme.buttonActive}`}
            >
              Close & Return to Simulation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
