import React, { useEffect, useMemo, useState } from 'react';

const ACCENT = '#4f46e5';

const CURRENCIES = [
  { id: 'USD', locale: 'en-US' },
  { id: 'EUR', locale: 'de-DE' },
  { id: 'GBP', locale: 'en-GB' },
  { id: 'INR', locale: 'en-IN' },
];

const LENGTHS = [15, 25, 30, 45, 60];

const PRESETS = [
  {
    label: 'Standup',
    minutes: 15,
    people: [
      { name: 'Alex', role: 'Eng', rate: '85' },
      { name: 'Sam', role: 'Design', rate: '78' },
      { name: 'Riley', role: 'PM', rate: '92' },
      { name: 'Jordan', role: 'Eng', rate: '80' },
    ],
  },
  {
    label: 'Design review',
    minutes: 45,
    people: [
      { name: 'Sam', role: 'Design', rate: '78' },
      { name: 'Noah', role: 'Design', rate: '70' },
      { name: 'Alex', role: 'Eng', rate: '85' },
      { name: 'Riley', role: 'PM', rate: '92' },
      { name: 'Casey', role: 'Research', rate: '74' },
    ],
  },
  {
    label: 'Interview',
    minutes: 60,
    people: [
      { name: 'Alex', role: 'Eng', rate: '95' },
      { name: 'Morgan', role: 'Eng', rate: '110' },
      { name: 'Riley', role: 'Hiring', rate: '88' },
    ],
  },
];

let nextId = 1;
function withIds(people) {
  return people.map((person) => ({ ...person, id: nextId++ }));
}

function rateOf(person) {
  const value = parseFloat(person.rate);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function formatMoney(amount, currency) {
  return new Intl.NumberFormat(currency.locale, {
    style: 'currency',
    currency: currency.id,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatClock(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return hours > 0 ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
}

function initials(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return parts.slice(0, 2).map((part) => part[0].toUpperCase()).join('');
}

const MeetingMeter = () => {
  const [people, setPeople] = useState(() => withIds(PRESETS[0].people));
  const [minutes, setMinutes] = useState(PRESETS[0].minutes);
  const [currencyId, setCurrencyId] = useState('USD');
  const [running, setRunning] = useState(false);
  const [baseElapsed, setBaseElapsed] = useState(0);
  const [startedAt, setStartedAt] = useState(null);
  const [tick, setTick] = useState(0);
  const [copied, setCopied] = useState(false);

  const currency = CURRENCIES.find((item) => item.id === currencyId) || CURRENCIES[0];

  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => setTick((value) => value + 1), 80);
    return () => clearInterval(id);
  }, [running]);

  const elapsed = baseElapsed + (running && startedAt ? Date.now() - startedAt : 0);
  void tick;

  const stats = useMemo(() => {
    const rates = people.map(rateOf);
    const hourly = rates.reduce((sum, rate) => sum + rate, 0);
    const hours = elapsed / 3600000;
    const cost = hourly * hours;
    const perMinute = hourly / 60;
    const plannedHours = (Number(minutes) || 0) / 60;
    const projected = hourly * plannedHours;
    const shares = people.map((person, index) => ({
      id: person.id,
      name: person.name.trim() || 'Unnamed',
      role: person.role.trim(),
      rate: rates[index],
      cost: rates[index] * hours,
      share: hourly > 0 ? rates[index] / hourly : 0,
    }));
    const richest = shares.reduce((best, person) => (person.rate > (best?.rate || 0) ? person : best), null);
    return { hourly, cost, perMinute, projected, shares, richest };
  }, [people, elapsed, minutes]);

  const plannedMs = (Number(minutes) || 0) * 60000;
  const progress = plannedMs > 0 ? Math.min(1, elapsed / plannedMs) : 0;
  const over = plannedMs > 0 && elapsed > plannedMs;
  const canRun = stats.hourly > 0;

  const updatePerson = (id, field, value) => {
    setPeople((list) => list.map((person) => (person.id === id ? { ...person, [field]: value } : person)));
  };

  const addPerson = () => {
    setPeople((list) => [...list, { id: nextId++, name: '', role: '', rate: '60' }]);
  };

  const removePerson = (id) => {
    setPeople((list) => list.filter((person) => person.id !== id));
  };

  const applyPreset = (preset) => {
    setPeople(withIds(preset.people));
    setMinutes(preset.minutes);
    setRunning(false);
    setBaseElapsed(0);
    setStartedAt(null);
  };

  const toggle = () => {
    if (!canRun) return;
    if (running) {
      setBaseElapsed(elapsed);
      setStartedAt(null);
      setRunning(false);
      return;
    }
    setStartedAt(Date.now());
    setRunning(true);
  };

  const reset = () => {
    setRunning(false);
    setBaseElapsed(0);
    setStartedAt(null);
  };

  const copySummary = () => {
    const lines = [
      `Meeting · ${formatClock(elapsed)} · ${formatMoney(stats.cost, currency)}`,
      ...stats.shares.map((person) => `${person.name}${person.role ? ` (${person.role})` : ''} · ${formatMoney(person.cost, currency)}`),
      `Burn ${formatMoney(stats.perMinute, currency)}/min · room ${formatMoney(stats.hourly, currency)}/hr`,
    ];
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    });
  };

  const activePreset = PRESETS.find(
    (preset) =>
      preset.minutes === Number(minutes) &&
      preset.people.length === people.length &&
      preset.people.every((person, index) => person.name === people[index].name && person.rate === people[index].rate)
  );

  return (
    <div className="max-w-7xl mx-auto my-12 p-6 md:p-8 bg-white rounded-3xl shadow-[0_20px_50px_rgba(79,70,229,0.08)] border border-gray-100 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-50 rounded-full blur-3xl opacity-80 -mr-32 -mt-32 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-50 rounded-full blur-3xl opacity-70 -ml-24 -mb-24 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-100 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-amber-400 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
              <path d="M8 19.5c.6.3 1.3.5 2 .5" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Meeting Meter</h2>
            <p className="text-gray-500 text-sm font-medium mt-0.5">
              Add the room and watch what the meeting costs while it runs
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={reset}
            className="px-4 py-2 rounded-xl text-sm font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 active:scale-95 transition-all"
          >
            Reset
          </button>
          <button
            onClick={copySummary}
            className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
          >
            {copied ? 'Copied' : 'Copy summary'}
          </button>
        </div>
      </div>

      <div className="relative z-10 mt-5 flex flex-wrap items-center gap-2">
        {PRESETS.map((preset) => {
          const active = activePreset === preset;
          return (
            <button
              key={preset.label}
              onClick={() => applyPreset(preset)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95"
              style={
                active
                  ? { background: '#4f46e518', border: '1.5px solid #4f46e566', color: ACCENT }
                  : { background: 'transparent', border: '1.5px solid #e2e8f0', color: '#94a3b8' }
              }
            >
              {preset.label}
            </button>
          );
        })}
        <span className="mx-1 h-4 w-px bg-gray-200" />
        {CURRENCIES.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrencyId(item.id)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95"
            style={
              currencyId === item.id
                ? { background: '#4f46e518', border: '1.5px solid #4f46e566', color: ACCENT }
                : { background: 'transparent', border: '1.5px solid #e2e8f0', color: '#94a3b8' }
            }
          >
            {item.id}
          </button>
        ))}
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-5 gap-4 mt-5">
        <div className="lg:col-span-3 rounded-2xl border border-gray-100 bg-gray-50/80 p-5 md:p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Running cost</p>
              <p className="mt-1 text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 tabular-nums">
                {formatMoney(stats.cost, currency)}
              </p>
            </div>
            <p className="text-2xl font-bold text-indigo-700 tabular-nums">{formatClock(elapsed)}</p>
          </div>

          <div className="mt-5 h-2 rounded-full bg-white border border-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${progress * 100}%`,
                background: over ? '#f43f5e' : 'linear-gradient(90deg, #4f46e5, #f59e0b)',
              }}
            />
          </div>
          <p className={`mt-2 text-sm font-semibold ${over ? 'text-rose-700' : 'text-indigo-800'}`}>
            {over
              ? `Past the ${minutes || 0} min plan by ${formatMoney(stats.cost - stats.projected, currency)}`
              : `On track for ${formatMoney(stats.projected, currency)} in ${minutes || 0} min`}
          </p>

          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              { label: 'Per minute', value: formatMoney(stats.perMinute, currency) },
              { label: 'Room / hour', value: formatMoney(stats.hourly, currency) },
              { label: 'Planned', value: formatMoney(stats.projected, currency) },
            ].map((item) => (
              <div key={item.label} className="rounded-xl bg-white border border-gray-100 px-3 py-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{item.label}</p>
                <p className="mt-1 text-sm md:text-base font-extrabold text-gray-900 tabular-nums">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <button
              onClick={toggle}
              disabled={!canRun}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 shadow-md shadow-indigo-600/20 active:scale-95 transition-all disabled:opacity-40 disabled:active:scale-100"
            >
              {running ? 'Pause' : elapsed > 0 ? 'Resume' : 'Start meeting'}
            </button>
            {LENGTHS.map((length) => (
              <button
                key={length}
                onClick={() => setMinutes(length)}
                className="px-3 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95"
                style={
                  Number(minutes) === length
                    ? { background: '#4f46e518', border: '1.5px solid #4f46e566', color: ACCENT }
                    : { background: 'white', border: '1.5px solid #e2e8f0', color: '#64748b' }
                }
              >
                {length}m
              </button>
            ))}
            <label className="flex items-center gap-2 ml-auto text-xs font-bold text-gray-400">
              Plan
              <input
                type="number"
                min="1"
                max="480"
                value={minutes}
                onChange={(event) => setMinutes(event.target.value)}
                className="w-16 rounded-xl border border-gray-200 bg-white px-2 py-2 text-sm font-bold text-gray-900 outline-none focus:border-indigo-300"
              />
              min
            </label>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-700">Who it costs</p>
          <div className="mt-4 space-y-3">
            {stats.shares.map((person) => (
              <div key={person.id}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-bold text-gray-900 truncate">
                    {person.name}
                    {person.role ? <span className="font-medium text-gray-400"> · {person.role}</span> : null}
                  </span>
                  <span className="font-extrabold text-gray-900 tabular-nums">{formatMoney(person.cost, currency)}</span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-white overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-500"
                    style={{ width: `${Math.max(person.share * 100, person.rate > 0 ? 4 : 0)}%` }}
                  />
                </div>
              </div>
            ))}
            {!stats.shares.length && <p className="text-sm text-indigo-700/70">Add someone to split the cost.</p>}
          </div>
          {stats.richest && stats.richest.rate > 0 && (
            <p className="mt-4 text-sm font-semibold text-indigo-900">
              {stats.richest.name} is the most expensive seat at {formatMoney(stats.richest.rate, currency)}/hr.
            </p>
          )}
        </div>
      </div>

      <div className="relative z-10 mt-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">People in the room</h3>
          <button
            onClick={addPerson}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 active:scale-95 transition-all"
          >
            Add person
          </button>
        </div>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          {people.map((person) => (
            <div key={person.id} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-3 py-3">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-extrabold flex items-center justify-center">
                {initials(person.name)}
              </div>
              <input
                value={person.name}
                onChange={(event) => updatePerson(person.id, 'name', event.target.value)}
                placeholder="Name"
                aria-label="Name"
                className="w-full min-w-0 bg-transparent text-sm font-bold text-gray-900 outline-none placeholder:text-gray-300"
              />
              <input
                value={person.role}
                onChange={(event) => updatePerson(person.id, 'role', event.target.value)}
                placeholder="Role"
                aria-label="Role"
                className="w-24 shrink-0 bg-gray-50 rounded-lg px-2 py-1.5 text-xs font-semibold text-gray-600 outline-none placeholder:text-gray-300"
              />
              <label className="flex items-center gap-1 shrink-0">
                <input
                  value={person.rate}
                  onChange={(event) => updatePerson(person.id, 'rate', event.target.value.replace(/[^\d.]/g, ''))}
                  inputMode="decimal"
                  aria-label="Hourly rate"
                  className="w-16 bg-gray-50 rounded-lg px-2 py-1.5 text-sm font-bold text-gray-900 text-right outline-none"
                />
                <span className="text-[10px] font-bold text-gray-400">/hr</span>
              </label>
              <button
                onClick={() => removePerson(person.id)}
                aria-label={`Remove ${person.name || 'person'}`}
                className="shrink-0 w-8 h-8 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs font-medium text-gray-400">
          Rates stay in {currency.id}. The meter uses each hourly rate against the live clock.
        </p>
      </div>
    </div>
  );
};

export default MeetingMeter;
