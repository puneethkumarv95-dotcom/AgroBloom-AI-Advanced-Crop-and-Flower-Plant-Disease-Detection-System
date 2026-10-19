import React from 'react';
import { Sprout, Shield, Cpu } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto py-6 px-4 sm:px-6 lg:px-8 text-slate-500 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-agro-700 flex items-center justify-center text-white">
            <Sprout className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-slate-800">AgroBloom AI</span>
          <span>&copy; {new Date().getFullYear()} MCA Major Project</span>
        </div>

        <div className="flex items-center space-x-4 text-[11px]">
          <span className="flex items-center space-x-1">
            <Cpu className="w-3.5 h-3.5 text-agro-600" />
            <span>MobileNetV2 crop &amp; flower models</span>
          </span>
          <span className="hidden sm:inline">&bull;</span>
          <span className="flex items-center space-x-1">
            <Shield className="w-3.5 h-3.5 text-agro-600" />
            <span>Curated plant-health guidance</span>
          </span>
        </div>

        <div className="text-[11px] text-slate-400">
          Built for sustainable agriculture and precise plant health diagnosis.
        </div>

      </div>
    </footer>
  );
};

export default Footer;
