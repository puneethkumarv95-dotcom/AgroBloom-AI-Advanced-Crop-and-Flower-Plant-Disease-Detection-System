import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  LayoutDashboard,
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
  ShieldCheck,
  Sparkles
} from 'lucide-react';

const Sidebar = ({ isOpen, closeSidebar }) => {
  const navGroups = [
    {
      group: "Atelier Diagnostics",
      items: [
        { name: "Home", path: '/', icon: Home },
        { name: "Botanical Dashboard", path: '/dashboard', icon: LayoutDashboard, badge: 'Studio' },
        { name: "Crop Disease Detection", path: '/crop-detection', icon: ScanLine },
        { name: "Flower Disease Detection", path: '/flower-detection', icon: Layers },
        { name: "Live Camera Detection", path: '/camera', icon: Camera, badge: 'Live' },
        { name: "Offline AI Scanner", path: '/offline', icon: Cpu, badge: 'Edge' },
        { name: "Nutrient Deficiency", path: '/nutrient-deficiency', icon: Beaker },
      ]
    },
    {
      group: "Botanical Intelligence",
      items: [
        { name: "AI Chatbot", path: '/chatbot', icon: MessageSquare },
        { name: "Voice Assistant", path: '/voice', icon: Mic, badge: 'Voice' },
        { name: "Recovery Tracking", path: '/recovery', icon: Calendar },
        { name: "Plant Care Plans", path: '/plant-care', icon: HeartPulse },
        { name: "Disease Library", path: '/disease-library', icon: BookOpen },
        { name: "Detection History", path: '/history', icon: History },
        { name: "Analytics & Telemetry", path: '/analytics', icon: BarChart3 },
        { name: "Model Benchmarks", path: '/model-comparison', icon: ShieldCheck, badge: 'Eval' },
      ]
    },
    {
      group: "Community & Atelier",
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
          className="fixed inset-0 bg-[#244436]/50 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-16 left-0 bottom-0 z-30 w-64 bg-[#F7F4EB] dark:bg-[#1A3328] border-r border-[#D8B989]/30 dark:border-[#718468]/30 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } overflow-y-auto scrollbar-thin scrollbar-thumb-[#D8B989]/40 dark:scrollbar-thumb-[#718468]/40`}
      >
        <div className="py-5 px-3 space-y-6">
          {navGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              <h3 className="px-3 text-[10px] font-bold uppercase tracking-widest text-[#718468] dark:text-[#A5B89B]/80 font-sans">
                {group.group}
              </h3>
              <div className="space-y-0.5 mt-1.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => {
                      if (window.innerWidth < 1024) closeSidebar();
                    }}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 group ${
                        isActive
                          ? 'bg-[#244436] text-[#F7F4EB] dark:bg-[#EEEBDD] dark:text-[#244436] shadow-sm font-bold scale-[1.01]'
                          : 'text-[#252D27]/80 dark:text-[#EEEBDD]/70 hover:bg-[#EEEBDD] dark:hover:bg-[#244436]/60 hover:text-[#244436] dark:hover:text-[#F7F4EB]'
                      }`
                    }
                  >
                    <div className="flex items-center space-x-2.5">
                      <item.icon className="w-4 h-4 opacity-75 group-hover:opacity-100 transition-opacity" />
                      <span className="truncate">{item.name}</span>
                    </div>

                    {item.badge && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-mono font-bold tracking-tight bg-[#D8B989]/30 text-[#244436] dark:bg-[#A5B89B]/20 dark:text-[#EEEBDD]">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}

          {/* Botanical Atelier studio badge */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-[#244436] to-[#1A3328] text-[#F7F4EB] shadow-md border border-[#D8B989]/30 relative overflow-hidden">
            <div className="relative z-10 space-y-1.5">
              <div className="flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#D8B989]" />
                <span className="text-xs font-serif font-bold text-[#EEEBDD] tracking-wide">Botanical Atelier</span>
              </div>
              <p className="text-[11px] text-[#A5B89B] leading-relaxed">
                MobileNetV2 neural vision &amp; verified pathology intelligence.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
