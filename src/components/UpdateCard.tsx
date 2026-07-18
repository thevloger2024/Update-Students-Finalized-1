import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn, formatDate, timeAgo } from '../contexts/utils';
import { Bookmark, Share2, Star, Sparkles, MessageCircle, Clock, Flame, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { useBookmarkContext } from '../contexts/BookmarkContext';
import { useLanguage } from '../contexts/LanguageContext';
import { TranslatedText } from './TranslatedText';
import { CountdownBadge } from './CountdownBadge';

export interface ApplicationFee {
  category: string;
  fee: string;
}

export interface PostVacancy {
  postName: string;
  count: number;
}

export interface UpdateData {
  id: string;
  title: string;
  type: 'job' | 'admit_card' | 'result' | 'scholarship' | 'updates';
  category: string;
  state: string;
  startDate?: string;
  endDate?: string;
  updateDate?: string;
  releaseDate?: string;
  organization: string;
  posts?: number;
  description: string;
  ageLimit?: string;
  ageLimitNotice?: string;
  eligibilityNotice?: string;
  officialUrl?: string;
  syllabus?: string;
  requiredDocuments?: string[];
  applicationFees?: ApplicationFee[];
  postVacancies?: PostVacancy[];
  featured?: boolean;
  tags?: string[];
  createdAt: number;
  views?: number;
  thumbnail?: string;
  steps?: {
    text: string;
    image?: string;
  }[];
}

interface UpdateCardProps {
  update: UpdateData;
}

export const UpdateCard: React.FC<UpdateCardProps> = ({ update }) => {
  const { t } = useLanguage();
  const { bookmarks, toggleBookmark } = useBookmarkContext();
  const isBookmarked = bookmarks[update.id];

  const isNew = update.updateDate ? 
    (new Date().getTime() - new Date(update.updateDate).getTime()) < 48 * 60 * 60 * 1000 : 
    (new Date().getTime() - update.createdAt) < 48 * 60 * 60 * 1000;

  const isHot = (update.views || 0) > 50; // Hot if views > 50

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleBookmark(update);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const shareData = {
      title: update.title,
      text: t('shareText')
        .replace('{title}', update.title)
        .replace('{org}', update.organization),
      url: `${window.location.origin}/update/${update.id}`,
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
        toast.success(t('linkCopied'));
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const handleWhatsappShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/update/${update.id}`;
    const txt = `🎯 ${update.title} | Last Date: ${update.endDate ? formatDate(update.endDate) : 'Not Specified'} | Apply: ${url} via UpdateStudents`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(txt)}`, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(37, 99, 235, 0.1), 0 4px 6px -2px rgba(37, 99, 235, 0.05)" }}
      whileTap={{ scale: 0.98 }}
      className="bg-white border border-slate-200 rounded-lg shadow-sm transition-all duration-200 overflow-hidden flex flex-col min-h-[160px] relative group"
    >
      <div className="absolute top-2 right-2 flex flex-col gap-2 z-10">
        <div className="flex gap-2">
          {isNew && (
            <div className="flex items-center gap-1 bg-red-50 text-red-600 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider animate-pulse shadow-sm">
              <Sparkles size={10} />
              {t('new')}
            </div>
          )}
          {isHot && (
            <div className="flex items-center gap-1 bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
              <Flame size={10} />
              HOT
            </div>
          )}
        </div>
        {update.featured && (
          <div className="p-1.5 rounded-full bg-academic-gold text-white shadow-sm" title={t('featuredUpdate')}>
            <Star size={12} fill="currentColor" />
          </div>
        )}
        <button
          onClick={handleBookmark}
          className={cn(
            "p-1.5 rounded-full transition-all duration-200 btn-hover-effect",
            isBookmarked 
              ? "text-academic-gold bg-yellow-50 shadow-sm" 
              : "text-slate-300 hover:text-academic-gold hover:bg-slate-50 opacity-0 group-hover:opacity-100"
          )}
          title={isBookmarked ? t('removeBookmark') : t('saveUpdate')}
        >
          <Bookmark size={16} fill={isBookmarked ? "currentColor" : "none"} />
        </button>
        
        <button
          onClick={handleWhatsappShare}
          className="p-1.5 rounded-full text-slate-300 hover:text-green-500 hover:bg-green-50 opacity-0 group-hover:opacity-100 transition-all duration-200 btn-hover-effect"
          title="Share on WhatsApp"
        >
          <MessageCircle size={16} />
        </button>

        <button
          onClick={handleShare}
          className="p-1.5 rounded-full text-slate-300 hover:text-academic-blue hover:bg-slate-50 opacity-0 group-hover:opacity-100 transition-all duration-200 btn-hover-effect"
          title={t('shareUpdate')}
        >
          <Share2 size={16} />
        </button>
      </div>
      
      <div className="flex-1 p-4 flex flex-col justify-between relative pt-8 md:pt-4">
        {update.endDate && (
          <div className="mb-2">
            <CountdownBadge lastDate={update.endDate} />
          </div>
        )}
        <div className="flex items-start justify-between gap-2">
          <Link to={`/update/${update.id}`} className="flex-1">
            <TranslatedText 
              text={update.title} 
              as="h3" 
              className="text-blue-600 font-semibold text-sm md:text-base line-clamp-2 leading-tight pr-6 hover:underline" 
            />
          </Link>
          {!update.featured && (
            <Link 
              to={`/update/${update.id}`}
              className="text-[10px] font-bold text-academic-gold whitespace-nowrap hover:underline flex items-center gap-0.5 mt-1"
            >
              {t('readMore')}
            </Link>
          )}
        </div>
        <Link 
          to={`/?q=${encodeURIComponent(update.organization)}`}
          className="text-xs text-slate-500 mt-1 line-clamp-1 hover:text-academic-blue hover:underline"
        >
          <TranslatedText text={update.organization} /> {update.posts ? `| ${update.posts} ${t('posts')}` : ''}
        </Link>

        <div className="mt-2 flex flex-col gap-2">
          <div className="flex flex-wrap gap-1.5">
            <Link 
              to={`/?category=${encodeURIComponent(update.category)}`}
              className="px-2 py-0.5 bg-blue-50 text-academic-blue text-[10px] font-bold rounded-full hover:bg-academic-blue hover:text-white transition-all duration-300"
            >
              <TranslatedText text={update.category} />
            </Link>
            <Link 
              to={`/?state=${encodeURIComponent(update.state)}`}
              className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full hover:bg-slate-200 transition-all duration-300"
            >
              <TranslatedText text={update.state} />
            </Link>
            {update.tags && update.tags.length > 0 && update.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="px-2 py-0.5 bg-purple-50 text-purple-600 text-[10px] font-bold rounded-full border border-purple-100 flex items-center gap-1">
                <Tag size={8} />
                <TranslatedText text={tag} />
              </span>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100">
            {(update.type === 'job' || update.type === 'scholarship') ? (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] md:text-xs font-medium text-red-600">
                {update.startDate && <span>{t('start')}: {formatDate(update.startDate)}</span>}
                {update.endDate && <span>{t('end')}: {formatDate(update.endDate)}</span>}
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] md:text-xs font-medium text-red-600">
                {update.releaseDate && <span>{t('released')}: {formatDate(update.releaseDate)}</span>}
              </div>
            )}
            
            <div className="flex items-center gap-1 text-[9px] md:text-[10px] text-slate-400 mt-2">
              <Clock size={10} />
              <span>Updated: {timeAgo(update.updateDate || update.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
