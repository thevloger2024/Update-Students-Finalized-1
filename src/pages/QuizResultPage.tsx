import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Trophy, 
  RotateCcw, 
  Home,
  Info,
  History
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { TranslatedText } from '../components/TranslatedText';
import { Header } from '../components/Header';

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

interface QuizResultState {
  quiz: {
    id?: string;
    organization: string;
    year: string;
    questions: Question[];
  };
  answers: Record<number, number>;
  timeTaken: number;
  score: number;
  isReviewOnly?: boolean;
}

export function QuizResultPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as QuizResultState;

  if (!state || !state.quiz) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <AlertTriangle className="w-16 h-16 text-amber-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">No Results Found</h2>
        <p className="text-slate-600 mb-8 text-center max-w-md">
          We couldn't find any quiz result data. Please take a quiz first.
        </p>
        <button
          onClick={() => navigate('/quiz')}
          className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2"
        >
          <RotateCcw size={20} />
          Go to Quizzes
        </button>
      </div>
    );
  }

  const { quiz, answers, timeTaken, score } = state;
  const totalQuestions = quiz.questions.length;
  const percentage = Math.round((score / totalQuestions) * 100);
  
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getPerformanceMessage = () => {
    if (percentage >= 90) return { title: "Outstanding!", color: "text-green-600", bg: "bg-green-50" };
    if (percentage >= 70) return { title: "Great Job!", color: "text-blue-600", bg: "bg-blue-50" };
    if (percentage >= 50) return { title: "Good Effort!", color: "text-amber-600", bg: "bg-amber-50" };
    return { title: "Keep Practicing!", color: "text-red-600", bg: "bg-red-50" };
  };

  const perf = getPerformanceMessage();

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/quiz')}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-slate-700" />
          </button>
          <h1 className="text-2xl font-bold text-slate-900">
            <TranslatedText text="Quiz Results" />
          </h1>
        </div>

        {/* Summary Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative w-40 h-40 flex-shrink-0">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  className="text-slate-100 stroke-current"
                  strokeWidth="8"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                />
                <circle
                  className={`${percentage >= 50 ? 'text-indigo-600' : 'text-red-500'} stroke-current transition-all duration-1000 ease-out`}
                  strokeWidth="8"
                  strokeDasharray={251.2}
                  strokeDashoffset={251.2 - (251.2 * percentage) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-slate-800">{percentage}%</span>
                <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Score</span>
              </div>
            </div>

            <div className="flex-grow text-center md:text-left">
              <div className={`inline-block px-4 py-1 rounded-full ${perf.bg} ${perf.color} text-sm font-bold mb-3`}>
                {perf.title}
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">
                {quiz.organization}
              </h2>
              <p className="text-slate-500 mb-6">Year: {quiz.year}</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Correct</p>
                  <p className="text-lg font-bold text-green-600">{score}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Wrong</p>
                  <p className="text-lg font-bold text-red-500">{Object.keys(answers).length - score}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Time</p>
                  <p className="text-lg font-bold text-slate-700">{formatTime(timeTaken)}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Total</p>
                  <p className="text-lg font-bold text-slate-700">{totalQuestions}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-12">
          {state.isReviewOnly ? (
            <button
              onClick={() => navigate('/quiz/history')}
              className="flex-1 min-w-[160px] bg-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
            >
              <History size={20} />
              <TranslatedText text="Back to History" />
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/quiz')}
                className="flex-1 min-w-[160px] bg-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
              >
                <RotateCcw size={20} />
                <TranslatedText text="Try Again" />
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 min-w-[160px] bg-white text-slate-700 border border-slate-200 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
              >
                <Home size={20} />
                <TranslatedText text="Back to Home" />
              </button>
            </>
          )}
        </div>

        {/* Detailed Review */}
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <h3 className="text-xl font-bold text-slate-800">Review Answers</h3>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-green-600 font-medium">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                Correct
              </div>
              <div className="flex items-center gap-1.5 text-red-500 font-medium">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                Wrong
              </div>
            </div>
          </div>

          {quiz.questions.map((q, qIndex) => {
            const userAnswer = answers[qIndex];
            const isCorrect = userAnswer === q.correctIndex;
            const isUnanswered = userAnswer === undefined;

            return (
              <motion.div 
                key={qIndex}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`bg-white rounded-3xl p-6 border-2 transition-all ${
                  isCorrect ? 'border-green-100' : isUnanswered ? 'border-amber-100' : 'border-red-100'
                }`}
              >
                <div className="flex gap-4 mb-6">
                  <span className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm ${
                    isCorrect ? 'bg-green-100 text-green-600' : isUnanswered ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {qIndex + 1}
                  </span>
                  <div className="pt-1">
                    <h4 className="text-lg font-medium text-slate-800 leading-relaxed mb-1">
                      {q.question}
                    </h4>
                    {isUnanswered && (
                      <span className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1">
                        <AlertTriangle size={12} />
                        Not Answered
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  {q.options.map((opt, oIndex) => {
                    const isCorrectOption = oIndex === q.correctIndex;
                    const isSelectedOption = oIndex === userAnswer;
                    
                    let cardClass = "p-4 rounded-2xl border-2 flex items-center justify-between transition-all ";
                    let icon = null;

                    if (isCorrectOption) {
                      cardClass += "border-green-500 bg-green-50 text-green-800 font-medium";
                      icon = <CheckCircle2 size={20} className="text-green-600" />;
                    } else if (isSelectedOption && !isCorrect) {
                      cardClass += "border-red-500 bg-red-50 text-red-800";
                      icon = <XCircle size={20} className="text-red-500" />;
                    } else {
                      cardClass += "border-slate-100 bg-slate-50 text-slate-500";
                    }

                    return (
                      <div key={oIndex} className={cardClass}>
                        <span className="text-sm">{opt}</span>
                        {icon}
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <div className="bg-indigo-50/50 rounded-2xl p-5 border border-indigo-100/50 flex gap-4">
                    <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600 flex-shrink-0 h-fit">
                      <Info size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">Explanation</p>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {q.explanation}
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="mt-16 p-8 bg-slate-900 rounded-[2.5rem] text-white overflow-hidden relative">
          <div className="relative z-10">
            <Trophy className="text-academic-gold mb-4" size={40} />
            <h3 className="text-2xl font-bold mb-2">Ready for the next challenge?</h3>
            <p className="text-slate-400 mb-8 max-w-md">
              Continuous practice is the key to success in competitive exams. Keep going!
            </p>
            <button
              onClick={() => navigate('/quiz')}
              className="bg-white text-slate-900 px-8 py-3 rounded-xl font-bold hover:bg-slate-100 transition-all"
            >
              Browse More Quizzes
            </button>
          </div>
          {/* Decorative elements */}
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl"></div>
          <div className="absolute -left-20 -top-20 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
}
