import React, { useId, useRef, useState } from 'react';

const PRESETS = [
  { name: 'Ease', points: [0.25, 0.1, 0.25, 1] },
  { name: 'Linear', points: [0, 0, 1, 1] },
  { name: 'Ease in', points: [0.42, 0, 1, 1] },
  { name: 'Ease out', points: [0, 0, 0.58, 1] },
  { name: 'Ease in out', points: [0.42, 0, 0.58, 1] },
  { name: 'Overshoot', points: [0.34, 1.5, 0.64, 1] },
];

const CONTROLS = [
  { label: 'Start handle · X', short: 'X / time', min: 0, max: 1 },
  { label: 'Start handle · Y', short: 'Y / progress', min: -0.5, max: 1.5 },
  { label: 'End handle · X', short: 'X / time', min: 0, max: 1 },
  { label: 'End handle · Y', short: 'Y / progress', min: -0.5, max: 1.5 },
];

const DURATION_PRESETS = [300, 600, 900, 1500];
const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2';
const graphX = (value) => 48 + value * 264;
const graphY = (value) => 260 - value * 160;

const EasingCurveStudio = () => {
  const id = useId();
  const [points, setPoints] = useState(PRESETS[0].points);
  const [duration, setDuration] = useState(900);
  const [playing, setPlaying] = useState(true);
  const [replay, setReplay] = useState(0);
  const [copyStatus, setCopyStatus] = useState('');
  const graphRef = useRef(null);
  const dragging = useRef(null);
  const outputRef = useRef(null);

  const curve = `cubic-bezier(${points.join(', ')})`;
  const css = `transition: transform ${duration}ms ${curve};`;
  const activePreset = PRESETS.find((preset) => preset.points.every((value, index) => value === points[index]));

  const updatePoint = (index, value) => {
    const { min, max } = CONTROLS[index];
    const nextValue = Math.round(Math.min(max, Math.max(min, value)) * 100) / 100;
    setPoints((current) => current.map((point, pointIndex) => pointIndex === index ? nextValue : point));
    setCopyStatus('');
  };

  const moveHandle = (event) => {
    if (dragging.current === null || !graphRef.current) return;
    const bounds = graphRef.current.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    const x = ((event.clientX - bounds.left) / bounds.width) * 360;
    const y = ((event.clientY - bounds.top) / bounds.height) * 360;
    updatePoint(dragging.current * 2, (x - 48) / 264);
    updatePoint(dragging.current * 2 + 1, (260 - y) / 160);
  };

  const startDragging = (event, index) => {
    if (event.button !== 0) return;
    event.preventDefault();
    dragging.current = index;
    graphRef.current.setPointerCapture(event.pointerId);
  };

  const stopDragging = () => {
    dragging.current = null;
  };

  const choosePreset = (preset) => {
    setPoints(preset.points);
    setCopyStatus('');
    setReplay((value) => value + 1);
  };

  const copyCss = async () => {
    try {
      await navigator.clipboard.writeText(css);
      setCopyStatus('CSS copied to clipboard.');
    } catch {
      outputRef.current?.focus();
      outputRef.current?.select();
      setCopyStatus('Copy unavailable. CSS selected; press Ctrl+C or ⌘C to copy.');
    }
  };

  return (
    <section aria-labelledby={`${id}-title`} className="max-w-7xl mx-auto my-12 p-6 md:p-8 bg-white rounded-3xl shadow-[0_20px_50px_rgba(124,58,237,0.08)] border border-gray-100 overflow-hidden relative">
      <style>{`
        @keyframes easing-studio-travel {
          from { left: 0; }
          to { left: calc(100% - 3rem); }
        }
      `}</style>
      <div aria-hidden="true" className="absolute top-0 right-0 w-96 h-96 bg-violet-50 rounded-full blur-3xl opacity-70 -mr-32 -mt-32 pointer-events-none" />
      <div aria-hidden="true" className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-50 rounded-full blur-3xl opacity-60 -ml-24 -mb-24 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-100 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 shrink-0 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-violet-600/20">
            <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 19C15 19 9 5 20 5" />
              <circle cx="4" cy="19" r="2" />
              <circle cx="20" cy="5" r="2" />
            </svg>
          </div>
          <div>
            <h2 id={`${id}-title`} className="text-3xl font-extrabold text-gray-900 tracking-tight">Easing Curve Studio</h2>
            <p className="text-gray-500 text-sm font-medium mt-0.5">Shape the feel of motion, then take the CSS with you</p>
          </div>
        </div>
        <button type="button" onClick={copyCss} className={`self-start shrink-0 px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-violet-500 shadow-md shadow-violet-600/20 active:scale-95 transition-all ${FOCUS}`}>
          {copyStatus === 'CSS copied to clipboard.' ? 'Copied!' : 'Copy CSS'}
        </button>
      </div>

      <div role="group" aria-label="Easing presets" className="relative z-10 mt-5 flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.name}
            type="button"
            aria-pressed={activePreset === preset}
            onClick={() => choosePreset(preset)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95 ${FOCUS} ${activePreset === preset ? 'bg-violet-50 border-violet-200 text-violet-700' : 'bg-white/70 border-gray-200 text-gray-500 hover:border-violet-200 hover:text-violet-600'}`}
          >
            {preset.name}
          </button>
        ))}
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="min-w-0 rounded-2xl border border-gray-100 bg-gray-50/80 p-4 md:p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-violet-600">Curve editor</h3>
            <span className="text-xs font-semibold text-gray-500">{activePreset?.name || 'Custom curve'}</span>
          </div>
          <svg
            ref={graphRef}
            role="img"
            aria-label="Easing curve: time on the horizontal axis and progress on the vertical axis. Use the sliders below to adjust the handles."
            viewBox="0 0 360 360"
            className="block w-full max-w-[360px] mx-auto select-none"
            onPointerMove={moveHandle}
            onPointerUp={stopDragging}
            onPointerCancel={stopDragging}
            onLostPointerCapture={stopDragging}
          >
            {[0, 0.25, 0.5, 0.75, 1].map((value) => (
              <g key={value} stroke="#e2e8f0" strokeWidth="1">
                <line x1={graphX(value)} y1="20" x2={graphX(value)} y2="340" />
                <line x1="48" y1={graphY(value)} x2="312" y2={graphY(value)} />
              </g>
            ))}
            <line x1="48" y1="260" x2="312" y2="100" stroke="#cbd5e1" strokeDasharray="5 5" />
            <text x="30" y="264" fill="#64748b" fontSize="10">0</text>
            <text x="30" y="104" fill="#64748b" fontSize="10">1</text>
            <text x="180" y="357" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="600">TIME →</text>
            <text x="16" y="180" textAnchor="middle" transform="rotate(-90 16 180)" fill="#64748b" fontSize="10" fontWeight="600">PROGRESS →</text>
            <line x1="48" y1="260" x2={graphX(points[0])} y2={graphY(points[1])} stroke="#8b5cf6" strokeWidth="1.5" />
            <line x1="312" y1="100" x2={graphX(points[2])} y2={graphY(points[3])} stroke="#06b6d4" strokeWidth="1.5" />
            <path d={`M 48 260 C ${graphX(points[0])} ${graphY(points[1])}, ${graphX(points[2])} ${graphY(points[3])}, 312 100`} fill="none" stroke="#7c3aed" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="48" cy="260" r="5" fill="#64748b" />
            <circle cx="312" cy="100" r="5" fill="#64748b" />
            {[0, 1].map((index) => (
              <g key={index} onPointerDown={(event) => startDragging(event, index)} className="cursor-grab active:cursor-grabbing touch-none">
                <circle cx={graphX(points[index * 2])} cy={graphY(points[index * 2 + 1])} r="20" fill="transparent" />
                <circle cx={graphX(points[index * 2])} cy={graphY(points[index * 2 + 1])} r="9" fill={index === 0 ? '#8b5cf6' : '#06b6d4'} stroke="white" strokeWidth="3" />
                <title>{index === 0 ? 'Start handle' : 'End handle'}: drag to adjust</title>
              </g>
            ))}
          </svg>
          <p className="text-center text-xs font-medium text-gray-500">Drag the colored handles, or fine-tune with the sliders.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
            {['Start handle', 'End handle'].map((name, handleIndex) => (
              <fieldset key={name} className="min-w-0 rounded-xl bg-white border border-gray-100 px-3 pb-3">
                <legend className={`px-1 text-[10px] font-bold uppercase tracking-widest ${handleIndex === 0 ? 'text-violet-600' : 'text-cyan-700'}`}>{name}</legend>
                {[0, 1].map((axis) => {
                  const index = handleIndex * 2 + axis;
                  const control = CONTROLS[index];
                  return (
                    <div key={axis} className="mt-2">
                      <div className="flex justify-between gap-2 text-xs">
                        <label htmlFor={`${id}-point-${index}`} className="font-medium text-gray-500">{control.short}</label>
                        <output htmlFor={`${id}-point-${index}`} className="font-mono font-bold text-gray-700">{points[index].toFixed(2)}</output>
                      </div>
                      <input
                        id={`${id}-point-${index}`}
                        aria-label={control.label}
                        type="range"
                        min={control.min}
                        max={control.max}
                        step="0.01"
                        value={points[index]}
                        onChange={(event) => updatePoint(index, Number(event.target.value))}
                        className={`mt-1 w-full cursor-pointer rounded-lg ${FOCUS} ${handleIndex === 0 ? 'accent-violet-600' : 'accent-cyan-600'}`}
                      />
                    </div>
                  );
                })}
              </fieldset>
            ))}
          </div>
        </div>

        <div className="min-w-0 flex flex-col gap-5">
          <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 md:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-violet-600">Motion preview</h3>
              <div className="flex gap-2">
                <button type="button" aria-pressed={!playing} onClick={() => setPlaying((value) => !value)} className={`px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-bold text-gray-600 hover:text-violet-600 ${FOCUS}`}>
                  {playing ? 'Pause' : 'Resume'}
                </button>
                <button type="button" onClick={() => { setReplay((value) => value + 1); setPlaying(true); }} className={`px-3 py-1.5 rounded-lg bg-violet-50 border border-violet-100 text-xs font-bold text-violet-700 ${FOCUS}`}>Replay</button>
              </div>
            </div>

            <div className="mt-5 space-y-3" key={replay}>
              {[
                { label: 'Your curve', timing: curve, color: 'from-violet-600 to-violet-400', track: 'bg-violet-100/60' },
                { label: 'Linear reference', timing: 'linear', color: 'from-slate-400 to-slate-300', track: 'bg-gray-100' },
              ].map((lane) => (
                <div key={lane.label}>
                  <p className="mb-2 text-xs font-semibold text-gray-500">{lane.label}</p>
                  <div className={`rounded-2xl px-6 py-4 overflow-hidden ${lane.track}`}>
                    <div className="relative h-12">
                      <div aria-hidden="true" className="absolute inset-x-0 top-1/2 border-t border-dashed border-gray-400/30" />
                      <div
                        role="img"
                        aria-label={`${lane.label} motion preview`}
                        className={`motion-safe:animate-[easing-studio-travel_900ms_infinite_alternate] absolute top-0 left-0 w-12 h-12 rounded-2xl bg-gradient-to-br ${lane.color} shadow-md flex items-center justify-center`}
                        style={{ animationDuration: `${duration}ms`, animationTimingFunction: lane.timing, animationPlayState: playing ? 'running' : 'paused' }}
                      >
                        <span className="w-3 h-3 rounded-full bg-white/80" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="hidden motion-reduce:block mt-3 text-xs font-medium text-gray-500">Your device prefers reduced motion, so the preview stays still.</p>
            <p className="mt-4 text-xs leading-relaxed text-gray-500">Both tracks use the same duration. Watch how the curve changes acceleration, slowing, and overshoot.</p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white/80 p-4 md:p-5">
            <div className="flex items-center justify-between gap-3">
              <label htmlFor={`${id}-duration`} className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Duration</label>
              <output htmlFor={`${id}-duration`} className="text-sm font-mono font-bold text-violet-700">{duration} ms</output>
            </div>
            <input id={`${id}-duration`} type="range" min="200" max="2000" step="50" value={duration} onChange={(event) => { setDuration(Number(event.target.value)); setCopyStatus(''); }} className={`w-full mt-4 cursor-pointer accent-violet-600 rounded-lg ${FOCUS}`} />
            <div role="group" aria-label="Duration presets" className="mt-3 flex flex-wrap gap-2">
              {DURATION_PRESETS.map((value) => (
                <button key={value} type="button" aria-pressed={duration === value} onClick={() => { setDuration(value); setCopyStatus(''); }} className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${FOCUS} ${duration === value ? 'bg-violet-50 border-violet-200 text-violet-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>{value} ms</button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900 p-4 md:p-5">
            <label htmlFor={`${id}-css`} className="text-[10px] font-bold uppercase tracking-widest text-violet-300">Ready for your stylesheet</label>
            <textarea ref={outputRef} id={`${id}-css`} aria-label="Generated transition CSS" readOnly spellCheck={false} value={css} rows={3} className="block w-full resize-none mt-3 bg-transparent text-violet-100 text-sm leading-6 font-mono rounded outline-none focus-visible:ring-2 focus-visible:ring-violet-400" />
            <p className="text-xs leading-relaxed text-slate-400">Apply to an element, then change its transform on hover or with a class.</p>
          </div>
          <p role="status" className="min-h-5 text-xs font-medium text-violet-700">{copyStatus}</p>
        </div>
      </div>
    </section>
  );
};

export default EasingCurveStudio;
