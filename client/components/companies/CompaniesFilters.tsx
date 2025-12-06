
import React from 'react';
import { Search, X } from 'lucide-react';
import { CompanyFilterState } from '../../types';
import { CustomSelect } from '../ui/CustomSelect';

interface CompaniesFiltersProps {
  filters: CompanyFilterState;
  setFilters: React.Dispatch<React.SetStateAction<CompanyFilterState>>;
  onRefresh: () => void;
}

export const CompaniesFilters: React.FC<CompaniesFiltersProps> = ({ filters, setFilters, onRefresh }) => {
  const handleChange = (key: keyof CompanyFilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
      setFilters({
          status: '',
          workType: '',
          search: ''
      });
  };

  const hasFilters = Object.values(filters).some(Boolean);

  const statusOptions = [
    { label: "All Statuses", value: "" },
    { label: "Running", value: "running" },
    { label: "Not Started", value: "not_started" },
    { label: "Completed", value: "completed" },
    { label: "Discontinued", value: "discontinued" },
  ];

  const workOptions = [
    { label: "All Work Types", value: "" },
    { label: "Marketing", value: "Marketing" },
    { label: "Website", value: "Website" },
    { label: "Poster", value: "Poster" },
    { label: "Video", value: "Video" },
    { label: "VFX", value: "VFX" },
    { label: "LinkedIn", value: "LinkedIn" },
    { label: "Ads", value: "Ads" },
    { label: "Branding", value: "Branding" },
    { label: "UI/UX", value: "UI/UX" },
  ];

  return (
    <div className="bg-white p-5 border-b border-gray-100 flex flex-col xl:flex-row gap-5 items-start xl:items-center justify-between rounded-t-2xl z-20 relative">
      
      {/* Left: Inputs */}
      <div className="flex flex-wrap items-end gap-3 w-full">
        <div className="w-full sm:w-72">
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Search</label>
          <div className="relative group">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
            <input
              type="text"
              placeholder="Search by client name..."
              value={filters.search}
              onChange={(e) => handleChange('search', e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-gray-50 border-gray-200 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 w-full transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="w-48">
           <CustomSelect 
                label="Status"
                value={filters.status}
                onChange={(val) => handleChange('status', val)}
                options={statusOptions}
                placeholder="All Statuses"
           />
        </div>

        <div className="w-48">
            <CustomSelect 
                label="Work Type"
                value={filters.workType}
                onChange={(val) => handleChange('workType', val)}
                options={workOptions}
                placeholder="All Types"
            />
        </div>
        
        {hasFilters && (
            <button 
                onClick={clearFilters}
                className="mb-1 text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors self-end"
            >
                <X className="h-3.5 w-3.5" /> 
                Clear
            </button>
        )}
      </div>
    </div>
  );
};
