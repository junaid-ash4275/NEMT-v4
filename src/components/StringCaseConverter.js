import React, { useState } from 'react';

const StringCaseConverter = () => {
  const [input, setInput] = useState('');
  const [copiedStates, setCopiedStates] = useState({});

  const toWords = (inputStr) => {
    return inputStr
      .replace(/[^a-zA-Z0-9]/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .split(/\s+/)
      .filter(Boolean);
  };

  const conversions = {
    'lower case': (s) => s.toLowerCase(),
    'UPPER CASE': (s) => s.toUpperCase(),
    'Title Case': (s) => toWords(s).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' '),
    'camelCase': (s) => toWords(s).map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(''),
    'PascalCase': (s) => toWords(s).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(''),
    'snake_case': (s) => toWords(s).map(w => w.toLowerCase()).join('_'),
    'kebab-case': (s) => toWords(s).map(w => w.toLowerCase()).join('-'),
    'CONSTANT_CASE': (s) => toWords(s).map(w => w.toUpperCase()).join('_'),
  };

  const handleCopy = (text, key) => {
    if (text) {
      navigator.clipboard.writeText(text);
      setCopiedStates({ ...copiedStates, [key]: true });
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [key]: false }));
      }, 2000);
    }
  };

  const handleClear = () => {
    setInput('');
    setCopiedStates({});
  };

  return (
    <div className="flex justify-center items-center min-h-[600px] p-5 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 rounded-2xl m-5 shadow-2xl">
      <div className="bg-white p-8 rounded-xl max-w-4xl w-full shadow-xl transition-all duration-300">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent mb-2">
            String Case Converter
          </h2>
          <p className="text-gray-500 text-sm">
            Instantly convert your text into multiple different casing formats
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">Input Text</label>
              <button
                onClick={handleClear}
                className="text-sm text-gray-400 hover:text-gray-600 font-medium transition-colors"
              >
                Clear
              </button>
            </div>
            <textarea
              className="w-full h-32 p-4 border-2 border-gray-100 rounded-xl focus:border-teal-400 focus:ring-0 outline-none resize-none transition-colors text-gray-700"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type or paste your text here (e.g., 'hello world' or 'helloWorld')..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(conversions).map(([label, converter]) => {
              const outputText = input ? converter(input) : '';
              const isCopied = copiedStates[label];

              return (
                <div key={label} className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-teal-200 transition-colors group">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</span>
                    <button
                      onClick={() => handleCopy(outputText, label)}
                      disabled={!outputText}
                      className={`text-xs font-bold px-3 py-1 rounded-lg transition-colors ${
                        !outputText 
                          ? 'text-gray-300 cursor-not-allowed'
                          : isCopied
                            ? 'bg-green-100 text-green-600'
                            : 'bg-teal-50 text-teal-600 hover:bg-teal-100 opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      {isCopied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div className="font-mono text-sm text-gray-700 break-all bg-white p-3 rounded border border-gray-100 min-h-[3rem] flex items-center">
                    {outputText || <span className="text-gray-300 italic">Result will appear here...</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StringCaseConverter;
