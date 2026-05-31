import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Hammer, Clock, Mail } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useSiteSettings } from '../hooks/useSiteSettings';

export function MaintenancePage() {
  const { t } = useLanguage();
  const { settings } = useSiteSettings();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-slate-200 max-w-2xl w-full text-center relative overflow-hidden"
      >
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 -mr-16 -mt-16 rounded-full opacity-50" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-50 -ml-12 -mb-12 rounded-full opacity-50" />

        <div className="relative z-10">
          <div className="w-24 h-24 bg-orange-100 text-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-8 rotate-3 shadow-lg shadow-orange-100/50">
            <Hammer size={48} />
          </div>

          <h1 className="text-4xl md:text-5xl font-serif font-bold text-academic-blue mb-4 tracking-tight">
            {t('siteUnderMaintenance')}
          </h1>
          
          <p className="text-slate-600 text-lg mb-10 leading-relaxed max-w-md mx-auto">
            {t('maintenanceDesc')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-academic-blue shadow-sm">
                <Clock size={24} />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('estimatedTime')}</p>
                <p className="text-slate-700 font-semibold">~ 2 Hours</p>
              </div>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-academic-blue shadow-sm">
                <Mail size={24} />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Support</p>
                <a href={`mailto:${settings.contactEmail}`} className="text-slate-700 font-semibold hover:text-academic-blue transition-colors">
                  {settings.contactEmail}
                </a>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100">
            <div className="flex items-center justify-center gap-2 text-slate-400 text-sm font-medium">
              <Settings size={16} className="animate-spin-slow" />
              <span>{t('backSoon')}</span>
            </div>
          </div>
        </div>
      </motion.div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}} />
    </div>
  );
}
