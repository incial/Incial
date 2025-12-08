
import React from 'react';
import { Search, X } from 'lucide-react';
import { TaskFilterState } from '../../types';
import { CustomSelect } from '../ui/CustomSelect';

interface TasksFilterProps {
  filters: TaskFilterState;
  setFilters: React.Dispatch<React.SetStateAction<TaskFilterState>>;
}

export const TasksFilter: React.FC<TasksFilterProps> = ({ filters, setFilters }) => {
  const handleChange = (key: keyof TaskFilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ search: '', status: '', priority: '', assignedTo: '' });
  };

  const hasFilters = Object.values(filters).some(Boolean);

  const statusOptions = [
    { label: "All Status", value: "" },
    { label: "Not Started", value: "Not Started" },
    { label: "In Progress", value: "In Progress" },
    { label: "In Review", value: "In Review" },
    { label: "Posted", value: "Posted" },
    { label: "Completed", value: "Completed" },
  ];

  const priorityOptions = [
    { label: "All Priorities", value: "" },
    { label: "High", value: "High" },
    { label: "Medium", value: "Medium" },
    { label: "Low", value: "Low" },
  ];

  const assigneeOptions = [
    { label: "All Assignees", value: "" },
    { label: "Vallapata", value: "Vallapata" },
    { label: "John Doe", value: "John Doe" },
    { label: "Demo User", value: "Demo User" },
    { label: "Admin User", value: "Admin User" },
    { label: "Employee User", value: "Employee User" },
  ];

  return (
    <div className="p-4 border-b border-gray-100 flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between bg-white z-20">
      
      {/* Search */}
      <div className="w-full xl:w-72">
        <div className="relative group">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
            <input 
                type="text" 
                placeholder="Search tasks..." 
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-sm"
                value={filters.search}
                onChange={e => handleChange('search', e.target.value)}
            />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
         <div className="w-40">
            <CustomSelect 
                value={filters.status}
                onChange={(val) => handleChange('status', val)}
                options={statusOptions}
                placeholder="All Status"
            />
         </div>

         <div className="w-40">
            <CustomSelect 
                value={filters.priority}
                onChange={(val) => handleChange('priority', val)}
                options={priorityOptions}
                placeholder="All Priorities"
            />
         </div>

         <div className="w-40">
            <CustomSelect 
                value={filters.assignedTo}
                onChange={(val) => handleChange('assignedTo', val)}
                options={assigneeOptions}
                placeholder="All Assignees"
            />
         </div>

         {hasFilters && (
             <button 
                onClick={clearFilters} 
                className="px-3 py-2.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl flex items-center gap-1.5 transition-colors"
             >
                 <X className="h-4 w-4" /> Clear
             </button>
         )}
      </div>
    </div>
  );
};
