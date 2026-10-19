import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import {
  ScanLine,
  Camera,
  Eye,
  PieChart,
  MessageSquare,
  Mic,
  WifiOff,
  History,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  Layers,
  Activity,
  FileText
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/detections/history');
        if (res.data.success) {
          setHistory(res.data.detections || []);
        }
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const featureCards = [
    {
      title: "Crop Disease Diagnosis",
      desc: "Instant MobileNetV2 identification with confidence score and pathology verification",
      link: "/detect",
      icon: ScanLine,
      color: "from-emerald-500 to-green-700",
      tag: "Deep Learning"
    },
    {
      title: "Flower Disease Diagnosis",
      desc: "Specialized model for ornamental and commercial blooms (Rose, Sunflower, Orchid)",
      link: "/detect?type=flower",
      icon: Layers,
      color: "from-pink-500 to-rose-700",
      tag: "Floral AI"
    },
    {
      title: "Real-time Live Camera",
      desc: "Direct field camera scanner with real-time video stream capture & bounding analysis",
      link: "/camera",
      icon: Camera,
      color: "from-cyan-500 to-teal-700",
      tag: "Live Camera"
    },
    {
      title: "Explainable AI (Grad-CAM)",
      desc: "Visualize exact neural network activation heatmaps on diseased leaf regions",
      link: "/grad-cam",
      icon: Eye,
      color: "from-amber-500 to-orange-700",
      tag: "Explainable AI"
    },
    {
      title: "Severity & Segmentation",
      desc: "Computer vision segmentation estimating precise percentage of affected leaf area",
      link: "/segmentation",
      icon: PieChart,
      color: "from-indigo-500 to-purple-700",
      tag: "Segmentation"
    },
    {
      title: "Grounded AI Chatbot",
      desc: "Pathology chatbot with grounded organic & chemical plant health remedies",
      link: "/chatbot",
      icon: MessageSquare,
      color: "from-blue-500 to-indigo-700",
      tag: "Grounded NLP"
    },
    {
      title: "Voice-Based Assistant",
      desc: "Hands-free voice recognition & spoken advice in English, Kannada, and Hindi",
      link: "/voice-assistant",
      icon: Mic,
      color: "from-red-500 to-rose-700",
      tag: "Multilingual Voice"
    },
    {
      title: "Offline Browser AI",
      desc: "Zero-latency in-browser TensorFlow.js inference for remote field areas without internet",
      link: "/offline",
      icon: WifiOff,
      color: "from-slate-600 to-slate-900",
      tag: "Offline Edge"
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-agro-950 via-agro-900 to-agro-800 text-white shadow-xl">
        <div className="absolute inset-0 opacity-15 leaf-pattern"></div>
        <div className="relative z-10 p-6 sm:p-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-agro-500/20 border border-agro-400/30 text-agro-300 text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-agro-400" />
            <span>MCA Final Year Major Project &bull; MobileNetV2 Vision AI</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            AgroBloom AI <br />
            <span className="text-agro-400 font-medium text-xl sm:text-2xl">
              Precision Crop & Flower Pathology Diagnostic System
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-agro-100/90 leading-relaxed max-w-2xl">
            Diagnose plant fungal, bacterial, and viral infections in seconds. Powered by 
            convolutional neural networks, Grad-CAM neural explainability, lesion segmentation, 
            and grounded treatment recommendations.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              to="/detect"
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-agro-500 hover:bg-agro-600 text-white font-semibold text-xs shadow-lg shadow-agro-500/30 transition transform hover:-translate-y-0.5"
            >
              <ScanLine className="w-4 h-4" />
              <span>Diagnose Leaf Now</span>
            </Link>

            <Link
              to="/camera"
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs backdrop-blur-md border border-white/20 transition"
            >
              <Camera className="w-4 h-4" />
              <span>Real-time Camera</span>
            </Link>

            <Link
              to="/chatbot"
              className="inline-flex items-center space-x-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs backdrop-blur-md border border-white/20 transition"
            >
              <MessageSquare className="w-4 h-4 text-agro-300" />
              <span>AI Chatbot</span>
            </Link>
          </div>
        </div>

        {/* Status bar */}
        <div className="relative z-10 border-t border-white/10 bg-black/20 backdrop-blur-xs px-6 py-3 flex flex-wrap items-center justify-between gap-4 text-[11px] text-agro-200">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>AI Diagnostic Engine: <strong>MobileNetV2 Active</strong></span>
          </div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-agro-400" />
            <span>Grad-CAM Explainable Heatmap: <strong>Enabled</strong></span>
          </div>
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-agro-400" />
            <span>Severity Segmentation: <strong>Calibrated</strong></span>
          </div>
        </div>
      </div>

      {/* Core AI Modules Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Diagnostic & Intelligence Modules</h2>
            <p className="text-xs text-slate-500">Select any module to inspect, diagnose, or monitor crops and flowers</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featureCards.map((card, i) => (
            <Link
              key={i}
              to={card.link}
              className="group bg-white rounded-2xl p-5 border border-slate-200/80 hover:border-agro-500/50 hover:shadow-lg hover:shadow-agro-500/5 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${card.color} flex items-center justify-center text-white shadow-md`}>
                    <card.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {card.tag}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-800 group-hover:text-agro-700 transition">
                  {card.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {card.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-agro-700 group-hover:translate-x-1 transition duration-200">
                <span>Launch Tool</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Detection History */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-agro-700" />
            <h3 className="text-sm font-bold text-slate-900">{t('history')}</h3>
          </div>
          <Link to="/history" className="text-xs font-semibold text-agro-700 hover:underline">
            View All History &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading detection records...</div>
        ) : history.length === 0 ? (
          <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-xs text-slate-500">{t('noHistory')}</p>
            <Link
              to="/detect"
              className="mt-3 inline-flex items-center space-x-1.5 px-4 py-2 bg-agro-600 hover:bg-agro-700 text-white rounded-lg text-xs font-semibold transition"
            >
              <ScanLine className="w-4 h-4" />
              <span>Scan Your First Plant</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {history.slice(0, 3).map((item) => (
              <div
                key={item._id}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-agro-300 transition flex items-start space-x-3 bg-slate-50/50"
              >
                <img
                  src={item.originalImageUrl || '/placeholder.png'}
                  alt={item.plantName}
                  className="w-14 h-14 rounded-lg object-cover bg-slate-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 truncate">{item.plantName}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                      item.condition === 'healthy' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {item.condition}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 truncate mt-0.5">{item.primaryDisease}</p>
                  <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
                    <span>{item.confidence.toFixed(1)}% confidence</span>
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;

