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
  Sparkles,
  Compass,
  LayoutDashboard
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
    <header className="sticky top-0 z-40 bg-[#F7F4EB]/90 dark:bg-[#1A3328]/90 backdrop-blur-md border-b border-[#D8B989]/35 dark:border-[#718468]/35 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left section: Hamburger & Editorial Logo */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={toggleSidebar}
              className="p-1.5 sm:p-2 rounded-xl text-[#244436] dark:text-[#EEEBDD] hover:bg-[#EEEBDD] dark:hover:bg-[#244436] focus:outline-none lg:hidden transition"
              aria-label="Toggle Navigation"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#244436] to-[#718468] flex items-center justify-center text-[#F7F4EB] shadow-md border border-[#D8B989]/40 group-hover:scale-105 transition-transform duration-200">
                <Sprout className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-baseline space-x-1.5">
                  <span className="font-serif font-bold text-xl sm:text-2xl tracking-tight text-[#244436] dark:text-[#F7F4EB]">
                    AgroBloom <span className="font-sans font-light italic text-[#718468] dark:text-[#A5B89B]">AI</span>
                  </span>
                  <span className="text-[9px] uppercase tracking-widest font-mono font-bold px-1.5 py-0.5 rounded-full bg-[#D8B989]/30 text-[#244436] dark:bg-[#718468]/30 dark:text-[#EEEBDD]">
                    Atelier
                  </span>
                </div>
                <span className="block text-[10px] text-[#718468] dark:text-[#A5B89B] tracking-wider uppercase font-semibold -mt-0.5 hidden sm:block">
                  Botanical Health &amp; Vision Studio
                </span>
              </div>
            </Link>
          </div>

          {/* Center Links (Desktop quick atelier shortcuts) */}
          <nav className="hidden xl:flex items-center space-x-5 text-xs font-semibold text-[#252D27]/80 dark:text-[#EEEBDD]/80">
            <Link to="/dashboard" className="hover:text-[#244436] dark:hover:text-white transition flex items-center space-x-1">
              <LayoutDashboard className="w-3.5 h-3.5 text-[#718468]" />
              <span>Studio Dashboard</span>
            </Link>
            <Link to="/crop-detection" className="hover:text-[#244436] dark:hover:text-white transition">
              Crop Diagnostics
            </Link>
            <Link to="/flower-detection" className="hover:text-[#244436] dark:hover:text-white transition">
              Floriculture AI
            </Link>
            <Link to="/disease-library" className="hover:text-[#244436] dark:hover:text-white transition">
              Herbarium
            </Link>
          </nav>

          {/* Right section: Theme, Language, Voice, Notifications & User */}
          <div className="flex items-center space-x-1.5 sm:space-x-3">
            
            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
              className="p-2 rounded-xl text-[#244436] dark:text-[#EEEBDD] bg-[#EEEBDD]/60 dark:bg-[#244436]/60 hover:bg-[#EEEBDD] dark:hover:bg-[#244436] border border-[#D8B989]/40 dark:border-[#718468]/40 transition"
            >
              {isDark ? <Sun className="w-4 h-4 text-[#D8B989]" /> : <Moon className="w-4 h-4 text-[#244436]" />}
            </button>

            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangDropdown(!langDropdown)}
                aria-label={`Language: ${language}`}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-[#244436] dark:text-[#EEEBDD] bg-[#EEEBDD]/60 dark:bg-[#244436]/60 hover:bg-[#EEEBDD] dark:hover:bg-[#244436] border border-[#D8B989]/40 dark:border-[#718468]/40 transition"
              >
                <Globe className="w-3.5 h-3.5 text-[#718468] dark:text-[#A5B89B]" />
                <span className="uppercase font-mono text-[11px]">{language}</span>
              </button>

              {langDropdown && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-[#F7F4EB] dark:bg-[#1A3328] shadow-xl border border-[#D8B989]/50 dark:border-[#718468]/50 py-2 z-50 animate-in fade-in">
                  <button
                    onClick={() => { changeLanguage('en'); setLangDropdown(false); }}
                    className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between ${language === 'en' ? 'bg-[#EEEBDD] dark:bg-[#244436] text-[#244436] dark:text-[#F7F4EB] font-bold' : 'text-[#252D27] dark:text-[#EEEBDD] hover:bg-[#EEEBDD]/50 dark:hover:bg-[#244436]/50'}`}
                  >
                    <span>English</span>
                    <span className="text-[#718468] text-[10px] font-mono">EN</span>
                  </button>
                  <button
                    onClick={() => { changeLanguage('kn'); setLangDropdown(false); }}
                    className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between ${language === 'kn' ? 'bg-[#EEEBDD] dark:bg-[#244436] text-[#244436] dark:text-[#F7F4EB] font-bold' : 'text-[#252D27] dark:text-[#EEEBDD] hover:bg-[#EEEBDD]/50 dark:hover:bg-[#244436]/50'}`}
                  >
                    <span>ಕನ್ನಡ (Kannada)</span>
                    <span className="text-[#718468] text-[10px] font-mono">KN</span>
                  </button>
                  <button
                    onClick={() => { changeLanguage('hi'); setLangDropdown(false); }}
                    className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between ${language === 'hi' ? 'bg-[#EEEBDD] dark:bg-[#244436] text-[#244436] dark:text-[#F7F4EB] font-bold' : 'text-[#252D27] dark:text-[#EEEBDD] hover:bg-[#EEEBDD]/50 dark:hover:bg-[#244436]/50'}`}
                  >
                    <span>हिन्दी (Hindi)</span>
                    <span className="text-[#718468] text-[10px] font-mono">HI</span>
                  </button>
                </div>
              )}
            </div>

            {/* Quick Voice Assistant Link */}
            <Link
              to="/voice"
              title="Voice Assistant"
              className="hidden sm:flex p-2 rounded-xl text-[#244436] dark:text-[#EEEBDD] bg-[#EEEBDD]/60 dark:bg-[#244436]/60 hover:bg-[#EEEBDD] dark:hover:bg-[#244436] border border-[#D8B989]/40 dark:border-[#718468]/40 transition"
            >
              <Mic className="w-4 h-4 text-[#718468] dark:text-[#A5B89B]" />
            </Link>

            {/* Notification Center */}
            <NotificationCenter />

            {/* User Profile / Auth */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdown(!profileDropdown)}
                  className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-[#EEEBDD] dark:hover:bg-[#244436] transition border border-[#D8B989]/40 dark:border-[#718468]/40"
                >
                  <div className="w-7 h-7 rounded-full bg-[#244436] dark:bg-[#EEEBDD] text-[#F7F4EB] dark:text-[#244436] flex items-center justify-center font-bold text-xs font-serif">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <span className="text-xs font-semibold text-[#252D27] dark:text-[#EEEBDD] hidden md:block max-w-[100px] truncate">
                    {user?.name}
                  </span>
                </button>

                {profileDropdown && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#F7F4EB] dark:bg-[#1A3328] shadow-2xl border border-[#D8B989]/50 dark:border-[#718468]/50 py-2 z-50">
                    <div className="px-4 py-2.5 border-b border-[#D8B989]/25 dark:border-[#718468]/25">
                      <p className="text-xs font-serif font-bold text-[#244436] dark:text-[#EEEBDD] truncate">{user?.name}</p>
                      <p className="text-[11px] text-[#718468] dark:text-[#A5B89B] truncate">{user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-wider bg-[#D8B989]/30 text-[#244436] dark:bg-[#718468]/30 dark:text-[#EEEBDD]">
                        {user?.role}
                      </span>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setProfileDropdown(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-xs text-[#252D27] dark:text-[#EEEBDD] hover:bg-[#EEEBDD] dark:hover:bg-[#244436] transition"
                    >
                      <User className="w-3.5 h-3.5 text-[#718468]" />
                      <span>{t('profile')}</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-xs text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-left transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t('logout')}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-semibold text-[#244436] dark:text-[#EEEBDD] hover:bg-[#EEEBDD] dark:hover:bg-[#244436] rounded-xl transition"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 text-xs font-semibold text-[#F7F4EB] bg-[#244436] hover:bg-[#1A3328] dark:bg-[#EEEBDD] dark:text-[#244436] dark:hover:bg-[#FFFFFF] rounded-xl shadow-xs transition"
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
