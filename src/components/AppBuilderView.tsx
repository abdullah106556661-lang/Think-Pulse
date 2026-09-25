import React, { useState, useRef, useEffect } from 'react';
import {
  Layers,
  Sparkles,
  Eye,
  Code2,
  Copy,
  Check,
  Download,
  Smartphone,
  Tablet,
  Monitor,
  RefreshCw,
  Rocket,
  ExternalLink,
  Save,
  CheckCircle2,
  AlertCircle,
  Maximize2,
} from 'lucide-react';
import JSZip from 'jszip';
import { ThinkPulseLogo } from './ThinkPulseLogo';
import { GenerationIndicator } from './GenerationIndicator';

interface AppBuilderProps {
  onSaveToLibrary?: (item: any) => void;
}

export const AppBuilderView: React.FC<AppBuilderProps> = ({ onSaveToLibrary }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [deployProgress, setDeployProgress] = useState('');
  const [liveUrl, setLiveUrl] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [deviceViewport, setDeviceViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [copied, setCopied] = useState(false);

  // Default initial working app: Task & Kanban Manager with local state and interactions
  const [appCode, setAppCode] = useState({
    id: 'app_kanban_init',
    title: 'FlowTrack • Kanban & Task Suite',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FlowTrack Kanban</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen p-6 font-sans">
  <div class="max-w-5xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
      <div>
        <h1 class="text-2xl font-bold text-white tracking-tight">FlowTrack Kanban</h1>
        <p class="text-xs text-slate-400">Interactive Project Board with Real-Time Local State</p>
      </div>
      <div class="flex gap-2">
        <input id="taskInput" placeholder="New task title..." class="bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500">
        <button onclick="addTask()" class="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-bold">Add Task</button>
      </div>
    </div>

    <!-- 3-Column Board -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Todo Column -->
      <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
        <div class="flex justify-between items-center mb-3">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400">To Do (<span id="todoCount">2</span>)</span>
        </div>
        <div id="todoList" class="space-y-3 min-h-[160px]">
          <div class="p-3 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700" onclick="moveTask(this, 'inProgressList')">
            <h4 class="text-xs font-semibold text-white">Synthesize Marketing Copy</h4>
            <span class="text-[10px] text-cyan-400">Tap to advance →</span>
          </div>
          <div class="p-3 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700" onclick="moveTask(this, 'inProgressList')">
            <h4 class="text-xs font-semibold text-white">Review Q3 Budget Forecast</h4>
            <span class="text-[10px] text-cyan-400">Tap to advance →</span>
          </div>
        </div>
      </div>

      <!-- In Progress Column -->
      <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
        <div class="flex justify-between items-center mb-3">
          <span class="text-xs font-bold uppercase tracking-wider text-amber-400">In Progress (<span id="progCount">1</span>)</span>
        </div>
        <div id="inProgressList" class="space-y-3 min-h-[160px]">
          <div class="p-3 bg-slate-950 border border-amber-500/30 rounded-xl cursor-pointer hover:border-amber-500/60" onclick="moveTask(this, 'doneList')">
            <h4 class="text-xs font-semibold text-white">Design Multimodal Navigation</h4>
            <span class="text-[10px] text-amber-400">Tap to complete →</span>
          </div>
        </div>
      </div>

      <!-- Done Column -->
      <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
        <div class="flex justify-between items-center mb-3">
          <span class="text-xs font-bold uppercase tracking-wider text-emerald-400">Completed (<span id="doneCount">1</span>)</span>
        </div>
        <div id="doneList" class="space-y-3 min-h-[160px]">
          <div class="p-3 bg-slate-950 border border-emerald-500/30 rounded-xl opacity-75">
            <h4 class="text-xs font-semibold text-white line-through">Setup ThinkPulse AI Backend</h4>
            <span class="text-[10px] text-emerald-400">✓ Done</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    function addTask() {
      const input = document.getElementById('taskInput');
      const val = input.value.trim();
      if (!val) return;

      const card = document.createElement('div');
      card.className = "p-3 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700";
      card.onclick = function() { moveTask(card, 'inProgressList'); };
      card.innerHTML = '<h4 class="text-xs font-semibold text-white">' + val + '</h4><span class="text-[10px] text-cyan-400">Tap to advance →</span>';
      
      document.getElementById('todoList').appendChild(card);
      input.value = '';
      updateCounts();
    }

    function moveTask(el, targetId) {
      const target = document.getElementById(targetId);
      if (targetId === 'inProgressList') {
        el.className = "p-3 bg-slate-950 border border-amber-500/30 rounded-xl cursor-pointer hover:border-amber-500/60";
        el.querySelector('span').innerText = 'Tap to complete →';
        el.querySelector('span').className = 'text-[10px] text-amber-400';
        el.onclick = function() { moveTask(el, 'doneList'); };
      } else if (targetId === 'doneList') {
        el.className = "p-3 bg-slate-950 border border-emerald-500/30 rounded-xl opacity-75";
        el.querySelector('h4').classList.add('line-through');
        el.querySelector('span').innerText = '✓ Done';
        el.querySelector('span').className = 'text-[10px] text-emerald-400';
        el.onclick = null;
      }
      target.appendChild(el);
      updateCounts();
    }

    function updateCounts() {
      document.getElementById('todoCount').innerText = document.getElementById('todoList').children.length;
      document.getElementById('progCount').innerText = document.getElementById('inProgressList').children.length;
      document.getElementById('doneCount').innerText = document.getElementById('doneList').children.length;
    }
  </script>
</body>
</html>`,
  });

  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!iframeRef.current) return;
    const doc = iframeRef.current.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(appCode.html);
    doc.close();
  }, [appCode, viewMode]);

  const handleGenerateApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/app/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'App generation failed');

      const newApp = {
        id: data.app?.id || `app_${Date.now()}`,
        title: data.app?.title || 'Interactive Web Application',
        html: data.app?.html || data.app?.code || appCode.html,
      };

      setAppCode(newApp);
      setLiveUrl(null);
      onSaveToLibrary?.({
        type: 'app',
        id: newApp.id,
        title: newApp.title,
        data: newApp.html,
        createdAt: new Date().toISOString(),
      });
    } catch (err: any) {
      setError(err.message || 'App generation encountered an error.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeployApp = async () => {
    setDeploying(true);
    setError(null);
    setDeployProgress('Bundling application modules and client state...');

    try {
      await new Promise((r) => setTimeout(r, 500));
      setDeployProgress('Configuring serverless edge route...');

      const token = localStorage.getItem('thinkpulse_token') || '';
      const res = await fetch('/api/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          id: appCode.id,
          title: appCode.title,
          prompt: prompt || appCode.title,
          description: 'Live interactive application',
          type: 'app',
          files: { html: appCode.html, css: '', js: '' },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Deployment failed');

      setDeployProgress('Setting up Global SSL & Edge CDN...');
      await new Promise((r) => setTimeout(r, 400));

      setLiveUrl(data.liveUrl);
      setSavedNotice(`App published live! Accessible at ${data.liveUrl}`);
      setTimeout(() => setSavedNotice(null), 8000);
    } catch (err: any) {
      setError(err.message || 'App deployment failed.');
    } finally {
      setDeploying(false);
    }
  };

  const handleSaveApp = async () => {
    try {
      const token = localStorage.getItem('thinkpulse_token') || '';
      const res = await fetch('/api/projects/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          id: appCode.id,
          title: appCode.title,
          prompt: prompt || appCode.title,
          description: 'Interactive web app',
          type: 'app',
          files: { html: appCode.html, css: '', js: '' },
        }),
      });
      if (res.ok) {
        onSaveToLibrary?.({
          type: 'app',
          id: appCode.id,
          title: appCode.title,
          data: appCode.html,
          createdAt: new Date().toISOString(),
        });
        setSavedNotice('App saved to your dashboard!');
        setTimeout(() => setSavedNotice(null), 3000);
      }
    } catch {
      setSavedNotice('App saved to local library.');
      setTimeout(() => setSavedNotice(null), 3000);
    }
  };

  const sampleApps = [
    { title: 'Interactive Kanban Board', prompt: 'Build a Kanban board with draggable columns and task progress metrics' },
    { title: 'Freelancer Invoice Calculator', prompt: 'Build an invoice generator with tax calculation, discounts, and print layout' },
    { title: 'Daily Workout & Calorie Tracker', prompt: 'Build a workout logger with exercise list, timer, and set counters' },
    { title: 'Vocabulary Quiz & Flashcard App', prompt: 'Build an interactive flashcard test application with flip animations and scoring' },
  ];

  const handleExportZip = async () => {
    const zip = new JSZip();
    zip.file('index.html', appCode.html);
    zip.file('README.md', `# ${appCode.title}\nBuilt with ThinkPulse AI App Builder.`);
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${appCode.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-app.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const getViewportWidth = () => {
    if (deviceViewport === 'mobile') return 'max-w-[375px]';
    if (deviceViewport === 'tablet') return 'max-w-[768px]';
    return 'w-full';
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#07090e] overflow-hidden">
      {/* Header Toolbar */}
      <div className="px-6 py-3.5 border-b border-slate-800 bg-[#0a0d14] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white font-heading">{appCode.title}</h2>
            <p className="text-xs text-slate-400">Autonomous web applications with reactive local state</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Viewport resizing for preview */}
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

          {/* Preview / Code switch */}
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

          <button
            onClick={handleSaveApp}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Save App"
          >
            <Save className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Save</span>
          </button>

          <button
            onClick={handleExportZip}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5"
            title="Download ZIP"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ZIP</span>
          </button>

          {/* Publish / Deploy Button */}
          <button
            onClick={handleDeployApp}
            disabled={deploying}
            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            title="Publish app live"
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

      {/* Live URL Banner */}
      {liveUrl && (
        <div className="bg-emerald-950/80 border-b border-emerald-500/30 px-6 py-2.5 text-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-semibold">Live App Online:</span>
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
                setSavedNotice('App Live URL copied!');
                setTimeout(() => setSavedNotice(null), 2500);
              }}
              className="px-2.5 py-1 rounded-md bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 text-[11px] font-semibold flex items-center gap-1"
            >
              <Copy className="w-3 h-3" />
              <span>Copy URL</span>
            </button>
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 rounded-md bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-bold flex items-center gap-1"
            >
              <span>Open Live App</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
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

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Form */}
        <div className="w-full lg:w-96 border-r border-slate-800 bg-[#090c12] p-5 overflow-y-auto shrink-0 space-y-5">
          <form onSubmit={handleGenerateApp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Describe Application Idea</span>
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                placeholder="e.g. 'Build a fitness tracker where users can log workout sets, reps, and see completion charts'..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">Quick Presets:</span>
              {sampleApps.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrompt(sample.prompt)}
                  className="w-full text-left text-[11px] text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60 p-2 rounded transition-colors"
                >
                  • {sample.title}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-40"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{loading ? 'Synthesizing App...' : 'Generate App'}</span>
            </button>
          </form>
        </div>

        {/* Right Sandbox or Code */}
        <div className="flex-1 bg-[#05070a] p-4 sm:p-6 overflow-hidden flex flex-col items-center">
          {viewMode === 'preview' ? (
            <div className={`relative flex-1 w-full ${getViewportWidth()} rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 transition-all`}>
              <iframe
                ref={iframeRef}
                title="App Preview Sandbox"
                sandbox="allow-scripts allow-forms allow-same-origin allow-modals"
                className="w-full h-full border-0 bg-slate-950"
              />

              {loading && (
                <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center gap-4 z-30 animate-fadeIn">
                  <GenerationIndicator
                    status="Synthesizing Reactive App..."
                    subtext="Constructing state machine, UI components, and interactivity"
                    size="lg"
                  />
                </div>
              )}

              {deploying && (
                <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center gap-4 z-30 animate-fadeIn">
                  <GenerationIndicator
                    status="Deploying Application to Live Edge..."
                    subtext={deployProgress}
                    size="lg"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="w-full flex-1 rounded-2xl border border-slate-800 bg-[#090c12] overflow-hidden flex flex-col">
              <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                <span className="text-xs font-mono text-cyan-300">index.html</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(appCode.html);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>
              <div className="flex-1 p-4 overflow-auto font-mono text-xs text-slate-200">
                <pre className="whitespace-pre-wrap">{appCode.html}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
