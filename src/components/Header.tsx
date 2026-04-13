import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, LogIn, LogOut, User, Search, X, Bookmark, MessageSquarePlus, Bell, Shield, Settings, Languages, ChevronDown, Wrench, History } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { auth, signInWithGoogle, logOut } from '../firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { FeedbackModal } from './FeedbackModal';
import { useLanguage, Language } from '../contexts/LanguageContext';
import { TranslatedText } from './TranslatedText';
import { cn } from '../contexts/utils';
import { toast } from 'sonner';

const ADMIN_EMAIL = "thevloger2024@gmail.com";

const TYPING_WORDS = [
  "RRB", "SSC", "UPSC", "BPSC", "QUIZ", "LATEST JOBS", 
  "LATEST NEWS", "SCHOLARSHIPS", "ADMIT CARD", "RESULT NEET", "JEE"
];

export function Header() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const languages: { code: Language; name: string; native: string }[] = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { code: 'bn', name: 'Bengali', native: 'বাংলা' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు' },
    { code: 'mr', name: 'Marathi', native: 'मराठी' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
    { code: 'ur', name: 'Urdu', native: 'اردو' },
    { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
    { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'ml', name: 'Malayalam', native: 'മലയാളం' },
    { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ' },
    { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
    { code: 'as', name: 'Assamese', native: 'অসমীয়া' },
    { code: 'mai', name: 'Maithili', native: 'मैथिली' },
    { code: 'ks', name: 'Kashmiri', native: 'کٲشُر' },
    { code: 'ne', name: 'Nepali', native: 'नेपाली' },
    { code: 'kok', name: 'Konkani', native: 'कोंकणी' },
    { code: 'sd', name: 'Sindhi', native: 'سنڌي' },
    { code: 'doi', name: 'Dogri', native: 'डोगरी' },
    { code: 'mni', name: 'Manipuri', native: 'মণিপুরী' },
    { code: 'brx', name: 'Bodo', native: 'बड़ो' },
    { code: 'sa', name: 'Sanskrit', native: 'संस्कृतम्' },
    { code: 'sat', name: 'Santali', native: 'ᱥᱟᱱᱛᱟᱲᱤ' },
  ];

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q) {
      setSearchQuery(q);
    } else {
      setSearchQuery('');
    }
  }, [location.search]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setDisplayText('');
    setIsDeleting(false);
  }, [language]);

  useEffect(() => {
    const getTranslatedWord = (word: string) => {
      switch (word) {
        case "LATEST JOBS": return t('latestJobs').toUpperCase();
        case "SCHOLARSHIPS": return t('scholarships').toUpperCase();
        case "ADMIT CARD": return t('admitCard').toUpperCase();
        case "QUIZ": return (t('quiz') || "QUIZ").toUpperCase();
        case "LATEST NEWS": return (t('latestNews') || "LATEST NEWS").toUpperCase();
        default: return word;
      }
    };

    const currentWord = getTranslatedWord(TYPING_WORDS[currentWordIndex]);
    
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (displayText.length < currentWord.length) {
          setDisplayText(currentWord.slice(0, displayText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), 1500); // Pause before deleting
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(currentWord.slice(0, displayText.length - 1));
        } else {
          setIsDeleting(false);
          setCurrentWordIndex((prev) => (prev + 1) % TYPING_WORDS.length);
        }
      }
    }, isDeleting ? 50 : 100); // Typing speed vs deleting speed

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentWordIndex, language, t]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/');
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    navigate('/');
  };

  return (
    <header className="w-full bg-white shadow-sm pt-4 pb-2 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
          <Link to="/" className="flex items-center gap-2 text-academic-blue shrink-0">
            <GraduationCap size={32} strokeWidth={1.5} />
            <span className="font-serif text-2xl md:text-3xl font-bold tracking-tight">
              Update Students
            </span>
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-xl relative">
            <div className="relative group flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-100 border-none rounded-full py-2 pl-10 pr-10 text-sm focus:ring-2 focus:ring-academic-blue transition-all"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-academic-blue transition-colors" size={18} />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              {/* Language Selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                  className="flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-all btn-hover-effect"
                  title={t('changeLanguage')}
                >
                  <Languages size={18} />
                  <span className="text-xs font-bold uppercase hidden sm:inline">{language}</span>
                  <ChevronDown size={14} className={cn("transition-transform duration-200", isLangMenuOpen && "rotate-180")} />
                </button>

                <AnimatePresence>
                  {isLangMenuOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsLangMenuOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 max-h-80 overflow-y-auto"
                      >
                        <div className="px-4 py-2 border-b border-slate-50 mb-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('selectLanguage')}</p>
                        </div>
                        {languages.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => {
                              setLanguage(lang.code);
                              setIsLangMenuOpen(false);
                            }}
                            className={cn(
                              "w-full px-4 py-2 text-left text-sm flex items-center justify-between hover:bg-slate-50 transition-colors",
                              language === lang.code ? "text-academic-blue font-bold bg-blue-50/50" : "text-slate-600"
                            )}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">{lang.native}</span>
                              <span className="text-[10px] opacity-60">{lang.name}</span>
                            </div>
                            {language === lang.code && <div className="w-1.5 h-1.5 rounded-full bg-academic-blue" />}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </form>
          
          <div className="flex items-center gap-4 shrink-0">
            <Link 
              to="/tools" 
              className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-academic-blue transition-colors btn-hover-effect px-2 py-1 rounded-lg"
              title={t('tools')}
            >
              <Wrench size={18} />
              <span className="hidden sm:inline">{t('tools')}</span>
            </Link>
            <button 
              onClick={() => setIsFeedbackOpen(true)}
              className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-academic-blue transition-colors btn-hover-effect px-2 py-1 rounded-lg"
              title={t('feedback')}
            >
              <MessageSquarePlus size={18} />
              <span className="hidden sm:inline">{t('feedback')}</span>
            </button>
            {user && (
              <Link 
                to="/notifications" 
                className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-academic-blue transition-colors btn-hover-effect px-2 py-1 rounded-lg"
                title={t('alerts')}
              >
                <Bell size={18} />
                <span className="hidden sm:inline">{t('alerts')}</span>
              </Link>
            )}
            {user && user.email === ADMIN_EMAIL && (
              <div className="flex items-center gap-2">
                <Link 
                  to="/admin" 
                  className="flex items-center gap-1.5 text-sm font-medium text-academic-blue hover:text-blue-800 transition-colors btn-hover-effect px-2 py-1 rounded-lg"
                  title={t('admin')}
                >
                  <Shield size={18} />
                  <span className="hidden sm:inline">{t('admin')}</span>
                </Link>
                <Link 
                  to="/admin/features" 
                  className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-academic-blue transition-colors btn-hover-effect px-2 py-1 rounded-lg"
                  title={t('features')}
                >
                  <Settings size={18} />
                  <span className="hidden sm:inline">{t('features')}</span>
                </Link>
              </div>
            )}
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 text-sm text-slate-600 hover:bg-slate-100 p-1.5 rounded-full transition-colors"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={t('profile')} className="w-8 h-8 rounded-full border border-slate-200 shadow-sm" referrerPolicy="no-referrer" loading="lazy" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                      <User size={20} />
                    </div>
                  )}
                  <span className="font-medium hidden lg:block">{user.displayName}</span>
                  <ChevronDown size={14} className={cn("transition-transform duration-200 hidden lg:block", isProfileMenuOpen && "rotate-180")} />
                </button>

                <AnimatePresence>
                  {isProfileMenuOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsProfileMenuOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-slate-100 mb-1">
                          <p className="text-sm font-bold text-slate-800 truncate">{user.displayName}</p>
                          <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        </div>
                        
                        <Link 
                          to="/tools" 
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="w-full px-4 py-2 text-left text-sm flex items-center gap-3 text-slate-600 hover:bg-slate-50 hover:text-academic-blue transition-colors"
                        >
                          <Wrench size={16} />
                          <span className="font-medium">{t('tools')}</span>
                        </Link>
                        
                        <Link 
                          to="/saved" 
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="w-full px-4 py-2 text-left text-sm flex items-center gap-3 text-slate-600 hover:bg-slate-50 hover:text-academic-blue transition-colors"
                        >
                          <Bookmark size={16} />
                          <span className="font-medium">{t('saved')}</span>
                        </Link>
                        
                        <Link 
                          to="/quiz/history" 
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="w-full px-4 py-2 text-left text-sm flex items-center gap-3 text-slate-600 hover:bg-slate-50 hover:text-academic-blue transition-colors"
                        >
                          <History size={16} />
                          <span className="font-medium">{t('quizHistory')}</span>
                        </Link>
                        
                        <div className="h-px bg-slate-100 my-1"></div>
                        
                        <button 
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            logOut();
                          }}
                          className="w-full px-4 py-2 text-left text-sm flex items-center gap-3 text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={16} />
                          <span className="font-medium">{t('logout')}</span>
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button 
                disabled={isLoggingIn}
                onClick={async () => {
                  if (isLoggingIn) return;
                  setIsLoggingIn(true);
                  const toastId = toast.loading("Connecting to Google...");
                  console.log("Login process started...");
                  
                  try {
                    await signInWithGoogle();
                    toast.dismiss(toastId);
                    toast.success("Successfully signed in!");
                  } catch (error: any) {
                    toast.dismiss(toastId);
                    console.error("Login Error Details:", error);
                    
                    if (error.code === 'auth/unauthorized-domain') {
                      toast.error("This domain is not authorized. Please add 'updatestudents-in.web.app' in Firebase Console > Auth > Settings > Authorized Domains.");
                    } else if (error.code === 'auth/popup-blocked') {
                      toast.error("Popup blocked! Please allow popups for this site in your browser settings.");
                    } else if (error.message) {
                      toast.error(`Login failed: ${error.message}`);
                    } else {
                      toast.error("Failed to sign in. Please try again.");
                    }
                  } finally {
                    setIsLoggingIn(false);
                  }
                }}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium text-white bg-academic-blue px-4 py-2 rounded-full hover:bg-blue-800 transition-all shadow-md btn-hover-effect",
                  isLoggingIn && "opacity-70 cursor-not-allowed"
                )}
              >
                <LogIn size={16} className={cn(isLoggingIn && "animate-pulse")} />
                <span>{isLoggingIn ? "Logging in..." : t('login')}</span>
              </button>
            )}
          </div>
        </div>
        
        <hr className="border-t-2 border-academic-blue/20 w-full" />
        
        <div className="h-6 mt-2 flex items-center justify-center">
          <motion.span 
            className="text-sm md:text-base font-medium text-slate-400 tracking-wider uppercase"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            {displayText}
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="inline-block w-[2px] h-4 bg-slate-400 ml-1 align-middle"
            />
          </motion.span>
        </div>
        
        <hr className="border-t-2 border-academic-blue/20 w-full mt-2" />
      </div>

      <FeedbackModal 
        isOpen={isFeedbackOpen} 
        onClose={() => setIsFeedbackOpen(false)} 
      />
    </header>
  );
}

