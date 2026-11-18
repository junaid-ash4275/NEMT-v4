import React, { useEffect, useId, useMemo, useState } from 'react';

const STORAGE_KEY = 'word-counter-v1';
const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2';
const WPM = 200;
const SPM = 130;
const MAX_KEYWORDS = 8;

const STOPWORDS = new Set([
  'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'any', 'can', 'had', 'her',
  'was', 'one', 'our', 'out', 'has', 'have', 'him', 'his', 'how', 'its', 'may', 'who',
  'did', 'get', 'got', 'its', 'let', 'now', 'off', 'own', 'she', 'too', 'use', 'was',
  'way', 'why', 'yet', 'you', 'with', 'from', 'they', 'that', 'this', 'them', 'then',
  'than', 'will', 'what', 'when', 'where', 'which', 'there', 'their', 'these', 'those',
  'about', 'after', 'again', 'been', 'before', 'being', 'below', 'could', 'does', 'each',
  'into', 'more', 'most', 'only', 'other', 'over', 'some', 'such', 'very', 'your',
]);

const SAMPLE = 'Word counters help you tighten your writing. Type or paste any text and watch the counts update live. Short sentences read faster, and short paragraphs scan better. Trim the filler, keep the rhythm, and let the numbers guide your edits.';

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return '';
    const data = JSON.parse(raw);
    return typeof data.text === 'string' ? data.text : '';
  } catch {
    return '';
  }
}

function computeStats(text) {
  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/).length : 0;
  const characters = text.length;
  const noSpaces = text.replace(/\s/g, '').length;
  const sentences = trimmed ? trimmed.split(/[.!?]+/).filter((part) => part.trim().length).length : 0;
  const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).filter((part) => part.trim().length).length : 0;
  const unique = trimmed ? new Set(trimmed.toLowerCase().split(/\s+/).map((word) => word.replace(/^[^a-z0-9']+|[^a-z0-9']+$/gi, ''))).size : 0;
  const readingMinutes = words ? Math.ceil(words / WPM) : 0;
  const speakingMinutes = words ? Math.ceil(words / SPM) : 0;
  return { words, characters, noSpaces, sentences, paragraphs, unique, readingMinutes, speakingMinutes };
}

function topKeywords(text, limit) {
  const tokens = (text.toLowerCase().match(/[a-z0-9']+/g) || []);
  const counts = new Map();
  for (const token of tokens) {
    const word = token.replace(/^'+|'+$/g, '');
    if (word.length < 3 || STOPWORDS.has(word)) continue;
    counts.set(word, (counts.get(word) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
}

function timeLabel(minutes) {
  if (!minutes) return '0 min';
  if (minutes < 1) return '< 1 min';
  return `${minutes} min`;
}

export default function WordCounter() {
  const labelId = useId();
  const [text, setText] = useState(() => loadSaved());
  const [status, setStatus] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ text }));
    } catch {
      // Ignore storage failures so the counter still works for this visit.
    }
  }, [text]);

  const stats = useMemo(() => computeStats(text), [text]);
  const keywords = useMemo(() => topKeywords(text, MAX_KEYWORDS), [text]);
  const maxKeyword = keywords.length ? keywords[0][1] : 1;

  const copyText = async () => {
    if (!text.trim()) {
      setStatus('Nothing to copy yet.');
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setStatus('Text copied.');
    } catch {
      setStatus('Clipboard is blocked in this browser.');
    }
  };

  const clearText = () => {
    setText('');
    setStatus('');
  };

  const loadSample = () => {
    setText(SAMPLE);
    setStatus('');
  };

  const statCards = [
    { label: 'Words', value: stats.words.toLocaleString() },
    { label: 'Characters', value: stats.characters.toLocaleString() },
    { label: 'No spaces', value: stats.noSpaces.toLocaleString() },
    { label: 'Sentences', value: stats.sentences.toLocaleString() },
    { label: 'Paragraphs', value: stats.paragraphs.toLocaleString() },
    { label: 'Reading', value: timeLabel(stats.readingMinutes) },
  ];

  return (
    <section aria-labelledby={labelId} className="max-w-7xl mx-auto my-12 p-6 md:p-8 bg-white rounded-3xl shadow-[0_20px_50px_rgba(180,83,9,0.08)] border border-gray-100 overflow-hidden relative">
      <div aria-hidden="true" className="absolute top-0 right-0 w-96 h-96 bg-amber-50 rounded-full blur-3xl opacity-80 -mr-32 -mt-32 pointer-events-none" />
      <div aria-hidden="true" className="absolute bottom-0 left-0 w-80 h-80 bg-orange-50 rounded-full blur-3xl opacity-70 -ml-24 -mb-24 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-100 gap-4">
        <div className="flex items-center gap-3">
          <div aria-hidden="true" className="w-10 h-10 shrink-0 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          </div>
          <div>
            <h2 id={labelId} className="text-3xl font-extrabold text-gray-900 tracking-tight">Word Counter</h2>
            <p className="text-gray-500 text-sm font-medium mt-0.5">Count words, sentences, and reading time as you type</p>
          </div>
        </div>
        <button type="button" onClick={copyText} className={`self-start shrink-0 px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 shadow-md shadow-amber-500/20 active:scale-95 transition-all ${FOCUS}`}>
          {status === 'Text copied.' ? 'Copied' : 'Copy text'}
        </button>
      </div>

      <div className="relative z-10 mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-amber-100 bg-amber-50/70 px-4 py-3 min-w-0">
            <div className="text-lg sm:text-2xl font-black tabular-nums text-amber-950 truncate">{card.value}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-amber-800/80">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        <div className="lg:col-span-7 min-w-0 space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 md:p-5">
            <div className="flex items-center justify-between gap-3">
              <label htmlFor={`${labelId}-text`} className="text-sm font-semibold text-gray-600">Your text</label>
              <div className="flex gap-2">
                <button type="button" onClick={loadSample} className={`rounded-lg px-3 py-1.5 text-xs font-bold text-amber-700 border border-amber-200 ${FOCUS}`}>
                  Sample
                </button>
                <button type="button" onClick={clearText} className={`rounded-lg px-3 py-1.5 text-xs font-bold text-gray-500 border border-gray-200 ${FOCUS}`}>
                  Clear
                </button>
              </div>
            </div>
            <textarea
              id={`${labelId}-text`}
              value={text}
              onChange={(event) => { setText(event.target.value); setStatus(''); }}
              placeholder="Type or paste something here…"
              className={`mt-3 w-full min-h-56 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-800 leading-relaxed resize-y outline-none ${FOCUS}`}
            />
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-gray-400">
              <span>Reading time {timeLabel(stats.readingMinutes)}</span>
              <span>Speaking time {timeLabel(stats.speakingMinutes)}</span>
              <span>{stats.unique.toLocaleString()} unique words</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 min-w-0 space-y-4">
          <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-4 md:px-5">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-amber-800/80">Top keywords</h3>
            {keywords.length ? (
              <ul className="mt-3 space-y-2">
                {keywords.map(([word, count]) => (
                  <li key={word} className="flex items-center gap-3">
                    <span className="w-28 truncate text-sm font-semibold text-amber-950">{word}</span>
                    <div className="flex-1 h-2 overflow-hidden rounded-full bg-white">
                      <div className="h-full bg-gradient-to-r from-amber-500 to-orange-400" style={{ width: `${Math.max(6, Math.round((count / maxKeyword) * 100))}%` }} />
                    </div>
                    <span className="w-8 text-right text-xs font-bold tabular-nums text-amber-900/70">{count}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm font-medium text-amber-900/70">Start typing to see which words you lean on most.</p>
            )}
            <p className="mt-3 text-xs font-medium text-amber-900/70">
              Common filler words are skipped, and each bar is sized against your most frequent keyword.
            </p>
          </div>
        </div>
      </div>

      <p role="status" className="relative z-10 mt-4 min-h-5 text-sm font-medium text-amber-800">{status}</p>
    </section>
  );
}
