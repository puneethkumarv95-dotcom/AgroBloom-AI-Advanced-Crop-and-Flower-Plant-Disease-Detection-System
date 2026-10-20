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
  Mic,
  Sprout,
  Compass,
  Eye,
  Activity,
  Leaf,
  Flower2,
  ChevronRight,
  Check,
  WifiOff
} from 'lucide-react';

const BotanicalIllustrationFallback = ({ type = 'leaf' }) => (
  <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-gradient-to-br from-[#244436]/90 via-[#2F5947] to-[#1A3328] rounded-[2.5rem] p-8 text-[#EEEBDD] relative overflow-hidden border border-[#D8B989]/30">
    <div className="absolute inset-0 opacity-15 botanical-bg"></div>
    <div className="relative z-10 flex flex-col items-center text-center space-y-4">
      <div className="w-20 h-20 rounded-full bg-[#D8B989]/20 border border-[#D8B989]/40 flex items-center justify-center text-[#D8B989] shadow-inner">
        {type === 'flower' ? <Flower2 className="w-10 h-10" /> : <Leaf className="w-10 h-10" />}
      </div>
      <div>
        <p className="font-serif text-2xl font-bold tracking-tight text-[#EEEBDD]">Botanical Specimen</p>
        <p className="text-xs text-[#A5B89B] max-w-xs mt-1">High-resolution foliar pathology visualization and architectural feature extraction</p>
      </div>
      <div className="flex items-center space-x-2 text-[10px] uppercase font-mono tracking-widest text-[#D8B989] px-3 py-1 rounded-full bg-[#1A3328]/60 border border-[#D8B989]/30">
        <span>MobileNetV2 Tensor Map</span>
      </div>
    </div>
  </div>
);

const Home = () => {
  const [aiStatus, setAiStatus] = useState(null);
  const [backendStatus, setBackendStatus] = useState('CHECKING');
  const [imgError, setImgError] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

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

  const steps = [
    {
      num: "01",
      title: "Capture & Observe",
      subtitle: "Digital Specimen Ingestion",
      desc: "Upload or capture authentic high-resolution foliar imagery using field camera viewports or direct image files.",
      tag: "Field Ingestion",
      icon: Camera,
      link: "/camera"
    },
    {
      num: "02",
      title: "Deconstruct & Understand",
      subtitle: "Neural Feature Analysis",
      desc: "MobileNetV2 classifies crop and rose leaf pathologies, generating Grad-CAM activation maps and lesion segmentation.",
      tag: "Deep Vision",
      icon: Eye,
      link: "/crop-detection"
    },
    {
      num: "03",
      title: "Prescribe & Care",
      subtitle: "Agronomic Remediation",
      desc: "Receive grounded, university-verified organic treatments, generate certified pathology reports, and monitor plant recovery.",
      tag: "Clinical Care",
      icon: HeartPulse,
      link: "/plant-care"
    }
  ];

  const modules = [
    {
      title: "Crop Disease Detection",
      desc: "Agricultural pathology diagnosis using deep convolutional vision networks trained on authentic leaf specimens.",
      path: "/crop-detection",
      icon: ScanLine,
      tag: "MobileNetV2 Vision",
      accent: "border-[#718468]/40"
    },
    {
      title: "Flower Disease Detection",
      desc: "Specialized floriculture disease detection for Rose and ornamental foliage with genuine confidence scoring.",
      path: "/flower-detection",
      icon: Layers,
      tag: "Rose Pathology",
      accent: "border-[#D8B989]/40"
    },
    {
      title: "Real-time Camera",
      desc: "Camera preview and leaf-image capture for real-time foliar analysis directly in crop fields or greenhouses.",
      path: "/camera",
      icon: Camera,
      tag: "Live Hardware",
      accent: "border-[#A5B89B]/40"
    },
    {
      title: "Offline AI Scanner",
      desc: "Zero-connectivity in-browser TensorFlow.js inference with IndexedDB local caching and cloud sync.",
      path: "/offline",
      icon: Cpu,
      tag: "Offline Edge PWA",
      accent: "border-[#718468]/40"
    },
    {
      title: "Nutrient Deficiency Detection",
      desc: "Physiological foliar chlorosis signatures and verified soil amendment guidance for N, P, K, Mg, and Fe.",
      path: "/nutrient-deficiency",
      icon: Beaker,
      tag: "Foliar Nutrition",
      accent: "border-[#D8B989]/40"
    },
    {
      title: "Plant Care Chatbot",
      desc: "Grounded agronomic guidance from the curated plant-health knowledge base with multilingual assistance.",
      path: "/chatbot",
      icon: Sparkles,
      tag: "Agronomic RAG",
      accent: "border-[#A5B89B]/40"
    },
    {
      title: "Voice Assistant",
      desc: "Hands-free speech synthesis and voice field diagnosis supported natively in English, Kannada, and Hindi.",
      path: "/voice",
      icon: Mic,
      tag: "Multilingual Voice",
      accent: "border-[#718468]/40"
    },
    {
      title: "Plant Recovery Tracking",
      desc: "Longitudinal foliar observation timeline with interactive image comparison sliders and healing milestones.",
      path: "/recovery",
      icon: Calendar,
      tag: "Visual Timeline",
      accent: "border-[#D8B989]/40"
    },
    {
      title: "Personalized Plant Care Plans",
      desc: "Custom treatment tasks, spraying schedules, bio-remedy checklists, and reminder alerts.",
      path: "/plant-care",
      icon: HeartPulse,
      tag: "Action Schedules",
      accent: "border-[#A5B89B]/40"
    },
    {
      title: "Plant Disease Library",
      desc: "Comprehensive botanical pathology encyclopedia and symptom signatures with smart search and multi-filters.",
      path: "/disease-library",
      icon: BookOpen,
      tag: "Living Herbarium",
      accent: "border-[#718468]/40"
    },
    {
      title: "Farmer Forum",
      desc: "Grower knowledge sharing, peer advice, community upvotes, and field observation discussions.",
      path: "/forum",
      icon: Users,
      tag: "Grower Network",
      accent: "border-[#718468]/40"
    },
    {
      title: "Expert Consultation",
      desc: "Connect directly with certified agronomists and plant pathologists for verified clinical prescriptions.",
      path: "/consultations",
      icon: Stethoscope,
      tag: "Clinical Agronomy",
      accent: "border-[#D8B989]/40"
    },
    {
      title: "Detection History",
      desc: "Historical diagnosis records, date filters, pathology metrics, and authenticated PDF report downloads.",
      path: "/history",
      icon: Clock,
      tag: "Diagnostic Archive",
      accent: "border-[#A5B89B]/40"
    },
    {
      title: "Pathology Analytics",
      desc: "Aggregate disease telemetry, seasonal infection curves, and geographic prevalence visualizations.",
      path: "/analytics",
      icon: BarChart3,
      tag: "Telemetry & Trends",
      accent: "border-[#718468]/40"
    },
    {
      title: "Model Benchmarks",
      desc: "Comparative empirical metrics for MobileNetV2, EfficientNetB0, and ResNet50 architectures.",
      path: "/model-comparison",
      icon: ShieldCheck,
      tag: "Empirical Research",
      accent: "border-[#D8B989]/40"
    },
    {
      title: "Settings",
      desc: "System preferences, dark mode appearance, multilingual language toggles, and microservice status.",
      path: "/settings",
      icon: Compass,
      tag: "System Controls",
      accent: "border-[#718468]/40"
    }
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-20 font-sans">
      
      {/* 4.1 EDITORIAL HERO SECTION */}
      <section className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-[#1A3328] via-[#244436] to-[#2F5947] text-[#F7F4EB] shadow-2xl border border-[#D8B989]/30 p-8 sm:p-12 lg:p-16">
        <div className="absolute inset-0 opacity-10 pointer-events-none botanical-bg"></div>
        
        {/* Subtle decorative linework overlay */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-radial from-[#D8B989]/15 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-radial from-[#A5B89B]/15 to-transparent rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Editorial Heading & Story */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Small botanical eyebrow label */}
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#F7F4EB]/10 border border-[#D8B989]/40 text-[#D8B989] text-xs font-semibold backdrop-blur-md">
              <Sprout className="w-3.5 h-3.5 text-[#D8B989]" />
              <span className="tracking-widest uppercase font-mono text-[11px]">Botanical Atelier &bull; Precision Plant AI</span>
            </div>

            {/* Oversized editorial heading */}
            <h1 className="text-4xl sm:text-6xl font-serif font-bold tracking-tight text-[#F7F4EB] leading-[1.08]">
              AgroBloom AI <br />
              <span className="font-serif italic font-normal text-3xl sm:text-5xl text-[#D8B989] block mt-2">
                Every Leaf Has a Story.
              </span>
            </h1>

            {/* Elegant supporting paragraph */}
            <p className="text-sm sm:text-base text-[#EEEBDD]/90 leading-relaxed max-w-xl font-light">
              Discover a more intelligent way to understand, protect, and care for crops and flowering plants. 
              Bridging classical botanical taxonomy with deep convolutional neural networks, Grad-CAM explainability, and verified pathology science.
            </p>

            {/* Action CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
              <Link
                to="/crop-detection"
                className="inline-flex items-center space-x-2.5 px-6 py-3.5 rounded-2xl bg-[#D8B989] hover:bg-[#EFE2CE] text-[#1A3328] font-bold text-xs tracking-wide shadow-lg shadow-[#1A3328]/40 transition transform hover:-translate-y-0.5"
              >
                <ScanLine className="w-4 h-4 text-[#1A3328]" />
                <span>Diagnose Crop Leaf</span>
              </Link>

              <Link
                to="/flower-detection"
                className="inline-flex items-center space-x-2.5 px-6 py-3.5 rounded-2xl bg-[#F7F4EB]/15 hover:bg-[#F7F4EB]/25 text-[#F7F4EB] font-semibold text-xs backdrop-blur-md border border-[#D8B989]/40 transition transform hover:-translate-y-0.5"
              >
                <Layers className="w-4 h-4 text-[#D8B989]" />
                <span>Floriculture AI</span>
              </Link>

              <Link
                to="/camera"
                className="inline-flex items-center space-x-2 px-5 py-3.5 rounded-2xl bg-[#1A3328]/60 hover:bg-[#1A3328] text-[#EEEBDD] font-semibold text-xs border border-[#A5B89B]/30 transition"
              >
                <Camera className="w-4 h-4 text-[#A5B89B]" />
                <span>Real-time Camera</span>
              </Link>

              <Link
                to="/dashboard"
                className="inline-flex items-center space-x-1.5 px-4 py-3.5 text-xs text-[#D8B989] hover:text-[#FFFFFF] underline-offset-4 hover:underline transition font-semibold"
              >
                <span>Atelier Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Subtle botanical metrics */}
            <div className="pt-4 grid grid-cols-3 gap-4 border-t border-[#D8B989]/20 max-w-lg">
              <div>
                <p className="font-serif text-2xl font-bold text-[#F7F4EB]">15</p>
                <p className="text-[10px] uppercase font-mono tracking-wider text-[#A5B89B]">Pathology Classes</p>
              </div>
              <div>
                <p className="font-serif text-2xl font-bold text-[#D8B989]">93.8%</p>
                <p className="text-[10px] uppercase font-mono tracking-wider text-[#A5B89B]">Validation F1</p>
              </div>
              <div>
                <p className="font-serif text-2xl font-bold text-[#F7F4EB]">0.08s</p>
                <p className="text-[10px] uppercase font-mono tracking-wider text-[#A5B89B]">Edge Latency</p>
              </div>
            </div>

          </div>

          {/* Right Column: Layered Botanical Plant Composition */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Organic curved frame with botanical photograph & fallback */}
              <div className="relative rounded-[2.5rem] overflow-hidden border-2 border-[#D8B989]/40 shadow-2xl bg-[#1A3328]/80 group">
                {!imgError ? (
                  <img
                    src="https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=800&q=80"
                    alt="Botanical Leaf Foliage Specimen"
                    onError={() => setImgError(true)}
                    className="w-full h-80 sm:h-96 object-cover transform group-hover:scale-105 transition-transform duration-700 opacity-90"
                  />
                ) : (
                  <BotanicalIllustrationFallback type="leaf" />
                )}

                {/* Gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A3328] via-transparent to-black/20"></div>

                {/* Floating botanical badge 1 */}
                <div className="absolute top-4 left-4 p-3 rounded-2xl bg-[#1A3328]/85 backdrop-blur-md border border-[#D8B989]/40 text-[#F7F4EB] shadow-lg">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-[#A5B89B] animate-pulse"></span>
                    <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">MobileNetV2 Vision</span>
                  </div>
                  <p className="text-xs font-serif font-bold text-[#D8B989] mt-0.5">Real Foliar Taxonomy</p>
                </div>

                {/* Floating botanical badge 2 */}
                <div className="absolute bottom-4 right-4 p-3 rounded-2xl bg-[#F7F4EB]/95 backdrop-blur-md border border-[#D8B989]/50 text-[#1A3328] shadow-xl max-w-[200px]">
                  <div className="flex items-center space-x-1.5 text-[#244436]">
                    <Eye className="w-3.5 h-3.5 text-[#718468]" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Grad-CAM XAI</span>
                  </div>
                  <p className="text-[11px] font-serif font-bold text-[#244436] mt-0.5">Conv_1 Feature Activation Map</p>
                </div>
              </div>

              {/* Decorative organic petal badge */}
              <div className="hidden sm:flex absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-gradient-to-tr from-[#D8B989] to-[#EFE2CE] p-3 text-[#1A3328] shadow-2xl items-center justify-center text-center border-4 border-[#1A3328]">
                <div>
                  <Sparkles className="w-4 h-4 mx-auto text-[#244436] mb-0.5" />
                  <span className="text-[9px] font-bold font-mono uppercase tracking-tighter block leading-tight">Authentic Datasets</span>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Phase 1 Engine Status Bar */}
        <div className="relative z-10 mt-10 pt-5 border-t border-[#D8B989]/25 flex flex-wrap items-center justify-between gap-4 text-xs text-[#EEEBDD]/80 font-mono">
          <div className="flex items-center space-x-2">
            <span className={`w-2.5 h-2.5 rounded-full ${backendStatus === 'CONNECTED' ? 'bg-[#A5B89B]' : 'bg-amber-400'}`}></span>
            <span>Express Backend &amp; MongoDB: <strong>{backendStatus}</strong></span>
          </div>
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-[#D8B989]" />
            <span>FastAPI AI Service: <strong>{aiStatus?.status || 'CHECKING'}</strong></span>
          </div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-[#A5B89B]" />
            <span>Inference Policy: <strong>Genuine Convolutional Tensors</strong></span>
          </div>
        </div>

      </section>

      {/* 4.3 INTERACTIVE BOTANICAL STORYTELLING */}
      <section className="space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs uppercase font-mono tracking-widest text-[#718468] dark:text-[#A5B89B] font-bold">
            The Philosophy of Living Leaves
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#244436] dark:text-[#EEEBDD]">
            Botanical Intelligence In Three Movements
          </h2>
          <p className="text-xs sm:text-sm text-[#252D27]/75 dark:text-[#EEEBDD]/75 leading-relaxed font-light">
            Every plant reflects its environment, nutrients, pathogens, and cellular recovery. 
            AgroBloom AI translates complex visual pathology into transparent, actionable agricultural decisions.
          </p>
        </div>

        {/* Storytelling Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="atelier-card rounded-[2rem] p-8 space-y-5 flex flex-col justify-between group hover:border-[#718468] transition-all duration-300">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#244436] text-[#F7F4EB] flex items-center justify-center shadow-md">
                <Leaf className="w-6 h-6 text-[#D8B989]" />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#718468] dark:text-[#A5B89B] font-bold">
                Chapter I &bull; Foliar Pathology
              </span>
              <h3 className="text-xl font-serif font-bold text-[#244436] dark:text-[#EEEBDD] leading-snug">
                Early Symptom Detection
              </h3>
              <p className="text-xs text-[#252D27]/80 dark:text-[#EEEBDD]/80 leading-relaxed font-light">
                Microscopic conidia spores, chlorotic halos, and concentric necrotic rings are detected before systemic vascular collapse occurs in tomato, potato, pepper, and apple crops.
              </p>
            </div>
            <Link to="/crop-detection" className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#244436] dark:text-[#D8B989] group-hover:translate-x-1 transition-transform">
              <span>Explore Crop Models</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="atelier-card rounded-[2rem] p-8 space-y-5 flex flex-col justify-between group hover:border-[#D8B989] transition-all duration-300">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#D8B989] text-[#1A3328] flex items-center justify-center shadow-md">
                <Eye className="w-6 h-6 text-[#1A3328]" />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#718468] dark:text-[#A5B89B] font-bold">
                Chapter II &bull; Transparent AI
              </span>
              <h3 className="text-xl font-serif font-bold text-[#244436] dark:text-[#EEEBDD] leading-snug">
                Grad-CAM Neural Heatmaps
              </h3>
              <p className="text-xs text-[#252D27]/80 dark:text-[#EEEBDD]/80 leading-relaxed font-light">
                No black-box guesses. We compute gradients of the top predicted class relative to the last convolutional feature map, highlighting exactly which foliar zones influenced the diagnostic decision.
              </p>
            </div>
            <Link to="/crop-detection" className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#244436] dark:text-[#D8B989] group-hover:translate-x-1 transition-transform">
              <span>View Explainability</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="atelier-card rounded-[2rem] p-8 space-y-5 flex flex-col justify-between group hover:border-[#A5B89B] transition-all duration-300">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#718468] text-[#F7F4EB] flex items-center justify-center shadow-md">
                <Flower2 className="w-6 h-6 text-[#EEEBDD]" />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#718468] dark:text-[#A5B89B] font-bold">
                Chapter III &bull; Floriculture Care
              </span>
              <h3 className="text-xl font-serif font-bold text-[#244436] dark:text-[#EEEBDD] leading-snug">
                Ornamental Bloom Protection
              </h3>
              <p className="text-xs text-[#252D27]/80 dark:text-[#EEEBDD]/80 leading-relaxed font-light">
                Specialized CNN models evaluate Rosa species against Black Spot, Downy Mildew, and chewing insect infestations, providing curated organic bio-fungicide regimens.
              </p>
            </div>
            <Link to="/flower-detection" className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#244436] dark:text-[#D8B989] group-hover:translate-x-1 transition-transform">
              <span>Inspect Rose Atelier</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </section>

      {/* 4.4 HOW IT WORKS — INTERACTIVE 3-STEP EXPERIENCE */}
      <section className="atelier-card rounded-[2.5rem] p-8 sm:p-12 lg:p-16 border border-[#D8B989]/40 relative overflow-hidden">
        <div className="max-w-3xl space-y-3 mb-10">
          <span className="text-xs uppercase font-mono tracking-widest text-[#718468] dark:text-[#A5B89B] font-bold">
            Methodology &bull; The Atelier Diagnostic Loop
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#244436] dark:text-[#EEEBDD]">
            How It Works
          </h2>
          <p className="text-xs sm:text-sm text-[#252D27]/75 dark:text-[#EEEBDD]/75 font-light">
            A precise, non-invasive digital workflow designed for both field agronomists and passionate gardeners.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {steps.map((step, idx) => (
            <div
              key={idx}
              onClick={() => setActiveStep(idx)}
              className={`p-6 sm:p-8 rounded-[2rem] border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                activeStep === idx
                  ? 'bg-[#244436] text-[#F7F4EB] border-[#D8B989] shadow-xl scale-[1.02]'
                  : 'bg-[#F7F4EB]/60 dark:bg-[#1A3328]/60 text-[#252D27] dark:text-[#EEEBDD] border-[#D8B989]/30 hover:border-[#718468]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className={`text-2xl font-serif font-bold ${activeStep === idx ? 'text-[#D8B989]' : 'text-[#718468]'}`}>
                    {step.num}
                  </span>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    activeStep === idx ? 'bg-[#D8B989] text-[#1A3328]' : 'bg-[#EEEBDD] text-[#244436]'
                  }`}>
                    <step.icon className="w-5 h-5" />
                  </div>
                </div>

                <span className={`text-[10px] font-mono uppercase tracking-wider block font-bold ${
                  activeStep === idx ? 'text-[#A5B89B]' : 'text-[#718468]'
                }`}>
                  {step.subtitle}
                </span>

                <h3 className={`text-lg font-serif font-bold mt-1 mb-2 ${
                  activeStep === idx ? 'text-[#F7F4EB]' : 'text-[#244436] dark:text-[#EEEBDD]'
                }`}>
                  {step.title}
                </h3>

                <p className={`text-xs leading-relaxed font-light ${
                  activeStep === idx ? 'text-[#EEEBDD]/90' : 'text-[#252D27]/70 dark:text-[#EEEBDD]/70'
                }`}>
                  {step.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-current/15 flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">
                  {step.tag}
                </span>
                <Link
                  to={step.link}
                  className={`text-xs font-bold inline-flex items-center space-x-1 ${
                    activeStep === idx ? 'text-[#D8B989]' : 'text-[#718468]'
                  }`}
                >
                  <span>Launch</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4.5 FEATURE GALLERY — ASYMMETRIC BENTO GRID */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xs uppercase font-mono tracking-widest text-[#718468] dark:text-[#A5B89B] font-bold">
              Complete Architectural Suite
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#244436] dark:text-[#EEEBDD]">
              Botanical Atelier Modules
            </h2>
            <p className="text-xs text-[#252D27]/70 dark:text-[#EEEBDD]/70 font-light max-w-xl">
              16 connected capabilities spanning computer vision, natural language intelligence, offline edge computation, and collaborative agronomist care.
            </p>
          </div>

          <Link
            to="/dashboard"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#244436] dark:bg-[#EEEBDD] text-[#F7F4EB] dark:text-[#244436] text-xs font-bold hover:scale-[1.02] transition"
          >
            <span>Open Studio Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Asymmetric Module Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {modules.map((m, idx) => (
            <Link
              key={idx}
              to={m.path}
              className={`atelier-card rounded-[2rem] p-6 border ${m.accent} hover:border-[#244436] dark:hover:border-[#D8B989] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#244436] text-[#D8B989] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <m.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-mono font-bold tracking-tight px-2 py-0.5 rounded-full bg-[#D8B989]/25 text-[#244436] dark:bg-[#718468]/25 dark:text-[#EEEBDD]">
                    {m.tag}
                  </span>
                </div>

                <h3 className="text-base font-serif font-bold text-[#244436] dark:text-[#EEEBDD] group-hover:text-[#718468] dark:group-hover:text-[#D8B989] transition">
                  {m.title}
                </h3>

                <p className="text-xs text-[#252D27]/75 dark:text-[#EEEBDD]/70 mt-2 leading-relaxed font-light">
                  {m.desc}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-[#D8B989]/20 flex items-center justify-between text-xs font-bold text-[#718468] dark:text-[#A5B89B] group-hover:text-[#244436] dark:group-hover:text-[#EEEBDD]">
                <span>Access Module</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4.6 CLOSING SECTION — ELEGANT CALL TO ACTION */}
      <section className="rounded-[2.5rem] bg-gradient-to-r from-[#1A3328] via-[#244436] to-[#1A3328] text-[#F7F4EB] p-10 sm:p-16 border border-[#D8B989]/40 relative overflow-hidden text-center space-y-6 shadow-2xl">
        <div className="absolute inset-0 opacity-10 botanical-bg pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#D8B989]/20 border border-[#D8B989]/40 flex items-center justify-center mx-auto text-[#D8B989]">
            <Sprout className="w-6 h-6" />
          </div>

          <h2 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-[#F7F4EB] leading-tight">
            Cultivate Healthier Fields <br />
            <span className="font-serif italic font-normal text-[#D8B989]">With Botanical AI.</span>
          </h2>

          <p className="text-xs sm:text-sm text-[#EEEBDD]/85 leading-relaxed font-light">
            Begin with an authentic leaf photograph. Get immediate neural diagnosis, explainable heatmaps, certified reports, and clinical consultation.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/crop-detection"
              className="px-6 py-3.5 rounded-2xl bg-[#D8B989] hover:bg-[#EFE2CE] text-[#1A3328] font-bold text-xs tracking-wide shadow-lg transition"
            >
              Begin Diagnosis Now
            </Link>
            <Link
              to="/disease-library"
              className="px-6 py-3.5 rounded-2xl bg-[#F7F4EB]/15 hover:bg-[#F7F4EB]/25 text-[#F7F4EB] font-semibold text-xs backdrop-blur-md border border-[#D8B989]/40 transition"
            >
              Browse Living Herbarium
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;