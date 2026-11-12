export interface User {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  grade: string;
  avatar?: string;
  created_at: string;
}

export interface ConceptGraphNode {
  id: string;
  chapter_id: number;
  chapter_code: string;
  chapter_title: string;
  title: string;
  description: string;
  learning_objectives: string;
  difficulty_weight: number;
  category: string;
  node_x: number;
  node_y: number;
  mastery_prob: number;
  confidence_level: number;
  status: 'mastered' | 'developing' | 'needs_attention' | 'not_attempted';
  attempts_count: number;
  correct_count: number;
  prerequisites: string[];
  dependents: string[];
  forgetting_risk: number;
  last_practiced: string | null;
  common_misconceptions: string[];
}

export interface ConceptGraphEdge {
  id: string;
  source: string;
  target: string;
  strength: number;
}

export interface KnowledgeGraphResponse {
  nodes: ConceptGraphNode[];
  edges: ConceptGraphEdge[];
  overall_mastery: number;
  total_concepts: number;
  mastered_count: number;
  developing_count: number;
  needs_attention_count: number;
  not_attempted_count: number;
}

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: number;
  concept_id: string;
  concept_title: string;
  difficulty: number;
  question_type: string;
  prompt: string;
  options: QuestionOption[];
  scaffolding_hint?: string;
  expected_reasoning?: string;
}

export interface CorrectiveExercise {
  question_id: number;
  prompt: string;
  options: QuestionOption[];
  scaffolding_hint: string;
  correct_answer: string;
  detailed_solution: string;
}

export interface ThinkTraceResponse {
  attempt_id: number;
  is_correct: boolean;
  user_answer: string;
  student_original_reasoning: string;
  tested_concept_id: string;
  tested_concept_title: string;
  prerequisite_impacted: string | null;
  misconception_detected: string | null;
  error_type: string;
  classification_confidence: number;
  why_reasoning_is_incorrect: string | null;
  correct_scientific_explanation: string;
  corrective_exercise: CorrectiveExercise | null;
  short_intervention: string;
  old_mastery: number;
  new_mastery: number;
  mastery_delta: number;
  recommended_next_action: string;
}

export interface CorrectiveAnswerResponse {
  is_correct: boolean;
  feedback: string;
  old_mastery: number;
  new_mastery: number;
  scheduled_revision_date: string;
  next_step: string;
}

export interface ConceptMasterySummary {
  concept_id: string;
  title: string;
  mastery_percentage: number;
  status: string;
  reasoning_quality: number;
  attempts: number;
}

export interface DiagnosticReportResponse {
  overall_knowledge_score: number;
  concepts_mastery: ConceptMasterySummary[];
  strong_concepts: string[];
  weak_concepts: string[];
  identified_misconceptions: Array<{
    concept: string;
    label: string;
    error_type: string;
    confidence: number;
    why_incorrect: string;
  }>;
  recommended_learning_sequence: string[];
  summary_insight: string;
}

export interface SpacedRevisionItem {
  id: number;
  concept_id: string;
  concept_title: string;
  chapter_title: string;
  scheduled_date: string;
  status: 'due_today' | 'upcoming' | 'overdue' | 'completed';
  repetition_number: number;
  interval_days: number;
  forgetting_risk: number;
  mastery_prob: number;
}

export interface SpacedRevisionResponse {
  today_revisions: SpacedRevisionItem[];
  upcoming_revisions: SpacedRevisionItem[];
  overdue_revisions: SpacedRevisionItem[];
  high_risk_concepts: SpacedRevisionItem[];
  total_completed: number;
  streak_days: number;
}

export interface LearningDNAPoint {
  metric: string;
  value: number;
  description: string;
  trend: 'improving' | 'stable' | 'needs_focus';
}

export interface LearningDNAResponse {
  user_id: number;
  student_name: string;
  overall_score: number;
  radar_metrics: LearningDNAPoint[];
  recurring_misconceptions: Array<{
    label: string;
    concept: string;
    error_type: string;
    last_detected: string;
  }>;
  evidence_history: Array<{
    id: number;
    concept_id: string;
    old_mastery: number;
    new_mastery: number;
    delta: number;
    trigger: string;
    reason: string;
    timestamp: string;
  }>;
}

export interface ForgetRiskItem {
  concept_id: string;
  title: string;
  estimated_retention_risk: number;
  days_since_practice: number;
  last_mastery_level: number;
  why_at_risk: string;
  recommended_revision_date: string;
  urgency: 'critical' | 'moderate' | 'low';
}

export interface WhatIfIForgetResponse {
  user_id: number;
  total_tracked_concepts: number;
  at_risk_count: number;
  concepts_at_risk: ForgetRiskItem[];
  decay_curve_data: Array<{
    day: string;
    without_revision: number;
    with_spaced_repetition: number;
  }>;
  scientific_disclaimer: string;
}

export interface HeatmapCell {
  student_id: number;
  student_name: string;
  concept_id: string;
  concept_title: string;
  mastery_prob: number;
  status: 'strong' | 'developing' | 'weak' | 'unattempted';
  misconception_count: number;
}

export interface TeacherDashboardResponse {
  total_enrolled: number;
  average_class_mastery: number;
  revision_completion_rate: number;
  students_requiring_intervention: Array<{
    student_id: number;
    name: string;
    avg_mastery: number;
    misconceptions_count: number;
    weak_concepts_count: number;
    urgency: string;
    primary_concern: string;
  }>;
  most_misunderstood_concepts: Array<{
    concept: string;
    frequency: number;
    recommended_action: string;
  }>;
  concept_performance: Array<{
    concept_id: string;
    title: string;
    chapter_id: number;
    avg_mastery: number;
    total_attempts: number;
    misconception_count: number;
  }>;
  heatmap_students: Array<{ id: number; name: string; email: string }>;
  heatmap_concepts: Array<{ id: string; title: string; chapter: string }>;
  heatmap_matrix: HeatmapCell[][];
  recent_activity: Array<{ student: string; action: string; time: string }>;
}

export interface AICoachResponse {
  reply: string;
  referenced_concepts: string[];
  coaching_tip?: string;
}
