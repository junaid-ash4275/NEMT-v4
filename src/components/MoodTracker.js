import React, { useState, useEffect } from 'react';

const MoodTracker = () => {
  const [moods, setMoods] = useState([]);
  const [selectedMood, setSelectedMood] = useState('');
  const [note, setNote] = useState('');

  const moodOptions = [
    { emoji: '😊', label: 'Happy', color: 'from-yellow-400 to-orange-400' },
    { emoji: '😢', label: 'Sad', color: 'from-blue-400 to-indigo-400' },
    { emoji: '😡', label: 'Angry', color: 'from-red-400 to-pink-400' },
    { emoji: '😰', label: 'Anxious', color: 'from-purple-400 to-violet-400' },
    { emoji: '😴', label: 'Tired', color: 'from-gray-400 to-slate-400' },
    { emoji: '🤗', label: 'Grateful', color: 'from-green-400 to-emerald-400' },
    { emoji: '😐', label: 'Neutral', color: 'from-slate-400 to-gray-400' },
    { emoji: '🥳', label: 'Excited', color: 'from-pink-400 to-rose-400' },
  ];

  useEffect(() => {
    try {
      const saved = localStorage.getItem('moods');
      if (saved) setMoods(JSON.parse(saved));
    } catch (_) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('moods', JSON.stringify(moods));
    } catch (_) {}
  }, [moods]);

  const handleLogMood = () => {
    if (!selectedMood) return;
    
    const moodOption = moodOptions.find(m => m.emoji === selectedMood);
    const newMood = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
      emoji: selectedMood,
      label: moodOption.label,
      color: moodOption.color,
      note: note.trim(),
      timestamp: new Date().toISOString(),
    };
    
    setMoods(prev => [newMood, ...prev]);
    setSelectedMood('');
    setNote('');
  };

  const deleteMood = (id) => {
    setMoods(prev => prev.filter(m => m.id !== id));
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRecentMoods = () => {
    return moods.slice(0, 7);
  };

  const getMoodStats = () => {
    const stats = {};
    moods.forEach(mood => {
      stats[mood.label] = (stats[mood.label] || 0) + 1;
    });
    return stats;
  };

  const stats = getMoodStats();
  const recentMoods = getRecentMoods();

  return (
    <div className="flex justify-center items-center min-h-[400px] p-5 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-2xl m-5 shadow-2xl">
      <div className="bg-white p-10 rounded-xl max-w-2xl w-full text-center shadow-xl">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 bg-gradient-to-r from-amber-500 to-red-500 bg-clip-text text-transparent">
          Mood Tracker
        </h2>

        {/* Mood Selection */}
        <div className="mb-6">
          <p className="text-gray-600 text-sm font-medium mb-3">How are you feeling?</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {moodOptions.map((mood) => (
              <button
                key={mood.emoji}
                onClick={() => setSelectedMood(mood.emoji)}
                className={`text-4xl p-3 rounded-full transition-all duration-300 hover:transform hover:scale-110 ${
                  selectedMood === mood.emoji
                    ? 'bg-gradient-to-r ' + mood.color + ' shadow-lg ring-4 ring-offset-2 ring-amber-300'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
                title={mood.label}
              >
                {mood.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Note Input */}
        <div className="mb-6">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note (optional)..."
            className="w-full rounded-full border-2 border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-base"
          />
        </div>

        {/* Log Button */}
        <button
          onClick={handleLogMood}
          disabled={!selectedMood}
          className="bg-gradient-to-r from-amber-500 to-red-500 text-white border-none py-3 px-8 text-base font-semibold rounded-full cursor-pointer transition-all duration-300 uppercase tracking-wider hover:transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-400/50 active:transform-none disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mb-8"
        >
          Log Mood
        </button>

        {/* Stats */}
        {Object.keys(stats).length > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-red-50 p-4 rounded-lg mb-6">
            <p className="text-gray-600 text-sm font-medium mb-2">Mood Distribution</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {Object.entries(stats).map(([label, count]) => (
                <span key={label} className="text-sm bg-white px-3 py-1 rounded-full shadow-sm">
                  {label}: {count}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recent Moods */}
        <div className="text-left">
          <p className="text-gray-600 text-sm font-medium mb-3">Recent Moods</p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {recentMoods.length === 0 ? (
              <div className="text-gray-500 text-center py-8 italic">
                No moods logged yet. Start tracking!
              </div>
            ) : (
              recentMoods.map((mood) => (
                <div
                  key={mood.id}
                  className="bg-gradient-to-r from-gray-50 to-amber-50 p-4 rounded-lg flex items-center gap-3 group hover:from-amber-50 hover:to-red-50 transition-all duration-300"
                >
                  <span className="text-3xl">{mood.emoji}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-700">{mood.label}</p>
                    {mood.note && <p className="text-sm text-gray-500">{mood.note}</p>}
                    <p className="text-xs text-gray-400">{formatTime(mood.timestamp)}</p>
                  </div>
                  <button
                    onClick={() => deleteMood(mood.id)}
                    className="text-xs px-3 py-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors duration-200 font-medium opacity-0 group-hover:opacity-100"
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodTracker;
