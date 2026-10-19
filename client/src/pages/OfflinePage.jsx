import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  initializeOfflineClassifier,
  diagnoseOffline
} from '../services/offlineClassifier';
import {
  saveOfflineRecord,
  getOfflineRecords,
  deleteOfflineRecord,
  synchronizeOfflineRecords
} from '../services/offlineStorage';
import {
  Wifi,
  WifiOff,
  Cpu,
  Upload,
  Camera,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
  BookOpen,
  Volume2,
  VolumeX,
  Clock,
  Layers,
  ArrowRight,
  Database,
  CloudUpload,
  Trash2,
  Check
} from 'lucide-react';

const OfflinePage = () => {
  const { user, isAuthenticated } = useAuth();
  const { t, language } = useLanguage();

  const [activeTab, setActiveTab] = useState('scanner'); // 'scanner' | 'history'
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [engineStatus, setEngineStatus] = useState({ ready: false, backend: 'checking' });
  const [plantMode, setPlantMode] = useState('crop'); // 'crop' | 'flower'
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Offline storage state
  const [offlineHistory, setOfflineHistory] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const fileInputRef = useRef(null);

  const loadHistory = async () => {
    const list = await getOfflineRecords();
    setOfflineHistory(list);
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    initializeOfflineClassifier().then((status) => {
      if (status.success) {
        setEngineStatus({ ready: true, backend: status.backend, details: status });
      } else {
        setEngineStatus({ ready: false, error: status.error });
      }
    });

    loadHistory();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.speechSynthesis?.cancel();
    };
  }, []);

  const handleImageSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPEG, PNG, WebP).');
      return;
    }
    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    setError('');
  };

  const handleDiagnose = async () => {
    if (!selectedImage) {
      setError('Please choose or capture a leaf photo first.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const diagnosis = await diagnoseOffline(selectedImage, plantMode);
      setResult(diagnosis);
      // Persist to browser IndexedDB
      await saveOfflineRecord(diagnosis);
      await loadHistory();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Offline diagnosis error.');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncToCloud = async () => {
    if (!isOnline) {
      alert('Cannot synchronize: you are currently offline. Please reconnect to the internet.');
      return;
    }
    if (!isAuthenticated) {
      alert('Please log in first to associate offline diagnoses with your account.');
      return;
    }

    setSyncing(true);
    setSyncMessage('');
    try {
      const res = await synchronizeOfflineRecords(api);
      if (res.success) {
        setSyncMessage(`Successfully synchronized ${res.count} records to your cloud detection history!`);
        await loadHistory();
      } else {
        alert(res.message || 'Sync failed');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Sync error');
    } finally {
      setSyncing(false);
    }
  };

  const handleDeleteLocal = async (localId) => {
    await deleteOfflineRecord(localId);
    await loadHistory();
  };

  const resetScanner = () => {
    setSelectedImage(null);
    setPreviewUrl('');
    setResult(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    window.speechSynthesis?.cancel();
  };

  const speakDiagnosis = () => {
    if (!window.speechSynthesis || !result) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    let text = `Offline diagnosis: ${result.plantName}. Condition: ${result.primaryDisease} with ${Math.round(result.confidence)} percent confidence.`;
    if (result.advice?.organic?.[0]) text += ` Recommended bio-remedy: ${result.advice.organic[0]}`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'kn' ? 'kn-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const pendingCount = offlineHistory.filter((r) => !r.synced).length;

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-16">
      {/* Header Banner */}
      <section className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold bg-agro-50 dark:bg-agro-950 border border-agro-200 dark:border-agro-800 text-agro-800 dark:text-agro-200">
            <Cpu className="h-4 w-4 text-agro-600 dark:text-agro-400" />
            <span>Browser-Side In-Memory Inference Engine</span>
          </div>

          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              isOnline
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 animate-pulse'
            }`}
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span>{isOnline ? 'Network Online' : 'Network Disconnected (PWA Offline Mode)'}</span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Offline AI Scanner
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
          Zero-connectivity plant disease classification powered by on-device TensorFlow.js. Model weights,
          bilinear foliar preprocessing, and agronomic management guidance execute 100% inside your browser.
        </p>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
          <button
            onClick={() => setActiveTab('scanner')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'scanner'
                ? 'bg-agro-700 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Live Offline Scanner
          </button>
          <button
            onClick={() => {
              setActiveTab('history');
              loadHistory();
            }}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'history'
                ? 'bg-agro-700 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Local Offline History</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white">
                {pendingCount}
              </span>
            )}
          </button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SCANNER VIEW */}
      {/* ========================================================================= */}
      {activeTab === 'scanner' && (
        <div className="space-y-6">
          {/* Engine Status Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                TensorFlow.js Runtime
              </span>
              <div className="flex items-center space-x-2 mt-1">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    engineStatus.ready ? 'bg-emerald-500' : 'bg-amber-500 animate-ping'
                  }`}
                />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 capitalize">
                  {engineStatus.ready ? `Active (${engineStatus.backend})` : 'Initializing Engine...'}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Crop Leaf Model
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 block">
                MobileNetV2 (11 Authentic Classes)
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Rose Flower Model
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 block">
                MobileNetV2 (4 Authentic Classes)
              </span>
            </div>
          </div>

          {/* Plant Mode Selector */}
          <div className="flex items-center justify-center space-x-3 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs max-w-sm mx-auto">
            <button
              onClick={() => {
                setPlantMode('crop');
                setResult(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                plantMode === 'crop'
                  ? 'bg-agro-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Crops (Tomato, Potato, etc.)
            </button>
            <button
              onClick={() => {
                setPlantMode('flower');
                setResult(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                plantMode === 'flower'
                  ? 'bg-agro-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Flowers (Rose Varieties)
            </button>
          </div>

          {/* Upload / Capture Section */}
          <div className="rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 sm:p-8 text-center space-y-4">
            {previewUrl ? (
              <div className="space-y-4">
                <img
                  src={previewUrl}
                  alt="Sample"
                  className="max-h-64 mx-auto rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-md"
                />
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={resetScanner}
                    className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Select Different Leaf
                  </button>
                  <button
                    onClick={handleDiagnose}
                    disabled={loading || !engineStatus.ready}
                    className="px-6 py-2 bg-agro-700 hover:bg-agro-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-agro-700/20 flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Computing Local Inference...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Run On-Device AI Diagnosis</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-agro-50 dark:bg-agro-950 border border-agro-200 dark:border-agro-800 flex items-center justify-center mx-auto text-agro-700 dark:text-agro-300">
                  <Upload className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Upload or Capture Leaf Photo
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Take a clear close-up photograph of the leaf showing both upper and lower foliar symptoms.
                  </p>
                </div>
                <div className="flex justify-center gap-3">
                  <label className="px-4 py-2 bg-agro-700 hover:bg-agro-800 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs flex items-center space-x-2">
                    <Upload className="w-4 h-4" />
                    <span>Upload Leaf Image</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageSelect(e.target.files[0])}
                    />
                  </label>
                  <label className="px-4 py-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold cursor-pointer shadow-xs flex items-center space-x-2 text-slate-700 dark:text-slate-300">
                    <Camera className="w-4 h-4" />
                    <span>Use Camera</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => handleImageSelect(e.target.files[0])}
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Diagnostic Result */}
          {result && (
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 mb-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Offline Diagnosis Complete</span>
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    {result.plantName} &mdash; {result.primaryDisease}
                  </h2>
                  <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
                    <span>Condition: {result.condition}</span>
                    <span>&bull;</span>
                    <span>Confidence: {result.confidence}%</span>
                    <span>&bull;</span>
                    <span>Inference: {result.inferenceTimeMs} ms</span>
                  </div>
                </div>

                <button
                  onClick={speakDiagnosis}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
                  title="Listen to diagnosis"
                >
                  {isSpeaking ? (
                    <VolumeX className="w-5 h-5 text-red-600 animate-pulse" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-agro-600" />
                  )}
                </button>
              </div>

              {/* Advice Recommendations */}
              {result.advice && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {result.advice.organic?.length > 0 && (
                    <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-1">
                      <span className="font-bold text-emerald-800 dark:text-emerald-300 block">
                        Biological & Organic Care
                      </span>
                      <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                        {result.advice.organic.map((it, i) => (
                          <li key={i}>{it}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.advice.chemical?.length > 0 && (
                    <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 space-y-1">
                      <span className="font-bold text-blue-800 dark:text-blue-300 block">
                        Fungicidal Control
                      </span>
                      <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                        {result.advice.chemical.map((it, i) => (
                          <li key={i}>{it}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.advice.prevention?.length > 0 && (
                    <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-1">
                      <span className="font-bold text-amber-800 dark:text-amber-300 block">
                        Preventive Sanitation
                      </span>
                      <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                        {result.advice.prevention.map((it, i) => (
                          <li key={i}>{it}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 flex items-center justify-between">
                <span>
                  Result persisted to local device IndexedDB storage. Connect to the internet to sync with cloud.
                </span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved locally</span>
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* HISTORY & SYNC VIEW */}
      {/* ========================================================================= */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Database className="w-4 h-4 text-agro-600" />
                <span>On-Device Offline Diagnosis Records (IndexedDB)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {offlineHistory.length} total local records ({pendingCount} pending cloud synchronization)
              </p>
            </div>

            <button
              onClick={handleSyncToCloud}
              disabled={syncing || pendingCount === 0 || !isOnline}
              className="px-4 py-2 bg-agro-700 hover:bg-agro-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 transition shadow-xs"
            >
              <CloudUpload className={`w-4 h-4 ${syncing ? 'animate-bounce' : ''}`} />
              <span>{syncing ? 'Syncing to Server...' : 'Sync Pending to Cloud'}</span>
            </button>
          </div>

          {syncMessage && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{syncMessage}</span>
            </div>
          )}

          {offlineHistory.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-center space-y-2">
              <Database className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No offline records stored yet
              </p>
              <p className="text-xs text-slate-400">
                Diagnoses performed using the offline scanner are stored locally in your browser and listed here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {offlineHistory.map((rec) => (
                <div
                  key={rec.clientLocalId}
                  className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {rec.plantName} &mdash; {rec.primaryDisease}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          rec.synced
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {rec.synced ? 'Synced' : 'Pending Sync'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center space-x-2">
                      <span>Confidence: {rec.confidence}%</span>
                      <span>&bull;</span>
                      <span>{new Date(rec.timestamp).toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteLocal(rec.clientLocalId)}
                    className="p-2 text-slate-400 hover:text-red-600 rounded-lg transition"
                    title="Delete local record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OfflinePage;
