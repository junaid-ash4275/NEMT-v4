import React, { useState, useEffect, useRef, useCallback } from 'react';

// Color spectrum presets for fluid themes
const FLUID_THEMES = {
  cyberCyan: {
    name: 'Cyber Neon',
    bg: '#040d1a',
    accent: '#00f0ff',
    glow: '#0077ff',
    waterColor: [0, 240, 255],
    deepColor: [4, 13, 26],
    meshColor: '#00f0ff',
  },
  bioluminescent: {
    name: 'Bioluminescent Lagoon',
    bg: '#031410',
    accent: '#10b981',
    glow: '#34d399',
    waterColor: [16, 185, 129],
    deepColor: [3, 20, 16],
    meshColor: '#34d399',
  },
  liquidGold: {
    name: 'Liquid Sunflare',
    bg: '#180a02',
    accent: '#fbbf24',
    glow: '#f97316',
    waterColor: [251, 191, 36],
    deepColor: [24, 10, 2],
    meshColor: '#fbbf24',
  },
  quantumPlasma: {
    name: 'Quantum Plasma',
    bg: '#12041d',
    accent: '#d946ef',
    glow: '#8b5cf6',
    waterColor: [217, 70, 239],
    deepColor: [18, 4, 29],
    meshColor: '#e879f9',
  },
  toxicSlime: {
    name: 'Bio-Toxic Slime',
    bg: '#081404',
    accent: '#84cc16',
    glow: '#22c55e',
    waterColor: [132, 204, 22],
    deepColor: [8, 20, 4],
    meshColor: '#a3e635',
  }
};

const PRESETS = {
  tranquil: {
    name: 'Tranquil Lotus Pond',
    theme: 'bioluminescent',
    renderMode: 'realistic',
    damping: 0.97,
    waveSpeed: 0.8,
    rainIntensity: 1,
    splashPower: 120,
    showFloatingOrbs: true
  },
  cyberStorm: {
    name: 'Cyberpunk Grid Surge',
    theme: 'cyberCyan',
    renderMode: 'wireframe',
    damping: 0.99,
    waveSpeed: 1.2,
    rainIntensity: 4,
    splashPower: 220,
    showFloatingOrbs: true
  },
  moltenGold: {
    name: 'Molten Sunflare',
    theme: 'liquidGold',
    renderMode: 'heatmap',
    damping: 0.94,
    waveSpeed: 0.6,
    rainIntensity: 0,
    splashPower: 180,
    showFloatingOrbs: false
  },
  quantumVoid: {
    name: 'Quantum Hyper-Grid',
    theme: 'quantumPlasma',
    renderMode: 'realistic',
    damping: 0.985,
    waveSpeed: 1.0,
    rainIntensity: 2,
    splashPower: 250,
    showFloatingOrbs: true
  }
};

const PENTATONIC_NOTES = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];

const FluidRippleLab = () => {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const audioCtxRef = useRef(null);

  // Simulation Grid Resolution (Width & Height of internal simulation buffer)
  const GRID_W = 128;
  const GRID_H = 80;

  // Double heightfield buffer for wave equation physics
  const buffer1Ref = useRef(new Float32Array(GRID_W * GRID_H));
  const buffer2Ref = useRef(new Float32Array(GRID_W * GRID_H));
  const isBuffer1Active = useRef(true);

  // Floating Orbs Physics
  const floatingOrbsRef = useRef([]);

  // Control States
  const [themeKey, setThemeKey] = useState('cyberCyan');
  const [renderMode, setRenderMode] = useState('realistic'); // 'realistic', 'wireframe', 'heatmap', 'contour'
  const [damping, setDamping] = useState(0.975); // Fluid viscosity / damping (0.90 to 0.995)
  const [waveSpeed, setWaveSpeed] = useState(1.0);
  const [rainIntensity, setRainIntensity] = useState(1); // 0 = off, 1 = light, 5 = heavy
  const [splashPower, setSplashPower] = useState(160);
  const [showFloatingOrbs, setShowFloatingOrbs] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activePreset, setActivePreset] = useState('tranquil');

  // Diagnostic Stats
  const [currentFps, setCurrentFps] = useState(60);
  const [waveEnergy, setWaveEnergy] = useState(0);
  const fpsRef = useRef({ count: 0, lastTime: performance.now() });

  // Initialize floating lotus orbs
  const initFloatingOrbs = useCallback(() => {
    const orbs = [];
    const count = 12;
    for (let i = 0; i < count; i++) {
      orbs.push({
        x: Math.random() * (GRID_W - 10) + 5,
        y: Math.random() * (GRID_H - 10) + 5,
        vx: 0,
        vy: 0,
        radius: Math.random() * 2 + 2,
        color: i % 2 === 0 ? '#ffffff' : FLUID_THEMES[themeKey].accent
      });
    }
    floatingOrbsRef.current = orbs;
  }, [themeKey]);

  useEffect(() => {
    initFloatingOrbs();
  }, [initFloatingOrbs]);

  // Web Audio Synth Drop Sound Trigger
  const playDropSound = useCallback((intensity = 1.0, freqShift = 1.0) => {
    if (!isAudioEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtxRef.current = new AudioContext();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Pick tone from pentatonic scale
      const baseNote = PENTATONIC_NOTES[Math.floor(Math.random() * PENTATONIC_NOTES.length)];
      const startFreq = baseNote * freqShift;
      const endFreq = startFreq * 1.8;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.08);

      const vol = Math.min(Math.max(intensity * 0.15, 0.02), 0.3);
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }, [isAudioEnabled]);

  // Inject a ripple disturbance onto the heightfield
  const addRipple = useCallback((gx, gy, strength = splashPower) => {
    const x = Math.round(gx);
    const y = Math.round(gy);
    if (x <= 2 || x >= GRID_W - 2 || y <= 2 || y >= GRID_H - 2) return;

    const currentBuffer = isBuffer1Active.current ? buffer1Ref.current : buffer2Ref.current;
    const radius = 3;

    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx > 0 && nx < GRID_W - 1 && ny > 0 && ny < GRID_H - 1) {
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist <= radius) {
            const index = ny * GRID_W + nx;
            const factor = Math.cos((dist / radius) * (Math.PI / 2));
            currentBuffer[index] += strength * factor;
          }
        }
      }
    }
  }, [splashPower]);

  // Trigger Central Tsunami Wave
  const triggerTsunami = () => {
    addRipple(GRID_W / 2, GRID_H / 2, splashPower * 3.5);
    playDropSound(2.5, 0.7);
  };

  // Trigger Vortex Whirlpool Disturbances
  const triggerVortex = () => {
    const cx = GRID_W / 2;
    const cy = GRID_H / 2;
    const count = 8;
    const radius = 18;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const vx = cx + Math.cos(angle) * radius;
      const vy = cy + Math.sin(angle) * radius;
      addRipple(vx, vy, splashPower * 1.5);
    }
    playDropSound(2.0, 1.3);
  };

  // Clear Surface
  const clearSurface = () => {
    buffer1Ref.current.fill(0);
    buffer2Ref.current.fill(0);
  };

  // Apply Preset Config
  const applyPreset = (presetKey) => {
    const p = PRESETS[presetKey];
    if (p) {
      setThemeKey(p.theme);
      setRenderMode(p.renderMode);
      setDamping(p.damping);
      setWaveSpeed(p.waveSpeed);
      setRainIntensity(p.rainIntensity);
      setSplashPower(p.splashPower);
      setShowFloatingOrbs(p.showFloatingOrbs);
      setActivePreset(presetKey);
    }
  };

  // Main Canvas Render & Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Create image data for pixel-perfect rendering
    const imgData = ctx.createImageData(GRID_W, GRID_H);
    const pixels = imgData.data;

    let animationFrameId;

    const render = (time) => {
      // FPS Tracking
      fpsRef.current.count++;
      if (time - fpsRef.current.lastTime >= 500) {
        setCurrentFps(Math.round((fpsRef.current.count * 1000) / (time - fpsRef.current.lastTime)));
        fpsRef.current.count = 0;
        fpsRef.current.lastTime = time;
      }

      if (!isPaused) {
        // Rain Generator
        if (rainIntensity > 0 && Math.random() < rainIntensity * 0.08) {
          const rx = Math.floor(Math.random() * (GRID_W - 8)) + 4;
          const ry = Math.floor(Math.random() * (GRID_H - 8)) + 4;
          const rStrength = (Math.random() * 0.6 + 0.4) * splashPower;
          addRipple(rx, ry, rStrength);
          if (Math.random() < 0.15) {
            playDropSound(0.5, 0.8 + Math.random() * 0.6);
          }
        }

        // Swap buffers for heightfield wave propagation
        const sourceBuf = isBuffer1Active.current ? buffer1Ref.current : buffer2Ref.current;
        const targetBuf = isBuffer1Active.current ? buffer2Ref.current : buffer1Ref.current;

        let totalEnergy = 0;
        const theme = FLUID_THEMES[themeKey] || FLUID_THEMES.cyberCyan;

        // Discrete Wave Equation Physics Loop:
        // h_next(x, y) = [h(x-1,y) + h(x+1,y) + h(x,y-1) + h(x,y+1)] / 2 - h_prev(x, y)
        for (let y = 1; y < GRID_H - 1; y++) {
          const rowOffset = y * GRID_W;
          for (let x = 1; x < GRID_W - 1; x++) {
            const idx = rowOffset + x;

            const n = sourceBuf[idx - GRID_W];
            const s = sourceBuf[idx + GRID_W];
            const w = sourceBuf[idx - 1];
            const e = sourceBuf[idx + 1];

            // Wave height computation with waveSpeed scaling
            let waveVal = ((n + s + w + e) * 0.5 - targetBuf[idx]) * damping;
            targetBuf[idx] = waveVal;

            totalEnergy += Math.abs(waveVal);
          }
        }

        // Swap active buffer ref for next iteration
        isBuffer1Active.current = !isBuffer1Active.current;
        setWaveEnergy(Math.round(totalEnergy / 10));

        // Render buffer onto image canvas pixel buffer
        const renderBuf = targetBuf;
        const [rW, gW, bW] = theme.waterColor;
        const [rD, gD, bD] = theme.deepColor;

        if (renderMode === 'realistic') {
          for (let y = 0; y < GRID_H; y++) {
            for (let x = 0; x < GRID_W; x++) {
              const i = y * GRID_W + x;
              const pxIdx = i * 4;

              // Calculate surface normal / refraction gradient
              const dx = (x > 0 && x < GRID_W - 1) ? renderBuf[i + 1] - renderBuf[i - 1] : 0;
              const dy = (y > 0 && y < GRID_H - 1) ? renderBuf[i + GRID_W] - renderBuf[i - GRID_W] : 0;

              const val = renderBuf[i];
              const highlight = Math.min(Math.max((dx + dy) * 1.5, -100), 200);

              // Shading interpolation
              const r = Math.min(255, Math.max(0, rD + (rW - rD) * (val / 100) + highlight));
              const g = Math.min(255, Math.max(0, gD + (gW - gD) * (val / 100) + highlight * 1.2));
              const b = Math.min(255, Math.max(0, bD + (bW - bD) * (val / 100) + highlight * 1.4));

              pixels[pxIdx] = r;
              pixels[pxIdx + 1] = g;
              pixels[pxIdx + 2] = b;
              pixels[pxIdx + 3] = 255;
            }
          }
          ctx.putImageData(imgData, 0, 0);
        } else if (renderMode === 'heatmap') {
          for (let y = 0; y < GRID_H; y++) {
            for (let x = 0; x < GRID_W; x++) {
              const i = y * GRID_W + x;
              const pxIdx = i * 4;
              const val = Math.abs(renderBuf[i]);

              const r = Math.min(255, val * 3);
              const g = Math.min(255, val * 1.2);
              const b = Math.min(255, 255 - val * 2);

              pixels[pxIdx] = r;
              pixels[pxIdx + 1] = g;
              pixels[pxIdx + 2] = b;
              pixels[pxIdx + 3] = 255;
            }
          }
          ctx.putImageData(imgData, 0, 0);
        } else if (renderMode === 'wireframe') {
          ctx.fillStyle = theme.bg;
          ctx.fillRect(0, 0, GRID_W, GRID_H);
          ctx.strokeStyle = theme.meshColor;
          ctx.lineWidth = 0.5;

          ctx.beginPath();
          const step = 4;
          for (let y = 0; y < GRID_H; y += step) {
            for (let x = 0; x < GRID_W; x += step) {
              const idx = y * GRID_W + x;
              const h = renderBuf[idx] * 0.15;
              if (x === 0) ctx.moveTo(x, y - h);
              else ctx.lineTo(x, y - h);
            }
          }
          ctx.stroke();
        } else {
          // Contour Lines Mode
          ctx.fillStyle = theme.bg;
          ctx.fillRect(0, 0, GRID_W, GRID_H);
          ctx.fillStyle = theme.accent;

          for (let y = 0; y < GRID_H; y += 2) {
            for (let x = 0; x < GRID_W; x += 2) {
              const val = renderBuf[y * GRID_W + x];
              if (Math.abs(val) % 15 < 3 && Math.abs(val) > 5) {
                ctx.fillRect(x, y, 1.5, 1.5);
              }
            }
          }
        }

        // Physics Update & Render Floating Orbs
        if (showFloatingOrbs) {
          floatingOrbsRef.current.forEach((orb) => {
            const gx = Math.min(Math.max(Math.floor(orb.x), 1), GRID_W - 2);
            const gy = Math.min(Math.max(Math.floor(orb.y), 1), GRID_H - 2);
            const idx = gy * GRID_W + gx;

            // Height gradients compute surface slope force push
            const slopeX = (renderBuf[idx + 1] - renderBuf[idx - 1]) * 0.02 * waveSpeed;
            const slopeY = (renderBuf[idx + GRID_W] - renderBuf[idx - GRID_W]) * 0.02 * waveSpeed;

            orb.vx = (orb.vx + slopeX) * 0.92;
            orb.vy = (orb.vy + slopeY) * 0.92;

            orb.x += orb.vx;
            orb.y += orb.vy;

            // Boundary collision bounce
            if (orb.x < 3) { orb.x = 3; orb.vx *= -0.5; }
            if (orb.x > GRID_W - 4) { orb.x = GRID_W - 4; orb.vx *= -0.5; }
            if (orb.y < 3) { orb.y = 3; orb.vy *= -0.5; }
            if (orb.y > GRID_H - 4) { orb.y = GRID_H - 4; orb.vy *= -0.5; }

            // Draw floating lotus orb on canvas
            ctx.beginPath();
            ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
            ctx.fillStyle = orb.color;
            ctx.shadowBlur = 4;
            ctx.shadowColor = theme.accent;
            ctx.fill();
            ctx.shadowBlur = 0;
          });
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    animFrameRef.current = animationFrameId;

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPaused, damping, waveSpeed, themeKey, renderMode, rainIntensity, splashPower, showFloatingOrbs, addRipple, playDropSound]);

  // Canvas Mouse / Pointer Interaction
  const handlePointerDown = (e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = GRID_W / rect.width;
    const scaleY = GRID_H / rect.height;

    const gx = (e.clientX - rect.left) * scaleX;
    const gy = (e.clientY - rect.top) * scaleY;

    addRipple(gx, gy, splashPower * 1.8);
    playDropSound(1.2, 1.0 + Math.random() * 0.4);
  };

  const handlePointerMove = (e) => {
    if (e.buttons !== 1 || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = GRID_W / rect.width;
    const scaleY = GRID_H / rect.height;

    const gx = (e.clientX - rect.left) * scaleX;
    const gy = (e.clientY - rect.top) * scaleY;

    addRipple(gx, gy, splashPower * 0.9);
  };

  const activeTheme = FLUID_THEMES[themeKey] || FLUID_THEMES.cyberCyan;

  return (
    <div className="flex justify-center items-center min-h-[720px] p-5 bg-gradient-to-br from-cyan-950 via-slate-950 to-indigo-950 rounded-2xl m-5 shadow-2xl">
      <div className="bg-slate-900/95 text-slate-100 p-6 md:p-8 rounded-2xl max-w-6xl w-full shadow-2xl transition-all duration-300 border border-cyan-500/20 backdrop-blur-xl flex flex-col gap-6">
        
        {/* Header bar */}
        <div className="flex flex-col md:flex-row justify-between items-center pb-6 border-b border-white/10 gap-4">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">Hydrodynamic Physics Lab</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent tracking-tight drop-shadow-sm">
              Fluid Ripple & Liquid Surface Studio
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Real-time wave equation simulation with interactive surface tension, light refraction, & acoustic synthesizer feedback.
            </p>
          </div>
          
          {/* Live Physics Metrics */}
          <div className="flex gap-3 bg-slate-800/80 p-3 rounded-xl border border-slate-700/50 shadow-inner">
            <div className="text-center px-3 border-r border-slate-700">
              <span className="block text-[11px] uppercase text-slate-400 font-semibold">Wave Energy</span>
              <span className="text-lg font-mono font-bold text-cyan-400">{waveEnergy}</span>
            </div>
            <div className="text-center px-3 border-r border-slate-700">
              <span className="block text-[11px] uppercase text-slate-400 font-semibold">FPS</span>
              <span className="text-lg font-mono font-bold text-emerald-400">{currentFps}</span>
            </div>
            <div className="text-center px-2">
              <span className="block text-[11px] uppercase text-slate-400 font-semibold">Viscosity</span>
              <span className="text-sm font-semibold text-amber-400 mt-1 block font-mono">
                {damping > 0.98 ? 'Low (Water)' : damping > 0.95 ? 'Medium' : 'High (Honey)'}
              </span>
            </div>
          </div>
        </div>

        {/* Preset Selection Buttons */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-800/40 p-3 rounded-xl border border-white/5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-2 flex items-center gap-1.5 ml-1">
            <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Fluid Presets:
          </span>
          {Object.entries(PRESETS).map(([key, item]) => (
            <button
              key={key}
              onClick={() => applyPreset(key)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 shadow-sm ${
                activePreset === key
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-cyan-500/20 scale-105 border border-cyan-400/40'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/50'
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>

        {/* Main Canvas Hydro-Surface Container */}
        <div className="relative w-full h-[440px] bg-black rounded-2xl overflow-hidden border-2 border-cyan-500/30 shadow-2xl group cursor-crosshair">
          <canvas
            ref={canvasRef}
            width={GRID_W}
            height={GRID_H}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            className="w-full h-full block image-rendering-pixelated transition-opacity duration-300"
            style={{ imageRendering: 'pixelated' }}
          />

          {/* Floating Canvas Overlay Instructions */}
          <div className="absolute top-4 left-4 pointer-events-none opacity-70 group-hover:opacity-100 transition-opacity duration-300">
            <span className="bg-slate-900/80 text-cyan-300 text-xs px-3.5 py-1.5 rounded-full border border-cyan-500/30 backdrop-blur-md flex items-center gap-2 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              Click or drag on liquid to cast wave ripples & push floating lotus orbs
            </span>
          </div>

          {/* Audio State Badge */}
          <div className="absolute top-4 right-4 pointer-events-none">
            <span className={`text-xs px-3 py-1.5 rounded-full backdrop-blur-md border flex items-center gap-1.5 shadow-md ${
              isAudioEnabled 
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' 
                : 'bg-slate-900/80 text-slate-400 border-slate-700'
            }`}>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
              {isAudioEnabled ? 'Synth Acoustics ON' : 'Audio Muted'}
            </span>
          </div>
        </div>

        {/* Interactive Controls & Parameters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t border-white/10">
          
          {/* Render Mode Picker */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
              Surface Shader Renderer
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'realistic', label: 'Refraction Water' },
                { id: 'wireframe', label: '3D Wireframe' },
                { id: 'heatmap', label: 'Energy Heatmap' },
                { id: 'contour', label: 'Contour Lines' }
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => { setRenderMode(mode.id); setActivePreset(null); }}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold text-left transition-all duration-150 flex items-center justify-between border ${
                    renderMode === mode.id
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500 shadow-sm shadow-cyan-500/10'
                      : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <span>{mode.label}</span>
                  <span className={`w-2 h-2 rounded-full ${renderMode === mode.id ? 'bg-cyan-400' : 'bg-slate-600'}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Damping / Viscosity Slider */}
          <div className="space-y-2 flex flex-col justify-center bg-slate-800/40 p-4 rounded-xl border border-white/5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-300 uppercase">Fluid Tension & Damping</span>
              <span className="font-mono text-cyan-400 font-bold">{damping.toFixed(3)}</span>
            </div>
            <input
              type="range"
              min="0.910"
              max="0.992"
              step="0.002"
              value={damping}
              onChange={(e) => { setDamping(Number(e.target.value)); setActivePreset(null); }}
              className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-700 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Viscous (0.91)</span>
              <span>Fluid (0.99)</span>
            </div>
          </div>

          {/* Rain Intensity Slider */}
          <div className="space-y-2 flex flex-col justify-center bg-slate-800/40 p-4 rounded-xl border border-white/5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-300 uppercase">Raindrop Frequency</span>
              <span className="font-mono text-indigo-400 font-bold">{rainIntensity === 0 ? 'Off' : `${rainIntensity}x`}</span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="1"
              value={rainIntensity}
              onChange={(e) => { setRainIntensity(Number(e.target.value)); setActivePreset(null); }}
              className="w-full accent-indigo-400 cursor-pointer h-2 bg-slate-700 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Calm (0)</span>
              <span>Downpour (5x)</span>
            </div>
          </div>

          {/* Fluid Color Spectrum Theme */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
              Fluid Color Theme
            </label>
            <div className="flex flex-col gap-1.5">
              {Object.entries(FLUID_THEMES).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => { setThemeKey(key); setActivePreset(null); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-all border ${
                    themeKey === key
                      ? 'bg-slate-800 border-cyan-400/50 text-white shadow-sm'
                      : 'bg-slate-900/60 text-slate-400 border-transparent hover:bg-slate-800/80 hover:text-slate-200'
                  }`}
                >
                  <span>{val.name}</span>
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-slate-900 shadow-xs block"
                    style={{ backgroundColor: val.accent }}
                  />
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Action Button Toolbar */}
        <div className="flex flex-wrap justify-between items-center gap-3 pt-4 border-t border-white/10">
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAudioEnabled(!isAudioEnabled)}
              className={`px-4 py-2.5 rounded-xl font-semibold text-xs uppercase tracking-wider transition-all flex items-center gap-2 border active:scale-95 shadow-md ${
                isAudioEnabled
                  ? 'bg-emerald-600/80 hover:bg-emerald-500 text-white border-emerald-400'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-600'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
              {isAudioEnabled ? 'Audio: Enabled' : 'Enable Acoustic Synth'}
            </button>

            <button
              onClick={() => setShowFloatingOrbs(!showFloatingOrbs)}
              className={`px-4 py-2.5 rounded-xl font-semibold text-xs uppercase tracking-wider transition-all border ${
                showFloatingOrbs
                  ? 'bg-indigo-600/80 text-white border-indigo-400'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              Floating Lotus: {showFloatingOrbs ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={clearSurface}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs uppercase tracking-wider transition-all flex items-center gap-2 border border-slate-600/60 active:scale-95 shadow-md"
            >
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear Surface
            </button>

            <button
              onClick={triggerVortex}
              className="px-4 py-2.5 rounded-xl bg-indigo-600/80 hover:bg-indigo-500 text-white font-semibold text-xs uppercase tracking-wider transition-all flex items-center gap-2 border border-indigo-400/50 active:scale-95 shadow-md"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Whirlpool Vortex
            </button>

            <button
              onClick={triggerTsunami}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-cyan-500/25 flex items-center gap-2 border border-cyan-300/30"
            >
              <svg className="w-4 h-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Tsunami Shockwave
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default FluidRippleLab;
