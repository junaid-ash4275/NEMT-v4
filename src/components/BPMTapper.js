import React, { useState, useEffect, useCallback } from 'react';

const BPMTapper = () => {
  const [taps, setTaps] = useState([]);
  const [bpm, setBpm] = useState(0);

  const handleTap = useCallback(() => {
    const now = Date.now();
    setTaps((prevTaps) => {
      // Keep only taps from the last 3 seconds to ensure current tempo
      const recentTaps = prevTaps.filter((tap) => now - tap < 3000);
      const newTaps = [...recentTaps, now];
      
      if (newTaps.length > 1) {
        // Calculate intervals between consecutive taps
        const intervals = [];
        for (let i = 1; i < newTaps.length; i++) {
          intervals.push(newTaps[i] - newTaps[i - 1]);
        }
        
        // Calculate average interval
        const averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
        
        // Convert to BPM (60000 ms per minute)
        const calculatedBpm = Math.round(60000 / averageInterval);
        setBpm(calculatedBpm);
      }
      
      return newTaps;
    });
  }, []);

  const handleReset = () => {
    setTaps([]);
    setBpm(0);
  };

  // Keyboard support for tapping
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault(); // Prevent scrolling
        handleTap();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTap]);

  // Auto-reset if no taps for 3 seconds
  useEffect(() => {
    if (taps.length === 0) return;
    
    const timeoutId = setTimeout(() => {
      setTaps([]);
      // We keep the last BPM displayed for reference, 
      // instead of resetting it to 0 immediately when tapping stops
    }, 3000);
    
    return () => clearTimeout(timeoutId);
  }, [taps]);

  return (
    <div className="flex justify-center items-center min-h-[500px] p-5 bg-gradient-to-br from-teal-400 via-emerald-500 to-green-500 rounded-2xl m-5 shadow-2xl">
      <div className="bg-white p-8 rounded-xl max-w-md w-full shadow-xl transition-all duration-300">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-green-500 bg-clip-text text-transparent mb-2">
            BPM Tapper
          </h2>
          <p className="text-gray-500 text-sm">
            Tap the button or press Spacebar to find the tempo
          </p>
        </div>

        <div className="space-y-8 text-center">
          <div className="relative w-48 h-48 mx-auto">
            {/* Ripple effect rings */}
            {taps.length > 0 && (
              <>
                <div className="absolute inset-0 border-4 border-emerald-200 rounded-full animate-ping opacity-75"></div>
                <div className="absolute inset-2 border-4 border-teal-200 rounded-full animate-ping opacity-50" style={{ animationDelay: '150ms' }}></div>
              </>
            )}
            
            <button
              onClick={handleTap}
              className="relative w-full h-full rounded-full font-bold text-2xl text-white shadow-xl transition-transform transform active:scale-90 bg-gradient-to-br from-teal-400 to-green-500 hover:from-teal-500 hover:to-green-600 focus:outline-none flex flex-col justify-center items-center z-10"
            >
              <span className="uppercase tracking-widest text-sm opacity-80 mb-1">Tap</span>
              <span className="text-5xl font-black">{bpm || '---'}</span>
              <span className="text-xs opacity-75 mt-1">BPM</span>
            </button>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleReset}
              className="px-8 py-3 rounded-xl font-bold transition-all transform active:scale-95 border-2 bg-white text-emerald-500 border-emerald-200 hover:border-emerald-500 hover:bg-emerald-50 shadow-sm"
            >
              Reset
            </button>
          </div>

          <div className="text-xs text-gray-400 mt-6 pt-4 border-t border-gray-100">
            Taps will auto-reset after 3 seconds of inactivity
          </div>
        </div>
      </div>
    </div>
  );
};

export default BPMTapper;
