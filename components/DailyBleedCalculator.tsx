"use client";

import React, { useState } from "react";

export default function DailyBleedCalculator() {
  const [yearlyRego, setYearlyRego] = useState<number | "">(800);
  const [yearlyInsurance, setYearlyInsurance] = useState<number | "">(1200);
  const [weeklyFuel, setWeeklyFuel] = useState<number | "">(80);
  const [yearlyDepreciation, setYearlyDepreciation] = useState<number | "">(2500);

  // Calculate annual total
  const annualTotal =
    (Number(yearlyRego) || 0) +
    (Number(yearlyInsurance) || 0) +
    (Number(weeklyFuel) || 0) * 52 +
    (Number(yearlyDepreciation) || 0);

  // Calculate daily cost
  const dailyCost = annualTotal / 365;

  return (
    <div className="w-full max-w-sm mx-auto bg-slate-900 text-white rounded-2xl shadow-xl overflow-hidden border border-slate-800 font-sans">
      <div className="p-5">
        <h2 className="text-xl font-bold text-slate-100 mb-2">The Daily Bleed</h2>
        <p className="text-sm text-slate-400 mb-6">
          Every day you keep a car you don't drive, it's costing you money. Let's see how much.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Yearly Rego ($)
            </label>
            <input
              type="number"
              value={yearlyRego}
              onChange={(e) => setYearlyRego(e.target.value ? Number(e.target.value) : "")}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Yearly Insurance ($)
            </label>
            <input
              type="number"
              value={yearlyInsurance}
              onChange={(e) => setYearlyInsurance(e.target.value ? Number(e.target.value) : "")}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="1200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Weekly Fuel/Tolls ($)
            </label>
            <input
              type="number"
              value={weeklyFuel}
              onChange={(e) => setWeeklyFuel(e.target.value ? Number(e.target.value) : "")}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="80"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Estimated Yearly Depreciation ($)
            </label>
            <input
              type="number"
              value={yearlyDepreciation}
              onChange={(e) => setYearlyDepreciation(e.target.value ? Number(e.target.value) : "")}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="2500"
            />
          </div>
        </div>
      </div>

      <div className="bg-rose-950/40 p-6 border-t border-rose-900/50">
        <div className="text-center mb-6">
          <p className="text-sm font-medium text-rose-400 mb-1">You are losing</p>
          <div className="text-5xl font-black text-white tracking-tight flex items-center justify-center gap-1">
            <span className="text-3xl text-rose-500">$</span>
            {dailyCost.toFixed(2)}
          </div>
          <p className="text-sm text-slate-400 mt-2">
            Every single day. That's <strong className="text-slate-200">${annualTotal.toLocaleString()}</strong> a year.
          </p>
        </div>

        <button className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-[0_0_20px_rgba(225,29,72,0.4)] active:scale-[0.98]">
          Sell it to us for cash today
        </button>
      </div>
    </div>
  );
}
