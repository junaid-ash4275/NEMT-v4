import React, { useState, useEffect } from 'react';

const ColorPaletteGenerator = () => {
  const [palette, setPalette] = useState([]);
  const [copiedColor, setCopiedColor] = useState(null);

  const generateRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const generatePalette = () => {
    const newPalette = Array.from({ length: 5 }, generateRandomColor);
    setPalette(newPalette);
    setCopiedColor(null);
  };

  useEffect(() => {
    generatePalette();
  }, []);

  const copyToClipboard = (color) => {
    navigator.clipboard.writeText(color);
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(null), 1500);
  };

  return (
    <div className="flex justify-center items-center min-h-[500px] p-5 bg-gradient-to-br from-teal-400 via-emerald-500 to-green-500 rounded-2xl m-5 shadow-2xl">
      <div className="bg-white p-8 rounded-xl max-w-md w-full shadow-xl transition-all duration-300">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-green-500 bg-clip-text text-transparent mb-2">
            Color Palette Generator
          </h2>
          <p className="text-gray-500 text-sm">
            Click any color to copy its HEX code
          </p>
        </div>

        <div className="flex flex-col gap-3 mb-8">
          {palette.map((color, index) => (
            <div
              key={index}
              onClick={() => copyToClipboard(color)}
              className="group relative flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all hover:scale-105 hover:shadow-md h-16"
              style={{ backgroundColor: color }}
            >
              <span className="bg-white/90 text-gray-800 px-3 py-1 rounded-lg font-mono font-bold text-sm shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                {color}
              </span>
              
              {copiedColor === color && (
                <span className="absolute right-4 bg-black/70 text-white text-xs px-2 py-1 rounded shadow-sm">
                  Copied!
                </span>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={generatePalette}
          className="w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95 bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-400 hover:to-green-400 shadow-teal-500/30 hover:shadow-teal-500/50"
        >
          Generate New Palette
        </button>
      </div>
    </div>
  );
};

export default ColorPaletteGenerator;
