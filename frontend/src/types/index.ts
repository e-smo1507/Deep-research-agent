export type ResearchDepth = 'fast' | 'standard' | 'deep';

export type PipelineStep = 'search' | 'scrape' | 'write' | 'critic' | 'analytics';

export interface SourceItem {
  title: string;
  url: string;
  snippet?: string;
}

export interface CriticData {
  score: number;
  strengths: string[];
  areas_to_improve: string[];
  verdict: string;
  raw?: string;
}

export interface ResearchMetric {
  id?: string;
  title: string;
  value: string;
  unit?: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  category?: string;
  description?: string;
}

export interface ResearchChartSeries {
  name: string;
  data: number[];
}

export interface ResearchChart {
  id?: string;
  title: string;
  chart_type: 'bar' | 'line' | 'donut' | 'radar';
  subtitle?: string;
  labels: string[];
  series: ResearchChartSeries[];
  insights?: string;
}

export interface ResearchMedia {
  id: string;
  filename: string;
  file_url: string;
  caption?: string;
  figure_num?: string;
  uploaded_at: string;
}

export interface ResearcherNote {
  id: string;
  title: string;
  content: string;
  tag: 'hypothesis' | 'methodology' | 'limitation' | 'key_finding';
  updated_at: string;
}

export interface ReportData {
  markdown: string;
  critic: CriticData;
  sources: SourceItem[];
  analytics?: {
    metrics: ResearchMetric[];
    charts: ResearchChart[];
  };
}

export interface StepLog {
  id: string;
  step: string;
  status: string;
  message: string;
  data?: any;
  timestamp: string;
}

export interface ResearchSessionSummary {
  id: string;
  topic: string;
  depth: ResearchDepth;
  status: 'pending' | 'running' | 'completed' | 'failed';
  created_at: string;
  score?: number | null;
}

export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}
