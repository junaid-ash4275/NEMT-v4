import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const PALETTES = {
  cyber: {
    name: 'Neon Cyber',
    colors: ['#00f0ff', '#7000ff', '#ff007b', '#00ff66', '#00f0ff'],
  },
  rainbow: {
    name: 'Electric Rainbow',
    colors: ['#ff0055', '#ff9900', '#33cc33', '#0099ff', '#cc00ff', '#ff0055'],
  },
  sunset: {
    name: 'Gold Sunset',
    colors: ['#ffe600', '#ff5900', '#ff0055', '#9900ff', '#ffe600'],
  },
  aurora: {
    name: 'Emerald Aurora',
    colors: ['#00ffaa', '#00e5ff', '#0077ff', '#7000ff', '#00ffaa'],
  },
  space: {
    name: 'Deep Space',
    colors: ['#8a2be2', '#da70d6', '#00bfff', '#1e90ff', '#8a2be2'],
  },
  silver: {
    name: 'Monochromatic Ice',
    colors: ['#ffffff', '#a0c4ff', '#cbd5e1', '#64748b', '#ffffff'],
  },
};

const PRESETS = [
  {
    name: 'Cosmic Rose',
    type: 'hypo',
    R: 150,
    r: 90,
    p: 85,
    palette: 'cyber',
    lineWidth: 2,
    glow: 12,
  },
  {
    name: 'Quantum Vortex',
    type: 'hypo',
    R: 180,
    r: 42,
    p: 95,
    palette: 'rainbow',
    lineWidth: 1.5,
    glow: 15,
  },
  {
    name: 'Neon Starburst',
    type: 'epi',
    R: 100,
    r: 40,
    p: 80,
    palette: 'sunset',
    lineWidth: 2,
    glow: 18,
  },
  {
    name: 'Cyber Flower',
    type: 'hypo',
    R: 160,
    r: 100,
    p: 70,
    palette: 'aurora',
    lineWidth: 2.5,
    glow: 10,
  },
  {
    name: 'Hypnotic Matrix',
    type: 'epi',
    R: 140,
    r: 35,
    p: 110,
    palette: 'space',
    lineWidth: 1.8,
    glow: 14,
  },
];

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));

const SpirographStudio = () => {
  const canvasRef = useRef(null);

  // Spirograph Parameters
  const [curveType, setCurveType] = useState('hypo'); // 'hypo' or 'epi'
  const [R, setR] = useState(150);
  const [r, setRSub] = useState(90);
  const [p, setP] = useState(85);
  const [paletteKey, setPaletteKey] = useState('cyber');
  const [lineWidth, setLineWidth] = useState(2);
  const [glow, setGlow] = useState(12);
  const [speed, setSpeed] = useState(120); // points calculated per frame

  // Animation & Control State
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0); // 0 to 1
  const [layers, setLayers] = useState([]);
  const [activeTab, setActiveTab] = useState('params'); // 'params', 'presets', 'layers', 'svg'
  const [copiedSVG, setCopiedSVG] = useState(false);

  const animRef = useRef(null);
  const currentStepRef = useRef(0);

  // Compute total theta limit to close loop
  const totalTheta = useMemo(() => {
    const rInt = Math.round(r);
    const RInt = Math.round(R);
    if (rInt <= 0 || RInt <= 0) return 2 * Math.PI;
    const common = gcd(RInt, rInt);
    const loops = rInt / common;
    return 2 * Math.PI * loops;
  }, [R, r]);

  // Total steps for complete drawing
  const totalSteps = useMemo(() => {
    return Math.max(500, Math.floor(totalTheta * 80));
  }, [totalTheta]);

  // Compute point (x, y) for a given theta angle
  const getPoint = useCallback(
    (theta) => {
      let x, y;
      if (curveType === 'hypo') {
        const diff = R - r;
        x = diff * Math.cos(theta) + p * Math.cos((diff / r) * theta);
        y = diff * Math.sin(theta) - p * Math.sin((diff / r) * theta);
      } else {
        const sum = R + r;
        x = sum * Math.cos(theta) - p * Math.cos((sum / r) * theta);
        y = sum * Math.sin(theta) - p * Math.sin((sum / r) * theta);
      }
      return { x, y };
    },
    [curveType, R, r, p]
  );

  // Generate SVG String for active spirograph + layers
  const generateSVGString = useCallback(() => {
    const width = 600;
    const height = 600;
    const cx = width / 2;
    const cy = height / 2;

    const renderLayerPath = (layer) => {
      const { type, R: lR, r: lr, p: lp, palette, lineWidth: lW } = layer;
      const rInt = Math.round(lr);
      const RInt = Math.round(lR);
      const common = gcd(RInt > 0 ? RInt : 1, rInt > 0 ? rInt : 1);
      const loops = rInt / common;
      const tMax = 2 * Math.PI * loops;
      const steps = Math.max(500, Math.floor(tMax * 80));

      let d = '';
      for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * tMax;
        let x, y;
        if (type === 'hypo') {
          const diff = lR - lr;
          x = cx + diff * Math.cos(t) + lp * Math.cos((diff / lr) * t);
          y = cy + diff * Math.sin(t) - lp * Math.sin((diff / lr) * t);
        } else {
          const sum = lR + lr;
          x = cx + sum * Math.cos(t) - lp * Math.cos((sum / lr) * t);
          y = cy + sum * Math.sin(t) - lp * Math.sin((sum / lr) * t);
        }
        d += i === 0 ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
      }

      const colors = PALETTES[palette]?.colors || PALETTES.cyber.colors;
      const gradId = `grad-${Math.random().toString(36).substring(2, 7)}`;
      const stops = colors
        .map((c, idx) => `<stop offset="${(idx / (colors.length - 1)) * 100}%" stop-color="${c}" />`)
        .join('');

      return {
        defs: `<linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">${stops}</linearGradient>`,
        path: `<path d="${d}" fill="none" stroke="url(#${gradId})" stroke-width="${lW}" stroke-linejoin="round" stroke-linecap="round" />`,
      };
    };

    const allLayers = [
      ...layers,
      { type: curveType, R, r, p, palette: paletteKey, lineWidth, glow },
    ];

    const rendered = allLayers.map(renderLayerPath);
    const defsContent = rendered.map((r) => r.defs).join('\n  ');
    const pathsContent = rendered.map((r) => r.path).join('\n  ');

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="background-color: #0b0f19;">
  <defs>
  ${defsContent}
  </defs>
  ${pathsContent}
</svg>`;
  }, [layers, curveType, R, r, p, paletteKey, lineWidth, glow]);

  // Main Canvas Rendering Loop
  const drawCanvas = useCallback(
    (targetStep = currentStepRef.current) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Background radial glow
      const bgGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, width / 1.8);
      bgGrad.addColorStop(0, 'rgba(15, 23, 42, 0.95)');
      bgGrad.addColorStop(1, 'rgba(5, 8, 18, 1)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw Grid overlay
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      const gridSpacing = 40;
      for (let x = 0; x < width; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.restore();

      // Render Saved Layers first
      layers.forEach((layer) => {
        const { type, R: lR, r: lr, p: lp, palette, lineWidth: lW, glow: lGlow } = layer;
        const rInt = Math.round(lr);
        const RInt = Math.round(lR);
        const common = gcd(RInt > 0 ? RInt : 1, rInt > 0 ? rInt : 1);
        const tMax = 2 * Math.PI * (rInt / common);
        const steps = Math.max(500, Math.floor(tMax * 80));

        ctx.save();
        ctx.translate(cx, cy);

        const colors = PALETTES[palette]?.colors || PALETTES.cyber.colors;
        const gradient = ctx.createLinearGradient(-150, -150, 150, 150);
        colors.forEach((c, idx) => {
          gradient.addColorStop(idx / (colors.length - 1), c);
        });

        ctx.strokeStyle = gradient;
        ctx.lineWidth = lW;
        ctx.shadowColor = colors[0];
        ctx.shadowBlur = lGlow;
        ctx.beginPath();

        for (let i = 0; i <= steps; i++) {
          const t = (i / steps) * tMax;
          let ptX, ptY;
          if (type === 'hypo') {
            const diff = lR - lr;
            ptX = diff * Math.cos(t) + lp * Math.cos((diff / lr) * t);
            ptY = diff * Math.sin(t) - lp * Math.sin((diff / lr) * t);
          } else {
            const sum = lR + lr;
            ptX = sum * Math.cos(t) - lp * Math.cos((sum / lr) * t);
            ptY = sum * Math.sin(t) - lp * Math.sin((sum / lr) * t);
          }
          if (i === 0) ctx.moveTo(ptX, ptY);
          else ctx.lineTo(ptX, ptY);
        }
        ctx.stroke();
        ctx.restore();
      });

      // Render Active Spirograph
      ctx.save();
      ctx.translate(cx, cy);

      const paletteColors = PALETTES[paletteKey]?.colors || PALETTES.cyber.colors;
      const gradient = ctx.createLinearGradient(-180, -180, 180, 180);
      paletteColors.forEach((c, idx) => {
        gradient.addColorStop(idx / (paletteColors.length - 1), c);
      });

      ctx.strokeStyle = gradient;
      ctx.lineWidth = lineWidth;
      ctx.shadowColor = paletteColors[0];
      ctx.shadowBlur = glow;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      const currentLimit = Math.min(targetStep, totalSteps);
      for (let i = 0; i <= currentLimit; i++) {
        const theta = (i / totalSteps) * totalTheta;
        const pt = getPoint(theta);
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();

      // Pen tip tracer indicator if animating
      if (currentLimit > 0 && currentLimit < totalSteps && isPlaying) {
        const theta = (currentLimit / totalSteps) * totalTheta;
        const tip = getPoint(theta);
        ctx.beginPath();
        ctx.arc(tip.x, tip.y, lineWidth * 2.5 + 2, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 20;
        ctx.fill();
      }

      ctx.restore();
    },
    [
      layers,
      paletteKey,
      lineWidth,
      glow,
      totalSteps,
      totalTheta,
      getPoint,
      curveType,
      R,
      r,
      p,
      isPlaying,
    ]
  );

  // Animation Frame updates
  useEffect(() => {
    let cancel = false;

    const tick = () => {
      if (isPlaying) {
        if (currentStepRef.current < totalSteps) {
          currentStepRef.current = Math.min(
            totalSteps,
            currentStepRef.current + Math.ceil(speed)
          );
          setProgress(currentStepRef.current / totalSteps);
          drawCanvas(currentStepRef.current);
          animRef.current = requestAnimationFrame(tick);
        } else {
          setIsPlaying(false);
          drawCanvas(totalSteps);
        }
      }
    };

    if (isPlaying) {
      animRef.current = requestAnimationFrame(tick);
    } else {
      drawCanvas(currentStepRef.current);
    }

    return () => {
      cancel = true;
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying, totalSteps, speed, drawCanvas]);

  // Reset drawing when parameters change
  const resetDrawing = useCallback(() => {
    currentStepRef.current = 0;
    setProgress(0);
    setIsPlaying(true);
  }, []);

  const handleParamChange = (setter, val) => {
    setter(val);
    resetDrawing();
  };

  const handleApplyPreset = (preset) => {
    setCurveType(preset.type);
    setR(preset.R);
    setRSub(preset.r);
    setP(preset.p);
    setPaletteKey(preset.palette);
    setLineWidth(preset.lineWidth);
    setGlow(preset.glow);
    resetDrawing();
  };

  const handleRandomize = () => {
    const types = ['hypo', 'epi'];
    const palettes = Object.keys(PALETTES);
    setCurveType(types[Math.floor(Math.random() * types.length)]);
    setR(Math.floor(Math.random() * 120) + 80);
    setRSub(Math.floor(Math.random() * 80) + 20);
    setP(Math.floor(Math.random() * 100) + 30);
    setPaletteKey(palettes[Math.floor(Math.random() * palettes.length)]);
    setLineWidth(Number((Math.random() * 2 + 1).toFixed(1)));
    setGlow(Math.floor(Math.random() * 15) + 8);
    resetDrawing();
  };

  const handleAddLayer = () => {
    setLayers((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: curveType,
        R,
        r,
        p,
        palette: paletteKey,
        lineWidth,
        glow,
      },
    ]);
  };

  const handleClearLayers = () => {
    setLayers([]);
  };

  const handleDownloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `spirograph-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleDownloadSVG = () => {
    const svgStr = generateSVGString();
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `spirograph-${Date.now()}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopySVG = () => {
    const svgStr = generateSVGString();
    navigator.clipboard.writeText(svgStr);
    setCopiedSVG(true);
    setTimeout(() => setCopiedSVG(false), 2000);
  };

  return (
    <div className="flex flex-col justify-center items-center p-6 lg:p-8 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl m-5 shadow-2xl relative overflow-hidden border border-white/10 text-white font-sans">
      {/* Dynamic ambient lights */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>

      {/* Header */}
      <header className="w-full max-w-6xl mb-8 flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
        <div>
          <h2 className="text-4xl font-extrabold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tight">
            Spirograph & Mandala Studio
          </h2>
          <p className="text-slate-400 text-sm font-medium mt-1">
            Generative geometric curves, parametric harmonics & vector artwork
          </p>
        </div>

        {/* Action Pills */}
        <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md p-1.5 rounded-2xl border border-white/10">
          <button
            onClick={handleRandomize}
            className="px-4 py-2 text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-xl transition-all shadow-lg hover:shadow-cyan-500/20 active:scale-95"
          >
            ✨ Randomize
          </button>
          <button
            onClick={handleAddLayer}
            className="px-4 py-2 text-xs font-bold bg-white/10 hover:bg-white/20 rounded-xl transition-all active:scale-95 border border-white/10"
          >
            ➕ Save Layer ({layers.length})
          </button>
        </div>
      </header>

      {/* Main Studio Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full max-w-6xl relative z-10">
        {/* Left Column: Canvas View & Player Controls */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="relative bg-slate-950/80 backdrop-blur-xl p-4 rounded-3xl border border-white/10 shadow-2xl flex flex-col items-center group">
            <canvas
              ref={canvasRef}
              width={600}
              height={600}
              className="w-full max-w-[550px] aspect-square rounded-2xl bg-black/40 border border-white/5 shadow-inner"
            />

            {/* Progress Bar */}
            <div className="w-full max-w-[550px] mt-4 flex items-center gap-3 px-2">
              <span className="text-[10px] font-mono text-cyan-400">
                {Math.round(progress * 100)}%
              </span>
              <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-75"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            </div>

            {/* Player Controls Bar */}
            <div className="w-full max-w-[550px] mt-4 flex items-center justify-between bg-white/5 p-3 rounded-2xl border border-white/10">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-xl text-xs font-bold border border-cyan-500/30 transition-all active:scale-95"
                >
                  {isPlaying ? '⏸ Pause' : '▶ Play'}
                </button>
                <button
                  onClick={resetDrawing}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-bold border border-white/10 transition-all active:scale-95"
                >
                  🔄 Redraw
                </button>
              </div>

              {/* Speed Slider */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-400">Speed</span>
                <input
                  type="range"
                  min="20"
                  max="400"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-24 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Export Toolbar */}
          <div className="flex items-center justify-between gap-3 bg-white/5 backdrop-blur-xl p-4 rounded-2xl border border-white/10">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Export Artwork
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDownloadPNG}
                className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold rounded-xl border border-cyan-500/30 transition-all active:scale-95"
              >
                🖼️ Save PNG
              </button>
              <button
                onClick={handleDownloadSVG}
                className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-bold rounded-xl border border-purple-500/30 transition-all active:scale-95"
              >
                📐 Download SVG
              </button>
              <button
                onClick={handleCopySVG}
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all active:scale-95 ${
                  copiedSVG
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-white/10 hover:bg-white/20 text-white border-white/10'
                }`}
              >
                {copiedSVG ? '✓ SVG Copied!' : '📋 Copy SVG'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Studio Control Tabs */}
        <div className="lg:col-span-5 bg-slate-950/80 backdrop-blur-xl p-6 lg:p-8 rounded-3xl border border-white/10 shadow-2xl flex flex-col justify-between">
          <div>
            {/* Tab Headers */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-white/5 rounded-2xl mb-6 border border-white/5">
              {[
                { id: 'params', label: 'Controls' },
                { id: 'presets', label: 'Presets' },
                { id: 'layers', label: `Layers (${layers.length})` },
                { id: 'svg', label: 'SVG Code' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 text-xs font-bold rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB 1: PARAMETERS */}
            {activeTab === 'params' && (
              <div className="space-y-5">
                {/* Curve Type selector */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                    Curve Mode
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleParamChange(setCurveType, 'hypo')}
                      className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all ${
                        curveType === 'hypo'
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                          : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
                      }`}
                    >
                      Hypotrochoid (Inside)
                    </button>
                    <button
                      onClick={() => handleParamChange(setCurveType, 'epi')}
                      className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all ${
                        curveType === 'epi'
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-lg shadow-purple-500/10'
                          : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
                      }`}
                    >
                      Epitrochoid (Outside)
                    </button>
                  </div>
                </div>

                {/* Outer Radius R */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Outer Radius (R)
                    </label>
                    <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-500/20">
                      {R}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="220"
                    value={R}
                    onChange={(e) => handleParamChange(setR, Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>

                {/* Inner Radius r */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Inner Radius (r)
                    </label>
                    <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-500/20">
                      {r}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="140"
                    value={r}
                    onChange={(e) => handleParamChange(setRSub, Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>

                {/* Pen Distance p */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Pen Offset Distance (p)
                    </label>
                    <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-500/20">
                      {p}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="150"
                    value={p}
                    onChange={(e) => handleParamChange(setP, Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>

                {/* Color Palette Selector */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                    Color Palette
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(PALETTES).map(([key, pal]) => (
                      <button
                        key={key}
                        onClick={() => setPaletteKey(key)}
                        className={`p-2 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                          paletteKey === key
                            ? 'bg-white/10 border-cyan-400 shadow-md'
                            : 'bg-white/5 border-white/5 hover:bg-white/10'
                        }`}
                      >
                        <span className="text-[10px] font-semibold text-slate-300 truncate">
                          {pal.name}
                        </span>
                        <div className="flex h-2 rounded-full overflow-hidden w-full">
                          {pal.colors.map((c, idx) => (
                            <div
                              key={idx}
                              style={{ backgroundColor: c }}
                              className="flex-1 h-full"
                            />
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stroke Line Width & Glow */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-semibold text-slate-300">
                        Line Width
                      </label>
                      <span className="text-xs font-mono text-purple-400">{lineWidth}px</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="6"
                      step="0.1"
                      value={lineWidth}
                      onChange={(e) => setLineWidth(Number(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-semibold text-slate-300">
                        Neon Glow
                      </label>
                      <span className="text-xs font-mono text-purple-400">{glow}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      value={glow}
                      onChange={(e) => setGlow(Number(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PRESETS */}
            {activeTab === 'presets' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-400 mb-2">
                  Select a curated geometry preset to quickly generate intricate patterns:
                </p>
                {PRESETS.map((preset, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleApplyPreset(preset)}
                    className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {preset.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {preset.type === 'hypo' ? 'Hypotrochoid' : 'Epitrochoid'} • R:{preset.R}{' '}
                        r:{preset.r} p:{preset.p}
                      </p>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-lg group-hover:bg-cyan-500/30">
                      Load →
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: LAYERS */}
            {activeTab === 'layers' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Mandala Layer Stack
                  </span>
                  {layers.length > 0 && (
                    <button
                      onClick={handleClearLayers}
                      className="text-xs font-bold text-pink-400 hover:text-pink-300 transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {layers.length === 0 ? (
                  <div className="p-8 text-center bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-sm text-slate-400">No saved layers yet.</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Click <strong className="text-slate-300">"Save Layer"</strong> at the top to
                      overlay multiple geometries and form complex mandalas!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {layers.map((layer, idx) => (
                      <div
                        key={layer.id}
                        className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between"
                      >
                        <div>
                          <span className="text-xs font-bold text-cyan-300">
                            Layer #{idx + 1}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {layer.type.toUpperCase()} | R:{layer.R} r:{layer.r} p:{layer.p}
                          </span>
                        </div>
                        <button
                          onClick={() =>
                            setLayers((prev) => prev.filter((l) => l.id !== layer.id))
                          }
                          className="text-xs text-slate-500 hover:text-pink-400 p-1"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: SVG CODE */}
            {activeTab === 'svg' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    SVG XML Output
                  </span>
                  <button
                    onClick={handleCopySVG}
                    className="text-xs font-bold text-cyan-400 hover:text-cyan-300"
                  >
                    {copiedSVG ? 'Copied!' : 'Copy Code'}
                  </button>
                </div>
                <pre className="text-emerald-400 font-mono text-[11px] bg-black/60 p-4 rounded-2xl border border-white/10 max-h-[320px] overflow-auto whitespace-pre-wrap">
                  {generateSVGString()}
                </pre>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <footer className="pt-6 border-t border-white/10 mt-6 flex justify-between items-center text-[11px] text-slate-500">
            <span>Hypotrochoid & Epitrochoid Generator</span>
            <span className="font-mono text-cyan-500/80">React 19 Canvas Engine</span>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default SpirographStudio;
