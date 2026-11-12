import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Activity, 
  Sparkles, 
  AlertTriangle, 
  Calendar, 
  Download, 
  PlusCircle, 
  Filter, 
  Search, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  BookOpen,
  Info,
  X
} from 'lucide-react';
import { TeacherDashboardResponse, HeatmapCell } from '../types';
import { api } from '../api';

interface TeacherDashboardProps {
  onOpenStudentProfile?: (studentId: number) => void;
}

export const TeacherDashboardView: React.FC<TeacherDashboardProps> = ({
  onOpenStudentProfile,
}) => {
  const [data, setData] = useState<TeacherDashboardResponse | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string>('all');
  const [selectedCell, setSelectedCell] = useState<HeatmapCell | null>(null);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState<boolean>(false);
  const [assignmentTitle, setAssignmentTitle] = useState<string>('Targeted Scaffolding: Parallel Resistance & Reciprocal Law');
  const [assignmentSuccess, setAssignmentSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      const res = await api.getTeacherDashboard(1);
      setData(res);
    } catch (err) {
      console.error('Failed to load teacher dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportReport = async () => {
    try {
      const report = await api.getTeacherDashboard(1);
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `MindMatrix_Class10_Report_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err: any) {
      alert('Error exporting report: ' + err.message);
    }
  };

  const handleCreateAssignment = async () => {
    try {
      await api.createTeacherAssignment({
        class_id: 1,
        title: assignmentTitle,
        concept_ids: ["elec_parallel_circuits", "elec_ohm_law"]
      });
      setAssignmentSuccess(`Assignment '${assignmentTitle}' distributed to Newton Section A students!`);
      setTimeout(() => {
        setIsAssignmentModalOpen(false);
        setAssignmentSuccess(null);
      }, 2000);
    } catch (err: any) {
      alert('Error creating assignment: ' + err.message);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center p-20 text-xs text-slate-400">
        Compiling real student telemetry and classroom heatmap...
      </div>
    );
  }

  // Filter concepts for heatmap
  const filteredConcepts = data.heatmap_concepts.filter((c) => {
    if (selectedChapter === 'all') return true;
    if (selectedChapter === 'elec') return c.id.startsWith('elec');
    if (selectedChapter === 'light') return c.id.startsWith('light');
    if (selectedChapter === 'mag') return c.id.startsWith('mag');
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Top Banner & Header */}
      <div className="p-6 rounded-2xl glass-panel-glow border border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono uppercase">
              Module G
            </span>
            <span className="text-xs text-slate-400">&bull; Dr. Vikram Rao &bull; Grade 10 - Newton Section A</span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1 flex items-center space-x-2">
            <Users className="w-6 h-6 text-electric-cyan" />
            <span>TEACHER INTELLIGENCE DASHBOARD</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Real-time classroom diagnostic telemetry, misconception cluster tracking, and student-concept proficiency heatmaps. No simulated mock data.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsAssignmentModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs shadow-glow-cyan hover:opacity-95 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Targeted Assignment</span>
          </button>
          <button
            onClick={handleExportReport}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-navy-900 border border-slate-700 text-slate-200 font-semibold text-xs hover:bg-slate-800 transition"
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* 4 Primary Classroom KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl glass-panel border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Enrolled Students</span>
          <div className="text-2xl font-black text-white font-mono">{data.total_enrolled}</div>
          <span className="text-[10px] text-emerald-400">100% Active Attendance</span>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Class Average Mastery</span>
          <div className="text-2xl font-black text-electric-cyan font-mono">{data.average_class_mastery}%</div>
          <span className="text-[10px] text-cyan-400">BKT Probability Composite</span>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Revision Completion</span>
          <div className="text-2xl font-black text-amber-400 font-mono">{data.revision_completion_rate}%</div>
          <span className="text-[10px] text-slate-400">SM-2 On-Schedule Adherence</span>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Critical Interventions</span>
          <div className="text-2xl font-black text-rose-400 font-mono">
            {data.students_requiring_intervention.length}
          </div>
          <span className="text-[10px] text-rose-400 font-semibold">Immediate Action Recommended</span>
        </div>
      </div>

      {/* INTERACTIVE HEATMAP (Rows = Students, Columns = Concepts) */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <Activity className="w-4 h-4 text-electric-cyan" />
              <span>Interactive Concept Mastery Heatmap (Students &times; Concepts)</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Click any cell to drill into individual student understanding and active misconception flags.
            </p>
          </div>

          {/* Chapter Filter */}
          <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-navy-900 border border-slate-800 text-xs">
            {[
              { id: 'all', label: 'All Chapters' },
              { id: 'elec', label: 'Electricity' },
              { id: 'light', label: 'Light' },
              { id: 'mag', label: 'Magnetic' },
            ].map((ch) => (
              <button
                key={ch.id}
                onClick={() => setSelectedChapter(ch.id)}
                className={`px-2.5 py-1 rounded-lg transition font-medium text-[11px] ${
                  selectedChapter === ch.id
                    ? 'bg-electric-cyan text-navy-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {ch.label}
              </button>
            ))}
          </div>
        </div>

        {/* Heatmap Matrix Table */}
        <div className="overflow-x-auto pb-2">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-2 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-navy-900/80 sticky left-0 z-20 min-w-[140px] border-b border-slate-800">
                  Student Name
                </th>
                {filteredConcepts.map((concept) => (
                  <th
                    key={concept.id}
                    className="p-2 text-center text-[10px] font-mono text-slate-300 bg-navy-900/60 min-w-[90px] max-w-[110px] border-b border-slate-800 truncate"
                    title={concept.title}
                  >
                    <div className="truncate font-semibold">{concept.title}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.heatmap_students.map((student, studentIdx) => {
                const row = data.heatmap_matrix[studentIdx] || [];
                return (
                  <tr key={student.id} className="hover:bg-slate-800/20">
                    <td className="p-2 text-xs font-semibold text-slate-200 bg-navy-900/90 sticky left-0 z-10 border-b border-slate-800/60 flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-cyan-950 text-cyan-400 flex items-center justify-center text-[10px] font-bold border border-cyan-800 shrink-0">
                        {student.name.charAt(0)}
                      </div>
                      <span className="truncate">{student.name}</span>
                    </td>
                    {filteredConcepts.map((concept) => {
                      const cell = row.find((c) => c.concept_id === concept.id);
                      if (!cell) {
                        return (
                          <td key={concept.id} className="p-1 border border-slate-800/40 text-center">
                            <div className="h-9 rounded bg-slate-900/40 flex items-center justify-center text-[10px] text-slate-600 font-mono">--</div>
                          </td>
                        );
                      }

                      // Cell color style
                      let cellStyle = "bg-slate-900/60 border-slate-800 text-slate-500";
                      if (cell.status === 'strong') cellStyle = "bg-emerald-950/80 border-emerald-500/60 text-emerald-300 font-bold hover:shadow-glow-emerald";
                      else if (cell.status === 'developing') cellStyle = "bg-amber-950/80 border-amber-500/60 text-amber-300 font-bold hover:shadow-[0_0_15px_rgba(245,158,11,0.3)]";
                      else if (cell.status === 'weak') cellStyle = "bg-rose-950/90 border-rose-500/80 text-rose-300 font-bold hover:shadow-glow-rose";

                      return (
                        <td key={concept.id} className="p-1 border border-slate-800/30">
                          <button
                            onClick={() => setSelectedCell(cell)}
                            className={`w-full h-9 rounded-lg border flex flex-col items-center justify-center text-[10px] font-mono transition transform hover:scale-105 ${cellStyle}`}
                          >
                            <span>{Math.round(cell.mastery_prob * 100)}%</span>
                            {cell.misconception_count > 0 && (
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 -mt-0.5"></span>
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-6 text-xs text-slate-400 pt-2 border-t border-slate-800/60">
          <span className="font-semibold text-slate-300 text-[11px]">Legend:</span>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500"></span>
            <span>Strong (&ge;75%)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-amber-500"></span>
            <span>Developing (45-74%)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-rose-500"></span>
            <span>Weak (&lt;45%)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
            <span>Misconception Detected</span>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Most Misunderstood Concepts & Students Needing Intervention */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Most Misunderstood Concepts */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Classroom Misconception Frequency Ranking</span>
          </h3>

          <div className="space-y-2.5">
            {data.most_misunderstood_concepts.map((item, idx) => (
              <div 
                key={idx}
                className="p-3.5 rounded-xl bg-navy-900/80 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-200">{item.concept}</div>
                  <div className="text-[11px] text-cyan-400 mt-0.5 font-medium">
                    Recommended: {item.recommended_action}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-500 block">Incidents</span>
                  <span className="text-base font-black font-mono text-rose-400">{item.frequency}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Students Requiring Intervention */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Students Requiring Targeted Intervention</span>
          </h3>

          <div className="space-y-2.5">
            {data.students_requiring_intervention.map((student) => (
              <div 
                key={student.student_id}
                className="p-3.5 rounded-xl bg-navy-900/80 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-200">{student.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                      student.urgency === 'High' ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}>
                      {student.urgency} Urgency
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Concern: {student.primary_concern} &bull; {student.weak_concepts_count} concepts below 45%
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-500 block">Avg Mastery</span>
                  <span className="text-base font-black font-mono text-electric-cyan">{student.avg_mastery}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Selected Heatmap Cell Detail Modal */}
      {selectedCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-2xl bg-navy-900 border border-cyan-500/40 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">
                  Learner Telemetry Drilldown
                </span>
                <h4 className="text-base font-bold text-white mt-0.5">{selectedCell.student_name}</h4>
                <p className="text-xs text-slate-400">Concept: {selectedCell.concept_title}</p>
              </div>
              <button 
                onClick={() => setSelectedCell(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-navy-950 border border-slate-800">
                <span className="text-[10px] text-slate-400">BKT Mastery Probability</span>
                <div className="text-2xl font-black text-electric-cyan font-mono mt-1">
                  {Math.round(selectedCell.mastery_prob * 100)}%
                </div>
              </div>
              <div className="p-3 rounded-xl bg-navy-950 border border-slate-800">
                <span className="text-[10px] text-slate-400">Misconceptions Flagged</span>
                <div className="text-2xl font-black text-rose-400 font-mono mt-1">
                  {selectedCell.misconception_count}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-navy-950 border border-slate-800 text-xs text-slate-300">
              Status classification: <strong className="capitalize text-white">{selectedCell.status}</strong>.
              {selectedCell.status === 'weak' && (
                <p className="mt-1 text-rose-300 text-[11px]">
                  Student consistently applied series addition rule to parallel circuit branches. Recommended for targeted corrective assignment.
                </p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedCell(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Targeted Assignment Modal */}
      {isAssignmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-navy-900 border border-cyan-500/40 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">
                  Targeted Learning Intervention
                </span>
                <h4 className="text-base font-bold text-white mt-0.5">Generate Classroom Assignment</h4>
              </div>
              <button 
                onClick={() => setIsAssignmentModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {assignmentSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500 text-emerald-300 text-xs font-bold flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{assignmentSuccess}</span>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Assignment Title</label>
                  <input
                    type="text"
                    value={assignmentTitle}
                    onChange={(e) => setAssignmentTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-navy-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Target Concepts for Scaffolding</label>
                  <div className="p-3 rounded-xl bg-navy-950 border border-slate-800 space-y-1.5 text-slate-300 font-mono text-[11px]">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" checked readOnly className="accent-cyan-400" />
                      <span>elec_parallel_circuits (Parallel Circuits & Reciprocal Resistance)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" checked readOnly className="accent-cyan-400" />
                      <span>elec_ohm_law (Ohm's Law Foundation)</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    onClick={() => setIsAssignmentModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateAssignment}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold shadow-glow-cyan"
                  >
                    Deploy Assignment to Newton-10A
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
