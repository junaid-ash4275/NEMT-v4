import React, { useState, useEffect, useRef, useCallback } from "react";

// Theme Configuration & Aesthetic Tokens
const THEMES = {
  hypernovaViolet: {
    id: "hypernovaViolet",
    name: "Collapsar Hypernova (Violet / Fuchsia)",
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    accentText: "text-purple-400",
    border: "border-purple-500/30",
    cardBg: "bg-slate-900/85 backdrop-blur-md border-purple-500/20",
    buttonBg: "bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white shadow-lg shadow-purple-500/25",
    canvasBg: "#080312",
    engineColor: "#e879f9",
    jetColor: "rgba(216, 180, 254, 0.9)",
    shockColor: "#f472b6",
    ismColor: "rgba(168, 85, 247, 0.15)",
    photonBlueshift: "#c084fc",
    photonRedshift: "#f43f5e",
    gridColor: "rgba(192, 132, 252, 0.08)",
  },
  fireballAmber: {
    id: "fireballAmber",
    name: "Relativistic Fireball (Amber / Crimson)",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    accentText: "text-amber-400",
    border: "border-amber-500/30",
    cardBg: "bg-slate-900/85 backdrop-blur-md border-amber-500/20",
    buttonBg: "bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white shadow-lg shadow-amber-500/25",
    canvasBg: "#120602",
    engineColor: "#fbbf24",
    jetColor: "rgba(253, 224, 71, 0.9)",
    shockColor: "#f43f5e",
    ismColor: "rgba(251, 146, 60, 0.15)",
    photonBlueshift: "#fef08a",
    photonRedshift: "#e11d48",
    gridColor: "rgba(251, 191, 36, 0.08)",
  },
  synchrotronCyan: {
    id: "synchrotronCyan",
    name: "Synchrotron Afterglow (Cyan / Blue)",
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    accentText: "text-cyan-400",
    border: "border-cyan-500/30",
    cardBg: "bg-slate-900/85 backdrop-blur-md border-cyan-500/20",
    buttonBg: "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25",
    canvasBg: "#020a14",
    engineColor: "#38bdf8",
    jetColor: "rgba(125, 211, 252, 0.9)",
    shockColor: "#60a5fa",
    ismColor: "rgba(56, 189, 248, 0.15)",
    photonBlueshift: "#bae6fd",
    photonRedshift: "#6366f1",
    gridColor: "rgba(56, 189, 248, 0.08)",
  },
  magnetarEmerald: {
    id: "magnetarEmerald",
    name: "Millisecond Magnetar Engine (Emerald / Jade)",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    accentText: "text-emerald-400",
    border: "border-emerald-500/30",
    cardBg: "bg-slate-900/85 backdrop-blur-md border-emerald-500/20",
    buttonBg: "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25",
    canvasBg: "#020f0a",
    engineColor: "#34d399",
    jetColor: "rgba(110, 231, 183, 0.9)",
    shockColor: "#2dd4bf",
    ismColor: "rgba(52, 211, 153, 0.15)",
    photonBlueshift: "#a7f3d0",
    photonRedshift: "#059669",
    gridColor: "rgba(52, 211, 153, 0.08)",
  },
};

// Astrophysical Presets based on real GRB observations & theoretical models
const PRESETS = {
  grb221009a_boat: {
    id: "grb221009a_boat",
    name: "🌌 GRB 221009A (Brightest Of All Time - BOAT)",
    subtitle: "Ultra-Energetic Long GRB powered by Massive Stellar Core Collapse",
    formula: "\\Gamma(t) = \\left( \\frac{3 E_{iso}}{4 \\pi m_p c^5 n_0 t^3} \\right)^{1/8}",
    desc: "Observed in Oct 2022, GRB 221009A released over 10^54 erg of isotropic energy. Features an ultra-narrow relativistic jet core (theta_jet = 1.5°) with Lorentz factor Gamma_0 ~ 400 viewed almost perfectly on-axis.",
    gamma0: 400,
    eIso: 100, // in units of 10^52 erg
    n0: 1.0, // cm^-3
    thetaJet: 1.5, // deg
    thetaObs: 0.5, // deg
    epsilonE: 0.1,
    epsilonB: 0.01,
  },
  gw170817_merger: {
    id: "gw170817_merger",
    name: "💫 GW170817 / GRB 170817A (Binary Neutron Star Merger)",
    subtitle: "Short GRB with Structured Relativistic Jet & Off-Axis View",
    formula: "\\delta_D = \\frac{1}{\\Gamma (1 - \\beta \\cos \\theta_{obs})}",
    desc: "The historic multi-messenger gravitational wave event. A binary neutron star collision launched a relativistic jet that pierced through dynamical ejecta, observed at an off-axis angle theta_obs ≈ 20°.",
    gamma0: 150,
    eIso: 0.1, // 10^51 erg
    n0: 0.001,
    thetaJet: 3.5,
    thetaObs: 20.0,
    epsilonE: 0.1,
    epsilonB: 0.001,
  },
  magnetar_engine: {
    id: "magnetar_engine",
    name: "⚡ Magnetar-Powered Energy Injection",
    subtitle: "Pulsar Wind Energy Injection into Blast Wave Shell",
    formula: "L_{spin}(t) = L_0 \\left( 1 + \\frac{t}{t_{sd}} \\right)^{-2}",
    desc: "A rapidly rotating millisecond magnetar (B ~ 10^15 G) continuously injects energy into the blast wave, producing a extended plateau phase in the afterglow X-ray light curve.",
    gamma0: 250,
    eIso: 5.0,
    n0: 0.1,
    thetaJet: 5.0,
    thetaObs: 2.0,
    epsilonE: 0.15,
    epsilonB: 0.05,
  },
  wind_medium_wolf_rayet: {
    id: "wind_medium_wolf_rayet",
    name: "🌀 Stellar Wind Cavity (Wolf-Rayet Collapsar)",
    subtitle: "Blast Wave Expansion into a Density Profile n(r) ∝ r^-2",
    formula: "n(r) = \\frac{\\dot{M}}{4 \\pi r^2 v_{wind}} \\implies \\Gamma(r) \\propto r^{-1/4}",
    desc: "Massive stellar winds from a Wolf-Rayet progenitor create a pre-existing circumstellar wind environment. The shock front decelerates earlier due to high central density.",
    gamma0: 300,
    eIso: 20.0,
    n0: 10.0,
    thetaJet: 4.0,
    thetaObs: 1.0,
    epsilonE: 0.08,
    epsilonB: 0.02,
  },
  supermassive_ultra_long: {
    id: "supermassive_ultra_long",
    name: "💥 Ultra-Long GRB (Blue Supergiant Collapse)",
    subtitle: "Extended Prompt Phase with Internal Shell Collisions",
    formula: "t_{dec} = \\left( \\frac{3 E_{iso}}{32 \\pi n_0 m_p c^5 \\Gamma_0^8} \\right)^{1/3}",
    desc: "Powered by the collapse of a blue supergiant, the prompt gamma-ray emission lasts for thousands of seconds as hundreds of internal relativistic plasma shells collide.",
    gamma0: 80,
    eIso: 50.0,
    n0: 5.0,
    thetaJet: 8.0,
    thetaObs: 3.0,
    epsilonE: 0.12,
    epsilonB: 0.01,
  },
};

export default function GammaRayBurstStudio() {
  // Theme & Preset States
  const [selectedTheme, setSelectedTheme] = useState("hypernovaViolet");
  const [selectedPreset, setSelectedPreset] = useState("grb221009a_boat");

  // Physics Parameters
  const [gamma0, setGamma0] = useState(400); // Initial Lorentz Factor
  const [eIso, setEIso] = useState(100); // Isotropic Equivalent Energy (x10^52 erg)
  const [n0, setN0] = useState(1.0); // Circumburst density (cm^-3)
  const [thetaJet, setThetaJet] = useState(1.5); // Jet half-opening angle (degrees)
  const [thetaObs, setThetaObs] = useState(0.5); // Observer angle (degrees)
  const [epsilonE, setEpsilonE] = useState(0.1); // Electron energy equipartition
  const [epsilonB, setEpsilonB] = useState(0.01); // Magnetic field equipartition

  // Simulation Controls & View States
  const [viewMode, setViewMode] = useState("relativityJet2D"); // relativityJet2D, beamingCones3D, spectrumSED
  const [isPaused, setIsPaused] = useState(false);
  const [simSpeed, setSimSpeed] = useState(1.0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showMagneticFields, setShowMagneticFields] = useState(true);
  const [showDopplerShift, setShowDopplerShift] = useState(true);
  const [activeTab, setActiveTab] = useState("simulation"); // simulation, telemetry, theory

  // 3D Canvas Interaction Drag Rotation
  const [rotX, setRotX] = useState(0.35);
  const [rotY, setRotY] = useState(0.45);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Dynamic Physics Simulation State Ref
  const simStateRef = useRef({
    time: 0,
    shells: [], // Internal plasma shells
    photons: [], // Emitted photons
    ismParticles: [], // Ambient interstellar gas particles
    shockRadius: 20,
    currentGamma: 400,
    flashPulses: [],
  });

  const [promptFlashesCount, setPromptFlashesCount] = useState(0);

  // Canvas Refs
  const canvasRef = useRef(null);
  const chartCanvasRef = useRef(null);
  const audioCtxRef = useRef(null);
  const audioGainRef = useRef(null);
  const humOscRef = useRef(null);

  const currentTheme = THEMES[selectedTheme] || THEMES.hypernovaViolet;
  const currentPreset = PRESETS[selectedPreset] || PRESETS.grb221009a_boat;

  // Apply Preset Handler
  const handleApplyPreset = (presetKey) => {
    const p = PRESETS[presetKey];
    if (!p) return;
    setSelectedPreset(presetKey);
    setGamma0(p.gamma0);
    setEIso(p.eIso);
    setN0(p.n0);
    setThetaJet(p.thetaJet);
    setThetaObs(p.thetaObs);
    setEpsilonE(p.epsilonE);
    setEpsilonB(p.epsilonB);
    simStateRef.current.time = 0;
    simStateRef.current.shockRadius = 20;
    simStateRef.current.currentGamma = p.gamma0;
  };

  // Launch a manual internal shell for prompt flash
  const launchInternalShell = useCallback(() => {
    const state = simStateRef.current;
    const fastGamma = gamma0 * (1.1 + Math.random() * 0.4);
    state.shells.push({
      id: Math.random(),
      radius: 12,
      gamma: fastGamma,
      speed: Math.sqrt(1 - 1 / (fastGamma * fastGamma)),
      intensity: 1.0,
      color: "#ffffff",
    });
  }, [gamma0]);

  // Audio Synthesizer Setup (Web Audio API)
  useEffect(() => {
    if (!soundEnabled) {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const gain = ctx.createGain();
      gain.gain.value = 0.05;

      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.value = 60 + (gamma0 / 800) * 120;

      // Filter for deep cosmic hum
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 400;

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      audioCtxRef.current = ctx;
      audioGainRef.current = gain;
      humOscRef.current = osc;
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }

    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, [soundEnabled, gamma0]);

  // Derived Physics Computations
  const beta0 = Math.sqrt(Math.max(0, 1 - 1 / (gamma0 * gamma0)));
  const thetaObsRad = (thetaObs * Math.PI) / 180;
  const thetaJetRad = (thetaJet * Math.PI) / 180;
  const dopplerFactor = 1 / (gamma0 * (1 - beta0 * Math.cos(thetaObsRad)));
  const vApparent = (beta0 * Math.sin(thetaObsRad)) / (1 - beta0 * Math.cos(thetaObsRad)); // in c units
  const beamingAngleDeg = ((1 / gamma0) * 180) / Math.PI;

  // Deceleration radius scaling (in cm / normalized canvas units)
  const rDecCm = Math.pow((3 * eIso * 1e52) / (4 * Math.PI * gamma0 * gamma0 * n0 * 1.67e-24 * 9e20), 1 / 3);
  const tDecSec = rDecCm / (2 * gamma0 * gamma0 * 3e10);
  const tJetDays = 6.2 * Math.pow((eIso / 100) / n0, 1 / 3) * Math.pow(thetaJetRad, 8 / 3);

  // Initialize ISM Particles
  useEffect(() => {
    const ism = [];
    for (let i = 0; i < 220; i++) {
      const angle = (Math.random() - 0.5) * Math.PI * 0.9;
      const dist = 60 + Math.random() * 320;
      ism.push({
        x: dist * Math.cos(angle),
        y: dist * Math.sin(angle),
        size: Math.random() * 2 + 1,
        density: Math.random(),
        swept: false,
      });
    }
    simStateRef.current.ismParticles = ism;
    simStateRef.current.shells = [];
    simStateRef.current.photons = [];
    simStateRef.current.flashPulses = [];
    simStateRef.current.shockRadius = 30;
  }, [selectedPreset]);

  // Main Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const state = simStateRef.current;

      if (!isPaused) {
        state.time += 0.02 * simSpeed;

        // Shockwave expansion & deceleration (Blandford-McKee scaling)
        const decFactor = 1 / (1 + Math.pow(state.shockRadius / 180, 2.5));
        state.currentGamma = Math.max(2, gamma0 * decFactor);
        state.shockRadius += (0.8 + (state.currentGamma / gamma0) * 1.2) * simSpeed;

        if (state.shockRadius > 340) {
          state.shockRadius = 30;
          state.shells = [];
        }

        // Spawn ambient prompt shells periodically
        if (Math.random() < 0.04 * simSpeed && state.shells.length < 6) {
          const shellGamma = gamma0 * (0.8 + Math.random() * 0.5);
          state.shells.push({
            id: Math.random(),
            radius: 15,
            gamma: shellGamma,
            speed: 0.9 + (shellGamma / gamma0) * 0.5,
            intensity: 1.0,
          });
        }

        // Update shells & check internal shock collisions
        for (let i = state.shells.length - 1; i >= 0; i--) {
          const s = state.shells[i];
          s.radius += s.speed * 2.5 * simSpeed;

          // Check shell collision
          for (let j = i - 1; j >= 0; j--) {
            const s2 = state.shells[j];
            if (Math.abs(s.radius - s2.radius) < 6) {
              // Collision! Internal Shock Flash
              state.flashPulses.push({
                x: s.radius,
                y: (Math.random() - 0.5) * 10,
                radius: 1,
                maxRadius: 35,
                alpha: 1.0,
              });
              setPromptFlashesCount((prev) => prev + 1);

              // Sound pulse
              if (audioCtxRef.current && audioGainRef.current) {
                try {
                  const pOsc = audioCtxRef.current.createOscillator();
                  const pGain = audioCtxRef.current.createGain();
                  pOsc.type = "sine";
                  pOsc.frequency.setValueAtTime(440 + Math.random() * 300, audioCtxRef.current.currentTime);
                  pGain.gain.setValueAtTime(0.08, audioCtxRef.current.currentTime);
                  pGain.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.15);
                  pOsc.connect(pGain);
                  pGain.connect(audioCtxRef.current.destination);
                  pOsc.start();
                  pOsc.stop(audioCtxRef.current.currentTime + 0.15);
                } catch (e) {}
              }

              // Emit relativistic photons
              for (let p = 0; p < 12; p++) {
                const pAngle = (Math.random() - 0.5) * thetaJetRad * 1.2;
                state.photons.push({
                  x: s.radius * Math.cos(pAngle),
                  y: s.radius * Math.sin(pAngle),
                  vx: Math.cos(pAngle) * (4 + Math.random() * 3),
                  vy: Math.sin(pAngle) * (4 + Math.random() * 3),
                  life: 1.0,
                  doppler: dopplerFactor,
                });
              }
              state.shells.splice(i, 1);
              break;
            }
          }

          if (s.radius > state.shockRadius) {
            state.shells.splice(i, 1);
          }
        }

        // Update flash pulses
        for (let f = state.flashPulses.length - 1; f >= 0; f--) {
          const pulse = state.flashPulses[f];
          pulse.radius += 2.0 * simSpeed;
          pulse.alpha -= 0.04 * simSpeed;
          if (pulse.alpha <= 0) {
            state.flashPulses.splice(f, 1);
          }
        }

        // Update Photons
        for (let p = state.photons.length - 1; p >= 0; p--) {
          const photon = state.photons[p];
          photon.x += photon.vx * simSpeed;
          photon.y += photon.vy * simSpeed;
          photon.life -= 0.015 * simSpeed;
          if (photon.life <= 0) {
            state.photons.splice(p, 1);
          }
        }
      }

      // Clear Canvas
      ctx.fillStyle = currentTheme.canvasBg;
      ctx.fillRect(0, 0, width, height);

      // Grid background
      ctx.strokeStyle = currentTheme.gridColor;
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

      // ----------------------------------------------------
      // VIEW MODE 1: 2D RELATIVISTIC JET CROSS-SECTION & SHOCK
      // ----------------------------------------------------
      if (viewMode === "relativityJet2D") {
        ctx.save();
        ctx.translate(centerX - 100, centerY);

        // Draw ISM Particles
        for (let ism of state.ismParticles) {
          const dist = Math.hypot(ism.x, ism.y);
          const isSwept = dist < state.shockRadius;

          ctx.fillStyle = isSwept ? currentTheme.shockColor : currentTheme.ismColor;
          ctx.beginPath();
          ctx.arc(ism.x, ism.y, ism.size * (isSwept ? 1.5 : 1), 0, Math.PI * 2);
          ctx.fill();

          if (isSwept && Math.random() < 0.1) {
            ctx.strokeStyle = currentTheme.shockColor;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(ism.x, ism.y);
            ctx.lineTo(ism.x + (Math.random() - 0.5) * 8, ism.y + (Math.random() - 0.5) * 8);
            ctx.stroke();
          }
        }

        // Draw Bipolar Relativistic Jet Cone Boundaries
        const jetLen = 300;
        const halfSpread = Math.tan(thetaJetRad) * jetLen;

        // Forward Jet Cone Glow
        const jetGrad = ctx.createRadialGradient(0, 0, 10, jetLen, 0, jetLen);
        jetGrad.addColorStop(0, currentTheme.engineColor);
        jetGrad.addColorStop(0.4, currentTheme.jetColor);
        jetGrad.addColorStop(1, "rgba(0,0,0,0)");

        ctx.fillStyle = jetGrad;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(jetLen, -halfSpread);
        ctx.lineTo(jetLen, halfSpread);
        ctx.closePath();
        ctx.fill();

        // Backward Jet Cone (bipolar)
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-jetLen, -halfSpread);
        ctx.lineTo(-jetLen, halfSpread);
        ctx.closePath();
        ctx.fill();

        // Magnetic Field Helical Lines
        if (showMagneticFields) {
          ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          for (let r = 30; r < jetLen; r += 45) {
            const currentSpread = Math.tan(thetaJetRad) * r;
            ctx.beginPath();
            ctx.ellipse(r, 0, 8, currentSpread, 0, 0, Math.PI * 2);
            ctx.stroke();
          }
          ctx.setLineDash([]);
        }

        // Forward External Shock Front Arc
        const shockRadius = state.shockRadius;
        const shockSpread = Math.tan(thetaJetRad) * shockRadius * 1.15;
        ctx.strokeStyle = currentTheme.shockColor;
        ctx.lineWidth = 3;
        ctx.shadowColor = currentTheme.shockColor;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(0, 0, shockRadius, -thetaJetRad * 1.3, thetaJetRad * 1.3);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Internal Plasma Shells
        for (let s of state.shells) {
          const sSpread = Math.tan(thetaJetRad) * s.radius;
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, s.radius, -thetaJetRad * 0.9, thetaJetRad * 0.9);
          ctx.stroke();
        }

        // Internal Flash Pulses
        for (let pulse of state.flashPulses) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${pulse.alpha})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(pulse.x, pulse.y, pulse.radius, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Photons Emission & Relativistic Doppler Shift Color
        for (let p of state.photons) {
          const color = showDopplerShift
            ? dopplerFactor > 1.5
              ? currentTheme.photonBlueshift
              : currentTheme.photonRedshift
            : "#ffffff";
          ctx.fillStyle = color;
          ctx.shadowColor = color;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.shadowBlur = 0;

        // Central Compact Object (Black Hole Accretion Disk / Magnetar)
        const engineGlow = ctx.createRadialGradient(0, 0, 2, 0, 0, 22);
        engineGlow.addColorStop(0, "#ffffff");
        engineGlow.addColorStop(0.3, currentTheme.engineColor);
        engineGlow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = engineGlow;
        ctx.beginPath();
        ctx.arc(0, 0, 22, 0, Math.PI * 2);
        ctx.fill();

        // Core Singularity Ring
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.stroke();

        // Observer Line of Sight Vector (Interactive Drag Line)
        const obsLen = 280;
        const obsX = Math.cos(thetaObsRad) * obsLen;
        const obsY = Math.sin(thetaObsRad) * obsLen;

        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 3]);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(obsX, obsY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Observer Eye Icon at end of vector
        ctx.fillStyle = "#38bdf8";
        ctx.beginPath();
        ctx.arc(obsX, obsY, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#090d16";
        ctx.beginPath();
        ctx.arc(obsX, obsY, 3, 0, Math.PI * 2);
        ctx.fill();

        // Label for Observer
        ctx.fillStyle = "#7dd3fc";
        ctx.font = "11px sans-serif";
        ctx.fillText(`Observer (θ_obs = ${thetaObs.toFixed(1)}°)`, obsX + 12, obsY + 4);

        // Relativistic Beaming Cone Indicator (1 / Gamma)
        const beamingAngleRad = 1 / state.currentGamma;
        ctx.strokeStyle = "rgba(251, 191, 36, 0.6)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(beamingAngleRad) * 200, Math.sin(beamingAngleRad) * 200);
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(-beamingAngleRad) * 200, Math.sin(-beamingAngleRad) * 200);
        ctx.stroke();

        ctx.fillStyle = "rgba(251, 191, 36, 0.8)";
        ctx.font = "10px sans-serif";
        ctx.fillText(`Relativistic Beaming 1/Γ = ${(beamingAngleDeg).toFixed(2)}°`, 110, -Math.tan(beamingAngleRad) * 110 - 8);

        ctx.restore();
      }

      // ----------------------------------------------------
      // VIEW MODE 2: 3D DOPPLER BEAMING & RELATIVISTIC GEOMETRY
      // ----------------------------------------------------
      else if (viewMode === "beamingCones3D") {
        ctx.save();
        ctx.translate(centerX, centerY);

        const cosX = Math.cos(rotX);
        const sinX = Math.sin(rotX);
        const cosY = Math.cos(rotY);
        const sinY = Math.sin(rotY);

        // 3D Projection Helper Function
        const project3D = (x, y, z) => {
          const x1 = x * cosY - z * sinY;
          const z1 = x * sinY + z * cosY;
          const y1 = y * cosX - z1 * sinX;
          const z2 = y * sinX + z1 * cosX;
          const scale = 320 / (320 + z2);
          return { px: x1 * scale, py: y1 * scale, scale };
        };

        // Draw 3D Coordinate Grid Circles
        ctx.strokeStyle = currentTheme.gridColor;
        ctx.lineWidth = 1;
        for (let r = 50; r <= 200; r += 50) {
          ctx.beginPath();
          for (let a = 0; a <= Math.PI * 2; a += 0.1) {
            const pt = project3D(Math.cos(a) * r, 0, Math.sin(a) * r);
            if (a === 0) ctx.moveTo(pt.px, pt.py);
            else ctx.lineTo(pt.px, pt.py);
          }
          ctx.closePath();
          ctx.stroke();
        }

        // Draw 3D Conical Jet Mesh
        const numRings = 8;
        const length = 220;
        for (let i = 1; i <= numRings; i++) {
          const z = (i / numRings) * length;
          const r = Math.tan(thetaJetRad) * z;
          ctx.strokeStyle = i === numRings ? currentTheme.shockColor : currentTheme.jetColor;
          ctx.lineWidth = i === numRings ? 2 : 1;
          ctx.beginPath();
          for (let a = 0; a <= Math.PI * 2; a += 0.2) {
            const pt = project3D(r * Math.cos(a), r * Math.sin(a), z - 100);
            if (a === 0) ctx.moveTo(pt.px, pt.py);
            else ctx.lineTo(pt.px, pt.py);
          }
          ctx.closePath();
          ctx.stroke();
        }

        // Draw 3D Jet Axis Line
        const startPt = project3D(0, 0, -100);
        const endPt = project3D(0, 0, length - 100);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(startPt.px, startPt.py);
        ctx.lineTo(endPt.px, endPt.py);
        ctx.stroke();

        // Draw Observer Vector in 3D
        const obsZ = Math.cos(thetaObsRad) * length;
        const obsY = Math.sin(thetaObsRad) * length;
        const obsPt = project3D(0, obsY, obsZ - 100);

        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(startPt.px, startPt.py);
        ctx.lineTo(obsPt.px, obsPt.py);
        ctx.stroke();

        ctx.fillStyle = "#38bdf8";
        ctx.beginPath();
        ctx.arc(obsPt.px, obsPt.py, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#7dd3fc";
        ctx.font = "12px sans-serif";
        ctx.fillText(`Observer Vector (θ_obs = ${thetaObs.toFixed(1)}°)`, obsPt.px + 10, obsPt.py + 4);

        ctx.restore();
      }

      // ----------------------------------------------------
      // VIEW MODE 3: SYNCHROTRON SED SPECTRUM & LIGHT CURVES
      // ----------------------------------------------------
      else if (viewMode === "spectrumSED") {
        ctx.save();
        const padding = 55;
        const graphW = width - padding * 2;
        const graphH = height / 2 - padding - 10;

        // TOP GRAPH: Afterglow Light Curve (log F vs log t)
        ctx.fillStyle = "#0b1329";
        ctx.fillRect(padding, padding, graphW, graphH);
        ctx.strokeStyle = currentTheme.border;
        ctx.strokeRect(padding, padding, graphW, graphH);

        ctx.fillStyle = "#e2e8f0";
        ctx.font = "12px sans-serif";
        ctx.fillText("📊 Afterglow Multi-Band Light Curve (log Flux F_ν vs log Time t)", padding, padding - 12);

        // Draw Axes & Grid
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
        ctx.lineWidth = 1;
        for (let gx = 0; gx <= 5; gx++) {
          const x = padding + (gx / 5) * graphW;
          ctx.beginPath();
          ctx.moveTo(x, padding);
          ctx.lineTo(x, padding + graphH);
          ctx.stroke();
        }

        // Plot Light Curve Break Lines (Deceleration t_dec & Jet Break t_jet)
        const tDecX = padding + 0.3 * graphW;
        const tJetX = padding + 0.7 * graphW;

        ctx.strokeStyle = "#f43f5e";
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(tDecX, padding);
        ctx.lineTo(tDecX, padding + graphH);
        ctx.stroke();
        ctx.fillStyle = "#f43f5e";
        ctx.fillText("t_dec (Deceleration)", tDecX - 45, padding + 15);

        ctx.strokeStyle = "#fbbf24";
        ctx.beginPath();
        ctx.moveTo(tJetX, padding);
        ctx.lineTo(tJetX, padding + graphH);
        ctx.stroke();
        ctx.fillStyle = "#fbbf24";
        ctx.fillText("t_jet (Jet Break)", tJetX - 35, padding + 30);
        ctx.setLineDash([]);

        // Multi-Band Light Curve Paths
        const drawLC = (color, label, offset, power) => {
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          for (let x = 0; x <= graphW; x += 4) {
            const t = (x / graphW) * 4;
            let logF;
            if (x < 0.3 * graphW) {
              logF = offset + t * 1.5; // Rise phase
            } else if (x < 0.7 * graphW) {
              logF = offset + 0.45 - (t - 1.2) * power; // Pre-jet break decay
            } else {
              logF = offset + 0.45 - (0.7 * 4 - 1.2) * power - (t - 2.8) * (power + 1.2); // Post-jet break steep decay
            }
            const canvasY = padding + graphH - (logF / 3) * graphH;
            if (x === 0) ctx.moveTo(padding + x, canvasY);
            else ctx.lineTo(padding + x, canvasY);
          }
          ctx.stroke();
          ctx.fillStyle = color;
          ctx.fillText(label, padding + graphW - 75, padding + offset * 20 + 20);
        };

        drawLC("#c084fc", "Gamma-Ray (Prompt)", 0.6, 2.2);
        drawLC("#38bdf8", "X-Ray Afterglow", 1.2, 1.1);
        drawLC("#34d399", "Optical R-Band", 1.8, 0.95);
        drawLC("#fbbf24", "Radio 8.5 GHz", 2.2, 0.6);

        // BOTTOM GRAPH: Synchrotron Spectral Energy Distribution (SED)
        const bottomY = height / 2 + 25;
        ctx.fillStyle = "#0b1329";
        ctx.fillRect(padding, bottomY, graphW, graphH);
        ctx.strokeStyle = currentTheme.border;
        ctx.strokeRect(padding, bottomY, graphW, graphH);

        ctx.fillStyle = "#e2e8f0";
        ctx.fillText("⚛️ Synchrotron Spectral Energy Distribution (log νF_ν vs log Frequency ν)", padding, bottomY - 10);

        // SED Spectrum Curve (Broken Power Law: Self-Absorption ν_a, Minimum ν_m, Cooling ν_c)
        ctx.strokeStyle = currentTheme.engineColor;
        ctx.lineWidth = 2.5;
        ctx.beginPath();

        const nuA = padding + 0.2 * graphW;
        const nuM = padding + 0.5 * graphW;
        const nuC = padding + 0.8 * graphW;

        for (let x = 0; x <= graphW; x += 4) {
          const absX = padding + x;
          let yVal;
          if (absX < nuA) {
            yVal = 30 + (x / (nuA - padding)) * 40; // Self-absorption slope ν^2
          } else if (absX < nuM) {
            yVal = 70 + ((absX - nuA) / (nuM - nuA)) * 50; // ν^1/3 slope
          } else if (absX < nuC) {
            yVal = 120 - ((absX - nuM) / (nuC - nuM)) * 35; // ν^(1-p)/2 slope
          } else {
            yVal = 85 - ((absX - nuC) / (padding + graphW - nuC)) * 55; // ν^-p/2 cooling slope
          }
          const cY = bottomY + graphH - yVal;
          if (x === 0) ctx.moveTo(absX, cY);
          else ctx.lineTo(absX, cY);
        }
        ctx.stroke();

        // Break Frequency Labels
        const drawBreakLabel = (posX, label, color) => {
          ctx.strokeStyle = color;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(posX, bottomY);
          ctx.lineTo(posX, bottomY + graphH);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = color;
          ctx.fillText(label, posX - 15, bottomY + graphH + 15);
        };

        drawBreakLabel(nuA, "ν_a (Abs)", "#a7f3d0");
        drawBreakLabel(nuM, "ν_m (Min)", "#38bdf8");
        drawBreakLabel(nuC, "ν_c (Cool)", "#f43f5e");

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [
    selectedTheme,
    viewMode,
    isPaused,
    simSpeed,
    gamma0,
    thetaJet,
    thetaObs,
    dopplerFactor,
    showMagneticFields,
    showDopplerShift,
    rotX,
    rotY,
    currentTheme,
    thetaJetRad,
    thetaObsRad,
    beamingAngleDeg,
  ]);

  // Drag controls for 3D view
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

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 my-8 font-sans">
      {/* Header Container */}
      <div className={`p-6 rounded-2xl ${currentTheme.cardBg} border ${currentTheme.border} shadow-2xl mb-6 relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-500/10 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${currentTheme.badge}`}>
                Relativistic Astrophysics Studio
              </span>
              <span className="bg-slate-800/80 text-slate-300 text-xs px-2.5 py-1 rounded-full border border-slate-700">
                Lorentz Factor Γ ≈ 100 – 1000
              </span>
              <span className="bg-slate-800/80 text-slate-300 text-xs px-2.5 py-1 rounded-full border border-slate-700">
                Synchrotron SED & Doppler Beaming
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              💥 Gamma-Ray Burst (GRB) Fireball & Afterglow Studio
            </h1>
            <p className="text-slate-300 text-sm sm:text-base mt-1 max-w-3xl">
              Simulate ultra-relativistic cosmic jets, internal shell collision gamma-flashes, deceleration blast waves, Doppler beaming, and multi-wavelength synchrotron spectra.
            </p>
          </div>

          {/* Theme Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Theme:</span>
            <select
              value={selectedTheme}
              onChange={(e) => setSelectedTheme(e.target.value)}
              className="bg-slate-800 text-slate-200 text-xs sm:text-sm px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {Object.values(THEMES).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab("simulation")}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "simulation"
                ? `${currentTheme.buttonBg}`
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            🚀 Interactive Simulation & Canvas
          </button>
          <button
            onClick={() => setActiveTab("telemetry")}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "telemetry"
                ? `${currentTheme.buttonBg}`
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            📊 Kinematics & Microphysics Telemetry
          </button>
          <button
            onClick={() => setActiveTab("theory")}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "theory"
                ? `${currentTheme.buttonBg}`
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            📖 Astrophysics Deep Dive & Math Formulas
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: SIMULATION & CONTROLS */}
      {/* ============================================================== */}
      {activeTab === "simulation" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Simulation Viewport (2 Cols on lg) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Presets Grid */}
            <div className={`p-4 rounded-xl ${currentTheme.cardBg} border ${currentTheme.border}`}>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                ⚡ Astrophysical Phenomenon Presets
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {Object.values(PRESETS).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleApplyPreset(p.id)}
                    className={`text-left p-2.5 rounded-lg border transition-all ${
                      selectedPreset === p.id
                        ? `${currentTheme.badge} border-opacity-100 bg-slate-800/90`
                        : "border-slate-800 bg-slate-900/50 hover:bg-slate-800/50 text-slate-300"
                    }`}
                  >
                    <div className="font-bold text-xs text-white truncate">{p.name}</div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">{p.subtitle}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Canvas Container */}
            <div
              className={`relative rounded-2xl overflow-hidden border ${currentTheme.border} ${currentTheme.cardBg} shadow-2xl`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Canvas Toolbar Controls */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-auto bg-slate-900/80 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-800">
                {/* View Mode Selector */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setViewMode("relativityJet2D")}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                      viewMode === "relativityJet2D" ? `${currentTheme.buttonBg}` : "text-slate-400 hover:text-white"
                    }`}
                  >
                    🌌 2D Jet & Shock
                  </button>
                  <button
                    onClick={() => setViewMode("beamingCones3D")}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                      viewMode === "beamingCones3D" ? `${currentTheme.buttonBg}` : "text-slate-400 hover:text-white"
                    }`}
                  >
                    🌀 3D Beaming Geometry
                  </button>
                  <button
                    onClick={() => setViewMode("spectrumSED")}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                      viewMode === "spectrumSED" ? `${currentTheme.buttonBg}` : "text-slate-400 hover:text-white"
                    }`}
                  >
                    📊 Synchrotron SED & LC
                  </button>
                </div>

                {/* Simulation Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={launchInternalShell}
                    className="px-2.5 py-1 bg-purple-600/80 hover:bg-purple-500 text-white rounded-md text-xs font-bold transition-all shadow"
                  >
                    💥 Fire Internal Shell
                  </button>
                  <button
                    onClick={() => setIsPaused(!isPaused)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-xs font-medium transition-all"
                  >
                    {isPaused ? "▶ Play" : "⏸ Pause"}
                  </button>
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                      soundEnabled ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {soundEnabled ? "🔊 Sound ON" : "🔇 Sound OFF"}
                  </button>
                </div>
              </div>

              {/* Main HTML5 Canvas */}
              <canvas
                ref={canvasRef}
                width={820}
                height={500}
                className="w-full h-[480px] block cursor-grab active:cursor-grabbing"
              />

              {/* Overlay Telemetry HUD */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20 text-[11px] text-slate-300 bg-slate-950/75 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800/80">
                <div>
                  <span className="text-slate-500 mr-1">Lorentz Factor Γ:</span>
                  <span className="font-mono text-purple-300 font-bold">{gamma0}</span>
                </div>
                <div>
                  <span className="text-slate-500 mr-1">Doppler Boost δ_D:</span>
                  <span className="font-mono text-cyan-300 font-bold">{dopplerFactor.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-slate-500 mr-1">Apparent Velocity v_app:</span>
                  <span className="font-mono text-amber-300 font-bold">{vApparent.toFixed(2)} c</span>
                </div>
                <div>
                  <span className="text-slate-500 mr-1">Prompt Flashes:</span>
                  <span className="font-mono text-rose-300 font-bold">{promptFlashesCount}</span>
                </div>
              </div>
            </div>

            {/* Preset Physics Description Banner */}
            <div className={`p-4 rounded-xl ${currentTheme.cardBg} border ${currentTheme.border}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-white">{currentPreset.name}</span>
                <span className={`text-[11px] font-mono ${currentTheme.accentText}`}>
                  {currentPreset.formula}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{currentPreset.desc}</p>
            </div>
          </div>

          {/* Interactive Parameters Controls Sidebar (1 Col) */}
          <div className="flex flex-col gap-4">
            <div className={`p-5 rounded-2xl ${currentTheme.cardBg} border ${currentTheme.border} shadow-xl`}>
              <h3 className="text-base font-bold text-white mb-4 flex items-center justify-between">
                <span>⚙️ Jet & Relativistic Controls</span>
                <span className="text-xs text-slate-400 font-normal">Real-Time Scaling</span>
              </h3>

              <div className="flex flex-col gap-4">
                {/* Lorentz Factor Gamma_0 */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-300">Initial Lorentz Factor (Γ_0)</span>
                    <span className="text-purple-400 font-mono">{gamma0}</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="800"
                    step="10"
                    value={gamma0}
                    onChange={(e) => setGamma0(parseFloat(e.target.value))}
                    className="w-full accent-purple-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Relativistic speed β = {(beta0 * 100).toFixed(4)}% c
                  </span>
                </div>

                {/* Isotropic Energy E_iso */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-300">Isotropic Energy E_iso</span>
                    <span className="text-amber-400 font-mono">{eIso} × 10^52 erg</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="200"
                    step="0.5"
                    value={eIso}
                    onChange={(e) => setEIso(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Jet Half-Opening Angle theta_jet */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-300">Jet Opening Angle (θ_jet)</span>
                    <span className="text-cyan-400 font-mono">{thetaJet.toFixed(1)}°</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="15.0"
                    step="0.1"
                    value={thetaJet}
                    onChange={(e) => setThetaJet(parseFloat(e.target.value))}
                    className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Observer Viewing Angle theta_obs */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-300">Observer Angle (θ_obs)</span>
                    <span className="text-emerald-400 font-mono">{thetaObs.toFixed(1)}°</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="30.0"
                    step="0.5"
                    value={thetaObs}
                    onChange={(e) => setThetaObs(parseFloat(e.target.value))}
                    className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Off-axis angle ratio θ_obs / θ_jet = {(thetaObs / thetaJet).toFixed(2)}
                  </span>
                </div>

                {/* Circumburst Density n_0 */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-300">Circumburst Density (n_0)</span>
                    <span className="text-rose-400 font-mono">{n0.toFixed(3)} cm^-3</span>
                  </div>
                  <input
                    type="range"
                    min="0.001"
                    max="50.0"
                    step="0.1"
                    value={n0}
                    onChange={(e) => setN0(parseFloat(e.target.value))}
                    className="w-full accent-rose-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Microphysics Parameters */}
                <div className="pt-2 border-t border-slate-800 flex flex-col gap-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    ⚛️ Shock Microphysics
                  </span>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Electron Energy Fraction (ε_e)</span>
                      <span className="font-mono text-purple-300">{epsilonE.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.01"
                      max="0.5"
                      step="0.01"
                      value={epsilonE}
                      onChange={(e) => setEpsilonE(parseFloat(e.target.value))}
                      className="w-full accent-purple-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Magnetic Field Fraction (ε_B)</span>
                      <span className="font-mono text-purple-300">{epsilonB.toFixed(3)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.0001"
                      max="0.2"
                      step="0.001"
                      value={epsilonB}
                      onChange={(e) => setEpsilonB(parseFloat(e.target.value))}
                      className="w-full accent-purple-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* Simulation Speed & Toggles */}
                <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">Helical B-Field Lines:</span>
                    <button
                      onClick={() => setShowMagneticFields(!showMagneticFields)}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                        showMagneticFields ? "bg-purple-600 text-white" : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {showMagneticFields ? "Visible" : "Hidden"}
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">Doppler Color Shift:</span>
                    <button
                      onClick={() => setShowDopplerShift(!showDopplerShift)}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                        showDopplerShift ? "bg-cyan-600 text-white" : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {showDopplerShift ? "Enabled" : "Disabled"}
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">Simulation Speed:</span>
                    <div className="flex items-center gap-1">
                      {[0.5, 1.0, 2.0].map((s) => (
                        <button
                          key={s}
                          onClick={() => setSimSpeed(s)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            simSpeed === s ? `${currentTheme.buttonBg}` : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {s}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: KINEMATICS & TELEMETRY */}
      {/* ============================================================== */}
      {activeTab === "telemetry" && (
        <div className="flex flex-col gap-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-xl ${currentTheme.cardBg} border ${currentTheme.border}`}>
              <div className="text-xs text-slate-400 font-semibold mb-1">Doppler Boost Factor (δ_D)</div>
              <div className="text-2xl font-extrabold font-mono text-cyan-400">
                {dopplerFactor.toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Flux multiplication: δ_D^3 = {(Math.pow(dopplerFactor, 3)).toFixed(1)}x
              </div>
            </div>

            <div className={`p-4 rounded-xl ${currentTheme.cardBg} border ${currentTheme.border}`}>
              <div className="text-xs text-slate-400 font-semibold mb-1">Apparent Velocity (v_app / c)</div>
              <div className="text-2xl font-extrabold font-mono text-amber-400">
                {vApparent.toFixed(2)} c
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                {vApparent > 1.0 ? "⚡ Superluminal Motion Detected" : "Subluminal Transverse View"}
              </div>
            </div>

            <div className={`p-4 rounded-xl ${currentTheme.cardBg} border ${currentTheme.border}`}>
              <div className="text-xs text-slate-400 font-semibold mb-1">Deceleration Time (t_dec)</div>
              <div className="text-2xl font-extrabold font-mono text-purple-400">
                {tDecSec.toFixed(2)} s
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Observer frame deceleration onset
              </div>
            </div>

            <div className={`p-4 rounded-xl ${currentTheme.cardBg} border ${currentTheme.border}`}>
              <div className="text-xs text-slate-400 font-semibold mb-1">Jet Break Time (t_jet)</div>
              <div className="text-2xl font-extrabold font-mono text-emerald-400">
                {tJetDays.toFixed(2)} days
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Light curve steepening transition
              </div>
            </div>
          </div>

          {/* Microphysics & Energy Partition Table */}
          <div className={`p-6 rounded-2xl ${currentTheme.cardBg} border ${currentTheme.border}`}>
            <h3 className="text-lg font-bold text-white mb-4">
              ⚛️ Relativistic Blast Wave & Microphysics Telemetry
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-800">
                  <span className="text-sm text-slate-300">Initial Relativistic Speed (β_0)</span>
                  <span className="text-sm font-mono text-white font-bold">{(beta0 * 100).toFixed(6)}% c</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-800">
                  <span className="text-sm text-slate-300">Relativistic Beaming Angle (1/Γ_0)</span>
                  <span className="text-sm font-mono text-purple-300 font-bold">{beamingAngleDeg.toFixed(3)}°</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-800">
                  <span className="text-sm text-slate-300">Deceleration Radius (R_dec)</span>
                  <span className="text-sm font-mono text-amber-300 font-bold">{(rDecCm / 3.086e18).toFixed(4)} pc</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-800">
                  <span className="text-sm text-slate-300">Off-Axis Angle Ratio (θ_obs / θ_jet)</span>
                  <span className="text-sm font-mono text-cyan-300 font-bold">{(thetaObs / thetaJet).toFixed(2)}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-800">
                  <span className="text-sm text-slate-300">Electron Energy Fraction (ε_e)</span>
                  <span className="text-sm font-mono text-emerald-300 font-bold">{(epsilonE * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-800">
                  <span className="text-sm text-slate-300">Magnetic Field Fraction (ε_B)</span>
                  <span className="text-sm font-mono text-emerald-300 font-bold">{(epsilonB * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-800">
                  <span className="text-sm text-slate-300">Total Kinetic Energy (E_k,iso)</span>
                  <span className="text-sm font-mono text-rose-300 font-bold">{eIso} × 10^52 erg</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-800">
                  <span className="text-sm text-slate-300">Circumburst Number Density (n_0)</span>
                  <span className="text-sm font-mono text-white font-bold">{n0} particles / cm³</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: ASTROPHYSICS DEEP DIVE & THEORY */}
      {/* ============================================================== */}
      {activeTab === "theory" && (
        <div className={`p-6 rounded-2xl ${currentTheme.cardBg} border ${currentTheme.border} space-y-6 text-slate-300`}>
          <div>
            <h2 className="text-xl font-bold text-white mb-2">
              📖 The Fireball Model of Gamma-Ray Bursts
            </h2>
            <p className="text-sm leading-relaxed">
              Gamma-Ray Bursts (GRBs) represent the most energetic explosive events in the cosmos since the Big Bang. According to the standard <strong>Fireball Model</strong>, a central compact object (a newly born Kerr black hole with an accretion disk or a millisecond magnetar) releases ~10^51 – 10^54 ergs of gravitational binding energy within a few seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <h3 className="text-base font-bold text-purple-300">1. Internal Shocks (Prompt Phase)</h3>
              <p className="text-xs leading-relaxed">
                The central engine is unsteady, ejecting multiple plasma shells with varying Lorentz factors (Γ). Fast shells catch up to slower shells at radius R_i ~ 2 Γ² c Δt. Inelastic shell collisions generate internal shock waves that accelerate relativistic electrons via Fermi I mechanisms, emitting prompt high-energy Gamma-ray photons.
              </p>
              <div className="p-2 bg-slate-900 rounded font-mono text-[11px] text-purple-400">
                R_i ≈ 2 \Gamma^2 c \Delta t \sim 10^{13} \text{ cm}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <h3 className="text-base font-bold text-amber-300">2. External Shocks (Afterglow Phase)</h3>
              <p className="text-xs leading-relaxed">
                As the relativistic jet expands into the surrounding interstellar medium (ISM) or stellar wind, it sweeps up ambient gas. At the deceleration radius R_dec, the swept-up mass equals M_0 / Γ_0, initiating a Blandford-McKee self-similar relativistic blast wave. Forward and reverse shocks accelerate electrons, generating long-lived synchrotron afterglow from X-rays to radio.
              </p>
              <div className="p-2 bg-slate-900 rounded font-mono text-[11px] text-amber-400">
                \Gamma(R) \propto R^{-3/2} \quad (\text{ISM Constant Density})
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <h3 className="text-base font-bold text-cyan-300">3. Relativistic Beaming & Jet Breaks</h3>
              <p className="text-xs leading-relaxed">
                Due to special relativity, radiation from material moving with Lorentz factor Γ is beamed forward into a narrow cone of opening angle θ_beam ≈ 1/Γ. As the jet decelerates, 1/Γ increases. When 1/Γ(t) ~ θ_jet, the observer sees the entire physical edge of the jet, causing a sharp steepening in the light curve known as the <strong>Jet Break</strong>.
              </p>
              <div className="p-2 bg-slate-900 rounded font-mono text-[11px] text-cyan-400">
                \theta_{beam} \approx \frac{1}{\Gamma} \quad \implies \quad F_\nu \propto t^{-p}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <h3 className="text-base font-bold text-emerald-300">4. Doppler Boosting & Superluminal Motion</h3>
              <p className="text-xs leading-relaxed">
                For an observer at viewing angle θ_obs relative to the jet axis, radiation is Doppler boosted by the factor δ_D = [Γ (1 - β cos θ_obs)]^-1. When θ_obs ~ 1/Γ, the apparent transverse velocity v_app can exceed the speed of light c (superluminal motion), as observed in multi-messenger merger events like GW170817.
              </p>
              <div className="p-2 bg-slate-900 rounded font-mono text-[11px] text-emerald-400">
                \beta_{app} = \frac{\beta \sin \theta_{obs}}{1 - \beta \cos \theta_{obs}} &gt; 1
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
