"use client";

import Link from "next/link";
import Image from "next/image"; 
import { useState, useEffect } from "react";
import { HotelProps } from "../data/hotels";
import { supabase } from "../lib/supabase"; 
import { useExchangeRate } from "../lib/useExchangeRate"; 

export default function HotelCard({ hotel }: { hotel: HotelProps & { is_featured?: boolean } }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [currency, setCurrency] = useState<"USD" | "TZS">("USD");
  const liveTzsRate = useExchangeRate(); 

  useEffect(() => {
    const savedFavs = JSON.parse(localStorage.getItem("arusha_favorites") || "[]");
    if (savedFavs.includes(hotel.id)) {
      setIsFavorite(true);
    }
  }, [hotel.id]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault(); 
    const savedFavs = JSON.parse(localStorage.getItem("arusha_favorites") || "[]");
    let newFavs;
    
    if (isFavorite) {
      newFavs = savedFavs.filter((id: string) => id !== hotel.id); 
    } else {
      newFavs = [...savedFavs, hotel.id]; 
    }
    
    localStorage.setItem("arusha_favorites", JSON.stringify(newFavs));
    setIsFavorite(!isFavorite);
  };

  const handleRecordClick = () => {
    supabase.from('hotel_clicks').insert([{ hotel_name: hotel.name }]).then();
  };

  // Reverted: Removed the ~ symbol from the calculation
  const displayPrice = currency === "USD" 
    ? hotel.pricePerNight 
    : Math.round(hotel.pricePerNight * liveTzsRate).toLocaleString();

  return (
    <div 
      className={`relative bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl rounded-[1.5rem] md:rounded-3xl overflow-hidden shadow-lg hover:-translate-y-2 group flex flex-col h-full transition-all duration-500 ${
        hotel.is_featured 
          ? 'border-2 border-yellow-400 dark:border-yellow-500/50 hover:shadow-[0_20px_50px_rgba(250,204,21,0.2)] dark:hover:shadow-[0_20px_50px_rgba(234,179,8,0.15)]' 
          : 'border border-gray-200/50 dark:border-white/10 hover:shadow-2xl dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.8)] hover:dark:border-white/20'
      }`}
    >
      
      <div className="relative h-40 sm:h-52 md:h-60 w-full overflow-hidden">
        <Image
          src={hotel.imageUrl}
          alt={hotel.name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {hotel.is_featured && (
          <div className="absolute top-3 left-3 md:top-4 md:left-4 bg-gradient-to-r from-yellow-500 to-yellow-400 text-yellow-950 px-2 py-1 md:px-3 md:py-1.5 rounded-full text-[9px] md:text-xs font-bold uppercase tracking-widest shadow-lg flex items-center gap-1 z-10">
            <span>✨</span> <span className="hidden sm:inline">Premium Pick</span><span className="sm:hidden">Premium</span>
          </div>
        )}

        <div className="absolute top-3 right-3 md:top-4 md:right-4 flex items-center gap-1 md:gap-2 z-10">
          <div className="bg-white/90 dark:bg-black/50 backdrop-blur-md px-2 py-1 md:px-3 md:py-1.5 rounded-full text-xs md:text-sm font-bold text-blue-600 dark:text-blue-400 shadow-md border border-transparent dark:border-white/10 flex items-center gap-1">
            ⭐ {hotel.rating}
          </div>

          <button 
            onClick={toggleFavorite}
            className="bg-white/90 dark:bg-black/50 backdrop-blur-md p-1.5 md:p-2 rounded-full shadow-md text-gray-400 dark:text-white/50 hover:text-red-500 dark:hover:text-red-500 border border-transparent dark:border-white/10 transition-all duration-300 active:scale-75"
            aria-label="Save to favorites"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill={isFavorite ? "currentColor" : "none"} 
              viewBox="0 0 24 24" 
              strokeWidth={2} 
              stroke={isFavorite ? "none" : "currentColor"} 
              className={`w-4 h-4 md:w-5 md:h-5 transition-transform duration-300 ${isFavorite ? 'text-red-500 scale-110' : ''}`}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="p-3 sm:p-5 md:p-6 flex flex-col flex-grow relative z-10">
        <div className="flex-grow">
          <h2 className="text-base sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-1 md:mb-2 leading-tight line-clamp-2">{hotel.name}</h2>
          <p className="text-gray-500 dark:text-white/50 text-xs md:text-sm font-medium flex items-center mb-3 md:mb-4 truncate">
            <span className="text-red-400 mr-1 text-[10px] md:text-sm">📍</span> {hotel.location}
          </p>

          {hotel.amenities && hotel.amenities.length > 0 && (
            <div className="hidden sm:flex flex-wrap gap-1.5 md:gap-2 mb-4">
              {hotel.amenities.slice(0, 2).map((amenity, idx) => (
                <span key={idx} className="text-[9px] md:text-[10px] bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 px-1.5 py-0.5 md:px-2 md:py-1 rounded-md font-bold uppercase tracking-wider truncate max-w-[100px] md:max-w-[120px] border border-blue-100 dark:border-blue-500/20">
                  {amenity}
                </span>
              ))}
              {hotel.amenities.length > 2 && (
                <span className="text-[9px] md:text-[10px] bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white/50 px-1.5 py-0.5 md:px-2 md:py-1 rounded-md font-bold uppercase tracking-wider border border-gray-200 dark:border-white/10">
                  +{hotel.amenities.length - 2}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mt-2 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200/50 dark:border-white/10 gap-3 sm:gap-0">
          <div>
            <div className="flex items-center gap-2 mb-0.5 md:mb-1">
              {/* Reverted: Back to "Starts at" */}
              <p className="text-[10px] md:text-xs text-gray-400 dark:text-white/40 font-bold uppercase tracking-widest">Starts at</p>
              
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setCurrency(currency === "USD" ? "TZS" : "USD");
                }}
                className="flex items-center gap-1 text-[8px] md:text-[10px] bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white/60 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider hover:bg-gray-200 dark:hover:bg-white/20 hover:text-gray-800 dark:hover:text-white transition-all active:scale-95 border border-gray-200/50 dark:border-white/5"
                title="Swap Currency"
              >
                {currency} 
                <svg className="w-2.5 h-2.5 md:w-3 md:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
              </button>
            </div>
            
            {/* Reverted: Re-added the dynamic currency symbol ($ or TSh) here */}
            <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-blue-600 dark:text-blue-400 leading-none transition-all duration-300">
              {currency === "USD" ? "$" : "TSh "}
              {displayPrice} 
              <span className="text-[10px] md:text-sm font-medium text-gray-400 dark:text-white/40"> / night</span>
            </p>
          </div>
          
          <Link href={`/hotels/${hotel.id}`} className="w-full sm:w-auto" onClick={handleRecordClick}>
            <button className={`w-full font-bold py-2 md:py-3 px-4 md:px-6 rounded-lg md:rounded-xl text-sm md:text-base transition-all shadow-md active:scale-95 ${
              hotel.is_featured 
                ? 'bg-yellow-400 hover:bg-yellow-500 text-yellow-950 hover:shadow-[0_5px_20px_rgba(250,204,21,0.3)]' 
                : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-[0_5px_20px_rgba(37,99,235,0.4)] dark:hover:shadow-[0_5px_20px_rgba(59,130,246,0.3)]'
            }`}>
              View
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}