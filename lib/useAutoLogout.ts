"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "./supabase"; // Adjust this path if your supabase file is elsewhere!

export function useAutoLogout(timeoutMinutes = 30) {
  const router = useRouter();
  // We use a ref to store the timer so it doesn't trigger unnecessary re-renders
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 1. The function that actually logs the user out
    const logout = async () => {
      console.log("🔒 30 minutes of inactivity detected. Auto-logging out...");
      await supabase.auth.signOut();
      router.push("/login"); // <-- CHANGE THIS to your actual admin login route if it's different!
    };

    // 2. The function that resets the clock every time they move the mouse
    const resetTimer = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // Convert minutes to milliseconds
      timeoutRef.current = setTimeout(logout, timeoutMinutes * 60 * 1000);
    };

    // 3. The events we consider "Activity"
    const activityEvents = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
    ];

    // Start the timer the second they load the page
    resetTimer();

    // Attach the listeners to the browser window
    activityEvents.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    // Cleanup: Remove listeners if they leave the page manually
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [router, timeoutMinutes]);
}