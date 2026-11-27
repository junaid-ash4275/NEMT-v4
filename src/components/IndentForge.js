import React, { useEffect, useId, useMemo, useState } from 'react';

const STORAGE_KEY = 'indent-forge-v1';
const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500 focus-visible:ring-offset-2';

const MODES = [
  { id: 'spaces', label: 'Spaces' },
  { id: 'tabs', label: 'Tabs' },
];

const WIDTHS = [
  { id: 2, label: '2' },
  { id: 4, label: '4' },
  { id: 8, label: '8' },
];

const SAMPLE = [
  '\tfunction greet(name) {',
  '\t\tif (!name) {',
  '\t\t\treturn "hello";',
  '\t\t}',
  '\t  return "hello, " + name;',
  '\t}',
  '',
].join('\n');

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return {
      text: typeof data.text === 'string' ? data.text : '',
      mode: data.mode === 'tabs' ? 'tabs' : 'spaces',
      width: WIDTHS.some((item) => item.id === data.width) ? data.width : 2,
      dedent: Boolean(data.dedent),
      trimTrail: data.trimTrail !== false,
      finalNewline: data.finalNewline !== false,
    };
  } catch {
    return null;
  }
}

function splitLeading(line) {
  let index = 0;
  while (index < line.length && (line[index] === ' ' || line[index] === '\t')) index += 1;
  return { lead: line.slice(0, index), body: line.slice(index) };
}

function columnWidth(whitespace, tabWidth) {
  let columns = 0;
  for (const char of whitespace) {
    if (char === '\t') {
      const remainder = columns % tabWidth;
      columns += remainder === 0 ? tabWidth : tabWidth - remainder;
    } else {
      columns += 1;
    }
  }
  return columns;
}

function rebuildLead(columns, mode, tabWidth) {
  if (columns <= 0) return '';
  if (mode === 'tabs') {
    const tabs = Math.floor(columns / tabWidth);
    const spaces = columns % tabWidth;
    return `${'\t'.repeat(tabs)}${' '.repeat(spaces)}`;
  }
  return ' '.repeat(columns);
}

function gcd(left, right) {
  let a = Math.abs(left);
  let b = Math.abs(right);
  while (b) {
    const next = a % b;
    a = b;
    b = next;
  }
  return a || 1;
}

function guessWidth(lengths) {
  const positive = lengths.filter((length) => length > 0);
  if (!positive.length) return 4;
  const divisor = positive.reduce((current, length) => gcd(current, length));
  if (divisor === 2 || divisor === 4 || divisor === 8) return divisor;

  let best = 4;
  let bestScore = -1;
  WIDTHS.forEach((option) => {
    const score = positive.filter((length) => length % option.id === 0).length;
    if (score > bestScore) {
      best = option.id;
      bestScore = score;
    }
  });
  return best;
}

function inspectIndent(text) {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  let tabLines = 0;
  let spaceLines = 0;
  let mixedLines = 0;
  const spaceLengths = [];

  lines.forEach((line) => {
    if (!line.trim()) return;
    const { lead } = splitLeading(line);
    if (!lead) return;
    const hasTab = lead.includes('\t');
    const hasSpace = lead.includes(' ');
    if (hasTab && hasSpace) mixedLines += 1;
    else if (hasTab) tabLines += 1;
    else spaceLines += 1;
    if (!hasTab) spaceLengths.push(lead.length);
  });

  const indented = tabLines + spaceLines + mixedLines;
  let kind = 'flat';
  if (mixedLines > 0 && mixedLines >= tabLines && mixedLines >= spaceLines) kind = 'mixed';
  else if (tabLines > spaceLines) kind = 'tabs';
  else if (spaceLines > 0) kind = 'spaces';
  else if (tabLines > 0) kind = 'tabs';

  return {
    kind,
    width: spaceLengths.length ? guessWidth(spaceLengths) : null,
    tabLines,
    spaceLines,
    mixedLines,
    indented,
  };
}

function shapeIndent(text, options) {
  if (!text) return { output: '', lineCount: 0, indented: 0, mixed: 0, deepest: 0 };

  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized.split('\n');
  const measured = lines.map((line) => {
    const parts = splitLeading(line);
    const blank = parts.body.trim().length === 0;
    return {
      columns: blank ? 0 : columnWidth(parts.lead, options.width),
      body: options.trimTrail ? parts.body.replace(/[ \t]+$/, '') : parts.body,
      blank,
      mixed: !blank && parts.lead.includes('\t') && parts.lead.includes(' '),
    };
  });

  const shared = options.dedent
    ? measured.reduce((min, line) => (line.blank ? min : Math.min(min, line.columns)), Infinity)
    : 0;
  const shift = Number.isFinite(shared) ? shared : 0;

  let deepest = 0;
  let indented = 0;
  let mixed = 0;
  const next = measured.map((line) => {
    if (line.blank) return '';
    const columns = Math.max(0, line.columns - shift);
    if (columns > 0) indented += 1;
    if (line.mixed) mixed += 1;
    const level = Math.floor(columns / options.width);
    if (level > deepest) deepest = level;
    return `${rebuildLead(columns, options.mode, options.width)}${line.body}`;
  });

  let output = next.join('\n');
  if (options.finalNewline && output.length > 0 && !output.endsWith('\n')) output += '\n';

  return {
    output,
    lineCount: lines.filter((line) => line.trim()).length,
    indented,
    mixed,
    deepest,
  };
}

function ChoiceRow({ label, options, value, onChange }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-fuchsia-800/80">{label}</div>
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
                  ? 'border-fuchsia-300 bg-fuchsia-50 text-fuchsia-800 shadow-sm shadow-fuchsia-600/10'
                  : 'border-gray-200 bg-white text-gray-500 hover:border-fuchsia-200'
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

export default function IndentForge() {
  const labelId = useId();
  const saved = useMemo(() => loadSaved(), []);
  const [text, setText] = useState(() => saved?.text ?? '');
  const [mode, setMode] = useState(() => saved?.mode ?? 'spaces');
  const [width, setWidth] = useState(() => saved?.width ?? 2);
  const [dedent, setDedent] = useState(() => saved?.dedent ?? false);
  const [trimTrail, setTrimTrail] = useState(() => saved?.trimTrail ?? true);
  const [finalNewline, setFinalNewline] = useState(() => saved?.finalNewline ?? true);
  const [status, setStatus] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ text, mode, width, dedent, trimTrail, finalNewline }),
      );
    } catch {
      // Ignore storage failures so the converter still works for this visit.
    }
  }, [text, mode, width, dedent, trimTrail, finalNewline]);

  const detected = useMemo(() => inspectIndent(text), [text]);
  const shaped = useMemo(
    () => shapeIndent(text, { mode, width, dedent, trimTrail, finalNewline }),
    [text, mode, width, dedent, trimTrail, finalNewline],
  );

  const detectedKind = detected.kind === 'tabs' ? 'Tabs' : detected.kind === 'spaces' ? 'Spaces' : 'Mixed';
  const detectedLabel = detected.kind === 'flat'
    ? 'No indent yet'
    : detected.width
      ? `${detectedKind} · ${detected.width}-wide`
      : detectedKind;

  const statCards = [
    { label: 'Lines', value: shaped.lineCount ? String(shaped.lineCount) : '—' },
    { label: 'Indented', value: shaped.lineCount ? String(shaped.indented) : '—' },
    { label: 'Mixed lines', value: shaped.lineCount ? String(shaped.mixed) : '—' },
    { label: 'Deepest level', value: shaped.lineCount ? String(shaped.deepest) : '—' },
  ];

  const copyOutput = async () => {
    if (!shaped.output) {
      setStatus('Nothing to copy yet.');
      return;
    }
    try {
      await navigator.clipboard.writeText(shaped.output);
      setStatus('Indent copied.');
    } catch {
      setStatus('Clipboard is blocked in this browser.');
    }
  };

  const applyDetected = () => {
    if (detected.kind === 'flat') {
      setStatus('Paste indented text before matching the source.');
      return;
    }
    setMode(detected.kind === 'tabs' ? 'tabs' : 'spaces');
    if (detected.width) setWidth(detected.width);
    setStatus(detected.kind === 'mixed'
      ? 'Matched the majority style. Mixed lines still need a look.'
      : 'Matched the indent found in the source.');
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
    <section aria-labelledby={labelId} className="max-w-7xl mx-auto my-12 p-6 md:p-8 bg-white rounded-3xl shadow-[0_20px_50px_rgba(192,38,211,0.08)] border border-gray-100 overflow-hidden relative">
      <div aria-hidden="true" className="absolute top-0 right-0 w-96 h-96 bg-fuchsia-50 rounded-full blur-3xl opacity-80 -mr-32 -mt-32 pointer-events-none" />
      <div aria-hidden="true" className="absolute bottom-0 left-0 w-80 h-80 bg-pink-50 rounded-full blur-3xl opacity-70 -ml-24 -mb-24 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-100 gap-4">
        <div className="flex items-center gap-3">
          <div aria-hidden="true" className="w-10 h-10 shrink-0 rounded-2xl bg-gradient-to-tr from-fuchsia-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-fuchsia-600/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 8 7 12 3 16" />
              <line x1="21" x2="11" y1="12" y2="12" />
              <line x1="21" x2="11" y1="6" y2="6" />
              <line x1="21" x2="11" y1="18" y2="18" />
            </svg>
          </div>
          <div>
            <h2 id={labelId} className="text-3xl font-extrabold text-gray-900 tracking-tight">Indent Forge</h2>
            <p className="text-gray-500 text-sm font-medium mt-0.5">Convert tabs and spaces, then strip a shared indent</p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start shrink-0">
          <button type="button" onClick={loadSample} className={`rounded-xl border border-fuchsia-200 bg-white px-4 py-2 text-sm font-bold text-fuchsia-700 active:scale-95 transition-all ${FOCUS}`}>
            Sample
          </button>
          <button type="button" onClick={clearText} className={`rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-500 active:scale-95 transition-all ${FOCUS}`}>
            Clear
          </button>
        </div>
      </div>

      <div className="relative z-10 mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-fuchsia-100 bg-fuchsia-50/70 px-4 py-3 min-w-0">
            <div className="text-lg sm:text-2xl font-black tabular-nums truncate text-fuchsia-950">{card.value}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-fuchsia-800/80">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        <div className="lg:col-span-5 min-w-0">
          <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 md:p-5">
            <label htmlFor={`${labelId}-text`} className="text-sm font-semibold text-gray-600">Source</label>
            <textarea
              id={`${labelId}-text`}
              value={text}
              onChange={(event) => { setText(event.target.value); setStatus(''); }}
              placeholder="Paste code or an indented list…"
              spellCheck={false}
              rows={12}
              className={`mt-3 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-mono text-gray-800 leading-relaxed resize-y outline-none ${FOCUS}`}
            />
          </div>
        </div>

        <div className="lg:col-span-7 min-w-0 space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-4 md:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-fuchsia-800/80">Detected</div>
                <p className="mt-1 text-sm font-semibold text-gray-800">{detectedLabel}</p>
              </div>
              <button
                type="button"
                onClick={applyDetected}
                className={`rounded-xl border border-fuchsia-200 bg-fuchsia-50 px-4 py-2 text-sm font-bold text-fuchsia-700 active:scale-95 transition-all ${FOCUS}`}
              >
                Match source
              </button>
            </div>
            <ChoiceRow label="Target" options={MODES} value={mode} onChange={(next) => { setMode(next); setStatus(''); }} />
            <ChoiceRow label="Columns per level" options={WIDTHS} value={width} onChange={(next) => { setWidth(next); setStatus(''); }} />
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dedent}
                  onChange={(event) => { setDedent(event.target.checked); setStatus(''); }}
                  className={`mt-0.5 h-4 w-4 accent-fuchsia-600 ${FOCUS}`}
                />
                <span>
                  <span className="block text-sm font-semibold text-gray-700">Strip shared indent</span>
                  <span className="block text-xs font-medium text-gray-400">Pulls every line left by the smallest indent in the source.</span>
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={trimTrail}
                  onChange={(event) => { setTrimTrail(event.target.checked); setStatus(''); }}
                  className={`mt-0.5 h-4 w-4 accent-fuchsia-600 ${FOCUS}`}
                />
                <span>
                  <span className="block text-sm font-semibold text-gray-700">Trim line endings</span>
                  <span className="block text-xs font-medium text-gray-400">Drops spaces and tabs after the last character on each line.</span>
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={finalNewline}
                  onChange={(event) => { setFinalNewline(event.target.checked); setStatus(''); }}
                  className={`mt-0.5 h-4 w-4 accent-fuchsia-600 ${FOCUS}`}
                />
                <span>
                  <span className="block text-sm font-semibold text-gray-700">End with a newline</span>
                  <span className="block text-xs font-medium text-gray-400">Adds one trailing newline when the result has text.</span>
                </span>
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-fuchsia-100 bg-fuchsia-50 px-4 py-4 md:px-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-fuchsia-800/80">Converted</h3>
              <button
                type="button"
                onClick={copyOutput}
                className={`rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-fuchsia-700 border border-fuchsia-200 active:scale-95 transition-all ${FOCUS}`}
              >
                Copy
              </button>
            </div>
            <pre className="mt-3 whitespace-pre-wrap break-all font-mono text-sm font-semibold leading-relaxed text-fuchsia-950 min-h-16">
              {shaped.output || 'Converted indent will land here.'}
            </pre>
            <p className="mt-2 text-xs font-medium text-fuchsia-900/70">
              Tab stops use the column width above. A line that mixes tabs and spaces is counted, then rewritten in the target style.
            </p>
          </div>
        </div>
      </div>

      <p role="status" className="relative z-10 mt-4 min-h-5 text-sm font-medium text-fuchsia-800">{status}</p>
    </section>
  );
}
