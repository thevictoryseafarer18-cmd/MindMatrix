import React from 'react';
import { 
  Brain, 
  Sparkles, 
  Flame, 
  Activity, 
  ShieldCheck, 
  GraduationCap, 
  Users, 
  PlayCircle,
  RotateCcw,
  BookOpen
} from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentUser: User;
  onSelectUser: (user: User) => void;
  availableUsers: User[];
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenDemoTour: () => void;
  onResetDemo: () => void;
  streakDays?: number;
  overallMastery?: number;
  activeMisconceptions?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onSelectUser,
  availableUsers,
  activeTab,
  onSelectTab,
  onOpenDemoTour,
  onResetDemo,
  streakDays = 5,
  overallMastery = 68,
  activeMisconceptions = 1,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-navy-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Tagline */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectTab('overview')}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5 shadow-glow-cyan">
              <div className="w-full h-full bg-navy-900 rounded-[10px] flex items-center justify-center">
                <Brain className="w-5 h-5 text-electric-cyan" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-electric-cyan via-white to-electric-indigo">
                  MINDMATRIX<span className="text-electric-cyan font-mono text-sm ml-1 px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800">AI</span>
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800 animate-pulse-subtle">
                  BKT v2.0 ACTIVE
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wide hidden sm:block">
                Beyond Answers. Into Understanding.
              </p>
            </div>
          </div>

          {/* Student Status Quick Indicators (Only shown for student role) */}
          {currentUser.role === 'student' && (
            <div className="hidden lg:flex items-center space-x-6 text-xs">
              <div className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-navy-900/60 border border-slate-800">
                <Flame className="w-4 h-4 text-amber-400 fill-amber-400/30" />
                <span className="text-slate-300">Streak:</span>
                <span className="font-bold text-amber-400">{streakDays} Days</span>
              </div>
              <div className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-navy-900/60 border border-slate-800">
                <Activity className="w-4 h-4 text-electric-cyan" />
                <span className="text-slate-300">Mastery:</span>
                <span className="font-bold text-electric-cyan">{overallMastery}%</span>
              </div>
              {activeMisconceptions > 0 && (
                <div className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                  <span>1 Misconception Flagged</span>
                </div>
              )}
            </div>
          )}

          {/* Right Action Center & Role Switcher */}
          <div className="flex items-center space-x-3">
            {/* Live 11-Step Tour Trigger */}
            <button
              onClick={onOpenDemoTour}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-medium text-xs shadow-glow-cyan hover:opacity-95 transition"
              title="Launch the 11-step hackathon verification demo"
            >
              <PlayCircle className="w-4 h-4 text-white" />
              <span className="hidden sm:inline">11-Step Demo Tour</span>
              <span className="sm:hidden">Demo</span>
            </button>

            {/* Reset Demo State Button */}
            <button
              onClick={onResetDemo}
              className="p-1.5 rounded-lg bg-navy-900 hover:bg-navy-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs transition"
              title="Reset student state back to step 1 baseline"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Role Switcher Pill */}
            <div className="relative group">
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-navy-900 border border-slate-700/80 hover:border-cyan-500/50 cursor-pointer transition">
                <img
                  src={currentUser.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"}
                  alt={currentUser.name}
                  className="w-6 h-6 rounded-full object-cover border border-cyan-400"
                />
                <div className="text-left text-xs">
                  <p className="font-semibold text-slate-200 leading-none">{currentUser.name}</p>
                  <p className="text-[10px] text-cyan-400 uppercase tracking-wider font-mono">
                    {currentUser.role}
                  </p>
                </div>
              </div>

              {/* Role Dropdown */}
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-navy-900 border border-slate-800 shadow-2xl p-2 hidden group-hover:block z-50">
                <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  Switch Active Role
                </div>
                {availableUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => onSelectUser(u)}
                    className={`w-full flex items-center space-x-2 px-2.5 py-2 rounded-lg text-left text-xs transition mt-1 ${
                      u.id === currentUser.id
                        ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/60'
                        : 'hover:bg-navy-800 text-slate-300'
                    }`}
                  >
                    {u.role === 'student' && <GraduationCap className="w-4 h-4 text-cyan-400" />}
                    {u.role === 'teacher' && <Users className="w-4 h-4 text-indigo-400" />}
                    {u.role === 'admin' && <ShieldCheck className="w-4 h-4 text-rose-400" />}
                    <div className="flex-1 truncate">
                      <div className="font-medium text-slate-200">{u.name}</div>
                      <div className="text-[10px] text-slate-400 capitalize">{u.role} &bull; {u.grade}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Navigation Tabs based on Role */}
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-2 border-t border-slate-800/40 no-scrollbar text-xs">
          {currentUser.role === 'student' && (
            <>
              {[
                { id: 'overview', label: 'Student Dashboard', icon: Brain },
                { id: 'graph', label: 'Knowledge Graph', icon: Activity },
                { id: 'thinktrace', label: 'ThinkTrace™ Reasoning', icon: Sparkles, highlight: true },
                { id: 'diagnostic', label: 'Diagnostic Assessment', icon: BookOpen },
                { id: 'spaced-repetition', label: 'Spaced Repetition', icon: Flame },
                { id: 'dna', label: 'Learning DNA', icon: ShieldCheck },
                { id: 'what-if-i-forget', label: 'What If I Forget?', icon: RotateCcw },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onSelectTab(tab.id)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                      isActive
                        ? 'bg-electric-cyan/15 text-electric-cyan border border-electric-cyan/40 shadow-glow-cyan'
                        : tab.highlight
                        ? 'bg-indigo-950/60 text-indigo-300 border border-indigo-800 hover:bg-indigo-900/50'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-navy-900/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </>
          )}

          {currentUser.role === 'teacher' && (
            <>
              {[
                { id: 'teacher-overview', label: 'Classroom Analytics', icon: Users },
                { id: 'teacher-heatmap', label: 'Concept Mastery Heatmap', icon: Activity },
                { id: 'teacher-misconceptions', label: 'Misconception Analysis', icon: Sparkles },
                { id: 'teacher-interventions', label: 'Intervention Alerts', icon: Flame },
                { id: 'graph', label: 'Curriculum Knowledge Graph', icon: Brain },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onSelectTab(tab.id)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                      isActive
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50 shadow-glow-violet'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-navy-900/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </>
          )}

          {currentUser.role === 'admin' && (
            <>
              {[
                { id: 'admin-curriculum', label: 'Syllabus & Chapters', icon: BookOpen },
                { id: 'admin-concepts', label: 'Concept & Graph Manager', icon: Brain },
                { id: 'admin-questions', label: 'Question Bank & Difficulty', icon: Activity },
                { id: 'admin-users', label: 'User Roles & Classes', icon: Users },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onSelectTab(tab.id)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                      isActive
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-navy-900/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </>
          )}
        </div>
      </div>
    </header>
  );
};
