import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Flame, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  RefreshCw,
  Zap,
  Info
} from 'lucide-react';
import { SpacedRevisionResponse, SpacedRevisionItem } from '../types';
import { api } from '../api';

interface SpacedRepetitionViewProps {
  currentUserId: number;
  onPracticeConcept?: (conceptId: string) => void;
}

export const SpacedRepetitionView: React.FC<SpacedRepetitionViewProps> = ({
  currentUserId,
  onPracticeConcept,
}) => {
  const [data, setData] = useState<SpacedRevisionResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'overdue' | 'high_risk'>('today');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadDashboard();
  }, [currentUserId]);

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      const res = await api.getSpacedRepetition(currentUserId);
      setData(res);
    } catch (err) {
      console.error('Failed to load spaced repetition dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center p-20 text-xs text-slate-400">
        Loading SM-2 revision calendar...
      </div>
    );
  }

  const getListForTab = () => {
    switch (activeTab) {
      case 'today':
        return data.today_revisions;
      case 'upcoming':
        return data.upcoming_revisions;
      case 'overdue':
        return data.overdue_revisions;
      case 'high_risk':
        return data.high_risk_concepts;
    }
  };

  const currentList = getListForTab();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header & Stats */}
      <div className="p-6 rounded-2xl glass-panel-glow border border-cyan-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
              Module F
            </span>
            <span className="text-xs text-slate-400">&bull; SuperMemo SM-2 Cognitive Scheduler</span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1 flex items-center space-x-2">
            <Flame className="w-6 h-6 text-amber-400 fill-amber-400/30" />
            <span>SPACED REPETITION ENGINE</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Optimizes long-term memory consolidation by scheduling concept reviews at the exact mathematical moment of imminent forgetting.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="px-4 py-2.5 rounded-xl bg-navy-900 border border-slate-800 text-right">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Learning Streak</span>
            <div className="text-2xl font-black text-amber-400 font-mono flex items-center justify-end space-x-1">
              <span>{data.streak_days}</span>
              <span className="text-xs text-slate-400">Days</span>
            </div>
          </div>
          <div className="px-4 py-2.5 rounded-xl bg-navy-900 border border-slate-800 text-right">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Consolidated</span>
            <div className="text-2xl font-black text-emerald-400 font-mono">
              {data.total_completed}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 text-xs">
        {[
          { id: 'today', label: `Today's Due (${data.today_revisions.length})`, icon: Calendar },
          { id: 'overdue', label: `Overdue (${data.overdue_revisions.length})`, icon: AlertTriangle, alert: data.overdue_revisions.length > 0 },
          { id: 'upcoming', label: `Upcoming Schedule (${data.upcoming_revisions.length})`, icon: Clock },
          { id: 'high_risk', label: `High Decay Risk (${data.high_risk_concepts.length})`, icon: Flame },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl font-medium transition ${
                isActive
                  ? 'bg-electric-cyan text-navy-950 font-bold shadow-glow-cyan'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-navy-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.alert && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping ml-1"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Revision Cards List */}
      <div className="space-y-3">
        {currentList.length === 0 ? (
          <div className="p-12 text-center rounded-2xl glass-panel border border-slate-800 text-slate-400 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-200">All caught up in this category!</h4>
            <p className="text-xs">No pending revision items found. Your neural traces are consolidated.</p>
          </div>
        ) : (
          currentList.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl glass-panel border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs hover:border-cyan-500/50 transition"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase font-semibold">
                    {item.chapter_title}
                  </span>
                  <span className="text-slate-600">&bull;</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                    item.status === 'overdue' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                    item.status === 'due_today' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                    'bg-slate-800 text-slate-300'
                  }`}>
                    {item.status.replace('_', ' ')}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-100">{item.concept_title}</h4>

                {/* SM-2 Metadata Indicators */}
                <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400 font-mono">
                  <span>Repetition: <strong className="text-white">#{item.repetition_number}</strong></span>
                  <span>SM-2 Interval: <strong className="text-cyan-400">{item.interval_days} days</strong></span>
                  <span>Due Date: <strong className="text-slate-200">{item.scheduled_date}</strong></span>
                  <div className="flex items-center space-x-1">
                    <span>Decay Risk:</span>
                    <span className={`font-bold ${item.forgetting_risk > 0.4 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {Math.round(item.forgetting_risk * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="shrink-0 flex items-center space-x-2">
                <button
                  onClick={() => {
                    if (onPracticeConcept) onPracticeConcept(item.concept_id);
                  }}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs shadow-glow-cyan hover:opacity-95 transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Review Concept</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Algorithmic Note */}
      <div className="p-3.5 rounded-xl bg-navy-900/60 border border-slate-800/80 text-[11px] text-slate-400 flex items-start space-x-2">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <span>
          <strong className="text-slate-300">How SM-2 Intervals Adapt: </strong>
          Correct answers with high reasoning quality increase intervals exponentially (I_n = I_prev &times; EF). Calculation slips reset to shorter intervals, while conceptual misconceptions reset intervals to Day 1 with scaffolding.
        </span>
      </div>

    </div>
  );
};
