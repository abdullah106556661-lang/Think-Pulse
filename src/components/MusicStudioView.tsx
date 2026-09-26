import React, { useState, useRef, useEffect } from 'react';
import {
  Music,
  Play,
  Pause,
  Download,
  Sparkles,
  RefreshCw,
  Sliders,
  Volume2,
  VolumeX,
  Repeat,
  Radio,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Image as ImageIcon,
  Share2,
  FileAudio,
  Disc,
} from 'lucide-react';
import { User } from '../types';

interface MusicStudioProps {
  user: User | null;
  onSaveToLibrary?: (item: any) => void;
}

interface GeneratedTrack {
  id: string;
  title: string;
  prompt: string;
  audioUrl: string;
  duration: number;
  model: 'lyria-3-clip-preview' | 'lyria-3-pro-preview' | string;
  style: string;
  createdAt: string;
}

export const MusicStudioView: React.FC<MusicStudioProps> = ({ user, onSaveToLibrary }) => {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState<'lyria-3-clip-preview' | 'lyria-3-pro-preview'>('lyria-3-clip-preview');
  const [duration, setDuration] = useState<number>(30);
  const [selectedStyle, setSelectedStyle] = useState('Cinematic Orchestral');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Playback state
  const [activeTrack, setActiveTrack] = useState<GeneratedTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [trackDuration, setTrackDuration] = useState(0);
  const [isLooping, setIsLooping] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Generation history
  const [history, setHistory] = useState<GeneratedTrack[]>(() => {
    try {
      const saved = localStorage.getItem('thinkpulse_music_history');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'track_seed_1',
        title: 'Neon Odyssey Synthwave',
        prompt: 'Futuristic 80s synthwave with analog bass, punchy drums, and shimmering arpeggiated lead synths.',
        audioUrl: '',
        duration: 30,
        model: 'lyria-3-clip-preview',
        style: 'Cyberpunk Synthwave',
        createdAt: new Date().toISOString(),
      },
    ];
  });

  const styles = [
    { name: 'Cinematic Orchestral', icon: '🎻', desc: 'Epic orchestral strings, brass swells, and cinematic timpani' },
    { name: 'Lo-Fi Chill Beats', icon: '☕', desc: 'Relaxing dusty hip-hop drums, mellow vinyl crackle, and rhodes piano' },
    { name: 'Cyberpunk Synthwave', icon: '⚡', desc: 'Retro 80s analog bass, arpeggiated synths, and neon drive' },
    { name: 'Acoustic Folk & Guitar', icon: '🎸', desc: 'Warm acoustic fingerpicking, soft shaker, and organic harmonies' },
    { name: 'Ambient Meditation', icon: '🌌', desc: 'Atmospheric ethereal pads, soothing resonant tones, and calm drift' },
    { name: 'Deep Tech House', icon: '🎧', desc: 'Punchy 4/4 kicks, rolling sub-bass grooves, and melodic tech vocal chops' },
  ];

  const presets = [
    'Energetic futuristic cinematic trailer with building percussion and brass',
    'Relaxing peaceful piano melody with ambient rain and distant thunderstorm',
    'Upbeat lo-fi study music with jazz chords and soft vinyl warmth',
    'Dark cyberpunk chase theme with distorted basslines and driving drums',
    'Uplifting corporate background acoustic guitar with bright piano harmony',
  ];

  useEffect(() => {
    try {
      localStorage.setItem('thinkpulse_music_history', JSON.stringify(history));
    } catch {}
  }, [history]);

  // Audio element listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setTrackDuration(audio.duration || duration);
    const onEnded = () => {
      if (!isLooping) setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, [activeTrack, isLooping, duration]);

  const togglePlay = () => {
    if (!audioRef.current || !activeTrack?.audioUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
    if (val === 0) setIsMuted(true);
    else setIsMuted(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setReferenceImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateMusic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() && !referenceImage) return;

    setGenerating(true);
    setErrorMsg(null);
    setStatusMessage(
      model === 'lyria-3-pro-preview'
        ? 'Lyria 3 Pro: Synthesizing multi-layer full-length track with harmonic structure...'
        : 'Lyria 3 Clip: Generating high-fidelity musical audio clip...'
    );

    try {
      const token = localStorage.getItem('thinkpulse_token') || localStorage.getItem('thinkpulse_auth_token') || '';
      const res = await fetch('/api/generate-music', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          prompt: prompt.trim() || 'Melodic inspirational harmony',
          duration,
          mode: model === 'lyria-3-pro-preview' ? 'pro' : 'clip',
          style: selectedStyle,
          referenceImage,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Music generation failed.');
      }

      const newTrack: GeneratedTrack = {
        id: `track_${Date.now()}`,
        title: data.title || `${prompt.slice(0, 32)} (AI)`,
        prompt: prompt.trim() || 'Image-inspired music composition',
        audioUrl: data.audioUrl,
        duration: data.duration || duration,
        model: model,
        style: selectedStyle,
        createdAt: new Date().toISOString(),
      };

      setHistory((prev) => [newTrack, ...prev]);
      setActiveTrack(newTrack);
      setIsPlaying(false);

      if (audioRef.current) {
        audioRef.current.src = data.audioUrl;
        audioRef.current.load();
      }

      onSaveToLibrary?.({
        type: 'audio',
        id: newTrack.id,
        title: newTrack.title,
        data: newTrack,
        createdAt: new Date().toISOString(),
      });

      setStatusMessage('Music track ready for playback & export!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Music generation encountered a momentary error.');
    } finally {
      setGenerating(false);
    }
  };

  const selectHistoryTrack = (track: GeneratedTrack) => {
    setActiveTrack(track);
    setIsPlaying(false);
    if (audioRef.current && track.audioUrl) {
      audioRef.current.src = track.audioUrl;
      audioRef.current.load();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#07090e] overflow-hidden text-slate-100">
      {/* Audio Element */}
      <audio
        ref={audioRef}
        loop={isLooping}
        muted={isMuted}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-800 bg-[#0a0d14] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/20">
            <Music className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white font-heading">
                Lyria AI Music & Audio Studio
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                LYRIA-3 ENGINE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Generate original studio-quality musical compositions, soundtracks, and stems from text or images.
            </p>
          </div>
        </div>

        {/* Model Switcher */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-1 flex items-center gap-1 text-xs">
          <button
            onClick={() => {
              setModel('lyria-3-clip-preview');
              if (duration > 30) setDuration(30);
            }}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
              model === 'lyria-3-clip-preview'
                ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Disc className="w-3.5 h-3.5" />
            <span>Lyria 3 Clip (Up to 30s)</span>
          </button>
          <button
            onClick={() => {
              setModel('lyria-3-pro-preview');
              setDuration(60);
            }}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
              model === 'lyria-3-pro-preview'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Lyria 3 Pro (Full Track)</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Control Panel */}
        <div className="w-full lg:w-96 border-b lg:border-b-0 lg:border-r border-slate-800 p-6 overflow-y-auto space-y-6 shrink-0 bg-[#090c13]">
          <form onSubmit={handleGenerateMusic} className="space-y-5">
            {/* Prompt Area */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5 flex items-center justify-between">
                <span>Music Concept & Description</span>
                <span className="text-[10px] text-pink-400 font-normal">Instruments, Mood & BPM</span>
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                placeholder="E.g., Cinematic cyberpunk orchestral track with heavy 808 sub-bass, neon synth arpeggios, and aggressive percussion build-up..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 resize-none shadow-inner"
              />
            </div>

            {/* Quick Inspiration Presets */}
            <div>
              <span className="block text-[11px] text-slate-400 font-semibold mb-2">Quick Inspiration</span>
              <div className="flex flex-wrap gap-1.5">
                {presets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPrompt(preset)}
                    className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-pink-500/50 text-slate-300 hover:text-white transition-colors text-left"
                  >
                    {preset.slice(0, 32)}...
                  </button>
                ))}
              </div>
            </div>

            {/* Musical Style Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-2">Genre & Mood Preset</label>
              <div className="grid grid-cols-2 gap-2">
                {styles.map((st) => (
                  <button
                    key={st.name}
                    type="button"
                    onClick={() => setSelectedStyle(st.name)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      selectedStyle === st.name
                        ? 'bg-pink-500/15 border-pink-500 text-pink-200 shadow-md shadow-pink-500/10'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-base block mb-0.5">{st.icon}</span>
                    <span className="text-xs font-bold block text-white">{st.name}</span>
                    <span className="text-[9px] text-slate-400 line-clamp-1">{st.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Track Duration Slider */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-300">Track Duration</span>
                <span className="font-mono text-pink-400 font-bold">{duration} Seconds</span>
              </div>
              <input
                type="range"
                min="10"
                max={model === 'lyria-3-pro-preview' ? 120 : 30}
                step="5"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full accent-pink-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span>10s</span>
                <span>{model === 'lyria-3-pro-preview' ? '120s (Pro Full)' : '30s (Max Clip)'}</span>
              </div>
            </div>

            {/* Optional Image Upload for Image-to-Music */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                  <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                  <span>Image Inspiration (Optional)</span>
                </div>
                {referenceImage && (
                  <button
                    type="button"
                    onClick={() => setReferenceImage(null)}
                    className="text-[10px] text-red-400 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>

              {referenceImage ? (
                <div className="relative rounded-lg overflow-hidden border border-slate-800 max-h-28">
                  <img src={referenceImage} alt="Ref" className="w-full h-full object-cover" />
                </div>
              ) : (
                <label className="border border-dashed border-slate-800 hover:border-pink-500/50 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-colors text-center">
                  <Upload className="w-4 h-4 text-slate-500 mb-1" />
                  <span className="text-[11px] text-slate-400">Upload artwork or photo</span>
                  <span className="text-[9px] text-slate-600">AI harmonizes music to image emotion</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              )}
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={generating || (!prompt.trim() && !referenceImage)}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {generating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Synthesizing Track with Lyria...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate AI Music Track</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Main Stage & Player */}
        <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-6">
          {/* Active Audio Player Deck */}
          <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-[#10141f] to-slate-950 p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-pink-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-4">
                {/* Vinyl Record Icon */}
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-pink-500/20 shrink-0 ${
                    isPlaying ? 'animate-spin' : ''
                  }`}
                  style={{ animationDuration: '4s' }}
                >
                  <Disc className="w-8 h-8" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white font-heading">
                      {activeTrack ? activeTrack.title : 'Ready to Generate'}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                      {activeTrack?.model || model}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 max-w-lg line-clamp-2">
                    {activeTrack ? activeTrack.prompt : 'Enter a prompt on the left to synthesize original music.'}
                  </p>
                </div>
              </div>

              {/* Playback Controls & Waveform */}
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  disabled={!activeTrack?.audioUrl}
                  className="w-12 h-12 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white flex items-center justify-center shadow-lg shadow-pink-500/25 transition-transform active:scale-95 disabled:opacity-40"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>

                {activeTrack?.audioUrl && (
                  <a
                    href={activeTrack.audioUrl}
                    download={`${activeTrack.title.replace(/\s+/g, '_')}.wav`}
                    className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                    title="Download Audio Track (WAV)"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Animated Waveform Visualizer */}
            <div className="mt-6 pt-6 border-t border-slate-800/80 space-y-3">
              <div className="h-14 flex items-center justify-between gap-1 px-2 bg-slate-950/60 rounded-xl border border-slate-800/80">
                {Array.from({ length: 48 }).map((_, i) => {
                  const progressRatio = currentTime / (trackDuration || 1);
                  const isPast = i / 48 <= progressRatio;
                  const randomHeight = isPlaying
                    ? Math.sin(i * 0.4 + currentTime * 5) * 40 + 50
                    : Math.sin(i * 0.5) * 20 + 35;

                  return (
                    <div
                      key={i}
                      className="flex-1 rounded-full transition-all duration-75"
                      style={{
                        height: `${Math.max(12, randomHeight)}%`,
                        backgroundColor: isPast ? '#ec4899' : '#334155',
                      }}
                    />
                  );
                })}
              </div>

              {/* Progress Slider */}
              <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                <span>{Math.floor(currentTime)}s</span>
                <input
                  type="range"
                  min="0"
                  max={trackDuration || duration}
                  step="0.1"
                  value={currentTime}
                  onChange={handleSeek}
                  className="flex-1 accent-pink-500 cursor-pointer"
                />
                <span>{Math.floor(trackDuration || duration)}s</span>
              </div>

              {/* Extra playback toggles */}
              <div className="flex items-center justify-between text-xs pt-1 text-slate-400">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsLooping(!isLooping)}
                    className={`flex items-center gap-1.5 transition-colors ${
                      isLooping ? 'text-pink-400 font-semibold' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <Repeat className="w-3.5 h-3.5" />
                    <span>Loop Track</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button onClick={() => setIsMuted(!isMuted)}>
                      {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-slate-400" />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-20 accent-pink-500 cursor-pointer h-1"
                    />
                  </div>
                </div>

                <span className="text-[11px] text-slate-500">
                  {statusMessage || 'High Definition Audio Synthesizer'}
                </span>
              </div>
            </div>
          </div>

          {/* History / Previous Tracks */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileAudio className="w-4 h-4 text-pink-400" />
                <h4 className="text-sm font-bold text-white font-heading">
                  Track Generation History ({history.length})
                </h4>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">Lyria Cache</span>
            </div>

            <div className="divide-y divide-slate-800/80">
              {history.map((track) => (
                <div
                  key={track.id}
                  onClick={() => selectHistoryTrack(track)}
                  className={`py-3 px-3 rounded-xl flex items-center justify-between gap-4 transition-all cursor-pointer ${
                    activeTrack?.id === track.id ? 'bg-pink-950/30 border border-pink-500/30' : 'hover:bg-slate-950/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-pink-400 shrink-0">
                      <Music className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white">{track.title}</h5>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{track.prompt}</p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono mt-0.5">
                        <span className="text-pink-300 font-semibold">{track.style}</span>
                        <span>•</span>
                        <span>{track.duration}s</span>
                        <span>•</span>
                        <span>{track.model}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {track.audioUrl && (
                      <a
                        href={track.audioUrl}
                        download={`${track.title}.wav`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white"
                        title="Download WAV"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 text-xs font-semibold"
                    >
                      {activeTrack?.id === track.id && isPlaying ? 'Playing' : 'Load'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
