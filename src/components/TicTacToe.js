import React, { useState } from 'react';

const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState(null);

  const checkWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
      [0, 4, 8], [2, 4, 6]             // diagonals
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const handleClick = (index) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);

    const win = checkWinner(newBoard);
    if (win) {
      setWinner(win);
    } else if (!newBoard.includes(null)) {
      setWinner('Draw');
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
  };

  const renderSquare = (index) => (
    <button
      key={index}
      className="w-20 h-20 bg-gray-50 border-2 border-indigo-100 rounded-xl text-4xl font-bold flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-indigo-50 hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
      onClick={() => handleClick(index)}
    >
      <span className={board[index] === 'X' ? 'text-indigo-500' : 'text-pink-500'}>
        {board[index]}
      </span>
    </button>
  );

  return (
    <div className="flex justify-center items-center min-h-[400px] p-5 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl m-5 shadow-2xl">
      <div className="bg-white p-10 rounded-xl max-w-md w-full text-center shadow-xl">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent">
          Tic Tac Toe
        </h2>

        <div className="grid grid-cols-3 gap-3 mb-8 w-fit mx-auto">
          {board.map((_, index) => renderSquare(index))}
        </div>

        <div className="mb-6 h-8">
          {winner ? (
            <div className="text-xl font-bold text-gray-700">
              {winner === 'Draw' ? "It's a Draw!" : `Winner: ${winner}`}
            </div>
          ) : (
            <div className="text-lg font-medium text-gray-600">
              Next Player: <span className={isXNext ? 'text-indigo-500 font-bold' : 'text-pink-500 font-bold'}>{isXNext ? 'X' : 'O'}</span>
            </div>
          )}
        </div>

        <button
          className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-none py-3 px-8 text-base font-semibold rounded-full cursor-pointer transition-all duration-300 uppercase tracking-wider hover:transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-400/50 active:transform-none"
          onClick={resetGame}
        >
          {winner ? 'Play Again' : 'Reset Game'}
        </button>
      </div>
    </div>
  );
};

export default TicTacToe;
