import React, { useEffect, useId, useMemo, useState } from 'react';

const STORAGE_KEY = 'rest-window-v1';
const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2';
const CYCLE_COUNTS = [6, 5, 4, 3];
const TARGETS = [360, 420, 450, 480, 540];
const BUFFERS = [10, 15, 20, 30];
const WIND_DOWNS = [0, 15, 30, 45];
const CYCLE_PRESETS = [80, 90, 100];
const WAKE_PRESETS = ['06:00', '06:30', '07:00', '07:30', '08:00'];
const BED_PRESETS = ['22:00', '22:30', '23:00', '23:30', '00:00'];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function parseTime(value) {
  const match = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(String(value || '').trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function toInputTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

function minutesNow() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

function shift(anchor, delta) {
  const raw = anchor + delta;
  return {
    minutes: ((raw % 1440) + 1440) % 1440,
    day: Math.floor(raw / 1440),
  };
}

function formatClock(minutes) {
  const date = new Date(2000, 0, 1, Math.floor(minutes / 60), minutes % 60);
  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function formatDuration(minutes) {
  const abs = Math.abs(minutes);
  const hours = Math.floor(abs / 60);
  const mins = abs % 60;
  if (hours && mins) return `${hours}h ${mins}m`;
  if (hours) return `${hours}h`;
  return `${mins}m`;
}

function dayLabel(day) {
  if (day < 0) return 'the night before';
  if (day > 0) return 'the next day';
  return '';
}

function momentCaption(point, role, mode) {
  if (role === 'wake' && mode === 'wake') return 'The time you picked';
  if (role === 'lights' && mode === 'bed') return 'The time you picked';
  const when = dayLabel(point.day);
  if (!when) return 'Same day';
  return when.charAt(0).toUpperCase() + when.slice(1);
}

function withDay(point) {
  const note = dayLabel(point.day);
  return note ? `${formatClock(point.minutes)} (${note})` : formatClock(point.minutes);
}

function buildPlan(anchor, mode, cycles, cycleLength, buffer, windDown) {
  const asleep = cycles * cycleLength;
  const inBed = asleep + buffer;
  if (mode === 'wake') {
    return {
      cycles,
      asleep,
      inBed,
      wake: shift(anchor, 0),
      sleepStart: shift(anchor, -asleep),
      lightsOut: shift(anchor, -(asleep + buffer)),
      wind: shift(anchor, -(asleep + buffer + windDown)),
    };
  }
  return {
    cycles,
    asleep,
    inBed,
    lightsOut: shift(anchor, 0),
    sleepStart: shift(anchor, buffer),
    wake: shift(anchor, buffer + asleep),
    wind: shift(anchor, -windDown),
  };
}

function pickRecommended(plans, target) {
  return [...plans].sort((a, b) => {
    const distanceA = Math.abs(a.asleep - target);
    const distanceB = Math.abs(b.asleep - target);
    if (distanceA !== distanceB) return distanceA - distanceB;
    const coversA = a.asleep >= target ? 0 : 1;
    const coversB = b.asleep >= target ? 0 : 1;
    if (coversA !== coversB) return coversA - coversB;
    return b.cycles - a.cycles;
  })[0];
}

function verdictFor(plan, target, isRecommended) {
  const diff = plan.asleep - target;
  const targetLabel = formatDuration(target);
  if (diff === 0) return `Right on your ${targetLabel} target, and it ends on a cycle boundary.`;
  if (isRecommended && diff > 0) {
    return `${formatDuration(diff)} over your ${targetLabel} target — the closest cycle that still covers it.`;
  }
  if (isRecommended) {
    return `${formatDuration(-diff)} under your ${targetLabel} target — the nearest cycle you can land on.`;
  }
  if (diff > 0) return `${formatDuration(diff)} over your ${targetLabel} target.`;
  return `${formatDuration(-diff)} under your ${targetLabel} target.`;
}

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    const minutes = parseTime(data.time);
    const target = Number(data.target);
    const chosen = Number(data.chosenCycles);
    return {
      mode: data.mode === 'bed' ? 'bed' : 'wake',
      time: minutes == null ? '07:00' : toInputTime(minutes),
      cycleLength: clamp(Math.round(Number(data.cycleLength) || 90), 70, 120),
      buffer: BUFFERS.includes(Number(data.buffer)) ? Number(data.buffer) : 15,
      windDown: WIND_DOWNS.includes(Number(data.windDown)) ? Number(data.windDown) : 30,
      target: TARGETS.includes(target) ? target : 450,
      chosenCycles: CYCLE_COUNTS.includes(chosen) ? chosen : null,
    };
  } catch {
    return null;
  }
}

export default function RestWindow() {
  const labelId = useId();
  const saved = useMemo(() => loadSaved(), []);
  const [mode, setMode] = useState(saved?.mode || 'wake');
  const [time, setTime] = useState(saved?.time || '07:00');
  const [cycleLength, setCycleLength] = useState(saved?.cycleLength || 90);
  const [buffer, setBuffer] = useState(saved?.buffer ?? 15);
  const [windDown, setWindDown] = useState(saved?.windDown ?? 30);
  const [target, setTarget] = useState(saved?.target || 450);
  const [chosenCycles, setChosenCycles] = useState(saved?.chosenCycles ?? null);
  const [now, setNow] = useState(minutesNow);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const id = setInterval(() => setNow(minutesNow()), 15000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        mode,
        time,
        cycleLength,
        buffer,
        windDown,
        target,
        chosenCycles,
      }));
    } catch {
      setStatus('This browser blocked saving, so the plan stays in this tab only.');
    }
  }, [mode, time, cycleLength, buffer, windDown, target, chosenCycles]);

  const anchor = parseTime(time) ?? (mode === 'wake' ? 7 * 60 : 23 * 60);
  const plans = useMemo(
    () => CYCLE_COUNTS.map((cycles) => buildPlan(anchor, mode, cycles, cycleLength, buffer, windDown)),
    [anchor, mode, cycleLength, buffer, windDown],
  );
  const recommended = pickRecommended(plans, target);
  const featured = plans.find((plan) => plan.cycles === chosenCycles) || recommended;
  const isRecommended = featured.cycles === recommended.cycles;
  const presets = mode === 'wake' ? WAKE_PRESETS : BED_PRESETS;
  const timelineTotal = windDown + buffer + featured.asleep;
  const timeline = [
    windDown > 0 ? { id: 'wind', minutes: windDown, className: 'bg-indigo-200' } : null,
    buffer > 0 ? { id: 'buffer', minutes: buffer, className: 'bg-sky-300' } : null,
    ...Array.from({ length: featured.cycles }, (_, index) => ({
      id: `cycle-${index}`,
      minutes: cycleLength,
      className: index % 2 === 0 ? 'bg-sky-500' : 'bg-sky-600',
    })),
  ].filter(Boolean);

  const summary = [
    mode === 'wake'
      ? `Up at ${formatClock(featured.wake.minutes)}`
      : `In bed at ${formatClock(featured.lightsOut.minutes)}`,
    windDown > 0 ? `Wind down from ${withDay(featured.wind)}` : '',
    `Lights out ${withDay(featured.lightsOut)}`,
    `Asleep around ${withDay(featured.sleepStart)}`,
    `Wake ${withDay(featured.wake)}`,
    `${featured.cycles} cycles · ${formatDuration(featured.asleep)} asleep · ${formatDuration(featured.inBed)} in bed`,
  ].filter(Boolean).join('\n');

  const nowPlan = buildPlan(now, 'bed', featured.cycles, cycleLength, buffer, windDown);

  const applyTime = (next) => {
    const minutes = parseTime(next);
    if (minutes == null) return;
    setTime(toInputTime(minutes));
    setStatus('');
  };

  const planFromNow = () => {
    setMode('bed');
    setTime(toInputTime(now));
    setStatus(`Planning from ${formatClock(now)}, the current time.`);
  };

  const copyPlan = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setStatus('Sleep plan copied.');
    } catch {
      setStatus('Clipboard is blocked in this browser.');
    }
  };

  return (
    <section aria-labelledby={labelId} className="max-w-7xl mx-auto my-12 p-6 md:p-8 bg-white rounded-3xl shadow-[0_20px_50px_rgba(2,132,199,0.08)] border border-gray-100 overflow-hidden relative">
      <div aria-hidden="true" className="absolute top-0 right-0 w-96 h-96 bg-sky-50 rounded-full blur-3xl opacity-80 -mr-32 -mt-32 pointer-events-none" />
      <div aria-hidden="true" className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-50 rounded-full blur-3xl opacity-70 -ml-24 -mb-24 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-100 gap-4">
        <div className="flex items-center gap-3">
          <div aria-hidden="true" className="w-10 h-10 shrink-0 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-sky-600/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </div>
          <div>
            <h2 id={labelId} className="text-3xl font-extrabold text-gray-900 tracking-tight">Rest Window</h2>
            <p className="text-gray-500 text-sm font-medium mt-0.5">Line a bedtime or an alarm up with full sleep cycles, plus time to fall asleep</p>
          </div>
        </div>
        <button type="button" onClick={copyPlan} className={`self-start shrink-0 px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-sky-600 to-sky-500 shadow-md shadow-sky-600/20 active:scale-95 transition-all ${FOCUS}`}>
          {status === 'Sleep plan copied.' ? 'Copied' : 'Copy plan'}
        </button>
      </div>

      <div className="relative z-10 mt-5 grid grid-cols-3 gap-3">
        {[
          { label: 'Asleep', value: formatDuration(featured.asleep) },
          { label: 'In bed', value: formatDuration(featured.inBed) },
          { label: 'Cycles', value: featured.cycles },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-sky-100 bg-sky-50/70 px-4 py-3">
            <div className="text-2xl font-black tabular-nums text-sky-800">{stat.value}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-sky-700/80">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        <div className="lg:col-span-5 min-w-0 space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 md:p-5 space-y-4">
            <div role="group" aria-label="What time you already know" className="grid grid-cols-2 gap-2">
              {[
                { id: 'wake', label: 'I need to be up at' },
                { id: 'bed', label: "I'll get in bed at" },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={mode === option.id}
                  onClick={() => { setMode(option.id); setStatus(''); }}
                  className={`rounded-xl px-3 py-2.5 text-left text-sm font-bold border ${FOCUS} ${mode === option.id ? 'bg-sky-600 border-sky-600 text-white' : 'bg-white border-gray-200 text-gray-600'}`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div>
              <label htmlFor={`${labelId}-time`} className="text-xs font-semibold text-gray-600">
                {mode === 'wake' ? 'Alarm' : 'Lights out'}
              </label>
              <input
                id={`${labelId}-time`}
                type="time"
                value={time}
                onChange={(event) => applyTime(event.target.value)}
                className={`mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-800 ${FOCUS}`}
              />
              <div role="group" aria-label="Common times" className="mt-3 flex flex-wrap gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    aria-pressed={time === preset}
                    onClick={() => applyTime(preset)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${FOCUS} ${time === preset ? 'bg-sky-600 border-sky-600 text-white' : 'bg-white border-gray-200 text-gray-500'}`}
                  >
                    {formatClock(parseTime(preset))}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between gap-3 mb-2">
                <label htmlFor={`${labelId}-cycle`} className="text-sm font-semibold text-gray-600">Cycle length</label>
                <output htmlFor={`${labelId}-cycle`} className="text-sm font-mono font-bold text-sky-700">{cycleLength} min</output>
              </div>
              <input
                id={`${labelId}-cycle`}
                type="range"
                min="70"
                max="120"
                step="5"
                value={cycleLength}
                onChange={(event) => { setCycleLength(Number(event.target.value)); setStatus(''); }}
                className={`w-full cursor-pointer accent-sky-600 ${FOCUS}`}
              />
              <div role="group" aria-label="Cycle length shortcuts" className="mt-3 flex flex-wrap gap-2">
                {CYCLE_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    aria-pressed={cycleLength === preset}
                    onClick={() => { setCycleLength(preset); setStatus(''); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${FOCUS} ${cycleLength === preset ? 'bg-sky-600 border-sky-600 text-white' : 'bg-white border-gray-200 text-gray-500'}`}
                  >
                    {preset} min
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-4 md:p-5 space-y-4">
            <ChoiceRow
              label="Time to fall asleep"
              groupLabel="Minutes to fall asleep"
              value={buffer}
              options={BUFFERS}
              onChange={(next) => { setBuffer(next); setStatus(''); }}
              format={(minutes) => `${minutes} min`}
            />
            <ChoiceRow
              label="Wind-down before bed"
              groupLabel="Wind-down length"
              value={windDown}
              options={WIND_DOWNS}
              onChange={(next) => { setWindDown(next); setStatus(''); }}
              format={(minutes) => (minutes === 0 ? 'None' : `${minutes} min`)}
            />
            <ChoiceRow
              label="Sleep you want"
              groupLabel="Target sleep"
              value={target}
              options={TARGETS}
              onChange={(next) => { setTarget(next); setStatus(''); }}
              format={formatDuration}
            />
          </div>
        </div>

        <div className="lg:col-span-7 min-w-0 space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-4 md:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-sky-700">
                  {isRecommended ? 'Closest match' : `${featured.cycles} cycles`}
                </h3>
                <p className="mt-2 text-sm font-medium leading-relaxed text-gray-600">
                  {verdictFor(featured, target, isRecommended)}
                </p>
              </div>
              {!isRecommended && (
                <button
                  type="button"
                  onClick={() => { setChosenCycles(null); setStatus(''); }}
                  className={`shrink-0 rounded-xl px-3 py-2 text-xs font-bold text-sky-700 bg-sky-50 border border-sky-100 ${FOCUS}`}
                >
                  Use closest
                </button>
              )}
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-2xl bg-gray-50 border border-gray-100 px-4 py-3">
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Lights out</div>
                <div className="mt-1 text-3xl font-black tabular-nums tracking-tight text-gray-900">{formatClock(featured.lightsOut.minutes)}</div>
                <div className="mt-1 text-xs font-medium text-gray-500">{momentCaption(featured.lightsOut, 'lights', mode)}</div>
              </div>
              <div className="rounded-2xl bg-gray-50 border border-gray-100 px-4 py-3">
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Wake</div>
                <div className="mt-1 text-3xl font-black tabular-nums tracking-tight text-gray-900">{formatClock(featured.wake.minutes)}</div>
                <div className="mt-1 text-xs font-medium text-gray-500">{momentCaption(featured.wake, 'wake', mode)}</div>
              </div>
            </div>

            <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {windDown > 0 && (
                <div className="flex justify-between gap-3 border-b border-gray-100 py-2">
                  <dt className="text-gray-500">Wind down</dt>
                  <dd className="font-semibold text-gray-800">{withDay(featured.wind)}</dd>
                </div>
              )}
              <div className="flex justify-between gap-3 border-b border-gray-100 py-2">
                <dt className="text-gray-500">Asleep around</dt>
                <dd className="font-semibold text-gray-800">{withDay(featured.sleepStart)}</dd>
              </div>
              <div className="flex justify-between gap-3 border-b border-gray-100 py-2">
                <dt className="text-gray-500">Asleep for</dt>
                <dd className="font-semibold text-gray-800">{formatDuration(featured.asleep)}</dd>
              </div>
              <div className="flex justify-between gap-3 border-b border-gray-100 py-2">
                <dt className="text-gray-500">In bed for</dt>
                <dd className="font-semibold text-gray-800">{formatDuration(featured.inBed)}</dd>
              </div>
            </dl>

            <div className="mt-5">
              <div
                role="img"
                aria-label={`${windDown ? `${windDown} minutes to wind down, ` : ''}${buffer} minutes to fall asleep, then ${featured.cycles} cycles of ${cycleLength} minutes.`}
                className="flex h-3 overflow-hidden rounded-full bg-sky-100"
              >
                {timeline.map((segment) => (
                  <div
                    key={segment.id}
                    className={segment.className}
                    style={{ width: `${(segment.minutes / timelineTotal) * 100}%` }}
                  />
                ))}
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                {windDown > 0 && <span className="flex items-center gap-1.5"><i aria-hidden="true" className="w-2 h-2 rounded-full bg-indigo-200" /> Wind-down</span>}
                {buffer > 0 && <span className="flex items-center gap-1.5"><i aria-hidden="true" className="w-2 h-2 rounded-full bg-sky-300" /> Falling asleep</span>}
                <span className="flex items-center gap-1.5"><i aria-hidden="true" className="w-2 h-2 rounded-full bg-sky-500" /> Sleep cycles</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2" role="group" aria-label="Cycle options">
            {plans.map((plan) => {
              const selected = plan.cycles === featured.cycles;
              const best = plan.cycles === recommended.cycles;
              const point = mode === 'wake' ? plan.lightsOut : plan.wake;
              const when = dayLabel(point.day);
              return (
                <button
                  key={plan.cycles}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => { setChosenCycles(plan.cycles); setStatus(''); }}
                  className={`rounded-2xl border px-3 py-3 text-left ${FOCUS} ${selected ? 'bg-white border-sky-200 shadow-sm' : 'bg-white/70 border-gray-200 hover:border-sky-200'}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-gray-900">{plan.cycles} cycles</span>
                    {best && <span className="text-[10px] font-bold uppercase tracking-widest text-sky-700">Closest</span>}
                  </div>
                  <div className="mt-1 text-xs font-medium text-gray-500">{formatDuration(plan.asleep)} asleep</div>
                  <div className="mt-2 text-sm font-black tabular-nums text-sky-800">{formatClock(point.minutes)}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    {mode === 'wake' ? 'Lights out' : 'Wake'}
                  </div>
                  {when && <div className="mt-0.5 text-[11px] font-medium text-gray-500">{when}</div>}
                </button>
              );
            })}
          </div>

          <div className="rounded-2xl border border-sky-100 bg-sky-50/80 p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-sky-700">If you get in bed now</h3>
              <p className="mt-1 text-sm font-medium text-sky-950">
                In bed at {formatClock(now)}, asleep around {withDay(nowPlan.sleepStart)}, up at {withDay(nowPlan.wake)} for {formatDuration(nowPlan.asleep)}.
              </p>
            </div>
            <button type="button" onClick={planFromNow} className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-bold text-sky-900 bg-white border border-sky-100 ${FOCUS}`}>
              Plan from now
            </button>
          </div>
        </div>
      </div>

      <p aria-live="polite" className="relative z-10 mt-4 min-h-5 text-sm font-medium text-sky-800">{status}</p>
    </section>
  );
}

function ChoiceRow({ label, groupLabel, value, options, onChange, format }) {
  return (
    <div>
      <div className="text-sm font-semibold text-gray-600">{label}</div>
      <div role="group" aria-label={groupLabel} className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={value === option}
            onClick={() => onChange(option)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${FOCUS} ${value === option ? 'bg-sky-600 border-sky-600 text-white' : 'bg-white border-gray-200 text-gray-500'}`}
          >
            {format(option)}
          </button>
        ))}
      </div>
    </div>
  );
}
