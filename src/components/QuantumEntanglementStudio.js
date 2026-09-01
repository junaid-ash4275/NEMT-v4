import React, { useState, useEffect, useRef, useCallback } from "react";

// Quantum Color Themes & Visual Tokens
const THEMES = {
  quantumCyan: {
    id: "quantumCyan",
    name: "Quantum Cyan Neon",
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    accentText: "text-cyan-400",
    border: "border-cyan-500/30",
    cardBg: "bg-slate-900/80 backdrop-blur-md border-cyan-500/20",
    buttonBg: "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25",
    canvasBg: "#030a14",
    primaryGlow: "#00f0ff",
    secondaryGlow: "#3b82f6",
    aliceColor: "#38bdf8",
    bobColor: "#818cf8",
    laserColor: "#22d3ee",
    gridLine: "rgba(6, 182, 212, 0.08)",
  },
  ultravioletPulse: {
    id: "ultravioletPulse",
    name: "Ultraviolet Pulse",
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    accentText: "text-purple-400",
    border: "border-purple-500/30",
    cardBg: "bg-slate-900/80 backdrop-blur-md border-purple-500/20",
    buttonBg: "bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white shadow-lg shadow-purple-500/25",
    canvasBg: "#090414",
    primaryGlow: "#c084fc",
    secondaryGlow: "#e879f9",
    aliceColor: "#a855f7",
    bobColor: "#f0abfc",
    laserColor: "#d8b4fe",
    gridLine: "rgba(168, 85, 247, 0.08)",
  },
  emeraldLaser: {
    id: "emeraldLaser",
    name: "Laser Emerald Grid",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    accentText: "text-emerald-400",
    border: "border-emerald-500/30",
    cardBg: "bg-slate-900/80 backdrop-blur-md border-emerald-500/20",
    buttonBg: "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25",
    canvasBg: "#02120a",
    primaryGlow: "#10b981",
    secondaryGlow: "#34d399",
    aliceColor: "#34d399",
    bobColor: "#2dd4bf",
    laserColor: "#6ee7b7",
    gridLine: "rgba(16, 185, 129, 0.08)",
  },
  solarFusion: {
    id: "solarFusion",
    name: "Solar Fusion Plasma",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    accentText: "text-amber-400",
    border: "border-amber-500/30",
    cardBg: "bg-slate-900/80 backdrop-blur-md border-amber-500/20",
    buttonBg: "bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white shadow-lg shadow-amber-500/25",
    canvasBg: "#140702",
    primaryGlow: "#f59e0b",
    secondaryGlow: "#f43f5e",
    aliceColor: "#fbbf24",
    bobColor: "#fb7185",
    laserColor: "#fde047",
    gridLine: "rgba(245, 158, 11, 0.08)",
  },
};

// Quantum Presets
const PRESETS = {
  phiPlus: {
    id: "phiPlus",
    name: "Bell State |Φ⁺⟩",
    symbol: "|Φ⁺⟩ = 1/√2(|00⟩ + |11⟩)",
    desc: "Maximally entangled pair with identical correlated spin polarizations.",
    aliceTheta: 0,
    alicePhi: 0,
    bobTheta: 0,
    bobPhi: 0,
    polarizerA: 0,
    polarizerB: 0,
  },
  phiMinus: {
    id: "phiMinus",
    name: "Bell State |Φ⁻⟩",
    symbol: "|Φ⁻⟩ = 1/√2(|00⟩ - |11⟩)",
    desc: "Maximally entangled pair with 180° quantum phase anti-correlation.",
    aliceTheta: 0,
    alicePhi: Math.PI,
    bobTheta: 0,
    bobPhi: 0,
    polarizerA: 0,
    polarizerB: 90,
  },
  psiPlus: {
    id: "psiPlus",
    name: "Bell State |Ψ⁺⟩",
    symbol: "|Ψ⁺⟩ = 1/√2(|01⟩ + |10⟩)",
    desc: "Maximally entangled pair with inverted symmetric spin states.",
    aliceTheta: Math.PI / 2,
    alicePhi: 0,
    bobTheta: Math.PI / 2,
    bobPhi: Math.PI,
    polarizerA: 45,
    polarizerB: 45,
  },
  psiMinus: {
    id: "psiMinus",
    name: "Bell Singlet |Ψ⁻⟩",
    symbol: "|Ψ⁻⟩ = 1/√2(|01⟩ - |10⟩)",
    desc: "Antisymmetric singlet state with total zero angular momentum.",
    aliceTheta: Math.PI,
    alicePhi: 0,
    bobTheta: 0,
    bobPhi: 0,
    polarizerA: 0,
    polarizerB: 90,
  },
  chshTest: {
    id: "chshTest",
    name: "EPR Paradox (CHSH Test)",
    symbol: "S = 2√2 ≈ 2.828 > 2.0",
    desc: "Demonstrates quantum non-locality violating local hidden variable theories.",
    aliceTheta: Math.PI / 4,
    alicePhi: 0,
    bobTheta: Math.PI / 8,
    bobPhi: 0,
    polarizerA: 0,
    polarizerB: 22.5,
  },
  teleportation: {
    id: "teleportation",
    name: "Quantum Teleportation",
    symbol: "|ψ⟩ → Alice ⎯(2 bits)⎯> Bob → |ψ⟩",
    desc: "Disembodies unknown quantum state |ψ⟩ at Alice and reconstitutes it perfectly at Bob.",
    aliceTheta: Math.PI / 3,
    alicePhi: Math.PI / 4,
    bobTheta: 0,
    bobPhi: 0,
    polarizerA: 30,
    polarizerB: 60,
  },
};

export default function QuantumEntanglementStudio() {
  // Active Theme & Preset State
  const [activeTheme, setActiveTheme] = useState("quantumCyan");
  const [activePreset, setActivePreset] = useState("phiPlus");

  // Physics & Simulation Controls
  const [isRunning, setIsRunning] = useState(true);
  const [laserPower, setLaserPower] = useState(80); // %
  const [decoherence, setDecoherence] = useState(5); // %
  const [simSpeed, setSimSpeed] = useState(1.0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // Qubit Angle Controls (Spherical coords θ, φ)
  const [aliceTheta, setAliceTheta] = useState(PRESETS.phiPlus.aliceTheta);
  const [alicePhi, setAlicePhi] = useState(PRESETS.phiPlus.alicePhi);
  const [polarizerA, setPolarizerA] = useState(0); // degrees
  const [polarizerB, setPolarizerB] = useState(0); // degrees

  // Quantum Teleportation Protocol Interactive State
  const [teleportStep, setTeleportStep] = useState(0); // 0: Idle, 1: Entangled, 2: Input Qubit Prepared, 3: Bell Measurement, 4: Classical Transmission, 5: State Reconstructed
  const [classicalBits, setClassicalBits] = useState(null); // "00", "01", "10", "11"
  const [teleportFidelity, setTeleportFidelity] = useState(100);

  // Canvas Refs & Animation Frame
  const canvasRef = useRef(null);
  const animFrameId = useRef(null);
  const timeRef = useRef(0);
  const particlesRef = useRef([]);

  // Audio Context Ref
  const audioCtxRef = useRef(null);

  const theme = THEMES[activeTheme];

  // Web Audio API Sound Generator
  const playQuantumTone = useCallback(
    (freq = 440, type = "sine", duration = 0.15) => {
      if (!soundEnabled) return;
      try {
        if (!audioCtxRef.current) {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          audioCtxRef.current = new AudioContext();
        }
        if (audioCtxRef.current.state === "suspended") {
          audioCtxRef.current.resume();
        }
        const ctx = audioCtxRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + duration);
      } catch (e) {
        // Audio playback error fallback
      }
    },
    [soundEnabled]
  );

  // Apply Preset Selection
  const handleSelectPreset = (key) => {
    const p = PRESETS[key];
    if (!p) return;
    setActivePreset(key);
    setAliceTheta(p.aliceTheta);
    setAlicePhi(p.alicePhi);
    setPolarizerA(p.polarizerA);
    setPolarizerB(p.polarizerB);
    setTeleportStep(key === "teleportation" ? 1 : 0);
    setClassicalBits(null);
    setTeleportFidelity(100);
    playQuantumTone(523.25, "sine", 0.2); // C5 tone
  };

  // Step-by-Step Teleportation Handler
  const handleNextTeleportStep = () => {
    const next = (teleportStep + 1) % 6;
    setTeleportStep(next);

    if (next === 3) {
      // Simulate Bell Measurement outcome randomly among 00, 01, 10, 11
      const outcomes = ["00", "01", "10", "11"];
      const bit = outcomes[Math.floor(Math.random() * outcomes.length)];
      setClassicalBits(bit);
      playQuantumTone(659.25, "triangle", 0.3); // E5
    } else if (next === 5) {
      // Final Teleportation Reconstruction with high fidelity
      const decLoss = (decoherence / 100) * 15;
      setTeleportFidelity(Math.max(85, +(100 - decLoss).toFixed(1)));
      playQuantumTone(880, "sine", 0.4); // A5 high chime
    } else {
      playQuantumTone(440 + next * 50, "sine", 0.15);
    }
  };

  // Canvas Drawing Routine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Handle HiDPI Canvas Scaling
    const updateCanvasDimensions = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    updateCanvasDimensions();
    window.addEventListener("resize", updateCanvasDimensions);

    // Initialize Photon Particle Array
    if (particlesRef.current.length === 0) {
      const pts = [];
      for (let i = 0; i < 40; i++) {
        pts.push({
          x: 0,
          progress: Math.random(),
          speed: 0.005 + Math.random() * 0.008,
          side: i % 2 === 0 ? "left" : "right",
          phase: Math.random() * Math.PI * 2,
          size: 2 + Math.random() * 3,
        });
      }
      particlesRef.current = pts;
    }

    // Animation Loop
    const render = () => {
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);
      const centerY = height * 0.45;
      const crystalX = width * 0.5;
      const aliceX = width * 0.18;
      const bobX = width * 0.82;

      if (isRunning) {
        timeRef.current += 0.02 * simSpeed;
      }
      const t = timeRef.current;

      // 1. Clear & Background Grid
      ctx.fillStyle = theme.canvasBg;
      ctx.fillRect(0, 0, width, height);

      // Subtle Background Grid
      ctx.strokeStyle = theme.gridLine;
      ctx.lineWidth = 1;
      const gridSize = 32;
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

      // 2. Optical Rail / Fiber Channel Line
      ctx.beginPath();
      ctx.moveTo(aliceX - 40, centerY);
      ctx.lineTo(bobX + 40, centerY);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
      ctx.lineWidth = 4;
      ctx.stroke();

      // Laser Pump Beam (Center top to SPDC Crystal)
      const pumpIntensity = laserPower / 100;
      ctx.beginPath();
      ctx.moveTo(crystalX, 20);
      ctx.lineTo(crystalX, centerY);
      ctx.strokeStyle = `rgba(168, 85, 247, ${0.4 * pumpIntensity + 0.3 * Math.sin(t * 5)})`;
      ctx.lineWidth = 6 * pumpIntensity;
      ctx.shadowColor = "#a855f7";
      ctx.shadowBlur = 15;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 3. SPDC Crystal (Beta Barium Borate / BBO)
      ctx.save();
      ctx.translate(crystalX, centerY);
      ctx.rotate(Math.sin(t * 0.5) * 0.05);

      // Glowing Diamond Crystal Body
      ctx.beginPath();
      ctx.moveTo(0, -24);
      ctx.lineTo(20, 0);
      ctx.lineTo(0, 24);
      ctx.lineTo(-20, 0);
      ctx.closePath();

      const crystalGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 28);
      crystalGrad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
      crystalGrad.addColorStop(0.5, theme.primaryGlow);
      crystalGrad.addColorStop(1, "rgba(15, 23, 42, 0.8)");

      ctx.fillStyle = crystalGrad;
      ctx.shadowColor = theme.primaryGlow;
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.strokeStyle = theme.aliceColor;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // Crystal Label
      ctx.fillStyle = "rgba(226, 232, 240, 0.7)";
      ctx.font = "10px monospace";
      ctx.textAlign = "center";
      ctx.fillText("BBO Crystal (SPDC Pair Emitter)", crystalX, centerY + 38);

      // 4. Entangled Wave Packets (Alice Left Beam & Bob Right Beam)
      const radA = (polarizerA * Math.PI) / 180;
      const radB = (polarizerB * Math.PI) / 180;

      // Left Channel Wave (Alice)
      ctx.beginPath();
      for (let x = crystalX; x >= aliceX; x -= 2) {
        const dist = (crystalX - x) / (crystalX - aliceX);
        const wave = Math.sin(dist * Math.PI * 10 - t * 4) * 12 * Math.sin(dist * Math.PI);
        const wy = centerY + wave * Math.cos(radA);
        if (x === crystalX) ctx.moveTo(x, wy);
        else ctx.lineTo(x, wy);
      }
      ctx.strokeStyle = theme.aliceColor;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = theme.aliceColor;
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Right Channel Wave (Bob)
      ctx.beginPath();
      for (let x = crystalX; x <= bobX; x += 2) {
        const dist = (x - crystalX) / (bobX - crystalX);
        // Phase correlation according to active preset
        const phaseShift = activePreset === "phiMinus" ? Math.PI : 0;
        const wave = Math.sin(dist * Math.PI * 10 - t * 4 + phaseShift) * 12 * Math.sin(dist * Math.PI);
        const wy = centerY + wave * Math.cos(radB);
        if (x === crystalX) ctx.moveTo(x, wy);
        else ctx.lineTo(x, wy);
      }
      ctx.strokeStyle = theme.bobColor;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = theme.bobColor;
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 5. Polarizing Beam Splitters & Stations
      const drawStation = (x, name, angle, color, isAlice) => {
        ctx.save();
        ctx.translate(x, centerY);

        // Station Box Container
        ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.roundRect(-30, -40, 60, 80, 8);
        ctx.fill();
        ctx.stroke();

        // Polarizer Filter Line
        ctx.rotate((angle * Math.PI) / 180);
        ctx.beginPath();
        ctx.moveTo(0, -25);
        ctx.lineTo(0, 25);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 3;
        ctx.stroke();

        // Polarizer Arrow Heads
        ctx.beginPath();
        ctx.moveTo(-4, -20);
        ctx.lineTo(0, -26);
        ctx.lineTo(4, -20);
        ctx.moveTo(-4, 20);
        ctx.lineTo(0, 26);
        ctx.lineTo(4, 20);
        ctx.stroke();

        ctx.restore();

        // Labels
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(name, x, centerY - 50);

        ctx.fillStyle = color;
        ctx.font = "11px monospace";
        ctx.fillText(`θ = ${angle}°`, x, centerY + 55);
      };

      drawStation(aliceX, "ALICE (Station A)", polarizerA, theme.aliceColor, true);
      drawStation(bobX, "BOB (Station B)", polarizerB, theme.bobColor, false);

      // 6. Flying Photon Particles & Decoherence Noise
      if (isRunning) {
        const noiseFactor = decoherence / 100;
        particlesRef.current.forEach((p) => {
          p.progress += p.speed * simSpeed;
          if (p.progress > 1) p.progress = 0;

          const isLeft = p.side === "left";
          const px = isLeft
            ? crystalX - p.progress * (crystalX - aliceX)
            : crystalX + p.progress * (bobX - crystalX);

          const angleRad = isLeft ? radA : radB;
          const jitter = noiseFactor * (Math.random() - 0.5) * 16;
          const py = centerY + Math.sin(p.progress * Math.PI * 6 + p.phase) * 8 * Math.cos(angleRad) + jitter;

          ctx.beginPath();
          ctx.arc(px, py, p.size, 0, Math.PI * 2);
          ctx.fillStyle = isLeft ? theme.aliceColor : theme.bobColor;
          ctx.shadowColor = isLeft ? theme.aliceColor : theme.bobColor;
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        });
      }

      // 7. Classical Communication Link (Fiber optic arc during Teleportation)
      if (teleportStep >= 3) {
        ctx.beginPath();
        ctx.setLineDash([6, 6]);
        ctx.moveTo(aliceX, centerY + 40);
        ctx.quadraticCurveTo(width * 0.5, centerY + 110, bobX, centerY + 40);
        ctx.strokeStyle = teleportStep >= 4 ? "#f59e0b" : "rgba(245, 158, 11, 0.4)";
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.setLineDash([]);

        // Pulsing Classical Data Packet
        if (teleportStep === 4) {
          const packetProgress = (t * 2) % 1;
          const px = aliceX + packetProgress * (bobX - aliceX);
          const py = centerY + 40 + Math.sin(packetProgress * Math.PI) * 45;

          ctx.beginPath();
          ctx.arc(px, py, 7, 0, Math.PI * 2);
          ctx.fillStyle = "#fbbf24";
          ctx.shadowColor = "#f59e0b";
          ctx.shadowBlur = 15;
          ctx.fill();
          ctx.shadowBlur = 0;

          ctx.fillStyle = "#0f172a";
          ctx.font = "bold 9px monospace";
          ctx.textAlign = "center";
          ctx.fillText(classicalBits || "10", px, py + 3);
        }

        ctx.fillStyle = "#f59e0b";
        ctx.font = "10px monospace";
        ctx.textAlign = "center";
        ctx.fillText("Classical Bit Channel (2 Bits)", width * 0.5, centerY + 95);
      }

      // Render next frame
      animFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      window.removeEventListener("resize", updateCanvasDimensions);
    };
  }, [
    isRunning,
    theme,
    laserPower,
    decoherence,
    simSpeed,
    polarizerA,
    polarizerB,
    activePreset,
    teleportStep,
    classicalBits,
  ]);

  // CHSH Violation calculation
  const chshSVal = (
    2.828 * (1 - (decoherence / 100) * 0.35) * Math.cos(((polarizerA - polarizerB) * Math.PI) / 180)
  ).toFixed(3);
  const isCHSHViolated = Math.abs(chshSVal) > 2.0;

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6 text-slate-100 font-sans">
      {/* Header Banner */}
      <div className={`p-6 rounded-2xl ${theme.cardBg} border ${theme.border} relative overflow-hidden shadow-2xl`}>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 text-xs font-bold rounded-full border ${theme.badge} tracking-wide uppercase`}>
                Quantum Physics & Optics Lab
              </span>
              <span className="text-xs text-slate-400 font-mono">v3.8 • 60 FPS</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight mt-2 text-white flex items-center gap-3">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                Quantum Entanglement & Teleportation Studio
              </span>
            </h1>
            <p className="text-slate-300 text-sm md:text-base mt-1 max-w-3xl">
              Explore EPR Bell pairs, photon spin polarization, quantum non-locality, CHSH inequality tests, and step-by-step Quantum Teleportation protocols.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                isRunning
                  ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                  : theme.buttonBg
              }`}
            >
              {isRunning ? "⏸️ Pause" : "▶️ Play"}
            </button>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`px-3.5 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                soundEnabled
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                  : "bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200"
              }`}
              title="Toggle Audio Feedback"
            >
              {soundEnabled ? "🔊 Sound ON" : "🔇 Mute"}
            </button>

            <button
              onClick={() => setShowInfo(!showInfo)}
              className="px-3.5 py-2.5 rounded-xl text-sm font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
            >
              {showInfo ? "📖 Close Guide" : "ℹ️ Physics Info"}
            </button>
          </div>
        </div>
      </div>

      {/* Educational Collapsible Information Drawer */}
      {showInfo && (
        <div className={`p-5 rounded-2xl ${theme.cardBg} border ${theme.border} space-y-4 text-sm leading-relaxed text-slate-300`}>
          <h3 className={`text-base font-bold ${theme.accentText} flex items-center gap-2`}>
            🔬 Quantum Entanglement & Teleportation Principles
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-1.5">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider text-cyan-400">1. Spontaneous Parametric Down-Conversion (SPDC)</h4>
              <p className="text-xs">
                A non-linear BBO crystal absorbs a high-energy UV laser photon and spontaneously splits it into two lower-energy entangled daughter photons (Signal & Idler) with complementary quantum states.
              </p>
            </div>
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-1.5">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider text-purple-400">2. Quantum Non-Locality & CHSH Inequality</h4>
              <p className="text-xs">
                Measuring Alice's photon instantaneously fixes the state of Bob's photon regardless of distance. When CHSH metric <span className="font-mono text-amber-300">S &gt; 2.0</span>, local hidden variable theories are conclusively disproven!
              </p>
            </div>
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-1.5">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider text-emerald-400">3. Quantum Teleportation Protocol</h4>
              <p className="text-xs">
                Alice performs a joint Bell-state measurement on an unknown Qubit |ψ⟩ and her half of the entangled pair. By sending only 2 classical bits to Bob, Bob applies Pauli gates to perfectly reconstruct |ψ⟩!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Interactive Canvas Display */}
      <div className={`relative rounded-2xl ${theme.cardBg} border ${theme.border} overflow-hidden shadow-2xl`}>
        {/* Top Controls Overlay */}
        <div className="p-4 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-4 bg-slate-950/40 backdrop-blur-md">
          {/* Preset Selector Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {Object.keys(PRESETS).map((key) => {
              const p = PRESETS[key];
              const isActive = activePreset === key;
              return (
                <button
                  key={key}
                  onClick={() => handleSelectPreset(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? theme.buttonBg
                      : "bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  {p.name}
                </button>
              );
            })}
          </div>

          {/* Theme Chooser */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Theme:</span>
            <div className="flex items-center gap-1">
              {Object.keys(THEMES).map((tKey) => (
                <button
                  key={tKey}
                  onClick={() => setActiveTheme(tKey)}
                  className={`w-6 h-6 rounded-full border transition-all ${
                    activeTheme === tKey
                      ? "scale-110 border-white shadow-md shadow-cyan-500/50"
                      : "border-slate-700 opacity-60 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: THEMES[tKey].primaryGlow }}
                  title={THEMES[tKey].name}
                />
              ))}
            </div>
          </div>
        </div>

        {/* HTML5 Canvas */}
        <div className="relative w-full h-[360px] md:h-[440px] bg-slate-950">
          <canvas ref={canvasRef} className="w-full h-full block cursor-crosshair" />

          {/* Active Preset Overlay Badge */}
          <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-3 rounded-xl max-w-xs shadow-xl pointer-events-none">
            <div className="text-xs font-bold text-white">{PRESETS[activePreset].name}</div>
            <div className={`text-xs font-mono mt-0.5 ${theme.accentText}`}>{PRESETS[activePreset].symbol}</div>
            <div className="text-[11px] text-slate-400 mt-1">{PRESETS[activePreset].desc}</div>
          </div>
        </div>
      </div>

      {/* Interactive Teleportation Protocol Steps & Bloch Sphere Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Quantum Teleportation Control Sandbox */}
        <div className={`lg:col-span-2 p-5 rounded-2xl ${theme.cardBg} border ${theme.border} space-y-5 shadow-xl`}>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>⚛️</span> Quantum Teleportation Protocol Sandbox
            </h3>
            {activePreset === "teleportation" && (
              <button
                onClick={handleNextTeleportStep}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold ${theme.buttonBg} transition-all`}
              >
                {teleportStep === 5 ? "🔄 Restart Protocol" : "⚡ Advance Step"}
              </button>
            )}
          </div>

          {/* Interactive Protocol Timeline */}
          <div className="grid grid-cols-5 gap-2">
            {[
              { step: 1, label: "1. Entangle", desc: "SPDC Bell Pair" },
              { step: 2, label: "2. Prepare |ψ⟩", desc: "Input Qubit" },
              { step: 3, label: "3. Bell Measure", desc: "Alice Collapse" },
              { step: 4, label: "4. Send 2 Bits", desc: "Classical Channel" },
              { step: 5, label: "5. Reconstruct", desc: "Bob Pauli Gate" },
            ].map((st) => {
              const isCurrent = teleportStep === st.step;
              const isDone = teleportStep > st.step;
              return (
                <div
                  key={st.step}
                  onClick={() => setTeleportStep(st.step)}
                  className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                    isCurrent
                      ? `${theme.cardBg} border-cyan-400 ring-2 ring-cyan-500/40 scale-105`
                      : isDone
                      ? "bg-slate-900/90 border-emerald-500/50 text-emerald-300"
                      : "bg-slate-950/60 border-slate-800 text-slate-500 opacity-70"
                  }`}
                >
                  <div className="text-xs font-bold truncate">{st.label}</div>
                  <div className="text-[10px] mt-0.5 font-mono truncate">{st.desc}</div>
                </div>
              );
            })}
          </div>

          {/* Teleportation Status Readout */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center md:text-left">
              <div className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Protocol Status</div>
              <div className="text-sm font-extrabold text-white">
                {teleportStep === 0 && "Idle — Select Teleportation Preset to Start"}
                {teleportStep === 1 && "Step 1: Maximally Entangled Bell Pair |Φ⁺⟩ Generated"}
                {teleportStep === 2 && `Step 2: Alice Input Qubit |ψ⟩ Prepared (θ=${((aliceTheta * 180) / Math.PI).toFixed(0)}°)`}
                {teleportStep === 3 && `Step 3: Bell State Measurement Executed → Outcome: [ ${classicalBits} ]`}
                {teleportStep === 4 && `Step 4: Transmitting 2 Classical Bits [ ${classicalBits} ] via Fiber Channel`}
                {teleportStep === 5 && `Step 5: Bob Applied Quantum Gate Correction → Fidelity: ${teleportFidelity}%`}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[11px] text-slate-400">Classical Bits</div>
                <div className="text-base font-mono font-bold text-amber-400">{classicalBits || "--"}</div>
              </div>
              <div className="h-8 w-px bg-slate-800" />
              <div className="text-right">
                <div className="text-[11px] text-slate-400">State Fidelity</div>
                <div className={`text-base font-mono font-bold ${teleportFidelity > 90 ? "text-emerald-400" : "text-rose-400"}`}>
                  {teleportFidelity}%
                </div>
              </div>
            </div>
          </div>

          {/* Slider Parameters Control Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Alice Polarizer Angle A */}
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-200">Alice Polarizer θₐ:</span>
                <span className="font-mono text-cyan-400">{polarizerA}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="180"
                step="1"
                value={polarizerA}
                onChange={(e) => setPolarizerA(+e.target.value)}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Bob Polarizer Angle B */}
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-200">Bob Polarizer θᵦ:</span>
                <span className="font-mono text-purple-400">{polarizerB}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="180"
                step="1"
                value={polarizerB}
                onChange={(e) => setPolarizerB(+e.target.value)}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
              />
            </div>

            {/* Pump Laser Intensity */}
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-200">Laser Pump Power:</span>
                <span className="font-mono text-emerald-400">{laserPower}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={laserPower}
                onChange={(e) => setLaserPower(+e.target.value)}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>

            {/* Environmental Decoherence Noise */}
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-200">Vacuum Decoherence Noise:</span>
                <span className="font-mono text-rose-400">{decoherence}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="1"
                value={decoherence}
                onChange={(e) => setDecoherence(+e.target.value)}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-400"
              />
            </div>
          </div>
        </div>

        {/* Right Col: Live Quantum Metrics & Bloch Sphere Qubit Vector */}
        <div className={`p-5 rounded-2xl ${theme.cardBg} border ${theme.border} space-y-5 shadow-xl`}>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>📊</span> Quantum Metrics & Bloch Sphere
          </h3>

          {/* Bloch Sphere SVG Vector Visualization */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center relative">
            <svg width="200" height="200" viewBox="-110 -110 220 220" className="overflow-visible">
              {/* Sphere Outer Wireframe Circle */}
              <circle cx="0" cy="0" r="85" fill="none" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1.5" />
              {/* Equator Ellipse */}
              <ellipse cx="0" cy="0" rx="85" ry="28" fill="none" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" strokeDasharray="4 4" />

              {/* Z-Axis Pole Line (|0⟩ to |1⟩) */}
              <line x1="0" y1="-95" x2="0" y2="95" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.5" />
              {/* X-Axis Line */}
              <line x1="-95" y1="0" x2="95" y2="0" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" />

              {/* Pole Labels */}
              <text x="0" y="-100" fill="#38bdf8" fontSize="11" fontWeight="bold" textAnchor="middle">|0⟩</text>
              <text x="0" y="112" fill="#38bdf8" fontSize="11" fontWeight="bold" textAnchor="middle">|1⟩</text>
              <text x="102" y="4" fill="#a855f7" fontSize="10" textAnchor="start">|+⟩</text>

              {/* State Vector Arrow Calculation */}
              {(() => {
                const vecX = 85 * Math.sin(aliceTheta) * Math.cos(alicePhi);
                const vecY = -85 * Math.cos(aliceTheta);
                return (
                  <g>
                    {/* Vector Line */}
                    <line x1="0" y1="0" x2={vecX} y2={vecY} stroke={theme.primaryGlow} strokeWidth="3" strokeLinecap="round" />
                    {/* Vector Point Glow */}
                    <circle cx={vecX} cy={vecY} r="5" fill={theme.primaryGlow} />
                  </g>
                );
              })()}
            </svg>
            <div className="text-[11px] text-slate-400 font-mono mt-2">Alice Qubit State Vector |ψ⟩</div>
          </div>

          {/* Key Physics Metrics Card */}
          <div className="space-y-3">
            {/* CHSH Non-Locality Violation */}
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
              <div>
                <div className="text-xs font-bold text-slate-300">CHSH Metric (S)</div>
                <div className="text-[10px] text-slate-400">Classical Limit: S ≤ 2.0</div>
              </div>
              <div className="text-right">
                <div className={`text-base font-mono font-extrabold ${isCHSHViolated ? "text-emerald-400" : "text-amber-400"}`}>
                  S = {chshSVal}
                </div>
                <div className="text-[10px] text-slate-400">
                  {isCHSHViolated ? "Non-Local (Quantum Violation)" : "Local Realism Limit"}
                </div>
              </div>
            </div>

            {/* Entanglement Entropy */}
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
              <div>
                <div className="text-xs font-bold text-slate-300">Entanglement Entropy</div>
                <div className="text-[10px] text-slate-400">S(ρA) = -Tr(ρ log ρ)</div>
              </div>
              <div className="text-right">
                <div className="text-base font-mono font-extrabold text-cyan-400">
                  {(1.0 - (decoherence / 100) * 0.4).toFixed(2)} bits
                </div>
                <div className="text-[10px] text-slate-400">Max = 1.00 Bit</div>
              </div>
            </div>

            {/* Spin Correlation Parameter */}
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
              <div>
                <div className="text-xs font-bold text-slate-300">Correlation ⟨A, B⟩</div>
                <div className="text-[10px] text-slate-400">cos(θₐ - θᵦ)</div>
              </div>
              <div className="text-right">
                <div className="text-base font-mono font-extrabold text-purple-400">
                  {Math.cos(((polarizerA - polarizerB) * Math.PI) / 180).toFixed(3)}
                </div>
                <div className="text-[10px] text-slate-400">Joint Detection Prob</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
