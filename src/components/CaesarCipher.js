import React, { useState } from 'react';

const CaesarCipher = () => {
  const [text, setText] = useState('');
  const [shift, setShift] = useState(3);
  const [mode, setMode] = useState('encrypt'); // 'encrypt' or 'decrypt'

  const processText = (str, amount, action) => {
    if (amount < 0) {
      return processText(str, amount + 26, action);
    }
    
    let result = '';
    for (let i = 0; i < str.length; i++) {
      let c = str[i];
      if (c.match(/[a-z]/i)) {
        let code = str.charCodeAt(i);
        let shiftAmount = action === 'encrypt' ? amount : (26 - amount);
        
        if (code >= 65 && code <= 90) {
          c = String.fromCharCode(((code - 65 + shiftAmount) % 26) + 65);
        } else if (code >= 97 && code <= 122) {
          c = String.fromCharCode(((code - 97 + shiftAmount) % 26) + 97);
        }
      }
      result += c;
    }
    return result;
  };

  const outputText = processText(text, parseInt(shift), mode);

  return (
    <div className="flex justify-center items-center min-h-[500px] p-5 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl m-5 shadow-2xl">
      <div className="bg-white p-8 rounded-xl max-w-md w-full shadow-xl">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent">
          Caesar Cipher
        </h2>

        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setMode('encrypt')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              mode === 'encrypt' 
                ? 'bg-indigo-500 text-white shadow-md' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Encrypt
          </button>
          <button
            onClick={() => setMode('decrypt')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              mode === 'decrypt' 
                ? 'bg-pink-500 text-white shadow-md' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Decrypt
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Shift: <span className="font-bold text-indigo-600">{shift}</span>
          </label>
          <input 
            type="range" 
            min="1" 
            max="25" 
            value={shift} 
            onChange={(e) => setShift(e.target.value)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Input Text</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none resize-none transition-all"
            placeholder={`Enter text to ${mode}...`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Output Text</label>
          <div className="w-full min-h-[6rem] p-3 bg-gray-50 border border-gray-200 rounded-lg break-words text-gray-800">
            {outputText || <span className="text-gray-400 italic">Result will appear here...</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaesarCipher;
