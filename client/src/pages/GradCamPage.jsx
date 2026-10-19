import React, { useState } from 'react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import {
  Eye,
  Upload,
  Sparkles,
  Info,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  Layers,
  ArrowRight
} from 'lucide-react';

const GradCamPage = () => {
  const { t } = useLanguage();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [blendMode, setBlendMode] = useState('overlay'); // 'overlay' | 'original'

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setResult(null);
      setError('');
    }
  };

  const runGradCam = async () => {
    if (!file) {
      setError('Please select a plant leaf image to analyze with Grad-CAM.');
      return;
    }

    setLoading(true);
    setError('');

    const fd = new FormData();
    fd.append('image', file);

    try {
      const res = await api.post('/detections/diagnose', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setResult(res.data.detection);
      } else {
        setError(res.data.message || 'Grad-CAM calculation failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'AI service is currently busy training or compiling.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-agro-50 border border-agro-200 text-agro-800 text-xs font-semibold mb-2">
          <Eye className="w-3.5 h-3.5 text-agro-600" />
          <span>Explainable Artificial Intelligence (XAI)</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Explainable AI – Grad-CAM Visualizer
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Gradient-weighted Class Activation Mapping (Grad-CAM) illuminates the exact visual patterns,
          rings, and chlorotic patches that compelled the convolutional neural network to reach its diagnosis.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload area */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
        <label className="block border-2 border-dashed border-slate-200 hover:border-agro-500 rounded-2xl p-6 text-center cursor-pointer transition">
          <input
            type="file"
            onChange={handleFile}
            accept="image/*"
            className="hidden"
          />
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="max-h-60 rounded-xl mx-auto object-cover shadow-sm"
            />
          ) : (
            <div className="space-y-2 text-slate-400 py-6">
              <Upload className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-xs font-semibold text-slate-700">Select Leaf Image for Grad-CAM Extraction</p>
              <p className="text-[11px]">Extracts gradients from MobileNetV2 convolutional layers</p>
            </div>
          )}
        </label>

        <div className="flex justify-center">
          <button
            onClick={runGradCam}
            disabled={loading || !file}
            className="py-3 px-8 bg-agro-700 hover:bg-agro-800 disabled:opacity-50 text-white rounded-2xl font-bold text-xs shadow-lg shadow-agro-700/20 inline-flex items-center space-x-2 transition"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Computing Backpropagation Gradients...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Compute Grad-CAM Activation Heatmap</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Result Card */}
      {result && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-6 shadow-sm animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold uppercase text-slate-400">
                {result.plantName} &bull; {result.plantType}
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">{result.primaryDisease}</h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setBlendMode('original')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  blendMode === 'original' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Original View
              </button>
              <button
                onClick={() => setBlendMode('overlay')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  blendMode === 'overlay' ? 'bg-agro-700 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Grad-CAM Heatmap
              </button>
            </div>
          </div>

          <div className="bg-slate-950 rounded-2xl p-4 flex items-center justify-center min-h-[350px]">
            {blendMode === 'overlay' ? (
              <div className="text-center space-y-3">
                <img
                  src={result.gradCamImageUrl}
                  alt="Grad-CAM"
                  className="max-h-96 rounded-xl object-contain shadow-2xl mx-auto"
                />
                <p className="text-[11px] text-slate-300">
                  Heatmap gradient overlay: <strong>Red/Yellow</strong> represents dominant convolutional activations.
                </p>
              </div>
            ) : (
              <img
                src={result.originalImageUrl}
                alt="Original"
                className="max-h-96 rounded-xl object-contain shadow-2xl mx-auto"
              />
            )}
          </div>

          {/* Mathematical formulation explanation */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1.5">
            <h4 className="font-bold text-slate-800">Mathematical Formulation:</h4>
            <p className="text-[11px] font-mono text-slate-500">
              L_Grad-CAM = ReLU( &Sigma;_k &alpha;_k^c &middot; A^k ), where &alpha;_k^c = (1/Z) &Sigma;_i &Sigma;_j (&part; y^c / &part; A_ij^k)
            </p>
            <p className="text-[11px]">
              The gradient of class score y^c with respect to feature map activations A^k is globally pooled 
              to weight the spatial importance of diseased leaf tissue.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};

export default GradCamPage;
