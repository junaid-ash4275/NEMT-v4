import React, { useState } from 'react';

const HexToRgbaConverter = () => {
  const [hex, setHex] = useState('#10b981');
  const [opacity, setOpacity] = useState(1);

  const hexToRgb = (hex) => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
      r = "0x" + hex[1] + hex[1];
      g = "0x" + hex[2] + hex[2];
      b = "0x" + hex[3] + hex[3];
    } else if (hex.length === 7) {
      r = "0x" + hex[1] + hex[2];
      g = "0x" + hex[3] + hex[4];
      b = "0x" + hex[5] + hex[6];
    }
    return { r: +r, g: +g, b: +b };
  };

  const handleHexChange = (e) => {
    setHex(e.target.value);
  };

  const handleOpacityChange = (e) => {
    setOpacity(e.target.value);
  };

  const isValidHex = /^#([0-9A-F]{3}){1,2}$/i.test(hex);
  const rgb = isValidHex ? hexToRgb(hex) : { r: 0, g: 0, b: 0 };
  const rgbaString = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;

  return (
    <div className="flex justify-center items-center min-h-[400px] p-5 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl m-5 shadow-2xl">
      <div className="bg-white p-10 rounded-xl max-w-md w-full text-center shadow-xl">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent">
          HEX to RGBA
        </h2>

        <div className="mb-6 text-left">
          <label className="block text-gray-700 font-semibold mb-2">HEX Color</label>
          <div className="flex items-center border-2 border-gray-200 rounded-lg p-2 focus-within:border-purple-500 transition-colors">
            <input 
              type="color" 
              value={isValidHex ? (hex.length === 4 ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}` : hex) : '#000000'}
              onChange={handleHexChange}
              className="w-10 h-10 rounded cursor-pointer border-none p-0 bg-transparent"
            />
            <input
              type="text"
              value={hex}
              onChange={handleHexChange}
              className="ml-3 flex-1 outline-none text-gray-700 uppercase"
              placeholder="#FFFFFF"
            />
          </div>
        </div>

        <div className="mb-8 text-left">
          <label className="block text-gray-700 font-semibold mb-2">
            Opacity: <span className="text-purple-600 font-bold">{opacity}</span>
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={opacity}
            onChange={handleOpacityChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
        </div>

        <div 
          className="h-32 w-full rounded-xl mb-6 shadow-inner transition-colors duration-300 flex items-center justify-center border border-gray-100"
          style={{ backgroundColor: isValidHex ? rgbaString : 'transparent' }}
        >
          {!isValidHex && <span className="text-gray-400">Invalid HEX</span>}
        </div>

        <div className="bg-gray-50 p-4 rounded-lg relative group">
          <p className="text-sm text-gray-500 mb-1 font-semibold">CSS Result</p>
          <code className="text-lg font-mono text-gray-800 break-all">
            {isValidHex ? rgbaString : 'Invalid Format'}
          </code>
          {isValidHex && (
            <button 
              onClick={() => navigator.clipboard.writeText(rgbaString)}
              className="absolute top-1/2 right-4 -translate-y-1/2 bg-purple-100 text-purple-700 px-3 py-1.5 rounded-md text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity hover:bg-purple-200"
            >
              Copy
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HexToRgbaConverter;
