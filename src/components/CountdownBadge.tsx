import React from 'react';
import { Timer } from 'lucide-react';
import { useCountdown } from '../hooks/useCountdown';

interface CountdownBadgeProps {
  lastDate: string | undefined;
}

export function CountdownBadge({ lastDate }: CountdownBadgeProps) {
  const timeLeft = useCountdown(lastDate || null);

  if (!timeLeft || timeLeft.hasExpired) return null;

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
      timeLeft.isExpiringSoon 
        ? 'bg-red-100 text-red-700 border border-red-200 animate-pulse' 
        : 'bg-amber-100 text-amber-700 border border-amber-200'
    }`}>
      <Timer size={14} className={timeLeft.isExpiringSoon ? 'animate-bounce' : ''} />
      <span>
        {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m Left
      </span>
    </div>
  );
}
