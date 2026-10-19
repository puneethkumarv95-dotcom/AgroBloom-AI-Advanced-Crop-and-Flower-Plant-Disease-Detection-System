import React, { useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import {
  Upload,
  ScanLine,
  CheckCircle,
  AlertTriangle,
  Eye,
  PieChart,
  FileText,
  ShieldAlert,
  ArrowRight,
  Layers,
  Sparkles,
  Info,
  Calendar,
  RefreshCw,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

const DetectionPage = () => {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') || 'general';
  const { t, language } = useLanguage();

  const [selectedType, setSelectedType] = useState(initialType);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [activeVisualTab, setActiveVisualTab] = useState('original');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError('');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError('');
    }
  };

  const handleDiagnose = async () => {
    if (!selectedFile) {
      setError('Please select or capture a plant leaf image first.');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('plantType', selectedType);

    try {
      const res = await api.post('/detections/diagnose', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setResult(res.data.detection);
      } else {
        setError(res.data.message || 'Diagnosis failed.');
      }
    } catch (err) {
      console.error('Diagnosis error:', err);
      setError(
        err.response?.data?.message ||
        'Failed to connect to AI vision server. The neural network may still be compiling weights.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      
      {/* Page Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-agro-50 border border-agro-200 text-agro-800 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-agro-600" />
              <span>MobileNetV2 Deep Learning Inference Engine</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {t('detectDisease')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
              Upload leaf imagery for crops, flowers, or nutrient deficiencies to receive real-time 
              neural classification, Grad-CAM activation heatmaps, and lesion severity segmentation.
            </p>
          </div>

          {/* Category Selector Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-2xl shrink-0">
            {[
              { id: 'general', label: 'All Plants' },
              { id: 'crop', label: 'Crops' },
              { id: 'flower', label: 'Flowers' },
              { id: 'nutrient', label: 'Nutrients' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedType(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  selectedType === tab.id
                    ? 'bg-white text-agro-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Upload and Control Area */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Upload Dropzone */}
        <div className="md:col-span-7 space-y-4">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition ${
              previewUrl
                ? 'border-agro-400 bg-agro-50/20'
                : 'border-slate-300 hover:border-agro-500 bg-white hover:bg-slate-50/50'
            }`}
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
                  alt="Leaf preview"
                  className="max-h-72 mx-auto rounded-2xl object-cover shadow-sm border border-slate-200"
                />
                <p className="text-xs text-slate-500">
                  Click to replace image &bull; Supported formats: JPEG, PNG, WebP
                </p>
              </div>
            ) : (
              <div className="py-8 space-y-3">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-agro-100 text-agro-700 flex items-center justify-center shadow-xs">
                  <Upload className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">
                  {t('dropImageHere')}
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Take a clear, focused photo of the diseased leaf under adequate lighting.
                </p>
                <button
                  type="button"
                  className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs"
                >
                  Browse Files
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleDiagnose}
              disabled={loading || !selectedFile}
              className="flex-1 py-3 px-6 bg-agro-700 hover:bg-agro-800 disabled:opacity-50 text-white rounded-2xl font-bold text-xs shadow-lg shadow-agro-700/20 flex items-center justify-center space-x-2 transition"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{t('diagnosing')}</span>
                </>
              ) : (
                <>
                  <ScanLine className="w-4 h-4" />
                  <span>{t('diagnoseNow')}</span>
                </>
              )}
            </button>

            <Link
              to="/camera"
              className="py-3 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl font-semibold text-xs flex items-center space-x-1.5 transition"
            >
              <span>Live Camera</span>
            </Link>
          </div>
        </div>

        {/* Right Info Box / Guidance */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 space-y-3">
            <div className="flex items-center space-x-2 text-agro-800 font-bold text-xs">
              <Info className="w-4 h-4 text-agro-600" />
              <span>Supported Pathology Benchmark Classes</span>
            </div>
            <div className="text-[11px] text-slate-500 space-y-1.5 leading-relaxed">
              <p>
                <strong>Crops:</strong> Tomato (Early/Late Blight, Healthy), Apple (Scab, Black Rot, Healthy), 
                Bell Pepper (Bacterial Spot, Healthy), Potato (Early/Late Blight, Healthy).
              </p>
              <p>
                <strong>Flowers:</strong> Rose (Black Spot, Powdery Mildew, Healthy), Sunflower (Rust, Healthy).
              </p>
              <p>
                <strong>Nutrients:</strong> Nitrogen Deficiency, Iron Chlorosis (Interveinal Chlorosis).
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Total verified classes:</span>
              <span className="font-mono font-bold text-agro-700">18 Classes</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-agro-50 rounded-3xl border border-agro-200/80 p-5 space-y-2">
            <h4 className="text-xs font-bold text-agro-900">Diagnosis Quality Tips:</h4>
            <ul className="text-[11px] text-agro-800 space-y-1 list-disc list-inside">
              <li>Ensure the infected leaf fills at least 70% of frame.</li>
              <li>Avoid high camera glare or deep shadows.</li>
              <li>Capture upper leaf lamina where lesion rings form.</li>
            </ul>
          </div>
        </div>

      </div>

      {/* Results Section */}
      {result && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Out of Distribution Alert if detected */}
          {result.isOutOfDistribution && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start space-x-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Out-of-Distribution / Unknown Sample Warning</p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  The model detected high prediction entropy or low confidence. The uploaded image does not 
                  closely resemble any in-distribution crop or flower leaf class. Please verify image quality.
                </p>
              </div>
            </div>
          )}

          {/* Primary Result Banner */}
          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
            <div className="p-6 sm:p-8 space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      {result.plantName} &bull; {result.plantType}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      result.condition === 'healthy'
                        ? 'bg-emerald-100 text-emerald-800'
                        : result.condition === 'nutrient_deficiency'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {result.condition}
                    </span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
                    {result.primaryDisease}
                  </h2>
                </div>

                <div className="flex items-center space-x-3">
                  {/* Download Report Button */}
                  <a
                    href={`/api/reports/${result._id}/pdf`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-xl shadow-xs transition"
                  >
                    <FileText className="w-4 h-4 text-agro-400" />
                    <span>{t('downloadReport')}</span>
                  </a>
                </div>
              </div>

              {/* Confidence & Severity Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Confidence */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-500">{t('confidence')}</span>
                  <div className="flex items-baseline space-x-2 mt-1">
                    <span className="text-2xl font-black text-slate-900">{result.confidence}%</span>
                    <span className="text-xs font-bold text-agro-700">Verified Model</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-2">
                    <div
                      className="bg-agro-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${result.confidence}%` }}
                    />
                  </div>
                </div>

                {/* Severity Level */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-500">{t('severity')}</span>
                  <div className="flex items-baseline space-x-2 mt-1">
                    <span className="text-2xl font-black text-slate-900">
                      {result.severity?.level || 'None'}
                    </span>
                    <span className="text-xs text-slate-500">
                      ({result.severity?.percentage?.toFixed(1) || 0}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-2">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        result.severity?.level === 'Severe'
                          ? 'bg-red-500'
                          : result.severity?.level === 'Moderate'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, (result.severity?.percentage || 0) * 2)}%` }}
                    />
                  </div>
                </div>

                {/* Architecture */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-500">Architecture</span>
                  <div className="text-lg font-bold text-slate-800 mt-1">
                    {result.modelUsed || 'MobileNetV2'}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Explainable AI Grad-CAM active
                  </p>
                </div>

              </div>

              {/* Co-occurring Disease Alert */}
              {result.multipleDiseases?.length > 0 && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-1">
                  <p className="font-bold">Multi-Disease Co-infection Detected:</p>
                  {result.multipleDiseases.map((md, idx) => (
                    <p key={idx} className="text-[11px]">
                      &bull; <strong>{md.disease}</strong> ({md.confidence}% secondary confidence) - {md.region}
                    </p>
                  ))}
                </div>
              )}

              {/* Visualizer tabs: Original vs Grad-CAM vs Segmentation */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Computer Vision Pathology Inspection
                  </h3>
                  <div className="flex bg-slate-100 p-0.5 rounded-xl text-xs font-semibold">
                    <button
                      onClick={() => setActiveVisualTab('original')}
                      className={`px-3 py-1 rounded-lg transition ${
                        activeVisualTab === 'original' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500'
                      }`}
                    >
                      Original
                    </button>
                    <button
                      onClick={() => setActiveVisualTab('gradcam')}
                      className={`px-3 py-1 rounded-lg transition flex items-center space-x-1 ${
                        activeVisualTab === 'gradcam' ? 'bg-white shadow-2xs text-agro-800' : 'text-slate-500'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Grad-CAM (XAI)</span>
                    </button>
                    <button
                      onClick={() => setActiveVisualTab('segmentation')}
                      className={`px-3 py-1 rounded-lg transition flex items-center space-x-1 ${
                        activeVisualTab === 'segmentation' ? 'bg-white shadow-2xs text-agro-800' : 'text-slate-500'
                      }`}
                    >
                      <PieChart className="w-3.5 h-3.5" />
                      <span>Lesion Segmentation</span>
                    </button>
                  </div>
                </div>

                <div className="bg-slate-950 rounded-2xl p-4 flex items-center justify-center min-h-[300px]">
                  {activeVisualTab === 'original' && (
                    <img
                      src={result.originalImageUrl}
                      alt="Original leaf"
                      className="max-h-80 rounded-xl object-contain shadow-lg"
                    />
                  )}
                  {activeVisualTab === 'gradcam' && (
                    <div className="text-center space-y-2">
                      <img
                        src={result.gradCamImageUrl}
                        alt="Grad-CAM heatmap"
                        className="max-h-80 rounded-xl object-contain shadow-lg mx-auto"
                      />
                      <p className="text-[11px] text-slate-400">
                        Warm red/yellow regions mark convolutional feature activations triggering diagnosis.
                      </p>
                    </div>
                  )}
                  {activeVisualTab === 'segmentation' && (
                    <div className="text-center space-y-2">
                      <img
                        src={result.segmentationMaskUrl}
                        alt="Lesion segmentation"
                        className="max-h-80 rounded-xl object-contain shadow-lg mx-auto"
                      />
                      <p className="text-[11px] text-slate-400">
                        Red masks highlight necrotic lesion area ({result.severity?.percentage?.toFixed(1) || 0}% of leaf).
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Treatment & Remedies Section */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">
                  Grounded Agronomic Treatment & Prevention Plan
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Organic */}
                  <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                    <span className="text-xs font-bold text-emerald-900 block">
                      {t('organicRemedy')}
                    </span>
                    <ul className="text-[11px] text-emerald-800 space-y-1.5 list-disc list-inside">
                      {result.recommendations?.organic?.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      )) || <li>No specific organic intervention needed.</li>}
                    </ul>
                  </div>

                  {/* Chemical */}
                  <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-2">
                    <span className="text-xs font-bold text-rose-900 block">
                      {t('chemicalRemedy')}
                    </span>
                    <ul className="text-[11px] text-rose-800 space-y-1.5 list-disc list-inside">
                      {result.recommendations?.chemical?.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      )) || <li>No chemical application necessary.</li>}
                    </ul>
                  </div>

                  {/* Prevention */}
                  <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-2">
                    <span className="text-xs font-bold text-blue-900 block">
                      {t('prevention')}
                    </span>
                    <ul className="text-[11px] text-blue-800 space-y-1.5 list-disc list-inside">
                      {result.recommendations?.prevention?.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      )) || <li>Maintain regular plant observation and hygiene.</li>}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Recovery Tracking & Consult Expert */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
                <Link
                  to="/recovery"
                  className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-agro-50 hover:bg-agro-100 text-agro-800 font-semibold text-xs border border-agro-200 transition"
                >
                  <Calendar className="w-4 h-4 text-agro-600" />
                  <span>Start Recovery Tracking For This Plant</span>
                </Link>

                <div className="flex items-center space-x-2">
                  <Link
                    to="/consultations"
                    className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition"
                  >
                    <span>Request Expert Opinion</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default DetectionPage;
