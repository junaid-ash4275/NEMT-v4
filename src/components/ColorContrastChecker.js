import React, { useState, useEffect } from 'react';

const ColorContrastChecker = () => {
  const [textColor, setTextColor] = useState('#ffffff');
  const [bgColor, setBgColor] = useState('#0d9488'); // teal-600
  const [ratio, setRatio] = useState(0);

  const getLuminance = (hex) => {
    let rgb = hex.replace(/^#/, '');
    if (rgb.length === 3) rgb = rgb.split('').map(c => c + c).join('');
    
    let r = parseInt(rgb.slice(0, 2), 16) / 255;
    let g = parseInt(rgb.slice(2, 4), 16) / 255;
    let b = parseInt(rgb.slice(4, 6), 16) / 255;

    // Handle invalid hex gracefully
    if (isNaN(r) || isNaN(g) || isNaN(b)) return 0;

    const [rs, gs, bs] = [r, g, b].map(c => {
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const calculateRatio = (color1, color2) => {
    const l1 = getLuminance(color1);
    const l2 = getLuminance(color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return ((lighter + 0.05) / (darker + 0.05)).toFixed(2);
  };

  useEffect(() => {
    // Check if valid hex
    const isValidHex = (hex) => /^#([0-9A-F]{3}){1,2}$/i.test(hex);
    if (isValidHex(textColor) && isValidHex(bgColor)) {
      setRatio(calculateRatio(textColor, bgColor));
    }
  }, [textColor, bgColor]);

  const aaNormal = ratio >= 4.5;
  const aaLarge = ratio >= 3.0;
  const aaaNormal = ratio >= 7.0;
  const aaaLarge = ratio >= 4.5;

  return (
    <div className="flex justify-center items-center min-h-[600px] p-5 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl m-5 shadow-2xl relative overflow-hidden">
      <div className="bg-white p-8 rounded-2xl max-w-4xl w-full shadow-xl transition-all duration-300 z-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-pink-500 bg-clip-text text-transparent mb-2">
            Color Contrast Checker
          </h2>
          <p className="text-gray-500 text-sm font-medium">
            Check WCAG accessibility contrast ratio for your colors
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Text Color Input */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Text Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-14 h-14 p-1 rounded-xl border-2 border-gray-200 cursor-pointer bg-white"
              />
              <input
                type="text"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="flex-1 p-4 bg-white border-2 border-gray-200 rounded-xl focus:border-indigo-400 focus:ring-0 outline-none transition-colors text-gray-700 font-mono text-lg uppercase"
              />
            </div>
          </div>

          {/* Background Color Input */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Background Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-14 h-14 p-1 rounded-xl border-2 border-gray-200 cursor-pointer bg-white"
              />
              <input
                type="text"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="flex-1 p-4 bg-white border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:ring-0 outline-none transition-colors text-gray-700 font-mono text-lg uppercase"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Preview */}
          <div 
            className="rounded-2xl p-8 min-h-[250px] flex flex-col justify-center items-center text-center transition-colors duration-300 border-4 border-gray-100"
            style={{ backgroundColor: bgColor, color: textColor }}
          >
            <h3 className="text-4xl font-bold mb-4">Preview Text</h3>
            <p className="text-lg font-medium max-w-md">
              This is a sample paragraph to demonstrate the visual contrast between the chosen text and background colors.
            </p>
          </div>

          {/* Results */}
          <div className="bg-gray-900 rounded-2xl p-6 text-white flex flex-col justify-center">
            <div className="text-center mb-6">
              <div className="text-sm text-gray-400 uppercase tracking-widest font-bold mb-2">Contrast Ratio</div>
              <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                {ratio}:1
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800 p-4 rounded-xl">
                <div className="text-xs text-gray-400 font-bold mb-2 uppercase tracking-wide">WCAG AA</div>
                <div className="flex justify-between items-center mb-1 text-sm">
                  <span>Normal Text</span>
                  <span className={`font-bold px-2 py-0.5 rounded ${aaNormal ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {aaNormal ? 'PASS' : 'FAIL'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Large Text</span>
                  <span className={`font-bold px-2 py-0.5 rounded ${aaLarge ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {aaLarge ? 'PASS' : 'FAIL'}
                  </span>
                </div>
              </div>
              <div className="bg-gray-800 p-4 rounded-xl">
                <div className="text-xs text-gray-400 font-bold mb-2 uppercase tracking-wide">WCAG AAA</div>
                <div className="flex justify-between items-center mb-1 text-sm">
                  <span>Normal Text</span>
                  <span className={`font-bold px-2 py-0.5 rounded ${aaaNormal ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {aaaNormal ? 'PASS' : 'FAIL'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Large Text</span>
                  <span className={`font-bold px-2 py-0.5 rounded ${aaaLarge ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {aaaLarge ? 'PASS' : 'FAIL'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorContrastChecker;
