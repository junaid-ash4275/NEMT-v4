import React, { useState, useEffect, useCallback, useRef } from "react";

const TRACKS = [
  { id: "kick", name: "🥁 Kick", color: "bg-rose-500", frequency: 150 },
  { id: "snare", name: "💨 Snare", color: "bg-orange-500", frequency: 400 },
  { id: "hihat", name: "✨ Hi-Hat", color: "bg-amber-500", frequency: 1000 },
  { id: "clap", name: "👏 Clap", color: "bg-emerald-500", frequency: 800 },
];

const STEPS = 16;

const DrumSequencer = () => {
  const [bpm, setBpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [grid, setGrid] = useState(
    Array(TRACKS.length)
      .fill(null)
      .map(() => Array(STEPS).fill(false))
  );

  const audioContextRef = useRef(null);
  const timerRef = useRef(null);

  // Initialize Audio Context
  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
  };

  // Play sound function
  const playSound = (frequency, type = "sine") => {
    if (!audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    
    // Simple envelope
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  };

  const toggleStep = (trackIndex, stepIndex) => {
    const newGrid = [...grid];
    newGrid[trackIndex] = [...newGrid[trackIndex]];
    newGrid[trackIndex][stepIndex] = !newGrid[trackIndex][stepIndex];
    setGrid(newGrid);
    
    if (!isPlaying && newGrid[trackIndex][stepIndex]) {
      initAudio();
      playSound(TRACKS[trackIndex].frequency);
    }
  };

  const handlePlayPause = () => {
    initAudio();
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    setIsPlaying(!isPlaying);
  };

  const clearGrid = () => {
    setGrid(Array(TRACKS.length).fill(null).map(() => Array(STEPS).fill(false)));
  };

  const setRandomPattern = () => {
    const newGrid = grid.map(() => Array(STEPS).fill(null).map(() => Math.random() > 0.8));
    setGrid(newGrid);
  };

  // Sequencer Logic
  useEffect(() => {
    if (isPlaying) {
      const interval = (60 / bpm / 4) * 1000; // 16th notes
      timerRef.current = setInterval(() => {
        setCurrentStep((prev) => (prev + 1) % STEPS);
      }, interval);
    } else {
      clearInterval(timerRef.current);
      setCurrentStep(0);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, bpm]);

  // Play sounds for current step
  useEffect(() => {
    if (isPlaying) {
      grid.forEach((track, index) => {
        if (track[currentStep]) {
          playSound(TRACKS[index].frequency);
        }
      });
    }
  }, [currentStep, isPlaying, grid]);

  return (
    <div className="flex justify-center items-center min-h-[500px] p-5 bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900 rounded-2xl m-5 shadow-2xl overflow-hidden relative">
      {/* Animated background circles */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-pink-500 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-500 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl max-w-4xl w-full shadow-2xl border border-white/20 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h2 className="text-4xl font-black text-white tracking-tighter">
              BEAT<span className="text-pink-500">STUDIO</span>
            </h2>
            <p className="text-indigo-200 text-sm font-medium">16-Step Rhythm Sequencer</p>
          </div>

          <div className="flex items-center gap-6 bg-black/30 p-4 rounded-xl border border-white/10">
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-1">Tempo</span>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="60"
                  max="200"
                  value={bpm}
                  onChange={(e) => setBpm(parseInt(e.target.value))}
                  className="w-24 accent-pink-500"
                />
                <span className="text-xl font-mono font-bold text-white w-8">{bpm}</span>
              </div>
            </div>

            <button
              onClick={handlePlayPause}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                isPlaying 
                ? "bg-pink-500 hover:bg-pink-400 scale-110 shadow-pink-500/50" 
                : "bg-indigo-500 hover:bg-indigo-400 shadow-indigo-500/50"
              }`}
            >
              {isPlaying ? (
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6zm8 0h4v16h-4z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-white translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Sequencer Grid */}
        <div className="space-y-4 mb-8">
          {TRACKS.map((track, trackIdx) => (
            <div key={track.id} className="flex items-center gap-4">
              <div className="w-24 text-right">
                <span className="text-sm font-bold text-white uppercase tracking-tight opacity-80">
                  {track.name}
                </span>
              </div>
              <div className="flex-1 grid grid-cols-8 md:grid-cols-16 gap-1.5">
                {grid[trackIdx].map((isActive, stepIdx) => (
                  <button
                    key={stepIdx}
                    onClick={() => toggleStep(trackIdx, stepIdx)}
                    className={`h-10 rounded-md transition-all duration-150 transform active:scale-90 ${
                      isActive 
                        ? `${track.color} shadow-lg shadow-${track.color.split('-')[1]}-500/50 scale-105 z-10` 
                        : "bg-white/5 hover:bg-white/20 border border-white/10"
                    } ${
                      currentStep === stepIdx && isPlaying
                        ? "ring-2 ring-white ring-offset-2 ring-offset-indigo-900"
                        : ""
                    } ${
                      stepIdx % 4 === 0 && !isActive ? "bg-white/10" : ""
                    }`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-24" />
          <div className="flex-1 grid grid-cols-16 gap-1.5 px-0.5">
            {Array(STEPS).fill(0).map((_, i) => (
              <div 
                key={i} 
                className={`h-1 rounded-full transition-all duration-300 ${
                  currentStep === i ? "bg-pink-500 scale-y-150" : "bg-white/10"
                }`} 
              />
            ))}
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="flex justify-between items-center pt-6 border-t border-white/10">
          <div className="flex gap-2">
            <button
              onClick={setRandomPattern}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-lg border border-white/10 transition-colors"
            >
              🎲 RANDOMIZE
            </button>
            <button
              onClick={clearGrid}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-lg border border-white/10 transition-colors"
            >
              🧹 CLEAR
            </button>
          </div>
          <div className="text-[10px] text-indigo-300 font-bold tracking-[0.2em] uppercase">
            Built for Creativity
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrumSequencer;
