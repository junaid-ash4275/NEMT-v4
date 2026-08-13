import React, { useState, useEffect, useRef, useCallback } from "react";

// Themes definition
const THEMES = {
  xenon: {
    id: "xenon",
    name: "Cyber Xenon",
    bg: "from-slate-950 via-indigo-950 to-slate-900",
    canvasBg: "#030712",
    primaryArc: "#00f0ff",
    secondaryArc: "#7000ff",
    glow: "rgba(0, 240, 255, 0.8)",
    accentText: "text-cyan-400",
    accentBorder: "border-cyan-500/40",
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-400/40",
    buttonBg: "bg-cyan-600 hover:bg-cyan-500 text-white",
  },
  gold: {
    id: "gold",
    name: "Tesla Gold",
    bg: "from-amber-950 via-stone-950 to-slate-950",
    canvasBg: "#120903",
    primaryArc: "#ffaa00",
    secondaryArc: "#ff4500",
    glow: "rgba(255, 170, 0, 0.8)",
    accentText: "text-amber-400",
    accentBorder: "border-amber-500/40",
    badge: "bg-amber-500/20 text-amber-300 border-amber-400/40",
    buttonBg: "bg-amber-600 hover:bg-amber-500 text-white",
  },
  violet: {
    id: "violet",
    name: "Violet Plasma",
    bg: "from-purple-950 via-slate-950 to-pink-950",
    canvasBg: "#0a0414",
    primaryArc: "#d8b4fe",
    secondaryArc: "#c084fc",
    glow: "rgba(192, 132, 252, 0.8)",
    accentText: "text-purple-300",
    accentBorder: "border-purple-500/40",
    badge: "bg-purple-500/20 text-purple-300 border-purple-400/40",
    buttonBg: "bg-purple-600 hover:bg-purple-500 text-white",
  },
  krypton: {
    id: "krypton",
    name: "Krypton Acid",
    bg: "from-emerald-950 via-slate-950 to-teal-950",
    canvasBg: "#02120b",
    primaryArc: "#00ffaa",
    secondaryArc: "#10b981",
    glow: "rgba(0, 255, 170, 0.8)",
    accentText: "text-emerald-400",
    accentBorder: "border-emerald-500/40",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-400/40",
    buttonBg: "bg-emerald-600 hover:bg-emerald-500 text-white",
  },
  prismatic: {
    id: "prismatic",
    name: "Prismatic Arc",
    bg: "from-slate-950 via-purple-950 to-cyan-950",
    canvasBg: "#070514",
    primaryArc: "#ff007f",
    secondaryArc: "#00f0ff",
    glow: "rgba(255, 0, 127, 0.8)",
    accentText: "text-pink-400",
    accentBorder: "border-pink-500/40",
    badge: "bg-pink-500/20 text-pink-300 border-pink-400/40",
    buttonBg: "bg-pink-600 hover:bg-pink-500 text-white",
  },
};

// Preset optical/electrical nodes setups
const PRESETS = [
  {
    id: "tesla_tower",
    name: "Tesla Tower Array",
    desc: "Central high-voltage emitter with orbiting sphere conductors",
    nodes: [
      { id: "e1", type: "emitter", x: 400, y: 250, radius: 24, voltage: 100, label: "Tesla Core" },
      { id: "c1", type: "orb", x: 220, y: 150, radius: 18, label: "Conductor A" },
      { id: "c2", type: "orb", x: 580, y: 150, radius: 18, label: "Conductor B" },
      { id: "g1", type: "ground", x: 200, y: 350, radius: 16, label: "Ground Alpha" },
      { id: "g2", type: "ground", x: 600, y: 350, radius: 16, label: "Ground Beta" },
      { id: "t1", type: "tube", x: 400, y: 400, width: 140, height: 26, gasColor: "#ff3366", label: "Neon Tube" },
    ],
  },
  {
    id: "jacobs_ladder",
    name: "Jacob's Ladder",
    desc: "Vertical climbing electric arc between angled electrode rails",
    nodes: [
      { id: "e1", type: "emitter", x: 330, y: 420, radius: 18, voltage: 100, label: "Left Electrode" },
      { id: "e2", type: "emitter", x: 470, y: 420, radius: 18, voltage: 100, label: "Right Electrode" },
      { id: "g1", type: "ground", x: 250, y: 100, radius: 16, label: "Top Vent L" },
      { id: "g2", type: "ground", x: 550, y: 100, radius: 16, label: "Top Vent R" },
      { id: "t1", type: "tube", x: 400, y: 150, width: 160, height: 28, gasColor: "#00ffcc", label: "Argon Tube" },
    ],
  },
  {
    id: "plasma_globe",
    name: "Plasma Globe",
    desc: "Spherical containment cell with multi-branching central discharge",
    nodes: [
      { id: "e1", type: "emitter", x: 400, y: 250, radius: 28, voltage: 120, label: "Central Electrode" },
      { id: "c1", type: "orb", x: 250, y: 250, radius: 14, label: "Node West" },
      { id: "c2", type: "orb", x: 550, y: 250, radius: 14, label: "Node East" },
      { id: "c3", type: "orb", x: 400, y: 100, radius: 14, label: "Node North" },
      { id: "c4", type: "orb", x: 400, y: 400, radius: 14, label: "Node South" },
    ],
  },
  {
    id: "storm_cage",
    name: "Storm Generator",
    desc: "Multiple dual emitters creating high-density chaotic lightning field",
    nodes: [
      { id: "e1", type: "emitter", x: 200, y: 200, radius: 22, voltage: 90, label: "Emitter #1" },
      { id: "e2", type: "emitter", x: 600, y: 200, radius: 22, voltage: 90, label: "Emitter #2" },
      { id: "g1", type: "ground", x: 400, y: 420, radius: 24, label: "Central Ground" },
      { id: "t1", type: "tube", x: 400, y: 120, width: 180, height: 30, gasColor: "#aa00ff", label: "Krypton Cell" },
    ],
  },
];

const PlasmaDischargeStudio = () => {
  // Theme & Preset State
  const [themeKey, setThemeKey] = useState("xenon");
  const [presetKey, setPresetKey] = useState("tesla_tower");
  const currentTheme = THEMES[themeKey] || THEMES.xenon;

  // Electrical Simulation Parameters
  const [voltage, setVoltage] = useState(85); // 10 to 150 kV
  const [frequency, setFrequency] = useState(60); // 10 to 120 Hz
  const [chaos, setChaos] = useState(0.5); // 0.1 to 1.0 fractal noise
  const [glowIntensity, setGlowIntensity] = useState(1.0);
  const [sparkCount, setSparkCount] = useState(30); // Max particles per arc contact
  const [isPlaying, setIsPlaying] = useState(true);

  // Nodes list (Emitters, Orbs, Grounds, Tubes)
  const [nodes, setNodes] = useState(() => PRESETS[0].nodes);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [draggedNodeId, setDraggedNodeId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Sound Synth State
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [volume, setVolume] = useState(0.2);
  const audioCtxRef = useRef(null);
  const audioNodesRef = useRef(null);

  // Telemetry Counters
  const [telemetry, setTelemetry] = useState({
    peakCurrent: 0,
    activeSparks: 0,
    contactsPerSec: 0,
    efficiency: 94.2,
  });

  // Canvas and Animation Refs
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const particlesRef = useRef([]);
  const mousePosRef = useRef({ x: -1000, y: -1000, active: false });

  // Load Preset
  const handleSelectPreset = (pId) => {
    setPresetKey(pId);
    const found = PRESETS.find((p) => p.id === pId);
    if (found) {
      // Deep copy nodes
      setNodes(JSON.parse(JSON.stringify(found.nodes)));
      setSelectedNodeId(null);
    }
  };

  // Web Audio Synthesizer Setup
  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      // Master Gain
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(volume, ctx.currentTime);
      masterGain.connect(ctx.destination);

      // Noise Buffer for Spark Crackle
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Filter for electric arc frequency
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1200, ctx.currentTime);
      filter.Q.setValueAtTime(3.0, ctx.currentTime);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.05, ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(masterGain);
      whiteNoise.start();

      // Voltage Hum Oscillator
      const humOsc = ctx.createOscillator();
      humOsc.type = "sawtooth";
      humOsc.frequency.setValueAtTime(60, ctx.currentTime);

      const humGain = ctx.createGain();
      humGain.gain.setValueAtTime(0.04, ctx.currentTime);

      humOsc.connect(humGain);
      humGain.connect(masterGain);
      humOsc.start();

      audioNodesRef.current = { masterGain, noiseGain, filter, humOsc, humGain };
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  }, [volume]);

  // Sound Toggle Handler
  const toggleSound = () => {
    if (!soundEnabled) {
      initAudio();
      if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }
      setSoundEnabled(true);
    } else {
      if (audioNodesRef.current) {
        audioNodesRef.current.masterGain.gain.setValueAtTime(0, audioCtxRef.current.currentTime);
      }
      setSoundEnabled(false);
    }
  };

  // Update volume
  useEffect(() => {
    if (audioNodesRef.current && audioCtxRef.current && soundEnabled) {
      audioNodesRef.current.masterGain.gain.setValueAtTime(volume, audioCtxRef.current.currentTime);
    }
  }, [volume, soundEnabled]);

  // Lichtenberg Fractal Arc Generator algorithm
  const generateArcPoints = useCallback((start, end, maxDepth, chaosFactor) => {
    let points = [start, end];

    for (let depth = 0; depth < maxDepth; depth++) {
      let newPoints = [points[0]];
      for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];

        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Perpendicular offset based on distance & chaos
        const perpX = -dy / (dist || 1);
        const perpY = dx / (dist || 1);

        const offsetMagnitude = (Math.random() - 0.5) * dist * 0.35 * chaosFactor;
        const displacedX = midX + perpX * offsetMagnitude;
        const displacedY = midY + perpY * offsetMagnitude;

        newPoints.push({ x: displacedX, y: displacedY });
        newPoints.push(p2);
      }
      points = newPoints;
    }

    return points;
  }, []);

  // Spawn contact spark particles
  const spawnSparks = useCallback((x, y, count, color) => {
    const newParticles = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 6;
      newParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1 + Math.random() * 3,
        life: 1.0,
        decay: 0.02 + Math.random() * 0.05,
        color,
      });
    }
    particlesRef.current.push(...newParticles);
  }, []);

  // Add a new node onto canvas
  const addNode = (type) => {
    const id = "n_" + Date.now();
    const newX = 350 + (Math.random() * 100 - 50);
    const newY = 250 + (Math.random() * 100 - 50);

    let newNode;
    if (type === "emitter") {
      newNode = { id, type: "emitter", x: newX, y: newY, radius: 22, voltage: 100, label: "New Emitter" };
    } else if (type === "orb") {
      newNode = { id, type: "orb", x: newX, y: newY, radius: 18, label: "Conductor Orb" };
    } else if (type === "ground") {
      newNode = { id, type: "ground", x: newX, y: newY, radius: 18, label: "Ground Pole" };
    } else if (type === "tube") {
      newNode = { id, type: "tube", x: newX, y: newY, width: 140, height: 26, gasColor: "#00f0ff", label: "Gas Cell" };
    }

    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(id);
  };

  // Delete selected node
  const deleteSelectedNode = () => {
    if (!selectedNodeId) return;
    setNodes((prev) => prev.filter((n) => n.id !== selectedNodeId));
    setSelectedNodeId(null);
  };

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let lastTime = performance.now();
    let contactCountThisSecond = 0;
    let secTimer = 0;

    const render = (time) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      secTimer += dt;
      if (secTimer >= 1) {
        setTelemetry((prev) => ({
          ...prev,
          contactsPerSec: contactCountThisSecond,
          activeSparks: particlesRef.current.length,
          peakCurrent: Math.round((voltage * 1.8 + Math.random() * 15) * 10) / 10,
        }));
        contactCountThisSecond = 0;
        secTimer = 0;
      }

      // Clear Canvas
      ctx.fillStyle = currentTheme.canvasBg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw subtle conductive grid lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      if (isPlaying) {
        // Collect emitters and potential targets
        const emitters = nodes.filter((n) => n.type === "emitter");
        const targets = nodes.filter((n) => n.type !== "emitter");

        // Add mouse cursor as interactive target if mouse inside canvas
        const mousePos = mousePosRef.current;
        let activeTargets = [...targets];
        if (mousePos.active) {
          activeTargets.push({ id: "mouse", type: "mouse", x: mousePos.x, y: mousePos.y, radius: 12 });
        }

        // Draw Arcs from each emitter
        emitters.forEach((emitter) => {
          // Reach is proportional to voltage setting
          const reach = (voltage / 100) * 380;

          activeTargets.forEach((target) => {
            let tx = target.x;
            let ty = target.y;

            if (target.type === "tube") {
              tx = target.x;
              ty = target.y;
            }

            const dx = tx - emitter.x;
            const dy = ty - emitter.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < reach && dist > 5) {
              contactCountThisSecond++;

              // Number of fractal sub-branches per connection
              const arcCount = Math.floor(1 + (voltage / 40));

              for (let a = 0; a < arcCount; a++) {
                const points = generateArcPoints(
                  { x: emitter.x, y: emitter.y },
                  { x: tx, y: ty },
                  4,
                  chaos
                );

                // Outer Glow Pass
                ctx.save();
                ctx.shadowColor = currentTheme.primaryArc;
                ctx.shadowBlur = 18 * glowIntensity;
                ctx.strokeStyle = currentTheme.primaryArc;
                ctx.lineWidth = 3.5 * glowIntensity;
                ctx.globalAlpha = 0.85;

                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);
                for (let p = 1; p < points.length; p++) {
                  ctx.lineTo(points[p].x, points[p].y);
                }
                ctx.stroke();

                // Inner Core High-Voltage White Pass
                ctx.shadowBlur = 0;
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 1.2;
                ctx.globalAlpha = 1.0;
                ctx.stroke();
                ctx.restore();

                // Spawn contacts sparks occasionally
                if (Math.random() < 0.3) {
                  spawnSparks(tx, ty, Math.floor(sparkCount * 0.3), currentTheme.primaryArc);
                }

                // If target is Gas Tube, ignite the gas tube glow!
                if (target.type === "tube") {
                  target.ignited = true;
                }
              }
            }
          });
        });
      }

      // Draw Spark Particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.life -= p.decay;

        if (p.life <= 0) {
          particlesRef.current.splice(i, 1);
        } else {
          ctx.save();
          ctx.globalAlpha = p.life;
          ctx.fillStyle = p.color || currentTheme.primaryArc;
          ctx.shadowColor = p.color || currentTheme.primaryArc;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // Draw Nodes (Emitters, Orbs, Ground Rods, Tubes)
      nodes.forEach((node) => {
        const isSelected = node.id === selectedNodeId;

        if (node.type === "emitter") {
          // Tesla Coil Emitter Ring
          ctx.save();
          ctx.shadowColor = currentTheme.primaryArc;
          ctx.shadowBlur = isSelected ? 25 : 12;
          ctx.fillStyle = "#1e293b";
          ctx.strokeStyle = isSelected ? "#ffffff" : currentTheme.primaryArc;
          ctx.lineWidth = isSelected ? 3 : 2;

          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Pulsing Core Emitter Sphere
          ctx.fillStyle = currentTheme.primaryArc;
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius * 0.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          // Label
          ctx.fillStyle = "#94a3b8";
          ctx.font = "10px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(node.label || "Emitter", node.x, node.y + node.radius + 14);
        } else if (node.type === "orb") {
          // Metallic Conductor Orb
          ctx.save();
          const grad = ctx.createRadialGradient(
            node.x - 4,
            node.y - 4,
            2,
            node.x,
            node.y,
            node.radius
          );
          grad.addColorStop(0, "#ffffff");
          grad.addColorStop(0.5, "#94a3b8");
          grad.addColorStop(1, "#334155");

          ctx.fillStyle = grad;
          ctx.strokeStyle = isSelected ? "#38bdf8" : "rgba(255, 255, 255, 0.4)";
          ctx.lineWidth = isSelected ? 2.5 : 1;
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.restore();

          ctx.fillStyle = "#64748b";
          ctx.font = "10px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(node.label || "Orb", node.x, node.y + node.radius + 14);
        } else if (node.type === "ground") {
          // Ground Pole
          ctx.save();
          ctx.fillStyle = "#0f172a";
          ctx.strokeStyle = isSelected ? "#ef4444" : "#475569";
          ctx.lineWidth = isSelected ? 2.5 : 1.5;

          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Ground symbol lines
          ctx.strokeStyle = "#94a3b8";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(node.x - 8, node.y);
          ctx.lineTo(node.x + 8, node.y);
          ctx.moveTo(node.x - 5, node.y + 4);
          ctx.lineTo(node.x + 5, node.y + 4);
          ctx.moveTo(node.x - 2, node.y + 7);
          ctx.lineTo(node.x + 2, node.y + 7);
          ctx.stroke();
          ctx.restore();

          ctx.fillStyle = "#64748b";
          ctx.font = "10px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(node.label || "Ground", node.x, node.y + node.radius + 14);
        } else if (node.type === "tube") {
          // Gas Discharge Tube
          ctx.save();
          const w = node.width || 140;
          const h = node.height || 26;
          const rx = node.x - w / 2;
          const ry = node.y - h / 2;

          ctx.fillStyle = "rgba(15, 23, 42, 0.8)";
          ctx.strokeStyle = isSelected ? "#ffffff" : node.gasColor || "#00f0ff";
          ctx.lineWidth = isSelected ? 2.5 : 1.5;

          if (node.ignited) {
            ctx.shadowColor = node.gasColor || "#00f0ff";
            ctx.shadowBlur = 20;
          }

          ctx.beginPath();
          ctx.roundRect(rx, ry, w, h, 12);
          ctx.fill();
          ctx.stroke();

          if (node.ignited) {
            ctx.fillStyle = node.gasColor || "#00f0ff";
            ctx.globalAlpha = 0.7;
            ctx.beginPath();
            ctx.roundRect(rx + 4, ry + 4, w - 8, h - 8, 8);
            ctx.fill();
            node.ignited = false; // reset for next frame
          }

          ctx.restore();

          ctx.fillStyle = "#64748b";
          ctx.font = "10px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(node.label || "Gas Tube", node.x, node.y + h / 2 + 14);
        }
      });

      // Draw Cursor Indicator if active
      if (mousePosRef.current.active) {
        ctx.save();
        ctx.strokeStyle = currentTheme.primaryArc;
        ctx.shadowColor = currentTheme.primaryArc;
        ctx.shadowBlur = 10;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(mousePosRef.current.x, mousePosRef.current.y, 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    currentTheme,
    voltage,
    chaos,
    glowIntensity,
    sparkCount,
    nodes,
    selectedNodeId,
    isPlaying,
    generateArcPoints,
    spawnSparks,
  ]);

  // Pointer & Drag Handlers for Canvas
  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const handlePointerDown = (e) => {
    const { x, y } = getCanvasCoords(e);

    // Check if clicked any node
    const clicked = nodes.find((node) => {
      const radius = node.type === "tube" ? 30 : node.radius + 6;
      const dx = x - node.x;
      const dy = y - node.y;
      return Math.sqrt(dx * dx + dy * dy) <= radius;
    });

    if (clicked) {
      setSelectedNodeId(clicked.id);
      setDraggedNodeId(clicked.id);
      setDragOffset({ x: x - clicked.x, y: y - clicked.y });
    } else {
      setSelectedNodeId(null);
    }
  };

  const handlePointerMove = (e) => {
    const { x, y } = getCanvasCoords(e);
    mousePosRef.current = { x, y, active: true };

    if (draggedNodeId) {
      setNodes((prev) =>
        prev.map((node) => {
          if (node.id === draggedNodeId) {
            return {
              ...node,
              x: Math.max(30, Math.min(770, x - dragOffset.x)),
              y: Math.max(30, Math.min(470, y - dragOffset.y)),
            };
          }
          return node;
        })
      );
    }
  };

  const handlePointerUp = () => {
    setDraggedNodeId(null);
  };

  const handlePointerLeave = () => {
    mousePosRef.current.active = false;
    setDraggedNodeId(null);
  };

  // Export Canvas Image
  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `plasma_discharge_${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className={`w-full max-w-6xl mx-auto my-8 p-4 sm:p-6 bg-gradient-to-br ${currentTheme.bg} rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-xl text-white transition-all duration-500`}>
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <span className={currentTheme.accentText}>⚡</span> PLASMA DISCHARGE STUDIO
            </h2>
            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${currentTheme.badge}`}>
              Tesla Arc Physics v2.4
            </span>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            High-voltage electric arc simulator & interactive Lichtenberg discharge lab
          </p>
        </div>

        {/* Theme Picker */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-xl border border-white/10">
          {Object.values(THEMES).map((t) => (
            <button
              key={t.id}
              onClick={() => setThemeKey(t.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                themeKey === t.id
                  ? `${t.buttonBg} shadow-lg font-bold`
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Center Canvas Area */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Interactive Canvas Container */}
          <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-inner bg-slate-950/80">
            <canvas
              ref={canvasRef}
              width={800}
              height={500}
              onMouseDown={handlePointerDown}
              onMouseMove={handlePointerMove}
              onMouseUp={handlePointerUp}
              onMouseLeave={handlePointerLeave}
              onTouchStart={handlePointerDown}
              onTouchMove={handlePointerMove}
              onTouchEnd={handlePointerUp}
              className="w-full h-auto cursor-crosshair touch-none block"
            />

            {/* Live Telemetry Overlay */}
            <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 flex items-center gap-4 text-xs font-mono">
              <div>
                <span className="text-slate-400">Voltage: </span>
                <span className={`font-bold ${currentTheme.accentText}`}>{voltage} kV</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-slate-400">Peak Current: </span>
                <span className="font-bold text-slate-200">{telemetry.peakCurrent} mA</span>
              </div>
              <div>
                <span className="text-slate-400">Arcs/s: </span>
                <span className="font-bold text-emerald-400">{telemetry.contactsPerSec}</span>
              </div>
            </div>

            {/* Control Bar Overlay */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-slate-900/85 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`px-3 py-1.5 font-semibold rounded-lg border transition-all ${
                    isPlaying
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30"
                      : "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30"
                  }`}
                >
                  {isPlaying ? "⏸ Pause Arcs" : "▶ Resume Arcs"}
                </button>
                <button
                  onClick={toggleSound}
                  className={`px-3 py-1.5 font-semibold rounded-lg border transition-all ${
                    soundEnabled
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30"
                      : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                  }`}
                >
                  {soundEnabled ? "🔊 Sound On" : "🔇 Sound Off"}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportPNG}
                  className="px-3 py-1.5 font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-all"
                >
                  📸 Snapshot
                </button>
              </div>
            </div>
          </div>

          {/* Add Conductive Elements Toolbar */}
          <div className="p-3 bg-slate-900/60 rounded-xl border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
              Add Conductors to Canvas:
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => addNode("emitter")}
                className="px-2.5 py-1.5 bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/30 rounded-lg transition-all font-medium"
              >
                + Tesla Emitter
              </button>
              <button
                onClick={() => addNode("orb")}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-all font-medium"
              >
                + Metal Orb
              </button>
              <button
                onClick={() => addNode("ground")}
                className="px-2.5 py-1.5 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 rounded-lg transition-all font-medium"
              >
                + Ground Rod
              </button>
              <button
                onClick={() => addNode("tube")}
                className="px-2.5 py-1.5 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 rounded-lg transition-all font-medium"
              >
                + Gas Tube
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar Controls & Parameters */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Preset Selector */}
          <div className="p-4 bg-slate-900/70 rounded-2xl border border-white/10">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Lab Presets & Experiments
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectPreset(p.id)}
                  className={`text-left p-2.5 rounded-xl border transition-all ${
                    presetKey === p.id
                      ? `${currentTheme.badge} border-l-4 font-semibold shadow-md`
                      : "bg-slate-950/40 hover:bg-slate-800/60 border-slate-800 text-slate-300"
                  }`}
                >
                  <div className="font-bold text-sm text-slate-100">{p.name}</div>
                  <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Electric Controls */}
          <div className="p-4 bg-slate-900/70 rounded-2xl border border-white/10 flex flex-col gap-4 text-xs">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Discharge Tuning Parameters
            </h3>

            {/* Voltage */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1 font-medium">
                <span>Arc Voltage (kV)</span>
                <span className={`font-mono ${currentTheme.accentText}`}>{voltage} kV</span>
              </div>
              <input
                type="range"
                min="20"
                max="150"
                value={voltage}
                onChange={(e) => setVoltage(Number(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer h-2"
              />
            </div>

            {/* Arc Frequency */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1 font-medium">
                <span>Discharge Frequency</span>
                <span className={`font-mono ${currentTheme.accentText}`}>{frequency} Hz</span>
              </div>
              <input
                type="range"
                min="10"
                max="120"
                value={frequency}
                onChange={(e) => setFrequency(Number(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer h-2"
              />
            </div>

            {/* Fractal Chaos */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1 font-medium">
                <span>Lichtenberg Fractal Noise</span>
                <span className={`font-mono ${currentTheme.accentText}`}>{Math.round(chaos * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={chaos}
                onChange={(e) => setChaos(Number(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer h-2"
              />
            </div>

            {/* Glow Intensity */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1 font-medium">
                <span>Glow Halo Intensity</span>
                <span className={`font-mono ${currentTheme.accentText}`}>{glowIntensity.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.4"
                max="2.5"
                step="0.1"
                value={glowIntensity}
                onChange={(e) => setGlowIntensity(Number(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer h-2"
              />
            </div>

            {/* Spark Particles */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1 font-medium">
                <span>Spark Emission Rate</span>
                <span className={`font-mono ${currentTheme.accentText}`}>{sparkCount} p/contact</span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                value={sparkCount}
                onChange={(e) => setSparkCount(Number(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer h-2"
              />
            </div>

            {/* Volume Control */}
            {soundEnabled && (
              <div className="pt-2 border-t border-white/10">
                <div className="flex justify-between text-slate-300 mb-1 font-medium">
                  <span>Arc Sound Volume</span>
                  <span className="font-mono text-cyan-300">{Math.round(volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1.0"
                  step="0.05"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer h-2"
                />
              </div>
            )}
          </div>

          {/* Selected Node Inspector */}
          {selectedNodeId ? (
            <div className="p-4 bg-slate-900/70 rounded-2xl border border-amber-500/30 flex flex-col gap-3 text-xs">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-amber-300 uppercase tracking-wider">
                  Inspecting Node
                </h4>
                <button
                  onClick={deleteSelectedNode}
                  className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-lg transition-all text-[11px] font-bold"
                >
                  🗑 Remove
                </button>
              </div>
              <p className="text-slate-400 text-[11px]">
                Drag node on canvas to reposition, or touch with mouse cursor to draw direct plasma arcs.
              </p>
            </div>
          ) : (
            <div className="p-3 bg-slate-900/40 rounded-2xl border border-white/5 text-center text-slate-500 text-xs">
              💡 Tip: Click any conductor on the canvas to edit or remove it. Drag your mouse inside the canvas to draw direct plasma arcs!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlasmaDischargeStudio;
