import React, { useState, useRef, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import ImageComparisonSlider from '../components/ImageComparisonSlider';
import {
  Camera,
  RefreshCw,
  SwitchCamera,
  CheckCircle,
  AlertTriangle,
  Eye,
  FileText,
  PieChart,
  Layers,
  ArrowRight,
  Sparkles,
  StopCircle,
  Play,
  Settings2,
  Info
} from 'lucide-react';

const CameraPage = () => {
  const { t } = useLanguage();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const abortControllerRef = useRef(null);
  const autoSampleTimerRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // environment or user
  const [cameraActive, setCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [capturedImage, setCapturedImage] = useState(null);
  const [plantType, setPlantType] = useState('crop'); // 'crop' | 'flower'
  const [samplingMode, setSamplingMode] = useState('manual'); // 'manual' | 'auto'
  const [sampleInterval, setSampleInterval] = useState(4); // seconds
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Initialize camera safely
  const startCamera = useCallback(async () => {
    try {
      setError('');
      setPermissionDenied(false);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraActive(true);
    } catch (err) {
      console.error('Camera error:', err);
      setCameraActive(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionDenied(true);
        setError('Camera permission denied. Please allow camera permissions in your browser address bar.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No compatible camera found on this device. Please connect a webcam or use image upload.');
      } else {
        setError(`Unable to start camera: ${err.message || 'Check camera connection and browser permissions.'}`);
      }
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (autoSampleTimerRef.current) {
      clearInterval(autoSampleTimerRef.current);
      autoSampleTimerRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  }, [stream]);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const captureFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || loading) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], `live_capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
      setCapturedImage(URL.createObjectURL(blob));
      await runDiagnosis(file);
    }, 'image/jpeg', 0.95);
  }, [loading, plantType]);

  const runDiagnosis = async (file) => {
    if (loading) return;
    setLoading(true);
    setError('');

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const formData = new FormData();
    formData.append('image', file);
    formData.append('plantType', plantType);

    try {
      const endpoint = plantType === 'flower' ? '/detections/flower' : '/detections/crop';
      const res = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        signal: controller.signal
      });
      if (res.data.success) {
        setResult(res.data);
      } else {
        setError(res.data.message || 'Diagnosis failed');
      }
    } catch (err) {
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
        // Request was cancelled intentionally
        return;
      }
      setError(err.response?.data?.message || 'AI diagnosis failed to respond');
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Continuous auto-sample controller
  useEffect(() => {
    if (samplingMode === 'auto' && cameraActive) {
      autoSampleTimerRef.current = setInterval(() => {
        captureFrame();
      }, sampleInterval * 1000);
    } else {
      if (autoSampleTimerRef.current) {
        clearInterval(autoSampleTimerRef.current);
        autoSampleTimerRef.current = null;
      }
    }
    return () => {
      if (autoSampleTimerRef.current) {
        clearInterval(autoSampleTimerRef.current);
      }
    };
  }, [samplingMode, cameraActive, sampleInterval, captureFrame]);

  const detection = result?.detection;
  const isHealthy = detection?.condition === 'healthy';
  const gradCamUrl = result?.gradCamUrl || detection?.gradCamImageUrl;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-agro-50 dark:bg-agro-950 border border-agro-200 dark:border-agro-800 text-agro-800 dark:text-agro-200 text-xs font-semibold mb-1">
            <Camera className="w-3.5 h-3.5 text-agro-600 dark:text-agro-400" />
            <span>Live Optical Viewfinder & Diagnostics</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">{t('realtimeCamera')}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time optical capture directly from farm or greenhouse field
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Target Model Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-700/50 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setPlantType('crop')}
              className={`px-3 py-1.5 rounded-lg transition ${
                plantType === 'crop'
                  ? 'bg-agro-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              Crop Model
            </button>
            <button
              onClick={() => setPlantType('flower')}
              className={`px-3 py-1.5 rounded-lg transition ${
                plantType === 'flower'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              Rose Model
            </button>
          </div>

          <button
            onClick={toggleCamera}
            title="Switch Camera (Front/Back)"
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
          >
            <SwitchCamera className="w-4 h-4" />
          </button>

          {!cameraActive ? (
            <button
              onClick={startCamera}
              className="px-4 py-2 bg-agro-700 hover:bg-agro-800 text-white rounded-xl text-xs font-semibold shadow-xs inline-flex items-center space-x-1.5"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Start Camera</span>
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold inline-flex items-center space-x-1.5"
            >
              <StopCircle className="w-3.5 h-3.5" />
              <span>Stop</span>
            </button>
          )}
        </div>
      </div>

      {/* Sampling Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-600 dark:text-slate-300">
        <div className="flex items-center space-x-2">
          <Settings2 className="w-4 h-4 text-slate-400" />
          <span className="font-semibold">Sampling Mode:</span>
          <button
            onClick={() => setSamplingMode('manual')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              samplingMode === 'manual'
                ? 'bg-agro-100 dark:bg-agro-950 text-agro-800 dark:text-agro-200 border border-agro-300 dark:border-agro-800'
                : 'hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            Manual Shutter
          </button>
          <button
            onClick={() => setSamplingMode('auto')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              samplingMode === 'auto'
                ? 'bg-agro-100 dark:bg-agro-950 text-agro-800 dark:text-agro-200 border border-agro-300 dark:border-agro-800'
                : 'hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            Auto Periodic (Rate-Controlled)
          </button>
        </div>

        {samplingMode === 'auto' && (
          <div className="flex items-center space-x-2">
            <span className="text-[11px] text-slate-400">Interval:</span>
            {[3, 5, 8].map((sec) => (
              <button
                key={sec}
                onClick={() => setSampleInterval(sec)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                  sampleInterval === sec
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Video Viewfinder */}
      <div className="relative rounded-3xl overflow-hidden bg-black aspect-video sm:aspect-4/3 flex items-center justify-center border-4 border-slate-900 shadow-2xl">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
        />

        <canvas ref={canvasRef} className="hidden" />

        {!cameraActive && (
          <div className="text-center text-slate-400 space-y-3 p-6 max-w-sm">
            <Camera className="w-12 h-12 mx-auto text-slate-600" />
            <p className="text-xs">
              {permissionDenied
                ? 'Camera access was blocked by browser. Please enable camera permission.'
                : 'Camera stream is stopped or inactive.'}
            </p>
            <button
              onClick={startCamera}
              className="px-5 py-2.5 bg-agro-700 hover:bg-agro-800 text-white rounded-xl text-xs font-semibold shadow-md"
            >
              Initialize Camera
            </button>
          </div>
        )}

        {/* Viewfinder crosshairs overlay */}
        {cameraActive && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className={`w-64 h-64 border-2 rounded-3xl relative transition-colors ${
              plantType === 'flower' ? 'border-rose-400/60' : 'border-emerald-400/60'
            }`}>
              <div className={`absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 ${plantType === 'flower' ? 'border-rose-400' : 'border-emerald-400'}`}></div>
              <div className={`absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 ${plantType === 'flower' ? 'border-rose-400' : 'border-emerald-400'}`}></div>
              <div className={`absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 ${plantType === 'flower' ? 'border-rose-400' : 'border-emerald-400'}`}></div>
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 ${plantType === 'flower' ? 'border-rose-400' : 'border-emerald-400'}`}></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 border border-white/40 rounded-full"></div>
            </div>
            <div className="absolute bottom-4 bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[11px] text-white font-medium flex items-center space-x-1.5">
              <span>Align diseased foliar lesion inside frame</span>
              {loading && <RefreshCw className="w-3 h-3 animate-spin text-emerald-400" />}
            </div>
          </div>
        )}

        {/* Shutter Button (Manual mode) */}
        {cameraActive && samplingMode === 'manual' && (
          <div className="absolute bottom-6 inset-x-0 flex items-center justify-center">
            <button
              onClick={captureFrame}
              disabled={loading}
              className={`w-16 h-16 rounded-full bg-white border-4 shadow-xl flex items-center justify-center transition disabled:opacity-50 hover:scale-105 active:scale-95 ${
                plantType === 'flower' ? 'border-rose-500 text-rose-700' : 'border-emerald-500 text-emerald-700'
              }`}
            >
              {loading ? (
                <RefreshCw className="w-7 h-7 animate-spin" />
              ) : (
                <div className={`w-10 h-10 rounded-full transition ${plantType === 'flower' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'}`} />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Captured Image Result Card */}
      {result && detection && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 p-6 space-y-6 shadow-xs animate-in fade-in">
          
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-700 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  isHealthy ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                }`}>
                  {detection.condition}
                </span>
                <span className="text-xs text-slate-400 font-medium">{detection.modelUsed}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {detection.plantName} — {detection.primaryDisease}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block font-semibold">Model Confidence</span>
              <span className="text-2xl font-black text-agro-700 dark:text-agro-400">
                {detection.confidence}%
              </span>
            </div>
          </div>

          {/* Uncertainty banner if flagged */}
          {result.isUncertain && (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{result.uncertaintyWarning || 'Low optical confidence. Keep camera steady and ensure even lighting.'}</span>
            </div>
          )}

          {/* Grad-CAM Comparison Slider on Captured Frame */}
          {gradCamUrl && capturedImage ? (
            <div className="space-y-2">
              <ImageComparisonSlider
                originalImage={capturedImage}
                modifiedImage={gradCamUrl}
                originalLabel="Captured Optical Frame"
                modifiedLabel="Grad-CAM Neural Attention"
              />
              <p className="text-[10px] text-slate-400 italic">
                * Note: Grad-CAM visualizes convolutional activation focus and is not a clinically validated disease mask.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Captured Frame</p>
                <img
                  src={capturedImage || detection.originalImageUrl}
                  alt="Captured"
                  className="rounded-2xl max-h-56 w-full object-cover border border-slate-200 dark:border-slate-700"
                />
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 flex flex-col justify-center space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Diagnostic Candidates</span>
                {(detection.topPredictions || []).slice(0, 3).map((tp, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <span className="text-slate-700 dark:text-slate-300 truncate font-medium">
                      {(tp.label || tp.className).replace('___', ' — ').replace(/_/g, ' ')}
                    </span>
                    <span className="font-bold text-agro-700 dark:text-agro-400 ml-2">{tp.confidence}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick remedies */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700 space-y-1.5 text-xs">
            <h4 className="font-bold text-slate-800 dark:text-slate-200">Recommended Agronomic Action:</h4>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              {detection.recommendations?.organic?.[0] || detection.recommendations?.chemical?.[0] || 'Observe leaf moisture levels and ensure balanced ventilation.'}
            </p>
          </div>
        </div>
      )}

    </div>
  );
};

export default CameraPage;
