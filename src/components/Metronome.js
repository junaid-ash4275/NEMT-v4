import React, { useState, useEffect, useRef } from 'react';

const Metronome = () => {
  const [bpm, setBpm] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);
  const [beatsPerMeasure, setBeatsPerMeasure] = useState(4);
  const [currentBeat, setCurrentBeat] = useState(0);

  const audioContextRef = useRef(null);
  const nextNoteTimeRef = useRef(0);
  const currentBeatRef = useRef(0);
  const timerIDRef = useRef(null);

  const lookahead = 25.0; // How frequently to call scheduling function (in milliseconds)
  const scheduleAheadTime = 0.1; // How far ahead to schedule audio (sec)

  useEffect(() => {
    return () => {
      if (timerIDRef.current) {
        clearTimeout(timerIDRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.error);
      }
    };
  }, []);

  const nextNote = () => {
    const secondsPerBeat = 60.0 / bpm;
    nextNoteTimeRef.current += secondsPerBeat;
    currentBeatRef.current = (currentBeatRef.current + 1) % beatsPerMeasure;
  };

  const playClick = (time, beatNumber) => {
    if (!audioContextRef.current) return;
    const osc = audioContextRef.current.createOscillator();
    const envelope = audioContextRef.current.createGain();

    osc.connect(envelope);
    envelope.connect(audioContextRef.current.destination);

    if (beatNumber === 0) {
      osc.frequency.value = 1000.0;
    } else {
      osc.frequency.value = 800.0;
    }

    envelope.gain.value = 1;
    envelope.gain.exponentialRampToValueAtTime(1, time + 0.001);
    envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.02);

    osc.start(time);
    osc.stop(time + 0.03);

    // Sync visual
    const timeUntilNote = time - audioContextRef.current.currentTime;
    setTimeout(() => {
      setCurrentBeat(beatNumber);
    }, Math.max(0, timeUntilNote * 1000));
  };

  const scheduler = () => {
    while (nextNoteTimeRef.current < audioContextRef.current.currentTime + scheduleAheadTime) {
      playClick(nextNoteTimeRef.current, currentBeatRef.current);
      nextNote();
    }
    timerIDRef.current = setTimeout(scheduler, lookahead);
  };

  const handlePlayStop = () => {
    if (isPlaying) {
      setIsPlaying(false);
      clearTimeout(timerIDRef.current);
      setCurrentBeat(0);
    } else {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
      setIsPlaying(true);
      currentBeatRef.current = 0;
      setCurrentBeat(0);
      nextNoteTimeRef.current = audioContextRef.current.currentTime + 0.05;
      scheduler();
    }
  };

  const handleBpmChange = (e) => {
    setBpm(Number(e.target.value));
  };

  const adjustBpm = (amount) => {
    setBpm((prev) => Math.min(240, Math.max(40, prev + amount)));
  };

  return (
    <div className="flex justify-center items-center min-h-[500px] p-5 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl m-5 shadow-2xl">
      <div className="bg-white p-8 rounded-xl max-w-xl w-full shadow-xl transition-all duration-300">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent mb-2">
            Metronome
          </h2>
          <p className="text-gray-500 text-sm">
            Keep your tempo steady
          </p>
        </div>

        <div className="space-y-8">
          {/* Visual Indicator */}
          <div className="flex justify-center gap-4 mb-8 min-h-[30px] items-center">
            {Array.from({ length: beatsPerMeasure }).map((_, i) => (
              <div 
                key={i}
                className={`w-6 h-6 rounded-full transition-all duration-100 ${
                  isPlaying && currentBeat === i 
                    ? i === 0 
                      ? 'bg-pink-500 scale-125 shadow-lg shadow-pink-500/50' 
                      : 'bg-indigo-500 scale-110 shadow-lg shadow-indigo-500/50'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          <div className="text-center">
            <div className="flex justify-center items-center gap-6">
              <button 
                onClick={() => adjustBpm(-5)}
                className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-colors"
              >
                -5
              </button>
              <div className="w-32">
                <div className="text-6xl font-black text-gray-800 tracking-tighter">{bpm}</div>
                <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">BPM</div>
              </div>
              <button 
                onClick={() => adjustBpm(5)}
                className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-colors"
              >
                +5
              </button>
            </div>
          </div>

          <div>
            <input 
              type="range" 
              min="40" 
              max="240" 
              value={bpm} 
              onChange={handleBpmChange}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <div className="flex justify-between mt-2 text-xs text-gray-400 font-bold">
              <span>40</span>
              <span>240</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Beats per measure</label>
              <select 
                className="w-full p-4 border-2 border-gray-100 rounded-xl focus:border-purple-400 outline-none transition-colors text-gray-700 bg-white cursor-pointer font-bold text-lg"
                value={beatsPerMeasure}
                onChange={(e) => setBeatsPerMeasure(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                  <option key={num} value={num}>{num} Beats</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={handlePlayStop}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95 text-lg ${
                  isPlaying 
                    ? 'bg-rose-500 hover:bg-rose-400 shadow-rose-500/30' 
                    : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 shadow-purple-500/30'
                }`}
              >
                {isPlaying ? 'STOP' : 'PLAY'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Metronome;
