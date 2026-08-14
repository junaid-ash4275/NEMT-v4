import React, { useState, useEffect, useRef, useCallback } from 'react';

// Color themes matching studio aesthetics
const THEMES = {
  cosmic: {
    id: 'cosmic',
    name: 'Cosmic Void',
    bg: 'from-slate-950 via-indigo-950 to-slate-900',
    canvasBg: '#030712',
    gridColor: 'rgba(56, 189, 248, 0.15)',
    gridGlow: '#0284c7',
    mass1Color: '#38bdf8',
    mass2Color: '#818cf8',
    waveColor: 'rgba(56, 189, 248, 0.4)',
    laserColor: '#22d3ee',
    accentGradient: 'from-cyan-400 via-sky-300 to-indigo-400',
    accentBorder: 'border-cyan-500/40',
    glow: 'shadow-cyan-500/20',
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40',
  },
  relativity: {
    id: 'relativity',
    name: 'Solar Relativity',
    bg: 'from-slate-950 via-stone-950 to-amber-950',
    canvasBg: '#0c0a09',
    gridColor: 'rgba(251, 191, 36, 0.15)',
    gridGlow: '#d97706',
    mass1Color: '#fbbf24',
    mass2Color: '#f97316',
    waveColor: 'rgba(251, 146, 60, 0.4)',
    laserColor: '#facc15',
    accentGradient: 'from-amber-400 via-orange-300 to-red-400',
    accentBorder: 'border-amber-500/40',
    glow: 'shadow-amber-500/20',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
  },
  violet: {
    id: 'violet',
    name: 'Quantum Violet',
    bg: 'from-slate-950 via-purple-950 to-fuchsia-950',
    canvasBg: '#090514',
    gridColor: 'rgba(232, 121, 249, 0.15)',
    gridGlow: '#c084fc',
    mass1Color: '#e879f9',
    mass2Color: '#a855f7',
    waveColor: 'rgba(217, 70, 239, 0.4)',
    laserColor: '#f472b6',
    accentGradient: 'from-fuchsia-400 via-purple-300 to-pink-400',
    accentBorder: 'border-fuchsia-500/40',
    glow: 'shadow-fuchsia-500/20',
    badge: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-400/40',
  },
  cyber: {
    id: 'cyber',
    name: 'Matrix Emerald',
    bg: 'from-slate-950 via-emerald-950 to-teal-950',
    canvasBg: '#02120d',
    gridColor: 'rgba(52, 211, 153, 0.15)',
    gridGlow: '#059669',
    mass1Color: '#34d399',
    mass2Color: '#2dd4bf',
    waveColor: 'rgba(16, 185, 129, 0.4)',
    laserColor: '#6ee7b7',
    accentGradient: 'from-emerald-400 via-teal-300 to-cyan-400',
    accentBorder: 'border-emerald-500/40',
    glow: 'shadow-emerald-500/20',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
  },
};

// Preset Inspirals
const PRESETS = [
  {
    id: 'gw150914',
    name: 'GW150914 (Binary Black Holes)',
    desc: 'Dual 36 M☉ and 29 M☉ black hole coalescent merger.',
    m1: 36,
    m2: 29,
    radius: 140,
    decay: 0.15,
  },
  {
    id: 'gw170817',
    name: 'GW170817 (Binary Neutron Stars)',
    desc: 'Rapid high-frequency inspiral of dual neutron stars.',
    m1: 15,
    m2: 13,
    radius: 110,
    decay: 0.25,
  },
  {
    id: 'asymmetric',
    name: 'Asymmetric Mass Inspiral',
    desc: 'Heavy 60 M☉ primary with 10 M☉ compact companion.',
    m1: 60,
    m2: 10,
    radius: 160,
    decay: 0.12,
  },
  {
    id: 'sandbox',
    name: 'Interactive Sandbox',
    desc: 'Freeform mode: click canvas to drop massive compact bodies.',
    m1: 30,
    m2: 25,
    radius: 130,
    decay: 0.08,
  },
];

const SpacetimeRippleLab = () => {
  const canvasRef = useRef(null);
  const waveformCanvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);
  const gainRef = useRef(null);

  // System parameters state
  const [theme, setTheme] = useState('cosmic');
  const [preset, setPreset] = useState('gw150914');
  const [mass1, setMass1] = useState(36);
  const [mass2, setMass2] = useState(29);
  const [sepRadius, setSepRadius] = useState(140);
  const [decayRate, setDecayRate] = useState(0.15);
  const [simSpeed, setSimSpeed] = useState(1.0);
  const [gridDensity, setGridDensity] = useState(24);
  const [showLaserInterferometer, setShowLaserInterferometer] = useState(true);
  const [isAudioMuted, setIsAudioMuted] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Physics animation mutable refs
  const physicsRef = useRef({
    angle: 0,
    currentRadius: 140,
    time: 0,
    historyStrain: [],
    shockwaves: [],
    customBodies: [],
    isMergerTriggered: false,
    mergerTime: 0,
  });

  // Telemetry HUD state
  const [telemetry, setTelemetry] = useState({
    strain: '0.00e-21',
    freq: '35.0',
    totalMass: '65',
    phase: '0.00',
    status: 'Inspiral Orbiting',
  });

  // Current active theme object
  const currentTheme = THEMES[theme];

  // Initialize Web Audio API synth
  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(40, ctx.currentTime);
        gain.gain.setValueAtTime(0.001, ctx.currentTime);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        audioCtxRef.current = ctx;
        oscRef.current = osc;
        gainRef.current = gain;
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  }, []);

  // Update audio chirp frequency and gain
  const updateAudioChirp = useCallback((freq, amplitude, isMerger) => {
    if (isAudioMuted || !gainRef.current || !oscRef.current || !audioCtxRef.current) {
      if (gainRef.current && audioCtxRef.current) {
        gainRef.current.gain.setTargetAtTime(0.0001, audioCtxRef.current.currentTime, 0.05);
      }
      return;
    }

    const ctx = audioCtxRef.current;
    const clampedFreq = Math.min(Math.max(freq * 2.5, 40), 800);
    const targetGain = isMerger ? 0.25 : Math.min(amplitude * 0.15, 0.12);

    oscRef.current.frequency.setTargetAtTime(clampedFreq, ctx.currentTime, 0.03);
    gainRef.current.gain.setTargetAtTime(targetGain, ctx.currentTime, 0.03);
  }, [isAudioMuted]);

  // Reset physics simulation state
  const resetSimulation = useCallback(() => {
    physicsRef.current = {
      angle: 0,
      currentRadius: sepRadius,
      time: 0,
      historyStrain: new Array(150).fill(0),
      shockwaves: [],
      customBodies: [],
      isMergerTriggered: false,
      mergerTime: 0,
    };
  }, [sepRadius]);

  // Apply preset configuration
  const handlePresetSelect = (presetKey) => {
    const selected = PRESETS.find((p) => p.id === presetKey);
    if (!selected) return;

    setPreset(presetKey);
    setMass1(selected.m1);
    setMass2(selected.m2);
    setSepRadius(selected.radius);
    setDecayRate(selected.decay);

    physicsRef.current.currentRadius = selected.radius;
    physicsRef.current.angle = 0;
    physicsRef.current.isMergerTriggered = false;
    physicsRef.current.historyStrain = new Array(150).fill(0);
    physicsRef.current.shockwaves = [];
  };

  // Trigger manual shockwave pulse
  const triggerShockwave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    physicsRef.current.shockwaves.push({
      x: cx,
      y: cy,
      radius: 5,
      maxRadius: Math.max(canvas.width, canvas.height) * 0.7,
      amplitude: 1.0,
      color: currentTheme.mass1Color,
    });
  };

  // Handle canvas user click (Spawn additional mass / shockwave)
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    physicsRef.current.customBodies.push({
      x: clickX,
      y: clickY,
      mass: Math.random() * 20 + 10,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      color: currentTheme.mass2Color,
    });

    physicsRef.current.shockwaves.push({
      x: clickX,
      y: clickY,
      radius: 2,
      maxRadius: 250,
      amplitude: 0.6,
      color: currentTheme.laserColor,
    });
  };

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const wfCanvas = waveformCanvasRef.current;
    if (!canvas || !wfCanvas) return;

    const ctx = canvas.getContext('2d');
    const wfCtx = wfCanvas.getContext('2d');

    const handleResize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = 480;
        wfCanvas.width = parent.clientWidth;
        wfCanvas.height = 90;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;

      // Clear Canvas
      ctx.fillStyle = currentTheme.canvasBg;
      ctx.fillRect(0, 0, width, height);

      // Simulation physics math update
      const phys = physicsRef.current;
      if (!isPaused) {
        const dt = 0.03 * simSpeed;
        phys.time += dt;

        // Total system mass
        const M_total = mass1 + mass2;
        const reducedMass = (mass1 * mass2) / M_total;

        // Orbital frequency based on Kepler's 3rd law approximation
        const r_effective = Math.max(phys.currentRadius, 12);
        const omega = Math.sqrt((M_total * 300) / Math.pow(r_effective, 3));
        phys.angle += omega * simSpeed;

        // Gravitational radiation orbital decay (Inspiral)
        if (phys.currentRadius > 14) {
          const rLoss = (decayRate * 0.2 * (M_total / 50) * Math.pow(60 / r_effective, 2)) * simSpeed;
          phys.currentRadius = Math.max(14, phys.currentRadius - rLoss);
        } else if (!phys.isMergerTriggered) {
          // Merger Event Coalescence!
          phys.isMergerTriggered = true;
          phys.mergerTime = phys.time;
          phys.shockwaves.push({
            x: cx,
            y: cy,
            radius: 10,
            maxRadius: Math.max(width, height) * 0.8,
            amplitude: 2.5,
            color: '#ffffff',
          });
        }

        // Calculate Strain Amplitude h(t)
        const strainVal = (reducedMass / (r_effective * 10)) * Math.sin(2 * phys.angle);
        phys.historyStrain.push(strainVal);
        if (phys.historyStrain.length > width / 4) {
          phys.historyStrain.shift();
        }

        // Update audio chirp
        const currentFreqHz = (omega * 15).toFixed(1);
        updateAudioChirp(parseFloat(currentFreqHz), Math.abs(strainVal), phys.isMergerTriggered);

        // Update telemetry state periodically
        const formattedStrain = (Math.abs(strainVal) * 1.25e-20).toExponential(2);
        setTelemetry({
          strain: formattedStrain,
          freq: currentFreqHz,
          totalMass: M_total.toFixed(1),
          phase: (phys.angle % (2 * Math.PI)).toFixed(2),
          status: phys.currentRadius <= 14 ? '💥 Black Hole Merger Coalescence!' : 'Inspiral Orbital Radiation',
        });
      }

      // 1. Render Spacetime Grid Mesh (Curvature Deformation)
      const cols = gridDensity;
      const rows = Math.floor(cols * (height / width));
      const stepX = width / cols;
      const stepY = height / rows;

      // Positions of orbiting primary masses
      const r1 = (phys.currentRadius * mass2) / (mass1 + mass2);
      const r2 = (phys.currentRadius * mass1) / (mass1 + mass2);
      const m1X = cx + r1 * Math.cos(phys.angle);
      const m1Y = cy + r1 * Math.sin(phys.angle);
      const m2X = cx - r2 * Math.cos(phys.angle);
      const m2Y = cy - r2 * Math.sin(phys.angle);

      // Compute deformed grid points
      const gridPoints = [];
      for (let i = 0; i <= cols; i++) {
        gridPoints[i] = [];
        for (let j = 0; j <= rows; j++) {
          const origX = i * stepX;
          const origY = j * stepY;

          // Gravitational potential displacement field calculation
          let dx1 = origX - m1X;
          let dy1 = origY - m1Y;
          let dist1 = Math.sqrt(dx1 * dx1 + dy1 * dy1) + 25;
          let pull1 = (mass1 * 180) / (dist1 * dist1);

          let dx2 = origX - m2X;
          let dy2 = origY - m2Y;
          let dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2) + 25;
          let pull2 = (mass2 * 180) / (dist2 * dist2);

          // Custom user-dropped body pulls
          let customPullX = 0;
          let customPullY = 0;
          phys.customBodies.forEach((cb) => {
            let cdx = origX - cb.x;
            let cdy = origY - cb.y;
            let cdist = Math.sqrt(cdx * cdx + cdy * cdy) + 30;
            let cpull = (cb.mass * 140) / (cdist * cdist);
            customPullX -= (cdx / cdist) * cpull * 8;
            customPullY -= (cdy / cdist) * cpull * 8;
          });

          // Helical Quadrupole Strain Wave ripple displacement
          const distCenter = Math.sqrt((origX - cx) ** 2 + (origY - cy) ** 2);
          const wavePhase = 2 * phys.angle - distCenter * 0.05;
          const waveAmp = (40 * Math.sin(wavePhase)) / (Math.sqrt(distCenter) + 8);

          const warpX = origX - (dx1 / dist1) * pull1 * 12 - (dx2 / dist2) * pull2 * 12 + customPullX;
          const warpY = origY - (dy1 / dist1) * pull1 * 12 - (dy2 / dist2) * pull2 * 12 + customPullY + waveAmp;

          gridPoints[i][j] = { x: warpX, y: warpY };
        }
      }

      // Draw grid lines
      ctx.strokeStyle = currentTheme.gridColor;
      ctx.lineWidth = 1.2;
      for (let i = 0; i <= cols; i++) {
        ctx.beginPath();
        for (let j = 0; j <= rows; j++) {
          const pt = gridPoints[i][j];
          if (j === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();
      }
      for (let j = 0; j <= rows; j++) {
        ctx.beginPath();
        for (let i = 0; i <= cols; i++) {
          const pt = gridPoints[i][j];
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();
      }

      // 2. Render Expanding Shockwaves
      for (let i = phys.shockwaves.length - 1; i >= 0; i--) {
        const sw = phys.shockwaves[i];
        sw.radius += 4 * simSpeed;
        sw.amplitude *= 0.985;

        ctx.save();
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = sw.color;
        ctx.globalAlpha = Math.max(0, sw.amplitude * 0.8);
        ctx.lineWidth = 3;
        ctx.shadowColor = sw.color;
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.restore();

        if (sw.radius > sw.maxRadius || sw.amplitude < 0.01) {
          phys.shockwaves.splice(i, 1);
        }
      }

      // 3. Render Laser Interferometer (L-Shape Arm Overlay)
      if (showLaserInterferometer) {
        const armLength = Math.min(width, height) * 0.38;
        const bsX = cx - armLength * 0.5;
        const bsY = cy + armLength * 0.5;

        // Beam Splitter
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.strokeStyle = currentTheme.laserColor;
        ctx.lineWidth = 2;
        ctx.shadowColor = currentTheme.laserColor;
        ctx.shadowBlur = 10;
        ctx.fillRect(bsX - 10, bsY - 10, 20, 20);
        ctx.strokeRect(bsX - 10, bsY - 10, 20, 20);

        // Laser Arms (X-Arm horizontal, Y-Arm vertical)
        const mirrorX_X = bsX + armLength;
        const mirrorX_Y = bsY;
        const mirrorY_X = bsX;
        const mirrorY_Y = bsY - armLength;

        // Draw Beams
        ctx.beginPath();
        ctx.moveTo(bsX, bsY);
        ctx.lineTo(mirrorX_X, mirrorX_Y);
        ctx.moveTo(bsX, bsY);
        ctx.lineTo(mirrorY_X, mirrorY_Y);
        ctx.strokeStyle = currentTheme.laserColor;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Draw End Test Mass Mirrors
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(mirrorX_X - 4, mirrorX_Y - 15, 8, 30);
        ctx.fillRect(mirrorY_X - 15, mirrorY_Y - 4, 30, 8);
        ctx.restore();
      }

      // 4. Render Orbiting Binary Mass System
      // Mass 1 (Primary)
      ctx.save();
      const m1Size = Math.max(8, Math.sqrt(mass1) * 2.2);
      const m1Glow = ctx.createRadialGradient(m1X, m1Y, 2, m1X, m1Y, m1Size * 2.5);
      m1Glow.addColorStop(0, '#ffffff');
      m1Glow.addColorStop(0.4, currentTheme.mass1Color);
      m1Glow.addColorStop(1, 'transparent');

      ctx.fillStyle = m1Glow;
      ctx.beginPath();
      ctx.arc(m1X, m1Y, m1Size * 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(m1X, m1Y, m1Size * 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Mass 2 (Secondary)
      ctx.save();
      const m2Size = Math.max(6, Math.sqrt(mass2) * 2.2);
      const m2Glow = ctx.createRadialGradient(m2X, m2Y, 2, m2X, m2Y, m2Size * 2.5);
      m2Glow.addColorStop(0, '#ffffff');
      m2Glow.addColorStop(0.4, currentTheme.mass2Color);
      m2Glow.addColorStop(1, 'transparent');

      ctx.fillStyle = m2Glow;
      ctx.beginPath();
      ctx.arc(m2X, m2Y, m2Size * 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(m2X, m2Y, m2Size * 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Render Custom Clicked Bodies
      phys.customBodies.forEach((cb) => {
        if (!isPaused) {
          cb.x += cb.vx * simSpeed;
          cb.y += cb.vy * simSpeed;

          // Boundary bouncing
          if (cb.x < 20 || cb.x > width - 20) cb.vx *= -1;
          if (cb.y < 20 || cb.y > height - 20) cb.vy *= -1;
        }

        ctx.save();
        ctx.fillStyle = cb.color;
        ctx.shadowColor = cb.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(cb.x, cb.y, Math.sqrt(cb.mass) * 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 5. Render Oscilloscope Strain Waveform h(t)
      const wfW = wfCanvas.width;
      const wfH = wfCanvas.height;
      wfCtx.fillStyle = '#050b14';
      wfCtx.fillRect(0, 0, wfW, wfH);

      // Grid line center
      wfCtx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      wfCtx.lineWidth = 1;
      wfCtx.beginPath();
      wfCtx.moveTo(0, wfH / 2);
      wfCtx.lineTo(wfW, wfH / 2);
      wfCtx.stroke();

      // Strain Line
      wfCtx.beginPath();
      const strainData = phys.historyStrain;
      const dx = wfW / (strainData.length - 1);
      for (let k = 0; k < strainData.length; k++) {
        const val = strainData[k];
        const py = wfH / 2 - val * (wfH * 0.35);
        if (k === 0) wfCtx.moveTo(0, py);
        else wfCtx.lineTo(k * dx, py);
      }
      wfCtx.strokeStyle = currentTheme.mass1Color;
      wfCtx.lineWidth = 2;
      wfCtx.shadowColor = currentTheme.mass1Color;
      wfCtx.shadowBlur = 8;
      wfCtx.stroke();

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [
    theme,
    gridDensity,
    mass1,
    mass2,
    simSpeed,
    decayRate,
    isPaused,
    showLaserInterferometer,
    currentTheme,
    updateAudioChirp,
  ]);

  return (
    <div className={`w-full max-w-7xl mx-auto my-8 p-4 md:p-6 rounded-3xl bg-gradient-to-br ${currentTheme.bg} border border-slate-800 shadow-2xl transition-all duration-500`}>
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${currentTheme.badge}`}>
              Relativity & Quantum Interferometry
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              LIGO Strain Detector Active
            </span>
          </div>
          <h2 className={`text-2xl md:text-3xl font-extrabold bg-gradient-to-r ${currentTheme.accentGradient} bg-clip-text text-transparent`}>
            Spacetime Ripple & Gravitational Wave Lab
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Simulate binary black hole inspirals, spacetime grid warping metric tensor, and laser interferometry strain chirps.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all ${
              isPaused
                ? 'bg-amber-500/20 border-amber-400/40 text-amber-300 hover:bg-amber-500/30'
                : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700'
            }`}
          >
            {isPaused ? '▶ Resume' : '⏸ Pause'}
          </button>
          <button
            onClick={resetSimulation}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800/80 border border-slate-700 text-slate-200 hover:bg-slate-700 transition-all"
          >
            🔄 Reset Orbit
          </button>
          <button
            onClick={triggerShockwave}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/30 transition-all"
          >
            💥 Gravitational Shockwave
          </button>
          <button
            onClick={() => {
              initAudio();
              setIsAudioMuted(!isAudioMuted);
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all ${
              !isAudioMuted
                ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/30'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {!isAudioMuted ? '🔊 Chirp Audio ON' : '🔇 Mute Audio'}
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Canvas & Waveform Viewport (3 Cols) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {/* Main Interactive Spacetime Canvas */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-800/80 shadow-inner bg-slate-950">
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="w-full h-[480px] cursor-crosshair block"
            />
            {/* Overlay hint */}
            <div className="absolute top-3 left-3 pointer-events-none text-[11px] text-slate-400 bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800">
              💡 Click anywhere on spacetime grid to drop compact masses & launch gravity pulses
            </div>
          </div>

          {/* Real-time Oscilloscope Strain Monitor */}
          <div className="rounded-2xl p-3 bg-slate-950/90 border border-slate-800/80">
            <div className="flex items-center justify-between px-2 mb-1.5">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                Interferometer Strain Signal h(t) Oscilloscope
              </span>
              <span className="text-[11px] font-mono text-cyan-400">
                Strain: {telemetry.strain}
              </span>
            </div>
            <canvas
              ref={waveformCanvasRef}
              className="w-full h-[90px] rounded-xl border border-slate-800/50 block"
            />
          </div>
        </div>

        {/* Control Sidebar (1 Col) */}
        <div className="flex flex-col gap-5">
          {/* Telemetry Dashboard Card */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col gap-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Live Telemetry HUD
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
                <span className="text-slate-500 block text-[10px]">GW Frequency</span>
                <span className="text-sm font-mono font-bold text-sky-400">{telemetry.freq} Hz</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
                <span className="text-slate-500 block text-[10px]">Total Mass</span>
                <span className="text-sm font-mono font-bold text-amber-400">{telemetry.totalMass} M☉</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
                <span className="text-slate-500 block text-[10px]">Orbital Phase</span>
                <span className="text-sm font-mono font-bold text-fuchsia-400">{telemetry.phase} rad</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
                <span className="text-slate-500 block text-[10px]">Strain h_max</span>
                <span className="text-sm font-mono font-bold text-emerald-400">10⁻²⁰</span>
              </div>
            </div>
            <div className="mt-1 p-2 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-[11px] font-medium text-cyan-300 text-center">
              {telemetry.status}
            </div>
          </div>

          {/* Preset Selector */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col gap-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Inspiral Presets
            </h3>
            <div className="flex flex-col gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handlePresetSelect(p.id)}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all ${
                    preset === p.id
                      ? `bg-gradient-to-r ${currentTheme.badge} font-semibold`
                      : 'bg-slate-950/40 border-slate-800/60 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <div className="font-bold">{p.name}</div>
                  <div className="text-[10px] opacity-75 mt-0.5">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Theme Selector */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col gap-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Visual Palette Theme
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(THEMES).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`p-2 rounded-xl text-xs font-semibold border transition-all ${
                    theme === t.id
                      ? 'bg-slate-800 text-white border-slate-600 shadow-md'
                      : 'bg-slate-950/40 text-slate-400 border-slate-800/60 hover:bg-slate-800/40'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Parameter Sliders */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col gap-3 text-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Physics Controls
            </h3>

            {/* Mass 1 Slider */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Primary Mass M₁</span>
                <span className="font-mono text-cyan-400">{mass1} M☉</span>
              </div>
              <input
                type="range"
                min="10"
                max="80"
                value={mass1}
                onChange={(e) => setMass1(Number(e.target.value))}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Mass 2 Slider */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Secondary Mass M₂</span>
                <span className="font-mono text-indigo-400">{mass2} M☉</span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                value={mass2}
                onChange={(e) => setMass2(Number(e.target.value))}
                className="w-full accent-indigo-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Simulation Speed */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Sim Speed</span>
                <span className="font-mono text-amber-400">{simSpeed}x</span>
              </div>
              <input
                type="range"
                min="0.25"
                max="2.0"
                step="0.25"
                value={simSpeed}
                onChange={(e) => setSimSpeed(Number(e.target.value))}
                className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Grid Density */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Grid Mesh Resolution</span>
                <span className="font-mono text-emerald-400">{gridDensity}</span>
              </div>
              <input
                type="range"
                min="16"
                max="36"
                step="2"
                value={gridDensity}
                onChange={(e) => setGridDensity(Number(e.target.value))}
                className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Laser Interferometer Arm Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-slate-300">Show Interferometer Arms</span>
              <input
                type="checkbox"
                checked={showLaserInterferometer}
                onChange={(e) => setShowLaserInterferometer(e.target.checked)}
                className="w-4 h-4 accent-cyan-400 cursor-pointer rounded"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpacetimeRippleLab;
