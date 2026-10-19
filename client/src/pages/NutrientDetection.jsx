import React, { useState } from 'react';
import {
  Sparkles,
  Upload,
  AlertTriangle,
  Info,
  Beaker,
  CheckCircle2,
  FileText,
  ExternalLink,
  ShieldAlert,
  HelpCircle,
  RefreshCw,
  Camera,
  BookOpen
} from 'lucide-react';
import api from '../services/api';

const DEFICIENCY_GUIDES = [
  {
    element: 'Nitrogen (N)',
    type: 'Macronutrient (Mobile)',
    symptomLocation: 'Oldest / Basal Leaves First',
    visualKey: 'Uniform pale green to golden-yellow chlorosis; stunted vegetative vigor and spindly stems.',
    soilPhysiology: 'Leaching in high-rainfall sandy soils; low soil organic matter; denitrification in saturated waterlogged soils.',
    diagnosticConfusion: 'Frequently confused with root-knot nematodes, waterlogging, or sulfur deficiency.'
  },
  {
    element: 'Phosphorus (P)',
    type: 'Macronutrient (Mobile)',
    symptomLocation: 'Lower & Mid-Canopy Foliage',
    visualKey: 'Abnormal dull dark bluish-green leaves with vivid reddish-purple pigmentation (anthocyanin) along veins and petioles.',
    soilPhysiology: 'Fixed tightly in highly acidic (pH < 5.5) or highly alkaline/calcareous soils (pH > 7.5); restricted uptake in cold spring soils (<15°C).',
    diagnosticConfusion: 'Can be confused with viral anthocyanin accumulation or cold weather stress.'
  },
  {
    element: 'Potassium (K)',
    type: 'Macronutrient (Mobile)',
    symptomLocation: 'Mature Older Leaf Margins',
    visualKey: 'Marginal chlorosis rapidly advancing to scorched, necrotic brown leaf borders ("tip burn"); curled margins.',
    soilPhysiology: 'Low cation exchange capacity (CEC); excess magnesium or calcium competition; severe drought restricting ion mass flow.',
    diagnosticConfusion: 'Easily confused with bacterial leaf scorch, salinity burn, or drought stress.'
  },
  {
    element: 'Magnesium (Mg)',
    type: 'Macronutrient (Mobile)',
    symptomLocation: 'Older Lower Leaves',
    visualKey: 'Distinct interveinal chlorosis where principal veins remain sharply green while interveinal lamina turns pale yellow to ivory.',
    soilPhysiology: 'Leached easily in acidic sandy soils; excessive potassium (potash) fertilization antagonizing magnesium uptake.',
    diagnosticConfusion: 'Often mistaken for Spider Mite damage or Early Blight halo onset.'
  },
  {
    element: 'Iron (Fe)',
    type: 'Micronutrient (Immobile)',
    symptomLocation: 'Youngest Emerging Shoot Tips',
    visualKey: 'Vivid interveinal chlorosis appearing selectively on newest leaves; veins form fine dark green lattice while blade turns creamy white.',
    soilPhysiology: 'Precipitation into insoluble hydroxides in alkaline/calcareous soils (pH > 7.5); excessive phosphate; root-zone compaction.',
    diagnosticConfusion: 'May be confused with Zinc (Zn) deficiency or herbicide drift.'
  }
];

const NutrientDetection = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState(null);
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'guide'

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setDiagnosticResult(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setDiagnosticResult(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const res = await api.post('/detections/nutrient', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setDiagnosticResult(res.data);
    } catch (err) {
      // Backend returns HTTP 503 with DATASET_REQUIRED details
      const detail = err.response?.data || {
        status: 'DATASET_REQUIRED',
        error: 'MODEL_NOT_READY',
        message: 'Nutrient deficiency diagnostic model requires verified laboratory tissue assay dataset.',
        diagnosticAdvisory: 'Visual chlorosis alone cannot reliably diagnose nutrient deficiencies without laboratory foliar petiole testing.'
      };
      setDiagnosticResult(detail);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setDiagnosticResult(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
            <Beaker className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Nutrient Deficiency Detection
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Phytopathological chlorosis triage & university soil testing advisory
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'upload'
                ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Diagnostic Evaluation
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'guide'
                ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Symptom Key & Guide
          </button>
        </div>
      </div>

      {/* Scientific Integrity Advisory Banner */}
      <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-4 flex items-start space-x-3 text-xs leading-relaxed text-amber-900 dark:text-amber-200">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold">
            Scientific Standard Notice: Visual Symptoms vs Chemical Soil Assay
          </p>
          <p className="text-[11px] text-amber-800 dark:text-amber-300">
            Foliar chlorosis, necrosis, and purpling patterns overlap significantly between mobile macronutrient deficiencies (N, P, K, Mg) and abiotic stresses (drought, waterlogging, cold soil) or biotic root rots. In strict compliance with project scientific rules, AgroBloom AI prohibits fabricated neural predictions on unverified synthetic datasets. Diagnostic confirmation requires certified laboratory leaf petiole testing.
          </p>
        </div>
      </div>

      {activeTab === 'upload' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center space-x-2">
              <Upload className="w-4 h-4 text-amber-600" />
              <span>Submit Foliar Photograph for Evaluation</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-amber-500 transition cursor-pointer relative bg-slate-50/50 dark:bg-slate-950/30"
              >
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />

                {previewUrl ? (
                  <div className="space-y-3">
                    <img
                      src={previewUrl}
                      alt="Selected foliar sample"
                      className="max-h-56 mx-auto rounded-xl object-contain shadow-xs"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {selectedFile?.name} ({(selectedFile?.size / 1024).toFixed(1)} KB)
                    </p>
                    <p className="text-[11px] text-amber-700 dark:text-amber-400 underline">
                      Click or drag another image to replace
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 py-6">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        Drag & drop leaf photo here, or click to browse
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Supports JPEG, PNG, WEBP (Max 10MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="submit"
                  disabled={!selectedFile || loading}
                  className="flex-1 py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Evaluating Foliar Chlorosis...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Evaluate Nutrient Status</span>
                    </>
                  )}
                </button>

                {previewUrl && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs transition"
                  >
                    Reset
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Diagnostic evaluation result */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center space-x-2 mb-3">
                <FileText className="w-4 h-4 text-amber-600" />
                <span>Evaluation Results & Diagnostic Status</span>
              </h2>

              {diagnosticResult ? (
                <div className="space-y-4">
                  {/* Status chip */}
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                        Module Status: {diagnosticResult.status || 'DATASET_REQUIRED'}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-bold">
                        {diagnosticResult.error || 'UNAVAILABLE'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      {diagnosticResult.message || 'Nutrient deficiency diagnostic model requires authentic verified laboratory ground truth.'}
                    </p>
                  </div>

                  {/* Advisory */}
                  <div className="text-xs space-y-2 text-slate-600 dark:text-slate-400">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      Phytopathological Advisory:
                    </p>
                    <p className="leading-relaxed text-[11px] bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
                      {diagnosticResult.diagnosticAdvisory || diagnosticResult.advisory || 'Do not apply heavy chemical fertilizers solely based on visual leaf chlorosis. Submit a representative leaf petiole sample to your nearest accredited soil and plant testing laboratory.'}
                    </p>
                  </div>

                  {/* Supported deficiencies list */}
                  <div className="space-y-1.5 text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block text-[11px]">
                      Classes Requiring Certified Ground Truth:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(diagnosticResult.supportedDeficiencies || [
                        'Nitrogen (N)', 'Phosphorus (P)', 'Potassium (K)', 'Magnesium (Mg)', 'Iron (Fe)'
                      ]).map((item, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                  <Info className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                  <p className="text-xs">
                    Upload a plant leaf photograph to run input validation and review diagnostic criteria.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Standard: Zero Fabricated Predictions</span>
              <a
                href="https://extension.psu.edu/plant-nutrient-deficiencies"
                target="_blank"
                rel="noreferrer"
                className="text-amber-700 dark:text-amber-400 hover:underline flex items-center space-x-1"
              >
                <span>PennState Agronomy Guide</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Guide Tab: Interactive Visual Deficiency Key */}
      {activeTab === 'guide' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span>Foliar Nutrient Deficiency Diagnostic Key</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Use this university-extension diagnostic key to understand how nutrient mobility dictates symptom location on the plant architecture.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DEFICIENCY_GUIDES.map((guide, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-3 hover:border-amber-400 dark:hover:border-amber-700 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {guide.element}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                    {guide.type}
                  </span>
                </div>

                <div className="space-y-2 text-xs leading-relaxed">
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px] block">
                      Target Foliage Location:
                    </span>
                    <span className="text-slate-600 dark:text-slate-400 text-[11px]">
                      {guide.symptomLocation}
                    </span>
                  </div>

                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px] block">
                      Visual Symptoms:
                    </span>
                    <span className="text-slate-600 dark:text-slate-400 text-[11px]">
                      {guide.visualKey}
                    </span>
                  </div>

                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px] block">
                      Soil Factors & Causes:
                    </span>
                    <span className="text-slate-600 dark:text-slate-400 text-[11px]">
                      {guide.soilPhysiology}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-[11px] text-amber-900 dark:text-amber-300">
                    <span className="font-semibold">Diagnostic Overlap: </span>
                    {guide.diagnosticConfusion}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NutrientDetection;
