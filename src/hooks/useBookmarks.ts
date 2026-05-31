import { useState, useEffect } from 'react';
import { UpdateData } from '../components/UpdateCard';

export interface BookmarkData {
  updateId: string;
  title: string;
  type: string;
  createdAt: number;
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});
  const [bookmarkedUpdates, setBookmarkedUpdates] = useState<BookmarkData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial load from localStorage
    try {
      const stored = localStorage.getItem('user_bookmarks');
      if (stored) {
        const parsed: BookmarkData[] = JSON.parse(stored);
        
        const newBookmarks: Record<string, boolean> = {};
        parsed.forEach(b => {
          newBookmarks[b.updateId] = true;
        });

        setBookmarks(newBookmarks);
        setBookmarkedUpdates(parsed);
      }
    } catch (err) {
      console.error('Failed to load bookmarks', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleBookmark = async (update: UpdateData) => {
    setBookmarkedUpdates(prev => {
      let updated: BookmarkData[];
      const exists = prev.some(b => b.updateId === update.id);
      
      if (exists) {
        updated = prev.filter(b => b.updateId !== update.id);
      } else {
        updated = [{
          updateId: update.id,
          title: update.title,
          type: update.type,
          createdAt: Date.now()
        }, ...prev];
      }

      // Update maps
      const newBookmarks: Record<string, boolean> = {};
      updated.forEach(b => {
        newBookmarks[b.updateId] = true;
      });
      setBookmarks(newBookmarks);

      // Save to localStorage
      localStorage.setItem('user_bookmarks', JSON.stringify(updated));

      return updated;
    });
  };

  return { bookmarks, bookmarkedUpdates, toggleBookmark, loading, isAuthenticated: true };
}
