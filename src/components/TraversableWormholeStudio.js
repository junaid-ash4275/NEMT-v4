import React, { useState, useEffect, useRef, useCallback } from "react";

// Color Themes & Aesthetic Design Tokens
const THEMES = {
  quantumViolet: {
    id: "quantumViolet",
    name: "Quantum Vacuum (Violet / Fuchsia)",
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    accentText: "text-purple-400",
    border: "border-purple-500/30",
    cardBg: "bg-slate-900/85 backdrop-blur-md border-purple-500/20",
    buttonBg: "bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white shadow-lg shadow-purple-500/25",
    canvasBg: "#090314",
    throatColor: "#d8b4fe",
    exoticGlow: "rgba(216, 180, 254, 0.85)",
    universeAlpha: "#818cf8",
    universeBeta: "#f472b6",
    photonColor: "#f0abfc",
    gridColor: "rgba(192, 132, 252, 0.09)",
  },
  exoticEmerald: {
    id: "exoticEmerald",
    name: "Exotic Energy (Emerald / Teal)",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    accentText: "text-emerald-400",
    border: "border-emerald-500/30",
    cardBg: "bg-slate-900/85 backdrop-blur-md border-emerald-500/20",
    buttonBg: "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25",
    canvasBg: "#020f0a",
    throatColor: "#6ee7b7",
    exoticGlow: "rgba(110, 231, 183, 0.85)",
    universeAlpha: "#38bdf8",
    universeBeta: "#34d399",
    photonColor: "#a7f3d0",
    gridColor: "rgba(52, 211, 153, 0.09)",
  },
  relativisticAmber: {
    id: "relativisticAmber",
    name: "Relativistic Synchrotron (Amber / Gold)",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    accentText: "text-amber-400",
    border: "border-amber-500/30",
    cardBg: "bg-slate-900/85 backdrop-blur-md border-amber-500/20",
    buttonBg: "bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white shadow-lg shadow-amber-500/25",
    canvasBg: "#120802",
    throatColor: "#fde047",
    exoticGlow: "rgba(253, 224, 71, 0.85)",
    universeAlpha: "#fbbf24",
    universeBeta: "#f43f5e",
    photonColor: "#fef08a",
    gridColor: "rgba(251, 191, 36, 0.09)",
  },
  singularityCyan: {
    id: "singularityCyan",
    name: "Horizon Singularity (Cyan / Electric Blue)",
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    accentText: "text-cyan-400",
    border: "border-cyan-500/30",
    cardBg: "bg-slate-900/85 backdrop-blur-md border-cyan-500/20",
    buttonBg: "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25",
    canvasBg: "#020a14",
    throatColor: "#7dd3fc",
    exoticGlow: "rgba(125, 211, 252, 0.85)",
    universeAlpha: "#60a5fa",
    universeBeta: "#a855f7",
    photonColor: "#bae6fd",
    gridColor: "rgba(56, 189, 248, 0.09)",
  },
};

// Relativistic & Astrophysical Presets
const PRESETS = {
  morrisThorne: {
    id: "morrisThorne",
    name: "🌀 Morris-Thorne Standard Throat",
    subtitle: "Static, Spherical Traversable Metric Stabilized by Casimir Energy",
    formula: "ds^2 = -c^2 dt^2 + \\frac{dr^2}{1 - b(r)/r} + r^2(d\\theta^2 + \\sin^2\\theta d\\phi^2)",
    desc: "The classic traversable wormhole metric by Michael Morris & Kip Thorne (1988). Requires negative exotic energy density to support a non-singular throat with zero event horizons.",
    throatRadius: 15.0,
    exoticEnergyDensity: -85,
    throatLength: 6.0,
    rotationSpeed: 0.0,
    probeVelocity: 0.75,
  },
  ellisDrainhole: {
    id: "ellisDrainhole",
    name: "🌊 Ellis Zero-Tidal Drainhole",
    subtitle: "Zero-Tidal Force Geodesic Tunnel (g_tt = 1)",
    formula: "ds^2 = -c^2 dt^2 + d\\rho^2 + (\\rho^2 + n^2)(d\\theta^2 + \\sin^2\\theta d\\phi^2)",
    desc: "Discovered by H. G. Ellis (1973), this geometry features completely zero radial tidal force, allowing human travelers to pass through without gravitational spaghettification.",
    throatRadius: 22.0,
    exoticEnergyDensity: -50,
    throatLength: 12.0,
    rotationSpeed: 0.0,
    probeVelocity: 0.90,
  },
  teoRotating: {
    id: "teoRotating",
    name: "⚡ Teo Axially Symmetric Ergoregion",
    subtitle: "Rotating Wormhole with Angular Momentum & Frame Dragging",
    formula: "ds^2 = -N^2 dt^2 + e^{2\\mu} dr^2 + r^2 K^2 [d\\theta^2 + \\sin^2\\theta (d\\phi - \\omega dt)^2]",
    desc: "Edward Teo's (1998) rotating metric introduces frame-dragging (ω) and ergoregions where spacetime swaths rotate faster than light without creating closed timelike curves.",
    throatRadius: 16.5,
    exoticEnergyDensity: -70,
    throatLength: 4.5,
    rotationSpeed: 0.70,
    probeVelocity: 0.85,
  },
  visserThinShell: {
    id: "visserThinShell",
    name: "💎 Visser Cut-and-Paste Thin-Shell",
    subtitle: "Cosmic String Structured Flat-Spacetime Tunnel",
    formula: "T_{ij} = -\\frac{1}{8\\pi G} ([K_{ij}] - h_{ij}[K])",
    desc: "Matt Visser's (1989) thin-shell construction minimizes exotic matter needs by concentrating negative stress-energy exclusively into a thin boundary ring frame.",
    throatRadius: 9.0,
    exoticEnergyDensity: -35,
    throatLength: 2.0,
    rotationSpeed: 0.15,
    probeVelocity: 0.60,
  },
  exoticCollapse: {
    id: "exoticCollapse",
    name: "💥 Exotic Energy Depletion Collapse",
    subtitle: "Singularity Pinch-Off & Relativistic Shockwave",
    formula: "\\lim_{\\rho \\to 0} b(r) \\to r_{Schwarzschild} \\implies \\text{Pinch-Off}",
    desc: "Simulates exotic energy decay: as negative mass density drops below critical stabilization thresholds, the throat pinches shut, generating extreme tidal singularities.",
    throatRadius: 6.0,
    exoticEnergyDensity: -12,
    throatLength: 1.5,
    rotationSpeed: 0.35,
    probeVelocity: 0.95,
  },
};

export default function TraversableWormholeStudio() {
  // State variables
  const [selectedTheme, setSelectedTheme] = useState("quantumViolet");
  const [selectedPreset, setSelectedPreset] = useState("morrisThorne");

  // Physics Simulation Controls
  const [throatRadius, setThroatRadius] = useState(15.0); // km
  const [exoticEnergyDensity, setExoticEnergyDensity] = useState(-85); // %
  const [throatLength, setThroatLength] = useState(6.0); // km
  const [rotationSpeed, setRotationSpeed] = useState(0.0); // fraction of c
  const [probeVelocity, setProbeVelocity] = useState(0.75); // c
  const [beamDensity, setBeamDensity] = useState(120); // photon lines

  // Visual & Interactive Options
  const [viewMode, setViewMode] = useState("embedding3D"); // embedding3D, raytracing2D, topdownWormhole
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showVectors, setShowVectors] = useState(true);
  const [autoLaunchProbes, setAutoLaunchProbes] = useState(true);
  const [activeTab, setActiveTab] = useState("simulation"); // simulation, metrics, theory

  // 3D Canvas Drag Interaction
  const [rotX, setRotX] = useState(0.45);
  const [rotY, setRotY] = useState(0.35);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Probe Stream State
  const probesRef = useRef([]);
  const [probesCount, setProbesCount] = useState(0);
  const [traversedCount, setTraversedCount] = useState(0);

  // References
  const canvasRef = useRef(null);
  const chartCanvasRef = useRef(null);
  const synthRef = useRef({ humOsc: null, exoticOsc: null, masterGain: null });

  const currentTheme = THEMES[selectedTheme] || THEMES.quantumViolet;
  const currentPreset = PRESETS[selectedPreset] || PRESETS.morrisThorne;

  // Apply Preset
  const handleApplyPreset = (presetKey) => {
    const p = PRESETS[presetKey];
    if (!p) return;
    setSelectedPreset(presetKey);
    setThroatRadius(p.throatRadius);
    setExoticEnergyDensity(p.exoticEnergyDensity);
    setThroatLength(p.throatLength);
    setRotationSpeed(p.rotationSpeed);
    setProbeVelocity(p.probeVelocity);
  };

  // Launch a manual probe
  const launchProbe = useCallback(() => {
    const newProbe = {
      id: Math.random(),
      universe: "alpha",
      x: -320,
      y: (Math.random() - 0.5) * throatRadius * 1.8,
      z: (Math.random() - 0.5) * throatRadius * 1.8,
      progress: 0,
      speed: 0.006 * probeVelocity,
      size: Math.random() * 2 + 3,
      properTime: 0,
      redshift: 1.0,
      status: "in-transit",
    };
    probesRef.current.push(newProbe);
    setProbesCount((prev) => prev + 1);
  }, [probeVelocity, throatRadius]);

  // Audio Engine Initialization & Modulation
  const audioCtxRef = useRef(null);
  useEffect(() => {
    if (!soundEnabled) {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.08, ctx.currentTime);
      masterGain.connect(ctx.destination);

      const humOsc = ctx.createOscillator();
      humOsc.type = "sine";
      humOsc.frequency.setValueAtTime(55 + throatRadius * 2, ctx.currentTime);
      humOsc.connect(masterGain);
      humOsc.start();

      const exoticOsc = ctx.createOscillator();
      exoticOsc.type = "sawtooth";
      exoticOsc.frequency.setValueAtTime(
        110 + Math.abs(exoticEnergyDensity) * 3,
        ctx.currentTime
      );

      const exoticFilter = ctx.createBiquadFilter();
      exoticFilter.type = "lowpass";
      exoticFilter.frequency.setValueAtTime(350, ctx.currentTime);

      exoticOsc.connect(exoticFilter);
      exoticFilter.connect(masterGain);
      exoticOsc.start();

      synthRef.current = { humOsc, exoticOsc, masterGain, ctx };
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }

    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    };
  }, [soundEnabled]);

  useEffect(() => {
    if (!soundEnabled || !synthRef.current.ctx) return;
    const { humOsc, exoticOsc, ctx } = synthRef.current;
    if (humOsc && humOsc.frequency) {
      humOsc.frequency.setTargetAtTime(
        45 + throatRadius * 2.5 + rotationSpeed * 40,
        ctx.currentTime,
        0.1
      );
    }
    if (exoticOsc && exoticOsc.frequency) {
      exoticOsc.frequency.setTargetAtTime(
        90 + Math.abs(exoticEnergyDensity) * 4,
        ctx.currentTime,
        0.1
      );
    }
  }, [throatRadius, exoticEnergyDensity, rotationSpeed, soundEnabled]);

  const triggerTransitSound = useCallback(() => {
    if (!soundEnabled || !synthRef.current.ctx) return;
    const ctx = synthRef.current.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(synthRef.current.masterGain);
    osc.start();
    osc.stop(ctx.currentTime + 0.16);
  }, [soundEnabled]);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let frameId;
    let t = 0;

    const render = () => {
      if (!isPaused) {
        t += 0.016;
      }

      if (autoLaunchProbes && !isPaused && Math.random() < 0.035) {
        launchProbe();
      }

      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;

      ctx.fillStyle = currentTheme.canvasBg;
      ctx.fillRect(0, 0, width, height);

      // Starfield
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      for (let i = 0; i < 90; i++) {
        const sx = (Math.sin(i * 99 + t * 0.05) * 0.5 + 0.5) * width;
        const sy = (Math.cos(i * 33 + t * 0.02) * 0.5 + 0.5) * height;
        const size = (i % 3) * 0.6 + 0.6;
        ctx.fillRect(sx, sy, size, size);
      }

      if (viewMode === "embedding3D") {
        renderEmbedding3D(ctx, width, height, cx, cy, t);
      } else if (viewMode === "raytracing2D") {
        renderRaytracing2D(ctx, width, height, cx, cy, t);
      } else if (viewMode === "topdownWormhole") {
        renderTopDownWormhole(ctx, width, height, cx, cy, t);
      }

      frameId = requestAnimationFrame(render);
    };

    const renderEmbedding3D = (ctx, w, h, cx, cy, time) => {
      const b0 = throatRadius * 2.4;
      const L = throatLength * 8;
      const scale = 1.1;

      ctx.save();
      ctx.translate(cx, cy);

      const project = (x, y, z) => {
        const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
        const cosY = Math.cos(rotY), sinY = Math.sin(rotY);

        let y1 = y * cosX - z * sinX;
        let z1 = y * sinX + z * cosX;

        let x2 = x * cosY + z1 * sinY;
        let z2 = -x * sinY + z1 * cosY;

        const fov = 400;
        const distance = 450;
        const pScale = fov / (distance + z2);
        return {
          px: x2 * pScale * scale,
          py: y1 * pScale * scale,
          depth: z2,
          pScale,
        };
      };

      const rRings = 14;
      const thetaSegments = 24;
      const maxR = 140;

      if (showGrid) {
        ctx.strokeStyle = currentTheme.gridColor;
        ctx.lineWidth = 1;

        for (let j = 0; j < thetaSegments; j++) {
          const angle = (j / thetaSegments) * Math.PI * 2 + time * rotationSpeed * 0.2;
          ctx.beginPath();
          let first = true;

          for (let i = 0; i <= rRings * 2; i++) {
            let rVal, zVal;
            if (i <= rRings) {
              const normR = i / rRings;
              rVal = b0 + normR * (maxR - b0);
              zVal = -Math.sqrt(rVal - b0) * 14 - L / 2;
            } else {
              const normR = (i - rRings) / rRings;
              rVal = b0 + (1 - normR) * (maxR - b0);
              zVal = Math.sqrt(rVal - b0) * 14 + L / 2;
            }

            const x = rVal * Math.cos(angle);
            const y = rVal * Math.sin(angle);
            const p = project(x, y, zVal);

            if (first) {
              ctx.moveTo(p.px, p.py);
              first = false;
            } else {
              ctx.lineTo(p.px, p.py);
            }
          }
          ctx.stroke();
        }

        for (let i = 0; i <= rRings; i++) {
          const normR = i / rRings;
          const rVal = b0 + normR * (maxR - b0);

          const zAlpha = -Math.sqrt(rVal - b0) * 14 - L / 2;
          ctx.beginPath();
          for (let j = 0; j <= thetaSegments; j++) {
            const angle = (j / thetaSegments) * Math.PI * 2;
            const x = rVal * Math.cos(angle);
            const y = rVal * Math.sin(angle);
            const p = project(x, y, zAlpha);
            if (j === 0) ctx.moveTo(p.px, p.py);
            else ctx.lineTo(p.px, p.py);
          }
          ctx.stroke();

          const zBeta = Math.sqrt(rVal - b0) * 14 + L / 2;
          ctx.beginPath();
          for (let j = 0; j <= thetaSegments; j++) {
            const angle = (j / thetaSegments) * Math.PI * 2;
            const x = rVal * Math.cos(angle);
            const y = rVal * Math.sin(angle);
            const p = project(x, y, zBeta);
            if (j === 0) ctx.moveTo(p.px, p.py);
            else ctx.lineTo(p.px, p.py);
          }
          ctx.stroke();
        }
      }

      // Throat Glow Ring
      const exoticPulse = Math.sin(time * 3) * 0.15 + 0.85;
      const throatGlowR = b0 * (1 + Math.abs(exoticEnergyDensity) * 0.003 * exoticPulse);

      ctx.save();
      ctx.lineWidth = 4;
      ctx.strokeStyle = currentTheme.throatColor;
      ctx.shadowColor = currentTheme.throatColor;
      ctx.shadowBlur = 18;

      ctx.beginPath();
      for (let j = 0; j <= thetaSegments * 2; j++) {
        const angle = (j / (thetaSegments * 2)) * Math.PI * 2;
        const x = throatGlowR * Math.cos(angle);
        const y = throatGlowR * Math.sin(angle);
        const p = project(x, y, 0);
        if (j === 0) ctx.moveTo(p.px, p.py);
        else ctx.lineTo(p.px, p.py);
      }
      ctx.stroke();
      ctx.restore();

      // Universe Labels
      const alphaLblP = project(0, -maxR - 20, -Math.sqrt(maxR - b0) * 14 - L / 2);
      ctx.fillStyle = currentTheme.universeAlpha;
      ctx.font = "bold 13px Inter, sans-serif";
      ctx.fillText("UNIVERSE Alpha (Sector 01)", alphaLblP.px, alphaLblP.py);

      const betaLblP = project(0, maxR + 20, Math.sqrt(maxR - b0) * 14 + L / 2);
      ctx.fillStyle = currentTheme.universeBeta;
      ctx.fillText("UNIVERSE Beta (Sector 02)", betaLblP.px, betaLblP.py);

      // Photons
      const photonLines = Math.min(beamDensity, 160);
      ctx.lineWidth = 1.5;
      for (let k = 0; k < photonLines; k++) {
        const pAngle = (k / photonLines) * Math.PI * 2 + time * 0.3;
        const pRadius = b0 * 1.1 + (k % 5) * 3;
        const zP = Math.sin(time * 2 + k) * (L + 30);

        const px = pRadius * Math.cos(pAngle);
        const py = pRadius * Math.sin(pAngle);
        const projP = project(px, py, zP);

        ctx.fillStyle = currentTheme.photonColor;
        ctx.beginPath();
        ctx.arc(projP.px, projP.py, projP.pScale * 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Active Probes
      probesRef.current.forEach((probe, idx) => {
        probe.progress += probe.speed;
        if (probe.progress >= 1.0) {
          probe.status = "traversed";
          triggerTransitSound();
          setTraversedCount((prev) => prev + 1);
        }

        const norm = probe.progress * 2 - 1;
        const rVal = b0 + Math.pow(Math.abs(norm), 1.8) * (maxR - b0);
        const zVal = norm * (Math.sqrt(maxR - b0) * 14 + L / 2);
        const pAngle = (idx * 1.3) + time * (1 + rotationSpeed);

        const px = rVal * Math.cos(pAngle);
        const py = rVal * Math.sin(pAngle);
        const projP = project(px, py, zVal);

        ctx.save();
        ctx.fillStyle = norm < 0 ? currentTheme.universeAlpha : currentTheme.universeBeta;
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(projP.px, projP.py, probe.size * projP.pScale * 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      probesRef.current = probesRef.current.filter((p) => p.progress < 1.0);
      ctx.restore();
    };

    const renderRaytracing2D = (ctx, w, h, cx, cy, time) => {
      const b0 = throatRadius * 5.5;
      const numRays = 48;
      ctx.lineWidth = 1.2;

      for (let i = 0; i < numRays; i++) {
        const yStart = (i / numRays) * h;
        ctx.strokeStyle = currentTheme.gridColor;
        ctx.beginPath();

        for (let x = 0; x <= w; x += 15) {
          const dx = x - cx;
          const dy = yStart - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const deflection = (b0 * b0 * 25) / (dist * dist + 100);
          const factor = Math.min(deflection, 45);

          const shiftedY = yStart + (dy > 0 ? factor : -factor);
          if (x === 0) ctx.moveTo(x, shiftedY);
          else ctx.lineTo(x, shiftedY);
        }
        ctx.stroke();
      }

      const throatGlow = ctx.createRadialGradient(cx, cy, b0 * 0.2, cx, cy, b0 * 1.8);
      throatGlow.addColorStop(0, "#000000");
      throatGlow.addColorStop(0.55, "rgba(0, 0, 0, 0.95)");
      throatGlow.addColorStop(0.85, currentTheme.throatColor);
      throatGlow.addColorStop(1, "transparent");

      ctx.fillStyle = throatGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, b0 * 1.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.strokeStyle = currentTheme.photonColor;
      ctx.lineWidth = 3;
      ctx.shadowColor = currentTheme.photonColor;
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(cx, cy, b0 * 1.15 + Math.sin(time * 3) * 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      if (showVectors && rotationSpeed > 0) {
        ctx.strokeStyle = currentTheme.universeAlpha;
        ctx.lineWidth = 1.5;
        const arrowCount = 12;
        for (let a = 0; a < arrowCount; a++) {
          const ang = (a / arrowCount) * Math.PI * 2 + time * rotationSpeed * 1.5;
          const r = b0 * 1.45;
          const ax = cx + r * Math.cos(ang);
          const ay = cy + r * Math.sin(ang);

          const tx = -Math.sin(ang) * 18 * rotationSpeed;
          const ty = Math.cos(ang) * 18 * rotationSpeed;

          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(ax + tx, ay + ty);
          ctx.stroke();
        }
      }
    };

    const renderTopDownWormhole = (ctx, w, h, cx, cy, time) => {
      const b0 = throatRadius * 6;

      const heatGrad = ctx.createRadialGradient(cx, cy, b0 * 0.4, cx, cy, b0 * 1.6);
      heatGrad.addColorStop(0, "rgba(0, 0, 0, 1)");
      heatGrad.addColorStop(0.5, currentTheme.exoticGlow);
      heatGrad.addColorStop(0.85, "rgba(147, 51, 234, 0.15)");
      heatGrad.addColorStop(1, "transparent");

      ctx.fillStyle = heatGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, b0 * 1.6, 0, Math.PI * 2);
      ctx.fill();

      if (rotationSpeed > 0) {
        const ergoR = b0 * (1 + rotationSpeed * 0.4);
        ctx.strokeStyle = currentTheme.universeBeta;
        ctx.setLineDash([6, 6]);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, ergoR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = currentTheme.universeBeta;
        ctx.font = "11px Inter, sans-serif";
        ctx.fillText("Ergoregion Boundary (r_ergo)", cx + ergoR + 8, cy);
      }

      ctx.strokeStyle = currentTheme.throatColor;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx, cy, b0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 12px Inter, sans-serif";
      ctx.fillText(`Throat Radius r = b₀ (${throatRadius.toFixed(1)} km)`, cx - 70, cy - b0 - 12);
    };

    render();

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [
    throatRadius,
    exoticEnergyDensity,
    throatLength,
    rotationSpeed,
    probeVelocity,
    beamDensity,
    viewMode,
    isPaused,
    rotX,
    rotY,
    showGrid,
    showVectors,
    autoLaunchProbes,
    selectedTheme,
    launchProbe,
    triggerTransitSound,
    currentTheme,
  ]);

  // Chart rendering
  useEffect(() => {
    const chartCanvas = chartCanvasRef.current;
    if (!chartCanvas) return;
    const ctx = chartCanvas.getContext("2d");
    const w = chartCanvas.width;
    const h = chartCanvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    for (let x = 40; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 20; y < h; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    const zeroY = h - 25;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.beginPath();
    ctx.moveTo(35, zeroY);
    ctx.lineTo(w - 10, zeroY);
    ctx.stroke();

    ctx.strokeStyle = currentTheme.photonColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    const points = 80;
    const b0 = throatRadius;
    const rhoMax = Math.abs(exoticEnergyDensity);

    for (let i = 0; i < points; i++) {
      const r = b0 + (i / points) * (b0 * 4);
      const rhoVal = -rhoMax * Math.pow(b0 / r, 2.5);
      const px = 35 + (i / points) * (w - 50);
      const py = zeroY + (rhoVal / 100) * (h - 40);

      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px Inter, monospace";
    ctx.fillText("Exotic Density ρ(r)", 40, 15);
    ctx.fillText("Radial Distance r →", w - 110, zeroY - 5);
  }, [throatRadius, exoticEnergyDensity, currentTheme]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setRotY((prev) => prev + dx * 0.008);
    setRotX((prev) => Math.max(-1.2, Math.min(1.2, prev + dy * 0.008)));
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const necViolationIndex = (Math.abs(exoticEnergyDensity) * 1.42).toFixed(1);
  const peakTidalForce = ((throatRadius * 12.8) / Math.pow(throatLength + 0.1, 2)).toFixed(2);
  const properTimeRatio = Math.sqrt(Math.max(0.01, 1 - 0.9 / (throatRadius * 0.1 + 1))).toFixed(3);
  const criticalImpactParam = (2.598 * throatRadius).toFixed(1);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 text-slate-100 font-sans">
      {/* Studio Header Banner */}
      <div className={`p-6 rounded-2xl ${currentTheme.cardBg} border ${currentTheme.border} shadow-2xl mb-6 relative overflow-hidden`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 z-10 relative">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${currentTheme.badge}`}>
                Relativistic Astrophysics Lab
              </span>
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-800/80 text-slate-300 border border-slate-700">
                Einstein-Rosen & Morris-Thorne Metric
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span>Traversable Wormhole Studio</span>
              <span className="text-2xl">🌌</span>
            </h1>
            <p className="text-sm md:text-base text-slate-300 mt-1 max-w-3xl">
              Explore exotic spacetime geometries, Casimir energy stabilization, gravitational photon deflection, frame-dragging ergoregions, and relativistic particle transits through throat tunnels.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Preset Geometry</label>
              <select
                value={selectedPreset}
                onChange={(e) => handleApplyPreset(e.target.value)}
                className="bg-slate-800/90 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none w-full sm:w-64"
              >
                {Object.entries(PRESETS).map(([key, p]) => (
                  <option key={key} value={key}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Color Palette</label>
              <select
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value)}
                className="bg-slate-800/90 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none w-full sm:w-48"
              >
                {Object.entries(THEMES).map(([key, t]) => (
                  <option key={key} value={key}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Preset Details Card */}
      <div className={`p-4 rounded-xl ${currentTheme.cardBg} border ${currentTheme.border} mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4`}>
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>{currentPreset.name}</span>
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">{currentPreset.desc}</p>
        </div>
        <div className="bg-slate-950/80 px-4 py-2 rounded-lg border border-slate-800 font-mono text-xs text-purple-300 shrink-0">
          {currentPreset.formula}
        </div>
      </div>

      {/* Main Studio Navigation Tabs */}
      <div className="flex border-b border-slate-800 mb-6">
        <button
          onClick={() => setActiveTab("simulation")}
          className={`px-5 py-3 font-semibold text-sm transition-all border-b-2 ${
            activeTab === "simulation"
              ? `${currentTheme.accentText} border-current`
              : "text-slate-400 border-transparent hover:text-slate-200"
          }`}
        >
          🎮 Interactive Canvas & Controls
        </button>
        <button
          onClick={() => setActiveTab("metrics")}
          className={`px-5 py-3 font-semibold text-sm transition-all border-b-2 ${
            activeTab === "metrics"
              ? `${currentTheme.accentText} border-current`
              : "text-slate-400 border-transparent hover:text-slate-200"
          }`}
        >
          📊 Relativistic Diagnostics & Profiles
        </button>
        <button
          onClick={() => setActiveTab("theory")}
          className={`px-5 py-3 font-semibold text-sm transition-all border-b-2 ${
            activeTab === "theory"
              ? `${currentTheme.accentText} border-current`
              : "text-slate-400 border-transparent hover:text-slate-200"
          }`}
        >
          📚 Relativistic Physics & Equations
        </button>
      </div>

      {/* TAB 1: SIMULATION & CONTROLS */}
      {activeTab === "simulation" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`lg:col-span-2 rounded-2xl ${currentTheme.cardBg} border ${currentTheme.border} p-4 flex flex-col`}>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 bg-slate-950/70 p-1 rounded-lg border border-slate-800">
                <button
                  onClick={() => setViewMode("embedding3D")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    viewMode === "embedding3D"
                      ? `${currentTheme.buttonBg}`
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  🌐 3D Spatial Funnel Mesh
                </button>
                <button
                  onClick={() => setViewMode("raytracing2D")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    viewMode === "raytracing2D"
                      ? `${currentTheme.buttonBg}`
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  ✨ Gravitational Lensing
                </button>
                <button
                  onClick={() => setViewMode("topdownWormhole")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    viewMode === "topdownWormhole"
                      ? `${currentTheme.buttonBg}`
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  🎯 Cross-Section Density
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={launchProbe}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg ${currentTheme.buttonBg} flex items-center gap-1.5`}
                >
                  🚀 Fire Probe Pulse
                </button>
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                >
                  {isPaused ? "▶ Resume" : "⏸ Pause"}
                </button>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border ${
                    soundEnabled
                      ? "bg-purple-900/60 border-purple-500 text-purple-200"
                      : "bg-slate-800 border-slate-700 text-slate-400"
                  }`}
                >
                  {soundEnabled ? "🔊 Synth ON" : "🔇 Sound OFF"}
                </button>
              </div>
            </div>

            <div
              className="relative w-full aspect-video rounded-xl overflow-hidden cursor-grab active:cursor-grabbing border border-slate-800 bg-slate-950"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <canvas
                ref={canvasRef}
                width={800}
                height={450}
                className="w-full h-full object-contain block"
              />

              <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono text-slate-300 pointer-events-none">
                <div>Drag Mouse: Rotate 3D Camera</div>
                <div>Probes In Transit: {probesRef.current.length}</div>
                <div>Probes Traversed: {traversedCount}</div>
              </div>

              <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono text-slate-300 pointer-events-none">
                <div>Throat r = {throatRadius.toFixed(1)} km</div>
                <div>Exotic Density = {exoticEnergyDensity}%</div>
              </div>
            </div>
          </div>

          <div className={`rounded-2xl ${currentTheme.cardBg} border ${currentTheme.border} p-5 flex flex-col justify-between`}>
            <div>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
                <span>Spacetime Metric Tuning</span>
                <span className={`text-xs px-2 py-0.5 rounded border ${currentTheme.badge}`}>Parameters</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-300">Throat Radius (b₀)</span>
                    <span className={currentTheme.accentText}>{throatRadius.toFixed(1)} km</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="50.0"
                    step="0.5"
                    value={throatRadius}
                    onChange={(e) => setThroatRadius(parseFloat(e.target.value))}
                    className="w-full accent-purple-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-300">Exotic Energy Density (ρ_exotic)</span>
                    <span className={currentTheme.accentText}>{exoticEnergyDensity}%</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="-5"
                    step="1"
                    value={exoticEnergyDensity}
                    onChange={(e) => setExoticEnergyDensity(parseInt(e.target.value))}
                    className="w-full accent-purple-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Requires negative mass-energy (ρ c² + p_r &lt; 0)
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-300">Throat Tunnel Length (L)</span>
                    <span className={currentTheme.accentText}>{throatLength.toFixed(1)} km</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="20.0"
                    step="0.5"
                    value={throatLength}
                    onChange={(e) => setThroatLength(parseFloat(e.target.value))}
                    className="w-full accent-purple-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-300">Axial Spin Rate (Ω / c)</span>
                    <span className={currentTheme.accentText}>{rotationSpeed.toFixed(2)} c</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="0.95"
                    step="0.05"
                    value={rotationSpeed}
                    onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
                    className="w-full accent-purple-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-300">Probe Sub-light Speed (v_probe)</span>
                    <span className={currentTheme.accentText}>{probeVelocity.toFixed(2)} c</span>
                  </div>
                  <input
                    type="range"
                    min="0.10"
                    max="0.99"
                    step="0.05"
                    value={probeVelocity}
                    onChange={(e) => setProbeVelocity(parseFloat(e.target.value))}
                    className="w-full accent-purple-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-300">Photon Ray Density</span>
                    <span className={currentTheme.accentText}>{beamDensity} rays</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="300"
                    step="10"
                    value={beamDensity}
                    onChange={(e) => setBeamDensity(parseInt(e.target.value))}
                    className="w-full accent-purple-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 mt-4 space-y-2">
              <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                <span>Show Spacetime Grid Mesh</span>
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-purple-600 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                <span>Show Velocity Vectors</span>
                <input
                  type="checkbox"
                  checked={showVectors}
                  onChange={(e) => setShowVectors(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-purple-600 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                <span>Auto-Launch Probe Streams</span>
                <input
                  type="checkbox"
                  checked={autoLaunchProbes}
                  onChange={(e) => setAutoLaunchProbes(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-purple-600 focus:ring-0"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: METRICS & DIAGNOSTIC CHARTS */}
      {activeTab === "metrics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`p-4 rounded-xl ${currentTheme.cardBg} border ${currentTheme.border}`}>
              <span className="text-xs text-slate-400 block mb-1">Null Energy Condition (NEC) Violation</span>
              <div className="text-2xl font-black text-white">{necViolationIndex}</div>
              <span className="text-[10px] text-purple-300 block mt-1">
                |ρ + p_r| &gt; 0 (Exotic Matter Required)
              </span>
            </div>

            <div className={`p-4 rounded-xl ${currentTheme.cardBg} border ${currentTheme.border}`}>
              <span className="text-xs text-slate-400 block mb-1">Peak Tidal Acceleration</span>
              <div className="text-2xl font-black text-white">{peakTidalForce} g</div>
              <span className="text-[10px] text-emerald-300 block mt-1">
                {parseFloat(peakTidalForce) < 1.0 ? "✅ Human Traversable (<1g)" : "⚠️ High Shear Stress"}
              </span>
            </div>

            <div className={`p-4 rounded-xl ${currentTheme.cardBg} border ${currentTheme.border}`}>
              <span className="text-xs text-slate-400 block mb-1">Proper Travel Time Ratio</span>
              <div className="text-2xl font-black text-white">{properTimeRatio}</div>
              <span className="text-[10px] text-amber-300 block mt-1">
                Δτ_traveler / Δt_external (Relativistic Dilation)
              </span>
            </div>

            <div className={`p-4 rounded-xl ${currentTheme.cardBg} border ${currentTheme.border}`}>
              <span className="text-xs text-slate-400 block mb-1">Photon Deflection Impact Parameter</span>
              <div className="text-2xl font-black text-white">{criticalImpactParam} km</div>
              <span className="text-[10px] text-cyan-300 block mt-1">
                b_crit = (3√3 / 2) b₀ (Einstein Shadow Ring)
              </span>
            </div>
          </div>

          <div className={`p-5 rounded-2xl ${currentTheme.cardBg} border ${currentTheme.border}`}>
            <h3 className="text-md font-bold text-white mb-3 flex items-center justify-between">
              <span>Exotic Energy Density Radial Profile ρ(r)</span>
              <span className="text-xs text-slate-400">Morris-Thorne Stress Energy Tensor</span>
            </h3>
            <div className="w-full h-56 rounded-xl overflow-hidden border border-slate-800">
              <canvas
                ref={chartCanvasRef}
                width={800}
                height={220}
                className="w-full h-full object-contain block bg-slate-950"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: RELATIVISTIC THEORY & EQUATIONS */}
      {activeTab === "theory" && (
        <div className={`p-6 rounded-2xl ${currentTheme.cardBg} border ${currentTheme.border} space-y-6 text-sm text-slate-300`}>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">1. The Morris-Thorne Traversable Metric</h3>
            <p className="leading-relaxed">
              In 1988, Michael Morris and Kip Thorne formulated the spacetime metric for a stationary, spherically symmetric traversable wormhole connecting two separate asymptotic universes:
            </p>
            <div className="my-3 p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-center text-purple-300 text-xs sm:text-sm">
              ds² = - c² e^(2Φ(r)) dt² + [dr² / (1 - b(r)/r)] + r² (dθ² + sin²θ dφ²)
            </div>
            <p className="leading-relaxed">
              Here, <strong>Φ(r)</strong> is the redshift function (must remain finite everywhere to eliminate horizons), and <strong>b(r)</strong> is the shape function defining the throat radius at <em>r = b₀</em> where <em>b(b₀) = b₀</em>.
            </p>
          </div>

          <div className="border-t border-slate-800 pt-5">
            <h3 className="text-xl font-bold text-white mb-2">2. Exotic Matter & Violation of Energy Conditions</h3>
            <p className="leading-relaxed">
              For a wormhole throat to remain open without pinching off into a singularity, Einstein&apos;s field equations specify that the radial tension must exceed the mass-energy density:
            </p>
            <div className="my-3 p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-center text-rose-300 text-xs sm:text-sm">
              ρ c² + p_r = - [c⁴ / (8π G r²)] [ (b&apos;(r) r - b(r))/r² + 2(1 - b(r)/r) Φ&apos;(r) r ] &lt; 0
            </div>
            <p className="leading-relaxed">
              This condition violates the <strong>Null Energy Condition (NEC)</strong> and <strong>Weak Energy Condition (WEC)</strong>, demanding exotic matter with negative mass-energy density, such as Casimir vacuum fluctuations or quantum squeezed states.
            </p>
          </div>

          <div className="border-t border-slate-800 pt-5">
            <h3 className="text-xl font-bold text-white mb-2">3. Human Traversability Criteria</h3>
            <p className="leading-relaxed">
              To be safely traversable by living organisms, the tidal acceleration felt by a traveler must not exceed 1 g (approx 9.8 m/s²):
            </p>
            <div className="my-3 p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-center text-emerald-300 text-xs sm:text-sm">
              |R_0101| = | (1 - b/r) [ Φ&apos;&apos; + (Φ&apos;)² - ((b&apos;r - b)/(2r(r - b))) Φ&apos; ] | c² ≤ g / (2 m)
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
