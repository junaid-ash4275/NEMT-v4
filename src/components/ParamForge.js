import React, { useEffect, useId, useMemo, useState } from 'react';

const STORAGE_KEY = 'param-forge-v1';
const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2';

const SAMPLE = 'https://shop.example.com/search?q=linen+shirt&color=sand&color=ink&sort=price&inStock=true#results';

let rowSerial = 0;

function makeId() {
  rowSerial += 1;
  return `row-${Date.now().toString(36)}-${rowSerial}`;
}

function blankRow() {
  return { id: makeId(), key: '', value: '', enabled: true };
}

function encodePart(value, plusSpaces) {
  const encoded = encodeURIComponent(value);
  return plusSpaces ? encoded.replace(/%20/g, '+') : encoded;
}

function entriesFromSearch(search) {
  return [...new URLSearchParams(search).entries()].map(([key, value]) => ({
    id: makeId(),
    key,
    value,
    enabled: true,
  }));
}

function looksLikeUrl(text) {
  if (/^[a-z][a-z0-9+.-]*:/i.test(text)) return true;
  if (text.startsWith('/')) return true;
  if (/^(?:localhost|\[::1\]|\d{1,3}(?:\.\d{1,3}){3})(?::\d+)?(?:[/?#]|$)/i.test(text)) return true;
  return /^(?:[a-z0-9-]+\.)+[a-z]{2,}(?::\d+)?(?:[/?#]|$)/i.test(text);
}

function parseSource(raw) {
  const text = raw.trim();
  if (!text) {
    throw new Error('Paste a URL or a query string first.');
  }

  if (!looksLikeUrl(text)) {
    const withoutMark = text.startsWith('?') ? text.slice(1) : text;
    if (text.startsWith('?') || withoutMark.includes('=') || withoutMark.includes('&')) {
      const hashIndex = withoutMark.indexOf('#');
      const query = hashIndex === -1 ? withoutMark : withoutMark.slice(0, hashIndex);
      const fragment = hashIndex === -1 ? '' : withoutMark.slice(hashIndex + 1);
      return { base: '', fragment, params: entriesFromSearch(query) };
    }
  }

  const scheme = /^[a-z][a-z0-9+.-]*:/i.test(text);

  if (text.startsWith('/')) {
    let url;
    try {
      url = new URL(text, 'https://placeholder.local');
    } catch {
      throw new Error('That path is not a valid URL.');
    }
    return {
      base: url.pathname,
      fragment: url.hash.replace(/^#/, ''),
      params: entriesFromSearch(url.search.replace(/^\?/, '')),
    };
  }

  let url;
  try {
    url = new URL(scheme ? text : `https://${text}`);
  } catch {
    throw new Error('That text is not a URL or a query string.');
  }

  return {
    base: `${url.origin}${url.pathname}`,
    fragment: url.hash.replace(/^#/, ''),
    params: entriesFromSearch(url.search.replace(/^\?/, '')),
  };
}

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    const params = Array.isArray(data.params)
      ? data.params
        .filter((row) => row && typeof row === 'object')
        .map((row) => ({
          id: typeof row.id === 'string' && row.id ? row.id : makeId(),
          key: typeof row.key === 'string' ? row.key : '',
          value: typeof row.value === 'string' ? row.value : '',
          enabled: row.enabled !== false,
        }))
      : [];

    return {
      base: typeof data.base === 'string' ? data.base : '',
      fragment: typeof data.fragment === 'string' ? data.fragment : '',
      source: typeof data.source === 'string' ? data.source : '',
      plusSpaces: data.plusSpaces !== false,
      params: params.length ? params : [blankRow()],
    };
  } catch {
    return null;
  }
}

export default function ParamForge() {
  const labelId = useId();
  const saved = useMemo(() => loadSaved(), []);
  const [base, setBase] = useState(() => saved?.base ?? '');
  const [fragment, setFragment] = useState(() => saved?.fragment ?? '');
  const [source, setSource] = useState(() => saved?.source ?? '');
  const [plusSpaces, setPlusSpaces] = useState(() => saved?.plusSpaces ?? true);
  const [params, setParams] = useState(() => saved?.params ?? [blankRow()]);
  const [importError, setImportError] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        base,
        fragment,
        source,
        plusSpaces,
        params,
      }));
    } catch {
      // Ignore storage failures so the builder still works for this visit.
    }
  }, [base, fragment, source, plusSpaces, params]);

  const model = useMemo(() => {
    const included = params.filter((row) => row.enabled && row.key.trim());
    const counts = new Map();
    included.forEach((row) => {
      const key = row.key.trim();
      counts.set(key, (counts.get(key) || 0) + 1);
    });

    const query = included
      .map((row) => `${encodePart(row.key.trim(), plusSpaces)}=${encodePart(row.value, plusSpaces)}`)
      .join('&');

    const trimmedBase = base.trim();
    const hash = fragment.replace(/^#/, '');
    let joiner = '?';
    if (trimmedBase.includes('?')) {
      joiner = /[?&]$/.test(trimmedBase) ? '' : '&';
    }
    const url = `${trimmedBase}${query ? `${joiner}${query}` : ''}${hash ? `#${hash}` : ''}`;
    const repeats = included.length - counts.size;

    return {
      included: included.length,
      query,
      url,
      repeats,
      repeatedKeys: new Set([...counts.entries()].filter(([, count]) => count > 1).map(([key]) => key)),
    };
  }, [base, fragment, params, plusSpaces]);

  const statCards = [
    { label: 'Rows', value: String(params.length) },
    { label: 'Included', value: String(model.included) },
    { label: 'Query length', value: model.query ? model.query.length.toLocaleString() : '0' },
    { label: 'Repeats', value: String(model.repeats) },
  ];

  const updateRow = (id, patch) => {
    setParams((rows) => rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
    setStatus('');
  };

  const moveRow = (index, direction) => {
    const next = index + direction;
    if (next < 0 || next >= params.length) return;
    setParams((rows) => {
      const copy = rows.slice();
      const [item] = copy.splice(index, 1);
      copy.splice(next, 0, item);
      return copy;
    });
    setStatus('');
  };

  const addRow = () => {
    setParams((rows) => [...rows, blankRow()]);
    setStatus('');
  };

  const removeRow = (id) => {
    setParams((rows) => {
      const next = rows.filter((row) => row.id !== id);
      return next.length ? next : [blankRow()];
    });
    setStatus('');
  };

  const applyParsed = (parsed, message) => {
    setBase(parsed.base);
    setFragment(parsed.fragment);
    setParams(parsed.params.length ? parsed.params : [blankRow()]);
    setImportError('');
    setStatus(message);
  };

  const importSource = () => {
    try {
      const parsed = parseSource(source);
      const count = parsed.params.length;
      applyParsed(parsed, count ? `Imported ${count} parameter${count === 1 ? '' : 's'}.` : 'Imported the URL. It has no query parameters.');
    } catch (error) {
      setImportError(error.message);
      setStatus('');
    }
  };

  const loadSample = () => {
    setSource(SAMPLE);
    applyParsed(parseSource(SAMPLE), 'Sample loaded.');
  };

  const clearAll = () => {
    setBase('');
    setFragment('');
    setSource('');
    setParams([blankRow()]);
    setImportError('');
    setStatus('Fields cleared.');
  };

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

  return (
    <section aria-labelledby={labelId} className="max-w-7xl mx-auto my-12 p-6 md:p-8 bg-white rounded-3xl shadow-[0_20px_50px_rgba(79,70,229,0.08)] border border-gray-100 overflow-hidden relative">
      <div aria-hidden="true" className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-80 -mr-32 -mt-32 pointer-events-none" />
      <div aria-hidden="true" className="absolute bottom-0 left-0 w-80 h-80 bg-violet-50 rounded-full blur-3xl opacity-70 -ml-24 -mb-24 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-100 gap-4">
        <div className="flex items-center gap-3">
          <div aria-hidden="true" className="w-10 h-10 shrink-0 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </div>
          <div>
            <h2 id={labelId} className="text-3xl font-extrabold text-gray-900 tracking-tight">Param Forge</h2>
            <p className="text-gray-500 text-sm font-medium mt-0.5">Split a URL into query parameters, edit them, and copy the link back together</p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start shrink-0">
          <button type="button" onClick={loadSample} className={`rounded-xl border border-indigo-200 bg-white px-4 py-2 text-sm font-bold text-indigo-700 active:scale-95 transition-all ${FOCUS}`}>
            Sample
          </button>
          <button type="button" onClick={clearAll} className={`rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-500 active:scale-95 transition-all ${FOCUS}`}>
            Clear
          </button>
        </div>
      </div>

      <div className="relative z-10 mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-indigo-100 bg-indigo-50/70 px-4 py-3 min-w-0">
            <div className="text-lg sm:text-2xl font-black tabular-nums truncate text-indigo-950">{card.value}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-800/80">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        <div className="lg:col-span-5 min-w-0 space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 md:p-5">
            <label htmlFor={`${labelId}-source`} className="text-sm font-semibold text-gray-600">Import a URL</label>
            <textarea
              id={`${labelId}-source`}
              value={source}
              onChange={(event) => { setSource(event.target.value); setImportError(''); setStatus(''); }}
              placeholder="Paste a full URL, a path, or a raw query string…"
              spellCheck={false}
              rows={5}
              className={`mt-3 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-800 leading-relaxed resize-y outline-none ${FOCUS}`}
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-medium text-gray-400">Import decodes the query. The live link encodes it again.</p>
              <button
                type="button"
                onClick={importSource}
                className={`rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm shadow-indigo-600/20 active:scale-95 transition-all ${FOCUS}`}
              >
                Import
              </button>
            </div>
            {importError ? <p className="mt-3 text-xs font-semibold text-rose-600">{importError}</p> : null}
          </div>

          <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 md:p-5 space-y-4">
            <div>
              <p className="text-sm font-semibold text-gray-600">Spaces in values</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {[
                  { id: true, label: 'Plus signs', hint: 'linen+shirt' },
                  { id: false, label: 'Percent', hint: 'linen%20shirt' },
                ].map((option) => {
                  const selected = plusSpaces === option.id;
                  return (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => { setPlusSpaces(option.id); setStatus(''); }}
                      aria-pressed={selected}
                      className={`rounded-2xl border px-3 py-3 text-left min-w-0 transition-all active:scale-[0.99] ${FOCUS} ${
                        selected
                          ? 'border-indigo-300 bg-indigo-50 shadow-sm shadow-indigo-600/10'
                          : 'border-gray-100 bg-white hover:border-indigo-200'
                      }`}
                    >
                      <div className={`text-sm font-bold ${selected ? 'text-indigo-800' : 'text-gray-800'}`}>{option.label}</div>
                      <div className="mt-0.5 text-[10px] font-semibold text-gray-400">{option.hint}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label htmlFor={`${labelId}-fragment`} className="text-sm font-semibold text-gray-600">Hash fragment</label>
              <input
                id={`${labelId}-fragment`}
                value={fragment}
                onChange={(event) => { setFragment(event.target.value); setStatus(''); }}
                placeholder="results"
                spellCheck={false}
                autoComplete="off"
                className={`mt-3 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-mono text-sm font-medium text-gray-800 outline-none ${FOCUS}`}
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 min-w-0 space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 md:p-5">
            <label htmlFor={`${labelId}-base`} className="text-sm font-semibold text-gray-600">Base URL</label>
            <input
              id={`${labelId}-base`}
              value={base}
              onChange={(event) => { setBase(event.target.value); setStatus(''); }}
              placeholder="https://shop.example.com/search"
              spellCheck={false}
              autoComplete="off"
              className={`mt-3 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-mono text-sm font-medium text-gray-800 outline-none ${FOCUS}`}
            />
            <p className="mt-3 text-xs font-medium text-gray-400">Leave this empty to build a query string on its own. A leading # on the fragment is ignored.</p>
          </div>

          <div className="space-y-3">
            {params.map((row, index) => {
              const repeated = row.enabled && model.repeatedKeys.has(row.key.trim());
              return (
                <div key={row.id} className="rounded-2xl border border-gray-100 bg-white p-3 md:p-4">
                  <div className="flex items-start gap-3">
                    <label className="mt-3 shrink-0">
                      <span className="sr-only">{row.enabled ? 'Included' : 'Excluded'}</span>
                      <input
                        type="checkbox"
                        checked={row.enabled}
                        onChange={(event) => updateRow(row.id, { enabled: event.target.checked })}
                        aria-label={row.key.trim() ? `Include ${row.key.trim()}` : `Include parameter ${index + 1}`}
                        className={`h-4 w-4 accent-indigo-600 ${FOCUS}`}
                      />
                    </label>
                    <div className="grid flex-1 grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
                      <input
                        value={row.key}
                        onChange={(event) => updateRow(row.id, { key: event.target.value })}
                        placeholder="key"
                        spellCheck={false}
                        autoComplete="off"
                        aria-label={`Parameter ${index + 1} key`}
                        className={`w-full rounded-xl border bg-white px-3 py-2.5 font-mono text-sm font-medium text-gray-800 outline-none ${FOCUS} ${
                          repeated ? 'border-amber-300' : 'border-gray-200'
                        } ${row.enabled ? '' : 'opacity-50'}`}
                      />
                      <input
                        value={row.value}
                        onChange={(event) => updateRow(row.id, { value: event.target.value })}
                        placeholder="value"
                        spellCheck={false}
                        autoComplete="off"
                        aria-label={`Parameter ${index + 1} value`}
                        className={`w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 font-mono text-sm font-medium text-gray-800 outline-none ${FOCUS} ${row.enabled ? '' : 'opacity-50'}`}
                      />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${repeated ? 'text-amber-700' : 'text-gray-400'}`}>
                      {repeated ? 'Repeated key' : `Parameter ${index + 1}`}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => moveRow(index, -1)}
                        disabled={index === 0}
                        aria-label={`Move parameter ${index + 1} up`}
                        className={`rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-bold text-gray-500 disabled:opacity-40 active:scale-95 transition-all ${FOCUS}`}
                      >
                        Up
                      </button>
                      <button
                        type="button"
                        onClick={() => moveRow(index, 1)}
                        disabled={index === params.length - 1}
                        aria-label={`Move parameter ${index + 1} down`}
                        className={`rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-bold text-gray-500 disabled:opacity-40 active:scale-95 transition-all ${FOCUS}`}
                      >
                        Down
                      </button>
                      <button
                        type="button"
                        onClick={() => removeRow(row.id)}
                        aria-label={`Remove parameter ${index + 1}`}
                        className={`rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-bold text-rose-600 active:scale-95 transition-all ${FOCUS}`}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            <button
              type="button"
              onClick={addRow}
              className={`w-full rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/40 px-4 py-3 text-sm font-bold text-indigo-700 active:scale-[0.99] transition-all ${FOCUS}`}
            >
              Add parameter
            </button>
          </div>

          <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-4 md:px-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-indigo-800/80">Assembled URL</h3>
              <button
                type="button"
                onClick={() => copyValue(model.url, 'URL')}
                className={`rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-indigo-700 border border-indigo-200 active:scale-95 transition-all ${FOCUS}`}
              >
                Copy
              </button>
            </div>
            <p className="mt-3 break-all font-mono text-sm font-semibold leading-relaxed text-indigo-950 min-h-8">
              {model.url || 'Add a base URL or a parameter to build a link.'}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white px-4 py-4 md:px-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Query string</h3>
              <button
                type="button"
                onClick={() => copyValue(model.query, 'Query string')}
                className={`rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-indigo-700 border border-indigo-200 active:scale-95 transition-all ${FOCUS}`}
              >
                Copy
              </button>
            </div>
            <p className="mt-3 break-all font-mono text-sm font-semibold leading-relaxed text-gray-800 min-h-8">
              {model.query || 'Included parameters will appear here.'}
            </p>
          </div>
        </div>
      </div>

      <p role="status" className="relative z-10 mt-4 min-h-5 text-sm font-medium text-indigo-800">{status}</p>
    </section>
  );
}
