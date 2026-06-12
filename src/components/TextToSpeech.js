import React, { useState, useEffect } from 'react';

const TextToSpeech = () => {
  const [text, setText] = useState('Hello world! Welcome to the Text to Speech generator.');
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [pitch, setPitch] = useState(1);
  const [rate, setRate] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      if (availableVoices.length > 0) {
        setSelectedVoice(availableVoices[0].name);
      }
    };

    loadVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const handlePlay = () => {
    if (speechSynthesis.speaking) {
      console.error('speechSynthesis.speaking');
      return;
    }
    if (text !== '') {
      const utterThis = new SpeechSynthesisUtterance(text);
      const voice = voices.find(v => v.name === selectedVoice);
      if (voice) {
        utterThis.voice = voice;
      }
      utterThis.pitch = pitch;
      utterThis.rate = rate;
      
      utterThis.onstart = () => setIsPlaying(true);
      utterThis.onend = () => setIsPlaying(false);
      utterThis.onerror = () => setIsPlaying(false);

      speechSynthesis.speak(utterThis);
    }
  };

  const handleStop = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
  };

  return (
    <div className="flex justify-center items-center min-h-[500px] p-5 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl m-5 shadow-2xl">
      <div className="bg-white p-8 rounded-xl max-w-2xl w-full shadow-xl transition-all duration-300">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent mb-2">
            Text to Speech
          </h2>
          <p className="text-gray-500 text-sm">
            Convert any text into spoken audio instantly
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Text Input</label>
            <textarea
              className="w-full h-32 p-4 border-2 border-gray-100 rounded-xl focus:border-teal-400 focus:ring-0 outline-none resize-none transition-colors text-gray-700"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type something to hear it spoken..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Voice</label>
              <select 
                className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-teal-400 outline-none transition-colors text-gray-700 bg-white"
                value={selectedVoice || ''}
                onChange={(e) => setSelectedVoice(e.target.value)}
              >
                {voices.map((voice) => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Pitch</label>
                  <span className="text-sm text-teal-600 font-bold">{pitch}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="2" 
                  step="0.1" 
                  value={pitch} 
                  onChange={(e) => setPitch(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Speed</label>
                  <span className="text-sm text-teal-600 font-bold">{rate}x</span>
                </div>
                <input 
                  type="range" 
                  min="0.5" 
                  max="2" 
                  step="0.1" 
                  value={rate} 
                  onChange={(e) => setRate(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={handlePlay}
              disabled={isPlaying}
              className={`flex-1 py-4 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95 ${
                isPlaying 
                  ? 'bg-gray-400 cursor-not-allowed shadow-none' 
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-teal-500/30 hover:shadow-teal-500/50'
              }`}
            >
              {isPlaying ? 'Playing...' : 'Play Audio'}
            </button>
            <button
              onClick={handleStop}
              disabled={!isPlaying}
              className={`px-8 py-4 rounded-xl font-bold transition-all transform active:scale-95 border-2 ${
                !isPlaying
                  ? 'bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed'
                  : 'bg-white text-rose-500 border-rose-200 hover:border-rose-500 hover:bg-rose-50 shadow-sm'
              }`}
            >
              Stop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextToSpeech;
