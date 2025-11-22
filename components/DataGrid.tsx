
import React from 'react';
import { DeliveryRecord } from '../types';

interface DataGridProps {
  data: DeliveryRecord[];
}

export const DataGrid: React.FC<DataGridProps> = ({ data }) => {
  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-12rem)]">
      <div className="p-6 border-b border-slate-200 flex-shrink-0">
        <h3 className="text-lg font-semibold text-slate-800">Raw Delivery Data</h3>
        <p className="text-sm text-slate-500">Full dataset audit. Displaying all {data.length} rows.</p>
      </div>
      <div className="overflow-auto flex-1">
        <table className="w-full text-xs text-left text-slate-600 whitespace-nowrap">
          <thead className="text-xs text-slate-700 uppercase bg-slate-100 border-b border-slate-200 sticky top-0 z-10">
            <tr>
              {columns.map(col => (
                  <th key={col} className="px-4 py-3 bg-slate-50 border-r border-slate-200 font-bold">
                      {col}
                  </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} className="bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors">
                {columns.map(col => (
                    <td key={col} className="px-4 py-2 border-r border-slate-100">
                        {String(row[col] ?? '')}
                    </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
