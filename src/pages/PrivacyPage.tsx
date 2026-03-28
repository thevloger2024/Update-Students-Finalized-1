import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import { Shield, Lock, Eye, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export function PrivacyPage() {
  const { t } = useLanguage();

  const sections = [
    {
      icon: Eye,
      title: "Information We Collect",
      content: "We collect information you provide directly to us, such as when you create an account, save updates, or contact us for support. This may include your name, email address, and preferences."
    },
    {
      icon: Lock,
      title: "How We Use Your Information",
      content: "We use the information we collect to provide, maintain, and improve our services, to communicate with you, and to personalize your experience on Update Students."
    },
    {
      icon: Shield,
      title: "Data Security",
      content: "We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction."
    }
  ];

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
            <div className="bg-slate-900 p-12 text-center text-white relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full opacity-10">
                <Shield size={300} className="absolute -top-20 -right-20 -rotate-12" />
              </div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 relative z-10">
                {t('privacyPolicy')}
              </h1>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto relative z-10">
                {t('privacyDesc')}
              </p>
            </div>

            <div className="p-8 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {sections.map((section, index) => {
                  const Icon = section.icon;
                  return (
                    <div key={index} className="text-center p-6 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="w-12 h-12 bg-slate-900/10 text-slate-900 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Icon size={24} />
                      </div>
                      <h3 className="font-bold text-slate-800 mb-2">{section.title}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">{section.content}</p>
                    </div>
                  );
                })}
              </div>

              <div className="prose prose-slate max-w-none">
                <h2 className="text-2xl font-serif font-bold text-slate-800 mb-4">Detailed Policy</h2>
                <p className="text-slate-600 mb-6">
                  Last updated: March 27, 2026. This Privacy Policy describes our policies and procedures on the collection, use and disclosure of your information when you use the Service and tells you about your privacy rights and how the law protects you.
                </p>
                
                <h3 className="text-xl font-bold text-slate-800 mb-4">Cookies and Tracking</h3>
                <p className="text-slate-600 mb-6">
                  We use cookies and similar tracking technologies to track the activity on our Service and store certain information. Tracking technologies used are beacons, tags, and scripts to collect and track information and to improve and analyze our Service.
                </p>

                <h3 className="text-xl font-bold text-slate-800 mb-4">Third-Party Services</h3>
                <p className="text-slate-600 mb-6">
                  We may use third-party Service Providers to monitor and analyze the use of our Service. These third parties have access to your Personal Data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.
                </p>

                <h3 className="text-xl font-bold text-slate-800 mb-4">Contact Us</h3>
                <p className="text-slate-600">
                  If you have any questions about this Privacy Policy, you can contact us at privacy@updatestudents.com.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
