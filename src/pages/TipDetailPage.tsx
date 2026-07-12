import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { SEO } from '../components/SEO';
import { ArrowLeft, Printer, CheckCircle2, GraduationCap, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';
import { JobGuideSection } from '../components/JobGuideSection';

const articles: Record<string, any> = {
  '10th-pass-direct-recruitment': {
    title: '10th Pass Jobs: Direct Recruitment & Interview Only Jobs (All-India & Bihar)',
    date: '2026-07-10',
    category: 'Job Guide',
    content: () => (
      <div className="space-y-8 text-slate-700">
        <p className="text-lg leading-relaxed">
          <strong>Update Students</strong> ke platform par candidates ke reference ke liye, yahan Bihar aur All-India level ki direct recruitment (bina pariksha), sirf interview, aur 10th-pass jobs ki ek detailed list di gayi hai.
        </p>
        <p className="text-lg leading-relaxed">
          Inme se kai bhartiyon me selection seedhe 10th ke marks (merit) ke aadhar par hota hai. Ye list students aur job seekers ke liye ekdum sateek aur labhdayak rahegi.
        </p>

        <JobGuideSection />

        {/* Section 3 */}
        <section>
          <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <GraduationCap className="text-purple-600" />
            3. 10th Level के आसान Exams (Basic Written Test)
          </h2>
          <p className="mb-4">
            Agar koi candidate ek simple written exam clear kar sakta hai, to 10th pass level par Bharat aur Bihar me sabse badi aur lokpriya bhartiyan ye hain:
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100">
              <strong className="text-blue-800 text-lg block mb-2">SSC MTS (Multi-Tasking Staff)</strong>
              <p className="text-slate-600 text-sm">Ye All-India level ki sabse achhi 10th pass sarkari naukri hai. Isme sirf ek Computer Based Exam (CBT) hota hai aur koi interview nahi hota. Central government ke offices me clerk/attendant ka kaam milta hai.</p>
            </div>
            <div className="bg-green-50/50 p-5 rounded-xl border border-green-100">
              <strong className="text-green-800 text-lg block mb-2">SSC GD Constable</strong>
              <p className="text-slate-600 text-sm">Jo students force line me jana chahte hain (BSF, CRPF, CISF), unke liye ye sabse bada 10th level exam hai. Isme ek basic written exam aur uske baad physical test (daud) hota hai.</p>
            </div>
            <div className="bg-orange-50/50 p-5 rounded-xl border border-orange-100">
              <strong className="text-orange-800 text-lg block mb-2">Railway Group D (Level 1)</strong>
              <p className="text-slate-600 text-sm">Halanki ab isme kuch pado ke liye ITI zaroori kar diya gaya hai, lekin kai non-technical post abhi bhi 10th pass par hain. Ek written exam aur basic physical test (PET) hota hai.</p>
            </div>
            <div className="bg-purple-50/50 p-5 rounded-xl border border-purple-100">
              <strong className="text-purple-800 text-lg block mb-2">Bihar Police Karyalaya Parichari</strong>
              <p className="text-slate-600 text-sm">Bihar sarkar ke vibhinna vibhagon me Karyalaya Parichari ke pado par 10th level ka ek basic samanya gyan aur math ka exam liya jata hai.</p>
            </div>
          </div>
        </section>

        {/* Print Instructions */}
        <section className="bg-slate-800 text-white p-6 rounded-2xl mt-12 print:hidden">
          <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
            <Printer size={24} className="text-blue-400" />
            🖨️ Is List ka PDF Kaise Banayein?
          </h3>
          <p className="text-slate-300 mb-4">
            Aap is puri jankari ko ek click me clean PDF me save kar sakte hain:
          </p>
          <div className="space-y-3 text-sm">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0">1</div>
              <p className="mt-1"><strong>Computer/Laptop Par:</strong> Apne keyboard par <kbd className="bg-slate-700 px-2 py-1 rounded mx-1 text-blue-300">Ctrl + P</kbd> (Mac par Cmd + P) dabayein. Print menu khulne par 'Destination' me <strong>"Save as PDF"</strong> select karein aur Save par click kar dein.</p>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0">2</div>
              <p className="mt-1"><strong>Mobile Phone Par:</strong> Apne browser ke top-right corner me teen dots (Menu) par click karein. Phir <strong>"Share"</strong> par tap karein aur <strong>"Print"</strong> ka option chunein. Wahan se "Save as PDF" select karke apne phone ki memory me save kar lein.</p>
            </div>
          </div>
          <button 
            onClick={() => window.print()}
            className="mt-6 w-full md:w-auto bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Printer size={18} />
            Print / Save as PDF Now
          </button>
        </section>
      </div>
    )
  },
  'ssc-cgl-2026-guide': {
    title: 'SSC CGL 2026 Complete Guide: Preparation Strategy and Books',
    date: '2026-05-30',
    category: 'Exam Tips',
    content: () => (
      <div className="space-y-4 text-slate-700">
        <p>Complete guide for SSC CGL 2026 preparation...</p>
      </div>
    )
  }
};

export function TipDetailPage() {
  const { id } = useParams<{ id: string }>();
  const article = id ? articles[id] : null;

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Article Not Found</h1>
          <Link to="/tips" className="text-academic-blue hover:underline">Return to Tips</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <SEO 
        title={`${article.title} - Update Students`}
        description={`Read about ${article.title} on Update Students.`}
      />
      <div className="print:hidden">
        <Header />
      </div>
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="print:hidden mb-6">
          <Link to="/tips" className="inline-flex items-center gap-2 text-slate-500 hover:text-academic-blue transition-colors font-medium">
            <ArrowLeft size={20} />
            Back to Guides
          </Link>
        </div>

        <motion.article 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-slate-200 print:shadow-none print:border-none print:p-0"
        >
          <div className="flex items-center gap-3 text-sm text-slate-500 mb-4 print:hidden">
            <span className="px-3 py-1 bg-blue-50 text-academic-blue font-bold rounded-lg text-xs">
              {article.category}
            </span>
            <span>{article.date}</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 leading-tight">
            {article.title}
          </h1>
          
          <div className="prose prose-slate max-w-none prose-headings:font-serif">
            <article.content />
          </div>
        </motion.article>
      </main>
    </div>
  );
}
