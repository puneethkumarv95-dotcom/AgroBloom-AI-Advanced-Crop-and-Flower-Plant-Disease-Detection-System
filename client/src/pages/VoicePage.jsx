import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Bot,
  User,
  Globe,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

const VoicePage = () => {
  const { t, language, changeLanguage } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const recognitionRef = useRef(null);

  // Initialize Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;

      // Set speech recognition language based on current language
      if (language === 'kn') {
        recognition.lang = 'kn-IN';
      } else if (language === 'hi') {
        recognition.lang = 'hi-IN';
      } else {
        recognition.lang = 'en-IN';
      }

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceError('');
      };

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setVoiceError(`Voice input error: ${event.error}. Please ensure microphone permission is granted.`);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setVoiceError('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      window.speechSynthesis?.cancel();
    };
  }, [language]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setTranscript('');
      setResponse('');
      try {
        recognitionRef.current?.start();
      } catch (err) {
        console.error('Error starting recognition:', err);
      }
    }
  };

  const processQueryWithText = async (textToProcess) => {
    const q = (textToProcess || transcript || '').trim();
    if (!q) return;
    setLoading(true);

    try {
      const res = await api.post('/chat/message', {
        message: q,
        language
      });

      if (res.data.success) {
        const replyText = res.data.reply;
        setResponse(replyText);
        speakResponse(replyText);
      }
    } catch (err) {
      console.error(err);
      setResponse('Failed to fetch agronomic guidance.');
    } finally {
      setLoading(false);
    }
  };

  const processQuery = () => processQueryWithText(transcript);

  const speakResponse = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    // Clean plain text for speech
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
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  };

  const samplePrompts = {
    en: [
      "Tomato early blight symptoms and organic spray",
      "Potato late blight management and fungicides",
      "Rose black spot leaf cure schedule",
      "Pepper bacterial spot prevention tips",
      "Apple scab treatment and university guidance"
    ],
    kn: [
      "ಟೊಮೆಟೊ ಮುರುಟು ರೋಗದ ಲಕ್ಷಣಗಳು ಯಾವುವು?",
      "ಆಲೂಗಡ್ಡೆ ಲೇಟ್ ಬ್ಲೈಟ್ ಜೈವಿಕ ನಿಯಂತ್ರಣ ಕ್ರಮಗಳು",
      "ಗುಲಾಬಿ ಗಿಡದ ಎಲೆ ಕಪ್ಪು ಚುಕ್ಕೆ ರೋಗ ಪರಿಹಾರ",
      "ಕ್ಯಾಪ್ಸಿಕಂ ಎಲೆ ಚುಕ್ಕೆ ರೋಗಕ್ಕೆ ಯಾವ ಔಷಧಿ ಸಿಂಪಡಿಸಬೇಕು?"
    ],
    hi: [
      "टमाटर में अगेती झुलसा के लक्षण और जैविक उपचार",
      "आलू के पछेती झुलसा का कवकनाशी नियंत्रण",
      "गुलाब की पत्तियों पर काला धब्बा रोग कैसे ठीक करें?",
      "शिमला मिर्च जीवाणु धब्बा रोग की रोकथाम"
    ]
  };

  const currentPrompts = samplePrompts[language] || samplePrompts.en;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs text-center space-y-3">
        <div className="inline-flex w-16 h-16 rounded-3xl bg-gradient-to-tr from-rose-600 to-red-500 items-center justify-center text-white shadow-lg shadow-red-500/20 mx-auto">
          <Mic className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t('voiceAssistant')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
          Hands-free plant disease speech assistance. Speak in English, Kannada, or Hindi 
          to query symptoms, treatment schedules, and bio-remedies.
        </p>

        {/* Language selector pills */}
        <div className="pt-2 flex items-center justify-center space-x-2">
          {[
            { id: 'en', label: 'English (EN)' },
            { id: 'kn', label: 'ಕನ್ನಡ (KN)' },
            { id: 'hi', label: 'हिन्दी (HI)' }
          ].map((lang) => (
            <button
              key={lang.id}
              onClick={() => changeLanguage(lang.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                language === lang.id
                  ? 'bg-agro-700 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {voiceError && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{voiceError}</span>
        </div>
      )}

      {/* Main Microphone Interaction Stage */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 shadow-xs text-center space-y-6">
        
        {/* Pulsing Mic Button */}
        <div className="relative inline-flex items-center justify-center">
          {isListening && (
            <div className="absolute w-32 h-32 rounded-full bg-red-400/30 animate-ping"></div>
          )}
          <button
            onClick={toggleListening}
            className={`w-24 h-24 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 ${
              isListening
                ? 'bg-red-600 shadow-red-500/40'
                : 'bg-agro-700 hover:bg-agro-800 shadow-agro-700/30'
            }`}
          >
            {isListening ? <MicOff className="w-10 h-10 animate-bounce" /> : <Mic className="w-10 h-10" />}
          </button>
        </div>

        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {isListening
            ? (language === 'kn' ? "ಆಲಿಸುತ್ತಿದೆ... ನಿಮ್ಮ ಮೈಕ್ರೊಫೋನ್‌ನಲ್ಲಿ ಸ್ಪಷ್ಟವಾಗಿ ಮಾತನಾಡಿ" : language === 'hi' ? "सुन रहा हूँ... माइक में स्पष्ट रूप से बोलें" : "Listening... Speak clearly into your microphone")
            : (language === 'kn' ? "ಪ್ರಶ್ನೆ ಕೇಳಲು ಮೈಕ್ ಐಕಾನ್ ಒತ್ತಿ" : language === 'hi' ? "प्रश्न पूछने के लिए माइक दबाएं" : "Tap microphone to speak your question")}
        </p>

        {/* Sample Prompt Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          {currentPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => {
                setTranscript(prompt);
                processQueryWithText(prompt);
              }}
              className="text-[11px] px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-agro-50 dark:hover:bg-agro-950/40 hover:text-agro-800 hover:border-agro-300 transition"
            >
              "{prompt}"
            </button>
          ))}
        </div>

        {/* Transcript Box */}
        {transcript && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-left space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400">Transcribed Voice Input:</span>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{transcript}</p>
            <div className="flex justify-end pt-1">
              <button
                onClick={processQuery}
                disabled={loading}
                className="px-4 py-1.5 bg-agro-700 hover:bg-agro-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1"
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <span>Diagnose Query &rarr;</span>}
              </button>
            </div>
          </div>
        )}

        {/* Response Box */}
        {response && (
          <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-agro-50 dark:from-emerald-950/30 dark:to-agro-950/30 border border-agro-200 dark:border-agro-800 text-left space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-agro-900 dark:text-agro-200 font-bold text-xs">
                <Bot className="w-4 h-4 text-agro-700 dark:text-agro-400" />
                <span>AgroBloom Pathology Advice</span>
              </div>
              <div className="flex items-center space-x-2">
                {isSpeaking ? (
                  <button
                    onClick={stopSpeaking}
                    className="p-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition"
                    title="Stop Speech"
                  >
                    <VolumeX className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => speakResponse(response)}
                    className="p-1.5 rounded-lg bg-agro-100 dark:bg-agro-900 text-agro-700 dark:text-agro-300 hover:bg-agro-200 dark:hover:bg-agro-800 transition"
                    title="Read Aloud"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">{response}</p>
          </div>
        )}

      </div>

    </div>
  );
};

export default VoicePage;
