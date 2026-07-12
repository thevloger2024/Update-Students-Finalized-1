import React, { useState, useEffect } from 'react';
import { Download, Briefcase, CheckCircle2, BookOpen, GraduationCap, Clock } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { db } from '../firebase';
import { collection, query, getDocs } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

export function JobGuideSection() {
  const [directRecruitmentJobs, setDirectRecruitmentJobs] = useState<any[]>([]);
  const [interviewOnlyJobs, setInterviewOnlyJobs] = useState<any[]>([]);
  const [basicExamJobs, setBasicExamJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'direct' | 'interview' | 'exams'>('direct');

  useEffect(() => {
    fetchJobs();
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const fetchJobs = async () => {
    try {
      const q = query(collection(db, 'jobGuides'));
      const snapshot = await getDocs(q);
      const jobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      
      setDirectRecruitmentJobs(jobs.filter(job => job.category === 'direct'));
      setInterviewOnlyJobs(jobs.filter(job => job.category === 'interview'));
      setBasicExamJobs(jobs.filter(job => job.category === 'exams'));
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    let yPos = 20;

    doc.setFontSize(16);
    doc.text('Job Guides & Information', 14, yPos);
    yPos += 10;
    
    const printCategory = (title, data) => {
      if(data.length === 0) return;
      doc.setFontSize(14);
      doc.text(title, 14, yPos);
      yPos += 10;
      doc.setFontSize(10);
      data.forEach(job => {
        doc.setFont('helvetica', 'bold');
        doc.text(`Job Title: ${job.title}`, 14, yPos);
        yPos += 6;
        doc.setFont('helvetica', 'normal');
        if (job.level) {
          doc.text(`Level: ${job.level}`, 14, yPos);
          yPos += 6;
        }
        if (job.eligibility) {
          doc.text(`Eligibility: ${job.eligibility}`, 14, yPos);
          yPos += 6;
        }
        if (job.selection) {
          const splitSelection = doc.splitTextToSize(`Selection: ${job.selection}`, 180);
          doc.text(splitSelection, 14, yPos);
          yPos += (splitSelection.length * 6) + 4;
        }
        if (job.description) {
          const splitDesc = doc.splitTextToSize(`Description: ${job.description}`, 180);
          doc.text(splitDesc, 14, yPos);
          yPos += (splitDesc.length * 6) + 4;
        }
        
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
      });
      yPos += 4;
    };

    printCategory('1. Direct Recruitment (Merit-Based)', directRecruitmentJobs);
    printCategory('2. Interview Only Jobs', interviewOnlyJobs);
    printCategory('3. Basic Exams', basicExamJobs);

    doc.save('job-guides.pdf');
  };

  if (loading) {
    return (
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center text-slate-500">
        Loading Job Guides...
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Job Guide & Preparation</h2>
          <p className="text-slate-600 mt-1">Explore different recruitment types and required exams.</p>
        </div>
        <button 
          onClick={downloadPDF}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-academic-blue hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm shrink-0"
        >
          <Download size={18} />
          <span>Download PDF</span>
        </button>
      </div>

      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
        {[
          { id: 'direct', label: 'Direct Recruitment', icon: CheckCircle2, activeColor: 'text-green-700', activeBg: 'bg-green-100 border-green-200' },
          { id: 'interview', label: 'Interview-Only', icon: Briefcase, activeColor: 'text-blue-700', activeBg: 'bg-blue-100 border-blue-200' },
          { id: 'exams', label: 'Basic Exams', icon: GraduationCap, activeColor: 'text-purple-700', activeBg: 'bg-purple-100 border-purple-200' }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors duration-300 ${
                isActive ? tab.activeColor : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabBg"
                  className={`absolute inset-0 rounded-xl border shadow-sm ${tab.activeBg}`}
                  initial={false}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              {!isActive && (
                <div className="absolute inset-0 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors" />
              )}
              <div className="relative z-10 flex items-center gap-2">
                <Icon size={16} className={isActive ? 'opacity-100' : 'text-slate-400'} />
                {tab.label}
              </div>
            </button>
          );
        })}
      </div>

      <div className="min-h-[300px]">
        <AnimatePresence mode="wait">
          {activeTab === 'direct' && (
            <motion.div
              key="direct"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {directRecruitmentJobs.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No direct recruitment jobs available.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {directRecruitmentJobs.map((job, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-lg text-slate-900">{job.title}</h4>
                        {(job.updatedAt || job.createdAt) && (
                          <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md shrink-0">
                            <Clock size={12} />
                            <span>{formatDate(job.updatedAt || job.createdAt)}</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2 text-sm text-slate-600">
                        {job.level && <p><span className="font-semibold text-slate-700">Level:</span> {job.level}</p>}
                        {job.eligibility && <p><span className="font-semibold text-slate-700">Eligibility:</span> {job.eligibility}</p>}
                        {job.selection && <p><span className="font-semibold text-slate-700">Selection:</span> {job.selection}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'interview' && (
            <motion.div
              key="interview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {interviewOnlyJobs.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No interview-only jobs available.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {interviewOnlyJobs.map((job, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-lg text-slate-900">{job.title}</h4>
                        {(job.updatedAt || job.createdAt) && (
                          <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md shrink-0">
                            <Clock size={12} />
                            <span>{formatDate(job.updatedAt || job.createdAt)}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">{job.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
          
          {activeTab === 'exams' && (
            <motion.div
              key="exams"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {basicExamJobs.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No basic exam jobs available.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {basicExamJobs.map((job, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-lg text-slate-900">{job.title}</h4>
                        {(job.updatedAt || job.createdAt) && (
                          <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md shrink-0">
                            <Clock size={12} />
                            <span>{formatDate(job.updatedAt || job.createdAt)}</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2 text-sm text-slate-600">
                        {job.eligibility && <p><span className="font-semibold text-slate-700">Eligibility:</span> {job.eligibility}</p>}
                        {job.description && <p className="leading-relaxed"><span className="font-semibold text-slate-700">Details:</span> {job.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
