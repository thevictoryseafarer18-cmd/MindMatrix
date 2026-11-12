import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  Brain, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ArrowRight, 
  Lightbulb, 
  ShieldAlert, 
  Clock, 
  Calendar,
  Send,
  HelpCircle,
  RefreshCw,
  Info
} from 'lucide-react';
import { 
  Question, 
  ThinkTraceResponse, 
  CorrectiveAnswerResponse 
} from '../types';
import { api } from '../api';

interface ThinkTraceStudioProps {
  currentUserId: number;
  onMasteryUpdated?: () => void;
  initialQuestion?: Question;
  presetAnswer?: string;
  presetReasoning?: string;
}

export const ThinkTraceStudio: React.FC<ThinkTraceStudioProps> = ({
  currentUserId,
  onMasteryUpdated,
  initialQuestion,
  presetAnswer = '',
  presetReasoning = '',
}) => {
  // Default sample question (Parallel Circuits)
  const defaultQuestion: Question = {
    id: 101,
    concept_id: 'elec_parallel_circuits',
    concept_title: 'Parallel Circuits',
    difficulty: 3,
    question_type: 'reasoning',
    prompt: 'Two resistors of resistance R1 and R2 are connected in parallel. What happens to the overall equivalent resistance of the circuit when a third resistor R3 is added in parallel?',
    options: [
      { id: 'a', text: 'The equivalent resistance increases because another resistor is added to the system.' },
      { id: 'b', text: 'The equivalent resistance decreases because an additional branch allows more total current to flow.' },
      { id: 'c', text: 'The equivalent resistance remains unchanged because individual voltages are identical.' },
      { id: 'd', text: 'The equivalent resistance becomes infinite due to branch cancellation.' },
    ],
    scaffolding_hint: 'Recall the reciprocal law: 1/Req = 1/R1 + 1/R2. What happens to total conductance when another branch is added?'
  };

  const question = initialQuestion || defaultQuestion;

  const [selectedAnswer, setSelectedAnswer] = useState<string>(presetAnswer);
  const [reasoningText, setReasoningText] = useState<string>(presetReasoning);
  const [confidenceScore, setConfidenceScore] = useState<number>(0.85);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  
  // ThinkTrace Result State
  const [thinkTraceResult, setThinkTraceResult] = useState<ThinkTraceResponse | null>(null);

  // Corrective Exercise State
  const [correctiveSelectedAnswer, setCorrectiveSelectedAnswer] = useState<string>('');
  const [isSubmittingCorrective, setIsSubmittingCorrective] = useState<boolean>(false);
  const [correctiveResult, setCorrectiveResult] = useState<CorrectiveAnswerResponse | null>(null);

  // Quick preset helper for the live demo
  const loadDemoMisconception = () => {
    setSelectedAnswer('a');
    setReasoningText('The equivalent resistance increases because another resistor is added.');
    setConfidenceScore(0.85);
  };

  const handleAnalyzeReasoning = async () => {
    if (!selectedAnswer) {
      alert('Please select an answer first.');
      return;
    }
    if (!reasoningText.trim()) {
      alert('ThinkTrace requires an explanation of your reasoning to analyze understanding.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await api.analyzeThinkTrace({
        user_id: currentUserId,
        question_id: question.id,
        user_answer: selectedAnswer,
        student_reasoning: reasoningText,
        confidence_score: confidenceScore,
      });
      setThinkTraceResult(response);
      setCorrectiveResult(null);
      if (onMasteryUpdated) onMasteryUpdated();
    } catch (err: any) {
      alert('Error analyzing reasoning: ' + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmitCorrective = async () => {
    if (!correctiveSelectedAnswer || !thinkTraceResult?.corrective_exercise) {
      alert('Please select an option for the corrective exercise.');
      return;
    }

    setIsSubmittingCorrective(true);
    try {
      const response = await api.submitCorrective({
        user_id: currentUserId,
        original_concept_id: thinkTraceResult.tested_concept_id,
        corrective_question_id: thinkTraceResult.corrective_exercise.question_id,
        user_answer: correctiveSelectedAnswer,
        reasoning: 'Applied reciprocal formula 1/Req = 1/R1 + 1/R2',
      });
      setCorrectiveResult(response);
      if (response.is_correct) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
      if (onMasteryUpdated) onMasteryUpdated();
    } catch (err: any) {
      alert('Error submitting corrective: ' + err.message);
    } finally {
      setIsSubmittingCorrective(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Signature Feature Banner */}
      <div className="relative p-6 rounded-2xl bg-gradient-to-r from-navy-900 via-indigo-950/40 to-navy-900 border border-indigo-500/30 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-electric-cyan/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 tracking-wider uppercase font-mono">
                Signature AI Architecture
              </span>
              <span className="text-xs text-slate-400">&bull; Reasoning Analysis Engine</span>
            </div>
            <h2 className="text-2xl font-black text-white mt-1 flex items-center space-x-2">
              <Sparkles className="w-6 h-6 text-electric-cyan" />
              <span>THINKTRACE™ STUDIO</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              ThinkTrace analyzes <strong className="text-electric-cyan font-medium">why</strong> you chose your answer rather than judging right or wrong. It extracts cognitive errors, detects intuitive physics misconceptions, and generates real-time repairs.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={loadDemoMisconception}
              className="px-3 py-1.5 rounded-xl bg-indigo-900/60 hover:bg-indigo-800 border border-indigo-600 text-indigo-200 text-xs font-semibold flex items-center space-x-1.5 transition"
              title="Loads the parallel circuit series addition misconception for live demonstration"
            >
              <Brain className="w-4 h-4 text-cyan-400" />
              <span>Load Parallel Demo Case</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-6 shadow-xl">
        
        {/* Question Header & Meta */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
              {question.concept_title}
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300 capitalize">
              Difficulty: Level {question.difficulty}
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300 capitalize">
              Type: {question.question_type}
            </span>
          </div>

          <button
            onClick={() => setShowHint(!showHint)}
            className="flex items-center space-x-1 text-xs text-cyan-400 hover:text-cyan-300 transition"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>{showHint ? 'Hide Scaffolding Hint' : 'View Scaffolding Hint'}</span>
          </button>
        </div>

        {/* Scaffolding Hint Box */}
        {showHint && question.scaffolding_hint && (
          <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/60 text-xs text-cyan-200 flex items-start space-x-2">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>{question.scaffolding_hint}</span>
          </div>
        )}

        {/* Question Prompt */}
        <div className="text-base font-semibold text-slate-100 leading-relaxed">
          {question.prompt}
        </div>

        {/* Multiple Choice Options */}
        <div className="space-y-2.5">
          {question.options.map((opt) => {
            const isSelected = selectedAnswer === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => setSelectedAnswer(opt.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition flex items-start space-x-3 text-xs ${
                  isSelected
                    ? 'bg-cyan-950/60 border-cyan-400 text-slate-100 shadow-glow-cyan'
                    : 'bg-navy-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/50 hover:border-slate-700'
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold font-mono text-[11px] shrink-0 ${
                  isSelected ? 'bg-electric-cyan text-navy-950' : 'bg-slate-800 text-slate-400'
                }`}>
                  {opt.id.toUpperCase()}
                </div>
                <div className="leading-snug">{opt.text}</div>
              </div>
            );
          })}
        </div>

        {/* Core ThinkTrace Requirement: Explain Reasoning */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
              <Brain className="w-4 h-4 text-electric-cyan" />
              <span>Explain your reasoning (Required for ThinkTrace™ AI analysis):</span>
            </label>
            <span className="text-[11px] text-slate-400">
              {reasoningText.length} characters
            </span>
          </div>
          <textarea
            value={reasoningText}
            onChange={(e) => setReasoningText(e.target.value)}
            rows={3}
            placeholder="Explain step-by-step how you derived your answer (e.g. 'I used formula...', 'Since more resistors are added...', 'Because light bends towards...')"
            className="w-full p-3 rounded-xl bg-navy-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
          />

          {/* Confidence Calibration Slider */}
          <div className="flex items-center justify-between pt-2 text-xs">
            <span className="text-slate-400 flex items-center space-x-1">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              <span>How confident are you in this reasoning?</span>
            </span>
            <span className="font-mono font-bold text-electric-cyan">
              {Math.round(confidenceScore * 100)}% Confident
            </span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={confidenceScore}
            onChange={(e) => setConfidenceScore(parseFloat(e.target.value))}
            className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleAnalyzeReasoning}
            disabled={isAnalyzing || !selectedAnswer || !reasoningText.trim()}
            className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs shadow-glow-cyan hover:opacity-95 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Running Deep Reasoning Analysis...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-white" />
                <span>Analyze with ThinkTrace™ AI</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* ThinkTrace Intelligence Feedback Panel */}
      {thinkTraceResult && (
        <div className="p-6 rounded-2xl glass-panel-glow space-y-6 animate-in fade-in duration-300">
          
          {/* Header Evaluation Status */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              {thinkTraceResult.is_correct ? (
                <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-500 flex items-center justify-center text-emerald-400 shadow-glow-emerald">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-rose-950 border border-rose-500 flex items-center justify-center text-rose-400 shadow-glow-rose">
                  <XCircle className="w-6 h-6" />
                </div>
              )}
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-lg font-bold text-white">
                    {thinkTraceResult.is_correct ? 'Correct Scientific Reasoning' : 'Reasoning Flaw Detected'}
                  </h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-navy-900 border border-slate-700 text-cyan-400">
                    Confidence: {thinkTraceResult.classification_confidence}%
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Category: <strong className="text-amber-400 font-semibold">{thinkTraceResult.error_type}</strong>
                </p>
              </div>
            </div>

            {/* BKT Live Mastery Update Delta */}
            <div className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-navy-950 border border-slate-800">
              <div className="text-right text-xs">
                <span className="text-slate-400 block text-[10px]">BKT Concept Mastery</span>
                <div className="flex items-baseline space-x-1 font-mono">
                  <span className="text-slate-400 line-through">{thinkTraceResult.old_mastery}%</span>
                  <span className="text-slate-500">&rarr;</span>
                  <span className={`text-base font-black ${thinkTraceResult.mastery_delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {thinkTraceResult.new_mastery}%
                  </span>
                </div>
              </div>
              <div className={`px-2 py-1 rounded text-xs font-mono font-bold ${
                thinkTraceResult.mastery_delta >= 0 
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                  : 'bg-rose-950 text-rose-300 border border-rose-800'
              }`}>
                {thinkTraceResult.mastery_delta >= 0 ? `+${thinkTraceResult.mastery_delta}%` : `${thinkTraceResult.mastery_delta}%`}
              </div>
            </div>
          </div>

          {/* Misconception Diagnostic Breakdown */}
          {thinkTraceResult.misconception_detected && (
            <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/60 space-y-2">
              <div className="flex items-center space-x-2 text-rose-300 text-xs font-bold uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Detected Misconception: {thinkTraceResult.misconception_detected}</span>
              </div>
              <p className="text-xs text-rose-100/90 leading-relaxed">
                {thinkTraceResult.why_reasoning_is_incorrect}
              </p>
              {thinkTraceResult.prerequisite_impacted && (
                <div className="pt-2 text-[11px] text-amber-300 flex items-center space-x-1">
                  <span>&bull; Prerequisite impact: Propagated deficit to prerequisite &quot;{thinkTraceResult.prerequisite_impacted}&quot;.</span>
                </div>
              )}
            </div>
          )}

          {/* Correct Scientific Explanation */}
          <div className="p-4 rounded-xl bg-navy-900/80 border border-slate-800 space-y-1.5 text-xs">
            <h5 className="font-bold text-electric-cyan flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-electric-cyan" />
              <span>Correct Physical Law & Explanation</span>
            </h5>
            <p className="text-slate-300 leading-relaxed">
              {thinkTraceResult.correct_scientific_explanation}
            </p>
            {thinkTraceResult.short_intervention && (
              <div className="mt-2 p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-800/50 text-[11px] text-indigo-200">
                <strong className="text-indigo-400">Intuition Anchor: </strong>
                {thinkTraceResult.short_intervention}
              </div>
            )}
          </div>

          {/* Corrective Exercise (Step 7 in Workflow) */}
          {thinkTraceResult.corrective_exercise && !correctiveResult?.is_correct && (
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
                    Personalized Corrective Intervention
                  </span>
                  <h4 className="text-sm font-bold text-white mt-0.5">
                    Repair Exercise: Test Your Understanding
                  </h4>
                </div>
                <span className="text-xs text-slate-400">1 Question Scaffolded</span>
              </div>

              <div className="p-4 rounded-xl bg-navy-900/90 border border-slate-700 space-y-3">
                <p className="text-xs font-semibold text-slate-100">
                  {thinkTraceResult.corrective_exercise.prompt}
                </p>

                <div className="space-y-2">
                  {thinkTraceResult.corrective_exercise.options.map((opt) => (
                    <div
                      key={opt.id}
                      onClick={() => setCorrectiveSelectedAnswer(opt.id)}
                      className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-center space-x-2 transition ${
                        correctiveSelectedAnswer === opt.id
                          ? 'bg-emerald-950 border-emerald-500 text-white shadow-glow-emerald'
                          : 'bg-navy-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center font-mono text-[10px] text-cyan-400">
                        {opt.id.toUpperCase()}
                      </span>
                      <span>{opt.text}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-slate-400 italic">
                    Hint: {thinkTraceResult.corrective_exercise.scaffolding_hint}
                  </span>
                  <button
                    onClick={handleSubmitCorrective}
                    disabled={isSubmittingCorrective || !correctiveSelectedAnswer}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-navy-950 font-bold text-xs shadow-glow-emerald hover:opacity-95 transition disabled:opacity-40"
                  >
                    {isSubmittingCorrective ? 'Verifying...' : 'Submit Corrective Answer'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Corrective Success Message (Step 8 & 9 & 10) */}
          {correctiveResult && (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/60 space-y-3 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Misconception Overwritten & Repaired!</span>
                </div>
                <div className="flex items-center space-x-2 text-xs font-mono text-emerald-300">
                  <span>Mastery upgraded to: </span>
                  <span className="font-bold text-white bg-emerald-900 px-2 py-0.5 rounded">
                    {correctiveResult.new_mastery}%
                  </span>
                </div>
              </div>
              <p className="text-xs text-emerald-100/90 leading-relaxed">
                {correctiveResult.feedback}
              </p>
              <div className="flex items-center space-x-2 text-xs text-cyan-300 pt-2 border-t border-emerald-800/60">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span>Spaced Repetition Scheduler: Scheduled review for <strong>{correctiveResult.scheduled_revision_date}</strong>.</span>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
