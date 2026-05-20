import React, { useState, useEffect, useRef } from "react";

const W = 120; // Grid Width
const H = 80;  // Grid Height

const ELEMENTS = {
  sand: { code: 1, name: "Sand", emoji: "💛", color: "bg-amber-400 border-amber-500 text-amber-900", desc: "Falls and piles up" },
  water: { code: 2, name: "Water", emoji: "💙", color: "bg-blue-400 border-blue-500 text-blue-900", desc: "Flows, floats oil, puts out fire" },
  stone: { code: 3, name: "Stone", emoji: "🧱", color: "bg-slate-500 border-slate-600 text-slate-100", desc: "Indestructible solid wall" },
  plant: { code: 5, name: "Plant", emoji: "🌿", color: "bg-emerald-500 border-emerald-600 text-emerald-950", desc: "Grows organically when watered" },
  oil: { code: 6, name: "Oil", emoji: "🛢️", color: "bg-indigo-900 border-indigo-950 text-indigo-200", desc: "Flows, floats on water, highly flammable" },
  fire: { code: 4, name: "Fire", emoji: "🔥", color: "bg-orange-500 border-orange-600 text-orange-950", desc: "Rises, ignites oil & plant, dies out" },
  gunpowder: { code: 8, name: "Gunpowder", emoji: "💣", color: "bg-neutral-500 border-neutral-600 text-neutral-200", desc: "Heavy sand, explodes upon fire contact!" },
  acid: { code: 7, name: "Acid", emoji: "🤢", color: "bg-lime-400 border-lime-500 text-lime-900", desc: "Flows, corrodes everything except stone" },
  eraser: { code: 0, name: "Eraser", emoji: "🧹", color: "bg-rose-100 border-rose-300 text-rose-700", desc: "Clears painted pixels" },
};

const PixelPhysicsSandbox = () => {
  const [activeElement, setActiveElement] = useState("sand");
  const [brushSize, setBrushSize] = useState(2);
  const [isPlaying, setIsPlaying] = useState(true);
  const [elementRain, setElementRain] = useState(false);
  const [simSpeed, setSimSpeed] = useState(1); // steps per tick
  const [fps, setFps] = useState(60);

  const canvasRef = useRef(null);
  const gridRef = useRef(new Uint8Array(W * H));
  const shadesRef = useRef(new Uint8Array(W * H));
  const requestRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const leftToRightRef = useRef(true);
  const fpsIntervalRef = useRef(null);

  // Initialize a default preset on mount
  useEffect(() => {
    loadPreset("greenhouse");
    // Setup animation frame loop
    let lastTime = performance.now();
    let frames = 0;

    const loop = (time) => {
      // Calculate FPS
      frames++;
      if (time > lastTime + 1000) {
        setFps(Math.round((frames * 1000) / (time - lastTime)));
        frames = 0;
        lastTime = time;
      }

      if (isPlaying) {
        // Run multiple steps if simulation speed is higher
        for (let step = 0; step < simSpeed; step++) {
          updatePhysics();
        }
      }

      // Handle element rain
      if (elementRain && isPlaying) {
        const activeCode = ELEMENTS[activeElement].code;
        if (activeCode !== 0) {
          for (let k = 0; k < 2; k++) {
            const rx = Math.floor(Math.random() * W);
            if (gridRef.current[rx] === 0) {
              gridRef.current[rx] = activeCode;
              shadesRef.current[rx] = Math.floor(Math.random() * 50);
            }
          }
        }
      }

      drawCanvas();
      requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isPlaying, simSpeed, elementRain, activeElement]);

  // Color getter for pixel rendering
  const getColor = (code, shade) => {
    switch (code) {
      case 0: // EMPTY (Dark canvas background)
        return [22, 28, 45]; // deep slate/navy rgb(22, 28, 45)
      case 1: // SAND
        return [234 - shade, 179 - shade / 2, 8]; // Amber/gold
      case 2: // WATER
        return [30 + shade / 3, 110 + shade / 2, 235 - shade / 3]; // Oceanic blue
      case 3: // STONE
        return [100 - shade / 2, 116 - shade / 2, 139 - shade / 2]; // Cool gray stone
      case 4: // FIRE (Flickering red/orange/yellow)
        const f = Math.random();
        if (f < 0.3) return [239, 68, 68]; // red
        if (f < 0.7) return [249, 115, 22]; // orange
        return [234, 179, 8]; // yellow
      case 5: // PLANT
        return [16 + shade / 3, 185 - shade / 2, 129 - shade / 3]; // Leaf green
      case 6: // OIL
        return [40 + shade / 4, 30 + shade / 4, 60 + shade / 4]; // Dark purple-charcoal
      case 7: // ACID
        return [163 - shade / 3, 230 - shade / 3, 53 + shade / 2]; // Bright neon green
      case 8: // GUNPOWDER
        return [115 - shade / 3, 115 - shade / 3, 115 - shade / 3]; // Speckled charcoal gray
      default:
        return [0, 0, 0];
    }
  };

  // Canvas drawing using ImageData for peak performance
  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const grid = gridRef.current;
    const shades = shadesRef.current;
    const imgData = ctx.createImageData(W, H);
    const data = imgData.data;

    for (let i = 0; i < W * H; i++) {
      const code = grid[i];
      const shade = shades[i];
      const [r, g, b] = getColor(code, shade);
      const pixelIdx = i * 4;
      data[pixelIdx] = r;
      data[pixelIdx + 1] = g;
      data[pixelIdx + 2] = b;
      data[pixelIdx + 3] = 255; // Alpha fully opaque
    }

    ctx.putImageData(imgData, 0, 0);
  };

  // Sand physics engine step
  const updatePhysics = () => {
    const grid = gridRef.current;
    const shades = shadesRef.current;
    const updated = new Uint8Array(W * H);

    // Alternate left-to-right scanning each frame to prevent directional bias
    leftToRightRef.current = !leftToRightRef.current;

    for (let y = H - 1; y >= 0; y--) {
      for (let xOffset = 0; xOffset < W; xOffset++) {
        const x = leftToRightRef.current ? xOffset : W - 1 - xOffset;
        const idx = y * W + x;
        const code = grid[idx];

        if (code === 0 || updated[idx]) continue;

        const belowIdx = (y + 1) * W + x;
        const aboveIdx = (y - 1) * W + x;

        // --- SAND physics ---
        if (code === 1) {
          if (y < H - 1) {
            if (grid[belowIdx] === 0) {
              grid[belowIdx] = 1;
              grid[idx] = 0;
              updated[belowIdx] = 1;
              shades[belowIdx] = shades[idx];
            } else {
              const side = Math.random() > 0.5 ? 1 : -1;
              const diagIdx = (y + 1) * W + (x + side);
              const otherDiagIdx = (y + 1) * W + (x - side);

              if (x + side >= 0 && x + side < W && grid[diagIdx] === 0) {
                grid[diagIdx] = 1;
                grid[idx] = 0;
                updated[diagIdx] = 1;
                shades[diagIdx] = shades[idx];
              } else if (x - side >= 0 && x - side < W && grid[otherDiagIdx] === 0) {
                grid[otherDiagIdx] = 1;
                grid[idx] = 0;
                updated[otherDiagIdx] = 1;
                shades[otherDiagIdx] = shades[idx];
              } else if (grid[belowIdx] === 2 || grid[belowIdx] === 6 || grid[belowIdx] === 7) {
                // Sinks in water, oil, and acid
                const liquid = grid[belowIdx];
                grid[belowIdx] = 1;
                grid[idx] = liquid;
                updated[belowIdx] = 1;
                const tempShade = shades[belowIdx];
                shades[belowIdx] = shades[idx];
                shades[idx] = tempShade;
              }
            }
          }
        }

        // --- WATER physics ---
        else if (code === 2) {
          if (y < H - 1 && grid[belowIdx] === 0) {
            grid[belowIdx] = 2;
            grid[idx] = 0;
            updated[belowIdx] = 1;
            shades[belowIdx] = shades[idx];
          } else {
            const side = Math.random() > 0.5 ? 1 : -1;
            const diagIdx = (y + 1) * W + (x + side);
            const otherDiagIdx = (y + 1) * W + (x - side);

            if (y < H - 1 && x + side >= 0 && x + side < W && grid[diagIdx] === 0) {
              grid[diagIdx] = 2;
              grid[idx] = 0;
              updated[diagIdx] = 1;
              shades[diagIdx] = shades[idx];
            } else if (y < H - 1 && x - side >= 0 && x - side < W && grid[otherDiagIdx] === 0) {
              grid[otherDiagIdx] = 2;
              grid[idx] = 0;
              updated[otherDiagIdx] = 1;
              shades[otherDiagIdx] = shades[idx];
            } else {
              // Flow horizontally
              const horizIdx = y * W + (x + side);
              const otherHorizIdx = y * W + (x - side);

              if (x + side >= 0 && x + side < W && grid[horizIdx] === 0) {
                grid[horizIdx] = 2;
                grid[idx] = 0;
                updated[horizIdx] = 1;
                shades[horizIdx] = shades[idx];
              } else if (x - side >= 0 && x - side < W && grid[otherHorizIdx] === 0) {
                grid[otherHorizIdx] = 2;
                grid[idx] = 0;
                updated[otherHorizIdx] = 1;
                shades[otherHorizIdx] = shades[idx];
              } else if (y < H - 1 && grid[belowIdx] === 6) {
                // Water sinks below oil
                grid[belowIdx] = 2;
                grid[idx] = 6;
                updated[belowIdx] = 1;
                const tempShade = shades[belowIdx];
                shades[belowIdx] = shades[idx];
                shades[idx] = tempShade;
              }
            }
          }
        }

        // --- OIL physics ---
        else if (code === 6) {
          if (y < H - 1 && grid[belowIdx] === 0) {
            grid[belowIdx] = 6;
            grid[idx] = 0;
            updated[belowIdx] = 1;
            shades[belowIdx] = shades[idx];
          } else {
            const side = Math.random() > 0.5 ? 1 : -1;
            const diagIdx = (y + 1) * W + (x + side);
            const otherDiagIdx = (y + 1) * W + (x - side);

            if (y < H - 1 && x + side >= 0 && x + side < W && grid[diagIdx] === 0) {
              grid[diagIdx] = 6;
              grid[idx] = 0;
              updated[diagIdx] = 1;
              shades[diagIdx] = shades[idx];
            } else if (y < H - 1 && x - side >= 0 && x - side < W && grid[otherDiagIdx] === 0) {
              grid[otherDiagIdx] = 6;
              grid[idx] = 0;
              updated[otherDiagIdx] = 1;
              shades[otherDiagIdx] = shades[idx];
            } else {
              const horizIdx = y * W + (x + side);
              const otherHorizIdx = y * W + (x - side);

              if (x + side >= 0 && x + side < W && grid[horizIdx] === 0) {
                grid[horizIdx] = 6;
                grid[idx] = 0;
                updated[horizIdx] = 1;
                shades[horizIdx] = shades[idx];
              } else if (x - side >= 0 && x - side < W && grid[otherHorizIdx] === 0) {
                grid[otherHorizIdx] = 6;
                grid[idx] = 0;
                updated[otherHorizIdx] = 1;
                shades[otherHorizIdx] = shades[idx];
              }
            }
          }
        }

        // --- GUNPOWDER physics ---
        else if (code === 8) {
          if (y < H - 1) {
            if (grid[belowIdx] === 0) {
              grid[belowIdx] = 8;
              grid[idx] = 0;
              updated[belowIdx] = 1;
              shades[belowIdx] = shades[idx];
            } else {
              const side = Math.random() > 0.5 ? 1 : -1;
              const diagIdx = (y + 1) * W + (x + side);
              const otherDiagIdx = (y + 1) * W + (x - side);

              if (x + side >= 0 && x + side < W && grid[diagIdx] === 0) {
                grid[diagIdx] = 8;
                grid[idx] = 0;
                updated[diagIdx] = 1;
                shades[diagIdx] = shades[idx];
              } else if (x - side >= 0 && x - side < W && grid[otherDiagIdx] === 0) {
                grid[otherDiagIdx] = 8;
                grid[idx] = 0;
                updated[otherDiagIdx] = 1;
                shades[otherDiagIdx] = shades[idx];
              } else if (grid[belowIdx] === 2 || grid[belowIdx] === 6 || grid[belowIdx] === 7) {
                // Sinks in water, oil, acid
                const liquid = grid[belowIdx];
                grid[belowIdx] = 8;
                grid[idx] = liquid;
                updated[belowIdx] = 1;
                const tempShade = shades[belowIdx];
                shades[belowIdx] = shades[idx];
                shades[idx] = tempShade;
              }
            }
          }
        }

        // --- ACID physics ---
        else if (code === 7) {
          let eaten = false;

          const corrode = (nIdx) => {
            const val = grid[nIdx];
            if (val !== 0 && val !== 3 && val !== 7) {
              grid[nIdx] = 0;
              eaten = true;
            }
          };

          if (y < H - 1) corrode(belowIdx);
          if (y > 0) corrode(aboveIdx);
          if (x > 0) corrode(y * W + (x - 1));
          if (x < W - 1) corrode(y * W + (x + 1));

          if (eaten) {
            // Acid gets consumed when eating things (80% chance)
            if (Math.random() < 0.8) {
              grid[idx] = 0;
              continue;
            }
          }

          // Flow mechanics
          if (y < H - 1 && grid[belowIdx] === 0) {
            grid[belowIdx] = 7;
            grid[idx] = 0;
            updated[belowIdx] = 1;
            shades[belowIdx] = shades[idx];
          } else {
            const side = Math.random() > 0.5 ? 1 : -1;
            const diagIdx = (y + 1) * W + (x + side);
            const otherDiagIdx = (y + 1) * W + (x - side);

            if (y < H - 1 && x + side >= 0 && x + side < W && grid[diagIdx] === 0) {
              grid[diagIdx] = 7;
              grid[idx] = 0;
              updated[diagIdx] = 1;
              shades[diagIdx] = shades[idx];
            } else if (y < H - 1 && x - side >= 0 && x - side < W && grid[otherDiagIdx] === 0) {
              grid[otherDiagIdx] = 7;
              grid[idx] = 0;
              updated[otherDiagIdx] = 1;
              shades[otherDiagIdx] = shades[idx];
            } else {
              const horizIdx = y * W + (x + side);
              const otherHorizIdx = y * W + (x - side);

              if (x + side >= 0 && x + side < W && grid[horizIdx] === 0) {
                grid[horizIdx] = 7;
                grid[idx] = 0;
                updated[horizIdx] = 1;
                shades[horizIdx] = shades[idx];
              } else if (x - side >= 0 && x - side < W && grid[otherHorizIdx] === 0) {
                grid[otherHorizIdx] = 7;
                grid[idx] = 0;
                updated[otherHorizIdx] = 1;
                shades[otherHorizIdx] = shades[idx];
              }
            }
          }
        }

        // --- FIRE physics ---
        else if (code === 4) {
          // Fire dies out randomly (18% chance)
          if (Math.random() < 0.18) {
            grid[idx] = 0;
            continue;
          }

          let ignited = false;

          const ignite = (nIdx) => {
            const val = grid[nIdx];
            if (val === 5 || val === 6) { // Wood/Plant or Oil
              grid[nIdx] = 4;
              updated[nIdx] = 1;
              shades[nIdx] = Math.floor(Math.random() * 50);
              ignited = true;
            } else if (val === 8) { // Gunpowder: EXPLODE!
              grid[nIdx] = 4;
              updated[nIdx] = 1;
              ignited = true;

              // Spherical explosion radius of 3 cells
              const targetX = nIdx % W;
              const targetY = Math.floor(nIdx / W);
              const r = 3;

              for (let ey = -r; ey <= r; ey++) {
                for (let ex = -r; ex <= r; ex++) {
                  if (ex * ex + ey * ey <= r * r) {
                    const px = targetX + ex;
                    const py = targetY + ey;
                    if (px >= 0 && px < W && py >= 0 && py < H) {
                      const explosionIdx = py * W + px;
                      const currentVal = grid[explosionIdx];
                      // Explode anything non-stone
                      if (currentVal !== 3 && currentVal !== 4) {
                        grid[explosionIdx] = 4;
                        updated[explosionIdx] = 1;
                        shades[explosionIdx] = Math.floor(Math.random() * 50);
                      }
                    }
                  }
                }
              }
            } else if (val === 2) { // Water extinguishes fire
              grid[idx] = 0;
              ignited = true;
            }
          };

          if (y < H - 1) ignite(belowIdx);
          if (y > 0) ignite(aboveIdx);
          if (x > 0) ignite(y * W + (x - 1));
          if (x < W - 1) ignite(y * W + (x + 1));

          if (ignited && grid[idx] === 0) continue;

          // Float upwards randomly
          if (y > 0) {
            const side = Math.random() > 0.5 ? 1 : -1;
            const upIdx = (y - 1) * W + x;
            const upDiagIdx = (y - 1) * W + (x + side);

            if (grid[upIdx] === 0 && Math.random() < 0.6) {
              grid[upIdx] = 4;
              grid[idx] = 0;
              updated[upIdx] = 1;
            } else if (x + side >= 0 && x + side < W && grid[upDiagIdx] === 0 && Math.random() < 0.3) {
              grid[upDiagIdx] = 4;
              grid[idx] = 0;
              updated[upDiagIdx] = 1;
            }
          }
        }

        // --- PLANT physics ---
        else if (code === 5) {
          // Grows slowly when touching water
          let adjacentWater = false;
          let waterNeighborIdx = -1;

          const checkWater = (nIdx) => {
            if (grid[nIdx] === 2) {
              adjacentWater = true;
              waterNeighborIdx = nIdx;
            }
          };

          if (y < H - 1) checkWater(belowIdx);
          if (y > 0) checkWater(aboveIdx);
          if (x > 0) checkWater(y * W + (x - 1));
          if (x < W - 1) checkWater(y * W + (x + 1));

          if (adjacentWater) {
            // Growth rate 4% per frame
            if (Math.random() < 0.04) {
              const options = [];
              const addOption = (px, py) => {
                if (px >= 0 && px < W && py >= 0 && py < H) {
                  const oIdx = py * W + px;
                  if (grid[oIdx] === 0) options.push(oIdx);
                }
              };

              addOption(x, y - 1);
              addOption(x - 1, y);
              addOption(x + 1, y);
              addOption(x, y + 1);
              addOption(x - 1, y - 1);
              addOption(x + 1, y - 1);

              if (options.length > 0) {
                const targetIdx = options[Math.floor(Math.random() * options.length)];
                grid[targetIdx] = 5;
                updated[targetIdx] = 1;
                shades[targetIdx] = Math.floor(Math.random() * 50);

                // Water consumption chance (12%)
                if (Math.random() < 0.12 && waterNeighborIdx !== -1) {
                  grid[waterNeighborIdx] = 0;
                }
              }
            }
          }
        }
      }
    }
  };

  // Draw element pixels onto the grid based on mouse position
  const drawBrush = (cx, cy) => {
    const grid = gridRef.current;
    const shades = shadesRef.current;
    const r = brushSize;
    const activeCode = ELEMENTS[activeElement].code;

    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (dx * dx + dy * dy <= r * r) {
          const px = cx + dx;
          const py = cy + dy;
          if (px >= 0 && px < W && py >= 0 && py < H) {
            const idx = py * W + px;

            if (activeCode === 0) {
              // Eraser
              grid[idx] = 0;
              shades[idx] = 0;
            } else {
              // Do not overwrite stone unless using eraser/stone
              if (grid[idx] !== 3 || activeCode === 3) {
                grid[idx] = activeCode;
                shades[idx] = Math.floor(Math.random() * 50);
              }
            }
          }
        }
      }
    }
    drawCanvas();
  };

  // Continuous brush drawing between mouse movements
  const drawLine = (x0, y0, x1, y1) => {
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    let cx = x0;
    let cy = y0;

    while (true) {
      drawBrush(cx, cy);
      if (cx === x1 && cy === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        cx += sx;
      }
      if (e2 < dx) {
        err += dx;
        cy += sy;
      }
    }
  };

  // Mouse event handlers mapping screen client offsets to canvas scale
  const getMouseCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;

    // Support touch and mouse
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const x = Math.floor((clientX - rect.left) * scaleX);
    const y = Math.floor((clientY - rect.top) * scaleY);

    return { x, y };
  };

  const handleStartDraw = (e) => {
    e.preventDefault();
    const coords = getMouseCoords(e);
    if (!coords) return;

    isDrawingRef.current = true;
    lastMousePosRef.current = coords;
    drawBrush(coords.x, coords.y);
  };

  const handleMoveDraw = (e) => {
    if (!isDrawingRef.current) return;
    const coords = getMouseCoords(e);
    if (!coords) return;

    drawLine(lastMousePosRef.current.x, lastMousePosRef.current.y, coords.x, coords.y);
    lastMousePosRef.current = coords;
  };

  const handleStopDraw = () => {
    isDrawingRef.current = false;
  };

  // Clear Canvas entirely
  const handleClear = () => {
    gridRef.current.fill(0);
    shadesRef.current.fill(0);
    drawCanvas();
  };

  // High quality pre-configured sandbox presets
  const loadPreset = (name) => {
    const grid = gridRef.current;
    const shades = shadesRef.current;
    grid.fill(0);
    shades.fill(0);

    if (name === "greenhouse") {
      // Draw bottom floor
      for (let x = 0; x < W; x++) {
        grid[(H - 1) * W + x] = 3;
      }

      // Draw standard terraced layouts
      for (let x = 0; x < W; x++) {
        if (x > 15 && x < 45 && Math.abs(x - 30) > 4) {
          grid[52 * W + x] = 3; // Stone shelf
          grid[51 * W + x] = 5; // Plant seeds
        }
        if (x > 75 && x < 105 && Math.abs(x - 90) > 4) {
          grid[52 * W + x] = 3; // Stone shelf
          grid[51 * W + x] = 5; // Plant seeds
        }
        if (x > 35 && x < 85) {
          grid[68 * W + x] = 3; // Main bottom shelf
          grid[67 * W + x] = 5; // Plants
        }
      }

      // Draw upper Water Tank structure
      for (let y = 12; y <= 24; y++) {
        for (let x = 32; x <= 88; x++) {
          if (y === 24 || x === 32 || x === 88) {
            grid[y * W + x] = 3; // Outer casing
          } else {
            grid[y * W + x] = 2; // Water reservoir
          }
        }
      }

      // Install breakable Gunpowder valve plug inside the bottom wall of the tank
      for (let x = 58; x <= 62; x++) {
        grid[24 * W + x] = 8; // Gunpowder plug! Users can trigger with fire, or erase to flood
      }

      // Spawn a torch (Fire pixels nestled safely on stone) next to it
      grid[30 * W + 20] = 3;
      grid[30 * W + 21] = 3;
      grid[29 * W + 20] = 4;
      grid[29 * W + 21] = 4;
    }

    else if (name === "bomb") {
      // Ground plane
      for (let x = 0; x < W; x++) {
        grid[(H - 3) * W + x] = 3;
      }

      // Spherical bomb container
      const cx = Math.floor(W / 2);
      const cy = Math.floor(H / 2) + 8;
      const r = 16;

      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          const dist = dx * dx + dy * dy;
          const px = cx + dx;
          const py = cy + dy;

          if (px >= 0 && px < W && py >= 0 && py < H) {
            if (dist > (r - 2) * (r - 2) && dist <= r * r) {
              grid[py * W + px] = 3; // Wall structure
            } else if (dist <= (r - 2) * (r - 2)) {
              if (Math.random() < 0.2) {
                grid[py * W + px] = 6; // highly explosive oil pockets
              } else {
                grid[py * W + px] = 8; // gunpowder core
              }
            }
          }
        }
      }

      // Beautiful zig-zag organic plant fuse
      const fuseStartY = cy - r;
      for (let x = cx; x < cx + 42; x++) {
        const offset = Math.floor(Math.sin((x - cx) * 0.35) * 3);
        grid[(fuseStartY + offset) * W + x] = 5; // Plant acting as fuse
      }

      // Light the fuse! (Place fire at very end)
      const endOffset = Math.floor(Math.sin(41 * 0.35) * 3);
      grid[(fuseStartY + endOffset) * W + (cx + 41)] = 4;
    }

    else if (name === "volcano") {
      // Create diagonal volcano walls
      for (let y = 30; y < H - 2; y++) {
        const span = Math.floor((y - 30) * 1.1);
        const leftWall = 60 - span;
        const rightWall = 60 + span;

        if (leftWall > 15) grid[y * W + leftWall] = 3;
        if (rightWall < 105) grid[y * W + rightWall] = 3;

        // Populate inner caldera with gunpowder & oil
        if (y > 35) {
          for (let x = leftWall + 1; x < rightWall; x++) {
            if (y > H - 10) {
              grid[y * W + x] = 8; // heavy gunpowder base
            } else if (Math.random() < 0.4) {
              grid[y * W + x] = 6; // pools of volcanic oil
            }
          }
        }
      }

      // Spawn rain clouds (Stone blocks at top spawning oil)
      for (let x = 20; x < W; x += 30) {
        for (let dx = -4; dx <= 4; dx++) {
          grid[10 * W + (x + dx)] = 3;
        }
        grid[11 * W + x] = 4; // sparks hovering over volcano
      }
    }

    // Set shading textures
    for (let i = 0; i < W * H; i++) {
      if (grid[i] !== 0) shades[i] = Math.floor(Math.random() * 50);
    }

    drawCanvas();
  };

  return (
    <div className="flex justify-center items-center min-h-[600px] p-5 bg-gradient-to-br from-amber-600 via-orange-600 to-emerald-700 rounded-2xl m-5 shadow-2xl">
      <div className="bg-white/95 backdrop-blur-md p-8 rounded-3xl max-w-5xl w-full shadow-2xl border border-white/20">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-600 mb-2">
            Pixel Physics Sandbox
          </h2>
          <p className="text-gray-500 font-medium max-w-xl mx-auto text-sm">
            Draw organic, fluid, and reactive pixel elements in real-time. Watch them fall, flow, ignite, grow, explode, and dissolve!
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Simulation Viewport */}
          <div className="lg:col-span-8 flex flex-col items-center">
            
            {/* Canvas Container */}
            <div className="relative w-full overflow-hidden rounded-2xl bg-slate-900 border-4 border-slate-950 shadow-2xl">
              
              <canvas
                ref={canvasRef}
                width={W}
                height={H}
                className="w-full h-[400px] cursor-crosshair select-none block"
                style={{ imageRendering: "pixelated" }}
                onMouseDown={handleStartDraw}
                onMouseMove={handleMoveDraw}
                onMouseUp={handleStopDraw}
                onMouseLeave={handleStopDraw}
                onTouchStart={handleStartDraw}
                onTouchMove={handleMoveDraw}
                onTouchEnd={handleStopDraw}
              />

              {/* Simulation Status Badge Overlay */}
              <div className="absolute top-3 right-3 flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-white border border-white/10 select-none">
                <span className={`w-2.5 h-2.5 rounded-full ${isPlaying ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                {isPlaying ? "SIMULATING" : "PAUSED"} • {fps} FPS
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="flex flex-wrap items-center justify-between w-full mt-4 gap-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 duration-300 ${
                    isPlaying
                      ? "bg-slate-800 text-white hover:bg-slate-700"
                      : "bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-emerald-200"
                  }`}
                >
                  {isPlaying ? "⏸️ Pause" : "▶️ Play"}
                </button>

                <button
                  onClick={handleClear}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all active:scale-95 duration-300 border border-slate-200"
                >
                  🧹 Clear Canvas
                </button>
              </div>

              <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 shadow-inner">
                <label className="flex items-center gap-2 font-bold text-xs text-slate-500 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={elementRain}
                    onChange={(e) => setElementRain(e.target.checked)}
                    className="accent-emerald-600 w-4 h-4 rounded cursor-pointer"
                  />
                  ⛈️ Active Element Rain
                </label>
              </div>
            </div>
          </div>

          {/* Control & Elements Palette Panel */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Presets Selection */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">
                Select Interactive Scenario
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "greenhouse", label: "🌿 Green", emoji: "🌱" },
                  { id: "bomb", label: "💣 Fuse", emoji: "🧨" },
                  { id: "volcano", label: "🌋 Vent", emoji: "🔥" },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => loadPreset(p.id)}
                    className="flex flex-col items-center justify-center py-2.5 px-2 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl transition-all shadow-sm active:scale-95 duration-300"
                  >
                    <span className="text-xl mb-1">{p.emoji}</span>
                    <span className="text-[10px] font-black text-slate-600 leading-none">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Elements Selector */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">
                Element Brush Palette
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(ELEMENTS).map(([key, el]) => {
                  const isActive = activeElement === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveElement(key)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border-2 font-bold text-xs transition-all active:scale-95 duration-300 ${
                        isActive
                          ? `${el.color} shadow-md scale-[1.02]`
                          : "bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100 hover:border-slate-200"
                      }`}
                    >
                      <span className="text-base leading-none">{el.emoji}</span>
                      <span className="truncate">{el.name}</span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-3.5 p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] font-medium text-slate-500 italic">
                {ELEMENTS[activeElement].desc}
              </div>
            </div>

            {/* Settings & Sliders */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
                Brush & Engine Configurations
              </h3>

              {/* Brush Size */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span>Brush Size</span>
                  <span className="bg-slate-200 px-2 py-0.5 rounded text-[10px] font-mono">
                    {brushSize * 2 + 1} px
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="4"
                  value={brushSize}
                  onChange={(e) => setBrushSize(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
              </div>

              {/* Engine Speed */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span>Simulation Speed</span>
                  <span className="bg-slate-200 px-2 py-0.5 rounded text-[10px] font-mono">
                    {simSpeed}x steps
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="4"
                  value={simSpeed}
                  onChange={(e) => setSimSpeed(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Dynamic chemistry recipe chart */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 text-center">
            Interactive Element Chemistry Reactions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-xs text-slate-500 font-semibold">
            <div className="bg-orange-50/50 p-3 rounded-xl border border-orange-100">
              <span className="block text-orange-600 mb-0.5">🔥 Combustion</span>
              Fire ignites <span className="text-slate-700">Wood, Oil, & Gunpowder</span>.
            </div>
            <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100">
              <span className="block text-blue-600 mb-0.5">💦 Extinguisher</span>
              Water puts out <span className="text-slate-700">Fire</span> instantly.
            </div>
            <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
              <span className="block text-emerald-600 mb-0.5">🌿 Photosynthesis</span>
              Plants absorb <span className="text-slate-700">Water</span> to grow branches.
            </div>
            <div className="bg-lime-50/50 p-3 rounded-xl border border-lime-100">
              <span className="block text-lime-600 mb-0.5">🤢 Corrosion</span>
              Acid eats <span className="text-slate-700">everything</span> except stone!
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PixelPhysicsSandbox;
