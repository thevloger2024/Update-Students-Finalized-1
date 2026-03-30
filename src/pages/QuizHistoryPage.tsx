import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, orderBy, getDocs, Timestamp, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'framer-motion';
import { 
  History, 
  Calendar, 
  Clock, 
  Trophy, 
  ChevronRight, 
  ArrowLeft,
  Loader2,
  AlertCircle,
  BrainCircuit
} from 'lucide-react';
import { format } from 'date-fns';
import { Header } from '../components/Header';
import { toast } from 'sonner';

interface QuizResult {
  id: string;
  quizId: string;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  timeTaken: number;
  createdAt: number | Timestamp;
  answers: Record<number, number>;
  organization?: string;
  year?: string;
}

const QuizHistoryPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [history, setHistory] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!auth.currentUser) {
        setLoading(false);
        return;
      }

      try {
        const historyRef = collection(db, 'users', auth.currentUser.uid, 'quiz_history');
        const q = query(historyRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const results: QuizResult[] = [];
        querySnapshot.forEach((doc) => {
          results.push({ id: doc.id, ...doc.data() } as QuizResult);
        });
        
        setHistory(results);
      } catch (err) {
        console.error("Error fetching quiz history:", err);
        setError("Failed to load quiz history.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const handleReview = async (item: QuizResult) => {
    setReviewingId(item.id);
    try {
      // Fetch the full quiz data to show the review
      const quizDoc = await getDoc(doc(db, 'quizzes', item.quizId));
      if (!quizDoc.exists()) {
        toast.error("Original quiz data not found. It might have been deleted.");
        return;
      }

      const quizData = quizDoc.data();
      
      navigate('/quiz/result', { 
        state: { 
          quiz: { id: quizDoc.id, ...quizData },
          answers: item.answers,
          timeTaken: item.timeTaken,
          score: item.score,
          isReviewOnly: true
        }
      });
    } catch (err) {
      console.error("Error fetching quiz for review:", err);
      toast.error("Failed to load quiz for review.");
    } finally {
      setReviewingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-100px)]">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors mb-6 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">{t('back')}</span>
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
            <History size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{t('quizHistory')}</h1>
            <p className="text-slate-500">{t('viewPastPerformance')}</p>
          </div>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex items-center gap-4 text-red-700">
            <AlertCircle className="shrink-0" />
            <p>{error}</p>
          </div>
        ) : history.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <History size={32} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">{t('noHistoryFound')}</h3>
            <p className="text-slate-500 mb-6">{t('startQuizToSeeHistory')}</p>
            <button 
              onClick={() => navigate('/quiz')}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <BrainCircuit size={18} />
              {t('startQuiz')}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item, index) => {
              const date = item.createdAt instanceof Timestamp 
                ? item.createdAt.toDate() 
                : new Date(item.createdAt);
                
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                        {item.quizTitle}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} />
                          {format(date, 'PPP')}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} />
                          {formatTime(item.timeTaken)}
                        </div>
                        {(item.organization || item.year) && (
                          <div className="flex items-center gap-1.5 text-indigo-600 font-medium">
                            {item.organization} {item.year && `(${item.year})`}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="flex items-center gap-2 justify-end mb-1">
                          <Trophy size={16} className="text-amber-500" />
                          <span className="text-xl font-bold text-slate-900">
                            {item.score}/{item.totalQuestions}
                          </span>
                        </div>
                        <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-600 rounded-full"
                            style={{ width: `${(item.score / item.totalQuestions) * 100}%` }}
                          />
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => handleReview(item)}
                        disabled={reviewingId === item.id}
                        className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-indigo-600 transition-all disabled:opacity-50"
                      >
                        {reviewingId === item.id ? (
                          <Loader2 size={24} className="animate-spin" />
                        ) : (
                          <ChevronRight size={24} />
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizHistoryPage;
