"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function ImageGallery({ mainImage, gallery = [] }: { mainImage: string, gallery?: string[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Combine the main cover image with the rest of the gallery
  const allImages = [mainImage, ...(gallery || [])].filter(Boolean);

  // Handle keyboard navigation (Escape to close, Arrows to swipe)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") setIsOpen(false);
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex]);

  const nextImage = () => setCurrentIndex((prev) => (prev + 1) % allImages.length);
  const prevImage = () => setCurrentIndex((prev) => (prev - 1 + allImages.length) % allImages.length);

  if (allImages.length === 0) return null;

  return (
    <>
      {/* The Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-black/30 hover:bg-black/50 backdrop-blur-md border border-white/10 px-5 py-2.5 rounded-full transition-all duration-300 text-white shadow-xl hover:scale-105"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
        <span className="text-sm font-semibold tracking-wide">Photos ({allImages.length})</span>
      </button>

      {/* The Full Screen Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-2xl">
          
          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-6 right-6 md:top-8 md:right-8 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full backdrop-blur-md transition-all z-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          {/* Image Counter */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 text-white/80 font-bold tracking-widest text-sm bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-md z-50">
            {currentIndex + 1} / {allImages.length}
          </div>

          {/* Previous Arrow */}
          {allImages.length > 1 && (
            <button
              onClick={prevImage}
              className="absolute left-4 md:left-8 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-4 rounded-full backdrop-blur-md transition-all z-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
            </button>
          )}

          {/* Main Image View */}
          <div className="relative w-full max-w-7xl h-[85vh] px-4 md:px-24">
            <Image
              src={allImages[currentIndex]}
              alt={`Gallery Image ${currentIndex + 1}`}
              fill
              className="object-contain"
              quality={100}
            />
          </div>

          {/* Next Arrow */}
          {allImages.length > 1 && (
            <button
              onClick={nextImage}
              className="absolute right-4 md:right-8 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-4 rounded-full backdrop-blur-md transition-all z-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
            </button>
          )}

        </div>
      )}
    </>
  );
}