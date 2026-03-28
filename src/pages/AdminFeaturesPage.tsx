import React, { useState, useEffect, useRef } from 'react';
import { Header } from '../components/Header';
import { auth, db } from '../firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, LogIn, LogOut, Shield, Settings, Users, Database, ArrowLeft, UserCircle, Upload, Save, BrainCircuit, Trash2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { TranslatedText } from '../components/TranslatedText';
import { signInWithGoogle, logOut } from '../firebase';
import { toast } from 'sonner';

const ADMIN_EMAIL = "thevloger2024@gmail.com";

export function AdminFeaturesPage() {
  const { t } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-academic-blue"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-blue-50 text-academic-blue rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock size={40} />
          </div>
          <h1 className="text-2xl font-serif font-bold text-academic-blue mb-2">{t('adminLogin')}</h1>
          <p className="text-slate-500 mb-8">{t('adminLoginDesc')}</p>
          <button 
            onClick={signInWithGoogle}
            className="w-full bg-academic-blue hover:bg-blue-800 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-100 flex items-center justify-center gap-3 transition-all active:scale-95"
          >
            <LogIn size={20} />
            <span>{t('signInWithGoogle')}</span>
          </button>
        </motion.div>
      </div>
    );
  }

  if (user.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield size={40} className="text-red-500" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-red-600 mb-2">{t('accessDenied')}</h1>
          <p className="text-slate-500 mb-8">
            {t('accessDeniedDesc')} <span className="font-bold text-slate-800">{user.email}</span> {t('noAdminPrivileges')}
          </p>
          <div className="space-y-4">
            <button 
              onClick={logOut}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95"
            >
              <LogOut size={20} />
              <span>{t('signOut')}</span>
            </button>
            <button 
              onClick={() => navigate('/')}
              className="w-full text-academic-blue font-bold py-2 hover:underline transition-all"
            >
              {t('backToHome')}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const features = [
    {
      title: t('userManagement'),
      description: t('userManagementDesc'),
      icon: Users,
      color: "bg-purple-50 text-purple-600",
      status: t('comingSoon')
    },
    {
      id: 'content',
      title: t('contentModeration'),
      description: t('contentModerationDesc'),
      icon: Database,
      color: "bg-blue-50 text-blue-600",
      status: "Active"
    },
    {
      id: 'system',
      title: t('systemSettings'),
      description: t('systemSettingsDesc'),
      icon: Settings,
      color: "bg-orange-50 text-orange-600",
      status: t('comingSoon')
    },
    {
      id: 'quiz',
      title: t('quizManagement'),
      description: t('quizManagementDesc'),
      icon: BrainCircuit,
      color: "bg-purple-50 text-purple-600",
      status: "Active"
    },
    {
      id: 'developer',
      title: "Developer Profile",
      description: "Manage the developer profile page content and image.",
      icon: UserCircle,
      color: "bg-green-50 text-green-600",
      status: "Active"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-academic-blue text-white rounded-2xl shadow-lg shadow-blue-100">
              <Shield size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold text-academic-blue">{t('adminFeatures')}</h1>
              <p className="text-slate-500">{t('adminFeaturesDesc')}</p>
            </div>
          </div>
          <button 
            onClick={() => activeFeature ? setActiveFeature(null) : navigate('/admin')}
            className="flex items-center gap-2 text-slate-500 hover:text-academic-blue font-bold transition-colors"
          >
            <ArrowLeft size={20} />
            <span>{activeFeature ? "Back to Features" : t('backToDashboard')}</span>
          </button>
        </div>

        {activeFeature === 'developer' ? (
          <DeveloperProfileEditor />
        ) : activeFeature === 'quiz' ? (
          <AdminQuizManager />
        ) : activeFeature === 'content' ? (
          <ContentModerationManager />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => feature.status === 'Active' && setActiveFeature(feature.id)}
                  className={`bg-white p-8 rounded-3xl shadow-sm border border-slate-200 transition-shadow relative overflow-hidden group ${feature.status === 'Active' ? 'cursor-pointer hover:shadow-md' : 'opacity-75'}`}
                >
                  <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3">{feature.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6">
                    {feature.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${feature.status === 'Active' ? 'bg-green-100 text-green-700' : 'text-slate-400 bg-slate-50'}`}>
                      {feature.status}
                    </span>
                  </div>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 -mr-12 -mt-12 rounded-full opacity-50 group-hover:scale-150 transition-transform" />
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="mt-12 p-8 bg-academic-blue rounded-3xl text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-serif font-bold mb-4">{t('futureRoadmap')}</h2>
            <p className="text-blue-100 max-w-2xl leading-relaxed">
              {t('futureRoadmapDesc')}
            </p>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 -mr-32 -mt-32 rounded-full" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 -ml-16 -mb-16 rounded-full" />
        </div>
      </main>
    </div>
  );
}

function DeveloperProfileEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profile, setProfile] = useState({
    name: '',
    role: '',
    bio: '',
    imageUrl: '',
    skills: [] as string[],
    socials: {
      whatsapp: '',
      youtube: '',
      github: '',
      twitter: '',
      facebook: '',
      instagram: '',
      huggingface: ''
    }
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const docRef = doc(db, 'site_settings', 'developer_profile');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile({
            name: data.name || '',
            role: data.role || '',
            bio: data.bio || '',
            imageUrl: data.imageUrl || '',
            skills: data.skills || [],
            socials: {
              whatsapp: data.socials?.whatsapp || '',
              youtube: data.socials?.youtube || '',
              github: data.socials?.github || '',
              twitter: data.socials?.twitter || '',
              facebook: data.socials?.facebook || '',
              instagram: data.socials?.instagram || '',
              huggingface: data.socials?.huggingface || ''
            }
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024) { // 500KB limit
        toast.error("Image size must be less than 500KB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const docRef = doc(db, 'site_settings', 'developer_profile');
      await setDoc(docRef, profile);
      toast.success("Developer profile updated successfully");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSocialChange = (key: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      socials: { ...prev.socials, [key]: value }
    }));
  };

  if (loading) {
    return <div className="py-12 text-center text-slate-500">Loading profile data...</div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Developer Profile</h2>
          <p className="text-slate-500">Manage the content displayed on the Meet the Developer page.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-academic-blue text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-800 transition-colors disabled:opacity-50"
        >
          {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={20} />}
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-center">
            <h3 className="font-semibold text-slate-700 mb-4">Profile Image</h3>
            
            <div className="relative w-32 h-32 mx-auto mb-6 rounded-full border-4 border-white shadow-lg overflow-hidden bg-slate-200 flex items-center justify-center group">
              {profile.imageUrl ? (
                <img src={profile.imageUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-serif font-bold text-slate-400">MRC.dev</span>
              )}
              
              <div 
                className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="text-white mb-1" size={24} />
                <span className="text-white text-xs font-medium">Upload</span>
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleImageUpload}
            />
            
            <p className="text-xs text-slate-500 mb-4">Recommended: Square image, max 1MB.</p>
            
            {profile.imageUrl && (
              <button 
                onClick={() => setProfile(prev => ({ ...prev, imageUrl: '' }))}
                className="text-sm text-red-500 hover:text-red-600 font-medium"
              >
                Remove Image
              </button>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Display Name</label>
              <input 
                type="text" 
                value={profile.name}
                onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-academic-blue focus:border-academic-blue transition-all"
                placeholder="e.g. John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Role / Title</label>
              <input 
                type="text" 
                value={profile.role}
                onChange={(e) => setProfile(prev => ({ ...prev, role: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-academic-blue focus:border-academic-blue transition-all"
                placeholder="e.g. Full Stack Developer"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Bio / About Me</label>
            <textarea 
              value={profile.bio}
              onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
              rows={5}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-academic-blue focus:border-academic-blue transition-all resize-none"
              placeholder="Write a short bio..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Skills (comma separated)</label>
            <input 
              type="text" 
              value={profile.skills.join(', ')}
              onChange={(e) => setProfile(prev => ({ ...prev, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-academic-blue focus:border-academic-blue transition-all"
              placeholder="React, TypeScript, Node.js..."
            />
          </div>

          <div className="pt-6 border-t border-slate-100">
            <h3 className="font-semibold text-slate-800 mb-4">Social Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(profile.socials).map((key) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-slate-500 mb-1 capitalize">{key}</label>
                  <input 
                    type="url" 
                    value={profile.socials[key as keyof typeof profile.socials]}
                    onChange={(e) => handleSocialChange(key, e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-academic-blue focus:border-academic-blue transition-all text-sm"
                    placeholder={`https://${key}.com/...`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

import { collection, getDocs, deleteDoc, query, orderBy } from 'firebase/firestore';
import { GoogleGenAI } from '@google/genai';

function AdminQuizManager() {
  const { t } = useLanguage();
  const [organizations, setOrganizations] = useState<string[]>([]);
  const [quizType, setQuizType] = useState<'exam' | 'current_affairs'>('exam');
  const [selectedOrg, setSelectedOrg] = useState('');
  const [year, setYear] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [existingQuizzes, setExistingQuizzes] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchExistingQuizzes = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'quizzes'));
      const qList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setExistingQuizzes(qList);
    } catch (error) {
      console.error("Error fetching existing quizzes:", error);
    }
  };

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'updates'));
        const orgsSet = new Set<string>();
        snapshot.forEach(doc => {
          const data = doc.data();
          if (data.organization) {
            orgsSet.add(data.organization);
          }
        });
        setOrganizations(Array.from(orgsSet).sort());
      } catch (error) {
        console.error("Error fetching organizations:", error);
      }
    };
    fetchOrgs();
    fetchExistingQuizzes();
  }, []);

  const handleDeleteQuiz = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'quizzes', id));
      setExistingQuizzes(prev => prev.filter(q => q.id !== id));
      toast.success(t('quizDeletedSuccess') || "Quiz deleted successfully");
    } catch (error) {
      console.error("Error deleting quiz:", error);
      toast.error("Failed to delete quiz");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleGenerateQuiz = async () => {
    const orgName = quizType === 'current_affairs' ? 'Current Affairs' : selectedOrg;

    if (!orgName || !year || !file) {
      toast.error("Please select organization/type, year, and upload a file.");
      return;
    }

    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const mimeType = file.type;

        const ai = new GoogleGenAI({ apiKey: (import.meta as any).env?.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '' });
        
        const prompt = `Extract up to 90 multiple-choice questions (or all available if less) from this document for the ${orgName} from year ${year}. Return a JSON array of objects. Each object must have: 'question' (string), 'options' (array of exactly 4 strings), and 'correctIndex' (number from 0 to 3 indicating the correct option). Ensure the output is valid JSON.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: [
            { inlineData: { data: base64Data, mimeType } },
            prompt
          ],
          config: { responseMimeType: "application/json" }
        });

        const questions = JSON.parse(response.text);
        
        if (!Array.isArray(questions) || questions.length === 0) {
          throw new Error("Invalid questions format returned from AI.");
        }

        const quizId = `${orgName.replace(/[^a-zA-Z0-9]/g, '_')}_${year}_${Date.now()}`;
        await setDoc(doc(db, 'quizzes', quizId), {
          type: quizType,
          organization: orgName,
          year,
          questions,
          createdAt: Date.now()
        });

        toast.success(t('quizGeneratedSuccess'));
        setFile(null);
        setYear('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchExistingQuizzes();
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error generating quiz:", error);
      toast.error(t('quizGenerationFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8"
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600">
          <BrainCircuit size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{t('quizManagement')}</h2>
          <p className="text-slate-500">{t('quizManagementDesc')}</p>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setQuizType('exam')}
          className={`px-6 py-2 rounded-xl font-medium transition-colors ${quizType === 'exam' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          {t('exam') || 'Organization Exam'}
        </button>
        <button
          onClick={() => setQuizType('current_affairs')}
          className={`px-6 py-2 rounded-xl font-medium transition-colors ${quizType === 'current_affairs' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          {t('currentAffairs') || 'Current Affairs'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {quizType === 'exam' && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{t('organization')}</label>
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
        <div className={quizType === 'current_affairs' ? 'md:col-span-2' : ''}>
          <label className="block text-sm font-medium text-slate-700 mb-2">{t('year')}</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="e.g. 2024"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
          />
        </div>
      </div>

      <div className="mb-8">
        <label className="block text-sm font-medium text-slate-700 mb-2">{t('uploadPdfOrImage')}</label>
        <div 
          className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-10 h-10 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 font-medium mb-1">
            {file ? file.name : "Click to upload PDF or Image"}
          </p>
          <p className="text-sm text-slate-400">
            {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "AI will extract questions automatically"}
          </p>
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="application/pdf,image/*"
            className="hidden"
          />
        </div>
      </div>

      <button
        onClick={handleGenerateQuiz}
        disabled={loading || !year || !file || (quizType === 'exam' && !selectedOrg)}
        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>{t('generatingQuestions')}</span>
          </>
        ) : (
          <>
            <BrainCircuit size={20} />
            <span>{t('generateQuiz')}</span>
          </>
        )}
      </button>

      {existingQuizzes.length > 0 && (
        <div className="mt-12">
          <h3 className="text-xl font-bold text-slate-800 mb-6">{t('generatedQuizzes') || 'Generated Quizzes'}</h3>
          <div className="space-y-4">
            {existingQuizzes.map((quiz) => (
              <div key={quiz.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div>
                  <h4 className="font-semibold text-slate-800">
                    {quiz.type === 'current_affairs' ? 'Current Affairs' : quiz.organization} - {quiz.year}
                  </h4>
                  <p className="text-sm text-slate-500">
                    {quiz.questions?.length || 0} questions • Created {new Date(quiz.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteQuiz(quiz.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title={t('deleteQuiz') || 'Delete Quiz'}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function ContentModerationManager() {
  const { t } = useLanguage();
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const q = query(collection(db, 'feedback'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFeedbacks(data);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      toast.error("Failed to load feedback");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'feedback', id));
      setFeedbacks(prev => prev.filter(f => f.id !== id));
      toast.success("Feedback deleted successfully");
    } catch (error) {
      console.error("Error deleting feedback:", error);
      toast.error("Failed to delete feedback");
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-slate-500">Loading feedback...</div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8"
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
          <Database size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{t('contentModeration')}</h2>
          <p className="text-slate-500">{t('contentModerationDesc')}</p>
        </div>
      </div>

      <div className="space-y-4">
        {feedbacks.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No feedback found.</p>
        ) : (
          feedbacks.map(feedback => (
            <div key={feedback.id} className="p-4 border border-slate-200 rounded-2xl flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 text-xs font-bold uppercase rounded-full ${
                    feedback.type === 'issue' ? 'bg-red-100 text-red-700' :
                    feedback.type === 'suggestion' ? 'bg-amber-100 text-amber-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {feedback.type}
                  </span>
                  <span className="text-sm text-slate-500">
                    {new Date(feedback.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-slate-800 font-medium mb-1">{feedback.message}</p>
                {feedback.userEmail && (
                  <p className="text-sm text-slate-500">From: {feedback.userEmail}</p>
                )}
              </div>
              <button
                onClick={() => handleDelete(feedback.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                title="Delete Feedback"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
