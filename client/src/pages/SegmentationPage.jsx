import React, { useState } from 'react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import {
  PieChart,
  Upload,
  Layers,
  Activity,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Sliders,
  ChevronRight
} from 'lucide-react';

const SegmentationPage = () => {
  const { t } = useLanguage();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setResult(null);
      setError('');
    }
  };

  const runSegmentation = async () => {
    if (!file) {
      setError('Please select a leaf image for lesion segmentation.');
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
        setError(res.data.message || 'Segmentation failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'AI service error during segmentation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-agro-50 border border-agro-200 text-agro-800 text-xs font-semibold mb-2">
          <PieChart className="w-3.5 h-3.5 text-agro-600" />
          <span>Foliar Lesion Area Quantification</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Disease Severity Estimation & Segmentation
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Computer vision color-space segmentation isolates necrotic, chlorotic, and fungal mycelial
          lesions from healthy green parenchyma to calculate the exact percentage of infected leaf canopy.
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
              <p className="text-xs font-semibold text-slate-700">Select Leaf Image for Lesion Segmentation</p>
              <p className="text-[11px]">Computes lesion surface area against total leaf contour</p>
            </div>
          )}
        </label>

        <div className="flex justify-center">
          <button
            onClick={runSegmentation}
            disabled={loading || !file}
            className="py-3 px-8 bg-agro-700 hover:bg-agro-800 disabled:opacity-50 text-white rounded-2xl font-bold text-xs shadow-lg shadow-agro-700/20 inline-flex items-center space-x-2 transition"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Segmenting Foliar Lesions...</span>
              </>
            ) : (
              <>
                <Activity className="w-4 h-4" />
                <span>Segment Lesions & Estimate Severity</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-6 shadow-sm animate-in fade-in">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 block">Lesion Area Percentage</span>
              <span className="text-3xl font-black text-slate-900 mt-1 block">
                {result.severity?.percentage?.toFixed(1) || 0}%
              </span>
              <p className="text-[10px] text-slate-500 mt-1">of total leaf lamina area</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 block">Severity Classification</span>
              <span className={`text-2xl font-black mt-1 block ${
                result.severity?.level === 'Severe'
                  ? 'text-red-600'
                  : result.severity?.level === 'Moderate'
                  ? 'text-amber-600'
                  : 'text-emerald-600'
              }`}>
                {result.severity?.level || 'None'}
              </span>
              <p className="text-[10px] text-slate-500 mt-1">Threshold: 0-15% Mild, 15-40% Mod, &gt;40% Sev</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 block">Lesion Pixel Count</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                {result.severity?.affectedAreaSquarePixels?.toLocaleString() || 0} px
              </span>
              <p className="text-[10px] text-slate-500 mt-1">isolated within leaf boundary</p>
            </div>

          </div>

          {/* Segmentation Mask View */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Binary & Contour Segmentation Overlay
            </h3>
            <div className="bg-slate-950 rounded-2xl p-4 flex items-center justify-center min-h-[350px]">
              <img
                src={result.segmentationMaskUrl}
                alt="Segmentation mask"
                className="max-h-96 rounded-xl object-contain shadow-2xl mx-auto"
              />
            </div>
            <p className="text-[11px] text-slate-500 text-center">
              Green highlight: Intact healthy parenchyma &bull; Red highlight: Necrotic / chlorotic lesion &bull; Yellow border: Lesion contours
            </p>
          </div>

        </div>
      )}

    </div>
  );
};

export default SegmentationPage;
