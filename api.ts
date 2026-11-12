import {
  KnowledgeGraphResponse,
  Question,
  DiagnosticReportResponse,
  ThinkTraceResponse,
  CorrectiveAnswerResponse,
  SpacedRevisionResponse,
  LearningDNAResponse,
  WhatIfIForgetResponse,
  TeacherDashboardResponse,
  AICoachResponse,
  User
} from './types';

const API_BASE = 'http://localhost:8000/api/v1';

export const api = {
  // Users
  async getUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/users`);
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  // Knowledge Graph
  async getKnowledgeGraph(userId: number, chapterId?: number): Promise<KnowledgeGraphResponse> {
    const url = new URL(`${API_BASE}/graph`);
    url.searchParams.append('user_id', userId.toString());
    if (chapterId) url.searchParams.append('chapter_id', chapterId.toString());
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error('Failed to fetch knowledge graph');
    return res.json();
  },

  // Diagnostic
  async getDiagnosticQuestions(): Promise<Question[]> {
    const res = await fetch(`${API_BASE}/diagnostic/questions`);
    if (!res.ok) throw new Error('Failed to fetch diagnostic questions');
    return res.json();
  },

  async submitDiagnostic(userId: number, answers: Array<{
    question_id: number;
    user_answer: string;
    reasoning?: string;
    response_time_seconds?: number;
    confidence_score?: number;
  }>): Promise<DiagnosticReportResponse> {
    const res = await fetch(`${API_BASE}/diagnostic/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, answers })
    });
    if (!res.ok) throw new Error('Failed to submit diagnostic');
    return res.json();
  },

  // ThinkTrace
  async analyzeThinkTrace(payload: {
    user_id: number;
    question_id: number;
    user_answer: string;
    student_reasoning: string;
    confidence_score: number;
  }): Promise<ThinkTraceResponse> {
    const res = await fetch(`${API_BASE}/thinktrace/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to analyze reasoning');
    return res.json();
  },

  async submitCorrective(payload: {
    user_id: number;
    original_concept_id: string;
    corrective_question_id: number;
    user_answer: string;
    reasoning?: string;
  }): Promise<CorrectiveAnswerResponse> {
    const res = await fetch(`${API_BASE}/thinktrace/submit-corrective`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to submit corrective exercise');
    return res.json();
  },

  // Adaptive Questions
  async getAdaptiveQuestion(userId: number, conceptId?: string, difficulty?: number): Promise<Question> {
    const url = new URL(`${API_BASE}/questions/adaptive`);
    url.searchParams.append('user_id', userId.toString());
    if (conceptId) url.searchParams.append('concept_id', conceptId);
    if (difficulty) url.searchParams.append('difficulty', difficulty.toString());
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error('Failed to fetch adaptive question');
    return res.json();
  },

  // Spaced Repetition
  async getSpacedRepetition(userId: number): Promise<SpacedRevisionResponse> {
    const res = await fetch(`${API_BASE}/spaced-repetition/dashboard?user_id=${userId}`);
    if (!res.ok) throw new Error('Failed to fetch spaced repetition dashboard');
    return res.json();
  },

  // Learning DNA
  async getLearningDNA(userId: number): Promise<LearningDNAResponse> {
    const res = await fetch(`${API_BASE}/learner/dna?user_id=${userId}`);
    if (!res.ok) throw new Error('Failed to fetch learning DNA');
    return res.json();
  },

  // What If I Forget?
  async getWhatIfIForget(userId: number): Promise<WhatIfIForgetResponse> {
    const res = await fetch(`${API_BASE}/learner/what-if-i-forget?user_id=${userId}`);
    if (!res.ok) throw new Error('Failed to fetch decay predictions');
    return res.json();
  },

  // Teacher Dashboard
  async getTeacherDashboard(classId?: number): Promise<TeacherDashboardResponse> {
    const url = classId ? `${API_BASE}/teacher/dashboard?class_id=${classId}` : `${API_BASE}/teacher/dashboard`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch teacher dashboard');
    return res.json();
  },

  async createTeacherAssignment(payload: { class_id: number; title: string; concept_ids: string[] }): Promise<any> {
    const res = await fetch(`${API_BASE}/teacher/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to assign task');
    return res.json();
  },

  // AI Coach
  async sendCoachMessage(userId: number, message: string, currentConceptId?: string): Promise<AICoachResponse> {
    const res = await fetch(`${API_BASE}/coach/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, message, current_concept_id: currentConceptId })
    });
    if (!res.ok) throw new Error('Failed to get coach reply');
    return res.json();
  },

  // Reset Demo
  async resetDemo(): Promise<any> {
    const res = await fetch(`${API_BASE}/demo/reset`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset demo state');
    return res.json();
  }
};
