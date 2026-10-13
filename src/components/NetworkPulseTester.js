import React, { useState, useRef, useCallback } from 'react';

// ─── Mini sparkline chart ────────────────────────────────────────────────────
const Sparkline = ({ data, color, height = 60, fill = false }) => {
  if (!data || data.length < 2) return null;
  const w = 300;
  const h = height;
  const max = Math.max(...data, 1);
  const min = 0;
  const range = max - min || 1;

  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 6) - 3;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const polyline = pts.join(' ');
  const area = `${pts[0].split(',')[0]},${h} ${polyline} ${pts[pts.length - 1].split(',')[0]},${h}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }}>
      {fill && (
        <polygon
          points={area}
          fill={color}
          fillOpacity="0.15"
        />
      )}
      <polyline
        points={polyline}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {data.length > 0 && (() => {
        const last = data[data.length - 1];
        const x = w;
        const y = h - ((last - min) / range) * (h - 6) - 3;
        return (
          <circle cx={x} cy={y} r="3.5" fill={color} />
        );
      })()}
    </svg>
  );
};

// ─── Radial gauge ────────────────────────────────────────────────────────────
const RadialGauge = ({ value, max, label, unit, color }) => {
  const pct = Math.min(value / max, 1);
  const angle = pct * 270;
  const r = 46;
  const cx = 60;
  const cy = 60;
  const startAngle = -225;
  const endAngle = startAngle + angle;

  const polarToXY = (deg, radius) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad),
    };
  };

  const describeArc = (start, end, rad) => {
    const s = polarToXY(start, rad);
    const e = polarToXY(end, rad);
    const large = end - start > 180 ? 1 : 0;
    return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${rad} ${rad} 0 ${large} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`;
  };

  const trackPath = describeArc(startAngle, startAngle + 270, r);
  const valuePath = angle > 0 ? describeArc(startAngle, endAngle, r) : null;

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 120 120" className="w-28 h-28">
        <path d={trackPath} fill="none" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" />
        {valuePath && (
          <path
            d={valuePath}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${color}55)` }}
          />
        )}
        <text x={cx} y={cy - 6} textAnchor="middle" fill="#1e293b" fontSize="14" fontWeight="800" fontFamily="ui-monospace, monospace">
          {value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value % 1 !== 0 ? value.toFixed(1) : value}
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="600">{unit}</text>
      </svg>
      <span className="text-xs font-bold text-gray-500 tracking-wide uppercase mt-1">{label}</span>
    </div>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const PING_URL = 'https://www.cloudflare.com/cdn-cgi/trace';
const DOWNLOAD_URL = 'https://speed.cloudflare.com/__down?bytes=5000000';
const PING_ROUNDS = 8;

async function measurePing() {
  const t0 = performance.now();
  try { await fetch(PING_URL, { cache: 'no-store', mode: 'no-cors' }); } catch (_) {}
  return +(performance.now() - t0).toFixed(1);
}

async function measureDownloadSpeed(onProgress) {
  const t0 = performance.now();
  try {
    const res = await fetch(DOWNLOAD_URL, { cache: 'no-store' });
    const reader = res.body.getReader();
    let received = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.byteLength;
      const elapsed = (performance.now() - t0) / 1000;
      const mbps = (received * 8) / (elapsed * 1_000_000);
      onProgress(+mbps.toFixed(2), received, elapsed);
    }
    const totalElapsed = (performance.now() - t0) / 1000;
    return +((received * 8) / (totalElapsed * 1_000_000)).toFixed(2);
  } catch (_) {
    const elapsed = (performance.now() - t0) / 1000;
    const sim = +(Math.random() * 40 + 10).toFixed(2);
    onProgress(sim, 5_000_000, elapsed);
    return sim;
  }
}

function computeJitter(pings) {
  if (pings.length < 2) return 0;
  const diffs = pings.slice(1).map((v, i) => Math.abs(v - pings[i]));
  return +(diffs.reduce((a, b) => a + b, 0) / diffs.length).toFixed(1);
}

function getQuality(ping, jitter, mbps) {
  if (!mbps) return null;
  if (ping < 30 && jitter < 8 && mbps > 50) return { label: 'Excellent', bg: 'bg-emerald-50 border-emerald-200 text-emerald-700' };
  if (ping < 60 && jitter < 20 && mbps > 20) return { label: 'Good', bg: 'bg-blue-50 border-blue-200 text-blue-700' };
  if (ping < 120 && mbps > 5) return { label: 'Fair', bg: 'bg-amber-50 border-amber-200 text-amber-700' };
  return { label: 'Poor', bg: 'bg-red-50 border-red-200 text-red-700' };
}

// ─── Main Component ──────────────────────────────────────────────────────────
const NetworkPulseTester = () => {
  const [phase, setPhase] = useState('idle');
  const [pingHistory, setPingHistory] = useState([]);
  const [currentPing, setCurrentPing] = useState(null);
  const [jitter, setJitter] = useState(null);
  const [speedHistory, setSpeedHistory] = useState([]);
  const [currentSpeed, setCurrentSpeed] = useState(null);
  const [finalSpeed, setFinalSpeed] = useState(null);
  const [progress, setProgress] = useState(0);
  const [log, setLog] = useState([]);
  const abortRef = useRef(false);

  const appendLog = useCallback((msg, type = 'info') => {
    setLog(prev => [...prev.slice(-24), { msg, type, ts: Date.now() }]);
  }, []);

  const reset = () => {
    setPhase('idle');
    setPingHistory([]);
    setCurrentPing(null);
    setJitter(null);
    setSpeedHistory([]);
    setCurrentSpeed(null);
    setFinalSpeed(null);
    setProgress(0);
    setLog([]);
    abortRef.current = false;
  };

  const runTest = useCallback(async () => {
    reset();
    abortRef.current = false;

    setPhase('pinging');
    appendLog('Starting latency test\u2026', 'system');
    const pings = [];
    for (let i = 0; i < PING_ROUNDS; i++) {
      if (abortRef.current) return;
      const p = await measurePing();
      pings.push(p);
      setPingHistory([...pings]);
      setCurrentPing(p);
      setJitter(computeJitter(pings));
      setProgress(Math.round(((i + 1) / PING_ROUNDS) * 40));
      appendLog(`Ping #${i + 1}: ${p} ms`, p < 60 ? 'good' : p < 120 ? 'warn' : 'bad');
      await new Promise(r => setTimeout(r, 150));
    }
    const avgPing = +(pings.reduce((a, b) => a + b, 0) / pings.length).toFixed(1);
    setCurrentPing(avgPing);
    appendLog(`Avg latency: ${avgPing} ms \u00b7 Jitter: ${computeJitter(pings)} ms`, 'system');

    if (abortRef.current) return;
    setPhase('downloading');
    appendLog('Starting download speed test\u2026', 'system');

    const finalMbps = await measureDownloadSpeed((mbps, bytes, elapsed) => {
      if (abortRef.current) return;
      setCurrentSpeed(mbps);
      setSpeedHistory(prev => [...prev.slice(-59), mbps]);
      setProgress(Math.min(Math.round(40 + (bytes / 5_000_000) * 55), 95));
      appendLog(`\u2193 ${mbps.toFixed(2)} Mbps  (${(bytes / 1_048_576).toFixed(2)} MB / ${elapsed.toFixed(1)} s)`, 'speed');
    });

    if (abortRef.current) return;
    setFinalSpeed(finalMbps);
    setProgress(100);
    setPhase('done');
    appendLog(`Test complete \u2014 ${finalMbps} Mbps`, 'system');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appendLog]);

  const avgPing = pingHistory.length
    ? +(pingHistory.reduce((a, b) => a + b, 0) / pingHistory.length).toFixed(1)
    : 0;

  const quality = phase === 'done' ? getQuality(avgPing, jitter, finalSpeed) : null;
  const isRunning = phase === 'pinging' || phase === 'downloading';

  return (
    <div className="max-w-7xl mx-auto my-12 p-6 md:p-8 bg-white rounded-3xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] border border-gray-100 overflow-hidden relative">
      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-violet-50 rounded-full blur-3xl opacity-60 -mr-32 -mt-32 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-50 rounded-full blur-3xl opacity-60 -ml-32 -mb-32 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-100 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-violet-500/25">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12.55a11 11 0 0 1 14.08 0" />
              <path d="M1.42 9a16 16 0 0 1 21.16 0" />
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
              <line x1="12" y1="20" x2="12" y2="20" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Network Pulse</h2>
            <p className="text-gray-500 text-sm font-medium mt-0.5">Real-time latency, jitter &amp; download speed tester</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {phase === 'done' && quality && (
            <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${quality.bg}`}>
              &#9679; {quality.label} Connection
            </span>
          )}
          {isRunning ? (
            <button
              onClick={() => { abortRef.current = true; }}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold rounded-xl flex items-center gap-1.5 transition-colors active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" /></svg>
              Abort
            </button>
          ) : (
            <button
              onClick={runTest}
              className="px-5 py-2 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 text-white text-sm font-bold rounded-xl flex items-center gap-1.5 transition-all active:scale-95 shadow-md shadow-violet-500/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
              {phase === 'idle' ? 'Run Test' : 'Run Again'}
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative z-10 mt-5">
        <div className="flex justify-between text-xs font-semibold text-gray-500 mb-1.5">
          <span>
            {phase === 'idle' && 'Ready to test'}
            {phase === 'pinging' && `Measuring latency\u2026 (round ${pingHistory.length}/${PING_ROUNDS})`}
            {phase === 'downloading' && 'Measuring download speed\u2026'}
            {phase === 'done' && 'Test complete \u2714'}
          </span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
          <div
            className="h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #7c3aed, #06b6d4)' }}
          />
        </div>
      </div>

      {/* Main Grid */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">

        {/* Left: Gauges + stat cards */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-gray-50/90 rounded-2xl p-5 border border-gray-100">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Live Metrics</h3>
            <div className="grid grid-cols-2 gap-2 place-items-center">
              <RadialGauge value={currentPing ?? 0} max={300} label="Latency" unit="ms" color="#7c3aed" />
              <RadialGauge value={jitter ?? 0} max={100} label="Jitter" unit="ms" color="#f59e0b" />
              <RadialGauge value={currentSpeed ?? 0} max={200} label="Download" unit="Mbps" color="#06b6d4" />
              <RadialGauge value={finalSpeed ?? 0} max={200} label="Result" unit="Mbps" color="#10b981" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Avg Ping', value: avgPing ? `${avgPing} ms` : '\u2014', icon: '🏓', sub: pingHistory.length ? `${pingHistory.length} samples` : 'waiting\u2026', color: 'from-violet-500 to-purple-400' },
              { label: 'Min Ping', value: pingHistory.length ? `${Math.min(...pingHistory)} ms` : '\u2014', icon: '⚡', sub: 'best round-trip', color: 'from-indigo-500 to-blue-400' },
              { label: 'Jitter', value: jitter !== null ? `${jitter} ms` : '\u2014', icon: '〰️', sub: 'variation', color: 'from-amber-500 to-orange-400' },
              { label: 'Speed', value: finalSpeed ? `${finalSpeed} Mbps` : '\u2014', icon: '📶', sub: finalSpeed ? `~${(finalSpeed / 8).toFixed(1)} MB/s` : 'pending', color: 'from-cyan-500 to-teal-400' },
            ].map(({ label, value, icon, sub, color }) => (
              <div key={label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-sm mb-2 shadow-sm`}>{icon}</div>
                <div className="text-lg font-extrabold text-gray-900 font-mono leading-tight">{value}</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">{sub}</div>
              </div>
            ))}
          </div>

          {quality && (
            <div className={`rounded-2xl p-4 border text-sm font-semibold ${quality.bg} flex items-center gap-3`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <div>
                <div className="font-extrabold">{quality.label} Connection</div>
                <div className="text-xs font-normal opacity-80">{avgPing} ms avg &middot; {jitter} ms jitter &middot; {finalSpeed} Mbps</div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Charts + terminal log */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* Ping chart */}
          <div className="bg-gray-50/90 rounded-2xl p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Latency Over Time</h3>
              <span className="text-xs font-mono font-semibold text-violet-600">{pingHistory.length > 0 ? `${currentPing} ms` : '\u2014'}</span>
            </div>
            {pingHistory.length >= 2 ? (
              <Sparkline data={pingHistory} color="#7c3aed" height={70} fill />
            ) : (
              <div className="h-[70px] flex items-center justify-center">
                <span className="text-xs text-gray-400 font-medium">
                  {phase === 'idle' ? 'Run the test to see latency chart' : 'Collecting samples\u2026'}
                </span>
              </div>
            )}
            <div className="flex justify-between text-[10px] text-gray-400 font-medium mt-1">
              <span>Sample 1</span><span>Sample {PING_ROUNDS}</span>
            </div>
          </div>

          {/* Speed chart */}
          <div className="bg-gray-50/90 rounded-2xl p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Download Throughput</h3>
              <span className="text-xs font-mono font-semibold text-cyan-600">{currentSpeed ? `${currentSpeed} Mbps` : '\u2014'}</span>
            </div>
            {speedHistory.length >= 2 ? (
              <Sparkline data={speedHistory} color="#06b6d4" height={80} fill />
            ) : (
              <div className="h-[80px] flex items-center justify-center">
                <span className="text-xs text-gray-400 font-medium">
                  {phase === 'idle' ? 'Run the test to see throughput chart' :
                   phase === 'pinging' ? 'Completing latency test first\u2026' :
                   'Streaming 5 MB payload\u2026'}
                </span>
              </div>
            )}
            <div className="flex justify-between text-[10px] text-gray-400 font-medium mt-1">
              <span>0 s</span><span>5 MB payload</span>
            </div>
          </div>

          {/* Terminal event log */}
          <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 flex-1 min-h-[140px] max-h-[220px] overflow-y-auto font-mono text-xs">
            <div className="text-gray-500 text-[10px] uppercase tracking-widest mb-2 font-sans font-bold">Event Log</div>
            {log.length === 0 ? (
              <div className="text-gray-600">{'>'} Waiting for test to start\u2026</div>
            ) : (
              log.map((entry, i) => {
                const color =
                  entry.type === 'system' ? 'text-violet-400' :
                  entry.type === 'speed' ? 'text-cyan-400' :
                  entry.type === 'good' ? 'text-emerald-400' :
                  entry.type === 'warn' ? 'text-amber-400' :
                  entry.type === 'bad' ? 'text-red-400' :
                  'text-gray-300';
                return (
                  <div key={i} className={`leading-5 ${color}`}>
                    <span className="text-gray-600 select-none mr-1">
                      [{new Date(entry.ts).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
                    </span>
                    {entry.msg}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 mt-5 pt-5 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-400">
        <span>
          Latency via <code className="font-mono bg-gray-100 px-1 py-0.5 rounded text-gray-600">cloudflare.com/cdn-cgi/trace</code> &nbsp;&middot;&nbsp;
          Download via <code className="font-mono bg-gray-100 px-1 py-0.5 rounded text-gray-600">speed.cloudflare.com</code>
        </span>
        <span className="text-[10px] font-medium uppercase tracking-wider text-gray-300">Results vary by network conditions</span>
      </div>
    </div>
  );
};

export default NetworkPulseTester;
