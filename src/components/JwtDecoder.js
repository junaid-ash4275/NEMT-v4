import React, { useEffect, useId, useMemo, useState } from 'react';

const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2';

const toBase64Url = (bytes) => {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const encodeSegment = (value) => toBase64Url(new TextEncoder().encode(JSON.stringify(value)));

function decodeSegment(segment) {
  const normalized = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  const text = new TextDecoder().decode(bytes);
  const value = JSON.parse(text);
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('segment is not a JSON object');
  }
  return value;
}

function parseToken(raw) {
  const token = raw.trim().replace(/^bearer\s+/i, '');
  if (!token) return { token: '', error: '', parts: null, header: null, payload: null, signature: '' };

  const parts = token.split('.');
  if (parts.length !== 3) {
    return {
      token,
      error: `A JWT has three dotted parts, but this input has ${parts.length}. Expected header.payload.signature.`,
      parts: null,
      header: null,
      payload: null,
      signature: '',
    };
  }

  try {
    const header = decodeSegment(parts[0]);
    const payload = decodeSegment(parts[1]);
    return { token, error: '', parts, header, payload, signature: parts[2] };
  } catch {
    return {
      token,
      error: 'One of the segments is not valid base64url JSON. Check that the token was copied in full.',
      parts: null,
      header: null,
      payload: null,
      signature: '',
    };
  }
}

function buildSampleToken() {
  const issuedAt = Math.floor(Date.now() / 1000);
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    sub: 'user_4821',
    name: 'Ada Lovelace',
    role: 'admin',
    iss: 'https://demo.local',
    aud: 'dummy-app',
    iat: issuedAt,
    exp: issuedAt + 1800,
  };
  return `${encodeSegment(header)}.${encodeSegment(payload)}.${toBase64Url(new TextEncoder().encode('demo-signature'))}`;
}

function formatDuration(seconds) {
  const total = Math.abs(Math.round(seconds));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (days) return `${days}d ${hours}h`;
  if (hours) return `${hours}h ${minutes}m`;
  if (minutes) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}

const toSeconds = (value) => (typeof value === 'number' && Number.isFinite(value) ? value : null);

const formatClaim = (key, value) => {
  if (key !== 'exp' && key !== 'iat' && key !== 'nbf') return claimValue(value);
  const seconds = toSeconds(value);
  if (seconds === null) return claimValue(value);
  return `${new Date(seconds * 1000).toLocaleString()} · ${seconds}`;
};

function claimValue(value) {
  if (Array.isArray(value)) return value.join(', ');
  if (value && typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

const CLAIM_LABELS = {
  iss: 'Issuer',
  sub: 'Subject',
  aud: 'Audience',
  exp: 'Expires',
  nbf: 'Not before',
  iat: 'Issued at',
  jti: 'Token ID',
  scope: 'Scope',
  azp: 'Authorized party',
};

export default function JwtDecoder() {
  const labelId = useId();
  const [raw, setRaw] = useState('');
  const [status, setStatus] = useState('');
  const [nowSeconds, setNowSeconds] = useState(() => Math.floor(Date.now() / 1000));

  const parsed = useMemo(() => parseToken(raw), [raw]);
  const { header, payload, parts, error, signature } = parsed;

  useEffect(() => {
    if (toSeconds(payload?.exp) === null) return undefined;
    const timer = setInterval(() => setNowSeconds(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(timer);
  }, [payload]);

  const claims = payload ? Object.entries(payload) : [];
  const expiresAt = payload ? toSeconds(payload.exp) : null;
  const notBefore = payload ? toSeconds(payload.nbf) : null;

  let tokenState = { label: 'Empty', tone: 'neutral' };
  if (payload) {
    if (expiresAt !== null && nowSeconds >= expiresAt) tokenState = { label: 'Expired', tone: 'danger' };
    else if (notBefore !== null && nowSeconds < notBefore) tokenState = { label: 'Not yet valid', tone: 'warn' };
    else if (expiresAt === null && notBefore === null) tokenState = { label: 'No time claims', tone: 'neutral' };
    else tokenState = { label: 'Within validity', tone: 'good' };
  }

  const toneClasses = {
    good: 'text-emerald-700',
    danger: 'text-rose-700',
    warn: 'text-amber-700',
    neutral: 'text-indigo-800',
  };

  const expiryLabel = payload
    ? expiresAt === null
      ? 'No exp claim'
      : nowSeconds >= expiresAt
        ? `Expired ${formatDuration(nowSeconds - expiresAt)} ago`
        : `in ${formatDuration(expiresAt - nowSeconds)}`
    : '—';

  const statCards = [
    { label: 'Algorithm', value: header?.alg ? String(header.alg) : '—' },
    { label: 'Type', value: header?.typ ? String(header.typ) : '—' },
    { label: 'Status', value: tokenState.label, tone: tokenState.tone },
    { label: 'Expires', value: expiryLabel },
  ];

  const copyJson = async (value, name) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(value, null, 2));
      setStatus(`${name} copied as formatted JSON.`);
    } catch {
      setStatus('Clipboard is blocked in this browser. Select the JSON and copy it manually.');
    }
  };

  const pasteToken = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) {
        setStatus('Clipboard is empty.');
        return;
      }
      setRaw(text.trim());
      setStatus('Token pasted from clipboard.');
    } catch {
      setStatus('Clipboard read is blocked. Paste into the field with Ctrl+V or ⌘V.');
    }
  };

  const loadSample = () => {
    setRaw(buildSampleToken());
    setStatus('Sample token loaded. It expires 30 minutes after loading.');
  };

  const clearToken = () => {
    setRaw('');
    setStatus('');
  };

  return (
    <section aria-labelledby={labelId} className="max-w-7xl mx-auto my-12 p-6 md:p-8 bg-white rounded-3xl shadow-[0_20px_50px_rgba(79,70,229,0.08)] border border-gray-100 overflow-hidden relative">
      <div aria-hidden="true" className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-70 -mr-32 -mt-32 pointer-events-none" />
      <div aria-hidden="true" className="absolute bottom-0 left-0 w-80 h-80 bg-violet-50 rounded-full blur-3xl opacity-60 -ml-24 -mb-24 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-100 gap-4">
        <div className="flex items-center gap-3">
          <div aria-hidden="true" className="w-10 h-10 shrink-0 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="10" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div>
            <h2 id={labelId} className="text-3xl font-extrabold text-gray-900 tracking-tight">JWT Decoder</h2>
            <p className="text-gray-500 text-sm font-medium mt-0.5">Read headers, claims, and expiry dates without sending your token anywhere</p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start shrink-0">
          <button type="button" onClick={loadSample} className={`rounded-xl border border-indigo-200 bg-white px-4 py-2 text-sm font-bold text-indigo-700 active:scale-95 transition-all ${FOCUS}`}>
            Sample
          </button>
          <button type="button" onClick={clearToken} className={`rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-500 active:scale-95 transition-all ${FOCUS}`}>
            Clear
          </button>
        </div>
      </div>

      <div className="relative z-10 mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-indigo-100 bg-indigo-50/70 px-4 py-3 min-w-0">
            <div className={`text-lg sm:text-2xl font-black tabular-nums truncate ${card.tone ? toneClasses[card.tone] : 'text-indigo-950'}`}>{card.value}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-800/80">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        <div className="lg:col-span-5 min-w-0 space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 md:p-5">
            <div className="flex items-center justify-between gap-3">
              <label htmlFor={`${labelId}-token`} className="text-sm font-semibold text-gray-600">Encoded token</label>
              <button type="button" onClick={pasteToken} className={`rounded-lg px-3 py-1.5 text-xs font-bold text-indigo-700 border border-indigo-200 bg-white active:scale-95 transition-all ${FOCUS}`}>
                Paste
              </button>
            </div>
            <textarea
              id={`${labelId}-token`}
              value={raw}
              onChange={(event) => { setRaw(event.target.value); setStatus(''); }}
              placeholder="Paste a JWT here, for example eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…"
              spellCheck={false}
              rows={6}
              className={`mt-3 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-xs font-mono leading-6 text-gray-800 resize-y outline-none ${FOCUS}`}
            />
            <p className="mt-2 text-xs font-medium text-gray-400">
              A leading <span className="font-mono">Bearer</span> prefix is removed automatically.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-4 md:p-5">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Token structure</h3>
            {parts ? (
              <div className="break-all rounded-xl bg-slate-900 p-4 font-mono text-xs leading-6">
                <span className="text-rose-300">{parts[0]}</span>
                <span className="text-slate-500">.</span>
                <span className="text-indigo-300">{parts[1]}</span>
                <span className="text-slate-500">.</span>
                <span className="text-violet-300">{parts[2] || '—'}</span>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm font-medium text-gray-400">
                {error || 'Paste a token to see how it splits into its three parts.'}
              </div>
            )}
            <ul className="mt-3 space-y-1.5 text-xs font-medium text-gray-500">
              <li className="flex items-center gap-2">
                <span aria-hidden="true" className="w-2 h-2 rounded-full bg-rose-400" />
                Header <span className="ml-auto font-mono text-gray-400">{parts ? `${parts[0].length} chars` : '—'}</span>
              </li>
              <li className="flex items-center gap-2">
                <span aria-hidden="true" className="w-2 h-2 rounded-full bg-indigo-400" />
                Payload <span className="ml-auto font-mono text-gray-400">{parts ? `${parts[1].length} chars` : '—'}</span>
              </li>
              <li className="flex items-center gap-2">
                <span aria-hidden="true" className="w-2 h-2 rounded-full bg-violet-400" />
                Signature <span className="ml-auto font-mono text-gray-400">{parts ? `${signature.length} chars` : '—'}</span>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
            <p className="text-xs font-semibold text-amber-900">Decoded in your browser</p>
            <p className="mt-1.5 text-xs leading-relaxed text-amber-800/80">
              Nothing is uploaded or stored. The signature is displayed but never verified, so treat the claims as unverified until your server validates the token.
            </p>
          </div>
        </div>

        <div className="lg:col-span-7 min-w-0 space-y-4">
          <div className="rounded-2xl bg-slate-900 p-4 md:p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-rose-300">Header</h3>
              <button type="button" onClick={() => copyJson(header, 'Header')} disabled={!header} className={`rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-indigo-300 hover:text-white disabled:opacity-40 ${FOCUS}`}>
                Copy
              </button>
            </div>
            <pre className="mt-3 max-h-48 overflow-auto text-xs leading-6 font-mono text-rose-100">
              {header ? JSON.stringify(header, null, 2) : '// no header yet'}
            </pre>
          </div>

          <div className="rounded-2xl bg-slate-900 p-4 md:p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">Payload</h3>
              <button type="button" onClick={() => copyJson(payload, 'Payload')} disabled={!payload} className={`rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-indigo-300 hover:text-white disabled:opacity-40 ${FOCUS}`}>
                Copy
              </button>
            </div>
            <pre className="mt-3 max-h-72 overflow-auto text-xs leading-6 font-mono text-indigo-100">
              {payload ? JSON.stringify(payload, null, 2) : '// no payload yet'}
            </pre>
          </div>

          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 md:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-indigo-800/80">Claims at a glance</h3>
              <span className={`text-xs font-bold ${toneClasses[tokenState.tone]}`}>{tokenState.label}</span>
            </div>
            {claims.length ? (
              <ul className="mt-3 divide-y divide-indigo-100/80">
                {claims.map(([key, value]) => (
                  <li key={key} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2">
                    <span className="text-sm font-bold text-indigo-950">{CLAIM_LABELS[key] || key}</span>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-indigo-400">{key}</span>
                    <span className="ml-auto max-w-full break-all text-right font-mono text-xs text-indigo-900">
                      {formatClaim(key, value)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm font-medium text-indigo-900/70">Decoded claims appear here once a token is loaded.</p>
            )}
          </div>

          <p role="status" className="min-h-5 text-xs font-medium text-indigo-700">{status}</p>
        </div>
      </div>
    </section>
  );
}
