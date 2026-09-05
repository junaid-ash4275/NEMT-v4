import React, { useState, useRef, useEffect, useCallback } from 'react';

const ELEMENTS = {
  EMPTY: { id: 0, name: 'Air / Eraser', color: '#0f172a', category: 'tool' },
  SAND: { id: 1, name: 'Sand', color: '#eab308', category: 'solid' },
  WATER: { id: 2, name: 'Water', color: '#3b82f6', category: 'liquid' },
  PLANT: { id: 3, name: 'Plant', color: '#22c55e', category: 'organic' },
  FIRE: { id: 4, name: 'Fire', color: '#f97316', category: 'energy' },
  LAVA: { id: 5, name: 'Lava', color: '#dc2626', category: 'liquid' },
  ACID: { id: 6, name: 'Acid', color: '#84cc16', category: 'chemical' },
  GUNPOWDER: { id: 7, name: 'Gunpowder', color: '#64748b', category: 'explosive' },
  STONE: { id: 8, name: 'Stone Wall', color: '#475569', category: 'solid' }
};

const WIDTH = 180;
const HEIGHT = 135;

const PowderAlchemySandbox = () => {
  const canvasRef = useRef(null);
  const [activeElement, setActiveElement] = useState('SAND');
  const [brushSize, setBrushSize] = useState(4);
  const [isPaused, setIsPaused] = useState(false);
  const [particleCount, setParticleCount] = useState(0);
  const [fps, setFps] = useState(60);
  const [isMouseDown, setIsMouseDown] = useState(false);

  // Grid state stored in refs for 60fps simulation speed
  const gridRef = useRef(new Uint8Array(WIDTH * HEIGHT));
  const fireLifeRef = useRef(new Uint8Array(WIDTH * HEIGHT));
  const animFrameRef = useRef(null);
  const lastTimeRef = useRef(performance.now());
  const frameCountRef = useRef(0);

  // Initialize Canvas & Buffer
  const clearGrid = useCallback(() => {
    gridRef.current.fill(0);
    fireLifeRef.current.fill(0);
    setParticleCount(0);
  }, []);

  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const scaleX = WIDTH / rect.width;
    const scaleY = HEIGHT / rect.height;
    
    const x = Math.floor((clientX - rect.left) * scaleX);
    const y = Math.floor((clientY - rect.top) * scaleY);
    
    return { x: Math.max(0, Math.min(WIDTH - 1, x)), y: Math.max(0, Math.min(HEIGHT - 1, y)) };
  };

  const drawBrush = (cx, cy, elemKey) => {
    const elemId = ELEMENTS[elemKey].id;
    const grid = gridRef.current;
    const r = brushSize;

    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (dx * dx + dy * dy <= r * r) {
          const nx = cx + dx;
          const ny = cy + dy;
          if (nx >= 0 && nx < WIDTH && ny >= 0 && ny < HEIGHT) {
            const idx = ny * WIDTH + nx;
            grid[idx] = elemId;
            if (elemId === ELEMENTS.FIRE.id) {
              fireLifeRef.current[idx] = Math.floor(Math.random() * 20) + 10;
            }
          }
        }
      }
    }
  };

  const handlePointerDown = (e) => {
    setIsMouseDown(true);
    const coords = getCanvasCoords(e);
    if (coords) drawBrush(coords.x, coords.y, activeElement);
  };

  const handlePointerMove = (e) => {
    if (!isMouseDown) return;
    const coords = getCanvasCoords(e);
    if (coords) drawBrush(coords.x, coords.y, activeElement);
  };

  const handlePointerUp = () => {
    setIsMouseDown(false);
  };

  // Presets
  const loadPreset = (type) => {
    clearGrid();
    const grid = gridRef.current;

    if (type === 'volcano') {
      // Stone mountain
      for (let y = 60; y < HEIGHT; y++) {
        const span = Math.floor((y - 60) * 1.2);
        for (let x = WIDTH / 2 - span; x <= WIDTH / 2 + span; x++) {
          if (x >= 0 && x < WIDTH) grid[y * WIDTH + x] = ELEMENTS.STONE.id;
        }
      }
      // Crater with lava
      for (let y = 60; y < 80; y++) {
        for (let x = WIDTH / 2 - 12; x <= WIDTH / 2 + 12; x++) {
          grid[y * WIDTH + x] = ELEMENTS.LAVA.id;
        }
      }
    } else if (type === 'garden') {
      // Ground
      for (let x = 0; x < WIDTH; x++) {
        for (let y = HEIGHT - 20; y < HEIGHT; y++) {
          grid[y * WIDTH + x] = ELEMENTS.STONE.id;
        }
      }
      // Plant seeds
      for (let x = 20; x < WIDTH - 20; x += 15) {
        grid[(HEIGHT - 21) * WIDTH + x] = ELEMENTS.PLANT.id;
      }
      // Cloud of water
      for (let y = 10; y < 25; y++) {
        for (let x = 40; x < WIDTH - 40; x++) {
          if (Math.random() > 0.4) grid[y * WIDTH + x] = ELEMENTS.WATER.id;
        }
      }
    } else if (type === 'bomb') {
      // Fortress
      for (let y = 70; y < HEIGHT - 5; y++) {
        for (let x = 40; x < 140; x++) {
          if (x < 50 || x > 130 || y > HEIGHT - 15) {
            grid[y * WIDTH + x] = ELEMENTS.STONE.id;
          } else {
            grid[y * WIDTH + x] = ELEMENTS.GUNPOWDER.id;
          }
        }
      }
      // Spark at top
      grid[68 * WIDTH + 90] = ELEMENTS.FIRE.id;
      fireLifeRef.current[68 * WIDTH + 90] = 30;
    }
  };

  const handleMagicBurst = () => {
    const grid = gridRef.current;
    const elements = [ELEMENTS.SAND.id, ELEMENTS.WATER.id, ELEMENTS.ACID.id, ELEMENTS.GUNPOWDER.id, ELEMENTS.PLANT.id];
    for (let i = 0; i < 400; i++) {
      const rx = Math.floor(Math.random() * (WIDTH - 20)) + 10;
      const ry = Math.floor(Math.random() * 40) + 5;
      const elem = elements[Math.floor(Math.random() * elements.length)];
      grid[ry * WIDTH + rx] = elem;
    }
  };

  // Main Simulation & Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(WIDTH, HEIGHT);
    const data = imgData.data;

    // Color cache for quick lookup
    const colorMap = {
      [ELEMENTS.EMPTY.id]: [15, 23, 42],
      [ELEMENTS.SAND.id]: [234, 179, 8],
      [ELEMENTS.WATER.id]: [59, 130, 246],
      [ELEMENTS.PLANT.id]: [34, 197, 94],
      [ELEMENTS.FIRE.id]: [249, 115, 22],
      [ELEMENTS.LAVA.id]: [220, 38, 38],
      [ELEMENTS.ACID.id]: [132, 204, 22],
      [ELEMENTS.GUNPOWDER.id]: [100, 116, 139],
      [ELEMENTS.STONE.id]: [71, 85, 105]
    };

    const updatePhysics = () => {
      const grid = gridRef.current;
      const nextGrid = new Uint8Array(grid);
      const fireLife = fireLifeRef.current;
      const nextFireLife = new Uint8Array(fireLife);

      let activeCount = 0;

      // Bottom-up pass for realistic physics
      for (let y = HEIGHT - 1; y >= 0; y--) {
        // Randomize row iteration direction to prevent left-right bias
        const leftToRight = Math.random() > 0.5;
        const startX = leftToRight ? 0 : WIDTH - 1;
        const endX = leftToRight ? WIDTH : -1;
        const stepX = leftToRight ? 1 : -1;

        for (let x = startX; x !== endX; x += stepX) {
          const idx = y * WIDTH + x;
          const elem = grid[idx];

          if (elem === ELEMENTS.EMPTY.id) continue;
          activeCount++;

          const below = (y + 1) * WIDTH + x;
          const belowLeft = (y + 1) * WIDTH + (x - 1);
          const belowRight = (y + 1) * WIDTH + (x + 1);
          const left = y * WIDTH + (x - 1);
          const right = y * WIDTH + (x + 1);
          const above = (y - 1) * WIDTH + x;

          // --- SAND & GUNPOWDER ---
          if (elem === ELEMENTS.SAND.id || elem === ELEMENTS.GUNPOWDER.id) {
            if (y < HEIGHT - 1) {
              if (grid[below] === ELEMENTS.EMPTY.id || grid[below] === ELEMENTS.WATER.id) {
                // Swap with empty or displace water
                nextGrid[below] = elem;
                nextGrid[idx] = grid[below];
              } else if (x > 0 && (grid[belowLeft] === ELEMENTS.EMPTY.id || grid[belowLeft] === ELEMENTS.WATER.id)) {
                nextGrid[belowLeft] = elem;
                nextGrid[idx] = grid[belowLeft];
              } else if (x < WIDTH - 1 && (grid[belowRight] === ELEMENTS.EMPTY.id || grid[belowRight] === ELEMENTS.WATER.id)) {
                nextGrid[belowRight] = elem;
                nextGrid[idx] = grid[belowRight];
              }
            }
          }

          // --- WATER ---
          else if (elem === ELEMENTS.WATER.id) {
            if (y < HEIGHT - 1 && grid[below] === ELEMENTS.EMPTY.id) {
              nextGrid[below] = ELEMENTS.WATER.id;
              nextGrid[idx] = ELEMENTS.EMPTY.id;
            } else if (y < HEIGHT - 1 && x > 0 && grid[belowLeft] === ELEMENTS.EMPTY.id) {
              nextGrid[belowLeft] = ELEMENTS.WATER.id;
              nextGrid[idx] = ELEMENTS.EMPTY.id;
            } else if (y < HEIGHT - 1 && x < WIDTH - 1 && grid[belowRight] === ELEMENTS.EMPTY.id) {
              nextGrid[belowRight] = ELEMENTS.WATER.id;
              nextGrid[idx] = ELEMENTS.EMPTY.id;
            } else {
              // Flow horizontally
              const dir = Math.random() > 0.5 ? 1 : -1;
              const side = y * WIDTH + (x + dir);
              if (x + dir >= 0 && x + dir < WIDTH && grid[side] === ELEMENTS.EMPTY.id) {
                nextGrid[side] = ELEMENTS.WATER.id;
                nextGrid[idx] = ELEMENTS.EMPTY.id;
              }
            }
          }

          // --- LAVA ---
          else if (elem === ELEMENTS.LAVA.id) {
            // Lava melts and burns
            const neighbors = [below, left, right, above];
            for (let nIdx of neighbors) {
              if (nIdx >= 0 && nIdx < WIDTH * HEIGHT) {
                if (grid[nIdx] === ELEMENTS.WATER.id) {
                  nextGrid[nIdx] = ELEMENTS.STONE.id; // Water turns to stone
                } else if (grid[nIdx] === ELEMENTS.PLANT.id || grid[nIdx] === ELEMENTS.GUNPOWDER.id) {
                  nextGrid[nIdx] = ELEMENTS.FIRE.id; // Ignites
                  nextFireLife[nIdx] = 25;
                }
              }
            }
            // Flow like heavy liquid
            if (y < HEIGHT - 1 && grid[below] === ELEMENTS.EMPTY.id) {
              nextGrid[below] = ELEMENTS.LAVA.id;
              nextGrid[idx] = ELEMENTS.EMPTY.id;
            } else if (Math.random() > 0.6) {
              const dir = Math.random() > 0.5 ? 1 : -1;
              const side = y * WIDTH + (x + dir);
              if (x + dir >= 0 && x + dir < WIDTH && grid[side] === ELEMENTS.EMPTY.id) {
                nextGrid[side] = ELEMENTS.LAVA.id;
                nextGrid[idx] = ELEMENTS.EMPTY.id;
              }
            }
          }

          // --- FIRE ---
          else if (elem === ELEMENTS.FIRE.id) {
            nextFireLife[idx] = fireLife[idx] - 1;
            if (nextFireLife[idx] <= 0) {
              nextGrid[idx] = ELEMENTS.EMPTY.id;
            } else {
              // Ignite surroundings
              const targets = [above, below, left, right];
              for (let tIdx of targets) {
                if (tIdx >= 0 && tIdx < WIDTH * HEIGHT) {
                  if (grid[tIdx] === ELEMENTS.PLANT.id || grid[tIdx] === ELEMENTS.GUNPOWDER.id) {
                    nextGrid[tIdx] = ELEMENTS.FIRE.id;
                    nextFireLife[tIdx] = Math.floor(Math.random() * 25) + 10;
                  }
                }
              }
              // Smoke rises
              if (y > 0 && Math.random() > 0.4 && grid[above] === ELEMENTS.EMPTY.id) {
                nextGrid[above] = ELEMENTS.FIRE.id;
                nextFireLife[above] = nextFireLife[idx];
                nextGrid[idx] = ELEMENTS.EMPTY.id;
              }
            }
          }

          // --- ACID ---
          else if (elem === ELEMENTS.ACID.id) {
            const touchList = [below, left, right, above];
            let dissolved = false;
            for (let tIdx of touchList) {
              if (tIdx >= 0 && tIdx < WIDTH * HEIGHT) {
                const target = grid[tIdx];
                if (target !== ELEMENTS.EMPTY.id && target !== ELEMENTS.ACID.id && target !== ELEMENTS.STONE.id) {
                  nextGrid[tIdx] = ELEMENTS.EMPTY.id;
                  nextGrid[idx] = ELEMENTS.EMPTY.id;
                  dissolved = true;
                  break;
                }
              }
            }
            if (!dissolved && y < HEIGHT - 1 && grid[below] === ELEMENTS.EMPTY.id) {
              nextGrid[below] = ELEMENTS.ACID.id;
              nextGrid[idx] = ELEMENTS.EMPTY.id;
            }
          }

          // --- PLANT GROWTH ---
          else if (elem === ELEMENTS.PLANT.id) {
            // Grows when near water
            const nList = [below, left, right, above];
            for (let nIdx of nList) {
              if (nIdx >= 0 && nIdx < WIDTH * HEIGHT && grid[nIdx] === ELEMENTS.WATER.id) {
                // Grow into adjacent empty space
                for (let growIdx of nList) {
                  if (growIdx >= 0 && growIdx < WIDTH * HEIGHT && grid[growIdx] === ELEMENTS.EMPTY.id) {
                    if (Math.random() > 0.5) {
                      nextGrid[growIdx] = ELEMENTS.PLANT.id;
                      nextGrid[nIdx] = ELEMENTS.EMPTY.id; // Consume water
                      break;
                    }
                  }
                }
              }
            }
          }
        }
      }

      gridRef.current = nextGrid;
      fireLifeRef.current = nextFireLife;
      setParticleCount(activeCount);
    };

    const render = () => {
      const now = performance.now();
      frameCountRef.current++;
      if (now - lastTimeRef.current >= 1000) {
        setFps(frameCountRef.current);
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      if (!isPaused) {
        updatePhysics();
      }

      const grid = gridRef.current;
      let ptr = 0;
      for (let i = 0; i < grid.length; i++) {
        const val = grid[i];
        const rgb = colorMap[val] || [15, 23, 42];
        
        // Add subtle visual noise to particles for tactile texture
        const noise = (val !== 0 && val !== 8) ? (Math.random() * 16 - 8) : 0;
        data[ptr] = Math.min(255, Math.max(0, rgb[0] + noise));
        data[ptr + 1] = Math.min(255, Math.max(0, rgb[1] + noise));
        data[ptr + 2] = Math.min(255, Math.max(0, rgb[2] + noise));
        data[ptr + 3] = 255;
        ptr += 4;
      }

      ctx.putImageData(imgData, 0, 0);
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isPaused]);

  return (
    <div className="flex justify-center items-center min-h-[650px] p-5 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-500 rounded-2xl m-5 shadow-2xl">
      <div className="bg-white/95 backdrop-blur-md p-8 rounded-3xl max-w-5xl w-full shadow-2xl border border-white/20">
        
        {/* Header Section */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-200 mb-3">
            <span className="text-lg">🧪</span>
            <span className="text-xs font-black text-emerald-700 uppercase tracking-widest">Interactive Physics & Chemistry</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 via-teal-600 to-cyan-600 mb-2">
            Powder Alchemy Sandbox
          </h2>
          <p className="text-gray-500 font-medium text-sm md:text-base">
            Paint with real-time cellular physics! Create flowing rivers, volcanic eruptions, growing ecosystems, and chemical explosions.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-100 rounded-2xl p-4 border border-emerald-100 flex flex-col justify-between">
            <div className="text-2xl font-black text-emerald-700 truncate flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full inline-block shadow" style={{ backgroundColor: ELEMENTS[activeElement].color }} />
              {ELEMENTS[activeElement].name}
            </div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-500 mt-1">Active Element</div>
          </div>
          
          <div className="bg-gradient-to-br from-teal-50 to-cyan-100 rounded-2xl p-4 border border-teal-100 flex flex-col justify-between">
            <div className="text-2xl font-black text-teal-700">{brushSize}px Radius</div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-teal-500 mt-1">Brush Size</div>
          </div>
          
          <div className="bg-gradient-to-br from-cyan-50 to-blue-100 rounded-2xl p-4 border border-cyan-100 flex flex-col justify-between">
            <div className="text-2xl font-black text-cyan-700">{particleCount.toLocaleString()}</div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-500 mt-1">Live Particles</div>
          </div>
          
          <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl p-4 border border-amber-100 flex flex-col justify-between">
            <div className="text-2xl font-black text-amber-600 flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isPaused ? 'bg-amber-500' : 'bg-emerald-500 animate-ping'}`} />
              {fps} FPS
            </div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-500 mt-1">{isPaused ? 'Paused' : 'Simulation Running'}</div>
          </div>
        </div>

        {/* Customization Toolbar */}
        <div className="space-y-4 mb-6 bg-gray-50 p-5 rounded-2xl border border-gray-200/80">
          
          {/* Palette Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase w-24">Elements:</span>
            {Object.keys(ELEMENTS).map((key) => {
              const elem = ELEMENTS[key];
              const isActive = activeElement === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveElement(key)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20 scale-105'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full border border-black/20" style={{ backgroundColor: elem.color }} />
                  {elem.name}
                </button>
              );
            })}
          </div>

          {/* Brush Controls & Presets */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-gray-400 uppercase">Brush Size: {brushSize}px</label>
              <input
                type="range"
                min="1"
                max="12"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-32 accent-emerald-600 cursor-pointer"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-gray-400 uppercase">Presets:</span>
              <button
                onClick={() => loadPreset('volcano')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 transition-all"
              >
                🌋 Volcano Eruption
              </button>
              <button
                onClick={() => loadPreset('garden')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50 transition-all"
              >
                🌱 Botanical Rain
              </button>
              <button
                onClick={() => loadPreset('bomb')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-amber-600 border border-amber-200 hover:bg-amber-50 transition-all"
              >
                💥 Fortress Bomb
              </button>
            </div>
          </div>

        </div>

        {/* Canvas Render Area */}
        <div className="relative flex justify-center items-center w-full bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-900 aspect-[4/3] md:h-[450px]">
          <canvas
            ref={canvasRef}
            width={WIDTH}
            height={HEIGHT}
            onMouseDown={handlePointerDown}
            onMouseMove={handlePointerMove}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerUp}
            onTouchStart={handlePointerDown}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerUp}
            className="w-full h-full cursor-crosshair image-rendering-pixelated touch-none select-none"
          />

          {/* Floating Canvas Overlay */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center px-4 py-2 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 pointer-events-auto">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="text-xs font-bold text-emerald-300 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <span>{isPaused ? '▶️ Play Physics' : '⏸️ Pause Physics'}</span>
            </button>

            <span className="text-[11px] text-gray-400 font-mono hidden sm:inline">
              💡 Tip: Water causes plants to grow! Acid dissolves stone! Gunpowder explodes with Fire!
            </span>
          </div>
        </div>

        {/* Action Bottom Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-6 border-t border-gray-100">
          <button
            onClick={handleMagicBurst}
            className="px-6 py-3.5 rounded-2xl font-extrabold text-white bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 hover:-translate-y-0.5 shadow-lg hover:shadow-teal-500/30 active:translate-y-0 transition-all text-sm flex items-center gap-2"
          >
            <span>🪄</span> Elemental Rain Storm
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={clearGrid}
              className="px-6 py-3.5 rounded-2xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-gray-900 active:scale-95 transition-all text-sm"
            >
              Clear Canvas
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PowderAlchemySandbox;
