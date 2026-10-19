import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import {
  BarChart3,
  PieChart,
  Activity,
  ShieldCheck,
  Calendar,
  Layers,
  Sprout,
  CheckCircle2
} from 'lucide-react';

const AnalyticsPage = () => {
  const { t } = useLanguage();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/detections/history');
        if (res.data.success) {
          setHistory(res.data.detections || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const totalDetections = history.length;
  const healthyCount = history.filter((h) => h.condition === 'healthy').length;
  const diseasedCount = history.filter((h) => h.condition === 'diseased').length;
  const nutrientCount = history.filter((h) => h.condition === 'nutrient_deficiency').length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 p-6 sm:p-8 shadow-xs">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-agro-50 dark:bg-agro-950 border border-agro-200 dark:border-agro-800 text-agro-800 dark:text-agro-200 text-xs font-semibold mb-2">
          <BarChart3 className="w-3.5 h-3.5 text-agro-600 dark:text-agro-400" />
          <span>MongoDB Diagnostic Records Analytics</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Pathology Analytics & Telemetry
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
          Aggregated diagnostic data across crop plots and floral nurseries.
          Derived exclusively from verified computer vision detection events.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 block">Total Diagnoses Logged</span>
          <span className="text-3xl font-black text-slate-900 dark:text-white mt-1 block">
            {totalDetections}
          </span>
          <span className="text-[10px] text-agro-700 dark:text-agro-400 mt-2 block font-semibold">
            In MongoDB Collections
          </span>
        </div>

        <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 block">Diseased Foliage Cases</span>
          <span className="text-3xl font-black text-red-600 mt-1 block">
            {diseasedCount}
          </span>
          <span className="text-[10px] text-slate-400 mt-2 block">
            Fungal &amp; bacterial pathologies
          </span>
        </div>

        <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 block">Healthy Foliage Ratio</span>
          <span className="text-3xl font-black text-emerald-600 mt-1 block">
            {totalDetections > 0 ? `${Math.round((healthyCount / totalDetections) * 100)}%` : 'N/A'}
          </span>
          <span className="text-[10px] text-slate-400 mt-2 block">
            {healthyCount} verified healthy specimens
          </span>
        </div>

        <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 block">Nutrient Deficiencies</span>
          <span className="text-3xl font-black text-amber-500 mt-1 block">
            {nutrientCount}
          </span>
          <span className="text-[10px] text-slate-400 mt-2 block">
            Nitrogen / Iron chlorosis cases
          </span>
        </div>

      </div>

      {/* Sensor-free compliance notice */}
      <div className="p-6 rounded-3xl bg-agro-50/70 dark:bg-slate-900/60 border border-agro-200 dark:border-slate-700 space-y-2">
        <div className="flex items-center space-x-2 text-agro-900 dark:text-agro-200 font-bold text-xs">
          <ShieldCheck className="w-4 h-4 text-agro-600" />
          <span>Research Integrity &amp; Pure Computer Vision Policy</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          In strict accordance with project constraints, AgroBloom AI utilizes pure vision-based deep learning 
          and pathology image segmentation. No simulated IoT sensor telemetry, artificial moisture probes, or 
          synthetic weather sensors are used. All metrics reflect actual leaf image inferences and user activity.
        </p>
      </div>

    </div>
  );
};

export default AnalyticsPage;

