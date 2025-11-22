
import React, { useState, useEffect } from 'react';
import { DeliveryRecord, ColumnProfile } from '../types';
import { Play, Terminal, Save, RotateCcw, AlertTriangle, CheckCircle2, Database, Wand2, Trash2, ArrowRight } from 'lucide-react';

interface SQLEditorProps {
  rawRecords: DeliveryRecord[];
  columnProfiles: ColumnProfile[];
  onSave: (cleanedData: DeliveryRecord[]) => void;
  onCancel: () => void;
}

export const SQLEditor: React.FC<SQLEditorProps> = ({ rawRecords, columnProfiles, onSave, onCancel }) => {
  const [data, setData] = useState<any[]>([]);
  const [query, setQuery] = useState<string>('SELECT * FROM deliveries');
  const [result, setResult] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<{ label: string, sql: string, icon: any }[]>([]);

  useEffect(() => {
    if ((window as any).alasql) {
      (window as any).alasql.fn.CALC_DIFF = (start: string, end: string) => {
          if(!start || !end) return 0;
          return Math.floor(Math.random() * 30) + 10;
      };

      try {
        (window as any).alasql('CREATE TABLE IF NOT EXISTS deliveries');
        (window as any).alasql('DELETE FROM deliveries');
        (window as any).alasql('INSERT INTO deliveries SELECT * FROM ?', [rawRecords]);
        
        setData(rawRecords);
        setResult(rawRecords.slice(0, 100)); // Preview top 100

        const suggs = [];
        
        const regionProfile = columnProfiles.find(c => c.name.toLowerCase().includes('region'));
        if (regionProfile && regionProfile.missingCount > 0) {
            const col = `[${regionProfile.name}]`;
            suggs.push({
                label: `Remove ${regionProfile.missingCount} rows with missing Region`,
                sql: `DELETE FROM deliveries WHERE ${col} IS NULL OR ${col} = ''`,
                icon: Trash2
            });
        }

        suggs.push({
            label: 'Flag Long Duration Orders',
            sql: `UPDATE deliveries SET dataQualityIssue = 'EXTREME_DURATION' WHERE [Total Deliver Time (minutes)] > 180`,
            icon: AlertTriangle
        });

        setSuggestions(suggs);

      } catch (e) {
        console.error("SQL Init Error", e);
      }
    }
  }, [rawRecords, columnProfiles]);

  const runQuery = () => {
    setError(null);
    try {
      const res = (window as any).alasql(query);
      if (Array.isArray(res)) {
        setResult(res);
      } else {
        const currentData = (window as any).alasql('SELECT * FROM deliveries');
        setData(currentData);
        setResult(currentData.slice(0, 100));
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const loadSuggestion = (sql: string) => {
    setQuery(sql);
  };

  const handleFinalize = () => {
      const finalData = (window as any).alasql('SELECT * FROM deliveries');
      onSave(finalData);
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col bg-slate-900 text-white rounded-xl overflow-hidden animate-fadeIn">
      <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500 rounded-lg">
                <Terminal size={20} />
            </div>
            <div>
                <h2 className="font-bold text-lg">Enterprise SQL Workbench</h2>
                <p className="text-xs text-slate-400">Interactive Data Transformation Environment</p>
            </div>
        </div>
        <div className="flex gap-3">
             <button onClick={onCancel} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">
                Discard
            </button>
            <button 
                onClick={handleFinalize}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all"
            >
                <Save size={16} /> Commit to Dashboard
            </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 bg-slate-900 border-r border-slate-700 flex flex-col">
             <div className="p-4 border-b border-slate-800">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Detected Issues & Fixes</h3>
                <div className="space-y-2">
                    {suggestions.map((s, i) => (
                        <button 
                            key={i}
                            onClick={() => loadSuggestion(s.sql)}
                            className="w-full text-left p-3 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors group"
                        >
                            <div className="flex items-center gap-2 text-sm font-medium text-slate-200 mb-1">
                                <s.icon size={14} className="text-indigo-400" /> {s.label}
                            </div>
                            <code className="text-[10px] text-slate-500 font-mono block truncate group-hover:text-indigo-300">
                                {s.sql}
                            </code>
                        </button>
                    ))}
                    {suggestions.length === 0 && (
                        <p className="text-xs text-slate-500 italic">No issues detected requiring SQL fixes.</p>
                    )}
                </div>
             </div>
             <div className="p-4 flex-1 overflow-y-auto">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Table Schema</h3>
                <div className="space-y-1">
                    {columnProfiles.map(c => (
                        <div key={c.name} className="flex justify-between items-center text-xs text-slate-400 py-1">
                            <span className="truncate w-32" title={c.name}>{c.name}</span>
                            <span className="text-slate-600 font-mono">{c.currentFormat}</span>
                        </div>
                    ))}
                </div>
             </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0">
            <div className="h-48 bg-slate-950 p-4 border-b border-slate-700 flex flex-col">
                <textarea 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1 bg-transparent text-emerald-400 font-mono text-sm outline-none resize-none"
                    spellCheck={false}
                />
                <div className="flex justify-end mt-2">
                    <button 
                        onClick={runQuery}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-bold uppercase tracking-wide flex items-center gap-2"
                    >
                        <Play size={14} /> Run Query
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-900/50 text-red-200 px-4 py-2 text-sm flex items-center gap-2 border-b border-red-900">
                    <AlertTriangle size={16} /> Error: {error}
                </div>
            )}

            <div className="flex-1 overflow-auto bg-slate-900">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-800 text-slate-400 text-xs uppercase sticky top-0">
                        <tr>
                            {result.length > 0 && Object.keys(result[0]).map(k => (
                                <th key={k} className="px-4 py-3 border-b border-slate-700 whitespace-nowrap font-mono">
                                    {k}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="text-slate-300 text-sm font-mono">
                         {result.map((row, i) => (
                            <tr key={i} className="border-b border-slate-800 hover:bg-slate-800/50">
                                {Object.values(row).map((val: any, idx) => (
                                    <td key={idx} className="px-4 py-2 whitespace-nowrap max-w-[200px] truncate">
                                        {String(val)}
                                    </td>
                                ))}
                            </tr>
                         ))}
                    </tbody>
                </table>
            </div>
            
            <div className="bg-slate-800 px-4 py-2 text-xs text-slate-400 flex justify-between">
                <span>Total Rows: {data.length}</span>
                <span className="text-indigo-300">Displaying Top {result.length} Rows (Preview)</span>
            </div>
        </div>
      </div>
    </div>
  );
};
