const fs = require('fs');

const code = `import React, { useState, useEffect } from 'react';
import { Download, Briefcase, CheckCircle2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { db } from '../firebase';
import { collection, query, getDocs } from 'firebase/firestore';

export function JobGuideSection() {
  const [directRecruitmentJobs, setDirectRecruitmentJobs] = useState<any[]>([]);
  const [interviewOnlyJobs, setInterviewOnlyJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const q = query(collection(db, 'jobGuides'));
      const snapshot = await getDocs(q);
      const jobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const direct = jobs.filter(job => job.category === 'direct');
      const interview = jobs.filter(job => job.category === 'interview');
      
      setDirectRecruitmentJobs(direct);
      setInterviewOnlyJobs(interview);
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
    doc.text('10th Pass Jobs: Direct Recruitment & Interview Only', 14, yPos);
    yPos += 10;

    doc.setFontSize(14);
    doc.text('1. Direct Recruitment (Merit-Based)', 14, yPos);
    yPos += 10;

    doc.setFontSize(10);
    directRecruitmentJobs.forEach(job => {
      doc.setFont('helvetica', 'bold');
      doc.text(\`Job Title: \${job.title}\`, 14, yPos);
      yPos += 6;

      doc.setFont('helvetica', 'normal');
      doc.text(\`Level: \${job.level || 'N/A'}\`, 14, yPos);
      yPos += 6;
      doc.text(\`Eligibility: \${job.eligibility || 'N/A'}\`, 14, yPos);
      yPos += 6;
      
      const splitSelection = doc.splitTextToSize(\`Selection: \${job.selection || 'N/A'}\`, 180);
      doc.text(splitSelection, 14, yPos);
      yPos += (splitSelection.length * 6) + 4;
      
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
    });

    yPos += 4;
    doc.setFontSize(14);
    doc.text('2. Interview Only Jobs', 14, yPos);
    yPos += 10;

    doc.setFontSize(10);
    interviewOnlyJobs.forEach(job => {
      doc.setFont('helvetica', 'bold');
      doc.text(\`Job Title: \${job.title}\`, 14, yPos);
      yPos += 6;

      doc.setFont('helvetica', 'normal');
      
      const splitDesc = doc.splitTextToSize(\`Description: \${job.description || 'N/A'}\`, 180);
      doc.text(splitDesc, 14, yPos);
      yPos += (splitDesc.length * 6) + 6;
      
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
    });

    doc.save('10th-pass-jobs-guide.pdf');
  };

  if (loading) {
    return (
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center text-slate-500">
        Loading Job Guides...
      </div>
    );
  }

  return (
    <div className="space-y-8 bg-slate-50 p-6 rounded-2xl border border-slate-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Job Guide for 10th Pass</h2>
          <p className="text-slate-600 mt-1">Direct recruitment and interview-based jobs list.</p>
        </div>
        <button 
          onClick={downloadPDF}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-academic-blue hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm"
        >
          <Download size={18} />
          <span>Download as PDF</span>
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
            <CheckCircle2 className="text-green-600" size={24} />
            Direct Recruitment (Merit-Based)
          </h3>
          {directRecruitmentJobs.length === 0 ? (
            <p className="text-slate-500">No direct recruitment jobs available.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {directRecruitmentJobs.map((job, idx) => (
                <div key={idx} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                  <h4 className="font-bold text-lg text-slate-900 mb-2">{job.title}</h4>
                  <div className="space-y-2 text-sm text-slate-600">
                    <p><span className="font-semibold text-slate-700">Level:</span> {job.level}</p>
                    <p><span className="font-semibold text-slate-700">Eligibility:</span> {job.eligibility}</p>
                    <p><span className="font-semibold text-slate-700">Selection:</span> {job.selection}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
            <Briefcase className="text-blue-600" size={24} />
            Interview-Only Jobs
          </h3>
          {interviewOnlyJobs.length === 0 ? (
            <p className="text-slate-500">No interview-only jobs available.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {interviewOnlyJobs.map((job, idx) => (
                <div key={idx} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                  <h4 className="font-bold text-lg text-slate-900 mb-2">{job.title}</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">{job.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/components/JobGuideSection.tsx', code);
