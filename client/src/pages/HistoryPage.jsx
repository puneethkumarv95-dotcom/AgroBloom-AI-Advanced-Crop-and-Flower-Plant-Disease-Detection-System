import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import {
  History,
  FileText,
  Trash2,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Eye,
  PieChart,
  Search,
  Filter,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  Layers
} from 'lucide-react';

const HistoryPage = () => {
  const { t, getLocalizedDisease } = useLanguage();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('All');
  const [filterCondition, setFilterCondition] = useState('All');
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [activeModalItem, setActiveModalItem] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page,
        limit: 10,
        plantType: filterType,
        condition: filterCondition,
        search: search.trim(),
        startDate: startDate,
        endDate: endDate
      });
      const res = await api.get(`/detections/history?${params.toString()}`);
      if (res.data.success) {
        setHistory(res.data.detections || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalCount(res.data.total || (res.data.detections || []).length);
      }
    } catch (err) {
      console.error('[History Fetch Error]:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [filterType, filterCondition, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchHistory();
  };

  const handleClearFilters = () => {
    setSearch('');
    setFilterType('All');
    setFilterCondition('All');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this clinical diagnosis record?')) return;
    try {
      const res = await api.delete(`/detections/${id}`);
      if (res.data.success) {
        setHistory(prev => prev.filter((h) => h._id !== id));
        setTotalCount(prev => Math.max(0, prev - 1));
        if (activeModalItem?._id === id) setActiveModalItem(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete record');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 p-6 sm:p-8 shadow-xs">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-agro-50 dark:bg-agro-950 border border-agro-200 dark:border-agro-800 text-agro-800 dark:text-agro-200 text-xs font-semibold mb-2">
          <History className="w-3.5 h-3.5 text-agro-600 dark:text-agro-400" />
          <span>MongoDB Persistent Clinical Records</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t('history')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
          Search, filter, inspect neural Grad-CAM explainability heatmaps, evaluate foliar lesion masks, 
          and download authenticated clinical PDF reports.
        </p>

        {/* Filter & Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mt-6 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            
            {/* Search Input */}
            <div className="sm:col-span-5 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search plant or disease..."
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-agro-500"
              />
            </div>

            {/* Category Filter */}
            <div className="sm:col-span-3">
              <select
                value={filterType}
                onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-agro-500"
              >
                <option value="All">All Categories</option>
                <option value="crop">Crops</option>
                <option value="flower">Flowers</option>
                <option value="nutrient">Nutrient Scans</option>
              </select>
            </div>

            {/* Condition Filter */}
            <div className="sm:col-span-2">
              <select
                value={filterCondition}
                onChange={(e) => { setFilterCondition(e.target.value); setPage(1); }}
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-agro-500"
              >
                <option value="All">All Conditions</option>
                <option value="diseased">Diseased</option>
                <option value="healthy">Healthy</option>
              </select>
            </div>

            {/* Search Button */}
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="w-full py-2.5 bg-agro-700 hover:bg-agro-800 text-white rounded-xl text-xs font-semibold shadow-xs transition"
              >
                {t('search')}
              </button>
            </div>
          </div>

          {/* Date Range Row */}
          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center space-x-1.5">
              <span className="text-[11px] text-slate-400">{t('startDate')}:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
              />
            </div>

            <div className="flex items-center space-x-1.5">
              <span className="text-[11px] text-slate-400">{t('endDate')}:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
              />
            </div>

            {(search || filterType !== 'All' || filterCondition !== 'All' || startDate || endDate) && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs text-agro-700 dark:text-agro-400 font-bold hover:underline ml-auto"
              >
                {t('clearFilters')}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* History Stream */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Archived Scans ({totalCount})
          </span>
          {totalPages > 1 && (
            <span className="text-xs text-slate-400">
              {t('page')} {page} {t('of')} {totalPages}
            </span>
          )}
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700">
            Loading diagnostic records...
          </div>
        ) : history.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 space-y-2">
            <AlertTriangle className="w-6 h-6 mx-auto text-amber-500 opacity-60" />
            <p>{t('noHistory')}</p>
          </div>
        ) : (
          history.map((item) => (
            <div
              key={item._id}
              className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 p-6 shadow-xs space-y-4 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700/60 pb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold uppercase text-slate-400">
                      {item.plantName} &bull; {item.plantType}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      item.condition === 'healthy'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                    }`}>
                      {item.condition}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                    {item.primaryDisease}
                  </h3>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setActiveModalItem(item)}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 bg-agro-50 dark:bg-agro-950 text-agro-800 dark:text-agro-200 text-xs font-semibold rounded-xl border border-agro-200 dark:border-agro-800 hover:bg-agro-100 transition"
                  >
                    <Eye className="w-3.5 h-3.5 text-agro-600" />
                    <span>{t('viewDetails')}</span>
                  </button>

                  <a
                    href={`/api/reports/${item._id}/pdf${localStorage.getItem('agrobloom_token') ? `?token=${encodeURIComponent(localStorage.getItem('agrobloom_token'))}` : ''}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition"
                  >
                    <FileText className="w-3.5 h-3.5 text-agro-700 dark:text-agro-400" />
                    <span>{t('pdfReport')}</span>
                  </a>

                  <button
                    onClick={() => handleDelete(item._id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                    title={t('deleteRecord')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Image Triad: Original, Grad-CAM, Lesion Mask */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Specimen Photo</span>
                  <img
                    src={item.originalImageUrl}
                    alt="Original"
                    className="rounded-xl h-36 w-full object-cover border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Grad-CAM (XAI)</span>
                  <img
                    src={item.gradCamImageUrl || item.originalImageUrl}
                    alt="Grad-CAM"
                    className="rounded-xl h-36 w-full object-cover border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Lesion Mask</span>
                  <img
                    src={item.segmentationMaskUrl || item.originalImageUrl}
                    alt="Segmentation"
                    className="rounded-xl h-36 w-full object-cover border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900"
                  />
                </div>
              </div>

              {/* Diagnostics Summary Footer */}
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-700/60 gap-2">
                <div className="flex flex-wrap items-center gap-4">
                  <span>Confidence: <strong>{Number(item.confidence || 0).toFixed(1)}%</strong></span>
                  <span>Severity: <strong>{item.severity?.level === 'Not assessed' ? 'Not assessed' : `${item.severity?.level || 'None'} (${item.severity?.percentage != null ? item.severity.percentage.toFixed(1) : 0}%)`}</strong></span>
                  <span>Model: <strong>{item.modelUsed || 'MobileNetV2'}</strong></span>
                </div>
                <div className="flex items-center space-x-1 text-slate-400 text-[11px]">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(item.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center space-x-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{t('prev')}</span>
            </button>

            <span className="text-xs text-slate-500">
              {t('page')} {page} {t('of')} {totalPages}
            </span>

            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center space-x-1"
            >
              <span>{t('next')}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* High-Resolution Inspection Modal */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-3xl w-full border border-slate-200 dark:border-slate-700 p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Detailed Specimen Analysis &bull; ID: {activeModalItem._id}
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {activeModalItem.plantName} — {activeModalItem.primaryDisease}
                </h2>
              </div>
              <button
                onClick={() => setActiveModalItem(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">Specimen Photograph</span>
                <img
                  src={activeModalItem.originalImageUrl}
                  alt="Original"
                  className="rounded-2xl h-56 w-full object-cover border border-slate-200 dark:border-slate-700"
                />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">Grad-CAM Neural Attention Map</span>
                <img
                  src={activeModalItem.gradCamImageUrl || activeModalItem.originalImageUrl}
                  alt="Grad-CAM"
                  className="rounded-2xl h-56 w-full object-cover border border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            {/* Differential Candidate Predictions */}
            {activeModalItem.topPredictions && activeModalItem.topPredictions.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Differential Neural Softmax Distribution
                </span>
                <div className="space-y-1.5">
                  {activeModalItem.topPredictions.map((pred, i) => (
                    <div key={i} className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{pred.label || pred.disease}</span>
                      <span className="font-bold text-agro-700 dark:text-agro-400">{Number(pred.confidence || 0).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-700">
              <a
                href={`/api/reports/${activeModalItem._id}/pdf${localStorage.getItem('agrobloom_token') ? `?token=${encodeURIComponent(localStorage.getItem('agrobloom_token'))}` : ''}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-agro-700 hover:bg-agro-800 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition"
              >
                <FileText className="w-4 h-4" />
                <span>{t('downloadReport')}</span>
              </a>
              <button
                onClick={() => setActiveModalItem(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-200 transition"
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default HistoryPage;
