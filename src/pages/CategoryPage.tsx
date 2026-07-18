import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { CategoryTray } from '../components/CategoryTray';
import { StateSelector } from '../components/StateSelector';
import { UpdateCard, UpdateData } from '../components/UpdateCard';
import { UpdateCardSkeleton } from '../components/UpdateCardSkeleton';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { ArrowLeft, Briefcase, FileText, CheckCircle, Star } from 'lucide-react';
import { cn } from '../contexts/utils';
import { motion } from 'framer-motion';

import { useLanguage } from '../contexts/LanguageContext';
import { TranslatedText } from '../components/TranslatedText';

export function CategoryPage() {
  const { type } = useParams<{ type: 'job' | 'admit_card' | 'result' | 'scholarship' | 'updates' }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [updates, setUpdates] = useState<UpdateData[]>([]);
  const [loading, setLoading] = useState(true);

  const titleMap = {
    job: t('latestJobs'),
    admit_card: t('admitCard'),
    result: t('results'),
    scholarship: t('scholarships'),
    updates: t('latestUpdates') || 'Latest Updates'
  };

  const types = [
    { id: 'job', label: t('jobs'), icon: Briefcase },
    { id: 'admit_card', label: t('admitCard'), icon: FileText },
    { id: 'result', label: t('results'), icon: CheckCircle },
    { id: 'scholarship', label: t('scholarships'), icon: Star },
  ];

  useEffect(() => {
    if (!type) return;
    setLoading(true);

    const q = query(
      collection(db, 'updates'),
      where('type', '==', type),
      orderBy('createdAt', 'desc')
    );
    
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
  }, [type]);

  const filteredUpdates = updates.filter((update) => {
    const categoryMatch = selectedCategory ? update.category === selectedCategory : true;
    const stateMatch = selectedState ? update.state === selectedState || update.state === 'All India' : true;
    return categoryMatch && stateMatch;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Header />
      <CategoryTray selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
      
      <main className="pb-20">
        <StateSelector selectedState={selectedState} onSelectState={setSelectedState} />
        
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-slate-500 hover:text-academic-blue transition-colors">
                <ArrowLeft size={24} />
              </Link>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-academic-blue">
                {titleMap[type || 'job']}
              </h1>
            </div>

            <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
              {types.map((t) => {
                const Icon = t.icon;
                const isActive = type === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => navigate(`/category/${t.id}`)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
                      isActive 
                        ? "bg-academic-blue text-white shadow-md" 
                        : "text-slate-500 hover:bg-slate-50 hover:text-academic-blue"
                    )}
                  >
                    <Icon size={16} />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <UpdateCardSkeleton key={i} />)}
            </div>
          ) : filteredUpdates.length > 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              {filteredUpdates.map((update) => (
                <UpdateCard key={update.id} update={update} />
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-slate-200 border-dashed">
              <p className="text-slate-500">{t('noUpdatesFound')}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
