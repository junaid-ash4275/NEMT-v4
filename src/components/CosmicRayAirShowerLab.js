import React, { useState, useEffect, useRef, useCallback } from "react";

// Visual Themes & Color Tokens
const THEMES = {
  cherenkovCyan: {
    id: "cherenkovCyan",
    name: "Cherenkov Electric Blue",
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    accentText: "text-cyan-400",
    border: "border-cyan-500/30",
    cardBg: "bg-slate-900/85 backdrop-blur-md border-cyan-500/20",
    buttonBg: "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25",
    canvasBg: "#030914",
    primaryColor: "#00f0ff",
    hadronicColor: "#ef4444",
    emColor: "#facc15",
    muonColor: "#e879f9",
    cherenkovColor: "rgba(6, 182, 212, 0.45)",
    detectorColor: "#06b6d4",
    gridLine: "rgba(6, 182, 212, 0.08)",
  },
  violetGamma: {
    id: "violetGamma",
    name: "Ultraviolet Cascade",
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    accentText: "text-purple-400",
    border: "border-purple-500/30",
    cardBg: "bg-slate-900/85 backdrop-blur-md border-purple-500/20",
    buttonBg: "bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white shadow-lg shadow-purple-500/25",
    canvasBg: "#090414",
    primaryColor: "#c084fc",
    hadronicColor: "#f43f5e",
    emColor: "#fde047",
    muonColor: "#38bdf8",
    cherenkovColor: "rgba(168, 85, 247, 0.45)",
    detectorColor: "#a855f7",
    gridLine: "rgba(168, 85, 247, 0.08)",
  },
  solarPlasma: {
    id: "solarPlasma",
    name: "Solar Flare Crimson",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    accentText: "text-amber-400",
    border: "border-amber-500/30",
    cardBg: "bg-slate-900/85 backdrop-blur-md border-amber-500/20",
    buttonBg: "bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white shadow-lg shadow-amber-500/25",
    canvasBg: "#140702",
    primaryColor: "#f59e0b",
    hadronicColor: "#dc2626",
    emColor: "#fbbf24",
    muonColor: "#22d3ee",
    cherenkovColor: "rgba(245, 158, 11, 0.45)",
    detectorColor: "#f59e0b",
    gridLine: "rgba(245, 158, 11, 0.08)",
  },
  emeraldAurora: {
    id: "emeraldAurora",
    name: "Auroral Emerald Veil",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    accentText: "text-emerald-400",
    border: "border-emerald-500/30",
    cardBg: "bg-slate-900/85 backdrop-blur-md border-emerald-500/20",
    buttonBg: "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25",
    canvasBg: "#02120a",
    primaryColor: "#10b981",
    hadronicColor: "#f97316",
    emColor: "#a3e635",
    muonColor: "#e879f9",
    cherenkovColor: "rgba(16, 185, 129, 0.45)",
    detectorColor: "#10b981",
    gridLine: "rgba(16, 185, 129, 0.08)",
  },
};

// Primary Particle Types
const PARTICLE_TYPES = {
  proton: {
    id: "proton",
    name: "Proton (p⁺)",
    mass: 0.938, // GeV
    charge: +1,
    symbol: "p⁺",
    desc: "Ultra-high energy relativistic single nucleon creating deep atmospheric hadronic cascade.",
    color: "#00f0ff",
    hadronicFraction: 0.7,
  },
  iron: {
    id: "iron",
    name: "Iron Nucleus (⁵⁶Fe)",
    mass: 52.1, // GeV
    charge: +26,
    symbol: "⁵⁶Fe",
    desc: "Heavy primary nucleus disintegrating high in the atmosphere, creating massive early muon fluxes.",
    color: "#f59e0b",
    hadronicFraction: 0.9,
  },
  gamma: {
    id: "gamma",
    name: "Gamma Photon (γ)",
    mass: 0,
    charge: 0,
    symbol: "γ",
    desc: "High energy photon triggering pure electromagnetic e⁺e⁻ pair-production shower with low muon count.",
    color: "#facc15",
    hadronicFraction: 0.05,
  },
  neutrino: {
    id: "neutrino",
    name: "UHE Neutrino (ν)",
    mass: 0,
    charge: 0,
    symbol: "ν_τ",
    desc: "Weakly interacting particle penetrating deep into lower atmosphere before sudden explosive shower interaction.",
    color: "#e879f9",
    hadronicFraction: 0.5,
  },
};

// Preset Configurations
const PRESETS = {
  omgParticle: {
    id: "omgParticle",
    name: "1991 'Oh-My-God' Particle",
    energyExp: 20.5, // 3.2 x 10^20 eV
    particle: "proton",
    zenith: 34,
    magneticField: 45,
    atmosphere: "standard",
    desc: "Record 3.2 × 10²⁰ eV extreme cosmic ray observed over Utah; exceeds theoretical GZK cutoff limit.",
    theme: "cherenkovCyan",
  },
  pevatronProton: {
    id: "pevatronProton",
    name: "Galactic PeVatron Accelerator",
    energyExp: 15.2, // 1.5 PeV
    particle: "proton",
    zenith: 15,
    magneticField: 30,
    atmosphere: "standard",
    desc: "Standard Galactic supernova remnant accelerator producing PeV cosmic rays.",
    theme: "solarPlasma",
  },
  ironHeavyNucleus: {
    id: "ironHeavyNucleus",
    name: "Super-GZK Heavy Iron Nucleus",
    energyExp: 19.8,
    particle: "iron",
    zenith: 45,
    magneticField: 50,
    atmosphere: "standard",
    desc: "Heavy ⁵⁶Fe primary deflected strongly by galactic B-fields, creating high altitude shower maximum.",
    theme: "emeraldAurora",
  },
  deepNeutrinoShower: {
    id: "deepNeutrinoShower",
    name: "Horizontal Deep Neutrino (PeV)",
    energyExp: 17.5,
    particle: "neutrino",
    zenith: 60,
    magneticField: 20,
    atmosphere: "rare",
    desc: "Deep horizontal atmospheric traversal with delayed weak interaction near ground level.",
    theme: "violetGamma",
  },
};

export default function CosmicRayAirShowerLab() {
  // Config & State Parameters
  const [selectedPreset, setSelectedPreset] = useState("omgParticle");
  const [themeKey, setThemeKey] = useState("cherenkovCyan");
  const [particleType, setParticleType] = useState("proton");
  const [energyExponent, setEnergyExponent] = useState(20.0); // 10^20.0 eV
  const [zenithAngle, setZenithAngle] = useState(30); // degrees from vertical
  const [magneticField, setMagneticField] = useState(35); // microTesla
  const [atmosphereModel, setAtmosphereModel] = useState("standard");
  const [showHadronic, setShowHadronic] = useState(true);
  const [showEM, setShowEM] = useState(true);
  const [showMuons, setShowMuons] = useState(true);
  const [showCherenkov, setShowCherenkov] = useState(true);
  const [showDetectors, setShowDetectors] = useState(true);
  const [showProfileChart, setShowProfileChart] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [simSpeed, setSimSpeed] = useState(1.0);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState("controls"); // controls, telemetry, presets, learn
  const [inspectedParticle, setInspectedParticle] = useState(null);

  // Live Statistics Telemetry
  const [stats, setStats] = useState({
    totalParticles: 0,
    emCount: 0,
    hadronicCount: 0,
    muonCount: 0,
    cherenkovPhotons: 0,
    xMaxDepth: 750, // g/cm^2
    groundDetectorHits: 0,
    footprintRadiusKm: 0,
    maxEnergyEeV: 100,
  });

  const theme = THEMES[themeKey] || THEMES.cherenkovCyan;
  const currentParticle = PARTICLE_TYPES[particleType] || PARTICLE_TYPES.proton;

  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const audioCtxRef = useRef(null);
  const particlesRef = useRef([]);
  const cherenkovWavesRef = useRef([]);
  const groundDetectorsRef = useRef([]);
  const showerProfileRef = useRef([]);

  // Initialize Ground Detector Grid Array
  const initDetectors = useCallback((width, height) => {
    const detectors = [];
    const count = 18;
    const margin = 40;
    const spacing = (width - margin * 2) / (count - 1);
    const groundY = height - 40;

    for (let i = 0; i < count; i++) {
      detectors.push({
        id: i,
        x: margin + i * spacing,
        y: groundY,
        triggered: false,
        signalIntensity: 0,
        hitTime: 0,
        particlesHit: 0,
      });
    }
    groundDetectorsRef.current = detectors;
  }, []);

  // Web Audio Synthesizer
  const playCherenkovSound = useCallback((frequency = 880, type = "sine") => {
    if (!audioEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(frequency * 0.5, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.warn("Audio Context init error:", e);
    }
  }, [audioEnabled]);

  // Spawn Primary Particle Cascade
  const spawnPrimaryShower = useCallback((customX = null, customY = null) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const width = canvas.width;
    const height = canvas.height;

    const rad = (zenithAngle * Math.PI) / 180;
    const startX = customX !== null ? customX : width * 0.5 + Math.sin(rad) * height * 0.35;
    const startY = customY !== null ? customY : 30;

    const speed = 4.5 * simSpeed;
    const vx = -Math.sin(rad) * speed;
    const vy = Math.cos(rad) * speed;

    const primaryEnergy = Math.pow(10, energyExponent);
    const particleObj = {
      id: Math.random(),
      type: particleType,
      category: "primary",
      x: startX,
      y: startY,
      vx,
      vy,
      energy: primaryEnergy,
      generation: 0,
      maxGen: Math.min(8, Math.floor(energyExponent - 13)),
      life: 1.0,
      decayDepth: 120 + Math.random() * 80, // Y coordinate of first interaction
      interacted: false,
    };

    particlesRef.current = [particleObj];
    cherenkovWavesRef.current = [];
    showerProfileRef.current = new Array(30).fill(0);

    // Reset detector hits
    groundDetectorsRef.current.forEach((d) => {
      d.triggered = false;
      d.signalIntensity = 0;
      d.particlesHit = 0;
    });

    playCherenkovSound(1200, "triangle");
  }, [zenithAngle, simSpeed, energyExponent, particleType, playCherenkovSound]);

  // Apply Preset Config
  const handlePresetSelect = (presetKey) => {
    const p = PRESETS[presetKey];
    if (!p) return;
    setSelectedPreset(presetKey);
    setEnergyExponent(p.energyExp);
    setParticleType(p.particle);
    setZenithAngle(p.zenith);
    setMagneticField(p.magneticField);
    setAtmosphereModel(p.atmosphere);
    if (p.theme) setThemeKey(p.theme);

    setTimeout(() => {
      spawnPrimaryShower();
    }, 50);
  };

  // Main Particle Physics Animation Step
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let animationId;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      if (groundDetectorsRef.current.length === 0) {
        initDetectors(width, height);
      }

      // Clear Screen with background glow
      ctx.fillStyle = theme.canvasBg;
      ctx.fillRect(0, 0, width, height);

      // Draw Atmospheric Layers & Altitude Gradients
      const groundY = height - 40;
      const topY = 30;
      const atmosphereHeight = groundY - topY;

      const atmosphereGradient = ctx.createLinearGradient(0, topY, 0, groundY);
      atmosphereGradient.addColorStop(0, "rgba(15, 23, 42, 0.2)");
      atmosphereGradient.addColorStop(0.5, "rgba(30, 41, 59, 0.4)");
      atmosphereGradient.addColorStop(1, "rgba(51, 65, 85, 0.7)");
      ctx.fillStyle = atmosphereGradient;
      ctx.fillRect(0, topY, width, atmosphereHeight);

      // Draw Altitude Isobars & Depth Labels
      ctx.strokeStyle = theme.gridLine;
      ctx.lineWidth = 1;
      const layers = 5;
      for (let i = 1; i <= layers; i++) {
        const y = topY + (atmosphereHeight / layers) * i;
        ctx.beginPath();
        ctx.setLineDash([4, 6]);
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
        ctx.setLineDash([]);

        const depthG = Math.round((i / layers) * 1030); // ~1030 g/cm^2 surface
        const altKm = Math.round((1 - i / layers) * 35);
        ctx.fillStyle = "rgba(148, 163, 184, 0.5)";
        ctx.font = "10px monospace";
        ctx.fillText(`${altKm}km | ${depthG} g/cm²`, 12, y - 4);
      }

      // Draw Geomagnetic Field Indicator Vectors
      if (magneticField > 0) {
        ctx.fillStyle = "rgba(148, 163, 184, 0.25)";
        ctx.font = "10px sans-serif";
        ctx.fillText(`B-field: ${magneticField} μT (Lorentz Deflection Enabled)`, width - 230, 25);
      }

      // Update Particles & Cascades if not paused
      const nextParticles = [];
      let currentEM = 0;
      let currentHadronic = 0;
      let currentMuons = 0;
      let currentCherenkov = 0;
      let hitDetectorsCount = 0;

      if (!isPaused) {
        // Process active particles
        for (let p of particlesRef.current) {
          // Geomagnetic deflection (Lorentz force effect on charged particles)
          const charge = p.type === "gamma" || p.type === "neutrino" ? 0 : 1;
          const deflection = (magneticField / 100) * 0.08 * charge;
          p.vx += deflection * simSpeed;

          p.x += p.vx * simSpeed;
          p.y += p.vy * simSpeed;

          // Track in Depth Profile Chart
          const depthIndex = Math.min(29, Math.max(0, Math.floor(((p.y - topY) / atmosphereHeight) * 30)));
          if (!isNaN(depthIndex)) {
            showerProfileRef.current[depthIndex] = (showerProfileRef.current[depthIndex] || 0) + 1;
          }

          // Count Categories
          if (p.category === "hadronic") currentHadronic++;
          else if (p.category === "em") currentEM++;
          else if (p.category === "muon") currentMuons++;

          // Cherenkov UV Wavefront Generation
          if (showCherenkov && Math.random() < 0.25 && p.y > topY + 50 && p.y < groundY - 20) {
            cherenkovWavesRef.current.push({
              x: p.x,
              y: p.y,
              radius: 2,
              maxRadius: 28 + Math.random() * 20,
              alpha: 0.6,
            });
            currentCherenkov++;
          }

          // Particle Branching / Decay Interactions
          if (!p.interacted && p.y >= p.decayDepth && p.generation < p.maxGen) {
            p.interacted = true;

            // Primary Interaction / Hadronic Multiparticle Production
            const childCount = Math.floor(3 + Math.random() * 4);
            for (let c = 0; c < childCount; c++) {
              const angle = Math.atan2(p.vy, p.vx) + (Math.random() - 0.5) * 0.65;
              const childSpeed = (3.5 + Math.random() * 2) * simSpeed;
              const randType = Math.random();

              let childCategory = "em";
              let childType = "electron";
              let childColor = theme.emColor;

              if (randType < currentParticle.hadronicFraction) {
                childCategory = "hadronic";
                childType = "pion";
                childColor = theme.hadronicColor;
              } else if (randType > 0.85) {
                childCategory = "muon";
                childType = "muon";
                childColor = theme.muonColor;
              }

              nextParticles.push({
                id: Math.random(),
                type: childType,
                category: childCategory,
                x: p.x,
                y: p.y,
                vx: Math.cos(angle) * childSpeed,
                vy: Math.sin(angle) * childSpeed,
                energy: p.energy / childCount,
                generation: p.generation + 1,
                maxGen: p.maxGen,
                decayDepth: p.y + 40 + Math.random() * 90,
                interacted: false,
                color: childColor,
              });
            }
          } else if (p.y < groundY) {
            nextParticles.push(p);
          } else {
            // Reached ground level - Check Detector Hits
            groundDetectorsRef.current.forEach((det) => {
              const dist = Math.abs(det.x - p.x);
              if (dist < 28) {
                det.triggered = true;
                det.signalIntensity = Math.min(1.0, det.signalIntensity + 0.35);
                det.particlesHit += 1;
                det.hitTime = Date.now();
              }
            });
          }
        }

        particlesRef.current = nextParticles;
      }

      // Render Cherenkov Wavefronts
      if (showCherenkov) {
        ctx.lineWidth = 1.2;
        const nextWaves = [];
        for (let w of cherenkovWavesRef.current) {
          if (!isPaused) {
            w.radius += 1.5 * simSpeed;
            w.alpha -= 0.02 * simSpeed;
          }

          if (w.alpha > 0) {
            ctx.strokeStyle = theme.cherenkovColor;
            ctx.beginPath();
            ctx.arc(w.x, w.y, w.radius, 0, Math.PI * 2);
            ctx.stroke();
            nextWaves.push(w);
          }
        }
        cherenkovWavesRef.current = nextWaves;
      }

      // Render Active Particle Tracks
      for (let p of particlesRef.current) {
        if (
          (p.category === "hadronic" && !showHadronic) ||
          (p.category === "em" && !showEM) ||
          (p.category === "muon" && !showMuons)
        ) {
          continue;
        }

        const color = p.color || (p.category === "hadronic" ? theme.hadronicColor : p.category === "muon" ? theme.muonColor : theme.emColor);

        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = p.category === "primary" ? 3 : p.category === "muon" ? 2 : 1.2;

        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 3, p.y - p.vy * 3);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.category === "primary" ? 4 : 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Render Ground Array Detector Tanks
      if (showDetectors) {
        const detY = groundY;
        ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
        ctx.fillRect(0, detY, width, 40);

        ctx.strokeStyle = "rgba(148, 163, 184, 0.3)";
        ctx.beginPath();
        ctx.moveTo(0, detY);
        ctx.lineTo(width, detY);
        ctx.stroke();

        groundDetectorsRef.current.forEach((det) => {
          if (det.triggered) {
            hitDetectorsCount++;
            if (!isPaused && det.signalIntensity > 0) {
              det.signalIntensity = Math.max(0, det.signalIntensity - 0.01);
            }
          }

          const isHit = det.signalIntensity > 0.05;
          ctx.fillStyle = isHit ? theme.primaryColor : "rgba(51, 65, 85, 0.8)";
          ctx.strokeStyle = isHit ? theme.primaryColor : theme.detectorColor;
          ctx.lineWidth = isHit ? 2 : 1;

          ctx.beginPath();
          ctx.rect(det.x - 8, detY + 8, 16, 16);
          ctx.fill();
          ctx.stroke();

          if (isHit) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
            ctx.font = "9px monospace";
            ctx.fillText(`${det.particlesHit}`, det.x - 5, detY + 38);

            // Glow pulse
            ctx.fillStyle = theme.cherenkovColor;
            ctx.beginPath();
            ctx.arc(det.x, detY + 16, 12 * det.signalIntensity, 0, Math.PI * 2);
            ctx.fill();
          }
        });

        ctx.fillStyle = "#94a3b8";
        ctx.font = "11px sans-serif";
        ctx.fillText("Pierre Auger Cherenkov Water Tank Array (Ground Level)", 12, height - 10);
      }

      // Render Heitler Longitudinal Profile Overlay Graph
      if (showProfileChart) {
        const chartW = 160;
        const chartH = 90;
        const chartX = width - chartW - 16;
        const chartY = 45;

        ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
        ctx.strokeStyle = theme.border;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(chartX, chartY, chartW, chartH, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#e2e8f0";
        ctx.font = "10px sans-serif";
        ctx.fillText("Longitudinal Profile N(X)", chartX + 10, chartY + 16);

        ctx.strokeStyle = theme.primaryColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();

        const profileData = showerProfileRef.current;
        const maxN = Math.max(1, ...profileData);

        for (let i = 0; i < profileData.length; i++) {
          const px = chartX + 10 + (i / profileData.length) * (chartW - 20);
          const py = chartY + chartH - 10 - (profileData[i] / maxN) * (chartH - 32);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Xmax indicator line
        const maxXIndex = profileData.indexOf(maxN);
        const xMaxPx = chartX + 10 + (maxXIndex / profileData.length) * (chartW - 20);
        ctx.strokeStyle = "#f43f5e";
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(xMaxPx, chartY + 22);
        ctx.lineTo(xMaxPx, chartY + chartH - 8);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Update HUD Stats
      setStats({
        totalParticles: particlesRef.current.length,
        emCount: currentEM,
        hadronicCount: currentHadronic,
        muonCount: currentMuons,
        cherenkovPhotons: currentCherenkov,
        xMaxDepth: Math.round(550 + (energyExponent - 15) * 65),
        groundDetectorHits: hitDetectorsCount,
        footprintRadiusKm: Number((1.2 + (energyExponent - 15) * 0.85).toFixed(2)),
        maxEnergyEeV: Number(Math.pow(10, energyExponent - 18).toFixed(3)),
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [
    isPaused,
    simSpeed,
    theme,
    magneticField,
    showHadronic,
    showEM,
    showMuons,
    showCherenkov,
    showDetectors,
    showProfileChart,
    energyExponent,
    currentParticle,
    initDetectors,
  ]);

  // Initial Trigger on Mount
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = canvasRef.current.parentElement.clientWidth || 900;
      canvasRef.current.height = 540;
      initDetectors(canvasRef.current.width, canvasRef.current.height);
      spawnPrimaryShower();
    }
  }, [spawnPrimaryShower, initDetectors]);

  // Canvas Click Handler (Fire Primary Particle at Clicked Coordinates)
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const clickY = (e.clientY - rect.top) * (canvas.height / rect.height);

    // If click near top, inject custom particle beam
    if (clickY < 120) {
      spawnPrimaryShower(clickX, clickY);
    }
  };

  return (
    <div className={`w-full max-w-7xl mx-auto p-4 sm:p-6 my-6 rounded-2xl bg-gradient-to-br ${theme.cardBg} border ${theme.border} text-slate-100 shadow-2xl transition-all duration-300`}>
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className={`px-3 py-1 text-xs font-mono font-semibold rounded-full border ${theme.badge}`}>
              EXTENSIVE AIR SHOWER (EAS) LAB
            </span>
            <span className="text-xs font-mono text-slate-400">
              E₀ = 10^{energyExponent.toFixed(1)} eV | Pierre Auger Detector Grid
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            Cosmic Ray Particle Cascade Laboratory
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Simulate ultra-high-energy cosmic ray (UHECR) atmospheric collisions, hadronic & electromagnetic particle cascades, relativistic muon paths, and ground Cherenkov detector footprints.
          </p>
        </div>

        {/* Action Controls & Presets Header Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => spawnPrimaryShower()}
            className={`px-4 py-2 text-sm font-semibold rounded-lg ${theme.buttonBg} transition-transform active:scale-95 flex items-center gap-2`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Fire Beam Impact
          </button>

          <button
            onClick={() => setIsPaused(!isPaused)}
            className="px-3.5 py-2 text-sm font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            {isPaused ? "Play" : "Pause"}
          </button>

          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`px-3.5 py-2 text-sm font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${
              audioEnabled ? "bg-cyan-950/60 border-cyan-500 text-cyan-300" : "bg-slate-800 border-slate-700 text-slate-400"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={audioEnabled ? "M15.536 8.464a5 5 0 010 7.072M17.586 6.414a9 9 0 010 12.728M11 5L6 9H2v6h4l5 4V5z" : "M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"}
              />
            </svg>
            {audioEnabled ? "Audio On" : "Audio Off"}
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas & Telemetry Overlay */}
      <div className="relative rounded-xl overflow-hidden border border-slate-800 shadow-inner bg-slate-950 mb-6">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full h-[540px] cursor-crosshair block"
        />

        {/* Interactive Canvas Tip Overlay */}
        <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-md border border-slate-700/60 text-xs text-slate-300 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          Click upper atmosphere region to target primary particle injection
        </div>

        {/* Live HUD Statistics Bar */}
        <div className="absolute bottom-0 inset-x-0 bg-slate-950/85 backdrop-blur-md border-t border-slate-800 p-3 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 text-xs font-mono">
          <div className="bg-slate-900/60 p-2 rounded border border-slate-800/80">
            <div className="text-slate-400">Particles (N)</div>
            <div className={`text-base font-bold ${theme.accentText}`}>{stats.totalParticles}</div>
          </div>
          <div className="bg-slate-900/60 p-2 rounded border border-slate-800/80">
            <div className="text-slate-400">Shower Max (X_max)</div>
            <div className="text-base font-bold text-rose-400">{stats.xMaxDepth} g/cm²</div>
          </div>
          <div className="bg-slate-900/60 p-2 rounded border border-slate-800/80">
            <div className="text-slate-400">Ground Tanks Hit</div>
            <div className="text-base font-bold text-emerald-400">{stats.groundDetectorHits} / 18</div>
          </div>
          <div className="bg-slate-900/60 p-2 rounded border border-slate-800/80">
            <div className="text-slate-400">Ground Radius</div>
            <div className="text-base font-bold text-amber-400">{stats.footprintRadiusKm} km</div>
          </div>
          <div className="bg-slate-900/60 p-2 rounded border border-slate-800/80">
            <div className="text-slate-400">Muon Count (μ)</div>
            <div className="text-base font-bold text-fuchsia-400">{stats.muonCount}</div>
          </div>
          <div className="bg-slate-900/60 p-2 rounded border border-slate-800/80">
            <div className="text-slate-400">GZK Status</div>
            <div className={`text-base font-bold ${energyExponent >= 19.7 ? "text-red-400 animate-pulse" : "text-emerald-400"}`}>
              {energyExponent >= 19.7 ? "GZK EXCEEDED" : "SUB-GZK"}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-800 mb-6">
        {[
          { id: "controls", label: "Cascade Controls" },
          { id: "telemetry", label: "Particle Telemetry" },
          { id: "presets", label: "Astrophysical Presets" },
          { id: "learn", label: "Physics & Detection" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? `${theme.accentText} border-current font-semibold`
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === "controls" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: Primary Beam Config */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              Primary Particle Configuration
            </h3>

            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1">
                Primary Particle Specie: <span className="text-cyan-400 font-bold">{currentParticle.name}</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(PARTICLE_TYPES).map(([key, p]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setParticleType(key);
                      spawnPrimaryShower();
                    }}
                    className={`px-3 py-2 text-xs font-mono rounded-lg border text-left transition-all ${
                      particleType === key
                        ? "bg-cyan-950/80 border-cyan-500 text-cyan-200"
                        : "bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-700/60"
                    }`}
                  >
                    <div className="font-bold">{p.symbol}</div>
                    <div className="text-[10px] text-slate-400">{p.name.split(" ")[0]}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                <span>Primary Energy (E₀):</span>
                <span className="text-amber-400 font-bold">10^{energyExponent.toFixed(1)} eV</span>
              </div>
              <input
                type="range"
                min="15.0"
                max="20.5"
                step="0.1"
                value={energyExponent}
                onChange={(e) => setEnergyExponent(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                <span>1 PeV (10¹⁵)</span>
                <span>1 EeV (10¹⁸)</span>
                <span>300 EeV (10²⁰.⁵)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                <span>Incident Zenith Angle (θ):</span>
                <span className="text-cyan-400 font-bold">{zenithAngle}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="65"
                step="1"
                value={zenithAngle}
                onChange={(e) => setZenithAngle(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>
          </div>

          {/* Column 2: Atmospheric & Environmental Parameters */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              Atmosphere & Magnetosphere
            </h3>

            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                <span>Geomagnetic Field (B_geo):</span>
                <span className="text-fuchsia-400 font-bold">{magneticField} μT</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                step="5"
                value={magneticField}
                onChange={(e) => setMagneticField(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-fuchsia-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Lorentz force deflects positive/negative secondary tracks along the geomagnetic field lines.
              </p>
            </div>

            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1">Visual Theme Palette:</label>
              <select
                value={themeKey}
                onChange={(e) => setThemeKey(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-cyan-500"
              >
                {Object.entries(THEMES).map(([k, t]) => (
                  <option key={k} value={k}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                <span>Simulation Speed:</span>
                <span className="text-emerald-400 font-bold">{simSpeed.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.25"
                max="2.5"
                step="0.25"
                value={simSpeed}
                onChange={(e) => setSimSpeed(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          </div>

          {/* Column 3: Display Toggles */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              Canvas Display Layers
            </h3>

            <div className="space-y-2">
              {[
                { label: "Hadronic Cascade (p, n, π±, K)", state: showHadronic, setter: setShowHadronic, color: theme.hadronicColor },
                { label: "Electromagnetic Cascade (γ, e⁻, e⁺)", state: showEM, setter: setShowEM, color: theme.emColor },
                { label: "Relativistic Muons (μ⁺, μ⁻)", state: showMuons, setter: setShowMuons, color: theme.muonColor },
                { label: "Cherenkov UV Wavefront Cones", state: showCherenkov, setter: setShowCherenkov, color: theme.primaryColor },
                { label: "Ground Water Cherenkov Tanks", state: showDetectors, setter: setShowDetectors, color: theme.detectorColor },
                { label: "Longitudinal Profile Overlay N(X)", state: showProfileChart, setter: setShowProfileChart, color: "#f43f5e" },
              ].map((item, idx) => (
                <label key={idx} className="flex items-center gap-2 text-xs font-mono text-slate-300 cursor-pointer hover:text-white">
                  <input
                    type="checkbox"
                    checked={item.state}
                    onChange={(e) => item.setter(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-cyan-600 focus:ring-0"
                  />
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.label}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "telemetry" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800">
            <h3 className="text-base font-semibold text-white mb-3">Live Particle Breakdown</h3>
            <div className="space-y-4 font-mono text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-yellow-400">Electromagnetic (γ, e⁻, e⁺)</span>
                  <span>{stats.emCount} ({((stats.emCount / (stats.totalParticles || 1)) * 100).toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-yellow-400 h-full" style={{ width: `${(stats.emCount / (stats.totalParticles || 1)) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-red-400">Hadronic Component (π±, K)</span>
                  <span>{stats.hadronicCount} ({((stats.hadronicCount / (stats.totalParticles || 1)) * 100).toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-red-400 h-full" style={{ width: `${(stats.hadronicCount / (stats.totalParticles || 1)) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-fuchsia-400">Penetrating Muons (μ±)</span>
                  <span>{stats.muonCount} ({((stats.muonCount / (stats.totalParticles || 1)) * 100).toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-fuchsia-400 h-full" style={{ width: `${(stats.muonCount / (stats.totalParticles || 1)) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
            <h3 className="text-base font-semibold text-white mb-1">Theoretical Physics Telemetry</h3>
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Primary Species:</span>
              <span className="text-cyan-300">{currentParticle.name}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Rest Mass (m₀):</span>
              <span className="text-slate-200">{currentParticle.mass} GeV/c²</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Lorentz Factor (γ):</span>
              <span className="text-amber-400">{(Math.pow(10, energyExponent - 9) / (currentParticle.mass || 1)).toExponential(2)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Atmospheric X_max:</span>
              <span className="text-rose-400">{stats.xMaxDepth} g/cm²</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Cherenkov Angle in Air (θ_C):</span>
              <span className="text-cyan-400">~1.3° (at 1 atm)</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === "presets" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(PRESETS).map(([key, p]) => (
            <div
              key={key}
              onClick={() => handlePresetSelect(key)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedPreset === key
                  ? "bg-slate-800/90 border-cyan-500 shadow-lg shadow-cyan-500/10"
                  : "bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-bold text-white">{p.name}</h4>
                <span className="text-xs font-mono text-amber-400">10^{p.energyExp} eV</span>
              </div>
              <p className="text-xs text-slate-300">{p.desc}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === "learn" && (
        <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 text-xs leading-relaxed text-slate-300 space-y-4">
          <h3 className="text-base font-bold text-white">Extensive Air Showers & UHECR Physics</h3>
          <p>
            When an ultra-high-energy cosmic ray (UHECR) enters Earth's upper atmosphere, it collides with nitrogen and oxygen nuclei at altitudes around 20–35 km.
            Because the collision energy exceeds man-made particle colliders by orders of magnitude, a single primary particle triggers an <strong>Extensive Air Shower (EAS)</strong> containing billions of secondary particles.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2">
            <div className="bg-slate-950 p-3 rounded border border-slate-800">
              <h4 className="font-bold text-cyan-400 mb-1">Heitler Model of Cascades</h4>
              <p className="text-slate-400">
                The cascade grows exponentially until individual particle energies drop below the critical energy E_c (~84 MeV in air). The depth of shower maximum X_max increases logarithmically with primary energy E₀.
              </p>
            </div>
            <div className="bg-slate-950 p-3 rounded border border-slate-800">
              <h4 className="font-bold text-amber-400 mb-1">GZK Cutoff Limit</h4>
              <p className="text-slate-400">
                Above ~5 × 10¹⁹ eV, cosmic ray protons interact with Cosmic Microwave Background (CMB) photons via Δ-resonance (p + γ_CMB → p + π⁰), limiting their extragalactic propagation distance to ~50 Mpc.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
