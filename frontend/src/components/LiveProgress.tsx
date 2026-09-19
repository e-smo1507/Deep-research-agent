import React, { useState } from 'react';
import { Search, Globe, FileText, CheckCircle2, ShieldCheck, BarChart3, ChevronDown, ChevronUp, Terminal } from 'lucide-react';
import { StepLog } from '../types';

interface LiveProgressProps {
  topic: string;
  currentStep: string;
  logs: StepLog[];
  isComplete: boolean;
}

const STEPS = [
  { id: 'search', name: 'Search Agent', desc: 'Querying live web engines', icon: Search },
  { id: 'scrape', name: 'Reader Agent', desc: 'Scraping & cleaning source pages', icon: Globe },
  { id: 'write', name: 'Writer Chain', desc: 'Drafting structured synthesis', icon: FileText },
  { id: 'critic', name: 'Critic Review', desc: 'Evaluating quality & citations', icon: ShieldCheck },
  { id: 'analytics', name: 'Analytics Agent', desc: 'Synthesizing charts & KPIs', icon: BarChart3 },
];

export const LiveProgress: React.FC<LiveProgressProps> = ({ topic, currentStep, logs, isComplete }) => {
  const [showLogs, setShowLogs] = useState(true);

  const getStepStatus = (stepId: string) => {
    const stepOrder = ['search', 'scrape', 'write', 'critic', 'analytics'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const targetIndex = stepOrder.indexOf(stepId);

    if (isComplete) return 'completed';
    if (currentIndex > targetIndex) return 'completed';
    if (currentIndex === targetIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-6">
      {/* Session Title Header */}
      <div className="mb-6 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
          {isComplete ? 'Research & Analytics Complete' : 'Active Multi-Agent Pipeline'}
        </span>
        <h2 className="text-xl font-bold text-white mt-2 leading-snug">{topic}</h2>
      </div>

      {/* 5-Step Animated Pipeline Nodes */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 mb-6">
        {STEPS.map((step) => {
          const status = getStepStatus(step.id);
          const Icon = step.icon;
          const isActive = status === 'active';
          const isDone = status === 'completed';

          return (
            <div
              key={step.id}
              className={`p-3.5 rounded-xl border transition-all relative overflow-hidden ${
                isActive
                  ? 'bg-indigo-950/40 border-indigo-500 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/50'
                  : isDone
                  ? 'bg-slate-900/80 border-emerald-500/40 text-slate-300'
                  : 'bg-slate-900/30 border-slate-800/60 opacity-60'
              }`}
            >
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 animate-pulse"></div>
              )}
              <div className="flex items-center justify-between mb-2">
                <div className={`p-1.5 rounded-lg ${isActive ? 'bg-indigo-500/20 text-indigo-300' : isDone ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                  <Icon className="h-4 w-4" />
                </div>
                {isDone ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                ) : isActive ? (
                  <span className="h-2 w-2 rounded-full bg-indigo-400 animate-ping"></span>
                ) : null}
              </div>
              <h4 className="font-semibold text-xs text-slate-100 truncate">{step.name}</h4>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{step.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Live Agent Terminal Logs Box */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div 
          onClick={() => setShowLogs(!showLogs)}
          className="p-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between cursor-pointer select-none"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Terminal className="h-3.5 w-3.5 text-indigo-400" />
            <span>Agent Execution Stream</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
              {logs.length} events
            </span>
          </div>
          <button className="text-slate-400 hover:text-slate-200">
            {showLogs ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        {showLogs && (
          <div className="p-4 max-h-64 overflow-y-auto font-mono text-xs space-y-2 bg-black/40">
            {logs.length === 0 ? (
              <p className="text-slate-500 italic">Initializing agent network...</p>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="flex items-start gap-2.5 text-slate-300 leading-relaxed">
                  <span className="text-indigo-400 font-bold shrink-0">›</span>
                  <span className="text-slate-500 text-[10px] shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="text-slate-300">{log.message}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
