import React, { useState } from 'react';

const CSSFilterStudio = () => {
  const [filters, setFilters] = useState({
    blur: 0,
    brightness: 100,
    contrast: 100,
    grayscale: 0,
    hueRotate: 0,
    invert: 0,
    saturate: 100,
    sepia: 0
  });

  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?q=80&w=1000&auto=format&fit=crop');

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const getFilterString = () => {
    const { blur, brightness, contrast, grayscale, hueRotate, invert, saturate, sepia } = filters;
    let filterString = '';
    if (blur > 0) filterString += `blur(${blur}px) `;
    if (brightness !== 100) filterString += `brightness(${brightness}%) `;
    if (contrast !== 100) filterString += `contrast(${contrast}%) `;
    if (grayscale > 0) filterString += `grayscale(${grayscale}%) `;
    if (hueRotate > 0) filterString += `hue-rotate(${hueRotate}deg) `;
    if (invert > 0) filterString += `invert(${invert}%) `;
    if (saturate !== 100) filterString += `saturate(${saturate}%) `;
    if (sepia > 0) filterString += `sepia(${sepia}%) `;
    return filterString.trim() || 'none';
  };

  const cssOutput = `.filtered-image {\n  filter: ${getFilterString()};\n}`;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 font-sans">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-600 text-xs font-semibold uppercase tracking-wider mb-2">
          🎨 Image Effect Tool
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
          CSS Filter <span className="text-pink-600">Studio</span>
        </h1>
        <p className="text-gray-600 text-sm sm:text-base mt-2 max-w-2xl mx-auto">
          Apply dynamic CSS filters to images in real-time and export the code for your projects.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Panel */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 shadow-lg border border-gray-100 flex flex-col gap-5 h-fit">
          <h2 className="text-lg font-bold text-gray-800 border-b pb-3 flex items-center gap-2">
            <span>🎛️ Adjust Filters</span>
          </h2>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {[
              { id: 'blur', label: 'Blur', min: 0, max: 20, unit: 'px' },
              { id: 'brightness', label: 'Brightness', min: 0, max: 200, unit: '%' },
              { id: 'contrast', label: 'Contrast', min: 0, max: 200, unit: '%' },
              { id: 'grayscale', label: 'Grayscale', min: 0, max: 100, unit: '%' },
              { id: 'hueRotate', label: 'Hue Rotate', min: 0, max: 360, unit: 'deg' },
              { id: 'invert', label: 'Invert', min: 0, max: 100, unit: '%' },
              { id: 'saturate', label: 'Saturate', min: 0, max: 300, unit: '%' },
              { id: 'sepia', label: 'Sepia', min: 0, max: 100, unit: '%' },
            ].map(filter => (
              <div key={filter.id} className="group">
                <div className="flex justify-between text-sm font-semibold text-gray-600 mb-2">
                  <span>{filter.label}</span>
                  <span className="text-pink-600 font-mono">{filters[filter.id]}{filter.unit}</span>
                </div>
                <input
                  type="range"
                  min={filter.min}
                  max={filter.max}
                  value={filters[filter.id]}
                  onChange={(e) => handleFilterChange(filter.id, Number(e.target.value))}
                  className="w-full accent-pink-600 cursor-pointer h-2 bg-gray-200 rounded-lg appearance-none"
                />
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t">
             <button
                onClick={() => setFilters({ blur: 0, brightness: 100, contrast: 100, grayscale: 0, hueRotate: 0, invert: 0, saturate: 100, sepia: 0 })}
                className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
             >
               Reset Filters
             </button>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 flex-grow relative overflow-hidden group min-h-[400px] flex flex-col">
            <div className="mb-3 flex justify-between items-center">
              <span className="text-sm font-bold text-gray-500 flex items-center gap-2">👁️ Preview</span>
              <input 
                type="text" 
                value={imageUrl} 
                onChange={(e) => setImageUrl(e.target.value)} 
                className="text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                placeholder="Paste Image URL here..."
              />
            </div>
            
            <div className="flex-grow w-full rounded-xl overflow-hidden bg-gray-100 relative grid place-items-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] shadow-inner border border-gray-200/60">
                <img 
                  src={imageUrl} 
                  alt="Filter Preview" 
                  className="max-w-full max-h-[500px] object-contain transition-all duration-300"
                  style={{ filter: getFilterString() }}
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/800x500?text=Invalid+Image+URL' }}
                />
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
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 transition-colors flex items-center gap-1"
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

export default CSSFilterStudio;
