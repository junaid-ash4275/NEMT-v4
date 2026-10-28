import React, { useMemo, useState } from 'react';

const ACCENT = '#0f766e';

const MONTH_NAMES = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const DOW_NAMES = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const ALIASES = {
  '@yearly': '0 0 1 1 *',
  '@annually': '0 0 1 1 *',
  '@monthly': '0 0 1 * *',
  '@weekly': '0 0 * * 0',
  '@daily': '0 0 * * *',
  '@midnight': '0 0 * * *',
  '@hourly': '0 * * * *',
};

const PRESETS = [
  { label: 'Every 15 min', expr: '*/15 * * * *' },
  { label: 'Hourly', expr: '0 * * * *' },
  { label: 'Daily 9:00', expr: '0 9 * * *' },
  { label: 'Weekdays 9:00', expr: '0 9 * * 1-5' },
  { label: '9am & 5pm', expr: '0 9,17 * * 1-5' },
  { label: 'Monday 8:30', expr: '30 8 * * 1' },
  { label: 'Weekends noon', expr: '0 12 * * 0,6' },
  { label: '1st of month', expr: '0 0 1 * *' },
  { label: 'Quarterly', expr: '0 0 1 */3 *' },
];

const FIELD_META = [
  { key: 'minute', label: 'Minute', min: 0, max: 59, chips: ['*', '0', '*/5', '*/15', '*/30', '0,30'] },
  { key: 'hour', label: 'Hour', min: 0, max: 23, chips: ['*', '0', '9', '9-17', '*/2', '9,17'] },
  { key: 'dom', label: 'Day', min: 1, max: 31, chips: ['*', '1', '15', '1,15', '1-7'] },
  { key: 'month', label: 'Month', min: 1, max: 12, chips: ['*', '1', '*/3', '1,4,7,10', 'jun-aug'] },
  { key: 'dow', label: 'Weekday', min: 0, max: 7, chips: ['*', '1-5', '0,6', 'mon', 'mon,wed,fri'] },
];

function nameToNumber(token, names) {
  const lower = token.toLowerCase();
  const idx = names.indexOf(lower);
  return idx === -1 ? NaN : idx + (names === MONTH_NAMES ? 1 : 0);
}

function parseAtom(token, min, max, names) {
  if (/^\d+$/.test(token)) {
    const n = parseInt(token, 10);
    if (names === DOW_NAMES && n === 7) return 0;
    return n;
  }
  if (names) {
    const named = nameToNumber(token, names);
    if (!Number.isNaN(named)) return named;
  }
  return NaN;
}

function parseField(expr, min, max, names) {
  const values = new Set();
  const chunks = String(expr).trim().split(',');
  if (!chunks.length || chunks.some((c) => !c)) {
    throw new Error('empty field');
  }

  chunks.forEach((chunk) => {
    const [rangePart, stepPart] = chunk.split('/');
    if (chunk.split('/').length > 2) throw new Error('bad step');
    const step = stepPart === undefined ? 1 : parseInt(stepPart, 10);
    if (!step || step < 1 || Number.isNaN(step)) throw new Error('bad step');

    let start;
    let end;
    if (rangePart === '*') {
      start = min;
      end = max === 7 ? 6 : max;
    } else if (rangePart.includes('-')) {
      const [a, b] = rangePart.split('-');
      start = parseAtom(a, min, max, names);
      end = parseAtom(b, min, max, names);
    } else {
      start = parseAtom(rangePart, min, max, names);
      end = start;
    }

    const upper = max === 7 ? 7 : max;
    if ([start, end].some((n) => Number.isNaN(n) || n < min || n > upper) || start > end) {
      throw new Error('out of range');
    }
    for (let n = start; n <= end; n += step) {
      const value = names === DOW_NAMES && n === 7 ? 0 : n;
      if (value >= min && value <= (max === 7 ? 6 : max)) values.add(value);
    }
  });

  if (!values.size) throw new Error('empty set');
  return values;
}

function expandAlias(raw) {
  const trimmed = raw.trim().replace(/\s+/g, ' ');
  const alias = ALIASES[trimmed.toLowerCase()];
  return alias || trimmed;
}

function parseCron(raw) {
  const expr = expandAlias(raw);
  const parts = expr.split(' ');
  if (parts.length !== 5) {
    throw new Error('Use 5 fields: minute hour day month weekday');
  }
  const [minute, hour, dom, month, dow] = parts;
  return {
    expr,
    parts,
    minute: parseField(minute, 0, 59),
    hour: parseField(hour, 0, 23),
    dom: parseField(dom, 1, 31),
    month: parseField(month, 1, 12, MONTH_NAMES),
    dow: parseField(dow, 0, 7, DOW_NAMES),
    domStar: dom === '*',
    dowStar: dow === '*',
  };
}

function dayMatches(date, cron) {
  if (!cron.month.has(date.getMonth() + 1)) return false;
  const domOk = cron.dom.has(date.getDate());
  const dowOk = cron.dow.has(date.getDay());
  if (cron.domStar && cron.dowStar) return true;
  if (cron.domStar) return dowOk;
  if (cron.dowStar) return domOk;
  return domOk || dowOk;
}

function nextRuns(cron, count, from = new Date()) {
  const runs = [];
  const cursor = new Date(from);
  cursor.setSeconds(0, 0);
  cursor.setMinutes(cursor.getMinutes() + 1);

  const day = new Date(cursor);
  day.setHours(0, 0, 0, 0);
  const limit = new Date(day);
  limit.setFullYear(limit.getFullYear() + 2);

  const hours = [...cron.hour].sort((a, b) => a - b);
  const minutes = [...cron.minute].sort((a, b) => a - b);

  while (runs.length < count && day < limit) {
    if (dayMatches(day, cron)) {
      for (let hi = 0; hi < hours.length; hi += 1) {
        for (let mi = 0; mi < minutes.length; mi += 1) {
          const t = new Date(day);
          t.setHours(hours[hi], minutes[mi], 0, 0);
          if (t >= cursor) {
            runs.push(t);
            if (runs.length >= count) return runs;
          }
        }
      }
    }
    day.setDate(day.getDate() + 1);
  }
  return runs;
}

function weekGrid(cron, from = new Date()) {
  const start = new Date(from);
  start.setHours(0, 0, 0, 0);
  const days = [];
  for (let d = 0; d < 7; d += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + d);
    const hours = Array(24).fill(0);
    if (dayMatches(date, cron)) {
      cron.hour.forEach((h) => {
        hours[h] = cron.minute.size;
      });
    }
    days.push({ date, hours, total: hours.reduce((a, b) => a + b, 0) });
  }
  return days;
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function formatTime(date) {
  return date.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function relative(date, now) {
  const mins = Math.round((date - now) / 60000);
  if (mins < 1) return 'under a minute';
  if (mins < 60) return `in ${mins} min`;
  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  if (hours < 48) return rem ? `in ${hours}h ${rem}m` : `in ${hours}h`;
  const days = Math.floor(hours / 24);
  return `in ${days}d ${hours % 24}h`;
}

function listPhrase(values, names) {
  const sorted = [...values].sort((a, b) => a - b);
  if (names) return sorted.map((n) => names[n]).join(', ');
  return sorted.join(', ');
}

function describe(cron) {
  const [minute, hour, dom, month, dow] = cron.parts;
  let when;

  if (minute === '*' && hour === '*') when = 'Every minute';
  else if (/^\*\/\d+$/.test(minute) && hour === '*') when = `Every ${minute.slice(2)} minutes`;
  else if (hour === '*' && /^\d+$/.test(minute)) when = `Every hour at :${pad(minute)}`;
  else if (/^\d+$/.test(hour) && /^\d+$/.test(minute)) when = `At ${pad(hour)}:${pad(minute)}`;
  else if (/^\d+(,\d+)+$/.test(hour) && /^\d+$/.test(minute)) {
    when = `At ${[...cron.hour].sort((a, b) => a - b).map((h) => `${pad(h)}:${pad(minute)}`).join(' and ')}`;
  } else when = `Minutes ${minute}, hours ${hour}`;

  let day = 'every day';
  if (dow === '1-5' && cron.domStar) day = 'on weekdays';
  else if ((dow === '0,6' || dow === '6,0') && cron.domStar) day = 'on weekends';
  else if (!cron.dowStar && cron.domStar) day = `on ${listPhrase(cron.dow, ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'])}`;
  else if (cron.dowStar && !cron.domStar && dom !== '*') day = `on day ${listPhrase(cron.dom)} of the month`;
  else if (!cron.dowStar && !cron.domStar) day = `on day ${listPhrase(cron.dom)} or ${listPhrase(cron.dow, DAY_LABELS)}`;

  let monthBit = '';
  if (month !== '*') monthBit = ` in ${listPhrase(cron.month, ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']).replace(/^, /, '')}`;

  return `${when} ${day}${monthBit}.`;
}

const CronScheduleStudio = () => {
  const [raw, setRaw] = useState('0 9 * * 1-5');
  const [copied, setCopied] = useState(false);
  const [now] = useState(() => new Date());

  const parsed = useMemo(() => {
    try {
      return { cron: parseCron(raw), error: null };
    } catch (err) {
      return { cron: null, error: err.message || 'Invalid expression' };
    }
  }, [raw]);

  const cron = parsed.cron;
  const runs = useMemo(() => (cron ? nextRuns(cron, 8, now) : []), [cron, now]);
  const days = useMemo(() => (cron ? weekGrid(cron, now) : []), [cron, now]);
  const weekTotal = days.reduce((sum, d) => sum + d.total, 0);

  const applyExpr = (expr) => setRaw(expandAlias(expr));

  const setField = (index, value) => {
    const base = cron ? [...cron.parts] : expandAlias(raw).split(' ');
    if (base.length !== 5) return;
    base[index] = value.trim() || '*';
    setRaw(base.join(' '));
  };

  const copyExpr = () => {
    const text = cron ? cron.expr : raw.trim();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    });
  };

  return (
    <div className="max-w-7xl mx-auto my-12 p-6 md:p-8 bg-white rounded-3xl shadow-[0_20px_50px_rgba(15,118,110,0.08)] border border-gray-100 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-50 rounded-full blur-3xl opacity-70 -mr-32 -mt-32 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-50 rounded-full blur-3xl opacity-50 -ml-24 -mb-24 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-100 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-700 to-amber-400 flex items-center justify-center text-white shadow-md shadow-teal-600/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <polyline points="12 7 12 12 15.5 14" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Cron Schedule Studio</h2>
            <p className="text-gray-500 text-sm font-medium mt-0.5">
              Build a crontab, read it in plain English, and see the week it actually fires
            </p>
          </div>
        </div>
        <button
          onClick={copyExpr}
          className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-teal-700 to-teal-500 shadow-md shadow-teal-600/20 active:scale-95 transition-all"
        >
          {copied ? 'Copied' : 'Copy expression'}
        </button>
      </div>

      <div className="relative z-10 mt-5 flex flex-wrap gap-2">
        {PRESETS.map((preset) => {
          const active = cron && cron.expr === preset.expr;
          return (
            <button
              key={preset.expr}
              onClick={() => applyExpr(preset.expr)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95"
              style={
                active
                  ? { background: '#0f766e18', border: '1.5px solid #0f766e66', color: ACCENT }
                  : { background: 'transparent', border: '1.5px solid #e2e8f0', color: '#94a3b8' }
              }
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      <div className="relative z-10 mt-4 bg-slate-900 rounded-2xl px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-teal-300 shrink-0">crontab</span>
        <input
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          spellCheck={false}
          className="flex-1 bg-transparent text-white font-mono text-lg font-bold outline-none placeholder:text-slate-600"
          placeholder="0 9 * * 1-5"
        />
        <span className="text-[10px] font-semibold text-slate-500 shrink-0">local time</span>
      </div>

      {parsed.error ? (
        <p className="relative z-10 mt-3 text-sm font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
          {parsed.error}
        </p>
      ) : (
        <p className="relative z-10 mt-3 text-sm font-semibold text-teal-800 bg-teal-50 border border-teal-100 rounded-xl px-3 py-2">
          {describe(cron)}
          {!cron.domStar && !cron.dowStar && (
            <span className="block text-xs font-medium text-teal-700/80 mt-1">
              Day and weekday are both set, so the job runs when either one matches.
            </span>
          )}
        </p>
      )}

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 mt-5">
        <div className="lg:col-span-4 space-y-3">
          {FIELD_META.map((field, index) => (
            <div key={field.key} className="bg-gray-50/90 rounded-2xl p-3 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-teal-700">{field.label}</label>
                <span className="text-[10px] font-mono text-gray-400">{field.min}–{field.max === 7 ? 6 : field.max}</span>
              </div>
              <input
                value={cron ? cron.parts[index] : ''}
                onChange={(e) => setField(index, e.target.value)}
                disabled={!cron && expandAlias(raw).split(' ').length !== 5}
                className="w-full bg-white border border-teal-100 rounded-xl px-3 py-1.5 text-sm font-mono font-bold text-gray-800 outline-none focus:ring-2 focus:ring-teal-200"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {field.chips.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setField(index, chip)}
                    className="px-2 py-0.5 rounded-lg text-[10px] font-bold font-mono border border-gray-200 text-gray-500 bg-white hover:border-teal-300 hover:text-teal-700 transition-colors"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-5 bg-gray-50/80 rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Next 7 days</h3>
            <span className="text-xs font-bold text-teal-700">{cron ? `${weekTotal} runs` : '—'}</span>
          </div>
          {cron ? (
            <div className="overflow-x-auto">
              <div className="grid gap-1 min-w-[280px]" style={{ gridTemplateColumns: '28px repeat(7, 1fr)' }}>
                <div />
                {days.map((day) => (
                  <div key={day.date.toDateString()} className="text-center">
                    <div className="text-[10px] font-bold text-gray-500">{DAY_LABELS[day.date.getDay()]}</div>
                    <div className="text-[10px] font-mono text-gray-400">{day.date.getDate()}</div>
                  </div>
                ))}
                {Array.from({ length: 24 }, (_, hour) => (
                  <React.Fragment key={hour}>
                    <div className="text-[9px] font-mono text-gray-400 text-right pr-1 leading-4">{pad(hour)}</div>
                    {days.map((day) => {
                      const count = day.hours[hour];
                      const opacity = count === 0 ? 0 : 0.18 + Math.min(count / 12, 1) * 0.82;
                      return (
                        <div
                          key={`${day.date.toDateString()}-${hour}`}
                          title={count ? `${DAY_LABELS[day.date.getDay()]} ${day.date.getDate()} · ${count} run${count === 1 ? '' : 's'} in the ${pad(hour)}:00 hour` : 'No runs'}
                          className="h-4 rounded-sm"
                          style={{
                            background: count ? `rgba(15, 118, 110, ${opacity})` : '#e2e8f0',
                          }}
                        />
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Fix the expression to preview the week.</p>
          )}
        </div>

        <div className="lg:col-span-3 space-y-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Next run</h3>
            {runs[0] ? (
              <>
                <p className="text-2xl font-extrabold text-gray-900 tracking-tight">{relative(runs[0], now)}</p>
                <p className="text-xs font-medium text-gray-500 mt-1">{formatTime(runs[0])}</p>
              </>
            ) : (
              <p className="text-sm text-gray-400">No runs in the next 2 years.</p>
            )}
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Upcoming</h3>
            <ul className="space-y-2">
              {runs.map((run) => (
                <li key={run.getTime()} className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-gray-700">{formatTime(run)}</span>
                  <span className="font-mono text-teal-700 shrink-0">{relative(run, now)}</span>
                </li>
              ))}
              {!runs.length && <li className="text-xs text-gray-400">Nothing scheduled.</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CronScheduleStudio;
