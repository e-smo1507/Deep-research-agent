import React, { useState } from 'react';
import { History, Search, Trash2, Clock, CheckCircle2, AlertCircle, FileText, ChevronLeft } from 'lucide-react';
import { ResearchSessionSummary } from '../types';

interface SidebarProps {
  sessions: ResearchSessionSummary[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  onClearAll: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onDeleteSession,
  onClearAll,
  searchQuery,
  setSearchQuery,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <div className="w-14 border-r border-slate-800/80 bg-slate-950/60 p-2 flex flex-col items-center justify-between shrink-0">
        <button
          onClick={() => setCollapsed(false)}
          className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
          title="Expand History"
        >
          <History className="h-5 w-5" />
        </button>
      </div>
    );
  }

  return (
    <aside className="w-72 md:w-80 border-r border-slate-800/80 bg-slate-950/50 backdrop-blur-md flex flex-col h-[calc(100vh-4rem)] shrink-0 select-none">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
          <History className="h-4 w-4 text-indigo-400" />
          <span>Research History</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
            {sessions.length}
          </span>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          title="Collapse sidebar"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Search Filter */}
      <div className="p-3 border-b border-slate-800/60">
        <div className="relative">
          <Search className="h-3.5 w-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search past sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-900/90 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
          />
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {sessions.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs">
            <FileText className="h-8 w-8 mx-auto mb-2 text-slate-600 opacity-60" />
            No research sessions found
          </div>
        ) : (
          sessions.map((s) => {
            const isActive = s.id === activeSessionId;
            return (
              <div
                key={s.id}
                onClick={() => onSelectSession(s.id)}
                className={`group relative p-3 rounded-xl cursor-pointer transition-all border ${
                  isActive
                    ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-100 shadow-sm'
                    : 'border-transparent hover:bg-slate-900/80 text-slate-300 hover:text-slate-100'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-medium line-clamp-2 leading-relaxed">
                    {s.topic}
                  </h4>
                  <button
                    onClick={(e) => onDeleteSession(s.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 text-slate-500 transition shrink-0"
                    title="Delete session"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    {s.status === 'completed' ? (
                      <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    ) : s.status === 'running' ? (
                      <Clock className="h-3 w-3 text-amber-400 animate-spin" />
                    ) : (
                      <AlertCircle className="h-3 w-3 text-rose-400" />
                    )}
                    <span className="capitalize">{s.depth} Mode</span>
                  </div>

                  {s.score && (
                    <span className="font-semibold text-indigo-400 px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                      ★ {s.score}/10
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Clear */}
      {sessions.length > 0 && (
        <div className="p-3 border-t border-slate-800/80">
          <button
            onClick={onClearAll}
            className="w-full py-1.5 text-xs text-slate-500 hover:text-red-400 flex items-center justify-center gap-1.5 transition rounded-lg hover:bg-red-500/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear All History</span>
          </button>
        </div>
      )}
    </aside>
  );
};
