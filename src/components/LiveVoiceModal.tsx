import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  RefreshCw,
  Send,
  Keyboard,
  Trophy,
  MessageSquare,
  Flame,
  Globe,
} from 'lucide-react';
import { SupportedLanguage } from '../types';
import { ThinkPulseLogo } from './ThinkPulseLogo';

interface LiveVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultLanguage?: SupportedLanguage;
}

export const LiveVoiceModal: React.FC<LiveVoiceModalProps> = ({
  isOpen,
  onClose,
  defaultLanguage = 'ur',
}) => {
  const [qaStatus, setQaStatus] = useState<'ready' | 'listening' | 'thinking' | 'answering' | 'muted'>('ready');
  const [selectedLanguage, setSelectedLanguage] = useState<'ur' | 'en' | 'hi'>(
    defaultLanguage === 'ur' ? 'ur' : defaultLanguage === 'hi' ? 'hi' : 'en'
  );
  const [userTranscript, setUserTranscript] = useState('');
  const [typedQuestion, setTypedQuestion] = useState('');
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [aiTranscript, setAiTranscript] = useState(
    selectedLanguage === 'ur'
      ? 'خوش آمدید! لائیو بات چیت (Live Q/A) فعال ہے۔ آپ اردو میں بول کر یا لکھ کر کوئی بھی سوال پوچھ سکتے ہیں، میں فوری جواب دینے کے لیے حاضر ہوں۔'
      : selectedLanguage === 'hi'
      ? 'नमस्ते! ThinkPulse लाइव बातचीत (Live Q/A) चालू है। आप हिंदी में बोलकर या लिखकर सवाल पूछ सकते हैं।'
      : 'Welcome! ThinkPulse Live Q/A is active. Ask questions by voice or text in any language, and receive immediate tactical insights.'
  );
  const [history, setHistory] = useState<Array<{ sender: 'user' | 'assistant'; text: string }>>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const recognitionRef = useRef<any>(null);
  const speechTimerRef = useRef<any>(null);
  const isSpeakingRef = useRef<boolean>(false);

  // Close on Escape Key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        cleanupAudio();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Update initial greeting when language changes
  useEffect(() => {
    if (selectedLanguage === 'ur') {
      setAiTranscript('خوش آمدید! لائیو بات چیت (Live Q/A) فعال ہے۔ آپ اردو میں بول کر یا لکھ کر کوئی بھی سوال پوچھ سکتے ہیں، میں فوری جواب دینے کے لیے حاضر ہوں۔');
    } else if (selectedLanguage === 'hi') {
      setAiTranscript('नमस्ते! ThinkPulse लाइव बातचीत (Live Q/A) चालू है। आप हिंदी या रोमन उर्दू में बोलकर या लिखकर सवाल पूछ सकते हैं।');
    } else {
      setAiTranscript('Welcome! ThinkPulse Live Q/A is active. Ask questions by voice or text in any language, and receive immediate tactical insights.');
    }
  }, [selectedLanguage]);

  // Initialize Speech Recognition on open
  useEffect(() => {
    if (!isOpen) {
      cleanupAudio();
      return;
    }

    setQaStatus('ready');
    const timer = setTimeout(() => {
      startListening();
    }, 600);

    return () => {
      clearTimeout(timer);
      cleanupAudio();
    };
  }, [isOpen, selectedLanguage]);

  const cleanupAudio = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    isSpeakingRef.current = false;
  };

  const startListening = () => {
    if (isMuted || isSpeakingRef.current) return;

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const rec = new SpeechRec();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = selectedLanguage === 'ur' ? 'ur-PK' : selectedLanguage === 'hi' ? 'hi-IN' : 'en-US';

      rec.onstart = () => {
        setQaStatus('listening');
      };

      rec.onresult = (event: any) => {
        let interimTranscript = '';
        let finalSentence = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalSentence += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const currentSpeech = finalSentence || interimTranscript;
        if (currentSpeech.trim()) {
          setUserTranscript(currentSpeech);

          if (speechTimerRef.current) clearTimeout(speechTimerRef.current);
          speechTimerRef.current = setTimeout(() => {
            if (currentSpeech.trim()) {
              sendLiveQuestion(currentSpeech.trim());
            }
          }, 1100);
        }
      };

      rec.onerror = () => {
        if (!isSpeakingRef.current && !isMuted) {
          setTimeout(() => startListening(), 800);
        }
      };

      rec.onend = () => {
        if (!isSpeakingRef.current && !isMuted && isOpen) {
          setTimeout(() => startListening(), 400);
        }
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (e) {
      console.warn('Speech rec error:', e);
    }
  };

  const sendLiveQuestion = async (queryText: string) => {
    if (!queryText.trim()) return;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }

    setQaStatus('thinking');
    setUserTranscript(queryText);

    try {
      const updatedHistory = [...history, { sender: 'user' as const, text: queryText }];
      setHistory(updatedHistory);

      const res = await fetch('/api/chat/live-turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: queryText,
          conversationHistory: updatedHistory.slice(-4),
          language: selectedLanguage,
        }),
      });

      const data = await res.json();
      const reply = data.replyText || 'I understand your question. Here is the answer.';
      setAiTranscript(reply);
      setHistory((prev) => [...prev, { sender: 'assistant' as const, text: reply }]);

      if (soundEnabled) {
        speakResponse(reply);
      } else {
        setQaStatus('ready');
        setTimeout(() => startListening(), 800);
      }
    } catch (err) {
      setAiTranscript('میں آپ کا سوال سمجھ گیا ہوں۔ دوبارہ پوچھیے یا لکھ کر بھیجیں۔');
      setQaStatus('ready');
      setTimeout(() => startListening(), 1000);
    }
  };

  const speakResponse = (textToSpeak: string) => {
    if (!('speechSynthesis' in window)) {
      setQaStatus('ready');
      startListening();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = selectedLanguage === 'ur' ? 'ur-PK' : selectedLanguage === 'hi' ? 'hi-IN' : 'en-US';
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    isSpeakingRef.current = true;
    setQaStatus('answering');

    utterance.onend = () => {
      isSpeakingRef.current = false;
      setQaStatus('listening');
      setUserTranscript('');
      startListening();
    };

    utterance.onerror = () => {
      isSpeakingRef.current = false;
      setQaStatus('listening');
      startListening();
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleInterrupt = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    isSpeakingRef.current = false;
    setQaStatus('listening');
    setUserTranscript('');
    startListening();
  };

  const toggleMute = () => {
    if (!isMuted) {
      cleanupAudio();
      setIsMuted(true);
      setQaStatus('muted');
    } else {
      setIsMuted(false);
      setQaStatus('ready');
      setTimeout(() => startListening(), 300);
    }
  };

  const handleTypedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typedQuestion.trim()) {
      sendLiveQuestion(typedQuestion.trim());
      setTypedQuestion('');
    }
  };

  if (!isOpen) return null;

  const quickQuestionsByLang = {
    ur: [
      { label: '🏏 پاکستان ٹیم 11', q: 'پاکستان کرکٹ ٹیم کے لیے بہترین پلیئنگ 11 اور ٹی20 سٹریٹجی بتائیں' },
      { label: '⚽ فٹبال ہائی پریسنگ', q: 'فٹبال میں 4-3-3 ٹیکٹکس اور کاؤنٹر اٹیک کیسے کام کرتے ہیں؟' },
      { label: '⚡ ایتھلیٹ فٹنس', q: 'کھلاڑیوں کے لیے سٹیمینا بڑھانے اور ریکوری کی بہترین روٹین کیا ہے؟' },
      { label: '🏆 ڈیتھ اوورز باؤلنگ', q: 'پی ایس ایل اور آئی پی ایل میں ڈیتھ اوورز کی بہترین باؤلنگ حکمت عملی کیا ہوتی ہے؟' },
    ],
    en: [
      { label: '🏏 Pakistan Best XI', q: 'Explain the best Playing 11 and match strategy for Pakistan Cricket Team.' },
      { label: '⚽ 4-3-3 Formation', q: 'Explain high-pressing mechanics and counter-attacks in football.' },
      { label: '⚡ Athlete Endurance', q: 'What are the top stamina and recovery protocols for professional athletes?' },
      { label: '🏆 T20 Death Strategy', q: 'What is the highest percentage bowling plan for death overs in modern T20?' },
    ],
    hi: [
      { label: '🏏 बेस्ट प्लेइंग 11', q: 'टी20 मैच जीतने के लिए बेस्ट प्लेइंग 11 और रणनीति बताएं' },
      { label: '⚽ काउंटर प्रेसिंग', q: 'फुटबॉल में 4-3-3 फॉर्मेशन और डिफेंसिव रणनीति समझाइए' },
      { label: '⚡ फिटनेस और स्टेमिना', q: 'एथलीट्स के लिए बेस्ट रिकवरी और वर्कआउट प्लान क्या है?' },
      { label: '🏆 डेथ ओवर्स बॉलिंग', q: 'क्रिकेट में डेथ ओवर्स में यॉर्کر फेंकने की सही तकनीक क्या है?' },
    ],
  };

  const currentQuestions = quickQuestionsByLang[selectedLanguage] || quickQuestionsByLang.ur;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          cleanupAudio();
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-2xl"
    >
      <div className="relative w-full max-w-2xl h-[90vh] max-h-[720px] rounded-3xl bg-gradient-to-b from-[#090d16] via-[#05070c] to-[#020306] border border-cyan-500/30 shadow-2xl shadow-cyan-950/60 flex flex-col justify-between overflow-hidden font-sans select-none">
        
        {/* Top Header Bar */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-extrabold text-white text-sm tracking-wide">
                  ThinkPulse Live Baat Q/A
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
                  لائیو بات چیت
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Interactive Voice & Text Q/A (Urdu, English & Hindi)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Multilingual Switcher: Urdu, English, Hindi */}
            <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
              <button
                onClick={() => setSelectedLanguage('ur')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedLanguage === 'ur'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                اردو
              </button>
              <button
                onClick={() => setSelectedLanguage('en')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedLanguage === 'en'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setSelectedLanguage('hi')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedLanguage === 'hi'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                हिन्दी
              </button>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl border transition-colors ${
                soundEnabled
                  ? 'bg-slate-900 border-slate-700 text-cyan-400'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
              title={soundEnabled ? 'Mute AI Voice' : 'Enable AI Voice'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* High-Visibility Close Button */}
            <button
              onClick={() => {
                cleanupAudio();
                onClose();
              }}
              className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-200 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
              title="Close Live Q/A (Esc)"
            >
              <X className="w-4 h-4 text-red-400" />
              <span>بند کریں (Close)</span>
            </button>
          </div>
        </div>

        {/* Central Audio & Orb Stage */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
          {/* Animated Background Ambience */}
          <div
            className={`absolute w-96 h-96 rounded-full blur-3xl transition-all duration-700 pointer-events-none ${
              qaStatus === 'answering'
                ? 'bg-cyan-500/25 scale-125'
                : qaStatus === 'listening'
                ? 'bg-emerald-500/20 scale-105'
                : qaStatus === 'thinking'
                ? 'bg-amber-500/25 scale-110 animate-pulse'
                : 'bg-slate-800/20 scale-90'
            }`}
          />

          {/* Glowing Voice Orb with ThinkPulse Core */}
          <div className="relative flex items-center justify-center mb-6">
            <div
              className={`absolute w-60 h-60 rounded-full border border-cyan-500/20 transition-transform duration-500 ${
                qaStatus === 'answering' ? 'scale-125 animate-ping' : 'scale-100'
              }`}
            />
            <div
              className={`absolute w-44 h-44 rounded-full border border-cyan-500/40 transition-transform duration-300 ${
                qaStatus === 'answering' || qaStatus === 'listening' ? 'scale-110 animate-pulse' : 'scale-95'
              }`}
            />

            {/* Central Orb Core with ThinkPulse Silhouette */}
            <div
              onClick={handleInterrupt}
              className={`w-32 h-32 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all duration-500 cursor-pointer ${
                qaStatus === 'answering'
                  ? 'bg-gradient-to-tr from-cyan-600 via-sky-400 to-blue-500 shadow-cyan-500/60 scale-110'
                  : qaStatus === 'listening'
                  ? 'bg-gradient-to-tr from-emerald-600 via-teal-400 to-cyan-500 shadow-emerald-500/50 scale-105 animate-pulse'
                  : qaStatus === 'thinking'
                  ? 'bg-gradient-to-tr from-amber-600 via-yellow-400 to-orange-500 shadow-amber-500/50 animate-spin'
                  : 'bg-slate-800 shadow-slate-900 scale-95'
              }`}
              title="Click orb to interrupt and ask another question"
            >
              <div className="w-10 h-10 flex items-center justify-center mb-0.5">
                <ThinkPulseLogo size="sm" showText={false} animated={qaStatus === 'thinking' || qaStatus === 'answering'} />
              </div>
              <span className="text-[10px] font-bold text-slate-950 uppercase tracking-wider">
                {qaStatus === 'answering' ? 'Speaking' : qaStatus === 'listening' ? 'Listening' : qaStatus === 'thinking' ? 'Thinking' : 'Tap Mic'}
              </span>
            </div>
          </div>

          {/* Audio Waveform Bars */}
          <div className="flex items-center gap-1.5 h-8 mb-5">
            {[35, 70, 95, 60, 100, 80, 50, 90, 65, 45, 80, 55, 30].map((h, i) => (
              <div
                key={i}
                style={{
                  height: qaStatus === 'answering' || qaStatus === 'listening' ? `${h}%` : '15%',
                  transition: 'height 0.2s ease',
                }}
                className={`w-1.5 rounded-full ${
                  qaStatus === 'answering'
                    ? 'bg-gradient-to-t from-cyan-500 to-blue-400'
                    : qaStatus === 'listening'
                    ? 'bg-gradient-to-t from-emerald-500 to-cyan-400'
                    : 'bg-slate-700'
                }`}
              />
            ))}
          </div>

          {/* Status Badge */}
          <div className="text-center mb-4">
            <span
              className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${
                qaStatus === 'answering'
                  ? 'text-cyan-300 bg-cyan-950/60 border-cyan-500/40'
                  : qaStatus === 'listening'
                  ? 'text-emerald-300 bg-emerald-950/60 border-emerald-500/40'
                  : qaStatus === 'thinking'
                  ? 'text-amber-300 bg-amber-950/60 border-amber-500/40'
                  : 'text-slate-400 bg-slate-900 border-slate-800'
              }`}
            >
              {qaStatus === 'answering' && 'AI جواب دے رہا ہے (Answering...)'}
              {qaStatus === 'listening' && 'آپ سوال پوچھیں، AI سن رہا ہے (Listening...)'}
              {qaStatus === 'thinking' && 'سوچ رہا ہے (Synthesizing answer...)'}
              {qaStatus === 'ready' && 'بولیں یا نیچے لکھیں (Ready for Q/A)'}
              {qaStatus === 'muted' && 'مائیکروفون میوٹ ہے (Muted)'}
            </span>
          </div>

          {/* Live Subtitle Transcript Display */}
          <div className="w-full max-w-lg bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 text-center min-h-[85px] flex flex-col justify-center shadow-lg">
            {userTranscript ? (
              <p className="text-sm text-cyan-300 font-medium animate-fadeIn">
                <span className="text-[10px] text-slate-500 block uppercase tracking-wider mb-0.5">آپ کا سوال:</span>
                "{userTranscript}"
              </p>
            ) : (
              <p className="text-sm text-slate-200 leading-relaxed font-sans animate-fadeIn">
                <span className="text-[10px] text-slate-500 block uppercase tracking-wider mb-0.5">ThinkPulse:</span>
                {aiTranscript}
              </p>
            )}
          </div>

          {/* Quick Sport & General Suggested Questions */}
          <div className="flex flex-wrap justify-center gap-2 mt-4 max-w-lg">
            {currentQuestions.map((item, idx) => (
              <button
                key={idx}
                onClick={() => sendLiveQuestion(item.q)}
                className="px-2.5 py-1 rounded-xl bg-slate-900/80 hover:bg-cyan-950/80 border border-slate-800 hover:border-cyan-500/40 text-[11px] text-slate-300 hover:text-cyan-300 transition-colors flex items-center gap-1"
              >
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Interactive Dock (No Call styling, pure Q/A) */}
        <div className="px-6 py-4 border-t border-slate-800/80 bg-slate-950/80 space-y-3">
          {showKeyboard && (
            <form onSubmit={handleTypedSubmit} className="flex gap-2">
              <input
                type="text"
                value={typedQuestion}
                onChange={(e) => setTypedQuestion(e.target.value)}
                placeholder={
                  selectedLanguage === 'ur'
                    ? 'اپنا سوال یہاں لکھیں (یہاں ٹائپ کریں)...'
                    : selectedLanguage === 'hi'
                    ? 'अपना सवाल यहाँ लिखें...'
                    : 'Type your question here...'
                }
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Ask</span>
              </button>
            </form>
          )}

          <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
            {/* Mic Toggle */}
            <button
              onClick={toggleMute}
              className={`px-4 py-2.5 rounded-2xl border flex items-center gap-2 text-xs font-semibold transition-all ${
                isMuted
                  ? 'bg-red-500/20 border-red-500/40 text-red-400'
                  : 'bg-slate-900 border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800'
              }`}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-emerald-400" />}
              <span>{isMuted ? 'Unmute Mic' : 'Mic Active'}</span>
            </button>

            {/* Type Question Toggle */}
            <button
              onClick={() => setShowKeyboard(!showKeyboard)}
              className={`px-4 py-2.5 rounded-2xl border flex items-center gap-2 text-xs font-semibold transition-colors ${
                showKeyboard
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Keyboard className="w-4 h-4" />
              <span>{showKeyboard ? 'Hide Typing' : 'Type Question'}</span>
            </button>

            {/* Interrupt Response if talking */}
            {qaStatus === 'answering' && (
              <button
                onClick={handleInterrupt}
                className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/30 transition-transform active:scale-95"
              >
                <span>روکیں (Stop)</span>
              </button>
            )}

            {/* High-visibility Close / Exit button */}
            <button
              onClick={() => {
                cleanupAudio();
                onClose();
              }}
              className="px-4 py-2.5 rounded-2xl bg-red-950/70 hover:bg-red-900 border border-red-500/50 text-red-200 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg active:scale-95"
            >
              <X className="w-4 h-4 text-red-400" />
              <span>بند کریں (Close Q/A)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
