import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  ScanLine,
  Layers,
  Camera,
  MessageSquare,
  BookOpen,
  History,
  BarChart3,
  Users,
  Stethoscope,
  User,
  Settings,
  Beaker,
  HeartPulse,
  Calendar,
  Cpu,
  Mic,
  ShieldCheck
} from 'lucide-react';

const Sidebar = ({ isOpen, closeSidebar }) => {
  const navGroups = [
    {
      group: "Core Diagnostic Engines",
      items: [
        { name: "Home", path: '/', icon: Home },
        { name: "Crop Disease Detection", path: '/crop-detection', icon: ScanLine },
        { name: "Flower Disease Detection", path: '/flower-detection', icon: Layers },
        { name: "Live Camera Detection", path: '/camera', icon: Camera, badge: 'Live' },
        { name: "Offline AI Scanner", path: '/offline', icon: Cpu, badge: 'Offline' },
        { name: "Nutrient Deficiency", path: '/nutrient-deficiency', icon: Beaker },
      ]
    },
    {
      group: "Pathology Intelligence",
      items: [
        { name: "AI Chatbot", path: '/chatbot', icon: MessageSquare },
        { name: "Voice Assistant", path: '/voice', icon: Mic, badge: 'Voice' },
        { name: "Recovery Tracking", path: '/recovery', icon: Calendar },
        { name: "Plant Care Plans", path: '/plant-care', icon: HeartPulse },
        { name: "Disease Library", path: '/disease-library', icon: BookOpen },
        { name: "Detection History", path: '/history', icon: History },
        { name: "Analytics & Telemetry", path: '/analytics', icon: BarChart3 },
        { name: "Model Benchmarks", path: '/model-comparison', icon: ShieldCheck, badge: 'Research' },
      ]
    },
    {
      group: "Collaboration & Settings",
      items: [
        { name: "Community Forum", path: '/forum', icon: Users },
        { name: "Expert Consultation", path: '/consultations', icon: Stethoscope },
        { name: "User Profile", path: '/profile', icon: User },
        { name: "Settings", path: '/settings', icon: Settings },
      ]
    }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-16 left-0 bottom-0 z-30 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800`}
      >
        <div className="py-4 px-3 space-y-6">
          {navGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              <h3 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {group.group}
              </h3>
              <div className="space-y-0.5 mt-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => {
                      if (window.innerWidth < 1024) closeSidebar();
                    }}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition group ${
                        isActive
                          ? 'bg-agro-50 dark:bg-agro-950/60 text-agro-800 dark:text-agro-300 shadow-2xs font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                      }`
                    }
                  >
                    <div className="flex items-center space-x-2.5">
                      <item.icon className="w-4 h-4 text-slate-400 group-hover:text-agro-600 dark:group-hover:text-agro-400 transition" />
                      <span>{item.name}</span>
                    </div>

                    {item.badge && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-agro-100 dark:bg-agro-900 text-agro-800 dark:text-agro-200">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}

          {/* Service summary */}
          <div className="p-3.5 bg-gradient-to-br from-agro-900 to-agro-800 dark:from-slate-800 dark:to-agro-950 rounded-2xl text-white shadow-md text-center">
            <div className="flex items-center justify-center space-x-1.5 mb-1">
              <ShieldCheck className="w-4 h-4 text-agro-300" />
              <span className="text-xs font-bold text-white tracking-wide">Phase 1 Core Services</span>
            </div>
            <p className="text-[10px] text-agro-200 dark:text-slate-300 leading-relaxed">
              React, Express, MongoDB, and FastAPI integration.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
