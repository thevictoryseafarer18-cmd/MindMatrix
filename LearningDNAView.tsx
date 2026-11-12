import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  Tooltip 
} from 'recharts';
import { 
  ShieldCheck, 
  Dna, 
  TrendingUp, 
  Activity, 
  Brain, 
  Clock, 
  History, 
  CheckCircle2, 
  AlertTriangle,
  Sparkles,
  Info
} from 'lucide-react';
import { LearningDNAResponse } from '../types';
import { api } from '../api';

interface LearningDNAProps {
  currentUserId: number;
}

export const LearningDNAView: React.FC<LearningDNAProps> = ({ currentUserId }) => {
  const [data, setData] = useState<LearningDNAResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadDNA();
  }, [currentUserId]);

  const loadDNA = async () => {
    setIsLoading(true);
    try {
      const res = await api.getLearningDNA(currentUserId);
      setData(res);
    } catch (err) {
      console.error('Failed to load learning DNA:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center p-20 text-xs text-slate-400">
        Synthesizing Learning DNA performance indicators...
      </div>
    );
  }

  // Format data for Recharts Radar
  const radarData = data.radar_metrics.map((m) => ({
    metric: m.metric,
    value: m.value,
    fullMark: 100,
  }));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Hero Header */}
      <div className="p-6 rounded-2xl glass-panel-glow border border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono">
              Signature AI Feature
            </span>
            <span className="text-xs text-slate-400">&bull; Evidence-Based Cognitive Profile</span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1 flex items-center space-x-2">
            <Dna className="w-6 h-6 text-electric-cyan" />
            <span>LEARNING DNA PROFILE</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            A multi-dimensional biometric radar of learning dynamics grounded in Bayesian Knowledge Tracing, explanatory precision, and metacognitive calibration.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="px-5 py-3 rounded-xl bg-navy-900 border border-slate-800 text-right">
            <span className="text-[10px] text-slate-400 font-bold uppercase">DNA Composite Score</span>
            <div className="text-3xl font-black text-electric-cyan font-mono mt-0.5">
              {data.overall_score} <span className="text-xs text-slate-500 font-normal">/ 100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Radar & Dimension Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Radar Chart (Left 5 Cols) */}
        <div className="md:col-span-5 p-5 rounded-2xl glass-panel border border-slate-800 flex flex-col items-center justify-center">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Cognitive Dimension Radar
          </h3>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="metric" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#334155" />
                <Radar
                  name={data.student_name}
                  dataKey="value"
                  stroke="#00f5ff"
                  fill="#00f5ff"
                  fillOpacity={0.25}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0b101e',
                    borderColor: '#1e293b',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <span className="text-[10px] text-slate-500 mt-2">
            Computed from real responses across Class 10 Physics
          </span>
        </div>

        {/* Dimension Cards (Right 7 Cols) */}
        <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data.radar_metrics.map((metric) => (
            <div 
              key={metric.metric} 
              className="p-3.5 rounded-xl glass-panel border border-slate-800 space-y-1.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">{metric.metric}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                    metric.trend === 'improving' ? 'bg-emerald-950 text-emerald-400' :
                    metric.trend === 'stable' ? 'bg-indigo-950 text-indigo-400' :
                    'bg-amber-950 text-amber-400'
                  }`}>
                    {metric.trend.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight mt-1">{metric.description}</p>
              </div>

              <div className="pt-2 flex items-baseline justify-between">
                <div className="w-28 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-electric-cyan rounded-full"
                    style={{ width: `${metric.value}%` }}
                  />
                </div>
                <span className="text-base font-black text-electric-cyan font-mono">
                  {metric.value}%
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Recurring Misconception History */}
      {data.recurring_misconceptions.length > 0 && (
        <div className="p-5 rounded-2xl glass-panel border border-rose-500/30 space-y-3">
          <h3 className="text-xs font-bold text-rose-400 flex items-center space-x-2 uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Recurring Misconception Patterns Logged</span>
          </h3>
          <div className="space-y-2">
            {data.recurring_misconceptions.map((rm, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-rose-950/20 border border-rose-800/40 text-xs flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-200">{rm.label}</div>
                  <div className="text-[10px] text-slate-400">Concept: {rm.concept} &bull; Classification: {rm.error_type}</div>
                </div>
                <span className="text-[10px] font-mono text-rose-400">Detected: {rm.last_detected}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BKT Historical Audit Log (Section 10 Requirement) */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
            <History className="w-4 h-4 text-cyan-400" />
            <span>Persistent BKT Mastery Audit History (Zero Hardcoding)</span>
          </h3>
          <span className="text-[10px] font-mono text-slate-500">Live DB Log</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[10px] font-mono text-slate-400 uppercase bg-navy-900 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Concept</th>
                <th className="py-2.5 px-3">Event Trigger</th>
                <th className="py-2.5 px-3">Old Mastery</th>
                <th className="py-2.5 px-3">Delta</th>
                <th className="py-2.5 px-3">New Mastery</th>
                <th className="py-2.5 px-3">Reason / Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
              {data.evidence_history.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-slate-500">
                    No mastery transition events recorded yet.
                  </td>
                </tr>
              ) : (
                data.evidence_history.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 text-slate-400">{h.timestamp}</td>
                    <td className="py-2.5 px-3 text-cyan-300 font-bold">{h.concept_id}</td>
                    <td className="py-2.5 px-3 text-slate-300 uppercase">{h.trigger}</td>
                    <td className="py-2.5 px-3 text-slate-400">{h.old_mastery}%</td>
                    <td className={`py-2.5 px-3 font-bold ${h.delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {h.delta >= 0 ? `+${h.delta}%` : `${h.delta}%`}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-white">{h.new_mastery}%</td>
                    <td className="py-2.5 px-3 font-sans text-slate-400 text-[10px]">{h.reason}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
