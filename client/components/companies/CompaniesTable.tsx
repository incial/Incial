
import React, { useState, useRef, useEffect } from 'react';
import { CRMEntry, CRMStatus } from '../../types';
import { getCompanyStatusStyles, getWorkTypeStyles } from '../../utils';
import { Trash2, MoreHorizontal, Hash, User, Eye, HardDrive, Globe, Linkedin, Instagram, Facebook, Twitter, Link as LinkIcon, Edit2, ChevronDown, Check, Building } from 'lucide-react';

interface CompaniesTableProps {
  data: CRMEntry[];
  isLoading: boolean;
  onEdit: (company: CRMEntry) => void;
  onView: (company: CRMEntry) => void;
  onDelete: (id: number) => void;
  onStatusChange: (company: CRMEntry, newStatus: CRMStatus) => void;
}

const CompanyStatusDropdown = ({ company, onStatusChange }: { company: CRMEntry; onStatusChange: (c: CRMEntry, s: CRMStatus) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    
    // Statuses relevant to companies view
    const options: CRMStatus[] = [
        'onboarded', 
        'on progress', 
        'Quote Sent', 
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
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border shadow-sm transition-all hover:opacity-90 active:scale-95 capitalize whitespace-nowrap ${getCompanyStatusStyles(company.status)}`}
            >
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></span>
                {formatStatus(company.status)}
                <ChevronDown className={`h-3 w-3 opacity-50 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isOpen && (
                <div className="absolute top-full left-0 z-50 mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="p-1">
                        {options.map(opt => (
                            <button
                                key={opt}
                                onClick={(e) => { e.stopPropagation(); onStatusChange(company, opt); setIsOpen(false); }}
                                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-lg text-left transition-colors capitalize ${
                                    company.status === opt 
                                    ? 'bg-brand-50 text-brand-700' 
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                            >
                                {formatStatus(opt)}
                                {company.status === opt && <Check className="h-3 w-3 text-brand-600 ml-auto" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export const CompaniesTable: React.FC<CompaniesTableProps> = ({ data, isLoading, onEdit, onView, onDelete, onStatusChange }) => {
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
      <div className="p-20 text-center bg-white">
        <div className="h-16 w-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
            <Building className="h-8 w-8 text-gray-300" />
        </div>
        <h3 className="text-gray-900 font-bold text-lg">No companies found</h3>
        <p className="text-gray-500 mt-1 text-sm">This section displays active onboarded deals from CRM.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto custom-scrollbar bg-white min-h-[500px] pb-32">
      <table className="w-full text-left border-collapse whitespace-nowrap">
        <thead>
          <tr className="bg-white border-b border-gray-100">
            <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-16 text-center">No.</th>
            <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reference ID</th>
            <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Company Name</th>
            <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Contact Person</th>
            <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Work Info</th>
            <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
            <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.map((row, index) => {
             // Generate a fallback Reference ID if missing
             const refId = row.referenceId || `REF-${new Date().getFullYear()}-${row.id.toString().padStart(3, '0')}`;
             
             return (
            <tr key={row.id} className="group hover:bg-slate-50/50 transition-colors duration-200">
              
              {/* SL No */}
              <td className="px-6 py-4 text-center">
                <span className="text-xs font-semibold text-gray-300">{(index + 1).toString().padStart(2, '0')}</span>
              </td>

              {/* Reference ID */}
              <td className="px-6 py-4">
                 <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100 flex w-fit items-center gap-2">
                    <Hash className="h-3 w-3 opacity-40" />
                    {refId}
                 </span>
              </td>

              {/* Company Name & Links */}
              <td className="px-6 py-4">
                <div className="flex items-start gap-4">
                    {/* Logo Thumbnail */}
                    <div className="h-10 w-10 rounded-xl bg-white border border-gray-200 flex-shrink-0 flex items-center justify-center overflow-hidden shadow-sm">
                        {row.companyImageUrl ? (
                            <>
                                <img 
                                    src={row.companyImageUrl} 
                                    alt={row.company} 
                                    className="h-full w-full object-cover" 
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                    }}
                                />
                                <div className="hidden h-full w-full flex items-center justify-center text-xs font-bold text-gray-400">
                                    {row.company.charAt(0)}
                                </div>
                            </>
                        ) : (
                            <span className="text-xs font-bold text-gray-400">{row.company.charAt(0)}</span>
                        )}
                    </div>

                    <div className="flex flex-col">
                        <button 
                            onClick={() => onView(row)}
                            className="font-bold text-gray-900 text-sm hover:text-brand-600 transition-colors text-left"
                        >
                            {row.company}
                        </button>
                        {/* Quick Links Row */}
                        <div className="flex items-center gap-1.5 mt-1">
                            {row.driveLink && (
                                <a href={row.driveLink} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-blue-600 transition-colors" title="Google Drive">
                                    <HardDrive className="h-3.5 w-3.5" />
                                </a>
                            )}
                            {row.socials?.website && (
                                <a href={row.socials.website} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-brand-600 transition-colors" title="Website">
                                    <Globe className="h-3.5 w-3.5" />
                                </a>
                            )}
                            {row.socials?.linkedin && (
                                <a href={row.socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-blue-700 transition-colors" title="LinkedIn">
                                    <Linkedin className="h-3.5 w-3.5" />
                                </a>
                            )}
                            {row.socials?.instagram && (
                                <a href={row.socials.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-pink-600 transition-colors" title="Instagram">
                                    <Instagram className="h-3.5 w-3.5" />
                                </a>
                            )}
                            {row.socials?.facebook && (
                                <a href={row.socials.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-blue-600 transition-colors" title="Facebook">
                                    <Facebook className="h-3.5 w-3.5" />
                                </a>
                            )}
                            {row.socials?.twitter && (
                                <a href={row.socials.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-sky-500 transition-colors" title="Twitter">
                                    <Twitter className="h-3.5 w-3.5" />
                                </a>
                            )}
                            {row.socials?.other && (
                                <a href={row.socials.other} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-gray-800 transition-colors" title="Other">
                                    <LinkIcon className="h-3.5 w-3.5" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>
              </td>

              {/* Contact Person */}
              <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400">
                        <User className="h-3 w-3" />
                    </div>
                    <span className="text-xs font-semibold text-gray-700">{row.contactName || 'N/A'}</span>
                  </div>
              </td>

              {/* Work Info (Chips) */}
              <td className="px-6 py-4">
                 <div className="flex flex-wrap gap-1.5 max-w-[280px]">
                    {row.work.map((w: any) => {
                         const label = typeof w === 'object' ? w.name : w;
                         return (
                            <span key={label} className={`px-2 py-1 text-[10px] font-bold rounded-md border uppercase tracking-tight ${getWorkTypeStyles(label)}`}>
                                {label}
                            </span>
                         );
                    })}
                    {row.work.length === 0 && <span className="text-gray-300 text-xs">-</span>}
                 </div>
              </td>

              {/* Status Badge (Dropdown) */}
              <td className="px-6 py-4">
                <CompanyStatusDropdown company={row} onStatusChange={onStatusChange} />
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
                        onClick={() => onEdit(row)} 
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Details"
                    >
                        <Edit2 className="h-4 w-4" />
                    </button>
                    <button 
                        onClick={() => onDelete(row.id)} 
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove from List"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
              </td>
            </tr>
          );
          })}
        </tbody>
      </table>
    </div>
  );
};
