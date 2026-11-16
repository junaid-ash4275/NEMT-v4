import React, { useEffect, useId, useMemo, useRef, useState } from 'react';

const STORAGE_KEY = 'lane-share-v1';
const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2';
const KM_PER_MILE = 1.609344;
const LITERS_PER_GALLON = 3.785411784;
const LP100_FROM_MPG = 235.214583;
const MAX_PEOPLE = 8;

const PRESETS = [
  {
    id: 'airport',
    name: 'Airport',
    distance: '28',
    economy: '28',
    price: '3.49',
    tolls: '8.50',
    parking: '0',
    roundTrip: true,
    split: 'even',
    people: ['You', 'Sam'],
  },
  {
    id: 'cabin',
    name: 'Cabin',
    distance: '140',
    economy: '24',
    price: '3.69',
    tolls: '12',
    parking: '0',
    roundTrip: true,
    split: 'even',
    people: ['You', 'Noor', 'Leo', 'Maya'],
  },
  {
    id: 'commute',
    name: 'Commute',
    distance: '18',
    economy: '32',
    price: '3.49',
    tolls: '0',
    parking: '12',
    roundTrip: true,
    split: 'even',
    people: ['You'],
  },
  {
    id: 'night',
    name: 'City night',
    distance: '9',
    economy: '22',
    price: '3.89',
    tolls: '0',
    parking: '18',
    roundTrip: false,
    split: 'riders',
    people: ['You', 'Ava', 'Ben'],
  },
];

const SPLITS = [
  { id: 'even', label: 'Even split' },
  { id: 'riders', label: 'Driver rides free' },
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

function parseDecimal(value, max, places) {
  const number = Number(String(value ?? '').trim());
  if (!Number.isFinite(number) || number < 0) return 0;
  return clamp(roundTo(number, places), 0, max);
}

function money(cents) {
  if (!Number.isFinite(cents)) return '—';
  return (cents / 100).toLocaleString(undefined, { style: 'currency', currency: 'USD' });
}

function quantity(value) {
  return value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function splitCents(total, count) {
  if (count <= 0 || total <= 0) return Array(Math.max(count, 0)).fill(0);
  const base = Math.floor(total / count);
  const leftover = total - base * count;
  return Array.from({ length: count }, (_, index) => base + (index < leftover ? 1 : 0));
}

function peopleFromNames(names, seed) {
  return names.slice(0, MAX_PEOPLE).map((name, index) => ({
    id: `${seed}-${index + 1}`,
    name: String(name || '').trim().slice(0, 24) || (index === 0 ? 'You' : `Rider ${index}`),
  }));
}

function sanitizePeople(people) {
  if (!Array.isArray(people)) return null;
  const clean = people
    .map((person, index) => {
      if (!person || typeof person !== 'object') return null;
      const name = String(person.name || '').trim().slice(0, 24);
      if (!name) return null;
      const id = /^[a-z0-9-]{1,40}$/i.test(String(person.id || ''))
        ? String(person.id)
        : `lane-saved-${index + 1}`;
      return { id, name };
    })
    .filter(Boolean)
    .slice(0, MAX_PEOPLE);
  if (!clean.length) return null;
  const seen = new Set();
  return clean.map((person, index) => {
    if (!seen.has(person.id)) {
      seen.add(person.id);
      return person;
    }
    const id = `lane-saved-dup-${index + 1}`;
    seen.add(id);
    return { ...person, id };
  });
}

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    const people = sanitizePeople(data.people);
    if (!people) return null;
    const unit = data.unit === 'metric' ? 'metric' : 'us';
    return {
      unit,
      distance: formatDecimal(parseDecimal(data.distance, 20000, 1), 1),
      economy: formatDecimal(parseDecimal(data.economy, unit === 'us' ? 250 : 80, 1), 1),
      price: formatDecimal(parseDecimal(data.price, 50, 3), 3),
      tolls: formatDecimal(parseDecimal(data.tolls, 9999, 2), 2),
      parking: formatDecimal(parseDecimal(data.parking, 9999, 2), 2),
      roundTrip: Boolean(data.roundTrip),
      split: data.split === 'riders' ? 'riders' : 'even',
      people,
    };
  } catch {
    return null;
  }
}

function toUsNumbers(unit, distance, economy, price) {
  if (unit === 'us') return { distance, economy, price };
  const litersPer100 = Math.max(economy, 0.1);
  return {
    distance: distance / KM_PER_MILE,
    economy: LP100_FROM_MPG / litersPer100,
    price: price * LITERS_PER_GALLON,
  };
}

function sameNumber(left, right) {
  return Math.abs(left - right) < 0.05;
}

function presetMatches(preset, snapshot) {
  const us = toUsNumbers(snapshot.unit, snapshot.distance, snapshot.economy, snapshot.price);
  return (
    sameNumber(us.distance, Number(preset.distance))
    && sameNumber(us.economy, Number(preset.economy))
    && sameNumber(us.price, Number(preset.price))
    && sameNumber(snapshot.tolls, Number(preset.tolls))
    && sameNumber(snapshot.parking, Number(preset.parking))
    && snapshot.roundTrip === preset.roundTrip
    && snapshot.split === preset.split
    && snapshot.people.length === preset.people.length
    && snapshot.people.every((person, index) => person.name === preset.people[index])
  );
}

function buildTrip(snapshot) {
  const miles = snapshot.unit === 'us' ? snapshot.distance : snapshot.distance / KM_PER_MILE;
  const traveledMiles = miles * (snapshot.roundTrip ? 2 : 1);
  const mpg = snapshot.unit === 'us'
    ? snapshot.economy
    : (snapshot.economy > 0 ? LP100_FROM_MPG / snapshot.economy : 0);
  const gallons = mpg > 0 ? traveledMiles / mpg : 0;
  const pricePerGallon = snapshot.unit === 'us' ? snapshot.price : snapshot.price * LITERS_PER_GALLON;
  const fuelCents = Math.round(gallons * pricePerGallon * 100);
  const tollCents = Math.round(snapshot.tolls * 100);
  const parkCents = Math.round(snapshot.parking * 100);
  const totalCents = fuelCents + tollCents + parkCents;
  const driverRidesFree = snapshot.split === 'riders' && snapshot.people.length > 1;
  const payers = driverRidesFree ? snapshot.people.slice(1) : snapshot.people;
  const shares = splitCents(totalCents, payers.length);
  const byId = Object.fromEntries(snapshot.people.map((person) => [person.id, 0]));
  payers.forEach((person, index) => {
    byId[person.id] = shares[index];
  });
  const uniqueShares = [...new Set(shares)];
  return {
    traveledMiles,
    traveledKm: traveledMiles * KM_PER_MILE,
    gallons,
    liters: gallons * LITERS_PER_GALLON,
    fuelCents,
    tollCents,
    parkCents,
    totalCents,
    byId,
    driverRidesFree,
    payerCount: payers.length,
    uneven: uniqueShares.length > 1,
  };
}

function summaryLines(snapshot, trip) {
  const distanceLabel = snapshot.unit === 'us'
    ? `${quantity(trip.traveledMiles)} mi`
    : `${quantity(trip.traveledKm)} km`;
  const fuelLabel = snapshot.unit === 'us'
    ? `${quantity(trip.gallons)} gal`
    : `${quantity(trip.liters)} L`;
  return [
    snapshot.roundTrip ? `Round trip · ${distanceLabel}` : `One way · ${distanceLabel}`,
    `Fuel ${fuelLabel} · ${money(trip.fuelCents)}`,
    `Tolls ${money(trip.tollCents)} · Parking ${money(trip.parkCents)}`,
    `Total ${money(trip.totalCents)}`,
    ...snapshot.people.map((person, index) => {
      const share = trip.byId[person.id] || 0;
      const role = index === 0 ? 'driver' : 'rider';
      const covered = trip.driverRidesFree && index === 0 ? ' · covered' : '';
      return `${person.name} (${role}): ${money(share)}${covered}`;
    }),
  ];
}

export default function LaneShare() {
  const labelId = useId();
  const saved = useMemo(() => loadSaved(), []);
  const seed = useRef(40);
  const opening = saved || {
    unit: 'us',
    distance: PRESETS[0].distance,
    economy: PRESETS[0].economy,
    price: PRESETS[0].price,
    tolls: PRESETS[0].tolls,
    parking: PRESETS[0].parking,
    roundTrip: PRESETS[0].roundTrip,
    split: PRESETS[0].split,
    people: peopleFromNames(PRESETS[0].people, 'lane-open'),
  };

  const [unit, setUnit] = useState(opening.unit);
  const [distance, setDistance] = useState(opening.distance);
  const [economy, setEconomy] = useState(opening.economy);
  const [price, setPrice] = useState(opening.price);
  const [tolls, setTolls] = useState(opening.tolls);
  const [parking, setParking] = useState(opening.parking);
  const [roundTrip, setRoundTrip] = useState(opening.roundTrip);
  const [split, setSplit] = useState(opening.split);
  const [people, setPeople] = useState(opening.people);
  const [draftName, setDraftName] = useState('');
  const [status, setStatus] = useState('');

  const nextPersonId = () => {
    seed.current += 1;
    return `lane-${seed.current}`;
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        unit,
        distance,
        economy,
        price,
        tolls,
        parking,
        roundTrip,
        split,
        people,
      }));
    } catch {
      setStatus('This browser blocked saving, so the split stays in this tab only.');
    }
  }, [unit, distance, economy, price, tolls, parking, roundTrip, split, people]);

  const snapshot = useMemo(() => ({
    unit,
    distance: parseDecimal(distance, 20000, 1),
    economy: parseDecimal(economy, unit === 'us' ? 250 : 80, 1),
    price: parseDecimal(price, 50, 3),
    tolls: parseDecimal(tolls, 9999, 2),
    parking: parseDecimal(parking, 9999, 2),
    roundTrip,
    split,
    people,
  }), [unit, distance, economy, price, tolls, parking, roundTrip, split, people]);

  const trip = useMemo(() => buildTrip(snapshot), [snapshot]);
  const activePreset = PRESETS.find((preset) => presetMatches(preset, snapshot));

  const distanceMax = Math.max(unit === 'us' ? 400 : 650, Math.ceil(snapshot.distance));
  const economyMin = unit === 'us' ? 8 : 3;
  const economyMax = Math.max(unit === 'us' ? 60 : 20, Math.ceil(snapshot.economy));
  const priceMax = Math.max(unit === 'us' ? 8 : 3, Math.ceil(snapshot.price * 2) / 2);
  const distanceUnit = unit === 'us' ? 'mi' : 'km';
  const economyUnit = unit === 'us' ? 'mpg' : 'L/100 km';
  const priceUnit = unit === 'us' ? '/gal' : '/L';
  const fuelReadout = unit === 'us' ? `${quantity(trip.gallons)} gal` : `${quantity(trip.liters)} L`;
  const distanceReadout = unit === 'us' ? `${quantity(trip.traveledMiles)} mi` : `${quantity(trip.traveledKm)} km`;
  const payerShares = people
    .filter((_, index) => !(trip.driverRidesFree && index === 0))
    .map((person) => trip.byId[person.id] || 0);
  const lowShare = payerShares.length ? Math.min(...payerShares) : 0;
  const highShare = payerShares.length ? Math.max(...payerShares) : 0;
  const shareValue = lowShare === highShare ? money(lowShare) : `${money(lowShare)}–${money(highShare)}`;
  const shareLabel = trip.driverRidesFree ? 'Each rider' : 'Each person';

  const parts = [
    { key: 'fuel', label: 'Fuel', cents: trip.fuelCents, bar: 'bg-indigo-600' },
    { key: 'tolls', label: 'Tolls', cents: trip.tollCents, bar: 'bg-sky-500' },
    { key: 'parking', label: 'Parking', cents: trip.parkCents, bar: 'bg-violet-400' },
  ];

  const clearStatus = () => setStatus('');

  const applyPreset = (preset) => {
    setUnit('us');
    setDistance(preset.distance);
    setEconomy(preset.economy);
    setPrice(preset.price);
    setTolls(preset.tolls);
    setParking(preset.parking);
    setRoundTrip(preset.roundTrip);
    setSplit(preset.split);
    setPeople(peopleFromNames(preset.people, `lane-${preset.id}-${Date.now().toString(36)}`));
    setDraftName('');
    setStatus('');
  };

  const changeUnit = (nextUnit) => {
    if (nextUnit === unit) return;
    const current = toUsNumbers(unit, snapshot.distance, Math.max(snapshot.economy, 0.1), snapshot.price);
    if (nextUnit === 'metric') {
      setDistance(formatDecimal(current.distance * KM_PER_MILE, 1));
      setEconomy(formatDecimal(LP100_FROM_MPG / Math.max(current.economy, 0.1), 1));
      setPrice(formatDecimal(current.price / LITERS_PER_GALLON, 3));
    } else {
      setDistance(formatDecimal(current.distance, 1));
      setEconomy(formatDecimal(current.economy, 1));
      setPrice(formatDecimal(current.price, 3));
    }
    setUnit(nextUnit);
    setStatus('');
  };

  const blurField = (value, setter, max, places) => {
    setter(formatDecimal(parseDecimal(value, max, places), places));
  };

  const updatePerson = (id, name) => {
    setPeople((current) => current.map((person) => (
      person.id === id ? { ...person, name: name.slice(0, 24) } : person
    )));
    clearStatus();
  };

  const finishPersonName = (person, index) => {
    const name = person.name.trim().slice(0, 24);
    updatePerson(person.id, name || (index === 0 ? 'You' : `Rider ${index}`));
  };

  const addPerson = (event) => {
    event.preventDefault();
    const name = draftName.trim().slice(0, 24);
    if (!name) {
      setStatus('Add a name first.');
      return;
    }
    if (people.length >= MAX_PEOPLE) {
      setStatus('This car holds 8 people.');
      return;
    }
    setPeople((current) => [...current, { id: nextPersonId(), name }]);
    setDraftName('');
    setStatus(`${name} is in the car.`);
  };

  const removePerson = (id) => {
    const person = people.find((item) => item.id === id);
    if (!person || people.length === 1) {
      setStatus('Keep at least the driver.');
      return;
    }
    setPeople((current) => current.filter((item) => item.id !== id));
    setStatus(`${person.name} left the car.`);
  };

  const copySplit = async () => {
    try {
      await navigator.clipboard.writeText(summaryLines(snapshot, trip).join('\n'));
      setStatus('Trip split copied.');
    } catch {
      setStatus('Clipboard is blocked in this browser.');
    }
  };

  const riderNote = trip.driverRidesFree
    ? `The driver is covered. ${trip.payerCount} ${trip.payerCount === 1 ? 'rider splits' : 'riders split'} the trip.`
    : people.length === 1 && split === 'riders'
      ? 'No passengers yet, so the driver covers the trip.'
      : `The total is split across ${people.length} ${people.length === 1 ? 'person' : 'people'}.`;

  return (
    <section aria-labelledby={labelId} className="max-w-7xl mx-auto my-12 p-6 md:p-8 bg-white rounded-3xl shadow-[0_20px_50px_rgba(79,70,229,0.08)] border border-gray-100 overflow-hidden relative">
      <div aria-hidden="true" className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-80 -mr-32 -mt-32 pointer-events-none" />
      <div aria-hidden="true" className="absolute bottom-0 left-0 w-80 h-80 bg-sky-50 rounded-full blur-3xl opacity-70 -ml-24 -mb-24 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-100 gap-4">
        <div className="flex items-center gap-3">
          <div aria-hidden="true" className="w-10 h-10 shrink-0 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
              <circle cx="7" cy="17" r="2" />
              <path d="M9 17h6" />
              <circle cx="17" cy="17" r="2" />
            </svg>
          </div>
          <div>
            <h2 id={labelId} className="text-3xl font-extrabold text-gray-900 tracking-tight">Lane Share</h2>
            <p className="text-gray-500 text-sm font-medium mt-0.5">Split fuel, tolls, and parking across the people in the car</p>
          </div>
        </div>
        <button type="button" onClick={copySplit} className={`self-start shrink-0 px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 shadow-md shadow-indigo-600/20 active:scale-95 transition-all ${FOCUS}`}>
          {status === 'Trip split copied.' ? 'Copied' : 'Copy split'}
        </button>
      </div>

      <div className="relative z-10 mt-5 grid grid-cols-3 gap-3">
        {[
          { label: 'Fuel used', value: fuelReadout },
          { label: 'Trip total', value: money(trip.totalCents) },
          { label: shareLabel, value: shareValue },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-indigo-100 bg-indigo-50/70 px-4 py-3 min-w-0">
            <div className="text-lg sm:text-2xl font-black tabular-nums text-indigo-800 truncate">{stat.value}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-700/80 truncate">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        <div className="lg:col-span-5 min-w-0 space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 md:p-5 space-y-4">
            <div>
              <div className="text-sm font-semibold text-gray-600">Trips</div>
              <div role="group" aria-label="Trip presets" className="mt-2 flex flex-wrap gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    aria-pressed={activePreset?.id === preset.id}
                    onClick={() => applyPreset(preset)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${FOCUS} ${activePreset?.id === preset.id ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-200 text-gray-500'}`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold text-gray-600">Units</div>
              <div role="group" aria-label="Distance units" className="mt-2 flex flex-wrap gap-2">
                {[
                  { id: 'us', label: 'Miles & gallons' },
                  { id: 'metric', label: 'Kilometers & liters' },
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={unit === option.id}
                    onClick={() => changeUnit(option.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${FOCUS} ${unit === option.id ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-200 text-gray-500'}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between gap-3 mb-2">
                <label htmlFor={`${labelId}-distance`} className="text-sm font-semibold text-gray-600">One-way distance</label>
                <output htmlFor={`${labelId}-distance`} className="text-sm font-mono font-bold text-indigo-700">{formatDecimal(snapshot.distance, 1)} {distanceUnit}</output>
              </div>
              <input
                id={`${labelId}-distance`}
                type="range"
                min="0"
                max={distanceMax}
                step="1"
                value={Math.min(snapshot.distance, distanceMax)}
                onChange={(event) => { setDistance(event.target.value); clearStatus(); }}
                className={`w-full cursor-pointer accent-indigo-600 ${FOCUS}`}
              />
              <input
                aria-label={`One-way distance in ${distanceUnit}`}
                inputMode="decimal"
                value={distance}
                onChange={(event) => { setDistance(typingDecimal(event.target.value, 1)); clearStatus(); }}
                onBlur={() => blurField(distance, setDistance, 20000, 1)}
                className={`mt-3 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-800 ${FOCUS}`}
              />
            </div>

            <div>
              <div className="flex justify-between gap-3 mb-2">
                <label htmlFor={`${labelId}-economy`} className="text-sm font-semibold text-gray-600">Fuel economy</label>
                <output htmlFor={`${labelId}-economy`} className="text-sm font-mono font-bold text-indigo-700">{formatDecimal(snapshot.economy, 1)} {economyUnit}</output>
              </div>
              <input
                id={`${labelId}-economy`}
                type="range"
                min={economyMin}
                max={economyMax}
                step={unit === 'us' ? 1 : 0.1}
                value={clamp(snapshot.economy, economyMin, economyMax)}
                onChange={(event) => { setEconomy(formatDecimal(Number(event.target.value), 1)); clearStatus(); }}
                className={`w-full cursor-pointer accent-indigo-600 ${FOCUS}`}
              />
              <input
                aria-label={`Fuel economy in ${economyUnit}`}
                inputMode="decimal"
                value={economy}
                onChange={(event) => { setEconomy(typingDecimal(event.target.value, 1)); clearStatus(); }}
                onBlur={() => blurField(economy, setEconomy, unit === 'us' ? 250 : 80, 1)}
                className={`mt-3 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-800 ${FOCUS}`}
              />
            </div>

            <div>
              <label htmlFor={`${labelId}-price`} className="text-xs font-semibold text-gray-600">Fuel price</label>
              <div className="relative mt-1">
                <span aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">$</span>
                <input
                  id={`${labelId}-price`}
                  inputMode="decimal"
                  value={price}
                  onChange={(event) => { setPrice(typingDecimal(event.target.value, 3)); clearStatus(); }}
                  onBlur={() => blurField(price, setPrice, 50, 3)}
                  className={`w-full rounded-xl border border-gray-200 bg-white pl-7 pr-14 py-2.5 text-sm font-semibold text-gray-800 ${FOCUS}`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">{priceUnit}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor={`${labelId}-tolls`} className="text-xs font-semibold text-gray-600">Tolls</label>
                <div className="relative mt-1">
                  <span aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">$</span>
                  <input
                    id={`${labelId}-tolls`}
                    inputMode="decimal"
                    value={tolls}
                    onChange={(event) => { setTolls(typingDecimal(event.target.value, 2)); clearStatus(); }}
                    onBlur={() => blurField(tolls, setTolls, 9999, 2)}
                    className={`w-full rounded-xl border border-gray-200 bg-white pl-7 pr-3 py-2.5 text-sm font-semibold text-gray-800 ${FOCUS}`}
                  />
                </div>
              </div>
              <div>
                <label htmlFor={`${labelId}-parking`} className="text-xs font-semibold text-gray-600">Parking</label>
                <div className="relative mt-1">
                  <span aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">$</span>
                  <input
                    id={`${labelId}-parking`}
                    inputMode="decimal"
                    value={parking}
                    onChange={(event) => { setParking(typingDecimal(event.target.value, 2)); clearStatus(); }}
                    onBlur={() => blurField(parking, setParking, 9999, 2)}
                    className={`w-full rounded-xl border border-gray-200 bg-white pl-7 pr-3 py-2.5 text-sm font-semibold text-gray-800 ${FOCUS}`}
                  />
                </div>
              </div>
            </div>

            <label className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white px-3 py-3">
              <input
                type="checkbox"
                checked={roundTrip}
                onChange={(event) => { setRoundTrip(event.target.checked); clearStatus(); }}
                className={`mt-0.5 accent-indigo-600 ${FOCUS}`}
              />
              <span>
                <span className="block text-sm font-semibold text-gray-800">Round trip</span>
                <span className="block text-xs font-medium text-gray-500 mt-0.5">Doubles the distance for fuel. Tolls and parking stay as entered.</span>
              </span>
            </label>
          </div>
        </div>

        <div className="lg:col-span-7 min-w-0 space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-4 md:p-5">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-indigo-700">Where the money goes</h3>
            <p className="mt-2 text-sm font-medium leading-relaxed text-gray-600">
              {snapshot.roundTrip ? 'Round trip' : 'One way'} covers {distanceReadout}. Fuel uses {formatDecimal(snapshot.economy, 1)} {economyUnit}, then tolls and parking are added once.
              {snapshot.economy <= 0 ? ' Set a fuel economy above zero to count fuel.' : ''}
            </p>
            <div
              className="mt-5 flex h-3 overflow-hidden rounded-full bg-indigo-100"
              role="img"
              aria-label={`Fuel ${money(trip.fuelCents)}, tolls ${money(trip.tollCents)}, parking ${money(trip.parkCents)}`}
            >
              {trip.totalCents > 0 && parts.map((part) => (
                part.cents > 0 ? (
                  <div key={part.key} className={`h-full ${part.bar}`} style={{ width: `${(part.cents / trip.totalCents) * 100}%` }} />
                ) : null
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
              {parts.map((part) => (
                <div key={part.key} className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                  <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${part.bar}`} />
                  <span>{part.label}</span>
                  <span className="font-mono font-bold text-gray-900">{money(part.cents)}</span>
                </div>
              ))}
            </div>
            <dl className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-2 text-sm">
              <div className="border-b border-gray-100 py-2">
                <dt className="text-gray-500">Distance driven</dt>
                <dd className="font-semibold text-gray-900">{distanceReadout}</dd>
              </div>
              <div className="border-b border-gray-100 py-2">
                <dt className="text-gray-500">Fuel used</dt>
                <dd className="font-semibold text-gray-900">{fuelReadout}</dd>
              </div>
              <div className="border-b border-gray-100 py-2">
                <dt className="text-gray-500">Trip total</dt>
                <dd className="font-semibold text-gray-900">{money(trip.totalCents)}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-4 md:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-indigo-700">Who pays</h3>
                <p className="mt-1 text-xs font-medium text-gray-500">{riderNote}{trip.uneven ? ' A leftover cent goes to the first payers.' : ''}</p>
              </div>
              <div role="group" aria-label="How to split" className="flex flex-wrap gap-2">
                {SPLITS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={split === option.id}
                    onClick={() => { setSplit(option.id); clearStatus(); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${FOCUS} ${split === option.id ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-200 text-gray-500'}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <ul className="mt-4 space-y-2">
              {people.map((person, index) => {
                const share = trip.byId[person.id] || 0;
                const width = trip.totalCents > 0 ? Math.round((share / trip.totalCents) * 100) : 0;
                return (
                  <li key={person.id} className="rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`shrink-0 rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${index === 0 ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-700 border border-indigo-100'}`}>
                        {index === 0 ? 'Driver' : 'Rider'}
                      </span>
                      <label htmlFor={`${labelId}-person-${person.id}`} className="sr-only">{index === 0 ? 'Driver' : 'Rider'} name</label>
                      <input
                        id={`${labelId}-person-${person.id}`}
                        value={person.name}
                        maxLength={24}
                        onChange={(event) => updatePerson(person.id, event.target.value)}
                        onBlur={() => finishPersonName(person, index)}
                        className={`min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-1 py-1 text-sm font-semibold text-gray-800 ${FOCUS}`}
                      />
                      <span className="shrink-0 text-sm font-black tabular-nums text-indigo-800">{money(share)}</span>
                      <button
                        type="button"
                        onClick={() => removePerson(person.id)}
                        disabled={people.length === 1}
                        className={`shrink-0 px-2 py-1 rounded-lg text-xs font-bold text-gray-400 hover:text-rose-600 disabled:opacity-30 ${FOCUS}`}
                      >
                        Remove
                      </button>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-indigo-100 overflow-hidden" aria-hidden="true">
                      <div className="h-full rounded-full bg-indigo-500" style={{ width: `${width}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>

            <form onSubmit={addPerson} className="mt-3 flex gap-2">
              <label htmlFor={`${labelId}-add`} className="sr-only">Person to add</label>
              <input
                id={`${labelId}-add`}
                value={draftName}
                maxLength={24}
                placeholder="Add a rider"
                onChange={(event) => setDraftName(event.target.value)}
                className={`min-w-0 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-semibold text-gray-800 ${FOCUS}`}
              />
              <button
                type="submit"
                disabled={people.length >= MAX_PEOPLE}
                className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 disabled:opacity-40 ${FOCUS}`}
              >
                {people.length >= MAX_PEOPLE ? 'Car is full' : 'Add'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <p aria-live="polite" className="relative z-10 mt-4 min-h-5 text-sm font-medium text-indigo-800">{status}</p>
    </section>
  );
}
