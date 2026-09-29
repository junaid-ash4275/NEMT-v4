import React, { useState, useEffect, useCallback } from 'react';

const generateRandomColor = () => {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase();
};

const ColorPaletteGenerator = () => {
  const [palette, setPalette] = useState(
    Array(5).fill(null).map(() => ({ color: generateRandomColor(), locked: false }))
  );
  const [copiedIndex, setCopiedIndex] = useState(null);

  const generatePalette = useCallback(() => {
    setPalette(prev => prev.map(p => (p.locked ? p : { ...p, color: generateRandomColor() })));
  }, []);

  const toggleLock = (index) => {
    setPalette(prev => prev.map((p, i) => i === index ? { ...p, locked: !p.locked } : p));
  };

  const copyToClipboard = (color, index) => {
    navigator.clipboard.writeText(color);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent space from scrolling down the page if they aren't typing in an input
      if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        generatePalette();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [generatePalette]);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 font-sans">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 text-xs font-semibold uppercase tracking-wider mb-2">
          🎨 Design Tool
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
          Color <span className="text-indigo-600">Palette Generator</span>
        </h1>
        <p className="text-gray-600 text-sm sm:text-base mt-2 max-w-2xl mx-auto">
          Press spacebar or click generate to create stunning color palettes. Lock colors you want to keep.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row h-[50vh] min-h-[400px] rounded-2xl overflow-hidden shadow-inner border border-gray-200">
          {palette.map((item, index) => (
            <div 
              key={index} 
              className="flex-1 flex flex-col items-center justify-end md:justify-center p-4 md:p-6 transition-colors duration-300 relative group cursor-pointer"
              style={{ backgroundColor: item.color }}
              onClick={() => copyToClipboard(item.color, index)}
            >
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-200" />
              
              <div className="relative z-10 flex flex-row md:flex-col items-center justify-between w-full md:w-auto gap-4 bg-white/90 backdrop-blur-sm px-4 py-3 md:py-6 md:px-4 rounded-xl shadow-sm opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                <button
                  onClick={(e) => { e.stopPropagation(); toggleLock(index); }}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  title={item.locked ? "Unlock color" : "Lock color"}
                >
                  {item.locked ? (
                    <span className="text-xl">🔒</span>
                  ) : (
                    <span className="text-xl">🔓</span>
                  )}
                </button>
                
                <div className="flex flex-col items-center">
                  <span className="text-lg font-bold text-gray-800 font-mono tracking-wider">{item.color}</span>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-widest mt-1">
                    {copiedIndex === index ? 'Copied!' : 'Copy Hex'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center mt-4">
          <button 
            onClick={generatePalette}
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/30 transition-all duration-200 active:scale-95 flex items-center gap-3 text-lg"
          >
            <span>✨</span> Generate Palette
          </button>
        </div>
      </div>
    </div>
  );
};

export default ColorPaletteGenerator;
