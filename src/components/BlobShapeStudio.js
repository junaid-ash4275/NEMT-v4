import React, { useMemo, useState } from 'react';

function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildBlobPath(pointCount, variance, smoothness, seed) {
  const rand = mulberry32(seed);
  const count = Math.max(3, pointCount);
  const pts = [];

  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
    const radius = Math.min(38, Math.max(12, 28 + (rand() * 2 - 1) * variance));
    pts.push({
      x: 50 + Math.cos(angle) * radius,
      y: 50 + Math.sin(angle) * radius,
    });
  }

  let d = '';
  for (let i = 0; i < count; i += 1) {
    const p0 = pts[(i - 1 + count) % count];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % count];
    const p3 = pts[(i + 2) % count];
    const scale = smoothness / 6;
    const cp1x = p1.x + (p2.x - p0.x) * scale;
    const cp1y = p1.y + (p2.y - p0.y) * scale;
    const cp2x = p2.x - (p3.x - p1.x) * scale;
    const cp2y = p2.y - (p3.y - p1.y) * scale;

    if (i === 0) {
      d += `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} `;
    }
    d += `C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)} `;
  }

  return `${d}Z`;
}

const BlobShapeStudio = () => {
  const [points, setPoints] = useState(7);
  const [variance, setVariance] = useState(14);
  const [smoothness, setSmoothness] = useState(1);
  const [seed, setSeed] = useState(42);
  const [fill, setFill] = useState('#7c3aed');
  const [accent, setAccent] = useState('#22d3ee');
  const [useGradient, setUseGradient] = useState(true);
  const [copied, setCopied] = useState(false);

  const path = useMemo(
    () => buildBlobPath(points, variance, smoothness, seed),
    [points, variance, smoothness, seed]
  );

  const svgMarkup = useMemo(() => {
    const fillValue = useGradient ? 'url(#blob-fill)' : fill;
    const gradient = useGradient
      ? `<defs>
    <linearGradient id="blob-fill" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${fill}" />
      <stop offset="100%" stop-color="${accent}" />
    </linearGradient>
  </defs>
  `
      : '';

    return `<svg viewBox="-12 -12 124 124" xmlns="http://www.w3.org/2000/svg">
  ${gradient}<path d="${path}" fill="${fillValue}" />
</svg>`;
  }, [accent, fill, path, useGradient]);

  const randomize = () => {
    setSeed(Math.floor(Math.random() * 100000));
    setPoints(4 + Math.floor(Math.random() * 8));
    setVariance(6 + Math.floor(Math.random() * 18));
    setSmoothness(Number((0.6 + Math.random() * 0.8).toFixed(2)));
  };

  const copySvg = async () => {
    try {
      await navigator.clipboard.writeText(svgMarkup);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 font-sans">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-600 text-xs font-semibold uppercase tracking-wider mb-2">
          Shape Tool
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
          Blob Shape <span className="text-violet-600">Studio</span>
        </h1>
        <p className="text-gray-600 text-sm sm:text-base mt-2 max-w-2xl mx-auto">
          Sculpt organic SVG blobs, then copy the markup for backgrounds, avatars, and illustrations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-950 rounded-3xl p-6 shadow-xl border border-slate-800 min-h-[420px] flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.45),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(34,211,238,0.35),transparent_42%)]" />
          <svg viewBox="-12 -12 124 124" className="relative w-72 h-72 sm:w-80 sm:h-80 drop-shadow-2xl overflow-visible">
            <defs>
              <linearGradient id="blob-preview-fill" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={fill} />
                <stop offset="100%" stopColor={accent} />
              </linearGradient>
            </defs>
            <path d={path} fill={useGradient ? 'url(#blob-preview-fill)' : fill} />
          </svg>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 flex flex-col gap-6">
          <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
            <span className="flex justify-between">
              Points <span className="text-violet-600">{points}</span>
            </span>
            <input
              type="range"
              min="4"
              max="12"
              value={points}
              onChange={(event) => setPoints(Number(event.target.value))}
              className="accent-violet-600"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
            <span className="flex justify-between">
              Irregularity <span className="text-violet-600">{variance}</span>
            </span>
            <input
              type="range"
              min="0"
              max="24"
              value={variance}
              onChange={(event) => setVariance(Number(event.target.value))}
              className="accent-violet-600"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
            <span className="flex justify-between">
              Smoothness <span className="text-violet-600">{smoothness.toFixed(2)}</span>
            </span>
            <input
              type="range"
              min="0.4"
              max="1.6"
              step="0.05"
              value={smoothness}
              onChange={(event) => setSmoothness(Number(event.target.value))}
              className="accent-violet-600"
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700">
              Fill
              <input
                type="color"
                value={fill}
                onChange={(event) => setFill(event.target.value)}
                className="h-9 w-12 cursor-pointer rounded border border-gray-200 bg-transparent"
              />
            </label>
            <label className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700">
              Accent
              <input
                type="color"
                value={accent}
                onChange={(event) => setAccent(event.target.value)}
                disabled={!useGradient}
                className="h-9 w-12 cursor-pointer rounded border border-gray-200 bg-transparent disabled:opacity-40"
              />
            </label>
          </div>

          <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={useGradient}
              onChange={(event) => setUseGradient(event.target.checked)}
              className="h-4 w-4 accent-violet-600"
            />
            Use gradient fill
          </label>

          <div className="flex flex-col sm:flex-row gap-3 mt-auto">
            <button
              type="button"
              onClick={randomize}
              className="flex-1 rounded-2xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 hover:bg-violet-500 transition-colors"
            >
              Randomize
            </button>
            <button
              type="button"
              onClick={copySvg}
              className="flex-1 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-100 transition-colors"
            >
              {copied ? 'Copied SVG' : 'Copy SVG'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlobShapeStudio;
