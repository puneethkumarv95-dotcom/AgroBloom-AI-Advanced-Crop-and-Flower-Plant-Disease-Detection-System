import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  MessageSquare,
  Send,
  Bot,
  User,
  Sparkles,
  ShieldCheck,
  ExternalLink,
  AlertCircle,
  Plus,
  Clock,
  Trash2,
  BookOpen,
  Mic,
  MicOff,
  Volume2,
  VolumeX
} from 'lucide-react';

const ChatbotPage = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const location = useLocation();

  // If redirected from detection with context
  const initialContext = location.state?.context || (location.state?.detection ? {
    selectedPlant: location.state.detection.plantName || location.state.detection.targetClass?.split('___')[0],
    prediction: location.state.detection.diseaseName || location.state.detection.targetClass?.split('___')[1],
    confidence: location.state.detection.confidence,
    className: location.state.detection.targetClass
  } : null);

  const [activeContext, setActiveContext] = useState(initialContext);
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);

  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: initialContext
        ? `Hello! I have loaded your recent diagnostic result for ${activeContext.selectedPlant}: ${activeContext.prediction} (Confidence: ${activeContext.confidence ? Math.round(activeContext.confidence) + '%' : 'N/A'}). What specific management or prevention guidance can I retrieve for you?`
        : "Hello! I am AgroBloom AI Grounded Plant Care Assistant. Ask me about any crop or flower disease (e.g. Tomato Early Blight, Rose Black Spot, Apple Scab, or plant nutrient deficiencies) for verified university extension management guidance.",
      mode: 'verified_knowledge_retrieval',
      engine: 'AgroBloom Agricultural Knowledge Base',
      sources: []
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState(null);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, []);

  // Web Speech Recognition for Chatbot
  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      if (language === 'kn') {
        recognition.lang = 'kn-IN';
      } else if (language === 'hi') {
        recognition.lang = 'hi-IN';
      } else {
        recognition.lang = 'en-IN';
      }

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (e) => {
        let transcript = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          transcript += e.results[i][0].transcript;
        }
        setInput(transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  // Text to Speech Read Aloud for Assistant Messages
  const speakMessage = (text, idx) => {
    if (!window.speechSynthesis) return;

    if (speakingIndex === idx) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*•#]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);

    const voices = window.speechSynthesis.getVoices() || [];
    if (language === 'kn') {
      utterance.lang = 'kn-IN';
      const knVoice = voices.find(v => v.lang.startsWith('kn') || v.name.toLowerCase().includes('kannada'));
      if (knVoice) utterance.voice = knVoice;
    } else if (language === 'hi') {
      utterance.lang = 'hi-IN';
      const hiVoice = voices.find(v => v.lang.startsWith('hi') || v.name.toLowerCase().includes('hindi'));
      if (hiVoice) utterance.voice = hiVoice;
    } else {
      utterance.lang = 'en-IN';
      const enVoice = voices.find(v => v.lang.startsWith('en-IN') || v.lang.startsWith('en'));
      if (enVoice) utterance.voice = enVoice;
    }

    utterance.rate = 0.95;
    utterance.onstart = () => setSpeakingIndex(idx);
    utterance.onend = () => setSpeakingIndex(null);
    utterance.onerror = () => setSpeakingIndex(null);

    window.speechSynthesis.speak(utterance);
  };

  // Load conversations if authenticated
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  const loadConversations = async () => {
    try {
      const res = await api.get('/chat/conversations');
      if (res.data.success) {
        setConversations(res.data.conversations || []);
      }
    } catch (err) {
      console.warn('[Chat History Load Warning]:', err.message);
    }
  };

  const loadConversationHistory = async (convId) => {
    try {
      setLoading(true);
      const res = await api.get(`/chat/history/${convId}`);
      if (res.data.success && res.data.messages?.length) {
        setCurrentConversationId(convId);
        setMessages(res.data.messages.map((m) => ({
          sender: m.sender,
          text: m.text,
          mode: m.mode,
          engine: m.engine,
          sources: m.sources || [],
          groundedData: m.groundedData || null,
          isUncertain: m.isUncertain
        })));
      }
    } catch (err) {
      console.error('[Load History Error]:', err);
    } finally {
      setLoading(false);
    }
  };

  const startNewConversation = () => {
    setCurrentConversationId(null);
    setActiveContext(null);
    setMessages([
      {
        sender: 'assistant',
        text: "Started a new pathology session. How may I assist your crop or flower health today?",
        mode: 'verified_knowledge_retrieval',
        engine: 'AgroBloom Agricultural Knowledge Base',
        sources: []
      }
    ]);
  };

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMessage = { sender: 'user', text };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/chat', {
        message: text,
        language,
        context: activeContext,
        conversationId: currentConversationId
      });

      if (res.data.success) {
        if (res.data.conversationId && !currentConversationId) {
          setCurrentConversationId(res.data.conversationId);
          if (user) loadConversations();
        }

        setMessages((prev) => [
          ...prev,
          {
            sender: 'assistant',
            text: res.data.reply,
            mode: res.data.mode,
            engine: res.data.engine,
            sources: res.data.sources || [],
            groundedData: res.data.groundedData,
            isUncertain: res.data.isUncertain
          }
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: "I experienced a temporary communication issue with the agricultural knowledge base. Please check your network connection or restate your query.",
          mode: 'system_advisory',
          sources: [],
          isUncertain: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = [
    "How to manage Tomato Early Blight organically?",
    "Why does my Rose have black spots on leaves?",
    "What fungicide controls Potato Late Blight?",
    "How to treat Iron deficiency chlorosis in young leaves?",
    "What causes Apple Scab and how to prevent it?"
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-agro-800 to-agro-600 flex items-center justify-center text-white shadow-md shadow-agro-700/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              {t('aiChatbot')}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Retrieval-Augmented plant pathology assistant grounded in verified university extension guidelines
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {user && (
            <button
              onClick={startNewConversation}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-agro-50 dark:bg-agro-950 text-agro-800 dark:text-agro-300 border border-agro-200 dark:border-agro-800 hover:bg-agro-100 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Session</span>
            </button>
          )}

          <div className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-agro-600" />
            <span>Zero Hallucinations</span>
          </div>
        </div>
      </div>

      {/* Active context chip if routed from diagnosis */}
      {activeContext && (
        <div className="bg-agro-50/80 dark:bg-agro-950/40 border border-agro-200 dark:border-agro-900 rounded-2xl p-3 flex items-center justify-between text-xs text-agro-900 dark:text-agro-200">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-agro-600 shrink-0" />
            <span>
              Active Diagnostic Context: <strong>{activeContext.selectedPlant}</strong> — {activeContext.prediction}
            </span>
          </div>
          <button
            onClick={() => setActiveContext(null)}
            className="text-[11px] underline text-slate-500 hover:text-slate-700"
          >
            Clear Context
          </button>
        </div>
      )}

      {/* Main chat layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar: Conversation History (Desktop) */}
        {user && conversations.length > 0 && (
          <div className="hidden lg:block lg:col-span-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs h-[580px] overflow-y-auto space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block px-2 mb-2">
              Recent Consultations
            </span>
            {conversations.map((conv) => (
              <button
                key={conv._id}
                onClick={() => loadConversationHistory(conv._id)}
                className={`w-full text-left p-2.5 rounded-xl text-xs transition space-y-1 block ${
                  currentConversationId === conv._id
                    ? 'bg-agro-50 dark:bg-agro-950 text-agro-900 dark:text-agro-200 border border-agro-200 dark:border-agro-800 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <p className="truncate text-[11px]">{conv.title}</p>
                <div className="flex items-center space-x-1 text-[10px] text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(conv.lastMessageAt).toLocaleDateString()}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Chat message box */}
        <div className={`bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col h-[580px] ${
          user && conversations.length > 0 ? 'lg:col-span-3' : 'lg:col-span-4'
        }`}>
          {/* Messages scroll area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-start space-x-3 ${
                  msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    msg.sender === 'user'
                      ? 'bg-slate-800 text-white'
                      : 'bg-agro-700 text-white'
                  }`}
                >
                  {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed whitespace-pre-wrap ${
                    msg.sender === 'user'
                      ? 'bg-slate-900 text-white rounded-tr-none'
                      : 'bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-none'
                  }`}
                >
                  <p>{msg.text}</p>

                  {/* Uncertainty banner if query was out of scope */}
                  {msg.isUncertain && (
                    <div className="mt-3 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Specialized agricultural boundaries: Query exceeds supported plant species.</span>
                    </div>
                  )}

                  {/* Mode & Engine Tag + Read Aloud Button */}
                  {msg.sender === 'assistant' && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex flex-wrap items-center justify-between text-[10px] text-slate-400 gap-2">
                      <span className="flex items-center space-x-1 font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-agro-500"></span>
                        <span>{msg.engine || 'AgroBloom Knowledge Base'}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => speakMessage(msg.text, index)}
                        className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-agro-50 dark:hover:bg-agro-950/40 text-slate-600 dark:text-slate-300 hover:text-agro-700 transition"
                        title={speakingIndex === index ? "Stop voice readout" : "Read aloud in current language"}
                      >
                        {speakingIndex === index ? (
                          <>
                            <VolumeX className="w-3 h-3 text-red-600" />
                            <span className="text-red-600 font-semibold">Stop</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3 text-agro-600" />
                            <span>Listen</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Citations / Supporting Sources */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
                      <span className="font-bold text-agro-800 dark:text-agro-300 block text-[11px] flex items-center space-x-1">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Supporting University Extension Sources:</span>
                      </span>
                      <ul className="space-y-1">
                        {msg.sources.map((src, sIdx) => (
                          <li key={sIdx} className="text-[11px]">
                            <a
                              href={src.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-agro-700 dark:text-agro-400 hover:underline flex items-center space-x-1"
                            >
                              <span>{src.title} ({src.organization})</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center space-x-3 text-xs text-slate-400">
                <div className="w-8 h-8 rounded-xl bg-agro-100 text-agro-700 flex items-center justify-center">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <span className="animate-pulse">Retrieving verified agricultural extension facts...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion Chips */}
          <div className="px-6 py-2 bg-slate-50/50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800 flex items-center space-x-2 overflow-x-auto no-scrollbar">
            {sampleQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="text-[11px] whitespace-nowrap px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-agro-400 text-slate-600 dark:text-slate-300 hover:text-agro-800 rounded-full transition shadow-2xs"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Listening... speak now" : "Ask a question about crop/flower symptoms, causes, organic/chemical treatments..."}
              className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-agro-500 transition"
            />
            {/* Voice Input Microphone Button */}
            <button
              type="button"
              onClick={toggleListening}
              title={isListening ? "Stop voice listening" : "Speak question in English, Kannada, or Hindi"}
              className={`p-2.5 rounded-xl border transition ${
                isListening
                  ? 'bg-red-600 text-white border-red-600 animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4 animate-bounce" /> : <Mic className="w-4 h-4" />}
            </button>
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 bg-agro-700 hover:bg-agro-800 disabled:opacity-50 text-white rounded-xl shadow-xs transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;
