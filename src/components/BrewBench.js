import React, { useEffect, useId, useMemo, useState } from 'react';

const STORAGE_KEY = 'brew-bench-v1';
const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-700 focus-visible:ring-offset-2';
const CUP_GRAMS = 240;
const ESPRESSO_DOUBLE = 36;

const METHODS = [
  {
    id: 'pour',
    name: 'Pour over',
    kind: 'filter',
    dose: 20,
    doseMin: 12,
    doseMax: 40,
    dosePresets: [15, 20, 30],
    ratio: 16,
    ratioMin: 13,
    ratioMax: 18,
    step: 0.5,
    ratioPresets: [14, 15, 16, 17, 18],
    absorb: 2,
    stages: [
      { id: 'bloom', name: 'Bloom', seconds: 45 },
      { id: 'pour', name: 'Pour', seconds: 90 },
      { id: 'draw', name: 'Drawdown', seconds: 45 },
    ],
  },
  {
    id: 'press',
    name: 'French press',
    kind: 'immersion',
    dose: 32,
    doseMin: 18,
    doseMax: 70,
    dosePresets: [24, 32, 48],
    ratio: 15,
    ratioMin: 12,
    ratioMax: 18,
    step: 0.5,
    ratioPresets: [13, 15, 17],
    absorb: 2.2,
    stages: [
      { id: 'steep', name: 'Steep', seconds: 240 },
      { id: 'plunge', name: 'Plunge', seconds: 30 },
    ],
  },
  {
    id: 'aero',
    name: 'AeroPress',
    kind: 'immersion',
    dose: 15,
    doseMin: 11,
    doseMax: 22,
    dosePresets: [12, 15, 18],
    ratio: 14,
    ratioMin: 11,
    ratioMax: 18,
    step: 0.5,
    ratioPresets: [12, 14, 16],
    absorb: 1.5,
    stages: [
      { id: 'steep', name: 'Steep', seconds: 90 },
      { id: 'press', name: 'Press', seconds: 30 },
    ],
  },
  {
    id: 'espresso',
    name: 'Espresso',
    kind: 'espresso',
    dose: 18,
    doseMin: 14,
    doseMax: 22,
    dosePresets: [16, 18, 20],
    ratio: 2,
    ratioMin: 1.5,
    ratioMax: 3,
    step: 0.1,
    ratioPresets: [1.5, 2, 2.5, 3],
    absorb: 0,
    stages: [
      { id: 'pull', name: 'Pull', seconds: 28 },
    ],
  },
  {
    id: 'cold',
    name: 'Cold brew',
    kind: 'immersion',
    dose: 80,
    doseMin: 40,
    doseMax: 120,
    dosePresets: [60, 80, 100],
    ratio: 10,
    ratioMin: 7,
    ratioMax: 14,
    step: 0.5,
    ratioPresets: [8, 10, 12],
    absorb: 2,
    stages: [
      { id: 'cold', name: 'Steep', seconds: 16 * 60 * 60 },
      { id: 'strain', name: 'Strain', seconds: 120 },
    ],
  },
  {
    id: 'moka',
    name: 'Moka pot',
    kind: 'filter',
    dose: 18,
    doseMin: 12,
    doseMax: 28,
    dosePresets: [15, 18, 22],
    ratio: 10,
    ratioMin: 8,
    ratioMax: 12,
    step: 0.5,
    ratioPresets: [8, 10, 12],
    absorb: 2,
    stages: [
      { id: 'heat', name: 'Heat', seconds: 240 },
    ],
  },
];

const TONE_CLASS = {
  strong: 'bg-amber-50 border-amber-100 text-amber-950',
  balanced: 'bg-emerald-50 border-emerald-100 text-emerald-800',
  light: 'bg-sky-50 border-sky-100 text-sky-800',
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function roundTo(value, places) {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

function formatDecimal(value, places) {
  if (!Number.isFinite(value)) return '0';
  const rounded = roundTo(value, places);
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(places).replace(/0+$/, '').replace(/\.$/, '');
}

function formatGrams(value) {
  return `${formatDecimal(value, 1)} g`;
}

function formatRatio(value) {
  return `1:${formatDecimal(value, 1)}`;
}

function formatClock(seconds) {
  const safe = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  if (hours) return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function spoken(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remain = minutes % 60;
    return remain ? `${hours} hr ${remain} min` : `${hours} hr`;
  }
  if (minutes && secs) return `${minutes} min ${secs} sec`;
  if (minutes) return minutes === 1 ? '1 min' : `${minutes} min`;
  return secs === 1 ? '1 sec' : `${secs} sec`;
}

function formatCups(grams) {
  const cups = roundTo(grams / CUP_GRAMS, 1);
  if (cups <= 0) return 'a few sips';
  const text = formatDecimal(cups, 1);
  return `${text} ${cups === 1 ? 'cup' : 'cups'}`;
}

function formatShots(grams) {
  const doubles = roundTo(grams / ESPRESSO_DOUBLE, 1);
  if (doubles <= 0) return 'a few drops';
  if (doubles === 1) return '1 double shot';
  return `${formatDecimal(doubles, 1)} double shots`;
}

function snap(value, min, max, step) {
  if (!Number.isFinite(value)) return min;
  const clamped = clamp(value, min, max);
  const steps = Math.round((clamped - min) / step);
  return roundTo(clamp(min + steps * step, min, max), 1);
}

function stageSeconds(method, id) {
  const stage = method.stages.find((item) => item.id === id);
  return stage ? stage.seconds : 0;
}

function strengthFor(method, ratio) {
  if (method.kind === 'espresso') {
    if (ratio < 1.8) return { label: 'Ristretto', tone: 'strong' };
    if (ratio > 2.3) return { label: 'Lungo', tone: 'light' };
    return { label: 'Normale', tone: 'balanced' };
  }
  const delta = ratio - method.ratio;
  if (delta <= -1.5) return { label: 'Strong', tone: 'strong' };
  if (delta >= 1.5) return { label: 'Light', tone: 'light' };
  return { label: 'Balanced', tone: 'balanced' };
}

function buildRecipe(method, dose, ratio) {
  const strength = strengthFor(method, ratio);
  if (method.kind === 'espresso') {
    const yieldG = roundTo(dose * ratio, 1);
    return {
      water: null,
      yieldG,
      bloom: null,
      liquid: yieldG,
      serve: formatShots(yieldG),
      strength,
      detail: `Distribute and tamp ${formatGrams(dose)} evenly. Stop the shot at ${formatGrams(yieldG)}, about ${spoken(stageSeconds(method, 'pull'))} from the first drops.`,
    };
  }

  const water = roundTo(dose * ratio, 1);
  const yieldG = roundTo(Math.max(0, water - dose * method.absorb), 1);
  const bloom = method.id === 'pour' ? roundTo(Math.min(water, dose * 2), 1) : null;
  const serve = formatCups(yieldG);
  let detail = '';

  if (method.id === 'pour') {
    detail = `Bloom with ${formatGrams(bloom)} for ${spoken(stageSeconds(method, 'bloom'))}, then pour to ${formatGrams(water)}. Allow about ${spoken(stageSeconds(method, 'draw'))} for the drawdown.`;
  } else if (method.id === 'press') {
    detail = `Stir ${formatGrams(dose)} into ${formatGrams(water)}, then steep for ${spoken(stageSeconds(method, 'steep'))}. Plunge for about ${spoken(stageSeconds(method, 'plunge'))} and stop when you meet resistance.`;
  } else if (method.id === 'aero') {
    detail = `Pour ${formatGrams(water)} over ${formatGrams(dose)} and steep for ${spoken(stageSeconds(method, 'steep'))}. Press gently for ${spoken(stageSeconds(method, 'press'))}.`;
  } else if (method.id === 'cold') {
    detail = `Combine ${formatGrams(dose)} with ${formatGrams(water)} and steep for ${spoken(stageSeconds(method, 'cold'))}. Strain for about ${spoken(stageSeconds(method, 'strain'))}. The ${formatGrams(yieldG)} you pour off is ready to drink.`;
  } else {
    detail = `Add ${formatGrams(water)} to the boiler and ${formatGrams(dose)} to the basket. Take the pot off the heat at the first gurgle, around ${spoken(stageSeconds(method, 'heat'))}.`;
  }

  return { water, yieldG, bloom, liquid: water, serve, strength, detail };
}

function stagesFor(method, recipe) {
  return method.stages.map((stage) => {
    if (stage.id === 'bloom') return { ...stage, hint: `${formatGrams(recipe.bloom)} of water` };
    if (stage.id === 'pour') return { ...stage, hint: `Finish at ${formatGrams(recipe.water)}` };
    if (stage.id === 'steep' && method.id === 'press') return { ...stage, hint: `${formatGrams(recipe.water)} in the beaker` };
    if (stage.id === 'steep' && method.id === 'aero') return { ...stage, hint: `${formatGrams(recipe.water)} in the chamber` };
    if (stage.id === 'plunge') return { ...stage, hint: 'Slow, and stop at resistance' };
    if (stage.id === 'press') return { ...stage, hint: 'Steady pressure to the hiss' };
    if (stage.id === 'pull') return { ...stage, hint: `Stop near ${formatGrams(recipe.yieldG)}` };
    if (stage.id === 'cold') return { ...stage, hint: `${formatGrams(recipe.water)} over the grounds` };
    if (stage.id === 'strain') return { ...stage, hint: 'Paper, cloth, or a fine sieve' };
    if (stage.id === 'heat') return { ...stage, hint: `${formatGrams(recipe.water)} in the boiler` };
    if (stage.id === 'draw') return { ...stage, hint: 'Let the bed drain flat' };
    return { ...stage, hint: '' };
  });
}

function progressFor(stages, elapsed) {
  let cursor = 0;
  const rows = stages.map((stage) => {
    const start = cursor;
    cursor += stage.seconds;
    const filled = clamp(elapsed - start, 0, stage.seconds);
    return {
      ...stage,
      start,
      filled,
      fraction: stage.seconds ? filled / stage.seconds : 1,
    };
  });
  const activeIndex = rows.findIndex((stage) => elapsed < stage.start + stage.seconds);
  const index = activeIndex === -1 ? Math.max(0, rows.length - 1) : activeIndex;
  const active = rows[index];
  const done = cursor > 0 && elapsed >= cursor;
  return {
    rows,
    index,
    done,
    total: cursor,
    remaining: !active || done ? 0 : active.seconds - active.filled,
    totalLeft: Math.max(0, cursor - elapsed),
  };
}

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    const method = METHODS.find((item) => item.id === data.methodId) || METHODS[0];
    return {
      methodId: method.id,
      dose: clamp(Math.round(Number(data.dose) || method.dose), method.doseMin, method.doseMax),
      ratio: snap(Number(data.ratio) || method.ratio, method.ratioMin, method.ratioMax, method.step),
    };
  } catch {
    return null;
  }
}

export default function BrewBench() {
  const labelId = useId();
  const saved = useMemo(() => loadSaved(), []);
  const [methodId, setMethodId] = useState(saved?.methodId || METHODS[0].id);
  const [dose, setDose] = useState(saved?.dose || METHODS[0].dose);
  const [doseInput, setDoseInput] = useState(String(saved?.dose || METHODS[0].dose));
  const [ratio, setRatio] = useState(saved?.ratio || METHODS[0].ratio);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState('');

  const method = METHODS.find((item) => item.id === methodId) || METHODS[0];
  const recipe = useMemo(() => buildRecipe(method, dose, ratio), [method, dose, ratio]);
  const stages = useMemo(() => stagesFor(method, recipe), [method, recipe]);
  const progress = useMemo(() => progressFor(stages, elapsed), [stages, elapsed]);
  const activeStage = progress.rows[progress.index];
  const mixTotal = dose + (recipe.liquid || 0);
  const coffeeShare = mixTotal > 0 ? Math.round((dose / mixTotal) * 100) : 0;
  const liquidShare = Math.max(0, 100 - coffeeShare);
  const liquidName = method.kind === 'espresso' ? 'Yield' : 'Water';

  const stats = method.kind === 'espresso'
    ? [
      { label: 'Dose', value: formatGrams(dose) },
      { label: 'Ratio', value: formatRatio(ratio) },
      { label: 'Yield', value: formatGrams(recipe.yieldG) },
    ]
    : [
      { label: 'Coffee', value: formatGrams(dose) },
      { label: 'Water', value: formatGrams(recipe.water) },
      { label: 'In the cup', value: formatGrams(recipe.yieldG) },
    ];

  const summary = [
    `${method.name} · ${formatRatio(ratio)} · ${recipe.strength.label}`,
    method.kind === 'espresso'
      ? `${formatGrams(dose)} in · ${formatGrams(recipe.yieldG)} out · ${recipe.serve}`
      : `${formatGrams(dose)} coffee · ${formatGrams(recipe.water)} water · ${formatGrams(recipe.yieldG)} in the cup · ${recipe.serve}`,
    recipe.detail,
  ].join('\n');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ methodId: method.id, dose, ratio }));
    } catch {
      setStatus('This browser blocked saving, so the recipe stays in this tab only.');
    }
  }, [method.id, dose, ratio]);

  useEffect(() => {
    if (!running) return undefined;
    const id = window.setInterval(() => {
      setElapsed((current) => Math.min(progress.total, current + 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [running, progress.total]);

  useEffect(() => {
    if (running && progress.done) {
      setRunning(false);
      setStatus('Brew finished.');
    }
  }, [running, progress.done]);

  const applyDose = (next) => {
    const safe = clamp(Math.round(next), method.doseMin, method.doseMax);
    setDose(safe);
    setDoseInput(String(safe));
    setStatus('');
  };

  const chooseMethod = (id) => {
    const next = METHODS.find((item) => item.id === id);
    if (!next || next.id === method.id) return;
    const nextDose = clamp(dose, next.doseMin, next.doseMax);
    setMethodId(next.id);
    setDose(nextDose);
    setDoseInput(String(nextDose));
    setRatio(next.ratio);
    setElapsed(0);
    setRunning(false);
    setStatus('');
  };

  const editDose = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 3);
    setDoseInput(digits);
    if (!digits) {
      setStatus('');
      return;
    }
    const number = Math.round(Number(digits));
    if (number >= method.doseMin && number <= method.doseMax) setDose(number);
    setStatus('');
  };

  const commitDose = () => {
    const digits = doseInput.replace(/\D/g, '');
    const number = digits
      ? clamp(Math.round(Number(digits)), method.doseMin, method.doseMax)
      : dose;
    setDose(number);
    setDoseInput(String(number));
  };

  const editRatio = (value) => {
    setRatio(snap(Number(value), method.ratioMin, method.ratioMax, method.step));
    setStatus('');
  };

  const toggleClock = () => {
    if (progress.done) {
      setElapsed(0);
      setRunning(true);
      setStatus('');
      return;
    }
    setRunning((current) => !current);
    setStatus('');
  };

  const resetClock = () => {
    setElapsed(0);
    setRunning(false);
    setStatus('');
  };

  const copyRecipe = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setStatus('Recipe copied.');
    } catch {
      setStatus('Clipboard is blocked in this browser.');
    }
  };

  const clockLabel = progress.done ? 'Brew again' : running ? 'Pause' : elapsed > 0 ? 'Resume' : 'Start';

  return (
    <section aria-labelledby={labelId} className="max-w-7xl mx-auto my-12 p-6 md:p-8 bg-white rounded-3xl shadow-[0_20px_50px_rgba(68,64,60,0.08)] border border-gray-100 overflow-hidden relative">
      <div aria-hidden="true" className="absolute top-0 right-0 w-96 h-96 bg-amber-50 rounded-full blur-3xl opacity-80 -mr-32 -mt-32 pointer-events-none" />
      <div aria-hidden="true" className="absolute bottom-0 left-0 w-80 h-80 bg-stone-100 rounded-full blur-3xl opacity-70 -ml-24 -mb-24 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-100 gap-4">
        <div className="flex items-center gap-3">
          <div aria-hidden="true" className="w-10 h-10 shrink-0 rounded-2xl bg-gradient-to-tr from-stone-700 to-amber-500 flex items-center justify-center text-white shadow-md shadow-stone-700/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
              <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" />
              <path d="M6 2v3" />
              <path d="M10 2v3" />
              <path d="M14 2v3" />
            </svg>
          </div>
          <div>
            <h2 id={labelId} className="text-3xl font-extrabold text-gray-900 tracking-tight">Brew Bench</h2>
            <p className="text-gray-500 text-sm font-medium mt-0.5">Set the dose and ratio, then brew on a clock that follows the method</p>
          </div>
        </div>
        <button type="button" onClick={copyRecipe} className={`self-start shrink-0 px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-stone-800 to-stone-600 shadow-md shadow-stone-700/20 active:scale-95 transition-all ${FOCUS}`}>
          {status === 'Recipe copied.' ? 'Copied' : 'Copy recipe'}
        </button>
      </div>

      <div className="relative z-10 mt-5 grid grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-amber-100 bg-amber-50/70 px-4 py-3 min-w-0">
            <div className="text-lg sm:text-2xl font-black tabular-nums text-amber-950 truncate">{stat.value}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-amber-800/80">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        <div className="lg:col-span-5 min-w-0 space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 md:p-5 space-y-4">
            <div>
              <div className="text-sm font-semibold text-gray-600">Method</div>
              <div role="group" aria-label="Brew method" className="mt-2 flex flex-wrap gap-2">
                {METHODS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={item.id === method.id}
                    onClick={() => chooseMethod(item.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${FOCUS} ${item.id === method.id ? 'bg-stone-800 border-stone-800 text-white' : 'bg-white border-gray-200 text-gray-500'}`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between gap-3 mb-2">
                <label htmlFor={`${labelId}-dose`} className="text-sm font-semibold text-gray-600">Coffee dose</label>
                <output htmlFor={`${labelId}-dose`} className="text-sm font-mono font-bold text-amber-800">{formatGrams(dose)}</output>
              </div>
              <input
                id={`${labelId}-dose`}
                type="range"
                min={method.doseMin}
                max={method.doseMax}
                step="1"
                value={dose}
                onChange={(event) => applyDose(Number(event.target.value))}
                className={`w-full cursor-pointer accent-stone-700 ${FOCUS}`}
              />
              <div className="mt-3 flex flex-col sm:flex-row gap-2">
                <input
                  aria-label="Dose in grams"
                  inputMode="numeric"
                  value={doseInput}
                  onChange={(event) => editDose(event.target.value)}
                  onBlur={commitDose}
                  className={`w-full sm:w-28 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-800 ${FOCUS}`}
                />
                <div role="group" aria-label="Dose shortcuts" className="flex flex-wrap gap-2">
                  {method.dosePresets.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      aria-pressed={dose === preset}
                      onClick={() => applyDose(preset)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${FOCUS} ${dose === preset ? 'bg-stone-800 border-stone-800 text-white' : 'bg-white border-gray-200 text-gray-500'}`}
                    >
                      {preset} g
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between gap-3 mb-2">
                <label htmlFor={`${labelId}-ratio`} className="text-sm font-semibold text-gray-600">
                  {method.kind === 'espresso' ? 'Yield per gram' : 'Water per gram'}
                </label>
                <output htmlFor={`${labelId}-ratio`} className="text-sm font-mono font-bold text-amber-800">{formatRatio(ratio)}</output>
              </div>
              <input
                id={`${labelId}-ratio`}
                type="range"
                min={method.ratioMin}
                max={method.ratioMax}
                step={method.step}
                value={ratio}
                onChange={(event) => editRatio(event.target.value)}
                className={`w-full cursor-pointer accent-amber-600 ${FOCUS}`}
              />
              <div role="group" aria-label="Ratio shortcuts" className="mt-3 flex flex-wrap gap-2">
                {method.ratioPresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    aria-pressed={roundTo(ratio, 1) === preset}
                    onClick={() => { setRatio(preset); setStatus(''); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${FOCUS} ${roundTo(ratio, 1) === preset ? 'bg-stone-800 border-stone-800 text-white' : 'bg-white border-gray-200 text-gray-500'}`}
                  >
                    {formatRatio(preset)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-4 md:p-5">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-amber-800">In the recipe</h3>
            <div
              className="mt-3 flex h-3 overflow-hidden rounded-full bg-amber-100"
              role="img"
              aria-label={`${formatGrams(dose)} coffee and ${formatGrams(recipe.liquid)} ${liquidName.toLowerCase()}`}
            >
              <div className="h-full bg-stone-700" style={{ width: `${coffeeShare}%` }} />
              <div className="h-full bg-amber-400" style={{ width: `${liquidShare}%` }} />
            </div>
            <div className="mt-2 flex justify-between gap-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <span>Coffee {coffeeShare}%</span>
              <span>{liquidName} {liquidShare}%</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 min-w-0 space-y-4">
          <div className={`rounded-2xl border px-4 py-4 md:px-5 ${TONE_CLASS[recipe.strength.tone]}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-[10px] font-bold uppercase tracking-widest opacity-80">This batch</h3>
                <p className="mt-1 text-2xl font-black tracking-tight">{recipe.serve}</p>
              </div>
              <span className="shrink-0 rounded-full bg-white/80 px-3 py-1 text-xs font-bold">{recipe.strength.label}</span>
            </div>
            <p className="mt-3 text-sm font-medium leading-relaxed">{recipe.detail}</p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-4 md:p-5">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-amber-800">Brew clock</h3>
                <div role="timer" aria-label={progress.done ? 'Brew finished' : `${activeStage?.name || 'Brew'}, ${formatClock(progress.remaining)} remaining in this step`} className="mt-2 text-5xl font-black tabular-nums tracking-tight text-gray-900">
                  {formatClock(progress.remaining)}
                </div>
                <p className="mt-1 text-sm font-semibold text-amber-800">
                  {progress.done ? 'Ready to pour' : activeStage?.name}
                </p>
                <p className="text-xs font-medium text-gray-500">
                  {progress.done ? 'The last step is done.' : `${formatClock(progress.totalLeft)} left in the brew`}
                </p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={toggleClock} className={`rounded-xl px-4 py-2.5 text-sm font-bold text-white bg-stone-800 active:scale-95 ${FOCUS}`}>
                  {clockLabel}
                </button>
                <button type="button" onClick={resetClock} disabled={elapsed === 0 && !running} className={`rounded-xl px-4 py-2.5 text-sm font-bold text-gray-500 border border-gray-200 disabled:opacity-40 ${FOCUS}`}>
                  Reset
                </button>
              </div>
            </div>

            <ol className="mt-5 space-y-2">
              {progress.rows.map((stage, index) => {
                const complete = stage.filled >= stage.seconds && stage.seconds > 0;
                const current = !progress.done && index === progress.index;
                return (
                  <li key={stage.id} className={`rounded-xl border px-3 py-3 ${current ? 'bg-amber-50/80 border-amber-200 shadow-sm' : 'bg-gray-50/80 border-gray-100'}`} aria-current={current ? 'step' : undefined}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-gray-900">{stage.name}</div>
                        <div className="text-xs text-gray-500">{stage.hint}</div>
                      </div>
                      <span className={`shrink-0 text-xs font-mono font-bold ${complete ? 'text-emerald-700' : 'text-amber-800'}`}>
                        {complete ? 'Done' : formatClock(current ? progress.remaining : stage.seconds)}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-amber-100 overflow-hidden" aria-hidden="true">
                      <div className={`h-full rounded-full ${complete ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${Math.round(stage.fraction * 100)}%` }} />
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>

      <p aria-live="polite" className="relative z-10 mt-4 min-h-5 text-sm font-medium text-amber-950">{status}</p>
    </section>
  );
}
