import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, BarChart3, Download, Sparkles } from 'lucide-react';
import { ResearchMetric, ResearchChart } from '../types';

interface AnalyticsHubProps {
  topic: string;
  metrics: ResearchMetric[];
  charts: ResearchChart[];
}

export const AnalyticsHub: React.FC<AnalyticsHubProps> = ({ topic, metrics, charts }) => {
  const [selectedChartIdx, setSelectedChartIdx] = useState(0);

  const downloadCSV = () => {
    let csv = "Category,Metric,Value,Unit,Change,Description\n";
    metrics.forEach((m) => {
      csv += `"${m.category || ''}","${m.title}","${m.value}","${m.unit || ''}","${m.change || ''}","${m.description || ''}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Analytics_${topic.slice(0, 20).replace(/\s+/g, '_')}.csv`;
    a.click();
  };

  const activeChart = charts[selectedChartIdx] || charts[0];

  return (
    <div className="max-w-4xl mx-auto w-full px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Quantitative Intelligence
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Data & Analytics Dashboard</h2>
          <p className="text-xs text-slate-400 mt-0.5">{topic}</p>
        </div>

        <button
          onClick={downloadCSV}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition shadow"
        >
          <Download className="h-3.5 w-3.5 text-emerald-400" />
          <span>Export Metrics (CSV)</span>
        </button>
      </div>

      {/* 4 Quantitative KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map((m, idx) => {
          const isUp = m.trend === 'up';
          const isDown = m.trend === 'down';
          return (
            <div
              key={idx}
              className="bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-4 shadow-lg transition-all group relative overflow-hidden"
            >
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-semibold text-slate-300 truncate max-w-[120px]">{m.title}</span>
                {m.category && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                    {m.category}
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-white tracking-tight">{m.value}</span>
                {m.unit && <span className="text-[11px] text-slate-400">{m.unit}</span>}
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] pt-2 border-t border-slate-800/60">
                <div className="flex items-center gap-1">
                  {isUp ? (
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                  ) : isDown ? (
                    <TrendingDown className="h-3.5 w-3.5 text-rose-400" />
                  ) : (
                    <Minus className="h-3.5 w-3.5 text-slate-400" />
                  )}
                  <span className={isUp ? 'text-emerald-400 font-bold' : isDown ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                    {m.change || 'N/A'}
                  </span>
                </div>
              </div>

              {m.description && (
                <p className="text-[10px] text-slate-400 mt-2 leading-relaxed line-clamp-2">
                  {m.description}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Interactive Visual Charts Card */}
      {charts.length > 0 && activeChart && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-indigo-400" />
                <h3 className="font-bold text-sm text-slate-100">{activeChart.title}</h3>
              </div>
              {activeChart.subtitle && (
                <p className="text-xs text-slate-400 mt-0.5">{activeChart.subtitle}</p>
              )}
            </div>

            {/* Chart Switcher */}
            {charts.length > 1 && (
              <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
                {charts.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedChartIdx(i)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                      selectedChartIdx === i
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Chart {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* SVG Data Visualization Rendering */}
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80">
            {activeChart.chart_type === 'line' ? (
              /* Line Chart Rendering */
              <div className="space-y-4">
                <div className="h-52 w-full flex items-end justify-between gap-2 pt-6 px-4">
                  {activeChart.labels.map((label, idx) => {
                    const dataPoints = activeChart.series[0]?.data || [];
                    const maxVal = Math.max(...dataPoints, 100);
                    const val = dataPoints[idx] || 0;
                    const heightPct = Math.round((val / maxVal) * 100);

                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                        {/* Hover Tooltip */}
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow transition duration-200 pointer-events-none">
                          {val}%
                        </div>

                        {/* Bar / Dot Column */}
                        <div className="w-full flex justify-center items-end h-36">
                          <div
                            style={{ height: `${Math.max(heightPct, 8)}%` }}
                            className="w-3 rounded-full bg-gradient-to-t from-indigo-600 to-violet-400 shadow-md shadow-indigo-500/30 group-hover:scale-110 transition duration-300"
                          ></div>
                        </div>

                        {/* X-axis Label */}
                        <span className="text-[10px] text-slate-400 font-mono truncate max-w-[60px] text-center">
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Bar Chart Rendering */
              <div className="space-y-3">
                {activeChart.labels.map((label, idx) => {
                  const dataPoints = activeChart.series[0]?.data || [];
                  const maxVal = Math.max(...dataPoints, 100);
                  const val = dataPoints[idx] || 0;
                  const widthPct = Math.round((val / maxVal) * 100);

                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-medium">{label}</span>
                        <span className="text-indigo-400 font-bold font-mono">{val}</span>
                      </div>
                      <div className="h-3.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                        <div
                          style={{ width: `${Math.max(widthPct, 4)}%` }}
                          className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-purple-500 transition-all duration-700"
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* AI Insights Note */}
          {activeChart.insights && (
            <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-start gap-2.5 text-xs text-indigo-200 leading-relaxed">
              <Sparkles className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-indigo-300">Analytical Synthesis: </span>
                {activeChart.insights}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
