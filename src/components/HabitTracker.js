import React, { useState, useEffect } from 'react';

function HabitTracker() {
  const [habits, setHabits] = useState([]);
  const [newHabitName, setNewHabitName] = useState('');

  // Load from local storage on mount
  useEffect(() => {
    const savedHabits = localStorage.getItem('habitTracker_habits');
    if (savedHabits) {
      try {
        setHabits(JSON.parse(savedHabits));
      } catch (e) {
        console.error('Failed to parse habits', e);
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('habitTracker_habits', JSON.stringify(habits));
  }, [habits]);

  const handleAddHabit = (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    const newHabit = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      name: newHabitName.trim(),
      streak: 0,
      completedToday: false,
      lastCompleted: null,
    };

    setHabits((prev) => [...prev, newHabit]);
    setNewHabitName('');
  };

  const checkHabitReset = (habit) => {
    if (!habit.lastCompleted) return habit;
    
    const lastDate = new Date(habit.lastCompleted);
    const today = new Date();
    
    // Check if it's the next day
    const isNextDay = 
      lastDate.getDate() !== today.getDate() ||
      lastDate.getMonth() !== today.getMonth() ||
      lastDate.getFullYear() !== today.getFullYear();
      
    // Calculate difference in days (ignoring time)
    const lastDateOnly = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const diffTime = Math.abs(todayOnly - lastDateOnly);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    if (diffDays > 1) {
      // Streak broken
      return { ...habit, streak: 0, completedToday: false };
    } else if (isNextDay) {
      // New day, streak maintained
      return { ...habit, completedToday: false };
    }
    
    return habit;
  };

  useEffect(() => {
    // Check for resets on mount or day change
    setHabits((prev) => prev.map(checkHabitReset));
    
    // Optional: set up a timer to check at midnight
    const now = new Date();
    const msUntilMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0) - now;
    
    const timer = setTimeout(() => {
      setHabits((prev) => prev.map(checkHabitReset));
    }, msUntilMidnight);
    
    return () => clearTimeout(timer);
  }, []);

  const toggleHabit = (id) => {
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id === id) {
          const now = new Date().toISOString();
          const wasCompleted = habit.completedToday;
          
          return {
            ...habit,
            completedToday: !wasCompleted,
            streak: !wasCompleted ? habit.streak + 1 : Math.max(0, habit.streak - 1),
            lastCompleted: !wasCompleted ? now : habit.lastCompleted,
          };
        }
        return habit;
      })
    );
  };

  const deleteHabit = (id) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  return (
    <div className="flex justify-center items-center min-h-[400px] p-5 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 rounded-2xl m-5 shadow-2xl">
      <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl max-w-2xl w-full text-center shadow-xl border border-white/20">
        <div className="flex items-center justify-center gap-3 mb-8">
          <span className="text-4xl">🌱</span>
          <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-600">
            Habit Tracker
          </h2>
        </div>

        <form onSubmit={handleAddHabit} className="flex gap-3 mb-8">
          <input
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            placeholder="Enter a new daily habit..."
            className="flex-1 rounded-full border-2 border-emerald-100 bg-emerald-50/50 px-6 py-3 outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-400 text-gray-700 font-medium transition-all duration-300 placeholder:text-emerald-300"
          />
          <button
            type="submit"
            disabled={!newHabitName.trim()}
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white border-none py-3 px-8 text-base font-bold rounded-full cursor-pointer transition-all duration-300 uppercase tracking-wider hover:transform hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/30 active:transform-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Build Habit
          </button>
        </form>

        <div className="text-left space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {habits.length === 0 ? (
            <div className="text-emerald-600/60 text-center py-12 font-medium bg-emerald-50/50 rounded-2xl border-2 border-dashed border-emerald-200">
              <span className="text-3xl block mb-3">🎯</span>
              No habits tracked yet.
              <br />
              Start small and build your way up!
            </div>
          ) : (
            habits.map((habit) => (
              <div
                key={habit.id}
                className={`group relative flex items-center justify-between p-5 rounded-2xl transition-all duration-500 ${
                  habit.completedToday
                    ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 shadow-sm'
                    : 'bg-white border-2 border-gray-100 shadow-sm hover:border-emerald-100 hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-5 flex-1">
                  <button
                    onClick={() => toggleHabit(habit.id)}
                    className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                      habit.completedToday
                        ? 'bg-gradient-to-tr from-emerald-400 to-teal-400 text-white scale-110 shadow-lg shadow-emerald-200'
                        : 'bg-gray-100 text-transparent hover:bg-emerald-50 border-2 border-gray-200 hover:border-emerald-300'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  
                  <div className="flex flex-col">
                    <span className={`text-lg font-bold transition-colors duration-300 ${
                      habit.completedToday ? 'text-emerald-800' : 'text-gray-700 group-hover:text-gray-900'
                    }`}>
                      {habit.name}
                    </span>
                    <span className={`text-sm font-medium ${
                      habit.completedToday ? 'text-emerald-600' : 'text-gray-400'
                    }`}>
                      {habit.completedToday ? 'Completed today! 🎉' : 'Pending for today'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-center justify-center min-w-[60px]">
                    <span className={`text-2xl font-black ${
                      habit.streak > 0 ? 'text-orange-500' : 'text-gray-300'
                    }`}>
                      {habit.streak}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Streak
                    </span>
                  </div>
                  
                  <button
                    onClick={() => deleteHabit(habit.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-300"
                    title="Delete habit"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Custom scrollbar styles for this component */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(16, 185, 129, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.4);
        }
      `}} />
    </div>
  );
}

export default HabitTracker;
