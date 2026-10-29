import React, { useMemo, useRef, useState } from 'react';

const ACCENT = '#4f46e5';

const SAMPLES = [
  {
    label: 'Config bump',
    before: `{
  "name": "dummy-app",
  "version": "0.1.0",
  "port": 3000,
  "features": ["quotes", "timer"]
}`,
    after: `{
  "name": "dummy-app",
  "version": "0.2.0",
  "port": 4173,
  "features": ["quotes", "timer", "diff"]
}`,
  },
  {
    label: 'Release note',
    before: `Shipped the timer and the quote card.
Known issue: the clock drifts after sleep.
Next: polish the empty state.`,
    after: `Shipped the timer, the quote card, and Diff Lens.
The clock now keeps time after sleep.
Next: add keyboard shortcuts.`,
  },
  {
    label: 'Stylesheet',
    before: `.card {
  padding: 16px;
  border-radius: 12px;
  background: #ffffff;
  color: #111827;
}`,
    after: `.card {
  padding: 24px;
  border-radius: 16px;
  background: #f8fafc;
  color: #0f172a;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
}`,
  },
];

const MODES = [
  { id: 'exact', label: 'Exact' },
  { id: 'trim', label: 'Trim ends' },
  { id: 'space', label: 'Ignore spaces' },
];

function splitLines(text) {
  if (!text) return [];
  const lines = text.split('\n');
  if (lines[lines.length - 1] === '') lines.pop();
  return lines;
}

function normalize(line, mode) {
  if (mode === 'space') return line.replace(/\s+/g, ' ').trim();
  if (mode === 'trim') return line.trimEnd();
  return line;
}

function myersDiff(a, b) {
  const N = a.length;
  const M = b.length;
  const max = N + M;
  const v = { 1: 0 };
  const trace = [];

  for (let d = 0; d <= max; d += 1) {
    trace.push({ ...v });
    for (let k = -d; k <= d; k += 2) {
      const down = k === -d || (k !== d && (v[k - 1] ?? -1) < (v[k + 1] ?? -1));
      let x = down ? (v[k + 1] ?? 0) : (v[k - 1] ?? 0) + 1;
      let y = x - k;
      while (x < N && y < M && a[x] === b[y]) {
        x += 1;
        y += 1;
      }
      v[k] = x;
      if (x >= N && y >= M) return backtrack(trace, N, M);
    }
  }
  return [];
}

function backtrack(trace, N, M) {
  let x = N;
  let y = M;
  const ops = [];

  for (let d = trace.length - 1; d >= 0; d -= 1) {
    const snap = trace[d];
    const k = x - y;
    const prevK = k === -d || (k !== d && (snap[k - 1] ?? -1) < (snap[k + 1] ?? -1)) ? k + 1 : k - 1;
    const prevX = snap[prevK] ?? 0;
    const prevY = prevX - prevK;

    while (x > prevX && y > prevY) {
      x -= 1;
      y -= 1;
      ops.push({ type: 'equal', aIndex: x, bIndex: y });
    }

    if (d > 0) {
      if (x === prevX) {
        y -= 1;
        ops.push({ type: 'insert', bIndex: y });
      } else {
        x -= 1;
        ops.push({ type: 'delete', aIndex: x });
      }
    }
  }

  return ops.reverse();
}

function tokenize(value) {
  return value.split(/(\s+)/).filter((token) => token.length);
}

function wordDiff(a, b) {
  const A = tokenize(a);
  const B = tokenize(b);
  if (!A.length && !B.length) return { left: [], right: [] };
  if (A.length > 80 || B.length > 80) {
    return {
      left: [{ type: 'del', text: a }],
      right: [{ type: 'add', text: b }],
    };
  }

  const n = A.length;
  const m = B.length;
  const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i -= 1) {
    for (let j = m - 1; j >= 0; j -= 1) {
      dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const left = [];
  const right = [];
  const push = (list, type, text) => {
    const last = list[list.length - 1];
    if (last && last.type === type) last.text += text;
    else list.push({ type, text });
  };

  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (A[i] === B[j]) {
      push(left, 'same', A[i]);
      push(right, 'same', B[j]);
      i += 1;
      j += 1;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      push(left, 'del', A[i]);
      i += 1;
    } else {
      push(right, 'add', B[j]);
      j += 1;
    }
  }
  while (i < n) push(left, 'del', A[i++]);
  while (j < m) push(right, 'add', B[j++]);
  return { left, right };
}

function buildRows(ops, before, after) {
  const rows = [];
  let i = 0;
  while (i < ops.length) {
    const op = ops[i];
    if (op.type === 'equal') {
      rows.push({
        kind: 'equal',
        left: before[op.aIndex],
        right: after[op.bIndex],
        leftNo: op.aIndex + 1,
        rightNo: op.bIndex + 1,
      });
      i += 1;
      continue;
    }

    const dels = [];
    const ins = [];
    while (i < ops.length && ops[i].type === 'delete') {
      dels.push(ops[i]);
      i += 1;
    }
    while (i < ops.length && ops[i].type === 'insert') {
      ins.push(ops[i]);
      i += 1;
    }
    const count = Math.max(dels.length, ins.length);
    for (let j = 0; j < count; j += 1) {
      const del = dels[j];
      const add = ins[j];
      if (del && add) {
        rows.push({
          kind: 'change',
          left: before[del.aIndex],
          right: after[add.bIndex],
          leftNo: del.aIndex + 1,
          rightNo: add.bIndex + 1,
          words: wordDiff(before[del.aIndex], after[add.bIndex]),
        });
      } else if (del) {
        rows.push({
          kind: 'del',
          left: before[del.aIndex],
          right: '',
          leftNo: del.aIndex + 1,
          rightNo: null,
        });
      } else {
        rows.push({
          kind: 'add',
          left: '',
          right: after[add.bIndex],
          leftNo: null,
          rightNo: add.bIndex + 1,
        });
      }
    }
  }
  return rows;
}

function lineAt(ops, index, skip) {
  let n = 0;
  for (let i = 0; i < index; i += 1) {
    if (ops[i].type !== skip) n += 1;
  }
  return n + 1;
}

function toPatch(ops, before, after) {
  const CONTEXT = 2;
  const keep = ops.map((op) => op.type !== 'equal');
  ops.forEach((op, index) => {
    if (op.type === 'equal') return;
    for (let j = Math.max(0, index - CONTEXT); j <= Math.min(ops.length - 1, index + CONTEXT); j += 1) {
      keep[j] = true;
    }
  });

  const hunks = [];
  let current = null;
  ops.forEach((op, index) => {
    if (!keep[index]) {
      current = null;
      return;
    }
    if (!current) {
      current = { start: index, ops: [] };
      hunks.push(current);
    }
    current.ops.push(op);
  });

  if (!hunks.length) return 'No differences.\n';

  const body = hunks.map((hunk) => {
    const oldCount = hunk.ops.filter((op) => op.type !== 'insert').length;
    const newCount = hunk.ops.filter((op) => op.type !== 'delete').length;
    const header = `@@ -${lineAt(ops, hunk.start, 'insert')},${oldCount} +${lineAt(ops, hunk.start, 'delete')},${newCount} @@`;
    const lines = hunk.ops.map((op) => {
      if (op.type === 'equal') return ` ${before[op.aIndex]}`;
      if (op.type === 'delete') return `-${before[op.aIndex]}`;
      return `+${after[op.bIndex]}`;
    });
    return [header, ...lines].join('\n');
  });

  return ['--- before', '+++ after', ...body].join('\n');
}

function summarize(rows) {
  const added = rows.filter((row) => row.kind === 'add').length;
  const removed = rows.filter((row) => row.kind === 'del').length;
  const changed = rows.filter((row) => row.kind === 'change').length;
  if (!added && !removed && !changed) return 'The two drafts match.';
  const parts = [];
  if (changed) parts.push(`${changed} changed`);
  if (added) parts.push(`${added} added`);
  if (removed) parts.push(`${removed} removed`);
  return parts.join(' · ');
}

function renderTokens(tokens, empty) {
  if (!tokens) return <span className={empty ? 'text-slate-300' : ''}>{empty ? ' ' : ''}</span>;
  return tokens.map((token, index) => (
    <span
      key={`${token.type}-${index}`}
      className={
        token.type === 'del'
          ? 'bg-rose-200/80 text-rose-950 rounded-sm'
          : token.type === 'add'
            ? 'bg-emerald-200/80 text-emerald-950 rounded-sm'
            : ''
      }
    >
      {token.text}
    </span>
  ));
}

const DiffLens = () => {
  const [before, setBefore] = useState(SAMPLES[0].before);
  const [after, setAfter] = useState(SAMPLES[0].after);
  const [mode, setMode] = useState('exact');
  const [layout, setLayout] = useState('split');
  const [copied, setCopied] = useState(false);
  const scroller = useRef(null);

  const model = useMemo(() => {
    const left = splitLines(before);
    const right = splitLines(after);
    const ops = myersDiff(
      left.map((line) => normalize(line, mode)),
      right.map((line) => normalize(line, mode))
    );
    const rows = buildRows(ops, left, right);
    return { left, right, ops, rows, patch: toPatch(ops, left, right) };
  }, [before, after, mode]);

  const copyPatch = () => {
    navigator.clipboard.writeText(model.patch).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    });
  };

  const swap = () => {
    setBefore(after);
    setAfter(before);
  };

  const jumpTo = (index) => {
    const node = scroller.current?.querySelector(`[data-row="${index}"]`);
    node?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  };

  const activeSample = SAMPLES.find((sample) => sample.before === before && sample.after === after);

  return (
    <div className="max-w-7xl mx-auto my-12 p-6 md:p-8 bg-white rounded-3xl shadow-[0_20px_50px_rgba(79,70,229,0.08)] border border-gray-100 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-70 -mr-32 -mt-32 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-50 rounded-full blur-3xl opacity-50 -ml-24 -mb-24 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-100 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 6h12" />
              <path d="M8 12h12" />
              <path d="M8 18h8" />
              <path d="M4 6h.01" />
              <path d="M4 12h.01" />
              <path d="M4 18h.01" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Diff Lens</h2>
            <p className="text-gray-500 text-sm font-medium mt-0.5">
              Paste two drafts and see the lines and words that actually changed
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={swap}
            className="px-4 py-2 rounded-xl text-sm font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 active:scale-95 transition-all"
          >
            Swap sides
          </button>
          <button
            onClick={copyPatch}
            className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
          >
            {copied ? 'Copied' : 'Copy patch'}
          </button>
        </div>
      </div>

      <div className="relative z-10 mt-5 flex flex-wrap items-center gap-2">
        {SAMPLES.map((sample) => {
          const active = activeSample === sample;
          return (
            <button
              key={sample.label}
              onClick={() => {
                setBefore(sample.before);
                setAfter(sample.after);
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95"
              style={
                active
                  ? { background: '#4f46e518', border: '1.5px solid #4f46e566', color: ACCENT }
                  : { background: 'transparent', border: '1.5px solid #e2e8f0', color: '#94a3b8' }
              }
            >
              {sample.label}
            </button>
          );
        })}
        <span className="mx-1 h-4 w-px bg-gray-200" />
        {MODES.map((item) => (
          <button
            key={item.id}
            onClick={() => setMode(item.id)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95"
            style={
              mode === item.id
                ? { background: '#4f46e518', border: '1.5px solid #4f46e566', color: ACCENT }
                : { background: 'transparent', border: '1.5px solid #e2e8f0', color: '#94a3b8' }
            }
          >
            {item.label}
          </button>
        ))}
      </div>

      <p className="relative z-10 mt-3 text-sm font-semibold text-indigo-800 bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2">
        {summarize(model.rows)}
      </p>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        {[
          { label: 'Before', value: before, set: setBefore },
          { label: 'After', value: after, set: setAfter },
        ].map((pane) => (
          <label key={pane.label} className="block">
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-700">{pane.label}</span>
            <textarea
              value={pane.value}
              onChange={(event) => pane.set(event.target.value)}
              spellCheck={false}
              className="mt-2 w-full h-36 bg-slate-900 text-slate-100 font-mono text-xs leading-5 rounded-2xl px-4 py-3 outline-none resize-y placeholder:text-slate-600"
            />
          </label>
        ))}
      </div>

      <div className="relative z-10 mt-5 flex items-center justify-between gap-3">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Changes</h3>
        <div className="flex rounded-xl border border-gray-200 p-0.5">
          {[
            { id: 'split', label: 'Split' },
            { id: 'unified', label: 'Unified' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setLayout(item.id)}
              className="px-3 py-1 rounded-lg text-xs font-bold transition-all"
              style={
                layout === item.id
                  ? { background: ACCENT, color: 'white' }
                  : { color: '#94a3b8' }
              }
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative z-10 mt-3 flex gap-3">
        <div className="w-3 shrink-0 flex flex-col gap-px pt-8">
          {model.rows.map((row, index) => (
            <button
              key={`map-${index}`}
              onClick={() => jumpTo(index)}
              title={`Line ${row.leftNo || row.rightNo || index + 1}`}
              className="w-full rounded-sm"
              style={{
                height: Math.max(3, Math.min(8, 140 / Math.max(model.rows.length, 1))),
                background: row.kind === 'add' ? '#10b981' : row.kind === 'del' ? '#f43f5e' : row.kind === 'change' ? '#f59e0b' : '#e2e8f0',
              }}
            />
          ))}
        </div>

        <div ref={scroller} className="flex-1 max-h-[420px] overflow-auto rounded-2xl border border-gray-100 bg-gray-50/70">
          {layout === 'split' ? (
            <div className="min-w-[640px]">
              <div className="grid grid-cols-2 sticky top-0 bg-white/95 backdrop-blur border-b border-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <div className="px-3 py-2">Before</div>
                <div className="px-3 py-2 border-l border-gray-100">After</div>
              </div>
              {model.rows.map((row, index) => (
                <div key={`row-${index}`} data-row={index} className="grid grid-cols-2 text-xs font-mono">
                  <div className={`flex min-h-7 ${row.kind === 'del' || row.kind === 'change' ? 'bg-rose-50' : ''}`}>
                    <span className="w-10 shrink-0 text-right pr-2 py-1 text-[10px] text-gray-400 select-none">{row.leftNo || ''}</span>
                    <span className="py-1 pr-3 whitespace-pre-wrap break-all">
                      {row.kind === 'change' ? renderTokens(row.words.left) : row.left || (row.kind === 'add' ? '' : '')}
                    </span>
                  </div>
                  <div className={`flex min-h-7 border-l border-gray-100 ${row.kind === 'add' || row.kind === 'change' ? 'bg-emerald-50' : ''}`}>
                    <span className="w-10 shrink-0 text-right pr-2 py-1 text-[10px] text-gray-400 select-none">{row.rightNo || ''}</span>
                    <span className="py-1 pr-3 whitespace-pre-wrap break-all">
                      {row.kind === 'change' ? renderTokens(row.words.right) : row.right}
                    </span>
                  </div>
                </div>
              ))}
              {!model.rows.length && <p className="p-4 text-sm text-gray-400">Both sides are empty.</p>}
            </div>
          ) : (
            <div className="min-w-[480px]">
              {model.rows.map((row, index) => {
                const lines = [];
                if (row.kind === 'equal' || row.kind === 'del' || row.kind === 'change') {
                  lines.push({
                    mark: row.kind === 'equal' ? ' ' : '-',
                    text: row.left,
                    tone: row.kind === 'equal' ? 'text-gray-600' : 'bg-rose-50 text-rose-900',
                  });
                }
                if (row.kind === 'add' || row.kind === 'change') {
                  lines.push({ mark: '+', text: row.right, tone: 'bg-emerald-50 text-emerald-900' });
                }
                return (
                  <div key={`uni-${index}`} data-row={index}>
                    {lines.map((line) => (
                      <div key={line.mark + line.text} className={`flex min-h-7 text-xs font-mono ${line.tone}`}>
                        <span className="w-6 shrink-0 text-center py-1 select-none opacity-70">{line.mark}</span>
                        <span className="py-1 pr-3 whitespace-pre-wrap break-all">{line.text}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
              {!model.rows.length && <p className="p-4 text-sm text-gray-400">Both sides are empty.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiffLens;
