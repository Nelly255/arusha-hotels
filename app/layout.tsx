import './globals.css';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'; 
import type { Metadata, Viewport } from 'next';

// 🚀 1. Initialize Inter for body text
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

// 🚀 2. Initialize Plus Jakarta Sans for headings
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

// Ensures the site is responsive and looks great on mobile
export const viewport: Viewport = {
  themeColor: '#050505',
  width: 'device-width',
  initialScale: 1,
};

// 🚀 UPGRADED PREMIUM SEO METADATA 🚀
export const metadata: Metadata = {
  // CRITICAL: Required for sitemap and OpenGraph image resolution
  metadataBase: new URL('https://arushahotels.com'), 
  
  title: {
    default: 'Arusha Hotels | The Premier Safari & Luxury Accommodation Directory',
    template: '%s | Arusha Hotels', // This automatically makes subpages look clean (e.g., "Directory | Arusha Hotels")
  },
  description: 'Discover the best hotels, lodges, and safari camps across Arusha, Serengeti, Ngorongoro, and Tarangire. Compare top-rated accommodations and book your perfect Tanzanian stay.',
  keywords: [
    "Arusha hotels", "Tanzania safari lodges", "where to stay in Arusha", 
    "Serengeti luxury camps", "Ngorongoro crater hotels", "Tarangire basecamps", 
    "luxury hotels Arusha", "Lake Manyara lodges"
  ],
  
  // --- THIS ADDS YOUR LOGO TO THE BROWSER TAB ---
  icons: {
    icon: '/icon.png', 
    apple: '/apple-touch-icon.png', 
  },

  openGraph: {
    title: 'Arusha Hotels | The Premier Safari & Luxury Accommodation Directory',
    description: 'Discover the best hotels, lodges, and safari camps across Northern Tanzania. Compare top-rated accommodations and book your perfect stay.',
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
    description: 'Discover the best hotels, lodges, and safari camps across Northern Tanzania.',
    images: ['https://images.unsplash.com/photo-1517826500585-e1104eece292?q=80&w=1200&auto=format&fit=crop'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 🚀 3. Inject BOTH CSS variables into the HTML tag
    <html lang="en" className={`dark ${inter.variable} ${jakarta.variable}`}>
      {/* 🚀 4. Use font-sans (which we'll tie to Inter in Tailwind) on the body */}
      <body className="font-sans bg-[#050505] text-slate-100 antialiased selection:bg-blue-500/30">
        {children}
      </body>
    </html>
  );
}