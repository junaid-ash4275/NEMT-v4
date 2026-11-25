import React, { useEffect, useId, useMemo, useState } from 'react';

const STORAGE_KEY = 'base64-forge-v1';
const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2';

const MODES = [
  { id: 'encode', label: 'Encode', hint: 'Text to Base64' },
  { id: 'decode', label: 'Decode', hint: 'Base64 to text' },
];

const ALPHABETS = [
  { id: 'standard', label: 'Standard', hint: '+ /' },
  { id: 'url', label: 'URL-safe', hint: '- _' },
];

const WRAPS = [
  { id: 0, label: 'None', hint: 'One line' },
  { id: 64, label: '64', hint: 'PEM style' },
  { id: 76, label: '76', hint: 'MIME style' },
];

const PADDINGS = [
  { id: 'keep', label: 'Keep', hint: 'End with =' },
  { id: 'strip', label: 'Strip', hint: 'Drop =' },
];

const SAMPLE_TEXT = 'Café au lait — the quick brown fox.';

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return {
      text: typeof data.text === 'string' ? data.text : '',
      mode: MODES.some((item) => item.id === data.mode) ? data.mode : 'encode',
      alphabet: ALPHABETS.some((item) => item.id === data.alphabet) ? data.alphabet : 'standard',
      wrap: WRAPS.some((item) => item.id === data.wrap) ? data.wrap : 0,
      padding: PADDINGS.some((item) => item.id === data.padding) ? data.padding : 'keep',
    };
  } catch {
    return null;
  }
}

function bytesToBinary(bytes) {
  let binary = '';
  const chunk = 0x8000;
  for (let index = 0; index < bytes.length; index += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(index, index + chunk));
  }
  return binary;
}

function binaryToBytes(binary) {
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function encodeBytes(bytes) {
  return btoa(bytesToBinary(bytes));
}

function formatEncoded(base64, alphabet, wrap, padding) {
  let value = base64;
  if (alphabet === 'url') value = value.replace(/\+/g, '-').replace(/\//g, '_');
  if (padding === 'strip') value = value.replace(/=+$/, '');
  if (!wrap || value.length <= wrap) return value;
  const lines = [];
  for (let index = 0; index < value.length; index += wrap) {
    lines.push(value.slice(index, index + wrap));
  }
  return lines.join('\n');
}

function prepareDecodeInput(raw) {
  const compact = raw.replace(/\s+/g, '');
  if (!compact) return { empty: true };

  const urlSafe = /[-_]/.test(compact);
  const normalized = compact.replace(/-/g, '+').replace(/_/g, '/');
  if (/[^A-Za-z0-9+/=]/.test(normalized)) {
    return { error: 'Only letters, numbers, +, /, -, _, and = belong in Base64.' };
  }

  const paddingAt = normalized.indexOf('=');
  if (paddingAt !== -1 && !/=+$/.test(normalized.slice(paddingAt))) {
    return { error: 'Padding belongs at the end of the string.' };
  }

  const body = normalized.replace(/=+$/, '');
  if (body.length % 4 === 1) {
    return { error: 'This string is missing characters, so it cannot be decoded.' };
  }

  const padLength = (4 - (body.length % 4)) % 4;
  return { value: body + '='.repeat(padLength), urlSafe };
}

function transform(text, mode, alphabet, wrap, padding) {
  if (!text) {
    return {
      output: '',
      bytes: 0,
      form: '—',
      error: '',
      hint: mode === 'encode'
        ? 'Type or paste text to encode it as Base64.'
        : 'Paste a Base64 string to decode it back to text.',
    };
  }

  try {
    if (mode === 'encode') {
      const bytes = new TextEncoder().encode(text);
      const output = formatEncoded(encodeBytes(bytes), alphabet, wrap, padding);
      return {
        output,
        bytes: bytes.length,
        form: alphabet === 'url' ? 'URL-safe' : 'Standard',
        error: '',
        hint: 'Encoding uses UTF-8 bytes. Line breaks are added only in the result.',
      };
    }

    const prepared = prepareDecodeInput(text);
    if (prepared.empty) {
      return { output: '', bytes: 0, form: '—', error: '', hint: '' };
    }
    if (prepared.error) {
      return { output: '', bytes: 0, form: '—', error: prepared.error, hint: '' };
    }

    const bytes = binaryToBytes(atob(prepared.value));
    const output = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    return {
      output,
      bytes: bytes.length,
      form: prepared.urlSafe ? 'URL-safe' : 'Standard',
      error: '',
      hint: 'Whitespace is ignored. Missing padding and the URL-safe alphabet are accepted.',
    };
  } catch {
    return {
      output: '',
      bytes: 0,
      form: '—',
      error: mode === 'encode'
        ? 'This text could not be encoded.'
        : 'Those bytes decoded, but they are not UTF-8 text.',
      hint: '',
    };
  }
}

export default function Base64Forge() {
  const labelId = useId();
  const saved = useMemo(() => loadSaved(), []);
  const [text, setText] = useState(() => saved?.text ?? '');
  const [mode, setMode] = useState(() => saved?.mode ?? 'encode');
  const [alphabet, setAlphabet] = useState(() => saved?.alphabet ?? 'standard');
  const [wrap, setWrap] = useState(() => saved?.wrap ?? 0);
  const [padding, setPadding] = useState(() => saved?.padding ?? 'keep');
  const [status, setStatus] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ text, mode, alphabet, wrap, padding }));
    } catch {
      // Ignore storage failures so the converter still works for this visit.
    }
  }, [text, mode, alphabet, wrap, padding]);

  const result = useMemo(
    () => transform(text, mode, alphabet, wrap, padding),
    [text, mode, alphabet, wrap, padding],
  );

  const statCards = [
    { label: 'Characters', value: text.length.toLocaleString() },
    { label: 'UTF-8 bytes', value: result.error ? '—' : result.bytes.toLocaleString() },
    { label: 'Result', value: result.output ? result.output.length.toLocaleString() : '0' },
    { label: 'Alphabet', value: result.form },
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
    if (mode === 'encode') {
      setText(SAMPLE_TEXT);
    } else {
      const bytes = new TextEncoder().encode(SAMPLE_TEXT);
      setText(formatEncoded(encodeBytes(bytes), 'standard', 0, 'keep'));
    }
    setStatus('');
  };

  const clearText = () => {
    setText('');
    setStatus('');
  };

  const useOutput = () => {
    if (!result.output) {
      setStatus('Nothing to move yet.');
      return;
    }
    setMode(mode === 'encode' ? 'decode' : 'encode');
    setText(result.output);
    setStatus(mode === 'encode' ? 'Moved the Base64 into Decode.' : 'Moved the text into Encode.');
  };

  return (
    <section aria-labelledby={labelId} className="max-w-7xl mx-auto my-12 p-6 md:p-8 bg-white rounded-3xl shadow-[0_20px_50px_rgba(124,58,237,0.08)] border border-gray-100 overflow-hidden relative">
      <div aria-hidden="true" className="absolute top-0 right-0 w-96 h-96 bg-violet-50 rounded-full blur-3xl opacity-80 -mr-32 -mt-32 pointer-events-none" />
      <div aria-hidden="true" className="absolute bottom-0 left-0 w-80 h-80 bg-fuchsia-50 rounded-full blur-3xl opacity-70 -ml-24 -mb-24 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-100 gap-4">
        <div className="flex items-center gap-3">
          <div aria-hidden="true" className="w-10 h-10 shrink-0 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-500 flex items-center justify-center text-white shadow-md shadow-violet-600/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="14" y="14" width="4" height="6" rx="2" />
              <rect x="6" y="4" width="4" height="6" rx="2" />
              <path d="M6 20h4" />
              <path d="M14 10h4" />
              <path d="M6 14h2v6" />
              <path d="M14 4h2v6" />
            </svg>
          </div>
          <div>
            <h2 id={labelId} className="text-3xl font-extrabold text-gray-900 tracking-tight">Base64 Forge</h2>
            <p className="text-gray-500 text-sm font-medium mt-0.5">Encode text to Base64 or decode a string back to UTF-8</p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start shrink-0">
          <button type="button" onClick={loadSample} className={`rounded-xl border border-violet-200 bg-white px-4 py-2 text-sm font-bold text-violet-700 active:scale-95 transition-all ${FOCUS}`}>
            Sample
          </button>
          <button type="button" onClick={clearText} className={`rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-500 active:scale-95 transition-all ${FOCUS}`}>
            Clear
          </button>
        </div>
      </div>

      <div className="relative z-10 mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-violet-100 bg-violet-50/70 px-4 py-3 min-w-0">
            <div className="text-lg sm:text-2xl font-black tabular-nums truncate text-violet-950">{card.value}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-violet-800/80">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        <div className="lg:col-span-5 min-w-0 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {MODES.map((item) => {
              const selected = item.id === mode;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => { setMode(item.id); setStatus(''); }}
                  aria-pressed={selected}
                  className={`rounded-2xl border px-3 py-3 text-left min-w-0 transition-all active:scale-[0.99] ${FOCUS} ${
                    selected
                      ? 'border-violet-300 bg-violet-50 shadow-sm shadow-violet-600/10'
                      : 'border-gray-100 bg-white hover:border-violet-200'
                  }`}
                >
                  <div className={`text-sm font-bold ${selected ? 'text-violet-800' : 'text-gray-800'}`}>{item.label}</div>
                  <div className="mt-0.5 text-[10px] font-semibold text-gray-400">{item.hint}</div>
                </button>
              );
            })}
          </div>

          <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 md:p-5">
            <label htmlFor={`${labelId}-text`} className="text-sm font-semibold text-gray-600">
              {mode === 'encode' ? 'Source text' : 'Base64 string'}
            </label>
            <textarea
              id={`${labelId}-text`}
              value={text}
              onChange={(event) => { setText(event.target.value); setStatus(''); }}
              placeholder={mode === 'encode' ? 'Type a phrase, a token, or a snippet of JSON…' : 'Paste standard or URL-safe Base64…'}
              spellCheck={false}
              rows={8}
              className={`mt-3 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-800 leading-relaxed resize-y outline-none ${FOCUS}`}
            />
            <p className={`mt-3 text-xs font-semibold ${result.error ? 'text-rose-600' : 'text-gray-400'}`}>
              {result.error || result.hint}
            </p>
          </div>
        </div>

        <div className="lg:col-span-7 min-w-0 space-y-4">
          <div className={`grid grid-cols-2 sm:grid-cols-3 gap-3 ${mode === 'decode' ? 'opacity-50' : ''}`}>
            {[
              { title: 'Alphabet', options: ALPHABETS, value: alphabet, onChange: setAlphabet },
              { title: 'Line wrap', options: WRAPS, value: wrap, onChange: setWrap },
              { title: 'Padding', options: PADDINGS, value: padding, onChange: setPadding },
            ].map((group) => (
              <div key={group.title} className="min-w-0">
                <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">{group.title}</div>
                <div className="flex flex-col gap-2">
                  {group.options.map((item) => {
                    const selected = item.id === group.value;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        disabled={mode === 'decode'}
                        onClick={() => { group.onChange(item.id); setStatus(''); }}
                        aria-pressed={selected}
                        className={`rounded-xl border px-3 py-2 text-left min-w-0 transition-all active:scale-[0.99] disabled:cursor-not-allowed ${FOCUS} ${
                          selected
                            ? 'border-violet-300 bg-violet-50 shadow-sm shadow-violet-600/10'
                            : 'border-gray-100 bg-white hover:border-violet-200'
                        }`}
                      >
                        <span className={`block text-sm font-bold ${selected ? 'text-violet-800' : 'text-gray-800'}`}>{item.label}</span>
                        <span className="block text-[10px] font-semibold text-gray-400">{item.hint}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-violet-100 bg-violet-50 px-4 py-4 md:px-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-violet-800/80">
                {mode === 'encode' ? 'Base64' : 'Decoded text'}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={useOutput}
                  className={`rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-violet-700 border border-violet-200 active:scale-95 transition-all ${FOCUS}`}
                >
                  {mode === 'encode' ? 'Decode this' : 'Encode this'}
                </button>
                <button
                  type="button"
                  onClick={() => copyValue(result.output, mode === 'encode' ? 'Base64' : 'Decoded text')}
                  className={`rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-violet-700 border border-violet-200 active:scale-95 transition-all ${FOCUS}`}
                >
                  Copy
                </button>
              </div>
            </div>
            <p className="mt-3 break-all whitespace-pre-wrap font-mono text-sm font-semibold leading-relaxed text-violet-950 min-h-8">
              {result.error ? '—' : (result.output || 'Your result will land here.')}
            </p>
          </div>
        </div>
      </div>

      <p role="status" className="relative z-10 mt-4 min-h-5 text-sm font-medium text-violet-800">{status}</p>
    </section>
  );
}
