import React, { useState, useEffect } from "react";

const SpeedClicker = () => {
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highScore, setHighScore] = useState(0);

  const duration = 10;

  useEffect(() => {
    let timer;
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isPlaying) {
      setIsPlaying(false);
      if (clicks > highScore) {
        setHighScore(clicks);
      }
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft, clicks, highScore]);

  const startGame = () => {
    setClicks(0);
    setTimeLeft(duration);
    setIsPlaying(true);
  };

  const handleClick = () => {
    if (isPlaying && timeLeft > 0) {
      setClicks((prev) => prev + 1);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[400px] p-5 bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 rounded-2xl m-5 shadow-2xl">
      <div className="bg-white p-8 rounded-xl max-w-md w-full text-center shadow-xl">
        <h2 className="text-3xl font-bold text-gray-800 mb-2 bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent">
          Speed Clicker
        </h2>
        
        <div className="flex justify-between items-center mb-6 px-4">
          <div className="text-xl font-bold text-gray-700">
            Clicks: <span className="text-indigo-500">{clicks}</span>
          </div>
          <div className="text-xl font-bold text-gray-700">
            Time: <span className={timeLeft <= 3 && timeLeft > 0 ? "text-red-500" : "text-pink-500"}>{timeLeft}s</span>
          </div>
        </div>

        <div className="mb-6 flex justify-between px-4">
          <p className="text-sm text-gray-500 font-semibold">High Score: {highScore}</p>
          <p className="text-sm text-gray-500 font-semibold">
            CPS: {clicks > 0 && duration - timeLeft > 0 ? (clicks / (duration - timeLeft)).toFixed(1) : 0}
          </p>
        </div>

        <button
          className={`py-12 px-8 text-2xl font-bold rounded-2xl cursor-pointer transition-all duration-100 uppercase tracking-wider text-white w-full shadow-lg ${
            !isPlaying && timeLeft === 0 && clicks > 0
              ? "bg-gray-300 hover:bg-gray-400 cursor-not-allowed shadow-none" 
              : isPlaying
              ? "bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 transform active:scale-95 active:shadow-inner"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
          onClick={handleClick}
          disabled={!isPlaying}
        >
          {isPlaying ? "CLICK ME!" : "Waiting..."}
        </button>

        <button
          className={`mt-6 py-3 px-8 text-lg font-semibold rounded-full cursor-pointer transition-all duration-300 uppercase tracking-wider transform hover:-translate-y-0.5 hover:shadow-lg active:transform-none text-white w-full ${
            isPlaying
              ? "bg-gray-400 cursor-not-allowed hover:shadow-none hover:transform-none"
              : "bg-gradient-to-r from-indigo-500 to-pink-500 hover:shadow-pink-400/50"
          }`}
          onClick={startGame}
          disabled={isPlaying}
        >
          {timeLeft === 0 && clicks > 0 ? "Play Again" : "Start Game"}
        </button>
      </div>
    </div>
  );
};

export default SpeedClicker;
