"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) return;
    setStatus("loading");
    setErrorMessage("");

    try {
      const { error } = await supabase
        .from('subscribers')
        .insert([{ email }]);

      if (error) {
        if (error.code === '23505') {
          throw new Error("You're already on the VIP list!");
        }
        throw new Error("Something went wrong. Please try again.");
      }

      setStatus("success");
      setEmail(""); 
    } catch (error: any) {
      console.error("Subscription error:", error);
      setStatus("error");
      setErrorMessage(error.message || "Failed to subscribe.");
    }
  };

  return (
    <section className="relative w-full max-w-6xl mx-auto px-4 md:px-8 py-12 z-10 animate-fade-in transition-colors duration-500">
      
      {/* The Horizontal Banner Wrapper */}
      <div className="w-full bg-gradient-to-r from-[#FFFCF5] to-[#FFF8ED] dark:from-[#15110d] dark:to-[#1a140f] border border-[#F5E6D3] dark:border-orange-900/30 rounded-[1.5rem] p-6 md:p-8 flex flex-col lg:flex-row items-center gap-6 lg:gap-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-none transition-all duration-500">
        
        {/* Left Icon Box */}
        <div className="flex-shrink-0 w-16 h-16 bg-white dark:bg-[#0a0a0a] rounded-2xl border border-[#F5E6D3] dark:border-orange-900/50 flex items-center justify-center text-orange-500 shadow-sm">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        {/* Center Text Area */}
        <div className="flex-1 text-center lg:text-left">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Unlock Arusha's Secrets
          </h2>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl">
            Be the first to know when breathtaking new safari lodges and luxury hideaways are added to our directory. No spam, just pure wanderlust.
          </p>
        </div>

        {/* Right Form Area */}
        <div className="flex-shrink-0 w-full lg:w-auto">
          {status === "success" ? (
            <div className="bg-green-50/80 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 text-green-700 dark:text-green-400 px-6 py-3 rounded-xl flex items-center gap-3 animate-fade-in w-full justify-center lg:justify-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-bold text-sm">Welcome to the club!</p>
                <p className="text-[11px] text-green-600/80 dark:text-green-500/80">Check your inbox soon.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 w-full max-w-md mx-auto lg:mx-0">
              <input
                type="email"
                required
                placeholder="Enter your email address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === "loading"}
                className="w-full sm:w-64 h-12 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl px-4 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder-gray-500 disabled:opacity-50 shadow-sm"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="h-12 bg-[#FF5A5F] hover:bg-[#E04E53] text-white font-bold px-6 rounded-xl shadow-sm hover:shadow-md active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px] text-sm whitespace-nowrap"
              >
                {status === "loading" ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                ) : (
                  "Get Access"
                )}
              </button>
            </form>
          )}

          {status === "error" && (
            <p className="mt-2 text-red-500 dark:text-red-400 text-xs font-medium animate-fade-in text-center lg:text-left">
              {errorMessage}
            </p>
          )}
        </div>

      </div>
    </section>
  );
}