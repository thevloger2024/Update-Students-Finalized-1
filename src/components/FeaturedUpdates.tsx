import React from 'react';
import { motion } from 'framer-motion';
import { Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { UpdateData } from './UpdateCard';
import { cn, formatDate } from '../contexts/utils';
import { useLanguage } from '../contexts/LanguageContext';
import { TranslatedText } from './TranslatedText';

interface FeaturedUpdatesProps {
  updates: UpdateData[];
}

export const FeaturedUpdates: React.FC<FeaturedUpdatesProps> = ({ updates }) => {
  const { t } = useLanguage();
  if (updates.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-academic-gold/10 rounded-lg">
            <Star className="text-academic-gold" size={24} fill="currentColor" />
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-academic-blue">
            {t('featuredUpdates')}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {updates.map((update, index) => (
          <motion.div
            key={update.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="group relative bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
          >
            {/* Featured Badge */}
            <div className="absolute top-4 left-4 z-10">
              <span className="bg-academic-gold text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                <Star size={10} fill="currentColor" />
                {t('featured')}
              </span>
            </div>

            <div className="p-6 flex-1 flex flex-col">
              <div className="mb-4">
                <span className={cn(
                  "text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest",
                  update.type === 'job' ? "bg-blue-50 text-blue-600" :
                  update.type === 'admit_card' ? "bg-yellow-50 text-academic-gold" :
                  "bg-green-50 text-green-600"
                )}>
                  {t(update.type)}
                </span>
              </div>

              <TranslatedText 
                text={update.title} 
                as="h3" 
                className="text-xl font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-academic-blue transition-colors" 
              />
              
              <div className="text-sm text-slate-500 mb-4 line-clamp-2 flex gap-1">
                <TranslatedText text={update.organization} /> • <TranslatedText text={update.state} />
              </div>

              <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="text-xs font-medium text-slate-400">
                  {formatDate(update.createdAt)}
                </div>
                <Link 
                  to={`/update/${update.id}`}
                  className="flex items-center gap-1 text-academic-blue font-bold text-sm group/link"
                >
                  {t('viewDetails')}
                  <ArrowRight size={16} className="transition-transform group-hover/link:translate-x-1" />
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
