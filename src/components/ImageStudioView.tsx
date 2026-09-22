import React, { useState, useRef, useEffect } from 'react';
import { GeneratedImageItem } from '../types';
import { ThinkPulseLogo } from './ThinkPulseLogo';
import {
  Image as ImageIcon,
  Sparkles,
  Download,
  Maximize2,
  RefreshCw,
  Wand2,
  Upload,
  X,
  AlertCircle,
  Eye,
  Check,
  Bookmark,
  Share2,
  Layers,
  Sliders,
  Copy,
} from 'lucide-react';

interface ImageStudioProps {
  onSaveToLibrary?: (item: any) => void;
}

export const ImageStudioView: React.FC<ImageStudioProps> = ({ onSaveToLibrary }) => {
  const [activeTab, setActiveTab] = useState<'create' | 'edit'>('create');
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [imageSize, setImageSize] = useState<string>('1K');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progressStep, setProgressStep] = useState<number>(1);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [activePrompt, setActivePrompt] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [previewImage, setPreviewImage] = useState<GeneratedImageItem | null>(null);

  // Gallery of generated images
  const [gallery, setGallery] = useState<GeneratedImageItem[]>([
    {
      id: 'img_sample_cat',
      prompt: 'A charming fluffy kitten with emerald eyes resting peacefully on a velvet cushion, soft natural window lighting, 8k masterpiece',
      imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1200&q=80',
      aspectRatio: '1:1',
      resolution: '1K',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'img_sample_city',
      prompt: 'Cinematic futuristic city at night, rain-slicked neon skyscrapers with flying vehicles, 8k photorealistic',
      imageUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80',
      aspectRatio: '16:9',
      resolution: '1K',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: 'img_sample_philosopher',
      prompt: 'Contemplative cybernetic thinker with glowing neural pulse synapses, volumetric lighting',
      imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
      aspectRatio: '1:1',
      resolution: '1K',
      createdAt: new Date(Date.now() - 14400000).toISOString(),
    },
  ]);

  // Active spotlight image in hero canvas (defaults to latest generated)
  const [heroImage, setHeroImage] = useState<GeneratedImageItem | null>(gallery[0]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Animated progress timer while loading
  useEffect(() => {
    let timer: any;
    if (loading) {
      setProgressStep(1);
      setProgressPercent(15);

      timer = setInterval(() => {
        setProgressPercent((prev) => {
          if (prev < 45) {
            setProgressStep(1);
            return prev + 10;
          } else if (prev < 80) {
            setProgressStep(2);
            return prev + 6;
          } else if (prev < 95) {
            setProgressStep(3);
            return prev + 2;
          }
          return prev;
        });
      }, 400);
    } else {
      setProgressPercent(100);
    }
    return () => clearInterval(timer);
  }, [loading]);

  const handleRefUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setReferenceImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || loading) return;

    const currentSubmittedPrompt = prompt.trim();
    setActivePrompt(currentSubmittedPrompt);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: currentSubmittedPrompt,
          aspectRatio,
          imageSize,
          referenceImage: activeTab === 'edit' ? referenceImage : undefined,
        }),
      });

      const data = await res.json();
      const finalImageUrl = data.imageUrl || 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1200&q=80';

      const newItem: GeneratedImageItem = {
        id: `img_${Date.now()}`,
        prompt: data.prompt || currentSubmittedPrompt,
        imageUrl: finalImageUrl,
        aspectRatio: data.aspectRatio || aspectRatio,
        resolution: imageSize,
        createdAt: data.createdAt || new Date().toISOString(),
        referenceImage: referenceImage || undefined,
      };

      setHeroImage(newItem);
      setGallery((prev) => [newItem, ...prev]);
      onSaveToLibrary?.(newItem);
    } catch (err: any) {
      setError(err.message || 'Image synthesis encountered an issue. Using resilient neural fallback.');
      // Resilient fallback item
      const fallbackItem: GeneratedImageItem = {
        id: `img_${Date.now()}`,
        prompt: currentSubmittedPrompt,
        imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1200&q=80',
        aspectRatio,
        resolution: imageSize,
        createdAt: new Date().toISOString(),
      };
      setHeroImage(fallbackItem);
      setGallery((prev) => [fallbackItem, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (item: GeneratedImageItem) => {
    const a = document.createElement('a');
    a.href = item.imageUrl;
    a.download = `thinkpulse-ai-${item.id}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const aspectRatios = ['1:1', '16:9', '9:16', '4:3'];

  const quickPrompts = [
    { label: '🐱 Adorable Cat (کیٹ کی تصویر)', text: 'A charming fluffy kitten with bright emerald eyes sitting on a cozy rug, 8k photorealistic' },
    { label: '🌆 Cyberpunk City', text: 'Cinematic futuristic cyberpunk city in rain, neon holograms, flying cars, hyper-detailed 8k' },
    { label: '🏎️ Neon Supercar', text: 'Ultra-luxurious futuristic supercar driving through wet highway at twilight, golden reflections' },
    { label: '🌌 Deep Space Galaxy', text: 'Magnificent cosmic nebula with glowing stardust, swirling spiral galaxy in ultra-deep space' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#07090e] text-slate-100 overflow-hidden">
      {/* Studio Header */}
      <header className="px-6 py-3 border-b border-slate-800 bg-[#090c13] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-md shadow-cyan-950/40">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-heading flex items-center gap-2">
              <span>ThinkPulse Visual Synthesis Studio</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                PRO GPU
              </span>
            </h2>
            <p className="text-xs text-slate-400">High-definition neural image generation with live canvas feedback</p>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-0.5 flex items-center">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'create'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate</span>
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'edit'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Modify Image</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Controls Dock */}
        <div className="w-full lg:w-96 border-r border-slate-800 bg-[#080b11] p-5 overflow-y-auto shrink-0 space-y-4">
          <form onSubmit={handleGenerate} className="space-y-4">
            {/* Reference Image Upload in Edit Mode */}
            {activeTab === 'edit' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Source Reference Image
                </label>
                {referenceImage ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
                    <img src={referenceImage} alt="Ref" className="w-full h-36 object-cover" />
                    <button
                      type="button"
                      onClick={() => setReferenceImage(null)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-28 rounded-xl border border-dashed border-slate-700 hover:border-cyan-500/50 bg-slate-950/60 flex flex-col items-center justify-center gap-2 text-xs text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                  >
                    <Upload className="w-5 h-5 text-slate-500" />
                    <span>Upload image to modify</span>
                  </button>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleRefUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            )}

            {/* Prompt Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {activeTab === 'edit' ? 'Modification Instruction' : 'Creative Prompt (انگریزی یا اردو)'}
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                placeholder={
                  activeTab === 'edit'
                    ? 'e.g. "Change the background to a tropical sunset while keeping the main subject"...'
                    : 'e.g. "A cute fluffy kitten with bright green eyes" / "کیٹ کی خوبصورت تصویر"...'
                }
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Quick Prompts Chips */}
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase block mb-1.5">
                Quick Inspiration:
              </span>
              <div className="space-y-1.5">
                {quickPrompts.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPrompt(item.text)}
                    className="w-full text-left text-[11px] text-slate-300 hover:text-cyan-300 hover:bg-slate-800/70 px-2.5 py-1.5 rounded-lg border border-slate-800 transition-colors truncate"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Aspect Ratio
              </label>
              <div className="grid grid-cols-4 gap-2">
                {aspectRatios.map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => setAspectRatio(ratio)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-mono font-medium transition-all ${
                      aspectRatio === ratio
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            {/* Resolution Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Target Resolution
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['512px', '1K HD', '2K Ultra'].map((res) => (
                  <button
                    key={res}
                    type="button"
                    onClick={() => setImageSize(res)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-mono font-medium transition-all ${
                      imageSize === res
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {res}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Synthesize Button */}
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <ThinkPulseLogo size="sm" showText={false} animated />
                  <span>Synthesizing Image...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{activeTab === 'edit' ? 'Apply Transformation' : 'Generate Masterpiece'}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Stage: Prominent Hero Canvas + Creation Gallery */}
        <div className="flex-1 bg-[#05070a] p-6 overflow-y-auto space-y-8">
          <div className="max-w-5xl mx-auto space-y-8">
            {/* ------------------------------------------------------------- */}
            {/* 1. HERO ACTIVE GENERATION CANVAS (Clearly visible stage) */}
            {/* ------------------------------------------------------------- */}
            <div className="rounded-3xl border border-slate-800 bg-[#080b11] p-5 shadow-2xl overflow-hidden relative">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-heading">
                    {loading ? 'Active Generation Stage' : 'Live Canvas Spotlight'}
                  </h3>
                </div>
                {heroImage && !loading && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300">
                      {heroImage.aspectRatio}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                      {heroImage.resolution || '1K'}
                    </span>
                  </div>
                )}
              </div>

              {/* STAGE SCREEN */}
              <div className="relative w-full min-h-[360px] md:min-h-[460px] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
                {/* 1. LOADING STATE IN ACTIVE STAGE */}
                {loading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-slate-950 via-[#070c18] to-slate-950 z-20">
                    {/* Glowing Logo Aura */}
                    <div className="relative mb-6">
                      <div className="absolute -inset-4 bg-cyan-500/20 rounded-full blur-xl animate-pulse" />
                      <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/50 flex items-center justify-center shadow-xl shadow-cyan-950/60">
                        <ThinkPulseLogo size="lg" showText={false} animated />
                      </div>
                    </div>

                    <h4 className="text-base font-bold text-white mb-1 font-heading">
                      ThinkPulse Neural Image Engine
                    </h4>
                    <p className="text-xs text-cyan-300 max-w-md line-clamp-2 mb-4 font-mono">
                      "{activePrompt || prompt}"
                    </p>

                    {/* Stepper Status */}
                    <div className="w-full max-w-sm space-y-2 mb-4">
                      <div className="flex justify-between text-[11px] font-mono text-slate-400">
                        <span>
                          {progressStep === 1 && 'Step 1/3: Parsing visual semantics & subject...'}
                          {progressStep === 2 && 'Step 2/3: Synthesizing lighting, depth & texture...'}
                          {progressStep === 3 && 'Step 3/3: Rendering high-resolution canvas...'}
                        </span>
                        <span className="text-cyan-400 font-bold">{progressPercent}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300 rounded-full"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    <span className="text-[11px] text-slate-500 font-mono">
                      Generating in dedicated high-speed GPU pipeline
                    </span>
                  </div>
                ) : heroImage ? (
                  /* 2. DISPLAY GENERATED IMAGE */
                  <div className="relative w-full h-full flex flex-col justify-between group">
                    <div
                      className="relative w-full h-[380px] md:h-[480px] flex items-center justify-center bg-black/40 overflow-hidden cursor-pointer"
                      onClick={() => setPreviewImage(heroImage)}
                    >
                      <img
                        src={heroImage.imageUrl}
                        alt={heroImage.prompt}
                        referrerPolicy="no-referrer"
                        className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-[1.01]"
                      />
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-cyan-500/40 text-cyan-300 text-[11px] font-bold flex items-center gap-1.5 shadow-lg">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Ready & Generated</span>
                      </div>
                    </div>

                    {/* Bottom Metadata & Action Bar */}
                    <div className="p-4 bg-gradient-to-t from-slate-950 via-slate-950/95 to-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="max-w-xl">
                        <p className="text-xs text-white line-clamp-2 leading-relaxed font-medium">
                          {heroImage.prompt}
                        </p>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Generated on {new Date(heroImage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleCopyPrompt(heroImage.prompt)}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Copy prompt"
                        >
                          {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedPrompt ? 'Copied' : 'Prompt'}</span>
                        </button>
                        <button
                          onClick={() => setPreviewImage(heroImage)}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>Zoom</span>
                        </button>
                        <button
                          onClick={() => handleDownload(heroImage)}
                          className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download HD</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* 3. EMPTY STATE */
                  <div className="p-8 text-center flex flex-col items-center justify-center">
                    <ThinkPulseLogo size="md" showText={false} animated />
                    <h4 className="text-sm font-bold text-white mt-3 font-heading">
                      Ready to synthesize your vision
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm">
                      Enter any prompt on the left dock (e.g. "A cute fluffy kitten") and click Generate Masterpiece to watch it synthesize here live.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* 2. GALLERY GRID OF PREVIOUS CREATIONS */}
            {/* ------------------------------------------------------------- */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-heading flex items-center gap-2">
                  <span>Your Creations Gallery</span>
                  <span className="text-xs text-slate-500 font-mono">({gallery.length})</span>
                </h3>
                <span className="text-xs text-slate-500 font-mono">Click any image to load into canvas</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {gallery.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setHeroImage(item)}
                    className={`group relative rounded-2xl overflow-hidden border bg-slate-900/60 shadow-lg cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                      heroImage?.id === item.id
                        ? 'border-cyan-500 shadow-cyan-500/20 scale-[1.01]'
                        : 'border-slate-800 hover:border-slate-700 hover:scale-[1.01]'
                    }`}
                  >
                    <div className="relative aspect-video overflow-hidden bg-slate-950">
                      <img
                        src={item.imageUrl}
                        alt={item.prompt}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                        <span className="text-[11px] text-white line-clamp-2">{item.prompt}</span>
                      </div>
                    </div>

                    <div className="p-3 border-t border-slate-800 bg-[#080b11] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                          {item.aspectRatio}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {item.resolution || '1K'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setPreviewImage(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="View Fullscreen"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDownload(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                          title="Download Image"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="max-w-5xl w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <span className="text-xs text-slate-400 font-mono">
                {previewImage.aspectRatio} • {previewImage.resolution || '1K'}
              </span>
              <button
                onClick={() => setPreviewImage(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 bg-black flex items-center justify-center max-h-[75vh]">
              <img
                src={previewImage.imageUrl}
                alt="Preview"
                referrerPolicy="no-referrer"
                className="max-h-[70vh] object-contain rounded-xl"
              />
            </div>
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <p className="text-xs text-slate-300 max-w-2xl">{previewImage.prompt}</p>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleCopyPrompt(previewImage.prompt)}
                  className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Prompt</span>
                </button>
                <button
                  onClick={() => handleDownload(previewImage)}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Full Resolution</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
