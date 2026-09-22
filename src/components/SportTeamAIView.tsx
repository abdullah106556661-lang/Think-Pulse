import React, { useState } from 'react';
import {
  Trophy,
  Shield,
  Zap,
  Users,
  Target,
  Activity,
  Flame,
  ChevronRight,
  Send,
  RefreshCw,
  Copy,
  Check,
  Download,
  Share2,
  Sparkles,
  Award,
  Swords,
  Timer,
} from 'lucide-react';
import { SupportedLanguage } from '../types';
import { ThinkPulseLogo } from './ThinkPulseLogo';

interface SportTeamAIViewProps {
  currentLanguage: SupportedLanguage;
  onOpenLiveVoice?: () => void;
}

interface TacticalPreset {
  id: string;
  name: string;
  sport: string;
  opponent: string;
  format: string;
  objective: string;
  tag: string;
}

export const SportTeamAIView: React.FC<SportTeamAIViewProps> = ({
  currentLanguage,
  onOpenLiveVoice,
}) => {
  const [sport, setSport] = useState('Cricket');
  const [teamName, setTeamName] = useState('Pakistan Cricket Team');
  const [opponent, setOpponent] = useState('Australia');
  const [matchFormat, setMatchFormat] = useState('T20 International');
  const [objective, setObjective] = useState(
    'Formulate the optimal Playing XI, death-overs bowling tactics, and top-order powerplay batting strategy to counter high pace & bounce.'
  );
  const [formation, setFormation] = useState('5-Batsmen / 2-Allrounders / 4-Bowlers');
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [drillDownQuery, setDrillDownQuery] = useState('');
  const [drillDownHistory, setDrillDownHistory] = useState<Array<{ q: string; a: string }>>([]);
  const [drillDownLoading, setDrillDownLoading] = useState(false);

  const presets: TacticalPreset[] = [
    {
      id: 'pak-cricket',
      name: '🇵🇰 Pakistan Cricket XI (T20)',
      sport: 'Cricket',
      opponent: 'India / Australia',
      format: 'T20 International',
      objective: 'Best playing XI, powerplay batting strike rate optimization, and death-overs yorker execution against aggressive hitters.',
      tag: 'Cricket High-Stakes',
    },
    {
      id: 'football-pressing',
      name: '⚽ 4-3-3 Gegenpressing Tactics',
      sport: 'Football',
      opponent: 'Counter-attacking 5-3-2',
      format: '90-Min Knockout Match',
      objective: 'High-block aggressive pressing in the final third, rapid transition triggers, and inverted wingback rotations.',
      tag: 'Football Tactical',
    },
    {
      id: 'psl-franchise',
      name: '🏆 PSL Championship Strategy',
      sport: 'Cricket',
      opponent: 'Lahore Qalandars / Islamabad United',
      format: 'PSL T20 Match',
      objective: 'Spin choke in middle overs (overs 7-15) and targeted matchup strategies against left-arm pace bowlers.',
      tag: 'Franchise League',
    },
    {
      id: 'athlete-conditioning',
      name: '⚡ Athlete Match Fitness & Drills',
      sport: 'All Sports',
      opponent: 'High-Fatigue Tournament',
      format: 'Tournament Week Cycle',
      objective: 'Periodized conditioning, VO2 max endurance drills, explosive sprint recovery, and tactical mental stamina under pressure.',
      tag: 'Athletic Conditioning',
    },
  ];

  const handleApplyPreset = (p: TacticalPreset) => {
    setSport(p.sport);
    setTeamName(p.name.replace(/^[^\s]+\s/, ''));
    setOpponent(p.opponent);
    setMatchFormat(p.format);
    setObjective(p.objective);
  };

  const handleGenerateStrategy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/sport-ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sport,
          teamName,
          opponent,
          matchFormat,
          objective,
          formation,
          language: currentLanguage,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Tactical analysis failed');
      }

      setAnalysisResult(data.analysis);
      setDrillDownHistory([]);
    } catch (err: any) {
      setError(err.message || 'Failed to generate tactical strategy.');
    } finally {
      setLoading(false);
    }
  };

  const handleDrillDownSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!drillDownQuery.trim() || !analysisResult) return;

    setDrillDownLoading(true);
    const userQ = drillDownQuery;
    setDrillDownQuery('');

    try {
      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Regarding the ${sport} tactical plan for ${teamName} vs ${opponent}:
Follow-up tactical question: ${userQ}

Provide an elite coaching breakdown, exact player instructions, and situational drills.`,
          model: 'gemini-3.8-flash',
          systemPrompt: 'You are the ThinkPulse Master Sports Tactician & Head Coach. Give precise, realistic, high-IQ sports tactics and coaching adjustments.',
        }),
      });

      const data = await res.json();
      const reply = data.reply || 'Analysis updated.';
      setDrillDownHistory((prev) => [...prev, { q: userQ, a: reply }]);
    } catch (err) {
      setDrillDownHistory((prev) => [...prev, { q: userQ, a: 'Follow-up query could not be completed.' }]);
    } finally {
      setDrillDownLoading(false);
    }
  };

  const handleCopy = () => {
    if (!analysisResult) return;
    const text = typeof analysisResult === 'string' ? analysisResult : JSON.stringify(analysisResult, null, 2);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!analysisResult) return;
    const content = `=====================================================
THINKPULSE SPORT TEAM AI - OFFICIAL TACTICAL DOSSIER
=====================================================
Team:        ${teamName}
Sport:       ${sport}
Opponent:    ${opponent}
Format:      ${matchFormat}
Formation:   ${formation}
Objective:   ${objective}
Generated:   ${new Date().toLocaleString()}
-----------------------------------------------------
TACTICAL BLUEPRINT & STRATEGY:
-----------------------------------------------------
${typeof analysisResult === 'string' ? analysisResult : JSON.stringify(analysisResult, null, 2)}
=====================================================`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Tactical_Dossier_${teamName.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#06080d] text-slate-100 overflow-y-auto font-sans">
      {/* Top Header Banner */}
      <div className="px-6 py-5 border-b border-slate-800/80 bg-gradient-to-r from-[#090d16] via-[#0e1626] to-[#090d16] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 p-0.5 shadow-lg shadow-emerald-950/50 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Trophy className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-heading font-extrabold text-white tracking-wide">
                Sport Team AI (اسپورٹس ٹیم ٹیکٹیکل اینالائزر)
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                PRO COACH ENGINE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Elite Tactical Formations, Playing XI Optimization, Opponent Matchup Counters & Athletic Conditioning
            </p>
          </div>
        </div>

        {onOpenLiveVoice && (
          <button
            onClick={onOpenLiveVoice}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 font-bold text-xs flex items-center gap-2 transition-all hover:scale-105 shadow-md shadow-cyan-950/50"
          >
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>Live Baat Q/A on Sports Tactics</span>
          </button>
        )}
      </div>

      <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Preset Strategies Quick Bar */}
        <div>
          <span className="text-[11px] font-mono uppercase font-bold text-slate-400 block mb-2">
            Quick Tactical Scenarios (تیار شدہ ٹیم حکمت عملیاں):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {presets.map((p) => (
              <button
                key={p.id}
                onClick={() => handleApplyPreset(p)}
                className="p-3 rounded-2xl bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 text-left transition-all group shadow-sm"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {p.name}
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    {p.sport}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2">{p.objective}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Input Configuration & Tactical Board */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form (5 cols) */}
          <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Shield className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Team & Match Parameters</h2>
            </div>

            <form onSubmit={handleGenerateStrategy} className="space-y-3.5">
              {/* Sport Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Sport Discipline (کھیل)</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Cricket', 'Football', 'Basketball', 'Tennis', 'Hockey', 'Custom'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSport(s)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all ${
                        sport === s
                          ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                          : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Team and Opponent */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Your Team (آپ کی ٹیم)</label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="e.g. Pakistan Cricket Team"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Opponent (حریف ٹیم)</label>
                  <input
                    type="text"
                    value={opponent}
                    onChange={(e) => setOpponent(e.target.value)}
                    placeholder="e.g. Australia or India"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Format & Formation */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Match Format (فارمیٹ)</label>
                  <input
                    type="text"
                    value={matchFormat}
                    onChange={(e) => setMatchFormat(e.target.value)}
                    placeholder="e.g. T20I, ODI, 90-Min Final"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Desired Setup / Formation</label>
                  <input
                    type="text"
                    value={formation}
                    onChange={(e) => setFormation(e.target.value)}
                    placeholder="e.g. 4-3-3, 5 Batsmen / 6 Bowlers"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Tactical Objective */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tactical Focus & Coaching Objective (حکمت عملی کا بنیادی ہدف)
                </label>
                <textarea
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  rows={3}
                  placeholder="Describe your desired game plan, player roles, pinch hitters, death bowling, pressing traps, or pitch conditions..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 leading-relaxed"
                />
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:brightness-110 text-slate-950 font-extrabold text-xs shadow-xl shadow-emerald-950/50 flex items-center justify-center gap-2.5 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <ThinkPulseLogo size="sm" showText={false} animated />
                    <span>ThinkPulse Analyzing Match Strategy & Formations...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-slate-950" />
                    <span>Generate Pro Tactical Masterplan (حکمت عملی تیار کریں)</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Athletic Field / Pitch Preview (7 cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            {/* Visual Pitch Simulator */}
            <div className="relative rounded-3xl bg-gradient-to-b from-[#0b1f13] via-[#08170d] to-[#040a06] border border-emerald-500/30 p-5 shadow-2xl overflow-hidden min-h-[300px] flex flex-col justify-between">
              {/* Field Grass Lines Pattern */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.15),transparent_70%)] pointer-events-none" />
              <div className="absolute inset-0 border border-emerald-500/20 rounded-2xl m-4 pointer-events-none" />
              <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-emerald-500/20 -translate-x-1/2 pointer-events-none" />
              <div className="absolute left-1/2 top-1/2 w-28 h-28 border border-emerald-500/20 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

              {/* Header inside pitch */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    {sport.toUpperCase()} TACTICAL BOARD SIMULATOR
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  {formation}
                </span>
              </div>

              {/* 11 Players Positioning Simulation */}
              <div className="relative z-10 grid grid-cols-4 gap-3 py-6 max-w-lg mx-auto w-full text-center">
                {[
                  { pos: 'GK / WK', role: 'Captain / Anchor', color: 'bg-amber-400 text-slate-950' },
                  { pos: 'DEF / PACE', role: 'Strike Bowler', color: 'bg-emerald-400 text-slate-950' },
                  { pos: 'DEF / PACE', role: 'Opening Speed', color: 'bg-emerald-400 text-slate-950' },
                  { pos: 'MID / SPIN', role: 'Wrist Spinner', color: 'bg-cyan-400 text-slate-950' },
                  { pos: 'MID / AR', role: 'Power Finisher', color: 'bg-cyan-400 text-slate-950' },
                  { pos: 'MID / BAT', role: 'Anchor #3', color: 'bg-sky-400 text-slate-950' },
                  { pos: 'FWD / OPEN', role: 'Aggressive Opener', color: 'bg-rose-400 text-slate-950' },
                  { pos: 'FWD / OPEN', role: 'Dynamic Striker', color: 'bg-rose-400 text-slate-950' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-xl bg-slate-950/80 border border-emerald-500/30 shadow-md backdrop-blur-sm"
                  >
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${item.color} mb-0.5`}>
                      {item.pos}
                    </span>
                    <p className="text-[10px] font-semibold text-white truncate">{item.role}</p>
                  </div>
                ))}
              </div>

              {/* Pitch status footer */}
              <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-400 border-t border-emerald-500/20 pt-2">
                <span>Matchup: <strong className="text-white">{teamName}</strong> vs <strong className="text-emerald-400">{opponent}</strong></span>
                <span>Tactical Engine: <strong className="text-cyan-400">Gemini 3.1 Pro Thinking</strong></span>
              </div>
            </div>

            {/* Tactical Dossier Result Card */}
            {analysisResult && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-2xl animate-fadeIn">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-400" />
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        {teamName} Master Tactical Dossier
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Generated specifically to counter {opponent} in {matchFormat}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition-colors"
                      title="Copy Dossier"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={handleDownload}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition-colors"
                      title="Download Dossier"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                    </button>
                  </div>
                </div>

                {/* Tactical Content Display */}
                <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800/80 text-xs text-slate-200 leading-relaxed max-h-[380px] overflow-y-auto space-y-3 font-sans whitespace-pre-wrap">
                  {typeof analysisResult === 'string'
                    ? analysisResult
                    : JSON.stringify(analysisResult, null, 2)}
                </div>

                {/* Drill Down Q/A inside Sport AI */}
                <div className="pt-2 border-t border-slate-800 space-y-3">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                    Ask Coach Tactical Adjustments (کوچ سے مزید حکمت عملی پوچھیں):
                  </span>

                  {drillDownHistory.length > 0 && (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {drillDownHistory.map((item, i) => (
                        <div key={i} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1">
                          <p className="font-bold text-cyan-300">Q: {item.q}</p>
                          <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{item.a}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <form onSubmit={handleDrillDownSubmit} className="flex gap-2">
                    <input
                      type="text"
                      value={drillDownQuery}
                      onChange={(e) => setDrillDownQuery(e.target.value)}
                      placeholder="e.g. اگر حریف ٹیم کے 3 وکٹ جلد گر جائیں تو کیا حکمت عملی اپنائیں؟"
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="submit"
                      disabled={drillDownLoading}
                      className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      {drillDownLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      <span>Ask Coach</span>
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
