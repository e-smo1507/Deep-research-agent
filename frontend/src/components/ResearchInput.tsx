import React, { useState } from 'react';
import { Search, Sparkles, Zap, BookOpen, Compass, ArrowRight } from 'lucide-react';
import { ResearchDepth } from '../types';

interface ResearchInputProps {
  onSubmit: (topic: string, depth: ResearchDepth) => void;
  isLoading: boolean;
}

const SAMPLE_TOPICS = [
  "Recent breakthroughs in Room-Temperature Superconductors",
  "LLM Agent Architectures: Tool-Use vs Planning in 2026",
  "Solid-State Battery commercialization timelines & manufacturers",
  "Impact of Quantum Error Correction on Cryptography"
];

export const ResearchInput: React.FC<ResearchInputProps> = ({ onSubmit, isLoading }) => {
  const [topic, setTopic] = useState('');
  const [depth, setDepth] = useState<ResearchDepth>('standard');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isLoading) return;
    onSubmit(topic.trim(), depth);
  };

  return (
    <div className="max-w-3xl mx-auto w-full px-4 py-8">
      {/* Hero Intro */}
      <div className="text-center mb-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Next-Generation Autonomous Research Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          What would you like to <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">deep research</span> today?
        </h1>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          Chains Search, Deep Scrape, Synthesis, and Peer Review agents to deliver authoritative, publication-ready research reports.
        </p>
      </div>

      {/* Main Search Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
          <div className="relative bg-slate-900 border border-slate-700/80 rounded-2xl p-2 shadow-2xl flex items-center gap-3">
            <Search className="h-5 w-5 text-indigo-400 ml-3 shrink-0" />
            <input
              type="text"
              placeholder="e.g. Current status and bottlenecks of fusion energy reactors..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isLoading}
              className="w-full bg-transparent text-sm sm:text-base text-slate-100 placeholder-slate-500 outline-none py-2 px-1"
            />
            <button
              type="submit"
              disabled={!topic.trim() || isLoading}
              className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all active:scale-95 shrink-0"
            >
              <span>{isLoading ? 'Researching...' : 'Start Research'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Depth Modes */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => setDepth('fast')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition border ${
              depth === 'fast'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span>Fast Brief (3 sources)</span>
          </button>

          <button
            type="button"
            onClick={() => setDepth('standard')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition border ${
              depth === 'standard'
                ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="h-3.5 w-3.5 text-indigo-400" />
            <span>Standard Deep Research (5 sources)</span>
          </button>

          <button
            type="button"
            onClick={() => setDepth('deep')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition border ${
              depth === 'deep'
                ? 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5 text-purple-400" />
            <span>Comprehensive Whitepaper (8+ sources)</span>
          </button>
        </div>
      </form>

      {/* Suggested Topics */}
      <div className="mt-8 pt-6 border-t border-slate-800/80">
        <p className="text-xs font-medium text-slate-400 mb-3 text-center">Or try an analytical topic:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SAMPLE_TOPICS.map((t, idx) => (
            <button
              key={idx}
              onClick={() => {
                setTopic(t);
                onSubmit(t, depth);
              }}
              className="text-left p-3 rounded-xl bg-slate-900/40 hover:bg-slate-800/80 border border-slate-800/60 hover:border-indigo-500/30 text-xs text-slate-300 hover:text-white transition group flex items-center justify-between"
            >
              <span className="line-clamp-1">{t}</span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-indigo-400 shrink-0 ml-2" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
