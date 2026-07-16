import React, { useState } from 'react';

const Calculator = () => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);

  const handleNumClick = (num) => {
    if (display === '0' || waitingForNewValue) {
      setDisplay(num);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOpClick = (op) => {
    if (operation && !waitingForNewValue) {
      calculate();
    } else {
      setPreviousValue(parseFloat(display));
    }
    setOperation(op);
    setWaitingForNewValue(true);
  };

  const calculate = () => {
    if (!operation || previousValue === null) return;
    const current = parseFloat(display);
    let result = 0;
    switch (operation) {
      case '+': result = previousValue + current; break;
      case '-': result = previousValue - current; break;
      case '×': result = previousValue * current; break;
      case '÷': result = previousValue / current; break;
      default: return;
    }
    // Limit to 8 decimal places and remove trailing zeros
    result = parseFloat(result.toFixed(8));
    setDisplay(String(result));
    setPreviousValue(result);
    setOperation(null);
    setWaitingForNewValue(true);
  };

  const handleClear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(false);
  };

  const handleEquals = () => {
    calculate();
  };

  const handleDecimal = () => {
    if (waitingForNewValue) {
      setDisplay('0.');
      setWaitingForNewValue(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handlePercentage = () => {
    const value = parseFloat(display) / 100;
    setDisplay(String(value));
    if (waitingForNewValue) {
        setPreviousValue(value);
    }
  };

  const renderButton = (label, onClick, className = "") => (
    <button
      onClick={onClick}
      className={`text-2xl font-semibold rounded-2xl flex items-center justify-center transition-all duration-200 transform hover:scale-[1.02] active:scale-95 shadow-md ${className}`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex justify-center items-center min-h-[400px] p-5 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl m-5 shadow-2xl font-sans">
      <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[2rem] max-w-sm w-full shadow-2xl border border-white/20">
        <h2 className="text-xl font-bold text-white/90 mb-6 text-center tracking-wider uppercase text-sm drop-shadow-md">
          Calculator
        </h2>
        
        {/* Display */}
        <div className="bg-white/20 p-5 rounded-2xl mb-8 text-right overflow-hidden shadow-inner border border-white/10 backdrop-blur-md flex flex-col justify-end min-h-[100px]">
          <div className="text-white/60 text-sm h-6 font-medium">
            {previousValue !== null ? `${previousValue} ${operation || ''}` : ''}
          </div>
          <div className="text-5xl text-white font-light tracking-tight truncate drop-shadow-sm">
            {display}
          </div>
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-4 gap-3">
          {renderButton('C', handleClear, 'col-span-2 bg-rose-400 text-white py-4 hover:bg-rose-500')}
          {renderButton('%', handlePercentage, 'bg-white/20 text-white py-4 hover:bg-white/30')}
          {renderButton('÷', () => handleOpClick('÷'), 'bg-indigo-500 text-white py-4 hover:bg-indigo-600 shadow-indigo-500/30')}

          {renderButton('7', () => handleNumClick('7'), 'bg-white/10 text-white py-4 hover:bg-white/20')}
          {renderButton('8', () => handleNumClick('8'), 'bg-white/10 text-white py-4 hover:bg-white/20')}
          {renderButton('9', () => handleNumClick('9'), 'bg-white/10 text-white py-4 hover:bg-white/20')}
          {renderButton('×', () => handleOpClick('×'), 'bg-indigo-500 text-white py-4 hover:bg-indigo-600 shadow-indigo-500/30')}

          {renderButton('4', () => handleNumClick('4'), 'bg-white/10 text-white py-4 hover:bg-white/20')}
          {renderButton('5', () => handleNumClick('5'), 'bg-white/10 text-white py-4 hover:bg-white/20')}
          {renderButton('6', () => handleNumClick('6'), 'bg-white/10 text-white py-4 hover:bg-white/20')}
          {renderButton('-', () => handleOpClick('-'), 'bg-indigo-500 text-white py-4 hover:bg-indigo-600 shadow-indigo-500/30')}

          {renderButton('1', () => handleNumClick('1'), 'bg-white/10 text-white py-4 hover:bg-white/20')}
          {renderButton('2', () => handleNumClick('2'), 'bg-white/10 text-white py-4 hover:bg-white/20')}
          {renderButton('3', () => handleNumClick('3'), 'bg-white/10 text-white py-4 hover:bg-white/20')}
          {renderButton('+', () => handleOpClick('+'), 'bg-indigo-500 text-white py-4 hover:bg-indigo-600 shadow-indigo-500/30')}

          {renderButton('0', () => handleNumClick('0'), 'col-span-2 bg-white/10 text-white py-4 hover:bg-white/20')}
          {renderButton('.', handleDecimal, 'bg-white/10 text-white py-4 hover:bg-white/20')}
          {renderButton('=', handleEquals, 'bg-pink-500 text-white py-4 hover:bg-pink-600 shadow-pink-500/30')}
        </div>
      </div>
    </div>
  );
};

export default Calculator;
