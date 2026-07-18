import React, { useState } from 'react';
import { useTheme, UITheme } from '../contexts/ThemeContext';
import { Palette, Sun, Moon, Zap, CloudFog, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export function AdminUIThemeManager() {
  const { theme, setThemeGlobal } = useTheme();
  const [isSaving, setIsSaving] = useState(false);

  const themeOptions: { id: UITheme; name: string; icon: React.ReactNode; desc: string }[] = [
    { 
      id: 'bright', 
      name: 'Bright (Default)', 
      icon: <Sun size={24} />, 
      desc: 'Clean, light, standard view with blue accents.' 
    },
    { 
      id: 'dark3d', 
      name: 'Dark 3D', 
      icon: <Moon size={24} />, 
      desc: 'Deep dark mode with prominent 3D shadows.' 
    },
    { 
      id: 'animation', 
      name: 'Animation', 
      icon: <Zap size={24} />, 
      desc: 'Dynamic animated background with soft pulse.' 
    },
    { 
      id: 'smoothBlurry', 
      name: 'Smooth Blurry', 
      icon: <CloudFog size={24} />, 
      desc: 'Glassmorphism style with blurred backgrounds.' 
    }
  ];

  const handleApplyTheme = async (newTheme: UITheme) => {
    setIsSaving(true);
    const toastId = toast.loading('Applying new UI theme globally...');
    try {
      await setThemeGlobal(newTheme);
      toast.success('Website UI theme updated successfully!', { id: toastId });
    } catch (e) {
      toast.error('Failed to update theme', { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-serif font-bold text-academic-blue flex items-center gap-2">
              <Palette size={28} />
              Website UI Design Manager
            </h2>
            <p className="text-slate-500 mt-1">Change the look and feel of the entire website for all users.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {themeOptions.map((opt) => (
            <div 
              key={opt.id}
              onClick={() => { if (theme !== opt.id && !isSaving) handleApplyTheme(opt.id); }}
              className={`relative p-6 rounded-2xl border-2 transition-all cursor-pointer ${
                theme === opt.id 
                  ? 'border-academic-blue bg-blue-50 shadow-md' 
                  : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
              } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {theme === opt.id && (
                <div className="absolute top-4 right-4 text-academic-blue">
                  <CheckCircle size={24} className="fill-current text-white" />
                </div>
              )}
              
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                theme === opt.id ? 'bg-academic-blue text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {opt.icon}
              </div>
              
              <h3 className={`text-lg font-bold mb-1 ${theme === opt.id ? 'text-academic-blue' : 'text-slate-800'}`}>
                {opt.name}
              </h3>
              
              <p className="text-sm text-slate-500">{opt.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
