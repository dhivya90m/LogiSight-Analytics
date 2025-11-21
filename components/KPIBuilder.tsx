import React from 'react';
import { KPISettings } from '../types';
import { Settings, Sliders, Save } from 'lucide-react';

interface KPIBuilderProps {
  settings: KPISettings;
  onUpdate: (newSettings: KPISettings) => void;
}

export const KPIBuilder: React.FC<KPIBuilderProps> = ({ settings, onUpdate }) => {
  
  const handleChange = (key: keyof KPISettings, value: number) => {
    onUpdate({
        ...settings,
        [key]: value
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
             <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
                <div className="p-3 bg-slate-100 rounded-full text-slate-600">
                    <Settings size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Operational KPI Settings</h2>
                    <p className="text-slate-500">Define the thresholds that trigger alerts and automation rules across the platform.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Delivery Time Thresholds */}
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                        <Sliders size={18} /> Efficiency Metrics
                    </h3>
                    
                    <div>
                        <label className="flex justify-between text-sm font-medium text-slate-700 mb-2">
                            <span>"Late Delivery" Threshold</span>
                            <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{settings.lateDeliveryThreshold} mins</span>
                        </label>
                        <input 
                            type="range" min="30" max="120" step="5"
                            value={settings.lateDeliveryThreshold}
                            onChange={(e) => handleChange('lateDeliveryThreshold', Number(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                        <p className="text-xs text-slate-400 mt-1">Orders taking longer than this are flagged as Critical.</p>
                    </div>

                    <div>
                        <label className="flex justify-between text-sm font-medium text-slate-700 mb-2">
                            <span>Max Acceptable Prep Time</span>
                            <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{settings.maxAcceptablePrepTime} mins</span>
                        </label>
                        <input 
                            type="range" min="5" max="60" step="1"
                            value={settings.maxAcceptablePrepTime}
                            onChange={(e) => handleChange('maxAcceptablePrepTime', Number(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                        <p className="text-xs text-slate-400 mt-1">Threshold for identifying merchant-side delays.</p>
                    </div>
                </div>

                {/* Financial Thresholds */}
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                        <Sliders size={18} /> Financial & Risk Metrics
                    </h3>

                    <div>
                         <label className="flex justify-between text-sm font-medium text-slate-700 mb-2">
                            <span>High Refund Alert ($)</span>
                            <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">${settings.highRefundThreshold}</span>
                        </label>
                        <input 
                            type="range" min="10" max="200" step="5"
                            value={settings.highRefundThreshold}
                            onChange={(e) => handleChange('highRefundThreshold', Number(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                         <p className="text-xs text-slate-400 mt-1">Refunds above this amount require manual review.</p>
                    </div>

                     <div>
                         <label className="flex justify-between text-sm font-medium text-slate-700 mb-2">
                            <span>Max Acceptable Drive Time</span>
                            <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{settings.maxAcceptableDriveTime} mins</span>
                        </label>
                        <input 
                            type="range" min="10" max="90" step="5"
                            value={settings.maxAcceptableDriveTime}
                            onChange={(e) => handleChange('maxAcceptableDriveTime', Number(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                         <p className="text-xs text-slate-400 mt-1">Threshold for identifying dasher-side delays.</p>
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                <button className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors flex items-center gap-2 shadow-sm">
                    <Save size={18} /> Save Configuration
                </button>
            </div>
        </div>
    </div>
  );
};