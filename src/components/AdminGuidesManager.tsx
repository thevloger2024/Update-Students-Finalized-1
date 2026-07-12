import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Save, X, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export function AdminGuidesManager() {
  const [guides, setGuides] = useState([
    { id: '10th-pass-direct-recruitment', title: '10th Pass Jobs: Direct Recruitment & Interview Only Jobs (All-India & Bihar)', status: 'Published', date: '2026-07-10' },
    { id: 'ssc-cgl-2026-guide', title: 'SSC CGL 2026 Complete Guide: Preparation Strategy and Books', status: 'Draft', date: '2026-05-30' }
  ]);

  const [isEditing, setIsEditing] = useState(false);
  const [currentGuide, setCurrentGuide] = useState<any>(null);

  const handleEdit = (guide: any) => {
    setCurrentGuide(guide);
    setIsEditing(true);
  };

  const handleSave = () => {
    toast.success('Guide saved successfully!');
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="text-blue-500" />
            {currentGuide?.id ? 'Edit Guide' : 'Create New Guide'}
          </h2>
          <button onClick={() => setIsEditing(false)} className="text-slate-500 hover:bg-slate-100 p-2 rounded-full">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Guide Title</label>
            <input type="text" className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" defaultValue={currentGuide?.title} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Content (Markdown / Text)</label>
            <textarea className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none h-48" defaultValue="Content management will be linked to Firestore..."></textarea>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setIsEditing(false)} className="px-5 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-xl">Cancel</button>
            <button onClick={handleSave} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl flex items-center gap-2">
              <Save size={18} />
              Save Guide
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
            <BookOpen className="text-blue-500" />
            Job Guides & Tips
          </h2>
          <p className="text-slate-500 text-sm mt-1">Manage static articles, tips, and job guides.</p>
        </div>
        <button onClick={() => handleEdit({})} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm">
          <Plus size={16} />
          New Guide
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="py-3 px-6 text-sm font-semibold text-slate-600">Title</th>
              <th className="py-3 px-6 text-sm font-semibold text-slate-600">Status</th>
              <th className="py-3 px-6 text-sm font-semibold text-slate-600">Date</th>
              <th className="py-3 px-6 text-sm font-semibold text-slate-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {guides.map((guide) => (
              <tr key={guide.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-4 px-6">
                  <div className="font-medium text-slate-800">{guide.title}</div>
                  <div className="text-xs text-slate-400 mt-1">ID: {guide.id}</div>
                </td>
                <td className="py-4 px-6">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${guide.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {guide.status}
                  </span>
                </td>
                <td className="py-4 px-6 text-sm text-slate-600">{guide.date}</td>
                <td className="py-4 px-6 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleEdit(guide)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => toast.error('Delete functionality in progress')} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
