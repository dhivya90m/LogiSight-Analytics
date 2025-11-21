import React, { useState } from 'react';
import { INITIAL_DATA } from './constants';
import { DeliveryRecord, AppView, KPISettings } from './types';
import { Dashboard } from './components/Dashboard';
import { DataGrid } from './components/DataGrid';
import { AutomationLab } from './components/AutomationLab';
import { AIAnalyst } from './components/AIAnalyst';
import { DataImport } from './components/DataImport';
import { ActionCenter } from './components/ActionCenter';
import { KPIBuilder } from './components/KPIBuilder';
import { LayoutDashboard, Table, FlaskConical, MessageSquareText, Box, UploadCloud, Activity, Settings2 } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.DASHBOARD);
  const [data, setData] = useState<DeliveryRecord[]>(INITIAL_DATA);
  
  // Default Operational KPIs
  const [kpiSettings, setKpiSettings] = useState<KPISettings>({
    maxAcceptablePrepTime: 20,
    maxAcceptableDriveTime: 45,
    highRefundThreshold: 50,
    lateDeliveryThreshold: 60
  });

  const handleImport = (newData: DeliveryRecord[]) => {
    setData(newData);
    setView(AppView.DASHBOARD);
  };

  const renderContent = () => {
    switch (view) {
      case AppView.DASHBOARD:
        return <Dashboard data={data} kpiSettings={kpiSettings} />;
      case AppView.DATA_GRID:
        return <DataGrid data={data} />;
      case AppView.AUTOMATION_LAB:
        return <AutomationLab data={data} />;
      case AppView.AI_INSIGHTS:
        return <AIAnalyst data={data} />;
      case AppView.IMPORT:
        return <DataImport onImport={handleImport} onCancel={() => setView(AppView.DASHBOARD)} />;
      case AppView.ACTION_CENTER:
        return <ActionCenter data={data} settings={kpiSettings} />;
      case AppView.KPI_BUILDER:
        return <KPIBuilder settings={kpiSettings} onUpdate={setKpiSettings} />;
      default:
        return <Dashboard data={data} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Box className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">LogiSight <span className="text-indigo-600">Analytics</span></h1>
                <p className="text-xs text-slate-500 font-medium">Support Automation Platform</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4">
               <div className="text-right">
                    <p className="text-sm font-medium text-slate-700">Demo User</p>
                    <p className="text-xs text-slate-500">Senior Associate Candidate</p>
               </div>
               <div className="h-8 w-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs">
                    SA
               </div>
            </div>
          </div>
        </div>
      </header>

      <div className={`flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 ${view === AppView.DATA_GRID ? 'max-w-[95%]' : 'max-w-7xl'}`}>
        <div className="flex flex-col lg:flex-row gap-8">
            
          {/* Sidebar Navigation */}
          <nav className="lg:w-64 flex-shrink-0 space-y-1">
            <button
              onClick={() => setView(AppView.DASHBOARD)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                view === AppView.DASHBOARD 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-slate-600 hover:bg-white hover:text-slate-900'
              }`}
            >
              <LayoutDashboard size={18} />
              Executive Dashboard
            </button>

            <button
              onClick={() => setView(AppView.ACTION_CENTER)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                view === AppView.ACTION_CENTER
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-slate-600 hover:bg-white hover:text-slate-900'
              }`}
            >
              <Activity size={18} />
              Ops Action Center
            </button>

            <button
              onClick={() => setView(AppView.AUTOMATION_LAB)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                view === AppView.AUTOMATION_LAB 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-slate-600 hover:bg-white hover:text-slate-900'
              }`}
            >
              <FlaskConical size={18} />
              Automation Lab
            </button>
            
            <button
              onClick={() => setView(AppView.AI_INSIGHTS)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                view === AppView.AI_INSIGHTS
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-slate-600 hover:bg-white hover:text-slate-900'
              }`}
            >
              <MessageSquareText size={18} />
              Gemini Advisor
            </button>
            
            <button
              onClick={() => setView(AppView.DATA_GRID)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                view === AppView.DATA_GRID 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-slate-600 hover:bg-white hover:text-slate-900'
              }`}
            >
              <Table size={18} />
              Raw Data
            </button>

            <button
              onClick={() => setView(AppView.KPI_BUILDER)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                view === AppView.KPI_BUILDER
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-slate-600 hover:bg-white hover:text-slate-900'
              }`}
            >
              <Settings2 size={18} />
              KPI Builder
            </button>

            <div className="pt-4 mt-4 border-t border-slate-200">
               <button
                  onClick={() => setView(AppView.IMPORT)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    view === AppView.IMPORT
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <UploadCloud size={18} />
                  Import Data
                </button>
            </div>
            
            <div className="mt-8 pt-8 border-t border-slate-200 px-4">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">System Status</h4>
                <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Operational
                </div>
                 <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    {data.length} Records Loaded
                </div>
            </div>
          </nav>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default App;