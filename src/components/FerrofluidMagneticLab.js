import React, { useState, useEffect, useRef, useCallback } from "react";

// Visual Theme Presets for Ferrofluid Simulation
const THEMES = {
  cyber: {
    id: "cyber",
    name: "Cyber Obsidian",
    bg: "from-slate-950 via-indigo-950 to-slate-900",
    canvasBg: "#050814",
    fluidColor: "#00f3ff",
    spikeColor: "#7000ff",
    tipColor: "#ffffff",
    fieldLineColor: "rgba(0, 243, 255, 0.15)",
    glowColor: "rgba(0, 243, 255, 0.6)",
    accentText: "text-cyan-400",
    accentBorder: "border-cyan-500/40",
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    buttonBg: "bg-cyan-600 hover:bg-cyan-500 text-white",
  },
  solar: {
    id: "solar",
    name: "Solar Plasma",
    bg: "from-amber-950 via-red-950 to-slate-950",
    canvasBg: "#120503",
    fluidColor: "#ffaa00",
    spikeColor: "#ff4500",
    tipColor: "#ffffaa",
    fieldLineColor: "rgba(255, 170, 0, 0.15)",
    glowColor: "rgba(255, 170, 0, 0.6)",
    accentText: "text-amber-400",
    accentBorder: "border-amber-500/40",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    buttonBg: "bg-amber-600 hover:bg-amber-500 text-white",
  },
  emerald: {
    id: "emerald",
    name: "Quantum Aurora",
    bg: "from-emerald-950 via-slate-950 to-teal-950",
    canvasBg: "#03120e",
    fluidColor: "#00ffaa",
    spikeColor: "#00cc88",
    tipColor: "#e0ffff",
    fieldLineColor: "rgba(0, 255, 170, 0.15)",
    glowColor: "rgba(0, 255, 170, 0.6)",
    accentText: "text-emerald-400",
    accentBorder: "border-emerald-500/40",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    buttonBg: "bg-emerald-600 hover:bg-emerald-500 text-white",
  },
  monochrome: {
    id: "monochrome",
    name: "Chrome Liquid",
    bg: "from-zinc-950 via-stone-950 to-black",
    canvasBg: "#08080c",
    fluidColor: "#e4e4e7",
    spikeColor: "#a1a1aa",
    tipColor: "#ffffff",
    fieldLineColor: "rgba(228, 228, 231, 0.12)",
    glowColor: "rgba(255, 255, 255, 0.5)",
    accentText: "text-zinc-300",
    accentBorder: "border-zinc-500/40",
    badge: "bg-zinc-500/20 text-zinc-200 border-zinc-500/40",
    buttonBg: "bg-zinc-700 hover:bg-zinc-600 text-white",
  },
  violet: {
    id: "violet",
    name: "Cosmic Violet",
    bg: "from-purple-950 via-slate-950 to-indigo-950",
    canvasBg: "#070518",
    fluidColor: "#c084fc",
    spikeColor: "#ec4899",
    tipColor: "#ffffff",
    fieldLineColor: "rgba(192, 132, 252, 0.15)",
    glowColor: "rgba(236, 72, 153, 0.6)",
    accentText: "text-purple-400",
    accentBorder: "border-purple-500/40",
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    buttonBg: "bg-purple-600 hover:bg-purple-500 text-white",
  },
};

// Preset Configurations for Magnetic Field Setups
const PRESETS = {
  dipole: {
    name: "Dipole Spike Bridge",
    desc: "Twin opposing magnetic poles forming fluid spikes and bridging magnetic channels.",
    getMagnets: (w, h) => [
      { id: 1, x: w * 0.35, y: h * 0.5, strength: 3.5, polarity: 1, type: "static", radius: 22 },
      { id: 2, x: w * 0.65, y: h * 0.5, strength: 3.5, polarity: -1, type: "static", radius: 22 },
    ],
  },
  trap: {
    name: "Quadrupole Trap",
    desc: "4 magnetic poles creating a central zero-field trap with hovering spike stars.",
    getMagnets: (w, h) => [
      { id: 1, x: w * 0.3, y: h * 0.3, strength: 3.0, polarity: 1, type: "static", radius: 20 },
      { id: 2, x: w * 0.7, y: h * 0.3, strength: 3.0, polarity: -1, type: "static", radius: 20 },
      { id: 3, x: w * 0.3, y: h * 0.7, strength: 3.0, polarity: -1, type: "static", radius: 20 },
      { id: 4, x: w * 0.7, y: h * 0.7, strength: 3.0, polarity: 1, type: "static", radius: 20 },
    ],
  },
  pulsing: {
    name: "AC Pulsing Electromagnet",
    desc: "Oscillating magnetic force causing rhythmically dancing fluid spikes.",
    getMagnets: (w, h) => [
      { id: 1, x: w * 0.5, y: h * 0.5, strength: 4.5, polarity: 1, type: "ac", radius: 26 },
    ],
  },
  vortex: {
    name: "Magnetic Vortex Spin",
    desc: "Rotating quad magnetic array generating a spinning ferrofluid vortex.",
    getMagnets: (w, h) => [
      { id: 1, x: w * 0.5, y: h * 0.3, strength: 3.2, polarity: 1, type: "vortex", radius: 20, angle: 0 },
      { id: 2, x: w * 0.7, y: h * 0.5, strength: 3.2, polarity: -1, type: "vortex", radius: 20, angle: Math.PI / 2 },
      { id: 3, x: w * 0.5, y: h * 0.7, strength: 3.2, polarity: 1, type: "vortex", radius: 20, angle: Math.PI },
      { id: 4, x: w * 0.3, y: h * 0.5, strength: 3.2, polarity: -1, type: "vortex", radius: 20, angle: (3 * Math.PI) / 2 },
    ],
  },
  wand: {
    name: "Interactive Mouse Wand",
    desc: "Single central base magnet with interactive mouse-guided magnetic wand.",
    getMagnets: (w, h) => [
      { id: 1, x: w * 0.5, y: h * 0.65, strength: 4.0, polarity: 1, type: "static", radius: 24 },
    ],
  },
};

export default function FerrofluidMagneticLab() {
  // Simulator Parameters
  const [themeKey, setThemeKey] = useState("cyber");
  const [presetKey, setPresetKey] = useState("dipole");
  const [particleCount, setParticleCount] = useState(2000);
  const [fieldStrength, setFieldStrength] = useState(2.8);
  const [viscosity, setViscosity] = useState(0.88);
  const [surfaceTension, setSurfaceTension] = useState(1.4);
  const [spikeSharpness, setSpikeSharpness] = useState(2.2);
  const [showFieldLines, setShowFieldLines] = useState(true);
  const [showMagnets, setShowMagnets] = useState(true);
  const [acFrequency, setAcFrequency] = useState(2.5);
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Mouse & Drag State
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000, isDown: false });
  const [draggedMagnetId, setDraggedMagnetId] = useState(null);
  const [wandPolarity, setWandPolarity] = useState(1);

  // Stats
  const [stats, setStats] = useState({ fps: 60, bMax: "0.0", spikes: 0, kinetic: "0.0" });

  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const particlesRef = useRef([]);
  const magnetsRef = useRef([]);
  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);
  const gainNodeRef = useRef(null);
  const humOscRef = useRef(null);
  const lastTimeRef = useRef(performance.now());
  const frameCountRef = useRef(0);

  const theme = THEMES[themeKey] || THEMES.cyber;

  // Initialize Audio Synth
  useEffect(() => {
    if (soundEnabled) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContext();
        audioCtxRef.current = ctx;

        const mainGain = ctx.createGain();
        mainGain.gain.setValueAtTime(0.08, ctx.currentTime);
        mainGain.connect(ctx.destination);
        gainNodeRef.current = mainGain;

        // Sub-bass electromagnetic hum
        const humOsc = ctx.createOscillator();
        humOsc.type = "sine";
        humOsc.frequency.setValueAtTime(55, ctx.currentTime);
        const humGain = ctx.createGain();
        humGain.gain.setValueAtTime(0.12, ctx.currentTime);
        humOsc.connect(humGain);
        humGain.connect(mainGain);
        humOsc.start();
        humOscRef.current = humOsc;

        // Harmonic magnetic field tone
        const osc = ctx.createOscillator();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(110, ctx.currentTime);
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(400, ctx.currentTime);
        osc.connect(filter);
        filter.connect(mainGain);
        osc.start();
        oscRef.current = osc;
      } catch (err) {
        console.warn("Web Audio API initialization failed:", err);
      }
    } else {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    }

    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, [soundEnabled]);

  // Load Preset Magnets
  const applyPreset = useCallback((presetId, canvasWidth, canvasHeight) => {
    const preset = PRESETS[presetId];
    if (!preset) return;
    const w = canvasWidth || (canvasRef.current ? canvasRef.current.width : 800);
    const h = canvasHeight || (canvasRef.current ? canvasRef.current.height : 520);
    magnetsRef.current = preset.getMagnets(w, h);
    setPresetKey(presetId);
  }, []);

  // Initialize Particles
  const initParticles = useCallback((count, width, height) => {
    const particles = [];
    const centerX = width / 2;
    const centerY = height / 2;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.sqrt(Math.random()) * Math.min(width, height) * 0.35;
      particles.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        baseSize: 1.5 + Math.random() * 1.5,
        spikeFactor: 0,
        charge: Math.random() > 0.5 ? 1 : -1,
      });
    }
    particlesRef.current = particles;
  }, []);

  // Initialize Canvas & Reset Simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.parentElement.clientWidth || 800;
    const height = 520;
    canvas.width = width;
    canvas.height = height;

    initParticles(particleCount, width, height);
    applyPreset(presetKey, width, height);
  }, [particleCount, initParticles, applyPreset, presetKey]);

  // Handle Canvas Resizing
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const newWidth = canvas.parentElement.clientWidth || 800;
      if (canvas.width !== newWidth) {
        canvas.width = newWidth;
        initParticles(particleCount, newWidth, canvas.height);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [particleCount, initParticles]);

  // Main Render & Animation Loop
  useEffect(() => {
    let animationTime = 0;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const width = canvas.width;
      const height = canvas.height;

      animationTime += 0.016;

      // Update FPS & Stats periodically
      frameCountRef.current++;
      const now = performance.now();
      if (now - lastTimeRef.current >= 500) {
        const delta = (now - lastTimeRef.current) / 1000;
        const currentFps = Math.round(frameCountRef.current / delta);
        frameCountRef.current = 0;
        lastTimeRef.current = now;

        // Calculate max magnetic field strength & active spikes
        let maxB = 0;
        let spikeCount = 0;
        let totalKinetic = 0;

        particlesRef.current.forEach((p) => {
          if (p.spikeFactor > 0.5) spikeCount++;
          totalKinetic += p.vx * p.vx + p.vy * p.vy;
        });

        magnetsRef.current.forEach((m) => {
          if (m.strength > maxB) maxB = m.strength;
        });

        setStats({
          fps: currentFps,
          bMax: (maxB * fieldStrength * 0.45).toFixed(2),
          spikes: spikeCount,
          kinetic: (totalKinetic * 0.05).toFixed(1),
        });

        // Update Sound Synthesizer Audio Frequencies
        if (soundEnabled && oscRef.current && gainNodeRef.current) {
          const targetFreq = 90 + Math.min(300, spikeCount * 0.4 + maxB * 20);
          const targetGain = 0.05 + Math.min(0.2, spikeCount * 0.0003);
          oscRef.current.frequency.setTargetAtTime(targetFreq, audioCtxRef.current.currentTime, 0.1);
          gainNodeRef.current.gain.setTargetAtTime(targetGain, audioCtxRef.current.currentTime, 0.1);
        }
      }

      // Clear Canvas background
      ctx.fillStyle = theme.canvasBg;
      ctx.fillRect(0, 0, width, height);

      // Collect all active magnetic sources including Mouse Wand
      const activeMagnets = [...magnetsRef.current];
      if (mousePos.x > 0 && mousePos.x < width && mousePos.y > 0 && mousePos.y < height) {
        activeMagnets.push({
          id: 9999,
          x: mousePos.x,
          y: mousePos.y,
          strength: 3.8 * fieldStrength,
          polarity: wandPolarity,
          type: "wand",
          radius: 16,
        });
      }

      // Update Magnet Animations (AC Pulsing, Vortex Rotation)
      if (!isPaused) {
        activeMagnets.forEach((m) => {
          if (m.type === "ac") {
            m.currentStrength = m.strength * Math.sin(animationTime * acFrequency * Math.PI * 2);
          } else if (m.type === "vortex") {
            m.angle = (m.angle || 0) + 0.02 * acFrequency;
            const radius = Math.min(width, height) * 0.22;
            const cx = width / 2;
            const cy = height / 2;
            m.x = cx + Math.cos(m.angle) * radius;
            m.y = cy + Math.sin(m.angle) * radius;
            m.currentStrength = m.strength;
          } else {
            m.currentStrength = m.strength;
          }
        });
      }

      // Draw Field Lines Vector Mesh (if enabled)
      if (showFieldLines) {
        ctx.strokeStyle = theme.fieldLineColor;
        ctx.lineWidth = 1;
        const gridStep = 32;

        for (let gx = gridStep / 2; gx < width; gx += gridStep) {
          for (let gy = gridStep / 2; gy < height; gy += gridStep) {
            let Bx = 0;
            let By = 0;

            activeMagnets.forEach((m) => {
              const str = m.currentStrength !== undefined ? m.currentStrength : m.strength;
              const dx = gx - m.x;
              const dy = gy - m.y;
              const distSq = dx * dx + dy * dy + 400;
              const dist = Math.sqrt(distSq);
              const force = (str * fieldStrength * 2500 * m.polarity) / (distSq * dist);
              Bx += dx * force;
              By += dy * force;
            });

            const bMag = Math.sqrt(Bx * Bx + By * By);
            if (bMag > 0.05) {
              const len = Math.min(12, bMag * 2);
              const angle = Math.atan2(By, Bx);
              ctx.beginPath();
              ctx.moveTo(gx, gy);
              ctx.lineTo(gx + Math.cos(angle) * len, gy + Math.sin(angle) * len);
              ctx.stroke();
            }
          }
        }
      }

      // Update Particle Physics & Spike Dynamics
      const particles = particlesRef.current;
      const pCount = particles.length;

      if (!isPaused) {
        for (let i = 0; i < pCount; i++) {
          const p = particles[i];

          let totalFx = 0;
          let totalFy = 0;
          let netB = 0;
          let maxFieldDx = 0;
          let maxFieldDy = 0;

          // 1. Magnetic Forces from all sources
          activeMagnets.forEach((m) => {
            const str = m.currentStrength !== undefined ? m.currentStrength : m.strength;
            const dx = m.x - p.x;
            const dy = m.y - p.y;
            const distSq = dx * dx + dy * dy + 100;
            const dist = Math.sqrt(distSq);

            // Magnetic attraction force towards poles (Rosensweig magnetic pull)
            const fMag = (str * fieldStrength * 600) / (distSq * Math.pow(dist, 0.3));
            totalFx += (dx / dist) * fMag;
            totalFy += (dy / dist) * fMag;

            netB += Math.abs(str) / dist;

            if (dist < 120) {
              maxFieldDx += (dx / dist) * str;
              maxFieldDy += (dy / dist) * str;
            }
          });

          // 2. Surface Tension Cohesion (attraction towards neighboring particles)
          const neighborIdx = (i + 37) % pCount;
          const pOther = particles[neighborIdx];
          const cdx = pOther.x - p.x;
          const cdy = pOther.y - p.y;
          const cDist = Math.sqrt(cdx * cdx + cdy * cdy + 1);
          if (cDist < 60) {
            const fCohesion = (cDist - 25) * 0.015 * surfaceTension;
            totalFx += (cdx / cDist) * fCohesion;
            totalFy += (cdy / cDist) * fCohesion;
          }

          // Apply Forces to Velocity
          p.vx = (p.vx + totalFx * 0.012) * viscosity;
          p.vy = (p.vy + totalFy * 0.012) * viscosity;

          // Update Position
          p.x += p.vx;
          p.y += p.vy;

          // Screen Boundary Dampening
          if (p.x < 10) { p.x = 10; p.vx *= -0.5; }
          if (p.x > width - 10) { p.x = width - 10; p.vx *= -0.5; }
          if (p.y < 10) { p.y = 10; p.vy *= -0.5; }
          if (p.y > height - 10) { p.y = height - 10; p.vy *= -0.5; }

          // Spike Sharpness Factor calculation
          const fieldMag = Math.sqrt(maxFieldDx * maxFieldDx + maxFieldDy * maxFieldDy);
          p.spikeFactor = Math.min(1.0, (fieldMag * spikeSharpness * 0.15));
          p.fieldAngle = Math.atan2(maxFieldDy, maxFieldDx);
        }
      }

      // Render Particles & Spikes
      ctx.shadowBlur = 12;
      ctx.shadowColor = theme.glowColor;

      for (let i = 0; i < pCount; i++) {
        const p = particles[i];

        if (p.spikeFactor > 0.3) {
          // Render Conical Spike Tip along Magnetic Field Line
          const spikeLen = 8 + p.spikeFactor * 24 * spikeSharpness;
          const tipX = p.x + Math.cos(p.fieldAngle) * spikeLen;
          const tipY = p.y + Math.sin(p.fieldAngle) * spikeLen;

          const perpX = -Math.sin(p.fieldAngle) * p.baseSize * 1.8;
          const perpY = Math.cos(p.fieldAngle) * p.baseSize * 1.8;

          ctx.fillStyle = theme.spikeColor;
          ctx.beginPath();
          ctx.moveTo(p.x - perpX, p.y - perpY);
          ctx.lineTo(p.x + perpX, p.y + perpY);
          ctx.lineTo(tipX, tipY);
          ctx.closePath();
          ctx.fill();

          // Highlight Glowing Spike Tip
          ctx.fillStyle = theme.tipColor;
          ctx.beginPath();
          ctx.arc(tipX, tipY, 1.2 + p.spikeFactor * 1.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Render Base Fluid Body Particle
          ctx.fillStyle = theme.fluidColor;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.baseSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.shadowBlur = 0;

      // Render Magnets Overlay (if enabled)
      if (showMagnets) {
        magnetsRef.current.forEach((m) => {
          const isNorth = m.polarity > 0;
          ctx.save();

          // Outer Magnetic Glow Ring
          ctx.beginPath();
          ctx.arc(m.x, m.y, m.radius + 6, 0, Math.PI * 2);
          ctx.fillStyle = isNorth ? "rgba(239, 68, 68, 0.15)" : "rgba(59, 130, 246, 0.15)";
          ctx.fill();
          ctx.strokeStyle = isNorth ? "rgba(239, 68, 68, 0.6)" : "rgba(59, 130, 246, 0.6)";
          ctx.lineWidth = 2;
          ctx.stroke();

          // Core Magnet Circle
          ctx.beginPath();
          ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
          ctx.fillStyle = isNorth ? "#ef4444" : "#3b82f6";
          ctx.fill();

          // Label N / S Polarity
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 12px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(isNorth ? "N" : "S", m.x, m.y);

          ctx.restore();
        });
      }

      // Render Mouse Wand Indicator (if inside canvas)
      if (mousePos.x > 0 && mousePos.x < width && mousePos.y > 0 && mousePos.y < height) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(mousePos.x, mousePos.y, 18, 0, Math.PI * 2);
        ctx.strokeStyle = wandPolarity > 0 ? "#ff4d4d" : "#4d94ff";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.restore();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    theme,
    fieldStrength,
    viscosity,
    surfaceTension,
    spikeSharpness,
    showFieldLines,
    showMagnets,
    isPaused,
    acFrequency,
    mousePos,
    wandPolarity,
    soundEnabled,
  ]);

  // Mouse & Touch Interactions
  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking on existing magnet to drag
    const clickedMagnet = magnetsRef.current.find((m) => {
      const dx = m.x - x;
      const dy = m.y - y;
      return Math.sqrt(dx * dx + dy * dy) <= m.radius + 8;
    });

    if (clickedMagnet) {
      setDraggedMagnetId(clickedMagnet.id);
    } else {
      setMousePos({ x, y, isDown: true });
    }
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (draggedMagnetId !== null) {
      magnetsRef.current = magnetsRef.current.map((m) =>
        m.id === draggedMagnetId ? { ...m, x, y } : m
      );
    }

    setMousePos((prev) => ({ ...prev, x, y }));
  };

  const handleMouseUp = () => {
    setDraggedMagnetId(null);
    setMousePos((prev) => ({ ...prev, isDown: false }));
  };

  const handleMouseLeave = () => {
    setDraggedMagnetId(null);
    setMousePos({ x: -1000, y: -1000, isDown: false });
  };

  // Add Magnet Helper
  const addMagnet = (polarity) => {
    const canvas = canvasRef.current;
    const w = canvas ? canvas.width : 800;
    const h = canvas ? canvas.height : 520;

    const newMagnet = {
      id: Date.now(),
      x: w * (0.3 + Math.random() * 0.4),
      y: h * (0.3 + Math.random() * 0.4),
      strength: 3.5,
      polarity,
      type: "static",
      radius: 22,
    };
    magnetsRef.current = [...magnetsRef.current, newMagnet];
  };

  // Clear Magnets Helper
  const clearMagnets = () => {
    magnetsRef.current = [];
  };

  // Shockwave Pulse Helper
  const triggerPulse = () => {
    particlesRef.current.forEach((p) => {
      const angle = Math.random() * Math.PI * 2;
      const force = 12 + Math.random() * 15;
      p.vx += Math.cos(angle) * force;
      p.vy += Math.sin(angle) * force;
    });
  };

  // Export Screenshot
  const handleExportImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `ferrofluid_magnetic_lab_${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div
      className={`max-w-6xl mx-auto my-8 p-6 md:p-8 rounded-3xl bg-gradient-to-b ${theme.bg} text-white shadow-2xl border ${theme.accentBorder} font-sans transition-colors duration-500`}
    >
      {/* Component Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${theme.badge}`}>
              Physics & Hydrodynamics Studio
            </span>
            <span className="text-xs text-slate-400 font-mono">v2.5 • Hydro-Magnetic Engine</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight mt-1 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
            Ferrofluid Magnetic Lab
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            Simulate Rosensweig hydro-magnetic instability, conical spike formation, and fluid surface tension under custom magnetic fields.
          </p>
        </div>

        {/* Theme Picker Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {Object.values(THEMES).map((t) => (
            <button
              key={t.id}
              onClick={() => setThemeKey(t.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                themeKey === t.id
                  ? `${t.badge} shadow-lg scale-105`
                  : "bg-slate-900/60 text-slate-400 border-white/10 hover:text-white"
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Controls + Interactive Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar: Controls & Presets */}
        <div className="lg:col-span-4 flex flex-col gap-5 bg-slate-950/60 backdrop-blur-xl p-5 rounded-2xl border border-white/10">
          {/* Preset Buttons */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
              🧲 Magnetic Presets
            </label>
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(PRESETS).map(([key, p]) => (
                <button
                  key={key}
                  onClick={() => applyPreset(key)}
                  className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                    presetKey === key
                      ? `${theme.badge} border-l-4 font-semibold`
                      : "bg-slate-900/50 border-white/5 text-slate-300 hover:bg-slate-800/80"
                  }`}
                >
                  <div className="font-bold text-slate-200">{p.name}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Physics Sliders */}
          <div className="space-y-3.5 pt-3 border-t border-white/10">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              ⚙️ Fluid & Field Parameters
            </label>

            {/* Field Strength */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Magnetic Field Strength ($B_0$)</span>
                <span className="font-mono text-cyan-400">{fieldStrength.toFixed(1)} T</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="6.0"
                step="0.1"
                value={fieldStrength}
                onChange={(e) => setFieldStrength(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Spike Sharpness */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Spike Instability (Rosensweig)</span>
                <span className="font-mono text-purple-400">{spikeSharpness.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="4.0"
                step="0.1"
                value={spikeSharpness}
                onChange={(e) => setSpikeSharpness(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
              />
            </div>

            {/* Viscosity Drag */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Fluid Viscosity Resistance</span>
                <span className="font-mono text-emerald-400">{Math.round(viscosity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.70"
                max="0.98"
                step="0.01"
                value={viscosity}
                onChange={(e) => setViscosity(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>

            {/* Particle Density */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Nanoparticle Density</span>
                <span className="font-mono text-amber-400">{particleCount}</span>
              </div>
              <input
                type="range"
                min="600"
                max="3500"
                step="100"
                value={particleCount}
                onChange={(e) => setParticleCount(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>

            {/* AC Frequency */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>AC Oscillation Frequency</span>
                <span className="font-mono text-pink-400">{acFrequency.toFixed(1)} Hz</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="6.0"
                step="0.1"
                value={acFrequency}
                onChange={(e) => setAcFrequency(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-400"
              />
            </div>
          </div>

          {/* Interactive Pole Management */}
          <div className="pt-3 border-t border-white/10 space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              ➕ Add Magnetic Poles
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => addMagnet(1)}
                className="py-2 px-3 rounded-xl text-xs font-bold bg-red-600/80 hover:bg-red-500 text-white transition-all shadow-md active:scale-95"
              >
                🔴 Add North (N)
              </button>
              <button
                onClick={() => addMagnet(-1)}
                className="py-2 px-3 rounded-xl text-xs font-bold bg-blue-600/80 hover:bg-blue-500 text-white transition-all shadow-md active:scale-95"
              >
                🔵 Add South (S)
              </button>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={clearMagnets}
                className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 transition-all"
              >
                🗑️ Clear All Poles
              </button>
              <button
                onClick={() => setWandPolarity((p) => (p > 0 ? -1 : 1))}
                className="py-2 px-3 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 transition-all"
                title="Toggle Wand Magnet Polarity"
              >
                Wand: <strong className={wandPolarity > 0 ? "text-red-400" : "text-blue-400"}>{wandPolarity > 0 ? "N" : "S"}</strong>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-white/10 flex flex-wrap gap-2">
            <button
              onClick={triggerPulse}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-lg hover:brightness-110 active:scale-95 ${theme.buttonBg}`}
            >
              💥 Magnetic Shockwave
            </button>
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 transition-all"
            >
              {isPaused ? "▶ Resume" : "⏸ Pause"}
            </button>
          </div>
        </div>

        {/* Right Area: Interactive Canvas & Telemetry */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="relative w-full rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-black group">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              className="w-full h-[520px] block cursor-crosshair touch-none"
            />

            {/* Overlay Badge Instructions */}
            <div className="absolute top-4 left-4 pointer-events-none bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[11px] text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Drag Magnets or Move Cursor as Magnetic Wand</span>
            </div>

            {/* Quick Action Overlay Buttons */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button
                onClick={() => setShowFieldLines(!showFieldLines)}
                className={`p-2 px-3 rounded-xl text-xs font-semibold backdrop-blur-md border transition-all ${
                  showFieldLines
                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                    : "bg-slate-900/70 text-slate-400 border-white/10 hover:text-white"
                }`}
              >
                🌐 Field Lines
              </button>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 px-3 rounded-xl text-xs font-semibold backdrop-blur-md border transition-all ${
                  soundEnabled
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : "bg-slate-900/70 text-slate-400 border-white/10 hover:text-white"
                }`}
                title="Toggle Web Audio Electromagnetic Synth"
              >
                {soundEnabled ? "🔊 Sound ON" : "🔇 Sound OFF"}
              </button>
              <button
                onClick={handleExportImage}
                className="p-2 px-3 rounded-xl text-xs font-semibold bg-slate-900/70 hover:bg-slate-800 text-slate-200 backdrop-blur-md border border-white/10 transition-all"
                title="Export Canvas PNG"
              >
                📸 Export
              </button>
            </div>

            {/* Realtime Physics Telemetry Hud */}
            <div className="absolute bottom-4 left-4 right-4 pointer-events-none grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-slate-950/75 backdrop-blur-md p-2 px-3 rounded-xl border border-white/10 text-center">
                <span className="text-[10px] text-slate-400 block uppercase">Peak Flux ($B_{"{max}"}$)</span>
                <span className="text-sm font-extrabold font-mono text-cyan-400">{stats.bMax} T</span>
              </div>
              <div className="bg-slate-950/75 backdrop-blur-md p-2 px-3 rounded-xl border border-white/10 text-center">
                <span className="text-[10px] text-slate-400 block uppercase">Active Spikes</span>
                <span className="text-sm font-extrabold font-mono text-purple-400">{stats.spikes}</span>
              </div>
              <div className="bg-slate-950/75 backdrop-blur-md p-2 px-3 rounded-xl border border-white/10 text-center">
                <span className="text-[10px] text-slate-400 block uppercase">Kinetic Energy</span>
                <span className="text-sm font-extrabold font-mono text-emerald-400">{stats.kinetic} J</span>
              </div>
              <div className="bg-slate-950/75 backdrop-blur-md p-2 px-3 rounded-xl border border-white/10 text-center">
                <span className="text-[10px] text-slate-400 block uppercase">Frame Rate</span>
                <span className="text-sm font-extrabold font-mono text-amber-400">{stats.fps} FPS</span>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="flex flex-col sm:flex-row justify-between items-center px-2 text-xs text-slate-400 gap-2">
            <span>
              Preset Active: <strong className="text-slate-200">{PRESETS[presetKey]?.name}</strong>
            </span>
            <span>Tip: Drag existing magnet circles or click 'Add North/South' to build custom fields</span>
          </div>
        </div>
      </div>
    </div>
  );
}
