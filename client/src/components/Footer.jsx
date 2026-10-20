import React from 'react';
import { Sprout, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#EEEBDD]/70 dark:bg-[#1A3328]/70 border-t border-[#D8B989]/30 dark:border-[#718468]/30 mt-auto py-10 px-4 sm:px-6 lg:px-8 text-[#252D27]/80 dark:text-[#EEEBDD]/80 text-xs transition-colors">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#244436] dark:bg-[#EEEBDD] flex items-center justify-center text-[#F7F4EB] dark:text-[#244436] shadow-sm">
                <Sprout className="w-4 h-4" />
              </div>
              <span className="font-serif font-bold text-lg text-[#244436] dark:text-[#F7F4EB] tracking-tight">
                AgroBloom AI
              </span>
              <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#D8B989]/30 text-[#244436] dark:bg-[#718468]/30 dark:text-[#EEEBDD]">
                Botanical Atelier
              </span>
            </div>
            <p className="text-xs text-[#718468] dark:text-[#A5B89B] max-w-md font-sans">
              Precision computer vision, explainable AI heatmaps, and grounded agricultural science for healthy crops and blooms.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
            <Link to="/crop-detection" className="hover:text-[#244436] dark:hover:text-white transition">Crop Detection</Link>
            <Link to="/flower-detection" className="hover:text-[#244436] dark:hover:text-white transition">Flower AI</Link>
            <Link to="/offline" className="hover:text-[#244436] dark:hover:text-white transition">Offline Studio</Link>
            <Link to="/forum" className="hover:text-[#244436] dark:hover:text-white transition">Grower Forum</Link>
            <Link to="/model-comparison" className="hover:text-[#244436] dark:hover:text-white transition">Model Benchmarks</Link>
          </div>
        </div>

        <div className="editorial-divider h-px w-full"></div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#718468] dark:text-[#A5B89B]">
          <div className="flex items-center space-x-2">
            <span className="flex items-center space-x-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#244436] dark:text-[#D8B989]" />
              <span>MobileNetV2 PlantVillage &amp; Rose Vision</span>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span>&copy; {new Date().getFullYear()} AgroBloom AI</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
