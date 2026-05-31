import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { Calendar as CalendarIcon, FileCheck, Award, Briefcase } from 'lucide-react';
import { UpdateData } from '../components/UpdateCard';
import { useLanguage } from '../contexts/LanguageContext';
import { TranslatedText } from '../components/TranslatedText';
import { SEO } from '../components/SEO';
import { cn, formatDate } from '../contexts/utils';
import { Link } from 'react-router-dom';

export function ExamCalendar() {
  const { t } = useLanguage();
  const [updates, setUpdates] = useState<UpdateData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDates = async () => {
      try {
        const q = query(
          collection(db, 'updates'),
          orderBy('createdAt', 'desc'),
          limit(100)
        );
        const snapshot = await getDocs(q);
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UpdateData));
        setUpdates(docs.filter(d => d.startDate || d.endDate || d.releaseDate));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDates();
  }, []);

  const getEventDate = (u: UpdateData) => {
    if (u.type === 'job' || u.type === 'scholarship') return u.endDate || u.startDate;
    return u.releaseDate;
  };

  const sortedUpdates = [...updates].sort((a, b) => {
    const d1 = new Date(getEventDate(a) || '').getTime();
    const d2 = new Date(getEventDate(b) || '').getTime();
    if (isNaN(d1)) return 1;
    if (isNaN(d2)) return -1;
    return d1 - d2;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'admit_card': return <FileCheck size={16} className="text-amber-500" />;
      case 'result': return <Award size={16} className="text-emerald-500" />;
      default: return <Briefcase size={16} className="text-blue-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'admit_card': return 'bg-amber-50 border-amber-200';
      case 'result': return 'bg-emerald-50 border-emerald-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <SEO 
        title="Exam Calendar - Upcoming Jobs, Admit Cards & Results | Update Students"
        description="Check out the complete and latest exam calendar for government jobs, SSC, UPSC, results, and admit card release dates."
      />
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-slate-800 flex items-center gap-3">
              <CalendarIcon className="text-academic-blue" size={32} />
              Exam Calendar
            </h1>
            <p className="text-slate-500 mt-2">Upcoming Exam Dates, Admit Cards & Deadlines</p>
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span> Exam / Job Deadline
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 bg-amber-50 text-amber-700 rounded-full">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span> Admit Card
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Result
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin h-8 w-8 border-2 border-academic-blue border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
            {sortedUpdates.map((update, idx) => (
              <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-slate-50 bg-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 text-slate-500 z-10">
                  {getTypeIcon(update.type)}
                </div>
                
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border shadow-sm bg-white hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                      {formatDate(getEventDate(update))}
                    </span>
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", getTypeColor(update.type))}>
                      {update.type.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <Link to={`/update/${update.id}`} className="font-bold text-slate-800 line-clamp-2 hover:text-academic-blue transition-colors">
                    <TranslatedText text={update.title} />
                  </Link>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-1">{update.organization}</p>
                </div>
              </div>
            ))}
            
            {sortedUpdates.length === 0 && (
              <div className="text-center py-10">
                <p className="text-slate-500">No upcoming dates found.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
