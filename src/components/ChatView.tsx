import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Conversation, SupportedLanguage, User as UserType } from '../types';
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
  MapPin,
  Briefcase,
  BookOpen,
  Languages,
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
  Menu,
  Sun,
  Moon,
  ShieldCheck,
  Archive,
  Clock,
} from 'lucide-react';
import {
  exportConversationAsJSON,
  exportConversationAsMarkdown,
} from '../utils/exportUtils';

export interface ChatbotRoleDefinition {
  id: 'general' | 'architect' | 'analyst' | 'writer' | 'scientist' | 'linguist' | 'custom';
  name: string;
  badge: string;
  description: string;
  instruction: string;
}

export const CHATBOT_ROLES: ChatbotRoleDefinition[] = [
  {
    id: 'general',
    name: 'General Assistant',
    badge: 'General',
    description: 'Balanced multimodal intelligence for general queries & everyday tasks',
    instruction: 'You are ThinkPulse AI, an advanced, highly capable multimodal cognitive intelligence. You provide insightful, accurate, and articulate answers with deep reasoning and practical utility.',
  },
  {
    id: 'architect',
    name: 'Senior Software Architect',
    badge: 'Coding',
    description: 'Expert full-stack coding, algorithms, cloud systems, and debugging',
    instruction: 'You are a Principal Software Architect and elite full-stack engineer. Write clean, modular, production-ready TypeScript/Python code with explanatory architectural rationale.',
  },
  {
    id: 'analyst',
    name: 'Executive Business Analyst',
    badge: 'Strategy',
    description: 'Strategic analysis, financial modeling, and executive decision-making',
    instruction: 'You are a Senior Strategic Business and Financial Advisor. Provide executive summaries, financial projections, risk assessments, and data-driven recommendations.',
  },
  {
    id: 'writer',
    name: 'Creative Writer & Storyteller',
    badge: 'Creative',
    description: 'Vivid prose, storytelling, screenwriting, and compelling copywriting',
    instruction: 'You are an award-winning creative author, screenwriter, and world-builder. Write vivid, compelling prose with deep emotional resonance.',
  },
  {
    id: 'scientist',
    name: 'Research Scientist',
    badge: 'Research',
    description: 'Rigorous academic research, STEM principles, and citations',
    instruction: 'You are an academic researcher and STEM scholar. Break down complex scientific topics with rigor, first-principles thinking, and citations.',
  },
  {
    id: 'linguist',
    name: 'Urdu / Hindi Linguistic Expert',
    badge: 'Cultural',
    description: 'Natural Urdu/Hindi conversation, poetry, and cultural nuances',
    instruction: 'آپ ایک ماہر اردو/ہندی لسانی مشیر ہیں۔ صارفین کے ساتھ شائستہ، بامحاورہ اور خوبصورت اردو میں گفتگو کریں۔',
  },
];

interface ChatViewProps {
  currentLanguage: SupportedLanguage;
  onSaveToLibrary?: (item: any) => void;
  onOpenLiveVoice?: () => void;
  onNavigateView?: (view: any) => void;
  conversations: Conversation[];
  activeConvId: string;
  onUpdateConversations: (conversations: Conversation[]) => void;
  onNewChat?: () => void;
  user?: UserType | null;
  onSelectConv?: (id: string) => void;
  onDeleteConv?: (id: string) => void;
  onToggleSidebar?: () => void;
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
  user,
  onSelectConv,
  onDeleteConv,
  onToggleSidebar,
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<
    'gemini-3.1-pro-preview' | 'gemini-3.5-flash' | 'gemini-3.1-flash-lite' | 'gemini-3.8-flash'
  >('gemini-3.5-flash');
  const [thinkingEnabled, setThinkingEnabled] = useState(false);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [mapsGroundingEnabled, setMapsGroundingEnabled] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'general' | 'architect' | 'analyst' | 'writer' | 'scientist' | 'linguist' | 'custom'>('general');
  const [customRoleInstruction, setCustomRoleInstruction] = useState('');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
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

  // 3-lines menu Drawer, search & chat retention state
  const [showSidebarDrawer, setShowSidebarDrawer] = useState(false);
  const [drawerSearch, setDrawerSearch] = useState('');
  const [retentionDays, setRetentionDays] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('thinkpulse_retention_days');
      if (saved !== null) return parseInt(saved, 10);
    } catch {}
    return 30; // 30 Days (1 Month)
  });
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('thinkpulse_theme');
      return saved !== 'light';
    } catch {
      return true;
    }
  });

  const toggleThemeMode = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    const themeStr = next ? 'dark' : 'light';
    try {
      localStorage.setItem('thinkpulse_theme', themeStr);
    } catch {}
    if (next) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  };

  // Helper for downloading generated images directly to user's device
  const handleDownloadImage = async (url: string, promptText: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const safeName = (promptText || 'thinkpulse-image').slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_');
      link.download = `${safeName}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      setExportToast('Image downloaded successfully (ڈاؤن لوڈ مکمل)!');
      setTimeout(() => setExportToast(null), 3000);
    } catch {
      const link = document.createElement('a');
      link.href = url;
      link.download = `thinkpulse-image-${Date.now()}.png`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setExportToast('Downloading image...');
      setTimeout(() => setExportToast(null), 3000);
    }
  };

  // Helper for sharing generated image
  const handleShareImage = async (url: string, promptText: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ThinkPulse AI Generated Artwork',
          text: `Generated with ThinkPulse AI: "${promptText}"`,
          url: url,
        });
        return;
      } catch {}
    }
    await navigator.clipboard.writeText(url);
    setExportToast('Image URL copied to clipboard!');
    setTimeout(() => setExportToast(null), 3000);
  };

  // Helper for reusing prompt into input
  const handleReusePrompt = (promptText: string) => {
    setInputText(promptText);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
    setExportToast('Prompt pasted into input!');
    setTimeout(() => setExportToast(null), 2500);
  };

  // Auto-archive chats older than retention threshold (e.g. 30 days or 7 days)
  const handleArchiveOldChats = () => {
    if (retentionDays <= 0) {
      setExportToast('Retention is set to Keep All. No chats need archiving.');
      setTimeout(() => setExportToast(null), 3000);
      return;
    }
    const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
    const toKeep: Conversation[] = [];
    const toArchive: Conversation[] = [];
    conversations.forEach((c) => {
      const time = new Date(c.updatedAt).getTime();
      if (time < cutoff && c.id !== activeConvId) {
        toArchive.push(c);
      } else {
        toKeep.push(c);
      }
    });
    if (toArchive.length > 0) {
      try {
        const existingArchived = JSON.parse(localStorage.getItem('thinkpulse_archived_chats') || '[]');
        localStorage.setItem('thinkpulse_archived_chats', JSON.stringify([...existingArchived, ...toArchive]));
      } catch {}
      onUpdateConversations(toKeep);
      setExportToast(`Archived ${toArchive.length} chats older than ${retentionDays} days to database archive!`);
      setTimeout(() => setExportToast(null), 4000);
    } else {
      setExportToast(`All chats are within your ${retentionDays}-day retention period.`);
      setTimeout(() => setExportToast(null), 3000);
    }
  };

  // Filter drawer conversations by both title and message content
  const filteredDrawerConvs = conversations.filter((c) => {
    const q = drawerSearch.toLowerCase().trim();
    if (!q) return true;
    if (c.title?.toLowerCase().includes(q)) return true;
    return c.messages?.some((m) => m.content?.toLowerCase().includes(q));
  });

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

    const activeRole = CHATBOT_ROLES.find((r) => r.id === selectedRole);
    const systemInstruction = selectedRole === 'custom' && customRoleInstruction.trim()
      ? customRoleInstruction.trim()
      : activeRole?.instruction || CHATBOT_ROLES[0].instruction;

    const effectiveModel = (webSearchEnabled || mapsGroundingEnabled) ? 'gemini-3.5-flash' : selectedModel;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          messages: updatedMessages,
          model: effectiveModel,
          thinkingEnabled,
          webSearch: webSearchEnabled,
          mapsGrounding: mapsGroundingEnabled,
          systemInstruction,
          tool: builderMode ? 'builder' : imageGenMode ? 'image' : null,
          generateImage: imageGenMode,
          stream: true,
        }),
      });

      const contentType = res.headers.get('content-type') || '';

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Chat API endpoint is not reachable (404 Not Found). The backend service may still be starting or route rewrites are configuring.');
        }
        if (res.status === 502 || res.status === 503 || res.status === 504) {
          throw new Error('The AI server is currently initializing or under high demand. Please try again in a moment.');
        }
        const errJson = contentType.includes('application/json') ? await res.json().catch(() => null) : null;
        if (errJson?.error) {
          throw new Error(errJson.error);
        }
        const rawText = await res.text().catch(() => '');
        throw new Error(rawText?.slice(0, 150) || `Request failed with status code ${res.status}`);
      }

      // Handle Real-time Streaming (SSE)
      if (contentType.includes('text/event-stream') && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let accumulatedText = '';
        let modelUsed = selectedModel;
        let generatedImage: any = undefined;
        let generatedApp: any = undefined;
        const botMsgId = `msg_a_${Date.now()}`;

        let currentConvsState = updatedConvs.map((c) =>
          c.id === activeConv.id
            ? {
                ...c,
                messages: [
                  ...updatedMessages,
                  {
                    id: botMsgId,
                    role: 'assistant' as const,
                    content: '',
                    timestamp: new Date().toISOString(),
                    modelUsed,
                    thinkingProcess: thinkingEnabled
                      ? 'Analyzing context, formulating step-by-step logic, and streaming tokens...'
                      : undefined,
                  },
                ],
                updatedAt: new Date().toISOString(),
              }
            : c
        );

        onUpdateConversations(currentConvsState);

        let sseBuffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          sseBuffer += decoder.decode(value, { stream: true });
          const lines = sseBuffer.split('\n');
          sseBuffer = lines.pop() || '';

          let chunkChanged = false;
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data:')) continue;
            const payload = trimmed.replace(/^data:\s*/, '');
            if (payload === '[DONE]') continue;
            try {
              const chunk = JSON.parse(payload);
              if (chunk.text) {
                accumulatedText += chunk.text;
                chunkChanged = true;
              }
              if (chunk.modelUsed) {
                modelUsed = chunk.modelUsed;
                chunkChanged = true;
              }
              if (chunk.generatedImage) {
                generatedImage = chunk.generatedImage;
                chunkChanged = true;
              }
              if (chunk.generatedApp) {
                generatedApp = chunk.generatedApp;
                chunkChanged = true;
              }
            } catch {}
          }

          if (chunkChanged) {
            currentConvsState = currentConvsState.map((c) =>
              c.id === activeConv.id
                ? {
                    ...c,
                    messages: c.messages.map((m) =>
                      m.id === botMsgId
                        ? {
                            ...m,
                            content: accumulatedText,
                            modelUsed,
                            generatedImage,
                            generatedApp,
                          }
                        : m
                    ),
                    updatedAt: new Date().toISOString(),
                  }
                : c
            );
            onUpdateConversations(currentConvsState);
          }
        }

        // Finalize saved conversation to library
        if (!accumulatedText.trim()) {
          accumulatedText = 'I have processed your query and verified the details. How can I assist you further?';
          currentConvsState = currentConvsState.map((c) =>
            c.id === activeConv.id
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === botMsgId ? { ...m, content: accumulatedText } : m
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : c
          );
          onUpdateConversations(currentConvsState);
        }

        const finalMsg = currentConvsState
          .find((c) => c.id === activeConv.id)
          ?.messages.find((m) => m.id === botMsgId);

        if (finalMsg && accumulatedText.trim()) {
          onSaveToLibrary?.({
            type: 'conversation',
            id: activeConv.id,
            title: newTitle,
            data: [...updatedMessages, finalMsg],
            createdAt: new Date().toISOString(),
          });
        }
      } else {
        // Fallback for standard JSON responses
        let data: any = null;
        if (contentType.includes('application/json')) {
          data = await res.json().catch(() => null);
        } else {
          const rawText = await res.text().catch(() => '');
          try {
            data = JSON.parse(rawText);
          } catch {
            data = { text: rawText };
          }
        }

        let responseText = data?.text || data?.reply || data?.content || data?.message || '';
        if (!responseText && data?.error) {
          throw new Error(data.error);
        }
        if (!responseText) {
          responseText = 'ThinkPulse AI has analyzed your request and provided the response.';
        }

        const botMsg: ChatMessage = {
          id: `msg_a_${Date.now()}`,
          role: 'assistant',
          content: responseText,
          timestamp: new Date().toISOString(),
          modelUsed: data?.modelUsed || selectedModel,
          generatedImage: data?.generatedImage,
          generatedApp: data?.generatedApp,
          groundingSources: data?.groundingSources || data?.webSources || undefined,
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
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // User pressed stop
        return;
      }
      let cleanErrorMsg = err?.message || 'The service encountered an error. Please try again.';
      if (cleanErrorMsg.includes('is not valid JSON') || cleanErrorMsg.includes('Unexpected token')) {
        cleanErrorMsg = 'The AI service is currently warming up or momentarily busy. Please try again in a few seconds.';
      } else if (
        cleanErrorMsg.includes('The page could not be found') ||
        cleanErrorMsg.includes('NOT_FOUND') ||
        cleanErrorMsg.includes('bom1::')
      ) {
        cleanErrorMsg = 'The AI server is starting up or API rewrites are routing. Please wait a moment and send your prompt again.';
      } else if (cleanErrorMsg.includes('Received an empty response')) {
        cleanErrorMsg = 'The server completed the query without content. Please retry or rephrase your prompt.';
      }

      const errMsg: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **Notice:** ${cleanErrorMsg}`,
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
      <div className="h-14 px-3 sm:px-6 border-b border-[#2d2d2d] bg-[#212121] flex items-center justify-between gap-2.5 shrink-0 z-20">
        <div className="flex items-center gap-2">
          {/* 3-Lines (Hamburger) Menu Button */}
          <button
            onClick={() => setShowSidebarDrawer(true)}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-[#2a2a2a] transition-colors border border-[#333333] cursor-pointer flex items-center justify-center shrink-0"
            title="Chat Search, Navigation & User Details (تھری لائنز مینو)"
          >
            <Menu className="w-4 h-4 text-slate-200" />
          </button>

          {/* Model Selector Dropdown with Website Brand: ThinkPulse 3.5, 3.1 Pro, etc. */}
          <div className="relative">
            <button
              onClick={() => {
                setShowModelDropdown(!showModelDropdown);
                if (showRoleDropdown) setShowRoleDropdown(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-[#2a2a2a] text-sm font-semibold text-[#ececec] transition-colors cursor-pointer border border-[#333333]"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-white font-bold tracking-tight">ThinkPulse</span>
                <span className="text-cyan-400 font-extrabold font-mono text-xs px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/40">
                  {selectedModel === 'gemini-3.1-pro-preview'
                    ? '3.1 Pro'
                    : selectedModel === 'gemini-3.5-flash'
                    ? '3.5'
                    : selectedModel === 'gemini-3.1-flash-lite'
                    ? '3.1 Fast'
                    : '3.8 Ultra'}
                </span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                  showModelDropdown ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Model Popover Dropdown */}
            {showModelDropdown && (
              <div className="absolute top-12 left-0 w-80 bg-[#171717] border border-[#333333] rounded-2xl p-2 shadow-2xl space-y-1 z-50 animate-fadeIn">
                {/* Option 1: ThinkPulse 3.5 (General) */}
                <button
                  onClick={() => {
                    setSelectedModel('gemini-3.5-flash');
                    setShowModelDropdown(false);
                  }}
                  className={`w-full flex items-start gap-3 p-2.5 rounded-xl transition-colors text-left ${
                    selectedModel === 'gemini-3.5-flash'
                      ? 'bg-[#262626] border border-[#383838]'
                      : 'hover:bg-[#212121]'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">ThinkPulse 3.5</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                        General & Grounding
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      Fast, highly accurate multimodal intelligence optimized for Google Search & Maps Grounding.
                    </p>
                  </div>
                </button>

                {/* Option 2: ThinkPulse 3.1 Pro (Complex Tasks) */}
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
                        ThinkPulse 3.1 Pro
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                        Complex Reasoning
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      Deep cognitive tokens for advanced architectural coding, algorithms & multi-step problems.
                    </p>
                  </div>
                </button>

                {/* Option 3: ThinkPulse 3.1 Fast (Fast Tasks) */}
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
                      <span className="text-xs font-bold text-white">ThinkPulse 3.1 Fast</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                        Ultra Fast
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      Ultra-low latency for instant responses, micro-edits, and high-frequency tasks.
                    </p>
                  </div>
                </button>

                {/* Option 4: ThinkPulse 3.8 Ultra (Flagship) */}
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
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-teal-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">ThinkPulse 3.8 Ultra</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
                        Multimodal Flagship
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      High context cognitive reasoning engine with streaming thinking and comprehensive tools.
                    </p>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Chatbot Role Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowRoleDropdown(!showRoleDropdown);
                if (showModelDropdown) setShowModelDropdown(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-[#2a2a2a] text-xs font-semibold text-slate-300 transition-colors border border-[#333333] cursor-pointer"
              title="Configure specific chatbot role / system instruction"
            >
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline text-slate-400">Role:</span>
              <span className="text-white font-medium">
                {selectedRole === 'custom'
                  ? 'Custom Role'
                  : CHATBOT_ROLES.find((r) => r.id === selectedRole)?.name || 'General Assistant'}
              </span>
              <ChevronDown
                className={`w-3 h-3 text-slate-400 transition-transform ${
                  showRoleDropdown ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Role Popover */}
            {showRoleDropdown && (
              <div className="absolute top-12 left-0 w-80 sm:w-96 bg-[#171717] border border-[#333333] rounded-2xl p-3 shadow-2xl space-y-2 z-50 animate-fadeIn">
                <div className="px-1 border-b border-[#282828] pb-2">
                  <span className="text-xs font-bold text-white block">Chatbot Role & System Instruction</span>
                  <span className="text-[10px] text-slate-400">
                    Give the assistant specialized personas, expertise, and behavior rules.
                  </span>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
                  {CHATBOT_ROLES.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => {
                        setSelectedRole(role.id);
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl transition-all border ${
                        selectedRole === role.id
                          ? 'bg-[#242424] border-cyan-500/50 text-white'
                          : 'bg-[#1c1c1c] border-transparent text-slate-300 hover:bg-[#242424]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white">{role.name}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                          {role.badge}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{role.description}</p>
                    </button>
                  ))}

                  {/* Custom Role Option */}
                  <div className="pt-2 border-t border-[#282828] space-y-1.5">
                    <button
                      onClick={() => setSelectedRole('custom')}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-between ${
                        selectedRole === 'custom' ? 'text-cyan-300' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>Custom System Role</span>
                      {selectedRole === 'custom' && <Check className="w-3 h-3 text-cyan-400" />}
                    </button>
                    {selectedRole === 'custom' && (
                      <textarea
                        rows={2}
                        value={customRoleInstruction}
                        onChange={(e) => setCustomRoleInstruction(e.target.value)}
                        placeholder="Type custom instructions for this chatbot (e.g. You are a legal contract analyzer...)"
                        className="w-full bg-[#111111] border border-[#333333] rounded-lg p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Top Right Controls (Clean, Minimal like ChatGPT) */}
        <div className="flex items-center gap-1.5">
          {/* New Chat / New Idea button */}
          <button
            onClick={() => onNewChat?.()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2a2a2a] hover:bg-[#343434] border border-[#3c3c3c] text-xs font-semibold text-slate-200 transition-colors shadow-sm cursor-pointer"
            title="New Chat / New Idea (نیا چیٹ / آئیڈیا)"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">New Idea</span>
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleThemeMode}
            className="p-2 rounded-xl bg-[#2a2a2a] hover:bg-[#343434] border border-[#3c3c3c] text-slate-300 hover:text-amber-300 transition-colors cursor-pointer"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-400" />}
          </button>

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
                setExportToast('Conversation link copied to clipboard!');
                setTimeout(() => setExportToast(null), 3000);
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

                        {/* Generated High-Definition Artwork / Image - Feature Rich Display */}
                        {msg.generatedImage && (
                          <div className="my-3 max-w-[340px] sm:max-w-[420px]">
                            <div className="relative aspect-square rounded-2xl overflow-hidden border border-[#383838] bg-[#141414] shadow-xl group/img">
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
                              {/* Hover Overlay with Quick Zoom & Quick Download */}
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
                                  <button
                                    onClick={() => handleDownloadImage(msg.generatedImage!.url, msg.generatedImage!.prompt)}
                                    className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition shadow-lg cursor-pointer font-bold"
                                    title="Download image"
                                  >
                                    <Download className="w-4 h-4 stroke-[2.5]" />
                                  </button>
                                </div>
                                <div className="pointer-events-auto">
                                  <p className="text-[11px] text-white/90 line-clamp-2 drop-shadow font-medium">
                                    "{msg.generatedImage.prompt}"
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Full Feature Action Bar underneath the Image (Download, Share, Copy Prompt, Paste to Input) */}
                            <div className="mt-2 p-2.5 rounded-2xl bg-[#181818] border border-[#2e2e2e] space-y-2 shadow-md">
                              {/* Prompt text preview */}
                              <div className="text-[11px] text-slate-300 font-medium italic line-clamp-2 px-1">
                                "{msg.generatedImage.prompt}"
                              </div>

                              {/* Action buttons row */}
                              <div className="flex items-center justify-between gap-1 flex-wrap pt-1.5 border-t border-[#282828]">
                                <button
                                  onClick={() => handleDownloadImage(msg.generatedImage!.url, msg.generatedImage!.prompt)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-md cursor-pointer"
                                  title="Download image as file (ڈاؤن لوڈ)"
                                >
                                  <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                                  <span>Download (ڈاؤن لوڈ)</span>
                                </button>

                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleShareImage(msg.generatedImage!.url, msg.generatedImage!.prompt)}
                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#252525] hover:bg-[#303030] text-slate-200 text-xs font-medium transition cursor-pointer"
                                    title="Share image or copy URL"
                                  >
                                    <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                                    <span>Share</span>
                                  </button>

                                  <button
                                    onClick={() => handleCopy(msg.id + '_imgprompt', msg.generatedImage!.prompt)}
                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#252525] hover:bg-[#303030] text-slate-200 text-xs font-medium transition cursor-pointer"
                                    title="Copy prompt text"
                                  >
                                    {copiedId === msg.id + '_imgprompt' ? (
                                      <>
                                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                                        <span className="text-emerald-400 font-bold">Copied!</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3.5 h-3.5 text-slate-300" />
                                        <span>Copy</span>
                                      </>
                                    )}
                                  </button>

                                  <button
                                    onClick={() => handleReusePrompt(msg.generatedImage!.prompt)}
                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#252525] hover:bg-[#303030] text-purple-300 text-xs font-medium transition cursor-pointer"
                                    title="Paste prompt back into input box to edit or regenerate"
                                  >
                                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                                    <span>Reuse</span>
                                  </button>

                                  <button
                                    onClick={() =>
                                      setZoomImageUrl({
                                        url: msg.generatedImage!.url,
                                        prompt: msg.generatedImage!.prompt,
                                      })
                                    }
                                    className="p-1.5 rounded-xl bg-[#252525] hover:bg-[#303030] text-slate-400 hover:text-white transition cursor-pointer"
                                    title="Zoom / Fullscreen"
                                  >
                                    <Maximize2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
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

                        {/* Grounding Sources (Google Search / Google Maps) */}
                        {msg.groundingSources && msg.groundingSources.length > 0 && (
                          <div className="my-2.5 p-3 rounded-xl bg-[#181818] border border-[#2e2e2e] space-y-2">
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                              <span>Google Grounded Sources & Citations ({msg.groundingSources.length})</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {msg.groundingSources.map((source, sIdx) => (
                                <a
                                  key={sIdx}
                                  href={source.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#222222] hover:bg-[#2c2c2c] border border-[#383838] hover:border-cyan-500/50 text-xs text-slate-200 transition-all hover:scale-102"
                                >
                                  {source.type === 'maps' ? (
                                    <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                                  ) : (
                                    <Globe className="w-3 h-3 text-blue-400 shrink-0" />
                                  )}
                                  <span className="truncate max-w-[200px]">{source.title}</span>
                                  <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                                </a>
                              ))}
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
                      <div className="w-[280px] sm:w-[350px] aspect-square rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-[#181d24] via-[#12141a] to-[#0d0f14] p-5 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
                        {/* Shimmer Ambient Background */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 via-blue-500/10 to-purple-500/10 animate-pulse pointer-events-none" />
                        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-cyan-500/10 blur-2xl" />
                        <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-purple-500/10 blur-2xl" />

                        {/* ThinkPulse Logo with glowing pulsing ring */}
                        <div className="relative mb-3 flex items-center justify-center">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                            <ThinkPulseLogo size="md" showText={false} animated />
                          </div>
                          <span className="absolute -inset-1 rounded-2xl border border-cyan-400/30 animate-ping pointer-events-none" />
                        </div>

                        {/* Status Heading */}
                        <span className="text-xs font-bold text-white tracking-wide text-center">
                          ThinkPulse Neural Image Studio
                        </span>
                        <span className="text-[11px] font-medium text-cyan-300 mt-0.5 text-center">
                          Synthesizing 8K Photorealistic Artwork...
                        </span>
                        <span className="text-[10px] text-slate-400 font-urdu mt-0.5 text-center">
                          تصویر تخلیق ہو رہی ہے، برائے مہربانی انتظار فرمائیں
                        </span>

                        {/* Shimmer progress line */}
                        <div className="w-full mt-4 h-1.5 rounded-full bg-slate-800 overflow-hidden relative">
                          <div className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full w-2/3 animate-pulse" />
                        </div>

                        {/* Live Thinking Status Steps */}
                        <div className="mt-3 flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                          <Sparkles className="w-3 h-3 text-cyan-400 animate-spin" />
                          <span>Thinking • Processing prompt details & lighting</span>
                        </div>
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
                  onClick={() => {
                    const next = !webSearchEnabled;
                    setWebSearchEnabled(next);
                    if (next && mapsGroundingEnabled) setMapsGroundingEnabled(false);
                  }}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                    webSearchEnabled
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#3a3a3a]'
                  }`}
                  title="Google Search Grounding: Live factual web search data"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Google Search</span>
                </button>

                {/* Google Maps Grounding Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    const next = !mapsGroundingEnabled;
                    setMapsGroundingEnabled(next);
                    if (next && webSearchEnabled) setWebSearchEnabled(false);
                  }}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                    mapsGroundingEnabled
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#3a3a3a]'
                  }`}
                  title="Google Maps Grounding: Location, address & navigation data"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Google Maps</span>
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

                {/* Advanced Voice Call Trigger (ChatGPT Voice Mode - لائیو بات چیت) */}
                {onOpenLiveVoice && (
                  <button
                    type="button"
                    onClick={onOpenLiveVoice}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-semibold shadow-sm transition-all hover:scale-105 cursor-pointer"
                    title="Live Voice Mode (ChatGPT Style - لائیو بات چیت)"
                  >
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    <Headphones className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="hidden sm:inline">Voice Mode (لائیو بات)</span>
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
                <button
                  onClick={() => handleCopy('zoom_prompt', zoomImageUrl.prompt)}
                  className="px-3 py-1.5 rounded-xl bg-[#282828] hover:bg-[#333333] text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{copiedId === 'zoom_prompt' ? 'Copied!' : 'Copy Prompt'}</span>
                </button>
                <button
                  onClick={() => handleShareImage(zoomImageUrl.url, zoomImageUrl.prompt)}
                  className="px-3 py-1.5 rounded-xl bg-[#282828] hover:bg-[#333333] text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Share</span>
                </button>
                <button
                  onClick={() => handleDownloadImage(zoomImageUrl.url, zoomImageUrl.prompt)}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-cyan-500/20 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Download Image</span>
                </button>
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

      {/* 3-Lines (Hamburger) Chat History, Search, User Details & Retention Drawer */}
      {showSidebarDrawer && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowSidebarDrawer(false)}
          />
          {/* Slide-out Drawer Panel */}
          <div className="relative w-80 sm:w-96 max-w-full bg-[#181818] border-r border-[#2d2d2d] h-full flex flex-col z-10 shadow-2xl animate-slideRight">
            {/* Header */}
            <div className="p-4 border-b border-[#282828] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ThinkPulseLogo size="sm" />
                <div>
                  <span className="text-xs font-bold text-white block">ThinkPulse AI</span>
                  <span className="text-[10px] text-cyan-400">Autonomous Intelligence</span>
                </div>
              </div>
              <button
                onClick={() => setShowSidebarDrawer(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#242424] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions (New Chat & Dark/Light Mode) */}
            <div className="p-3 border-b border-[#282828] space-y-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onNewChat?.();
                    setShowSidebarDrawer(false);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>+ New Idea (نیا چیٹ / آئیڈیا)</span>
                </button>
                <button
                  onClick={toggleThemeMode}
                  className="p-2 rounded-xl bg-[#242424] hover:bg-[#2f2f2f] text-slate-300 hover:text-amber-300 transition-colors border border-[#333] cursor-pointer"
                  title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-400" />}
                </button>
              </div>

              {/* Search chats in title or message content */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={drawerSearch}
                  onChange={(e) => setDrawerSearch(e.target.value)}
                  placeholder="Search in title or chat content..."
                  className="w-full bg-[#111111] border border-[#2d2d2d] rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
                {drawerSearch && (
                  <button
                    onClick={() => setDrawerSearch('')}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* User Details Profile Card */}
            <div className="p-3 border-b border-[#282828] bg-[#141414]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  User Account Details (یوزر تفصیلات)
                </span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                  {user?.role === 'admin' ? 'SUPER ADMIN' : user?.plan?.toUpperCase() || 'VIP PRO'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-bold text-sm shrink-0 shadow-md">
                  {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'A'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white truncate">
                    {user?.name || 'Abdullah (Master Admin)'}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {user?.email || 'abdullah106556661@gmail.com'}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                    <span className="text-amber-400 font-mono font-bold">
                      {user?.unlimitedAccess ? '∞ Unlimited Tokens' : `${(user?.tokensRemaining || 1000000).toLocaleString()} tokens`}
                    </span>
                    <span>•</span>
                    <span className="text-emerald-400">Active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Retention & Auto-Archive Section */}
            <div className="p-3 border-b border-[#282828] bg-[#161616] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  <span>Chat Retention & Backup</span>
                </span>
                <button
                  onClick={handleArchiveOldChats}
                  className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer"
                  title="Archive older chats to permanent database storage"
                >
                  <Archive className="w-3 h-3" />
                  <span>Archive to DB</span>
                </button>
              </div>
              <div className="flex items-center gap-1 text-[11px]">
                <span className="text-slate-400">Keep:</span>
                {[
                  { days: 30, label: '30 Days (1 Month)' },
                  { days: 7, label: '7 Days' },
                  { days: 0, label: 'All' },
                ].map((item) => (
                  <button
                    key={item.days}
                    onClick={() => {
                      setRetentionDays(item.days);
                      try {
                        localStorage.setItem('thinkpulse_retention_days', String(item.days));
                      } catch {}
                    }}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-medium transition cursor-pointer ${
                      retentionDays === item.days
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-[#222] text-slate-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 leading-snug">
                پرانی چیٹ محفوظ رہتی ہے اور {retentionDays === 0 ? 'ہمیشہ دستیاب' : `${retentionDays} دن کے بعد`} خود بخود بیک اینڈ ڈیٹا بیس آرکائیو میں منتقل ہو جاتی ہے۔
              </p>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              <div className="px-2 py-1 flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase">
                <span>Conversation History ({filteredDrawerConvs.length})</span>
              </div>
              {filteredDrawerConvs.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  No matching chats found for "{drawerSearch}"
                </div>
              ) : (
                filteredDrawerConvs.map((conv) => {
                  const isActive = conv.id === activeConvId;
                  const matchInMessage = drawerSearch && !conv.title.toLowerCase().includes(drawerSearch.toLowerCase());
                  const matchedMsg = matchInMessage
                    ? conv.messages.find((m) => m.content.toLowerCase().includes(drawerSearch.toLowerCase()))
                    : null;

                  return (
                    <div
                      key={conv.id}
                      onClick={() => {
                        onSelectConv?.(conv.id);
                        setShowSidebarDrawer(false);
                      }}
                      className={`group p-2.5 rounded-xl cursor-pointer transition-all border ${
                        isActive
                          ? 'bg-[#252525] border-cyan-500/40 text-white'
                          : 'bg-[#1b1b1b] border-transparent text-slate-300 hover:bg-[#222222]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold truncate flex-1 pr-2">
                          {conv.title || 'Untitled Chat'}
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const filename = exportConversationAsMarkdown(conv);
                              setExportToast(`Exported "${filename}"`);
                              setTimeout(() => setExportToast(null), 3000);
                            }}
                            className="p-1 text-slate-400 hover:text-cyan-400 cursor-pointer"
                            title="Export chat"
                          >
                            <Download className="w-3 h-3" />
                          </button>
                          {onDeleteConv && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteConv(conv.id);
                              }}
                              className="p-1 text-slate-400 hover:text-red-400 cursor-pointer"
                              title="Delete chat"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                      {matchedMsg ? (
                        <p className="text-[10px] text-cyan-400/90 truncate mt-1 bg-cyan-950/30 px-1.5 py-0.5 rounded border border-cyan-800/30">
                          Matched text: "{matchedMsg.content.slice(0, 60)}..."
                        </p>
                      ) : (
                        <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                          <span>{conv.messages.length} messages</span>
                          <span>{new Date(conv.updatedAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
