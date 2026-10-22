import React, { useState, useEffect, useRef, useCallback } from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────
const MODES = [
  { id: 'focus',  label: 'Focus',       duration: 25 * 60, color: '#7c3aed', glow: '#7c3aed40', emoji: '🎯' },
  { id: 'short',  label: 'Short Break', duration: 5  * 60, color: '#06b6d4', glow: '#06b6d440', emoji: '☕' },
  { id: 'long',   label: 'Long Break',  duration: 15 * 60, color: '#10b981', glow: '#10b98140', emoji: '🌿' },
];

const DEFAULT_TASKS = [
  { id: 1, text: 'Design new feature UI', done: false, pomodoros: 2 },
  { id: 2, text: 'Write unit tests', done: false, pomodoros: 3 },
  { id: 3, text: 'Code review', done: false, pomodoros: 1 },
];

function fmt(secs) {
  const m = String(Math.floor(secs / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return `${m}:${s}`;
}

// ─── Animated SVG Ring ────────────────────────────────────────────────────────
const Ring = ({ progress, color, glow, size = 220, strokeWidth = 12 }) => {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - progress);

  return (
    <svg width={size} height={size} style={{ filter: `drop-shadow(0 0 14px ${glow})` }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.4s ease' }}
      />
    </svg>
  );
};

// ─── Pulse dot ────────────────────────────────────────────────────────────────
const PulseDot = ({ active, color }) => (
  <span
    className="inline-block w-2 h-2 rounded-full"
    style={{
      background: active ? color : '#e2e8f0',
      boxShadow: active ? `0 0 8px ${color}` : 'none',
      transition: 'all 0.4s ease',
    }}
  />
);

// ─── Task Item ────────────────────────────────────────────────────────────────
const TaskItem = ({ task, active, onSelect, onToggle, onDelete, accentColor }) => (
  <div
    className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all cursor-pointer group ${
      active ? 'border-violet-200 bg-violet-50/60' : 'border-gray-100 bg-white hover:bg-gray-50'
    }`}
    onClick={() => onSelect(task.id)}
  >
    <button
      className="shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all"
      style={{ borderColor: task.done ? accentColor : '#cbd5e1', background: task.done ? accentColor : 'transparent' }}
      onClick={e => { e.stopPropagation(); onToggle(task.id); }}
    >
      {task.done && (
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </button>
    <span className={`flex-1 text-sm font-semibold truncate transition-all ${
      task.done ? 'line-through text-gray-400' : active ? 'text-violet-700' : 'text-gray-700'
    }`}>
      {task.text}
    </span>
    <div className="flex items-center gap-1 shrink-0">
      {Array.from({ length: Math.min(Math.max(task.pomodoros, 0), 5) }).map((_, i) => (
        <PulseDot key={i} active={true} color="#7c3aed" />
      ))}
    </div>
    <button
      className="opacity-0 group-hover:opacity-100 ml-1 text-gray-300 hover:text-red-400 transition-all text-lg leading-none"
      onClick={e => { e.stopPropagation(); onDelete(task.id); }}
      title="Remove task"
    >
      ×
    </button>
  </div>
);

// ─── Stat card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, color, icon }) => (
  <div className="flex-1 rounded-2xl p-4 flex flex-col gap-1 border" style={{ background: `${color}0d`, borderColor: `${color}30` }}>
    <span className="text-lg">{icon}</span>
    <span className="text-2xl font-black" style={{ color }}>{value}</span>
    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</span>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const PomodoroTimer = () => {
  const [modeId, setModeId]             = useState('focus');
  const [secsLeft, setSecsLeft]         = useState(MODES[0].duration);
  const [running, setRunning]           = useState(false);
  const [tasks, setTasks]               = useState(DEFAULT_TASKS);
  const [activeTask, setActiveTask]     = useState(1);
  const [newTask, setNewTask]           = useState('');
  const [sessionCount, setSessionCount] = useState(0);
  const [totalMins, setTotalMins]       = useState(0);
  const [tasksDone, setTasksDone]       = useState(0);
  const [flash, setFlash]               = useState(false);

  const intervalRef = useRef(null);
  const mode = MODES.find(m => m.id === modeId);
  const progress = secsLeft / mode.duration;

  const handleSessionEnd = useCallback((currentModeId, currentActiveTask) => {
    setFlash(true);
    setTimeout(() => setFlash(false), 700);
    if (currentModeId === 'focus') {
      setSessionCount(c => c + 1);
      setTotalMins(m => m + 25);
      setTasks(prev =>
        prev.map(t => t.id === currentActiveTask ? { ...t, pomodoros: t.pomodoros + 1 } : t)
      );
    }
  }, []);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecsLeft(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            handleSessionEnd(modeId, activeTask);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, modeId, activeTask, handleSessionEnd]);

  useEffect(() => {
    if (running) {
      document.title = `${fmt(secsLeft)} — ${mode.emoji} ${mode.label}`;
    } else {
      document.title = 'Pomodoro Timer';
    }
    return () => { document.title = 'React App'; };
  }, [secsLeft, running, mode]);

  const switchMode = (id) => {
    setRunning(false);
    setModeId(id);
    setSecsLeft(MODES.find(m => m.id === id).duration);
  };

  const addTask = (e) => {
    e.preventDefault();
    const text = newTask.trim();
    if (!text) return;
    const id = Date.now();
    setTasks(prev => [...prev, { id, text, done: false, pomodoros: 0 }]);
    setNewTask('');
  };

  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const next = { ...t, done: !t.done };
      setTasksDone(c => next.done ? c + 1 : Math.max(0, c - 1));
      return next;
    }));
  };

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    if (activeTask === id) setActiveTask(null);
  };

  const currentTaskText = tasks.find(t => t.id === activeTask)?.text ?? 'No task selected';

  return (
    <div className="max-w-7xl mx-auto my-12 p-6 md:p-8 bg-white rounded-3xl shadow-[0_20px_50px_rgba(124,58,237,0.08)] border border-gray-100 overflow-hidden relative">

      {/* Ambient blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-violet-50 rounded-full blur-3xl opacity-60 -mr-32 -mt-32 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-50 rounded-full blur-3xl opacity-40 -ml-24 -mb-24 pointer-events-none" />

      {/* ── Header ── */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-100 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-pink-400 flex items-center justify-center text-white shadow-md shadow-violet-500/20 text-lg">
            🍅
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Pomodoro Timer</h2>
            <p className="text-gray-500 text-sm font-medium mt-0.5">Deep-work sessions with task tracking &amp; session analytics</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {MODES.map(m => (
            <button
              key={m.id}
              onClick={() => switchMode(m.id)}
              className="px-4 py-2 rounded-xl text-sm font-bold border transition-all active:scale-95"
              style={
                modeId === m.id
                  ? { background: `${m.color}18`, borderColor: `${m.color}55`, color: m.color, boxShadow: `0 0 12px ${m.glow}` }
                  : { background: 'transparent', borderColor: '#e2e8f0', color: '#94a3b8' }
              }
            >
              {m.emoji} {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">

        {/* ─ Left: Clock ─ */}
        <div className="lg:col-span-5 flex flex-col items-center gap-6">

          {/* Ring */}
          <div className="relative flex items-center justify-center">
            <Ring progress={progress} color={mode.color} glow={mode.glow} size={220} strokeWidth={12} />
            <div
              className="absolute inset-0 rounded-full pointer-events-none transition-opacity duration-300"
              style={{ background: `${mode.color}22`, opacity: flash ? 1 : 0 }}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
              <span className="text-5xl font-black font-mono tracking-tight" style={{ color: mode.color }}>
                {fmt(secsLeft)}
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                {mode.emoji} {mode.label}
              </span>
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1"
                style={{ background: `${mode.color}18`, color: mode.color }}
              >
                #{sessionCount + 1}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setRunning(false); setSecsLeft(mode.duration); }}
              className="w-10 h-10 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-400 flex items-center justify-center transition-all active:scale-95 text-base"
              title="Reset"
            >↺</button>
            <button
              onClick={() => setRunning(r => !r)}
              className="flex items-center gap-2 px-8 py-3 rounded-2xl font-bold text-white shadow-lg transition-all active:scale-95"
              style={{ background: `linear-gradient(135deg, ${mode.color}, ${mode.color}cc)`, boxShadow: `0 8px 24px ${mode.glow}` }}
            >
              {running ? <><span className="text-lg">⏸</span> Pause</> : <><span className="text-lg">▶</span> {secsLeft === mode.duration ? 'Start' : 'Resume'}</>}
            </button>
            <button
              onClick={() => {
                const ids = MODES.map(m => m.id);
                switchMode(ids[(ids.indexOf(modeId) + 1) % ids.length]);
              }}
              className="w-10 h-10 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-400 flex items-center justify-center transition-all active:scale-95 text-base"
              title="Next mode"
            >⏭</button>
          </div>

          {/* Active task */}
          <div className="w-full bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Currently working on</p>
            <p className="text-sm font-bold truncate" style={{ color: mode.color }}>{currentTaskText}</p>
          </div>

          {/* Stats */}
          <div className="w-full flex gap-3">
            <StatCard label="Sessions"   value={sessionCount} color="#7c3aed" icon="🎯" />
            <StatCard label="Focus mins" value={totalMins}    color="#f59e0b" icon="⏱" />
            <StatCard label="Tasks done" value={tasksDone}    color="#10b981" icon="✅" />
          </div>
        </div>

        {/* ─ Right: Tasks ─ */}
        <div className="lg:col-span-7 flex flex-col gap-5">

          {/* Add task */}
          <form onSubmit={addTask} className="flex gap-2">
            <input
              type="text"
              value={newTask}
              onChange={e => setNewTask(e.target.value)}
              placeholder="Add a task to your queue…"
              className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-300 transition-all placeholder:text-gray-300"
            />
            <button
              type="submit"
              className="px-5 py-3 rounded-2xl font-bold text-white text-sm transition-all active:scale-95 shadow-md"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 4px 14px #7c3aed30' }}
            >
              + Add
            </button>
          </form>

          {/* Task list */}
          <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-1">
            {tasks.length === 0 && (
              <div className="text-center py-12 text-gray-300 text-sm font-semibold">
                No tasks yet — add one above ☝️
              </div>
            )}
            {tasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                active={activeTask === task.id}
                onSelect={setActiveTask}
                onToggle={toggleTask}
                onDelete={deleteTask}
                accentColor={mode.color}
              />
            ))}
          </div>

          {/* Cycle guide */}
          <div className="bg-gray-50/90 rounded-2xl p-5 border border-gray-100">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Pomodoro Cycle Guide</h4>
            <div className="grid grid-cols-4 gap-3">
              {[
                { n: '25m', label: 'Focus',      color: '#7c3aed', emoji: '🎯' },
                { n: '5m',  label: 'Break',       color: '#06b6d4', emoji: '☕' },
                { n: '25m', label: 'Focus',      color: '#7c3aed', emoji: '🎯' },
                { n: '15m', label: 'Long Break',  color: '#10b981', emoji: '🌿' },
              ].map((step, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center"
                  style={{ borderColor: `${step.color}30`, background: `${step.color}08` }}
                >
                  <span className="text-lg">{step.emoji}</span>
                  <span className="text-sm font-black" style={{ color: step.color }}>{step.n}</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">{step.label}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[10px] text-gray-400 font-medium">
              💡 After 4 focus sessions, take a long break. Click a task to set it as active — pomodoros are tracked per task (dots shown).
            </p>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="relative z-10 mt-6 pt-5 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-400">
        <span>Technique by <span className="font-semibold text-gray-500">Francesco Cirillo</span> — focus in sprints, rest intentionally</span>
        <span className="text-[10px] font-medium uppercase tracking-wider text-gray-300">
          {running ? `⏱ Running — ${mode.label}` : '⏹ Paused'}
        </span>
      </div>
    </div>
  );
};

export default PomodoroTimer;
