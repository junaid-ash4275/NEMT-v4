import React, { useState } from 'react';

const GlassmorphismGenerator = () => {
  const [blur, setBlur] = useState(10);
  const [opacity, setOpacity] = useState(0.2);
  const [color, setColor] = useState('#ffffff');
  const [copied, setCopied] = useState(false);

  // Convert hex to rgb
  const hexToRgb = (hex) => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex[1] + hex[2], 16);
      g = parseInt(hex[3] + hex[4], 16);
      b = parseInt(hex[5] + hex[6], 16);
    }
    return `${r}, ${g}, ${b}`;
  };

  const rgbColor = hexToRgb(color);

  const glassStyle = {
    background: `rgba(${rgbColor}, ${opacity})`,
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    backdropFilter: `blur(${blur}px)`,
    WebkitBackdropFilter: `blur(${blur}px)`,
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.18)',
  };

  const cssCode = `/* CSS */
.glass {
  background: rgba(${rgbColor}, ${opacity});
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  backdrop-filter: blur(${blur}px);
  -webkit-backdrop-filter: blur(${blur}px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.18);
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(cssCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex justify-center items-center min-h-[700px] p-5 bg-gradient-to-br from-blue-400 via-teal-400 to-emerald-400 rounded-2xl m-5 shadow-2xl relative overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute top-10 left-10 w-48 h-48 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-10 right-10 w-48 h-48 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-40 w-48 h-48 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl relative z-10">
        
        {/* Controls Card */}
        <div className="bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-xl flex-1 border border-white/50 transition-all">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent mb-2">
              Glassmorphism Studio
            </h2>
            <p className="text-gray-500 text-sm font-medium">
              Create the perfect frosted glass effect
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Blur</label>
                <span className="text-sm font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md">{blur}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                value={blur}
                onChange={(e) => setBlur(e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Opacity</label>
                <span className="text-sm font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md">{opacity}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={opacity}
                onChange={(e) => setOpacity(e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-12 h-12 p-1 rounded-lg border-2 border-gray-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="flex-1 p-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-teal-400 focus:ring-0 outline-none transition-colors text-gray-700 font-mono uppercase"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preview and Code */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="flex-1 flex items-center justify-center p-8 rounded-2xl min-h-[300px]" style={glassStyle}>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-md">Glass Effect</h3>
              <p className="text-white/90 font-medium drop-shadow-sm">Look through the glass.</p>
            </div>
          </div>

          <div className="bg-gray-900 rounded-2xl p-5 shadow-xl border border-gray-800 relative group">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">CSS Code</span>
              <button
                onClick={handleCopy}
                className={`text-xs font-bold px-4 py-1.5 rounded-lg transition-colors ${
                  copied
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {copied ? 'Copied!' : 'Copy CSS'}
              </button>
            </div>
            <pre className="text-emerald-400 font-mono text-sm overflow-x-auto p-4 bg-black/30 rounded-xl border border-white/5">
              {cssCode}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlassmorphismGenerator;
