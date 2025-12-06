
import React from 'react';
import { Company } from '../../types';
import { getCompanyStatusStyles, getWorkTypeStyles } from '../../utils';
import { Eye, Trash2, Edit2, MoreHorizontal } from 'lucide-react';

interface CompaniesTableProps {
  data: Company[];
  isLoading: boolean;
  onEdit: (company: Company) => void;
  onDelete: (id: number) => void;
}

export const CompaniesTable: React.FC<CompaniesTableProps> = ({ data, isLoading, onEdit, onDelete }) => {
  if (isLoading) {
    return (
      <div className="p-20 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-gray-100 border-t-brand-600 mx-auto"></div>
        <p className="mt-4 text-gray-400 font-medium animate-pulse">Loading Companies...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="p-20 text-center bg-white">
        <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <MoreHorizontal className="h-8 w-8 text-gray-300" />
        </div>
        <h3 className="text-gray-900 font-bold text-lg">No companies found</h3>
        <p className="text-gray-500 mt-1">Try adjusting your filters or create a new company.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto custom-scrollbar bg-white min-h-[500px]">
      <table className="w-full text-left border-collapse whitespace-nowrap">
        <thead>
          <tr className="bg-gray-50/50 border-b border-gray-100">
            <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider w-16 text-center">SL No</th>
            <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Reference ID</th>
            <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Client Name</th>
            <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Work Info</th>
            <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
            <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.map((row, index) => (
            <tr key={row.id} className="group hover:bg-gray-50/80 transition-all duration-200">
              
              {/* SL No */}
              <td className="px-6 py-4 text-center">
                <span className="text-xs font-medium text-gray-400">{(index + 1).toString().padStart(2, '0')}</span>
              </td>

              {/* Reference ID */}
              <td className="px-6 py-4">
                 <span className="text-xs font-mono font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {row.referenceId}
                 </span>
              </td>

              {/* Client Name */}
              <td className="px-6 py-4">
                <span className="font-bold text-gray-900 text-sm group-hover:text-brand-600 transition-colors">
                    {row.name}
                </span>
              </td>

              {/* Work Info (Chips) */}
              <td className="px-6 py-4">
                 <div className="flex flex-wrap gap-1.5 max-w-[280px]">
                    {row.work.map(w => (
                         <span key={w} className={`px-2 py-1 text-[10px] font-semibold rounded-md border ${getWorkTypeStyles(w)}`}>
                            {w}
                         </span>
                    ))}
                    {row.work.length === 0 && <span className="text-gray-300 text-xs">-</span>}
                 </div>
              </td>

              {/* Status Badge */}
              <td className="px-6 py-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold ring-1 inset ring-opacity-10 capitalize ${getCompanyStatusStyles(row.status)}`}>
                   <span className="w-1.5 h-1.5 rounded-full bg-current mr-2 opacity-60"></span>
                   {row.status.replace('_', ' ')}
                </span>
              </td>

              {/* Actions */}
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                    <button 
                        onClick={() => onEdit(row)} 
                        className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Edit"
                    >
                        <Edit2 className="h-4 w-4" />
                    </button>
                    <button 
                        onClick={() => onDelete(row.id)} 
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Delete"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
