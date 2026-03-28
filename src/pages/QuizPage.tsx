import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BrainCircuit, CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TranslatedText } from '../components/TranslatedText';
import { useLanguage } from '../contexts/LanguageContext';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { toast } from 'sonner';

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
}

interface Quiz {
  id: string;
  type?: 'exam' | 'current_affairs';
  organization: string;
  year: string;
  questions: Question[];
}

export function QuizPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [quizType, setQuizType] = useState<'exam' | 'current_affairs'>('exam');
  const [organizations, setOrganizations] = useState<string[]>([]);
  const [selectedOrg, setSelectedOrg] = useState('');
  const [years, setYears] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [timeTaken, setTimeTaken] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'quizzes'));
        const fetchedQuizzes: Quiz[] = [];
        const orgsSet = new Set<string>();
        
        snapshot.forEach(doc => {
          const data = doc.data() as Omit<Quiz, 'id'>;
          fetchedQuizzes.push({ id: doc.id, ...data });
          if (data.organization && data.organization !== 'Current Affairs' && data.type !== 'current_affairs') {
            orgsSet.add(data.organization);
          }
        });
        
        setQuizzes(fetchedQuizzes);
        setOrganizations(Array.from(orgsSet).sort());
      } catch (error) {
        console.error("Error fetching quizzes:", error);
        toast.error("Failed to load quizzes.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  useEffect(() => {
    if (quizType === 'exam') {
      if (selectedOrg) {
        const orgYears = quizzes
          .filter(q => q.organization === selectedOrg && q.type !== 'current_affairs')
          .map(q => q.year);
        setYears(Array.from(new Set(orgYears)).sort((a, b) => parseInt(b as string) - parseInt(a as string)));
        setSelectedYear('');
      } else {
        setYears([]);
      }
    } else {
      const caYears = quizzes
        .filter(q => q.type === 'current_affairs' || q.organization === 'Current Affairs')
        .map(q => q.year);
      setYears(Array.from(new Set(caYears)).sort((a, b) => parseInt(b as string) - parseInt(a as string)));
      setSelectedYear('');
    }
  }, [selectedOrg, quizzes, quizType]);

  const handleStartQuiz = () => {
    if (!auth.currentUser && Object.keys(selectedAnswers).length > 0) {
      toast.error(t('loginRequiredForMoreQuiz'));
      return;
    }

    const quiz = quizzes.find(q => 
      (quizType === 'exam' ? q.organization === selectedOrg : (q.type === 'current_affairs' || q.organization === 'Current Affairs')) 
      && q.year === selectedYear
    );
    if (quiz) {
      setActiveQuiz(quiz);
      setQuizStarted(true);
      setQuizFinished(false);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setStartTime(Date.now());
    } else {
      toast.error(t('noQuizzesFound'));
    }
  };

  const handleAnswerSelect = (optionIndex: number) => {
    if (quizFinished) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: optionIndex
    }));
  };

  const handleNextQuestion = () => {
    if (activeQuiz && currentQuestionIndex < activeQuiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleSubmitQuiz = () => {
    setQuizFinished(true);
    setTimeTaken(Math.floor((Date.now() - startTime) / 1000));
  };

  const calculateScore = () => {
    if (!activeQuiz) return 0;
    let score = 0;
    Object.entries(selectedAnswers).forEach(([qIndex, aIndex]) => {
      if (activeQuiz.questions[parseInt(qIndex)].correctIndex === aIndex) {
        score++;
      }
    });
    return score;
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-[100px] pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-slate-700" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg text-white">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">
              <TranslatedText text="Quiz" />
            </h1>
          </div>
        </div>

        {!quizStarted ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center"
          >
            <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BrainCircuit className="w-12 h-12 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              <TranslatedText text="Test Your Knowledge" />
            </h2>
            <p className="text-slate-600 max-w-lg mx-auto mb-8">
              <TranslatedText text="Select an organization and year to begin the quiz." />
            </p>

            <div className="flex gap-4 justify-center mb-8">
              <button
                onClick={() => { setQuizType('exam'); setSelectedOrg(''); setSelectedYear(''); }}
                className={`px-6 py-2 rounded-xl font-medium transition-colors ${quizType === 'exam' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {t('exam') || 'Organization Exam'}
              </button>
              <button
                onClick={() => { setQuizType('current_affairs'); setSelectedOrg(''); setSelectedYear(''); }}
                className={`px-6 py-2 rounded-xl font-medium transition-colors ${quizType === 'current_affairs' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {t('currentAffairs') || 'Current Affairs'}
              </button>
            </div>

            <div className="max-w-md mx-auto space-y-6">
              {quizType === 'exam' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 text-left">{t('selectOrg')}</label>
                  <select
                    value={selectedOrg}
                    onChange={(e) => setSelectedOrg(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white"
                  >
                    <option value="">{t('selectOrg')}</option>
                    {organizations.map(org => (
                      <option key={org} value={org}>{org}</option>
                    ))}
                  </select>
                </div>
              )}

              {(quizType === 'current_affairs' || selectedOrg) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <label className="block text-sm font-medium text-slate-700 mb-2 text-left">{t('selectYear')}</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white"
                  >
                    <option value="">{t('selectYear')}</option>
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </motion.div>
              )}

              <button
                onClick={handleStartQuiz}
                disabled={!selectedYear || (quizType === 'exam' && !selectedOrg)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all mt-8"
              >
                <BrainCircuit size={20} />
                <span>{t('startQuiz')}</span>
              </button>
            </div>
          </motion.div>
        ) : quizFinished ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8"
          >
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={48} />
              </div>
              <h2 className="text-3xl font-serif font-bold text-slate-800 mb-2">Quiz Completed!</h2>
              <p className="text-slate-500">{activeQuiz?.organization} - {activeQuiz?.year}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              <div className="bg-slate-50 p-4 rounded-2xl text-center border border-slate-100">
                <p className="text-sm text-slate-500 mb-1">{t('score')}</p>
                <p className="text-2xl font-bold text-slate-800">{calculateScore()} / {activeQuiz?.questions.length}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl text-center border border-slate-100">
                <p className="text-sm text-slate-500 mb-1">{t('timeTaken')}</p>
                <p className="text-2xl font-bold text-slate-800">{formatTime(timeTaken)}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-2xl text-center border border-green-100">
                <p className="text-sm text-green-600 mb-1">{t('correct')}</p>
                <p className="text-2xl font-bold text-green-700">{calculateScore()}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-2xl text-center border border-red-100">
                <p className="text-sm text-red-600 mb-1">{t('wrong')}</p>
                <p className="text-2xl font-bold text-red-700">{Object.keys(selectedAnswers).length - calculateScore()}</p>
              </div>
            </div>

            <div className="space-y-8">
              <h3 className="text-xl font-bold text-slate-800 border-b pb-4">Review Answers</h3>
              {activeQuiz?.questions.map((q, qIndex) => {
                const userAnswer = selectedAnswers[qIndex];
                const isCorrect = userAnswer === q.correctIndex;
                const isUnanswered = userAnswer === undefined;

                return (
                  <div key={qIndex} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                    <div className="flex gap-3 mb-4">
                      <span className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold text-slate-500 shadow-sm">
                        {qIndex + 1}
                      </span>
                      <p className="font-medium text-slate-800 pt-1">{q.question}</p>
                    </div>
                    <div className="space-y-3 pl-11">
                      {q.options.map((opt, oIndex) => {
                        let optionClass = "bg-white border-slate-200 text-slate-600";
                        let icon = null;

                        if (oIndex === q.correctIndex) {
                          optionClass = "bg-purple-50 border-purple-200 text-purple-700 font-medium";
                          icon = <CheckCircle2 size={18} className="text-purple-600" />;
                        } else if (oIndex === userAnswer && !isCorrect) {
                          optionClass = "bg-red-50 border-red-200 text-red-700";
                          icon = <XCircle size={18} className="text-red-500" />;
                        }

                        return (
                          <div key={oIndex} className={`p-4 rounded-xl border flex items-center justify-between ${optionClass}`}>
                            <span>{opt}</span>
                            {icon}
                          </div>
                        );
                      })}
                    </div>
                    {isUnanswered && (
                      <p className="text-sm text-amber-600 mt-4 pl-11 flex items-center gap-2">
                        <AlertTriangle size={16} />
                        {t('unanswered')}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-12 p-6 bg-blue-50 rounded-2xl flex items-start gap-4">
              <AlertTriangle className="text-blue-500 flex-shrink-0 mt-1" size={24} />
              <p className="text-sm text-blue-800 leading-relaxed">
                {t('quizDisclaimer')}
              </p>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={() => {
                  setQuizStarted(false);
                  setQuizFinished(false);
                  setSelectedOrg('');
                  setSelectedYear('');
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-8 rounded-xl transition-colors"
              >
                Take Another Quiz
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[600px]">
            {/* Quiz Header */}
            <div className="bg-slate-50 border-b border-slate-200 p-6 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-800">{activeQuiz?.organization}</h2>
                <p className="text-sm text-slate-500">Year: {activeQuiz?.year}</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-slate-600 font-mono bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                  <Clock size={18} className="text-indigo-600" />
                  <span>{formatTime(Math.floor((Date.now() - startTime) / 1000))}</span>
                </div>
                <div className="text-sm font-medium text-slate-500">
                  {t('question')} {currentQuestionIndex + 1} {t('of')} {activeQuiz?.questions.length}
                </div>
              </div>
            </div>

            {/* Question Area */}
            <div className="p-8 flex-grow">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestionIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="text-2xl font-medium text-slate-800 mb-8 leading-relaxed">
                    {activeQuiz?.questions[currentQuestionIndex].question}
                  </h3>
                  
                  <div className="space-y-4">
                    {activeQuiz?.questions[currentQuestionIndex].options.map((option, index) => {
                      const isSelected = selectedAnswers[currentQuestionIndex] === index;
                      const hasAnswered = selectedAnswers[currentQuestionIndex] !== undefined;
                      const isCorrect = index === activeQuiz?.questions[currentQuestionIndex].correctIndex;
                      
                      let buttonClass = "w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 ";
                      
                      if (!hasAnswered) {
                        buttonClass += "border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 text-slate-700";
                      } else {
                        if (isCorrect) {
                          buttonClass += "border-green-500 bg-green-50 text-green-800";
                        } else if (isSelected) {
                          buttonClass += "border-red-500 bg-red-50 text-red-800";
                        } else {
                          buttonClass += "border-slate-200 opacity-50 text-slate-500";
                        }
                      }

                      return (
                        <button
                          key={index}
                          onClick={() => handleAnswerSelect(index)}
                          disabled={hasAnswered}
                          className={buttonClass}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-lg">{option}</span>
                            {hasAnswered && isCorrect && <CheckCircle2 className="text-green-500" />}
                            {hasAnswered && isSelected && !isCorrect && <XCircle className="text-red-500" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Quiz Footer */}
            <div className="bg-slate-50 border-t border-slate-200 p-6 flex justify-between items-center">
              <button
                onClick={handleSubmitQuiz}
                className="text-slate-500 hover:text-red-600 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-red-50"
              >
                {t('submitQuiz')}
              </button>
              
              <button
                onClick={handleNextQuestion}
                disabled={selectedAnswers[currentQuestionIndex] === undefined || currentQuestionIndex === (activeQuiz?.questions.length || 0) - 1}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white px-8 py-3 rounded-xl font-bold transition-colors flex items-center gap-2"
              >
                <span>{t('next')}</span>
                <ArrowLeft size={18} className="rotate-180" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
