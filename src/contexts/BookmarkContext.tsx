import React, { createContext, useContext, ReactNode } from 'react';
import { useBookmarks, BookmarkData } from '../hooks/useBookmarks';
import { UpdateData } from '../components/UpdateCard';

interface BookmarkContextType {
  bookmarks: Record<string, boolean>;
  bookmarkedUpdates: BookmarkData[];
  toggleBookmark: (update: UpdateData) => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

export function BookmarkProvider({ children }: { children: ReactNode }) {
  const bookmarkData = useBookmarks();

  return (
    <BookmarkContext.Provider value={bookmarkData}>
      {children}
    </BookmarkContext.Provider>
  );
}

export function useBookmarkContext() {
  const context = useContext(BookmarkContext);
  if (context === undefined) {
    throw new Error('useBookmarkContext must be used within a BookmarkProvider');
  }
  return context;
}
