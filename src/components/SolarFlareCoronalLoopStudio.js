import React, { useState, useEffect, useRef, useCallback } from "react";

// Wavelength Spectrum Presets based on NASA SDO / Extreme Ultraviolet Solar Instruments
const SPECTRUMS = {
  sdo171: {
    id: "sdo171",
    name: "SDO 171 Å (Fe IX Gold Corona)",
    bg: "from-amber-950/40 via-slate-950 to-amber-900/30",
    canvasBg: "#060401",
    accentText: "text-amber-400",
    accentBorder: "border-amber-500/40",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    buttonBg: "bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold",
    loopColors: ["#fef08a", "#f59e0b", "#d97706", "#b45309"],
    flareColor: "#ffffff",
    sparkColor: "#fef08a",
    particleColor: "#fcd34d",
    sunspotColor: "#78350f",
    glowColor: "rgba(245, 158, 11, 0.4)",
  },
  sdo304: {
    id: "sdo304",
    name: "SDO 304 Å (He II Crimson Prominence)",
    bg: "from-rose-950/40 via-slate-950 to-red-900/30",
    canvasBg: "#080103",
    accentText: "text-rose-400",
    accentBorder: "border-rose-500/40",
    badge: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    buttonBg: "bg-rose-600 hover:bg-rose-500 text-white font-bold",
    loopColors: ["#fecdd3", "#fb7185", "#e11d48", "#9f1239"],
    flareColor: "#fff1f2",
    sparkColor: "#fda4af",
    particleColor: "#f43f5e",
    sunspotColor: "#4c0519",
    glowColor: "rgba(225, 29, 72, 0.4)",
  },
  sdo193: {
    id: "sdo193",
    name: "SDO 193 Å (Iron XII Bronze Hole)",
    bg: "from-orange-950/40 via-slate-950 to-stone-900/30",
    canvasBg: "#070402",
    accentText: "text-orange-400",
    accentBorder: "border-orange-500/40",
    badge: "bg-orange-500/20 text-orange-300 border-orange-500/40",
    buttonBg: "bg-orange-600 hover:bg-orange-500 text-slate-950 font-bold",
    loopColors: ["#ffedd5", "#fb923c", "#ea580c", "#9a3412"],
    flareColor: "#ffffff",
    sparkColor: "#fed7aa",
    particleColor: "#f97316",
    sunspotColor: "#431407",
    glowColor: "rgba(234, 88, 12, 0.4)",
  },
  sdo131: {
    id: "sdo131",
    name: "SDO 131 Å (Fe XX/XXIII Teal Flare)",
    bg: "from-teal-950/40 via-slate-950 to-cyan-900/30",
    canvasBg: "#010808",
    accentText: "text-teal-400",
    accentBorder: "border-teal-500/40",
    badge: "bg-teal-500/20 text-teal-300 border-teal-500/40",
    buttonBg: "bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold",
    loopColors: ["#ccfbf1", "#2dd4bf", "#0d9488", "#115e59"],
    flareColor: "#ffffff",
    sparkColor: "#99f6e4",
    particleColor: "#14b8a6",
    sunspotColor: "#042f2e",
    glowColor: "rgba(13, 148, 136, 0.4)",
  },
  magnetogram: {
    id: "magnetogram",
    name: "HMI Magnetogram (Violet Reconnection)",
    bg: "from-purple-950/40 via-slate-950 to-indigo-900/30",
    canvasBg: "#04010a",
    accentText: "text-purple-400",
    accentBorder: "border-purple-500/40",
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    buttonBg: "bg-purple-600 hover:bg-purple-500 text-white font-bold",
    loopColors: ["#f5d0fe", "#c084fc", "#9333ea", "#581c87"],
    flareColor: "#ffffff",
    sparkColor: "#e879f9",
    particleColor: "#a855f7",
    sunspotColor: "#3b0764",
    glowColor: "rgba(147, 51, 234, 0.4)",
  },
};

// Preset Solar Phenomenon Configurations
const PRESETS = [
  {
    id: "carrington_1859",
    name: "Carrington Event 1859 Superflare",
    desc: "Historic extreme solar storm with mega-twisted coronal magnetic flux ropes and intense flare reconnection bursts.",
    spectrum: "sdo171",
    sunspots: 5,
    magneticGauss: 6500,
    helicity: 85,
    plasmaVelocity: 850,
    particleDensity: 450,
    coronalWind: 950,
    showLoops: true,
    showFlow: true,
    showSparks: true,
    showWind: true,
  },
  {
    id: "ar12673",
    name: "Active Region AR12673 Arcades",
    desc: "Hyper-active sunspot complex with multi-tier coronal arcades generating rapid magnetic shearing.",
    spectrum: "sdo131",
    sunspots: 4,
    magneticGauss: 4800,
    helicity: 60,
    plasmaVelocity: 600,
    particleDensity: 350,
    coronalWind: 550,
    showLoops: true,
    showFlow: true,
    showSparks: true,
    showWind: false,
  },
  {
    id: "prominence_eruption",
    name: "Grand Filament Prominence Eruption",
    desc: "Gigantic cool plasma arc stretching into the upper corona before a violent CME magnetic snap.",
    spectrum: "sdo304",
    sunspots: 2,
    magneticGauss: 3200,
    helicity: 90,
    plasmaVelocity: 450,
    particleDensity: 400,
    coronalWind: 400,
    showLoops: true,
    showFlow: true,
    showSparks: true,
    showWind: true,
  },
  {
    id: "x9_superstorm",
    name: "X9.3 Extreme EUV Burst",
    desc: "Relativistic reconnection unleashing high-energy X-ray flares and plasma shockwave ripples.",
    spectrum: "magnetogram",
    sunspots: 6,
    magneticGauss: 7800,
    helicity: 75,
    plasmaVelocity: 950,
    particleDensity: 500,
    coronalWind: 1100,
    showLoops: true,
    showFlow: true,
    showSparks: true,
    showWind: true,
  },
];

export default function SolarFlareCoronalLoopStudio() {
  // State variables
  const [selectedSpectrum, setSelectedSpectrum] = useState("sdo171");
  const [activePreset, setActivePreset] = useState("carrington_1859");
  
  // Physics parameters
  const [sunspots, setSunspots] = useState(4);
  const [magneticGauss, setMagneticGauss] = useState(5000);
  const [helicity, setHelicity] = useState(50); // % loop twist
  const [plasmaVelocity, setPlasmaVelocity] = useState(500); // km/s
  const [particleDensity, setParticleDensity] = useState(300);
  const [coronalWind, setCoronalWind] = useState(500); // km/s
  
  // Feature Toggles
  const [showLoops, setShowLoops] = useState(true);
  const [showFlow, setShowFlow] = useState(true);
  const [showSparks, setShowSparks] = useState(true);
  const [showWind, setShowWind] = useState(true);
  const [showGlow, setShowGlow] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  
  // Telemetry HUD states
  const [flareClass, setFlareClass] = useState("C2.4");
  const [plasmaTemp, setPlasmaTemp] = useState("1.8 M K");
  const [activeParticleCount, setActiveParticleCount] = useState(0);
  const [flareActive, setFlareActive] = useState(false);
  const [flareEnergy, setFlareEnergy] = useState(0); // 0-100 flash intensity
  
  // References
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const audioCtxRef = useRef(null);
  const humGainRef = useRef(null);
  const windGainRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragTargetRef = useRef(null);

  const spectrum = SPECTRUMS[selectedSpectrum] || SPECTRUMS.sdo171;

  // Initialize Web Audio API synth
  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      // Low plasma hum oscillator
      const humOsc = ctx.createOscillator();
      const humGain = ctx.createGain();
      humOsc.type = "sine";
      humOsc.frequency.setValueAtTime(55, ctx.currentTime); // Low A note
      humGain.gain.setValueAtTime(0.04, ctx.currentTime);
      humOsc.connect(humGain);
      humGain.connect(ctx.destination);
      humOsc.start();
      humGainRef.current = humGain;

      // Coronal wind noise generator
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(320, ctx.currentTime);
      filter.Q.setValueAtTime(2.0, ctx.currentTime);

      const windGain = ctx.createGain();
      windGain.gain.setValueAtTime(0.015, ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(windGain);
      windGain.connect(ctx.destination);
      whiteNoise.start();
      windGainRef.current = windGain;

    } catch (e) {
      console.warn("Web Audio API not supported or blocked", e);
    }
  }, []);

  // Play snap crackle or flare sweep sound
  const playSnapAudio = useCallback((intensity = 1) => {
    if (!audioEnabled || !audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // Magnetic snap noise burst
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      
      const startFreq = 400 + Math.random() * 600 * intensity;
      const endFreq = 60 + Math.random() * 40;
      
      osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + 0.15);
      
      gain.gain.setValueAtTime(0.12 * intensity, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } catch (e) {
      // Audio error fallback silent
    }
  }, [audioEnabled]);

  // Trigger manual X-Class Solar Flare Reconnection Event
  const triggerFlareEvent = () => {
    setFlareActive(true);
    setFlareEnergy(100);
    playSnapAudio(2.5);
    
    // Telemetry burst update
    const classes = ["X5.2", "X8.7", "X12.4", "X18.1", "Superflare X25+"];
    const randomClass = classes[Math.floor(Math.random() * classes.length)];
    const temp = (12 + Math.random() * 14).toFixed(1);
    setFlareClass(randomClass);
    setPlasmaTemp(`${temp} M K`);
  };

  // Load Preset Configuration
  const handlePresetSelect = (presetId) => {
    const p = PRESETS.find((item) => item.id === presetId);
    if (!p) return;
    setActivePreset(p.id);
    setSelectedSpectrum(p.spectrum);
    setSunspots(p.sunspots);
    setMagneticGauss(p.magneticGauss);
    setHelicity(p.helicity);
    setPlasmaVelocity(p.plasmaVelocity);
    setParticleDensity(p.particleDensity);
    setCoronalWind(p.coronalWind);
    setShowLoops(p.showLoops);
    setShowFlow(p.showFlow);
    setShowSparks(p.showSparks);
    setShowWind(p.showWind);
  };

  // Reset parameters
  const handleReset = () => {
    handlePresetSelect("carrington_1859");
  };

  // Toggle sound
  const handleAudioToggle = () => {
    if (!audioEnabled) {
      initAudio();
      if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }
    } else {
      if (humGainRef.current) humGainRef.current.gain.value = 0;
      if (windGainRef.current) windGainRef.current.gain.value = 0;
    }
    setAudioEnabled(!audioEnabled);
  };

  // Canvas Snapshot Export
  const handleExportSnapshot = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `Solar_Flare_Studio_${selectedSpectrum}_${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  // Simulation Animation Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement.clientWidth || 800);
    let height = (canvas.height = Math.max(480, Math.floor(width * 0.58)));

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = Math.max(480, Math.floor(width * 0.58));
    };

    window.addEventListener("resize", handleResize);

    // Dynamic solar magnetic arcades structure setup
    const generateSunspotPairs = () => {
      const pairs = [];
      const baseY = height * 0.88; // Photosphere surface level
      const spacing = width / (sunspots + 1);

      for (let i = 0; i < sunspots; i++) {
        const cx = spacing * (i + 1);
        const loopSpan = 70 + (magneticGauss / 8000) * 110;
        const poleA = { x: cx - loopSpan * 0.5, y: baseY, polarity: +1 };
        const poleB = { x: cx + loopSpan * 0.5, y: baseY, polarity: -1 };
        
        // Multi-layered arcade loops per pair
        const arcadeCount = 4;
        const loops = [];
        for (let j = 1; j <= arcadeCount; j++) {
          const altitude = (j / arcadeCount) * (140 + (magneticGauss / 8000) * 200);
          const twistOffset = Math.sin((helicity / 100) * Math.PI) * (j * 15);
          loops.push({
            p1: poleA,
            p2: poleB,
            cp1: { x: poleA.x + twistOffset, y: baseY - altitude },
            cp2: { x: poleB.x - twistOffset, y: baseY - altitude },
            color: spectrum.loopColors[(j - 1) % spectrum.loopColors.length],
            height: altitude,
            id: `loop_${i}_${j}`,
          });
        }
        pairs.push({ poleA, poleB, loops });
      }
      return pairs;
    };

    let sunspotData = generateSunspotPairs();

    // Particle pool for plasma flow along bezier magnetic lines
    const particles = [];
    const createParticles = () => {
      particles.length = 0;
      sunspotData.forEach((spotPair) => {
        spotPair.loops.forEach((loop) => {
          const particlesPerLoop = Math.floor(particleDensity / (sunspots * 4));
          for (let p = 0; p < particlesPerLoop; p++) {
            particles.push({
              loop,
              t: Math.random(), // position along bezier curve (0 to 1)
              speed: 0.002 + (plasmaVelocity / 1000) * 0.008 + Math.random() * 0.003,
              size: 1.5 + Math.random() * 2.5,
              color: spectrum.loopColors[Math.floor(Math.random() * spectrum.loopColors.length)],
              alpha: 0.4 + Math.random() * 0.6,
            });
          }
        });
      });
    };

    createParticles();

    // Coronal Wind Particles
    const windParticles = [];
    for (let w = 0; w < 120; w++) {
      windParticles.push({
        x: Math.random() * width,
        y: Math.random() * (height * 0.8),
        vx: (Math.random() - 0.5) * 0.5,
        vy: -((coronalWind / 1200) * 2.5 + Math.random() * 1.2),
        size: 0.8 + Math.random() * 1.5,
        alpha: 0.2 + Math.random() * 0.5,
      });
    }

    // Reconnection Spark Arc Particles
    const sparks = [];
    const shockwaves = [];

    // Helper: Bezier curve calculation
    const getBezierPoint = (p1, cp1, cp2, p2, t) => {
      const u = 1 - t;
      const tt = t * t;
      const uu = u * u;
      const uuu = uu * u;
      const ttt = tt * t;

      let x = uuu * p1.x + 3 * uu * t * cp1.x + 3 * u * tt * cp2.x + ttt * p2.x;
      let y = uuu * p1.y + 3 * uu * t * cp1.y + 3 * u * tt * cp2.y + ttt * p2.y;
      return { x, y };
    };

    let frameCount = 0;

    const render = () => {
      if (isPlaying) frameCount++;

      // Canvas Background with spectral gradient
      ctx.fillStyle = spectrum.canvasBg;
      ctx.fillRect(0, 0, width, height);

      // Solar Photosphere Surface Edge Glow (Bottom Arc)
      const sunGradient = ctx.createLinearGradient(0, height * 0.82, 0, height);
      sunGradient.addColorStop(0, "rgba(0, 0, 0, 0)");
      sunGradient.addColorStop(0.5, spectrum.glowColor);
      sunGradient.addColorStop(1, spectrum.sunspotColor);
      ctx.fillStyle = sunGradient;
      ctx.fillRect(0, height * 0.82, width, height * 0.18);

      // Photosphere Granulation Baseline
      ctx.beginPath();
      ctx.moveTo(0, height * 0.88);
      for (let x = 0; x <= width; x += 30) {
        const waveY = height * 0.88 + Math.sin(x * 0.02 + frameCount * 0.05) * 3;
        ctx.lineTo(x, waveY);
      }
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.fillStyle = spectrum.sunspotColor;
      ctx.fill();

      // Render Coronal Wind Streamers
      if (showWind) {
        ctx.fillStyle = spectrum.particleColor;
        windParticles.forEach((wp) => {
          if (isPlaying) {
            wp.y += wp.vy;
            wp.x += wp.vx;
            if (wp.y < 0) {
              wp.y = height * 0.82;
              wp.x = Math.random() * width;
            }
          }
          ctx.globalAlpha = wp.alpha * 0.4;
          ctx.beginPath();
          ctx.arc(wp.x, wp.y, wp.size, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1.0;
      }

      // Render Magnetic Arcade Loops
      sunspotData.forEach((spotPair) => {
        // Draw Sunspot Footpoints
        ctx.beginPath();
        ctx.arc(spotPair.poleA.x, spotPair.poleA.y, 8, 0, Math.PI * 2);
        ctx.arc(spotPair.poleB.x, spotPair.poleB.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = "#0a0a0f";
        ctx.fill();
        ctx.strokeStyle = spectrum.loopColors[1];
        ctx.lineWidth = 2;
        ctx.stroke();

        spotPair.loops.forEach((loop) => {
          if (showLoops) {
            ctx.beginPath();
            ctx.moveTo(loop.p1.x, loop.p1.y);
            ctx.bezierCurveTo(
              loop.cp1.x,
              loop.cp1.y + Math.sin(frameCount * 0.03 + loop.height) * 4,
              loop.cp2.x,
              loop.cp2.y + Math.cos(frameCount * 0.03 + loop.height) * 4,
              loop.p2.x,
              loop.p2.y
            );
            ctx.strokeStyle = loop.color;
            ctx.lineWidth = 2.2;
            ctx.globalAlpha = 0.65;
            ctx.stroke();

            // Thermal Glow Layer
            if (showGlow) {
              ctx.strokeStyle = spectrum.glowColor;
              ctx.lineWidth = 8;
              ctx.globalAlpha = 0.25;
              ctx.stroke();
            }
          }
        });
      });

      // Render Plasma Particles along Bezier Lines
      if (showFlow) {
        particles.forEach((p) => {
          if (isPlaying) {
            p.t += p.speed;
            if (p.t > 1) p.t = 0;
          }

          const pt = getBezierPoint(
            p.loop.p1,
            p.loop.cp1,
            p.loop.cp2,
            p.loop.p2,
            p.t
          );

          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1.0;
      }

      // Random Magnetic Reconnection Sparks
      if (showSparks && isPlaying && (Math.random() < (helicity / 100) * 0.35 || flareActive)) {
        const randomPair = sunspotData[Math.floor(Math.random() * sunspotData.length)];
        if (randomPair && randomPair.loops.length > 0) {
          const loopA = randomPair.loops[Math.floor(Math.random() * randomPair.loops.length)];
          const ptA = getBezierPoint(loopA.p1, loopA.cp1, loopA.cp2, loopA.p2, 0.5);
          
          sparks.push({
            x: ptA.x + (Math.random() - 0.5) * 30,
            y: ptA.y + (Math.random() - 0.5) * 30,
            life: 1.0,
            size: 2 + Math.random() * 4,
          });

          if (Math.random() < 0.1) {
            playSnapAudio(0.6);
          }
        }
      }

      // Render Sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        ctx.fillStyle = spectrum.sparkColor;
        ctx.globalAlpha = s.life;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();

        // Spark lightning jitter
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x + (Math.random() - 0.5) * 15, s.y + (Math.random() - 0.5) * 15);
        ctx.strokeStyle = spectrum.flareColor;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        if (isPlaying) s.life -= 0.08;
        if (s.life <= 0) sparks.splice(i, 1);
      }
      ctx.globalAlpha = 1.0;

      // Handle X-Class Flare Explosion Burst & Shockwaves
      if (flareActive) {
        if (shockwaves.length === 0) {
          shockwaves.push({
            x: width * 0.5,
            y: height * 0.6,
            radius: 10,
            maxRadius: width * 0.6,
            alpha: 1.0,
          });
        }

        // Screen Flash Effect
        ctx.fillStyle = spectrum.flareColor;
        ctx.globalAlpha = (flareEnergy / 100) * 0.35;
        ctx.fillRect(0, 0, width, height);
        ctx.globalAlpha = 1.0;

        if (isPlaying) {
          setFlareEnergy((prev) => {
            if (prev <= 1) {
              setFlareActive(false);
              return 0;
            }
            return prev - 2.5;
          });
        }
      }

      // Render CME Coronal Shockwave Ripples
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = spectrum.flareColor;
        ctx.lineWidth = 4;
        ctx.globalAlpha = sw.alpha;
        ctx.stroke();

        if (isPlaying) {
          sw.radius += 12;
          sw.alpha *= 0.94;
        }

        if (sw.alpha <= 0.01 || sw.radius >= sw.maxRadius) {
          shockwaves.splice(i, 1);
        }
      }
      ctx.globalAlpha = 1.0;

      // Update Telemetry HUD numbers periodically
      if (frameCount % 45 === 0) {
        setActiveParticleCount(particles.length + windParticles.length);
        if (!flareActive) {
          const flrNum = (1.0 + (helicity / 100) * 8.0 + (magneticGauss / 8000) * 3.0).toFixed(1);
          setFlareClass(helicity > 75 ? `M${flrNum}` : `C${flrNum}`);
          setPlasmaTemp(`${(1.2 + (magneticGauss / 8000) * 4.5).toFixed(1)} M K`);
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [
    selectedSpectrum,
    sunspots,
    magneticGauss,
    helicity,
    plasmaVelocity,
    particleDensity,
    coronalWind,
    showLoops,
    showFlow,
    showSparks,
    showWind,
    showGlow,
    isPlaying,
    flareActive,
    flareEnergy,
    spectrum,
    playSnapAudio,
  ]);

  // Handle Mouse Canvas Interaction (Drag Magnetic Arcades)
  const handleCanvasMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    isDraggingRef.current = true;
    dragTargetRef.current = { x: clickX, y: clickY };

    // Trigger local reconnection snap on click
    playSnapAudio(1.2);
  };

  const handleCanvasMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Dynamically adjust loop twist (helicity) based on mouse displacement
    const dx = Math.abs(mouseX - dragTargetRef.current.x);
    const newHelicity = Math.min(100, Math.max(10, helicity + Math.floor(dx * 0.1)));
    setHelicity(newHelicity);
  };

  const handleCanvasMouseUp = () => {
    isDraggingRef.current = false;
    dragTargetRef.current = null;
  };

  return (
    <div className={`w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 my-8 rounded-3xl bg-gradient-to-br ${spectrum.bg} border border-slate-800/80 backdrop-blur-2xl shadow-2xl transition-all duration-700 font-sans text-slate-100`}>
      
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 text-xs uppercase tracking-widest font-semibold rounded-full border ${spectrum.badge}`}>
              Solar MHD Physics Studio
            </span>
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Physics Engine
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Solar Flare & Coronal Loop Studio
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Simulate magnetic flux ropes, twisting coronal arcades, reconnection flares, and Coronal Mass Ejection (CME) shockwaves.
          </p>
        </div>

        {/* Action Controls & Preset Bar */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={triggerFlareEvent}
            className="px-4 py-2 text-sm rounded-xl font-bold bg-gradient-to-r from-amber-500 via-rose-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white shadow-lg shadow-rose-900/30 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Trigger X-Class Flare 💥
          </button>

          <button
            onClick={handleAudioToggle}
            className={`px-3 py-2 text-sm rounded-xl border font-medium transition-all ${
              audioEnabled
                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                : "bg-slate-900/60 border-slate-700/60 text-slate-400 hover:text-white"
            }`}
          >
            {audioEnabled ? "🔊 Sound ON" : "🔇 Sound OFF"}
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3 py-2 text-sm rounded-xl bg-slate-900/60 border border-slate-700/60 text-slate-300 hover:text-white transition-all"
          >
            {isPlaying ? "⏸ Pause" : "▶ Play"}
          </button>

          <button
            onClick={handleExportSnapshot}
            className="px-3 py-2 text-sm rounded-xl bg-slate-900/60 border border-slate-700/60 text-slate-300 hover:text-white transition-all"
          >
            📸 Snapshot
          </button>

          <button
            onClick={handleReset}
            className="px-3 py-2 text-sm rounded-xl bg-slate-900/60 border border-slate-700/60 text-slate-400 hover:text-white transition-all"
          >
            🔄 Reset
          </button>
        </div>
      </div>

      {/* Main Studio Viewport Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        
        {/* Main Interactive Canvas Stage */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner group">
            
            <canvas
              ref={canvasRef}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              className="w-full h-auto cursor-grab active:cursor-grabbing block"
            />

            {/* Interactive Canvas Overlay Instructions */}
            <div className="absolute top-3 left-3 pointer-events-none flex items-center gap-2 bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              Click/Drag canvas to twist loop helicity
            </div>

            {/* Telemetry Real-time HUD overlay */}
            <div className="absolute bottom-3 left-3 right-3 pointer-events-none grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-slate-950/80 backdrop-blur-md p-2.5 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 block text-[10px] uppercase">Flare Output</span>
                <span className={`font-mono font-bold text-sm ${spectrum.accentText}`}>{flareClass}</span>
              </div>
              <div className="bg-slate-950/80 backdrop-blur-md p-2.5 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 block text-[10px] uppercase">Plasma Temp</span>
                <span className="font-mono font-bold text-sm text-slate-200">{plasmaTemp}</span>
              </div>
              <div className="bg-slate-950/80 backdrop-blur-md p-2.5 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 block text-[10px] uppercase">Magnetic Field</span>
                <span className="font-mono font-bold text-sm text-slate-200">{magneticGauss} Gauss</span>
              </div>
              <div className="bg-slate-950/80 backdrop-blur-md p-2.5 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 block text-[10px] uppercase">Particles Active</span>
                <span className="font-mono font-bold text-sm text-emerald-400">{activeParticleCount}</span>
              </div>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2">Solar Presets:</span>
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => handlePresetSelect(p.id)}
                className={`px-3 py-1.5 text-xs rounded-xl border font-medium transition-all ${
                  activePreset === p.id
                    ? `${spectrum.badge} shadow-md`
                    : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Sidebar Controls & Parameters */}
        <div className="lg:col-span-4 flex flex-col gap-5 bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80 backdrop-blur-xl">
          
          {/* Wavelength Spectrum Selector */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
              SDO Wavelength Spectrum
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {Object.values(SPECTRUMS).map((spec) => (
                <button
                  key={spec.id}
                  onClick={() => setSelectedSpectrum(spec.id)}
                  className={`w-full text-left px-3 py-2 text-xs rounded-xl border transition-all flex items-center justify-between ${
                    selectedSpectrum === spec.id
                      ? `${spec.badge} font-bold shadow-md`
                      : "bg-slate-900/40 border-slate-800/60 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span>{spec.name}</span>
                  {selectedSpectrum === spec.id && <span className="text-xs">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Sliders Section */}
          <div className="space-y-4 pt-2 border-t border-slate-800/80">
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-300">Sunspot Active Pairs</span>
                <span className={`font-mono ${spectrum.accentText}`}>{sunspots}</span>
              </div>
              <input
                type="range"
                min="1"
                max="6"
                step="1"
                value={sunspots}
                onChange={(e) => setSunspots(parseInt(e.target.value))}
                className="w-full accent-amber-500 bg-slate-800 rounded-lg h-1.5 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-300">Magnetic Field (Gauss)</span>
                <span className={`font-mono ${spectrum.accentText}`}>{magneticGauss} G</span>
              </div>
              <input
                type="range"
                min="1000"
                max="8000"
                step="200"
                value={magneticGauss}
                onChange={(e) => setMagneticGauss(parseInt(e.target.value))}
                className="w-full accent-amber-500 bg-slate-800 rounded-lg h-1.5 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-300">Coronal Helicity (Loop Twist)</span>
                <span className={`font-mono ${spectrum.accentText}`}>{helicity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={helicity}
                onChange={(e) => setHelicity(parseInt(e.target.value))}
                className="w-full accent-amber-500 bg-slate-800 rounded-lg h-1.5 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-300">Plasma Velocity (km/s)</span>
                <span className={`font-mono ${spectrum.accentText}`}>{plasmaVelocity} km/s</span>
              </div>
              <input
                type="range"
                min="100"
                max="1000"
                step="50"
                value={plasmaVelocity}
                onChange={(e) => setPlasmaVelocity(parseInt(e.target.value))}
                className="w-full accent-amber-500 bg-slate-800 rounded-lg h-1.5 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-300">Coronal Wind Speed</span>
                <span className={`font-mono ${spectrum.accentText}`}>{coronalWind} km/s</span>
              </div>
              <input
                type="range"
                min="200"
                max="1200"
                step="50"
                value={coronalWind}
                onChange={(e) => setCoronalWind(parseInt(e.target.value))}
                className="w-full accent-amber-500 bg-slate-800 rounded-lg h-1.5 cursor-pointer"
              />
            </div>
          </div>

          {/* Feature Toggles */}
          <div className="pt-2 border-t border-slate-800/80">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
              Visual Layer Toggles
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setShowLoops(!showLoops)}
                className={`px-3 py-1.5 rounded-xl border transition-all ${
                  showLoops ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-900/40 border-slate-800 text-slate-500"
                }`}
              >
                Arcade Loops {showLoops ? "✓" : "✗"}
              </button>

              <button
                onClick={() => setShowFlow(!showFlow)}
                className={`px-3 py-1.5 rounded-xl border transition-all ${
                  showFlow ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-900/40 border-slate-800 text-slate-500"
                }`}
              >
                Plasma Flow {showFlow ? "✓" : "✗"}
              </button>

              <button
                onClick={() => setShowSparks(!showSparks)}
                className={`px-3 py-1.5 rounded-xl border transition-all ${
                  showSparks ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-900/40 border-slate-800 text-slate-500"
                }`}
              >
                Reconnection Sparks {showSparks ? "✓" : "✗"}
              </button>

              <button
                onClick={() => setShowWind(!showWind)}
                className={`px-3 py-1.5 rounded-xl border transition-all ${
                  showWind ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-900/40 border-slate-800 text-slate-500"
                }`}
              >
                Solar Wind {showWind ? "✓" : "✗"}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
