/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // <-- THE MAGIC WILDCARD! Allows ANY secure image domain.
      },
      {
        protocol: 'http',
        hostname: '**', // <-- Catches older, non-secure image domains just in case.
      }
    ],
  },
};

export default nextConfig;