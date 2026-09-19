import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ResearchInput } from './components/ResearchInput';
import { LiveProgress } from './components/LiveProgress';
import { ReportViewer } from './components/ReportViewer';
import { WorkspaceTabs, TabType } from './components/WorkspaceTabs';
import { AnalyticsHub } from './components/AnalyticsHub';
import { MediaGallery } from './components/MediaGallery';
import { ResearcherCanvas } from './components/ResearcherCanvas';
import { ChatFollowUp } from './components/ChatFollowUp';
import {
  ResearchDepth, ResearchSessionSummary, StepLog, ReportData,
  ResearchMetric, ResearchChart, ResearchMedia, ResearcherNote
} from './types';
import {
  createResearchSession, getResearchSession, getHistory,
  deleteSession, clearAllHistory, getAnalytics, getMedia, getNotes
} from './lib/api';

export default function App() {
  const [sessions, setSessions] = useState<ResearchSessionSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeProvider, setActiveProvider] = useState('groq');
  
  // Active session state
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activeTopic, setActiveTopic] = useState('');
  const [currentStep, setCurrentStep] = useState<string>('search');
  const [logs, setLogs] = useState<StepLog[]>([]);
  const [report, setReport] = useState<ReportData | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Studio Workspace Tab state
  const [activeTab, setActiveTab] = useState<TabType>('report');
  const [metrics, setMetrics] = useState<ResearchMetric[]>([]);
  const [charts, setCharts] = useState<ResearchChart[]>([]);
  const [mediaList, setMediaList] = useState<ResearchMedia[]>([]);
  const [notes, setNotes] = useState<ResearcherNote[]>([]);

  const loadHistory = async () => {
    try {
      const data = await getHistory(searchQuery);
      setSessions(data);
    } catch (e) {
      console.error('Failed to load history', e);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [searchQuery]);

  const loadStudioData = async (sessionId: string) => {
    try {
      const [analyticsData, mediaData, notesData] = await Promise.all([
        getAnalytics(sessionId).catch(() => ({ metrics: [], charts: [] })),
        getMedia(sessionId).catch(() => []),
        getNotes(sessionId).catch(() => [])
      ]);
      setMetrics(analyticsData.metrics || []);
      setCharts(analyticsData.charts || []);
      setMediaList(mediaData || []);
      setNotes(notesData || []);
    } catch (err) {
      console.error('Error loading studio data', err);
    }
  };

  const handleStartResearch = async (topic: string, depth: ResearchDepth) => {
    setIsRunning(true);
    setReport(null);
    setLogs([]);
    setMetrics([]);
    setCharts([]);
    setMediaList([]);
    setNotes([]);
    setCurrentStep('search');
    setActiveTopic(topic);
    setActiveTab('report');

    try {
      const res = await createResearchSession(topic, depth, activeProvider);
      const sessionId = res.session_id;
      setActiveSessionId(sessionId);

      const eventSource = new EventSource(`/api/research/${sessionId}/stream`);

      eventSource.onmessage = (event) => {
        try {
          let rawData = event.data;
          if (typeof rawData === 'string' && rawData.startsWith('data: ')) {
            rawData = rawData.slice(6);
          }
          const payload = JSON.parse(rawData);
          
          if (payload.step) {
            setCurrentStep(payload.step);
          }

          if (payload.message) {
            setLogs((prev) => [
              ...prev,
              {
                id: Math.random().toString(),
                step: payload.step || 'general',
                status: payload.event,
                message: payload.message,
                data: payload.data,
                timestamp: payload.timestamp || new Date().toISOString()
              }
            ]);
          }

          if (payload.event === 'pipeline_complete') {
            setIsRunning(false);
            setReport({
              markdown: payload.data.report,
              critic: payload.data.critic,
              sources: payload.data.sources
            });
            if (payload.data.analytics) {
              setMetrics(payload.data.analytics.metrics || []);
              setCharts(payload.data.analytics.charts || []);
            }
            eventSource.close();
            loadHistory();
            loadStudioData(sessionId);
          } else if (payload.event === 'pipeline_error') {
            setIsRunning(false);
            eventSource.close();
          }
        } catch (err) {
          console.error('Error parsing SSE event', err);
        }
      };

      eventSource.onerror = async () => {
        eventSource.close();
        try {
          const sessionData = await getResearchSession(sessionId);
          if (sessionData && sessionData.report) {
            setReport(sessionData.report);
          }
          loadStudioData(sessionId);
        } catch (e) {
          console.error(e);
        }
        setIsRunning(false);
        loadHistory();
      };

    } catch (err) {
      console.error(err);
      setIsRunning(false);
    }
  };

  const handleSelectSession = async (id: string) => {
    setActiveSessionId(id);
    setActiveTab('report');
    try {
      const data = await getResearchSession(id);
      setActiveTopic(data.topic);
      setLogs(data.logs || []);
      if (data.report) {
        setReport(data.report);
      } else {
        setReport(null);
      }
      setIsRunning(data.status === 'running');
      loadStudioData(id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteSession(id);
      if (activeSessionId === id) {
        setActiveSessionId(null);
        setReport(null);
        setLogs([]);
      }
      loadHistory();
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Clear all research history?')) {
      await clearAllHistory();
      setActiveSessionId(null);
      setReport(null);
      setLogs([]);
      loadHistory();
    }
  };

  const handleNewResearch = () => {
    setActiveSessionId(null);
    setReport(null);
    setLogs([]);
    setIsRunning(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-slate-100">
      <Navbar
        onNewResearch={handleNewResearch}
        activeProvider={activeProvider}
        setActiveProvider={setActiveProvider}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={handleSelectSession}
          onDeleteSession={handleDeleteSession}
          onClearAll={handleClearAll}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <main className="flex-1 overflow-y-auto py-6">
          {!activeSessionId && !isRunning ? (
            <ResearchInput onSubmit={handleStartResearch} isLoading={isRunning} />
          ) : isRunning ? (
            <LiveProgress
              topic={activeTopic}
              currentStep={currentStep}
              logs={logs}
              isComplete={false}
            />
          ) : report ? (
            <div>
              {/* Workspace Navigation Tabs */}
              <WorkspaceTabs
                activeTab={activeTab}
                onChangeTab={setActiveTab}
                metricsCount={metrics.length}
                mediaCount={mediaList.length}
                notesCount={notes.length}
              />

              {activeTab === 'report' && (
                <ReportViewer
                  sessionId={activeSessionId!}
                  topic={activeTopic}
                  report={report}
                  onOpenChat={() => setIsChatOpen(true)}
                />
              )}

              {activeTab === 'analytics' && (
                <AnalyticsHub
                  topic={activeTopic}
                  metrics={metrics}
                  charts={charts}
                />
              )}

              {activeTab === 'media' && (
                <MediaGallery
                  sessionId={activeSessionId!}
                  topic={activeTopic}
                  mediaList={mediaList}
                  onRefresh={() => activeSessionId && loadStudioData(activeSessionId)}
                />
              )}

              {activeTab === 'canvas' && (
                <ResearcherCanvas
                  sessionId={activeSessionId!}
                  topic={activeTopic}
                  notes={notes}
                  onRefresh={() => activeSessionId && loadStudioData(activeSessionId)}
                />
              )}
            </div>
          ) : (
            <LiveProgress
              topic={activeTopic}
              currentStep={currentStep}
              logs={logs}
              isComplete={true}
            />
          )}
        </main>
      </div>

      {activeSessionId && (
        <ChatFollowUp
          sessionId={activeSessionId}
          topic={activeTopic}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />
      )}
    </div>
  );
}
