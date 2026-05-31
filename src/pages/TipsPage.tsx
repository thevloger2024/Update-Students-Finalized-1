import React from 'react';
import { Header } from '../components/Header';
import { SEO } from '../components/SEO';
import { Link } from 'react-router-dom';
import { BookOpen, FileText } from 'lucide-react';

export function TipsPage() {
  const articles = [
    {
      id: 'ssc-cgl-2026-guide',
      title: 'SSC CGL 2026 Complete Guide: Preparation Strategy and Books',
      excerpt: 'Read the complete guide to crack SSC CGL 2026 in your first attempt. Detailed syllabus, books and time table strategies.',
      date: '2026-05-30',
      category: 'Exam Tips'
    },
    {
      id: 'upsc-preparation-strategy',
      title: 'UPSC Preparation Tips for Beginners - How to start from zero?',
      excerpt: 'Starting UPSC prep can be overwhelming. Learn how to structure your studies, NCERT importance, and newspaper reading methods.',
      date: '2026-05-25',
      category: 'Preparation'
    },
    {
      id: 'how-to-fill-railway-form',
      title: 'How to Fill Railway Form - Mistakes to Avoid in RRB Application',
      excerpt: 'Step by step guide to filling the Railway Recruitment Board (RRB) application form. Avoid common mistakes that lead to form rejection.',
      date: '2026-05-20',
      category: 'Guides'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <SEO 
        title="Preparation Tips & Guides - Update Students"
        description="Read detailed preparation guides for SSC, RRB, UPSC, NEET and other competitive exams. Get study strategies and latest news."
      />
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-10">
          <h1 className="text-3xl font-serif font-bold text-slate-800 flex items-center gap-3">
            <BookOpen className="text-academic-blue" size={32} />
            Preparation Tips & Guides
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Complete exam guides, preparation strategies, and common mistakes to avoid.
          </p>
        </div>

        <div className="space-y-6">
          {articles.map(article => (
            <article key={article.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 text-sm text-slate-500 mb-3">
                <span className="px-2.5 py-1 bg-blue-50 text-academic-blue font-bold rounded-lg text-xs">
                  {article.category}
                </span>
                <span>{article.date}</span>
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">
                <Link to={`/tips/${article.id}`} className="hover:text-academic-blue transition-colors">
                  {article.title}
                </Link>
              </h2>
              <p className="text-slate-600 mb-4">{article.excerpt}</p>
              <Link to={`/tips/${article.id}`} className="text-academic-blue font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                Read Full Article <FileText size={16} />
              </Link>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
