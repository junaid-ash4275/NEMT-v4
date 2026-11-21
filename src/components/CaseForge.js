import React, { useEffect, useId, useMemo, useState } from 'react';

const STORAGE_KEY = 'case-forge-v1';
const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2';

const FILLER = new Set(['a', 'an', 'the', 'and', 'or', 'of', 'to', 'for', 'in', 'on', 'at', 'by', 'with']);

const SAMPLE = 'get HTTP response from the user profile API';

const STYLES = [
  { id: 'camel', label: 'camelCase', hint: 'Variables' },
  { id: 'pascal', label: 'PascalCase', hint: 'Types' },
  { id: 'snake', label: 'snake_case', hint: 'Python, SQL' },
  { id: 'constant', label: 'CONSTANT_CASE', hint: 'Constants' },
  { id: 'kebab', label: 'kebab-case', hint: 'URLs, CSS' },
  { id: 'dot', label: 'dot.case', hint: 'Config keys' },
  { id: 'path', label: 'path/case', hint: 'Routes' },
  { id: 'title', label: 'Title Case', hint: 'Headings' },
  { id: 'sentence', label: 'Sentence case', hint: 'Prose' },
  { id: 'lower', label: 'lowercase', hint: 'Plain text' },
  { id: 'upper', label: 'UPPERCASE', hint: 'Labels' },
];

const IDENTIFIER_STYLES = new Set(['camel', 'pascal', 'snake', 'constant', 'kebab', 'dot', 'path']);

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return {
      text: typeof data.text === 'string' ? data.text : '',
      dropFiller: Boolean(data.dropFiller),
      active: STYLES.some((style) => style.id === data.active) ? data.active : 'camel',
    };
  } catch {
    return null;
  }
}

function splitWords(input) {
  const spaced = input
    .replace(/['’]/g, '')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2');

  return spaced
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((word) => word.toLowerCase());
}

function capitalize(word) {
  if (!word) return '';
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function formatStyle(id, words) {
  if (!words.length) return '';

  switch (id) {
    case 'camel':
      return words.map((word, index) => (index === 0 ? word : capitalize(word))).join('');
    case 'pascal':
      return words.map(capitalize).join('');
    case 'snake':
      return words.join('_');
    case 'constant':
      return words.map((word) => word.toUpperCase()).join('_');
    case 'kebab':
      return words.join('-');
    case 'dot':
      return words.join('.');
    case 'path':
      return words.join('/');
    case 'title':
      return words
        .map((word, index) => (index > 0 && FILLER.has(word) ? word : capitalize(word)))
        .join(' ');
    case 'sentence':
      return capitalize(words[0]) + (words.length > 1 ? ` ${words.slice(1).join(' ')}` : '');
    case 'lower':
      return words.join(' ');
    case 'upper':
      return words.map((word) => word.toUpperCase()).join(' ');
    default:
      return words.join(' ');
  }
}

export default function CaseForge() {
  const labelId = useId();
  const saved = useMemo(() => loadSaved(), []);
  const [text, setText] = useState(() => saved?.text ?? '');
  const [dropFiller, setDropFiller] = useState(() => saved?.dropFiller ?? false);
  const [active, setActive] = useState(() => saved?.active ?? 'camel');
  const [status, setStatus] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ text, dropFiller, active }));
    } catch {
      // Ignore storage failures so the converter still works for this visit.
    }
  }, [text, dropFiller, active]);

  const words = useMemo(() => splitWords(text), [text]);
  const identifierWords = useMemo(
    () => (dropFiller ? words.filter((word) => !FILLER.has(word)) : words),
    [words, dropFiller],
  );

  const results = useMemo(
    () => STYLES.map((style) => ({
      ...style,
      value: formatStyle(style.id, IDENTIFIER_STYLES.has(style.id) ? identifierWords : words),
    })),
    [words, identifierWords],
  );

  const activeResult = results.find((style) => style.id === active) || results[0];
  const longest = words.reduce((best, word) => (word.length > best.length ? word : best), '');

  const statCards = [
    { label: 'Words', value: words.length ? String(words.length) : '—' },
    { label: 'Characters', value: text.length ? text.length.toLocaleString() : '—' },
    { label: 'Longest', value: longest || '—' },
    { label: 'Active style', value: activeResult.label },
  ];

  const copyValue = async (value, label) => {
    if (!value) {
      setStatus('Nothing to copy yet.');
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
      setStatus(`${label} copied.`);
    } catch {
      setStatus('Clipboard is blocked in this browser.');
    }
  };

  const selectStyle = (style) => {
    setActive(style.id);
    copyValue(style.value, style.label);
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
    <section aria-labelledby={labelId} className="max-w-7xl mx-auto my-12 p-6 md:p-8 bg-white rounded-3xl shadow-[0_20px_50px_rgba(225,29,72,0.08)] border border-gray-100 overflow-hidden relative">
      <div aria-hidden="true" className="absolute top-0 right-0 w-96 h-96 bg-rose-50 rounded-full blur-3xl opacity-80 -mr-32 -mt-32 pointer-events-none" />
      <div aria-hidden="true" className="absolute bottom-0 left-0 w-80 h-80 bg-pink-50 rounded-full blur-3xl opacity-70 -ml-24 -mb-24 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-100 gap-4">
        <div className="flex items-center gap-3">
          <div aria-hidden="true" className="w-10 h-10 shrink-0 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-rose-600/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m16 18 6-6-6-6" />
              <path d="m8 6-6 6 6 6" />
            </svg>
          </div>
          <div>
            <h2 id={labelId} className="text-3xl font-extrabold text-gray-900 tracking-tight">Case Forge</h2>
            <p className="text-gray-500 text-sm font-medium mt-0.5">Turn any phrase into camelCase, snake_case, kebab-case, and the rest</p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start shrink-0">
          <button type="button" onClick={loadSample} className={`rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-bold text-rose-700 active:scale-95 transition-all ${FOCUS}`}>
            Sample
          </button>
          <button type="button" onClick={clearText} className={`rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-500 active:scale-95 transition-all ${FOCUS}`}>
            Clear
          </button>
        </div>
      </div>

      <div className="relative z-10 mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-rose-100 bg-rose-50/70 px-4 py-3 min-w-0">
            <div className="text-lg sm:text-2xl font-black tabular-nums truncate text-rose-950">{card.value}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-rose-800/80">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        <div className="lg:col-span-5 min-w-0 space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 md:p-5">
            <label htmlFor={`${labelId}-text`} className="text-sm font-semibold text-gray-600">Source phrase</label>
            <textarea
              id={`${labelId}-text`}
              value={text}
              onChange={(event) => { setText(event.target.value); setStatus(''); }}
              placeholder="Paste a sentence, a variable name, or a heading…"
              spellCheck={false}
              rows={6}
              className={`mt-3 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-800 leading-relaxed resize-y outline-none ${FOCUS}`}
            />
            <label className="mt-4 flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={dropFiller}
                onChange={(event) => { setDropFiller(event.target.checked); setStatus(''); }}
                className={`mt-0.5 h-4 w-4 rounded border-gray-300 text-rose-600 ${FOCUS}`}
              />
              <span>
                <span className="block text-sm font-semibold text-gray-700">Drop filler words</span>
                <span className="block text-xs font-medium text-gray-400">Skips words like the, of, and and when building identifiers. Headings stay intact.</span>
              </span>
            </label>
          </div>

          <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-4 md:px-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-rose-800/80">{activeResult.label}</h3>
              <button
                type="button"
                onClick={() => copyValue(activeResult.value, activeResult.label)}
                className={`rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-rose-700 border border-rose-200 active:scale-95 transition-all ${FOCUS}`}
              >
                Copy
              </button>
            </div>
            <p className="mt-3 break-all font-mono text-lg font-semibold leading-relaxed text-rose-950 min-h-8">
              {activeResult.value || 'Your converted text will land here.'}
            </p>
            <p className="mt-2 text-xs font-medium text-rose-900/70">
              {activeResult.hint}. Click any style below to select it and copy the result.
            </p>
          </div>
        </div>

        <div className="lg:col-span-7 min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {results.map((style) => {
              const selected = style.id === active;
              return (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => selectStyle(style)}
                  aria-pressed={selected}
                  className={`rounded-2xl border px-4 py-3 text-left min-w-0 transition-all active:scale-[0.99] ${FOCUS} ${
                    selected
                      ? 'border-rose-300 bg-rose-50 shadow-sm shadow-rose-600/10'
                      : 'border-gray-100 bg-white hover:border-rose-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${selected ? 'text-rose-700' : 'text-gray-400'}`}>{style.label}</span>
                    <span className="text-[10px] font-semibold text-gray-400">{style.hint}</span>
                  </div>
                  <div className={`mt-1.5 truncate font-mono text-sm font-semibold ${selected ? 'text-rose-950' : 'text-gray-800'}`}>
                    {style.value || '—'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <p role="status" className="relative z-10 mt-4 min-h-5 text-sm font-medium text-rose-800">{status}</p>
    </section>
  );
}
