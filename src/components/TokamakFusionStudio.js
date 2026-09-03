import React, { useState, useEffect, useRef, useCallback } from "react";

// Themes & Visual Design Tokens
const THEMES = {
  tokamakCyan: {
    id: "tokamakCyan",
    name: "Tokamak Arc Cyan",
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    accentText: "text-cyan-400",
    border: "border-cyan-500/30",
    cardBg: "bg-slate-900/85 backdrop-blur-md border-cyan-500/20",
    buttonBg: "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25",
    canvasBg: "#030a14",
    plasmaCore: "#00f0ff",
    plasmaGlow: "#3b82f6",
    neutronColor: "#fbbf24",
    alphaColor: "#f43f5e",
    coilColor: "#0ea5e9",
    fieldLineColor: "rgba(6, 182, 212, 0.25)",
    divertorColor: "#a855f7",
  },
  thermonuclearSolar: {
    id: "thermonuclearSolar",
    name: "Thermonuclear Solar",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    accentText: "text-amber-400",
    border: "border-amber-500/30",
    cardBg: "bg-slate-900/85 backdrop-blur-md border-amber-500/20",
    buttonBg: "bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white shadow-lg shadow-amber-500/25",
    canvasBg: "#140702",
    plasmaCore: "#f59e0b",
    plasmaGlow: "#f43f5e",
    neutronColor: "#ffffff",
    alphaColor: "#fb923c",
    coilColor: "#d97706",
    fieldLineColor: "rgba(245, 158, 11, 0.25)",
    divertorColor: "#ef4444",
  },
  ultravioletFusion: {
    id: "ultravioletFusion",
    name: "Ultraviolet Fusion",
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    accentText: "text-purple-400",
    border: "border-purple-500/30",
    cardBg: "bg-slate-900/85 backdrop-blur-md border-purple-500/20",
    buttonBg: "bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white shadow-lg shadow-purple-500/25",
    canvasBg: "#090414",
    plasmaCore: "#c084fc",
    plasmaGlow: "#e879f9",
    neutronColor: "#38bdf8",
    alphaColor: "#f0abfc",
    coilColor: "#9333ea",
    fieldLineColor: "rgba(168, 85, 247, 0.25)",
    divertorColor: "#ec4899",
  },
  emeraldMatrix: {
    id: "emeraldMatrix",
    name: "Superconducting Emerald",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    accentText: "text-emerald-400",
    border: "border-emerald-500/30",
    cardBg: "bg-slate-900/85 backdrop-blur-md border-emerald-500/20",
    buttonBg: "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25",
    canvasBg: "#02120a",
    plasmaCore: "#10b981",
    plasmaGlow: "#34d399",
    neutronColor: "#fde047",
    alphaColor: "#a3e635",
    coilColor: "#059669",
    fieldLineColor: "rgba(16, 185, 129, 0.25)",
    divertorColor: "#14b8a6",
  },
};

// Physics Presets
const PRESETS = {
  iterHMode: {
    id: "iterHMode",
    name: "ITER H-Mode Baseline",
    formula: "Q ≥ 10.0 | B_T = 5.3 T | I_p = 15.0 MA",
    desc: "Standard high-confinement mode with ELM suppression & stable magnetic flux surfaces.",
    toroidalField: 5.3,
    plasmaCurrent: 15.0,
    auxPower: 50,
    fuelRate: 75,
    elongation: 1.85,
    triangularity: 0.49,
  },
  kinkInstability: {
    id: "kinkInstability",
    name: "MHD Kink Disruption",
    formula: "q_95 < 2.0 | Disruption Instability",
    desc: "High plasma current triggers helical field twisting, safety factor drop, and edge flare ejection.",
    toroidalField: 2.1,
    plasmaCurrent: 14.8,
    auxPower: 30,
    fuelRate: 90,
    elongation: 2.1,
    triangularity: 0.2,
  },
  alphaIgnition: {
    id: "alphaIgnition",
    name: "Self-Sustaining Alpha Ignition",
    formula: "Q > 25.0 | P_alpha >> P_aux",
    desc: "3.5 MeV alpha particles trap inside magnetic bottle, heating plasma self-sufficiently without RF.",
    toroidalField: 7.2,
    plasmaCurrent: 18.0,
    auxPower: 10,
    fuelRate: 95,
    elongation: 1.9,
    triangularity: 0.55,
  },
  sphericalTokamak: {
    id: "sphericalTokamak",
    name: "Compact Spherical Tokamak (ST)",
    formula: "A = R/a ≈ 1.4 | High Plasma Beta β_t",
    desc: "Low aspect ratio spherical torus enabling ultra-high efficiency plasma confinement.",
    toroidalField: 3.5,
    plasmaCurrent: 12.0,
    auxPower: 65,
    fuelRate: 80,
    elongation: 2.4,
    triangularity: 0.65,
  },
  negativeTriangularity: {
    id: "negativeTriangularity",
    name: "Negative Triangularity Shaping",
    formula: "δ = -0.35 | ELM-Free Regime",
    desc: "Inverted D-shaped cross section suppressing edge localized modes while preserving H-mode heat retention.",
    toroidalField: 5.8,
    plasmaCurrent: 13.5,
    auxPower: 45,
    fuelRate: 70,
    elongation: 1.7,
    triangularity: -0.35,
  },
};

export default function TokamakFusionStudio() {
  // Config & State Controls
  const [activeTheme, setActiveTheme] = useState("tokamakCyan");
  const [activePreset, setActivePreset] = useState("iterHMode");

  const [toroidalField, setToroidalField] = useState(PRESETS.iterHMode.toroidalField); // Tesla (1.0 to 10.0)
  const [plasmaCurrent, setPlasmaCurrent] = useState(PRESETS.iterHMode.plasmaCurrent); // MA (1.0 to 20.0)
  const [auxPower, setAuxPower] = useState(PRESETS.iterHMode.auxPower); // MW (0 to 100)
  const [fuelRate, setFuelRate] = useState(PRESETS.iterHMode.fuelRate); // % (10 to 100)
  const [elongation, setElongation] = useState(PRESETS.iterHMode.elongation); // kappa (1.0 to 2.5)
  const [triangularity, setTriangularity] = useState(PRESETS.iterHMode.triangularity); // delta (-0.5 to 0.7)

  // Simulation View Toggles
  const [showFieldLines, setShowFieldLines] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showNeutrons, setShowNeutrons] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Diagnostic Metrics State
  const [qFactor, setQFactor] = useState(10.2);
  const [coreTemp, setCoreTemp] = useState(15.4); // keV
  const [fusionPower, setFusionPower] = useState(510); // MW
  const [lawsonValue, setLawsonValue] = useState(3.4); // 10^20 m^-3 s keV
  const [isDisrupted, setIsDisrupted] = useState(false);

  // Canvas Refs
  const mainCanvasRef = useRef(null);
  const diagCanvasRef = useRef(null);

  // Animation Physics State Ref
  const simRef = useRef({
    particles: [],
    neutrons: [],
    alphaParticles: [],
    pellets: [],
    disruptionFlares: [],
    divertorParticles: [],
    time: 0,
    mousePos: { x: -1000, y: -1000 },
    isHovering: false,
    disruptionTimer: 0,
  });

  const theme = THEMES[activeTheme];

  // Apply Preset Values
  const applyPreset = (presetKey) => {
    const p = PRESETS[presetKey];
    if (!p) return;
    setActivePreset(presetKey);
    setToroidalField(p.toroidalField);
    setPlasmaCurrent(p.plasmaCurrent);
    setAuxPower(p.auxPower);
    setFuelRate(p.fuelRate);
    setElongation(p.elongation);
    setTriangularity(p.triangularity);
    setIsDisrupted(presetKey === "kinkInstability");
  };

  // Trigger Pellet Injection
  const injectPellet = useCallback(() => {
    const sim = simRef.current;
    sim.pellets.push({
      x: 100,
      y: 250,
      vx: 8,
      vy: (Math.random() - 0.5) * 2,
      radius: 6,
      life: 0,
    });
  }, []);

  // Trigger Disruption Event
  const triggerDisruption = useCallback(() => {
    const sim = simRef.current;
    sim.disruptionTimer = 180; // 3 seconds at 60fps
    setIsDisrupted(true);
  }, []);

  // Trigger Divertor Sweep
  const triggerDivertorSweep = useCallback(() => {
    const sim = simRef.current;
    for (let i = 0; i < 40; i++) {
      sim.divertorParticles.push({
        x: 400 + (Math.random() - 0.5) * 120,
        y: 250 + (Math.random() - 0.5) * 50,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() > 0.5 ? 6 + Math.random() * 4 : -(6 + Math.random() * 4),
        life: 1.0,
      });
    }
  }, []);

  // Initialize Particles
  useEffect(() => {
    const count = 350;
    const particles = [];
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 2;
      const rRel = Math.random();
      particles.push({
        theta,
        phi,
        rRel,
        speed: 0.02 + Math.random() * 0.03,
        type: i % 2 === 0 ? "deuterium" : "tritium",
        size: 1.5 + Math.random() * 1.5,
      });
    }
    simRef.current.particles = particles;
  }, []);

  // Main Render & Physics Loop
  useEffect(() => {
    let animationFrameId;

    const render = () => {
      if (!isPaused) {
        simRef.current.time += 0.016;
      }
      const sim = simRef.current;
      const t = sim.time;

      // Handle Disruption Timer Decay
      if (sim.disruptionTimer > 0) {
        sim.disruptionTimer--;
        if (sim.disruptionTimer === 0) {
          setIsDisrupted(false);
        }
      }

      // Physics Math Calculations
      const safetyFactor = (5 * Math.pow(toroidalField, 1.1)) / (plasmaCurrent + 0.1);
      const tempKev = Math.min(
        35,
        (auxPower * 0.18 + fuelRate * 0.08 + toroidalField * 1.2) * (isDisrupted ? 0.25 : 1.0)
      );
      const pFusion = Math.max(
        0,
        Math.pow(tempKev / 14.5, 2.2) * (fuelRate * 4.5) * (toroidalField * 0.8) * (isDisrupted ? 0.05 : 1.0)
      );
      const qVal = auxPower > 0 ? pFusion / (auxPower + 1e-3) : pFusion / 0.5;
      const lawson = (tempKev * 0.15 * (fuelRate * 0.8) * (toroidalField * 0.4)).toFixed(2);

      setCoreTemp(tempKev.toFixed(1));
      setFusionPower(Math.round(pFusion));
      setQFactor(parseFloat(qVal.toFixed(2)));
      setLawsonValue(lawson);

      // --- MAIN CANVAS DRAWING ---
      const canvas = mainCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        const w = canvas.width;
        const h = canvas.height;
        const cx = w / 2;
        const cy = h / 2;

        // Clear Canvas
        ctx.fillStyle = theme.canvasBg;
        ctx.fillRect(0, 0, w, h);

        // Draw Background Grid Lines
        ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
        ctx.lineWidth = 1;
        const gridSize = 40;
        for (let x = 0; x < w; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
        for (let y = 0; y < h; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }

        // Toroidal Chamber Dimensions (3D Isometric Projection)
        const R0 = 170; // Major Radius
        const r0 = 70; // Minor Radius

        // Draw Magnetic D-Shaped Toroidal Field Coils (TF Coils)
        const coilCount = 12;
        for (let i = 0; i < coilCount; i++) {
          const angle = (i / coilCount) * Math.PI * 2 + t * 0.1;
          const coilX = cx + Math.cos(angle) * R0 * 0.85;
          const coilY = cy + Math.sin(angle) * R0 * 0.35;
          const scale = 0.75 + Math.sin(angle) * 0.25;

          ctx.save();
          ctx.translate(coilX, coilY);
          ctx.scale(scale, scale * elongation);

          // D-Shaped Coil Path
          ctx.beginPath();
          ctx.ellipse(0, 0, r0 * 1.3, r0 * (1.1 + triangularity * 0.2), 0, 0, Math.PI * 2);
          ctx.strokeStyle = theme.coilColor;
          ctx.lineWidth = 3 / scale;
          ctx.shadowColor = theme.coilColor;
          ctx.shadowBlur = 10;
          ctx.globalAlpha = 0.25 + (Math.sin(angle) + 1) * 0.25;
          ctx.stroke();
          ctx.restore();
        }

        // Draw Heatmap Overlay Mode
        if (showHeatmap) {
          const heatGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, R0 + r0);
          heatGrad.addColorStop(0, "rgba(255, 50, 50, 0.45)");
          heatGrad.addColorStop(0.4, "rgba(255, 180, 0, 0.3)");
          heatGrad.addColorStop(0.7, "rgba(0, 240, 255, 0.15)");
          heatGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = heatGrad;
          ctx.beginPath();
          ctx.arc(cx, cy, R0 + r0, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw Concentric Helical Field Lines
        if (showFieldLines) {
          const fluxSurfaces = 5;
          for (let f = 1; f <= fluxSurfaces; f++) {
            const rFrac = (f / fluxSurfaces) * r0;
            ctx.beginPath();
            for (let a = 0; a <= Math.PI * 2; a += 0.08) {
              const rotA = a + t * (0.8 + (plasmaCurrent / 20) * 1.2);
              const x3d = (R0 + rFrac * Math.cos(rotA * safetyFactor)) * Math.cos(a);
              const y3d = (R0 + rFrac * Math.cos(rotA * safetyFactor)) * Math.sin(a) * 0.45;
              const z3d = rFrac * Math.sin(rotA * safetyFactor) * elongation;

              const px = cx + x3d;
              const py = cy + y3d - z3d * 0.3;

              if (a === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.strokeStyle = theme.fieldLineColor;
            ctx.lineWidth = f === fluxSurfaces ? 1.5 : 1.0;
            ctx.setLineDash(f % 2 === 0 ? [4, 4] : []);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }

        // Draw Core Plasma Glow (Torus Body)
        ctx.save();
        ctx.shadowColor = theme.plasmaCore;
        ctx.shadowBlur = isDisrupted ? 35 : 25;

        // Torus Ring Glow Path
        ctx.beginPath();
        for (let a = 0; a <= Math.PI * 2; a += 0.05) {
          const wave = sim.disruptionTimer > 0 ? Math.sin(a * 8 + t * 20) * 18 : Math.sin(a * 4 + t * 2) * 3;
          const px = cx + (R0 + wave) * Math.cos(a);
          const py = cy + (R0 + wave) * Math.sin(a) * 0.45;

          if (a === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.lineWidth = r0 * 0.8 * (elongation * 0.65);
        ctx.strokeStyle = isDisrupted ? "rgba(239, 68, 68, 0.7)" : theme.plasmaGlow;
        ctx.globalAlpha = 0.55;
        ctx.stroke();

        // Inner Core Intense Beam
        ctx.lineWidth = r0 * 0.3;
        ctx.strokeStyle = isDisrupted ? "#ffffff" : theme.plasmaCore;
        ctx.globalAlpha = 0.85;
        ctx.stroke();
        ctx.restore();

        // Draw Plasma Particles (Ions & Electrons)
        sim.particles.forEach((p) => {
          if (!isPaused) {
            p.phi += p.speed * (1 + plasmaCurrent / 10);
            p.theta += p.speed * safetyFactor;
          }

          const rCurrent = p.rRel * r0;
          const x3d = (R0 + rCurrent * Math.cos(p.theta)) * Math.cos(p.phi);
          const y3d = (R0 + rCurrent * Math.cos(p.theta)) * Math.sin(p.phi) * 0.45;
          const z3d = rCurrent * Math.sin(p.theta) * elongation;

          const px = cx + x3d;
          const py = cy + y3d - z3d * 0.35;

          ctx.beginPath();
          ctx.arc(px, py, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.type === "deuterium" ? theme.plasmaCore : "#ffffff";
          ctx.globalAlpha = 0.8;
          ctx.fill();

          // Spawn DT Fusion Events (Generating Alpha Particles + Neutrons)
          if (!isPaused && Math.random() < (tempKev / 35) * 0.08 && showNeutrons) {
            // High Energy 14.1 MeV Neutron (Unconfined escapes straight outward)
            const nAngle = Math.random() * Math.PI * 2;
            sim.neutrons.push({
              x: px,
              y: py,
              vx: Math.cos(nAngle) * (6 + Math.random() * 4),
              vy: Math.sin(nAngle) * (6 + Math.random() * 4),
              life: 1.0,
            });

            // 3.5 MeV Alpha Particle (Trapped in plasma magnetic bottle)
            sim.alphaParticles.push({
              x: px,
              y: py,
              radius: 12 + Math.random() * 10,
              life: 1.0,
            });
          }
        });

        // Render Escaping High-Energy Neutrons
        for (let i = sim.neutrons.length - 1; i >= 0; i--) {
          const n = sim.neutrons[i];
          if (!isPaused) {
            n.x += n.vx;
            n.y += n.vy;
            n.life -= 0.025;
          }
          if (n.life <= 0) {
            sim.neutrons.splice(i, 1);
            continue;
          }
          ctx.beginPath();
          ctx.arc(n.x, n.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = theme.neutronColor;
          ctx.shadowColor = theme.neutronColor;
          ctx.shadowBlur = 8;
          ctx.globalAlpha = n.life;
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Render Alpha Particle Heating Flares
        for (let i = sim.alphaParticles.length - 1; i >= 0; i--) {
          const aP = sim.alphaParticles[i];
          if (!isPaused) {
            aP.life -= 0.04;
          }
          if (aP.life <= 0) {
            sim.alphaParticles.splice(i, 1);
            continue;
          }
          ctx.beginPath();
          ctx.arc(aP.x, aP.y, aP.radius * (1 - aP.life * 0.5), 0, Math.PI * 2);
          ctx.strokeStyle = theme.alphaColor;
          ctx.lineWidth = 2 * aP.life;
          ctx.globalAlpha = aP.life * 0.7;
          ctx.stroke();
        }

        // Render Injecting Cryogenic Fuel Pellets
        for (let i = sim.pellets.length - 1; i >= 0; i--) {
          const pel = sim.pellets[i];
          pel.x += pel.vx;
          pel.y += pel.vy;
          pel.life += 0.03;

          ctx.beginPath();
          ctx.arc(pel.x, pel.y, pel.radius, 0, Math.PI * 2);
          ctx.fillStyle = "#38bdf8";
          ctx.shadowColor = "#00f0ff";
          ctx.shadowBlur = 15;
          ctx.fill();

          // Pellet Ablation Vapor Cloud
          ctx.beginPath();
          ctx.arc(pel.x, pel.y, pel.radius * 3 * pel.life, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(0, 240, 255, 0.3)";
          ctx.fill();

          if (pel.x > cx) {
            // Core Pellet Explosion Burst
            for (let k = 0; k < 25; k++) {
              const burstAng = Math.random() * Math.PI * 2;
              sim.particles.push({
                theta: burstAng,
                phi: Math.random() * Math.PI * 2,
                rRel: Math.random() * 0.4,
                speed: 0.04,
                type: k % 2 === 0 ? "deuterium" : "tritium",
                size: 2,
              });
            }
            sim.pellets.splice(i, 1);
          }
        }

        // Render Divertor Purge Exhaust Particles
        for (let i = sim.divertorParticles.length - 1; i >= 0; i--) {
          const dp = sim.divertorParticles[i];
          dp.x += dp.vx;
          dp.y += dp.vy;
          dp.life -= 0.02;

          if (dp.life <= 0) {
            sim.divertorParticles.splice(i, 1);
            continue;
          }
          ctx.beginPath();
          ctx.arc(dp.x, dp.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = theme.divertorColor;
          ctx.shadowColor = theme.divertorColor;
          ctx.shadowBlur = 10;
          ctx.globalAlpha = dp.life;
          ctx.fill();
        }

        // Draw Divertor Target Plates (Top & Bottom Heat Exhaust Baffles)
        ctx.fillStyle = "#334155";
        ctx.strokeStyle = theme.divertorColor;
        ctx.lineWidth = 2;

        // Top Divertor
        ctx.beginPath();
        ctx.rect(cx - 90, 40, 180, 12);
        ctx.fill();
        ctx.stroke();

        // Bottom Divertor
        ctx.beginPath();
        ctx.rect(cx - 90, h - 52, 180, 12);
        ctx.fill();
        ctx.stroke();

        // Mouse Diagnostic HUD Inspection Probe
        if (sim.isHovering) {
          const mx = sim.mousePos.x;
          const my = sim.mousePos.y;
          const distToCenter = Math.hypot(mx - cx, my - cy);

          ctx.beginPath();
          ctx.arc(mx, my, 18, 0, Math.PI * 2);
          ctx.strokeStyle = "#38bdf8";
          ctx.setLineDash([3, 3]);
          ctx.stroke();
          ctx.setLineDash([]);

          // Probe Diagnostic Box
          const probeB = (toroidalField * (R0 / (distToCenter + 1e-2))).toFixed(2);
          const probeNe = ((fuelRate * 1.2 * Math.exp(-distToCenter / 200)).toFixed(1));

          ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
          ctx.strokeStyle = "#38bdf8";
          ctx.lineWidth = 1;
          ctx.fillRect(mx + 25, my - 35, 140, 60);
          ctx.strokeRect(mx + 25, my - 35, 140, 60);

          ctx.fillStyle = "#38bdf8";
          ctx.font = "11px sans-serif";
          ctx.fillText(`Diagnostic Probe`, mx + 32, my - 20);
          ctx.fillStyle = "#e2e8f0";
          ctx.fillText(`B-Field: ${probeB} T`, mx + 32, my - 6);
          ctx.fillText(`Density: ${probeNe}×10²⁰ m⁻³`, mx + 32, my + 8);
        }
      }

      // --- SECONDARY POLOIDAL DIAGNOSTIC CANVAS ---
      const diagCanvas = diagCanvasRef.current;
      if (diagCanvas) {
        const dCtx = diagCanvas.getContext("2d");
        const dw = diagCanvas.width;
        const dh = diagCanvas.height;

        dCtx.fillStyle = "#090d16";
        dCtx.fillRect(0, 0, dw, dh);

        // Poloidal Cross Section D-Shape
        const pcx = dw / 2;
        const pcy = dh / 2 - 15;
        const prx = 55;
        const pry = 55 * elongation;

        dCtx.beginPath();
        for (let a = 0; a <= Math.PI * 2; a += 0.05) {
          const px = pcx + prx * Math.cos(a + triangularity * Math.sin(a));
          const py = pcy + pry * Math.sin(a);
          if (a === 0) dCtx.moveTo(px, py);
          else dCtx.lineTo(px, py);
        }
        dCtx.strokeStyle = theme.plasmaCore;
        dCtx.lineWidth = 2;
        dCtx.shadowColor = theme.plasmaCore;
        dCtx.shadowBlur = 12;
        dCtx.stroke();
        dCtx.shadowBlur = 0;

        // Core Separatrix X-Point (Magnetic Null)
        dCtx.beginPath();
        dCtx.moveTo(pcx - 30, pcy + pry + 15);
        dCtx.lineTo(pcx, pcy + pry - 5);
        dCtx.lineTo(pcx + 30, pcy + pry + 15);
        dCtx.strokeStyle = theme.divertorColor;
        dCtx.lineWidth = 1.5;
        dCtx.stroke();

        // Electron Temperature Profile Graph T(r)
        const gy = dh - 45;
        dCtx.strokeStyle = "rgba(255,255,255,0.15)";
        dCtx.lineWidth = 1;
        dCtx.beginPath();
        dCtx.moveTo(20, gy);
        dCtx.lineTo(dw - 20, gy);
        dCtx.stroke();

        dCtx.beginPath();
        for (let x = 20; x <= dw - 20; x++) {
          const normR = Math.abs(x - dw / 2) / (dw / 2 - 20);
          const profileT = tempKev * Math.pow(Math.max(0, 1 - normR * normR), 2);
          const py = gy - (profileT / 35) * 35;
          if (x === 20) dCtx.moveTo(x, py);
          else dCtx.lineTo(x, py);
        }
        dCtx.strokeStyle = "#38bdf8";
        dCtx.lineWidth = 2;
        dCtx.stroke();

        dCtx.fillStyle = "#94a3b8";
        dCtx.font = "10px sans-serif";
        dCtx.fillText("Te Profile T(r)", 25, gy - 28);
        dCtx.fillText(`${tempKev.toFixed(1)} keV`, dw - 65, gy - 28);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    isPaused,
    theme,
    toroidalField,
    plasmaCurrent,
    auxPower,
    fuelRate,
    elongation,
    triangularity,
    showFieldLines,
    showHeatmap,
    showNeutrons,
    isDisrupted,
  ]);

  // Canvas Mouse Move Handlers
  const handleMouseMove = (e) => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    simRef.current.mousePos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    simRef.current.isHovering = true;
  };

  const handleMouseLeave = () => {
    simRef.current.isHovering = false;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Studio Header Card */}
      <div className={`rounded-2xl p-6 mb-8 border ${theme.cardBg} transition-all duration-300 shadow-2xl`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${theme.badge}`}>
                Thermonuclear Fusion Physics
              </span>
              {isDisrupted && (
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
                  ⚠️ MHD PLASMA DISRUPTION
                </span>
              )}
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Thermonuclear Tokamak Fusion Studio
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Simulate high-temperature Deuterium-Tritium plasma magnetic confinement, D-shaped toroidal field flux surfaces, 14.1 MeV fusion neutrons, and real-time energy gain Q-factors.
            </p>
          </div>

          {/* Theme Selector */}
          <div className="flex flex-wrap items-center gap-2">
            {Object.values(THEMES).map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTheme(t.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                  activeTheme === t.id
                    ? `${t.badge} ring-2 ring-cyan-400/30`
                    : "border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 bg-slate-900/50"
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* Real-time Diagnostics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
            <div className="text-xs text-slate-400 font-medium">Energy Gain Q-Factor</div>
            <div className={`text-2xl font-bold ${qFactor >= 10 ? "text-emerald-400" : qFactor >= 1 ? "text-cyan-400" : "text-amber-400"}`}>
              Q = {qFactor}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {qFactor >= 10 ? "Ignition Regime (Q ≥ 10)" : qFactor >= 1 ? "Breakeven Reached (Q ≥ 1)" : "Sub-Breakeven"}
            </div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
            <div className="text-xs text-slate-400 font-medium">Core Temperature (T_e)</div>
            <div className="text-2xl font-bold text-amber-400">{coreTemp} keV</div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              ≈ {(coreTemp * 11.6).toFixed(0)} Million °C
            </div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
            <div className="text-xs text-slate-400 font-medium">DT Fusion Power (P_fus)</div>
            <div className="text-2xl font-bold text-cyan-400">{fusionPower} MW</div>
            <div className="text-[10px] text-slate-500 mt-0.5">14.1 MeV Neutrons + 3.5 MeV Alphas</div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
            <div className="text-xs text-slate-400 font-medium">Lawson Triple Product</div>
            <div className="text-2xl font-bold text-purple-400">{lawsonValue}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">10²⁰ m⁻³ · s · keV</div>
          </div>
        </div>
      </div>

      {/* Main Studio Interactive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Dual Diagnostic Canvases */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main 3D Toroidal Vacuum Chamber Canvas */}
          <div className={`rounded-2xl p-4 border ${theme.cardBg} relative overflow-hidden shadow-xl`}>
            <div className="flex items-center justify-between mb-3 px-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Toroidal Chamber & Magnetic Bottle Simulation
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => setShowFieldLines(!showFieldLines)}
                  className={`px-2.5 py-1 rounded border transition ${
                    showFieldLines ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40" : "bg-slate-800/60 text-slate-400 border-slate-700"
                  }`}
                >
                  Field Lines
                </button>
                <button
                  onClick={() => setShowHeatmap(!showHeatmap)}
                  className={`px-2.5 py-1 rounded border transition ${
                    showHeatmap ? "bg-amber-500/20 text-amber-300 border-amber-500/40" : "bg-slate-800/60 text-slate-400 border-slate-700"
                  }`}
                >
                  Heat Map
                </button>
                <button
                  onClick={() => setShowNeutrons(!showNeutrons)}
                  className={`px-2.5 py-1 rounded border transition ${
                    showNeutrons ? "bg-purple-500/20 text-purple-300 border-purple-500/40" : "bg-slate-800/60 text-slate-400 border-slate-700"
                  }`}
                >
                  Fusion Sparks
                </button>
              </div>
            </div>

            <div className="relative flex justify-center items-center rounded-xl overflow-hidden bg-slate-950">
              <canvas
                ref={mainCanvasRef}
                width={720}
                height={480}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="w-full h-auto cursor-crosshair block"
              />
              <div className="absolute bottom-3 left-3 text-[11px] text-slate-500 bg-slate-900/80 px-2 py-1 rounded border border-slate-800 pointer-events-none">
                Hover cursor to inspect magnetic flux B(r,θ) & density n_e
              </div>
            </div>

            {/* Quick Action Trigger Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <button
                  onClick={injectPellet}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${theme.buttonBg}`}
                >
                  🧊 Inject Cryo D-T Pellet
                </button>
                <button
                  onClick={triggerDisruption}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-600/30 hover:bg-red-600/50 text-red-300 border border-red-500/40 transition"
                >
                  ⚡ Trigger Disruption Test
                </button>
                <button
                  onClick={triggerDivertorSweep}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/40 transition"
                >
                  💨 Divertor Exhaust Sweep
                </button>
              </div>

              <button
                onClick={() => setIsPaused(!isPaused)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-700 bg-slate-800/60 text-slate-300 hover:text-white"
              >
                {isPaused ? "▶ Resume" : "⏸ Pause"}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Controls, Presets & Secondary Diagnostics */}
        <div className="lg:col-span-4 space-y-6">
          {/* Poloidal Cross-Section Canvas */}
          <div className={`rounded-2xl p-4 border ${theme.cardBg} shadow-xl`}>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              Poloidal Cross-Section & T_e(r) Profile
            </h3>
            <div className="flex justify-center rounded-xl overflow-hidden bg-slate-950 p-1 border border-slate-800">
              <canvas ref={diagCanvasRef} width={280} height={200} className="w-full h-auto block" />
            </div>
          </div>

          {/* Physics Presets Panel */}
          <div className={`rounded-2xl p-5 border ${theme.cardBg} shadow-xl`}>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              Experimental Reactor Presets
            </h3>
            <div className="space-y-2">
              {Object.values(PRESETS).map((p) => (
                <button
                  key={p.id}
                  onClick={() => applyPreset(p.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    activePreset === p.id
                      ? `${theme.badge} bg-slate-800/80 ring-1 ring-cyan-500/40`
                      : "border-slate-800/80 bg-slate-950/40 hover:bg-slate-800/40 text-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-white">{p.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{p.formula}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Physics Parameter Sliders Panel */}
          <div className={`rounded-2xl p-5 border ${theme.cardBg} shadow-xl space-y-4`}>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Magnetohydrodynamic Controls
            </h3>

            {/* Toroidal Field B_T Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Toroidal Field (B_T)</span>
                <span className={theme.accentText}>{toroidalField} Tesla</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="10.0"
                step="0.1"
                value={toroidalField}
                onChange={(e) => setToroidalField(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Plasma Current I_p Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Plasma Current (I_p)</span>
                <span className={theme.accentText}>{plasmaCurrent} MA</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="20.0"
                step="0.5"
                value={plasmaCurrent}
                onChange={(e) => setPlasmaCurrent(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Auxiliary Heating Power Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Auxiliary Heating (RF & NBI)</span>
                <span className={theme.accentText}>{auxPower} MW</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={auxPower}
                onChange={(e) => setAuxPower(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* D-T Fuel Injection Rate Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">D-T Fuel Injection Rate</span>
                <span className={theme.accentText}>{fuelRate}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={fuelRate}
                onChange={(e) => setFuelRate(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Plasma Elongation (kappa) Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Elongation (κ)</span>
                <span className={theme.accentText}>{elongation}</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="2.5"
                step="0.05"
                value={elongation}
                onChange={(e) => setElongation(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Plasma Triangularity (delta) Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Triangularity (δ)</span>
                <span className={theme.accentText}>{triangularity}</span>
              </div>
              <input
                type="range"
                min="-0.5"
                max="0.7"
                step="0.05"
                value={triangularity}
                onChange={(e) => setTriangularity(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
