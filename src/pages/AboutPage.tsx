import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import { GraduationCap, Target, Users, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export function AboutPage() {
  const { t } = useLanguage();

  const features = [
    {
      icon: Target,
      title: "Accurate Information",
      desc: "We verify every update from official sources before publishing."
    },
    {
      icon: Users,
      title: "Student Focused",
      desc: "Our platform is designed to meet the specific needs of students."
    },
    {
      icon: ShieldCheck,
      title: "Secure & Reliable",
      desc: "Your data and preferences are stored securely with us."
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
            <div className="bg-academic-blue p-12 text-center text-white relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full opacity-10">
                <GraduationCap size={300} className="absolute -top-20 -left-20 rotate-12" />
              </div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 relative z-10">
                {t('aboutUs')}
              </h1>
              <p className="text-blue-100 text-lg max-w-2xl mx-auto relative z-10">
                {t('aboutDesc')}
              </p>
            </div>

            <div className="p-8 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="text-center p-6 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="w-12 h-12 bg-academic-blue/10 text-academic-blue rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Icon size={24} />
                      </div>
                      <h3 className="font-bold text-slate-800 mb-2">{feature.title}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
                    </div>
                  );
                })}
              </div>

              <div className="prose prose-slate max-w-none">
                <h2 className="text-2xl font-serif font-bold text-academic-blue mb-4">Our Vision</h2>
                <p className="text-slate-600 mb-6">
                  We envision a world where every student has equal access to educational opportunities. By providing a centralized platform for all academic updates, we aim to bridge the information gap and help students make informed decisions about their future.
                </p>
                
                <h2 className="text-2xl font-serif font-bold text-academic-blue mb-4">What We Offer</h2>
                <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-6">
                  <li>Real-time notifications for latest job openings.</li>
                  <li>Direct links to official admit cards and results.</li>
                  <li>Curated list of scholarships for various academic levels.</li>
                  <li>Step-by-step guides to help you apply for different forms.</li>
                  <li>State-wise filtering to find updates relevant to your region.</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
