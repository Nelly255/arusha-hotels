"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Footer() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form states
  const [hotelName, setHotelName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('inquiries').insert([
        { hotel_name: hotelName, email, message }
      ]);

      if (error) throw error;
      
      setSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccess(false);
        setHotelName("");
        setEmail("");
        setMessage("");
      }, 3000);
      
    } catch (error: any) {
      alert("Error sending inquiry: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <footer className="relative border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#050505] pt-16 pb-8 overflow-hidden z-10 transition-colors duration-500">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[40rem] h-[20rem] bg-blue-500/5 dark:bg-blue-600/10 blur-[100px] rounded-t-full pointer-events-none transition-colors duration-500"></div>

        <div className="max-w-[1300px] mx-auto px-6 md:px-8 relative z-10">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            
            {/* Branding */}
            <div className="lg:col-span-1">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-4 tracking-tight transition-colors duration-500">Arusha Hotels.</h2>
              <p className="text-gray-600 dark:text-white/50 text-sm leading-relaxed mb-6 max-w-sm transition-colors duration-500">
                The premier digital directory for luxury, boutique, and safari basecamp accommodations in Arusha, Tanzania. Find your perfect stay.
              </p>
              <p className="text-gray-400 dark:text-white/30 text-xs font-bold uppercase tracking-widest transition-colors duration-500">Est. 2026</p>
            </div>

            {/* Explore Links */}
            <div>
              <h3 className="text-gray-900 dark:text-white font-bold mb-4 uppercase tracking-widest text-xs transition-colors duration-500">Explore</h3>
              <ul className="space-y-3">
                <li><Link href="/" className="text-gray-600 dark:text-white/60 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm font-medium">Home / Directory</Link></li>
                <li><Link href="/explore" className="text-gray-600 dark:text-white/60 hover:text-orange-500 dark:hover:text-orange-400 transition-colors text-sm font-medium">Discover Arusha</Link></li>
                <li><Link href="/favorites" className="text-gray-600 dark:text-white/60 hover:text-red-500 dark:hover:text-red-400 transition-colors text-sm font-medium">My Saved Stays</Link></li>
              </ul>
            </div>

            {/* Contact Section */}
            <div>
              <h3 className="text-gray-900 dark:text-white font-bold mb-4 uppercase tracking-widest text-xs transition-colors duration-500">Reach Out</h3>
              <ul className="space-y-4">
                <li>
                  <a href="mailto:info@arushahotels.com" className="group flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </div>
                    <span className="text-gray-600 dark:text-white/60 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-sm font-bold">info@arushahotels.com</span>
                  </a>
                </li>
                <li>
                  <a href="https://wa.me/255787468830" target="_blank" rel="noreferrer" className="group flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12c0 2.17.69 4.18 1.83 5.86L2.6 21.4l3.65-1.18A9.954 9.954 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.8 0-3.48-.56-4.9-1.5l-.35-.22-2.39.78.8-2.34-.24-.38A7.95 7.95 0 014 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8zm4.33-5.83c-.24-.12-1.4-.69-1.62-.77-.21-.08-.37-.12-.52.12-.15.24-.61.77-.75.92-.14.15-.29.17-.52.05-1.13-.57-2.12-1.32-2.91-2.28-.12-.15.01-.22.13-.34.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.52-1.25-.71-1.71-.19-.45-.38-.39-.52-.4-.14-.01-.3-.01-.46-.01-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2 0 1.18.86 2.32.98 2.48.12.16 1.7 2.6 4.11 3.64.57.25 1.02.39 1.37.5.58.18 1.11.16 1.53.1.47-.07 1.4-.57 1.6-1.12.2-.55.2-.1.14-.11z"/></svg>
                    </div>
                    <span className="text-gray-600 dark:text-white/60 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors text-sm font-bold">+255 787 468 830</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Partnerships */}
            <div>
              <h3 className="text-gray-900 dark:text-white font-bold mb-4 uppercase tracking-widest text-xs transition-colors duration-500">Partnerships</h3>
              <p className="text-gray-600 dark:text-white/50 text-sm mb-6 transition-colors duration-500">
                Are you a hotel owner in Arusha? Get listed on our platform and reach thousands of international tourists.
              </p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="inline-block bg-white dark:bg-white/10 hover:bg-gray-50 dark:hover:bg-white/20 border border-gray-200/80 dark:border-white/10 text-gray-900 dark:text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-[0_4px_14px_rgba(0,0,0,0.03)] dark:shadow-lg active:scale-95"
              >
                List Your Property ↗
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-white/10 pt-8 flex flex-col justify-center items-center gap-4 transition-colors duration-500">
            <p className="text-gray-500 dark:text-white/30 text-xs font-medium text-center transition-colors duration-500">
              © {new Date().getFullYear()} arushahotels.com All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => !isSubmitting && setIsModalOpen(false)}></div>

          <div className="relative w-full max-w-md bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-[2rem] p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            <button onClick={() => !isSubmitting && setIsModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">✕</button>

            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Partner With Us</h2>
            <p className="text-gray-500 dark:text-white/50 text-sm mb-8 leading-relaxed">
              Fill out the details below and our partnership team will reach out to set up your premium listing.
            </p>

            {success ? (
              <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-400 p-6 rounded-2xl text-center font-bold">
                ✅ Request Sent! We will contact you shortly.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-white/50 mb-2 uppercase tracking-widest">Hotel Name</label>
                  <input required value={hotelName} onChange={e => setHotelName(e.target.value)} placeholder="e.g. The Serengeti Lodge" className="w-full p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-blue-500 outline-none text-gray-900 dark:text-white font-medium transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-white/50 mb-2 uppercase tracking-widest">Your Email</label>
                  <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="manager@hotel.com" className="w-full p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-blue-500 outline-none text-gray-900 dark:text-white font-medium transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-white/50 mb-2 uppercase tracking-widest">Message (Optional)</label>
                  <textarea rows={3} value={message} onChange={e => setMessage(e.target.value)} placeholder="Tell us about your property..." className="w-full p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-blue-500 outline-none text-gray-900 dark:text-white font-medium transition-all resize-none"></textarea>
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl shadow-lg transition-all active:scale-95 mt-4 disabled:opacity-50">
                  {isSubmitting ? "Sending..." : "Send Inquiry"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}