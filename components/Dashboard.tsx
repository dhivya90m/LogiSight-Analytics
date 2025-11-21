import React, { useMemo } from 'react';
import { DeliveryRecord, KPISettings } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Clock, DollarSign, AlertTriangle, TrendingUp } from 'lucide-react';

interface DashboardProps {
  data: DeliveryRecord[];
  kpiSettings?: KPISettings;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export const Dashboard: React.FC<DashboardProps> = ({ data, kpiSettings }) => {
  
  // Use default settings if not provided
  const thresholdTime = kpiSettings?.lateDeliveryThreshold || 60;
  
  const kpis = useMemo(() => {
    const totalOrders = data.length;
    const avgTime = data.reduce((acc, curr) => acc + curr.totalDeliveryTimeMinutes, 0) / (totalOrders || 1);
    const totalRefunds = data.reduce((acc, curr) => acc + curr.refundedAmount, 0);
    const refundRate = totalOrders > 0 ? (data.filter(d => d.refundedAmount > 0).length / totalOrders) * 100 : 0;
    
    return [
      { label: 'Avg Delivery Time', value: `${avgTime.toFixed(1)} min`, icon: Clock, color: 'text-blue-600' },
      { label: 'Total Refunded', value: `$${totalRefunds.toFixed(2)}`, icon: DollarSign, color: 'text-red-600' },
      { label: 'Refund Rate', value: `${refundRate.toFixed(1)}%`, icon: AlertTriangle, color: 'text-orange-500' },
      { label: 'Total Orders', value: totalOrders.toString(), icon: TrendingUp, color: 'text-emerald-600' },
    ];
  }, [data]);

  const regionData = useMemo(() => {
    const map: Record<string, { region: string, time: number, count: number }> = {};
    data.forEach(d => {
      const region = d.deliveryRegion || 'Unknown';
      if (!map[region]) {
        map[region] = { region: region, time: 0, count: 0 };
      }
      map[region].time += d.totalDeliveryTimeMinutes;
      map[region].count += 1;
    });
    return Object.values(map).map(item => ({
      name: item.region,
      avgTime: parseFloat((item.time / item.count).toFixed(1))
    }));
  }, [data]);

  const refundReasonData = useMemo(() => {
    const lateOrders = data.filter(d => d.totalDeliveryTimeMinutes > thresholdTime).length;
    const onTimeOrders = data.length - lateOrders;
    return [
      { name: `> ${thresholdTime} Mins (High Risk)`, value: lateOrders },
      { name: `< ${thresholdTime} Mins (Healthy)`, value: onTimeOrders },
    ];
  }, [data, thresholdTime]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{kpi.value}</h3>
              </div>
              <div className={`p-2 rounded-lg bg-slate-50 ${kpi.color}`}>
                <kpi.icon size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regional Performance Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Avg Delivery Time by Region</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} unit="m" />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f1f5f9' }}
                />
                <Bar dataKey="avgTime" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Avg Minutes" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Delivery Health Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Delivery Health (KPI Adjusted)</h3>
          <div className="h-80 flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={refundReasonData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {refundReasonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Outlier Analysis */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
         <h3 className="text-lg font-semibold text-slate-800 mb-4">Outlier Detection: Duration vs Order Value</h3>
         <p className="text-sm text-slate-500 mb-4">Identifies high-value orders that suffered from extreme delays (potential high churn risk).</p>
         <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.sort((a,b) => a.totalDeliveryTimeMinutes - b.totalDeliveryTimeMinutes)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/>
                    <XAxis dataKey="id" hide />
                    <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" stroke="#10b981" label={{ value: 'Order $', angle: 90, position: 'insideRight' }} />
                    <Tooltip />
                    <Line yAxisId="left" type="monotone" dataKey="totalDeliveryTimeMinutes" stroke="#3b82f6" dot={false} strokeWidth={2} name="Duration (min)" />
                    <Line yAxisId="right" type="monotone" dataKey="orderTotal" stroke="#10b981" dot={false} strokeWidth={2} name="Order Total ($)" />
                </LineChart>
            </ResponsiveContainer>
         </div>
      </div>
    </div>
  );
};