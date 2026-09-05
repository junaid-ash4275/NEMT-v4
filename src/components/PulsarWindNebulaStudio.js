import React, { useState, useEffect, useRef, useCallback } from "react";

// Color Schemes for the Pulsar Wind Nebula
const SPECTRUMS = {
  crab: {
    id: "crab",
    name: "Crab Synchrotron Gold",
    bg: "from-slate-950 via-amber-950/40 to-slate-900",
    canvasBg: "#030408",
    accentText: "text-amber-400",
    accentBorder: "border-amber-500/40",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    buttonBg: "bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold",
    beamColor: "rgba(255, 200, 80, 0.95)",
    jetColor: "rgba(255, 140, 30, 0.8)",
    toroidColor: "rgba(245, 158, 11, 0.5)",
    filamentColors: ["#ffffff", "#fef08a", "#f59e0b", "#d97706", "#991b1b"],
    particleColor: "#fde047",
  },
  vela: {
    id: "vela",
    name: "Vela Cyan & Electric Violet",
    bg: "from-slate-950 via-cyan-950/40 to-slate-900",
    canvasBg: "#020612",
    accentText: "text-cyan-400",
    accentBorder: "border-cyan-500/40",
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    buttonBg: "bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold",
    beamColor: "rgba(100, 240, 255, 0.95)",
    jetColor: "rgba(30, 180, 255, 0.8)",
    toroidColor: "rgba(6, 182, 212, 0.5)",
    filamentColors: ["#ffffff", "#a5f3fc", "#06b6d4", "#3b82f6", "#7c3aed"],
    particleColor: "#38bdf8",
  },
  magnetar: {
    id: "magnetar",
    name: "Magnetar Crimson Flare",
    bg: "from-slate-950 via-rose-950/40 to-slate-900",
    canvasBg: "#0c0205",
    accentText: "text-rose-400",
    accentBorder: "border-rose-500/40",
    badge: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    buttonBg: "bg-rose-600 hover:bg-rose-500 text-white font-semibold",
    beamColor: "rgba(255, 100, 120, 0.95)",
    jetColor: "rgba(244, 63, 94, 0.8)",
    toroidColor: "rgba(225, 29, 72, 0.5)",
    filamentColors: ["#ffffff", "#fecdd3", "#fb7185", "#e11d48", "#881337"],
    particleColor: "#f43f5e",
  },
  emerald: {
    id: "emerald",
    name: "Millisecond Emerald Quantum",
    bg: "from-slate-950 via-emerald-950/40 to-slate-900",
    canvasBg: "#020906",
    accentText: "text-emerald-400",
    accentBorder: "border-emerald-500/40",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    buttonBg: "bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold",
    beamColor: "rgba(100, 255, 180, 0.95)",
    jetColor: "rgba(16, 185, 129, 0.8)",
    toroidColor: "rgba(5, 150, 105, 0.5)",
    filamentColors: ["#ffffff", "#a7f3d0", "#10b981", "#059669", "#064e3b"],
    particleColor: "#34d399",
  },
  ultraviolet: {
    id: "ultraviolet",
    name: "Geminga Ultraviolet Void",
    bg: "from-purple-950/40 via-slate-950 to-indigo-950/30",
    canvasBg: "#06030e",
    accentText: "text-purple-400",
    accentBorder: "border-purple-500/40",
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    buttonBg: "bg-purple-600 hover:bg-purple-500 text-white font-semibold",
    beamColor: "rgba(220, 140, 255, 0.95)",
    jetColor: "rgba(168, 85, 247, 0.8)",
    toroidColor: "rgba(147, 51, 234, 0.5)",
    filamentColors: ["#ffffff", "#f5d0fe", "#c084fc", "#9333ea", "#4c1d95"],
    particleColor: "#e879f9",
  },
};

// Preset configurations based on astronomical objects
const PRESETS = [
  {
    id: "crab_m1",
    name: "Crab Nebula (M1 / PSR B0531+21)",
    desc: "Historic 1054 AD supernova remnant with a 30 Hz spinning neutron star and relativistic particle wind.",
    spectrum: "crab",
    spinSpeed: 1800, // RPM
    magneticField: 5.5, // Teragauss
    jetIntensity: 85,
    beamAngle: 35,
    filamentDensity: 160,
    gasExpansion: 1.4,
    showBeams: true,
    showFieldLines: true,
    showJets: true,
  },
  {
    id: "vela_pulsar",
    name: "Vela Pulsar (PSR B0833-45)",
    desc: "Youthful pulsar exhibiting sudden spin glitches, helical jet precession, and intense cyan plasma arcs.",
    spectrum: "vela",
    spinSpeed: 2400,
    magneticField: 7.2,
    jetIntensity: 90,
    beamAngle: 50,
    filamentDensity: 200,
    gasExpansion: 1.8,
    showBeams: true,
    showFieldLines: true,
    showJets: true,
  },
  {
    id: "magnetar_1806",
    name: "Magnetar Superflare (SGR 1806-20)",
    desc: "Ultra-magnetic neutron star with magnetic fields exceeding 100 Teragauss generating titanic gamma flare shocks.",
    spectrum: "magnetar",
    spinSpeed: 450,
    magneticField: 10.0,
    jetIntensity: 100,
    beamAngle: 20,
    filamentDensity: 240,
    gasExpansion: 2.2,
    showBeams: true,
    showFieldLines: true,
    showJets: true,
  },
  {
    id: "millisecond_j0737",
    name: "Millisecond Pulsar (PSR J0737-3039A)",
    desc: "Ultra-compact recycled pulsar rotating hundreds of times per second with sharp laser-like beacon beams.",
    spectrum: "emerald",
    spinSpeed: 4800,
    magneticField: 3.2,
    jetIntensity: 70,
    beamAngle: 15,
    filamentDensity: 120,
    gasExpansion: 1.0,
    showBeams: true,
    showFieldLines: false,
    showJets: true,
  },
  {
    id: "geminga_void",
    name: "Geminga Relativistic Shroud",
    desc: "Pure gamma-ray pulsar shrouded in a subtle ultraviolet particle wind and high-energy electron halos.",
    spectrum: "ultraviolet",
    spinSpeed: 1200,
    magneticField: 4.8,
    jetIntensity: 60,
    beamAngle: 40,
    filamentDensity: 140,
    gasExpansion: 1.2,
    showBeams: true,
    showFieldLines: true,
    showJets: false,
  },
];

const PulsarWindNebulaStudio = () => {
  // State variables
  const [activePreset, setActivePreset] = useState(PRESETS[0].id);
  const [spectrumKey, setSpectrumKey] = useState("crab");
  const [spinSpeed, setSpinSpeed] = useState(1800); // RPM
  const [magneticField, setMagneticField] = useState(5.5); // Teragauss
  const [jetIntensity, setJetIntensity] = useState(85); // %
  const [beamAngle, setBeamAngle] = useState(35); // degrees
  const [filamentDensity, setFilamentDensity] = useState(160);
  const [gasExpansion, setGasExpansion] = useState(1.4);

  // Toggles
  const [showBeams, setShowBeams] = useState(true);
  const [showFieldLines, setShowFieldLines] = useState(true);
  const [showJets, setShowJets] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [showParticles, setShowParticles] = useState(true);

  // Mouse interaction state
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, active: false });

  // References
  const mainCanvasRef = useRef(null);
  const scopeCanvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const audioCtxRef = useRef(null);
  const lastPulseTimeRef = useRef(0);

  // Shockwaves array created on user click
  const shockwavesRef = useRef([]);
  // Telemetry waveform data array
  const waveformRef = useRef(new Array(100).fill(0));

  const currentSpectrum = SPECTRUMS[spectrumKey] || SPECTRUMS.crab;

  // Apply preset parameters
  const applyPreset = (preset) => {
    setActivePreset(preset.id);
    setSpectrumKey(preset.spectrum);
    setSpinSpeed(preset.spinSpeed);
    setMagneticField(preset.magneticField);
    setJetIntensity(preset.jetIntensity);
    setBeamAngle(preset.beamAngle);
    setFilamentDensity(preset.filamentDensity);
    setGasExpansion(preset.gasExpansion);
    setShowBeams(preset.showBeams);
    setShowFieldLines(preset.showFieldLines);
    setShowJets(preset.showJets);
  };

  // Trigger magnetar flare shockwave on click
  const handleCanvasClick = (e) => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    shockwavesRef.current.push({
      x,
      y,
      radius: 5,
      maxRadius: Math.max(canvas.width, canvas.height) * 0.6,
      opacity: 1.0,
      color: currentSpectrum.particleColor,
    });
  };

  // Web Audio synth for pulsar lighthouse pulse
  const triggerAudioPulse = useCallback(() => {
    if (!audioEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // High frequency pitch sweep mimicking pulsar radio chirp
      const baseFreq = 800 + (spinSpeed / 6000) * 1200;
      osc.type = "sine";
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.3, now + 0.05);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch (err) {
      // Audio context error fallback
    }
  }, [audioEnabled, spinSpeed]);

  // Main Canvas Animation Loop
  useEffect(() => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Set high resolution canvas dimensions
    const updateSize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = 540;
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);

    // Initialize Gas Filaments & Plasma Particles
    const particles = [];
    const particleCount = filamentDensity * 3;
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 30 + Math.random() * 220;
      particles.push({
        angle,
        dist,
        baseDist: dist,
        speed: (0.2 + Math.random() * 0.8) * gasExpansion,
        size: 0.8 + Math.random() * 2.5,
        alpha: 0.2 + Math.random() * 0.7,
        hueOffset: Math.random() * 0.4,
      });
    }

    let time = 0;

    const render = () => {
      time += 0.016;
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      // Dark Cosmic Canvas Clear
      ctx.fillStyle = currentSpectrum.canvasBg;
      ctx.fillRect(0, 0, width, height);

      // Deep space starfield backplate
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      for (let s = 0; s < 70; s++) {
        const sx = (Math.sin(s * 99 + time * 0.05) * 0.5 + 0.5) * width;
        const sy = (Math.cos(s * 33 + time * 0.05) * 0.5 + 0.5) * height;
        const sz = (Math.sin(s * 12) * 0.5 + 0.5) * 1.5;
        ctx.fillRect(sx, sy, sz, sz);
      }

      // Calculation of Rotation Angle & Pulse Sweep
      const rps = spinSpeed / 60; // rotations per second
      const rotAngle = time * rps * Math.PI * 2;
      const beamRad = (beamAngle * Math.PI) / 180;

      // 1. Render Outer Gas Nebula Cloud / Filaments
      ctx.save();
      ctx.globalCompositeOperation = "screen";

      particles.forEach((p) => {
        p.angle += (p.speed * 0.005 * (spinSpeed / 1000));
        p.dist += p.speed * 0.1;
        if (p.dist > Math.max(width, height) * 0.45) {
          p.dist = 20 + Math.random() * 40;
        }

        const px = centerX + Math.cos(p.angle) * p.dist;
        const py = centerY + Math.sin(p.angle) * p.dist * 0.6; // slightly elliptical perspective

        const grad = ctx.createRadialGradient(px, py, 0, px, py, p.size * 4);
        const colorIdx = Math.floor((p.hueOffset + (p.dist / 250)) % 1 * currentSpectrum.filamentColors.length);
        const col = currentSpectrum.filamentColors[colorIdx] || currentSpectrum.particleColor;

        grad.addColorStop(0, col);
        grad.addColorStop(1, "transparent");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(px, py, p.size * 3, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // 2. Render Synchrotron Accretion Toroid / Equatorial Disk
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (let t = 0; t < 3; t++) {
        const toroidRadius = 70 + t * 45 + Math.sin(time * 2 + t) * 5;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, toroidRadius, toroidRadius * 0.35, rotAngle * 0.05, 0, Math.PI * 2);
        ctx.strokeStyle = currentSpectrum.toroidColor;
        ctx.lineWidth = 4 - t;
        ctx.shadowColor = currentSpectrum.particleColor;
        ctx.shadowBlur = 15;
        ctx.stroke();
      }
      ctx.restore();

      // 3. Render Dipole Magnetic Field Lines
      if (showFieldLines) {
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        ctx.lineWidth = 1.2;
        const numLoops = 8;
        for (let i = 0; i < numLoops; i++) {
          const loopAngle = (i / numLoops) * Math.PI * 2 + rotAngle * 0.1;
          const magRadius = 60 + magneticField * 12;

          ctx.beginPath();
          for (let theta = -Math.PI / 2; theta <= Math.PI / 2; theta += 0.1) {
            const r = magRadius * Math.pow(Math.cos(theta), 2);
            const lx = centerX + r * Math.sin(theta + loopAngle);
            const ly = centerY - r * Math.cos(theta + loopAngle) * 0.6;
            if (theta === -Math.PI / 2) ctx.moveTo(lx, ly);
            else ctx.lineTo(lx, ly);
          }
          ctx.strokeStyle = `rgba(147, 197, 253, ${0.15 + (magneticField / 20)})`;
          ctx.stroke();
        }
        ctx.restore();
      }

      // 4. Render Relativistic Particle Jets (Along Spin Axis)
      if (showJets) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        const jetLen = 220 * (jetIntensity / 100);
        const jetW = 14;

        // Top & Bottom Polar Helical Jets
        [1, -1].forEach((dir) => {
          const jetGrad = ctx.createLinearGradient(centerX, centerY, centerX, centerY + dir * jetLen);
          jetGrad.addColorStop(0, "rgba(255, 255, 255, 0.9)");
          jetGrad.addColorStop(0.3, currentSpectrum.jetColor);
          jetGrad.addColorStop(1, "transparent");

          ctx.beginPath();
          ctx.moveTo(centerX - jetW / 2, centerY);
          ctx.lineTo(centerX + jetW / 2, centerY);
          ctx.lineTo(centerX + jetW * 1.8, centerY + dir * jetLen);
          ctx.lineTo(centerX - jetW * 1.8, centerY + dir * jetLen);
          ctx.closePath();
          ctx.fillStyle = jetGrad;
          ctx.fill();

          // Helical spiral effect around jet
          ctx.beginPath();
          for (let h = 0; h < jetLen; h += 5) {
            const hx = centerX + Math.sin(h * 0.1 - time * 8 * dir) * (6 + h * 0.08);
            const hy = centerY + dir * h;
            if (h === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
          }
          ctx.strokeStyle = currentSpectrum.particleColor;
          ctx.lineWidth = 2;
          ctx.stroke();
        });
        ctx.restore();
      }

      // 5. Render Rotating Pulsar Beacon Cones (Lighthouse Effect)
      let currentPulseIntensity = 0;
      if (showBeams) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";

        const beamLength = Math.max(width, height) * 0.8;

        // Two opposing beacon cones emitting from magnetic poles
        [0, Math.PI].forEach((phaseOffset) => {
          const currentBeamAngle = rotAngle + phaseOffset;

          const b1X = centerX + Math.cos(currentBeamAngle - beamRad) * beamLength;
          const b1Y = centerY + Math.sin(currentBeamAngle - beamRad) * beamLength;
          const b2X = centerX + Math.cos(currentBeamAngle + beamRad) * beamLength;
          const b2Y = centerY + Math.sin(currentBeamAngle + beamRad) * beamLength;

          const beamGrad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, beamLength);
          beamGrad.addColorStop(0, "rgba(255, 255, 255, 1.0)");
          beamGrad.addColorStop(0.2, currentSpectrum.beamColor);
          beamGrad.addColorStop(1, "transparent");

          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(b1X, b1Y);
          ctx.lineTo(b2X, b2Y);
          ctx.closePath();
          ctx.fillStyle = beamGrad;
          ctx.fill();

          // Check if beam is currently pointing towards observer line of sight (horizontal alignment)
          const normAngle = (currentBeamAngle % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
          const isFacingObserver = Math.abs(normAngle - Math.PI) < beamRad || Math.abs(normAngle) < beamRad;
          if (isFacingObserver) {
            currentPulseIntensity = 1.0 - Math.abs(normAngle - Math.PI) / beamRad;
          }
        });
        ctx.restore();
      }

      // Trigger audio pulse when pulse intensity peaks
      if (currentPulseIntensity > 0.7 && time - lastPulseTimeRef.current > 0.08) {
        triggerAudioPulse();
        lastPulseTimeRef.current = time;
      }

      // Update telemetry waveform history
      waveformRef.current.shift();
      waveformRef.current.push(currentPulseIntensity > 0 ? Math.min(1, currentPulseIntensity * 1.2) : Math.random() * 0.05);

      // 6. Render User Interactive Shockwaves (From Clicks)
      if (shockwavesRef.current.length > 0) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        shockwavesRef.current.forEach((sw, idx) => {
          sw.radius += 8;
          sw.opacity -= 0.02;

          if (sw.opacity <= 0 || sw.radius >= sw.maxRadius) {
            shockwavesRef.current.splice(idx, 1);
            return;
          }

          ctx.beginPath();
          ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
          ctx.strokeStyle = sw.color;
          ctx.lineWidth = 3;
          ctx.globalAlpha = sw.opacity;
          ctx.stroke();

          // Outer shock glow
          ctx.beginPath();
          ctx.arc(sw.x, sw.y, sw.radius * 0.95, 0, Math.PI * 2);
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        });
        ctx.restore();
      }

      // 7. Render Central Neutron Star Core (The Pulsar Singularity)
      ctx.save();
      const coreRadius = 14;

      // Outer Gravitational Flash Glow
      const flashGlow = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        coreRadius * (3 + currentPulseIntensity * 4)
      );
      flashGlow.addColorStop(0, "rgba(255, 255, 255, 1.0)");
      flashGlow.addColorStop(0.3, currentSpectrum.particleColor);
      flashGlow.addColorStop(1, "transparent");

      ctx.fillStyle = flashGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, coreRadius * (3 + currentPulseIntensity * 4), 0, Math.PI * 2);
      ctx.fill();

      // Solid Dense Core
      const coreGrad = ctx.createRadialGradient(centerX - 3, centerY - 3, 0, centerX, centerY, coreRadius);
      coreGrad.addColorStop(0, "#ffffff");
      coreGrad.addColorStop(0.5, "#e0f2fe");
      coreGrad.addColorStop(1, "#0284c7");

      ctx.fillStyle = coreGrad;
      ctx.shadowColor = "#38bdf8";
      ctx.shadowBlur = 25;
      ctx.beginPath();
      ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", updateSize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    spinSpeed,
    magneticField,
    jetIntensity,
    beamAngle,
    filamentDensity,
    gasExpansion,
    showBeams,
    showFieldLines,
    showJets,
    spectrumKey,
    currentSpectrum,
    triggerAudioPulse,
  ]);

  // Telemetry Oscilloscope Canvas Loop
  useEffect(() => {
    const scopeCanvas = scopeCanvasRef.current;
    if (!scopeCanvas) return;
    const sCtx = scopeCanvas.getContext("2d");

    let scopeAnimFrame;

    const drawScope = () => {
      const w = scopeCanvas.width = scopeCanvas.clientWidth || 280;
      const h = scopeCanvas.height = 70;

      sCtx.fillStyle = "#090d16";
      sCtx.fillRect(0, 0, w, h);

      // Grid Lines
      sCtx.strokeStyle = "rgba(30, 41, 59, 0.8)";
      sCtx.lineWidth = 1;

      // Horizontal center line
      sCtx.beginPath();
      sCtx.moveTo(0, h / 2);
      sCtx.lineTo(w, h / 2);
      sCtx.stroke();

      // Vertical grid divisions
      for (let x = 0; x < w; x += 30) {
        sCtx.beginPath();
        sCtx.moveTo(x, 0);
        sCtx.lineTo(x, h);
        sCtx.stroke();
      }

      // Draw Pulse Waveform
      const data = waveformRef.current;
      sCtx.beginPath();
      const step = w / data.length;

      data.forEach((val, i) => {
        const x = i * step;
        const y = h - 6 - val * (h - 12);
        if (i === 0) sCtx.moveTo(x, y);
        else sCtx.lineTo(x, y);
      });

      sCtx.strokeStyle = currentSpectrum.particleColor;
      sCtx.lineWidth = 2;
      sCtx.shadowColor = currentSpectrum.particleColor;
      sCtx.shadowBlur = 8;
      sCtx.stroke();

      scopeAnimFrame = requestAnimationFrame(drawScope);
    };

    drawScope();

    return () => {
      if (scopeAnimFrame) cancelAnimationFrame(scopeAnimFrame);
    };
  }, [currentSpectrum]);

  // Calculated derived astrophysics parameters
  const spinHz = (spinSpeed / 60).toFixed(1);
  const pulsePeriodMs = (1000 / (spinSpeed / 60)).toFixed(1);
  // Energy loss rate formula estimation: E_dot ~ B^2 * omega^4
  const energyLossErgs = ((Math.pow(magneticField, 2) * Math.pow(spinSpeed / 60, 4)) / 10000).toFixed(2);

  return (
    <div className={`w-full py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-b ${currentSpectrum.bg} text-slate-100 transition-colors duration-700`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Studio Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900/80 p-6 rounded-3xl border border-slate-800 backdrop-blur-md">
          <div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 text-xs font-bold rounded-full border ${currentSpectrum.badge} uppercase tracking-widest`}>
                ASTROPHYSICS LABORATORY
              </span>
              <span className="text-xs text-slate-400 font-mono">PSR-SIM v4.2</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2 text-white flex items-center gap-2">
              Pulsar Wind Nebula & Magnetosphere Studio
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Simulate high-velocity neutron star magnetic dipoles, relativistic particle winds, synchrotron accretion toroids, and lighthouse beacon sweeps.
            </p>
          </div>

          {/* Quick Presets Dropdown / Buttons */}
          <div className="flex flex-wrap gap-2 items-center">
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 border ${
                  activePreset === preset.id
                    ? `${currentSpectrum.buttonBg} shadow-lg shadow-amber-500/10`
                    : "bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border-slate-700"
                }`}
              >
                {preset.name.split(" ")[0]} {preset.name.split(" ")[1]}
              </button>
            ))}
          </div>
        </div>

        {/* Main Display: Interactive Canvas & Overlay Metrics */}
        <div className="relative bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
          {/* Main Simulation Canvas */}
          <canvas
            ref={mainCanvasRef}
            onClick={handleCanvasClick}
            className="w-full h-[540px] block cursor-pointer"
            title="Click anywhere to trigger a Magnetar Superflare shockwave!"
          />

          {/* Canvas Top-Left Telemetry Overlay */}
          <div className="absolute top-4 left-4 pointer-events-none space-y-1 font-mono text-xs bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80 backdrop-blur-md">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>BEACON FREQ: <strong className={currentSpectrum.accentText}>{spinHz} Hz</strong> ({spinSpeed} RPM)</span>
            </div>
            <div className="text-slate-400">PULSE PERIOD: <span className="text-slate-200 font-bold">{pulsePeriodMs} ms</span></div>
            <div className="text-slate-400">DIPOLE B-FIELD: <span className="text-slate-200 font-bold">{magneticField} Teragauss</span></div>
            <div className="text-slate-400">ROTATIONAL ENERGY LOSS (Ė): <span className="text-amber-400 font-bold">{energyLossErgs} × 10³⁸ erg/s</span></div>
          </div>

          {/* Canvas Bottom-Right Click Instruction */}
          <div className="absolute bottom-4 right-4 pointer-events-none bg-slate-900/90 text-slate-300 px-3 py-1.5 rounded-xl border border-slate-800 text-xs flex items-center gap-2">
            <span>⚡ Click canvas to trigger a Magnetar Superflare shockwave</span>
          </div>
        </div>

        {/* Studio Control Panel & Telemetry Grid */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-md grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Column 1: Rotation & Field Dynamics */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Pulsar Kinematics & Magnetosphere
            </h3>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-300">Spin Velocity (RPM)</span>
                <span className={`${currentSpectrum.accentText} font-bold`}>{spinSpeed} RPM ({spinHz} Hz)</span>
              </div>
              <input
                type="range"
                min="100"
                max="6000"
                step="100"
                value={spinSpeed}
                onChange={(e) => setSpinSpeed(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-300">Dipole Field ($B_0$)</span>
                <span className="text-cyan-400 font-bold">{magneticField} Teragauss</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="10.0"
                step="0.1"
                value={magneticField}
                onChange={(e) => setMagneticField(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-300">Relativistic Jet Intensity</span>
                <span className="text-rose-400 font-bold">{jetIntensity}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={jetIntensity}
                onChange={(e) => setJetIntensity(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-400"
              />
            </div>
          </div>

          {/* Controls Column 2: Beam & Nebula Parameters */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Lighthouse Beam & Gas Nebula
            </h3>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-300">Beacon Cone Width Angle</span>
                <span className="text-emerald-400 font-bold">{beamAngle}°</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                step="1"
                value={beamAngle}
                onChange={(e) => setBeamAngle(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-300">Filament Density</span>
                <span className="text-purple-400 font-bold">{filamentDensity} particles</span>
              </div>
              <input
                type="range"
                min="40"
                max="300"
                step="10"
                value={filamentDensity}
                onChange={(e) => setFilamentDensity(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-300">Spectrum Energy Theme</span>
              </div>
              <select
                value={spectrumKey}
                onChange={(e) => setSpectrumKey(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-amber-500"
              >
                {Object.values(SPECTRUMS).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Controls Column 3: Oscilloscope & Audio Synth Toggles */}
          <div className="space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Radio / Gamma-Ray Pulse Waveform Scope
              </h3>
              <div className="bg-slate-950 p-2 rounded-2xl border border-slate-800">
                <canvas ref={scopeCanvasRef} className="w-full h-[70px] rounded-lg block" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => setShowBeams(!showBeams)}
                className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                  showBeams ? "bg-slate-800 text-slate-200 border-slate-700" : "bg-slate-950/40 text-slate-500 border-slate-850"
                }`}
              >
                {showBeams ? "📡 Beams: Active" : "📡 Beams: Hidden"}
              </button>

              <button
                onClick={() => setShowFieldLines(!showFieldLines)}
                className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                  showFieldLines ? "bg-slate-800 text-slate-200 border-slate-700" : "bg-slate-950/40 text-slate-500 border-slate-850"
                }`}
              >
                {showFieldLines ? "🧲 B-Field: Active" : "🧲 B-Field: Hidden"}
              </button>

              <button
                onClick={() => setShowJets(!showJets)}
                className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                  showJets ? "bg-slate-800 text-slate-200 border-slate-700" : "bg-slate-950/40 text-slate-500 border-slate-850"
                }`}
              >
                {showJets ? "🚀 Jets: Active" : "🚀 Jets: Hidden"}
              </button>

              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                  audioEnabled ? "bg-amber-500/20 text-amber-300 border-amber-500/50" : "bg-slate-950/40 text-slate-500 border-slate-850"
                }`}
              >
                {audioEnabled ? "🔊 Sound: Chirp ON" : "🔇 Sound: Muted"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PulsarWindNebulaStudio;
