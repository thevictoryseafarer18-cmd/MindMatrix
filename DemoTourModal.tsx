import React, { useState } from 'react';
import { 
  PlayCircle, 
  CheckCircle2, 
  ArrowRight, 
  RotateCcw, 
  Sparkles, 
  Brain, 
  Activity, 
  Users, 
  Clock, 
  X,
  Zap,
  ChevronRight
} from 'lucide-react';
import { api } from '../api';

interface DemoTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab: (tab: string, extras?: any) => void;
  onResetDemo: () => void;
  currentUserId: number;
}

export const DemoTourModal: React.FC<DemoTourModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
  onResetDemo,
  currentUserId,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isExecutingStep, setIsExecutingStep] = useState<boolean>(false);

  if (!isOpen) return null;

  const demoSteps = [
    {
      step: 1,
      title: "Diagnostic Test Completion",
      description: "Student completes an initial Class 10 Physics diagnostic covering Electricity, Optics, and Magnetism.",
      actionLabel: "View Diagnostic Results (Module A)",
      targetTab: "diagnostic",
      aiAction: "Evaluates multi-format answers without treating single guesses as mastery."
    },
    {
      step: 2,
      title: "Initial Concept Mastery Calculation",
      description: "Bayesian Knowledge Tracing calculates prior concept mastery probabilities across the 18 knowledge nodes.",
      actionLabel: "Inspect Concept Knowledge Graph (Module B)",
      targetTab: "graph",
      aiAction: "Color-codes nodes: Green (Mastered >=75%), Yellow (Developing 45-74%), Red (Needs Attention <45%)."
    },
    {
      step: 3,
      title: "Incorrect Parallel-Resistance Attempt",
      description: "Student answers a parallel circuit question with Option A (Equivalent resistance increases).",
      actionLabel: "Open ThinkTrace Question (Module C & D)",
      targetTab: "thinktrace",
      aiAction: "Captures answer, response time, and confidence rating (85%)."
    },
    {
      step: 4,
      title: "Student Explains Natural Reasoning",
      description: "Student enters reasoning: 'The equivalent resistance increases because another resistor is added.'",
      actionLabel: "Analyze Reasoning in ThinkTrace Studio",
      targetTab: "thinktrace",
      aiAction: "Transfers natural language explanation to ThinkTrace semantic reasoning engine."
    },
    {
      step: 5,
      title: "ThinkTrace Misconception Identification",
      description: "ThinkTrace matches taxonomy and detects: 'Confusing series and parallel resistance behavior' (96% Confidence).",
      actionLabel: "View Misconception Diagnostics",
      targetTab: "thinktrace",
      aiAction: "Explains why reasoning is flawed: parallel paths add conductance, decreasing net resistance."
    },
    {
      step: 6,
      title: "BKT Learner Model & Prerequisite Update",
      description: "Bayesian Knowledge Tracing updates parallel circuit mastery downward (35% -> 23%) and propagates weakness to prerequisites.",
      actionLabel: "Inspect BKT Mastery Delta & Learning DNA",
      targetTab: "dna",
      aiAction: "Logs audit record in database history and reduces prerequisite credit."
    },
    {
      step: 7,
      title: "Personalized Corrective Question Generation",
      description: "AI Question Generator produces a scaffolded corrective problem (Two 10 Ω resistors in parallel).",
      actionLabel: "View Corrective Question in ThinkTrace",
      targetTab: "thinktrace",
      aiAction: "Provides scaffolding hint: 'Use 1/Req = 1/R1 + 1/R2. Req is strictly smaller than individual resistors.'"
    },
    {
      step: 8,
      title: "Student Answers Corrective Question",
      description: "Student applies the reciprocal rule and selects 5 Ω (Option B).",
      actionLabel: "Submit Corrective Answer",
      targetTab: "thinktrace",
      aiAction: "Verifies conceptual repair and validates mathematical execution."
    },
    {
      step: 9,
      title: "Mastery Updates on New Evidence",
      description: "BKT incorporates corrective success evidence, elevating parallel circuit mastery (23% -> 55%).",
      actionLabel: "Observe Post-Repair Mastery",
      targetTab: "thinktrace",
      aiAction: "Marks misconception as repaired in student cognitive model."
    },
    {
      step: 10,
      title: "Spaced Repetition Schedule Reactivated",
      description: "SM-2 spaced revision engine schedules concept review in 24 hours to reinforce neural pathway.",
      actionLabel: "Inspect Spaced Repetition Calendar (Module F)",
      targetTab: "spaced-repetition",
      aiAction: "Sets SM-2 interval = 1.0 day, recalculating retention stability index."
    },
    {
      step: 11,
      title: "Teacher Dashboard Reflects Live Performance",
      description: "Dr. Rao's classroom heatmap and misconception frequency counters update instantly from real stored data.",
      actionLabel: "Switch to Teacher Intelligence Dashboard (Module G)",
      targetTab: "teacher-heatmap",
      aiAction: "Displays live Aarav Sharma cell update, class mastery shift, and intervention alerts."
    }
  ];

  const current = demoSteps[currentStep - 1];

  const handleExecuteCurrentStep = async () => {
    setIsExecutingStep(true);
    try {
      // Direct navigation and action for each step
      if (currentStep === 1) {
        onNavigateToTab('diagnostic');
      } else if (currentStep === 2) {
        onNavigateToTab('graph', { highlight: 'elec_parallel_circuits' });
      } else if (currentStep === 3) {
        onNavigateToTab('thinktrace', { preset: 'parallel_incorrect' });
      } else if (currentStep === 4 || currentStep === 5) {
        onNavigateToTab('thinktrace', { preset: 'parallel_analyze' });
      } else if (currentStep === 6) {
        onNavigateToTab('dna');
      } else if (currentStep === 7 || currentStep === 8 || currentStep === 9) {
        onNavigateToTab('thinktrace');
      } else if (currentStep === 10) {
        onNavigateToTab('spaced-repetition');
      } else if (currentStep === 11) {
        onNavigateToTab('teacher-heatmap');
      }
    } finally {
      setIsExecutingStep(false);
    }
  };

  const handleNextStep = () => {
    if (currentStep < 11) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-md">
      <div className="w-full max-w-4xl max-h-[90vh] rounded-3xl bg-navy-900 border border-cyan-500/40 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-5 bg-navy-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5 flex items-center justify-center shadow-glow-cyan">
              <div className="w-full h-full bg-navy-950 rounded-[10px] flex items-center justify-center">
                <PlayCircle className="w-5 h-5 text-electric-cyan" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">MINDMATRIX AI &bull; 11-Step Live Verification Tour</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
                  Section 11 Compliance
                </span>
              </div>
              <p className="text-xs text-slate-400">Step-by-step end-to-end live demonstration of adaptive cognitive modeling</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                onResetDemo();
                setCurrentStep(1);
              }}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-navy-900 hover:bg-navy-800 border border-slate-800 text-slate-300 text-xs transition"
              title="Reset state back to baseline Step 1"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Reset State</span>
            </button>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 11 Steps Stepper Horizontal Track */}
        <div className="p-3 bg-navy-950/60 border-b border-slate-800/80 overflow-x-auto no-scrollbar">
          <div className="flex items-center space-x-2 min-w-max px-2">
            {demoSteps.map((s) => {
              const isCurrent = s.step === currentStep;
              const isPast = s.step < currentStep;
              return (
                <button
                  key={s.step}
                  onClick={() => setCurrentStep(s.step)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition ${
                    isCurrent
                      ? 'bg-electric-cyan text-navy-950 font-black shadow-glow-cyan'
                      : isPast
                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                      : 'bg-navy-900/60 text-slate-500 border border-slate-800/60'
                  }`}
                >
                  <span className="font-bold">Step {s.step}</span>
                  {isPast && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Step Showcase Card */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
            
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-widest text-electric-cyan font-bold">
                Verification Phase &bull; Step {current.step} of 11
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-navy-900 text-slate-300 border border-slate-700">
                Target: {current.targetTab.toUpperCase()}
              </span>
            </div>

            <h2 className="text-xl font-black text-white">{current.title}</h2>
            
            <p className="text-sm text-slate-200 leading-relaxed bg-navy-950/80 p-4 rounded-xl border border-slate-800">
              {current.description}
            </p>

            <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 space-y-1">
              <strong className="text-cyan-400 flex items-center space-x-1.5">
                <Brain className="w-4 h-4 text-cyan-400" />
                <span>Under The Hood Cognitive Architecture:</span>
              </strong>
              <p className="leading-relaxed pl-5">{current.aiAction}</p>
            </div>

            {/* Step Action Button */}
            <div className="pt-2 flex justify-start">
              <button
                onClick={handleExecuteCurrentStep}
                disabled={isExecutingStep}
                className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs shadow-glow-cyan hover:opacity-95 transition"
              >
                <span>{current.actionLabel}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

        {/* Stepper Footer Controls */}
        <div className="p-4 bg-navy-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handlePrevStep}
            disabled={currentStep === 1}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Previous Step
          </button>

          <span className="text-xs font-mono text-slate-400">
            Step <strong className="text-white">{currentStep}</strong> / 11
          </span>

          <button
            onClick={handleNextStep}
            disabled={currentStep === 11}
            className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-electric-cyan text-navy-950 text-xs font-bold shadow-glow-cyan hover:opacity-95 transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <span>Next Step</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
