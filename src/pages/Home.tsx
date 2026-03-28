import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { CategoryTray } from '../components/CategoryTray';
import { StateSelector } from '../components/StateSelector';
import { UpdateSection } from '../components/UpdateSection';
import { FeaturedUpdates } from '../components/FeaturedUpdates';
import { UpdateCard, UpdateData } from '../components/UpdateCard';
import { UpdateCardSkeleton } from '../components/UpdateCardSkeleton';
import { collection, onSnapshot, query, orderBy, doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { StatePromptModal } from '../components/StatePromptModal';
import { toast } from 'sonner';
import { LayoutDashboard, Filter, Search, BrainCircuit, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { TranslatedText } from '../components/TranslatedText';

export function Home() {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [updates, setUpdates] = useState<UpdateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPrompt, setShowPrompt] = useState(false);
  const [pendingState, setPendingState] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('q')?.toLowerCase() || '';
  const urlCategory = searchParams.get('category');
  const urlState = searchParams.get('state');

  // Sync URL params with state
  useEffect(() => {
    if (urlCategory) {
      setSelectedCategory(urlCategory);
    }
    if (urlState) {
      setSelectedState(urlState);
    }
  }, [urlCategory, urlState]);

  // Listen for auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        loadUserPreference(currentUser.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const loadUserPreference = async (uid: string) => {
    try {
      const prefDoc = await getDoc(doc(db, 'users', uid, 'preferences', 'general'));
      if (prefDoc.exists()) {
        const data = prefDoc.data();
        if (data.preferredState && !urlState) { // Only load if URL doesn't override
          setSelectedState(data.preferredState);
        }
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    }
  };

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
    // Update URL without full reload
    const params = new URLSearchParams(location.search);
    if (category) {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    navigate(`/?${params.toString()}`, { replace: true });
  };

  const handleStateSelect = (state: string | null) => {
    setSelectedState(state);
    
    // Update URL
    const params = new URLSearchParams(location.search);
    if (state) {
      params.set('state', state);
    } else {
      params.delete('state');
    }
    navigate(`/?${params.toString()}`, { replace: true });
    
    // Only prompt if user is logged in, selecting a non-null state, 
    // and it's different from current selection
    if (user && state && state !== selectedState) {
      setPendingState(state);
      setShowPrompt(true);
    }
  };

  const saveStatePreference = async () => {
    if (!user || !pendingState) return;
    
    try {
      await setDoc(doc(db, 'users', user.uid, 'preferences', 'general'), {
        preferredState: pendingState,
        updatedAt: Date.now()
      });
      toast.success(t('preferenceSaved').replace('{state}', pendingState));
    } catch (error) {
      console.error("Error saving preference:", error);
      toast.error(t('failedSavePreference'));
    } finally {
      setShowPrompt(false);
      setPendingState(null);
    }
  };

  useEffect(() => {
    const q = query(collection(db, 'updates'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatesData: UpdateData[] = [];
      snapshot.forEach((doc) => {
        updatesData.push({ id: doc.id, ...doc.data() } as UpdateData);
      });
      setUpdates(updatesData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching updates:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredUpdates = updates
    .map((update) => {
      let score = 0;
      if (searchQuery) {
        const title = update.title.toLowerCase();
        const org = update.organization.toLowerCase();
        const desc = update.description.toLowerCase();
        const cat = update.category.toLowerCase();
        const queryWords = searchQuery.split(/\s+/).filter(Boolean);

        // Full phrase matches
        if (title.includes(searchQuery)) score += 20;
        if (desc.includes(searchQuery)) score += 10;
        if (org.includes(searchQuery)) score += 5;
        if (cat.includes(searchQuery)) score += 5;

        // Individual word matches
        queryWords.forEach(word => {
          if (title.includes(word)) score += 5;
          if (desc.includes(word)) score += 2;
          if (org.includes(word)) score += 1;
          if (cat.includes(word)) score += 1;
          
          // Exact word match bonus
          const titleWords = title.split(/\W+/);
          if (titleWords.includes(word)) score += 5;
        });

        // Exact title match
        if (title === searchQuery) score += 50;
        // Starts with query
        if (title.startsWith(searchQuery)) score += 10;
      } else {
        score = 1;
      }

      return { ...update, score };
    })
    .filter((update) => {
      const categoryMatch = selectedCategory ? update.category === selectedCategory : true;
      const updateState = (update.state || '').toLowerCase();
      
      // Improved state match: 
      // 1. If no state is selected, show everything.
      // 2. If a state is selected, show updates for that state OR global updates ('all', 'all india', or empty).
      const stateMatch = selectedState 
        ? updateState === selectedState.toLowerCase() || 
          updateState === 'all' || 
          updateState === 'all india' || 
          updateState === '' ||
          updateState === 'pan india'
        : true;
        
      const searchMatch = searchQuery ? update.score > 0 : true;

      return categoryMatch && stateMatch && searchMatch;
    })
    .sort((a, b) => {
      if (searchQuery) {
        if (b.score !== a.score) return b.score - a.score;
      }
      return b.createdAt - a.createdAt;
    });

  const latestJobs = filteredUpdates.filter((u) => u.type === 'job');
  const admitCards = filteredUpdates.filter((u) => u.type === 'admit_card');
  const results = filteredUpdates.filter((u) => u.type === 'result');
  const scholarships = filteredUpdates.filter((u) => u.type === 'scholarship');
  const featuredUpdates = filteredUpdates.filter((u) => u.featured);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Header />
      <CategoryTray selectedCategory={selectedCategory} onSelectCategory={handleCategorySelect} />
      
      <main className="pb-20">
        <StateSelector selectedState={selectedState} onSelectState={handleStateSelect} />
        
        {loading ? (
          <div className="max-w-7xl mx-auto px-4 py-8">
            {selectedCategory ? (
              <>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-slate-200 rounded-2xl animate-pulse"></div>
                    <div className="space-y-2">
                      <div className="h-8 w-48 bg-slate-200 rounded animate-pulse"></div>
                      <div className="h-4 w-32 bg-slate-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                  <div className="h-10 w-32 bg-slate-200 rounded-xl animate-pulse"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <UpdateCardSkeleton key={i} />)}
                </div>
              </>
            ) : (
              <div className="space-y-12">
                {!searchQuery && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-10 h-10 bg-slate-200 rounded-lg animate-pulse"></div>
                      <div className="h-8 w-48 bg-slate-200 rounded animate-pulse"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-slate-200 rounded-2xl animate-pulse"></div>
                      ))}
                    </div>
                  </div>
                )}
                {[1, 2, 3].map(i => (
                  <div key={i} className="space-y-6">
                    <div className="flex justify-between items-center border-b-2 border-slate-200 pb-2">
                      <div className="h-8 w-48 bg-slate-200 rounded animate-pulse"></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[1, 2, 3].map(j => <UpdateCardSkeleton key={j} />)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${selectedCategory}-${selectedState}-${searchQuery}`}
                initial={{ opacity: 0, filter: 'blur(10px)', y: 10 }}
                animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                exit={{ opacity: 0, filter: 'blur(10px)', y: -10 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                {selectedCategory ? (
                  <section className="max-w-7xl mx-auto px-4 py-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                      <div className="flex items-center gap-4">
                        <div className="p-4 bg-academic-blue text-white rounded-2xl shadow-lg shadow-blue-100">
                          <LayoutDashboard size={28} />
                        </div>
                        <div>
                          <h2 className="text-3xl font-serif font-bold text-academic-blue">
                            <TranslatedText text={selectedCategory} /> {t('updatesFound')}
                          </h2>
                          <p className="text-slate-500 font-medium">{t('latestNotificationsFor').replace('{category}', selectedCategory)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 text-slate-500 text-sm font-bold shadow-sm self-start md:self-center">
                        <Filter size={16} />
                        <span>{filteredUpdates.length} {t('updatesFound')}</span>
                      </div>
                    </div>

                    {filteredUpdates.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredUpdates.map((update) => (
                          <UpdateCard key={update.id} update={update} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Search size={32} className="text-slate-300" />
                        </div>
                        <p className="text-slate-400 font-medium italic">{t('noUpdates')}</p>
                        <button 
                          onClick={() => setSelectedCategory(null)}
                          className="mt-4 text-academic-blue font-bold hover:underline"
                        >
                          {t('viewAll')}
                        </button>
                      </div>
                    )}
                  </section>
                ) : (
                  <>
                    {!searchQuery && (
                      <>
                        <div className="max-w-7xl mx-auto px-4 mb-8">
                          <motion.div 
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => navigate('/quiz')}
                            className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-2xl p-6 sm:p-8 text-white shadow-xl cursor-pointer relative overflow-hidden group"
                          >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:opacity-20 transition-opacity duration-500"></div>
                            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                              <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                                  <BrainCircuit className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                  <h3 className="text-2xl sm:text-3xl font-bold mb-2">
                                    <TranslatedText text="Test Your Knowledge" />
                                  </h3>
                                  <p className="text-purple-100 max-w-lg">
                                    <TranslatedText text="Take our interactive quizzes to prepare for your upcoming exams and assess your skills." />
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold shadow-md group-hover:shadow-lg transition-all shrink-0">
                                <TranslatedText text="Start Quiz" />
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                              </div>
                            </div>
                          </motion.div>
                        </div>
                        <FeaturedUpdates updates={featuredUpdates} />
                      </>
                    )}
                    <UpdateSection title={t('latestJobs')} type="job" updates={latestJobs} />
                    <UpdateSection title={t('admitCard')} type="admit_card" updates={admitCards} />
                    <UpdateSection title={t('results')} type="result" updates={results} />
                    <UpdateSection title={t('scholarships')} type="scholarship" updates={scholarships} />
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </main>

      <StatePromptModal 
        isOpen={showPrompt}
        stateName={pendingState || ''}
        onConfirm={saveStatePreference}
        onCancel={() => {
          setShowPrompt(false);
          setPendingState(null);
        }}
      />
    </div>
  );
}
