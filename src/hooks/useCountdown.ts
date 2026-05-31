import { useState, useEffect } from 'react';

export function useCountdown(lastDateStr: string | null) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    isExpiringSoon: boolean;
    hasExpired: boolean;
  } | null>(null);

  useEffect(() => {
    if (!lastDateStr) {
      setTimeLeft(null);
      return;
    }

    const calculateTimeLeft = () => {
      // Assuming lastDateStr is in "YYYY-MM-DD" or similar parseable format
      const lastDate = new Date(lastDateStr);
      // Give it until end of day
      lastDate.setHours(23, 59, 59, 999);
      const now = new Date();
      
      const difference = lastDate.getTime() - now.getTime();

      if (difference <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          isExpiringSoon: false,
          hasExpired: true
        };
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);

      // Show timer if within 15 days
      if (days > 15) {
        return null;
      }

      return {
        days,
        hours,
        minutes,
        isExpiringSoon: days < 3, // Red color if < 3 days remain
        hasExpired: false
      };
    };

    setTimeLeft(calculateTimeLeft());
    
    // Update every minute instead of every second to save re-renders
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 60000);

    return () => clearInterval(timer);
  }, [lastDateStr]);

  return timeLeft;
}
