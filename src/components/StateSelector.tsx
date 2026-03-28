import React, { useState } from 'react';
import { ChevronDown, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { TranslatedText } from './TranslatedText';

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

interface StateSelectorProps {
  selectedState: string | null;
  onSelectState: (state: string | null) => void;
}

export function StateSelector({ selectedState, onSelectState }: StateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-4">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between bg-academic-blue text-white px-4 py-3 rounded-lg shadow-md hover:bg-blue-800 transition-all btn-hover-effect"
        >
          <div className="flex items-center gap-2 text-left">
            <MapPin size={20} className="shrink-0" />
            <span className="font-semibold text-base md:text-lg">
              {selectedState ? (
                <span className="flex items-center gap-1">
                  {t('stateLabel')}: <TranslatedText text={selectedState} />
                </span>
              ) : t('selectState')}
            </span>
          </div>
          <ChevronDown size={20} className={`transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-slate-200 z-50 max-h-80 overflow-y-auto"
            >
              <div className="p-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1">
                <button
                  onClick={() => {
                    onSelectState(null);
                    setIsOpen(false);
                  }}
                  className={`text-left px-4 py-2 rounded-md transition-all btn-hover-effect ${
                    selectedState === null ? 'bg-academic-blue/10 text-academic-blue font-semibold' : 'hover:bg-slate-100'
                  }`}
                >
                  {t('allIndia')}
                </button>
                {STATES.map((state) => (
                  <button
                    key={state}
                    onClick={() => {
                      onSelectState(state);
                      setIsOpen(false);
                    }}
                    className={`text-left px-4 py-2 rounded-md transition-all btn-hover-effect ${
                      selectedState === state ? 'bg-academic-blue/10 text-academic-blue font-semibold' : 'hover:bg-slate-100'
                    }`}
                  >
                    <TranslatedText text={state} />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <p className="text-center text-xs md:text-sm text-slate-500 mt-2 italic">
        {t('stateSelectionNotice')}
      </p>
    </div>
  );
}
