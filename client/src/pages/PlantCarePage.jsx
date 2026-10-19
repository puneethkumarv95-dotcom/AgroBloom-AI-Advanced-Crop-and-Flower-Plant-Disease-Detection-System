import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  HeartPulse,
  Plus,
  CheckCircle2,
  Circle,
  Calendar,
  AlertTriangle,
  Clock,
  Sparkles,
  ShieldCheck,
  Trash2,
  BookOpen,
  Filter
} from 'lucide-react';

const PlantCarePage = () => {
  const [plans, setPlans] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);

  // New Care Plan form
  const [plantName, setPlantName] = useState('Tomato');
  const [diseaseName, setDiseaseName] = useState('Early Blight');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPlans = async () => {
    try {
      const res = await api.get('/care-plans');
      if (res.data.success) {
        const fetched = res.data.plans || [];
        setPlans(fetched);
        if (fetched.length > 0 && !activePlan) {
          setActivePlan(fetched[0]);
        }
      }
    } catch (err) {
      console.error('[Fetch Plans Error]:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/care-plans', {
        plantName,
        diseaseName,
        notes
      });
      if (res.data.success) {
        setShowNewModal(false);
        setNotes('');
        await fetchPlans();
        if (res.data.plan) {
          setActivePlan(res.data.plan);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create plant care plan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleTask = async (taskIndex) => {
    if (!activePlan) return;
    try {
      const res = await api.patch(`/care-plans/${activePlan._id}/tasks/${taskIndex}`);
      if (res.data.success && res.data.plan) {
        setActivePlan(res.data.plan);
        setPlans((prev) =>
          prev.map((p) => (p._id === res.data.plan._id ? res.data.plan : p))
        );
      }
    } catch (err) {
      console.error('[Toggle Task Error]:', err);
    }
  };

  const handleDeletePlan = async (id) => {
    if (!window.confirm('Are you sure you want to delete this care plan?')) return;
    try {
      await api.delete(`/care-plans/${id}`);
      setActivePlan(null);
      await fetchPlans();
    } catch (err) {
      alert('Failed to delete care plan.');
    }
  };

  const getCategoryBadge = (category) => {
    switch (category) {
      case 'organic':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            Organic Bio-Control
          </span>
        );
      case 'chemical':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
            Chemical Protectant
          </span>
        );
      case 'cultural':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
            Cultural Sanitation
          </span>
        );
      case 'observation':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            Foliar Scouting
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
            Preventative
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-800 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-700/20">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Personalized Plant Care Plans
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personalized disease management checklists & extension observation schedules
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Plant Care Plan</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Care Plans list sidebar */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs space-y-3 h-[600px] overflow-y-auto">
          <div className="flex items-center justify-between px-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Active Plans
            </span>
            <span className="text-[10px] font-mono text-slate-400">{plans.length}</span>
          </div>

          {plans.length === 0 && !loading && (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <HeartPulse className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
              <p className="text-xs">No active plant care plans.</p>
              <button
                onClick={() => setShowNewModal(true)}
                className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold underline"
              >
                Create your first care plan
              </button>
            </div>
          )}

          {plans.map((p) => {
            const completedCount = p.tasks.filter((t) => t.isCompleted).length;
            const progressPct = p.tasks.length ? Math.round((completedCount / p.tasks.length) * 100) : 0;

            return (
              <button
                key={p._id}
                onClick={() => setActivePlan(p)}
                className={`w-full text-left p-3.5 rounded-2xl transition space-y-2 block border ${
                  activePlan?._id === p._id
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 shadow-2xs'
                    : 'border-slate-200/70 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {p.plantName}
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">
                    {progressPct}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate">{p.diseaseName}</p>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Plan Details & Checklist Area */}
        <div className="lg:col-span-3 space-y-6">
          {activePlan ? (
            <>
              {/* Plan Banner */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {activePlan.plantName} Care Program — {activePlan.diseaseName}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Status: <strong className="capitalize text-emerald-700 dark:text-emerald-400">{activePlan.status}</strong> • Created on {new Date(activePlan.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <button
                  onClick={() => handleDeletePlan(activePlan._id)}
                  className="flex items-center space-x-1 text-xs text-rose-600 dark:text-rose-400 hover:underline"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Plan</span>
                </button>
              </div>

              {/* Schedules and Advisories */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-emerald-600" />
                    <span>Observation Schedule</span>
                  </span>
                  <p className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                    {activePlan.observationSchedule}
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block flex items-center space-x-1">
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    <span>When to Consult Agricultural Extension</span>
                  </span>
                  <p className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                    {activePlan.expertAdvisory}
                  </p>
                </div>
              </div>

              {/* Care Checklist */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Care & Treatment Action Checklist</span>
                  </h3>
                  <span className="text-xs text-slate-500">
                    {activePlan.tasks.filter((t) => t.isCompleted).length} of {activePlan.tasks.length} Completed
                  </span>
                </div>

                <div className="space-y-3">
                  {activePlan.tasks.map((task, idx) => (
                    <div
                      key={task._id || idx}
                      onClick={() => handleToggleTask(idx)}
                      className={`p-4 rounded-2xl border transition cursor-pointer flex items-start space-x-3.5 ${
                        task.isCompleted
                          ? 'bg-slate-50 dark:bg-slate-950/30 border-slate-200/60 dark:border-slate-800 opacity-75'
                          : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-700'
                      }`}
                    >
                      <button type="button" className="shrink-0 mt-0.5">
                        {task.isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                        )}
                      </button>

                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p
                            className={`text-xs font-semibold ${
                              task.isCompleted
                                ? 'line-through text-slate-400 dark:text-slate-500'
                                : 'text-slate-900 dark:text-slate-100'
                            }`}
                          >
                            {task.title}
                          </p>
                          {getCategoryBadge(task.category)}
                        </div>

                        <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                          <span>Frequency: {task.frequency}</span>
                          {task.completedAt && (
                            <>
                              <span>•</span>
                              <span>Completed: {new Date(task.completedAt).toLocaleDateString()}</span>
                            </>
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
              <HeartPulse className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
              <p className="text-xs">Select or create a plant care plan to view care checklists.</p>
            </div>
          )}
        </div>
      </div>

      {/* New Care Plan Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-xl space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Generate Personalized Plant Care Plan
            </h2>

            <form onSubmit={handleCreatePlan} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Plant Name
                </label>
                <select
                  value={plantName}
                  onChange={(e) => setPlantName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-950"
                >
                  <option value="Tomato">Tomato</option>
                  <option value="Potato">Potato</option>
                  <option value="Bell Pepper">Bell Pepper</option>
                  <option value="Apple">Apple</option>
                  <option value="Rose">Rose</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Disease / Condition
                </label>
                <input
                  type="text"
                  value={diseaseName}
                  onChange={(e) => setDiseaseName(e.target.value)}
                  placeholder="e.g. Early Blight, Black Spot, Downy Mildew..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-950"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Personal Care Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Greenhouse tomatoes bed #2..."
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
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white"
                >
                  {submitting ? 'Generating...' : 'Generate Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlantCarePage;

