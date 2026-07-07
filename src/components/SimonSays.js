import React, { useState, useEffect, useRef } from 'react';

const COLORS = [
  { name: 'green', defaultClass: 'bg-green-500', activeClass: 'bg-green-300 shadow-[0_0_30px_rgba(74,222,128,1)]' },
  { name: 'red', defaultClass: 'bg-red-500', activeClass: 'bg-red-300 shadow-[0_0_30px_rgba(248,113,113,1)]' },
  { name: 'yellow', defaultClass: 'bg-yellow-400', activeClass: 'bg-yellow-200 shadow-[0_0_30px_rgba(250,204,21,1)]' },
  { name: 'blue', defaultClass: 'bg-blue-500', activeClass: 'bg-blue-300 shadow-[0_0_30px_rgba(96,165,250,1)]' }
];

const SimonSays = () => {
  const [sequence, setSequence] = useState([]);
  const [playerSequence, setPlayerSequence] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerTurn, setIsPlayerTurn] = useState(false);
  const [activeColor, setActiveColor] = useState(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const timeoutRef = useRef(null);

  // Play a beep using AudioContext instead of files to make it standalone
  const playSound = (index) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      
      const audioCtx = new AudioContext();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      const frequencies = [329.63, 261.63, 220.00, 164.81]; // E4, C4, A3, E3
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequencies[index], audioCtx.currentTime);
      
      gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.log('Audio not supported', e);
    }
  };

  const flashColor = async (index, duration = 400) => {
    playSound(index);
    setActiveColor(index);
    return new Promise(resolve => {
      setTimeout(() => {
        setActiveColor(null);
        setTimeout(resolve, 100); // slight pause between flashes
      }, duration);
    });
  };

  const playSequence = async (seq) => {
    setIsPlayerTurn(false);
    await new Promise(resolve => setTimeout(resolve, 500)); // wait before starting sequence
    for (let i = 0; i < seq.length; i++) {
      await flashColor(seq[i]);
    }
    setIsPlayerTurn(true);
  };

  const nextLevel = (currentSequence) => {
    const nextColor = Math.floor(Math.random() * 4);
    const newSequence = [...currentSequence, nextColor];
    setSequence(newSequence);
    setPlayerSequence([]);
    setScore(newSequence.length - 1);
    playSequence(newSequence);
  };

  const startGame = () => {
    setSequence([]);
    setPlayerSequence([]);
    setIsPlaying(true);
    setGameOver(false);
    setScore(0);
    nextLevel([]);
  };

  const handleColorClick = (index) => {
    if (!isPlaying || !isPlayerTurn) return;

    flashColor(index, 200);
    const newPlayerSequence = [...playerSequence, index];
    setPlayerSequence(newPlayerSequence);

    // Check if the current move is correct
    const currentMoveIndex = newPlayerSequence.length - 1;
    if (newPlayerSequence[currentMoveIndex] !== sequence[currentMoveIndex]) {
      // Wrong move
      handleGameOver();
      return;
    }

    // Check if level is complete
    if (newPlayerSequence.length === sequence.length) {
      setIsPlayerTurn(false);
      setTimeout(() => {
        nextLevel(sequence);
      }, 1000);
    }
  };

  const handleGameOver = () => {
    setIsPlaying(false);
    setGameOver(true);
    setIsPlayerTurn(false);
    if (score > highScore) {
      setHighScore(score);
    }
    // Play error sound
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      
      const audioCtx = new AudioContext();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(100, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(10, audioCtx.currentTime + 0.5);
      gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch(e) {}
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="flex justify-center items-center min-h-[500px] p-5 bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 rounded-2xl m-5 shadow-2xl">
      <div className="bg-gray-800 p-8 rounded-2xl max-w-md w-full shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-gray-700">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-black bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 bg-clip-text text-transparent mb-2 tracking-wider">
            SIMON SAYS
          </h2>
          <div className="flex justify-between items-center text-gray-400 text-sm font-bold uppercase tracking-widest px-4 mt-4">
            <div>Score: <span className="text-white text-lg">{score}</span></div>
            <div>Best: <span className="text-white text-lg">{highScore}</span></div>
          </div>
        </div>

        <div className="relative aspect-square max-w-[300px] mx-auto mb-8 rounded-full bg-gray-900 p-2 shadow-inner border-[8px] border-gray-700">
          <div className="grid grid-cols-2 grid-rows-2 h-full w-full gap-2 rounded-full overflow-hidden relative">
            {/* Center Circle */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gray-800 rounded-full z-10 flex flex-col justify-center items-center border-4 border-gray-900 shadow-xl">
              <div className={`w-3 h-3 rounded-full mb-1 ${isPlaying ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500'}`}></div>
              <span className="text-[10px] text-gray-400 font-bold tracking-widest">STATUS</span>
            </div>

            {COLORS.map((color, idx) => {
              // Apply border radius for each quadrant to maintain the circle shape
              let roundedClass = '';
              if (idx === 0) roundedClass = 'rounded-tl-full';
              if (idx === 1) roundedClass = 'rounded-tr-full';
              if (idx === 2) roundedClass = 'rounded-bl-full';
              if (idx === 3) roundedClass = 'rounded-br-full';

              const isActive = activeColor === idx;
              const isInteractable = isPlaying && isPlayerTurn;

              return (
                <button
                  key={color.name}
                  onClick={() => handleColorClick(idx)}
                  disabled={!isInteractable}
                  className={`
                    w-full h-full transition-all duration-100 outline-none
                    ${roundedClass}
                    ${isActive ? color.activeClass : color.defaultClass}
                    ${isInteractable ? 'hover:brightness-110 active:brightness-125 cursor-pointer' : 'cursor-default opacity-80'}
                  `}
                  aria-label={`${color.name} pad`}
                />
              );
            })}
          </div>
        </div>

        <div className="text-center">
          {!isPlaying ? (
            <button
              onClick={startGame}
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] transition-all transform active:scale-95 uppercase tracking-widest w-full max-w-[200px]"
            >
              {gameOver ? 'Play Again' : 'Start Game'}
            </button>
          ) : (
            <div className="h-14 flex items-center justify-center">
              <p className={`text-lg font-bold uppercase tracking-widest ${isPlayerTurn ? 'text-green-400 animate-pulse' : 'text-yellow-400'}`}>
                {isPlayerTurn ? 'Your Turn!' : 'Watch...'}
              </p>
            </div>
          )}
          {gameOver && (
            <p className="text-red-400 font-bold mt-4 animate-bounce uppercase tracking-widest">
              Game Over! Score: {score}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimonSays;
