import React, { useState, useEffect, useRef } from 'react';

// Predefined fractal coordinates and parameters
const PRESETS = {
  mandelbrotDefault: {
    name: 'Mandelbrot Classic',
    type: 'mandelbrot',
    centerX: -0.7,
    centerY: 0.0,
    zoom: 2.5,
    iterations: 150,
    palette: 0,
    juliaX: -0.7,
    juliaY: 0.27015,
  },
  seahorseValley: {
    name: 'Seahorse Valley',
    type: 'mandelbrot',
    centerX: -0.743643887037158704752191506114774,
    centerY: 0.131825904205311970493132056385139,
    zoom: 0.005,
    iterations: 250,
    palette: 1,
    juliaX: -0.7,
    juliaY: 0.27015,
  },
  tripleSpiral: {
    name: 'Triple Spiral Valley',
    type: 'mandelbrot',
    centerX: -0.088,
    centerY: 0.654,
    zoom: 0.03,
    iterations: 300,
    palette: 3,
    juliaX: -0.7,
    juliaY: 0.27015,
  },
  juliaClassic: {
    name: 'Classic Julia Dendrite',
    type: 'julia',
    centerX: 0.0,
    centerY: 0.0,
    zoom: 2.4,
    iterations: 180,
    palette: 2,
    juliaX: -0.4,
    juliaY: 0.6,
  },
  goldenSpiralJulia: {
    name: 'Golden Ratio Julia',
    type: 'julia',
    centerX: 0.0,
    centerY: 0.0,
    zoom: 2.3,
    iterations: 200,
    palette: 5,
    juliaX: -0.8,
    juliaY: 0.156,
  },
  cosmicLaceJulia: {
    name: 'Cosmic Lace',
    type: 'julia',
    centerX: 0.0,
    centerY: 0.0,
    zoom: 2.2,
    iterations: 250,
    palette: 0,
    juliaX: -0.7269,
    juliaY: 0.1889,
  }
};

const PALETTES = [
  { name: 'Cosmic Dusk', id: 0, preview: 'from-violet-500 via-pink-500 to-sky-500' },
  { name: 'Solar Flare', id: 1, preview: 'from-amber-500 via-orange-500 to-red-500' },
  { name: 'Neon Cyber', id: 2, preview: 'from-emerald-400 via-cyan-500 to-purple-600' },
  { name: 'Psychedelic', id: 3, preview: 'from-fuchsia-500 via-pink-500 to-yellow-400' },
  { name: 'Steel Steel', id: 4, preview: 'from-slate-400 via-gray-600 to-slate-900' },
  { name: 'Emerald Void', id: 5, preview: 'from-emerald-600 via-teal-700 to-zinc-950' }
];

// GLSL shaders code
const VERTEX_SHADER_SRC = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER_SRC = `
  precision highp float;
  uniform vec2 u_resolution;
  uniform float u_zoom;
  uniform vec2 u_offset;
  uniform float u_max_iterations;
  uniform vec2 u_julia_c;
  uniform float u_is_julia;
  uniform int u_color_palette;
  uniform float u_color_cycle;

  vec3 palette( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d ) {
    return a + b*cos( 6.28318*(c*t+d) );
  }

  vec3 get_color(float t) {
    t = fract(t + u_color_cycle);
    
    if (u_color_palette == 0) {
      return palette(t, vec3(0.5, 0.5, 0.5), vec3(0.5, 0.5, 0.5), vec3(1.0, 1.0, 1.0), vec3(0.0, 0.33, 0.67));
    } else if (u_color_palette == 1) {
      return palette(t, vec3(0.5, 0.5, 0.5), vec3(0.5, 0.5, 0.5), vec3(2.0, 1.0, 0.0), vec3(0.5, 0.20, 0.25));
    } else if (u_color_palette == 2) {
      return palette(t, vec3(0.8, 0.5, 0.4), vec3(0.2, 0.4, 0.2), vec3(2.0, 1.0, 1.0), vec3(0.0, 0.25, 0.25));
    } else if (u_color_palette == 3) {
      return palette(t, vec3(0.5, 0.5, 0.5), vec3(0.5, 0.5, 0.5), vec3(1.0, 1.0, 1.0), vec3(0.3, 0.20, 0.20));
    } else if (u_color_palette == 4) {
      return palette(t, vec3(0.5, 0.5, 0.5), vec3(0.5, 0.5, 0.5), vec3(1.0, 1.0, 1.0), vec3(0.0, 0.1, 0.2));
    } else {
      return palette(t, vec3(0.0, 0.5, 0.3), vec3(0.0, 0.5, 0.4), vec3(1.0, 1.0, 1.0), vec3(0.0, 0.5, 0.33));
    }
  }

  void main() {
    vec2 st = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);
    vec2 z = st * u_zoom + u_offset;
    vec2 c = u_is_julia > 0.5 ? u_julia_c : z;
    
    float n = 0.0;
    float max_i = u_max_iterations;
    
    for (int i = 0; i < 500; i++) {
      if (float(i) >= max_i) break;
      
      float x = z.x * z.x - z.y * z.y + c.x;
      float y = 2.0 * z.x * z.y + c.y;
      
      if (x*x + y*y > 4.0) {
        n = float(i);
        z = vec2(x, y);
        break;
      }
      z = vec2(x, y);
    }
    
    vec3 color = vec3(0.0);
    if (n < max_i) {
      float log_zn = log(z.x*z.x + z.y*z.y) / 2.0;
      float nu = log(log_zn / log(2.0)) / log(2.0);
      float iter_smooth = n + 1.0 - nu;
      
      float t = iter_smooth / max_i;
      t = pow(t, 0.55);
      color = get_color(t);
    } else {
      color = vec3(0.02, 0.02, 0.03);
    }
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

const FractalArtExplorer = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  // Fractal Configuration State
  const [fractalType, setFractalType] = useState('mandelbrot'); // 'mandelbrot' or 'julia'
  const [centerX, setCenterX] = useState(-0.7);
  const [centerY, setCenterY] = useState(0.0);
  const [zoom, setZoom] = useState(2.5);
  const [iterations, setIterations] = useState(150);
  const [selectedPalette, setSelectedPalette] = useState(0);
  
  // Julia specific variables
  const [juliaC, setJuliaC] = useState({ x: -0.7, y: 0.27015 });
  const [isMorphingMouse, setIsMorphingMouse] = useState(false);
  const [isMorphingAuto, setIsMorphingAuto] = useState(false);

  // Color cycle animation State
  const [isColorCycling, setIsColorCycling] = useState(true);
  const [cycleSpeed, setCycleSpeed] = useState(0.002);

  // Smooth movement references (target vs current values for Lerp interpolation)
  const renderStateRef = useRef({
    currentX: -0.7,
    targetX: -0.7,
    currentY: 0.0,
    targetY: 0.0,
    currentZoom: 2.5,
    targetZoom: 2.5,
    currentIterations: 150,
    targetIterations: 150,
    currentJuliaX: -0.7,
    targetJuliaX: -0.7,
    currentJuliaY: 0.27015,
    targetJuliaY: 0.27015,
    colorCycle: 0.0,
  });

  // Track dragging/panning
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Compile Shaders Helper
  const compileShader = (gl, source, type) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  };

  // Preset Handler
  const loadPreset = (presetKey) => {
    const p = PRESETS[presetKey];
    if (!p) return;

    setFractalType(p.type);
    setIterations(p.iterations);
    setSelectedPalette(p.palette);
    setJuliaC({ x: p.juliaX, y: p.juliaY });
    
    // Sync immediate targets
    renderStateRef.current.targetX = p.centerX;
    renderStateRef.current.targetY = p.centerY;
    renderStateRef.current.targetZoom = p.zoom;
    renderStateRef.current.targetIterations = p.iterations;
    renderStateRef.current.targetJuliaX = p.juliaX;
    renderStateRef.current.targetJuliaY = p.juliaY;
    
    // Smooth reset trigger
    setCenterX(p.centerX);
    setCenterY(p.centerY);
    setZoom(p.zoom);
  };

  // Handle Resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const handleResize = () => {
      const parent = canvas.parentElement;
      canvas.width = parent.clientWidth * window.devicePixelRatio;
      canvas.height = parent.clientHeight * window.devicePixelRatio;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // WebGL Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      console.error('WebGL is not supported by your browser.');
      return;
    }

    // Initialize Shader Program
    const vs = compileShader(gl, VERTEX_SHADER_SRC, gl.VERTEX_SHADER);
    const fs = compileShader(gl, FRAGMENT_SHADER_SRC, gl.FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }

    // Simple quad setup
    const vertices = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const positionLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    // Uniform Locations
    const uniforms = {
      resolution: gl.getUniformLocation(program, 'u_resolution'),
      zoom: gl.getUniformLocation(program, 'u_zoom'),
      offset: gl.getUniformLocation(program, 'u_offset'),
      maxIterations: gl.getUniformLocation(program, 'u_max_iterations'),
      juliaC: gl.getUniformLocation(program, 'u_julia_c'),
      isJulia: gl.getUniformLocation(program, 'u_is_julia'),
      colorPalette: gl.getUniformLocation(program, 'u_color_palette'),
      colorCycle: gl.getUniformLocation(program, 'u_color_cycle'),
    };

    // Draw / Animation frame loop
    const loop = () => {
      const state = renderStateRef.current;

      // 1. Lerp to targets for beautiful smooth gliding physics
      state.currentX += (state.targetX - state.currentX) * 0.12;
      state.currentY += (state.targetY - state.currentY) * 0.12;
      state.currentZoom += (state.targetZoom - state.currentZoom) * 0.12;
      state.currentIterations += (state.targetIterations - state.currentIterations) * 0.08;
      state.currentJuliaX += (state.targetJuliaX - state.currentJuliaX) * 0.1;
      state.currentJuliaY += (state.targetJuliaY - state.currentJuliaY) * 0.1;

      // Update external stats displays periodically without spamming React render cycles
      if (Math.abs(centerX - state.currentX) > 0.0001) setCenterX(state.currentX);
      if (Math.abs(centerY - state.currentY) > 0.0001) setCenterY(state.currentY);
      if (Math.abs(zoom - state.currentZoom) > 0.0001) setZoom(state.currentZoom);

      // Auto Morph animation
      if (fractalType === 'julia' && isMorphingAuto) {
        const time = performance.now() * 0.00045;
        // Generate beautiful orbits using complex Lissajous patterns
        state.targetJuliaX = 0.7885 * Math.cos(time);
        state.targetJuliaY = 0.7885 * Math.sin(time * 0.7);
        setJuliaC({ x: state.targetJuliaX, y: state.targetJuliaY });
      }

      // Color Cycle increment
      if (isColorCycling) {
        state.colorCycle = (state.colorCycle + cycleSpeed) % 1.0;
      }

      // 2. Setup viewport
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);

      // 3. Bind Uniforms
      gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
      gl.uniform1f(uniforms.zoom, state.currentZoom);
      gl.uniform2f(uniforms.offset, state.currentX, state.currentY);
      gl.uniform1f(uniforms.maxIterations, state.currentIterations);
      gl.uniform2f(uniforms.juliaC, state.currentJuliaX, state.currentJuliaY);
      gl.uniform1f(uniforms.isJulia, fractalType === 'julia' ? 1.0 : 0.0);
      gl.uniform1i(uniforms.colorPalette, selectedPalette);
      gl.uniform1f(uniforms.colorCycle, state.colorCycle);

      // 4. Draw
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationRef.current);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fractalType, selectedPalette, isColorCycling, cycleSpeed, isMorphingAuto]);

  // Sync React settings changes to Ref targets
  useEffect(() => {
    renderStateRef.current.targetIterations = iterations;
  }, [iterations]);

  useEffect(() => {
    if (!isMorphingMouse && !isMorphingAuto) {
      renderStateRef.current.targetJuliaX = juliaC.x;
      renderStateRef.current.targetJuliaY = juliaC.y;
    }
  }, [juliaC, isMorphingMouse, isMorphingAuto]);

  // Event Listeners for Canvas Interaction
  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isDragging) {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;

      // Project pixel movements to mathematical coordinates scale
      const minDimension = Math.min(canvas.width, canvas.height);
      
      const state = renderStateRef.current;
      const glXDiff = -(dx / minDimension) * state.currentZoom;
      const glYDiff = (dy / minDimension) * state.currentZoom;

      state.targetX += glXDiff;
      state.targetY += glYDiff;

      dragStartRef.current = { x: e.clientX, y: e.clientY };
    }

    // If mouse morphing is active in Julia mode, map position to complex parameter
    if (fractalType === 'julia' && isMorphingMouse) {
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      
      // Scale mouse position to sensible Julia ranges [-1.5, 1.5]
      const state = renderStateRef.current;
      state.targetJuliaX = x * 1.0;
      state.targetJuliaY = y * 1.0;
      setJuliaC({ x: state.targetJuliaX, y: state.targetJuliaY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Center of zoom: find the mathematical coordinates under the mouse
    const minDimension = Math.min(canvas.width, canvas.height);
    
    // Normalized device coords (-0.5 to 0.5 grid)
    const ndcX = (mouseX - rect.width * 0.5) / minDimension;
    const ndcY = -(mouseY - rect.height * 0.5) / minDimension;

    const state = renderStateRef.current;
    const mathX = ndcX * state.currentZoom + state.currentX;
    const mathY = ndcY * state.currentZoom + state.currentY;

    // Zoom multiplier
    const factor = e.deltaY > 0 ? 1.22 : 0.82;
    const nextTargetZoom = state.targetZoom * factor;
    
    // Clamp zoom to prevent floating point inaccuracies collapsing
    if (nextTargetZoom > 0.00000000001 && nextTargetZoom < 20.0) {
      state.targetZoom = nextTargetZoom;

      // Adjust offset so mouse position remains steady under the zoom
      state.targetX = mathX - ndcX * nextTargetZoom;
      state.targetY = mathY - ndcY * nextTargetZoom;
    }
  };

  const handleDoubleClick = (e) => {
    // Zoom in on double click
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const minDimension = Math.min(canvas.width, canvas.height);
    const ndcX = (mouseX - rect.width * 0.5) / minDimension;
    const ndcY = -(mouseY - rect.height * 0.5) / minDimension;

    const state = renderStateRef.current;
    const mathX = ndcX * state.currentZoom + state.currentX;
    const mathY = ndcY * state.currentZoom + state.currentY;

    state.targetZoom = state.targetZoom * 0.4;
    state.targetX = mathX - ndcX * state.targetZoom;
    state.targetY = mathY - ndcY * state.targetZoom;
  };

  const resetView = () => {
    const state = renderStateRef.current;
    state.targetX = fractalType === 'mandelbrot' ? -0.7 : 0.0;
    state.targetY = 0.0;
    state.targetZoom = 2.5;
    state.targetIterations = 150;
    
    setIterations(150);
    if (fractalType === 'julia') {
      state.targetJuliaX = -0.7;
      state.targetJuliaY = 0.27015;
      setJuliaC({ x: -0.7, y: 0.27015 });
    }
  };

  const exportArtwork = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Trigger file download helper
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `fractal-art-${fractalType}-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
  };

  return (
    <div className="flex justify-center items-center min-h-[850px] p-6 bg-[#090b11] rounded-[3rem] m-5 shadow-2xl relative overflow-hidden group font-sans border border-white/5">
      {/* Background ambient glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-violet-600/10 blur-[130px] rounded-full"></div>
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-fuchsia-600/10 blur-[130px] rounded-full animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full max-w-7xl relative z-10">
        
        {/* VIEWPORT COLUMN */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="relative aspect-[4/3] w-full bg-slate-950 rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 group-hover:border-indigo-500/25 transition-colors">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
              onDoubleClick={handleDoubleClick}
              className="absolute top-0 left-0 w-full h-full cursor-grab active:cursor-grabbing"
            />

            {/* Instruction Overlays */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center pointer-events-none">
              <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white/70 text-xs font-semibold flex items-center gap-2">
                <span>🖱️ Drag to Pan</span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                <span>🌀 Scroll / Double-Click to Zoom</span>
              </div>
              
              <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white/70 text-xs font-mono">
                Z: {zoom.toFixed(4)}
              </div>
            </div>
          </div>

          {/* Bottom stats ticker */}
          <div className="grid grid-cols-3 gap-4 bg-white/[0.02] border border-white/5 backdrop-blur-md p-4 rounded-2xl text-center">
            <div>
              <span className="block text-[10px] text-white/40 uppercase font-bold tracking-wider">Complex Center</span>
              <span className="text-white/80 font-mono text-xs">
                {centerX.toFixed(5)} + {centerY.toFixed(5)}i
              </span>
            </div>
            <div>
              <span className="block text-[10px] text-white/40 uppercase font-bold tracking-wider">Iterations (Detail)</span>
              <span className="text-white/80 font-mono text-xs">{Math.round(iterations)}</span>
            </div>
            <div>
              <span className="block text-[10px] text-white/40 uppercase font-bold tracking-wider">Engine Mode</span>
              <span className="text-indigo-400 font-bold text-xs flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span> WebGL 60FPS
              </span>
            </div>
          </div>
        </div>

        {/* CONTROLS COLUMN */}
        <div className="lg:col-span-4 bg-white/[0.02] backdrop-blur-3xl p-6 rounded-[2.5rem] border border-white/10 shadow-2xl space-y-6 max-h-[700px] overflow-y-auto custom-scrollbar">
          
          {/* Header */}
          <header>
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-fuchsia-400 mb-1 tracking-tight">
              Fractal Explorer
            </h2>
            <p className="text-gray-400 font-medium text-xs">
              Explore dynamic infinite geometric math structures.
            </p>
          </header>

          {/* Quick presets */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">Explore Presets</span>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(PRESETS).map((key) => (
                <button
                  key={key}
                  onClick={() => loadPreset(key)}
                  className="px-3 py-2 rounded-xl text-xs font-bold transition-all bg-white/5 border border-white/5 text-white/60 hover:bg-white/10 hover:border-white/10 text-left truncate"
                >
                  {PRESETS[key].name}
                </button>
              ))}
            </div>
          </div>

          {/* Switch Set Type */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">Fractal Set</span>
            <div className="grid grid-cols-2 gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/5">
              <button
                onClick={() => {
                  setFractalType('mandelbrot');
                  const state = renderStateRef.current;
                  state.targetX = -0.7;
                  state.targetY = 0.0;
                  state.targetZoom = 2.5;
                }}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  fractalType === 'mandelbrot'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                    : 'text-white/50 hover:text-white/80'
                }`}
              >
                Mandelbrot
              </button>
              <button
                onClick={() => {
                  setFractalType('julia');
                  const state = renderStateRef.current;
                  state.targetX = 0.0;
                  state.targetY = 0.0;
                  state.targetZoom = 2.4;
                }}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  fractalType === 'julia'
                    ? 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white shadow-lg'
                    : 'text-white/50 hover:text-white/80'
                }`}
              >
                Julia Set
              </button>
            </div>
          </div>

          {/* Julia set morph configuration */}
          {fractalType === 'julia' && (
            <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/5 space-y-4">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">Julia Constant (C)</span>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setIsMorphingMouse(!isMorphingMouse);
                    setIsMorphingAuto(false);
                  }}
                  className={`py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                    isMorphingMouse
                      ? 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                      : 'bg-transparent border-transparent text-white/40 hover:text-white/60'
                  }`}
                >
                  🖱️ Mouse Morph
                </button>
                <button
                  onClick={() => {
                    setIsMorphingAuto(!isMorphingAuto);
                    setIsMorphingMouse(false);
                  }}
                  className={`py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                    isMorphingAuto
                      ? 'bg-fuchsia-500/10 border-fuchsia-500/30 text-fuchsia-300'
                      : 'bg-transparent border-transparent text-white/40 hover:text-white/60'
                  }`}
                >
                  🚀 Auto Orbit
                </button>
              </div>

              {!isMorphingMouse && !isMorphingAuto && (
                <div className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-white/50">
                      <span>Real Coordinate (Cr)</span>
                      <span className="font-mono">{juliaC.x.toFixed(4)}</span>
                    </div>
                    <input
                      type="range"
                      min="-2.0"
                      max="1.5"
                      step="0.0001"
                      value={juliaC.x}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setJuliaC(prev => ({ ...prev, x: val }));
                        renderStateRef.current.targetJuliaX = val;
                      }}
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-white/50">
                      <span>Imaginary Coordinate (Ci)</span>
                      <span className="font-mono">{juliaC.y.toFixed(4)}</span>
                    </div>
                    <input
                      type="range"
                      min="-2.0"
                      max="1.5"
                      step="0.0001"
                      value={juliaC.y}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setJuliaC(prev => ({ ...prev, y: val }));
                        renderStateRef.current.targetJuliaY = val;
                      }}
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Details iterations slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-bold uppercase text-white/40 tracking-wider">
              <span>Detail Density</span>
              <span className="text-white/60 font-mono">{iterations} iterations</span>
            </div>
            <input
              type="range"
              min="20"
              max="500"
              step="5"
              value={iterations}
              onChange={(e) => setIterations(parseInt(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          {/* Color palette selection */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">Color Palette</span>
            <div className="grid grid-cols-2 gap-2">
              {PALETTES.map((pal) => (
                <button
                  key={pal.id}
                  onClick={() => setSelectedPalette(pal.id)}
                  className={`flex items-center gap-2.5 p-2 rounded-xl border text-left transition-all ${
                    selectedPalette === pal.id
                      ? 'bg-white/10 border-white/20 text-white'
                      : 'bg-white/5 border-transparent text-white/50 hover:bg-white/8 hover:text-white/80'
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full bg-gradient-to-tr ${pal.preview}`}></div>
                  <span className="text-xs font-semibold">{pal.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color Cycling configurations */}
          <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Psychedelic Cycling</span>
              <button
                onClick={() => setIsColorCycling(!isColorCycling)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all border ${
                  isColorCycling 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                    : 'bg-white/5 border-transparent text-white/40 hover:text-white/60'
                }`}
              >
                {isColorCycling ? 'ACTIVE' : 'PAUSED'}
              </button>
            </div>

            {isColorCycling && (
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-white/50">
                  <span>Cycle Speed</span>
                  <span className="font-mono">x{(cycleSpeed * 1000).toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.0005"
                  max="0.01"
                  step="0.0005"
                  value={cycleSpeed}
                  onChange={(e) => setCycleSpeed(parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            )}
          </div>

          {/* Bottom actions */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={resetView}
              className="py-3 px-4 bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 active:scale-95 text-white/80 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
            >
              🔄 Reset View
            </button>
            <button
              onClick={exportArtwork}
              className="py-3 px-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:brightness-110 active:scale-95 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-1.5"
            >
              📸 Export Art
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default FractalArtExplorer;
