import { useState, useEffect } from 'react';

export function useExchangeRate() {
  const [tzsRate, setTzsRate] = useState<number>(2600); 

  useEffect(() => {
    async function fetchLiveRate() {
      try {
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await response.json();
        
        if (data && data.rates && data.rates.TZS) {
          // --- NEW: Print the exact live rate to your browser console! ---
          console.log("🔥 LIVE TZS RATE FETCHED:", data.rates.TZS);
          
          setTzsRate(data.rates.TZS);
        }
      } catch (error) {
        console.error("Failed to fetch live exchange rate, defaulting to 2600.", error);
      }
    }
    
    fetchLiveRate();
  }, []);

  return tzsRate;
}