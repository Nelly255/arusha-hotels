import { MetadataRoute } from 'next';
import { supabase } from '../lib/supabase'; 

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://arushahotels.com';

  // 1. Fetch hotel IDs dynamically
  const { data: hotels } = await supabase.from('hotels').select('id');

  const hotelUrls: MetadataRoute.Sitemap = (hotels || []).map((hotel) => ({
    url: `${baseUrl}/hotels/${hotel.id}`, 
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // 2. Static core pages
  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/favorites`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/about-us`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.4 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.4 },
  ];

  // 3. Category pages (Programmatic SEO)
  const categoryUrls: MetadataRoute.Sitemap = [
    '/hotels-in-arusha',
    '/boutique-hotels-arusha',
    '/luxury-hotels-arusha',
    '/safari-lodges-arusha',
    '/luxury-lodges-serengeti',
    '/camps-ngorongoro-crater',
    '/tarangire-safari-lodges'
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  // 4. Location pages
  const locationUrls: MetadataRoute.Sitemap = [
    '/hotels-in-njiro-arusha',
    '/hotels-near-kilimanjaro-airport',
    '/hotels-near-lake-manyara',
    '/lodges-central-serengeti',
    '/lodges-karatu-tanzania'
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  // 5. Experience-based pages
  const experienceUrls: MetadataRoute.Sitemap = [
    '/romantic-hotels-arusha',
    '/family-friendly-safari-lodges',
    '/honeymoon-safari-arusha',
    '/eco-lodges-arusha',
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  // 6. Combine everything (NO BLOG!)
  return [
    ...staticUrls,
    ...categoryUrls,
    ...locationUrls,
    ...experienceUrls,
    ...hotelUrls,
  ];
}