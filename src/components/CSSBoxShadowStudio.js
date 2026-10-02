import React, { useState } from 'react';

const CSSBoxShadowStudio = () => {
  const [shadows, setShadows] = useState([
    {
      id: Date.now(),
      x: 10,
      y: 10,
      blur: 20,
      spread: 0,
      color: 'rgba(0, 0, 0, 0.25)',
      inset: false,
    }
  ]);

  const [boxColor, setBoxColor] = useState('#ffffff');
  const [bgColor, setBgColor] = useState('#f3f4f6');

  const addShadow = () => {
    setShadows([
      ...shadows,
      {
        id: Date.now(),
        x: 0,
        y: 0,
        blur: 10,
        spread: 0,
        color: 'rgba(0, 0, 0, 0.1)',
        inset: false,
      }
    ]);
  };

  const removeShadow = (id) => {
    if (shadows.length === 1) return; // Keep at least one
    setShadows(shadows.filter(s => s.id !== id));
  };

  const updateShadow = (id, field, value) => {
    setShadows(shadows.map(s => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const getShadowString = () => {
    return shadows.map(s => 
      `${s.inset ? 'inset ' : ''}${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${s.color}`
    ).join(', ');
  };

  const cssOutput = `.shadow-box {\n  box-shadow: ${getShadowString()};\n  background-color: ${boxColor};\n}`;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 font-sans" style={{ backgroundColor: bgColor }}>
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 text-xs font-semibold uppercase tracking-wider mb-2">
          ✨ Design Tool
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
          CSS Box Shadow <span className="text-indigo-600">Studio</span>
        </h1>
        <p className="text-gray-600 text-sm sm:text-base mt-2 max-w-2xl mx-auto">
          Create, layer, and customize beautiful CSS box shadows visually.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Panel */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 shadow-lg border border-gray-100 flex flex-col gap-5 max-h-[800px] overflow-y-auto">
          <div className="flex justify-between items-center border-b pb-3">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span>🎛️ Layers & Settings</span>
            </h2>
            <button 
              onClick={addShadow}
              className="text-sm px-3 py-1 bg-indigo-50 text-indigo-600 font-semibold rounded-lg hover:bg-indigo-100 transition"
            >
              + Add Layer
            </button>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Box Color</label>
              <input 
                type="color" 
                value={boxColor} 
                onChange={(e) => setBoxColor(e.target.value)}
                className="w-full h-10 rounded-lg cursor-pointer border-0 p-0"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Bg Color</label>
              <input 
                type="color" 
                value={bgColor} 
                onChange={(e) => setBgColor(e.target.value)}
                className="w-full h-10 rounded-lg cursor-pointer border-0 p-0"
              />
            </div>
          </div>

          <div className="space-y-6 mt-2">
            {shadows.map((shadow, index) => (
              <div key={shadow.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 relative group">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-gray-700">Layer {index + 1}</span>
                  {shadows.length > 1 && (
                    <button 
                      onClick={() => removeShadow(shadow.id)}
                      className="text-red-400 hover:text-red-600 transition"
                    >
                      ✖
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {/* X Offset */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-gray-500 mb-1">
                      <span>X Offset</span>
                      <span className="text-indigo-600 font-mono">{shadow.x}px</span>
                    </div>
                    <input type="range" min="-100" max="100" value={shadow.x} onChange={(e) => updateShadow(shadow.id, 'x', Number(e.target.value))} className="w-full accent-indigo-600 h-2 bg-gray-200 rounded-lg appearance-none" />
                  </div>
                  {/* Y Offset */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-gray-500 mb-1">
                      <span>Y Offset</span>
                      <span className="text-indigo-600 font-mono">{shadow.y}px</span>
                    </div>
                    <input type="range" min="-100" max="100" value={shadow.y} onChange={(e) => updateShadow(shadow.id, 'y', Number(e.target.value))} className="w-full accent-indigo-600 h-2 bg-gray-200 rounded-lg appearance-none" />
                  </div>
                  {/* Blur */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-gray-500 mb-1">
                      <span>Blur Radius</span>
                      <span className="text-indigo-600 font-mono">{shadow.blur}px</span>
                    </div>
                    <input type="range" min="0" max="150" value={shadow.blur} onChange={(e) => updateShadow(shadow.id, 'blur', Number(e.target.value))} className="w-full accent-indigo-600 h-2 bg-gray-200 rounded-lg appearance-none" />
                  </div>
                  {/* Spread */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-gray-500 mb-1">
                      <span>Spread Radius</span>
                      <span className="text-indigo-600 font-mono">{shadow.spread}px</span>
                    </div>
                    <input type="range" min="-50" max="100" value={shadow.spread} onChange={(e) => updateShadow(shadow.id, 'spread', Number(e.target.value))} className="w-full accent-indigo-600 h-2 bg-gray-200 rounded-lg appearance-none" />
                  </div>
                  {/* Color & Inset */}
                  <div className="flex gap-4 items-center">
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Shadow Color</label>
                      <input type="text" value={shadow.color} onChange={(e) => updateShadow(shadow.id, 'color', e.target.value)} className="w-full text-sm border-gray-300 rounded-lg py-1.5 px-3 border focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div className="flex items-center pt-5">
                      <input 
                        type="checkbox" 
                        id={`inset-${shadow.id}`}
                        checked={shadow.inset} 
                        onChange={(e) => updateShadow(shadow.id, 'inset', e.target.checked)}
                        className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <label htmlFor={`inset-${shadow.id}`} className="ml-2 text-sm font-medium text-gray-700 cursor-pointer">
                        Inset
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-gray-200/50 flex-grow relative overflow-hidden flex flex-col min-h-[400px]">
            <div className="mb-3 flex justify-between items-center">
              <span className="text-sm font-bold text-gray-600 flex items-center gap-2">👁️ Interactive Preview</span>
            </div>
            
            <div className="flex-grow w-full rounded-xl overflow-hidden flex items-center justify-center transition-colors duration-300" style={{ backgroundColor: bgColor }}>
                <div 
                  className="w-48 h-48 sm:w-64 sm:h-64 rounded-2xl transition-all duration-300 ease-in-out flex items-center justify-center"
                  style={{ 
                    backgroundColor: boxColor,
                    boxShadow: getShadowString()
                  }}
                >
                  <span className="text-gray-400 font-semibold opacity-50 select-none">Preview</span>
                </div>
            </div>
          </div>

          {/* Code Output */}
          <div className="bg-gray-900 rounded-2xl p-5 shadow-lg border border-gray-800">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                CSS Code
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(cssOutput);
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 transition-colors flex items-center gap-1"
              >
                📋 Copy CSS
              </button>
            </div>
            <pre className="text-sm font-mono text-green-400 overflow-x-auto p-4 bg-black/40 rounded-xl whitespace-pre-wrap border border-gray-800 shadow-inner">
              {cssOutput}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CSSBoxShadowStudio;
