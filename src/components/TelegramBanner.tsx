import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useSiteSettings } from '../hooks/useSiteSettings';

export function TelegramBanner() {
  const { t } = useLanguage();
  const { settings } = useSiteSettings();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if dismissed in this session
    const hasSeen = sessionStorage.getItem('telegram_banner_seen');
    if (!hasSeen) {
      // Small delay so it pops up after initial render
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('telegram_banner_seen', 'true');
  };

  const handleJoin = () => {
    const link = settings.telegramLink || 'https://t.me/updatestudents';
    window.open(link, '_blank');
    handleDismiss();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-[72px] md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-2xl z-40 p-4 border border-blue-400 overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>

          <div className="relative flex items-start gap-4">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
              <Send size={20} className="text-white -ml-1 mt-1" />
            </div>
            
            <div className="flex-1 pr-6">
              <h3 className="font-bold text-sm md:text-base">📢 Telegram Join Karo!</h3>
              <p className="text-xs md:text-sm text-blue-100 mt-1 mb-3">
                Instant Job Alerts Pao. Sabse tez updates seedha aapke phone pe.
              </p>
              
              <button
                onClick={handleJoin}
                className="bg-white text-blue-600 px-4 py-1.5 rounded-lg text-sm font-bold shadow hover:bg-blue-50 transition-colors"
              >
                Join Now
              </button>
            </div>
            
            <button
              onClick={handleDismiss}
              className="absolute -top-2 -right-2 p-2 text-blue-200 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
