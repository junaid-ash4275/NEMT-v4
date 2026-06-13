import React, { useState } from 'react';

const PasswordStrengthChecker = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const calculateStrength = (pwd) => {
    let score = 0;
    if (!pwd) return score;
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    return score; // 0 to 5
  };

  const strength = calculateStrength(password);

  const getStrengthLabel = (score) => {
    if (password.length === 0) return 'Enter a password';
    switch (score) {
      case 0:
      case 1: return 'Very Weak';
      case 2: return 'Weak';
      case 3: return 'Fair';
      case 4: return 'Good';
      case 5: return 'Strong';
      default: return '';
    }
  };

  const getStrengthColor = (score) => {
    if (password.length === 0) return 'bg-gray-200';
    switch (score) {
      case 0:
      case 1: return 'bg-rose-500';
      case 2: return 'bg-orange-500';
      case 3: return 'bg-yellow-400';
      case 4: return 'bg-emerald-400';
      case 5: return 'bg-emerald-600';
      default: return 'bg-gray-200';
    }
  };

  const getStrengthWidth = (score) => {
    if (password.length === 0) return '0%';
    return `${(score / 5) * 100}%`;
  };

  const requirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'At least 12 characters', met: password.length >= 12 },
    { label: 'Uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Number', met: /[0-9]/.test(password) },
    { label: 'Special character', met: /[^A-Za-z0-9]/.test(password) },
  ];

  return (
    <div className="flex justify-center items-center min-h-[500px] p-5 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl m-5 shadow-2xl">
      <div className="bg-white p-8 rounded-xl max-w-md w-full shadow-xl transition-all duration-300">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent mb-2">
            Password Checker
          </h2>
          <p className="text-gray-500 text-sm">
            Analyze the strength of your password
          </p>
        </div>

        <div className="space-y-6">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className="w-full p-4 pr-12 border-2 border-gray-100 rounded-xl focus:border-purple-400 focus:ring-0 outline-none transition-colors text-gray-700 bg-gray-50"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Type your password..."
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-500 transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0l-3.59-3.59m-3.59-3.59l-3.59-3.59" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">Strength</span>
              <span className={`text-sm font-bold ${password.length === 0 ? 'text-gray-400' : 'text-gray-700'}`}>
                {getStrengthLabel(strength)}
              </span>
            </div>
            <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${getStrengthColor(strength)}`}
                style={{ width: getStrengthWidth(strength) }}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">Requirements</h3>
            <ul className="space-y-3">
              {requirements.map((req, index) => (
                <li key={index} className="flex items-center space-x-3">
                  <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-colors ${req.met ? 'bg-emerald-100 text-emerald-500' : 'bg-gray-100 text-gray-400'}`}>
                    {req.met ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-current" />
                    )}
                  </div>
                  <span className={`text-sm transition-colors ${req.met ? 'text-gray-700' : 'text-gray-400'}`}>
                    {req.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordStrengthChecker;
