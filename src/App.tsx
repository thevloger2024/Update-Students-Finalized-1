/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { lazy, Suspense } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter as Router, useLocation, useRoutes } from 'react-router-dom';
import { BookmarkProvider } from './contexts/BookmarkContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';

import { Toaster } from 'sonner';
import { ScrollToTop } from './components/ScrollToTop';
import { MobileBottomNav } from './components/MobileBottomNav';
import { TelegramBanner } from './components/TelegramBanner';
import { PageTransition } from './components/PageTransition';
import { AnimatePresence } from 'framer-motion';
import { Footer } from './components/Footer';

const Home = lazy(() => import('./pages/Home').then(module => ({ default: module.Home })));
const CategoryPage = lazy(() => import('./pages/CategoryPage').then(module => ({ default: module.CategoryPage })));
const DetailPage = lazy(() => import('./pages/DetailPage').then(module => ({ default: module.DetailPage })));
const SavedPage = lazy(() => import('./pages/SavedPage').then(module => ({ default: module.SavedPage })));
const NotificationSettingsPage = lazy(() => import('./pages/NotificationSettingsPage').then(module => ({ default: module.NotificationSettingsPage })));
const AdminPage = lazy(() => import('./pages/AdminPage').then(module => ({ default: module.AdminPage })));
const AdminFeaturesPage = lazy(() => import('./pages/AdminFeaturesPage').then(module => ({ default: module.AdminFeaturesPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(module => ({ default: module.AboutPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then(module => ({ default: module.ContactPage })));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then(module => ({ default: module.PrivacyPage })));
const DeveloperPage = lazy(() => import('./pages/DeveloperPage').then(module => ({ default: module.DeveloperPage })));
const Tools = lazy(() => import('./pages/Tools').then(module => ({ default: module.default })));
const QuizPage = lazy(() => import('./pages/QuizPage').then(module => ({ default: module.QuizPage })));
const QuizResultPage = lazy(() => import('./pages/QuizResultPage').then(module => ({ default: module.QuizResultPage })));
const QuizHistoryPage = lazy(() => import('./pages/QuizHistoryPage').then(module => ({ default: module.default })));
const ExamCalendar = lazy(() => import('./pages/ExamCalendar').then(module => ({ default: module.ExamCalendar })));
const TipsPage = lazy(() => import('./pages/TipsPage').then(module => ({ default: module.TipsPage })));
const TipDetailPage = lazy(() => import('./pages/TipDetailPage').then(module => ({ default: module.TipDetailPage })));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-academic-blue"></div>
  </div>
);

function AnimatedRoutes() {
  const location = useLocation();
  const element = useRoutes([
    { path: "/", element: <PageTransition><Home /></PageTransition> },
    { path: "/category/:type", element: <PageTransition><CategoryPage /></PageTransition> },
    { path: "/update/:id", element: <PageTransition><DetailPage /></PageTransition> },
    { path: "/exam-calendar", element: <PageTransition><ExamCalendar /></PageTransition> },
    { path: "/tips", element: <PageTransition><TipsPage /></PageTransition> },
    { path: "/tips/:id", element: <PageTransition><TipDetailPage /></PageTransition> },
    { path: "/saved", element: <PageTransition><SavedPage /></PageTransition> },
    { path: "/notifications", element: <PageTransition><NotificationSettingsPage /></PageTransition> },
    { path: "/admin", element: <PageTransition><AdminPage /></PageTransition> },
    { path: "/admin/features", element: <PageTransition><AdminFeaturesPage /></PageTransition> },
    { path: "/about", element: <PageTransition><AboutPage /></PageTransition> },
    { path: "/contact", element: <PageTransition><ContactPage /></PageTransition> },
    { path: "/privacy", element: <PageTransition><PrivacyPage /></PageTransition> },
    { path: "/developer", element: <PageTransition><DeveloperPage /></PageTransition> },
    { path: "/tools", element: <PageTransition><Tools /></PageTransition> },
    { path: "/quiz", element: <PageTransition><QuizPage /></PageTransition> },
    { path: "/quiz/result", element: <PageTransition><QuizResultPage /></PageTransition> },
    { path: "/quiz/history", element: <PageTransition><QuizHistoryPage /></PageTransition> },
  ]);

  if (!element) return null;

  return (
    <AnimatePresence mode="wait">
      {React.cloneElement(element as React.ReactElement, { key: location.pathname })}
    </AnimatePresence>
  );
}

import { OfflineBanner } from './components/OfflineBanner';
import { MaintenanceGuard } from './components/MaintenanceGuard';

export default function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <LanguageProvider>
          <BookmarkProvider>
            <Toaster position="top-center" richColors />
            <Router>
              <Suspense fallback={<LoadingFallback />}>
                <MaintenanceGuard>
                  <AnimatedRoutes />
                  <Footer />
                  <TelegramBanner />
                  <MobileBottomNav />
                  <ScrollToTop />
                </MaintenanceGuard>
              </Suspense>
            </Router>
          </BookmarkProvider>
        </LanguageProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

