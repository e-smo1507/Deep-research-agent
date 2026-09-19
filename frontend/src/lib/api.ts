import { ResearchSessionSummary, ChatMessage, ResearchMedia, ResearcherNote, ResearchMetric, ResearchChart } from '../types';

const API_BASE = '/api';

export async function createResearchSession(topic: string, depth: string = 'standard', model_provider: string = 'groq') {
  const res = await fetch(`${API_BASE}/research/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, depth, model_provider }),
  });
  if (!res.ok) throw new Error('Failed to create research session');
  return res.json();
}

export async function getResearchSession(sessionId: string) {
  const res = await fetch(`${API_BASE}/research/${sessionId}`);
  if (!res.ok) throw new Error('Failed to fetch research session');
  return res.json();
}

export async function getHistory(query: string = ''): Promise<ResearchSessionSummary[]> {
  const url = query ? `${API_BASE}/history?q=${encodeURIComponent(query)}` : `${API_BASE}/history`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch history');
  return res.json();
}

export async function deleteSession(sessionId: string) {
  const res = await fetch(`${API_BASE}/history/${sessionId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete session');
  return res.json();
}

export async function clearAllHistory() {
  const res = await fetch(`${API_BASE}/history`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to clear history');
  return res.json();
}

export async function sendChatMessage(sessionId: string, message: string): Promise<{ reply: string; timestamp: string }> {
  const res = await fetch(`${API_BASE}/chat/${sessionId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error('Failed to send chat message');
  return res.json();
}

export async function getChatHistory(sessionId: string): Promise<ChatMessage[]> {
  const res = await fetch(`${API_BASE}/chat/${sessionId}`);
  if (!res.ok) throw new Error('Failed to get chat history');
  return res.json();
}

// Studio & Media API
export async function getAnalytics(sessionId: string): Promise<{ metrics: ResearchMetric[]; charts: ResearchChart[] }> {
  const res = await fetch(`${API_BASE}/studio/${sessionId}/analytics`);
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
}

export async function getNotes(sessionId: string): Promise<ResearcherNote[]> {
  const res = await fetch(`${API_BASE}/studio/${sessionId}/notes`);
  if (!res.ok) throw new Error('Failed to fetch notes');
  return res.json();
}

export async function createNote(sessionId: string, title: string, content: string, tag: string): Promise<ResearcherNote> {
  const res = await fetch(`${API_BASE}/studio/${sessionId}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content, tag }),
  });
  if (!res.ok) throw new Error('Failed to save note');
  return res.json();
}

export async function deleteNote(noteId: string) {
  const res = await fetch(`${API_BASE}/studio/notes/${noteId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete note');
  return res.json();
}

export async function uploadMedia(sessionId: string, file: File, caption: string, figureNum: string): Promise<ResearchMedia> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('caption', caption);
  formData.append('figure_num', figureNum);

  const res = await fetch(`${API_BASE}/media/upload/${sessionId}`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to upload media');
  return res.json();
}

export async function getMedia(sessionId: string): Promise<ResearchMedia[]> {
  const res = await fetch(`${API_BASE}/media/${sessionId}`);
  if (!res.ok) throw new Error('Failed to fetch media');
  return res.json();
}

export async function deleteMedia(mediaId: string) {
  const res = await fetch(`${API_BASE}/media/item/${mediaId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete media');
  return res.json();
}
