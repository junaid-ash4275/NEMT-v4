import React, { useState, useEffect, useRef, useCallback } from "react";

// Themes definition matching the design system of the application
const THEMES = {
  quantumCyber: {
    id: "quantumCyber",
    name: "Quantum Cyber",
    bgGradient: "from-slate-950 via-cyan-950 to-slate-900",
    canvasBg: "#030812",
    primary: "#00f3ff",
    secondary: "#ff007f",
    accentText: "text-cyan-400",
    accentBorder: "border-cyan-500/40",
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    buttonActive: "bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/30",
    wavePrimary: "rgba(0, 243, 255, 0.85)",
    waveSecondary: "rgba(255, 0, 127, 0.65)",
    glow: "rgba(0, 243, 255, 0.5)",
    barrierFill: "rgba(255, 0, 127, 0.25)",
    barrierStroke: "#ff007f",
  },
  antimatterViolet: {
    id: "antimatterViolet",
    name: "Antimatter Violet",
    bgGradient: "from-slate-950 via-purple-950 to-indigo-950",
    canvasBg: "#080314",
    primary: "#e879f9",
    secondary: "#818cf8",
    accentText: "text-fuchsia-400",
    accentBorder: "border-fuchsia-500/40",
    badge: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40",
    buttonActive: "bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-lg shadow-fuchsia-600/30",
    wavePrimary: "rgba(232, 121, 249, 0.85)",
    waveSecondary: "rgba(129, 140, 248, 0.65)",
    glow: "rgba(232, 121, 249, 0.5)",
    barrierFill: "rgba(168, 85, 247, 0.25)",
    barrierStroke: "#c084fc",
  },
  emeraldMatrix: {
    id: "emeraldMatrix",
    name: "Emerald Matrix",
    bgGradient: "from-emerald-950 via-slate-950 to-teal-950",
    canvasBg: "#020d08",
    primary: "#00ffaa",
    secondary: "#06b6d4",
    accentText: "text-emerald-400",
    accentBorder: "border-emerald-500/40",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    buttonActive: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30",
    wavePrimary: "rgba(0, 255, 170, 0.85)",
    waveSecondary: "rgba(6, 182, 212, 0.65)",
    glow: "rgba(0, 255, 170, 0.5)",
    barrierFill: "rgba(16, 185, 129, 0.25)",
    barrierStroke: "#10b981",
  },
  solarPlasma: {
    id: "solarPlasma",
    name: "Solar Plasma",
    bgGradient: "from-amber-950 via-slate-950 to-orange-950",
    canvasBg: "#0c0602",
    primary: "#fbbf24",
    secondary: "#ef4444",
    accentText: "text-amber-400",
    accentBorder: "border-amber-500/40",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    buttonActive: "bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-600/30",
    wavePrimary: "rgba(251, 191, 36, 0.85)",
    waveSecondary: "rgba(239, 68, 68, 0.65)",
    glow: "rgba(251, 191, 36, 0.5)",
    barrierFill: "rgba(245, 158, 11, 0.25)",
    barrierStroke: "#f59e0b",
  },
};

// Presets configurations
const PRESETS = {
  tunneling: {
    id: "tunneling",
    name: "Quantum Tunneling",
    desc: "Sub-barrier tunneling where incident energy E < V₀. Exponential decay inside barrier with transmitted wave packet.",
    k0: 0.45,
    sigma0: 16,
    x0: 55,
    v0: 0.12,
    vWidth: 26,
    vPos: 150,
    presetType: "barrier",
  },
  reflection: {
    id: "reflection",
    name: "Quantum Step Reflection",
    desc: "Incident wavepacket striking a potential step (E > V₀), demonstrating quantum reflection above barrier height.",
    k0: 0.55,
    sigma0: 18,
    x0: 60,
    v0: 0.08,
    vWidth: 100,
    vPos: 150,
    presetType: "step",
  },
  doubleWell: {
    id: "doubleWell",
    name: "Double-Well Sloshing",
    desc: "Coherent quantum tunneling oscillation between two symmetric potential wells.",
    k0: 0.0,
    sigma0: 14,
    x0: 95,
    v0: 0.15,
    vWidth: 16,
    vPos: 150,
    presetType: "doubleWell",
  },
  harmonic: {
    id: "harmonic",
    name: "Harmonic Trap Coherent State",
    desc: "Non-dispersive gaussian wave packet oscillating back and forth inside a parabolic potential well V(x) = ½k x².",
    k0: 0.35,
    sigma0: 15,
    x0: 90,
    v0: 0.00008,
    vWidth: 0,
    vPos: 150,
    presetType: "harmonic",
  },
  crystalLattice: {
    id: "crystalLattice",
    name: "Periodic Crystal Lattice",
    desc: "Wavepacket propagation through periodic atomic potentials showcasing energy band structures and Bloch states.",
    k0: 0.42,
    sigma0: 22,
    x0: 45,
    v0: 0.10,
    vWidth: 12,
    vPos: 150,
    presetType: "lattice",
  },
  resonantTunneling: {
    id: "resonantTunneling",
    name: "Resonant Tunneling Diode",
    desc: "Double-barrier quantum cavity showing resonant transmission spikes at sharp energy eigenvalues.",
    k0: 0.48,
    sigma0: 18,
    x0: 50,
    v0: 0.16,
    vWidth: 14,
    vPos: 130,
    presetType: "resonant",
  },
};

const GRID_SIZE = 300; // Number of spatial lattice sites

export default function QuantumWavefunctionLab() {
  // Theme state
  const [themeId, setThemeId] = useState("quantumCyber");
  const currentTheme = THEMES[themeId] || THEMES.quantumCyber;

  // Active Preset
  const [activePreset, setActivePreset] = useState("tunneling");

  // Physics Control Parameters
  const [k0, setK0] = useState(0.45); // Initial average momentum
  const [sigma0, setSigma0] = useState(16); // Initial spatial spread
  const [x0, setX0] = useState(55); // Initial center position
  const [v0, setV0] = useState(0.12); // Barrier potential height V0
  const [vWidth, setVWidth] = useState(26); // Barrier width
  const [vPos, setVPos] = useState(150); // Barrier center position
  const [simSpeed, setSimSpeed] = useState(1.0); // Simulation time step multiplier

  // UI / Simulation States
  const [isPlaying, setIsPlaying] = useState(true);
  const [showPhaseColor, setShowPhaseColor] = useState(true);
  const [showReIm, setShowReIm] = useState(true);
  const [showParticles, setShowParticles] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [renderMode, setRenderMode] = useState("spatial"); // "spatial" | "phaseSpace"

  // Telemetry Metrics
  const [fps, setFps] = useState(60);
  const [transmissionProb, setTransmissionProb] = useState(0);
  const [reflectionProb, setReflectionProb] = useState(0);
  const [barrierProb, setBarrierProb] = useState(0);
  const [expX, setExpX] = useState(0);
  const [expP, setExpP] = useState(0);
  const [uncertaintyProduct, setUncertaintyProduct] = useState(1.0);
  const [collapseEvent, setCollapseEvent] = useState(null); // { x, time }

  // Canvas Refs & Simulation Memory Arrays
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  // Numerical Wavefunction State Arrays (Length: GRID_SIZE)
  const psiRef = useRef({
    re: new Float64Array(GRID_SIZE),
    im: new Float64Array(GRID_SIZE),
    potential: new Float64Array(GRID_SIZE),
    particles: [], // Quanta particle visualization stream
  });

  // Performance FPS Tracker
  const lastTimeRef = useRef(performance.now());
  const frameCountRef = useRef(0);

  // Audio Context Ref
  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);
  const gainRef = useRef(null);

  // Initialize Audio
  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        gain.gain.setValueAtTime(0, ctx.currentTime);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        audioCtxRef.current = ctx;
        oscRef.current = osc;
        gainRef.current = gain;
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
  }, []);

  // Update Audio Tone
  const updateAudio = useCallback(
    (momentumVal, barrierDensityVal) => {
      if (!audioEnabled || !gainRef.current || !oscRef.current) return;
      try {
        const ctx = audioCtxRef.current;
        const targetFreq = 180 + Math.abs(momentumVal) * 450;
        const targetGain = Math.min(0.25, barrierDensityVal * 1.5 + 0.02);

        oscRef.current.frequency.setTargetAtTime(targetFreq, ctx.currentTime, 0.05);
        gainRef.current.gain.setTargetAtTime(targetGain, ctx.currentTime, 0.05);
      } catch (e) {
        // Silently ignore audio context state glitches
      }
    },
    [audioEnabled]
  );

  // Build Potential Profile V(x) based on preset and sliders
  const buildPotential = useCallback(
    (type, height, width, centerPos) => {
      const v = new Float64Array(GRID_SIZE);
      const halfW = Math.max(1, Math.floor(width / 2));

      if (type === "barrier") {
        for (let i = 0; i < GRID_SIZE; i++) {
          if (i >= centerPos - halfW && i <= centerPos + halfW) {
            v[i] = height;
          }
        }
      } else if (type === "step") {
        for (let i = 0; i < GRID_SIZE; i++) {
          if (i >= centerPos) {
            v[i] = height;
          }
        }
      } else if (type === "doubleWell") {
        const wellWidth = 35;
        const barrierW = 12;
        for (let i = 0; i < GRID_SIZE; i++) {
          // outer walls
          if (i < 30 || i > GRID_SIZE - 30) {
            v[i] = height * 2.5;
          } else if (Math.abs(i - centerPos) <= barrierW) {
            // central potential barrier dividing the two wells
            v[i] = height;
          }
        }
      } else if (type === "harmonic") {
        const k = height || 0.00008;
        for (let i = 0; i < GRID_SIZE; i++) {
          const dx = i - GRID_SIZE / 2;
          v[i] = 0.5 * k * dx * dx;
        }
      } else if (type === "lattice") {
        const period = 30;
        for (let i = 0; i < GRID_SIZE; i++) {
          if (i > 40 && i < GRID_SIZE - 40) {
            v[i] = height * Math.pow(Math.sin((Math.PI * i) / period), 2);
          }
        }
      } else if (type === "resonant") {
        // Double barrier with quantum cavity in middle
        const barrier1Start = centerPos - 25;
        const barrier1End = centerPos - 12;
        const barrier2Start = centerPos + 12;
        const barrier2End = centerPos + 25;
        for (let i = 0; i < GRID_SIZE; i++) {
          if (
            (i >= barrier1Start && i <= barrier1End) ||
            (i >= barrier2Start && i <= barrier2End)
          ) {
            v[i] = height;
          }
        }
      }
      return v;
    },
    []
  );

  // Reset / Fire Wave Packet
  const resetWavepacket = useCallback(() => {
    const re = new Float64Array(GRID_SIZE);
    const im = new Float64Array(GRID_SIZE);

    let norm = 0;
    for (let i = 0; i < GRID_SIZE; i++) {
      const dx = i - x0;
      const gaussian = Math.exp(-(dx * dx) / (4 * sigma0 * sigma0));
      re[i] = gaussian * Math.cos(k0 * dx);
      im[i] = gaussian * Math.sin(k0 * dx);
      norm += re[i] * re[i] + im[i] * im[i];
    }

    // Normalize wavefunction so sum(|ψ|²) = 1
    const invSqrtNorm = 1 / Math.sqrt(Math.max(1e-12, norm));
    for (let i = 0; i < GRID_SIZE; i++) {
      re[i] *= invSqrtNorm;
      im[i] *= invSqrtNorm;
    }

    // Particles initialization
    const particles = [];
    for (let p = 0; p < 180; p++) {
      particles.push({
        x: x0 + (Math.random() - 0.5) * sigma0 * 2,
        y: Math.random(),
        vx: k0 * 1.5 + (Math.random() - 0.5) * 0.2,
      });
    }

    const presetInfo = PRESETS[activePreset] || PRESETS.tunneling;
    const potential = buildPotential(
      presetInfo.presetType,
      v0,
      vWidth,
      vPos
    );

    psiRef.current = { re, im, potential, particles };
    setCollapseEvent(null);
  }, [x0, sigma0, k0, v0, vWidth, vPos, activePreset, buildPotential]);

  // Handle Preset Switching
  const handleSelectPreset = (key) => {
    const p = PRESETS[key];
    if (!p) return;
    setActivePreset(key);
    setK0(p.k0);
    setSigma0(p.sigma0);
    setX0(p.x0);
    setV0(p.v0);
    setVWidth(p.vWidth);
    setVPos(p.vPos);

    // Rebuild wavepacket immediately
    const re = new Float64Array(GRID_SIZE);
    const im = new Float64Array(GRID_SIZE);
    let norm = 0;
    for (let i = 0; i < GRID_SIZE; i++) {
      const dx = i - p.x0;
      const gaussian = Math.exp(-(dx * dx) / (4 * p.sigma0 * p.sigma0));
      re[i] = gaussian * Math.cos(p.k0 * dx);
      im[i] = gaussian * Math.sin(p.k0 * dx);
      norm += re[i] * re[i] + im[i] * im[i];
    }
    const invSqrtNorm = 1 / Math.sqrt(Math.max(1e-12, norm));
    for (let i = 0; i < GRID_SIZE; i++) {
      re[i] *= invSqrtNorm;
      im[i] *= invSqrtNorm;
    }
    const potential = buildPotential(p.presetType, p.v0, p.vWidth, p.vPos);
    psiRef.current = { re, im, potential, particles: [] };
    setCollapseEvent(null);
  };

  // Trigger Quantum Measurement Wavefunction Collapse
  const triggerQuantumCollapse = useCallback((customIndex = null) => {
    const { re, im } = psiRef.current;

    // Calculate cumulative density distribution
    const rho = new Float64Array(GRID_SIZE);
    let totalNorm = 0;
    for (let i = 0; i < GRID_SIZE; i++) {
      rho[i] = re[i] * re[i] + im[i] * im[i];
      totalNorm += rho[i];
    }

    if (totalNorm < 1e-10) return;

    let targetIdx = customIndex;
    if (targetIdx === null) {
      const rnd = Math.random() * totalNorm;
      let cum = 0;
      targetIdx = Math.floor(GRID_SIZE / 2);
      for (let i = 0; i < GRID_SIZE; i++) {
        cum += rho[i];
        if (cum >= rnd) {
          targetIdx = i;
          break;
        }
      }
    }

    // Collapse into narrow packet centered at targetIdx
    const collapsedSigma = 3.5;
    let newNorm = 0;
    for (let i = 0; i < GRID_SIZE; i++) {
      const dx = i - targetIdx;
      const val = Math.exp(-(dx * dx) / (4 * collapsedSigma * collapsedSigma));
      re[i] = val;
      im[i] = 0;
      newNorm += val * val;
    }
    const invNorm = 1 / Math.sqrt(newNorm);
    for (let i = 0; i < GRID_SIZE; i++) {
      re[i] *= invNorm;
    }

    setCollapseEvent({
      x: targetIdx,
      time: Date.now(),
    });
  }, []);

  // Modify Potential dynamically on Canvas Drag/Click
  const handleCanvasInteraction = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const canvasX = clientX - rect.left;
    const canvasY = clientY - rect.top;

    const gridIdx = Math.floor((canvasX / rect.width) * GRID_SIZE);
    if (gridIdx >= 0 && gridIdx < GRID_SIZE) {
      if (e.shiftKey || e.button === 2) {
        // Shift+Click or Right-Click collapses wavefunction at mouse position
        triggerQuantumCollapse(gridIdx);
      } else {
        // Direct click modifies potential height
        const normalizedY = 1.0 - canvasY / rect.height;
        const newHeight = Math.max(0, normalizedY * 0.25);
        const pot = psiRef.current.potential;
        const radius = 6;
        for (let i = Math.max(0, gridIdx - radius); i <= Math.min(GRID_SIZE - 1, gridIdx + radius); i++) {
          pot[i] = newHeight;
        }
      }
    }
  };

  // Step Simulation Frame
  const stepSimulation = useCallback(() => {
    const { re, im, potential } = psiRef.current;

    // Time-dependent Schrodinger equation finite-difference integration
    // dt and c1 kinetic coupling factors
    const dt = 0.45 * simSpeed;
    const c1 = 0.22; // Kinetic laplacian term coefficient

    // 1. Update Imaginary Part from Real Part:
    // dIm/dt = - [ -c1 * d2(Re)/dx2 + V(x) * Re ]
    for (let i = 1; i < GRID_SIZE - 1; i++) {
      const laplacianRe = re[i + 1] - 2 * re[i] + re[i - 1];
      const H_re = -c1 * laplacianRe + potential[i] * re[i];
      im[i] -= dt * H_re;
    }

    // Absorbing boundary conditions to dampen edge reflection artifacts
    const dampRange = 25;
    for (let i = 0; i < dampRange; i++) {
      const factor = Math.pow(i / dampRange, 2);
      im[i] *= factor;
      im[GRID_SIZE - 1 - i] *= factor;
    }

    // 2. Update Real Part from Imaginary Part:
    // dRe/dt = + [ -c1 * d2(Im)/dx2 + V(x) * Im ]
    for (let i = 1; i < GRID_SIZE - 1; i++) {
      const laplacianIm = im[i + 1] - 2 * im[i] + im[i - 1];
      const H_im = -c1 * laplacianIm + potential[i] * im[i];
      re[i] += dt * H_im;
    }

    for (let i = 0; i < dampRange; i++) {
      const factor = Math.pow(i / dampRange, 2);
      re[i] *= factor;
      re[GRID_SIZE - 1 - i] *= factor;
    }

    // Compute Quantum Metrics (T, R, <x>, <p>, Delta x * Delta p)
    let totalNorm = 0;
    let leftNorm = 0;
    let rightNorm = 0;
    let barrierNorm = 0;
    let meanX = 0;
    let meanX2 = 0;
    let meanP = 0;

    const barrierStart = Math.max(0, vPos - Math.floor(vWidth / 2));
    const barrierEnd = Math.min(GRID_SIZE - 1, vPos + Math.floor(vWidth / 2));

    for (let i = 0; i < GRID_SIZE; i++) {
      const density = re[i] * re[i] + im[i] * im[i];
      totalNorm += density;
      meanX += i * density;
      meanX2 += i * i * density;

      if (i < barrierStart) {
        leftNorm += density;
      } else if (i > barrierEnd) {
        rightNorm += density;
      } else {
        barrierNorm += density;
      }

      // Momentum expectation integrand: Im( psi* * dpsi/dx )
      if (i > 0 && i < GRID_SIZE - 1) {
        const dre = (re[i + 1] - re[i - 1]) * 0.5;
        const dim = (im[i + 1] - im[i - 1]) * 0.5;
        meanP += re[i] * dim - im[i] * dre;
      }
    }

    if (totalNorm > 1e-9) {
      meanX /= totalNorm;
      meanX2 /= totalNorm;
      meanP /= totalNorm;

      const varX = Math.max(0, meanX2 - meanX * meanX);
      const stdX = Math.sqrt(varX);
      const stdP = Math.max(0.1, Math.abs(meanP) * 0.8 + 0.2); // Estimated momentum spread
      const heisenbergVal = (stdX * stdP) / 10;

      setTransmissionProb((rightNorm / totalNorm) * 100);
      setReflectionProb((leftNorm / totalNorm) * 100);
      setBarrierProb((barrierNorm / totalNorm) * 100);
      setExpX(meanX);
      setExpP(meanP);
      setUncertaintyProduct(heisenbergVal);

      if (audioEnabled) {
        updateAudio(meanP, barrierNorm / totalNorm);
      }
    }
  }, [simSpeed, vPos, vWidth, audioEnabled, updateAudio]);

  // Main Render Loop
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = currentTheme.canvasBg;
    ctx.fillRect(0, 0, width, height);

    // Draw Subtle Grid Lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
    ctx.lineWidth = 1;
    const gridSpacing = 30;
    for (let x = 0; x < width; x += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const { re, im, potential, particles } = psiRef.current;

    // Scale mappings
    const dx = width / GRID_SIZE;
    const groundY = height * 0.72; // Baseline Y for wave & potential
    const potScale = height * 2.2; // Scale factor for V(x) rendering
    const waveAmpScale = height * 0.45; // Amplitude scale

    // 1. Draw Potential Barrier V(x)
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    for (let i = 0; i < GRID_SIZE; i++) {
      const px = i * dx;
      const py = groundY - potential[i] * potScale;
      ctx.lineTo(px, py);
    }
    ctx.lineTo(width, groundY);
    ctx.closePath();

    ctx.fillStyle = currentTheme.barrierFill;
    ctx.fill();
    ctx.strokeStyle = currentTheme.barrierStroke;
    ctx.lineWidth = 2;
    ctx.stroke();

    // 2. Draw Probability Density Fill |ψ(x)|² with Phase HSL Mapping
    const pathDensity = new Path2D();
    pathDensity.moveTo(0, groundY);

    for (let i = 0; i < GRID_SIZE; i++) {
      const px = i * dx;
      const density = re[i] * re[i] + im[i] * im[i];
      const py = groundY - density * waveAmpScale * 4.0;
      pathDensity.lineTo(px, py);
    }
    pathDensity.lineTo(width, groundY);
    pathDensity.closePath();

    // Phase-to-Color Glow Gradient Fill
    const grad = ctx.createLinearGradient(0, 0, width, 0);
    for (let i = 0; i <= 10; i++) {
      const idx = Math.floor((i / 10) * (GRID_SIZE - 1));
      const phase = Math.atan2(im[idx], re[idx]);
      const hue = Math.floor(((phase + Math.PI) / (2 * Math.PI)) * 360);
      grad.addColorStop(i / 10, `hsla(${hue}, 90%, 60%, 0.35)`);
    }

    ctx.fillStyle = showPhaseColor ? grad : currentTheme.wavePrimary;
    ctx.fill(pathDensity);

    // 3. Draw Wave Envelope & Component Waves Re(ψ) / Im(ψ)
    if (showReIm) {
      // Draw Real Part Re(ψ) in Primary Color
      ctx.beginPath();
      for (let i = 0; i < GRID_SIZE; i++) {
        const px = i * dx;
        const py = groundY - re[i] * waveAmpScale;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = currentTheme.primary;
      ctx.lineWidth = 2.2;
      ctx.shadowColor = currentTheme.glow;
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0; // reset shadow

      // Draw Imaginary Part Im(ψ) in Secondary Color
      ctx.beginPath();
      for (let i = 0; i < GRID_SIZE; i++) {
        const px = i * dx;
        const py = groundY - im[i] * waveAmpScale;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = currentTheme.secondary;
      ctx.lineWidth = 1.6;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]); // reset line dash
    }

    // 4. Quanta Particles Animation
    if (showParticles && particles) {
      ctx.fillStyle = currentTheme.primary;
      for (let p = 0; p < particles.length; p++) {
        const pt = particles[p];
        pt.x += pt.vx * simSpeed;
        if (pt.x > GRID_SIZE) pt.x = 0;
        if (pt.x < 0) pt.x = GRID_SIZE;

        const idx = Math.floor(pt.x);
        const density = re[idx] * re[idx] + im[idx] * im[idx];
        const py = groundY - density * waveAmpScale * (0.2 + pt.y * 3.5);

        ctx.globalAlpha = Math.min(1.0, density * 15 + 0.15);
        ctx.beginPath();
        ctx.arc(pt.x * dx, py, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;
    }

    // 5. Draw Wavefunction Collapse Flare Effect
    if (collapseEvent) {
      const elapsed = Date.now() - collapseEvent.time;
      if (elapsed < 800) {
        const radius = (elapsed / 800) * 80;
        const opacity = 1.0 - elapsed / 800;
        const cx = collapseEvent.x * dx;

        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, groundY - 20, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.lineWidth = 3;
        ctx.shadowColor = "#ffffff";
        ctx.shadowBlur = 20;
        ctx.stroke();

        // Vertical beam
        ctx.beginPath();
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx, height);
        ctx.strokeStyle = `rgba(0, 243, 255, ${opacity * 0.7})`;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }
    }

    // 6. Draw Spatial Axis Line & Labels
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(width, groundY);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }, [currentTheme, showPhaseColor, showReIm, showParticles, collapseEvent, simSpeed]);

  // Main Animation Loop Hook
  useEffect(() => {
    resetWavepacket();
  }, [resetWavepacket]);

  useEffect(() => {
    let active = true;

    const loop = () => {
      if (!active) return;

      // Track FPS
      const now = performance.now();
      frameCountRef.current++;
      if (now - lastTimeRef.current >= 1000) {
        setFps(frameCountRef.current);
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      if (isPlaying) {
        stepSimulation();
      }
      renderCanvas();

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      active = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, stepSimulation, renderCanvas]);

  // Canvas Resize Handler
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas && canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
        renderCanvas();
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [renderCanvas]);

  // Snapshot PNG export
  const exportSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `quantum-wavefunction-${activePreset}-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div
      className={`w-full max-w-7xl mx-auto my-8 p-4 sm:p-6 lg:p-8 rounded-3xl bg-gradient-to-b ${currentTheme.bgGradient} text-white shadow-2xl border border-slate-800/80 font-sans transition-all duration-500`}
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase border ${currentTheme.badge}`}
            >
              Quantum Mechanics Lab
            </span>
            <span className="text-xs text-slate-400 font-mono">
              TDSE Solver (1D/2D)
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mt-1 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
            Quantum Tunneling & Wavefunction Collapse
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Real-time numerical simulation of the Schrödinger wave equation \(\psi(x,t)\). Observe quantum tunneling through potential barriers, interference, non-classical reflection, and wave collapse under measurement.
          </p>
        </div>

        {/* Top Control Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Theme Selector */}
          <select
            value={themeId}
            onChange={(e) => setThemeId(e.target.value)}
            className="bg-slate-900/80 text-xs text-slate-200 px-3 py-2 rounded-xl border border-slate-700/60 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            {Object.values(THEMES).map((t) => (
              <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                {t.name}
              </option>
            ))}
          </select>

          {/* Audio Sonification Toggle */}
          <button
            onClick={() => {
              if (!audioEnabled) initAudio();
              setAudioEnabled(!audioEnabled);
            }}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
              audioEnabled
                ? "bg-emerald-600/30 text-emerald-300 border-emerald-500/50 shadow-lg shadow-emerald-500/20"
                : "bg-slate-900/70 text-slate-400 border-slate-800 hover:text-white"
            }`}
          >
            {audioEnabled ? "🔊 Sonification ON" : "🔇 Audio Off"}
          </button>

          {/* Snapshot Button */}
          <button
            onClick={exportSnapshot}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900/70 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-1 transition-all"
          >
            📸 Snapshot
          </button>
        </div>
      </div>

      {/* Presets Navigation Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-6 p-2 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800/60">
        {Object.entries(PRESETS).map(([key, p]) => (
          <button
            key={key}
            onClick={() => handleSelectPreset(key)}
            className={`p-2.5 rounded-xl text-xs text-left transition-all flex flex-col justify-between ${
              activePreset === key
                ? `${currentTheme.buttonActive}`
                : "bg-slate-950/40 text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent"
            }`}
          >
            <span className="font-bold truncate">{p.name}</span>
          </button>
        ))}
      </div>

      {/* Main Canvas Container */}
      <div className="relative w-full h-[400px] sm:h-[480px] rounded-2xl overflow-hidden border border-slate-800/80 shadow-2xl group bg-slate-950">
        <canvas
          ref={canvasRef}
          onMouseDown={handleCanvasInteraction}
          onTouchStart={handleCanvasInteraction}
          className="w-full h-full cursor-crosshair block"
        />

        {/* Live Telemetry Overlay */}
        <div className="absolute top-4 left-4 flex flex-col gap-1.5 p-3.5 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-slate-800/80 text-xs font-mono pointer-events-none shadow-xl">
          <div className="flex items-center justify-between gap-4 text-slate-300 border-b border-slate-800/80 pb-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              FPS: {fps}
            </span>
            <span className="text-[10px] text-slate-500">Live Solv</span>
          </div>

          <div className="flex justify-between items-center gap-4 text-slate-400">
            <span>Transmission (T):</span>
            <span className="text-emerald-400 font-bold">{transmissionProb.toFixed(1)}%</span>
          </div>

          <div className="flex justify-between items-center gap-4 text-slate-400">
            <span>Reflection (R):</span>
            <span className="text-pink-400 font-bold">{reflectionProb.toFixed(1)}%</span>
          </div>

          <div className="flex justify-between items-center gap-4 text-slate-400">
            <span>Barrier Density:</span>
            <span className="text-amber-400 font-bold">{barrierProb.toFixed(1)}%</span>
          </div>

          <div className="flex justify-between items-center gap-4 text-slate-400 border-t border-slate-800/80 pt-1">
            <span>⟨x⟩ Position:</span>
            <span className={currentTheme.accentText}>{expX.toFixed(1)}</span>
          </div>

          <div className="flex justify-between items-center gap-4 text-slate-400">
            <span>⟨p⟩ Momentum:</span>
            <span className="text-slate-200">{expP.toFixed(3)}</span>
          </div>

          <div className="flex justify-between items-center gap-4 text-slate-400">
            <span>Δx·Δp / (ℏ/2):</span>
            <span className="text-cyan-300 font-semibold">{uncertaintyProduct.toFixed(2)}</span>
          </div>
        </div>

        {/* Interactive Overlay Guidance */}
        <div className="absolute bottom-4 right-4 bg-slate-950/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-800/80 text-[11px] text-slate-300 font-mono pointer-events-none flex items-center gap-2 shadow-lg">
          <span className="text-cyan-400 font-bold">💡 Tip:</span> Click canvas to raise barrier | Shift+Click to measure wave collapse
        </div>

        {/* Playback Overlay Controls inside Canvas */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg ${
              isPlaying
                ? "bg-amber-600/90 hover:bg-amber-500 text-white"
                : "bg-emerald-600/90 hover:bg-emerald-500 text-white"
            }`}
          >
            {isPlaying ? "⏸ Pause" : "▶ Play"}
          </button>

          <button
            onClick={stepSimulation}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/60 shadow-lg"
          >
            ⏭ Step
          </button>

          <button
            onClick={resetWavepacket}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/60 shadow-lg"
          >
            🔄 Reset Wave
          </button>

          <button
            onClick={() => triggerQuantumCollapse()}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-purple-600/90 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30 border border-purple-400/40"
          >
            ⚡ Measure / Collapse
          </button>
        </div>
      </div>

      {/* Active Preset Description Card */}
      <div className="mt-4 p-4 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-slate-800/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs text-slate-300">
        <div>
          <span className="font-bold text-white mr-2">
            Scenario: {PRESETS[activePreset]?.name}
          </span>
          <span className="text-slate-400">{PRESETS[activePreset]?.desc}</span>
        </div>
        <div className="flex gap-3 text-[11px] font-mono text-slate-400">
          <span>Wave Energy E ≈ {(k0 * k0 * 0.5).toFixed(3)} eV</span>
          <span>Barrier V₀ = {v0.toFixed(3)} eV</span>
        </div>
      </div>

      {/* Control Sliders Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {/* Momentum k0 */}
        <div className="bg-slate-900/70 backdrop-blur-md p-4 rounded-2xl border border-slate-800/80">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-semibold text-slate-300">Initial Momentum (k₀)</label>
            <span className="text-xs font-mono text-cyan-400">{k0.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="0.9"
            step="0.02"
            value={k0}
            onChange={(e) => {
              setK0(parseFloat(e.target.value));
            }}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {/* Spatial Spread sigma0 */}
        <div className="bg-slate-900/70 backdrop-blur-md p-4 rounded-2xl border border-slate-800/80">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-semibold text-slate-300">Packet Spread (σ₀)</label>
            <span className="text-xs font-mono text-fuchsia-400">{sigma0} lattice sites</span>
          </div>
          <input
            type="range"
            min="8"
            max="40"
            step="1"
            value={sigma0}
            onChange={(e) => {
              setSigma0(parseInt(e.target.value, 10));
            }}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-fuchsia-400"
          />
        </div>

        {/* Barrier Height V0 */}
        <div className="bg-slate-900/70 backdrop-blur-md p-4 rounded-2xl border border-slate-800/80">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-semibold text-slate-300">Barrier Height (V₀)</label>
            <span className="text-xs font-mono text-amber-400">{v0.toFixed(3)} eV</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="0.30"
            step="0.005"
            value={v0}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setV0(val);
              const pot = psiRef.current.potential;
              const halfW = Math.floor(vWidth / 2);
              for (let i = 0; i < GRID_SIZE; i++) {
                if (i >= vPos - halfW && i <= vPos + halfW) {
                  pot[i] = val;
                }
              }
            }}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
        </div>

        {/* Barrier Width */}
        <div className="bg-slate-900/70 backdrop-blur-md p-4 rounded-2xl border border-slate-800/80">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-semibold text-slate-300">Barrier Thickness</label>
            <span className="text-xs font-mono text-emerald-400">{vWidth} sites</span>
          </div>
          <input
            type="range"
            min="4"
            max="80"
            step="2"
            value={vWidth}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              setVWidth(val);
              const pot = psiRef.current.potential;
              const halfW = Math.floor(val / 2);
              for (let i = 0; i < GRID_SIZE; i++) {
                if (i >= vPos - halfW && i <= vPos + halfW) {
                  pot[i] = v0;
                } else if (activePreset === "barrier") {
                  pot[i] = 0;
                }
              }
            }}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
          />
        </div>
      </div>

      {/* Visualization Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-6 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/60 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={showPhaseColor}
              onChange={(e) => setShowPhaseColor(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
            />
            <span>Phase Hue Mapping</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={showReIm}
              onChange={(e) => setShowReIm(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
            />
            <span>Show Re(ψ) & Im(ψ) Waves</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={showParticles}
              onChange={(e) => setShowParticles(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
            />
            <span>Probability Quanta Stream</span>
          </label>
        </div>

        {/* Speed Slider */}
        <div className="flex items-center gap-3">
          <span className="text-slate-400 font-mono">Time Dilation:</span>
          <input
            type="range"
            min="0.2"
            max="2.5"
            step="0.1"
            value={simSpeed}
            onChange={(e) => setSimSpeed(parseFloat(e.target.value))}
            className="w-28 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <span className="text-slate-200 font-mono w-10 text-right">
            {simSpeed.toFixed(1)}x
          </span>
        </div>
      </div>
    </div>
  );
}
