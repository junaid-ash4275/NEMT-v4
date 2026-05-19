import React, { useState, useEffect, useRef } from 'react';

// Color palettes for particles
const PALETTES = {
  CosmicGlow: ['#818cf8', '#a78bfa', '#f472b6', '#60a5fa'],
  SolarFlare: ['#f59e0b', '#ef4444', '#f97316', '#facc15'],
  NeonCyber:  ['#10b981', '#06b6d4', '#3b82f6', '#a855f7'],
  DeepSpace:  ['#ec4899', '#8b5cf6', '#06b6d4', '#ffffff'],
};

// Preset system configurations
const PRESETS = {
  Lagrangian: {
    name: 'Lagrangian Balance',
    description: 'Two stars with equal mass holding a group of orbiting satellites in stable paths.',
    G: 1.5,
    trailDecay: 0.08,
    friction: 0,
    stationarySuns: true,
    collisionMode: 'bounce',
    masses: [
      { id: 'sun1', x: 250, y: 250, vx: 0, vy: 0, mass: 8000, radius: 18, type: 'star', color: '#3b82f6' },
      { id: 'sun2', x: 550, y: 250, vx: 0, vy: 0, mass: 8000, radius: 18, type: 'star', color: '#ec4899' },
    ],
    generateParticles: (width, height) => {
      const parts = [];
      // Ring of particles between them
      for (let i = 0; i < 150; i++) {
        const angle = (i / 150) * Math.PI * 2;
        const r = 120;
        const px = 400 + Math.cos(angle) * r;
        const py = 250 + Math.sin(angle) * r;
        // Circular orbit velocity
        const speed = 4.2;
        parts.push({
          x: px,
          y: py,
          vx: -Math.sin(angle) * speed,
          vy: Math.cos(angle) * speed,
          color: '#a78bfa',
          size: 1.5 + Math.random() * 1.5,
        });
      }
      return parts;
    }
  },
  BinaryOrbit: {
    name: 'Binary Star Dance',
    description: 'Two massive bodies orbiting their common center of mass, swirling dust in a figure-eight pattern.',
    G: 1.2,
    trailDecay: 0.05,
    friction: 0.001,
    stationarySuns: false, // Mutual gravity!
    collisionMode: 'absorb',
    masses: [
      { id: 'b1', x: 340, y: 250, vx: 0, vy: 2.2, mass: 12000, radius: 20, type: 'star', color: '#f59e0b' },
      { id: 'b2', x: 460, y: 250, vx: 0, vy: -2.2, mass: 12000, radius: 20, type: 'star', color: '#10b981' },
    ],
    generateParticles: (width, height) => {
      const parts = [];
      for (let i = 0; i < 200; i++) {
        const r = 180 + Math.random() * 100;
        const angle = Math.random() * Math.PI * 2;
        parts.push({
          x: 400 + Math.cos(angle) * r,
          y: 250 + Math.sin(angle) * r,
          vx: -Math.sin(angle) * 4.8,
          vy: Math.cos(angle) * 4.8,
          color: '#60a5fa',
          size: 1 + Math.random() * 2,
        });
      }
      return parts;
    }
  },
  BlackHole: {
    name: 'Supermassive Black Hole',
    description: 'A crushing gravity well warping light and sucking in streams of hyper-velocity gas.',
    G: 2.5,
    trailDecay: 0.12,
    friction: 0.002,
    stationarySuns: true,
    collisionMode: 'absorb',
    masses: [
      { id: 'bh1', x: 400, y: 250, vx: 0, vy: 0, mass: 45000, radius: 24, type: 'blackhole', color: '#030712' },
    ],
    generateParticles: (width, height) => {
      const parts = [];
      for (let i = 0; i < 300; i++) {
        const r = 60 + Math.random() * 250;
        const angle = Math.random() * Math.PI * 2;
        // Keplerian orbital speed v = sqrt(G*M/r)
        const speed = Math.sqrt((2.5 * 45000) / r) * 0.95;
        parts.push({
          x: 400 + Math.cos(angle) * r,
          y: 250 + Math.sin(angle) * r,
          vx: -Math.sin(angle) * speed,
          vy: Math.cos(angle) * speed,
          color: r < 120 ? '#ef4444' : r < 200 ? '#f97316' : '#facc15',
          size: 1 + Math.random() * 2,
        });
      }
      return parts;
    }
  },
  ChaosTrio: {
    name: 'Three-Body Chaos',
    description: 'A chaotic dance of three stars with highly unpredictable gravitational interaction and sling effects.',
    G: 1.0,
    trailDecay: 0.04,
    friction: 0,
    stationarySuns: false,
    collisionMode: 'bounce',
    masses: [
      { id: 'c1', x: 280, y: 180, vx: 1.5, vy: -1.2, mass: 10000, radius: 16, type: 'star', color: '#a855f7' },
      { id: 'c2', x: 520, y: 180, vx: -1.5, vy: -1.2, mass: 10000, radius: 16, type: 'star', color: '#06b6d4' },
      { id: 'c3', x: 400, y: 360, vx: 0, vy: 2.4, mass: 10000, radius: 16, type: 'star', color: '#eab308' },
    ],
    generateParticles: (width, height) => {
      const parts = [];
      for (let i = 0; i < 150; i++) {
        parts.push({
          x: 400 + (Math.random() - 0.5) * 100,
          y: 250 + (Math.random() - 0.5) * 100,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          color: '#ffffff',
          size: 1.2,
        });
      }
      return parts;
    }
  }
};

const GravityOrbitSandbox = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Simulation controls in React state
  const [activePreset, setActivePreset] = useState('Lagrangian');
  const [gravityG, setGravityG] = useState(1.5);
  const [trailDecay, setTrailDecay] = useState(0.08);
  const [friction, setFriction] = useState(0);
  const [stationarySuns, setStationarySuns] = useState(true);
  const [collisionMode, setCollisionMode] = useState('bounce'); // 'bounce', 'absorb', 'none'
  const [activeTool, setActiveTool] = useState('orbitPlacer'); // 'orbitPlacer' (drag & sling), 'massPlacer', 'emitterPlacer', 'eraser'
  const [selectedPalette, setSelectedPalette] = useState('CosmicGlow');
  
  // Custom mass configuration
  const [placementMass, setPlacementMass] = useState(10000);
  const [placementType, setPlacementType] = useState('star'); // 'star', 'blackhole'
  const [placementColor, setPlacementColor] = useState('#a78bfa');

  const [isPaused, setIsPaused] = useState(false);
  const [stats, setStats] = useState({ particles: 0, masses: 2, fps: 60 });

  // Engine references to maintain high-performance mutable state in the animation loop
  const engineRef = useRef({
    masses: [],
    particles: [],
    emitters: [],
    dragStart: null,
    dragCurrent: null,
    isDragging: false,
    frameTime: 0,
    fpsList: [],
  });

  // Setup initial preset on mount
  useEffect(() => {
    loadPreset('Lagrangian');
  }, []);

  // Sync settings from React state to Engine variables
  useEffect(() => {
    engineRef.current.G = gravityG;
    engineRef.current.trailDecay = trailDecay;
    engineRef.current.friction = friction;
    engineRef.current.stationarySuns = stationarySuns;
    engineRef.current.collisionMode = collisionMode;
  }, [gravityG, trailDecay, friction, stationarySuns, collisionMode]);

  const loadPreset = (presetKey) => {
    const preset = PRESETS[presetKey];
    if (!preset) return;

    setActivePreset(presetKey);
    setGravityG(preset.G);
    setTrailDecay(preset.trailDecay);
    setFriction(preset.friction);
    setStationarySuns(preset.stationarySuns);
    setCollisionMode(preset.collisionMode);

    // Deep copy masses so user updates don't corrupt preset objects
    engineRef.current.masses = preset.masses.map(m => ({ ...m }));
    
    // Generate particles
    const width = canvasRef.current ? canvasRef.current.width : 800;
    const height = canvasRef.current ? canvasRef.current.height : 500;
    engineRef.current.particles = preset.generateParticles(width, height);
    engineRef.current.emitters = []; // Clear custom emitters
    
    setStats(prev => ({
      ...prev,
      masses: engineRef.current.masses.length,
      particles: engineRef.current.particles.length
    }));
  };

  // Main animation / physics loop
  useEffect(() => {
    let animationFrameId;
    let lastTime = performance.now();

    const updatePhysics = () => {
      const engine = engineRef.current;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;

      // Handle Framerate Stats
      const now = performance.now();
      const delta = now - lastTime;
      lastTime = now;
      const fps = Math.round(1000 / (delta || 1));
      engine.fpsList.push(fps);
      if (engine.fpsList.length > 30) {
        engine.fpsList.shift();
      }

      if (!isPaused) {
        // 1. Process Custom Emitters
        engine.emitters.forEach(emitter => {
          emitter.ticks = (emitter.ticks || 0) + 1;
          if (emitter.ticks % emitter.interval === 0) {
            const colors = PALETTES[selectedPalette];
            const pColor = colors[Math.floor(Math.random() * colors.length)];
            
            // Spawn 3 particles at emitter with circular velocity
            for (let i = 0; i < 2; i++) {
              const angle = emitter.angle + (Math.random() - 0.5) * 0.25;
              const speed = emitter.speed * (0.9 + Math.random() * 0.2);
              engine.particles.push({
                x: emitter.x,
                y: emitter.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: pColor,
                size: 1 + Math.random() * 1.5,
              });
            }
          }
        });

        // Limit maximum particles to prevent crashing
        if (engine.particles.length > 1200) {
          engine.particles = engine.particles.slice(engine.particles.length - 1200);
        }

        // 2. Mutual Gravity between Massive Suns (if enabled)
        if (!engine.stationarySuns && engine.masses.length > 1) {
          const newMasses = engine.masses.map(m => ({ ...m, ax: 0, ay: 0 }));
          
          for (let i = 0; i < newMasses.length; i++) {
            for (let j = i + 1; j < newMasses.length; j++) {
              const m1 = newMasses[i];
              const m2 = newMasses[j];
              
              const dx = m2.x - m1.x;
              const dy = m2.y - m1.y;
              const distSq = dx * dx + dy * dy + 400; // soft factor
              const dist = Math.sqrt(distSq);
              
              // Force = G * m1 * m2 / r^2
              const forceMagnitude = (engine.G * m1.mass * m2.mass) / distSq;
              
              // Accel = Force / Mass
              const ax1 = (forceMagnitude * (dx / dist)) / m1.mass;
              const ay1 = (forceMagnitude * (dy / dist)) / m1.mass;
              
              const ax2 = (-forceMagnitude * (dx / dist)) / m2.mass;
              const ay2 = (-forceMagnitude * (dy / dist)) / m2.mass;
              
              newMasses[i].ax += ax1;
              newMasses[i].ay += ay1;
              newMasses[j].ax += ax2;
              newMasses[j].ay += ay2;
            }
          }

          // Apply mutual gravity velocities and positions
          engine.masses = newMasses.map(m => {
            let vx = m.vx + m.ax;
            let vy = m.vy + m.ay;
            
            // Damping boundary check so bodies don't fly off screen forever
            let x = m.x + vx;
            let y = m.y + vy;
            
            if (x < 20 || x > width - 20) vx = -vx * 0.8;
            if (y < 20 || y > height - 20) vy = -vy * 0.8;

            return {
              ...m,
              vx,
              vy,
              x: Math.max(20, Math.min(width - 20, x)),
              y: Math.max(20, Math.min(height - 20, y))
            };
          });
        }

        // 3. Gravity acting on Particles
        engine.particles = engine.particles.filter(p => {
          let ax = 0;
          let ay = 0;
          let absorbed = false;

          for (let i = 0; i < engine.masses.length; i++) {
            const m = engine.masses[i];
            const dx = m.x - p.x;
            const dy = m.y - p.y;
            const distSq = dx * dx + dy * dy;
            const dist = Math.sqrt(distSq);

            // Collisions with Sun surfaces
            if (dist < m.radius) {
              if (engine.collisionMode === 'absorb') {
                // Growth mechanics (Visual accretion!)
                m.radius = Math.min(60, m.radius + 0.05);
                m.mass += 15;
                absorbed = true;
                break;
              } else if (engine.collisionMode === 'bounce') {
                // Reflect velocity vector around contact normal
                const nx = dx / dist;
                const ny = dy / dist;
                const dot = p.vx * nx + p.vy * ny;
                p.vx = (p.vx - 2 * dot * nx) * 0.75;
                p.vy = (p.vy - 2 * dot * ny) * 0.75;
                
                // Nudge out of surface
                p.x = m.x - nx * (m.radius + 1);
                p.y = m.y - ny * (m.radius + 1);
                continue;
              }
            }

            // Newtonian gravity equation: a = G * M / (d^2 + softening)
            // Added 200 softening to prevent wild particles shooting at near-infinite speeds
            const pull = (engine.G * m.mass) / (distSq + 250);
            ax += pull * (dx / (dist || 1));
            ay += pull * (dy / (dist || 1));
          }

          if (absorbed) return false;

          // Apply accelerations and friction drag
          p.vx = (p.vx + ax) * (1 - engine.friction);
          p.vy = (p.vy + ay) * (1 - engine.friction);
          p.x += p.vx;
          p.y += p.vy;

          // Boundaries: filter out particles that fly into deep deep space
          return p.x > -400 && p.x < width + 400 && p.y > -400 && p.y < height + 400;
        });
      }

      // --- RENDERING CANVAS ---
      
      // Beautiful cosmic tail blend: translucent overlay creates glowing paths
      ctx.fillStyle = `rgba(3, 7, 18, ${engine.trailDecay})`;
      ctx.fillRect(0, 0, width, height);

      // Render custom emitters
      engine.emitters.forEach(emitter => {
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#10b981';
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.5;
        
        // Emitter ring
        ctx.beginPath();
        ctx.arc(emitter.x, emitter.y, 10, 0, Math.PI * 2);
        ctx.stroke();

        // Direction line
        ctx.beginPath();
        ctx.moveTo(emitter.x, emitter.y);
        ctx.lineTo(
          emitter.x + Math.cos(emitter.angle) * 18,
          emitter.y + Math.sin(emitter.angle) * 18
        );
        ctx.stroke();
        ctx.restore();
      });

      // Render orbital trails/dots for satellites
      engine.particles.forEach(p => {
        // Velocity-based color mapping for beautiful speed heatmaps
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        ctx.fillStyle = p.color;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Speed glow overlays
        if (speed > 8) {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Render massive solar bodies
      engine.masses.forEach(m => {
        ctx.save();
        
        if (m.type === 'blackhole') {
          // Render gorgeous glowing warp accretion disk first
          const gradient = ctx.createRadialGradient(m.x, m.y, m.radius * 0.9, m.x, m.y, m.radius * 2.8);
          gradient.addColorStop(0, '#030712');
          gradient.addColorStop(0.15, '#ea580c'); // accretion hot rim
          gradient.addColorStop(0.4, '#eab308');  // outer disk yellow
          gradient.addColorStop(1, 'rgba(234, 179, 8, 0)');
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(m.x, m.y, m.radius * 2.8, 0, Math.PI * 2);
          ctx.fill();

          // Black hole event horizon
          ctx.fillStyle = '#000000';
          ctx.beginPath();
          ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
          ctx.fill();
          
          // Outer clean sharp event horizon line
          ctx.strokeStyle = 'rgba(255,255,255,0.15)';
          ctx.lineWidth = 1;
          ctx.stroke();
        } else {
          // Normal Glowing Star
          const glowRad = m.radius * 2.2;
          const starGrad = ctx.createRadialGradient(m.x, m.y, m.radius * 0.3, m.x, m.y, glowRad);
          starGrad.addColorStop(0, '#ffffff');
          starGrad.addColorStop(0.3, m.color);
          starGrad.addColorStop(1, 'rgba(0,0,0,0)');

          ctx.fillStyle = starGrad;
          ctx.beginPath();
          ctx.arc(m.x, m.y, glowRad, 0, Math.PI * 2);
          ctx.fill();

          // Solid solar sphere
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(m.x, m.y, m.radius * 0.9, 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.restore();
      });

      // Render launch vector drag line
      if (engine.isDragging && engine.dragStart && engine.dragCurrent) {
        ctx.save();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        
        // Dynamic Launch Path line
        ctx.beginPath();
        ctx.moveTo(engine.dragStart.x, engine.dragStart.y);
        ctx.lineTo(engine.dragCurrent.x, engine.dragCurrent.y);
        ctx.stroke();

        // Draw sling preview dots
        const dx = engine.dragStart.x - engine.dragCurrent.x;
        const dy = engine.dragStart.y - engine.dragCurrent.y;
        
        ctx.fillStyle = '#38bdf8';
        ctx.setLineDash([]);
        
        // Emitter angle or Particle sling preview
        if (activeTool === 'orbitPlacer') {
          // Satellite sling vector arrow
          ctx.beginPath();
          ctx.arc(engine.dragStart.x, engine.dragStart.y, 4, 0, Math.PI * 2);
          ctx.fill();
        } else if (activeTool === 'emitterPlacer') {
          // Emitter launch line direction arrow
          const angle = Math.atan2(dy, dx);
          ctx.fillStyle = '#34d399';
          ctx.beginPath();
          ctx.moveTo(engine.dragStart.x, engine.dragStart.y);
          ctx.lineTo(engine.dragStart.x + Math.cos(angle) * 35, engine.dragStart.y + Math.sin(angle) * 35);
          ctx.strokeStyle = '#34d399';
          ctx.lineWidth = 3;
          ctx.stroke();
        }

        ctx.restore();
      }

      // Update statistics panel
      const avgFps = Math.round(engine.fpsList.reduce((a,b)=>a+b, 0) / (engine.fpsList.length || 1));
      setStats({
        particles: engine.particles.length,
        masses: engine.masses.length,
        fps: avgFps
      });

      animationFrameId = requestAnimationFrame(updatePhysics);
    };

    animationFrameId = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused, activeTool, selectedPalette]);

  // Handle Drag / Launch Vector events on canvas
  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const engine = engineRef.current;

    if (activeTool === 'eraser') {
      // Erase nearby massive bodies
      engine.masses = engine.masses.filter(m => {
        const dist = Math.hypot(m.x - x, m.y - y);
        return dist > m.radius + 10;
      });
      engine.emitters = engine.emitters.filter(em => {
        const dist = Math.hypot(em.x - x, em.y - y);
        return dist > 20;
      });
      return;
    }

    if (activeTool === 'massPlacer') {
      // Place Massive Center immediately
      const id = 'mass-' + Date.now();
      const radius = placementType === 'blackhole' ? 24 : Math.max(10, Math.min(45, Math.round(placementMass / 600)));
      engine.masses.push({
        id,
        x,
        y,
        vx: 0,
        vy: 0,
        mass: placementMass,
        radius,
        type: placementType,
        color: placementColor
      });
      return;
    }

    // Sling or Emitter triggers dragging vectors
    engine.isDragging = true;
    engine.dragStart = { x, y };
    engine.dragCurrent = { x, y };
  };

  const handleMouseMove = (e) => {
    const engine = engineRef.current;
    if (!engine.isDragging) return;

    const rect = canvasRef.current.getBoundingClientRect();
    engine.dragCurrent = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleMouseUp = (e) => {
    const engine = engineRef.current;
    if (!engine.isDragging) return;
    engine.isDragging = false;

    const rect = canvasRef.current.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;
    const startX = engine.dragStart.x;
    const startY = engine.dragStart.y;

    // Vector represents velocity (inverted from drag path, like a slingshot)
    const vx = (startX - endX) * 0.08;
    const vy = (startY - endY) * 0.08;

    if (activeTool === 'orbitPlacer') {
      const colors = PALETTES[selectedPalette];
      // Sling 30 satellite particles in a tight bundle
      for (let i = 0; i < 30; i++) {
        const rOffset = Math.random() * 15;
        const angleOffset = Math.random() * Math.PI * 2;
        const pColor = colors[Math.floor(Math.random() * colors.length)];
        
        engine.particles.push({
          x: startX + Math.cos(angleOffset) * rOffset,
          y: startY + Math.sin(angleOffset) * rOffset,
          vx: vx + (Math.random() - 0.5) * 0.4,
          vy: vy + (Math.random() - 0.5) * 0.4,
          color: pColor,
          size: 1 + Math.random() * 2,
        });
      }
    } else if (activeTool === 'emitterPlacer') {
      // Create permanent particle emitter shooting in specified angle
      const angle = Math.atan2(startY - endY, startX - endX);
      const speed = Math.hypot(vx, vy) || 3;
      engine.emitters.push({
        x: startX,
        y: startY,
        angle,
        speed,
        interval: 8, // frames
        ticks: 0,
      });
    }

    engine.dragStart = null;
    engine.dragCurrent = null;
  };

  // Trigger a supernova shockwave explosion from the largest solar body
  const triggerSupernova = () => {
    const engine = engineRef.current;
    if (engine.masses.length === 0) return;

    // Find star with maximum mass
    const mainStar = engine.masses.reduce((max, m) => m.mass > max.mass ? m : max, engine.masses[0]);
    const colors = PALETTES[selectedPalette];

    // Burst 250 colorful particles outwards from center
    for (let i = 0; i < 250; i++) {
      const angle = (i / 250) * Math.PI * 2 + (Math.random() - 0.5) * 0.1;
      const speed = 3 + Math.random() * 6.5;
      const pColor = colors[Math.floor(Math.random() * colors.length)];
      
      engine.particles.push({
        x: mainStar.x + Math.cos(angle) * (mainStar.radius + 2),
        y: mainStar.y + Math.sin(angle) * (mainStar.radius + 2),
        vx: mainStar.vx + Math.cos(angle) * speed,
        vy: mainStar.vy + Math.sin(angle) * speed,
        color: pColor,
        size: 1.2 + Math.random() * 2,
      });
    }

    // Shrink star from energy burst!
    mainStar.radius = Math.max(10, mainStar.radius * 0.7);
    mainStar.mass = Math.max(1500, mainStar.mass * 0.6);
  };

  const clearAll = () => {
    engineRef.current.particles = [];
    engineRef.current.masses = [];
    engineRef.current.emitters = [];
    setStats({ particles: 0, masses: 0, fps: 60 });
  };

  const clearParticles = () => {
    engineRef.current.particles = [];
  };

  return (
    <div className="flex justify-center items-center min-h-[850px] p-6 bg-[#030712] rounded-[3rem] m-5 shadow-2xl relative overflow-hidden group font-sans border border-white/5">
      {/* Dynamic Cosmic Background Dust / Nebula Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[130px] rounded-full animate-pulse"></div>
        <div className="absolute -bottom-[20%] -right-[10%] w-[45%] h-[45%] bg-purple-600/10 blur-[130px] rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full max-w-7xl relative z-10">
        
        {/* SIDEBAR CONTROL CENTER */}
        <div className="lg:col-span-4 bg-white/[0.02] backdrop-blur-3xl p-6 rounded-[2.5rem] border border-white/10 shadow-2xl space-y-6 max-h-[750px] overflow-y-auto custom-scrollbar">
          <header>
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 mb-1 tracking-tight">
              Cosmic Gravity Sandbox
            </h2>
            <p className="text-gray-400 font-medium text-xs">
              Interact with real-time orbital mechanics, massive stars, and black holes.
            </p>
          </header>

          {/* PRESETS DROPDOWN */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">Cosmic Scenarios</span>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(PRESETS).map((key) => (
                <button
                  key={key}
                  onClick={() => loadPreset(key)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border text-left truncate ${
                    activePreset === key
                      ? 'bg-indigo-500/10 border-indigo-500/35 text-indigo-300'
                      : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  {PRESETS[key].name}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-gray-500 italic mt-1 leading-tight">
              {PRESETS[activePreset]?.description}
            </p>
          </div>

          {/* MODE SELECTOR PANEL */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">Interaction Tools</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setActiveTool('orbitPlacer')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${
                  activeTool === 'orbitPlacer'
                    ? 'bg-blue-500/10 border-blue-500/40 text-blue-300'
                    : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                <span className="text-sm">☄️</span> Sling Orbit
              </button>
              <button
                onClick={() => setActiveTool('massPlacer')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${
                  activeTool === 'massPlacer'
                    ? 'bg-violet-500/10 border-violet-500/40 text-violet-300'
                    : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                <span className="text-sm">☀️</span> Place Star
              </button>
              <button
                onClick={() => setActiveTool('emitterPlacer')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${
                  activeTool === 'emitterPlacer'
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                    : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                <span className="text-sm">🌀</span> Stream Gun
              </button>
              <button
                onClick={() => setActiveTool('eraser')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${
                  activeTool === 'eraser'
                    ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                    : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                <span className="text-sm">❌</span> Erase Suns
              </button>
            </div>
          </div>

          {/* ACTIVE TOOL CONFIGURE (CONDITIONAL RENDER) */}
          {activeTool === 'massPlacer' && (
            <div className="p-3 bg-white/[0.03] rounded-2xl border border-white/5 space-y-3">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">Massive Body Architect</span>
              <div className="flex gap-2">
                <button
                  onClick={() => { setPlacementType('star'); setPlacementColor('#a78bfa'); }}
                  className={`flex-1 py-1 rounded-lg text-[10px] font-bold border ${
                    placementType === 'star' ? 'bg-white/10 border-white/20 text-white' : 'bg-transparent border-transparent text-white/40'
                  }`}
                >
                  STAR
                </button>
                <button
                  onClick={() => { setPlacementType('blackhole'); setPlacementColor('#030712'); }}
                  className={`flex-1 py-1 rounded-lg text-[10px] font-bold border ${
                    placementType === 'blackhole' ? 'bg-white/10 border-white/20 text-white' : 'bg-transparent border-transparent text-white/40'
                  }`}
                >
                  BLACK HOLE
                </button>
              </div>

              {placementType === 'star' && (
                <>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-white/50">
                      <span>Solar Mass</span>
                      <span className="font-mono">{placementMass.toLocaleString()} kg</span>
                    </div>
                    <input
                      type="range"
                      min="2000"
                      max="35000"
                      step="500"
                      value={placementMass}
                      onChange={(e) => setPlacementMass(parseInt(e.target.value))}
                      className="w-full accent-violet-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-wider block">Star Hue</span>
                    <div className="flex gap-2 justify-between">
                      {['#a78bfa', '#f59e0b', '#ec4899', '#06b6d4', '#10b981', '#ffffff'].map(c => (
                        <button
                          key={c}
                          onClick={() => setPlacementColor(c)}
                          className={`w-5 h-5 rounded-full border transition-all ${
                            placementColor === c ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* DYNAMIC PHYSIC SLIDERS */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">Physics Sandbox Controls</span>

            {/* Gravity G Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-white/60">Gravity Constant (G)</span>
                <span className="text-indigo-400 font-mono font-bold">{gravityG}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="5.0"
                step="0.1"
                value={gravityG}
                onChange={(e) => setGravityG(parseFloat(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-400"
              />
            </div>

            {/* Trail Decay Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-white/60">Orbital Trail Length</span>
                <span className="text-cyan-400 font-mono font-bold">{Math.round((1 - trailDecay) * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="0.4"
                step="0.01"
                value={trailDecay}
                onChange={(e) => setTrailDecay(parseFloat(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Friction Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-white/60">Vacuum Friction</span>
                <span className="text-emerald-400 font-mono font-bold">{Math.round(friction * 1000) / 10}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.02"
                step="0.0005"
                value={friction}
                onChange={(e) => setFriction(parseFloat(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>
          </div>

          {/* PALETTES & COLLISION MODE */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">Cosmic Color</span>
              <select
                value={selectedPalette}
                onChange={(e) => setSelectedPalette(e.target.value)}
                className="w-full p-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white/80 focus:outline-none"
              >
                <option value="CosmicGlow" className="bg-[#030712]">Cosmic Glow</option>
                <option value="SolarFlare" className="bg-[#030712]">Solar Flare</option>
                <option value="NeonCyber" className="bg-[#030712]">Neon Cyber</option>
                <option value="DeepSpace" className="bg-[#030712]">Deep Space</option>
              </select>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">Solar Collision</span>
              <select
                value={collisionMode}
                onChange={(e) => setCollisionMode(e.target.value)}
                className="w-full p-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white/80 focus:outline-none"
              >
                <option value="bounce" className="bg-[#030712]">Elastic Bounce</option>
                <option value="absorb" className="bg-[#030712]">Acreting Absorb</option>
                <option value="none" className="bg-[#030712]">Pass Through</option>
              </select>
            </div>
          </div>

          {/* CHECKBOX OPTIONS */}
          <div className="flex justify-between items-center bg-white/[0.02] border border-white/5 p-3 rounded-2xl">
            <span className="text-xs font-bold text-white/60">Suns stationary (Ignore mutual orbit)</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={stationarySuns}
                onChange={(e) => setStationarySuns(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500"></div>
            </label>
          </div>

          {/* EMISSION CONTROL BUTTONS */}
          <div className="space-y-2 pt-2">
            <button
              onClick={triggerSupernova}
              disabled={stats.masses === 0}
              className={`w-full py-3 rounded-2xl font-black transition-all flex items-center justify-center gap-2 border ${
                stats.masses > 0
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20 active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                  : 'bg-white/5 border-white/5 text-white/30 cursor-not-allowed'
              }`}
            >
              💥 TRIGGER SUPERNOVA
            </button>
            
            <div className="flex gap-2">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  isPaused
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                }`}
              >
                {isPaused ? '▶️ RESUME' : '⏸️ FREEZE'}
              </button>
              <button
                onClick={clearParticles}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
              >
                🧹 DUST SWEEP
              </button>
            </div>
            
            <button
              onClick={clearAll}
              className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 rounded-xl text-xs font-bold transition-all"
            >
              🌌 DESTROY UNIVERSE (CLEAR ALL)
            </button>
          </div>

          {/* DYNAMIC SYSTEM STATS */}
          <div className="p-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl border border-white/5 space-y-2">
            <h4 className="text-white/60 font-bold text-[10px] uppercase tracking-widest">Cosmic Metrics</h4>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <span className="text-white/30 text-[9px] block uppercase font-black">Satellites</span>
                <span className="text-sm font-bold text-white font-mono">{stats.particles}</span>
              </div>
              <div>
                <span className="text-white/30 text-[9px] block uppercase font-black">Mass Suns</span>
                <span className="text-sm font-bold text-white font-mono">{stats.masses}</span>
              </div>
              <div>
                <span className="text-white/30 text-[9px] block uppercase font-black">Framerate</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">{stats.fps} FPS</span>
              </div>
            </div>
          </div>
        </div>

        {/* INTERACTIVE PHYSICS CANVAS AND INSTRUCTION */}
        <div className="lg:col-span-8 flex flex-col gap-4 h-full">
          <div className="flex-1 bg-white/[0.01] rounded-[2.5rem] border border-white/5 relative overflow-hidden group/canvas min-h-[500px] flex items-center justify-center shadow-inner">
            <canvas
              ref={canvasRef}
              width={800}
              height={500}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              className="w-full h-full bg-[#030712] cursor-crosshair relative block"
            />

            {/* Float HUD Instruction Overlay */}
            <div className="absolute top-6 left-6 px-4 py-2 rounded-xl bg-black/60 border border-white/10 backdrop-blur-md pointer-events-none">
              <span className="text-[9px] text-white/40 uppercase font-black tracking-widest block">Action Hint</span>
              <span className="text-white text-xs font-bold">
                {activeTool === 'orbitPlacer' && 'Click & drag on canvas to slingshot satellite streams!'}
                {activeTool === 'massPlacer' && `Left-click to place a ${placementType} center.`}
                {activeTool === 'emitterPlacer' && 'Click & drag to position and aim a stream launcher.'}
                {activeTool === 'eraser' && 'Click on any star/blackhole/emitter to erase it.'}
              </span>
            </div>

            <div className="absolute bottom-6 right-6 flex items-center gap-2 px-3 py-1 bg-black/40 border border-white/5 rounded-full backdrop-blur-sm pointer-events-none">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></div>
              <span className="text-white/40 text-[9px] font-bold uppercase tracking-widest font-mono">Dynamic N-Body Simulation</span>
            </div>
          </div>

          <p className="text-center text-[10px] text-gray-500 uppercase tracking-widest">
            💡 Slingshot streams inside black hole accretion orbits for absolute jaw-dropping visual trajectories!
          </p>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
};

export default GravityOrbitSandbox;
