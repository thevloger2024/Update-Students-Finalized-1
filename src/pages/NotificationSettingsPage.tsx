import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Bell, Briefcase, FileText, CheckCircle, Save, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { TranslatedText } from '../components/TranslatedText';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../contexts/utils';

interface NotificationSettings {
  globalEnabled: boolean;
  jobsEnabled: boolean;
  admitCardsEnabled: boolean;
  resultsEnabled: boolean;
  updatedAt: number;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  globalEnabled: true,
  jobsEnabled: true,
  admitCardsEnabled: true,
  resultsEnabled: true,
  updatedAt: Date.now(),
};

export function NotificationSettingsPage() {
  const { t } = useLanguage();
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
        navigate('/');
        toast.error(t('loginToAccessSettings'));
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!userId) return;

    const settingsRef = doc(db, `users/${userId}/notificationSettings`, 'preferences');
    
    const unsubscribe = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data() as NotificationSettings);
      } else {
        // Initialize with defaults if not exists
        setSettings(DEFAULT_SETTINGS);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching notification settings:", error);
      toast.error(t('failedLoadSettings'));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const handleToggle = (key: keyof NotificationSettings) => {
    if (typeof settings[key] === 'boolean') {
      setSettings(prev => ({
        ...prev,
        [key]: !prev[key]
      }));
    }
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);

    try {
      const settingsRef = doc(db, `users/${userId}/notificationSettings`, 'preferences');
      await setDoc(settingsRef, {
        ...settings,
        updatedAt: Date.now()
      });
      toast.success(t('preferencesSaved'));
    } catch (error) {
      console.error("Error saving notification settings:", error);
      toast.error(t('failedSavePreferences'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="flex justify-center items-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-academic-blue"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Header />
      
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 hover:bg-white rounded-full transition-colors text-slate-500">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-serif font-bold text-academic-blue">{t('notificationSettings')}</h1>
        </div>

        <div className="space-y-6">
          {/* Global Toggle */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "p-3 rounded-xl transition-colors",
                  settings.globalEnabled ? "bg-blue-50 text-academic-blue" : "bg-slate-100 text-slate-400"
                )}>
                  <Bell size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{t('pushNotifications')}</h3>
                  <p className="text-sm text-slate-500">{t('pushNotificationsDesc')}</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('globalEnabled')}
                className={cn(
                  "relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none",
                  settings.globalEnabled ? "bg-academic-blue" : "bg-slate-300"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-5 w-5 transform rounded-full bg-white transition-transform",
                    settings.globalEnabled ? "translate-x-6" : "translate-x-1"
                  )}
                />
              </button>
            </div>
          </motion.div>

          {/* Type Specific Settings */}
          <AnimatePresence>
            {settings.globalEnabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 overflow-hidden"
              >
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 px-2">{t('notifyMeAbout')}</h2>
                
                <div className="grid gap-4">
                  {[
                    { id: 'jobsEnabled', label: t('latestJobs'), icon: Briefcase, color: 'text-blue-600 bg-blue-50' },
                    { id: 'admitCardsEnabled', label: t('admitCards'), icon: FileText, color: 'text-academic-gold bg-yellow-50' },
                    { id: 'resultsEnabled', label: t('results'), icon: CheckCircle, color: 'text-green-600 bg-green-50' },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isEnabled = settings[item.id as keyof NotificationSettings] as boolean;
                    return (
                      <div 
                        key={item.id}
                        className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn("p-2.5 rounded-xl", item.color)}>
                            <Icon size={20} />
                          </div>
                          <span className="font-semibold text-slate-700">{item.label}</span>
                        </div>
                        <button
                          onClick={() => handleToggle(item.id as keyof NotificationSettings)}
                          className={cn(
                            "relative inline-flex h-6 w-10 items-center rounded-full transition-colors focus:outline-none",
                            isEnabled ? "bg-academic-blue" : "bg-slate-300"
                          )}
                        >
                          <span
                            className={cn(
                              "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                              isEnabled ? "translate-x-5" : "translate-x-1"
                            )}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Privacy Note */}
          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex gap-3">
            <ShieldCheck className="text-academic-blue shrink-0" size={20} />
            <p className="text-xs text-slate-600 leading-relaxed">
              {t('privacyNote')}
            </p>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-academic-blue hover:bg-blue-800 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save size={20} />
                <span>{t('savePreferences')}</span>
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
