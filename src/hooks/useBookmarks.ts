import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  collection,
  query,
  orderBy
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
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
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
        setBookmarks({});
        setBookmarkedUpdates([]);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const bookmarksRef = collection(db, `users/${userId}/bookmarks`);
    const q = query(bookmarksRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newBookmarks: Record<string, boolean> = {};
      const newBookmarkedUpdates: BookmarkData[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data() as BookmarkData;
        newBookmarks[data.updateId] = true;
        newBookmarkedUpdates.push(data);
      });

      setBookmarks(newBookmarks);
      setBookmarkedUpdates(newBookmarkedUpdates);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching bookmarks:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const toggleBookmark = async (update: UpdateData) => {
    if (!userId) return;

    const bookmarkRef = doc(db, `users/${userId}/bookmarks`, update.id);

    if (bookmarks[update.id]) {
      try {
        await deleteDoc(bookmarkRef);
      } catch (error) {
        console.error("Error removing bookmark:", error);
      }
    } else {
      try {
        await setDoc(bookmarkRef, {
          updateId: update.id,
          title: update.title,
          type: update.type,
          createdAt: Date.now()
        });
      } catch (error) {
        console.error("Error adding bookmark:", error);
      }
    }
  };

  return { bookmarks, bookmarkedUpdates, toggleBookmark, loading, isAuthenticated: !!userId };
}
