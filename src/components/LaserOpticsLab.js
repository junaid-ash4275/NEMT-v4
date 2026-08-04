import React, { useState, useEffect, useRef, useCallback } from "react";

// Themes for visual styling
const THEMES = {
  cyber: {
    id: "cyber",
    name: "Cyber Neon",
    bg: "from-slate-950 via-indigo-950 to-slate-900",
    canvasBg: "#050914",
    gridColor: "rgba(56, 189, 248, 0.07)",
    accentGradient: "from-cyan-400 via-teal-300 to-indigo-400",
    accentBorder: "border-cyan-500/40",
    glow: "shadow-cyan-500/20",
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-400/40",
  },
  synthwave: {
    id: "synthwave",
    name: "Synthwave Sunset",
    bg: "from-purple-950 via-slate-950 to-pink-950",
    canvasBg: "#0f051d",
    gridColor: "rgba(236, 72, 153, 0.08)",
    accentGradient: "from-pink-400 via-fuchsia-300 to-purple-400",
    accentBorder: "border-pink-500/40",
    glow: "shadow-pink-500/20",
    badge: "bg-pink-500/20 text-pink-300 border-pink-400/40",
  },
  emerald: {
    id: "emerald",
    name: "Quantum Emerald",
    bg: "from-gray-950 via-emerald-950 to-teal-950",
    canvasBg: "#03140e",
    gridColor: "rgba(16, 185, 129, 0.08)",
    accentGradient: "from-emerald-400 via-teal-300 to-lime-300",
    accentBorder: "border-emerald-500/40",
    glow: "shadow-emerald-500/20",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-400/40",
  },
  deepspace: {
    id: "deepspace",
    name: "Deep Space Void",
    bg: "from-slate-950 via-slate-900 to-blue-950",
    canvasBg: "#020617",
    gridColor: "rgba(99, 102, 241, 0.08)",
    accentGradient: "from-blue-400 via-indigo-300 to-violet-400",
    accentBorder: "border-indigo-500/40",
    glow: "shadow-indigo-500/20",
    badge: "bg-indigo-500/20 text-indigo-300 border-indigo-400/40",
  },
};

// Laser colors
const LASER_SPECTRUM = [
  { id: "red", name: "Ruby Red (650nm)", color: "#ff2a6d", glow: "#ff2a6d88", beamWidth: 3.5 },
  { id: "green", name: "Emerald (532nm)", color: "#05ffa1", glow: "#05ffa188", beamWidth: 3.5 },
  { id: "cyan", name: "Cyan Plasma (488nm)", color: "#00f0ff", glow: "#00f0ff88", beamWidth: 3.5 },
  { id: "violet", name: "Ultraviolet (405nm)", color: "#b967ff", glow: "#b967ff88", beamWidth: 3.5 },
  { id: "white", name: "Prismatic White", color: "#ffffff", glow: "#ffffffaa", beamWidth: 4.5, isPrismatic: true },
];

// Presets
const PRESET_LABS = [
  {
    id: "sandbox",
    name: "Freeform Sandbox",
    desc: "Create and test your own optical configurations",
    items: [
      { id: "laser1", type: "laser", x: 120, y: 250, angle: 0, wavelength: "cyan", power: 100 },
      { id: "mirror1", type: "mirror", x: 450, y: 250, angle: 45, width: 80 },
      { id: "target1", type: "target", x: 450, y: 100, radius: 24, power: 0 },
    ],
  },
  {
    id: "prism_dispersion",
    name: "Prism Rainbow Dispersion",
    desc: "Pass white light through a crystal prism to split into spectrum rays",
    items: [
      { id: "laser1", type: "laser", x: 100, y: 250, angle: 0, wavelength: "white", power: 100 },
      { id: "prism1", type: "prism", x: 340, y: 250, angle: 0, size: 70 },
      { id: "target1", type: "target", x: 620, y: 180, radius: 24, power: 0 },
      { id: "target2", type: "target", x: 640, y: 250, radius: 24, power: 0 },
      { id: "target3", type: "target", x: 620, y: 320, radius: 24, power: 0 },
    ],
  },
  {
    id: "portal_loop",
    name: "Quantum Portal Paradox",
    desc: "Teleport beams across spatial rift portals to charge isolated power cores",
    items: [
      { id: "laser1", type: "laser", x: 100, y: 150, angle: 0, wavelength: "violet", power: 100 },
      { id: "mirror1", type: "mirror", x: 380, y: 150, angle: 135, width: 80 },
      { id: "portalA", type: "portalA", x: 380, y: 380, angle: 90, size: 50 },
      { id: "portalB", type: "portalB", x: 650, y: 120, angle: 270, size: 50 },
      { id: "target1", type: "target", x: 650, y: 360, radius: 26, power: 0 },
      { id: "wall1", type: "wall", x: 500, y: 250, angle: 90, width: 220 },
    ],
  },
  {
    id: "beam_labyrinth",
    name: "Laser Labyrinth",
    desc: "Bounce rays around obstacles to activate dual energy receivers",
    items: [
      { id: "laser1", type: "laser", x: 100, y: 100, angle: 30, wavelength: "green", power: 100 },
      { id: "mirror1", type: "mirror", x: 350, y: 244, angle: -60, width: 70 },
      { id: "mirror2", type: "mirror", x: 180, y: 400, angle: 45, width: 70 },
      { id: "splitter1", type: "splitter", x: 500, y: 400, angle: 0, size: 55 },
      { id: "wall1", type: "wall", x: 350, y: 350, angle: 0, width: 140 },
      { id: "target1", type: "target", x: 500, y: 120, radius: 24, power: 0 },
      { id: "target2", type: "target", x: 680, y: 400, radius: 24, power: 0 },
    ],
  },
];

const LaserOpticsLab = () => {
  const [themeKey, setThemeKey] = useState(() => localStorage.getItem("laser_theme") || "cyber");
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem("laser_optics_items");
    return saved ? JSON.parse(saved) : PRESET_LABS[0].items;
  });
  const [selectedId, setSelectedId] = useState(null);
  const [presetId, setPresetId] = useState("sandbox");
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [beamIntensity, setBeamIntensity] = useState(1.2);
  const [fogDensity, setFogDensity] = useState(0.8);
  const [rayStats, setRayStats] = useState({ activeRays: 0, reflections: 0, targetsCharged: 0, totalTargets: 0 });
  const [targetPowers, setTargetPowers] = useState({});
  
  const canvasRef = useRef(null);
  const audioCtxRef = useRef(null);
  const draggingIdRef = useRef(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  const activeTheme = THEMES[themeKey] || THEMES.cyber;

  // Persist items
  useEffect(() => {
    localStorage.setItem("laser_optics_items", JSON.stringify(items));
    localStorage.setItem("laser_theme", themeKey);
  }, [items, themeKey]);

  // Audio effect generator
  const playOpticsSound = useCallback((type) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === "reflect") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === "target") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.06);
        osc.frequency.setValueAtTime(783.99, now + 0.12);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch {
      // Audio fallback
    }
  }, [soundEnabled]);

  // Raycasting simulation & Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const width = canvas.width;
    const height = canvas.height;

    // Simulation calculation function
    const simulateOptics = () => {
      let rayCount = 0;
      let reflectionCount = 0;
      const hitTargetMap = {};
      
      const lasers = items.filter((i) => i.type === "laser");
      const mirrors = items.filter((i) => i.type === "mirror");
      const prisms = items.filter((i) => i.type === "prism");
      const splitters = items.filter((i) => i.type === "splitter");
      const walls = items.filter((i) => i.type === "wall");
      const targets = items.filter((i) => i.type === "target");
      const portalA = items.find((i) => i.type === "portalA");
      const portalB = items.find((i) => i.type === "portalB");

      const raysToDraw = [];
      const queue = [];

      lasers.forEach((l) => {
        const rad = (l.angle * Math.PI) / 180;
        const colorObj = LASER_SPECTRUM.find((s) => s.id === l.wavelength) || LASER_SPECTRUM[0];
        
        if (colorObj.isPrismatic) {
          queue.push({ x: l.x, y: l.y, dx: Math.cos(rad), dy: Math.sin(rad), color: "#ffffff", width: 4, bounce: 0 });
        } else {
          queue.push({ x: l.x, y: l.y, dx: Math.cos(rad), dy: Math.sin(rad), color: colorObj.color, width: 3, bounce: 0 });
        }
      });

      const maxBounces = 25;

      while (queue.length > 0 && rayCount < 100) {
        const ray = queue.shift();
        rayCount++;

        let closestHit = null;
        let minT = 1500; // Ray length cap

        // Helper line-segment ray intersect
        const checkSegmentIntersect = (x1, y1, x2, y2, itemObj, hitType) => {
          const r_px = ray.x;
          const r_py = ray.y;
          const r_dx = ray.dx;
          const r_dy = ray.dy;

          const s_px = x1;
          const s_py = y1;
          const s_dx = x2 - x1;
          const s_dy = y2 - y1;

          const mag2 = r_dx * r_dx + r_dy * r_dy;
          const mag1 = s_dx * s_dx + s_dy * s_dy;
          if (mag1 === 0 || mag2 === 0) return;

          const denominator = r_dx * s_dy - r_dy * s_dx;
          if (Math.abs(denominator) < 0.0001) return;

          const t1 = ((s_px - r_px) * s_dy - (s_py - r_py) * s_dx) / denominator;
          const t2 = ((s_px - r_px) * r_dy - (s_py - r_py) * r_dx) / denominator;

          if (t1 > 0.1 && t2 >= 0 && t2 <= 1) {
            if (t1 < minT) {
              minT = t1;
              const hitX = r_px + r_dx * t1;
              const hitY = r_py + r_dy * t1;
              // Normal vector
              let nx = -s_dy;
              let ny = s_dx;
              const nLen = Math.hypot(nx, ny);
              nx /= nLen;
              ny /= nLen;
              if (r_dx * nx + r_dy * ny > 0) {
                nx = -nx;
                ny = -ny;
              }
              closestHit = { t: t1, x: hitX, y: hitY, nx, ny, item: itemObj, hitType };
            }
          }
        };

        // Check Mirrors
        mirrors.forEach((m) => {
          const rad = (m.angle * Math.PI) / 180;
          const hw = (m.width || 70) / 2;
          const x1 = m.x - Math.cos(rad) * hw;
          const y1 = m.y - Math.sin(rad) * hw;
          const x2 = m.x + Math.cos(rad) * hw;
          const y2 = m.y + Math.sin(rad) * hw;
          checkSegmentIntersect(x1, y1, x2, y2, m, "mirror");
        });

        // Check Walls
        walls.forEach((w) => {
          const rad = (w.angle * Math.PI) / 180;
          const hw = (w.width || 120) / 2;
          const x1 = w.x - Math.cos(rad) * hw;
          const y1 = w.y - Math.sin(rad) * hw;
          const x2 = w.x + Math.cos(rad) * hw;
          const y2 = w.y + Math.sin(rad) * hw;
          checkSegmentIntersect(x1, y1, x2, y2, w, "wall");
        });

        // Check Prisms (Triangle bounds)
        prisms.forEach((p) => {
          const size = p.size || 60;
          const rad = (p.angle * Math.PI) / 180;
          const p1 = { x: p.x + Math.cos(rad) * size, y: p.y + Math.sin(rad) * size };
          const p2 = { x: p.x + Math.cos(rad + (2 * Math.PI) / 3) * size, y: p.y + Math.sin(rad + (2 * Math.PI) / 3) * size };
          const p3 = { x: p.x + Math.cos(rad + (4 * Math.PI) / 3) * size, y: p.y + Math.sin(rad + (4 * Math.PI) / 3) * size };
          
          checkSegmentIntersect(p1.x, p1.y, p2.x, p2.y, p, "prism");
          checkSegmentIntersect(p2.x, p2.y, p3.x, p3.y, p, "prism");
          checkSegmentIntersect(p3.x, p3.y, p1.x, p1.y, p, "prism");
        });

        // Check Splitters (Square face)
        splitters.forEach((sp) => {
          const s = (sp.size || 50) / 2;
          const rad = (sp.angle * Math.PI) / 180;
          const cos = Math.cos(rad);
          const sin = Math.sin(rad);

          const corners = [
            { x: sp.x + (-s * cos - -s * sin), y: sp.y + (-s * sin + -s * cos) },
            { x: sp.x + (s * cos - -s * sin), y: sp.y + (s * sin + -s * cos) },
            { x: sp.x + (s * cos - s * sin), y: sp.y + (s * sin + s * cos) },
            { x: sp.x + (-s * cos - s * sin), y: sp.y + (-s * sin + s * cos) },
          ];

          for (let c = 0; c < 4; c++) {
            const next = (c + 1) % 4;
            checkSegmentIntersect(corners[c].x, corners[c].y, corners[next].x, corners[next].y, sp, "splitter");
          }
        });

        // Check Portals
        if (portalA && portalB) {
          [portalA, portalB].forEach((p) => {
            const rad = (p.angle * Math.PI) / 180;
            const hw = (p.size || 50) / 2;
            const x1 = p.x - Math.cos(rad) * hw;
            const y1 = p.y - Math.sin(rad) * hw;
            const x2 = p.x + Math.cos(rad) * hw;
            const y2 = p.y + Math.sin(rad) * hw;
            checkSegmentIntersect(x1, y1, x2, y2, p, p.type);
          });
        }

        // Check Targets (Circle bounds)
        targets.forEach((tg) => {
          const dx = tg.x - ray.x;
          const dy = tg.y - ray.y;
          const distProj = dx * ray.dx + dy * ray.dy;
          if (distProj > 0) {
            const perpDistSq = dx * dx + dy * dy - distProj * distProj;
            const r = tg.radius || 25;
            if (perpDistSq <= r * r) {
              const hitT = distProj - Math.sqrt(Math.max(0, r * r - perpDistSq));
              if (hitT > 0.1 && hitT < minT) {
                minT = hitT;
                closestHit = {
                  t: hitT,
                  x: ray.x + ray.dx * hitT,
                  y: ray.y + ray.dy * hitT,
                  nx: 0,
                  ny: 0,
                  item: tg,
                  hitType: "target",
                };
              }
            }
          }
        });

        const endX = ray.x + ray.dx * minT;
        const endY = ray.y + ray.dy * minT;

        raysToDraw.push({
          x1: ray.x,
          y1: ray.y,
          x2: endX,
          y2: endY,
          color: ray.color,
          width: ray.width,
        });

        // Process hit bounce / teleportation / prism split
        if (closestHit && ray.bounce < maxBounces) {
          const { hitType, nx, ny, item, x: hX, y: hY } = closestHit;

          if (hitType === "mirror") {
            reflectionCount++;
            const dot = ray.dx * nx + ray.dy * ny;
            const rdx = ray.dx - 2 * dot * nx;
            const rdy = ray.dy - 2 * dot * ny;
            queue.push({
              x: hX,
              y: hY,
              dx: rdx,
              dy: rdy,
              color: ray.color,
              width: ray.width,
              bounce: ray.bounce + 1,
            });
          } else if (hitType === "prism") {
            reflectionCount++;
            if (ray.color === "#ffffff") {
              // Dispersion into RGB rainbow rays
              const baseAngle = Math.atan2(ray.dy, ray.dx);
              const spectrumColors = ["#ff2a6d", "#05ffa1", "#00f0ff"];
              const offsets = [-0.15, 0, 0.15];
              spectrumColors.forEach((sc, idx) => {
                const a = baseAngle + offsets[idx];
                queue.push({
                  x: hX,
                  y: hY,
                  dx: Math.cos(a),
                  dy: Math.sin(a),
                  color: sc,
                  width: 2.5,
                  bounce: ray.bounce + 1,
                });
              });
            } else {
              const dot = ray.dx * nx + ray.dy * ny;
              const rdx = ray.dx - 1.5 * dot * nx;
              const rdy = ray.dy - 1.5 * dot * ny;
              const len = Math.hypot(rdx, rdy) || 1;
              queue.push({
                x: hX,
                y: hY,
                dx: rdx / len,
                dy: rdy / len,
                color: ray.color,
                width: ray.width,
                bounce: ray.bounce + 1,
              });
            }
          } else if (hitType === "splitter") {
            reflectionCount++;
            // Pass-through ray
            queue.push({
              x: hX + ray.dx * 2,
              y: hY + ray.dy * 2,
              dx: ray.dx,
              dy: ray.dy,
              color: ray.color,
              width: Math.max(1.5, ray.width * 0.7),
              bounce: ray.bounce + 1,
            });
            // Reflected ray
            const dot = ray.dx * nx + ray.dy * ny;
            const rdx = ray.dx - 2 * dot * nx;
            const rdy = ray.dy - 2 * dot * ny;
            queue.push({
              x: hX,
              y: hY,
              dx: rdx,
              dy: rdy,
              color: ray.color,
              width: Math.max(1.5, ray.width * 0.7),
              bounce: ray.bounce + 1,
            });
          } else if (hitType === "portalA" && portalB) {
            const exitRad = (portalB.angle * Math.PI) / 180;
            const outDx = Math.cos(exitRad);
            const outDy = Math.sin(exitRad);
            queue.push({
              x: portalB.x + outDx * 15,
              y: portalB.y + outDy * 15,
              dx: outDx,
              dy: outDy,
              color: ray.color,
              width: ray.width,
              bounce: ray.bounce + 1,
            });
          } else if (hitType === "portalB" && portalA) {
            const exitRad = (portalA.angle * Math.PI) / 180;
            const outDx = Math.cos(exitRad);
            const outDy = Math.sin(exitRad);
            queue.push({
              x: portalA.x + outDx * 15,
              y: portalA.y + outDy * 15,
              dx: outDx,
              dy: outDy,
              color: ray.color,
              width: ray.width,
              bounce: ray.bounce + 1,
            });
          } else if (hitType === "target") {
            hitTargetMap[item.id] = true;
          }
        }
      }

      return { raysToDraw, rayCount, reflectionCount, hitTargetMap };
    };

    // Main Draw Function
    const render = () => {
      ctx.fillStyle = activeTheme.canvasBg;
      ctx.fillRect(0, 0, width, height);

      // Grid draw
      ctx.strokeStyle = activeTheme.gridColor;
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

      // Run optics sim
      const { raysToDraw, rayCount, reflectionCount, hitTargetMap } = simulateOptics();

      // Render Laser Beams
      raysToDraw.forEach((r) => {
        ctx.save();
        ctx.shadowColor = r.color;
        ctx.shadowBlur = 12 * fogDensity * beamIntensity;
        ctx.strokeStyle = r.color;
        ctx.lineWidth = r.width * beamIntensity;
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.moveTo(r.x1, r.y1);
        ctx.lineTo(r.x2, r.y2);
        ctx.stroke();

        // Inner core line
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = Math.max(1, (r.width / 3) * beamIntensity);
        ctx.globalAlpha = 1.0;
        ctx.beginPath();
        ctx.moveTo(r.x1, r.y1);
        ctx.lineTo(r.x2, r.y2);
        ctx.stroke();
        ctx.restore();
      });

      // Update targets power state
      const targets = items.filter((i) => i.type === "target");
      let chargedCount = 0;
      targets.forEach((tg) => {
        const isHit = hitTargetMap[tg.id];
        setTargetPowers((prev) => {
          const curr = prev[tg.id] || 0;
          const next = isHit ? Math.min(100, curr + 4) : Math.max(0, curr - 2);
          if (next >= 100) chargedCount++;
          return { ...prev, [tg.id]: next };
        });
      });

      setRayStats({
        activeRays: rayCount,
        reflections: reflectionCount,
        targetsCharged: chargedCount,
        totalTargets: targets.length,
      });

      // Render Scene Items
      items.forEach((item) => {
        const isSelected = item.id === selectedId;
        ctx.save();

        if (item.type === "laser") {
          ctx.translate(item.x, item.y);
          ctx.rotate((item.angle * Math.PI) / 180);

          // Emitter body
          ctx.fillStyle = "#1e293b";
          ctx.strokeStyle = isSelected ? "#38bdf8" : "#475569";
          ctx.lineWidth = isSelected ? 3 : 2;
          ctx.beginPath();
          ctx.roundRect(-25, -15, 50, 30, 8);
          ctx.fill();
          ctx.stroke();

          // Lens nozzle
          const wavelengthObj = LASER_SPECTRUM.find((s) => s.id === item.wavelength) || LASER_SPECTRUM[0];
          ctx.fillStyle = wavelengthObj.color;
          ctx.beginPath();
          ctx.arc(20, 0, 7, 0, Math.PI * 2);
          ctx.fill();
        } else if (item.type === "mirror") {
          ctx.translate(item.x, item.y);
          ctx.rotate((item.angle * Math.PI) / 180);

          const hw = (item.width || 70) / 2;
          // Reflective surface line
          ctx.shadowColor = "#38bdf8";
          ctx.shadowBlur = isSelected ? 15 : 6;
          ctx.strokeStyle = isSelected ? "#38bdf8" : "#e2e8f0";
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.moveTo(-hw, 0);
          ctx.lineTo(hw, 0);
          ctx.stroke();

          // Mirror backing frame
          ctx.shadowBlur = 0;
          ctx.strokeStyle = "#475569";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(-hw, 4);
          ctx.lineTo(hw, 4);
          ctx.stroke();
        } else if (item.type === "prism") {
          ctx.translate(item.x, item.y);
          ctx.rotate((item.angle * Math.PI) / 180);

          const size = item.size || 60;
          const p1 = { x: Math.cos(0) * size, y: Math.sin(0) * size };
          const p2 = { x: Math.cos((2 * Math.PI) / 3) * size, y: Math.sin((2 * Math.PI) / 3) * size };
          const p3 = { x: Math.cos((4 * Math.PI) / 3) * size, y: Math.sin((4 * Math.PI) / 3) * size };

          ctx.fillStyle = "rgba(186, 230, 253, 0.25)";
          ctx.strokeStyle = isSelected ? "#38bdf8" : "rgba(186, 230, 253, 0.8)";
          ctx.lineWidth = isSelected ? 3 : 2;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.lineTo(p3.x, p3.y);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        } else if (item.type === "splitter") {
          ctx.translate(item.x, item.y);
          ctx.rotate((item.angle * Math.PI) / 180);

          const s = (item.size || 50) / 2;
          ctx.fillStyle = "rgba(168, 85, 247, 0.2)";
          ctx.strokeStyle = isSelected ? "#c084fc" : "#a855f7";
          ctx.lineWidth = isSelected ? 3 : 2;
          ctx.beginPath();
          ctx.rect(-s, -s, s * 2, s * 2);
          ctx.fill();
          ctx.stroke();

          // Diagonal splitter line
          ctx.strokeStyle = "#e879f9";
          ctx.beginPath();
          ctx.moveTo(-s, -s);
          ctx.lineTo(s, s);
          ctx.stroke();
        } else if (item.type === "portalA" || item.type === "portalB") {
          ctx.translate(item.x, item.y);
          ctx.rotate((item.angle * Math.PI) / 180);

          const color = item.type === "portalA" ? "#f97316" : "#06b6d4";
          const hw = (item.size || 50) / 2;

          ctx.shadowColor = color;
          ctx.shadowBlur = 15;
          ctx.strokeStyle = color;
          ctx.lineWidth = isSelected ? 6 : 4;
          ctx.beginPath();
          ctx.ellipse(0, 0, hw, 10, 0, 0, Math.PI * 2);
          ctx.stroke();
        } else if (item.type === "wall") {
          ctx.translate(item.x, item.y);
          ctx.rotate((item.angle * Math.PI) / 180);

          const hw = (item.width || 120) / 2;
          ctx.fillStyle = "#334155";
          ctx.strokeStyle = isSelected ? "#94a3b8" : "#64748b";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.rect(-hw, -8, item.width, 16);
          ctx.fill();
          ctx.stroke();
        } else if (item.type === "target") {
          ctx.translate(item.x, item.y);
          const p = targetPowers[item.id] || 0;

          // Outer pulsing ring
          const r = item.radius || 25;
          ctx.shadowColor = p > 50 ? "#05ffa1" : "#f43f5e";
          ctx.shadowBlur = p > 50 ? 20 : 5;
          ctx.strokeStyle = p > 50 ? "#05ffa1" : isSelected ? "#38bdf8" : "#f43f5e";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.stroke();

          // Power filling core
          ctx.fillStyle = p > 50 ? "rgba(5, 255, 161, 0.3)" : "rgba(244, 63, 94, 0.2)";
          ctx.beginPath();
          ctx.arc(0, 0, (r * p) / 100, 0, Math.PI * 2);
          ctx.fill();

          // Target icon text
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 10px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(`${Math.round(p)}%`, 0, 0);
        }

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [items, selectedId, activeTheme, beamIntensity, fogDensity, targetPowers]);

  // Mouse Interactions for Dragging & Selection
  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    let clicked = null;
    for (let i = items.length - 1; i >= 0; i--) {
      const it = items[i];
      const dist = Math.hypot(it.x - mx, it.y - my);
      if (dist <= 35) {
        clicked = it;
        break;
      }
    }

    if (clicked) {
      setSelectedId(clicked.id);
      draggingIdRef.current = clicked.id;
      dragOffsetRef.current = { x: mx - clicked.x, y: my - clicked.y };
    } else {
      setSelectedId(null);
    }
  };

  const handleMouseMove = (e) => {
    if (!draggingIdRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const newX = Math.max(30, Math.min(canvas.width - 30, mx - dragOffsetRef.current.x));
    const newY = Math.max(30, Math.min(canvas.height - 30, my - dragOffsetRef.current.y));

    setItems((prev) =>
      prev.map((item) => (item.id === draggingIdRef.current ? { ...item, x: newX, y: newY } : item))
    );
  };

  const handleMouseUp = () => {
    draggingIdRef.current = null;
  };

  // Item modifications
  const rotateSelected = (deg) => {
    if (!selectedId) return;
    setItems((prev) =>
      prev.map((i) => (i.id === selectedId ? { ...i, angle: (i.angle + deg) % 360 } : i))
    );
    playOpticsSound("reflect");
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    setItems((prev) => prev.filter((i) => i.id !== selectedId));
    setSelectedId(null);
  };

  const addItem = (type) => {
    const id = `${type}_${Date.now()}`;
    const newItem = {
      id,
      type,
      x: 350,
      y: 250,
      angle: 0,
      ...(type === "laser" ? { wavelength: "cyan", power: 100 } : {}),
      ...(type === "mirror" ? { width: 70 } : {}),
      ...(type === "prism" ? { size: 60 } : {}),
      ...(type === "splitter" ? { size: 50 } : {}),
      ...(type === "wall" ? { width: 120 } : {}),
      ...(type === "target" ? { radius: 25, power: 0 } : {}),
    };
    setItems((prev) => [...prev, newItem]);
    setSelectedId(id);
  };

  const loadPreset = (preset) => {
    setPresetId(preset.id);
    setItems(preset.items);
    setSelectedId(null);
  };

  const selectedItem = items.find((i) => i.id === selectedId);

  return (
    <div className={`flex justify-center items-center min-h-[640px] p-4 md:p-6 bg-gradient-to-br ${activeTheme.bg} rounded-2xl m-4 md:m-6 shadow-2xl transition-all duration-500`}>
      <div className="bg-slate-900/90 backdrop-blur-xl p-6 md:p-8 rounded-3xl max-w-6xl w-full shadow-2xl border border-white/10 text-white">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${activeTheme.badge}`}>
                Physics Lab
              </span>
              <span className="text-xs text-slate-400 font-medium">Interactive Optics & Wave Simulator</span>
            </div>
            <h2 className={`text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r ${activeTheme.accentGradient}`}>
              Quantum Laser Optics Lab
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Reflect rays, split white light into prismatic spectrums, and route spatial portals.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                soundEnabled
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/40"
                  : "bg-slate-800 text-slate-400 border-slate-700"
              }`}
            >
              {soundEnabled ? "🔊 SFX Enabled" : "🔇 SFX Muted"}
            </button>

            {/* Themes */}
            <select
              value={themeKey}
              onChange={(e) => setThemeKey(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-cyan-400"
            >
              {Object.values(THEMES).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            <button
              onClick={() => setItems([])}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold transition-all active:scale-95"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Presets Bar */}
        <div className="flex flex-wrap gap-2 mb-6 p-1.5 bg-slate-950/60 rounded-2xl border border-white/5">
          {PRESET_LABS.map((p) => (
            <button
              key={p.id}
              onClick={() => loadPreset(p)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                presetId === p.id
                  ? "bg-slate-800 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* Interactive Canvas Area */}
          <div className="lg:col-span-8 flex flex-col items-center">
            <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-inner">
              <canvas
                ref={canvasRef}
                width={740}
                height={500}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                className="w-full h-auto cursor-crosshair touch-none"
              />

              {/* Stats overlay badge */}
              <div className="absolute top-3 left-3 flex flex-wrap gap-2 pointer-events-none">
                <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-[11px] font-mono text-cyan-300">
                  Rays: <span className="font-bold">{rayStats.activeRays}</span>
                </div>
                <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-[11px] font-mono text-purple-300">
                  Reflections: <span className="font-bold">{rayStats.reflections}</span>
                </div>
                <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-[11px] font-mono text-emerald-300">
                  Targets: <span className="font-bold">{rayStats.targetsCharged} / {rayStats.totalTargets}</span>
                </div>
              </div>
            </div>

            {/* Toolbar for Adding Elements */}
            <div className="flex flex-wrap gap-2 justify-center mt-4 w-full">
              <button
                onClick={() => addItem("laser")}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200"
              >
                + Laser Emitter
              </button>
              <button
                onClick={() => addItem("mirror")}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200"
              >
                + Flat Mirror
              </button>
              <button
                onClick={() => addItem("prism")}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200"
              >
                + Crystal Prism
              </button>
              <button
                onClick={() => addItem("splitter")}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200"
              >
                + Beam Splitter
              </button>
              <button
                onClick={() => addItem("target")}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200"
              >
                + Energy Target
              </button>
              <button
                onClick={() => addItem("wall")}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200"
              >
                + Block Wall
              </button>
            </div>
          </div>

          {/* Control Panel Sidebar */}
          <div className="lg:col-span-4 bg-slate-950/70 p-5 rounded-2xl border border-white/10 flex flex-col gap-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-white/10">
              Element Inspector
            </h3>

            {selectedItem ? (
              <div className="flex flex-col gap-4 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold capitalize text-cyan-300 text-sm">{selectedItem.type}</span>
                  <span className="text-slate-500 font-mono text-[10px]">{selectedItem.id}</span>
                </div>

                {/* Angle Controller */}
                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Angle / Orientation</span>
                    <span className="font-mono text-cyan-300">{Math.round(selectedItem.angle)}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={selectedItem.angle}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((i) => (i.id === selectedId ? { ...i, angle: Number(e.target.value) } : i))
                      )
                    }
                    className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => rotateSelected(-15)}
                      className="flex-1 py-1 rounded bg-slate-800 hover:bg-slate-700 font-bold"
                    >
                      ↺ -15°
                    </button>
                    <button
                      onClick={() => rotateSelected(15)}
                      className="flex-1 py-1 rounded bg-slate-800 hover:bg-slate-700 font-bold"
                    >
                      ↻ +15°
                    </button>
                  </div>
                </div>

                {/* Laser Wavelength Selector */}
                {selectedItem.type === "laser" && (
                  <div>
                    <span className="text-slate-400 mb-1 block">Wavelength Spectrum</span>
                    <select
                      value={selectedItem.wavelength || "cyan"}
                      onChange={(e) =>
                        setItems((prev) =>
                          prev.map((i) => (i.id === selectedId ? { ...i, wavelength: e.target.value } : i))
                        )
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 outline-none"
                    >
                      {LASER_SPECTRUM.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  onClick={deleteSelected}
                  className="mt-2 w-full py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-xl font-bold transition-all"
                >
                  Delete Selected Item
                </button>
              </div>
            ) : (
              <p className="text-slate-500 text-xs italic py-6 text-center">
                Click any optical element on the canvas to inspect and rotate.
              </p>
            )}

            {/* Environmental Settings */}
            <div className="pt-4 border-t border-white/10 flex flex-col gap-3 text-xs">
              <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">Optical Parameters</h4>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Beam Brightness</span>
                  <span className="font-mono text-cyan-300">{beamIntensity.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.1"
                  value={beamIntensity}
                  onChange={(e) => setBeamIntensity(Number(e.target.value))}
                  className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Volumetric Fog</span>
                  <span className="font-mono text-cyan-300">{Math.round(fogDensity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.5"
                  step="0.1"
                  value={fogDensity}
                  onChange={(e) => setFogDensity(Number(e.target.value))}
                  className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaserOpticsLab;
