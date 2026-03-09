"use client"; 

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import HotelCard from "../../components/HotelCard";
import { supabase } from "../../lib/supabase"; 
import { HotelProps } from "../../data/hotels"; 
import Footer from "../../components/Footer";
import Link from "next/link"; 
import { Caveat_Brush } from "next/font/google"; 

const brushFont = Caveat_Brush({ 
  weight: '400', 
  subsets: ['latin'] 
});

const QUICK_AMENITIES = ["🏊 Swimming Pool", "📶 Free WiFi", "💆 Spa & Wellness", "🍽️ Restaurant"];
const ITEMS_PER_PAGE = 15;

// --- 🚀 NEW: Inner Component to handle the URL Search Params safely 🚀 ---
function DirectoryContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  const [hotels, setHotels] = useState<HotelProps[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [showBackToTop, setShowBackToTop] = useState(false);
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);

  // 🚀 NEW: Update search query if the URL changes while already on the page
  useEffect(() => {
    const currentSearch = searchParams.get("search");
    if (currentSearch) {
      setSearchQuery(currentSearch);
    }
  }, [searchParams]);

  useEffect(() => {
    async function fetchHotels() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('hotels')
          .select('*')
          .neq('isHidden', true);

        if (error) throw error;
        
        if (data) {
          const sortedData = data.sort((a, b) => {
            if (a.is_featured && !b.is_featured) return -1;
            if (!a.is_featured && b.is_featured) return 1;
            return a.name.localeCompare(b.name);
          });
          setHotels(sortedData);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchHotels();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, minPrice, maxPrice, minRating, selectedAmenities]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20); 
      setShowStickyHeader(window.scrollY > 300); 
      
      if (window.scrollY > 400) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const triggerMobileSearch = () => {
    scrollToTop();
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 500);
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const toggleMinPrice = (price: number) => {
    if (minPrice === price) {
      setMinPrice(null);
    } else {
      setMinPrice(price);
      setMaxPrice(null); 
    }
  };

  const toggleMaxPrice = (price: number) => {
    if (maxPrice === price) {
      setMaxPrice(null);
    } else {
      setMaxPrice(price);
      setMinPrice(null); 
    }
  };

  const toggleRating = (rating: number) => {
    setMinRating(prev => prev === rating ? null : rating);
  };

  const clearFilters = () => {
    setMinPrice(null);
    setMaxPrice(null);
    setMinRating(null);
    setSelectedAmenities([]);
    setSearchQuery("");
  };

  const hasActiveFilters = minPrice !== null || maxPrice !== null || minRating !== null || selectedAmenities.length > 0 || searchQuery !== "";

  const filteredHotels = hotels.filter((hotel) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = hotel.name.toLowerCase().includes(searchLower) || hotel.location.toLowerCase().includes(searchLower);
    
    const matchesMinPrice = minPrice ? hotel.pricePerNight >= minPrice : true;
    const matchesMaxPrice = maxPrice ? hotel.pricePerNight <= maxPrice : true;
    
    const matchesRating = minRating ? hotel.rating >= minRating : true;
    const matchesAmenities = selectedAmenities.every(a => 
      hotel.amenities && hotel.amenities.includes(a)
    );

    return matchesSearch && matchesMinPrice && matchesMaxPrice && matchesRating && matchesAmenities;
  });

  const totalPages = Math.max(1, Math.ceil(filteredHotels.length / ITEMS_PER_PAGE));
  const paginatedHotels = filteredHotels.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const FilterButtons = () => (
    <>
      <button onClick={() => toggleMinPrice(200)} className={`flex-shrink-0 px-5 md:px-6 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-bold transition-all border ${minPrice === 200 ? 'bg-gray-900 text-white border-gray-900 shadow-md dark:bg-white dark:text-gray-900 dark:border-white' : 'bg-gray-100 dark:bg-white/5 border-gray-200/60 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white'}`}>Above $200</button>
      <div className="w-1.5 h-1.5 bg-gray-300 dark:bg-white/20 mx-1 md:mx-2 flex-shrink-0 rounded-full"></div>
      <button onClick={() => toggleMaxPrice(250)} className={`flex-shrink-0 px-5 md:px-6 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-bold transition-all border ${maxPrice === 250 ? 'bg-gray-900 text-white border-gray-900 shadow-md dark:bg-white dark:text-gray-900 dark:border-white' : 'bg-gray-100 dark:bg-white/5 border-gray-200/60 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white'}`}>Under $250</button>
      <div className="w-1.5 h-1.5 bg-gray-300 dark:bg-white/20 mx-1 md:mx-2 flex-shrink-0 rounded-full"></div>
      <button onClick={() => toggleRating(4)} className={`flex-shrink-0 px-5 md:px-6 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-bold transition-all border ${minRating === 4 ? 'bg-gray-900 text-white border-gray-900 shadow-md dark:bg-white dark:text-gray-900 dark:border-white' : 'bg-gray-100 dark:bg-white/5 border-gray-200/60 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white'}`}>⭐ 4+ Stars</button>
      
      {QUICK_AMENITIES.map((amenity) => (
        <div key={amenity} className="flex items-center flex-shrink-0">
          <div className="w-1.5 h-1.5 bg-gray-300 dark:bg-white/20 mx-1 md:mx-2 flex-shrink-0 rounded-full"></div>
          <button onClick={() => toggleAmenity(amenity)} className={`flex-shrink-0 px-5 md:px-6 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-bold transition-all border ${selectedAmenities.includes(amenity) ? 'bg-gray-900 text-white border-gray-900 shadow-md dark:bg-white dark:text-gray-900 dark:border-white' : 'bg-gray-100 dark:bg-white/5 border-gray-200/60 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white'}`}>
            {amenity}
          </button>
        </div>
      ))}

      {hasActiveFilters && (
        <button onClick={clearFilters} className="flex-shrink-0 px-4 py-2 md:py-2.5 rounded-full text-[10px] font-black uppercase tracking-wider text-red-600 border border-red-200 dark:text-red-400 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all ml-2 md:ml-4">Clear ✕</button>
      )}
    </>
  );

  return (
    <>
      <main className="min-h-screen bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-gray-100 relative font-sans overflow-x-hidden transition-colors duration-500 pb-10">

        <div className="fixed top-0 left-[10%] -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-blue-400/20 dark:bg-blue-600/10 blur-[120px] rounded-full pointer-events-none transition-colors duration-500"></div>
        <div className="fixed top-0 right-[10%] translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-purple-400/20 dark:bg-purple-600/10 blur-[120px] rounded-full pointer-events-none transition-colors duration-500"></div>

        {/* 🚀 UNIFIED FULL-WIDTH GLASS HEADER 🚀 */}
        <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isScrolled 
            ? "bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-3xl border-b border-gray-200/60 dark:border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.4)] pt-3 pb-3" 
            : "bg-transparent pt-6 pb-2 border-b border-transparent shadow-none"
        }`}>
          <div className="max-w-[1920px] mx-auto px-4 md:px-8">
            
            <div className="flex items-center w-full relative h-12 md:h-14">
              <div className="flex-1 flex justify-start">
                <Link href="/" className="hover:opacity-80 transition-opacity drop-shadow-sm dark:drop-shadow-2xl">
                   <svg viewBox="0 0 450 100" preserveAspectRatio="xMinYMid meet" className={`transition-all duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] w-auto ${isScrolled ? "h-10 md:h-12" : "h-12 md:h-16"}`}>
                      <defs>
                        <linearGradient id="sunset-dir" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#FBBF24" />
                          <stop offset="100%" stopColor="#EA580C" />
                        </linearGradient>
                        <clipPath id="circle-clip-dir"><circle cx="45" cy="50" r="36" /></clipPath>
                      </defs>
                      <g transform="translate(0, 0)">
                        <circle cx="45" cy="50" r="36" fill="url(#sunset-dir)" />
                        <g clipPath="url(#circle-clip-dir)">
                            <polygon points="5,80 35,35 75,80" fill="#ffffff" opacity="0.95"/>
                            <polygon points="40,90 60,45 95,90" fill="#e5e7eb" opacity="0.7"/>
                        </g>
                      </g>
                      <text x="105" y="54" fontWeight="900" fontSize="36" className="fill-gray-900 dark:fill-white" letterSpacing="-1">Arusha Hotels</text>
                      <text x="108" y="78" fontSize="22" className={`${brushFont.className} fill-orange-600 dark:fill-orange-500 transition-opacity duration-300 ${isScrolled ? "opacity-0 sm:opacity-100" : "opacity-100"}`} letterSpacing="1">Rest Before The Adventure.</text>
                    </svg>
                </Link>
              </div>

              <div className={`hidden md:flex flex-1 justify-center transition-all duration-[600ms] ${showStickyHeader ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95 pointer-events-none"}`}>
                <div className="relative w-[300px] lg:w-[400px] h-12">
                   <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-gray-900 dark:group-focus-within:text-white transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                   </div>
                   <input
                     type="text"
                     placeholder="Search Arusha..."
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="w-full h-full bg-gray-100 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 text-gray-900 dark:text-white rounded-full pl-12 pr-10 text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-white/20 transition-all font-medium placeholder-gray-500 hover:bg-gray-200 dark:hover:bg-white/10"
                   />
                   {searchQuery && (
                     <button onClick={() => setSearchQuery("")} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-red-500 transition-colors">
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                     </button>
                   )}
                </div>
              </div>

              <div className="flex-1 flex justify-end items-center gap-4">
                <div className={`md:hidden transition-all duration-[600ms] ${showStickyHeader ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 pointer-events-none"}`}>
                   <button onClick={triggerMobileSearch} className="h-10 w-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-900 dark:text-white active:scale-95 transition-all shadow-inner border border-gray-200/80 dark:border-white/10">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                   </button>
                </div>

                <div className={`hidden lg:flex items-center gap-8 transition-all duration-[600ms] ${isScrolled ? "" : "bg-white/50 dark:bg-black/20 backdrop-blur-md px-8 py-3 rounded-full border border-gray-200/50 dark:border-white/10 shadow-sm"}`}>
                   <Link href="/directory" className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white hover:opacity-70 transition-opacity">Directory</Link>
                   <Link href="/favorites" className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors">Favorites</Link>
                </div>
              </div>
            </div>

            <div className={`w-full transition-all duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden ${showStickyHeader ? "max-h-24 opacity-100 mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-200 dark:border-white/10" : "max-h-0 opacity-0 mt-0 pt-0 border-transparent"}`}>
              <div className="flex items-center justify-between w-full">
                
                <div className="w-[calc(100%+2rem)] -mx-4 px-4 md:w-full md:mx-0 md:px-0 overflow-x-auto [&::-webkit-scrollbar]:hidden pb-1 md:pb-0">
                  <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0 w-max pr-8 md:pr-0">
                     <FilterButtons />
                  </div>
                </div>

                <div className="hidden sm:flex flex-shrink-0 pl-4 border-l border-gray-200 dark:border-white/10 ml-4">
                  <button
                    onClick={() => setViewMode(viewMode === "grid" ? "map" : "grid")}
                    className="h-9 md:h-10 px-5 flex items-center justify-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full shadow-sm hover:scale-105 transition-all active:scale-95 font-bold text-xs"
                  >
                    {viewMode === "grid" ? (
                      <>Map <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg></>
                    ) : (
                      <>List <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg></>
                    )}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </header>

        {/* --- MAIN CONTENT AREA --- */}
        <div className="w-full max-w-[1920px] mx-auto relative z-10 pt-[7rem] md:pt-[10rem] px-4 md:px-8">
          
          <div className="mb-8 md:mb-12 relative">
            <div className="text-center mb-6 md:mb-8 px-2 flex flex-col items-center">
              <h2 className={`${brushFont.className} text-4xl sm:text-5xl md:text-6xl lg:text-[5.5rem] text-gray-800 dark:text-gray-100 tracking-wider mb-2 leading-tight drop-shadow-sm`}>
                {searchQuery ? "Hunting for stays..." : hasActiveFilters ? "Stay in Style." : "Where Comfort Meets the Wild."}
              </h2>
              <div className="h-1 w-20 md:w-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-80 mt-2 mb-6"></div>
            </div>

            <div className="max-w-4xl mx-auto mb-6 md:mb-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 px-1 md:px-0">
               
               <div className="relative group flex-grow h-14 md:h-16">
                  <div className="absolute inset-y-0 left-0 pl-6 md:pl-7 flex items-center pointer-events-none text-gray-400 group-focus-within:text-gray-900 dark:group-focus-within:text-white transition-colors z-10">
                     <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search Arusha's finest..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-full bg-white/80 dark:bg-white/5 backdrop-blur-2xl border border-gray-200/80 dark:border-white/10 text-gray-900 dark:text-white rounded-full pl-14 md:pl-16 pr-6 text-base md:text-lg shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] focus:outline-none focus:border-gray-400 dark:focus:border-white/30 transition-all font-medium placeholder-gray-400 hover:bg-white dark:hover:bg-white/10"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-400 hover:text-red-500 transition-colors z-10">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}
               </div>

               <button
                  onClick={() => setViewMode(viewMode === "grid" ? "map" : "grid")}
                  className="flex-shrink-0 h-14 md:h-16 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full px-8 md:px-10 flex items-center justify-center gap-2 text-base md:text-lg font-bold shadow-[0_8px_30px_rgba(0,0,0,0.15)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-95 transition-all w-full sm:w-auto"
               >
                  {viewMode === "grid" ? (
                    <>Map <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg></>
                  ) : (
                    <>List <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg></>
                  )}
               </button>
            </div>

            <div className="w-[calc(100%+2rem)] -mx-4 px-4 md:w-full md:mx-0 md:px-0 overflow-x-auto [&::-webkit-scrollbar]:hidden pb-2 md:pb-4">
              <div className="flex items-center flex-shrink-0 w-max pr-8 md:pr-0 md:mx-auto">
                 <FilterButtons />
              </div>
            </div>
          </div>

          {!loading && filteredHotels.length > 0 && viewMode === "grid" && (
            <div className="flex justify-between items-end mb-4 md:mb-6 px-2 animate-fade-in">
              <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">
                Showing <span className="text-gray-900 dark:text-white font-bold">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="text-gray-900 dark:text-white font-bold">{Math.min(currentPage * ITEMS_PER_PAGE, filteredHotels.length)}</span> of <span className="text-gray-900 dark:text-white font-bold">{filteredHotels.length}</span> premium stays
              </p>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-40">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
          ) : (
            <>
              {viewMode === "map" ? (
                <div className="w-full h-[65vh] md:h-[75vh] rounded-[2rem] md:rounded-[3rem] overflow-hidden border border-gray-200/50 dark:border-white/10 shadow-2xl relative bg-gray-100 dark:bg-[#0a0a0a] mb-12 animate-fade-in">
                  <iframe 
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(searchQuery ? searchQuery + " Hotel Arusha" : "Hotels in Arusha Tanzania")}&t=m&z=13&output=embed&iwloc=near`}
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    className="absolute inset-0 filter dark:invert-[90%] dark:hue-rotate-180 transition-all duration-700"
                  ></iframe>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-6 lg:gap-8 pb-10 animate-fade-in px-1 md:px-0">
                  {paginatedHotels.length > 0 ? (
                    paginatedHotels.map((hotel) => (
                      <HotelCard key={hotel.id} hotel={hotel} />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-20 md:py-32 bg-white/70 dark:bg-[#0a0a0a]/70 backdrop-blur-xl rounded-[2rem] md:rounded-[3rem] shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.6)] border border-gray-200/50 dark:border-white/10 mt-4">
                      <p className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white mb-3 md:mb-4">No matching hotels</p>
                      <p className="text-gray-600 dark:text-gray-400 font-medium mb-6 md:mb-8 text-sm md:text-lg">Try adjusting your search or removing some filters.</p>
                      <button onClick={clearFilters} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold py-3 md:py-4 px-8 md:px-10 rounded-full transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 text-sm md:text-base">
                        Clear All Filters
                      </button>
                    </div>
                  )}
                </div>
              )}

              {filteredHotels.length > 0 && viewMode === "grid" && (
                <div className="flex justify-center items-center gap-3 md:gap-4 mt-4 md:mt-8 pb-20">
                  <button 
                    onClick={() => { setCurrentPage(prev => Math.max(prev - 1, 1)); scrollToTop(); }}
                    disabled={currentPage === 1}
                    className="bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-2xl border border-gray-200/50 dark:border-white/10 text-gray-700 dark:text-white/70 font-bold py-3 px-5 md:py-4 md:px-8 rounded-full shadow-md hover:shadow-lg hover:bg-white dark:hover:bg-[#222] hover:text-gray-900 dark:hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 md:gap-3 text-sm md:text-base"
                  >
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                    <span className="hidden sm:inline">Previous</span>
                  </button>

                  <div className="bg-white/50 dark:bg-[#1a1a1a]/50 backdrop-blur-sm border border-gray-200/50 dark:border-white/10 px-5 py-3 md:px-8 md:py-4 rounded-full font-black text-gray-600 dark:text-white/50 shadow-sm text-sm md:text-base">
                    {currentPage} / {totalPages}
                  </div>

                  <button 
                    onClick={() => { setCurrentPage(prev => Math.min(prev + 1, totalPages)); scrollToTop(); }}
                    disabled={currentPage === totalPages}
                    className="bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-2xl border border-gray-200/50 dark:border-white/10 text-gray-700 dark:text-white/70 font-bold py-3 px-5 md:py-4 md:px-8 rounded-full shadow-md hover:shadow-lg hover:bg-white dark:hover:bg-[#222] hover:text-gray-900 dark:hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 md:gap-3 text-sm md:text-base"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* SCROLL-TO-TOP BUTTON */}
        <button
          onClick={scrollToTop}
          className={`fixed bottom-6 md:bottom-10 right-4 md:right-8 z-50 p-3.5 md:p-4 bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-xl border border-gray-200/80 dark:border-white/10 rounded-full shadow-lg text-gray-900 dark:text-white transition-all duration-500 transform hover:scale-110 active:scale-95 hover:bg-white dark:hover:bg-[#222] ${
            showBackToTop ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"
          }`}
          aria-label="Scroll to top"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>
        </button>
      </main>

      <Footer />
    </>
  );
}

// 🚀 Wrap the component in Suspense to make Next.js happy with URL params!
export default function DirectoryPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#050505]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    }>
      <DirectoryContent />
    </Suspense>
  );
}