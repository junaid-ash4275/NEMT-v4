import React, { useState, useEffect, useRef } from 'react';

const SortingVisualizer = () => {
  const [array, setArray] = useState([]);
  const [arraySize, setArraySize] = useState(40);
  const [sortingSpeed, setSortingSpeed] = useState(30); // lower is faster
  const [algorithm, setAlgorithm] = useState('bubble');
  const [isSorting, setIsSorting] = useState(false);
  const [isSorted, setIsSorted] = useState(false);
  
  const containerRef = useRef(null);

  // Colors
  const PRIMARY_COLOR = 'rgba(139, 92, 246, 0.8)'; // Violet
  const COMPARE_COLOR = 'rgba(236, 72, 153, 0.9)'; // Pink
  const SWAP_COLOR = 'rgba(234, 179, 8, 0.9)'; // Yellow
  const SORTED_COLOR = 'rgba(16, 185, 129, 0.8)'; // Emerald

  useEffect(() => {
    resetArray();
  }, [arraySize]);

  const resetArray = () => {
    if (isSorting) return;
    const newArray = [];
    for (let i = 0; i < arraySize; i++) {
      newArray.push(randomIntFromInterval(10, 300));
    }
    setArray(newArray);
    setIsSorted(false);
    
    // Reset colors
    const arrayBars = document.getElementsByClassName('array-bar');
    for (let i = 0; i < arrayBars.length; i++) {
      arrayBars[i].style.backgroundColor = PRIMARY_COLOR;
    }
  };

  const randomIntFromInterval = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // --- ALGORITHMS ---

  const bubbleSort = async () => {
    let arr = [...array];
    const bars = document.getElementsByClassName('array-bar');
    
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr.length - i - 1; j++) {
        if (!bars[j] || !bars[j + 1]) break;

        // Compare
        bars[j].style.backgroundColor = COMPARE_COLOR;
        bars[j + 1].style.backgroundColor = COMPARE_COLOR;
        await sleep(sortingSpeed);

        if (arr[j] > arr[j + 1]) {
          // Swap
          bars[j].style.backgroundColor = SWAP_COLOR;
          bars[j + 1].style.backgroundColor = SWAP_COLOR;
          
          let temp = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = temp;
          
          setArray([...arr]);
          await sleep(sortingSpeed);
        }

        bars[j].style.backgroundColor = PRIMARY_COLOR;
        bars[j + 1].style.backgroundColor = PRIMARY_COLOR;
      }
      if (bars[arr.length - 1 - i]) {
        bars[arr.length - 1 - i].style.backgroundColor = SORTED_COLOR;
      }
    }
  };

  const selectionSort = async () => {
    let arr = [...array];
    const bars = document.getElementsByClassName('array-bar');
    
    for (let i = 0; i < arr.length; i++) {
      let minIdx = i;
      if (bars[i]) bars[i].style.backgroundColor = SWAP_COLOR;
      
      for (let j = i + 1; j < arr.length; j++) {
        if (bars[j]) bars[j].style.backgroundColor = COMPARE_COLOR;
        await sleep(sortingSpeed);
        
        if (arr[j] < arr[minIdx]) {
          if (minIdx !== i && bars[minIdx]) bars[minIdx].style.backgroundColor = PRIMARY_COLOR;
          minIdx = j;
          if (bars[minIdx]) bars[minIdx].style.backgroundColor = SWAP_COLOR;
        } else {
          if (bars[j]) bars[j].style.backgroundColor = PRIMARY_COLOR;
        }
      }
      
      if (minIdx !== i) {
        let temp = arr[i];
        arr[i] = arr[minIdx];
        arr[minIdx] = temp;
        setArray([...arr]);
        await sleep(sortingSpeed);
      }
      
      if (bars[minIdx] && minIdx !== i) bars[minIdx].style.backgroundColor = PRIMARY_COLOR;
      if (bars[i]) bars[i].style.backgroundColor = SORTED_COLOR;
    }
  };

  const insertionSort = async () => {
    let arr = [...array];
    const bars = document.getElementsByClassName('array-bar');
    
    if (bars[0]) bars[0].style.backgroundColor = SORTED_COLOR;

    for (let i = 1; i < arr.length; i++) {
      let key = arr[i];
      let j = i - 1;
      
      if (bars[i]) bars[i].style.backgroundColor = SWAP_COLOR;
      await sleep(sortingSpeed);

      while (j >= 0 && arr[j] > key) {
        if (bars[j]) bars[j].style.backgroundColor = COMPARE_COLOR;
        
        arr[j + 1] = arr[j];
        setArray([...arr]);
        await sleep(sortingSpeed);
        
        if (bars[j]) bars[j].style.backgroundColor = SORTED_COLOR;
        if (bars[j + 1]) bars[j + 1].style.backgroundColor = SORTED_COLOR;
        j = j - 1;
      }
      arr[j + 1] = key;
      setArray([...arr]);
      if (bars[j + 1]) bars[j + 1].style.backgroundColor = SORTED_COLOR;
      await sleep(sortingSpeed);
    }
    
    // Final pass to ensure everything is marked sorted
    for(let i=0; i<arr.length; i++){
        if (bars[i]) bars[i].style.backgroundColor = SORTED_COLOR;
    }
  };

  const startSorting = async () => {
    if (isSorting || isSorted) return;
    setIsSorting(true);

    if (algorithm === 'bubble') await bubbleSort();
    else if (algorithm === 'selection') await selectionSort();
    else if (algorithm === 'insertion') await insertionSort();

    setIsSorting(false);
    setIsSorted(true);
  };

  return (
    <div className="flex justify-center items-center min-h-[600px] p-5 bg-gradient-to-br from-indigo-950 via-purple-900 to-violet-950 rounded-2xl m-5 shadow-2xl transition-all duration-300">
      <div className="bg-white/10 backdrop-blur-md p-8 rounded-xl max-w-5xl w-full shadow-2xl border border-white/10 flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8 border-b border-white/20 pb-4">
          <div>
            <h2 className="text-3xl font-black bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent drop-shadow-sm">
              Algorithm Visualizer
            </h2>
            <p className="text-violet-300/80 text-xs font-bold uppercase tracking-widest mt-1">Sorting Engine Mechanics</p>
          </div>
          <div className="bg-white/10 p-3 rounded-full animate-pulse text-pink-400 border border-white/10">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 12h10"/><path d="M15 18h6"/><path d="M3 6h18"/><path d="M3 12h4"/><path d="M3 18h8"/></svg>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 bg-black/20 p-4 rounded-xl border border-white/5">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-violet-300 uppercase tracking-widest">Algorithm</label>
            <select
              disabled={isSorting}
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
              className="bg-white/10 border border-white/20 text-white text-sm rounded-lg focus:ring-pink-500 focus:border-pink-500 block w-full p-2.5 outline-none disabled:opacity-50"
            >
              <option value="bubble" className="text-black">Bubble Sort</option>
              <option value="selection" className="text-black">Selection Sort</option>
              <option value="insertion" className="text-black">Insertion Sort</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <label className="text-[10px] font-black text-violet-300 uppercase tracking-widest">Array Size</label>
              <span className="text-xs font-bold text-pink-400">{arraySize}</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              disabled={isSorting}
              value={arraySize}
              onChange={(e) => setArraySize(e.target.value)}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-pink-500 disabled:opacity-50"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <label className="text-[10px] font-black text-violet-300 uppercase tracking-widest">Speed</label>
              <span className="text-xs font-bold text-pink-400">{101 - sortingSpeed}</span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              disabled={isSorting}
              value={101 - sortingSpeed} // Invert slider for better UX (higher = faster)
              onChange={(e) => setSortingSpeed(101 - e.target.value)}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-pink-500 disabled:opacity-50"
            />
          </div>

          <div className="flex gap-2 items-end">
            <button
              onClick={resetArray}
              disabled={isSorting}
              className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg transition-all border border-white/20 disabled:opacity-50 text-sm uppercase tracking-wider"
            >
              Reset
            </button>
            <button
              onClick={startSorting}
              disabled={isSorting || isSorted}
              className="flex-1 py-2.5 bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white font-black rounded-lg transition-all shadow-lg shadow-pink-500/30 disabled:opacity-50 text-sm uppercase tracking-wider"
            >
              Sort!
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-4 mb-4 justify-center">
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{backgroundColor: PRIMARY_COLOR}}></div>
                <span className="text-[10px] font-bold text-gray-400 uppercase">Unsorted</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{backgroundColor: COMPARE_COLOR}}></div>
                <span className="text-[10px] font-bold text-gray-400 uppercase">Comparing</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{backgroundColor: SWAP_COLOR}}></div>
                <span className="text-[10px] font-bold text-gray-400 uppercase">Swapping/Key</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{backgroundColor: SORTED_COLOR}}></div>
                <span className="text-[10px] font-bold text-gray-400 uppercase">Sorted</span>
            </div>
        </div>

        {/* Visualizer Canvas Area */}
        <div 
          ref={containerRef}
          className="flex-1 bg-black/40 rounded-xl border border-white/10 p-4 flex items-end justify-center gap-[1px] min-h-[350px] overflow-hidden"
        >
          {array.map((value, idx) => (
            <div
              key={idx}
              className="array-bar rounded-t-sm transition-all duration-75"
              style={{
                height: `${value}px`,
                width: `${Math.max(2, 600 / arraySize)}px`,
                backgroundColor: isSorted ? SORTED_COLOR : PRIMARY_COLOR,
              }}
              title={`${value}`}
            ></div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default SortingVisualizer;
