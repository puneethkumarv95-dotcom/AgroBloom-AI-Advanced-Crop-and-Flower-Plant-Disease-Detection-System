import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ImageComparisonSlider from '../components/ImageComparisonSlider';
import {
  Calendar,
  Plus,
  Upload,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  Minus,
  ShieldAlert,
  Layers,
  ArrowRight,
  RefreshCw,
  FileText
} from 'lucide-react';

const VARIANCE_WARNING = (
  "Foliar photographic comparison is sensitive to ambient lighting, camera exposure, " +
  "angle of incidence, distance, and day-to-day leaf turgor. Observed visual changes reflect " +
  "morphological indications and do not constitute a quantitative chemical or microbiological assay."
);

const RecoveryPage = () => {
  const [records, setRecords] = useState([]);
  const [activeRecord, setActiveRecord] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Modals
  const [showNewModal, setShowNewModal] = useState(false);
  const [showObservationModal, setShowObservationModal] = useState(false);

  // New Record Form
  const [plantName, setPlantName] = useState('Tomato');
  const [diseaseName, setDiseaseName] = useState('Early Blight');
  const [plantType, setPlantType] = useState('crop');
  const [initialImage, setInitialImage] = useState(null);
  const [initialPreview, setInitialPreview] = useState('');
  const [initialNotes, setInitialNotes] = useState('');

  // Follow-up Observation Form
  const [followupImage, setFollowupImage] = useState(null);
  const [followupPreview, setFollowupPreview] = useState('');
  const [treatmentApplied, setTreatmentApplied] = useState('');
  const [observationNotes, setObservationNotes] = useState('');

  // Comparison view mode: 'slider' | 'side-by-side'
  const [viewMode, setViewMode] = useState('slider');

  const fetchRecords = async () => {
    try {
      const res = await api.get('/recovery');
      if (res.data.success) {
        const fetched = res.data.records || [];
        setRecords(fetched);
        if (fetched.length > 0 && !activeRecord) {
          selectRecord(fetched[0]);
        }
      }
    } catch (err) {
      console.error('[Fetch Recovery Records Error]:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectRecord = async (rec) => {
    setActiveRecord(rec);
    try {
      const res = await api.get(`/recovery/${rec._id}/progress`);
      if (res.data.success) {
        setProgressData(res.data);
      }
    } catch (err) {
      console.error('[Fetch Progress Error]:', err);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleCreateRecord = async (e) => {
    e.preventDefault();
    if (!initialImage) {
      alert('Please select an initial baseline photograph.');
      return;
    }

    setSubmitting(true);
    const fd = new FormData();
    fd.append('plantName', plantName);
    fd.append('diseaseName', diseaseName);
    fd.append('plantType', plantType);
    fd.append('image', initialImage);
    fd.append('notes', initialNotes);

    try {
      const res = await api.post('/recovery', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setShowNewModal(false);
        setInitialImage(null);
        setInitialPreview('');
        setInitialNotes('');
        await fetchRecords();
        if (res.data.record) {
          selectRecord(res.data.record);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create recovery tracking project.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddObservation = async (e) => {
    e.preventDefault();
    if (!activeRecord || !followupImage) {
      alert('Please select a follow-up observation photograph.');
      return;
    }

    setSubmitting(true);
    const fd = new FormData();
    fd.append('image', followupImage);
    fd.append('treatmentApplied', treatmentApplied);
    fd.append('notes', observationNotes);

    try {
      const res = await api.post(`/recovery/${activeRecord._id}/images`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setShowObservationModal(false);
        setFollowupImage(null);
        setFollowupPreview('');
        setTreatmentApplied('');
        setObservationNotes('');
        await selectRecord(activeRecord);
        await fetchRecords();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record follow-up observation.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Improving':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
            <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
            <span>Improving</span>
          </span>
        );
      case 'Worsening':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200">
            <TrendingUp className="w-3.5 h-3.5 text-rose-600" />
            <span>Worsening</span>
          </span>
        );
      case 'Resolved':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Resolved</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
            <Minus className="w-3.5 h-3.5 text-slate-500" />
            <span>Stable / Under Observation</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-agro-800 to-agro-600 flex items-center justify-center text-white shadow-md shadow-agro-700/20">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Plant Recovery Tracking
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Multi-temporal photographic disease progression & symptom monitoring
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-agro-700 hover:bg-agro-800 text-white shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Recovery Project</span>
        </button>
      </div>

      {/* Variance Disclaimer Alert Banner */}
      <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-4 flex items-start space-x-3 text-xs leading-relaxed text-amber-900 dark:text-amber-200">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold">Observation Variance Notice</p>
          <p className="text-[11px] text-amber-800 dark:text-amber-300">
            {VARIANCE_WARNING} In accordance with scientific integrity standards, no artificial recovery percentages are computed when calibrated segmentation ground truth is unavailable.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Projects sidebar */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs space-y-3 h-[620px] overflow-y-auto">
          <div className="flex items-center justify-between px-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Active Projects
            </span>
            <span className="text-[10px] font-mono text-slate-400">{records.length}</span>
          </div>

          {records.length === 0 && !loading && (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Calendar className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
              <p className="text-xs">No active recovery projects yet.</p>
              <button
                onClick={() => setShowNewModal(true)}
                className="text-[11px] text-agro-700 dark:text-agro-400 font-semibold underline"
              >
                Create your first project
              </button>
            </div>
          )}

          {records.map((rec) => (
            <button
              key={rec._id}
              onClick={() => selectRecord(rec)}
              className={`w-full text-left p-3 rounded-2xl transition space-y-2 block border ${
                activeRecord?._id === rec._id
                  ? 'bg-agro-50 dark:bg-agro-950/60 border-agro-300 dark:border-agro-800 shadow-2xs'
                  : 'border-slate-200/70 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <img
                  src={rec.initialImageUrl}
                  alt={rec.plantName}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div className="overflow-hidden">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {rec.plantName}
                  </h3>
                  <p className="text-[11px] text-slate-500 truncate">{rec.diseaseName}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                {getStatusBadge(rec.status)}
                <span className="text-slate-400">
                  {rec.observationsCount || 1} obs
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Project detail & comparison area */}
        <div className="lg:col-span-3 space-y-6">
          {activeRecord && progressData ? (
            <>
              {/* Project Status Bar */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      {activeRecord.plantName} — {activeRecord.diseaseName}
                    </h2>
                    {getStatusBadge(activeRecord.status)}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-3">
                    <span>Started: {new Date(activeRecord.startDate).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>Total Observations: {progressData.timeline?.length || 1}</span>
                  </p>
                </div>

                <button
                  onClick={() => setShowObservationModal(true)}
                  className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-agro-700 hover:bg-agro-800 text-white shadow-xs transition"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Add Follow-up Photo</span>
                </button>
              </div>

              {/* Before vs Current Visual Comparison */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-agro-600" />
                    <span>Multi-Temporal Visual Comparison</span>
                  </h3>

                  <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-[11px] font-semibold">
                    <button
                      onClick={() => setViewMode('slider')}
                      className={`px-2.5 py-1 rounded-lg transition ${
                        viewMode === 'slider'
                          ? 'bg-white dark:bg-slate-900 text-agro-800 dark:text-agro-300 shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Split Slider
                    </button>
                    <button
                      onClick={() => setViewMode('side-by-side')}
                      className={`px-2.5 py-1 rounded-lg transition ${
                        viewMode === 'side-by-side'
                          ? 'bg-white dark:bg-slate-900 text-agro-800 dark:text-agro-300 shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Side by Side
                    </button>
                  </div>
                </div>

                {viewMode === 'slider' ? (
                  <div className="space-y-2">
                    <ImageComparisonSlider
                      beforeImage={progressData.comparison.beforeImageUrl}
                      afterImage={progressData.comparison.currentImageUrl}
                      beforeLabel="Baseline Observation"
                      afterLabel="Latest Observation"
                    />
                    <p className="text-[11px] text-center text-slate-400">
                      Drag the center divider to observe morphological lesion changes over time.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 text-center">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        Baseline Photograph
                      </span>
                      <img
                        src={progressData.comparison.beforeImageUrl}
                        alt="Baseline"
                        className="w-full h-64 rounded-2xl object-cover border border-slate-200"
                      />
                    </div>
                    <div className="space-y-1.5 text-center">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        Latest Follow-up Photograph
                      </span>
                      <img
                        src={progressData.comparison.currentImageUrl}
                        alt="Current"
                        className="w-full h-64 rounded-2xl object-cover border border-slate-200"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Observation Timeline */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-agro-600" />
                  <span>Dated Observation Timeline</span>
                </h3>

                <div className="space-y-4">
                  {progressData.timeline?.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center space-x-3.5">
                        <img
                          src={item.imageUrl}
                          alt={`Observation ${idx + 1}`}
                          className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              Observation #{idx + 1}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {new Date(item.date).toLocaleDateString()}
                            </span>
                            {getStatusBadge(item.status)}
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300">
                            {item.summary || 'Observation logged'}
                          </p>
                          {item.treatment && (
                            <p className="text-[11px] text-agro-700 dark:text-agro-400 font-medium">
                              Treatment Applied: {item.treatment}
                            </p>
                          )}
                          {item.notes && (
                            <p className="text-[11px] text-slate-500 italic">
                              Notes: "{item.notes}"
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 text-center text-slate-400 space-y-3">
              <Calendar className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
              <p className="text-xs">Select or create a recovery tracking project to view timeline.</p>
            </div>
          )}
        </div>
      </div>

      {/* New Project Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-xl space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Create Recovery Monitoring Project
            </h2>

            <form onSubmit={handleCreateRecord} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Plant Species
                </label>
                <input
                  type="text"
                  value={plantName}
                  onChange={(e) => setPlantName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-950"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Diagnosed Pathology / Disease
                </label>
                <input
                  type="text"
                  value={diseaseName}
                  onChange={(e) => setDiseaseName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-950"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Initial Baseline Photograph
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setInitialImage(file);
                      setInitialPreview(URL.createObjectURL(file));
                    }
                  }}
                  className="w-full text-xs"
                  required
                />
                {initialPreview && (
                  <img
                    src={initialPreview}
                    alt="Preview"
                    className="w-20 h-20 rounded-xl object-cover mt-2 border border-slate-200"
                  />
                )}
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Initial Observation Notes (Optional)
                </label>
                <textarea
                  value={initialNotes}
                  onChange={(e) => setInitialNotes(e.target.value)}
                  placeholder="e.g. Concentric lesions on lower tomato leaves..."
                  rows={2}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-950"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-agro-700 hover:bg-agro-800 text-white"
                >
                  {submitting ? 'Creating...' : 'Establish Baseline'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Follow-up Observation Modal */}
      {showObservationModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-xl space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Log Follow-up Observation
            </h2>

            <form onSubmit={handleAddObservation} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Follow-up Leaf Photograph
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFollowupImage(file);
                      setFollowupPreview(URL.createObjectURL(file));
                    }
                  }}
                  className="w-full text-xs"
                  required
                />
                {followupPreview && (
                  <img
                    src={followupPreview}
                    alt="Preview"
                    className="w-20 h-20 rounded-xl object-cover mt-2 border border-slate-200"
                  />
                )}
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Treatment / Action Applied Since Last Observation
                </label>
                <input
                  type="text"
                  value={treatmentApplied}
                  onChange={(e) => setTreatmentApplied(e.target.value)}
                  placeholder="e.g. Applied Neem oil extract spray @ 5ml/L"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-950"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Observation Notes
                </label>
                <textarea
                  value={observationNotes}
                  onChange={(e) => setObservationNotes(e.target.value)}
                  placeholder="e.g. Lesions appeared dry, no new spots observed..."
                  rows={2}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-950"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowObservationModal(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-agro-700 hover:bg-agro-800 text-white"
                >
                  {submitting ? 'Analyzing...' : 'Save Observation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecoveryPage;
