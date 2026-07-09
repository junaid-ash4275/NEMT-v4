import React, { useState, useCallback, useRef } from 'react';

const numRows = 20;
const numCols = 20;

const operations = [
  [0, 1], [0, -1], [1, -1], [-1, 1], [1, 1], [-1, -1], [1, 0], [-1, 0]
];

const generateEmptyGrid = () => {
  const rows = [];
  for (let i = 0; i < numRows; i++) {
    rows.push(Array.from(Array(numCols), () => 0));
  }
  return rows;
};

const ConwaysGameOfLife = () => {
  const [grid, setGrid] = useState(() => generateEmptyGrid());
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(200);

  const runningRef = useRef(running);
  runningRef.current = running;
  
  const speedRef = useRef(speed);
  speedRef.current = speed;

  const runSimulation = useCallback(() => {
    if (!runningRef.current) {
      return;
    }

    setGrid((g) => {
      const nextGrid = g.map((rowArr, i) => 
        rowArr.map((colVal, j) => {
          let neighbors = 0;
          operations.forEach(([x, y]) => {
            const newI = i + x;
            const newJ = j + y;
            if (newI >= 0 && newI < numRows && newJ >= 0 && newJ < numCols) {
              neighbors += g[newI][newJ];
            }
          });

          if (neighbors < 2 || neighbors > 3) {
            return 0;
          } else if (g[i][j] === 0 && neighbors === 3) {
            return 1;
          }
          return g[i][j];
        })
      );
      return nextGrid;
    });

    setTimeout(runSimulation, speedRef.current);
  }, []);

  return (
    <div className="flex justify-center items-center min-h-[500px] p-5 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl m-5 shadow-2xl">
      <div className="bg-white p-8 rounded-xl max-w-xl w-full shadow-xl transition-all duration-300">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent mb-2">
            Conway's Game of Life
          </h2>
          <p className="text-gray-500 text-sm">
            Cellular automaton simulation
          </p>
        </div>

        <div className="flex justify-center mb-6">
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: `repeat(${numCols}, minmax(0, 1fr))` 
            }}
            className="border border-gray-200 bg-gray-100 rounded-lg overflow-hidden w-full aspect-square shadow-inner"
          >
            {grid.map((rows, i) =>
              rows.map((col, j) => (
                <div
                  key={`${i}-${j}`}
                  onClick={() => {
                    if (running) return;
                    const newGrid = JSON.parse(JSON.stringify(grid));
                    newGrid[i][j] = grid[i][j] ? 0 : 1;
                    setGrid(newGrid);
                  }}
                  className={`w-full h-full border-[0.5px] border-gray-200 transition-colors duration-150 ${
                    grid[i][j] ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] z-10' : 'bg-white hover:bg-emerald-50 cursor-pointer'
                  }`}
                />
              ))
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 pt-4 justify-center">
          <button
            onClick={() => {
              setRunning(!running);
              if (!running) {
                runningRef.current = true;
                runSimulation();
              }
            }}
            className={`px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95 ${
              running 
                ? 'bg-rose-500 hover:bg-rose-400 shadow-rose-500/30' 
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-emerald-500/30'
            }`}
          >
            {running ? 'Stop' : 'Start'}
          </button>
          
          <button
            onClick={() => {
              const rows = [];
              for (let i = 0; i < numRows; i++) {
                rows.push(Array.from(Array(numCols), () => (Math.random() > 0.7 ? 1 : 0)));
              }
              setGrid(rows);
            }}
            disabled={running}
            className={`px-6 py-3 rounded-xl font-bold transition-all transform active:scale-95 border-2 ${
              running
                ? 'bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed'
                : 'bg-white text-teal-600 border-teal-200 hover:border-teal-500 hover:bg-teal-50 shadow-sm'
            }`}
          >
            Randomize
          </button>

          <button
            onClick={() => setGrid(generateEmptyGrid())}
            disabled={running}
            className={`px-6 py-3 rounded-xl font-bold transition-all transform active:scale-95 border-2 ${
              running
                ? 'bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-500 hover:bg-gray-50 shadow-sm'
            }`}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConwaysGameOfLife;
