import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export interface SiteSettings {
  siteName: string;
  maintenanceMode: boolean;
  contactEmail: string;
  allowRegistration: boolean;
  telegramLink?: string;
}

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'Update Students',
  maintenanceMode: false,
  contactEmail: 'support@updatestudents.com',
  allowRegistration: true,
  telegramLink: 'https://t.me/updatestudents'
};

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'site_settings', 'general'),
      (docSnap) => {
        if (docSnap.exists()) {
          setSettings({
            ...DEFAULT_SETTINGS,
            ...docSnap.data()
          });
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error loading site settings:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { settings, loading };
}
