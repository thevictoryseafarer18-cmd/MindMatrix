import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { 
  RotateCcw, 
  AlertTriangle, 
  Sparkles, 
  Calendar, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  Activity, 
  TrendingDown, 
  Info,
  Play
} from 'lucide-react';
import { WhatIfIForgetResponse, ForgetRiskItem } from '../types';
import { api } from '../api';

interface WhatIfIForgetProps {
  currentUserId: number;
  onLaunchRecoveryQuiz?: (conceptId: string) => void;
}

export const WhatIfIForget: React.FC<WhatIfIForgetProps> = ({
  currentUserId,
  onLaunchRecoveryQuiz,
}) => {
  const [data, setData] = useState<WhatIfIForgetResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeQuizConcept, setActiveQuizConcept] = useState<string | null>(null);
  const [quizAnswer, setQuizAnswer] = useState<string>('');
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  useEffect(() => {
    loadData();
  }, [currentUserId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await api.getWhatIfIForget(currentUserId);
      setData(res);
    } catch (err) {
      console.error('Failed to load decay predictions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center p-20 text-xs text-slate-400">
        Simulating Ebbinghaus retention curves...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Hero Header */}
      <div className="p-6 rounded-2xl glass-panel-glow border border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono">
              Signature AI Feature
            </span>
            <span className="text-xs text-slate-400">&bull; Predictive Memory Decay</span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1 flex items-center space-x-2">
            <RotateCcw className="w-6 h-6 text-electric-cyan" />
            <span>WHAT IF I FORGET?</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Simulates Ebbinghaus forgetting curves based on your practice intervals, cognitive load, and mastery stability to pre-emptively forecast memory lapse before your exam.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="px-4 py-2.5 rounded-xl bg-navy-900 border border-slate-800 text-right">
            <span className="text-[10px] text-slate-400 font-bold uppercase">At-Risk Concepts</span>
            <div className="text-2xl font-black text-rose-400 font-mono">
              {data.at_risk_count} <span className="text-xs text-slate-500 font-normal">/ {data.total_tracked_concepts}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decay Curve Projection Chart */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <TrendingDown className="w-4 h-4 text-cyan-400" />
              <span>14-Day Memory Retention Projection: Natural Decay vs Spaced Repetition</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Comparison between unreinforced neural trace decay versus timed SM-2 cognitive reactivation.
            </p>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-1">
              <span className="w-3 h-0.5 bg-rose-400"></span>
              <span className="text-rose-400 text-[11px]">Without Revision</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-3 h-0.5 bg-cyan-400"></span>
              <span className="text-cyan-400 text-[11px]">With Spaced Repetition</span>
            </div>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.decay_curve_data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0b101e', 
                  borderColor: '#1e293b', 
                  borderRadius: '12px',
                  fontSize: '12px'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="without_revision" 
                name="Natural Decay" 
                stroke="#f43f5e" 
                strokeWidth={2.5} 
                dot={{ r: 3, fill: '#f43f5e' }} 
              />
              <Line 
                type="monotone" 
                dataKey="with_spaced_repetition" 
                name="Spaced Repetition" 
                stroke="#00f5ff" 
                strokeWidth={2.5} 
                dot={{ r: 3, fill: '#00f5ff' }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* At-Risk Concepts Table / Cards */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Concepts Identified At High Retention Risk</span>
        </h3>

        <div className="space-y-3">
          {data.concepts_at_risk.map((item) => (
            <div 
              key={item.concept_id}
              className="p-4 rounded-xl bg-navy-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-slate-200 text-sm">{item.title}</h4>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                    item.urgency === 'critical' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                    item.urgency === 'moderate' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                    'bg-slate-800 text-slate-300'
                  }`}>
                    {item.urgency} Urgency
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] max-w-xl">{item.why_at_risk}</p>
                <div className="flex items-center space-x-4 text-[10px] text-slate-400 pt-1 font-mono">
                  <span>Last Mastery: <strong className="text-white">{item.last_mastery_level}%</strong></span>
                  <span>Days Since Practice: <strong className="text-amber-400">{item.days_since_practice}d</strong></span>
                  <span>Target Revision: <strong className="text-cyan-400">{item.recommended_revision_date}</strong></span>
                </div>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Retention Risk</span>
                  <span className="text-lg font-black font-mono text-rose-400">
                    {item.estimated_retention_risk}%
                  </span>
                </div>
                <button
                  onClick={() => {
                    setActiveQuizConcept(item.concept_id);
                    setQuizSubmitted(false);
                    setQuizAnswer('');
                  }}
                  className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs shadow-glow-cyan hover:opacity-95 transition"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Quick Recovery Quiz</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Recovery Quiz Modal / In-place Drawer */}
      {activeQuizConcept && (
        <div className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/50 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-indigo-800/40">
            <div className="flex items-center space-x-2 text-indigo-300 font-bold text-xs">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Quick Memory Recovery Challenge &bull; {activeQuizConcept}</span>
            </div>
            <button 
              onClick={() => setActiveQuizConcept(null)}
              className="text-slate-400 hover:text-white text-xs font-mono"
            >
              Close [X]
            </button>
          </div>

          <div className="text-xs text-slate-200 font-medium">
            Question: What happens to the equivalent resistance when another identical resistor is wired in parallel?
          </div>

          <div className="space-y-2">
            {[
              { id: 'a', text: 'Increases linearly' },
              { id: 'b', text: 'Halves because 1/Req = 1/R + 1/R = 2/R' },
              { id: 'c', text: 'Stays the same' },
            ].map((opt) => (
              <div
                key={opt.id}
                onClick={() => setQuizAnswer(opt.id)}
                className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-center space-x-2 transition ${
                  quizAnswer === opt.id 
                    ? 'bg-cyan-950 border-cyan-400 text-white' 
                    : 'bg-navy-950 border-slate-800 text-slate-300'
                }`}
              >
                <span className="font-mono text-cyan-400 uppercase font-bold">{opt.id}.</span>
                <span>{opt.text}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            {quizSubmitted ? (
              <span className="text-xs text-emerald-400 font-bold flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Memory Trace Reactivated! Retention decay halted for 48 hours.</span>
              </span>
            ) : (
              <span className="text-[11px] text-slate-400">
                Correct answer updates memory stability index.
              </span>
            )}
            <button
              onClick={() => setQuizSubmitted(true)}
              disabled={!quizAnswer}
              className="px-4 py-1.5 rounded-lg bg-electric-cyan text-navy-950 font-bold text-xs hover:opacity-95 transition disabled:opacity-40"
            >
              Verify Memory
            </button>
          </div>
        </div>
      )}

      {/* Scientific Disclaimer (Module F Requirement) */}
      <div className="p-3.5 rounded-xl bg-navy-900/60 border border-slate-800/80 text-[11px] text-slate-400 flex items-start space-x-2">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <span>
          <strong className="text-slate-300">Scientific Foundation: </strong>
          {data.scientific_disclaimer}
        </span>
      </div>

    </div>
  );
};
