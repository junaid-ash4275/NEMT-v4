import React, { useState, useRef, useEffect, useCallback } from 'react';

const PRESETS = {
  triangle: [
    { x: 50, y: 0 },
    { x: 0, y: 100 },
    { x: 100, y: 100 },
  ],
  trapezoid: [
    { x: 20, y: 0 },
    { x: 80, y: 0 },
    { x: 100, y: 100 },
    { x: 0, y: 100 },
  ],
  parallelogram: [
    { x: 25, y: 0 },
    { x: 100, y: 0 },
    { x: 75, y: 100 },
    { x: 0, y: 100 },
  ],
  rhombus: [
    { x: 50, y: 0 },
    { x: 100, y: 50 },
    { x: 50, y: 100 },
    { x: 0, y: 50 },
  ],
  pentagon: [
    { x: 50, y: 0 },
    { x: 100, y: 38 },
    { x: 82, y: 100 },
    { x: 18, y: 100 },
    { x: 0, y: 38 },
  ],
  hexagon: [
    { x: 50, y: 0 },
    { x: 100, y: 25 },
    { x: 100, y: 75 },
    { x: 50, y: 100 },
    { x: 0, y: 75 },
    { x: 0, y: 25 },
  ],
  octagon: [
    { x: 30, y: 0 },
    { x: 70, y: 0 },
    { x: 100, y: 30 },
    { x: 100, y: 70 },
    { x: 70, y: 100 },
    { x: 30, y: 100 },
    { x: 0, y: 70 },
    { x: 0, y: 30 },
  ],
  star: [
    { x: 50, y: 0 },
    { x: 61, y: 35 },
    { x: 98, y: 35 },
    { x: 68, y: 57 },
    { x: 79, y: 91 },
    { x: 50, y: 70 },
    { x: 21, y: 91 },
    { x: 32, y: 57 },
    { x: 2, y: 35 },
    { x: 39, y: 35 },
  ],
  message: [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 75 },
    { x: 75, y: 75 },
    { x: 75, y: 100 },
    { x: 50, y: 75 },
    { x: 0, y: 75 },
  ],
  cross: [
    { x: 33, y: 0 },
    { x: 67, y: 0 },
    { x: 67, y: 33 },
    { x: 100, y: 33 },
    { x: 100, y: 67 },
    { x: 67, y: 67 },
    { x: 67, y: 100 },
    { x: 33, y: 100 },
    { x: 33, y: 67 },
    { x: 0, y: 67 },
    { x: 0, y: 33 },
    { x: 33, y: 33 },
  ],
};

const BACKGROUNDS = [
  { id: 'abstract', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop' },
  { id: 'nature', url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=2670&auto=format&fit=crop' },
  { id: 'gradient1', class: 'bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500' },
  { id: 'gradient2', class: 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500' },
  { id: 'gradient3', class: 'bg-gradient-to-tl from-emerald-400 to-cyan-400' },
];

export default function CSSClipPathStudio() {
  const [points, setPoints] = useState(PRESETS.hexagon);
  const [activePreset, setActivePreset] = useState('hexagon');
  const [background, setBackground] = useState(BACKGROUNDS[0]);
  const [draggingIdx, setDraggingIdx] = useState(null);
  const [showHandles, setShowHandles] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  
  const containerRef = useRef(null);

  const getClipPathString = () => {
    return `polygon(${points.map(p => `${Math.round(p.x)}% ${Math.round(p.y)}%`).join(', ')})`;
  };

  const handlePointerDown = (e, idx) => {
    e.stopPropagation();
    e.preventDefault();
    setDraggingIdx(idx);
  };

  const handlePointerMove = useCallback((e) => {
    if (draggingIdx === null || !containerRef.current) return;
    
    // Convert client coordinates to percentages relative to container
    const rect = containerRef.current.getBoundingClientRect();
    let x = ((e.clientX - rect.left) / rect.width) * 100;
    let y = ((e.clientY - rect.top) / rect.height) * 100;

    // Constrain points to 0-100%
    x = Math.max(0, Math.min(100, x));
    y = Math.max(0, Math.min(100, y));

    const newPoints = [...points];
    newPoints[draggingIdx] = { x, y };
    setPoints(newPoints);
    setActivePreset('custom'); // Once modified, it's custom
  }, [draggingIdx, points]);

  const handlePointerUp = useCallback(() => {
    setDraggingIdx(null);
  }, []);

  useEffect(() => {
    if (draggingIdx !== null) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    } else {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [draggingIdx, handlePointerMove, handlePointerUp]);

  const loadPreset = (key) => {
    setPoints([...PRESETS[key]]);
    setActivePreset(key);
  };

  const handleCopy = () => {
    const css = `clip-path: ${getClipPathString()};`;
    navigator.clipboard.writeText(css);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 font-sans">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 text-xs font-semibold uppercase tracking-wider mb-2">
          ✂️ CSS Layout Utility
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
          CSS Clip-Path <span className="text-cyan-500">Studio</span>
        </h1>
        <p className="text-gray-600 text-sm sm:text-base mt-2 max-w-2xl mx-auto">
          Visually build complex CSS polygon clip-paths. Drag the nodes to create custom shapes, then copy the CSS directly to your clipboard.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
            <h2 className="text-sm font-bold text-gray-800 border-b pb-3 mb-4 flex items-center justify-between">
              <span>📐 Shape Presets</span>
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {Object.keys(PRESETS).map((key) => (
                <button
                  key={key}
                  onClick={() => loadPreset(key)}
                  className={`py-2 px-1 text-xs rounded-lg font-medium capitalize transition-all border ${
                    activePreset === key
                      ? 'bg-cyan-50 border-cyan-500 text-cyan-700 shadow-sm'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
            <h2 className="text-sm font-bold text-gray-800 border-b pb-3 mb-4 flex items-center justify-between">
              <span>🖼️ Element Background</span>
            </h2>
            <div className="flex flex-wrap gap-3">
              {BACKGROUNDS.map((bg, i) => (
                <button
                  key={bg.id}
                  onClick={() => setBackground(bg)}
                  className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-transform ${
                    background.id === bg.id ? 'border-cyan-500 scale-110 shadow-md' : 'border-transparent hover:scale-105'
                  } ${bg.class || ''}`}
                  style={bg.url ? { backgroundImage: `url(${bg.url})`, backgroundSize: 'cover' } : {}}
                />
              ))}
            </div>
            
            <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="text-sm font-semibold text-gray-700">Show Drag Handles</span>
              <button
                onClick={() => setShowHandles(!showHandles)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 ${
                  showHandles ? 'bg-cyan-500' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    showHandles ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="bg-gray-900 rounded-2xl p-5 shadow-lg border border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Generated CSS
              </span>
              <button
                onClick={handleCopy}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg transition-colors flex items-center gap-1.5"
              >
                {copiedCode ? '✓ Copied' : '📋 Copy'}
              </button>
            </div>
            <code className="block w-full font-mono text-sm text-cyan-400 break-all leading-relaxed">
              clip-path: {getClipPathString()};
            </code>
          </div>
        </div>

        {/* Right Canvas */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 flex items-center justify-center min-h-[500px]">
          <div className="w-full max-w-lg aspect-square relative select-none">
            
            {/* The element being clipped */}
            <div
              className={`absolute inset-0 rounded-xl shadow-inner ${background.class || ''}`}
              style={{
                ...(background.url ? { backgroundImage: `url(${background.url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}),
                clipPath: getClipPathString(),
                WebkitClipPath: getClipPathString(),
                transition: draggingIdx === null ? 'clip-path 0.3s ease-out, -webkit-clip-path 0.3s ease-out' : 'none',
              }}
            >
              {/* Optional content inside the clipped element */}
              <div className="absolute inset-0 flex items-center justify-center opacity-80 mix-blend-overlay">
                <span className="text-white text-6xl sm:text-8xl font-black uppercase tracking-tighter opacity-20 transform -rotate-12">
                  CLIP
                </span>
              </div>
            </div>

            {/* SVG Overlay for drawing lines and interaction handles */}
            <svg
              ref={containerRef}
              className="absolute inset-0 w-full h-full overflow-visible touch-none"
              style={{ zIndex: 10 }}
            >
              {showHandles && (
                <>
                  {/* Connect the points with a dashed line outline */}
                  <polygon
                    points={points.map(p => `${p.x}%,${p.y}%`).join(' ')}
                    fill="none"
                    stroke="rgba(6, 182, 212, 0.4)" // cyan-500 with opacity
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    vectorEffect="non-scaling-stroke"
                    className="pointer-events-none"
                  />
                  
                  {/* Render interactive handles */}
                  {points.map((p, i) => (
                    <g key={i} transform={`translate(0, 0)`} className="cursor-pointer">
                      {/* Invisible larger circle for easier grabbing */}
                      <circle
                        cx={`${p.x}%`}
                        cy={`${p.y}%`}
                        r="20"
                        fill="transparent"
                        onPointerDown={(e) => handlePointerDown(e, i)}
                      />
                      {/* Visible handle */}
                      <circle
                        cx={`${p.x}%`}
                        cy={`${p.y}%`}
                        r={draggingIdx === i ? "8" : "6"}
                        fill={draggingIdx === i ? "#06b6d4" : "#fff"}
                        stroke="#06b6d4"
                        strokeWidth="3"
                        vectorEffect="non-scaling-stroke"
                        onPointerDown={(e) => handlePointerDown(e, i)}
                        className="transition-all duration-100"
                        style={{
                          filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.3))'
                        }}
                      />
                    </g>
                  ))}
                </>
              )}
            </svg>

          </div>
        </div>
      </div>
      
      {/* Educational Footer */}
      <div className="mt-8 bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100">
        <h3 className="text-sm font-bold text-indigo-900 mb-2 flex items-center gap-2">
          <span>💡</span> Why use clip-path?
        </h3>
        <p className="text-sm text-indigo-800/80 leading-relaxed">
          The <code>clip-path</code> CSS property allows you to make complex shapes in CSS by clipping an element to a basic shape (circle, ellipse, polygon, or inset), or to an SVG source. It's incredibly powerful for creating engaging, non-rectangular UI elements, dynamic image reveals, and modern design layouts without needing multiple PNG/SVG mask files.
        </p>
      </div>
    </div>
  );
}
