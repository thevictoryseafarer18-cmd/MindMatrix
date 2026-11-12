import React from 'react';
import { 
  Brain, 
  Sparkles, 
  Flame, 
  Activity, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Dna, 
  RotateCcw,
  Zap,
  BookOpen,
  TrendingUp,
  Target
} from 'lucide-react';
import { User, KnowledgeGraphResponse, SpacedRevisionResponse, LearningDNAResponse } from '../types';

interface StudentDashboardProps {
  user: User;
  graphData: KnowledgeGraphResponse | null;
  spacedRevision: SpacedRevisionResponse | null;
  dnaData: LearningDNAResponse | null;
  onNavigateTab: (tab: string, extras?: any) => void;
  onOpenCoach: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  user,
  graphData,
  spacedRevision,
  dnaData,
  onNavigateTab,
  onOpenCoach,
}) => {
  const overallMastery = graphData?.overall_mastery || 68;
  const streak = spacedRevision?.streak_days || 5;
  const atRiskCount = graphData?.needs_attention_count || 1;

  // Weakest concepts requiring immediate focus
  const weakestConcepts = graphData?.nodes
    .filter((n) => n.status === 'needs_attention' || n.mastery_prob < 0.5)
    .slice(0, 3) || [];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Welcome Hero Banner */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-navy-900 via-navy-850 to-indigo-950 border border-slate-800 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
                CLASS 10 PHYSICS CORE
              </span>
              <span className="text-xs text-slate-400">&bull; NCERT / CBSE Standard</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-electric-cyan to-indigo-400">{user.name}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Your personalized AI learning intelligence engine is active. Today we recommend focusing on <strong className="text-cyan-400 font-semibold">Parallel Circuit Branch Conductance</strong> to overwrite an active series misconception.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigateTab('thinktrace')}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs shadow-glow-cyan hover:opacity-95 transition"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>Launch ThinkTrace™ Studio</span>
              </button>
              <button
                onClick={onOpenCoach}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-navy-900 border border-slate-700 text-slate-200 font-semibold text-xs hover:bg-slate-800 transition"
              >
                <Brain className="w-4 h-4 text-cyan-400" />
                <span>Talk to AI Coach</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Cluster */}
          <div className="grid grid-cols-3 gap-3 shrink-0">
            <div className="p-4 rounded-2xl bg-navy-950/80 border border-slate-800 text-center">
              <Activity className="w-5 h-5 text-electric-cyan mx-auto mb-1" />
              <div className="text-2xl font-black text-white font-mono">{overallMastery}%</div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Mastery</span>
            </div>

            <div className="p-4 rounded-2xl bg-navy-950/80 border border-slate-800 text-center">
              <Flame className="w-5 h-5 text-amber-400 fill-amber-400/30 mx-auto mb-1" />
              <div className="text-2xl font-black text-amber-400 font-mono">{streak}d</div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Streak</span>
            </div>

            <div className="p-4 rounded-2xl bg-navy-950/80 border border-slate-800 text-center">
              <Target className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <div className="text-2xl font-black text-emerald-400 font-mono">4/5</div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Daily Goal</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Column Focus Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Weakest Concepts Requiring Reinforcement */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Priority Reinforcement</span>
            </h3>
            <span className="text-[10px] font-mono text-rose-400 font-bold bg-rose-950 px-2 py-0.5 rounded">
              Needs Focus
            </span>
          </div>

          <div className="space-y-2.5">
            {weakestConcepts.length === 0 ? (
              <p className="text-xs text-slate-400">All concepts currently at or above developing mastery.</p>
            ) : (
              weakestConcepts.map((c) => (
                <div
                  key={c.id}
                  onClick={() => onNavigateTab('thinktrace')}
                  className="p-3 rounded-xl bg-navy-900/80 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition flex items-center justify-between text-xs"
                >
                  <div>
                    <h4 className="font-bold text-slate-200">{c.title}</h4>
                    <span className="text-[10px] text-slate-400">{c.chapter_title}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-rose-400">{Math.round(c.mastery_prob * 100)}%</span>
                    <span className="text-[10px] text-slate-500 block">Mastery</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => onNavigateTab('graph')}
            className="w-full py-2 rounded-xl bg-navy-900 border border-slate-700 hover:border-cyan-500 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
          >
            <span>Explore Knowledge Graph</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 2: Today's Spaced Repetition Due */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>Today&apos;s Revision Queue</span>
            </h3>
            <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-950 px-2 py-0.5 rounded">
              SM-2 Engine
            </span>
          </div>

          <div className="space-y-2.5">
            {spacedRevision?.today_revisions.slice(0, 2).map((item) => (
              <div 
                key={item.id}
                className="p-3 rounded-xl bg-navy-900/80 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-200">{item.concept_title}</h4>
                  <div className="text-[10px] text-slate-400 font-mono">Interval: {item.interval_days}d &bull; #{item.repetition_number}</div>
                </div>
                <button
                  onClick={() => onNavigateTab('spaced-repetition')}
                  className="px-3 py-1 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800 font-semibold text-[11px]"
                >
                  Review
                </button>
              </div>
            ))}
            {(!spacedRevision?.today_revisions.length) && (
              <div className="p-3 rounded-xl bg-navy-900/60 border border-slate-800 text-xs text-slate-400">
                Parallel circuits revision due in 24 hours.
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigateTab('what-if-i-forget')}
            className="w-full py-2 rounded-xl bg-navy-900 border border-slate-700 hover:border-cyan-500 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
          >
            <span>What If I Forget? Decay Simulation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 3: Learning DNA Biometrics */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <Dna className="w-4 h-4 text-indigo-400" />
              <span>Learning DNA Highlights</span>
            </h3>
            <span className="text-[10px] font-mono text-indigo-400 font-bold bg-indigo-950 px-2 py-0.5 rounded">
              Empirical
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {dnaData?.radar_metrics.slice(0, 3).map((m) => (
              <div key={m.metric} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-medium">{m.metric}</span>
                  <span className="font-mono font-bold text-electric-cyan">{m.value}%</span>
                </div>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-electric-cyan" style={{ width: `${m.value}%` }} />
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigateTab('dna')}
            className="w-full py-2 rounded-xl bg-navy-900 border border-slate-700 hover:border-cyan-500 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
          >
            <span>View Full Cognitive Radar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Recent Telemetry & Practice Log */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Recent Cognitive Evidence & Practice Events</span>
          </h3>
          <span className="text-[10px] font-mono text-slate-500">Live Telemetry</span>
        </div>

        <div className="space-y-2">
          {[
            {
              event: "ThinkTrace Misconception Overwritten: 'Parallel Circuits'",
              time: "Just now",
              detail: "Successfully calculated equivalent resistance of two 10 Ω resistors as 5 Ω using reciprocal formula.",
              badge: "Corrective Repaired",
              badgeStyle: "bg-emerald-950 text-emerald-400 border border-emerald-800"
            },
            {
              event: "Diagnostic Assessment Completed",
              time: "15 mins ago",
              detail: "Evaluated 6 core topics across Electricity, Light, and Magnetic Effects with multi-evidence scoring.",
              badge: "Diagnostic Score: 83.3%",
              badgeStyle: "bg-cyan-950 text-cyan-400 border border-cyan-800"
            },
            {
              event: "Spaced Revision Scheduled",
              time: "1 hour ago",
              detail: "Scheduled automated 24-hour review for Ohm's Law and Parallel topologic models.",
              badge: "SM-2 Interval 1.0d",
              badgeStyle: "bg-indigo-950 text-indigo-400 border border-indigo-800"
            }
          ].map((item, idx) => (
            <div 
              key={idx}
              className="p-3.5 rounded-xl bg-navy-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div>
                <div className="font-bold text-slate-200">{item.event}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{item.detail}</div>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${item.badgeStyle}`}>
                  {item.badge}
                </span>
                <span className="text-[10px] text-slate-500">{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
