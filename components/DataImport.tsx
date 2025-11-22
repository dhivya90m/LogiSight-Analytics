
import React, { useState, useRef } from 'react';
import { DeliveryRecord, DataQualityReport, ColumnProfile, SchemaConfig } from '../types';
import { Upload, AlertTriangle, ShieldCheck, Wand2, FileSpreadsheet, CheckSquare, Square, Loader2, CheckCircle, Database, Search, Info, Activity, AlertOctagon, BarChart2, Terminal } from 'lucide-react';
import { read, utils } from 'xlsx';
import { generateColumnInsights } from '../services/geminiService';

interface DataImportProps {
  onImport: (data: DeliveryRecord[], schema: SchemaConfig) => void; 
  onCancel: () => void;
  onOpenWorkbench: (data: DeliveryRecord[], profiles: ColumnProfile[], schema: SchemaConfig) => void;
}

export const DataImport: React.FC<DataImportProps> = ({ onImport, onCancel, onOpenWorkbench }) => {
  const [parsedData, setParsedData] = useState<DeliveryRecord[]>([]);
  const [columnProfiles, setColumnProfiles] = useState<ColumnProfile[]>([]);
  const [detectedSchema, setDetectedSchema] = useState<SchemaConfig | null>(null);
  
  const [step, setStep] = useState<'upload' | 'analyze_columns'>('upload');
  const [fileName, setFileName] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Heuristic to guess the role of a column based on its name
  const detectSchema = (headers: string[]): SchemaConfig => {
      const findCol = (terms: string[]) => headers.find(h => terms.some(t => h.toLowerCase().includes(t))) || '';
      
      return {
          dateColumn: findCol(['date', 'placed']),
          timeColumn: findCol(['time', 'placed']),
          regionColumn: findCol(['region', 'city', 'zone']),
          totalTimeColumn: findCol(['total deliver', 'duration', 'mins']),
          orderTotalColumn: findCol(['order total', 'amount', 'price']),
          refundAmountColumn: findCol(['refund', 'return']),
          restaurantIdColumn: findCol(['restaurant id', 'store id']),
          driverIdColumn: findCol(['driver id', 'dasher id']),
          prepTimeColumn: findCol(['prep']),
          driveTimeColumn: findCol(['drive'])
      };
  };

  const analyzeColumns = async (headers: string[], data: any[]) => {
    setIsAnalyzing(true);
    const profiles: ColumnProfile[] = [];
    
    // Get AI Insights (safe sample only)
    const geminiInsights = await generateColumnInsights(headers, data);
    
    // Detect Schema
    const schema = detectSchema(headers);
    setDetectedSchema(schema);

    // Local Deep Scan of Data Quality
    headers.forEach(header => {
        // Check every row for this column
        const values = data.map(row => row[header]);
        let missingCount = 0;
        let invalidCount = 0;
        let expectedFormat = 'String';
        let currentFormat = 'Unknown';
        
        const hLower = header.toLowerCase();
        if (hLower.includes('date') || hLower.includes('time')) expectedFormat = 'Timestamp';
        else if (hLower.includes('amount') || hLower.includes('total') || hLower.includes('%') || hLower.includes('minutes')) expectedFormat = 'Number';
        else expectedFormat = 'String';

        values.forEach(v => {
            if (v === undefined || v === null || v === '') {
                missingCount++;
            } else {
                if (expectedFormat === 'Number') {
                    // Check if it's a valid number (stripping common currency chars)
                    const clean = String(v).replace(/[$,%]/g, '');
                    if (isNaN(Number(clean))) invalidCount++;
                }
            }
        });

        const firstVal = values.find(v => v !== undefined && v !== null && v !== '');
        const sample = firstVal ? String(firstVal) : 'N/A';
        
        if (!isNaN(Number(sample)) && Number(sample) > 30000 && expectedFormat === 'Timestamp') currentFormat = 'Excel Serial';
        else if (sample.includes('/')) currentFormat = 'MM/DD/YYYY';
        else if (!isNaN(Number(sample.replace(/[$,]/g,'')))) currentFormat = 'Number';
        else currentFormat = 'Text';

        const insight = geminiInsights[header];
        
        profiles.push({
            name: header,
            mappedField: header, 
            currentFormat,
            expectedFormat,
            missingCount,
            invalidCount,
            sampleValue: sample,
            isFormatValid: invalidCount === 0,
            description: insight?.description || 'Standard data column.',
            kpiUtility: insight?.kpiUtility || 'General reporting.',
            imputationTip: insight?.imputationTip || (missingCount > 0 ? 'Manual review required' : 'None needed')
        });
    });

    setColumnProfiles(profiles);
    setIsAnalyzing(false);
    setStep('analyze_columns');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = async (evt) => {
        const bstr = evt.target?.result;
        if (bstr) {
            try {
                const wb = read(bstr, { type: 'array' });
                const ws = wb.Sheets[wb.SheetNames[0]];
                
                // Robust Parsing: defval: null ensures empty cells are captured as null instead of skipped
                const jsonData = utils.sheet_to_json(ws, { defval: null, blankrows: false });
                
                const headers = jsonData.length > 0 ? Object.keys(jsonData[0] as object) : [];
                
                await analyzeColumns(headers, jsonData);
                setParsedData(jsonData as DeliveryRecord[]);
            } catch (error) {
                console.error("Error parsing Excel:", error);
                alert("Failed to parse Excel file. Please ensure it is a valid .xlsx file.");
            }
        }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleProceedToSQL = () => {
      if (detectedSchema) {
         onOpenWorkbench(parsedData, columnProfiles, detectedSchema);
      }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-6">
            <div className={`p-3 rounded-full ${step === 'upload' ? 'bg-indigo-100 text-indigo-600' : 'bg-purple-100 text-purple-600'}`}>
                {step === 'upload' && <Upload size={24} />}
                {step === 'analyze_columns' && <Search size={24} />}
            </div>
            <div>
                <h2 className="text-2xl font-bold text-slate-800">
                    {step === 'upload' ? 'Import Dataset' : 'Column Analysis & Schema'}
                </h2>
                <p className="text-slate-500">
                    {step === 'upload' ? 'Upload Excel (.xlsx) or paste data.' : 'AI-driven inspection of schema and decision utility.'}
                </p>
            </div>
        </div>

        {/* STEP 1: UPLOAD */}
        {step === 'upload' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer group"
                        onClick={() => fileInputRef.current?.click()}>
                        {isAnalyzing ? (
                             <div className="flex flex-col items-center">
                                <Loader2 className="animate-spin text-indigo-600 mb-2" size={48}/>
                                <p className="font-medium text-indigo-700">Analyzing Column Schema...</p>
                                <p className="text-xs text-slate-400 mt-1">Consulting Gemini for KPI Relevance</p>
                             </div>
                        ) : (
                            <>
                                <FileSpreadsheet className="mx-auto text-slate-400 group-hover:text-emerald-500 transition-colors mb-2" size={48} />
                                <p className="font-medium text-slate-700 group-hover:text-emerald-600 transition-colors">
                                    {fileName || "Click to upload Excel file (.xlsx)"}
                                </p>
                            </>
                        )}
                        <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload}/>
                    </div>
                </div>
                 <div className="flex flex-col justify-center p-6 bg-slate-50 rounded-xl">
                    <div className="flex items-start gap-3 mb-4">
                        <Info className="text-indigo-500 mt-1" size={20}/>
                        <div>
                            <h4 className="font-bold text-slate-800 text-sm">Enterprise Data Pipeline</h4>
                            <ul className="text-xs text-slate-600 mt-2 space-y-2 list-disc pl-4">
                                <li>Ingest Raw Excel / CSV</li>
                                <li>Automated Schema Profiling</li>
                                <li>Launch <strong>SQL Workbench</strong> for Cleaning</li>
                                <li>Commit Clean Data to Dashboard</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* STEP 2: COLUMN ANALYSIS - TABLE VIEW */}
        {step === 'analyze_columns' && (
            <div className="space-y-6">
                <div className="bg-purple-50 border border-purple-100 p-4 rounded-lg flex items-start gap-3">
                    <BarChart2 className="text-purple-600 mt-0.5" size={18}/>
                    <div>
                        <h4 className="font-bold text-purple-900 text-sm">Schema Intelligence Report</h4>
                        <p className="text-xs text-purple-700 mt-1">
                            We detected the following schema mapping. Review column health before proceeding.
                        </p>
                    </div>
                </div>
                
                {detectedSchema && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs mb-4">
                        <div className="bg-slate-100 p-2 rounded border border-slate-200">
                            <span className="text-slate-500 block">Date Col</span>
                            <span className="font-mono font-bold text-slate-800">{detectedSchema.dateColumn || 'Not Found'}</span>
                        </div>
                        <div className="bg-slate-100 p-2 rounded border border-slate-200">
                            <span className="text-slate-500 block">Region Col</span>
                            <span className="font-mono font-bold text-slate-800">{detectedSchema.regionColumn || 'Not Found'}</span>
                        </div>
                        <div className="bg-slate-100 p-2 rounded border border-slate-200">
                            <span className="text-slate-500 block">Total Time Col</span>
                            <span className="font-mono font-bold text-slate-800">{detectedSchema.totalTimeColumn || 'Not Found'}</span>
                        </div>
                        <div className="bg-slate-100 p-2 rounded border border-slate-200">
                            <span className="text-slate-500 block">Refund Col</span>
                            <span className="font-mono font-bold text-slate-800">{detectedSchema.refundAmountColumn || 'Not Found'}</span>
                        </div>
                    </div>
                )}

                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm max-h-[400px] overflow-y-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase border-b border-slate-200 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4">Column Name / Format</th>
                                <th className="px-6 py-4 w-1/4">Data Health</th>
                                <th className="px-6 py-4 w-2/5">AI Insight (Utility & Description)</th>
                                <th className="px-6 py-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {columnProfiles.map((col, idx) => {
                                const total = parsedData.length;
                                const missingPct = total > 0 ? (col.missingCount / total) * 100 : 0;
                                const invalidPct = total > 0 ? (col.invalidCount / total) * 100 : 0;
                                const validPct = 100 - missingPct - invalidPct;

                                return (
                                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-800">{col.name}</div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200 font-mono">
                                                    {col.currentFormat}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex h-2 w-full rounded-full overflow-hidden bg-slate-100 mb-2">
                                                <div style={{ width: `${validPct}%` }} className="bg-emerald-500" title="Valid"></div>
                                                <div style={{ width: `${missingPct}%` }} className="bg-slate-300" title="Missing"></div>
                                                <div style={{ width: `${invalidPct}%` }} className="bg-red-500" title="Invalid Format"></div>
                                            </div>
                                            <div className="flex items-center justify-between text-xs text-slate-500">
                                                <span className="text-emerald-600 font-medium">{Math.round(validPct)}% OK</span>
                                                <span className="flex gap-2">
                                                    {missingPct > 0 && <span className="text-slate-400">{col.missingCount} null</span>}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <div className="space-y-2">
                                                <p className="text-slate-600 text-xs leading-relaxed">{col.description}</p>
                                                <div className="flex items-start gap-1.5">
                                                    <Activity size={12} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                                                    <p className="text-xs text-indigo-700 font-medium leading-relaxed">{col.kpiUtility}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-500 italic">
                                            <div className="flex items-center gap-1 text-orange-600">
                                                {col.missingCount > 0 ? 'Check SQL' : 'Ready'}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                    <div className="mr-4 flex items-center text-xs text-slate-500">
                        Records Loaded: <span className="font-bold text-slate-800 ml-1">{parsedData.length.toLocaleString()}</span>
                    </div>
                     <button 
                        onClick={handleProceedToSQL}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors shadow-md flex items-center gap-2"
                    >
                        <Terminal size={18}/> Open SQL Workbench
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
