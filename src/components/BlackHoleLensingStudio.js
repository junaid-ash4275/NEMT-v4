import React, { useState, useEffect, useRef, useCallback } from "react";

// Visual Themes
const THEMES = {
  gargantua: {
    id: "gargantua",
    name: "Gargantua Gold",
    bg: "from-slate-950 via-amber-950/30 to-slate-900",
    canvasBg: "#04050a",
    accentText: "text-amber-400",
    accentBorder: "border-amber-500/40",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    buttonBg: "bg-amber-600 hover:bg-amber-500 text-slate-950 font-medium",
    ringColor: "#f59e0b",
    glowColor: "rgba(245, 158, 11, 0.7)",
    diskGradient: ["#ffffff", "#fef08a", "#f59e0b", "#d97706", "#991b1b"],
  },
  cyber: {
    id: "cyber",
    name: "Event Horizon Cyber",
    bg: "from-slate-950 via-indigo-950/30 to-slate-900",
    canvasBg: "#030612",
    accentText: "text-cyan-400",
    accentBorder: "border-cyan-500/40",
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    buttonBg: "bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-medium",
    ringColor: "#06b6d4",
    glowColor: "rgba(6, 182, 212, 0.7)",
    diskGradient: ["#ffffff", "#a5f3fc", "#06b6d4", "#3b82f6", "#6366f1"],
  },
  ultraviolet: {
    id: "ultraviolet",
    name: "Ultraviolet Void",
    bg: "from-purple-950/50 via-slate-950 to-indigo-950/30",
    canvasBg: "#070414",
    accentText: "text-purple-400",
    accentBorder: "border-purple-500/40",
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    buttonBg: "bg-purple-600 hover:bg-purple-500 text-white font-medium",
    ringColor: "#a855f7",
    glowColor: "rgba(168, 85, 247, 0.7)",
    diskGradient: ["#ffffff", "#f5d0fe", "#c084fc", "#9333ea", "#581c87"],
  },
  crimson: {
    id: "crimson",
    name: "Crimson Supernova",
    bg: "from-rose-950/50 via-slate-950 to-red-950/30",
    canvasBg: "#100306",
    accentText: "text-rose-400",
    accentBorder: "border-rose-500/40",
    badge: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    buttonBg: "bg-rose-600 hover:bg-rose-500 text-white font-medium",
    ringColor: "#f43f5e",
    glowColor: "rgba(244, 63, 94, 0.7)",
    diskGradient: ["#ffffff", "#fecdd3", "#fb7185", "#e11d48", "#881337"],
  },
};

// Preset configurations
const PRESETS = {
  gargantua: {
    id: "gargantua",
    name: "Gargantua Singularity",
    desc: "Supermassive Kerr black hole with a luminous relativistic accretion disk and photon ring",
    theme: "gargantua",
    mass: 55,
    spin: 0.85,
    particles: 650,
    rayDensity: 40,
    jets: true,
    showGrid: true,
    doppler: true,
    mode: "single",
  },
  binary: {
    id: "binary",
    name: "Binary Black Hole Merger",
    desc: "Two orbiting singularities warping spacetime with spiraling gravitational waves",
    theme: "cyber",
    mass: 38,
    spin: 0.5,
    particles: 500,
    rayDensity: 30,
    jets: false,
    showGrid: true,
    doppler: true,
    mode: "binary",
  },
  spaghettification: {
    id: "spaghettification",
    name: "Tidal Disruption Event",
    desc: "A doomed star being torn apart and elongated by immense gravitational tidal forces",
    theme: "crimson",
    mass: 65,
    spin: 0.4,
    particles: 800,
    rayDensity: 20,
    jets: true,
    showGrid: false,
    doppler: true,
    mode: "spaghetti",
  },
  einstein_cross: {
    id: "einstein_cross",
    name: "Einstein Cross Lensing",
    desc: "Background stellar light bent around the event horizon creating quadruple lensed arcs",
    theme: "ultraviolet",
    mass: 70,
    spin: 0.2,
    particles: 300,
    rayDensity: 80,
    jets: false,
    showGrid: true,
    doppler: false,
    mode: "cross",
  },
  quasar: {
    id: "quasar",
    name: "Relativistic Quasar",
    desc: "Active Galactic Nucleus spinning at near light-speed with ultra-bright polar energy jets",
    theme: "cyber",
    mass: 80,
    spin: 0.98,
    particles: 900,
    rayDensity: 35,
    jets: true,
    showGrid: false,
    doppler: true,
    mode: "single",
  },
};

const BlackHoleLensingStudio = () => {
  // Config state
  const [themeKey, setThemeKey] = useState("gargantua");
  const [presetKey, setPresetKey] = useState("gargantua");
  const [mass, setMass] = useState(55);
  const [spin, setSpin] = useState(0.85);
  const [particleCount, setParticleCount] = useState(650);
  const [rayDensity, setRayDensity] = useState(40);
  const [showJets, setShowJets] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [dopplerBeaming, setDopplerBeaming] = useState(true);
  const [simSpeed, setSimSpeed] = useState(1.0);
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [interactMode, setInteractMode] = useState("drag"); // 'drag' | 'laser' | 'star'
  const [activePresetMode, setActivePresetMode] = useState("single"); // 'single' | 'binary' | 'spaghetti' | 'cross'

  // Metrics state
  const [metrics, setMetrics] = useState({
    fps: 60,
    absorbedCount: 0,
    lensedRayCount: 0,
    rsKm: "162,450",
    hawkingTemp: "1.12 × 10⁻¹⁴ K",
  });

  // Canvas and refs
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);
  const gainRef = useRef(null);

  // Simulation Entities State in Ref for 60fps performance
  const simStateRef = useRef({
    bhPos: { x: 400, y: 270 },
    bh2Pos: { x: 400, y: 270 }, // for binary mode
    binaryAngle: 0,
    dragged: false,
    particles: [],
    photons: [],
    stars: [],
    jetParticles: [],
    spaghettiStar: null,
    absorbedTotal: 0,
    frameCount: 0,
    lastTime: performance.now(),
    fpsCounter: 60,
  });

  const theme = THEMES[themeKey] || THEMES.gargantua;

  // Initialize Accretion Disk & Particles
  const resetParticles = useCallback(
    (count = particleCount, mode = activePresetMode, bhCenter = { x: 400, y: 270 }) => {
      const parts = [];
      const currentMass = mass;

      // Accretion disk radius bounds
      const minRadius = currentMass * 1.6;
      const maxRadius = currentMass * 4.8;

      for (let i = 0; i < count; i++) {
        const r = minRadius + Math.pow(Math.random(), 1.5) * (maxRadius - minRadius);
        const theta = Math.random() * Math.PI * 2;
        const tilt = (Math.random() - 0.5) * 0.15; // accretion disk thickness
        const speed = (Math.sqrt((currentMass * 15) / (r * r * r)) * (0.8 + Math.random() * 0.4)) * (spin > 0.5 ? 1.2 : 1.0);

        parts.push({
          r,
          theta,
          tilt,
          speed,
          size: 1 + Math.random() * 2.2,
          opacity: 0.3 + Math.random() * 0.7,
          hueOffset: Math.random(),
        });
      }

      // Spaghetti star setup if mode requires
      let spaghetti = null;
      if (mode === "spaghetti") {
        spaghetti = {
          x: bhCenter.x - 300,
          y: bhCenter.y - 120,
          vx: 2.2,
          vy: 0.8,
          radius: 14,
          debris: [],
        };
      }

      // Background stars for lensing
      const starsArr = [];
      for (let s = 0; s < 180; s++) {
        starsArr.push({
          origX: Math.random() * 800,
          origY: Math.random() * 540,
          brightness: 0.4 + Math.random() * 0.6,
          size: Math.random() < 0.15 ? 2.5 : 1.2,
          color: Math.random() < 0.3 ? "#a5f3fc" : Math.random() < 0.6 ? "#fef08a" : "#ffffff",
        });
      }

      simStateRef.current.particles = parts;
      simStateRef.current.spaghettiStar = spaghetti;
      simStateRef.current.stars = starsArr;
      simStateRef.current.jetParticles = [];
      simStateRef.current.photons = [];
    },
    [particleCount, activePresetMode, mass, spin]
  );

  // Apply Preset
  const handleApplyPreset = (key) => {
    const p = PRESETS[key];
    if (!p) return;
    setPresetKey(key);
    setThemeKey(p.theme);
    setMass(p.mass);
    setSpin(p.spin);
    setParticleCount(p.particles);
    setRayDensity(p.rayDensity);
    setShowJets(p.jets);
    setShowGrid(p.showGrid);
    setDopplerBeaming(p.doppler);
    setActivePresetMode(p.mode);

    // Reposition BH to center
    simStateRef.current.bhPos = { x: 400, y: 270 };
    resetParticles(p.particles, p.mode, { x: 400, y: 270 });
  };

  // Audio Synthesizer effect
  useEffect(() => {
    if (soundEnabled) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!audioCtxRef.current) {
          const ctx = new AudioContext();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "sine";
          osc.frequency.setValueAtTime(65 + mass * 0.5, ctx.currentTime);
          gain.gain.setValueAtTime(0.04, ctx.currentTime);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();

          audioCtxRef.current = ctx;
          oscRef.current = osc;
          gainRef.current = gain;
        } else if (audioCtxRef.current.state === "suspended") {
          audioCtxRef.current.resume();
        }
      } catch (e) {
        console.error("Web Audio API error", e);
      }
    } else {
      if (audioCtxRef.current && audioCtxRef.current.state === "running") {
        audioCtxRef.current.suspend();
      }
    }
  }, [soundEnabled, mass]);

  // Main Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let lastFrameTime = performance.now();
    let frameCounter = 0;

    const render = (now) => {
      const dt = Math.min((now - lastFrameTime) / 1000, 0.05) * simSpeed;
      lastFrameTime = now;

      // Update FPS counter every 30 frames
      frameCounter++;
      if (frameCounter % 30 === 0) {
        const currentFps = Math.round(1 / Math.max(dt / simSpeed, 0.001));
        setMetrics((prev) => ({
          ...prev,
          fps: currentFps,
          absorbedCount: simStateRef.current.absorbedTotal,
          rsKm: (mass * 2950).toLocaleString(),
          hawkingTemp: (6.17 / mass).toFixed(2) + " × 10⁻¹⁴ K",
        }));
      }

      const width = canvas.width;
      const height = canvas.height;
      const state = simStateRef.current;

      // Handle Binary BH Movement
      if (activePresetMode === "binary" && !isPaused) {
        state.binaryAngle += dt * 0.8;
        const orbitR = 90;
        const cx = 400;
        const cy = 270;
        state.bhPos = {
          x: cx + Math.cos(state.binaryAngle) * orbitR,
          y: cy + Math.sin(state.binaryAngle) * 0.6 * orbitR,
        };
        state.bh2Pos = {
          x: cx - Math.cos(state.binaryAngle) * orbitR,
          y: cy - Math.sin(state.binaryAngle) * 0.6 * orbitR,
        };
      }

      const bh = state.bhPos;
      const bh2 = state.bh2Pos;
      const Rs = mass * 0.95; // Schwarzschild radius in canvas pixels
      const Rphoton = Rs * 1.5; // Photon sphere radius
      const Rergo = Rs * (1 + Math.sqrt(1 - spin * spin * 0.95)); // Ergosphere radius

      // Clear Canvas
      ctx.fillStyle = theme.canvasBg;
      ctx.fillRect(0, 0, width, height);

      // --- 1. SPATIAL WARP GRID (Einstein Field Deformation) ---
      if (showGrid) {
        ctx.save();
        ctx.strokeStyle = "rgba(100, 116, 139, 0.12)";
        ctx.lineWidth = 1;
        const step = 32;

        for (let x = 0; x <= width; x += step) {
          ctx.beginPath();
          for (let y = 0; y <= height; y += step / 2) {
            // Lens displacement from primary BH
            const dx1 = x - bh.x;
            const dy1 = y - bh.y;
            const dist1 = Math.sqrt(dx1 * dx1 + dy1 * dy1) + 0.1;
            const warp1 = (Rs * Rs * 30) / (dist1 * dist1 + Rs * 10);

            let wx = x - (dx1 / dist1) * warp1;
            let wy = y - (dy1 / dist1) * warp1;

            if (activePresetMode === "binary") {
              const dx2 = x - bh2.x;
              const dy2 = y - bh2.y;
              const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2) + 0.1;
              const warp2 = (Rs * Rs * 25) / (dist2 * dist2 + Rs * 10);
              wx -= (dx2 / dist2) * warp2;
              wy -= (dy2 / dist2) * warp2;
            }

            if (y === 0) ctx.moveTo(wx, wy);
            else ctx.lineTo(wx, wy);
          }
          ctx.stroke();
        }

        for (let y = 0; y <= height; y += step) {
          ctx.beginPath();
          for (let x = 0; x <= width; x += step / 2) {
            const dx1 = x - bh.x;
            const dy1 = y - bh.y;
            const dist1 = Math.sqrt(dx1 * dx1 + dy1 * dy1) + 0.1;
            const warp1 = (Rs * Rs * 30) / (dist1 * dist1 + Rs * 10);

            let wx = x - (dx1 / dist1) * warp1;
            let wy = y - (dy1 / dist1) * warp1;

            if (activePresetMode === "binary") {
              const dx2 = x - bh2.x;
              const dy2 = y - bh2.y;
              const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2) + 0.1;
              const warp2 = (Rs * Rs * 25) / (dist2 * dist2 + Rs * 10);
              wx -= (dx2 / dist2) * warp2;
              wy -= (dy2 / dist2) * warp2;
            }

            if (x === 0) ctx.moveTo(wx, wy);
            else ctx.lineTo(wx, wy);
          }
          ctx.stroke();
        }
        ctx.restore();
      }

      // --- 2. GRAVITATIONAL LENSED BACKGROUND STARS ---
      ctx.save();
      for (let s of state.stars) {
        const dx = s.origX - bh.x;
        const dy = s.origY - bh.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Einstein deflection angle formula approximation: theta_deflect ~ 4GM / r
        const deflect = (Rs * 80) / (dist + Rs * 0.5);
        const lensedX = s.origX + (dx / dist) * deflect;
        const lensedY = s.origY + (dy / dist) * deflect;

        if (lensedX >= 0 && lensedX <= width && lensedY >= 0 && lensedY <= height) {
          const alpha = Math.min(s.brightness * (1 + deflect / 40), 1);
          ctx.fillStyle = s.color;
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(lensedX, lensedY, s.size * (1 + deflect / 60), 0, Math.PI * 2);
          ctx.fill();

          // Einstein Cross 4-fold lensed arcs in cross mode
          if (activePresetMode === "cross" && dist < Rs * 3.5) {
            ctx.fillStyle = "#38bdf8";
            ctx.globalAlpha = 0.7;
            for (let a = 1; a < 4; a++) {
              const angle = (a * Math.PI) / 2;
              const cx = bh.x + Math.cos(angle) * (Rphoton * 1.2);
              const cy = bh.y + Math.sin(angle) * (Rphoton * 1.2);
              ctx.beginPath();
              ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }
      ctx.restore();

      // --- 3. RELATIVISTIC POLAR JETS ---
      if (showJets) {
        ctx.save();
        // Emit new jet particles
        if (!isPaused && Math.random() < 0.8) {
          const jetSpeed = 8 + Math.random() * 6;
          // Top jet
          state.jetParticles.push({
            x: bh.x + (Math.random() - 0.5) * 8,
            y: bh.y - Rs * 0.8,
            vx: (Math.random() - 0.5) * 0.8,
            vy: -jetSpeed,
            life: 1.0,
            size: 2 + Math.random() * 4,
          });
          // Bottom jet
          state.jetParticles.push({
            x: bh.x + (Math.random() - 0.5) * 8,
            y: bh.y + Rs * 0.8,
            vx: (Math.random() - 0.5) * 0.8,
            vy: jetSpeed,
            life: 1.0,
            size: 2 + Math.random() * 4,
          });
        }

        // Draw and update jets
        for (let i = state.jetParticles.length - 1; i >= 0; i--) {
          const p = state.jetParticles[i];
          if (!isPaused) {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= dt * 1.2;
          }

          if (p.life <= 0) {
            state.jetParticles.splice(i, 1);
            continue;
          }

          const jetGlow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
          jetGlow.addColorStop(0, "rgba(255, 255, 255, " + p.life + ")");
          jetGlow.addColorStop(0.5, theme.glowColor);
          jetGlow.addColorStop(1, "rgba(0, 0, 0, 0)");

          ctx.fillStyle = jetGlow;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // --- 4. BACK OF ACCRETION DISK (Behind Event Horizon) ---
      ctx.save();
      const diskColors = theme.diskGradient;

      for (let p of state.particles) {
        if (!isPaused) {
          p.theta += p.speed * dt;
        }

        // Check if particle is currently behind the black hole (upper half ellipse)
        const sinT = Math.sin(p.theta);
        const cosT = Math.cos(p.theta);

        if (sinT < 0) {
          const px = bh.x + cosT * p.r;
          const py = bh.y + sinT * (p.r * 0.3) + p.tilt * p.r;

          // Gravitational lensing bends top/back of accretion disk upward above horizon!
          const distToBh = Math.sqrt((px - bh.x) ** 2 + (py - bh.y) ** 2);
          const warpUp = distToBh < Rphoton * 2.2 ? (Rphoton * 2.2 - distToBh) * 0.4 : 0;
          const finalY = py - warpUp;

          // Doppler beaming color & opacity calculation
          // Particle moving left (cosT < 0) is approaching -> blueshifted & brighter
          let dopplerFactor = 1.0;
          if (dopplerBeaming) {
            dopplerFactor = 1.0 - cosT * 0.55 * spin;
          }

          const colorIdx = Math.min(
            Math.floor((1 - (p.r - mass * 1.6) / (mass * 3.2)) * diskColors.length),
            diskColors.length - 1
          );

          ctx.fillStyle = diskColors[Math.max(0, colorIdx)];
          ctx.globalAlpha = Math.min(p.opacity * dopplerFactor, 1.0);
          ctx.beginPath();
          ctx.arc(px, finalY, p.size * Math.max(0.5, dopplerFactor), 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      // --- 5. ERGOSPHERE & PHOTON SPHERE GLOW ---
      ctx.save();
      // Ergosphere (Oblate distorted space for spinning hole)
      const ergoGrad = ctx.createRadialGradient(bh.x, bh.y, Rs, bh.x, bh.y, Rergo * 1.4);
      ergoGrad.addColorStop(0, "rgba(0, 0, 0, 1)");
      ergoGrad.addColorStop(0.5, theme.glowColor);
      ergoGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = ergoGrad;
      ctx.beginPath();
      ctx.ellipse(bh.x, bh.y, Rergo * 1.3, Rs * 1.1, (spin * Math.PI) / 6, 0, Math.PI * 2);
      ctx.fill();

      // Photon Ring (Bright lensed thin halo around horizon)
      ctx.strokeStyle = theme.ringColor;
      ctx.shadowColor = theme.ringColor;
      ctx.shadowBlur = 20;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(bh.x, bh.y, Rphoton, 0, Math.PI * 2);
      ctx.stroke();

      // Secondary BH for binary mode
      if (activePresetMode === "binary") {
        ctx.strokeStyle = "#06b6d4";
        ctx.shadowColor = "#06b6d4";
        ctx.shadowBlur = 16;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(bh2.x, bh2.y, Rphoton * 0.9, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      // --- 6. EVENT HORIZON SINGULARITY (Pure Black Hole Core) ---
      ctx.save();
      ctx.fillStyle = "#000000";
      ctx.beginPath();
      ctx.arc(bh.x, bh.y, Rs, 0, Math.PI * 2);
      ctx.fill();

      if (activePresetMode === "binary") {
        ctx.beginPath();
        ctx.arc(bh2.x, bh2.y, Rs * 0.9, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // --- 7. FRONT OF ACCRETION DISK ---
      ctx.save();
      for (let p of state.particles) {
        const sinT = Math.sin(p.theta);
        const cosT = Math.cos(p.theta);

        if (sinT >= 0) {
          const px = bh.x + cosT * p.r;
          const py = bh.y + sinT * (p.r * 0.3) + p.tilt * p.r;

          let dopplerFactor = 1.0;
          if (dopplerBeaming) {
            dopplerFactor = 1.0 - cosT * 0.55 * spin;
          }

          const colorIdx = Math.min(
            Math.floor((1 - (p.r - mass * 1.6) / (mass * 3.2)) * diskColors.length),
            diskColors.length - 1
          );

          ctx.fillStyle = diskColors[Math.max(0, colorIdx)];
          ctx.globalAlpha = Math.min(p.opacity * dopplerFactor, 1.0);
          ctx.beginPath();
          ctx.arc(px, py, p.size * Math.max(0.6, dopplerFactor), 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      // --- 8. SPAGHETTIFICATION DEBRIS STREAM ---
      if (activePresetMode === "spaghetti" && state.spaghettiStar) {
        ctx.save();
        const star = state.spaghettiStar;
        if (!isPaused) {
          const dx = bh.x - star.x;
          const dy = bh.y - star.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const force = (mass * 120) / (dist * dist + 10);

          star.vx += (dx / dist) * force * dt;
          star.vy += (dy / dist) * force * dt;
          star.x += star.vx;
          star.y += star.vy;

          // Spawn tidal ribbon particles
          if (dist < Rs * 3.5) {
            for (let k = 0; k < 4; k++) {
              star.debris.push({
                x: star.x + (Math.random() - 0.5) * 6,
                y: star.y + (Math.random() - 0.5) * 6,
                vx: star.vx * 0.9 + (Math.random() - 0.5),
                vy: star.vy * 0.9 + (Math.random() - 0.5),
                life: 1.0,
              });
            }
          }
        }

        // Draw collapsing star body
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "#f43f5e";
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(star.x, star.y, Math.max(3, star.radius), 0, Math.PI * 2);
        ctx.fill();

        // Draw drawn-out spaghettified debris tail
        for (let i = star.debris.length - 1; i >= 0; i--) {
          const d = star.debris[i];
          if (!isPaused) {
            const ddx = bh.x - d.x;
            const ddy = bh.y - d.y;
            const dDist = Math.sqrt(ddx * ddx + ddy * ddy);
            d.x += d.vx + (ddx / dDist) * 3;
            d.y += d.vy + (ddy / dDist) * 3;
            d.life -= dt * 0.8;

            if (dDist < Rs) {
              state.absorbedTotal++;
              state.debris.splice(i, 1);
              continue;
            }
          }

          if (d.life <= 0) {
            star.debris.splice(i, 1);
            continue;
          }

          ctx.fillStyle = "rgba(251, 113, 133, " + d.life + ")";
          ctx.beginPath();
          ctx.arc(d.x, d.y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // --- 9. INTERACTIVE PHOTON BEAMS (Lensing Rays) ---
      ctx.save();
      // Auto-emit photon swarm array if density > 0
      if (state.photons.length < rayDensity && !isPaused) {
        const startY = 40 + Math.random() * (height - 80);
        state.photons.push({
          x: 0,
          y: startY,
          vx: 7 + Math.random() * 2,
          vy: 0,
          path: [{ x: 0, y: startY }],
          color: theme.ringColor,
        });
      }

      for (let pIdx = state.photons.length - 1; pIdx >= 0; pIdx--) {
        const p = state.photons[pIdx];

        if (!isPaused) {
          // Relativistic light deflection integration step
          const dx = bh.x - p.x;
          const dy = bh.y - p.y;
          const distSq = dx * dx + dy * dy;
          const dist = Math.sqrt(distSq);

          // Force = 3 * G * M / r^3
          const force = (mass * 1800) / (distSq * dist + 10);
          p.vx += (dx / dist) * force * dt * 60;
          p.vy += (dy / dist) * force * dt * 60;

          // Normalize light speed c
          const curSpeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          const c = 8.5;
          p.vx = (p.vx / curSpeed) * c;
          p.vy = (p.vy / curSpeed) * c;

          p.x += p.vx;
          p.y += p.vy;
          p.path.push({ x: p.x, y: p.y });

          // Keep path trace length bounded
          if (p.path.length > 45) p.path.shift();

          // Absorbed by Event Horizon
          if (dist < Rs) {
            state.absorbedTotal++;
            state.photons.splice(pIdx, 1);
            continue;
          }

          // Out of bounds remove
          if (p.x > width + 50 || p.x < -50 || p.y > height + 50 || p.y < -50) {
            state.photons.splice(pIdx, 1);
            continue;
          }
        }

        // Draw curved photon trajectory trail
        if (p.path.length > 1) {
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 1.6;
          ctx.globalAlpha = 0.8;
          ctx.beginPath();
          ctx.moveTo(p.path[0].x, p.path[0].y);
          for (let pt of p.path) {
            ctx.lineTo(pt.x, pt.y);
          }
          ctx.stroke();

          // Photon tip glow
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      // Loop animation
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [
    theme,
    mass,
    spin,
    showJets,
    showGrid,
    dopplerBeaming,
    simSpeed,
    isPaused,
    activePresetMode,
    rayDensity,
  ]);

  // Initial setup of particles
  useEffect(() => {
    resetParticles(particleCount, activePresetMode, simStateRef.current.bhPos);
  }, [resetParticles, particleCount, activePresetMode]);

  // Canvas Mouse Interactions (Drag Black Hole or Shoot Laser / Star)
  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const bh = simStateRef.current.bhPos;
    const distToBh = Math.sqrt((mx - bh.x) ** 2 + (my - bh.y) ** 2);

    if (interactMode === "drag" || distToBh < mass * 1.5) {
      simStateRef.current.dragged = true;
      simStateRef.current.bhPos = { x: mx, y: my };
    } else if (interactMode === "laser") {
      // Shoot manual custom photon beam from cursor toward BH
      const dx = bh.x - mx;
      const dy = bh.y - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const speed = 8.5;
      simStateRef.current.photons.push({
        x: mx,
        y: my,
        vx: (dx / dist) * speed,
        vy: (dy / dist) * speed,
        path: [{ x: mx, y: my }],
        color: "#38bdf8",
      });
    } else if (interactMode === "star") {
      // Spawn orbiting star test mass
      simStateRef.current.spaghettiStar = {
        x: mx,
        y: my,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        radius: 12,
        debris: [],
      };
      setActivePresetMode("spaghetti");
    }
  };

  const handleMouseMove = (e) => {
    if (!simStateRef.current.dragged) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    simStateRef.current.bhPos = { x: mx, y: my };
  };

  const handleMouseUp = () => {
    simStateRef.current.dragged = false;
  };

  // Export Snapshot PNG
  const handleExportImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `BlackHole_Lensing_${presetKey}_${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className={`flex justify-center items-center p-4 sm:p-6 my-6 bg-gradient-to-br ${theme.bg} rounded-3xl shadow-2xl transition-all duration-500`}>
      <div className="w-full max-w-6xl bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 shadow-2xl text-slate-100 flex flex-col gap-6">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r ${theme.accentText} to-white bg-clip-text text-transparent`}>
                Gravitational Lensing & Black Hole Studio
              </h2>
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${theme.badge}`}>
                General Relativity Sim
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Interactive Kerr metric geodesics, Einstein photon bending, and Doppler lensed accretion disk physics.
            </p>
          </div>

          {/* Theme Selector */}
          <div className="flex items-center gap-2 self-stretch md:self-auto overflow-x-auto pb-1 md:pb-0">
            {Object.values(THEMES).map((t) => (
              <button
                key={t.id}
                onClick={() => setThemeKey(t.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  themeKey === t.id
                    ? `${t.badge} shadow-lg shadow-black/40`
                    : "bg-slate-800/60 border-white/10 text-slate-400 hover:text-white"
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* --- PRESETS BAR --- */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-white/5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2">Presets:</span>
          {Object.values(PRESETS).map((p) => (
            <button
              key={p.id}
              onClick={() => handleApplyPreset(p.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                presetKey === p.id
                  ? `${theme.buttonBg} shadow-md`
                  : "bg-slate-800/70 border-white/10 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* --- CANVAS & WORKSPACE --- */}
        <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black">
          <canvas
            ref={canvasRef}
            width={800}
            height={540}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="w-full h-[380px] sm:h-[500px] block cursor-crosshair touch-none"
          />

          {/* Canvas Helper Badge Overlay */}
          <div className="absolute top-3 left-3 pointer-events-none bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs text-slate-300 flex items-center gap-2 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>
              {interactMode === "drag" && "Drag Black Hole • Watch Spacetime Warp"}
              {interactMode === "laser" && "Click Anywhere to Fire Photon Beam"}
              {interactMode === "star" && "Click to Launch Falling Star Mass"}
            </span>
          </div>

          {/* Canvas Controls Overlay (Top Right) */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md border transition-all ${
                soundEnabled
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  : "bg-slate-900/80 text-slate-400 border-white/10 hover:text-white"
              }`}
              title="Toggle Web Audio Cosmic Drone"
            >
              {soundEnabled ? "🔊 Sound ON" : "🔇 Sound OFF"}
            </button>
            <button
              onClick={handleExportImage}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900/80 hover:bg-slate-800 text-slate-200 backdrop-blur-md border border-white/10 transition-all shadow-md"
            >
              📸 Export PNG
            </button>
          </div>
        </div>

        {/* --- CONTROLS & METRICS DASHBOARD --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column 1: Physics Parameters */}
          <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5 flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> Physics & Kerr Metric
            </h3>

            {/* Mass Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Black Hole Mass (M)</span>
                <span className={`font-mono font-bold ${theme.accentText}`}>{mass} M☉</span>
              </div>
              <input
                type="range"
                min={20}
                max={110}
                value={mass}
                onChange={(e) => setMass(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Spin Parameter Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Kerr Spin Parameter (a)</span>
                <span className={`font-mono font-bold ${theme.accentText}`}>{spin.toFixed(2)} c</span>
              </div>
              <input
                type="range"
                min={0}
                max={0.99}
                step={0.01}
                value={spin}
                onChange={(e) => setSpin(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Particle Density Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Accretion Particles</span>
                <span className={`font-mono font-bold ${theme.accentText}`}>{particleCount}</span>
              </div>
              <input
                type="range"
                min={100}
                max={1200}
                step={50}
                value={particleCount}
                onChange={(e) => setParticleCount(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Simulation Speed Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Simulation Speed</span>
                <span className={`font-mono font-bold ${theme.accentText}`}>{simSpeed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min={0.2}
                max={3.0}
                step={0.1}
                value={simSpeed}
                onChange={(e) => setSimSpeed(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
          </div>

          {/* Column 2: Visual Effects & Interaction Mode */}
          <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5 flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" /> Effects & Controls
            </h3>

            {/* Interactive Canvas Mode */}
            <div>
              <span className="text-xs text-slate-400 block mb-1.5">Canvas Mouse Tool:</span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: "drag", label: "🖐️ Move Hole" },
                  { id: "laser", label: "🔦 Light Ray" },
                  { id: "star", label: "⭐ Star Mass" },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setInteractMode(mode.id)}
                    className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      interactMode === mode.id
                        ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow"
                        : "bg-slate-800/60 border-white/10 text-slate-400 hover:text-white"
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer bg-slate-900/60 p-2 rounded-lg border border-white/5 hover:border-white/20">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className="rounded accent-cyan-500"
                />
                <span>Warp Grid</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer bg-slate-900/60 p-2 rounded-lg border border-white/5 hover:border-white/20">
                <input
                  type="checkbox"
                  checked={showJets}
                  onChange={(e) => setShowJets(e.target.checked)}
                  className="rounded accent-cyan-500"
                />
                <span>Plasma Jets</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer bg-slate-900/60 p-2 rounded-lg border border-white/5 hover:border-white/20">
                <input
                  type="checkbox"
                  checked={dopplerBeaming}
                  onChange={(e) => setDopplerBeaming(e.target.checked)}
                  className="rounded accent-cyan-500"
                />
                <span>Doppler Beaming</span>
              </label>

              <button
                onClick={() => setIsPaused(!isPaused)}
                className={`p-2 rounded-lg border text-xs font-bold transition-all ${
                  isPaused ? "bg-amber-500/20 text-amber-300 border-amber-500/40" : "bg-slate-800 border-white/10 text-slate-200"
                }`}
              >
                {isPaused ? "▶ Resume" : "⏸ Pause"}
              </button>
            </div>
          </div>

          {/* Column 3: Live Relativistic Metrics */}
          <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5 flex flex-col justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" /> Relativistic Telemetry
            </h3>

            <div className="grid grid-cols-2 gap-2 my-2">
              <div className="bg-slate-900/70 p-2.5 rounded-lg border border-white/5">
                <span className="text-[10px] text-slate-400 block uppercase">Event Horizon (Rs)</span>
                <span className="text-sm font-mono font-bold text-amber-300">{metrics.rsKm} km</span>
              </div>

              <div className="bg-slate-900/70 p-2.5 rounded-lg border border-white/5">
                <span className="text-[10px] text-slate-400 block uppercase">Hawking Temp</span>
                <span className="text-xs font-mono font-bold text-cyan-300">{metrics.hawkingTemp}</span>
              </div>

              <div className="bg-slate-900/70 p-2.5 rounded-lg border border-white/5">
                <span className="text-[10px] text-slate-400 block uppercase">Absorbed Photons</span>
                <span className="text-sm font-mono font-bold text-rose-400">{metrics.absorbedCount}</span>
              </div>

              <div className="bg-slate-900/70 p-2.5 rounded-lg border border-white/5">
                <span className="text-[10px] text-slate-400 block uppercase">Sim Performance</span>
                <span className="text-sm font-mono font-bold text-emerald-400">{metrics.fps} FPS</span>
              </div>
            </div>

            <button
              onClick={() => resetParticles(particleCount, activePresetMode, { x: 400, y: 270 })}
              className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold border border-white/10 text-slate-200 transition-all"
            >
              🔄 Reset Accretion Disk
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default BlackHoleLensingStudio;
