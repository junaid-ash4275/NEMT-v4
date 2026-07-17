import React, { useState, useEffect, useCallback, useRef } from 'react';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const INITIAL_SPEED = 150;

const SnakeGame = () => {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const directionRef = useRef(direction);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  const generateFood = useCallback((currentSnake) => {
    let newFood;
    let isOccupied = true;
    while (isOccupied) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      isOccupied = currentSnake.some((segment) => segment.x === newFood.x && segment.y === newFood.y);
    }
    return newFood;
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    setFood(generateFood(INITIAL_SNAKE));
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
      
      const currentDir = directionRef.current;
      switch (e.key) {
        case 'ArrowUp':
          if (currentDir.y !== 1) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (currentDir.y !== -1) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (currentDir.x !== 1) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (currentDir.x !== -1) setDirection({ x: 1, y: 0 });
          break;
        case ' ':
          setIsPaused((prev) => !prev);
          e.preventDefault();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (gameOver || isPaused) return;

    const moveSnake = () => {
      setSnake((prevSnake) => {
        const newSnake = [...prevSnake];
        const head = { ...newSnake[0] };

        head.x += directionRef.current.x;
        head.y += directionRef.current.y;

        // Collision with walls
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          setGameOver(true);
          return prevSnake;
        }

        // Collision with self
        if (newSnake.some((segment) => segment.x === head.x && segment.y === head.y)) {
          setGameOver(true);
          return prevSnake;
        }

        newSnake.unshift(head);

        // Check if food eaten
        if (head.x === food.x && head.y === food.y) {
          setScore((s) => {
            const newScore = s + 10;
            if (newScore > highScore) setHighScore(newScore);
            return newScore;
          });
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const speed = Math.max(50, INITIAL_SPEED - Math.floor(score / 50) * 10);
    const intervalId = setInterval(moveSnake, speed);
    return () => clearInterval(intervalId);
  }, [direction, food, gameOver, isPaused, score, highScore, generateFood]);

  return (
    <div className="flex justify-center items-center min-h-[500px] p-5 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 rounded-2xl m-5 shadow-2xl font-sans">
      <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[2rem] max-w-md w-full shadow-2xl border border-white/20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white tracking-wider drop-shadow-md">
            🐍 Classic Snake
          </h2>
          <div className="text-right">
            <div className="text-white/80 text-sm font-semibold">Score: {score}</div>
            <div className="text-white/60 text-xs">High: {highScore}</div>
          </div>
        </div>

        <div className="relative bg-black/40 rounded-xl overflow-hidden aspect-square border-2 border-white/20 shadow-inner">
          {gameOver && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col justify-center items-center z-10">
              <h3 className="text-3xl font-bold text-red-400 mb-2 drop-shadow-md">Game Over!</h3>
              <p className="text-white/80 mb-6">Final Score: {score}</p>
              <button
                onClick={resetGame}
                className="px-6 py-2 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-white rounded-full font-bold shadow-lg transform transition-all hover:scale-105 active:scale-95"
              >
                Play Again
              </button>
            </div>
          )}
          
          {isPaused && !gameOver && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col justify-center items-center z-10">
              <h3 className="text-3xl font-bold text-white mb-2 drop-shadow-md">Paused</h3>
              <p className="text-white/80">Press Space to Resume</p>
            </div>
          )}

          <div
            className="w-full h-full grid"
            style={{
              gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
              gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
            }}
          >
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
              const x = i % GRID_SIZE;
              const y = Math.floor(i / GRID_SIZE);
              const isSnakeHead = snake[0].x === x && snake[0].y === y;
              const isSnakeBody = snake.some((segment, idx) => idx !== 0 && segment.x === x && segment.y === y);
              const isFood = food.x === x && food.y === y;

              return (
                <div
                  key={i}
                  className={`w-full h-full border border-white/5 ${
                    isSnakeHead
                      ? 'bg-emerald-400 rounded-sm scale-110 shadow-[0_0_10px_rgba(52,211,153,0.8)] z-10 relative'
                      : isSnakeBody
                      ? 'bg-emerald-500/80 rounded-sm scale-95'
                      : isFood
                      ? 'bg-rose-500 rounded-full scale-75 shadow-[0_0_10px_rgba(244,63,94,0.8)] animate-pulse'
                      : ''
                  }`}
                />
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex justify-between items-center text-white/70 text-sm">
          <div>Use Arrow Keys to Move</div>
          <div>Space to Pause</div>
        </div>
      </div>
    </div>
  );
};

export default SnakeGame;
