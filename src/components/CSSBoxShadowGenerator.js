import React, { useState } from 'react';

const CSSBoxShadowGenerator = () => {
  const [horizontalOffset, setHorizontalOffset] = useState(10);
  const [verticalOffset, setVerticalOffset] = useState(10);
  const [blurRadius, setBlurRadius] = useState(15);
  const [spreadRadius, setSpreadRadius] = useState(-3);
  const [shadowColor, setShadowColor] = useState('rgba(0, 0, 0, 0.2)');
  const [shadowColorHex, setShadowColorHex] = useState('#000000');
  const [shadowOpacity, setShadowOpacity] = useState(0.2);
  const [isInset, setIsInset] = useState(false);
  const [copied, setCopied] = useState(false);

  // Convert hex to rgb string for rgba
  const hexToRgb = (hex) => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 7) {
      r = parseInt(hex.substring(1, 3), 16);
      g = parseInt(hex.substring(3, 5), 16);
      b = parseInt(hex.substring(5, 7), 16);
    }
    return `${r}, ${g}, ${b}`;
  };

  const handleColorChange = (e) => {
    const newHex = e.target.value;
    setShadowColorHex(newHex);
    setShadowColor(`rgba(${hexToRgb(newHex)}, ${shadowOpacity})`);
  };

  const handleOpacityChange = (e) => {
    const newOpacity = parseFloat(e.target.value);
    setShadowOpacity(newOpacity);
    setShadowColor(`rgba(${hexToRgb(shadowColorHex)}, ${newOpacity})`);
  };

  const boxShadowString = `${isInset ? 'inset ' : ''}${horizontalOffset}px ${verticalOffset}px ${blurRadius}px ${spreadRadius}px ${shadowColor}`;

  const copyToClipboard = () => {
    const cssCode = `box-shadow: ${boxShadowString};\n-webkit-box-shadow: ${boxShadowString};\n-moz-box-shadow: ${boxShadowString};`;
    navigator.clipboard.writeText(cssCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex justify-center items-center min-h-[600px] p-5 bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 rounded-2xl m-5 shadow-2xl">
      <div className="bg-white p-8 rounded-xl max-w-2xl w-full shadow-xl transition-all duration-300 grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left column: Controls */}
        <div className="space-y-5">
          <div className="text-left mb-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent mb-2">
              Box Shadow
            </h2>
            <p className="text-gray-500 text-sm">
              Generate perfect CSS shadows
            </p>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-bold text-gray-700 uppercase">Horizontal Offset</label>
              <span className="text-sm font-mono text-blue-600">{horizontalOffset}px</span>
            </div>
            <input 
              type="range" min="-50" max="50" 
              value={horizontalOffset} 
              onChange={(e) => setHorizontalOffset(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-bold text-gray-700 uppercase">Vertical Offset</label>
              <span className="text-sm font-mono text-blue-600">{verticalOffset}px</span>
            </div>
            <input 
              type="range" min="-50" max="50" 
              value={verticalOffset} 
              onChange={(e) => setVerticalOffset(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-bold text-gray-700 uppercase">Blur Radius</label>
              <span className="text-sm font-mono text-blue-600">{blurRadius}px</span>
            </div>
            <input 
              type="range" min="0" max="100" 
              value={blurRadius} 
              onChange={(e) => setBlurRadius(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-bold text-gray-700 uppercase">Spread Radius</label>
              <span className="text-sm font-mono text-blue-600">{spreadRadius}px</span>
            </div>
            <input 
              type="range" min="-50" max="50" 
              value={spreadRadius} 
              onChange={(e) => setSpreadRadius(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase mb-1">Shadow Color</label>
              <input 
                type="color" 
                value={shadowColorHex} 
                onChange={handleColorChange}
                className="w-full h-10 border-0 rounded cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm font-bold text-gray-700 uppercase">Opacity</label>
                <span className="text-sm font-mono text-blue-600">{shadowOpacity}</span>
              </div>
              <input 
                type="range" min="0" max="1" step="0.01"
                value={shadowOpacity} 
                onChange={handleOpacityChange}
                className="w-full h-2 mt-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>

          <div className="flex items-center mt-4">
            <input 
              type="checkbox" 
              id="inset-check" 
              checked={isInset} 
              onChange={(e) => setIsInset(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <label htmlFor="inset-check" className="ml-2 text-sm font-bold text-gray-700 uppercase">
              Inset Shadow
            </label>
          </div>
        </div>

        {/* Right column: Preview and Code */}
        <div className="flex flex-col items-center justify-center space-y-8 bg-gray-50 p-6 rounded-xl border border-gray-100">
          <div 
            className="w-48 h-48 bg-white rounded-xl flex items-center justify-center transition-all duration-100"
            style={{ boxShadow: boxShadowString }}
          >
            <span className="text-gray-400 font-bold uppercase tracking-widest text-sm">Preview</span>
          </div>

          <div className="w-full bg-gray-800 rounded-lg p-4 relative group">
            <p className="font-mono text-sm text-green-400 break-all">
              box-shadow: {boxShadowString};
            </p>
            <button
              onClick={copyToClipboard}
              className={`absolute top-2 right-2 px-3 py-1 rounded text-xs font-bold transition-colors ${
                copied 
                  ? 'bg-green-500 text-white' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CSSBoxShadowGenerator;
