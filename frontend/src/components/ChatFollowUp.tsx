import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, User, Sparkles } from 'lucide-react';
import { ChatMessage } from '../types';
import { sendChatMessage, getChatHistory } from '../lib/api';

interface ChatFollowUpProps {
  sessionId: string;
  topic: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ChatFollowUp: React.FC<ChatFollowUpProps> = ({ sessionId, topic, isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && sessionId) {
      getChatHistory(sessionId).then(setMessages).catch(console.error);
    }
  }, [isOpen, sessionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    const tempUserMsg: ChatMessage = { role: 'user', content: userText };
    setMessages((prev) => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const res = await sendChatMessage(sessionId, userText);
      const assistantMsg: ChatMessage = { role: 'assistant', content: res.reply };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Apologies, I encountered an issue answering this question.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[450px] bg-slate-900 border-l border-slate-800 shadow-2xl z-50 flex flex-col backdrop-blur-xl">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100">Chat with Report</h3>
            <p className="text-[10px] text-slate-400 line-clamp-1 max-w-[280px]">{topic}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs space-y-2">
            <Sparkles className="h-6 w-6 mx-auto text-indigo-400 opacity-80" />
            <p className="font-semibold text-slate-300">Ask any follow-up question</p>
            <p className="text-[11px]">e.g. "What are the key risks mentioned?" or "Can you elaborate on finding #2?"</p>
          </div>
        ) : (
          messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="h-6 w-6 rounded-lg bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="h-3.5 w-3.5 text-indigo-400" />
                </div>
              )}
              <div
                className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[85%] ${
                  m.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-slate-800/90 border border-slate-700 text-slate-200 rounded-bl-none'
                }`}
              >
                {m.content}
              </div>
              {m.role === 'user' && (
                <div className="h-6 w-6 rounded-lg bg-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="h-3.5 w-3.5 text-slate-300" />
                </div>
              )}
            </div>
          ))
        )}

        {loading && (
          <div className="flex items-start gap-2.5">
            <div className="h-6 w-6 rounded-lg bg-indigo-600/30 flex items-center justify-center shrink-0">
              <Bot className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/90 text-xs text-slate-400 italic">
              Analyzing report findings...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-800 bg-slate-950/60">
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Ask a question about this research..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="w-full pl-3 pr-10 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-indigo-500/50"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
