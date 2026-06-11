import React, { useState, useEffect } from 'react';

const KeycodeDetector = () => {
  const [keyInfo, setKeyInfo] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't prevent default for standard typing/shortcuts if we want to allow scrolling,
      // but for a keycode detector, we usually want to catch everything without moving the page.
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
      
      setKeyInfo({
        key: e.key === ' ' ? 'Space' : e.key,
        keyCode: e.keyCode,
        code: e.code,
        shiftKey: e.shiftKey,
        ctrlKey: e.ctrlKey,
        altKey: e.altKey,
        metaKey: e.metaKey
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex justify-center items-center min-h-[500px] p-5 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-rose-500 rounded-2xl m-5 shadow-2xl">
      <div className="bg-white p-8 rounded-xl max-w-3xl w-full text-center shadow-xl transition-all duration-300">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-rose-500 bg-clip-text text-transparent mb-2">
          Javascript Keycode Info
        </h2>
        <p className="text-gray-500 text-sm mb-8">
          Press any key to get the JavaScript event properties
        </p>

        {!keyInfo ? (
          <div className="py-24 border-4 border-dashed border-violet-200 rounded-2xl bg-violet-50/50 flex items-center justify-center animate-pulse">
            <p className="text-3xl font-bold text-violet-400">
              Press any key...
            </p>
          </div>
        ) : (
          <div className="space-y-8 animate-fadeIn">
            <div className="py-8 bg-gray-50 rounded-2xl border-2 border-gray-100 relative overflow-hidden group hover:border-violet-200 transition-colors">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-100 to-rose-100 opacity-0 group-hover:opacity-50 transition-opacity" />
              <div className="relative text-[10rem] leading-none font-black text-transparent bg-clip-text bg-gradient-to-br from-violet-600 to-rose-500 drop-shadow-sm mb-2">
                {keyInfo.keyCode}
              </div>
              <div className="relative text-gray-400 font-bold tracking-widest uppercase text-sm">
                event.which
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-xl border-2 border-gray-100 shadow-sm hover:shadow-md hover:border-fuchsia-200 transition-all group">
                <p className="text-sm text-gray-400 font-bold uppercase tracking-wider mb-2 group-hover:text-fuchsia-500 transition-colors">event.key</p>
                <p className="text-3xl font-bold text-gray-800 break-all">{keyInfo.key}</p>
              </div>
              <div className="bg-white p-6 rounded-xl border-2 border-gray-100 shadow-sm hover:shadow-md hover:border-violet-200 transition-all group">
                <p className="text-sm text-gray-400 font-bold uppercase tracking-wider mb-2 group-hover:text-violet-500 transition-colors">event.code</p>
                <p className="text-3xl font-bold text-gray-800 break-all">{keyInfo.code}</p>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4 mt-6 p-6 bg-gray-50 rounded-xl">
              <span className={`px-6 py-3 rounded-xl text-sm font-bold shadow-sm transition-colors ${keyInfo.shiftKey ? 'bg-rose-500 text-white shadow-rose-200' : 'bg-white text-gray-400 border border-gray-200'}`}>Shift</span>
              <span className={`px-6 py-3 rounded-xl text-sm font-bold shadow-sm transition-colors ${keyInfo.ctrlKey ? 'bg-violet-500 text-white shadow-violet-200' : 'bg-white text-gray-400 border border-gray-200'}`}>Ctrl</span>
              <span className={`px-6 py-3 rounded-xl text-sm font-bold shadow-sm transition-colors ${keyInfo.altKey ? 'bg-fuchsia-500 text-white shadow-fuchsia-200' : 'bg-white text-gray-400 border border-gray-200'}`}>Alt</span>
              <span className={`px-6 py-3 rounded-xl text-sm font-bold shadow-sm transition-colors ${keyInfo.metaKey ? 'bg-indigo-500 text-white shadow-indigo-200' : 'bg-white text-gray-400 border border-gray-200'}`}>Meta</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KeycodeDetector;
