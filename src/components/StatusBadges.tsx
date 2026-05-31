import React from 'react';
import { Flame, Sparkles } from 'lucide-react';
import { Post } from '../types';

interface StatusBadgesProps {
  post: Post;
}

export function StatusBadges({ post }: StatusBadgesProps) {
  const isNew = () => {
    if (!post.date) return false;
    // Assuming date is generated recently or stored properly
    const postDate = new Date(post.date);
    const now = new Date();
    // 48 hours
    return now.getTime() - postDate.getTime() < 48 * 60 * 60 * 1000;
  };

  // Pseudo-logic for "Hot", usually we'd track views
  const isHot = (post.views || 0) > 100; // arbitrary logic for now

  return (
    <div className="flex gap-2">
      {isNew() && (
        <span className="flex items-center gap-1 bg-red-500 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider animate-pulse">
          <Sparkles size={10} />
          New
        </span>
      )}
      {isHot && (
        <span className="flex items-center gap-1 bg-orange-500 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
          <Flame size={10} />
          Hot
        </span>
      )}
    </div>
  );
}
