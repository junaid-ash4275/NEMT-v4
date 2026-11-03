import React, { useId, useRef, useState } from 'react';

const PRESETS = [
  { name: 'Gallery', columns: 3, gap: 16, height: 88, count: 9, wide: [] },
  { name: 'Bento', columns: 4, gap: 12, height: 80, count: 8, wide: [0, 3] },
  { name: 'Feature story', columns: 3, gap: 20, height: 96, count: 5, wide: [0] },
];

const TILE_COLORS = [
  'from-cyan-100 to-sky-50 border-cyan-200 text-cyan-800',
  'from-violet-100 to-indigo-50 border-violet-200 text-violet-800',
  'from-amber-100 to-orange-50 border-amber-200 text-amber-800',
  'from-emerald-100 to-teal-50 border-emerald-200 text-emerald-800',
];

const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2';

const CSSGridStudio = () => {
  const id = useId();
  const [columns, setColumns] = useState(PRESETS[1].columns);
  const [gap, setGap] = useState(PRESETS[1].gap);
  const [height, setHeight] = useState(PRESETS[1].height);
  const [count, setCount] = useState(PRESETS[1].count);
  const [wideTiles, setWideTiles] = useState(PRESETS[1].wide);
  const [status, setStatus] = useState('');
  const outputRef = useRef(null);

  const wide = columns > 1 ? wideTiles.filter((index) => index < count).sort((a, b) => a - b) : [];
  const activePreset = PRESETS.find((preset) => (
    preset.columns === columns && preset.gap === gap && preset.height === height &&
    preset.count === count && preset.wide.length === wide.length &&
    preset.wide.every((index) => wide.includes(index))
  ));
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    gridAutoRows: `${height}px`,
    gap: `${gap}px`,
  };
  const css = [
    '.grid-layout {',
    '  display: grid;',
    `  grid-template-columns: repeat(${columns}, minmax(0, 1fr));`,
    `  grid-auto-rows: ${height}px;`,
    `  gap: ${gap}px;`,
    '}',
    ...wide.map((index) => `\n.grid-layout > :nth-child(${index + 1}) {\n  grid-column: span 2;\n}`),
  ].join('\n');

  const choosePreset = (preset) => {
    setColumns(preset.columns);
    setGap(preset.gap);
    setHeight(preset.height);
    setCount(preset.count);
    setWideTiles(preset.wide);
    setStatus('');
  };

  const toggleTile = (index) => {
    if (columns === 1) return;
    setWideTiles((current) => current.includes(index) ? current.filter((tile) => tile !== index) : [...current, index]);
    setStatus('');
  };

  const copyCss = async () => {
    try {
      await navigator.clipboard.writeText(css);
      setStatus('CSS copied to clipboard.');
    } catch {
      outputRef.current?.focus();
      outputRef.current?.select();
      setStatus('CSS selected. Press Ctrl+C or ⌘C to copy.');
    }
  };

  const controls = [
    { name: 'Columns', value: columns, min: 1, max: 6, set: setColumns, unit: '' },
    { name: 'Gap', value: gap, min: 0, max: 32, set: setGap, unit: 'px' },
    { name: 'Row height', value: height, min: 48, max: 128, step: 4, set: setHeight, unit: 'px' },
    { name: 'Tiles', value: count, min: 4, max: 12, set: setCount, unit: '' },
  ];

  return (
    <section aria-labelledby={`${id}-title`} className="max-w-7xl mx-auto my-12 p-6 md:p-8 bg-white rounded-3xl shadow-[0_20px_50px_rgba(6,182,212,0.08)] border border-gray-100 overflow-hidden relative">
      <div aria-hidden="true" className="absolute top-0 right-0 w-96 h-96 bg-cyan-50 rounded-full blur-3xl opacity-70 -mr-32 -mt-32 pointer-events-none" />
      <div aria-hidden="true" className="absolute bottom-0 left-0 w-80 h-80 bg-violet-50 rounded-full blur-3xl opacity-60 -ml-24 -mb-24 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-100 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 shrink-0 rounded-2xl bg-gradient-to-tr from-cyan-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-cyan-600/20">
            <svg aria-hidden="true" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
              <rect x="3" y="3" width="11" height="8" rx="2" />
              <rect x="17" y="3" width="4" height="8" rx="1" />
              <rect x="3" y="14" width="6" height="7" rx="2" />
              <rect x="12" y="14" width="9" height="7" rx="2" />
            </svg>
          </div>
          <div>
            <h2 id={`${id}-title`} className="text-3xl font-extrabold text-gray-900 tracking-tight">CSS Grid Studio</h2>
            <p className="text-gray-500 text-sm font-medium mt-0.5">Build a layout visually and take the CSS with you</p>
          </div>
        </div>
        <button type="button" onClick={copyCss} className={`self-start shrink-0 px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-cyan-600 to-cyan-500 shadow-md shadow-cyan-600/20 active:scale-95 transition-all ${FOCUS}`}>
          {status === 'CSS copied to clipboard.' ? 'Copied!' : 'Copy CSS'}
        </button>
      </div>

      <div role="group" aria-label="Grid presets" className="relative z-10 mt-5 flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button key={preset.name} type="button" aria-pressed={activePreset === preset} onClick={() => choosePreset(preset)} className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95 ${FOCUS} ${activePreset === preset ? 'bg-cyan-50 border-cyan-200 text-cyan-700' : 'bg-white/70 border-gray-200 text-gray-500 hover:border-cyan-200 hover:text-cyan-700'}`}>
            {preset.name}
          </button>
        ))}
        <button type="button" onClick={() => { setWideTiles([]); setStatus(''); }} disabled={!wide.length} className={`ml-auto px-3 py-1.5 rounded-xl text-xs font-bold border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed ${FOCUS}`}>Reset tile widths</button>
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        <div className="lg:col-span-4 min-w-0 space-y-5">
          <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 md:p-5 space-y-5">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-cyan-700">Layout controls</h3>
            {controls.map((control, index) => (
              <div key={control.name}>
                <div className="flex justify-between gap-3 mb-2">
                  <label htmlFor={`${id}-control-${index}`} className="text-sm font-semibold text-gray-600">{control.name}</label>
                  <output htmlFor={`${id}-control-${index}`} className="text-sm font-mono font-bold text-cyan-700">{control.value}{control.unit}</output>
                </div>
                <input
                  id={`${id}-control-${index}`}
                  type="range"
                  min={control.min}
                  max={control.max}
                  step={control.step || 1}
                  value={control.value}
                  onChange={(event) => {
                    const value = Number(event.target.value);
                    control.set(value);
                    if (control.name === 'Tiles') setWideTiles((current) => current.filter((tile) => tile < value));
                    if (control.name === 'Columns' && value === 1) setWideTiles([]);
                    setStatus('');
                  }}
                  className={`w-full cursor-pointer accent-cyan-600 rounded-lg ${FOCUS}`}
                />
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-cyan-100 bg-cyan-50/70 p-4">
            <p className="text-sm font-bold text-cyan-800">Make room for a feature</p>
            <p className="mt-1 text-xs leading-relaxed text-cyan-700">Click a tile to switch between one and two columns. Click it again to restore its width.</p>
          </div>
        </div>

        <div className="lg:col-span-8 min-w-0 space-y-5">
          <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 md:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-cyan-700">Live layout</h3>
              <span className="text-xs font-semibold text-gray-500">{activePreset?.name || 'Custom layout'} · {count} tiles</span>
            </div>
            <div role="group" aria-label="Grid preview" style={gridStyle}>
              {Array.from({ length: count }, (_, index) => {
                const isWide = wide.includes(index);
                return (
                  <button
                    key={index}
                    type="button"
                    aria-label={`Tile ${index + 1}: ${isWide ? 'two columns' : 'one column'}`}
                    aria-pressed={isWide}
                    disabled={columns === 1}
                    onClick={() => toggleTile(index)}
                    title={columns === 1 ? 'Add another column to resize tiles' : `Click to ${isWide ? 'shrink' : 'widen'} tile ${index + 1}`}
                    style={{ gridColumn: `span ${isWide ? 2 : 1}` }}
                    className={`min-w-0 min-h-0 overflow-hidden rounded-xl border bg-gradient-to-br flex flex-col items-center justify-center gap-1 hover:brightness-95 active:scale-[0.98] transition-[filter,transform] disabled:cursor-default ${TILE_COLORS[index % TILE_COLORS.length]} ${FOCUS}`}
                  >
                    <span className="text-sm font-black tabular-nums">{String(index + 1).padStart(2, '0')}</span>
                    {isWide && <span className="text-[10px] font-semibold opacity-70">span 2</span>}
                  </button>
                );
              })}
            </div>
            <p className="mt-4 text-xs text-gray-500">{columns === 1 ? 'Choose two or more columns to enable wider tiles.' : `${wide.length} wide ${wide.length === 1 ? 'tile' : 'tiles'} · standard grid placement keeps tiles in order.`}</p>
          </div>

          <div className="rounded-2xl bg-slate-900 p-4 md:p-5">
            <label htmlFor={`${id}-css`} className="text-[10px] font-bold uppercase tracking-widest text-cyan-300">Ready for your stylesheet</label>
            <textarea ref={outputRef} id={`${id}-css`} aria-label="Generated grid CSS" value={css} readOnly spellCheck={false} rows={9} className="block w-full mt-3 bg-transparent text-cyan-100 text-xs leading-6 font-mono rounded resize-y outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" />
            <p className="mt-3 text-xs leading-relaxed text-slate-400">Add the grid-layout class to a container. Its direct children become the tiles, in the order shown above.</p>
          </div>
          <p role="status" className="min-h-5 text-xs font-medium text-cyan-700">{status}</p>
        </div>
      </div>
    </section>
  );
};

export default CSSGridStudio;
