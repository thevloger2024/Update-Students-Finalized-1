import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Check, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { TranslatedText } from './TranslatedText';

interface StatePromptModalProps {
  isOpen: boolean;
  stateName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const StatePromptModal: React.FC<StatePromptModalProps> = ({ isOpen, stateName, onConfirm, onCancel }) => {
  const { t } = useLanguage();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
          >
            <div className="p-6 bg-academic-blue text-white text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin size={32} />
              </div>
              <h2 className="text-xl font-bold font-serif mb-2">{t('savePreference')}</h2>
              <p className="text-blue-100 text-sm">
                {t('savePreferenceDesc').split('{state}')[0]}
                <span className="font-bold text-white">
                  <TranslatedText text={stateName} />
                </span>
                {t('savePreferenceDesc').split('{state}')[1]}
              </p>
            </div>

            <div className="p-6 grid grid-cols-2 gap-4">
              <button
                onClick={onCancel}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-slate-100 text-slate-600 font-bold hover:bg-slate-50 transition-all active:scale-95"
              >
                <X size={18} />
                <span>{t('no')}</span>
              </button>
              <button
                onClick={onConfirm}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-academic-blue text-white font-bold shadow-lg shadow-blue-100 hover:bg-blue-800 transition-all active:scale-95"
              >
                <Check size={18} />
                <span>{t('yes')}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
