import React, { useEffect, useId, useMemo, useState } from 'react';

const STORAGE_KEY = 'key-share-v1';
const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 focus-visible:ring-offset-2';
const MAX_ROOMS = 6;
const MAX_RENT = 100000;
const MAX_BILLS = 20000;
const MAX_FEET = 5000;

const SWATCHES = [
  'bg-orange-500',
  'bg-amber-400',
  'bg-rose-400',
  'bg-stone-500',
  'bg-yellow-500',
  'bg-red-400',
];

const PRESETS = [
  {
    id: 'classic',
    name: '3 bedroom',
    rent: '2400',
    bills: '180',
    common: '420',
    rooms: [
      { id: 'classic-1', room: 'Primary', person: 'Maya', feet: '180' },
      { id: 'classic-2', room: 'Middle', person: 'Leo', feet: '140' },
      { id: 'classic-3', room: 'Nook', person: 'Noor', feet: '100' },
    ],
  },
  {
    id: 'house',
    name: 'House',
    rent: '3100',
    bills: '240',
    common: '680',
    rooms: [
      { id: 'house-1', room: 'Primary', person: 'Ava', feet: '220' },
      { id: 'house-2', room: 'Office', person: 'Ben', feet: '120' },
      { id: 'house-3', room: 'Guest', person: 'Cho', feet: '110' },
      { id: 'house-4', room: 'Loft', person: 'Sam', feet: '90' },
    ],
  },
  {
    id: 'twins',
    name: 'Even twins',
    rent: '1800',
    bills: '120',
    common: '300',
    rooms: [
      { id: 'twins-1', room: 'East', person: 'Jules', feet: '140' },
      { id: 'twins-2', room: 'West', person: 'Rin', feet: '140' },
    ],
  },
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function roundTo(value, places) {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

function formatDecimal(value, places) {
  if (!Number.isFinite(value)) return '0';
  const rounded = roundTo(value, places);
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(places).replace(/0+$/, '').replace(/\.$/, '');
}

function typingDecimal(value, places) {
  const cleaned = String(value || '').replace(/[^0-9.]/g, '');
  const dot = cleaned.indexOf('.');
  if (dot === -1) return cleaned.slice(0, 6);
  return `${cleaned.slice(0, dot).slice(0, 6)}.${cleaned.slice(dot + 1).replace(/\./g, '').slice(0, places)}`;
}

function typingFeet(value) {
  return String(value || '').replace(/\D/g, '').slice(0, 4);
}

function parseMoney(value, max) {
  const number = Number(String(value ?? '').trim());
  if (!Number.isFinite(number) || number < 0) return 0;
  return clamp(Math.round(number * 100), 0, max * 100);
}

function parseFeet(value) {
  const number = Number(String(value ?? '').replace(/\D/g, ''));
  if (!Number.isFinite(number)) return 0;
  return clamp(Math.round(number), 0, MAX_FEET);
}

function money(cents) {
  if (!Number.isFinite(cents)) return '—';
  return (cents / 100).toLocaleString(undefined, { style: 'currency', currency: 'USD' });
}

function allocate(total, weights) {
  const count = weights.length;
  if (!count || total <= 0) return Array(count).fill(0);
  const sum = weights.reduce((totalWeight, weight) => totalWeight + weight, 0);
  if (sum <= 0) return Array(count).fill(0);
  const shares = weights.map((weight) => Math.floor((total * weight) / sum));
  let leftover = total - shares.reduce((totalShare, share) => totalShare + share, 0);
  const order = weights
    .map((weight, index) => ({ index, remainder: (total * weight) % sum }))
    .sort((a, b) => b.remainder - a.remainder || a.index - b.index);
  for (let step = 0; step < leftover; step += 1) shares[order[step].index] += 1;
  return shares;
}

function uniqueRooms(rooms) {
  const seen = new Set();
  return rooms.map((room, index) => {
    if (!seen.has(room.id)) {
      seen.add(room.id);
      return room;
    }
    const id = `room-dup-${index + 1}`;
    seen.add(id);
    return { ...room, id };
  });
}

function sanitizeRoom(room, index) {
  if (!room || typeof room !== 'object') return null;
  const roomName = String(room.room || '').trim().slice(0, 24);
  const person = String(room.person || '').trim().slice(0, 24);
  if (!roomName && !person) return null;
  const id = /^[a-z0-9-]{1,40}$/i.test(String(room.id || '')) ? String(room.id) : `room-${index + 1}`;
  return {
    id,
    room: roomName || `Room ${index + 1}`,
    person: person || `Person ${index + 1}`,
    feet: String(parseFeet(room.feet)),
  };
}

function blankRoom(index) {
  return {
    id: `room-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    room: `Room ${index}`,
    person: `Person ${index}`,
    feet: '120',
  };
}

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    const rooms = uniqueRooms(
      (Array.isArray(data.rooms) ? data.rooms : []).map(sanitizeRoom).filter(Boolean).slice(0, MAX_ROOMS),
    );
    if (rooms.length < 2) return null;
    return {
      rent: formatDecimal(parseMoney(data.rent, MAX_RENT) / 100, 2),
      bills: formatDecimal(parseMoney(data.bills, MAX_BILLS) / 100, 2),
      common: String(parseFeet(data.common)),
      rooms,
    };
  } catch {
    return null;
  }
}

function planFor(rentCents, billCents, commonFeet, rooms) {
  const count = rooms.length;
  const feet = rooms.map((room) => parseFeet(room.feet));
  const privateSum = feet.reduce((total, size) => total + size, 0);
  const area = privateSum + commonFeet;
  let commonRent = 0;
  let privateRent = rentCents;
  if (area > 0 && commonFeet > 0 && privateSum > 0) {
    commonRent = Math.floor((rentCents * commonFeet) / area);
    privateRent = rentCents - commonRent;
  } else if (privateSum === 0) {
    commonRent = rentCents;
    privateRent = 0;
  }
  const privateShares = privateSum > 0 ? allocate(privateRent, feet) : rooms.map(() => 0);
  const commonShares = allocate(commonRent, rooms.map(() => 1));
  const billShares = allocate(billCents, rooms.map(() => 1));
  const rows = rooms.map((room, index) => {
    const totalCents = privateShares[index] + commonShares[index] + billShares[index];
    return {
      ...room,
      feet: feet[index],
      privateCents: privateShares[index],
      commonCents: commonShares[index],
      billCents: billShares[index],
      totalCents,
    };
  });
  const totals = rows.map((row) => row.totalCents);
  const max = totals.length ? Math.max(...totals) : 0;
  const min = totals.length ? Math.min(...totals) : 0;
  return {
    rows,
    count,
    privateSum,
    commonFeet,
    commonRent,
    privateRent,
    sum: rentCents + billCents,
    spread: max - min,
  };
}

function verdictFor(plan) {
  if (!plan.rows.length) return 'Add two rooms to split the rent.';
  if (plan.sum === 0) return 'Add rent or shared bills to see what each person pays.';
  const label = (row) => row.person.trim() || 'Someone';
  const ranked = [...plan.rows].sort((a, b) => b.totalCents - a.totalCents || label(a).localeCompare(label(b)));
  const high = ranked[0];
  const low = ranked[ranked.length - 1];
  if (plan.spread <= 1) return 'Everyone lands on the same share.';
  const feetGap = high.feet - low.feet;
  if (feetGap > 0) {
    return `${label(high)} pays ${money(plan.spread)} more than ${label(low)}. Their room is ${feetGap} sq ft larger, and the shared space is split evenly.`;
  }
  return `${label(high)} pays ${money(plan.spread)} more than ${label(low)} after the shared amounts are rounded to the cent.`;
}

function summaryFor(plan, rentCents, billCents) {
  const lines = [
    'Key Share',
    `Rent ${money(rentCents)} · shared bills ${money(billCents)} · common space ${plan.commonFeet} sq ft`,
    '',
    ...plan.rows.map((row) => `${row.person} — ${row.room} (${row.feet} sq ft) — ${money(row.totalCents)}`),
    '',
    `Total ${money(plan.sum)}`,
  ];
  return lines.join('\n');
}

function matchesPreset(setup, preset) {
  if (setup.rooms.length !== preset.rooms.length) return false;
  const sameNumbers = parseMoney(setup.rent, MAX_RENT) === parseMoney(preset.rent, MAX_RENT)
    && parseMoney(setup.bills, MAX_BILLS) === parseMoney(preset.bills, MAX_BILLS)
    && parseFeet(setup.common) === parseFeet(preset.common);
  if (!sameNumbers) return false;
  return setup.rooms.every((room, index) => {
    const sample = preset.rooms[index];
    return room.room === sample.room && room.person === sample.person && parseFeet(room.feet) === parseFeet(sample.feet);
  });
}

export default function KeyShare() {
  const labelId = useId();
  const saved = useMemo(() => loadSaved(), []);
  const [rent, setRent] = useState(() => saved?.rent || PRESETS[0].rent);
  const [bills, setBills] = useState(() => saved?.bills || PRESETS[0].bills);
  const [common, setCommon] = useState(() => saved?.common || PRESETS[0].common);
  const [rooms, setRooms] = useState(() => saved?.rooms || PRESETS[0].rooms);
  const [status, setStatus] = useState('');

  useEffect(() => {
    try {
      const payload = {
        rent: formatDecimal(parseMoney(rent, MAX_RENT) / 100, 2),
        bills: formatDecimal(parseMoney(bills, MAX_BILLS) / 100, 2),
        common: String(parseFeet(common)),
        rooms: uniqueRooms(rooms.map(sanitizeRoom).filter(Boolean)),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage failures so the split still works for this visit.
    }
  }, [rent, bills, common, rooms]);

  const rentCents = parseMoney(rent, MAX_RENT);
  const billCents = parseMoney(bills, MAX_BILLS);
  const commonFeet = parseFeet(common);
  const plan = useMemo(
    () => planFor(rentCents, billCents, commonFeet, rooms),
    [rentCents, billCents, commonFeet, rooms],
  );
  const verdict = verdictFor(plan);
  const setup = { rent, bills, common, rooms };
  const largest = plan.rows.reduce((best, row) => (row.totalCents > best.totalCents ? row : best), plan.rows[0]);
  const barTotal = plan.sum || 1;

  const updateRoom = (id, field, value) => {
    setRooms((current) => current.map((room) => (room.id === id ? { ...room, [field]: value } : room)));
    setStatus('');
  };

  const addRoom = () => {
    setRooms((current) => (current.length >= MAX_ROOMS ? current : [...current, blankRoom(current.length + 1)]));
    setStatus('');
  };

  const removeRoom = (id) => {
    setRooms((current) => (current.length <= 2 ? current : current.filter((room) => room.id !== id)));
    setStatus('');
  };

  const applyPreset = (preset) => {
    setRent(preset.rent);
    setBills(preset.bills);
    setCommon(preset.common);
    setRooms(preset.rooms.map((room) => ({ ...room })));
    setStatus('');
  };

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(summaryFor(plan, rentCents, billCents));
      setStatus('Split copied.');
    } catch {
      setStatus('Clipboard is blocked in this browser.');
    }
  };

  return (
    <section aria-labelledby={labelId} className="max-w-7xl mx-auto my-12 p-6 md:p-8 bg-white rounded-3xl shadow-[0_20px_50px_rgba(234,88,12,0.08)] border border-gray-100 overflow-hidden relative">
      <div aria-hidden="true" className="absolute top-0 right-0 w-96 h-96 bg-orange-50 rounded-full blur-3xl opacity-80 -mr-32 -mt-32 pointer-events-none" />
      <div aria-hidden="true" className="absolute bottom-0 left-0 w-80 h-80 bg-amber-50 rounded-full blur-3xl opacity-70 -ml-24 -mb-24 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-100 gap-4">
        <div className="flex items-center gap-3">
          <div aria-hidden="true" className="w-10 h-10 shrink-0 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-400 flex items-center justify-center text-white shadow-md shadow-orange-600/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="7.5" cy="15.5" r="4.5" />
              <path d="M21 2l-9.6 9.6" />
              <path d="m15.5 7.5 3 3L22 7l-3-3" />
            </svg>
          </div>
          <div>
            <h2 id={labelId} className="text-3xl font-extrabold text-gray-900 tracking-tight">Key Share</h2>
            <p className="text-gray-500 text-sm font-medium mt-0.5">Split rent by room size, then share the common space and bills evenly</p>
          </div>
        </div>
        <button type="button" onClick={copySummary} className={`self-start shrink-0 px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-orange-600 to-amber-500 shadow-md shadow-orange-600/20 active:scale-95 transition-all ${FOCUS}`}>
          {status === 'Split copied.' ? 'Copied' : 'Copy split'}
        </button>
      </div>

      <div className="relative z-10 mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-orange-100 bg-orange-50/70 px-4 py-3 min-w-0">
          <div className="text-lg sm:text-2xl font-black tabular-nums text-orange-950 truncate">{money(plan.sum)}</div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-orange-800/80">Monthly total</div>
        </div>
        <div className="rounded-2xl border border-orange-100 bg-orange-50/70 px-4 py-3 min-w-0">
          <div className="text-lg sm:text-2xl font-black tabular-nums text-orange-950 truncate">{largest ? money(largest.totalCents) : '—'}</div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-orange-800/80">{largest ? `${largest.person} pays most` : 'Largest share'}</div>
        </div>
        <div className="rounded-2xl border border-orange-100 bg-orange-50/70 px-4 py-3 min-w-0">
          <div className="text-lg sm:text-2xl font-black tabular-nums text-orange-950 truncate">{money(plan.spread)}</div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-orange-800/80">High to low</div>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        <div className="lg:col-span-5 min-w-0 space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 md:p-5 space-y-4">
            <div>
              <div className="text-sm font-semibold text-gray-600">Start from</div>
              <div role="group" aria-label="Rent presets" className="mt-2 flex flex-wrap gap-2">
                {PRESETS.map((preset) => {
                  const active = matchesPreset(setup, preset);
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => applyPreset(preset)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${FOCUS} ${active ? 'bg-orange-600 border-orange-600 text-white' : 'bg-white border-gray-200 text-gray-500'}`}
                    >
                      {preset.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label htmlFor={`${labelId}-rent`} className="text-sm font-semibold text-gray-600">Rent</label>
                <div className="mt-2 flex items-center rounded-xl border border-gray-200 bg-white px-3 focus-within:ring-2 focus-within:ring-orange-600 focus-within:ring-offset-2">
                  <span className="text-sm font-bold text-gray-400">$</span>
                  <input
                    id={`${labelId}-rent`}
                    inputMode="decimal"
                    value={rent}
                    onChange={(event) => { setRent(typingDecimal(event.target.value, 2)); setStatus(''); }}
                    className="w-full bg-transparent py-2.5 pl-1 text-sm font-semibold text-gray-800 outline-none"
                  />
                </div>
              </div>
              <div>
                <label htmlFor={`${labelId}-bills`} className="text-sm font-semibold text-gray-600">Shared bills</label>
                <div className="mt-2 flex items-center rounded-xl border border-gray-200 bg-white px-3 focus-within:ring-2 focus-within:ring-orange-600 focus-within:ring-offset-2">
                  <span className="text-sm font-bold text-gray-400">$</span>
                  <input
                    id={`${labelId}-bills`}
                    inputMode="decimal"
                    value={bills}
                    onChange={(event) => { setBills(typingDecimal(event.target.value, 2)); setStatus(''); }}
                    className="w-full bg-transparent py-2.5 pl-1 text-sm font-semibold text-gray-800 outline-none"
                  />
                </div>
              </div>
              <div>
                <label htmlFor={`${labelId}-common`} className="text-sm font-semibold text-gray-600">Common sq ft</label>
                <input
                  id={`${labelId}-common`}
                  inputMode="numeric"
                  value={common}
                  onChange={(event) => { setCommon(typingFeet(event.target.value)); setStatus(''); }}
                  className={`mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-800 ${FOCUS}`}
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-4 md:p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-orange-800">Rooms</h3>
              <button
                type="button"
                onClick={addRoom}
                disabled={rooms.length >= MAX_ROOMS}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold text-orange-700 border border-orange-200 disabled:opacity-40 ${FOCUS}`}
              >
                Add room
              </button>
            </div>
            <ul className="mt-3 space-y-3">
              {rooms.map((room, index) => (
                <li key={room.id} className="rounded-xl border border-gray-100 bg-gray-50/80 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span aria-hidden="true" className={`h-2.5 w-2.5 shrink-0 rounded-full ${SWATCHES[index % SWATCHES.length]}`} />
                      <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Room {index + 1}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeRoom(room.id)}
                      disabled={rooms.length <= 2}
                      className={`text-xs font-bold text-gray-400 disabled:opacity-40 ${FOCUS}`}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      aria-label={`Person in room ${index + 1}`}
                      value={room.person}
                      maxLength={24}
                      onChange={(event) => updateRoom(room.id, 'person', event.target.value)}
                      className={`w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 ${FOCUS}`}
                    />
                    <input
                      aria-label={`Name of room ${index + 1}`}
                      value={room.room}
                      maxLength={24}
                      onChange={(event) => updateRoom(room.id, 'room', event.target.value)}
                      className={`w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 ${FOCUS}`}
                    />
                    <input
                      aria-label={`Square feet of room ${index + 1}`}
                      inputMode="numeric"
                      value={room.feet}
                      onChange={(event) => updateRoom(room.id, 'feet', typingFeet(event.target.value))}
                      className={`w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 ${FOCUS}`}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-7 min-w-0 space-y-4">
          <div className="rounded-2xl border border-orange-100 bg-orange-50 px-4 py-4 md:px-5">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-orange-800/80">How it lands</h3>
            <p className="mt-2 text-sm font-medium leading-relaxed text-orange-950">{verdict}</p>
            <div
              className="mt-4 flex h-3 overflow-hidden rounded-full bg-white"
              role="img"
              aria-label={plan.rows.map((row) => `${row.person} ${money(row.totalCents)}`).join(', ')}
            >
              {plan.rows.map((row, index) => (
                <div
                  key={row.id}
                  className={`h-full ${SWATCHES[index % SWATCHES.length]}`}
                  style={{ width: `${(row.totalCents / barTotal) * 100}%` }}
                />
              ))}
            </div>
            <p className="mt-3 text-xs font-medium text-orange-900/70">
              {plan.privateSum > 0
                ? `${money(plan.privateRent)} follows private square footage. ${money(plan.commonRent)} of rent, plus the bills, is split evenly.`
                : 'No private square footage yet, so the whole rent is split evenly with the bills.'}
            </p>
          </div>

          <ul className="space-y-3">
            {plan.rows.map((row, index) => {
              const width = plan.sum ? Math.max(4, Math.round((row.totalCents / plan.sum) * 100)) : 0;
              return (
                <li key={row.id} className="rounded-2xl border border-gray-100 bg-white p-4 md:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span aria-hidden="true" className={`h-2.5 w-2.5 shrink-0 rounded-full ${SWATCHES[index % SWATCHES.length]}`} />
                        <h3 className="truncate text-base font-bold text-gray-900">{row.person || 'Unnamed'}</h3>
                      </div>
                      <p className="mt-1 text-xs font-medium text-gray-500">{row.room || 'Room'} · {row.feet} sq ft</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black tabular-nums tracking-tight text-gray-900">{money(row.totalCents)}</div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        {plan.sum ? Math.round((row.totalCents / plan.sum) * 100) : 0}% of the total
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-orange-50">
                    <div className={`h-full ${SWATCHES[index % SWATCHES.length]}`} style={{ width: `${width}%` }} />
                  </div>
                  <p className="mt-3 text-xs font-medium text-gray-500">
                    Room {money(row.privateCents)} · common {money(row.commonCents)} · bills {money(row.billCents)}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <p role="status" className="relative z-10 mt-4 min-h-5 text-sm font-medium text-orange-800">{status}</p>
    </section>
  );
}
