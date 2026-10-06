import React, { useState, useEffect } from 'react';

const ColorContrastChecker = () => {
  const [foregroundColor, setForegroundColor] = useState('#ffffff');
  const [backgroundColor, setBackgroundColor] = useState('#2563eb'); // A nice blue
  const [contrastRatio, setContrastRatio] = useState('0.00');
  const [results, setResults] = useState({
    AA_normal: false,
    AA_large: false,
    AAA_normal: false,
    AAA_large: false,
  });

  const hexToRgb = (hex) => {
    let c;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
      c = hex.substring(1).split('');
      if (c.length === 3) {
        c = [c[0], c[0], c[1], c[1], c[2], c[2]];
      }
      c = '0x' + c.join('');
      return [(c >> 16) & 255, (c >> 8) & 255, c & 255];
    }
    return [0, 0, 0];
  };

  const getLuminance = (r, g, b) => {
    let a = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  useEffect(() => {
    const rgb1 = hexToRgb(foregroundColor);
    const rgb2 = hexToRgb(backgroundColor);
    const lum1 = getLuminance(rgb1[0], rgb1[1], rgb1[2]);
    const lum2 = getLuminance(rgb2[0], rgb2[1], rgb2[2]);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    const ratio = (brightest + 0.05) / (darkest + 0.05);
    
    setContrastRatio(ratio.toFixed(2));
    setResults({
      AA_normal: ratio >= 4.5,
      AA_large: ratio >= 3.0,
      AAA_normal: ratio >= 7.0,
      AAA_large: ratio >= 4.5,
    });
  }, [foregroundColor, backgroundColor]);

  const handleSwapColors = () => {
    const temp = foregroundColor;
    setForegroundColor(backgroundColor);
    setBackgroundColor(temp);
  };

  const Badge = ({ passes }) => (
    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${passes ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
      {passes ? 'Pass' : 'Fail'}
    </span>
  );

  return (
    <div className="max-w-4xl mx-auto my-10 p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Color Contrast Checker</h2>
        <p className="mt-2 text-gray-600">Ensure your text is readable and accessible by checking the WCAG contrast ratio.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Controls Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Foreground Color (Text)</label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={foregroundColor}
                onChange={(e) => setForegroundColor(e.target.value)}
                className="w-12 h-12 rounded cursor-pointer border-0 p-0"
              />
              <input
                type="text"
                value={foregroundColor.toUpperCase()}
                onChange={(e) => setForegroundColor(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition uppercase"
              />
            </div>
          </div>

          <div className="flex items-center justify-center -my-2 relative z-10">
            <button 
              onClick={handleSwapColors}
              className="p-2 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md transition-all hover:bg-gray-50 active:scale-95"
              title="Swap Colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Background Color</label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-12 h-12 rounded cursor-pointer border-0 p-0"
              />
              <input
                type="text"
                value={backgroundColor.toUpperCase()}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition uppercase"
              />
            </div>
          </div>

          <div className="p-5 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-end justify-between mb-4">
              <span className="text-gray-600 font-medium text-sm uppercase tracking-wider">Contrast Ratio</span>
              <div className="flex items-baseline space-x-1">
                <span className={`text-4xl font-black ${parseFloat(contrastRatio) >= 4.5 ? 'text-green-600' : 'text-red-600'}`}>
                  {contrastRatio}
                </span>
                <span className="text-xl font-bold text-gray-400">: 1</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700 font-medium">WCAG AA (Normal Text)</span>
                <Badge passes={results.AA_normal} />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700 font-medium">WCAG AA (Large Text)</span>
                <Badge passes={results.AA_large} />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700 font-medium">WCAG AAA (Normal Text)</span>
                <Badge passes={results.AAA_normal} />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700 font-medium">WCAG AAA (Large Text)</span>
                <Badge passes={results.AAA_large} />
              </div>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div 
          className="rounded-xl overflow-hidden shadow-inner border border-gray-200 flex flex-col transition-colors duration-300"
          style={{ backgroundColor: backgroundColor }}
        >
          <div className="p-8 flex-1 flex flex-col justify-center" style={{ color: foregroundColor }}>
            <h3 className="text-3xl font-bold mb-4">Large Text Preview</h3>
            <p className="text-base leading-relaxed mb-4">
              This is a preview of normal text (usually 14pt or 16px). A contrast ratio of 4.5:1 is the minimum requirement for normal text according to WCAG AA standards.
            </p>
            <p className="text-sm opacity-80">
              Smaller text or thinner fonts may require even higher contrast to remain legible. Always prioritize readability for your users.
            </p>
            
            <div className="mt-8 pt-6 border-t" style={{ borderColor: foregroundColor, opacity: 0.2 }}></div>
            <div className="mt-6 flex space-x-4">
              <button 
                className="px-6 py-2 rounded-lg font-semibold transition-opacity hover:opacity-80"
                style={{ backgroundColor: foregroundColor, color: backgroundColor }}
              >
                Primary Action
              </button>
              <button 
                className="px-6 py-2 rounded-lg font-semibold border-2 transition-opacity hover:opacity-80"
                style={{ borderColor: foregroundColor, color: foregroundColor }}
              >
                Secondary
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorContrastChecker;
