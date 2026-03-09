export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505]/80 backdrop-blur-2xl">
      <div className="relative w-20 h-20 flex items-center justify-center">
        {/* Outer glowing ring */}
        <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
        {/* Inner spinning ring */}
        <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        {/* Center dot */}
        <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
      </div>
      <p className="mt-6 text-white/50 font-bold uppercase tracking-[0.2em] text-xs animate-pulse">
        Loading Experience...
      </p>
    </div>
  );
}