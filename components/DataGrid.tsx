import React from 'react';
import { DeliveryRecord } from '../types';

interface DataGridProps {
  data: DeliveryRecord[];
}

export const DataGrid: React.FC<DataGridProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-12rem)]">
      <div className="p-6 border-b border-slate-200 flex-shrink-0">
        <h3 className="text-lg font-semibold text-slate-800">Raw Delivery Data</h3>
        <p className="text-sm text-slate-500">Full dataset audit. Scroll horizontally to view all {Object.keys(data[0] || {}).length} columns.</p>
      </div>
      <div className="overflow-auto flex-1">
        <table className="w-full text-xs text-left text-slate-600 whitespace-nowrap">
          <thead className="text-xs text-slate-700 uppercase bg-slate-100 border-b border-slate-200 sticky top-0 z-10">
            <tr>
              {/* IDs */}
              <th className="px-4 py-3 font-bold border-r border-slate-200">ID</th>
              <th className="px-4 py-3 font-bold border-r border-slate-200">Driver ID</th>
              <th className="px-4 py-3 font-bold border-r border-slate-200">Rest. ID</th>
              <th className="px-4 py-3 font-bold border-r border-slate-200">Cust. ID</th>
              <th className="px-4 py-3 font-bold border-r border-slate-200">Region</th>
              
              {/* Timestamps */}
              <th className="px-4 py-3 bg-blue-50 border-r border-blue-100">Placed Date</th>
              <th className="px-4 py-3 bg-blue-50 border-r border-blue-100">Placed Time</th>
              <th className="px-4 py-3 bg-blue-50 border-r border-blue-100">Order w/ Rest.</th>
              <th className="px-4 py-3 bg-blue-50 border-r border-blue-100">Driver @ Rest.</th>
              <th className="px-4 py-3 bg-blue-50 border-r border-blue-100">Delivered Date</th>
              <th className="px-4 py-3 bg-blue-50 border-r border-blue-100">Delivered Time</th>
              <th className="px-4 py-3 bg-indigo-50 font-bold border-r border-indigo-100">Total Time (m)</th>
              
              {/* Details */}
              <th className="px-4 py-3 border-r border-slate-200">ASAP</th>
              
              {/* Financials */}
              <th className="px-4 py-3 text-emerald-700 border-r border-slate-200">Total ($)</th>
              <th className="px-4 py-3 border-r border-slate-200">Disc ($)</th>
              <th className="px-4 py-3 border-r border-slate-200">Disc (%)</th>
              <th className="px-4 py-3 border-r border-slate-200">Tip ($)</th>
              <th className="px-4 py-3 border-r border-slate-200">Tip (%)</th>
              <th className="px-4 py-3 text-red-600 border-r border-slate-200">Refund ($)</th>
              <th className="px-4 py-3 text-red-600">Refund (%)</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} className="bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-2 font-mono text-slate-500 border-r border-slate-100">{row.id}</td>
                <td className="px-4 py-2 border-r border-slate-100">{row.driverId}</td>
                <td className="px-4 py-2 border-r border-slate-100">{row.restaurantId}</td>
                <td className="px-4 py-2 border-r border-slate-100">{row.consumerId}</td>
                <td className="px-4 py-2 border-r border-slate-100 font-medium">{row.deliveryRegion}</td>
                
                <td className="px-4 py-2 border-r border-slate-100">{row.customerPlacedOrderDate}</td>
                <td className="px-4 py-2 border-r border-slate-100">{row.customerPlacedOrderTime}</td>
                <td className="px-4 py-2 border-r border-slate-100">{row.orderWithRestaurantTime}</td>
                <td className="px-4 py-2 border-r border-slate-100">{row.driverAtRestaurantTime}</td>
                <td className="px-4 py-2 border-r border-slate-100">{row.deliveredToConsumerDate}</td>
                <td className="px-4 py-2 border-r border-slate-100">{row.deliveredToConsumerTime}</td>
                <td className={`px-4 py-2 border-r border-slate-100 font-bold ${row.totalDeliveryTimeMinutes > 60 ? 'text-red-600' : 'text-slate-700'}`}>
                  {row.totalDeliveryTimeMinutes?.toFixed(1)}
                </td>
                
                <td className="px-4 py-2 border-r border-slate-100">{row.isAsap ? 'Yes' : 'No'}</td>
                
                <td className="px-4 py-2 border-r border-slate-100 font-medium">${row.orderTotal?.toFixed(2)}</td>
                <td className="px-4 py-2 border-r border-slate-100">{row.amountOfDiscount > 0 ? `$${row.amountOfDiscount}` : '-'}</td>
                <td className="px-4 py-2 border-r border-slate-100">{row.percentDiscount > 0 ? `${(row.percentDiscount * 100).toFixed(0)}%` : '-'}</td>
                <td className="px-4 py-2 border-r border-slate-100">{row.amountOfTip > 0 ? `$${row.amountOfTip}` : '-'}</td>
                <td className="px-4 py-2 border-r border-slate-100">{row.percentTip > 0 ? `${(row.percentTip * 100).toFixed(0)}%` : '-'}</td>
                <td className="px-4 py-2 border-r border-slate-100 font-medium text-red-600">{row.refundedAmount > 0 ? `$${row.refundedAmount}` : '-'}</td>
                <td className="px-4 py-2 text-red-600">{row.refundPercentage > 0 ? `${(row.refundPercentage * 100).toFixed(0)}%` : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};