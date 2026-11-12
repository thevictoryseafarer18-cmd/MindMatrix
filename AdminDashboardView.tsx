import React, { useState } from 'react';
import { 
  ShieldCheck, 
  BookOpen, 
  Layers, 
  Database, 
  Users, 
  CheckCircle2, 
  Plus, 
  Settings, 
  Sparkles 
} from 'lucide-react';
import { User, ConceptGraphNode } from '../types';

interface AdminDashboardProps {
  users: User[];
  concepts: ConceptGraphNode[];
}

export const AdminDashboardView: React.FC<AdminDashboardProps> = ({ users, concepts }) => {
  const [activeTab, setActiveTab] = useState<'syllabus' | 'concepts' | 'questions' | 'users'>('syllabus');

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Admin Header */}
      <div className="p-6 rounded-2xl glass-panel-glow border border-rose-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800 font-mono uppercase">
              Administrator Console
            </span>
            <span className="text-xs text-slate-400">&bull; Elena Vance &bull; Curriculum Director</span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1 flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-rose-400" />
            <span>PLATFORM & SYLLABUS GOVERNANCE</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Configure learning taxonomies, manage NCERT/CBSE standards, calibrate question difficulty tiers (1–5), and monitor user access policies.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="px-4 py-2.5 rounded-xl bg-navy-900 border border-slate-800 text-right">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Total Concepts</span>
            <div className="text-2xl font-black text-white font-mono">{concepts.length}</div>
          </div>
          <div className="px-4 py-2.5 rounded-xl bg-navy-900 border border-slate-800 text-right">
            <span className="text-[10px] text-slate-400 font-bold uppercase">System Users</span>
            <div className="text-2xl font-black text-rose-400 font-mono">{users.length}</div>
          </div>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 text-xs">
        {[
          { id: 'syllabus', label: 'Syllabus & Chapters (Class 10 Physics)', icon: BookOpen },
          { id: 'concepts', label: 'Concept Graph Nodes & Prerequisites', icon: Layers },
          { id: 'questions', label: 'Question Bank & Difficulty Rubrics', icon: Database },
          { id: 'users', label: 'User Roles & Classrooms', icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl font-medium transition ${
                isActive
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-glow-rose font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-navy-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      {activeTab === 'syllabus' && (
        <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100">Curriculum Structure: CBSE / NCERT Unified</h3>
            <span className="text-xs text-emerald-400 font-mono font-bold">Status: Active & Validated</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                title: "Chapter 1: Electricity",
                code: "CH_ELEC",
                concepts: 7,
                topics: ["Electric Current", "Potential Difference", "Ohm's Law", "Series Circuits", "Parallel Circuits", "Electric Power"]
              },
              {
                title: "Chapter 2: Light - Optics",
                code: "CH_LIGHT",
                concepts: 6,
                topics: ["Reflection", "Refraction", "Spherical Mirrors", "Lenses", "Lens Formula", "Magnification"]
              },
              {
                title: "Chapter 3: Magnetic Effects",
                code: "CH_MAG",
                concepts: 5,
                topics: ["Magnetic Field", "Field Lines", "Electric Motor", "Electromagnetic Induction", "Generator"]
              }
            ].map((ch) => (
              <div key={ch.code} className="p-4 rounded-xl bg-navy-900/80 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-200">{ch.title}</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800">
                    {ch.code}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">{ch.concepts} Connected Concepts in BKT Graph</div>
                <ul className="space-y-1 pt-1 text-[11px] text-slate-300">
                  {ch.topics.map((t) => (
                    <li key={t} className="flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'concepts' && (
        <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100">Knowledge Graph Concept Registry ({concepts.length})</h3>
            <button className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800 text-xs font-semibold">
              <Plus className="w-3.5 h-3.5" />
              <span>Add Concept</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-[10px] font-mono text-slate-400 uppercase bg-navy-900 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Concept ID</th>
                  <th className="py-2.5 px-3">Title</th>
                  <th className="py-2.5 px-3">Chapter</th>
                  <th className="py-2.5 px-3">Prerequisites</th>
                  <th className="py-2.5 px-3">Difficulty Weight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                {concepts.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/30">
                    <td className="py-2 px-3 text-cyan-300 font-bold">{c.id}</td>
                    <td className="py-2 px-3 font-sans font-medium text-white">{c.title}</td>
                    <td className="py-2 px-3 text-slate-400">{c.chapter_title}</td>
                    <td className="py-2 px-3 text-indigo-300">{c.prerequisites.join(', ') || 'None (Root)'}</td>
                    <td className="py-2 px-3 text-amber-400">{c.difficulty_weight}x</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-100">Enrolled Users & Roles</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {users.map((u) => (
              <div key={u.id} className="p-3.5 rounded-xl bg-navy-900 border border-slate-800 flex items-center space-x-3 text-xs">
                <img src={u.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"} alt={u.name} className="w-10 h-10 rounded-full object-cover border border-slate-700" />
                <div>
                  <div className="font-bold text-white">{u.name}</div>
                  <div className="text-[11px] text-cyan-400 capitalize">{u.role} &bull; {u.grade}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{u.email}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'questions' && (
        <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-100">Adaptive Question Bank Calibration</h3>
          <div className="grid grid-cols-5 gap-3 text-center text-xs">
            {[
              { level: 1, name: "Beginner", desc: "Basic recall & single variable" },
              { level: 2, name: "Easy", desc: "Direct equation substitution" },
              { level: 3, name: "Intermediate", desc: "Multi-branch topologies" },
              { level: 4, name: "Advanced", desc: "Assertion-reasoning & sign rules" },
              { level: 5, name: "Challenge", desc: "Complex cross-chapter synthesis" },
            ].map((tier) => (
              <div key={tier.level} className="p-3 rounded-xl bg-navy-900 border border-slate-800 space-y-1">
                <span className="font-mono font-bold text-cyan-400">Level {tier.level}</span>
                <div className="font-bold text-white">{tier.name}</div>
                <p className="text-[10px] text-slate-400">{tier.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
