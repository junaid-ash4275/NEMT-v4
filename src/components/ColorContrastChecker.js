import React, { useState } from 'react';

const ColorContrastChecker = () => {
  const [bgColor, setBgColor] = useState('#ffffff');
  const [textColor, setTextColor] = useState('#000000');

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

  const getLuminance = (r, g, b) => {
    const a = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const getContrastRatio = (color1, color2) => {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  };

  const isValidHex = (hex) => /^#([0-9A-F]{3}){1,2}$/i.test(hex);

  const validBg = isValidHex(bgColor) ? bgColor : '#ffffff';
  const validText = isValidHex(textColor) ? textColor : '#000000';
  
  const ratio = getContrastRatio(validBg, validText);
  const ratioString = ratio.toFixed(2);

  const getStatus = (ratio, threshold) => {
    return ratio >= threshold ? (
      <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded ml-2">Pass</span>
    ) : (
      <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded ml-2">Fail</span>
    );
  };

  return (
    <div className="flex justify-center items-center min-h-[500px] p-5 bg-gradient-to-tr from-emerald-400 via-teal-500 to-cyan-500 rounded-2xl m-5 shadow-2xl">
      <div className="bg-white p-8 rounded-xl max-w-2xl w-full shadow-xl">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent text-center">
          Color Contrast Checker
        </h2>

        <div className="flex flex-col md:flex-row gap-8 mb-8">
          <div className="flex-1">
            <label className="block text-gray-700 font-semibold mb-2">Background Color</label>
            <div className="flex items-center border-2 border-gray-200 rounded-lg p-2 focus-within:border-teal-500 transition-colors">
              <input 
                type="color" 
                value={validBg}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border-none p-0 bg-transparent"
              />
              <input
                type="text"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="ml-3 flex-1 outline-none text-gray-700 uppercase"
                placeholder="#FFFFFF"
              />
            </div>
          </div>
          
          <div className="flex-1">
            <label className="block text-gray-700 font-semibold mb-2">Text Color</label>
            <div className="flex items-center border-2 border-gray-200 rounded-lg p-2 focus-within:border-teal-500 transition-colors">
              <input 
                type="color" 
                value={validText}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border-none p-0 bg-transparent"
              />
              <input
                type="text"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="ml-3 flex-1 outline-none text-gray-700 uppercase"
                placeholder="#000000"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div 
            className="rounded-xl p-8 shadow-inner border border-gray-200 flex flex-col justify-center items-center text-center transition-colors duration-300"
            style={{ backgroundColor: validBg, color: validText }}
          >
            <p className="text-2xl font-bold mb-2">Large Text Preview</p>
            <p className="text-base">This is how normal text looks.</p>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 flex flex-col justify-center">
            <div className="text-center mb-6">
              <p className="text-gray-500 text-sm font-semibold mb-1">Contrast Ratio</p>
              <p className="text-5xl font-black text-gray-800">{ratioString}:1</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                <span className="text-sm font-medium text-gray-700">WCAG AA (Normal Text)</span>
                {getStatus(ratio, 4.5)}
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                <span className="text-sm font-medium text-gray-700">WCAG AA (Large Text)</span>
                {getStatus(ratio, 3.0)}
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                <span className="text-sm font-medium text-gray-700">WCAG AAA (Normal Text)</span>
                {getStatus(ratio, 7.0)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorContrastChecker;
