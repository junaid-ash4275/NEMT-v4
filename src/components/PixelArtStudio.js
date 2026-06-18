import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

const PALETTES = {
  vaporwave: {
    name: '🌸 Vaporwave',
    colors: ['#ff71ce', '#01cdfe', '#05ffa1', '#b967ff', '#fffb96', '#ffffff', '#000000']
  },
  gameboy: {
    name: '👾 Gameboy Classic',
    colors: ['#0f380f', '#306230', '#8bac0f', '#9bbc0f', '#ffffff', '#000000']
  },
  cyberpunk: {
    name: '⚡ Cyberpunk',
    colors: ['#f72585', '#7209b7', '#3f37c9', '#4cc9f0', '#48cae4', '#ffffff', '#000000']
  },
  autumn: {
    name: '🍂 Warm Autumn',
    colors: ['#d94e34', '#f2a154', '#f2c12e', '#8c583e', '#563624', '#ffffff', '#000000']
  },
  ocean: {
    name: '🌊 Ocean Depths',
    colors: ['#03045e', '#0077b6', '#00b4d8', '#90e0ef', '#caf0f8', '#ffffff', '#000000']
  },
  pastel: {
    name: '🍬 Pastel Candy',
    colors: ['#ffb7b2', '#ffdac1', '#e2f0cb', '#b5ead7', '#c7ceea', '#ffffff', '#000000']
  }
};

const PixelArtStudio = () => {
  const [gridSize, setGridSize] = useState(16); // 8, 16, 32
  const [frames, setFrames] = useState([Array(16 * 16).fill('')]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [currentColor, setCurrentColor] = useState('#ff71ce');
  const [currentTool, setCurrentTool] = useState('pencil'); // pencil, eraser, bucket, eyedropper
  const [showGridLines, setShowGridLines] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [fps, setFps] = useState(6);
  const [activePalette, setActivePalette] = useState('vaporwave');
  const [customColors, setCustomColors] = useState(['#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b']);
  const [activeTab, setActiveTab] = useState('css'); // css, json
  const [jsonInput, setJsonInput] = useState('');

  // Undo / Redo History State
  const [history, setHistory] = useState([[Array(16 * 16).fill('')]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Drawing Refs
  const isDrawingRef = useRef(false);
  const hasChangedRef = useRef(false);
  const gridContainerRef = useRef(null);

  // Initialize/Reset Grid
  const resetGrid = (size) => {
    const emptyGrid = Array(size * size).fill('');
    setFrames([emptyGrid]);
    setCurrentFrameIndex(0);
    setHistory([ [emptyGrid] ]);
    setHistoryIndex(0);
    setIsPlaying(false);
  };

  const handleGridSizeChange = (newSize) => {
    if (window.confirm(`Changing size to ${newSize}x${newSize} will clear your current drawing. Continue?`)) {
      setGridSize(newSize);
      resetGrid(newSize);
    }
  };

  // Setup undo history update
  const pushToHistory = useCallback((newFrames) => {
    const nextHistory = history.slice(0, historyIndex + 1);
    const historyState = JSON.parse(JSON.stringify(newFrames));
    setHistory([...nextHistory, historyState]);
    setHistoryIndex(nextHistory.length);
  }, [history, historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      const targetIndex = historyIndex - 1;
      setHistoryIndex(targetIndex);
      setFrames(JSON.parse(JSON.stringify(history[targetIndex])));
      if (currentFrameIndex >= history[targetIndex].length) {
        setCurrentFrameIndex(history[targetIndex].length - 1);
      }
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const targetIndex = historyIndex + 1;
      setHistoryIndex(targetIndex);
      setFrames(JSON.parse(JSON.stringify(history[targetIndex])));
      if (currentFrameIndex >= history[targetIndex].length) {
        setCurrentFrameIndex(history[targetIndex].length - 1);
      }
    }
  };

  // Flood fill algorithm
  const floodFill = (grid, startIndex, targetColor, replacementColor) => {
    if (targetColor === replacementColor) return grid;
    const newGrid = [...grid];
    const queue = [startIndex];
    const visited = new Set([startIndex]);

    while (queue.length > 0) {
      const curr = queue.shift();
      newGrid[curr] = replacementColor;

      const r = Math.floor(curr / gridSize);
      const c = curr % gridSize;

      const neighbors = [];
      if (r > 0) neighbors.push((r - 1) * gridSize + c);
      if (r < gridSize - 1) neighbors.push((r + 1) * gridSize + c);
      if (c > 0) neighbors.push(r * gridSize + (c - 1));
      if (c < gridSize - 1) neighbors.push(r * gridSize + (c + 1));

      for (const n of neighbors) {
        if (!visited.has(n) && newGrid[n] === targetColor) {
          visited.add(n);
          queue.push(n);
        }
      }
    }
    return newGrid;
  };

  const handleBucketFill = (index, color) => {
    const currentGrid = frames[currentFrameIndex];
    const targetColor = currentGrid[index];
    const filledGrid = floodFill(currentGrid, index, targetColor, color);

    const newFrames = [...frames];
    newFrames[currentFrameIndex] = filledGrid;
    setFrames(newFrames);
    pushToHistory(newFrames);
  };

  // Mouse / Drawing Events
  const handleCellAction = (index) => {
    const currentGrid = frames[currentFrameIndex];

    if (currentTool === 'eyedropper') {
      if (currentGrid[index]) {
        setCurrentColor(currentGrid[index]);
        setCurrentTool('pencil');
      }
      return;
    }

    const newColor = currentTool === 'eraser' ? '' : currentColor;

    if (currentTool === 'bucket') {
      handleBucketFill(index, newColor);
      return;
    }

    // Pencil / Eraser
    if (currentGrid[index] === newColor) return;

    const newGrid = [...currentGrid];
    newGrid[index] = newColor;
    const newFrames = [...frames];
    newFrames[currentFrameIndex] = newGrid;
    setFrames(newFrames);
    hasChangedRef.current = true;
  };

  // Global mouse up registration
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDrawingRef.current) {
        isDrawingRef.current = false;
        if (hasChangedRef.current) {
          pushToHistory(frames);
          hasChangedRef.current = false;
        }
      }
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [frames, historyIndex, history, pushToHistory]);

  // Animation playback loop
  useEffect(() => {
    let intervalId;
    if (isPlaying && frames.length > 0) {
      intervalId = setInterval(() => {
        setCurrentFrameIndex((prev) => (prev + 1) % frames.length);
      }, 1000 / fps);
    }
    return () => clearInterval(intervalId);
  }, [isPlaying, fps, frames.length]);

  // Frame operations
  const addFrame = () => {
    const newFrames = [...frames];
    const emptyGrid = Array(gridSize * gridSize).fill('');
    newFrames.splice(currentFrameIndex + 1, 0, emptyGrid);
    setFrames(newFrames);
    setCurrentFrameIndex(currentFrameIndex + 1);
    pushToHistory(newFrames);
  };

  const cloneFrame = () => {
    const newFrames = [...frames];
    const clonedGrid = [...frames[currentFrameIndex]];
    newFrames.splice(currentFrameIndex + 1, 0, clonedGrid);
    setFrames(newFrames);
    setCurrentFrameIndex(currentFrameIndex + 1);
    pushToHistory(newFrames);
  };

  const deleteFrame = () => {
    if (frames.length === 1) {
      // Clear instead of delete if it's the last frame
      clearCurrentFrame();
      return;
    }
    const newFrames = frames.filter((_, idx) => idx !== currentFrameIndex);
    setFrames(newFrames);
    const nextIdx = Math.max(0, currentFrameIndex - 1);
    setCurrentFrameIndex(nextIdx);
    pushToHistory(newFrames);
  };

  const clearCurrentFrame = () => {
    if (window.confirm("Clear this frame?")) {
      const newFrames = [...frames];
      newFrames[currentFrameIndex] = Array(gridSize * gridSize).fill('');
      setFrames(newFrames);
      pushToHistory(newFrames);
    }
  };

  // Exporters
  const exportPNG = () => {
    const canvas = document.createElement('canvas');
    const exportSize = 512;
    canvas.width = exportSize;
    canvas.height = exportSize;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const cellSize = exportSize / gridSize;
    const currentGrid = frames[currentFrameIndex];

    currentGrid.forEach((color, idx) => {
      if (color) {
        const x = (idx % gridSize) * cellSize;
        const y = Math.floor(idx / gridSize) * cellSize;
        ctx.fillStyle = color;
        ctx.fillRect(x, y, cellSize, cellSize);
      }
    });

    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `pixel-art-${gridSize}x${gridSize}.png`;
    a.click();
  };

  const cssShadowCode = useMemo(() => {
    const currentGrid = frames[currentFrameIndex];
    const shadows = [];

    currentGrid.forEach((color, idx) => {
      if (color) {
        const x = idx % gridSize;
        const y = Math.floor(idx / gridSize);
        shadows.push(`${x + 1}px ${y + 1}px 0 ${color}`);
      }
    });

    if (shadows.length === 0) return '/* Draw something to generate CSS box-shadow */';

    return `.pixel-art {
  display: inline-block;
  width: 1px;
  height: 1px;
  background: transparent;
  box-shadow:
    ${shadows.join(',\n    ')};
}`;
  }, [frames, currentFrameIndex, gridSize]);

  const copyCSS = () => {
    navigator.clipboard.writeText(cssShadowCode);
    alert('CSS box-shadow code copied to clipboard!');
  };

  // JSON import/export
  useEffect(() => {
    setJsonInput(JSON.stringify({ gridSize, fps, frames }, null, 2));
  }, [frames, gridSize, fps]);

  const loadJSON = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (parsed.gridSize && parsed.frames && Array.isArray(parsed.frames)) {
        setGridSize(parsed.gridSize);
        setFrames(parsed.frames);
        if (parsed.fps) setFps(parsed.fps);
        setCurrentFrameIndex(0);
        setHistory([parsed.frames]);
        setHistoryIndex(0);
        alert('Project loaded successfully!');
      } else {
        alert('Invalid format. Must include gridSize and frames array.');
      }
    } catch (err) {
      alert('Error parsing JSON: ' + err.message);
    }
  };

  const handleCustomColorAdd = (e) => {
    const newColor = e.target.value;
    if (!customColors.includes(newColor)) {
      setCustomColors([newColor, ...customColors.slice(0, 7)]);
    }
    setCurrentColor(newColor);
  };

  return (
    <div className="flex justify-center items-center min-h-[750px] p-6 bg-gradient-to-br from-orange-600 via-pink-600 to-indigo-800 rounded-3xl m-5 shadow-2xl relative overflow-hidden group">
      {/* Retrowave Neon Horizon lines grid */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.05)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(255,255,255,0.05)_1px,_transparent_1px)] bg-[size:32px_32px]"></div>

      <div className="bg-slate-950/80 backdrop-blur-xl p-6 lg:p-8 rounded-[2rem] border border-white/10 max-w-6xl w-full shadow-2xl relative z-10 font-sans text-white">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-white/10 pb-6">
          <div>
            <h2 className="text-4xl font-extrabold bg-gradient-to-r from-orange-400 via-pink-500 to-indigo-400 bg-clip-text text-transparent tracking-tight">
              PIXEL<span className="text-white">STUDIO</span>
            </h2>
            <p className="text-pink-200/50 text-xs font-semibold uppercase tracking-wider mt-1">Retro canvas and sprite animator</p>
          </div>

          {/* Grid Size controls & Global actions */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-white/60 font-bold uppercase tracking-wider">Grid Size:</span>
            <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
              {[8, 16, 32].map((size) => (
                <button
                  key={size}
                  onClick={() => handleGridSizeChange(size)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    gridSize === size
                      ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/40'
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  {size}x{size}
                </button>
              ))}
            </div>

            <button
              onClick={exportPNG}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-400 hover:to-pink-500 text-xs font-extrabold rounded-xl shadow-lg shadow-pink-600/20 active:scale-95 transition-all flex items-center gap-2"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              EXPORT PNG
            </button>
          </div>
        </div>

        {/* Main Interface Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Column 1: Toolbar & Color Pickers (3 cols) */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Tools Area */}
            <div className="bg-black/30 p-4 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-xs font-bold text-pink-400 uppercase tracking-widest">Tools</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'pencil', name: 'Pencil', icon: '✏️' },
                  { id: 'eraser', name: 'Eraser', icon: '🧹' },
                  { id: 'bucket', name: 'Fill', icon: '🪣' },
                  { id: 'eyedropper', name: 'Picker', icon: '🧪' }
                ].map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => setCurrentTool(tool.id)}
                    className={`p-3 text-sm font-bold rounded-xl transition-all border flex items-center justify-center gap-2 active:scale-95 ${
                      currentTool === tool.id
                        ? 'bg-pink-600 border-pink-500 text-white shadow-lg shadow-pink-500/20'
                        : 'bg-white/5 border-white/5 hover:bg-white/10 text-white/80'
                    }`}
                  >
                    <span>{tool.icon}</span>
                    <span className="text-xs">{tool.name}</span>
                  </button>
                ))}
              </div>

              {/* Undo Redo Trash */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5">
                <button
                  onClick={undo}
                  disabled={historyIndex === 0}
                  className="p-2 text-xs font-bold rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 transition-all text-center"
                  title="Undo"
                >
                  ↩️
                </button>
                <button
                  onClick={redo}
                  disabled={historyIndex === history.length - 1}
                  className="p-2 text-xs font-bold rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 transition-all text-center"
                  title="Redo"
                >
                  ↪️
                </button>
                <button
                  onClick={clearCurrentFrame}
                  className="p-2 text-xs font-bold rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-900/40 transition-all text-center text-red-200"
                  title="Clear Frame"
                >
                  🗑️
                </button>
              </div>
            </div>

            {/* Colors Area */}
            <div className="bg-black/30 p-4 rounded-2xl border border-white/5 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-pink-400 uppercase tracking-widest">Palette</h3>
                <select
                  value={activePalette}
                  onChange={(e) => setActivePalette(e.target.value)}
                  className="bg-slate-900 border border-white/10 text-xs rounded-lg p-1.5 outline-none font-bold text-pink-300"
                >
                  {Object.entries(PALETTES).map(([key, pal]) => (
                    <option key={key} value={key}>
                      {pal.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Palette Grid */}
              <div className="grid grid-cols-6 gap-2">
                {PALETTES[activePalette].colors.map((color, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentColor(color);
                      if (currentTool === 'eraser') setCurrentTool('pencil');
                    }}
                    style={{ backgroundColor: color }}
                    className={`h-8 w-full rounded-lg transition-transform active:scale-90 relative ${
                      currentColor === color && currentTool !== 'eraser'
                        ? 'ring-2 ring-white scale-105 z-10 shadow-lg shadow-white/20'
                        : 'hover:scale-105'
                    }`}
                    title={color}
                  />
                ))}
              </div>

              {/* Custom Picker / Recent Colors */}
              <div className="pt-2 border-t border-white/5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-white/10">
                    <input
                      type="color"
                      value={currentColor}
                      onChange={handleCustomColorAdd}
                      className="absolute -inset-1 w-10 h-10 cursor-pointer border-none p-0"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-white/50 font-bold uppercase">Color Picker</span>
                    <span className="text-xs font-mono text-pink-300">{currentColor.toUpperCase()}</span>
                  </div>
                </div>

                {/* Recent colors row */}
                <div className="flex gap-1.5 flex-wrap">
                  {customColors.map((color, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setCurrentColor(color);
                        if (currentTool === 'eraser') setCurrentTool('pencil');
                      }}
                      style={{ backgroundColor: color }}
                      className={`w-6 h-6 rounded-md border border-white/10 transition-transform ${
                        currentColor === color && currentTool !== 'eraser' ? 'ring-2 ring-white scale-105' : 'hover:scale-105'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Guide Grid View Toggle */}
            <div className="flex justify-between items-center bg-black/30 p-4 rounded-2xl border border-white/5">
              <span className="text-xs font-bold text-white/80">Show Grid Lines</span>
              <button
                onClick={() => setShowGridLines(!showGridLines)}
                className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 ${
                  showGridLines ? 'bg-pink-600' : 'bg-white/10'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
                    showGridLines ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

          </div>

          {/* Column 2: Draw Canvas (6 cols) */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center">
            
            {/* The Main Board */}
            <div 
              ref={gridContainerRef}
              onMouseDown={() => {
                isDrawingRef.current = true;
              }}
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                maxWidth: '480px',
                width: '100%',
                backgroundImage: 'url("data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 16 16\'><rect width=\'8\' height=\'8\' fill=\'%231e293b\'/><rect x=\'8\' y=\'8\' width=\'8\' height=\'8\' fill=\'%231e293b\'/><rect x=\'8\' width=\'8\' height=\'8\' fill=\'%230f172a\'/><rect y=\'8\' width=\'8\' height=\'8\' fill=\'%230f172a\'/></svg>")',
                aspectRatio: '1/1'
              }}
              className="rounded-2xl border-4 border-slate-900 shadow-2xl overflow-hidden cursor-crosshair select-none relative"
            >
              {frames[currentFrameIndex].map((color, idx) => (
                <div
                  key={idx}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleCellAction(idx);
                  }}
                  onMouseEnter={() => {
                    if (isDrawingRef.current) {
                      handleCellAction(idx);
                    }
                  }}
                  style={{
                    backgroundColor: color || 'transparent',
                    boxShadow: showGridLines ? 'inset 0 0 0 1px rgba(255,255,255,0.04)' : 'none'
                  }}
                  className="w-full h-full transition-all duration-75"
                />
              ))}
            </div>

            {/* Frame Timeline / Controls */}
            <div className="w-full max-w-[480px] mt-6 bg-black/40 p-4 rounded-2xl border border-white/5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-pink-400 uppercase tracking-widest">Frames Timeline</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={addFrame}
                    className="p-1 px-2.5 text-xs font-bold rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-900/40 text-emerald-300 transition-colors"
                  >
                    + Blank
                  </button>
                  <button
                    onClick={cloneFrame}
                    className="p-1 px-2.5 text-xs font-bold rounded-lg bg-pink-950/40 hover:bg-pink-900/60 border border-pink-900/40 text-pink-300 transition-colors"
                  >
                    + Clone
                  </button>
                  <button
                    onClick={deleteFrame}
                    disabled={frames.length === 1 && !frames[0].some(c => c !== '')}
                    className="p-1 px-2.5 text-xs font-bold rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-900/40 text-red-300 disabled:opacity-30 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>

              {/* Filmstrip */}
              <div className="flex items-center gap-2 overflow-x-auto py-2 scrollbar-thin scrollbar-thumb-pink-600">
                {frames.map((frame, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentFrameIndex(idx)}
                    className={`flex-shrink-0 w-12 h-12 rounded-lg relative overflow-hidden border-2 transition-all ${
                      currentFrameIndex === idx
                        ? 'border-pink-500 scale-105 shadow-md shadow-pink-500/20 bg-slate-900'
                        : 'border-white/10 bg-slate-950/60 hover:border-white/30'
                    }`}
                  >
                    {/* Small preview block */}
                    <div className="grid grid-cols-4 w-full h-full opacity-60">
                      {Array(16).fill(0).map((_, pIdx) => {
                        const step = Math.floor(gridSize / 4);
                        const cellColor = frame[Math.floor(pIdx / 4) * step * gridSize + (pIdx % 4) * step];
                        return (
                          <div
                            key={pIdx}
                            style={{ backgroundColor: cellColor || 'transparent' }}
                            className="w-full h-full"
                          />
                        );
                      })}
                    </div>
                    <span className="absolute bottom-0.5 right-1 text-[8px] font-bold bg-black/60 px-1 rounded-sm">
                      #{idx + 1}
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Column 3: Animation Loop, CSS Code, JSON (3 cols) */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Live Playback View */}
            <div className="bg-black/30 p-4 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-xs font-bold text-pink-400 uppercase tracking-widest">Live Animator</h3>
              
              <div className="flex flex-col items-center gap-4 bg-slate-950 p-4 rounded-xl border border-white/5">
                {/* Visual loop */}
                <div 
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                    width: '120px',
                    height: '120px',
                    backgroundImage: 'url("data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'8\' height=\'8\' viewBox=\'0 0 8 8\'><rect width=\'4\' height=\'4\' fill=\'%231e293b\'/><rect x=\'4\' y=\'4\' width=\'4\' height=\'4\' fill=\'%231e293b\'/><rect x=\'4\' width=\'4\' height=\'4\' fill=\'%230f172a\'/><rect y=\'4\' width=\'4\' height=\'4\' fill=\'%230f172a\'/></svg>")'
                  }}
                  className="rounded-lg border border-white/10 overflow-hidden shadow-xl"
                >
                  {frames[currentFrameIndex].map((color, idx) => (
                    <div
                      key={idx}
                      style={{ backgroundColor: color || 'transparent' }}
                      className="w-full h-full"
                    />
                  ))}
                </div>

                {/* Frame Counter & Speed */}
                <div className="w-full text-center space-y-1">
                  <span className="text-xs font-mono font-bold text-pink-300">
                    Frame {currentFrameIndex + 1} of {frames.length}
                  </span>
                </div>
              </div>

              {/* Play / Speed Controls */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`flex-1 py-2 rounded-xl text-xs font-black shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 ${
                      isPlaying
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                    }`}
                  >
                    <span>{isPlaying ? '⏸️ PAUSE' : '▶️ PLAY'}</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[10px] font-bold text-white/50 uppercase">Speed</span>
                    <span className="text-xs font-bold font-mono text-pink-300">{fps} FPS</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="24"
                    value={fps}
                    onChange={(e) => setFps(parseInt(e.target.value))}
                    className="w-full accent-pink-500 bg-white/10 h-1 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Code / JSON Panel */}
            <div className="bg-black/30 p-4 rounded-2xl border border-white/5 flex flex-col min-h-[260px]">
              <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 mb-4">
                <button
                  onClick={() => setActiveTab('css')}
                  className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                    activeTab === 'css' ? 'bg-pink-600 text-white' : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  CSS SHADOW
                </button>
                <button
                  onClick={() => setActiveTab('json')}
                  className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                    activeTab === 'json' ? 'bg-pink-600 text-white' : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  PROJECT JSON
                </button>
              </div>

              <div className="flex-1 flex flex-col justify-between">
                {activeTab === 'css' ? (
                  <div className="flex-1 flex flex-col space-y-3">
                    <div className="flex-1 max-h-[140px] overflow-y-auto p-3 bg-slate-950 rounded-xl border border-white/5 font-mono text-[9px] text-pink-300 leading-normal select-all break-all scrollbar-thin scrollbar-thumb-pink-600">
                      <pre className="whitespace-pre-wrap">{cssShadowCode}</pre>
                    </div>
                    <button
                      onClick={copyCSS}
                      className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-bold border border-white/10 active:scale-95 transition-all text-center"
                    >
                      📋 COPY CSS CODE
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col space-y-3">
                    <textarea
                      value={jsonInput}
                      onChange={(e) => setJsonInput(e.target.value)}
                      className="flex-1 w-full max-h-[140px] p-3 bg-slate-950 rounded-xl border border-white/5 font-mono text-[9px] text-indigo-300 leading-normal outline-none resize-none scrollbar-thin scrollbar-thumb-pink-600"
                      placeholder="Paste project JSON here to load..."
                    />
                    <button
                      onClick={loadJSON}
                      className="w-full py-2 bg-indigo-950/40 hover:bg-indigo-900/60 rounded-xl text-[10px] font-bold border border-indigo-900/40 active:scale-95 transition-all text-center text-indigo-200"
                    >
                      📥 LOAD JSON PROJECT
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default PixelArtStudio;
