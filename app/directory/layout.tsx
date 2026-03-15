import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse All Properties | Arusha Hotels",
  description: "Explore our curated directory of 28+ premium hotels, eco-lodges, and resorts in Arusha. Filter by price, amenities, and location to find your ideal Tanzanian getaway.",
};

export default function DirectoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}