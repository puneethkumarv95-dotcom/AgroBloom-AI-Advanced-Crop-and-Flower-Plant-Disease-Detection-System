import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import {
  ScanLine,
  Camera,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Cpu,
  BookOpen,
  Users,
  Stethoscope,
  BarChart3,
  CheckCircle2,
  Clock,
  Beaker,
  HeartPulse,
  Calendar,
  Mic,
  Sprout,
  Activity,
  History,
  AlertTriangle,
  ChevronRight,
  FileText,
  Plus,
  RefreshCw,
  TrendingUp,
  Leaf,
  Flower2
} from 'lucide-react';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  
  const [history, setHistory] = useState([]);
  const [recoveryRecords, setRecoveryRecords] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const historyRes = await api.get('/detections/history').catch(() => ({ data: { detections: [] } }));
        if (historyRes.data?.success) {
          setHistory(historyRes.data.detections || []);
        }

        if (isAuthenticated) {
          const [recoveryRes, remindersRes] = await Promise.all([
            api.get('/recovery').catch(() => ({ data: { records: [] } })),
            api.get('/reminders').catch(() => ({ data: { reminders: [] } }))
          ]);

          if (recoveryRes.data?.success) {
            setRecoveryRecords(recoveryRes.data.records || []);
          }
          if (remindersRes.data?.success) {
            setReminders(remindersRes.data.reminders || []);
          }
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated]);

  // Derived Telemetry from genuine data
  const totalDetections = history.length;
  const cropDetections = history.filter(d => (d.plantType || '').toLowerCase() === 'crop' || (d.type || '').toLowerCase() === 'crop').length;
  const flowerDetections = history.filter(d => (d.plantType || '').toLowerCase() === 'flower' || (d.type || '').toLowerCase() === 'flower').length;
  const healthyCount = history.filter(d => (d.condition || '').toLowerCase() === 'healthy' || (d.primaryDisease || '').toLowerCase().includes('healthy')).length;
  const diseasedCount = totalDetections - healthyCount;
  const healthyRate = totalDetections > 0 ? Math.round((healthyCount / totalDetections) * 100) : 0;

  // Disease frequency counts
  const diseaseCounts = {};
  history.forEach(item => {
    const disease = item.primaryDisease || 'Unknown';
    diseaseCounts[disease] = (diseaseCounts[disease] || 0) + 1;
  });
  const topDiseases = Object.entries(diseaseCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <div className="space-y-10 sm:space-y-12 pb-20 font-sans">
      
      {/* 5.2 WELCOME EDITORIAL HEADER */}
      <section className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-[#1A3328] via-[#244436] to-[#2F5947] text-[#F7F4EB] shadow-2xl border border-[#D8B989]/30 p-8 sm:p-12">
        <div className="absolute inset-0 opacity-10 pointer-events-none botanical-bg"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#F7F4EB]/10 border border-[#D8B989]/40 text-[#D8B989] text-xs font-semibold backdrop-blur-md">
              <Sprout className="w-3.5 h-3.5 text-[#D8B989]" />
              <span className="tracking-widest uppercase font-mono text-[10px]">
                {isAuthenticated ? `${user?.role || 'Farmer'} Workspace` : 'Botanical Intelligence Workspace'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight text-[#F7F4EB] leading-tight">
              {isAuthenticated ? (
                <>
                  Welcome back, <br />
                  <span className="text-[#D8B989] italic font-normal">{user?.name || 'Fellow Agronomist'}</span>
                </>
              ) : (
                <>
                  AgroBloom AI <br />
                  <span className="text-[#D8B989] italic font-normal">Botanical Atelier Studio</span>
                </>
              )}
            </h1>

            <p className="text-xs sm:text-sm text-[#EEEBDD]/85 leading-relaxed font-light">
              Explore live neural foliar diagnostics, review your specimen telemetry, track continuous plant recovery, and coordinate clinical care plans.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/crop-detection"
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-2xl bg-[#D8B989] hover:bg-[#EFE2CE] text-[#1A3328] font-bold text-xs shadow-lg transition transform hover:-translate-y-0.5"
            >
              <ScanLine className="w-4 h-4 text-[#1A3328]" />
              <span>New Crop Diagnosis</span>
            </Link>

            <Link
              to="/flower-detection"
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-2xl bg-[#F7F4EB]/15 hover:bg-[#F7F4EB]/25 text-[#F7F4EB] font-semibold text-xs backdrop-blur-md border border-[#D8B989]/40 transition"
            >
              <Layers className="w-4 h-4 text-[#D8B989]" />
              <span>Floriculture AI</span>
            </Link>

            <Link
              to="/camera"
              className="inline-flex items-center space-x-2 px-4 py-3 rounded-2xl bg-[#1A3328]/60 hover:bg-[#1A3328] text-[#EEEBDD] font-semibold text-xs border border-[#A5B89B]/30 transition"
            >
              <Camera className="w-4 h-4 text-[#A5B89B]" />
              <span>Camera</span>
            </Link>
          </div>
        </div>

        {/* Real-time telemetry ribbon */}
        <div className="relative z-10 mt-8 pt-4 border-t border-[#D8B989]/20 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <span className="text-[#A5B89B] text-[10px] uppercase tracking-wider block">Specimens Scanned</span>
            <span className="text-xl font-serif font-bold text-[#F7F4EB]">{totalDetections}</span>
          </div>
          <div>
            <span className="text-[#A5B89B] text-[10px] uppercase tracking-wider block">Crop Diagnoses</span>
            <span className="text-xl font-serif font-bold text-[#D8B989]">{cropDetections}</span>
          </div>
          <div>
            <span className="text-[#A5B89B] text-[10px] uppercase tracking-wider block">Flower Diagnoses</span>
            <span className="text-xl font-serif font-bold text-[#F7F4EB]">{flowerDetections}</span>
          </div>
          <div>
            <span className="text-[#A5B89B] text-[10px] uppercase tracking-wider block">Foliar Health Rate</span>
            <span className="text-xl font-serif font-bold text-[#A5B89B]">
              {totalDetections > 0 ? `${healthyRate}%` : 'N/A'}
            </span>
          </div>
        </div>
      </section>

      {/* 5.3 ORGANIC BENTO GRID */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        
        {/* Left Bento: 8 cols */}
        <div className="lg:col-span-8 space-y-6 sm:space-y-8">
          
          {/* Card: Specimen Pathology Telemetry & Visual Chart */}
          <div className="atelier-card rounded-[2.5rem] p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#718468] dark:text-[#A5B89B] font-bold">
                  Empirical Pathology Breakdown
                </span>
                <h2 className="text-2xl font-serif font-bold text-[#244436] dark:text-[#EEEBDD]">
                  Diagnostic Specimen Distribution
                </h2>
              </div>
              <Link to="/analytics" className="text-xs font-bold text-[#718468] dark:text-[#D8B989] hover:underline flex items-center space-x-1">
                <span>Detailed Telemetry</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {totalDetections === 0 ? (
              <div className="py-12 text-center rounded-[2rem] bg-[#F7F4EB]/70 dark:bg-[#1A3328]/70 border border-dashed border-[#D8B989]/40 p-6 space-y-3">
                <Leaf className="w-10 h-10 text-[#718468] mx-auto opacity-70" />
                <h3 className="font-serif text-lg font-bold text-[#244436] dark:text-[#EEEBDD]">No Diagnostic Ingestions Yet</h3>
                <p className="text-xs text-[#252D27]/70 dark:text-[#EEEBDD]/70 max-w-sm mx-auto font-light">
                  Once you diagnose your first leaf specimen, genuine neural distribution, severity metrics, and disease frequency will render here.
                </p>
                <Link
                  to="/crop-detection"
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#244436] text-[#F7F4EB] text-xs font-bold shadow-md hover:bg-[#1A3328] transition"
                >
                  <ScanLine className="w-3.5 h-3.5" />
                  <span>Scan First Leaf</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                
                {/* 5.4 DATA VISUALIZATION: SVG DONUT METER */}
                <div className="flex items-center space-x-6 p-4 rounded-2xl bg-[#EEEBDD]/60 dark:bg-[#1A3328]/60 border border-[#D8B989]/30">
                  <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-[#D8B989]/30"
                        strokeWidth="3.8"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-[#244436] dark:text-[#A5B89B]"
                        strokeDasharray={`${healthyRate}, 100`}
                        strokeWidth="3.8"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <span className="font-serif text-xl font-bold text-[#244436] dark:text-[#EEEBDD] block">{healthyRate}%</span>
                      <span className="text-[8px] uppercase tracking-wider font-mono text-[#718468] dark:text-[#A5B89B]">Healthy</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#244436] dark:bg-[#A5B89B]"></span>
                      <span className="font-semibold text-[#252D27] dark:text-[#EEEBDD]">Healthy Leaves:</span>
                      <span className="font-mono font-bold text-[#718468] dark:text-[#D8B989]">{healthyCount}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#D8B989]"></span>
                      <span className="font-semibold text-[#252D27] dark:text-[#EEEBDD]">Infected Leaves:</span>
                      <span className="font-mono font-bold text-[#718468] dark:text-[#D8B989]">{diseasedCount}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-[11px] text-[#718468] dark:text-[#A5B89B] pt-1">
                      <span>Total Archival Count: {totalDetections}</span>
                    </div>
                  </div>
                </div>

                {/* Top Pathologies Bar Distribution */}
                <div className="space-y-3">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#718468] dark:text-[#A5B89B] font-bold block">
                    Most Prevalent Observed Pathologies
                  </span>
                  {topDiseases.map(([disease, count], i) => {
                    const pct = Math.round((count / totalDetections) * 100);
                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-serif font-bold text-[#244436] dark:text-[#EEEBDD] truncate max-w-[200px]">{disease}</span>
                          <span className="font-mono text-[10px] text-[#718468] dark:text-[#A5B89B]">{count} ({pct}%)</span>
                        </div>
                        <div className="h-2 rounded-full bg-[#EEEBDD] dark:bg-[#1A3328] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#718468] to-[#244436] dark:from-[#A5B89B] dark:to-[#D8B989]"
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            )}
          </div>

          {/* Card: Recent Diagnostic Ingestions */}
          <div className="atelier-card rounded-[2.5rem] p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#718468] dark:text-[#A5B89B] font-bold">
                  Specimen Ingestion Archive
                </span>
                <h2 className="text-xl font-serif font-bold text-[#244436] dark:text-[#EEEBDD]">
                  Recent Diagnostic Records
                </h2>
              </div>
              <Link to="/history" className="text-xs font-bold text-[#718468] dark:text-[#D8B989] hover:underline flex items-center space-x-1">
                <span>View All History</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-[#718468] font-mono">
                Loading botanical archival records...
              </div>
            ) : history.length === 0 ? (
              <div className="py-8 text-center rounded-2xl bg-[#EEEBDD]/40 dark:bg-[#1A3328]/40 border border-dashed border-[#D8B989]/40 p-4">
                <p className="text-xs text-[#252D27]/70 dark:text-[#EEEBDD]/70 font-light">
                  No records stored yet. Run an analysis in Crop or Flower Detection to populate this archive.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {history.slice(0, 3).map((item) => (
                  <div
                    key={item._id}
                    className="p-4 rounded-2xl border border-[#D8B989]/30 bg-[#F7F4EB]/70 dark:bg-[#1A3328]/70 hover:border-[#718468] transition space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded-full bg-[#D8B989]/25 text-[#244436] dark:text-[#EEEBDD]">
                          {item.plantType || item.type || 'Plant'}
                        </span>
                        <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${
                          (item.condition || '').toLowerCase() === 'healthy'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                        }`}>
                          {item.condition || 'Tested'}
                        </span>
                      </div>

                      <h4 className="font-serif font-bold text-sm text-[#244436] dark:text-[#EEEBDD] truncate">
                        {item.plantName || 'Specimen'}
                      </h4>
                      <p className="text-xs text-[#718468] dark:text-[#A5B89B] truncate mt-0.5 font-light">
                        {item.primaryDisease || 'Standard Condition'}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#D8B989]/20 flex items-center justify-between text-[11px] font-mono text-[#718468] dark:text-[#A5B89B]">
                      <span>{(item.confidence || 0).toFixed(1)}% Conf.</span>
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Bento: 4 cols */}
        <div className="lg:col-span-4 space-y-6 sm:space-y-8">
          
          {/* Card: Active Plant Recovery Tracking */}
          <div className="atelier-card rounded-[2.5rem] p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-[#718468]" />
                <h3 className="font-serif font-bold text-base text-[#244436] dark:text-[#EEEBDD]">
                  Recovery Tracking
                </h3>
              </div>
              <Link to="/recovery" className="text-xs text-[#718468] hover:underline font-bold">
                View All
              </Link>
            </div>

            {recoveryRecords.length === 0 ? (
              <div className="p-5 rounded-2xl bg-[#EEEBDD]/50 dark:bg-[#1A3328]/50 border border-dashed border-[#D8B989]/40 text-center space-y-2">
                <HeartPulse className="w-6 h-6 text-[#718468] mx-auto opacity-70" />
                <p className="text-xs text-[#252D27]/80 dark:text-[#EEEBDD]/80 font-serif font-bold">
                  No Monitored Recovery Cases
                </p>
                <p className="text-[11px] text-[#252D27]/60 dark:text-[#EEEBDD]/60 leading-relaxed font-light">
                  Track healing progression across treatments with comparative sliders and severity curves.
                </p>
                <Link
                  to="/recovery"
                  className="mt-2 inline-flex items-center space-x-1 text-xs font-bold text-[#244436] dark:text-[#D8B989] hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Start New Recovery Log</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {recoveryRecords.slice(0, 2).map((rec) => (
                  <div key={rec._id} className="p-3.5 rounded-xl border border-[#D8B989]/30 bg-[#F7F4EB]/70 dark:bg-[#1A3328]/70 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-serif font-bold text-[#244436] dark:text-[#EEEBDD]">{rec.plantName}</span>
                      <span className="text-[10px] font-mono text-[#718468] dark:text-[#A5B89B]">{rec.status || 'In Treatment'}</span>
                    </div>
                    <p className="text-[11px] text-[#718468] dark:text-[#A5B89B] truncate">{rec.diseaseName}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card: Plant Care Reminders */}
          <div className="atelier-card rounded-[2.5rem] p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <HeartPulse className="w-4 h-4 text-[#718468]" />
                <h3 className="font-serif font-bold text-base text-[#244436] dark:text-[#EEEBDD]">
                  Plant Care Schedules
                </h3>
              </div>
              <Link to="/plant-care" className="text-xs text-[#718468] hover:underline font-bold">
                Plans
              </Link>
            </div>

            {reminders.length === 0 ? (
              <div className="p-5 rounded-2xl bg-[#EEEBDD]/50 dark:bg-[#1A3328]/50 border border-dashed border-[#D8B989]/40 text-center space-y-2">
                <CheckCircle2 className="w-6 h-6 text-[#718468] mx-auto opacity-70" />
                <p className="text-xs text-[#252D27]/80 dark:text-[#EEEBDD]/80 font-serif font-bold">
                  All Scheduled Care Tasks Current
                </p>
                <p className="text-[11px] text-[#252D27]/60 dark:text-[#EEEBDD]/60 leading-relaxed font-light">
                  Create personalized treatment tasks, spraying alerts, and bio-remedy checklists.
                </p>
                <Link
                  to="/plant-care"
                  className="mt-2 inline-flex items-center space-x-1 text-xs font-bold text-[#244436] dark:text-[#D8B989] hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Configure Care Plan</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {reminders.slice(0, 3).map((r) => (
                  <div key={r._id} className="p-3 rounded-xl border border-[#D8B989]/30 bg-[#F7F4EB]/70 dark:bg-[#1A3328]/70 flex items-center justify-between text-xs">
                    <span className="font-serif font-bold text-[#244436] dark:text-[#EEEBDD] truncate">{r.title}</span>
                    <span className="text-[10px] font-mono text-[#718468] dark:text-[#A5B89B]">{r.date || 'Scheduled'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card: Atelier Quick Launch Palette */}
          <div className="atelier-card rounded-[2.5rem] p-6 sm:p-7 space-y-4">
            <h3 className="font-serif font-bold text-base text-[#244436] dark:text-[#EEEBDD]">
              Atelier Quick Palette
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              <Link
                to="/offline"
                className="p-3 rounded-2xl bg-[#EEEBDD]/70 dark:bg-[#1A3328]/70 border border-[#D8B989]/30 hover:border-[#718468] transition text-center space-y-1 group"
              >
                <Cpu className="w-4 h-4 mx-auto text-[#718468] group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-serif font-bold text-[#244436] dark:text-[#EEEBDD] block">Offline Studio</span>
              </Link>

              <Link
                to="/chatbot"
                className="p-3 rounded-2xl bg-[#EEEBDD]/70 dark:bg-[#1A3328]/70 border border-[#D8B989]/30 hover:border-[#718468] transition text-center space-y-1 group"
              >
                <Sparkles className="w-4 h-4 mx-auto text-[#D8B989] group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-serif font-bold text-[#244436] dark:text-[#EEEBDD] block">AI Agronomist</span>
              </Link>

              <Link
                to="/voice"
                className="p-3 rounded-2xl bg-[#EEEBDD]/70 dark:bg-[#1A3328]/70 border border-[#D8B989]/30 hover:border-[#718468] transition text-center space-y-1 group"
              >
                <Mic className="w-4 h-4 mx-auto text-[#718468] group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-serif font-bold text-[#244436] dark:text-[#EEEBDD] block">Voice Guide</span>
              </Link>

              <Link
                to="/disease-library"
                className="p-3 rounded-2xl bg-[#EEEBDD]/70 dark:bg-[#1A3328]/70 border border-[#D8B989]/30 hover:border-[#718468] transition text-center space-y-1 group"
              >
                <BookOpen className="w-4 h-4 mx-auto text-[#718468] group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-serif font-bold text-[#244436] dark:text-[#EEEBDD] block">Herbarium</span>
              </Link>
            </div>
          </div>

        </div>

      </section>

    </div>
  );
};

export default Dashboard;