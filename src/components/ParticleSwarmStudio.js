import React, { useState, useEffect, useRef, useCallback } from 'react';

const PALETTES = {
  cyberpunk: {
    name: 'Cyberpunk Neon',
    colors: ['#00ffcc', '#ff007f', '#ffff00', '#7f00ff', '#007fff'],
    trailAlpha: 0.18,
    bg: '#0a0a1a'
  },
  cosmos: {
    name: 'Deep Cosmos',
    colors: ['#6366f1', '#a855f7', '#ec4899', '#3b82f6', '#38bdf8'],
    trailAlpha: 0.2,
    bg: '#070914'
  },
  solar: {
    name: 'Solar Flare',
    colors: ['#ff4500', '#ff8c00', '#ffd700', '#ff1493', '#ff6347'],
    trailAlpha: 0.22,
    bg: '#140805'
  },
  emerald: {
    name: 'Emerald Haze',
    colors: ['#10b981', '#059669', '#34d399', '#06b6d4', '#6ee7b7'],
    trailAlpha: 0.19,
    bg: '#04120f'
  },
  prismatic: {
    name: 'Prismatic Light',
    colors: ['#ff3366', '#ff9933', '#ffff33', '#33ff66', '#3399ff', '#9933ff'],
    trailAlpha: 0.15,
    bg: '#0a0b10'
  }
};

const PRESETS = {
  vortex: { name: 'Galaxy Vortex', count: 1000, speed: 4, mode: 'vortex', palette: 'cosmos' },
  nebula: { name: 'Cosmic Nebula', count: 1400, speed: 2.5, mode: 'attract', palette: 'cyberpunk' },
  supernova: { name: 'Supernova Orbit', count: 1200, speed: 5, mode: 'orbit', palette: 'solar' },
  fireflies: { name: 'Quantum Swarm', count: 600, speed: 2, mode: 'wander', palette: 'emerald' }
};

const ParticleSwarmStudio = () => {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0, isHovering: false });
  const fpsRef = useRef({ count: 0, lastTime: performance.now(), fps: 60 });

  // State controls
  const [palette, setPalette] = useState('cosmos');
  const [particleCount, setParticleCount] = useState(1000);
  const [speed, setSpeed] = useState(3.5);
  const [interactionMode, setInteractionMode] = useState('vortex');
  const [isPaused, setIsPaused] = useState(false);
  const [currentFps, setCurrentFps] = useState(60);
  const [activePreset, setActivePreset] = useState('vortex');

  // Initialize or reset particles
  const initParticles = useCallback((count, paletteKey) => {
    if (!canvasRef.current) return;
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;
    const colors = PALETTES[paletteKey].colors;
    const newParticles = [];

    for (let i = 0; i < count; i++) {
      newParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        size: Math.random() * 2.5 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        angle: Math.random() * Math.PI * 2,
        angularSpeed: (Math.random() - 0.5) * 0.08,
      });
    }
    particlesRef.current = newParticles;
  }, []);

  // Handle resizing and initial setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      initParticles(particleCount, palette);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [initParticles, particleCount, palette]);

  // Update particles on count or palette change without resizing canvas
  useEffect(() => {
    initParticles(particleCount, palette);
  }, [particleCount, palette, initParticles]);

  // Supernova burst impulse calculation
  const triggerBurst = () => {
    if (!canvasRef.current) return;
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;
    const centerX = mouseRef.current.isHovering ? mouseRef.current.x : width / 2;
    const centerY = mouseRef.current.isHovering ? mouseRef.current.y : height / 2;

    particlesRef.current.forEach(p => {
      const dx = p.x - centerX;
      const dy = p.y - centerY;
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
      const force = (Math.random() * 18 + 8) / (dist * 0.05 + 1);
      p.vx = (dx / dist) * force * 4;
      p.vy = (dy / dist) * force * 4;
    });
  };

  // Main animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationFrameId;

    const render = (time) => {
      // FPS Calculation
      fpsRef.current.count++;
      if (time - fpsRef.current.lastTime >= 500) {
        fpsRef.current.fps = Math.round((fpsRef.current.count * 1000) / (time - fpsRef.current.lastTime));
        setCurrentFps(fpsRef.current.fps);
        fpsRef.current.count = 0;
        fpsRef.current.lastTime = time;
      }

      if (!isPaused) {
        const width = canvas.width;
        const height = canvas.height;
        const currentPalette = PALETTES[palette] || PALETTES.cosmos;
        
        // Trail fading effect via semi-transparent fill
        ctx.fillStyle = `rgba(${parseInt(currentPalette.bg.slice(1, 3), 16)}, ${parseInt(currentPalette.bg.slice(3, 5), 16)}, ${parseInt(currentPalette.bg.slice(5, 7), 16)}, ${currentPalette.trailAlpha})`;
        ctx.fillRect(0, 0, width, height);

        const targetX = mouseRef.current.isHovering ? mouseRef.current.x : width / 2;
        const targetY = mouseRef.current.isHovering ? mouseRef.current.y : height / 2;

        // Render & compute physics for each particle
        particlesRef.current.forEach((p) => {
          const dx = targetX - p.x;
          const dy = targetY - p.y;
          const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 10);

          let fx = 0;
          let fy = 0;

          if (interactionMode === 'attract') {
            const force = (speed * 8) / Math.pow(dist, 1.1);
            fx = (dx / dist) * force;
            fy = (dy / dist) * force;
          } else if (interactionMode === 'repel') {
            if (dist < 350) {
              const force = (speed * 25) / Math.pow(dist, 1.2);
              fx = -(dx / dist) * force;
              fy = -(dy / dist) * force;
            }
          } else if (interactionMode === 'vortex') {
            const force = (speed * 1.5) / Math.pow(dist, 0.6);
            const perpX = -dy / dist;
            const perpY = dx / dist;
            fx = perpX * (speed * 1.8) + (dx / dist) * force * 0.4;
            fy = perpY * (speed * 1.8) + (dy / dist) * force * 0.4;
          } else if (interactionMode === 'orbit') {
            const idealRadius = 220;
            const radiusDiff = dist - idealRadius;
            const perpX = -dy / dist;
            const perpY = dx / dist;
            fx = perpX * (speed * 1.2) + (dx / dist) * (radiusDiff * 0.02);
            fy = perpY * (speed * 1.2) + (dy / dist) * (radiusDiff * 0.02);
          } else {
            // Wander mode
            p.angle += p.angularSpeed;
            fx = Math.cos(p.angle) * 0.3 * speed;
            fy = Math.sin(p.angle) * 0.3 * speed;
          }

          p.vx = (p.vx + fx) * 0.94; // Friction damping
          p.vy = (p.vy + fy) * 0.94;

          // Limit max velocity to avoid instability
          const currentSpeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          const maxVel = speed * 4.5;
          if (currentSpeed > maxVel) {
            p.vx = (p.vx / currentSpeed) * maxVel;
            p.vy = (p.vy / currentSpeed) * maxVel;
          }

          p.x += p.vx;
          p.y += p.vy;

          // Boundary bouncing / soft wrap
          if (p.x < 0) { p.x = width; } else if (p.x > width) { p.x = 0; }
          if (p.y < 0) { p.y = height; } else if (p.y > height) { p.y = 0; }

          // Draw particle glow and core
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 8;
          ctx.shadowColor = p.color;
          ctx.fill();
          ctx.shadowBlur = 0; // Reset shadow for performance
        });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    animFrameRef.current = animationFrameId;

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPaused, interactionMode, palette, speed]);

  // Mouse interaction tracking
  const handleMouseMove = (e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      isHovering: true,
    };
  };

  const handleMouseLeave = () => {
    mouseRef.current.isHovering = false;
  };

  const applyPreset = (presetKey) => {
    const preset = PRESETS[presetKey];
    if (preset) {
      setParticleCount(preset.count);
      setSpeed(preset.speed);
      setInteractionMode(preset.mode);
      setPalette(preset.palette);
      setActivePreset(presetKey);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[720px] p-5 bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 rounded-2xl m-5 shadow-2xl">
      <div className="bg-slate-900/95 text-slate-100 p-6 md:p-8 rounded-2xl max-w-6xl w-full shadow-2xl transition-all duration-300 border border-white/15 backdrop-blur-xl flex flex-col gap-6">
        
        {/* Header section */}
        <div className="flex flex-col md:flex-row justify-between items-center pb-6 border-b border-white/10 gap-4">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">Interactive Physics Lab</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-pink-500 bg-clip-text text-transparent tracking-tight drop-shadow-sm">
              Particle Swarm Studio
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Simulate gravitational attraction, cosmic vortexes, and supernova physics in real-time.
            </p>
          </div>
          
          {/* Real-time stats badges */}
          <div className="flex gap-3 bg-slate-800/80 p-3 rounded-xl border border-slate-700/50 shadow-inner">
            <div className="text-center px-3 border-r border-slate-700">
              <span className="block text-[11px] uppercase text-slate-400 font-semibold">Particles</span>
              <span className="text-lg font-mono font-bold text-fuchsia-400">{particleCount}</span>
            </div>
            <div className="text-center px-3 border-r border-slate-700">
              <span className="block text-[11px] uppercase text-slate-400 font-semibold">FPS</span>
              <span className="text-lg font-mono font-bold text-cyan-400">{currentFps}</span>
            </div>
            <div className="text-center px-2">
              <span className="block text-[11px] uppercase text-slate-400 font-semibold">Mode</span>
              <span className="text-sm font-semibold capitalize text-amber-400 mt-1 block">{interactionMode}</span>
            </div>
          </div>
        </div>

        {/* Preset selector bar */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-800/40 p-3 rounded-xl border border-white/5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-2 flex items-center gap-1.5 ml-1">
            <svg className="w-4 h-4 text-fuchsia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            Cosmos Presets:
          </span>
          {Object.entries(PRESETS).map(([key, item]) => (
            <button
              key={key}
              onClick={() => applyPreset(key)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 shadow-sm ${
                activePreset === key
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-cyan-500/20 scale-105 border border-cyan-400/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/50'
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>

        {/* Main interactive canvas workspace */}
        <div className="relative w-full h-[460px] bg-black/60 rounded-2xl overflow-hidden border-2 border-slate-700/80 shadow-2xl group cursor-crosshair">
          <canvas
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={triggerBurst}
            className="w-full h-full block"
          />
          
          <div className="absolute top-4 left-4 pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity duration-300">
            <span className="bg-slate-900/80 text-cyan-300 text-xs px-3 py-1.5 rounded-full border border-cyan-500/30 backdrop-blur-md flex items-center gap-2 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              Move mouse to guide swarm • Click for Supernova Burst
            </span>
          </div>
        </div>

        {/* Interactive Controls & Customization Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t border-white/10">
          
          {/* Interaction mode picker */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
              Gravitational Force Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'vortex', label: 'Vortex Spin' },
                { id: 'attract', label: 'Attract Hub' },
                { id: 'repel', label: 'Repel Shield' },
                { id: 'orbit', label: 'Stable Orbit' }
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => { setInteractionMode(mode.id); setActivePreset(null); }}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold text-left transition-all duration-150 flex items-center justify-between border ${
                    interactionMode === mode.id
                      ? 'bg-fuchsia-600/20 text-fuchsia-300 border-fuchsia-500 shadow-sm shadow-fuchsia-500/10'
                      : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <span>{mode.label}</span>
                  <span className={`w-2 h-2 rounded-full ${interactionMode === mode.id ? 'bg-fuchsia-400' : 'bg-slate-600'}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Particle Count Slider */}
          <div className="space-y-2 flex flex-col justify-center bg-slate-800/40 p-4 rounded-xl border border-white/5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-300 uppercase">Swarm Density</span>
              <span className="font-mono text-cyan-400 font-bold">{particleCount} units</span>
            </div>
            <input
              type="range"
              min="200"
              max="2200"
              step="100"
              value={particleCount}
              onChange={(e) => { setParticleCount(Number(e.target.value)); setActivePreset(null); }}
              className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-700 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Light (200)</span>
              <span>Dense (2,200)</span>
            </div>
          </div>

          {/* Particle Speed Slider */}
          <div className="space-y-2 flex flex-col justify-center bg-slate-800/40 p-4 rounded-xl border border-white/5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-300 uppercase">Kinetic Speed</span>
              <span className="font-mono text-fuchsia-400 font-bold">{speed}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="7.0"
              step="0.5"
              value={speed}
              onChange={(e) => { setSpeed(Number(e.target.value)); setActivePreset(null); }}
              className="w-full accent-fuchsia-400 cursor-pointer h-2 bg-slate-700 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Calm (0.5x)</span>
              <span>Hyper (7x)</span>
            </div>
          </div>

          {/* Color Palettes */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
              Color Spectrum
            </label>
            <div className="flex flex-col gap-1.5">
              {Object.entries(PALETTES).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => { setPalette(key); setActivePreset(null); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-all border ${
                    palette === key
                      ? 'bg-slate-800 border-cyan-400/50 text-white shadow-sm'
                      : 'bg-slate-900/60 text-slate-400 border-transparent hover:bg-slate-800/80 hover:text-slate-200'
                  }`}
                >
                  <span>{val.name}</span>
                  <div className="flex -space-x-1">
                    {val.colors.slice(0, 4).map((c, idx) => (
                      <span
                        key={idx}
                        className="w-3.5 h-3.5 rounded-full border border-slate-900 shadow-xs block"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Action button toolbar */}
        <div className="flex flex-wrap justify-end items-center gap-3 pt-4 border-t border-white/10">
          <button
            onClick={() => initParticles(particleCount, palette)}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs uppercase tracking-wider transition-all flex items-center gap-2 border border-slate-600/60 active:scale-95 shadow-lg"
          >
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset Swarm
          </button>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`px-5 py-2.5 rounded-xl font-semibold text-xs uppercase tracking-wider transition-all flex items-center gap-2 border active:scale-95 shadow-lg ${
              isPaused
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 shadow-emerald-600/20'
                : 'bg-amber-600/80 hover:bg-amber-500/90 text-white border-amber-400/50 shadow-amber-600/20'
            }`}
          >
            {isPaused ? (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Resume Simulation
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Pause Lab
              </>
            )}
          </button>
          <button
            onClick={triggerBurst}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-fuchsia-600 hover:from-pink-500 hover:to-fuchsia-500 text-white font-bold text-xs uppercase tracking-wider transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-pink-500/25 flex items-center gap-2 border border-pink-400/30"
          >
            <svg className="w-4 h-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Supernova Burst (Impulse)
          </button>
        </div>

      </div>
    </div>
  );
};

export default ParticleSwarmStudio;
