import React, { useState, useEffect, useRef, useCallback } from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────
const COMPLEMENT = { A: 'T', T: 'A', G: 'C', C: 'G' };
const NUKE_COLORS = {
  A: { main: '#f43f5e', glow: '#f43f5e55', label: 'Adenine' },
  T: { main: '#3b82f6', glow: '#3b82f655', label: 'Thymine' },
  G: { main: '#22c55e', glow: '#22c55e55', label: 'Guanine' },
  C: { main: '#f59e0b', glow: '#f59e0b55', label: 'Cytosine' },
};

const CODON_TABLE = {
  TTT: 'Phe', TTC: 'Phe', TTA: 'Leu', TTG: 'Leu',
  CTT: 'Leu', CTC: 'Leu', CTA: 'Leu', CTG: 'Leu',
  ATT: 'Ile', ATC: 'Ile', ATA: 'Ile', ATG: 'Met*',
  GTT: 'Val', GTC: 'Val', GTA: 'Val', GTG: 'Val',
  TCT: 'Ser', TCC: 'Ser', TCA: 'Ser', TCG: 'Ser',
  CCT: 'Pro', CCC: 'Pro', CCA: 'Pro', CCG: 'Pro',
  ACT: 'Thr', ACC: 'Thr', ACA: 'Thr', ACG: 'Thr',
  GCT: 'Ala', GCC: 'Ala', GCA: 'Ala', GCG: 'Ala',
  TAT: 'Tyr', TAC: 'Tyr', TAA: 'Stop', TAG: 'Stop',
  CAT: 'His', CAC: 'His', CAA: 'Gln', CAG: 'Gln',
  AAT: 'Asn', AAC: 'Asn', AAA: 'Lys', AAG: 'Lys',
  GAT: 'Asp', GAC: 'Asp', GAA: 'Glu', GAG: 'Glu',
  TGT: 'Cys', TGC: 'Cys', TGA: 'Stop', TGG: 'Trp',
  CGT: 'Arg', CGC: 'Arg', CGA: 'Arg', CGG: 'Arg',
  AGT: 'Ser', AGC: 'Ser', AGA: 'Arg', AGG: 'Arg',
  GGT: 'Gly', GGC: 'Gly', GGA: 'Gly', GGG: 'Gly',
};

const EXAMPLE_SEQ = 'ATGGCGTATCGCATTAGCGATCGGCTAGCTAGCGATCGATCGATCGCTATCGCTAGCGATCGGCTAGCTAGCGATCGATCGATCGCTATCGCTAGCGATCGGCTAGCTAGCGATCGATCGATCGCTATCGCTAGCGATCGGCTAGCTAGCGATCGATCGATCGCTAA';

// ─── Animated Double Helix ─────────────────────────────────────────────────────
const DoubleHelix = ({ sequence }) => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const tRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    const draw = () => {
      tRef.current += 0.018;
      const t = tRef.current;
      ctx.clearRect(0, 0, W, H);
      const numBases = Math.min(sequence.length, 36);
      const validSeq = sequence.toUpperCase().split('').filter(c => 'ATGC'.includes(c)).slice(0, numBases);
      const displaySeq = validSeq.length > 0 ? validSeq : Array.from({ length: 20 }, (_, i) => 'ATGC'[i % 4]);
      const cols = displaySeq.length;

      const ampY = H * 0.28;
      const cy = H / 2;
      const freq = (2 * Math.PI) / cols;

      ctx.beginPath();
      for (let i = 0; i <= cols * 6; i++) {
        const frac = i / (cols * 6);
        const x = frac * W;
        const y = cy + ampY * Math.sin(frac * cols * freq + t);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = '#7c3aed55';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.beginPath();
      for (let i = 0; i <= cols * 6; i++) {
        const frac = i / (cols * 6);
        const x = frac * W;
        const y = cy + ampY * Math.sin(frac * cols * freq + t + Math.PI);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = '#06b6d455';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      displaySeq.forEach((base, i) => {
        const frac = (i + 1) / (cols + 1);
        const x = frac * W;
        const phase = frac * cols * freq + t;
        const y1 = cy + ampY * Math.sin(phase);
        const y2 = cy + ampY * Math.sin(phase + Math.PI);
        const comp = COMPLEMENT[base] || 'T';
        const c1 = NUKE_COLORS[base]?.main || '#fff';
        const c2 = NUKE_COLORS[comp]?.main || '#fff';

        ctx.beginPath();
        ctx.moveTo(x, y1);
        ctx.lineTo(x, y2);
        ctx.strokeStyle = '#ffffff18';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(x, y1, 5.5, 0, Math.PI * 2);
        ctx.fillStyle = c1;
        ctx.shadowColor = c1;
        ctx.shadowBlur = 10;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y2, 5.5, 0, Math.PI * 2);
        ctx.fillStyle = c2;
        ctx.shadowColor = c2;
        ctx.shadowBlur = 10;
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.font = 'bold 9px monospace';
        ctx.fillStyle = '#ffffffcc';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(base, x, y1);
        ctx.fillStyle = '#ffffff88';
        ctx.fillText(comp, x, y2);
      });

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [sequence]);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={160}
      style={{ width: '100%', height: '160px', borderRadius: '12px', background: 'transparent' }}
    />
  );
};

// ─── Radial GC Gauge ──────────────────────────────────────────────────────────
const GCGauge = ({ gcPct }) => {
  const r = 52;
  const cx = 70;
  const cy = 70;
  const circumference = 2 * Math.PI * r;
  const dashArr = (gcPct / 100) * circumference;
  const color = gcPct < 40 ? '#f43f5e' : gcPct < 60 ? '#22c55e' : '#3b82f6';
  return (
    <svg viewBox="0 0 140 140" style={{ width: 140, height: 140 }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#ffffff0f" strokeWidth="10" />
      <circle
        cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="10"
        strokeDasharray={`${dashArr} ${circumference}`} strokeLinecap="round"
        strokeDashoffset={circumference * 0.25}
        style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: 'stroke-dasharray 0.6s ease, stroke 0.4s ease' }}
      />
      <text x={cx} y={cy - 6} textAnchor="middle" fill="#fff" fontSize="18" fontWeight="bold" fontFamily="monospace">
        {gcPct.toFixed(1)}%
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="#ffffff88" fontSize="10" fontFamily="sans-serif">
        GC Content
      </text>
    </svg>
  );
};

// ─── Nucleotide Bar ───────────────────────────────────────────────────────────
const NukeBar = ({ base, count, total }) => {
  const pct = total > 0 ? (count / total) * 100 : 0;
  const { main, glow, label } = NUKE_COLORS[base];
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: main, textShadow: `0 0 8px ${glow}`, fontSize: 13 }}>
          {base} <span style={{ color: '#ffffff55', fontWeight: 'normal' }}>— {label}</span>
        </span>
        <span style={{ color: '#ffffffcc', fontSize: 12, fontFamily: 'monospace' }}>
          {count} <span style={{ color: '#ffffff44' }}>({pct.toFixed(1)}%)</span>
        </span>
      </div>
      <div style={{ height: 8, borderRadius: 4, background: '#ffffff0d', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 4, width: `${pct}%`,
          background: `linear-gradient(90deg, ${main}99, ${main})`,
          boxShadow: `0 0 8px ${glow}`,
          transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
        }} />
      </div>
    </div>
  );
};

// ─── Codon Strip ──────────────────────────────────────────────────────────────
const CodonStrip = ({ seq, frame }) => {
  const sliced = seq.slice(frame);
  const codons = [];
  for (let i = 0; i + 3 <= sliced.length; i += 3) codons.push(sliced.slice(i, i + 3));
  const displayCodons = codons.slice(0, 20);
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
      {displayCodons.map((codon, i) => {
        const aa = CODON_TABLE[codon];
        const isStart = aa === 'Met*';
        const isStop = aa === 'Stop';
        const bg = isStart ? '#22c55e22' : isStop ? '#f43f5e22' : '#ffffff0a';
        const border = isStart ? '#22c55e' : isStop ? '#f43f5e' : '#ffffff1a';
        return (
          <div key={i} title={aa || '?'} style={{
            padding: '3px 6px', borderRadius: 6, background: bg, border: `1px solid ${border}`,
            fontFamily: 'monospace', fontSize: 11,
            color: isStart ? '#22c55e' : isStop ? '#f43f5e' : '#ffffffcc', cursor: 'default',
          }}>
            <span style={{ fontSize: 10, fontWeight: 'bold' }}>{codon}</span>
            {aa && <span style={{ marginLeft: 3, color: '#ffffff44', fontSize: 9 }}>{aa}</span>}
          </div>
        );
      })}
      {codons.length > 20 && (
        <span style={{ color: '#ffffff33', fontSize: 11, alignSelf: 'center' }}>+{codons.length - 20} more…</span>
      )}
    </div>
  );
};

// ─── Sequence Ruler ───────────────────────────────────────────────────────────
const SequenceRuler = ({ seq }) => {
  const display = seq.slice(0, 60);
  const complement = display.split('').map(c => COMPLEMENT[c] || '-').join('');
  return (
    <div style={{ overflowX: 'auto', fontFamily: 'monospace', fontSize: 12 }}>
      <div style={{ display: 'flex', gap: 0, marginBottom: 2 }}>
        {display.split('').map((c, i) => (
          <span key={i} style={{ color: NUKE_COLORS[c]?.main || '#fff', minWidth: 12, textAlign: 'center', lineHeight: 1.6, textShadow: `0 0 6px ${NUKE_COLORS[c]?.glow || ''}` }}>{c}</span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 0, opacity: 0.4 }}>
        {display.split('').map((_, i) => (
          <span key={i} style={{ color: '#ffffff', minWidth: 12, textAlign: 'center', lineHeight: 1.4 }}>|</span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 0, marginTop: 2 }}>
        {complement.split('').map((c, i) => (
          <span key={i} style={{ color: NUKE_COLORS[c]?.main || '#fff', minWidth: 12, textAlign: 'center', lineHeight: 1.6, textShadow: `0 0 6px ${NUKE_COLORS[c]?.glow || ''}`, opacity: 0.7 }}>{c}</span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 0, marginTop: 4 }}>
        {display.split('').map((_, i) => (
          <span key={i} style={{ color: '#ffffff22', minWidth: 12, textAlign: 'center', fontSize: 9 }}>{(i + 1) % 10 === 0 ? i + 1 : ''}</span>
        ))}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DNASequenceAnalyzer() {
  const [raw, setRaw] = useState(EXAMPLE_SEQ);
  const [frame, setFrame] = useState(0);
  const [copied, setCopied] = useState('');

  const seq = raw.toUpperCase().split('').filter(c => 'ATGC'.includes(c)).join('');
  const len = seq.length;
  const counts = { A: 0, T: 0, G: 0, C: 0 };
  for (const c of seq) counts[c]++;
  const gcPct = len > 0 ? ((counts.G + counts.C) / len) * 100 : 0;
  const atPct = 100 - gcPct;
  const complement = seq.split('').map(c => COMPLEMENT[c] || '?').join('');
  const reverseComplement = complement.split('').reverse().join('');
  const invalidChars = raw.toUpperCase().split('').filter(c => !'ATGC\n\r '.includes(c)).length;

  const handleLoad = (type) => {
    if (type === 'example') setRaw(EXAMPLE_SEQ);
    if (type === 'random') {
      const bases = 'ATGC';
      const l = Math.floor(Math.random() * 80) + 40;
      setRaw(Array.from({ length: l }, () => bases[Math.floor(Math.random() * 4)]).join(''));
    }
    if (type === 'clear') setRaw('');
  };

  const copyToClipboard = useCallback((text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(''), 1800);
    });
  }, []);

  const card = {
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16, padding: '16px 20px', backdropFilter: 'blur(12px)',
  };
  const sectionLabel = {
    fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
    color: '#ffffff55', textTransform: 'uppercase', marginBottom: 12,
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0a0a1a 0%, #0e0a24 50%, #0a1424 100%)',
      fontFamily: "'Inter', 'Segoe UI', sans-serif", padding: '40px 20px',
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)',
            borderRadius: 999, padding: '6px 18px', marginBottom: 18,
            fontSize: 12, color: '#a78bfa', letterSpacing: '0.1em', fontWeight: 600,
          }}>
            🧬 BIOINFORMATICS TOOL
          </div>
          <h2 style={{
            fontSize: 'clamp(26px,5vw,42px)', fontWeight: 800, margin: '0 0 10px',
            background: 'linear-gradient(135deg, #a78bfa, #22d3ee, #34d399)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            DNA Sequence Analyzer
          </h2>
          <p style={{ color: '#ffffff55', fontSize: 14, margin: 0 }}>
            Paste or type a DNA sequence to visualize the double helix, nucleotide composition, GC content, and reading frames in real time.
          </p>
        </div>

        {/* Input */}
        <div style={{ ...card, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <p style={{ ...sectionLabel, margin: 0 }}>Input Sequence</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {['example', 'random', 'clear'].map(t => (
                <button key={t} onClick={() => handleLoad(t)} style={{
                  padding: '4px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#ffffffaa', cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.2s',
                }}>
                  {t === 'example' ? '📋 Example' : t === 'random' ? '🎲 Random' : '🗑️ Clear'}
                </button>
              ))}
            </div>
          </div>
          <textarea
            value={raw}
            onChange={e => setRaw(e.target.value)}
            rows={4}
            placeholder="Enter DNA sequence (A, T, G, C)…"
            spellCheck={false}
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'rgba(0,0,0,0.3)',
              border: `1px solid ${invalidChars > 0 ? '#f43f5e55' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: 10, padding: '12px 14px',
              color: '#e2e8f0', fontFamily: 'monospace', fontSize: 13,
              resize: 'vertical', outline: 'none', lineHeight: 1.7, letterSpacing: '0.05em',
              transition: 'border 0.2s',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: '#ffffff44' }}>
            <span>
              {len > 0 ? `${len} valid bases` : 'No valid bases'}
              {invalidChars > 0 && <span style={{ color: '#f43f5eaa', marginLeft: 8 }}>⚠ {invalidChars} invalid char{invalidChars > 1 ? 's' : ''} (ignored)</span>}
            </span>
            <span style={{ color: '#a78bfa88' }}>Only A, T, G, C are processed</span>
          </div>
        </div>

        {len > 0 && (
          <>
            {/* Double Helix */}
            <div style={{ ...card, marginBottom: 20 }}>
              <p style={sectionLabel}>Animated Double Helix</p>
              <DoubleHelix sequence={seq} />
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 12, flexWrap: 'wrap' }}>
                {Object.entries(NUKE_COLORS).map(([base, { main, label }]) => (
                  <span key={base} style={{ fontSize: 11, color: '#ffffff77' }}>
                    <span style={{ color: main, fontWeight: 'bold', fontFamily: 'monospace' }}>{base}</span> {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Sequence Ruler */}
            <div style={{ ...card, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <p style={{ ...sectionLabel, margin: 0 }}>5′ → 3′ Strand with Complement (first 60 bases)</p>
                <button onClick={() => copyToClipboard(seq, 'seq')} style={{
                  padding: '4px 12px', borderRadius: 8, fontSize: 11,
                  background: copied === 'seq' ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${copied === 'seq' ? '#22c55e55' : 'rgba(255,255,255,0.1)'}`,
                  color: copied === 'seq' ? '#22c55e' : '#ffffffaa', cursor: 'pointer', transition: 'all 0.2s',
                }}>
                  {copied === 'seq' ? '✓ Copied' : '📋 Copy Sequence'}
                </button>
              </div>
              <SequenceRuler seq={seq} />
            </div>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 20, marginBottom: 20, alignItems: 'start' }}>
              <div style={{ ...card, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <GCGauge gcPct={gcPct} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 12, color: '#ffffff55' }}>AT Content</div>
                  <div style={{ fontSize: 16, fontWeight: 'bold', color: '#f59e0b', fontFamily: 'monospace' }}>{atPct.toFixed(1)}%</div>
                </div>
                <div style={{ fontSize: 11, color: '#ffffff33', textAlign: 'center', maxWidth: 120 }}>
                  {gcPct < 40 ? 'AT-rich sequence' : gcPct > 60 ? 'GC-rich sequence' : 'Balanced composition'}
                </div>
              </div>
              <div style={card}>
                <p style={sectionLabel}>Nucleotide Composition</p>
                {['A', 'T', 'G', 'C'].map(b => <NukeBar key={b} base={b} count={counts[b]} total={len} />)}
                <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 10, background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)' }}>
                  <span style={{ fontSize: 12, color: '#a78bfa' }}>
                    🔬 Melting Temp (Wallace rule): <strong style={{ color: '#c4b5fd' }}>
                      {len <= 13
                        ? `${(counts.A + counts.T) * 2 + (counts.G + counts.C) * 4}°C`
                        : `${(64.9 + 41 * (counts.G + counts.C - 16.4) / len).toFixed(1)}°C`}
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Codon Reading Frames */}
            <div style={{ ...card, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <p style={{ ...sectionLabel, margin: 0 }}>Codon Reading Frames</p>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[0, 1, 2].map(f => (
                    <button key={f} onClick={() => setFrame(f)} style={{
                      padding: '4px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                      background: frame === f ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${frame === f ? '#7c3aed' : 'rgba(255,255,255,0.1)'}`,
                      color: frame === f ? '#a78bfa' : '#ffffff66', cursor: 'pointer', transition: 'all 0.2s',
                      boxShadow: frame === f ? '0 0 12px #7c3aed44' : 'none',
                    }}>
                      +{f + 1}
                    </button>
                  ))}
                </div>
              </div>
              <CodonStrip seq={seq} frame={frame} />
              <div style={{ marginTop: 12, display: 'flex', gap: 12, fontSize: 11, flexWrap: 'wrap' }}>
                <span style={{ color: '#22c55e' }}>🟢 Met* = Start codon (ATG)</span>
                <span style={{ color: '#f43f5e' }}>🔴 Stop = Stop codon</span>
                <span style={{ color: '#ffffff33' }}>Hover codon for amino acid</span>
              </div>
            </div>

            {/* Derived Strands */}
            <div style={card}>
              <p style={sectionLabel}>Derived Strands</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {[
                  { label: "5′→3′ Complement", val: complement, key: 'comp', color: '#06b6d4' },
                  { label: "5′→3′ Reverse Complement", val: reverseComplement, key: 'rcomp', color: '#a78bfa' },
                ].map(({ label, val, key, color }) => (
                  <div key={key} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: '12px 14px', border: `1px solid ${color}22` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 11, color, fontWeight: 600 }}>{label}</span>
                      <button onClick={() => copyToClipboard(val, key)} style={{
                        padding: '2px 8px', borderRadius: 6, fontSize: 10,
                        background: copied === key ? `${color}22` : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${copied === key ? color : 'rgba(255,255,255,0.1)'}`,
                        color: copied === key ? color : '#ffffff55', cursor: 'pointer', transition: 'all 0.2s',
                      }}>
                        {copied === key ? '✓' : '📋'}
                      </button>
                    </div>
                    <div style={{
                      fontFamily: 'monospace', fontSize: 11, color: '#ffffffaa',
                      wordBreak: 'break-all', lineHeight: 1.8, maxHeight: 72, overflowY: 'auto',
                    }}>
                      {val.slice(0, 120)}{val.length > 120 && <span style={{ color: '#ffffff33' }}>…+{val.length - 120}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {len === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#ffffff22' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🧬</div>
            <p style={{ fontSize: 16 }}>Enter a DNA sequence above to begin analysis</p>
          </div>
        )}
      </div>
    </div>
  );
}
