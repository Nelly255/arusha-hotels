"use client";

import { useState } from "react";

interface Props {
  price: string | number;
  officialUrl?: string;
  booking_url?: string;
}

// Helper to format dates to YYYY-MM-DD safely
const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Helper to parse YYYY-MM-DD safely without timezone bugs
const parseDate = (dateStr: string) => {
  const [y, m, d] = dateStr.split("-");
  return new Date(Number(y), Number(m) - 1, Number(d));
};

export default function InteractiveBookingCard({ price, officialUrl, booking_url }: Props) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  // Custom Calendar State
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarView, setCalendarView] = useState(new Date());
  const [selectionStep, setSelectionStep] = useState<"in" | "out">("in");

  const handleBookingCom = () => {
    if (!booking_url) return;
    try {
      if (checkIn && checkOut) {
        const urlObj = new URL(booking_url);
        urlObj.searchParams.set("checkin", checkIn);
        urlObj.searchParams.set("checkout", checkOut);
        window.open(urlObj.toString(), "_blank", "noopener,noreferrer");
      } else {
        window.open(booking_url, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      console.error("Error constructing booking link:", error);
      window.open(booking_url, "_blank", "noopener,noreferrer");
    }
  };

  const handleOfficial = () => {
    if (!officialUrl) return;
    window.open(officialUrl, "_blank", "noopener,noreferrer");
  };

  const nextMonth = () => {
    setCalendarView(new Date(calendarView.getFullYear(), calendarView.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCalendarView(new Date(calendarView.getFullYear(), calendarView.getMonth() - 1, 1));
  };

  const handleDateClick = (dateString: string) => {
    if (selectionStep === "in") {
      setCheckIn(dateString);
      if (checkOut && parseDate(dateString) >= parseDate(checkOut)) {
        setCheckOut(""); // Clear checkout if it's before new checkin
      }
      setSelectionStep("out");
    } else {
      if (checkIn && parseDate(dateString) <= parseDate(checkIn)) {
        setCheckIn(dateString); // They picked an earlier date, assume it's a new checkin
        setSelectionStep("out");
      } else {
        setCheckOut(dateString);
        setShowCalendar(false); // Close calendar when done!
      }
    }
  };

  const renderCalendarDays = () => {
    const year = calendarView.getFullYear();
    const month = calendarView.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkInDate = checkIn ? parseDate(checkIn) : null;
    const checkOutDate = checkOut ? parseDate(checkOut) : null;

    const days = [];
    
    // Empty slots for days before the 1st of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Actual days of the month
    for (let d = 1; d <= daysInMonth; d++) {
      const currentLoopDate = new Date(year, month, d);
      const dateString = formatDate(currentLoopDate);
      
      const isPast = currentLoopDate < today;
      const isCheckIn = checkIn === dateString;
      const isCheckOut = checkOut === dateString;
      const isBetween = checkInDate && checkOutDate && currentLoopDate > checkInDate && currentLoopDate < checkOutDate;

      // Styling logic for the premium feel
      let baseStyle = "p-2 text-sm rounded-lg transition-all ";
      if (isPast) {
        baseStyle += "text-gray-500 dark:text-gray-600 cursor-not-allowed opacity-50";
      } else if (isCheckIn || isCheckOut) {
        baseStyle += "bg-blue-600 text-white font-bold shadow-lg scale-105";
      } else if (isBetween) {
        baseStyle += "bg-blue-500/20 text-blue-900 dark:text-blue-200 font-medium rounded-none";
      } else {
        baseStyle += "text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-white/10 cursor-pointer";
      }

      days.push(
        <button
          key={d}
          disabled={isPast}
          onClick={() => handleDateClick(dateString)}
          className={baseStyle}
        >
          {d}
        </button>
      );
    }
    return days;
  };

  return (
    <div className={`bg-white/70 dark:bg-[#0a0a0a]/50 backdrop-blur-3xl border border-white/60 dark:border-white/10 rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all flex flex-col gap-6 relative ${showCalendar ? "z-[100]" : "z-10"}`}>
      
      {/* Price Header */}
      <div className="flex justify-between items-end border-b border-gray-300/50 dark:border-white/10 pb-4">
        <div>
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] mb-1">
            Starting from
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              ${price}
            </span>
            <span className="text-gray-600 dark:text-gray-400 font-medium text-sm">/night</span>
          </div>
        </div>
      </div>

      {/* Date Picker Section */}
      <div className="flex flex-col gap-4 relative">
        <div className="flex gap-3">
          {/* Check-In Trigger Box */}
          <div
            onClick={() => { setShowCalendar(true); setSelectionStep("in"); }}
            className={`flex-1 flex flex-col gap-1 p-3 rounded-xl border transition-all cursor-pointer backdrop-blur-md ${showCalendar && selectionStep === "in" ? "border-blue-500 bg-blue-500/10" : "border-gray-300/50 dark:border-white/10 bg-white/50 dark:bg-black/40 hover:bg-white/80 dark:hover:bg-white/5"}`}
          >
            <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-1 cursor-pointer">
              Check-In
            </label>
            <div className="text-sm font-semibold text-gray-900 dark:text-white px-1">
              {checkIn ? parseDate(checkIn).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Select Date"}
            </div>
          </div>

          {/* Check-Out Trigger Box */}
          <div
            onClick={() => { setShowCalendar(true); setSelectionStep("out"); }}
            className={`flex-1 flex flex-col gap-1 p-3 rounded-xl border transition-all cursor-pointer backdrop-blur-md ${showCalendar && selectionStep === "out" ? "border-blue-500 bg-blue-500/10" : "border-gray-300/50 dark:border-white/10 bg-white/50 dark:bg-black/40 hover:bg-white/80 dark:hover:bg-white/5"}`}
          >
            <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-1 cursor-pointer">
              Check-Out
            </label>
            <div className="text-sm font-semibold text-gray-900 dark:text-white px-1">
              {checkOut ? parseDate(checkOut).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Select Date"}
            </div>
          </div>
        </div>

        {/* 🔥 THE CUSTOM GLASSY CALENDAR POPOVER 🔥 */}
        {showCalendar && (
          <div className="absolute top-[85px] left-0 w-full bg-white/90 dark:bg-[#111111]/95 backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-2xl p-5 shadow-2xl z-50">
            
            {/* Calendar Header */}
            <div className="flex justify-between items-center mb-4">
              <button onClick={prevMonth} className="p-2 bg-gray-200 dark:bg-white/5 rounded-full hover:bg-gray-300 dark:hover:bg-white/10 text-gray-800 dark:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
              </button>
              <div className="text-gray-900 dark:text-white font-bold text-sm tracking-wide">
                {calendarView.toLocaleString("default", { month: "long", year: "numeric" })}
              </div>
              <button onClick={nextMonth} className="p-2 bg-gray-200 dark:bg-white/5 rounded-full hover:bg-gray-300 dark:hover:bg-white/10 text-gray-800 dark:text-white transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
              </button>
            </div>

            {/* Days of Week */}
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
                <div key={d} className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">{d}</div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {renderCalendarDays()}
            </div>

            {/* Close Button */}
            <button onClick={() => setShowCalendar(false)} className="mt-5 w-full py-2.5 bg-gray-200 dark:bg-white/5 hover:bg-gray-300 dark:hover:bg-white/10 text-gray-800 dark:text-white text-xs font-bold rounded-xl transition-colors uppercase tracking-widest">
              Done
            </button>
          </div>
        )}
      </div>

      {/* Buttons Section */}
      <div className="flex flex-col gap-3 mt-2">
        {booking_url && (
          <button
            onClick={handleBookingCom}
            className="w-full bg-[#003B95] hover:bg-[#00224F] text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex justify-center items-center gap-2"
          >
            <span>Book on Booking.com</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </button>
        )}

        {officialUrl && (
          <button
            onClick={handleOfficial}
            className="w-full bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 border border-gray-300/50 dark:border-white/20 text-gray-900 dark:text-white font-bold py-3.5 rounded-xl transition-all duration-300 flex justify-center items-center gap-2"
          >
            <span>Book Direct with Hotel</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </button>
        )}
      </div>

    </div>
  );
}