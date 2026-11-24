import React, { useEffect, useId, useMemo, useState } from 'react';

const STORAGE_KEY = 'table-forge-v1';
const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2';
const PREVIEW_LIMIT = 8;

const DELIMITERS = [
  { id: 'auto', label: 'Auto', hint: 'Detect' },
  { id: ',', label: 'Comma', hint: 'CSV' },
  { id: '\t', label: 'Tab', hint: 'TSV' },
  { id: ';', label: 'Semicolon', hint: 'Excel' },
  { id: '|', label: 'Pipe', hint: 'Logs' },
];

const SAMPLE = [
  'name,role,city',
  '"Ada Lovelace",Mathematician,"London, UK"',
  '"Grace Hopper",Computer scientist,"New York, NY"',
  '"Katherine Johnson",Mathematician,"Hampton, VA"',
].join('\n');

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return {
      source: typeof data.source === 'string' ? data.source : '',
      delimiter: DELIMITERS.some((item) => item.id === data.delimiter) ? data.delimiter : 'auto',
      hasHeader: data.hasHeader !== false,
      trimCells: data.trimCells !== false,
    };
  } catch {
    return null;
  }
}

function countDelimiter(line, delimiter) {
  let count = 0;
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (!quoted && char === delimiter) {
      count += 1;
    }
  }

  return count;
}

function detectDelimiter(text) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim()).slice(0, 8);
  if (!lines.length) return ',';

  let best = { id: ',', score: -1 };
  DELIMITERS.forEach((option) => {
    if (option.id === 'auto') return;
    const counts = lines.map((line) => countDelimiter(line, option.id));
    const first = counts[0];
    if (!first) return;
    const consistent = counts.every((count) => count === first);
    const score = (consistent ? 100 : 0) + first * counts.length;
    if (score > best.score) best = { id: option.id, score };
  });

  return best.id;
}

function parseTable(text, delimiter) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  const input = text.replace(/^\uFEFF/, '');

  const pushCell = () => {
    row.push(cell);
    cell = '';
  };

  const pushRow = () => {
    pushCell();
    if (row.some((value) => value.trim() !== '')) rows.push(row);
    row = [];
  };

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const next = input[index + 1];

    if (quoted) {
      if (char === '"' && next === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
      continue;
    }

    if (char === delimiter) {
      pushCell();
      continue;
    }

    if (char === '\n' || char === '\r') {
      if (char === '\r' && next === '\n') index += 1;
      pushRow();
      continue;
    }

    cell += char;
  }

  if (cell.length || row.length) pushRow();
  return { rows, unclosedQuote: quoted };
}

function columnCount(rows) {
  return rows.reduce((widest, row) => Math.max(widest, row.length), 0);
}

function padRows(rows, width, trimCells) {
  return rows.map((row) => Array.from({ length: width }, (_, index) => {
    const value = row[index] ?? '';
    return trimCells ? value.trim() : value;
  }));
}

function uniqueHeaders(cells) {
  const seen = new Map();
  return cells.map((cell, index) => {
    const base = cell || `Column ${index + 1}`;
    const count = seen.get(base) || 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base} ${count + 1}`;
  });
}

function escapeMarkdown(value) {
  return value.replace(/\|/g, '\\|').replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();
}

function toMarkdown(headers, rows) {
  if (!headers.length) return '';
  const head = `| ${headers.map(escapeMarkdown).join(' | ')} |`;
  const rule = `| ${headers.map(() => '---').join(' | ')} |`;
  const body = rows.map((row) => `| ${row.map(escapeMarkdown).join(' | ')} |`);
  return [head, rule, ...body].join('\n');
}

function toJson(headers, rows, hasHeader) {
  if (!rows.length && !headers.length) return '';
  const value = hasHeader
    ? rows.map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ''])))
    : rows;
  return JSON.stringify(value, null, 2);
}

function delimiterLabel(id) {
  return DELIMITERS.find((item) => item.id === id)?.label || 'Comma';
}

export default function TableForge() {
  const labelId = useId();
  const saved = useMemo(() => loadSaved(), []);
  const [source, setSource] = useState(() => saved?.source ?? '');
  const [delimiter, setDelimiter] = useState(() => saved?.delimiter ?? 'auto');
  const [hasHeader, setHasHeader] = useState(() => saved?.hasHeader ?? true);
  const [trimCells, setTrimCells] = useState(() => saved?.trimCells ?? true);
  const [status, setStatus] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ source, delimiter, hasHeader, trimCells }));
    } catch {
      // Ignore storage failures so the converter still works for this visit.
    }
  }, [source, delimiter, hasHeader, trimCells]);

  const model = useMemo(() => {
    const resolved = delimiter === 'auto' ? detectDelimiter(source) : delimiter;
    const parsed = parseTable(source, resolved);
    const width = columnCount(parsed.rows);
    const padded = padRows(parsed.rows, width, trimCells);
    const uneven = width > 0 && parsed.rows.some((row) => row.length !== width);
    const headers = hasHeader
      ? uniqueHeaders(padded[0] || [])
      : Array.from({ length: width }, (_, index) => `Column ${index + 1}`);
    const dataRows = hasHeader ? padded.slice(1) : padded;

    return {
      resolved,
      unclosedQuote: parsed.unclosedQuote,
      uneven,
      headers,
      dataRows,
      markdown: width ? toMarkdown(headers, dataRows) : '',
      json: width ? toJson(headers, dataRows, hasHeader) : '',
    };
  }, [source, delimiter, hasHeader, trimCells]);

  const statCards = [
    { label: 'Rows', value: model.dataRows.length ? String(model.dataRows.length) : '—' },
    { label: 'Columns', value: model.headers.length ? String(model.headers.length) : '—' },
    { label: 'Delimiter', value: source.trim() ? delimiterLabel(model.resolved) : '—' },
    { label: 'Shape', value: model.headers.length ? (hasHeader ? 'Objects' : 'Arrays') : '—' },
  ];

  const preview = model.dataRows.slice(0, PREVIEW_LIMIT);
  const hiddenRows = Math.max(0, model.dataRows.length - preview.length);

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

  const loadSample = () => {
    setSource(SAMPLE);
    setDelimiter('auto');
    setHasHeader(true);
    setStatus('Sample loaded.');
  };

  const clearAll = () => {
    setSource('');
    setStatus('Fields cleared.');
  };

  return (
    <section aria-labelledby={labelId} className="max-w-7xl mx-auto my-12 p-6 md:p-8 bg-white rounded-3xl shadow-[0_20px_50px_rgba(13,148,136,0.08)] border border-gray-100 overflow-hidden relative">
      <div aria-hidden="true" className="absolute top-0 right-0 w-96 h-96 bg-teal-50 rounded-full blur-3xl opacity-80 -mr-32 -mt-32 pointer-events-none" />
      <div aria-hidden="true" className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-50 rounded-full blur-3xl opacity-70 -ml-24 -mb-24 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-100 gap-4">
        <div className="flex items-center gap-3">
          <div aria-hidden="true" className="w-10 h-10 shrink-0 rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-teal-600/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M3 15h18M9 3v18" />
            </svg>
          </div>
          <div>
            <h2 id={labelId} className="text-3xl font-extrabold text-gray-900 tracking-tight">Table Forge</h2>
            <p className="text-gray-500 text-sm font-medium mt-0.5">Paste CSV or TSV and copy it as a Markdown table or JSON</p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start shrink-0">
          <button type="button" onClick={loadSample} className={`rounded-xl border border-teal-200 bg-white px-4 py-2 text-sm font-bold text-teal-700 active:scale-95 transition-all ${FOCUS}`}>
            Sample
          </button>
          <button type="button" onClick={clearAll} className={`rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-500 active:scale-95 transition-all ${FOCUS}`}>
            Clear
          </button>
        </div>
      </div>

      <div className="relative z-10 mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-teal-100 bg-teal-50/70 px-4 py-3 min-w-0">
            <div className="text-lg sm:text-2xl font-black tabular-nums truncate text-teal-950">{card.value}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-teal-800/80">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        <div className="lg:col-span-5 min-w-0 space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 md:p-5">
            <label htmlFor={`${labelId}-source`} className="text-sm font-semibold text-gray-600">Source table</label>
            <textarea
              id={`${labelId}-source`}
              value={source}
              onChange={(event) => { setSource(event.target.value); setStatus(''); }}
              placeholder="Paste comma, tab, semicolon, or pipe separated rows…"
              spellCheck={false}
              rows={8}
              className={`mt-3 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-mono text-sm font-medium text-gray-800 leading-relaxed resize-y outline-none ${FOCUS}`}
            />
            <p className="mt-3 text-xs font-medium text-gray-400">Quoted commas stay inside a cell. Blank lines are skipped.</p>
            {model.unclosedQuote ? <p className="mt-3 text-xs font-semibold text-rose-600">A quote is still open. Close it so the last rows parse cleanly.</p> : null}
            {model.uneven && !model.unclosedQuote ? <p className="mt-3 text-xs font-semibold text-amber-700">Some rows are shorter than the widest row. Empty cells fill the gap.</p> : null}
          </div>

          <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 md:p-5 space-y-4">
            <div>
              <p className="text-sm font-semibold text-gray-600">Delimiter</p>
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {DELIMITERS.map((option) => {
                  const selected = delimiter === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => { setDelimiter(option.id); setStatus(''); }}
                      aria-pressed={selected}
                      className={`rounded-2xl border px-3 py-2.5 text-left min-w-0 transition-all active:scale-[0.99] ${FOCUS} ${
                        selected
                          ? 'border-teal-300 bg-teal-50 shadow-sm shadow-teal-600/10'
                          : 'border-gray-100 bg-white hover:border-teal-200'
                      }`}
                    >
                      <div className={`text-sm font-bold ${selected ? 'text-teal-800' : 'text-gray-800'}`}>{option.label}</div>
                      <div className="mt-0.5 text-[10px] font-semibold text-gray-400">{option.hint}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={hasHeader}
                onChange={(event) => { setHasHeader(event.target.checked); setStatus(''); }}
                className={`mt-0.5 h-4 w-4 accent-teal-600 ${FOCUS}`}
              />
              <span>
                <span className="block text-sm font-semibold text-gray-700">First row is a header</span>
                <span className="block text-xs font-medium text-gray-400">JSON becomes a list of objects. Turn this off for a list of arrays.</span>
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={trimCells}
                onChange={(event) => { setTrimCells(event.target.checked); setStatus(''); }}
                className={`mt-0.5 h-4 w-4 accent-teal-600 ${FOCUS}`}
              />
              <span>
                <span className="block text-sm font-semibold text-gray-700">Trim each cell</span>
                <span className="block text-xs font-medium text-gray-400">Drops spaces around values. Text inside a cell stays put.</span>
              </span>
            </label>
          </div>
        </div>

        <div className="lg:col-span-7 min-w-0 space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-100">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Preview</h3>
              <p className="text-[10px] font-semibold text-gray-400">
                {hiddenRows ? `Showing ${preview.length} of ${model.dataRows.length}` : 'Live rows'}
              </p>
            </div>
            {model.headers.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-teal-50/80">
                    <tr>
                      {model.headers.map((header) => (
                        <th key={header} className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-teal-800 whitespace-nowrap">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.length ? preview.map((row, rowIndex) => (
                      <tr key={`${row.join('|')}-${rowIndex}`} className="border-t border-gray-100">
                        {row.map((cell, cellIndex) => (
                          <td key={`${model.headers[cellIndex]}-${rowIndex}`} className="px-4 py-2.5 font-medium text-gray-800 whitespace-nowrap">{cell}</td>
                        ))}
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={model.headers.length} className="px-4 py-6 text-sm font-medium text-gray-400">The header is ready. Add a data row to fill the table.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="px-4 py-8 text-sm font-medium text-gray-400">Paste a table to see the rows here.</p>
            )}
          </div>

          <div className="rounded-2xl border border-teal-100 bg-teal-50 px-4 py-4 md:px-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-teal-800/80">Markdown</h3>
              <button
                type="button"
                onClick={() => copyValue(model.markdown, 'Markdown')}
                className={`rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-teal-700 border border-teal-200 active:scale-95 transition-all ${FOCUS}`}
              >
                Copy
              </button>
            </div>
            <pre className="mt-3 overflow-x-auto whitespace-pre font-mono text-xs font-semibold leading-relaxed text-teal-950 min-h-8">
              {model.markdown || 'A Markdown table will land here.'}
            </pre>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white px-4 py-4 md:px-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">JSON</h3>
              <button
                type="button"
                onClick={() => copyValue(model.json, 'JSON')}
                className={`rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-teal-700 border border-teal-200 active:scale-95 transition-all ${FOCUS}`}
              >
                Copy
              </button>
            </div>
            <pre className="mt-3 max-h-64 overflow-auto whitespace-pre font-mono text-xs font-semibold leading-relaxed text-gray-800 min-h-8">
              {model.json || 'JSON will land here.'}
            </pre>
          </div>
        </div>
      </div>

      <p role="status" className="relative z-10 mt-4 min-h-5 text-sm font-medium text-teal-800">{status}</p>
    </section>
  );
}
