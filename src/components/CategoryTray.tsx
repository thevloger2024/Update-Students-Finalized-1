import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../contexts/utils';
import { useLanguage } from '../contexts/LanguageContext';
import { TranslatedText } from './TranslatedText';
import { useNavigate } from 'react-router-dom';
import { BrainCircuit } from 'lucide-react';

const CATEGORIES = [
  "RRB", "SSC", "UPSC", "BPSC", "POLICE", "ARMY", "NAVI", "AGNEEVEER", "SSB", "NEET", "JEE"
];

interface CategoryTrayProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export function CategoryTray({ selectedCategory, onSelectCategory }: CategoryTrayProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="w-full bg-white border-b border-slate-200 sticky top-[100px] z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-2">
        <div className="flex overflow-x-auto py-3 gap-2 no-scrollbar scroll-smooth items-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/quiz')}
            className="relative whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-bold transition-all duration-300 bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md hover:shadow-lg flex items-center gap-1.5 shrink-0"
          >
            <BrainCircuit size={16} />
            <span className="relative z-10">Quiz</span>
          </motion.button>

          <div className="w-px h-6 bg-slate-200 mx-1 shrink-0"></div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectCategory(null)}
            className={cn(
              "relative whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-300",
              selectedCategory === null 
                ? "text-white" 
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            {selectedCategory === null && (
              <motion.div
                layoutId="category-background"
                className="absolute inset-0 bg-academic-blue rounded-full shadow-md shadow-blue-200"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{t('allUpdates')}</span>
          </motion.button>
          
          {CATEGORIES.map((cat) => (
            <motion.button
              key={cat}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectCategory(cat)}
              className={cn(
                "relative whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-300",
                selectedCategory === cat 
                  ? "text-white" 
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {selectedCategory === cat && (
                <motion.div
                  layoutId="category-background"
                  className="absolute inset-0 bg-academic-blue rounded-full shadow-md shadow-blue-200"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10"><TranslatedText text={cat} /></span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
