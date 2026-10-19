import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Clock,
  Plus,
  CheckCircle2,
  Circle,
  Calendar,
  Trash2,
  Bell,
  AlertCircle,
  Tag
} from 'lucide-react';

const RemindersPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form
  const [plantName, setPlantName] = useState('');
  const [taskType, setTaskType] = useState('Fungicide Spray');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [frequency, setFrequency] = useState('Once');

  const fetchReminders = async () => {
    try {
      const res = await api.get('/reminders');
      if (res.data.success) {
        setReminders(res.data.reminders || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchReminders();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleToggle = async (id) => {
    try {
      const res = await api.patch(`/reminders/${id}/toggle`);
      if (res.data.success) {
        fetchReminders();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await api.delete(`/reminders/${id}`);
      if (res.data.success) {
        fetchReminders();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/reminders', {
        plantName,
        taskType,
        title,
        notes,
        dueDate,
        frequency
      });
      if (res.data.success) {
        setShowModal(false);
        setPlantName('');
        setTitle('');
        setNotes('');
        setDueDate('');
        fetchReminders();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create reminder');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-agro-50 border border-agro-200 text-agro-800 text-xs font-semibold mb-2">
            <Clock className="w-3.5 h-3.5 text-agro-600" />
            <span>Foliar Spray & Care Schedules</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {t('reminders')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Never miss a critical fungicide spraying cycle, biological drenching, 
            or nutrient application date.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="self-start sm:self-center px-4 py-2.5 bg-agro-700 hover:bg-agro-800 text-white rounded-2xl text-xs font-bold shadow-md shadow-agro-700/20 flex items-center space-x-1.5 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Care Reminder</span>
        </button>
      </div>

      {!isAuthenticated && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between">
          <span>Please log in to manage your personalized plant care reminders.</span>
          <a href="/login" className="font-bold underline">Log In</a>
        </div>
      )}

      {/* Reminders List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200">
            Loading care reminders...
          </div>
        ) : reminders.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
            No active reminders scheduled. Add a reminder for spraying or fertilizing!
          </div>
        ) : (
          reminders.map((rem) => (
            <div
              key={rem._id}
              className={`p-4 sm:p-5 rounded-2xl border transition flex items-start justify-between gap-4 ${
                rem.isCompleted
                  ? 'bg-slate-50/60 border-slate-200 opacity-60'
                  : 'bg-white border-slate-200/80 shadow-xs hover:border-agro-300'
              }`}
            >
              <div className="flex items-start space-x-3.5">
                <button
                  onClick={() => handleToggle(rem._id)}
                  className="mt-0.5 text-slate-400 hover:text-agro-700 transition"
                >
                  {rem.isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300" />
                  )}
                </button>

                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-900">{rem.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-agro-100 text-agro-800">
                      {rem.taskType}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">Plant: {rem.plantName}</p>
                  {rem.notes && (
                    <p className="text-[11px] text-slate-400 italic">"{rem.notes}"</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3 text-xs shrink-0">
                <div className="text-right">
                  <span className="text-[11px] font-bold text-slate-700 block flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{new Date(rem.dueDate).toLocaleDateString()}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 block">{rem.frequency}</span>
                </div>

                <button
                  onClick={() => handleDelete(rem._id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                  title="Delete Reminder"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Reminder Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">Schedule Care Reminder</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Plant Name</label>
                <input
                  type="text"
                  required
                  value={plantName}
                  onChange={(e) => setPlantName(e.target.value)}
                  placeholder="e.g. Tomato (Plot 3) or Rose bushes"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-agro-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Task Type</label>
                  <select
                    value={taskType}
                    onChange={(e) => setTaskType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  >
                    <option value="Fungicide Spray">Fungicide Spray</option>
                    <option value="Fertilizer Application">Fertilizer Application</option>
                    <option value="Watering">Watering</option>
                    <option value="Pesticide Spray">Pesticide Spray</option>
                    <option value="Pruning">Pruning</option>
                    <option value="Observation">Observation</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  >
                    <option value="Once">Once</option>
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Biweekly">Biweekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Spray Mancozeb 75% WP @ 2.5g/L"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-agro-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Scheduled Due Date</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Spray early morning before sun heat..."
                  className="w-full p-2 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-agro-700 hover:bg-agro-800 text-white rounded-xl text-xs font-semibold"
                >
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default RemindersPage;
