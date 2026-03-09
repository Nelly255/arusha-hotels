import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] text-white p-6 text-center relative overflow-hidden">
      
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col items-center">
        <h1 className="text-8xl md:text-9xl font-black mb-4 tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-white/20 drop-shadow-2xl">
          404
        </h1>
        <h2 className="text-2xl md:text-3xl font-extrabold mb-4 text-white">
          Lost in the Safari?
        </h2>
        <p className="text-white/50 mb-10 max-w-md font-medium leading-relaxed">
          We couldn't find the page you were looking for. Let's get you back to basecamp and find your perfect stay.
        </p>
        
        <Link 
          href="/" 
          className="bg-white text-black hover:bg-gray-200 font-black py-4 px-10 rounded-full shadow-[0_10px_30px_rgba(255,255,255,0.1)] hover:shadow-[0_10px_40px_rgba(255,255,255,0.2)] hover:-translate-y-1 transition-all uppercase tracking-widest text-sm"
        >
          Return to Directory
        </Link>
      </div>
    </div>
  );
}