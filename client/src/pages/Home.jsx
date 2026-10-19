import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
  Mic
} from 'lucide-react';

const Home = () => {
  const [aiStatus, setAiStatus] = useState(null);
  const [backendStatus, setBackendStatus] = useState('CHECKING');

  useEffect(() => {
    api.get('/health')
      .then((res) => setBackendStatus(res.data.status === 'healthy' ? 'CONNECTED' : 'UNAVAILABLE'))
      .catch(() => setBackendStatus('UNAVAILABLE'));

    const checkStatus = async () => {
      try {
        const res = await api.get('/ai/status', { timeout: 90000 });
        setAiStatus(res.data.aiService);
      } catch (err) {
        setAiStatus(err.response?.data?.aiService || { status: 'AI_SERVICE_UNAVAILABLE' });
      }
    };
    checkStatus();
  }, []);

  const modules = [
    {
      title: "Crop Disease Detection",
      desc: "Agricultural pathology diagnosis using deep convolutional vision networks",
      path: "/crop-detection",
      icon: ScanLine,
      color: "from-emerald-500 to-green-700",
      status: "MobileNetV2 Diagnostic Engine Ready"
    },
    {
      title: "Flower Disease Detection",
      desc: "Specialized floriculture disease detection for Rose and ornamental foliage",
      path: "/flower-detection",
      icon: Layers,
      color: "from-pink-500 to-rose-700",
      status: "Rose Floriculture Model Ready"
    },
    {
      title: "Live Camera Detection",
      desc: "Camera preview and leaf-image capture for real-time foliar analysis",
      path: "/camera",
      icon: Camera,
      color: "from-teal-500 to-emerald-700",
      status: "Hardware Viewport & Auto-Sample"
    },
    {
      title: "Offline AI Scanner",
      desc: "Zero-connectivity in-browser inference with IndexedDB local caching",
      path: "/offline",
      icon: Cpu,
      color: "from-cyan-500 to-blue-700",
      status: "PWA On-Device TensorFlow.js"
    },
    {
      title: "Nutrient Deficiency",
      desc: "Physiological foliar chlorosis signatures and soil amendment guidance",
      path: "/nutrient-deficiency",
      icon: Beaker,
      color: "from-yellow-500 to-amber-700",
      status: "Visual Extension Taxonomy"
    },
    {
      title: "AI Plant Chatbot",
      desc: "Grounded agronomic guidance from the curated plant-health knowledge base",
      path: "/chatbot",
      icon: Sparkles,
      color: "from-blue-500 to-indigo-700",
      status: "RAG Agricultural Knowledge Base"
    },
    {
      title: "Voice Assistant",
      desc: "Multilingual speech synthesis and hands-free voice field diagnosis",
      path: "/voice",
      icon: Mic,
      color: "from-emerald-600 to-teal-800",
      status: "English • ಕನ್ನಡ • हिन्दी"
    },
    {
      title: "Recovery Tracking",
      desc: "Longitudinal foliar observation timeline with image comparison slider",
      path: "/recovery",
      icon: Calendar,
      color: "from-green-600 to-emerald-800",
      status: "Interactive Visual Progress"
    },
    {
      title: "Personalized Care Plans",
      desc: "Custom treatment tasks, spraying schedules, and recovery checklists",
      path: "/plant-care",
      icon: HeartPulse,
      color: "from-rose-500 to-pink-700",
      status: "Checklist Reminders Active"
    },
    {
      title: "Disease Library",
      desc: "Comprehensive botanical pathology encyclopedia and symptom signatures",
      path: "/disease-library",
      icon: BookOpen,
      color: "from-amber-500 to-orange-700",
      status: "Smart Search & Multi-Filters"
    },
    {
      title: "Community Forum",
      desc: "Grower knowledge sharing, peer advice, and field observation discussions",
      path: "/forum",
      icon: Users,
      color: "from-purple-500 to-indigo-700",
      status: "Threads, Replies & Solutions"
    },
    {
      title: "Expert Consultation",
      desc: "Connect directly with certified agronomists for clinical prescriptions",
      path: "/consultations",
      icon: Stethoscope,
      color: "from-red-500 to-rose-700",
      status: "Verified Agronomist Directory"
    },
    {
      title: "Detection History",
      desc: "Historical diagnosis records, date filters, and PDF report downloads",
      path: "/history",
      icon: Clock,
      color: "from-slate-600 to-slate-800",
      status: "Authenticated MongoDB History"
    },
    {
      title: "Model Benchmarks",
      desc: "Comparative metrics for MobileNetV2, EfficientNetB0, and ResNet50",
      path: "/model-comparison",
      icon: BarChart3,
      color: "from-indigo-600 to-violet-800",
      status: "Multi-Architecture Empirical Data"
    }
  ];

  return (
    <div className="space-y-12 pb-16">
      
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-agro-950 via-agro-900 to-agro-800 text-white shadow-xl p-8 sm:p-14">
        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-agro-500/20 border border-agro-400/30 text-agro-300 text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-agro-400" />
            <span>MCA Final Year Major Project &bull; Full-Stack Agricultural AI</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            AgroBloom AI <br />
            <span className="text-agro-400 font-semibold text-xl sm:text-3xl">
              Advanced Crop and Flower Plant Disease Detection System
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-agro-100/90 leading-relaxed max-w-2xl">
            A development-stage plant health system combining real MobileNetV2 image inference,
            a curated pathology knowledge base, and connected user and detection services.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              to="/crop-detection"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-agro-500 hover:bg-agro-600 text-white font-bold text-xs shadow-lg shadow-agro-500/30 transition transform hover:-translate-y-0.5"
            >
              <ScanLine className="w-4 h-4" />
              <span>Diagnose Crop Leaf</span>
            </Link>

            <Link
              to="/camera"
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs backdrop-blur-md border border-white/20 transition"
            >
              <Camera className="w-4 h-4" />
              <span>Open Live Camera</span>
            </Link>

            <Link
              to="/chatbot"
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs backdrop-blur-md border border-white/20 transition"
            >
              <Sparkles className="w-4 h-4 text-agro-300" />
              <span>Plant AI Chatbot</span>
            </Link>
          </div>
        </div>

        {/* Phase 1 Engine Status Bar */}
        <div className="relative z-10 mt-8 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-agro-200">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span>Express Backend &amp; MongoDB: <strong>{backendStatus}</strong></span>
          </div>
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-agro-400" />
            <span>
              FastAPI AI Microservice:{' '}
              <strong>{aiStatus?.status || 'CHECKING'}</strong>
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-agro-400" />
            <span>Diagnosis policy: <strong>actual model output only</strong></span>
          </div>
        </div>
      </section>

      {/* Modules Directory */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            System Architecture Modules
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Phase 1 provides complete foundation, database schemas, authentication, and service integration.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {modules.map((m, idx) => (
            <Link
              key={idx}
              to={m.path}
              className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 hover:border-agro-500 dark:hover:border-agro-400 hover:shadow-lg transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${m.color} flex items-center justify-center text-white shadow-md`}>
                    <m.icon className="w-5 h-5" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-agro-600 group-hover:translate-x-1 transition" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-agro-600 dark:group-hover:text-agro-400 transition">
                  {m.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  {m.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                <span className="text-[10px] font-semibold text-agro-700 dark:text-agro-400 block">
                  {m.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Home;
