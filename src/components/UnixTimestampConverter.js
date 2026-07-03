import React, { useState, useEffect } from 'react';

const UnixTimestampConverter = () => {
  const [timestamp, setTimestamp] = useState(Math.floor(Date.now() / 1000));
  const [datetime, setDatetime] = useState('');
  const [localString, setLocalString] = useState('');
  const [utcString, setUtcString] = useState('');

  useEffect(() => {
    if (timestamp !== '' && timestamp !== null && !isNaN(timestamp)) {
      const date = new Date(timestamp * 1000);
      if (!isNaN(date.getTime())) {
        const pad = (n) => n.toString().padStart(2, '0');
        const formatted = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
        setDatetime(formatted);
        setLocalString(date.toLocaleString());
        setUtcString(date.toUTCString());
      } else {
        setLocalString('Invalid Date');
        setUtcString('Invalid Date');
      }
    } else {
      setLocalString('');
      setUtcString('');
    }
  }, [timestamp]);

  const handleDatetimeChange = (e) => {
    setDatetime(e.target.value);
    const date = new Date(e.target.value);
    if (!isNaN(date.getTime())) {
      setTimestamp(Math.floor(date.getTime() / 1000));
    }
  };

  const handleTimestampChange = (e) => {
    const val = e.target.value;
    setTimestamp(val);
  };

  const setNow = () => {
    setTimestamp(Math.floor(Date.now() / 1000));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex justify-center items-center min-h-[600px] p-5 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 rounded-2xl m-5 shadow-2xl relative overflow-hidden">
      <div className="bg-white p-8 rounded-2xl max-w-3xl w-full shadow-xl transition-all duration-300 z-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Unix Epoch Converter
          </h2>
          <p className="text-gray-500 text-sm font-medium">
            Convert Unix timestamps to readable dates and vice versa
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Timestamp Input */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Unix Timestamp (Seconds)</label>
            <div className="flex flex-col gap-3">
              <input
                type="number"
                value={timestamp}
                onChange={handleTimestampChange}
                className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl focus:border-cyan-400 focus:ring-0 outline-none transition-colors text-gray-700 font-mono text-xl"
                placeholder="e.g. 1672531199"
              />
              <button
                onClick={setNow}
                className="bg-cyan-100 hover:bg-cyan-200 text-cyan-700 font-bold py-2 px-4 rounded-xl transition-colors text-sm uppercase tracking-wider"
              >
                Set to Now
              </button>
            </div>
          </div>

          {/* Datetime Input */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Local Date & Time</label>
            <div className="flex flex-col gap-3">
              <input
                type="datetime-local"
                value={datetime}
                onChange={handleDatetimeChange}
                className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:ring-0 outline-none transition-colors text-gray-700 font-mono text-lg"
              />
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-gray-900 rounded-2xl p-6 text-white flex flex-col gap-4">
          <div className="flex justify-between items-center bg-gray-800 p-4 rounded-xl border border-gray-700 hover:border-cyan-500 transition-colors group">
            <div>
              <div className="text-xs text-cyan-400 font-bold mb-1 uppercase tracking-wide">Local Time</div>
              <div className="text-xl font-mono">{localString || '...'}</div>
            </div>
            <button 
              onClick={() => copyToClipboard(localString)}
              className="text-gray-400 hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Copy to clipboard"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            </button>
          </div>

          <div className="flex justify-between items-center bg-gray-800 p-4 rounded-xl border border-gray-700 hover:border-purple-500 transition-colors group">
            <div>
              <div className="text-xs text-purple-400 font-bold mb-1 uppercase tracking-wide">GMT / UTC Time</div>
              <div className="text-xl font-mono">{utcString || '...'}</div>
            </div>
            <button 
              onClick={() => copyToClipboard(utcString)}
              className="text-gray-400 hover:text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Copy to clipboard"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnixTimestampConverter;
