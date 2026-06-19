import React, { useState, useEffect, useRef, useCallback } from 'react';

// Frequencies for a beautiful pentatonic scale mapping (C3 to A6)
const PENTATONIC_SCALE = [
  130.81, 146.83, 164.81, 196.00, 220.00, // C3, D3, E3, G3, A3
  261.63, 293.66, 329.63, 392.00, 440.00, // C4, D4, E4, G4, A4
  523.25, 587.33, 659.25, 783.99, 880.00, // C5, D5, E5, G5, A5
  1046.50, 1174.66, 1318.51, 1567.98, 1760.00 // C6, D6, E6, G6, A6
];

// Color palettes for rendering pendulums and their trails
const PALETTES = {
  NeonRave: ['#ff007f', '#00f0ff', '#ab00ff', '#39ff14', '#ffff00'],
  SunsetGlow: ['#ff4500', '#ff8c00', '#ff007f', '#ffd700', '#ff1493'],
  AuroraBorealis: ['#00ffcc', '#00ff66', '#3300cc', '#9933ff', '#00bcff'],
  CyberpunkGrid: ['#ffe600', '#00a8ff', '#e000ff', '#ff3c00', '#00ff88'],
  MonochromeGlow: ['#ffffff', '#cbd5e1', '#94a3b8', '#38bdf8', '#0284c7']
};

const PRESETS = {
  ButterflyEffect: {
    name: 'Butterfly Effect',
    description: '15 pendulums starting with only 0.0001 rad difference. Watch them swing in unison, then split dramatically into complete chaos.',
    gravity: 9.81,
    damping: 0.0002,
    count: 15,
    m1: 15,
    m2: 15,
    l1: 120,
    l2: 120,
    theta1Start: 2.3, // ~131 deg
    theta2Start: 2.0, // ~114 deg
    deviation: 0.0001
  },
  SymmetricWaves: {
    name: 'Symmetric Waves',
    description: '12 pendulums placed at regular intervals. Watch them form beautiful oscillating waves before dispersing into chaos.',
    gravity: 9.81,
    damping: 0.0005,
    count: 12,
    m1: 14,
    m2: 14,
    l1: 130,
    l2: 110,
    theta1Start: 1.57, // 90 deg
    theta2Start: 1.57, // 90 deg
    deviation: 0.06
  },
  InvertedMomentum: {
    name: 'Inverted Loop',
    description: '3 high-energy pendulums starting inverted (180 degrees) in zero gravity. Watch them loop under pure rotational inertia.',
    gravity: 0,
    damping: 0.0001,
    count: 3,
    m1: 20,
    m2: 10,
    l1: 110,
    l2: 110,
    theta1Start: 3.1415,
    theta2Start: 3.12,
    deviation: 0.005
  },
  HeavyCenter: {
    name: 'Heavy Bobs',
    description: 'A single pendulum with an extremely heavy second bob (M2 = 50, M1 = 5), showcasing rapid whipping movements.',
    gravity: 12,
    damping: 0.001,
    count: 1,
    m1: 5,
    m2: 50,
    l1: 140,
    l2: 90,
    theta1Start: 2.0,
    theta2Start: 1.0,
    deviation: 0
  },
  LowGravityZen: {
    name: 'Low Gravity Zen',
    description: '20 pendulums under low gravity and high damping. They float slowly, creating a peaceful, ambient sound chime bed.',
    gravity: 2.5,
    damping: 0.004,
    count: 20,
    m1: 10,
    m2: 10,
    l1: 130,
    l2: 130,
    theta1Start: 1.8,
    theta2Start: 1.4,
    deviation: 0.002
  }
};

// Coupled differential equations of motion derivatives
const getDerivatives = (state, params) => {
  const [t1, w1, t2, w2] = state;
  const { g, m1, m2, l1, l2, damp } = params;

  const mu = t1 - t2;

  // Equation for Theta 1 angular acceleration
  const num1 = -g * (2 * m1 + m2) * Math.sin(t1) 
               - m2 * g * Math.sin(t1 - 2 * t2) 
               - 2 * Math.sin(mu) * m2 * (w2 * w2 * l2 + w1 * w1 * l1 * Math.cos(mu));
  const den1 = l1 * (2 * m1 + m2 - m2 * Math.cos(2 * t1 - 2 * t2));
  const alpha1 = num1 / den1;

  // Equation for Theta 2 angular acceleration
  const num2 = 2 * Math.sin(mu) * (w1 * w1 * l1 * (m1 + m2) + g * (m1 + m2) * Math.cos(t1) + w2 * w2 * l2 * m2 * Math.cos(mu));
  const den2 = l2 * (2 * m1 + m2 - m2 * Math.cos(2 * t1 - 2 * t2));
  const alpha2 = num2 / den2;

  return [
    w1,
    alpha1 - damp * w1,
    w2,
    alpha2 - damp * w2
  ];
};

// Runge-Kutta 4th order integration stepper
const rk4Step = (state, params, dt) => {
  const k1 = getDerivatives(state, params);
  
  const state2 = [
    state[0] + 0.5 * dt * k1[0],
    state[1] + 0.5 * dt * k1[1],
    state[2] + 0.5 * dt * k1[2],
    state[3] + 0.5 * dt * k1[3]
  ];
  const k2 = getDerivatives(state2, params);

  const state3 = [
    state[0] + 0.5 * dt * k2[0],
    state[1] + 0.5 * dt * k2[1],
    state[2] + 0.5 * dt * k2[2],
    state[3] + 0.5 * dt * k2[3]
  ];
  const k3 = getDerivatives(state3, params);

  const state4 = [
    state[0] + dt * k3[0],
    state[1] + dt * k3[1],
    state[2] + dt * k3[2],
    state[3] + dt * k3[3]
  ];
  const k4 = getDerivatives(state4, params);

  return [
    state[0] + (dt / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]),
    state[1] + (dt / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]),
    state[2] + (dt / 6) * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2]),
    state[3] + (dt / 6) * (k1[3] + 2 * k2[3] + 2 * k3[3] + k4[3])
  ];
};

const DoublePendulumChaos = () => {
  const canvasRef = useRef(null);
  const audioCtxRef = useRef(null);

  // Parameter states
  const [activePreset, setActivePreset] = useState('ButterflyEffect');
  const [gravity, setGravity] = useState(9.81);
  const [damping, setDamping] = useState(0.0002);
  const [pendulumCount, setPendulumCount] = useState(15);
  const [m1, setM1] = useState(15);
  const [m2, setM2] = useState(15);
  const [l1, setL1] = useState(120);
  const [l2, setL2] = useState(120);
  const [trailLength, setTrailLength] = useState(350);
  const [selectedPalette, setSelectedPalette] = useState('NeonRave');
  
  // Audio state
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [soundType, setSoundType] = useState('Ambient Bell');

  // Playback state
  const [isPaused, setIsPaused] = useState(false);
  const [stats, setStats] = useState({ fps: 60, totalEnergy: 0 });

  // Starting position (for primary pendulum, rest will deviate from this)
  const [theta1Start, setTheta1Start] = useState(2.3);
  const [theta2Start, setTheta2Start] = useState(2.0);

  // Simulation engine mutable reference
  const engineRef = useRef({
    pendulums: [],
    isDragging: false,
    dragBob: null, // 1 or 2
    fpsList: []
  });

  const resetPendulums = useCallback(() => {
    const engine = engineRef.current;
    const baseColors = PALETTES[selectedPalette];
    
    // Find preset deviation or fallback
    const presetDev = PRESETS[activePreset] ? PRESETS[activePreset].deviation : 0.0001;

    engine.pendulums = Array.from({ length: pendulumCount }, (_, i) => {
      // Small angular deviations from the starting values
      const t1 = theta1Start + i * presetDev;
      const t2 = theta2Start + i * presetDev;
      
      return {
        id: i,
        // State: [theta1, omega1, theta2, omega2]
        state: [t1, 0, t2, 0],
        prevX2: 0,
        lastCrossTime: 0,
        trail: [],
        color: baseColors[i % baseColors.length]
      };
    });
  }, [pendulumCount, theta1Start, theta2Start, selectedPalette, activePreset]);

  // Reinitialize pendulums when base parameters or count change
  useEffect(() => {
    resetPendulums();
  }, [resetPendulums]);

  const loadPreset = (key) => {
    const preset = PRESETS[key];
    if (!preset) return;

    setActivePreset(key);
    setGravity(preset.gravity);
    setDamping(preset.damping);
    setPendulumCount(preset.count);
    setM1(preset.m1);
    setM2(preset.m2);
    setL1(preset.l1);
    setL2(preset.l2);
    setTheta1Start(preset.theta1Start);
    setTheta2Start(preset.theta2Start);
  };

  // Play spatial sound synthesizer note
  const playTone = (frequency, type, gainValue) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.frequency.setValueAtTime(frequency, ctx.currentTime);

      if (type === 'Ambient Bell') {
        osc.type = 'sine';
        gainNode.gain.setValueAtTime(gainValue * 0.8, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);

        // Subtly add a metal ring harmonic
        const harmonic = ctx.createOscillator();
        const harmonicGain = ctx.createGain();
        harmonic.type = 'sine';
        harmonic.frequency.setValueAtTime(frequency * 2.5, ctx.currentTime);
        harmonic.connect(harmonicGain);
        harmonicGain.connect(ctx.destination);
        harmonicGain.gain.setValueAtTime(gainValue * 0.25, ctx.currentTime);
        harmonicGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);

        harmonic.start();
        harmonic.stop(ctx.currentTime + 0.5);

        osc.start();
        osc.stop(ctx.currentTime + 1.2);
      } else if (type === 'Marimba Pluck') {
        osc.type = 'triangle';
        gainNode.gain.setValueAtTime(gainValue * 1.5, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);

        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'Retro Synth') {
        osc.type = 'sawtooth';
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(500, ctx.currentTime);
        filter.Q.setValueAtTime(5, ctx.currentTime);

        osc.disconnect(gainNode);
        osc.connect(filter);
        filter.connect(gainNode);

        gainNode.gain.setValueAtTime(gainValue * 0.4, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.7);

        osc.start();
        osc.stop(ctx.currentTime + 0.7);
      }
    } catch (err) {
      console.warn("Audio Context failed:", err);
    }
  };

  // Physics solved outside of component to avoid recreation and hook warnings

  // Main animation and physics cycle loop
  useEffect(() => {
    let animationId;
    let lastTime = performance.now();

    const loop = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const cx = canvas.width / 2;
      const cy = 180;

      // Handle framerate calculations
      const now = performance.now();
      const delta = now - lastTime;
      lastTime = now;
      const fps = Math.round(1000 / (delta || 1));
      
      const engine = engineRef.current;
      engine.fpsList.push(fps);
      if (engine.fpsList.length > 40) engine.fpsList.shift();

      const avgFps = Math.round(engine.fpsList.reduce((a, b) => a + b, 0) / (engine.fpsList.length || 1));

      // 1. Solve physics if not paused
      if (!isPaused && !engine.isDragging) {
        const physicsParams = { g: gravity, m1, m2, l1, l2, damp: damping };
        
        // Multi-substepping (3 steps per frame) for RK4 stability
        const SUB_STEPS = 3;
        const dt = 0.015;

        // Base note volume limit based on count
        const baseGain = Math.max(0.01, Math.min(0.08, 0.45 / pendulumCount));

        engine.pendulums.forEach((p) => {
          for (let step = 0; step < SUB_STEPS; step++) {
            p.state = rk4Step(p.state, physicsParams, dt);
          }

          // Calculate current coordinates of Bob 2 (bottom tip)
          const [t1, , t2, ] = p.state;
          const x1 = l1 * Math.sin(t1);
          const x2 = x1 + l2 * Math.sin(t2);
          const y1 = l1 * Math.cos(t1);
          const y2 = y1 + l2 * Math.cos(t2);

          // Add to trail
          p.trail.push({ x: cx + x2, y: cy + y2 });
          if (p.trail.length > trailLength) {
            p.trail.shift();
          }

          // Center-line crossing audio trigger
          const crossed = (p.prevX2 < 0 && x2 >= 0) || (p.prevX2 > 0 && x2 <= 0);
          p.prevX2 = x2;

          if (crossed && soundEnabled) {
            const timeSinceLast = now - p.lastCrossTime;
            if (timeSinceLast > 120) { // Cooldown gate to prevent screeching
              p.lastCrossTime = now;
              // Map index to a pentatonic scale frequency
              const freq = PENTATONIC_SCALE[(p.id) % PENTATONIC_SCALE.length];
              playTone(freq, soundType, baseGain);
            }
          }
        });
      }

      // Calculate total system energy of first pendulum for stats display
      let kineticPlusPotential = 0;
      if (engine.pendulums.length > 0) {
        const [t1, w1, t2, w2] = engine.pendulums[0].state;
        // Kinetic Energy
        const ke = 0.5 * m1 * (l1 * w1) ** 2 + 0.5 * m2 * ((l1 * w1) ** 2 + (l2 * w2) ** 2 + 2 * l1 * l2 * w1 * w2 * Math.cos(t1 - t2));
        // Potential Energy (ref: pivot level)
        const pe = -(m1 + m2) * gravity * l1 * Math.cos(t1) - m2 * gravity * l2 * Math.cos(t2);
        kineticPlusPotential = Math.round(ke + pe);
      }

      // 2. RENDER THE SCENE
      // Clear with dark fading transparency for natural neon glow smudge
      ctx.fillStyle = 'rgba(8, 7, 16, 1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render vector/grid background design
      ctx.strokeStyle = 'rgba(255,255,255,0.015)';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 30) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let j = 0; j < canvas.height; j += 30) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(canvas.width, j);
        ctx.stroke();
      }

      // Render vertical midline marker
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, canvas.height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw trails first so they stay in the background
      engine.pendulums.forEach((p) => {
        if (p.trail.length < 2) return;
        ctx.save();
        ctx.shadowBlur = 6;
        ctx.shadowColor = p.color;
        ctx.strokeStyle = p.color;
        
        ctx.beginPath();
        ctx.moveTo(p.trail[0].x, p.trail[0].y);
        for (let idx = 1; idx < p.trail.length; idx++) {
          ctx.lineTo(p.trail[idx].x, p.trail[idx].y);
        }
        
        // Draw with fading opacity over trail length
        ctx.globalAlpha = 0.45;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      });

      // Draw rods and bobs
      engine.pendulums.forEach((p, idx) => {
        const [t1, , t2, ] = p.state;
        const x1 = cx + l1 * Math.sin(t1);
        const y1 = cy + l1 * Math.cos(t1);
        const x2 = x1 + l2 * Math.sin(t2);
        const y2 = y1 + l2 * Math.cos(t2);

        const isPrimary = idx === 0;

        ctx.save();
        // Render rod paths with dynamic opacity (primary is brighter, secondary/derived are faint lines)
        ctx.strokeStyle = isPrimary ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = isPrimary ? 3 : 1;
        
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // Render bob circles
        // Bob 1 (middle connector)
        ctx.fillStyle = isPrimary ? '#e2e8f0' : 'rgba(226, 232, 240, 0.15)';
        ctx.beginPath();
        ctx.arc(x1, y1, isPrimary ? 7 + m1 * 0.15 : 4, 0, Math.PI * 2);
        ctx.fill();

        // Bob 2 (bottom tip)
        ctx.fillStyle = p.color;
        ctx.globalAlpha = isPrimary ? 1 : 0.6;
        ctx.shadowBlur = isPrimary ? 12 : 5;
        ctx.shadowColor = p.color;

        ctx.beginPath();
        ctx.arc(x2, y2, isPrimary ? 9 + m2 * 0.15 : 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Render center pivot anchor
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fill();

      // Update statistics
      setStats({
        fps: avgFps,
        totalEnergy: kineticPlusPotential
      });

      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationId);
  }, [isPaused, gravity, damping, pendulumCount, m1, m2, l1, l2, trailLength, soundEnabled, soundType]);

  // Handle Dragging physics bobs to adjust start angles
  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const cx = canvas.width / 2;
    const cy = 180;

    // Check click coordinates relative to primary pendulum
    // Calculate primary positions
    const x1 = cx + l1 * Math.sin(theta1Start);
    const y1 = cy + l1 * Math.cos(theta1Start);
    const x2 = x1 + l2 * Math.sin(theta2Start);
    const y2 = y1 + l2 * Math.cos(theta2Start);

    const distBob1 = Math.hypot(mx - x1, my - y1);
    const distBob2 = Math.hypot(mx - x2, my - y2);

    const engine = engineRef.current;

    if (distBob1 < 25) {
      engine.isDragging = true;
      engine.dragBob = 1;
      setIsPaused(true);
    } else if (distBob2 < 25) {
      engine.isDragging = true;
      engine.dragBob = 2;
      setIsPaused(true);
    }
  };

  const handleMouseMove = (e) => {
    const engine = engineRef.current;
    if (!engine.isDragging) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const cx = canvas.width / 2;
    const cy = 180;

    if (engine.dragBob === 1) {
      // Calculate theta1 start angle relative to pivot
      const angle = Math.atan2(mx - cx, my - cy);
      setTheta1Start(angle);
    } else if (engine.dragBob === 2) {
      // Calculate theta2 start angle relative to bob 1
      const x1 = cx + l1 * Math.sin(theta1Start);
      const y1 = cy + l1 * Math.cos(theta1Start);
      const angle = Math.atan2(mx - x1, my - y1);
      setTheta2Start(angle);
    }
  };

  const handleMouseUp = () => {
    const engine = engineRef.current;
    if (engine.isDragging) {
      engine.isDragging = false;
      engine.dragBob = null;
      setIsPaused(false);
      resetPendulums();
    }
  };

  const clearTrails = () => {
    engineRef.current.pendulums.forEach(p => { p.trail = []; });
  };

  const superKick = () => {
    // Inject a boost of angular velocity to simulate external impulse
    engineRef.current.pendulums.forEach(p => {
      p.state[1] += (Math.random() - 0.5) * 5; // boost omega1
      p.state[3] += (Math.random() - 0.5) * 5; // boost omega2
    });
  };

  return (
    <div className="flex justify-center items-center min-h-[850px] p-6 bg-[#080710] rounded-[3rem] m-5 shadow-2xl relative overflow-hidden group font-sans border border-white/5">
      {/* Blurred cosmic glowing background drops */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[55%] h-[55%] bg-fuchsia-600/10 blur-[130px] rounded-full animate-pulse duration-[6000ms]"></div>
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-cyan-600/10 blur-[130px] rounded-full animate-pulse duration-[4000ms]"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full max-w-7xl relative z-10">
        
        {/* SIDEBAR CONTROL CENTER */}
        <div className="lg:col-span-4 bg-white/[0.02] backdrop-blur-3xl p-6 rounded-[2.5rem] border border-white/10 shadow-2xl space-y-6 max-h-[750px] overflow-y-auto custom-scrollbar">
          <header>
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-pink-400 to-cyan-400 mb-1 tracking-tight">
              Chaos Pendulum
            </h2>
            <p className="text-gray-400 font-medium text-xs leading-relaxed">
              Explore chaos theory, the butterfly effect, and generative spatial music.
            </p>
          </header>

          {/* PRESETS CONTAINER */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">Cosmic Presets</span>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(PRESETS).map((key) => (
                <button
                  key={key}
                  onClick={() => loadPreset(key)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border text-left truncate cursor-pointer ${
                    activePreset === key
                      ? 'bg-fuchsia-500/10 border-fuchsia-500/35 text-fuchsia-300'
                      : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  {PRESETS[key].name}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-gray-500 italic mt-1 leading-relaxed">
              {PRESETS[activePreset]?.description}
            </p>
          </div>

          {/* AUDIO SYNTH CONTROLS */}
          <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/5 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">Harmonic Sound</span>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`px-3 py-1 rounded-full text-[10px] font-black cursor-pointer transition-all ${
                  soundEnabled 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-white/5 text-white/40 border border-transparent'
                }`}
              >
                {soundEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
            {soundEnabled && (
              <div className="grid grid-cols-3 gap-1 pt-1">
                {['Ambient Bell', 'Marimba Pluck', 'Retro Synth'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setSoundType(t)}
                    className={`py-1.5 rounded-lg text-[9px] font-bold border transition-all cursor-pointer truncate ${
                      soundType === t 
                        ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' 
                        : 'bg-transparent border-transparent text-white/40 hover:text-white/60'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
            <p className="text-[9px] text-gray-500 leading-tight">
              A harmonic note triggers as the bobs sweep past the centerline.
            </p>
          </div>

          {/* PHYSICS SLIDERS */}
          <div className="space-y-4 pt-2">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">System Variables</span>
            
            {/* Pendulum count */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-white/50">
                <span>Pendulum Count</span>
                <span className="font-mono">{pendulumCount}</span>
              </div>
              <input
                type="range" min="1" max="50" step="1"
                value={pendulumCount}
                onChange={(e) => setPendulumCount(parseInt(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-fuchsia-500"
              />
            </div>

            {/* Gravity */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-white/50">
                <span>Gravity Strength</span>
                <span className="font-mono">{gravity.toFixed(2)} m/s²</span>
              </div>
              <input
                type="range" min="0" max="30" step="0.1"
                value={gravity}
                onChange={(e) => setGravity(parseFloat(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-fuchsia-500"
              />
            </div>

            {/* Damping */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-white/50">
                <span>Friction (Damping)</span>
                <span className="font-mono">{(damping * 1000).toFixed(1)}x10⁻³</span>
              </div>
              <input
                type="range" min="0" max="0.01" step="0.0001"
                value={damping}
                onChange={(e) => setDamping(parseFloat(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-fuchsia-500"
              />
            </div>

            {/* Rod lengths */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-white/50">
                  <span>Rod 1 L</span>
                  <span className="font-mono">{l1}px</span>
                </div>
                <input
                  type="range" min="50" max="180" step="1"
                  value={l1}
                  onChange={(e) => setL1(parseInt(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-fuchsia-500"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-white/50">
                  <span>Rod 2 L</span>
                  <span className="font-mono">{l2}px</span>
                </div>
                <input
                  type="range" min="50" max="180" step="1"
                  value={l2}
                  onChange={(e) => setL2(parseInt(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-fuchsia-500"
                />
              </div>
            </div>

            {/* Bob Masses */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-white/50">
                  <span>Mass 1</span>
                  <span className="font-mono">{m1}kg</span>
                </div>
                <input
                  type="range" min="1" max="50" step="1"
                  value={m1}
                  onChange={(e) => setM1(parseInt(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-fuchsia-500"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-white/50">
                  <span>Mass 2</span>
                  <span className="font-mono">{m2}kg</span>
                </div>
                <input
                  type="range" min="1" max="50" step="1"
                  value={m2}
                  onChange={(e) => setM2(parseInt(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-fuchsia-500"
                />
              </div>
            </div>

            {/* Trail size */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-white/50">
                <span>Vector Trail Size</span>
                <span className="font-mono">{trailLength} steps</span>
              </div>
              <input
                type="range" min="10" max="800" step="10"
                value={trailLength}
                onChange={(e) => setTrailLength(parseInt(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-fuchsia-500"
              />
            </div>
          </div>

          {/* COLOR THEME SELECTOR */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">Aesthetic Hue</span>
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(PALETTES).map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedPalette(p)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                    selectedPalette === p
                      ? 'bg-white/10 border-white/20 text-white shadow-md'
                      : 'bg-transparent border-transparent text-white/40 hover:text-white/60'
                  }`}
                >
                  {p.replace(/([A-Z])/g, ' $1').trim()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CANVAS INTERACTIVE PLAYGROUND */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="relative bg-black/60 rounded-[2.5rem] border border-white/5 overflow-hidden flex-1 min-h-[460px] flex items-center justify-center group shadow-inner">
            
            {/* Visual Stats HUD overlay */}
            <div className="absolute top-4 left-6 flex gap-6 text-[10px] font-bold tracking-wider text-white/40 pointer-events-none select-none">
              <div>FPS: <span className="font-mono text-white/70">{stats.fps}</span></div>
              <div>PENDULUMS: <span className="font-mono text-white/70">{pendulumCount}</span></div>
              <div>SYSTEM E: <span className="font-mono text-white/70">{stats.totalEnergy} J</span></div>
            </div>

            <div className="absolute top-4 right-6 text-[9px] font-bold text-fuchsia-400 bg-fuchsia-500/10 px-2 py-0.5 rounded border border-fuchsia-500/20 pointer-events-none select-none">
              PHYSICS ENGINE: RK4 (180Hz)
            </div>

            <canvas
              ref={canvasRef}
              width={750}
              height={520}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="w-full h-full max-h-[520px] bg-[#080710] block cursor-grab active:cursor-grabbing rounded-[2.5rem]"
            />

            {/* Instruction tooltip overlay */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-gray-500 pointer-events-none select-none italic text-center">
              Tip: Click & drag bobs of the primary (brightest) pendulum to set starting angle.
            </div>
          </div>

          {/* DASHBOARD ACTION BUTTONS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/[0.02] p-3 rounded-[2rem] border border-white/5">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="py-3 px-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-xs font-bold transition-all border border-white/5 cursor-pointer text-center flex items-center justify-center gap-2"
            >
              <span>{isPaused ? '▶ Play Simulation' : '⏸ Pause Simulation'}</span>
            </button>
            <button
              onClick={resetPendulums}
              className="py-3 px-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-xs font-bold transition-all border border-white/5 cursor-pointer text-center flex items-center justify-center gap-2"
            >
              <span>🔄 Reset State</span>
            </button>
            <button
              onClick={clearTrails}
              className="py-3 px-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-xs font-bold transition-all border border-white/5 cursor-pointer text-center flex items-center justify-center gap-2"
            >
              <span>🧹 Wipe Trails</span>
            </button>
            <button
              onClick={superKick}
              className="py-3 px-4 bg-gradient-to-r from-fuchsia-500 to-cyan-500 hover:opacity-90 text-white rounded-2xl text-xs font-black transition-all shadow-md shadow-fuchsia-500/10 cursor-pointer text-center flex items-center justify-center gap-2"
            >
              <span>⚡ Chaos Pulse</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DoublePendulumChaos;
