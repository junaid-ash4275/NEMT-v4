import React, { useState, useCallback, useRef, useEffect } from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────
const COMMIT_TYPES = [
  { id: 'feat',     emoji: '✨', label: 'feat',     desc: 'New feature',            color: '#10b981', glow: '#10b98133' },
  { id: 'fix',      emoji: '🐛', label: 'fix',      desc: 'Bug fix',                color: '#ef4444', glow: '#ef444433' },
  { id: 'docs',     emoji: '📝', label: 'docs',     desc: 'Documentation only',     color: '#3b82f6', glow: '#3b82f633' },
  { id: 'style',    emoji: '💅', label: 'style',    desc: 'Formatting, no logic',   color: '#ec4899', glow: '#ec489933' },
  { id: 'refactor', emoji: '♻️', label: 'refactor', desc: 'Code restructure',       color: '#f59e0b', glow: '#f59e0b33' },
  { id: 'perf',     emoji: '⚡', label: 'perf',     desc: 'Performance improvement',color: '#f97316', glow: '#f9731633' },
  { id: 'test',     emoji: '🧪', label: 'test',     desc: 'Add/update tests',       color: '#8b5cf6', glow: '#8b5cf633' },
  { id: 'chore',    emoji: '🔧', label: 'chore',    desc: 'Build tools, deps',      color: '#64748b', glow: '#64748b33' },
  { id: 'ci',       emoji: '🤖', label: 'ci',       desc: 'CI/CD changes',          color: '#06b6d4', glow: '#06b6d433' },
  { id: 'revert',   emoji: '⏪', label: 'revert',   desc: 'Revert a commit',        color: '#6366f1', glow: '#6366f133' },
];

const SCOPE_SUGGESTIONS = [
  'api', 'auth', 'ui', 'db', 'config', 'core', 'utils', 'tests',
  'build', 'deps', 'docs', 'router', 'store', 'hooks', 'types',
];

const SMART_TEMPLATES = [
  { label: 'Add login form',     type: 'feat',     scope: 'auth',   subject: 'add login form with validation',      body: 'Implements email/password login form with client-side validation and error states.' },
  { label: 'Fix null crash',     type: 'fix',      scope: 'api',    subject: 'handle null response from endpoint',  body: 'Guard against null payload returned by /users/:id when user is deleted mid-request.' },
  { label: 'Refactor hooks',     type: 'refactor', scope: 'hooks',  subject: 'extract useFetch into shared hook',   body: 'Removes duplicate fetch logic from three components into a single reusable hook.' },
  { label: 'Update README',      type: 'docs',     scope: 'docs',   subject: 'update setup instructions',           body: 'Adds Docker Compose quickstart and clarifies env variable requirements.' },
  { label: 'Bump dependencies',  type: 'chore',    scope: 'deps',   subject: 'upgrade react to v19.1.0',            body: 'Upgrades react and react-dom to v19.1.0 resolving two deprecation warnings.' },
  { label: 'Optimize query',     type: 'perf',     scope: 'db',     subject: 'add index on users.email column',     body: 'Reduces average query time for login lookups from 340ms to 4ms.' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function buildCommit({ type, scope, subject, body, footer, breaking, emoji: useEmoji }) {
  const t = COMMIT_TYPES.find(t => t.id === type);
  const scopePart = scope.trim() ? `(${scope.trim()})` : '';
  const bangPart  = breaking ? '!' : '';
  const emojiBit  = useEmoji && t ? `${t.emoji} ` : '';
  const firstLine = `${emojiBit}${type}${scopePart}${bangPart}: ${subject.trim()}`;

  const parts = [firstLine];
  if (body.trim())   parts.push('', body.trim());
  if (breaking && footer.trim()) parts.push('', `BREAKING CHANGE: ${footer.trim()}`);
  else if (footer.trim())        parts.push('', footer.trim());

  return parts.join('\n');
}

function charClass(len, max) {
  if (len > max)        return '#ef4444';
  if (len > max * 0.85) return '#f59e0b';
  return '#10b981';
}

// ─── Sub-components ───────────────────────────────────────────────────────────
const TypeBadge = ({ t, selected, onClick }) => (
  <button
    onClick={() => onClick(t.id)}
    title={t.desc}
    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95 select-none"
    style={
      selected
        ? { background: `${t.color}18`, border: `1.5px solid ${t.color}66`, color: t.color, boxShadow: `0 0 14px ${t.glow}` }
        : { background: 'transparent', border: '1.5px solid #e2e8f0', color: '#94a3b8' }
    }
  >
    <span>{t.emoji}</span>
    <span>{t.label}</span>
  </button>
);

const CharCounter = ({ value, max }) => {
  const len = value.length;
  const color = charClass(len, max);
  return (
    <span className="text-[10px] font-bold tabular-nums" style={{ color }}>
      {len}/{max}
    </span>
  );
};

// ─── Animated preview (types itself in) ──────────────────────────────────────
const AnimatedPreview = ({ text }) => {
  const [displayed, setDisplayed] = useState('');
  const prevText = useRef('');
  const timerId  = useRef(null);

  useEffect(() => {
    if (text === prevText.current) return;
    prevText.current = text;
    clearTimeout(timerId.current);
    let i = 0;
    setDisplayed('');
    const step = () => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i < text.length) timerId.current = setTimeout(step, 10);
    };
    timerId.current = setTimeout(step, 10);
    return () => clearTimeout(timerId.current);
  }, [text]);

  return (
    <pre className="text-sm font-mono leading-relaxed whitespace-pre-wrap break-words text-gray-100 min-h-[60px]">
      {displayed}
      <span className="animate-pulse text-emerald-400">▌</span>
    </pre>
  );
};

// ─── Copy button ──────────────────────────────────────────────────────────────
const CopyBtn = ({ text, color = '#10b981' }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all active:scale-95"
      style={
        copied
          ? { background: `${color}18`, border: `1.5px solid ${color}55`, color }
          : { background: 'white', border: '1.5px solid #e2e8f0', color: '#64748b' }
      }
    >
      {copied ? '✓ Copied!' : '⧉ Copy'}
    </button>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const GitCommitCrafter = () => {
  const [type,        setType]        = useState('feat');
  const [scope,       setScope]       = useState('');
  const [subject,     setSubject]     = useState('');
  const [body,        setBody]        = useState('');
  const [footer,      setFooter]      = useState('');
  const [breaking,    setBreaking]    = useState(false);
  const [useEmoji,    setUseEmoji]    = useState(true);
  const [history,     setHistory]     = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [customScope, setCustomScope] = useState(false);

  const selectedType = COMMIT_TYPES.find(t => t.id === type);
  const commit    = buildCommit({ type, scope, subject, body, footer, breaking, emoji: useEmoji });
  const firstLine = commit.split('\n')[0];
  const isValid   = subject.trim().length >= 3;

  const saveToHistory = useCallback(() => {
    if (!isValid) return;
    setHistory(prev => [{ commit, type, scope, subject, ts: Date.now() }, ...prev].slice(0, 10));
  }, [commit, type, scope, subject, isValid]);

  const loadTemplate = (tpl) => {
    setType(tpl.type);
    setScope(tpl.scope);
    setSubject(tpl.subject);
    setBody(tpl.body);
    setFooter('');
    setBreaking(false);
  };

  const reset = () => {
    setType('feat'); setScope(''); setSubject(''); setBody(''); setFooter(''); setBreaking(false);
  };

  return (
    <div className="max-w-7xl mx-auto my-12 p-6 md:p-8 bg-white rounded-3xl shadow-[0_20px_50px_rgba(16,185,129,0.08)] border border-gray-100 overflow-hidden relative">

      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-50 rounded-full blur-3xl opacity-60 -mr-32 -mt-32 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-50 rounded-full blur-3xl opacity-40 -ml-24 -mb-24 pointer-events-none" />

      {/* ── Header ── */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-100 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 text-xl font-bold">
            ✦
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Git Commit Crafter</h2>
            <p className="text-gray-500 text-sm font-medium mt-0.5">
              Build perfect <span className="font-bold text-gray-700">Conventional Commits</span> with live preview &amp; history
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setUseEmoji(e => !e)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${useEmoji ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}
          >
            {useEmoji ? '😀 Emojis ON' : '😀 Emojis OFF'}
          </button>
          <button
            onClick={() => setShowHistory(h => !h)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold border bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100 transition-all"
          >
            🕓 History {history.length > 0 && `(${history.length})`}
          </button>
          <button onClick={reset} className="px-3 py-1.5 rounded-xl text-xs font-bold border bg-gray-50 border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 transition-all">
            ✕ Reset
          </button>
        </div>
      </div>

      {/* ── Type selector ── */}
      <div className="relative z-10 mt-6">
        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Commit Type</label>
        <div className="flex flex-wrap gap-2">
          {COMMIT_TYPES.map(t => (
            <TypeBadge key={t.id} t={t} selected={type === t.id} onClick={setType} />
          ))}
        </div>
        {selectedType && (
          <p className="mt-2 text-xs text-gray-400 font-medium">
            💡 <span style={{ color: selectedType.color }}>{selectedType.label}</span> — {selectedType.desc}
          </p>
        )}
      </div>

      {/* ── Main grid ── */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">

        {/* ─ Left: Form ─ */}
        <div className="lg:col-span-6 space-y-4">

          {/* Scope */}
          <div className="bg-gray-50/90 rounded-2xl p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-violet-600">
                Scope <span className="text-gray-400 normal-case font-normal">(optional)</span>
              </label>
              <button
                onClick={() => setCustomScope(c => !c)}
                className="text-[10px] font-bold text-violet-400 hover:text-violet-600 transition-colors"
              >
                {customScope ? '⬤ Suggestions' : '✎ Custom'}
              </button>
            </div>
            {customScope ? (
              <input
                type="text"
                value={scope}
                onChange={e => setScope(e.target.value.toLowerCase().replace(/\s/g, ''))}
                placeholder="e.g. auth, api, ui…"
                maxLength={30}
                className="w-full bg-white border border-violet-200 rounded-xl px-3 py-2 text-sm font-mono text-gray-800 outline-none focus:ring-2 focus:ring-violet-300 transition-all"
              />
            ) : (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {SCOPE_SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => setScope(scope === s ? '' : s)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${scope === s ? 'bg-violet-50 border-violet-300 text-violet-700' : 'bg-white border-gray-200 text-gray-500 hover:border-violet-200'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Subject */}
          <div className="bg-gray-50/90 rounded-2xl p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-emerald-600">Subject Line *</label>
              <CharCounter value={subject} max={72} />
            </div>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="describe what this commit does…"
              maxLength={100}
              className="w-full bg-white border border-emerald-200 rounded-xl px-3 py-2 text-sm font-mono text-gray-800 outline-none focus:ring-2 focus:ring-emerald-300 transition-all"
            />
            <p className="mt-1.5 text-[10px] text-gray-400">Use imperative mood: <em>"add feature"</em> not <em>"added feature"</em></p>
          </div>

          {/* Body */}
          <div className="bg-gray-50/90 rounded-2xl p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-blue-500">Body <span className="text-gray-400 normal-case font-normal">(optional)</span></label>
              <CharCounter value={body} max={500} />
            </div>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Explain the motivation — what changed and why (not how)…"
              rows={3}
              maxLength={600}
              className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-sm font-mono text-gray-800 outline-none focus:ring-2 focus:ring-blue-300 transition-all resize-none"
            />
          </div>

          {/* Footer + Breaking change */}
          <div className="bg-gray-50/90 rounded-2xl p-4 border border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Footer / Refs</label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div
                  onClick={() => setBreaking(b => !b)}
                  className={`w-9 h-5 rounded-full border-2 transition-all flex items-center ${breaking ? 'bg-red-500 border-red-500' : 'bg-gray-200 border-gray-200'}`}
                >
                  <div className={`w-3.5 h-3.5 bg-white rounded-full shadow transition-transform mx-0.5 ${breaking ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
                <span className={`text-xs font-bold ${breaking ? 'text-red-500' : 'text-gray-400'}`}>Breaking Change</span>
              </label>
            </div>
            <input
              type="text"
              value={footer}
              onChange={e => setFooter(e.target.value)}
              placeholder={breaking ? 'Describe the breaking change…' : 'Refs #123, Closes #456…'}
              className={`w-full bg-white rounded-xl px-3 py-2 text-sm font-mono text-gray-800 outline-none transition-all border ${breaking ? 'border-red-300 focus:ring-2 focus:ring-red-200' : 'border-gray-200 focus:ring-2 focus:ring-gray-200'}`}
            />
          </div>
        </div>

        {/* ─ Right: Preview + gauges + templates ─ */}
        <div className="lg:col-span-6 flex flex-col gap-5">

          {/* Live terminal preview */}
          <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800 flex-1">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
                <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-gray-600">git commit -m</span>
              </div>
              <CopyBtn text={commit} color={selectedType?.color ?? '#10b981'} />
            </div>

            {isValid ? (
              <AnimatedPreview text={commit} />
            ) : (
              <p className="text-sm font-mono text-gray-600 min-h-[60px]">
                <span className="text-gray-700">← </span>Fill in the subject line to see your commit…
              </p>
            )}

            {firstLine.length > 72 && (
              <div className="mt-3 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-400 font-semibold">
                ⚠️ First line is {firstLine.length} chars — Git recommends ≤ 72
              </div>
            )}

            {breaking && (
              <div className="mt-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-[11px] text-red-400 font-semibold">
                🚨 This commit contains a breaking change
              </div>
            )}
          </div>

          {/* Char budget gauge */}
          <div className="bg-gray-50/90 rounded-2xl p-4 border border-gray-100">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
              <span>First-line length</span>
              <span style={{ color: charClass(firstLine.length, 72) }}>{firstLine.length} / 72 chars</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min((firstLine.length / 72) * 100, 100)}%`,
                  background: charClass(firstLine.length, 72),
                }}
              />
            </div>
          </div>

          {/* Save button */}
          <button
            onClick={saveToHistory}
            disabled={!isValid}
            className="w-full py-2.5 rounded-xl text-sm font-bold border transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            style={isValid ? { background: `${selectedType?.color}18`, borderColor: `${selectedType?.color}55`, color: selectedType?.color } : { borderColor: '#e2e8f0', color: '#94a3b8' }}
          >
            ✦ Save to History
          </button>

          {/* Quick templates */}
          <div className="bg-gray-50/90 rounded-2xl p-4 border border-gray-100">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Quick Templates</h4>
            <div className="flex flex-wrap gap-2">
              {SMART_TEMPLATES.map(tpl => {
                const t = COMMIT_TYPES.find(c => c.id === tpl.type);
                return (
                  <button
                    key={tpl.label}
                    onClick={() => loadTemplate(tpl)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold border bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900 transition-all active:scale-95 shadow-sm"
                  >
                    <span>{t?.emoji}</span>
                    <span>{tpl.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── History panel ── */}
      {showHistory && (
        <div className="relative z-10 mt-6 bg-gray-900 rounded-2xl p-5 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Saved Commits</h4>
            {history.length > 0 && (
              <button onClick={() => setHistory([])} className="text-[10px] text-red-400 font-bold hover:text-red-300 transition-colors">
                Clear all
              </button>
            )}
          </div>
          {history.length === 0 ? (
            <p className="text-xs text-gray-600 font-mono">No commits saved yet — fill the form and click "Save to History".</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {history.map((h) => {
                const t = COMMIT_TYPES.find(c => c.id === h.type);
                return (
                  <div key={h.ts} className="flex items-start gap-3 py-2 border-b border-gray-800 last:border-0">
                    <span className="text-lg mt-0.5">{t?.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap break-words leading-relaxed">{h.commit}</pre>
                      <span className="text-[9px] text-gray-600 mt-0.5 block">{new Date(h.ts).toLocaleTimeString([], { hour12: true })}</span>
                    </div>
                    <CopyBtn text={h.commit} color={t?.color ?? '#10b981'} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Footer ── */}
      <div className="relative z-10 mt-6 pt-5 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-400">
        <span>
          Follows the{' '}
          <a href="https://www.conventionalcommits.org" target="_blank" rel="noreferrer" className="underline hover:text-gray-600 transition-colors">
            Conventional Commits
          </a>{' '}
          specification
        </span>
        <span className="text-[10px] font-medium uppercase tracking-wider text-gray-300">
          type(scope)!: subject · body · footer
        </span>
      </div>
    </div>
  );
};

export default GitCommitCrafter;
