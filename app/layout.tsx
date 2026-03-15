import './globals.css';
import { Montserrat } from 'next/font/google'; 
import type { Metadata, Viewport } from 'next';

const montserrat = Montserrat({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'], 
});

// Ensures the site is responsive and looks great on mobile
export const viewport: Viewport = {
  themeColor: '#050505',
  width: 'device-width',
  initialScale: 1,
};

// 🚀 UPGRADED PREMIUM SEO METADATA 🚀
export const metadata: Metadata = {
  title: 'Arusha Hotels | The Premier Safari & Luxury Accommodation Directory',
  description: 'Discover the best hotels, lodges, and safari camps in Arusha, Tanzania. Compare top-rated accommodations, view real-time weather, and book your perfect stay.',
  keywords: ["Arusha hotels", "Tanzania safari lodges", "where to stay in Arusha", "Serengeti basecamp", "luxury hotels Arusha"],
  
  // --- THIS ADDS YOUR LOGO TO THE BROWSER TAB ---
  icons: {
    icon: '/icon.png', 
    apple: '/apple-touch-icon.png', 
  },

  openGraph: {
    title: 'Arusha Hotels | The Premier Safari & Luxury Accommodation Directory',
    description: 'Discover the best hotels, lodges, and safari camps in Arusha, Tanzania. Compare top-rated accommodations and book your perfect stay.',
    url: 'https://arushahotels.com', 
    siteName: 'Arusha Hotels',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1517826500585-e1104eece292?q=80&w=1200&auto=format&fit=crop',
        width: 1200,
        height: 630,
        alt: 'Luxury Arusha Hotel',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Arusha Hotels | The Premier Safari & Luxury Accommodation Directory',
    description: 'Discover the best hotels, lodges, and safari camps in Arusha, Tanzania.',
    images: ['https://images.unsplash.com/photo-1517826500585-e1104eece292?q=80&w=1200&auto=format&fit=crop'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${montserrat.className} bg-[#050505] text-slate-100 antialiased selection:bg-blue-500/30`}>
        {children}
      </body>
    </html>
  );
}