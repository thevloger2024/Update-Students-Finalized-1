import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import { Mail, MessageCircle, Facebook, Twitter, Instagram, Youtube, MapPin, Phone, Github, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

interface SocialLink {
  id: string;
  platform: string;
  displayName: string;
  url: string;
}

export function ContactPage() {
  const { t } = useLanguage();
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'social_links'), orderBy('platform', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const links = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as SocialLink[];
      setSocialLinks(links);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'social_links');
    });
    return () => unsubscribe();
  }, []);

  const getIcon = (platform: string) => {
    switch (platform) {
      case 'Facebook': return <Facebook size={20} />;
      case 'X (Twitter)': return <Twitter size={20} />;
      case 'Instagram': return <Instagram size={20} />;
      case 'YouTube': return <Youtube size={20} />;
      case 'GitHub': return <Github size={20} />;
      case 'WhatsApp': return <MessageCircle size={20} />;
      default: return <Share2 size={20} />;
    }
  };

  const getColor = (platform: string) => {
    switch (platform) {
      case 'Facebook': return "bg-blue-600";
      case 'X (Twitter)': return "bg-slate-800";
      case 'Instagram': return "bg-pink-600";
      case 'YouTube': return "bg-red-600";
      case 'GitHub': return "bg-slate-900";
      case 'WhatsApp': return "bg-green-600";
      default: return "bg-academic-blue";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      
      <main className="flex-1 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="bg-academic-blue p-12 text-white">
                <h1 className="text-4xl font-serif font-bold mb-6">{t('contactUs')}</h1>
                <p className="text-blue-100 mb-12 leading-relaxed">
                  {t('contactDesc')}
                </p>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                      <Mail size={24} />
                    </div>
                    <div>
                      <p className="text-blue-200 text-sm">Email Us</p>
                      <p className="font-bold">support@updatestudents.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                      <Phone size={24} />
                    </div>
                    <div>
                      <p className="text-blue-200 text-sm">Call Us</p>
                      <p className="font-bold">+91 12345 67890</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <p className="text-blue-200 text-sm">Our Location</p>
                      <p className="font-bold">New Delhi, India</p>
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-12 border-t border-white/10">
                  <h3 className="font-bold mb-4">{t('followUs')}</h3>
                  <div className="flex flex-wrap gap-3">
                    {socialLinks.map((social) => (
                      <a 
                        key={social.id}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-10 h-10 ${getColor(social.platform)} rounded-lg flex items-center justify-center hover:scale-110 transition-transform`}
                        title={social.platform}
                      >
                        {getIcon(social.platform)}
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-12">
                <h2 className="text-2xl font-serif font-bold text-academic-blue mb-8">Send us a Message</h2>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Full Name</label>
                      <input 
                        type="text" 
                        placeholder="John Doe"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-academic-blue outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Email Address</label>
                      <input 
                        type="email" 
                        placeholder="john@example.com"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-academic-blue outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Subject</label>
                    <input 
                      type="text" 
                      placeholder="How can we help?"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-academic-blue outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Message</label>
                    <textarea 
                      rows={5}
                      placeholder="Your message here..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-academic-blue outline-none transition-all resize-none"
                    ></textarea>
                  </div>
                  <button className="w-full py-4 bg-academic-blue text-white font-bold rounded-xl hover:bg-blue-800 transition-all shadow-lg shadow-blue-200">
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
