import React, { useState, useEffect, useRef, useCallback } from "react";

// Color Themes & Aesthetic Design Tokens
const THEMES = {
  warpCyan: {
    id: "warpCyan",
    name: "Subspace Transit (Electric Cyan / Void)",
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    accentText: "text-cyan-400",
    border: "border-cyan-500/30",
    cardBg: "bg-slate-900/85 backdrop-blur-md border-cyan-500/20",
    buttonBg: "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25",
    canvasBg: "#020914",
    gridColor: "rgba(6, 182, 212, 0.15)",
    meshColor: "#00f0ff",
    compressColor: "#38bdf8",
    expandColor: "#ec4899",
    shipColor: "#ffffff",
    photonBlue: "#00f0ff",
    photonRed: "#f43f5e",
  },
  exoticViolet: {
    id: "exoticViolet",
    name: "Tachyon Field (Quantum Violet / Fuchsia)",
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    accentText: "text-purple-400",
    border: "border-purple-500/30",
    cardBg: "bg-slate-900/85 backdrop-blur-md border-purple-500/20",
    buttonBg: "bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white shadow-lg shadow-purple-500/25",
    canvasBg: "#080314",
    gridColor: "rgba(168, 85, 247, 0.15)",
    meshColor: "#c084fc",
    compressColor: "#818cf8",
    expandColor: "#f472b6",
    shipColor: "#ffffff",
    photonBlue: "#a855f7",
    photonRed: "#fb7185",
  },
  solitonAmber: {
    id: "solitonAmber",
    name: "Relativistic Soliton (Amber Crimson)",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    accentText: "text-amber-400",
    border: "border-amber-500/30",
    cardBg: "bg-slate-900/85 backdrop-blur-md border-amber-500/20",
    buttonBg: "bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white shadow-lg shadow-amber-500/25",
    canvasBg: "#140702",
    gridColor: "rgba(245, 158, 11, 0.15)",
    meshColor: "#f59e0b",
    compressColor: "#fbbf24",
    expandColor: "#ef4444",
    shipColor: "#ffffff",
    photonBlue: "#38bdf8",
    photonRed: "#dc2626",
  },
  emeraldChiral: {
    id: "emeraldChiral",
    name: "Chiral Vacuum (Neon Emerald / Matrix)",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    accentText: "text-emerald-400",
    border: "border-emerald-500/30",
    cardBg: "bg-slate-900/85 backdrop-blur-md border-emerald-500/20",
    buttonBg: "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25",
    canvasBg: "#02120a",
    gridColor: "rgba(16, 185, 129, 0.15)",
    meshColor: "#10b981",
    compressColor: "#34d399",
    expandColor: "#f59e0b",
    shipColor: "#ffffff",
    photonBlue: "#00f0ff",
    photonRed: "#f43f5e",
  },
};

// Relativistic Presets
const PRESETS = {
  alcubierreStandard: {
    id: "alcubierreStandard",
    name: "🚀 Alcubierre 1994 Standard Superluminal",
    subtitle: "Classic Superluminal Warp Metric (v_s = 3.0c)",
    formula: "ds^2 = -c^2 dt^2 + (dx - v_s f(r_s) dt)^2 + dy^2 + dz^2",
    desc: "The original warp metric by Miguel Alcubierre (1994). Contracts space ahead and expands space behind, requiring negative exotic energy density concentrated in the bubble wall boundary.",
    warpVelocity: 3.0,
    bubbleRadius: 25.0,
    wallSharpness: 3.5,
    exoticEnergyDensity: -85,
    rayDensity: 40,
  },
  whiteLentz: {
    id: "whiteLentz",
    name: "🛡️ White-Lentz Toroidal Energy Shell",
    subtitle: "Shaped Toroidal Soliton Metric for Reduced Energy Requirements",
    formula: "T_{00} \\sim -\\frac{c^4}{32\\pi G} v_s^2 \\left(\\frac{df}{dr}\\right)^2",
    desc: "Harold White & Erik Lentz modification. Uses a toroidal ring intensity profile to drastically reduce the total negative mass-energy required to maintain the bubble horizon.",
    warpVelocity: 1.2,
    bubbleRadius: 15.0,
    wallSharpness: 6.0,
    exoticEnergyDensity: -35,
    rayDensity: 50,
  },
  subluminalSoliton: {
    id: "subluminalSoliton",
    name: "⚡ Subluminal Relativistic Soliton",
    subtitle: "High-Lorentz Factor Subluminal Spacetime Wave (v_s = 0.85c)",
    formula: "\\gamma = \\frac{1}{\\sqrt{1 - v_s^2/c^2}} = 1.90",
    desc: "A subluminal self-reinforcing spacetime wave packet that avoids causal closed timelike curves while demonstrating intense gravitational light bending and doppler shifts.",
    warpVelocity: 0.85,
    bubbleRadius: 30.0,
    wallSharpness: 2.0,
    exoticEnergyDensity: -45,
    rayDensity: 35,
  },
  vanDenBroeck: {
    id: "vanDenBroeck",
    name: "🌌 Van Den Broeck Micro-Volume Bubble",
    subtitle: "Microscopic Exterior Throat with Macroscopic Interior Volume",
    formula: "ds^2 = -dt^2 + B^2(r_s) [ (dx - v_s f dt)^2 + dy^2 + dz^2 ]",
    desc: "Chris Van Den Broeck (1999) geometry featuring a tiny exterior surface area (reducing total energy by orders of magnitude) coupled to a cavernous interior spatial volume.",
    warpVelocity: 4.5,
    bubbleRadius: 10.0,
    wallSharpness: 8.5,
    exoticEnergyDensity: -95,
    rayDensity: 60,
  },
};

export default function AlcubierreWarpDriveStudio() {
  // Theme & Preset State
  const [selectedTheme, setSelectedTheme] = useState("warpCyan");
  const [selectedPreset, setSelectedPreset] = useState("alcubierreStandard");

  // Physics Control Parameters
  const [warpVelocity, setWarpVelocity] = useState(3.0); // in c
  const [bubbleRadius, setBubbleRadius] = useState(25.0); // meters / relative units
  const [wallSharpness, setWallSharpness] = useState(3.5); // sigma
  const [exoticEnergyDensity, setExoticEnergyDensity] = useState(-85); // arbitrary negative energy units
  const [rayDensity, setRayDensity] = useState(40); // ray tracer count

  // Interactive View Controls
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showVectors, setShowVectors] = useState(true);
  const [showGeodesics, setShowGeodesics] = useState(true);
  const [activeTab, setActiveTab] = useState("simulation"); // simulation, telemetry, theory

  // 3D Canvas Orbit Mouse Controls
  const [rotX, setRotX] = useState(0.40);
  const [rotY, setRotY] = useState(0.50);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // References
  const canvasRef = useRef(null);
  const telemetryCanvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const timeRef = useRef(0);
  const audioCtxRef = useRef(null);
  const synthRef = useRef({ humOsc: null, tachyonOsc: null, masterGain: null });

  // Geodesic Rays state ref
  const raysRef = useRef([]);

  const currentTheme = THEMES[selectedTheme] || THEMES.warpCyan;
  const currentPreset = PRESETS[selectedPreset] || PRESETS.alcubierreStandard;

  // Apply Preset Handler
  const handleApplyPreset = (presetKey) => {
    const p = PRESETS[presetKey];
    if (!p) return;
    setSelectedPreset(presetKey);
    setWarpVelocity(p.warpVelocity);
    setBubbleRadius(p.bubbleRadius);
    setWallSharpness(p.wallSharpness);
    setExoticEnergyDensity(p.exoticEnergyDensity);
    setRayDensity(p.rayDensity);
  };

  // Initialize Geodesic Light Rays
  const resetGeodesicRays = useCallback(() => {
    const rays = [];
    const count = rayDensity;
    for (let i = 0; i < count; i++) {
      rays.push({
        id: i,
        x: -280 + (Math.random() - 0.5) * 40,
        y: (i - count / 2) * (180 / count),
        z: (Math.random() - 0.5) * 40,
        vx: 2.2 + Math.random() * 0.4,
        vy: 0,
        vz: 0,
        history: [],
      });
    }
    raysRef.current = rays;
  }, [rayDensity]);

  useEffect(() => {
    resetGeodesicRays();
  }, [resetGeodesicRays]);

  // Audio Engine Initialization & Modulation
  useEffect(() => {
    if (!soundEnabled) {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.06, ctx.currentTime);
      masterGain.connect(ctx.destination);

      const humOsc = ctx.createOscillator();
      humOsc.type = "sine";
      humOsc.frequency.setValueAtTime(40 + warpVelocity * 15, ctx.currentTime);
      humOsc.connect(masterGain);
      humOsc.start();

      const tachyonOsc = ctx.createOscillator();
      tachyonOsc.type = "sawtooth";
      tachyonOsc.frequency.setValueAtTime(
        120 + Math.abs(exoticEnergyDensity) * 2,
        ctx.currentTime
      );

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(300 + wallSharpness * 40, ctx.currentTime);

      tachyonOsc.connect(filter);
      filter.connect(masterGain);
      tachyonOsc.start();

      synthRef.current = { humOsc, tachyonOsc, masterGain, ctx };
    } catch (e) {
      console.warn("Web Audio API warning:", e);
    }

    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    };
  }, [soundEnabled]);

  // Update Audio Frequencies live
  useEffect(() => {
    if (synthRef.current && synthRef.current.ctx && soundEnabled) {
      const { humOsc, tachyonOsc, ctx } = synthRef.current;
      humOsc.frequency.setTargetAtTime(40 + warpVelocity * 18, ctx.currentTime, 0.1);
      tachyonOsc.frequency.setTargetAtTime(
        120 + Math.abs(exoticEnergyDensity) * 2.5,
        ctx.currentTime,
        0.1
      );
    }
  }, [warpVelocity, exoticEnergyDensity, soundEnabled]);

  // Alcubierre Shaping Function: f(r_s) = [tanh(sigma * (r_s + R)) - tanh(sigma * (r_s - R))] / (2 * tanh(sigma * R))
  const calcShapingFunction = useCallback(
    (r) => {
      const sigma = wallSharpness * 0.1;
      const R = bubbleRadius;
      const num = Math.tanh(sigma * (r + R)) - Math.tanh(sigma * (r - R));
      const den = 2 * Math.tanh(sigma * R);
      return Math.max(0, Math.min(1, num / (den || 1)));
    },
    [bubbleRadius, wallSharpness]
  );

  // Alcubierre Metric Height (Spacetime Distortion Z)
  // dz/dx ~ df/dr_s * (x/r_s) * v_s
  const calcMetricHeight = useCallback(
    (x, y, t) => {
      const r = Math.sqrt(x * x + y * y);
      const f = calcShapingFunction(r);
      const df = (calcShapingFunction(r + 0.5) - calcShapingFunction(r - 0.5));
      const xPhase = x - Math.sin(t * 0.8) * 4; // micro dynamic pulse
      const contractionExp = -v_s_factor(warpVelocity) * df * (xPhase / (r + 1e-4));
      return contractionExp * f * 35;
    },
    [calcShapingFunction, warpVelocity]
  );

  function v_s_factor(v) {
    return v * 0.45;
  }

  // 3D Isometric Projection Helper
  const project3D = useCallback(
    (x, y, z, width, height) => {
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);

      // Rotate around Y
      const x1 = x * cosY + z * sinY;
      const z1 = -x * sinY + z * cosY;

      // Rotate around X
      const y2 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;

      const scale = 380 / (380 + z2);
      const px = width / 2 + x1 * scale;
      const py = height / 2 + y2 * scale;

      return { px, py, scale, zIndex: z2 };
    },
    [rotX, rotY]
  );

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationId;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      if (!isPaused) {
        timeRef.current += 0.02;
      }
      const time = timeRef.current;

      // Clear Canvas Background
      ctx.fillStyle = currentTheme.canvasBg;
      ctx.fillRect(0, 0, width, height);

      // 1. Draw Starfield Background
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      for (let i = 0; i < 45; i++) {
        const sx = (Math.sin(i * 99 + time * 0.05) * 0.5 + 0.5) * width;
        const sy = (Math.cos(i * 33 + time * 0.05) * 0.5 + 0.5) * height;
        const sz = Math.sin(i * 12) * 1.2 + 1.2;
        ctx.beginPath();
        ctx.arc(sx, sy, sz, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Render Spacetime Grid Mesh
      if (showGrid) {
        const gridCols = 28;
        const gridRows = 22;
        const stepX = 400 / gridCols;
        const stepY = 320 / gridRows;

        ctx.lineWidth = 1;

        // Draw longitudinal grid lines
        for (let r = 0; r <= gridRows; r++) {
          ctx.beginPath();
          let started = false;
          for (let c = 0; c <= gridCols; c++) {
            const x = -200 + c * stepX;
            const y = -160 + r * stepY;
            const z = calcMetricHeight(x, y, time);
            const p = project3D(x, y, z, width, height);

            if (!started) {
              ctx.moveTo(p.px, p.py);
              started = true;
            } else {
              ctx.lineTo(p.px, p.py);
            }
          }
          const alpha = 0.15 + (r / gridRows) * 0.2;
          ctx.strokeStyle = currentTheme.gridColor;
          ctx.stroke();
        }

        // Draw transverse grid lines with deformation highlighting
        for (let c = 0; c <= gridCols; c++) {
          ctx.beginPath();
          let started = false;
          for (let r = 0; r <= gridRows; r++) {
            const x = -200 + c * stepX;
            const y = -160 + r * stepY;
            const z = calcMetricHeight(x, y, time);
            const p = project3D(x, y, z, width, height);

            if (!started) {
              ctx.moveTo(p.px, p.py);
              started = true;
            } else {
              ctx.lineTo(p.px, p.py);
            }
          }
          // Highlight contraction pit (front, x > 0) vs expansion hump (behind, x < 0)
          const midX = -200 + c * stepX;
          if (midX > 15) {
            ctx.strokeStyle = currentTheme.compressColor + "66"; // contraction ahead
          } else if (midX < -15) {
            ctx.strokeStyle = currentTheme.expandColor + "66"; // expansion behind
          } else {
            ctx.strokeStyle = currentTheme.meshColor + "88";
          }
          ctx.stroke();
        }
      }

      // 3. Render Expansion Vector Field (\theta)
      if (showVectors) {
        for (let vx = -140; vx <= 140; vx += 45) {
          for (let vy = -100; vy <= 100; vy += 45) {
            const r = Math.sqrt(vx * vx + vy * vy);
            if (r > 15 && r < 160) {
              const f = calcShapingFunction(r);
              const thetaVal = -warpVelocity * (vx / (r + 1e-4)) * f * 0.4;
              const z = calcMetricHeight(vx, vy, time);
              const pStart = project3D(vx, vy, z, width, height);
              const pEnd = project3D(vx + thetaVal * 12, vy, z + thetaVal * 8, width, height);

              ctx.beginPath();
              ctx.moveTo(pStart.px, pStart.py);
              ctx.lineTo(pEnd.px, pEnd.py);
              ctx.strokeStyle =
                thetaVal < 0
                  ? currentTheme.compressColor
                  : currentTheme.expandColor;
              ctx.lineWidth = 1.5;
              ctx.stroke();

              // Vector arrow head
              ctx.beginPath();
              ctx.arc(pEnd.px, pEnd.py, 2, 0, Math.PI * 2);
              ctx.fillStyle = ctx.strokeStyle;
              ctx.fill();
            }
          }
        }
      }

      // 4. Render Starship Frame at Center of Bubble
      const shipCenter = project3D(0, 0, calcMetricHeight(0, 0, time) - 5, width, height);

      // Ship Warp Bubble Glow Field
      const glowGrad = ctx.createRadialGradient(
        shipCenter.px,
        shipCenter.py,
        2,
        shipCenter.px,
        shipCenter.py,
        bubbleRadius * 1.4 * shipCenter.scale
      );
      glowGrad.addColorStop(0, currentTheme.meshColor + "99");
      glowGrad.addColorStop(0.5, currentTheme.meshColor + "33");
      glowGrad.addColorStop(1, "transparent");

      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(
        shipCenter.px,
        shipCenter.py,
        bubbleRadius * 1.4 * shipCenter.scale,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Draw Starship Delta Model
      ctx.save();
      ctx.translate(shipCenter.px, shipCenter.py);
      ctx.scale(shipCenter.scale, shipCenter.scale);

      // Ship hull
      ctx.beginPath();
      ctx.moveTo(18, 0); // nose pointing right (direction of travel)
      ctx.lineTo(-14, -10);
      ctx.lineTo(-8, 0);
      ctx.lineTo(-14, 10);
      ctx.closePath();
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = currentTheme.meshColor;
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.strokeStyle = currentTheme.meshColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Ship engine warp trail
      ctx.beginPath();
      ctx.moveTo(-8, 0);
      ctx.lineTo(-24 - Math.sin(time * 10) * 6, 0);
      ctx.strokeStyle = currentTheme.expandColor;
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.restore();

      // 5. Render Geodesic Light Rays (Ray Tracer with Gravitational Deflection & Doppler Shift)
      if (showGeodesics && raysRef.current) {
        const rays = raysRef.current;
        rays.forEach((ray) => {
          if (!isPaused) {
            // Update Ray Physics Position
            const r = Math.sqrt(ray.x * ray.x + ray.y * ray.y);
            const f = calcShapingFunction(r);

            // Gravitational lens deflection force around warp bubble
            if (r < bubbleRadius * 1.8 && r > 2) {
              const defl = (bubbleRadius / (r * r + 10)) * warpVelocity * 0.15;
              ray.vy += (ray.y > 0 ? 1 : -1) * defl * f;
            }

            ray.x += ray.vx * (1 + f * warpVelocity * 0.25);
            ray.y += ray.vy;

            // Store history path
            ray.history.push({
              x: ray.x,
              y: ray.y,
              z: calcMetricHeight(ray.x, ray.y, time),
            });
            if (ray.history.length > 18) ray.history.shift();

            // Reset Ray if out of bounds
            if (ray.x > 260) {
              ray.x = -260;
              ray.y = (Math.random() - 0.5) * 180;
              ray.vy = 0;
              ray.history = [];
            }
          }

          // Draw Ray Trajectory Path
          if (ray.history.length > 1) {
            ctx.beginPath();
            for (let h = 0; h < ray.history.length; h++) {
              const pt = ray.history[h];
              const proj = project3D(pt.x, pt.y, pt.z, width, height);
              if (h === 0) ctx.moveTo(proj.px, proj.py);
              else ctx.lineTo(proj.px, proj.py);
            }

            // Doppler Color Shift: Blueshift in front (x > 0), Redshift behind (x < 0)
            const dopplerFactor = (ray.x / 180) * (warpVelocity / 3);
            if (dopplerFactor > 0.1) {
              ctx.strokeStyle = currentTheme.photonBlue; // energetic blueshift ahead
            } else if (dopplerFactor < -0.1) {
              ctx.strokeStyle = currentTheme.photonRed; // redshift behind
            } else {
              ctx.strokeStyle = currentTheme.meshColor;
            }

            ctx.lineWidth = 1.5;
            ctx.shadowColor = ctx.strokeStyle;
            ctx.shadowBlur = 6;
            ctx.stroke();
            ctx.shadowBlur = 0;
          }
        });
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [
    isPaused,
    showGrid,
    showVectors,
    showGeodesics,
    currentTheme,
    warpVelocity,
    bubbleRadius,
    wallSharpness,
    calcMetricHeight,
    calcShapingFunction,
    project3D,
  ]);

  // Telemetry Chart Render (Shaping Function & Energy Profile)
  useEffect(() => {
    if (activeTab !== "telemetry") return;
    const canvas = telemetryCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, w, h);

    // Draw Grid Lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= w; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y <= h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Chart 1: Shaping Function f(r_s) (Cyan curve)
    ctx.beginPath();
    ctx.strokeStyle = currentTheme.meshColor;
    ctx.lineWidth = 3;
    for (let px = 0; px <= w; px += 2) {
      const r = (px / w) * 60; // 0 to 60 meters
      const f = calcShapingFunction(r);
      const py = h - 30 - f * (h - 70);
      if (px === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Chart 2: Energy Density T_{00}(r_s) (Negative spike, Pink/Red curve)
    ctx.beginPath();
    ctx.strokeStyle = currentTheme.photonRed;
    ctx.lineWidth = 2.5;
    const sigma = wallSharpness * 0.1;
    const R = bubbleRadius;

    for (let px = 0; px <= w; px += 2) {
      const r = (px / w) * 60;
      // df/dr derivative estimate
      const df = (calcShapingFunction(r + 0.2) - calcShapingFunction(r - 0.2)) / 0.4;
      const t00Val = -Math.pow(df, 2) * (Math.abs(exoticEnergyDensity) / 100);
      const py = h / 2 - t00Val * (h / 2.5); // inverted for negative values
      if (px === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Chart Legend
    ctx.fillStyle = currentTheme.meshColor;
    ctx.font = "12px sans-serif";
    ctx.fillText("— Shaping Function f(r)", 20, 25);

    ctx.fillStyle = currentTheme.photonRed;
    ctx.fillText("— Negative Energy Density T₀₀(r)", 200, 25);
  }, [activeTab, calcShapingFunction, bubbleRadius, wallSharpness, exoticEnergyDensity, currentTheme]);

  // Orbit Drag Event Handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setRotY((prev) => prev + dx * 0.005);
    setRotX((prev) => Math.max(-1.2, Math.min(1.2, prev + dy * 0.005)));
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Calculated Real-Time Physics Values
  const gammaLorentz = (1 / Math.sqrt(Math.max(0.001, 1 - Math.min(0.99, (warpVelocity / 10) ** 2)))).toFixed(2);
  const expansionScalarFront = (-warpVelocity * wallSharpness * 0.12).toFixed(2);
  const expansionScalarAft = (+warpVelocity * wallSharpness * 0.12).toFixed(2);
  const dopplerShiftZ = (Math.sqrt((1 + warpVelocity) / Math.max(0.001, Math.abs(1 - warpVelocity))) - 1).toFixed(2);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 text-slate-100 font-sans">
      {/* Header Container */}
      <div className={`p-6 rounded-2xl ${currentTheme.cardBg} border shadow-2xl mb-6 backdrop-blur-xl`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${currentTheme.badge}`}>
                General Relativity & Warp Mechanics
              </span>
              <span className="text-xs text-slate-400 font-mono">v1.0.0 • Alcubierre Metric Engine</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
              Alcubierre Warp Drive Metric Studio
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Simulate superluminal spacetime distortion geometry, exotic negative energy stress-energy tensor fields, and geodesic photon ray deflection.
            </p>
          </div>

          {/* Top Controls: Sound & Theme */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 border ${
                soundEnabled
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-lg shadow-cyan-500/10"
                  : "bg-slate-800/80 text-slate-400 border-slate-700/60 hover:text-white"
              }`}
            >
              <span>{soundEnabled ? "🔊 Sound FX On" : "🔇 Sound FX Off"}</span>
            </button>

            {/* Theme Select Buttons */}
            <div className="flex bg-slate-950/60 p-1 rounded-xl border border-slate-800">
              {Object.keys(THEMES).map((key) => (
                <button
                  key={key}
                  onClick={() => setSelectedTheme(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedTheme === key
                      ? `${currentTheme.buttonBg}`
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {THEMES[key].name.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Presets Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Astrophysical & Metric Presets
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.keys(PRESETS).map((pKey) => {
              const p = PRESETS[pKey];
              const isSelected = selectedPreset === pKey;
              return (
                <button
                  key={pKey}
                  onClick={() => handleApplyPreset(pKey)}
                  className={`p-3 rounded-xl text-left border transition-all duration-200 ${
                    isSelected
                      ? `${currentTheme.cardBg} ${currentTheme.border} ring-1 ring-cyan-400/30`
                      : "bg-slate-950/40 border-slate-800/60 hover:bg-slate-900/60 hover:border-slate-700"
                  }`}
                >
                  <div className="font-semibold text-sm text-slate-200 mb-1">{p.name}</div>
                  <div className="text-xs text-slate-400 line-clamp-2">{p.subtitle}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Deck (Left 4 cols) */}
        <div className={`lg:col-span-4 p-5 rounded-2xl ${currentTheme.cardBg} border ${currentTheme.border} shadow-xl flex flex-col gap-5`}>
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>⚙️ Metric Parameters</span>
            </h2>
            <span className={`text-xs font-mono px-2 py-0.5 rounded ${currentTheme.badge}`}>
              Active Model
            </span>
          </div>

          {/* Slider 1: Warp Velocity */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-slate-300 font-medium">Warp Velocity (v_s / c)</span>
              <span className={`font-mono font-bold text-sm ${currentTheme.accentText}`}>
                {warpVelocity.toFixed(2)} c
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="5.0"
              step="0.05"
              value={warpVelocity}
              onChange={(e) => setWarpVelocity(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-950 rounded-lg cursor-pointer h-2"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>0.1c (Subluminal)</span>
              <span>1.0c</span>
              <span>5.0c (Superluminal)</span>
            </div>
          </div>

          {/* Slider 2: Bubble Radius */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-slate-300 font-medium">Bubble Radius (R)</span>
              <span className={`font-mono font-bold text-sm ${currentTheme.accentText}`}>
                {bubbleRadius.toFixed(1)} m
              </span>
            </div>
            <input
              type="range"
              min="5.0"
              max="50.0"
              step="1.0"
              value={bubbleRadius}
              onChange={(e) => setBubbleRadius(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-950 rounded-lg cursor-pointer h-2"
            />
          </div>

          {/* Slider 3: Wall Sharpness */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-slate-300 font-medium">Wall Thickness (σ)</span>
              <span className={`font-mono font-bold text-sm ${currentTheme.accentText}`}>
                {wallSharpness.toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min="1.0"
              max="10.0"
              step="0.2"
              value={wallSharpness}
              onChange={(e) => setWallSharpness(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-950 rounded-lg cursor-pointer h-2"
            />
          </div>

          {/* Slider 4: Exotic Energy Density */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-slate-300 font-medium">Exotic Energy Density (T₀₀)</span>
              <span className="font-mono font-bold text-sm text-rose-400">
                {exoticEnergyDensity} J/m³
              </span>
            </div>
            <input
              type="range"
              min="-100"
              max="-10"
              step="5"
              value={exoticEnergyDensity}
              onChange={(e) => setExoticEnergyDensity(parseInt(e.target.value))}
              className="w-full accent-rose-500 bg-slate-950 rounded-lg cursor-pointer h-2"
            />
          </div>

          {/* Slider 5: Ray Tracer Count */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-slate-300 font-medium">Geodesic Ray Density</span>
              <span className="font-mono font-bold text-sm text-slate-300">
                {rayDensity} Rays
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="80"
              step="5"
              value={rayDensity}
              onChange={(e) => setRayDensity(parseInt(e.target.value))}
              className="w-full accent-purple-400 bg-slate-950 rounded-lg cursor-pointer h-2"
            />
          </div>

          {/* Toggle Switches */}
          <div className="pt-3 border-t border-slate-800/80 flex flex-col gap-2.5">
            <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
              <span>Show 3D Metric Grid</span>
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="w-4 h-4 accent-cyan-500 rounded"
              />
            </label>

            <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
              <span>Show Expansion Field Vectors (θ)</span>
              <input
                type="checkbox"
                checked={showVectors}
                onChange={(e) => setShowVectors(e.target.checked)}
                className="w-4 h-4 accent-cyan-500 rounded"
              />
            </label>

            <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
              <span>Show Geodesic Photon Rays</span>
              <input
                type="checkbox"
                checked={showGeodesics}
                onChange={(e) => setShowGeodesics(e.target.checked)}
                className="w-4 h-4 accent-cyan-500 rounded"
              />
            </label>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-800/80 flex gap-2">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`flex-1 py-2.5 rounded-xl font-medium text-xs transition-all ${
                isPaused
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                  : "bg-amber-600 hover:bg-amber-500 text-white"
              }`}
            >
              {isPaused ? "▶ Resume" : "⏸ Pause"}
            </button>

            <button
              onClick={resetGeodesicRays}
              className="px-4 py-2.5 rounded-xl font-medium text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all border border-slate-700"
            >
              🔄 Reset Rays
            </button>
          </div>
        </div>

        {/* Display Canvas & Tab Viewport (Right 8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Navigation Tabs */}
          <div className={`p-1.5 rounded-xl ${currentTheme.cardBg} border ${currentTheme.border} flex gap-2`}>
            <button
              onClick={() => setActiveTab("simulation")}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "simulation"
                  ? `${currentTheme.buttonBg}`
                  : "text-slate-400 hover:text-white"
              }`}
            >
              🌌 3D Simulation Viewport
            </button>
            <button
              onClick={() => setActiveTab("telemetry")}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "telemetry"
                  ? `${currentTheme.buttonBg}`
                  : "text-slate-400 hover:text-white"
              }`}
            >
              📊 Telemetry & Metric Curves
            </button>
            <button
              onClick={() => setActiveTab("theory")}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "theory"
                  ? `${currentTheme.buttonBg}`
                  : "text-slate-400 hover:text-white"
              }`}
            >
              📜 Field Equations & Theory
            </button>
          </div>

          {/* TAB 1: 3D Simulation Viewport */}
          {activeTab === "simulation" && (
            <div className={`relative rounded-2xl overflow-hidden ${currentTheme.cardBg} border ${currentTheme.border} shadow-2xl`}>
              {/* Canvas element */}
              <canvas
                ref={canvasRef}
                width={850}
                height={520}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className="w-full h-[500px] object-cover cursor-grab active:cursor-grabbing block"
              />

              {/* Overlaid HUD Info */}
              <div className="absolute top-4 left-4 pointer-events-none flex flex-col gap-2">
                <div className="bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300">
                  <span className="text-cyan-400 font-bold">MODE:</span> 3D Spacetime Metric Geometry
                </div>
                <div className="bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300">
                  <span className="text-amber-400 font-bold">ORBIT:</span> Click & Drag to Rotate View
                </div>
              </div>

              {/* Live Metric HUD Gauges */}
              <div className="absolute bottom-4 left-4 right-4 pointer-events-none grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="bg-slate-950/85 backdrop-blur-md p-2.5 rounded-xl border border-slate-800/80 text-center">
                  <div className="text-[10px] text-slate-400 uppercase">Lorentz Factor (γ)</div>
                  <div className="text-sm font-mono font-bold text-cyan-400 mt-0.5">{gammaLorentz}</div>
                </div>

                <div className="bg-slate-950/85 backdrop-blur-md p-2.5 rounded-xl border border-slate-800/80 text-center">
                  <div className="text-[10px] text-slate-400 uppercase">Expansion Ahead (θ)</div>
                  <div className="text-sm font-mono font-bold text-sky-400 mt-0.5">{expansionScalarFront} s⁻¹</div>
                </div>

                <div className="bg-slate-950/85 backdrop-blur-md p-2.5 rounded-xl border border-slate-800/80 text-center">
                  <div className="text-[10px] text-slate-400 uppercase">Expansion Behind (θ)</div>
                  <div className="text-sm font-mono font-bold text-pink-400 mt-0.5">+{expansionScalarAft} s⁻¹</div>
                </div>

                <div className="bg-slate-950/85 backdrop-blur-md p-2.5 rounded-xl border border-slate-800/80 text-center">
                  <div className="text-[10px] text-slate-400 uppercase">Doppler Factor (z)</div>
                  <div className="text-sm font-mono font-bold text-rose-400 mt-0.5">{dopplerShiftZ}</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Telemetry & Curves */}
          {activeTab === "telemetry" && (
            <div className={`p-6 rounded-2xl ${currentTheme.cardBg} border ${currentTheme.border} shadow-2xl flex flex-col gap-4`}>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Radial Metric Profile Graphs</h3>
                <span className="text-xs text-slate-400 font-mono">r_s = 0 to 60 meters</span>
              </div>
              <canvas
                ref={telemetryCanvasRef}
                width={800}
                height={320}
                className="w-full h-[320px] rounded-xl border border-slate-800 block"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
                <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800/60">
                  <span className="font-bold text-cyan-400 block mb-1">Shaping Function f(r_s)</span>
                  Determines the spatial transition between flat Minkowski space inside the bubble (f = 1) and flat space outside (f = 0).
                </div>
                <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800/60">
                  <span className="font-bold text-rose-400 block mb-1">Negative Energy Density T₀₀</span>
                  Demonstrates the localized exotic energy distribution concentrated strictly within the bubble shell wall boundary.
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Theory & Mathematical Formulation */}
          {activeTab === "theory" && (
            <div className={`p-6 rounded-2xl ${currentTheme.cardBg} border ${currentTheme.border} shadow-2xl flex flex-col gap-4 text-sm text-slate-300`}>
              <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2">
                Theoretical Physics & Field Equations
              </h3>

              <div className="space-y-4">
                <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
                  <div className="font-semibold text-cyan-300 mb-1">1. Alcubierre Spacetime Metric (1994)</div>
                  <p className="text-xs text-slate-400 leading-relaxed font-mono">
                    ds² = -c² dt² + (dx - v_s(t) f(r_s) dt)² + dy² + dz²
                  </p>
                  <p className="text-xs text-slate-300 mt-2">
                    Where <span className="font-mono text-cyan-400">v_s(t)</span> is the coordinate velocity of the warp bubble along the x-axis, and <span className="font-mono text-cyan-400">f(r_s)</span> is the regulator function that isolates the central spacecraft from tidal shear forces.
                  </p>
                </div>

                <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
                  <div className="font-semibold text-purple-300 mb-1">2. Expansion Scalar & Volume Distortion</div>
                  <p className="text-xs text-slate-400 leading-relaxed font-mono">
                    θ = ∇ · v = -v_s (x_s / r_s) (df / dr_s)
                  </p>
                  <p className="text-xs text-slate-300 mt-2">
                    Spacetime undergoes severe contraction ahead of the bubble (<span className="text-sky-400">θ &lt; 0</span>) and equivalent expansion behind (<span className="text-pink-400">θ &gt; 0</span>), allowing the spacecraft to move globally faster than light while remaining locally stationary inside flat spacetime.
                  </p>
                </div>

                <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
                  <div className="font-semibold text-rose-300 mb-1">3. Null Energy Condition (NEC) Violation</div>
                  <p className="text-xs text-slate-400 leading-relaxed font-mono">
                    T_{"{"}00{"}"} = - (c⁴ / 32πG) · (v_s² / r_s²) · (df / dr_s)² &lt; 0
                  </p>
                  <p className="text-xs text-slate-300 mt-2">
                    General Relativity dictates that creating this metric requires exotic matter possessing negative energy density (<span className="text-rose-400">T₀₀ &lt; 0</span>), violating classical energy conditions like the Weak and Null Energy Conditions.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
