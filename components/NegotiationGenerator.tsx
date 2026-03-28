"use client";

import React, { useState } from "react";

export default function NegotiationGenerator() {
  const [car, setCar] = useState("2018 Toyota Hilux SR5");
  const [dealerPrice, setDealerPrice] = useState<number | "">(45000);
  const [targetPrice, setTargetPrice] = useState<number | "">(42000);

  const parsedDealer = Number(dealerPrice) || 0;
  const parsedTarget = Number(targetPrice) || 0;

  const lowball = parsedTarget - (parsedDealer - parsedTarget) * 0.5;

  const message1 = `Hi there, saw your ${car} listed for $${parsedDealer.toLocaleString()}. Do you have flexibility on the price for a clean cash buyer ready to go today?`;
  
  const message2 = `Thanks for getting back to me. I've done some market research and $${parsedDealer.toLocaleString()} is a bit steep compared to recent sales. If you can do $${lowball.toLocaleString()} drive away, I'll put a deposit down right now.`;
  
  const message3 = `I understand you have margins to hit. Let's meet in the middle. $${parsedTarget.toLocaleString()} is my absolute maximum budget. If we can shake hands on that, I'm ready to buy today. Let me know before I commit to another one I'm looking at.`;

  return (
    <div className="w-full max-w-sm mx-auto bg-slate-900 text-white rounded-2xl shadow-xl overflow-hidden border border-slate-800 font-sans">
      <div className="p-6">
        <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Script Generator</h2>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          Dealers hate this. Enter your target price and copy-paste these 3 texts to grind them down like a pro.
        </p>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Car You Want
            </label>
            <input
              type="text"
              value={car}
              onChange={(e) => setCar(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-semibold"
              placeholder="e.g. 2018 Toyota Hilux SR5"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Their Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                <input
                  type="number"
                  value={dealerPrice}
                  onChange={(e) => setDealerPrice(e.target.value ? Number(e.target.value) : "")}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-7 pr-3 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all font-semibold"
                  placeholder="45000"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Your Target
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                <input
                  type="number"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value ? Number(e.target.value) : "")}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-7 pr-3 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-semibold"
                  placeholder="42000"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <MessageBubble step="1" title="The Opener" text={message1} delay="Wait for reply" />
          <MessageBubble step="2" title="The Anchor" text={message2} delay="Wait for the counter-offer" />
          <MessageBubble step="3" title="The Close" text={message3} delay="Send when they counter" />
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ step, title, text, delay }: { step: string; title: string; text: string; delay: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <div className="flex items-center gap-2 mb-2">
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white text-xs font-bold">
          {step}
        </span>
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">{title}</span>
        <span className="text-xs text-slate-500 ml-auto">{delay}</span>
      </div>
      
      <div 
        onClick={handleCopy}
        className="bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-900/50 rounded-2xl rounded-tl-sm p-4 text-sm text-indigo-100 leading-relaxed cursor-pointer transition-colors relative"
      >
        <p className="pr-6">{text}</p>
        <div className="absolute top-3 right-3 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
          {copied ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><polyline points="20 6 9 17 4 12"></polyline></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          )}
        </div>
        {copied && <span className="absolute bottom-2 right-3 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Copied!</span>}
      </div>
    </div>
  );
}
