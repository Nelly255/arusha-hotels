import { supabase } from '../../lib/supabase';
import HotelCard from '../../components/HotelCard';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

// 1. Map our SEO slugs to actual search logic
const seoPages: Record<string, { title: string, subtitle: string, searchKeyword: string }> = {
  'safari-lodges-arusha': { title: 'Safari Lodges in Arusha', subtitle: 'Start your wild journey at these premium basecamps.', searchKeyword: 'safari' },
  'luxury-hotels-arusha': { title: 'Luxury Spa Retreats', subtitle: 'Unwind and recharge in ultimate comfort.', searchKeyword: 'spa' },
  'hotels-near-mount-meru': { title: 'Mount Meru Views', subtitle: 'Wake up to breathtaking peaks.', searchKeyword: 'meru' },
  'hotels-in-arusha': { title: 'City Convenience', subtitle: 'The finest stays right in the heart of Arusha.', searchKeyword: 'arusha' },
  'boutique-hotels-arusha': { title: 'Boutique Hideaways', subtitle: 'Intimate, private, and exclusive accommodations.', searchKeyword: 'boutique' },
};

// 2. Generate dynamic SEO for the category
export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const pageData = seoPages[resolvedParams.category];
  
  if (!pageData) return { title: 'Not Found' };
  
  return {
    title: `${pageData.title} | Arusha Hotels`,
    description: pageData.subtitle,
  };
}

// 3. Render the page
export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const resolvedParams = await params;
  const pageData = seoPages[resolvedParams.category];

  // If the URL doesn't match our allowed SEO pages, throw a 404
  if (!pageData) {
    return notFound();
  }

  // Fetch hotels that match this category's keyword (searching name or description)
  const { data: hotels } = await supabase
    .from('hotels')
    .select('*')
    .or(`name.ilike.%${pageData.searchKeyword}%,description.ilike.%${pageData.searchKeyword}%`)
    .neq('isHidden', true);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#050505] pt-32 pb-20 px-4 md:px-8">
      <div className="max-w-[1920px] mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tight mb-4">
            {pageData.title}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
            {pageData.subtitle}
          </p>
        </div>

        {hotels && hotels.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {hotels.map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-xl text-gray-500 dark:text-gray-400">We are currently curating more premium properties for this collection.</p>
          </div>
        )}
      </div>
    </main>
  );
}