import React, { useState, useEffect, useRef, useCallback } from "react";

// Preset Color Palettes
const PALETTES = {
  cyberNeon: {
    id: "cyberNeon",
    name: "Cyber Neon",
    colors: ["#00F0FF", "#FF007F", "#7928CA", "#00FF66"],
    bg: "#0B0F19",
    accent: "from-cyan-500 to-pink-500",
    border: "border-cyan-500/30",
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
  },
  toxicEmerald: {
    id: "toxicEmerald",
    name: "Matrix Emerald",
    colors: ["#00FF66", "#10B981", "#059669", "#A7F3D0"],
    bg: "#04120A",
    accent: "from-emerald-400 to-teal-500",
    border: "border-emerald-500/30",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  },
  lavaEmber: {
    id: "lavaEmber",
    name: "Lava Ember",
    colors: ["#FF3300", "#FF9900", "#FF0055", "#FBBF24"],
    bg: "#140707",
    accent: "from-amber-500 to-red-600",
    border: "border-orange-500/30",
    badge: "bg-orange-500/20 text-orange-300 border-orange-500/40",
  },
  midnightAurora: {
    id: "midnightAurora",
    name: "Midnight Aurora",
    colors: ["#8B5CF6", "#3B82F6", "#06B6D4", "#EC4899"],
    bg: "#0B0B1E",
    accent: "from-purple-500 to-blue-500",
    border: "border-purple-500/30",
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/40",
  },
  solarGold: {
    id: "solarGold",
    name: "Solar Gold",
    colors: ["#F59E0B", "#FBBF24", "#EF4444", "#FDE047"],
    bg: "#120E04",
    accent: "from-yellow-400 to-amber-600",
    border: "border-amber-500/30",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  },
  prismRainbow: {
    id: "prismRainbow",
    name: "Prism Rainbow",
    colors: ["#FF0055", "#FF9900", "#00FF66", "#00F0FF", "#A855F7"],
    bg: "#0D0D14",
    accent: "from-pink-500 via-emerald-400 to-cyan-400",
    border: "border-pink-500/30",
    badge: "bg-pink-500/20 text-pink-300 border-pink-500/40",
  },
  monochromeSlate: {
    id: "monochromeSlate",
    name: "Monochrome Slate",
    colors: ["#F8FAFC", "#CBD5E1", "#94A3B8", "#38BDF8"],
    bg: "#0F172A",
    accent: "from-slate-200 to-sky-400",
    border: "border-slate-500/30",
    badge: "bg-slate-500/20 text-slate-300 border-slate-500/40",
  },
};

// Typography Font Families
const FONT_FAMILIES = {
  sans: { id: "sans", name: "Modern Sans", font: "system-ui, -apple-system, sans-serif" },
  display: { id: "display", name: "Bold Impact", font: "'Impact', 'Arial Black', sans-serif" },
  mono: { id: "mono", name: "Neon Monospace", font: "'Fira Code', 'Courier New', monospace" },
  serif: { id: "serif", name: "Classic Serif", font: "'Georgia', 'Times New Roman', serif" },
};

// Physics Modes
const PHYSICS_MODES = {
  repulsion: { id: "repulsion", name: "Magnetic Repulsion", icon: "🧲", desc: "Particles push away from cursor with spring recall" },
  vortex: { id: "vortex", name: "Vortex Gravity", icon: "🌀", desc: "Particles swirl in a helical gravitational cyclone" },
  shockwave: { id: "shockwave", name: "Shockwave Shatter", icon: "💥", desc: "Click canvas to shatter particles outwards in a wave" },
  liquid: { id: "liquid", name: "Liquid Noise Flow", icon: "🌊", desc: "Particles drift smoothly along procedural force vectors" },
  flame: { id: "flame", name: "Flame Ember Trails", icon: "🔥", desc: "Particles emit glowing rising ember trails" },
};

// Preset Text Suggestions
const QUICK_TEXT_PRESETS = [
  "ANTIGRAVITY",
  "KINETIC FX",
  "NEON BLISS",
  "CYBERPUNK",
  "INNOVATE",
  "FUTURE",
];

export default function ParticleTextStudio() {
  const [text, setText] = useState("ANTIGRAVITY");
  const [fontFamily, setFontFamily] = useState("display");
  const [paletteId, setPaletteId] = useState("cyberNeon");
  const [physicsMode, setPhysicsMode] = useState("repulsion");
  
  // Sliders & Controls
  const [density, setDensity] = useState(4); // Sampling gap (lower = higher density)
  // eslint-disable-next-line
  const [particleSize, setParticleSize] = useState(2.2);
  const [stiffness, setStiffness] = useState(0.08); // Spring return force
  const [damping, setDamping] = useState(0.88); // Friction
  const [forceRadius, setForceRadius] = useState(120);
  const [glowIntensity, setGlowIntensity] = useState(15);
  
  // Toggles
  const [connectLines, setConnectLines] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  // eslint-disable-next-line
  const [isPaused, setIsPaused] = useState(false);

  // Modal / Stats
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [particleCount, setParticleCount] = useState(0);
  const [fps, setFps] = useState(60);

  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: -9999, y: -9999, isHover: false, radius: 120 });
  const shockwaveRef = useRef({ x: 0, y: 0, active: false, radius: 0, maxRadius: 300, force: 30 });
  const lastTimeRef = useRef(performance.now());
  const frameCountRef = useRef(0);

  const currentPalette = PALETTES[paletteId] || PALETTES.cyberNeon;

  // Initialize Particles from Text Layout
  const initParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    if (width === 0 || height === 0) return;

    // Create offscreen canvas for crisp text sampling
    const offscreen = document.createElement("canvas");
    offscreen.width = width;
    offscreen.height = height;
    const offCtx = offscreen.getContext("2d", { willReadFrequently: true });

    // Background fill
    offCtx.fillStyle = "#000000";
    offCtx.fillRect(0, 0, width, height);

    // Compute font size based on text length and canvas dimensions
    const fontObj = FONT_FAMILIES[fontFamily] || FONT_FAMILIES.display;
    let baseFontSize = Math.min(width / (text.length * 0.75), height * 0.45);
    baseFontSize = Math.max(24, Math.min(baseFontSize, 140));

    offCtx.font = `bold ${baseFontSize}px ${fontObj.font}`;
    offCtx.textAlign = "center";
    offCtx.textBaseline = "middle";
    offCtx.fillStyle = "#FFFFFF";
    offCtx.fillText(text.trim() || "ANTIGRAVITY", width / 2, height / 2);

    // Sample pixels
    const imgData = offCtx.getImageData(0, 0, width, height);
    const data = imgData.data;
    const sampledParticles = [];

    const gap = Math.max(2, Math.min(10, density));
    const colors = currentPalette.colors;

    for (let y = 0; y < height; y += gap) {
      for (let x = 0; x < width; x += gap) {
        const index = (y * width + x) * 4;
        const alpha = data[index + 3];
        const red = data[index];

        // If pixel is visible text
        if (alpha > 128 && red > 100) {
          const colorIndex = Math.floor(Math.random() * colors.length);
          // Scatter initial positions for cool assembly effect
          const startX = x + (Math.random() - 0.5) * width * 0.5;
          const startY = y + (Math.random() - 0.5) * height * 0.5;

          sampledParticles.push({
            x: startX,
            y: startY,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            targetX: x,
            targetY: y,
            size: particleSize + (Math.random() - 0.5) * 0.8,
            color: colors[colorIndex],
            hueOffset: Math.random() * 360,
            alpha: 1,
            mass: 0.8 + Math.random() * 0.4,
          });
        }
      }
    }

    particlesRef.current = sampledParticles;
    setParticleCount(sampledParticles.length);
  }, [text, fontFamily, density, particleSize, currentPalette]);

  // Adjust Canvas Resolution on Resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctxScaleRef.current = dpr;
      initParticles();
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [initParticles]);

  const ctxScaleRef = useRef(1);

  // Trigger Shockwave Burst
  const triggerShockwave = useCallback((cx, cy) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = ctxScaleRef.current;

    const shockX = cx !== undefined ? (cx - rect.left) * dpr : canvas.width / 2;
    const shockY = cy !== undefined ? (cy - rect.top) * dpr : canvas.height / 2;

    shockwaveRef.current = {
      x: shockX,
      y: shockY,
      active: true,
      radius: 0,
      maxRadius: Math.max(canvas.width, canvas.height) * 0.6,
      force: 25,
    };
  }, []);

  // Main Render & Physics Loop
  useEffect(() => {
    let animationId;
    let time = 0;

    const render = (now) => {
      // FPS counter calculation
      frameCountRef.current++;
      if (now - lastTimeRef.current >= 500) {
        setFps(Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current)));
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const width = canvas.width;
      const height = canvas.height;
      const dpr = ctxScaleRef.current;

      if (!isPaused) {
        time += 0.02;

        // Clear canvas background
        ctx.fillStyle = currentPalette.bg;
        ctx.fillRect(0, 0, width, height);

        // Optional background grid
        if (showGrid) {
          ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
          ctx.lineWidth = 1 * dpr;
          const gridSize = 40 * dpr;
          for (let gx = 0; gx < width; gx += gridSize) {
            ctx.beginPath();
            ctx.moveTo(gx, 0);
            ctx.lineTo(gx, height);
            ctx.stroke();
          }
          for (let gy = 0; gy < height; gy += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, gy);
            ctx.lineTo(width, gy);
            ctx.stroke();
          }
        }

        // Handle Shockwave Animation
        const sw = shockwaveRef.current;
        if (sw.active) {
          sw.radius += 18 * dpr;
          ctx.beginPath();
          ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `${currentPalette.colors[0]}66`;
          ctx.lineWidth = 4 * dpr;
          ctx.stroke();

          if (sw.radius > sw.maxRadius) {
            sw.active = false;
          }
        }

        const particles = particlesRef.current;
        const mouse = mouseRef.current;
        const effectiveMouseRadius = forceRadius * dpr;

        ctx.shadowBlur = glowIntensity * dpr;

        // Update and draw particles
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];

          // Target return spring force
          let dx = p.targetX - p.x;
          let dy = p.targetY - p.y;
          let distToTarget = Math.sqrt(dx * dx + dy * dy);

          p.vx += dx * stiffness;
          p.vy += dy * stiffness;

          // Mouse Physics Interactions
          if (mouse.isHover) {
            const mdx = p.x - mouse.x;
            const mdy = p.y - mouse.y;
            const mDist = Math.sqrt(mdx * mdx + mdy * mdy);

            if (mDist < effectiveMouseRadius && mDist > 0) {
              const force = (1 - mDist / effectiveMouseRadius);

              if (physicsMode === "repulsion") {
                const angle = Math.atan2(mdy, mdx);
                const push = force * 14 * dpr;
                p.vx += Math.cos(angle) * push;
                p.vy += Math.sin(angle) * push;
              } else if (physicsMode === "vortex") {
                const angle = Math.atan2(mdy, mdx) + Math.PI / 2;
                const swirl = force * 12 * dpr;
                p.vx += Math.cos(angle) * swirl - (mdx / mDist) * force * 4;
                p.vy += Math.sin(angle) * swirl - (mdy / mDist) * force * 4;
              } else if (physicsMode === "liquid") {
                const noiseAngle = Math.sin(p.x * 0.005 + time) * Math.cos(p.y * 0.005 + time) * Math.PI * 2;
                p.vx += Math.cos(noiseAngle) * force * 8 * dpr;
                p.vy += Math.sin(noiseAngle) * force * 8 * dpr;
              } else if (physicsMode === "flame") {
                p.vy -= force * 6 * dpr;
                p.vx += (Math.random() - 0.5) * 3 * dpr;
              }
            }
          }

          // Shockwave impulse force
          if (sw.active) {
            const swdx = p.x - sw.x;
            const swdy = p.y - sw.y;
            const swDist = Math.sqrt(swdx * swdx + swdy * swdy);
            const ringDiff = Math.abs(swDist - sw.radius);

            if (ringDiff < 40 * dpr && swDist > 0) {
              const swForce = (1 - ringDiff / (40 * dpr)) * sw.force * dpr;
              const angle = Math.atan2(swdy, swdx);
              p.vx += Math.cos(angle) * swForce;
              p.vy += Math.sin(angle) * swForce;
            }
          }

          // Apply damping (friction) & position update
          p.vx *= damping;
          p.vy *= damping;
          p.x += p.vx;
          p.y += p.vy;

          // Render Particle
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * dpr, 0, Math.PI * 2);
          ctx.fill();

          // Connect neighboring particles with constellation lines if enabled
          if (connectLines && i % 4 === 0 && distToTarget < 20 * dpr) {
            for (let j = i + 1; j < Math.min(i + 12, particles.length); j += 3) {
              const p2 = particles[j];
              const cdx = p.x - p2.x;
              const cdy = p.y - p2.y;
              const cDist = Math.sqrt(cdx * cdx + cdy * cdy);

              if (cDist < 35 * dpr) {
                ctx.beginPath();
                ctx.strokeStyle = `${p.color}2B`;
                ctx.lineWidth = 0.8 * dpr;
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
              }
            }
          }
        }
      }

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationId);
  }, [
    isPaused,
    currentPalette,
    showGrid,
    stiffness,
    damping,
    forceRadius,
    glowIntensity,
    physicsMode,
    connectLines,
  ]);

  // Mouse & Touch Interaction Handlers
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = ctxScaleRef.current;
    mouseRef.current.x = (e.clientX - rect.left) * dpr;
    mouseRef.current.y = (e.clientY - rect.top) * dpr;
    mouseRef.current.isHover = true;
  };

  const handleMouseLeave = () => {
    mouseRef.current.isHover = false;
    mouseRef.current.x = -9999;
    mouseRef.current.y = -9999;
  };

  const handleCanvasClick = (e) => {
    triggerShockwave(e.clientX, e.clientY);
  };

  // Download Canvas Snapshot
  const handleDownloadSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `particle-typography-${text.toLowerCase().replace(/\s+/g, "-")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  // Copy Code Snippet
  const handleCopyCode = () => {
    const snippet = `/* Particle Text Physics Renderer Snippet */
const text = "${text}";
const palette = ${JSON.stringify(currentPalette.colors)};
const physicsMode = "${physicsMode}";
// Render using HTML5 Canvas & RequestAnimationFrame
console.log("Rendering " + text + " with " + palette.length + " neon colors!");`;
    navigator.clipboard.writeText(snippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 my-10 font-sans">
      {/* Container Box */}
      <div className={`relative rounded-3xl bg-slate-900/90 backdrop-blur-xl border ${currentPalette.border} shadow-2xl overflow-hidden text-slate-100 transition-colors duration-500`}>
        
        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-xl shadow-lg shadow-cyan-500/20">
              ✨
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  Particle Text & Physics Studio
                </h2>
                <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${currentPalette.badge}`}>
                  v2.0 FX Engine
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Transform live typography into interactive physical particles with shockwaves and force fields
              </p>
            </div>
          </div>

          {/* Top Quick Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => triggerShockwave()}
              className="px-3.5 py-2 text-xs font-medium bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-xl shadow-lg shadow-pink-500/25 transition-all transform active:scale-95 flex items-center space-x-1.5"
            >
              <span>💥 Shockwave</span>
            </button>
            <button
              onClick={initParticles}
              className="px-3.5 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition-all flex items-center space-x-1.5"
            >
              <span>🔄 Reset</span>
            </button>
            <button
              onClick={handleDownloadSnapshot}
              className="px-3.5 py-2 text-xs font-medium bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center space-x-1.5"
            >
              <span>📸 Snapshot</span>
            </button>
          </div>
        </div>

        {/* Main Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          
          {/* Main Canvas Viewport (Col 8) */}
          <div className="lg:col-span-8 p-4 sm:p-6 bg-black/40 flex flex-col justify-between relative border-b lg:border-b-0 lg:border-r border-slate-800">
            
            {/* Quick Text Presets Bar */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-3 scrollbar-none">
              <span className="text-xs font-medium text-slate-400 whitespace-nowrap">Quick Presets:</span>
              {QUICK_TEXT_PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setText(preset)}
                  className={`px-2.5 py-1 text-xs rounded-lg transition-all whitespace-nowrap ${
                    text === preset
                      ? "bg-slate-700 text-cyan-300 font-bold border border-cyan-500/50"
                      : "bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>

            {/* Interactive Canvas Container */}
            <div className="relative w-full h-[360px] sm:h-[440px] rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-inner group">
              <canvas
                ref={canvasRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={handleCanvasClick}
                className="w-full h-full cursor-crosshair block"
              />
              
              {/* Overlay Interactive Hint */}
              <div className="absolute bottom-3 left-3 pointer-events-none px-3 py-1.5 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[11px] text-slate-400 flex items-center space-x-2">
                <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>Move cursor to interact • Click canvas for shockwave explosion</span>
              </div>

              {/* Live Canvas Metrics */}
              <div className="absolute top-3 right-3 pointer-events-none flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-md border border-slate-800 text-[11px] text-slate-300 font-mono">
                  Particles: {particleCount.toLocaleString()}
                </span>
                <span className="px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-md border border-slate-800 text-[11px] text-emerald-400 font-mono">
                  {fps} FPS
                </span>
              </div>
            </div>

            {/* Live Text Input & Font Picker */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-8">
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Custom Typography Input
                </label>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value.toUpperCase())}
                  maxLength={20}
                  placeholder="TYPE ANYTHING..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono text-sm tracking-wider"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Font Family
                </label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500 text-sm"
                >
                  {Object.values(FONT_FAMILIES).map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

          </div>

          {/* Control Studio Sidebar (Col 4) */}
          <div className="lg:col-span-4 p-5 sm:p-6 space-y-6 bg-slate-900/50">
            
            {/* Palette Selection */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                Color Palette Theme
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(PALETTES).map((pal) => (
                  <button
                    key={pal.id}
                    onClick={() => setPaletteId(pal.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      paletteId === pal.id
                        ? `bg-slate-800 ${pal.border} ring-1 ring-cyan-500/50`
                        : "bg-slate-950/40 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center space-x-1 mb-1.5">
                      {pal.colors.map((c, i) => (
                        <span
                          key={i}
                          className="w-3 h-3 rounded-full shadow-sm"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-medium text-slate-200 block truncate">
                      {pal.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Physics Mode Selection */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                Physics Dynamics
              </h3>
              <div className="space-y-1.5">
                {Object.values(PHYSICS_MODES).map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setPhysicsMode(mode.id)}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                      physicsMode === mode.id
                        ? "bg-gradient-to-r from-slate-800 to-slate-850 border-cyan-500/50 text-cyan-300 shadow-md"
                        : "bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="text-lg">{mode.icon}</span>
                      <div>
                        <div className="text-xs font-bold">{mode.name}</div>
                        <div className="text-[10px] text-slate-400 line-clamp-1">{mode.desc}</div>
                      </div>
                    </div>
                    {physicsMode === mode.id && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders & Physics Parameters */}
            <div className="space-y-4 pt-2 border-t border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Particle Parameters
              </h3>

              {/* Density Slider */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Particle Density</span>
                  <span className="text-cyan-400 font-mono">{12 - density}x</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="8"
                  step="1"
                  value={density}
                  onChange={(e) => setDensity(Number(e.target.value))}
                  className="w-full accent-cyan-500 bg-slate-950 rounded-lg cursor-pointer h-1.5"
                />
              </div>

              {/* Force Radius */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Mouse Force Radius</span>
                  <span className="text-cyan-400 font-mono">{forceRadius}px</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="250"
                  step="10"
                  value={forceRadius}
                  onChange={(e) => setForceRadius(Number(e.target.value))}
                  className="w-full accent-cyan-500 bg-slate-950 rounded-lg cursor-pointer h-1.5"
                />
              </div>

              {/* Stiffness (Spring Return Speed) */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Spring Stiffness</span>
                  <span className="text-cyan-400 font-mono">{Math.round(stiffness * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.02"
                  max="0.2"
                  step="0.01"
                  value={stiffness}
                  onChange={(e) => setStiffness(Number(e.target.value))}
                  className="w-full accent-cyan-500 bg-slate-950 rounded-lg cursor-pointer h-1.5"
                />
              </div>

              {/* Damping (Friction) */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Friction & Damping</span>
                  <span className="text-cyan-400 font-mono">{Math.round(damping * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.75"
                  max="0.96"
                  step="0.01"
                  value={damping}
                  onChange={(e) => setDamping(Number(e.target.value))}
                  className="w-full accent-cyan-500 bg-slate-950 rounded-lg cursor-pointer h-1.5"
                />
              </div>

              {/* Glow Intensity */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Glow Intensity</span>
                  <span className="text-cyan-400 font-mono">{glowIntensity}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="35"
                  step="5"
                  value={glowIntensity}
                  onChange={(e) => setGlowIntensity(Number(e.target.value))}
                  className="w-full accent-cyan-500 bg-slate-950 rounded-lg cursor-pointer h-1.5"
                />
              </div>
            </div>

            {/* Display Toggles */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                <span>Constellation Lines</span>
                <input
                  type="checkbox"
                  checked={connectLines}
                  onChange={(e) => setConnectLines(e.target.checked)}
                  className="w-4 h-4 rounded accent-cyan-500 bg-slate-950 border-slate-800"
                />
              </label>
              <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                <span>Background Grid</span>
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className="w-4 h-4 rounded accent-cyan-500 bg-slate-950 border-slate-800"
                />
              </label>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 border-t border-slate-800 flex space-x-2">
              <button
                onClick={() => setShowCodeModal(true)}
                className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-all flex items-center justify-center space-x-2"
              >
                <span>💻 Export Code Snippet</span>
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* Code Export Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center justify-between">
              <span>Canvas Physics Snippet</span>
              <button
                onClick={() => setShowCodeModal(false)}
                className="text-slate-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Integrate this particle engine configuration into your web application canvas.
            </p>
            <pre className="bg-black/90 p-4 rounded-xl text-xs text-emerald-400 font-mono overflow-x-auto border border-slate-800 max-h-60">
              {`// Particle Typography Config
const text = "${text}";
const colors = ${JSON.stringify(currentPalette.colors)};
const config = {
  stiffness: ${stiffness},
  damping: ${damping},
  forceRadius: ${forceRadius},
  glowIntensity: ${glowIntensity},
  physicsMode: "${physicsMode}"
};`}
            </pre>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={handleCopyCode}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-cyan-500/20 transition-all"
              >
                {copiedCode ? "✓ Copied!" : "Copy Snippet"}
              </button>
              <button
                onClick={() => setShowCodeModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
