import React, { useState, useEffect, useRef, useCallback } from "react";

// Visual Themes & Color Tokens
const THEMES = {
  hadronCyan: {
    id: "hadronCyan",
    name: "CERN Hadron Blue",
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    accentText: "text-cyan-400",
    border: "border-cyan-500/30",
    cardBg: "bg-slate-900/85 backdrop-blur-md border-cyan-500/20",
    buttonBg: "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25",
    canvasBg: "#030a16",
    beamAColor: "#00f0ff",
    beamBColor: "#3b82f6",
    ringColor: "rgba(6, 182, 212, 0.25)",
    magnetColor: "#0284c7",
    rfColor: "#38bdf8",
    showerColors: ["#00f0ff", "#38bdf8", "#818cf8", "#c084fc", "#f43f5e", "#fbbf24"],
  },
  quarkCrimson: {
    id: "quarkCrimson",
    name: "Quark-Gluon Crimson",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    accentText: "text-amber-400",
    border: "border-amber-500/30",
    cardBg: "bg-slate-900/85 backdrop-blur-md border-amber-500/20",
    buttonBg: "bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white shadow-lg shadow-amber-500/25",
    canvasBg: "#140604",
    beamAColor: "#fb923c",
    beamBColor: "#f43f5e",
    ringColor: "rgba(245, 158, 11, 0.25)",
    magnetColor: "#ea580c",
    rfColor: "#f59e0b",
    showerColors: ["#f59e0b", "#fb923c", "#f43f5e", "#e11d48", "#fde047", "#ffffff"],
  },
  antimatterViolet: {
    id: "antimatterViolet",
    name: "Antimatter Violet",
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    accentText: "text-purple-400",
    border: "border-purple-500/30",
    cardBg: "bg-slate-900/85 backdrop-blur-md border-purple-500/20",
    buttonBg: "bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white shadow-lg shadow-purple-500/25",
    canvasBg: "#0a0414",
    beamAColor: "#c084fc",
    beamBColor: "#f0abfc",
    ringColor: "rgba(168, 85, 247, 0.25)",
    magnetColor: "#9333ea",
    rfColor: "#e879f9",
    showerColors: ["#c084fc", "#e879f9", "#f0abfc", "#38bdf8", "#a855f7", "#ffffff"],
  },
  synchrotronEmerald: {
    id: "synchrotronEmerald",
    name: "Synchrotron Emerald",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    accentText: "text-emerald-400",
    border: "border-emerald-500/30",
    cardBg: "bg-slate-900/85 backdrop-blur-md border-emerald-500/20",
    buttonBg: "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25",
    canvasBg: "#02120b",
    beamAColor: "#10b981",
    beamBColor: "#34d399",
    ringColor: "rgba(16, 185, 129, 0.25)",
    magnetColor: "#059669",
    rfColor: "#6ee7b7",
    showerColors: ["#10b981", "#34d399", "#a3e635", "#fde047", "#06b6d4", "#ffffff"],
  },
};

// Physics Presets
const PRESETS = {
  lhcHiggs: {
    id: "lhcHiggs",
    name: "LHC 13.6 TeV Higgs Collider",
    formula: "p + p → H⁰ + X | √s = 13.6 TeV | B = 8.33 T",
    desc: "Dual counter-rotating proton beams in 27km ring colliding at high luminosity interaction point.",
    beamEnergy: 6.8, // TeV per beam
    magneticField: 8.33, // Tesla
    bunchDensity: 11.5, // 10^10 protons per bunch
    rfFrequency: 400, // MHz
    quadGradient: 220, // T/m
    viewMode: "ring",
  },
  quarkPlasma: {
    id: "quarkPlasma",
    name: "RHIC Heavy-Ion Quark-Gluon Soup",
    formula: "²⁰⁸Pb + ²⁰⁸Pb → Deconfined QGP | T > 4 Trillion K",
    desc: "Ultra-relativistic heavy gold/lead ion collisions melting nucleons into primordial quark-gluon plasma.",
    beamEnergy: 10.0,
    magneticField: 11.5,
    bunchDensity: 18.0,
    rfFrequency: 500,
    quadGradient: 280,
    viewMode: "detector",
  },
  synchrotronXRay: {
    id: "synchrotronXRay",
    name: "3rd Gen Synchrotron Light Source",
    formula: "e⁻ Circular Orbit → Relativistic X-Ray Laser Beams",
    desc: "High-frequency electron storage ring emitting coherent hard X-ray photon beams from undulators.",
    beamEnergy: 3.5,
    magneticField: 5.0,
    bunchDensity: 7.2,
    rfFrequency: 350,
    quadGradient: 160,
    viewMode: "synchrotron",
  },
  antimatterFactory: {
    id: "antimatterFactory",
    name: "CERN AD Antimatter Annihilator",
    formula: "p + target → p̄ (Antiprotons) + e⁺ Annihilation",
    desc: "High-energy proton target impact producing antiprotons trapped and decelerated for quantum testing.",
    beamEnergy: 8.5,
    magneticField: 14.0,
    bunchDensity: 15.0,
    rfFrequency: 450,
    quadGradient: 310,
    viewMode: "detector",
  },
  superluminalRegime: {
    id: "superluminalRegime",
    name: "Ultra-High Energy Cosmic Ray Limit",
    formula: "γ ≥ 15,000 | GZK Limit Energy Testing Regime",
    desc: "Extreme magnetic focusing driving extreme Lorentz dilation (99.9999999% speed of light).",
    beamEnergy: 14.0,
    magneticField: 16.0,
    bunchDensity: 20.0,
    rfFrequency: 600,
    quadGradient: 380,
    viewMode: "ring",
  },
};

export default function RelativisticParticleAcceleratorStudio() {
  // Theme & Presets
  const [activeTheme, setActiveTheme] = useState("hadronCyan");
  const [activePreset, setActivePreset] = useState("lhcHiggs");

  // Physics Controls
  const [beamEnergy, setBeamEnergy] = useState(PRESETS.lhcHiggs.beamEnergy); // TeV per beam (1 to 14)
  const [magneticField, setMagneticField] = useState(PRESETS.lhcHiggs.magneticField); // Tesla (1 to 16)
  const [bunchDensity, setBunchDensity] = useState(PRESETS.lhcHiggs.bunchDensity); // x10^10 (1 to 25)
  const [rfFrequency, setRfFrequency] = useState(PRESETS.lhcHiggs.rfFrequency); // MHz (100 to 600)
  const [quadGradient, setQuadGradient] = useState(PRESETS.lhcHiggs.quadGradient); // T/m (50 to 400)
  
  // Interactive Simulation Controls
  const [isSimulating, setIsSimulating] = useState(true);
  const [simSpeed, setSimSpeed] = useState(1.0);
  const [viewMode, setViewMode] = useState("ring"); // 'ring', 'detector', 'synchrotron'
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [collisionTrigger, setCollisionTrigger] = useState(0);

  // HUD & Telemetry State
  const [detectedEvents, setDetectedEvents] = useState([]);
  const [telemetry, setTelemetry] = useState({
    velocityRatio: "0.99999999",
    lorentzGamma: 7250,
    luminosity: "1.45 × 10³⁴",
    collisionEnergy: "13.60",
    synchrotronPower: "14.2",
    collisionCount: 0,
  });

  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const audioCtxRef = useRef(null);

  // State refs for animation loop
  const particlesRef = useRef([]);
  const collisionParticlesRef = useRef([]);
  const synchrotronPhotonsRef = useRef([]);
  const angleRef = useRef(0);

  const theme = THEMES[activeTheme];

  // Sound Synth Generator
  const playSoundEffect = useCallback((type) => {
    if (!audioEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === "collision") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.35);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === "pulse") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      }
    } catch (e) {
      // Audio context fallback
    }
  }, [audioEnabled]);

  // Load Preset
  const handlePresetSelect = (key) => {
    const p = PRESETS[key];
    if (!p) return;
    setActivePreset(key);
    setBeamEnergy(p.beamEnergy);
    setMagneticField(p.magneticField);
    setBunchDensity(p.bunchDensity);
    setRfFrequency(p.rfFrequency);
    setQuadGradient(p.quadGradient);
    setViewMode(p.viewMode);
    playSoundEffect("pulse");
  };

  // Trigger Collision Blast
  const triggerManualCollision = () => {
    setCollisionTrigger((prev) => prev + 1);
    playSoundEffect("collision");
  };

  // Telemetry updates
  useEffect(() => {
    // Relativistic calculations
    // Gamma factor approximation γ = E_beam (GeV) / m_p (0.938 GeV)
    const gamma = Math.round((beamEnergy * 1000) / 0.938);
    const betaSquare = 1 - 1 / (gamma * gamma);
    const beta = Math.sqrt(Math.max(0, betaSquare));
    const velStr = beta.toFixed(8);

    // Luminosity = N^2 * f / (4 pi sigma^2)
    const lumVal = (bunchDensity * bunchDensity * (rfFrequency / 400) * (quadGradient / 200)).toFixed(2);
    const lumStr = `${lumVal} × 10³⁴`;

    // Collision energy center of mass
    const eColl = (beamEnergy * 2).toFixed(2);

    // Synchrotron power radiated ~ gamma^4 / radius
    const synchP = ((Math.pow(gamma / 1000, 4) * magneticField) / 100).toFixed(1);

    setTelemetry((prev) => ({
      ...prev,
      velocityRatio: velStr,
      lorentzGamma: gamma,
      luminosity: lumStr,
      collisionEnergy: eColl,
      synchrotronPower: synchP,
    }));
  }, [beamEnergy, magneticField, bunchDensity, rfFrequency, quadGradient]);

  // Initialize Particles
  const initRingParticles = useCallback(() => {
    const beamAParticles = [];
    const beamBParticles = [];
    const numParticles = 48;

    for (let i = 0; i < numParticles; i++) {
      const angle = (i / numParticles) * Math.PI * 2;
      beamAParticles.push({
        angle,
        radiusOffset: (Math.random() - 0.5) * 6,
        speed: 1,
        energy: Math.random(),
      });
      beamBParticles.push({
        angle: -angle,
        radiusOffset: (Math.random() - 0.5) * 6,
        speed: 1,
        energy: Math.random(),
      });
    }

    particlesRef.current = { beamA: beamAParticles, beamB: beamBParticles };
  }, []);

  useEffect(() => {
    initRingParticles();
  }, [initRingParticles]);

  // Handle manual collision trigger particle shower creation
  useEffect(() => {
    if (collisionTrigger === 0) return;

    const shower = [];
    const particleTypes = [
      { name: "Higgs Boson (H⁰)", mass: "125.1 GeV", color: "#f43f5e" },
      { name: "Top Quark Pair (t t̄)", mass: "172.76 GeV", color: "#fbbf24" },
      { name: "Z⁰ Vector Boson", mass: "91.19 GeV", color: "#00f0ff" },
      { name: "Gluon Jet Spray", mass: "Massless", color: "#38bdf8" },
      { name: "Muon Anti-Muon (μ⁺μ⁻)", mass: "105.6 MeV", color: "#c084fc" },
    ];
    const particleEvent = particleTypes[Math.floor(Math.random() * particleTypes.length)];

    // Create 60 debris particles
    for (let i = 0; i < 65; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 8 * (beamEnergy / 7);
      shower.push({
        x: 0,
        y: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        decay: 0.01 + Math.random() * 0.02,
        color: theme.showerColors[Math.floor(Math.random() * theme.showerColors.length)],
        size: 1.5 + Math.random() * 3.5,
      });
    }

    collisionParticlesRef.current = [...collisionParticlesRef.current, ...shower];

    // Log Event
    setDetectedEvents((prev) => [
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        type: particleEvent.name,
        mass: particleEvent.mass,
        energy: `${(beamEnergy * 2).toFixed(1)} TeV`,
        luminosity: telemetry.luminosity,
        color: particleEvent.color,
      },
      ...prev.slice(0, 14),
    ]);

    setTelemetry((prev) => ({ ...prev, collisionCount: prev.collisionCount + 1 }));
  }, [collisionTrigger, beamEnergy, telemetry.luminosity, theme.showerColors]);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let width = (canvas.width = canvas.parentElement.clientWidth || 800);
    let height = (canvas.height = Math.max(480, canvas.parentElement.clientHeight || 520));

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth || 800;
      height = canvas.height = Math.max(480, canvas.parentElement.clientHeight || 520);
    };

    window.addEventListener("resize", handleResize);

    const render = () => {
      if (!isSimulating) {
        animFrameRef.current = requestAnimationFrame(render);
        return;
      }

      ctx.fillStyle = theme.canvasBg;
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // Draw Grid / Tech Overlay
      ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
      ctx.lineWidth = 1;
      const gridStep = 40;
      for (let x = 0; x < width; x += gridStep) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridStep) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      const effectiveSpeed = (beamEnergy / 7) * simSpeed * 0.03;
      angleRef.current += effectiveSpeed;

      // -------------------------------------------------------------
      // VIEW MODE 1: MAIN SYNCHROTRON STORAGE RING
      // -------------------------------------------------------------
      if (viewMode === "ring") {
        const ringRadius = Math.min(width, height) * 0.36;

        // Draw Superconducting Magnet Structures (Quadrupoles / Dipoles around ring)
        const magnetCount = 16;
        for (let i = 0; i < magnetCount; i++) {
          const mAngle = (i / magnetCount) * Math.PI * 2;
          const mx = centerX + Math.cos(mAngle) * ringRadius;
          const my = centerY + Math.sin(mAngle) * ringRadius;

          ctx.save();
          ctx.translate(mx, my);
          ctx.rotate(mAngle + Math.PI / 2);

          // Magnet Box
          ctx.fillStyle = theme.magnetColor;
          ctx.shadowColor = theme.beamAColor;
          ctx.shadowBlur = 8;
          ctx.fillRect(-12, -8, 24, 16);

          // Coils
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(-10, -6, 4, 12);
          ctx.fillRect(6, -6, 4, 12);
          ctx.restore();
        }

        // Draw Vacuum Pipe Ring
        ctx.beginPath();
        ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = theme.ringColor;
        ctx.lineWidth = 14;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 2;
        ctx.stroke();

        // RF Cavity Accelerators (Top & Bottom)
        [0, Math.PI].forEach((rfAngle) => {
          const rfx = centerX + Math.cos(rfAngle) * ringRadius;
          const rfy = centerY + Math.sin(rfAngle) * ringRadius;
          const pulse = (Math.sin(Date.now() * 0.01 * (rfFrequency / 200)) + 1) * 0.5;

          ctx.beginPath();
          ctx.arc(rfx, rfy, 18 + pulse * 6, 0, Math.PI * 2);
          ctx.strokeStyle = theme.rfColor;
          ctx.lineWidth = 3;
          ctx.stroke();
        });

        // Interaction Points (Colliders: ATLAS / CMS)
        const ipAngle = Math.PI / 2; // Bottom
        const ipX = centerX + Math.cos(ipAngle) * ringRadius;
        const ipY = centerY + Math.sin(ipAngle) * ringRadius;

        ctx.beginPath();
        ctx.arc(ipX, ipY, 22, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(244, 63, 94, 0.15)";
        ctx.fill();
        ctx.strokeStyle = "#f43f5e";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = "#f43f5e";
        ctx.font = "10px monospace";
        ctx.textAlign = "center";
        ctx.fillText("INTERACTION POINT [ATLAS]", ipX, ipY + 34);

        // Draw Counter-Rotating Particle Beams
        if (particlesRef.current.beamA && particlesRef.current.beamB) {
          // Beam A (Clockwise)
          particlesRef.current.beamA.forEach((p) => {
            const currentAngle = p.angle + angleRef.current;
            const r = ringRadius + p.radiusOffset;
            const px = centerX + Math.cos(currentAngle) * r;
            const py = centerY + Math.sin(currentAngle) * r;

            ctx.beginPath();
            ctx.arc(px, py, 3, 0, Math.PI * 2);
            ctx.fillStyle = theme.beamAColor;
            ctx.shadowColor = theme.beamAColor;
            ctx.shadowBlur = 10;
            ctx.fill();

            // Beam trail
            ctx.beginPath();
            ctx.arc(centerX, centerY, r, currentAngle - 0.2, currentAngle);
            ctx.strokeStyle = theme.beamAColor;
            ctx.lineWidth = 2;
            ctx.stroke();
          });

          // Beam B (Counter-Clockwise)
          particlesRef.current.beamB.forEach((p) => {
            const currentAngle = p.angle - angleRef.current * 1.05;
            const r = ringRadius + p.radiusOffset;
            const px = centerX + Math.cos(currentAngle) * r;
            const py = centerY + Math.sin(currentAngle) * r;

            ctx.beginPath();
            ctx.arc(px, py, 3, 0, Math.PI * 2);
            ctx.fillStyle = theme.beamBColor;
            ctx.shadowColor = theme.beamBColor;
            ctx.shadowBlur = 10;
            ctx.fill();

            // Beam trail
            ctx.beginPath();
            ctx.arc(centerX, centerY, r, currentAngle, currentAngle + 0.2);
            ctx.strokeStyle = theme.beamBColor;
            ctx.lineWidth = 2;
            ctx.stroke();
          });
        }

        // Auto collision burst at Interaction Point when beams cross
        if (Math.sin(angleRef.current * 4) > 0.98 && Math.random() < 0.3) {
          for (let i = 0; i < 8; i++) {
            const sang = Math.random() * Math.PI * 2;
            const spd = 1 + Math.random() * 4;
            collisionParticlesRef.current.push({
              x: ipX,
              y: ipY,
              vx: Math.cos(sang) * spd,
              vy: Math.sin(sang) * spd,
              life: 1.0,
              decay: 0.03,
              color: theme.showerColors[Math.floor(Math.random() * theme.showerColors.length)],
              size: 2,
            });
          }
        }
      }
      // -------------------------------------------------------------
      // VIEW MODE 2: DETECTOR CROSS-SECTION & PARTICLE SHOWER
      // -------------------------------------------------------------
      else if (viewMode === "detector") {
        // Draw Multi-layer Calorimeter Solenoid Rings
        const rings = [60, 110, 160, 210, 260];
        const ringNames = ["PIXEL TRACKER", "ECAL (ELECTROMAGNETIC)", "HCAL (HADRONIC)", "SOLENOID 4T", "MUON CHAMBERS"];

        rings.forEach((r, idx) => {
          ctx.beginPath();
          ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(56, 189, 248, ${0.15 + idx * 0.08})`;
          ctx.lineWidth = idx === 3 ? 6 : 2;
          ctx.stroke();

          ctx.fillStyle = "rgba(148, 163, 184, 0.4)";
          ctx.font = "9px monospace";
          ctx.textAlign = "left";
          ctx.fillText(ringNames[idx], centerX + r + 8, centerY);
        });

        // Detector Core Colliding Beams
        ctx.beginPath();
        ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "#00f0ff";
        ctx.shadowBlur = 20;
        ctx.fill();

        // Magnetic Field Lines in Detector
        ctx.strokeStyle = "rgba(168, 85, 247, 0.15)";
        ctx.lineWidth = 1;
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * Math.PI * 2 + angleRef.current * 0.2;
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.quadraticCurveTo(
            centerX + Math.cos(a + 0.5) * 150,
            centerY + Math.sin(a + 0.5) * 150,
            centerX + Math.cos(a) * 260,
            centerY + Math.sin(a) * 260
          );
          ctx.stroke();
        }
      }
      // -------------------------------------------------------------
      // VIEW MODE 3: SYNCHROTRON RADIATION EXTRACTION LINE
      // -------------------------------------------------------------
      else if (viewMode === "synchrotron") {
        // Curved electron trajectory through undulator magnets
        ctx.beginPath();
        ctx.moveTo(50, centerY);
        const undulatorPeriods = 10;
        const periodWidth = (width - 100) / undulatorPeriods;

        for (let i = 0; i <= undulatorPeriods; i++) {
          const x = 50 + i * periodWidth;
          const y = centerY + Math.sin(i * Math.PI + angleRef.current * 5) * 35;
          ctx.lineTo(x, y);

          // Emit Synchrotron Photons at crests
          if (Math.random() < 0.25) {
            synchrotronPhotonsRef.current.push({
              x,
              y,
              vx: 6 + Math.random() * 4,
              vy: (Math.random() - 0.5) * 2,
              life: 1.0,
            });
          }
        }

        ctx.strokeStyle = theme.beamAColor;
        ctx.lineWidth = 4;
        ctx.shadowColor = theme.beamAColor;
        ctx.shadowBlur = 15;
        ctx.stroke();

        // Render Synchrotron Photons
        synchrotronPhotonsRef.current.forEach((ph, idx) => {
          ph.x += ph.vx;
          ph.y += ph.vy;
          ph.life -= 0.02;

          ctx.beginPath();
          ctx.arc(ph.x, ph.y, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = "#ffffff";
          ctx.shadowColor = "#fbbf24";
          ctx.shadowBlur = 8;
          ctx.fill();

          if (ph.life <= 0 || ph.x > width) {
            synchrotronPhotonsRef.current.splice(idx, 1);
          }
        });
      }

      // Render Active Debris / Subatomic Particle Shower Debris
      collisionParticlesRef.current.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;

        ctx.beginPath();
        ctx.arc(centerX + p.x, centerY + p.y, Math.max(0.5, p.size * p.life), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12;
        ctx.fill();

        if (p.life <= 0) {
          collisionParticlesRef.current.splice(idx, 1);
        }
      });

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isSimulating, simSpeed, viewMode, beamEnergy, magneticField, rfFrequency, theme]);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 text-slate-100 font-sans">
      {/* Header Banner */}
      <div className={`rounded-2xl p-6 mb-6 ${theme.cardBg} border ${theme.border} shadow-2xl relative overflow-hidden`}>
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-3 py-1 text-xs font-mono font-semibold rounded-full border ${theme.badge}`}>
                RELATIVISTIC HADRON STUDIO v4.2
              </span>
              <span className="text-xs font-mono text-slate-400">c = 299,792,458 m/s</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Relativistic Particle Accelerator & Collider Lab
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Simulate high-energy synchrotron rings, superconducting magnetic optics, and subatomic particle collision showers at Lorentz gamma factors exceeding 7,000.
            </p>
          </div>

          {/* Quick Action Bar */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={`px-3 py-2 rounded-xl text-xs font-mono border transition ${
                audioEnabled
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                  : "bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200"
              }`}
            >
              {audioEnabled ? "🔊 SYNTH AUDIO ON" : "🔇 AUDIO MUTED"}
            </button>
            <button
              onClick={triggerManualCollision}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-mono ${theme.buttonBg} transition transform active:scale-95`}
            >
              💥 TRIGGER COLLISION BURST
            </button>
          </div>
        </div>

        {/* Presets Strip */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {Object.entries(PRESETS).map(([key, preset]) => {
            const isSelected = activePreset === key;
            return (
              <button
                key={key}
                onClick={() => handlePresetSelect(key)}
                className={`p-2.5 rounded-xl text-left transition border ${
                  isSelected
                    ? "bg-slate-800 border-cyan-500/50 text-white shadow-lg"
                    : "bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                }`}
              >
                <div className="text-xs font-bold truncate">{preset.name}</div>
                <div className="text-[10px] font-mono text-cyan-400/80 truncate mt-0.5">{preset.formula}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Controls + Visualizer + Event Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Parameters */}
        <div className={`lg:col-span-4 rounded-2xl p-5 ${theme.cardBg} border ${theme.border} flex flex-col gap-5 shadow-xl`}>
          <h2 className="text-sm font-mono font-bold text-slate-300 flex items-center justify-between border-b border-slate-800 pb-3">
            <span>⚙️ ACCELERATOR OPTICS & PHYSICS</span>
            <span className={theme.accentText}>{PRESETS[activePreset]?.name}</span>
          </h2>

          {/* Beam Energy */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Beam Energy (E_beam):</span>
              <span className="font-mono font-bold text-cyan-400">{beamEnergy.toFixed(1)} TeV</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="14.0"
              step="0.1"
              value={beamEnergy}
              onChange={(e) => setBeamEnergy(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0.5 TeV</span>
              <span>√s = {(beamEnergy * 2).toFixed(1)} TeV</span>
              <span>14.0 TeV</span>
            </div>
          </div>

          {/* Magnetic Dipole Field */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Dipole Field (B_mag):</span>
              <span className="font-mono font-bold text-amber-400">{magneticField.toFixed(2)} Tesla</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="16.0"
              step="0.25"
              value={magneticField}
              onChange={(e) => setMagneticField(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>1.0 T</span>
              <span>Nb₃Sn Superconductor</span>
              <span>16.0 T</span>
            </div>
          </div>

          {/* Bunch Population Density */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Bunch Population:</span>
              <span className="font-mono font-bold text-purple-400">{bunchDensity.toFixed(1)} × 10¹⁰ p⁺</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="25.0"
              step="0.5"
              value={bunchDensity}
              onChange={(e) => setBunchDensity(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
            />
          </div>

          {/* RF Cavity Frequency */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">RF Cavity Harmonic:</span>
              <span className="font-mono font-bold text-emerald-400">{rfFrequency} MHz</span>
            </div>
            <input
              type="range"
              min="100"
              max="600"
              step="25"
              value={rfFrequency}
              onChange={(e) => setRfFrequency(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
          </div>

          {/* Quadrupole Focus Gradient */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Quadrupole Gradient:</span>
              <span className="font-mono font-bold text-rose-400">{quadGradient} T/m</span>
            </div>
            <input
              type="range"
              min="50"
              max="400"
              step="10"
              value={quadGradient}
              onChange={(e) => setQuadGradient(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-400"
            />
          </div>

          {/* Controls: View Modes & Theme Selector */}
          <div className="pt-3 border-t border-slate-800 space-y-3">
            <div className="text-xs font-mono text-slate-400">VIEW MODE OBSERVATORY</div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "ring", label: "⭕ MAIN RING" },
                { id: "detector", label: "🎯 DETECTOR" },
                { id: "synchrotron", label: "⚡ SYNCHROTRON" },
              ].map((v) => (
                <button
                  key={v.id}
                  onClick={() => setViewMode(v.id)}
                  className={`py-1.5 rounded-lg text-[11px] font-mono font-bold transition border ${
                    viewMode === v.id
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>

            <div className="text-xs font-mono text-slate-400 pt-2">COLOR SPECTRUM THEME</div>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(THEMES).map((tKey) => (
                <button
                  key={tKey}
                  onClick={() => setActiveTheme(tKey)}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-mono text-left transition border ${
                    activeTheme === tKey
                      ? "bg-slate-800 border-cyan-500/50 text-white"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {THEMES[tKey].name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center/Right Column: Live Simulation Canvas & Telemetry HUD */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Canvas Wrapper */}
          <div className={`relative rounded-2xl ${theme.cardBg} border ${theme.border} overflow-hidden shadow-2xl flex-1 min-h-[460px]`}>
            {/* View Mode Tag */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
              <span className="px-2.5 py-1 text-[11px] font-mono bg-slate-950/80 border border-slate-700/80 text-cyan-400 rounded-lg backdrop-blur-md">
                MODE: {viewMode.toUpperCase()}
              </span>
              <button
                onClick={() => setIsSimulating(!isSimulating)}
                className={`px-2.5 py-1 text-[11px] font-mono rounded-lg border backdrop-blur-md transition ${
                  isSimulating
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                }`}
              >
                {isSimulating ? "● LIVE RUNNING" : "⏸ SIM PAUSED"}
              </button>
            </div>

            {/* Sim Speed Toggle */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-1 bg-slate-950/80 p-1 border border-slate-700/80 rounded-lg backdrop-blur-md">
              {[0.5, 1.0, 2.0].map((s) => (
                <button
                  key={s}
                  onClick={() => setSimSpeed(s)}
                  className={`px-2 py-0.5 text-[10px] font-mono rounded ${
                    simSpeed === s ? "bg-cyan-500 text-black font-bold" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>

            <canvas ref={canvasRef} className="w-full h-full block cursor-crosshair" onClick={triggerManualCollision} />

            {/* Canvas Bottom Overlay Prompt */}
            <div className="absolute bottom-3 left-4 right-4 flex justify-between items-center text-[10px] font-mono text-slate-400 bg-slate-950/70 p-2 rounded-xl border border-slate-800 backdrop-blur-sm pointer-events-none">
              <span>💡 CLICK CANVAS TO INJECT HIGH-ENERGY PARTICLE SHOWER</span>
              <span>COLLISIONS LOGGED: {telemetry.collisionCount}</span>
            </div>
          </div>

          {/* Telemetry HUD Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md">
              <div className="text-[10px] font-mono text-slate-400">LORENTZ FACTOR (γ)</div>
              <div className="text-lg font-mono font-bold text-cyan-400 mt-1">γ = {telemetry.lorentzGamma.toLocaleString()}</div>
              <div className="text-[10px] font-mono text-slate-500">v/c = {telemetry.velocityRatio}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md">
              <div className="text-[10px] font-mono text-slate-400">INSTANT LUMINOSITY</div>
              <div className="text-lg font-mono font-bold text-purple-400 mt-1">{telemetry.luminosity}</div>
              <div className="text-[10px] font-mono text-slate-500">cm⁻²s⁻¹ Target Rate</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md">
              <div className="text-[10px] font-mono text-slate-400">COLLISION ENERGY (√s)</div>
              <div className="text-lg font-mono font-bold text-amber-400 mt-1">{telemetry.collisionEnergy} TeV</div>
              <div className="text-[10px] font-mono text-slate-500">Center-of-Mass Energy</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md">
              <div className="text-[10px] font-mono text-slate-400">SYNCHROTRON LOSS</div>
              <div className="text-lg font-mono font-bold text-emerald-400 mt-1">{telemetry.synchrotronPower} MW</div>
              <div className="text-[10px] font-mono text-slate-500">Radiated Beam Power</div>
            </div>
          </div>

          {/* Interactive Subatomic Event Log */}
          <div className={`p-4 rounded-2xl ${theme.cardBg} border ${theme.border} shadow-xl`}>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <h3 className="text-xs font-mono font-bold text-slate-300 flex items-center gap-2">
                <span>📡 DETECTOR EVENT TELEMETRY DISCOVERY LOG</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {detectedEvents.length} EVENTS RECORDED
                </span>
              </h3>
              {detectedEvents.length > 0 && (
                <button
                  onClick={() => setDetectedEvents([])}
                  className="text-[10px] font-mono text-slate-400 hover:text-slate-200 transition"
                >
                  CLEAR LOG
                </button>
              )}
            </div>

            {detectedEvents.length === 0 ? (
              <div className="text-center py-6 text-xs font-mono text-slate-500">
                No collision events logged yet. Click "TRIGGER COLLISION BURST" or click inside the canvas visualizer!
              </div>
            ) : (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {detectedEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs font-mono"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: evt.color }} />
                      <span className="font-bold text-slate-200">{evt.type}</span>
                    </div>
                    <div className="flex items-center gap-4 text-slate-400 text-[11px]">
                      <span>Rest Mass: {evt.mass}</span>
                      <span>√s: {evt.energy}</span>
                      <span className="text-slate-500">{evt.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
