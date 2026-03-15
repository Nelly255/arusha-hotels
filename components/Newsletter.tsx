"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Caveat_Brush } from "next/font/google";

const brushFont = Caveat_Brush({ 
  weight: '400', 
  subsets: ['latin'] 
});

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
    // 🚀 ADDED: animate-fade-in so it floats in beautifully on load/scroll 🚀
    <section className="relative w-full max-w-[1920px] mx-auto px-4 md:px-8 py-20 z-10 animate-fade-in transition-colors duration-500">
      
      {/* 🚀 ADDED: hover:scale-[1.01] and hover shadows for that smooth interactive feel 🚀 */}
      <div className="relative rounded-2xl md:rounded-3xl overflow-hidden bg-white dark:bg-[#0a0a0a] border border-gray-200/80 dark:border-gray-800/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-2xl hover:shadow-[0_8px_40px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_8px_40px_rgba(255,255,255,0.03)] transform hover:scale-[1.01] transition-all duration-700 ease-out">
        
        {/* Background Glow Effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[50%] -left-[10%] w-[70%] h-[100%] bg-orange-500/10 dark:bg-orange-600/10 blur-[100px] md:blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen transition-colors duration-500"></div>
          <div className="absolute -bottom-[50%] -right-[10%] w-[70%] h-[100%] bg-yellow-400/10 dark:bg-yellow-500/10 blur-[100px] md:blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen transition-colors duration-500"></div>
        </div>

        <div className="relative z-10 px-6 py-16 md:py-24 max-w-4xl mx-auto text-center flex flex-col items-center">
          
          <h2 className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-[0.3em] mb-4">
            Join The Inner Circle
          </h2>
          
          <h3 className={`${brushFont.className} text-5xl md:text-7xl text-gray-900 dark:text-white tracking-wider mb-6 drop-shadow-sm dark:drop-shadow-md transition-colors duration-500`}>
            Unlock Arusha's Secrets.
          </h3>
          
          <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg mb-10 max-w-2xl font-medium transition-colors duration-500">
            Be the first to know when breathtaking new safari lodges and luxury hideaways are added to our directory. No spam, just pure wanderlust.
          </p>

          {status === "success" ? (
            <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 text-green-700 dark:text-green-400 px-8 py-6 rounded-2xl flex flex-col items-center gap-3 animate-fade-in w-full max-w-md transition-colors duration-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-bold text-lg">Welcome to the club!</p>
              <p className="text-sm text-green-600/80 dark:text-green-500/80">Keep an eye on your inbox.</p>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="w-full max-w-md relative flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input
                  type="email"
                  required
                  placeholder="Enter your email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === "loading"}
                  className="w-full h-14 bg-white dark:bg-white/5 border border-gray-300/60 dark:border-white/10 text-gray-900 dark:text-white rounded-xl pl-12 pr-4 text-sm focus:outline-none focus:border-orange-500/50 focus:bg-gray-50 dark:focus:bg-white/10 transition-all placeholder-gray-400 disabled:opacity-50 shadow-inner dark:shadow-none"
                />
              </div>
              <button
                type="submit"
                disabled={status === "loading"}
                className="h-14 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-400 hover:to-yellow-400 text-gray-900 font-bold px-8 rounded-xl shadow-[0_4px_14px_0_rgba(249,115,22,0.39)] hover:shadow-[0_6px_20px_rgba(249,115,22,0.23)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px]"
              >
                {status === "loading" ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gray-900"></div>
                ) : (
                  "Get Access"
                )}
              </button>
            </form>
          )}

          {status === "error" && (
            <p className="mt-4 text-red-500 dark:text-red-400 text-sm font-medium animate-fade-in">{errorMessage}</p>
          )}

        </div>
      </div>
    </section>
  );
}