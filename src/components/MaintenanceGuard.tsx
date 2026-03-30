import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { MaintenancePage } from '../pages/MaintenancePage';
import { useLocation } from 'react-router-dom';

const ADMIN_EMAIL = "thevloger2024@gmail.com";

export function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [maintenanceMode, setMaintenanceMode] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for maintenance mode changes
    const unsubscribeSettings = onSnapshot(doc(db, 'site_settings', 'general'), (docSnap) => {
      if (docSnap.exists()) {
        setMaintenanceMode(docSnap.data().maintenanceMode === true);
      } else {
        setMaintenanceMode(false);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching maintenance mode:", error);
      setMaintenanceMode(false);
      setLoading(false);
    });

    // Listen for auth changes to check if user is admin
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setIsAdmin(user?.email === ADMIN_EMAIL);
    });

    return () => {
      unsubscribeSettings();
      unsubscribeAuth();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-academic-blue"></div>
      </div>
    );
  }

  const isAdminPath = location.pathname.startsWith('/admin');

  // If maintenance mode is ON and user is NOT admin and NOT on an admin path, show maintenance page
  if (maintenanceMode && !isAdmin && !isAdminPath) {
    return <MaintenancePage />;
  }

  return <>{children}</>;
}
