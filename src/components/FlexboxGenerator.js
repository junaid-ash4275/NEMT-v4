import React, { useState } from 'react';

const FlexboxGenerator = () => {
  const [flexDirection, setFlexDirection] = useState('row');
  const [justifyContent, setJustifyContent] = useState('flex-start');
  const [alignItems, setAlignItems] = useState('stretch');
  const [flexWrap, setFlexWrap] = useState('nowrap');
  const [gap, setGap] = useState(16);
  const [itemCount, setItemCount] = useState(3);

  const containerStyle = {
    display: 'flex',
    flexDirection,
    justifyContent,
    alignItems,
    flexWrap,
    gap: `${gap}px`,
    minHeight: '300px',
    backgroundColor: '#f3f4f6',
    border: '2px dashed #cbd5e1',
    borderRadius: '0.5rem',
    padding: '1rem',
  };

  const cssCode = `.flex-container {
  display: flex;
  flex-direction: ${flexDirection};
  justify-content: ${justifyContent};
  align-items: ${alignItems};
  flex-wrap: ${flexWrap};
  gap: ${gap}px;
}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(cssCode);
    alert('CSS copied to clipboard!');
  };

  return (
    <div className="max-w-4xl mx-auto my-10 p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Flexbox Playground</h2>
        <p className="mt-2 text-gray-600">Interactively generate and test CSS Flexbox layouts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Controls Section */}
        <div className="md:col-span-1 space-y-5 bg-gray-50 p-5 rounded-xl border border-gray-100">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Flex Direction</label>
            <select 
              value={flexDirection} 
              onChange={(e) => setFlexDirection(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="row">row</option>
              <option value="row-reverse">row-reverse</option>
              <option value="column">column</option>
              <option value="column-reverse">column-reverse</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Justify Content</label>
            <select 
              value={justifyContent} 
              onChange={(e) => setJustifyContent(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="flex-start">flex-start</option>
              <option value="flex-end">flex-end</option>
              <option value="center">center</option>
              <option value="space-between">space-between</option>
              <option value="space-around">space-around</option>
              <option value="space-evenly">space-evenly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Align Items</label>
            <select 
              value={alignItems} 
              onChange={(e) => setAlignItems(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="stretch">stretch</option>
              <option value="flex-start">flex-start</option>
              <option value="flex-end">flex-end</option>
              <option value="center">center</option>
              <option value="baseline">baseline</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Flex Wrap</label>
            <select 
              value={flexWrap} 
              onChange={(e) => setFlexWrap(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="nowrap">nowrap</option>
              <option value="wrap">wrap</option>
              <option value="wrap-reverse">wrap-reverse</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Gap: {gap}px</label>
            <input 
              type="range" 
              min="0" max="100" 
              value={gap} 
              onChange={(e) => setGap(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Number of Items: {itemCount}</label>
            <input 
              type="range" 
              min="1" max="12" 
              value={itemCount} 
              onChange={(e) => setItemCount(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        {/* Preview Section */}
        <div className="md:col-span-2 flex flex-col space-y-4">
          <div style={containerStyle} className="transition-all duration-300 w-full overflow-hidden">
            {Array.from({ length: itemCount }).map((_, i) => (
              <div 
                key={i} 
                className="bg-indigo-500 text-white font-bold flex items-center justify-center rounded shadow-sm transition-all"
                style={{
                  padding: '1rem',
                  minWidth: '60px',
                  minHeight: '60px',
                  fontSize: '1.25rem'
                }}
              >
                {i + 1}
              </div>
            ))}
          </div>

          {/* Code Output */}
          <div className="relative group">
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto text-sm font-mono shadow-inner">
              <code>{cssCode}</code>
            </pre>
            <button 
              onClick={copyToClipboard}
              className="absolute top-3 right-3 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur transition-all"
            >
              Copy CSS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlexboxGenerator;
