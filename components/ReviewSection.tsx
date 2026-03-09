"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

interface Review {
  id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
  parent_id: string | null;
}

const REVIEWS_PER_PAGE = 3;

export default function ReviewSection({ hotelId }: { hotelId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  
  // Track which reviews belong to this device (so they can only edit their own)
  const [myReviewIds, setMyReviewIds] = useState<string[]>([]);
  
  // A live timer to force re-renders so the 5-minute window expires in real-time
  const [now, setNow] = useState(Date.now());

  // Form States
  const [newReview, setNewReview] = useState({ name: "", rating: 5, comment: "" });
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyForm, setReplyForm] = useState({ name: "", comment: "" });
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ comment: "" });

  useEffect(() => {
    fetchReviews();
    // Load the user's previously authored reviews from their browser memory
    const storedIds = localStorage.getItem("my_reviews");
    if (storedIds) setMyReviewIds(JSON.parse(storedIds));

    // Update the 'now' clock every 10 seconds to check for the 5-minute expiration
    const interval = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(interval);
  }, [hotelId]);

  // Save the user's review ID to their browser so they have permission to edit it
  const addMyReviewId = (id: string) => {
    const updatedIds = [...myReviewIds, id];
    setMyReviewIds(updatedIds);
    localStorage.setItem("my_reviews", JSON.stringify(updatedIds));
  };

  async function fetchReviews() {
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .eq("hotel_id", hotelId)
      .order("created_at", { ascending: false });
      
    if (data) setReviews(data);
    setLoading(false);
  }

  // Handle Main Review
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.name || !newReview.comment) return;
    setIsSubmitting(true);
    
    // Notice the .select() here! It returns the data so we can grab the new ID
    const { data, error } = await supabase.from("reviews").insert([{
      hotel_id: hotelId,
      user_name: newReview.name,
      rating: newReview.rating,
      comment: newReview.comment,
      parent_id: null
    }]).select();

    if (!error && data) {
      addMyReviewId(data[0].id);
      setNewReview({ name: "", rating: 5, comment: "" });
      setCurrentPage(1); // Jump to page 1 to see the new review
      fetchReviews(); 
    }
    setIsSubmitting(false);
  };

  // Handle Reply
  const handleReplySubmit = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!replyForm.name || !replyForm.comment) return;
    setIsSubmitting(true);
    
    const { data, error } = await supabase.from("reviews").insert([{
      hotel_id: hotelId,
      user_name: replyForm.name,
      rating: 5, 
      comment: replyForm.comment,
      parent_id: parentId
    }]).select();

    if (!error && data) {
      addMyReviewId(data[0].id);
      setReplyForm({ name: "", comment: "" });
      setReplyingTo(null); 
      fetchReviews(); 
    }
    setIsSubmitting(false);
  };

  // Handle Edit
  const handleEditSubmit = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!editForm.comment) return;
    setIsSubmitting(true);

    const { error } = await supabase
      .from("reviews")
      .update({ comment: editForm.comment })
      .eq("id", id);

    if (!error) {
      setEditingReviewId(null);
      fetchReviews();
    }
    setIsSubmitting(false);
  };

  // Handle Delete
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (!error) {
      fetchReviews();
      if (displayedReviews.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
    }
  };

  // Helper to check if a review is within the 5 minute window
  const isWithin5Minutes = (createdAt: string) => {
    const timePassed = now - new Date(createdAt).getTime();
    return timePassed < 5 * 60 * 1000; // 5 mins in milliseconds
  };

  const topLevelReviews = reviews.filter(r => !r.parent_id);
  
  const totalPages = Math.ceil(topLevelReviews.length / REVIEWS_PER_PAGE);
  const displayedReviews = topLevelReviews.slice(
    (currentPage - 1) * REVIEWS_PER_PAGE,
    currentPage * REVIEWS_PER_PAGE
  );

  return (
    <div className="mt-2 mb-4 w-full">
      <div className="flex items-baseline gap-3 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Guest Reviews</h2>
        <span className="text-gray-500 font-medium text-lg">({topLevelReviews.length})</span>
      </div>

      {/* --- ADD MAIN REVIEW FORM (Upgraded UI) --- */}
      <div className="bg-black/5 dark:bg-black/20 border border-gray-200/50 dark:border-white/10 p-6 md:p-8 rounded-[1.5rem] mb-10 transition-colors duration-500">
        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] mb-4">Leave a Review</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <input 
              required placeholder="Your Name" value={newReview.name}
              onChange={(e) => setNewReview({...newReview, name: e.target.value})}
              className="flex-1 p-4 rounded-xl bg-transparent border border-gray-300/80 dark:border-white/20 focus:border-gray-900 dark:focus:border-white outline-none transition-all font-medium text-gray-900 dark:text-white placeholder-gray-500"
            />
            <div className="flex items-center gap-2 bg-transparent border border-gray-300/80 dark:border-white/20 rounded-xl px-4 py-2 focus-within:border-gray-900 dark:focus-within:border-white transition-all">
              <span className="text-yellow-500">⭐</span>
              <select 
                value={newReview.rating} onChange={(e) => setNewReview({...newReview, rating: parseInt(e.target.value)})}
                className="bg-transparent outline-none font-bold text-gray-700 dark:text-gray-300 cursor-pointer appearance-none py-2 pr-4"
              >
                <option value={5} className="text-black">⭐⭐⭐⭐⭐ (5/5)</option>
                <option value={4} className="text-black">⭐⭐⭐⭐ (4/5)</option>
                <option value={3} className="text-black">⭐⭐⭐ (3/5)</option>
                <option value={2} className="text-black">⭐⭐ (2/5)</option>
                <option value={1} className="text-black">⭐ (1/5)</option>
              </select>
            </div>
          </div>
          <textarea 
            required placeholder="Tell us about your experience..." rows={3} value={newReview.comment}
            onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
            className="w-full p-4 rounded-xl bg-transparent border border-gray-300/80 dark:border-white/20 focus:border-gray-900 dark:focus:border-white outline-none transition-all font-medium resize-none text-gray-900 dark:text-white placeholder-gray-500"
          />
          <button disabled={isSubmitting} className="w-full sm:w-auto bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-gray-900 font-bold py-3 px-8 rounded-xl transition-all active:scale-95 disabled:opacity-50">
            {isSubmitting ? "Posting..." : "Post Review"}
          </button>
        </form>
      </div>

      {/* --- REVIEWS & REPLIES LIST --- */}
      {loading ? (
        <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-2 bg-gray-200 dark:bg-white/10 rounded w-1/4"></div><div className="h-2 bg-gray-200 dark:bg-white/10 rounded w-5/6"></div></div></div>
      ) : topLevelReviews.length > 0 ? (
        <div className="space-y-6">
          {displayedReviews.map((review) => {
            const isMyReview = myReviewIds.includes(review.id);
            const canModify = isMyReview && isWithin5Minutes(review.created_at);

            return (
              <div key={review.id} className="border-b border-gray-200/50 dark:border-white/10 pb-6 last:border-0 last:pb-0">
                
                {/* Main Review */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-lg">{review.user_name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                      {new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex gap-1 text-yellow-500 text-sm">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={i < review.rating ? "opacity-100" : "opacity-30 grayscale"}>⭐</span>
                    ))}
                  </div>
                </div>

                {/* Edit Mode vs Normal View */}
                {editingReviewId === review.id ? (
                  <form onSubmit={(e) => handleEditSubmit(e, review.id)} className="mt-2 space-y-3">
                    <textarea 
                      required rows={2} value={editForm.comment}
                      onChange={(e) => setEditForm({...editForm, comment: e.target.value})}
                      className="w-full p-3 rounded-xl bg-transparent border border-gray-400 dark:border-white/40 focus:border-gray-900 dark:focus:border-white outline-none text-sm font-medium resize-none text-gray-900 dark:text-white"
                    />
                    <div className="flex gap-2">
                      <button disabled={isSubmitting} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold py-2 px-4 rounded-lg disabled:opacity-50">Save</button>
                      <button type="button" onClick={() => setEditingReviewId(null)} className="bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 text-xs font-bold py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-white/20 transition-colors">Cancel</button>
                    </div>
                  </form>
                ) : (
                  <p className="text-gray-700 dark:text-gray-300 font-light leading-relaxed">{review.comment}</p>
                )}

                {/* Action Bar */}
                <div className="mt-4 flex items-center gap-4">
                  <button 
                    onClick={() => setReplyingTo(replyingTo === review.id ? null : review.id)}
                    className="text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                    {replyingTo === review.id ? "Cancel Reply" : "Reply"}
                  </button>

                  {canModify && (
                    <>
                      <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                      <button 
                        onClick={() => { setEditingReviewId(review.id); setEditForm({ comment: review.comment }); }}
                        className="text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(review.id)}
                        className="text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>

                {/* Inline Reply Form */}
                {replyingTo === review.id && (
                  <form onSubmit={(e) => handleReplySubmit(e, review.id)} className="mt-4 ml-4 sm:ml-8 pl-4 border-l-2 border-gray-300 dark:border-white/20 space-y-3">
                    <input 
                      required placeholder="Your Name" value={replyForm.name}
                      onChange={(e) => setReplyForm({...replyForm, name: e.target.value})}
                      className="w-full sm:w-1/2 p-3 rounded-xl bg-transparent border border-gray-300/80 dark:border-white/20 focus:border-gray-900 dark:focus:border-white outline-none text-sm font-medium text-gray-900 dark:text-white"
                    />
                    <textarea 
                      required placeholder="Write your reply..." rows={2} value={replyForm.comment}
                      onChange={(e) => setReplyForm({...replyForm, comment: e.target.value})}
                      className="w-full p-3 rounded-xl bg-transparent border border-gray-300/80 dark:border-white/20 focus:border-gray-900 dark:focus:border-white outline-none text-sm font-medium resize-none text-gray-900 dark:text-white"
                    />
                    <button disabled={isSubmitting} className="bg-gray-900 dark:bg-white hover:bg-black dark:hover:bg-gray-200 text-white dark:text-gray-900 text-sm font-bold py-2 px-6 rounded-lg transition-all active:scale-95 disabled:opacity-50">
                      Submit Reply
                    </button>
                  </form>
                )}

                {/* Nested Replies Rendering */}
                {reviews.filter(r => r.parent_id === review.id).length > 0 && (
                  <div className="mt-6 ml-4 sm:ml-8 pl-4 border-l-2 border-gray-200 dark:border-white/10 space-y-4">
                    {reviews.filter(r => r.parent_id === review.id).map(reply => {
                      const isMyReply = myReviewIds.includes(reply.id);
                      const canModifyReply = isMyReply && isWithin5Minutes(reply.created_at);

                      return (
                        <div key={reply.id} className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-gray-200/50 dark:border-white/5">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[9px] px-2 py-0.5 rounded-full font-black tracking-widest uppercase">Reply</span>
                            <h5 className="font-bold text-gray-900 dark:text-white text-sm">{reply.user_name}</h5>
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium ml-auto">{new Date(reply.created_at).toLocaleDateString()}</span>
                          </div>
                          
                          {/* Edit Mode for Reply */}
                          {editingReviewId === reply.id ? (
                            <form onSubmit={(e) => handleEditSubmit(e, reply.id)} className="mt-2 space-y-3">
                              <textarea 
                                required rows={2} value={editForm.comment}
                                onChange={(e) => setEditForm({...editForm, comment: e.target.value})}
                                className="w-full p-3 rounded-xl bg-transparent border border-gray-400 dark:border-white/40 focus:border-gray-900 dark:focus:border-white outline-none text-sm font-medium resize-none text-gray-900 dark:text-white"
                              />
                              <div className="flex gap-2">
                                <button disabled={isSubmitting} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] font-bold py-1.5 px-3 rounded disabled:opacity-50">Save</button>
                                <button type="button" onClick={() => setEditingReviewId(null)} className="bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 text-[10px] font-bold py-1.5 px-3 rounded hover:bg-gray-300 dark:hover:bg-white/20">Cancel</button>
                              </div>
                            </form>
                          ) : (
                            <p className="text-gray-700 dark:text-gray-300 text-sm font-light leading-relaxed mt-2">{reply.comment}</p>
                          )}

                          {/* Reply Action Bar (Edit/Delete only) */}
                          {canModifyReply && !editingReviewId && (
                            <div className="mt-3 flex items-center gap-3">
                              <button 
                                onClick={() => { setEditingReviewId(reply.id); setEditForm({ comment: reply.comment }); }}
                                className="text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                              >
                                Edit
                              </button>
                              <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                              <button 
                                onClick={() => handleDelete(reply.id)}
                                className="text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          )}

                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-10 bg-black/5 dark:bg-white/5 rounded-[1.5rem] border border-gray-200/50 dark:border-white/10 border-dashed">
          <p className="text-gray-500 dark:text-gray-400 font-medium">No reviews yet. Be the first to share your experience!</p>
        </div>
      )}

      {/* --- PAGINATION BUTTONS --- */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200/50 dark:border-white/10">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-white/5 rounded-full hover:bg-gray-200 dark:hover:bg-white/10"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
            Prev
          </button>
          
          <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
            {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-white/5 rounded-full hover:bg-gray-200 dark:hover:bg-white/10"
          >
            Next
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      )}
    </div>
  );
}