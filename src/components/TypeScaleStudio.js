import React, { useId, useRef, useState } from 'react';

const PRESETS = [
  { name: 'Compact', ratio: 1.125 },
  { name: 'Balanced', ratio: 1.2 },
  { name: 'Editorial', ratio: 1.25 },
  { name: 'Bold', ratio: 1.333 },
];

const FONTS = [
  { id: 'sans', name: 'System sans', family: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  { id: 'serif', name: 'Classic serif', family: 'Georgia, "Times New Roman", serif' },
  { id: 'mono', name: 'Monospace', family: 'ui-monospace, SFMono-Regular, Menlo, monospace' },
];

const STEPS = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl'];
const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2';

const TypeScaleStudio = () => {
  const id = useId();
  const [settings, setSettings] = useState({ base: 16, ratio: 1.25, leading: 1.6, font: 'sans', unit: 'rem', heading: '2xl' });
  const [headline, setHeadline] = useState('Good type. Great ideas.');
  const [status, setStatus] = useState('');
  const outputRef = useRef(null);

  const font = FONTS.find((item) => item.id === settings.font);
  const sizes = STEPS.map((name, index) => ({ name, px: Number((settings.base * settings.ratio ** (index - 2)).toFixed(2)) }));
  const heading = sizes.find((size) => size.name === settings.heading);
  const formatSize = (px) => settings.unit === 'rem' ? `${Number((px / 16).toFixed(4))}rem` : `${px}px`;
  const css = [
    ':root {',
    `  --font-body: ${font.family};`,
    `  --leading-body: ${settings.leading};`,
    ...sizes.map((size) => `  --text-${size.name}: ${formatSize(size.px)};`),
    '}',
    '',
    'body {',
    '  font-family: var(--font-body);',
    '  font-size: var(--text-base);',
    '  line-height: var(--leading-body);',
    '}',
    '',
    '.type-heading {',
    `  font-size: var(--text-${settings.heading});`,
    '  line-height: 1.15;',
    '}',
  ].join('\n');

  const update = (field, value) => {
    setSettings((current) => ({ ...current, [field]: value }));
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
    { name: 'Base size', key: 'base', min: 12, max: 24, step: 1, display: `${settings.base}px` },
    { name: 'Scale ratio', key: 'ratio', min: 1.1, max: 1.5, step: 0.001, display: `${settings.ratio.toFixed(3)}×` },
    { name: 'Body line height', key: 'leading', min: 1.2, max: 2, step: 0.05, display: settings.leading.toFixed(2) },
  ];

  return (
    <section aria-labelledby={`${id}-title`} className="max-w-7xl mx-auto my-12 p-6 md:p-8 bg-white rounded-3xl shadow-[0_20px_50px_rgba(244,63,94,0.08)] border border-gray-100 overflow-hidden relative">
      <div aria-hidden="true" className="absolute top-0 right-0 w-96 h-96 bg-rose-50 rounded-full blur-3xl opacity-70 -mr-32 -mt-32 pointer-events-none" />
      <div aria-hidden="true" className="absolute bottom-0 left-0 w-80 h-80 bg-orange-50 rounded-full blur-3xl opacity-60 -ml-24 -mb-24 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-100 gap-4">
        <div className="flex items-center gap-3">
          <div aria-hidden="true" className="w-10 h-10 shrink-0 rounded-2xl bg-gradient-to-tr from-rose-600 to-orange-400 flex items-center justify-center text-white shadow-md shadow-rose-600/20 text-xl font-bold">Aa</div>
          <div>
            <h2 id={`${id}-title`} className="text-3xl font-extrabold text-gray-900 tracking-tight">Type Scale Studio</h2>
            <p className="text-gray-500 text-sm font-medium mt-0.5">Find a rhythm for your typography, from captions to headlines</p>
          </div>
        </div>
        <button type="button" onClick={copyCss} className={`self-start shrink-0 px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-rose-600 to-rose-500 shadow-md shadow-rose-600/20 active:scale-95 transition-all ${FOCUS}`}>
          {status === 'CSS copied to clipboard.' ? 'Copied!' : 'Copy CSS'}
        </button>
      </div>

      <div role="group" aria-label="Type scale presets" className="relative z-10 mt-5 flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button key={preset.name} type="button" aria-pressed={settings.ratio === preset.ratio} onClick={() => update('ratio', preset.ratio)} className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95 ${FOCUS} ${settings.ratio === preset.ratio ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-white/70 border-gray-200 text-gray-500 hover:border-rose-200 hover:text-rose-700'}`}>
            {preset.name} <span className="opacity-60 ml-1">{preset.ratio}×</span>
          </button>
        ))}
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        <div className="lg:col-span-4 min-w-0 space-y-5">
          <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 md:p-5 space-y-5">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-rose-700">Type controls</h3>
            <div>
              <label htmlFor={`${id}-font`} className="block mb-2 text-sm font-semibold text-gray-600">Font family</label>
              <select id={`${id}-font`} value={settings.font} onChange={(event) => update('font', event.target.value)} className={`w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 ${FOCUS}`}>
                {FONTS.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </div>
            {controls.map((control) => (
              <div key={control.key}>
                <div className="flex justify-between gap-3 mb-2">
                  <label htmlFor={`${id}-${control.key}`} className="text-sm font-semibold text-gray-600">{control.name}</label>
                  <output htmlFor={`${id}-${control.key}`} className="text-sm font-mono font-bold text-rose-700">{control.display}</output>
                </div>
                <input id={`${id}-${control.key}`} type="range" min={control.min} max={control.max} step={control.step} value={settings[control.key]} onChange={(event) => update(control.key, Number(event.target.value))} className={`w-full cursor-pointer accent-rose-600 rounded-lg ${FOCUS}`} />
              </div>
            ))}
            <div>
              <label htmlFor={`${id}-headline`} className="block mb-2 text-sm font-semibold text-gray-600">Preview headline</label>
              <input id={`${id}-headline`} type="text" value={headline} maxLength={100} onChange={(event) => setHeadline(event.target.value)} placeholder="Try your own headline" className={`w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 ${FOCUS}`} />
            </div>
          </div>

          <div className="rounded-2xl border border-rose-100 bg-rose-50/70 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm font-bold text-rose-800">CSS units</span>
              <div role="group" aria-label="CSS size units" className="flex gap-1">
                {['px', 'rem'].map((unit) => (
                  <button key={unit} type="button" aria-pressed={settings.unit === unit} onClick={() => update('unit', unit)} className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${FOCUS} ${settings.unit === unit ? 'bg-rose-600 border-rose-600 text-white' : 'bg-white border-rose-100 text-rose-700'}`}>{unit}</button>
                ))}
              </div>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-rose-700">Each step multiplies by the scale ratio. {settings.unit === 'rem' ? 'Rem values assume a 16px root font size.' : 'Pixel values match the preview sizes.'}</p>
          </div>
        </div>

        <div className="lg:col-span-8 min-w-0 space-y-5">
          <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-rose-50/60 via-white to-orange-50/60 p-5 md:p-7">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-rose-700">Live typography</h3>
              <span className="text-xs font-semibold text-gray-500">{font.name} · {heading.px}px headline</span>
            </div>
            <div style={{ fontFamily: font.family }}>
              <p className="uppercase tracking-widest font-semibold text-rose-600 mb-3 break-words" style={{ fontSize: sizes[1].px }}>A little type goes a long way</p>
              <h3 aria-label="Headline preview" className="font-bold tracking-tight text-gray-900 break-words" style={{ fontSize: heading.px, lineHeight: 1.15 }}>{headline || 'Your headline goes here.'}</h3>
              <p className="mt-5 text-gray-600 break-words" style={{ fontSize: settings.base, lineHeight: settings.leading }}>A clear type scale brings order to a page. Give your headings room to lead, keep the body comfortable to read, and let the small details support the story.</p>
              <p className="mt-5 text-gray-500 break-words" style={{ fontSize: sizes[0].px, lineHeight: settings.leading }}>Made to read, built to feel right.</p>
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">Choose a headline size</h3>
            <div role="group" aria-label="Headline size tokens" className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {sizes.map((size) => (
                <button key={size.name} type="button" aria-label={`Use ${size.name} headline size`} aria-pressed={settings.heading === size.name} onClick={() => update('heading', size.name)} className={`min-w-0 rounded-xl border px-3 py-3 text-left transition-colors ${FOCUS} ${settings.heading === size.name ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-gray-100 bg-white/80 text-gray-600 hover:border-rose-200'}`}>
                  <span className="block text-[10px] font-bold uppercase tracking-wider">{size.name}</span>
                  <span className="block mt-1 text-xs font-mono break-all">{formatSize(size.px)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900 p-4 md:p-5">
            <label htmlFor={`${id}-css`} className="text-[10px] font-bold uppercase tracking-widest text-rose-300">Ready for your stylesheet</label>
            <textarea ref={outputRef} id={`${id}-css`} aria-label="Generated typography CSS" value={css} readOnly spellCheck={false} rows={9} className="block w-full mt-3 bg-transparent text-rose-100 text-xs leading-6 font-mono rounded resize-y outline-none focus-visible:ring-2 focus-visible:ring-rose-400" />
            <p className="mt-3 text-xs leading-relaxed text-slate-400">Use the text variables anywhere. Add the type-heading class to a heading to apply your selected size.</p>
          </div>
          <p role="status" className="min-h-5 text-xs font-medium text-rose-700">{status}</p>
        </div>
      </div>
    </section>
  );
};

export default TypeScaleStudio;
