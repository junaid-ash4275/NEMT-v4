import React, { useMemo, useState } from 'react';

const ACCENT = '#ea580c';

const UNITS = {
  tsp: { kind: 'volume', base: 4.92892, system: 'us', label: ['tsp', 'tsp'] },
  tbsp: { kind: 'volume', base: 14.7868, system: 'us', label: ['tbsp', 'tbsp'] },
  floz: { kind: 'volume', base: 29.5735, system: 'us', label: ['fl oz', 'fl oz'] },
  cup: { kind: 'volume', base: 236.588, system: 'us', label: ['cup', 'cups'] },
  pint: { kind: 'volume', base: 473.176, system: 'us', label: ['pint', 'pints'] },
  quart: { kind: 'volume', base: 946.353, system: 'us', label: ['qt', 'qt'] },
  gallon: { kind: 'volume', base: 3785.41, system: 'us', label: ['gal', 'gal'] },
  ml: { kind: 'volume', base: 1, system: 'metric', label: ['ml', 'ml'] },
  l: { kind: 'volume', base: 1000, system: 'metric', label: ['l', 'l'] },
  g: { kind: 'mass', base: 1, system: 'metric', label: ['g', 'g'] },
  kg: { kind: 'mass', base: 1000, system: 'metric', label: ['kg', 'kg'] },
  oz: { kind: 'mass', base: 28.3495, system: 'us', label: ['oz', 'oz'] },
  lb: { kind: 'mass', base: 453.592, system: 'us', label: ['lb', 'lb'] },
  pinch: { kind: 'count', label: ['pinch', 'pinches'] },
  dash: { kind: 'count', label: ['dash', 'dashes'] },
  clove: { kind: 'count', label: ['clove', 'cloves'] },
  can: { kind: 'count', label: ['can', 'cans'] },
  stick: { kind: 'count', grams: 113.4, label: ['stick', 'sticks'] },
  slice: { kind: 'count', label: ['slice', 'slices'] },
  sprig: { kind: 'count', label: ['sprig', 'sprigs'] },
  bunch: { kind: 'count', label: ['bunch', 'bunches'] },
  handful: { kind: 'count', label: ['handful', 'handfuls'] },
  package: { kind: 'count', label: ['package', 'packages'] },
  piece: { kind: 'count', label: ['piece', 'pieces'] },
};

const ALIASES = Object.entries({
  tsp: ['teaspoons', 'teaspoon', 'tsps', 'tsp'],
  tbsp: ['tablespoons', 'tablespoon', 'tbsps', 'tbsp', 'tbs'],
  floz: ['fluid ounces', 'fluid ounce', 'fl. oz', 'fl oz'],
  cup: ['cups', 'cup'],
  pint: ['pints', 'pint', 'pt'],
  quart: ['quarts', 'quart', 'qt'],
  gallon: ['gallons', 'gallon', 'gal'],
  ml: ['milliliters', 'millilitres', 'milliliter', 'millilitre', 'ml'],
  l: ['liters', 'litres', 'liter', 'litre', 'l'],
  g: ['grams', 'gram', 'g'],
  kg: ['kilograms', 'kilogram', 'kg'],
  oz: ['ounces', 'ounce', 'oz'],
  lb: ['pounds', 'pound', 'lbs', 'lb'],
  pinch: ['pinches', 'pinch'],
  dash: ['dashes', 'dash'],
  clove: ['cloves', 'clove'],
  can: ['cans', 'can'],
  stick: ['sticks', 'stick'],
  slice: ['slices', 'slice'],
  sprig: ['sprigs', 'sprig'],
  bunch: ['bunches', 'bunch'],
  handful: ['handfuls', 'handful'],
  package: ['packages', 'package', 'pkg'],
  piece: ['pieces', 'piece'],
})
  .flatMap(([key, words]) => words.map((word) => ({ key, word })))
  .sort((a, b) => b.word.length - a.word.length)
  .map(({ key, word }) => ({
    key,
    re: new RegExp(`^${word.replace(/[.]/g, '\\.').replace(/ /g, '\\s+')}\\.?(?=[\\s,;)]|$)`, 'i'),
  }));

const CASED_ALIASES = [
  { key: 'tbsp', re: /^T\.?(?=[\s,;)]|$)/ },
  { key: 'tsp', re: /^t\.?(?=[\s,;)]|$)/ },
  { key: 'cup', re: /^[cC]\.?(?=[\s,;)]|$)/ },
];

const GLYPHS = { '½': 1 / 2, '⅓': 1 / 3, '⅔': 2 / 3, '¼': 1 / 4, '¾': 3 / 4, '⅛': 1 / 8, '⅜': 3 / 8, '⅝': 5 / 8, '⅞': 7 / 8 };
const GLYPH_CLASS = Object.keys(GLYPHS).join('');
const NUM = `(?:\\d+\\s+\\d+\\/\\d+|\\d+\\/\\d+|\\d+\\s*[${GLYPH_CLASS}]|\\d*\\.\\d+|\\d+|[${GLYPH_CLASS}])`;
const QTY_RE = new RegExp(`^\\s*(?:[-*•]\\s*)?(${NUM})(?:\\s*(?:-|–|to)\\s*(${NUM}))?(?![\\d/])`);
const YIELD_RE = /^\s*(serves|servings|makes|yield|yields)\b[:\s]*(\d+)(.*)$/i;

const FRACTION_STEPS = [
  [0, ''], [1 / 8, '⅛'], [1 / 4, '¼'], [1 / 3, '⅓'], [3 / 8, '⅜'], [1 / 2, '½'],
  [5 / 8, '⅝'], [2 / 3, '⅔'], [3 / 4, '¾'], [7 / 8, '⅞'], [1, ''],
];
const HALF_STEPS = [[0, ''], [1 / 2, '½'], [1, '']];

const PANS = [
  { id: 'r6', label: '6″ round', area: Math.PI * 9 },
  { id: 'r8', label: '8″ round', area: Math.PI * 16 },
  { id: 'r9', label: '9″ round', area: Math.PI * 20.25 },
  { id: 'r10', label: '10″ round', area: Math.PI * 25 },
  { id: 's8', label: '8″ square', area: 64 },
  { id: 's9', label: '9″ square', area: 81 },
  { id: 'loaf', label: '9×5″ loaf', area: 45 },
  { id: 'rect', label: '9×13″', area: 117 },
  { id: 'sheet', label: '10×15″ sheet', area: 150 },
];

const MULTIPLIERS = [0.5, 1, 1.5, 2, 3];

const UNIT_MODES = [
  { id: 'keep', label: 'Keep units' },
  { id: 'us', label: 'US kitchen' },
  { id: 'metric', label: 'Metric' },
];

const PRESETS = [
  {
    name: 'Buttermilk pancakes',
    servings: 4,
    target: 6,
    scaleBy: 'servings',
    text: `Serves 4
2 cups all-purpose flour
2 tbsp sugar
2 tsp baking powder
1/2 tsp baking soda
1/2 tsp salt
2 cups buttermilk
2 large eggs
3 tbsp melted butter
1 tsp vanilla extract`,
  },
  {
    name: 'Choc chip cookies',
    servings: 24,
    target: 36,
    scaleBy: 'servings',
    text: `Makes 24 cookies
For the dough:
2 sticks butter, softened
3/4 cup brown sugar
1/2 cup granulated sugar
1 egg
2 tsp vanilla extract
2 1/4 cups flour
1 tsp baking soda
1/2 tsp salt
1 1/2 cups chocolate chips
Flaky salt, to finish`,
  },
  {
    name: 'Lemon drizzle cake',
    servings: 8,
    target: 8,
    scaleBy: 'pan',
    panFrom: 'r8',
    panTo: 'rect',
    text: `Serves 8
For the cake:
225 g plain flour
200 g caster sugar
2 tsp baking powder
3 eggs
120 ml whole milk
115 g butter, melted
Zest of 2 lemons
For the glaze:
150 g icing sugar
2-3 tbsp lemon juice`,
  },
  {
    name: 'Tomato sauce',
    servings: 4,
    target: 10,
    scaleBy: 'servings',
    text: `Serves 4
2 tbsp olive oil
1 onion, diced
4 cloves garlic, minced
1 (28 oz) can crushed tomatoes
1 tsp dried oregano
1 pinch chili flakes
Salt to taste
Fresh basil, torn`,
  },
];

function trimDecimal(value, digits) {
  return String(Number(value.toFixed(digits)));
}

function parseNumber(token) {
  const text = token.trim();
  const glyph = text.match(new RegExp(`^(\\d*)\\s*([${GLYPH_CLASS}])$`));
  if (glyph) return (Number(glyph[1]) || 0) + GLYPHS[glyph[2]];
  const mixed = text.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) return Number(mixed[3]) ? Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3]) : NaN;
  const fraction = text.match(/^(\d+)\/(\d+)$/);
  if (fraction) return Number(fraction[2]) ? Number(fraction[1]) / Number(fraction[2]) : NaN;
  return Number.parseFloat(text);
}

function formatFraction(value) {
  if (!(value > 0)) return '0';
  if (value < 0.1) return trimDecimal(value, 2);
  const steps = value >= 10 ? HALF_STEPS : FRACTION_STEPS;
  let whole = Math.floor(value);
  const remainder = value - whole;
  let best = steps[0];
  steps.forEach((step) => {
    if (Math.abs(step[0] - remainder) < Math.abs(best[0] - remainder)) best = step;
  });
  if (best[0] === 1) whole += 1;
  return `${whole > 0 ? whole : ''}${best[1]}` || '0';
}

function formatMetric(value) {
  if (value >= 100) return String(Math.round(value / 5) * 5);
  if (value >= 10) return String(Math.round(value));
  if (value >= 1) return trimDecimal(Math.round(value * 2) / 2, 1);
  return trimDecimal(value, value >= 0.1 ? 1 : 2);
}

function formatAmount(value, unitKey) {
  if (unitKey === 'kg' || unitKey === 'l') return trimDecimal(value, 2);
  if (unitKey === 'g' || unitKey === 'ml') return formatMetric(value);
  return formatFraction(value);
}

function pickTarget(fromKey, mode, amount) {
  const from = UNITS[fromKey];
  if (from.kind === 'count') {
    if (mode === 'metric' && from.grams) {
      const grams = amount * from.grams;
      return { key: grams >= 1000 ? 'kg' : 'g', base: from.grams };
    }
    return { key: fromKey, base: from.base || 1 };
  }
  if (mode === 'keep') return { key: fromKey, base: from.base };

  const base = amount * from.base;
  if (from.kind === 'volume') {
    if (mode === 'metric') return { key: base >= 1000 ? 'l' : 'ml', base: from.base };
    const cups = base / UNITS.cup.base;
    if (cups >= 8) return { key: 'quart', base: from.base };
    if (cups >= 0.24) return { key: 'cup', base: from.base };
    if (base / UNITS.tbsp.base >= 0.95) return { key: 'tbsp', base: from.base };
    return { key: 'tsp', base: from.base };
  }
  if (mode === 'metric') return { key: base >= 1000 ? 'kg' : 'g', base: from.base };
  return { key: base / UNITS.oz.base >= 16 ? 'lb' : 'oz', base: from.base };
}

function matchUnit(text) {
  const trimmed = text.replace(/^\s+/, '');
  const offset = text.length - trimmed.length;
  for (const alias of [...CASED_ALIASES, ...ALIASES]) {
    const found = trimmed.match(alias.re);
    if (found) return { key: alias.key, length: offset + found[0].length };
  }
  return null;
}

function parseLine(raw) {
  const line = raw.trim();
  const yieldMatch = line.match(YIELD_RE);
  if (yieldMatch) {
    return { type: 'yield', raw: line, word: yieldMatch[1], count: Number(yieldMatch[2]), tail: yieldMatch[3] };
  }

  const qty = line.match(QTY_RE);
  if (!qty) {
    if (line.endsWith(':')) return { type: 'header', raw: line, text: line.slice(0, -1) };
    return { type: 'text', raw: line, hasNumber: /\d/.test(line) };
  }

  const lo = parseNumber(qty[1]);
  const hi = qty[2] ? parseNumber(qty[2]) : lo;
  if (!Number.isFinite(lo) || !Number.isFinite(hi) || hi <= 0) return { type: 'text', raw: line, hasNumber: true };

  let rest = line.slice(qty[0].length);
  const unit = matchUnit(rest);
  const original = line.slice(0, qty[0].length + (unit ? unit.length : 0)).replace(/^\s*[-*•]\s*/, '').trim();
  if (unit) rest = rest.slice(unit.length);

  return {
    type: 'ingredient',
    raw: line,
    lo,
    hi,
    range: Boolean(qty[2]),
    unitKey: unit ? unit.key : null,
    original,
    name: rest.trim(),
  };
}

function scaleIngredient(item, factor, mode) {
  const lo = item.lo * factor;
  const hi = item.hi * factor;

  if (!item.unitKey) {
    const amount = item.range ? `${formatFraction(lo)}–${formatFraction(hi)}` : formatFraction(hi);
    let note = null;
    const partial = hi - Math.floor(hi);
    if (/\beggs?\b/i.test(item.name) && partial > 0.1 && partial < 0.9) {
      note = `Partial egg: whisk one and use about ${trimDecimal(Math.round(partial * 3 * 2) / 2, 1)} tbsp of it`;
    }
    const name = hi > 1 ? item.name.replace(/\begg\b/i, 'eggs') : item.name;
    return { amount, unit: '', converted: false, note, name };
  }

  const target = pickTarget(item.unitKey, mode, hi);
  const toBase = UNITS[target.key].base || 1;
  const convert = (value) => (value * target.base) / toBase;
  const hiValue = convert(hi);
  const amount = item.range
    ? `${formatAmount(convert(lo), target.key)}–${formatAmount(hiValue, target.key)}`
    : formatAmount(hiValue, target.key);
  const label = UNITS[target.key].label[hiValue > 1.0001 ? 1 : 0];
  return { amount, unit: label, converted: target.key !== item.unitKey, note: null, name: item.name };
}

function findYield(text) {
  for (const line of text.split('\n')) {
    const found = line.trim().match(YIELD_RE);
    if (found) return Number(found[2]);
  }
  return null;
}

function formatFactor(factor) {
  return `×${trimDecimal(factor, 2)}`;
}

const chipStyle = (active) =>
  active
    ? { background: '#ea580c18', border: '1.5px solid #ea580c66', color: ACCENT }
    : { background: 'transparent', border: '1.5px solid #e2e8f0', color: '#94a3b8' };

const Stepper = ({ label, value, onChange }) => (
  <div className="rounded-xl bg-white border border-gray-100 px-3 py-3">
    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</p>
    <div className="mt-2 flex items-center gap-2">
      <button
        onClick={() => onChange(Math.max(1, value - 1))}
        aria-label={`Decrease ${label}`}
        className="w-8 h-8 rounded-lg bg-orange-50 text-orange-700 font-extrabold active:scale-95 transition-all"
      >
        −
      </button>
      <input
        value={value}
        onChange={(event) => {
          const next = parseInt(event.target.value.replace(/\D/g, ''), 10);
          onChange(Number.isFinite(next) ? Math.min(999, Math.max(1, next)) : 1);
        }}
        inputMode="numeric"
        aria-label={label}
        className="w-full min-w-0 text-center bg-transparent text-xl font-extrabold text-gray-900 tabular-nums outline-none"
      />
      <button
        onClick={() => onChange(Math.min(999, value + 1))}
        aria-label={`Increase ${label}`}
        className="w-8 h-8 rounded-lg bg-orange-50 text-orange-700 font-extrabold active:scale-95 transition-all"
      >
        +
      </button>
    </div>
  </div>
);

const RecipeScaler = () => {
  const [text, setText] = useState(PRESETS[0].text);
  const [baseServings, setBaseServings] = useState(PRESETS[0].servings);
  const [targetServings, setTargetServings] = useState(PRESETS[0].target);
  const [scaleBy, setScaleBy] = useState(PRESETS[0].scaleBy);
  const [panFrom, setPanFrom] = useState('r9');
  const [panTo, setPanTo] = useState('rect');
  const [unitMode, setUnitMode] = useState('us');
  const [checked, setChecked] = useState(() => new Set());
  const [copied, setCopied] = useState(false);

  const fromPan = PANS.find((pan) => pan.id === panFrom) || PANS[0];
  const toPan = PANS.find((pan) => pan.id === panTo) || PANS[0];
  const factor = scaleBy === 'pan' ? toPan.area / fromPan.area : targetServings / Math.max(1, baseServings);

  const activePreset = PRESETS.find((preset) => preset.text === text);

  const lines = useMemo(
    () =>
      text
        .split('\n')
        .map((raw) => raw.trim())
        .filter(Boolean)
        .map((raw) => {
          const parsed = parseLine(raw);
          if (parsed.type === 'ingredient') return { ...parsed, scaled: scaleIngredient(parsed, factor, unitMode) };
          if (parsed.type === 'yield') return { ...parsed, scaledCount: Math.max(1, Math.round(parsed.count * factor)) };
          return parsed;
        }),
    [text, factor, unitMode]
  );

  const stats = useMemo(() => {
    const ingredients = lines.filter((line) => line.type === 'ingredient');
    return {
      scaled: ingredients.length,
      converted: ingredients.filter((line) => line.scaled.converted).length,
      review: lines.filter((line) => line.type === 'text' && line.hasNumber).length,
      done: ingredients.filter((line, index) => checked.has(line.raw + index)).length,
    };
  }, [lines, checked]);

  const loadPreset = (preset) => {
    setText(preset.text);
    setBaseServings(preset.servings);
    setTargetServings(preset.target);
    setScaleBy(preset.scaleBy);
    if (preset.panFrom) setPanFrom(preset.panFrom);
    if (preset.panTo) setPanTo(preset.panTo);
    setChecked(new Set());
  };

  const editText = (value) => {
    setText(value);
    const found = findYield(value);
    if (found) setBaseServings(found);
    setChecked(new Set());
  };

  const toggleChecked = (key) => {
    setChecked((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const scaledText = () => {
    const title = activePreset ? activePreset.name : 'Recipe';
    const detail = scaleBy === 'pan' ? `${fromPan.label} → ${toPan.label}` : `${baseServings} → ${targetServings} servings`;
    const body = lines.map((line) => {
      if (line.type === 'ingredient') {
        return `- ${[line.scaled.amount, line.scaled.unit, line.scaled.name].filter(Boolean).join(' ')}`;
      }
      if (line.type === 'yield') return `${line.word} ${line.scaledCount}${line.tail}`;
      if (line.type === 'header') return `\n${line.text}`;
      return `- ${line.raw}`;
    });
    return [`${title} · ${formatFactor(factor)} (${detail})`, ...body].join('\n');
  };

  const copyScaled = () => {
    navigator.clipboard.writeText(scaledText()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    });
  };

  let ingredientIndex = -1;

  return (
    <div className="max-w-7xl mx-auto my-12 p-6 md:p-8 bg-white rounded-3xl shadow-[0_20px_50px_rgba(234,88,12,0.08)] border border-gray-100 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-50 rounded-full blur-3xl opacity-80 -mr-32 -mt-32 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-lime-50 rounded-full blur-3xl opacity-70 -ml-24 -mb-24 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-100 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-600 to-lime-400 flex items-center justify-center text-white shadow-md shadow-orange-600/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 11h18a9 9 0 0 1-18 0z" />
              <path d="M8 7c0-1.5 1-2 1-3.5" />
              <path d="M12 7c0-1.5 1-2 1-3.5" />
              <path d="M16 7c0-1.5 1-2 1-3.5" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Recipe Scaler</h2>
            <p className="text-gray-500 text-sm font-medium mt-0.5">
              Paste any ingredient list, resize it by servings or pan, and get kitchen-friendly amounts
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setChecked(new Set())}
            className="px-4 py-2 rounded-xl text-sm font-bold text-orange-700 bg-orange-50 border border-orange-100 active:scale-95 transition-all"
          >
            Clear checks
          </button>
          <button
            onClick={copyScaled}
            className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-orange-600 to-orange-500 shadow-md shadow-orange-600/20 active:scale-95 transition-all"
          >
            {copied ? 'Copied' : 'Copy scaled recipe'}
          </button>
        </div>
      </div>

      <div className="relative z-10 mt-5 flex flex-wrap items-center gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.name}
            onClick={() => loadPreset(preset)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95"
            style={chipStyle(activePreset === preset)}
          >
            {preset.name}
          </button>
        ))}
        <span className="mx-1 h-4 w-px bg-gray-200" />
        {UNIT_MODES.map((mode) => (
          <button
            key={mode.id}
            onClick={() => setUnitMode(mode.id)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95"
            style={chipStyle(unitMode === mode.id)}
          >
            {mode.label}
          </button>
        ))}
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-5 gap-4 mt-5">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Scale factor</p>
                <p className="mt-1 text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 tabular-nums">
                  {formatFactor(factor)}
                </p>
              </div>
              <div className="flex rounded-xl bg-white border border-gray-100 p-1">
                {[
                  { id: 'servings', label: 'Servings' },
                  { id: 'pan', label: 'Pan size' },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setScaleBy(option.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      scaleBy === option.id ? 'bg-orange-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {scaleBy === 'servings' ? (
              <>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <Stepper label="Recipe makes" value={baseServings} onChange={setBaseServings} />
                  <Stepper label="You need" value={targetServings} onChange={setTargetServings} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {MULTIPLIERS.map((multiplier) => {
                    const value = Math.max(1, Math.round(baseServings * multiplier));
                    return (
                      <button
                        key={multiplier}
                        onClick={() => setTargetServings(value)}
                        className="px-3 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95"
                        style={
                          targetServings === value
                            ? { background: '#ea580c18', border: '1.5px solid #ea580c66', color: ACCENT }
                            : { background: 'white', border: '1.5px solid #e2e8f0', color: '#64748b' }
                        }
                      >
                        {formatFraction(multiplier)}×
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="mt-5 space-y-4">
                {[
                  { label: 'Recipe pan', value: panFrom, set: setPanFrom },
                  { label: 'Your pan', value: panTo, set: setPanTo },
                ].map((group) => (
                  <div key={group.label}>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{group.label}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {PANS.map((pan) => (
                        <button
                          key={pan.id}
                          onClick={() => group.set(pan.id)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all active:scale-95"
                          style={
                            group.value === pan.id
                              ? { background: '#ea580c18', border: '1.5px solid #ea580c66', color: ACCENT }
                              : { background: 'white', border: '1.5px solid #e2e8f0', color: '#64748b' }
                          }
                        >
                          {pan.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <p className="text-sm font-semibold text-orange-800">
                  {Math.round(fromPan.area)} → {Math.round(toPan.area)} sq in. Batter depth stays the same, so start
                  checking at the original bake time.
                </p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 flex-1 flex flex-col">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Original recipe</p>
              <span className="text-[10px] font-bold text-gray-300">one ingredient per line</span>
            </div>
            <textarea
              value={text}
              onChange={(event) => editText(event.target.value)}
              spellCheck={false}
              rows={11}
              aria-label="Original recipe"
              placeholder={'Serves 4\n2 cups flour\n1 1/2 tsp salt'}
              className="mt-3 w-full flex-1 resize-none rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-3 font-mono text-[13px] leading-6 text-gray-800 outline-none focus:border-orange-300 placeholder:text-gray-300"
            />
          </div>
        </div>

        <div className="lg:col-span-3 rounded-2xl border border-orange-100 bg-orange-50/60 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-orange-700">Scaled ingredients</p>
            <p className="text-xs font-bold text-orange-700/70 tabular-nums">
              {stats.done}/{stats.scaled} gathered
            </p>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-3">
            {[
              { label: 'Scaled', value: stats.scaled },
              { label: 'Converted', value: stats.converted },
              { label: 'Check by hand', value: stats.review },
            ].map((item) => (
              <div key={item.label} className="rounded-xl bg-white border border-orange-100/70 px-3 py-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{item.label}</p>
                <p className="mt-1 text-base font-extrabold text-gray-900 tabular-nums">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-2">
            {lines.map((line, index) => {
              if (line.type === 'header') {
                return (
                  <p key={index} className="pt-3 text-xs font-extrabold uppercase tracking-wider text-orange-800">
                    {line.text}
                  </p>
                );
              }

              if (line.type === 'yield') {
                return (
                  <div key={index} className="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <span className="px-2 py-1 rounded-lg bg-white border border-orange-100 text-orange-700 tabular-nums">
                      {line.word} {line.scaledCount}
                      {line.tail}
                    </span>
                    {line.scaledCount !== line.count && (
                      <span className="text-xs font-semibold text-gray-400">was {line.count}</span>
                    )}
                  </div>
                );
              }

              if (line.type === 'text') {
                return (
                  <div key={index} className="flex items-center gap-3 rounded-xl bg-white/60 border border-dashed border-orange-200 px-3 py-2.5">
                    <span className="text-sm font-medium text-gray-500 flex-1">{line.raw}</span>
                    <span
                      className={`shrink-0 text-[10px] font-bold uppercase tracking-widest ${
                        line.hasNumber ? 'text-rose-600' : 'text-gray-300'
                      }`}
                    >
                      {line.hasNumber ? 'Check' : 'As is'}
                    </span>
                  </div>
                );
              }

              ingredientIndex += 1;
              const key = line.raw + ingredientIndex;
              const done = checked.has(key);
              return (
                <button
                  key={index}
                  onClick={() => toggleChecked(key)}
                  className={`w-full text-left flex items-start gap-3 rounded-xl border px-3 py-2.5 transition-all ${
                    done ? 'bg-white/50 border-orange-100 opacity-60' : 'bg-white border-orange-100/70 hover:border-orange-200'
                  }`}
                >
                  <span
                    className={`mt-0.5 w-5 h-5 shrink-0 rounded-md border-2 flex items-center justify-center text-[11px] font-extrabold ${
                      done ? 'bg-orange-600 border-orange-600 text-white' : 'border-gray-200 text-transparent'
                    }`}
                  >
                    ✓
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className={`text-sm text-gray-900 ${done ? 'line-through' : ''}`}>
                      <span className="font-extrabold text-orange-700 tabular-nums">
                        {line.scaled.amount}
                        {line.scaled.unit ? ` ${line.scaled.unit}` : ''}
                      </span>{' '}
                      <span className="font-semibold">{line.scaled.name}</span>
                    </span>
                    {line.scaled.note && (
                      <span className="block mt-1 text-xs font-semibold text-lime-700">{line.scaled.note}</span>
                    )}
                  </span>
                  <span className="shrink-0 mt-0.5 text-[11px] font-semibold text-gray-400 tabular-nums">
                    was {line.original}
                  </span>
                </button>
              );
            })}
            {!lines.length && <p className="text-sm text-orange-700/70">Paste a recipe on the left to scale it.</p>}
          </div>
        </div>
      </div>

      <p className="relative z-10 mt-4 text-xs font-medium text-gray-400">
        Amounts round to the nearest kitchen fraction. Lines without a leading amount stay unchanged; ones marked
        Check contain numbers you may want to adjust yourself.
      </p>
    </div>
  );
};

export default RecipeScaler;
