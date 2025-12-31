
import React, { useState, useRef, useEffect } from 'react';
import { CRMEntry, CRMStatus } from '../../types';
import { getStatusStyles, getWorkTypeStyles } from '../../utils';
import { Hash, User, HardDrive, Globe, ChevronDown, Check, Building } from 'lucide-react';
import { createPortal } from 'react-dom';
import { PremiumLogo } from '../ui/PremiumLogo';

interface CompaniesTableProps {
  data: CRMEntry[];
  isLoading: boolean;
  onView: (company: CRMEntry) => void;
  onStatusChange: (company: CRMEntry, newStatus: CRMStatus) => void;
}

const CompanyStatusDropdown = ({ company, onStatusChange }: { company: CRMEntry; onStatusChange: (c: CRMEntry, s: CRMStatus) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    // Filtered out 'on progress' and 'Quote Sent' as they are CRM stages
    const options: CRMStatus[] = ['onboarded', 'completed', 'drop'];

    const updateCoords = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setCoords({ top: rect.bottom + 8, left: rect.left });
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isOpen && triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
                const portal = document.getElementById(`company-status-portal-${company.id}`);
                if (portal && portal.contains(event.target as Node)) {
                    return;
                }
                setIsOpen(false);
            }
        };

        if (isOpen) {
            updateCoords();
            window.addEventListener('scroll', updateCoords, true);
            window.addEventListener('resize', updateCoords);
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            window.removeEventListener('scroll', updateCoords, true);
            window.removeEventListener('resize', updateCoords);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, company.id]);

    const formatStatus = (s: string) => {
        if (s === 'Quote Sent') return 'Quote Sent';
        return s.charAt(0).toUpperCase() + s.slice(1);
    }

    const menuContent = isOpen && (
        <div 
            id={`company-status-portal-${company.id}`}
            className="fixed z-[9999] mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200"
            style={{ top: coords.top, left: coords.left }}
        >
            <div className="p-1">
                {options.map(opt => (
                    <button
                        key={opt}
                        onClick={(e) => { 
                            e.preventDefault();
                            e.stopPropagation(); 
                            onStatusChange(company, opt); 
                            setIsOpen(false); 
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-lg text-left transition-colors capitalize ${
                            company.status === opt ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                    >
                        {formatStatus(opt)}
                        {company.status === opt && <Check className="h-3 w-3 text-brand-600 ml-auto" />}
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div className="relative inline-block">
            <button 
                ref={triggerRef}
                onClick={(e) => { 
                    e.preventDefault();
                    e.stopPropagation(); 
                    setIsOpen(!isOpen); 
                }}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border shadow-sm transition-all hover:opacity-90 active:scale-95 capitalize whitespace-nowrap ${getStatusStyles(company.status)}`}
            >
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></span>
                {formatStatus(company.status)}
                <ChevronDown className={`h-3 w-3 opacity-50 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isOpen && createPortal(menuContent, document.body)}
        </div>
    );
};

export const CompaniesTable: React.FC<CompaniesTableProps> = ({ data, isLoading, onView, onStatusChange }) => {
  if (isLoading) {
    return (
      <div className="p-32 text-center flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-[3px] border-gray-100 border-t-brand-600 mb-4"></div>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest animate-pulse">Loading Registry...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="p-20 text-center bg-white rounded-b-[3rem]">
        <div className="h-16 w-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
            <Building className="h-8 w-8 text-gray-300" />
        </div>
        <h3 className="text-gray-900 font-bold text-lg">No companies found</h3>
        <p className="text-gray-500 mt-1 text-sm">This section displays active onboarded deals from CRM.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white">
      <div className="overflow-x-auto overflow-y-auto max-h-[600px] custom-scrollbar">
        <table className="min-w-[1100px] w-full text-left border-collapse whitespace-nowrap">
          <thead className="z-30">
            <tr className="border-b border-gray-100">
              <th className="sticky top-0 z-30 bg-white px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-16 text-center">No.</th>
              <th className="sticky top-0 z-30 bg-white px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reference ID</th>
              <th className="sticky top-0 z-30 bg-white px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Company Name</th>
              <th className="sticky top-0 z-30 bg-white px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Contact Person</th>
              <th className="sticky top-0 z-30 bg-white px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Work Info</th>
              <th className="sticky top-0 z-30 bg-white px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((row, index) => {
               const refId = row.referenceId || `REF-${new Date().getFullYear()}-${row.id.toString().padStart(3, '0')}`;
               return (
                  <tr 
                    key={row.id} 
                    className="group hover:bg-slate-50/50 transition-colors duration-200 cursor-pointer"
                    onClick={() => onView(row)}
                  >
                    <td className="px-6 py-4 text-center">
                      <span className="text-xs font-semibold text-gray-300">{(index + 1).toString().padStart(2, '0')}</span>
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100 flex w-fit items-center gap-2">
                          <Hash className="h-3 w-3 opacity-40" />
                          {refId}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-4">
                          <PremiumLogo 
                              src={row.companyImageUrl} 
                              alt={row.company} 
                              fallback={<span className="text-xs font-bold text-gray-400">{row.company.charAt(0)}</span>}
                              containerClassName="h-10 w-10 rounded-xl bg-white border border-gray-200 flex-shrink-0 flex items-center justify-center overflow-hidden shadow-sm"
                          />
                          <div className="flex flex-col min-w-0">
                              <span className="font-bold text-gray-900 text-sm group-hover:text-brand-600 transition-colors text-left truncate">{row.company}</span>
                              <div className="flex items-center gap-1.5 mt-1">
                                  {row.driveLink && <a href={row.driveLink} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-gray-300 hover:text-blue-600 transition-colors"><HardDrive className="h-3.5 w-3.5" /></a>}
                                  {row.socials?.website && <a href={row.socials.website} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-gray-300 hover:text-brand-600 transition-colors"><Globe className="h-3.5 w-3.5" /></a>}
                              </div>
                          </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 shrink-0"><User className="h-3 w-3" /></div>
                          <span className="text-xs font-semibold text-gray-700 truncate">{row.contactName || 'N/A'}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex flex-wrap gap-1.5 max-w-[280px]">
                          {row.work.map((w: any) => {
                               const label = typeof w === 'object' ? w.name : w;
                               return <span key={label} className={`px-2 py-1 text-[10px] font-bold rounded-md border uppercase tracking-tight ${getWorkTypeStyles(label)}`}>{label}</span>;
                          })}
                       </div>
                    </td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <CompanyStatusDropdown company={row} onStatusChange={onStatusChange} />
                    </td>
                  </tr>
               );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
