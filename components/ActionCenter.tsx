import React, { useMemo } from 'react';
import { DeliveryRecord, KPISettings } from '../types';
import { AlertTriangle, User, Store, Car, Mail, Ban, DollarSign, CheckCircle2 } from 'lucide-react';

interface ActionCenterProps {
  data: DeliveryRecord[];
  settings: KPISettings;
}

export const ActionCenter: React.FC<ActionCenterProps> = ({ data, settings }) => {
  
  const actionItems = useMemo(() => {
    const items: any[] = [];

    data.forEach(order => {
        // Merchant Issues
        const prepTime = order.prepTimeMinutes || order.totalDeliveryTimeMinutes * 0.3; // Fallback
        if (prepTime > settings.maxAcceptablePrepTime) {
            items.push({
                id: `act-m-${order.id}`,
                orderId: order.id,
                stakeholder: 'Merchant',
                issueType: 'Slow Prep Time',
                value: `${Math.round(prepTime)}m`,
                suggestedAction: 'Send Process Improvement Email',
                icon: Store,
                color: 'text-orange-600',
                bg: 'bg-orange-50'
            });
        }

        // Dasher Issues
        const driveTime = order.driveTimeMinutes || order.totalDeliveryTimeMinutes * 0.7; // Fallback
        if (driveTime > settings.maxAcceptableDriveTime) {
            items.push({
                id: `act-d-${order.id}`,
                orderId: order.id,
                stakeholder: 'Dasher',
                issueType: 'High Drive Time',
                value: `${Math.round(driveTime)}m`,
                suggestedAction: 'Flag for Route Review',
                icon: Car,
                color: 'text-blue-600',
                bg: 'bg-blue-50'
            });
        }

        // Customer Issues
        if (order.refundedAmount > 0) {
             items.push({
                id: `act-c-${order.id}`,
                orderId: order.id,
                stakeholder: 'Customer',
                issueType: 'Refund Processed',
                value: `$${order.refundedAmount}`,
                suggestedAction: order.refundedAmount > settings.highRefundThreshold ? 'Personal Follow-up Required' : 'Automated Apology Sent',
                icon: User,
                color: 'text-purple-600',
                bg: 'bg-purple-50'
            });
        }
    });
    return items;
  }, [data, settings]);

  return (
    <div className="space-y-6 animate-fadeIn">
        <div className="bg-slate-900 text-white p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold mb-2">Operations Action Center</h2>
            <p className="text-slate-300 text-sm">
                Monitoring the 3-sided marketplace. Detected <span className="font-bold text-white">{actionItems.length}</span> requiring attention based on current KPIs.
            </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Merchant Column */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-orange-50 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Store size={20} className="text-orange-600"/> Merchant Actions
                    </h3>
                    <span className="bg-white text-orange-700 px-2 py-1 rounded-full text-xs font-bold shadow-sm">
                        {actionItems.filter(i => i.stakeholder === 'Merchant').length}
                    </span>
                </div>
                <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
                    {actionItems.filter(i => i.stakeholder === 'Merchant').map(item => (
                        <div key={item.id} className="border border-slate-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-mono text-slate-400">#{item.orderId}</span>
                                <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded">{item.value} prep</span>
                            </div>
                            <p className="font-medium text-slate-800 text-sm mb-3">{item.issueType}</p>
                            <button className="w-full py-2 border border-orange-200 text-orange-700 text-xs font-bold rounded hover:bg-orange-50 flex items-center justify-center gap-2">
                                <Mail size={14}/> {item.suggestedAction}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Dasher Column */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-blue-50 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Car size={20} className="text-blue-600"/> Dasher Actions
                    </h3>
                    <span className="bg-white text-blue-700 px-2 py-1 rounded-full text-xs font-bold shadow-sm">
                        {actionItems.filter(i => i.stakeholder === 'Dasher').length}
                    </span>
                </div>
                <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
                    {actionItems.filter(i => i.stakeholder === 'Dasher').map(item => (
                         <div key={item.id} className="border border-slate-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-mono text-slate-400">#{item.orderId}</span>
                                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">{item.value} drive</span>
                            </div>
                            <p className="font-medium text-slate-800 text-sm mb-3">{item.issueType}</p>
                            <button className="w-full py-2 border border-blue-200 text-blue-700 text-xs font-bold rounded hover:bg-blue-50 flex items-center justify-center gap-2">
                                <Ban size={14}/> {item.suggestedAction}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Customer Column */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-purple-50 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <User size={20} className="text-purple-600"/> Customer Actions
                    </h3>
                    <span className="bg-white text-purple-700 px-2 py-1 rounded-full text-xs font-bold shadow-sm">
                        {actionItems.filter(i => i.stakeholder === 'Customer').length}
                    </span>
                </div>
                <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
                     {actionItems.filter(i => i.stakeholder === 'Customer').map(item => (
                         <div key={item.id} className="border border-slate-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-mono text-slate-400">#{item.orderId}</span>
                                <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded">{item.value}</span>
                            </div>
                            <p className="font-medium text-slate-800 text-sm mb-3">{item.issueType}</p>
                            <button className="w-full py-2 border border-purple-200 text-purple-700 text-xs font-bold rounded hover:bg-purple-50 flex items-center justify-center gap-2">
                                <DollarSign size={14}/> {item.suggestedAction}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
};