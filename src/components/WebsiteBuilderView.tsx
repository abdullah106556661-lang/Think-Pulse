import React, { useState, useRef, useEffect } from 'react';
import { GeneratedWebsiteProject } from '../types';
import JSZip from 'jszip';
import { ThinkPulseLogo } from './ThinkPulseLogo';
import { GenerationIndicator } from './GenerationIndicator';
import {
  Globe,
  Sparkles,
  Send,
  Download,
  Copy,
  Check,
  Maximize2,
  Smartphone,
  Tablet,
  Monitor,
  Code2,
  Eye,
  History,
  Layers,
  ArrowRight,
  RefreshCw,
  Palette,
  AlertCircle,
  Rocket,
  ExternalLink,
  Save,
  Trash2,
  CheckCircle2,
} from 'lucide-react';

interface WebsiteBuilderProps {
  onSaveToLibrary?: (project: GeneratedWebsiteProject) => void;
  initialProject?: GeneratedWebsiteProject | null;
}

export const WebsiteBuilderView: React.FC<WebsiteBuilderProps> = ({
  onSaveToLibrary,
  initialProject,
}) => {
  const [prompt, setPrompt] = useState('');
  const [category, setCategory] = useState<'restaurant' | 'portfolio' | 'saas' | 'ecommerce' | 'agency' | 'blog'>('restaurant');
  const [loading, setLoading] = useState(false);
  const [chatInstruction, setChatInstruction] = useState('');
  const [modifying, setModifying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [deviceViewport, setDeviceViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [codeTab, setCodeTab] = useState<'html' | 'css' | 'js'>('html');
  const [error, setError] = useState<string | null>(null);
  const [deploying, setDeploying] = useState(false);
  const [deployProgress, setDeployProgress] = useState('');
  const [liveUrl, setLiveUrl] = useState<string | null>(initialProject?.liveUrl || null);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  // Default initial project if none provided
  const [project, setProject] = useState<GeneratedWebsiteProject>(
    initialProject || {
      id: 'web_default_1',
      title: 'Aura Bistro & Bar',
      prompt: 'Build a modern luxury Italian restaurant website with menu, story, reservation form and gallery',
      description: 'Sophisticated culinary showcase with table booking & chef specials',
      category: 'restaurant',
      theme: { primaryColor: '#06b6d4', font: 'Plus Jakarta Sans', mode: 'dark' },
      files: {
        html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Aura Bistro & Bar</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,800;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    h1, h2, h3, .serif-font { font-family: 'Playfair Display', serif; }
  </style>
</head>
<body class="bg-[#0b0e14] text-slate-100 min-h-screen">
  <!-- Navigation -->
  <nav class="border-b border-slate-800/80 px-6 py-4 flex items-center justify-between sticky top-0 bg-[#0b0e14]/90 backdrop-blur-md z-40">
    <div class="flex items-center gap-3">
      <span class="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold serif-font">A</span>
      <span class="text-xl font-bold tracking-tight text-white serif-font">AURA <span class="text-cyan-400 text-sm font-sans font-medium tracking-widest uppercase">Bistro</span></span>
    </div>
    <div class="hidden md:flex items-center gap-6 text-sm text-slate-300 font-medium">
      <a href="#menu" class="hover:text-cyan-400 transition-colors">Menu</a>
      <a href="#story" class="hover:text-cyan-400 transition-colors">Our Story</a>
      <a href="#chef" class="hover:text-cyan-400 transition-colors">Chef's Table</a>
      <a href="#reserve" class="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all">Book Reservation</a>
    </div>
  </nav>

  <!-- Hero Section -->
  <header class="py-20 px-6 text-center max-w-4xl mx-auto">
    <span class="inline-block px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-widest mb-4">
      Michelin Recognized 2026
    </span>
    <h1 class="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
      Where Culinary Alchemy Meets Timeless Heritage.
    </h1>
    <p class="text-slate-300 text-base md:text-lg max-w-2xl mx-auto mb-8 font-light">
      Experience wood-fired artisanal cuisine, rare vintage cellars, and seasonal Mediterranean foraging curated by Chef Lorenzo Bellini.
    </p>
    <div class="flex items-center justify-center gap-4">
      <a href="#reserve" class="px-6 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all">
        Reserve Your Table
      </a>
      <a href="#menu" class="px-6 py-3.5 rounded-xl border border-slate-700 hover:border-slate-500 text-white font-medium text-sm transition-all">
        Explore Tasting Menu
      </a>
    </div>
  </header>

  <!-- Menu Highlights -->
  <section id="menu" class="py-16 px-6 max-w-5xl mx-auto border-t border-slate-800/80">
    <div class="text-center mb-12">
      <span class="text-xs uppercase tracking-widest text-cyan-400 font-bold">Seasonal Palette</span>
      <h2 class="text-3xl font-bold text-white mt-1 serif-font">Signature Offerings</h2>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div class="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/30 transition-all">
        <div class="flex justify-between items-baseline mb-2">
          <h3 class="text-lg font-bold text-white serif-font">Truffle Tagliolini al Tartufo</h3>
          <span class="text-cyan-400 font-mono font-bold">$38</span>
        </div>
        <p class="text-sm text-slate-400">Handcrafted egg pasta, 24-month aged Parmigiano Reggiano, shaved Umbrian black winter truffles.</p>
      </div>

      <div class="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/30 transition-all">
        <div class="flex justify-between items-baseline mb-2">
          <h3 class="text-lg font-bold text-white serif-font">Dry-Aged Wagyu Fiorentina</h3>
          <span class="text-cyan-400 font-mono font-bold">$74</span>
        </div>
        <p class="text-sm text-slate-400">Oak charcoal grilled A5 Wagyu, rosemary smoked sea salt, bone marrow reduction glaze.</p>
      </div>

      <div class="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/30 transition-all">
        <div class="flex justify-between items-baseline mb-2">
          <h3 class="text-lg font-bold text-white serif-font">Wild Sea Bass Carpaccio</h3>
          <span class="text-cyan-400 font-mono font-bold">$32</span>
        </div>
        <p class="text-sm text-slate-400">Citrus marinated Mediterranean branzino, pink peppercorns, caper berry crisps, virgin olive oil.</p>
      </div>

      <div class="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/30 transition-all">
        <div class="flex justify-between items-baseline mb-2">
          <h3 class="text-lg font-bold text-white serif-font">Smoked Pistachio Cannolo</h3>
          <span class="text-cyan-400 font-mono font-bold">$18</span>
        </div>
        <p class="text-sm text-slate-400">Sicilian sheep ricotta, Bronte pistachio praline, dark Valrhona cocoa dust.</p>
      </div>
    </div>
  </section>

  <!-- Interactive Reservation Form -->
  <section id="reserve" class="py-16 px-6 max-w-xl mx-auto">
    <div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl">
      <h2 class="text-2xl font-bold text-white text-center serif-font mb-2">Reserve an Evening</h2>
      <p class="text-xs text-slate-400 text-center mb-6">Parties of 6 or more receive custom sommelier wine pairing.</p>
      <form id="reservationForm" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">Guest Name</label>
          <input type="text" id="guestName" required placeholder="Elena Rostova" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500">
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Date</label>
            <input type="date" required class="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Guests</label>
            <select class="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500">
              <option>2 Persons</option>
              <option>4 Persons</option>
              <option>6 Persons</option>
              <option>Private Chef Dining Room (10+)</option>
            </select>
          </div>
        </div>
        <button type="submit" class="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-cyan-500/20">
          Confirm Reservation Request
        </button>
      </form>
    </div>
  </section>

  <!-- Footer -->
  <footer class="border-t border-slate-800/80 py-8 text-center text-xs text-slate-500">
    <p>© 2026 Aura Bistro & Bar • 450 Grand Avenue, San Francisco • Open Tuesday–Sunday</p>
  </footer>

  <script>
    document.getElementById('reservationForm')?.addEventListener('submit', function(e) {
      e.preventDefault();
      const name = document.getElementById('guestName')?.value || 'Guest';
      alert('🎉 Thank you ' + name + '! Your table reservation request has been confirmed. A concierge will SMS your reservation code.');
    });
  </script>
</body>
</html>`,
        css: `/* Custom animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}`,
        js: `console.log("Aura Bistro ready");`,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      revisions: [{ prompt: 'Initial Creation', timestamp: new Date().toISOString() }],
    }
  );

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Update iframe contents whenever project files change
  useEffect(() => {
    if (!iframeRef.current) return;
    const doc = iframeRef.current.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(project.files.html);
    doc.close();
  }, [project, viewMode]);

  // Generate new website from prompt
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/website/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, category }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate website');

      setProject(data.project);
      onSaveToLibrary?.(data.project);
    } catch (err: any) {
      setError(err.message || 'Generation failed. Please try a different prompt.');
    } finally {
      setLoading(false);
    }
  };

  // Modify website via natural language chat
  const handleModify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInstruction.trim()) return;
    setModifying(true);
    setError(null);

    try {
      const res = await fetch('/api/website/modify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentProject: project,
          instruction: chatInstruction,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to modify website');

      setProject(data.project);
      setChatInstruction('');
      onSaveToLibrary?.(data.project);
    } catch (err: any) {
      setError(err.message || 'Modification failed.');
    } finally {
      setModifying(false);
    }
  };

  // Export full website as ZIP bundle
  const handleExportZip = async () => {
    const zip = new JSZip();
    zip.file('index.html', project.files.html);
    zip.file('styles.css', project.files.css);
    zip.file('main.js', project.files.js);
    zip.file(
      'README.md',
      `# ${project.title}
Generated by ThinkPulse Autonomous AI Website Builder.

## Deployment:
Upload these files to Vercel, Netlify, Cloudflare Pages, or any static web hosting.
`
    );

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-website.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Copy HTML to clipboard
  const handleCopyHtml = () => {
    navigator.clipboard.writeText(project.files.html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Open in new tab fullscreen
  const handleOpenFullscreen = () => {
    const blob = new Blob([project.files.html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  // Deploy project to live Edge URL
  const handleDeploy = async () => {
    setDeploying(true);
    setError(null);
    setDeployProgress('Bundling responsive HTML, Tailwind, and JS modules...');

    try {
      await new Promise((r) => setTimeout(r, 500));
      setDeployProgress('Allocating Edge server container & domain router...');

      const token = localStorage.getItem('thinkpulse_token') || '';
      const res = await fetch('/api/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          id: project.id,
          title: project.title,
          prompt: project.prompt,
          description: project.description,
          category: project.category,
          type: 'website',
          files: project.files,
          theme: project.theme,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Deployment failed');

      setDeployProgress('Configuring Global Edge SSL & CDN routes...');
      await new Promise((r) => setTimeout(r, 400));

      setLiveUrl(data.liveUrl);
      const updatedProject: GeneratedWebsiteProject = {
        ...project,
        isDeployed: true,
        liveUrl: data.liveUrl,
        deploySlug: data.slug,
      };
      setProject(updatedProject);
      onSaveToLibrary?.(updatedProject);
      setSavedNotice(`Published live! Available at ${data.liveUrl}`);
      setTimeout(() => setSavedNotice(null), 8000);
    } catch (err: any) {
      setError(err.message || 'Deployment pipeline encountered an error. Please retry.');
    } finally {
      setDeploying(false);
    }
  };

  // Save Project to backend and library
  const handleSaveProject = async () => {
    try {
      const token = localStorage.getItem('thinkpulse_token') || '';
      const res = await fetch('/api/projects/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          id: project.id,
          title: project.title,
          prompt: project.prompt,
          description: project.description,
          category: project.category,
          type: 'website',
          files: project.files,
          theme: project.theme,
        }),
      });
      if (res.ok) {
        onSaveToLibrary?.(project);
        setSavedNotice('Project successfully saved to your dashboard!');
        setTimeout(() => setSavedNotice(null), 3500);
      }
    } catch {
      onSaveToLibrary?.(project);
      setSavedNotice('Project saved to local library.');
      setTimeout(() => setSavedNotice(null), 3500);
    }
  };

  // Delete project
  const handleDeleteProject = async () => {
    if (!window.confirm('Are you sure you want to delete this website project?')) return;
    try {
      const token = localStorage.getItem('thinkpulse_token') || '';
      await fetch(`/api/projects/${encodeURIComponent(project.id)}`, {
        method: 'DELETE',
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });
      setLiveUrl(null);
      setSavedNotice('Project deleted.');
      setTimeout(() => setSavedNotice(null), 3000);
    } catch {
      setSavedNotice('Project reset.');
      setTimeout(() => setSavedNotice(null), 3000);
    }
  };

  const sampleIdeas = [
    { label: 'French Artisan Bakery with Menu & Catering', cat: 'restaurant' },
    { label: 'Minimalist Architect Portfolio & Case Studies', cat: 'portfolio' },
    { label: 'AI Analytics SaaS Landing Page with Pricing & ROI Calculator', cat: 'saas' },
    { label: 'High-Performance Crossfit & Wellness Club with Schedule', cat: 'agency' },
  ];

  const getViewportWidth = () => {
    if (deviceViewport === 'mobile') return 'max-w-[375px]';
    if (deviceViewport === 'tablet') return 'max-w-[768px]';
    return 'w-full';
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#07090e] overflow-hidden">
      {/* Header bar */}
      <div className="px-6 py-3.5 border-b border-slate-800 bg-[#0a0d14] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white font-heading flex items-center gap-2">
              <span>{project.title}</span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300">
                {project.category}
              </span>
            </h2>
            <p className="text-xs text-slate-400 truncate max-w-md">{project.description}</p>
          </div>
        </div>

        {/* Viewport switchers & Actions */}
        <div className="flex items-center gap-2">
          {/* Preview / Code switcher */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-0.5 flex items-center">
            <button
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'preview'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
            <button
              onClick={() => setViewMode('code')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'code'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Code</span>
            </button>
          </div>

          {/* Viewport resizing */}
          {viewMode === 'preview' && (
            <div className="hidden sm:flex bg-slate-900 border border-slate-800 rounded-lg p-0.5 items-center">
              <button
                onClick={() => setDeviceViewport('desktop')}
                title="Desktop"
                className={`p-1.5 rounded-md transition-colors ${
                  deviceViewport === 'desktop' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400'
                }`}
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeviceViewport('tablet')}
                title="Tablet"
                className={`p-1.5 rounded-md transition-colors ${
                  deviceViewport === 'tablet' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400'
                }`}
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeviceViewport('mobile')}
                title="Mobile"
                className={`p-1.5 rounded-md transition-colors ${
                  deviceViewport === 'mobile' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400'
                }`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Action buttons */}
          <button
            onClick={handleSaveProject}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Save Project to Dashboard"
          >
            <Save className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Save</span>
          </button>

          <button
            onClick={handleCopyHtml}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Copy Standalone HTML"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={handleOpenFullscreen}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Open preview in new tab"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleExportZip}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
            title="Download ZIP Bundle"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ZIP</span>
          </button>

          {/* Publish / Deploy Button */}
          <button
            onClick={handleDeploy}
            disabled={deploying}
            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            title="Publish website live to global CDN"
          >
            {deploying ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Deploying...</span>
              </>
            ) : (
              <>
                <Rocket className="w-3.5 h-3.5" />
                <span>Publish / Deploy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Deployment & Live URL Banner */}
      {liveUrl && (
        <div className="bg-emerald-950/80 border-b border-emerald-500/30 px-6 py-2.5 text-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-semibold">Live Site Published:</span>
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-cyan-300 underline hover:text-cyan-200 flex items-center gap-1"
            >
              <span>{liveUrl}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(liveUrl);
                setSavedNotice('Live URL copied to clipboard!');
                setTimeout(() => setSavedNotice(null), 2500);
              }}
              className="px-2.5 py-1 rounded-md bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 text-[11px] font-semibold flex items-center gap-1 transition-colors"
            >
              <Copy className="w-3 h-3" />
              <span>Copy URL</span>
            </button>
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 rounded-md bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-bold flex items-center gap-1 transition-all"
            >
              <span>Open Live Site</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* Deploying Progress Notice */}
      {deploying && (
        <div className="bg-cyan-950/80 border-b border-cyan-500/30 px-6 py-3 flex items-center justify-center">
          <GenerationIndicator status="Deploying to Global Edge..." subtext={deployProgress} size="sm" />
        </div>
      )}

      {/* Saved Notification */}
      {savedNotice && (
        <div className="bg-cyan-950/90 border-b border-cyan-500/40 px-6 py-2 text-xs text-cyan-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{savedNotice}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-950/70 border-b border-red-500/30 px-6 py-2 text-xs text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Workspace Split */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side: AI Architect Chat & Generator Panel */}
        <div className="w-full lg:w-96 border-r border-slate-800 bg-[#090c12] flex flex-col justify-between shrink-0 overflow-y-auto">
          <div className="p-4 space-y-5">
            {/* New Website Generator Form */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Build New Website</span>
              </div>
              <form onSubmit={handleGenerate} className="space-y-3">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your site (e.g., 'Modern Japanese Sushi Bar with Omakase menu, reservation calendar, and chef bio')..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />

                <div className="flex items-center justify-between gap-2">
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
                  >
                    <option value="restaurant">Restaurant</option>
                    <option value="saas">SaaS Landing</option>
                    <option value="portfolio">Portfolio</option>
                    <option value="agency">Agency / Studio</option>
                    <option value="ecommerce">E-Commerce</option>
                    <option value="blog">Editorial / Blog</option>
                  </select>

                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    <span>{loading ? 'Synthesizing...' : 'Generate'}</span>
                  </button>
                </div>
              </form>

              {/* Sample Quick Prompts */}
              <div className="mt-3 pt-3 border-t border-slate-800/80">
                <span className="text-[10px] text-slate-500 font-semibold uppercase block mb-1.5">
                  Preset Templates:
                </span>
                <div className="space-y-1">
                  {sampleIdeas.map((idea, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setPrompt(idea.label);
                        setCategory(idea.cat as any);
                      }}
                      className="w-full text-left text-[11px] text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60 p-1.5 rounded transition-colors truncate"
                    >
                      • {idea.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Revisions History list */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-2">
                <History className="w-3.5 h-3.5 text-cyan-400" />
                <span>Project Revisions ({project.revisions?.length || 1})</span>
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {project.revisions?.map((rev, i) => (
                  <div key={i} className="text-[11px] p-2 rounded bg-slate-950/60 border border-slate-800/80 flex items-start justify-between gap-2">
                    <span className="text-slate-300 truncate">{rev.prompt}</span>
                    <span className="text-[9px] text-slate-500 shrink-0 font-mono">
                      {new Date(rev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Chat Editor (Conversational Website Modifier) */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/70">
            <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Modify with AI Editor</span>
            </label>
            <form onSubmit={handleModify} className="relative">
              <input
                type="text"
                value={chatInstruction}
                onChange={(e) => setChatInstruction(e.target.value)}
                placeholder="e.g. 'Add a customer review carousel', 'Change accent color to emerald'..."
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-3 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                disabled={modifying || !chatInstruction.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-cyan-500 text-slate-950 hover:bg-cyan-400 disabled:opacity-40 transition-all"
              >
                {modifying ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Interactive Sandbox or Code Viewer */}
        <div className="flex-1 flex flex-col bg-[#05070a] overflow-hidden p-3 sm:p-5">
          {viewMode === 'preview' ? (
            <div className="flex-1 flex items-center justify-center overflow-auto">
              <div
                className={`relative h-full transition-all duration-300 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-white ${getViewportWidth()}`}
              >
                <iframe
                  ref={iframeRef}
                  title="Website Preview"
                  sandbox="allow-scripts allow-forms allow-same-origin allow-modals"
                  className="w-full h-full border-0 bg-slate-950"
                />

                {(loading || modifying) && (
                  <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center gap-4 z-30 animate-fadeIn">
                    <div className="relative">
                      <ThinkPulseLogo size="lg" showText={false} animated />
                    </div>
                    <div className="text-center px-4">
                      <p className="text-base font-extrabold text-white font-heading">
                        {loading ? 'ThinkPulse WebArchitect Generating...' : 'Applying Design & Layout Revisions...'}
                      </p>
                      <p className="text-xs text-cyan-400 font-mono mt-1">
                        Synthesizing responsive HTML5, Tailwind classes & custom scripts
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Source Code View */
            <div className="flex-1 flex flex-col rounded-2xl border border-slate-800 bg-[#090c12] overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2.5 bg-slate-950">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCodeTab('html')}
                    className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-colors ${
                      codeTab === 'html' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
                    }`}
                  >
                    index.html
                  </button>
                  <button
                    onClick={() => setCodeTab('css')}
                    className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-colors ${
                      codeTab === 'css' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
                    }`}
                  >
                    styles.css
                  </button>
                  <button
                    onClick={() => setCodeTab('js')}
                    className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-colors ${
                      codeTab === 'js' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
                    }`}
                  >
                    main.js
                  </button>
                </div>
                <button
                  onClick={() => {
                    const text =
                      codeTab === 'html'
                        ? project.files.html
                        : codeTab === 'css'
                        ? project.files.css
                        : project.files.js;
                    navigator.clipboard.writeText(text);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-medium"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>

              <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-200">
                <pre className="whitespace-pre-wrap">
                  {codeTab === 'html'
                    ? project.files.html
                    : codeTab === 'css'
                    ? project.files.css
                    : project.files.js}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
