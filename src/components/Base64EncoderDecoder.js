import React, { useState } from 'react';

const Base64EncoderDecoder = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [mode, setMode] = useState('encode'); // 'encode' or 'decode'
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleEncode = () => {
    setMode('encode');
    try {
      const encoded = btoa(inputText);
      setOutputText(encoded);
      setError(null);
    } catch (err) {
      setError("Invalid input for encoding.");
      setOutputText('');
    }
  };

  const handleDecode = () => {
    setMode('decode');
    try {
      const decoded = atob(inputText);
      setOutputText(decoded);
      setError(null);
    } catch (err) {
      setError("Invalid Base64 string.");
      setOutputText('');
    }
  };

  const handleCopy = () => {
    if (outputText) {
      navigator.clipboard.writeText(outputText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[500px] p-5 bg-gradient-to-br from-teal-400 via-emerald-500 to-green-600 rounded-2xl m-5 shadow-2xl">
      <div className="bg-white p-8 rounded-xl max-w-2xl w-full shadow-xl transition-all duration-300">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            Base64 Encoder / Decoder
          </h2>
          <p className="text-gray-500 text-sm">
            Quickly encode or decode your text and data
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Input</label>
            <textarea
              className="w-full p-4 border-2 border-gray-100 rounded-xl focus:border-emerald-400 outline-none transition-colors text-gray-700 bg-gray-50 min-h-[120px] resize-y font-mono text-sm"
              placeholder={mode === 'encode' ? "Enter text to encode..." : "Enter Base64 string to decode..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleEncode}
              className={`py-3 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95 ${
                mode === 'encode' 
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-500 shadow-emerald-500/30' 
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              }`}
            >
              ENCODE
            </button>
            <button
              onClick={handleDecode}
              className={`py-3 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95 ${
                mode === 'decode' 
                  ? 'bg-gradient-to-r from-emerald-500 to-green-500 shadow-green-500/30' 
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              }`}
            >
              DECODE
            </button>
          </div>

          {error && (
            <div className="text-red-500 text-sm font-semibold text-center bg-red-50 p-2 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <div className="flex justify-between items-end mb-2">
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">Output</label>
              <button 
                onClick={handleCopy}
                disabled={!outputText}
                className={`text-xs font-bold py-1 px-3 rounded-full transition-colors ${
                  copySuccess 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                {copySuccess ? 'COPIED!' : 'COPY'}
              </button>
            </div>
            <textarea
              className="w-full p-4 border-2 border-emerald-100 rounded-xl outline-none text-gray-800 bg-emerald-50/30 min-h-[120px] resize-y font-mono text-sm cursor-text"
              readOnly
              value={outputText}
              placeholder="Result will appear here..."
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Base64EncoderDecoder;
