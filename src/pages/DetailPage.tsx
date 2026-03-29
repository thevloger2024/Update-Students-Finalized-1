import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { UpdateData, ApplicationFee, PostVacancy } from '../components/UpdateCard';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { ArrowLeft, Calendar, Building2, Users, MapPin, Bookmark, Share2, ImageIcon, CheckCircle, AlertCircle, HelpCircle, Languages, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBookmarkContext } from '../contexts/BookmarkContext';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'sonner';
import { useTranslationService } from '../hooks/useTranslationService';
import { cn, formatDate } from '../contexts/utils';
import { TranslatedText } from '../components/TranslatedText';

export function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t, language } = useLanguage();
  const { translateContent, isTranslating } = useTranslationService();
  const [update, setUpdate] = useState<UpdateData | null>(null);
  const [translatedContent, setTranslatedContent] = useState<{
    title?: string;
    description?: string;
    steps?: { text: string; image?: string }[];
    requiredDocuments?: string[];
    applicationFees?: ApplicationFee[];
    postVacancies?: PostVacancy[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const { bookmarks, toggleBookmark, isAuthenticated } = useBookmarkContext();
  const isBookmarked = id ? bookmarks[id] : false;

  const handleShare = async () => {
    if (!update) return;
    
    const shareData = {
      title: update.title,
      text: `Check out this update: ${update.title} from ${update.organization}`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(shareData.url);
        toast.success(t('linkCopied') || 'Link copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const handleTranslate = async () => {
    if (!update || language === 'en') return;
    
    const translatedTitle = await translateContent(update.title, language);
    const translatedDesc = await translateContent(update.description, language);
    
    let translatedDocs = undefined;
    if (update.requiredDocuments) {
      translatedDocs = await Promise.all(
        update.requiredDocuments.map(async (doc) => await translateContent(doc, language))
      );
    }

    let translatedFees = undefined;
    if (update.applicationFees) {
      translatedFees = await Promise.all(
        update.applicationFees.map(async (item) => ({
          category: await translateContent(item.category, language),
          fee: await translateContent(item.fee, language)
        }))
      );
    }

    let translatedVacancies = undefined;
    if (update.postVacancies) {
      translatedVacancies = await Promise.all(
        update.postVacancies.map(async (item) => ({
          postName: await translateContent(item.postName, language),
          count: item.count
        }))
      );
    }
    
    let translatedSteps = undefined;
    if (update.steps) {
      translatedSteps = await Promise.all(
        update.steps.map(async (step) => ({
          ...step,
          text: await translateContent(step.text, language)
        }))
      );
    }

    setTranslatedContent({
      title: translatedTitle,
      description: translatedDesc,
      requiredDocuments: translatedDocs,
      applicationFees: translatedFees,
      postVacancies: translatedVacancies,
      steps: translatedSteps
    });
  };

  useEffect(() => {
    const fetchUpdate = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'updates', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUpdate({ id: docSnap.id, ...docSnap.data() } as UpdateData);
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching document:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUpdate();
  }, [id]);

  useEffect(() => {
    if (language === 'en') {
      setTranslatedContent(null);
    } else if (update) {
      handleTranslate();
    }
  }, [language, update]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans">
        <Header />
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-academic-blue"></div>
        </div>
      </div>
    );
  }

  if (!update) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-slate-700 mb-4">{t('updateNotFound')}</h2>
          <Link to="/" className="text-academic-blue hover:underline">{t('backToHome')}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-8 pb-20">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-academic-blue transition-colors mb-6">
          <ArrowLeft size={20} />
          <span>{t('backToUpdates')}</span>
        </Link>

        <motion.article 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
        >
          {update.thumbnail && (
            <div className="w-full h-64 md:h-96 overflow-hidden border-b border-slate-100">
              <img 
                src={update.thumbnail} 
                alt={update.title} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap gap-2 mb-1">
                  <Link 
                    to={`/?category=${encodeURIComponent(update.category)}`}
                    className="px-3 py-1 bg-blue-50 text-academic-blue text-xs font-bold rounded-full hover:bg-academic-blue hover:text-white transition-all duration-300 shadow-sm"
                  >
                    <TranslatedText text={update.category} />
                  </Link>
                  <Link 
                    to={`/?state=${encodeURIComponent(update.state)}`}
                    className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full hover:bg-slate-200 transition-all duration-300 shadow-sm"
                  >
                    <TranslatedText text={update.state} />
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-600"></span>
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-red-600 leading-tight">
                    {translatedContent?.title || update.title}
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-2 self-start md:self-center">
                {isAuthenticated && (
                  <button
                    onClick={() => toggleBookmark(update)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200 shadow-sm shrink-0",
                      isBookmarked 
                        ? "bg-academic-gold text-white border-academic-gold" 
                        : "bg-white text-slate-600 border-slate-200 hover:border-academic-gold hover:text-academic-gold"
                    )}
                  >
                    <Bookmark size={20} fill={isBookmarked ? "currentColor" : "none"} />
                    <span className="font-semibold">{isBookmarked ? t('saved') : t('save')}</span>
                  </button>
                )}
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-white text-slate-600 hover:border-academic-blue hover:text-academic-blue transition-all duration-200 shadow-sm shrink-0"
                  title={t('share')}
                >
                  <Share2 size={20} />
                  <span className="font-semibold">{t('share')}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 bg-slate-50 p-4 rounded-lg border border-slate-100">
              <div className="flex items-center gap-3 text-slate-700">
                <Building2 className="text-academic-blue" size={20} />
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">{t('organization')}</p>
                  <Link 
                    to={`/?q=${encodeURIComponent(update.organization)}`}
                    className="font-medium hover:text-academic-blue hover:underline"
                  >
                    <TranslatedText text={update.organization} />
                  </Link>
                </div>
              </div>
              
              {update.posts !== undefined && (
                <div className="flex items-center gap-3 text-slate-700">
                  <Users className="text-academic-blue" size={20} />
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">{t('totalPosts')}</p>
                    <p className="font-medium">{update.posts}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 text-slate-700">
                <MapPin className="text-academic-blue" size={20} />
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">{t('stateRegion')}</p>
                  <p className="font-medium"><TranslatedText text={update.state} /></p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-700">
                <Calendar className="text-academic-blue" size={20} />
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">{t('importantDates')}</p>
                  <div className="text-sm font-medium">
                    {update.type === 'job' ? (
                      <>
                        {update.startDate && <p>{t('start')}: {formatDate(update.startDate)}</p>}
                        {update.endDate && <p>{t('end')}: {formatDate(update.endDate)}</p>}
                        {update.updateDate && <p>{t('lastUpdated')}: {formatDate(update.updateDate)}</p>}
                      </>
                    ) : (
                      <p>{t('release')}: {formatDate(update.releaseDate)}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {update.eligibilityNotice && (
              <div className="mb-8">
                <div className="bg-green-500 text-white px-6 py-4 rounded-2xl shadow-lg flex items-center justify-center text-center border-2 border-green-400/30">
                  <p className="font-bold text-sm md:text-lg whitespace-nowrap overflow-hidden text-ellipsis">
                    <TranslatedText text={update.eligibilityNotice} />
                  </p>
                </div>
              </div>
            )}

            <div className="prose prose-slate max-w-none mb-8">
              <div className="flex items-center justify-between mb-4 border-b pb-2">
                <h2 className="text-xl font-bold text-academic-blue mb-0">{t('details')}</h2>
                {isTranslating && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 italic animate-pulse">
                    <Languages size={14} />
                    {t('translating')}
                  </div>
                )}
              </div>
              <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                {translatedContent?.description || update.description}
              </p>
            </div>

            {update.ageLimit && (
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-8 shadow-sm">
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-academic-blue mb-4 flex items-center gap-2">
                      <Users size={24} />
                      {t('ageLimit')}
                    </h3>
                    <div className="bg-white p-4 rounded-xl border border-blue-100 mb-4">
                      <p className="text-slate-700 font-bold text-lg">
                        <TranslatedText text={update.ageLimit} />
                      </p>
                    </div>
                    {update.ageLimitNotice && (
                      <div className="flex items-start gap-2 text-slate-500 bg-blue-100/50 p-3 rounded-lg border border-blue-100">
                        <Calendar size={16} className="mt-0.5 shrink-0" />
                        <p className="text-xs italic">
                          {t('ageCutoffNote').replace('{date}', formatDate(update.ageLimitNotice))}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="lg:w-96 shrink-0">
                    <AgeChecker update={update} />
                  </div>
                </div>
              </div>
            )}

            {(translatedContent?.requiredDocuments || update.requiredDocuments) && (translatedContent?.requiredDocuments?.length || 0) > 0 && (
              <div className="mb-12 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-academic-blue mb-6 flex items-center gap-2">
                  <span className="p-2 bg-blue-50 rounded-lg">
                    <CheckCircle size={24} />
                  </span>
                  {t('requiredDocuments')}
                </h2>
                <ol className="list-decimal list-inside space-y-3">
                  {(translatedContent?.requiredDocuments || update.requiredDocuments)?.map((doc, index) => (
                    <li key={index} className="text-slate-700 font-medium pl-2 border-l-4 border-academic-blue/20 py-1">
                      {doc}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {(translatedContent?.applicationFees || update.applicationFees) && (translatedContent?.applicationFees?.length || 0) > 0 && (
              <div className="mb-12 bg-blue-50/50 border border-blue-100 rounded-2xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-academic-blue mb-6 flex items-center gap-2">
                  <span className="p-2 bg-blue-100 rounded-lg">
                    <Plus size={24} />
                  </span>
                  {t('applicationFee')}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(translatedContent?.applicationFees || update.applicationFees)?.map((item, index) => (
                    <div key={index} className="bg-white p-4 rounded-xl border border-blue-100 flex justify-between items-center shadow-sm">
                      <span className="font-bold text-slate-600">{item.category}</span>
                      <span className="text-academic-blue font-black text-lg">{item.fee}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(translatedContent?.postVacancies || update.postVacancies) && (translatedContent?.postVacancies?.length || 0) > 0 && (
              <div className="mb-12 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                  <h2 className="text-2xl font-bold text-academic-blue flex items-center gap-2">
                    <span className="p-2 bg-blue-50 rounded-lg">
                      <Users size={24} />
                    </span>
                    {t('postVacancies')}
                  </h2>
                </div>
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">{t('postName')}</th>
                        <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 text-right">{t('vacancies')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(translatedContent?.postVacancies || update.postVacancies)?.map((item, index) => (
                        <tr key={index} className="hover:bg-slate-50/30 transition-colors">
                          <td className="px-6 py-4 text-slate-700 font-medium">{item.postName}</td>
                          <td className="px-6 py-4 text-right">
                            <span className="inline-block bg-blue-50 text-academic-blue font-bold px-3 py-1 rounded-full text-sm">
                              {item.count}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="sm:hidden divide-y divide-slate-100">
                  {(translatedContent?.postVacancies || update.postVacancies)?.map((item, index) => (
                    <div key={index} className="px-6 py-4 flex justify-between items-center">
                      <span className="text-slate-700 font-medium">{item.postName}</span>
                      <span className="bg-blue-50 text-academic-blue font-bold px-3 py-1 rounded-full text-sm">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 mb-12 pt-6 border-t border-slate-200 flex justify-center">
               {update.officialUrl ? (
                 <a 
                   href={update.officialUrl} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-12 rounded-full shadow-lg shadow-red-100 transition-all hover:scale-105 active:scale-95 inline-block text-center text-lg"
                 >
                   {t('applyNow')}
                 </a>
               ) : (
                 <button 
                   onClick={() => toast.info(t('checkOfficialNotice') || 'Please check the official website of the organization for the notice.')}
                   className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-12 rounded-full shadow-lg shadow-red-100 transition-all hover:scale-105 active:scale-95 text-lg"
                 >
                   {t('applyNow')}
                 </button>
               )}
            </div>

            {(translatedContent?.steps || update.steps) && (translatedContent?.steps?.length || 0) > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-academic-blue mb-6 flex items-center gap-2">
                  <span className="p-2 bg-blue-50 rounded-lg">
                    <ImageIcon size={24} />
                  </span>
                  {t('stepByStep')}
                </h2>
                
                <div className="space-y-0 relative">
                  {/* Vertical line that spans all steps */}
                  <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-slate-100 hidden md:block"></div>
                  
                  {(translatedContent?.steps || update.steps)?.map((step, index) => (
                    <div key={index} className="relative pl-0 md:pl-12 pb-12 last:pb-0">
                      <div className="absolute left-0 md:left-[0px] top-0 w-8 h-8 bg-academic-blue text-white rounded-full flex items-center justify-center font-bold shadow-md z-10">
                        {index + 1}
                      </div>
                      
                      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 shadow-sm ml-10 md:ml-0">
                        <p className="text-slate-700 leading-relaxed mb-6 font-medium">
                          {step.text}
                        </p>
                        
                        {step.image && (
                          <div className="rounded-xl overflow-hidden border border-slate-200 shadow-lg bg-white">
                            <img 
                              src={step.image} 
                              alt={`Step ${index + 1}`} 
                              className="w-full h-auto"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-12 p-6 bg-slate-100 rounded-2xl border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                <AlertCircle size={20} className="text-red-500" />
                {t('disclaimer')}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed italic">
                {t('disclaimerText')}
              </p>
            </div>
          </div>
        </motion.article>
      </main>
    </div>
  );
}

function AgeChecker({ update }: { update: UpdateData }) {
  const { t } = useLanguage();
  const [dob, setDob] = useState({ day: '', month: '', year: '' });
  const [result, setResult] = useState<{
    ageToday: { years: number, months: number, days: number };
    ageAtNotice: { years: number, months: number, days: number } | null;
    eligible: boolean;
    message: string;
    status: 'success' | 'error' | 'warning';
  } | null>(null);

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);

  const calculateAge = (birthDate: Date, targetDate: Date) => {
    let years = targetDate.getFullYear() - birthDate.getFullYear();
    let months = targetDate.getMonth() - birthDate.getMonth();
    let days = targetDate.getDate() - birthDate.getDate();

    if (days < 0) {
      months--;
      const lastMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 0);
      days += lastMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }
    return { years, months, days };
  };

  const checkEligibility = () => {
    if (!dob.day || !dob.month || !dob.year) return;

    const birthDate = new Date(Number(dob.year), months.indexOf(dob.month), Number(dob.day));
    const today = new Date();
    const ageToday = calculateAge(birthDate, today);

    let ageAtNotice = null;
    let isEligibleByNotice = true;
    let noticeMessage = "";

    // Parse age limit (e.g. "18-25")
    const ageMatch = update.ageLimit?.match(/(\d+)\s*-\s*(\d+)/) || update.ageLimit?.match(/(\d+)/g);
    let minAge = 0;
    let maxAge = 100;

    if (ageMatch) {
      if (ageMatch.length >= 2) {
        minAge = parseInt(ageMatch[0]);
        maxAge = parseInt(ageMatch[1]);
      } else if (ageMatch.length === 1) {
        minAge = parseInt(ageMatch[0]);
      }
    }

    const isEligibleToday = ageToday.years >= minAge && ageToday.years <= maxAge;

    if (update.ageLimitNotice) {
      const noticeDate = new Date(update.ageLimitNotice);
      ageAtNotice = calculateAge(birthDate, noticeDate);
      isEligibleByNotice = ageAtNotice.years >= minAge && ageAtNotice.years <= maxAge;
      
      if (isEligibleToday && !isEligibleByNotice) {
        noticeMessage = t('ineligibleNoticeMsg');
      }
    }

    const finalEligible = isEligibleToday && isEligibleByNotice;
    
    setResult({
      ageToday,
      ageAtNotice,
      eligible: finalEligible,
      message: noticeMessage || (finalEligible ? t('eligibleMsg') : t('ineligibleMsg')),
      status: finalEligible ? 'success' : (noticeMessage ? 'warning' : 'error')
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <select 
          className="px-2 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-academic-blue bg-white"
          value={dob.day}
          onChange={e => setDob({...dob, day: e.target.value})}
        >
          <option value="">{t('day')}</option>
          {days.map(d => <option key={d} value={d.toString()}>{d}</option>)}
        </select>
        <select 
          className="px-2 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-academic-blue bg-white"
          value={dob.month}
          onChange={e => setDob({...dob, month: e.target.value})}
        >
          <option value="">{t('month')}</option>
          {months.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select 
          className="px-2 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-academic-blue bg-white"
          value={dob.year}
          onChange={e => setDob({...dob, year: e.target.value})}
        >
          <option value="">{t('year')}</option>
          {years.map(y => <option key={y} value={y.toString()}>{y}</option>)}
        </select>
      </div>

      <button 
        onClick={checkEligibility}
        disabled={!dob.day || !dob.month || !dob.year}
        className="w-full py-2 bg-academic-blue text-white rounded-lg font-bold text-sm hover:bg-blue-800 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed btn-hover-effect"
      >
        {t('checkEligibility')}
      </button>

      <AnimatePresence>
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={cn(
              "p-4 rounded-xl border text-sm",
              result.status === 'success' ? "bg-green-50 border-green-100 text-green-800" :
              result.status === 'warning' ? "bg-yellow-50 border-yellow-100 text-yellow-800" :
              "bg-red-50 border-red-100 text-red-800"
            )}
          >
            <div className="flex items-center gap-2 mb-2 font-bold">
              {result.status === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              <span>{result.eligible ? t('eligible') : t('ineligible')}</span>
            </div>
            
            <p className="mb-3 leading-relaxed">{result.message}</p>
            
            <div className="pt-3 border-t border-current/10 space-y-1 text-xs">
              <p>{t('ageToday')}: <span className="font-bold">{result.ageToday.years} {t('years')}, {result.ageToday.months} {t('months')}, {result.ageToday.days} {t('days')}</span></p>
              {result.ageAtNotice && (
                <p>{t('ageCutoff')}: <span className="font-bold">{result.ageAtNotice.years} {t('years')}, {result.ageAtNotice.months} {t('months')}, {result.ageAtNotice.days} {t('days')}</span></p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
