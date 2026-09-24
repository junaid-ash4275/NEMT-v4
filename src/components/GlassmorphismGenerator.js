import React, { useState } from 'react';

const GlassmorphismGenerator = () => {
  const [blur, setBlur] = useState(10);
  const [opacity, setOpacity] = useState(30);
  const [color, setColor] = useState('#ffffff');
  const [borderOpacity, setBorderOpacity] = useState(20);
  const [shadowOpacity, setShadowOpacity] = useState(10);

  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
  };

  const rgbColor = hexToRgb(color);

  const cssOutput = `.glass-panel {
  background: rgba(${rgbColor}, ${opacity / 100});
  backdrop-filter: blur(${blur}px);
  -webkit-backdrop-filter: blur(${blur}px);
  border: 1px solid rgba(${rgbColor}, ${borderOpacity / 100});
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, ${shadowOpacity / 100});
  border-radius: 16px;
}`;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 font-sans">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 text-xs font-semibold uppercase tracking-wider mb-2">
          ✨ UI Design Tool
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
          Glassmorphism <span className="text-indigo-600">Generator</span>
        </h1>
        <p className="text-gray-600 text-sm sm:text-base mt-2 max-w-2xl mx-auto">
          Create stunning frosted glass effects for your modern UI designs. Adjust parameters and copy the CSS instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* Controls Panel */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 flex flex-col gap-6">
          <h2 className="text-lg font-bold text-gray-800 border-b pb-3 flex items-center gap-2">
            <span>🎛️ Adjust Properties</span>
          </h2>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm font-semibold text-gray-600 mb-2">
                <span>Blur Value</span>
                <span>{blur}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                value={blur}
                onChange={(e) => setBlur(e.target.value)}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm font-semibold text-gray-600 mb-2">
                <span>Background Opacity</span>
                <span>{opacity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={opacity}
                onChange={(e) => setOpacity(e.target.value)}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm font-semibold text-gray-600 mb-2">
                <span>Border Opacity</span>
                <span>{borderOpacity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={borderOpacity}
                onChange={(e) => setBorderOpacity(e.target.value)}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm font-semibold text-gray-600 mb-2">
                <span>Shadow Opacity</span>
                <span>{shadowOpacity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={shadowOpacity}
                onChange={(e) => setShadowOpacity(e.target.value)}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">Base Color</label>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-12 h-12 rounded-lg cursor-pointer border-0 p-0"
                />
                <span className="font-mono text-sm uppercase text-gray-700 bg-gray-100 px-3 py-1 rounded-md border border-gray-200">
                  {color}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 h-80 relative overflow-hidden group">
            {/* Colorful Mesh Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 z-0">
              <div className="absolute top-[-50%] left-[-20%] w-[150%] h-[150%] bg-gradient-to-tr from-cyan-400/60 to-transparent rounded-full mix-blend-overlay animate-spin-slow"></div>
              <div className="absolute bottom-[-30%] right-[-20%] w-[100%] h-[100%] bg-gradient-to-tl from-yellow-300/50 to-transparent rounded-full mix-blend-overlay"></div>
            </div>

            {/* Background floating shapes */}
            <div className="absolute top-10 left-10 w-24 h-24 bg-white/20 rounded-full blur-xl z-0"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-indigo-900/30 rounded-full blur-xl z-0"></div>

            {/* Glass Panel */}
            <div className="absolute inset-0 flex items-center justify-center p-8 z-10">
              <div
                style={{
                  background: `rgba(${rgbColor}, ${opacity / 100})`,
                  backdropFilter: `blur(${blur}px)`,
                  WebkitBackdropFilter: `blur(${blur}px)`,
                  border: `1px solid rgba(${rgbColor}, ${borderOpacity / 100})`,
                  boxShadow: `0 8px 32px 0 rgba(0, 0, 0, ${shadowOpacity / 100})`,
                  borderRadius: '16px',
                }}
                className="w-full h-full p-8 flex flex-col justify-center items-center text-center transition-all duration-300"
              >
                <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-md">Glass Effect</h3>
                <p className="text-white/90 text-sm font-medium">
                  Frosted glass layered over a vibrant background.
                </p>
              </div>
            </div>
          </div>

          {/* Code Output */}
          <div className="bg-gray-900 rounded-2xl p-5 shadow-lg border border-gray-800">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                CSS Code
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(cssOutput);
                }}
                className="px-3 py-1 text-xs font-semibold rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 transition-colors"
              >
                📋 Copy CSS
              </button>
            </div>
            <pre className="text-sm font-mono text-green-400 overflow-x-auto p-2 bg-black/30 rounded-lg">
              {cssOutput}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlassmorphismGenerator;
