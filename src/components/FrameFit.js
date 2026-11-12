import React, { useEffect, useId, useMemo, useState } from 'react';

const STORAGE_KEY = 'frame-fit-v1';
const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2';
const GOLDEN = (1 + Math.sqrt(5)) / 2;
const PIXEL_MIN = 1;
const PIXEL_MAX = 8000;

const RATIOS = [
  { id: '16:9', name: '16:9', w: 16, h: 9, note: 'Widescreen video and most monitors.' },
  { id: '4:3', name: '4:3', w: 4, h: 3, note: 'Classic screens and slides.' },
  { id: '3:2', name: '3:2', w: 3, h: 2, note: '35mm still photography.' },
  { id: '1:1', name: '1:1', w: 1, h: 1, note: 'Square posts and avatars.' },
  { id: '21:9', name: '21:9', w: 21, h: 9, note: 'Ultrawide displays and cinema.' },
  { id: '9:16', name: '9:16', w: 9, h: 16, note: 'Stories, shorts, and phone video.' },
  { id: '2:3', name: '2:3', w: 2, h: 3, note: 'Portrait photos.' },
  { id: 'golden', name: 'Golden', w: GOLDEN, h: 1, note: 'The golden ratio, about 1.618 to 1.' },
  { id: 'custom', name: 'Custom', w: null, h: null, note: 'Type the two sides of your own ratio.' },
];

const CANVASES = [
  { name: 'HD', w: 1920, h: 1080 },
  { name: '4K', w: 3840, h: 2160 },
  { name: 'Thumb', w: 1280, h: 720 },
  { name: 'Post', w: 1080, h: 1080 },
  { name: 'Story', w: 1080, h: 1920 },
  { name: 'Link', w: 1200, h: 630 },
];

const PPIS = [72, 96, 150, 300];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    const next = x % y;
    x = y;
    y = next;
  }
  return x || 1;
}

function sameRatio(aW, aH, bW, bH) {
  return Math.abs(aW * bH - aH * bW) < 0.01;
}

function formatPart(value) {
  if (Number.isInteger(value)) return String(value);
  return String(Math.round(value * 1000) / 1000);
}

function parsePart(value, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return fallback;
  return clamp(number, 0.01, 9999);
}

function sanitizePart(value, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return fallback;
  return formatPart(clamp(number, 0.01, 9999));
}

function cssAspect(width, height) {
  if (Number.isInteger(width) && Number.isInteger(height)) {
    const divisor = gcd(width, height);
    return `${width / divisor} / ${height / divisor}`;
  }
  return `${formatPart(width)} / ${formatPart(height)}`;
}

function readableRatio(id, width, height) {
  if (id === 'golden') return 'φ : 1';
  if (Number.isInteger(width) && Number.isInteger(height)) {
    const divisor = gcd(width, height);
    return `${width / divisor} : ${height / divisor}`;
  }
  return `${formatPart(width)} : ${formatPart(height)}`;
}

function formatLength(value) {
  if (value >= 100) return value.toFixed(0);
  return value.toFixed(2);
}

function formatInches(pixels, ppi) {
  return formatLength(pixels / ppi);
}

function formatCm(pixels, ppi) {
  return formatLength((pixels / ppi) * 2.54);
}

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    const ratioId = RATIOS.some((item) => item.id === data.ratioId) ? data.ratioId : '16:9';
    const preset = RATIOS.find((item) => item.id === ratioId);
    return {
      ratioId,
      customW: ratioId === 'custom' ? sanitizePart(data.customW, '16') : formatPart(preset.w),
      customH: ratioId === 'custom' ? sanitizePart(data.customH, '9') : formatPart(preset.h),
      lock: data.lock === 'height' ? 'height' : 'width',
      pixels: clamp(Math.round(Number(data.pixels) || 1920), PIXEL_MIN, PIXEL_MAX),
      ppi: PPIS.includes(Number(data.ppi)) ? Number(data.ppi) : 96,
    };
  } catch {
    return null;
  }
}

export default function FrameFit() {
  const labelId = useId();
  const saved = useMemo(() => loadSaved(), []);
  const [ratioId, setRatioId] = useState(saved?.ratioId || '16:9');
  const [customW, setCustomW] = useState(saved?.customW || '16');
  const [customH, setCustomH] = useState(saved?.customH || '9');
  const [lock, setLock] = useState(saved?.lock || 'width');
  const [pixels, setPixels] = useState(saved?.pixels || 1920);
  const [ppi, setPpi] = useState(saved?.ppi || 96);
  const [status, setStatus] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ratioId,
        customW,
        customH,
        lock,
        pixels,
        ppi,
      }));
    } catch {
      setStatus('This browser blocked saving, so the frame stays in this tab only.');
    }
  }, [ratioId, customW, customH, lock, pixels, ppi]);

  const preset = RATIOS.find((item) => item.id === ratioId) || RATIOS[0];
  const ratioW = ratioId === 'custom' ? parsePart(customW, 16) : preset.w;
  const ratioH = ratioId === 'custom' ? parsePart(customH, 9) : preset.h;
  const widthExact = lock === 'width' ? pixels : (pixels * ratioW) / ratioH;
  const heightExact = lock === 'height' ? pixels : (pixels * ratioH) / ratioW;
  const widthPx = Math.max(1, Math.round(widthExact));
  const heightPx = Math.max(1, Math.round(heightExact));
  const exact = Math.abs(widthExact - widthPx) < 0.001 && Math.abs(heightExact - heightPx) < 0.001;
  const label = readableRatio(ratioId, ratioW, ratioH);
  const megapixels = (widthPx * heightPx) / 1000000;
  const megapixelLabel = megapixels >= 10 ? megapixels.toFixed(1) : megapixels.toFixed(2);
  const diagonal = Math.round(Math.hypot(widthPx, heightPx));
  const aspect = cssAspect(ratioW, ratioH);
  const css = `width: ${widthPx}px;\nheight: ${heightPx}px;\naspect-ratio: ${aspect};`;
  const customReady = ratioId !== 'custom' || (Number(customW) > 0 && Number(customH) > 0);
  const stageRatio = 16 / 10;
  const frameRatio = ratioW / ratioH;
  const frameStyle = frameRatio >= stageRatio
    ? { width: '100%', height: `${(stageRatio / frameRatio) * 100}%` }
    : { width: `${(frameRatio / stageRatio) * 100}%`, height: '100%' };

  const applyPixels = (next) => {
    const amount = Number(next);
    if (!Number.isFinite(amount)) return;
    setPixels(clamp(Math.round(amount), PIXEL_MIN, PIXEL_MAX));
    setStatus('');
  };

  const applyRatio = (next) => {
    setRatioId(next.id);
    if (next.w && next.h) {
      setCustomW(formatPart(next.w));
      setCustomH(formatPart(next.h));
    }
    setStatus('');
  };

  const editPart = (side, value) => {
    if (value !== '' && !/^\d*\.?\d*$/.test(value)) return;
    const next = value.slice(0, 8);
    if (side === 'w') setCustomW(next);
    else setCustomH(next);
    setRatioId('custom');
    setStatus('');
  };

  const applyCanvas = (canvas) => {
    const match = RATIOS.find((item) => item.w && sameRatio(item.w, item.h, canvas.w, canvas.h));
    setRatioId(match ? match.id : 'custom');
    setCustomW(String(canvas.w));
    setCustomH(String(canvas.h));
    setLock('width');
    setPixels(canvas.w);
    setStatus('');
  };

  const flip = () => {
    const nextWidth = heightPx;
    const nextHeight = widthPx;
    const match = RATIOS.find((item) => item.w && sameRatio(item.w, item.h, nextWidth, nextHeight));
    setRatioId(match ? match.id : 'custom');
    setCustomW(String(nextWidth));
    setCustomH(String(nextHeight));
    setLock('width');
    setPixels(clamp(nextWidth, PIXEL_MIN, PIXEL_MAX));
    setStatus('');
  };

  const copySize = async () => {
    const text = [
      `${widthPx} × ${heightPx}`,
      label,
      `${megapixelLabel} MP · ${diagonal.toLocaleString()} px diagonal`,
      `${formatInches(widthPx, ppi)} × ${formatInches(heightPx, ppi)} in at ${ppi} PPI`,
      css,
    ].join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setStatus('Frame size copied.');
    } catch {
      setStatus('Clipboard is blocked in this browser.');
    }
  };

  return (
    <section aria-labelledby={labelId} className="max-w-7xl mx-auto my-12 p-6 md:p-8 bg-white rounded-3xl shadow-[0_20px_50px_rgba(5,150,105,0.08)] border border-gray-100 overflow-hidden relative">
      <div aria-hidden="true" className="absolute top-0 right-0 w-96 h-96 bg-emerald-50 rounded-full blur-3xl opacity-80 -mr-32 -mt-32 pointer-events-none" />
      <div aria-hidden="true" className="absolute bottom-0 left-0 w-80 h-80 bg-teal-50 rounded-full blur-3xl opacity-70 -ml-24 -mb-24 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-100 gap-4">
        <div className="flex items-center gap-3">
          <div aria-hidden="true" className="w-10 h-10 shrink-0 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 8V5h3" />
              <path d="M17 5h3v3" />
              <path d="M20 16v3h-3" />
              <path d="M7 19H4v-3" />
              <rect x="8" y="8" width="8" height="8" rx="1" />
            </svg>
          </div>
          <div>
            <h2 id={labelId} className="text-3xl font-extrabold text-gray-900 tracking-tight">Frame Fit</h2>
            <p className="text-gray-500 text-sm font-medium mt-0.5">Turn a ratio into pixel size, print size, and CSS</p>
          </div>
        </div>
        <button type="button" onClick={copySize} className={`self-start shrink-0 px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 shadow-md shadow-emerald-600/20 active:scale-95 transition-all ${FOCUS}`}>
          {status === 'Frame size copied.' ? 'Copied' : 'Copy size'}
        </button>
      </div>

      <div className="relative z-10 mt-5 grid grid-cols-3 gap-3">
        {[
          { label: 'Width', value: widthPx.toLocaleString() },
          { label: 'Height', value: heightPx.toLocaleString() },
          { label: 'Megapixels', value: megapixelLabel },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3">
            <div className="text-2xl font-black tabular-nums text-emerald-800">{stat.value}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-700/80">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        <div className="lg:col-span-5 min-w-0 space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 md:p-5 space-y-4">
            <div>
              <div className="text-sm font-semibold text-gray-600">Ratio</div>
              <div role="group" aria-label="Frame ratio" className="mt-2 flex flex-wrap gap-2">
                {RATIOS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={ratioId === item.id}
                    onClick={() => applyRatio(item)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${FOCUS} ${ratioId === item.id ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-gray-200 text-gray-500'}`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-xs font-medium leading-relaxed text-gray-500">{preset.note}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor={`${labelId}-ratio-w`} className="text-xs font-semibold text-gray-600">Ratio width</label>
                <input
                  id={`${labelId}-ratio-w`}
                  inputMode="decimal"
                  value={customW}
                  onChange={(event) => editPart('w', event.target.value)}
                  className={`mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-800 ${FOCUS}`}
                />
              </div>
              <div>
                <label htmlFor={`${labelId}-ratio-h`} className="text-xs font-semibold text-gray-600">Ratio height</label>
                <input
                  id={`${labelId}-ratio-h`}
                  inputMode="decimal"
                  value={customH}
                  onChange={(event) => editPart('h', event.target.value)}
                  className={`mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-800 ${FOCUS}`}
                />
              </div>
            </div>
            {!customReady && (
              <p className="text-xs font-medium text-emerald-800">Enter both sides as numbers above 0. Until then the frame uses 16:9.</p>
            )}
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-4 md:p-5 space-y-4">
            <div role="group" aria-label="Which side you already know" className="grid grid-cols-2 gap-2">
              {[
                { id: 'width', label: 'I know the width' },
                { id: 'height', label: 'I know the height' },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={lock === option.id}
                  onClick={() => { setLock(option.id); setStatus(''); }}
                  className={`rounded-xl px-3 py-2.5 text-left text-sm font-bold border ${FOCUS} ${lock === option.id ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-gray-200 text-gray-600'}`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div>
              <div className="flex justify-between gap-3 mb-2">
                <label htmlFor={`${labelId}-pixels`} className="text-sm font-semibold text-gray-600">
                  {lock === 'width' ? 'Width' : 'Height'}
                </label>
                <output htmlFor={`${labelId}-pixels`} className="text-sm font-mono font-bold text-emerald-700">{pixels.toLocaleString()} px</output>
              </div>
              <input
                id={`${labelId}-pixels`}
                type="range"
                min={PIXEL_MIN}
                max={PIXEL_MAX}
                step="1"
                value={pixels}
                onChange={(event) => applyPixels(event.target.value)}
                className={`w-full cursor-pointer accent-emerald-600 ${FOCUS}`}
              />
              <input
                aria-label={lock === 'width' ? 'Width in pixels' : 'Height in pixels'}
                inputMode="numeric"
                value={pixels}
                onChange={(event) => applyPixels(event.target.value)}
                className={`mt-3 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-semibold text-gray-800 ${FOCUS}`}
              />
            </div>

            <div>
              <div className="text-sm font-semibold text-gray-600">Common frames</div>
              <div role="group" aria-label="Common frame sizes" className="mt-2 flex flex-wrap gap-2">
                {CANVASES.map((canvas) => {
                  const selected = canvas.w === widthPx && canvas.h === heightPx;
                  return (
                    <button
                      key={canvas.name}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => applyCanvas(canvas)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${FOCUS} ${selected ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-gray-200 text-gray-500'}`}
                    >
                      {canvas.name}
                      <span className={selected ? 'text-emerald-100' : 'text-gray-400'}> {canvas.w}×{canvas.h}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 min-w-0 space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-4 md:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">Preview</h3>
                <p className="mt-2 text-sm font-medium leading-relaxed text-gray-600">
                  {exact ? 'This ratio lands on whole pixels.' : 'Pixel size is the nearest whole-pixel match. CSS keeps the exact ratio.'}
                </p>
              </div>
              <button type="button" onClick={flip} className={`shrink-0 rounded-xl px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-100 ${FOCUS}`}>
                Flip
              </button>
            </div>

            <div className="relative mt-5 w-full aspect-[16/10] rounded-2xl border border-emerald-100 bg-emerald-50/60 overflow-hidden">
              <div className="absolute inset-4 sm:inset-6">
                <div
                  role="img"
                  aria-label={`${widthPx} by ${heightPx} pixel frame at ${label}`}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={frameStyle}
                >
                  <div className="h-full w-full rounded-xl bg-gradient-to-br from-emerald-500 to-teal-300 shadow-lg shadow-emerald-600/20 ring-1 ring-white/50" />
                </div>
              </div>
            </div>
            <p className="mt-3 text-center text-sm font-black tabular-nums tracking-tight text-gray-900">{widthPx.toLocaleString()} × {heightPx.toLocaleString()}</p>
            <p className="text-center text-xs font-semibold text-gray-500">{label} · {diagonal.toLocaleString()} px diagonal</p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4 md:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">Print size</h3>
              <div role="group" aria-label="Pixels per inch" className="flex flex-wrap gap-2">
                {PPIS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={ppi === option}
                    onClick={() => { setPpi(option); setStatus(''); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${FOCUS} ${ppi === option ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-emerald-100 text-emerald-800'}`}
                  >
                    {option} PPI
                  </button>
                ))}
              </div>
            </div>
            <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div className="flex justify-between gap-3 border-b border-emerald-100 py-2">
                <dt className="text-emerald-800/70">Inches</dt>
                <dd className="font-semibold text-emerald-950">{formatInches(widthPx, ppi)} × {formatInches(heightPx, ppi)} in</dd>
              </div>
              <div className="flex justify-between gap-3 border-b border-emerald-100 py-2">
                <dt className="text-emerald-800/70">Centimeters</dt>
                <dd className="font-semibold text-emerald-950">{formatCm(widthPx, ppi)} × {formatCm(heightPx, ppi)} cm</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl bg-slate-900 p-4 md:p-5">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">CSS</h3>
            <pre className="mt-3 overflow-x-auto text-xs leading-6 font-mono text-emerald-100">{css}</pre>
          </div>
        </div>
      </div>

      <p aria-live="polite" className="relative z-10 mt-4 min-h-5 text-sm font-medium text-emerald-800">{status}</p>
    </section>
  );
}
