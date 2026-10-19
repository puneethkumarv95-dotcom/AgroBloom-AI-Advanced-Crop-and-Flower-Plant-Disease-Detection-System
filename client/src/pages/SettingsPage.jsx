import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
  Settings,
  Moon,
  Sun,
  Globe,
  Database,
  Cpu,
  Server,
  ShieldCheck
} from 'lucide-react';

const SettingsPage = () => {
  const { language, changeLanguage, t } = useLanguage();
  const { theme, toggleTheme, isDark } = useTheme();
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 p-6 sm:p-8 shadow-xs">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-agro-50 dark:bg-agro-950 border border-agro-200 dark:border-agro-800 text-agro-800 dark:text-agro-200 text-xs font-semibold mb-2">
          <Settings className="w-3.5 h-3.5 text-agro-600 dark:text-agro-400" />
          <span>System &amp; User Preferences</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
          Customize interface preferences, dark mode styling, default language, and inspect microservice health.
        </p>
      </div>

      {/* Settings Grid */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 p-6 sm:p-8 space-y-6 shadow-xs">
        
        {/* Appearance */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-700 pb-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              {isDark ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
              <span>Theme Appearance</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Currently using {isDark ? 'Dark Mode' : 'Light Mode'}
            </p>
          </div>

          <button
            onClick={toggleTheme}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 rounded-xl text-xs font-semibold transition"
          >
            Switch to {isDark ? 'Light' : 'Dark'} Mode
          </button>
        </div>

        {/* Language */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-700 pb-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Globe className="w-4 h-4 text-agro-600" />
              <span>Default Language</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Available in English, Kannada, and Hindi
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {[
              { id: 'en', label: 'English' },
              { id: 'kn', label: 'ಕನ್ನಡ (KN)' },
              { id: 'hi', label: 'हिन्दी (HI)' }
            ].map((l) => (
              <button
                key={l.id}
                onClick={() => changeLanguage(l.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  language === l.id
                    ? 'bg-agro-700 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Microservice Architecture Diagnostic */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Server className="w-4 h-4 text-agro-600" />
            <span>Active Microservices Architecture</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">React Frontend</span>
              <span className="font-bold text-slate-800 dark:text-slate-100 block mt-1">Vite + Tailwind</span>
              <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">Development server</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Node.js Server</span>
              <span className="font-bold text-slate-800 dark:text-slate-100 block mt-1">Express + MongoDB</span>
              <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">Configured on port 5000</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">AI Vision Service</span>
              <span className="font-bold text-slate-800 dark:text-slate-100 block mt-1">FastAPI + TensorFlow</span>
              <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">Configured on port 8000</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default SettingsPage;
