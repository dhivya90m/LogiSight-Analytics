
import React, { useState } from 'react';
import { INITIAL_DATA, DEFAULT_SCHEMA } from './constants';
import { DeliveryRecord, AppView, KPISettings, ColumnProfile, SchemaConfig } from './types';
import { Dashboard } from './components/Dashboard';
import { DataGrid } from './components/DataGrid';
import { AutomationLab } from './components/AutomationLab';
import { AIAnalyst } from './components/AIAnalyst';
import { DataImport } from './components/DataImport';
import { ActionCenter } from './components/ActionCenter';
import { KPIBuilder } from './components/KPIBuilder';
import { SQLEditor } from './components/SQLEditor';
import { LayoutDashboard, Table, FlaskConical, MessageSquareText, Box, UploadCloud, Activity, Settings2, Terminal, Lock } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.DASHBOARD);
  const [data, setData] = useState<DeliveryRecord[]>(INITIAL_DATA);
  const [schema, setSchema] = useState<SchemaConfig>(DEFAULT_SCHEMA);
  
  // Temp state for import flow
  const [pendingImportData, setPendingImportData] = useState<DeliveryRecord[]>([]);
  const [importProfiles, setImportProfiles] = useState<ColumnProfile[]>([]);
  const [pendingSchema, setPendingSchema] = useState<SchemaConfig | null>(null);

  const [kpiSettings, setKpiSettings] = useState<KPISettings>({
    maxAcceptablePrepTime: 20,
    maxAcceptableDriveTime: 45,
    highRefundThreshold: 50,
    lateDeliveryThreshold: 60
  });

  const isImporting = view === AppView.IMPORT || view === AppView.SQL_WORKBENCH;

  const handleImport = (newData: DeliveryRecord[], newSchema: SchemaConfig) => {
    setData(newData);
    setSchema(newSchema);
    setView(AppView.DASHBOARD);
  };

  const handleOpenWorkbench = (rawData: DeliveryRecord[], profiles: ColumnProfile[], detectedSchema: SchemaConfig) => {
      setPendingImportData(rawData);
      setImportProfiles(profiles);
      setPendingSchema(detectedSchema);
      setView(AppView.SQL_WORKBENCH);
  }
  
  const handleSaveFromWorkbench = (cleanedData: DeliveryRecord[]) => {
      if (pendingSchema) {
          handleImport(cleanedData, pendingSchema);
      }
  }

  const renderContent = () => {
    switch (view) {
      case AppView.DASHBOARD:
        return <Dashboard data={data} kpiSettings={kpiSettings} schema={schema} />;
      case AppView.DATA_GRID:
        return <DataGrid data={data} />;
      case AppView.AUTOMATION_LAB:
        return <AutomationLab data={data} />;
      case AppView.AI_INSIGHTS:
        return <AIAnalyst data={data} />;
      case AppView.IMPORT:
        return <DataImport 
            onImport={handleImport} 
            onCancel={() => setView(AppView.DASHBOARD)} 
            onOpenWorkbench={handleOpenWorkbench}
        />;
      case AppView.SQL_WORKBENCH:
        return <SQLEditor 
            rawRecords={pendingImportData} 
            columnProfiles={importProfiles}
            onSave={handleSaveFromWorkbench}
            onCancel={() => setView(AppView.IMPORT)}
        />
      case AppView.ACTION_CENTER:
        return <ActionCenter data={data} settings={kpiSettings} />;
      case AppView.KPI_BUILDER:
        return <KPIBuilder settings={kpiSettings} onUpdate={setKpiSettings} />;
      default:
        return <Dashboard data={data} schema={schema} />;
    }
  };

  // Navigation helper
  const NavButton = ({ targetView, icon: Icon, label }: { targetView: AppView, icon: any, label: string }) => (
      <button 
        onClick={() => !isImporting && setView(targetView)} 
        disabled={isImporting}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors 
            ${view === targetView ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-white hover:text-slate-900'}
            ${isImporting ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <Icon size={18} /> {label}
        {isImporting && <Lock size={12} className="ml-auto opacity-50"/>}
      </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
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

      <div className={`flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 ${view === AppView.DATA_GRID || view === AppView.SQL_WORKBENCH ? 'max-w-[95%]' : 'max-w-7xl'}`}>
        <div className="flex flex-col lg:flex-row gap-8">
          <nav className="lg:w-64 flex-shrink-0 space-y-1">
            <NavButton targetView={AppView.DASHBOARD} icon={LayoutDashboard} label="Executive Dashboard" />
            <NavButton targetView={AppView.ACTION_CENTER} icon={Activity} label="Ops Action Center" />
            <NavButton targetView={AppView.AUTOMATION_LAB} icon={FlaskConical} label="Automation Lab" />
            <NavButton targetView={AppView.AI_INSIGHTS} icon={MessageSquareText} label="Gemini Advisor" />
            <NavButton targetView={AppView.DATA_GRID} icon={Table} label="Raw Data" />
            <NavButton targetView={AppView.KPI_BUILDER} icon={Settings2} label="KPI Builder" />

            <div className="pt-4 mt-4 border-t border-slate-200">
               <button 
                    onClick={() => setView(AppView.IMPORT)} 
                    disabled={isImporting} // If already in import flow, staying there is fine, but disabling re-click is standard
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${view === AppView.IMPORT ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                >
                  <UploadCloud size={18} /> Import Data
                </button>
                {view === AppView.SQL_WORKBENCH && (
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors bg-indigo-50 text-indigo-700 mt-2 cursor-default">
                        <Terminal size={18} /> SQL Workbench
                    </button>
                )}
            </div>
            
            <div className="mt-8 pt-8 border-t border-slate-200 px-4">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">System Status</h4>
                <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Operational
                </div>
                 <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    {view === AppView.IMPORT 
                        ? 'Importing...' 
                        : view === AppView.SQL_WORKBENCH 
                            ? `Cleaning ${pendingImportData.length.toLocaleString()} Records` 
                            : `${data.length.toLocaleString()} Active Records`
                    }
                </div>
                {data.length < 200 && !isImporting && (
                    <div className="mt-2 text-[10px] bg-yellow-100 text-yellow-800 px-2 py-1 rounded border border-yellow-200">
                        Demo Mode Active
                    </div>
                )}
            </div>
          </nav>

          <main className="flex-1 min-w-0">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default App;
