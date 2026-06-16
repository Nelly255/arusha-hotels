import Image from "next/image";

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FDFBF7]/90 dark:bg-[#050505]/90 backdrop-blur-3xl transition-colors duration-500">
      
      <div className="relative w-24 h-24 flex items-center justify-center">
        
        {/* Elegant outer spinning gradient ring */}
        <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-orange-500 border-b-yellow-500 animate-[spin_2s_linear_infinite] opacity-80 shadow-[0_0_15px_rgba(249,115,22,0.2)]"></div>

        {/* Delicate inner counter-spinning ring */}
        <div className="absolute inset-2 rounded-full border-[2px] border-transparent border-l-orange-400 border-r-yellow-400 animate-[spin_3s_linear_infinite_reverse] opacity-60"></div>

        {/* Center Logo with soft pulse */}
        <div className="absolute inset-0 flex items-center justify-center animate-[pulse_2s_ease-in-out_infinite]">
          <Image 
            src="/icon.png" 
            alt="Arusha Hotels" 
            width={36} 
            height={36} 
            className="brightness-0 dark:invert drop-shadow-md"
          />
        </div>
        
      </div>
      
      <div className="mt-8 flex flex-col items-center gap-2">
        <p className="text-gray-500 dark:text-white/50 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">
          Loading 
        </p>
        {/* Premium loading dots */}
        <div className="flex gap-1">
          <div className="w-1 h-1 rounded-full bg-orange-500 animate-[bounce_1s_infinite_0ms]"></div>
          <div className="w-1 h-1 rounded-full bg-orange-500 animate-[bounce_1s_infinite_200ms]"></div>
          <div className="w-1 h-1 rounded-full bg-orange-500 animate-[bounce_1s_infinite_400ms]"></div>
        </div>
      </div>

    </div>
  );
}