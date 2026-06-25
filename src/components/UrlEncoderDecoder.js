import React, { useState } from 'react';

const UrlEncoderDecoder = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('encode'); // 'encode' or 'decode'
  const [copied, setCopied] = useState(false);

  const handleEncode = () => {
    try {
      setOutput(encodeURIComponent(input));
      setMode('encode');
      setCopied(false);
    } catch (e) {
      setOutput('Error: Invalid input for encoding.');
    }
  };

  const handleDecode = () => {
    try {
      setOutput(decodeURIComponent(input));
      setMode('decode');
      setCopied(false);
    } catch (e) {
      setOutput('Error: Invalid input for decoding (malformed URI).');
    }
  };

  const handleCopy = () => {
    if (output && !output.startsWith('Error:')) {
      navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setCopied(false);
  };

  return (
    <div className="flex justify-center items-center min-h-[500px] p-5 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl m-5 shadow-2xl">
      <div className="bg-white p-8 rounded-xl max-w-2xl w-full shadow-xl transition-all duration-300">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent mb-2">
            URL Encoder & Decoder
          </h2>
          <p className="text-gray-500 text-sm">
            Easily encode or decode your URL strings with a single click
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Input Text</label>
            <textarea
              className="w-full h-32 p-4 border-2 border-gray-100 rounded-xl focus:border-indigo-400 focus:ring-0 outline-none resize-none transition-colors text-gray-700"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your URL or text here..."
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleEncode}
              className={`flex-1 py-3 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95 ${
                mode === 'encode' && output && !output.startsWith('Error:')
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 shadow-indigo-500/30'
                  : 'bg-gradient-to-r from-indigo-400 to-purple-400 hover:from-indigo-500 hover:to-purple-500 opacity-90 hover:opacity-100 shadow-indigo-500/20'
              }`}
            >
              Encode URL
            </button>
            <button
              onClick={handleDecode}
              className={`flex-1 py-3 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95 ${
                mode === 'decode' && output && !output.startsWith('Error:')
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-pink-500/30'
                  : 'bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 opacity-90 hover:opacity-100 shadow-purple-500/20'
              }`}
            >
              Decode URL
            </button>
            <button
              onClick={handleClear}
              className="px-6 py-3 rounded-xl font-bold transition-all transform active:scale-95 border-2 bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:bg-gray-50 shadow-sm"
              title="Clear all"
            >
              Clear
            </button>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Output Result</label>
              <button
                onClick={handleCopy}
                disabled={!output || output.startsWith('Error:')}
                className={`text-sm font-bold px-3 py-1 rounded-lg transition-colors ${
                  !output || output.startsWith('Error:')
                    ? 'text-gray-300 cursor-not-allowed bg-transparent' 
                    : copied 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                }`}
              >
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
            </div>
            <textarea
              className={`w-full h-32 p-4 border-2 rounded-xl bg-gray-50 focus:ring-0 outline-none resize-none transition-colors font-mono text-sm ${
                output.startsWith('Error:') 
                  ? 'border-red-200 text-red-500 focus:border-red-400' 
                  : 'border-gray-100 text-gray-700 focus:border-indigo-400'
              }`}
              value={output}
              readOnly
              placeholder="Result will appear here..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UrlEncoderDecoder;
