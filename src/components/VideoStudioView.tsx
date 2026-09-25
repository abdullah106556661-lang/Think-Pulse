import React, { useState, useEffect, useRef } from 'react';
import { GeneratedVideoItem } from '../types';
import { ThinkPulseLogo } from './ThinkPulseLogo';
import { GenerationIndicator } from './GenerationIndicator';
import {
  Video,
  Sparkles,
  Play,
  Download,
  Clock,
  Film,
  Smartphone,
  Monitor,
  RefreshCw,
  AlertCircle,
  Eye,
  CheckCircle,
  Upload,
  X,
  Trash2,
  Bookmark,
  Share2,
} from 'lucide-react';

interface VideoStudioProps {
  onSaveToLibrary?: (item: any) => void;
}

export const VideoStudioView: React.FC<VideoStudioProps> = ({ onSaveToLibrary }) => {
  const [activeTab, setActiveTab] = useState<'cinematic' | 'shorts'>('cinematic');
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [duration, setDuration] = useState<number>(5);
  const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');

  // Image-to-video reference
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [referenceImageName, setReferenceImageName] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('Initiating neural video pipeline (Veo Model)...');
  const [error, setError] = useState<string | null>(null);
  const [retryablePrompt, setRetryablePrompt] = useState<string | null>(null);

  const [videos, setVideos] = useState<GeneratedVideoItem[]>(() => {
    try {
      const saved = localStorage.getItem('thinkpulse_videos');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const pollIntervalRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const saveVideosList = (list: GeneratedVideoItem[]) => {
    setVideos(list);
    try {
      localStorage.setItem('thinkpulse_videos', JSON.stringify(list));
    } catch {}
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setError('Reference image must be less than 8MB.');
      return;
    }
    setReferenceImageName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setReferenceImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() && !referenceImage) {
      setError('Please provide a video prompt or upload a reference image.');
      return;
    }

    setLoading(true);
    setError(null);
    setRetryablePrompt(prompt);
    setStatusMessage('Initiating neural video pipeline (Veo Model)...');

    try {
      const res = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          aspectRatio,
          resolution,
          duration,
          referenceImage: referenceImage || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Video synthesis request failed');
      }

      if (data.status === 'completed' && data.videoUrl) {
        const newVid: GeneratedVideoItem = {
          id: `vid_${Date.now()}`,
          prompt: prompt || 'Image animation',
          videoUrl: data.videoUrl,
          aspectRatio,
          duration,
          createdAt: new Date().toISOString(),
        };
        const updated = [newVid, ...videos];
        saveVideosList(updated);
        onSaveToLibrary?.(newVid);
        setLoading(false);
        return;
      }

      if (data.operationName) {
        setStatusMessage('Synthesizing frames & rendering motion trajectories...');
        pollStatus(data.operationName, prompt);
      } else {
        throw new Error('No operation name returned by video model');
      }
    } catch (err: any) {
      setError(err.message || 'Video generation failed. Please try again.');
      setLoading(false);
    }
  };

  const pollStatus = (operationName: string, originalPrompt: string) => {
    let attempts = 0;
    const maxAttempts = 30;

    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    pollIntervalRef.current = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`/api/video/status/${encodeURIComponent(operationName)}`);
        const data = await res.json();

        if (data.done) {
          clearInterval(pollIntervalRef.current);
          setLoading(false);

          if (data.error) {
            setError(`Video rendering failed: ${data.error}`);
            return;
          }

          if (data.videoUrl) {
            const newVid: GeneratedVideoItem = {
              id: `vid_${Date.now()}`,
              prompt: originalPrompt || 'Image-to-video motion',
              videoUrl: data.videoUrl,
              aspectRatio: data.aspectRatio || aspectRatio,
              duration,
              createdAt: new Date().toISOString(),
            };
            const updated = [newVid, ...videos];
            saveVideosList(updated);
            onSaveToLibrary?.(newVid);
          }
        } else {
          const pass = Math.min(Math.floor(attempts / 2) + 1, 10);
          setStatusMessage(`Synthesizing motion trajectories (Pass ${pass}/10)...`);
        }

        if (attempts >= maxAttempts) {
          clearInterval(pollIntervalRef.current);
          setLoading(false);
          setError('Video generation took longer than expected. Please check back in a few minutes or retry.');
        }
      } catch (e: any) {
        clearInterval(pollIntervalRef.current);
        setLoading(false);
        setError(`Failed to verify video status: ${e.message}`);
      }
    }, 5000);
  };

  const handleDeleteVideo = (id: string) => {
    const updated = videos.filter((v) => v.id !== id);
    saveVideosList(updated);
  };

  const handleDownloadVideo = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename.slice(0, 20).replace(/[^a-z0-9]/gi, '_')}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const samplePrompts = [
    'Cinematic 8k drone shot of a futuristic neon city at dusk with holographic billboards and rainy streets',
    'Macro time-lapse of a bioluminescent blossom opening in a mystical jungle, shimmering pollen',
    'Dramatic ocean waves crashing against volcanic black cliffs under aurora borealis lighting',
    'Hyper-realistic sports car drifting on a desert highway at golden hour, dust plumes in slow motion',
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#07090e] overflow-y-auto">
      {/* Studio Header */}
      <div className="border-b border-slate-800 bg-[#0a0d14] px-6 py-6 sm:py-8">
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-3">
            <Film className="w-3.5 h-3.5" />
            <span>Autonomous Veo Neural Video Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-heading tracking-tight mb-2">
            AI Video & Motion Studio
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            Transform text prompts and reference images into cinematic high-definition videos with natural physics, camera tracking, and coherent lighting.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Generator Form */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-md">
          <form onSubmit={handleGenerate} className="space-y-5">
            {/* Prompt input */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Cinematic Video Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe camera movement, lighting, subject action, environment, and visual atmosphere..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            {/* Reference Image Upload (Image to Video) */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Reference Starting Image (Image-to-Video)</span>
                <span className="text-[11px] text-slate-500 lowercase font-normal">optional</span>
              </label>

              {referenceImage ? (
                <div className="relative inline-block border border-cyan-500/40 rounded-xl overflow-hidden p-1 bg-slate-950">
                  <img
                    src={referenceImage}
                    alt="Reference starting frame"
                    className="h-28 w-44 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setReferenceImage(null);
                      setReferenceImageName(null);
                    }}
                    className="absolute top-2 right-2 p-1 rounded-full bg-slate-900/90 text-slate-300 hover:text-white border border-slate-700"
                    title="Remove image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <div className="text-[10px] text-slate-400 mt-1 truncate max-w-[176px]">
                    {referenceImageName}
                  </div>
                </div>
              ) : (
                <label className="cursor-pointer border border-dashed border-slate-800 hover:border-cyan-500/50 rounded-xl p-4 flex items-center justify-center gap-3 bg-slate-950/60 hover:bg-slate-900/40 transition-colors">
                  <Upload className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs text-slate-300 font-medium">Upload starting frame to animate</span>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              )}
            </div>

            {/* Quick Inspiration Prompts */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="text-[11px] text-slate-500 self-center">Try:</span>
              {samplePrompts.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrompt(s)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-[11px] text-slate-300 hover:text-white border border-slate-700/60 transition-colors truncate max-w-xs"
                >
                  {s.slice(0, 45)}...
                </button>
              ))}
            </div>

            {/* Settings bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800/80">
              {/* Aspect Ratio */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Aspect Ratio
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAspectRatio('16:9')}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      aspectRatio === '16:9'
                        ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>16:9 Wide</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAspectRatio('9:16')}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      aspectRatio === '9:16'
                        ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>9:16 Reel</span>
                  </button>
                </div>
              </div>

              {/* Resolution */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Resolution
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setResolution('720p')}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold text-center transition-all ${
                      resolution === '720p'
                        ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    720p HD
                  </button>
                  <button
                    type="button"
                    onClick={() => setResolution('1080p')}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold text-center transition-all ${
                      resolution === '1080p'
                        ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    1080p FHD
                  </button>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex flex-col justify-end">
                <button
                  type="submit"
                  disabled={loading || (!prompt.trim() && !referenceImage)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Synthesizing Video...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate AI Video</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Active Generation State with Platform Logo */}
          {loading && (
            <div className="mt-6 pt-6 border-t border-slate-800 flex justify-center">
              <GenerationIndicator
                status="Synthesizing Neural Video..."
                subtext={statusMessage}
                size="md"
              />
            </div>
          )}

          {/* Error Message with Retry */}
          {error && (
            <div className="mt-6 p-4 rounded-xl bg-red-950/70 border border-red-500/30 text-red-200 text-xs flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-red-300">Video Generation Notice</div>
                  <div className="mt-0.5 leading-relaxed text-red-200/90">{error}</div>
                </div>
              </div>
              {retryablePrompt && (
                <button
                  onClick={handleGenerate}
                  className="px-3 py-1.5 rounded-lg bg-red-900/60 hover:bg-red-900 text-white font-semibold text-[11px] shrink-0 transition-colors"
                >
                  Retry
                </button>
              )}
            </div>
          )}
        </div>

        {/* Generated Videos Gallery */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Film className="w-4 h-4 text-cyan-400" />
              <span>Generated Video Clips</span>
              <span className="text-xs font-mono text-slate-400">({videos.length})</span>
            </h2>
          </div>

          {videos.length === 0 ? (
            <div className="p-12 rounded-2xl border border-slate-800 bg-slate-900/40 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto">
                <Video className="w-6 h-6" />
              </div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No videos generated yet. Enter a cinematic prompt or upload a reference image above to create your first video clip!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {videos.map((vid) => (
                <div
                  key={vid.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden shadow-xl flex flex-col justify-between group"
                >
                  {/* Video Player */}
                  <div className="relative bg-black aspect-video flex items-center justify-center overflow-hidden">
                    <video
                      src={vid.videoUrl}
                      controls
                      loop
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Metadata & Actions */}
                  <div className="p-4 space-y-3">
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed font-medium">
                      {vid.prompt}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-500">
                      <div className="flex items-center gap-2">
                        <span className="font-mono uppercase">{vid.aspectRatio}</span>
                        <span>•</span>
                        <span>{new Date(vid.createdAt).toLocaleDateString()}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDownloadVideo(vid.videoUrl, vid.prompt)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="Download MP4"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onSaveToLibrary?.(vid)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="Save to Library"
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteVideo(vid.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950/60 text-slate-400 hover:text-red-400 transition-colors"
                          title="Delete Video"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
