import React, { useState, useEffect, useRef, useCallback } from "react";

// Color Themes & Aesthetic Design Tokens
const THEMES = {
  cryoCobalt: {
    id: "cryoCobalt",
    name: "Cryo Cobalt Neon",
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    accentText: "text-cyan-400",
    border: "border-cyan-500/30",
    cardBg: "bg-slate-900/80 backdrop-blur-md border-cyan-500/20",
    buttonBg: "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20",
    canvasBg: "#050b14",
    fieldNorth: "rgba(59, 130, 246, 0.7)",
    fieldSouth: "rgba(239, 68, 68, 0.7)",
    vortexGlow: "#06b6d4",
    puckColor: "#0284c7",
    puckEdge: "#38bdf8",
    vaporColor: "rgba(186, 230, 253, 0.4)",
    gridLine: "rgba(14, 165, 233, 0.08)",
  },
  emeraldLaser: {
    id: "emeraldLaser",
    name: "Laser Emerald Grid",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    accentText: "text-emerald-400",
    border: "border-emerald-500/30",
    cardBg: "bg-slate-900/80 backdrop-blur-md border-emerald-500/20",
    buttonBg: "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20",
    canvasBg: "#030f0a",
    fieldNorth: "rgba(16, 185, 129, 0.7)",
    fieldSouth: "rgba(244, 63, 94, 0.7)",
    vortexGlow: "#10b981",
    puckColor: "#059669",
    puckEdge: "#34d399",
    vaporColor: "rgba(167, 243, 208, 0.4)",
    gridLine: "rgba(16, 185, 129, 0.08)",
  },
  quantumViolet: {
    id: "quantumViolet",
    name: "Quantum Ultraviolet",
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    accentText: "text-purple-400",
    border: "border-purple-500/30",
    cardBg: "bg-slate-900/80 backdrop-blur-md border-purple-500/20",
    buttonBg: "bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white shadow-lg shadow-purple-500/20",
    canvasBg: "#090514",
    fieldNorth: "rgba(168, 85, 247, 0.7)",
    fieldSouth: "rgba(236, 72, 153, 0.7)",
    vortexGlow: "#c084fc",
    puckColor: "#7c3aed",
    puckEdge: "#e879f9",
    vaporColor: "rgba(233, 213, 255, 0.4)",
    gridLine: "rgba(168, 85, 247, 0.08)",
  },
  solarGold: {
    id: "solarGold",
    name: "Solar Plasma",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    accentText: "text-amber-400",
    border: "border-amber-500/30",
    cardBg: "bg-slate-900/80 backdrop-blur-md border-amber-500/20",
    buttonBg: "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg shadow-amber-500/20",
    canvasBg: "#120803",
    fieldNorth: "rgba(245, 158, 11, 0.7)",
    fieldSouth: "rgba(239, 68, 68, 0.7)",
    vortexGlow: "#fbbf24",
    puckColor: "#d97706",
    puckEdge: "#fde047",
    vaporColor: "rgba(254, 240, 138, 0.4)",
    gridLine: "rgba(245, 158, 11, 0.08)",
  },
};

// Superconductor Material Specifications
const SUPERCONDUCTOR_MATERIALS = {
  ybco: {
    id: "ybco",
    name: "YBCO (YBa₂Cu₃O₇₋ₓ)",
    type: "Type-II Ceramic",
    tc: 93, // Critical Temp Kelvin
    pinningStrength: 0.9,
    penetrationDepth: 150, // nm
    coherenceLength: 1.5, // nm
    desc: "High-temperature ceramic superconductor with extreme flux pinning capability.",
  },
  bscco: {
    id: "bscco",
    name: "BSCCO (Bi₂Sr₂Ca₂Cu₃O₁₀)",
    type: "Type-II Layered Cuprate",
    tc: 108,
    pinningStrength: 0.75,
    penetrationDepth: 200,
    coherenceLength: 2.0,
    desc: "Flexible cuprate superconductor with anisotropic 2D vortex flux pancake structure.",
  },
  nb3sn: {
    id: "nb3sn",
    name: "Niobium-Tin (Nb₃Sn)",
    type: "Type-II Metallic Alloy",
    tc: 18,
    pinningStrength: 0.98,
    penetrationDepth: 80,
    coherenceLength: 3.0,
    desc: "Heavy industrial metallic alloy used in MRI magnets and particle accelerators.",
  },
  roomtemp: {
    id: "roomtemp",
    name: "Exotic Metamaterial X-9",
    type: "Ambient Superconductor",
    tc: 295,
    pinningStrength: 1.0,
    penetrationDepth: 50,
    coherenceLength: 5.0,
    desc: "Theoretical ambient room-temperature superconductor with perfect quantum lock.",
  },
};

// Track Layout Presets
const TRACK_PRESETS = [
  {
    id: "maglevLoop",
    name: "🏎️ MagLev Track Circuit",
    desc: "Continuous oval magnet track for high-speed frictionless quantum train levitation.",
    trackType: "oval",
    magnetCount: 24,
    defaultHeight: 35,
    puckVelocity: 4.5,
  },
  {
    id: "mobiusInverted",
    name: "♾️ Inverted Möbius Loop",
    desc: "Alternating polarity track demonstrating upside-down quantum pinning suspension.",
    trackType: "mobius",
    magnetCount: 28,
    defaultHeight: 30,
    puckVelocity: 3.0,
  },
  {
    id: "quadrupoleTrap",
    name: "🌀 Quadrupole Magnetic Trap",
    desc: "Four opposing magnetic poles forming a zero-field center trap for multiple pucks.",
    trackType: "quadrupole",
    magnetCount: 4,
    defaultHeight: 40,
    puckVelocity: 0.0,
  },
  {
    id: "halbachArray",
    name: "🧲 Halbach Heavy-Lift Array",
    desc: "Augmented 1-sided magnetic field array producing maximum levitation repulsive force.",
    trackType: "halbach",
    magnetCount: 16,
    defaultHeight: 50,
    puckVelocity: 1.5,
  },
  {
    id: "customDesigner",
    name: "🛠️ Custom Magnet Sandbox",
    desc: "Interactive canvas mode to place and drag custom North & South magnets.",
    trackType: "custom",
    magnetCount: 6,
    defaultHeight: 30,
    puckVelocity: 0.0,
  },
];

export default function SuperconductingFluxPinningLab() {
  // Theme & State Settings
  const [themeKey, setThemeKey] = useState("cryoCobalt");
  const [materialKey, setMaterialKey] = useState("ybco");
  const [presetKey, setPresetKey] = useState("maglevLoop");

  // Physics Control States
  const [temperature, setTemperature] = useState(77); // Kelvin (Liquid Nitrogen default)
  const [magneticFieldStrength, setMagneticFieldStrength] = useState(1.5); // Tesla
  const [pinningDefects, setPinningDefects] = useState(0.85); // 0.1 to 1.0 multiplier
  const [showFieldLines, setShowFieldLines] = useState(true);
  const [showVortices, setShowVortices] = useState(true);
  const [showVapor, setShowVapor] = useState(true);
  const [showVectors, setShowVectors] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Custom Magnet Designer Tool State
  const [activeTool, setActiveTool] = useState("north"); // "north", "south", "move"

  // Telemetry Graph History State
  const [telemetry, setTelemetry] = useState({
    height: 35,
    pinningForce: 0,
    gapEnergy: 1,
    vortexCount: 0,
    isSuperconducting: true,
  });

  const theme = THEMES[themeKey] || THEMES.cryoCobalt;
  const material = SUPERCONDUCTOR_MATERIALS[materialKey] || SUPERCONDUCTOR_MATERIALS.ybco;

  // Refs for Canvas, Audio, & Physics Loops
  const canvasRef = useRef(null);
  const graphCanvasRef = useRef(null);
  const containerRef = useRef(null);
  const animFrameRef = useRef(null);

  // Audio Context Ref
  const audioCtxRef = useRef(null);
  const humOscRef = useRef(null);
  const humGainRef = useRef(null);
  const noiseSourceRef = useRef(null);
  const noiseGainRef = useRef(null);

  // Physics Simulation Data Refs
  const simStateRef = useRef({
    pucks: [
      {
        id: 1,
        x: 0,
        y: 0,
        z: 35, // levitation height
        vx: 0,
        vy: 0,
        vz: 0,
        pitch: 0,
        roll: 0,
        trackProgress: 0,
        isPinned: true,
        pinnedX: 0,
        pinnedY: 0,
        pinnedZ: 35,
        radius: 28,
        quenched: false,
        vortices: [],
      },
    ],
    magnets: [],
    particles: [], // vapor & nitrogen boil particles
    sparkParticles: [], // quench sparks
    history: { height: [], force: [], gap: [], vortices: [] },
    draggedPuckIndex: -1,
    draggedMagnetIndex: -1,
    mousePos: { x: 0, y: 0 },
    isDragging: false,
    dragOffset: { x: 0, y: 0 },
    isRendering: true,
  });

  // Calculate order parameter Psi(T) = sqrt(1 - (T/Tc)^4)
  const calculateSuperconductingState = useCallback(
    (tempK) => {
      if (tempK >= material.tc) {
        return { isSuperconducting: false, orderParameter: 0, gapRatio: 0 };
      }
      const ratio = tempK / material.tc;
      const orderParameter = Math.sqrt(Math.max(0, 1 - Math.pow(ratio, 4)));
      return { isSuperconducting: true, orderParameter, gapRatio: orderParameter };
    },
    [material.tc]
  );

  // Build Magnet Track Layout
  const initTrackLayout = useCallback(
    (presetId) => {
      const preset = TRACK_PRESETS.find((p) => p.id === presetId) || TRACK_PRESETS[0];
      const magnets = [];

      if (preset.trackType === "oval") {
        const rx = 240;
        const ry = 130;
        const count = preset.magnetCount;
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2;
          const x = rx * Math.cos(angle);
          const y = ry * Math.sin(angle);
          const polarity = i % 2 === 0 ? 1 : -1; // alternating N / S
          magnets.push({ id: i, x, y, polarity, strength: 1.5, type: "track" });
        }
      } else if (preset.trackType === "mobius") {
        const rx = 220;
        const ry = 120;
        const count = preset.magnetCount;
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2;
          const x = rx * Math.cos(angle);
          const y = ry * Math.sin(angle);
          // Möbius twisting polarity: polarity flips every half turn
          const polarity = Math.sin(angle * 1.5) > 0 ? 1 : -1;
          magnets.push({ id: i, x, y, polarity, strength: 1.8, type: "mobius" });
        }
      } else if (preset.trackType === "quadrupole") {
        magnets.push({ id: 0, x: -140, y: 0, polarity: 1, strength: 2.0, type: "pole" });
        magnets.push({ id: 1, x: 140, y: 0, polarity: 1, strength: 2.0, type: "pole" });
        magnets.push({ id: 2, x: 0, y: -110, polarity: -1, strength: 2.0, type: "pole" });
        magnets.push({ id: 3, x: 0, y: 110, polarity: -1, strength: 2.0, type: "pole" });
      } else if (preset.trackType === "halbach") {
        const cols = 8;
        const spacing = 55;
        const startX = -((cols - 1) * spacing) / 2;
        for (let row = -1; row <= 1; row += 2) {
          for (let col = 0; col < cols; col++) {
            const x = startX + col * spacing;
            const y = row * 60;
            // Halbach 90-degree rotating vector pattern
            const polarity = (col % 4 === 0 || col % 4 === 1) ? 1 : -1;
            magnets.push({ id: magnets.length, x, y, polarity, strength: 2.2, type: "halbach" });
          }
        }
      } else if (preset.trackType === "custom") {
        // Initial custom layout
        const positions = [
          { x: -150, y: -80, polarity: 1 },
          { x: 0, y: -80, polarity: -1 },
          { x: 150, y: -80, polarity: 1 },
          { x: -150, y: 80, polarity: -1 },
          { x: 0, y: 80, polarity: 1 },
          { x: 150, y: 80, polarity: -1 },
        ];
        positions.forEach((p, idx) => {
          magnets.push({ id: idx, x: p.x, y: p.y, polarity: p.polarity, strength: 1.5, type: "custom" });
        });
      }

      // Re-initialize Puck position
      const initialPuckX = magnets.length > 0 ? magnets[0].x : 0;
      const initialPuckY = magnets.length > 0 ? magnets[0].y : 0;

      simStateRef.current.magnets = magnets;
      simStateRef.current.pucks = [
        {
          id: 1,
          x: initialPuckX,
          y: initialPuckY,
          z: preset.defaultHeight,
          vx: preset.trackType === "oval" || preset.trackType === "mobius" ? preset.puckVelocity : 0,
          vy: 0,
          vz: 0,
          pitch: 0,
          roll: 0,
          trackProgress: 0,
          isPinned: true,
          pinnedX: initialPuckX,
          pinnedY: initialPuckY,
          pinnedZ: preset.defaultHeight,
          radius: 28,
          quenched: false,
          vortices: [],
        },
      ];

      // Generate initial quantum vortices in superconductor
      const vortexCount = Math.floor(12 * pinningDefects * (magneticFieldStrength / 1.5));
      const vortices = [];
      for (let i = 0; i < vortexCount; i++) {
        const rad = Math.random() * 20;
        const ang = Math.random() * Math.PI * 2;
        vortices.push({
          x: Math.cos(ang) * rad,
          y: Math.sin(ang) * rad,
          intensity: 0.5 + Math.random() * 0.5,
          pinned: Math.random() < pinningDefects,
        });
      }
      simStateRef.current.pucks[0].vortices = vortices;
    },
    [pinningDefects, magneticFieldStrength]
  );

  // Initialize preset when track preset changes
  useEffect(() => {
    initTrackLayout(presetKey);
  }, [presetKey, initTrackLayout]);

  // Handle Web Audio Initialization & Synthesis
  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      // Levitation hum oscillator
      const humOsc = ctx.createOscillator();
      const humGain = ctx.createGain();
      humOsc.type = "sine";
      humOsc.frequency.setValueAtTime(110, ctx.currentTime);
      humGain.gain.setValueAtTime(0, ctx.currentTime);

      humOsc.connect(humGain);
      humGain.connect(ctx.destination);
      humOsc.start();

      humOscRef.current = humOsc;
      humGainRef.current = humGain;

      // LN2 Boiling White Noise Generator
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(2400, ctx.currentTime);
      filter.Q.setValueAtTime(3.0, ctx.currentTime);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0, ctx.currentTime);

      noiseSource.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noiseSource.start();

      noiseSourceRef.current = noiseSource;
      noiseGainRef.current = noiseGain;
    } catch (e) {
      console.warn("Web Audio API not supported or blocked", e);
    }
  }, []);

  // Update Audio synth parameters based on physics
  const updateAudio = useCallback(
    (height, velocity, isSuperconducting) => {
      if (!audioEnabled || !audioCtxRef.current) return;
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      if (isSuperconducting) {
        // Hum pitch modulates with levitation height & speed
        const targetFreq = 90 + Math.min(300, height * 2.5 + velocity * 15);
        humOscRef.current?.frequency.setTargetAtTime(targetFreq, ctx.currentTime, 0.1);
        humGainRef.current?.gain.setTargetAtTime(0.08, ctx.currentTime, 0.1);

        // LN2 boiling noise level scales with temperature below Tc
        const tempRatio = Math.max(0, (93 - temperature) / 93);
        noiseGainRef.current?.gain.setTargetAtTime(tempRatio * 0.04, ctx.currentTime, 0.2);
      } else {
        // Quench / Normal State: silence hum, loud hiss
        humGainRef.current?.gain.setTargetAtTime(0, ctx.currentTime, 0.1);
        noiseGainRef.current?.gain.setTargetAtTime(0.01, ctx.currentTime, 0.2);
      }
    },
    [audioEnabled, temperature]
  );

  // Play Quench / Flux Jump sound pulse
  const triggerSoundPulse = useCallback((type) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === "quench") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    } else if (type === "fluxSnap") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  }, []);

  // Main Canvas Rendering & Physics Update Loop
  useEffect(() => {
    let lastTime = performance.now();

    const renderLoop = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05); // cap frame delta
      lastTime = now;

      const canvas = canvasRef.current;
      if (!canvas) {
        animFrameRef.current = requestAnimationFrame(renderLoop);
        return;
      }
      const ctx = canvas.getContext("2d");
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2 + 30;

      const { isSuperconducting, orderParameter } = calculateSuperconductingState(temperature);

      // --- PHYSICS UPDATE ---
      if (!isPaused && simStateRef.current.isRendering) {
        const pucks = simStateRef.current.pucks;
        const magnets = simStateRef.current.magnets;

        pucks.forEach((puck, idx) => {
          if (idx === simStateRef.current.draggedPuckIndex) return; // User is manually dragging

          if (isSuperconducting) {
            puck.quenched = false;

            // Track Circuit auto-guidance for oval & mobius presets
            const preset = TRACK_PRESETS.find((p) => p.id === presetKey);
            if (preset && (preset.trackType === "oval" || preset.trackType === "mobius") && magnets.length > 0) {
              puck.trackProgress += puck.vx * 0.008;
              if (puck.trackProgress > Math.PI * 2) puck.trackProgress -= Math.PI * 2;

              const rx = preset.trackType === "oval" ? 240 : 220;
              const ry = preset.trackType === "oval" ? 130 : 120;
              const targetX = rx * Math.cos(puck.trackProgress);
              const targetY = ry * Math.sin(puck.trackProgress);

              // Flux Pinning restoring spring force towards track line
              const pinningFx = (targetX - puck.x) * 8.0 * pinningDefects * orderParameter;
              const pinningFy = (targetY - puck.y) * 8.0 * pinningDefects * orderParameter;

              puck.vx += pinningFx * dt;
              puck.vy += pinningFy * dt;

              // Levitation equilibrium height
              const targetZ = preset.defaultHeight * (0.8 + 0.2 * Math.sin(puck.trackProgress * 3));
              const levitationFz = (targetZ - puck.z) * 12.0 * orderParameter;
              puck.vz += levitationFz * dt;
            } else {
              // Sandbox / Quadrupole Magnetic Pinning equilibrium
              let netFx = 0;
              let netFy = 0;
              let netFz = 0;

              magnets.forEach((mag) => {
                const dx = puck.x - mag.x;
                const dy = puck.y - mag.y;
                const distSq = dx * dx + dy * dy + 1;
                const dist = Math.sqrt(distSq);

                // Magnetic Field Repulsion & Flux Lock Force
                const fieldMag = (mag.strength * 1000) / distSq;
                const repFx = (dx / dist) * fieldMag * orderParameter;
                const repFy = (dy / dist) * fieldMag * orderParameter;

                // Restoring flux lock force towards nearest magnetic node
                if (dist < 180) {
                  const lockFx = -dx * 0.05 * pinningDefects * orderParameter;
                  const lockFy = -dy * 0.05 * pinningDefects * orderParameter;
                  netFx += repFx + lockFx;
                  netFy += repFy + lockFy;
                }
              });

              // Levitation Lift vs Gravity balance
              const targetZ = 35 * Math.max(0.2, orderParameter * (magneticFieldStrength / 1.5));
              const gravityZ = -9.8 * 0.5;
              const magLiftZ = (targetZ - puck.z) * 15.0 * orderParameter;
              netFz = magLiftZ + gravityZ;

              puck.vx += netFx * dt;
              puck.vy += netFy * dt;
              puck.vz += netFz * dt;
            }

            // Damping (Frictionless Quantum Glide)
            puck.vx *= 0.98;
            puck.vy *= 0.98;
            puck.vz *= 0.92;

            puck.x += puck.vx;
            puck.y += puck.vy;
            puck.z = Math.max(5, puck.z + puck.vz);
          } else {
            // --- THERMAL QUENCH (NORMAL STATE) ---
            if (!puck.quenched) {
              puck.quenched = true;
              triggerSoundPulse("quench");

              // Spawn thermal quench spark particles
              for (let s = 0; s < 30; s++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 2 + Math.random() * 6;
                simStateRef.current.sparkParticles.push({
                  x: puck.x,
                  y: puck.y,
                  z: puck.z,
                  vx: Math.cos(angle) * speed,
                  vy: Math.sin(angle) * speed,
                  vz: 2 + Math.random() * 4,
                  life: 1.0,
                  color: "#ef4444",
                });
              }
            }

            // Gravity pulls puck down to track surface
            puck.vz -= 25.0 * dt;
            puck.z += puck.vz;
            if (puck.z <= 0) {
              puck.z = 0;
              puck.vz = -puck.vz * 0.3; // bounce
              puck.vx *= 0.9;
              puck.vy *= 0.9;
            }
            puck.x += puck.vx;
            puck.y += puck.vy;
          }

          // Generate LN2 Boil Vapor Particles
          if (showVapor && Math.random() < 0.6 && temperature < material.tc) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * puck.radius;
            simStateRef.current.particles.push({
              x: puck.x + Math.cos(angle) * dist,
              y: puck.y + Math.sin(angle) * dist,
              z: puck.z + (Math.random() * 6 - 3),
              vx: (Math.random() - 0.5) * 0.8,
              vy: (Math.random() - 0.5) * 0.8,
              vz: 0.8 + Math.random() * 1.5,
              radius: 4 + Math.random() * 8,
              life: 1.0,
              maxLife: 1.0,
            });
          }
        });

        // Update Vapor Particles
        simStateRef.current.particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.z += p.vz;
          p.life -= dt * 1.2;
        });
        simStateRef.current.particles = simStateRef.current.particles.filter((p) => p.life > 0);

        // Update Spark Particles
        simStateRef.current.sparkParticles.forEach((sp) => {
          sp.x += sp.vx;
          sp.y += sp.vy;
          sp.z += sp.vz;
          sp.vz -= 9.8 * dt * 2;
          sp.life -= dt * 2.0;
        });
        simStateRef.current.sparkParticles = simStateRef.current.sparkParticles.filter((sp) => sp.life > 0);

        // Update Audio Synth parameters
        const primaryPuck = pucks[0];
        const velMag = Math.sqrt(primaryPuck.vx * primaryPuck.vx + primaryPuck.vy * primaryPuck.vy);
        updateAudio(primaryPuck.z, velMag, isSuperconducting);
      }

      // --- CANVAS DRAWING ---
      ctx.fillStyle = theme.canvasBg;
      ctx.fillRect(0, 0, width, height);

      // Draw Grid Lines (Isometric Perspective Backdrop)
      ctx.strokeStyle = theme.gridLine;
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = -width; x < width * 2; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x - 300, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw Magnetic Track & Magnets
      const magnets = simStateRef.current.magnets;
      magnets.forEach((mag) => {
        const px = centerX + mag.x;
        const py = centerY + mag.y;

        // Magnet Body (3D Cylinder render)
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(px, py, 22, 14, 0, 0, Math.PI * 2);
        ctx.fillStyle = mag.polarity === 1 ? theme.fieldNorth : theme.fieldSouth;
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.4)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Magnet Label N / S
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(mag.polarity === 1 ? "N" : "S", px, py);
        ctx.restore();
      });

      // Draw Magnetic B-Field Vector Lines
      if (showFieldLines) {
        ctx.save();
        magnets.forEach((mag) => {
          const px = centerX + mag.x;
          const py = centerY + mag.y;

          ctx.beginPath();
          const lineCount = 8;
          for (let i = 0; i < lineCount; i++) {
            const angle = (i / lineCount) * Math.PI * 2;
            const r1 = 15;
            const r2 = 45;
            ctx.moveTo(px + Math.cos(angle) * r1, py + Math.sin(angle) * r1 * 0.6);
            ctx.quadraticCurveTo(
              px + Math.cos(angle) * r2 * 1.4,
              py + Math.sin(angle) * r2 - 20,
              px + Math.cos(angle) * r2 * 1.8,
              py + Math.sin(angle) * r2 * 0.6
            );
          }
          ctx.strokeStyle = mag.polarity === 1 ? "rgba(59, 130, 246, 0.18)" : "rgba(239, 68, 68, 0.18)";
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
        });
        ctx.restore();
      }

      // Draw LN2 Boiling Vapor Particles (Behind Puck)
      simStateRef.current.particles.forEach((p) => {
        const px = centerX + p.x;
        const py = centerY + p.y - p.z;
        ctx.save();
        ctx.beginPath();
        ctx.arc(px, py, p.radius * p.life, 0, Math.PI * 2);
        ctx.fillStyle = theme.vaporColor;
        ctx.globalAlpha = p.life * 0.4;
        ctx.fill();
        ctx.restore();
      });

      // Draw Superconducting Pucks
      const pucks = simStateRef.current.pucks;
      pucks.forEach((puck) => {
        const px = centerX + puck.x;
        const py = centerY + puck.y - puck.z; // Levitation offset
        const shadowPy = centerY + puck.y; // Ground shadow

        // 1. Ground Shadow (Fades with levitation height)
        const shadowAlpha = Math.max(0.1, 0.6 - puck.z / 120);
        const shadowScale = Math.max(0.5, 1.0 - puck.z / 200);
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(centerX + puck.x, shadowPy, puck.radius * shadowScale, (puck.radius * 0.55) * shadowScale, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 0, 0, " + shadowAlpha + ")";
        ctx.fill();
        ctx.restore();

        // 2. Levitation Pillar Glow / Field Lock Lines (when superconducting)
        if (isSuperconducting && puck.z > 5) {
          ctx.save();
          const gradient = ctx.createLinearGradient(px, py, centerX + puck.x, shadowPy);
          gradient.addColorStop(0, theme.vortexGlow);
          gradient.addColorStop(1, "transparent");
          ctx.beginPath();
          ctx.moveTo(px - puck.radius * 0.7, py);
          ctx.lineTo(centerX + puck.x - puck.radius * 0.7, shadowPy);
          ctx.lineTo(centerX + puck.x + puck.radius * 0.7, shadowPy);
          ctx.lineTo(px + puck.radius * 0.7, py);
          ctx.fillStyle = gradient;
          ctx.globalAlpha = 0.25 * orderParameter;
          ctx.fill();
          ctx.restore();
        }

        // 3. Puck Body (3D Disk)
        ctx.save();

        // Outer Glow Ring
        if (isSuperconducting) {
          ctx.beginPath();
          ctx.ellipse(px, py, puck.radius + 4, puck.radius * 0.6 + 4, 0, 0, Math.PI * 2);
          ctx.fillStyle = theme.vortexGlow;
          ctx.globalAlpha = 0.3 * orderParameter;
          ctx.fill();
        }

        // Ceramic Disk Top Surface
        ctx.globalAlpha = 1.0;
        ctx.beginPath();
        ctx.ellipse(px, py, puck.radius, puck.radius * 0.6, 0, 0, Math.PI * 2);
        ctx.fillStyle = puck.quenched ? "#475569" : theme.puckColor;
        ctx.fill();
        ctx.strokeStyle = puck.quenched ? "#ef4444" : theme.puckEdge;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Inner Superconducting Ring Pattern
        ctx.beginPath();
        ctx.ellipse(px, py, puck.radius * 0.65, puck.radius * 0.38, 0, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // 4. Draw Abrikosov Quantum Flux Vortices inside Superconductor
        if (showVortices && isSuperconducting) {
          puck.vortices.forEach((v) => {
            const vx = px + v.x;
            const vy = py + v.y * 0.6;
            ctx.beginPath();
            ctx.arc(vx, vy, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = theme.vortexGlow;
            ctx.shadowColor = theme.vortexGlow;
            ctx.shadowBlur = 6;
            ctx.fill();
            ctx.shadowBlur = 0;
          });
        }

        // 5. Force Vectors Overlay (Pinning force, Gravity, Magnetic lift)
        if (showVectors) {
          // Gravitational Downward Arrow
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px, py + 30);
          ctx.strokeStyle = "#ef4444";
          ctx.lineWidth = 2;
          ctx.stroke();

          // Magnetic Lift Upward Arrow
          if (isSuperconducting) {
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(px, py - 35 * orderParameter);
            ctx.strokeStyle = "#38bdf8";
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        }

        ctx.restore();
      });

      // Draw Thermal Quench Sparks
      simStateRef.current.sparkParticles.forEach((sp) => {
        const px = centerX + sp.x;
        const py = centerY + sp.y - sp.z;
        ctx.save();
        ctx.beginPath();
        ctx.arc(px, py, 2.5 * sp.life, 0, Math.PI * 2);
        ctx.fillStyle = sp.color;
        ctx.shadowColor = sp.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
      });

      // Update Telemetry state periodically
      const primaryPuck = pucks[0];
      const currentHeight = Math.round(primaryPuck.z * 10) / 10;
      const currentForce = Math.round(primaryPuck.z * 0.42 * orderParameter * 100) / 100;
      const vortexCount = primaryPuck.vortices.length;

      setTelemetry({
        height: currentHeight,
        pinningForce: currentForce,
        gapEnergy: Math.round(orderParameter * 100) / 100,
        vortexCount: isSuperconducting ? vortexCount : 0,
        isSuperconducting,
      });

      animFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameRef.current = requestAnimationFrame(renderLoop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [
    temperature,
    theme,
    material,
    presetKey,
    pinningDefects,
    magneticFieldStrength,
    showFieldLines,
    showVortices,
    showVapor,
    showVectors,
    isPaused,
    calculateSuperconductingState,
    updateAudio,
    triggerSoundPulse,
  ]);

  // Handle Canvas Mouse Drag / Interaction
  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left - canvas.width / 2;
    const my = e.clientY - rect.top - canvas.height / 2 + 30;

    // Check if clicked on Superconducting Puck
    const pucks = simStateRef.current.pucks;
    for (let i = 0; i < pucks.length; i++) {
      const puck = pucks[i];
      const px = puck.x;
      const py = puck.y - puck.z;
      const dist = Math.hypot(mx - px, my - py);
      if (dist <= puck.radius + 5) {
        simStateRef.current.draggedPuckIndex = i;
        simStateRef.current.isDragging = true;
        simStateRef.current.dragOffset = { x: mx - puck.x, y: my - (puck.y - puck.z) };
        return;
      }
    }

    // Check if clicked on Magnet (for Custom Designer Mode)
    if (presetKey === "customDesigner") {
      const magnets = simStateRef.current.magnets;
      for (let i = 0; i < magnets.length; i++) {
        const mag = magnets[i];
        const dist = Math.hypot(mx - mag.x, my - mag.y);
        if (dist <= 25) {
          simStateRef.current.draggedMagnetIndex = i;
          simStateRef.current.isDragging = true;
          return;
        }
      }

      // Place new magnet if active tool selected
      if (activeTool === "north" || activeTool === "south") {
        const newPolarity = activeTool === "north" ? 1 : -1;
        const newMagnet = {
          id: Date.now(),
          x: mx,
          y: my,
          polarity: newPolarity,
          strength: 1.8,
          type: "custom",
        };
        simStateRef.current.magnets.push(newMagnet);
        triggerSoundPulse("fluxSnap");
      }
    }
  };

  const handleMouseMove = (e) => {
    if (!simStateRef.current.isDragging) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left - canvas.width / 2;
    const my = e.clientY - rect.top - canvas.height / 2 + 30;

    // Drag Puck
    if (simStateRef.current.draggedPuckIndex >= 0) {
      const puck = simStateRef.current.pucks[simStateRef.current.draggedPuckIndex];
      puck.x = mx - simStateRef.current.dragOffset.x;
      puck.y = my - simStateRef.current.dragOffset.y + puck.z;
      puck.vx = 0;
      puck.vy = 0;
    }

    // Drag Magnet
    if (simStateRef.current.draggedMagnetIndex >= 0) {
      const mag = simStateRef.current.magnets[simStateRef.current.draggedMagnetIndex];
      mag.x = mx;
      mag.y = my;
    }
  };

  const handleMouseUp = () => {
    simStateRef.current.isDragging = false;
    simStateRef.current.draggedPuckIndex = -1;
    simStateRef.current.draggedMagnetIndex = -1;
  };

  // Quick Cryo Chill Shortcuts
  const chillLiquidNitrogen = () => setTemperature(77);
  const chillLiquidHelium = () => setTemperature(4);
  const triggerThermalQuench = () => {
    setTemperature(130);
    triggerSoundPulse("quench");
  };

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 transition-colors duration-300 font-sans`}>
      <div className="max-w-7xl mx-auto space-y-6" ref={containerRef}>
        {/* Header Section */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl">
          <div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 text-xs font-bold rounded-full border ${theme.badge} uppercase tracking-wider`}>
                Type-II Quantum Physics
              </span>
              <span className="text-xs text-slate-400 font-mono">T_c = {material.tc}K</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Superconducting Flux Pinning & Quantum Levitation Lab
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Explore high-temperature quantum levitation, Abrikosov flux vortex pinning, and thermal quench breakdowns in Type-II superconductors.
            </p>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => {
                setAudioEnabled(!audioEnabled);
                if (!audioEnabled) initAudio();
              }}
              className={`px-4 py-2 text-sm font-semibold rounded-xl border transition-all ${
                audioEnabled ? "bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-lg shadow-cyan-500/20" : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
              }`}
            >
              {audioEnabled ? "🔊 Cryo Audio Active" : "🔇 Enable Audio Synth"}
            </button>
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="px-4 py-2 text-sm font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200"
            >
              {isPaused ? "▶️ Resume" : "⏸️ Pause"}
            </button>
            <button
              onClick={() => initTrackLayout(presetKey)}
              className={`px-4 py-2 text-sm font-semibold rounded-xl ${theme.buttonBg}`}
            >
              🔄 Reset Track
            </button>
          </div>
        </header>

        {/* Main Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Canvas & Interactive Sandbox (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Interactive Canvas Container */}
            <div className="relative rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl group">
              <canvas
                ref={canvasRef}
                width={800}
                height={500}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                className="w-full h-auto cursor-grab active:cursor-grabbing block"
              />

              {/* Status Badge Overlays */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2 pointer-events-none">
                <div
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold backdrop-blur-md border ${
                    telemetry.isSuperconducting
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : "bg-red-500/20 text-red-300 border-red-500/40"
                  }`}
                >
                  {telemetry.isSuperconducting ? "⚡ SUPERCONDUCTING STATE" : "🔥 NORMAL STATE (QUENCHED)"}
                </div>
                <div className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-slate-900/80 text-cyan-300 border border-cyan-500/30 backdrop-blur-md">
                  T = {temperature}K ({Math.round(temperature - 273.15)}°C)
                </div>
              </div>

              {/* Instruction Hint */}
              <div className="absolute bottom-4 left-4 right-4 pointer-events-none flex justify-between items-center text-xs text-slate-400 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 backdrop-blur-md">
                <span>💡 Drag superconducting puck or magnets to feel quantum flux restoring forces!</span>
                <span className="font-mono text-cyan-400">Clearance: {telemetry.height} mm</span>
              </div>
            </div>

            {/* Cryogenic Quick Action Bar */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cryogenic Thermal Controls:</span>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={chillLiquidNitrogen}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60 transition-all"
                >
                  ❄️ Chill to 77K (Liquid N₂)
                </button>
                <button
                  onClick={chillLiquidHelium}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-950/60 border border-blue-500/40 text-blue-300 hover:bg-blue-900/60 transition-all"
                >
                  🧊 Chill to 4K (Liquid He)
                </button>
                <button
                  onClick={triggerThermalQuench}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 hover:bg-red-900/60 transition-all"
                >
                  🔥 Quench Trigger ({material.tc + 20}K)
                </button>
              </div>
            </div>

            {/* Real-time Oscilloscope Telemetry Panel */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  Quantum Flux & Levitation Telemetry
                </h3>
                <span className="text-xs font-mono text-slate-400">Order Parameter Ψ(T): {telemetry.gapEnergy}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-xs text-slate-400">Levitation Height</div>
                  <div className="text-lg font-bold font-mono text-cyan-400 mt-1">{telemetry.height} mm</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-xs text-slate-400">Pinning Force</div>
                  <div className="text-lg font-bold font-mono text-emerald-400 mt-1">{telemetry.pinningForce} N</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-xs text-slate-400">Abrikosov Vortices</div>
                  <div className="text-lg font-bold font-mono text-purple-400 mt-1">{telemetry.vortexCount}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-xs text-slate-400">Critical Temp (Tc)</div>
                  <div className="text-lg font-bold font-mono text-amber-400 mt-1">{material.tc} K</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Control Panels (4 Cols) */}
          <div className="lg:col-span-4 space-y-5">
            {/* Presets Selector Panel */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md space-y-3">
              <h3 className="text-sm font-bold text-slate-200">Track & Sandbox Presets</h3>
              <div className="space-y-2">
                {TRACK_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setPresetKey(preset.id)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                      presetKey === preset.id
                        ? `${theme.cardBg} border-cyan-500/50 text-white font-semibold shadow-lg`
                        : "bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                    }`}
                  >
                    <div className="font-bold text-sm text-slate-200">{preset.name}</div>
                    <div className="text-slate-400 mt-1 text-xs">{preset.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Designer Tools (if custom preset active) */}
            {presetKey === "customDesigner" && (
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/30 backdrop-blur-md space-y-3">
                <h3 className="text-sm font-bold text-cyan-400">Magnet Designer Tools</h3>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setActiveTool("north")}
                    className={`p-2 rounded-xl border text-xs font-bold ${
                      activeTool === "north" ? "bg-blue-600 border-blue-400 text-white" : "bg-slate-800 border-slate-700 text-slate-300"
                    }`}
                  >
                    + North Pole
                  </button>
                  <button
                    onClick={() => setActiveTool("south")}
                    className={`p-2 rounded-xl border text-xs font-bold ${
                      activeTool === "south" ? "bg-red-600 border-red-400 text-white" : "bg-slate-800 border-slate-700 text-slate-300"
                    }`}
                  >
                    + South Pole
                  </button>
                  <button
                    onClick={() => {
                      simStateRef.current.magnets = [];
                    }}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold"
                  >
                    🧹 Clear All
                  </button>
                </div>
              </div>
            )}

            {/* Material & Physics Properties Slider Panel */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md space-y-4">
              <h3 className="text-sm font-bold text-slate-200">Superconductor & Field Tuning</h3>

              {/* Material Selection */}
              <div>
                <label className="text-xs text-slate-400 block mb-1">Superconducting Material</label>
                <select
                  value={materialKey}
                  onChange={(e) => setMaterialKey(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  {Object.entries(SUPERCONDUCTOR_MATERIALS).map(([key, mat]) => (
                    <option key={key} value={key}>
                      {mat.name} ({mat.type})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">{material.desc}</p>
              </div>

              {/* Temperature Slider */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Cryogenic Temp (K)</span>
                  <span className="font-mono text-cyan-400">{temperature} K</span>
                </div>
                <input
                  type="range"
                  min={4}
                  max={ material.tc + 40 }
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              {/* Magnetic Field Strength Slider */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Magnetic Field (B-Field)</span>
                  <span className="font-mono text-cyan-400">{magneticFieldStrength} Tesla</span>
                </div>
                <input
                  type="range"
                  min={0.2}
                  max={3.5}
                  step={0.1}
                  value={magneticFieldStrength}
                  onChange={(e) => setMagneticFieldStrength(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              {/* Pinning Defect Density Slider */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Flux Pinning Impurity Density</span>
                  <span className="font-mono text-cyan-400">{Math.round(pinningDefects * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={1.0}
                  step={0.05}
                  value={pinningDefects}
                  onChange={(e) => setPinningDefects(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Visualizer Layer Overlay Toggles */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md space-y-3">
              <h3 className="text-sm font-bold text-slate-200">Visual Overlays & Color Themes</h3>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={showFieldLines}
                    onChange={(e) => setShowFieldLines(e.target.checked)}
                    className="accent-cyan-500"
                  />
                  <span>B-Field Lines</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={showVortices}
                    onChange={(e) => setShowVortices(e.target.checked)}
                    className="accent-cyan-500"
                  />
                  <span>Flux Vortices</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={showVapor}
                    onChange={(e) => setShowVapor(e.target.checked)}
                    className="accent-cyan-500"
                  />
                  <span>LN₂ Boil Vapor</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={showVectors}
                    onChange={(e) => setShowVectors(e.target.checked)}
                    className="accent-cyan-500"
                  />
                  <span>Force Vectors</span>
                </label>
              </div>

              {/* Theme Palette Dropdown */}
              <div className="pt-2">
                <label className="text-xs text-slate-400 block mb-1">Aesthetic Theme Palette</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(THEMES).map(([key, item]) => (
                    <button
                      key={key}
                      onClick={() => setThemeKey(key)}
                      className={`p-2 text-xs font-semibold rounded-xl border text-center transition-all ${
                        themeKey === key
                          ? `${item.badge} border-cyan-400 shadow-md`
                          : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quantum Physics Educational Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-950/30 via-slate-900 to-slate-950 border border-cyan-500/20 backdrop-blur-md space-y-2">
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Physics Fact Sheet</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                In <strong>Type-II Superconductors</strong>, magnetic fields penetrate as quantized magnetic flux tubes called <em>Abrikosov Vortices</em>. Defect sites pin these vortices, creating a 3D magnetic lock that allows frictionless levitation upside-down or sideways!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
