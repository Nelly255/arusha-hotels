"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Footer from "../../components/Footer";
import { Caveat_Brush } from "next/font/google";
import { supabase } from "../../lib/supabase"; 

const brushFont = Caveat_Brush({ weight: '400', subsets: ['latin'] });

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
      className={`transition-all duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-12 scale-[0.98]"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

interface Attraction {
  id: number;
  title: string;
  location?: string; 
  description: string;
  image_url: string;
}

export default function ExplorePage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showTopBtn, setShowTopBtn] = useState(false); // New state for the button
  
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [visibleCount, setVisibleCount] = useState(4); 
  const [temp, setTemp] = useState<number | null>(null);

  // Magic scroll function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);
      setShowTopBtn(window.scrollY > 400); // Show button after 400px of scrolling
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    async function fetchAttractions() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('attractions')
          .select('*')
          .eq('is_active', true)
          .order('id', { ascending: true });

        if (error) throw error;
        if (data) setAttractions(data);
      } catch (error) {
        console.error("Error fetching attractions:", error);
      } finally {
        setLoading(false);
      }
    }
    
    async function fetchWeather() {
      try {
        const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=-3.3667&longitude=36.6833&current_weather=true");
        const data = await res.json();
        setTemp(Math.round(data.current_weather.temperature));
      } catch (e) {
        console.error("Failed to fetch weather", e);
      }
    }

    fetchAttractions();
    fetchWeather();
  }, []);

  const visibleAttractions = attractions.slice(0, visibleCount);

  return (
    <main className="min-h-screen bg-[#FDFBF7] dark:bg-[#050505] text-[#2C241B] dark:text-[#E8E3D9] font-sans selection:bg-orange-500/30 overflow-x-hidden transition-colors duration-500">
      
      {/* FLOATY GLASSY NAVIGATION */}
      <div className={`fixed top-0 left-0 w-full z-50 flex justify-center transition-all duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${isScrolled ? "pt-4 px-4" : "pt-8 px-6 md:px-12"}`}>
        <nav className={`flex items-center justify-between w-full transition-all duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isScrolled 
              ? "max-w-5xl bg-[#FDFBF7]/90 dark:bg-[#050505]/80 backdrop-blur-3xl border border-[#3E2723]/10 dark:border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.8)] rounded-[2.5rem] px-6 py-3" 
              : "max-w-[1920px] bg-transparent border-transparent rounded-none px-0 py-0"
          }`}
        >
          <Link href="/" className="group flex items-center gap-3 md:gap-4 hover:opacity-90 transition-opacity">
            <svg viewBox="0 0 100 100" preserveAspectRatio="xMinYMid meet" className={`transition-all duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] w-auto ${isScrolled ? "h-10 md:h-12" : "h-12 md:h-14"}`}>
              <defs>
                <linearGradient id="sunset-explore" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#D97706" /><stop offset="100%" stopColor="#9A3412" />
                </linearGradient>
                <clipPath id="circle-clip-explore"><circle cx="50" cy="50" r="50" /></clipPath>
              </defs>
              <circle cx="50" cy="50" r="50" fill="url(#sunset-explore)" />
              <g clipPath="url(#circle-clip-explore)">
                  <polygon points="10,90 50,30 90,90" fill="#ffffff" opacity="0.95"/>
                  <polygon points="45,100 70,45 110,100" fill="#e5e7eb" opacity="0.7"/>
              </g>
            </svg>
            <div className="flex flex-col justify-center">
              <span className={`font-black tracking-tight text-[#574233] dark:text-[#E8E3D9] transition-all duration-[800ms] ${isScrolled ? "text-xl md:text-2xl" : "text-2xl md:text-3xl"} leading-none mb-1`}>
                Arusha Hotels
              </span>
              
              {/* Magic Hover Text Container */}
              <div className="relative h-3 md:h-4 w-full overflow-hidden flex items-center">
                <span className={`absolute left-0 text-[#D97706] font-bold uppercase tracking-[0.2em] transition-all duration-300 group-hover:-translate-y-[150%] group-hover:opacity-0 ${isScrolled ? "text-[8px] md:text-[10px]" : "text-[10px] md:text-xs"} leading-none`}>
                  The Geneva of Africa
                </span>
                <span className={`absolute left-0 text-orange-500 font-black uppercase tracking-[0.2em] transition-all duration-300 translate-y-[150%] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 ${isScrolled ? "text-[8px] md:text-[10px]" : "text-[10px] md:text-xs"} leading-none whitespace-nowrap`}>
                  ← Go Back Home
                </span>
              </div>

            </div>
          </Link>

          <div className={`flex items-center transition-all duration-[800ms] ${isScrolled ? "gap-4 pr-2" : "gap-6 bg-[#3E2723]/5 dark:bg-white/5 backdrop-blur-md px-6 py-2.5 rounded-full border border-[#3E2723]/10 dark:border-white/10"}`}>
             <div className="flex items-center gap-3 text-[#574233] dark:text-[#E8E3D9]">
                <div className="text-2xl drop-shadow-md">🌤️</div>
                <div className="flex flex-col hidden sm:flex">
                   <span className="text-xs font-black tracking-widest uppercase leading-none mb-1">Arusha, TZ</span>
                   <span className="text-[10px] font-bold text-[#D97706] leading-none">
                     {temp !== null ? `${temp}°C / Current` : 'Loading...'}
                   </span>
                </div>
             </div>
          </div>
        </nav>
      </div>

      {/* HERO SECTION */}
      <section className="pt-40 pb-16 md:pt-48 md:pb-32 px-4 relative">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <Reveal>
            <h2 className="text-sm md:text-base font-black uppercase tracking-[0.3em] text-[#8B5E34] mb-4">The Geneva of Africa</h2>
            {/* Reduced heading sizes */}
            <h1 className={`${brushFont.className} text-5xl md:text-7xl lg:text-[8rem] tracking-tight mb-8 text-[#3E2723] dark:text-white leading-[0.9]`}>
              Discover the soul<br/> of Northern Tanzania.
            </h1>
          </Reveal>
          <Reveal delay={150}>
            {/* Reduced from text-xl md:text-3xl to text-base md:text-xl */}
            <p className="text-base md:text-xl text-[#6D4C41] dark:text-gray-400 font-medium leading-relaxed mb-10 max-w-3xl mx-auto">
              Sitting directly exactly halfway between Cairo and Cape Town, Arusha is much more than just a staging point for safaris. It is a vibrant, green, and culturally rich city sitting in the shadow of Mount Meru.
            </p>
          </Reveal>
        </div>
      </section>

      {/* EDGE-TO-EDGE "RIPPED PAPER" SPLIT SECTION */}
      <section className="relative w-full overflow-hidden z-10 mb-32">
        <div className="flex flex-col md:flex-row w-full items-stretch bg-white dark:bg-[#1A1A1A] shadow-2xl">
          
          <div className="w-full md:w-[55%] py-16 px-6 md:px-12 lg:px-24 flex flex-col justify-center relative z-20">
            <Reveal>
              {/* Reduced heading from 5xl/7xl to 4xl/6xl */}
              <h2 className={`${brushFont.className} text-4xl md:text-6xl text-[#3E2723] dark:text-[#E8E3D9] tracking-wide mb-8 uppercase`}>
                A clash of ancient and modern.
              </h2>
            </Reveal>
            <Reveal delay={100}>
              {/* Reduced paragraphs from text-xl md:text-2xl to text-base md:text-lg */}
              <p className="text-base md:text-lg text-[#574233] dark:text-gray-400 leading-relaxed mb-6 font-medium">
                Originally founded by German colonists in 1900 as a military garrison, Arusha has evolved into Tanzania’s diplomatic hub. Walk through the bustling central market and you'll see a beautiful collision of cultures: modern diplomats in suits crossing paths with Maasai warriors draped in traditional bright red shukas.
              </p>
              <p className="text-base md:text-lg text-[#574233] dark:text-gray-400 leading-relaxed mb-10 font-medium">
                Take a photo at the famous Clock Tower roundabout—legend dictates it marks the exact midpoint between the northernmost and southernmost tips of the African continent.
              </p>
            </Reveal>
            <Reveal delay={200}>
              <Link href="/directory">
                <button className="bg-[#D97706] hover:bg-[#B45309] text-white font-black text-sm md:text-base uppercase tracking-widest py-4 px-10 transition-all active:scale-95 rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 w-max">
                  Explore Lodges
                </button>
              </Link>
            </Reveal>
          </div>

          <div className="w-full md:w-[45%] relative min-h-[400px] md:min-h-[700px]">
            <img src="/masa.jpg" alt="Maasai Culture" className="absolute inset-0 w-full h-full object-cover" />
            
            {/* The SVG Ripped Edge */}
            <svg className="absolute -left-[1px] top-0 h-full w-12 md:w-20 text-white dark:text-[#1A1A1A] fill-current z-10 drop-shadow-[10px_0_15px_rgba(0,0,0,0.2)] dark:drop-shadow-[10px_0_15px_rgba(0,0,0,0.8)] hidden md:block" preserveAspectRatio="none" viewBox="0 0 100 1000">
              <path d="M0,0 L40,0 L25,30 L50,60 L20,90 L45,120 L15,150 L50,180 L25,210 L40,240 L10,270 L50,300 L30,330 L45,360 L20,390 L50,420 L25,450 L40,480 L15,510 L50,540 L20,570 L45,600 L10,630 L50,660 L30,690 L45,720 L20,750 L50,780 L25,810 L40,840 L15,870 L50,900 L20,930 L45,960 L25,990 L40,1000 L0,1000 Z"/>
            </svg>

            {/* Mobile Top Ripped Edge */}
            <svg className="absolute left-0 -top-[1px] w-full h-8 text-white dark:text-[#1A1A1A] fill-current z-10 drop-shadow-[0_10px_15px_rgba(0,0,0,0.2)] md:hidden" preserveAspectRatio="none" viewBox="0 0 1000 100">
              <path d="M0,0 L0,40 L30,25 L60,50 L90,20 L120,45 L150,15 L180,50 L210,25 L240,40 L270,10 L300,50 L330,30 L360,45 L390,20 L420,50 L450,25 L480,40 L510,15 L540,50 L570,20 L600,45 L630,10 L660,50 L690,30 L720,45 L750,20 L780,50 L810,25 L840,40 L870,15 L900,50 L930,20 L960,45 L990,25 L1000,40 L1000,0 Z"/>
            </svg>
          </div>
        </div>
      </section>

      {/* EDGE-TO-EDGE ATTRACTIONS SHOWCASE */}
      <section className="py-16 px-6 md:px-12 lg:px-24 xl:px-32 w-full max-w-[1920px] mx-auto mt-10">
        <Reveal>
          <div className="text-center mb-24">
            <h2 className="text-sm md:text-base font-black uppercase tracking-[0.3em] text-[#8B5E34] mb-4">Beyond the Serengeti</h2>
            {/* Reduced heading from 6xl/8xl to 5xl/7xl */}
            <h3 className={`${brushFont.className} text-5xl md:text-7xl font-black text-[#3E2723] dark:text-white tracking-tight`}>Must-See Arusha.</h3>
          </div>
        </Reveal>

        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#D97706]"></div>
          </div>
        ) : attractions.length > 0 ? (
          <div className="space-y-24 md:space-y-32">
            {visibleAttractions.map((item, idx) => (
              <div key={item.id} className={`flex flex-col gap-8 md:gap-16 items-center group ${idx % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                <div className="w-full md:w-1/2 relative">
                  <Reveal delay={100}>
                    <div className={`absolute inset-0 bg-[#E8E3D9] dark:bg-[#1A1510] transform ${idx % 2 === 0 ? '-rotate-3' : 'rotate-3'} w-full h-full rounded-[2rem] md:rounded-[3rem] shadow-2xl transition-transform duration-700 group-hover:rotate-0`}></div>
                    <div className="relative aspect-[4/3] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.2)] dark:shadow-[0_30px_60px_rgba(0,0,0,0.8)] bg-white dark:bg-[#1A1A1A] border-[8px] md:border-[16px] border-white dark:border-[#222] rounded-[2rem] md:rounded-[3rem] transition-all duration-700 group-hover:scale-[1.02]">
                      <img src={item.image_url} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
                    </div>
                  </Reveal>
                </div>
                <div className="w-full md:w-1/2 flex flex-col justify-center px-2 md:px-12">
                  <Reveal delay={200}>
                    {/* Tamed the giant numbers slightly */}
                    <div className={`${brushFont.className} text-[#D97706] text-7xl md:text-8xl opacity-20 mb-4 leading-none`}>
                      {(idx + 1).toString().padStart(2, '0')}
                    </div>
                    
                    {item.location && (
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-[#D97706] text-lg">📍</span>
                        <span className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-[#8B5E34] dark:text-[#D97706]">{item.location}</span>
                      </div>
                    )}
                    
                    {/* Reduced heading size */}
                    <h4 className={`${brushFont.className} text-4xl md:text-5xl font-black text-[#3E2723] dark:text-white mb-6 tracking-tight leading-none`}>{item.title}</h4>
                    
                    {/* Reduced description font from text-xl/2xl to text-base/lg */}
                    <p className="text-base md:text-lg text-[#6D4C41] dark:text-gray-400 font-medium leading-relaxed">{item.description}</p>
                  </Reveal>
                </div>
              </div>
            ))}

            {visibleCount < attractions.length && (
              <Reveal>
                <div className="flex justify-center mt-24">
                  <button 
                    onClick={() => setVisibleCount(prev => prev + 4)}
                    className="bg-transparent border-2 border-[#D97706] text-[#D97706] hover:bg-[#D97706] hover:text-white font-black uppercase tracking-widest text-sm md:text-base py-4 px-10 rounded-full transition-all active:scale-95 shadow-lg hover:shadow-2xl"
                  >
                    Load More Experiences ↓
                  </button>
                </div>
              </Reveal>
            )}

          </div>
        ) : (
          <div className="text-center py-32 text-[#6D4C41] dark:text-gray-400 font-medium text-xl">
            More incredible experiences coming soon...
          </div>
        )}
      </section>

      {/* WIDER GLASSY CTA SECTION */}
      <section className="py-24 px-4 md:px-12 lg:px-24 relative overflow-hidden flex justify-center mt-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#D97706]/10 blur-[150px] rounded-full pointer-events-none"></div>
        
        <div className="w-full max-w-[1400px] relative z-10 bg-white/40 dark:bg-black/20 backdrop-blur-3xl border border-white/60 dark:border-white/5 rounded-[3rem] p-12 md:p-24 text-center shadow-[0_30px_80px_rgba(0,0,0,0.05)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
          <Reveal>
            {/* Reduced CTA heading */}
            <h2 className={`${brushFont.className} text-5xl md:text-7xl font-black mb-6 tracking-tight text-[#3E2723] dark:text-white`}>Experience it yourself.</h2>
            {/* Reduced CTA subtext */}
            <p className="text-lg md:text-xl text-[#6D4C41] dark:text-gray-400 mb-10 font-medium max-w-2xl mx-auto">Now that you know the region, find your perfect luxury basecamp.</p>
            <Link href="/directory">
              <button className="bg-[#3E2723] hover:bg-[#2C1A14] dark:bg-[#E8E3D9] dark:hover:bg-white dark:text-black text-white font-black uppercase tracking-widest text-sm md:text-base py-5 px-12 rounded-full transition-all active:scale-95 shadow-2xl hover:-translate-y-1 inline-flex items-center gap-3">
                Browse Directory <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </button>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* SCROLL TO TOP BUTTON */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 md:bottom-12 md:right-12 z-50 p-4 rounded-full bg-[#D97706] text-white shadow-2xl backdrop-blur-md transition-all duration-500 hover:bg-[#B45309] hover:-translate-y-2 hover:shadow-[0_10px_20px_rgba(217,119,6,0.4)] ${
          showTopBtn ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-10 scale-50 pointer-events-none"
        }`}
        aria-label="Scroll to top"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>

      <Footer />
    </main>
  );
}