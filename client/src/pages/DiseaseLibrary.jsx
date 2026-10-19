import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import {
  BookOpen,
  Search,
  Filter,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
  Sprout,
  Flower2,
  AlertTriangle,
  ChevronLeft,
  X,
  ExternalLink,
  BookMarked
} from 'lucide-react';

const DiseaseLibrary = () => {
  const { t, getLocalizedDisease, language } = useLanguage();
  const [diseases, setDiseases] = useState([]);
  const [search, setSearch] = useState('');
  const [plantType, setPlantType] = useState('all');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const searchDebounce = useRef(null);

  // Fetch search suggestions
  const fetchSuggestions = async (term) => {
    if (!term || term.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await api.get(`/diseases/search?q=${encodeURIComponent(term.trim())}&suggest=true`);
      if (res.data.success) {
        setSuggestions(res.data.suggestions || []);
      }
    } catch (e) {
      // Non-fatal
    }
  };

  // Main search query
  const fetchDiseases = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: search.trim(),
        type: plantType,
        category: category,
        page: page,
        limit: 10
      });
      const res = await api.get(`/diseases/search?${params.toString()}`);
      if (res.data.success) {
        const results = res.data.results || [];
        setDiseases(results);
        setTotalPages(res.data.totalPages || 1);
        setTotalCount(res.data.total || results.length);
        if (results.length > 0 && !selectedDisease) {
          setSelectedDisease(results[0]);
        }
      }
    } catch (err) {
      console.error('[DiseaseLibrary Error]:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiseases();
  }, [plantType, category, page]);

  const handleSearchChange = (val) => {
    setSearch(val);
    setShowSuggestions(true);
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => {
      fetchSuggestions(val);
      setPage(1);
      fetchDiseases();
    }, 300);
  };

  const handleSelectSuggestion = (sug) => {
    setSearch(sug.plant || sug.disease);
    setShowSuggestions(false);
    setPage(1);
    fetchDiseases();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 p-6 sm:p-8 shadow-xs">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-agro-50 dark:bg-agro-950 border border-agro-200 dark:border-agro-800 text-agro-800 dark:text-agro-200 text-xs font-semibold mb-2">
          <BookOpen className="w-3.5 h-3.5 text-agro-600 dark:text-agro-400" />
          <span>MongoDB Grounded Plant Pathology Knowledge Base</span>
        </div>
        
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t('diseaseLibrary')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
          Explore scientifically verified pathogen profiles, diagnostic foliar symptoms, biological remedies, 
          chemical protectants, and peer-reviewed university extension citations.
        </p>

        {/* Search Bar with Autocomplete Suggestions */}
        <div className="mt-6 flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              placeholder={t('searchPlaceholder')}
              className="w-full pl-10 pr-10 py-3 text-xs sm:text-sm rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-agro-500 transition"
            />
            {search && (
              <button
                onClick={() => { setSearch(''); setPage(1); }}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Suggestions Overlay */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-12 mt-1 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl z-30 py-2">
                <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  {t('searchSuggestions')}
                </span>
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSuggestion(s)}
                    className="w-full text-left px-3.5 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center justify-between transition"
                  >
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{s.label}</span>
                    <span className="text-[10px] uppercase font-bold text-agro-700 dark:text-agro-400">{s.type}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Plant Type Pills */}
          <div className="flex items-center space-x-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: 'All Plants' },
              { id: 'crop', label: 'Crops' },
              { id: 'flower', label: 'Flowers' },
              { id: 'nutrient', label: 'Nutrients' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setPlantType(tab.id); setPage(1); }}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  plantType === tab.id
                    ? 'bg-agro-700 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="w-full md:w-auto px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-agro-500"
          >
            <option value="all">{t('allTypes')}</option>
            <option value="fungal">{t('fungal')}</option>
            <option value="bacterial">{t('bacterial')}</option>
            <option value="viral">{t('viral')}</option>
            <option value="oomycete">Oomycete</option>
            <option value="pest">Pest Damage</option>
            <option value="nutrient_deficiency">Nutrient Deficiency</option>
          </select>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Pathology List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Profiles ({totalCount})
            </span>
            {totalPages > 1 && (
              <span className="text-xs text-slate-400">
                {t('page')} {page} {t('of')} {totalPages}
              </span>
            )}
          </div>

          {loading ? (
            <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 text-xs text-slate-400">
              Querying pathology records...
            </div>
          ) : diseases.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 text-xs text-slate-400 space-y-2">
              <AlertTriangle className="w-6 h-6 mx-auto text-amber-500 opacity-60" />
              <p>No matching pathology records found.</p>
              <button
                onClick={() => { setSearch(''); setPlantType('all'); setCategory('all'); setPage(1); }}
                className="text-xs text-agro-700 dark:text-agro-400 font-bold hover:underline"
              >
                {t('clearFilters')}
              </button>
            </div>
          ) : (
            <div className="space-y-2 max-h-[650px] overflow-y-auto pr-1">
              {diseases.map((d) => {
                const isSelected = selectedDisease?._id === d._id;
                return (
                  <div
                    key={d._id}
                    onClick={() => setSelectedDisease(d)}
                    className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-white dark:bg-slate-800 border-agro-500 ring-2 ring-agro-500/20 shadow-xs'
                        : 'bg-white dark:bg-slate-800 border-slate-200/80 dark:border-slate-700/80 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white block">
                          {d.plant} - {d.disease}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          d.type === 'flower' ? 'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}>
                          {d.type}
                        </span>
                      </div>

                      <span className="text-[10px] text-agro-700 dark:text-agro-400 font-semibold block mt-0.5">
                        {d.causalAgent}
                      </span>
                      <span className="text-[10px] text-slate-400 capitalize block mt-1">
                        {d.diseaseCategory} &bull; {d.severityRisk || 'Moderate'} Risk
                      </span>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-agro-600' : 'text-slate-300'}`} />
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center space-x-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>{t('prev')}</span>
              </button>

              <span className="text-xs text-slate-500">
                {page} / {totalPages}
              </span>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center space-x-1"
              >
                <span>{t('next')}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Right Detail Card */}
        <div className="lg:col-span-7">
          {selectedDisease ? (
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 p-6 sm:p-8 space-y-6 shadow-xs sticky top-20">
              
              <div className="border-b border-slate-100 dark:border-slate-700 pb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    {selectedDisease.diseaseCategory} Pathogen Profile
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-agro-50 dark:bg-agro-950 text-agro-800 dark:text-agro-200 font-bold uppercase">
                    {selectedDisease.type}
                  </span>
                </div>

                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {selectedDisease.plant} - {selectedDisease.disease}
                </h2>
                
                {language !== 'en' && (
                  <p className="text-xs font-bold text-agro-700 dark:text-agro-400 mt-0.5">
                    {getLocalizedDisease(`${selectedDisease.plant}___${selectedDisease.disease}`.replace(/\s+/g, '_'))}
                  </p>
                )}

                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1">
                  <strong>{t('causalAgent')}:</strong> {selectedDisease.causalAgent}
                </p>
              </div>

              {/* Symptoms */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  {t('symptoms')}
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  {selectedDisease.symptoms}
                </p>
              </div>

              {/* Organic Remedies */}
              {selectedDisease.recommendations?.organic?.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block">
                    {t('organicRemedy')}:
                  </span>
                  <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside bg-emerald-50/40 dark:bg-emerald-950/20 p-3.5 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                    {selectedDisease.recommendations.organic.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Chemical Protectants */}
              {selectedDisease.recommendations?.chemical?.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-rose-800 dark:text-rose-300 block">
                    {t('chemicalRemedy')}:
                  </span>
                  <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside bg-rose-50/40 dark:bg-rose-950/20 p-3.5 rounded-xl border border-rose-100 dark:border-rose-900/30">
                    {selectedDisease.recommendations.chemical.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Cultural Prevention */}
              {(selectedDisease.recommendations?.prevention?.length > 0 || selectedDisease.recommendations?.cultural?.length > 0) && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-blue-800 dark:text-blue-300 block">
                    {t('preventionMethods')}:
                  </span>
                  <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside bg-blue-50/40 dark:bg-blue-950/20 p-3.5 rounded-xl border border-blue-100 dark:border-blue-900/30">
                    {(selectedDisease.recommendations.prevention || selectedDisease.recommendations.cultural).map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* University Extension Sources */}
              {selectedDisease.sources?.length > 0 && (
                <div className="space-y-2 border-t border-slate-100 dark:border-slate-700 pt-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Peer-Reviewed University Citations
                  </span>
                  <div className="space-y-1">
                    {selectedDisease.sources.map((s, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>{s.title} &bull; <strong>{s.organization}</strong></span>
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-agro-700 dark:text-agro-400 hover:underline flex items-center space-x-1"
                        >
                          <span>Extension Ref</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-12 text-center text-xs text-slate-400">
              Select a plant disease from the library to view verified agronomic recommendations.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default DiseaseLibrary;
