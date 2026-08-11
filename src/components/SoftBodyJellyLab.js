import React, { useState, useEffect, useRef, useCallback } from "react";

// Visual Theme Presets for Soft Body Jelly Studio
const THEMES = {
  gummy: {
    id: "gummy",
    name: "Gummy Neon",
    bgGradient: "from-slate-950 via-purple-950 to-slate-900",
    canvasBg: "#060412",
    primary: "#ff007f",
    secondary: "#00f0ff",
    accentText: "text-pink-400",
    accentBorder: "border-pink-500/40",
    badge: "bg-pink-500/20 text-pink-300 border-pink-500/40",
    buttonActive: "bg-pink-600 hover:bg-pink-500 text-white shadow-lg shadow-pink-600/30",
    colors: ["#ff007f", "#00f0ff", "#ffcc00", "#a855f7", "#00ff9d"],
    gridColor: "rgba(255, 0, 127, 0.08)",
  },
  cyber: {
    id: "cyber",
    name: "Cyber Laser",
    bgGradient: "from-slate-950 via-indigo-950 to-slate-900",
    canvasBg: "#040714",
    primary: "#00f3ff",
    secondary: "#7000ff",
    accentText: "text-cyan-400",
    accentBorder: "border-cyan-500/40",
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    buttonActive: "bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/30",
    colors: ["#00f3ff", "#7000ff", "#00ff9d", "#ff007f", "#38bdf8"],
    gridColor: "rgba(0, 243, 255, 0.08)",
  },
  emerald: {
    id: "emerald",
    name: "Bioluminescent Sea",
    bgGradient: "from-emerald-950 via-slate-950 to-teal-950",
    canvasBg: "#020f0c",
    primary: "#00ffaa",
    secondary: "#06b6d4",
    accentText: "text-emerald-400",
    accentBorder: "border-emerald-500/40",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    buttonActive: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30",
    colors: ["#00ffaa", "#34d399", "#06b6d4", "#10b981", "#a7f3d0"],
    gridColor: "rgba(0, 255, 170, 0.08)",
  },
  amber: {
    id: "amber",
    name: "Golden Honey",
    bgGradient: "from-amber-950 via-slate-950 to-yellow-950",
    canvasBg: "#120a02",
    primary: "#fbbf24",
    secondary: "#f59e0b",
    accentText: "text-amber-400",
    accentBorder: "border-amber-500/40",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    buttonActive: "bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold shadow-lg shadow-amber-600/30",
    colors: ["#fbbf24", "#f59e0b", "#ff4500", "#ffd700", "#ffffff"],
    gridColor: "rgba(251, 191, 36, 0.08)",
  },
  plasma: {
    id: "plasma",
    name: "Cosmic Plasma",
    bgGradient: "from-violet-950 via-slate-950 to-indigo-950",
    canvasBg: "#080417",
    primary: "#c084fc",
    secondary: "#f43f5e",
    accentText: "text-purple-300",
    accentBorder: "border-purple-400/40",
    badge: "bg-purple-500/20 text-purple-200 border-purple-400/40",
    buttonActive: "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30",
    colors: ["#c084fc", "#f43f5e", "#818cf8", "#e879f9", "#38bdf8"],
    gridColor: "rgba(192, 132, 252, 0.08)",
  },
};

// Preset Scenarios
const PRESETS = {
  gummyBlob: {
    name: "Classic Gummy Blob",
    desc: "Single squishy 16-node soft body ring with central core and high pressure",
    gravity: 9.8,
    stiffness: 0.45,
    damping: 0.985,
    pressure: 1.4,
    restitution: 0.75,
    setup: (cx, cy) => [createBlob(cx, cy, 75, 16, 0)],
  },
  bouncingStar: {
    name: "Bouncing Star",
    desc: "5-pointed star shaped jelly body with dynamic structural springs",
    gravity: 12.0,
    stiffness: 0.6,
    damping: 0.98,
    pressure: 0.8,
    restitution: 0.8,
    setup: (cx, cy) => [createStar(cx, cy - 40, 95, 45, 5, 1)],
  },
  doubleTwins: {
    name: "Colliding Twins",
    desc: "Two interactive soft jelly bodies bouncing off walls and each other",
    gravity: 9.8,
    stiffness: 0.5,
    damping: 0.985,
    pressure: 1.2,
    restitution: 0.7,
    setup: (cx, cy) => [
      createBlob(cx - 100, cy - 60, 60, 12, 0),
      createBlob(cx + 100, cy - 120, 65, 14, 1),
    ],
  },
  elasticNet: {
    name: "Elastic Trampoline Net",
    desc: "Suspended pinned cloth mesh with heavy jelly drops loaded on top",
    gravity: 14.0,
    stiffness: 0.7,
    damping: 0.975,
    pressure: 1.0,
    restitution: 0.6,
    setup: (cx, cy, w) => {
      const net = createNet(cx - w * 0.35, cy + 40, w * 0.7, 14, 3);
      const drop = createBlob(cx, cy - 140, 55, 12, 2);
      return [net, drop];
    },
  },
  slimeWorm: {
    name: "Slime Snake Worm",
    desc: "Multi-segment flexible soft body chain slithering under gravity",
    gravity: 8.0,
    stiffness: 0.55,
    damping: 0.98,
    pressure: 0.6,
    restitution: 0.65,
    setup: (cx, cy) => [createChain(cx - 140, cy - 80, 7, 28, 3)],
  },
};

// Helper: Line segment intersection test
function lineIntersection(p1, p2, p3, p4) {
  const det = (p2.x - p1.x) * (p4.y - p3.y) - (p4.x - p3.x) * (p2.y - p1.y);
  if (det === 0) return false;
  const lambda = ((p4.y - p3.y) * (p4.x - p1.x) + (p3.x - p4.x) * (p4.y - p1.y)) / det;
  const gamma = ((p1.y - p2.y) * (p4.x - p1.x) + (p2.x - p1.x) * (p4.y - p1.y)) / det;
  return 0 < lambda && lambda < 1 && 0 < gamma && gamma < 1;
}

// Factory functions for creating soft body topologies
function createBlob(cx, cy, radius, numNodes, colorIdx) {
  const nodes = [];
  const springs = [];
  const centerNode = {
    x: cx,
    y: cy,
    oldX: cx,
    oldY: cy,
    mass: 2.0,
    isPinned: false,
    radius: 4,
    colorIdx,
  };
  nodes.push(centerNode);

  for (let i = 0; i < numNodes; i++) {
    const angle = (i / numNodes) * Math.PI * 2;
    const nx = cx + Math.cos(angle) * radius;
    const ny = cy + Math.sin(angle) * radius;
    nodes.push({
      x: nx,
      y: ny,
      oldX: nx,
      oldY: ny,
      mass: 1.0,
      isPinned: false,
      radius: 3,
      colorIdx,
    });
  }

  // Connect perimeter springs
  for (let i = 1; i <= numNodes; i++) {
    const nextIdx = i === numNodes ? 1 : i + 1;
    const d = Math.hypot(nodes[i].x - nodes[nextIdx].x, nodes[i].y - nodes[nextIdx].y);
    springs.push({ a: i, b: nextIdx, restLen: d, sliced: false });
  }

  // Connect radial springs to center
  for (let i = 1; i <= numNodes; i++) {
    const d = Math.hypot(nodes[0].x - nodes[i].x, nodes[0].y - nodes[i].y);
    springs.push({ a: 0, b: i, restLen: d, sliced: false });
  }

  // Cross structural springs (skip 2)
  for (let i = 1; i <= numNodes; i++) {
    const targetIdx = ((i + 2 - 1) % numNodes) + 1;
    const d = Math.hypot(nodes[i].x - nodes[targetIdx].x, nodes[i].y - nodes[targetIdx].y);
    springs.push({ a: i, b: targetIdx, restLen: d, sliced: false });
  }

  return { type: "blob", nodes, springs, targetRadius: radius, colorIdx };
}

function createStar(cx, cy, outerR, innerR, points, colorIdx) {
  const nodes = [];
  const springs = [];
  const centerNode = { x: cx, y: cy, oldX: cx, oldY: cy, mass: 2.5, isPinned: false, colorIdx };
  nodes.push(centerNode);

  const numNodes = points * 2;
  for (let i = 0; i < numNodes; i++) {
    const angle = (i / numNodes) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    const nx = cx + Math.cos(angle) * r;
    const ny = cy + Math.sin(angle) * r;
    nodes.push({ x: nx, y: ny, oldX: nx, oldY: ny, mass: 1.0, isPinned: false, colorIdx });
  }

  for (let i = 1; i <= numNodes; i++) {
    const nextIdx = i === numNodes ? 1 : i + 1;
    const d = Math.hypot(nodes[i].x - nodes[nextIdx].x, nodes[i].y - nodes[nextIdx].y);
    springs.push({ a: i, b: nextIdx, restLen: d, sliced: false });
    const dCenter = Math.hypot(nodes[0].x - nodes[i].x, nodes[0].y - nodes[i].y);
    springs.push({ a: 0, b: i, restLen: dCenter, sliced: false });
  }

  for (let i = 1; i <= numNodes; i++) {
    const targetIdx = ((i + 2 - 1) % numNodes) + 1;
    const d = Math.hypot(nodes[i].x - nodes[targetIdx].x, nodes[i].y - nodes[targetIdx].y);
    springs.push({ a: i, b: targetIdx, restLen: d, sliced: false });
  }

  return { type: "star", nodes, springs, colorIdx };
}

function createNet(startX, startY, width, cols, rows) {
  const nodes = [];
  const springs = [];
  const dx = width / (cols - 1);
  const dy = 24;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const isTopPinned = r === 0 && (c === 0 || c === cols - 1 || c === Math.floor(cols / 2));
      nodes.push({
        x: startX + c * dx,
        y: startY + r * dy,
        oldX: startX + c * dx,
        oldY: startY + r * dy,
        mass: isTopPinned ? Infinity : 1.0,
        isPinned: isTopPinned,
        colorIdx: 4,
      });
    }
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      if (c < cols - 1) {
        const right = idx + 1;
        const d = Math.hypot(nodes[idx].x - nodes[right].x, nodes[idx].y - nodes[right].y);
        springs.push({ a: idx, b: right, restLen: d, sliced: false });
      }
      if (r < rows - 1) {
        const down = idx + cols;
        const d = Math.hypot(nodes[idx].x - nodes[down].x, nodes[idx].y - nodes[down].y);
        springs.push({ a: idx, b: down, restLen: d, sliced: false });
      }
    }
  }

  return { type: "net", nodes, springs, colorIdx: 4 };
}

function createChain(startX, startY, count, radius, colorIdx) {
  const nodes = [];
  const springs = [];

  for (let i = 0; i < count; i++) {
    const cx = startX + i * (radius * 1.8);
    const cy = startY + Math.sin(i) * 10;
    nodes.push({
      x: cx,
      y: cy,
      oldX: cx,
      oldY: cy,
      mass: 1.2,
      isPinned: i === 0,
      colorIdx,
    });
  }

  for (let i = 0; i < count - 1; i++) {
    const d = Math.hypot(nodes[i].x - nodes[i + 1].x, nodes[i].y - nodes[i + 1].y);
    springs.push({ a: i, b: i + 1, restLen: d, sliced: false });
  }

  return { type: "chain", nodes, springs, colorIdx };
}

export default function SoftBodyJellyLab() {
  // Simulator State
  const [activePreset, setActivePreset] = useState("gummyBlob");
  const [currentTheme, setCurrentTheme] = useState("gummy");
  const [activeTool, setActiveTool] = useState("grab"); // grab, push, slice, spawn
  const [isPaused, setIsPaused] = useState(false);
  const [showWireframe, setShowWireframe] = useState(true);
  const [showStressMap, setShowStressMap] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Physics Control Parameters
  const [gravity, setGravity] = useState(9.8);
  const [stiffness, setStiffness] = useState(0.45);
  const [damping, setDamping] = useState(0.985);
  const [pressureFactor, setPressureFactor] = useState(1.4);
  const [restitution, setRestitution] = useState(0.75);

  // Real-time Stats
  const [stats, setStats] = useState({
    fps: 60,
    kineticEnergy: 0,
    activeSprings: 0,
    maxStress: 0,
    nodeCount: 0,
  });

  // Canvas & Simulation References
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const bodiesRef = useRef([]);
  const particlesRef = useRef([]); // Spark/splash particles
  const mouseRef = useRef({
    x: 0,
    y: 0,
    prevX: 0,
    prevY: 0,
    isDown: false,
    dragNode: null,
    dragBody: null,
    slicePath: [],
  });

  // Audio Context Ref
  const audioCtxRef = useRef(null);

  const theme = THEMES[currentTheme];

  // Sound Synth Functions
  const playImpactSound = useCallback(
    (intensity = 0.5, freq = 180) => {
      if (!soundEnabled) return;
      try {
        if (!audioCtxRef.current) {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          audioCtxRef.current = new AudioCtx();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === "suspended") ctx.resume();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.3, ctx.currentTime + 0.15);

        gain.gain.setValueAtTime(Math.min(intensity * 0.25, 0.4), ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } catch (e) {
        console.warn("Audio play error:", e);
      }
    },
    [soundEnabled]
  );

  const playSnapSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {
      console.warn("Snap audio error:", e);
    }
  }, [soundEnabled]);

  // Reset / Initialize Simulation World
  const initSimulation = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = canvas.width || 800;
    const height = canvas.height || 500;
    const cx = width / 2;
    const cy = height / 2;

    const presetConfig = PRESETS[activePreset];
    if (presetConfig) {
      bodiesRef.current = presetConfig.setup(cx, cy, width);
      setGravity(presetConfig.gravity);
      setStiffness(presetConfig.stiffness);
      setDamping(presetConfig.damping);
      setPressureFactor(presetConfig.pressure);
      setRestitution(presetConfig.restitution);
    }
    particlesRef.current = [];
  }, [activePreset]);

  useEffect(() => {
    initSimulation();
  }, [initSimulation]);

  // Main Verlet Physics & Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let width = (canvas.width = canvas.parentElement.clientWidth);
    let height = (canvas.height = Math.min(width * 0.65, 520));

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = Math.min(width * 0.65, 520);
    };

    window.addEventListener("resize", handleResize);

    let lastTime = performance.now();
    let frameCount = 0;
    let fpsTimer = performance.now();

    const dt = 0.016; // Fixed timestep

    const animate = () => {
      const now = performance.now();
      frameCount++;
      if (now - fpsTimer >= 500) {
        const calculatedFps = Math.round((frameCount * 1000) / (now - fpsTimer));
        let totalKE = 0;
        let totalSprings = 0;
        let maxStr = 0;
        let totalNodes = 0;

        bodiesRef.current.forEach((body) => {
          totalNodes += body.nodes.length;
          body.nodes.forEach((n) => {
            const vx = n.x - n.oldX;
            const vy = n.y - n.oldY;
            totalKE += 0.5 * n.mass * (vx * vx + vy * vy);
          });
          body.springs.forEach((s) => {
            if (!s.sliced) {
              totalSprings++;
              const nA = body.nodes[s.a];
              const nB = body.nodes[s.b];
              const dist = Math.hypot(nB.x - nA.x, nB.y - nA.y);
              const strain = Math.abs(dist - s.restLen) / s.restLen;
              if (strain > maxStr) maxStr = strain;
            }
          });
        });

        setStats({
          fps: calculatedFps,
          kineticEnergy: Math.round(totalKE * 100) / 100,
          activeSprings: totalSprings,
          maxStress: Math.round(maxStr * 100) / 100,
          nodeCount: totalNodes,
        });

        frameCount = 0;
        fpsTimer = now;
      }

      // Clear & Draw Background
      ctx.fillStyle = theme.canvasBg;
      ctx.fillRect(0, 0, width, height);

      // Render Ambient Grid
      ctx.strokeStyle = theme.gridColor;
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

      if (!isPaused) {
        // --- 1. VERLET INTEGRATION ---
        bodiesRef.current.forEach((body) => {
          body.nodes.forEach((node) => {
            if (node.isPinned) return;

            const vx = (node.x - node.oldX) * damping;
            const vy = (node.y - node.oldY) * damping;

            node.oldX = node.x;
            node.oldY = node.y;

            node.x += vx;
            node.y += vy + gravity * 15 * dt * dt;

            // Handle Mouse Interactive Dragging
            if (mouseRef.current.dragNode === node) {
              node.x = mouseRef.current.x;
              node.y = mouseRef.current.y;
            }
          });
        });

        // --- 2. PUSH FIELD TOOL ---
        if (activeTool === "push" && mouseRef.current.isDown) {
          const mx = mouseRef.current.x;
          const my = mouseRef.current.y;
          const pushRadius = 120;
          bodiesRef.current.forEach((body) => {
            body.nodes.forEach((node) => {
              if (node.isPinned) return;
              const dx = node.x - mx;
              const dy = node.y - my;
              const dist = Math.hypot(dx, dy);
              if (dist < pushRadius && dist > 1) {
                const force = ((1 - dist / pushRadius) * 2.5) / node.mass;
                node.x += (dx / dist) * force;
                node.y += (dy / dist) * force;
              }
            });
          });
        }

        // --- 3. CONSTRAINT SATISFACTION ITERATIONS ---
        const iterations = 5;
        for (let iter = 0; iter < iterations; iter++) {
          // A. Spring Constraints
          bodiesRef.current.forEach((body) => {
            body.springs.forEach((spring) => {
              if (spring.sliced) return;
              const nA = body.nodes[spring.a];
              const nB = body.nodes[spring.b];

              const dx = nB.x - nA.x;
              const dy = nB.y - nA.y;
              const dist = Math.hypot(dx, dy) || 0.001;
              const delta = (dist - spring.restLen) / dist;

              const pushX = dx * delta * 0.5 * stiffness;
              const pushY = dy * delta * 0.5 * stiffness;

              if (!nA.isPinned) {
                nA.x += pushX;
                nA.y += pushY;
              }
              if (!nB.isPinned) {
                nB.x -= pushX;
                nB.y -= pushY;
              }
            });
          });

          // B. Pressure Volume Force for Closed Soft Bodies
          bodiesRef.current.forEach((body) => {
            if (body.type === "blob" || body.type === "star") {
              const nodes = body.nodes;
              const numPerimeter = nodes.length - 1; // node 0 is center
              if (numPerimeter < 3) return;

              // Calculate current volume (signed area)
              let currentArea = 0;
              for (let i = 1; i <= numPerimeter; i++) {
                const nextIdx = i === numPerimeter ? 1 : i + 1;
                currentArea += nodes[i].x * nodes[nextIdx].y - nodes[nextIdx].x * nodes[i].y;
              }
              currentArea = Math.abs(currentArea * 0.5);

              // Ideal Gas Pressure Force
              const targetArea = Math.PI * (body.targetRadius || 65) ** 2;
              const pressureDelta = ((targetArea - currentArea) / targetArea) * pressureFactor * 0.2;

              for (let i = 1; i <= numPerimeter; i++) {
                const nextIdx = i === numPerimeter ? 1 : i + 1;
                const nA = nodes[i];
                const nB = nodes[nextIdx];

                // Normal vector to edge (nA -> nB)
                const edgeX = nB.x - nA.x;
                const edgeY = nB.y - nA.y;
                const len = Math.hypot(edgeX, edgeY) || 1;
                const nx = -edgeY / len;
                const ny = edgeX / len;

                if (!nA.isPinned) {
                  nA.x += nx * pressureDelta * 0.5;
                  nA.y += ny * pressureDelta * 0.5;
                }
                if (!nB.isPinned) {
                  nB.x += nx * pressureDelta * 0.5;
                  nB.y += ny * pressureDelta * 0.5;
                }
              }
            }
          });

          // C. Boundary & Floor Collision
          bodiesRef.current.forEach((body) => {
            body.nodes.forEach((node) => {
              if (node.isPinned) return;
              const pad = 12;

              // Floor
              if (node.y > height - pad) {
                const vy = (node.y - node.oldY) * restitution;
                node.y = height - pad;
                node.oldY = node.y + vy;
                node.oldX += (node.x - node.oldX) * 0.1; // Friction
                if (Math.abs(vy) > 2.5 && iter === 0) {
                  playImpactSound(Math.min(Math.abs(vy) / 10, 1.0), 160 + Math.random() * 80);
                }
              }
              // Ceiling
              if (node.y < pad) {
                const vy = (node.y - node.oldY) * restitution;
                node.y = pad;
                node.oldY = node.y + vy;
              }
              // Left Wall
              if (node.x < pad) {
                const vx = (node.x - node.oldX) * restitution;
                node.x = pad;
                node.oldX = node.x + vx;
              }
              // Right Wall
              if (node.x > width - pad) {
                const vx = (node.x - node.oldX) * restitution;
                node.x = width - pad;
                node.oldX = node.x + vx;
              }
            });
          });
        }
      }

      // --- 4. RENDER BODIES & SPRINGS ---
      bodiesRef.current.forEach((body) => {
        const bodyColor = theme.colors[body.colorIdx % theme.colors.length];

        // Draw Soft Body Filled Smooth Geometry
        if (body.type === "blob" || body.type === "star") {
          const perimeter = body.nodes.slice(1);
          if (perimeter.length >= 3) {
            ctx.beginPath();
            ctx.moveTo(
              (perimeter[0].x + perimeter[perimeter.length - 1].x) / 2,
              (perimeter[0].y + perimeter[perimeter.length - 1].y) / 2
            );

            for (let i = 0; i < perimeter.length; i++) {
              const current = perimeter[i];
              const next = perimeter[(i + 1) % perimeter.length];
              const midX = (current.x + next.x) / 2;
              const midY = (current.y + next.y) / 2;
              ctx.quadraticCurveTo(current.x, current.y, midX, midY);
            }
            ctx.closePath();

            // Translucent Jelly Body Gradient Fill
            const grad = ctx.createRadialGradient(
              body.nodes[0].x - 15,
              body.nodes[0].y - 15,
              5,
              body.nodes[0].x,
              body.nodes[0].y,
              90
            );
            grad.addColorStop(0, bodyColor + "cc");
            grad.addColorStop(0.7, bodyColor + "66");
            grad.addColorStop(1, bodyColor + "22");

            ctx.fillStyle = grad;
            ctx.fill();
            ctx.lineWidth = 3;
            ctx.strokeStyle = bodyColor;
            ctx.stroke();

            // Specular Shine
            ctx.beginPath();
            ctx.ellipse(
              body.nodes[0].x - 12,
              body.nodes[0].y - 14,
              14,
              7,
              -Math.PI / 4,
              0,
              Math.PI * 2
            );
            ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
            ctx.fill();
          }
        }

        // Draw Springs Skeleton & Stress Map
        if (showWireframe) {
          body.springs.forEach((spring) => {
            if (spring.sliced) return;
            const nA = body.nodes[spring.a];
            const nB = body.nodes[spring.b];

            ctx.beginPath();
            ctx.moveTo(nA.x, nA.y);
            ctx.lineTo(nB.x, nB.y);

            if (showStressMap) {
              const dist = Math.hypot(nB.x - nA.x, nB.y - nA.y);
              const strain = Math.abs(dist - spring.restLen) / spring.restLen;

              if (strain > 0.4) ctx.strokeStyle = "#ff0055";
              else if (strain > 0.2) ctx.strokeStyle = "#ffaa00";
              else ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
              ctx.lineWidth = Math.max(1, 2.5 - strain * 2);
            } else {
              ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
              ctx.lineWidth = 1;
            }
            ctx.stroke();
          });
        }

        // Draw Nodes
        body.nodes.forEach((node, idx) => {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.isPinned ? 6 : 3.5, 0, Math.PI * 2);
          ctx.fillStyle = node.isPinned ? "#ffcc00" : idx === 0 ? "#ffffff" : bodyColor;
          ctx.shadowColor = bodyColor;
          ctx.shadowBlur = node.isPinned ? 10 : 4;
          ctx.fill();
          ctx.shadowBlur = 0;
        });
      });

      // --- 5. RENDER PARTICLES & TOOL FX ---
      // Spark / Splash Particles
      particlesRef.current.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.03;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.floor(Math.max(0, p.alpha) * 255).toString(16).padStart(2, "0");
        ctx.fill();
      });
      particlesRef.current = particlesRef.current.filter((p) => p.alpha > 0);

      // Tool: Slice Trail Line
      if (activeTool === "slice" && mouseRef.current.slicePath.length > 1) {
        ctx.beginPath();
        const pts = mouseRef.current.slicePath;
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i].x, pts[i].y);
        }
        ctx.strokeStyle = "#ff007f";
        ctx.lineWidth = 3;
        ctx.shadowColor = "#ff007f";
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Tool: Push Field Rings around Cursor
      if (activeTool === "push") {
        ctx.beginPath();
        ctx.arc(mouseRef.current.x, mouseRef.current.y, 120, 0, Math.PI * 2);
        ctx.strokeStyle = mouseRef.current.isDown ? "rgba(0, 243, 255, 0.6)" : "rgba(0, 243, 255, 0.2)";
        ctx.lineWidth = mouseRef.current.isDown ? 2 : 1;
        ctx.setLineDash([6, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [
    isPaused,
    gravity,
    stiffness,
    damping,
    pressureFactor,
    restitution,
    theme,
    activeTool,
    showWireframe,
    showStressMap,
    playImpactSound,
  ]);

  // --- MOUSE & TOUCH EVENT HANDLERS ---
  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    mouseRef.current.isDown = true;
    mouseRef.current.x = mx;
    mouseRef.current.y = my;
    mouseRef.current.prevX = mx;
    mouseRef.current.prevY = my;

    if (activeTool === "grab") {
      let closestNode = null;
      let minDist = 35; // Grab radius

      bodiesRef.current.forEach((body) => {
        body.nodes.forEach((node) => {
          const d = Math.hypot(node.x - mx, node.y - my);
          if (d < minDist) {
            minDist = d;
            closestNode = node;
          }
        });
      });

      mouseRef.current.dragNode = closestNode;
    } else if (activeTool === "slice") {
      mouseRef.current.slicePath = [{ x: mx, y: my }];
    } else if (activeTool === "spawn") {
      // Spawn new soft jelly blob at click position
      const newBlob = createBlob(mx, my, 45, 12, Math.floor(Math.random() * theme.colors.length));
      bodiesRef.current.push(newBlob);
      playImpactSound(0.6, 260);

      // Spawn spark burst
      for (let i = 0; i < 12; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = Math.random() * 4 + 1;
        particlesRef.current.push({
          x: mx,
          y: my,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          size: Math.random() * 3 + 2,
          color: theme.primary,
          alpha: 1.0,
        });
      }
    }
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    mouseRef.current.prevX = mouseRef.current.x;
    mouseRef.current.prevY = mouseRef.current.y;
    mouseRef.current.x = mx;
    mouseRef.current.y = my;

    if (mouseRef.current.isDown && activeTool === "slice") {
      const p1 = { x: mouseRef.current.prevX, y: mouseRef.current.prevY };
      const p2 = { x: mx, y: my };
      mouseRef.current.slicePath.push(p2);

      // Check intersection with all springs
      bodiesRef.current.forEach((body) => {
        body.springs.forEach((spring) => {
          if (spring.sliced) return;
          const nA = body.nodes[spring.a];
          const nB = body.nodes[spring.b];
          if (lineIntersection(p1, p2, nA, nB)) {
            spring.sliced = true;
            playSnapSound();

            // Spawn cut sparks
            const midX = (nA.x + nB.x) / 2;
            const midY = (nA.y + nB.y) / 2;
            for (let i = 0; i < 8; i++) {
              const angle = Math.random() * Math.PI * 2;
              const spd = Math.random() * 5 + 2;
              particlesRef.current.push({
                x: midX,
                y: midY,
                vx: Math.cos(angle) * spd,
                vy: Math.sin(angle) * spd,
                size: Math.random() * 2.5 + 1.5,
                color: "#ff007f",
                alpha: 1.0,
              });
            }
          }
        });
      });
    }
  };

  const handleMouseUp = () => {
    mouseRef.current.isDown = false;
    mouseRef.current.dragNode = null;
    mouseRef.current.slicePath = [];
  };

  return (
    <div className={`max-w-6xl mx-auto my-8 bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100 bg-gradient-to-b ${theme.bgGradient}`}>
      {/* Top Header */}
      <div className="p-6 border-b border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Soft-Body Jelly & Spring Lab
            </h2>
            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${theme.badge}`}>
              2D Verlet Engine
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Real-time mass-spring soft body physics with gas pressure, spring cutting, and Web Audio synthesis
          </p>
        </div>

        {/* Action Controls & Sound Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-all flex items-center gap-1.5 ${
              soundEnabled
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : "bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200"
            }`}
          >
            <span>{soundEnabled ? "🔊 Sound ON" : "🔇 Sound OFF"}</span>
          </button>

          <button
            onClick={() => setIsPaused(!isPaused)}
            className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
          >
            {isPaused ? "▶ Play" : "⏸ Pause"}
          </button>

          <button
            onClick={initSimulation}
            className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
          >
            🔄 Reset
          </button>
        </div>
      </div>

      {/* Preset Selector Header Bar */}
      <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800/60 flex items-center gap-2 overflow-x-auto">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider mr-2 shrink-0">
          Presets:
        </span>
        {Object.entries(PRESETS).map(([key, p]) => (
          <button
            key={key}
            onClick={() => setActivePreset(key)}
            className={`px-3 py-1 text-xs rounded-lg font-medium transition-all shrink-0 ${
              activePreset === key
                ? theme.buttonActive
                : "bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Main Grid: Interactive Canvas + Sidebar Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
        {/* Canvas Area */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-inner bg-slate-950">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="w-full h-auto cursor-crosshair block"
            />

            {/* Interactive Tool Floating Dock */}
            <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl p-1.5 flex gap-1 shadow-lg">
              {[
                { id: "grab", label: "🖐 Grab & Toss", desc: "Drag nodes with spring tension" },
                { id: "push", label: "🌀 Push Field", desc: "Repel nodes with pressure field" },
                { id: "slice", label: "✂ Slice Blade", desc: "Drag across springs to cut them" },
                { id: "spawn", label: "💧 Spawn Drop", desc: "Click canvas to add new jelly blob" },
              ].map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setActiveTool(tool.id)}
                  title={tool.desc}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    activeTool === tool.id
                      ? theme.buttonActive
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/80"
                  }`}
                >
                  {tool.label}
                </button>
              ))}
            </div>

            {/* View Toggles Overlay */}
            <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl p-1.5 flex gap-2 shadow-lg">
              <button
                onClick={() => setShowWireframe(!showWireframe)}
                className={`px-2.5 py-1 text-xs rounded-md transition-all ${
                  showWireframe ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                🕸 Springs
              </button>
              <button
                onClick={() => setShowStressMap(!showStressMap)}
                className={`px-2.5 py-1 text-xs rounded-md transition-all ${
                  showStressMap ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                🔥 Stress Map
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-400 flex items-center justify-between px-1">
            <span>
              💡 <b>Active Tool:</b> {activeTool.toUpperCase()} — {
                activeTool === "grab"
                  ? "Click and drag any soft body node to pull or fling it."
                  : activeTool === "push"
                  ? "Hold left mouse button to push nodes away."
                  : activeTool === "slice"
                  ? "Drag across springs to slice them."
                  : "Click anywhere on canvas to drop new jelly blobs."
              }
            </span>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="flex flex-col gap-5 bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
            Physics Parameters
          </h3>

          {/* Gravity Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-400">Gravity Vector:</span>
              <span className={theme.accentText}>{gravity.toFixed(1)} m/s²</span>
            </div>
            <input
              type="range"
              min="-15"
              max="30"
              step="0.5"
              value={gravity}
              onChange={(e) => setGravity(parseFloat(e.target.value))}
              className="w-full accent-pink-500 bg-slate-800 rounded-lg cursor-pointer h-1.5"
            />
          </div>

          {/* Spring Stiffness Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-400">Spring Stiffness:</span>
              <span className={theme.accentText}>{(stiffness * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.95"
              step="0.05"
              value={stiffness}
              onChange={(e) => setStiffness(parseFloat(e.target.value))}
              className="w-full accent-pink-500 bg-slate-800 rounded-lg cursor-pointer h-1.5"
            />
          </div>

          {/* Internal Pressure Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-400">Gas Inflation Pressure:</span>
              <span className={theme.accentText}>{pressureFactor.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="3.0"
              step="0.1"
              value={pressureFactor}
              onChange={(e) => setPressureFactor(parseFloat(e.target.value))}
              className="w-full accent-pink-500 bg-slate-800 rounded-lg cursor-pointer h-1.5"
            />
          </div>

          {/* Damping / Friction */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-400">Viscosity Damping:</span>
              <span className={theme.accentText}>{damping.toFixed(3)}</span>
            </div>
            <input
              type="range"
              min="0.92"
              max="0.999"
              step="0.001"
              value={damping}
              onChange={(e) => setDamping(parseFloat(e.target.value))}
              className="w-full accent-pink-500 bg-slate-800 rounded-lg cursor-pointer h-1.5"
            />
          </div>

          {/* Wall Restitution */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-400">Floor Restitution (Bounce):</span>
              <span className={theme.accentText}>{(restitution * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.95"
              step="0.05"
              value={restitution}
              onChange={(e) => setRestitution(parseFloat(e.target.value))}
              className="w-full accent-pink-500 bg-slate-800 rounded-lg cursor-pointer h-1.5"
            />
          </div>

          {/* Visual Theme Selector */}
          <div className="pt-2 border-t border-slate-800">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Visual Theme
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(THEMES).map(([tKey, t]) => (
                <button
                  key={tKey}
                  onClick={() => setCurrentTheme(tKey)}
                  className={`px-2.5 py-1.5 text-xs rounded-xl font-medium border text-left transition-all ${
                    currentTheme === tKey
                      ? "bg-slate-800 text-white border-slate-600 shadow-md"
                      : "bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: t.primary }}
                    />
                    {t.name}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Live Telemetry & Stats Footer */}
      <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
        <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800/60">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">FPS</div>
          <div className="text-lg font-bold text-emerald-400">{stats.fps}</div>
        </div>
        <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800/60">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Kinetic Energy</div>
          <div className="text-lg font-bold text-pink-400">{stats.kineticEnergy}</div>
        </div>
        <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800/60">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Active Springs</div>
          <div className="text-lg font-bold text-cyan-400">{stats.activeSprings}</div>
        </div>
        <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800/60">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Max Tensile Strain</div>
          <div className="text-lg font-bold text-amber-400">{stats.maxStress}</div>
        </div>
        <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800/60">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Nodes</div>
          <div className="text-lg font-bold text-purple-400">{stats.nodeCount}</div>
        </div>
      </div>
    </div>
  );
}
