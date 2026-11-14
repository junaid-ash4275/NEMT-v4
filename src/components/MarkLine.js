import React, { useEffect, useId, useMemo, useState } from 'react';

const STORAGE_KEY = 'mark-line-v1';
const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2';
const MAX_CATEGORIES = 8;
const MAX_SCORES = 30;

const LETTERS = [
  { letter: 'A', cut: 93 },
  { letter: 'A-', cut: 90 },
  { letter: 'B+', cut: 87 },
  { letter: 'B', cut: 83 },
  { letter: 'B-', cut: 80 },
  { letter: 'C+', cut: 77 },
  { letter: 'C', cut: 73 },
  { letter: 'C-', cut: 70 },
  { letter: 'D', cut: 60 },
];

const TARGETS = [
  { name: 'A', value: 93 },
  { name: 'A-', value: 90 },
  { name: 'B+', value: 87 },
  { name: 'B', value: 83 },
  { name: 'C', value: 73 },
];

const SCHEMES = [
  {
    id: 'standard',
    name: 'Standard',
    dropLowest: false,
    categories: [
      { name: 'Homework', weight: 20, scores: [92, 88, 95, 90] },
      { name: 'Quizzes', weight: 15, scores: [84, 78, 91] },
      { name: 'Midterm', weight: 25, scores: [86] },
      { name: 'Final', weight: 40, scores: [] },
    ],
  },
  {
    id: 'exam',
    name: 'Exam heavy',
    dropLowest: false,
    categories: [
      { name: 'Homework', weight: 10, scores: [95, 88] },
      { name: 'Midterm', weight: 30, scores: [82] },
      { name: 'Final', weight: 60, scores: [] },
    ],
  },
  {
    id: 'studio',
    name: 'Studio',
    dropLowest: true,
    categories: [
      { name: 'Projects', weight: 50, scores: [94, 88, 76] },
      { name: 'Critiques', weight: 20, scores: [90, 85] },
      { name: 'Final', weight: 30, scores: [] },
    ],
  },
  {
    id: 'exams',
    name: 'Four exams',
    dropLowest: true,
    categories: [
      { name: 'Exam 1', weight: 25, scores: [78] },
      { name: 'Exam 2', weight: 25, scores: [91] },
      { name: 'Exam 3', weight: 25, scores: [84] },
      { name: 'Exam 4', weight: 25, scores: [] },
    ],
  },
];

let sequence = 0;

function nextId() {
  sequence += 1;
  return `cat-${Date.now().toString(36)}-${sequence}`;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function parseWhole(value, max) {
  const digits = String(value || '').replace(/[^\d]/g, '');
  if (!digits) return 0;
  return clamp(Math.round(Number(digits)), 0, max);
}

function parseScore(value) {
  const number = Number(String(value ?? '').trim());
  if (!Number.isFinite(number)) return null;
  return clamp(Math.round(number * 10) / 10, 0, 100);
}

function formatScore(value) {
  if (value == null || !Number.isFinite(value)) return '—';
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

function letterFor(value) {
  if (value == null || !Number.isFinite(value)) return '—';
  const rounded = Math.round(value * 10) / 10;
  const match = LETTERS.find((band) => rounded >= band.cut);
  return match ? match.letter : 'F';
}

function droppedIndex(scores, dropLowest) {
  if (!dropLowest || scores.length < 2) return -1;
  let index = 0;
  scores.forEach((score, scoreIndex) => {
    if (score < scores[index]) index = scoreIndex;
  });
  return index;
}

function categoryAverage(scores, dropLowest) {
  if (!scores.length) return null;
  const skip = droppedIndex(scores, dropLowest);
  const kept = scores.filter((_, index) => index !== skip);
  const total = kept.reduce((sum, score) => sum + score, 0);
  return total / kept.length;
}

function sanitizeCategory(category) {
  if (!category || typeof category !== 'object') return null;
  const name = String(category.name || '').trim().slice(0, 32);
  if (!name) return null;
  const weight = clamp(Math.round(Number(category.weight) || 0), 0, 100);
  const scores = Array.isArray(category.scores)
    ? category.scores
      .map((score) => {
        const number = Number(score);
        if (!Number.isFinite(number)) return null;
        return clamp(Math.round(number * 10) / 10, 0, 100);
      })
      .filter((score) => score != null)
      .slice(0, MAX_SCORES)
    : [];
  const id = /^[a-z0-9-]{1,40}$/i.test(String(category.id || '')) ? String(category.id) : nextId();
  return { id, name, weight, scores };
}

function withUniqueIds(categories) {
  const seen = new Set();
  return categories.map((category) => {
    if (!seen.has(category.id)) {
      seen.add(category.id);
      return category;
    }
    const id = nextId();
    seen.add(id);
    return { ...category, id };
  });
}

function freshCategories(categories) {
  return categories.map((category) => ({
    id: nextId(),
    name: category.name,
    weight: category.weight,
    scores: [...category.scores],
  }));
}

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    const categories = withUniqueIds(
      (Array.isArray(data.categories) ? data.categories : [])
        .map(sanitizeCategory)
        .filter(Boolean)
        .slice(0, MAX_CATEGORIES),
    );
    if (!categories.length) return null;
    return {
      categories,
      target: clamp(Math.round(Number(data.target) || 90), 50, 100),
      dropLowest: Boolean(data.dropLowest),
    };
  } catch {
    return null;
  }
}

function buildSummary(categories, dropLowest, target) {
  const rows = categories.map((category) => {
    const average = categoryAverage(category.scores, dropLowest);
    return {
      ...category,
      average,
      dropped: droppedIndex(category.scores, dropLowest),
    };
  });
  const weighted = rows.filter((row) => row.weight > 0);
  const totalWeight = weighted.reduce((sum, row) => sum + row.weight, 0);
  const scored = weighted.filter((row) => row.average != null);
  const open = weighted.filter((row) => row.average == null);
  const earned = scored.reduce((sum, row) => sum + row.weight * row.average, 0);
  const scoredWeight = scored.reduce((sum, row) => sum + row.weight, 0);
  const openWeight = open.reduce((sum, row) => sum + row.weight, 0);
  const pace = scoredWeight > 0 ? earned / scoredWeight : null;
  const floor = totalWeight > 0 && scoredWeight > 0 ? earned / totalWeight : null;
  const best = totalWeight > 0 && scoredWeight > 0 ? (earned + openWeight * 100) / totalWeight : null;
  const course = openWeight === 0 && totalWeight > 0 && scoredWeight > 0 ? earned / totalWeight : null;
  const needed = openWeight > 0 && scoredWeight > 0
    ? (target * totalWeight - earned) / openWeight
    : null;
  const neededCeiling = needed == null ? null : Math.ceil(needed * 10 - 1e-9) / 10;

  return {
    rows,
    totalWeight,
    pace,
    floor,
    best,
    course,
    needed,
    neededCeiling,
    openNames: open.map((row) => row.name),
    openWeight,
    scoredWeight,
  };
}

function projectionCopy(summary, target) {
  if (summary.totalWeight <= 0) {
    return 'Give at least one category a weight above 0. The course grade follows those weights.';
  }
  if (summary.scoredWeight <= 0) {
    return 'Add a score to see where the course stands. Leave a category empty to solve for the grade it still needs.';
  }
  if (summary.openWeight <= 0) {
    return `Every weighted category has a score, so ${formatScore(summary.course)}% (${letterFor(summary.course)}) is the course grade.`;
  }
  const where = summary.openNames.length === 1
    ? summary.openNames[0]
    : `the remaining work (${summary.openNames.join(', ')})`;
  if (summary.needed <= 0) {
    return `The ${formatScore(target)}% target is already covered. Even a zero on ${where} keeps the course at ${formatScore(summary.floor)}%.`;
  }
  if (summary.needed > 100) {
    return `Even a 100 on ${where} lands at ${formatScore(summary.best)}% (${letterFor(summary.best)}), short of ${formatScore(target)}%.`;
  }
  return `Average ${formatScore(summary.neededCeiling)} on ${where} to finish at ${formatScore(target)}%. A perfect score there lands at ${formatScore(summary.best)}%.`;
}

export default function MarkLine() {
  const labelId = useId();
  const saved = useMemo(() => loadSaved(), []);
  const [categories, setCategories] = useState(
    () => saved?.categories || freshCategories(SCHEMES[0].categories),
  );
  const [target, setTarget] = useState(saved?.target ?? 90);
  const [dropLowest, setDropLowest] = useState(saved?.dropLowest ?? SCHEMES[0].dropLowest);
  const [drafts, setDrafts] = useState({});
  const [status, setStatus] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ categories, target, dropLowest }));
    } catch {
      setStatus('This browser blocked saving, so the grades stay in this tab only.');
    }
  }, [categories, target, dropLowest]);

  const summary = useMemo(
    () => buildSummary(categories, dropLowest, target),
    [categories, dropLowest, target],
  );
  const activeScheme = SCHEMES.find((scheme) => (
    scheme.dropLowest === dropLowest
    && scheme.categories.length === categories.length
    && scheme.categories.every((category, index) => {
      const current = categories[index];
      return current.name === category.name
        && current.weight === category.weight
        && current.scores.length === category.scores.length
        && current.scores.every((score, scoreIndex) => score === category.scores[scoreIndex]);
    })
  ));

  const openLabel = summary.openNames.length === 1 ? summary.openNames[0] : 'the rest';
  const stats = summary.scoredWeight <= 0
    ? [
      { label: 'Scored work', value: '—' },
      { label: 'Best possible', value: '—' },
      { label: 'Still needed', value: '—' },
    ]
    : summary.openWeight <= 0
      ? [
        { label: 'Course grade', value: `${formatScore(summary.course)}%` },
        { label: 'Letter', value: letterFor(summary.course) },
        { label: summary.course >= target ? 'Target' : 'Short of target', value: summary.course >= target ? 'Met' : `${formatScore(target - summary.course)}` },
      ]
      : [
        { label: 'Scored work', value: `${formatScore(summary.pace)}%` },
        { label: 'Best possible', value: `${formatScore(summary.best)}%` },
        {
          label: summary.needed <= 0 ? 'Target' : `Need on ${openLabel}`,
          value: summary.needed <= 0 ? 'Met' : summary.needed > 100 ? '100+' : formatScore(summary.neededCeiling),
        },
      ];

  const applyScheme = (scheme) => {
    setCategories(freshCategories(scheme.categories));
    setDropLowest(scheme.dropLowest);
    setDrafts({});
    setStatus('');
  };

  const updateCategory = (id, patch) => {
    setCategories((current) => current.map((category) => (
      category.id === id ? { ...category, ...patch } : category
    )));
    setStatus('');
  };

  const addCategory = () => {
    if (categories.length >= MAX_CATEGORIES) {
      setStatus('Eight categories is the limit.');
      return;
    }
    const id = nextId();
    setCategories((current) => [...current, { id, name: 'New category', weight: 10, scores: [] }]);
    setStatus('');
  };

  const removeCategory = (id) => {
    setCategories((current) => current.filter((category) => category.id !== id));
    setDrafts((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
    setStatus('');
  };

  const addScore = (id) => {
    const parsed = parseScore(drafts[id]);
    if (parsed == null) {
      setStatus('Enter a score from 0 to 100.');
      return;
    }
    const category = categories.find((item) => item.id === id);
    if (!category) return;
    if (category.scores.length >= MAX_SCORES) {
      setStatus('Each category holds up to 30 scores.');
      return;
    }
    setCategories((current) => current.map((item) => (
      item.id === id ? { ...item, scores: [...item.scores, parsed] } : item
    )));
    setDrafts((current) => ({ ...current, [id]: '' }));
    setStatus('');
  };

  const removeScore = (id, index) => {
    setCategories((current) => current.map((category) => (
      category.id === id
        ? { ...category, scores: category.scores.filter((_, scoreIndex) => scoreIndex !== index) }
        : category
    )));
    setStatus('');
  };

  const copyPlan = async () => {
    const lines = [
      `Target ${formatScore(target)}% (${letterFor(target)})`,
      dropLowest ? 'Drops the lowest score in each category' : 'Keeps every score',
      projectionCopy(summary, target),
      ...summary.rows.map((row) => {
        const scores = row.scores.length ? row.scores.map(formatScore).join(', ') : 'not scored';
        const average = row.average == null ? '—' : formatScore(row.average);
        return `${row.name} ${row.weight}% · ${average} (${scores})`;
      }),
    ];
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setStatus('Grade plan copied.');
    } catch {
      setStatus('Clipboard is blocked in this browser.');
    }
  };

  return (
    <section aria-labelledby={labelId} className="max-w-7xl mx-auto my-12 p-6 md:p-8 bg-white rounded-3xl shadow-[0_20px_50px_rgba(225,29,72,0.08)] border border-gray-100 overflow-hidden relative">
      <div aria-hidden="true" className="absolute top-0 right-0 w-96 h-96 bg-rose-50 rounded-full blur-3xl opacity-80 -mr-32 -mt-32 pointer-events-none" />
      <div aria-hidden="true" className="absolute bottom-0 left-0 w-80 h-80 bg-orange-50 rounded-full blur-3xl opacity-70 -ml-24 -mb-24 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-100 gap-4">
        <div className="flex items-center gap-3">
          <div aria-hidden="true" className="w-10 h-10 shrink-0 rounded-2xl bg-gradient-to-tr from-rose-600 to-orange-400 flex items-center justify-center text-white shadow-md shadow-rose-600/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10 12 5 2 10l10 5 10-5Z" />
              <path d="M6 12v5c3 2 9 2 12 0v-5" />
            </svg>
          </div>
          <div>
            <h2 id={labelId} className="text-3xl font-extrabold text-gray-900 tracking-tight">Mark Line</h2>
            <p className="text-gray-500 text-sm font-medium mt-0.5">Weight the scores you have, then see what the rest of the course needs</p>
          </div>
        </div>
        <button type="button" onClick={copyPlan} className={`self-start shrink-0 px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-rose-600 to-rose-500 shadow-md shadow-rose-600/20 active:scale-95 transition-all ${FOCUS}`}>
          {status === 'Grade plan copied.' ? 'Copied' : 'Copy plan'}
        </button>
      </div>

      <div className="relative z-10 mt-5 grid grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-rose-100 bg-rose-50/70 px-4 py-3 min-w-0">
            <div className="text-lg sm:text-2xl font-black tabular-nums text-rose-800 truncate">{stat.value}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-rose-700/80 truncate">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        <div className="lg:col-span-5 min-w-0 space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 md:p-5 space-y-4">
            <div>
              <div className="text-sm font-semibold text-gray-600">Course setups</div>
              <div role="group" aria-label="Grade schemes" className="mt-2 flex flex-wrap gap-2">
                {SCHEMES.map((scheme) => (
                  <button
                    key={scheme.id}
                    type="button"
                    aria-pressed={activeScheme?.id === scheme.id}
                    onClick={() => applyScheme(scheme)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${FOCUS} ${activeScheme?.id === scheme.id ? 'bg-rose-600 border-rose-600 text-white' : 'bg-white border-gray-200 text-gray-500'}`}
                  >
                    {scheme.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between gap-3 mb-2">
                <label htmlFor={`${labelId}-target`} className="text-sm font-semibold text-gray-600">Target</label>
                <output htmlFor={`${labelId}-target`} className="text-sm font-mono font-bold text-rose-700">{formatScore(target)}% · {letterFor(target)}</output>
              </div>
              <input
                id={`${labelId}-target`}
                type="range"
                min="50"
                max="100"
                step="1"
                value={target}
                onChange={(event) => { setTarget(Number(event.target.value)); setStatus(''); }}
                className={`w-full cursor-pointer accent-rose-600 ${FOCUS}`}
              />
              <div role="group" aria-label="Letter targets" className="mt-3 flex flex-wrap gap-2">
                {TARGETS.map((option) => (
                  <button
                    key={option.name}
                    type="button"
                    aria-pressed={target === option.value}
                    onClick={() => { setTarget(option.value); setStatus(''); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${FOCUS} ${target === option.value ? 'bg-rose-600 border-rose-600 text-white' : 'bg-white border-gray-200 text-gray-500'}`}
                  >
                    {option.name}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white px-3 py-3">
              <input
                type="checkbox"
                checked={dropLowest}
                onChange={(event) => { setDropLowest(event.target.checked); setStatus(''); }}
                className={`mt-0.5 accent-rose-600 ${FOCUS}`}
              />
              <span>
                <span className="block text-sm font-semibold text-gray-800">Drop the lowest score</span>
                <span className="block text-xs font-medium text-gray-500 mt-0.5">When a category has two or more scores, the lowest one stays out of its average.</span>
              </span>
            </label>
          </div>

          <div className="rounded-2xl border border-rose-100 bg-rose-50/80 p-4 md:p-5">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-rose-700">Letter line</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {LETTERS.map((band) => (
                <div key={band.letter} className={`rounded-lg px-2 py-1 text-xs font-bold ${letterFor(summary.course ?? summary.pace) === band.letter ? 'bg-rose-600 text-white' : 'bg-white text-rose-800'}`}>
                  {band.letter} {band.cut}
                </div>
              ))}
              <div className={`rounded-lg px-2 py-1 text-xs font-bold ${letterFor(summary.course ?? summary.pace) === 'F' ? 'bg-rose-600 text-white' : 'bg-white text-rose-800'}`}>
                F below 60
              </div>
            </div>
            <p className="mt-3 text-xs font-medium text-rose-800">Weights currently total {summary.totalWeight}. The average uses them as entered, even when they do not add up to 100.</p>
          </div>
        </div>

        <div className="lg:col-span-7 min-w-0 space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-4 md:p-5">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-rose-700">Where the course lands</h3>
            <p className="mt-2 text-sm font-medium leading-relaxed text-gray-600">{projectionCopy(summary, target)}</p>
            {summary.totalWeight > 0 && (
              <>
                <div aria-hidden="true" className="mt-5 flex h-3 overflow-hidden rounded-full bg-rose-100">
                  {summary.rows.filter((row) => row.weight > 0).map((row) => (
                    <div
                      key={row.id}
                      className={row.average == null ? 'h-full bg-rose-200' : 'h-full bg-rose-600'}
                      style={{ width: `${(row.weight / summary.totalWeight) * 100}%` }}
                    />
                  ))}
                </div>
                <div className="mt-2 flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  <span>Scored weight</span>
                  <span>Still open</span>
                </div>
              </>
            )}
            <dl className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-2 text-sm">
              <div className="border-b border-gray-100 py-2">
                <dt className="text-gray-500">If the rest matches</dt>
                <dd className="font-semibold text-gray-900">{summary.pace == null ? '—' : `${formatScore(summary.pace)}%`}</dd>
              </div>
              <div className="border-b border-gray-100 py-2">
                <dt className="text-gray-500">If the rest is perfect</dt>
                <dd className="font-semibold text-gray-900">{summary.best == null ? '—' : `${formatScore(summary.best)}%`}</dd>
              </div>
              <div className="border-b border-gray-100 py-2">
                <dt className="text-gray-500">If the rest is zero</dt>
                <dd className="font-semibold text-gray-900">{summary.floor == null ? '—' : `${formatScore(summary.floor)}%`}</dd>
              </div>
            </dl>
          </div>

          <div className="space-y-3">
            {summary.rows.map((row) => (
              <div key={row.id} className="rounded-2xl border border-gray-100 bg-white p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <input
                    aria-label={`${row.name} name`}
                    value={row.name}
                    onChange={(event) => updateCategory(row.id, { name: event.target.value.slice(0, 32) })}
                    onBlur={(event) => {
                      const name = event.target.value.trim().slice(0, 32);
                      updateCategory(row.id, { name: name || 'Category' });
                    }}
                    className={`min-w-0 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-semibold text-gray-800 ${FOCUS}`}
                  />
                  <div className="flex items-center gap-2">
                    <input
                      aria-label={`${row.name} weight percent`}
                      inputMode="numeric"
                      value={row.weight}
                      onChange={(event) => updateCategory(row.id, { weight: parseWhole(event.target.value, 100) })}
                      className={`w-20 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-semibold text-gray-800 ${FOCUS}`}
                    />
                    <span className="text-sm font-bold text-gray-400">%</span>
                    <button
                      type="button"
                      onClick={() => removeCategory(row.id)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold border border-gray-200 text-gray-500 ${FOCUS}`}
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {row.scores.map((score, index) => (
                    <button
                      key={`${row.id}-${index}`}
                      type="button"
                      aria-label={index === row.dropped ? `Remove dropped score ${formatScore(score)} from ${row.name}` : `Remove ${formatScore(score)} from ${row.name}`}
                      onClick={() => removeScore(row.id, index)}
                      className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-bold ${FOCUS} ${index === row.dropped ? 'border-gray-200 bg-gray-50 text-gray-400 line-through' : 'border-rose-100 bg-rose-50 text-rose-800'}`}
                    >
                      {formatScore(score)}
                      <span aria-hidden="true">×</span>
                    </button>
                  ))}
                </div>

                <form
                  className="mt-3 flex gap-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    addScore(row.id);
                  }}
                >
                  <input
                    aria-label={`Add a score to ${row.name}`}
                    inputMode="decimal"
                    placeholder="Add score"
                    value={drafts[row.id] || ''}
                    onChange={(event) => setDrafts((current) => ({ ...current, [row.id]: event.target.value }))}
                    className={`min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-800 ${FOCUS}`}
                  />
                  <button type="submit" className={`shrink-0 px-3 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 ${FOCUS}`}>
                    Add
                  </button>
                </form>
                <p className="mt-2 text-xs font-medium text-gray-500">
                  {row.average == null
                    ? 'No scores yet. This weight stays open.'
                    : `Average ${formatScore(row.average)}${row.weight === 0 ? ' · weight 0, so it stays out of the course grade' : ''}${row.dropped >= 0 ? ` · lowest ${formatScore(row.scores[row.dropped])} dropped` : ''}`}
                </p>
              </div>
            ))}

            <button type="button" onClick={addCategory} className={`w-full rounded-2xl border border-dashed border-rose-200 bg-rose-50/50 px-4 py-3 text-sm font-bold text-rose-700 ${FOCUS}`}>
              Add category
            </button>
          </div>
        </div>
      </div>

      <p aria-live="polite" className="relative z-10 mt-4 min-h-5 text-sm font-medium text-rose-800">{status}</p>
    </section>
  );
}
