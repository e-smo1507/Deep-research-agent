import React, { useState } from 'react';
import { FileDown, Copy, Check, FileCode } from 'lucide-react';

interface ExportMenuProps {
  sessionId: string;
  topic: string;
  markdownContent: string;
}

export const ExportMenu: React.FC<ExportMenuProps> = ({ sessionId, markdownContent }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadPdf = () => {
    window.open(`/api/export/${sessionId}/pdf`, '_blank');
  };

  const downloadMarkdown = () => {
    window.open(`/api/export/${sessionId}/markdown`, '_blank');
  };

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={downloadPdf}
        className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition active:scale-95"
        title="Download Formatted PDF Report"
      >
        <FileDown className="h-3.5 w-3.5" />
        <span>Export PDF</span>
      </button>

      <button
        onClick={downloadMarkdown}
        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition active:scale-95"
        title="Download Markdown File"
      >
        <FileCode className="h-3.5 w-3.5 text-indigo-400" />
        <span>.MD</span>
      </button>

      <button
        onClick={handleCopy}
        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
        title="Copy Markdown to Clipboard"
      >
        {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
};
