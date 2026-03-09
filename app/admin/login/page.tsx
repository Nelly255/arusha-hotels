"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Invalid email or password. Are you sure you're the admin?");
      setLoading(false);
    } else {
      // Success! Send them to the dashboard
      router.push("/admin");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 transition-colors duration-500">
      
      {/* Decorative Background Blobs */}
      <div className="fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-200 dark:bg-blue-900 rounded-full mix-blend-multiply filter blur-3xl opacity-30 dark:opacity-20 pointer-events-none transition-colors duration-500"></div>
      
      <div className="w-full max-w-md relative z-10">
        
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 mb-6 transition-colors">
          ← Back to Live Site
        </Link>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-8 md:p-10 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border border-white/60 dark:border-slate-700/60">
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-2">Admin Access</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Authorized personnel only.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800/50 rounded-xl text-red-600 dark:text-red-400 text-sm font-bold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Email</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all font-medium text-gray-900 dark:text-white placeholder-gray-400"
                placeholder="admin@arushahotels.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Password</label>
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all font-medium text-gray-900 dark:text-white placeholder-gray-400"
                placeholder="••••••••"
              />
            </div>

            <button 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl text-lg transition-all shadow-lg hover:shadow-blue-500/30 dark:hover:shadow-blue-900/50 active:scale-95 disabled:opacity-50 mt-2"
            >
              {loading ? "Authenticating..." : "Login to Dashboard"}
            </button>
          </form>

        </div>
      </div>
    </main>
  );
}