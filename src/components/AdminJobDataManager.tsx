import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, getDocs, addDoc, updateDoc, doc, deleteDoc, orderBy } from 'firebase/firestore';
import { Plus, Edit2, Trash2, X, Briefcase, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export interface JobData {
  id?: string;
  title: string;
  category: 'direct' | 'interview' | 'exams';
  level?: string;
  eligibility?: string;
  selection?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function AdminJobDataManager() {
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentJob, setCurrentJob] = useState<Partial<JobData>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const q = query(collection(db, 'jobGuides')); // no orderBy to keep it simple or order by createdAt
      const snapshot = await getDocs(q);
      const jobsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JobData));
      setJobs(jobsData);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (job: JobData | null) => {
    if (job) {
      setCurrentJob(job);
    } else {
      setCurrentJob({ category: 'direct' });
    }
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await deleteDoc(doc(db, 'jobGuides', id));
        toast.success('Job deleted successfully');
        fetchJobs();
      } catch (error) {
        toast.error('Failed to delete job');
      }
    }
  };

  const handleSave = async () => {
    if (!currentJob.title) {
      toast.error('Title is required');
      return;
    }
    setSaving(true);
    try {
      const jobData = {
        ...currentJob,
        createdAt: currentJob.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      if (currentJob.id) {
        await updateDoc(doc(db, 'jobGuides', currentJob.id), jobData);
        toast.success('Job updated successfully');
      } else {
        await addDoc(collection(db, 'jobGuides'), jobData);
        toast.success('Job created successfully');
      }
      setIsEditing(false);
      fetchJobs();
    } catch (error) {
      toast.error('Failed to save job');
    } finally {
      setSaving(false);
    }
  };

  if (isEditing) {
    return (
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Briefcase className="text-blue-500" />
            {currentJob?.id ? 'Edit Job' : 'Add New Job'}
          </h2>
          <button onClick={() => setIsEditing(false)} className="text-slate-500 hover:bg-slate-100 p-2 rounded-full">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select
              className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={currentJob.category}
              onChange={(e) => setCurrentJob({ ...currentJob, category: e.target.value as 'direct' | 'interview' | 'exams' })}
            >
              <option value="direct">Direct Recruitment (Merit-Based)</option>
              <option value="interview">Interview Only</option>
              <option value="exams">Basic Exams</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Job Title</label>
            <input 
              type="text" 
              className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
              value={currentJob.title || ''}
              onChange={(e) => setCurrentJob({ ...currentJob, title: e.target.value })}
            />
          </div>

          {currentJob.category === 'direct' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Level</label>
                <input 
                  type="text" 
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                  value={currentJob.level || ''}
                  onChange={(e) => setCurrentJob({ ...currentJob, level: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Eligibility</label>
                <input 
                  type="text" 
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                  value={currentJob.eligibility || ''}
                  onChange={(e) => setCurrentJob({ ...currentJob, eligibility: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Selection Process</label>
                <textarea 
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none h-24" 
                  value={currentJob.selection || ''}
                  onChange={(e) => setCurrentJob({ ...currentJob, selection: e.target.value })}
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea 
                className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none h-32" 
                value={currentJob.description || ''}
                onChange={(e) => setCurrentJob({ ...currentJob, description: e.target.value })}
              />
            </div>
          )}
          
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setIsEditing(false)} className="px-5 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-xl">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl flex items-center gap-2">
              {saving ? 'Saving...' : 'Save Job'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Briefcase className="text-blue-500" />
            Job Listings Data Manager
          </h2>
          <p className="text-slate-500 text-sm mt-1">Manage dynamic jobs for the Job Guides section.</p>
        </div>
        <button onClick={async () => {
          // SEED DATA
          setLoading(true);
          const directRecruitmentJobs = [
            { title: 'India Post GDS (Gramin Dak Sevak)', level: 'All India & Bihar', eligibility: '10th Pass + Basic Computer', selection: 'Seedhi bharti. 10th class me aaye percentage ke aadhar par merit list banti hai.', category: 'direct' },
            { title: 'Railway Apprentice', level: 'All India & Bihar', eligibility: '10th Pass (min 50%) + ITI', selection: 'Bina exam ki bharti. 10th aur ITI ke marks ko milakar direct merit list banai jati hai.', category: 'direct' },
            { title: 'Bihar Vikas Mitra / Tola Sevak', level: 'Bihar State', eligibility: '10th / Matric Pass', selection: 'Panchayat ya ward level par merit ke aadhar par direct selection (Bina exam).', category: 'direct' },
            { title: 'Anganwadi Sevika / Sahayika', level: 'Bihar State', eligibility: '10th / 8th Pass', selection: 'Sthaniya (local) ward level par marks ke aadhar par merit list banti hai.', category: 'direct' }
          ];
          const interviewOnlyJobs = [
            { title: 'Bihar Vidhan Sabha / Parishad (Group D)', description: 'Vidhan Sabha me Karyalaya Parichari (Peon), Mali (Gardener), aur Darban jaise pado par bharti nikalti hai. Isme educational qualification 10th pass hoti hai aur selection sirf ek direct interview ke aadhar par hota hai.', category: 'interview' },
            { title: 'Various University Peon / Attendant (Bihar)', description: 'Bihar ke kai state universities me Group D ke pado par direct interview se bhartiyan ki jati hain, jisme 10th pass candidates apply kar sakte hain.', category: 'interview' }
          ];
          
          try {
            for (const job of [...directRecruitmentJobs, ...interviewOnlyJobs]) {
              await addDoc(collection(db, 'jobGuides'), { ...job, createdAt: new Date().toISOString() });
            }
            toast.success('Initial data seeded!');
            fetchJobs();
          } catch (e) {
            toast.error('Failed to seed data');
          }
        }} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm mr-2">
          Seed Initial Data
        </button>
        <button onClick={() => handleEdit(null)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm">
          <Plus size={16} />
          Add Job
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading jobs...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-6 text-sm font-semibold text-slate-600">Job Title</th>
                <th className="py-3 px-6 text-sm font-semibold text-slate-600">Category</th>
                <th className="py-3 px-6 text-sm font-semibold text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-slate-500">No jobs added yet.</td>
                </tr>
              ) : jobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6 font-medium text-slate-800">{job.title}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${job.category === 'direct' ? 'bg-green-100 text-green-700' : job.category === 'interview' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                      {job.category === 'direct' ? 'Direct Recruitment' : job.category === 'interview' ? 'Interview Only' : 'Basic Exams'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(job)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(job.id!)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
