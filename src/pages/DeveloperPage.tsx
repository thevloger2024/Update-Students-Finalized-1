import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import { Github, Twitter, Instagram, Youtube, Facebook, MessageCircle, Globe, Code, Cpu, Sparkles, Share2, Linkedin, Send, Mail, User, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { db } from '../firebase';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { validateForm } from '../utils/validation';

interface DeveloperProfile {
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
  skills: string[];
  socials: {
    whatsapp?: string;
    youtube?: string;
    github?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
    huggingface?: string;
    linkedin?: string;
  };
}

export function DeveloperPage() {
  const { t } = useLanguage();
  const [profile, setProfile] = useState<DeveloperProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const docRef = doc(db, 'site_settings', 'developer_profile');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as DeveloperProfile);
        }
      } catch (error) {
        console.error("Error fetching developer profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const developerSocials = [
    { icon: MessageCircle, label: "WhatsApp", color: "bg-green-600", url: profile?.socials?.whatsapp || "#" },
    { icon: Youtube, label: "YouTube", color: "bg-red-600", url: profile?.socials?.youtube || "#" },
    { icon: Github, label: "GitHub", color: "bg-slate-900", url: profile?.socials?.github || "#" },
    { icon: Twitter, label: "X (Twitter)", color: "bg-slate-800", url: profile?.socials?.twitter || "#" },
    { icon: Facebook, label: "Facebook", color: "bg-blue-600", url: profile?.socials?.facebook || "#" },
    { icon: Instagram, label: "Instagram", color: "bg-pink-600", url: profile?.socials?.instagram || "#" },
    { icon: Sparkles, label: "Hugging Face", color: "bg-yellow-500", url: profile?.socials?.huggingface || "#" },
    { icon: Linkedin, label: "LinkedIn", color: "bg-blue-700", url: profile?.socials?.linkedin || "#" },
  ].filter(social => social.url !== "#" && social.url !== "");

  const skills = profile?.skills?.length ? profile.skills : ["React", "TypeScript", "Firebase", "Tailwind CSS", "Node.js", "Python", "AI/ML"];

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm('developer-contact-form')) {
      toast.error('⚠️ Please fill in all required fields before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'contact_messages'), {
        ...contactForm,
        createdAt: Date.now(),
        status: 'new'
      });
      toast.success("Message sent successfully! I'll get back to you soon.");
      setContactForm({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-academic-blue"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      
      <main className="flex-1 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden"
          >
            <div className="bg-gradient-to-br from-slate-900 to-academic-blue p-12 text-center text-white relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full opacity-10">
                <Code size={300} className="absolute -top-20 -left-20 rotate-12" />
                <Cpu size={300} className="absolute -bottom-20 -right-20 -rotate-12" />
              </div>
              
              <div className="relative z-10">
                {profile?.imageUrl ? (
                  <div className="w-32 h-32 mx-auto mb-6 rounded-full border-4 border-white/30 shadow-2xl overflow-hidden bg-white">
                    <img src={profile.imageUrl} alt="Developer" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-32 h-32 bg-white/20 backdrop-blur-md rounded-full mx-auto mb-6 flex items-center justify-center border-4 border-white/30 shadow-2xl">
                    <span className="text-2xl font-serif font-bold">MRC.dev</span>
                  </div>
                )}
                <h1 className="text-4xl md:text-5xl font-serif font-bold mb-2">
                  {profile?.name || t('meetTheDeveloper')}
                </h1>
                <p className="text-blue-200 text-lg max-w-2xl mx-auto">
                  {profile?.role || "Building the future of student information systems."}
                </p>
              </div>
            </div>

            <div className="p-8 md:p-12">
              <div className="max-w-2xl mx-auto text-center mb-12">
                <h2 className="text-2xl font-serif font-bold text-academic-blue mb-4">About Me</h2>
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {profile?.bio || t('developerDesc')}
                </p>
              </div>

              <div className="mb-12">
                <h3 className="text-center font-bold text-slate-800 mb-6 uppercase tracking-widest text-sm">Skills & Technologies</h3>
                <div className="flex flex-wrap justify-center gap-3">
                  {skills.map((skill, index) => (
                    <span key={index} className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl border border-slate-100 font-medium hover:bg-academic-blue hover:text-white transition-all cursor-default">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-12 border-t border-slate-100">
                <h3 className="text-center font-bold text-slate-800 mb-8 uppercase tracking-widest text-sm">Connect with Me</h3>
                <div className="flex flex-wrap justify-center gap-4">
                  {developerSocials.map((social, index) => {
                    const Icon = social.icon;
                    return (
                      <a 
                        key={index}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center gap-3 p-4 sm:p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all group min-w-[120px] sm:min-w-[140px]"
                      >
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 ${social.color} text-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                          <Icon size={20} className="sm:w-6 sm:h-6" />
                        </div>
                        <span className="text-[10px] sm:text-xs font-bold text-slate-600">{social.label}</span>
                      </a>
                    );
                  })}
                </div>
              </div>

              <div className="pt-16 mt-12 border-t border-slate-100">
                <div className="max-w-2xl mx-auto">
                  <div className="text-center mb-10">
                    <h3 className="text-2xl font-serif font-bold text-academic-blue mb-2">Get In Touch</h3>
                    <p className="text-slate-500">Have a question or want to collaborate? Send me a message!</p>
                  </div>

                  <form id="developer-contact-form" onSubmit={handleContactSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 field-required">
                          <User size={14} />
                          Full Name
                        </label>
                        <input 
                          type="text"
                          required
                          value={contactForm.name}
                          onChange={e => setContactForm({...contactForm, name: e.target.value})}
                          placeholder="Your Name"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-academic-blue outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 field-required">
                          <Mail size={14} />
                          Email Address
                        </label>
                        <input 
                          type="email"
                          required
                          value={contactForm.email}
                          onChange={e => setContactForm({...contactForm, email: e.target.value})}
                          placeholder="your@email.com"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-academic-blue outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <MessageSquare size={14} />
                        Subject
                      </label>
                      <input 
                        type="text"
                        value={contactForm.subject}
                        onChange={e => setContactForm({...contactForm, subject: e.target.value})}
                        placeholder="What is this about?"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-academic-blue outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 field-required">
                        <MessageCircle size={14} />
                        Message
                      </label>
                      <textarea 
                        required
                        rows={5}
                        value={contactForm.message}
                        onChange={e => setContactForm({...contactForm, message: e.target.value})}
                        placeholder="Your message here..."
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-academic-blue outline-none transition-all resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-academic-blue text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                    >
                      {submitting ? (
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send size={20} />
                          <span>Send Message</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
