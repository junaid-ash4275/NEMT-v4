import React, { useState } from 'react';

const BoxShadowGenerator = () => {
  const [hOffset, setHOffset] = useState(10);
  const [vOffset, setVOffset] = useState(10);
  const [blur, setBlur] = useState(15);
  const [spread, setSpread] = useState(0);
  const [color, setColor] = useState('#000000');
  const [opacity, setOpacity] = useState(0.2);
  const [boxColor, setBoxColor] = useState('#ffffff');
  const [bgColor, setBgColor] = useState('#f3f4f6');
  const [inset, setInset] = useState(false);

  // Convert hex to rgba
  const hexToRgba = (hex, alpha) => {
    let r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const shadowColorRgba = hexToRgba(color, opacity);
  const shadowValue = `${inset ? 'inset ' : ''}${hOffset}px ${vOffset}px ${blur}px ${spread}px ${shadowColorRgba}`;

  return (
    <div className="flex justify-center items-center min-h-[500px] p-5 bg-gradient-to-br from-teal-400 to-blue-500 rounded-2xl m-5 shadow-2xl">
      <div className="bg-white p-8 rounded-xl max-w-4xl w-full flex flex-col md:flex-row gap-8 shadow-xl">
        
        {/* Controls */}
        <div className="flex-1 space-y-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2 bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent">
            Box Shadow Generator
          </h2>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-gray-700 font-semibold text-sm">Horizontal Offset</label>
                <span className="text-blue-600 font-bold text-sm">{hOffset}px</span>
              </div>
              <input type="range" min="-50" max="50" value={hOffset} onChange={(e) => setHOffset(e.target.value)} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500" />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-gray-700 font-semibold text-sm">Vertical Offset</label>
                <span className="text-blue-600 font-bold text-sm">{vOffset}px</span>
              </div>
              <input type="range" min="-50" max="50" value={vOffset} onChange={(e) => setVOffset(e.target.value)} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500" />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-gray-700 font-semibold text-sm">Blur Radius</label>
                <span className="text-blue-600 font-bold text-sm">{blur}px</span>
              </div>
              <input type="range" min="0" max="100" value={blur} onChange={(e) => setBlur(e.target.value)} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500" />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-gray-700 font-semibold text-sm">Spread Radius</label>
                <span className="text-blue-600 font-bold text-sm">{spread}px</span>
              </div>
              <input type="range" min="-50" max="50" value={spread} onChange={(e) => setSpread(e.target.value)} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500" />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-gray-700 font-semibold text-sm">Opacity</label>
                <span className="text-blue-600 font-bold text-sm">{opacity}</span>
              </div>
              <input type="range" min="0" max="1" step="0.01" value={opacity} onChange={(e) => setOpacity(e.target.value)} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500" />
            </div>
          </div>

          <div className="flex items-center mt-4">
            <input type="checkbox" id="inset" checked={inset} onChange={(e) => setInset(e.target.checked)} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
            <label htmlFor="inset" className="ml-2 text-sm font-semibold text-gray-700">Inset Shadow</label>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            <div>
              <label className="block text-xs text-gray-500 font-semibold mb-1">Shadow Color</label>
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-full h-8 rounded cursor-pointer" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 font-semibold mb-1">Box Color</label>
              <input type="color" value={boxColor} onChange={(e) => setBoxColor(e.target.value)} className="w-full h-8 rounded cursor-pointer" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 font-semibold mb-1">Background</label>
              <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-full h-8 rounded cursor-pointer" />
            </div>
          </div>

        </div>

        {/* Preview */}
        <div className="flex-1 flex flex-col">
          <div 
            className="flex-1 flex items-center justify-center rounded-xl mb-4 transition-colors duration-300 min-h-[250px]"
            style={{ backgroundColor: bgColor }}
          >
            <div 
              className="w-48 h-48 rounded-xl flex items-center justify-center transition-all duration-300"
              style={{ 
                backgroundColor: boxColor,
                boxShadow: shadowValue
              }}
            >
              <span className="text-gray-500 font-medium mix-blend-luminosity">Preview</span>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg relative group border border-gray-100">
            <p className="text-xs text-gray-500 mb-2 font-bold uppercase tracking-wider">CSS Code</p>
            <code className="text-sm font-mono text-gray-800 break-all block">
              box-shadow: {shadowValue};
            </code>
            <button 
              onClick={() => navigator.clipboard.writeText(`box-shadow: ${shadowValue};`)}
              className="absolute top-3 right-3 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-md text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-200"
            >
              Copy
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BoxShadowGenerator;
