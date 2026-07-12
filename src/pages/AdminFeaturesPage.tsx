import { AdminGuidesManager } from '../components/AdminGuidesManager';
import { AdminJobDataManager } from '../components/AdminJobDataManager';
import React, { useState, useEffect, useRef } from 'react';
import { Header } from '../components/Header';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, onSnapshot, limit, updateDoc, getDocs, deleteDoc, orderBy } from 'firebase/firestore';
// import removed
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, LogIn, LogOut, Shield, Settings, Users, Database, ArrowLeft, UserCircle, Upload, Save, BrainCircuit, Trash2, MessageCircle, Linkedin, Mail, CheckCircle2, Clock, ExternalLink, UserCheck, UserMinus, ShieldAlert, Send, MessageSquare, User as UserIcon, Brain , BookOpen, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';
import { TranslatedText } from '../components/TranslatedText';
import { signInWithGoogle, logOut } from '../firebase';
import { useAdminNotifications } from '../hooks/useAdminNotifications';
import { SystemSettingsManager } from '../components/SystemSettingsManager';
import { AdminAIChatbot } from '../components/AdminAIChatbot';
import { WebsiteIntelligencePanel } from '../components/WebsiteIntelligencePanel';

const ADMIN_EMAIL = "thevloger2024@gmail.com";

export function AdminFeaturesPage() {
  const { t } = useLanguage();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const isAdmin = user?.email === ADMIN_EMAIL;
  const { unreadMessages, unreadFeedback } = useAdminNotifications(isAdmin);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<'message' | 'update' | 'quiz' | 'feedback' | null>(null);
  const [deleting, setDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!deleteId || !deleteType) return;
    setDeleting(true);
    try {
      if (deleteType === 'message') {
        await deleteDoc(doc(db, 'contact_messages', deleteId));
        toast.success("Message deleted");
      } else if (deleteType === 'update') {
        await deleteDoc(doc(db, 'updates', deleteId));
        toast.success("Update deleted successfully");
      } else if (deleteType === 'quiz') {
        await deleteDoc(doc(db, 'quizzes', deleteId));
        toast.success(t('quizDeletedSuccess') || "Quiz deleted successfully");
      } else if (deleteType === 'feedback') {
        await deleteDoc(doc(db, 'feedback', deleteId));
        toast.success("Feedback deleted successfully");
      }
    } catch (error) {
      console.error(`Error deleting ${deleteType}:`, error);
      toast.error(`Failed to delete ${deleteType}`);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
      setDeleteId(null);
      setDeleteType(null);
    }
  };

  const handleDeleteRequest = (id: string, type: 'message' | 'update' | 'quiz' | 'feedback') => {
    setDeleteId(id);
    setDeleteType(type);
    setShowDeleteConfirm(true);
  };

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
      id: 'jobdata',
      title: 'Job Data Manager',
      description: 'Manage dynamic jobs list for the job guide view.',
      icon: Briefcase,
      color: "bg-indigo-50 text-indigo-600",
      status: "Active"
    },
    {
      id: 'guides',
      title: 'Job Guides & Tips',
      description: 'Manage static articles, PDF guides, and study tips.',
      icon: BookOpen,
      color: "bg-blue-50 text-blue-600",
      status: "Active"
    },
    {
      id: 'users',
      title: t('userManagement'),
      description: t('userManagementDesc'),
      icon: Users,
      color: "bg-purple-50 text-purple-600",
      status: "Active"
    },
    {
      id: 'feedback',
      title: t('userFeedback') || 'User Feedback',
      description: t('userFeedbackDesc') || 'Manage and respond to user feedback and issues.',
      icon: MessageCircle,
      color: "bg-amber-50 text-amber-600",
      status: "Active",
      badgeCount: unreadFeedback
    },
    {
      id: 'content',
      title: t('contentModeration'),
      description: t('contentModerationDesc'),
      icon: Database,
      color: "bg-blue-50 text-blue-600",
      status: "Active",
      badgeCount: 0
    },
    {
      id: 'system',
      title: t('systemSettings'),
      description: t('systemSettingsDesc'),
      icon: Settings,
      color: "bg-orange-50 text-orange-600",
      status: "Active",
      badgeCount: 0
    },
    {
      id: 'quiz',
      title: t('quizManagement'),
      description: t('quizManagementDesc'),
      icon: BrainCircuit,
      color: "bg-purple-50 text-purple-600",
      status: "Active",
      badgeCount: 0
    },
    {
      id: 'developer',
      title: "Developer Profile",
      description: "Manage the developer profile page content and image.",
      icon: UserCircle,
      color: "bg-green-50 text-green-600",
      status: "Active",
      badgeCount: 0
    },
    {
      id: 'messages',
      title: "Contact Messages",
      description: "Read and manage messages sent from the Meet the Developer page.",
      icon: Mail,
      color: "bg-red-50 text-red-600",
      status: "Active",
      badgeCount: unreadMessages
    },
    {
      id: 'intelligence',
      title: "🧠 Website Intelligence",
      description: "Autonomous AI that monitors, publishes, and manages your website. Uses Google Search to find trending topics and auto-generates posts.",
      icon: Brain,
      color: "bg-gradient-to-br from-blue-50 to-purple-50 text-purple-600",
      status: "Active",
      badgeCount: 0
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
        ) : activeFeature === 'messages' ? (
          <MessageManager onDelete={handleDeleteRequest} />
        ) : activeFeature === 'quiz' ? (
          <AdminQuizManager onDelete={handleDeleteRequest} />
        ) : activeFeature === 'content' ? (
          <ContentModerationManager onDelete={handleDeleteRequest} />
        ) : activeFeature === 'feedback' ? (
          <FeedbackManager onDelete={handleDeleteRequest} />
        ) : activeFeature === 'users' ? (
          <UserManager />
        ) : activeFeature === 'jobdata' ? (
          <AdminJobDataManager />
        ) : activeFeature === 'guides' ? (
          <AdminGuidesManager />
        ) : activeFeature === 'system' ? (
          <SystemSettingsManager />
        ) : activeFeature === 'intelligence' ? (
          <div className="space-y-6">
            <WebsiteIntelligencePanel />
          </div>
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
                  <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform relative`}>
                    <Icon size={28} />
                    {feature.badgeCount && feature.badgeCount > 0 ? (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                        {feature.badgeCount > 9 ? '9+' : feature.badgeCount}
                      </span>
                    ) : null}
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
      {/* 🤖 AI Admin Chatbot */}
      <AdminAIChatbot
        websiteContext={{ adminEmail: ADMIN_EMAIL, page: 'admin-features' }}
        onActionRequest={(action) => {
          console.log('Admin AI action:', action);
          toast.info(`AI action: ${action.type}`, { duration: 3000 });
        }}
      />
      {/* Confirmation Modal */}
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
                <h3 className="text-2xl font-serif font-bold text-slate-800 mb-2">{t('confirmDelete') || 'Confirm Delete'}</h3>
                <p className="text-slate-500 mb-8">
                  Are you sure you want to delete this {deleteType}? This action cannot be undone.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteId(null);
                      setDeleteType(null);
                    }}
                    className="flex-1 px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all"
                  >
                    {t('cancel') || 'Cancel'}
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={deleting}
                    className="flex-1 px-6 py-3 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 shadow-lg shadow-red-100 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {deleting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Trash2 size={18} />
                    )}
                    {t('deleteNow') || 'Delete Now'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MessageManager({ onDelete }: { onDelete: (id: string, type: 'message' | 'update' | 'quiz' | 'feedback') => void }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'contact_messages'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'contact_messages');
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = (id: string) => {
    onDelete(id, 'message');
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'read' ? 'new' : 'read';
    try {
      await updateDoc(doc(db, 'contact_messages', id), { status: newStatus });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `contact_messages/${id}`);
    }
  };

  if (loading) return <div className="py-12 text-center text-slate-500">Loading messages...</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8"
    >
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Contact Messages</h2>
        <p className="text-slate-500">View and manage messages from the Meet the Developer page.</p>
      </div>

      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <Mail size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">No messages yet.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`p-6 rounded-2xl border transition-all ${msg.status === 'new' ? 'bg-blue-50/30 border-blue-100 shadow-sm' : 'bg-white border-slate-100'}`}
            >
              <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${msg.status === 'new' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                    <UserIcon size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{msg.name}</h4>
                    <p className="text-sm text-slate-500 flex items-center gap-1.5">
                      <Mail size={12} />
                      {msg.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(msg.createdAt).toLocaleString()}
                  </span>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => toggleStatus(msg.id, msg.status)}
                      className={`p-2 rounded-lg transition-colors ${msg.status === 'new' ? 'text-blue-600 hover:bg-blue-100' : 'text-slate-400 hover:bg-slate-100'}`}
                      title={msg.status === 'new' ? "Mark as read" : "Mark as unread"}
                    >
                      {msg.status === 'new' ? <Mail size={18} /> : <CheckCircle2 size={18} />}
                    </button>
                    <button 
                      onClick={() => handleDelete(msg.id)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete message"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
              
              {msg.subject && (
                <div className="mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subject</span>
                  <p className="text-sm font-semibold text-slate-700">{msg.subject}</p>
                </div>
              )}
              
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Message</span>
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap mt-1">{msg.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
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
      huggingface: '',
      linkedin: ''
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
              huggingface: data.socials?.huggingface || '',
              linkedin: data.socials?.linkedin || ''
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
                value={profile.name || ''}
                onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-academic-blue focus:border-academic-blue transition-all"
                placeholder="e.g. John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Role / Title</label>
              <input 
                type="text" 
                value={profile.role || ''}
                onChange={(e) => setProfile(prev => ({ ...prev, role: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-academic-blue focus:border-academic-blue transition-all"
                placeholder="e.g. Full Stack Developer"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Bio / About Me</label>
            <textarea 
              value={profile.bio || ''}
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
                    value={profile.socials[key as keyof typeof profile.socials] || ''}
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

function AdminQuizManager({ onDelete }: { onDelete: (id: string, type: 'message' | 'update' | 'quiz' | 'feedback') => void }) {
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

  const handleDeleteQuiz = (id: string) => {
    onDelete(id, 'quiz');
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
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const mimeType = file.type;
      
      const response = await fetch('/api/gemini/extract-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64Data, mimeType, orgName, year })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to extract');
      }

      const questions = Array.isArray(result) ? result : [];
      
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

function ContentModerationManager({ onDelete }: { onDelete: (id: string, type: 'message' | 'update' | 'quiz' | 'feedback') => void }) {
  const { t } = useLanguage();
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUpdates();
  }, []);

  const fetchUpdates = async () => {
    try {
      const q = query(collection(db, 'updates'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUpdates(data);
    } catch (error) {
      console.error("Error fetching updates:", error);
      toast.error("Failed to load updates");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    onDelete(id, 'update');
  };

  const filteredUpdates = updates.filter(u => 
    u.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.organization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="py-12 text-center text-slate-500">Loading updates...</div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
            <Database size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{t('contentModeration')}</h2>
            <p className="text-slate-500">Edit or delete published job updates and content.</p>
          </div>
        </div>
        <div className="relative w-full md:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search updates..."
            className="w-full pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-academic-blue/20 outline-none"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredUpdates.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No updates found.</p>
        ) : (
          filteredUpdates.map(update => (
            <div key={update.id} className="p-4 border border-slate-200 rounded-2xl flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center hover:bg-slate-50 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-blue-100 text-blue-700">
                    {update.type}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(update.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="text-slate-800 font-bold">{update.title}</h4>
                <p className="text-sm text-slate-500">{update.organization}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(`/admin?edit=${update.id}`)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-all"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(update.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  title="Delete Update"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}

function FeedbackManager({ onDelete }: { onDelete: (id: string, type: 'message' | 'update' | 'quiz' | 'feedback') => void }) {
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

  const handleDelete = (id: string) => {
    onDelete(id, 'feedback');
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'read' ? 'new' : 'read';
    try {
      await updateDoc(doc(db, 'feedback', id), { status: newStatus });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `feedback/${id}`);
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
            <div key={feedback.id} className={`p-4 border transition-all rounded-2xl flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center ${feedback.status === 'new' ? 'bg-blue-50/30 border-blue-100 shadow-sm' : 'bg-white border-slate-200'}`}>
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
              <div className="flex items-center gap-2 shrink-0">
                <button 
                  onClick={() => toggleStatus(feedback.id, feedback.status)}
                  className={`p-2 rounded-lg transition-colors ${feedback.status === 'new' ? 'text-blue-600 hover:bg-blue-100' : 'text-slate-400 hover:bg-slate-100'}`}
                  title={feedback.status === 'new' ? "Mark as read" : "Mark as unread"}
                >
                  {feedback.status === 'new' ? <MessageSquare size={18} /> : <CheckCircle2 size={18} />}
                </button>
                <button
                  onClick={() => handleDelete(feedback.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  title="Delete Feedback"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}

function UserManager() {
  const { t } = useLanguage();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'users'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching users:", error);
      setLoading(false);
      try {
        handleFirestoreError(error, OperationType.GET, 'users');
      } catch (e) {
        // Error already logged by handleFirestoreError
      }
    });
    return () => unsubscribe();
  }, []);

  const handleToggleAdmin = async (userId: string, currentRole: string) => {
    try {
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      toast.success(`User role updated to ${newRole}`);
    } catch (error) {
      toast.error("Failed to update user role");
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-slate-500">Loading users...</div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8"
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600">
          <Users size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{t('userManagement')}</h2>
          <p className="text-slate-500">{t('userManagementDesc')}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="py-4 px-4 font-bold text-slate-700">User</th>
              <th className="py-4 px-4 font-bold text-slate-700">Email</th>
              <th className="py-4 px-4 font-bold text-slate-700">Role</th>
              <th className="py-4 px-4 font-bold text-slate-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-500">No users found in the database.</td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold">
                        {user.displayName?.[0] || user.email?.[0] || '?'}
                      </div>
                      <span className="font-medium text-slate-800">{user.displayName || 'Anonymous'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-slate-500">{user.email || 'No email'}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {user.role || 'user'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => handleToggleAdmin(user.id, user.role)}
                      className="text-sm font-bold text-academic-blue hover:underline"
                    >
                      {user.role === 'admin' ? 'Demote to User' : 'Make Admin'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
