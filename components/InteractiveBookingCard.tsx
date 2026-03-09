"use client";

import { useState } from "react";
import { useExchangeRate } from "../lib/useExchangeRate"; 

export default function InteractiveBookingCard({ price, officialUrl }: { price: number, officialUrl: string }) {
  const [currency, setCurrency] = useState<"USD" | "TZS">("USD");
  const liveTzsRate = useExchangeRate(); 

  // Reverted: Removed the ~ symbol
  const displayedPrice = currency === "USD" 
    ? `$${price}` 
    : `Tsh ${(Math.round(price * liveTzsRate)).toLocaleString()}`;

  return (
    <div className="bg-white/70 dark:bg-[#0a0a0a]/50 backdrop-blur-3xl border border-white/60 dark:border-white/10 rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all">
      
      <div className="flex justify-between items-start mb-8">
        <div>
          {/* Reverted: Back to "Starting Rate" */}
          <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-[0.2em] text-xs mb-2">
            Starting Rate
          </p>
          <p className="text-4xl md:text-5xl font-light text-gray-900 dark:text-white flex items-baseline gap-2">
            <span className="font-bold tracking-tight">{displayedPrice}</span>
          </p>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">/ night</p>
        </div>

        <div className="bg-gray-200/50 dark:bg-white/5 p-1 rounded-full flex gap-1 border border-white/50 dark:border-white/10 backdrop-blur-md shadow-inner">
          <button 
            onClick={() => setCurrency("USD")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${currency === "USD" ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-md" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}
          >
            USD
          </button>
          <button 
            onClick={() => setCurrency("TZS")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${currency === "TZS" ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-md" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}
          >
            TZS
          </button>
        </div>
      </div>

      {officialUrl ? (
        <a 
          href={officialUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold py-4 md:py-5 px-8 rounded-2xl text-lg transition-transform active:scale-95 text-center flex items-center justify-center gap-2 shadow-2xl"
        >
          Reserve Your Stay ↗
        </a>
      ) : (
        <button 
          disabled
          className="w-full bg-gray-200/50 dark:bg-slate-800/50 text-gray-500 dark:text-gray-400 font-bold py-4 md:py-5 px-8 rounded-2xl text-lg cursor-not-allowed text-center border border-gray-300 dark:border-slate-700"
        >
          No Website Available
        </button>
      )}
    </div>
  );
}