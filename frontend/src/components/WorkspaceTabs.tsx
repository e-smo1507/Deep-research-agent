import React from 'react';
import { FileText, BarChart3, Image as ImageIcon, PenLine } from 'lucide-react';

export type TabType = 'report' | 'analytics' | 'media' | 'canvas';

interface WorkspaceTabsProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  metricsCount?: number;
  mediaCount?: number;
  notesCount?: number;
}

export const WorkspaceTabs: React.FC<WorkspaceTabsProps> = ({
  activeTab,
  onChangeTab,
  metricsCount = 0,
  mediaCount = 0,
  notesCount = 0,
}) => {
  const tabs = [
    { id: 'report' as TabType, label: 'Executive Report', icon: FileText },
    { id: 'analytics' as TabType, label: 'Data & Analytics', icon: BarChart3, badge: metricsCount > 0 ? metricsCount : undefined },
    { id: 'media' as TabType, label: 'Figures & Media', icon: ImageIcon, badge: mediaCount > 0 ? mediaCount : undefined },
    { id: 'canvas' as TabType, label: 'Researcher Canvas', icon: PenLine, badge: notesCount > 0 ? notesCount : undefined },
  ];

  return (
    <div className="flex items-center gap-1.5 p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl max-w-4xl mx-auto mb-6 backdrop-blur-xl shadow-lg">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChangeTab(tab.id)}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              isActive
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-white/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-indigo-400'}`} />
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
            {tab.badge !== undefined && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
