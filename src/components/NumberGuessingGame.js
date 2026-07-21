import React, { useState, useEffect } from 'react';

const NumberGuessingGame = () => {
  const [targetNumber, setTargetNumber] = useState(0);
  const [guess, setGuess] = useState('');
  const [message, setMessage] = useState('Guess a number between 1 and 100!');
  const [attempts, setAttempts] = useState(0);
  const [hasWon, setHasWon] = useState(false);

  useEffect(() => {
    generateNewNumber();
  }, []);

  const generateNewNumber = () => {
    setTargetNumber(Math.floor(Math.random() * 100) + 1);
    setGuess('');
    setMessage('Guess a number between 1 and 100!');
    setAttempts(0);
    setHasWon(false);
  };

  const handleGuess = (e) => {
    e.preventDefault();
    if (hasWon) return;

    const numGuess = parseInt(guess, 10);
    if (isNaN(numGuess) || numGuess < 1 || numGuess > 100) {
      setMessage('Please enter a valid number between 1 and 100.');
      return;
    }

    setAttempts((prev) => prev + 1);

    if (numGuess === targetNumber) {
      setMessage(`Congratulations! You guessed it in ${attempts + 1} attempts!`);
      setHasWon(true);
    } else if (numGuess < targetNumber) {
      setMessage('Too low! Try a higher number.');
    } else {
      setMessage('Too high! Try a lower number.');
    }
    setGuess('');
  };

  return (
    <div className="flex justify-center items-center min-h-[400px] p-5 bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 rounded-2xl m-5 shadow-2xl">
      <div className="bg-white p-10 rounded-xl max-w-md w-full text-center shadow-xl">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
          Number Guesser
        </h2>

        <div className="mb-6 h-12 flex items-center justify-center">
          <p className={`text-lg font-semibold ${hasWon ? 'text-green-600' : 'text-gray-600'}`}>
            {message}
          </p>
        </div>

        {!hasWon ? (
          <form onSubmit={handleGuess} className="flex flex-col space-y-4 mb-6">
            <input
              type="number"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Enter your guess..."
              className="w-full px-4 py-3 rounded-lg border-2 border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-center text-lg text-gray-700 font-medium"
              min="1"
              max="100"
            />
            <button
              type="submit"
              className="w-full text-white border-none py-3 px-8 text-base font-semibold rounded-lg transition-all duration-300 uppercase tracking-wider bg-gradient-to-r from-purple-500 to-blue-500 cursor-pointer hover:shadow-lg hover:shadow-blue-400/50 hover:-translate-y-0.5 active:transform-none"
            >
              Submit Guess
            </button>
          </form>
        ) : (
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center shadow-lg border-4 border-green-600 mb-6 animate-bounce">
            <span className="text-white font-bold text-4xl">✓</span>
          </div>
        )}

        <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-100">
          <div className="text-left">
            <p className="text-sm text-gray-500 uppercase tracking-wide">Attempts</p>
            <p className="text-2xl font-bold text-gray-800">{attempts}</p>
          </div>
          
          <button
            className="text-gray-500 bg-transparent hover:bg-gray-100 border border-gray-300 py-2 px-6 text-sm font-semibold rounded-full cursor-pointer transition-all duration-300"
            onClick={generateNewNumber}
          >
            {hasWon ? 'Play Again' : 'Reset'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NumberGuessingGame;
