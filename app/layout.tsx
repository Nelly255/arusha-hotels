import './globals.css';
import { Montserrat } from 'next/font/google'; 
import type { Metadata } from 'next';

// Using Montserrat to match that clean, wide, premium look!
const montserrat = Montserrat({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'], // Montserrat safely supports all of these weights
});

// --- THIS IS THE SEO MAGIC FOR WHATSAPP/INSTAGRAM PREVIEWS ---
export const metadata: Metadata = {
  title: 'Arusha Hotels | Rest Before the Adventure.',
  description: 'The ultimate curated directory for luxury, boutique, and premium hotels in Arusha, Tanzania. Discover your perfect stay today.',
  openGraph: {
    title: 'Arusha Hotels | Find Your Perfect Stay',
    description: 'The ultimate curated directory for luxury and premium hotels in Arusha.',
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
    title: 'Arusha Hotels | Premium Directory',
    description: 'Discover the best luxury and boutique hotels in Arusha.',
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
      {/* Applied Montserrat globally to the body */}
      <body className={`${montserrat.className} bg-[#050505] text-slate-100 antialiased selection:bg-blue-500/30`}>
        {children}
      </body>
    </html>
  );
}