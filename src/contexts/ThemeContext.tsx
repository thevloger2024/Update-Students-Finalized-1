import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

export type UITheme = 'bright' | 'dark3d' | 'animation' | 'smoothBlurry';

interface ThemeContextType {
  theme: UITheme;
  setThemeGlobal: (theme: UITheme) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<UITheme>('bright');

  useEffect(() => {
    // Listen to global theme from Firestore
    const unsub = onSnapshot(doc(db, 'site_settings', 'ui_config'), (docSnap) => {
      if (docSnap.exists() && docSnap.data().theme) {
        setTheme(docSnap.data().theme as UITheme);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    // Remove all theme classes
    root.classList.remove('theme-bright', 'theme-dark3d', 'theme-animation', 'theme-smoothBlurry', 'dark');
    
    // Add current theme class
    root.classList.add(`theme-${theme}`);
    
    if (theme === 'dark3d') {
      root.classList.add('dark');
    }
  }, [theme]);

  const setThemeGlobal = async (newTheme: UITheme) => {
    try {
      await setDoc(doc(db, 'site_settings', 'ui_config'), { theme: newTheme }, { merge: true });
    } catch (e) {
      console.error('Failed to update theme globally', e);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setThemeGlobal }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
