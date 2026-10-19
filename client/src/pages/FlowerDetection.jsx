import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';
import ImageComparisonSlider from '../components/ImageComparisonSlider';
import {
  Upload,
  Layers,
  AlertTriangle,
  Info,
  RefreshCw,
  Cpu,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Flower2,
  Sparkles,
  MessageSquare,
  SlidersHorizontal,
  Eye,
  FileQuestion,
  HelpCircle,
  Calendar,
  HeartPulse,
  ExternalLink,
  BookOpen,
  Volume2,
  VolumeX,
  FileText,
  Download
} from 'lucide-react';

const FlowerDetection = () => {
  const { language } = useLanguage();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);
  const [modelStatus, setModelStatus] = useState(null);
  const [error, setError] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Check model status on mount
    api.get('/detections/models/status')
      .then(res => setModelStatus(res.data))
      .catch(() => setModelStatus({ status: 'MODEL_SERVICE_OFFLINE' }));
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  const speakDiagnosis = (det) => {
    if (!window.speechSynthesis || !det) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();

    let textToSpeak = '';
    if (language === 'kn') {
      textToSpeak = `ಹೂವಿನ ಸಸ್ಯ: ${det.plantName}. ಪತ್ತೆಯಾದ ರೋಗ: ${det.primaryDisease}. ವಿಶ್ವಾಸಾರ್ಹತೆ: ${Math.round(det.confidence)} ಪ್ರತಿಶತ. `;
      if (det.recommendations?.organic?.[0]) textToSpeak += `ಸಾವಯವ ಪರಿಹಾರ: ${det.recommendations.organic[0]}. `;
      if (det.recommendations?.chemical?.[0]) textToSpeak += `ರಾಸಾಯನಿಕ ನಿಯಂತ್ರಣ: ${det.recommendations.chemical[0]}. `;
    } else if (language === 'hi') {
      textToSpeak = `पुष्प पादप: ${det.plantName}. पहचाना गया रोग: ${det.primaryDisease}. सटीकता: ${Math.round(det.confidence)} प्रतिशत. `;
      if (det.recommendations?.organic?.[0]) textToSpeak += `जैविक उपचार: ${det.recommendations.organic[0]}. `;
      if (det.recommendations?.chemical?.[0]) textToSpeak += `रासायनिक नियंत्रण: ${det.recommendations.chemical[0]}. `;
    } else {
      textToSpeak = `Flower: ${det.plantName}. Primary diagnosis: ${det.primaryDisease} with ${Math.round(det.confidence)} percent confidence. `;
      if (det.recommendations?.organic?.[0]) textToSpeak += `Recommended organic control: ${det.recommendations.organic[0]}. `;
      if (det.recommendations?.chemical?.[0]) textToSpeak += `Chemical control: ${det.recommendations.chemical[0]}. `;
    }

    const cleanText = textToSpeak.replace(/[*•#]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const voices = window.speechSynthesis.getVoices() || [];
    if (language === 'kn') {
      utterance.lang = 'kn-IN';
      const knVoice = voices.find(v => v.lang.startsWith('kn') || v.name.toLowerCase().includes('kannada'));
      if (knVoice) utterance.voice = knVoice;
    } else if (language === 'hi') {
      utterance.lang = 'hi-IN';
      const hiVoice = voices.find(v => v.lang.startsWith('hi') || v.name.toLowerCase().includes('hindi'));
      if (hiVoice) utterance.voice = hiVoice;
    } else {
      utterance.lang = 'en-IN';
      const enVoice = voices.find(v => v.lang.startsWith('en-IN') || v.lang.startsWith('en'));
      if (enVoice) utterance.voice = enVoice;
    }

    utterance.rate = 0.95;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setError('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('Image file exceeds the 10MB size limit.');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setDetectionResult(null);
      setError('');
    }
  };

  const handleDiagnose = async () => {
    if (!selectedFile) {
      setError('Please select or upload a flower or ornamental plant leaf image first.');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('plantType', 'flower');

    try {
      const res = await api.post('/detections/flower', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setDetectionResult(res.data);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to communicate with AI vision engine.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setDetectionResult(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getTranslatedSummary = () => {
    if (!detectionResult) return null;
    const translations = detectionResult.translations;
    if (language === 'kn' && translations?.kn) {
      return translations.kn;
    }
    if (language === 'hi' && translations?.hi) {
      return translations.hi;
    }
    return null;
  };

  const translated = getTranslatedSummary();
  const detection = detectionResult?.detection;
  const isHealthy = detection?.condition === 'healthy';
  const gradCamUrl = detectionResult?.gradCamUrl || detection?.gradCamImageUrl;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-semibold">
            <Flower2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>Floricultural & Ornamental Vision Diagnostic Engine</span>
          </div>
          {modelStatus && (
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-2.5 py-1 rounded-lg">
              Status: {modelStatus.status === 'MODEL_READY'
                ? `Model Ready (${modelStatus.flower_classes || 4} Classes)`
                : modelStatus.status}
            </span>
          )}
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Flower Disease Detection (Rose Pathology)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
          Evaluate foliar pathology for rose plants (<em>Rosa</em> spp.) using the dedicated Rose Leaf Disease Detection benchmark (Mendeley Data DOI: 10.17632/mdtpp2cmj4.1). Accurately diagnoses Healthy leaves, Black Spot, Downy Mildew, and Insect Infestation with Explainable AI (Grad-CAM).
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
          <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 font-medium">✓ Rose Healthy (795 original)</span>
          <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 font-medium">✓ Black Spot (432 original)</span>
          <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 font-medium">✓ Downy Mildew (390 original)</span>
          <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 font-medium">✓ Insect Infested (431 original)</span>
        </div>
        <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-2 italic">
          * Note: Sunflower, Marigold, Jasmine, and Hibiscus species are not supported until authentic certified datasets are integrated.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Zone */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 p-6 sm:p-8 space-y-4 shadow-xs">
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-rose-500 rounded-3xl p-8 text-center cursor-pointer transition min-h-[220px] flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-900/30"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
          />

          {previewUrl ? (
            <div className="space-y-3">
              <img
                src={previewUrl}
                alt="Flower preview"
                className="max-h-64 rounded-2xl object-cover shadow-sm mx-auto border border-slate-200 dark:border-slate-700"
              />
              <p className="text-xs text-slate-400">Click to replace selected image</p>
            </div>
          ) : (
            <div className="space-y-3 py-4 text-slate-400">
              <Upload className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Click or drag & drop flower leaf image
              </p>
              <p className="text-[11px] text-slate-400">
                Supported formats: JPEG, PNG, WebP &bull; Max size: 10MB
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={handleDiagnose}
            disabled={loading || !selectedFile}
            className="py-3 px-8 bg-rose-700 hover:bg-rose-800 disabled:opacity-50 text-white rounded-2xl font-bold text-xs shadow-lg shadow-rose-700/20 inline-flex items-center space-x-2 transition cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Running MobileNetV2 Inference...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Diagnose Flower Leaf</span>
              </>
            )}
          </button>
          {previewUrl && (
            <button
              onClick={resetForm}
              className="py-3 px-5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-2xl font-semibold text-xs transition"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Detection Results */}
      {detectionResult && detection && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in">
          
          {/* Result Header */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-700 pb-5">
            <div>
              <div className="flex items-center space-x-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  isHealthy ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                }`}>
                  {detection.condition}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {detection.modelUsed}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                {detection.plantName} — {detection.primaryDisease}
              </h2>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-slate-400 block font-semibold">Model Confidence</span>
              <span className="text-2xl font-black text-rose-700 dark:text-rose-400">
                {detection.confidence}%
              </span>
            </div>
          </div>

          {/* Quick Actions: Audio Readout & Download PDF Report */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80">
            <button
              type="button"
              onClick={() => speakDiagnosis(detection)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-700 dark:hover:text-rose-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 shadow-2xs transition"
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-red-600" />
                  <span className="text-red-600">Stop Voice Readout</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Listen to Diagnosis</span>
                </>
              )}
            </button>
            {detection._id && (
              <a
                href={`/api/reports/${detection._id}/pdf${localStorage.getItem('agrobloom_token') ? `?token=${encodeURIComponent(localStorage.getItem('agrobloom_token'))}` : ''}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold shadow-xs transition"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Download Pathology Report (PDF)</span>
              </a>
            )}
          </div>

          {/* Uncertainty Alert */}
          {detectionResult.isUncertain && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Diagnostic Uncertainty Alert (Shannon Entropy: {detectionResult.entropy})</p>
                <p className="mt-0.5 text-amber-700 dark:text-amber-300">
                  {detectionResult.uncertaintyWarning || 'The AI confidence is low or split between rose pathology categories. We recommend capturing a clearer photo under diffused natural light.'}
                </p>
              </div>
            </div>
          )}

          {/* EXPLAINABLE AI (GRAD-CAM) & IMAGE COMPARISON SLIDER */}
          {gradCamUrl && (
            <div className="p-5 sm:p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Explainable AI — Grad-CAM Visual Attention
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Target Layer: <code className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px]">out_relu</code> (MobileNetV2 final 7×7×1280 conv activation)
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                  <button
                    onClick={() => setViewMode('slider')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                      viewMode === 'slider'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    Comparison Slider
                  </button>
                  <button
                    onClick={() => setViewMode('sideBySide')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                      viewMode === 'sideBySide'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    Side by Side
                  </button>
                </div>
              </div>

              {viewMode === 'slider' ? (
                <ImageComparisonSlider
                  originalImage={previewUrl}
                  modifiedImage={gradCamUrl}
                  originalLabel="Original Rose Leaf Photo"
                  modifiedLabel="Grad-CAM Attention Heatmap"
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block mb-1">Original Rose Leaf Photo</span>
                    <img
                      src={previewUrl}
                      alt="Original"
                      className="w-full aspect-4/3 object-cover rounded-2xl border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 block mb-1">Grad-CAM Activation Heatmap</span>
                    <img
                      src={gradCamUrl}
                      alt="Grad-CAM"
                      className="w-full aspect-4/3 object-cover rounded-2xl border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>
              )}

              {/* Crucial Notice */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                <p className="font-semibold flex items-center space-x-1.5">
                  <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Model Attention Notice</span>
                </p>
                <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
                  {detectionResult.gradCamExplanation || "Grad-CAM visualizes class activation gradients across the final convolutional layer (out_relu) highlighting salient foliar features that influenced the MobileNetV2 classification. It indicates neural focus, not a clinically or botanically validated disease segmentation mask."}
                </p>
              </div>
            </div>
          )}

          {/* PHASE 3 COMPUTER VISION MODULE STATUS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* Segmentation Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 dark:text-slate-300">Lesion Segmentation</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  DATASET_REQUIRED
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Pixel-level annotated masks (U-Net) required. Zero synthetic masks are fabricated to protect scientific validity.
              </p>
            </div>

            {/* Severity Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 dark:text-slate-300">Severity Assessment</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                  NOT_AVAILABLE
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Formula: (Diseased pixels / Total leaf pixels) × 100. Awaits verified segmentation model.
              </p>
            </div>

            {/* Multiple Disease Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 dark:text-slate-300">Concurrent Diseases</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  DATASET_REQUIRED
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Mendeley Rose benchmark provides single-label labels. Multi-label spatial annotations are required.
              </p>
            </div>
          </div>

          {/* Multilingual Overview if available */}
          {translated && (
            <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200/70 dark:border-rose-800/70 space-y-1">
              <h3 className="text-xs font-bold text-rose-900 dark:text-rose-200">
                {language === 'kn' ? 'ಸ್ಥಳೀಯ ಭಾಷಾ ವಿವರಣೆ (ಕನ್ನಡ): ' : 'क्षेत्रीय भाषा विवरण (हिंदी): '}
                {translated.disease}
              </h3>
              <p className="text-xs text-slate-700 dark:text-slate-300">{translated.summary}</p>
              {translated.cure && (
                <p className="text-xs font-medium text-rose-800 dark:text-rose-300 mt-1">
                  <strong>{language === 'kn' ? 'ಪರಿಹಾರ: ' : 'उपचार: '}</strong>{translated.cure}
                </p>
              )}
            </div>
          )}

          {/* Top Predictions Bar */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Diagnostic Class Probabilities
            </h3>
            <div className="space-y-2">
              {(detection.topPredictions || []).map((pred, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
                    <span>{pred.label.replace('___', ' — ').replace(/_/g, ' ')}</span>
                    <span className="font-bold">{pred.confidence}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        i === 0 ? 'bg-rose-600' : 'bg-slate-400'
                      }`}
                      style={{ width: `${pred.confidence}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pathogen Details & Symptoms */}
          {detectionResult.pathogenDetails && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 font-bold block uppercase text-[10px]">Causal Pathogen</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 mt-1 block">
                  {detectionResult.pathogenDetails.causalAgent}
                </span>
                <span className="text-slate-400 font-bold block uppercase text-[10px] mt-3">Severity Rating</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
                  {detectionResult.pathogenDetails.severityRisk}
                </span>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 font-bold block uppercase text-[10px]">Observable Foliar Symptoms</span>
                <p className="text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                  {detectionResult.pathogenDetails.symptoms}
                </p>
              </div>
            </div>
          )}

          {/* Grounded Recommendations */}
          {detectionResult.recommendations && (
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-rose-600" />
                <span>Floricultural Care & Disease Management</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {detectionResult.recommendations.organic?.length > 0 && (
                  <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 space-y-1.5">
                    <span className="font-bold text-emerald-800 dark:text-emerald-300 block text-[11px] uppercase tracking-wide">
                      🌿 Organic Treatments
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
                      {detectionResult.recommendations.organic.map((item, idx) => (
                        <li key={idx} className="leading-relaxed">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {detectionResult.recommendations.chemical?.length > 0 && (
                  <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40 space-y-1.5">
                    <span className="font-bold text-blue-800 dark:text-blue-300 block text-[11px] uppercase tracking-wide">
                      🧪 Chemical Controls
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
                      {detectionResult.recommendations.chemical.map((item, idx) => (
                        <li key={idx} className="leading-relaxed">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {detectionResult.recommendations.cultural?.length > 0 && (
                  <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 space-y-1.5">
                    <span className="font-bold text-amber-800 dark:text-amber-300 block text-[11px] uppercase tracking-wide">
                      🌾 Cultural Practices
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
                      {detectionResult.recommendations.cultural.map((item, idx) => (
                        <li key={idx} className="leading-relaxed">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {detectionResult.recommendations.prevention?.length > 0 && (
                  <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-800/40 space-y-1.5">
                    <span className="font-bold text-purple-800 dark:text-purple-300 block text-[11px] uppercase tracking-wide">
                      🛡️ Long-term Prevention
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
                      {detectionResult.recommendations.prevention.map((item, idx) => (
                        <li key={idx} className="leading-relaxed">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Observation Schedule & Expert Advisory */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 space-y-1">
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px] block flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-rose-600" />
                    <span>Recommended Observation Interval</span>
                  </span>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                    {detectionResult.pathogenDetails?.observationInterval || "Inspect foliage every 5 days during active growing season."}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/50 space-y-1">
                  <span className="font-bold text-amber-900 dark:text-amber-300 text-[11px] block flex items-center space-x-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>When to Seek Expert Extension Review</span>
                  </span>
                  <p className="text-amber-800 dark:text-amber-400 text-[11px] leading-relaxed">
                    {detectionResult.pathogenDetails?.whenToConsultExpert || "Consult local rose society or master gardener if defoliation exceeds 40%."}
                  </p>
                </div>
              </div>

              {/* Authoritative Sources */}
              {detectionResult.pathogenDetails?.sources?.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1.5">
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px] block flex items-center space-x-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-rose-600" />
                    <span>Authoritative Extension References</span>
                  </span>
                  <ul className="space-y-1 text-[11px]">
                    {detectionResult.pathogenDetails.sources.map((src, sIdx) => (
                      <li key={sIdx}>
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-rose-700 dark:text-rose-400 hover:underline flex items-center space-x-1"
                        >
                          <span>{src.title} — {src.organization}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Quick Action Links */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-700 text-xs">
            <Link
              to="/chatbot"
              state={{
                context: {
                  selectedPlant: 'Rose',
                  prediction: detectionResult.primaryDisease,
                  confidence: detectionResult.confidence,
                  className: detectionResult.className
                }
              }}
              className="inline-flex items-center space-x-1.5 text-rose-700 dark:text-rose-400 font-semibold hover:underline"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Ask AI Chatbot about Rose care</span>
            </Link>

            <Link
              to="/recovery"
              state={{
                detection: {
                  plantName: 'Rose',
                  diseaseName: detectionResult.primaryDisease,
                  initialImageUrl: previewUrl,
                  confidence: detectionResult.confidence
                }
              }}
              className="inline-flex items-center space-x-1.5 text-emerald-700 dark:text-emerald-400 font-semibold hover:underline"
            >
              <Calendar className="w-4 h-4" />
              <span>Track in Recovery Monitor</span>
            </Link>

            <Link
              to="/plant-care"
              state={{
                plantName: 'Rose',
                diseaseName: detectionResult.primaryDisease
              }}
              className="inline-flex items-center space-x-1.5 text-blue-700 dark:text-blue-400 font-semibold hover:underline"
            >
              <HeartPulse className="w-4 h-4" />
              <span>Create Care Plan</span>
            </Link>

            <Link
              to="/history"
              className="inline-flex items-center space-x-1.5 text-slate-600 dark:text-slate-400 font-semibold hover:underline"
            >
              <Clock className="w-4 h-4" />
              <span>View in Detection History</span>
            </Link>
          </div>

        </div>
      )}

    </div>
  );
};

export default FlowerDetection;
