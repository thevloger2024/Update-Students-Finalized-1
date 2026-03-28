import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageSquare, AlertCircle, Lightbulb, Smile } from 'lucide-react';
import { db, auth } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { cn } from '../contexts/utils';
import { useLanguage } from '../contexts/LanguageContext';
import { TranslatedText } from './TranslatedText';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FeedbackType = 'issue' | 'suggestion' | 'experience';

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [type, setType] = useState<FeedbackType>('experience');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error(t('enterMessage'));
      return;
    }

    setIsSubmitting(true);
    try {
      const user = auth.currentUser;
      const feedbackData: any = {
        type,
        message: message.trim(),
        createdAt: Date.now(),
      };

      if (user?.uid) feedbackData.userId = user.uid;
      if (user?.email) feedbackData.userEmail = user.email;

      await addDoc(collection(db, 'feedback'), feedbackData);
      
      toast.success(t('feedbackSuccess'));
      setMessage('');
      onClose();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error(t('feedbackError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-academic-blue text-white">
              <div className="flex items-center gap-2">
                <MessageSquare size={20} />
                <h2 className="text-xl font-bold font-serif">{t('shareFeedback')}</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700">{t('whatsOnMind')}</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'experience', label: t('experience'), icon: Smile, color: 'text-green-600 bg-green-50 border-green-200' },
                    { id: 'suggestion', label: t('suggestion'), icon: Lightbulb, color: 'text-academic-gold bg-yellow-50 border-yellow-200' },
                    { id: 'issue', label: t('issue'), icon: AlertCircle, color: 'text-red-600 bg-red-50 border-red-200' },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = type === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setType(item.id as FeedbackType)}
                        className={cn(
                          "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200",
                          isActive 
                            ? item.color
                            : "border-slate-100 text-slate-500 hover:border-slate-200 hover:bg-slate-50"
                        )}
                      >
                        <Icon size={20} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">{t('message')}</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    type === 'issue' ? t('issuePlaceholder') :
                    type === 'suggestion' ? t('suggestionPlaceholder') :
                    t('experiencePlaceholder')
                  }
                  className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-academic-blue focus:border-transparent transition-all resize-none text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-academic-blue hover:bg-blue-800 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={18} />
                    <span>{t('sendFeedback')}</span>
                  </>
                )}
              </button>
              
              <p className="text-[10px] text-center text-slate-400">
                {t('feedbackHelp')}
              </p>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
