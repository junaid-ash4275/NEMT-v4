import React, { useState, useEffect, useRef } from 'react';

const FractalTreeStudio = () => {
  const canvasRef = useRef(null);
  const [depth, setDepth] = useState(9);
  const [angle, setAngle] = useState(25);
  const [length, setLength] = useState(120);
  const [thickness, setThickness] = useState(12);
  const [treeColor, setTreeColor] = useState('#8B5A2B'); // Brown trunk
  const [leafColor, setLeafColor] = useState('#22c55e'); // Green leaves
  const [showLeaves, setShowLeaves] = useState(true);
  const [sway, setSway] = useState(false);
  const [asymmetry, setAsymmetry] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Using a fixed high-res internal canvas size for crisp rendering
    const width = 800;
    const height = 700;
    canvas.width = width;
    canvas.height = height;
    
    let animationFrameId;
    let startTime = Date.now();

    const render = () => {
      // Clear the canvas with a transparent background
      ctx.clearRect(0, 0, width, height);
      
      const time = Date.now() - startTime;
      
      const drawBranch = (startX, startY, len, currAngle, depthLevel, currThickness) => {
        ctx.beginPath();
        ctx.save();
        
        ctx.translate(startX, startY);
        
        // Add wind sway if active
        // The wind is stronger at the tips (lower depthLevel) and varies smoothly
        let windFactor = 0;
        if (sway) {
          const depthOffset = (depth - depthLevel) * 0.5;
          windFactor = Math.sin((time / 800) + depthOffset) * (10 / (depthLevel + 1));
        }
        
        ctx.rotate((currAngle + windFactor) * Math.PI / 180);
        ctx.moveTo(0, 0);
        
        // Draw the branch line
        // Add a slight curve using bezier or just a straight line
        ctx.lineTo(0, -len);
        
        // Branch color gets slightly greener towards the tips if leaves are off, 
        // otherwise just standard tree color. Here we just use treeColor
        ctx.strokeStyle = treeColor;
        ctx.lineWidth = currThickness;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Base case: end of the branch
        if (depthLevel <= 0) {
          if (showLeaves) {
            ctx.beginPath();
            // Draw a leaf
            ctx.ellipse(0, -len, currThickness * 3 + 2, currThickness * 6 + 4, 0, 0, Math.PI * 2);
            ctx.fillStyle = leafColor;
            // Add slight transparency to leaves
            ctx.globalAlpha = 0.8;
            ctx.fill();
            ctx.globalAlpha = 1.0;
          }
          ctx.restore();
          return;
        }

        // Branch lengths get shorter
        const newLen = len * 0.75;
        // The thickness gets thinner
        const newThickness = currThickness * 0.65;
        
        // Asymmetry logic - slight variations on left vs right branches
        const leftAngle = -angle + (asymmetry * 0.2);
        const rightAngle = angle + (asymmetry * 0.2);

        // Left branch
        drawBranch(0, -len, newLen * (1 - asymmetry * 0.02), leftAngle, depthLevel - 1, newThickness);
        // Right branch
        drawBranch(0, -len, newLen * (1 + asymmetry * 0.02), rightAngle, depthLevel - 1, newThickness);

        ctx.restore();
      };

      // Start drawing from the bottom center of the canvas
      drawBranch(width / 2, height, length, 0, depth, thickness);

      if (sway) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [depth, angle, length, thickness, treeColor, leafColor, showLeaves, sway, asymmetry]);

  const randomize = () => {
    setDepth(Math.floor(Math.random() * 6) + 5); // 5 to 10
    setAngle(Math.floor(Math.random() * 60) + 10); // 10 to 70
    setLength(Math.floor(Math.random() * 80) + 70); // 70 to 150
    setThickness(Math.floor(Math.random() * 15) + 5); // 5 to 20
    setAsymmetry(Math.floor(Math.random() * 10) - 5); // -5 to 5
    
    // Random harmonious colors
    const rT = Math.floor(Math.random() * 150);
    const gT = Math.floor(Math.random() * 150);
    const bT = Math.floor(Math.random() * 100);
    setTreeColor(`rgb(${rT}, ${gT}, ${bT})`);
    
    const rL = Math.floor(Math.random() * 100);
    const gL = Math.floor(Math.random() * 155) + 100;
    const bL = Math.floor(Math.random() * 150);
    setLeafColor(`rgb(${rL}, ${gL}, ${bL})`);
  };

  return (
    <div className="max-w-7xl mx-auto my-12 p-6 bg-white rounded-3xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] border border-gray-100 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full blur-3xl opacity-60 -mr-20 -mt-20"></div>
      
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Controls Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Fractal Tree Studio</h2>
            <p className="text-gray-500 mt-2 font-medium">Generate procedural algorithmic trees</p>
          </div>
          
          <div className="space-y-5 bg-gray-50 p-6 rounded-2xl border border-gray-100">
            {/* Iterations/Depth */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-semibold text-gray-700">Complexity (Depth)</label>
                <span className="text-sm font-bold text-green-600">{depth}</span>
              </div>
              <input 
                type="range" min="1" max="11" step="1" 
                value={depth} onChange={(e) => setDepth(Number(e.target.value))}
                className="w-full accent-green-600" 
              />
            </div>
            
            {/* Angle */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-semibold text-gray-700">Branch Angle</label>
                <span className="text-sm font-bold text-green-600">{angle}°</span>
              </div>
              <input 
                type="range" min="5" max="90" step="1" 
                value={angle} onChange={(e) => setAngle(Number(e.target.value))}
                className="w-full accent-green-600" 
              />
            </div>

            {/* Length */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-semibold text-gray-700">Trunk Length</label>
                <span className="text-sm font-bold text-green-600">{length}px</span>
              </div>
              <input 
                type="range" min="50" max="200" step="1" 
                value={length} onChange={(e) => setLength(Number(e.target.value))}
                className="w-full accent-green-600" 
              />
            </div>

            {/* Thickness */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-semibold text-gray-700">Trunk Thickness</label>
                <span className="text-sm font-bold text-green-600">{thickness}px</span>
              </div>
              <input 
                type="range" min="2" max="30" step="1" 
                value={thickness} onChange={(e) => setThickness(Number(e.target.value))}
                className="w-full accent-green-600" 
              />
            </div>
            
            {/* Asymmetry */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-semibold text-gray-700">Asymmetry (Chaos)</label>
                <span className="text-sm font-bold text-green-600">{asymmetry}</span>
              </div>
              <input 
                type="range" min="-10" max="10" step="1" 
                value={asymmetry} onChange={(e) => setAsymmetry(Number(e.target.value))}
                className="w-full accent-green-600" 
              />
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 block">Wood Color</label>
                <div className="flex items-center space-x-2">
                  <input 
                    type="color" 
                    value={treeColor.startsWith('rgb') ? '#8B5A2B' : treeColor} // simple fallback for color picker if random rgb used
                    onChange={(e) => setTreeColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border-0 p-0" 
                  />
                  <span className="text-xs text-gray-500 font-mono hidden sm:inline-block">Wood</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 block">Leaf Color</label>
                <div className="flex items-center space-x-2">
                  <input 
                    type="color" 
                    value={leafColor.startsWith('rgb') ? '#22c55e' : leafColor} 
                    onChange={(e) => setLeafColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border-0 p-0" 
                    disabled={!showLeaves}
                  />
                  <span className="text-xs text-gray-500 font-mono hidden sm:inline-block">Leaf</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button 
              onClick={() => setSway(!sway)}
              className={`py-3 px-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                sway 
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-200 shadow-inner'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {sway ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                  Wind: ON
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                  Wind: OFF
                </>
              )}
            </button>
            
            <button 
              onClick={() => setShowLeaves(!showLeaves)}
              className={`py-3 px-4 rounded-xl font-bold transition-all duration-300 ${
                showLeaves
                ? 'bg-green-100 text-green-700 border-2 border-green-200 shadow-inner'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              Leaves: {showLeaves ? 'ON' : 'OFF'}
            </button>
          </div>

          <button 
            onClick={randomize}
            className="w-full py-4 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-[1.02] active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-9.21l-5.36 5.36"></path></svg>
            Generate Random Tree
          </button>
        </div>
        
        {/* Canvas Area */}
        <div className="lg:col-span-2 bg-gradient-to-b from-sky-50 to-white rounded-2xl border-2 border-dashed border-gray-200 p-2 min-h-[500px] flex items-end justify-center overflow-hidden">
          <canvas 
            ref={canvasRef} 
            className="max-w-full h-auto object-contain pointer-events-none"
            style={{ maxHeight: '600px' }}
          />
        </div>
        
      </div>
    </div>
  );
};

export default FractalTreeStudio;
