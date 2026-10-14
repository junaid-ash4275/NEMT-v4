import React, { useState, useEffect, useRef, useCallback } from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────
const OPERATIONS = [
  { id: 'AND',  label: 'AND',  symbol: '&',  color: '#7c3aed', glow: '#7c3aed44', desc: '1 only when both bits are 1' },
  { id: 'OR',   label: 'OR',   symbol: '|',  color: '#06b6d4', glow: '#06b6d444', desc: '1 when at least one bit is 1' },
  { id: 'XOR',  label: 'XOR',  symbol: '^',  color: '#f59e0b', glow: '#f59e0b44', desc: '1 when bits differ' },
  { id: 'NOT_A', label: 'NOT A', symbol: '~', color: '#10b981', glow: '#10b98144', desc: 'Flip all bits of A (32-bit)' },
  { id: 'LSHIFT', label: 'A << n', symbol: '<<', color: '#ec4899', glow: '#ec489944', desc: 'Shift A left by n bits' },
  { id: 'RSHIFT', label: 'A >> n', symbol: '>>', color: '#f97316', glow: '#f9731644', desc: 'Shift A right by n bits' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function toBin(n, bits = 16) {
  const unsigned = n >>> 0;
  return unsigned.toString(2).padStart(bits, '0').slice(-bits);
}

function computeResult(op, a, b) {
  switch (op) {
    case 'AND':    return (a & b) >>> 0;
    case 'OR':     return (a | b) >>> 0;
    case 'XOR':    return (a ^ b) >>> 0;
    case 'NOT_A':  return (~a) >>> 0;
    case 'LSHIFT': return (a << Math.min(b, 31)) >>> 0;
    case 'RSHIFT': return (a >>> Math.min(b, 31)) >>> 0;
    default:       return 0;
  }
}

function toHex(n) { return '0x' + (n >>> 0).toString(16).toUpperCase().padStart(8, '0'); }
function toOct(n) { return '0o' + (n >>> 0).toString(8); }

function parseInput(str) {
  const s = str.trim();
  if (/^0x/i.test(s))  return parseInt(s, 16);
  if (/^0b/i.test(s))  return parseInt(s.slice(2), 2);
  if (/^0o/i.test(s))  return parseInt(s.slice(2), 8);
  return parseInt(s, 10);
}

// ─── Animated bit cell ────────────────────────────────────────────────────────
const BitCell = ({ bit, index, highlight, color, animated, role }) => {
  const [flash, setFlash] = useState(false);
  const prevBit = useRef(bit);

  useEffect(() => {
    if (prevBit.current !== bit && animated) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 350);
      prevBit.current = bit;
      return () => clearTimeout(t);
    }
    prevBit.current = bit;
  }, [bit, animated]);

  const isOne = bit === '1';

  return (
    <div
      className={`relative flex items-center justify-center rounded-lg text-xs font-bold font-mono select-none transition-all duration-300 ${
        index % 8 === 0 && index !== 0 ? 'ml-2' : ''
      }`}
      style={{
        width: 28,
        height: 32,
        background: flash
          ? `${color}33`
          : isOne
          ? `${color}22`
          : 'rgba(241,245,249,0.7)',
        border: `1.5px solid ${isOne ? color : '#e2e8f0'}`,
        boxShadow: isOne ? `0 0 8px ${color}55` : 'none',
        color: isOne ? color : '#94a3b8',
        transform: flash ? 'scale(1.18)' : 'scale(1)',
      }}
      title={`Bit ${15 - index} (${role}): ${bit}`}
    >
      {bit}
      {isOne && (
        <span
          className="absolute bottom-0.5 left-0 right-0 h-0.5 rounded-full"
          style={{ background: color, opacity: 0.6 }}
        />
      )}
    </div>
  );
};

// ─── Bit row (label + 16 bits) ────────────────────────────────────────────────
const BitRow = ({ label, value, color, animated, role }) => {
  const bits = toBin(value >>> 0, 16).split('');

  return (
    <div className="flex items-center gap-2">
      <span
        className="text-[10px] font-bold uppercase tracking-wider w-8 shrink-0 text-right"
        style={{ color }}
      >
        {label}
      </span>
      <div className="flex gap-0.5 flex-wrap">
        {bits.map((b, i) => (
          <BitCell
            key={i}
            bit={b}
            index={i}
            color={color}
            animated={animated}
            role={role}
          />
        ))}
      </div>
    </div>
  );
};

// ─── Mini number card ─────────────────────────────────────────────────────────
const NumBadge = ({ label, value, color }) => (
  <div
    className="rounded-xl px-3 py-2 flex flex-col gap-0.5"
    style={{ background: `${color}11`, border: `1px solid ${color}33` }}
  >
    <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color }}>
      {label}
    </span>
    <span className="text-sm font-extrabold font-mono" style={{ color }}>
      {value}
    </span>
  </div>
);

// ─── Animated canvas pulse visualizer ────────────────────────────────────────
const PulseCanvas = ({ aVal, bVal, result, color }) => {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const tRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.offsetWidth;
    const H = 60;
    canvas.width = W;
    canvas.height = H;

    const bits = 8;
    const aBits = toBin(aVal >>> 0, bits);
    const bBits = toBin(bVal >>> 0, bits);
    const rBits = toBin(result >>> 0, bits);

    const draw = () => {
      tRef.current += 0.025;
      ctx.clearRect(0, 0, W, H);

      const drawWaveform = (bitsStr, yBase, col, alpha = 0.9) => {
        ctx.beginPath();
        ctx.strokeStyle = col;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = alpha;
        const segW = W / bits;
        bitsStr.split('').forEach((b, i) => {
          const x0 = i * segW;
          const x1 = (i + 1) * segW;
          const y = b === '1' ? yBase - 8 : yBase + 8;
          if (i === 0) ctx.moveTo(x0, y);
          else {
            const prevY = bitsStr[i - 1] === '1' ? yBase - 8 : yBase + 8;
            ctx.lineTo(x0, prevY);
            ctx.lineTo(x0, y);
          }
          ctx.lineTo(x1, y);
        });
        ctx.stroke();
        ctx.globalAlpha = 1;
      };

      drawWaveform(aBits, 14, '#7c3aed');
      drawWaveform(bBits, 32, '#06b6d4');
      drawWaveform(rBits, 50, color);

      // Labels
      ctx.font = '8px ui-monospace, monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.globalAlpha = 0.8;
      ctx.fillText('A', 2, 12);
      ctx.fillText('B', 2, 30);
      ctx.fillText('R', 2, 48);
      ctx.globalAlpha = 1;

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [aVal, bVal, result, color]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full rounded-xl"
      style={{ height: 60, background: 'rgba(15,23,42,0.94)' }}
    />
  );
};

// ─── Truth table chip ─────────────────────────────────────────────────────────
const TruthTableCard = ({ op }) => {
  const rows = [
    { a: 0, b: 0 },
    { a: 0, b: 1 },
    { a: 1, b: 0 },
    { a: 1, b: 1 },
  ];

  const compute = (a, b) => {
    switch (op.id) {
      case 'AND':    return a & b;
      case 'OR':     return a | b;
      case 'XOR':    return a ^ b;
      case 'NOT_A':  return a === 0 ? 1 : 0;
      case 'LSHIFT': return 0; // n/a
      case 'RSHIFT': return 0; // n/a
      default:       return 0;
    }
  };

  const shiftOps = op.id === 'LSHIFT' || op.id === 'RSHIFT';
  if (shiftOps) return null;

  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
      <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
        Truth Table — {op.label}
      </h4>
      <table className="w-full text-center text-xs font-mono">
        <thead>
          <tr className="text-gray-400">
            <th className="pb-1.5 font-bold">A</th>
            <th className="pb-1.5 font-bold">B</th>
            <th className="pb-1.5 font-bold" style={{ color: op.color }}>A {op.symbol} B</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ a, b }, i) => {
            const r = compute(a, b);
            return (
              <tr key={i} className="border-t border-gray-100">
                <td className="py-1.5">{a}</td>
                <td className="py-1.5">{b}</td>
                <td
                  className="py-1.5 font-extrabold"
                  style={{ color: r === 1 ? op.color : '#94a3b8' }}
                >
                  {r}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// ─── Bit count bar ────────────────────────────────────────────────────────────
const PopCountBar = ({ value, label, color }) => {
  const ones = toBin(value >>> 0, 16).split('').filter(b => b === '1').length;
  const pct = (ones / 16) * 100;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-[10px] font-semibold text-gray-500">
        <span>{label} popcount</span>
        <span style={{ color }}>{ones} / 16 bits set</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const BitwisePlayground = () => {
  const [rawA, setRawA] = useState('42');
  const [rawB, setRawB] = useState('27');
  const [selectedOp, setSelectedOp] = useState('AND');
  const [history, setHistory] = useState([]);
  const [animated, setAnimated] = useState(true);
  const [showBinary, setShowBinary] = useState(true);
  const [copied, setCopied] = useState(null);

  const aVal = isNaN(parseInput(rawA)) ? 0 : parseInput(rawA) >>> 0;
  const bVal = isNaN(parseInput(rawB)) ? 0 : parseInput(rawB) >>> 0;
  const op   = OPERATIONS.find(o => o.id === selectedOp);
  const result = computeResult(selectedOp, aVal, bVal);

  const addToHistory = useCallback(() => {
    const entry = {
      op: op.symbol,
      a: aVal,
      b: bVal,
      result,
      ts: Date.now(),
    };
    setHistory(prev => [entry, ...prev].slice(0, 8));
  }, [op, aVal, bVal, result]);

  const copy = (text, id) => {
    navigator.clipboard.writeText(String(text)).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 1200);
    });
  };

  const shiftOp = selectedOp === 'LSHIFT' || selectedOp === 'RSHIFT';

  return (
    <div className="max-w-7xl mx-auto my-12 p-6 md:p-8 bg-white rounded-3xl shadow-[0_20px_50px_rgba(124,58,237,0.08)] border border-gray-100 overflow-hidden relative">
      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-violet-50 rounded-full blur-3xl opacity-50 -mr-32 -mt-32 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-50 rounded-full blur-3xl opacity-40 -ml-24 -mb-24 pointer-events-none" />

      {/* ── Header ── */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-100 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-amber-400 flex items-center justify-center text-white shadow-md shadow-violet-500/20 text-lg font-bold font-mono">
            &amp;
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Bitwise Playground</h2>
            <p className="text-gray-500 text-sm font-medium mt-0.5">
              Visualize bit-level operations in real time — binary, hex, octal &amp; waveform
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAnimated(a => !a)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              animated
                ? 'bg-violet-50 border-violet-200 text-violet-600'
                : 'bg-gray-50 border-gray-200 text-gray-400'
            }`}
          >
            {animated ? '✦ Animate ON' : '✦ Animate OFF'}
          </button>
          <button
            onClick={() => setShowBinary(v => !v)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold border bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100 transition-all"
          >
            {showBinary ? 'Hide' : 'Show'} Bit Grid
          </button>
        </div>
      </div>

      {/* ── Op selector ── */}
      <div className="relative z-10 mt-6 flex flex-wrap gap-2">
        {OPERATIONS.map(o => (
          <button
            key={o.id}
            onClick={() => setSelectedOp(o.id)}
            className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all active:scale-95`}
            style={
              selectedOp === o.id
                ? { background: `${o.color}18`, border: `1.5px solid ${o.color}55`, color: o.color, boxShadow: `0 0 12px ${o.glow}` }
                : { background: 'transparent', border: '1.5px solid #e2e8f0', color: '#94a3b8' }
            }
          >
            <span className="font-mono mr-1">{o.symbol}</span> {o.label}
          </button>
        ))}
      </div>

      <p className="relative z-10 mt-2 text-xs text-gray-400 font-medium">
        💡 {op.desc}
      </p>

      {/* ── Main grid ── */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 mt-5">

        {/* ─ Left: Inputs + result ─ */}
        <div className="lg:col-span-5 space-y-4">

          {/* Input A */}
          <div className="bg-gray-50/90 rounded-2xl p-4 border border-gray-100">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-violet-600 mb-2">
              Input A — operand
            </label>
            <input
              type="text"
              value={rawA}
              onChange={e => setRawA(e.target.value)}
              placeholder="42, 0xFF, 0b1010…"
              className="w-full bg-white border border-violet-200 rounded-xl px-3 py-2 text-sm font-mono font-bold text-gray-800 outline-none focus:ring-2 focus:ring-violet-300 transition-all"
            />
            <div className="mt-2.5 flex flex-wrap gap-2">
              <NumBadge label="DEC" value={aVal} color="#7c3aed" />
              <NumBadge label="HEX" value={toHex(aVal)} color="#7c3aed" />
              <NumBadge label="OCT" value={toOct(aVal)} color="#7c3aed" />
            </div>
          </div>

          {/* Operation badge */}
          <div className="flex items-center justify-center gap-4">
            <div className="flex-1 h-px bg-gray-100" />
            <div
              className="px-5 py-2 rounded-2xl text-lg font-black font-mono shadow-md"
              style={{ background: `${op.color}18`, color: op.color, border: `1.5px solid ${op.color}44`, boxShadow: `0 4px 20px ${op.glow}` }}
            >
              {op.symbol} {op.label}
            </div>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Input B */}
          <div className={`bg-gray-50/90 rounded-2xl p-4 border border-gray-100 ${op.id === 'NOT_A' ? 'opacity-40 pointer-events-none' : ''}`}>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-cyan-600 mb-2">
              {shiftOp ? 'Shift amount (n)' : 'Input B — operand'}
            </label>
            <input
              type="text"
              value={rawB}
              onChange={e => setRawB(e.target.value)}
              placeholder={shiftOp ? '0–31' : '27, 0xFF, 0b1010…'}
              disabled={op.id === 'NOT_A'}
              className="w-full bg-white border border-cyan-200 rounded-xl px-3 py-2 text-sm font-mono font-bold text-gray-800 outline-none focus:ring-2 focus:ring-cyan-300 transition-all"
            />
            {!shiftOp && (
              <div className="mt-2.5 flex flex-wrap gap-2">
                <NumBadge label="DEC" value={bVal} color="#06b6d4" />
                <NumBadge label="HEX" value={toHex(bVal)} color="#06b6d4" />
                <NumBadge label="OCT" value={toOct(bVal)} color="#06b6d4" />
              </div>
            )}
          </div>

          {/* Result */}
          <div
            className="rounded-2xl p-5 border"
            style={{ background: `${op.color}0a`, borderColor: `${op.color}33` }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: op.color }}>
                Result = A {op.symbol} {op.id === 'NOT_A' ? '' : 'B'}
              </span>
              <button
                onClick={() => { addToHistory(); copy(result, 'result'); }}
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg border transition-all"
                style={
                  copied === 'result'
                    ? { background: `${op.color}22`, borderColor: `${op.color}44`, color: op.color }
                    : { background: 'transparent', borderColor: '#e2e8f0', color: '#94a3b8' }
                }
              >
                {copied === 'result' ? '✓ Copied' : '⧉ Copy'}
              </button>
            </div>
            <div className="text-4xl font-black font-mono tracking-tight" style={{ color: op.color }}>
              {result}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <NumBadge label="HEX" value={toHex(result)} color={op.color} />
              <NumBadge label="OCT" value={toOct(result)} color={op.color} />
              <NumBadge label="BIN (16)" value={toBin(result, 16)} color={op.color} />
            </div>
          </div>

          {/* Popcount bars */}
          <div className="bg-gray-50/90 rounded-2xl p-4 border border-gray-100 space-y-2.5">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Population Count (set bits)</h4>
            <PopCountBar value={aVal} label="A" color="#7c3aed" />
            {!op.id.startsWith('NOT') && <PopCountBar value={bVal} label="B" color="#06b6d4" />}
            <PopCountBar value={result} label="Result" color={op.color} />
          </div>

          {/* Truth table */}
          <TruthTableCard op={op} />
        </div>

        {/* ─ Right: Bit grid + waveform + history ─ */}
        <div className="lg:col-span-7 flex flex-col gap-5">

          {/* Bit grid */}
          {showBinary && (
            <div className="bg-gray-50/90 rounded-2xl p-5 border border-gray-100">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">
                16-bit Visualization
              </h3>
              <div className="space-y-3 overflow-x-auto pb-1">
                {/* Bit index row */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider w-8 shrink-0 text-right text-gray-300">#</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 16 }, (_, i) => (
                      <div
                        key={i}
                        className="text-[9px] text-gray-300 font-mono text-center"
                        style={{ width: 28, marginLeft: i > 0 && i % 8 === 0 ? 8 : 0 }}
                      >
                        {15 - i}
                      </div>
                    ))}
                  </div>
                </div>
                <BitRow label="A" value={aVal} color="#7c3aed" animated={animated} role="A" />
                {!op.id.startsWith('NOT') && (
                  <BitRow label="B" value={bVal} color="#06b6d4" animated={animated} role="B" />
                )}
                {/* Divider with op symbol */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider w-8 shrink-0 text-right text-gray-300">{op.symbol}</span>
                  <div className="flex-1 border-t border-dashed border-gray-200" />
                </div>
                <BitRow label="=" value={result} color={op.color} animated={animated} role="Result" />
              </div>

              {/* Byte grouping legend */}
              <div className="mt-3 flex gap-4 text-[9px] font-semibold text-gray-400">
                <span className="flex items-center gap-1">
                  <span className="inline-block w-3 h-1.5 rounded-full bg-gray-200" />
                  Bit = 0
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-3 h-1.5 rounded-full" style={{ background: op.color }} />
                  Bit = 1
                </span>
                <span className="ml-auto">Grouped by byte (gap every 8 bits)</span>
              </div>
            </div>
          )}

          {/* Waveform / signal view */}
          <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">
              Signal Waveform — lower 8 bits
            </h3>
            <PulseCanvas aVal={aVal} bVal={bVal} result={result} color={op.color} />
            <div className="mt-3 flex gap-4 text-[9px] font-semibold">
              <span className="flex items-center gap-1 text-violet-400">
                <span className="inline-block w-8 h-0.5 rounded-full bg-violet-500" /> A
              </span>
              <span className="flex items-center gap-1 text-cyan-400">
                <span className="inline-block w-8 h-0.5 rounded-full bg-cyan-500" /> B
              </span>
              <span className="flex items-center gap-1" style={{ color: op.color }}>
                <span className="inline-block w-8 h-0.5 rounded-full" style={{ background: op.color }} /> Result
              </span>
            </div>
          </div>

          {/* Quick presets */}
          <div className="bg-gray-50/90 rounded-2xl p-4 border border-gray-100">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Quick Presets</h4>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Power of 2', a: '64', b: '63', op: 'AND', tip: 'Check if power of 2' },
                { label: 'Set bit 3', a: '8',  b: '8',  op: 'OR',  tip: 'OR with mask' },
                { label: 'Swap nibbles', a: '0xAB', b: '4', op: 'LSHIFT', tip: '<<4 rotate' },
                { label: 'Toggle bits', a: '0xFF', b: '0x0F', op: 'XOR', tip: 'XOR flip' },
                { label: 'Clear bits', a: '255', b: '0x0F', op: 'AND', tip: 'Mask low nibble' },
                { label: 'Sign flip', a: '42', b: '0', op: 'NOT_A', tip: '~A bitwise NOT' },
              ].map(({ label, a, b, op: presetOp, tip }) => (
                <button
                  key={label}
                  onClick={() => { setRawA(a); setRawB(b); setSelectedOp(presetOp); }}
                  title={tip}
                  className="px-3 py-1.5 rounded-xl text-[10px] font-bold border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-800 transition-all active:scale-95 shadow-sm"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">Operation History</h4>
              <div className="space-y-1 max-h-44 overflow-y-auto">
                {history.map((h, i) => (
                  <div
                    key={h.ts}
                    className="flex items-center gap-2 text-xs font-mono py-1 border-b border-gray-800 last:border-0"
                  >
                    <span className="text-gray-600 text-[9px]">{new Date(h.ts).toLocaleTimeString([], { hour12: false })}</span>
                    <span className="text-violet-400">{h.a}</span>
                    <span className="text-amber-400">{h.op}</span>
                    <span className="text-cyan-400">{h.b}</span>
                    <span className="text-gray-500">=</span>
                    <span className="text-emerald-400 font-bold">{h.result}</span>
                    <span className="text-gray-600 ml-auto">{toHex(h.result)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="relative z-10 mt-6 pt-5 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-400">
        <span>Supports <code className="font-mono bg-gray-100 px-1 py-0.5 rounded text-gray-600">decimal</code>, <code className="font-mono bg-gray-100 px-1 py-0.5 rounded text-gray-600">0xFF</code> hex, <code className="font-mono bg-gray-100 px-1 py-0.5 rounded text-gray-600">0b1010</code> binary, <code className="font-mono bg-gray-100 px-1 py-0.5 rounded text-gray-600">0o77</code> octal input</span>
        <span className="text-[10px] font-medium uppercase tracking-wider text-gray-300">All ops on 32-bit unsigned integers · lower 16 bits shown</span>
      </div>
    </div>
  );
};

export default BitwisePlayground;
