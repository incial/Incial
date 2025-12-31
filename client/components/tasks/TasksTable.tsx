
import React, { useState, useRef, useEffect } from 'react';
import { Task, TaskPriority, TaskStatus } from '../../types';
import { formatDate, getTaskPriorityStyles, getTaskStatusStyles, isRecentlyUpdated } from '../../utils';
import { Edit2, Trash2, ChevronDown, Calendar, Check, Building, Layout } from 'lucide-react';

interface TasksTableProps {
  data: Task[];
  companyMap?: Record<number, string>;
  userAvatarMap?: Record<string, string>;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onStatusChange: (task: Task, newStatus: TaskStatus) => void;
  onPriorityChange: (task: Task, newPriority: TaskPriority) => void;
}

const Avatar = ({ name, url }: { name: string | null | undefined; url?: string }) => {
    const safeName = name || 'Unassigned';
    const initials = safeName === 'Unassigned' ? '?' : safeName.slice(0, 2).toUpperCase();
    
    if (url) {
        return (
            <img 
                src={url} 
                alt={safeName} 
                title={safeName}
                className="h-6 w-6 rounded-lg object-cover border border-white shadow-sm ring-1 ring-gray-100 flex-shrink-0" 
            />
        );
    }

    const bg = safeName === 'Unassigned' ? 'bg-gray-100 text-gray-400' : 'bg-brand-50 text-brand-700';
    return (
        <div className={`h-6 w-6 rounded-lg flex items-center justify-center text-[10px] font-bold ${bg} border border-white shadow-sm ring-1 ring-gray-100 flex-shrink-0`} title={safeName}>
            {initials}
        </div>
    );
};

// --- Custom Status Dropdown ---
const StatusDropdown = ({ task, onStatusChange }: { task: Task; onStatusChange: (t: Task, s: TaskStatus) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const options: TaskStatus[] = ['Not Started', 'In Progress', 'In Review', 'Posted', 'Completed'];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative inline-block w-full" ref={ref}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border shadow-sm transition-all hover:opacity-90 hover:shadow-md active:scale-95 w-full justify-between whitespace-nowrap ${getTaskStatusStyles(task.status)}`}
            >
                <span className="truncate">{task.status}</span>
                <ChevronDown className={`h-3 w-3 opacity-50 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isOpen && (
                <div className="absolute top-full left-0 z-50 mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="p-1">
                        {options.map(opt => (
                            <button
                                key={opt}
                                onClick={() => { onStatusChange(task, opt); setIsOpen(false); }}
                                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-lg text-left transition-colors ${
                                    task.status === opt ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                            >
                                <div className="flex items-center gap-2 truncate">
                                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                        opt === 'Completed' ? 'bg-green-500' : 
                                        opt === 'Posted' ? 'bg-sky-500' :
                                        opt === 'In Review' ? 'bg-purple-500' :
                                        opt === 'In Progress' ? 'bg-blue-500' : 'bg-gray-400'
                                    }`} />
                                    <span className="truncate">{opt}</span>
                                </div>
                                {task.status === opt && <Check className="h-3 w-3 text-brand-600 ml-auto flex-shrink-0" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Custom Priority Dropdown ---
const PriorityDropdown = ({ task, onPriorityChange }: { task: Task; onPriorityChange: (t: Task, p: TaskPriority) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const options: TaskPriority[] = ['Low', 'Medium', 'High'];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative inline-block w-full" ref={ref}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border shadow-sm transition-all hover:opacity-90 hover:shadow-md active:scale-95 uppercase tracking-wide w-full justify-between ${getTaskPriorityStyles(task.priority)}`}
            >
                <span className="truncate">{task.priority}</span>
                <ChevronDown className={`h-3 w-3 opacity-50 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isOpen && (
                <div className="absolute top-full left-0 z-50 mt-2 w-36 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="p-1">
                        {options.map(opt => (
                            <button
                                key={opt}
                                onClick={() => { onPriorityChange(task, opt); setIsOpen(false); }}
                                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-lg text-left transition-colors uppercase tracking-wide ${
                                    task.priority === opt ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                            >
                                {opt}
                                {task.priority === opt && <Check className="h-3 w-3 text-brand-600 ml-auto flex-shrink-0" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};


export const TasksTable: React.FC<TasksTableProps> = ({ data, companyMap, userAvatarMap, onEdit, onDelete, onStatusChange, onPriorityChange }) => {
  return (
    <div className="w-full min-h-[400px] pb-32">
        <table className="w-full text-left border-separate border-spacing-y-3 table-fixed">
            <thead>
                <tr className="text-gray-400">
                    <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest w-[30%]">Task Name</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest w-[16%]">Client</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest w-[16%]">Status</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest w-[14%]">Assignee</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest w-[12%]">Due Date</th>
                    <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest w-[12%] text-right">Priority</th>
                </tr>
            </thead>
            <tbody>
                {data.map(task => {
                    const clientName = (task.companyId && companyMap) ? companyMap[task.companyId] : null;
                    const isCompleted = (task.status === 'Completed' || task.status === 'Done');
                    const shouldAnimate = isCompleted && isRecentlyUpdated(task.lastUpdatedAt, 10);
                    const userAvatarUrl = task.assignedTo && userAvatarMap ? userAvatarMap[task.assignedTo] : undefined;

                    return (
                    <tr 
                        key={task.id} 
                        className={`group transition-all duration-200 ${shouldAnimate ? 'animate-task-complete' : ''}`}
                    >
                        {/* Name */}
                        <td className="px-6 py-5 align-top bg-white first:rounded-l-[1.5rem] border-y border-l border-gray-100 shadow-sm group-hover:shadow-md transition-all">
                            <div className="flex flex-col pr-4">
                                <button onClick={() => onEdit(task)} className="text-sm font-bold text-gray-900 hover:text-brand-600 transition-colors text-left truncate block leading-snug w-full">
                                    {task.title}
                                </button>
                                {task.description && (
                                    <p className="text-[10px] text-gray-400 truncate mt-0.5 font-medium w-full">{task.description}</p>
                                )}
                            </div>
                        </td>

                        {/* Client */}
                        <td className="px-4 py-5 align-middle bg-white border-y border-gray-100 shadow-sm group-hover:shadow-md transition-all">
                            {clientName ? (
                                <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100 w-full max-w-[140px]">
                                    <Building className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                    <span className="truncate">{clientName}</span>
                                </div>
                            ) : (
                                <span className="text-[10px] text-gray-400 font-bold bg-gray-50 px-2 py-1 rounded border border-gray-100">INTERNAL</span>
                            )}
                        </td>

                        {/* Status (Custom Dropdown) */}
                        <td className="px-4 py-5 align-middle bg-white border-y border-gray-100 shadow-sm group-hover:shadow-md transition-all">
                            <StatusDropdown task={task} onStatusChange={onStatusChange} />
                        </td>

                        {/* Assignee */}
                        <td className="px-4 py-5 align-middle bg-white border-y border-gray-100 shadow-sm group-hover:shadow-md transition-all">
                             <div className="flex items-center gap-2 overflow-hidden">
                                <Avatar name={task.assignedTo} url={userAvatarUrl} />
                                <span className="text-xs font-semibold text-gray-600 truncate">{task.assignedTo || 'Unassigned'}</span>
                             </div>
                        </td>

                        {/* Due Date */}
                        <td className="px-4 py-5 align-middle bg-white border-y border-gray-100 shadow-sm group-hover:shadow-md transition-all">
                            <div className="flex items-center gap-2 text-gray-500">
                                <Calendar className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                                <span className="text-xs font-bold font-mono truncate">{formatDate(task.dueDate)}</span>
                            </div>
                        </td>

                        {/* Priority (Custom Dropdown) */}
                        <td className="px-6 py-5 align-middle bg-white last:rounded-r-[1.5rem] border-y border-r border-gray-100 shadow-sm group-hover:shadow-md transition-all text-right">
                             <div className="flex justify-end">
                                <PriorityDropdown task={task} onPriorityChange={onPriorityChange} />
                             </div>
                        </td>
                    </tr>
                )})}
                {data.length === 0 && (
                     <tr>
                        <td colSpan={6} className="px-4 py-20 text-center text-gray-400 text-sm">
                            <div className="flex flex-col items-center justify-center gap-3">
                                <div className="h-12 w-12 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center">
                                    <Check className="h-6 w-6 text-gray-300" />
                                </div>
                                <p className="font-medium text-gray-500">No tasks found. Create one to get started!</p>
                            </div>
                        </td>
                     </tr>
                )}
            </tbody>
        </table>
    </div>
  );
};
