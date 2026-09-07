import React, { useState, useEffect, useRef, useCallback } from 'react';

const PALETTES = {
  neon: {
    name: 'Cyber Neon',
    bg: '#0a0a1a',
    curve: '#00ffff',
    glow: '#00ffff',
    trail: 0.05
  },
  plasma: {
    name: 'Plasma Burn',
    bg: '#14051a',
    curve: '#ff00ff',
    glow: '#ff00ff',
    trail: 0.03
  },
  emerald: {
    name: 'Emerald Matrix',
    bg: '#021812',
    curve: '#00ff66',
    glow: '#00ff66',
    trail: 0.06
  },
  solar: {
    name: 'Solar Flare',
    bg: '#1a0b05',
    curve: '#ff9900',
    glow: '#ff3300',
    trail: 0.04
  }
};

const LissajousCurveGenerator = () => {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const timeRef = useRef(0);

  const [freqX, setFreqX] = useState(3);
  const [freqY, setFreqY] = useState(2);
  const [phaseShift, setPhaseShift] = useState(Math.PI / 4);
  const [animatePhase, setAnimatePhase] = useState(true);
  const [animateSpeed, setAnimateSpeed] = useState(0.005);
  const [palette, setPalette] = useState('neon');
  const [resolution, setResolution] = useState(1000);

  const drawCurve = useCallback((ctx, width, height, currentPhase) => {
    const currentPalette = PALETTES[palette];
    
    // Fade effect for trails if animating phase, else clear
    if (animatePhase) {
      ctx.fillStyle = `rgba(${parseInt(currentPalette.bg.slice(1, 3), 16)}, ${parseInt(currentPalette.bg.slice(3, 5), 16)}, ${parseInt(currentPalette.bg.slice(5, 7), 16)}, ${currentPalette.trail})`;
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.fillStyle = currentPalette.bg;
      ctx.fillRect(0, 0, width, height);
    }

    const centerX = width / 2;
    const centerY = height / 2;
    const amplitudeX = (width / 2) * 0.85;
    const amplitudeY = (height / 2) * 0.85;

    ctx.beginPath();
    for (let i = 0; i <= resolution; i++) {
      const t = (i / resolution) * Math.PI * 2;
      const x = centerX + amplitudeX * Math.sin(freqX * t + currentPhase);
      const y = centerY + amplitudeY * Math.sin(freqY * t);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.strokeStyle = currentPalette.curve;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 15;
    ctx.shadowColor = currentPalette.glow;
    ctx.stroke();
    ctx.shadowBlur = 0; // Reset for performance
  }, [freqX, freqY, palette, resolution, animatePhase]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const resizeCanvas = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      if (!animatePhase) {
         const ctx = canvas.getContext('2d');
         drawCurve(ctx, canvas.width, canvas.height, phaseShift);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [drawCurve, phaseShift, animatePhase]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const render = () => {
      if (animatePhase) {
        timeRef.current += animateSpeed;
        drawCurve(ctx, canvas.width, canvas.height, timeRef.current);
      } else {
        drawCurve(ctx, canvas.width, canvas.height, phaseShift);
      }
      if (animatePhase) {
        animFrameRef.current = requestAnimationFrame(render);
      }
    };

    if (animatePhase) {
      animFrameRef.current = requestAnimationFrame(render);
    } else {
      render();
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [drawCurve, animatePhase, phaseShift, animateSpeed]);

  return (
    <div className="flex justify-center items-center min-h-[720px] p-5 bg-gradient-to-br from-indigo-900 via-purple-900 to-black rounded-2xl m-5 shadow-2xl">
      <div className="bg-slate-900/90 text-slate-100 p-6 md:p-8 rounded-2xl max-w-6xl w-full shadow-2xl transition-all duration-300 border border-white/10 backdrop-blur-xl flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center pb-6 border-b border-white/10 gap-4">
          <div className="text-center md:text-left">
             <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <span className="w-3 h-3 rounded-full bg-pink-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest text-pink-400">Harmonic Oscillator</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-500 bg-clip-text text-transparent tracking-tight drop-shadow-sm">
              Lissajous Curve Studio
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Visualize complex harmonic motions with parametric equations.
            </p>
          </div>
          
          <div className="flex gap-3 bg-slate-800/80 p-3 rounded-xl border border-slate-700/50 shadow-inner">
             <div className="text-center px-3 border-r border-slate-700">
              <span className="block text-[11px] uppercase text-slate-400 font-semibold">Freq X</span>
              <span className="text-lg font-mono font-bold text-pink-400">{freqX}</span>
            </div>
            <div className="text-center px-3 border-r border-slate-700">
              <span className="block text-[11px] uppercase text-slate-400 font-semibold">Freq Y</span>
              <span className="text-lg font-mono font-bold text-purple-400">{freqY}</span>
            </div>
            <div className="text-center px-2">
              <span className="block text-[11px] uppercase text-slate-400 font-semibold">State</span>
              <span className={`text-sm font-semibold capitalize mt-1 block ${animatePhase ? 'text-emerald-400' : 'text-amber-400'}`}>
                {animatePhase ? 'Animating' : 'Static'}
              </span>
            </div>
          </div>
        </div>

        {/* Canvas Workspace */}
        <div className="relative w-full h-[460px] bg-black/60 rounded-2xl overflow-hidden border-2 border-slate-700/80 shadow-2xl group">
          <canvas
            ref={canvasRef}
            className="w-full h-full block"
          />
          <div className="absolute top-4 left-4 pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity duration-300">
            <span className="bg-slate-900/80 text-purple-300 text-xs px-3 py-1.5 rounded-full border border-purple-500/30 backdrop-blur-md flex items-center gap-2 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
              Parametric Graph: x = A sin(at + δ), y = B sin(bt)
            </span>
          </div>
        </div>

        {/* Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t border-white/10">
          
          {/* Frequencies */}
          <div className="space-y-4 col-span-1 md:col-span-2 bg-slate-800/40 p-4 rounded-xl border border-white/5">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-300 uppercase">Frequency X (a)</span>
                <span className="font-mono text-pink-400 font-bold">{freqX}</span>
              </div>
              <input
                type="range"
                min="1" max="20" step="1"
                value={freqX}
                onChange={(e) => setFreqX(Number(e.target.value))}
                className="w-full accent-pink-500 cursor-pointer h-2 bg-slate-700 rounded-lg appearance-none"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-300 uppercase">Frequency Y (b)</span>
                <span className="font-mono text-purple-400 font-bold">{freqY}</span>
              </div>
              <input
                type="range"
                min="1" max="20" step="1"
                value={freqY}
                onChange={(e) => setFreqY(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer h-2 bg-slate-700 rounded-lg appearance-none"
              />
            </div>
          </div>

          {/* Phase Shift & Speed */}
          <div className="space-y-4 col-span-1 bg-slate-800/40 p-4 rounded-xl border border-white/5">
             <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-300 uppercase">Phase Shift (δ)</span>
                <span className="font-mono text-indigo-400 font-bold">{phaseShift.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0" max={Math.PI * 2} step="0.01"
                value={phaseShift}
                onChange={(e) => {
                  setPhaseShift(Number(e.target.value));
                  if(animatePhase) setAnimatePhase(false);
                }}
                className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-700 rounded-lg appearance-none"
              />
            </div>

            <div className="space-y-2">
               <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-300 uppercase">Anim Speed</span>
                <span className="font-mono text-emerald-400 font-bold">{animateSpeed.toFixed(3)}</span>
              </div>
              <input
                type="range"
                min="0.001" max="0.05" step="0.001"
                value={animateSpeed}
                onChange={(e) => setAnimateSpeed(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-700 rounded-lg appearance-none"
              />
            </div>
          </div>

          {/* Palette Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
              Aesthetics
            </label>
            <div className="flex flex-col gap-2">
              {Object.entries(PALETTES).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => setPalette(key)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-all border ${
                    palette === key
                      ? 'bg-slate-800 border-indigo-400/50 text-white shadow-sm'
                      : 'bg-slate-900/60 text-slate-400 border-transparent hover:bg-slate-800/80 hover:text-slate-200'
                  }`}
                >
                  <span>{val.name}</span>
                  <span
                    className="w-4 h-4 rounded-full border border-slate-900 shadow-xs block"
                    style={{ backgroundColor: val.curve, boxShadow: `0 0 8px ${val.glow}` }}
                  />
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Action button toolbar */}
        <div className="flex flex-wrap justify-end items-center gap-3 pt-4 border-t border-white/10">
           <button
            onClick={() => {
              setFreqX(Math.floor(Math.random() * 9) + 1);
              setFreqY(Math.floor(Math.random() * 9) + 1);
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs uppercase tracking-wider transition-all flex items-center gap-2 border border-slate-600/60 active:scale-95 shadow-lg"
          >
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Randomize
          </button>
          
          <button
            onClick={() => {
              setAnimatePhase(!animatePhase);
              if (!animatePhase) timeRef.current = phaseShift;
              else setPhaseShift(timeRef.current % (Math.PI * 2));
            }}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all transform hover:scale-105 active:scale-95 shadow-xl flex items-center gap-2 border ${
              animatePhase 
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-orange-500/25 border-orange-400/30'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-teal-500/25 border-teal-400/30'
            }`}
          >
            {animatePhase ? (
              <>
                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Pause Animation
              </>
            ) : (
              <>
                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Start Animation
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LissajousCurveGenerator;
