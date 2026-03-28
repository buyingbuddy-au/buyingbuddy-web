"use client";

import React, { useState } from "react";

export default function FixOrDitch() {
  const [retailValue, setRetailValue] = useState<number | "">(15000);
  const [repairQuote, setRepairQuote] = useState<number | "">(5500);

  const parsedRetail = Number(retailValue) || 0;
  const parsedRepair = Number(repairQuote) || 0;

  // Rule of thumb: if repair is > 50% of retail, highly questionable. 
  // If > 70%, definitely ditch.
  const repairRatio = parsedRetail > 0 ? parsedRepair / parsedRetail : 0;
  const asIsValue = parsedRetail - parsedRepair * 1.5; // Estimated trade/wholesale deduction

  let advice = "Calculate to see our advice";
  let adviceColor = "text-slate-400";
  let bgGradient = "from-slate-800 to-slate-900";

  if (parsedRetail > 0 && parsedRepair > 0) {
    if (repairRatio > 0.6) {
      advice = "Ditch It. Not worth the headache.";
      adviceColor = "text-rose-400";
      bgGradient = "from-rose-950/40 to-slate-900";
    } else if (repairRatio > 0.35) {
      advice = "Borderline. Sell unless you love it.";
      adviceColor = "text-orange-400";
      bgGradient = "from-orange-950/40 to-slate-900";
    } else {
      advice = "Fix It. It makes financial sense.";
      adviceColor = "text-emerald-400";
      bgGradient = "from-emerald-950/40 to-slate-900";
    }
  }

  return (
    <div className={`w-full max-w-sm mx-auto bg-slate-900 text-white rounded-2xl shadow-xl overflow-hidden border border-slate-800 font-sans transition-colors duration-500 bg-gradient-to-b ${bgGradient}`}>
      <div className="p-6">
        <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Fix or Ditch?</h2>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          Got a massive repair bill? Don't throw good money after bad. Let's run the math.
        </p>

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Retail Value (if running)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
              <input
                type="number"
                value={retailValue}
                onChange={(e) => setRetailValue(e.target.value ? Number(e.target.value) : "")}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-semibold"
                placeholder="15000"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Repair Quote
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
              <input
                type="number"
                value={repairQuote}
                onChange={(e) => setRepairQuote(e.target.value ? Number(e.target.value) : "")}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all font-semibold"
                placeholder="5500"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800">
          <div className="flex flex-col items-center mb-6 text-center">
            <span className="text-xs uppercase tracking-widest font-bold text-slate-500 mb-2">The Verdict</span>
            <div className={`text-2xl font-black ${adviceColor}`}>{advice}</div>
          </div>

          <div className="space-y-3 mb-6 bg-slate-800/50 rounded-xl p-4 border border-slate-800/80">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Repair Cost Ratio</span>
              <span className="font-bold text-slate-200">{(repairRatio * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${repairRatio > 0.6 ? 'bg-rose-500' : repairRatio > 0.35 ? 'bg-orange-500' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min(repairRatio * 100, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center text-sm pt-2">
              <span className="text-slate-400">Est. "As Is" Value</span>
              <span className="font-bold text-slate-200">${Math.max(asIsValue, 500).toLocaleString()}</span>
            </div>
          </div>

          <button className="w-full bg-white text-slate-900 hover:bg-slate-200 font-bold py-4 px-6 rounded-xl transition-all duration-200 active:scale-[0.98] shadow-lg">
            Sell it "As Is" Today
          </button>
        </div>
      </div>
    </div>
  );
}
