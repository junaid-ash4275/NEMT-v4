import React, { useState, useEffect, useRef, useCallback } from "react";

// Standard frequency mapping for C4 to C5 octave
const NOTE_DETAILS = [
  { note: "C", keyBind: "A", type: "white", freq: 261.63, label: "C4" },
  { note: "C#", keyBind: "W", type: "black", freq: 277.18, label: "C#4" },
  { note: "D", keyBind: "S", type: "white", freq: 293.66, label: "D4" },
  { note: "D#", keyBind: "E", type: "black", freq: 311.13, label: "D#4" },
  { note: "E", keyBind: "D", type: "white", freq: 329.63, label: "E4" },
  { note: "F", keyBind: "F", type: "white", freq: 349.23, label: "F4" },
  { note: "F#", keyBind: "T", type: "black", freq: 369.99, label: "F#4" },
  { note: "G", keyBind: "G", type: "white", freq: 392.00, label: "G4" },
  { note: "G#", keyBind: "Y", type: "black", freq: 415.30, label: "G#4" },
  { note: "A", keyBind: "H", type: "white", freq: 440.00, label: "A4" },
  { note: "A#", keyBind: "U", type: "black", freq: 466.16, label: "A#4" },
  { note: "B", keyBind: "J", type: "white", freq: 493.88, label: "B4" },
  { note: "C5", keyBind: "K", type: "white", freq: 523.25, label: "C5" },
];

const PRESETS = {
  cyberBass: {
    name: "⚡ Cyber Bass",
    waveform: "sawtooth",
    attack: 0.02,
    decay: 0.15,
    sustain: 0.3,
    release: 0.2,
    delayTime: 0.1,
    delayFeedback: 0.2,
    distortion: 40,
    octave: -1,
  },
  dreamPad: {
    name: "🌌 80s Dream Pad",
    waveform: "triangle",
    attack: 0.4,
    decay: 0.8,
    sustain: 0.7,
    release: 0.8,
    delayTime: 0.35,
    delayFeedback: 0.4,
    distortion: 0,
    octave: 0,
  },
  neonLead: {
    name: "🎛️ Neon Lead",
    waveform: "sawtooth",
    attack: 0.05,
    decay: 0.2,
    sustain: 0.6,
    release: 0.3,
    delayTime: 0.25,
    delayFeedback: 0.3,
    distortion: 15,
    octave: 0,
  },
  chiptune: {
    name: "👾 Retro Chip",
    waveform: "square",
    attack: 0.0,
    decay: 0.08,
    sustain: 0.0,
    release: 0.05,
    delayTime: 0.0,
    delayFeedback: 0.0,
    distortion: 0,
    octave: 1,
  },
  spaceTheremin: {
    name: "👽 Space Theremin",
    waveform: "sine",
    attack: 0.3,
    decay: 0.5,
    sustain: 0.8,
    release: 0.6,
    delayTime: 0.4,
    delayFeedback: 0.55,
    distortion: 5,
    octave: 1,
  },
};

const SynthwaveStudio = () => {
  // Sound controls
  const [waveform, setWaveform] = useState("sawtooth");
  const [octave, setOctave] = useState(0);
  const [masterVolume, setMasterVolume] = useState(0.5);
  
  // ADSR
  const [attack, setAttack] = useState(0.05);
  const [decay, setDecay] = useState(0.2);
  const [sustain, setSustain] = useState(0.6);
  const [release, setRelease] = useState(0.3);

  // FX Rack
  const [delayTime, setDelayTime] = useState(0.25);
  const [delayFeedback, setDelayFeedback] = useState(0.3);
  const [distortion, setDistortion] = useState(15);

  // Keyboard and Playback states
  const [activeNotes, setActiveNotes] = useState({});
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [currentPreset, setCurrentPreset] = useState("neonLead");

  // Arpeggiator states
  const [arpEnabled, setArpEnabled] = useState(false);
  const [arpBpm, setArpBpm] = useState(125);
  const [arpPattern, setArpPattern] = useState("up"); // up, down, random, chord
  const [arpHeldNotes, setArpHeldNotes] = useState([]);
  const [currentArpStep, setCurrentArpStep] = useState(0);

  // Refs for Web Audio API
  const audioCtxRef = useRef(null);
  const masterGainRef = useRef(null);
  const analyserRef = useRef(null);
  const delayNodeRef = useRef(null);
  const delayFeedbackRef = useRef(null);
  const distortionRef = useRef(null);
  const activeVoicesRef = useRef({}); // Note frequencies mapped to audio node references
  const arpHeldNotesRef = useRef([]);

  // Refs for Canvas Visualizer
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const particlesRef = useRef([]);

  // Initialize Audio Nodes
  const initAudio = () => {
    if (audioCtxRef.current) return;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;

    // Master Analyser (for live visualizer)
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;

    // Master Gain
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(masterVolume, ctx.currentTime);
    masterGainRef.current = masterGain;

    // Delay Nodes
    const delayNode = ctx.createDelay(1.0);
    const delayFeedback = ctx.createGain();
    delayNode.delayTime.setValueAtTime(delayTime, ctx.currentTime);
    delayFeedback.gain.setValueAtTime(delayFeedback, ctx.currentTime);
    
    delayNodeRef.current = delayNode;
    delayFeedbackRef.current = delayFeedback;

    // Distortion Node
    const distortionNode = ctx.createWaveShaper();
    distortionNode.curve = makeDistortionCurve(distortion);
    distortionNode.oversample = "4x";
    distortionRef.current = distortionNode;

    // Connect Delay feedback loop
    delayNode.connect(delayFeedback);
    delayFeedback.connect(delayNode);

    // Audio Graph layout:
    // Oscillator -> SynthGain -> Distortion -> Delay Mixer -> MasterGain -> Analyser -> Output
    // Setup clean master mixers
    masterGain.connect(analyser);
    analyser.connect(ctx.destination);

    setAudioEnabled(true);
    if (ctx.state === "suspended") {
      ctx.resume();
    }
  };

  // Create distortion curve based on amount
  const makeDistortionCurve = (amount) => {
    const k = typeof amount === "number" ? amount : 50;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  };

  // Apply Preset parameters
  const applyPreset = (presetKey) => {
    const config = PRESETS[presetKey];
    if (!config) return;

    setCurrentPreset(presetKey);
    setWaveform(config.waveform);
    setAttack(config.attack);
    setDecay(config.decay);
    setSustain(config.sustain);
    setRelease(config.release);
    setDelayTime(config.delayTime);
    setDelayFeedback(config.delayFeedback);
    setDistortion(config.distortion);
    setOctave(config.octave);
  };

  // Dynamically update Master Volume
  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.linearRampToValueAtTime(
        masterVolume,
        audioCtxRef.current.currentTime + 0.05
      );
    }
  }, [masterVolume]);

  // Dynamically update Delay settings
  useEffect(() => {
    if (delayNodeRef.current && delayFeedbackRef.current && audioCtxRef.current) {
      const t = audioCtxRef.current.currentTime;
      delayNodeRef.current.delayTime.setValueAtTime(delayTime, t);
      delayFeedbackRef.current.gain.setValueAtTime(delayFeedback, t);
    }
  }, [delayTime, delayFeedback]);

  // Dynamically update Distortion drive
  useEffect(() => {
    if (distortionRef.current) {
      distortionRef.current.curve = makeDistortionCurve(distortion);
    }
  }, [distortion]);

  // Generate particle bursts on key press
  const addParticles = (noteIndex) => {
    const newParticles = [];
    const count = 10;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const startX = (canvas.width / NOTE_DETAILS.length) * (noteIndex + 0.5);
    const startY = canvas.height - 30;

    for (let i = 0; i < count; i++) {
      newParticles.push({
        x: startX,
        y: startY,
        vx: (Math.random() - 0.5) * 6,
        vy: -Math.random() * 8 - 2,
        color: noteIndex % 2 === 0 ? "#ec4899" : "#06b6d4", // Pink or Cyan
        radius: Math.random() * 4 + 2,
        alpha: 1,
        decay: Math.random() * 0.03 + 0.01,
      });
    }
    particlesRef.current = [...particlesRef.current, ...newParticles].slice(0, 100);
  };

  // Play Sound Generator
  const playNote = useCallback((noteObj, customFreq = null) => {
    initAudio();
    if (!audioCtxRef.current) return;

    const ctx = audioCtxRef.current;
    const noteId = noteObj.note;

    // Stop previous instance of this note if active
    if (activeVoicesRef.current[noteId]) {
      stopNote(noteId);
    }

    const baseFreq = customFreq || noteObj.freq;
    const freq = baseFreq * Math.pow(2, octave);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = waveform;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    // ADSR Setup
    const t = ctx.currentTime;
    gain.gain.setValueAtTime(0, t);
    
    // Attack phase
    gain.gain.linearRampToValueAtTime(0.4, t + attack);
    // Decay phase to Sustain value
    gain.gain.linearRampToValueAtTime(0.4 * sustain, t + attack + decay);

    // Connect node chain:
    // Osc -> Gain -> Distortion -> Delay & Master Master Gain Mix
    osc.connect(gain);

    // Apply distortion node
    if (distortion > 0 && distortionRef.current) {
      gain.connect(distortionRef.current);
      distortionRef.current.connect(masterGainRef.current);
      
      // Delay send parallel connect
      if (delayFeedback > 0 && delayNodeRef.current) {
        distortionRef.current.connect(delayNodeRef.current);
        delayNodeRef.current.connect(masterGainRef.current);
      }
    } else {
      gain.connect(masterGainRef.current);
      
      // Delay send parallel connect
      if (delayFeedback > 0 && delayNodeRef.current) {
        gain.connect(delayNodeRef.current);
        delayNodeRef.current.connect(masterGainRef.current);
      }
    }

    osc.start();

    // Store active voice
    activeVoicesRef.current[noteId] = { osc, gain };
    setActiveNotes((prev) => ({ ...prev, [noteId]: true }));

    // Visual particles trigger
    const noteIndex = NOTE_DETAILS.findIndex((n) => n.note === noteId);
    if (noteIndex !== -1) {
      addParticles(noteIndex);
    }
  }, [octave, waveform, attack, decay, sustain, distortion, delayFeedback]);

  // Release Sound Generator (ADSR Release phase)
  const stopNote = useCallback((noteId) => {
    const voice = activeVoicesRef.current[noteId];
    if (!voice || !audioCtxRef.current) return;

    const ctx = audioCtxRef.current;
    const { osc, gain } = voice;

    const t = ctx.currentTime;
    // Clear scheduled values and ramp to zero
    gain.gain.cancelScheduledValues(t);
    gain.gain.setValueAtTime(gain.gain.value, t);
    gain.gain.linearRampToValueAtTime(0, t + release);

    osc.stop(t + release + 0.05);

    delete activeVoicesRef.current[noteId];
    setActiveNotes((prev) => {
      const next = { ...prev };
      delete next[noteId];
      return next;
    });
  }, [release]);

  // Handle Arpeggiator step calculation
  const playArpStep = useCallback(() => {
    const held = arpHeldNotesRef.current;
    if (held.length === 0) return;

    let indexToPlay = 0;

    switch (arpPattern) {
      case "up":
        indexToPlay = currentArpStep % held.length;
        break;
      case "down":
        indexToPlay = (held.length - 1 - (currentArpStep % held.length));
        break;
      case "random":
        indexToPlay = Math.floor(Math.random() * held.length);
        break;
      case "chord":
        // Plays all held notes together
        held.forEach((noteObj) => {
          playNote(noteObj);
          setTimeout(() => {
            stopNote(noteObj.note);
          }, (60 / arpBpm) * 800);
        });
        setCurrentArpStep((prev) => prev + 1);
        return;
      default:
        indexToPlay = currentArpStep % held.length;
    }

    const noteToPlay = held[indexToPlay];
    if (noteToPlay) {
      playNote(noteToPlay);
      
      // Auto release arpeggiator note before next step
      setTimeout(() => {
        stopNote(noteToPlay.note);
      }, (60 / arpBpm) * 800); // 80% duration
    }

    setCurrentArpStep((prev) => prev + 1);
  }, [arpPattern, arpBpm, currentArpStep, playNote, stopNote]);

  // Arpeggiator Clock Loop
  useEffect(() => {
    let intervalId = null;
    if (arpEnabled && arpHeldNotes.length > 0) {
      const msPerBeat = (60 / arpBpm) * 1000 / 2; // Eighth Notes
      intervalId = setInterval(() => {
        playArpStep();
      }, msPerBeat);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [arpEnabled, arpHeldNotes, arpBpm, playArpStep]);

  // Canvas visualizer rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationId;

    const resizeCanvas = () => {
      const rect = canvas.parentNode.getBoundingClientRect();
      canvas.width = rect.width * 2; // High DPI support
      canvas.height = 360;
      canvas.style.width = "100%";
      canvas.style.height = "180px";
      ctx.scale(2, 2);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const render = () => {
      const w = canvas.width / 2;
      const h = canvas.height / 2;

      // Deep Space Fade Background
      ctx.fillStyle = "rgba(10, 10, 20, 0.25)";
      ctx.fillRect(0, 0, w, h);

      // Render futuristic retro grid lines
      ctx.strokeStyle = "rgba(236, 72, 153, 0.08)";
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Draw active notes glow bars
      NOTE_DETAILS.forEach((item, index) => {
        const keyW = w / NOTE_DETAILS.length;
        const xPos = index * keyW;
        if (activeNotes[item.note]) {
          const gradient = ctx.createLinearGradient(0, h, 0, 0);
          gradient.addColorStop(0, "rgba(6, 182, 212, 0.4)");
          gradient.addColorStop(1, "rgba(236, 72, 153, 0)");
          ctx.fillStyle = gradient;
          ctx.fillRect(xPos, 0, keyW, h);
        }
      });

      // Draw real-time oscillating wave
      if (analyserRef.current && audioEnabled) {
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteTimeDomainData(dataArray);

        // Cyber wave glow setup
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#ec4899";
        ctx.strokeStyle = "#ec4899";
        ctx.lineWidth = 3;
        ctx.beginPath();

        const sliceWidth = w / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * h) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        ctx.lineTo(w, h / 2);
        ctx.stroke();

        // Secondary cyan inner wave
        ctx.shadowBlur = 8;
        ctx.shadowColor = "#06b6d4";
        ctx.strokeStyle = "#06b6d4";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        x = 0;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        for (let i = 0; i < bufferLength; i++) {
          const percent = dataArray[i] / 255;
          const barHeight = percent * h * 0.6;
          const y = h/2 + (Math.sin(i * 0.1) * barHeight * 0.3);

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }
        ctx.stroke();

        // Reset shadow
        ctx.shadowBlur = 0;
      } else {
        // Flat neon line when quiet
        ctx.strokeStyle = "#ec4899";
        ctx.shadowColor = "#ec4899";
        ctx.shadowBlur = 6;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        ctx.lineTo(w, h / 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Draw visual particles
      particlesRef.current.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Filter out dead particles
      particlesRef.current = particlesRef.current.filter((p) => p.alpha > 0);

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [activeNotes, audioEnabled]);

  // Key Down keyboard handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore keypresses inside input fields
      if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT" || e.target.tagName === "TEXTAREA") {
        return;
      }

      const key = e.key.toUpperCase();
      const noteObj = NOTE_DETAILS.find((n) => n.keyBind === key);
      if (noteObj) {
        e.preventDefault();

        // If arpeggiator is enabled, collect notes
        if (arpEnabled) {
          if (!arpHeldNotes.some((n) => n.note === noteObj.note)) {
            const nextHeld = [...arpHeldNotes, noteObj].sort((a, b) => a.freq - b.freq);
            setArpHeldNotes(nextHeld);
            arpHeldNotesRef.current = nextHeld;
          }
        } else {
          // Play monophonic/polyphonic standard note
          if (!activeNotes[noteObj.note]) {
            playNote(noteObj);
          }
        }
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toUpperCase();
      const noteObj = NOTE_DETAILS.find((n) => n.keyBind === key);
      if (noteObj) {
        if (arpEnabled) {
          const nextHeld = arpHeldNotes.filter((n) => n.note !== noteObj.note);
          setArpHeldNotes(nextHeld);
          arpHeldNotesRef.current = nextHeld;
        } else {
          stopNote(noteObj.note);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [activeNotes, arpHeldNotes, arpEnabled, playNote, stopNote]);

  // Mouse note triggering (Standard keyboard clicks)
  const handleKeyMouseDown = (noteObj) => {
    if (arpEnabled) {
      if (!arpHeldNotes.some((n) => n.note === noteObj.note)) {
        const nextHeld = [...arpHeldNotes, noteObj].sort((a, b) => a.freq - b.freq);
        setArpHeldNotes(nextHeld);
        arpHeldNotesRef.current = nextHeld;
      }
    } else {
      playNote(noteObj);
    }
  };

  const handleKeyMouseUp = (noteObj) => {
    if (arpEnabled) {
      const nextHeld = arpHeldNotes.filter((n) => n.note !== noteObj.note);
      setArpHeldNotes(nextHeld);
      arpHeldNotesRef.current = nextHeld;
    } else {
      stopNote(noteObj.note);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[600px] p-5 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl m-5 shadow-2xl overflow-hidden relative border border-indigo-900/30">
      
      {/* Laser grids/Neon visual elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-pink-500 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-500 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-pink-500 to-transparent shadow-[0_0_15px_#f43f5e]" />
      </div>

      <div className="bg-slate-950/75 backdrop-blur-xl p-6 md:p-8 rounded-2xl max-w-5xl w-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 relative z-10">
        
        {/* Top Header */}
        <div className="flex flex-col lg:flex-row justify-between items-center mb-6 gap-4 pb-5 border-b border-indigo-950">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-3xl animate-bounce">🎹</span>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-400 to-cyan-400 drop-shadow-lg">
                SYNTHWAVE<span className="text-white font-light text-2xl md:text-3xl ml-1">STUDIO</span>
              </h2>
            </div>
            <p className="text-indigo-300 text-xs font-semibold uppercase tracking-[0.25em] mt-1">
              Virtual Retro-Futuristic Polyphonic Synthesizer
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-slate-900/80 p-3 rounded-xl border border-indigo-900/40">
            {/* Preset Selector */}
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-pink-400 uppercase tracking-widest mb-1">
                Sound Presets
              </span>
              <select
                value={currentPreset}
                onChange={(e) => applyPreset(e.target.value)}
                className="bg-slate-950 text-cyan-300 text-sm font-semibold border border-indigo-900/60 rounded px-2.5 py-1.5 focus:outline-none focus:border-cyan-400 transition-all cursor-pointer"
              >
                {Object.entries(PRESETS).map(([key, val]) => (
                  <option key={key} value={key} className="bg-slate-950 text-white">
                    {val.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Master Volume */}
            <div className="flex flex-col ml-3">
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-1">
                Volume
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={masterVolume}
                  onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
                  className="w-20 accent-pink-500 h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-xs font-mono font-bold text-white w-6 text-right">
                  {Math.round(masterVolume * 100)}
                </span>
              </div>
            </div>

            {/* Audio Activator */}
            {!audioEnabled && (
              <button
                onClick={initAudio}
                className="px-4 py-1.5 bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-400 hover:to-indigo-500 text-white text-xs font-bold rounded-md shadow-[0_0_15px_rgba(236,72,153,0.4)] animate-pulse transition-all ml-2"
              >
                🔴 ACTIVATE AUDIO
              </button>
            )}
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          
          {/* Engine Parameters (Left Column) */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Waveform & Octave */}
            <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 space-y-4">
              <h3 className="text-xs font-bold text-pink-400 uppercase tracking-widest border-b border-indigo-950 pb-2 flex items-center justify-between">
                <span>Oscillator Engine</span>
                <span className="text-[10px] text-indigo-300 font-mono">OSC-1</span>
              </h3>
              
              {/* Custom Selector for Waveform */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Wave Shape
                </label>
                <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1 rounded-lg border border-indigo-900/30">
                  {["sine", "triangle", "sawtooth", "square"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setWaveform(type)}
                      className={`py-1.5 text-[10px] font-bold uppercase rounded transition-all ${
                        waveform === type
                          ? "bg-cyan-500 text-slate-950 shadow-[0_0_8px_#06b6d4]"
                          : "text-gray-400 hover:text-white hover:bg-slate-900"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pitch Transpose */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Octave Shift
                </label>
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => setOctave(Math.max(-2, octave - 1))}
                    className="px-3 py-1 bg-slate-950 text-white rounded hover:bg-slate-900 border border-indigo-900/50 text-xs font-bold"
                  >
                    -
                  </button>
                  <span className="text-sm font-mono font-black text-cyan-300">
                    {octave >= 0 ? `+${octave}` : octave} Oct
                  </span>
                  <button
                    onClick={() => setOctave(Math.min(2, octave + 1))}
                    className="px-3 py-1 bg-slate-950 text-white rounded hover:bg-slate-900 border border-indigo-900/50 text-xs font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* ADSR Envelope Controls */}
            <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 space-y-3.5">
              <h3 className="text-xs font-bold text-pink-400 uppercase tracking-widest border-b border-indigo-950 pb-2">
                ADSR Volume Envelope
              </h3>

              {/* Attack */}
              <div>
                <div className="flex justify-between text-[10px] text-gray-400 font-bold mb-1">
                  <span>ATTACK (A)</span>
                  <span className="font-mono text-cyan-300">{attack.toFixed(2)}s</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.5"
                  step="0.05"
                  value={attack}
                  onChange={(e) => setAttack(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-950 accent-cyan-400 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Decay */}
              <div>
                <div className="flex justify-between text-[10px] text-gray-400 font-bold mb-1">
                  <span>DECAY (D)</span>
                  <span className="font-mono text-cyan-300">{decay.toFixed(2)}s</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="2.0"
                  step="0.05"
                  value={decay}
                  onChange={(e) => setDecay(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-950 accent-cyan-400 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Sustain */}
              <div>
                <div className="flex justify-between text-[10px] text-gray-400 font-bold mb-1">
                  <span>SUSTAIN (S)</span>
                  <span className="font-mono text-cyan-300">{Math.round(sustain * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={sustain}
                  onChange={(e) => setSustain(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-950 accent-cyan-400 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Release */}
              <div>
                <div className="flex justify-between text-[10px] text-gray-400 font-bold mb-1">
                  <span>RELEASE (R)</span>
                  <span className="font-mono text-cyan-300">{release.toFixed(2)}s</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="3.0"
                  step="0.05"
                  value={release}
                  onChange={(e) => setRelease(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-950 accent-cyan-400 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Effects Rack */}
            <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 space-y-4 md:col-span-2">
              <h3 className="text-xs font-bold text-pink-400 uppercase tracking-widest border-b border-indigo-950 pb-2">
                Vintage Effects Rack
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Delay Duration */}
                <div>
                  <div className="flex justify-between text-[10px] text-gray-400 font-bold mb-1">
                    <span>DELAY TIME</span>
                    <span className="font-mono text-pink-400">{Math.round(delayTime * 1000)}ms</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="0.8"
                    step="0.05"
                    value={delayTime}
                    onChange={(e) => setDelayTime(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-950 accent-pink-500 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Delay Feedback */}
                <div>
                  <div className="flex justify-between text-[10px] text-gray-400 font-bold mb-1">
                    <span>DELAY FEEDBACK</span>
                    <span className="font-mono text-pink-400">{Math.round(delayFeedback * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="0.85"
                    step="0.05"
                    value={delayFeedback}
                    onChange={(e) => setDelayFeedback(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-950 accent-pink-500 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Distortion Amount */}
                <div>
                  <div className="flex justify-between text-[10px] text-gray-400 font-bold mb-1">
                    <span>DISTORTION DRIVE</span>
                    <span className="font-mono text-pink-400">{distortion}x</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={distortion}
                    onChange={(e) => setDistortion(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-950 accent-pink-500 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Visualizer & Arpeggiator (Right Column) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            
            {/* Realtime Canvas Visualizer */}
            <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 flex flex-col justify-between flex-1 relative group">
              <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest border-b border-indigo-950 pb-2 mb-2 flex items-center justify-between">
                <span>Oscilloscope Output</span>
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-pink-500 animate-ping shadow-[0_0_8px_#ec4899]" />
              </h3>

              <div className="relative rounded-lg overflow-hidden border border-indigo-950 bg-slate-950 flex-1 min-h-[140px] flex items-center">
                <canvas ref={canvasRef} className="block w-full h-[140px]" />
                
                {/* CRT Scanline effect overlay */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-white/2 to-transparent bg-[length:100%_4px]" />
              </div>
            </div>

            {/* Advanced Arpeggiator */}
            <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 space-y-3.5">
              <div className="flex justify-between items-center border-b border-indigo-950 pb-2">
                <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
                  Arpeggiator Engine
                </h3>
                <button
                  onClick={() => {
                    setArpEnabled(!arpEnabled);
                    setArpHeldNotes([]);
                    arpHeldNotesRef.current = [];
                  }}
                  className={`px-3 py-1 rounded text-[10px] font-extrabold uppercase tracking-wide transition-all ${
                    arpEnabled
                      ? "bg-cyan-500 text-slate-950 shadow-[0_0_10px_#06b6d4]"
                      : "bg-slate-950 text-gray-500 border border-indigo-900/50 hover:text-white"
                  }`}
                >
                  {arpEnabled ? "● ACTIVE" : "○ INACTIVE"}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Pattern */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Arp Pattern
                  </label>
                  <select
                    value={arpPattern}
                    onChange={(e) => setArpPattern(e.target.value)}
                    disabled={!arpEnabled}
                    className="bg-slate-950 w-full text-white text-xs border border-indigo-900/60 rounded p-1.5 focus:outline-none focus:border-cyan-400 disabled:opacity-30 cursor-pointer"
                  >
                    <option value="up">UP 📈</option>
                    <option value="down">DOWN 📉</option>
                    <option value="random">RANDOM 🎲</option>
                    <option value="chord">CHORD 🎹</option>
                  </select>
                </div>

                {/* Tempo BPM */}
                <div>
                  <div className="flex justify-between text-[10px] text-gray-400 font-bold mb-1">
                    <span>TEMPO</span>
                    <span className="font-mono text-cyan-400">{arpBpm} BPM</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="220"
                    step="5"
                    value={arpBpm}
                    disabled={!arpEnabled}
                    onChange={(e) => setArpBpm(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-950 accent-cyan-400 rounded-lg appearance-none cursor-pointer disabled:opacity-30"
                  />
                </div>
              </div>

              {arpEnabled && (
                <div className="text-[10px] bg-slate-950 p-2.5 rounded border border-indigo-950 text-indigo-300 font-medium">
                  {arpHeldNotes.length > 0 ? (
                    <div className="flex items-center gap-1.5">
                      <span>Held Notes:</span>
                      <div className="flex gap-1">
                        {arpHeldNotes.map((n, i) => (
                          <span key={i} className="bg-pink-900/30 text-pink-400 px-1.5 py-0.5 rounded border border-pink-900/50">
                            {n.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <span className="italic text-gray-600 animate-pulse">
                      Hold keys (e.g. A, S, D) together to run arpeggios...
                    </span>
                  )}
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Playable Keyboard Panel */}
        <div className="bg-slate-900/80 p-5 rounded-xl border border-white/5">
          <div className="flex justify-between items-center mb-4 border-b border-indigo-950 pb-2">
            <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-widest">
              Live Synthesizer Keyboard
            </h3>
            <span className="text-[10px] text-gray-500 font-bold">
              Tip: Press <span className="bg-slate-950 text-pink-400 px-1.5 py-0.5 rounded font-mono">A-S-D-F-G-H-J-K</span> or black keys <span className="bg-slate-950 text-cyan-400 px-1.5 py-0.5 rounded font-mono">W-E-T-Y-U</span> to play!
            </span>
          </div>

          {/* Graphical Key Matrix */}
          <div className="relative flex select-none justify-center" style={{ height: "180px" }}>
            {NOTE_DETAILS.map((noteObj, index) => {
              const isBlack = noteObj.type === "black";
              const isActive = activeNotes[noteObj.note] || arpHeldNotes.some((n) => n.note === noteObj.note);
              
              if (isBlack) {
                // Calculate position offsets for floating black keys
                let leftOffset = 0;
                if (noteObj.note === "C#") leftOffset = 1;
                else if (noteObj.note === "D#") leftOffset = 2;
                else if (noteObj.note === "F#") leftOffset = 4;
                else if (noteObj.note === "G#") leftOffset = 5;
                else if (noteObj.note === "A#") leftOffset = 6;

                return (
                  <div
                    key={noteObj.note}
                    onMouseDown={() => handleKeyMouseDown(noteObj)}
                    onMouseUp={() => handleKeyMouseUp(noteObj)}
                    onMouseLeave={() => isActive && handleKeyMouseUp(noteObj)}
                    onTouchStart={(e) => { e.preventDefault(); handleKeyMouseDown(noteObj); }}
                    onTouchEnd={(e) => { e.preventDefault(); handleKeyMouseUp(noteObj); }}
                    className={`absolute z-20 w-8 md:w-10 h-28 rounded-b-md border border-slate-950 cursor-pointer shadow-lg transition-all duration-75 flex flex-col justify-end pb-3 items-center group ${
                      isActive
                        ? "bg-cyan-500 border-cyan-400 text-slate-950 shadow-[0_0_15px_#06b6d4] translate-y-0.5"
                        : "bg-slate-900 text-gray-400 hover:bg-slate-800 border-indigo-950"
                    }`}
                    style={{
                      left: `calc(12.5% * ${leftOffset} - ${leftOffset === 4 || leftOffset === 5 || leftOffset === 6 ? "18px" : "15px"})`,
                    }}
                  >
                    <span className="text-[10px] font-black tracking-tight">{noteObj.keyBind}</span>
                    <span className="text-[8px] font-semibold opacity-60 mt-1">{noteObj.note}</span>
                  </div>
                );
              }

              // Rendering White Keys
              return (
                <div
                  key={noteObj.note}
                  onMouseDown={() => handleKeyMouseDown(noteObj)}
                  onMouseUp={() => handleKeyMouseUp(noteObj)}
                  onMouseLeave={() => isActive && handleKeyMouseUp(noteObj)}
                  onTouchStart={(e) => { e.preventDefault(); handleKeyMouseDown(noteObj); }}
                  onTouchEnd={(e) => { e.preventDefault(); handleKeyMouseUp(noteObj); }}
                  className={`w-[12.5%] h-full border border-slate-950 rounded-b-lg cursor-pointer transition-all duration-75 flex flex-col justify-end pb-4 items-center relative group shadow-inner ${
                    isActive
                      ? "bg-gradient-to-b from-slate-950 via-pink-600 to-pink-500 border-pink-500 text-white shadow-[0_0_20px_#ec4899_inset] translate-y-0.5"
                      : "bg-gradient-to-b from-white/95 to-slate-100/90 text-slate-800 hover:from-white hover:to-indigo-50 border-indigo-900/20"
                  }`}
                >
                  <span className="text-xs font-black tracking-tight">{noteObj.keyBind}</span>
                  <span className="text-[9px] font-bold opacity-60 mt-1">{noteObj.label}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SynthwaveStudio;
