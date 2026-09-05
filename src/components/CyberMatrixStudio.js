import React, { useState, useEffect, useRef, useCallback } from "react";

// Matrix rain color themes
const THEMES = {
  emerald: {
    id: "emerald",
    name: "Classic Matrix",
    leadColor: "#FFFFFF",
    glyphColor: "#00FF66",
    trailColor: "rgba(0, 255, 102, ",
    bg: "#041209",
    glow: "rgba(0, 255, 102, 0.8)",
    accentText: "text-emerald-400",
    border: "border-emerald-500/40",
    bgGradient: "from-emerald-950/40 via-slate-900 to-black",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    buttonBg: "bg-emerald-600 hover:bg-emerald-500 text-white",
  },
  cyberpunk: {
    id: "cyberpunk",
    name: "Cyberpunk Neon",
    leadColor: "#00F0FF",
    glyphColor: "#FF007F",
    trailColor: "rgba(255, 0, 127, ",
    bg: "#0b0418",
    glow: "rgba(255, 0, 127, 0.8)",
    accentText: "text-pink-400",
    border: "border-pink-500/40",
    bgGradient: "from-purple-950/40 via-slate-900 to-black",
    badge: "bg-pink-500/20 text-pink-300 border-pink-500/40",
    buttonBg: "bg-pink-600 hover:bg-pink-500 text-white",
  },
  gold: {
    id: "gold",
    name: "Solar Gold",
    leadColor: "#FFFFFF",
    glyphColor: "#FFB700",
    trailColor: "rgba(255, 183, 0, ",
    bg: "#140f03",
    glow: "rgba(255, 183, 0, 0.8)",
    accentText: "text-amber-400",
    border: "border-amber-500/40",
    bgGradient: "from-amber-950/40 via-slate-900 to-black",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    buttonBg: "bg-amber-600 hover:bg-amber-500 text-white",
  },
  ocean: {
    id: "ocean",
    name: "Sapphire Deep",
    leadColor: "#E0F7FF",
    glyphColor: "#0088FF",
    trailColor: "rgba(0, 136, 255, ",
    bg: "#040914",
    glow: "rgba(0, 136, 255, 0.8)",
    accentText: "text-cyan-400",
    border: "border-cyan-500/40",
    bgGradient: "from-blue-950/40 via-slate-900 to-black",
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    buttonBg: "bg-cyan-600 hover:bg-cyan-500 text-white",
  },
  crimson: {
    id: "crimson",
    name: "Blood Code",
    leadColor: "#FFEEEE",
    glyphColor: "#FF2A2A",
    trailColor: "rgba(255, 42, 42, ",
    bg: "#140303",
    glow: "rgba(255, 42, 42, 0.8)",
    accentText: "text-red-400",
    border: "border-red-500/40",
    bgGradient: "from-red-950/40 via-slate-900 to-black",
    badge: "bg-red-500/20 text-red-300 border-red-500/40",
    buttonBg: "bg-red-600 hover:bg-red-500 text-white",
  },
  phantom: {
    id: "phantom",
    name: "Monochrome Ghost",
    leadColor: "#FFFFFF",
    glyphColor: "#CCCCCC",
    trailColor: "rgba(204, 204, 204, ",
    bg: "#080808",
    glow: "rgba(255, 255, 255, 0.8)",
    accentText: "text-slate-300",
    border: "border-slate-500/40",
    bgGradient: "from-slate-950/40 via-slate-900 to-black",
    badge: "bg-slate-500/20 text-slate-300 border-slate-500/40",
    buttonBg: "bg-slate-600 hover:bg-slate-500 text-white",
  },
};

// Available Character sets
const CHARACTER_SETS = {
  matrix: {
    name: "Katakana Matrix",
    chars: "日ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789:;*+=-<>",
  },
  binary: {
    name: "Binary Storm (01)",
    chars: "01",
  },
  hex: {
    name: "Hexadecimal Cipher",
    chars: "0123456789ABCDEF",
  },
  hacker: {
    name: "Hacker ASCII & Symbols",
    chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?",
  },
  runes: {
    name: "Ancient Runes",
    chars: "ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟᚪᚫᚬᚭᚮᚯᚰᚱᚲᚳᚴᚵᚶᚷᚸᚹ",
  },
  alien: {
    name: "Quantum Alien Glyphs",
    chars: "ϠϢϣϤϥϦϧϨϩϪϫϬϭϮϯϰϱϲϳϴϵ϶ϷϸϹϺϻϼϽϾϿЖЗИЙЛПФЦЧШЩЪЫЬЭЮЯ",
  },
};

// Preset configurations
const PRESETS = {
  mainframe: {
    name: "Mainframe Core",
    theme: "emerald",
    charSet: "matrix",
    fontSize: 16,
    speed: 2.5,
    trailFade: 0.08,
    glitchRate: 0.02,
    density: 0.9,
  },
  cyberpunkHacker: {
    name: "Neon Hacker",
    theme: "cyberpunk",
    charSet: "hacker",
    fontSize: 18,
    speed: 3.5,
    trailFade: 0.12,
    glitchRate: 0.05,
    density: 0.85,
  },
  binaryOverdrive: {
    name: "Binary Overdrive",
    theme: "ocean",
    charSet: "binary",
    fontSize: 14,
    speed: 4.0,
    trailFade: 0.05,
    glitchRate: 0.01,
    density: 1.0,
  },
  quantumRune: {
    name: "Quantum Runes",
    theme: "gold",
    charSet: "runes",
    fontSize: 20,
    speed: 2.0,
    trailFade: 0.06,
    glitchRate: 0.03,
    density: 0.75,
  },
  ghostProtocol: {
    name: "Ghost Protocol",
    theme: "phantom",
    charSet: "alien",
    fontSize: 22,
    speed: 1.8,
    trailFade: 0.04,
    glitchRate: 0.04,
    density: 0.7,
  },
};

const CyberMatrixStudio = () => {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const audioCtxRef = useRef(null);
  const droneOscRef = useRef(null);
  const droneGainRef = useRef(null);

  // Studio configuration states
  const [themeKey, setThemeKey] = useState("emerald");
  const [charSetKey, setCharSetKey] = useState("matrix");
  const [fontSize, setFontSize] = useState(16);
  const [speed, setSpeed] = useState(2.5);
  const [trailFade, setTrailFade] = useState(0.08); // canvas clear alpha
  const [glitchRate, setGlitchRate] = useState(0.02);
  const [density, setDensity] = useState(0.9);
  const [customText, setCustomText] = useState("WAKE UP NEO...");
  const [showOverlayMessage, setShowOverlayMessage] = useState(true);

  const [isPaused, setIsPaused] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [activePreset, setActivePreset] = useState("mainframe");
  const [fps, setFps] = useState(60);
  const [shockwaves, setShockwaves] = useState([]);
  const [glitchActive, setGlitchActive] = useState(false);

  // References for mutable animation loop data
  const columnsRef = useRef([]);
  const fpsDataRef = useRef({ count: 0, lastTime: performance.now() });
  const shockwavesRef = useRef([]);

  const currentTheme = THEMES[themeKey] || THEMES.emerald;
  const currentCharSet = CHARACTER_SETS[charSetKey] || CHARACTER_SETS.matrix;

  // Sound effects generator using Web Audio API
  const playSoundEffect = useCallback((type) => {
    if (!audioEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          audioCtxRef.current = new AudioContext();
        }
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      if (type === "glitch") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === "shockwave") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch (e) {
      console.warn("Audio Context playback error:", e);
    }
  }, [audioEnabled]);

  // Audio ambient drone control
  useEffect(() => {
    if (audioEnabled) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!audioCtxRef.current && AudioContext) {
          audioCtxRef.current = new AudioContext();
        }
        const ctx = audioCtxRef.current;
        if (ctx && ctx.state === "suspended") {
          ctx.resume();
        }
        if (ctx && !droneOscRef.current) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(55, ctx.currentTime); // Low A hum
          gain.gain.setValueAtTime(0.04, ctx.currentTime);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          droneOscRef.current = osc;
          droneGainRef.current = gain;
        }
      } catch (e) {
        console.warn("Audio Context drone initialization failed:", e);
      }
    } else {
      if (droneOscRef.current) {
        try {
          droneOscRef.current.stop();
          droneOscRef.current.disconnect();
        } catch (e) {}
        droneOscRef.current = null;
        droneGainRef.current = null;
      }
    }

    return () => {
      if (droneOscRef.current) {
        try {
          droneOscRef.current.stop();
          droneOscRef.current.disconnect();
        } catch (e) {}
        droneOscRef.current = null;
      }
    };
  }, [audioEnabled]);

  // Initialize Matrix rain columns
  const initColumns = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const numCols = Math.floor(canvas.width / fontSize);
    const chars = currentCharSet.chars;

    const cols = [];
    for (let i = 0; i < numCols; i++) {
      // Decide if this column is active based on density
      const isActive = Math.random() < density;
      cols.push({
        x: i * fontSize,
        y: Math.random() * -canvas.height, // start above canvas
        speed: (0.7 + Math.random() * 0.8) * speed,
        chars: [],
        length: Math.floor(10 + Math.random() * 20),
        active: isActive,
        leadChar: chars[Math.floor(Math.random() * chars.length)],
      });
    }
    columnsRef.current = cols;
  }, [fontSize, speed, density, currentCharSet]);

  // Handle Canvas Resize & Initialization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const container = canvas.parentElement;
      if (!container) return;
      canvas.width = container.clientWidth;
      canvas.height = 480;
      initColumns();
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [initColumns]);

  // Trigger temporary screen glitch burst
  const triggerGlitch = () => {
    setGlitchActive(true);
    playSoundEffect("glitch");
    setTimeout(() => {
      setGlitchActive(false);
    }, 400);
  };

  // Handle Mouse Click on Canvas for Shockwave Impulse
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newWave = { x, y, radius: 10, maxRadius: 180, alpha: 1.0 };
    shockwavesRef.current.push(newWave);
    setShockwaves([...shockwavesRef.current]);
    playSoundEffect("shockwave");
  };

  // Main Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;

    const render = () => {
      // Calculate FPS
      const now = performance.now();
      fpsDataRef.current.count++;
      if (now - fpsDataRef.current.lastTime >= 1000) {
        setFps(Math.round((fpsDataRef.current.count * 1000) / (now - fpsDataRef.current.lastTime)));
        fpsDataRef.current.count = 0;
        fpsDataRef.current.lastTime = now;
      }

      if (!isPaused) {
        // Draw trailing background overlay (fade effect)
        ctx.fillStyle = currentTheme.bg + Math.floor(trailFade * 255).toString(16).padStart(2, "0");
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Apply visual glitch distortion if active
        if (glitchActive) {
          ctx.save();
          const offsetX = (Math.random() - 0.5) * 20;
          const offsetY = (Math.random() - 0.5) * 20;
          ctx.translate(offsetX, offsetY);
        }

        ctx.font = `${fontSize}px monospace`;

        const charPool = currentCharSet.chars;
        const cols = columnsRef.current;

        // Render each rain stream
        cols.forEach((col) => {
          if (!col.active) return;

          // Occasionally mutate lead char
          if (Math.random() < glitchRate) {
            col.leadChar = charPool[Math.floor(Math.random() * charPool.length)];
          }

          // Check interaction with active shockwaves
          let displacementX = 0;
          let displacementY = 0;
          shockwavesRef.current.forEach((sw) => {
            const dx = col.x - sw.x;
            const dy = col.y - sw.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < sw.radius + 30 && dist > sw.radius - 30) {
              const force = (1 - dist / sw.maxRadius) * 25;
              displacementX = (dx / (dist || 1)) * force;
              displacementY = (dy / (dist || 1)) * force;
            }
          });

          const drawX = col.x + displacementX;
          const drawY = col.y + displacementY;

          // Draw Glowing Head Glyph
          ctx.fillStyle = currentTheme.leadColor;
          ctx.shadowColor = currentTheme.glow;
          ctx.shadowBlur = 12;
          ctx.fillText(col.leadChar, drawX, drawY);

          // Draw Trail Glyphs behind head
          ctx.shadowBlur = 0;
          const trailLength = col.length;
          for (let i = 1; i < trailLength; i++) {
            const trailY = drawY - i * fontSize;
            if (trailY > 0 && trailY < canvas.height) {
              const alpha = (1 - i / trailLength) * 0.9;
              ctx.fillStyle = currentTheme.trailColor + alpha + ")";

              // Randomize character occasionally
              const charIndex = (col.y + i) % charPool.length;
              const charToDraw = Math.random() < 0.05 ? charPool[Math.floor(Math.random() * charPool.length)] : charPool[charIndex] || col.leadChar;

              ctx.fillText(charToDraw, drawX, trailY);
            }
          }

          // Update Column Y position
          col.y += col.speed * (fontSize / 16);

          // Reset column when it goes off screen
          if (col.y - col.length * fontSize > canvas.height) {
            col.y = Math.random() * -100;
            col.speed = (0.7 + Math.random() * 0.8) * speed;
            col.leadChar = charPool[Math.floor(Math.random() * charPool.length)];
            col.active = Math.random() < density;
          }
        });

        // Render Radial Shockwave Rings
        for (let i = shockwavesRef.current.length - 1; i >= 0; i--) {
          const sw = shockwavesRef.current[i];
          sw.radius += 6;
          sw.alpha -= 0.03;

          if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
            shockwavesRef.current.splice(i, 1);
          } else {
            ctx.beginPath();
            ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
            ctx.strokeStyle = currentTheme.glyphColor;
            ctx.globalAlpha = sw.alpha;
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.globalAlpha = 1.0;
          }
        }

        if (glitchActive) {
          ctx.restore();
        }

        // Draw Custom Message Overlay if enabled
        if (showOverlayMessage && customText.trim().length > 0) {
          ctx.save();
          ctx.font = `900 ${Math.min(canvas.width / 18, 36)}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          // Glow background for text
          ctx.shadowColor = currentTheme.glow;
          ctx.shadowBlur = 24;

          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;

          // Semi-transparent banner box
          ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
          const textWidth = ctx.measureText(customText).width + 60;
          ctx.fillRect(centerX - textWidth / 2, centerY - 30, textWidth, 60);

          ctx.strokeStyle = currentTheme.glyphColor;
          ctx.lineWidth = 1.5;
          ctx.strokeRect(centerX - textWidth / 2, centerY - 30, textWidth, 60);

          // Text content
          ctx.fillStyle = "#FFFFFF";
          ctx.fillText(customText, centerX, centerY);
          ctx.restore();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    isPaused,
    currentTheme,
    currentCharSet,
    fontSize,
    speed,
    trailFade,
    glitchRate,
    density,
    customText,
    showOverlayMessage,
    glitchActive,
  ]);

  // Apply Preset Config
  const applyPreset = (presetKey) => {
    const p = PRESETS[presetKey];
    if (!p) return;
    setActivePreset(presetKey);
    setThemeKey(p.theme);
    setCharSetKey(p.charSet);
    setFontSize(p.fontSize);
    setSpeed(p.speed);
    setTrailFade(p.trailFade);
    setGlitchRate(p.glitchRate);
    setDensity(p.density);
  };

  // Export Canvas Image as PNG
  const downloadSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `cyber-matrix-${themeKey}-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 my-8">
      <div className={`relative rounded-3xl bg-slate-950 border ${currentTheme.border} p-6 md:p-8 shadow-2xl overflow-hidden transition-all duration-500`}>
        {/* Ambient Top Background Glow */}
        <div
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-700"
          style={{ backgroundColor: currentTheme.glyphColor }}
        />

        {/* Header Section */}
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-wider border ${currentTheme.badge}`}>
                Cyber Lab v2.0
              </span>
              <span className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                {fps} FPS
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mt-2 font-mono flex items-center gap-3">
              Cybernetic Matrix Studio
              <span className="text-xl">⚡</span>
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              High-performance interactive digital rain engine with customizable glyph streams, audio synthesizer, and kinetic impulse shockwaves.
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {Object.entries(PRESETS).map(([key, val]) => (
              <button
                key={key}
                onClick={() => applyPreset(key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold font-mono transition-all duration-200 border ${
                  activePreset === key
                    ? `${currentTheme.badge} shadow-lg shadow-emerald-500/10 scale-105`
                    : "bg-slate-900/80 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                {val.name}
              </button>
            ))}
          </div>
        </div>

        {/* Main Canvas Display Area */}
        <div className="relative z-10 rounded-2xl overflow-hidden border border-white/10 bg-black shadow-inner group">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="w-full h-[480px] block cursor-crosshair transition-opacity duration-300"
          />

          {/* Interactive Hint Overlay */}
          <div className="absolute top-4 left-4 pointer-events-none bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-slate-300 text-xs font-mono flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
            Click canvas to trigger kinetic shockwaves
          </div>

          {/* Audio Synthesizer Status Indicator */}
          <div className="absolute top-4 right-4 pointer-events-none bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs font-mono flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${audioEnabled ? "bg-emerald-400 animate-pulse" : "bg-slate-600"}`} />
            <span className={audioEnabled ? "text-emerald-300" : "text-slate-500"}>
              {audioEnabled ? "AUDIO SYNTH ACTIVE" : "AUDIO MUTED"}
            </span>
          </div>
        </div>

        {/* Studio Controls Grid */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6 p-6 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-md">
          {/* Theme Selector */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
              <span>Matrix Palette</span>
              <span className={`text-[10px] ${currentTheme.accentText}`}>{currentTheme.name}</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(THEMES).map(([key, t]) => (
                <button
                  key={key}
                  onClick={() => {
                    setThemeKey(key);
                    setActivePreset(null);
                  }}
                  className={`p-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border ${
                    themeKey === key
                      ? "bg-slate-800 border-white/40 text-white shadow-md"
                      : "bg-slate-950/60 border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full border border-black/50"
                    style={{ backgroundColor: t.glyphColor }}
                  />
                  <span className="truncate">{t.name.split(" ")[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Glyph Set Selector */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
              <span>Glyph Cipher</span>
              <span className="text-[10px] text-slate-400">{currentCharSet.name}</span>
            </label>
            <select
              value={charSetKey}
              onChange={(e) => {
                setCharSetKey(e.target.value);
                setActivePreset(null);
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              {Object.entries(CHARACTER_SETS).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.name}
                </option>
              ))}
            </select>

            {/* Custom Overlay Input */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                <span>Overlay Banner Text</span>
                <button
                  onClick={() => setShowOverlayMessage(!showOverlayMessage)}
                  className={`underline hover:text-white ${showOverlayMessage ? "text-emerald-400" : "text-slate-500"}`}
                >
                  {showOverlayMessage ? "Hide Banner" : "Show Banner"}
                </button>
              </div>
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Type overlay message..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Speed & Font Sliders */}
          <div className="space-y-4">
            {/* Speed */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-300 font-bold uppercase">Fall Velocity</span>
                <span className={`font-bold ${currentTheme.accentText}`}>{speed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="7.0"
                step="0.1"
                value={speed}
                onChange={(e) => {
                  setSpeed(Number(e.target.value));
                  setActivePreset(null);
                }}
                className="w-full accent-emerald-400 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
              />
            </div>

            {/* Font Size */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-300 font-bold uppercase">Glyph Size</span>
                <span className="font-bold text-slate-200">{fontSize}px</span>
              </div>
              <input
                type="range"
                min="10"
                max="32"
                step="2"
                value={fontSize}
                onChange={(e) => {
                  setFontSize(Number(e.target.value));
                  setActivePreset(null);
                }}
                className="w-full accent-emerald-400 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
              />
            </div>
          </div>

          {/* Density & Trail Fade Sliders */}
          <div className="space-y-4">
            {/* Density */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-300 font-bold uppercase">Rain Density</span>
                <span className="font-bold text-slate-200">{Math.round(density * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.3"
                max="1.0"
                step="0.05"
                value={density}
                onChange={(e) => {
                  setDensity(Number(e.target.value));
                  setActivePreset(null);
                }}
                className="w-full accent-emerald-400 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
              />
            </div>

            {/* Trail Persistence */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-300 font-bold uppercase">Trail Decay</span>
                <span className="font-bold text-slate-200">{(100 - trailFade * 500).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.02"
                max="0.25"
                step="0.01"
                value={trailFade}
                onChange={(e) => {
                  setTrailFade(Number(e.target.value));
                  setActivePreset(null);
                }}
                className="w-full accent-emerald-400 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
              />
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="relative z-10 flex flex-wrap justify-between items-center gap-4 pt-6 mt-6 border-t border-white/10">
          <div className="flex items-center gap-3">
            {/* Glitch Trigger Button */}
            <button
              onClick={triggerGlitch}
              className="px-4 py-2.5 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-purple-200 font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 border border-purple-500/40 active:scale-95 shadow-lg"
            >
              <svg className="w-4 h-4 animate-pulse text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Glitch Impulse
            </button>

            {/* Audio Toggle Button */}
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={`px-4 py-2.5 rounded-xl font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 border active:scale-95 shadow-lg ${
                audioEnabled
                  ? "bg-emerald-950 border-emerald-500/50 text-emerald-300"
                  : "bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {audioEnabled ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                )}
              </svg>
              {audioEnabled ? "Audio Synth: ON" : "Audio Synth: OFF"}
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Pause / Resume Button */}
            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`px-5 py-2.5 rounded-xl font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 border active:scale-95 shadow-lg ${
                isPaused
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400"
                  : "bg-amber-600/80 hover:bg-amber-500 text-white border-amber-400/50"
              }`}
            >
              {isPaused ? "Resume Stream" : "Pause Stream"}
            </button>

            {/* Snapshot Download Button */}
            <button
              onClick={downloadSnapshot}
              className={`px-5 py-2.5 rounded-xl font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 border shadow-lg ${currentTheme.buttonBg} ${currentTheme.border} active:scale-95`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Snapshot PNG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CyberMatrixStudio;
