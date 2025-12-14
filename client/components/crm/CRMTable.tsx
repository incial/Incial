
import React, { useState, useRef, useEffect } from 'react';
import { CRMEntry, CRMStatus } from '../../types';
import { getStatusStyles, formatDate, getFollowUpColor } from '../../utils';
import { Phone, Mail, Eye, Trash2, MoreHorizontal, ChevronDown, Check, User, Calendar } from 'lucide-react';

interface CRMTableProps {
  data: CRMEntry[];
  isLoading: boolean;
  onView: (entry: CRMEntry) => void;
  onDelete: (id: number) => void;
  onStatusChange: (entry: CRMEntry, newStatus: CRMStatus) => void;
}

const AvatarPlaceholder = ({ name }: { name?: string }) => {
    const safeName = name || 'Unknown';
    const initials = safeName
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
    
    // Gradient backgrounds for a premium feel
    const gradients = [
        'from-blue-100 to-blue-50 text-blue-600',
        'from-indigo-100 to-indigo-50 text-indigo-600',
        'from-emerald-100 to-emerald-50 text-emerald-600',
        'from-amber-100 to-amber-50 text-amber-600',
        'from-rose-100 to-rose-50 text-rose-600',
        'from-violet-100 to-violet-50 text-violet-600'
    ];
    const colorClass = gradients[safeName.length % gradients.length];

    return (
        <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center text-xs font-bold shadow-sm border border-white/50`}>
            {initials}
        </div>
    );
};

const StatusDropdown = ({ entry, onStatusChange }: { entry: CRMEntry; onStatusChange: (e: CRMEntry, s: CRMStatus) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    
    const options: CRMStatus[] = [
        'lead', 
        'on progress', 
        'Quote Sent', 
        'onboarded', 
        'completed', 
        'drop'
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const formatStatus = (s: string) => {
        if (s === 'Quote Sent') return 'Quote Sent';
        return s.charAt(0).toUpperCase() + s.slice(1);
    }

    return (
        <div className="relative inline-block" ref={ref}>
            <button 
                onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border shadow-sm transition-all hover:opacity-90 active:scale-95 capitalize whitespace-nowrap ${getStatusStyles(entry.status)}`}
            >
                {formatStatus(entry.status)}
                <ChevronDown className={`h-3 w-3 opacity-50 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isOpen && (
                <div className="absolute top-full left-0 z-50 mt-2 w-40 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-1.5">
                        {options.map(opt => (
                            <button
                                key={opt}
                                onClick={(e) => { e.stopPropagation(); onStatusChange(entry, opt); setIsOpen(false); }}
                                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-lg text-left transition-colors capitalize ${
                                    entry.status === opt 
                                    ? 'bg-brand-50 text-brand-700' 
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                            >
                                {formatStatus(opt)}
                                {entry.status === opt && <Check className="h-3 w-3 text-brand-600 ml-auto" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export const CRMTable: React.FC<CRMTableProps> = ({ data, isLoading, onView, onDelete, onStatusChange }) => {
  if (isLoading) {
    return (
      <div className="p-32 text-center flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-[3px] border-gray-100 border-t-brand-600 mb-4"></div>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest animate-pulse">Loading Pipeline...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="p-20 text-center bg-white">
        <div className="h-16 w-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
            <User className="h-8 w-8 text-gray-300" />
        </div>
        <h3 className="text-gray-900 font-bold text-lg">No records found</h3>
        <p className="text-gray-500 mt-1 text-sm">Try adjusting your filters or create a new deal.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto custom-scrollbar bg-white min-h-[500px] pb-32">
      <table className="w-full text-left border-collapse whitespace-nowrap">
        <thead>
          <tr className="bg-white border-b border-gray-100">
            <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest sticky left-0 bg-white z-10 w-72">Contact / Company</th>
            <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Lead Source</th>
            <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
            <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Work Type</th>
            <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Follow Up</th>
            <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Assigned</th>
            <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.map((row) => (
            <tr key={row.id} className="group hover:bg-slate-50/50 transition-colors duration-200">
              {/* Name & Company - Sticky Column */}
              <td className="px-6 py-4 sticky left-0 bg-white group-hover:bg-slate-50/50 transition-colors border-r border-transparent group-hover:border-gray-100 z-10">
                <div className="flex items-center gap-4">
                  <AvatarPlaceholder name={row.contactName} />
                  <div className="flex flex-col min-w-0">
                    <button onClick={() => onView(row)} className="font-bold text-gray-900 text-sm group-hover:text-brand-600 transition-colors text-left truncate">
                        {row.contactName || 'No Name'}
                    </button>
                    <span className="text-xs font-medium text-gray-500 truncate max-w-[140px]">{row.company || 'No Company'}</span>
                    
                    {/* Hover Quick Actions */}
                    <div className="flex gap-2 mt-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                        <a href={`tel:${row.phone}`} className="p-1 rounded-md hover:bg-brand-50 text-gray-400 hover:text-brand-600 transition-colors" title={row.phone}><Phone className="h-3 w-3" /></a>
                        <a href={`mailto:${row.email}`} className="p-1 rounded-md hover:bg-brand-50 text-gray-400 hover:text-brand-600 transition-colors" title={row.email}><Mail className="h-3 w-3" /></a>
                    </div>
                  </div>
                </div>
              </td>

              {/* Lead Source */}
              <td className="px-6 py-4">
                {row.leadSources && row.leadSources.length > 0 ? (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-gray-50 text-gray-600 border border-gray-200">
                    {row.leadSources[0]}
                  </span>
                ) : (
                  <span className="text-gray-300 text-xs">-</span>
                )}
              </td>

              {/* Status */}
              <td className="px-6 py-4">
                <StatusDropdown entry={row} onStatusChange={onStatusChange} />
              </td>

              {/* Work Type (Tags) */}
              <td className="px-6 py-4">
                 <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                    {(row.work || []).slice(0, 2).map((w: any) => {
                         const label = typeof w === 'object' ? w.name : w;
                         return (
                            <span key={label} className="px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-md border border-blue-100/50 uppercase tracking-tight">{label}</span>
                         );
                    })}
                    {(row.work || []).length > 2 && (
                        <span className="px-2 py-1 text-[10px] font-bold text-gray-400 bg-gray-50 rounded-md border border-gray-100">+{ (row.work || []).length - 2}</span>
                    )}
                    {(!row.work?.length) && <span className="text-gray-300 text-xs">-</span>}
                 </div>
              </td>

              {/* Follow Up */}
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${getFollowUpColor(row.nextFollowUp).includes('red') ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-400'}`}>
                        <Calendar className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex flex-col">
                        <span className={`text-xs font-bold ${getFollowUpColor(row.nextFollowUp)}`}>
                            {formatDate(row.nextFollowUp)}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">Last: {formatDate(row.lastContact)}</span>
                    </div>
                </div>
              </td>

              {/* Assigned */}
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-lg bg-gradient-to-tr from-gray-100 to-gray-50 text-[10px] flex items-center justify-center text-gray-600 font-bold border border-gray-200 shadow-sm">
                        {row.assignedTo ? row.assignedTo.charAt(0).toUpperCase() : '?'}
                    </div>
                    <span className="text-xs font-semibold text-gray-700">{row.assignedTo || 'Unassigned'}</span>
                </div>
              </td>

              {/* Actions */}
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
                    <button 
                        onClick={() => onView(row)} 
                        className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                        title="View Details"
                    >
                        <Eye className="h-4 w-4" />
                    </button>
                    <button 
                        onClick={() => onDelete(row.id)} 
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
