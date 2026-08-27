import React, { useState, useEffect, useRef, useCallback } from "react";

// Multispectral Telescope Observatories & Color Palette Configs
const TELESCOPES = {
  multispectral: {
    id: "multispectral",
    name: "Multispectral Deep Field (Composite)",
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    accentText: "text-purple-400",
    buttonBg: "bg-purple-600 hover:bg-purple-500 text-white",
    canvasBg: "#030208",
    shockColor: "#e879f9",
    reverseShockColor: "#38bdf8",
    filamentColors: ["#f472b6", "#c084fc", "#60a5fa", "#34d399", "#fbbf24"],
    pulsarColor: "#ffffff",
    jetColor: "rgba(192, 132, 252, 0.8)",
    dustGlow: "rgba(168, 85, 247, 0.35)",
    ironColor: "#ef4444",
    siliconColor: "#3b82f6",
    oxygenColor: "#10b981",
    goldColor: "#f59e0b",
  },
  chandraXray: {
    id: "chandraXray",
    name: "Chandra X-Ray Observatory (0.5 - 8 keV)",
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    accentText: "text-cyan-400",
    buttonBg: "bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold",
    canvasBg: "#01060a",
    shockColor: "#22d3ee",
    reverseShockColor: "#f43f5e",
    filamentColors: ["#67e8f9", "#06b6d4", "#a855f7", "#ec4899", "#38bdf8"],
    pulsarColor: "#ecfeff",
    jetColor: "rgba(34, 211, 238, 0.85)",
    dustGlow: "rgba(6, 182, 212, 0.4)",
    ironColor: "#f43f5e",
    siliconColor: "#22d3ee",
    oxygenColor: "#a855f7",
    goldColor: "#e0e7ff",
  },
  webbInfrared: {
    id: "webbInfrared",
    name: "James Webb Space Telescope (MIRI/NIRCam)",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    accentText: "text-amber-400",
    buttonBg: "bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold",
    canvasBg: "#080401",
    shockColor: "#fbbf24",
    reverseShockColor: "#ea580c",
    filamentColors: ["#fef08a", "#f59e0b", "#d97706", "#b45309", "#78350f"],
    pulsarColor: "#fffbeb",
    jetColor: "rgba(245, 158, 11, 0.85)",
    dustGlow: "rgba(217, 119, 6, 0.4)",
    ironColor: "#dc2626",
    siliconColor: "#f59e0b",
    oxygenColor: "#84cc16",
    goldColor: "#fef08a",
  },
  hubbleOptical: {
    id: "hubbleOptical",
    name: "Hubble Space Telescope (H-α & [O III])",
    badge: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    accentText: "text-rose-400",
    buttonBg: "bg-rose-600 hover:bg-rose-500 text-white font-bold",
    canvasBg: "#080103",
    shockColor: "#f43f5e",
    reverseShockColor: "#10b981",
    filamentColors: ["#fda4af", "#e11d48", "#10b981", "#059669", "#38bdf8"],
    pulsarColor: "#fff1f2",
    jetColor: "rgba(244, 63, 94, 0.85)",
    dustGlow: "rgba(225, 29, 72, 0.35)",
    ironColor: "#e11d48",
    siliconColor: "#0284c7",
    oxygenColor: "#10b981",
    goldColor: "#fbbf24",
  },
  almaRadio: {
    id: "almaRadio",
    name: "ALMA Submillimeter Array (Synchrotron)",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    accentText: "text-emerald-400",
    buttonBg: "bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold",
    canvasBg: "#010804",
    shockColor: "#34d399",
    reverseShockColor: "#818cf8",
    filamentColors: ["#a7f3d0", "#10b981", "#047857", "#6366f1", "#4338ca"],
    pulsarColor: "#ecfdf5",
    jetColor: "rgba(52, 211, 153, 0.85)",
    dustGlow: "rgba(16, 185, 129, 0.35)",
    ironColor: "#f97316",
    siliconColor: "#6366f1",
    oxygenColor: "#10b981",
    goldColor: "#facc15",
  },
};

// Historic Supernova Presets
const PRESETS = [
  {
    id: "cas_a",
    name: "Cassiopeia A (Cas A)",
    desc: "Core-collapse supernova remnant (~340 yrs old) with high-speed iron knots and jet-like asymmetry.",
    telescope: "chandraXray",
    energyFoe: 1.5,
    progenitorMass: 18,
    ismDensity: 2.5,
    turbulence: 75,
    ageYears: 340,
    shockSpeedKmS: 6800,
    showPulsar: true,
    showJets: true,
    showRing: false,
  },
  {
    id: "sn1987a",
    name: "SN 1987A (Equatorial Pearl Ring)",
    desc: "Famous supernova in LMC with expanding shock wave impacting dense circumstellar rings of gas.",
    telescope: "hubbleOptical",
    energyFoe: 1.1,
    progenitorMass: 20,
    ismDensity: 8.0,
    turbulence: 50,
    ageYears: 39,
    shockSpeedKmS: 4200,
    showPulsar: false,
    showJets: false,
    showRing: true,
  },
  {
    id: "crab_nebula",
    name: "Crab Nebula Remnant (SN 1054)",
    desc: "Pulsar Wind Nebula powered by a central high-energy magnetar spinning at 30 Hz with filamentary cage.",
    telescope: "multispectral",
    energyFoe: 1.0,
    progenitorMass: 10,
    ismDensity: 0.8,
    turbulence: 90,
    ageYears: 972,
    shockSpeedKmS: 1500,
    showPulsar: true,
    showJets: true,
    showRing: false,
  },
  {
    id: "tycho_sn",
    name: "Tycho's Supernova (SN 1572)",
    desc: "Type Ia thermonuclear explosion producing a crisp spherical forward shock wave and unburnt iron clumps.",
    telescope: "chandraXray",
    energyFoe: 1.2,
    progenitorMass: 1.4,
    ismDensity: 1.2,
    turbulence: 60,
    ageYears: 454,
    shockSpeedKmS: 4800,
    showPulsar: false,
    showJets: false,
    showRing: false,
  },
  {
    id: "kepler_sn",
    name: "Kepler's Remnant (SN 1604)",
    desc: "Type Ia supernova expanding into dense progenitor wind bow shocks and rich oxygen-silicon debris.",
    telescope: "webbInfrared",
    energyFoe: 1.3,
    progenitorMass: 1.4,
    ismDensity: 4.5,
    turbulence: 65,
    ageYears: 422,
    shockSpeedKmS: 5100,
    showPulsar: false,
    showJets: false,
    showRing: false,
  },
];

export default function SupernovaRemnantStudio() {
  // State variables
  const [selectedTelescope, setSelectedTelescope] = useState("multispectral");
  const [activePreset, setActivePreset] = useState("cas_a");

  // Physics Parameters
  const [energyFoe, setEnergyFoe] = useState(1.5); // 1 Foe = 10^51 ergs
  const [progenitorMass, setProgenitorMass] = useState(18); // Solar Masses
  const [ismDensity, setIsmDensity] = useState(2.5); // atoms / cm3
  const [turbulence, setTurbulence] = useState(75); // Rayleigh-Taylor mixing %
  const [ageYears, setAgeYears] = useState(340); // Years since explosion
  const [shockSpeedKmS, setShockSpeedKmS] = useState(6800); // km/s

  // Toggles & Interactivity
  const [showPulsar, setShowPulsar] = useState(true);
  const [showJets, setShowJets] = useState(true);
  const [showRing, setShowRing] = useState(false);
  const [showReverseShock, setShowReverseShock] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Canvas Refs & Simulation State
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const audioCtxRef = useRef(null);
  const particlesRef = useRef([]);
  const dustClumpsRef = useRef([]);
  const ringPearlRef = useRef([]);
  const blastTimeRef = useRef(0);
  const isDraggingRef = useRef(false);
  const jetAngleRef = useRef(-Math.PI / 4);

  const telescope = TELESCOPES[selectedTelescope] || TELESCOPES.multispectral;

  // Initialize Web Audio API safely
  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
  }, []);

  // Audio trigger for detonation explosion rumble
  const triggerAudioExplosion = useCallback(() => {
    if (!soundEnabled) return;
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Low frequency rumble oscillator
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 1.5);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

      // Filter for sub-bass shock rumble
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(350, now);
      filter.frequency.exponentialRampToValueAtTime(60, now + 1.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.8);
    } catch (e) {
      console.warn("Audio explosion play failed", e);
    }
  }, [soundEnabled, initAudio]);

  // Generate Ejecta Filaments & Particles
  const resetParticles = useCallback(() => {
    const particles = [];
    const count = 1200;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      // Ray-Taylor clumpiness
      const rFactor = 0.4 + Math.random() * 0.6;
      const speed = (0.5 + Math.random() * 0.9) * (shockSpeedKmS / 7000);

      // Element assignment based on depth (Onion shell structure of star)
      const elementRoll = Math.random();
      let element = "iron"; // core
      if (elementRoll > 0.75) element = "gold";
      else if (elementRoll > 0.45) element = "oxygen";
      else if (elementRoll > 0.2) element = "silicon";

      particles.push({
        x: 0,
        y: 0,
        angle,
        rFactor,
        dist: Math.random() * 20,
        speed,
        size: 1 + Math.random() * 3.5,
        colorIdx: Math.floor(Math.random() * telescope.filamentColors.length),
        element,
        opacity: 0.6 + Math.random() * 0.4,
        turbOffset: Math.random() * 100,
      });
    }

    // Circumstellar dust clumps
    const dust = [];
    for (let i = 0; i < 40; i++) {
      const dAngle = Math.random() * Math.PI * 2;
      const dDist = 120 + Math.random() * 180;
      dust.push({
        x: Math.cos(dAngle) * dDist,
        y: Math.sin(dAngle) * dDist,
        radius: 12 + Math.random() * 25,
        intensity: 0.3 + Math.random() * 0.7,
        struck: false,
      });
    }

    // Equatorial Ring Pearls (SN 1987A style)
    const pearls = [];
    const pearlCount = 24;
    for (let i = 0; i < pearlCount; i++) {
      const pAngle = (i / pearlCount) * Math.PI * 2;
      pearls.push({
        angle: pAngle,
        rx: 140,
        ry: 55, // Elliptical ring inclination
        brightness: 0.2 + Math.random() * 0.3,
      });
    }

    particlesRef.current = particles;
    dustClumpsRef.current = dust;
    ringPearlRef.current = pearls;
    blastTimeRef.current = 0;
  }, [shockSpeedKmS, telescope.filamentColors.length]);

  // Detonate Action
  const handleDetonate = () => {
    resetParticles();
    triggerAudioExplosion();
  };

  // Handle Preset Select
  const handlePresetSelect = (presetId) => {
    const p = PRESETS.find((item) => item.id === presetId);
    if (!p) return;

    setActivePreset(p.id);
    setSelectedTelescope(p.telescope);
    setEnergyFoe(p.energyFoe);
    setProgenitorMass(p.progenitorMass);
    setIsmDensity(p.ismDensity);
    setTurbulence(p.turbulence);
    setAgeYears(p.ageYears);
    setShockSpeedKmS(p.shockSpeedKmS);
    setShowPulsar(p.showPulsar);
    setShowJets(p.showJets);
    setShowRing(p.showRing);

    resetParticles();
    triggerAudioExplosion();
  };

  // Canvas Interaction: Click to add dust clump or trigger shockwave pulse
  const handleCanvasMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left - canvas.width / 2;
    const clickY = e.clientY - rect.top - canvas.height / 2;

    isDraggingRef.current = true;
    jetAngleRef.current = Math.atan2(clickY, clickX);

    // Spawn dust clump at click location
    dustClumpsRef.current.push({
      x: clickX,
      y: clickY,
      radius: 18 + Math.random() * 20,
      intensity: 0.8,
      struck: false,
    });
  };

  const handleCanvasMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left - canvas.width / 2;
    const clickY = e.clientY - rect.top - canvas.height / 2;
    jetAngleRef.current = Math.atan2(clickY, clickX);
  };

  const handleCanvasMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Main Canvas Render Loop
  useEffect(() => {
    resetParticles();
  }, [resetParticles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let lastTime = performance.now();

    const render = (now) => {
      const delta = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      if (isPlaying) {
        blastTimeRef.current += delta;
      }

      const time = blastTimeRef.current;
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;

      // Clear canvas with deep space theme
      ctx.fillStyle = telescope.canvasBg;
      ctx.fillRect(0, 0, width, height);

      // Background Starfield
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      for (let s = 0; s < 70; s++) {
        const sx = (Math.sin(s * 93.1) * 0.5 + 0.5) * width;
        const sy = (Math.cos(s * 47.7) * 0.5 + 0.5) * height;
        const sSize = (Math.sin(s + time * 2) * 0.5 + 0.5) * 1.5 + 0.5;
        ctx.fillRect(sx, sy, sSize, sSize);
      }

      ctx.save();
      ctx.translate(cx, cy);

      // Compute Expanding Shockwave Radius based on Sedov-Taylor Blast Wave Solution
      // R(t) ~ (E / rho)^1/5 * t^2/5
      const sedovFactor = Math.pow((energyFoe * 10) / ismDensity, 0.2);
      const shockRadius = Math.min(
        50 + sedovFactor * Math.pow(time * 30 + ageYears * 0.1, 0.6) * 12,
        Math.min(width, height) * 0.44
      );

      const reverseShockRadius = shockRadius * 0.65;

      // Draw Circumstellar Dust Clumps
      dustClumpsRef.current.forEach((d) => {
        const distFromCenter = Math.hypot(d.x, d.y);
        const isStruck = distFromCenter <= shockRadius + 15;
        if (isStruck) d.struck = true;

        const grad = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.radius);
        if (d.struck) {
          grad.addColorStop(0, telescope.shockColor);
          grad.addColorStop(0.6, telescope.dustGlow);
          grad.addColorStop(1, "rgba(0,0,0,0)");
        } else {
          grad.addColorStop(0, "rgba(100, 116, 139, 0.4)");
          grad.addColorStop(1, "rgba(0,0,0,0)");
        }
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Equatorial Pearl Ring (SN 1987A style)
      if (showRing) {
        ctx.save();
        ctx.strokeStyle = "rgba(251, 191, 36, 0.3)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, 140, 55, 0, 0, Math.PI * 2);
        ctx.stroke();

        ringPearlRef.current.forEach((p) => {
          const px = Math.cos(p.angle) * p.rx;
          const py = Math.sin(p.angle) * p.ry;
          const pDist = Math.hypot(px, py);
          const struck = shockRadius >= pDist - 10;

          const pGlow = ctx.createRadialGradient(px, py, 0, px, py, struck ? 12 : 5);
          if (struck) {
            pGlow.addColorStop(0, "#ffffff");
            pGlow.addColorStop(0.4, "#fef08a");
            pGlow.addColorStop(1, "rgba(245, 158, 11, 0)");
          } else {
            pGlow.addColorStop(0, "#fbbf24");
            pGlow.addColorStop(1, "rgba(0,0,0,0)");
          }
          ctx.fillStyle = pGlow;
          ctx.beginPath();
          ctx.arc(px, py, struck ? 10 : 4, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      }

      // Draw Forward Blast Wave (Primary Shock Front)
      ctx.save();
      ctx.shadowColor = telescope.shockColor;
      ctx.shadowBlur = 20;
      ctx.strokeStyle = telescope.shockColor;
      ctx.lineWidth = 3;
      ctx.beginPath();

      const numPoints = 120;
      for (let i = 0; i <= numPoints; i++) {
        const a = (i / numPoints) * Math.PI * 2;
        // Rayleigh-Taylor turbulence ripple noise
        const turbNoise =
          Math.sin(a * 12 + time * 3) * (turbulence * 0.15) +
          Math.cos(a * 24 - time * 2) * (turbulence * 0.08);
        const r = shockRadius + turbNoise;
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();

      // Draw Reverse Shock Wave
      if (showReverseShock) {
        ctx.save();
        ctx.shadowColor = telescope.reverseShockColor;
        ctx.shadowBlur = 15;
        ctx.strokeStyle = telescope.reverseShockColor;
        ctx.lineWidth = 1.8;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();

        for (let i = 0; i <= numPoints; i++) {
          const a = (i / numPoints) * Math.PI * 2;
          const turbNoise = Math.cos(a * 8 + time * 4) * (turbulence * 0.1);
          const r = reverseShockRadius + turbNoise;
          const x = Math.cos(a) * r;
          const y = Math.sin(a) * r;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
      }

      // Draw Rayleigh-Taylor Ejecta Filaments & Element Shell Particles
      particlesRef.current.forEach((p) => {
        const maxDist = shockRadius * p.rFactor;
        const curDist = Math.min(p.dist + time * p.speed * 45, maxDist);
        p.dist = curDist;

        // Turbulence noise jitter
        const turbAngle = p.angle + Math.sin(time * 3 + p.turbOffset) * (turbulence / 400);
        const px = Math.cos(turbAngle) * curDist;
        const py = Math.sin(turbAngle) * curDist;

        // Color selection based on element type or telescope palette
        let color = telescope.filamentColors[p.colorIdx % telescope.filamentColors.length];
        if (selectedTelescope === "multispectral") {
          if (p.element === "iron") color = telescope.ironColor;
          else if (p.element === "silicon") color = telescope.siliconColor;
          else if (p.element === "oxygen") color = telescope.oxygenColor;
          else if (p.element === "gold") color = telescope.goldColor;
        }

        ctx.fillStyle = color;
        ctx.globalAlpha = p.opacity;

        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Draw tendril connecting line for high turbulence
        if (turbulence > 40 && curDist > 40) {
          ctx.strokeStyle = color;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px * 0.85, py * 0.85);
          ctx.stroke();
        }
      });
      ctx.globalAlpha = 1.0;

      // Draw Central Pulsar / Magnetar Engine & Relativistic Jets
      if (showPulsar) {
        const jAngle = jetAngleRef.current;

        // Relativistic Jets
        if (showJets) {
          ctx.save();
          ctx.strokeStyle = telescope.jetColor;
          ctx.lineWidth = 4;
          ctx.shadowColor = telescope.jetColor;
          ctx.shadowBlur = 25;

          // Positive direction jet
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(jAngle) * (shockRadius * 1.2), Math.sin(jAngle) * (shockRadius * 1.2));
          ctx.stroke();

          // Opposing direction jet
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(-Math.cos(jAngle) * (shockRadius * 1.2), -Math.sin(jAngle) * (shockRadius * 1.2));
          ctx.stroke();
          ctx.restore();
        }

        // Spinning Pulsar Beacon Glow
        const pulseRatio = (Math.sin(time * 15) * 0.5 + 0.5);
        const pulsarGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, 18 + pulseRatio * 10);
        pulsarGlow.addColorStop(0, "#ffffff");
        pulsarGlow.addColorStop(0.3, telescope.pulsarColor);
        pulsarGlow.addColorStop(1, "rgba(0,0,0,0)");

        ctx.fillStyle = pulsarGlow;
        ctx.beginPath();
        ctx.arc(0, 0, 20 + pulseRatio * 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [
    isPlaying,
    telescope,
    energyFoe,
    ismDensity,
    turbulence,
    ageYears,
    showPulsar,
    showJets,
    showRing,
    showReverseShock,
    selectedTelescope,
  ]);

  // Derived Nucleosynthesis Metrics
  const ironYield = (progenitorMass * 0.08 * (energyFoe / 1.5)).toFixed(3);
  const siliconYield = (progenitorMass * 0.12 * (energyFoe / 1.5)).toFixed(3);
  const oxygenYield = (progenitorMass * 0.42 * (energyFoe / 1.5)).toFixed(2);
  const goldYieldKg = (energyFoe * 1.42 * 1e24).toExponential(2); // Estimated r-process kg
  const peakTempMK = (Math.pow(energyFoe, 0.25) * 45).toFixed(1);

  // Snapshot PNG export
  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `supernova_remnant_${activePreset}_${selectedTelescope}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 font-sans text-slate-100">
      
      {/* Studio Header Card */}
      <div className="bg-slate-950/80 border border-slate-800/90 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${telescope.badge}`}>
                Astrophysics & Cosmic Nucleosynthesis Studio
              </span>
              <span className="bg-slate-800/80 text-slate-300 text-xs px-3 py-1 rounded-full border border-slate-700">
                Sedov-Taylor Blast Wave Dynamics
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-2">
              Supernova Remnant <span className={telescope.accentText}>Shockwave Studio</span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base max-w-3xl leading-relaxed">
              Simulate core-collapse & thermonuclear stellar explosions, Rayleigh-Taylor instability ejecta filaments,
              and cosmic nucleosynthesis of heavy elements across multi-wavelength observatories.
            </p>
          </div>

          {/* Action Header Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleDetonate}
              className={`px-5 py-2.5 text-sm rounded-xl font-bold shadow-lg transition-all transform active:scale-95 ${telescope.buttonBg}`}
            >
              💥 Detonate Explosion
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-4 py-2.5 text-sm rounded-xl font-semibold bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-800 transition-all"
            >
              {isPlaying ? "⏸ Pause" : "▶ Play"}
            </button>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`px-4 py-2.5 text-sm rounded-xl font-semibold border transition-all ${
                soundEnabled
                  ? "bg-purple-950/80 border-purple-500/50 text-purple-300"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              {soundEnabled ? "🔊 Audio FX: ON" : "🔇 Audio FX: OFF"}
            </button>
            <button
              onClick={handleExportPNG}
              className="px-4 py-2.5 text-sm rounded-xl font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-all"
            >
              📸 Snapshot
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Interactive Canvas Area (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          <div className="relative bg-slate-950 rounded-3xl border border-slate-800/90 overflow-hidden shadow-2xl">
            <canvas
              ref={canvasRef}
              width={800}
              height={550}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              className="w-full h-auto block cursor-crosshair"
            />

            {/* Interactive Canvas Overlay Badge */}
            <div className="absolute top-4 left-4 pointer-events-none flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-800 text-xs text-slate-300 shadow-xl">
              <span className={`w-2.5 h-2.5 rounded-full ${telescope.accentText} bg-current animate-pulse`}></span>
              Click canvas to inject dust clump | Drag to direct relativistic jets
            </div>

            {/* Telemetry Real-time HUD overlay */}
            <div className="absolute bottom-4 left-4 right-4 pointer-events-none grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-950/85 backdrop-blur-xl p-3 rounded-2xl border border-slate-800/90 shadow-lg">
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                  Shock Speed
                </span>
                <span className={`font-mono font-extrabold text-base ${telescope.accentText}`}>
                  {shockSpeedKmS.toLocaleString()} km/s
                </span>
              </div>

              <div className="bg-slate-950/85 backdrop-blur-xl p-3 rounded-2xl border border-slate-800/90 shadow-lg">
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                  Peak Plasma Temp
                </span>
                <span className="font-mono font-extrabold text-base text-slate-100">
                  {peakTempMK} MK
                </span>
              </div>

              <div className="bg-slate-950/85 backdrop-blur-xl p-3 rounded-2xl border border-slate-800/90 shadow-lg">
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                  Explosion Age
                </span>
                <span className="font-mono font-extrabold text-base text-slate-100">
                  {ageYears} Yrs
                </span>
              </div>

              <div className="bg-slate-950/85 backdrop-blur-xl p-3 rounded-2xl border border-slate-800/90 shadow-lg">
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                  Blast Energy
                </span>
                <span className="font-mono font-extrabold text-base text-purple-400">
                  {energyFoe} Foe
                </span>
              </div>
            </div>
          </div>

          {/* Historic Supernova Presets */}
          <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80 backdrop-blur-xl">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Historic Supernova Remnant Presets
            </div>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handlePresetSelect(p.id)}
                  className={`px-4 py-2 text-xs rounded-xl border font-semibold transition-all ${
                    activePreset === p.id
                      ? `${p.id === activePreset ? telescope.badge : "bg-purple-500/20 text-purple-300 border-purple-500/40"} shadow-md`
                      : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-3 italic">
              {PRESETS.find((p) => p.id === activePreset)?.desc}
            </p>
          </div>
        </div>

        {/* Right Controls & Parameter Panel (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Telescope Filter Selector */}
          <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80 backdrop-blur-xl">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-3">
              Observatory Wavelength Spectrum
            </label>
            <div className="grid grid-cols-1 gap-2">
              {Object.values(TELESCOPES).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTelescope(t.id)}
                  className={`w-full text-left px-3.5 py-2.5 text-xs rounded-xl border transition-all flex items-center justify-between ${
                    selectedTelescope === t.id
                      ? `${t.badge} font-bold shadow-md`
                      : "bg-slate-900/40 border-slate-800/60 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span>{t.name}</span>
                  {selectedTelescope === t.id && <span>✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Physics Parameter Sliders */}
          <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80 backdrop-blur-xl space-y-5">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2">
              Blast Wave & Environment Controls
            </h3>

            {/* Explosion Energy Slider */}
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-300">Explosion Energy (Foe = 10⁵¹ erg)</span>
                <span className={`font-mono font-bold ${telescope.accentText}`}>{energyFoe} Foe</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={energyFoe}
                onChange={(e) => setEnergyFoe(parseFloat(e.target.value))}
                className="w-full accent-purple-500 bg-slate-800 rounded-lg h-1.5 cursor-pointer"
              />
            </div>

            {/* Progenitor Star Mass */}
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-300">Progenitor Core Mass (M☉)</span>
                <span className={`font-mono font-bold ${telescope.accentText}`}>{progenitorMass} M☉</span>
              </div>
              <input
                type="range"
                min="1.4"
                max="40"
                step="0.5"
                value={progenitorMass}
                onChange={(e) => setProgenitorMass(parseFloat(e.target.value))}
                className="w-full accent-purple-500 bg-slate-800 rounded-lg h-1.5 cursor-pointer"
              />
            </div>

            {/* ISM Density */}
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-300">Interstellar Density (n₀ atoms/cm³)</span>
                <span className={`font-mono font-bold ${telescope.accentText}`}>{ismDensity}</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="10"
                step="0.1"
                value={ismDensity}
                onChange={(e) => setIsmDensity(parseFloat(e.target.value))}
                className="w-full accent-purple-500 bg-slate-800 rounded-lg h-1.5 cursor-pointer"
              />
            </div>

            {/* Rayleigh-Taylor Turbulence */}
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-300">Rayleigh-Taylor Turbulence</span>
                <span className={`font-mono font-bold ${telescope.accentText}`}>{turbulence}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={turbulence}
                onChange={(e) => setTurbulence(parseInt(e.target.value))}
                className="w-full accent-purple-500 bg-slate-800 rounded-lg h-1.5 cursor-pointer"
              />
            </div>

            {/* Shock Velocity */}
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-300">Forward Shock Velocity</span>
                <span className={`font-mono font-bold ${telescope.accentText}`}>{shockSpeedKmS} km/s</span>
              </div>
              <input
                type="range"
                min="1000"
                max="10000"
                step="250"
                value={shockSpeedKmS}
                onChange={(e) => setShockSpeedKmS(parseInt(e.target.value))}
                className="w-full accent-purple-500 bg-slate-800 rounded-lg h-1.5 cursor-pointer"
              />
            </div>

            {/* Component Toggles */}
            <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setShowPulsar(!showPulsar)}
                className={`px-3 py-2 rounded-xl border text-center transition-all ${
                  showPulsar ? "bg-purple-950/60 border-purple-500/40 text-purple-300" : "bg-slate-900/40 border-slate-800 text-slate-500"
                }`}
              >
                Pulsar Engine
              </button>

              <button
                onClick={() => setShowJets(!showJets)}
                className={`px-3 py-2 rounded-xl border text-center transition-all ${
                  showJets ? "bg-cyan-950/60 border-cyan-500/40 text-cyan-300" : "bg-slate-900/40 border-slate-800 text-slate-500"
                }`}
              >
                Relativistic Jets
              </button>

              <button
                onClick={() => setShowReverseShock(!showReverseShock)}
                className={`px-3 py-2 rounded-xl border text-center transition-all ${
                  showReverseShock ? "bg-rose-950/60 border-rose-500/40 text-rose-300" : "bg-slate-900/40 border-slate-800 text-slate-500"
                }`}
              >
                Reverse Shock
              </button>

              <button
                onClick={() => setShowRing(!showRing)}
                className={`px-3 py-2 rounded-xl border text-center transition-all ${
                  showRing ? "bg-amber-950/60 border-amber-500/40 text-amber-300" : "bg-slate-900/40 border-slate-800 text-slate-500"
                }`}
              >
                Equatorial Ring
              </button>
            </div>
          </div>

          {/* Nucleosynthesis Yield Readout */}
          <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80 backdrop-blur-xl">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              Cosmic Nucleosynthesis Yields
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Iron (⁵⁶Fe) Ejected</span>
                <span className="font-mono font-bold text-sm text-red-400">{ironYield} M☉</span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Silicon (²⁸Si) Ejected</span>
                <span className="font-mono font-bold text-sm text-blue-400">{siliconYield} M☉</span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Oxygen (¹⁶O) Ejected</span>
                <span className="font-mono font-bold text-sm text-emerald-400">{oxygenYield} M☉</span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Gold (r-Process)</span>
                <span className="font-mono font-bold text-sm text-amber-400">{goldYieldKg} kg</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
