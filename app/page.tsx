"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Caveat_Brush } from "next/font/google";
import { supabase } from "../lib/supabase";
import HotelCard from "../components/HotelCard";
import Footer from "../components/Footer";

const brushFont = Caveat_Brush({ weight: '400', subsets: ['latin'] });

// --- DATA ARRAYS FOR NEW SECTIONS ---
const HERO_IMAGES = [
  "/hero/1.jpeg", "/hero/2.jpg", "/hero/3.jpg", "/hero/4.jpg", 
  "/hero/5.jpg", "/hero/6.webp", "/hero/7.avif", "/hero/8.jpg", "/hero/citya.jpg", "/hero/masai.jpg", "/hero/p5.jpg", "/hero/9.jpg"
];

const VIBES = [
  { id: 1, title: "Safari Basecamps", desc: "Start your wild journey", image: "/safari.avif", keyword: "Safari" },
  { id: 2, title: "Luxury Spa Retreats", desc: "Unwind & recharge", image: "/spa.jpg", keyword: "Spa" },
  { id: 3, title: "Mount Meru Views", desc: "Wake up to the peak", image: "/view.avif", keyword: "Mount Meru" },
  { id: 4, title: "City Convenience", desc: "Heart of Arusha", image: "/city.jpg", keyword: "City" },
  { id: 5, title: "Boutique Hideaways", desc: "Private & exclusive", image: "/Bou.avif", keyword: "Boutique" },
];

// --- COMPONENTS ---
const Reveal = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { setIsVisible(entry.isIntersecting); },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[opacity,transform,filter] ${
        isVisible ? "opacity-100 translate-y-0 scale-100 blur-none" : "opacity-0 translate-y-12 scale-[0.96] blur-[6px]"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default function LandingPage() {
  const [featuredHotels, setFeaturedHotels] = useState<any[]>([]);
  
  // 🚀 NEW: State to hold real, dynamic reviews from Supabase 🚀
  const [realReviews, setRealReviews] = useState<any[]>([]);
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [weather, setWeather] = useState({ temp: "24", icon: "☀️" });

  useEffect(() => {
    async function fetchFeatured() {
      const { data } = await supabase.from('hotels').select('*').eq('is_featured', true).neq('isHidden', true).limit(4);
      if (data) setFeaturedHotels(data);
    }
    
    // 🚀 NEW: Fetch ONLY 5-star reviews to feature on the homepage 🚀
    async function fetchTopReviews() {
      const { data, error } = await supabase
        .from('reviews')
        .select('user_name, comment, rating, created_at')
        .eq('rating', 5)
        .order('created_at', { ascending: false })
        .limit(6); // Grab the top 6 most recent 5-star reviews
        
      if (data) setRealReviews(data);
    }

    fetchFeatured();
    fetchTopReviews();

    async function fetchWeather() {
      try {
        const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=-3.3869&longitude=36.6830&current_weather=true");
        if (res.ok) {
          const data = await res.json();
          const temp = Math.round(data.current_weather.temperature).toString();
          const code = data.current_weather.weathercode;
          let icon = "☀️";
          if (code >= 1 && code <= 3) icon = "⛅";
          else if (code >= 45 && code <= 48) icon = "🌫️";
          else if (code >= 51 && code <= 67) icon = "🌧️";
          else if (code >= 71 && code <= 99) icon = "⛈️";
          setWeather({ temp, icon });
        }
      } catch (err) {
        console.log("Weather fallback applied.");
      }
    }
    fetchWeather();

    const handleScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });

    const slideInterval = setInterval(() => {
      setCurrentBgIndex((prevIndex) => (prevIndex + 1) % HERO_IMAGES.length);
    }, 5000);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearInterval(slideInterval);
    };
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-white font-sans selection:bg-orange-500/30 overflow-x-hidden transition-colors duration-500">
      
      {/* INJECT CUSTOM CSS FOR SCROLLING MARQUEE */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}} />

      {/* 🚀 NAVIGATION 🚀 */}
      <div className={`fixed top-0 left-0 w-full z-50 flex justify-center transition-all duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${isScrolled ? "pt-4 px-4" : "pt-8 px-6 md:px-12"}`}>
        <nav className={`flex items-center justify-between w-full transition-all duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isScrolled 
              ? "max-w-5xl bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-3xl border border-gray-200/50 dark:border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.8)] rounded-[2.5rem] px-6 py-3" 
              : "max-w-[1920px] bg-transparent border-transparent rounded-none px-0 py-0"
          }`}
        >
          <Link href="/" className="hover:opacity-80 transition-opacity drop-shadow-md">
             <svg viewBox="0 0 450 100" preserveAspectRatio="xMinYMid meet" className={`transition-all duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] w-auto ${isScrolled ? "h-12 md:h-14" : "h-12 md:h-16"}`}>
                <defs>
                  <linearGradient id="sunset-home" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FBBF24" />
                    <stop offset="100%" stopColor="#EA580C" />
                  </linearGradient>
                  <clipPath id="circle-clip-home"><circle cx="45" cy="50" r="36" /></clipPath>
                </defs>
                <g transform="translate(0, 0)">
                  <circle cx="45" cy="50" r="36" fill="url(#sunset-home)" />
                  <g clipPath="url(#circle-clip-home)">
                      <polygon points="5,80 35,35 75,80" fill="#ffffff" opacity="0.95"/>
                      <polygon points="40,90 60,45 95,90" fill="#e5e7eb" opacity="0.7"/>
                  </g>
                </g>
                <text x="105" y="54" fontWeight="900" fontSize="36" className={`transition-colors duration-500 ${isScrolled ? "fill-gray-900 dark:fill-white" : "fill-white"}`} letterSpacing="-1">Arusha Hotels</text>
                <text x="108" y="78" fontSize="22" className={`${brushFont.className} fill-orange-600 dark:fill-orange-500`} letterSpacing="1">Rest Before The Adventure.</text>
              </svg>
          </Link>

          <div className={`hidden md:flex items-center transition-all duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isScrolled ? "gap-6 pr-2" : "gap-8 bg-black/30 backdrop-blur-md px-8 py-3 rounded-full border border-white/10"
          }`}>
             <Link href="/directory" className={`text-sm font-bold uppercase tracking-widest transition-colors ${isScrolled ? "text-gray-700 dark:text-gray-200 hover:text-orange-500 dark:hover:text-orange-400" : "text-white/90 hover:text-white"}`}>Directory</Link>
             <Link href="/favorites" className={`text-sm font-bold uppercase tracking-widest transition-colors ${isScrolled ? "text-gray-700 dark:text-gray-200 hover:text-red-500 dark:hover:text-red-400" : "text-white/90 hover:text-white"}`}>Favorites</Link>
          </div>
        </nav>
      </div>

      {/* 1. MASSIVE HERO SECTION */}
      <section className="relative min-h-screen w-full flex flex-col justify-between items-center text-center px-4 pt-40 pb-10 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-black">
          {HERO_IMAGES.map((src, idx) => (
            <Image 
              key={idx} src={src} alt={`Arusha Vibe ${idx + 1}`} fill priority={idx === 0} quality={90}
              className={`object-cover transition-all duration-[2000ms] ease-in-out ${idx === currentBgIndex ? "opacity-100 scale-105" : "opacity-0 scale-100"}`}
            />
          ))}
          <div className="absolute inset-0 bg-black/40 dark:bg-black/60 transition-colors duration-500"></div>
          <div className="absolute bottom-0 left-0 w-full h-32 md:h-48 bg-gradient-to-t from-gray-50 dark:from-[#050505] to-transparent transition-colors duration-500 pointer-events-none"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto flex-1 flex flex-col justify-center items-center w-full">
          <Reveal delay={50}>
            <div className="inline-flex items-center gap-3 bg-black/40 backdrop-blur-md border border-white/20 px-5 py-2.5 rounded-full mb-8 shadow-2xl">
              <span className="text-xl drop-shadow-md">{weather.icon}</span>
              <span className="text-sm font-bold tracking-[0.2em] text-white uppercase">Current Arusha Vibe • {weather.temp}°C</span>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <h2 className={`${brushFont.className} text-3xl md:text-5xl text-orange-400 tracking-wider mb-4 drop-shadow-lg`}>Karibu Tanzania</h2>
          </Reveal>
          <Reveal delay={200}>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 drop-shadow-2xl text-white leading-[1.1]">
              Uncover Arusha's <br/> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Finest Stays.</span>
            </h1>
          </Reveal>
          <Reveal delay={300}>
            <p className="text-lg md:text-2xl text-gray-200 font-medium mb-10 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
              The ultimate curated directory for luxury lodges, boutique hotels, and safari basecamps at the foot of Mount Meru.
            </p>
          </Reveal>
          <Reveal delay={400}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/directory">
                <button className="bg-orange-600 hover:bg-orange-500 text-white font-black text-lg py-5 px-10 rounded-full shadow-[0_0_30px_rgba(234,88,12,0.4)] transition-all active:scale-95 flex items-center gap-3">
                  Find Your Stay <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </button>
              </Link>
              <a href="#premium-picks">
                <button className="bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white font-bold text-lg py-5 px-10 rounded-full transition-all active:scale-95 flex items-center gap-3 group shadow-lg">
                  Premium Picks <span className="group-hover:scale-125 transition-transform duration-300">⭐</span>
                </button>
              </a>
            </div>
          </Reveal>
        </div>

        <Reveal delay={600}>
          <div className="relative z-10 flex flex-col items-center gap-2 animate-bounce opacity-90 mt-8 text-white">
            <span className="text-xs font-bold uppercase tracking-[0.3em]">Discover</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
          </div>
        </Reveal>
      </section>

      {/* BROWSE BY VIBE SECTION */}
      <section className="py-20 relative z-10 transition-colors duration-500">
        <div className="max-w-[1920px] mx-auto px-4 md:px-8">
          <Reveal>
            <div className="mb-10">
              <h2 className={`${brushFont.className} text-3xl md:text-4xl text-orange-500 tracking-wider mb-2`}>Curated Collections</h2>
              <h3 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">Browse by Vibe.</h3>
            </div>
          </Reveal>

          <div className="flex overflow-x-auto gap-4 md:gap-6 pb-8 snap-x [&::-webkit-scrollbar]:hidden w-[calc(100%+2rem)] -mx-4 px-4 md:w-full md:mx-0 md:px-0">
            {VIBES.map((vibe, idx) => (
              <Reveal key={vibe.id} delay={idx * 100}>
                <Link href={`/directory?search=${vibe.keyword}`}>
                  <div className="relative w-64 md:w-80 aspect-[4/5] rounded-[2rem] overflow-hidden group cursor-pointer snap-start flex-shrink-0 shadow-lg dark:shadow-2xl">
                    <img src={vibe.image} alt={vibe.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-6 w-full transform group-hover:-translate-y-2 transition-transform duration-500">
                      <p className="text-orange-400 font-bold text-xs uppercase tracking-widest mb-1">{vibe.desc}</p>
                      <h4 className="text-white text-2xl font-black">{vibe.title}</h4>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* DESTINATION HYPE MAGAZINE SECTION */}
      <section className="py-20 md:py-32 relative z-10 overflow-hidden transition-colors duration-500">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            <Reveal delay={0}>
              <div className="relative h-[500px] md:h-[650px] w-full rounded-[2.5rem] overflow-hidden shadow-2xl">
                <Image src="/meru.avif" alt="Mount Meru" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/50 to-transparent"></div>
                
                <div className="absolute bottom-8 left-8 bg-white/20 dark:bg-black/40 backdrop-blur-xl border border-white/30 rounded-2xl p-6 text-white shadow-2xl max-w-[250px] hidden md:block">
                  <div className="text-3xl mb-2">🏔️</div>
                  <div className="font-black text-xl mb-1">Mount Meru</div>
                  <div className="text-sm font-medium opacity-90">Standing tall at 4,562 meters above the city.</div>
                </div>
              </div>
            </Reveal>

            <div className="flex flex-col justify-center">
              <Reveal delay={150}>
                <h2 className={`${brushFont.className} text-3xl md:text-5xl text-orange-500 tracking-wider mb-4`}>The Gateway City</h2>
              </Reveal>
              <Reveal delay={250}>
                <h3 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tight mb-8 leading-[1.1]">
                  More than just a <br/> stopover.
                </h3>
              </Reveal>
              <Reveal delay={350}>
                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 font-medium mb-6 leading-relaxed">
                  Arusha is the undeniable safari capital of the world. Nestled at the base of Mount Meru, it is the starting point for the Serengeti, Ngorongoro Crater, and Kilimanjaro.
                </p>
                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 font-medium mb-10 leading-relaxed">
                  But look closer, and you'll find a vibrant hub of lush coffee plantations, rich cultural heritage, hidden waterfalls, and some of the most spectacular boutique lodges in East Africa.
                </p>
              </Reveal>
              <Reveal delay={450}>
                <Link href="/explore">
                  <button className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-lg py-4 px-10 rounded-full shadow-[0-0-20px-rgba(234,88,12,0.3)] transition-all active:scale-95 flex items-center gap-3 w-max">
                    Explore the Region <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </button>
                </Link>
              </Reveal>
            </div>

          </div>
        </div>
      </section>

      {/* 2. THEME ADAPTIVE TRUST SECTION */}
      <section className="py-24 relative z-10 overflow-hidden transition-colors duration-500">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-orange-500/5 dark:bg-orange-900/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-[1400px] mx-auto px-4 md:px-8 relative z-10">
          <Reveal>
            <div className="text-center mb-20">
              <h2 className="text-sm font-black uppercase tracking-[0.3em] text-gray-500 mb-4">The Arusha Hotels Standard</h2>
              <h3 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">Elevating your Tanzanian journey.</h3>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <Reveal delay={100}>
              <div className="group relative bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 p-10 rounded-[2.5rem] hover:border-gray-300 dark:hover:border-white/20 transition-all duration-500 hover:-translate-y-2 h-full overflow-hidden shadow-xl dark:shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 rounded-2xl flex items-center justify-center mb-8 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-all duration-500 shadow-sm dark:shadow-inner">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" /></svg>
                  </div>
                  <h3 className="text-2xl font-black mb-4 text-gray-900 dark:text-white">Handpicked Stays</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">Every property is strictly vetted to ensure premium quality, stunning views, and top-tier hospitality.</p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={250}>
              <div className="group relative bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 p-10 rounded-[2.5rem] hover:border-gray-300 dark:hover:border-white/20 transition-all duration-500 hover:-translate-y-2 h-full overflow-hidden shadow-xl dark:shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl flex items-center justify-center mb-8 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-all duration-500 shadow-sm dark:shadow-inner">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg>
                  </div>
                  <h3 className="text-2xl font-black mb-4 text-gray-900 dark:text-white">Live Conversions</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">No more guessing. Toggle instantly between USD and Tanzanian Shillings based on real-time global exchange rates.</p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={400}>
              <div className="group relative bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 p-10 rounded-[2.5rem] hover:border-gray-300 dark:hover:border-white/20 transition-all duration-500 hover:-translate-y-2 h-full overflow-hidden shadow-xl dark:shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20 rounded-2xl flex items-center justify-center mb-8 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-all duration-500 shadow-sm dark:shadow-inner">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" /></svg>
                  </div>
                  <h3 className="text-2xl font-black mb-4 text-gray-900 dark:text-white">Direct Booking</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">We don't charge hidden fees or take commissions. We connect you directly to the hotel's official booking engine.</p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 3. THEME ADAPTIVE SNEAK PEEK SECTION */}
      {featuredHotels && featuredHotels.length > 0 && (
        <section id="premium-picks" className="py-24 relative z-10 transition-colors duration-500">
          <div className="max-w-[1920px] mx-auto px-4 md:px-8">
            <Reveal>
              <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                <div>
                  <h2 className={`${brushFont.className} text-4xl text-yellow-500 tracking-wider mb-2`}>Premium Picks</h2>
                  <h3 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">Our Top Recommendations.</h3>
                </div>
                <Link href="/directory">
                  <button className="text-sm font-bold uppercase tracking-widest text-orange-600 dark:text-orange-400 hover:text-orange-500 transition-colors flex items-center gap-2">
                    View Full Directory →
                  </button>
                </Link>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredHotels.map((hotel, idx) => (
                <Reveal key={hotel.id} delay={idx * 150}>
                  <HotelCard hotel={hotel} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 🚀 DYNAMIC VIP GUESTBOOK (ONLY SHOWS IF REVIEWS EXIST) 🚀 */}
      {realReviews && realReviews.length > 0 && (
        <section className="py-24 relative z-10 overflow-hidden bg-white/50 dark:bg-black/20 border-y border-gray-200/50 dark:border-white/5">
          <Reveal>
            <div className="text-center mb-16 px-4">
              <h2 className={`${brushFont.className} text-3xl md:text-4xl text-orange-500 tracking-wider mb-2`}>Traveler Stories</h2>
              <h3 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">Don't just take our word for it.</h3>
            </div>
          </Reveal>

          <div className="w-full overflow-hidden relative flex">
            <div className="absolute top-0 left-0 w-16 md:w-32 h-full bg-gradient-to-r from-gray-50 dark:from-[#050505] to-transparent z-20 pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-16 md:w-32 h-full bg-gradient-to-l from-gray-50 dark:from-[#050505] to-transparent z-20 pointer-events-none"></div>
            
            <div className="flex animate-marquee w-max hover:[animation-play-state:paused] cursor-pointer">
              {[...realReviews, ...realReviews].map((review, idx) => (
                <div key={idx} className="w-[350px] md:w-[450px] mx-4 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-3xl p-8 flex-shrink-0 shadow-lg dark:shadow-2xl">
                  <div className="flex gap-1 mb-4 text-orange-500">
                    <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-lg font-medium mb-6 leading-relaxed">"{review.comment}"</p>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center font-bold text-gray-500 dark:text-gray-400">
                      {review.user_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{review.user_name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Verified Guest</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. THEME ADAPTIVE CALL TO ACTION */}
      <section className="py-32 relative z-10 flex flex-col items-center text-center px-4 overflow-hidden transition-colors duration-500">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-orange-500/10 dark:bg-orange-600/10 blur-[150px] rounded-full pointer-events-none"></div>
        
        <Reveal delay={0}>
          <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight text-gray-900 dark:text-white relative z-10">Ready to pack your bags?</h2>
        </Reveal>
        <Reveal delay={150}>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl font-medium relative z-10">Join thousands of travelers who found their perfect Arusha basecamp through our platform.</p>
        </Reveal>
        <Reveal delay={300}>
          <Link href="/directory">
            <button className="bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 font-black text-xl py-6 px-12 rounded-full shadow-[0_0_40px_rgba(0,0,0,0.1)] dark:shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-all active:scale-95 relative z-10">
              Start Browsing Now
            </button>
          </Link>
        </Reveal>
      </section>

      <Footer />
    </main>
  );
}