"use client";

import { useState, useEffect } from "react";

export default function FavoriteButton({ hotelId }: { hotelId: string }) {
  const [isFavorite, setIsFavorite] = useState(false);

  // Check memory on load
  useEffect(() => {
    const savedFavs = JSON.parse(localStorage.getItem("arusha_favorites") || "[]");
    if (savedFavs.includes(hotelId)) {
      setIsFavorite(true);
    }
  }, [hotelId]);

  // Handle click
  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    const savedFavs = JSON.parse(localStorage.getItem("arusha_favorites") || "[]");
    let newFavs;
    
    if (isFavorite) {
      newFavs = savedFavs.filter((id: string) => id !== hotelId); // Remove
    } else {
      newFavs = [...savedFavs, hotelId]; // Add
    }
    
    localStorage.setItem("arusha_favorites", JSON.stringify(newFavs));
    setIsFavorite(!isFavorite);
  };

  return (
    <button
      onClick={toggleFavorite}
      className={`flex items-center justify-center w-12 h-12 rounded-full backdrop-blur-md border shadow-xl transition-all duration-300 active:scale-75 ${
        isFavorite
          ? "bg-red-500/20 border-red-500/50 text-red-500 hover:bg-red-500/30"
          : "bg-black/30 border-white/10 text-white hover:bg-black/50"
      }`}
      aria-label="Save to favorites"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill={isFavorite ? "currentColor" : "none"} 
        viewBox="0 0 24 24" 
        strokeWidth={2} 
        stroke={isFavorite ? "none" : "currentColor"} 
        className={`w-6 h-6 transition-transform duration-300 ${isFavorite ? 'scale-110' : ''}`}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
      </svg>
    </button>
  );
}