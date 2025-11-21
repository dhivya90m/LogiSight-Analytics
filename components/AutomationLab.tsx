import React, { useState } from 'react';
import { DeliveryRecord } from '../types';
import { Zap, Play, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AutomationLabProps {
  data: DeliveryRecord[];
}

export const AutomationLab: React.FC<AutomationLabProps> = ({ data }) => {
  const [timeThreshold, setTimeThreshold] = useState<number>(60);
  const [actionType, setActionType] = useState<string>('credit_5');
  const [simulationResult, setSimulationResult] = useState<{ impactedOrders: number; estimatedCost: number; hoursSaved: number } | null>(null);

  const runSimulation = () => {
    const impacted = data.filter(d => d.totalDeliveryTimeMinutes >= timeThreshold);
    const count = impacted.length;
    
    let costPerAction = 0;
    if (actionType === 'credit_5') costPerAction = 5;
    if (actionType === 'credit_10') costPerAction = 10;
    if (actionType === 'full_refund') {
        // Averaging impact for dynamic refunds
        costPerAction = impacted.reduce((acc, curr) => acc + curr.orderTotal, 0) / (count || 1);
    }

    // Assumption: Each automated action saves 15 minutes of support agent time
    const hoursSaved = (count * 15) / 60; 

    setSimulationResult({
      impactedOrders: count,
      estimatedCost: count * costPerAction,
      hoursSaved: hoursSaved
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl p-8 text-white shadow-lg">
            <h2 className="text-3xl font-bold mb-2">Automation Impact Simulator</h2>
            <p className="text-indigo-100 max-w-2xl">
                Design and test support automation rules against historical data to validate business cases before deployment. 
                Balance customer experience costs against operational efficiency gains.
            </p>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Zap className="text-yellow-500" size={20}/> Rule Configuration
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Trigger Condition: Delivery Time &gt; X Minutes
              </label>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="30" 
                  max="180" 
                  step="5" 
                  value={timeThreshold} 
                  onChange={(e) => setTimeThreshold(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <span className="font-mono font-bold text-indigo-600 w-12">{timeThreshold}m</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Automated Action
              </label>
              <select 
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                value={actionType}
                onChange={(e) => setActionType(e.target.value)}
              >
                <option value="credit_5">Issue $5 Credit</option>
                <option value="credit_10">Issue $10 Credit</option>
                <option value="full_refund">Issue Full Refund</option>
                <option value="email_apology">Send Apology Email (No Cost)</option>
              </select>
            </div>

            <button 
              onClick={runSimulation}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              <Play size={18} fill="currentColor" /> Run Simulation
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center min-h-[400px]">
          {!simulationResult ? (
            <div className="text-center text-slate-400">
              <Zap size={48} className="mx-auto mb-4 opacity-20" />
              <p>Configure a rule and run simulation to see projected impact.</p>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-xl font-bold text-slate-800">Projected Business Impact</h3>
                <span className="text-sm bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-medium">Based on historical sample</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                    <p className="text-sm text-orange-600 font-medium mb-1">Orders Impacted</p>
                    <p className="text-3xl font-bold text-orange-900">{simulationResult.impactedOrders}</p>
                    <p className="text-xs text-orange-700 mt-2">Tickets deflected automatically</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                    <p className="text-sm text-red-600 font-medium mb-1">Est. Cost Impact</p>
                    <p className="text-3xl font-bold text-red-900">${simulationResult.estimatedCost.toFixed(2)}</p>
                    <p className="text-xs text-red-700 mt-2">Direct revenue displacement</p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                    <p className="text-sm text-emerald-600 font-medium mb-1">Support Hours Saved</p>
                    <p className="text-3xl font-bold text-emerald-900">{simulationResult.hoursSaved.toFixed(1)} hrs</p>
                    <p className="text-xs text-emerald-700 mt-2">@ 15min avg handle time</p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    {simulationResult.hoursSaved * 25 > simulationResult.estimatedCost ? <CheckCircle2 className="text-green-600"/> : <AlertCircle className="text-yellow-600"/>}
                    Automated Recommendation
                </h4>
                <p className="text-slate-600 text-sm">
                    {simulationResult.hoursSaved * 25 > simulationResult.estimatedCost 
                        ? "POSITIVE ROI: The operational savings (assuming $25/hr agent cost) outweigh the refund costs. This rule is recommended for deployment."
                        : "NEGATIVE ROI: The direct costs of this automation exceed estimated operational savings. Consider narrowing the time threshold or reducing the credit amount."
                    }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};