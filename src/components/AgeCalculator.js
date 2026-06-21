import React, { useState } from 'react';

const AgeCalculator = () => {
  const [dob, setDob] = useState('');
  const [age, setAge] = useState(null);

  const calculateAge = () => {
    if (!dob) return;

    const birthDate = new Date(dob);
    const today = new Date();

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    if (months < 0 || (months === 0 && days < 0)) {
      years--;
      months += 12;
    }

    if (days < 0) {
      const lastMonthDate = new Date(today.getFullYear(), today.getMonth(), 0);
      days += lastMonthDate.getDate();
      months--;
    }

    setAge({ years, months, days });
  };

  const handleReset = () => {
    setDob('');
    setAge(null);
  };

  return (
    <div className="flex justify-center items-center min-h-[500px] p-5 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl m-5 shadow-2xl">
      <div className="bg-white p-8 rounded-xl max-w-md w-full shadow-xl transition-all duration-300">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent mb-2">
            Age Calculator
          </h2>
          <p className="text-gray-500 text-sm">
            Find out exactly how old you are
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Date of Birth</label>
            <input
              type="date"
              className="w-full p-4 border-2 border-gray-100 rounded-xl focus:border-purple-400 focus:ring-0 outline-none transition-colors text-gray-700"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={calculateAge}
              disabled={!dob}
              className={`flex-1 py-4 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95 ${
                !dob 
                  ? 'bg-gray-400 cursor-not-allowed shadow-none' 
                  : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 shadow-purple-500/30 hover:shadow-purple-500/50'
              }`}
            >
              Calculate Age
            </button>
            <button
              onClick={handleReset}
              disabled={!dob && !age}
              className={`px-8 py-4 rounded-xl font-bold transition-all transform active:scale-95 border-2 ${
                !dob && !age
                  ? 'bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed'
                  : 'bg-white text-pink-500 border-pink-200 hover:border-pink-500 hover:bg-pink-50 shadow-sm'
              }`}
            >
              Reset
            </button>
          </div>

          {age && (
            <div className="mt-8 p-6 bg-gradient-to-br from-indigo-50 to-pink-50 rounded-xl border border-purple-100 text-center animate-fade-in">
              <h3 className="text-lg font-bold text-gray-700 mb-4 uppercase tracking-wider">Your exact age is</h3>
              <div className="flex justify-center gap-4">
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-black text-indigo-600">{age.years}</span>
                  <span className="text-xs text-gray-500 uppercase font-bold mt-1">Years</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-black text-purple-600">{age.months}</span>
                  <span className="text-xs text-gray-500 uppercase font-bold mt-1">Months</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-black text-pink-600">{age.days}</span>
                  <span className="text-xs text-gray-500 uppercase font-bold mt-1">Days</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgeCalculator;
