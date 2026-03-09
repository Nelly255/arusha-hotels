import { MetadataRoute } from 'next';
import { supabase } from '../lib/supabase'; // Adjust this path if your lib folder is somewhere else!

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Fetch all hotel IDs from your database
  const { data: hotels } = await supabase
    .from('hotels')
    .select('id');

  // 2. Loop through them and create a specific SEO URL for every single hotel
  const hotelUrls: MetadataRoute.Sitemap = (hotels || []).map((hotel) => ({
    url: `https://arushahotels.com/hotels/${hotel.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8, // Tells Google these are highly important pages
  }));

  // 3. Define your core static pages
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: 'https://arushahotels.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0, // Homepage is the absolute #1 priority
    },
    {
      url: 'https://arushahotels.com/favorites',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // 4. Combine them all and serve them to Google!
  return [...staticUrls, ...hotelUrls];
}