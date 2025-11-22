
import React, { useMemo, useState } from 'react';
import { DeliveryRecord, KPISettings, SchemaConfig } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, ComposedChart, Scatter, ScatterChart
} from 'recharts';
import { 
  Clock, DollarSign, AlertTriangle, Calendar, MapPin, Activity, ListFilter, Zap, AlertCircle, X
} from 'lucide-react';

interface DashboardProps {
  data: DeliveryRecord[];
  kpiSettings?: KPISettings;
  schema: SchemaConfig;
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

type ViewMode = 'OVERVIEW' | 'REGIONAL' | 'FINANCIAL' | 'CUSTOM';

export const Dashboard: React.FC<DashboardProps> = ({ data, kpiSettings, schema }) => {
  // --- State ---
  const [selectedDate, setSelectedDate] = useState<string>('ALL');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [selectedOrderType, setSelectedOrderType] = useState<string>('ALL'); 
  const [viewMode, setViewMode] = useState<ViewMode>('OVERVIEW');
  const [showDemoBanner, setShowDemoBanner] = useState(true);

  const [customX, setCustomX] = useState<string>(schema.regionColumn || '');
  const [customY, setCustomY] = useState<string>(schema.totalTimeColumn || '');
  const [chartType, setChartType] = useState<'BAR' | 'SCATTER' | 'LINE'>('BAR');

  const isDemoData = data.length < 200;

  // --- Helpers ---
  const parseTime = (timeStr: any): number => {
    if (!timeStr) return 0;
    const str = String(timeStr);
    const isPM = str.toUpperCase().includes('PM');
    const isAM = str.toUpperCase().includes('AM');
    let [hours, minutes] = str.replace(/(AM|PM)/i, '').trim().split(':').map(Number);
    if(isNaN(hours)) return 0;
    if (isPM && hours !== 12) hours += 12;
    if (isAM && hours === 12) hours = 0;
    return hours + (minutes / 60);
  };

  const availableDates = useMemo(() => {
    const dates = new Set(data.map(d => d[schema.dateColumn]).filter(Boolean));
    return Array.from(dates).sort();
  }, [data, schema]);

  const availableRegions = useMemo(() => {
      const regions = new Set(data.map(d => d[schema.regionColumn]).filter(Boolean));
      return Array.from(regions).sort();
  }, [data, schema]);

  const filteredData = useMemo(() => {
    return data.filter(d => {
      if (selectedDate !== 'ALL' && d[schema.dateColumn] !== selectedDate) return false;
      if (selectedRegion !== 'ALL' && d[schema.regionColumn] !== selectedRegion) return false;
      return true;
    });
  }, [data, selectedDate, selectedRegion, schema]);

  const kpis = useMemo(() => {
    const count = filteredData.length;
    const avgTime = count > 0 ? filteredData.reduce((a, b) => a + (Number(b[schema.totalTimeColumn]) || 0), 0) / count : 0;
    const totalRev = filteredData.reduce((a, b) => a + (Number(b[schema.orderTotalColumn]) || 0), 0);
    
    const lateThreshold = kpiSettings?.lateDeliveryThreshold || 60;
    const lateCount = filteredData.filter(d => (Number(d[schema.totalTimeColumn]) || 0) > lateThreshold).length;
    const latePct = count > 0 ? (lateCount / count) * 100 : 0;

    return [
      { label: 'Total Orders', value: count, icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-50' },
      { label: 'Avg Delivery Time', value: `${avgTime.toFixed(1)}m`, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'Total Revenue', value: `$${totalRev.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
      { label: 'Late Order %', value: `${latePct.toFixed(1)}%`, icon: AlertTriangle, color: latePct > 15 ? 'text-red-600' : 'text-orange-600', bg: latePct > 15 ? 'bg-red-50' : 'bg-orange-50' },
    ];
  }, [filteredData, kpiSettings, schema]);

  const timelineData = useMemo(() => {
    const sorted = [...filteredData].sort((a, b) => {
       return parseTime(a[schema.timeColumn]) - parseTime(b[schema.timeColumn]);
    });
    return sorted.map((d, i) => ({
      name: d[schema.timeColumn], 
      duration: Number(d[schema.totalTimeColumn]) || 0,
      value: Number(d[schema.orderTotalColumn]) || 0,
      prep: schema.prepTimeColumn ? (Number(d[schema.prepTimeColumn]) || 0) : 0,
      drive: schema.driveTimeColumn ? (Number(d[schema.driveTimeColumn]) || 0) : 0
    }));
  }, [filteredData, schema]);

  const regionData = useMemo(() => {
    const map: Record<string, any> = {};
    filteredData.forEach(d => {
      const r = d[schema.regionColumn] || 'Unknown';
      if (!map[r]) map[r] = { name: r, orders: 0, avgTime: 0, totalTime: 0, refunds: 0 };
      map[r].orders += 1;
      map[r].totalTime += (Number(d[schema.totalTimeColumn]) || 0);
      map[r].refunds += (Number(d[schema.refundAmountColumn]) || 0);
    });
    return Object.values(map).map((m: any) => ({
      ...m,
      avgTime: parseFloat((m.totalTime / m.orders).toFixed(1))
    }));
  }, [filteredData, schema]);

  // Custom Data Logic
  const customChartData = useMemo(() => {
     if(!customX || !customY) return [];

     if (chartType === 'SCATTER') {
         return filteredData.map(d => ({
             x: d[customX],
             y: Number(d[customY]) || 0,
             z: 1
         }));
     }

     const map: Record<string, any> = {};
     filteredData.forEach(d => {
         const key = String(d[customX]);
         const val = Number(d[customY]) || 0;
         
         if (!map[key]) map[key] = { name: key, value: 0, count: 0 };
         map[key].value += val;
         map[key].count += 1;
     });
     
     // Heuristic: if key contains 'amount' or 'total', assume SUM, else AVG
     const isSumMetric = customY.toLowerCase().includes('amount') || customY.toLowerCase().includes('total');
     
     return Object.values(map).map((m: any) => ({
         name: m.name,
         value: isSumMetric ? m.value : parseFloat((m.value / m.count).toFixed(2))
     }));

  }, [filteredData, customX, customY, chartType]);

  const availableColumns = useMemo(() => {
      return data.length > 0 ? Object.keys(data[0]) : [];
  }, [data]);


  return (
    <div className="space-y-6 animate-fadeIn pb-12">

      {isDemoData && showDemoBanner && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start justify-between shadow-sm">
              <div className="flex items-start gap-3">
                  <AlertCircle className="text-yellow-600 mt-0.5" size={20} />
                  <div>
                      <h3 className="font-bold text-yellow-800 text-sm">Viewing Demo Data ({data.length} records)</h3>
                      <p className="text-xs text-yellow-700 mt-1">
                          You are currently viewing synthetic sample data. To analyze your own 18k+ record dataset, please use the <strong>Import Data</strong> function in the sidebar.
                      </p>
                  </div>
              </div>
              <button onClick={() => setShowDemoBanner(false)} className="text-yellow-500 hover:text-yellow-700">
                  <X size={18} />
              </button>
          </div>
      )}
      
      {/* Control Center */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col xl:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0">
            
            <div className="relative group flex-shrink-0">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    <Calendar size={12}/> Order Date
                </div>
                <select 
                    value={selectedDate} 
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-40 p-2.5 font-semibold outline-none"
                >
                    <option value="ALL">All Dates</option>
                    {availableDates.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
            </div>
            
            <div className="relative group flex-shrink-0">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    <MapPin size={12}/> Delivery Region
                </div>
                <select 
                    value={selectedRegion} 
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-40 p-2.5 font-semibold outline-none"
                >
                    <option value="ALL">All Regions</option>
                    {availableRegions.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
            </div>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-lg flex-shrink-0">
            <button onClick={() => setViewMode('OVERVIEW')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'OVERVIEW' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Overview</button>
            <button onClick={() => setViewMode('REGIONAL')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'REGIONAL' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Regional</button>
            <button onClick={() => setViewMode('CUSTOM')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'CUSTOM' ? 'bg-white text-purple-700 shadow-sm' : 'text-purple-600 hover:text-purple-800'}`}><ListFilter size={16}/> Custom</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
             <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{kpi.label}</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{kpi.value}</h3>
             </div>
             <div className={`p-3 rounded-full ${kpi.bg} ${kpi.color}`}>
                <kpi.icon size={20} />
             </div>
          </div>
        ))}
      </div>

      {viewMode === 'OVERVIEW' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Volume & Efficiency ({schema.totalTimeColumn})</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={timelineData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                            <XAxis dataKey="name" hide />
                            <YAxis yAxisId="left" orientation="left" stroke="#6366f1" />
                            <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                            <Tooltip contentStyle={{ borderRadius: '8px' }} />
                            <Area yAxisId="left" type="monotone" dataKey="duration" fill="#e0e7ff" stroke="#6366f1" strokeWidth={2} />
                            <Line yAxisId="right" type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Operational Split</h3>
                <div className="h-80">
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={timelineData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="name" hide />
                            <YAxis />
                            <Tooltip />
                            <Area type="monotone" stackId="1" dataKey="prep" stroke="#f59e0b" fill="#fef3c7" />
                            <Area type="monotone" stackId="1" dataKey="drive" stroke="#3b82f6" fill="#dbeafe" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
      )}

      {viewMode === 'REGIONAL' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Avg Time by Region</h3>
                <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={regionData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                            <XAxis type="number" unit="m" />
                            <YAxis dataKey="name" type="category" width={100} />
                            <Tooltip cursor={{fill: '#f8fafc'}} />
                            <Bar dataKey="avgTime" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={30}>
                                {regionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
      )}

      {viewMode === 'CUSTOM' && (
        <div className="space-y-6 animate-fadeIn">
            <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
                <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
                    <ListFilter size={20}/> Dynamic Explorer
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-purple-800 uppercase mb-1">Group By (X-Axis)</label>
                        <select 
                          value={customX} 
                          onChange={(e) => setCustomX(e.target.value)} 
                          className="w-full p-2 rounded border border-purple-200 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            {availableColumns.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                         <label className="block text-xs font-bold text-purple-800 uppercase mb-1">Metric (Y-Axis)</label>
                         <select 
                          value={customY} 
                          onChange={(e) => setCustomY(e.target.value)} 
                          className="w-full p-2 rounded border border-purple-200 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                         >
                            {availableColumns.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-xs font-bold text-purple-800 uppercase mb-1">Chart Type</label>
                        <div className="flex bg-white rounded border border-purple-200 p-1">
                            <button onClick={() => setChartType('BAR')} className={`flex-1 py-1 text-xs font-bold rounded ${chartType === 'BAR' ? 'bg-purple-100 text-purple-700' : 'text-slate-500'}`}>Bar</button>
                            <button onClick={() => setChartType('LINE')} className={`flex-1 py-1 text-xs font-bold rounded ${chartType === 'LINE' ? 'bg-purple-100 text-purple-700' : 'text-slate-500'}`}>Line</button>
                            <button onClick={() => setChartType('SCATTER')} className={`flex-1 py-1 text-xs font-bold rounded ${chartType === 'SCATTER' ? 'bg-purple-100 text-purple-700' : 'text-slate-500'}`}>Scatter</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'SCATTER' ? (
                         <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <CartesianGrid />
                            <XAxis type="category" dataKey="x" name="Group" />
                            <YAxis type="number" dataKey="y" name="Value" />
                            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                            <Scatter name="Data" data={customChartData} fill="#8884d8" />
                        </ScatterChart>
                    ) : chartType === 'LINE' ? (
                        <LineChart data={customChartData}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                             <XAxis dataKey="name" />
                             <YAxis />
                             <Tooltip />
                             <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={3} activeDot={{ r: 8 }} />
                        </LineChart>
                    ) : (
                        <BarChart data={customChartData}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                             <XAxis dataKey="name" />
                             <YAxis />
                             <Tooltip />
                             <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>
      )}
    </div>
  );
};
