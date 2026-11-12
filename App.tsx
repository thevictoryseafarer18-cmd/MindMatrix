import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { StudentDashboard } from './components/StudentDashboard';
import { ConceptKnowledgeGraph } from './components/ConceptKnowledgeGraph';
import { ThinkTraceStudio } from './components/ThinkTraceStudio';
import { DiagnosticAssessment } from './components/DiagnosticAssessment';
import { SpacedRepetitionView } from './components/SpacedRepetitionView';
import { LearningDNAView } from './components/LearningDNAView';
import { WhatIfIForget } from './components/WhatIfIForget';
import { TeacherDashboardView } from './components/TeacherDashboardView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { AICoachModal } from './components/AICoachModal';
import { DemoTourModal } from './components/DemoTourModal';

import { 
  User, 
  KnowledgeGraphResponse, 
  SpacedRevisionResponse, 
  LearningDNAResponse 
} from './types';
import { api } from './api';
import { MessageSquare, Sparkles, Brain } from 'lucide-react';

export function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  // Data States
  const [graphData, setGraphData] = useState<KnowledgeGraphResponse | null>(null);
  const [spacedRevision, setSpacedRevision] = useState<SpacedRevisionResponse | null>(null);
  const [dnaData, setDnaData] = useState<LearningDNAResponse | null>(null);

  // Modals
  const [isDemoTourOpen, setIsDemoTourOpen] = useState<boolean>(false);
  const [isCoachOpen, setIsCoachOpen] = useState<boolean>(false);
  const [activeConceptToPractice, setActiveConceptToPractice] = useState<string | undefined>(undefined);
  const [highlightConceptId, setHighlightConceptId] = useState<string | undefined>(undefined);

  // Initial Data Fetch
  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    try {
      const userList = await api.getUsers();
      setUsers(userList);
      const studentUser = userList.find((u) => u.role === 'student') || userList[0];
      setCurrentUser(studentUser);
      loadUserData(studentUser.id);
    } catch (err) {
      console.error('Failed to initialize app:', err);
    }
  };

  const loadUserData = async (userId: number) => {
    try {
      const [graph, spaced, dna] = await Promise.all([
        api.getKnowledgeGraph(userId),
        api.getSpacedRepetition(userId),
        api.getLearningDNA(userId),
      ]);
      setGraphData(graph);
      setSpacedRevision(spaced);
      setDnaData(dna);
    } catch (err) {
      console.error('Failed to load user state:', err);
    }
  };

  const handleSelectUser = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'teacher') {
      setActiveTab('teacher-overview');
    } else if (user.role === 'admin') {
      setActiveTab('admin-curriculum');
    } else {
      setActiveTab('overview');
    }
    loadUserData(user.id);
  };

  const handleResetDemo = async () => {
    try {
      await api.resetDemo();
      if (currentUser) {
        await loadUserData(currentUser.id);
      }
      alert('Demo state reset! Aarav Sharma is back to the baseline Step 1 state.');
    } catch (err: any) {
      alert('Error resetting demo: ' + err.message);
    }
  };

  const handleNavigateTab = (tab: string, extras?: any) => {
    setActiveTab(tab);
    if (extras?.highlight) {
      setHighlightConceptId(extras.highlight);
    }
    if (extras?.conceptId) {
      setActiveConceptToPractice(extras.conceptId);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center text-slate-400 font-mono text-xs">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div>Initializing MINDMATRIX AI Learning Engine...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onSelectUser={handleSelectUser}
        availableUsers={users}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenDemoTour={() => setIsDemoTourOpen(true)}
        onResetDemo={handleResetDemo}
        streakDays={spacedRevision?.streak_days || 5}
        overallMastery={graphData?.overall_mastery || 68}
        activeMisconceptions={graphData?.needs_attention_count || 1}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* STUDENT VIEWS */}
        {currentUser.role === 'student' && (
          <>
            {activeTab === 'overview' && (
              <StudentDashboard
                user={currentUser}
                graphData={graphData}
                spacedRevision={spacedRevision}
                dnaData={dnaData}
                onNavigateTab={handleNavigateTab}
                onOpenCoach={() => setIsCoachOpen(true)}
              />
            )}

            {activeTab === 'graph' && graphData && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                      <Sparkles className="w-5 h-5 text-electric-cyan" />
                      <span>Interactive Concept Knowledge Graph &bull; Class 10 Physics</span>
                    </h2>
                    <p className="text-xs text-slate-400">
                      Explore prerequisite topologies, node mastery levels, and common misconceptions.
                    </p>
                  </div>
                </div>
                <ConceptKnowledgeGraph
                  nodes={graphData.nodes}
                  edges={graphData.edges}
                  overallMastery={graphData.overall_mastery}
                  highlightConceptId={highlightConceptId}
                  onSelectConceptToPractice={(cId) => {
                    setActiveConceptToPractice(cId);
                    setActiveTab('thinktrace');
                  }}
                />
              </div>
            )}

            {activeTab === 'thinktrace' && (
              <ThinkTraceStudio
                currentUserId={currentUser.id}
                onMasteryUpdated={() => loadUserData(currentUser.id)}
              />
            )}

            {activeTab === 'diagnostic' && (
              <DiagnosticAssessment
                currentUserId={currentUser.id}
                onAssessmentCompleted={() => loadUserData(currentUser.id)}
              />
            )}

            {activeTab === 'spaced-repetition' && (
              <SpacedRepetitionView
                currentUserId={currentUser.id}
                onPracticeConcept={(cId) => {
                  setActiveConceptToPractice(cId);
                  setActiveTab('thinktrace');
                }}
              />
            )}

            {activeTab === 'dna' && (
              <LearningDNAView currentUserId={currentUser.id} />
            )}

            {activeTab === 'what-if-i-forget' && (
              <WhatIfIForget
                currentUserId={currentUser.id}
                onLaunchRecoveryQuiz={(cId) => {
                  setActiveConceptToPractice(cId);
                  setActiveTab('thinktrace');
                }}
              />
            )}
          </>
        )}

        {/* TEACHER VIEWS */}
        {currentUser.role === 'teacher' && (
          <>
            {(activeTab === 'teacher-overview' || activeTab === 'teacher-heatmap' || activeTab === 'teacher-misconceptions' || activeTab === 'teacher-interventions') && (
              <TeacherDashboardView
                onOpenStudentProfile={(sId) => {
                  const student = users.find((u) => u.id === sId);
                  if (student) handleSelectUser(student);
                }}
              />
            )}

            {activeTab === 'graph' && graphData && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white">Curriculum Knowledge Graph Overview</h2>
                <ConceptKnowledgeGraph
                  nodes={graphData.nodes}
                  edges={graphData.edges}
                  overallMastery={graphData.overall_mastery}
                />
              </div>
            )}
          </>
        )}

        {/* ADMIN VIEWS */}
        {currentUser.role === 'admin' && (
          <AdminDashboardView
            users={users}
            concepts={graphData?.nodes || []}
          />
        )}

      </main>

      {/* Floating AI Coach Button (Available for Student) */}
      {currentUser.role === 'student' && !isCoachOpen && (
        <button
          onClick={() => setIsCoachOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center space-x-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs shadow-glow-cyan hover:opacity-95 transition"
        >
          <Brain className="w-5 h-5 text-white animate-pulse" />
          <span>AI Learning Coach</span>
        </button>
      )}

      {/* AI Coach Floating Window */}
      <AICoachModal
        currentUserId={currentUser.id}
        isOpen={isCoachOpen}
        onClose={() => setIsCoachOpen(false)}
        activeConceptId={activeConceptToPractice}
      />

      {/* 11-Step Demo Verification Tour Modal */}
      <DemoTourModal
        isOpen={isDemoTourOpen}
        onClose={() => setIsDemoTourOpen(false)}
        onNavigateToTab={handleNavigateTab}
        onResetDemo={handleResetDemo}
        currentUserId={currentUser.id}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-navy-950 py-4 text-center text-xs text-slate-500 font-mono">
        MINDMATRIX AI &bull; Beyond Answers. Into Understanding. &bull; Bayesian Knowledge Tracing & SM-2 Engine Active
      </footer>

    </div>
  );
}

export default App;
