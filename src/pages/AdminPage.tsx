import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { UpdateData, ApplicationFee, PostVacancy } from '../components/UpdateCard';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs, deleteDoc, doc, updateDoc, writeBatch, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Plus, Trash2, Users, LayoutDashboard, Briefcase, FileText, CheckCircle, Save, AlertCircle, Search, Filter, ArrowUpDown, ArrowUp, ArrowDown, ExternalLink, Lock, LogIn, LogOut, Settings, Shield, Star, CheckSquare, Square, Edit, X, Image as ImageIcon, PlusCircle, MinusCircle, Upload, ChevronRight, ChevronDown, Eye, Sparkles, Share2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { signInWithGoogle, logOut } from '../firebase';
import { formatDate } from '../contexts/utils';
import { GoogleGenAI } from "@google/genai";
import { useLanguage } from '../contexts/LanguageContext';
import { TranslatedText } from '../components/TranslatedText';

const ADMIN_EMAIL = "thevloger2024@gmail.com";

interface UpdateForm {
  title: string;
  type: 'job' | 'admit_card' | 'result' | 'scholarship';
  category: string;
  state: string;
  organization: string;
  description: string;
  startDate?: string;
  endDate?: string;
  updateDate?: string;
  releaseDate?: string;
  posts?: number;
  ageLimit?: string;
  ageLimitNotice?: string;
  eligibilityNotice?: string;
  officialUrl?: string;
  requiredDocuments: string[];
  applicationFees: ApplicationFee[];
  postVacancies: PostVacancy[];
  featured: boolean;
  thumbnail?: string;
  steps?: {
    text: string;
    image?: string;
  }[];
}

const INITIAL_FORM: UpdateForm = {
  title: '',
  type: 'job',
  category: '',
  state: '',
  organization: '',
  description: '',
  startDate: '',
  endDate: '',
  updateDate: '',
  releaseDate: '',
  posts: undefined,
  ageLimit: '',
  ageLimitNotice: '',
  eligibilityNotice: '',
  officialUrl: '',
  requiredDocuments: [],
  applicationFees: [],
  postVacancies: [],
  featured: false,
  thumbnail: '',
  steps: [],
};

interface SocialLink {
  id: string;
  platform: string;
  displayName: string;
  url: string;
}

export function AdminPage() {
  const { t } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isBatchDelete, setIsBatchDelete] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedThumbnails, setGeneratedThumbnails] = useState<string[]>([]);
  const [form, setForm] = useState<UpdateForm>(INITIAL_FORM);
  const [updates, setUpdates] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'updates' | 'social'>('updates');
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [socialForm, setSocialForm] = useState<Omit<SocialLink, 'id'>>({
    platform: 'WhatsApp',
    displayName: '',
    url: ''
  });
  const [editingSocialId, setEditingSocialId] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && currentUser.email === ADMIN_EMAIL) {
        fetchUpdates();
        fetchSocialLinks();
        
        // Check for edit query param
        const params = new URLSearchParams(window.location.search);
        const editId = params.get('edit');
        if (editId) {
          handleEditById(editId);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleEditById = async (id: string) => {
    try {
      const docRef = doc(db, 'updates', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setForm({
          title: data.title || '',
          type: data.type || 'job',
          category: data.category || '',
          state: data.state || '',
          organization: data.organization || '',
          description: data.description || '',
          startDate: data.startDate || '',
          endDate: data.endDate || '',
          updateDate: data.updateDate || '',
          releaseDate: data.releaseDate || '',
          posts: data.posts,
          ageLimit: data.ageLimit || '',
          ageLimitNotice: data.ageLimitNotice || '',
          eligibilityNotice: data.eligibilityNotice || '',
          officialUrl: data.officialUrl || '',
          requiredDocuments: data.requiredDocuments || [],
          applicationFees: data.applicationFees || [],
          postVacancies: data.postVacancies || [],
          featured: data.featured || false,
          thumbnail: data.thumbnail || '',
          steps: data.steps || [],
        });
        setEditingId(id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      console.error("Error fetching update for edit:", error);
      toast.error("Failed to load update for editing");
    }
  };

  const fetchUpdates = async () => {
    try {
      const q = query(collection(db, 'updates'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUpdates(data);
    } catch (error) {
      console.error("Error fetching updates:", error);
    }
  };

  const fetchSocialLinks = async () => {
    try {
      const q = query(collection(db, 'social_links'), orderBy('platform', 'asc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as SocialLink[];
      setSocialLinks(data);
    } catch (error) {
      console.error("Error fetching social links:", error);
      handleFirestoreError(error, OperationType.GET, 'social_links');
    }
  };

  const handleSocialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingSocialId) {
        await updateDoc(doc(db, 'social_links', editingSocialId), socialForm);
        toast.success(t('socialLinkUpdated'));
      } else {
        await addDoc(collection(db, 'social_links'), socialForm);
        toast.success(t('socialLinkAdded'));
      }
      setSocialForm({ platform: 'WhatsApp', displayName: '', url: '' });
      setEditingSocialId(null);
      fetchSocialLinks();
    } catch (error) {
      toast.error(t('failedSaveSocialLink'));
    } finally {
      setSubmitting(false);
    }
  };

  const deleteSocialLink = async (id: string) => {
    if (!confirm(t('confirmDeleteSocial'))) return;
    try {
      await deleteDoc(doc(db, 'social_links', id));
      toast.success(t('socialLinkDeleted'));
      fetchSocialLinks();
    } catch (error) {
      toast.error(t('failedDeleteSocialLink'));
    }
  };

  const filteredAndSortedUpdates = updates
    .filter(update => {
      const matchesSearch = update.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          update.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          update.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || update.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredAndSortedUpdates.length && filteredAndSortedUpdates.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAndSortedUpdates.map(u => u.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id) 
        : [...prev, id]
    );
  };

  const handleBatchDelete = () => {
    if (selectedIds.length === 0) return;
    setIsBatchDelete(true);
    setDeleteId(null);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setSubmitting(true);
    try {
      if (isBatchDelete) {
        const batch = writeBatch(db);
        selectedIds.forEach(id => {
          batch.delete(doc(db, 'updates', id));
        });
        await batch.commit();
        toast.success(t('batchDeleteSuccess').replace('{count}', selectedIds.length.toString()));
        setSelectedIds([]);
      } else if (deleteId) {
        await deleteDoc(doc(db, 'updates', deleteId));
        toast.success(t('updateDeleted'));
      }
      fetchUpdates();
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error(t('failedDelete'));
    } finally {
      setSubmitting(false);
      setShowDeleteConfirm(false);
      setDeleteId(null);
      setIsBatchDelete(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSubmitting(true);
    try {
      // Prepare form data: handle numeric conversion and ensure optional fields are handled correctly
      const updateData = {
        ...form,
        title: form.title.trim(),
        category: form.category.trim(),
        state: form.state.trim().toLowerCase(),
        organization: form.organization.trim(),
        posts: form.posts ? Number(form.posts) : null,
        updatedAt: Date.now(),
        // Ensure type is explicitly set from form
        type: form.type || 'job',
      };

      if (editingId) {
        await updateDoc(doc(db, 'updates', editingId), updateData);
        toast.success(t('updateModifiedSuccess'));
      } else {
        await addDoc(collection(db, 'updates'), {
          ...updateData,
          createdAt: Date.now(),
        });
        toast.success(t('updatePublishedSuccess'));
      }
      
      setForm(INITIAL_FORM);
      setEditingId(null);
      fetchUpdates();
    } catch (error) {
      console.error("Error publishing update:", error);
      toast.error(t('failedPublish'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (update: any) => {
    setEditingId(update.id);
    setForm({
      title: update.title || '',
      type: update.type || 'job',
      category: update.category || '',
      state: update.state || '',
      organization: update.organization || '',
      description: update.description || '',
      startDate: update.startDate || '',
      endDate: update.endDate || '',
      updateDate: update.updateDate || '',
      releaseDate: update.releaseDate || '',
      posts: update.posts,
      ageLimit: update.ageLimit || '',
      ageLimitNotice: update.ageLimitNotice || '',
      eligibilityNotice: update.eligibilityNotice || '',
      officialUrl: update.officialUrl || '',
      requiredDocuments: update.requiredDocuments || [],
      applicationFees: update.applicationFees || [],
      postVacancies: update.postVacancies || [],
      featured: !!update.featured,
      thumbnail: update.thumbnail || '',
      steps: update.steps || [],
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.info(t('editingUpdate'));
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(INITIAL_FORM);
    toast.info(t('formReset'));
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsBatchDelete(false);
    setShowDeleteConfirm(true);
  };

  const handleToggleFeatured = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'updates', id), {
        featured: !currentStatus,
        updatedAt: Date.now()
      });
      toast.success(!currentStatus ? t('markedFeatured') : t('removedFeatured'));
      fetchUpdates();
    } catch (error) {
      console.error("Error toggling featured status:", error);
      toast.error(t('failedUpdate'));
    }
  };

  const compressImage = (file: File, maxWidth = 800, quality = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (maxWidth / width) * height;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const compressed = await compressImage(file, 1200, 0.6);
      setForm(prev => ({ ...prev, thumbnail: compressed }));
      toast.success(t('thumbnailUploaded'));
      
      // Generate variations
      generateAIVariations(compressed);
    } catch (error) {
      toast.error(t('failedProcessImage'));
    }
  };

  const generateAIVariations = async (baseImage: string) => {
    if (!process.env.GEMINI_API_KEY) {
      toast.error(t('geminiKeyMissing'));
      return;
    }
    
    setIsGenerating(true);
    setGeneratedThumbnails([]);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const base64Data = baseImage.split(',')[1];
      const mimeType = baseImage.split(';')[0].split(':')[1];

      const prompts = [
        'Generate a variation of this thumbnail with a different color palette but keeping the same professional theme.',
        'Generate a variation of this thumbnail with a more modern and minimalist layout.',
        'Generate a variation of this thumbnail with more vibrant and energetic visual elements.'
      ];

      const results = await Promise.all(prompts.map(prompt => 
        ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType: mimeType,
                },
              },
              {
                text: prompt,
              },
            ],
          },
        })
      ));

      const newThumbnails: string[] = [];
      results.forEach(response => {
        if (response.candidates?.[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
              newThumbnails.push(`data:image/png;base64,${part.inlineData.data}`);
            }
          }
        }
      });
      
      if (newThumbnails.length > 0) {
        setGeneratedThumbnails(newThumbnails);
        toast.success(t('aiVariationsGenerated'));
      } else {
        toast.error(t('noAiVariations'));
      }
    } catch (error) {
      console.error("AI Generation error:", error);
      toast.error(t('failedAiVariations'));
    } finally {
      setIsGenerating(false);
    }
  };

  const generateDefaultThumbnail = async () => {
    if (!form.title || !form.category) {
      toast.error(t('enterTitleCategory'));
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      toast.error(t('geminiKeyMissing'));
      return;
    }

    setIsGenerating(true);
    setGeneratedThumbnails([]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const prompts = [
        `Generate a professional thumbnail for a ${form.category} update titled "${form.title}". Style: Modern, clean, and corporate.`,
        `Generate a professional thumbnail for a ${form.category} update titled "${form.title}". Style: Vibrant, energetic, and eye-catching.`,
        `Generate a professional thumbnail for a ${form.category} update titled "${form.title}". Style: Minimalist, elegant, and academic.`
      ];

      const results = await Promise.all(prompts.map(prompt => 
        ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [{ text: prompt }],
          },
          config: {
            imageConfig: {
              aspectRatio: "16:9",
            }
          }
        })
      ));

      const newThumbnails: string[] = [];
      results.forEach(response => {
        if (response.candidates?.[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
              newThumbnails.push(`data:image/png;base64,${part.inlineData.data}`);
            }
          }
        }
      });

      if (newThumbnails.length > 0) {
        setGeneratedThumbnails(newThumbnails);
        toast.success(t('defaultThumbnailsGenerated'));
      } else {
        toast.error(t('failedDefaultThumbnail'));
      }
    } catch (error) {
      console.error("AI Generation error:", error);
      toast.error(t('failedDefaultThumbnail'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStepImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const compressed = await compressImage(file, 800, 0.6);
      const newSteps = [...(form.steps || [])];
      newSteps[index] = { ...newSteps[index], image: compressed };
      setForm(prev => ({ ...prev, steps: newSteps }));
      toast.success(t('stepImageUploaded').replace('{index}', (index + 1).toString()));
    } catch (error) {
      toast.error(t('failedProcessImage'));
    }
  };

  const addStep = () => {
    setForm(prev => ({
      ...prev,
      steps: [...(prev.steps || []), { text: '', image: '' }]
    }));
  };

  const removeStep = (index: number) => {
    setForm(prev => ({
      ...prev,
      steps: (prev.steps || []).filter((_, i) => i !== index)
    }));
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const steps = [...(form.steps || [])];
    if (direction === 'up' && index > 0) {
      [steps[index], steps[index - 1]] = [steps[index - 1], steps[index]];
    } else if (direction === 'down' && index < steps.length - 1) {
      [steps[index], steps[index + 1]] = [steps[index + 1], steps[index]];
    }
    setForm(prev => ({ ...prev, steps }));
  };

  const updateStepText = (index: number, text: string) => {
    const newSteps = [...(form.steps || [])];
    newSteps[index] = { ...newSteps[index], text };
    setForm(prev => ({ ...prev, steps: newSteps }));
  };

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

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-academic-blue text-white rounded-2xl">
            <LayoutDashboard size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold text-academic-blue">{t('adminDashboard')}</h1>
            <p className="text-slate-500">{t('adminDashboardDesc')}</p>
          </div>
          <button 
            onClick={() => navigate('/admin/features')}
            className="ml-auto flex items-center gap-2 bg-white border-2 border-academic-blue/10 text-academic-blue px-6 py-3 rounded-2xl font-bold hover:bg-academic-blue hover:text-white transition-all shadow-sm active:scale-95"
          >
            <Settings size={20} />
            <span>{t('adminFeatures')}</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-8 bg-white p-1.5 rounded-2xl border border-slate-200 w-fit">
          <button
            onClick={() => setActiveTab('updates')}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'updates' ? 'bg-academic-blue text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            {t('manageUpdates')}
          </button>
          <button
            onClick={() => setActiveTab('social')}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'social' ? 'bg-academic-blue text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            {t('manageSocialLinks')}
          </button>
        </div>

        {activeTab === 'updates' ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  {editingId ? <Edit size={20} className="text-academic-blue" /> : <Plus size={20} className="text-academic-blue" />}
                  {editingId ? t('editUpdate') : t('addNewUpdate')}
                </h2>
                {editingId && (
                  <button 
                    onClick={resetForm}
                    className="text-sm font-bold text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                  >
                    <X size={16} />
                    {t('cancelEdit')}
                  </button>
                )}
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3">
                  <AlertCircle size={20} className="text-academic-blue shrink-0 mt-0.5" />
                  <div className="text-sm text-slate-600">
                    <p className="font-bold text-academic-blue mb-1">{t('importantNote')}</p>
                    <p>{t('adminStateNote')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 uppercase tracking-wider">{t('title')}</label>
                    <input 
                      required
                      type="text"
                      placeholder="e.g. RRB NTPC Recruitment 2024"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-academic-blue outline-none transition-all"
                      value={form.title}
                      onChange={e => setForm({...form, title: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 uppercase tracking-wider flex items-center justify-between">
                      <span>{t('thumbnailImage')}</span>
                      <button 
                        type="button"
                        onClick={generateDefaultThumbnail}
                        disabled={isGenerating}
                        className="text-[10px] font-bold text-academic-blue hover:text-blue-800 flex items-center gap-1 transition-all disabled:opacity-50"
                      >
                        <Sparkles size={12} className={isGenerating ? "animate-pulse" : ""} />
                        {t('generateWithAI')}
                      </button>
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="relative w-full">
                        <input 
                          type="file"
                          accept="image/*"
                          onChange={handleThumbnailUpload}
                          className="hidden"
                          id="thumbnail-upload"
                        />
                        <label 
                          htmlFor="thumbnail-upload"
                          className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border-2 border-dashed border-slate-200 hover:border-academic-blue hover:bg-blue-50 cursor-pointer transition-all"
                        >
                          <Upload size={18} className="text-slate-400" />
                          <span className="text-sm text-slate-600 font-medium">
                            {form.thumbnail ? t('changeThumbnail') : t('uploadThumbnail')}
                          </span>
                        </label>
                      </div>
                      {form.thumbnail && (
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                          <img src={form.thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => setForm(prev => ({ ...prev, thumbnail: '' }))}
                            className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl-lg"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* AI Generated Variations */}
                    <AnimatePresence>
                      {(isGenerating || generatedThumbnails.length > 0) && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 overflow-hidden"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="text-xs font-bold text-blue-800 flex items-center gap-1.5">
                              <Sparkles size={14} />
                              {isGenerating ? t('aiGenerating') : t('selectAIVariation')}
                            </h5>
                            {generatedThumbnails.length > 0 && (
                              <button 
                                onClick={() => setGeneratedThumbnails([])}
                                className="text-[10px] text-slate-400 hover:text-slate-600"
                              >
                                {t('clear')}
                              </button>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-3 gap-3">
                            {isGenerating ? (
                              Array(3).fill(0).map((_, i) => (
                                <div key={i} className="aspect-video bg-blue-100/50 rounded-lg animate-pulse border border-blue-200/50" />
                              ))
                            ) : (
                              generatedThumbnails.map((thumb, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => {
                                    setForm(prev => ({ ...prev, thumbnail: thumb }));
                                    setGeneratedThumbnails([]);
                                    toast.success("AI thumbnail selected!");
                                  }}
                                  className="group relative aspect-video rounded-lg overflow-hidden border-2 border-transparent hover:border-academic-blue transition-all"
                                >
                                  <img src={thumb} alt={`AI Variation ${i+1}`} className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <span className="text-[10px] font-bold text-white bg-academic-blue px-2 py-1 rounded-full">{t('select')}</span>
                                  </div>
                                </button>
                              ))
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 uppercase tracking-wider">{t('type')}</label>
                    <select 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-academic-blue outline-none transition-all bg-white"
                      value={form.type}
                      onChange={e => setForm({...form, type: e.target.value as any})}
                    >
                      <option value="job">{t('jobs')}</option>
                      <option value="admit_card">{t('admitCard')}</option>
                      <option value="result">{t('results')}</option>
                      <option value="scholarship">{t('scholarships')}</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 uppercase tracking-wider">{t('category')}</label>
                    <select 
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-academic-blue outline-none transition-all bg-white"
                      value={form.category}
                      onChange={e => setForm({...form, category: e.target.value})}
                    >
                      <option value="">{t('selectCategory')}</option>
                      <option value="RRB">RRB</option>
                      <option value="SSC">SSC</option>
                      <option value="UPSC">UPSC</option>
                      <option value="Banking">Banking</option>
                      <option value="Railway">Railway</option>
                      <option value="Police">Police</option>
                      <option value="Teaching">Teaching</option>
                      <option value="Defence">Defence</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 uppercase tracking-wider">{t('stateRegion')}</label>
                    <input 
                      required
                      type="text"
                      placeholder="e.g. All India, Bihar"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-academic-blue outline-none transition-all"
                      value={form.state}
                      onChange={e => setForm({...form, state: e.target.value})}
                    />
                    <p className="text-[10px] text-slate-400 italic">{t('stateSelectionNotice')}</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 uppercase tracking-wider">{t('organization')}</label>
                    <input 
                      required
                      type="text"
                      placeholder="e.g. Railway Recruitment Board"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-academic-blue outline-none transition-all"
                      value={form.organization}
                      onChange={e => setForm({...form, organization: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 uppercase tracking-wider">{t('totalPosts')}</label>
                    <input 
                      type="number"
                      placeholder="e.g. 1200"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-academic-blue outline-none transition-all"
                      value={form.posts || ''}
                      onChange={e => setForm({...form, posts: e.target.value ? Number(e.target.value) : undefined})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600 uppercase tracking-wider">{t('descriptionDetails')}</label>
                  <textarea 
                    required
                    rows={4}
                    placeholder="Full details about the update..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-academic-blue outline-none transition-all resize-none"
                    value={form.description}
                    onChange={e => setForm({...form, description: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 uppercase tracking-wider">{t('officialUrl')}</label>
                    <input 
                      type="url"
                      placeholder="https://..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-academic-blue outline-none transition-all"
                      value={form.officialUrl || ''}
                      onChange={e => setForm({...form, officialUrl: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 uppercase tracking-wider">{t('ageLimit')}</label>
                    <input 
                      type="text"
                      placeholder="e.g. 18-30 Years"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-academic-blue outline-none transition-all"
                      value={form.ageLimit || ''}
                      onChange={e => setForm({...form, ageLimit: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 uppercase tracking-wider">{t('ageLimitNoticeDate')}</label>
                    <input 
                      type="date"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-academic-blue outline-none transition-all"
                      value={form.ageLimitNotice || ''}
                      onChange={e => setForm({...form, ageLimitNotice: e.target.value})}
                    />
                    <p className="text-[10px] text-slate-400 italic">{t('ageLimitNotice')}</p>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-slate-600 uppercase tracking-wider">{t('eligibilityNoticeText')}</label>
                    <input 
                      type="text"
                      placeholder="e.g. Students whose age is completed by 01/01/2026 are eligible."
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-academic-blue outline-none transition-all"
                      value={form.eligibilityNotice || ''}
                      onChange={e => setForm({...form, eligibilityNotice: e.target.value})}
                    />
                    <p className="text-[10px] text-slate-400 italic">This notice will appear in a green tray on the website.</p>
                  </div>
                </div>

                {/* Required Documents Section */}
                <div className="space-y-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                      <FileText size={18} className="text-academic-blue" />
                      {t('requiredDocuments')}
                    </label>
                    <button
                      type="button"
                      onClick={() => setForm({
                        ...form,
                        requiredDocuments: [...(form.requiredDocuments || []), '']
                      })}
                      className="flex items-center gap-2 text-sm font-bold text-academic-blue hover:text-blue-800 transition-colors"
                    >
                      <PlusCircle size={18} />
                      {t('addDocument')}
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {form.requiredDocuments?.map((doc, index) => (
                      <div key={index} className="flex gap-2">
                        <div className="flex-1 relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                            {index + 1}.
                          </span>
                          <input
                            type="text"
                            placeholder={t('documentPlaceholder')}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-academic-blue outline-none transition-all"
                            value={doc}
                            onChange={(e) => {
                              const newDocs = [...(form.requiredDocuments || [])];
                              newDocs[index] = e.target.value;
                              setForm({ ...form, requiredDocuments: newDocs });
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newDocs = form.requiredDocuments?.filter((_, i) => i !== index);
                            setForm({ ...form, requiredDocuments: newDocs });
                          }}
                          className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          title={t('removeDocument')}
                        >
                          <MinusCircle size={20} />
                        </button>
                      </div>
                    ))}
                    {(!form.requiredDocuments || form.requiredDocuments.length === 0) && (
                      <p className="text-center py-4 text-slate-400 text-sm italic">
                        No documents added yet.
                      </p>
                    )}
                  </div>
                </div>

                {/* Application Fees Section */}
                <div className="space-y-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                      <Plus size={18} className="text-academic-blue" />
                      {t('applicationFee')}
                    </label>
                    <button
                      type="button"
                      onClick={() => setForm({
                        ...form,
                        applicationFees: [...(form.applicationFees || []), { category: '', fee: '' }]
                      })}
                      className="flex items-center gap-2 text-sm font-bold text-academic-blue hover:text-blue-800 transition-colors"
                    >
                      <PlusCircle size={18} />
                      {t('addFee')}
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {form.applicationFees?.map((item, index) => (
                      <div key={index} className="flex flex-col sm:flex-row gap-2 p-3 bg-white rounded-xl border border-slate-200 sm:border-none sm:p-0 sm:bg-transparent">
                        <input
                          type="text"
                          placeholder={t('category')}
                          className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-academic-blue outline-none transition-all"
                          value={item.category}
                          onChange={(e) => {
                            const newFees = [...(form.applicationFees || [])];
                            newFees[index] = { ...newFees[index], category: e.target.value };
                            setForm({ ...form, applicationFees: newFees });
                          }}
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder={t('fee')}
                            className="flex-1 sm:w-32 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-academic-blue outline-none transition-all"
                            value={item.fee}
                            onChange={(e) => {
                              const newFees = [...(form.applicationFees || [])];
                              newFees[index] = { ...newFees[index], fee: e.target.value };
                              setForm({ ...form, applicationFees: newFees });
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newFees = form.applicationFees?.filter((_, i) => i !== index);
                              setForm({ ...form, applicationFees: newFees });
                            }}
                            className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all shrink-0"
                          >
                            <MinusCircle size={20} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {(!form.applicationFees || form.applicationFees.length === 0) && (
                      <p className="text-center py-4 text-slate-400 text-sm italic">
                        No application fees added yet.
                      </p>
                    )}
                  </div>
                </div>

                {/* Post-wise Vacancies Section */}
                <div className="space-y-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                      <Users size={18} className="text-academic-blue" />
                      {t('postVacancies')}
                    </label>
                    <button
                      type="button"
                      onClick={() => setForm({
                        ...form,
                        postVacancies: [...(form.postVacancies || []), { postName: '', count: 0 }]
                      })}
                      className="flex items-center gap-2 text-sm font-bold text-academic-blue hover:text-blue-800 transition-colors"
                    >
                      <PlusCircle size={18} />
                      {t('addPost')}
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {form.postVacancies?.map((item, index) => (
                      <div key={index} className="flex flex-col sm:flex-row gap-2 p-3 bg-white rounded-xl border border-slate-200 sm:border-none sm:p-0 sm:bg-transparent">
                        <input
                          type="text"
                          placeholder={t('postName')}
                          className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-academic-blue outline-none transition-all"
                          value={item.postName}
                          onChange={(e) => {
                            const newPosts = [...(form.postVacancies || [])];
                            newPosts[index] = { ...newPosts[index], postName: e.target.value };
                            setForm({ ...form, postVacancies: newPosts });
                          }}
                        />
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder={t('vacancies')}
                            className="flex-1 sm:w-32 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-academic-blue outline-none transition-all"
                            value={item.count}
                            onChange={(e) => {
                              const newPosts = [...(form.postVacancies || [])];
                              newPosts[index] = { ...newPosts[index], count: parseInt(e.target.value) || 0 };
                              setForm({ ...form, postVacancies: newPosts });
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newPosts = form.postVacancies?.filter((_, i) => i !== index);
                              setForm({ ...form, postVacancies: newPosts });
                            }}
                            className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all shrink-0"
                          >
                            <MinusCircle size={20} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {(!form.postVacancies || form.postVacancies.length === 0) && (
                      <p className="text-center py-4 text-slate-400 text-sm italic">
                        No post-wise vacancies added yet.
                      </p>
                    )}
                  </div>
                </div>

                {/* Step-by-Step Guide Section */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <ImageIcon size={20} className="text-academic-blue" />
                      {t('stepsToApply')}
                    </h3>
                    <div className="flex items-center gap-4">
                      {form.steps && form.steps.length > 0 && (
                        <button 
                          type="button"
                          onClick={() => setShowPreview(true)}
                          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-academic-blue transition-colors"
                        >
                          <Eye size={18} />
                          {t('preview')}
                        </button>
                      )}
                      <button 
                        type="button"
                        onClick={addStep}
                        className="flex items-center gap-2 text-sm font-bold text-academic-blue hover:text-blue-800 transition-colors"
                      >
                        <PlusCircle size={18} />
                        {t('addStep')}
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    {form.steps?.map((step, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-6 bg-slate-50 rounded-2xl border border-slate-200 relative group"
                      >
                        <button 
                          type="button"
                          onClick={() => removeStep(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MinusCircle size={16} />
                        </button>
                        
                        <div className="flex items-center gap-3 mb-4">
                          <span className="w-8 h-8 bg-academic-blue text-white rounded-full flex items-center justify-center font-bold text-sm">
                            {index + 1}
                          </span>
                          <h4 className="font-bold text-slate-700">{t('step')} {index + 1} {t('instructions')}</h4>
                          
                          <div className="flex items-center gap-1 ml-auto mr-8">
                            <button
                              type="button"
                              onClick={() => moveStep(index, 'up')}
                              disabled={index === 0}
                              className="p-1.5 text-slate-400 hover:text-academic-blue hover:bg-blue-50 rounded-lg transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                              title={t('moveUp')}
                            >
                              <ArrowUp size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveStep(index, 'down')}
                              disabled={index === (form.steps?.length || 0) - 1}
                              className="p-1.5 text-slate-400 hover:text-academic-blue hover:bg-blue-50 rounded-lg transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                              title={t('moveDown')}
                            >
                              <ArrowDown size={16} />
                            </button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">{t('instructions')}</label>
                            <textarea 
                              rows={3}
                              placeholder="Describe what to do in this step..."
                              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-academic-blue outline-none transition-all resize-none bg-white"
                              value={step.text}
                              onChange={e => updateStepText(index, e.target.value)}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">{t('stepImage')}</label>
                            <div className="flex items-center gap-4">
                              <div className="relative w-full">
                                <input 
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleStepImageUpload(index, e)}
                                  className="hidden"
                                  id={`step-upload-${index}`}
                                />
                                <label 
                                  htmlFor={`step-upload-${index}`}
                                  className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border-2 border-dashed border-slate-200 hover:border-academic-blue hover:bg-blue-50 cursor-pointer transition-all bg-white"
                                >
                                  <Upload size={18} className="text-slate-400" />
                                  <span className="text-sm text-slate-600 font-medium">
                                    {step.image ? t('changeImage') : t('uploadImage')}
                                  </span>
                                </label>
                              </div>
                              {step.image && (
                                <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                                  <img src={step.image} alt={`Step ${index + 1}`} className="w-full h-full object-cover" />
                                  <button 
                                    type="button"
                                    onClick={() => {
                                      const newSteps = [...(form.steps || [])];
                                      newSteps[index] = { ...newSteps[index], image: '' };
                                      setForm(prev => ({ ...prev, steps: newSteps }));
                                    }}
                                    className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl-lg"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    
                    {(!form.steps || form.steps.length === 0) && (
                      <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 italic text-sm">
                        {t('noStepsAdded')}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-yellow-50/50 border border-academic-gold/20 rounded-xl">
                  <input 
                    type="checkbox"
                    id="featured"
                    className="w-5 h-5 rounded border-slate-300 text-academic-gold focus:ring-academic-gold"
                    checked={form.featured}
                    onChange={e => setForm({...form, featured: e.target.checked})}
                  />
                  <label htmlFor="featured" className="text-sm font-bold text-slate-700 flex items-center gap-2 cursor-pointer">
                    <Star size={16} className={form.featured ? "text-academic-gold" : "text-slate-400"} fill={form.featured ? "currentColor" : "none"} />
                    {t('markAsFeatured')}
                  </label>
                  <p className="text-[10px] text-slate-500 ml-auto italic">{t('featuredNotice')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">{t('startDate')}</label>
                    <input 
                      type="date" 
                      className="w-full p-2 text-sm border rounded-lg" 
                      value={form.startDate || ''}
                      onChange={e => setForm({...form, startDate: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">{t('endDate')}</label>
                    <input 
                      type="date" 
                      className="w-full p-2 text-sm border rounded-lg" 
                      value={form.endDate || ''}
                      onChange={e => setForm({...form, endDate: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">{t('updateDate')}</label>
                    <input 
                      type="date" 
                      className="w-full p-2 text-sm border rounded-lg" 
                      value={form.updateDate || ''}
                      onChange={e => setForm({...form, updateDate: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">{t('releaseDate')}</label>
                    <input 
                      type="date" 
                      className="w-full p-2 text-sm border rounded-lg" 
                      value={form.releaseDate || ''}
                      onChange={e => setForm({...form, releaseDate: e.target.value})} 
                    />
                  </div>
                </div>

                  <div className="flex flex-wrap gap-4">
                    <button 
                      type="submit"
                      disabled={submitting}
                      className="flex-1 bg-academic-blue hover:bg-blue-800 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-100 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                      {submitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          {editingId ? <Save size={20} /> : <CheckCircle size={20} />}
                          <span>{editingId ? t('saveChanges') : t('publishUpdate')}</span>
                        </>
                      )}
                    </button>
                    {editingId && (
                      <button 
                        type="button"
                        onClick={resetForm}
                        className="px-6 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-4 rounded-2xl transition-all active:scale-[0.98]"
                      >
                        {t('cancel')}
                      </button>
                    )}
                  </div>
              </form>
            </div>

            {/* Updates List Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <LayoutDashboard size={20} className="text-academic-blue" />
                    {t('manageUpdates')}
                  </h2>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text"
                        placeholder={t('searchUpdates')}
                        className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-academic-blue outline-none w-full md:w-64"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <select 
                      className="px-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-academic-blue outline-none bg-white"
                      value={filterType}
                      onChange={e => setFilterType(e.target.value)}
                    >
                      <option value="all">{t('allTypes')}</option>
                      <option value="job">{t('jobs')}</option>
                      <option value="admit_card">{t('admitCard')}</option>
                      <option value="result">{t('results')}</option>
                      <option value="scholarship">{t('scholarships')}</option>
                    </select>
                  </div>
                </div>
                
                {selectedIds.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center justify-between"
                  >
                    <span className="text-sm font-bold text-red-700">
                      {selectedIds.length} {t('itemsSelected')}
                    </span>
                    <button 
                      onClick={handleBatchDelete}
                      className="flex items-center gap-2 px-4 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-all"
                    >
                      <Trash2 size={14} />
                      {t('deleteSelected')}
                    </button>
                  </motion.div>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-6 py-4 w-10">
                        <button onClick={toggleSelectAll} className="text-slate-400 hover:text-academic-blue transition-colors">
                          {selectedIds.length === filteredAndSortedUpdates.length && filteredAndSortedUpdates.length > 0 
                            ? <CheckSquare size={20} className="text-academic-blue" /> 
                            : <Square size={20} />
                          }
                        </button>
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-academic-blue transition-colors" onClick={() => toggleSort('title')}>
                        <div className="flex items-center gap-1">
                          {t('title')}
                          <ArrowUpDown size={12} className={sortField === 'title' ? "text-academic-blue" : "text-slate-300"} />
                        </div>
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-academic-blue transition-colors" onClick={() => toggleSort('type')}>
                        <div className="flex items-center gap-1">
                          {t('type')}
                          <ArrowUpDown size={12} className={sortField === 'type' ? "text-academic-blue" : "text-slate-300"} />
                        </div>
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-academic-blue transition-colors" onClick={() => toggleSort('organization')}>
                        <div className="flex items-center gap-1">
                          {t('organization')}
                          <ArrowUpDown size={12} className={sortField === 'organization' ? "text-academic-blue" : "text-slate-300"} />
                        </div>
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-academic-blue transition-colors" onClick={() => toggleSort('createdAt')}>
                        <div className="flex items-center gap-1">
                          {t('date')}
                          <ArrowUpDown size={12} className={sortField === 'createdAt' ? "text-academic-blue" : "text-slate-300"} />
                        </div>
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAndSortedUpdates.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                          {t('noUpdatesFound')}
                        </td>
                      </tr>
                    ) : (
                      filteredAndSortedUpdates.map((update) => (
                        <tr key={update.id} className={`hover:bg-slate-50/50 transition-colors ${editingId === update.id ? 'bg-blue-50/30' : ''}`}>
                          <td className="px-6 py-4">
                            <button onClick={() => toggleSelect(update.id)} className="text-slate-400 hover:text-academic-blue transition-colors">
                              {selectedIds.includes(update.id) 
                                ? <CheckSquare size={20} className="text-academic-blue" /> 
                                : <Square size={20} />
                              }
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {update.thumbnail && (
                                <img src={update.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                              )}
                              <div>
                                <p className="font-bold text-slate-700 line-clamp-1">{update.title}</p>
                                <div className="flex items-center gap-2">
                                  {update.featured && (
                                    <span className="flex items-center gap-0.5 text-[10px] font-bold text-academic-gold bg-yellow-50 px-1.5 py-0.5 rounded">
                                      <Star size={10} fill="currentColor" />
                                      {t('featured')}
                                    </span>
                                  )}
                                  <span className="text-[10px] text-slate-400">{update.category}</span>
                                  <span className="text-[10px] text-slate-400 bg-slate-100 px-1 rounded uppercase">{update.state}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                              update.type === 'job' ? 'bg-blue-100 text-blue-700' :
                              update.type === 'admit_card' ? 'bg-amber-100 text-amber-700' :
                              update.type === 'result' ? 'bg-green-100 text-green-700' :
                              'bg-purple-100 text-purple-700'
                            }`}>
                              {t(update.type)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-600 text-sm">{update.organization}</td>
                          <td className="px-6 py-4 text-slate-400 text-xs">
                            {update.createdAt ? formatDate(update.createdAt) : 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <a 
                                href={`/update/${update.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-slate-400 hover:text-academic-blue transition-colors"
                                title={t('viewOnSite')}
                              >
                                <ExternalLink size={18} />
                              </a>
                              <button 
                                onClick={() => handleToggleFeatured(update.id, !!update.featured)}
                                className={`p-2 transition-colors ${update.featured ? 'text-academic-gold hover:text-slate-400' : 'text-slate-300 hover:text-academic-gold'}`}
                                title={update.featured ? t('removeFeatured') : t('markFeatured')}
                              >
                                <Star size={18} fill={update.featured ? "currentColor" : "none"} />
                              </button>
                              <button 
                                onClick={() => handleEdit(update)}
                                className="p-2 text-slate-400 hover:text-academic-blue transition-colors"
                                title={t('edit')}
                              >
                                <Edit size={18} />
                              </button>
                              <button 
                                onClick={() => handleDelete(update.id)}
                                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                title={t('delete')}
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar / Recent Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <AlertCircle size={18} className="text-academic-gold" />
                {t('quickStats')}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">{t('totalUpdates')}</p>
                  <p className="text-2xl font-bold text-academic-blue">{updates.length}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">{t('jobs')}</p>
                  <p className="text-2xl font-bold text-blue-600">{updates.filter(u => u.type === 'job').length}</p>
                </div>
              </div>
            </div>

            <div className="bg-academic-blue rounded-3xl p-6 text-white">
              <h3 className="font-bold mb-2">{t('adminSecurity')}</h3>
              <p className="text-xs text-blue-100 leading-relaxed">
                {t('adminSecurityNotice')}
              </p>
            </div>
          </div>
        </div>
      </>
    ) : (
      <div className="space-y-8">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Share2 size={20} className="text-academic-blue" />
                {editingSocialId ? t('editSocialLink') : t('addNewSocialLink')}
              </h2>
              
              <form onSubmit={handleSocialSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600 uppercase tracking-wider">{t('platform')}</label>
                  <select 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-academic-blue outline-none transition-all bg-white"
                    value={socialForm.platform}
                    onChange={e => setSocialForm({...socialForm, platform: e.target.value})}
                  >
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="X (Twitter)">X (Twitter)</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Instagram">Instagram</option>
                    <option value="YouTube">YouTube</option>
                    <option value="GitHub">GitHub</option>
                    <option value="Hugging Face">Hugging Face</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600 uppercase tracking-wider">{t('displayName')}</label>
                  <input 
                    required
                    type="text"
                    placeholder="e.g. My Channel Name"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-academic-blue outline-none transition-all"
                    value={socialForm.displayName}
                    onChange={e => setSocialForm({...socialForm, displayName: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600 uppercase tracking-wider">{t('url')}</label>
                  <input 
                    required
                    type="url"
                    placeholder="https://..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-academic-blue outline-none transition-all"
                    value={socialForm.url}
                    onChange={e => setSocialForm({...socialForm, url: e.target.value})}
                  />
                </div>

                <div className="md:col-span-3 flex gap-4">
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-academic-blue hover:bg-blue-800 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-100 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {submitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={20} />}
                    <span>{editingSocialId ? t('updateLink') : t('addLink')}</span>
                  </button>
                  {editingSocialId && (
                    <button 
                      type="button"
                      onClick={() => {
                        setEditingSocialId(null);
                        setSocialForm({ platform: 'WhatsApp', displayName: '', url: '' });
                      }}
                      className="px-8 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all"
                    >
                      {t('cancel')}
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-8 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Share2 size={20} className="text-academic-blue" />
                  {t('activeSocialLinks')}
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('platform')}</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('displayName')}</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('url')}</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {socialLinks.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">
                          {t('noSocialLinksFound')}
                        </td>
                      </tr>
                    ) : (
                      socialLinks.map((link) => (
                        <tr key={link.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-700">{link.platform}</td>
                          <td className="px-6 py-4 text-slate-600">{link.displayName}</td>
                          <td className="px-6 py-4 text-slate-400 text-sm truncate max-w-xs">{link.url}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => {
                                  setEditingSocialId(link.id);
                                  setSocialForm({ platform: link.platform, displayName: link.displayName, url: link.url });
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="p-2 text-slate-400 hover:text-academic-blue transition-colors"
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                onClick={() => deleteSocialLink(link.id)}
                                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirm(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden"
            >
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trash2 size={40} />
                </div>
                <h3 className="text-2xl font-serif font-bold text-slate-800 mb-2">{t('confirmDelete')}</h3>
                <p className="text-slate-500 mb-8">
                  {isBatchDelete 
                    ? t('batchDeleteConfirm').replace('{count}', selectedIds.length.toString())
                    : t('deleteConfirm')}
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteId(null);
                      setIsBatchDelete(false);
                    }}
                    className="flex-1 px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 shadow-lg shadow-red-100 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Trash2 size={18} />
                    )}
                    {t('deleteNow')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {showPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPreview(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Eye size={22} className="text-academic-blue" />
                  {t('guidePreview')}
                </h3>
                <button 
                  onClick={() => setShowPreview(false)}
                  className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <X size={20} className="text-slate-500" />
                </button>
              </div>
              
              <div className="p-8 overflow-y-auto custom-scrollbar">
                <div className="space-y-0 relative">
                  <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-slate-100 hidden md:block"></div>
                  
                  {form.steps?.map((step, index) => (
                    <div key={index} className="relative pl-0 md:pl-12 pb-12 last:pb-0">
                      <div className="absolute left-0 md:left-[0px] top-0 w-8 h-8 bg-academic-blue text-white rounded-full flex items-center justify-center font-bold shadow-md z-10">
                        {index + 1}
                      </div>
                      
                      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all">
                        <p className="text-slate-700 leading-relaxed whitespace-pre-wrap mb-4">
                          {step.text || <span className="text-slate-300 italic">{t('noInstructions')}</span>}
                        </p>
                        
                        {step.image && (
                          <div className="rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
                            <img 
                              src={step.image} 
                              alt={`${t('step')} ${index + 1}`} 
                              className="w-full h-auto max-h-[400px] object-contain mx-auto"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                <button 
                  onClick={() => setShowPreview(false)}
                  className="px-6 py-2 bg-academic-blue text-white font-bold rounded-xl hover:bg-blue-800 transition-all"
                >
                  {t('closePreview')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
