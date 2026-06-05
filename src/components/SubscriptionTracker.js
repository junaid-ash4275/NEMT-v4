import React, { useState, useEffect, useMemo } from 'react';

const SubscriptionTracker = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [cycle, setCycle] = useState('monthly');
  const [category, setCategory] = useState('Entertainment');

  const categories = ['Entertainment', 'Software', 'Utilities', 'Fitness', 'Other'];

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('subscriptionTracker');
    if (saved) {
      try {
        setSubscriptions(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse subscriptions", e);
      }
    }
  }, []);

  // Save to localStorage when subscriptions change
  useEffect(() => {
    localStorage.setItem('subscriptionTracker', JSON.stringify(subscriptions));
  }, [subscriptions]);

  const addSubscription = (e) => {
    e.preventDefault();
    if (!name.trim() || !cost || isNaN(cost) || parseFloat(cost) <= 0) return;

    const newSub = {
      id: Date.now().toString(),
      name: name.trim(),
      cost: parseFloat(cost),
      cycle,
      category,
      dateAdded: new Date().toLocaleDateString()
    };

    setSubscriptions([newSub, ...subscriptions]);
    setName('');
    setCost('');
  };

  const removeSubscription = (id) => {
    setSubscriptions(subscriptions.filter(sub => sub.id !== id));
  };

  const getMonthlyCost = (sub) => {
    if (sub.cycle === 'monthly') return sub.cost;
    if (sub.cycle === 'yearly') return sub.cost / 12;
    if (sub.cycle === 'weekly') return sub.cost * (52 / 12);
    return 0;
  };

  const getYearlyCost = (sub) => {
    if (sub.cycle === 'yearly') return sub.cost;
    if (sub.cycle === 'monthly') return sub.cost * 12;
    if (sub.cycle === 'weekly') return sub.cost * 52;
    return 0;
  };

  const totals = useMemo(() => {
    let monthly = 0;
    let yearly = 0;
    subscriptions.forEach(sub => {
      monthly += getMonthlyCost(sub);
      yearly += getYearlyCost(sub);
    });
    return { monthly, yearly };
  }, [subscriptions]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
  };

  // Top 3 expenses for visualization
  const sortedSubs = [...subscriptions].sort((a, b) => getMonthlyCost(b) - getMonthlyCost(a));
  const topSubs = sortedSubs.slice(0, 3);
  const otherCost = sortedSubs.slice(3).reduce((acc, sub) => acc + getMonthlyCost(sub), 0);

  const colors = ['bg-rose-500', 'bg-pink-400', 'bg-fuchsia-400', 'bg-gray-300'];

  return (
    <div className="flex justify-center items-center min-h-[600px] p-5 bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-600 rounded-2xl m-5 shadow-2xl transition-all duration-300">
      <div className="bg-white/95 backdrop-blur-md p-8 rounded-xl max-w-3xl w-full shadow-2xl border border-white/20">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8 border-b border-pink-100 pb-4">
          <div>
            <h2 className="text-3xl font-black bg-gradient-to-r from-rose-600 to-fuchsia-600 bg-clip-text text-transparent">
              SubTracker
            </h2>
            <p className="text-rose-700/60 text-xs font-bold uppercase tracking-widest mt-1">Recurring Expense Manager</p>
          </div>
          <div className="bg-rose-100 p-3 rounded-full animate-bounce text-rose-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Inputs Section */}
          <div className="lg:col-span-5 space-y-6">
            <form onSubmit={addSubscription} className="bg-rose-50/50 p-6 rounded-2xl border border-rose-100">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-tight mb-4 border-b border-rose-100 pb-2">Add New</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Service Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Netflix, Gym"
                    className="w-full px-4 py-2 mt-1 bg-white border border-rose-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 transition-all text-sm font-medium"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Cost</label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-bold">$</span>
                      <input
                        type="number"
                        value={cost}
                        onChange={(e) => setCost(e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                        min="0.01"
                        className="w-full pl-8 pr-4 py-2 bg-white border border-rose-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 transition-all text-sm font-medium"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Cycle</label>
                    <select
                      value={cycle}
                      onChange={(e) => setCycle(e.target.value)}
                      className="w-full px-3 py-2 mt-1 bg-white border border-rose-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 transition-all text-sm font-medium"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2 mt-1 bg-white border border-rose-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 transition-all text-sm font-medium"
                  >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 mt-2 bg-gradient-to-r from-rose-500 to-fuchsia-500 hover:from-rose-600 hover:to-fuchsia-600 text-white font-black rounded-xl transition-all shadow-lg shadow-rose-200 active:scale-[0.98] uppercase tracking-wider text-sm"
                >
                  Add Subscription
                </button>
              </div>
            </form>
          </div>

          {/* Results & List Section */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Totals Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-rose-500 p-5 rounded-2xl shadow-md text-white relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 text-rose-300/30 text-6xl font-black transition-all group-hover:scale-110 rotate-12">
                  $
                </div>
                <p className="text-rose-100 text-[10px] font-black uppercase tracking-[0.2em] mb-1 relative z-10">Monthly Total</p>
                <h3 className="text-3xl font-black tracking-tighter relative z-10">{formatCurrency(totals.monthly)}</h3>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-rose-100 relative overflow-hidden group">
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Yearly Total</p>
                <h3 className="text-2xl font-black text-rose-900 tracking-tighter">{formatCurrency(totals.yearly)}</h3>
              </div>
            </div>

            {/* Visualization Bar */}
            {subscriptions.length > 0 && (
              <div className="bg-white p-4 rounded-xl border border-rose-50 shadow-sm">
                <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                  <span>Top Monthly Expenses</span>
                </div>
                <div className="h-4 w-full flex rounded-full overflow-hidden bg-gray-100 relative">
                  {topSubs.map((sub, idx) => (
                    <div
                      key={sub.id}
                      className={`h-full ${colors[idx]} transition-all duration-1000 ease-out`}
                      style={{ width: `${(getMonthlyCost(sub) / totals.monthly) * 100}%` }}
                      title={`${sub.name}: ${formatCurrency(getMonthlyCost(sub))}`}
                    />
                  ))}
                  {otherCost > 0 && (
                    <div
                      className={`h-full ${colors[3]} transition-all duration-1000 ease-out`}
                      style={{ width: `${(otherCost / totals.monthly) * 100}%` }}
                      title={`Others: ${formatCurrency(otherCost)}`}
                    />
                  )}
                </div>
                <div className="flex flex-wrap gap-3 mt-3">
                  {topSubs.map((sub, idx) => (
                    <div key={sub.id} className="flex items-center gap-1.5">
                      <div className={`w-2.5 h-2.5 ${colors[idx]} rounded-sm`}></div>
                      <span className="text-[10px] font-bold text-gray-600 uppercase truncate max-w-[80px]">
                        {sub.name} ({Math.round((getMonthlyCost(sub) / totals.monthly) * 100)}%)
                      </span>
                    </div>
                  ))}
                  {otherCost > 0 && (
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2.5 h-2.5 ${colors[3]} rounded-sm`}></div>
                      <span className="text-[10px] font-bold text-gray-600 uppercase">Other</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Subscriptions List */}
            <div className="flex-1 bg-white rounded-xl border border-rose-50 shadow-sm overflow-hidden flex flex-col max-h-[300px]">
              <div className="px-5 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Active Services ({subscriptions.length})</span>
              </div>
              <div className="overflow-y-auto p-3 space-y-2 custom-scrollbar">
                {subscriptions.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm font-medium italic">
                    No subscriptions added yet.<br/>Start by adding one on the left!
                  </div>
                ) : (
                  subscriptions.map(sub => (
                    <div key={sub.id} className="flex justify-between items-center p-3 rounded-lg hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-100 group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-black text-lg">
                          {sub.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{sub.name}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">
                            {sub.category} • {formatCurrency(sub.cost)}/{sub.cycle.charAt(0)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-black text-rose-600">{formatCurrency(getMonthlyCost(sub))}</p>
                          <p className="text-[9px] text-gray-400 font-bold uppercase">/ month</p>
                        </div>
                        <button
                          onClick={() => removeSubscription(sub.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all p-1"
                          title="Remove Subscription"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionTracker;
