import React from 'react';
import { Sparkles, Bot, Github } from 'lucide-react';

interface NavbarProps {
  onNewResearch: () => void;
  activeProvider: string;
  setActiveProvider: (p: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNewResearch, activeProvider, setActiveProvider }) => {
  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3 cursor-pointer" onClick={onNewResearch}>
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-slate-100 tracking-tight">Deep Research</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Multi-Agent
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">Autonomous AI Research Engine</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Model Selector */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
          <Bot className="h-3.5 w-3.5 text-indigo-400" />
          <select 
            value={activeProvider} 
            onChange={(e) => setActiveProvider(e.target.value)}
            className="bg-transparent text-slate-200 outline-none cursor-pointer"
          >
            <option value="groq" className="bg-slate-900">Groq (Llama 3.3 70B)</option>
            <option value="mistral" className="bg-slate-900">Mistral AI</option>
            <option value="openai" className="bg-slate-900">OpenAI (GPT-4o)</option>
          </select>
        </div>

        <button
          onClick={onNewResearch}
          className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all active:scale-95"
        >
          + New Research
        </button>

        <a
          href="https://github.com/e-smo1507/Deep-research-agent"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          title="GitHub Repository"
        >
          <Github className="h-4 w-4" />
        </a>
      </div>
    </header>
  );
};
