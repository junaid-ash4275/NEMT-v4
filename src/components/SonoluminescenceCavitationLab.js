import React, { useState, useEffect, useRef, useCallback } from "react";

// Color Themes & Aesthetic Styling Tokens
const THEMES = {
  deepSpace: {
    id: "deepSpace",
    name: "Deep Space Neon",
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    accentText: "text-cyan-400",
    accentBorder: "border-cyan-500/40",
    accentBg: "bg-cyan-500/10",
    buttonBg: "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25",
    canvasBg: "#050b14",
    wavePrimary: "rgba(6, 182, 212, 0.4)",
    waveSecondary: "rgba(59, 130, 246, 0.25)",
    bubbleGlow: "#06b6d4",
    plasmaCore: "#ffffff",
    shockwaveColor: "rgba(34, 211, 238, 0.7)",
  },
  laserEmerald: {
    id: "laserEmerald",
    name: "Laser Emerald Grid",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    accentText: "text-emerald-400",
    accentBorder: "border-emerald-500/40",
    accentBg: "bg-emerald-500/10",
    buttonBg: "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25",
    canvasBg: "#030f0a",
    wavePrimary: "rgba(16, 185, 129, 0.45)",
    waveSecondary: "rgba(20, 184, 166, 0.25)",
    bubbleGlow: "#10b981",
    plasmaCore: "#f0fdf4",
    shockwaveColor: "rgba(52, 211, 153, 0.7)",
  },
  solarPlasma: {
    id: "solarPlasma",
    name: "Solar Plasma",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    accentText: "text-amber-400",
    accentBorder: "border-amber-500/40",
    accentBg: "bg-amber-500/10",
    buttonBg: "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg shadow-amber-500/25",
    canvasBg: "#120803",
    wavePrimary: "rgba(245, 158, 11, 0.45)",
    waveSecondary: "rgba(234, 88, 12, 0.25)",
    bubbleGlow: "#f59e0b",
    plasmaCore: "#fffbe8",
    shockwaveColor: "rgba(251, 191, 36, 0.7)",
  },
  voidUltraviolet: {
    id: "voidUltraviolet",
    name: "Void Ultraviolet",
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    accentText: "text-purple-400",
    accentBorder: "border-purple-500/40",
    accentBg: "bg-purple-500/10",
    buttonBg: "bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white shadow-lg shadow-purple-500/25",
    canvasBg: "#0c0517",
    wavePrimary: "rgba(168, 85, 247, 0.45)",
    waveSecondary: "rgba(217, 70, 239, 0.25)",
    bubbleGlow: "#c084fc",
    plasmaCore: "#faf5ff",
    shockwaveColor: "rgba(192, 132, 252, 0.7)",
  },
};

// Gas Types & Physical Constants
const GAS_PROPERTIES = {
  argon: { name: "Argon (Ar)", gamma: 1.67, ionizationEnergy: 15.76, lumFactor: 1.2 },
  xenon: { name: "Xenon (Xe)", gamma: 1.67, ionizationEnergy: 12.13, lumFactor: 1.8 },
  helium: { name: "Helium (He)", gamma: 1.67, ionizationEnergy: 24.59, lumFactor: 0.9 },
  heavyGas: { name: "Deuterium (D₂)", gamma: 1.4, ionizationEnergy: 15.4, lumFactor: 2.1 },
  air: { name: "Ambient Air", gamma: 1.4, ionizationEnergy: 15.6, lumFactor: 0.7 },
};

// Liquid Media & Physical Properties
const LIQUID_PROPERTIES = {
  water: { name: "Degassed Water", density: 998, viscosity: 0.001, surfaceTension: 0.072, speedOfSound: 1480 },
  sulfuricAcid: { name: "Sulfuric Acid (H₂SO₄)", density: 1840, viscosity: 0.024, surfaceTension: 0.055, speedOfSound: 1260 },
  glycerol: { name: "Anhydrous Glycerol", density: 1260, viscosity: 1.412, surfaceTension: 0.063, speedOfSound: 1920 },
  heavyWater: { name: "Heavy Water (D₂O)", density: 1107, viscosity: 0.00125, surfaceTension: 0.071, speedOfSound: 1400 },
};

// Preset Laboratory Experiments
const PRESETS = [
  {
    id: "sbsl",
    name: "🌟 Star-in-a-Jar (SBSL)",
    description: "Stable Single-Bubble Sonoluminescence trapped in standing wave pressure node.",
    frequency: 26.5,
    pressure: 1.35,
    gas: "argon",
    liquid: "water",
    temp: 20,
    bubblesCount: 1,
  },
  {
    id: "relativistic",
    name: "⚡ 35,000K Extreme Relativistic Collapse",
    description: "Xenon bubble in sulfuric acid driven to extreme plasma temperatures emitting UV flashes.",
    frequency: 38.0,
    pressure: 2.1,
    gas: "xenon",
    liquid: "sulfuricAcid",
    temp: 10,
    bubblesCount: 1,
  },
  {
    id: "mbsl",
    name: "🌀 Multi-Bubble Cavitation Field (MBSL)",
    description: "Cluster of micro-bubbles interacting via acoustic Bjerknes forces.",
    frequency: 45.0,
    pressure: 1.75,
    gas: "air",
    liquid: "water",
    temp: 25,
    bubblesCount: 12,
  },
  {
    id: "glycerol",
    name: "🧪 Glycerol High Viscosity Shockwave",
    description: "Thick viscous liquid producing high-amplitude acoustic shockwave ripples.",
    frequency: 22.0,
    pressure: 1.8,
    gas: "argon",
    liquid: "glycerol",
    temp: 15,
    bubblesCount: 1,
  },
  {
    id: "deuterium",
    name: "💥 Deuterium Acoustic Fusion Boundary",
    description: "Extreme compression heavy water collapse simulation with intense photon flux.",
    frequency: 50.0,
    pressure: 2.4,
    gas: "heavyGas",
    liquid: "heavyWater",
    temp: 5,
    bubblesCount: 1,
  },
];

export default function SonoluminescenceCavitationLab() {
  // Theme & Layout State
  const [themeKey, setThemeKey] = useState("deepSpace");
  const theme = THEMES[themeKey];
  const [activeTab, setActiveTab] = useState("chamber"); // chamber, oscilloscope, audio, guide
  const [isPlaying, setIsPlaying] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showTheoryModal, setShowTheoryModal] = useState(false);

  // Physics Simulation Parameters
  const [frequency, setFrequency] = useState(26.5); // kHz
  const [acousticPressure, setAcousticPressure] = useState(1.35); // atm
  const [gasKey, setGasKey] = useState("argon");
  const [liquidKey, setLiquidKey] = useState("water");
  const [ambientTemp, setAmbientTemp] = useState(20); // °C
  const [simSpeed, setSimSpeed] = useState(1.0);
  const [interactiveMode, setInteractiveMode] = useState("seed"); // seed, shock, pulse

  // Live Physics Metrics State
  const [currentRadius, setCurrentRadius] = useState(10.0); // µm
  const [peakTemp, setPeakTemp] = useState(18400); // Kelvin
  const [peakPressure, setPeakPressure] = useState(1420); // Atm
  const [photonFlux, setPhotonFlux] = useState(840); // Lux
  const [collapseCount, setCollapseCount] = useState(0);
  const [shockwaveVelocity, setShockwaveVelocity] = useState(4.2); // Mach

  // Canvas Refs
  const canvasRef = useRef(null);
  const graphCanvasRef = useRef(null);
  const animFrameRef = useRef(null);

  // Audio Context Ref
  const audioCtxRef = useRef(null);
  const transducerOscRef = useRef(null);
  const transducerGainRef = useRef(null);

  // Dynamic Particles & Shockwaves Simulation State Ref
  const simStateRef = useRef({
    time: 0,
    radiusHistory: Array(150).fill(10),
    shockwaves: [],
    photons: [],
    multiBubbles: [],
    lastCollapseTime: 0,
    collapseFlashIntensity: 0,
  });

  // Initialize Web Audio Context
  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      // Transducer hum oscillator
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      transducerOscRef.current = osc;
      transducerGainRef.current = gain;
    } catch (e) {
      console.warn("Web Audio API not supported:", e);
    }
  }, []);

  // Update transducer tone pitch & volume based on frequency and sound toggle
  useEffect(() => {
    if (!audioCtxRef.current || !transducerOscRef.current || !transducerGainRef.current) return;
    const ctx = audioCtxRef.current;
    if (soundEnabled && isPlaying) {
      // Map ultrasonic frequency (20k-100kHz) down to pleasant audible hum (150Hz - 600Hz)
      const audibleFreq = 150 + ((frequency - 20) / 80) * 450;
      transducerOscRef.current.frequency.setTargetAtTime(audibleFreq, ctx.currentTime, 0.05);
      transducerGainRef.current.gain.setTargetAtTime(0.04, ctx.currentTime, 0.05);
    } else {
      transducerGainRef.current.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
    }
  }, [soundEnabled, isPlaying, frequency]);

  // Trigger Acoustic Shockwave Snap Sound on Collapse
  const triggerCollapseAudio = useCallback(() => {
    if (!soundEnabled || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    // Create transient white noise burst buffer
    const bufferSize = ctx.sampleRate * 0.03; // 30ms burst
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
    }

    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = buffer;

    // Highpass filter for sharp acoustic snap sound
    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 1200 + acousticPressure * 800;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(Math.min(0.2, 0.05 + acousticPressure * 0.08), ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

    noiseNode.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noiseNode.start();
  }, [soundEnabled, acousticPressure]);

  // Apply Preset Config
  const applyPreset = (preset) => {
    setFrequency(preset.frequency);
    setAcousticPressure(preset.pressure);
    setGasKey(preset.gas);
    setLiquidKey(preset.liquid);
    setAmbientTemp(preset.temp);

    // Re-initialize multi-bubbles
    const bubbles = [];
    for (let i = 0; i < preset.bubblesCount; i++) {
      bubbles.push({
        x: (Math.random() - 0.5) * 200,
        y: (Math.random() - 0.5) * 150,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        r0: 5 + Math.random() * 10,
        r: 10,
        phaseOffset: Math.random() * Math.PI * 2,
      });
    }
    simStateRef.current.multiBubbles = bubbles;
  };

  // Click Canvas to Inject Bubbles / Shock Pulses
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left - canvas.width / 2;
    const clickY = e.clientY - rect.top - canvas.height / 2;

    if (interactiveMode === "seed") {
      // Add new bubble
      simStateRef.current.multiBubbles.push({
        x: clickX,
        y: clickY,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        r0: 6 + Math.random() * 8,
        r: 10,
        phaseOffset: Math.random() * Math.PI * 2,
      });
    } else if (interactiveMode === "shock") {
      // Trigger instant manual shockwave
      simStateRef.current.shockwaves.push({
        x: clickX,
        y: clickY,
        radius: 5,
        maxRadius: 180,
        alpha: 1.0,
        intensity: acousticPressure,
      });
      triggerCollapseAudio();
    } else if (interactiveMode === "pulse") {
      // Create photon particle burst
      for (let i = 0; i < 24; i++) {
        const angle = (i / 24) * Math.PI * 2;
        const speed = 2 + Math.random() * 4;
        simStateRef.current.photons.push({
          x: clickX,
          y: clickY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1.0,
          color: theme.bubbleGlow,
        });
      }
    }
  };

  // Numerical Physics & Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const graphCanvas = graphCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const graphCtx = graphCanvas ? graphCanvas.getContext("2d") : null;

    let localTime = simStateRef.current.time;

    const gasProps = GAS_PROPERTIES[gasKey] || GAS_PROPERTIES.argon;
    const liquidProps = LIQUID_PROPERTIES[liquidKey] || LIQUID_PROPERTIES.water;

    const render = () => {
      if (isPlaying) {
        localTime += 0.05 * simSpeed;
        simStateRef.current.time = localTime;
      }

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      // 1. Calculate Rayleigh-Plesset Bubble Radius R(t)
      // Driving acoustic frequency angular speed omega = 2 * pi * f
      const omega = 2 * Math.PI * (frequency / 20.0);
      const drivingPressure = acousticPressure * Math.sin(omega * localTime);

      // Equilibrium radius R0 = 10 µm
      const R0 = 10.0;

      // Rayleigh-Plesset Non-linear radial oscillation model
      // R_max ~ R0 * (1 + 0.8 * P_a)
      // Non-linear collapse phase when drivingPressure > 0
      const linearOsc = Math.sin(omega * localTime);

      // Violent non-linear collapse math approximation
      let R = R0 * (1.0 + 0.65 * acousticPressure * Math.sin(omega * localTime - 0.2));

      // Sharpen the collapse valley when phase passes contraction peak
      const phaseMod = (omega * localTime) % (2 * Math.PI);
      const isCollapsePhase = phaseMod > Math.PI * 0.85 && phaseMod < Math.PI * 1.15;

      let currentPeakTemp = 300 + (ambientTemp - 20) * 10;
      let currentPeakPress = 1.0;
      let currentPhotonFlux = 0;

      if (isCollapsePhase) {
        // Extreme radial compression down to R_min
        const compressionRatio = 0.08 / Math.max(0.4, acousticPressure);
        R = Math.max(0.6, R0 * compressionRatio);

        // Peak adiabatic collapse temperature: T_max = T0 * (R_max/R_min)^(3*(gamma-1))
        const R_max = R0 * (1 + 0.7 * acousticPressure);
        const R_min = R;
        currentPeakTemp = Math.round(
          (ambientTemp + 273.15) * Math.pow(R_max / R_min, 3 * (gasProps.gamma - 1)) * gasProps.lumFactor
        );

        currentPeakPress = Math.round(
          1.0 * Math.pow(R_max / R_min, 3 * gasProps.gamma) * (liquidProps.density / 1000)
        );

        currentPhotonFlux = Math.round(
          Math.pow(currentPeakTemp / 3000, 4) * gasProps.lumFactor * 12.5
        );

        // Trigger shockwave & photons on sharp collapse edge
        if (localTime - simStateRef.current.lastCollapseTime > 0.4) {
          simStateRef.current.lastCollapseTime = localTime;
          simStateRef.current.collapseFlashIntensity = 1.0;
          setCollapseCount((c) => c + 1);

          // Add acoustic shockwave ring
          simStateRef.current.shockwaves.push({
            x: 0,
            y: 0,
            radius: R,
            maxRadius: 220,
            alpha: 1.0,
            intensity: acousticPressure,
          });

          // Add photon light burst particles
          const photonCount = Math.min(40, Math.floor(currentPhotonFlux / 50) + 12);
          for (let p = 0; p < photonCount; p++) {
            const angle = Math.random() * Math.PI * 2;
            const spd = 2 + Math.random() * 5 * acousticPressure;
            simStateRef.current.photons.push({
              x: 0,
              y: 0,
              vx: Math.cos(angle) * spd,
              vy: Math.sin(angle) * spd,
              life: 1.0,
              color: currentPeakTemp > 25000 ? "#c084fc" : currentPeakTemp > 15000 ? "#ffffff" : "#38bdf8",
            });
          }

          // Trigger Web Audio shock snap
          triggerCollapseAudio();
        }
      } else {
        simStateRef.current.collapseFlashIntensity *= 0.88;
      }

      // Update state metrics
      setCurrentRadius(parseFloat(R.toFixed(2)));
      if (currentPeakTemp > 500) setPeakTemp(currentPeakTemp);
      if (currentPeakPress > 1.5) setPeakPressure(currentPeakPress);
      setPhotonFlux(currentPhotonFlux);
      setShockwaveVelocity((1.1 + (acousticPressure * 2.2) / (liquidProps.density / 1000)).toFixed(1));

      // Push to radius history buffer for Oscilloscope
      simStateRef.current.radiusHistory.push(R);
      if (simStateRef.current.radiusHistory.length > 180) {
        simStateRef.current.radiusHistory.shift();
      }

      // -----------------------------------------------------------------
      // DRAW CANVAS: Liquid Acoustic Chamber
      // -----------------------------------------------------------------
      ctx.fillStyle = theme.canvasBg;
      ctx.fillRect(0, 0, width, height);

      // Draw Ultrasonic Transducers (Top & Bottom Piezoceramic Plates)
      const plateHeight = 24;
      const transGradient = ctx.createLinearGradient(0, 0, 0, plateHeight);
      transGradient.addColorStop(0, "#334155");
      transGradient.addColorStop(1, "#0f172a");

      ctx.fillStyle = transGradient;
      ctx.fillRect(40, 0, width - 80, plateHeight);
      ctx.fillRect(40, height - plateHeight, width - 80, plateHeight);

      // Transducer glowing LED strips
      ctx.fillStyle = theme.bubbleGlow;
      ctx.shadowColor = theme.bubbleGlow;
      ctx.shadowBlur = 12;
      ctx.fillRect(40, plateHeight - 3, width - 80, 3);
      ctx.fillRect(40, height - plateHeight, width - 80, 3);
      ctx.shadowBlur = 0;

      // Draw Standing Wave Acoustic Pressure Lines
      const numWaves = 12;
      ctx.lineWidth = 1.5;
      for (let i = 0; i <= numWaves; i++) {
        const y = plateHeight + (i / numWaves) * (height - 2 * plateHeight);
        const waveAmp = Math.sin((i / numWaves) * Math.PI) * 15 * Math.sin(omega * localTime);
        const pressureIntensity = Math.abs(Math.cos((i / numWaves) * Math.PI * 2));

        ctx.strokeStyle = i % 2 === 0 ? theme.wavePrimary : theme.waveSecondary;
        ctx.beginPath();
        for (let x = 40; x <= width - 40; x += 10) {
          const dy = Math.sin((x / width) * Math.PI * 4 + localTime * 2) * waveAmp * pressureIntensity;
          if (x === 40) ctx.moveTo(x, y + dy);
          else ctx.lineTo(x, y + dy);
        }
        ctx.stroke();
      }

      // Draw Acoustic Pressure Nodal Line Indicator at Center
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.beginPath();
      ctx.moveTo(40, centerY);
      ctx.lineTo(width - 40, centerY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Save center context transform for central bubble
      ctx.save();
      ctx.translate(centerX, centerY);

      // -----------------------------------------------------------------
      // DRAW SHOCKWAVES
      // -----------------------------------------------------------------
      for (let i = simStateRef.current.shockwaves.length - 1; i >= 0; i--) {
        const sw = simStateRef.current.shockwaves[i];
        sw.radius += 4.5 * (3000 / liquidProps.speedOfSound);
        sw.alpha -= 0.02;

        if (sw.alpha <= 0 || sw.radius > sw.maxRadius) {
          simStateRef.current.shockwaves.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(sw.x, sw.y);
        ctx.beginPath();
        ctx.arc(0, 0, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = theme.shockwaveColor.replace("0.7", (sw.alpha * 0.7).toFixed(2));
        ctx.lineWidth = Math.max(1, 4 * sw.alpha * sw.intensity);
        ctx.shadowColor = theme.bubbleGlow;
        ctx.shadowBlur = 15 * sw.alpha;
        ctx.stroke();
        ctx.restore();
      }

      // -----------------------------------------------------------------
      // DRAW PHOTON PARTICLES
      // -----------------------------------------------------------------
      for (let i = simStateRef.current.photons.length - 1; i >= 0; i--) {
        const pt = simStateRef.current.photons[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life -= 0.035;

        if (pt.life <= 0) {
          simStateRef.current.photons.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, Math.max(1, 3 * pt.life), 0, Math.PI * 2);
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = pt.life;
        ctx.shadowColor = pt.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }
      ctx.shadowBlur = 0;

      // -----------------------------------------------------------------
      // DRAW MAIN CAVITATION BUBBLE ("STAR IN A JAR")
      // -----------------------------------------------------------------
      const displayRadius = Math.max(6, R * 3.5);

      // Outer Acoustic Hydration Glow
      const outerGlow = ctx.createRadialGradient(0, 0, displayRadius * 0.2, 0, 0, displayRadius * 2.8);
      outerGlow.addColorStop(0, theme.bubbleGlow);
      outerGlow.addColorStop(0.5, theme.wavePrimary);
      outerGlow.addColorStop(1, "transparent");

      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(0, 0, displayRadius * 2.8, 0, Math.PI * 2);
      ctx.fill();

      // Main Bubble Shell
      const bubbleGrad = ctx.createRadialGradient(
        -displayRadius * 0.3,
        -displayRadius * 0.3,
        displayRadius * 0.1,
        0,
        0,
        displayRadius
      );
      bubbleGrad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
      bubbleGrad.addColorStop(0.4, theme.bubbleGlow);
      bubbleGrad.addColorStop(0.85, "rgba(15, 23, 42, 0.85)");
      bubbleGrad.addColorStop(1, "rgba(2, 6, 23, 0.95)");

      ctx.fillStyle = bubbleGrad;
      ctx.beginPath();
      ctx.arc(0, 0, displayRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = theme.bubbleGlow;
      ctx.stroke();

      // Ultra-Hot Plasma Collapse Core (Flash Burst)
      const flashInt = simStateRef.current.collapseFlashIntensity;
      if (flashInt > 0.05 || isCollapsePhase) {
        const coreRadius = Math.max(3, displayRadius * 0.45);
        ctx.save();
        ctx.shadowColor = "#ffffff";
        ctx.shadowBlur = 35 * (flashInt + 0.5);

        const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, coreRadius);
        coreGrad.addColorStop(0, "#ffffff");
        coreGrad.addColorStop(0.3, currentPeakTemp > 25000 ? "#e0e7ff" : "#fef08a");
        coreGrad.addColorStop(1, theme.bubbleGlow);

        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(0, 0, coreRadius, 0, Math.PI * 2);
        ctx.fill();

        // Light Ray Spikes during picosecond collapse
        const numRays = 8;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
        ctx.lineWidth = 2;
        for (let r = 0; r < numRays; r++) {
          const rayAngle = (r / numRays) * Math.PI * 2 + localTime * 4;
          const rayLen = displayRadius * (1.2 + flashInt * 1.5);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(rayAngle) * rayLen, Math.sin(rayAngle) * rayLen);
          ctx.stroke();
        }
        ctx.restore();
      }

      ctx.restore(); // Restore center transform

      // -----------------------------------------------------------------
      // DRAW MULTI-BUBBLE CLUSTER (MBSL MODE)
      // -----------------------------------------------------------------
      if (simStateRef.current.multiBubbles.length > 0) {
        simStateRef.current.multiBubbles.forEach((mb) => {
          mb.x += mb.vx;
          mb.y += mb.vy;

          // Acoustic Bjerknes Force pulling micro-bubbles towards center pressure node
          mb.vx -= mb.x * 0.0008;
          mb.vy -= mb.y * 0.0008;

          // Bounce off boundary
          if (Math.abs(mb.x) > width / 2 - 60) mb.vx *= -0.8;
          if (Math.abs(mb.y) > height / 2 - 40) mb.vy *= -0.8;

          const mbOscR = mb.r0 * (1 + 0.4 * Math.sin(omega * localTime + mb.phaseOffset));

          ctx.save();
          ctx.translate(centerX + mb.x, centerY + mb.y);
          ctx.beginPath();
          ctx.arc(0, 0, mbOscR, 0, Math.PI * 2);
          ctx.fillStyle = theme.wavePrimary;
          ctx.strokeStyle = theme.bubbleGlow;
          ctx.lineWidth = 1;
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        });
      }

      // -----------------------------------------------------------------
      // DRAW OSCILLOSCOPE GRAPH CANVAS (R(t) Radius Chart)
      // -----------------------------------------------------------------
      if (graphCtx) {
        const gw = graphCanvas.width;
        const gh = graphCanvas.height;

        graphCtx.fillStyle = "#020617";
        graphCtx.fillRect(0, 0, gw, gh);

        // Draw Grid Lines
        graphCtx.strokeStyle = "rgba(51, 65, 85, 0.4)";
        graphCtx.lineWidth = 1;
        for (let gy = 0; gy <= gh; gy += gh / 4) {
          graphCtx.beginPath();
          graphCtx.moveTo(0, gy);
          graphCtx.lineTo(gw, gy);
          graphCtx.stroke();
        }

        // Draw R0 Equilibrium Baseline
        const r0Y = gh * 0.6;
        graphCtx.strokeStyle = "rgba(234, 179, 8, 0.5)";
        graphCtx.setLineDash([3, 3]);
        graphCtx.beginPath();
        graphCtx.moveTo(0, r0Y);
        graphCtx.lineTo(gw, r0Y);
        graphCtx.stroke();
        graphCtx.setLineDash([]);

        // Plot Radius Curve
        const history = simStateRef.current.radiusHistory;
        graphCtx.beginPath();
        graphCtx.strokeStyle = theme.bubbleGlow;
        graphCtx.lineWidth = 2;

        history.forEach((val, idx) => {
          const gx = (idx / (history.length - 1)) * gw;
          // Scale val (0.5 to 20) onto canvas height gh
          const gy = gh - (val / 22) * gh;
          if (idx === 0) graphCtx.moveTo(gx, gy);
          else graphCtx.lineTo(gx, gy);
        });
        graphCtx.stroke();

        // Label
        graphCtx.fillStyle = "#94a3b8";
        graphCtx.font = "10px sans-serif";
        graphCtx.fillText("R(t) Oscilloscope (µm)", 8, 14);
        graphCtx.fillStyle = "#eab308";
        graphCtx.fillText("R₀ = 10µm", gw - 60, r0Y - 4);
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [
    isPlaying,
    frequency,
    acousticPressure,
    gasKey,
    liquidKey,
    ambientTemp,
    simSpeed,
    theme,
    triggerCollapseAudio,
  ]);

  return (
    <div className={`w-full max-w-7xl mx-auto p-4 sm:p-6 my-6 rounded-3xl bg-slate-950 text-slate-100 border ${theme.accentBorder} shadow-2xl transition-all duration-300 font-sans`}>
      {/* ----------------------------------------------------------------- */}
      {/* HEADER BAR */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${theme.badge}`}>
              Acoustic Physics & Plasma Studio
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Ultrasound Transducer Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Sonoluminescence Cavitation Lab
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Simulate "Star in a Jar" acoustic levitation, non-linear Rayleigh-Plesset bubble collapse, picosecond luminescent light flashes, and high-mach shockwaves.
          </p>
        </div>

        {/* Theme Selector & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-900/90 rounded-xl p-1 border border-slate-800">
            {Object.keys(THEMES).map((key) => (
              <button
                key={key}
                onClick={() => setThemeKey(key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  themeKey === key
                    ? `${theme.buttonBg} text-white font-bold`
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                {THEMES[key].name.split(" ")[0]}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              initAudio();
              setSoundEnabled(!soundEnabled);
            }}
            className={`p-2.5 rounded-xl border transition-all ${
              soundEnabled
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
            }`}
            title="Toggle Web Audio Synthesizer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {soundEnabled ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              )}
            </svg>
          </button>

          <button
            onClick={() => setShowTheoryModal(true)}
            className="p-2.5 rounded-xl bg-slate-900 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700 transition-all"
            title="Physics & Theory Guide"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* PRESET EXPERIMENT BUTTONS */}
      {/* ----------------------------------------------------------------- */}
      <div className="my-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
          Preset Acoustic Experiments:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset)}
              className={`p-2.5 text-left rounded-xl border transition-all ${
                theme.accentBg
              } border-slate-800 hover:border-slate-700 hover:bg-slate-900 group`}
            >
              <div className="text-xs font-bold text-slate-200 group-hover:text-white truncate">
                {preset.name}
              </div>
              <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                {preset.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* MAIN CONTENT WORKSPACE (CANVAS + CONTROLS) */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-6">
        {/* Left Column: Visual Acoustic Chamber Canvas & HUD */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Main Visual Chamber Canvas Container */}
          <div className="relative rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-inner group">
            <canvas
              ref={canvasRef}
              width={720}
              height={420}
              onClick={handleCanvasClick}
              className="w-full h-auto max-h-[460px] object-contain cursor-crosshair block"
            />

            {/* Live Physics HUD Overlay on Canvas */}
            <div className="absolute top-4 left-4 pointer-events-none flex flex-col gap-1.5 bg-slate-950/80 backdrop-blur-md p-3 rounded-xl border border-slate-800 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">R(t) Radius:</span>
                <span className={`font-bold ${theme.accentText}`}>{currentRadius} µm</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Peak Temp:</span>
                <span className="font-bold text-amber-400">{peakTemp.toLocaleString()} K</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Peak Pressure:</span>
                <span className="font-bold text-rose-400">{peakPressure.toLocaleString()} Atm</span>
              </div>
            </div>

            <div className="absolute top-4 right-4 pointer-events-none flex flex-col gap-1.5 bg-slate-950/80 backdrop-blur-md p-3 rounded-xl border border-slate-800 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Photon Flux:</span>
                <span className="font-bold text-cyan-300">{photonFlux} Lux</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Shockwave:</span>
                <span className="font-bold text-emerald-400">Mach {shockwaveVelocity}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Collapses:</span>
                <span className="font-bold text-purple-400">{collapseCount}</span>
              </div>
            </div>

            {/* Interactive Canvas Tool Overlay */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-slate-950/85 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Click Canvas Tool:</span>
                <div className="flex bg-slate-900 rounded-lg p-0.5 border border-slate-800">
                  <button
                    onClick={() => setInteractiveMode("seed")}
                    className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                      interactiveMode === "seed" ? `${theme.buttonBg} text-white` : "text-slate-400 hover:text-white"
                    }`}
                  >
                    🌱 Seed Bubble
                  </button>
                  <button
                    onClick={() => setInteractiveMode("shock")}
                    className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                      interactiveMode === "shock" ? `${theme.buttonBg} text-white` : "text-slate-400 hover:text-white"
                    }`}
                  >
                    ⚡ Shockwave
                  </button>
                  <button
                    onClick={() => setInteractiveMode("pulse")}
                    className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                      interactiveMode === "pulse" ? `${theme.buttonBg} text-white` : "text-slate-400 hover:text-white"
                    }`}
                  >
                    ✨ Laser Pulse
                  </button>
                </div>
              </div>

              {/* Play / Pause Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
                    isPlaying
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
                      : `${theme.buttonBg}`
                  }`}
                >
                  {isPlaying ? "Pause Sim" : "Resume Sim"}
                </button>
                <button
                  onClick={() => {
                    simStateRef.current.multiBubbles = [];
                    simStateRef.current.shockwaves = [];
                    setCollapseCount(0);
                  }}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 text-slate-400 border border-slate-800 hover:text-white hover:bg-slate-800 transition-all"
                >
                  Clear Canvas
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Graph Section: Real-time Oscilloscope */}
          <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
                Real-Time Oscilloscope: R(t) Bubble Oscillation
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Sampling Rate: {frequency.toFixed(1)} kHz
              </span>
            </div>
            <canvas
              ref={graphCanvasRef}
              width={720}
              height={100}
              className="w-full h-24 rounded-xl border border-slate-800 bg-slate-950 block"
            />
          </div>
        </div>

        {/* Right Column: Control Sliders & Physical Parameters */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Controls Panel */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-md flex flex-col gap-4 shadow-lg">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 border-b border-slate-800 pb-2.5 flex items-center gap-2">
              <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Acoustic & Fluid Parameters
            </h3>

            {/* Frequency Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-400">Transducer Frequency (f):</span>
                <span className={`font-mono font-bold ${theme.accentText}`}>{frequency.toFixed(1)} kHz</span>
              </div>
              <input
                type="range"
                min="20.0"
                max="80.0"
                step="0.5"
                value={frequency}
                onChange={(e) => setFrequency(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>

            {/* Acoustic Pressure Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-400">Acoustic Pressure Amplitude (Pₐ):</span>
                <span className="font-mono font-bold text-amber-400">{acousticPressure.toFixed(2)} Atm</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.05"
                value={acousticPressure}
                onChange={(e) => setAcousticPressure(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Gas Species Selector */}
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Dissolved Noble Gas Species:</label>
              <select
                value={gasKey}
                onChange={(e) => setGasKey(e.target.value)}
                className="w-full bg-slate-950 text-slate-200 text-xs rounded-xl p-2.5 border border-slate-800 focus:outline-none focus:border-cyan-500"
              >
                {Object.keys(GAS_PROPERTIES).map((key) => (
                  <option key={key} value={key}>
                    {GAS_PROPERTIES[key].name} (γ = {GAS_PROPERTIES[key].gamma})
                  </option>
                ))}
              </select>
            </div>

            {/* Liquid Medium Selector */}
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Liquid Fluid Medium:</label>
              <select
                value={liquidKey}
                onChange={(e) => setLiquidKey(e.target.value)}
                className="w-full bg-slate-950 text-slate-200 text-xs rounded-xl p-2.5 border border-slate-800 focus:outline-none focus:border-cyan-500"
              >
                {Object.keys(LIQUID_PROPERTIES).map((key) => (
                  <option key={key} value={key}>
                    {LIQUID_PROPERTIES[key].name} (ρ = {LIQUID_PROPERTIES[key].density} kg/m³)
                  </option>
                ))}
              </select>
            </div>

            {/* Ambient Liquid Temperature */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-400">Liquid Temp (T₀):</span>
                <span className="font-mono font-bold text-rose-400">{ambientTemp}°C</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="1"
                value={ambientTemp}
                onChange={(e) => setAmbientTemp(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>

            {/* Simulation Time Scale */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-400">Simulation Speed:</span>
                <span className="font-mono font-bold text-emerald-400">{simSpeed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="3.0"
                step="0.1"
                value={simSpeed}
                onChange={(e) => setSimSpeed(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          </div>

          {/* Quick Metrics Summary Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Gas Ratio (γ)
              </span>
              <span className="text-lg font-extrabold text-cyan-400 mt-0.5 font-mono">
                {GAS_PROPERTIES[gasKey]?.gamma || 1.67}
              </span>
              <span className="text-[10px] text-slate-500 mt-1">Adiabatic Expansion Index</span>
            </div>

            <div className="p-3.5 rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Sound Speed
              </span>
              <span className="text-lg font-extrabold text-emerald-400 mt-0.5 font-mono">
                {LIQUID_PROPERTIES[liquidKey]?.speedOfSound || 1480} m/s
              </span>
              <span className="text-[10px] text-slate-500 mt-1">Acoustic Velocity in Medium</span>
            </div>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* THEORY & EDUCATIONAL GUIDE MODAL */}
      {/* ----------------------------------------------------------------- */}
      {showTheoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 max-h-[85vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setShowTheoryModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-4">
              <span className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                🔬
              </span>
              <div>
                <h3 className="text-xl font-bold text-white">The Physics of Sonoluminescence</h3>
                <p className="text-xs text-slate-400">Rayleigh-Plesset Cavitation & Bremsstrahlung Light Bursts</p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <p>
                <strong>Sonoluminescence</strong> is the emission of short flashes of light from imploding bubbles in a liquid when excited by sound. It was discovered at the University of Cologne in 1934 as a result of work on ultrasound transducers.
              </p>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-300">
                R · R'' + (3/2) · (R')² = (1/ρ) · [ P_gas(R) - P_0 + P_a · sin(2π f t) - 4μ(R'/R) ]
              </div>

              <h4 className="font-bold text-slate-100 text-sm mt-3">Key Phenomena Modeled:</h4>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-amber-400">Single Bubble Sonoluminescence (SBSL):</strong> A single gas bubble is trapped in an acoustic pressure node of a standing wave and collapses rhythmically with every acoustic cycle.
                </li>
                <li>
                  <strong className="text-rose-400">Extreme Thermal Spike (Star-in-a-Jar):</strong> As the bubble radius shrinks by a factor of 10 to 100, the interior gas undergoes extreme adiabatic compression, elevating local core temperatures above 20,000 Kelvin.
                </li>
                <li>
                  <strong className="text-purple-400">Picosecond Luminescence:</strong> Light bursts last less than 50 picoseconds. The spectrum suggests thermal blackbody radiation and Bremsstrahlung radiation from ionized plasma inside the bubble core.
                </li>
                <li>
                  <strong className="text-emerald-400">Acoustic Shockwaves & Bjerknes Forces:</strong> Rapid deceleration of the bubble wall during collapse generates supersonic acoustic shockwaves in the surrounding liquid. Primary and secondary Bjerknes forces govern multi-bubble attraction.
                </li>
              </ul>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowTheoryModal(false)}
                className={`px-5 py-2 text-xs font-bold rounded-xl ${theme.buttonBg}`}
              >
                Close Physics Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
