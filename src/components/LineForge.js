import React, { useEffect, useId, useMemo, useState } from 'react';

const STORAGE_KEY = 'line-forge-v1';
const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2';

const SORTS = [
  { id: 'none', label: 'As typed' },
  { id: 'az', label: 'A → Z' },
  { id: 'za', label: 'Z → A' },
  { id: 'short', label: 'Shortest' },
  { id: 'long', label: 'Longest' },
  { id: 'shuffle', label: 'Shuffle' },
];

const NUMBERS = [
  { id: 'none', label: 'Plain' },
  { id: 'dot', label: '1.' },
  { id: 'paren', label: '1)' },
  { id: 'pad', label: '01' },
];

const JOINS = [
  { id: 'lines', label: 'New lines' },
  { id: 'comma', label: 'Comma' },
  { id: 'bullets', label: 'Bullets' },
];

const SAMPLE = ['fig', 'apple', 'fig', '  banana', 'apple', '', 'cherry', 'Banana'].join('\n');

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return {
      text: typeof data.text === 'string' ? data.text : '',
      trim: data.trim !== false,
      dropBlank: data.dropBlank !== false,
      unique: Boolean(data.unique),
      ignoreCase: Boolean(data.ignoreCase),
      sort: SORTS.some((item) => item.id === data.sort) ? data.sort : 'none',
      numbers: NUMBERS.some((item) => item.id === data.numbers) ? data.numbers : 'none',
      join: JOINS.some((item) => item.id === data.join) ? data.join : 'lines',
      prefix: typeof data.prefix === 'string' ? data.prefix : '',
      suffix: typeof data.suffix === 'string' ? data.suffix : '',
    };
  } catch {
    return null;
  }
}

function splitLines(text) {
  if (!text) return [];
  return text.split(/\r?\n/);
}

function mulberry32(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleLines(lines, seed) {
  const next = [...lines];
  const random = mulberry32(seed || 1);
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [next[index], next[swap]] = [next[swap], next[index]];
  }
  return next;
}

function compareLines(left, right) {
  return left.localeCompare(right, undefined, { numeric: true, sensitivity: 'base' });
}

function shapeLines(text, options) {
  let lines = splitLines(text);
  if (options.trim) lines = lines.map((line) => line.trim());
  if (options.dropBlank) lines = lines.filter((line) => line.length > 0);

  if (options.unique) {
    const seen = new Set();
    lines = lines.filter((line) => {
      const key = options.ignoreCase ? line.toLocaleLowerCase() : line;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  if (options.sort === 'az') lines = [...lines].sort(compareLines);
  else if (options.sort === 'za') lines = [...lines].sort((left, right) => compareLines(right, left));
  else if (options.sort === 'short') {
    lines = [...lines].sort((left, right) => left.length - right.length || compareLines(left, right));
  } else if (options.sort === 'long') {
    lines = [...lines].sort((left, right) => right.length - left.length || compareLines(left, right));
  } else if (options.sort === 'shuffle') {
    lines = shuffleLines(lines, options.shuffleSeed);
  }

  const width = Math.max(2, String(Math.max(lines.length, 1)).length);
  const body = lines.map((line, index) => {
    let marker = '';
    const number = index + 1;
    if (options.numbers === 'dot') marker = `${number}. `;
    else if (options.numbers === 'paren') marker = `${number}) `;
    else if (options.numbers === 'pad') marker = `${String(number).padStart(width, '0')} `;
    const shaped = `${options.prefix}${marker}${line}${options.suffix}`;
    return options.join === 'bullets' ? `• ${shaped}` : shaped;
  });

  const output = options.join === 'comma' ? body.join(', ') : body.join('\n');
  const longest = body.reduce((best, line) => (line.length > best.length ? line : best), '');

  return { lines: body, output, longest };
}

function ChoiceRow({ label, options, value, onChange }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-amber-800/80">{label}</div>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = option.id === value;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option.id)}
              className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition-all active:scale-95 ${FOCUS} ${
                selected
                  ? 'border-amber-300 bg-amber-50 text-amber-800 shadow-sm shadow-amber-600/10'
                  : 'border-gray-200 bg-white text-gray-500 hover:border-amber-200'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function LineForge() {
  const labelId = useId();
  const saved = useMemo(() => loadSaved(), []);
  const [text, setText] = useState(() => saved?.text ?? '');
  const [trim, setTrim] = useState(() => saved?.trim ?? true);
  const [dropBlank, setDropBlank] = useState(() => saved?.dropBlank ?? true);
  const [unique, setUnique] = useState(() => saved?.unique ?? false);
  const [ignoreCase, setIgnoreCase] = useState(() => saved?.ignoreCase ?? false);
  const [sort, setSort] = useState(() => saved?.sort ?? 'none');
  const [numbers, setNumbers] = useState(() => saved?.numbers ?? 'none');
  const [join, setJoin] = useState(() => saved?.join ?? 'lines');
  const [prefix, setPrefix] = useState(() => saved?.prefix ?? '');
  const [suffix, setSuffix] = useState(() => saved?.suffix ?? '');
  const [shuffleSeed, setShuffleSeed] = useState(1);
  const [status, setStatus] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ text, trim, dropBlank, unique, ignoreCase, sort, numbers, join, prefix, suffix }),
      );
    } catch {
      // Ignore storage failures so the list tool still works for this visit.
    }
  }, [text, trim, dropBlank, unique, ignoreCase, sort, numbers, join, prefix, suffix]);

  const sourceLines = useMemo(() => splitLines(text), [text]);
  const shaped = useMemo(
    () => shapeLines(text, { trim, dropBlank, unique, ignoreCase, sort, numbers, join, prefix, suffix, shuffleSeed }),
    [text, trim, dropBlank, unique, ignoreCase, sort, numbers, join, prefix, suffix, shuffleSeed],
  );

  const blankCount = sourceLines.filter((line) => !line.trim()).length;
  const statCards = [
    { label: 'Lines in', value: sourceLines.length ? String(sourceLines.length) : '—' },
    { label: 'Lines out', value: shaped.lines.length ? String(shaped.lines.length) : '—' },
    { label: 'Blank lines', value: sourceLines.length ? String(blankCount) : '—' },
    { label: 'Longest line', value: shaped.longest ? String(shaped.longest.length) : '—' },
  ];

  const copyOutput = async () => {
    if (!shaped.output) {
      setStatus('Nothing to copy yet.');
      return;
    }
    try {
      await navigator.clipboard.writeText(shaped.output);
      setStatus('Shaped list copied.');
    } catch {
      setStatus('Clipboard is blocked in this browser.');
    }
  };

  const chooseSort = (next) => {
    if (next === 'shuffle') setShuffleSeed((seed) => seed + 1);
    setSort(next);
    setStatus('');
  };

  const loadSample = () => {
    setText(SAMPLE);
    setStatus('');
  };

  const clearText = () => {
    setText('');
    setStatus('');
  };

  return (
    <section aria-labelledby={labelId} className="max-w-7xl mx-auto my-12 p-6 md:p-8 bg-white rounded-3xl shadow-[0_20px_50px_rgba(217,119,6,0.08)] border border-gray-100 overflow-hidden relative">
      <div aria-hidden="true" className="absolute top-0 right-0 w-96 h-96 bg-amber-50 rounded-full blur-3xl opacity-80 -mr-32 -mt-32 pointer-events-none" />
      <div aria-hidden="true" className="absolute bottom-0 left-0 w-80 h-80 bg-orange-50 rounded-full blur-3xl opacity-70 -ml-24 -mb-24 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-100 gap-4">
        <div className="flex items-center gap-3">
          <div aria-hidden="true" className="w-10 h-10 shrink-0 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white shadow-md shadow-amber-600/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 6h13" />
              <path d="M8 12h13" />
              <path d="M8 18h13" />
              <path d="M3 6h.01" />
              <path d="M3 12h.01" />
              <path d="M3 18h.01" />
            </svg>
          </div>
          <div>
            <h2 id={labelId} className="text-3xl font-extrabold text-gray-900 tracking-tight">Line Forge</h2>
            <p className="text-gray-500 text-sm font-medium mt-0.5">Sort, dedupe, number, and reshape a list of lines</p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start shrink-0">
          <button type="button" onClick={loadSample} className={`rounded-xl border border-amber-200 bg-white px-4 py-2 text-sm font-bold text-amber-700 active:scale-95 transition-all ${FOCUS}`}>
            Sample
          </button>
          <button type="button" onClick={clearText} className={`rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-500 active:scale-95 transition-all ${FOCUS}`}>
            Clear
          </button>
        </div>
      </div>

      <div className="relative z-10 mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-amber-100 bg-amber-50/70 px-4 py-3 min-w-0">
            <div className="text-lg sm:text-2xl font-black tabular-nums truncate text-amber-950">{card.value}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-amber-800/80">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        <div className="lg:col-span-5 min-w-0 space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 md:p-5">
            <label htmlFor={`${labelId}-text`} className="text-sm font-semibold text-gray-600">Source lines</label>
            <textarea
              id={`${labelId}-text`}
              value={text}
              onChange={(event) => { setText(event.target.value); setStatus(''); }}
              placeholder="Paste one item per line…"
              spellCheck={false}
              rows={8}
              className={`mt-3 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-800 leading-relaxed resize-y outline-none ${FOCUS}`}
            />
            <div className="mt-4 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={trim}
                  onChange={(event) => { setTrim(event.target.checked); setStatus(''); }}
                  className={`mt-0.5 h-4 w-4 accent-amber-600 ${FOCUS}`}
                />
                <span>
                  <span className="block text-sm font-semibold text-gray-700">Trim each line</span>
                  <span className="block text-xs font-medium text-gray-400">Removes spaces at the start and end of every line.</span>
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dropBlank}
                  onChange={(event) => { setDropBlank(event.target.checked); setStatus(''); }}
                  className={`mt-0.5 h-4 w-4 accent-amber-600 ${FOCUS}`}
                />
                <span>
                  <span className="block text-sm font-semibold text-gray-700">Drop blank lines</span>
                  <span className="block text-xs font-medium text-gray-400">Skips empty rows before sorting and numbering.</span>
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={unique}
                  onChange={(event) => { setUnique(event.target.checked); setStatus(''); }}
                  className={`mt-0.5 h-4 w-4 accent-amber-600 ${FOCUS}`}
                />
                <span>
                  <span className="block text-sm font-semibold text-gray-700">Keep first duplicate only</span>
                  <span className="block text-xs font-medium text-gray-400">Later repeats of the same line are removed.</span>
                </span>
              </label>
              <label className={`flex items-start gap-3 ${unique ? 'cursor-pointer' : 'opacity-50'}`}>
                <input
                  type="checkbox"
                  checked={ignoreCase}
                  disabled={!unique}
                  onChange={(event) => { setIgnoreCase(event.target.checked); setStatus(''); }}
                  className={`mt-0.5 h-4 w-4 accent-amber-600 ${FOCUS}`}
                />
                <span>
                  <span className="block text-sm font-semibold text-gray-700">Ignore case when deduping</span>
                  <span className="block text-xs font-medium text-gray-400">Treats Banana and banana as the same line.</span>
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 min-w-0 space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-4 md:p-5 space-y-4">
            <ChoiceRow label="Order" options={SORTS} value={sort} onChange={chooseSort} />
            <ChoiceRow label="Numbering" options={NUMBERS} value={numbers} onChange={(next) => { setNumbers(next); setStatus(''); }} />
            <ChoiceRow label="Join" options={JOINS} value={join} onChange={(next) => { setJoin(next); setStatus(''); }} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-800/80">Prefix</span>
                <input
                  value={prefix}
                  onChange={(event) => { setPrefix(event.target.value); setStatus(''); }}
                  placeholder="— "
                  spellCheck={false}
                  className={`mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-800 outline-none ${FOCUS}`}
                />
              </label>
              <label className="block min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-800/80">Suffix</span>
                <input
                  value={suffix}
                  onChange={(event) => { setSuffix(event.target.value); setStatus(''); }}
                  placeholder=";"
                  spellCheck={false}
                  className={`mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-800 outline-none ${FOCUS}`}
                />
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-4 md:px-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-amber-800/80">Shaped list</h3>
              <button
                type="button"
                onClick={copyOutput}
                className={`rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-amber-700 border border-amber-200 active:scale-95 transition-all ${FOCUS}`}
              >
                Copy
              </button>
            </div>
            <pre className="mt-3 whitespace-pre-wrap break-all font-mono text-sm font-semibold leading-relaxed text-amber-950 min-h-16">
              {shaped.output || 'Your shaped list will land here.'}
            </pre>
            <p className="mt-2 text-xs font-medium text-amber-900/70">
              {sort === 'shuffle'
                ? 'Shuffle again to draw a new order. Numbering and prefix are applied after the sort.'
                : 'Order, numbering, and prefix are applied after trim and dedupe. Click Shuffle any time for a new order.'}
            </p>
          </div>
        </div>
      </div>

      <p role="status" className="relative z-10 mt-4 min-h-5 text-sm font-medium text-amber-800">{status}</p>
    </section>
  );
}
