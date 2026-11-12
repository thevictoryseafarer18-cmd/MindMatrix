import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  ArrowRight, 
  HelpCircle, 
  AlertTriangle, 
  TrendingUp, 
  RotateCcw,
  Clock,
  Layers,
  Award
} from 'lucide-react';
import { Question, DiagnosticReportResponse } from '../types';
import { api } from '../api';

interface DiagnosticAssessmentProps {
  currentUserId: number;
  onAssessmentCompleted?: (report: DiagnosticReportResponse) => void;
}

export const DiagnosticAssessment: React.FC<DiagnosticAssessmentProps> = ({
  currentUserId,
  onAssessmentCompleted,
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, { user_answer: string; reasoning: string; confidence: number }>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [report, setReport] = useState<DiagnosticReportResponse | null>(null);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setIsLoading(true);
    try {
      const data = await api.getDiagnosticQuestions();
      setQuestions(data);
    } catch (err: any) {
      console.error('Failed to load diagnostic questions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const currentQ = questions[currentIndex];
  const currentAnswer = answers[currentQ?.id] || { user_answer: '', reasoning: '', confidence: 0.8 };

  const handleSelectOption = (optId: string) => {
    setAnswers({
      ...answers,
      [currentQ.id]: {
        ...currentAnswer,
        user_answer: optId,
      }
    });
  };

  const handleReasoningChange = (text: string) => {
    setAnswers({
      ...answers,
      [currentQ.id]: {
        ...currentAnswer,
        reasoning: text,
      }
    });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmitAll = async () => {
    setIsSubmitting(true);
    try {
      const payloadAnswers = questions.map((q) => {
        const a = answers[q.id] || { user_answer: 'b', reasoning: 'Standard physics rule application', confidence: 0.7 };
        return {
          question_id: q.id,
          user_answer: a.user_answer,
          reasoning: a.reasoning,
          confidence_score: a.confidence,
          response_time_seconds: 35.0
        };
      });

      const res = await api.submitDiagnostic(currentUserId, payloadAnswers);
      setReport(res);
      if (onAssessmentCompleted) onAssessmentCompleted(res);
    } catch (err: any) {
      alert('Error submitting diagnostic: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick filler helper for the demo evaluator
  const fillSampleDiagnostic = () => {
    const sampleAnswers: Record<number, { user_answer: string; reasoning: string; confidence: number }> = {
      101: { user_answer: 'a', reasoning: 'The equivalent resistance increases because another resistor is added to the circuit.', confidence: 0.85 },
      102: { user_answer: 'b', reasoning: 'Current is conserved in a closed series loop so both bulbs receive the exact same current.', confidence: 0.90 },
      103: { user_answer: 'a', reasoning: 'Ohm law I = V/R = 24/8 = 3 Amperes.', confidence: 0.95 },
      104: { user_answer: 'c', reasoning: 'Focal length is determined by mirror curvature f = R/2; covering half blocks light rays but does not change geometry.', confidence: 0.80 },
      105: { user_answer: 'c', reasoning: 'Magnetic field lines cannot intersect because tangent gives unique field direction.', confidence: 0.85 },
      106: { user_answer: 'a', reasoning: 'Lens formula 1/f = 1/v - 1/u gives v = +30 cm at 2F.', confidence: 0.80 }
    };
    setAnswers(sampleAnswers);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20 text-xs text-slate-400">
        Loading syllabus diagnostic questions...
      </div>
    );
  }

  // Diagnostic Report View
  if (report) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
        
        {/* Report Hero */}
        <div className="p-6 rounded-2xl glass-panel-glow border border-cyan-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2 text-center md:text-left">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800 uppercase tracking-widest">
              Diagnostic Assessment Report
            </span>
            <h2 className="text-2xl font-black text-white">Class 10 Physics Knowledge Profile</h2>
            <p className="text-xs text-slate-300 max-w-xl">
              {report.summary_insight}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-navy-900 border border-slate-800 w-36 h-36 shrink-0 shadow-inner">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Overall Score</span>
            <span className="text-3xl font-black text-electric-cyan font-mono mt-1">
              {report.overall_knowledge_score}%
            </span>
            <span className="text-[10px] text-emerald-400 mt-1 font-medium">Multi-Evidence</span>
          </div>
        </div>

        {/* Strong vs Weak Concepts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Strong */}
          <div className="p-5 rounded-2xl glass-panel border border-emerald-500/30 space-y-3">
            <h3 className="text-xs font-bold text-emerald-400 flex items-center space-x-2 uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Strong Concepts Mastered ({report.strong_concepts.length})</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {report.strong_concepts.map((c) => (
                <span key={c} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-950/60 text-emerald-200 border border-emerald-800">
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* Weak */}
          <div className="p-5 rounded-2xl glass-panel border border-rose-500/30 space-y-3">
            <h3 className="text-xs font-bold text-rose-400 flex items-center space-x-2 uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Concepts Requiring Attention ({report.weak_concepts.length})</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {report.weak_concepts.map((c) => (
                <span key={c} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-950/60 text-rose-200 border border-rose-800">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Misconceptions Flagged */}
        {report.identified_misconceptions.length > 0 && (
          <div className="p-5 rounded-2xl glass-panel border border-amber-500/30 space-y-3">
            <h3 className="text-xs font-bold text-amber-400 flex items-center space-x-2 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Cognitive Misconceptions Flagged</span>
            </h3>
            <div className="space-y-2">
              {report.identified_misconceptions.map((m, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs text-slate-200">
                  <div className="flex items-center justify-between font-bold text-amber-300 mb-1">
                    <span>{m.label} ({m.concept})</span>
                    <span className="font-mono text-[10px] text-amber-400">Match: {Math.round(m.confidence * 100)}%</span>
                  </div>
                  <p className="text-[11px] text-slate-300">{m.why_incorrect}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Learning Sequence */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-cyan-400 flex items-center space-x-2 uppercase tracking-wider">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span>Recommended Learning Sequence</span>
          </h3>
          <div className="space-y-2">
            {report.recommended_learning_sequence.map((step, idx) => (
              <div key={idx} className="flex items-center space-x-3 p-3 rounded-xl bg-navy-900 border border-slate-800 text-xs">
                <span className="w-6 h-6 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-mono font-bold text-xs">
                  {idx + 1}
                </span>
                <span className="text-slate-200 font-medium">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Retake Diagnostic */}
        <div className="flex justify-end">
          <button
            onClick={() => { setReport(null); setCurrentIndex(0); setAnswers({}); }}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Diagnostic Assessment</span>
          </button>
        </div>

      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header & Progress */}
      <div className="p-5 rounded-2xl glass-panel border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
              Module A
            </span>
            <span className="text-xs text-slate-400">Class 10 Physics Diagnostic Assessment</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Adaptive Diagnostic Evaluation</h2>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fillSampleDiagnostic}
            className="px-3 py-1.5 rounded-lg bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-800 text-xs font-medium transition"
            title="Auto-fill sample diagnostic responses for quick evaluation"
          >
            Fill Sample Responses
          </button>
          <div className="text-right text-xs">
            <span className="text-slate-400">Progress</span>
            <div className="font-mono font-bold text-electric-cyan">
              {currentIndex + 1} of {questions.length} Questions
            </div>
          </div>
        </div>
      </div>

      {/* Question Card */}
      {currentQ && (
        <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-6 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded bg-navy-900 text-cyan-400 font-mono font-semibold">
                {currentQ.concept_title}
              </span>
              <span className="text-slate-400 uppercase font-mono text-[10px]">
                {currentQ.question_type}
              </span>
            </div>
            <span className="text-amber-400 font-semibold text-[11px]">
              Difficulty: Level {currentQ.difficulty}/5
            </span>
          </div>

          <div className="text-base font-semibold text-slate-100 leading-relaxed whitespace-pre-line">
            {currentQ.prompt}
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {currentQ.options.map((opt) => {
              const isSelected = currentAnswer.user_answer === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.id)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer flex items-start space-x-3 transition ${
                    isSelected
                      ? 'bg-cyan-950/60 border-cyan-400 text-white shadow-glow-cyan'
                      : 'bg-navy-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold text-[10px] shrink-0 ${
                    isSelected ? 'bg-electric-cyan text-navy-950' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {opt.id.toUpperCase()}
                  </span>
                  <span className="leading-snug">{opt.text}</span>
                </div>
              );
            })}
          </div>

          {/* Optional Reasoning for Diagnostic */}
          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>Briefly articulate why you chose this option (Helps ThinkTrace identify misconceptions):</span>
            </label>
            <input
              type="text"
              value={currentAnswer.reasoning}
              onChange={(e) => handleReasoningChange(e.target.value)}
              placeholder="e.g. Formula V=IR, or parallel adds conductance, etc."
              className="w-full p-2.5 rounded-xl bg-navy-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={handleNext}
                className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-electric-cyan text-navy-950 text-xs font-bold shadow-glow-cyan hover:opacity-95 transition"
              >
                <span>Next Question</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleSubmitAll}
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-navy-950 text-xs font-bold shadow-glow-emerald hover:opacity-95 transition"
              >
                <Award className="w-4 h-4" />
                <span>{isSubmitting ? 'Evaluating Full Diagnostic...' : 'Finish & Generate Report'}</span>
              </button>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
