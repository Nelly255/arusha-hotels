"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation"; 
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const AVAILABLE_AMENITIES = ["📶 Free WiFi", "🏊 Swimming Pool", "💆 Spa & Wellness", "🍽️ Restaurant", "🏋️ Fitness Center", "🍸 Bar/Lounge", "🚗 Free Parking", "🛎️ Room Service"];

type AdminView = 'dashboard' | 'list' | 'form' | 'reviews' | 'inquiries' | 'analytics' | 'explore';

export default function AdminPage() {
  const router = useRouter(); 
  
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');
  const [filterMode, setFilterMode] = useState<'all' | 'premium'>('all'); 
  const [inboxTab, setInboxTab] = useState<'new' | 'archived'>('new'); 
  
  const [hotels, setHotels] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]); 
  
  // --- 🚀 EXPLORE HUB STATE (NOW WITH LOCATION) 🚀 ---
  const [attractions, setAttractions] = useState<any[]>([]);
  const [showExploreForm, setShowExploreForm] = useState(false);
  const [exploreEditId, setExploreEditId] = useState<number | null>(null);
  const [exploreForm, setExploreForm] = useState({ title: "", location: "", description: "", is_active: true });
  const [exploreImageFile, setExploreImageFile] = useState<File | null>(null);
  const [explorePreviewUrl, setExplorePreviewUrl] = useState<string | null>(null);
  
  const [clickData, setClickData] = useState<any[]>([]);
  const [totalClicks, setTotalClicks] = useState(0);

  const [unreadReviewsCount, setUnreadReviewsCount] = useState(0); 

  const [loading, setLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); 
  const [status, setStatus] = useState<{type: 'success' | 'error', msg: string} | null>(null);
  
  const [editId, setEditId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [existingGallery, setExistingGallery] = useState<string[]>([]); 

  const [formData, setFormData] = useState({
    name: "", location: "", pricePerNight: "", rating: "", description: "", 
    isHidden: false, is_featured: false, amenities: [] as string[], officialUrl: "",
    phone_number: "", instagram_handle: ""
  });

  const logoutTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => { checkUser(); }, []);

  useEffect(() => {
    const TIMEOUT_MS = 30 * 60 * 1000;
    const resetTimer = () => {
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = setTimeout(async () => {
        console.log("🔒 30 minutes of inactivity. Auto-logging out...");
        await supabase.auth.signOut();
        router.push("/admin/login");
      }, TIMEOUT_MS);
    };
    const activityEvents = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"];
    resetTimer();
    activityEvents.forEach(event => window.addEventListener(event, resetTimer));
    return () => {
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      activityEvents.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [router]);

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/admin/login");
    } else {
      await Promise.all([fetchHotels(), fetchAllReviews(), fetchInquiries(), fetchAnalytics(), fetchAttractions()]);
      setIsCheckingAuth(false);
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  async function fetchHotels() {
    const { data } = await supabase.from("hotels").select("*").order('name', { ascending: true });
    if (data) setHotels(data);
  }

  async function fetchAttractions() {
    const { data, error } = await supabase.from("attractions").select("*").order('id', { ascending: true });
    if (error) console.error("Error fetching attractions:", error);
    if (data) setAttractions(data);
  }

  async function fetchAllReviews() {
    const { data } = await supabase.from("reviews").select(`*, hotels(name)`).order('created_at', { ascending: false });
    if (data) {
      setReviews(data);
      const lastSeen = localStorage.getItem('admin_last_seen_reviews');
      if (lastSeen) {
        const unread = data.filter(r => new Date(r.created_at).getTime() > parseInt(lastSeen)).length;
        setUnreadReviewsCount(unread);
      } else {
        setUnreadReviewsCount(data.length);
      }
    }
  }

  async function fetchInquiries() {
    const { data } = await supabase.from("inquiries").select("*").order('created_at', { ascending: false });
    if (data) setInquiries(data);
  }

  async function fetchAnalytics() {
    const { data } = await supabase.from("hotel_clicks").select("hotel_name");
    if (data) {
      setTotalClicks(data.length);
      const counts: Record<string, number> = {};
      data.forEach(row => { counts[row.hotel_name] = (counts[row.hotel_name] || 0) + 1; });
      const chartData = Object.keys(counts).map(key => ({ name: key, clicks: counts[key] })).sort((a, b) => b.clicks - a.clicks).slice(0, 5); 
      setClickData(chartData);
    }
  }

  const handleResetAnalytics = async () => {
    if (confirm("🚨 WARNING: Are you absolutely sure you want to wipe all analytics data? This will delete all click history and cannot be undone!")) {
      const { error } = await supabase.from("hotel_clicks").delete().not("id", "is", null);
      if (error) alert("Error resetting analytics: " + error.message);
      else fetchAnalytics();
    }
  };

  const handleOpenReviews = () => {
    localStorage.setItem('admin_last_seen_reviews', Date.now().toString());
    setUnreadReviewsCount(0);
    setCurrentView('reviews');
  };

  // --- EXPLORE PAGE HANDLERS ---
  const resetExploreForm = () => {
    setExploreEditId(null);
    setExploreForm({ title: "", location: "", description: "", is_active: true });
    setExploreImageFile(null);
    setExplorePreviewUrl(null);
    setShowExploreForm(false);
  };

  const handleExploreImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setExploreImageFile(file);
      setExplorePreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleExploreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let finalImageUrl = explorePreviewUrl; 
      
      if (exploreImageFile) {
        const fileExt = exploreImageFile.name.split('.').pop();
        const fileName = `attraction_${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('hotels').upload(fileName, exploreImageFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('hotels').getPublicUrl(fileName);
        finalImageUrl = publicUrl;
      }

      if (!finalImageUrl && !exploreEditId) {
        throw new Error("Please upload an image for this attraction.");
      }

      const payload = {
        title: exploreForm.title,
        location: exploreForm.location,
        description: exploreForm.description,
        is_active: exploreForm.is_active,
        ...(finalImageUrl ? { image_url: finalImageUrl } : {})
      };

      if (exploreEditId) {
        const { error } = await supabase.from("attractions").update(payload).eq('id', exploreEditId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("attractions").insert([payload]);
        if (error) throw error;
      }
      
      await fetchAttractions();
      resetExploreForm();
    } catch (error: any) {
      console.error("Supabase Error:", error);
      alert("Error saving attraction: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditAttraction = (item: any) => {
    setExploreEditId(item.id);
    setExploreForm({ title: item.title, location: item.location || "", description: item.description, is_active: item.is_active });
    setExplorePreviewUrl(item.image_url); 
    setExploreImageFile(null);
    setShowExploreForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteAttraction = async (id: number) => {
    if (confirm("Permanently delete this attraction?")) {
      const { error } = await supabase.from("attractions").delete().eq('id', id);
      if (error) alert("Error deleting attraction: " + error.message);
      fetchAttractions();
    }
  };

  const toggleAttractionStatus = async (id: number, currentStatus: boolean) => {
    const { error } = await supabase.from("attractions").update({ is_active: !currentStatus }).eq('id', id);
    if (error) alert("Error updating status: " + error.message);
    fetchAttractions();
  };

  const handleToggleArchive = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'archived' ? 'pending' : 'archived';
    const { error } = await supabase.from("inquiries").update({ status: newStatus }).eq('id', id);
    if (error) alert("Error updating inquiry: " + error.message);
    fetchInquiries();
  };

  const handleDeleteInquiry = async (id: string) => {
    if (confirm("Permanently delete this inquiry? This cannot be undone.")) {
      await supabase.from("inquiries").delete().eq('id', id);
      fetchInquiries();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setGalleryFiles(prev => [...prev, ...files]);
      setGalleryPreviews(prev => [...prev, ...files.map(file => URL.createObjectURL(file))]);
    }
  };

  const removeGalleryPreview = (index: number) => {
    setGalleryFiles(prev => prev.filter((_, i) => i !== index));
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingGalleryImage = (index: number) => {
    setExistingGallery(prev => prev.filter((_, i) => i !== index));
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity) ? prev.amenities.filter(a => a !== amenity) : [...prev.amenities, amenity]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      let finalImageUrl = previewUrl;
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `cover_${Math.random()}.${fileExt}`;
        await supabase.storage.from('hotels').upload(fileName, imageFile);
        const { data: { publicUrl } } = supabase.storage.from('hotels').getPublicUrl(fileName);
        finalImageUrl = publicUrl;
      }
      if (!finalImageUrl && !editId) throw new Error("Please select a cover image.");

      let finalGalleryUrls = [...existingGallery];
      for (const file of galleryFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `gallery_${Math.random()}.${fileExt}`;
        await supabase.storage.from('hotels').upload(fileName, file);
        const { data: { publicUrl } } = supabase.storage.from('hotels').getPublicUrl(fileName);
        finalGalleryUrls.push(publicUrl);
      }

      const payload = {
        ...formData,
        pricePerNight: parseInt(formData.pricePerNight),
        rating: parseFloat(formData.rating),
        image_gallery: finalGalleryUrls,
        ...(finalImageUrl ? { imageUrl: finalImageUrl } : {})
      };

      if (editId) {
        const { error } = await supabase.from("hotels").update(payload).eq('id', editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("hotels").insert([payload]);
        if (error) throw error;
      }

      setStatus({ type: 'success', msg: editId ? "✅ Hotel updated!" : "✅ New hotel published!" });
      await fetchHotels();
      
      setTimeout(() => {
        resetForm();
        setCurrentView('list');
      }, 1500);

    } catch (error: any) {
      setStatus({ type: 'error', msg: "❌ " + error.message });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditId(null); setImageFile(null); setPreviewUrl(null); setGalleryFiles([]); setGalleryPreviews([]); setExistingGallery([]); setStatus(null);
    setFormData({ name: "", location: "", pricePerNight: "", rating: "", description: "", isHidden: false, is_featured: false, amenities: [], officialUrl: "", phone_number: "", instagram_handle: "" });
  };

  const openAddForm = () => {
    resetForm();
    setCurrentView('form');
  };

  const handleEdit = (hotel: any) => {
    setEditId(hotel.id);
    setFormData({
      name: hotel.name, location: hotel.location, pricePerNight: hotel.pricePerNight.toString(), rating: hotel.rating.toString(), 
      description: hotel.description, isHidden: hotel.isHidden || false, is_featured: hotel.is_featured || false,
      amenities: hotel.amenities || [], officialUrl: hotel.officialUrl || "", phone_number: hotel.phone_number || "", instagram_handle: hotel.instagram_handle || ""
    });
    setPreviewUrl(hotel.imageUrl);
    setExistingGallery(hotel.image_gallery || []); 
    setGalleryFiles([]);
    setGalleryPreviews([]);
    setCurrentView('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Permanently delete this hotel?")) {
      const { error } = await supabase.from("hotels").delete().eq('id', id);
      if (error) alert("Error deleting hotel: " + error.message);
      fetchHotels();
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (confirm("Permanently delete this review?")) {
      const { error } = await supabase.from("reviews").delete().eq('id', id);
      if (error) {
        alert("Could not delete! Please check Supabase permissions. Error: " + error.message);
      } else {
        fetchAllReviews();
      }
    }
  };

  const filteredHotels = hotels.filter(hotel => {
    const matchesSearch = hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) || hotel.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPremium = filterMode === 'premium' ? hotel.is_featured === true : true;
    return matchesSearch && matchesPremium;
  });

  const pendingInquiries = inquiries.filter(i => i.status !== 'archived');
  const archivedInquiries = inquiries.filter(i => i.status === 'archived');
  const displayedInquiries = inboxTab === 'new' ? pendingInquiries : archivedInquiries;

  if (isCheckingAuth) return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#050505]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-slate-100 font-sans pb-20 overflow-x-hidden transition-colors duration-500">
      
      <div className="fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-blue-500/10 dark:bg-blue-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 pointer-events-none"></div>
      <div className="fixed top-0 right-0 translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-purple-500/10 dark:bg-purple-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 pointer-events-none"></div>

      <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8 xl:px-12 pt-8 relative z-10">
        
        <div className="flex justify-between items-center mb-12 bg-white/70 dark:bg-[#0a0a0a]/50 backdrop-blur-3xl border border-gray-200 dark:border-white/10 rounded-full px-6 py-4 shadow-xl dark:shadow-2xl transition-all">
          <div className="flex items-center gap-6">
             <Link href="/" className="text-sm font-bold opacity-70 hover:opacity-100 transition-all flex items-center gap-2">
               <span className="text-lg leading-none">←</span> Live Site
             </Link>
             <div className="h-6 w-px bg-gray-300 dark:bg-white/10 hidden md:block"></div>
             <span className="font-black tracking-widest uppercase text-xs text-blue-600 dark:text-blue-400 hidden md:block tracking-[0.2em]">Admin Hub</span>
          </div>
          <button onClick={handleLogout} className="bg-red-500/10 text-red-600 dark:text-red-500 border border-red-500/20 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-lg active:scale-95">Log Out</button>
        </div>

        {currentView === 'dashboard' && (
          <div className="max-w-7xl mx-auto mt-10 animate-in fade-in duration-500">
            <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight text-gray-900 dark:text-white">Welcome Back.</h1>
            <p className="text-gray-500 dark:text-white/50 text-lg font-medium mb-12">Select a module to manage your platform.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div onClick={() => { setFilterMode('all'); setCurrentView('list'); }} className="group cursor-pointer bg-white/70 dark:bg-[#0a0a0a]/50 backdrop-blur-3xl border border-gray-200 dark:border-white/10 hover:border-blue-500/50 hover:bg-white dark:hover:bg-white/5 p-8 rounded-[2.5rem] transition-all duration-300 hover:-translate-y-2 shadow-lg dark:shadow-2xl relative overflow-hidden flex flex-col">
                <div className="text-5xl mb-6 drop-shadow-lg">🏨</div>
                <h2 className="text-2xl font-black mb-2 text-gray-900 dark:text-white">Directory</h2>
                <p className="text-gray-500 dark:text-white/50 font-medium mb-8 text-sm leading-relaxed">Manage, edit, or remove your {hotels.length} existing hotel listings.</p>
                <div className="mt-auto flex items-center text-blue-600 dark:text-blue-400 font-bold text-sm tracking-wide">View All Stays <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span></div>
              </div>

              <div onClick={() => { setFilterMode('premium'); setCurrentView('list'); }} className="group cursor-pointer bg-white/70 dark:bg-[#0a0a0a]/50 backdrop-blur-3xl border border-gray-200 dark:border-white/10 hover:border-yellow-500/50 hover:bg-white dark:hover:bg-white/5 p-8 rounded-[2.5rem] transition-all duration-300 hover:-translate-y-2 shadow-lg dark:shadow-2xl relative overflow-hidden flex flex-col">
                <div className="text-5xl mb-6 drop-shadow-lg">⭐</div>
                <h2 className="text-2xl font-black mb-2 text-gray-900 dark:text-white">Premium Picks</h2>
                <p className="text-gray-500 dark:text-white/50 font-medium mb-8 text-sm leading-relaxed">Manage your {hotels.filter(h => h.is_featured).length} featured top-tier VIP stays.</p>
                <div className="mt-auto flex items-center text-yellow-600 dark:text-yellow-400 font-bold text-sm tracking-wide">View Premium <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span></div>
              </div>

              <div onClick={openAddForm} className="group cursor-pointer bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-600 dark:to-blue-800 border border-blue-400 dark:border-blue-500 p-8 rounded-[2.5rem] transition-all duration-300 hover:-translate-y-2 shadow-[0_20px_50px_rgba(37,99,235,0.2)] dark:shadow-[0_20px_50px_rgba(37,99,235,0.3)] flex flex-col">
                <div className="text-5xl mb-6 drop-shadow-lg">✨</div>
                <h2 className="text-2xl font-black mb-2 text-white">Add New</h2>
                <p className="text-blue-100 dark:text-blue-200 font-medium mb-8 text-sm leading-relaxed">Publish a brand new hotel to the live directory instantly.</p>
                <div className="mt-auto flex items-center text-white font-bold text-sm tracking-wide">Open Editor <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div onClick={() => setCurrentView('explore')} className="group cursor-pointer bg-white/70 dark:bg-[#0a0a0a]/50 backdrop-blur-3xl border border-gray-200 dark:border-white/10 hover:border-orange-500/50 hover:bg-white dark:hover:bg-white/5 p-8 rounded-[2.5rem] transition-all duration-300 hover:-translate-y-2 shadow-lg dark:shadow-2xl relative overflow-hidden flex flex-col">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 dark:bg-orange-500/20 blur-3xl group-hover:bg-orange-500/20 dark:group-hover:bg-orange-500/30 transition-all"></div>
                <div className="text-5xl mb-6 drop-shadow-lg relative z-10">🌍</div>
                <h2 className="text-2xl font-black mb-2 text-gray-900 dark:text-white relative z-10">Explore Hub</h2>
                <p className="text-gray-500 dark:text-white/50 font-medium mb-8 text-sm leading-relaxed relative z-10">Manage the {attractions.length} attractions on your Discover Arusha page.</p>
                <div className="mt-auto flex items-center text-orange-600 dark:text-orange-400 font-bold text-sm tracking-wide relative z-10">Edit Content <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span></div>
              </div>

              <div onClick={handleOpenReviews} className="group cursor-pointer bg-white/70 dark:bg-[#0a0a0a]/50 backdrop-blur-3xl border border-gray-200 dark:border-white/10 hover:border-purple-500/50 hover:bg-white dark:hover:bg-white/5 p-8 rounded-[2.5rem] transition-all duration-300 hover:-translate-y-2 shadow-lg dark:shadow-2xl relative overflow-hidden flex flex-col">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 dark:bg-purple-500/20 blur-3xl group-hover:bg-purple-500/20 dark:group-hover:bg-purple-500/30 transition-all"></div>
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="text-5xl drop-shadow-lg">💬</div>
                  {unreadReviewsCount > 0 && (
                    <span className="bg-purple-500 text-white px-3 py-1 rounded-full font-black text-sm animate-pulse shadow-[0_0_15px_rgba(168,85,247,0.6)]">
                      {unreadReviewsCount} New
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-black mb-2 text-gray-900 dark:text-white relative z-10">Reviews</h2>
                <p className="text-gray-500 dark:text-white/50 font-medium mb-8 text-sm leading-relaxed relative z-10">Moderate {reviews.length} guest feedbacks.</p>
                <div className="mt-auto flex items-center text-purple-600 dark:text-purple-400 font-bold text-sm tracking-wide relative z-10">Read Reviews <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span></div>
              </div>

              <div onClick={() => { setInboxTab('new'); setCurrentView('inquiries'); }} className="group cursor-pointer bg-white/70 dark:bg-[#0a0a0a]/50 backdrop-blur-3xl border border-gray-200 dark:border-white/10 hover:border-emerald-500/50 hover:bg-white dark:hover:bg-white/5 p-8 rounded-[2.5rem] transition-all duration-300 hover:-translate-y-2 shadow-lg dark:shadow-2xl relative overflow-hidden flex flex-col">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 dark:bg-emerald-500/20 blur-3xl group-hover:bg-emerald-500/20 dark:group-hover:bg-emerald-500/30 transition-all"></div>
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="text-5xl drop-shadow-lg">📥</div>
                  {pendingInquiries.length > 0 && (
                    <span className="bg-emerald-500 text-white px-3 py-1 rounded-full font-black text-sm animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.6)]">
                      {pendingInquiries.length} New
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-black mb-2 text-gray-900 dark:text-white relative z-10">Partner Inbox</h2>
                <p className="text-gray-500 dark:text-white/50 font-medium mb-8 text-sm leading-relaxed relative z-10">Manage hotel sponsor requests.</p>
                <div className="mt-auto flex items-center text-emerald-600 dark:text-emerald-400 font-bold text-sm tracking-wide relative z-10">Check Inbox <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span></div>
              </div>

              <div onClick={() => setCurrentView('analytics')} className="group cursor-pointer bg-white/70 dark:bg-[#0a0a0a]/50 backdrop-blur-3xl border border-gray-200 dark:border-white/10 hover:border-cyan-500/50 hover:bg-white dark:hover:bg-white/5 p-8 rounded-[2.5rem] transition-all duration-300 hover:-translate-y-2 shadow-lg dark:shadow-2xl relative overflow-hidden flex flex-col">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 dark:bg-cyan-500/20 blur-3xl group-hover:bg-cyan-500/20 dark:group-hover:bg-cyan-500/30 transition-all"></div>
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="text-5xl drop-shadow-lg">📈</div>
                  <span className="bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 px-3 py-1 rounded-full font-black text-sm border border-cyan-500/20">
                    {totalClicks} Clicks
                  </span>
                </div>
                <h2 className="text-2xl font-black mb-2 text-gray-900 dark:text-white relative z-10">Live Analytics</h2>
                <p className="text-gray-500 dark:text-white/50 font-medium mb-8 text-sm leading-relaxed relative z-10">Track user clicks and platform engagement.</p>
                <div className="mt-auto flex items-center text-cyan-600 dark:text-cyan-400 font-bold text-sm tracking-wide relative z-10">View Traffic <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span></div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 🚀 EXPLORE HUB 🚀 */}
        {/* ========================================================================= */}
        {currentView === 'explore' && (
          <div className="flex flex-col gap-8 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white/70 dark:bg-[#0a0a0a]/50 backdrop-blur-3xl p-6 md:p-8 rounded-[2.5rem] border border-gray-200 dark:border-white/10 shadow-xl dark:shadow-2xl">
              <div>
                <button onClick={() => { setCurrentView('dashboard'); resetExploreForm(); }} className="text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white font-bold text-sm mb-3 flex items-center gap-2 transition-all">← Back to Hub</button>
                <h1 className="text-3xl md:text-4xl font-black flex items-center gap-4 tracking-tight text-gray-900 dark:text-white">
                  Explore Hub 
                  <span className="bg-orange-100 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 text-orange-600 dark:text-orange-400 text-sm px-4 py-1.5 rounded-full shadow-inner">{attractions.length} Attractions</span>
                </h1>
              </div>
              {!showExploreForm && (
                <button onClick={() => setShowExploreForm(true)} className="bg-orange-600 hover:bg-orange-700 text-white font-black px-8 py-4 rounded-full shadow-lg active:scale-95 transition-all flex items-center gap-2">
                  <span className="text-xl leading-none">+</span> Add Attraction
                </button>
              )}
            </div>

            {showExploreForm ? (
              <div className="bg-white/90 dark:bg-[#0a0a0a]/80 backdrop-blur-3xl rounded-[2.5rem] border border-gray-200 dark:border-white/10 p-8 md:p-12 shadow-xl">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">{exploreEditId ? "Update Attraction" : "New Attraction"}</h2>
                  <button onClick={resetExploreForm} className="text-red-500 font-bold hover:underline">Cancel</button>
                </div>
                <form onSubmit={handleExploreSubmit} className="space-y-6">
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-600 dark:text-white/50 mb-3 uppercase tracking-widest">Attraction Image</label>
                    <div className="relative group cursor-pointer border-2 border-dashed border-gray-300 dark:border-white/20 rounded-[2rem] overflow-hidden bg-gray-50 dark:bg-black/50 hover:bg-gray-100 dark:hover:bg-black transition-all h-64 flex flex-col justify-center items-center shadow-sm dark:shadow-inner">
                      {explorePreviewUrl ? (
                        <img src={explorePreviewUrl} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center text-gray-500 dark:opacity-50 group-hover:opacity-100 transition-opacity">
                          <div className="text-4xl mb-3">📸</div>
                          <p className="font-bold text-sm">Click to Upload Photo</p>
                        </div>
                      )}
                      <input type="file" accept="image/*" onChange={handleExploreImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 dark:text-white/50 mb-3 uppercase tracking-widest">Attraction Title</label>
                      <input required placeholder="e.g. Arusha National Park" className="w-full p-4 rounded-2xl bg-transparent dark:bg-white/5 border border-gray-300 dark:border-white/10 focus:border-orange-500 outline-none font-bold text-gray-900 dark:text-white" value={exploreForm.title} onChange={e => setExploreForm({...exploreForm, title: e.target.value})} />
                    </div>
                    {/* 🚀 NEW LOCATION INPUT 🚀 */}
                    <div>
                      <label className="block text-xs font-bold text-gray-600 dark:text-white/50 mb-3 uppercase tracking-widest">Location (Optional)</label>
                      <input placeholder="e.g. 45 mins from Arusha Center" className="w-full p-4 rounded-2xl bg-transparent dark:bg-white/5 border border-gray-300 dark:border-white/10 focus:border-orange-500 outline-none font-bold text-gray-900 dark:text-white" value={exploreForm.location} onChange={e => setExploreForm({...exploreForm, location: e.target.value})} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 dark:text-white/50 mb-3 uppercase tracking-widest">Description</label>
                    <textarea required rows={4} placeholder="Describe the experience..." className="w-full p-4 rounded-2xl bg-transparent dark:bg-white/5 border border-gray-300 dark:border-white/10 focus:border-orange-500 outline-none font-medium resize-none text-gray-900 dark:text-white" value={exploreForm.description} onChange={e => setExploreForm({...exploreForm, description: e.target.value})} />
                  </div>
                  
                  <label className="flex items-center gap-4 bg-gray-50 dark:bg-white/5 p-5 rounded-2xl border border-gray-200 dark:border-white/10 cursor-pointer w-max hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                    <input type="checkbox" checked={exploreForm.is_active} onChange={(e) => setExploreForm({...exploreForm, is_active: e.target.checked})} className="w-6 h-6 rounded border-gray-300 dark:border-white/20 text-orange-600 focus:ring-0" />
                    <div><p className="font-bold text-gray-900 dark:text-white">Active Status</p><p className="text-xs text-gray-500 dark:text-white/40 mt-1">Uncheck to temporarily hide from live site.</p></div>
                  </label>
                  
                  <button disabled={loading} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-5 rounded-2xl text-xl shadow-lg active:scale-95 transition-all uppercase tracking-widest disabled:opacity-50 mt-4">
                    {loading ? "Processing Upload..." : "Save Attraction"}
                  </button>
                </form>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {attractions.length > 0 ? attractions.map((attr) => (
                  <div key={attr.id} className="bg-white/70 dark:bg-[#0a0a0a]/50 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-[2rem] overflow-hidden flex flex-col shadow-lg transition-all hover:border-gray-300 dark:hover:border-white/30">
                    <div className="relative h-56">
                      <img src={attr.image_url} alt={attr.title} className="w-full h-full object-cover" />
                      {!attr.is_active && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                          <span className="bg-red-600 text-white px-4 py-2 rounded-full font-black tracking-widest uppercase text-xs">Hidden</span>
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-2xl font-black mb-1 text-gray-900 dark:text-white">{attr.title}</h3>
                      {/* Show location badge on Admin Card if it exists */}
                      {attr.location ? (
                        <p className="text-orange-600 dark:text-orange-400 text-xs font-bold uppercase tracking-widest mb-3">📍 {attr.location}</p>
                      ) : (
                         <div className="h-4 mb-3"></div>
                      )}
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 line-clamp-3">{attr.description}</p>
                      
                      <div className="mt-auto grid grid-cols-3 gap-2">
                        <button onClick={() => handleEditAttraction(attr)} className="bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white py-3 rounded-xl text-sm font-bold transition-all">Edit</button>
                        <button onClick={() => toggleAttractionStatus(attr.id, attr.is_active)} className={`${attr.is_active ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400' : 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'} py-3 rounded-xl text-sm font-bold transition-all hover:opacity-80`}>
                          {attr.is_active ? 'Hide' : 'Publish'}
                        </button>
                        <button onClick={() => handleDeleteAttraction(attr.id)} className="bg-red-50 dark:bg-red-500/10 hover:bg-red-500 hover:text-white text-red-600 dark:text-red-400 py-3 rounded-xl text-sm font-bold transition-all">Delete</button>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-full text-center py-20 border-2 border-dashed border-gray-300 dark:border-white/10 rounded-[2.5rem] bg-gray-50/50 dark:bg-[#0a0a0a]/30">
                    <p className="text-gray-500 font-bold">No attractions found. Add one!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* REST OF THE VIEWS REMAIN UNCHANGED DOWN HERE */}
        
        {currentView === 'list' && (
          <div className="flex flex-col gap-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white/70 dark:bg-[#0a0a0a]/50 backdrop-blur-3xl p-6 md:p-8 rounded-[2.5rem] border border-gray-200 dark:border-white/10 shadow-xl dark:shadow-2xl">
              <div>
                <button onClick={() => setCurrentView('dashboard')} className="text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white font-bold text-sm mb-3 flex items-center gap-2 transition-all">← Back to Hub</button>
                <h1 className="text-3xl md:text-4xl font-black flex items-center gap-4 tracking-tight text-gray-900 dark:text-white">
                  Directory 
                  <span className="bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-sm px-4 py-1.5 rounded-full shadow-inner">{filteredHotels.length} Stays</span>
                </h1>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                <div className="flex bg-gray-100 dark:bg-black/50 p-1.5 rounded-full border border-gray-200 dark:border-white/10 w-full sm:w-auto">
                  <button onClick={() => setFilterMode('all')} className={`flex-1 sm:flex-none px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${filterMode === 'all' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white'}`}>All Stays</button>
                  <button onClick={() => setFilterMode('premium')} className={`flex-1 sm:flex-none px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${filterMode === 'premium' ? 'bg-yellow-400 dark:bg-yellow-500 text-yellow-950 dark:text-black shadow-lg' : 'text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white'}`}>⭐ Premium</button>
                </div>

                <div className="w-full sm:w-[300px] relative">
                  <input type="text" placeholder="Search hotels..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-full py-3.5 pl-12 pr-4 font-bold text-gray-900 dark:text-white focus:border-blue-500 outline-none transition-all shadow-sm dark:shadow-inner" />
                  <span className="absolute left-4 top-3 text-gray-400 dark:text-white/30 text-xl">🔍</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {filteredHotels.length > 0 ? filteredHotels.map((hotel) => (
                <div key={hotel.id} className="bg-white/70 dark:bg-[#0a0a0a]/50 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-[2rem] overflow-hidden hover:border-gray-300 dark:hover:border-white/30 transition-all duration-300 flex flex-col group shadow-md dark:shadow-lg">
                  <div className="relative h-48 w-full overflow-hidden">
                    <img src={hotel.imageUrl} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80"></div>
                    <div className="absolute top-4 left-4 flex gap-2">
                      {hotel.is_featured && <span className="bg-yellow-400 text-yellow-950 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">⭐ Premium</span>}
                      {hotel.isHidden && <span className="bg-red-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">🚫 Hidden</span>}
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1 z-10 -mt-8 relative">
                    <h3 className="text-xl font-black mb-1 truncate text-white drop-shadow-md">{hotel.name}</h3>
                    <p className="text-gray-300 dark:text-white/60 text-xs font-bold uppercase tracking-widest mb-6 truncate">{hotel.location}</p>
                    
                    <div className="grid grid-cols-2 gap-3 mt-auto">
                      <button onClick={() => handleEdit(hotel)} className="bg-white/20 dark:bg-white/10 hover:bg-blue-600 text-gray-900 dark:text-white py-3 rounded-xl text-sm font-bold transition-all active:scale-95 border border-gray-200 dark:border-transparent">Edit</button>
                      <button onClick={() => handleDelete(hotel.id)} className="bg-gray-100 dark:bg-white/5 hover:bg-red-500 hover:text-white text-gray-600 dark:text-white/50 py-3 rounded-xl text-sm font-bold transition-all active:scale-95">Delete</button>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="col-span-full py-32 text-center border-2 border-dashed border-gray-300 dark:border-white/10 rounded-[2.5rem] bg-gray-50/50 dark:bg-[#0a0a0a]/30">
                  <p className="text-gray-500 dark:text-white/40 text-2xl font-black">No hotels found matching "{searchTerm}"</p>
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === 'form' && (
          <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
            <button onClick={() => { setCurrentView('dashboard'); resetForm(); }} className="text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white font-bold mb-6 flex items-center gap-2 transition-all">← Cancel & Return to Hub</button>
            <div className="bg-white/90 dark:bg-[#0a0a0a]/80 backdrop-blur-3xl rounded-[2.5rem] border border-gray-200 dark:border-white/10 p-8 md:p-12 shadow-xl dark:shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative overflow-hidden">
              <h1 className="text-4xl font-extrabold tracking-tight mb-2 relative z-10 text-gray-900 dark:text-white">{editId ? "Update Hotel Profile" : "Add New Hotel"}</h1>
              <p className="text-gray-500 dark:text-white/40 font-medium mb-10 relative z-10">Carefully fill out the listing details below.</p>
              <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 dark:text-white/50 mb-3 uppercase tracking-widest">Main Cover Image</label>
                    <div className="relative group cursor-pointer border-2 border-dashed border-gray-300 dark:border-white/20 rounded-[2rem] overflow-hidden bg-gray-50 dark:bg-black/50 hover:bg-gray-100 dark:hover:bg-black transition-all h-64 flex flex-col justify-center items-center shadow-sm dark:shadow-inner">
                      {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover" /> : <div className="text-center text-gray-500 dark:opacity-50 group-hover:opacity-100 transition-opacity"><div className="text-4xl mb-3">📸</div><p className="font-bold text-sm">Upload Cover Photo</p></div>}
                      <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-gray-600 dark:text-white/50 mb-3 uppercase tracking-widest">Gallery Photos (Optional)</label>
                     <div className="bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-[2rem] p-5 h-64 overflow-y-auto custom-scrollbar flex flex-wrap gap-3 content-start shadow-sm dark:shadow-inner">
                        {existingGallery.map((url, i) => (
                          <div key={`ex-${i}`} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-300 dark:border-white/20 group">
                            <img src={url} className="w-full h-full object-cover" />
                            <button type="button" onClick={() => removeExistingGalleryImage(i)} className="absolute inset-0 bg-red-600/90 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] font-black transition-all">✕</button>
                          </div>
                        ))}
                        {galleryPreviews.map((url, i) => (
                          <div key={`nw-${i}`} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-blue-500 group">
                            <img src={url} className="w-full h-full object-cover opacity-60" />
                            <button type="button" onClick={() => removeGalleryPreview(i)} className="absolute inset-0 bg-red-600/90 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] font-black transition-all">✕</button>
                          </div>
                        ))}
                        <div className="relative w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 dark:border-white/30 hover:border-gray-400 dark:hover:border-white hover:bg-gray-100 dark:hover:bg-white/10 flex items-center justify-center transition-all cursor-pointer">
                          <span className="text-2xl text-gray-400 dark:text-white/50">+</span>
                          <input type="file" multiple accept="image/*" onChange={handleGalleryChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                     </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div><label className="block text-xs font-bold text-gray-600 dark:text-white/50 mb-3 uppercase tracking-widest">Hotel Name</label><input required placeholder="e.g. Gran Melia Arusha" className="w-full p-4 rounded-2xl bg-transparent dark:bg-white/5 border border-gray-300 dark:border-white/10 focus:border-blue-500 outline-none font-bold text-gray-900 dark:text-white" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
                  <div><label className="block text-xs font-bold text-gray-600 dark:text-white/50 mb-3 uppercase tracking-widest">Location</label><input required placeholder="e.g. Simeon Road, Arusha" className="w-full p-4 rounded-2xl bg-transparent dark:bg-white/5 border border-gray-300 dark:border-white/10 focus:border-blue-500 outline-none font-bold text-gray-900 dark:text-white" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} /></div>
                  <div><label className="block text-xs font-bold text-gray-600 dark:text-white/50 mb-3 uppercase tracking-widest">Price ($) per night</label><input required type="number" placeholder="250" className="w-full p-4 rounded-2xl bg-transparent dark:bg-white/5 border border-gray-300 dark:border-white/10 focus:border-blue-500 outline-none font-bold text-gray-900 dark:text-white" value={formData.pricePerNight} onChange={e => setFormData({...formData, pricePerNight: e.target.value})} /></div>
                  <div><label className="block text-xs font-bold text-gray-600 dark:text-white/50 mb-3 uppercase tracking-widest">Initial Rating (1-5)</label><input required type="number" step="0.1" max="5" placeholder="4.8" className="w-full p-4 rounded-2xl bg-transparent dark:bg-white/5 border border-gray-300 dark:border-white/10 focus:border-blue-500 outline-none font-bold text-gray-900 dark:text-white" value={formData.rating} onChange={e => setFormData({...formData, rating: e.target.value})} /></div>
                  <div><label className="block text-xs font-bold text-gray-600 dark:text-white/50 mb-3 uppercase tracking-widest">Phone Number</label><input placeholder="+255 700 000 000" className="w-full p-4 rounded-2xl bg-transparent dark:bg-white/5 border border-gray-300 dark:border-white/10 focus:border-blue-500 outline-none font-bold text-gray-900 dark:text-white" value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} /></div>
                  <div><label className="block text-xs font-bold text-gray-600 dark:text-white/50 mb-3 uppercase tracking-widest">Instagram Handle</label><input placeholder="@hotel_arusha" className="w-full p-4 rounded-2xl bg-transparent dark:bg-white/5 border border-gray-300 dark:border-white/10 focus:border-blue-500 outline-none font-bold text-gray-900 dark:text-white" value={formData.instagram_handle} onChange={e => setFormData({...formData, instagram_handle: e.target.value})} /></div>
                </div>

                <div><label className="block text-xs font-bold text-gray-600 dark:text-white/50 mb-3 uppercase tracking-widest">Official Website Link</label><input placeholder="https://..." className="w-full p-4 rounded-2xl bg-transparent dark:bg-white/5 border border-gray-300 dark:border-white/10 focus:border-blue-500 outline-none font-bold text-gray-900 dark:text-white" value={formData.officialUrl} onChange={e => setFormData({...formData, officialUrl: e.target.value})} /></div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-white/50 mb-4 uppercase tracking-widest">Amenities</label>
                  <div className="flex flex-wrap gap-3">
                    {AVAILABLE_AMENITIES.map(amenity => (
                      <button type="button" key={amenity} onClick={() => toggleAmenity(amenity)} className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all border ${formData.amenities.includes(amenity) ? 'bg-blue-600 border-blue-500 text-white shadow-lg scale-105' : 'bg-transparent border-gray-300 dark:border-white/20 hover:border-gray-400 dark:hover:border-white/50 text-gray-600 dark:text-white/60'}`}>{amenity}</button>
                    ))}
                  </div>
                </div>

                <div><label className="block text-xs font-bold text-gray-600 dark:text-white/50 mb-3 uppercase tracking-widest">Hotel Description</label><textarea required rows={5} placeholder="Describe the vibe, rooms, and experience..." className="w-full p-5 rounded-2xl bg-transparent dark:bg-white/5 border border-gray-300 dark:border-white/10 focus:border-blue-500 outline-none font-medium resize-none text-gray-900 dark:text-white" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></div>

                <div className="flex flex-col md:flex-row gap-6">
                  <label className="flex-1 flex items-center gap-4 bg-gray-50 dark:bg-white/5 p-5 rounded-2xl border border-gray-200 dark:border-white/10 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                    <input type="checkbox" checked={formData.isHidden} onChange={(e) => setFormData({...formData, isHidden: e.target.checked})} className="w-6 h-6 rounded border-gray-300 dark:border-white/20 text-blue-600 focus:ring-0" />
                    <div><p className="font-bold text-gray-900 dark:text-white">Hide from Directory</p><p className="text-xs text-gray-500 dark:text-white/40 mt-1">Temporarily unpublish this listing.</p></div>
                  </label>
                  <label className="flex-1 flex items-center gap-4 bg-yellow-50 dark:bg-yellow-500/10 p-5 rounded-2xl border border-yellow-200 dark:border-yellow-500/30 cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-500/20 transition-colors">
                    <input type="checkbox" checked={formData.is_featured} onChange={(e) => setFormData({...formData, is_featured: e.target.checked})} className="w-6 h-6 rounded border-yellow-400 dark:border-yellow-500/50 text-yellow-500 focus:ring-0" />
                    <div><p className="font-bold text-yellow-700 dark:text-yellow-400">Featured Premium Pick</p><p className="text-xs text-yellow-600/70 dark:text-yellow-500/50 mt-1">Bump to the top of the homepage.</p></div>
                  </label>
                </div>

                {status && <div className={`p-6 rounded-2xl font-black text-center ${status.type === 'success' ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20' : 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20'}`}>{status.msg}</div>}

                <button disabled={loading} className="w-full bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 font-black py-6 rounded-2xl text-xl shadow-lg active:scale-95 transition-all uppercase tracking-widest disabled:opacity-50">
                  {loading ? "Processing Upload..." : editId ? "Save Changes" : "Publish to Directory"}
                </button>
              </form>
            </div>
          </div>
        )}

        {currentView === 'reviews' && (
          <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
            <button onClick={() => setCurrentView('dashboard')} className="text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white font-bold mb-6 flex items-center gap-2 transition-all">← Back to Hub</button>
            <div className="bg-white/90 dark:bg-[#0a0a0a]/80 backdrop-blur-3xl rounded-[2.5rem] border border-gray-200 dark:border-white/10 p-8 md:p-12 shadow-xl dark:shadow-2xl">
              <h1 className="text-4xl font-extrabold tracking-tight mb-8 text-gray-900 dark:text-white">Review Moderation</h1>
              
              <div className="space-y-4">
                {reviews.length > 0 ? reviews.map((rev) => (
                  <div key={rev.id} className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-6 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:bg-gray-100 dark:hover:bg-white/10 transition-all">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-yellow-100 dark:bg-yellow-400/20 text-yellow-700 dark:text-yellow-400 px-3 py-1 rounded-md text-xs font-black uppercase tracking-widest">⭐ {rev.rating}</span>
                        <span className="text-blue-600 dark:text-blue-400 font-bold text-sm bg-blue-50 dark:bg-blue-400/10 px-3 py-1 rounded-full">{rev.hotels?.name}</span>
                      </div>
                      <p className="text-gray-900 dark:text-white font-bold text-xl mb-1">{rev.user_name}</p>
                      <p className="text-gray-600 dark:text-white/60 leading-relaxed font-medium">"{rev.comment}"</p>
                    </div>
                    <button onClick={() => handleDeleteReview(rev.id)} className="bg-red-50 hover:bg-red-500 dark:bg-red-500/10 text-red-600 dark:text-red-500 border border-red-200 dark:border-red-500/20 px-6 py-3 rounded-xl hover:text-white transition-all font-bold text-sm w-full md:w-auto shadow-sm">
                      Delete Spam
                    </button>
                  </div>
                )) : <div className="text-center py-32 border-2 border-dashed border-gray-300 dark:border-white/10 rounded-3xl bg-gray-50 dark:bg-black/50"><p className="text-gray-500 dark:text-white/40 text-xl font-bold">No reviews found yet.</p></div>}
              </div>
            </div>
          </div>
        )}

        {currentView === 'inquiries' && (
          <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
            <button onClick={() => setCurrentView('dashboard')} className="text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white font-bold mb-6 flex items-center gap-2 transition-all">← Back to Hub</button>
            <div className="bg-white/90 dark:bg-[#0a0a0a]/80 backdrop-blur-3xl rounded-[2.5rem] border border-gray-200 dark:border-white/10 p-8 md:p-12 shadow-xl dark:shadow-2xl">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
                <div>
                  <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">Partner Inbox</h1>
                  <button onClick={fetchInquiries} className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline mt-2">Refresh Inbox ↻</button>
                </div>

                <div className="flex bg-gray-100 dark:bg-black/50 p-1.5 rounded-full border border-gray-200 dark:border-white/10 w-full sm:w-auto">
                  <button onClick={() => setInboxTab('new')} className={`flex-1 sm:flex-none px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${inboxTab === 'new' ? 'bg-emerald-500 text-white shadow-lg' : 'text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white'}`}>
                    New ({pendingInquiries.length})
                  </button>
                  <button onClick={() => setInboxTab('archived')} className={`flex-1 sm:flex-none px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${inboxTab === 'archived' ? 'bg-gray-800 dark:bg-white/20 text-white shadow-lg' : 'text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white'}`}>
                    Archived
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                {displayedInquiries.length > 0 ? displayedInquiries.map((inq) => (
                  <div key={inq.id} className={`border p-6 rounded-3xl flex flex-col md:flex-row justify-between items-start gap-6 transition-all ${inboxTab === 'new' ? 'bg-gray-50 dark:bg-white/5 border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-50 dark:hover:bg-emerald-500/5' : 'bg-transparent border-gray-200 dark:border-white/10 opacity-70 hover:opacity-100'}`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`font-bold text-sm px-3 py-1 rounded-full border ${inboxTab === 'new' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-400/10 border-emerald-100 dark:border-emerald-400/20' : 'text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10'}`}>
                          {inboxTab === 'new' ? 'Lead' : 'Archived'}
                        </span>
                        <span className="text-gray-400 dark:text-white/30 text-xs">{new Date(inq.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-900 dark:text-white font-black text-2xl mb-1">{inq.hotel_name}</p>
                      <a href={`mailto:${inq.email}`} className="text-blue-600 dark:text-blue-400 font-medium mb-3 inline-block hover:underline">{inq.email}</a>
                      {inq.message && (
                        <div className="bg-white dark:bg-black/50 p-4 rounded-xl border border-gray-200 dark:border-white/5 mt-2">
                          <p className="text-gray-600 dark:text-white/70 italic text-sm">"{inq.message}"</p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 w-full md:w-auto">
                      {inboxTab === 'new' && (
                        <a href={`mailto:${inq.email}?subject=Partnership with Arusha Hotels`} className="text-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all font-bold text-sm shadow-sm">
                          Reply via Email
                        </a>
                      )}
                      
                      <button onClick={() => handleToggleArchive(inq.id, inq.status)} className="bg-gray-200 dark:bg-white/5 hover:bg-gray-300 dark:hover:bg-white/10 text-gray-700 dark:text-white/70 hover:text-gray-900 dark:hover:text-white px-6 py-3 rounded-xl transition-all font-bold text-sm shadow-sm">
                        {inboxTab === 'new' ? 'Archive Request' : 'Unarchive Request'}
                      </button>

                      {inboxTab === 'archived' && (
                        <button onClick={() => handleDeleteInquiry(inq.id)} className="bg-red-50 hover:bg-red-500 dark:bg-red-500/10 text-red-600 dark:text-red-500 border border-red-200 dark:border-red-500/20 px-6 py-3 rounded-xl hover:text-white transition-all font-bold text-sm w-full md:w-auto shadow-sm mt-2">
                          Delete Forever
                        </button>
                      )}
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-32 border-2 border-dashed border-gray-300 dark:border-white/10 rounded-3xl bg-gray-50 dark:bg-black/50">
                    <p className="text-gray-500 dark:text-white/40 text-xl font-bold">
                      {inboxTab === 'new' ? 'Inbox is empty. No new partnership requests.' : 'No archived requests.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {currentView === 'analytics' && (
          <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
            <button onClick={() => setCurrentView('dashboard')} className="text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white font-bold mb-6 flex items-center gap-2 transition-all">← Back to Hub</button>
            
            <div className="bg-white/90 dark:bg-[#0a0a0a]/80 backdrop-blur-3xl rounded-[2.5rem] border border-gray-200 dark:border-white/10 p-8 md:p-12 shadow-xl dark:shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 dark:bg-cyan-500/20 blur-[100px] pointer-events-none"></div>
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 relative z-10">
                <div>
                  <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2">Live Traffic Analytics</h1>
                  <p className="text-gray-500 dark:text-white/50 font-medium text-lg">Total platform clicks across all properties.</p>
                </div>
                
                <div className="mt-4 md:mt-0 text-left md:text-right flex flex-col md:items-end">
                  <p className="text-sm font-bold text-gray-400 dark:text-white/30 uppercase tracking-widest mb-1">Total Views</p>
                  <p className="text-5xl font-black text-cyan-600 dark:text-cyan-400 tracking-tighter mb-4">{totalClicks.toLocaleString()}</p>
                  
                  <button 
                    onClick={handleResetAnalytics}
                    className="text-xs font-bold bg-red-500/10 text-red-600 dark:text-red-500 border border-red-500/20 px-4 py-2 rounded-full hover:bg-red-600 hover:text-white transition-all shadow-sm active:scale-95"
                  >
                    Reset Data 🗑️
                  </button>
                </div>
              </div>

              {clickData.length > 0 ? (
                <div className="h-[400px] w-full relative z-10 mt-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={clickData} margin={{ top: 20, right: 30, left: 0, bottom: 50 }}>
                      <XAxis 
                        dataKey="name" 
                        tick={{ fill: '#888', fontSize: 12, fontWeight: 'bold' }} 
                        tickMargin={15}
                        axisLine={false}
                        tickLine={false}
                        angle={-45}
                        textAnchor="end"
                      />
                      <YAxis 
                        tick={{ fill: '#888', fontSize: 12, fontWeight: 'bold' }} 
                        axisLine={false}
                        tickLine={false}
                        tickMargin={15}
                      />
                      <Tooltip 
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff', fontWeight: 'bold', padding: '12px 20px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
                        itemStyle={{ color: '#22d3ee' }}
                      />
                      <Bar dataKey="clicks" radius={[8, 8, 8, 8]} barSize={40}>
                        {clickData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? '#06b6d4' : '#0891b2'} className="hover:opacity-80 transition-opacity cursor-pointer" />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-32 border-2 border-dashed border-gray-300 dark:border-white/10 rounded-3xl bg-gray-50 dark:bg-black/50">
                  <p className="text-gray-500 dark:text-white/40 text-xl font-bold">No click data available yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}