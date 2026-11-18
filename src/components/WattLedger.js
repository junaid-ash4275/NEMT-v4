import React, { useEffect, useId, useMemo, useState } from 'react';

const STORAGE_KEY = 'watt-ledger-v1';
const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:ring-offset-2';
const MAX_DEVICES = 8;
const MAX_WATTS = 5000;
const MAX_RATE = 2;

const SWATCHES = [
  'bg-cyan-500',
  'bg-teal-400',
  'bg-sky-400',
  'bg-blue-400',
  'bg-emerald-400',
  'bg-indigo-400',
  'bg-cyan-300',
  'bg-sky-600',
];

const PRESETS = [
  {
    id: 'apartment',
    name: 'Apartment',
    rate: '0.16',
    devices: [
      { id: 'apt-fridge', name: 'Fridge', watts: '150', hours: '24', days: '7' },
      { id: 'apt-lights', name: 'Lights', watts: '60', hours: '5', days: '7' },
      { id: 'apt-laptop', name: 'Laptop', watts: '45', hours: '8', days: '5' },
      { id: 'apt-router', name: 'Router', watts: '10', hours: '24', days: '7' },
    ],
  },
  {
    id: 'office',
    name: 'Home office',
    rate: '0.16',
    devices: [
      { id: 'off-display', name: 'Display', watts: '40', hours: '9', days: '5' },
      { id: 'off-laptop', name: 'Laptop', watts: '55', hours: '9', days: '5' },
      { id: 'off-lamp', name: 'Desk lamp', watts: '9', hours: '9', days: '5' },
      { id: 'off-speaker', name: 'Speakers', watts: '20', hours: '4', days: '5' },
    ],
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    rate: '0.18',
    devices: [
      { id: 'kit-fridge', name: 'Fridge', watts: '180', hours: '24', days: '7' },
      { id: 'kit-kettle', name: 'Kettle', watts: '1500', hours: '0.2', days: '7' },
      { id: 'kit-micro', name: 'Microwave', watts: '1100', hours: '0.2', days: '5' },
      { id: 'kit-dish', name: 'Dishwasher', watts: '1400', hours: '1', days: '4' },
    ],
  },
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function typingRate(value) {
  const cleaned = String(value || '').replace(/[^0-9.]/g, '');
  const dot = cleaned.indexOf('.');
  const body = dot === -1
    ? cleaned.slice(0, 1)
    : `${cleaned.slice(0, dot).slice(0, 1)}.${cleaned.slice(dot + 1).replace(/\./g, '').slice(0, 3)}`;
  if (!body || body === '.') return body;
  const number = Number(body);
  if (Number.isFinite(number) && number > MAX_RATE) return String(MAX_RATE);
  return body;
}

function typingHours(value) {
  const cleaned = String(value || '').replace(/[^0-9.]/g, '');
  const dot = cleaned.indexOf('.');
  const body = dot === -1
    ? cleaned.slice(0, 2)
    : `${cleaned.slice(0, dot).slice(0, 2)}.${cleaned.slice(dot + 1).replace(/\./g, '').slice(0, 1)}`;
  if (!body || body === '.') return body;
  const number = Number(body);
  if (Number.isFinite(number) && number > 24) return '24';
  return body;
}

function typingWatts(value) {
  const digits = String(value || '').replace(/\D/g, '').slice(0, 4);
  if (!digits) return '';
  return String(clamp(Number(digits), 0, MAX_WATTS));
}

function typingDays(value) {
  const digits = String(value || '').replace(/\D/g, '').slice(0, 1);
  if (!digits) return '';
  return String(clamp(Number(digits), 0, 7));
}

function parseRateThousandths(value) {
  const number = Number(String(value ?? '').trim());
  if (!Number.isFinite(number) || number < 0) return 0;
  return clamp(Math.round(number * 1000), 0, MAX_RATE * 1000);
}

function parseWatts(value) {
  const number = Number(String(value ?? '').replace(/\D/g, ''));
  if (!Number.isFinite(number)) return 0;
  return clamp(Math.round(number), 0, MAX_WATTS);
}

function parseHoursTenths(value) {
  const number = Number(String(value ?? '').trim());
  if (!Number.isFinite(number) || number < 0) return 0;
  return clamp(Math.round(number * 10), 0, 240);
}

function parseDays(value) {
  const number = Number(String(value ?? '').replace(/\D/g, ''));
  if (!Number.isFinite(number)) return 0;
  return clamp(Math.round(number), 0, 7);
}

function formatRate(thousandths) {
  const rounded = Math.round(thousandths) / 1000;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
}

function formatHours(tenths) {
  const value = tenths / 10;
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function money(cents) {
  if (!Number.isFinite(cents)) return '—';
  return (cents / 100).toLocaleString(undefined, { style: 'currency', currency: 'USD' });
}

function rateLabel(thousandths) {
  return (thousandths / 1000).toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 3,
  });
}

function formatKwh(wattHours) {
  if (!Number.isFinite(wattHours) || wattHours <= 0) return '0';
  const kwh = wattHours / 1000;
  if (kwh >= 100) return kwh.toFixed(0);
  if (kwh >= 10) return kwh.toFixed(1);
  return kwh.toFixed(2);
}

function monthlyWattHours(watts, hoursTenths, days) {
  return (watts * hoursTenths * days * 365) / (10 * 7 * 12);
}

function monthlyCents(watts, hoursTenths, days, rateThousandths) {
  const numerator = watts * hoursTenths * days * 365 * rateThousandths;
  const denominator = 1000 * 10 * 7 * 12 * 10;
  return Math.round(numerator / denominator);
}

function uniqueDevices(devices) {
  const seen = new Set();
  return devices.map((device, index) => {
    if (!seen.has(device.id)) {
      seen.add(device.id);
      return device;
    }
    const id = `device-dup-${index + 1}`;
    seen.add(id);
    return { ...device, id };
  });
}

function sanitizeDevice(device, index) {
  if (!device || typeof device !== 'object') return null;
  const id = /^[a-z0-9-]{1,40}$/i.test(String(device.id || '')) ? String(device.id) : `device-${index + 1}`;
  const days = parseDays(device.days);
  return {
    id,
    name: String(device.name || '').trim().slice(0, 28),
    watts: String(parseWatts(device.watts)),
    hours: formatHours(parseHoursTenths(device.hours)),
    days: String(days),
  };
}

function blankDevice(index) {
  return {
    id: `device-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    name: `Device ${index}`,
    watts: '60',
    hours: '2',
    days: '7',
  };
}

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    const devices = uniqueDevices(
      (Array.isArray(data.devices) ? data.devices : []).map(sanitizeDevice).filter(Boolean).slice(0, MAX_DEVICES),
    );
    if (!devices.length) return null;
    return {
      rate: formatRate(parseRateThousandths(data.rate)),
      devices,
    };
  } catch {
    return null;
  }
}

function planFor(rateThousandths, devices) {
  const rows = devices.map((device) => {
    const watts = parseWatts(device.watts);
    const hoursTenths = parseHoursTenths(device.hours);
    const days = parseDays(device.days);
    const cents = monthlyCents(watts, hoursTenths, days, rateThousandths);
    return {
      ...device,
      watts,
      hoursTenths,
      days,
      cents,
      yearlyCents: cents * 12,
      wattHours: monthlyWattHours(watts, hoursTenths, days),
    };
  });
  const sum = rows.reduce((total, row) => total + row.cents, 0);
  const yearly = rows.reduce((total, row) => total + row.yearlyCents, 0);
  const largest = rows.length
    ? rows.reduce((best, row) => (row.cents > best.cents ? row : best))
    : null;
  return { rows, sum, yearly, largest };
}

function labelFor(row) {
  return row.name.trim() || 'Unnamed';
}

function verdictFor(plan, rateThousandths) {
  if (!plan.rows.length) return 'Add a device to see what it adds to the bill.';
  if (rateThousandths === 0) return 'Set a price per kilowatt-hour to turn this usage into dollars.';
  if (plan.sum === 0) return 'Add wattage and hours so the estimate has something to measure.';
  const leader = plan.largest;
  const share = Math.round((leader.cents / plan.sum) * 100);
  const duty = leader.hoursTenths === 240 && leader.days === 7 ? ' It runs all day, every day.' : '';
  return `${labelFor(leader)} is the largest draw at ${money(leader.cents)} a month, about ${share}% of this list.${duty}`;
}

function summaryFor(plan, rateThousandths) {
  const lines = [
    'Watt Ledger',
    `Rate ${rateLabel(rateThousandths)} / kWh`,
    '',
    ...plan.rows.map((row) => {
      const hours = formatHours(row.hoursTenths);
      return `${labelFor(row)} — ${row.watts} W · ${hours}h · ${row.days} days — ${money(row.cents)} / month`;
    }),
    '',
    `Monthly ${money(plan.sum)} · Yearly ${money(plan.yearly)}`,
  ];
  return lines.join('\n');
}

function matchesPreset(setup, preset) {
  if (setup.devices.length !== preset.devices.length) return false;
  if (parseRateThousandths(setup.rate) !== parseRateThousandths(preset.rate)) return false;
  return setup.devices.every((device, index) => {
    const sample = preset.devices[index];
    return device.name === sample.name
      && parseWatts(device.watts) === parseWatts(sample.watts)
      && parseHoursTenths(device.hours) === parseHoursTenths(sample.hours)
      && parseDays(device.days) === parseDays(sample.days);
  });
}

export default function WattLedger() {
  const labelId = useId();
  const saved = useMemo(() => loadSaved(), []);
  const [rate, setRate] = useState(() => saved?.rate || PRESETS[0].rate);
  const [devices, setDevices] = useState(() => saved?.devices || PRESETS[0].devices);
  const [status, setStatus] = useState('');

  useEffect(() => {
    try {
      const payload = {
        rate: formatRate(parseRateThousandths(rate)),
        devices: uniqueDevices(devices.map(sanitizeDevice).filter(Boolean)),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage failures so the estimate still works for this visit.
    }
  }, [rate, devices]);

  const rateThousandths = parseRateThousandths(rate);
  const plan = useMemo(() => planFor(rateThousandths, devices), [rateThousandths, devices]);
  const verdict = verdictFor(plan, rateThousandths);
  const setup = { rate, devices };
  const barTotal = plan.sum || 1;

  const updateDevice = (id, field, value) => {
    setDevices((current) => current.map((device) => (device.id === id ? { ...device, [field]: value } : device)));
    setStatus('');
  };

  const addDevice = () => {
    setDevices((current) => (current.length >= MAX_DEVICES ? current : [...current, blankDevice(current.length + 1)]));
    setStatus('');
  };

  const removeDevice = (id) => {
    setDevices((current) => (current.length <= 1 ? current : current.filter((device) => device.id !== id)));
    setStatus('');
  };

  const applyPreset = (preset) => {
    setRate(preset.rate);
    setDevices(preset.devices.map((device) => ({ ...device })));
    setStatus('');
  };

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(summaryFor(plan, rateThousandths));
      setStatus('Estimate copied.');
    } catch {
      setStatus('Clipboard is blocked in this browser.');
    }
  };

  return (
    <section aria-labelledby={labelId} className="max-w-7xl mx-auto my-12 p-6 md:p-8 bg-white rounded-3xl shadow-[0_20px_50px_rgba(8,145,178,0.08)] border border-gray-100 overflow-hidden relative">
      <div aria-hidden="true" className="absolute top-0 right-0 w-96 h-96 bg-cyan-50 rounded-full blur-3xl opacity-80 -mr-32 -mt-32 pointer-events-none" />
      <div aria-hidden="true" className="absolute bottom-0 left-0 w-80 h-80 bg-sky-50 rounded-full blur-3xl opacity-70 -ml-24 -mb-24 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-100 gap-4">
        <div className="flex items-center gap-3">
          <div aria-hidden="true" className="w-10 h-10 shrink-0 rounded-2xl bg-gradient-to-tr from-cyan-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-cyan-600/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <div>
            <h2 id={labelId} className="text-3xl font-extrabold text-gray-900 tracking-tight">Watt Ledger</h2>
            <p className="text-gray-500 text-sm font-medium mt-0.5">Price each device from its watts, hours, and your rate per kilowatt-hour</p>
          </div>
        </div>
        <button type="button" onClick={copySummary} className={`self-start shrink-0 px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-cyan-600 to-sky-500 shadow-md shadow-cyan-600/20 active:scale-95 transition-all ${FOCUS}`}>
          {status === 'Estimate copied.' ? 'Copied' : 'Copy estimate'}
        </button>
      </div>

      <div className="relative z-10 mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-cyan-100 bg-cyan-50/70 px-4 py-3 min-w-0">
          <div className="text-lg sm:text-2xl font-black tabular-nums text-cyan-950 truncate">{money(plan.sum)}</div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-cyan-800/80">Monthly</div>
        </div>
        <div className="rounded-2xl border border-cyan-100 bg-cyan-50/70 px-4 py-3 min-w-0">
          <div className="text-lg sm:text-2xl font-black tabular-nums text-cyan-950 truncate">{money(plan.yearly)}</div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-cyan-800/80">Yearly</div>
        </div>
        <div className="rounded-2xl border border-cyan-100 bg-cyan-50/70 px-4 py-3 min-w-0">
          <div className="text-lg sm:text-2xl font-black tabular-nums text-cyan-950 truncate">{plan.largest && plan.largest.cents > 0 ? money(plan.largest.cents) : '—'}</div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-cyan-800/80">{plan.largest && plan.largest.cents > 0 ? `${labelFor(plan.largest)} leads` : 'Largest device'}</div>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        <div className="lg:col-span-5 min-w-0 space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 md:p-5 space-y-4">
            <div>
              <div className="text-sm font-semibold text-gray-600">Start from</div>
              <div role="group" aria-label="Usage presets" className="mt-2 flex flex-wrap gap-2">
                {PRESETS.map((preset) => {
                  const active = matchesPreset(setup, preset);
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => applyPreset(preset)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${FOCUS} ${active ? 'bg-cyan-600 border-cyan-600 text-white' : 'bg-white border-gray-200 text-gray-500'}`}
                    >
                      {preset.name}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label htmlFor={`${labelId}-rate`} className="text-sm font-semibold text-gray-600">Price per kWh</label>
              <div className="mt-2 flex items-center rounded-xl border border-gray-200 bg-white px-3 focus-within:ring-2 focus-within:ring-cyan-600 focus-within:ring-offset-2">
                <span className="text-sm font-bold text-gray-400">$</span>
                <input
                  id={`${labelId}-rate`}
                  inputMode="decimal"
                  value={rate}
                  onChange={(event) => { setRate(typingRate(event.target.value)); setStatus(''); }}
                  className="w-full bg-transparent py-2.5 pl-1 text-sm font-semibold text-gray-800 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-4 md:p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-cyan-800">Devices</h3>
              <button
                type="button"
                onClick={addDevice}
                disabled={devices.length >= MAX_DEVICES}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold text-cyan-700 border border-cyan-200 disabled:opacity-40 ${FOCUS}`}
              >
                Add device
              </button>
            </div>
            <ul className="mt-3 space-y-3">
              {devices.map((device, index) => (
                <li key={device.id} className="rounded-xl border border-gray-100 bg-gray-50/80 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span aria-hidden="true" className={`h-2.5 w-2.5 shrink-0 rounded-full ${SWATCHES[index % SWATCHES.length]}`} />
                      <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Device {index + 1}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDevice(device.id)}
                      disabled={devices.length <= 1}
                      className={`text-xs font-bold text-gray-400 disabled:opacity-40 ${FOCUS}`}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <input
                      aria-label={`Name of device ${index + 1}`}
                      value={device.name}
                      maxLength={28}
                      onChange={(event) => updateDevice(device.id, 'name', event.target.value)}
                      className={`col-span-2 sm:col-span-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 ${FOCUS}`}
                    />
                    <input
                      aria-label={`Watts of device ${index + 1}`}
                      inputMode="numeric"
                      value={device.watts}
                      onChange={(event) => updateDevice(device.id, 'watts', typingWatts(event.target.value))}
                      className={`w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 ${FOCUS}`}
                    />
                    <input
                      aria-label={`Hours per day for device ${index + 1}`}
                      inputMode="decimal"
                      value={device.hours}
                      onChange={(event) => updateDevice(device.id, 'hours', typingHours(event.target.value))}
                      className={`w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 ${FOCUS}`}
                    />
                    <input
                      aria-label={`Days per week for device ${index + 1}`}
                      inputMode="numeric"
                      value={device.days}
                      onChange={(event) => updateDevice(device.id, 'days', typingDays(event.target.value))}
                      className={`w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 ${FOCUS}`}
                    />
                  </div>
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">Name · watts · hours / day · days / week</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-7 min-w-0 space-y-4">
          <div className="rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-4 md:px-5">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-cyan-800/80">How it lands</h3>
            <p className="mt-2 text-sm font-medium leading-relaxed text-cyan-950">{verdict}</p>
            <div
              className="mt-4 flex h-3 overflow-hidden rounded-full bg-white"
              role="img"
              aria-label={plan.rows.map((row) => `${labelFor(row)} ${money(row.cents)}`).join(', ')}
            >
              {plan.rows.map((row, index) => (
                <div
                  key={row.id}
                  className={`h-full ${SWATCHES[index % SWATCHES.length]}`}
                  style={{ width: `${(row.cents / barTotal) * 100}%` }}
                />
              ))}
            </div>
            <p className="mt-3 text-xs font-medium text-cyan-900/70">
              A month here is 365 ÷ 12 days, so the yearly figure is twelve of these months. Each device is rounded to the cent.
            </p>
          </div>

          <ul className="space-y-3">
            {plan.rows.map((row, index) => {
              const width = plan.sum ? Math.max(4, Math.round((row.cents / plan.sum) * 100)) : 0;
              return (
                <li key={row.id} className="rounded-2xl border border-gray-100 bg-white p-4 md:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span aria-hidden="true" className={`h-2.5 w-2.5 shrink-0 rounded-full ${SWATCHES[index % SWATCHES.length]}`} />
                        <h3 className="truncate text-base font-bold text-gray-900">{labelFor(row)}</h3>
                      </div>
                      <p className="mt-1 text-xs font-medium text-gray-500">
                        {row.watts} W · {formatHours(row.hoursTenths)} h/day · {row.days} days/week
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black tabular-nums tracking-tight text-gray-900">{money(row.cents)}</div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        {plan.sum ? Math.round((row.cents / plan.sum) * 100) : 0}% of the list
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-cyan-50">
                    <div className={`h-full ${SWATCHES[index % SWATCHES.length]}`} style={{ width: `${row.cents > 0 ? width : 0}%` }} />
                  </div>
                  <p className="mt-3 text-xs font-medium text-gray-500">
                    {formatKwh(row.wattHours)} kWh this month · {money(row.yearlyCents)} over a year
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <p role="status" className="relative z-10 mt-4 min-h-5 text-sm font-medium text-cyan-800">{status}</p>
    </section>
  );
}
