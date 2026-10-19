import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Stethoscope,
  Plus,
  Clock,
  CheckCircle,
  CheckCircle2,
  AlertCircle,
  Upload,
  Calendar,
  FileText,
  UserCheck,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Sparkles,
  Link as LinkIcon,
  MessageSquare,
  Send,
  User,
  Users,
  Award,
  Filter,
  Check,
  X,
  ExternalLink,
  Info
} from 'lucide-react';

const ConsultationsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  // Active view tab
  const [activeTab, setActiveTab] = useState('tickets'); // 'tickets' | 'directory' | 'apply'

  // Data states
  const [consultations, setConsultations] = useState([]);
  const [experts, setExperts] = useState([]);
  const [historyList, setHistoryList] = useState([]);
  const [myApplication, setMyApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingExperts, setLoadingExperts] = useState(false);
  const [loadingApp, setLoadingApp] = useState(false);

  // Expanded ticket for discussion thread
  const [expandedTicketId, setExpandedTicketId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals state
  const [showModal, setShowModal] = useState(false);
  const [showRespondModal, setShowRespondModal] = useState(false);
  const [activeTicket, setActiveTicket] = useState(null);

  // New Consultation Form state
  const [cropName, setCropName] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [urgency, setUrgency] = useState('Medium');
  const [selectedExpertId, setSelectedExpertId] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [selectedDetectionId, setSelectedDetectionId] = useState('');
  const [submittingTicket, setSubmittingTicket] = useState(false);

  // Thread reply state
  const [replyText, setReplyText] = useState({});
  const [replyImage, setReplyImage] = useState({});
  const [sendingReply, setSendingReply] = useState(false);

  // Expert Prescription state
  const [expertNotes, setExpertNotes] = useState('');
  const [medicines, setMedicines] = useState('');
  const [instructions, setInstructions] = useState('');
  const [ticketStatus, setTicketStatus] = useState('Resolved');
  const [submittingPrescription, setSubmittingPrescription] = useState(false);

  // Expert Application Form state
  const [appSpecialization, setAppSpecialization] = useState('');
  const [appQualifications, setAppQualifications] = useState('');
  const [appExperienceYears, setAppExperienceYears] = useState(5);
  const [appBio, setAppBio] = useState('');
  const [appDocumentFile, setAppDocumentFile] = useState(null);
  const [submittingApp, setSubmittingApp] = useState(false);
  const [appSuccessMessage, setAppSuccessMessage] = useState('');

  // Fetch consultations
  const fetchConsultations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/consultations');
      if (res.data.success) {
        setConsultations(res.data.consultations || []);
      }
    } catch (err) {
      console.error('Error fetching consultations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch verified experts
  const fetchExperts = async () => {
    try {
      setLoadingExperts(true);
      const res = await api.get('/experts');
      if (res.data.success) {
        setExperts(res.data.experts || []);
      }
    } catch (err) {
      console.error('Error fetching experts:', err);
    } finally {
      setLoadingExperts(false);
    }
  };

  // Fetch my application status
  const fetchMyApplication = async () => {
    try {
      setLoadingApp(true);
      const res = await api.get('/experts/applications/me');
      if (res.data.success) {
        setMyApplication(res.data.application || null);
      }
    } catch (err) {
      console.warn('Could not fetch expert application:', err.message);
    } finally {
      setLoadingApp(false);
    }
  };

  // Fetch detection history for pre-filling
  const fetchHistory = async () => {
    try {
      const res = await api.get('/detections/history');
      if (res.data.success) {
        setHistoryList(res.data.history || []);
      }
    } catch (err) {
      console.warn('Could not load history:', err.message);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchConsultations();
      fetchExperts();
      fetchHistory();
      fetchMyApplication();
    } else {
      setLoading(false);
      fetchExperts();
    }
  }, [isAuthenticated]);

  // Pre-fill ticket fields when selecting a recent detection
  const handleSelectDetection = (detId) => {
    setSelectedDetectionId(detId);
    const item = historyList.find((h) => h._id === detId);
    if (item) {
      setCropName(`${item.plantName} (${item.primaryDisease})`);
      setSymptoms(
        `AI Diagnostic Findings: Identified ${item.primaryDisease} with ${item.confidence}% confidence. Foliar condition: ${item.condition}. Requesting expert prescription verification.`
      );
    }
  };

  // Open consultation modal with pre-selected expert
  const openConsultWithExpert = (expert) => {
    if (expert && expert.user) {
      setSelectedExpertId(expert.user._id);
    }
    setShowModal(true);
  };

  // Submit new consultation request
  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!cropName.trim() || !symptoms.trim()) return;

    setSubmittingTicket(true);
    const fd = new FormData();
    fd.append('cropOrFlowerName', cropName.trim());
    fd.append('symptomsDescription', symptoms.trim());
    fd.append('urgency', urgency);
    if (selectedExpertId) fd.append('expertId', selectedExpertId);
    if (selectedDetectionId) fd.append('detectionRef', selectedDetectionId);
    if (imageFile) fd.append('image', imageFile);

    try {
      const res = await api.post('/consultations', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setShowModal(false);
        setCropName('');
        setSymptoms('');
        setImageFile(null);
        setSelectedDetectionId('');
        setSelectedExpertId('');
        setActiveTab('tickets');
        await fetchConsultations();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit consultation ticket');
    } finally {
      setSubmittingTicket(false);
    }
  };

  // Send message in multi-turn conversation thread
  const handleSendMessage = async (ticketId) => {
    const text = replyText[ticketId];
    if (!text || !text.trim()) return;

    setSendingReply(true);
    const fd = new FormData();
    fd.append('message', text.trim());
    if (replyImage[ticketId]) {
      fd.append('image', replyImage[ticketId]);
    }

    try {
      const res = await api.post(`/consultations/${ticketId}/messages`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setReplyText((prev) => ({ ...prev, [ticketId]: '' }));
        setReplyImage((prev) => ({ ...prev, [ticketId]: null }));
        // Refresh consultations or update local ticket
        setConsultations((prev) =>
          prev.map((c) => (c._id === ticketId ? res.data.consultation : c))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSendingReply(false);
    }
  };

  // Change consultation ticket status
  const handleUpdateStatus = async (ticketId, newStatus) => {
    try {
      const res = await api.patch(`/consultations/${ticketId}/status`, { status: newStatus });
      if (res.data.success) {
        setConsultations((prev) =>
          prev.map((c) => (c._id === ticketId ? { ...c, status: newStatus } : c))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  // Open Agronomist Prescription Modal
  const openRespondModal = (ticket) => {
    setActiveTicket(ticket);
    setExpertNotes(ticket.expertNotes || '');
    setMedicines(ticket.prescription?.medicinesOrSprays?.join(', ') || '');
    setInstructions(ticket.prescription?.instructions || '');
    setTicketStatus(ticket.status || 'Resolved');
    setShowRespondModal(true);
  };

  // Submit Prescription
  const handleRespondSubmit = async (e) => {
    e.preventDefault();
    if (!activeTicket) return;

    setSubmittingPrescription(true);
    try {
      const res = await api.patch(`/consultations/${activeTicket._id}/respond`, {
        expertNotes,
        status: ticketStatus,
        prescription: {
          medicinesOrSprays: medicines.split(',').map((s) => s.trim()).filter(Boolean),
          instructions
        }
      });
      if (res.data.success) {
        setShowRespondModal(false);
        setActiveTicket(null);
        await fetchConsultations();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit response');
    } finally {
      setSubmittingPrescription(false);
    }
  };

  // Submit Expert Verification Application
  const handleApplyExpert = async (e) => {
    e.preventDefault();
    if (!appSpecialization.trim() || !appQualifications.trim() || !appExperienceYears) return;

    setSubmittingApp(true);
    const fd = new FormData();
    fd.append('specialization', appSpecialization.trim());
    fd.append('qualifications', appQualifications.trim());
    fd.append('experienceYears', appExperienceYears);
    fd.append('bio', appBio.trim());
    if (appDocumentFile) fd.append('document', appDocumentFile);

    try {
      const res = await api.post('/experts/applications', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setAppSuccessMessage('Application submitted successfully! Our administrators will review your qualifications.');
        setMyApplication(res.data.application);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit expert application');
    } finally {
      setSubmittingApp(false);
    }
  };

  // Filtered consultations
  const filteredConsultations = consultations.filter((c) => {
    if (statusFilter === 'All') return true;
    return c.status === statusFilter;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-agro-50 dark:bg-agro-950 border border-agro-200 dark:border-agro-800 text-agro-800 dark:text-agro-200 text-xs font-semibold mb-2">
            <Stethoscope className="w-3.5 h-3.5 text-agro-600 dark:text-agro-400" />
            <span>Certified Agronomist Consultation Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('expertConsult')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Connect directly with verified agricultural extension scientists and university plant pathologists
            for clinical prescriptions, foliar treatment protocols, and multi-turn case follow-ups.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="self-start md:self-center px-4 py-2.5 bg-agro-700 hover:bg-agro-800 text-white rounded-2xl text-xs font-bold shadow-md shadow-agro-700/20 flex items-center space-x-1.5 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Request Expert Review</span>
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('tickets')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-2xl text-xs font-bold transition ${
            activeTab === 'tickets'
              ? 'bg-agro-700 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>{t('consultationTickets')}</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-agro-800/30">
            {consultations.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('directory')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-2xl text-xs font-bold transition ${
            activeTab === 'directory'
              ? 'bg-agro-700 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{t('expertDirectory')}</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-agro-800/30">
            {experts.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('apply')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-2xl text-xs font-bold transition ${
            activeTab === 'apply'
              ? 'bg-agro-700 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>{t('applyExpert')}</span>
          {myApplication && (
            <span
              className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${
                myApplication.status === 'Approved'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-amber-500 text-white'
              }`}
            >
              {myApplication.status}
            </span>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CONSULTATION TICKETS */}
      {/* ========================================================================= */}
      {activeTab === 'tickets' && (
        <div className="space-y-4">
          {/* Status Filter */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Filter Status:</span>
              <div className="flex flex-wrap gap-1">
                {['All', 'Pending', 'In-Review', 'Responded', 'Resolved', 'Closed'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition ${
                      statusFilter === st
                        ? 'bg-agro-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-slate-400">
              Showing {filteredConsultations.length} of {consultations.length} tickets
            </div>
          </div>

          {/* Tickets List */}
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading consultation tickets...</div>
          ) : filteredConsultations.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 text-center space-y-3">
              <Stethoscope className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No consultation tickets in this category
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Need specialized assistance? Submit a ticket linking your recent crop detection results for certified agronomist feedback.
              </p>
            </div>
          ) : (
            filteredConsultations.map((item) => {
              const isExpanded = expandedTicketId === item._id;
              const isUserFarmer = item.farmer?._id === user?._id || item.farmer === user?._id;
              const isUserExpert = user?.role === 'expert' || user?.role === 'admin' || user?.role === 'moderator';

              return (
                <div
                  key={item._id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4 transition"
                >
                  {/* Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                          {item.cropOrFlowerName}
                        </h3>
                        {item.expert && (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[10px] font-semibold">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>Dr. {item.expert.name || 'Assigned Agronomist'}</span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                        <span>Submitted: {new Date(item.createdAt).toLocaleDateString()}</span>
                        <span>&bull;</span>
                        <span>Farmer: {item.farmer?.name || 'Registered Farmer'}</span>
                        {item.farmer?.farmLocation && <span>({item.farmer.farmLocation})</span>}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          item.urgency === 'Critical'
                            ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                            : item.urgency === 'High'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {item.urgency} Urgency
                      </span>

                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          item.status === 'Resolved'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : item.status === 'In-Review'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                            : item.status === 'Responded'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-8 space-y-3 text-xs">
                      <div>
                        <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          Reported Symptoms:
                        </span>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                          {item.symptomsDescription}
                        </p>
                      </div>

                      {/* Linked Diagnostic Reference if available */}
                      {item.detectionRef && (
                        <div className="p-3 rounded-2xl bg-agro-50/60 dark:bg-agro-950/40 border border-agro-200 dark:border-agro-800/60 text-xs flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Sparkles className="w-4 h-4 text-agro-600" />
                            <div>
                              <span className="font-bold text-agro-900 dark:text-agro-200">
                                Linked AI Diagnostic Finding:
                              </span>
                              <span className="text-slate-600 dark:text-slate-400 ml-1">
                                {item.detectionRef.plantName} &mdash; {item.detectionRef.primaryDisease} (
                                {item.detectionRef.confidence}%)
                              </span>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-md bg-agro-200 dark:bg-agro-800 text-[10px] font-bold text-agro-900 dark:text-agro-100">
                            {item.detectionRef.condition}
                          </span>
                        </div>
                      )}

                      {/* Agronomist clinical review notes */}
                      {item.expertNotes && (
                        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 space-y-1">
                          <span className="font-bold flex items-center space-x-1.5 text-xs">
                            <UserCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                            <span>Agronomist Clinical Findings:</span>
                          </span>
                          <p className="text-[11px] leading-relaxed">{item.expertNotes}</p>
                        </div>
                      )}

                      {/* Agronomist Prescription */}
                      {item.prescription &&
                        (item.prescription.instructions ||
                          item.prescription.medicinesOrSprays?.length > 0) && (
                          <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-200 space-y-1.5">
                            <span className="font-bold flex items-center space-x-1.5 text-xs">
                              <FileText className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                              <span>Prescribed Treatment Schedule:</span>
                            </span>
                            {item.prescription.medicinesOrSprays?.length > 0 && (
                              <div className="text-[11px]">
                                <span className="font-semibold">
                                  Recommended Protectants / Fungicides:{' '}
                                </span>
                                <span>{item.prescription.medicinesOrSprays.join(', ')}</span>
                              </div>
                            )}
                            {item.prescription.instructions && (
                              <p className="text-[11px] leading-relaxed">{item.prescription.instructions}</p>
                            )}
                          </div>
                        )}
                    </div>

                    {/* Image Attachment */}
                    {item.imageUrl && (
                      <div className="md:col-span-4">
                        <img
                          src={item.imageUrl}
                          alt="Foliar Sample"
                          className="rounded-2xl max-h-48 w-full object-cover border border-slate-200 dark:border-slate-700 shadow-2xs"
                        />
                      </div>
                    )}
                  </div>

                  {/* Actions & Thread Toggle */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setExpandedTicketId(isExpanded ? null : item._id)}
                        className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-1.5 transition"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-agro-600" />
                        <span>Discussion Thread ({item.messages?.length || 0})</span>
                        {isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {isUserFarmer && item.status !== 'Resolved' && item.status !== 'Closed' && (
                        <button
                          onClick={() => handleUpdateStatus(item._id, 'Resolved')}
                          className="px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl transition"
                        >
                          Mark as Satisfied / Resolved
                        </button>
                      )}
                    </div>

                    {/* Expert Action Buttons */}
                    {isUserExpert && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openRespondModal(item)}
                          className="px-3.5 py-1.5 bg-agro-700 hover:bg-agro-800 text-white rounded-xl text-xs font-semibold shadow-xs transition"
                        >
                          {item.prescription ? 'Update Prescription' : 'Provide Prescription &rarr;'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* ================================================================= */}
                  {/* MULTI-TURN MESSAGING THREAD */}
                  {/* ================================================================= */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                      <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                        <MessageSquare className="w-4 h-4 text-agro-600" />
                        <span>{t('consultationThread')}</span>
                      </div>

                      {/* Messages List */}
                      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {item.messages && item.messages.length > 0 ? (
                          item.messages.map((msg, idx) => {
                            const isSenderFarmer = msg.sender?.role === 'farmer' || !msg.sender?.role;
                            const isSenderExpert = msg.sender?.role === 'expert';
                            const isSenderAdmin = msg.sender?.role === 'admin' || msg.sender?.role === 'moderator';

                            return (
                              <div
                                key={idx}
                                className={`p-3.5 rounded-2xl border text-xs space-y-2 ${
                                  isSenderExpert
                                    ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
                                    : isSenderAdmin
                                    ? 'bg-purple-50/70 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800'
                                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-[10px] text-slate-700 dark:text-slate-300">
                                      {msg.sender?.name?.charAt(0) || 'U'}
                                    </div>
                                    <span className="font-bold text-slate-900 dark:text-white">
                                      {msg.sender?.name || 'Consultation Participant'}
                                    </span>
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                        isSenderExpert
                                          ? 'bg-emerald-200 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                                          : isSenderAdmin
                                          ? 'bg-purple-200 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                          : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                                      }`}
                                    >
                                      {isSenderExpert
                                        ? 'Agronomist Specialist'
                                        : isSenderAdmin
                                        ? 'Administrator'
                                        : 'Farmer'}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-slate-400">
                                    {new Date(msg.createdAt).toLocaleString()}
                                  </span>
                                </div>

                                <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                                  {msg.message}
                                </p>

                                {msg.imageUrl && (
                                  <img
                                    src={msg.imageUrl}
                                    alt="Message Attachment"
                                    className="rounded-xl max-h-40 object-cover border border-slate-200 dark:border-slate-700"
                                  />
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-xs text-slate-400 italic">No messages in this thread yet.</div>
                        )}
                      </div>

                      {/* Reply Input Form */}
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                        <textarea
                          rows={2}
                          value={replyText[item._id] || ''}
                          onChange={(e) =>
                            setReplyText((prev) => ({ ...prev, [item._id]: e.target.value }))
                          }
                          placeholder={t('typeYourMessage')}
                          className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-agro-500"
                        />

                        <div className="flex items-center justify-between">
                          <label className="flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer">
                            <Upload className="w-3.5 h-3.5" />
                            <span>
                              {replyImage[item._id] ? replyImage[item._id].name : 'Attach leaf photo'}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                setReplyImage((prev) => ({
                                  ...prev,
                                  [item._id]: e.target.files[0]
                                }))
                              }
                            />
                          </label>

                          <button
                            onClick={() => handleSendMessage(item._id)}
                            disabled={sendingReply || !replyText[item._id]?.trim()}
                            className="px-4 py-1.5 bg-agro-700 hover:bg-agro-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>{t('sendMessage')}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: VERIFIED EXPERT DIRECTORY */}
      {/* ========================================================================= */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Certified Plant Pathologists & Agronomists</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                All specialists listed below have verified credentials in plant pathology, horticulture, or agronomy.
              </p>
            </div>

            <button
              onClick={() => setActiveTab('apply')}
              className="px-4 py-2 border border-agro-600 text-agro-700 dark:text-agro-300 hover:bg-agro-50 dark:hover:bg-agro-950/60 rounded-xl text-xs font-semibold transition"
            >
              Are you an Agronomist? Apply Here &rarr;
            </button>
          </div>

          {loadingExperts ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading verified experts...</div>
          ) : experts.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 text-center space-y-3">
              <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No verified experts currently active in directory
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Qualified agricultural extension officers and pathologists can submit verification credentials using the Apply tab.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {experts.map((exp) => (
                <div
                  key={exp._id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-agro-400 transition"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center font-bold text-emerald-800 dark:text-emerald-200 text-base">
                          {exp.user?.name?.charAt(0) || 'Dr'}
                        </div>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                              Dr. {exp.user?.name || 'Verified Agronomist'}
                            </h3>
                            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                          </div>
                          <span className="text-[10px] text-slate-400 block">
                            {exp.user?.email || 'Certified Consultant'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Specialization
                        </span>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{exp.specialization}</p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Qualifications
                        </span>
                        <p className="text-slate-600 dark:text-slate-400 text-[11px]">{exp.qualifications}</p>
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <span className="text-slate-500">Experience:</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {exp.experienceYears} Years
                        </span>
                      </div>

                      {exp.supportedLanguages && exp.supportedLanguages.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {exp.supportedLanguages.map((l, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px]"
                            >
                              {l}
                            </span>
                          ))}
                        </div>
                      )}

                      {exp.bio && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 italic line-clamp-2 pt-1">
                          "{exp.bio}"
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => openConsultWithExpert(exp)}
                    className="w-full py-2 bg-agro-700 hover:bg-agro-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center space-x-1.5 transition"
                  >
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span>Request Consultation</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: AGRI-EXPERT VERIFICATION APPLICATION */}
      {/* ========================================================================= */}
      {activeTab === 'apply' && (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header Card */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold">
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              <span>Agronomist & Extension Officer Accreditation</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Apply for Certified Expert Verification
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Are you an agricultural scientist, university plant pathologist, or certified horticultural officer?
              Verified experts can issue prescriptions, inspect foliar disease telemetry, and guide local farming communities.
            </p>
          </div>

          {/* Success Banner */}
          {appSuccessMessage && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{appSuccessMessage}</span>
            </div>
          )}

          {/* Existing Application Status if already submitted */}
          {myApplication ? (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Current Application Status
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    myApplication.status === 'Approved'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : myApplication.status === 'Rejected'
                      ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {myApplication.status}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Specialization</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {myApplication.specialization}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Qualifications</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {myApplication.qualifications}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px]">Field Experience</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {myApplication.experienceYears} Years
                  </span>
                </div>

                {myApplication.adminRemarks && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="font-bold block text-slate-700 dark:text-slate-300">
                      Administrative Review Remarks:
                    </span>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                      {myApplication.adminRemarks}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Application Form */
            <form
              onSubmit={handleApplyExpert}
              className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4"
            >
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Field of Specialization
                </label>
                <input
                  type="text"
                  required
                  value={appSpecialization}
                  onChange={(e) => setAppSpecialization(e.target.value)}
                  placeholder="e.g. Solanaceous Foliar Pathology & Integrated Pest Management"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-agro-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Highest Academic Qualifications
                </label>
                <input
                  type="text"
                  required
                  value={appQualifications}
                  onChange={(e) => setAppQualifications(e.target.value)}
                  placeholder="e.g. M.Sc. in Plant Pathology, UAS Dharwad / ICAR-IARI"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-agro-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Years of Agricultural / Pathology Field Experience
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  required
                  value={appExperienceYears}
                  onChange={(e) => setAppExperienceYears(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-agro-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Professional Bio & Extension Experience
                </label>
                <textarea
                  rows={3}
                  value={appBio}
                  onChange={(e) => setAppBio(e.target.value)}
                  placeholder="Briefly describe your diagnostic background, regional crops managed, and extension initiatives..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-agro-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Upload Degree Certificate or Extension Accreditation ID (PDF / Image)
                </label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setAppDocumentFile(e.target.files[0])}
                  className="text-xs dark:text-slate-300"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submittingApp}
                  className="w-full py-2.5 bg-agro-700 hover:bg-agro-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md transition"
                >
                  {submittingApp ? 'Submitting Credentials...' : t('submitApplication')}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: NEW CONSULTATION REQUEST */}
      {/* ========================================================================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Stethoscope className="w-4 h-4 text-agro-600" />
                <span>Request Certified Agronomist Review</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Link past diagnosis if available */}
            {historyList.length > 0 && (
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                  <LinkIcon className="w-3.5 h-3.5 text-agro-600" />
                  <span>Pre-fill from Recent AI Diagnosis:</span>
                </span>
                <select
                  onChange={(e) => handleSelectDetection(e.target.value)}
                  defaultValue=""
                  className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value="" disabled>
                    Choose past plant diagnosis...
                  </option>
                  {historyList.slice(0, 10).map((h) => (
                    <option key={h._id} value={h._id}>
                      {h.plantName} &mdash; {h.primaryDisease} ({h.confidence}%)
                    </option>
                  ))}
                </select>
              </div>
            )}

            <form onSubmit={handleSubmitTicket} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Crop or Flower Variety
                </label>
                <input
                  type="text"
                  required
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  placeholder="e.g. Tomato (Arka Rakshak) or Rose (Dutch Variety)"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-agro-500"
                />
              </div>

              {/* Preferred Specialist */}
              {experts.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Select Specialist (Optional)
                  </label>
                  <select
                    value={selectedExpertId}
                    onChange={(e) => setSelectedExpertId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="">Any Available Certified Agronomist</option>
                    {experts.map((exp) => (
                      <option key={exp._id} value={exp.user?._id}>
                        Dr. {exp.user?.name} &mdash; {exp.specialization} ({exp.experienceYears}y exp)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Urgency Level
                </label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-agro-500"
                >
                  <option value="Low">Low - General Guidance & Prevention</option>
                  <option value="Medium">Medium - Expanding Foliar Lesions</option>
                  <option value="High">High - Significant Foliar Damage / Blight</option>
                  <option value="Critical">Critical - Epidemic Haulm Collapse</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Observed Symptoms & Field History
                </label>
                <textarea
                  rows={4}
                  required
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Describe foliar spots, weather conditions, irrigation type, previous chemical sprays applied..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-agro-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Upload Leaf Photo (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="text-xs dark:text-slate-300"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingTicket}
                  className="px-4 py-2 bg-agro-700 hover:bg-agro-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  {submittingTicket ? 'Submitting...' : 'Submit Consultation Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EXPERT PRESCRIPTION ISSUANCE */}
      {/* ========================================================================= */}
      {showRespondModal && activeTicket && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <FileText className="w-4 h-4 text-agro-600" />
                <span>Agronomist Clinical Prescription</span>
              </h3>
              <button
                onClick={() => setShowRespondModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Provide clinical findings and treatment protocols for {activeTicket.cropOrFlowerName}.
            </p>

            <form onSubmit={handleRespondSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Agronomist Clinical Findings
                </label>
                <textarea
                  rows={3}
                  required
                  value={expertNotes}
                  onChange={(e) => setExpertNotes(e.target.value)}
                  placeholder="Clinical observation, confirmed pathogen, severity rating..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-agro-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Prescribed Protectants / Fungicides (Comma Separated)
                </label>
                <input
                  type="text"
                  value={medicines}
                  onChange={(e) => setMedicines(e.target.value)}
                  placeholder="e.g. Copper Hydroxide @ 2.5g/L, Mancozeb 75% WP, Neem Oil 1500ppm"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Application Instructions & Surveillance Interval
                </label>
                <textarea
                  rows={3}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Spray during calm morning hours. Ensure complete underside foliar coverage. Rescout in 7 days."
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Ticket Status
                </label>
                <select
                  value={ticketStatus}
                  onChange={(e) => setTicketStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  <option value="Resolved">Resolved / Prescription Ready</option>
                  <option value="In-Review">In-Review / Needs Further Samples</option>
                  <option value="Responded">Responded / Awaiting Farmer Confirmation</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRespondModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPrescription}
                  className="px-4 py-2 bg-agro-700 hover:bg-agro-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  {submittingPrescription ? 'Saving...' : 'Save & Issue Prescription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultationsPage;
