import React, { useState } from 'react';
import { ThinkPulseLogo } from './ThinkPulseLogo';
import {
  Sparkles,
  Bot,
  Globe,
  Layers,
  Image as ImageIcon,
  Video,
  Mic,
  FileText,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Shield,
  Zap,
  Code2,
  Play,
  Cpu,
  PhoneCall,
  Crown,
  Smartphone,
  CreditCard,
  Sun,
  Moon,
} from 'lucide-react';
import { ViewMode } from '../types';

interface LandingPageProps {
  onNavigate: (view: ViewMode) => void;
  onQuickPrompt?: (prompt: string, tool: ViewMode) => void;
  onOpenJazzCash?: (plan: 'pro' | 'enterprise') => void;
  onOpenLiveVoice?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onQuickPrompt,
  onOpenJazzCash,
  onOpenLiveVoice,
}) => {
  const [quickInput, setQuickInput] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'website' | 'image' | 'video'>('website');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [currency, setCurrency] = useState<'PKR' | 'USD'>('PKR');

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('thinkpulse_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {}
    return 'dark';
  });

  React.useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
    try {
      localStorage.setItem('thinkpulse_theme', theme);
    } catch {}
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleLaunchPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    if (activeTab === 'website') {
      onQuickPrompt?.(quickInput, 'dashboard-website');
    } else if (activeTab === 'image') {
      onQuickPrompt?.(quickInput, 'dashboard-image');
    } else if (activeTab === 'video') {
      onQuickPrompt?.(quickInput, 'dashboard-video');
    } else {
      onQuickPrompt?.(quickInput, 'dashboard-chat');
    }
  };

  const samplePrompts = [
    { label: 'Sport Team AI: Pakistan Cricket XI & T20 match plan', tool: 'dashboard-sport' as ViewMode },
    { label: 'Build a luxury restaurant site with booking form', tool: 'dashboard-website' as ViewMode },
    { label: 'Cyberpunk street in neon rain, 4K cinematic', tool: 'dashboard-image' as ViewMode },
    { label: 'Explain quantum physics with step-by-step thinking', tool: 'dashboard-chat' as ViewMode },
    { label: 'Create 10s drone flight over crystalline mountains', tool: 'dashboard-video' as ViewMode },
  ];

  const faqs = [
    {
      q: 'What makes ThinkPulse AI distinct from basic AI chatbots?',
      a: 'ThinkPulse AI is an all-in-one autonomous multimodal intelligence platform. Beyond conversational reasoning with deep thinking mode, it features a native AI Website Builder that produces complete, multi-page, deployable responsive websites, a full image/video creative suite, document intelligence, and real-time voice interaction.',
    },
    {
      q: 'How does the AI Website Builder generate production-ready sites?',
      a: 'Our WebArchitect engine generates semantic HTML, Tailwind CSS, and vanilla interactive JavaScript with working forms, navigation, responsive layouts, and interactive components. You can chat with the AI in real time to refine styles, add pages, and export the entire project as a ZIP or single-file bundle.',
    },
    {
      q: 'Can I upload files, images, and audio for analysis?',
      a: 'Yes. ThinkPulse supports direct file processing for PDFs, TXT, CSV, images, audio, and video files. You can ask for executive summaries, structured data extraction, audio transcription, or image understanding.',
    },
    {
      q: 'Is there a free trial or demo mode?',
      a: 'Yes. You can test ThinkPulse immediately using our One-Click Demo account without entering any payment information, or sign up for a free tier account.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#07090e]/85 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <ThinkPulseLogo size="lg" animated />

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#capabilities" className="hover:text-cyan-400 transition-colors">
              Capabilities
            </a>
            <a href="#website-builder" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              Website Builder
            </a>
            <a href="#media-studio" className="hover:text-cyan-400 transition-colors">
              Image & Video
            </a>
            <a href="#pricing" className="hover:text-cyan-400 transition-colors">
              Pricing
            </a>
            <a href="#faq" className="hover:text-cyan-400 transition-colors">
              FAQ
            </a>
            <a
              href="/abdullah-55566-hacker"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('seo-abdullah-brand');
              }}
              className="hover:text-cyan-400 transition-colors text-cyan-300/90 font-medium"
            >
              Abdullah 55566 hacker
            </a>
            <a
              href="https://www.youtube.com/channel/UCiq2giiXtFk_XBfEuS6Dvrg"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/30 text-xs font-semibold transition-all hover:scale-105"
              title="Official YouTube Channel"
            >
              <Play className="w-3 h-3 fill-red-400" />
              <span>YouTube</span>
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {onOpenLiveVoice && (
              <button
                onClick={onOpenLiveVoice}
                className="px-3 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 hover:border-emerald-400 text-emerald-300 flex items-center gap-1.5 transition-all hover:scale-105"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Live Call (لائیو بات کریں)</span>
              </button>
            )}
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/60 text-slate-300 hover:text-amber-300 transition-colors"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-400" />}
            </button>

            <button
              onClick={() => onNavigate('auth-login')}
              className="px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Sign In / Admin
            </button>
            <button
              onClick={() => onNavigate('auth-signup')}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 overflow-hidden">
        {/* Subtle Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-cyan-500/15 via-blue-600/10 to-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-6">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Autonomous Cognitive Intelligence Platform</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span className="text-slate-400">High Reasoning & Full Stack</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white font-heading leading-[1.1] mb-6">
            Think deeper. Create faster.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400">
              Build everything.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-300 font-normal leading-relaxed mb-10">
            A comprehensive multimodal platform combining deep reasoning AI, photo & video synthesis, real-time voice, and a native autonomous website generator that builds real, interactive projects.
          </p>

          {/* Interactive Quick Launch Box */}
          <div className="max-w-3xl mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-2xl shadow-cyan-950/40 backdrop-blur-xl">
            {/* Tool Tabs */}
            <div className="flex items-center gap-2 mb-3 border-b border-slate-800 pb-2 px-2 overflow-x-auto">
              <button
                onClick={() => setActiveTab('website')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                  activeTab === 'website'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                AI Website Builder
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                  activeTab === 'chat'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                Thinking Chat
              </button>
              <button
                onClick={() => setActiveTab('image')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                  activeTab === 'image'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                Image Studio
              </button>
              <button
                onClick={() => setActiveTab('video')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                  activeTab === 'video'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                Video & Shorts
              </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleLaunchPrompt} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                placeholder={
                  activeTab === 'website'
                    ? 'Describe any website: "Artisan coffee roastery with menu, story & online order form"...'
                    : activeTab === 'image'
                    ? 'Describe an image: "Futuristic solar punk city with hanging gardens, 4K photorealistic"...'
                    : activeTab === 'video'
                    ? 'Describe a cinematic video or social reel: "Drone shot over neon cyberpunk highway at night"...'
                    : 'Ask any complex question with deep thinking mode enabled...'
                }
                className="flex-1 bg-slate-950/80 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-semibold text-sm text-white flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02]"
              >
                <span>Launch Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Sample Preset Chips */}
            <div className="mt-3 flex items-center gap-2 flex-wrap text-left px-1">
              <span className="text-[11px] text-slate-500 font-medium">Try:</span>
              {samplePrompts.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onQuickPrompt?.(p.label, p.tool)}
                  className="text-[11px] text-slate-400 hover:text-cyan-300 bg-slate-800/60 hover:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700/50 transition-colors"
                >
                  "{p.label}"
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section id="capabilities" className="py-20 border-t border-slate-800/80 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-3">
              Comprehensive Multi-Modal Architecture
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white font-heading">
              Engineered for demanding intelligence tasks
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Deep Thinking Chat */}
            <div
              onClick={() => onNavigate('dashboard-chat')}
              className="group p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900/90 transition-all cursor-pointer shadow-lg hover:shadow-cyan-950/30"
            >
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-5 group-hover:scale-110 transition-transform">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 font-heading group-hover:text-cyan-300 transition-colors">
                High-Reasoning Thinking Chat
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Transparent multi-step cognitive reasoning with live search grounding, markdown rendering, multi-turn memory, and message editing.
              </p>
              <div className="flex items-center text-xs font-semibold text-cyan-400 gap-1">
                <span>Open Assistant</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 2: AI Website Builder */}
            <div
              onClick={() => onNavigate('dashboard-website')}
              className="group p-6 rounded-2xl bg-gradient-to-b from-cyan-950/40 to-slate-900/60 border border-cyan-500/40 hover:border-cyan-400 hover:bg-slate-900/90 transition-all cursor-pointer shadow-lg hover:shadow-cyan-900/30 relative overflow-hidden"
            >
              <div className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Special Feature
              </div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 mb-5 group-hover:scale-110 transition-transform">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 font-heading group-hover:text-cyan-300 transition-colors">
                Autonomous AI Website Builder
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Describe any restaurant, portfolio, agency, or SaaS product. Generates complete responsive code with live preview, AI chat editor, and ZIP export.
              </p>
              <div className="flex items-center text-xs font-semibold text-cyan-400 gap-1">
                <span>Start Website Project</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 3: Image Studio & Editing */}
            <div
              onClick={() => onNavigate('dashboard-image')}
              className="group p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900/90 transition-all cursor-pointer shadow-lg hover:shadow-cyan-950/30"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-5 group-hover:scale-110 transition-transform">
                <ImageIcon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 font-heading group-hover:text-blue-300 transition-colors">
                Image Synthesis & Editing
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Text-to-image and reference-guided image editing with configurable aspect ratios (1:1, 16:9, 9:16, 21:9) and resolutions up to 2K.
              </p>
              <div className="flex items-center text-xs font-semibold text-blue-400 gap-1">
                <span>Explore Image Studio</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 4: Video & Short Clips */}
            <div
              onClick={() => onNavigate('dashboard-video')}
              className="group p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900/90 transition-all cursor-pointer shadow-lg hover:shadow-cyan-950/30"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-5 group-hover:scale-110 transition-transform">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 font-heading group-hover:text-purple-300 transition-colors">
                Video & Short Clip Engine
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Veo-powered video generation and optimized short-clip tools for social media Reels, TikToks, ads, and cinematic landscape scenes.
              </p>
              <div className="flex items-center text-xs font-semibold text-purple-400 gap-1">
                <span>Generate Video</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 5: Real-time Live Voice */}
            <div
              onClick={() => onNavigate('dashboard-voice')}
              className="group p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900/90 transition-all cursor-pointer shadow-lg hover:shadow-cyan-950/30"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-110 transition-transform">
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 font-heading group-hover:text-emerald-300 transition-colors">
                Real-Time Voice AI
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Natural conversational speech recognition, low-latency live audio, multiple prebuilt voices, and instant audio transcription.
              </p>
              <div className="flex items-center text-xs font-semibold text-emerald-400 gap-1">
                <span>Start Voice Session</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 6: Document AI */}
            <div
              onClick={() => onNavigate('dashboard-docs')}
              className="group p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900/90 transition-all cursor-pointer shadow-lg hover:shadow-cyan-950/30"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 font-heading group-hover:text-amber-300 transition-colors">
                Document & File Intelligence
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Upload PDFs, spreadsheets, or text files for instant executive summaries, table data extraction, and interactive document questioning.
              </p>
              <div className="flex items-center text-xs font-semibold text-amber-400 gap-1">
                <span>Analyze Documents</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Website Builder Deep Dive Showcase */}
      <section id="website-builder" className="py-24 border-t border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-xs font-bold mb-4">
                <Globe className="w-3.5 h-3.5" />
                Featured AI Engine
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-heading leading-tight mb-6">
                Turn thoughts into working websites in seconds.
              </h2>
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-8">
                Not generic wireframes or static images. ThinkPulse generates real HTML, CSS, and interactive JavaScript with responsive navigation, menus, pricing, contact forms, and client-side interactions.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white text-sm">Interactive Live Preview:</strong>
                    <span className="text-slate-400 text-sm ml-1">
                      Toggle between Desktop, Tablet, and Mobile viewports directly inside the canvas.
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white text-sm">Conversational AI Editor:</strong>
                    <span className="text-slate-400 text-sm ml-1">
                      Chat to update sections: "Change colors to slate & emerald", "Add customer reviews", "Make navbar sticky".
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white text-sm">One-Click Project Export:</strong>
                    <span className="text-slate-400 text-sm ml-1">
                      Download complete ZIP bundle with all HTML, CSS, JS, and documentation ready for deployment.
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onNavigate('dashboard-website')}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-xl shadow-cyan-500/20 flex items-center gap-2"
              >
                <span>Launch Website Builder</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Visual Mock / Interactive Preview Box */}
            <div className="rounded-2xl border border-slate-700/80 bg-slate-900/90 p-4 shadow-2xl shadow-cyan-950/30">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  <span className="text-xs font-mono text-slate-400 ml-2">preview.thinkpulse.ai/ristorante-aurora</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                  <Zap className="w-3 h-3" /> Live Sandbox
                </div>
              </div>

              {/* Embedded Mini Preview */}
              <div className="rounded-xl overflow-hidden border border-slate-800 bg-[#0c1017] p-5">
                <div className="flex items-center justify-between mb-6">
                  <span className="font-heading font-bold text-white text-base">AURORA BISTRO</span>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span>Menu</span>
                    <span>Story</span>
                    <span>Reservations</span>
                  </div>
                </div>
                <div className="text-center py-8">
                  <span className="text-xs uppercase tracking-widest text-cyan-400 font-semibold">Fine Italian Culinary Art</span>
                  <h4 className="text-2xl font-bold text-white font-heading mt-1 mb-2">Wood-Fired Passions & Vintage Wines</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">Handcrafted pasta prepared daily using heritage ingredients.</p>
                  <div className="inline-block px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 text-xs font-bold">
                    Reserve Table
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 border-t border-slate-800/80 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/50 border border-red-500/40 text-red-300 text-xs font-semibold mb-3">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span>Official JazzCash & Cards Supported (پاکستان میں براہ راست ادائیگی)</span>
            </div>
            <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-3">Transparent Plans</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white font-heading mb-6">
              Scale your intelligence seamlessly
            </p>

            {/* Currency Selector (PKR JazzCash vs USD) */}
            <div className="inline-flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
              <button
                onClick={() => setCurrency('PKR')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  currency === 'PKR'
                    ? 'bg-gradient-to-r from-[#b30006] to-[#d31820] text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>₨ PKR (JazzCash Official: 03176901963)</span>
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  currency === 'USD'
                    ? 'bg-cyan-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>$ USD (Global Cards)</span>
              </button>
            </div>

            {currency === 'PKR' && (
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-950/40 border border-red-500/30 text-xs text-amber-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Verified JazzCash Receiver: <strong className="font-mono text-white">03176901963</strong> (Abdullah / ThinkPulse AI)</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white font-heading mb-1">Starter</h3>
                <p className="text-xs text-slate-400 mb-6">For exploring the multimodal tools</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold text-white font-heading">
                    {currency === 'PKR' ? '₨ 0' : '$0'}
                  </span>
                  <span className="text-xs text-slate-400">/ forever free</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-300 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span>Standard Thinking Chat</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span>3 AI Website Projects</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span>20 Image Generations / mo</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span>Document Summarization</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => onNavigate('auth-signup')}
                className="w-full py-2.5 rounded-xl border border-slate-700 hover:border-slate-500 text-sm font-semibold text-white transition-colors"
              >
                Sign Up Free
              </button>
            </div>

            {/* Pro Plan */}
            <div className="p-8 rounded-2xl bg-gradient-to-b from-cyan-950/40 via-slate-900/80 to-slate-900 border-2 border-cyan-500/60 flex flex-col justify-between relative shadow-xl shadow-cyan-950/50">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-cyan-500 text-slate-950 text-[11px] font-extrabold tracking-wide uppercase">
                Most Popular
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-heading mb-1">Pro Creator</h3>
                <p className="text-xs text-slate-400 mb-6">For power users & founders</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold text-white font-heading">
                    {currency === 'PKR' ? '₨ 4,999' : '$29'}
                  </span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-300 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span>Unlimited High-Reasoning Chat</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span>Unlimited Website Generation & ZIP Export</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span>Full Veo Video & Short Clips Studio</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span>Interactive Real-Time Voice Mode</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span>High-Resolution 2K Images</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                {/* JazzCash Option */}
                <button
                  onClick={() => onOpenJazzCash?.('pro')}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#b30006] via-[#d31820] to-[#f99b1c] hover:brightness-110 text-white font-bold text-xs shadow-lg shadow-red-950/40 flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Pay with JazzCash (₨ 4,999)</span>
                </button>
                <button
                  onClick={() => onNavigate('auth-signup')}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
                >
                  Pay with Card ($29)
                </button>
              </div>
            </div>

            {/* Enterprise Plan */}
            <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white font-heading mb-1">Enterprise</h3>
                <p className="text-xs text-slate-400 mb-6">For teams and organizations</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold text-white font-heading">
                    {currency === 'PKR' ? '₨ 19,999' : '$99'}
                  </span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-300 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span>Dedicated Compute Concurrency</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span>Team Workspaces & Shared Library</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span>Priority Support Desk (2hr SLA)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span>Custom API Keys & Fine-Tuning</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                {/* JazzCash Option */}
                <button
                  onClick={() => onOpenJazzCash?.('enterprise')}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#b30006] via-[#d31820] to-[#f99b1c] hover:brightness-110 text-white font-bold text-xs shadow-lg shadow-red-950/40 flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Pay with JazzCash (₨ 19,999)</span>
                </button>
                <button
                  onClick={() => onNavigate('dashboard-support')}
                  className="w-full py-2 rounded-xl border border-slate-700 hover:border-slate-500 text-xs font-semibold text-slate-300 transition-colors"
                >
                  Contact Enterprise Desk
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 border-t border-slate-800/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-3">FAQ</h2>
            <p className="text-3xl font-extrabold text-white font-heading">Frequently Asked Questions</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between text-base font-semibold text-white hover:text-cyan-300 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-cyan-400' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 text-sm text-slate-400 leading-relaxed border-t border-slate-800/50 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-[#05070a] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center md:items-start gap-2">
              <ThinkPulseLogo size="md" />
              <p className="text-xs text-slate-500">
                Autonomous Multimodal AI Platform. All rights reserved.
              </p>
            </div>

            <div className="flex items-center gap-6 text-xs text-slate-400">
              <a
                href="https://www.youtube.com/channel/UCiq2giiXtFk_XBfEuS6Dvrg"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-red-400 text-red-400/90 font-medium inline-flex items-center gap-1.5"
              >
                <Play className="w-3 h-3 fill-red-400" />
                <span>YouTube Channel</span>
              </a>
              <a
                href="/abdullah-55566-hacker"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('seo-abdullah-brand');
                }}
                className="hover:text-cyan-400 text-slate-300 font-medium"
              >
                Abdullah 55566 hacker
              </a>
              <button onClick={() => onNavigate('dashboard-support')} className="hover:text-cyan-400">
                System Status
              </button>
              <button onClick={() => onNavigate('dashboard-support')} className="hover:text-cyan-400">
                Support Desk
              </button>
              <button onClick={() => onNavigate('dashboard-settings')} className="hover:text-cyan-400">
                Privacy & Security
              </button>
              <button onClick={() => onNavigate('dashboard-settings')} className="hover:text-cyan-400">
                Terms of Service
              </button>
            </div>

            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>All Systems Operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
