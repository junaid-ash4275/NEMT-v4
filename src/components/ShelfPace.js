import React, { useEffect, useId, useMemo, useState } from 'react';

const STORAGE_KEY = 'shelf-pace-v1';
const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2';
const PACE_PRESETS = [10, 15, 20, 30, 50];

const SAMPLES = [
  {
    id: 'sample-le-guin',
    title: 'The Left Hand of Darkness',
    author: 'Ursula K. Le Guin',
    pages: 304,
    read: 128,
    pace: 18,
    deadline: '',
  },
  {
    id: 'sample-kahneman',
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    pages: 499,
    read: 40,
    pace: 15,
    deadline: '',
  },
  {
    id: 'sample-towles',
    title: 'A Gentleman in Moscow',
    author: 'Amor Towles',
    pages: 462,
    read: 462,
    pace: 20,
    deadline: '',
  },
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function dayKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseISODate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
}

function formatDay(date) {
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function sanitizeBook(book) {
  if (!book || typeof book !== 'object') return null;
  const title = String(book.title || '').trim().slice(0, 80);
  if (!title) return null;
  const pages = clamp(Math.round(Number(book.pages) || 1), 1, 9999);
  const read = clamp(Math.round(Number(book.read) || 0), 0, pages);
  const pace = clamp(Math.round(Number(book.pace) || 15), 1, 100);
  const deadline = parseISODate(book.deadline) ? book.deadline : '';
  const id = String(book.id || `book-${dayKey(new Date())}-${Math.random().toString(36).slice(2, 7)}`);
  return {
    id,
    title,
    author: String(book.author || '').trim().slice(0, 60),
    pages,
    read,
    pace,
    deadline,
  };
}

function sanitizeLogs(logs) {
  if (!logs || typeof logs !== 'object') return {};
  const next = {};
  Object.entries(logs).forEach(([bookId, days]) => {
    if (!days || typeof days !== 'object') return;
    const clean = {};
    Object.entries(days).forEach(([key, amount]) => {
      if (!parseISODate(key)) return;
      const pages = Math.round(Number(amount));
      if (pages > 0) clean[key] = clamp(pages, 1, 9999);
    });
    if (Object.keys(clean).length) next[String(bookId)] = clean;
  });
  return next;
}

function sampleBooks(today) {
  const deadline = dayKey(addDays(today, 7));
  return SAMPLES.map((book) => (book.id === 'sample-kahneman' ? { ...book, deadline } : book));
}

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    const books = Array.isArray(data.books) ? data.books.map(sanitizeBook).filter(Boolean).slice(0, 12) : [];
    if (!books.length) return null;
    const activeId = books.some((book) => book.id === data.activeId) ? data.activeId : books[0].id;
    return { books, logs: sanitizeLogs(data.logs), activeId };
  } catch {
    return null;
  }
}

function forecastFor(book, today) {
  const remaining = Math.max(0, book.pages - book.read);
  const percent = book.pages ? Math.round((book.read / book.pages) * 100) : 0;
  const daysNeeded = remaining === 0 ? 0 : Math.ceil(remaining / book.pace);
  const finish = remaining === 0 ? null : addDays(today, daysNeeded - 1);
  const deadline = parseISODate(book.deadline);
  let verdict = '';
  let tone = 'neutral';

  if (remaining === 0) {
    verdict = 'Finished. The whole book is logged.';
    tone = 'done';
  } else if (!deadline) {
    verdict = `${book.pace} pages a day finishes it on ${formatDay(finish)}.`;
    tone = 'neutral';
  } else {
    const daysUntil = Math.round((deadline.getTime() - today.getTime()) / 86400000);
    if (daysUntil < 0) {
      verdict = `The ${formatDay(deadline)} deadline has passed, with ${remaining} pages still unread.`;
      tone = 'behind';
    } else {
      const readingDays = daysUntil + 1;
      const required = Math.ceil(remaining / readingDays);
      if (required <= book.pace) {
        const spare = book.pace - required;
        verdict = spare === 0
          ? `This pace lands exactly on ${formatDay(deadline)}.`
          : `This pace beats ${formatDay(deadline)}. You could drop to ${required} pages a day and still make it.`;
        tone = 'ahead';
      } else {
        verdict = `To finish by ${formatDay(deadline)}, read ${required} pages a day — ${required - book.pace} more than the current pace.`;
        tone = 'behind';
      }
    }
  }

  return { remaining, percent, daysNeeded, finish, verdict, tone };
}

function weekFor(logs, bookId, today) {
  const bookLogs = logs[bookId] || {};
  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(today, index - 6);
    const key = dayKey(date);
    return {
      key,
      label: date.toLocaleDateString(undefined, { weekday: 'narrow' }),
      pages: bookLogs[key] || 0,
      isToday: index === 6,
    };
  });
}

const TONE_CLASS = {
  done: 'bg-emerald-50 border-emerald-100 text-emerald-800',
  ahead: 'bg-emerald-50 border-emerald-100 text-emerald-800',
  behind: 'bg-rose-50 border-rose-100 text-rose-800',
  neutral: 'bg-amber-50 border-amber-100 text-amber-900',
};

export default function ShelfPace() {
  const labelId = useId();
  const today = useMemo(() => startOfDay(new Date()), []);
  const saved = useMemo(() => loadSaved(), []);
  const [books, setBooks] = useState(() => saved?.books || sampleBooks(today));
  const [logs, setLogs] = useState(() => saved?.logs || {});
  const [activeId, setActiveId] = useState(() => saved?.activeId || sampleBooks(today)[0].id);
  const [draft, setDraft] = useState({ title: '', author: '', pages: '320' });
  const [logAmount, setLogAmount] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ books, logs, activeId }));
    } catch {
      setStatus('This browser blocked saving, so the shelf stays in this tab only.');
    }
  }, [books, logs, activeId]);

  const active = books.find((book) => book.id === activeId) || books[0] || null;
  const forecast = active ? forecastFor(active, today) : null;
  const week = active ? weekFor(logs, active.id, today) : [];
  const weekPeak = Math.max(1, ...week.map((day) => day.pages));
  const weekTotal = week.reduce((sum, day) => sum + day.pages, 0);

  const shelfStats = useMemo(() => {
    const open = books.filter((book) => book.read < book.pages);
    const pagesLeft = open.reduce((sum, book) => sum + (book.pages - book.read), 0);
    return { open: open.length, pagesLeft, finished: books.length - open.length };
  }, [books]);

  const updateBook = (id, patch) => {
    setBooks((current) => current.map((book) => {
      if (book.id !== id) return book;
      const pages = patch.pages !== undefined
        ? clamp(Math.round(Number(String(patch.pages).replace(/\D/g, '')) || book.pages || 1), 1, 9999)
        : book.pages;
      const read = clamp(patch.read !== undefined ? Math.round(Number(patch.read) || 0) : book.read, 0, pages);
      return {
        ...book,
        title: patch.title !== undefined ? String(patch.title).slice(0, 80) : book.title,
        author: patch.author !== undefined ? String(patch.author).slice(0, 60) : book.author,
        pages,
        read,
        pace: patch.pace !== undefined ? clamp(Math.round(Number(patch.pace) || 1), 1, 100) : book.pace,
        deadline: patch.deadline !== undefined ? (parseISODate(patch.deadline) ? patch.deadline : '') : book.deadline,
      };
    }));
    setStatus('');
  };

  const logPages = () => {
    if (!active || forecast.remaining === 0) return;
    const requested = clamp(Math.round(Number(logAmount) || active.pace), 1, 999);
    const applied = Math.min(requested, forecast.remaining);
    const key = dayKey(today);
    setLogs((current) => ({
      ...current,
      [active.id]: { ...(current[active.id] || {}), [key]: (current[active.id]?.[key] || 0) + applied },
    }));
    setBooks((current) => current.map((book) => (
      book.id === active.id ? { ...book, read: Math.min(book.pages, book.read + applied) } : book
    )));
    setLogAmount('');
    setStatus(applied === forecast.remaining
      ? `Logged ${applied} pages. That finishes ${active.title}.`
      : `Logged ${applied} pages for today.`);
  };

  const addBook = (event) => {
    event.preventDefault();
    const book = sanitizeBook({
      id: `book-${Date.now()}`,
      title: draft.title,
      author: draft.author,
      pages: draft.pages,
      read: 0,
      pace: 20,
      deadline: '',
    });
    if (!book || books.length >= 12) return;
    setBooks((current) => [...current, book]);
    setActiveId(book.id);
    setDraft({ title: '', author: '', pages: '320' });
    setLogAmount('');
    setStatus(`${book.title} is on the shelf.`);
  };

  const removeBook = (id) => {
    const removed = books.find((book) => book.id === id);
    const nextBooks = books.filter((book) => book.id !== id);
    setBooks(nextBooks);
    setLogs((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
    if (activeId === id) setActiveId(nextBooks[0]?.id || '');
    setStatus(removed ? `Removed ${removed.title}.` : '');
  };

  const summary = active && forecast
    ? [
      active.title,
      active.author,
      `${active.read} of ${active.pages} pages (${forecast.percent}%)`,
      forecast.verdict,
      `Logged this week: ${weekTotal} pages`,
    ].filter(Boolean).join('\n')
    : '';

  const copySummary = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setStatus('Reading update copied.');
    } catch {
      setStatus('Clipboard is blocked in this browser.');
    }
  };

  return (
    <section aria-labelledby={labelId} className="max-w-7xl mx-auto my-12 p-6 md:p-8 bg-white rounded-3xl shadow-[0_20px_50px_rgba(217,119,6,0.08)] border border-gray-100 overflow-hidden relative">
      <div aria-hidden="true" className="absolute top-0 right-0 w-96 h-96 bg-amber-50 rounded-full blur-3xl opacity-80 -mr-32 -mt-32 pointer-events-none" />
      <div aria-hidden="true" className="absolute bottom-0 left-0 w-80 h-80 bg-rose-50 rounded-full blur-3xl opacity-70 -ml-24 -mb-24 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-100 gap-4">
        <div className="flex items-center gap-3">
          <div aria-hidden="true" className="w-10 h-10 shrink-0 rounded-2xl bg-gradient-to-tr from-amber-600 to-rose-400 flex items-center justify-center text-white shadow-md shadow-amber-600/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              <path d="M8 7h8" />
              <path d="M8 11h6" />
            </svg>
          </div>
          <div>
            <h2 id={labelId} className="text-3xl font-extrabold text-gray-900 tracking-tight">Shelf Pace</h2>
            <p className="text-gray-500 text-sm font-medium mt-0.5">Log pages, hold a daily pace, and see whether a deadline is still realistic</p>
          </div>
        </div>
        <button type="button" onClick={copySummary} disabled={!active} className={`self-start shrink-0 px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-amber-600 to-amber-500 shadow-md shadow-amber-600/20 active:scale-95 transition-all disabled:opacity-40 ${FOCUS}`}>
          {status === 'Reading update copied.' ? 'Copied' : 'Copy update'}
        </button>
      </div>

      <div className="relative z-10 mt-5 grid grid-cols-3 gap-3">
        {[
          { label: 'Still reading', value: shelfStats.open },
          { label: 'Pages left', value: shelfStats.pagesLeft },
          { label: 'Finished', value: shelfStats.finished },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-amber-100 bg-amber-50/70 px-4 py-3">
            <div className="text-2xl font-black tabular-nums text-amber-800">{stat.value}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-amber-700/80">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        <div className="lg:col-span-5 min-w-0 space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 md:p-5">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-amber-700">On the shelf</h3>
            {books.length === 0 && (
              <p className="mt-3 rounded-2xl border border-dashed border-gray-200 px-4 py-8 text-center text-sm text-gray-500">The shelf is empty. Add a book to start a pace.</p>
            )}
            <ul className="mt-3 space-y-2">
              {books.map((book) => {
                const itemForecast = forecastFor(book, today);
                const selected = active?.id === book.id;
                return (
                  <li key={book.id}>
                    <button
                      type="button"
                      aria-pressed={selected}
                      onClick={() => { setActiveId(book.id); setLogAmount(''); setStatus(''); }}
                      className={`w-full text-left rounded-xl border px-3 py-3 transition-all ${FOCUS} ${selected ? 'bg-white border-amber-200 shadow-sm' : 'bg-white/70 border-gray-200 hover:border-amber-200'}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-bold text-gray-900">{book.title}</div>
                          <div className="truncate text-xs text-gray-500">{book.author || 'Author not set'} · {book.pace}/day</div>
                        </div>
                        <span className={`shrink-0 text-xs font-black tabular-nums ${itemForecast.remaining === 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {itemForecast.percent}%
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 rounded-full bg-amber-100 overflow-hidden" aria-hidden="true">
                        <div className={`h-full rounded-full ${itemForecast.remaining === 0 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${itemForecast.percent}%` }} />
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <form onSubmit={addBook} className="rounded-2xl border border-gray-100 bg-white p-4 md:p-5 space-y-3">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Add a book</h3>
            <div>
              <label htmlFor={`${labelId}-title`} className="text-xs font-semibold text-gray-600">Title</label>
              <input id={`${labelId}-title`} value={draft.title} maxLength={80} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} placeholder="Book title" className={`mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-semibold text-gray-800 ${FOCUS}`} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              <div className="sm:col-span-3">
                <label htmlFor={`${labelId}-author`} className="text-xs font-semibold text-gray-600">Author</label>
                <input id={`${labelId}-author`} value={draft.author} maxLength={60} onChange={(event) => setDraft((current) => ({ ...current, author: event.target.value }))} placeholder="Optional" className={`mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 ${FOCUS}`} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor={`${labelId}-pages`} className="text-xs font-semibold text-gray-600">Pages</label>
                <input id={`${labelId}-pages`} inputMode="numeric" value={draft.pages} onChange={(event) => setDraft((current) => ({ ...current, pages: event.target.value.replace(/\D/g, '').slice(0, 4) }))} className={`mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-mono font-semibold text-gray-800 ${FOCUS}`} />
              </div>
            </div>
            <button type="submit" disabled={!draft.title.trim() || books.length >= 12} className={`w-full rounded-xl px-4 py-2.5 text-sm font-bold text-amber-900 bg-amber-50 border border-amber-100 disabled:opacity-40 ${FOCUS}`}>
              {books.length >= 12 ? 'Shelf is full' : 'Add to shelf'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-7 min-w-0">
          {!active || !forecast ? (
            <div className="h-full rounded-2xl border border-dashed border-gray-200 px-4 py-16 text-center text-sm text-gray-500">Choose a book to plan its pace.</div>
          ) : (
            <div className="rounded-2xl border border-gray-100 bg-white p-4 md:p-5 space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-2">
                  <label htmlFor={`${labelId}-edit-title`} className="sr-only">Title</label>
                  <input
                    id={`${labelId}-edit-title`}
                    value={active.title}
                    maxLength={80}
                    onChange={(event) => updateBook(active.id, { title: event.target.value })}
                    onBlur={() => { if (!active.title.trim()) updateBook(active.id, { title: 'Untitled' }); }}
                    className={`w-full bg-transparent text-2xl font-extrabold tracking-tight text-gray-900 ${FOCUS}`}
                  />
                  <label htmlFor={`${labelId}-edit-author`} className="sr-only">Author</label>
                  <input id={`${labelId}-edit-author`} value={active.author} maxLength={60} placeholder="Add an author" onChange={(event) => updateBook(active.id, { author: event.target.value })} className={`w-full bg-transparent text-sm font-medium text-gray-500 ${FOCUS}`} />
                </div>
                <button type="button" onClick={() => removeBook(active.id)} className={`shrink-0 rounded-xl px-3 py-2 text-xs font-bold text-gray-400 hover:text-rose-600 ${FOCUS}`}>
                  Remove
                </button>
              </div>

              <div>
                <div className="flex items-end justify-between gap-3 mb-2">
                  <label htmlFor={`${labelId}-read`} className="text-sm font-semibold text-gray-600">Current page</label>
                  <output htmlFor={`${labelId}-read`} className="text-sm font-mono font-bold text-amber-700">{active.read} / {active.pages}</output>
                </div>
                <input
                  id={`${labelId}-read`}
                  type="range"
                  min="0"
                  max={active.pages}
                  value={active.read}
                  onChange={(event) => updateBook(active.id, { read: Number(event.target.value) })}
                  className={`w-full cursor-pointer accent-amber-600 ${FOCUS}`}
                />
                <div
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={active.pages}
                  aria-valuenow={active.read}
                  aria-label={`Reading progress for ${active.title}`}
                  className="mt-3 h-2 rounded-full bg-amber-100 overflow-hidden"
                >
                  <div className={`h-full rounded-full ${forecast.remaining === 0 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${forecast.percent}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-2xl bg-gray-50 border border-gray-100 px-4 py-3">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Pages left</div>
                  <div className="mt-1 text-2xl font-black tabular-nums text-gray-900">{forecast.remaining}</div>
                </div>
                <div className="rounded-2xl bg-gray-50 border border-gray-100 px-4 py-3">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Finish date</div>
                  <div className="mt-1 text-lg font-black text-gray-900">{forecast.finish ? formatDay(forecast.finish) : 'Done'}</div>
                </div>
                <div className="rounded-2xl bg-gray-50 border border-gray-100 px-4 py-3">
                  <label htmlFor={`${labelId}-total`} className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Total pages</label>
                  <input id={`${labelId}-total`} inputMode="numeric" value={active.pages} onChange={(event) => updateBook(active.id, { pages: event.target.value.replace(/\D/g, '').slice(0, 4) || '1' })} className={`mt-1 w-full bg-transparent text-2xl font-black tabular-nums text-gray-900 ${FOCUS}`} />
                </div>
              </div>

              <div>
                <div className="flex justify-between gap-3 mb-2">
                  <label htmlFor={`${labelId}-pace`} className="text-sm font-semibold text-gray-600">Daily pace</label>
                  <output htmlFor={`${labelId}-pace`} className="text-sm font-mono font-bold text-amber-700">{active.pace} pages</output>
                </div>
                <input id={`${labelId}-pace`} type="range" min="1" max="100" value={active.pace} onChange={(event) => updateBook(active.id, { pace: Number(event.target.value) })} className={`w-full cursor-pointer accent-amber-600 ${FOCUS}`} />
                <div role="group" aria-label="Pace shortcuts" className="mt-3 flex flex-wrap gap-2">
                  {PACE_PRESETS.map((pace) => (
                    <button key={pace} type="button" aria-pressed={active.pace === pace} onClick={() => updateBook(active.id, { pace })} className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${FOCUS} ${active.pace === pace ? 'bg-amber-600 border-amber-600 text-white' : 'bg-white border-gray-200 text-gray-500'}`}>
                      {pace}/day
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor={`${labelId}-deadline`} className="text-sm font-semibold text-gray-600">Deadline</label>
                <div className="mt-2 flex flex-col sm:flex-row gap-2">
                  <input id={`${labelId}-deadline`} type="date" value={active.deadline} onChange={(event) => updateBook(active.id, { deadline: event.target.value })} className={`rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-semibold text-gray-800 ${FOCUS}`} />
                  {active.deadline && (
                    <button type="button" onClick={() => updateBook(active.id, { deadline: '' })} className={`rounded-xl px-3 py-2.5 text-xs font-bold text-gray-500 border border-gray-200 ${FOCUS}`}>
                      Clear deadline
                    </button>
                  )}
                </div>
                <p className={`mt-3 rounded-2xl border px-4 py-3 text-sm font-medium leading-relaxed ${TONE_CLASS[forecast.tone]}`}>
                  {forecast.verdict}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-amber-700">Log a sitting</h3>
                    <p className="mt-1 text-xs text-gray-500">Adds pages to your place and to today’s bar. This week: {weekTotal} pages.</p>
                  </div>
                  <form
                    className="flex gap-2"
                    onSubmit={(event) => {
                      event.preventDefault();
                      logPages();
                    }}
                  >
                    <label htmlFor={`${labelId}-log`} className="sr-only">Pages to log</label>
                    <input
                      id={`${labelId}-log`}
                      inputMode="numeric"
                      value={logAmount}
                      placeholder={String(active.pace)}
                      disabled={forecast.remaining === 0}
                      onChange={(event) => setLogAmount(event.target.value.replace(/\D/g, '').slice(0, 3))}
                      className={`w-24 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-mono font-semibold text-gray-800 disabled:bg-gray-100 ${FOCUS}`}
                    />
                    <button type="submit" disabled={forecast.remaining === 0} className={`rounded-xl px-4 py-2.5 text-sm font-bold text-white bg-amber-600 disabled:opacity-40 active:scale-95 ${FOCUS}`}>
                      {forecast.remaining === 0 ? 'Finished' : 'Log pages'}
                    </button>
                  </form>
                </div>
                <div className="mt-4 flex items-end gap-2" aria-hidden="true">
                  {week.map((day) => (
                    <div key={day.key} className="flex-1 flex flex-col items-center gap-1">
                      <div className="h-16 w-full flex items-end">
                        <div
                          className={`w-full rounded-md ${day.pages ? 'bg-amber-500' : 'bg-amber-100'} ${day.isToday ? 'ring-2 ring-amber-300 ring-offset-1' : ''}`}
                          style={{ height: day.pages ? `${Math.max(8, Math.round((day.pages / weekPeak) * 64))}px` : '4px' }}
                        />
                      </div>
                      <span className={`text-[10px] font-bold ${day.isToday ? 'text-amber-700' : 'text-gray-400'}`}>{day.label}</span>
                    </div>
                  ))}
                </div>
                <ul className="sr-only">
                  {week.map((day) => (
                    <li key={day.key}>{day.key}: {day.pages} pages</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      <p aria-live="polite" className="relative z-10 mt-4 min-h-5 text-sm font-medium text-amber-800">{status}</p>
    </section>
  );
}
