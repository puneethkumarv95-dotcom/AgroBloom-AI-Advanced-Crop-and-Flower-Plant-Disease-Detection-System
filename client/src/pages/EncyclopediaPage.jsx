import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import {
  BookOpen,
  Search,
  Filter,
  ShieldAlert,
  Sprout,
  CheckCircle,
  Sparkles,
  ChevronRight
} from 'lucide-react';

const EncyclopediaPage = () => {
  const { t } = useLanguage();
  const [classes, setClasses] = useState([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterCondition, setFilterCondition] = useState('All');
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/classes');
        if (res.data.success) {
          setClasses(res.data.classes || []);
          if (res.data.classes?.length > 0) {
            setSelectedEntry(res.data.classes[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load encyclopedia from AI service:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  const filtered = classes.filter((item) => {
    const matchesSearch =
      item.plant.toLowerCase().includes(search.toLowerCase()) ||
      item.disease.toLowerCase().includes(search.toLowerCase()) ||
      item.symptoms.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'All' || item.type.toLowerCase() === filterType.toLowerCase();
    const matchesCondition = filterCondition === 'All' || item.condition === filterCondition;
    return matchesSearch && matchesType && matchesCondition;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-agro-50 border border-agro-200 text-agro-800 text-xs font-semibold mb-2">
          <BookOpen className="w-3.5 h-3.5 text-agro-600" />
          <span>Grounded Plant Pathology Encyclopedia</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Smart Plant & Disease Search
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Search scientifically cataloged crop and floral pathogens. Inspect causal organisms,
          symptom signatures, organic bio-remedies, and prophylactic guidelines.
        </p>

        {/* Search & Filter Controls */}
        <div className="mt-6 flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by crop, flower, symptom, or disease name..."
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-agro-500 transition"
            />
          </div>

          <div className="flex items-center space-x-2 w-full md:w-auto">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-agro-500"
            >
              <option value="All">All Categories</option>
              <option value="crop">Crops Only</option>
              <option value="flower">Flowers Only</option>
              <option value="nutrient">Nutrients Only</option>
            </select>

            <select
              value={filterCondition}
              onChange={(e) => setFilterCondition(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-agro-500"
            >
              <option value="All">All Conditions</option>
              <option value="diseased">Diseased</option>
              <option value="healthy">Healthy</option>
              <option value="nutrient_deficiency">Nutrient Deficiency</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Directory on Left, Detail Card on Right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Directory */}
        <div className="md:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1 text-xs font-bold text-slate-500 uppercase">
            <span>Catalog Items ({filtered.length})</span>
          </div>

          {loading ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-400">
              Loading pathology encyclopedia...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-400">
              No matching plant disease records found.
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {filtered.map((item) => {
                const isSelected = selectedEntry?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedEntry(item)}
                    className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-white border-agro-500 ring-2 ring-agro-500/20 shadow-xs'
                        : 'bg-white border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-slate-900">{item.plant}</span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                          item.condition === 'healthy' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {item.condition}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 font-semibold">{item.disease}</p>
                      <p className="text-[10px] text-slate-400 mt-1 truncate max-w-xs">{item.causalAgent}</p>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-agro-600' : 'text-slate-300'}`} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Detail Pane */}
        <div className="md:col-span-7">
          {selectedEntry ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-5 shadow-xs sticky top-20">
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {selectedEntry.plant} &bull; {selectedEntry.type.toUpperCase()}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    selectedEntry.condition === 'healthy' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedEntry.condition}
                  </span>
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
                  {selectedEntry.disease}
                </h2>
                <p className="text-xs font-semibold text-agro-700 mt-1">
                  Causal Agent: {selectedEntry.causalAgent}
                </p>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Diagnostic Symptom Morphology
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  {selectedEntry.symptoms}
                </p>
              </div>

              <div className="pt-2">
                <a
                  href={`/detect?type=${selectedEntry.type}`}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 bg-agro-700 hover:bg-agro-800 text-white rounded-xl text-xs font-semibold shadow-md shadow-agro-700/20 transition"
                >
                  <Sprout className="w-4 h-4" />
                  <span>Diagnose This Plant Leaf in Scanner</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center text-xs text-slate-400">
              Select an item from the directory to inspect pathology details.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default EncyclopediaPage;
