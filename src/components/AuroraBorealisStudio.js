import React, { useState, useEffect, useRef, useCallback } from "react";

// Curated Aurora Presets based on real atmospheric phenomena
const PRESETS = [
  {
    id: "nordic",
    name: "Nordic Emerald Curtain",
    kpIndex: 3,
    windSpeed: 450,
    oxRatio: 75,
    turbulence: 0.35,
    waveSpeed: 1.2,
    particleDensity: 120,
    primaryColor: "#00ff87",
    secondaryColor: "#60efff",
    accentColor: "#00b894",
    desc: "Classic green atomic oxygen curtains (557.7nm) dancing across arctic skies.",
  },
  {
    id: "superstorm",
    name: "Solar Storm Super-G5",
    kpIndex: 9,
    windSpeed: 880,
    oxRatio: 40,
    turbulence: 0.85,
    waveSpeed: 2.8,
    particleDensity: 250,
    primaryColor: "#ff007f",
    secondaryColor: "#9d4edd",
    accentColor: "#ff4d6d",
    desc: "Extreme geomagnetic storm exciting high-altitude red oxygen and violet nitrogen ions.",
  },
  {
    id: "substorm",
    name: "Deep Sub-Storm Violet",
    kpIndex: 6,
    windSpeed: 650,
    oxRatio: 25,
    turbulence: 0.6,
    waveSpeed: 2.0,
    particleDensity: 180,
    primaryColor: "#7b2cbf",
    secondaryColor: "#3a0ca3",
    accentColor: "#4cc9f0",
    desc: "Intense ionospheric excitation emitting deep molecular nitrogen purple and indigo rays.",
  },
  {
    id: "steve",
    name: "STEVE Thermal Ribbon",
    kpIndex: 4,
    windSpeed: 580,
    oxRatio: 50,
    turbulence: 0.2,
    waveSpeed: 0.8,
    particleDensity: 90,
    primaryColor: "#e0aaff",
    secondaryColor: "#c77dff",
    accentColor: "#52b788",
    desc: "Strong Thermal Emission Velocity Enhancement narrow mauve arc with green picket fences.",
  },
  {
    id: "corona",
    name: "Arctic Corona Surge",
    kpIndex: 7,
    windSpeed: 740,
    oxRatio: 65,
    turbulence: 0.75,
    waveSpeed: 2.4,
    particleDensity: 210,
    primaryColor: "#55ff99",
    secondaryColor: "#ff99c8",
    accentColor: "#fefae0",
    desc: "Overhead geomagnetic field line convergence creating radial rays and shimmering coronas.",
  },
];

const AuroraBorealisStudio = () => {
  // State for Controls
  const [selectedPreset, setSelectedPreset] = useState("nordic");
  const [kpIndex, setKpIndex] = useState(3);
  const [solarWindSpeed, setSolarWindSpeed] = useState(450);
  const [oxRatio, setOxRatio] = useState(75); // Oxygen vs Nitrogen excitation %
  const [turbulence, setTurbulence] = useState(0.35);
  const [waveSpeed, setWaveSpeed] = useState(1.2);
  const [particleDensity, setParticleDensity] = useState(120);
  const [showStars, setShowStars] = useState(true);
  const [showMountains, setShowMountains] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  // Audio Synthesizer States
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [volume, setVolume] = useState(0.15);

  // Live Telemetry display
  const [telemetry, setTelemetry] = useState({
    kpSeverity: "Quiet / Low",
    particleFlux: "1.4e8 / cm²s",
    fieldStrain: "14.2 nT",
    emissionPeak: "557.7 nm (Green)",
  });

  // Canvas Refs
  const canvasRef = useRef(null);
  const scopeCanvasRef = useRef(null);
  const animFrameRef = useRef(null);

  // Sound Synth Refs
  const audioCtxRef = useRef(null);
  const osc1Ref = useRef(null);
  const osc2Ref = useRef(null);
  const gainNodeRef = useRef(null);
  const filterNodeRef = useRef(null);

  // Mutable Physics Simulation State (avoids closure re-renders in RAF)
  const simStateRef = useRef({
    time: 0,
    particles: [],
    flares: [],
    history: [], // For magnetic scope
    isDragging: false,
    dragPos: { x: 0, y: 0 },
  });

  // Audio Init & Update
  const startAudio = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        audioCtxRef.current = new AudioCtx();

        const ctx = audioCtxRef.current;
        const gain = ctx.createGain();
        gain.gain.value = volume;

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 400 + kpIndex * 150;

        const osc1 = ctx.createOscillator();
        osc1.type = "sine";
        osc1.frequency.value = 110 + kpIndex * 15;

        const osc2 = ctx.createOscillator();
        osc2.type = "triangle";
        osc2.frequency.value = 165 + kpIndex * 22;

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc1.start();
        osc2.start();

        osc1Ref.current = osc1;
        osc2Ref.current = osc2;
        gainNodeRef.current = gain;
        filterNodeRef.current = filter;
      } else if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }
    } catch (err) {
      console.warn("Web Audio Context initialization error:", err);
    }
  }, [kpIndex, volume]);

  const stopAudio = useCallback(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(
        0,
        audioCtxRef.current.currentTime,
        0.1
      );
      setTimeout(() => {
        if (osc1Ref.current) {
          osc1Ref.current.stop();
          osc1Ref.current.disconnect();
          osc1Ref.current = null;
        }
        if (osc2Ref.current) {
          osc2Ref.current.stop();
          osc2Ref.current.disconnect();
          osc2Ref.current = null;
        }
        if (audioCtxRef.current) {
          audioCtxRef.current.close();
          audioCtxRef.current = null;
        }
      }, 150);
    }
  }, []);

  // Update sound dynamics on state changes
  useEffect(() => {
    if (audioEnabled) {
      startAudio();
    } else {
      stopAudio();
    }
    return () => {
      stopAudio();
    };
  }, [audioEnabled, startAudio, stopAudio]);

  useEffect(() => {
    if (audioCtxRef.current && gainNodeRef.current && filterNodeRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(
        volume,
        audioCtxRef.current.currentTime,
        0.05
      );
      filterNodeRef.current.frequency.setTargetAtTime(
        350 + kpIndex * 180 + (solarWindSpeed / 1000) * 200,
        audioCtxRef.current.currentTime,
        0.05
      );
      if (osc1Ref.current && osc2Ref.current) {
        osc1Ref.current.frequency.setTargetAtTime(
          108 + kpIndex * 12,
          audioCtxRef.current.currentTime,
          0.05
        );
        osc2Ref.current.frequency.setTargetAtTime(
          162 + kpIndex * 18,
          audioCtxRef.current.currentTime,
          0.05
        );
      }
    }
  }, [kpIndex, solarWindSpeed, volume]);

  // Apply Preset function
  const applyPreset = (presetId) => {
    const preset = PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setSelectedPreset(presetId);
    setKpIndex(preset.kpIndex);
    setSolarWindSpeed(preset.windSpeed);
    setOxRatio(preset.oxRatio);
    setTurbulence(preset.turbulence);
    setWaveSpeed(preset.waveSpeed);
    setParticleDensity(preset.particleDensity);
  };

  // Determine Telemetry status text based on Kp Index
  useEffect(() => {
    let severity = "Quiet";
    if (kpIndex >= 9) severity = "G5 Extreme Storm";
    else if (kpIndex >= 8) severity = "G4 Severe Storm";
    else if (kpIndex >= 7) severity = "G3 Strong Storm";
    else if (kpIndex >= 6) severity = "G2 Moderate Storm";
    else if (kpIndex >= 5) severity = "G1 Minor Storm";
    else if (kpIndex >= 4) severity = "Unsettled / Active";

    const fluxVal = ((solarWindSpeed / 300) * (kpIndex + 1) * 0.45).toFixed(2);
    const strainVal = (kpIndex * 14.5 + solarWindSpeed * 0.08).toFixed(1);

    let peak = "557.7 nm (Green Oxygen)";
    if (oxRatio < 35) peak = "427.8 nm (Violet Nitrogen)";
    else if (oxRatio > 80 && kpIndex > 6) peak = "630.0 nm (Red High-Oxygen)";

    setTelemetry({
      kpSeverity: severity,
      particleFlux: `${fluxVal}e8 / cm²s`,
      fieldStrain: `${strainVal} nT`,
      emissionPeak: peak,
    });
  }, [kpIndex, solarWindSpeed, oxRatio]);

  // Main Canvas Physics & Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const scopeCanvas = scopeCanvasRef.current;
    const scopeCtx = scopeCanvas ? scopeCanvas.getContext("2d") : null;

    let width = (canvas.width = canvas.parentElement.clientWidth || 800);
    let height = (canvas.height = 480);

    if (scopeCanvas) {
      scopeCanvas.width = scopeCanvas.parentElement.clientWidth || 300;
      scopeCanvas.height = 70;
    }

    const handleResize = () => {
      if (canvas && canvas.parentElement) {
        width = canvas.width = canvas.parentElement.clientWidth || 800;
        height = canvas.height = 480;
      }
      if (scopeCanvas && scopeCanvas.parentElement) {
        scopeCanvas.width = scopeCanvas.parentElement.clientWidth || 300;
        scopeCanvas.height = 70;
      }
    };
    window.addEventListener("resize", handleResize);

    // Initialize Stars
    const starList = [];
    for (let i = 0; i < 150; i++) {
      starList.push({
        x: Math.random() * width,
        y: Math.random() * (height * 0.75),
        radius: Math.random() * 1.5 + 0.3,
        alpha: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.03 + 0.005,
      });
    }

    // Initialize Solar Wind Charged Particles
    const activePreset = PRESETS.find((p) => p.id === selectedPreset) || PRESETS[0];
    const pCount = particleDensity;
    const particleList = [];

    for (let i = 0; i < pCount; i++) {
      particleList.push({
        x: Math.random() * width,
        y: Math.random() * (height * 0.65),
        vy: Math.random() * 1.2 + 0.4 + solarWindSpeed / 400,
        vx: (Math.random() - 0.5) * 0.6,
        size: Math.random() * 2 + 1,
        life: Math.random(),
        maxLife: Math.random() * 100 + 50,
      });
    }
    simStateRef.current.particles = particleList;

    // Trigger Solar Flare Burst
    const triggerFlare = (x, y) => {
      const newFlares = [];
      for (let i = 0; i < 40; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = Math.random() * 5 + 2;
        newFlares.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          life: 1.0,
          decay: Math.random() * 0.03 + 0.015,
          color: Math.random() > 0.5 ? activePreset.primaryColor : activePreset.secondaryColor,
        });
      }
      simStateRef.current.flares.push(...newFlares);
    };

    // Render loop
    const render = () => {
      if (isPlaying) {
        simStateRef.current.time += 0.015 * waveSpeed;
      }
      const t = simStateRef.current.time;

      // 1. Dark Atmospheric Night Sky Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, "#030712"); // Pitch void night
      bgGrad.addColorStop(0.5, "#0b132b"); // Polar midnight navy
      bgGrad.addColorStop(1, "#1c2541"); // Horizon atmospheric glow
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Stars
      if (showStars) {
        ctx.save();
        starList.forEach((star) => {
          star.alpha += Math.sin(t * 5 + star.x) * star.twinkleSpeed;
          const a = Math.max(0.1, Math.min(1.0, star.alpha));
          ctx.fillStyle = `rgba(255, 255, 255, ${a})`;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      }

      // 3. Multi-Layer Aurora Curtains (Sinusoidal Harmonic Waves)
      const currentPreset = PRESETS.find((p) => p.id === selectedPreset) || PRESETS[0];
      const layerCount = 4;

      ctx.save();
      ctx.globalCompositeOperation = "screen"; // Vibrant light blending

      for (let l = 0; l < layerCount; l++) {
        ctx.beginPath();
        const baseHeight = height * (0.32 + l * 0.08);
        const amplitude = 55 + l * 18 + kpIndex * 8;
        const freq1 = 0.003 + l * 0.001;
        const freq2 = 0.008 + turbulence * 0.01;

        ctx.moveTo(0, height);

        for (let x = 0; x <= width; x += 6) {
          // Harmonic wave equation for dynamic curtains
          const wave1 = Math.sin(x * freq1 + t * 1.4 + l * 1.2) * amplitude;
          const wave2 = Math.cos(x * freq2 - t * 0.8 + l * 0.5) * (amplitude * 0.4);
          const noisePerturb = Math.sin(x * 0.02 + t * 3) * (turbulence * 20);

          let y = baseHeight + wave1 + wave2 + noisePerturb;

          // Drag interaction perturbation
          if (simStateRef.current.isDragging) {
            const dist = Math.hypot(x - simStateRef.current.dragPos.x, y - simStateRef.current.dragPos.y);
            if (dist < 180) {
              y += (180 - dist) * 0.4 * Math.sin(t * 10);
            }
          }

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();

        // Aurora Color Gradients based on excited atmospheric gas levels
        const auroraGrad = ctx.createLinearGradient(0, baseHeight - amplitude, 0, baseHeight + amplitude * 2);

        // Color allocation based on oxygen/nitrogen excitation ratio
        const alphaPrimary = Math.min(0.75, 0.35 + (kpIndex / 9) * 0.4);
        const alphaSecondary = Math.min(0.65, 0.25 + (kpIndex / 9) * 0.35);

        if (oxRatio > 65) {
          // Oxygen dominant (Green bottom to soft pink/red top)
          auroraGrad.addColorStop(0, "rgba(255, 100, 150, 0)");
          auroraGrad.addColorStop(0.2, currentPreset.secondaryColor);
          auroraGrad.addColorStop(0.6, currentPreset.primaryColor);
          auroraGrad.addColorStop(1, "rgba(0, 255, 135, 0)");
        } else if (oxRatio < 40) {
          // Nitrogen ion dominant (Deep Violet / Indigo / Cyan)
          auroraGrad.addColorStop(0, "rgba(180, 0, 255, 0)");
          auroraGrad.addColorStop(0.3, currentPreset.primaryColor);
          auroraGrad.addColorStop(0.7, currentPreset.secondaryColor);
          auroraGrad.addColorStop(1, "rgba(0, 180, 255, 0)");
        } else {
          // Balanced STEVE / Multicolored Corona
          auroraGrad.addColorStop(0, "rgba(230, 150, 255, 0)");
          auroraGrad.addColorStop(0.35, currentPreset.primaryColor);
          auroraGrad.addColorStop(0.7, currentPreset.secondaryColor);
          auroraGrad.addColorStop(1, "rgba(80, 240, 200, 0)");
        }

        ctx.fillStyle = auroraGrad;
        ctx.fill();

        // Rays / Vertical Shimmer Striations along geomagnetic lines
        ctx.lineWidth = 1.5;
        for (let r = l * 25; r < width; r += 20 + l * 5) {
          const rayX = (r + Math.sin(t + l) * 20) % width;
          const rayHeight = amplitude * 1.8;
          const rayY1 = baseHeight + Math.sin(rayX * freq1 + t) * amplitude - rayHeight;
          const rayY2 = rayY1 + rayHeight * 1.5;

          const rayGrad = ctx.createLinearGradient(rayX, rayY1, rayX, rayY2);
          rayGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
          rayGrad.addColorStop(0.5, currentPreset.primaryColor);
          rayGrad.addColorStop(1, "rgba(255, 255, 255, 0)");

          ctx.strokeStyle = rayGrad;
          ctx.beginPath();
          ctx.moveTo(rayX, rayY1);
          ctx.lineTo(rayX, rayY2);
          ctx.stroke();
        }
      }
      ctx.restore();

      // 4. Solar Wind Charged Particles Raining Along Field Lines
      ctx.save();
      simStateRef.current.particles.forEach((p) => {
        if (isPlaying) {
          p.y += p.vy;
          p.x += p.vx + Math.sin(t * 2 + p.y * 0.01) * 0.5;
          p.life += 1;

          if (p.y > height * 0.75 || p.life > p.maxLife) {
            p.y = Math.random() * (height * 0.2);
            p.x = Math.random() * width;
            p.life = 0;
          }
        }

        const particleAlpha = Math.sin((p.life / p.maxLife) * Math.PI) * 0.8;
        ctx.fillStyle = currentPreset.accentColor;
        ctx.globalAlpha = Math.max(0, particleAlpha);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // 5. Active Solar Flares / Interactive Bursts
      ctx.save();
      simStateRef.current.flares = simStateRef.current.flares.filter((f) => f.life > 0);
      simStateRef.current.flares.forEach((f) => {
        if (isPlaying) {
          f.x += f.vx;
          f.y += f.vy;
          f.life -= f.decay;
        }

        ctx.globalAlpha = Math.max(0, f.life);
        ctx.fillStyle = f.color;
        ctx.beginPath();
        ctx.arc(f.x, f.y, 2.5 * f.life, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // 6. Mountain Horizon Silhouette
      if (showMountains) {
        ctx.save();
        ctx.fillStyle = "#02040a";
        ctx.beginPath();
        ctx.moveTo(0, height);

        const mPoints = [
          { x: 0, y: height - 60 },
          { x: width * 0.15, y: height - 110 },
          { x: width * 0.28, y: height - 70 },
          { x: width * 0.42, y: height - 145 },
          { x: width * 0.58, y: height - 85 },
          { x: width * 0.72, y: height - 130 },
          { x: width * 0.88, y: height - 75 },
          { x: width, y: height - 95 },
          { x: width, y: height },
        ];

        ctx.moveTo(mPoints[0].x, mPoints[0].y);
        for (let i = 1; i < mPoints.length; i++) {
          ctx.lineTo(mPoints[i].x, mPoints[i].y);
        }
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fill();

        // Soft snow cap highlight glow
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      }

      // 7. Telemetry Oscilloscope Rendering (Geomagnetic Strain nT)
      if (scopeCtx && scopeCanvas) {
        const sw = scopeCanvas.width;
        const sh = scopeCanvas.height;

        scopeCtx.fillStyle = "#050b14";
        scopeCtx.fillRect(0, 0, sw, sh);

        // Scope Grid
        scopeCtx.strokeStyle = "rgba(0, 255, 135, 0.1)";
        scopeCtx.lineWidth = 1;
        for (let gx = 0; gx < sw; gx += 20) {
          scopeCtx.beginPath();
          scopeCtx.moveTo(gx, 0);
          scopeCtx.lineTo(gx, sh);
          scopeCtx.stroke();
        }
        for (let gy = 0; gy < sh; gy += 15) {
          scopeCtx.beginPath();
          scopeCtx.moveTo(0, gy);
          scopeCtx.lineTo(sw, gy);
          scopeCtx.stroke();
        }

        // Live Geomagnetic Waveform Calculation
        const currentStrain = Math.sin(t * 4) * (kpIndex * 3) + Math.cos(t * 9) * (turbulence * 8);
        simStateRef.current.history.push(currentStrain);
        if (simStateRef.current.history.length > sw / 2) {
          simStateRef.current.history.shift();
        }

        scopeCtx.strokeStyle = currentPreset.primaryColor;
        scopeCtx.lineWidth = 2;
        scopeCtx.shadowColor = currentPreset.primaryColor;
        scopeCtx.shadowBlur = 6;
        scopeCtx.beginPath();

        const hist = simStateRef.current.history;
        for (let i = 0; i < hist.length; i++) {
          const sx = i * 2;
          const sy = sh / 2 + hist[i];
          if (i === 0) scopeCtx.moveTo(sx, sy);
          else scopeCtx.lineTo(sx, sy);
        }
        scopeCtx.stroke();
        scopeCtx.shadowBlur = 0;
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [
    selectedPreset,
    kpIndex,
    solarWindSpeed,
    oxRatio,
    turbulence,
    waveSpeed,
    particleDensity,
    showStars,
    showMountains,
    isPlaying,
  ]);

  // Canvas Mouse & Touch Event Handlers
  const handleCanvasMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    simStateRef.current.isDragging = true;
    simStateRef.current.dragPos = { x, y };

    // Inject Solar Flare burst on click
    const preset = PRESETS.find((p) => p.id === selectedPreset) || PRESETS[0];
    const newFlares = [];
    for (let i = 0; i < 35; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = Math.random() * 6 + 1.5;
      newFlares.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        life: 1.0,
        decay: Math.random() * 0.03 + 0.015,
        color: Math.random() > 0.5 ? preset.primaryColor : preset.secondaryColor,
      });
    }
    simStateRef.current.flares.push(...newFlares);
  };

  const handleCanvasMouseMove = (e) => {
    if (!simStateRef.current.isDragging) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    simStateRef.current.dragPos = { x, y };
  };

  const handleCanvasMouseUp = () => {
    simStateRef.current.isDragging = false;
  };

  const triggerManualFlare = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const x = canvas.width / 2 + (Math.random() - 0.5) * 200;
    const y = canvas.height * 0.4 + (Math.random() - 0.5) * 100;
    const preset = PRESETS.find((p) => p.id === selectedPreset) || PRESETS[0];
    const newFlares = [];
    for (let i = 0; i < 50; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = Math.random() * 7 + 2;
      newFlares.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        life: 1.0,
        decay: Math.random() * 0.025 + 0.01,
        color: Math.random() > 0.5 ? preset.primaryColor : preset.secondaryColor,
      });
    }
    simStateRef.current.flares.push(...newFlares);
  };

  return (
    <div className="max-w-6xl mx-auto my-8 px-4">
      {/* Container Card */}
      <div className="bg-slate-950 text-slate-100 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-xl">
        {/* Header Bar */}
        <div className="p-6 border-b border-slate-800/80 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xl font-bold">
                🌌
              </span>
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                  Aurora Borealis Physics Studio
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Interactive Polar Atmospheric Solar Wind Excitation & Magnetosphere Simulator
                </p>
              </div>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                kpIndex >= 7
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                  : kpIndex >= 5
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
              }`}
            >
              Kp-{kpIndex} ({telemetry.kpSeverity})
            </span>
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              ⚡ {solarWindSpeed} km/s Wind
            </span>
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/30">
              ✨ {telemetry.emissionPeak}
            </span>
          </div>
        </div>

        {/* Main Display Area */}
        <div className="relative bg-black group">
          <canvas
            ref={canvasRef}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            className="w-full h-[480px] cursor-crosshair block"
          />

          {/* Canvas Overlays / Interactive Prompt */}
          <div className="absolute top-4 left-4 pointer-events-none bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-300">
            💡 Click or drag on sky to inject Solar Flares
          </div>

          {/* Control Overlay Buttons */}
          <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md p-2 rounded-2xl border border-slate-800">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                isPlaying
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
              }`}
            >
              {isPlaying ? "⏸ Pause" : "▶ Play"}
            </button>
            <button
              onClick={triggerManualFlare}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 transition-all"
            >
              💥 Solar Flare
            </button>
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                audioEnabled
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30"
                  : "bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700"
              }`}
            >
              {audioEnabled ? "🔊 Ambient Synth On" : "🔇 Enable Synth"}
            </button>
          </div>
        </div>

        {/* Presets Bar */}
        <div className="p-4 bg-slate-900/70 border-b border-slate-800/80">
          <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
            Atmospheric Phenomena Presets
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {PRESETS.map((preset) => {
              const isActive = selectedPreset === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset.id)}
                  className={`p-3 rounded-2xl text-left border text-xs transition-all flex flex-col justify-between ${
                    isActive
                      ? "bg-slate-800 border-emerald-500/60 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/40"
                      : "bg-slate-900/60 border-slate-800 hover:bg-slate-800/60 text-slate-300"
                  }`}
                >
                  <div className="font-bold text-slate-200 mb-1">{preset.name}</div>
                  <div className="text-[10px] text-slate-400 line-clamp-2">{preset.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Controls & Telemetry Grid */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 bg-slate-950">
          {/* Controls Column 1 */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Solar Wind & Field Parameters
            </h3>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-300">Geomagnetic Kp-Index</span>
                <span className="text-emerald-400 font-bold">{kpIndex} / 9</span>
              </div>
              <input
                type="range"
                min="0"
                max="9"
                step="1"
                value={kpIndex}
                onChange={(e) => setKpIndex(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-300">Solar Wind Velocity</span>
                <span className="text-cyan-400 font-bold">{solarWindSpeed} km/s</span>
              </div>
              <input
                type="range"
                min="300"
                max="1000"
                step="10"
                value={solarWindSpeed}
                onChange={(e) => setSolarWindSpeed(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-300">Gas Excitation Ratio (O₂ / N₂)</span>
                <span className="text-purple-400 font-bold">{oxRatio}% Oxygen</span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                step="5"
                value={oxRatio}
                onChange={(e) => setOxRatio(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
              />
            </div>
          </div>

          {/* Controls Column 2 */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Curtain & Fluid Dynamics
            </h3>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-300">Ionosphere Turbulence</span>
                <span className="text-amber-400 font-bold">{turbulence.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="1.0"
                step="0.05"
                value={turbulence}
                onChange={(e) => setTurbulence(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-300">Wave Oscillation Speed</span>
                <span className="text-rose-400 font-bold">{waveSpeed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="4.0"
                step="0.2"
                value={waveSpeed}
                onChange={(e) => setWaveSpeed(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-300">Particle Stream Density</span>
                <span className="text-teal-400 font-bold">{particleDensity} units</span>
              </div>
              <input
                type="range"
                min="30"
                max="300"
                step="10"
                value={particleDensity}
                onChange={(e) => setParticleDensity(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
              />
            </div>
          </div>

          {/* Column 3: Oscilloscope Scope & Toggle Options */}
          <div className="space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Geomagnetic Field Telemetry Scope (nT)
              </h3>
              <div className="bg-slate-900 p-2.5 rounded-2xl border border-slate-800">
                <canvas ref={scopeCanvasRef} className="w-full h-[70px] rounded-lg block" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setShowStars(!showStars)}
                className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                  showStars
                    ? "bg-slate-800 text-slate-200 border-slate-700"
                    : "bg-slate-900/40 text-slate-500 border-slate-800"
                }`}
              >
                {showStars ? "✨ Stars: Visible" : "✨ Stars: Hidden"}
              </button>
              <button
                onClick={() => setShowMountains(!showMountains)}
                className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                  showMountains
                    ? "bg-slate-800 text-slate-200 border-slate-700"
                    : "bg-slate-900/40 text-slate-500 border-slate-800"
                }`}
              >
                {showMountains ? "🏔 Terrain: Visible" : "🏔 Terrain: Hidden"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuroraBorealisStudio;
