import React, { useState, useEffect } from 'react';

const LoanCalculator = () => {
  // State for inputs
  const [loanAmount, setLoanAmount] = useState(250000);
  const [interestRate, setInterestRate] = useState(5.5);
  const [loanTerm, setLoanTerm] = useState(30);
  const [termUnit, setTermUnit] = useState('years');

  // Result states
  const [results, setResults] = useState({
    monthlyPayment: 0,
    totalPayment: 0,
    totalInterest: 0,
    principalPercent: 0,
    interestPercent: 0
  });

  // History state
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load history on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('loanHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Perform calculation whenever inputs change
  useEffect(() => {
    calculateResults();
  }, [loanAmount, interestRate, loanTerm, termUnit]);

  const calculateResults = () => {
    const P = parseFloat(loanAmount) || 0;
    const annualRate = parseFloat(interestRate) || 0;
    const r = annualRate / 100 / 12;
    const n = termUnit === 'years' ? (parseFloat(loanTerm) || 0) * 12 : parseFloat(loanTerm) || 0;

    if (P === 0 || n === 0) {
      setResults({
        monthlyPayment: 0,
        totalPayment: 0,
        totalInterest: 0,
        principalPercent: 0,
        interestPercent: 0
      });
      return;
    }

    let monthlyPayment = 0;
    if (r === 0) {
      monthlyPayment = P / n;
    } else {
      monthlyPayment = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }

    const totalPayment = monthlyPayment * n;
    const totalInterest = totalPayment - P;
    const principalPercent = (P / totalPayment) * 100;
    const interestPercent = (totalInterest / totalPayment) * 100;

    setResults({
      monthlyPayment: monthlyPayment.toFixed(2),
      totalPayment: Math.round(totalPayment),
      totalInterest: Math.round(totalInterest),
      principalPercent: principalPercent.toFixed(1),
      interestPercent: interestPercent.toFixed(1)
    });
  };

  const saveToHistory = () => {
    const newEntry = {
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      monthlyPayment: results.monthlyPayment,
      totalPayment: results.totalPayment,
      amount: loanAmount,
      rate: interestRate,
      term: loanTerm,
      unit: termUnit
    };

    const newHistory = [newEntry, ...history].slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem('loanHistory', JSON.stringify(newHistory));
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  const deleteHistoryItem = (id) => {
    const newHistory = history.filter(item => item.id !== id);
    setHistory(newHistory);
    localStorage.setItem('loanHistory', JSON.stringify(newHistory));
  };

  return (
    <div className="flex justify-center items-center min-h-[600px] p-5 bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-600 rounded-2xl m-5 shadow-2xl transition-all duration-300">
      <div className="bg-white/95 backdrop-blur-md p-8 rounded-xl max-w-2xl w-full shadow-2xl border border-white/20">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 border-b border-orange-100 pb-4">
          <div>
            <h2 className="text-3xl font-black bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              Loan Master
            </h2>
            <p className="text-orange-700/60 text-xs font-bold uppercase tracking-widest mt-1">Amortization Engine</p>
          </div>
          <div className="bg-orange-100 p-3 rounded-full animate-pulse text-orange-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Inputs Section */}
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-tight text-left block w-full">Loan Amount</label>
                <span className="text-orange-600 font-mono font-bold whitespace-nowrap">{formatCurrency(loanAmount)}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="1000000"
                step="5000"
                value={loanAmount}
                onChange={(e) => setLoanAmount(parseInt(e.target.value))}
                className="w-full h-2 bg-orange-100 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <input
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(parseInt(e.target.value) || 0)}
                  className="mt-2 w-full px-3 py-1 text-sm bg-gray-50 border border-orange-100 rounded focus:outline-none focus:border-orange-400 font-mono"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-tight text-left block w-full">Interest Rate (%)</label>
                <span className="text-orange-600 font-mono font-bold">{interestRate}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="20"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                className="w-full h-2 bg-orange-100 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-tight">Loan Term</label>
                <div className="flex bg-gray-100 rounded-full p-1 text-[10px] font-black pointer">
                  <button
                    onClick={() => setTermUnit('years')}
                    className={`px-3 py-1 rounded-full transition-all ${termUnit === 'years' ? 'bg-white shadow text-orange-600' : 'text-gray-400'}`}
                  >YEARS</button>
                  <button
                    onClick={() => setTermUnit('months')}
                    className={`px-3 py-1 rounded-full transition-all ${termUnit === 'months' ? 'bg-white shadow text-orange-600' : 'text-gray-400'}`}
                  >MONTHS</button>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max={termUnit === 'years' ? 30 : 360}
                  step="1"
                  value={loanTerm}
                  onChange={(e) => setLoanTerm(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-orange-100 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <span className="w-12 text-center font-bold text-orange-600 font-mono">{loanTerm}</span>
              </div>
            </div>

            <button
              onClick={saveToHistory}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black rounded-xl transition-all shadow-lg shadow-orange-200 active:scale-[0.98] uppercase tracking-tighter"
            >
              Log Calculation
            </button>
          </div>

          {/* Results Section */}
          <div className="flex flex-col justify-between">
            <div className="bg-orange-50/50 p-6 rounded-2xl border border-orange-100 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 text-orange-200/30 text-6xl font-black transition-all group-hover:scale-110 group-hover:rotate-12">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
              </div>
              <p className="text-orange-800/60 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Monthly Payment</p>
              <h3 className="text-5xl font-black text-orange-900 tracking-tighter mb-4">
                {formatCurrency(results.monthlyPayment)}
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 font-black uppercase">Total Principal</span>
                    <span className="text-orange-900 font-bold">{formatCurrency(loanAmount)}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[10px] text-gray-400 font-black uppercase">Total Interest</span>
                    <span className="text-amber-600 font-bold">{formatCurrency(results.totalInterest)}</span>
                  </div>
                </div>
                <div className="pt-3 border-t border-orange-100">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 font-bold">Total Repayment</span>
                    <span className="text-orange-600 font-black text-lg">{formatCurrency(results.totalPayment)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Visualization */}
            <div className="mt-6 p-4 bg-white rounded-xl border border-orange-50 shadow-sm">
              <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                <span>Cost Breakdown</span>
                <span className="text-orange-500">Principal vs Interest</span>
              </div>
              <div className="h-4 w-full flex rounded-full overflow-hidden bg-gray-100 relative">
                <div
                  className="h-full bg-orange-500 transition-all duration-1000 ease-out"
                  style={{ width: `${results.principalPercent}%` }}
                />
                <div
                  className="h-full bg-amber-300 transition-all duration-1000 ease-out"
                  style={{ width: `${results.interestPercent}%` }}
                />
              </div>
              <div className="flex justify-between mt-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-sm"></div>
                  <span className="text-[10px] font-bold text-gray-600 uppercase">Principal ({results.principalPercent}%)</span>
                </div>
                <div className="flex items-center gap-2 text-right">
                  <span className="text-[10px] font-bold text-gray-600 uppercase">Interest ({results.interestPercent}%)</span>
                  <div className="w-3 h-3 bg-amber-300 rounded-sm"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* History Section */}
        {history.length > 0 && (
          <div className="mt-8 pt-6 border-t border-orange-50">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full text-xs font-black text-orange-600 uppercase tracking-widest flex items-center justify-between hover:text-orange-700 transition-colors group"
            >
              <span>Recent Computations ({history.length})</span>
              <span className={`transform transition-transform duration-300 ${showHistory ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {showHistory && (
              <div className="mt-4 space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar animate-fadeIn">
                {history.map(item => (
                  <div key={item.id} className="bg-orange-50/30 p-3 rounded-lg flex justify-between items-center group hover:bg-orange-50 transition-all border border-transparent hover:border-orange-100">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-xs font-black">
                            {item.rate}%
                        </div>
                        <div>
                            <p className="text-sm font-bold text-orange-900">{formatCurrency(item.monthlyPayment)} /mo</p>
                            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">
                                {formatCurrency(item.amount)} • {item.term} {item.unit} • {item.date}
                            </p>
                        </div>
                    </div>
                    <button
                      onClick={() => deleteHistoryItem(item.id)}
                      className="text-gray-300 hover:text-rose-500 transition-colors p-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer Insight */}
        <div className="mt-8 text-center p-4 bg-orange-900 rounded-xl relative overflow-hidden group shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-800 to-orange-950 opacity-95"></div>
          <div className="relative z-10 flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <span className="text-orange-400 text-lg">💡</span>
            </div>
            <div className="text-left">
                <p className="text-orange-400 text-[10px] font-black uppercase tracking-[0.3em]">Strategy Point</p>
                <p className="text-white text-xs font-medium italic leading-tight">
                  "Interest is the price of time. Lower rates buy you more of it."
                </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanCalculator;
