import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ShieldCheck, Star, ExternalLink, Globe, CheckCircle2, AlertTriangle } from 'lucide-react';
import { ReportData } from '../types';
import { ExportMenu } from './ExportMenu';

interface ReportViewerProps {
  sessionId: string;
  topic: string;
  report: ReportData;
  onOpenChat: () => void;
}

export const ReportViewer: React.FC<ReportViewerProps> = ({ sessionId, topic, report, onOpenChat }) => {
  const { markdown, critic, sources } = report;

  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-6 space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Synthesized Research Report
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">{topic}</h1>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={onOpenChat}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-semibold border border-indigo-500/30 transition flex items-center gap-1.5 shadow"
          >
            💬 Chat with Report
          </button>
          <ExportMenu sessionId={sessionId} topic={topic} markdownContent={markdown} />
        </div>
      </div>

      {/* Critic Scorecard Box */}
      {critic && (
        <div className="bg-gradient-to-br from-indigo-950/40 to-slate-900/80 border border-indigo-500/30 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-indigo-500/20 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-indigo-400" />
              <h3 className="font-bold text-sm text-slate-100">Critic Review & Quality Scorecard</h3>
            </div>
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold">
              <Star className="h-3.5 w-3.5 fill-indigo-400 text-indigo-400" />
              <span>{critic.score} / 10</span>
            </div>
          </div>

          <p className="text-xs text-indigo-200 italic font-medium">"{critic.verdict}"</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {critic.strengths && critic.strengths.length > 0 && (
              <div className="space-y-1.5 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Key Strengths</span>
                </div>
                <ul className="space-y-1 text-slate-300 pl-4 list-disc text-[11px]">
                  {critic.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {critic.areas_to_improve && critic.areas_to_improve.length > 0 && (
              <div className="space-y-1.5 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Areas to Improve</span>
                </div>
                <ul className="space-y-1 text-slate-300 pl-4 list-disc text-[11px]">
                  {critic.areas_to_improve.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Formatted Markdown Content */}
      <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl">
        <div className="markdown-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {markdown}
          </ReactMarkdown>
        </div>
      </div>

      {/* Verified Sources Appendix */}
      {sources && sources.length > 0 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-slate-200 font-bold text-sm">
            <Globe className="h-4 w-4 text-indigo-400" />
            <span>Verified Sources & Citations ({sources.length})</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {sources.map((s, idx) => (
              <a
                key={idx}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-indigo-500/40 text-xs transition group block"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-slate-200 group-hover:text-indigo-300 line-clamp-1">
                    [{idx + 1}] {s.title}
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-500 group-hover:text-indigo-400 shrink-0" />
                </div>
                {s.snippet && (
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                    {s.snippet}
                  </p>
                )}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
