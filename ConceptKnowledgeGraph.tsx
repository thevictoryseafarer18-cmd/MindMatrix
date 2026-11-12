import React, { useState, useMemo, useRef } from 'react';
import { 
  ConceptGraphNode, 
  ConceptGraphEdge 
} from '../types';
import { 
  Zap, 
  Eye, 
  Compass, 
  Search, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Sparkles, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  BookOpen,
  Info,
  X
} from 'lucide-react';

interface KnowledgeGraphProps {
  nodes: ConceptGraphNode[];
  edges: ConceptGraphEdge[];
  overallMastery: number;
  onSelectConceptToPractice?: (conceptId: string) => void;
  highlightConceptId?: string;
}

export const ConceptKnowledgeGraph: React.FC<KnowledgeGraphProps> = ({
  nodes,
  edges,
  overallMastery,
  onSelectConceptToPractice,
  highlightConceptId,
}) => {
  const [selectedChapter, setSelectedChapter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedNode, setSelectedNode] = useState<ConceptGraphNode | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 40, y: 30 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  // Filter nodes based on chapter and search query
  const filteredNodes = useMemo(() => {
    return nodes.filter((n) => {
      const matchesChapter = 
        selectedChapter === 'all' || 
        (selectedChapter === 'elec' && n.chapter_code === 'CH_ELEC') ||
        (selectedChapter === 'light' && n.chapter_code === 'CH_LIGHT') ||
        (selectedChapter === 'mag' && n.chapter_code === 'CH_MAG');
      const matchesSearch = 
        searchQuery === '' || 
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesChapter && matchesSearch;
    });
  }, [nodes, selectedChapter, searchQuery]);

  // Node Map for edge rendering
  const nodeMap = useMemo(() => {
    const map = new Map<string, ConceptGraphNode>();
    nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [nodes]);

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.interactive-node')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Status Color Helper
  const getNodeColor = (status: string) => {
    switch (status) {
      case 'mastered':
        return {
          bg: 'bg-emerald-950/80',
          border: 'border-emerald-500',
          text: 'text-emerald-400',
          shadow: 'shadow-glow-emerald',
          dot: 'bg-emerald-400',
          label: 'Mastered'
        };
      case 'developing':
        return {
          bg: 'bg-amber-950/80',
          border: 'border-amber-500',
          text: 'text-amber-400',
          shadow: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]',
          dot: 'bg-amber-400',
          label: 'Developing'
        };
      case 'needs_attention':
        return {
          bg: 'bg-rose-950/90',
          border: 'border-rose-500',
          text: 'text-rose-400',
          shadow: 'shadow-glow-rose',
          dot: 'bg-rose-500',
          label: 'Needs Attention'
        };
      default:
        return {
          bg: 'bg-slate-900/60',
          border: 'border-slate-700',
          text: 'text-slate-400',
          shadow: '',
          dot: 'bg-slate-500',
          label: 'Not Attempted'
        };
    }
  };

  // Chapter Icon
  const getChapterIcon = (code: string) => {
    if (code === 'CH_ELEC') return <Zap className="w-3.5 h-3.5 text-cyan-400" />;
    if (code === 'CH_LIGHT') return <Eye className="w-3.5 h-3.5 text-amber-400" />;
    return <Compass className="w-3.5 h-3.5 text-indigo-400" />;
  };

  return (
    <div className="relative w-full h-[720px] rounded-2xl border border-slate-800 bg-navy-950 overflow-hidden flex flex-col select-none">
      
      {/* Top Toolbar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        
        {/* Chapter Filter Pills */}
        <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-navy-900/90 backdrop-blur-md border border-slate-800 pointer-events-auto shadow-lg text-xs">
          {[
            { id: 'all', label: 'All Chapters (18 Concepts)', icon: null },
            { id: 'elec', label: 'Electricity (7)', icon: Zap },
            { id: 'light', label: 'Light & Optics (6)', icon: Eye },
            { id: 'mag', label: 'Magnetic Effects (5)', icon: Compass },
          ].map((ch) => {
            const Icon = ch.icon;
            return (
              <button
                key={ch.id}
                onClick={() => setSelectedChapter(ch.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition font-medium ${
                  selectedChapter === ch.id
                    ? 'bg-electric-cyan text-navy-950 font-bold shadow-glow-cyan'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{ch.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search & Zoom Controls */}
        <div className="flex items-center space-x-2 pointer-events-auto">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search concept..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl bg-navy-900/90 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition w-44"
            />
          </div>

          {/* Zoom Buttons */}
          <div className="flex items-center space-x-1 p-1 rounded-xl bg-navy-900/90 border border-slate-800 text-slate-300">
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.6, z + 0.1))}
              className="p-1 hover:bg-slate-800 rounded-lg transition"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-mono px-1 text-cyan-400">{Math.round(zoomLevel * 100)}%</span>
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.1))}
              className="p-1 hover:bg-slate-800 rounded-lg transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setZoomLevel(1); setPanOffset({ x: 40, y: 30 }); }}
              className="p-1 hover:bg-slate-800 rounded-lg transition"
              title="Reset View"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Color Legend (Bottom Left) */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center space-x-4 px-3 py-2 rounded-xl bg-navy-900/90 backdrop-blur-md border border-slate-800 text-xs">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Legend:</span>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-glow-emerald"></span>
          <span className="text-slate-300 text-[11px]">Mastered (&ge;75%)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
          <span className="text-slate-300 text-[11px]">Developing (45-74%)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-glow-rose animate-pulse"></span>
          <span className="text-slate-300 text-[11px]">Needs Attention (&lt;45%)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-600"></span>
          <span className="text-slate-400 text-[11px]">Not Attempted</span>
        </div>
      </div>

      {/* Main Graph Canvas */}
      <div 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className={`w-full h-full cursor-grab ${isDragging ? 'cursor-grabbing' : ''} bg-grid-pattern relative overflow-hidden`}
      >
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
            transformOrigin: '0 0',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
        >
          <defs>
            <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f5ff" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.4" />
            </linearGradient>
            <marker
              id="arrowhead"
              markerWidth="8"
              markerHeight="6"
              refX="10"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#00f5ff" opacity="0.7" />
            </marker>
          </defs>

          {/* Render Graph Edges (Prerequisites) */}
          {edges.map((edge) => {
            const sourceNode = nodeMap.get(edge.source);
            const targetNode = nodeMap.get(edge.target);
            if (!sourceNode || !targetNode) return null;

            // Compute curved bezier path
            const x1 = sourceNode.node_x + 90;
            const y1 = sourceNode.node_y + 35;
            const x2 = targetNode.node_x + 90;
            const y2 = targetNode.node_y + 35;

            const dx = x2 - x1;
            const dy = y2 - y1;
            const cx1 = x1 + dx * 0.5;
            const cy1 = y1;
            const cx2 = x1 + dx * 0.5;
            const cy2 = y2;

            const isHighlighted = 
              (selectedNode && (selectedNode.id === edge.source || selectedNode.id === edge.target)) ||
              (highlightConceptId && (highlightConceptId === edge.source || highlightConceptId === edge.target));

            return (
              <g key={edge.id}>
                <path
                  d={`M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`}
                  fill="none"
                  stroke={isHighlighted ? "#00f5ff" : "rgba(100, 116, 139, 0.35)"}
                  strokeWidth={isHighlighted ? "2.5" : "1.5"}
                  strokeDasharray={isHighlighted ? "none" : "4 4"}
                  markerEnd="url(#arrowhead)"
                  className="transition-all duration-300"
                />
              </g>
            );
          })}
        </svg>

        {/* Nodes Layer */}
        <div
          className="absolute inset-0 pointer-events-auto"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
            transformOrigin: '0 0',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
        >
          {filteredNodes.map((node) => {
            const style = getNodeColor(node.status);
            const isSelected = selectedNode?.id === node.id;
            const isHighlighted = highlightConceptId === node.id;

            return (
              <div
                key={node.id}
                onClick={() => setSelectedNode(node)}
                style={{
                  left: `${node.node_x}px`,
                  top: `${node.node_y}px`,
                  width: '180px',
                }}
                className={`interactive-node absolute p-3 rounded-xl border backdrop-blur-md cursor-pointer transition-all duration-200 ${style.bg} ${style.border} ${style.shadow} ${
                  isSelected || isHighlighted 
                    ? 'ring-2 ring-electric-cyan scale-105 z-30' 
                    : 'hover:scale-102 hover:border-cyan-400 z-10'
                }`}
              >
                {/* Node Chapter & Status Indicator */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-1 text-[10px] text-slate-400">
                    {getChapterIcon(node.chapter_code)}
                    <span className="truncate max-w-[90px]">{node.chapter_title.split(' ')[0]}</span>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${style.dot} ${node.status === 'needs_attention' ? 'animate-ping' : ''}`}></span>
                </div>

                {/* Concept Title */}
                <h4 className="text-xs font-bold text-slate-100 truncate mb-2">
                  {node.title}
                </h4>

                {/* Mastery Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Mastery</span>
                    <span className={`font-mono font-bold ${style.text}`}>
                      {node.status === 'not_attempted' ? '--' : `${Math.round(node.mastery_prob * 100)}%`}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        node.status === 'mastered' ? 'bg-emerald-400' :
                        node.status === 'developing' ? 'bg-amber-400' :
                        node.status === 'needs_attention' ? 'bg-rose-500' : 'bg-slate-600'
                      }`}
                      style={{ width: `${Math.max(5, node.mastery_prob * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Prerequisite Tags */}
                {node.prerequisites.length > 0 && (
                  <div className="mt-2 flex items-center space-x-1 text-[9px] text-slate-400">
                    <span className="text-cyan-400 font-mono">Prereq:</span>
                    <span className="truncate">{node.prerequisites.length} links</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* Node Detail Drawer (Right side slide-in) */}
      {selectedNode && (
        <div className="absolute top-0 right-0 w-96 h-full bg-navy-900/95 backdrop-blur-2xl border-l border-slate-800 p-5 z-40 overflow-y-auto shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
          <div>
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">
                  {selectedNode.chapter_title}
                </span>
                <h3 className="text-lg font-bold text-slate-100 mt-0.5">{selectedNode.title}</h3>
                <span className="text-[11px] font-mono text-slate-500">ID: {selectedNode.id}</span>
              </div>
              <button 
                onClick={() => setSelectedNode(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mastery & BKT Stats */}
            <div className="grid grid-cols-2 gap-3 my-4">
              <div className="p-3 rounded-xl bg-navy-800/80 border border-slate-700/80">
                <span className="text-[11px] text-slate-400">BKT Mastery Prob</span>
                <div className="flex items-baseline space-x-1 mt-1">
                  <span className="text-2xl font-black text-electric-cyan font-mono">
                    {Math.round(selectedNode.mastery_prob * 100)}%
                  </span>
                  <span className={`text-[10px] font-medium capitalize ${getNodeColor(selectedNode.status).text}`}>
                    ({selectedNode.status.replace('_', ' ')})
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-navy-800/80 border border-slate-700/80">
                <span className="text-[11px] text-slate-400">Practice History</span>
                <div className="mt-1 text-xs text-slate-200">
                  <span className="font-bold text-white">{selectedNode.attempts_count}</span> attempts &bull; <span className="text-emerald-400 font-bold">{selectedNode.correct_count}</span> correct
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Retention Stability: {Math.round((1 - selectedNode.forgetting_risk) * 100)}%
                </div>
              </div>
            </div>

            {/* Description & Learning Objectives */}
            <div className="space-y-3 text-xs">
              <div>
                <h5 className="font-semibold text-slate-300 flex items-center space-x-1.5 mb-1">
                  <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Physical Concept Definition</span>
                </h5>
                <p className="text-slate-300 leading-relaxed bg-navy-950/60 p-2.5 rounded-lg border border-slate-800/60">
                  {selectedNode.description}
                </p>
              </div>

              {/* Prerequisites & Dependents */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg bg-navy-950/60 border border-slate-800/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Prerequisites ({selectedNode.prerequisites.length})
                  </span>
                  {selectedNode.prerequisites.length > 0 ? (
                    <ul className="space-y-1">
                      {selectedNode.prerequisites.map((p) => (
                        <li key={p} className="text-[11px] text-cyan-300 truncate font-mono">
                          &bull; {p}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-[11px] text-slate-500">None (Root concept)</span>
                  )}
                </div>

                <div className="p-2.5 rounded-lg bg-navy-950/60 border border-slate-800/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Dependents ({selectedNode.dependents.length})
                  </span>
                  {selectedNode.dependents.length > 0 ? (
                    <ul className="space-y-1">
                      {selectedNode.dependents.map((d) => (
                        <li key={d} className="text-[11px] text-indigo-300 truncate font-mono">
                          &bull; {d}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-[11px] text-slate-500">None</span>
                  )}
                </div>
              </div>

              {/* Known Common Misconceptions */}
              {selectedNode.common_misconceptions.length > 0 && (
                <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-800/50">
                  <h5 className="font-semibold text-rose-300 flex items-center space-x-1.5 mb-1 text-[11px]">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Watch Out: Known Misconception</span>
                  </h5>
                  <p className="text-[11px] text-rose-200/90 leading-tight">
                    {selectedNode.common_misconceptions[0]}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-4 border-t border-slate-800 mt-4">
            <button
              onClick={() => {
                if (onSelectConceptToPractice) onSelectConceptToPractice(selectedNode.id);
              }}
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs shadow-glow-cyan hover:opacity-95 transition"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>Practice Concept with ThinkTrace™</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
