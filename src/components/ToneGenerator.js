import React, { useState, useEffect, useRef } from 'react';

const ToneGenerator = () => {
  const [frequency, setFrequency] = useState(440);
  const [waveform, setWaveform] = useState('sine');
  const [volume, setVolume] = useState(0.5);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);
  const gainNodeRef = useRef(null);

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        if (audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close();
        }
      }
    };
  }, []);

  useEffect(() => {
    if (oscillatorRef.current && isPlaying) {
      oscillatorRef.current.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
    }
  }, [frequency, isPlaying]);

  useEffect(() => {
    if (oscillatorRef.current && isPlaying) {
      oscillatorRef.current.type = waveform;
    }
  }, [waveform, isPlaying]);

  useEffect(() => {
    if (gainNodeRef.current && audioContextRef.current && isPlaying) {
      gainNodeRef.current.gain.setValueAtTime(volume, audioContextRef.current.currentTime);
    }
  }, [volume, isPlaying]);

  const handlePlay = () => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (isPlaying) return;

    oscillatorRef.current = audioContextRef.current.createOscillator();
    gainNodeRef.current = audioContextRef.current.createGain();

    oscillatorRef.current.type = waveform;
    oscillatorRef.current.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
    gainNodeRef.current.gain.setValueAtTime(volume, audioContextRef.current.currentTime);

    oscillatorRef.current.connect(gainNodeRef.current);
    gainNodeRef.current.connect(audioContextRef.current.destination);

    oscillatorRef.current.start();
    setIsPlaying(true);
  };

  const handleStop = () => {
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
      } catch (e) {
        // Ignore already stopped error
      }
      oscillatorRef.current.disconnect();
      gainNodeRef.current.disconnect();
      oscillatorRef.current = null;
      gainNodeRef.current = null;
    }
    setIsPlaying(false);
  };

  return (
    <div className="flex justify-center items-center min-h-[500px] p-5 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl m-5 shadow-2xl">
      <div className="bg-white p-8 rounded-xl max-w-2xl w-full shadow-xl transition-all duration-300">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent mb-2">
            Tone Generator
          </h2>
          <p className="text-gray-500 text-sm">
            Generate pure audio frequencies and waveforms
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Frequency (Hz)</label>
              <span className="text-sm text-purple-600 font-bold">{frequency} Hz</span>
            </div>
            <input 
              type="range" 
              min="20" 
              max="20000" 
              step="1" 
              value={frequency} 
              onChange={(e) => setFrequency(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <div className="mt-4 flex flex-wrap justify-between gap-2">
              <button onClick={() => setFrequency(256)} className="text-xs py-1.5 px-3 bg-purple-50 text-purple-600 rounded-full hover:bg-purple-100 font-medium transition-colors border border-purple-100">256 Hz</button>
              <button onClick={() => setFrequency(432)} className="text-xs py-1.5 px-3 bg-purple-50 text-purple-600 rounded-full hover:bg-purple-100 font-medium transition-colors border border-purple-100">432 Hz</button>
              <button onClick={() => setFrequency(440)} className="text-xs py-1.5 px-3 bg-purple-50 text-purple-600 rounded-full hover:bg-purple-100 font-medium transition-colors border border-purple-100">440 Hz</button>
              <button onClick={() => setFrequency(528)} className="text-xs py-1.5 px-3 bg-purple-50 text-purple-600 rounded-full hover:bg-purple-100 font-medium transition-colors border border-purple-100">528 Hz</button>
              <button onClick={() => setFrequency(1000)} className="text-xs py-1.5 px-3 bg-purple-50 text-purple-600 rounded-full hover:bg-purple-100 font-medium transition-colors border border-purple-100">1 kHz</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Waveform</label>
              <select 
                className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-purple-400 outline-none transition-colors text-gray-700 bg-white"
                value={waveform}
                onChange={(e) => setWaveform(e.target.value)}
              >
                <option value="sine">Sine</option>
                <option value="square">Square</option>
                <option value="sawtooth">Sawtooth</option>
                <option value="triangle">Triangle</option>
              </select>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Volume</label>
                <span className="text-sm text-purple-600 font-bold">{Math.round(volume * 100)}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                value={volume} 
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500 mt-3"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={handlePlay}
              disabled={isPlaying}
              className={`flex-1 py-4 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95 ${
                isPlaying 
                  ? 'bg-gray-400 cursor-not-allowed shadow-none' 
                  : 'bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-400 hover:to-purple-400 shadow-purple-500/30 hover:shadow-purple-500/50'
              }`}
            >
              {isPlaying ? 'Playing Tone...' : 'Play Tone'}
            </button>
            <button
              onClick={handleStop}
              disabled={!isPlaying}
              className={`px-8 py-4 rounded-xl font-bold transition-all transform active:scale-95 border-2 ${
                !isPlaying
                  ? 'bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed'
                  : 'bg-white text-rose-500 border-rose-200 hover:border-rose-500 hover:bg-rose-50 shadow-sm'
              }`}
            >
              Stop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToneGenerator;
