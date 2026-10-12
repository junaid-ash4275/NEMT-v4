import React, { useState, useMemo } from 'react';

// Deterministic PRNG for reproducible variance
function createRandom(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const PRESETS = [
  {
    name: 'Sunset Glow',
    color1: '#ff5e62',
    color2: '#ff9966',
    bgColor: '#1e1b4b',
    wavesCount: 4,
    height: 180,
    variance: 35,
    layers: 3,
  },
  {
    name: 'Pacific Ocean',
    color1: '#0072ff',
    color2: '#00c6ff',
    bgColor: '#f8fafc',
    wavesCount: 3,
    height: 160,
    variance: 25,
    layers: 4,
  },
  {
    name: 'Emerald Coast',
    color1: '#059669',
    color2: '#34d399',
    bgColor: '#064e3b',
    wavesCount: 4,
    height: 200,
    variance: 40,
    layers: 3,
  },
  {
    name: 'Electric Neon',
    color1: '#7928ca',
    color2: '#ff0080',
    bgColor: '#0f172a',
    wavesCount: 5,
    height: 210,
    variance: 50,
    layers: 3,
  },
  {
    name: 'Nordic Slate',
    color1: '#334155',
    color2: '#64748b',
    bgColor: '#ffffff',
    wavesCount: 3,
    height: 140,
    variance: 20,
    layers: 2,
  },
  {
    name: 'Warm Amber',
    color1: '#d97706',
    color2: '#fbbf24',
    bgColor: '#fffbeb',
    wavesCount: 4,
    height: 170,
    variance: 30,
    layers: 3,
  },
];

const SvgWaveStudio = () => {
  const [wavesCount, setWavesCount] = useState(4);
  const [height, setHeight] = useState(180);
  const [variance, setVariance] = useState(35);
  const [layersCount, setLayersCount] = useState(3);
  const [isTop, setIsTop] = useState(false);
  const [flipX, setFlipX] = useState(false);
  const [waveStyle, setWaveStyle] = useState('smooth'); // 'smooth' | 'sharp' | 'stepped'
  const [color1, setColor1] = useState('#0072ff');
  const [color2, setColor2] = useState('#00c6ff');
  const [gradientAngle, setGradientAngle] = useState(90);
  const [seed, setSeed] = useState(1337);
  const [isAnimated, setIsAnimated] = useState(false);
  const [viewMode, setViewMode] = useState('canvas'); // 'canvas' | 'hero'
  const [previewBg, setPreviewBg] = useState('light'); // 'light' | 'dark' | 'custom'
  const [customBgColor, setCustomBgColor] = useState('#0f172a');
  const [exportTab, setExportTab] = useState('svg'); // 'svg' | 'jsx' | 'css'
  const [copied, setCopied] = useState(false);

  // Generate SVG path for a given layer
  const generateLayerPaths = useMemo(() => {
    const width = 1440;
    const totalHeight = 360;
    const paths = [];

    for (let layer = 0; layer < layersCount; layer++) {
      const rng = createRandom(seed + layer * 73);
      const points = [];
      const numSegments = Math.max(2, wavesCount);
      const stepX = width / numSegments;
      const layerOffset = (layersCount - 1 - layer) * 25;
      const baseMidY = totalHeight - (height + layerOffset);

      // Generate nodes along the wave
      for (let i = 0; i <= numSegments; i++) {
        const x = i * stepX;
        let randomFactor = (rng() * 2 - 1) * variance;
        if (i === 0 || i === numSegments) {
          randomFactor *= 0.5; // smoother ends
        }
        const y = Math.max(30, Math.min(totalHeight - 20, baseMidY + randomFactor));
        points.push({ x, y });
      }

      if (flipX) {
        points.reverse();
        // Recalculate x coordinates to keep 0 -> width order
        for (let i = 0; i < points.length; i++) {
          points[i].x = i * stepX;
        }
      }

      let d = '';

      if (isTop) {
        // Wave starts at top edge (y = 0) and flows down
        if (waveStyle === 'sharp') {
          d = `M 0,0 L ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)} `;
          for (let i = 1; i < points.length; i++) {
            d += `L ${points[i].x.toFixed(1)},${points[i].y.toFixed(1)} `;
          }
          d += `L ${width},0 Z`;
        } else if (waveStyle === 'stepped') {
          d = `M 0,0 L 0,${points[0].y.toFixed(1)} `;
          for (let i = 1; i < points.length; i++) {
            const midX = (points[i - 1].x + points[i].x) / 2;
            d += `L ${midX.toFixed(1)},${points[i - 1].y.toFixed(1)} L ${midX.toFixed(1)},${points[i].y.toFixed(1)} `;
          }
          d += `L ${width},${points[points.length - 1].y.toFixed(1)} L ${width},0 Z`;
        } else {
          // Smooth bezier curve
          d = `M 0,0 L 0,${points[0].y.toFixed(1)} `;
          for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i];
            const p1 = points[i + 1];
            const cx = (p0.x + p1.x) / 2;
            d += `Q ${p0.x.toFixed(1)},${p0.y.toFixed(1)} ${cx.toFixed(1)},${((p0.y + p1.y) / 2).toFixed(1)} `;
          }
          const last = points[points.length - 1];
          d += `T ${last.x.toFixed(1)},${last.y.toFixed(1)} L ${width},0 Z`;
        }
      } else {
        // Wave starts at bottom edge (y = totalHeight) and rises
        if (waveStyle === 'sharp') {
          d = `M 0,${totalHeight} L ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)} `;
          for (let i = 1; i < points.length; i++) {
            d += `L ${points[i].x.toFixed(1)},${points[i].y.toFixed(1)} `;
          }
          d += `L ${width},${totalHeight} Z`;
        } else if (waveStyle === 'stepped') {
          d = `M 0,${totalHeight} L 0,${points[0].y.toFixed(1)} `;
          for (let i = 1; i < points.length; i++) {
            const midX = (points[i - 1].x + points[i].x) / 2;
            d += `L ${midX.toFixed(1)},${points[i - 1].y.toFixed(1)} L ${midX.toFixed(1)},${points[i].y.toFixed(1)} `;
          }
          d += `L ${width},${points[points.length - 1].y.toFixed(1)} L ${width},${totalHeight} Z`;
        } else {
          // Smooth bezier curve
          d = `M 0,${totalHeight} L 0,${points[0].y.toFixed(1)} `;
          for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i];
            const p1 = points[i + 1];
            const cx = (p0.x + p1.x) / 2;
            d += `Q ${p0.x.toFixed(1)},${p0.y.toFixed(1)} ${cx.toFixed(1)},${((p0.y + p1.y) / 2).toFixed(1)} `;
          }
          const last = points[points.length - 1];
          d += `T ${last.x.toFixed(1)},${last.y.toFixed(1)} L ${width},${totalHeight} Z`;
        }
      }

      const opacity = layersCount === 1 ? 1 : +(0.35 + (layer / (layersCount - 1)) * 0.65).toFixed(2);
      paths.push({ d, opacity, layerIndex: layer });
    }

    return paths;
  }, [wavesCount, height, variance, layersCount, isTop, flipX, waveStyle, seed]);

  // Gradient calculations
  const gradientCoords = useMemo(() => {
    const angleRad = (gradientAngle * Math.PI) / 180;
    const x1 = Math.round(50 - Math.cos(angleRad) * 50);
    const y1 = Math.round(50 - Math.sin(angleRad) * 50);
    const x2 = Math.round(50 + Math.cos(angleRad) * 50);
    const y2 = Math.round(50 + Math.sin(angleRad) * 50);
    return { x1: `${x1}%`, y1: `${y1}%`, x2: `${x2}%`, y2: `${y2}%` };
  }, [gradientAngle]);

  // Raw SVG string for copy/download
  const svgMarkup = useMemo(() => {
    const pathsMarkup = generateLayerPaths
      .map(
        (p) =>
          `  <path fill="url(#wave-gradient)" fill-opacity="${p.opacity}" d="${p.d}" />`
      )
      .join('\n');

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 360" width="100%" height="100%" preserveAspectRatio="none">
  <defs>
    <linearGradient id="wave-gradient" x1="${gradientCoords.x1}" y1="${gradientCoords.y1}" x2="${gradientCoords.x2}" y2="${gradientCoords.y2}">
      <stop offset="0%" stop-color="${color1}" />
      <stop offset="100%" stop-color="${color2}" />
    </linearGradient>
  </defs>
${pathsMarkup}
</svg>`;
  }, [generateLayerPaths, gradientCoords, color1, color2]);

  // React JSX snippet
  const jsxMarkup = useMemo(() => {
    return `import React from 'react';

export const WaveDivider = () => (
  <svg
    viewBox="0 0 1440 360"
    width="100%"
    height="100%"
    preserveAspectRatio="none"
    className="w-full block"
  >
    <defs>
      <linearGradient id="wave-grad" x1="${gradientCoords.x1}" y1="${gradientCoords.y1}" x2="${gradientCoords.x2}" y2="${gradientCoords.y2}">
        <stop offset="0%" stopColor="${color1}" />
        <stop offset="100%" stopColor="${color2}" />
      </linearGradient>
    </defs>
${generateLayerPaths
  .map(
    (p) =>
      `    <path fill="url(#wave-grad)" fillOpacity="${p.opacity}" d="${p.d}" />`
  )
  .join('\n')}
  </svg>
);`;
  }, [generateLayerPaths, gradientCoords, color1, color2]);

  // CSS data URI
  const cssMarkup = useMemo(() => {
    const encoded = encodeURIComponent(svgMarkup)
      .replace(/'/g, '%27')
      .replace(/"/g, '%22');
    return `.wave-divider {
  background-image: url("data:image/svg+xml,${encoded}");
  background-repeat: no-repeat;
  background-size: cover;
  background-position: ${isTop ? 'top' : 'bottom'};
  width: 100%;
  height: 200px;
}`;
  }, [svgMarkup, isTop]);

  const handleCopy = () => {
    let textToCopy = svgMarkup;
    if (exportTab === 'jsx') textToCopy = jsxMarkup;
    if (exportTab === 'css') textToCopy = cssMarkup;

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wave-divider-${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const randomize = () => {
    setSeed(Math.floor(Math.random() * 100000));
    setWavesCount(Math.floor(Math.random() * 4) + 3);
    setHeight(Math.floor(Math.random() * 120) + 120);
    setVariance(Math.floor(Math.random() * 40) + 15);
    setLayersCount(Math.floor(Math.random() * 3) + 2);
    setGradientAngle(Math.floor(Math.random() * 360));

    // Select a random fresh preset color
    const randomPreset = PRESETS[Math.floor(Math.random() * PRESETS.length)];
    setColor1(randomPreset.color1);
    setColor2(randomPreset.color2);
  };

  const applyPreset = (preset) => {
    setColor1(preset.color1);
    setColor2(preset.color2);
    setWavesCount(preset.wavesCount);
    setHeight(preset.height);
    setVariance(preset.variance);
    setLayersCount(preset.layers);
    setSeed(Math.floor(Math.random() * 10000));
  };

  const containerBgStyle =
    previewBg === 'dark'
      ? 'bg-slate-900 text-white'
      : previewBg === 'custom'
      ? ''
      : 'bg-slate-100 text-slate-800';

  return (
    <div className="max-w-7xl mx-auto my-12 p-6 md:p-8 bg-white rounded-3xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] border border-gray-100 overflow-hidden relative">
      {/* Decorative ambient aura */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-50 rounded-full blur-3xl opacity-70 -mr-24 -mt-24 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-50 rounded-full blur-3xl opacity-70 -ml-24 -mb-24 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-100 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 12c2.5-3 5.5-3 8 0s5.5 3 8 0 5.5-3 8 0" />
                <path d="M2 17c2.5-3 5.5-3 8 0s5.5 3 8 0 5.5-3 8 0" opacity="0.6" />
              </svg>
            </div>
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                SVG Wave Studio
              </h2>
              <p className="text-gray-500 text-sm font-medium mt-0.5">
                Design custom, responsive, layered SVG wave dividers & section transitions
              </p>
            </div>
          </div>
        </div>

        {/* Top Action Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={randomize}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl flex items-center gap-1.5 transition-colors active:scale-95"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-9.21l-5.36 5.36" />
            </svg>
            Shuffle
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-semibold rounded-xl flex items-center gap-1.5 transition-colors active:scale-95"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download SVG
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        {/* Controls Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Preset Chips */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2.5">
              Quick Presets
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => applyPreset(p)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-gray-200 hover:border-blue-400 bg-white hover:bg-blue-50/50 text-gray-700 flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block shadow-sm"
                    style={{ background: `linear-gradient(45deg, ${p.color1}, ${p.color2})` }}
                  />
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Wave Geometry Controls */}
          <div className="bg-gray-50/90 rounded-2xl p-5 border border-gray-100 space-y-4">
            <h3 className="text-sm font-bold text-gray-800 flex items-center justify-between">
              <span>Wave Geometry</span>
              <span className="text-xs font-mono text-gray-500 font-normal">
                {wavesCount} Crests · {layersCount} Layers
              </span>
            </h3>

            {/* Crests / Waves Count */}
            <div>
              <div className="flex justify-between text-xs font-medium text-gray-600 mb-1.5">
                <span>Wave Frequency</span>
                <span className="font-semibold text-blue-600">{wavesCount}</span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                step="1"
                value={wavesCount}
                onChange={(e) => setWavesCount(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Height / Amplitude */}
            <div>
              <div className="flex justify-between text-xs font-medium text-gray-600 mb-1.5">
                <span>Height / Amplitude</span>
                <span className="font-semibold text-blue-600">{height}px</span>
              </div>
              <input
                type="range"
                min="60"
                max="300"
                step="5"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Variance / Complexity */}
            <div>
              <div className="flex justify-between text-xs font-medium text-gray-600 mb-1.5">
                <span>Peak Variance & Chaos</span>
                <span className="font-semibold text-blue-600">{variance}</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                step="2"
                value={variance}
                onChange={(e) => setVariance(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Layer Count */}
            <div>
              <div className="flex justify-between text-xs font-medium text-gray-600 mb-1.5">
                <span>Layer Depth Count</span>
                <span className="font-semibold text-blue-600">{layersCount}</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    onClick={() => setLayersCount(num)}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      layersCount === num
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {num} {num === 1 ? 'Layer' : 'Layers'}
                  </button>
                ))}
              </div>
            </div>

            {/* Wave Style: Smooth, Sharp, Stepped */}
            <div className="pt-1">
              <span className="text-xs font-medium text-gray-600 block mb-1.5">
                Wave Curve Style
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'smooth', label: 'Bézier Smooth' },
                  { id: 'sharp', label: 'Sharp Peaks' },
                  { id: 'stepped', label: 'Terraced Steps' },
                ].map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setWaveStyle(style.id)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center ${
                      waveStyle === style.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Orientation & Gradient Styling */}
          <div className="bg-gray-50/90 rounded-2xl p-5 border border-gray-100 space-y-4">
            <h3 className="text-sm font-bold text-gray-800">Colors & Direction</h3>

            {/* Color Pickers & Gradient Angle */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">
                  Gradient Start
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color1}
                    onChange={(e) => setColor1(e.target.value)}
                    className="w-9 h-9 rounded-xl border border-gray-200 cursor-pointer p-0.5 bg-white shadow-sm"
                  />
                  <input
                    type="text"
                    value={color1}
                    onChange={(e) => setColor1(e.target.value)}
                    className="w-full text-xs font-mono px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-700"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">
                  Gradient End
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color2}
                    onChange={(e) => setColor2(e.target.value)}
                    className="w-9 h-9 rounded-xl border border-gray-200 cursor-pointer p-0.5 bg-white shadow-sm"
                  />
                  <input
                    type="text"
                    value={color2}
                    onChange={(e) => setColor2(e.target.value)}
                    className="w-full text-xs font-mono px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-700"
                  />
                </div>
              </div>
            </div>

            {/* Gradient Angle Slider */}
            <div>
              <div className="flex justify-between text-xs font-medium text-gray-600 mb-1.5">
                <span>Gradient Direction Angle</span>
                <span className="font-semibold text-blue-600">{gradientAngle}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                step="5"
                value={gradientAngle}
                onChange={(e) => setGradientAngle(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Toggles: Top vs Bottom, Flip, Animated */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-200/60">
              <button
                onClick={() => setIsTop(!isTop)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                  isTop
                    ? 'bg-indigo-50 border-2 border-indigo-200 text-indigo-700'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>Side</span>
                <span className="text-[10px] uppercase font-mono tracking-wider">
                  {isTop ? 'Top' : 'Bottom'}
                </span>
              </button>

              <button
                onClick={() => setFlipX(!flipX)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                  flipX
                    ? 'bg-indigo-50 border-2 border-indigo-200 text-indigo-700'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>Mirror</span>
                <span className="text-[10px] uppercase font-mono tracking-wider">
                  {flipX ? 'Flipped' : 'Normal'}
                </span>
              </button>

              <button
                onClick={() => setIsAnimated(!isAnimated)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                  isAnimated
                    ? 'bg-emerald-50 border-2 border-emerald-300 text-emerald-700'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>Motion</span>
                <span className="text-[10px] uppercase font-mono tracking-wider">
                  {isAnimated ? 'Active' : 'Static'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Preview & Code Column (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          {/* Preview Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-50 p-2.5 rounded-2xl border border-gray-100">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
              <button
                onClick={() => setViewMode('canvas')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  viewMode === 'canvas'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Divider Preview
              </button>
              <button
                onClick={() => setViewMode('hero')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  viewMode === 'hero'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Hero Section Mock
              </button>
            </div>

            {/* Background Theme Switcher */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">Backdrop:</span>
              <button
                onClick={() => setPreviewBg('light')}
                className={`w-6 h-6 rounded-full border-2 transition-all ${
                  previewBg === 'light' ? 'border-blue-600 scale-110 shadow-sm' : 'border-gray-300'
                } bg-slate-100`}
                title="Light Backdrop"
              />
              <button
                onClick={() => setPreviewBg('dark')}
                className={`w-6 h-6 rounded-full border-2 transition-all ${
                  previewBg === 'dark' ? 'border-blue-600 scale-110 shadow-sm' : 'border-gray-300'
                } bg-slate-900`}
                title="Dark Backdrop"
              />
              <button
                onClick={() => setPreviewBg('custom')}
                className={`w-6 h-6 rounded-full border-2 transition-all relative overflow-hidden ${
                  previewBg === 'custom' ? 'border-blue-600 scale-110 shadow-sm' : 'border-gray-300'
                }`}
                style={{ backgroundColor: customBgColor }}
                title="Custom Color"
              >
                <input
                  type="color"
                  value={customBgColor}
                  onChange={(e) => {
                    setCustomBgColor(e.target.value);
                    setPreviewBg('custom');
                  }}
                  className="opacity-0 absolute inset-0 cursor-pointer"
                />
              </button>
            </div>
          </div>

          {/* Interactive Preview Canvas */}
          <div
            className={`w-full rounded-2xl border border-gray-200 overflow-hidden relative transition-colors duration-300 ${containerBgStyle} shadow-inner min-h-[340px] flex flex-col justify-between`}
            style={previewBg === 'custom' ? { backgroundColor: customBgColor } : {}}
          >
            {viewMode === 'hero' ? (
              // Realistic Hero Mock View
              <div className="p-8 text-center flex-1 flex flex-col items-center justify-center z-10">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-500 mb-3 border border-blue-500/20">
                  Modern Web Transitions
                </span>
                <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight max-w-lg">
                  Elevate Your UI With Silky Wave Divisors
                </h3>
                <p className="mt-2 text-sm opacity-75 max-w-md font-medium">
                  Effortlessly blend adjacent page sections with dynamic bezier curvature and
                  custom multi-stage gradients.
                </p>
                <div className="mt-5 flex gap-3">
                  <span className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-500/25">
                    Get Started Free
                  </span>
                  <span className="px-5 py-2 rounded-xl bg-white/20 backdrop-blur-md border border-current font-bold text-xs">
                    Explore Docs
                  </span>
                </div>
              </div>
            ) : (
              // Clean Canvas View
              <div className="p-6 text-center z-10">
                <span className="text-xs font-mono uppercase tracking-widest opacity-60">
                  1440 × 360 Scalable Vector Graphics Viewport
                </span>
              </div>
            )}

            {/* The Live Rendered SVG Wave */}
            <div
              className={`w-full relative transition-all duration-300 ${
                isTop ? 'order-first' : 'order-last'
              }`}
              style={{ height: '180px' }}
            >
              <svg
                viewBox="0 0 1440 360"
                width="100%"
                height="100%"
                preserveAspectRatio="none"
                className="w-full h-full block"
              >
                <defs>
                  <linearGradient
                    id="canvas-wave-gradient"
                    x1={gradientCoords.x1}
                    y1={gradientCoords.y1}
                    x2={gradientCoords.x2}
                    y2={gradientCoords.y2}
                  >
                    <stop offset="0%" stopColor={color1} />
                    <stop offset="100%" stopColor={color2} />
                  </linearGradient>

                  <style>{`
                    @keyframes waveFloatA {
                      0%, 100% { transform: translateY(0px) scaleY(1); }
                      50% { transform: translateY(-8px) scaleY(1.05); }
                    }
                    @keyframes waveFloatB {
                      0%, 100% { transform: translateY(0px) scaleY(1); }
                      50% { transform: translateY(6px) scaleY(0.96); }
                    }
                    .animate-wave-0 {
                      animation: waveFloatA 4.5s ease-in-out infinite;
                      transform-origin: bottom center;
                    }
                    .animate-wave-1 {
                      animation: waveFloatB 6s ease-in-out infinite;
                      transform-origin: bottom center;
                    }
                    .animate-wave-2 {
                      animation: waveFloatA 5.2s ease-in-out infinite reverse;
                      transform-origin: bottom center;
                    }
                    .animate-wave-3 {
                      animation: waveFloatB 7s ease-in-out infinite reverse;
                      transform-origin: bottom center;
                    }
                  `}</style>
                </defs>
                {generateLayerPaths.map((p) => (
                  <path
                    key={p.layerIndex}
                    fill="url(#canvas-wave-gradient)"
                    fillOpacity={p.opacity}
                    d={p.d}
                    className={isAnimated ? `animate-wave-${p.layerIndex % 4}` : ''}
                  />
                ))}
              </svg>
            </div>
          </div>

          {/* Export Code Box */}
          <div className="bg-gray-900 rounded-2xl p-5 text-gray-300 font-mono text-xs shadow-lg border border-gray-800 flex flex-col flex-1">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setExportTab('svg')}
                  className={`px-3 py-1.5 rounded-lg font-sans font-bold text-xs transition-colors ${
                    exportTab === 'svg'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  SVG Code
                </button>
                <button
                  onClick={() => setExportTab('jsx')}
                  className={`px-3 py-1.5 rounded-lg font-sans font-bold text-xs transition-colors ${
                    exportTab === 'jsx'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  React JSX
                </button>
                <button
                  onClick={() => setExportTab('css')}
                  className={`px-3 py-1.5 rounded-lg font-sans font-bold text-xs transition-colors ${
                    exportTab === 'css'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  CSS Data URI
                </button>
              </div>

              <button
                onClick={handleCopy}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 font-sans font-semibold rounded-lg flex items-center gap-1.5 transition-colors active:scale-95 border border-gray-700"
              >
                {copied ? (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#4ade80"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="text-green-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    Copy Code
                  </>
                )}
              </button>
            </div>

            <div className="pt-3 max-h-[160px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700">
              <pre className="whitespace-pre-wrap break-all leading-relaxed select-all">
                {exportTab === 'svg' && svgMarkup}
                {exportTab === 'jsx' && jsxMarkup}
                {exportTab === 'css' && cssMarkup}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SvgWaveStudio;
