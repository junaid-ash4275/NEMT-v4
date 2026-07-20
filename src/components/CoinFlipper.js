import React, { useState } from 'react';

const CoinFlipper = () => {
  const [result, setResult] = useState(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [headsCount, setHeadsCount] = useState(0);
  const [tailsCount, setTailsCount] = useState(0);

  const flipCoin = () => {
    if (isFlipping) return;
    
    setIsFlipping(true);
    setResult(null);

    // Simulate flipping time
    setTimeout(() => {
      const isHeads = Math.random() < 0.5;
      if (isHeads) {
        setResult('Heads');
        setHeadsCount(prev => prev + 1);
      } else {
        setResult('Tails');
        setTailsCount(prev => prev + 1);
      }
      setIsFlipping(false);
    }, 1000);
  };

  const resetStats = () => {
    setResult(null);
    setHeadsCount(0);
    setTailsCount(0);
  };

  return (
    <div className="flex justify-center items-center min-h-[400px] p-5 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-2xl m-5 shadow-2xl">
      <div className="bg-white p-10 rounded-xl max-w-md w-full text-center shadow-xl">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 bg-gradient-to-r from-yellow-500 to-red-500 bg-clip-text text-transparent">
          Coin Flipper
        </h2>

        <div className="flex justify-center mb-8 h-32 items-center">
          {isFlipping ? (
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-yellow-300 to-yellow-500 animate-spin flex items-center justify-center shadow-lg border-4 border-yellow-600">
              <span className="text-white font-bold text-xl">?</span>
            </div>
          ) : result ? (
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-yellow-300 to-yellow-500 flex items-center justify-center shadow-lg border-4 border-yellow-600 transition-transform transform hover:scale-110">
              <span className="text-white font-bold text-2xl">{result === 'Heads' ? 'H' : 'T'}</span>
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center shadow-inner border-4 border-gray-300">
              <span className="text-gray-400 font-bold text-xl">Ready</span>
            </div>
          )}
        </div>

        <div className="mb-6 h-8">
          {result ? (
            <div className="text-2xl font-bold text-gray-700">
              It's <span className="text-orange-500">{result}</span>!
            </div>
          ) : (
            <div className="text-lg font-medium text-gray-500">
              Click flip to start
            </div>
          )}
        </div>

        <div className="flex justify-center space-x-4 mb-6">
          <div className="text-center">
            <p className="text-sm text-gray-500 uppercase tracking-wide">Heads</p>
            <p className="text-xl font-bold text-gray-800">{headsCount}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 uppercase tracking-wide">Tails</p>
            <p className="text-xl font-bold text-gray-800">{tailsCount}</p>
          </div>
        </div>

        <div className="flex flex-col space-y-3">
          <button
            className={`text-white border-none py-3 px-8 text-base font-semibold rounded-full transition-all duration-300 uppercase tracking-wider ${isFlipping ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-yellow-500 to-orange-500 cursor-pointer hover:transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-400/50 active:transform-none'}`}
            onClick={flipCoin}
            disabled={isFlipping}
          >
            {isFlipping ? 'Flipping...' : 'Flip Coin'}
          </button>
          
          {(headsCount > 0 || tailsCount > 0) && (
             <button
              className="text-gray-500 bg-transparent hover:bg-gray-100 border border-gray-300 py-2 px-6 text-sm font-semibold rounded-full cursor-pointer transition-all duration-300"
              onClick={resetStats}
              disabled={isFlipping}
            >
              Reset Stats
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoinFlipper;
