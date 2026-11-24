import React, { useEffect, useId, useMemo, useState } from 'react';

const STORAGE_KEY = 'hash-forge-v1';
const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2';

const ALGORITHMS = [
  { id: 'SHA-1', label: 'SHA-1', bits: 160, hint: 'Legacy checksums' },
  { id: 'SHA-256', label: 'SHA-256', bits: 256, hint: 'Default choice' },
  { id: 'SHA-384', label: 'SHA-384', bits: 384, hint: 'Longer digest' },
  { id: 'SHA-512', label: 'SHA-512', bits: 512, hint: 'Maximum length' },
];

const SAMPLE = 'The quick brown fox jumps over the lazy dog';

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return {
      text: typeof data.text === 'string' ? data.text : '',
      expected: typeof data.expected === 'string' ? data.expected : '',
      algorithm: ALGORITHMS.some((item) => item.id === data.algorithm) ? data.algorithm : 'SHA-256',
    };
  } catch {
    return null;
  }
}

function bytesToHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function bytesToBase64(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function normalizeHex(value) {
  return value.trim().toLowerCase().replace(/[^a-f0-9]/g, '');
}

export default function HashForge() {
  const labelId = useId();
  const saved = useMemo(() => loadSaved(), []);
  const [text, setText] = useState(() => saved?.text ?? '');
  const [expected, setExpected] = useState(() => saved?.expected ?? '');
  const [algorithm, setAlgorithm] = useState(() => saved?.algorithm ?? 'SHA-256');
  const [digest, setDigest] = useState(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ text, expected, algorithm }));
    } catch {
      // Ignore storage failures so the hasher still works for this visit.
    }
  }, [text, expected, algorithm]);

  useEffect(() => {
    let cancelled = false;

    setDigest(null);
    setError('');

    const run = async () => {
      if (!window.crypto?.subtle) {
        if (!cancelled) {
          setDigest(null);
          setError('This browser cannot compute hashes.');
        }
        return;
      }

      try {
        const encoded = new TextEncoder().encode(text);
        const buffer = await crypto.subtle.digest(algorithm, encoded);
        if (cancelled) return;
        const bytes = new Uint8Array(buffer);
        setDigest({
          hex: bytesToHex(bytes),
          base64: bytesToBase64(bytes),
          bits: bytes.length * 8,
        });
        setError('');
      } catch {
        if (!cancelled) {
          setDigest(null);
          setError('The hash could not be computed.');
        }
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [text, algorithm]);

  const byteLength = useMemo(() => new TextEncoder().encode(text).length, [text]);
  const active = ALGORITHMS.find((item) => item.id === algorithm) || ALGORITHMS[1];
  const normalizedExpected = normalizeHex(expected);

  let matchLabel = '—';
  if (normalizedExpected && digest) {
    matchLabel = digest.hex === normalizedExpected ? 'Match' : 'Differs';
  } else if (error) {
    matchLabel = '—';
  }

  const statCards = [
    { label: 'Characters', value: text.length ? text.length.toLocaleString() : '0' },
    { label: 'UTF-8 bytes', value: byteLength.toLocaleString() },
    { label: 'Digest', value: digest ? `${digest.bits} bits` : '—' },
    { label: 'Check', value: matchLabel },
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

  const loadSample = () => {
    setText(SAMPLE);
    setExpected('');
    setStatus('');
  };

  const clearText = () => {
    setText('');
    setExpected('');
    setStatus('');
  };

  return (
    <section aria-labelledby={labelId} className="max-w-7xl mx-auto my-12 p-6 md:p-8 bg-white rounded-3xl shadow-[0_20px_50px_rgba(13,148,136,0.08)] border border-gray-100 overflow-hidden relative">
      <div aria-hidden="true" className="absolute top-0 right-0 w-96 h-96 bg-teal-50 rounded-full blur-3xl opacity-80 -mr-32 -mt-32 pointer-events-none" />
      <div aria-hidden="true" className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-50 rounded-full blur-3xl opacity-70 -ml-24 -mb-24 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-100 gap-4">
        <div className="flex items-center gap-3">
          <div aria-hidden="true" className="w-10 h-10 shrink-0 rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-teal-600/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" x2="20" y1="9" y2="9" />
              <line x1="4" x2="20" y1="15" y2="15" />
              <line x1="10" x2="8" y1="3" y2="21" />
              <line x1="16" x2="14" y1="3" y2="21" />
            </svg>
          </div>
          <div>
            <h2 id={labelId} className="text-3xl font-extrabold text-gray-900 tracking-tight">Hash Forge</h2>
            <p className="text-gray-500 text-sm font-medium mt-0.5">Hash any text with SHA and check it against a known digest</p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start shrink-0">
          <button type="button" onClick={loadSample} className={`rounded-xl border border-teal-200 bg-white px-4 py-2 text-sm font-bold text-teal-700 active:scale-95 transition-all ${FOCUS}`}>
            Sample
          </button>
          <button type="button" onClick={clearText} className={`rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-500 active:scale-95 transition-all ${FOCUS}`}>
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
            <label htmlFor={`${labelId}-text`} className="text-sm font-semibold text-gray-600">Source text</label>
            <textarea
              id={`${labelId}-text`}
              value={text}
              onChange={(event) => { setText(event.target.value); setStatus(''); }}
              placeholder="Paste a phrase, a file checksum source, or leave this empty to hash nothing…"
              spellCheck={false}
              rows={6}
              className={`mt-3 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-800 leading-relaxed resize-y outline-none ${FOCUS}`}
            />
            <p className="mt-3 text-xs font-medium text-gray-400">
              Digests use UTF-8 bytes. An empty box still produces the well-known empty-string hash.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 md:p-5">
            <label htmlFor={`${labelId}-expected`} className="text-sm font-semibold text-gray-600">Expected hex digest</label>
            <input
              id={`${labelId}-expected`}
              value={expected}
              onChange={(event) => { setExpected(event.target.value); setStatus(''); }}
              placeholder="Optional. Spaces and colons are ignored."
              spellCheck={false}
              autoComplete="off"
              className={`mt-3 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-mono text-sm font-medium text-gray-800 outline-none ${FOCUS}`}
            />
            <p className={`mt-3 text-xs font-semibold ${matchLabel === 'Match' ? 'text-teal-700' : matchLabel === 'Differs' ? 'text-rose-600' : 'text-gray-400'}`}>
              {matchLabel === 'Match' && 'The digest matches the value you pasted.'}
              {matchLabel === 'Differs' && 'The digest does not match the value you pasted.'}
              {matchLabel === '—' && 'Paste a hex digest to compare it with the live result.'}
            </p>
          </div>
        </div>

        <div className="lg:col-span-7 min-w-0 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ALGORITHMS.map((item) => {
              const selected = item.id === algorithm;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => { setAlgorithm(item.id); setStatus(''); }}
                  aria-pressed={selected}
                  className={`rounded-2xl border px-3 py-3 text-left min-w-0 transition-all active:scale-[0.99] ${FOCUS} ${
                    selected
                      ? 'border-teal-300 bg-teal-50 shadow-sm shadow-teal-600/10'
                      : 'border-gray-100 bg-white hover:border-teal-200'
                  }`}
                >
                  <div className={`text-sm font-bold ${selected ? 'text-teal-800' : 'text-gray-800'}`}>{item.label}</div>
                  <div className="mt-0.5 text-[10px] font-semibold text-gray-400">{item.hint}</div>
                </button>
              );
            })}
          </div>

          <div className="rounded-2xl border border-teal-100 bg-teal-50 px-4 py-4 md:px-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-teal-800/80">{active.label} hex</h3>
              <button
                type="button"
                onClick={() => copyValue(digest?.hex, 'Hex digest')}
                className={`rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-teal-700 border border-teal-200 active:scale-95 transition-all ${FOCUS}`}
              >
                Copy
              </button>
            </div>
            <p className="mt-3 break-all font-mono text-sm font-semibold leading-relaxed text-teal-950 min-h-8">
              {error || digest?.hex || 'Computing…'}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white px-4 py-4 md:px-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Base64</h3>
              <button
                type="button"
                onClick={() => copyValue(digest?.base64, 'Base64 digest')}
                className={`rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-teal-700 border border-teal-200 active:scale-95 transition-all ${FOCUS}`}
              >
                Copy
              </button>
            </div>
            <p className="mt-3 break-all font-mono text-sm font-semibold leading-relaxed text-gray-800 min-h-8">
              {error ? '—' : (digest?.base64 || 'Computing…')}
            </p>
          </div>
        </div>
      </div>

      <p role="status" className="relative z-10 mt-4 min-h-5 text-sm font-medium text-teal-800">{status}</p>
    </section>
  );
}
