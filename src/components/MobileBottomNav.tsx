import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Briefcase, FileCheck, Award, Bookmark } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../contexts/utils';

export function MobileBottomNav() {
  const { t } = useLanguage();
  const location = useLocation();

  const isHome = location.pathname === '/';
  
  // Custom active logic since categories are query params on Home
  const checkActive = (category: string) => {
    if (!isHome) return false;
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('category') === category;
  };

  const navItems = [
    { 
      path: '/', 
      icon: Home, 
      label: t('home'),
      isActive: isHome && !new URLSearchParams(location.search).get('category')
    },
    { 
      path: '/?category=job', 
      icon: Briefcase, 
      label: t('jobs'),
      isActive: checkActive('job')
    },
    { 
      path: '/?category=admit_card', 
      icon: FileCheck, 
      label: t('admit_cards_tab') || 'Admit Cards',
      isActive: checkActive('admit_card')
    },
    { 
      path: '/?category=result', 
      icon: Award, 
      label: t('results_tab') || 'Results',
      isActive: checkActive('result')
    },
    { 
      path: '/saved', 
      icon: Bookmark, 
      label: t('saved'),
      isActive: location.pathname === '/saved'
    }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 pb-safe">
      <nav className="flex items-center justify-around h-16">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={index}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                item.isActive ? "text-academic-blue" : "text-slate-500 hover:text-slate-900"
              )}
            >
              <Icon size={20} className={item.isActive ? "fill-current/20" : ""} />
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
