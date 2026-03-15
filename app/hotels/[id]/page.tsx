import { supabase } from "../../../lib/supabase";
import Link from "next/link";
import Image from "next/image"; 
import { notFound } from "next/navigation";
import ReviewSection from "../../../components/ReviewSection";
import InteractiveBookingCard from "../../../components/InteractiveBookingCard"; 
import FavoriteButton from "../../../components/FavoriteButton"; 
import ImageGallery from "../../../components/ImageGallery"; 
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;

  const { data: hotel } = await supabase
    .from("hotels")
    .select("name, description, imageUrl, location")
    .eq("id", resolvedParams.id)
    .single();

  if (!hotel) return { title: "Hotel Not Found" };

  const siteTitle = `${hotel.name} | Arusha Hotels`;
  const siteDesc = hotel.description.substring(0, 160);

  return {
    title: siteTitle,
    description: siteDesc,
    openGraph: {
      title: siteTitle,
      description: siteDesc,
      url: `https://arushahotels.com/hotels/${resolvedParams.id}`,
      siteName: "Arusha Hotels",
      images: [
        {
          url: hotel.imageUrl,
          width: 1200,
          height: 630,
          alt: `View of ${hotel.name} in ${hotel.location}`,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: siteTitle,
      description: siteDesc,
      images: [hotel.imageUrl],
    },
  };
}

export default async function HotelDetailsPage({ params }: PageProps) {
  const resolvedParams = await params;

  const { data: hotel, error } = await supabase
    .from("hotels")
    .select("*")
    .eq("id", resolvedParams.id)
    .single();

  if (error || !hotel) {
    return notFound();
  }

  const mapQuery = encodeURIComponent(`${hotel.name} ${hotel.location}`);

  let currentTemp = "24"; 
  let weatherIcon = "☀️";
  try {
    const weatherRes = await fetch("https://api.open-meteo.com/v1/forecast?latitude=-3.3869&longitude=36.6830&current_weather=true", { next: { revalidate: 3600 } });
    if (weatherRes.ok) {
      const weatherData = await weatherRes.json();
      currentTemp = Math.round(weatherData.current_weather.temperature).toString();
      const code = weatherData.current_weather.weathercode;
      if (code >= 1 && code <= 3) weatherIcon = "⛅";
      else if (code >= 45 && code <= 48) weatherIcon = "🌫️";
      else if (code >= 51 && code <= 67) weatherIcon = "🌧️";
      else if (code >= 71 && code <= 99) weatherIcon = "⛈️";
    }
  } catch (err) {
    console.log("Weather fetch skipped, using fallback.");
  }

  return (
    <main className="relative min-h-screen font-sans overflow-x-hidden selection:bg-blue-500/30">

      <div className="fixed inset-0 z-0 w-full h-full">
        <Image
          src={hotel.imageUrl}
          alt={hotel.name}
          fill
          priority 
          className="object-cover"
          sizes="100vw"
          quality={100}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80 dark:from-black/80 dark:via-black/60 dark:to-[#050505] transition-colors duration-700"></div>
      </div>

      <div className="fixed top-8 left-4 md:left-8 z-50">
        <Link
          href="/directory"
          className="group flex items-center gap-3 bg-white/10 hover:bg-white/20 dark:bg-black/30 dark:hover:bg-black/50 backdrop-blur-md border border-white/20 px-5 py-2.5 rounded-full transition-all duration-300 text-white shadow-lg hover:shadow-xl hover:scale-105"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 transition-transform group-hover:-translate-x-1"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
          <span className="text-xs font-bold tracking-widest uppercase">Directory</span>
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-[1300px] mx-auto px-4 md:px-8 pt-32 pb-32">
        
        <div className="mb-12 md:mb-16 max-w-4xl">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-white drop-shadow-2xl mb-6 leading-[1.1]">
            {hotel.name}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-white/90">
            <span className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/10 text-sm font-semibold tracking-wide shadow-xl">
              <span className="text-red-400 text-base">📍</span> {hotel.location}
            </span>
            <span className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/10 text-sm font-semibold tracking-wide shadow-xl text-yellow-400">
              ⭐ {hotel.rating} Rating
            </span>
            <FavoriteButton hotelId={hotel.id} />
            <ImageGallery mainImage={hotel.imageUrl} gallery={hotel.image_gallery} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          <div className="lg:col-span-7 flex flex-col gap-8">
            <div className="bg-white/70 dark:bg-[#0a0a0a]/50 backdrop-blur-3xl border border-white/60 dark:border-white/10 rounded-3xl p-8 md:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all">
              <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] mb-6">
                The Experience
              </h2>
              <p className="text-gray-800 dark:text-gray-200 text-lg md:text-xl leading-relaxed font-light whitespace-pre-wrap">
                {hotel.description}
              </p>
            </div>

            <div className="bg-white/70 dark:bg-[#0a0a0a]/50 backdrop-blur-3xl border border-white/60 dark:border-white/10 rounded-3xl p-8 md:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all">
              <ReviewSection hotelId={hotel.id} />
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-8 lg:sticky lg:top-32">
            
            <div className="bg-white/70 dark:bg-[#0a0a0a]/50 backdrop-blur-3xl border border-white/60 dark:border-white/10 rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex justify-between items-center transition-all">
              <div>
                <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] mb-1">Live in Arusha</h2>
                <p className="text-gray-800 dark:text-gray-200 font-medium">Current Weather</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-4xl drop-shadow-md">{weatherIcon}</span>
                <span className="text-4xl font-light text-gray-900 dark:text-white tracking-tighter">{currentTemp}°C</span>
              </div>
            </div>
            
            {/* The upgraded dual-button InteractiveBookingCard! */}
            <InteractiveBookingCard price={hotel.pricePerNight} officialUrl={hotel.officialUrl} booking_url={hotel.booking_url} />

            {(hotel.phone_number || hotel.instagram_handle) && (
              <div className="bg-white/70 dark:bg-[#0a0a0a]/50 backdrop-blur-3xl border border-white/60 dark:border-white/10 rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all">
                <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] mb-5">
                  Get in Touch
                </h2>
                <div className="flex flex-col gap-4">
                  {hotel.phone_number && (
                    <a href={`tel:${hotel.phone_number.replace(/\s+/g, '')}`} className="flex items-center gap-4 text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium group">
                      <span className="bg-white/50 dark:bg-white/5 border border-white/30 dark:border-white/10 p-2.5 rounded-full shadow-sm text-gray-700 dark:text-gray-300 group-hover:text-blue-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                      </span> 
                      {hotel.phone_number}
                    </a>
                  )}
                  {hotel.instagram_handle && (
                    <a href={`https://instagram.com/${hotel.instagram_handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-gray-800 dark:text-gray-200 hover:text-pink-600 dark:hover:text-pink-400 transition-colors font-medium group">
                      <span className="bg-white/50 dark:bg-white/5 border border-white/30 dark:border-white/10 p-2.5 rounded-full shadow-sm text-gray-700 dark:text-gray-300 group-hover:text-pink-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                        </svg>
                      </span> 
                      {hotel.instagram_handle.startsWith('@') ? hotel.instagram_handle : `@${hotel.instagram_handle}`}
                    </a>
                  )}
                </div>
              </div>
            )}

            {hotel.amenities && hotel.amenities.length > 0 && (
              <div className="bg-white/70 dark:bg-[#0a0a0a]/50 backdrop-blur-3xl border border-white/60 dark:border-white/10 rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all">
                <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] mb-5">
                  Included Amenities
                </h2>
                <div className="flex flex-wrap gap-2.5">
                  {hotel.amenities.map((amenity: string, idx: number) => (
                    <span
                      key={idx}
                      className="bg-white/50 dark:bg-white/5 border border-gray-300/50 dark:border-white/10 text-gray-800 dark:text-gray-200 font-medium px-4 py-2 rounded-full text-sm backdrop-blur-md shadow-sm"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white/70 dark:bg-[#0a0a0a]/50 backdrop-blur-3xl border border-white/60 dark:border-white/10 rounded-3xl p-3 shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all">
              <div className="w-full h-48 md:h-56 rounded-2xl overflow-hidden relative bg-gray-200 dark:bg-gray-800 border border-white/50 dark:border-white/5">
                <iframe 
                  /* 🔥 FIXED: Now points to the correct Google Maps embed URL with the '$' symbol 🔥 */
                  src={`https://maps.google.com/maps?q=${mapQuery}&t=m&z=15&output=embed&iwloc=near`}
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0"
                  title={`Map showing location of ${hotel.name}`}
                ></iframe>
              </div>
              <div className="mt-3 px-2 pb-2">
                <a 
                  /* 🔥 FIXED: Correct external Google Maps link with the '$' symbol 🔥 */
                  href={`https://maps.google.com/maps?q=${mapQuery}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-bold text-sm py-3 transition-colors block"
                >
                  View on Google Maps ↗
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}