import React, { useId, useMemo, useRef, useState } from 'react';

const CURRENCIES = [
  { id: 'USD', locale: 'en-US' },
  { id: 'EUR', locale: 'de-DE' },
  { id: 'GBP', locale: 'en-GB' },
  { id: 'PKR', locale: 'en-PK' },
];

const SWATCHES = [
  { dot: 'bg-teal-500', soft: 'bg-teal-50', text: 'text-teal-800', border: 'border-teal-200', on: 'bg-teal-600 text-white border-teal-600' },
  { dot: 'bg-amber-500', soft: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', on: 'bg-amber-500 text-white border-amber-500' },
  { dot: 'bg-violet-500', soft: 'bg-violet-50', text: 'text-violet-800', border: 'border-violet-200', on: 'bg-violet-600 text-white border-violet-600' },
  { dot: 'bg-rose-500', soft: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200', on: 'bg-rose-600 text-white border-rose-600' },
  { dot: 'bg-sky-500', soft: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-200', on: 'bg-sky-600 text-white border-sky-600' },
  { dot: 'bg-lime-500', soft: 'bg-lime-50', text: 'text-lime-900', border: 'border-lime-200', on: 'bg-lime-600 text-white border-lime-600' },
];

const PRESETS = [
  {
    name: 'Dinner out',
    tax: 8.875,
    tip: 18,
    tipOnTax: false,
    payerId: 'p1',
    people: [
      { id: 'p1', name: 'Maya' },
      { id: 'p2', name: 'Leo' },
      { id: 'p3', name: 'Noor' },
      { id: 'p4', name: 'Sam' },
    ],
    items: [
      { id: 'i1', name: 'Margherita pizza', price: '22.00', qty: 1, who: ['p1', 'p2'] },
      { id: 'i2', name: 'Smash burger', price: '16.50', qty: 1, who: ['p3'] },
      { id: 'i3', name: 'Grain bowl', price: '15.00', qty: 1, who: ['p4'] },
      { id: 'i4', name: 'Truffle fries', price: '9.00', qty: 1, who: ['p1', 'p2', 'p3', 'p4'] },
      { id: 'i5', name: 'Sparkling water', price: '3.50', qty: 4, who: ['p1', 'p2', 'p3', 'p4'] },
    ],
  },
  {
    name: 'Coffee run',
    tax: 0,
    tip: 15,
    tipOnTax: false,
    payerId: 'c1',
    people: [
      { id: 'c1', name: 'Ava' },
      { id: 'c2', name: 'Ben' },
      { id: 'c3', name: 'Cho' },
    ],
    items: [
      { id: 'k1', name: 'Oat latte', price: '5.75', qty: 1, who: ['c1'] },
      { id: 'k2', name: 'Americano', price: '3.50', qty: 1, who: ['c2'] },
      { id: 'k3', name: 'Cappuccino', price: '4.75', qty: 1, who: ['c3'] },
      { id: 'k4', name: 'Almond croissant', price: '4.25', qty: 1, who: ['c1', 'c3'] },
    ],
  },
  {
    name: 'Even split',
    tax: 8,
    tip: 20,
    tipOnTax: false,
    payerId: 'e2',
    people: [
      { id: 'e1', name: 'Jules' },
      { id: 'e2', name: 'Rin' },
      { id: 'e3', name: 'Omar' },
    ],
    items: [
      { id: 'b1', name: 'Table bill', price: '86.40', qty: 1, who: ['e1', 'e2', 'e3'] },
    ],
  },
];

const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2';

function toCents(value) {
  const amount = Number.parseFloat(String(value).replace(/[^0-9.]/g, ''));
  if (!Number.isFinite(amount) || amount < 0) return 0;
  return Math.round(amount * 100);
}

function splitCents(total, weights) {
  if (weights.length === 0 || total <= 0) return weights.map(() => 0);
  const sum = weights.reduce((totalWeight, weight) => totalWeight + weight, 0);
  const basis = sum > 0 ? weights : weights.map(() => 1);
  const basisSum = basis.reduce((totalWeight, weight) => totalWeight + weight, 0);
  const exact = basis.map((weight) => (total * weight) / basisSum);
  const shares = exact.map((value) => Math.floor(value));
  let leftover = total - shares.reduce((sumShares, share) => sumShares + share, 0);
  const order = exact
    .map((value, index) => ({ index, fraction: value - shares[index] }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index);
  for (let step = 0; step < leftover; step += 1) shares[order[step % order.length].index] += 1;
  return shares;
}

function money(cents, currency) {
  return new Intl.NumberFormat(currency.locale, {
    style: 'currency',
    currency: currency.id,
  }).format(cents / 100);
}

const FairTab = () => {
  const labelId = useId();
  const seq = useRef(40);
  const summaryRef = useRef(null);
  const [currencyId, setCurrencyId] = useState('USD');
  const [presetName, setPresetName] = useState(PRESETS[0].name);
  const [people, setPeople] = useState(PRESETS[0].people);
  const [items, setItems] = useState(PRESETS[0].items);
  const [tax, setTax] = useState(PRESETS[0].tax);
  const [tip, setTip] = useState(PRESETS[0].tip);
  const [tipOnTax, setTipOnTax] = useState(PRESETS[0].tipOnTax);
  const [payerId, setPayerId] = useState(PRESETS[0].payerId);
  const [draftName, setDraftName] = useState('');
  const [status, setStatus] = useState('');

  const currency = CURRENCIES.find((item) => item.id === currencyId);
  const nextId = (prefix) => {
    seq.current += 1;
    return `${prefix}${seq.current}`;
  };

  const bill = useMemo(() => {
    const ids = people.map((person) => person.id);
    const itemShares = Object.fromEntries(ids.map((id) => [id, 0]));
    const lines = items.map((item) => {
      const cents = toCents(item.price) * item.qty;
      const assigned = item.who.filter((id) => ids.includes(id));
      const shares = splitCents(cents, assigned.map(() => 1));
      assigned.forEach((id, index) => {
        itemShares[id] += shares[index];
      });
      const even = shares.length > 0 && shares.every((share) => share === shares[0]);
      return { ...item, cents, assigned, each: shares[0] || 0, even };
    });

    const assignedFood = Object.values(itemShares).reduce((sum, cents) => sum + cents, 0);
    const unassignedFood = lines.reduce((sum, line) => sum + (line.assigned.length ? 0 : line.cents), 0);
    const subtotal = assignedFood + unassignedFood;
    const taxCents = Math.round(subtotal * (tax / 100));
    const [assignedTax, unassignedTax] = splitCents(taxCents, [assignedFood, unassignedFood]);
    const tipBase = tipOnTax ? subtotal + taxCents : subtotal;
    const tipCents = Math.round(tipBase * (tip / 100));
    const [assignedTip, unassignedTip] = splitCents(
      tipCents,
      tipOnTax ? [assignedFood + assignedTax, unassignedFood + unassignedTax] : [assignedFood, unassignedFood],
    );
    const weights = ids.map((id) => itemShares[id]);
    const taxShares = splitCents(assignedTax, weights);
    const tipShares = splitCents(assignedTip, tipOnTax ? weights.map((weight, index) => weight + taxShares[index]) : weights);

    const shares = people.map((person, index) => ({
      ...person,
      items: itemShares[person.id] || 0,
      tax: taxShares[index] || 0,
      tip: tipShares[index] || 0,
      owed: (itemShares[person.id] || 0) + (taxShares[index] || 0) + (tipShares[index] || 0),
    }));

    return {
      lines,
      subtotal,
      unassigned: unassignedFood + unassignedTax + unassignedTip,
      taxCents,
      tipCents,
      total: subtotal + taxCents + tipCents,
      shares,
    };
  }, [people, items, tax, tip, tipOnTax]);

  const payer = people.find((person) => person.id === payerId) || null;

  const applyPreset = (preset) => {
    setPresetName(preset.name);
    setPeople(preset.people.map((person) => ({ ...person })));
    setItems(preset.items.map((item) => ({ ...item, who: [...item.who] })));
    setTax(preset.tax);
    setTip(preset.tip);
    setTipOnTax(preset.tipOnTax);
    setPayerId(preset.payerId);
    setStatus('');
  };

  const addPerson = () => {
    const name = draftName.trim();
    if (!name || people.length >= 6) return;
    setPeople((current) => [...current, { id: nextId('p'), name: name.slice(0, 18) }]);
    setDraftName('');
    setPresetName('');
    setStatus('');
  };

  const updateItem = (id, patch) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
    setPresetName('');
    setStatus('');
  };

  const toggleWho = (item, personId) => {
    const who = item.who.includes(personId)
      ? item.who.filter((id) => id !== personId)
      : [...item.who, personId];
    updateItem(item.id, { who });
  };

  const summary = [
    'Fair Tab',
    `Subtotal ${money(bill.subtotal, currency)}`,
    `Tax ${money(bill.taxCents, currency)} (${tax}%)`,
    `Tip ${money(bill.tipCents, currency)} (${tip}% ${tipOnTax ? 'after tax' : 'before tax'})`,
    `Total ${money(bill.total, currency)}`,
    '',
    ...bill.shares.flatMap((person) => {
      if (payer && person.id !== payer.id && person.owed === 0) return [];
      const amount = money(person.owed, currency);
      if (payer && person.id === payer.id) return [`${person.name || 'Someone'} paid · own share ${amount}`];
      if (payer) return [`${person.name || 'Someone'} owes ${payer.name || 'the payer'} ${amount}`];
      return [`${person.name || 'Someone'} · ${amount}`];
    }),
    ...(bill.unassigned ? ['', `Unassigned ${money(bill.unassigned, currency)}`] : []),
  ].join('\n');

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setStatus('Summary copied.');
    } catch {
      summaryRef.current?.focus();
      summaryRef.current?.select();
      setStatus('Summary selected. Press Ctrl+C or ⌘C to copy.');
    }
  };

  return (
    <section aria-labelledby={labelId} className="max-w-7xl mx-auto my-12 p-6 md:p-8 bg-white rounded-3xl shadow-[0_20px_50px_rgba(13,148,136,0.08)] border border-gray-100 overflow-hidden relative">
      <div aria-hidden="true" className="absolute top-0 right-0 w-96 h-96 bg-teal-50 rounded-full blur-3xl opacity-80 -mr-32 -mt-32 pointer-events-none" />
      <div aria-hidden="true" className="absolute bottom-0 left-0 w-80 h-80 bg-amber-50 rounded-full blur-3xl opacity-70 -ml-24 -mb-24 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-100 gap-4">
        <div className="flex items-center gap-3">
          <div aria-hidden="true" className="w-10 h-10 shrink-0 rounded-2xl bg-gradient-to-tr from-teal-600 to-amber-400 flex items-center justify-center text-white shadow-md shadow-teal-600/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 7h16" />
              <path d="M4 12h16" />
              <path d="M8 17h8" />
              <path d="M7 3v4" />
              <path d="M17 3v4" />
            </svg>
          </div>
          <div>
            <h2 id={labelId} className="text-3xl font-extrabold text-gray-900 tracking-tight">Fair Tab</h2>
            <p className="text-gray-500 text-sm font-medium mt-0.5">Split a shared bill by who ordered what, then see who owes whom</p>
          </div>
        </div>
        <button type="button" onClick={copySummary} className={`self-start shrink-0 px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-teal-600 to-teal-500 shadow-md shadow-teal-600/20 active:scale-95 transition-all ${FOCUS}`}>
          {status === 'Summary copied.' ? 'Copied' : 'Copy summary'}
        </button>
      </div>

      <div className="relative z-10 mt-5 flex flex-wrap items-center gap-2">
        <div role="group" aria-label="Sample bills" className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button key={preset.name} type="button" aria-pressed={presetName === preset.name} onClick={() => applyPreset(preset)} className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95 ${FOCUS} ${presetName === preset.name ? 'bg-teal-50 border-teal-200 text-teal-800' : 'bg-white/70 border-gray-200 text-gray-500 hover:border-teal-200 hover:text-teal-800'}`}>
              {preset.name}
            </button>
          ))}
        </div>
        <span aria-hidden="true" className="mx-1 hidden sm:block h-4 w-px bg-gray-200" />
        <div role="group" aria-label="Currency" className="flex flex-wrap gap-2">
          {CURRENCIES.map((item) => (
            <button key={item.id} type="button" aria-pressed={currencyId === item.id} onClick={() => setCurrencyId(item.id)} className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95 ${FOCUS} ${currencyId === item.id ? 'bg-teal-50 border-teal-200 text-teal-800' : 'bg-white/70 border-gray-200 text-gray-500 hover:border-teal-200 hover:text-teal-800'}`}>
              {item.id}
            </button>
          ))}
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        <div className="lg:col-span-7 min-w-0 space-y-5">
          <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 md:p-5">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-teal-700">People</h3>
            <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {people.map((person, index) => {
                const swatch = SWATCHES[index % SWATCHES.length];
                return (
                  <li key={person.id} className={`flex items-center gap-2 rounded-xl border bg-white px-2.5 py-2 ${swatch.border}`}>
                    <span aria-hidden="true" className={`h-2.5 w-2.5 shrink-0 rounded-full ${swatch.dot}`} />
                    <label htmlFor={`${labelId}-person-${person.id}`} className="sr-only">Name for person {index + 1}</label>
                    <input
                      id={`${labelId}-person-${person.id}`}
                      value={person.name}
                      maxLength={18}
                      onChange={(event) => {
                        const name = event.target.value;
                        setPeople((current) => current.map((entry) => (entry.id === person.id ? { ...entry, name } : entry)));
                        setPresetName('');
                        setStatus('');
                      }}
                      className={`min-w-0 flex-1 bg-transparent text-sm font-semibold text-gray-800 ${FOCUS}`}
                    />
                    <button
                      type="button"
                      aria-pressed={payerId === person.id}
                      onClick={() => { setPayerId(payerId === person.id ? '' : person.id); setPresetName(''); setStatus(''); }}
                      className={`shrink-0 rounded-lg px-2 py-1 text-[10px] font-bold border ${FOCUS} ${payerId === person.id ? 'bg-teal-600 border-teal-600 text-white' : 'bg-white border-gray-200 text-gray-500'}`}
                    >
                      Paid
                    </button>
                    <button
                      type="button"
                      aria-label={`Remove ${person.name || 'person'}`}
                      onClick={() => {
                        setPeople((current) => current.filter((entry) => entry.id !== person.id));
                        setItems((current) => current.map((item) => ({ ...item, who: item.who.filter((id) => id !== person.id) })));
                        if (payerId === person.id) setPayerId('');
                        setPresetName('');
                        setStatus('');
                      }}
                      className={`shrink-0 rounded-lg px-2 py-1 text-xs font-bold text-gray-400 hover:text-rose-600 ${FOCUS}`}
                    >
                      ×
                    </button>
                  </li>
                );
              })}
            </ul>
            <form
              className="mt-3 flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                addPerson();
              }}
            >
              <label htmlFor={`${labelId}-new-person`} className="sr-only">Add a person</label>
              <input
                id={`${labelId}-new-person`}
                value={draftName}
                maxLength={18}
                onChange={(event) => setDraftName(event.target.value)}
                placeholder={people.length >= 6 ? 'Six people is the table limit' : 'Add a name'}
                disabled={people.length >= 6}
                className={`min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 disabled:bg-gray-100 ${FOCUS}`}
              />
              <button type="submit" disabled={!draftName.trim() || people.length >= 6} className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-bold text-teal-800 bg-teal-50 border border-teal-100 disabled:opacity-40 ${FOCUS}`}>
                Add
              </button>
            </form>
            <p className="mt-3 text-xs leading-relaxed text-gray-500">Mark who put the card down. Everyone else’s share is what they owe that person.</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Items</h3>
              <button
                type="button"
                onClick={() => {
                  setItems((current) => [...current, { id: nextId('i'), name: '', price: '0.00', qty: 1, who: people.map((person) => person.id) }]);
                  setPresetName('');
                  setStatus('');
                }}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold text-white bg-teal-600 active:scale-95 ${FOCUS}`}
              >
                Add item
              </button>
            </div>
            {items.length === 0 && (
              <p className="rounded-2xl border border-dashed border-gray-200 px-4 py-8 text-center text-sm text-gray-500">Add the first item to start the tab.</p>
            )}
            <ul className="space-y-3">
              {items.map((item, index) => {
                const line = bill.lines[index];
                const names = people.filter((person) => line.assigned.includes(person.id)).map((person) => person.name || 'Someone');
                return (
                  <li key={item.id} className="rounded-2xl border border-gray-100 bg-white p-3 md:p-4">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="min-w-0 flex-1">
                        <label htmlFor={`${labelId}-item-${item.id}`} className="sr-only">Item name</label>
                        <input id={`${labelId}-item-${item.id}`} value={item.name} maxLength={40} placeholder="Item name" onChange={(event) => updateItem(item.id, { name: event.target.value })} className={`w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-semibold text-gray-800 ${FOCUS}`} />
                      </div>
                      <div className="flex gap-2">
                        <div>
                          <label htmlFor={`${labelId}-price-${item.id}`} className="sr-only">Price</label>
                          <input id={`${labelId}-price-${item.id}`} inputMode="decimal" value={item.price} onChange={(event) => updateItem(item.id, { price: event.target.value.replace(/[^0-9.]/g, '').slice(0, 8) })} onBlur={() => updateItem(item.id, { price: (toCents(item.price) / 100).toFixed(2) })} className={`w-28 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-mono font-semibold text-gray-800 ${FOCUS}`} />
                        </div>
                        <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50">
                          <button type="button" aria-label={`Decrease quantity for ${item.name || 'item'}`} disabled={item.qty <= 1} onClick={() => updateItem(item.id, { qty: item.qty - 1 })} className={`px-2.5 py-2 text-sm font-bold text-gray-500 disabled:opacity-30 ${FOCUS}`}>−</button>
                          <span className="w-6 text-center text-sm font-bold tabular-nums text-gray-800">{item.qty}</span>
                          <button type="button" aria-label={`Increase quantity for ${item.name || 'item'}`} disabled={item.qty >= 20} onClick={() => updateItem(item.id, { qty: item.qty + 1 })} className={`px-2.5 py-2 text-sm font-bold text-gray-500 disabled:opacity-30 ${FOCUS}`}>+</button>
                        </div>
                        <button type="button" aria-label={`Remove ${item.name || 'item'}`} onClick={() => { setItems((current) => current.filter((entry) => entry.id !== item.id)); setPresetName(''); setStatus(''); }} className={`rounded-xl px-3 text-sm font-bold text-gray-400 hover:text-rose-600 ${FOCUS}`}>×</button>
                      </div>
                    </div>
                    <div role="group" aria-label={`Who shares ${item.name || 'this item'}`} className="mt-3 flex flex-wrap gap-1.5">
                      {people.length === 0 && <span className="text-xs text-amber-700">Add a person before assigning this item.</span>}
                      {people.map((person, personIndex) => {
                        const swatch = SWATCHES[personIndex % SWATCHES.length];
                        const on = item.who.includes(person.id);
                        return (
                          <button key={person.id} type="button" aria-pressed={on} onClick={() => toggleWho(item, person.id)} className={`rounded-full border px-2.5 py-1 text-[11px] font-bold transition-colors ${FOCUS} ${on ? swatch.on : 'bg-white border-gray-200 text-gray-400'}`}>
                            {person.name || 'Someone'}
                          </button>
                        );
                      })}
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      {line.assigned.length === 0
                        ? `${money(line.cents, currency)} is unassigned`
                        : line.even
                          ? `${money(line.cents, currency)} · ${money(line.each, currency)} each · ${names.join(', ')}`
                          : `${money(line.cents, currency)} · split ${line.assigned.length} ways · ${names.join(', ')}`}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 md:p-5 space-y-5">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-teal-700">Tax and tip</h3>
            <div>
              <div className="flex justify-between gap-3 mb-2">
                <label htmlFor={`${labelId}-tax`} className="text-sm font-semibold text-gray-600">Tax</label>
                <output htmlFor={`${labelId}-tax`} className="text-sm font-mono font-bold text-teal-700">{tax}%</output>
              </div>
              <input id={`${labelId}-tax`} type="range" min="0" max="20" step="0.125" value={tax} onChange={(event) => { setTax(Number(event.target.value)); setPresetName(''); setStatus(''); }} className={`w-full cursor-pointer accent-teal-600 ${FOCUS}`} />
            </div>
            <div>
              <div className="flex justify-between gap-3 mb-2">
                <label htmlFor={`${labelId}-tip`} className="text-sm font-semibold text-gray-600">Tip</label>
                <output htmlFor={`${labelId}-tip`} className="text-sm font-mono font-bold text-teal-700">{tip}%</output>
              </div>
              <input id={`${labelId}-tip`} type="range" min="0" max="30" step="1" value={tip} onChange={(event) => { setTip(Number(event.target.value)); setPresetName(''); setStatus(''); }} className={`w-full cursor-pointer accent-teal-600 ${FOCUS}`} />
              <div role="group" aria-label="Tip shortcuts" className="mt-3 flex flex-wrap gap-2">
                {[0, 15, 18, 20, 25].map((amount) => (
                  <button key={amount} type="button" aria-pressed={tip === amount} onClick={() => { setTip(amount); setPresetName(''); setStatus(''); }} className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${FOCUS} ${tip === amount ? 'bg-teal-600 border-teal-600 text-white' : 'bg-white border-gray-200 text-gray-500'}`}>
                    {amount}%
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm font-bold text-gray-700">Tip base</span>
              <div role="group" aria-label="Tip base" className="flex gap-1">
                {[{ id: false, label: 'Before tax' }, { id: true, label: 'After tax' }].map((option) => (
                  <button key={option.label} type="button" aria-pressed={tipOnTax === option.id} onClick={() => { setTipOnTax(option.id); setPresetName(''); setStatus(''); }} className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${FOCUS} ${tipOnTax === option.id ? 'bg-teal-600 border-teal-600 text-white' : 'bg-white border-gray-200 text-teal-800'}`}>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 min-w-0 space-y-4">
          <div className="rounded-2xl bg-slate-900 text-slate-100 p-5 md:p-6 shadow-lg">
            <p className="text-[10px] font-bold uppercase tracking-widest text-teal-300">Receipt</p>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-slate-400">Subtotal</dt><dd className="font-mono font-semibold tabular-nums">{money(bill.subtotal, currency)}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-slate-400">Tax {tax}%</dt><dd className="font-mono font-semibold tabular-nums">{money(bill.taxCents, currency)}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-slate-400">Tip {tip}%</dt><dd className="font-mono font-semibold tabular-nums">{money(bill.tipCents, currency)}</dd></div>
              <div className="flex justify-between gap-3 border-t border-white/10 pt-3 text-base"><dt className="font-bold text-white">Total</dt><dd className="font-mono font-extrabold tabular-nums text-teal-300">{money(bill.total, currency)}</dd></div>
            </dl>
            <p className="mt-4 text-xs leading-relaxed text-slate-400">
              {bill.unassigned > 0
                ? `${money(bill.unassigned, currency)} is still unassigned. Give those items a person and their tax and tip move with them.`
                : 'Tax and tip follow each person’s food share, and leftover cents go to the largest fractions so the shares add up to the total.'}
            </p>
          </div>

          <ul className="space-y-2">
            {bill.shares.map((person, index) => {
              const swatch = SWATCHES[index % SWATCHES.length];
              const settled = payer && person.id !== payer.id;
              return (
                <li key={person.id} className={`rounded-2xl border p-4 ${swatch.soft} ${swatch.border}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className={`font-bold truncate ${swatch.text}`}>{person.name || 'Someone'}</p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {payer && person.id === payer.id ? 'Paid the bill' : settled ? `Owes ${payer.name || 'the payer'}` : 'Share of the tab'}
                      </p>
                    </div>
                    <p className="text-lg font-extrabold tabular-nums text-gray-900">{money(person.owed, currency)}</p>
                  </div>
                  <p className="mt-2 text-[11px] font-medium text-gray-500">
                    Food {money(person.items, currency)} · Tax {money(person.tax, currency)} · Tip {money(person.tip, currency)}
                  </p>
                </li>
              );
            })}
          </ul>

          {payer && (
            <div className="rounded-2xl border border-teal-100 bg-teal-50/80 p-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-teal-700">Settle up</h3>
              <ul className="mt-2 space-y-1.5">
                {bill.shares.filter((person) => person.id !== payer.id && person.owed > 0).map((person) => (
                  <li key={person.id} className="text-sm font-semibold text-teal-900">
                    {person.name || 'Someone'} pays {payer.name || 'the payer'} {money(person.owed, currency)}
                  </li>
                ))}
                {bill.shares.every((person) => person.id === payer.id || person.owed === 0) && (
                  <li className="text-sm font-semibold text-teal-900">Nothing else to settle.</li>
                )}
              </ul>
            </div>
          )}

          <label htmlFor={`${labelId}-summary`} className="sr-only">Bill summary</label>
          <textarea ref={summaryRef} id={`${labelId}-summary`} readOnly value={summary} rows={3} className="sr-only" />
          <p role="status" className="min-h-5 text-xs font-medium text-teal-700">{status}</p>
        </div>
      </div>
    </section>
  );
};

export default FairTab;
