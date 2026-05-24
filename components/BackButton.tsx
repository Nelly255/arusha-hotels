"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="group flex items-center gap-3 bg-white/10 hover:bg-white/20 dark:bg-black/30 dark:hover:bg-black/50 backdrop-blur-md border border-white/20 px-5 py-2.5 rounded-full transition-all duration-300 text-white shadow-lg hover:shadow-xl hover:scale-105"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 transition-transform group-hover:-translate-x-1">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
      </svg>
      <span className="text-xs font-bold tracking-widest uppercase">Directory</span>
    </button>
  );
}