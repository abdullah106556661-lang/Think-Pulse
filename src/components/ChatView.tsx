import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Conversation, SupportedLanguage } from '../types';
import { ThinkPulseLogo } from './ThinkPulseLogo';
import { TRANSLATIONS } from '../utils/translations';
import {
  Send,
  Paperclip,
  Mic,
  MicOff,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  RotateCcw,
  Search,
  ChevronDown,
  Volume2,
  FileText,
  Image as ImageIcon,
  Trash2,
  Edit2,
  Plus,
  Compass,
  AlertCircle,
  ExternalLink,
  BrainCircuit,
  Eye,
  X,
  PhoneCall,
  Radio,
  ArrowUp,
  Square,
  ThumbsUp,
  ThumbsDown,
  Brain,
  Zap,
  Globe,
  Headphones,
  Share2,
  Download,
  Code,
  Maximize2,
  Layout,
  Play,
} from 'lucide-react';
import {
  exportConversationAsJSON,
  exportConversationAsMarkdown,
} from '../utils/exportUtils';

interface ChatViewProps {
  currentLanguage: SupportedLanguage;
  onSaveToLibrary?: (item: any) => void;
  onOpenLiveVoice?: () => void;
  onNavigateView?: (view: any) => void;
  conversations: Conversation[];
  activeConvId: string;
  onUpdateConversations: (conversations: Conversation[]) => void;
  onNewChat?: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  currentLanguage,
  onSaveToLibrary,
  onOpenLiveVoice,
  onNavigateView,
  conversations,
  activeConvId,
  onUpdateConversations,
  onNewChat,
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<
    'gemini-3.8-flash' | 'gemini-3.1-flash-lite' | 'gemini-3.1-pro-preview'
  >('gemini-3.8-flash');
  const [thinkingEnabled, setThinkingEnabled] = useState(false);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [builderMode, setBuilderMode] = useState(false);
  const [imageGenMode, setImageGenMode] = useState(false);
  const [zoomImageUrl, setZoomImageUrl] = useState<{ url: string; prompt: string } | null>(null);
  const [previewApp, setPreviewApp] = useState<{ title: string; code: string } | null>(null);
  const [activeAppTab, setActiveAppTab] = useState<Record<string, 'preview' | 'code'>>({});
  const [attachments, setAttachments] = useState<any[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [likedMap, setLikedMap] = useState<Record<string, 'up' | 'down' | null>>({});
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportToast, setExportToast] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const activeConv =
    conversations.find((c) => c.id === activeConvId) ||
    conversations[0] || {
      id: 'default',
      title: 'New chat',
      updatedAt: new Date().toISOString(),
      model: selectedModel,
      thinkingEnabled: true,
      messages: [],
    };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages, loading]);

  // Adjust textarea height dynamically like ChatGPT
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [inputText]);

  // Voice recording using Web Speech API
  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRec();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang =
      currentLanguage === 'hi' ? 'hi-IN' : currentLanguage === 'ur' ? 'ur-PK' : 'en-US';

    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setInputText((prev) => (prev ? prev + ' ' + finalTranscript : finalTranscript));
      }
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  // Handle file uploads (images, audio, docs)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setAttachments((prev) => [
          ...prev,
          {
            name: file.name,
            type: file.type || 'application/octet-stream',
            size: file.size,
            base64,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  // Send message
  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt !== undefined ? customPrompt : inputText;
    if ((!textToSend.trim() && attachments.length === 0) || loading) return;

    const userMsg: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString(),
      attachments: attachments.length > 0 ? [...attachments] : undefined,
    };

    const updatedMessages = [...activeConv.messages, userMsg];

    // Determine clean title from first user prompt
    const newTitle =
      activeConv.messages.length === 0 || activeConv.title === 'New chat' || activeConv.title === 'New Conversation'
        ? textToSend.slice(0, 36).trim() || 'Chat with ThinkPulse'
        : activeConv.title;

    const updatedConvs = conversations.map((c) =>
      c.id === activeConv.id
        ? {
            ...c,
            title: newTitle,
            messages: updatedMessages,
            updatedAt: new Date().toISOString(),
          }
        : c
    );

    onUpdateConversations(updatedConvs);
    setInputText('');
    setAttachments([]);
    setLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          messages: updatedMessages,
          model: selectedModel,
          thinkingEnabled,
          webSearch: webSearchEnabled,
          tool: builderMode ? 'builder' : imageGenMode ? 'image' : null,
          generateImage: imageGenMode,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chat request failed');

      const botMsg: ChatMessage = {
        id: `msg_a_${Date.now()}`,
        role: 'assistant',
        content: data.text,
        timestamp: new Date().toISOString(),
        modelUsed: data.modelUsed,
        generatedImage: data.generatedImage,
        generatedApp: data.generatedApp,
        thinkingProcess: thinkingEnabled
          ? `Analyzed multimodal context, verified constraints, evaluated step-by-step logic, and synthesized concise output.`
          : undefined,
      };

      const finalConvs = updatedConvs.map((c) =>
        c.id === activeConv.id
          ? {
              ...c,
              messages: [...updatedMessages, botMsg],
              updatedAt: new Date().toISOString(),
            }
          : c
      );

      onUpdateConversations(finalConvs);

      onSaveToLibrary?.({
        type: 'conversation',
        id: activeConv.id,
        title: newTitle,
        data: [...updatedMessages, botMsg],
        createdAt: new Date().toISOString(),
      });
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // User pressed stop
        return;
      }
      const errMsg: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **Notice:** ${err.message || 'The service encountered an error. Please try again.'}`,
        timestamp: new Date().toISOString(),
      };

      const finalConvs = updatedConvs.map((c) =>
        c.id === activeConv.id
          ? { ...c, messages: [...updatedMessages, errMsg] }
          : c
      );
      onUpdateConversations(finalConvs);
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setLoading(false);
    }
  };

  // Speak response out loud (TTS)
  const handleTTS = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#`_\[\]()]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // 4 Iconic ChatGPT Suggestion Cards
  const suggestions = [
    {
      title: 'Create an image',
      subtitle: 'A cute fluffy kitten with emerald eyes resting in natural light',
      prompt: 'Generate an ultra-high definition image of a cute fluffy kitten with emerald eyes, resting on a soft blanket in warm natural light, photorealistic 8k',
      icon: ImageIcon,
      color: 'text-amber-400',
    },
    {
      title: 'Code & debug',
      subtitle: 'Build a modern interactive web application with React and Tailwind',
      prompt: 'Write a full React TypeScript component with Tailwind CSS that implements a real-time reactive dashboard with clean architecture and state management.',
      icon: Bot,
      color: 'text-cyan-400',
    },
    {
      title: 'Search & analyze',
      subtitle: 'Summarize the latest AI and technical breakthroughs',
      prompt: 'Search the web for the latest artificial intelligence breakthroughs, multimodal models, and summarize key developments with actionable insights.',
      icon: Globe,
      color: 'text-blue-400',
    },
    {
      title: 'Brainstorm ideas',
      subtitle: 'Innovative ideas for an AI startup in Pakistan & South Asia',
      prompt: 'Brainstorm 5 innovative, high-impact startup ideas in Pakistan that leverage multimodal AI, local payment integrations, and regional languages like Urdu and Hindi.',
      icon: Sparkles,
      color: 'text-purple-400',
    },
  ];

  // Helper to render markdown and code blocks with ChatGPT-style headers
  const renderMessageContent = (content: string) => {
    const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: content.substring(lastIndex, match.index),
        });
      }
      parts.push({
        type: 'code',
        language: match[1] || 'plaintext',
        code: match[2],
      });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.substring(lastIndex),
      });
    }

    return (
      <div className="space-y-3">
        {parts.map((part, idx) => {
          if (part.type === 'code') {
            const codeId = `code_${idx}_${Date.now()}`;
            return (
              <div
                key={idx}
                className="my-3 rounded-xl overflow-hidden border border-[#383838] bg-[#141414] font-mono text-xs shadow-md"
              >
                {/* ChatGPT Code Header */}
                <div className="flex items-center justify-between px-4 py-2 bg-[#212121] border-b border-[#303030] text-slate-400 text-xs select-none">
                  <span className="font-semibold text-slate-300">{part.language}</span>
                  <button
                    onClick={() => handleCopy(codeId, part.code || '')}
                    className="flex items-center gap-1.5 hover:text-white transition-colors"
                  >
                    {copiedId === codeId ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-sans">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="font-sans">Copy code</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 overflow-x-auto text-slate-200 leading-relaxed">
                  <code>{part.code}</code>
                </pre>
              </div>
            );
          }

          // Plain text with line breaks and basic formatting
          return (
            <div key={idx} className="whitespace-pre-wrap leading-relaxed">
              {part.content}
            </div>
          );
        })}
      </div>
    );
  };

  const isConversationEmpty = activeConv.messages.length === 0;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#212121] text-[#ececec] overflow-hidden relative">
      {/* Top ChatGPT Header Bar */}
      <div className="h-14 px-4 sm:px-6 border-b border-[#2d2d2d] bg-[#212121] flex items-center justify-between gap-3 shrink-0 z-20">
        {/* Model Selector Dropdown (ChatGPT Style) */}
        <div className="relative">
          <button
            onClick={() => setShowModelDropdown(!showModelDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-[#2a2a2a] text-sm font-semibold text-[#ececec] transition-colors cursor-pointer"
          >
            <span className="text-base font-bold">
              {selectedModel === 'gemini-3.8-flash'
                ? 'ThinkPulse 4o'
                : selectedModel === 'gemini-3.1-pro-preview'
                ? 'ThinkPulse o1 (Pro Thinking)'
                : 'ThinkPulse 4o-mini'}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform ${
                showModelDropdown ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Model Popover Dropdown */}
          {showModelDropdown && (
            <div className="absolute top-12 left-0 w-80 bg-[#171717] border border-[#333333] rounded-2xl p-2 shadow-2xl space-y-1 z-50 animate-fadeIn">
              {/* Option 1: 4o */}
              <button
                onClick={() => {
                  setSelectedModel('gemini-3.8-flash');
                  setShowModelDropdown(false);
                }}
                className={`w-full flex items-start gap-3 p-2.5 rounded-xl transition-colors text-left ${
                  selectedModel === 'gemini-3.8-flash'
                    ? 'bg-[#262626] border border-[#383838]'
                    : 'hover:bg-[#212121]'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">ThinkPulse 4o</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                      Default
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                    Great for everyday tasks, multimodal reasoning, writing & vision.
                  </p>
                </div>
              </button>

              {/* Option 2: o1 Pro Thinking */}
              <button
                onClick={() => {
                  setSelectedModel('gemini-3.1-pro-preview');
                  setShowModelDropdown(false);
                }}
                className={`w-full flex items-start gap-3 p-2.5 rounded-xl transition-colors text-left ${
                  selectedModel === 'gemini-3.1-pro-preview'
                    ? 'bg-[#262626] border border-[#383838]'
                    : 'hover:bg-[#212121]'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-indigo-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                  <Brain className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">
                      ThinkPulse o1 Thinking
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                      Reasoning
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                    Uses deep chain-of-thought for complex coding, math and architecture.
                  </p>
                </div>
              </button>

              {/* Option 3: 4o mini */}
              <button
                onClick={() => {
                  setSelectedModel('gemini-3.1-flash-lite');
                  setShowModelDropdown(false);
                }}
                className={`w-full flex items-start gap-3 p-2.5 rounded-xl transition-colors text-left ${
                  selectedModel === 'gemini-3.1-flash-lite'
                    ? 'bg-[#262626] border border-[#383838]'
                    : 'hover:bg-[#212121]'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">ThinkPulse 4o-mini</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                      Fast
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                    Lightweight and rapid responses for quick answers.
                  </p>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Top Right Tool Controls (ChatGPT Style) */}
        <div className="flex items-center gap-2">
          {/* Live Voice Call Button (ChatGPT Advanced Voice Mode) */}
          {onOpenLiveVoice && (
            <button
              onClick={onOpenLiveVoice}
              className="px-3 py-1.5 rounded-xl bg-[#2a2a2a] hover:bg-[#333333] border border-[#3c3c3c] text-xs font-semibold text-cyan-300 flex items-center gap-2 transition-all hover:scale-105 shadow-sm"
              title="ChatGPT Advanced Voice Mode (لائیو بات چیت)"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <Headphones className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Voice Mode (لائیو بات چیت)</span>
            </button>
          )}

          {/* Export Conversation Button (JSON & Markdown) */}
          <div className="relative">
            <button
              id="export-conversation-btn"
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-3 py-1.5 rounded-xl bg-[#2a2a2a] hover:bg-[#333333] border border-[#3c3c3c] text-xs font-semibold text-slate-200 flex items-center gap-2 transition-all hover:scale-105 shadow-sm"
              title="Export Conversation as JSON or Markdown"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export Conversation</span>
              <ChevronDown
                className={`w-3 h-3 text-slate-400 transition-transform ${
                  showExportMenu ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Export Dropdown Popover */}
            {showExportMenu && (
              <div className="absolute top-12 right-0 w-80 bg-[#171717] border border-[#333333] rounded-2xl p-3 shadow-2xl space-y-2 z-50 animate-fadeIn">
                <div className="px-1 py-1 border-b border-[#282828] mb-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Export Conversation
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/50">
                      {activeConv.messages.length} msgs
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 truncate mt-1 font-medium">
                    {activeConv.title || 'Untitled Chat'}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Select a format to save offline locally to your device.
                  </p>
                </div>

                {/* Option 1: Markdown (.md) */}
                <button
                  id="export-md-btn"
                  onClick={() => {
                    const filename = exportConversationAsMarkdown(activeConv);
                    setExportToast(`Downloaded "${filename}"`);
                    setShowExportMenu(false);
                    setTimeout(() => setExportToast(null), 4000);
                  }}
                  className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#242424] border border-[#2c2c2c] hover:border-cyan-500/40 transition-all text-left group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5 group-hover:bg-cyan-500/20">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                        Markdown (.md)
                      </span>
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                        Formatted
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      Clean formatted document with headers & code blocks for Obsidian, Notion & text readers.
                    </p>
                  </div>
                </button>

                {/* Option 2: JSON (.json) */}
                <button
                  id="export-json-btn"
                  onClick={() => {
                    const filename = exportConversationAsJSON(activeConv);
                    setExportToast(`Downloaded "${filename}"`);
                    setShowExportMenu(false);
                    setTimeout(() => setExportToast(null), 4000);
                  }}
                  className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#242424] border border-[#2c2c2c] hover:border-purple-500/40 transition-all text-left group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 mt-0.5 group-hover:bg-purple-500/20">
                    <Code className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                        JSON (.json)
                      </span>
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/40">
                        Structured
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      Complete raw schema with timestamps, reasoning traces & metadata for programmatic storage.
                    </p>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Share conversation button */}
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: activeConv.title,
                  text: `Check out my ThinkPulse AI conversation: "${activeConv.title}"`,
                  url: window.location.href,
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Conversation link copied to clipboard!');
              }
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#2a2a2a] transition-colors"
            title="Share chat"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Export Confirmation Floating Toast */}
      {exportToast && (
        <div className="absolute top-16 right-6 z-50 bg-[#1e232d] border border-cyan-500/40 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 animate-slideDown">
          <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Check className="w-3.5 h-3.5" />
          </div>
          <div className="text-xs">
            <span className="font-bold text-cyan-300">Offline Export Complete: </span>
            <span className="text-slate-300">{exportToast}</span>
          </div>
        </div>
      )}

      {/* Main Conversation Container */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 flex flex-col justify-between">
        {/* State A: Blank New Chat (Iconic ChatGPT Start Screen) */}
        {isConversationEmpty ? (
          <div className="flex-1 max-w-3xl mx-auto w-full flex flex-col items-center justify-center my-auto pb-12">
            {/* Logo Emblem */}
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-cyan-500/20 mb-6">
              <ThinkPulseLogo size="lg" showText={false} animated />
            </div>

            {/* Centered Greeting */}
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-white tracking-tight text-center mb-2">
              What can I help with today?
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 text-center mb-8 max-w-md">
              Autonomous Multimodal Intelligence • Urdu, Hindi & English
            </p>

            {/* 4 ChatGPT Iconic Suggestion Cards in 2x2 Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              {suggestions.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(item.prompt)}
                    className="p-4 rounded-2xl bg-[#171717] hover:bg-[#262626] border border-[#2e2e2e] hover:border-[#404040] text-left transition-all duration-200 group flex items-start gap-3.5 shadow-sm"
                  >
                    <div
                      className={`w-9 h-9 rounded-xl bg-[#222222] border border-[#333333] flex items-center justify-center shrink-0 ${item.color}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                        {item.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* State B: Active Message Stream (Authentic ChatGPT Layout) */
          <div className="max-w-3xl mx-auto w-full space-y-6 pb-6">
            {activeConv.messages.map((msg) => {
              const isUser = msg.role === 'user';

              return (
                <div key={msg.id} className="w-full">
                  {isUser ? (
                    /* User Message: Right-Aligned Bubble (ChatGPT Style) */
                    <div className="flex justify-end pl-8">
                      <div className="bg-[#2f2f2f] text-slate-100 rounded-[22px] px-5 py-3 max-w-[85%] sm:max-w-[75%] text-[15px] leading-relaxed shadow-sm break-words">
                        {/* Attachments preview */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-2 pb-2 border-b border-white/10">
                            {msg.attachments.map((att, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/40 text-xs text-white"
                              >
                                <Paperclip className="w-3.5 h-3.5 text-cyan-400" />
                                <span className="truncate max-w-[150px]">{att.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        <p>{msg.content}</p>
                      </div>
                    </div>
                  ) : (
                    /* Assistant Message: Left-Aligned Canvas (ChatGPT Style) */
                    <div className="flex gap-4 items-start pr-4">
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-cyan-500/10">
                        <ThinkPulseLogo size="sm" showText={false} />
                      </div>

                      {/* Content Column */}
                      <div className="flex-1 min-w-0 space-y-2">
                        {/* OpenAI o1 / o3 Thinking Accordion */}
                        {msg.thinkingProcess && (
                          <details className="group mb-2 select-none">
                            <summary className="cursor-pointer text-xs font-mono text-slate-400 hover:text-slate-200 flex items-center gap-2 py-1">
                              <Brain className="w-3.5 h-3.5 text-cyan-400" />
                              <span>Thought for 2 seconds</span>
                              <ChevronDown className="w-3 h-3 transition-transform group-open:rotate-180" />
                            </summary>
                            <div className="pl-4 border-l-2 border-slate-700/80 text-xs text-slate-400 font-mono py-1.5 my-1 leading-relaxed bg-[#171717] rounded-r-xl p-3 border border-[#2a2a2a]">
                              {msg.thinkingProcess}
                            </div>
                          </details>
                        )}

                        {/* Message text with Markdown and Code Formatting */}
                        <div className="text-[15px] leading-relaxed text-slate-200">
                          {renderMessageContent(msg.content)}
                        </div>

                        {/* Generated High-Definition Artwork / Image - ChatGPT Compact Box Style */}
                        {msg.generatedImage && (
                          <div className="my-3 max-w-[270px] sm:max-w-[310px]">
                            <div className="relative aspect-square rounded-2xl overflow-hidden border border-[#333333] bg-[#141414] shadow-lg group/img">
                              <img
                                src={msg.generatedImage.url}
                                alt={msg.generatedImage.prompt || 'Generated Artwork'}
                                className="w-full h-full object-cover cursor-pointer hover:scale-[1.02] transition-transform duration-300"
                                onClick={() =>
                                  setZoomImageUrl({
                                    url: msg.generatedImage!.url,
                                    prompt: msg.generatedImage!.prompt,
                                  })
                                }
                              />
                              {/* Hover Overlay with Action Buttons */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col justify-between p-3 pointer-events-none">
                                <div className="flex items-center justify-end gap-1.5 pointer-events-auto">
                                  <button
                                    onClick={() =>
                                      setZoomImageUrl({
                                        url: msg.generatedImage!.url,
                                        prompt: msg.generatedImage!.prompt,
                                      })
                                    }
                                    className="p-2 rounded-xl bg-black/75 hover:bg-black text-white backdrop-blur-md border border-white/20 transition shadow-lg cursor-pointer"
                                    title="View full resolution"
                                  >
                                    <Maximize2 className="w-4 h-4" />
                                  </button>
                                  <a
                                    href={msg.generatedImage.url}
                                    download={`thinkpulse-art-${Date.now()}.png`}
                                    className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition shadow-lg cursor-pointer font-bold"
                                    title="Download image"
                                  >
                                    <Download className="w-4 h-4 stroke-[2.5]" />
                                  </a>
                                </div>
                                <div className="pointer-events-auto">
                                  <p className="text-[11px] text-white/90 line-clamp-2 drop-shadow font-medium">
                                    {msg.generatedImage.prompt}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="mt-1.5 flex items-center justify-between px-1 text-[11px] text-slate-400">
                              <span className="truncate max-w-[200px] text-slate-300 font-medium">
                                {msg.generatedImage.prompt}
                              </span>
                              <button
                                onClick={() => handleCopy(msg.id + '_imgprompt', msg.generatedImage!.prompt)}
                                className="hover:text-white transition flex items-center gap-1 cursor-pointer shrink-0 ml-2"
                                title="Copy prompt"
                              >
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Generated Interactive Web & App */}
                        {msg.generatedApp && (
                          <div className="my-3 rounded-2xl overflow-hidden border border-[#383838] bg-[#161616] shadow-xl">
                            <div className="px-4 py-3 bg-[#1e1e1e] border-b border-[#2e2e2e] flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                                  <Code className="w-4 h-4" />
                                </div>
                                <div>
                                  <h4 className="text-xs font-bold text-white">{msg.generatedApp.title}</h4>
                                  <p className="text-[10px] text-slate-400">{msg.generatedApp.description}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    setActiveAppTab((prev) => ({
                                      ...prev,
                                      [msg.id]: prev[msg.id] === 'code' ? 'preview' : 'code',
                                    }))
                                  }
                                  className="px-2.5 py-1 rounded-lg bg-[#2a2a2a] hover:bg-[#343434] text-xs text-slate-300 font-medium transition cursor-pointer"
                                >
                                  {activeAppTab[msg.id] === 'code' ? 'Interactive Preview' : 'View Code'}
                                </button>
                                <button
                                  onClick={() =>
                                    setPreviewApp({
                                      title: msg.generatedApp!.title,
                                      code: msg.generatedApp!.code,
                                    })
                                  }
                                  className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition cursor-pointer"
                                  title="Full screen interactive app"
                                >
                                  <Maximize2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            {activeAppTab[msg.id] === 'code' ? (
                              <pre className="p-4 overflow-x-auto text-xs font-mono text-slate-300 bg-slate-950 max-h-72">
                                <code>{msg.generatedApp.code}</code>
                              </pre>
                            ) : (
                              <div className="h-64 bg-slate-950 border-b border-slate-800">
                                <iframe
                                  srcDoc={msg.generatedApp.code}
                                  title={msg.generatedApp.title}
                                  className="w-full h-full border-0"
                                  sandbox="allow-scripts"
                                />
                              </div>
                            )}
                            <div className="p-2.5 bg-[#1a1a1a] flex items-center justify-end gap-2 text-xs">
                              <button
                                onClick={() => handleCopy(msg.id + '_appcode', msg.generatedApp!.code)}
                                className="px-3 py-1.5 rounded-lg bg-[#282828] hover:bg-[#333333] text-slate-300 font-medium flex items-center gap-1.5 transition cursor-pointer"
                              >
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Code</span>
                              </button>
                              <a
                                href={`data:text/html;charset=utf-8,${encodeURIComponent(msg.generatedApp.code)}`}
                                download={`${msg.generatedApp.title.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'app'}.html`}
                                className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-1.5 transition cursor-pointer"
                              >
                                <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                                <span>Download HTML</span>
                              </a>
                            </div>
                          </div>
                        )}

                        {/* ChatGPT Iconic Action Row */}
                        <div className="flex items-center gap-1 pt-2 text-slate-400 select-none">
                          <button
                            onClick={() => handleCopy(msg.id, msg.content)}
                            className="p-1.5 rounded-lg hover:bg-[#2a2a2a] hover:text-white transition-colors"
                            title="Copy response"
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>

                          <button
                            onClick={() =>
                              setLikedMap((prev) => ({
                                ...prev,
                                [msg.id]: prev[msg.id] === 'up' ? null : 'up',
                              }))
                            }
                            className={`p-1.5 rounded-lg hover:bg-[#2a2a2a] transition-colors ${
                              likedMap[msg.id] === 'up'
                                ? 'text-emerald-400 bg-[#2a2a2a]'
                                : 'hover:text-white'
                            }`}
                            title="Good response"
                          >
                            <ThumbsUp className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() =>
                              setLikedMap((prev) => ({
                                ...prev,
                                [msg.id]: prev[msg.id] === 'down' ? null : 'down',
                              }))
                            }
                            className={`p-1.5 rounded-lg hover:bg-[#2a2a2a] transition-colors ${
                              likedMap[msg.id] === 'down'
                                ? 'text-red-400 bg-[#2a2a2a]'
                                : 'hover:text-white'
                            }`}
                            title="Bad response"
                          >
                            <ThumbsDown className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleTTS(msg.content)}
                            className="p-1.5 rounded-lg hover:bg-[#2a2a2a] hover:text-white transition-colors"
                            title="Read aloud"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleSendMessage(activeConv.messages[activeConv.messages.length - 2]?.content || '')}
                            className="p-1.5 rounded-lg hover:bg-[#2a2a2a] hover:text-white transition-colors"
                            title="Regenerate response"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Loading / Generating State */}
            {loading && (() => {
              const lastMsg = activeConv.messages[activeConv.messages.length - 1]?.content || '';
              const isImgGen = imageGenMode || /(create|generate|make|draw|paint|sketch|show|تصویر|پک|عکس|ڈرائنگ|فوٹو)\b/i.test(lastMsg);
              return (
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-cyan-500/10">
                    <ThinkPulseLogo size="sm" showText={false} animated />
                  </div>
                  <div className="flex flex-col gap-2 pt-0.5">
                    {isImgGen ? (
                      <div className="w-[260px] sm:w-[300px] aspect-square rounded-2xl border border-[#333333] bg-[#161616] flex flex-col items-center justify-center relative overflow-hidden shadow-xl">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
                        <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-2.5 shadow-inner">
                          <ImageIcon className="w-5 h-5 animate-pulse" />
                        </div>
                        <span className="text-xs font-semibold text-slate-200">Creating image...</span>
                        <span className="text-[11px] text-slate-400 mt-1 font-mono">Synthesizing visual assets</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 pt-1 text-sm text-slate-400">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                        <span className="font-mono text-xs text-cyan-300">
                          {thinkingEnabled ? 'ThinkPulse is reasoning...' : 'ThinkPulse is responding...'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {activeConv.messages.length > 0 && !loading && (
              <div className="flex items-center justify-between pt-4 pb-1 border-t border-[#2d2d2d] text-xs text-slate-400 select-none">
                <span className="text-[11px] text-slate-500 font-mono">
                  {activeConv.messages.length} messages in this record
                </span>
                <button
                  id="export-conversation-thread-btn"
                  onClick={() => setShowExportMenu(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#262626] hover:bg-[#303030] text-slate-300 hover:text-white border border-[#383838] transition-all hover:border-cyan-500/40 text-xs font-medium cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Export Conversation</span>
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        {/* ChatGPT Iconic Floating Pill Input Bar */}
        <div className="max-w-3xl mx-auto w-full pt-2">
          {/* Attachment Preview Chips */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2 px-2">
              {attachments.map((att, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2f2f2f] border border-[#3e3e3e] text-xs text-slate-200"
                >
                  <Paperclip className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="truncate max-w-[180px]">{att.name}</span>
                  <button
                    onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== index))}
                    className="hover:text-red-400 ml-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* The Capsule Pill Box (ChatGPT Design) */}
          <div className="rounded-[26px] bg-[#2f2f2f] border border-[#3d3d3d] focus-within:border-[#5a5a5a] shadow-2xl p-2.5 flex flex-col gap-2 transition-all">
            {/* AI Builder Quick Assistant Strips */}
            {builderMode && (
              <div className="flex items-center gap-1.5 px-2 pt-1 pb-0.5 overflow-x-auto text-[11px] scrollbar-none">
                <span className="text-emerald-400 font-bold shrink-0 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Builder:</span>
                </span>
                <button
                  type="button"
                  onClick={() => setInputText('Give me modern high-converting website prompts and complete section blueprints for my business')}
                  className="px-2.5 py-0.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 whitespace-nowrap transition cursor-pointer"
                >
                  💡 Website Prompts
                </button>
                <button
                  type="button"
                  onClick={() => setInputText('Build a modern interactive SaaS landing page with dark theme, pricing table, and feature cards')}
                  className="px-2.5 py-0.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 whitespace-nowrap transition cursor-pointer"
                >
                  ⚡ Interactive Landing Page
                </button>
                <button
                  type="button"
                  onClick={() => setInputText('Write app code for an interactive Kanban task management application')}
                  className="px-2.5 py-0.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 whitespace-nowrap transition cursor-pointer"
                >
                  📱 Write App Code
                </button>
              </div>
            )}

            {/* AI Image Ideas Quick Strips */}
            {imageGenMode && (
              <div className="flex items-center gap-1.5 px-2 pt-1 pb-0.5 overflow-x-auto text-[11px] scrollbar-none">
                <span className="text-purple-400 font-bold shrink-0 flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" />
                  <span>Image Ideas:</span>
                </span>
                <button
                  type="button"
                  onClick={() => setInputText('A cute fluffy white kitten with glowing cyan eyes sitting in cherry blossoms, 8k cinematic')}
                  className="px-2.5 py-0.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 whitespace-nowrap transition cursor-pointer"
                >
                  🐱 Cute Kitten
                </button>
                <button
                  type="button"
                  onClick={() => setInputText('Futuristic cyberpunk supercar racing through neon-lit rainy Tokyo streets, cinematic 8k')}
                  className="px-2.5 py-0.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 whitespace-nowrap transition cursor-pointer"
                >
                  🏎️ Cyberpunk Car
                </button>
                <button
                  type="button"
                  onClick={() => setInputText('Majestic snow-capped mountain range under a vibrant purple aurora borealis night sky')}
                  className="px-2.5 py-0.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 whitespace-nowrap transition cursor-pointer"
                >
                  🌌 Aurora Landscape
                </button>
              </div>
            )}

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={builderMode ? 'Describe the app, website, or prompt you need...' : imageGenMode ? 'Describe the image or artwork you want to create...' : t.sendPlaceholder}
              rows={1}
              className="w-full bg-transparent px-3 py-1.5 text-[15px] text-[#ececec] placeholder-[#8e8e8e] focus:outline-none resize-none max-h-48 leading-relaxed"
            />

            {/* Pill Tools Bottom Row */}
            <div className="flex items-center justify-between px-1">
              {/* Left Tools (Attach, Search, Reason, Builder, Image) */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* File Attachment Trigger */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  multiple
                  accept="image/*,audio/*,video/*,.pdf,.txt,.csv"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-[#3a3a3a] transition-colors cursor-pointer"
                  title="Attach images, documents or audio"
                >
                  <Plus className="w-4 h-4" />
                </button>

                {/* Web Search Grounding Toggle */}
                <button
                  type="button"
                  onClick={() => setWebSearchEnabled(!webSearchEnabled)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                    webSearchEnabled
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#3a3a3a]'
                  }`}
                  title="Search the web for up-to-date facts"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Search</span>
                </button>

                {/* Reasoning / Thinking Toggle */}
                <button
                  type="button"
                  onClick={() => setThinkingEnabled(!thinkingEnabled)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                    thinkingEnabled
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#3a3a3a]'
                  }`}
                  title="Toggle cognitive step-by-step reasoning"
                >
                  <Brain className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reason</span>
                </button>

                {/* AI Web & App Builder Button */}
                <button
                  type="button"
                  onClick={() => {
                    const next = !builderMode;
                    setBuilderMode(next);
                    if (next && imageGenMode) setImageGenMode(false);
                  }}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                    builderMode
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#3a3a3a]'
                  }`}
                  title="AI Web & App Builder: Write interactive app code or generate website blueprints & prompts"
                >
                  <Code className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">AI Builder</span>
                </button>

                {/* AI Image Generation Button */}
                <button
                  type="button"
                  onClick={() => {
                    const next = !imageGenMode;
                    setImageGenMode(next);
                    if (next && builderMode) setBuilderMode(false);
                  }}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                    imageGenMode
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#3a3a3a]'
                  }`}
                  title="Generate high-definition AI images"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Picture</span>
                </button>
              </div>

              {/* Right Tools (Mic, Live Voice Call, Send / Stop) */}
              <div className="flex items-center gap-1.5">
                {/* Speech Dictation Mic */}
                <button
                  type="button"
                  onClick={toggleRecording}
                  className={`p-2 rounded-full transition-all ${
                    isRecording
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                      : 'text-slate-400 hover:text-white hover:bg-[#3a3a3a]'
                  }`}
                  title="Speech-to-text dictation"
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                {/* Advanced Voice Call Trigger (ChatGPT Voice Mode) */}
                {onOpenLiveVoice && (
                  <button
                    type="button"
                    onClick={onOpenLiveVoice}
                    className="p-2 rounded-full text-slate-400 hover:text-cyan-400 hover:bg-[#3a3a3a] transition-colors"
                    title="Live Baat Voice Call (ChatGPT Voice Mode)"
                  >
                    <Headphones className="w-4 h-4" />
                  </button>
                )}

                {/* Circular Send / Stop Button (ChatGPT Hallmark) */}
                {loading ? (
                  <button
                    type="button"
                    onClick={handleStopGeneration}
                    className="w-8 h-8 rounded-full bg-white text-black hover:bg-slate-200 flex items-center justify-center transition-all cursor-pointer shadow-md"
                    title="Stop generation"
                  >
                    <Square className="w-3.5 h-3.5 fill-black" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendMessage()}
                    disabled={!inputText.trim() && attachments.length === 0}
                    className="w-8 h-8 rounded-full bg-white text-black hover:bg-slate-200 disabled:bg-[#424242] disabled:text-[#737373] disabled:cursor-not-allowed flex items-center justify-center transition-all shadow-md"
                    title="Send message"
                  >
                    <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ChatGPT Hallmark Disclaimer Footer */}
          <p className="text-center text-[11px] text-slate-500 mt-2 mb-1">
            ThinkPulse can make mistakes. Check important info.
          </p>
        </div>
      </div>

      {/* Image Lightbox Full-Resolution Modal */}
      {zoomImageUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setZoomImageUrl(null)}
        >
          <div
            className="relative max-w-5xl w-full bg-[#141414] border border-[#2a2a2a] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-[#242424] bg-[#1a1a1a]">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white truncate max-w-md">
                  {zoomImageUrl.prompt}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={zoomImageUrl.url}
                  download={`thinkpulse-art-${Date.now()}.png`}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-cyan-500/20 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Download Image</span>
                </a>
                <button
                  onClick={() => setZoomImageUrl(null)}
                  className="p-1.5 rounded-xl bg-[#282828] hover:bg-[#333333] text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-4 flex-1 flex items-center justify-center overflow-auto bg-black/60">
              <img
                src={zoomImageUrl.url}
                alt={zoomImageUrl.prompt}
                className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* Interactive App Full-Screen Sandbox Modal */}
      {previewApp && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setPreviewApp(null)}
        >
          <div
            className="relative w-full max-w-6xl h-[92vh] bg-[#141414] border border-[#2a2a2a] rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#242424] bg-[#1a1a1a]">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  <Code className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">{previewApp.title}</h3>
                  <span className="text-[10px] text-emerald-400 font-mono">Live Interactive Sandbox</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`data:text/html;charset=utf-8,${encodeURIComponent(previewApp.code)}`}
                  download={`${previewApp.title.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'app'}.html`}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-lg cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Download HTML</span>
                </a>
                <button
                  onClick={() => setPreviewApp(null)}
                  className="p-1.5 rounded-xl bg-[#282828] hover:bg-[#333333] text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-white">
              <iframe
                srcDoc={previewApp.code}
                title={previewApp.title}
                className="w-full h-full border-0"
                sandbox="allow-scripts"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
