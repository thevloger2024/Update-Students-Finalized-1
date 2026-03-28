import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { UpdateCard, UpdateData } from '../components/UpdateCard';
import { useBookmarkContext } from '../contexts/BookmarkContext';
import { collection, query, where, documentId, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Bookmark, ArrowLeft, Filter, SortAsc } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { TranslatedText } from '../components/TranslatedText';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '../contexts/utils';

export function SavedPage() {
  const { t } = useLanguage();
  const { bookmarkedUpdates, loading: bookmarksLoading, isAuthenticated } = useBookmarkContext();
  const [updates, setUpdates] = useState<UpdateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date_saved');

  useEffect(() => {
    const fetchUpdates = async () => {
      if (bookmarkedUpdates.length === 0) {
        setUpdates([]);
        setLoading(false);
        return;
      }

      try {
        const updateIds = bookmarkedUpdates.map(b => b.updateId);
        // Firestore 'in' query supports up to 10 IDs. For more, we'd need to chunk.
        // For simplicity, let's handle up to 10 or fetch individually.
        // Let's fetch all at once if <= 10, otherwise chunk.
        
        const fetchedUpdates: UpdateData[] = [];
        const chunks = [];
        for (let i = 0; i < updateIds.length; i += 10) {
          chunks.push(updateIds.slice(i, i + 10));
        }

        for (const chunk of chunks) {
          const q = query(collection(db, 'updates'), where(documentId(), 'in', chunk));
          const snapshot = await getDocs(q);
          snapshot.forEach(doc => {
            fetchedUpdates.push({ id: doc.id, ...doc.data() } as UpdateData);
          });
        }

        // Sort by bookmark creation date (bookmarkedUpdates is already sorted)
        const sortedUpdates = bookmarkedUpdates
          .map(b => fetchedUpdates.find(u => u.id === b.updateId))
          .filter((u): u is UpdateData => !!u);

        setUpdates(sortedUpdates);
      } catch (error) {
        console.error("Error fetching bookmarked updates:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!bookmarksLoading) {
      fetchUpdates();
    }
  }, [bookmarkedUpdates, bookmarksLoading]);

  const filteredAndSortedUpdates = updates
    .filter(u => filterType === 'all' ? true : u.type === filterType)
    .sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'type') {
        return a.type.localeCompare(b.type);
      }
      // Default: date_saved (already handled by the order in 'updates' which follows 'bookmarkedUpdates')
      return 0;
    });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <Bookmark size={48} className="mx-auto text-slate-300 mb-4" />
          <h2 className="text-2xl font-bold text-slate-700 mb-4">{t('loginToViewSaved')}</h2>
          <Link to="/" className="text-academic-blue hover:underline">{t('backToHome')}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8 pb-20">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="text-slate-500 hover:text-academic-blue transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-academic-blue flex items-center gap-3">
            <Bookmark size={32} className="text-academic-gold" fill="currentColor" />
            {t('savedUpdates')}
          </h1>
        </div>

        {!loading && !bookmarksLoading && updates.length > 0 && (
          <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 flex-1">
              <Filter size={20} className="text-slate-400" />
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {['all', 'job', 'admit_card', 'result'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={cn(
                      "whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all",
                      filterType === type
                        ? "bg-academic-blue text-white shadow-md"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    )}
                  >
                    {t(type === 'admit_card' ? 'admitCards' : type === 'result' ? 'results' : type === 'job' ? 'jobs' : 'allTypes')}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-4">
              <SortAsc size={20} className="text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-sm font-semibold text-slate-600 focus:outline-none cursor-pointer"
              >
                <option value="date_saved">{t('recentlySaved')}</option>
                <option value="title">{t('titleAZ')}</option>
                <option value="type">{t('category')}</option>
              </select>
            </div>
          </div>
        )}

        {loading || bookmarksLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-academic-blue"></div>
          </div>
        ) : filteredAndSortedUpdates.length > 0 ? (
          <motion.div 
            key={`${filterType}-${sortBy}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {filteredAndSortedUpdates.map((update) => (
              <UpdateCard key={update.id} update={update} />
            ))}
          </motion.div>
        ) : updates.length > 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-slate-200 border-dashed">
            <p className="text-slate-500">{t('noSavedUpdatesMatch')}</p>
            <button 
              onClick={() => setFilterType('all')}
              className="text-academic-blue font-semibold mt-2 hover:underline"
            >
              {t('clearFilter')}
            </button>
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-slate-200 border-dashed">
            <Bookmark size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-500 text-lg">{t('noSavedUpdatesYet')}</p>
            <Link to="/" className="text-academic-blue font-semibold mt-2 inline-block hover:underline">
              {t('browseLatestUpdates')}
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
