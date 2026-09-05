import React, { useState, useEffect, useRef, useCallback } from "react";

// Visual themes for the 4D visualizer
const THEMES = {
  cyber: {
    id: "cyber",
    name: "Cyber Neon",
    bgGradient: "from-slate-950 via-purple-950 to-slate-900",
    canvasBg: "rgba(3, 7, 18, ",
    primary: "#00f3ff",
    secondary: "#ff00aa",
    tertiary: "#9d4edd",
    accentText: "text-cyan-400",
    accentBorder: "border-cyan-500/40",
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    buttonActive: "bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/30",
  },
  cosmos: {
    id: "cosmos",
    name: "Deep Cosmos",
    bgGradient: "from-slate-950 via-indigo-950 to-purple-950",
    canvasBg: "rgba(7, 9, 20, ",
    primary: "#a855f7",
    secondary: "#3b82f6",
    tertiary: "#ec4899",
    accentText: "text-purple-400",
    accentBorder: "border-purple-500/40",
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    buttonActive: "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30",
  },
  solar: {
    id: "solar",
    name: "Solar Quantum",
    bgGradient: "from-amber-950 via-slate-950 to-orange-950",
    canvasBg: "rgba(12, 7, 2, ",
    primary: "#fbbf24",
    secondary: "#f97316",
    tertiary: "#ef4444",
    accentText: "text-amber-400",
    accentBorder: "border-amber-500/40",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    buttonActive: "bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-600/30",
  },
  emerald: {
    id: "emerald",
    name: "Matrix Emerald",
    bgGradient: "from-emerald-950 via-slate-950 to-teal-950",
    canvasBg: "rgba(2, 13, 9, ",
    primary: "#10b981",
    secondary: "#84cc16",
    tertiary: "#06b6d4",
    accentText: "text-emerald-400",
    accentBorder: "border-emerald-500/40",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    buttonActive: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30",
  },
};

// 4D Regular Polytopes
const POLYTOPES = {
  tesseract: {
    id: "tesseract",
    name: "4D Tesseract (8-Cell)",
    desc: "16 vertices, 32 hyper-edges forming 8 cubic 3D faces bound in 4D space.",
    getGeometry: () => {
      const vertices = [];
      for (let x of [-1, 1]) {
        for (let y of [-1, 1]) {
          for (let z of [-1, 1]) {
            for (let w of [-1, 1]) {
              vertices.push([x, y, z, w]);
            }
          }
        }
      }
      const edges = [];
      for (let i = 0; i < vertices.length; i++) {
        for (let j = i + 1; j < vertices.length; j++) {
          let diffCount = 0;
          for (let k = 0; k < 4; k++) {
            if (vertices[i][k] !== vertices[j][k]) diffCount++;
          }
          if (diffCount === 1) edges.push([i, j]);
        }
      }
      return { vertices, edges };
    },
  },
  pentachoron: {
    id: "pentachoron",
    name: "5-Cell Hypertetrahedron",
    desc: "Simpler 4D simplex with 5 vertices & 10 edges. The 4D equivalent of a triangle/tetrahedron.",
    getGeometry: () => {
      const s = 1 / Math.sqrt(5);
      const vertices = [
        [1, 1, 1, -s],
        [-1, -1, 1, -s],
        [-1, 1, -1, -s],
        [1, -1, -1, -s],
        [0, 0, 0, Math.sqrt(5) - s],
      ];
      const edges = [];
      for (let i = 0; i < vertices.length; i++) {
        for (let j = i + 1; j < vertices.length; j++) {
          edges.push([i, j]);
        }
      }
      return { vertices, edges };
    },
  },
  hexadecachoron: {
    id: "hexadecachoron",
    name: "16-Cell Hyperoctahedron",
    desc: "8 vertices on the 4D axes with 24 triangular faces & 16 tetrahedral cells.",
    getGeometry: () => {
      const vertices = [
        [1.6, 0, 0, 0],
        [-1.6, 0, 0, 0],
        [0, 1.6, 0, 0],
        [0, -1.6, 0, 0],
        [0, 0, 1.6, 0],
        [0, 0, -1.6, 0],
        [0, 0, 0, 1.6],
        [0, 0, 0, -1.6],
      ];
      const edges = [];
      for (let i = 0; i < vertices.length; i++) {
        for (let j = i + 1; j < vertices.length; j++) {
          // Connect if not opposite poles
          if (i % 2 === 0 && j === i + 1) continue;
          edges.push([i, j]);
        }
      }
      return { vertices, edges };
    },
  },
  icositetrachoron: {
    id: "icositetrachoron",
    name: "24-Cell Self-Dual Engine",
    desc: "Unique to 4D space! 24 vertices & 96 edges. Displays exceptional hyper-symmetry.",
    getGeometry: () => {
      const vertices = [];
      // 8 axis vertices
      const r = 1.5;
      vertices.push([r, 0, 0, 0], [-r, 0, 0, 0]);
      vertices.push([0, r, 0, 0], [0, -r, 0, 0]);
      vertices.push([0, 0, r, 0], [0, 0, -r, 0]);
      vertices.push([0, 0, 0, r], [0, 0, 0, -r]);
      // 16 hypercube vertices scaled
      const h = 0.75;
      for (let x of [-h, h]) {
        for (let y of [-h, h]) {
          for (let z of [-h, h]) {
            for (let w of [-h, h]) {
              vertices.push([x, y, z, w]);
            }
          }
        }
      }
      const edges = [];
      const threshold = 1.55;
      for (let i = 0; i < vertices.length; i++) {
        for (let j = i + 1; j < vertices.length; j++) {
          let distSq = 0;
          for (let k = 0; k < 4; k++) {
            distSq += (vertices[i][k] - vertices[j][k]) ** 2;
          }
          if (Math.sqrt(distSq) <= threshold) {
            edges.push([i, j]);
          }
        }
      }
      return { vertices, edges };
    },
  },
};

// Presets
const PRESETS = {
  hyperFolding: {
    id: "hyperFolding",
    name: "Hyper-Space Folding",
    polytope: "tesseract",
    speedXW: 0.015,
    speedYW: 0.02,
    speedZW: 0.01,
    speedXY: 0.005,
    camDist4D: 3.2,
    sliceMode: false,
  },
  icosiMatrix: {
    id: "icosiMatrix",
    name: "24-Cell Quantum Resonance",
    polytope: "icositetrachoron",
    speedXW: 0.008,
    speedYW: 0.012,
    speedZW: 0.018,
    speedXY: 0.01,
    camDist4D: 3.8,
    sliceMode: false,
  },
  hyperSlicing: {
    id: "hyperSlicing",
    name: "3D Hyperplane Slicing",
    polytope: "tesseract",
    speedXW: 0.022,
    speedYW: 0.005,
    speedZW: 0.015,
    speedXY: 0.008,
    camDist4D: 3.0,
    sliceMode: true,
  },
  simplexCascade: {
    id: "simplexCascade",
    name: "5-Cell Simplex Tumbler",
    polytope: "pentachoron",
    speedXW: 0.025,
    speedYW: 0.018,
    speedZW: 0.02,
    speedXY: 0.015,
    camDist4D: 2.8,
    sliceMode: false,
  },
};

const HyperdimensionalTesseractStudio = () => {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const audioCtxRef = useRef(null);
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });

  // Visual & Polytope State
  const [theme, setTheme] = useState("cyber");
  const [activePolytopeKey, setActivePolytopeKey] = useState("tesseract");
  const [activePreset, setActivePreset] = useState("hyperFolding");
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Rotation rates & Perspective sliders
  const [speedXW, setSpeedXW] = useState(0.015);
  const [speedYW, setSpeedYW] = useState(0.02);
  const [speedZW, setSpeedZW] = useState(0.01);
  const [speedXY, setSpeedXY] = useState(0.005);
  const [camDist4D, setCamDist4D] = useState(3.2);
  const [nodeSize, setNodeSize] = useState(4);
  const [trailOpacity, setTrailOpacity] = useState(0.25);
  const [sliceMode, setSliceMode] = useState(false);
  const [sliceOffset, setSliceOffset] = useState(0.0);

  // Rotation Angles
  const anglesRef = useRef({
    xw: 0,
    yw: 0,
    zw: 0,
    xy: 0,
    xz: 0,
    yz: 0,
  });

  // Telemetry metrics
  const [fps, setFps] = useState(60);
  const [wDispersion, setWDispersion] = useState(0);
  const [hyperVolumeMetric, setHyperVolumeMetric] = useState(1.0);
  const fpsTrackerRef = useRef({ frames: 0, lastTime: performance.now() });

  const currentTheme = THEMES[theme] || THEMES.cyber;
  const currentPolytope = POLYTOPES[activePolytopeKey] || POLYTOPES.tesseract;

  // Toggle Audio Synthesizer
  const toggleSound = () => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtxRef.current = new AudioContext();
      }
    }
    if (audioCtxRef.current) {
      if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }
    }
    setSoundEnabled((prev) => !prev);
  };

  // Play subtle harmonic audio feedback based on 4D vertex positions
  const playHyperSound = useCallback((meanW) => {
    if (!soundEnabled || !audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Pentatonic frequency scale mapping
      const baseFreq = 220; // A3
      const scaleSteps = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21];
      const stepIndex = Math.min(
        scaleSteps.length - 1,
        Math.max(0, Math.floor(((meanW + 1.5) / 3.0) * scaleSteps.length))
      );
      const semitone = scaleSteps[stepIndex];
      const freq = baseFreq * Math.pow(2, semitone / 12);

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } catch (e) {
      // Ignore web audio edge errors
    }
  }, [soundEnabled]);

  // Load Preset
  const handleSelectPreset = (key) => {
    const p = PRESETS[key];
    if (!p) return;
    setActivePreset(key);
    setActivePolytopeKey(p.polytope);
    setSpeedXW(p.speedXW);
    setSpeedYW(p.speedYW);
    setSpeedZW(p.speedZW);
    setSpeedXY(p.speedXY);
    setCamDist4D(p.camDist4D);
    setSliceMode(p.sliceMode);
  };

  // Reset 4D angles
  const handleResetAngles = () => {
    anglesRef.current = { xw: 0, yw: 0, zw: 0, xy: 0, xz: 0, yz: 0 };
  };

  // Mouse / Touch handlers for 4D Orbiting
  const handlePointerDown = (e) => {
    isDraggingRef.current = true;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    lastMouseRef.current = { x: clientX, y: clientY };
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const dx = clientX - lastMouseRef.current.x;
    const dy = clientY - lastMouseRef.current.y;

    anglesRef.current.xw += dx * 0.008;
    anglesRef.current.yw += dy * 0.008;

    lastMouseRef.current = { x: clientX, y: clientY };
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // Snapshot / Export PNG
  const handleExportSnapshot = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `tesseract-4d-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  // Main Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resizeCanvas = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const { vertices: rawVertices, edges } = currentPolytope.getGeometry();

    const render = () => {
      const now = performance.now();
      fpsTrackerRef.current.frames++;
      if (now - fpsTrackerRef.current.lastTime >= 1000) {
        setFps(fpsTrackerRef.current.frames);
        fpsTrackerRef.current.frames = 0;
        fpsTrackerRef.current.lastTime = now;
      }

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      // Motion Trail Clear
      ctx.fillStyle = `${currentTheme.canvasBg}${trailOpacity})`;
      ctx.fillRect(0, 0, width, height);

      // Update angles if not paused
      if (!isPaused) {
        anglesRef.current.xw += speedXW;
        anglesRef.current.yw += speedYW;
        anglesRef.current.zw += speedZW;
        anglesRef.current.xy += speedXY;
      }

      const angles = anglesRef.current;

      // Precalculate trig values
      const cosXW = Math.cos(angles.xw), sinXW = Math.sin(angles.xw);
      const cosYW = Math.cos(angles.yw), sinYW = Math.sin(angles.yw);
      const cosZW = Math.cos(angles.zw), sinZW = Math.sin(angles.zw);
      const cosXY = Math.cos(angles.xy), sinXY = Math.sin(angles.xy);

      let wSum = 0;
      let wMax = -999;
      let wMin = 999;

      // Transform 4D vertices & project to 3D and 2D
      const projected = rawVertices.map(([x0, y0, z0, w0]) => {
        // 1. Rotate in XW plane
        let x1 = x0 * cosXW - w0 * sinXW;
        let w1 = x0 * sinXW + w0 * cosXW;

        // 2. Rotate in YW plane
        let y2 = y0 * cosYW - w1 * sinYW;
        let w2 = y0 * sinYW + w1 * cosYW;

        // 3. Rotate in ZW plane
        let z3 = z0 * cosZW - w2 * sinZW;
        let w3 = z0 * sinZW + w2 * cosZW;

        // 4. Rotate in XY plane (3D orientation)
        let x4 = x1 * cosXY - y2 * sinXY;
        let y4 = x1 * sinXY + y2 * cosXY;
        let z4 = z3;

        wSum += w3;
        if (w3 > wMax) wMax = w3;
        if (w3 < wMin) wMin = w3;

        // Perspective projection from 4D to 3D
        // scale4D = 1 / (camDist4D - w3)
        const d4 = Math.max(1.2, camDist4D - w3);
        const scale4 = 1 / d4;

        const x3d = x4 * scale4;
        const y3d = y4 * scale4;
        const z3d = z4 * scale4;

        // Perspective projection from 3D to 2D screen
        const d3 = 3.5 - z3d * 0.4;
        const scale2d = (Math.min(width, height) * 0.42) / d3;

        const px = centerX + x3d * scale2d;
        const py = centerY + y3d * scale2d;

        return { px, py, w3, scale4, x3d, y3d, z3d };
      });

      // Update telemetry state periodically
      const meanW = wSum / projected.length;
      const dispersion = ((wMax - wMin) / 2).toFixed(2);
      setWDispersion(dispersion);
      setHyperVolumeMetric((1 + meanW * 0.2).toFixed(3));

      if (Math.random() < 0.05) {
        playHyperSound(meanW);
      }

      // Render Hyperplane Slice guide if enabled
      if (sliceMode) {
        ctx.save();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(centerX, centerY, Math.min(width, height) * 0.35, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Draw Hyper-Edges
      edges.forEach(([i, j]) => {
        const p1 = projected[i];
        const p2 = projected[j];

        // Average W-depth for depth colorization
        const avgW = (p1.w3 + p2.w3) / 2;
        const depthFactor = (avgW + 1.8) / 3.6; // normalized 0 to 1

        // Interpolate stroke color based on theme
        ctx.beginPath();
        ctx.moveTo(p1.px, p1.py);
        ctx.lineTo(p2.px, p2.py);

        const gradient = ctx.createLinearGradient(p1.px, p1.py, p2.px, p2.py);
        gradient.addColorStop(0, depthFactor > 0.5 ? currentTheme.primary : currentTheme.secondary);
        gradient.addColorStop(1, depthFactor > 0.5 ? currentTheme.tertiary : currentTheme.primary);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = Math.max(0.8, (p1.scale4 + p2.scale4) * 1.8);
        ctx.globalAlpha = Math.min(1, Math.max(0.2, depthFactor + 0.2));
        ctx.stroke();
        ctx.globalAlpha = 1.0;

        // Highlight 3D Hyperplane slice intersections
        if (sliceMode) {
          const wDiff = Math.abs(avgW - sliceOffset);
          if (wDiff < 0.25) {
            ctx.beginPath();
            ctx.arc((p1.px + p2.px) / 2, (p1.py + p2.py) / 2, 4, 0, Math.PI * 2);
            ctx.fillStyle = "#ffffff";
            ctx.shadowColor = currentTheme.primary;
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      });

      // Draw 4D Glowing Vertices
      projected.forEach((p) => {
        const nodeR = Math.max(2, nodeSize * p.scale4 * 1.5);
        ctx.beginPath();
        ctx.arc(p.px, p.py, nodeR, 0, Math.PI * 2);

        ctx.fillStyle = p.w3 > 0 ? currentTheme.primary : currentTheme.secondary;
        ctx.shadowColor = currentTheme.primary;
        ctx.shadowBlur = p.w3 > 0 ? 12 : 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [
    currentPolytope,
    currentTheme,
    isPaused,
    speedXW,
    speedYW,
    speedZW,
    speedXY,
    camDist4D,
    nodeSize,
    trailOpacity,
    sliceMode,
    sliceOffset,
    playHyperSound,
  ]);

  return (
    <div
      className={`w-full max-w-6xl mx-auto my-10 p-6 md:p-8 rounded-3xl bg-gradient-to-br ${currentTheme.bgGradient} border border-slate-800/80 shadow-2xl backdrop-blur-xl relative overflow-hidden font-sans text-slate-100 transition-all duration-500`}
    >
      {/* Background Decorative Ambient Glows */}
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

      {/* Main Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800/80 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border ${currentTheme.badge}`}>
              4D Physics Studio
            </span>
            <span className="text-xs font-mono text-slate-400">v4.2 Hyper-Projection</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Hyperdimensional Tesseract Studio
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-2xl">
            Visualize four-dimensional regular polytopes rotated across 4D orthogonal hyper-planes ($XW, YW, ZW$) projected into 3D and 2D space.
          </p>
        </div>

        {/* Action Controls & Theme Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Theme Selector */}
          <div className="flex p-1 bg-slate-900/80 rounded-xl border border-slate-800/80">
            {Object.values(THEMES).map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  theme === t.id ? `${t.buttonActive}` : "text-slate-400 hover:text-white"
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
              soundEnabled
                ? `${currentTheme.buttonActive} border-transparent`
                : "bg-slate-900/80 text-slate-400 hover:text-white border-slate-800"
            }`}
          >
            <span>{soundEnabled ? "🔊 Synth ON" : "🔇 Synth OFF"}</span>
          </button>

          {/* Pause / Play */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-all"
          >
            {isPaused ? "▶ Resume" : "⏸ Pause"}
          </button>

          {/* Reset Angles */}
          <button
            onClick={handleResetAngles}
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-all"
          >
            ↺ Reset
          </button>

          {/* Export Snapshot */}
          <button
            onClick={handleExportSnapshot}
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all shadow-md"
          >
            📷 Export
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

      {/* Polytope Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
        {Object.values(POLYTOPES).map((poly) => (
          <button
            key={poly.id}
            onClick={() => {
              setActivePolytopeKey(poly.id);
              setActivePreset("");
            }}
            className={`p-3 rounded-2xl border text-left transition-all ${
              activePolytopeKey === poly.id
                ? `${currentTheme.badge} border border-current shadow-lg`
                : "bg-slate-900/40 border-slate-800/80 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
            }`}
          >
            <div className="text-xs font-bold text-slate-200 mb-0.5">{poly.name}</div>
            <div className="text-[11px] text-slate-400 line-clamp-2 leading-tight">{poly.desc}</div>
          </button>
        ))}
      </div>

      {/* Interactive 4D Canvas Container */}
      <div className="relative w-full h-[420px] sm:h-[500px] rounded-2xl overflow-hidden border border-slate-800/80 shadow-inner group bg-slate-950">
        <canvas
          ref={canvasRef}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
          className="w-full h-full cursor-grab active:cursor-grabbing block"
        />

        {/* Live Telemetry Overlay */}
        <div className="absolute top-4 left-4 flex flex-col gap-1.5 p-3 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800/80 text-xs font-mono pointer-events-none">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>FPS: {fps}</span>
          </div>
          <div className="text-slate-400">
            Active Geometry: <span className={currentTheme.accentText}>{currentPolytope.name.split(" ")[0]}</span>
          </div>
          <div className="text-slate-400">
            W-Dispersion Index: <span className="text-slate-200">Δw = {wDispersion}</span>
          </div>
          <div className="text-slate-400">
            Relative Hyper-Volume: <span className="text-slate-200">V₄ = {hyperVolumeMetric}</span>
          </div>
        </div>

        {/* Drag Hint Overlay */}
        <div className="absolute bottom-4 right-4 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800/80 text-[11px] text-slate-400 font-mono pointer-events-none">
          💡 Drag cursor to interactively rotate 4D XW / YW angles
        </div>
      </div>

      {/* Control Sliders Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {/* XW Hyper-Rotation Rate */}
        <div className="bg-slate-900/70 backdrop-blur-md p-4 rounded-2xl border border-slate-800/80">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-semibold text-slate-300">XW Rotation Speed (ω_xw)</label>
            <span className="text-xs font-mono text-cyan-400">{speedXW.toFixed(3)} rad/f</span>
          </div>
          <input
            type="range"
            min="0"
            max="0.05"
            step="0.001"
            value={speedXW}
            onChange={(e) => setSpeedXW(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {/* YW Hyper-Rotation Rate */}
        <div className="bg-slate-900/70 backdrop-blur-md p-4 rounded-2xl border border-slate-800/80">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-semibold text-slate-300">YW Rotation Speed (ω_yw)</label>
            <span className="text-xs font-mono text-purple-400">{speedYW.toFixed(3)} rad/f</span>
          </div>
          <input
            type="range"
            min="0"
            max="0.05"
            step="0.001"
            value={speedYW}
            onChange={(e) => setSpeedYW(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
          />
        </div>

        {/* ZW Hyper-Rotation Rate */}
        <div className="bg-slate-900/70 backdrop-blur-md p-4 rounded-2xl border border-slate-800/80">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-semibold text-slate-300">ZW Rotation Speed (ω_zw)</label>
            <span className="text-xs font-mono text-amber-400">{speedZW.toFixed(3)} rad/f</span>
          </div>
          <input
            type="range"
            min="0"
            max="0.05"
            step="0.001"
            value={speedZW}
            onChange={(e) => setSpeedZW(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
        </div>

        {/* 4D Camera Perspective Distance */}
        <div className="bg-slate-900/70 backdrop-blur-md p-4 rounded-2xl border border-slate-800/80">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-semibold text-slate-300">4D Hyper-Camera Distance (d_4)</label>
            <span className="text-xs font-mono text-emerald-400">{camDist4D.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="1.8"
            max="6.0"
            step="0.1"
            value={camDist4D}
            onChange={(e) => setCamDist4D(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
          />
        </div>

        {/* Motion Trail Fade */}
        <div className="bg-slate-900/70 backdrop-blur-md p-4 rounded-2xl border border-slate-800/80">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-semibold text-slate-300">Motion Trail Persistence</label>
            <span className="text-xs font-mono text-fuchsia-400">{Math.round((1 - trailOpacity) * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.05"
            max="0.8"
            step="0.05"
            value={trailOpacity}
            onChange={(e) => setTrailOpacity(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-fuchsia-400"
          />
        </div>

        {/* Vertex Particle Scale */}
        <div className="bg-slate-900/70 backdrop-blur-md p-4 rounded-2xl border border-slate-800/80">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-semibold text-slate-300">Vertex Glow Size</label>
            <span className="text-xs font-mono text-sky-400">{nodeSize} px</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={nodeSize}
            onChange={(e) => setNodeSize(parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
          />
        </div>
      </div>

      {/* Slicing Controls & Science Section */}
      <div className="mt-6 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSliceMode(!sliceMode)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              sliceMode
                ? `${currentTheme.buttonActive} border-transparent`
                : "bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white"
            }`}
          >
            {sliceMode ? "✦ 3D Slice Mode Active" : "✧ Enable 3D Slice Mode"}
          </button>

          {sliceMode && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Slice W-Offset:</span>
              <input
                type="range"
                min="-1.5"
                max="1.5"
                step="0.05"
                value={sliceOffset}
                onChange={(e) => setSliceOffset(parseFloat(e.target.value))}
                className="w-28 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <span className="text-xs font-mono text-cyan-400">{sliceOffset.toFixed(2)}</span>
            </div>
          )}
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Mathematics: <span className="text-slate-300">P₃D = P₄D / (d₄ - w₃)</span> | Rotations in 6 planes (XY, XZ, XW, YZ, YW, ZW)
        </div>
      </div>
    </div>
  );
};

export default HyperdimensionalTesseractStudio;
