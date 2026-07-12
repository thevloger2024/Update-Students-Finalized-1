const fs = require('fs');

let code = fs.readFileSync('src/components/JobGuideSection.tsx', 'utf8');

code = code.replace(
  "import { Download, Briefcase, CheckCircle2, BookOpen, GraduationCap } from 'lucide-react';",
  "import { Download, Briefcase, CheckCircle2, BookOpen, GraduationCap, Clock } from 'lucide-react';"
);

const fetchJobsOld = `  const fetchJobs = async () => {`;
const fetchJobsNew = `  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const fetchJobs = async () => {`;

code = code.replace(fetchJobsOld, fetchJobsNew);

const cardDirectOld = `<h4 className="font-bold text-lg text-slate-900 mb-2">{job.title}</h4>`;
const cardDirectNew = `<div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-lg text-slate-900">{job.title}</h4>
                        {(job.updatedAt || job.createdAt) && (
                          <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md shrink-0">
                            <Clock size={12} />
                            <span>{formatDate(job.updatedAt || job.createdAt)}</span>
                          </div>
                        )}
                      </div>`;

code = code.replaceAll(cardDirectOld, cardDirectNew);

fs.writeFileSync('src/components/JobGuideSection.tsx', code);
