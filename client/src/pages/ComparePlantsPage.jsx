import React, { useState } from 'react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import {
  GitCompare,
  Upload,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Sparkles
} from 'lucide-react';

const ComparePlantsPage = () => {
  const { t } = useLanguage();
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [prev1, setPrev1] = useState('');
  const [prev2, setPrev2] = useState('');
  const [diag1, setDiag1] = useState(null);
  const [diag2, setDiag2] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFile1 = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile1(file);
      setPrev1(URL.createObjectURL(file));
      setDiag1(null);
    }
  };

  const handleFile2 = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile2(file);
      setPrev2(URL.createObjectURL(file));
      setDiag2(null);
    }
  };

  const runComparison = async () => {
    if (!file1 || !file2) {
      setError('Please select two plant leaf images to compare.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const fd1 = new FormData();
      fd1.append('image', file1);
      const fd2 = new FormData();
      fd2.append('image', file2);

      const [res1, res2] = await Promise.all([
        api.post('/detections/diagnose', fd1, { headers: { 'Content-Type': 'multipart/form-data' } }),
        api.post('/detections/diagnose', fd2, { headers: { 'Content-Type': 'multipart/form-data' } })
      ]);

      setDiag1(res1.data.detection);
      setDiag2(res2.data.detection);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Comparison analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-agro-50 border border-agro-200 text-agro-800 text-xs font-semibold mb-2">
          <GitCompare className="w-3.5 h-3.5 text-agro-600" />
          <span>Differential Pathology Comparison</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Healthy vs Diseased Plant Comparison
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Compare a reference healthy specimen against a suspected diseased leaf to isolate
          chlorophyll loss, lesion morphology, necrosis severity, and neural feature differences.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Dual Upload Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Sample 1 (Reference or Plant A) */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-black">
              1
            </span>
            <span>Plant Specimen A (Reference / Control)</span>
          </h3>

          <label className="block border-2 border-dashed border-slate-200 hover:border-agro-400 rounded-2xl p-4 text-center cursor-pointer transition min-h-[220px] flex flex-col items-center justify-center">
            <input
              type="file"
              onChange={handleFile1}
              accept="image/*"
              className="hidden"
            />
            {prev1 ? (
              <img
                src={prev1}
                alt="Plant A preview"
                className="max-h-48 rounded-xl object-cover shadow-2xs"
              />
            ) : (
              <div className="space-y-2 text-slate-400">
                <Upload className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-semibold text-slate-600">Select Leaf Image A</p>
                <p className="text-[11px]">Recommended: Healthy control leaf</p>
              </div>
            )}
          </label>

          {diag1 && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{diag1.primaryDisease}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  diag1.condition === 'healthy' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}>
                  {diag1.condition}
                </span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Confidence: <strong>{diag1.confidence}%</strong> &bull; Severity: <strong>{diag1.severity?.level} ({diag1.severity?.percentage}%)</strong>
              </p>
              {diag1.gradCamImageUrl && (
                <img
                  src={diag1.gradCamImageUrl}
                  alt="Grad-CAM A"
                  className="rounded-xl max-h-36 mx-auto object-cover border border-slate-200 mt-2"
                />
              )}
            </div>
          )}
        </div>

        {/* Sample 2 (Suspected / Plant B) */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <span className="w-6 h-6 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center text-xs font-black">
              2
            </span>
            <span>Plant Specimen B (Suspected / Test)</span>
          </h3>

          <label className="block border-2 border-dashed border-slate-200 hover:border-agro-400 rounded-2xl p-4 text-center cursor-pointer transition min-h-[220px] flex flex-col items-center justify-center">
            <input
              type="file"
              onChange={handleFile2}
              accept="image/*"
              className="hidden"
            />
            {prev2 ? (
              <img
                src={prev2}
                alt="Plant B preview"
                className="max-h-48 rounded-xl object-cover shadow-2xs"
              />
            ) : (
              <div className="space-y-2 text-slate-400">
                <Upload className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-semibold text-slate-600">Select Leaf Image B</p>
                <p className="text-[11px]">Suspected diseased or symptomatic leaf</p>
              </div>
            )}
          </label>

          {diag2 && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{diag2.primaryDisease}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  diag2.condition === 'healthy' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}>
                  {diag2.condition}
                </span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Confidence: <strong>{diag2.confidence}%</strong> &bull; Severity: <strong>{diag2.severity?.level} ({diag2.severity?.percentage}%)</strong>
              </p>
              {diag2.gradCamImageUrl && (
                <img
                  src={diag2.gradCamImageUrl}
                  alt="Grad-CAM B"
                  className="rounded-xl max-h-36 mx-auto object-cover border border-slate-200 mt-2"
                />
              )}
            </div>
          )}
        </div>

      </div>

      {/* Compare Button */}
      <div className="text-center">
        <button
          onClick={runComparison}
          disabled={loading || !file1 || !file2}
          className="py-3 px-8 bg-agro-700 hover:bg-agro-800 disabled:opacity-50 text-white rounded-2xl font-bold text-xs shadow-lg shadow-agro-700/20 inline-flex items-center space-x-2 transition"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Analyzing Both Leaves...</span>
            </>
          ) : (
            <>
              <GitCompare className="w-4 h-4" />
              <span>Run Differential Comparison</span>
            </>
          )}
        </button>
      </div>

      {/* Differential Summary Report */}
      {diag1 && diag2 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-4 shadow-sm animate-in fade-in">
          <h3 className="text-base font-bold text-slate-900">
            Differential Pathology Summary
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px]">Health Discrepancy</span>
              <p className="font-bold text-slate-800 mt-1">
                {diag1.condition === diag2.condition
                  ? 'Both samples share identical condition state'
                  : `Specimen A is ${diag1.condition.toUpperCase()} vs Specimen B is ${diag2.condition.toUpperCase()}`}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px]">Lesion Severity Delta</span>
              <p className="font-bold text-slate-800 mt-1">
                &Delta; {Math.abs((diag2.severity?.percentage || 0) - (diag1.severity?.percentage || 0)).toFixed(1)}% affected area
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px]">Pathogen Target</span>
              <p className="font-bold text-slate-800 mt-1">
                {diag2.condition !== 'healthy' ? diag2.primaryDisease : 'None (Healthy foliage)'}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ComparePlantsPage;
