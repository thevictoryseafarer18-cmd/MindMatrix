import React, { useState } from 'react';
import { 
  Brain, 
  Sparkles, 
  Send, 
  X, 
  MessageSquare, 
  Lightbulb, 
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { api } from '../api';

interface AICoachModalProps {
  currentUserId: number;
  isOpen: boolean;
  onClose: () => void;
  activeConceptId?: string;
}

export const AICoachModal: React.FC<AICoachModalProps> = ({
  currentUserId,
  isOpen,
  onClose,
  activeConceptId,
}) => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'coach'; content: string; tip?: string }>>([
    {
      role: 'coach',
      content: "Hello Aarav! I am your MINDMATRIX AI Learning Coach. I have your Class 10 Physics mastery trajectory loaded. How can I assist your understanding today?",
      tip: "Tip: Ask why physical laws behave counter-intuitively!"
    }
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSend = async (msgText?: string) => {
    const textToSend = msgText || inputMessage;
    if (!textToSend.trim() || isSending) return;

    const userMsg = textToSend;
    setInputMessage('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setIsSending(true);

    try {
      const res = await api.sendCoachMessage(currentUserId, userMsg, activeConceptId);
      setMessages((prev) => [
        ...prev,
        {
          role: 'coach',
          content: res.reply,
          tip: res.coaching_tip,
        }
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'coach',
          content: "I ran into an issue connecting to the AI brain, but remember: in parallel circuits, adding resistors opens new branches, which always reduces equivalent resistance!"
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const samplePrompts = [
    "Why does equivalent resistance decrease in parallel?",
    "Why does covering a mirror not change its focal length?",
    "What is the difference between Fleming's Left and Right hand rules?",
    "Can two magnetic field lines ever cross?"
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] h-[540px] rounded-2xl glass-panel-glow border border-cyan-500/40 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
      
      {/* Coach Header */}
      <div className="p-3.5 bg-navy-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5 flex items-center justify-center">
            <div className="w-full h-full bg-navy-950 rounded-[6px] flex items-center justify-center">
              <Brain className="w-4 h-4 text-electric-cyan" />
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-100 flex items-center space-x-1">
              <span>MINDMATRIX AI Coach</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            </h4>
            <p className="text-[10px] text-cyan-400">Aware of your mastery & misconceptions</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Message Chat Feed */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-3 text-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`p-3 rounded-xl max-w-[85%] leading-relaxed ${
                m.role === 'user'
                  ? 'bg-electric-cyan text-navy-950 font-medium rounded-br-none'
                  : 'bg-navy-900/90 border border-slate-800 text-slate-200 rounded-bl-none shadow'
              }`}
            >
              {m.content}
            </div>
            {m.tip && (
              <div className="mt-1 max-w-[85%] p-2 rounded-lg bg-indigo-950/60 border border-indigo-800 text-[10px] text-indigo-300 flex items-start space-x-1">
                <Lightbulb className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span>{m.tip}</span>
              </div>
            )}
          </div>
        ))}
        {isSending && (
          <div className="flex items-center space-x-2 text-slate-400 text-xs">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            <span>Consulting learner model & pedagogical rules...</span>
          </div>
        )}
      </div>

      {/* Quick Prompt Chips */}
      <div className="px-3 py-1.5 bg-navy-950/60 border-t border-slate-800/60 flex items-center space-x-1.5 overflow-x-auto no-scrollbar text-[10px]">
        {samplePrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => handleSend(p)}
            className="px-2 py-1 rounded-lg bg-navy-900 border border-slate-800 text-slate-400 hover:text-cyan-300 hover:border-cyan-500 whitespace-nowrap transition"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3 bg-navy-900 border-t border-slate-800 flex items-center space-x-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask a question about Class 10 Physics..."
          className="flex-1 bg-navy-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
        />
        <button
          onClick={() => handleSend()}
          disabled={!inputMessage.trim() || isSending}
          className="p-2 rounded-xl bg-electric-cyan text-navy-950 hover:opacity-90 disabled:opacity-40 transition shadow-glow-cyan"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
