import React, { useState } from 'react';

const CHOICES = [
  { name: 'rock', emoji: '🪨', beats: 'scissors' },
  { name: 'paper', emoji: '📄', beats: 'rock' },
  { name: 'scissors', emoji: '✂️', beats: 'paper' }
];

const RockPaperScissors = () => {
  const [playerChoice, setPlayerChoice] = useState(null);
  const [computerChoice, setComputerChoice] = useState(null);
  const [result, setResult] = useState('');
  const [score, setScore] = useState({ player: 0, computer: 0, ties: 0 });
  const [isAnimating, setIsAnimating] = useState(false);

  const getComputerChoice = () => CHOICES[Math.floor(Math.random() * CHOICES.length)];

  const determineWinner = (player, computer) => {
    if (player.name === computer.name) return 'draw';
    if (player.beats === computer.name) return 'player';
    return 'computer';
  };

  const playGame = (choice) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setPlayerChoice(null);
    setComputerChoice(null);
    setResult('');

    // Simulate animation delay
    setTimeout(() => {
      const compChoice = getComputerChoice();
      setPlayerChoice(choice);
      setComputerChoice(compChoice);

      const winner = determineWinner(choice, compChoice);
      
      if (winner === 'draw') {
        setResult("It's a Draw!");
        setScore(s => ({ ...s, ties: s.ties + 1 }));
      } else if (winner === 'player') {
        setResult('You Win! 🎉');
        setScore(s => ({ ...s, player: s.player + 1 }));
      } else {
        setResult('Computer Wins! 😢');
        setScore(s => ({ ...s, computer: s.computer + 1 }));
      }
      setIsAnimating(false);
    }, 600);
  };

  const resetGame = () => {
    setPlayerChoice(null);
    setComputerChoice(null);
    setResult('');
    setScore({ player: 0, computer: 0, ties: 0 });
  };

  return (
    <div className="flex justify-center items-center min-h-[500px] p-5 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl m-5 shadow-2xl">
      <div className="bg-white p-8 rounded-xl max-w-md w-full text-center shadow-xl">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">
          Rock Paper Scissors
        </h2>

        {/* Scoreboard */}
        <div className="flex justify-between items-center bg-gray-50 rounded-lg p-4 mb-8 border border-gray-100 shadow-inner">
          <div className="text-center">
            <p className="text-sm text-gray-500 font-semibold uppercase">You</p>
            <p className="text-2xl font-bold text-emerald-600">{score.player}</p>
          </div>
          <div className="text-center px-4 border-x border-gray-200">
            <p className="text-xs text-gray-400 font-semibold uppercase">Ties</p>
            <p className="text-lg font-bold text-gray-500">{score.ties}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 font-semibold uppercase">Comp</p>
            <p className="text-2xl font-bold text-cyan-600">{score.computer}</p>
          </div>
        </div>

        {/* Game Arena */}
        <div className="flex justify-between items-center mb-8 h-32 px-4">
          <div className="flex flex-col items-center w-24">
            <span className="text-sm font-medium text-gray-500 mb-2">You</span>
            <div className={`text-5xl transition-all duration-300 ${isAnimating ? 'animate-bounce' : ''}`}>
              {playerChoice ? playerChoice.emoji : '❓'}
            </div>
          </div>
          
          <div className="text-2xl font-bold text-gray-300">VS</div>
          
          <div className="flex flex-col items-center w-24">
            <span className="text-sm font-medium text-gray-500 mb-2">Computer</span>
            <div className={`text-5xl transition-all duration-300 ${isAnimating ? 'animate-bounce' : ''}`}>
              {computerChoice ? computerChoice.emoji : '❓'}
            </div>
          </div>
        </div>

        {/* Result */}
        <div className="h-10 mb-6 flex items-center justify-center">
          <p className={`text-xl font-bold transition-all duration-300 ${result.includes('Win') ? 'text-emerald-500 scale-110' : result.includes('Computer') ? 'text-cyan-600' : 'text-gray-600'}`}>
            {isAnimating ? 'Choosing...' : result}
          </p>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mb-8">
          {CHOICES.map(choice => (
            <button
              key={choice.name}
              onClick={() => playGame(choice)}
              disabled={isAnimating}
              className="w-16 h-16 bg-gray-50 border-2 border-emerald-100 rounded-xl text-3xl flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-emerald-50 hover:border-emerald-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
              title={choice.name}
            >
              {choice.emoji}
            </button>
          ))}
        </div>

        {score.player > 0 || score.computer > 0 || score.ties > 0 ? (
          <button
            onClick={resetGame}
            className="bg-gray-100 text-gray-600 hover:bg-gray-200 border-none py-2 px-6 text-sm font-semibold rounded-full cursor-pointer transition-all duration-300 uppercase tracking-wider"
          >
            Reset Score
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default RockPaperScissors;
