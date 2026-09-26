import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Upload,
  FileAudio,
  Copy,
  Check,
  Download,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  Play,
  Pause,
  Clock,
  FileText,
  Volume2,
  Trash2,
} from 'lucide-react';
import { User } from '../types';

interface AudioTranscribeProps {
  user: User | null;
  onSaveToLibrary?: (item: any) => void;
}

interface TranscriptRecord {
  id: string;
  title: string;
  text: string;
  source: 'microphone' | 'upload';
  audioUrl?: string;
  durationSeconds?: number;
  createdAt: string;
}

export const AudioTranscribeView: React.FC<AudioTranscribeProps> = ({ user, onSaveToLibrary }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [transcribing, setTranscribing] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);

  // Audio preview playback
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  // Transcription History
  const [history, setHistory] = useState<TranscriptRecord[]>(() => {
    try {
      const saved = localStorage.getItem('thinkpulse_transcript_history');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'seed_tr_1',
        title: 'Project Architecture Planning',
        text: 'The ThinkPulse autonomous intelligence pipeline utilizes Gemini 3.8 Flash for reasoning, Veo 3 for video synthesis, and Lyria for musical generation.',
        source: 'microphone',
        durationSeconds: 12,
        createdAt: new Date().toISOString(),
      },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('thinkpulse_transcript_history', JSON.stringify(history));
    } catch {}
  }, [history]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const startRecording = async () => {
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const fullBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(fullBlob);
        const url = URL.createObjectURL(fullBlob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);
      setUploadedFileName(null);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      setErrorMsg('Microphone access was denied or is not supported in this browser.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setUploadedFileName(file.name);
    setAudioBlob(file);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const res = reader.result as string;
        resolve(res);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleTranscribeAudio = async () => {
    if (!audioBlob) return;

    setTranscribing(true);
    setErrorMsg(null);

    try {
      const base64Data = await blobToBase64(audioBlob);
      const mimeType = audioBlob.type || 'audio/webm';

      const token = localStorage.getItem('thinkpulse_token') || localStorage.getItem('thinkpulse_auth_token') || '';
      const res = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          audioData: base64Data,
          mimeType,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Audio transcription failed');
      }

      const text = data.transcription || 'No audible speech detected in the audio recording.';
      setCurrentTranscript(text);

      const record: TranscriptRecord = {
        id: `tr_${Date.now()}`,
        title: uploadedFileName || `Recording ${new Date().toLocaleTimeString()}`,
        text,
        source: uploadedFileName ? 'upload' : 'microphone',
        audioUrl: audioUrl || undefined,
        durationSeconds: recordingSeconds > 0 ? recordingSeconds : undefined,
        createdAt: new Date().toISOString(),
      };

      setHistory((prev) => [record, ...prev]);

      onSaveToLibrary?.({
        type: 'transcript',
        id: record.id,
        title: record.title,
        data: record,
        createdAt: new Date().toISOString(),
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to transcribe audio. Please ensure clear speech and retry.');
    } finally {
      setTranscribing(false);
    }
  };

  const handleCopy = () => {
    if (!currentTranscript) return;
    navigator.clipboard.writeText(currentTranscript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!currentTranscript) return;
    const blob = new Blob([currentTranscript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ThinkPulse_Transcription_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const wordCount = currentTranscript ? currentTranscript.trim().split(/\s+/).length : 0;
  const charCount = currentTranscript ? currentTranscript.length : 0;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#07090e] overflow-hidden text-slate-100">
      {/* Hidden audio preview element */}
      {audioUrl && (
        <audio
          ref={previewAudioRef}
          src={audioUrl}
          onPlay={() => setIsPlayingPreview(true)}
          onPause={() => setIsPlayingPreview(false)}
          onEnded={() => setIsPlayingPreview(false)}
        />
      )}

      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-800 bg-[#0a0d14] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Mic className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white font-heading">
                Gemini Audio Transcription Studio
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                GEMINI-3.5-TRANSCRIBE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Convert live microphone recordings and uploaded voice notes into accurate, formatted text transcripts.
            </p>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300 font-mono">Multilingual Speech Tokenizer Online</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Input & Record Panel */}
        <div className="w-full lg:w-96 border-b lg:border-b-0 lg:border-r border-slate-800 p-6 overflow-y-auto space-y-6 shrink-0 bg-[#090c13]">
          {/* Microphone Recording Deck */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Mic className="w-4 h-4 text-emerald-400" />
                <span>Live Microphone Input</span>
              </span>
              {isRecording && (
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-500/40 text-[10px] font-mono animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  REC {recordingSeconds}s
                </span>
              )}
            </div>

            {/* Big Mic Button */}
            <div className="flex flex-col items-center justify-center py-4">
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl active:scale-95 ${
                  isRecording
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/30 animate-pulse'
                    : 'bg-gradient-to-tr from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-500/25'
                }`}
              >
                {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </button>
              <span className="text-xs text-slate-400 mt-3 font-semibold">
                {isRecording ? 'Click to Stop Recording' : 'Click to Start Recording'}
              </span>
            </div>

            {/* Audio waveform simulator */}
            {isRecording && (
              <div className="flex items-center justify-center gap-1 h-8 px-4 bg-slate-900 rounded-xl border border-slate-800">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-emerald-400 rounded-full animate-bounce"
                    style={{
                      height: `${Math.floor(20 + Math.random() * 80)}%`,
                      animationDelay: `${i * 0.05}s`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-4 text-[10px] text-slate-500 uppercase font-mono">Or Upload Audio File</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          {/* File Upload Box */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3">
            <label className="border border-dashed border-slate-800 hover:border-emerald-500/50 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors text-center">
              <Upload className="w-5 h-5 text-emerald-400 mb-1.5" />
              <span className="text-xs font-semibold text-slate-300">
                {uploadedFileName || 'Drop audio or click to browse'}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5">MP3, WAV, M4A, WEBM, OGG, FLAC</span>
              <input
                type="file"
                accept="audio/*,.mp3,.wav,.m4a,.webm,.ogg,.flac"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Audio Preview Deck */}
          {audioUrl && (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 truncate">
                <FileAudio className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs text-slate-300 truncate">
                  {uploadedFileName || `Mic Recording (${recordingSeconds}s)`}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!previewAudioRef.current) return;
                  if (isPlayingPreview) {
                    previewAudioRef.current.pause();
                  } else {
                    previewAudioRef.current.play();
                  }
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1 shrink-0"
              >
                {isPlayingPreview ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span>{isPlayingPreview ? 'Pause' : 'Play'}</span>
              </button>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Transcription Button */}
          <button
            type="button"
            onClick={handleTranscribeAudio}
            disabled={!audioBlob || transcribing || isRecording}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {transcribing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Transcribing Audio with Gemini 3.5...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Transcribe Speech to Text</span>
              </>
            )}
          </button>
        </div>

        {/* Right Output Panel */}
        <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-6">
          {/* Main Transcript Display Box */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white font-heading">Transcript Output</h3>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={handleCopy}
                  disabled={!currentTranscript}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition-colors disabled:opacity-40"
                  title="Copy to clipboard"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>

                <button
                  onClick={handleDownloadTxt}
                  disabled={!currentTranscript}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition-colors disabled:opacity-40"
                  title="Download .txt"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .TXT</span>
                </button>
              </div>
            </div>

            {/* Text Viewport */}
            <div className="min-h-[220px] max-h-[420px] overflow-y-auto p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
              {currentTranscript ? (
                currentTranscript
              ) : (
                <div className="h-44 flex flex-col items-center justify-center text-slate-500 text-xs space-y-2">
                  <Mic className="w-6 h-6 text-slate-600" />
                  <span>Record audio from your mic or upload an audio file to see transcript here.</span>
                </div>
              )}
            </div>

            {/* Metrics Footer */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 font-mono">
              <div className="flex items-center gap-4">
                <span>Words: <strong className="text-emerald-300">{wordCount}</strong></span>
                <span>•</span>
                <span>Characters: <strong className="text-slate-300">{charCount}</strong></span>
              </div>
              <span className="text-[11px] text-slate-500">Engine: gemini-3.5-transcribe</span>
            </div>
          </div>

          {/* Transcript History */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-bold text-white font-heading">
                  Transcription History ({history.length})
                </h4>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">Auto-saved</span>
            </div>

            <div className="divide-y divide-slate-800/80">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setCurrentTranscript(item.text)}
                  className="py-3 px-3 rounded-xl flex items-center justify-between gap-4 hover:bg-slate-950/60 transition-colors cursor-pointer"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{item.title}</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-slate-800 text-slate-400 uppercase">
                        {item.source}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1">{item.text}</p>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentTranscript(item.text);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold shrink-0"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
