export interface HotelProps {
  id: string;
  name: string;
  location: string;
  pricePerNight: number;
  rating: number;
  imageUrl: string;
  description: string;
  isHidden?: boolean;
  amenities?: string[];
  officialUrl?: string; // <-- Our new bridge link
}

export const mockHotels: HotelProps[] = [
  {
    id: "1",
    name: "Gran Melia Arusha",
    location: "Simeon Road, Arusha",
    pricePerNight: 250,
    rating: 4.8,
    imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800",
    description: "An oasis of luxury offering spectacular views of Mount Meru. Features a state-of-the-art spa, heated pool, and exquisite dining options.",
  },
  {
    id: "2",
    name: "Mount Meru Hotel",
    location: "Kanisa Road, Arusha",
    pricePerNight: 180,
    rating: 4.5,
    imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800",
    description: "Located at the foothills of Mount Meru, this historic hotel provides a perfect blend of comfort and Tanzanian hospitality.",
  },
  {
    id: "3",
    name: "Tulia Boutique Hotel & Spa",
    location: "White Rose Road, Arusha",
    pricePerNight: 95,
    rating: 4.6,
    imageUrl: "https://images.unsplash.com/photo-1542314831-c6a4d14b8fc4?auto=format&fit=crop&q=80&w=800",
    description: "A serene and intimate boutique hotel offering personalized service, beautiful gardens, and a relaxing spa experience before or after your safari.",
  }
];