import React, { useState, useEffect, useRef, useCallback } from 'react';

// Visual Theme Presets
const THEMES = {
  cyber: {
    id: 'cyber',
    name: 'Cyber Neon',
    bg: 'from-slate-950 via-indigo-950 to-slate-900',
    canvasBg: '#050714',
    colorsG1: ['#00f3ff', '#38bdf8', '#818cf8', '#ffffff'],
    colorsG2: ['#ff007f', '#ec4899', '#f472b6', '#ffffff'],
    colorsG3: ['#a855f7', '#c084fc', '#e879f9', '#ffffff'],
    coreG1: '#00f3ff',
    coreG2: '#ff007f',
    coreG3: '#a855f7',
    glow: 'rgba(0, 243, 255, 0.8)',
    accentText: 'text-cyan-400',
    accentBorder: 'border-cyan-500/40',
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    buttonBg: 'bg-cyan-600 hover:bg-cyan-500 text-white',
  },
  aurora: {
    id: 'aurora',
    name: 'Deep Space Aurora',
    bg: 'from-emerald-950 via-slate-950 to-teal-950',
    canvasBg: '#03120e',
    colorsG1: ['#00ffaa', '#34d399', '#6ee7b7', '#ffffff'],
    colorsG2: ['#06b6d4', '#22d3ee', '#67e8f9', '#ffffff'],
    colorsG3: ['#a7f3d0', '#10b981', '#059669', '#ffffff'],
    coreG1: '#00ffaa',
    coreG2: '#06b6d4',
    coreG3: '#a7f3d0',
    glow: 'rgba(0, 255, 170, 0.8)',
    accentText: 'text-emerald-400',
    accentBorder: 'border-emerald-500/40',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    buttonBg: 'bg-emerald-600 hover:bg-emerald-500 text-white',
  },
  solar: {
    id: 'solar',
    name: 'Solar Core Ignition',
    bg: 'from-amber-950 via-red-950 to-slate-950',
    canvasBg: '#140603',
    colorsG1: ['#ff4500', '#f97316', '#fb923c', '#ffffff'],
    colorsG2: ['#eab308', '#facc15', '#fef08a', '#ffffff'],
    colorsG3: ['#ef4444', '#f87171', '#fca5a5', '#ffffff'],
    coreG1: '#ff4500',
    coreG2: '#facc15',
    coreG3: '#ef4444',
    glow: 'rgba(255, 170, 0, 0.8)',
    accentText: 'text-amber-400',
    accentBorder: 'border-amber-500/40',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    buttonBg: 'bg-amber-600 hover:bg-amber-500 text-white',
  },
  prismatic: {
    id: 'prismatic',
    name: 'Prismatic Void',
    bg: 'from-purple-950 via-slate-950 to-pink-950',
    canvasBg: '#09040e',
    colorsG1: ['#ff0055', '#ff5599', '#ff99cc', '#ffffff'],
    colorsG2: ['#00ffcc', '#55ffdd', '#99ffee', '#ffffff'],
    colorsG3: ['#9900ff', '#bb55ff', '#dd99ff', '#ffffff'],
    coreG1: '#ff0055',
    coreG2: '#00ffcc',
    coreG3: '#9900ff',
    glow: 'rgba(255, 0, 255, 0.8)',
    accentText: 'text-pink-400',
    accentBorder: 'border-pink-500/40',
    badge: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
    buttonBg: 'bg-pink-600 hover:bg-pink-500 text-white',
  },
  monochrome: {
    id: 'monochrome',
    name: 'Ghost Void',
    bg: 'from-slate-950 via-slate-900 to-black',
    canvasBg: '#08080a',
    colorsG1: ['#e2e8f0', '#cbd5e1', '#94a3b8', '#ffffff'],
    colorsG2: ['#38bdf8', '#7dd3fc', '#bae6fd', '#ffffff'],
    colorsG3: ['#f1f5f9', '#e2e8f0', '#cbd5e1', '#ffffff'],
    coreG1: '#ffffff',
    coreG2: '#7dd3fc',
    coreG3: '#cbd5e1',
    glow: 'rgba(255, 255, 255, 0.8)',
    accentText: 'text-slate-300',
    accentBorder: 'border-slate-500/40',
    badge: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
    buttonBg: 'bg-slate-600 hover:bg-slate-500 text-white',
  },
};

// Preset Scenarios
const PRESETS = {
  andromeda: {
    id: 'andromeda',
    name: 'Milky Way vs Andromeda',
    desc: 'Classic spiral galaxy collision with stable initial orbital inclination and tidal distortion.',
    particleCount: 1600,
    gravity: 1.8,
    darkMatter: 1.2,
    damping: 0,
    timeSpeed: 1.0,
    cores: [
      { id: 0, relX: 0.28, relY: 0.38, vx: 0.85, vy: 0.45, mass: 12000, arms: 4, radius: 170 },
      { id: 1, relX: 0.72, relY: 0.62, vx: -0.85, vy: -0.45, mass: 10000, arms: 3, radius: 150 },
    ],
  },
  headon: {
    id: 'headon',
    name: 'Direct Head-On Crash',
    desc: 'Maximum central impact velocity causing energetic starburst flashes and orbital scatter.',
    particleCount: 2000,
    gravity: 2.2,
    darkMatter: 1.5,
    damping: 0.0001,
    timeSpeed: 1.2,
    cores: [
      { id: 0, relX: 0.2, relY: 0.5, vx: 1.6, vy: 0.05, mass: 14000, arms: 5, radius: 180 },
      { id: 1, relX: 0.8, relY: 0.5, vx: -1.6, vy: -0.05, mass: 14000, arms: 5, radius: 180 },
    ],
  },
  slingshot: {
    id: 'slingshot',
    name: 'Hypervelocity Slingshot',
    desc: 'Grazing pass with high relative speed, stretching stars into dramatic long tidal tails.',
    particleCount: 1400,
    gravity: 1.5,
    darkMatter: 1.0,
    damping: 0,
    timeSpeed: 1.1,
    cores: [
      { id: 0, relX: 0.25, relY: 0.25, vx: 1.4, vy: 0.35, mass: 15000, arms: 2, radius: 160 },
      { id: 1, relX: 0.75, relY: 0.75, vx: -1.4, vy: -0.35, mass: 8000, arms: 4, radius: 140 },
    ],
  },
  triple: {
    id: 'triple',
    name: 'Triple Galaxy Cluster',
    desc: 'Three galactic cores dancing in chaotic 3-body gravitational resonance.',
    particleCount: 1800,
    gravity: 1.9,
    darkMatter: 1.4,
    damping: 0.00005,
    timeSpeed: 1.0,
    cores: [
      { id: 0, relX: 0.5, relY: 0.25, vx: 0.9, vy: 0.2, mass: 11000, arms: 3, radius: 140 },
      { id: 1, relX: 0.25, relY: 0.72, vx: -0.4, vy: -0.85, mass: 9000, arms: 3, radius: 130 },
      { id: 2, relX: 0.75, relY: 0.72, vx: -0.5, vy: 0.65, mass: 10000, arms: 3, radius: 135 },
    ],
  },
  ring: {
    id: 'ring',
    name: 'Ring Galaxy Capture',
    desc: 'Small dense galaxy plunging perpendicularly through a large spiral disc, triggering an expanding star ring.',
    particleCount: 1700,
    gravity: 2.0,
    darkMatter: 1.3,
    damping: 0,
    timeSpeed: 0.9,
    cores: [
      { id: 0, relX: 0.5, relY: 0.5, vx: 0.1, vy: 0.05, mass: 18000, arms: 4, radius: 210 },
      { id: 1, relX: 0.5, relY: 0.12, vx: -0.15, vy: 1.8, mass: 6000, arms: 2, radius: 90 },
    ],
  },
};

const GalaxyCollisionStudio = () => {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const particlesRef = useRef([]);
  const coresRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0, isDown: false, isInside: false });
  const fpsRef = useRef({ count: 0, lastTime: performance.now(), fps: 60 });
  const statsRef = useRef({ kineticE: 0, tidalIndex: 0, relVelocity: 0 });

  // Web Audio Synth
  const audioCtxRef = useRef(null);
  const droneOscRef = useRef(null);
  const droneGainRef = useRef(null);
  const filterRef = useRef(null);

  // Component Controls State
  const [themeKey, setThemeKey] = useState('cyber');
  const [presetKey, setPresetKey] = useState('andromeda');
  const [particleCount, setParticleCount] = useState(1600);
  const [gravityG, setGravityG] = useState(1.8);
  const [darkMatter, setDarkMatter] = useState(1.2);
  const [timeSpeed, setTimeSpeed] = useState(1.0);
  const [trailFade, setTrailFade] = useState(0.22);
  const [mouseMode, setMouseMode] = useState('singularity'); // singularity, repulsion, spawner
  const [mouseForce, setMouseForce] = useState(4.0);
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showHUD, setShowHUD] = useState(true);

  // Dynamic Telemetry State
  const [currentFps, setCurrentFps] = useState(60);
  const [telemetry, setTelemetry] = useState({
    particleCount: 1600,
    kineticE: 0,
    tidalIndex: 0,
    relVelocity: 0,
  });

  const theme = THEMES[themeKey] || THEMES.cyber;

  // Web Audio Initializer
  const toggleSound = () => {
    if (!soundEnabled) {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(55, ctx.currentTime); // Deep A1 note

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(220, ctx.currentTime);

        gain.gain.setValueAtTime(0.04, ctx.currentTime);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start();

        droneOscRef.current = osc;
        droneGainRef.current = gain;
        filterRef.current = filter;

        setSoundEnabled(true);
      } catch (e) {
        console.error('Audio Context initialization failed', e);
      }
    } else {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      setSoundEnabled(false);
    }
  };

  // Play starburst chime tone
  const triggerStarburstAudio = useCallback((freq) => {
    if (!soundEnabled || !audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.65);
    } catch (e) {
      // Audio error catch
    }
  }, [soundEnabled]);

  // Generate galaxies and particles
  const initSimulation = useCallback((presetName, count, currentThemeKey) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.width;
    const height = canvas.height;
    const currentPreset = PRESETS[presetName] || PRESETS.andromeda;
    const th = THEMES[currentThemeKey] || THEMES.cyber;

    // Build Galaxy Cores
    const newCores = currentPreset.cores.map((c) => ({
      id: c.id,
      x: width * c.relX,
      y: height * c.relY,
      vx: c.vx,
      vy: c.vy,
      mass: c.mass,
      radius: Math.max(12, Math.min(24, c.mass / 750)),
      color: c.id === 0 ? th.coreG1 : c.id === 1 ? th.coreG2 : th.coreG3,
    }));

    coresRef.current = newCores;

    // Distribute particle count among galaxies proportionally by core mass
    const totalCoreMass = currentPreset.cores.reduce((acc, c) => acc + c.mass, 0);
    const newParticles = [];

    currentPreset.cores.forEach((coreDef, coreIdx) => {
      const core = newCores[coreIdx];
      const galaxyParticleCount = Math.floor((coreDef.mass / totalCoreMass) * count);
      const armCount = coreDef.arms;
      const maxRadius = coreDef.radius;
      const palette = coreIdx === 0 ? th.colorsG1 : coreIdx === 1 ? th.colorsG2 : th.colorsG3;

      for (let i = 0; i < galaxyParticleCount; i++) {
        // Logarithmic spiral distribution
        const rRatio = Math.pow(Math.random(), 1.5);
        const distance = 15 + rRatio * maxRadius;
        const armAngle = ((i % armCount) * (2 * Math.PI)) / armCount;
        const spiralOffset = rRatio * Math.PI * 3;
        const angle = armAngle + spiralOffset + (Math.random() - 0.5) * 0.35;

        const posX = core.x + Math.cos(angle) * distance;
        const posY = core.y + Math.sin(angle) * distance;

        // Keplarian orbital velocity around galactic core: v = sqrt(G * M / r)
        const orbSpeed = Math.sqrt((PRESETS[presetName].gravity * 1.5 * core.mass) / Math.max(distance, 20));
        // Tangential velocity vector plus galaxy drift velocity
        const tangentX = -Math.sin(angle) * orbSpeed + core.vx;
        const tangentY = Math.cos(angle) * orbSpeed + core.vy;

        newParticles.push({
          x: posX,
          y: posY,
          vx: tangentX + (Math.random() - 0.5) * 0.2,
          vy: tangentY + (Math.random() - 0.5) * 0.2,
          galaxyId: coreIdx,
          size: Math.random() * 1.8 + 1.1,
          color: palette[Math.floor(Math.random() * palette.length)],
          burst: 0,
          trail: [],
        });
      }
    });

    particlesRef.current = newParticles;
  }, []);

  // Handle Resize Setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      initSimulation(presetKey, particleCount, themeKey);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [initSimulation, presetKey, particleCount, themeKey]);

  // Main Physics & Render Loop
  useEffect(() => {
    let lastTime = performance.now();

    const render = (currentTime) => {
      animFrameRef.current = requestAnimationFrame(render);

      if (isPaused) return;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;

      // Calculate FPS
      const dt = currentTime - lastTime;
      lastTime = currentTime;

      fpsRef.current.count++;
      if (currentTime - fpsRef.current.lastTime >= 500) {
        const calculatedFps = Math.round((fpsRef.current.count * 1000) / (currentTime - fpsRef.current.lastTime));
        setCurrentFps(calculatedFps);
        fpsRef.current.count = 0;
        fpsRef.current.lastTime = currentTime;

        // Update telemetry stats UI
        setTelemetry({
          particleCount: particlesRef.current.length,
          kineticE: Math.round(statsRef.current.kineticE),
          tidalIndex: (statsRef.current.tidalIndex / 100).toFixed(2),
          relVelocity: statsRef.current.relVelocity.toFixed(2),
        });
      }

      // 1. Semi-transparent canvas background wipe for orbital motion trails
      ctx.fillStyle = theme.canvasBg;
      ctx.globalAlpha = trailFade;
      ctx.fillRect(0, 0, width, height);
      ctx.globalAlpha = 1.0;

      const cores = coresRef.current;
      const particles = particlesRef.current;
      const dtSim = 0.4 * timeSpeed;
      const G = gravityG * 0.05;
      const dmHalo = darkMatter;

      // 2. Gravitational forces between galaxy cores (N-body core mutual dynamics)
      for (let i = 0; i < cores.length; i++) {
        for (let j = i + 1; j < cores.length; j++) {
          const c1 = cores[i];
          const c2 = cores[j];
          const dx = c2.x - c1.x;
          const dy = c2.y - c1.y;
          const distSq = dx * dx + dy * dy + 1600; // Softened distance epsilon
          const dist = Math.sqrt(distSq);

          const force = (G * c1.mass * c2.mass) / distSq;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          c1.vx += (fx / c1.mass) * dtSim;
          c1.vy += (fy / c1.mass) * dtSim;
          c2.vx -= (fx / c2.mass) * dtSim;
          c2.vy -= (fy / c2.mass) * dtSim;

          // Record relative core velocity for telemetry
          statsRef.current.relVelocity = Math.sqrt(
            (c1.vx - c2.vx) * (c1.vx - c2.vx) + (c1.vy - c2.vy) * (c1.vy - c2.vy)
          );
        }
      }

      // Update galaxy core positions
      cores.forEach((core) => {
        core.x += core.vx * dtSim;
        core.y += core.vy * dtSim;

        // Soft bounce off canvas boundary
        if (core.x < 50) { core.x = 50; core.vx *= -0.8; }
        if (core.x > width - 50) { core.x = width - 50; core.vx *= -0.8; }
        if (core.y < 50) { core.y = 50; core.vy *= -0.8; }
        if (core.y > height - 50) { core.y = height - 50; core.vy *= -0.8; }
      });

      // Mouse Force Field Calculations
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const mouseActive = mouseRef.current.isInside;

      if (mouseActive && mouseRef.current.isDown && mouseMode === 'spawner') {
        // Spawn streaming new stars under mouse cursor
        for (let s = 0; s < 3; s++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 3 + 1;
          particles.push({
            x: mx,
            y: my,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            galaxyId: 0,
            size: Math.random() * 2 + 1.2,
            color: theme.colorsG1[Math.floor(Math.random() * theme.colorsG1.length)],
            burst: 1.0,
            trail: [],
          });
        }
      }

      let totalKineticE = 0;
      let totalTidalDisruption = 0;
      let starburstCount = 0;

      // 3. Stellar particle physics updates
      for (let pIdx = 0; pIdx < particles.length; pIdx++) {
        const p = particles[pIdx];

        let ax = 0;
        let ay = 0;

        // Sum gravity from all Supermassive Black Holes
        cores.forEach((core) => {
          const dx = core.x - p.x;
          const dy = core.y - p.y;
          const distSq = dx * dx + dy * dy + 450; // Softened distance
          const dist = Math.sqrt(distSq);

          // Newtonian + Dark Matter Halo acceleration
          const haloAccel = dmHalo * 0.0008 * dist;
          const coreAccel = (G * core.mass) / distSq + haloAccel;

          ax += (dx / dist) * coreAccel;
          ay += (dy / dist) * coreAccel;

          // Tidal disruption metric: high force gradients between competing cores
          totalTidalDisruption += coreAccel / (dist + 10);
        });

        // Mouse interaction force
        if (mouseActive && mouseRef.current.isDown) {
          const mdx = mx - p.x;
          const mdy = my - p.y;
          const mDistSq = mdx * mdx + mdy * mdy + 400;
          const mDist = Math.sqrt(mDistSq);

          if (mDist < 300) {
            const mForce = (mouseForce * 180) / mDistSq;
            if (mouseMode === 'singularity') {
              ax += (mdx / mDist) * mForce;
              ay += (mdy / mDist) * mForce;
            } else if (mouseMode === 'repulsion') {
              ax -= (mdx / mDist) * mForce * 1.5;
              ay -= (mdy / mDist) * mForce * 1.5;
            }
          }
        }

        // Velocity integration
        p.vx += ax * dtSim;
        p.vy += ay * dtSim;

        // Position integration
        p.x += p.vx * dtSim;
        p.y += p.vy * dtSim;

        // Kinetic Energy calculation sum
        const vSq = p.vx * p.vx + p.vy * p.vy;
        totalKineticE += 0.5 * vSq;

        // High velocity close encounters trigger starburst glows
        if (vSq > 35 && Math.random() < 0.005) {
          p.burst = 1.0;
          starburstCount++;
        } else if (p.burst > 0) {
          p.burst -= 0.05;
        }

        // Store position history for particle trails
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 4) p.trail.shift();

        // Render Particle
        ctx.beginPath();
        if (p.burst > 0.1) {
          ctx.fillStyle = '#ffffff';
          ctx.arc(p.x, p.y, p.size * (1 + p.burst * 1.5), 0, Math.PI * 2);
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 12;
        } else {
          ctx.fillStyle = p.color;
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.shadowBlur = 0;
        }
        ctx.fill();
      }

      statsRef.current.kineticE = totalKineticE;
      statsRef.current.tidalIndex = totalTidalDisruption;

      // Audio modulation based on kinetic energy and starburst encounters
      if (soundEnabled && droneOscRef.current && filterRef.current) {
        try {
          const ctxAudio = audioCtxRef.current;
          const targetFreq = Math.min(180, 45 + totalKineticE * 0.005);
          filterRef.current.frequency.setTargetAtTime(targetFreq * 2.5, ctxAudio.currentTime, 0.1);
          droneOscRef.current.frequency.setTargetAtTime(targetFreq, ctxAudio.currentTime, 0.1);

          if (starburstCount > 0) {
            triggerStarburstAudio(300 + Math.random() * 600);
          }
        } catch (e) {
          // Audio modulation catch
        }
      }

      // 4. Render Galaxy Core Supermassive Black Holes & Accretion Glows
      cores.forEach((core) => {
        // Outer accretion radial glow
        const glowGradient = ctx.createRadialGradient(core.x, core.y, 2, core.x, core.y, core.radius * 3);
        glowGradient.addColorStop(0, core.color);
        glowGradient.addColorStop(0.4, `${core.color}66`);
        glowGradient.addColorStop(1, 'transparent');

        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(core.x, core.y, core.radius * 3, 0, Math.PI * 2);
        ctx.fill();

        // Inner Black Hole Event Horizon
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(core.x, core.y, core.radius * 0.6, 0, Math.PI * 2);
        ctx.fill();

        // Bright Event Horizon Ring
        ctx.strokeStyle = core.color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(core.x, core.y, core.radius * 0.6, 0, Math.PI * 2);
        ctx.stroke();
      });

      // 5. Render Mouse Cursor Force Indicator
      if (mouseActive) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(mx, my, mouseMode === 'repulsion' ? 60 : 45, 0, Math.PI * 2);
        ctx.strokeStyle = mouseMode === 'repulsion' ? '#ef4444' : mouseMode === 'spawner' ? '#38bdf8' : '#a855f7';
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      }
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPaused, timeSpeed, gravityG, darkMatter, trailFade, mouseMode, mouseForce, theme, soundEnabled, triggerStarburstAudio]);

  // Mouse Input Handlers
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouseRef.current.x = e.clientX - rect.left;
    mouseRef.current.y = e.clientY - rect.top;
  };

  const handleMouseDown = () => {
    mouseRef.current.isDown = true;
  };

  const handleMouseUp = () => {
    mouseRef.current.isDown = false;
  };

  const handleMouseEnter = () => {
    mouseRef.current.isInside = true;
  };

  const handleMouseLeave = () => {
    mouseRef.current.isInside = false;
    mouseRef.current.isDown = false;
  };

  // Download Snapshot Image
  const handleDownloadSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `galaxy-collision-${presetKey}-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Reset current preset simulation
  const handleReset = () => {
    initSimulation(presetKey, particleCount, themeKey);
  };

  // Preset Selection Handler
  const handlePresetSelect = (key) => {
    setPresetKey(key);
    const p = PRESETS[key];
    setParticleCount(p.particleCount);
    setGravityG(p.gravity);
    setDarkMatter(p.darkMatter);
    setTimeSpeed(p.timeSpeed);
    initSimulation(key, p.particleCount, themeKey);
  };

  return (
    <div className={`w-full max-w-7xl mx-auto p-4 sm:p-6 my-8 rounded-3xl bg-gradient-to-br ${theme.bg} border border-slate-800 shadow-2xl text-slate-100 transition-all duration-500`}>
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${theme.badge} backdrop-blur-md`}>
              ASTROPHYSICS SIMULATION
            </span>
            <span className="text-xs text-slate-400 font-mono">N-BODY GRAVITY ENGINE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Galaxy Collision Studio
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Simulate relativistic galactic encounters between spiral galaxies. Observe supermassive black hole dynamics, tidal stripping, starburst flashes, and orbital dispersion.
          </p>
        </div>

        {/* Action Controls Header */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 ${
              isPaused ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            {isPaused ? '▶ Resume' : '⏸ Pause'}
          </button>

          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all shadow-md"
          >
            🔄 Reset
          </button>

          <button
            onClick={toggleSound}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md border ${
              soundEnabled ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {soundEnabled ? '🔊 Sound ON' : '🔇 Sound OFF'}
          </button>

          <button
            onClick={handleDownloadSnapshot}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${theme.buttonBg}`}
          >
            📸 Export PNG
          </button>
        </div>
      </div>

      {/* Preset Selector Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-thin scrollbar-thumb-slate-700">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1 shrink-0">Presets:</span>
        {Object.entries(PRESETS).map(([key, p]) => (
          <button
            key={key}
            onClick={() => handlePresetSelect(key)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
              presetKey === key
                ? `${theme.badge} border-cyan-500 shadow-md font-semibold`
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Main Simulation Viewport Container */}
      <div className="relative w-full h-[460px] sm:h-[540px] rounded-2xl overflow-hidden border border-slate-800/80 shadow-inner bg-black/60 group">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="w-full h-full cursor-crosshair block"
        />

        {/* Live Astrophysical Telemetry HUD Overlay */}
        {showHUD && (
          <div className="absolute top-3 left-3 p-3 rounded-xl bg-slate-950/70 backdrop-blur-md border border-slate-800/80 text-[11px] font-mono text-slate-300 space-y-1 shadow-lg pointer-events-none select-none">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">FRAME RATE:</span>
              <span className={`font-bold ${currentFps > 45 ? 'text-emerald-400' : 'text-amber-400'}`}>{currentFps} FPS</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">STELLAR PARTICLES:</span>
              <span className="font-bold text-cyan-300">{telemetry.particleCount.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">SYSTEM KINETIC E:</span>
              <span className="font-bold text-amber-300">{telemetry.kineticE}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">CORE REL VELOCITY:</span>
              <span className="font-bold text-purple-300">{telemetry.relVelocity} km/s</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">TIDAL DISRUPTION:</span>
              <span className="font-bold text-pink-400">{telemetry.tidalIndex}</span>
            </div>
          </div>
        )}

        {/* Floating Mouse Mode Selection Bar */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-950/80 backdrop-blur-lg border border-slate-800/90 shadow-xl">
          <span className="text-[11px] font-medium text-slate-400 px-2 select-none">Mouse Force:</span>
          <button
            onClick={() => setMouseMode('singularity')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              mouseMode === 'singularity' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🕳️ Singularity Pull
          </button>
          <button
            onClick={() => setMouseMode('repulsion')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              mouseMode === 'repulsion' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            💥 Shockwave Repel
          </button>
          <button
            onClick={() => setMouseMode('spawner')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              mouseMode === 'spawner' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ✨ Star Injector
          </button>
        </div>

        {/* HUD Overlay Toggle Button */}
        <button
          onClick={() => setShowHUD(!showHUD)}
          className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-slate-950/70 backdrop-blur-md border border-slate-800 text-[11px] font-mono text-slate-400 hover:text-slate-200"
        >
          {showHUD ? 'Hide HUD' : 'Show HUD'}
        </button>
      </div>

      {/* Control Panel Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
        {/* Theme & Palette Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Visual Palette</label>
          <select
            value={themeKey}
            onChange={(e) => setThemeKey(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            {Object.entries(THEMES).map(([k, t]) => (
              <option key={k} value={k}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Particle Count Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-300 uppercase tracking-wider">Stellar Density</span>
            <span className="font-mono text-cyan-400">{particleCount}</span>
          </div>
          <input
            type="range"
            min="400"
            max="3000"
            step="100"
            value={particleCount}
            onChange={(e) => setParticleCount(Number(e.target.value))}
            className="w-full accent-cyan-500 bg-slate-950 rounded-lg h-2"
          />
        </div>

        {/* Gravity Constant Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-300 uppercase tracking-wider">Gravity Constant (G)</span>
            <span className="font-mono text-amber-400">{gravityG.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="4.0"
            step="0.1"
            value={gravityG}
            onChange={(e) => setGravityG(Number(e.target.value))}
            className="w-full accent-amber-500 bg-slate-950 rounded-lg h-2"
          />
        </div>

        {/* Time Speed Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-300 uppercase tracking-wider">Time Dilation</span>
            <span className="font-mono text-purple-400">{timeSpeed.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="3.0"
            step="0.1"
            value={timeSpeed}
            onChange={(e) => setTimeSpeed(Number(e.target.value))}
            className="w-full accent-purple-500 bg-slate-950 rounded-lg h-2"
          />
        </div>

        {/* Dark Matter Halo Factor */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-300 uppercase tracking-wider">Dark Matter Halo</span>
            <span className="font-mono text-emerald-400">{darkMatter.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="3.0"
            step="0.1"
            value={darkMatter}
            onChange={(e) => setDarkMatter(Number(e.target.value))}
            className="w-full accent-emerald-500 bg-slate-950 rounded-lg h-2"
          />
        </div>

        {/* Trail Fade Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-300 uppercase tracking-wider">Orbital Trail Length</span>
            <span className="font-mono text-pink-400">{(1 - trailFade).toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.05"
            max="0.5"
            step="0.02"
            value={trailFade}
            onChange={(e) => setTrailFade(Number(e.target.value))}
            className="w-full accent-pink-500 bg-slate-950 rounded-lg h-2"
          />
        </div>

        {/* Mouse Intensity Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-300 uppercase tracking-wider">Cursor Force Field</span>
            <span className="font-mono text-cyan-400">{mouseForce.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="1.0"
            max="10.0"
            step="0.5"
            value={mouseForce}
            onChange={(e) => setMouseForce(Number(e.target.value))}
            className="w-full accent-cyan-500 bg-slate-950 rounded-lg h-2"
          />
        </div>

        {/* Scenario Info */}
        <div className="flex flex-col justify-center bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 text-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CURRENT PRESET INFO</span>
          <p className="text-slate-300 font-medium text-[11px] truncate mt-0.5">{PRESETS[presetKey]?.desc}</p>
        </div>
      </div>
    </div>
  );
};

export default GalaxyCollisionStudio;
