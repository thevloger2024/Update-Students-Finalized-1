import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Facebook, Twitter, Instagram, Youtube, Github, MessageCircle, Mail, User, Shield, Share2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

interface SocialLink {
  id: string;
  platform: string;
  displayName: string;
  url: string;
}

export const Footer: React.FC = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'social_links'), orderBy('platform', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const links = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as SocialLink[];
      setSocialLinks(links);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'social_links');
    });
    return () => unsubscribe();
  }, []);

  const getIcon = (platform: string) => {
    switch (platform) {
      case 'Facebook': return <Facebook size={20} />;
      case 'X (Twitter)': return <Twitter size={20} />;
      case 'Instagram': return <Instagram size={20} />;
      case 'YouTube': return <Youtube size={20} />;
      case 'GitHub': return <Github size={20} />;
      case 'WhatsApp': return <MessageCircle size={20} />;
      default: return <Share2 size={20} />;
    }
  };

  return (
    <footer className="bg-white border-t border-slate-200 pt-12 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 text-academic-blue">
              <GraduationCap size={32} strokeWidth={1.5} />
              <span className="font-serif text-2xl font-bold tracking-tight">
                Update Students
              </span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed">
              {t('aboutDesc')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-slate-800 mb-4">{t('quickLinks')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-slate-500 hover:text-academic-blue text-sm transition-colors">
                  {t('aboutUs')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-500 hover:text-academic-blue text-sm transition-colors">
                  {t('contactUs')}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-slate-500 hover:text-academic-blue text-sm transition-colors">
                  {t('privacyPolicy')}
                </Link>
              </li>
              <li>
                <Link to="/developer" className="text-slate-500 hover:text-academic-blue text-sm transition-colors">
                  {t('meetTheDeveloper')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-bold text-slate-800 mb-4">{t('categories')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/category/job" className="text-slate-500 hover:text-academic-blue text-sm transition-colors">
                  {t('latestJobs')}
                </Link>
              </li>
              <li>
                <Link to="/category/admit_card" className="text-slate-500 hover:text-academic-blue text-sm transition-colors">
                  {t('admitCard')}
                </Link>
              </li>
              <li>
                <Link to="/category/result" className="text-slate-500 hover:text-academic-blue text-sm transition-colors">
                  {t('results')}
                </Link>
              </li>
              <li>
                <Link to="/category/scholarship" className="text-slate-500 hover:text-academic-blue text-sm transition-colors">
                  {t('scholarships')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-bold text-slate-800 mb-4">{t('contactUs')}</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-slate-500 text-sm">
                <Mail size={18} className="text-academic-blue" />
                <span>support@updatestudents.com</span>
              </li>
              <li className="flex items-center gap-3 text-slate-500 text-sm">
                <MessageCircle size={18} className="text-academic-blue" />
                <span>WhatsApp Support</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-400 text-sm">
            {t('copyright').replace('{year}', currentYear.toString())} {t('allRightsReserved')}
          </p>
          
          <div className="flex flex-wrap items-center gap-4">
            {socialLinks.map((link) => (
              <a 
                key={link.id}
                href={link.url} 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 px-3 bg-slate-50 text-slate-500 hover:text-academic-blue hover:bg-blue-50 rounded-full transition-all group"
                title={link.platform}
              >
                {getIcon(link.platform)}
                <span className="text-xs font-bold hidden group-hover:block transition-all">
                  {link.displayName}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
