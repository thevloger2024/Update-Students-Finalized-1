import React, { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

export function SystemSettingsManager() {
  const { t } = useLanguage();
  const [settings, setSettings] = useState({
    siteName: 'Update Students',
    maintenanceMode: false,
    contactEmail: 'support@updatestudents.com',
    allowRegistration: true,
    telegramLink: 'https://t.me/updatestudents'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'site_settings', 'general');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings(docSnap.data() as any);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'site_settings', 'general'), settings);
      toast.success("Settings saved successfully");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-slate-500">Loading settings...</div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8"
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
          <Settings size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{t('systemSettings') || 'System Settings'}</h2>
          <p className="text-slate-500">{t('systemSettingsDesc') || 'Configure basic application settings.'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Site Name</label>
            <input 
              type="text" 
              value={settings.siteName || ''}
              onChange={(e) => setSettings({...settings, siteName: e.target.value})}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-academic-blue outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Contact Email</label>
            <input 
              type="email" 
              value={settings.contactEmail || ''}
              onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-academic-blue outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Telegram Link</label>
            <input 
              type="url" 
              value={settings.telegramLink || ''}
              onChange={(e) => setSettings({...settings, telegramLink: e.target.value})}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-academic-blue outline-none transition-all"
              placeholder="https://t.me/yourchannel"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div>
              <p className="font-bold text-slate-800">Maintenance Mode</p>
              <p className="text-xs text-slate-500">Disable the site for public users</p>
            </div>
            <button 
              onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})}
              className={`w-12 h-6 rounded-full transition-colors relative ${settings.maintenanceMode ? 'bg-orange-500' : 'bg-slate-300'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.maintenanceMode ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div>
              <p className="font-bold text-slate-800">Allow Registration</p>
              <p className="text-xs text-slate-500">Allow new users to sign up</p>
            </div>
            <button 
              onClick={() => setSettings({...settings, allowRegistration: !settings.allowRegistration})}
              className={`w-12 h-6 rounded-full transition-colors relative ${settings.allowRegistration ? 'bg-green-500' : 'bg-slate-300'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.allowRegistration ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 bg-academic-blue text-white font-bold rounded-xl hover:bg-blue-800 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </motion.div>
  );
}
