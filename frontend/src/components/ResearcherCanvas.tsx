import React, { useState } from 'react';
import { PenLine, Plus, Trash2, Clock, Sparkles } from 'lucide-react';
import { ResearcherNote } from '../types';
import { createNote, deleteNote } from '../lib/api';

interface ResearcherCanvasProps {
  sessionId: string;
  topic: string;
  notes: ResearcherNote[];
  onRefresh: () => void;
}

export const ResearcherCanvas: React.FC<ResearcherCanvasProps> = ({ sessionId, topic, notes, onRefresh }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tag, setTag] = useState<'hypothesis' | 'methodology' | 'limitation' | 'key_finding'>('hypothesis');
  const [isSaving, setIsSaving] = useState(false);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSaving) return;

    setIsSaving(true);
    try {
      await createNote(sessionId, title.trim() || 'Research Observation', content.trim(), tag);
      setTitle('');
      setContent('');
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNote(id);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const tagColors: Record<string, string> = {
    hypothesis: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    methodology: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    limitation: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    key_finding: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-4 space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20">
          Researcher Workspace
        </span>
        <h2 className="text-xl font-bold text-white mt-1">Hypothesis & Analysis Scratchpad</h2>
        <p className="text-xs text-slate-400 mt-0.5">{topic}</p>
      </div>

      {/* Note Creator Form */}
      <form onSubmit={handleAddNote} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <PenLine className="h-3.5 w-3.5 text-indigo-400" />
            <span>Add Research Note or Hypothesis</span>
          </h4>
          <select
            value={tag}
            onChange={(e: any) => setTag(e.target.value)}
            className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 outline-none"
          >
            <option value="hypothesis">Hypothesis</option>
            <option value="methodology">Methodology</option>
            <option value="key_finding">Key Finding</option>
            <option value="limitation">Limitation</option>
          </select>
        </div>

        <input
          type="text"
          placeholder="Section or note title (e.g. Scaling bottlenecks hypothesis)..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-indigo-500/50"
        />

        <textarea
          rows={3}
          placeholder="Write your observation, custom calculations, or research conclusions..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-indigo-500/50 resize-none"
        ></textarea>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!content.trim() || isSaving}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Note'}</span>
          </button>
        </div>
      </form>

      {/* Saved Notes Feed */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Recorded Observations ({notes.length})
        </h3>

        {notes.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs bg-slate-900/40 border border-slate-800/60 rounded-2xl">
            <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-40 text-slate-600" />
            No notes added yet. Use the scratchpad above to record your hypotheses and findings.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {notes.map((n) => (
              <div
                key={n.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 shadow-md transition space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${tagColors[n.tag] || tagColors.hypothesis}`}>
                      {n.tag.replace('_', ' ')}
                    </span>
                    <button
                      onClick={() => handleDelete(n.id)}
                      className="text-slate-500 hover:text-red-400 p-1 transition"
                      title="Delete note"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <h4 className="text-xs font-bold text-slate-100">{n.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed mt-1 whitespace-pre-wrap">{n.content}</p>
                </div>

                <div className="pt-2 border-t border-slate-800/60 text-[10px] text-slate-500 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Saved on {new Date(n.updated_at).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
