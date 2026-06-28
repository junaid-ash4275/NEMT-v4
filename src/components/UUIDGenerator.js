import React, { useState } from 'react';

const UUIDGenerator = () => {
  const [uuids, setUuids] = useState([]);
  const [count, setCount] = useState(1);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const handleGenerate = () => {
    const newUuids = Array.from({ length: Math.min(count, 50) }, generateUUID);
    setUuids(newUuids);
    setCopiedIndex(null);
  };

  const handleCopy = (text, index) => {
    if (text) {
      navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => {
        setCopiedIndex(null);
      }, 2000);
    }
  };

  const handleClear = () => {
    setUuids([]);
    setCopiedIndex(null);
  };

  return (
    <div className="flex justify-center items-center min-h-[600px] p-5 bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 rounded-2xl m-5 shadow-2xl">
      <div className="bg-white p-8 rounded-xl max-w-4xl w-full shadow-xl transition-all duration-300">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent mb-2">
            UUID Generator
          </h2>
          <p className="text-gray-500 text-sm">
            Generate random Version 4 UUIDs quickly and easily
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="w-full sm:w-1/3">
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Number of UUIDs</label>
              <input
                type="number"
                min="1"
                max="50"
                className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-purple-400 focus:ring-0 outline-none transition-colors text-gray-700"
                value={count}
                onChange={(e) => setCount(Math.max(1, Math.min(50, Number(e.target.value))))}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-2/3">
              <button
                onClick={handleGenerate}
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
              >
                Generate
              </button>
              <button
                onClick={handleClear}
                className="px-6 py-3 border-2 border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 font-bold rounded-xl transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          {uuids.length > 0 && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">Generated UUIDs</label>
                <span className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                  Count: {uuids.length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-2">
                {uuids.map((uuid, index) => {
                  const isCopied = copiedIndex === index;
                  return (
                    <div key={index} className="bg-gray-50 p-3 rounded-xl border border-gray-100 hover:border-purple-200 transition-colors group flex justify-between items-center">
                      <span className="font-mono text-sm text-gray-700 select-all">{uuid}</span>
                      <button
                        onClick={() => handleCopy(uuid, index)}
                        className={`text-xs font-bold px-3 py-1 rounded-lg transition-colors flex-shrink-0 ml-2 ${
                          isCopied
                            ? 'bg-green-100 text-green-600'
                            : 'bg-purple-50 text-purple-600 hover:bg-purple-100 opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        {isCopied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UUIDGenerator;
