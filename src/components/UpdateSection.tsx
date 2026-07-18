import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UpdateCard, UpdateData } from './UpdateCard';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { TranslatedText } from './TranslatedText';

interface UpdateSectionProps {
  title: string;
  type: 'job' | 'admit_card' | 'result' | 'scholarship' | 'updates';
  updates: UpdateData[];
}

export function UpdateSection({ title, type, updates }: UpdateSectionProps) {
  const { t } = useLanguage();
  const displayUpdates = updates.slice(0, 20);

  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 border-b-2 border-academic-blue pb-2">
        <TranslatedText 
          text={title} 
          as="h2" 
          className="text-2xl md:text-3xl font-serif font-bold text-academic-blue" 
        />
        {updates.length > 20 && (
          <Link
            to={`/category/${type}`}
            className="flex items-center gap-1 text-sm font-semibold text-academic-gold hover:text-yellow-600 transition-colors"
          >
            {t('readMore')} <ArrowRight size={16} />
          </Link>
        )}
      </div>

      {displayUpdates.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayUpdates.map((update) => (
            <UpdateCard key={update.id} update={update} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200 border-dashed">
          <p className="text-slate-500">{t('noUpdates')}</p>
        </div>
      )}

      {updates.length > 20 && (
        <div className="mt-8 text-center">
          <Link
            to={`/category/${type}`}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-academic-blue hover:bg-blue-800 shadow-sm transition-all btn-hover-effect"
          >
            {t('viewAll')} <TranslatedText text={title} />
          </Link>
        </div>
      )}
    </section>
  );
}
