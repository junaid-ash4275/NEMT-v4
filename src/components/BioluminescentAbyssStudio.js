import React, { useState, useEffect, useRef, useCallback } from "react";

// Bioluminescent Aesthetic Themes
const THEMES = {
  hadopelagic: {
    id: "hadopelagic",
    name: "Hadopelagic Trench",
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    accentText: "text-cyan-400",
    border: "border-cyan-500/30",
    cardBg: "bg-slate-900/85 backdrop-blur-md border-cyan-500/20",
    buttonBg: "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25",
    canvasBg: "#020712",
    primaryGlow: "rgba(6, 182, 212, 0.9)",
    secondaryGlow: "rgba(59, 130, 246, 0.8)",
    planktonColors: ["#00f0ff", "#3b82f6", "#60a5fa", "#06b6d4"],
    jellyColor: "rgba(0, 240, 255, 0.75)",
    organColor: "#38bdf8",
    ventColor: "#0284c7",
  },
  neonBloom: {
    id: "neonBloom",
    name: "Neon Plankton Bloom",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    accentText: "text-emerald-400",
    border: "border-emerald-500/30",
    cardBg: "bg-slate-900/85 backdrop-blur-md border-emerald-500/20",
    buttonBg: "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25",
    canvasBg: "#010f0b",
    primaryGlow: "rgba(16, 185, 129, 0.9)",
    secondaryGlow: "rgba(20, 184, 166, 0.8)",
    planktonColors: ["#10b981", "#34d399", "#14b8a6", "#a7f3d0"],
    jellyColor: "rgba(16, 185, 129, 0.75)",
    organColor: "#6ee7b7",
    ventColor: "#059669",
  },
  thermalVent: {
    id: "thermalVent",
    name: "Hydrothermal Abyss",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    accentText: "text-amber-400",
    border: "border-amber-500/30",
    cardBg: "bg-slate-900/85 backdrop-blur-md border-amber-500/20",
    buttonBg: "bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white shadow-lg shadow-amber-500/25",
    canvasBg: "#120503",
    primaryGlow: "rgba(245, 158, 11, 0.9)",
    secondaryGlow: "rgba(244, 63, 94, 0.8)",
    planktonColors: ["#f59e0b", "#fbbf24", "#f43f5e", "#ef4444"],
    jellyColor: "rgba(245, 158, 11, 0.75)",
    organColor: "#fde047",
    ventColor: "#dc2626",
  },
  violetAbyss: {
    id: "violetAbyss",
    name: "Abyssal Phosphor Void",
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    accentText: "text-purple-400",
    border: "border-purple-500/30",
    cardBg: "bg-slate-900/85 backdrop-blur-md border-purple-500/20",
    buttonBg: "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/25",
    canvasBg: "#0a0314",
    primaryGlow: "rgba(168, 85, 247, 0.9)",
    secondaryGlow: "rgba(236, 72, 153, 0.8)",
    planktonColors: ["#a855f7", "#c084fc", "#ec4899", "#e879f9"],
    jellyColor: "rgba(168, 85, 247, 0.75)",
    organColor: "#f0abfc",
    ventColor: "#9333ea",
  },
  arcticDepths: {
    id: "arcticDepths",
    name: "Glacial Abyssal Shelf",
    badge: "bg-sky-500/20 text-sky-300 border-sky-500/40",
    accentText: "text-sky-400",
    border: "border-sky-500/30",
    cardBg: "bg-slate-900/85 backdrop-blur-md border-sky-500/20",
    buttonBg: "bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white shadow-lg shadow-sky-500/25",
    canvasBg: "#020a14",
    primaryGlow: "rgba(56, 189, 248, 0.9)",
    secondaryGlow: "rgba(99, 102, 241, 0.8)",
    planktonColors: ["#38bdf8", "#7dd3fc", "#818cf8", "#e0f2fe"],
    jellyColor: "rgba(56, 189, 248, 0.75)",
    organColor: "#bae6fd",
    ventColor: "#2563eb",
  },
};

export default function BioluminescentAbyssStudio() {
  // Theme and UI Tabs
  const [activeTheme, setActiveTheme] = useState("hadopelagic");
  const [activeTab, setActiveTab] = useState("hydro"); // hydro | bio | creatures | audio
  const [mouseMode, setMouseMode] = useState("shockwave"); // shockwave | lure | brush

  // Simulation Parameters
  const [depthMeters, setDepthMeters] = useState(4500); // 1000m - 11000m
  const [planktonDensity, setPlanktonDensity] = useState(350); // 100 - 700
  const [jellyCount, setJellyCount] = useState(4); // 1 - 8
  const [fluidViscosity, setFluidViscosity] = useState(0.96); // 0.90 - 0.99
  const [currentVelX, setCurrentVelX] = useState(0.3); // -2.0 - +2.0
  const [currentVelY, setCurrentVelY] = useState(-0.1); // -2.0 - +2.0
  const [luciferinDecay, setLuciferinDecay] = useState(0.025); // 0.005 - 0.08
  const [glowIntensity, setGlowIntensity] = useState(1.4); // 0.5 - 3.0
  const [ventCount, setVentCount] = useState(3); // 0 - 5

  // Simulation State
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(0.3);
  const [sonarPitch, setSonarPitch] = useState(800);

  // Live Telemetry
  const [fps, setFps] = useState(60);
  const [bioEnergyFlux, setBioEnergyFlux] = useState(142.8);
  const [activeExcitedCount, setActiveExcitedCount] = useState(0);

  // Canvas & Audio Refs
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const requestRef = useRef(null);
  const audioCtxRef = useRef(null);
  const droneOscRef = useRef(null);
  const droneGainRef = useRef(null);
  const masterGainRef = useRef(null);
  const lastTimeRef = useRef(performance.now());
  const frameCountRef = useRef(0);

  // Mouse Interaction State
  const isMouseDownRef = useRef(false);
  const mousePosRef = useRef({ x: -1000, y: -1000, vx: 0, vy: 0, lastX: -1000, lastY: -1000 });

  // Entity Collections Ref (persisted in animation loop)
  const entitiesRef = useRef({
    plankton: [],
    jellyfish: [],
    siphonophore: null,
    vents: [],
    ventParticles: [],
    shockwaves: [],
  });

  const theme = THEMES[activeTheme];

  // ---------------------------------------------------------------------------
  // WEB AUDIO SYNTHESIZER ENGINE
  // ---------------------------------------------------------------------------
  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(isMuted ? 0 : volume, ctx.currentTime);
      masterGain.connect(ctx.destination);
      masterGainRef.current = masterGain;

      // Sub-bass Ocean Drone
      const droneOsc = ctx.createOscillator();
      droneOsc.type = "sine";
      droneOsc.frequency.setValueAtTime(45, ctx.currentTime);

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(180, ctx.currentTime);

      const droneGain = ctx.createGain();
      droneGain.gain.setValueAtTime(0.4, ctx.currentTime);

      droneOsc.connect(filter);
      filter.connect(droneGain);
      droneGain.connect(masterGain);
      droneOsc.start();

      droneOscRef.current = droneOsc;
      droneGainRef.current = droneGain;
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  }, [isMuted, volume]);

  const toggleAudio = () => {
    if (!audioCtxRef.current) {
      initAudio();
    }
    const newMute = !isMuted;
    setIsMuted(newMute);
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setTargetAtTime(
        newMute ? 0 : volume,
        audioCtxRef.current.currentTime,
        0.05
      );
    }
  };

  const playBioluminescentChime = useCallback(
    (intensity = 1.0) => {
      if (isMuted || !audioCtxRef.current || audioCtxRef.current.state !== "running") return;
      try {
        const ctx = audioCtxRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Sparkle pitch
        const freq = sonarPitch + (Math.random() - 0.5) * 400;
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        gain.gain.setValueAtTime(0.01 * intensity, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.08 * intensity, ctx.currentTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);

        osc.connect(gain);
        gain.connect(masterGainRef.current);
        osc.start();
        osc.stop(ctx.currentTime + 0.42);
      } catch (e) {
        // silent catch
      }
    },
    [isMuted, sonarPitch]
  );

  const playSonarPing = useCallback(() => {
    if (isMuted || !audioCtxRef.current || audioCtxRef.current.state !== "running") return;
    try {
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(1100, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.6);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(masterGainRef.current);
      osc.start();
      osc.stop(ctx.currentTime + 0.82);
    } catch (e) {
      // silent catch
    }
  }, [isMuted]);

  // Update Master Volume
  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setTargetAtTime(
        isMuted ? 0 : volume,
        audioCtxRef.current.currentTime,
        0.05
      );
    }
  }, [volume, isMuted]);

  // ---------------------------------------------------------------------------
  // ENTITY INITIALIZATION ENGINE
  // ---------------------------------------------------------------------------
  const initEntities = useCallback(
    (width, height) => {
      const plankton = [];
      for (let i = 0; i < planktonDensity; i++) {
        plankton.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          baseSize: Math.random() * 2.2 + 1.0,
          excitement: Math.random() * 0.2,
          color: theme.planktonColors[Math.floor(Math.random() * theme.planktonColors.length)],
          phase: Math.random() * Math.PI * 2,
        });
      }

      const jellyfish = [];
      for (let i = 0; i < jellyCount; i++) {
        jellyfish.push({
          x: Math.random() * (width * 0.8) + width * 0.1,
          y: Math.random() * (height * 0.7) + height * 0.15,
          vx: 0,
          vy: 0,
          size: Math.random() * 22 + 28,
          pulseTimer: Math.random() * 100,
          pulseSpeed: Math.random() * 0.03 + 0.02,
          isContracting: false,
          contractionFactor: 1.0,
          angle: Math.random() * Math.PI * 2,
          tentacleNodes: Array.from({ length: 8 }, () =>
            Array.from({ length: 6 }, () => ({ x: 0, y: 0 }))
          ),
          organGlow: Math.random() * 0.5 + 0.5,
        });
      }

      // Siphonophore chain
      const siphoLength = 16;
      const siphonophore = {
        nodes: Array.from({ length: siphoLength }, (_, idx) => ({
          x: width * 0.5 + idx * 12,
          y: height * 0.4 + Math.sin(idx * 0.5) * 15,
          vx: 0,
          vy: 0,
          glow: Math.random() * 0.6 + 0.4,
        })),
        phase: 0,
      };

      // Vents
      const vents = [];
      const ventSpacing = width / (ventCount + 1);
      for (let i = 0; i < ventCount; i++) {
        vents.push({
          x: ventSpacing * (i + 1) + (Math.random() - 0.5) * 40,
          y: height - 10,
          width: Math.random() * 20 + 30,
          height: Math.random() * 35 + 45,
          heatPulse: Math.random() * Math.PI * 2,
        });
      }

      entitiesRef.current = {
        plankton,
        jellyfish,
        siphonophore,
        vents,
        ventParticles: [],
        shockwaves: [],
      };
    },
    [planktonDensity, jellyCount, ventCount, theme]
  );

  // ---------------------------------------------------------------------------
  // CANVAS ANIMATION LOOP & PHYSICS ENGINE
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const updateCanvasSize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      initEntities(rect.width, rect.height);
    };

    updateCanvasSize();
    const handleResize = () => updateCanvasSize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [initEntities]);

  // Main Render Frame
  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current) return;
    const ctx = canvas.getContext("2d");
    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);

    // Calculate FPS and Telemetry
    const now = performance.now();
    const delta = now - lastTimeRef.current;
    frameCountRef.current++;

    if (delta >= 1000) {
      const computedFps = Math.round((frameCountRef.current * 1000) / delta);
      setFps(computedFps);
      frameCountRef.current = 0;
      lastTimeRef.current = now;

      // Update Telemetry
      const excitedRatio =
        entitiesRef.current.plankton.filter((p) => p.excitement > 0.3).length /
        (planktonDensity || 1);
      setBioEnergyFlux((excitedRatio * 450 + 42.5).toFixed(1));
      setActiveExcitedCount(
        entitiesRef.current.plankton.filter((p) => p.excitement > 0.25).length
      );
    }

    // 1. Draw Abyssal Ocean Background Gradient
    const depthRatio = Math.min(1, Math.max(0, (depthMeters - 1000) / 10000));
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, theme.canvasBg);
    bgGradient.addColorStop(1, "#010308");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Light attenuation rays from top (subtle deep water light)
    if (depthRatio < 0.85) {
      const rayAlpha = (1 - depthRatio) * 0.06;
      const rayGradient = ctx.createRadialGradient(
        width * 0.5,
        -100,
        50,
        width * 0.5,
        height * 0.4,
        width * 0.8
      );
      rayGradient.addColorStop(0, theme.primaryGlow.replace("0.9", rayAlpha.toString()));
      rayGradient.addColorStop(1, "transparent");
      ctx.fillStyle = rayGradient;
      ctx.fillRect(0, 0, width, height);
    }

    if (!isPlaying) {
      requestRef.current = requestAnimationFrame(renderFrame);
      return;
    }

    const mouse = mousePosRef.current;

    // 2. Spawn Shockwaves or Light Lure from Mouse Interaction
    if (isMouseDownRef.current && mouse.x > 0 && mouse.y > 0) {
      if (mouseMode === "shockwave" && Math.random() < 0.25) {
        entitiesRef.current.shockwaves.push({
          x: mouse.x,
          y: mouse.y,
          radius: 5,
          maxRadius: Math.random() * 80 + 70,
          alpha: 1.0,
          force: 4.5,
        });
        playBioluminescentChime(1.2);
      } else if (mouseMode === "brush") {
        for (let b = 0; b < 3; b++) {
          entitiesRef.current.plankton.push({
            x: mouse.x + (Math.random() - 0.5) * 35,
            y: mouse.y + (Math.random() - 0.5) * 35,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5,
            baseSize: Math.random() * 2.5 + 1.2,
            excitement: 1.0,
            color: theme.planktonColors[Math.floor(Math.random() * theme.planktonColors.length)],
            phase: Math.random() * Math.PI * 2,
          });
        }
        if (entitiesRef.current.plankton.length > planktonDensity + 100) {
          entitiesRef.current.plankton.shift();
        }
      }
    }

    // 3. Update & Render Shockwaves
    for (let i = entitiesRef.current.shockwaves.length - 1; i >= 0; i--) {
      const sw = entitiesRef.current.shockwaves[i];
      sw.radius += 3.5;
      sw.alpha -= 0.022;

      ctx.save();
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.strokeStyle = theme.primaryGlow.replace("0.9", sw.alpha.toString());
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 15;
      ctx.shadowColor = theme.primaryGlow;
      ctx.stroke();
      ctx.restore();

      if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
        entitiesRef.current.shockwaves.splice(i, 1);
      }
    }

    // 4. Update & Render Hydrothermal Vents & Mineral Plumes
    entitiesRef.current.vents.forEach((v) => {
      v.heatPulse += 0.04;
      // Draw Vent Chimney Rock
      ctx.fillStyle = "#0c1322";
      ctx.beginPath();
      ctx.moveTo(v.x - v.width * 0.5, height);
      ctx.lineTo(v.x - v.width * 0.3, height - v.height);
      ctx.lineTo(v.x + v.width * 0.3, height - v.height);
      ctx.lineTo(v.x + v.width * 0.5, height);
      ctx.closePath();
      ctx.fill();

      // Vent Lip Heat Glow
      ctx.fillStyle = theme.ventColor;
      ctx.shadowBlur = 20;
      ctx.shadowColor = theme.ventColor;
      ctx.beginPath();
      ctx.ellipse(v.x, height - v.height, v.width * 0.35, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Spawn Vent Plume Spark Particles
      if (Math.random() < 0.6) {
        entitiesRef.current.ventParticles.push({
          x: v.x + (Math.random() - 0.5) * v.width * 0.5,
          y: height - v.height,
          vx: (Math.random() - 0.5) * 0.8 + currentVelX * 0.3,
          vy: -Math.random() * 2.2 - 1.2,
          life: 1.0,
          decay: Math.random() * 0.015 + 0.008,
          size: Math.random() * 2.8 + 1.0,
        });
      }
    });

    // Render Vent Spark Particles
    for (let i = entitiesRef.current.ventParticles.length - 1; i >= 0; i--) {
      const vp = entitiesRef.current.ventParticles[i];
      vp.x += vp.vx + Math.sin(vp.y * 0.05) * 0.4;
      vp.y += vp.vy;
      vp.life -= vp.decay;

      ctx.fillStyle = theme.ventColor;
      ctx.globalAlpha = vp.life;
      ctx.beginPath();
      ctx.arc(vp.x, vp.y, vp.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;

      if (vp.life <= 0 || vp.y < 0) {
        entitiesRef.current.ventParticles.splice(i, 1);
      }
    }

    // 5. Update & Render Bioluminescent Plankton (Dinoflagellates)
    const planktonList = entitiesRef.current.plankton;
    for (let i = 0; i < planktonList.length; i++) {
      const p = planktonList[i];

      // Current Drift & Viscosity Drag
      p.vx = (p.vx + currentVelX * 0.02) * fluidViscosity;
      p.vy = (p.vy + currentVelY * 0.02) * fluidViscosity;
      p.x += p.vx;
      p.y += p.vy;

      // Wrap-around Canvas Bounds
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      // Mouse Distance Excitement Trigger
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 120 && (mouse.vx !== 0 || mouse.vy !== 0 || isMouseDownRef.current)) {
        const exciteFactor = (1 - dist / 120) * 0.6;
        p.excitement = Math.min(1.0, p.excitement + exciteFactor);
        p.vx += (dx / (dist || 1)) * 0.4;
        p.vy += (dy / (dist || 1)) * 0.4;
      }

      // Check Shockwave Distances
      entitiesRef.current.shockwaves.forEach((sw) => {
        const swDx = p.x - sw.x;
        const swDy = p.y - sw.y;
        const swDist = Math.sqrt(swDx * swDx + swDy * swDy);
        if (Math.abs(swDist - sw.radius) < 25) {
          p.excitement = 1.0;
          p.vx += (swDx / (swDist || 1)) * sw.force;
          p.vy += (swDy / (swDist || 1)) * sw.force;
        }
      });

      // Decay Luciferin Excitement Glow
      p.excitement = Math.max(0.05, p.excitement - luciferinDecay);

      // Draw Plankton Node with Radial Glow
      p.phase += 0.03;
      const pulseSize = p.baseSize + Math.sin(p.phase) * 0.4;
      const currentGlow = p.excitement * glowIntensity;

      ctx.save();
      if (p.excitement > 0.3) {
        ctx.shadowBlur = 12 * currentGlow;
        ctx.shadowColor = p.color;
      }
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.min(1.0, p.excitement * 0.95 + 0.15);
      ctx.beginPath();
      ctx.arc(p.x, p.y, pulseSize * (1 + p.excitement * 0.5), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 6. Update & Render Jellyfish Swarm
    const jellies = entitiesRef.current.jellyfish;
    jellies.forEach((j) => {
      j.pulseTimer += j.pulseSpeed;
      const pulseSin = Math.sin(j.pulseTimer);
      const isContracting = pulseSin > 0.7;

      // Bell Contraction Hydrodynamics
      if (isContracting && !j.isContracting) {
        j.isContracting = true;
        j.vy -= 1.8; // Upward pulse thrust
        j.vx += (Math.random() - 0.5) * 0.8;
        playBioluminescentChime(0.6);
      } else if (!isContracting) {
        j.isContracting = false;
      }

      // Lure Attraction
      if (mouseMode === "lure" && mouse.x > 0) {
        const lDx = mouse.x - j.x;
        const lDy = mouse.y - j.y;
        const lDist = Math.sqrt(lDx * lDx + lDy * lDy);
        if (lDist > 60) {
          j.vx += (lDx / lDist) * 0.08;
          j.vy += (lDy / lDist) * 0.08;
        }
      }

      // Apply Drag and Velocity
      j.vx = (j.vx + currentVelX * 0.05) * 0.95;
      j.vy = (j.vy + currentVelY * 0.05 + 0.05) * 0.96; // Gentle gravity settling
      j.x += j.vx;
      j.y += j.vy;

      // Boundary Bounce
      if (j.x < j.size) {
        j.x = j.size;
        j.vx *= -1;
      }
      if (j.x > width - j.size) {
        j.x = width - j.size;
        j.vx *= -1;
      }
      if (j.y < j.size) {
        j.y = j.size;
        j.vy *= -0.5;
      }
      if (j.y > height - j.size - 40) {
        j.y = height - j.size - 40;
        j.vy -= 1.2;
      }

      // Render Jellyfish Translucent Bell & Organs
      const contractionScale = 1 - Math.max(0, pulseSin) * 0.25;
      const bellWidth = j.size * contractionScale;
      const bellHeight = j.size * (1 + Math.max(0, pulseSin) * 0.2);

      ctx.save();
      ctx.translate(j.x, j.y);

      // Outer Glow Halo
      const bellGradient = ctx.createRadialGradient(0, 0, 5, 0, 0, bellWidth * 1.4);
      bellGradient.addColorStop(0, theme.primaryGlow);
      bellGradient.addColorStop(0.6, theme.jellyColor);
      bellGradient.addColorStop(1, "transparent");

      ctx.fillStyle = bellGradient;
      ctx.beginPath();
      ctx.arc(0, 0, bellWidth * 1.2, Math.PI, 0, false);
      ctx.quadraticCurveTo(bellWidth * 0.8, bellHeight * 0.5, 0, bellHeight * 0.5);
      ctx.quadraticCurveTo(-bellWidth * 0.8, bellHeight * 0.5, -bellWidth, 0);
      ctx.fill();

      // Inner Bioluminescent Organ Core
      ctx.fillStyle = theme.organColor;
      ctx.shadowBlur = 18;
      ctx.shadowColor = theme.organColor;
      for (let o = 0; o < 4; o++) {
        const oAngle = (o * Math.PI) / 2 + j.pulseTimer * 0.5;
        const ox = Math.cos(oAngle) * (j.size * 0.25);
        const oy = Math.sin(oAngle) * (j.size * 0.2) - j.size * 0.1;
        ctx.beginPath();
        ctx.arc(ox, oy, j.size * 0.15, 0, Math.PI * 2);
        ctx.fill();
      }

      // Trailing Tentacles Physics
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = theme.primaryGlow;
      for (let t = 0; t < 6; t++) {
        const txOffset = (t - 2.5) * (bellWidth * 0.3);
        ctx.beginPath();
        ctx.moveTo(txOffset, bellHeight * 0.3);

        let curX = txOffset;
        let curY = bellHeight * 0.3;
        for (let seg = 1; seg <= 5; seg++) {
          const wave = Math.sin(j.pulseTimer * 2 + t + seg * 0.6) * (6 + seg * 2);
          curX += wave * 0.4 - j.vx * 2;
          curY += 12 - j.vy * 1.5;
          ctx.lineTo(curX, curY);
        }
        ctx.stroke();
      }

      ctx.restore();
    });

    // 7. Update & Render Siphonophore Organism
    if (entitiesRef.current.siphonophore) {
      const sipho = entitiesRef.current.siphonophore;
      sipho.phase += 0.025;

      // Head leads toward center or mouse lure
      const head = sipho.nodes[0];
      let targetX = width * 0.5 + Math.sin(sipho.phase * 0.7) * (width * 0.3);
      let targetY = height * 0.35 + Math.cos(sipho.phase * 0.5) * (height * 0.2);

      if (mouseMode === "lure" && mouse.x > 0) {
        targetX = mouse.x;
        targetY = mouse.y;
      }

      head.vx += (targetX - head.x) * 0.01;
      head.vy += (targetY - head.y) * 0.01;
      head.vx *= 0.92;
      head.vy *= 0.92;
      head.x += head.vx;
      head.y += head.vy;

      // Chain Inverse Kinematics / Follower Nodes
      for (let n = 1; n < sipho.nodes.length; n++) {
        const prev = sipho.nodes[n - 1];
        const curr = sipho.nodes[n];
        const cDx = prev.x - curr.x;
        const cDy = prev.y - curr.y;
        const cDist = Math.sqrt(cDx * cDx + cDy * cDy) || 1;
        const targetDist = 14;

        if (cDist > targetDist) {
          const factor = (cDist - targetDist) / cDist;
          curr.x += cDx * factor * 0.65;
          curr.y += cDy * factor * 0.65;
        }

        // Draw Bioluminescent Siphonophore Nectophore Segment
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = theme.primaryGlow;
        ctx.fillStyle = n === 0 ? theme.organColor : theme.secondaryGlow;
        ctx.beginPath();
        ctx.arc(curr.x, curr.y, Math.max(3, 9 - n * 0.3), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    requestRef.current = requestAnimationFrame(renderFrame);
  }, [
    isPlaying,
    depthMeters,
    planktonDensity,
    jellyCount,
    fluidViscosity,
    currentVelX,
    currentVelY,
    luciferinDecay,
    glowIntensity,
    mouseMode,
    theme,
    playBioluminescentChime,
  ]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(renderFrame);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [renderFrame]);

  // ---------------------------------------------------------------------------
  // MOUSE & TOUCH EVENT HANDLERS
  // ---------------------------------------------------------------------------
  const handleMouseMove = (e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const prev = mousePosRef.current;
    mousePosRef.current = {
      x,
      y,
      vx: x - prev.lastX,
      vy: y - prev.lastY,
      lastX: x,
      lastY: y,
    };
  };

  const handleMouseDown = (e) => {
    isMouseDownRef.current = true;
    handleMouseMove(e);
    initAudio();
  };

  const handleMouseUp = () => {
    isMouseDownRef.current = false;
  };

  const handleMouseLeave = () => {
    isMouseDownRef.current = false;
    mousePosRef.current = { x: -1000, y: -1000, vx: 0, vy: 0, lastX: -1000, lastY: -1000 };
  };

  // Preset Selector Quick Switch
  const applyPreset = (presetKey) => {
    setActiveTheme(presetKey);
    if (presetKey === "hadopelagic") {
      setDepthMeters(8500);
      setPlanktonDensity(300);
      setJellyCount(3);
      setFluidViscosity(0.96);
      setCurrentVelX(0.2);
      setGlowIntensity(1.3);
    } else if (presetKey === "neonBloom") {
      setDepthMeters(2500);
      setPlanktonDensity(600);
      setJellyCount(5);
      setFluidViscosity(0.98);
      setCurrentVelX(0.8);
      setGlowIntensity(2.2);
    } else if (presetKey === "thermalVent") {
      setDepthMeters(4000);
      setPlanktonDensity(350);
      setJellyCount(2);
      setVentCount(4);
      setCurrentVelY(-1.2);
      setGlowIntensity(1.8);
    } else if (presetKey === "violetAbyss") {
      setDepthMeters(6000);
      setPlanktonDensity(450);
      setJellyCount(6);
      setFluidViscosity(0.95);
      setGlowIntensity(1.9);
    } else if (presetKey === "arcticDepths") {
      setDepthMeters(10500);
      setPlanktonDensity(250);
      setJellyCount(3);
      setFluidViscosity(0.97);
      setCurrentVelX(-0.5);
      setGlowIntensity(1.4);
    }
    playSonarPing();
  };

  // Export Snapshot Image
  const exportSnapshot = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `bioluminescent-abyss-${activeTheme}-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 font-sans text-slate-100">
      {/* Outer Studio Card Container */}
      <div
        className={`relative overflow-hidden rounded-3xl border ${theme.border} ${theme.cardBg} shadow-2xl transition-colors duration-500`}
      >
        {/* Header Bar */}
        <div className="p-5 md:p-6 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-4 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-400 p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <span className="text-xl">🌌</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                  Bioluminescent Abyss Studio
                </h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${theme.badge}`}
                >
                  Abyssal Hydrodynamics
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-400">
                Deep-sea luciferin reaction physics, fluid dynamics & creature luminescence
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isPlaying
                  ? "bg-slate-800 hover:bg-slate-700 text-slate-200"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white"
              }`}
            >
              {isPlaying ? "⏸ Pause" : "▶ Resume"}
            </button>

            <button
              onClick={toggleAudio}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                !isMuted
                  ? "bg-cyan-600/30 text-cyan-300 border border-cyan-500/40"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-400"
              }`}
            >
              {!isMuted ? "🔊 Audio On" : "🔇 Audio Muted"}
            </button>

            <button
              onClick={exportSnapshot}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all flex items-center gap-1"
            >
              📷 Snapshot
            </button>

            <button
              onClick={() => applyPreset(activeTheme)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all"
            >
              🔄 Reset
            </button>
          </div>
        </div>

        {/* Main Canvas & Controls Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Left Canvas Viewport (8 cols) */}
          <div
            ref={containerRef}
            className="lg:col-span-8 relative min-h-[460px] md:min-h-[540px] bg-black cursor-crosshair overflow-hidden group select-none"
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          >
            <canvas ref={canvasRef} className="w-full h-full block" />

            {/* Mouse Tool Indicator Overlay */}
            <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center gap-2 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span>Tool: </span>
              <span className={`font-semibold capitalize ${theme.accentText}`}>
                {mouseMode}
              </span>
            </div>

            {/* Canvas Preset Quick Pills Overlay */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-2 pointer-events-none flex-wrap">
              <div className="flex items-center gap-1.5 pointer-events-auto bg-slate-950/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800">
                {Object.keys(THEMES).map((key) => (
                  <button
                    key={key}
                    onClick={() => applyPreset(key)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all ${
                      activeTheme === key
                        ? `${THEMES[key].buttonBg} font-semibold`
                        : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                    }`}
                  >
                    {THEMES[key].name.split(" ")[0]}
                  </button>
                ))}
              </div>

              <div className="pointer-events-auto bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-400 font-mono">
                {depthMeters.toLocaleString()}m Depth
              </div>
            </div>
          </div>

          {/* Right Sidebar Control Tabs (4 cols) */}
          <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-slate-800/80 bg-slate-950/60 p-5 flex flex-col justify-between">
            <div>
              {/* Tab Navigation Header */}
              <div className="grid grid-cols-4 gap-1 p-1 bg-slate-900/90 rounded-2xl border border-slate-800 mb-5">
                {[
                  { id: "hydro", label: "Hydro" },
                  { id: "bio", label: "Luciferin" },
                  { id: "creatures", label: "Ecology" },
                  { id: "audio", label: "Audio" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      activeTab === tab.id
                        ? "bg-slate-800 text-white shadow"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab 1: Ocean Hydrodynamics Controls */}
              {activeTab === "hydro" && (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-300">Abyssal Depth Zone</span>
                      <span className="font-mono text-cyan-400">{depthMeters} m</span>
                    </div>
                    <input
                      type="range"
                      min="1000"
                      max="11000"
                      step="250"
                      value={depthMeters}
                      onChange={(e) => setDepthMeters(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-300">Fluid Viscosity / Drag</span>
                      <span className="font-mono text-cyan-400">{fluidViscosity}</span>
                    </div>
                    <input
                      type="range"
                      min="0.90"
                      max="0.99"
                      step="0.01"
                      value={fluidViscosity}
                      onChange={(e) => setFluidViscosity(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-300">Current Velocity X</span>
                      <span className="font-mono text-cyan-400">{currentVelX} m/s</span>
                    </div>
                    <input
                      type="range"
                      min="-2.0"
                      max="2.0"
                      step="0.1"
                      value={currentVelX}
                      onChange={(e) => setCurrentVelX(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-300">Current Velocity Y</span>
                      <span className="font-mono text-cyan-400">{currentVelY} m/s</span>
                    </div>
                    <input
                      type="range"
                      min="-2.0"
                      max="2.0"
                      step="0.1"
                      value={currentVelY}
                      onChange={(e) => setCurrentVelY(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                  </div>
                </div>
              )}

              {/* Tab 2: Bioluminescence & Bio-Luciferin Controls */}
              {activeTab === "bio" && (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-300">Glow Intensity Radii</span>
                      <span className="font-mono text-emerald-400">{glowIntensity}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="3.0"
                      step="0.1"
                      value={glowIntensity}
                      onChange={(e) => setGlowIntensity(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-300">Luciferin Decay Rate</span>
                      <span className="font-mono text-emerald-400">{luciferinDecay}</span>
                    </div>
                    <input
                      type="range"
                      min="0.005"
                      max="0.08"
                      step="0.005"
                      value={luciferinDecay}
                      onChange={(e) => setLuciferinDecay(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-300">Plankton Swarm Density</span>
                      <span className="font-mono text-emerald-400">{planktonDensity}</span>
                    </div>
                    <input
                      type="range"
                      min="100"
                      max="700"
                      step="25"
                      value={planktonDensity}
                      onChange={(e) => setPlanktonDensity(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>
                </div>
              )}

              {/* Tab 3: Ecology & Creatures Controls */}
              {activeTab === "creatures" && (
                <div className="space-y-4">
                  <div>
                    <span className="text-xs text-slate-300 block mb-2">
                      Interactive Cursor Tool
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "shockwave", label: "🌊 Ripple" },
                        { id: "lure", label: "💡 Lure" },
                        { id: "brush", label: "✨ Brush" },
                      ].map((tool) => (
                        <button
                          key={tool.id}
                          onClick={() => setMouseMode(tool.id)}
                          className={`py-2 rounded-xl text-xs font-semibold transition-all border ${
                            mouseMode === tool.id
                              ? `${theme.badge} border-opacity-100`
                              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {tool.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-300">Deep-Sea Jellyfish Count</span>
                      <span className="font-mono text-purple-400">{jellyCount}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="8"
                      step="1"
                      value={jellyCount}
                      onChange={(e) => setJellyCount(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-300">Hydrothermal Vent Chimneys</span>
                      <span className="font-mono text-purple-400">{ventCount}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="1"
                      value={ventCount}
                      onChange={(e) => setVentCount(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>
                </div>
              )}

              {/* Tab 4: Audio Controls */}
              {activeTab === "audio" && (
                <div className="space-y-4">
                  <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-white">Ocean Synth Audio</div>
                      <div className="text-[11px] text-slate-400">
                        Sub-bass drone & bio-chime generator
                      </div>
                    </div>
                    <button
                      onClick={toggleAudio}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        !isMuted
                          ? "bg-cyan-600 text-white"
                          : "bg-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {!isMuted ? "Active" : "Enable"}
                    </button>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-300">Master Gain Volume</span>
                      <span className="font-mono text-sky-400">
                        {Math.round(volume * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="1.0"
                      step="0.05"
                      value={volume}
                      onChange={(e) => setVolume(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-300">Sonar Sparkle Pitch</span>
                      <span className="font-mono text-sky-400">{sonarPitch} Hz</span>
                    </div>
                    <input
                      type="range"
                      min="400"
                      max="1600"
                      step="50"
                      value={sonarPitch}
                      onChange={(e) => setSonarPitch(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Live Telemetry Metrics Card */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/60">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                  Hydro Pressure
                </div>
                <div className="text-sm font-semibold font-mono text-cyan-400 mt-0.5">
                  {(1000 + (depthMeters / 10) * 1.025).toFixed(1)} bar
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/60">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                  Bio Radiant Flux
                </div>
                <div className="text-sm font-semibold font-mono text-emerald-400 mt-0.5">
                  {bioEnergyFlux} µW/cm²
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/60">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                  Active Biolumes
                </div>
                <div className="text-sm font-semibold font-mono text-purple-400 mt-0.5">
                  {activeExcitedCount} node
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/60">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                  Render Rate
                </div>
                <div className="text-sm font-semibold font-mono text-amber-400 mt-0.5">
                  {fps} FPS
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
