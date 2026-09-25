import React, { useState } from 'react';

const AnimatedGradientStudio = () => {
  const [colors, setColors] = useState(['#ff0080', '#7928ca', '#ff0080']);
  const [angle, setAngle] = useState(45);
  const [duration, setDuration] = useState(10);
  const [zoom, setZoom] = useState(200);

  const addColor = () => {
    if (colors.length < 6) {
      setColors([...colors, '#3b82f6']);
    }
  };

  const removeColor = (index) => {
    if (colors.length > 2) {
      const newColors = [...colors];
      newColors.splice(index, 1);
      setColors(newColors);
    }
  };

  const updateColor = (index, value) => {
    const newColors = [...colors];
    newColors[index] = value;
    setColors(newColors);
  };

  const backgroundStyle = `linear-gradient(${angle}deg, ${colors.join(', ')})`;
  
  const cssOutput = `.animated-gradient {
  background: linear-gradient(${angle}deg, ${colors.join(', ')});
  background-size: ${zoom}% ${zoom}%;
  animation: gradientMove ${duration}s ease infinite;
}

@keyframes gradientMove {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}`;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 font-sans">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-600 text-xs font-semibold uppercase tracking-wider mb-2">
          ✨ Web Design Tool
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-3">
          Animated Gradient <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500">Studio</span>
        </h1>
        <p className="text-gray-500 text-sm sm:text-base max-w-2xl mx-auto">
          Design stunning, continuously flowing CSS background gradients for your modern web projects. Customize colors, angle, and speed.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Controls Panel */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 flex flex-col gap-8">
          
          {/* Color Stops */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span>🎨 Color Stops</span>
              </h2>
              {colors.length < 6 && (
                <button
                  onClick={addColor}
                  className="text-xs font-semibold px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center gap-1"
                >
                  <span className="text-lg leading-none">+</span> Add Color
                </button>
              )}
            </div>
            
            <div className="flex flex-wrap gap-4">
              {colors.map((color, index) => (
                <div key={index} className="relative group">
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative">
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => updateColor(index, e.target.value)}
                        className="w-14 h-14 rounded-2xl cursor-pointer border-2 border-gray-200 hover:border-gray-300 transition-colors shadow-sm p-0 appearance-none bg-transparent"
                      />
                      {colors.length > 2 && (
                        <button
                          onClick={() => removeColor(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 hover:bg-red-500 hover:text-white text-red-500 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <span className="text-xs font-mono text-gray-500 uppercase">{color}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm font-semibold text-gray-600 mb-2">
                <span>Gradient Angle</span>
                <span>{angle}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={angle}
                onChange={(e) => setAngle(e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm font-semibold text-gray-600 mb-2">
                <span>Animation Speed (Duration)</span>
                <span>{duration}s</span>
              </div>
              <input
                type="range"
                min="2"
                max="30"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm font-semibold text-gray-600 mb-2">
                <span>Background Zoom (Size)</span>
                <span>{zoom}%</span>
              </div>
              <input
                type="range"
                min="100"
                max="400"
                value={zoom}
                onChange={(e) => setZoom(e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6 flex flex-col">
          {/* Live Preview Box */}
          <div className="bg-white rounded-3xl p-4 shadow-xl border border-gray-100 h-64 sm:h-80 relative overflow-hidden flex-shrink-0 group">
            {/* We use an inline style tag here to inject the keyframes for this specific preview */}
            <style>{`
              @keyframes dynamicGradientMove {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
              }
              .preview-animated-bg {
                background: ${backgroundStyle};
                background-size: ${zoom}% ${zoom}%;
                animation: dynamicGradientMove ${duration}s ease infinite;
              }
            `}</style>
            
            <div className="preview-animated-bg absolute inset-0 transition-all duration-300"></div>
            
            <div className="absolute inset-0 flex items-center justify-center p-8 z-10 pointer-events-none">
              <div className="bg-white/20 backdrop-blur-md border border-white/30 p-6 rounded-2xl shadow-2xl text-center transform group-hover:scale-105 transition-transform duration-500">
                <h3 className="text-2xl font-bold text-white drop-shadow-md mb-1">Live Preview</h3>
                <p className="text-white/90 text-sm font-medium drop-shadow-sm">
                  Beautiful, mesmerizing flow
                </p>
              </div>
            </div>
          </div>

          {/* CSS Code Output */}
          <div className="bg-gray-900 rounded-3xl p-5 shadow-xl border border-gray-800 flex-grow flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                CSS Code
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(cssOutput);
                }}
                className="px-4 py-1.5 text-xs font-bold rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                📋 Copy CSS
              </button>
            </div>
            <div className="flex-grow bg-black/40 rounded-xl p-4 overflow-x-auto">
              <pre className="text-sm font-mono text-pink-400 m-0">
                {cssOutput}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedGradientStudio;
