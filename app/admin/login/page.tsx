"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Caveat_Brush } from "next/font/google";

const brushFont = Caveat_Brush({ weight: '400', subsets: ['latin'] });

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const router = useRouter();

  // Entrance animation and Live Clock
  useEffect(() => {
    setIsMounted(true);
    
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Dar_es_Salaam' }));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Invalid credentials. Access denied.");
      setLoading(false);
    } else {
      router.push("/admin");
    }
  };

  return (
    <main className="min-h-screen relative flex flex-col justify-center items-center p-4 overflow-hidden selection:bg-orange-500/30">
      
      {/* 🚀 1. THE GLASS BACKGROUND: Blurred Image + Overlay 🚀 */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/meru.avif" 
          alt="Arusha Background" 
          fill 
          priority
          className="object-cover scale-105" 
        />
        <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-[12px]"></div>
        
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#050505] to-transparent opacity-80"></div>
      </div>

      {/* Top Bar for Admin Environment */}
      <div className={`absolute top-0 w-full p-6 flex justify-between items-center z-20 transition-all duration-1000 ${isMounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}>
        <Link href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
           <Image src="/icon.png" alt="Logo" width={32} height={32} className="invert brightness-0" />
           <span className={`${brushFont.className} text-white text-lg tracking-wider`}>Arusha Hotels</span>
        </Link>
        <div className="hidden sm:flex items-center gap-4 text-white/80 font-bold text-xs uppercase tracking-widest">
           <span>Arusha, TZ</span>
           <span className="w-1 h-1 bg-white/30 rounded-full"></span>
           <span>{currentTime} EAT</span>
        </div>
      </div>
      
      <div 
        className={`w-full max-w-[420px] relative z-10 transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isMounted ? "opacity-100 translate-y-0 scale-100 blur-none" : "opacity-0 translate-y-16 scale-95 blur-md"
        }`}
      >
        
        {/* 🚀 2. THE LOGIN CARD: Ultra-Translucent Glassmorphism 🚀 */}
        <div className="bg-white/10 dark:bg-black/30 backdrop-blur-3xl p-8 md:p-10 rounded-[2.5rem] shadow-[0_30px_80px_rgba(0,0,0,0.5)] border border-white/20 dark:border-white/10 relative overflow-hidden">
          
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>

          <div className="text-center mb-10 mt-2">
            <h1 className="text-3xl font-black text-white tracking-tight mb-2 drop-shadow-md">Admin Access</h1>
            <p className="text-white/60 font-medium text-xs tracking-widest uppercase">Admin Authentication</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 backdrop-blur-md border border-red-500/30 rounded-2xl text-red-200 text-sm font-bold text-center animate-[bounce_0.5s_ease-in-out]">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="group">
              <label className="block text-[10px] font-black text-white/50 mb-2 uppercase tracking-widest">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-orange-400 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-14 rounded-2xl bg-black/20 dark:bg-black/40 border border-white/10 pl-12 pr-4 text-sm focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-all font-medium text-white placeholder-white/30 backdrop-blur-md"
                  placeholder="admin@arushahotels.com"
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-[10px] font-black text-white/50 mb-2 uppercase tracking-widest">Master Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-orange-400 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <input 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-14 rounded-2xl bg-black/20 dark:bg-black/40 border border-white/10 pl-12 pr-4 text-sm focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-all font-medium text-white placeholder-white/30 backdrop-blur-md"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full h-14 mt-8 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-black rounded-2xl text-base tracking-wide transition-all shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:shadow-[0_0_30px_rgba(249,115,22,0.6)] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-3 border border-orange-400/50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  <span>Decrypting...</span>
                </>
              ) : (
                <>
                  Log In <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </>
              )}
            </button>
          </form>

        </div>
        
        <div className="mt-8 text-center">
           <Link href="/" className="text-white/40 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">
              &larr; Return to Public Site
           </Link>
        </div>
      </div>
    </main>
  );
}