import React, { useState, useEffect, useRef, useCallback } from "react";

// Color Themes & Design System Tokens
const THEMES = {
  magnetarViolet: {
    id: "magnetarViolet",
    name: "Magnetar Violet (Ultra-High B-Field)",
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    accentText: "text-purple-400",
    border: "border-purple-500/30",
    cardBg: "bg-slate-900/85 backdrop-blur-md border-purple-500/20",
    buttonBg: "bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white shadow-lg shadow-purple-500/25",
    canvasBg: "#090314",
    starCore: "#f5d0fe",
    starCrust: "#3b0764",
    fieldPositive: "#c084fc",
    fieldNegative: "#f0abfc",
    stressHotspot: "#ff007f",
    fireballGlow: "rgba(240, 171, 252, 0.9)",
    gridColor: "rgba(192, 132, 252, 0.08)",
  },
  magmaAmber: {
    id: "magmaAmber",
    name: "Crustal Magma (Amber / Solar Gold)",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    accentText: "text-amber-400",
    border: "border-amber-500/30",
    cardBg: "bg-slate-900/85 backdrop-blur-md border-amber-500/20",
    buttonBg: "bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white shadow-lg shadow-amber-500/25",
    canvasBg: "#120802",
    starCore: "#fef08a",
    starCrust: "#78350f",
    fieldPositive: "#fbbf24",
    fieldNegative: "#f43f5e",
    stressHotspot: "#ff3300",
    fireballGlow: "rgba(251, 191, 36, 0.9)",
    gridColor: "rgba(251, 191, 36, 0.08)",
  },
  relativisticCyan: {
    id: "relativisticCyan",
    name: "Relativistic Synchrotron (Cyan / Blue)",
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    accentText: "text-cyan-400",
    border: "border-cyan-500/30",
    cardBg: "bg-slate-900/85 backdrop-blur-md border-cyan-500/20",
    buttonBg: "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25",
    canvasBg: "#020a14",
    starCore: "#bae6fd",
    starCrust: "#0c4a6e",
    fieldPositive: "#38bdf8",
    fieldNegative: "#60a5fa",
    stressHotspot: "#00f0ff",
    fireballGlow: "rgba(56, 189, 248, 0.9)",
    gridColor: "rgba(56, 189, 248, 0.08)",
  },
  quarkCrimson: {
    id: "quarkCrimson",
    name: "Quark-Core Degeneracy (Ruby / Rose)",
    badge: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    accentText: "text-rose-400",
    border: "border-rose-500/30",
    cardBg: "bg-slate-900/85 backdrop-blur-md border-rose-500/20",
    buttonBg: "bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-lg shadow-rose-500/25",
    canvasBg: "#140306",
    starCore: "#fecdd3",
    starCrust: "#881337",
    fieldPositive: "#fb7185",
    fieldNegative: "#e11d48",
    stressHotspot: "#ff0033",
    fireballGlow: "rgba(251, 113, 133, 0.9)",
    gridColor: "rgba(251, 113, 133, 0.08)",
  },
};

// Astrophysically Motivated Presets
const PRESETS = {
  sgr1806: {
    id: "sgr1806",
    name: "⚡ SGR 1806-20 Ultra-Giant Flare",
    subtitle: "Record-Breaking 2004 Magnetar Flare ($10^{39}\\text{ J}$ Burst)",
    formula: "B_0 = 10^{15}\\text{ G} | E_{\\text{flare}} = 5\\times 10^{46}\\text{ erg} | \\Delta B / B \\sim 10\\%",
    desc: "Catastrophic global crustal rupture releasing massive magnetic helicity into the magnetosphere, triggering an ultra-relativistic pair fireball and intense gamma-ray burst.",
    bField: 15.0,
    shearModulus: 3.8,
    stressAccumulationRate: 1.8,
    yieldThreshold: 75,
    fireballSpeed: 4.2,
  },
  sgr1900: {
    id: "sgr1900",
    name: "🌋 SGR 1900+14 Localized Crust Fracture",
    subtitle: "Shear Wave Propagation & Magnetospheric Reconnection",
    formula: "B_0 = 8.5\\times 10^{14}\\text{ G} | f_{\\text{QPO}} = 84\\text{ Hz} | \\nu_{\\text{shear}} \\sim 1.2\\text{ km/s}",
    desc: "Elastic strain builds in the solid nuclear crust lattice until localized plastic yield causes shear fractures and quasi-periodic seismic oscillations (QPO).",
    bField: 8.5,
    shearModulus: 2.5,
    stressAccumulationRate: 1.2,
    yieldThreshold: 60,
    fireballSpeed: 2.8,
  },
  velaGlitch: {
    id: "velaGlitch",
    name: "💫 Vela Pulsar Core-Crust Glitch",
    subtitle: "Superfluid Vortex Unpinning & Angular Momentum Transfer",
    formula: "\\Delta \\Omega / \\Omega \\sim 10^{-6} | I_{\\text{sf}} / I_{\\text{tot}} \\sim 1\\% | \\tau_{\\text{glitch}} < 30\\text{ s}",
    desc: "Unpinning of quantized vortex lines in the internal neutron superfluid transfers rotational momentum to the outer crust, inducing abrupt spin-up glitches.",
    bField: 3.5,
    shearModulus: 4.5,
    stressAccumulationRate: 0.8,
    yieldThreshold: 45,
    fireballSpeed: 1.5,
  },
  magnetoTwist: {
    id: "magnetoTwist",
    name: "🌀 Magnetospheric Helical Twist",
    subtitle: "Force-Free Twisted Dipole & Field Line Snapping",
    formula: "\\nabla \\times \\mathbf{B} = \\alpha \\mathbf{B} | I_{\\text{poloidal}} \\rightarrow I_{\\text{toroidal}}",
    desc: "Crustal motion twists the exterior magnetosphere into a sheared force-free state. Excessive current density drives tearing instability and field line reconnection.",
    bField: 12.0,
    shearModulus: 1.8,
    stressAccumulationRate: 2.2,
    yieldThreshold: 80,
    fireballSpeed: 3.5,
  },
};

export default function MagnetarStarquakeStudio() {
  // Theme & Preset State
  const [themeId, setThemeId] = useState("magnetarViolet");
  const [presetId, setPresetId] = useState("sgr1806");

  // Physics Control Parameters
  const [bField, setBField] = useState(PRESETS.sgr1806.bField); // 10^14 Gauss
  const [shearModulus, setShearModulus] = useState(PRESETS.sgr1806.shearModulus); // 10^30 dyn/cm^2
  const [stressAccumulationRate, setStressAccumulationRate] = useState(PRESETS.sgr1806.stressAccumulationRate);
  const [yieldThreshold, setYieldThreshold] = useState(PRESETS.sgr1806.yieldThreshold);
  const [fireballSpeed, setFireballSpeed] = useState(PRESETS.sgr1806.fireballSpeed);

  // Toggles & Controls
  const [showTopology, setShowTopology] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showFireball, setShowFireball] = useState(true);
  const [showParticles, setShowParticles] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [simSpeed, setSimSpeed] = useState(1.0);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState("simulation"); // simulation, analytics, physics, guide

  // Dynamic Telemetry & Quake Simulation State
  const [strainLevel, setStrainLevel] = useState(25.0); // 0 to 100%
  const [isQuaking, setIsQuaking] = useState(false);
  const [quakeProgress, setQuakeProgress] = useState(0); // 0 to 1
  const [flareEnergy, setFlareEnergy] = useState(0);
  const [qpoFreq, setQpoFreq] = useState(84);
  const [grbHistory, setGrbHistory] = useState(() => Array(40).fill(0.05));
  const [totalFlares, setTotalFlares] = useState(1);

  // Refs for Animation & Audio
  const canvasRef = useRef(null);
  const audioCtxRef = useRef(null);
  const animFrameRef = useRef(null);
  const rotationAngleRef = useRef(0);
  const magneticTwistAngleRef = useRef(0);
  const particlesRef = useRef([]);
  const shockwavesRef = useRef([]);
  const userInteractionRef = useRef({ isDragging: false, lastX: 0, lastY: 0 });

  const theme = THEMES[themeId];
  const preset = PRESETS[presetId];

  // Apply Preset Values
  const handleApplyPreset = (pId) => {
    const p = PRESETS[pId];
    setPresetId(pId);
    setBField(p.bField);
    setShearModulus(p.shearModulus);
    setStressAccumulationRate(p.stressAccumulationRate);
    setYieldThreshold(p.yieldThreshold);
    setFireballSpeed(p.fireballSpeed);
    setStrainLevel(20);
    setIsQuaking(false);
  };

  // Trigger Instant Quake Burst
  const triggerStarquake = useCallback((clickX = null, clickY = null) => {
    setIsQuaking(true);
    setQuakeProgress(0);
    setStrainLevel(5); // Release accumulated elastic stress
    setTotalFlares((prev) => prev + 1);

    // Calculate energy release: E = (1/8pi) * B^2 * V * (strain release)
    const baseEnergy = Math.pow(bField * 1e14, 2) / (8 * Math.PI) * 1e18;
    const releasedJoules = (baseEnergy / 1e30).toFixed(2);
    setFlareEnergy(releasedJoules);

    // Calculate QPO Frequency: f = v_shear / 2R
    const computedQpo = Math.round(30 + bField * 4.5 + shearModulus * 12.0);
    setQpoFreq(computedQpo);

    // Spawn Shockwaves & Particles
    const shockOrigin = clickX !== null && clickY !== null ? { x: clickX, y: clickY } : { x: 0, y: 0 };
    shockwavesRef.current.push({
      x: shockOrigin.x,
      y: shockOrigin.y,
      radius: 20,
      maxRadius: 280 + fireballSpeed * 30,
      opacity: 1.0,
    });

    // Generate Relativistic Pair Plasma Particles
    const particleCount = 120;
    const newParticles = [];
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (2 + Math.random() * 6) * fireballSpeed;
      newParticles.push({
        x: shockOrigin.x,
        y: shockOrigin.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        decay: 0.01 + Math.random() * 0.02,
        color: Math.random() > 0.4 ? theme.fieldPositive : theme.stressHotspot,
        size: 1.5 + Math.random() * 3.5,
      });
    }
    particlesRef.current = newParticles;

    // Trigger Audio Sound Effect
    if (audioEnabled && audioCtxRef.current) {
      try {
        const ctx = audioCtxRef.current;
        if (ctx.state === "suspended") ctx.resume();

        // Low Seismic Sub-Bass Burst Oscillator
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.6);
        gain.gain.setValueAtTime(0.35, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);

        // High Frequency Gamma-Ray Chirp
        const chirpOsc = ctx.createOscillator();
        const chirpGain = ctx.createGain();
        chirpOsc.type = "sine";
        chirpOsc.frequency.setValueAtTime(800 + computedQpo * 3, ctx.currentTime);
        chirpOsc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.4);
        chirpGain.gain.setValueAtTime(0.2, ctx.currentTime);
        chirpGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        chirpOsc.connect(chirpGain);
        chirpGain.connect(ctx.destination);
        chirpOsc.start();
        chirpOsc.stop(ctx.currentTime + 0.4);
      } catch (e) {
        console.error("Audio trigger error", e);
      }
    }
  }, [bField, shearModulus, fireballSpeed, theme, audioEnabled]);

  // Audio Context Initialization
  useEffect(() => {
    if (audioEnabled && !audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
  }, [audioEnabled]);

  // Main Canvas Rendering Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let animationFrameId;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const starRadius = Math.min(width, height) * 0.22;

      // Update Rotation
      if (isPlaying) {
        rotationAngleRef.current += 0.008 * simSpeed;

        // Accumulate strain over time
        setStrainLevel((prev) => {
          const next = prev + 0.08 * stressAccumulationRate * simSpeed;
          if (next >= yieldThreshold && !isQuaking) {
            triggerStarquake(0, 0);
            return 5;
          }
          return Math.min(next, 100);
        });

        // Update Quake Progress
        if (isQuaking) {
          setQuakeProgress((prev) => {
            if (prev >= 1) {
              setIsQuaking(false);
              return 0;
            }
            return prev + 0.02 * simSpeed;
          });
        }

        // Update Telemetry GRB sparkline history
        setGrbHistory((prev) => {
          const nextVal = isQuaking
            ? Math.min(1.0, 0.2 + (1 - quakeProgress) * 0.8 + Math.random() * 0.1)
            : Math.max(0.03, strainLevel / 350 + Math.random() * 0.04);
          return [...prev.slice(1), nextVal];
        });
      }

      // 1. Draw Space Background & Grid
      ctx.fillStyle = theme.canvasBg;
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = theme.gridColor;
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      ctx.save();
      ctx.translate(centerX, centerY);

      // 2. Draw Magnetic Field Line Topology Loops
      if (showTopology) {
        const loopCount = 10;
        const twist = magneticTwistAngleRef.current;
        for (let i = 0; i < loopCount; i++) {
          const angleOffset = (i / loopCount) * Math.PI * 2 + rotationAngleRef.current * 0.4;
          const loopScale = starRadius * (1.5 + (i % 3) * 0.4 + (bField / 20) * 0.8);

          ctx.beginPath();
          ctx.strokeStyle = i % 2 === 0 ? theme.fieldPositive : theme.fieldNegative;
          ctx.lineWidth = 1.2 + (i % 2 === 0 ? 0.8 : 0);
          ctx.globalAlpha = 0.4 + 0.3 * Math.sin(rotationAngleRef.current * 2 + i);

          // Bezier Magnetic Dipole Field Arc with Helical Twist
          const startX = Math.cos(angleOffset) * starRadius * 0.9;
          const startY = Math.sin(angleOffset) * starRadius * 0.9;
          const endX = Math.cos(angleOffset + Math.PI + twist) * starRadius * 0.9;
          const endY = Math.sin(angleOffset + Math.PI + twist) * starRadius * 0.9;

          const cp1x = Math.cos(angleOffset + 0.8 + twist) * loopScale;
          const cp1y = Math.sin(angleOffset + 0.8 + twist) * loopScale;
          const cp2x = Math.cos(angleOffset + Math.PI - 0.8) * loopScale;
          const cp2y = Math.sin(angleOffset + Math.PI - 0.8) * loopScale;

          ctx.moveTo(startX, startY);
          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
          ctx.stroke();
        }
        ctx.globalAlpha = 1.0;
      }

      // 3. Draw Relativistic Fireball Outer Atmosphere Halo
      if (showFireball || isQuaking) {
        const haloRadius = starRadius * (1.1 + (isQuaking ? (1 - quakeProgress) * 0.6 : strainLevel / 400));
        const grad = ctx.createRadialGradient(0, 0, starRadius * 0.8, 0, 0, haloRadius * 1.6);
        grad.addColorStop(0, theme.starCore);
        grad.addColorStop(0.4, theme.fireballGlow);
        grad.addColorStop(1, "transparent");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, haloRadius * 1.6, 0, Math.PI * 2);
        ctx.fill();
      }

      // 4. Draw Neutron Star Base Sphere Body
      ctx.beginPath();
      ctx.arc(0, 0, starRadius, 0, Math.PI * 2);
      ctx.fillStyle = theme.starCrust;
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = theme.fieldPositive;
      ctx.stroke();

      // 5. Draw Crust Latitude/Longitude Lattice & Stress Heatmap
      ctx.save();
      ctx.rotate(rotationAngleRef.current);

      // Latitudinal Crust Lines
      for (let lat = -60; lat <= 60; lat += 20) {
        const rad = (lat * Math.PI) / 180;
        const rLat = starRadius * Math.cos(rad);
        const yLat = starRadius * Math.sin(rad);

        ctx.beginPath();
        ctx.ellipse(0, yLat, rLat, rLat * 0.3, 0, 0, Math.PI * 2);
        ctx.strokeStyle = theme.gridColor;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Longitudal Crust Grid Lines
      for (let lon = 0; lon < 180; lon += 30) {
        const rad = (lon * Math.PI) / 180;
        ctx.beginPath();
        ctx.ellipse(0, 0, starRadius * Math.cos(rad), starRadius, rad, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
        ctx.stroke();
      }

      // Crust Stress Heatmap Hotspots
      if (showHeatmap) {
        const hotspotCount = 6;
        for (let h = 0; h < hotspotCount; h++) {
          const hAngle = (h / hotspotCount) * Math.PI * 2;
          const hDist = starRadius * 0.65;
          const hX = Math.cos(hAngle) * hDist;
          const hY = Math.sin(hAngle) * hDist;

          const heatIntensity = Math.min(1.0, (strainLevel / 100) * (0.6 + 0.4 * Math.sin(h * 2)));
          const heatGrad = ctx.createRadialGradient(hX, hY, 2, hX, hY, 25 + strainLevel * 0.2);
          heatGrad.addColorStop(0, theme.stressHotspot);
          heatGrad.addColorStop(0.5, `rgba(255, 50, 100, ${heatIntensity * 0.7})`);
          heatGrad.addColorStop(1, "transparent");

          ctx.fillStyle = heatGrad;
          ctx.beginPath();
          ctx.arc(hX, hY, 30 + strainLevel * 0.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Core Degenerate Glowing Center
      const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, starRadius * 0.45);
      coreGrad.addColorStop(0, "#ffffff");
      coreGrad.addColorStop(0.4, theme.starCore);
      coreGrad.addColorStop(1, "transparent");
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(0, 0, starRadius * 0.45, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore(); // Restore Rotation

      // 6. Draw Shockwaves & Seismic Shear Wave Ripples
      shockwavesRef.current.forEach((sw, index) => {
        sw.radius += (4 + fireballSpeed * 2) * simSpeed;
        sw.opacity -= 0.015 * simSpeed;

        if (sw.opacity > 0) {
          ctx.save();
          ctx.translate(sw.x, sw.y);
          ctx.beginPath();
          ctx.arc(0, 0, sw.radius, 0, Math.PI * 2);
          ctx.strokeStyle = theme.stressHotspot;
          ctx.lineWidth = 3.5;
          ctx.globalAlpha = sw.opacity;
          ctx.shadowColor = theme.stressHotspot;
          ctx.shadowBlur = 12;
          ctx.stroke();

          // Secondary Inner P-Wave
          ctx.beginPath();
          ctx.arc(0, 0, sw.radius * 0.65, 0, Math.PI * 2);
          ctx.strokeStyle = theme.starCore;
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.restore();
        }
      });
      shockwavesRef.current = shockwavesRef.current.filter((sw) => sw.opacity > 0);

      // 7. Draw Relativistic Pair Plasma Particles
      if (showParticles && particlesRef.current.length > 0) {
        particlesRef.current.forEach((p) => {
          p.x += p.vx * simSpeed;
          p.y += p.vy * simSpeed;
          p.life -= p.decay * simSpeed;

          if (p.life > 0) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 8;
            ctx.fill();
          }
        });
        particlesRef.current = particlesRef.current.filter((p) => p.life > 0);
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
      }

      ctx.restore(); // Restore Translation

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    theme,
    bField,
    shearModulus,
    stressAccumulationRate,
    yieldThreshold,
    fireballSpeed,
    showTopology,
    showHeatmap,
    showFireball,
    showParticles,
    isPlaying,
    simSpeed,
    isQuaking,
    strainLevel,
    quakeProgress,
    triggerStarquake,
  ]);

  // Canvas Mouse Interactions (Click to Fracture Crust & Drag to Twist B-Field)
  const handleCanvasMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left - canvas.width / 2;
    const clickY = e.clientY - rect.top - canvas.height / 2;

    userInteractionRef.current = {
      isDragging: true,
      lastX: e.clientX,
      lastY: e.clientY,
    };

    // If clicked within neutron star radius, trigger localized crustal fracture
    const starRadius = Math.min(canvas.width, canvas.height) * 0.22;
    const distFromCenter = Math.sqrt(clickX * clickX + clickY * clickY);

    if (distFromCenter <= starRadius * 1.2) {
      triggerStarquake(clickX, clickY);
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (!userInteractionRef.current.isDragging) return;
    const deltaX = e.clientX - userInteractionRef.current.lastX;
    userInteractionRef.current.lastX = e.clientX;
    userInteractionRef.current.lastY = e.clientY;

    magneticTwistAngleRef.current += deltaX * 0.01;
  };

  const handleCanvasMouseUp = () => {
    userInteractionRef.current.isDragging = false;
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 space-y-6 font-sans text-slate-100">
      {/* Top Header Banner */}
      <div className={`p-6 rounded-2xl ${theme.cardBg} border ${theme.border} shadow-2xl relative overflow-hidden`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 relative">
          <div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${theme.badge}`}>
                ASTROPHYSICS & PLASMA LAB
              </span>
              <span className="text-xs text-slate-400 font-mono">v3.8 Relativistic MHD</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight mt-2 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Magnetar Starquake & Giant Flare Studio
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Simulate magnetospheric helicity twists, crustal plastic yield fractures, quasi-periodic seismic oscillations (QPO), and relativistic gamma-ray fireball bursts in extreme magnetic fields ($B_0 \sim 10^{15}\text{ Gauss}$).
            </p>
          </div>

          {/* Quick Action Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                isPlaying
                  ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30"
              }`}
            >
              {isPlaying ? "Pause Simulation" : "Resume Simulation"}
            </button>
            <button
              onClick={() => triggerStarquake()}
              className={`px-5 py-2 text-sm font-bold rounded-xl ${theme.buttonBg} transition-all transform active:scale-95`}
            >
              💥 Trigger Starquake
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="flex items-center border-b border-slate-800 space-x-2">
        {[
          { id: "simulation", label: "🔭 Interactive Studio", icon: "🌌" },
          { id: "analytics", label: "📊 Telemetry & GRB Analytics", icon: "⚡" },
          { id: "physics", label: "📐 Physics & MHD Equations", icon: "🔬" },
          { id: "guide", label: "📖 Scientific Operator Manual", icon: "📘" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-semibold rounded-t-xl transition-all flex items-center gap-2 border-b-2 ${
              activeTab === tab.id
                ? `${theme.accentText} border-current bg-slate-900/60`
                : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/30"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: INTERACTIVE SIMULATION STUDIO */}
      {activeTab === "simulation" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Canvas Viewport (8 Cols) */}
          <div className={`lg:col-span-8 p-4 rounded-2xl ${theme.cardBg} border ${theme.border} flex flex-col gap-4 relative`}>
            {/* Viewport Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-300 px-2">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isQuaking ? "bg-rose-500 animate-ping" : "bg-emerald-400"}`} />
                  STATE: {isQuaking ? "FLARE BURST ACTIVE" : "STRESS ACCUMULATING"}
                </span>
                <span>B-FIELD: {bField}×10¹⁴ G</span>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showTopology}
                    onChange={(e) => setShowTopology(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-purple-500"
                  />
                  <span>B-Topology</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showHeatmap}
                    onChange={(e) => setShowHeatmap(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-purple-500"
                  />
                  <span>Stress Heatmap</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={audioEnabled}
                    onChange={(e) => setAudioEnabled(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-purple-500"
                  />
                  <span>🔊 Web Audio</span>
                </label>
              </div>
            </div>

            {/* Canvas Element */}
            <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-800 bg-slate-950 group cursor-crosshair">
              <canvas
                ref={canvasRef}
                width={800}
                height={450}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 pointer-events-none">
                💡 Drag mouse to twist magnetic field lines | Click star crust to induce fracture
              </div>
            </div>

            {/* Quick Status Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 font-mono">
                <div className="text-[11px] text-slate-400">CRUSTAL ELASTIC STRAIN</div>
                <div className="text-lg font-bold text-amber-400 mt-0.5">{strainLevel.toFixed(1)}%</div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-amber-400 h-full transition-all duration-300"
                    style={{ width: `${Math.min(100, strainLevel)}%` }}
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 font-mono">
                <div className="text-[11px] text-slate-400">MAGNETIC ENERGY DENSITY</div>
                <div className="text-lg font-bold text-purple-400 mt-0.5">
                  {(Math.pow(bField, 2) * 0.398).toFixed(1)}×10³² erg/cm³
                </div>
                <div className="text-[10px] text-slate-500 mt-1">B²/8π Maxwell Tensor</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 font-mono">
                <div className="text-[11px] text-slate-400">QPO OSCILLATION FREQ</div>
                <div className="text-lg font-bold text-cyan-400 mt-0.5">{qpoFreq} Hz</div>
                <div className="text-[10px] text-slate-500 mt-1">Magneto-Seismic Mode</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 font-mono">
                <div className="text-[11px] text-slate-400">LAST FLARE ENERGY RELEASE</div>
                <div className="text-lg font-bold text-rose-400 mt-0.5">
                  {flareEnergy || "0.00"}×10³⁸ J
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Total Flares: {totalFlares}</div>
              </div>
            </div>
          </div>

          {/* Control Panel Sidebar (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Presets Selector */}
            <div className={`p-4 rounded-2xl ${theme.cardBg} border ${theme.border} space-y-3`}>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                <span>Astrophysical Presets</span>
                <span className="text-xs font-normal text-slate-400">Select Mode</span>
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {Object.values(PRESETS).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleApplyPreset(p.id)}
                    className={`p-3 rounded-xl text-left transition-all border ${
                      presetId === p.id
                        ? `${theme.border} bg-slate-800/90 shadow-md`
                        : "border-slate-800 bg-slate-950/40 hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="font-semibold text-xs text-slate-200">{p.name}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{p.subtitle}</div>
                    <div className="text-[10px] font-mono text-purple-400 mt-1">{p.formula}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Parameter Sliders */}
            <div className={`p-4 rounded-2xl ${theme.cardBg} border ${theme.border} space-y-4`}>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                Physics Parameters
              </h2>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between font-mono text-slate-300 mb-1">
                    <span>Dipole B-Field Strength (B₀):</span>
                    <span className="text-purple-400 font-bold">{bField}×10¹⁴ G</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="25"
                    step="0.5"
                    value={bField}
                    onChange={(e) => setBField(parseFloat(e.target.value))}
                    className="w-full accent-purple-500 bg-slate-800 rounded-lg h-1.5"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-mono text-slate-300 mb-1">
                    <span>Crust Shear Modulus (μ):</span>
                    <span className="text-purple-400 font-bold">{shearModulus}×10³⁰ dyn/cm²</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="6.0"
                    step="0.1"
                    value={shearModulus}
                    onChange={(e) => setShearModulus(parseFloat(e.target.value))}
                    className="w-full accent-purple-500 bg-slate-800 rounded-lg h-1.5"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-mono text-slate-300 mb-1">
                    <span>Stress Accumulation Rate:</span>
                    <span className="text-purple-400 font-bold">{stressAccumulationRate}×</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="4.0"
                    step="0.1"
                    value={stressAccumulationRate}
                    onChange={(e) => setStressAccumulationRate(parseFloat(e.target.value))}
                    className="w-full accent-purple-500 bg-slate-800 rounded-lg h-1.5"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-mono text-slate-300 mb-1">
                    <span>Yield Strain Threshold:</span>
                    <span className="text-purple-400 font-bold">{yieldThreshold}%</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="95"
                    step="5"
                    value={yieldThreshold}
                    onChange={(e) => setYieldThreshold(parseInt(e.target.value))}
                    className="w-full accent-purple-500 bg-slate-800 rounded-lg h-1.5"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-mono text-slate-300 mb-1">
                    <span>Relativistic Expansion Speed:</span>
                    <span className="text-purple-400 font-bold">{fireballSpeed}c</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="5.0"
                    step="0.2"
                    value={fireballSpeed}
                    onChange={(e) => setFireballSpeed(parseFloat(e.target.value))}
                    className="w-full accent-purple-500 bg-slate-800 rounded-lg h-1.5"
                  />
                </div>
              </div>
            </div>

            {/* Aesthetic Theme Switcher */}
            <div className={`p-4 rounded-2xl ${theme.cardBg} border ${theme.border} space-y-3`}>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                Visual Themes
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(THEMES).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setThemeId(t.id)}
                    className={`p-2.5 rounded-xl text-left border text-xs font-semibold transition-all ${
                      themeId === t.id
                        ? `${t.border} bg-slate-800 text-white shadow-md`
                        : "border-slate-800 bg-slate-950/40 text-slate-400 hover:bg-slate-800/40"
                    }`}
                  >
                    {t.name.split(" ")[0]} {t.name.split(" ")[1]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TELEMETRY & ANALYTICS */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* GRB Light Curve Sparkline Chart */}
            <div className={`p-5 rounded-2xl ${theme.cardBg} border ${theme.border} space-y-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-200">Gamma-Ray Burst (GRB) Light Curve</h3>
                  <p className="text-xs text-slate-400">Real-time flux density $\Phi_\gamma(t)$ [photons/cm²/s]</p>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-rose-500/20 text-rose-300 text-xs font-mono">
                  LIVE TELEMETRY
                </span>
              </div>

              <div className="h-44 w-full bg-slate-950 rounded-xl p-3 border border-slate-800 flex items-end gap-1.5">
                {grbHistory.map((val, idx) => (
                  <div
                    key={idx}
                    className="flex-1 bg-gradient-to-t from-purple-600 to-rose-400 rounded-t transition-all duration-150"
                    style={{ height: `${Math.max(5, val * 100)}%` }}
                  />
                ))}
              </div>

              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>-40s (Pre-burst)</span>
                <span>Peak Flare Pulse</span>
                <span>Now (decay phase)</span>
              </div>
            </div>

            {/* Stress-Strain Hysteresis Curve */}
            <div className={`p-5 rounded-2xl ${theme.cardBg} border ${theme.border} space-y-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-200">Crustal Stress-Strain Hysteresis Loop</h3>
                  <p className="text-xs text-slate-400">Hooke Elastic Regime $\rightarrow$ Plastic Failure</p>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-300 text-xs font-mono">
                  LATTICE MECHANICS
                </span>
              </div>

              <div className="h-44 w-full bg-slate-950 rounded-xl p-4 border border-slate-800 relative flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 300 140">
                  {/* Grid Lines */}
                  <line x1="30" y1="120" x2="280" y2="120" stroke="#334155" strokeWidth="1" />
                  <line x1="30" y1="10" x2="30" y2="120" stroke="#334155" strokeWidth="1" />

                  {/* Ideal Elastic Curve */}
                  <path d="M 30 120 Q 120 50 200 40 T 270 110" fill="none" stroke="#64748b" strokeWidth="1.5" strokeDasharray="4 4" />

                  {/* Active Stress Point */}
                  <path
                    d={`M 30 120 Q ${30 + strainLevel * 1.8} ${120 - strainLevel * 0.9} ${30 + strainLevel * 2.2} ${120 - strainLevel * 1.1}`}
                    fill="none"
                    stroke={theme.fieldPositive}
                    strokeWidth="3"
                  />
                  <circle
                    cx={30 + strainLevel * 2.2}
                    cy={120 - strainLevel * 1.1}
                    r="5"
                    fill={theme.stressHotspot}
                  />
                </svg>
              </div>

              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>Strain $\sigma$ [0%]</span>
                <span>Elastic Limit ({yieldThreshold}%)</span>
                <span>Rupture Point</span>
              </div>
            </div>
          </div>

          {/* QPO Power Spectral Density Breakdown */}
          <div className={`p-6 rounded-2xl ${theme.cardBg} border ${theme.border} space-y-4`}>
            <h3 className="font-bold text-slate-200">Quasi-Periodic Oscillation (QPO) Frequency Modes</h3>
            <p className="text-xs text-slate-300">
              Seismic torsional shear waves trapped inside the neutron star crust vibrate at discrete harmonics: $f_n = \frac{n v_s}{2 R}$.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
              {[
                { mode: "n = 1 Fundamental Torsional", freq: `${qpoFreq} Hz`, power: "0.94", desc: "Global crustal shear mode" },
                { mode: "n = 2 First Overtone", freq: `${qpoFreq * 2.1} Hz`, power: "0.62", desc: "Core-crust interface coupling" },
                { mode: "n = 3 High Harmonic", freq: `${qpoFreq * 4.3} Hz`, power: "0.28", desc: "Superfluid vortex lattice mode" },
                { mode: "n = 4 Relativistic Jet Mode", freq: `${qpoFreq * 7.5} Hz`, power: "0.15", desc: "Magnetospheric Poynting flux pulse" },
              ].map((m, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-xs text-purple-400 font-mono font-semibold">{m.mode}</div>
                  <div className="text-xl font-bold text-slate-100">{m.freq}</div>
                  <div className="text-[11px] text-slate-400">Power Density: {m.power}</div>
                  <div className="text-[10px] text-slate-500 pt-1">{m.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PHYSICS & MHD EQUATIONS */}
      {activeTab === "physics" && (
        <div className={`p-6 rounded-2xl ${theme.cardBg} border ${theme.border} space-y-6`}>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Magnetohydrodynamic (MHD) & Crustal Elasticity Equations</h2>
            <p className="text-sm text-slate-300 mt-1">
              Mathematical formulations governing magnetar crust fracture, magnetic helicity release, and force-free magnetospheres.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Maxwell Stress Tensor */}
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-mono text-purple-400 font-semibold">1. MAXWELL STRESS TENSOR</span>
              <h3 className="font-bold text-slate-200">Magnetic Force Density & Stress</h3>
              <div className="p-3 bg-slate-900 rounded-lg text-center font-mono text-sm text-amber-300 overflow-x-auto">
                T_{`{ij}`} = \frac{`{1}`}{`{4\\pi}`} \left( B_i B_j - \frac{`{1}`}{`{2}`} B^2 \delta_{`{ij}`} \right)
              </div>
              <p className="text-xs text-slate-400">
                Magnetic pressure $B^2/8\pi$ exerts intense mechanical stress on the solid outer crust lattice, exceeding the crustal shear yield limit when $B_0 \gtrsim 10^{14}\text{ G}$.
              </p>
            </div>

            {/* Torsional Shear Wave Frequency */}
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-mono text-purple-400 font-semibold">2. SEISMIC TORSIONAL WAVES</span>
              <h3 className="font-bold text-slate-200">Quasi-Periodic Oscillation (QPO) Frequency</h3>
              <div className="p-3 bg-slate-900 rounded-lg text-center font-mono text-sm text-cyan-300 overflow-x-auto">
                f_n = \frac{`{n v_s}`}{`{2 R}`} = \frac{`{n}`}{`{2 R}`} \sqrt{`{\\frac{\\mu}{\\rho}}`}
              </div>
              <p className="text-xs text-slate-400">
                Shear wave speed $v_s$ depends on crust shear modulus $\mu \approx 10^{30}\text{ dyn/cm}^2$ and nuclear mass density $\rho \approx 10^{14}\text{ g/cm}^3$.
              </p>
            </div>

            {/* Magnetic Helicity Energy Injection */}
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-mono text-purple-400 font-semibold">3. MAGNETOSPHERIC HELICITY</span>
              <h3 className="font-bold text-slate-200">Helical Magnetic Twist Conservation</h3>
              <div className="p-3 bg-slate-900 rounded-lg text-center font-mono text-sm text-rose-300 overflow-x-auto">
                H_m = \int_V \mathbf{A} \cdot \mathbf{B} \, dV, \quad \frac{`{dH_m}`}{`{dt}`} = -2 \int (\mathbf{v} \times \mathbf{B}) \cdot \mathbf{A} \, dA
              </div>
              <p className="text-xs text-slate-400">
                Slow crustal motion injects helicity into the force-free magnetosphere ($\nabla \times \mathbf{B} = \alpha \mathbf{B}$) until field lines snap via fast magnetic reconnection.
              </p>
            </div>

            {/* Relativistic Pair Fireball Energy */}
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-mono text-purple-400 font-semibold">4. RELATIVISTIC FIREBALL EXPANSION</span>
              <h3 className="font-bold text-slate-200">Electron-Positron ($e^\pm$) Pair Plasma Burst</h3>
              <div className="p-3 bg-slate-900 rounded-lg text-center font-mono text-sm text-emerald-300 overflow-x-auto">
                E_{`{\\text{flare}}`} = \Gamma M c^2 + \int F_{`{\\text{Poynting}}`} \, dt \approx 10^{`{46}`} \text{ erg}
              </div>
              <p className="text-xs text-slate-400">
                Trapped pair-photon fireball expands with Lorentz factor $\Gamma \gg 100$, producing intense initial gamma-ray spikes followed by a pulsating tail.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SCIENTIFIC OPERATOR MANUAL */}
      {activeTab === "guide" && (
        <div className={`p-6 rounded-2xl ${theme.cardBg} border ${theme.border} space-y-6 text-slate-300 leading-relaxed text-sm`}>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Scientific Operator Guide: Magnetars & Soft Gamma Repeaters</h2>
            <p className="text-xs text-slate-400 mt-1">Understanding neutron star crustal physics and magnetospheric giant flares</p>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-slate-200 text-base">1. What is a Magnetar?</h3>
            <p>
              A <strong>magnetar</strong> is a rare class of isolated neutron stars possessing ultra-strong magnetic fields ($B_0 \sim 10^{14} - 10^{15}\text{ Gauss}$), roughly $1,000$ times stronger than ordinary radio pulsars. Magnetars powered by magnetic decay emit episodic bursts of hard X-rays and soft gamma-rays, cataloged as <em>Soft Gamma Repeaters (SGRs)</em> and <em>Anomalous X-ray Pulsars (AXPs)</em>.
            </p>

            <h3 className="font-bold text-slate-200 text-base">2. Mechanism of a Starquake & Giant Flare</h3>
            <p>
              The outer crust of a magnetar is a solid crystalline lattice composed of heavy iron-group nuclei ($^{56}\text{Fe}, ^{62}\text{Ni}$) enveloped in degenerate electrons. As internal magnetic field lines decay and twist, the <strong>Maxwell stress tensor</strong> exerts intense mechanical shear on this solid crust.
            </p>
            <p>
              When accumulated shear strain exceeds the lattice yield strength ($\sigma_{\text{yield}} \approx 0.1$), the crust suffers a sudden <strong>starquake fracture</strong>. This fracture instantly shifts magnetic footprints on the star surface, driving fast magnetic reconnection in the external magnetosphere and releasing $10^{38} - 10^{46}\text{ ergs}$ of energy in less than a second.
            </p>

            <h3 className="font-bold text-slate-200 text-base">3. How to Use this Studio</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Interactive Starquake Trigger:</strong> Click directly anywhere on the rotating neutron star crust in the canvas to induce a localized fracture at that exact point.</li>
              <li><strong>Magnetic Helicity Shear:</strong> Click and drag horizontally across the viewport to twist the magnetic dipole field loops into a sheared helical state.</li>
              <li><strong>Astrophysical Presets:</strong> Test historical benchmark events including the famed 2004 <em>SGR 1806-20 Ultra-Giant Flare</em> and <em>Vela Pulsar Glitches</em>.</li>
              <li><strong>Web Audio Synthesizer:</strong> Enable audio to hear sub-bass seismic crustal hums paired with high-frequency QPO gamma-ray chirps.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
