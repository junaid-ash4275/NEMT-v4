import React, { useState, useRef, useEffect } from 'react';

const PALETTES = {
  Cyberpunk: ['#ff007f', '#00f0ff', '#7000ff', '#39ff14', '#ffffff'],
  Sunset:    ['#ff4e50', '#fc913a', '#f9d423', '#ede574', '#e1f5c4'],
  Cosmos:    ['#60a5fa', '#a855f7', '#ec4899', '#38bdf8', '#f8fafc'],
  Biohazard: ['#10b981', '#84cc16', '#eab308', '#06b6d4', '#ecfdf5'],
  NeonGold:  ['#fbbf24', '#f59e0b', '#d97706', '#fef08a', '#ffffff']
};

const BRUSHES = {
  NeonGlow: 'Neon Glow',
  LaserStar: 'Laser Stars',
  CosmicPearl: 'Cosmic Pearls',
  PlasmaWire: 'Plasma Wire'
};

const SLICE_OPTIONS = [4, 6, 8, 12, 16, 24];

const KaleidoscopeStudio = () => {
  const canvasRef = useRef(null);
  const [slices, setSlices] = useState(12);
  const [paletteName, setPaletteName] = useState('Cyberpunk');
  const [brushType, setBrushType] = useState('NeonGlow');
  const [brushSize, setBrushSize] = useState(4);
  const [isDrawing, setIsDrawing] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [strokeCount, setStrokeCount] = useState(0);
  const [rotationAngle, setRotationAngle] = useState(0);

  const lastPosRef = useRef({ x: 0, y: 0 });
  const animFrameRef = useRef(null);
  const rotationRef = useRef(0);

  const activeColors = PALETTES[paletteName];

  // Initialize canvas background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#050314';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawCenterGuide(ctx, canvas.width, canvas.height);
  }, []);

  // Handle continuous rotation visual effect when active
  useEffect(() => {
    let lastTime = performance.now();
    const updateRotation = (now) => {
      if (autoRotate) {
        const delta = (now - lastTime) * 0.015;
        rotationRef.current = (rotationRef.current + delta) % 360;
        setRotationAngle(rotationRef.current);
      }
      lastTime = now;
      animFrameRef.current = requestAnimationFrame(updateRotation);
    };
    animFrameRef.current = requestAnimationFrame(updateRotation);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [autoRotate]);

  const drawCenterGuide = (ctx, w, h) => {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 80, 0, Math.PI * 2);
    ctx.arc(w / 2, h / 2, 160, 0, Math.PI * 2);
    ctx.arc(w / 2, h / 2, 240, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  };

  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const getRandomColor = () => {
    return activeColors[Math.floor(Math.random() * activeColors.length)];
  };

  const startDrawing = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    const pos = getCanvasCoords(e);
    lastPosRef.current = pos;
    drawStroke(pos.x, pos.y, pos.x, pos.y);
  };

  const moveDrawing = (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    const pos = getCanvasCoords(e);
    drawStroke(lastPosRef.current.x, lastPosRef.current.y, pos.x, pos.y);
    lastPosRef.current = pos;
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      setStrokeCount((prev) => prev + 1);
    }
  };

  const drawStroke = (x1, y1, x2, y2, customColor = null) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const angleStep = (Math.PI * 2) / slices;

    const color = customColor || getRandomColor();
    const dx1 = x1 - cx;
    const dy1 = y1 - cy;
    const dx2 = x2 - cx;
    const dy2 = y2 - cy;

    ctx.save();
    ctx.translate(cx, cy);

    for (let i = 0; i < slices; i++) {
      ctx.save();
      ctx.rotate(i * angleStep);

      // Normal symmetry stroke
      renderBrush(ctx, dx1, dy1, dx2, dy2, color);

      // Reflected symmetry stroke (mirror effect)
      ctx.scale(1, -1);
      renderBrush(ctx, dx1, dy1, dx2, dy2, color);

      ctx.restore();
    }
    ctx.restore();
  };

  const renderBrush = (ctx, x1, y1, x2, y2, color) => {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (brushType === 'NeonGlow') {
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.shadowBlur = brushSize * 3;
      ctx.shadowColor = color;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // Core highlight
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(1, brushSize / 3);
      ctx.shadowBlur = 0;
      ctx.stroke();
    } else if (brushType === 'LaserStar') {
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize / 1.5;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // Star intersections
      const dist = Math.hypot(x2 - x1, y2 - y1);
      if (dist > 3 || x1 === x2) {
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 8;
        ctx.shadowColor = color;
        ctx.fillRect(x2 - brushSize, y2 - 1, brushSize * 2, 2);
        ctx.fillRect(x2 - 1, y2 - brushSize, 2, brushSize * 2);
      }
    } else if (brushType === 'CosmicPearl') {
      const radius = brushSize * (0.8 + Math.random() * 0.8);
      ctx.fillStyle = color;
      ctx.shadowBlur = 12;
      ctx.shadowColor = color;
      ctx.beginPath();
      ctx.arc(x2, y2, radius, 0, Math.PI * 2);
      ctx.fill();

      // Pearl shine
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.beginPath();
      ctx.arc(x2 - radius * 0.3, y2 - radius * 0.3, radius * 0.3, 0, Math.PI * 2);
      ctx.fill();
    } else if (brushType === 'PlasmaWire') {
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.shadowBlur = 15;
      ctx.shadowColor = color;
      const midX = (x1 + x2) / 2 + (Math.random() - 0.5) * 15;
      const midY = (y1 + y2) / 2 + (Math.random() - 0.5) * 15;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo(midX, midY, x2, y2);
      ctx.stroke();
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#050314';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawCenterGuide(ctx, canvas.width, canvas.height);
    setStrokeCount(0);
  };

  const handleMagicBurst = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const layers = 6 + Math.floor(Math.random() * 6);

    for (let l = 0; l < layers; l++) {
      const radius = 30 + Math.random() * 220;
      const startAngle = Math.random() * Math.PI * 2;
      const endAngle = startAngle + (Math.random() * 0.8 - 0.4);
      const color = activeColors[Math.floor(Math.random() * activeColors.length)];
      
      const x1 = cx + Math.cos(startAngle) * radius;
      const y1 = cy + Math.sin(startAngle) * radius;
      const x2 = cx + Math.cos(endAngle) * (radius + (Math.random() * 40 - 20));
      const y2 = cy + Math.sin(endAngle) * (radius + (Math.random() * 40 - 20));

      drawStroke(x1, y1, x2, y2, color);
    }
    setStrokeCount((prev) => prev + layers);
  };

  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `kaleidoscope-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="flex justify-center items-center min-h-[650px] p-5 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-500 rounded-2xl m-5 shadow-2xl">
      <div className="bg-white/95 backdrop-blur-md p-8 rounded-3xl max-w-5xl w-full shadow-2xl border border-white/20">
        
        {/* Header Section */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-200 mb-3">
            <span className="text-lg animate-spin-slow">✨</span>
            <span className="text-xs font-black text-violet-700 uppercase tracking-widest">Interactive Generative Art</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-700 via-fuchsia-600 to-pink-600 mb-2">
            Kaleidoscope Studio
          </h2>
          <p className="text-gray-500 font-medium text-sm md:text-base">
            Click, hold, and drag across the cosmic void to create mesmerizing symmetrical mandalas.
          </p>
        </div>

        {/* Top Stats & Quick Controls Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-gradient-to-br from-violet-50 to-purple-100 rounded-2xl p-4 border border-violet-100 flex flex-col justify-between">
            <div className="text-2xl font-black text-violet-700">{slices}x Mirror</div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-violet-400 mt-1">Symmetry Slices</div>
          </div>
          
          <div className="bg-gradient-to-br from-fuchsia-50 to-pink-100 rounded-2xl p-4 border border-fuchsia-100 flex flex-col justify-between">
            <div className="text-2xl font-black text-fuchsia-700 truncate">{BRUSHES[brushType]}</div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-fuchsia-400 mt-1">Active Brush</div>
          </div>
          
          <div className="bg-gradient-to-br from-pink-50 to-rose-100 rounded-2xl p-4 border border-pink-100 flex flex-col justify-between">
            <div className="text-2xl font-black text-rose-700 truncate">{paletteName}</div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-rose-400 mt-1">Color Palette</div>
          </div>
          
          <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl p-4 border border-amber-100 flex flex-col justify-between">
            <div className="text-2xl font-black text-orange-600">{strokeCount}</div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-orange-400 mt-1">Strokes Drawn</div>
          </div>
        </div>

        {/* Customization Toolbar */}
        <div className="space-y-4 mb-6 bg-gray-50 p-5 rounded-2xl border border-gray-200/80">
          
          {/* Row 1: Brush styles */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase w-24">Brush Style:</span>
            {Object.entries(BRUSHES).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setBrushType(key)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  brushType === key
                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md shadow-fuchsia-500/20 scale-105'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Row 2: Palettes */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase w-24">Theme:</span>
            {Object.keys(PALETTES).map((name) => (
              <button
                key={name}
                onClick={() => setPaletteName(name)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  paletteName === name
                    ? 'bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white shadow-md shadow-pink-500/20 scale-105'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <span className="flex gap-1">
                  {PALETTES[name].slice(0, 3).map((c, i) => (
                    <span key={i} className="w-2.5 h-2.5 rounded-full inline-block shadow-sm" style={{ background: c }} />
                  ))}
                </span>
                {name}
              </button>
            ))}
          </div>

          {/* Row 3: Slices & Brush Size */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-gray-200">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-gray-400 uppercase w-24">Symmetry:</span>
              {SLICE_OPTIONS.map((num) => (
                <button
                  key={num}
                  onClick={() => setSlices(num)}
                  className={`w-9 h-9 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center ${
                    slices === num
                      ? 'bg-gradient-to-r from-violet-700 to-purple-700 text-white shadow-md scale-105'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-gray-400 uppercase">Size: {brushSize}px</label>
              <input
                type="range"
                min="1"
                max="16"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-28 accent-fuchsia-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="relative flex justify-center items-center w-full bg-gray-950 rounded-3xl overflow-hidden shadow-2xl border-4 border-gray-900 aspect-square md:aspect-auto md:h-[540px]">
          
          <div
            className="w-full h-full flex items-center justify-center transition-transform duration-75"
            style={{ transform: `rotate(${autoRotate ? rotationAngle : 0}deg)` }}
          >
            <canvas
              ref={canvasRef}
              width={640}
              height={640}
              onMouseDown={startDrawing}
              onMouseMove={moveDrawing}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={moveDrawing}
              onTouchEnd={stopDrawing}
              className="max-w-full max-h-full cursor-crosshair rounded-full shadow-[0_0_80px_rgba(168,85,247,0.15)] touch-none select-none"
            />
          </div>

          {/* Floating Canvas Overlay controls */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center px-4 py-2 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 pointer-events-auto">
            <label className="flex items-center gap-2 text-xs font-bold text-violet-200 cursor-pointer select-none hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={autoRotate}
                onChange={(e) => setAutoRotate(e.target.checked)}
                className="w-4 h-4 rounded text-violet-600 accent-fuchsia-500 cursor-pointer"
              />
              Hypnotic Auto-Rotate
            </label>

            <span className="text-[11px] text-gray-400 font-mono hidden sm:inline">
              {isDrawing ? '✨ Creating real-time symphony...' : '💡 Tip: Try dragging in spiral shapes!'}
            </span>
          </div>
        </div>

        {/* Action Bottom Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-6 border-t border-gray-100">
          <button
            onClick={handleMagicBurst}
            className="px-6 py-3.5 rounded-2xl font-extrabold text-white bg-gradient-to-r from-amber-500 via-rose-500 to-fuchsia-600 hover:-translate-y-0.5 shadow-lg hover:shadow-rose-500/30 active:translate-y-0 transition-all text-sm flex items-center gap-2"
          >
            <span>🪄</span> Magic Mandala Burst
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleClear}
              className="px-6 py-3.5 rounded-2xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-gray-900 active:scale-95 transition-all text-sm"
            >
              Clear Canvas
            </button>
            <button
              onClick={handleExport}
              className="px-6 py-3.5 rounded-2xl font-bold text-white bg-gray-900 hover:bg-gray-800 hover:-translate-y-0.5 shadow-md active:translate-y-0 transition-all text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Save Artwork (PNG)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default KaleidoscopeStudio;
