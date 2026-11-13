import React, { useEffect, useId, useMemo, useState } from 'react';

const STORAGE_KEY = 'payoff-path-v1';
const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2';
const MONTH_CAP = 12 * 50;

const PRESETS = [
  { id: 'car', name: 'Car', amount: 18000, rate: 6.5, years: 5, extra: 0 },
  { id: 'student', name: 'Student', amount: 24000, rate: 5.2, years: 10, extra: 50 },
  { id: 'card', name: 'Card', amount: 4200, rate: 19.9, years: 3, extra: 75 },
  { id: 'home', name: 'Home', amount: 320000, rate: 6.1, years: 30, extra: 200 },
];

const YEAR_PRESETS = [3, 5, 10, 15, 30];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatRate(value) {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

function parseRate(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return clamp(Math.round(number * 10) / 10, 0, 36);
}

function parseWhole(value, max) {
  const digits = String(value || '').replace(/[^\d]/g, '');
  if (!digits) return 0;
  return clamp(Math.round(Number(digits)), 0, max);
}

function money(cents, digits = 0) {
  if (cents == null || !Number.isFinite(cents)) return '—';
  return (cents / 100).toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function formatSpan(months) {
  if (months == null) return '—';
  const years = Math.floor(months / 12);
  const remainder = months % 12;
  if (years && remainder) return `${years}y ${remainder}m`;
  if (years) return `${years}y`;
  return `${remainder}m`;
}

function payoffDate(months) {
  if (!months) return 'This month';
  const date = new Date();
  date.setDate(1);
  date.setMonth(date.getMonth() + months);
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

function paymentFor(principal, annualRate, months) {
  if (principal <= 0 || months <= 0) return 0;
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) return principal / months;
  const growth = (1 + monthlyRate) ** months;
  return (principal * monthlyRate * growth) / (growth - 1);
}

function toCents(value) {
  return Math.round(value * 100);
}

function ceilCents(value) {
  const cents = value * 100;
  const nearest = Math.round(cents);
  if (Math.abs(cents - nearest) < 1e-6) return nearest;
  return Math.ceil(cents - 1e-8);
}

function roundCents(value) {
  return Math.round(value * 100) / 100;
}

function simulate({ principal, annualRate, payment }) {
  const principalCents = toCents(principal);
  const paymentCents = toCents(payment);
  const monthlyRate = annualRate / 100 / 12;
  if (principalCents <= 0) {
    return {
      months: 0,
      interestCents: 0,
      paidCents: 0,
      stuck: false,
      years: [],
      firstInterestCents: 0,
      firstPrincipalCents: 0,
      lastPaymentCents: 0,
    };
  }

  let balance = principalCents;
  let interestCents = 0;
  let paidCents = 0;
  let yearInterest = 0;
  let firstInterestCents = 0;
  let firstPrincipalCents = 0;
  let lastPaymentCents = 0;
  const years = [];
  let months = 0;

  while (balance > 0 && months < MONTH_CAP) {
    const interestDue = Math.round(balance * monthlyRate);
    if (paymentCents <= interestDue) {
      return {
        months: null,
        interestCents: null,
        paidCents: null,
        stuck: true,
        years: [],
        firstInterestCents: 0,
        firstPrincipalCents: 0,
        lastPaymentCents: 0,
      };
    }
    const due = balance + interestDue;
    const applied = Math.min(paymentCents, due);
    const principalPaid = applied - interestDue;
    balance -= principalPaid;
    interestCents += interestDue;
    paidCents += applied;
    yearInterest += interestDue;
    lastPaymentCents = applied;
    if (months === 0) {
      firstInterestCents = interestDue;
      firstPrincipalCents = principalPaid;
    }
    months += 1;
    if (months % 12 === 0 || balance === 0) {
      years.push({
        year: Math.ceil(months / 12),
        balanceCents: balance,
        interestCents: yearInterest,
      });
      yearInterest = 0;
    }
  }

  return {
    months: balance === 0 ? months : null,
    interestCents: balance === 0 ? interestCents : null,
    paidCents: balance === 0 ? paidCents : null,
    stuck: balance !== 0,
    years,
    firstInterestCents,
    firstPrincipalCents,
    lastPaymentCents,
  };
}

function coveringPayment(principal, annualRate, rawPayment) {
  let cents = ceilCents(rawPayment);
  const interest = Math.round(toCents(principal) * (annualRate / 100 / 12));
  if (principal > 0 && cents <= interest) cents = interest + 1;
  return cents / 100;
}

function milestoneRows(years) {
  if (years.length <= 12) return years;
  return years.filter((row, index) => index === 0 || row.year % 5 === 0 || index === years.length - 1);
}

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    const amount = clamp(Math.round(Number(data.amount) || 0), 0, 2000000);
    const rate = parseRate(data.rate);
    const years = clamp(Math.round(Number(data.years) || 5), 1, 40);
    const extra = clamp(Math.round(Number(data.extra) || 0), 0, 20000);
    return {
      amountInput: String(amount),
      rateInput: formatRate(rate),
      years,
      extra,
    };
  } catch {
    return null;
  }
}

export default function PayoffPath() {
  const labelId = useId();
  const saved = useMemo(() => loadSaved(), []);
  const [amountInput, setAmountInput] = useState(saved?.amountInput || '18000');
  const [rateInput, setRateInput] = useState(saved?.rateInput || '6.5');
  const [years, setYears] = useState(saved?.years || 5);
  const [extra, setExtra] = useState(saved?.extra ?? 100);
  const [status, setStatus] = useState('');

  const amount = parseWhole(amountInput, 2000000);
  const rate = parseRate(rateInput);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ amount, rate, years, extra }));
    } catch {
      setStatus('This browser blocked saving, so the plan stays in this tab only.');
    }
  }, [amount, rate, years, extra]);

  const plan = useMemo(() => {
    const termMonths = years * 12;
    const basePayment = coveringPayment(amount, rate, paymentFor(amount, rate, termMonths));
    const base = simulate({ principal: amount, annualRate: rate, payment: basePayment });
    const boostedPayment = extra > 0 ? roundCents(basePayment + extra) : basePayment;
    const boosted = extra > 0
      ? simulate({ principal: amount, annualRate: rate, payment: boostedPayment })
      : base;
    return { basePayment, boostedPayment, base, boosted };
  }, [amount, rate, years, extra]);

  const active = extra > 0 ? plan.boosted : plan.base;
  const ready = amount > 0 && active.months != null;
  const interestSaved = ready && extra > 0 ? plan.base.interestCents - plan.boosted.interestCents : 0;
  const monthsSaved = ready && extra > 0 ? plan.base.months - plan.boosted.months : 0;
  const paidCents = ready ? active.paidCents : 0;
  const principalShare = paidCents > 0 ? (toCents(amount) / paidCents) * 100 : 0;
  const points = ready ? [{ year: 0, balanceCents: toCents(amount) }, ...active.years] : [];
  const rows = ready ? milestoneRows(active.years) : [];
  const activePreset = PRESETS.find((item) => (
    item.amount === amount && item.rate === rate && item.years === years && item.extra === extra
  ));

  const editAmount = (value) => {
    setAmountInput(value.replace(/[^\d]/g, '').slice(0, 7));
    setStatus('');
  };

  const editRate = (value) => {
    if (value !== '' && !/^\d*\.?\d*$/.test(value)) return;
    setRateInput(value.slice(0, 5));
    setStatus('');
  };

  const applyPreset = (preset) => {
    setAmountInput(String(preset.amount));
    setRateInput(formatRate(preset.rate));
    setYears(preset.years);
    setExtra(preset.extra);
    setStatus('');
  };

  const copyPlan = async () => {
    if (!ready) {
      setStatus('Enter a balance above $0 first.');
      return;
    }
    const lines = [
      `${money(toCents(amount), 0)} at ${formatRate(rate)}% over ${years} years`,
      `Scheduled payment ${money(toCents(plan.basePayment), 2)}`,
      extra > 0
        ? `With ${money(extra * 100, 0)} extra: done ${payoffDate(active.months)} (${formatSpan(active.months)})`
        : `Done ${payoffDate(active.months)} (${formatSpan(active.months)})`,
      `Interest ${money(active.interestCents, 2)}`,
      extra > 0 ? `Saves ${money(interestSaved, 2)} and ${formatSpan(monthsSaved)}` : 'No extra payment',
    ];
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setStatus('Payoff plan copied.');
    } catch {
      setStatus('Clipboard is blocked in this browser.');
    }
  };

  return (
    <section aria-labelledby={labelId} className="max-w-7xl mx-auto my-12 p-6 md:p-8 bg-white rounded-3xl shadow-[0_20px_50px_rgba(109,40,217,0.08)] border border-gray-100 overflow-hidden relative">
      <div aria-hidden="true" className="absolute top-0 right-0 w-96 h-96 bg-violet-50 rounded-full blur-3xl opacity-80 -mr-32 -mt-32 pointer-events-none" />
      <div aria-hidden="true" className="absolute bottom-0 left-0 w-80 h-80 bg-fuchsia-50 rounded-full blur-3xl opacity-70 -ml-24 -mb-24 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-100 gap-4">
        <div className="flex items-center gap-3">
          <div aria-hidden="true" className="w-10 h-10 shrink-0 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-400 flex items-center justify-center text-white shadow-md shadow-violet-600/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19V5" />
              <path d="M4 19h16" />
              <path d="M7 16l4-3 3 2 6-7" />
            </svg>
          </div>
          <div>
            <h2 id={labelId} className="text-3xl font-extrabold text-gray-900 tracking-tight">Payoff Path</h2>
            <p className="text-gray-500 text-sm font-medium mt-0.5">See the monthly payment, the payoff month, and what an extra payment saves</p>
          </div>
        </div>
        <button type="button" onClick={copyPlan} className={`self-start shrink-0 px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-violet-500 shadow-md shadow-violet-600/20 active:scale-95 transition-all ${FOCUS}`}>
          {status === 'Payoff plan copied.' ? 'Copied' : 'Copy plan'}
        </button>
      </div>

      <div className="relative z-10 mt-5 grid grid-cols-3 gap-3">
        {[
          { label: 'Payment', value: ready ? money(toCents(plan.basePayment), 2) : '—' },
          { label: extra > 0 ? 'With extra' : 'Payoff', value: ready ? payoffDate(active.months) : '—' },
          { label: extra > 0 ? 'Interest saved' : 'Total interest', value: ready ? money(extra > 0 ? interestSaved : active.interestCents, 0) : '—' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-violet-100 bg-violet-50/70 px-4 py-3 min-w-0">
            <div className="text-lg sm:text-2xl font-black tabular-nums text-violet-800 truncate">{stat.value}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-violet-700/80">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        <div className="lg:col-span-5 min-w-0 space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 md:p-5 space-y-4">
            <div>
              <div className="text-sm font-semibold text-gray-600">Starting points</div>
              <div role="group" aria-label="Loan presets" className="mt-2 flex flex-wrap gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    aria-pressed={activePreset?.id === preset.id}
                    onClick={() => applyPreset(preset)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${FOCUS} ${activePreset?.id === preset.id ? 'bg-violet-600 border-violet-600 text-white' : 'bg-white border-gray-200 text-gray-500'}`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor={`${labelId}-amount`} className="text-xs font-semibold text-gray-600">Balance</label>
              <div className="relative mt-1">
                <span aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">$</span>
                <input
                  id={`${labelId}-amount`}
                  inputMode="numeric"
                  value={amountInput}
                  onChange={(event) => editAmount(event.target.value)}
                  onBlur={() => setAmountInput(String(amount))}
                  className={`w-full rounded-xl border border-gray-200 bg-white pl-7 pr-3 py-2.5 text-sm font-semibold text-gray-800 ${FOCUS}`}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between gap-3 mb-2">
                <label htmlFor={`${labelId}-rate`} className="text-sm font-semibold text-gray-600">Interest rate</label>
                <output htmlFor={`${labelId}-rate`} className="text-sm font-mono font-bold text-violet-700">{formatRate(rate)}%</output>
              </div>
              <input
                id={`${labelId}-rate`}
                type="range"
                min="0"
                max="36"
                step="0.1"
                value={rate}
                onChange={(event) => { setRateInput(formatRate(Number(event.target.value))); setStatus(''); }}
                className={`w-full cursor-pointer accent-violet-600 ${FOCUS}`}
              />
              <input
                aria-label="Interest rate percent"
                inputMode="decimal"
                value={rateInput}
                onChange={(event) => editRate(event.target.value)}
                onBlur={() => setRateInput(formatRate(rate))}
                className={`mt-3 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-800 ${FOCUS}`}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-4 md:p-5 space-y-4">
            <div>
              <div className="flex justify-between gap-3 mb-2">
                <label htmlFor={`${labelId}-years`} className="text-sm font-semibold text-gray-600">Term</label>
                <output htmlFor={`${labelId}-years`} className="text-sm font-mono font-bold text-violet-700">{years} years</output>
              </div>
              <input
                id={`${labelId}-years`}
                type="range"
                min="1"
                max="40"
                step="1"
                value={years}
                onChange={(event) => { setYears(Number(event.target.value)); setStatus(''); }}
                className={`w-full cursor-pointer accent-violet-600 ${FOCUS}`}
              />
              <div role="group" aria-label="Common terms" className="mt-3 flex flex-wrap gap-2">
                {YEAR_PRESETS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={years === option}
                    onClick={() => { setYears(option); setStatus(''); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${FOCUS} ${years === option ? 'bg-violet-600 border-violet-600 text-white' : 'bg-white border-gray-200 text-gray-500'}`}
                  >
                    {option}y
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between gap-3 mb-2">
                <label htmlFor={`${labelId}-extra`} className="text-sm font-semibold text-gray-600">Extra each month</label>
                <output htmlFor={`${labelId}-extra`} className="text-sm font-mono font-bold text-violet-700">{money(extra * 100, 0)}</output>
              </div>
              <input
                id={`${labelId}-extra`}
                type="range"
                min="0"
                max={Math.max(1000, extra)}
                step="1"
                value={extra}
                onChange={(event) => { setExtra(Number(event.target.value)); setStatus(''); }}
                className={`w-full cursor-pointer accent-violet-600 ${FOCUS}`}
              />
              <input
                aria-label="Extra payment in dollars"
                inputMode="numeric"
                value={extra}
                onChange={(event) => { setExtra(parseWhole(event.target.value, 20000)); setStatus(''); }}
                className={`mt-3 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-semibold text-gray-800 ${FOCUS}`}
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 min-w-0 space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-4 md:p-5">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-violet-700">Balance over time</h3>
            {ready ? (
              <>
                <p className="mt-2 text-sm font-medium leading-relaxed text-gray-600">
                  {extra > 0
                    ? `Paying ${money(toCents(plan.boostedPayment), 2)} a month finishes ${formatSpan(monthsSaved)} sooner and cuts ${money(interestSaved, 2)} of interest.`
                    : 'Add an extra monthly amount to see how many months and how much interest it removes.'}
                </p>
                <div aria-hidden="true" className="mt-5 flex h-28 items-end gap-1">
                  {points.map((point) => (
                    <div key={point.year} className="flex-1 min-w-0 h-full flex items-end">
                      <div
                        className={`w-full rounded-t-md ${point.balanceCents === 0 ? 'bg-violet-200' : 'bg-gradient-to-t from-violet-600 to-fuchsia-400'}`}
                        style={{ height: point.balanceCents === 0 ? '4px' : `${(point.balanceCents / points[0].balanceCents) * 100}%` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  <span>Now</span>
                  <span>{payoffDate(active.months)}</span>
                </div>
              </>
            ) : (
              <p className="mt-2 text-sm font-medium leading-relaxed text-gray-600">
                {amount > 0
                  ? 'That payment never clears the balance. Lengthen the term so the scheduled payment covers the interest.'
                  : 'Enter a balance above $0. The term sets the scheduled payment, then any extra amount shortens it.'}
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-violet-100 bg-violet-50/80 p-4 md:p-5">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-violet-700">Where the money goes</h3>
            {ready && (
              <>
                <div aria-hidden="true" className="mt-4 flex h-3 overflow-hidden rounded-full bg-fuchsia-200">
                  <div className="h-full bg-violet-600" style={{ width: `${principalShare}%` }} />
                </div>
                <div className="mt-2 flex justify-between text-[10px] font-bold uppercase tracking-widest text-violet-700/80">
                  <span>Principal {money(toCents(amount), 0)}</span>
                  <span>Interest {money(active.interestCents, 0)}</span>
                </div>
              </>
            )}
            <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div className="flex justify-between gap-3 border-b border-violet-100 py-2">
                <dt className="text-violet-800/70">First payment interest</dt>
                <dd className="font-semibold text-violet-950">{ready ? money(active.firstInterestCents, 2) : '—'}</dd>
              </div>
              <div className="flex justify-between gap-3 border-b border-violet-100 py-2">
                <dt className="text-violet-800/70">First payment principal</dt>
                <dd className="font-semibold text-violet-950">{ready ? money(active.firstPrincipalCents, 2) : '—'}</dd>
              </div>
              <div className="flex justify-between gap-3 border-b border-violet-100 py-2">
                <dt className="text-violet-800/70">Total paid</dt>
                <dd className="font-semibold text-violet-950">{ready ? money(active.paidCents, 0) : '—'}</dd>
              </div>
              <div className="flex justify-between gap-3 border-b border-violet-100 py-2">
                <dt className="text-violet-800/70">Last payment</dt>
                <dd className="font-semibold text-violet-950">{ready ? money(active.lastPaymentCents, 2) : '—'}</dd>
              </div>
            </dl>
            {ready && extra > 0 && (
              <p className="mt-3 text-xs font-medium text-violet-800">
                Without the extra, this ends {payoffDate(plan.base.months)} and costs {money(plan.base.interestCents, 0)} in interest.
              </p>
            )}
          </div>

          <div className="rounded-2xl bg-slate-900 p-4 md:p-5">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-violet-300">Yearly snapshot</h3>
            {rows.length > 0 ? (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-violet-300/80">
                      <th scope="col" className="py-2 pr-3 font-bold">Year</th>
                      <th scope="col" className="py-2 pr-3 font-bold">Interest that year</th>
                      <th scope="col" className="py-2 font-bold">Still owed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.year} className="border-t border-white/10 font-mono text-violet-100">
                        <td className="py-2 pr-3">{row.year}</td>
                        <td className="py-2 pr-3">{money(row.interestCents, 0)}</td>
                        <td className="py-2">{money(row.balanceCents, 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-3 text-xs leading-6 text-violet-100">The year-by-year balance shows up once the loan has a balance.</p>
            )}
          </div>
        </div>
      </div>

      <p aria-live="polite" className="relative z-10 mt-4 min-h-5 text-sm font-medium text-violet-800">{status}</p>
    </section>
  );
}
