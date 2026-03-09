"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import HotelCard from "../../components/HotelCard";
import Link from "next/link";
import { HotelProps } from "../../data/hotels";

export default function FavoritesPage() {
  const [favoriteHotels, setFavoriteHotels] = useState<HotelProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFavorites() {
      // 1. Get saved IDs from browser memory
      const savedFavs = JSON.parse(localStorage.getItem("arusha_favorites") || "[]");
      
      if (savedFavs.length === 0) {
        setLoading(false);
        return;
      }

      // 2. Fetch ONLY the hotels that match those IDs
      try {
        const { data, error } = await supabase
          .from('hotels')
          .select('*')
          .in('id', savedFavs);

        if (error) throw error;
        if (data) setFavoriteHotels(data);
      } catch (error) {
        console.error("Error fetching favorites:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchFavorites();
  }, []);

  return (
    <main className="min-h-screen px-4 md:px-8 py-8 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 text-gray-900 dark:text-slate-100 relative font-sans overflow-x-hidden transition-colors duration-500">
      
      {/* Background Blobs */}
      <div className="fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-200 dark:bg-blue-900 rounded-full mix-blend-multiply filter blur-3xl opacity-30 dark:opacity-20 pointer-events-none transition-colors duration-500"></div>
      <div className="fixed top-0 right-0 translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-200 dark:bg-red-900 rounded-full mix-blend-multiply filter blur-3xl opacity-30 dark:opacity-20 pointer-events-none transition-colors duration-500"></div>

      <div className="w-full max-w-[1920px] mx-auto relative z-10 pt-6">
        
        {/* Navigation Header */}
        <div className="flex justify-between items-center mb-12 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-white/60 dark:border-slate-700/60 rounded-[2rem] px-6 md:px-8 py-5">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
              <span className="text-red-500">❤️</span> My Favorites
            </h1>
            <span className="text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-widest block">
              Your Saved Stays
            </span>
          </div>
          
          <Link href="/" className="bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-800 dark:text-gray-200 font-bold py-3 px-6 rounded-full transition-all flex items-center gap-2 shadow-sm">
            ← Back to Search
          </Link>
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
          </div>
        ) : favoriteHotels.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 md:gap-8 pb-10">
            {favoriteHotels.map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg rounded-[2.5rem] shadow-sm border border-white/50 dark:border-slate-700/50 max-w-2xl mx-auto">
            <div className="text-6xl mb-6 opacity-50">💔</div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">No favorites yet</p>
            <p className="text-gray-500 dark:text-gray-400 font-medium mb-8 text-lg">You haven't saved any hotels to your wishlist.</p>
            <Link href="/" className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-10 rounded-full transition-all shadow-lg hover:shadow-red-500/30 active:scale-95">
              Start Exploring
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}