import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import NotificationCenter from './NotificationCenter';
import {
  Sprout,
  Globe,
  Mic,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react';

const Navbar = ({ toggleSidebar, isSidebarOpen }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { language, changeLanguage, t } = useLanguage();
  const { toggleTheme, isDark } = useTheme();
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [langDropdown, setLangDropdown] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setProfileDropdown(false);
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left section: Hamburger & Logo */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={toggleSidebar}
              className="p-1.5 sm:p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-agro-700 hover:bg-agro-50 dark:hover:bg-slate-800 focus:outline-none lg:hidden"
              aria-label="Toggle Navigation"
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-agro-700 to-agro-500 flex items-center justify-center text-white shadow-md shadow-agro-500/20">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-agro-900 dark:text-agro-400">
                  Agro<span className="text-agro-600 dark:text-agro-300">Bloom</span>
                  <span className="text-xs ml-1 px-1.5 py-0.5 rounded bg-agro-100 dark:bg-agro-900 text-agro-800 dark:text-agro-200 font-semibold uppercase">AI</span>
                </span>
                <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-medium -mt-1 hidden sm:block">
                  Crop & Flower Disease Intelligence
                </span>
              </div>
            </Link>
          </div>

          {/* Right section: Theme, Language, Voice, Notifications & User */}
          <div className="flex items-center space-x-1 sm:space-x-3">
            
            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
              className="p-1.5 sm:p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangDropdown(!langDropdown)}
                aria-label={`Language: ${language}`}
                className="flex items-center space-x-1 px-1.5 sm:px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition"
              >
                <Globe className="w-4 h-4 text-agro-600" />
                <span className="hidden sm:inline uppercase">{language}</span>
              </button>

              {langDropdown && (
                <div className="absolute right-0 mt-2 w-44 rounded-xl bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-700 py-1.5 z-50 animate-in fade-in">
                  <button
                    onClick={() => { changeLanguage('en'); setLangDropdown(false); }}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between ${language === 'en' ? 'bg-agro-50 dark:bg-agro-950 text-agro-700 dark:text-agro-300 font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                  >
                    <span>English</span>
                    <span className="text-slate-400 text-[10px]">EN</span>
                  </button>
                  <button
                    onClick={() => { changeLanguage('kn'); setLangDropdown(false); }}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between ${language === 'kn' ? 'bg-agro-50 dark:bg-agro-950 text-agro-700 dark:text-agro-300 font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                  >
                    <span>ಕನ್ನಡ (Kannada)</span>
                    <span className="text-slate-400 text-[10px]">KN</span>
                  </button>
                  <button
                    onClick={() => { changeLanguage('hi'); setLangDropdown(false); }}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between ${language === 'hi' ? 'bg-agro-50 dark:bg-agro-950 text-agro-700 dark:text-agro-300 font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                  >
                    <span>हिन्दी (Hindi)</span>
                    <span className="text-slate-400 text-[10px]">HI</span>
                  </button>
                </div>
              )}
            </div>

            {/* Quick Voice Assistant Link */}
            <Link
              to="/voice"
              title="Voice Assistant"
              className="hidden sm:flex p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-agro-700 hover:bg-agro-50 dark:hover:bg-slate-800 transition"
            >
              <Mic className="w-4 h-4 text-agro-600" />
            </Link>

            {/* Notification Center */}
            <NotificationCenter />

            {/* User Profile / Auth */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdown(!profileDropdown)}
                  className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-slate-200 dark:border-slate-700"
                >
                  <div className="w-7 h-7 rounded-full bg-agro-700 text-white flex items-center justify-center font-bold text-xs">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 hidden md:block max-w-[100px] truncate">
                    {user?.name}
                  </span>
                </button>

                {profileDropdown && (
                  <div className="absolute right-0 mt-2 w-52 rounded-xl bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-700 py-1.5 z-50">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-agro-100 dark:bg-agro-900 text-agro-800 dark:text-agro-200">
                        {user?.role}
                      </span>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setProfileDropdown(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      <User className="w-4 h-4 text-slate-500" />
                      <span>{t('profile')}</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 text-left"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>{t('logout')}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-1.5">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-agro-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-medium text-white bg-agro-600 hover:bg-agro-700 rounded-lg shadow-sm transition"
                >
                  {t('register')}
                </Link>
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};

export default Navbar;
