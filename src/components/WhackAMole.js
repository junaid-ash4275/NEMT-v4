import React, { useState, useEffect } from "react";

const WhackAMole = () => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [activeMole, setActiveMole] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const gamepad = Array(9).fill(null);

  useEffect(() => {
    let moleTimer;
    let countdownTimer;

    if (isPlaying && timeLeft > 0) {
      moleTimer = setInterval(() => {
        const randomHole = Math.floor(Math.random() * 9);
        setActiveMole(randomHole);
      }, 800);

      countdownTimer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsPlaying(false);
      setActiveMole(null);
    }

    return () => {
      clearInterval(moleTimer);
      clearInterval(countdownTimer);
    };
  }, [isPlaying, timeLeft]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setIsPlaying(true);
    setActiveMole(null);
  };

  const whackMole = (index) => {
    if (index === activeMole && isPlaying) {
      setScore((prev) => prev + 1);
      setActiveMole(null); // Hide mole after hit
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[400px] p-5 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-2xl m-5 shadow-2xl">
      <div className="bg-white p-8 rounded-xl max-w-md w-full text-center shadow-xl">
        <h2 className="text-3xl font-bold text-gray-800 mb-2 bg-gradient-to-r from-amber-500 to-red-500 bg-clip-text text-transparent">
          Whack-A-Mole
        </h2>
        
        <div className="flex justify-between items-center mb-6 px-4">
          <div className="text-xl font-bold text-gray-700">
            Score: <span className="text-orange-500">{score}</span>
          </div>
          <div className="text-xl font-bold text-gray-700">
            Time: <span className={timeLeft <= 5 && timeLeft > 0 ? "text-red-500" : "text-amber-500"}>{timeLeft}s</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8 bg-orange-50 p-4 rounded-xl border-2 border-orange-100">
          {gamepad.map((_, index) => (
            <div
              key={index}
              onClick={() => whackMole(index)}
              className={`h-24 w-full rounded-xl cursor-pointer transition-all duration-100 flex justify-center items-center text-5xl shadow-inner border-b-4 ${
                activeMole === index
                  ? "bg-amber-700 border-amber-900 transform scale-95"
                  : "bg-orange-300 border-orange-400 hover:bg-orange-400"
              }`}
            >
              {activeMole === index ? "🐹" : ""}
            </div>
          ))}
        </div>

        <button
          className={`py-3 px-8 text-lg font-semibold rounded-full cursor-pointer transition-all duration-300 uppercase tracking-wider transform hover:-translate-y-0.5 hover:shadow-lg active:transform-none text-white w-full ${
            isPlaying
              ? "bg-gray-400 cursor-not-allowed hover:shadow-none hover:transform-none"
              : "bg-gradient-to-r from-amber-500 to-red-500 hover:shadow-red-400/50"
          }`}
          onClick={startGame}
          disabled={isPlaying}
        >
          {timeLeft === 0 && score > 0 ? "Play Again" : isPlaying ? "Game in Progress" : "Start Game"}
        </button>
      </div>
    </div>
  );
};

export default WhackAMole;
