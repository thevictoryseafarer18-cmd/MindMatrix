from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: str
    role: str = "student"
    grade: str = "Class 10"
    avatar: Optional[str] = ""

class UserOut(UserBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class ConceptBase(BaseModel):
    id: str
    title: str
    description: str
    learning_objectives: Optional[str] = ""
    difficulty_weight: float = 1.0
    category: str = "Physics"
    node_x: float = 0.0
    node_y: float = 0.0

class ConceptGraphNode(ConceptBase):
    chapter_id: int
    chapter_code: str
    chapter_title: str
    mastery_prob: float = 0.0
    confidence_level: float = 0.5
    status: str = "not_attempted"  # mastered, developing, needs_attention, not_attempted
    attempts_count: int = 0
    correct_count: int = 0
    prerequisites: List[str] = []
    dependents: List[str] = []
    forgetting_risk: float = 0.0
    last_practiced: Optional[datetime] = None
    common_misconceptions: List[str] = []

class ConceptGraphEdge(BaseModel):
    id: str
    source: str
    target: str
    strength: float = 0.8

class KnowledgeGraphResponse(BaseModel):
    nodes: List[ConceptGraphNode]
    edges: List[ConceptGraphEdge]
    overall_mastery: float
    total_concepts: int
    mastered_count: int
    developing_count: int
    needs_attention_count: int
    not_attempted_count: int

class QuestionOption(BaseModel):
    id: str
    text: str

class QuestionOut(BaseModel):
    id: int
    concept_id: str
    concept_title: Optional[str] = ""
    difficulty: int
    question_type: str
    prompt: str
    options: List[QuestionOption] = []
    scaffolding_hint: Optional[str] = ""
    expected_reasoning: Optional[str] = ""

class DiagnosticQuestionAnswer(BaseModel):
    question_id: int
    user_answer: str
    reasoning: Optional[str] = ""
    response_time_seconds: float = 30.0
    confidence_score: float = 0.7

class DiagnosticSubmissionRequest(BaseModel):
    user_id: int
    answers: List[DiagnosticQuestionAnswer]

class ConceptMasterySummary(BaseModel):
    concept_id: str
    title: str
    mastery_percentage: float
    status: str
    reasoning_quality: float
    attempts: int

class DiagnosticReportResponse(BaseModel):
    overall_knowledge_score: float
    concepts_mastery: List[ConceptMasterySummary]
    strong_concepts: List[str]
    weak_concepts: List[str]
    identified_misconceptions: List[Dict[str, Any]]
    recommended_learning_sequence: List[str]
    summary_insight: str

class ThinkTraceRequest(BaseModel):
    user_id: int
    question_id: int
    user_answer: str
    student_reasoning: str
    confidence_score: float = 0.7
    response_time_seconds: float = 25.0

class CorrectiveExercise(BaseModel):
    question_id: int
    prompt: str
    options: List[QuestionOption]
    scaffolding_hint: str
    correct_answer: str
    detailed_solution: str

class ThinkTraceResponse(BaseModel):
    attempt_id: int
    is_correct: bool
    user_answer: str
    student_original_reasoning: str
    tested_concept_id: str
    tested_concept_title: str
    prerequisite_impacted: Optional[str] = None
    misconception_detected: Optional[str] = None
    error_type: str  # Conceptual misunderstanding, Calculation error, Formula confusion, Reading mistake, Guessing, Correct reasoning with incorrect final answer
    classification_confidence: float
    why_reasoning_is_incorrect: Optional[str] = None
    correct_scientific_explanation: str
    corrective_exercise: Optional[CorrectiveExercise] = None
    short_intervention: str
    old_mastery: float
    new_mastery: float
    mastery_delta: float
    recommended_next_action: str

class CorrectiveAnswerRequest(BaseModel):
    user_id: int
    original_concept_id: str
    corrective_question_id: int
    user_answer: str
    reasoning: Optional[str] = ""
    response_time_seconds: float = 20.0

class CorrectiveAnswerResponse(BaseModel):
    is_correct: bool
    feedback: str
    old_mastery: float
    new_mastery: float
    scheduled_revision_date: str
    next_step: str

class LearningDNAPoint(BaseModel):
    metric: str
    value: float  # 0 to 100
    description: str
    trend: str  # 'improving', 'stable', 'needs_focus'

class LearningDNAResponse(BaseModel):
    user_id: int
    student_name: str
    overall_score: float
    radar_metrics: List[LearningDNAPoint]  # Concept Mastery, Learning Speed, Reasoning Accuracy, Retention Strength, Confidence Calibration, Misconception Resilience
    recurring_misconceptions: List[Dict[str, Any]]
    evidence_history: List[Dict[str, Any]]

class ForgetRiskItem(BaseModel):
    concept_id: str
    title: str
    estimated_retention_risk: float  # 0.0 to 1.0 (percentage)
    days_since_practice: int
    last_mastery_level: float
    why_at_risk: str
    recommended_revision_date: str
    urgency: str  # 'critical', 'moderate', 'low'

class WhatIfIForgetResponse(BaseModel):
    user_id: int
    total_tracked_concepts: int
    at_risk_count: int
    concepts_at_risk: List[ForgetRiskItem]
    decay_curve_data: List[Dict[str, Any]]
    scientific_disclaimer: str

class SpacedRevisionItem(BaseModel):
    id: int
    concept_id: str
    concept_title: str
    chapter_title: str
    scheduled_date: str
    status: str  # 'due_today', 'upcoming', 'overdue', 'completed'
    repetition_number: int
    interval_days: float
    forgetting_risk: float
    mastery_prob: float

class SpacedRevisionResponse(BaseModel):
    today_revisions: List[SpacedRevisionItem]
    upcoming_revisions: List[SpacedRevisionItem]
    overdue_revisions: List[SpacedRevisionItem]
    high_risk_concepts: List[SpacedRevisionItem]
    total_completed: int
    streak_days: int

class HeatmapCell(BaseModel):
    student_id: int
    student_name: str
    concept_id: str
    concept_title: str
    mastery_prob: float
    status: str  # 'strong', 'developing', 'weak', 'unattempted'
    misconception_count: int

class TeacherDashboardResponse(BaseModel):
    total_enrolled: int
    average_class_mastery: float
    revision_completion_rate: float
    students_requiring_intervention: List[Dict[str, Any]]
    most_misunderstood_concepts: List[Dict[str, Any]]
    concept_performance: List[Dict[str, Any]]
    heatmap_students: List[Dict[str, Any]]
    heatmap_concepts: List[Dict[str, Any]]
    heatmap_matrix: List[List[Dict[str, Any]]]
    recent_activity: List[Dict[str, Any]]

class AICoachMessage(BaseModel):
    role: str  # 'user' or 'coach'
    content: str
    timestamp: Optional[str] = None

class AICoachRequest(BaseModel):
    user_id: int
    message: str
    current_concept_id: Optional[str] = None

class AICoachResponse(BaseModel):
    reply: str
    referenced_concepts: List[str]
    suggested_practice_question: Optional[Dict[str, Any]] = None
    coaching_tip: Optional[str] = None

class DemoStepAdvanceRequest(BaseModel):
    current_step: int
    payload: Optional[Dict[str, Any]] = None

class DemoStepAdvanceResponse(BaseModel):
    step: int
    title: str
    description: str
    state_updates: Dict[str, Any]
    next_action_label: str
